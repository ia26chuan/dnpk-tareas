const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/data.json'
  : path.join(__dirname, 'data.json');

function readDb() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [
        { id: 'admin-id', username: 'admin@dnpk.com', passwordHash: bcrypt.hashSync('Dnpk@2026', 8), plainPassword: 'Dnpk@2026', role: 'admin', groupId: null },
        { id: 'juan-id', username: 'juan@dnpk.com', passwordHash: bcrypt.hashSync('Dnpk@Ju4n', 8), plainPassword: 'Dnpk@Ju4n', role: 'user', groupId: 'grupo-deposito' },
        { id: 'maria-id', username: 'maria@dnpk.com', passwordHash: bcrypt.hashSync('Dnpk@M4ria', 8), plainPassword: 'Dnpk@M4ria', role: 'user', groupId: 'grupo_barra' },
        { id: 'user_coord', username: 'coo@dnpk.com', passwordHash: bcrypt.hashSync('Coo@2026', 8), plainPassword: 'Coo@2026', role: 'coordinator', groupId: 'grupo-deposito' }
      ],
      groups: [
        { id: 'grupo-deposito', name: 'DEPOSITO' },
        { id: 'grupo_barra', name: 'BARRA' }
      ],
      tasks: [
        { id: 'task-1', groupId: 'grupo-deposito', text: 'Firmar planilla de ingreso', type: 'entrada', order: 1 },
        { id: 'task-2', groupId: 'grupo-deposito', text: 'Revisar equipo de protección personal (EPP)', type: 'entrada', order: 2 },
        { id: 'task-3', groupId: 'grupo-deposito', text: 'Controlar orden de trabajo del día', type: 'entrada', order: 3 },
        { id: 'task-4', groupId: 'grupo-deposito', text: 'Limpieza y orden del puesto de trabajo', type: 'salida', order: 4 },
        { id: 'task-5', groupId: 'grupo-deposito', text: 'Firmar planilla de salida', type: 'salida', order: 5 },
        { id: 'task-6', groupId: 'grupo_barra', text: 'tarea 1', type: 'entrada', order: 1 },
        { id: 'task-7', groupId: 'grupo_barra', text: 'tarea 2', type: 'entrada', order: 2 },
        { id: 'task-8', groupId: 'grupo_barra', text: 'tarea 1', type: 'salida', order: 3 }
      ],
      taskHistory: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading database:", err);
    return { users: [], groups: [], tasks: [], taskHistory: [] };
  }
}

function writeDb(data) {
  try {
    const tempPath = dbPath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, dbPath);
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

module.exports = { readDb, writeDb, todayStr, dbPath };
