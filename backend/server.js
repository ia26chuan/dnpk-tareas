require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { readDb, writeDb, todayStr } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-tasks-key-998877';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

readDb();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sesion expirada o token invalido' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
}

function requireCoordinatorOrAdmin(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'coordinator')) return next();
  res.status(403).json({ error: 'Acceso denegado' });
}

// ── AUTH ──────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Email y contrasena requeridos' });
  const db = readDb();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, groupId: user.groupId, coordinatorGroupId: user.coordinatorGroupId || null } });
});

// ── USER: Change password ─────────────────────────────
app.put('/api/user/password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Campos requeridos' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'La nueva contrasena debe tener al menos 6 caracteres' });
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || !bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return res.status(401).json({ error: 'Contrasena actual incorrecta' });
  }
  user.passwordHash = bcrypt.hashSync(newPassword, 8);
  user.plainPassword = newPassword;
  writeDb(db);
  res.json({ success: true, message: 'Contrasena actualizada' });
});

// ── USER: Get my tasks for today ──────────────────────
app.get('/api/tasks', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || !user.groupId) return res.json([]);
  const today = todayStr();
  const groupTasks = db.tasks.filter(t => t.groupId === user.groupId).sort((a, b) => a.order - b.order);
  const result = groupTasks.map(task => {
    const hist = db.taskHistory.find(h => h.taskId === task.id && h.userId === user.id && h.date === today);
    return {
      id: task.id,
      text: task.text,
      type: task.type,
      completed: hist ? hist.completed : false,
      completedAt: hist ? hist.completedAt : null
    };
  });
  res.json(result);
});

// ── USER: Toggle task ─────────────────────────────────
app.post('/api/tasks/:id/toggle', authenticateToken, (req, res) => {
  const { completed } = req.body;
  const db = readDb();
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  const today = todayStr();
  let hist = db.taskHistory.find(h => h.taskId === task.id && h.userId === req.user.id && h.date === today);
  if (hist) {
    hist.completed = typeof completed === 'boolean' ? completed : !hist.completed;
    hist.completedAt = hist.completed ? new Date().toISOString() : null;
  } else {
    const newCompleted = typeof completed === 'boolean' ? completed : true;
    hist = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      taskId: task.id,
      userId: req.user.id,
      date: today,
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : null
    };
    db.taskHistory.push(hist);
  }
  writeDb(db);
  res.json({ success: true, completed: hist.completed, completedAt: hist.completedAt });
});

// ── USER: Get my history ──────────────────────────────
app.get('/api/history', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || !user.groupId) return res.json([]);
  const groupTasks = db.tasks.filter(t => t.groupId === user.groupId);
  const userHistory = db.taskHistory.filter(h => h.userId === req.user.id);
  const dates = [...new Set(userHistory.map(h => h.date))].sort().reverse();
  const result = dates.map(date => {
    const dayTasks = groupTasks.map(task => {
      const h = userHistory.find(x => x.taskId === task.id && x.date === date);
      return { taskText: task.text, taskType: task.type, completed: h ? h.completed : false, completedAt: h ? h.completedAt : null };
    });
    const total = dayTasks.length;
    const completed = dayTasks.filter(t => t.completed).length;
    return { date, tasks: dayTasks, total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });
  res.json(result);
});

// ── ADMIN: Users with stats ───────────────────────────
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const db = readDb();
  const today = todayStr();
  const result = db.users.filter(u => u.id !== req.user.id).map(u => {
    const group = db.groups.find(g => g.id === u.groupId);
    const groupTasks = db.tasks.filter(t => t.groupId === u.groupId).sort((a, b) => a.order - b.order);
    const todayHistory = db.taskHistory.filter(h => h.userId === u.id && h.date === today);
    const entrada = groupTasks.filter(t => t.type === 'entrada');
    const salida = groupTasks.filter(t => t.type === 'salida');
    const tasks = groupTasks.map(task => {
      const h = todayHistory.find(x => x.taskId === task.id);
      return { text: task.text, type: task.type, completed: h ? h.completed : false, completedAt: h ? h.completedAt : null };
    });
    return {
      id: u.id, username: u.username, role: u.role, groupId: u.groupId, groupName: group ? group.name : 'Sin grupo',
      plainPassword: u.plainPassword,
      stats: {
        totalEntrada: entrada.length,
        completedEntrada: entrada.filter(t => todayHistory.find(h => h.taskId === t.id && h.completed)).length,
        totalSalida: salida.length,
        completedSalida: salida.filter(t => todayHistory.find(h => h.taskId === t.id && h.completed)).length
      },
      tasks
    };
  });
  res.json(result);
});

// ── ADMIN: Create user ────────────────────────────────
app.post('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const { username, password, groupId, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contrasena obligatorios' });
  const db = readDb();
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'El nombre de usuario ya existe' });
  }
  if (role === 'admin') {
    const adminCount = db.users.filter(u => u.role === 'admin').length;
    if (adminCount >= 1) return res.status(400).json({ error: 'Solo puede haber 1 administrador' });
  }
  const userRole = ['admin', 'coordinator'].includes(role) ? role : 'user';
  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    username, passwordHash: bcrypt.hashSync(password, 8), plainPassword: password,
    role: userRole, groupId: userRole === 'user' ? (groupId || null) : null
  };
  db.users.push(newUser);
  writeDb(db);
  res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role, groupId: newUser.groupId });
});

// ── ADMIN: Delete user ────────────────────────────────
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  if (req.params.id === 'admin-id') return res.status(400).json({ error: 'No se puede eliminar el administrador' });
  const db = readDb();
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
  db.users.splice(idx, 1);
  db.taskHistory = db.taskHistory.filter(h => h.userId !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// ── ADMIN: Change user password ────────────────────────
app.put('/api/admin/users/:id/password', authenticateToken, requireAdmin, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'Nueva contraseña requerida' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Minimo 6 caracteres' });
  const db = readDb();
  const target = db.users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (target.role === 'admin') return res.status(403).json({ error: 'No se puede cambiar la contraseña del administrador' });
  target.passwordHash = bcrypt.hashSync(newPassword, 8);
  target.plainPassword = newPassword;
  writeDb(db);
  res.json({ success: true, message: 'Contraseña actualizada' });
});

// ── ADMIN: Change user role ───────────────────────────
app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin', 'coordinator'].includes(role)) return res.status(400).json({ error: 'Rol invalido' });
  const db = readDb();
  const target = db.users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (role === 'admin' && target.role !== 'admin') {
    const adminCount = db.users.filter(u => u.role === 'admin').length;
    if (adminCount >= 1) return res.status(400).json({ error: 'Solo puede haber 1 administrador' });
  }
  target.role = role;
  if (role === 'admin') { target.groupId = null; target.coordinatorGroupId = null; }
  if (role === 'coordinator') { target.groupId = null; }
  if (role === 'user') { target.coordinatorGroupId = null; }
  writeDb(db);
  res.json({ success: true, role: target.role });
});

// ── ADMIN: Assign user to group ───────────────────────
app.put('/api/admin/users/:id/group', authenticateToken, requireAdmin, (req, res) => {
  const { groupId } = req.body;
  const db = readDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (groupId && !db.groups.find(g => g.id === groupId)) {
    return res.status(404).json({ error: 'Grupo no encontrado' });
  }
  user.groupId = groupId || null;
  writeDb(db);
  res.json({ success: true });
});

// ── ADMIN: Reset user tasks ───────────────────────────
app.post('/api/admin/users/:id/reset', authenticateToken, requireAdmin, (req, res) => {
  const db = readDb();
  const today = todayStr();
  const before = db.taskHistory.length;
  db.taskHistory = db.taskHistory.filter(h => !(h.userId === req.params.id && h.date === today));
  writeDb(db);
  res.json({ success: true, message: `Tareas del dia reiniciadas` });
});

// ── ADMIN: Groups CRUD ────────────────────────────────
app.get('/api/admin/groups', authenticateToken, requireAdmin, (req, res) => {
  const db = readDb();
  const result = db.groups.map(g => {
    const members = db.users.filter(u => u.groupId === g.id && u.role !== 'admin');
    const taskCount = db.tasks.filter(t => t.groupId === g.id).length;
    return { ...g, memberCount: members.length, members: members.map(m => m.username), taskCount };
  });
  res.json(result);
});

app.post('/api/admin/groups', authenticateToken, requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const db = readDb();
  if (db.groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ error: 'Ya existe un grupo con ese nombre' });
  }
  const group = { id: 'grupo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), name };
  db.groups.push(group);
  writeDb(db);
  res.status(201).json(group);
});

app.put('/api/admin/groups/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const db = readDb();
  const group = db.groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
  if (db.groups.some(g => g.id !== req.params.id && g.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ error: 'Ya existe un grupo con ese nombre' });
  }
  group.name = name;
  writeDb(db);
  res.json(group);
});

app.delete('/api/admin/groups/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readDb();
  db.users.forEach(u => { if (u.groupId === req.params.id) u.groupId = null; });
  db.tasks = db.tasks.filter(t => t.groupId !== req.params.id);
  db.groups = db.groups.filter(g => g.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// ── ADMIN: Tasks per group ────────────────────────────
app.get('/api/admin/groups/:groupId/tasks', authenticateToken, requireAdmin, (req, res) => {
  const db = readDb();
  const tasks = db.tasks.filter(t => t.groupId === req.params.groupId).sort((a, b) => a.order - b.order);
  res.json(tasks);
});

app.post('/api/admin/groups/:groupId/tasks', authenticateToken, requireAdmin, (req, res) => {
  const { text, type } = req.body;
  if (!text || !type) return res.status(400).json({ error: 'Texto y tipo requeridos' });
  const db = readDb();
  const existing = db.tasks.filter(t => t.groupId === req.params.groupId);
  const task = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    groupId: req.params.groupId, text, type,
    order: existing.length + 1
  };
  db.tasks.push(task);
  writeDb(db);
  res.status(201).json(task);
});

app.put('/api/admin/tasks/:id', authenticateToken, requireAdmin, (req, res) => {
  const { text, type, order } = req.body;
  const db = readDb();
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  if (text) task.text = text;
  if (type === 'entrada' || type === 'salida') task.type = type;
  if (typeof order === 'number') task.order = order;
  writeDb(db);
  res.json(task);
});

app.delete('/api/admin/tasks/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readDb();
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  db.taskHistory = db.taskHistory.filter(h => h.taskId !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// ── ADMIN: History by date ────────────────────────────
app.get('/api/admin/history', authenticateToken, requireAdmin, (req, res) => {
  const { date } = req.query;
  const d = date || todayStr();
  const db = readDb();
  const users = db.users.filter(u => u.role !== 'admin');
  const result = users.map(u => {
    const group = db.groups.find(g => g.id === u.groupId);
    const groupTasks = db.tasks.filter(t => t.groupId === u.groupId).sort((a, b) => a.order - b.order);
    const dayHistory = db.taskHistory.filter(h => h.userId === u.id && h.date === d);
    const tasks = groupTasks.map(task => {
      const h = dayHistory.find(x => x.taskId === task.id);
      return { taskText: task.text, taskType: task.type, completed: h ? h.completed : false, completedAt: h ? h.completedAt : null };
    });
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    return { userId: u.id, username: u.username, groupName: group ? group.name : 'Sin grupo', tasks, total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });
  res.json(result);
});

// ── ADMIN: All history dates ──────────────────────────
app.get('/api/admin/history/all', authenticateToken, requireAdmin, (req, res) => {
  const db = readDb();
  const users = db.users.filter(u => u.role !== 'admin');
  const allDates = [...new Set(db.taskHistory.map(h => h.date))].sort().reverse();
  const result = allDates.map(date => {
    const dayData = users.map(u => {
      const group = db.groups.find(g => g.id === u.groupId);
      const groupTasks = db.tasks.filter(t => t.groupId === u.groupId).sort((a, b) => a.order - b.order);
      const dayHistory = db.taskHistory.filter(h => h.userId === u.id && h.date === date);
      const tasks = groupTasks.map(task => {
        const h = dayHistory.find(x => x.taskId === task.id);
        return { taskText: task.text, taskType: task.type, completed: h ? h.completed : false, completedAt: h ? h.completedAt : null };
      });
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      return { userId: u.id, username: u.username, groupName: group ? group.name : 'Sin grupo', tasks, total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    });
    const totalTasks = dayData.reduce((s, u) => s + u.total, 0);
    const totalCompleted = dayData.reduce((s, u) => s + u.completed, 0);
    const usersWithTasks = dayData.filter(u => u.total > 0).length;
    const usersComplete = dayData.filter(u => u.total > 0 && u.percent === 100).length;
    return { date, users: dayData, totalTasks, totalCompleted, usersWithTasks, usersComplete };
  });
  res.json(result);
});

// ── COORDINATOR: Monitor (all users, same as admin) ──
app.get('/api/coordinator/monitor', authenticateToken, (req, res) => {
  const db = readDb();
  const coordinator = db.users.find(u => u.id === req.user.id);
  if (!coordinator) return res.status(403).json({ error: 'No autorizado' });
  const today = todayStr();
  const result = db.users.filter(u => u.role === 'user').map(u => {
    const group = db.groups.find(g => g.id === u.groupId);
    const groupTasks = db.tasks.filter(t => t.groupId === u.groupId).sort((a, b) => a.order - b.order);
    const todayHistory = db.taskHistory.filter(h => h.userId === u.id && h.date === today);
    const entrada = groupTasks.filter(t => t.type === 'entrada');
    const salida = groupTasks.filter(t => t.type === 'salida');
    const tasks = groupTasks.map(task => {
      const h = todayHistory.find(x => x.taskId === task.id);
      return { text: task.text, type: task.type, completed: h ? h.completed : false, completedAt: h ? h.completedAt : null };
    });
    return {
      id: u.id, username: u.username, role: u.role, groupId: u.groupId, groupName: group ? group.name : 'Sin grupo',
      plainPassword: u.plainPassword,
      stats: {
        totalEntrada: entrada.length,
        completedEntrada: entrada.filter(t => todayHistory.find(h => h.taskId === t.id && h.completed)).length,
        totalSalida: salida.length,
        completedSalida: salida.filter(t => todayHistory.find(h => h.taskId === t.id && h.completed)).length
      },
      tasks
    };
  });
  res.json(result);
});

// ── COORDINATOR: History by date (same as admin) ──────
app.get('/api/coordinator/history/date', authenticateToken, (req, res) => {
  const { date } = req.query;
  const d = date || todayStr();
  const db = readDb();
  const coordinator = db.users.find(u => u.id === req.user.id);
  if (!coordinator) return res.status(403).json({ error: 'No autorizado' });
  const users = db.users.filter(u => u.role === 'user');
  const result = users.map(u => {
    const group = db.groups.find(g => g.id === u.groupId);
    const groupTasks = db.tasks.filter(t => t.groupId === u.groupId).sort((a, b) => a.order - b.order);
    const dayHistory = db.taskHistory.filter(h => h.userId === u.id && h.date === d);
    const tasks = groupTasks.map(task => {
      const h = dayHistory.find(x => x.taskId === task.id);
      return { taskText: task.text, taskType: task.type, completed: h ? h.completed : false, completedAt: h ? h.completedAt : null };
    });
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    return { userId: u.id, username: u.username, groupName: group ? group.name : 'Sin grupo', tasks, total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });
  res.json(result);
});

// ── COORDINATOR: My tasks ─────────────────────────────
app.get('/api/coordinator/tasks', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || !user.groupId) return res.json([]);
  const today = todayStr();
  const groupTasks = db.tasks.filter(t => t.groupId === user.groupId).sort((a, b) => a.order - b.order);
  const result = groupTasks.map(task => {
    const hist = db.taskHistory.find(h => h.taskId === task.id && h.userId === user.id && h.date === today);
    return {
      id: task.id,
      text: task.text,
      type: task.type,
      completed: hist ? hist.completed : false,
      completedAt: hist ? hist.completedAt : null
    };
  });
  res.json(result);
});

// ── COORDINATOR: Toggle task ──────────────────────────
app.post('/api/coordinator/tasks/:id/toggle', authenticateToken, (req, res) => {
  const { completed } = req.body;
  const db = readDb();
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  const today = todayStr();
  let hist = db.taskHistory.find(h => h.taskId === task.id && h.userId === req.user.id && h.date === today);
  if (hist) {
    hist.completed = typeof completed === 'boolean' ? completed : !hist.completed;
    hist.completedAt = hist.completed ? new Date().toISOString() : null;
  } else {
    const newCompleted = typeof completed === 'boolean' ? completed : true;
    hist = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      taskId: task.id,
      userId: req.user.id,
      date: today,
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : null
    };
    db.taskHistory.push(hist);
  }
  writeDb(db);
  res.json({ success: true, completed: hist.completed, completedAt: hist.completedAt });
});

// ── COORDINATOR: My history ───────────────────────────
app.get('/api/coordinator/history', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || !user.groupId) return res.json([]);
  const groupTasks = db.tasks.filter(t => t.groupId === user.groupId);
  const userHistory = db.taskHistory.filter(h => h.userId === req.user.id);
  const dates = [...new Set(userHistory.map(h => h.date))].sort().reverse();
  const result = dates.map(date => {
    const dayTasks = groupTasks.map(task => {
      const h = userHistory.find(x => x.taskId === task.id && x.date === date);
      return { taskText: task.text, taskType: task.type, completed: h ? h.completed : false, completedAt: h ? h.completedAt : null };
    });
    const total = dayTasks.length;
    const completed = dayTasks.filter(t => t.completed).length;
    return { date, tasks: dayTasks, total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });
  res.json(result);
});

// ── COORDINATOR: View ALL employee history ────────────
app.get('/api/coordinator/employees/history', authenticateToken, (req, res) => {
  const db = readDb();
  const coordinator = db.users.find(u => u.id === req.user.id);
  if (!coordinator) return res.json([]);
  const employees = db.users.filter(u => u.role === 'user');
  const allDates = [...new Set(db.taskHistory.filter(h => employees.some(e => e.id === h.userId)).map(h => h.date))].sort().reverse();
  const result = allDates.map(date => {
    const dayData = employees.map(u => {
      const groupTasks = db.tasks.filter(t => t.groupId === u.groupId).sort((a, b) => a.order - b.order);
      const dayHistory = db.taskHistory.filter(h => h.userId === u.id && h.date === date);
      const tasks = groupTasks.map(task => {
        const h = dayHistory.find(x => x.taskId === task.id);
        return { taskText: task.text, taskType: task.type, completed: h ? h.completed : false, completedAt: h ? h.completedAt : null };
      });
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      return { userId: u.id, username: u.username, groupName: db.groups.find(g => g.id === u.groupId)?.name || 'Sin grupo', tasks, total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    });
    const totalTasks = dayData.reduce((s, u) => s + u.total, 0);
    const totalCompleted = dayData.reduce((s, u) => s + u.completed, 0);
    return { date, users: dayData, totalTasks, totalCompleted };
  });
  res.json(result);
});

// ── COORDINATOR: List ALL employees ───────────────────
app.get('/api/coordinator/employees', authenticateToken, (req, res) => {
  const db = readDb();
  const coordinator = db.users.find(u => u.id === req.user.id);
  if (!coordinator) return res.json([]);
  const today = todayStr();
  const employees = db.users.filter(u => u.role === 'user').map(u => {
    const groupTasks = db.tasks.filter(t => t.groupId === u.groupId);
    const todayHistory = db.taskHistory.filter(h => h.userId === u.id && h.date === today);
    const entrada = groupTasks.filter(t => t.type === 'entrada');
    const salida = groupTasks.filter(t => t.type === 'salida');
    return {
      id: u.id, username: u.username, role: u.role,
      groupName: db.groups.find(g => g.id === u.groupId)?.name || 'Sin grupo',
      stats: {
        totalEntrada: entrada.length,
        completedEntrada: entrada.filter(t => todayHistory.find(h => h.taskId === t.id && h.completed)).length,
        totalSalida: salida.length,
        completedSalida: salida.filter(t => todayHistory.find(h => h.taskId === t.id && h.completed)).length
      }
    };
  });
  res.json(employees);
});

// ── COORDINATOR: Reset employee tasks ─────────────────
app.post('/api/coordinator/employees/:id/reset', authenticateToken, (req, res) => {
  const db = readDb();
  const coordinator = db.users.find(u => u.id === req.user.id);
  const employee = db.users.find(u => u.id === req.params.id);
  if (!coordinator || !employee) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  const today = todayStr();
  db.taskHistory = db.taskHistory.filter(h => !(h.userId === req.params.id && h.date === today));
  writeDb(db);
  res.json({ success: true, message: 'Tareas reiniciadas' });
});

// ── COORDINATOR: Assign employee to group ─────────────
app.put('/api/coordinator/employees/:id/group', authenticateToken, (req, res) => {
  const { groupId } = req.body;
  const db = readDb();
  const coordinator = db.users.find(u => u.id === req.user.id);
  const employee = db.users.find(u => u.id === req.params.id);
  if (!coordinator || !employee) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  if (groupId && !db.groups.find(g => g.id === groupId)) {
    return res.status(404).json({ error: 'Grupo no encontrado' });
  }
  employee.groupId = groupId || null;
  writeDb(db);
  res.json({ success: true });
});

// ── COORDINATOR: Change employee password ─────────────
app.put('/api/coordinator/employees/:id/password', authenticateToken, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'Nueva contraseña requerida' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Minimo 6 caracteres' });
  const db = readDb();
  const coordinator = db.users.find(u => u.id === req.user.id);
  const employee = db.users.find(u => u.id === req.params.id);
  if (!coordinator || !employee) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  employee.passwordHash = bcrypt.hashSync(newPassword, 8);
  employee.plainPassword = newPassword;
  writeDb(db);
  res.json({ success: true, message: 'Contraseña actualizada' });
});

// ── SPA fallback ──────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
