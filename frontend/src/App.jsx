import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import CoordinatorDashboard from './components/CoordinatorDashboard';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('tasks_theme') !== 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', !darkMode);
    localStorage.setItem('tasks_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('tasks_token');
    const savedUser = localStorage.getItem('tasks_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user session:", e);
        localStorage.removeItem('tasks_token');
        localStorage.removeItem('tasks_user');
      }
    }
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('tasks_token', newToken);
    localStorage.setItem('tasks_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tasks_token');
    localStorage.removeItem('tasks_user');
  };

  if (initializing) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Inicializando...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} toggleTheme={toggleTheme} darkMode={darkMode} />
      ) : user?.role === 'admin' ? (
        <AdminDashboard onLogout={handleLogout} toggleTheme={toggleTheme} darkMode={darkMode} />
      ) : user?.role === 'coordinator' ? (
        <CoordinatorDashboard user={user} onLogout={handleLogout} toggleTheme={toggleTheme} darkMode={darkMode} />
      ) : (
        <UserDashboard user={user} onLogout={handleLogout} toggleTheme={toggleTheme} darkMode={darkMode} />
      )}
    </div>
  );
}

export default App;
