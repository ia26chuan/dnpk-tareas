const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('tasks_token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
  return data;
}

export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const changePassword = (currentPassword, newPassword) =>
  request('/user/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });

export const getTasks = () => request('/tasks');
export const toggleTask = (id, completed) =>
  request(`/tasks/${id}/toggle`, { method: 'POST', body: JSON.stringify({ completed }) });

export const getHistory = () => request('/history');

export const getAdminUsers = () => request('/admin/users');
export const createUser = (username, password, groupId, role) =>
  request('/admin/users', { method: 'POST', body: JSON.stringify({ username, password, groupId, role }) });
export const deleteUser = (userId) =>
  request(`/admin/users/${userId}`, { method: 'DELETE' });
export const assignUserGroup = (userId, groupId) =>
  request(`/admin/users/${userId}/group`, { method: 'PUT', body: JSON.stringify({ groupId }) });
export const resetUser = (userId) =>
  request(`/admin/users/${userId}/reset`, { method: 'POST' });
export const adminChangePassword = (userId, newPassword) =>
  request(`/admin/users/${userId}/password`, { method: 'PUT', body: JSON.stringify({ newPassword }) });
export const adminChangeRole = (userId, role) =>
  request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) });

export const getAdminGroups = () => request('/admin/groups');
export const createGroup = (name) =>
  request('/admin/groups', { method: 'POST', body: JSON.stringify({ name }) });
export const updateGroup = (groupId, name) =>
  request(`/admin/groups/${groupId}`, { method: 'PUT', body: JSON.stringify({ name }) });
export const deleteGroup = (groupId) =>
  request(`/admin/groups/${groupId}`, { method: 'DELETE' });

export const getGroupTasks = (groupId) => request(`/admin/groups/${groupId}/tasks`);
export const createGroupTask = (groupId, text, type) =>
  request(`/admin/groups/${groupId}/tasks`, { method: 'POST', body: JSON.stringify({ text, type }) });
export const updateTask = (taskId, data) =>
  request(`/admin/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTask = (taskId) =>
  request(`/admin/tasks/${taskId}`, { method: 'DELETE' });

export const getAdminHistory = (date) =>
  request(`/admin/history?date=${date || ''}`);

export const getAdminAllHistory = () => request('/admin/history/all');

export const getCoordinatorTasks = () => request('/coordinator/tasks');
export const toggleCoordinatorTask = (id, completed) =>
  request(`/coordinator/tasks/${id}/toggle`, { method: 'POST', body: JSON.stringify({ completed }) });
export const getCoordinatorHistory = () => request('/coordinator/history');
export const getCoordinatorMonitor = () => request('/coordinator/monitor');
export const getCoordinatorHistoryDate = (date) =>
  request(`/coordinator/history/date?date=${date || ''}`);
export const resetCoordinatorEmployee = (userId) =>
  request(`/coordinator/employees/${userId}/reset`, { method: 'POST' });
export const coordinatorChangeEmployeePassword = (userId, newPassword) =>
  request(`/coordinator/employees/${userId}/password`, { method: 'PUT', body: JSON.stringify({ newPassword }) });
