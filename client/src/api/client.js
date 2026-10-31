import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
  timeout: 30000,
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes('/auth/');
    if (status !== 401 || !original || original._retried || isAuthCall) {
      return Promise.reject(error);
    }
    original._retried = true;
    try {
      refreshPromise = refreshPromise || api.post('/auth/refresh');
      await refreshPromise;
      refreshPromise = null;
      return api(original);
    } catch (refreshError) {
      refreshPromise = null;
      return Promise.reject(refreshError);
    }
  },
);

export function unwrap(response) {
  return response.data?.data;
}

export function getErrorMessage(error, fallback = 'Có lỗi xảy ra, vui lòng thử lại') {
  const details = error?.response?.data?.error?.details;
  if (Array.isArray(details) && details.length) {
    return details.map((d) => d.message).join('; ');
  }
  return error?.response?.data?.error?.message || error?.message || fallback;
}
