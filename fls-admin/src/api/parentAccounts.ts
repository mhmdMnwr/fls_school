import { api } from '@/lib/api';

export interface ParentAccountInfo {
  id: string;
  username: string;
  password: string;
  studentId: string;
  createdAt?: string;
}

export const parentAccountsApi = {
  getByStudent: async (studentId: string): Promise<ParentAccountInfo | null> => {
    try {
      const res = await api.get<ParentAccountInfo>(
        `/students/${studentId}/parent-account`,
      );
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  createForStudent: async (studentId: string): Promise<ParentAccountInfo> => {
    const res = await api.post<ParentAccountInfo>(
      `/students/${studentId}/parent-account`,
    );
    return res.data;
  },

  resetPassword: async (studentId: string): Promise<ParentAccountInfo> => {
    const res = await api.post<ParentAccountInfo>(
      `/students/${studentId}/parent-account/reset-password`,
    );
    return res.data;
  },

  removeForStudent: async (studentId: string): Promise<void> => {
    await api.delete(`/students/${studentId}/parent-account`);
  },
};
