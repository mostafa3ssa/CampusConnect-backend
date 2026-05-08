import apiClient from './client';
import type { StudentRecord } from '../types';
export const getMe = async (): Promise<any> => {
  const { data } = await apiClient.get('/api/users/me');
  return data;
};

// Search users (students)
export const searchStudents = async (query: string): Promise<StudentRecord[]> => {
  const { data } = await apiClient.post('/api/users', { query });
  return data;
};
