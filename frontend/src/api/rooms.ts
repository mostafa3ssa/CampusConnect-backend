import apiClient from './client';
import type { Room } from '../types';

export const getRooms = async (): Promise<Room[]> => {
  const { data } = await apiClient.get('/api/rooms');
  return data;
};

export const reserveRoom = async (reservationData: { start_time: string; end_time: string; purpose: string; std_ids: number[] }): Promise<any> => {
  const { data } = await apiClient.post('/api/rooms/reserve', reservationData);
  return data;
};

export const cancelRoomReservation = async (roomId: number | string, start_time: string): Promise<void> => {
  await apiClient.patch(`/api/rooms/${roomId}/cancel`, { start_time });
};

export const reportRoom = async (roomId: number | string, reason: string, details: string): Promise<void> => {
  await apiClient.post('/api/rooms/report', { room_id: roomId, reason, details });
};

export const getRoomResources = async (): Promise<any[]> => {
  const { data } = await apiClient.get('/api/rooms/resources');
  return data;
};
