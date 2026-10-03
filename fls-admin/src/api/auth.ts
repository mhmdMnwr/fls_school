import { api } from '@/lib/api';
import { AdminUser } from '@/hooks/useAuth';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ accessToken: string; admin: AdminUser }>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },
  me: async () => {
    const res = await api.get<AdminUser>('/auth/me');
    return res.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.patch<{ success: boolean }>('/auth/password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
