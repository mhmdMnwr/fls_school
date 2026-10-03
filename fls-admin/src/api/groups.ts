import { api } from '@/lib/api';
import { StudyGroup, StudyGroupDetail, Paginated, StudyTimeSlot } from '@/types/api';

export interface GetGroupsParams {
  subjectId?: string;
  teacherId?: string;
  classId?: string;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
}

export interface CreateGroupInput {
  subjectId: string;
  teacherId: string;
  name?: string;
  isActive?: boolean;
  studyTime?: StudyTimeSlot[];
}

export const groupsApi = {
  getAll: async (params?: GetGroupsParams) => {
    const res = await api.get<Paginated<StudyGroup>>('/groups', { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get<StudyGroupDetail>(`/groups/${id}`);
    return res.data;
  },
  create: async (data: CreateGroupInput) => {
    const res = await api.post<StudyGroup>('/groups', data);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateGroupInput>) => {
    const res = await api.patch<StudyGroup>(`/groups/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/groups/${id}`);
    return res.data;
  },
};
