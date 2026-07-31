import type {
  AuthPayload,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  User,
} from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const authApi = {
  login: (input: LoginInput) =>
    request<AuthPayload>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  register: (input: RegisterInput) =>
    request<AuthPayload>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  me: () => request<User>('/api/auth/me'),
  updateProfile: (body: UpdateProfileInput) =>
    request<User>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
  forgotPassword: (email: string) =>
    request<{ message: string; devOtp?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (body: { email: string; otp: string; password: string }) =>
    request<null>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  changePassword: (body: ChangePasswordInput) =>
    request<null>('/api/auth/me/password', { method: 'PATCH', body: JSON.stringify(body) }),
};
