import apiClient from './client';
import type {
  AttendancePoint,
  DashboardStats,
  LogEntry,
  PendingEventApproval,
  Report,
  StudentRecord,
  UsagePoint,
} from '../types';

export const getAdminStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get('/api/admin/stats');
  return data;
};

export const getAdminReports = async (): Promise<Report[]> => {
  const { data } = await apiClient.get('/api/admin/report');
  return data;
};

export const getAttendanceOverview = async (): Promise<AttendancePoint[]> => {
  const { data } = await apiClient.get('/api/admin/attendance');
  return data;
};

export const getFacilitiesUsage = async (): Promise<UsagePoint[]> => {
  const { data } = await apiClient.get('/api/admin/facilities-usage');
  return data;
};

export const getPendingApprovals = async (): Promise<PendingEventApproval[]> => {
  const { data } = await apiClient.get('/api/admin/approvals/events');
  return data;
};

export const approvePendingEvent = async (
  eventId: number | string,
  payload: { status: 'approved' | 'rejected'; room_id?: number }
): Promise<void> => {
  await apiClient.patch(`/api/admin/approvals/events/${eventId}`, payload);
};

export const getAdminLogs = async (): Promise<LogEntry[]> => {
  const { data } = await apiClient.get('/api/admin/logs');
  return data;
};

export const createAdminUser = async (payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  user_name: string;
  phone: string;
  role: 'student' | 'admin';
  faculty?: string;
  major?: string;
  level?: string;
  picture?: string;
  in_dorms?: boolean;
}): Promise<{ message: string; user_id: string }> => {
  const { data } = await apiClient.post('/api/admin/users', payload);
  return data;
};

export const getAllStudents = async (): Promise<StudentRecord[]> => {
  const { data } = await apiClient.get('/api/users/students');
  return data;
};

export const banStudent = async (userId: number | string): Promise<void> => {
  await apiClient.patch(`/api/users/${userId}/ban`);
};
