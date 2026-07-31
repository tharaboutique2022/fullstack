import { ApiClientError, apiRequest } from '@ecomm/shared/apiClient';
import type { ApiClientOptions } from '@ecomm/shared/apiClient';
import { env } from '@/config/env';
import { clearToken, getToken } from '@/lib/authStorage';

export { ApiClientError };

export const apiClient: ApiClientOptions = {
  baseUrl: env.apiBaseUrl,
  getToken,
  onUnauthorized: () => {
    clearToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  },
};

export function request<T>(path: string, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, { ...init, client: apiClient });
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.details) {
      const firstField = Object.values(error.details)[0]?.[0];
      if (firstField) return firstField;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}
