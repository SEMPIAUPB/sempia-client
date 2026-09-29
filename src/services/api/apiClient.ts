import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized. Please log in.");
      useAuthStore.getState().clearAuth();
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
