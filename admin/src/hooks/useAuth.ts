import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginInput } from '@ecomm/shared/api.types';
import { authApi } from '@/api/catalog';
import { getErrorMessage } from '@/lib/apiClient';
import { clearToken, setToken } from '@/lib/authStorage';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled: enabled && !!localStorage.getItem('ecomm_admin_token'),
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(authKeys.me, data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.clear();
    window.location.href = '/login';
  };
}

export { getErrorMessage };
