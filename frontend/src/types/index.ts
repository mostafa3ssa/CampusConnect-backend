export type Role = 'student' | 'club_manager' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
  user_name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Club {
  id: number;
  name: string;
  description: string;
  email: string;
  logo: string;
  cover: string;
  followers_count: number;
  members?: number;
  event_number: number;
  sessions_number?: number;
  posts_number?: number;
  club_admin_name: string;
  status?: string;
  is_joined: boolean;
}

export interface EventType {
  event_id: number;
  type: 'event' | 'session';
  club_name?: string;
  club_logo_url?: string;
  club_cover_url?: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  regestrations?: number;
  max_regestrations: number;
  status?: 'pending' | 'scheduled' | 'cancelled' | 'approved' | 'rejected';
  is_registered?: boolean;
}

export interface Comment {
  student_name: string;
  student_image_url?: string;
  content: string;
  created_at: string;
}

export interface Post {
  post_id: number;
  club_id: number;
  event_id?: number;
  content: string;
  image_url?: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  comments?: Comment[];
}

export interface Room {
  id: number;
  name: string | number;
  room_number: number;
  building_name: string;
  capacity: number;
  type: string;
  status: 'available' | 'maintenance';
  start_time: number;
  end_time: number;
  resources: string[];
}

export interface Facility {
  facility_id: number;
  name: string;
  type: 'gym' | 'playground';
  location_description: string;
  min_capacity: number;
  max_capacity: number;
  status: 'available' | 'closed' | 'under_maintenance';
}

export interface Report {
  student_id: number;
  report_id: number;
  report_type: 'club' | 'event' | 'room' | 'facility';
  status: 'open' | 'in_progress' | 'resolved';
  details: string;
  reason: string;
  created_at: string;
}

export interface StudentRecord {
  student_id: string;
  student_name: string;
  faculty: string;
  major: string;
  student_email: string;
  status: 'active' | 'banned';
  reservations: number;
  complaints: number;
}

export interface DashboardStats {
  total_students: number;
  active_clubs: number;
  active_events: number;
  active_sessions: number;
  reserved_rooms: number;
  reserved_facilities: number;
}

export interface AttendancePoint {
  month: string;
  events: number;
  sessions: number;
}

export interface UsagePoint {
  type: 'room' | 'gym' | 'playground';
  value: number;
}

export interface PendingEventApproval {
  event_id: number;
  club_name: string;
  club_logo_url?: string;
  type: 'event' | 'session';
  description: string;
  start_time: string;
  end_time: string;
  max_registerations: number;
}

export interface LogEntry {
  ip_address: string;
  user_type: string;
  record_id: string;
  edited_table: string;
  action: string;
  changed_by: string;
  timestamp: string;
}
