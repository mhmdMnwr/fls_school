import { api } from '@/lib/api';
import { Subject, Paginated } from '@/types/api';

export interface GetSubjectsParams {
  classId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const subjectsApi = {
  getAll: async (params?: GetSubjectsParams) => {
    const res = await api.get<Paginated<Subject>>('/subjects', { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get<Subject>(`/subjects/${id}`);
    return res.data;
  },
  create: async (data: { schoolClassId: string; name: string }) => {
    const res = await api.post<Subject>('/subjects', data);
    return res.data;
  },
  update: async (id: string, data: { schoolClassId?: string; name?: string }) => {
    const res = await api.patch<Subject>(`/subjects/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  },
};
