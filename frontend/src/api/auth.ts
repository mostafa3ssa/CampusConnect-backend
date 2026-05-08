import apiClient from './client';
import type { AuthResponse } from '../types';

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  return response.data;
};
