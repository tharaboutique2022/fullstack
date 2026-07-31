import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginInput, RegisterInput, UpdateProfileInput, ChangePasswordInput } from '@ecomm/shared/api.types';
import { authApi } from '@/api/auth';
import { cartApi } from '@/api/cart';
import { authKeys, cartKeys } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/apiClient';
import { clearToken, setToken } from '@/lib/authStorage';
import { clearGuestCart, getGuestCartLines, toMergeCartItems } from '@/lib/guestCart';

export { authKeys };

async function mergeGuestCartOnLogin(queryClient: QueryClient) {
  try {
    const guestLines = await getGuestCartLines();
    if (!guestLines.length) return;

    await cartApi.merge({ items: toMergeCartItems(guestLines) });
    await clearGuestCart();
    await queryClient.invalidateQueries({ queryKey: cartKeys.cart });
  } catch {
    // Guest cart merge is best-effort — do not block login
  }
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: async (data) => {
      await setToken(data.token);
      queryClient.setQueryData(authKeys.me, data.user);
      await mergeGuestCartOnLogin(queryClient);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: async (data) => {
      await setToken(data.token);
      queryClient.setQueryData(authKeys.me, data.user);
      await mergeGuestCartOnLogin(queryClient);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => authApi.updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authApi.changePassword(input),
  });
}

export async function logout(queryClient: QueryClient): Promise<void> {
  await clearToken();
  queryClient.clear();
}

export { getErrorMessage };
