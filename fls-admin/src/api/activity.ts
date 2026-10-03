import { api } from '@/lib/api';
import { ActivityLog, Paginated } from '@/types/api';

export const activityApi = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get<Paginated<ActivityLog>>('/activity', { params });
    return res.data;
  },
};
