import { post, postForm } from './api';

const handleResponse = (result, fallback) => {
  const { ok, data } = result;
  if (!ok || !data.success) throw new Error(data?.error?.message || fallback);
  return data.data;
};

export const logCareAction = async ({ plantId, actionType, notes = '' }) =>
  handleResponse(await post('/api/care-logs', { plantId, actionType, notes }), 'Failed to log action.');

export const identifyPlant = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return handleResponse(await postForm('/api/ai/identify', formData), 'AI identification failed.');
};
