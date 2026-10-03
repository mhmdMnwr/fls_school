import { api } from '@/lib/api';
import {
  DashboardStats,
  RecentStudent,
  ActivityLog,
  EnrollmentEvolution,
  StudentsByLevel,
  UpcomingSession,
} from '@/types/api';

export const dashboardApi = {
  getStats: async () => {
    const res = await api.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
  getRecentStudents: async (limit: number = 5) => {
    const res = await api.get<RecentStudent[]>('/dashboard/recent-students', {
      params: { limit },
    });
    return res.data;
  },
  getRecentActivities: async (limit: number = 5) => {
    const res = await api.get<ActivityLog[]>('/dashboard/recent-activities', {
      params: { limit },
    });
    return res.data;
  },
  getEnrollmentEvolution: async (year?: number) => {
    const res = await api.get<EnrollmentEvolution[]>('/dashboard/enrollment-evolution', {
      params: year ? { year } : {},
    });
    return res.data;
  },
  getStudentsByLevel: async () => {
    const res = await api.get<StudentsByLevel[]>('/dashboard/students-by-level');
    return res.data;
  },
  getUpcomingSessions: async (limit: number = 4) => {
    const res = await api.get<UpcomingSession[]>('/dashboard/upcoming-sessions', {
      params: { limit },
    });
    return res.data;
  },
};
