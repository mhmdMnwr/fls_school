import { api } from '@/lib/api';
import { Student, StudentDetail, Paginated } from '@/types/api';

export interface GetStudentsParams {
  search?: string;
  classId?: string;
  levelId?: string;
  isActive?: boolean | string;
  origin?: 'ADMIN' | 'WEBSITE';
  page?: number;
  limit?: number;
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  schoolClassId?: string | null;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export const studentsApi = {
  getAll: async (params?: GetStudentsParams) => {
    const res = await api.get<Paginated<Student>>('/students', { params });
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get<StudentDetail>(`/students/${id}`);
    return res.data;
  },
  create: async (data: CreateStudentInput) => {
    const res = await api.post<Student>('/students', data);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateStudentInput>) => {
    const res = await api.patch<Student>(`/students/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  },
};
