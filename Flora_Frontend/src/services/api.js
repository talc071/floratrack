const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const getApiBaseUrl = () => BASE_URL;

export const getSocketUrl = () => process.env.REACT_APP_SOCKET_URL || BASE_URL;

const getAuthHeaders = () => {
  const session = JSON.parse(localStorage.getItem('floratrack_session') || 'null');
  if (!session) return {};
  return {
    'x-user-role': session.userRole,
    'x-user-id': String(session.userId),
  };
};

export const apiRequest = async (method, path, body = null, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = { method, headers };
  if (body !== null) fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, fetchOptions);
  } catch {
    throw new Error('Network error — could not reach the server.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid response from server.');
  }

  return { ok: response.ok, status: response.status, data };
};

export const get = (path) => apiRequest('GET', path);
export const post = (path, body) => apiRequest('POST', path, body);
export const put = (path, body) => apiRequest('PUT', path, body);
export const del = (path) => apiRequest('DELETE', path);

export const postForm = (path, formData) => apiRequest('POST', path, formData);
