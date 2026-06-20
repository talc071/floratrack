import { get, put } from './api';

export const getSettings = async () => {
  const { ok, data } = await get('/api/settings');
  if (!ok || !data.success) throw new Error(data?.error?.message || 'Failed to load settings.');
  return data.data;
};

export const updateSettings = async (settings) => {
  const { ok, data } = await put('/api/settings', settings);
  if (!ok || !data.success) throw new Error(data?.error?.message || 'Failed to save settings.');
  return data.data;
};
