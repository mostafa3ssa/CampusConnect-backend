import apiClient from './client';
import type { EventType, User } from '../types';

export const getEvents = async (params?: { type?: string; club_id?: number | string }): Promise<EventType[]> => {
  const { data } = await apiClient.get('/api/events', { params });
  return data;
};

export const getRequestedEvents = async (): Promise<EventType[]> => {
  const { data } = await apiClient.get('/api/events/requested');
  return data;
};

export const getEvent = async (id: number | string): Promise<EventType> => {
  const { data } = await apiClient.get(`/api/events/${id}`);
  return data;
};

export const createEvent = async (eventData: any): Promise<{ event_id: number }> => {
  const { data } = await apiClient.post('/api/events', eventData);
  return data;
};

export const deleteEvent = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/api/events/${id}`);
};

export const registerForEvent = async (id: number | string): Promise<void> => {
  await apiClient.post(`/api/events/${id}/register`);
};

export const cancelRegistration = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/api/events/${id}/register`);
};

export const getRegisteredStudents = async (id: number | string): Promise<User[]> => {
  const { data } = await apiClient.get(`/api/events/${id}/registered_students`);
  return data;
};

export const getAttendanceList = async (id: number | string): Promise<User[]> => {
  const { data } = await apiClient.get(`/api/events/${id}/attendance_list`);
  return data;
};

export const reportEvent = async (eventId: number | string, reason: string, details: string): Promise<void> => {
  await apiClient.post('/api/events/report', { event_id: eventId, reason, details });
};
