import { post, get } from './api';

const SESSION_KEY = 'floratrack_session';

export const register = async ({ firstName, lastName, email, password }) => {
  const { ok, data } = await post('/api/auth/register', { firstName, lastName, email, password });
  if (!ok || !data.success) throw new Error(data?.error?.message || 'Registration failed.');
  localStorage.setItem(SESSION_KEY, JSON.stringify(data.data));
  return data.data;
};

export const login = async (email, password) => {
  const { ok, data } = await post('/api/auth/login', { email, password });
  if (!ok || !data.success) throw new Error(data?.error?.message || 'Login failed.');
  localStorage.setItem(SESSION_KEY, JSON.stringify(data.data));
  return data.data;
};

export const logout = async () => {
  try { await post('/api/auth/logout'); } catch (_) {}
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = () =>
  JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

export const getCurrentUser = async () => {
  const { ok, data } = await get('/api/users/me');
  if (!ok || !data.success) throw new Error(data?.error?.message || 'Failed to fetch user.');
  return data.data;
};
