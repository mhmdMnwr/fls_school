import { api } from '@/lib/api';
import { Enrollment } from '@/types/api';

export const enrollmentsApi = {
  getAll: async (params?: { groupId?: string; studentId?: string }) => {
    const res = await api.get<Enrollment[]>('/enrollments', { params });
    return res.data;
  },
  create: async (data: { studentId: string; groupId: string }) => {
    const res = await api.post<Enrollment>('/enrollments', data);
    return res.data;
  },
  update: async (id: string, data: { isActive: boolean }) => {
    const res = await api.patch<Enrollment>(`/enrollments/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/enrollments/${id}`);
    return res.data;
  },
};
