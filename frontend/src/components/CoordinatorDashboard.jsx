import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Check, Lock, Unlock, RefreshCcw, CheckCircle2, User as UserIcon, Calendar, Sun, Moon, History, Key, Eye, EyeOff, Clock, X } from 'lucide-react';
import { getCoordinatorTasks, toggleCoordinatorTask, getCoordinatorHistory, getCoordinatorMonitor, getCoordinatorHistoryDate, resetCoordinatorEmployee, coordinatorChangeEmployeePassword, changePassword } from '../api';
import logoImg from '../assets/hero.png';

export default function CoordinatorDashboard({ user, onLogout, toggleTheme, darkMode }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shakeLocked, setShakeLocked] = useState(false);
  const [history, setHistory] = useState([]);
  const [monitorUsers, setMonitorUsers] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [showPassForm, setShowPassForm] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [editingPasswordEmployee, setEditingPasswordEmployee] = useState(null);
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [showEmpNewPass, setShowEmpNewPass] = useState(false);

  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyDateInput, setHistoryDateInput] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  });
  const datePickerRef = useRef(null);

  const fetchTasks = async () => {
    try { setError(''); const data = await getCoordinatorTasks(); setTasks(data); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    try { const data = await getCoordinatorHistory(); setHistory(data); }
    catch (err) { setError(err.message); }
  };

  const fetchMonitor = async () => {
    try { setError(''); const data = await getCoordinatorMonitor(); setMonitorUsers(data); }
    catch (err) { setError(err.message); }
  };

  const fetchHistoryDate = async (date) => {
    try { setError(''); const data = await getCoordinatorHistoryDate(date); setHistoryData(data); }
    catch (err) { setError(err.message); }
  };

  useEffect(() => { fetchTasks(); }, []);
  useEffect(() => {
    if (activeTab === 'monitor') fetchMonitor();
    if (activeTab === 'history') fetchHistoryDate(historyDate);
  }, [activeTab, historyDate]);

  const handleToggleTask = async (task) => {
    if (task.type === 'salida' && !allEntradaCompleted) { triggerShake(); return; }
    const prev = [...tasks];
    const newCompleted = !task.completed;
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date().toISOString() : null } : t));
    try { await toggleCoordinatorTask(task.id, newCompleted); }
    catch (err) { setError('Error: ' + err.message); setTasks(prev); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg(''); setError('');
    if (!currentPass || !newPass) { setError('Completa ambos campos'); return; }
    try {
      await changePassword(currentPass, newPass);
      setPassMsg('Contrasena actualizada');
      setCurrentPass(''); setNewPass('');
      setTimeout(() => { setShowPassForm(false); setPassMsg(''); }, 2000);
    } catch (err) { setError(err.message); }
  };

  const handleResetEmployee = async (id, name) => {
    if (!window.confirm(`Reiniciar tareas de hoy de "${name}"?`)) return;
    try { await resetCoordinatorEmployee(id); fetchMonitor(); } catch (err) { setError(err.message); }
  };

  const handleChangeEmployeePassword = async (userId) => {
    if (!newEmployeePassword || newEmployeePassword.length < 6) { setError('Minimo 6 caracteres'); return; }
    try {
      await coordinatorChangeEmployeePassword(userId, newEmployeePassword);
      setEditingPasswordEmployee(null); setNewEmployeePassword(''); setShowEmpNewPass(false);
      fetchMonitor();
    } catch (err) { setError(err.message); }
  };

  const triggerShake = () => { setShakeLocked(true); setTimeout(() => setShakeLocked(false), 300); };

  const entradaTasks = tasks.filter(t => t.type === 'entrada');
  const salidaTasks = tasks.filter(t => t.type === 'salida');
  const allEntradaCompleted = entradaTasks.length > 0 && entradaTasks.every(t => t.completed);
  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.completed);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const sortedMonitorUsers = [...monitorUsers].sort((a, b) => a.username.localeCompare(b.username));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '16px', padding: '40px' }}>
        <RefreshCcw size={32} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Cargando tus tareas...</p>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logoImg} alt="DNPK" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
          <span className="app-title">DNPK COORDINADOR</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => { setShowPassForm(!showPassForm); setError(''); setPassMsg(''); }} className="nav-item" title="Cambiar contrasena">
            <Key size={20} />
          </button>
          <button onClick={toggleTheme} className="nav-item" title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={onLogout} className="nav-item" style={{ color: '#ef4444' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {showPassForm && (
        <div style={{ padding: '0 24px' }}>
          <div className="admin-panel-box">
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Cambiar Contrasena</h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Contrasena actual</label>
                <div style={{ position: 'relative' }}>
                  <input type={showCurrentPass ? 'text' : 'password'} className="form-input" style={{ paddingRight: '36px' }} value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="Tu contrasena actual" />
                  <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => setShowCurrentPass(!showCurrentPass)}>
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nueva contrasena</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNewPass ? 'text' : 'password'} className="form-input" style={{ paddingRight: '36px' }} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimo 6 caracteres" />
                  <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => setShowNewPass(!showNewPass)}>
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
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
          {[['tasks', 'Mis Tareas'], ['monitor', 'Monitoreo'], ['history', 'Historial']].map(([key, label]) => (
            <button key={key} className={`admin-tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="app-content" style={{ paddingTop: '10px' }}>
        {error && <div className="error-badge"><span>{error}</span></div>}
        {passMsg && <div className="error-badge" style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', color: '#34d399' }}><span>{passMsg}</span></div>}

        {/* ── MY TASKS ── */}
        {activeTab === 'tasks' && (
          <>
            <div className="profile-card">
              <div className="profile-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'hsl(var(--secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <UserIcon size={16} color="#a78bfa" />
                  </div>
                  <span className="profile-username">Hola, {user.username}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#9ca3af" />
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="progress-container">
                <div className="progress-header">
                  <span>Progreso diario</span>
                  <span>{progressPercent}% ({completedTasks}/{totalTasks})</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            {allTasksCompleted ? (
              <div className="success-screen">
                <div className="success-icon-container"><CheckCircle2 size={32} /></div>
                <h2 className="success-title">Jornada completada!</h2>
                <p className="success-description">Completaste todas las tareas del dia.</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="section-title"><Unlock size={16} color="#34d399" /> Tareas de Ingreso</h2>
                  {entradaTasks.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', padding: '12px' }}>No tenes tareas de ingreso.</p>
                  ) : (
                    <div className="tasks-list">
                      {entradaTasks.map(task => (
                        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`} onClick={() => handleToggleTask(task)}>
                          <div className="task-checkbox-container">{task.completed && <Check size={16} color="white" />}</div>
                          <span className="task-text">{task.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <h2 className="section-title">
                    {allEntradaCompleted ? <Unlock size={16} color="#a78bfa" /> : <Lock size={16} color="#9ca3af" />}
                    Tareas de Egreso
                  </h2>
                  {!allEntradaCompleted ? (
                    <div className={`locked-section ${shakeLocked ? 'shake' : ''}`} onClick={triggerShake}>
                      <div className="locked-icon-container"><Lock size={20} /></div>
                      <span className="locked-title">Seccion Bloqueada</span>
                      <p className="locked-description">Completa todas las tareas de ingreso para habilitar las de egreso.</p>
                    </div>
                  ) : (
                    <div className="tasks-list">
                      {salidaTasks.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', padding: '12px' }}>No tenes tareas de egreso.</p>
                      ) : (
                        salidaTasks.map(task => (
                          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`} onClick={() => handleToggleTask(task)}>
                            <div className="task-checkbox-container">{task.completed && <Check size={16} color="white" />}</div>
                            <span className="task-text">{task.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── MONITOR (same as admin) ── */}
        {activeTab === 'monitor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedMonitorUsers.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '24px', fontSize: '0.9rem' }}>No hay usuarios.</p>
            ) : sortedMonitorUsers.map(u => {
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
                        <button className="nav-item" style={{ color: '#a78bfa', padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleResetEmployee(u.id, u.username)} title="Reiniciar"><RefreshCcw size={14} /> Reiniciar</button>
                        <button className="nav-item" style={{ color: '#a78bfa', padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => { setEditingPasswordEmployee(editingPasswordEmployee === u.id ? null : u.id); setNewEmployeePassword(''); setError(''); }} title="Cambiar contraseña"><Key size={14} /> Pass</button>
                      </div>
                      {editingPasswordEmployee === u.id && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <input type={showEmpNewPass ? 'text' : 'password'} className="form-input" style={{ width: '100%', padding: '8px 36px 8px 12px', fontSize: '0.85rem' }} placeholder="Nueva contraseña" value={newEmployeePassword} onChange={e => setNewEmployeePassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleChangeEmployeePassword(u.id); if (e.key === 'Escape') setEditingPasswordEmployee(null); }} autoFocus />
                            <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => setShowEmpNewPass(!showEmpNewPass)}>
                              {showEmpNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <button className="nav-item" style={{ color: '#34d399' }} onClick={() => handleChangeEmployeePassword(u.id)} title="Guardar"><Check size={18} /></button>
                          <button className="nav-item" style={{ color: '#ef4444' }} onClick={() => { setEditingPasswordEmployee(null); setNewEmployeePassword(''); setShowEmpNewPass(false); }} title="Cancelar"><X size={18} /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── HISTORY (same as admin: date picker + expandable per-date) ── */}
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
