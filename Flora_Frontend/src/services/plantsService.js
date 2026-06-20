import { get, post, put, del } from './api';

const handleResponse = (result, fallback) => {
  const { ok, data } = result;
  if (!ok || !data.success) throw new Error(data?.error?.message || fallback);
  return data.data;
};

export const getAllPlants = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.healthStatus) params.append('healthStatus', filters.healthStatus);
  if (filters.userId) params.append('userId', String(filters.userId));
  if (filters.location) params.append('location', filters.location);
  const query = params.toString() ? `?${params}` : '';
  return handleResponse(await get(`/plants${query}`), 'Failed to fetch plants.');
};

export const getPlantById = async (id) =>
  handleResponse(await get(`/plants/${id}`), 'Failed to fetch plant.');

export const getPlantHistory = async (id) =>
  handleResponse(await get(`/plants/${id}/history`), 'Failed to fetch plant history.');

export const createPlant = async (plantData) =>
  handleResponse(await post('/plants', plantData), 'Failed to create plant.');

export const updatePlant = async (id, plantData) =>
  handleResponse(await put(`/plants/${id}`, plantData), 'Failed to update plant.');

export const deletePlant = async (id) =>
  handleResponse(await del(`/plants/${id}`), 'Failed to delete plant.');
