import { apiClient } from './apiClient';
import type { LoginRequest, CustomTokenObtainPair, Register, User } from '../contracts';

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<{ access: string, refresh: string }>('/accounts/login/', credentials);
    return response.data;
  },

  register: async (data: Register) => {
    const response = await apiClient.post<Register>('/accounts/register/', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get<User>('/accounts/profile/');
    return response.data;
  },

  refreshToken: async (refresh: string) => {
    const response = await apiClient.post<{ access: string, refresh: string }>('/accounts/login/refresh/', { refresh });
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/accounts/logout/');
    return response.data;
  }
};
