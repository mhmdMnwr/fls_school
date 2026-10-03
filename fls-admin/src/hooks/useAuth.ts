import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken, setToken, removeToken, hasToken } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export interface AdminUser {
  id: string;
  email: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const authenticated = hasToken();

  const {
    data: admin,
    isLoading: isLoadingAdmin,
    isError,
  } = useQuery<AdminUser>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get<AdminUser>('/auth/me');
      return res.data;
    },
    enabled: authenticated,
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await api.post<{ accessToken: string; admin: AdminUser }>('/auth/login', {
        email,
        password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.admin);
    },
  });

  const logout = () => {
    removeToken();
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  return {
    admin,
    token: getToken(),
    isAuthenticated: authenticated && !isError,
    isLoading: authenticated && isLoadingAdmin,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
}

export default useAuth;
