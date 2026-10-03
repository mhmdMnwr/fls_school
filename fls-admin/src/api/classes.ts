import { api } from '@/lib/api';
import { SchoolClass } from '@/types/api';

export const classesApi = {
  getAll: async (levelId?: string) => {
    const res = await api.get<SchoolClass[]>('/classes', {
      params: levelId ? { levelId } : {},
    });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get<SchoolClass>(`/classes/${id}`);
    return res.data;
  },
  create: async (data: { levelId: string; name: string }) => {
    const res = await api.post<SchoolClass>('/classes', data);
    return res.data;
  },
  update: async (id: string, data: { levelId?: string; name?: string }) => {
    const res = await api.patch<SchoolClass>(`/classes/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/classes/${id}`);
    return res.data;
  },
};
