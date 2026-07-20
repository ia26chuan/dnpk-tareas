import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Plus, Trash2, Eye, EyeOff, RefreshCcw, Check, X, Clock, Sun, Moon, Key, Calendar, User } from 'lucide-react';
import { getAdminUsers, createUser, deleteUser, assignUserGroup, resetUser, adminChangePassword, adminChangeRole, changePassword, getAdminGroups, createGroup, updateGroup, deleteGroup, getGroupTasks, createGroupTask, deleteTask, getAdminHistory } from '../api';
import logoImg from '../assets/hero.png';

export default function AdminDashboard({ onLogout, toggleTheme, darkMode }) {
  const [activeTab, setActiveTab] = useState('monitor');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  const [newGroupName, setNewGroupName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [newUserGroup, setNewUserGroup] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupTasks, setGroupTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskType, setNewTaskType] = useState('entrada');

  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyDateInput, setHistoryDateInput] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  });
  const [historyData, setHistoryData] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);

  const [editingPasswordUser, setEditingPasswordUser] = useState(null);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showAdminPassForm, setShowAdminPassForm] = useState(false);
  const [adminCurrentPass, setAdminCurrentPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [showAdminCurrentPass, setShowAdminCurrentPass] = useState(false);
  const [showAdminNewPass, setShowAdminNewPass] = useState(false);

  const datePickerRef = useRef(null);

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const fetchUsers = async () => {
    try { setError(''); const data = await getAdminUsers(); setUsers(data); }
    catch (err) { setError(err.message); }
  };

  const fetchGroups = async () => {
    try { const data = await getAdminGroups(); setGroups(data); }
    catch (err) { setError(err.message); }
  };

  const fetchGroupTasks = async (gId) => {
    if (!gId) { setGroupTasks([]); return; }
    try { const data = await getGroupTasks(gId); setGroupTasks(data); }
    catch (err) { setError(err.message); }
  };

  const fetchHistory = async (date) => {
    try { const data = await getAdminHistory(date); setHistoryData(data); }
    catch (err) { setError(err.message); }
  };

  useEffect(() => { fetchUsers(); fetchGroups(); }, []);
  useEffect(() => { if (selectedGroupId) fetchGroupTasks(selectedGroupId); }, [selectedGroupId, groups]);
  useEffect(() => { if (activeTab === 'history') fetchHistory(historyDate); }, [activeTab, historyDate]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;
    try { await createGroup(newGroupName); setNewGroupName(''); showSuccess('Grupo creado'); fetchGroups(); }
    catch (err) { setError(err.message); }
  };

  const handleDeleteGroup = async (id, name) => {
    if (!window.confirm(`Eliminar grupo "${name}"? Las tareas se borran y los usuarios quedan sin grupo.`)) return;
    try { await deleteGroup(id); showSuccess('Grupo eliminado'); setSelectedGroupId(''); fetchGroups(); fetchUsers(); }
    catch (err) { setError(err.message); }
  };

  const handleRenameGroup = async (id, oldName) => {
    const newName = prompt(`Renombrar grupo "${oldName}":`, oldName);
    if (!newName || newName === oldName) return;
    try { await updateGroup(id, newName); showSuccess('Grupo renombrado'); fetchGroups(); }
    catch (err) { setError(err.message); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    try {
      await createUser(newUsername, newPassword, newUserRole === 'admin' ? null : (newUserGroup || null), newUserRole);
      setNewUsername(''); setNewPassword(''); setNewUserGroup(''); setNewUserRole('user');
      showSuccess('Usuario creado'); fetchUsers();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Eliminar usuario "${name}"?`)) return;
    try { await deleteUser(id); showSuccess('Usuario eliminado'); fetchUsers(); }
    catch (err) { setError(err.message); }
  };

  const handleAssignGroup = async (userId, groupId) => {
    try { await assignUserGroup(userId, groupId || null); showSuccess('Grupo actualizado'); fetchUsers(); }
    catch (err) { setError(err.message); }
  };

  const handleResetUser = async (id, name) => {
    if (!window.confirm(`Reiniciar tareas de hoy de "${name}"?`)) return;
    try { await resetUser(id); showSuccess('Tareas reiniciadas'); fetchUsers(); }
    catch (err) { setError(err.message); }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText || !selectedGroupId) return;
    try { await createGroupTask(selectedGroupId, newTaskText, newTaskType); setNewTaskText(''); showSuccess('Tarea agregada'); fetchGroupTasks(selectedGroupId); }
    catch (err) { setError(err.message); }
  };

  const handleDeleteTask = async (taskId) => {
    try { await deleteTask(taskId); showSuccess('Tarea eliminada'); fetchGroupTasks(selectedGroupId); }
    catch (err) { setError(err.message); }
  };

  const handleChangeUserPassword = async (userId) => {
    if (!newUserPassword || newUserPassword.length < 6) { setError('Minimo 6 caracteres'); return; }
    try {
      await adminChangePassword(userId, newUserPassword);
      showSuccess('Contrasena actualizada');
      setEditingPasswordUser(null);
      setNewUserPassword('');
      setShowNewPassword(false);
      fetchUsers();
    } catch (err) { setError(err.message); }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminChangeRole(userId, newRole);
      showSuccess(`Rol cambiado a ${newRole === 'admin' ? 'Administrador' : 'Empleado'}`);
      fetchUsers();
    } catch (err) { setError(err.message); }
  };

  const handleAdminChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');
    if (!adminCurrentPass || !adminNewPass) { setError('Completa ambos campos'); return; }
    try {
      await changePassword(adminCurrentPass, adminNewPass);
      showSuccess('Contrasena actualizada');
      setAdminCurrentPass('');
      setAdminNewPass('');
      setShowAdminPassForm(false);
    } catch (err) { setError(err.message); }
  };

  const normalUsers = [...users].sort((a, b) => a.username.localeCompare(b.username));
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name));
  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logoImg} alt="DNPK" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
          <span className="app-title">DNPK ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => { setShowAdminPassForm(!showAdminPassForm); setError(''); setSuccessMsg(''); setAdminCurrentPass(''); setAdminNewPass(''); }} className="nav-item" title="Cambiar mi contraseña">
            <Key size={20} />
          </button>
          <button onClick={toggleTheme} className="nav-item" title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={onLogout} className="nav-item" style={{ color: '#ef4444' }}><LogOut size={20} /></button>
        </div>
      </header>

      {showAdminPassForm && (
        <div style={{ padding: '0 24px' }}>
          <div className="admin-panel-box">
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Cambiar Mi Contrasena</h3>
            <form onSubmit={handleAdminChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Contrasena actual</label>
                <div style={{ position: 'relative' }}>
                  <input type={showAdminCurrentPass ? 'text' : 'password'} className="form-input" style={{ paddingRight: '36px' }} value={adminCurrentPass} onChange={e => setAdminCurrentPass(e.target.value)} placeholder="Tu contrasena actual" />
                  <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => setShowAdminCurrentPass(!showAdminCurrentPass)} title={showAdminCurrentPass ? 'Ocultar' : 'Mostrar'}>
                    {showAdminCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nueva contrasena</label>
                <div style={{ position: 'relative' }}>
                  <input type={showAdminNewPass ? 'text' : 'password'} className="form-input" style={{ paddingRight: '36px' }} value={adminNewPass} onChange={e => setAdminNewPass(e.target.value)} placeholder="Minimo 6 caracteres" />
                  <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => setShowAdminNewPass(!showAdminNewPass)} title={showAdminNewPass ? 'Ocultar' : 'Mostrar'}>
                    {showAdminNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Actualizar</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ padding: '16px 24px 0' }}>
        <div className="admin-tabs">
          {[['monitor', 'Monitoreo'], ['groups', 'Grupos'], ['users', 'Usuarios'], ['history', 'Historial']].map(([key, label]) => (
            <button key={key} className={`admin-tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="app-content" style={{ paddingTop: '10px' }}>
        {error && <div className="error-badge"><span>{error}</span></div>}
        {successMsg && <div className="error-badge" style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', color: '#34d399' }}><span>{successMsg}</span></div>}

        {/* ── MONITOR ── */}
        {activeTab === 'monitor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {normalUsers.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '24px', fontSize: '0.9rem' }}>No hay usuarios.</p>
            ) : normalUsers.map(u => {
              const total = u.stats.totalEntrada + u.stats.totalSalida;
              const completed = u.stats.completedEntrada + u.stats.completedSalida;
              let statusLabel = 'Sin iniciar', statusClass = 'not-started';
              if (completed === total && total > 0) { statusLabel = 'Completo'; statusClass = 'complete'; }
              else if (completed > 0) { statusLabel = 'En progreso'; statusClass = 'in-progress'; }
              const isExpanded = expandedUser === u.id;
              return (
                <div key={u.id} className="user-status-card" onClick={() => setExpandedUser(isExpanded ? null : u.id)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{u.username}</span>
                      {u.role === 'coordinator' && <span style={{ fontSize: '0.55rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(56,189,248,0.2)', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>Coord</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                      <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid hsl(var(--border))' }} onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '6px' }}>{u.groupName}</div>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                        <div className="user-stat-row"><span>Ingreso</span><span style={{ color: u.stats.completedEntrada === u.stats.totalEntrada && u.stats.totalEntrada > 0 ? '#34d399' : 'inherit' }}>{u.stats.completedEntrada}/{u.stats.totalEntrada}</span></div>
                        <div className="user-stat-row"><span>Egreso</span><span style={{ color: u.stats.completedSalida === u.stats.totalSalida && u.stats.totalSalida > 0 ? '#34d399' : 'inherit' }}>{u.stats.completedSalida}/{u.stats.totalSalida}</span></div>
                      </div>
                      {u.tasks && u.tasks.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          {u.tasks.map((t, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.75rem', borderBottom: i < u.tasks.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className={`task-type-badge ${t.type}`} style={{ transform: 'scale(0.7)' }}>{t.type}</span>
                                <span>{t.text}</span>
                              </div>
                              {t.completed ? <Check size={12} color="#34d399" /> : <X size={12} color="#f87171" />}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px' }}>Pass: <strong style={{ color: '#e2e8f0' }}>{u.plainPassword}</strong></div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="nav-item" style={{ color: '#a78bfa', padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleResetUser(u.id, u.username)} title="Reiniciar"><RefreshCcw size={14} /> Reiniciar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── GROUPS ── */}
        {activeTab === 'groups' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-panel-box">
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Nuevo Grupo / Sector</h3>
              <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Ej: Deposito, Administracion..." value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required />
                <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '12px 20px' }}><Plus size={18} /></button>
              </form>
            </div>

            <div className="admin-panel-box">
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>Grupos ({groups.length})</h3>
              {groups.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>No hay grupos creados.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sortedGroups.map(g => {
                    const isExpanded = expandedUser === `group-${g.id}`;
                    return (
                    <div key={g.id} style={{ padding: '12px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '10px', cursor: 'pointer' }} onClick={() => setExpandedUser(isExpanded ? null : `group-${g.id}`)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: '600' }}>{g.name}</span>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{g.memberCount} usuarios | {g.taskCount} tareas</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid hsl(var(--border))' }} onClick={e => e.stopPropagation()}>
                          {g.members.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                              {g.members.map(m => (
                                <div key={m} style={{ padding: '6px 10px', backgroundColor: 'hsl(var(--background))', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <User size={12} color="#9ca3af" />
                                  <span>{m}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem', textAlign: 'center', marginBottom: '10px' }}>Sin usuarios</p>
                          )}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="nav-item" style={{ color: '#a78bfa', padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleRenameGroup(g.id, g.name)}><RefreshCcw size={14} /> Renombrar</button>
                            <button className="nav-item" style={{ color: '#ef4444', padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDeleteGroup(g.id, g.name)}><Trash2 size={14} /> Eliminar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
            </div>

            <div className="admin-panel-box">
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Seleccionar Grupo para ver/editar tareas</h3>
              <select className="task-manager-select" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
                <option value="">Selecciona un grupo</option>
                {sortedGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            {selectedGroupId && (
              <>
                <div className="admin-panel-box">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Nueva Tarea - {selectedGroup?.name}</h3>
                  <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" className="form-input" placeholder="Texto de la tarea" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} required />
                    <select className="task-manager-select" value={newTaskType} onChange={e => setNewTaskType(e.target.value)}>
                      <option value="entrada">Entrada (Ingreso)</option>
                      <option value="salida">Salida (Egreso)</option>
                    </select>
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}><Plus size={18} /> Agregar</button>
                  </form>
                </div>
                <div className="admin-panel-box">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>Tareas ({groupTasks.length})</h3>
                  {groupTasks.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>Sin tareas.</p>
                  ) : (
                    <div className="tasks-admin-list">
                      {groupTasks.map(t => (
                        <div key={t.id} className="task-admin-item">
                          <span className={`task-type-badge ${t.type}`}>{t.type}</span>
                          <span className="task-admin-text">{t.text}</span>
                          <button className="nav-item" style={{ color: '#ef4444' }} onClick={() => handleDeleteTask(t.id)}><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-panel-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showCreateUser ? '12px' : '0' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Nuevo Usuario</h3>
                <button className="nav-item" style={{ color: showCreateUser ? '#ef4444' : '#34d399' }} onClick={() => { setShowCreateUser(!showCreateUser); setNewUsername(''); setNewPassword(''); setNewUserGroup(''); setNewUserRole('user'); setError(''); }}>
                  {showCreateUser ? <X size={18} /> : <Plus size={18} />}
                </button>
              </div>
              {showCreateUser && (
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" className="form-input" placeholder="Usuario" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
                  <div style={{ position: 'relative' }}>
                    <input type={showCreatePassword ? 'text' : 'password'} className="form-input" style={{ width: '100%', paddingRight: '36px' }} placeholder="Contrasena" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => setShowCreatePassword(!showCreatePassword)} title={showCreatePassword ? 'Ocultar' : 'Mostrar'}>
                      {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                <select className="task-manager-select" value={newUserRole} onChange={e => { setNewUserRole(e.target.value); if (e.target.value === 'admin' || e.target.value === 'coordinator') setNewUserGroup(''); }}>
                  <option value="user">Empleado</option>
                  <option value="coordinator">Coordinador</option>
                  <option value="admin">Administrador</option>
                </select>
                {newUserRole === 'user' && (
                    <select className="task-manager-select" value={newUserGroup} onChange={e => setNewUserGroup(e.target.value)}>
                      <option value="">Sin grupo</option>
                      {sortedGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}><Plus size={18} /> Crear</button>
                </form>
              )}
            </div>

            <div className="admin-panel-box">
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>Usuarios ({normalUsers.length})</h3>
              {normalUsers.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>No hay usuarios.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {normalUsers.map(u => {
                    const isExpanded = expandedUser === `card-${u.id}`;
                    return (
                    <div key={u.id} style={{ padding: '10px 12px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '10px', cursor: 'pointer' }} onClick={() => setExpandedUser(isExpanded ? null : `card-${u.id}`)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u.username}</span>
                          {u.role === 'admin' && <span style={{ fontSize: '0.55rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(167,139,250,0.2)', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase' }}>Admin</span>}
                          {u.role === 'coordinator' && <span style={{ fontSize: '0.55rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(56,189,248,0.2)', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>Coord</span>}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                      {isExpanded && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid hsl(var(--border))' }} onClick={e => e.stopPropagation()}>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px' }}>Pass: <strong style={{ color: '#e2e8f0' }}>{u.plainPassword}</strong></div>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <button className="nav-item" style={{ color: '#a78bfa', padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => { setEditingPasswordUser(editingPasswordUser === u.id ? null : u.id); setNewUserPassword(''); setError(''); }}><Key size={14} /> Pass</button>
                            <button className="nav-item" style={{ color: '#ef4444', padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDeleteUser(u.id, u.username)}><Trash2 size={14} /> Eliminar</button>
                          </div>
                          {editingPasswordUser === u.id && (
                            <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div style={{ flex: 1, position: 'relative' }}>
                                <input type={showNewPassword ? 'text' : 'password'} className="form-input" style={{ width: '100%', padding: '8px 36px 8px 12px', fontSize: '0.85rem' }} placeholder="Nueva contraseña" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleChangeUserPassword(u.id); if (e.key === 'Escape') setEditingPasswordUser(null); }} autoFocus />
                                <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => setShowNewPassword(!showNewPassword)}>
                                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                              <button className="nav-item" style={{ color: '#34d399' }} onClick={() => handleChangeUserPassword(u.id)}><Check size={18} /></button>
                              <button className="nav-item" style={{ color: '#ef4444' }} onClick={() => { setEditingPasswordUser(null); setNewUserPassword(''); setShowNewPassword(false); }}><X size={18} /></button>
                            </div>
                          )}
                          {u.role === 'user' && (
                            <div style={{ marginBottom: '6px' }}>
                              <label className="form-label">Grupo:</label>
                              <select className="task-manager-select" value={u.groupId || ''} onChange={e => handleAssignGroup(u.id, e.target.value)} style={{ marginTop: '4px' }}>
                                <option value="">Sin grupo</option>
                                {sortedGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                              </select>
                            </div>
                          )}
                          {u.role === 'coordinator' && (
                            <div style={{ marginBottom: '6px' }}>
                              <label className="form-label">Grupo:</label>
                              <select className="task-manager-select" value={u.groupId || ''} onChange={e => handleAssignGroup(u.id, e.target.value)} style={{ marginTop: '4px' }}>
                                <option value="">Sin grupo</option>
                                {sortedGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                              </select>
                            </div>
                          )}
                          <div>
                            <label className="form-label">Rol:</label>
                            <select className="task-manager-select" value={u.role} onChange={e => { if (window.confirm(`Cambiar rol de "${u.username}"?`)) handleChangeRole(u.id, e.target.value); }} style={{ marginTop: '4px' }}>
                              <option value="user">Empleado</option>
                              <option value="coordinator">Coordinador</option>
                              <option value="admin">Administrador</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-panel-box">
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Ver fecha especifica</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="text" className="form-input" style={{ width: '100%', paddingRight: '36px' }} placeholder="DD/MM/YYYY" value={historyDateInput} onChange={e => {
                    let v = e.target.value.replace(/[^0-9/]/g, '');
                    if (v.length === 2 && historyDateInput.length === 1) v += '/';
                    if (v.length === 5 && historyDateInput.length === 4) v += '/';
                    setHistoryDateInput(v);
                    const parts = v.split('/');
                    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                      setHistoryDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    }
                  }} />
                  <input type="date" ref={datePickerRef} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} value={historyDate} onChange={e => {
                    const parts = e.target.value.split('-');
                    setHistoryDate(e.target.value);
                    setHistoryDateInput(`${parts[2]}/${parts[1]}/${parts[0]}`);
                  }} />
                  <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => datePickerRef.current?.showPicker()} title="Seleccionar fecha">
                    <Calendar size={16} />
                  </button>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#a78bfa', whiteSpace: 'nowrap' }}>{historyDateInput}</span>
              </div>
            </div>

            {historyData.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '12px' }}>Sin datos para esta fecha.</p>
            ) : historyData.sort((a, b) => a.username.localeCompare(b.username)).map(u => {
              const isExpanded = expandedUser === `hist-${u.userId}`;
              return (
              <div key={u.userId} style={{ padding: '10px 12px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '10px', cursor: 'pointer' }} onClick={() => setExpandedUser(isExpanded ? null : `hist-${u.userId}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{u.username}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {u.total === 0 ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f87171' }}>SIN JORNADA</span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: u.percent === 100 ? '#34d399' : '#fbbf24' }}>{u.percent}%</span>
                    )}
                    <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid hsl(var(--border))' }} onClick={e => e.stopPropagation()}>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '6px' }}>{u.groupName} | {u.completed}/{u.total} tareas</div>
                    {u.total > 0 ? u.tasks.map((t, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.75rem', borderBottom: i < u.tasks.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className={`task-type-badge ${t.taskType}`} style={{ transform: 'scale(0.7)' }}>{t.taskType}</span>
                          <span>{t.taskText}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {t.completed ? (
                            <><Clock size={10} color="#9ca3af" /><span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{formatTime(t.completedAt)}</span><Check size={12} color="#34d399" /></>
                          ) : <X size={12} color="#f87171" />}
                        </div>
                      </div>
                    )) : (
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem', textAlign: 'center', padding: '6px' }}>No se iniciaron tareas.</p>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
