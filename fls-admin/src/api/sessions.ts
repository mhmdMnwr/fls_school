import { api } from '@/lib/api';
import { Session, SessionDetail, UpcomingSession, Paginated } from '@/types/api';

export interface GetSessionsParams {
  groupId?: string;
  from?: string;
  to?: string;
  isFreeTrial?: boolean | string;
  page?: number;
  limit?: number;
}

export interface CreateSessionInput {
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
  isFreeTrial?: boolean;
}

export const sessionsApi = {
  getAll: async (params?: GetSessionsParams) => {
    const res = await api.get<Paginated<Session>>('/sessions', { params });
    return res.data;
  },
  getUpcoming: async (limit: number = 4) => {
    const res = await api.get<UpcomingSession[]>('/sessions/upcoming', {
      params: { limit },
    });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get<SessionDetail>(`/sessions/${id}`);
    return res.data;
  },
  create: async (data: CreateSessionInput) => {
    const res = await api.post<Session>('/sessions', data);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateSessionInput>) => {
    const res = await api.patch<Session>(`/sessions/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/sessions/${id}`);
    return res.data;
  },
};
