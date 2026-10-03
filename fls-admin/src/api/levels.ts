import { api } from '@/lib/api';
import { Level } from '@/types/api';

export const levelsApi = {
  getAll: async () => {
    const res = await api.get<Level[]>('/levels');
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get<Level>(`/levels/${id}`);
    return res.data;
  },
  create: async (data: { name: string; position?: number }) => {
    const res = await api.post<Level>('/levels', data);
    return res.data;
  },
  update: async (id: string, data: { name?: string; position?: number }) => {
    const res = await api.patch<Level>(`/levels/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/levels/${id}`);
    return res.data;
  },
};
