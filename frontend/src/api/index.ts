import { apiClient } from './client.ts';
import {
  User,
  Student,
  Teacher,
  Department,
  AcademicSession,
  StudentIdCard,
  IdCardApplication,
  VerificationLog,
  AuditLog,
  Notification,
  Institute,
} from '../types/index.ts';

// Auth API
export const authApi = {
  login: (credentials: any) => apiClient.post<{ user: User; accessToken: string }>('/auth/login', credentials),
  signup: (data: any) => apiClient.post<{ user: User; accessToken: string }>('/auth/signup', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get<{ user: User }>('/auth/me'),
};

// Students API
export const studentApi = {
  list: (params?: any) => apiClient.get<{ students: Student[]; pagination: any }>('/students', params),
  getById: (id: string) => apiClient.get<{ student: Student }>(`/students/${id}`),
  create: (data: any) => apiClient.post<{ student: Student }>('/students', data),
  update: (id: string, data: any) => apiClient.put<{ student: Student }>(`/students/${id}`, data),
  delete: (id: string) => apiClient.delete(`/students/${id}`),
};

// ID Cards API
export const idCardApi = {
  list: (params?: any) => apiClient.get<{ cards: StudentIdCard[]; pagination: any }>('/id-cards', params),
  getById: (id: string) => apiClient.get<{ card: StudentIdCard }>(`/id-cards/${id}`),
  getMyActiveCard: () => apiClient.get<{ card: StudentIdCard }>('/id-cards/student/active'),
  getMyCard: () => apiClient.get<{ card: StudentIdCard }>('/id-cards/student/active'),
  create: (data: any) => apiClient.post<{ card: StudentIdCard }>('/id-cards', data),
  replace: (id: string, data: { reason: string }) => apiClient.post<{ card: StudentIdCard }>(`/id-cards/${id}/replace`, data),
  revoke: (id: string, data: { reason: string }) => apiClient.post<{ card: StudentIdCard }>(`/id-cards/${id}/revoke`, data),
};

// Verification API (Public & Admin Logs)
export const verificationApi = {
  verifyPublic: (token: string) => apiClient.get<any>(`/verify/${token}`),
  listLogs: (params?: any) => apiClient.get<{ logs: VerificationLog[]; total: number }>('/verification-logs', params),
};

// Departments API
export const departmentApi = {
  list: () => apiClient.get<{ departments: Department[] }>('/departments'),
  getById: (id: string) => apiClient.get<{ department: Department }>(`/departments/${id}`),
  create: (data: any) => apiClient.post<{ department: Department }>('/departments', data),
  update: (id: string, data: any) => apiClient.put<{ department: Department }>(`/departments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/departments/${id}`),
};

// Sessions API
export const sessionApi = {
  list: () => apiClient.get<{ sessions: AcademicSession[] }>('/sessions'),
  create: (data: any) => apiClient.post<{ session: AcademicSession }>('/sessions', data),
  update: (id: string, data: any) => apiClient.put<{ session: AcademicSession }>(`/sessions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sessions/${id}`),
};

// Teachers API
export const teacherApi = {
  list: () => apiClient.get<{ teachers: Teacher[] }>('/teachers'),
  getById: (id: string) => apiClient.get<{ teacher: Teacher }>(`/teachers/${id}`),
  create: (data: any) => apiClient.post<{ teacher: Teacher }>('/teachers', data),
  update: (id: string, data: any) => apiClient.put<{ teacher: Teacher }>(`/teachers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/teachers/${id}`),
};

// Applications API
export const applicationApi = {
  list: (params?: any) => apiClient.get<{ applications: IdCardApplication[]; total: number }>('/id-card-applications', params),
  listMy: (params?: any) => apiClient.get<{ applications: IdCardApplication[]; total: number }>('/id-card-applications', params),
  create: (data: any) => apiClient.post<{ application: IdCardApplication }>('/id-card-applications', data),
  approve: (id: string) => apiClient.patch<{ application: IdCardApplication }>(`/id-card-applications/${id}/approve`),
  reject: (id: string) => apiClient.patch<{ application: IdCardApplication }>(`/id-card-applications/${id}/reject`),
};

// Notifications API
export const notificationApi = {
  list: () => apiClient.get<{ notifications: Notification[] }>('/notifications'),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};

// Audit Logs API
export const auditApi = {
  list: (params?: any) => apiClient.get<{ logs: AuditLog[]; total: number }>('/audit-logs', params),
};

// Institutes API
export const instituteApi = {
  list: () => apiClient.get<{ institutes: Institute[] }>('/institutes'),
  getById: (id: string) => apiClient.get<{ institute: Institute }>(`/institutes/${id}`),
  create: (data: any) => apiClient.post<{ institute: Institute }>('/institutes', data),
  update: (id: string, data: any) => apiClient.put<{ institute: Institute }>(`/institutes/${id}`, data),
};

// Stats API
export const statsApi = {
  getDashboardStats: () => apiClient.get<any>('/stats/dashboard'),
};
