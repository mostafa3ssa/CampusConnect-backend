import apiClient from './client';
import type { Club } from '../types';

export const getClubs = async (): Promise<Club[]> => {
  const { data } = await apiClient.get('/api/clubs');
  return data;
};

export const getClub = async (id: number | string): Promise<Club> => {
  const { data } = await apiClient.get(`/api/clubs/${id}`);
  return data;
};

export const followClub = async (id: number | string): Promise<void> => {
  await apiClient.post(`/api/clubs/${id}/follow`);
};

export const unfollowClub = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/api/clubs/${id}/follow`);
};

export const updateClub = async (id: number | string, clubData: any): Promise<void> => {
  await apiClient.put(`/api/clubs/${id}`, clubData);
};

export const reportClub = async (clubId: number | string, reason: string, details: string): Promise<void> => {
  await apiClient.post('/api/clubs/report', { club_id: clubId, reason, details });
};
