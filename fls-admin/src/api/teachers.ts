import { api } from '@/lib/api';
import { Teacher, TeacherDetail, Paginated } from '@/types/api';

export interface GetTeachersParams {
  search?: string;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
}

export interface CreateTeacherInput {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export const teachersApi = {
  getAll: async (params?: GetTeachersParams) => {
    const res = await api.get<Paginated<Teacher>>('/teachers', { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get<TeacherDetail>(`/teachers/${id}`);
    return res.data;
  },
  create: async (data: CreateTeacherInput) => {
    const res = await api.post<Teacher>('/teachers', data);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateTeacherInput>) => {
    const res = await api.patch<Teacher>(`/teachers/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/teachers/${id}`);
    return res.data;
  },
};
