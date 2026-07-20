import React, { useState } from 'react';
import { Lock, User, AlertCircle, Sun, Moon } from 'lucide-react';
import { login } from '../api';
import logoImg from '../assets/hero.png';

export default function Login({ onLoginSuccess, toggleTheme, darkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-header">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button onClick={toggleTheme} className="nav-item" title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>
        <div className="login-logo">
          <img src={logoImg} alt="DNPK" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
        </div>
        <h1 className="login-title">Control de Tareas</h1>
        <p className="login-subtitle">Ingresá tus credenciales para acceder</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} autoComplete="off">
        {error && (
          <div className="error-badge">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="username">Usuario</label>
          <div style={{ position: 'relative' }}>
            <User size={18} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="username"
              type="email"
              className="form-input"
              style={{ paddingLeft: '48px' }}
              placeholder="Ej: juan@dnpk.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="password"
              type="password"
              className="form-input"
              style={{ paddingLeft: '48px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
