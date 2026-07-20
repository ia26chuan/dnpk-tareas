import React, { useState, useEffect } from 'react';
import { LogOut, Check, Lock, Unlock, RefreshCw, CheckCircle2, User as UserIcon, Calendar, Sun, Moon, History, Key, Eye, EyeOff } from 'lucide-react';
import { getTasks, toggleTask, getHistory, changePassword } from '../api';
import logoImg from '../assets/hero.png';

export default function UserDashboard({ user, onLogout, toggleTheme, darkMode }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shakeLocked, setShakeLocked] = useState(false);
  const [view, setView] = useState('tasks');
  const [history, setHistory] = useState([]);
  const [showPassForm, setShowPassForm] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passMsg, setPassMsg] = useState('');

  const fetchTasks = async () => {
    try { setError(''); const data = await getTasks(); setTasks(data); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    try { const data = await getHistory(); setHistory(data); }
    catch (err) { setError(err.message); }
  };

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    if (view === 'history') fetchHistory();
  }, [view]);

  const handleToggleTask = async (task) => {
    if (task.type === 'salida' && !allEntradaCompleted) { triggerShake(); return; }
    const prev = [...tasks];
    const newCompleted = !task.completed;
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date().toISOString() : null } : t));
    try { await toggleTask(task.id, newCompleted); }
    catch (err) { setError('Error: ' + err.message); setTasks(prev); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setError('');
    if (!currentPass || !newPass) { setError('Completa ambos campos'); return; }
    try {
      await changePassword(currentPass, newPass);
      setPassMsg('Contrasena actualizada');
      setCurrentPass(''); setNewPass('');
      setTimeout(() => { setShowPassForm(false); setPassMsg(''); }, 2000);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '16px', padding: '40px' }}>
        <RefreshCw size={32} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Cargando tus tareas...</p>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logoImg} alt="DNPK" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
          <span className="app-title">DNPK JORNADA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => setView(view === 'history' ? 'tasks' : 'history')} className="nav-item" title="Historial">
            <History size={20} />
          </button>
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

      <div className="app-content">
        {error && <div className="error-badge"><span>{error}</span></div>}
        {passMsg && <div className="error-badge" style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', color: '#34d399' }}><span>{passMsg}</span></div>}

        {showPassForm && (
          <div className="admin-panel-box">
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Cambiar Contrasena</h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Contrasena actual</label>
                <div style={{ position: 'relative' }}>
                  <input type={showCurrentPass ? 'text' : 'password'} className="form-input" style={{ paddingRight: '36px' }} value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="Tu contrasena actual" />
                  <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => setShowCurrentPass(!showCurrentPass)} title={showCurrentPass ? 'Ocultar' : 'Mostrar'}>
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nueva contrasena</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNewPass ? 'text' : 'password'} className="form-input" style={{ paddingRight: '36px' }} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimo 6 caracteres" />
                  <button type="button" className="nav-item" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }} onClick={() => setShowNewPass(!showNewPass)} title={showNewPass ? 'Ocultar' : 'Mostrar'}>
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Actualizar</button>
            </form>
          </div>
        )}

        {view === 'history' ? (
          <>
            <h2 className="section-title"><History size={16} color="#a78bfa" /> Historial de Jornadas</h2>
            {history.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', padding: '12px' }}>No hay historial todavia.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map(day => (
                  <div key={day.date} className="admin-panel-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{day.date}</span>
                      {day.total === 0 ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f87171' }}>SIN JORNADA</span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: day.percent === 100 ? '#34d399' : '#fbbf24' }}>{day.percent}% ({day.completed}/{day.total})</span>
                      )}
                    </div>
                    {day.total === 0 ? (
                      <p style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center', padding: '8px' }}>No se iniciaron tareas.</p>
                    ) : day.tasks.map((t, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`task-type-badge ${t.taskType}`} style={{ transform: 'scale(0.8)' }}>{t.taskType}</span>
                          <span>{t.taskText}</span>
                        </div>
                        {t.completed ? <Check size={14} color="#34d399" /> : <span style={{ color: '#9ca3af' }}>-</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
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
                <div className="success-icon-container"><CheckCircle2 size={40} /></div>
                <h2 className="success-title">Jornada completada!</h2>
                <p className="success-description">Completaste todas las tareas del dia.</p>
                <div className="task-details-view" style={{ width: '100%' }}>
                  <div className="detail-label" style={{ textAlign: 'left', marginBottom: '8px' }}>RESUMEN:</div>
                  {tasks.map(task => (
                    <div key={task.id} className="detail-task-row">
                      <span className="detail-task-text">{task.text}</span>
                      <span className="detail-status-ok">&#10003;</span>
                    </div>
                  ))}
                </div>
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
      </div>
    </>
  );
}
