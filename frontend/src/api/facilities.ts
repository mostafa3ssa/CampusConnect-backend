import apiClient from './client';
import type { Facility } from '../types';

export const getFacilities = async (): Promise<Facility[]> => {
  const { data } = await apiClient.get('/api/facilities');
  return data;
};

export const reserveFacility = async (facilityId: number | string, reservationData: { start_time: string; end_time: string; team_ids: number[] }): Promise<any> => {
  const { data } = await apiClient.post(`/api/facilities/${facilityId}/reserve`, reservationData);
  return data;
};

export const reportFacility = async (facilityId: number | string, reason: string, details: string): Promise<void> => {
  await apiClient.post('/api/facilities/report', { facility_id: facilityId, reason, details });
};
