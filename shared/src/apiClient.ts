import type { ApiErrorResponse, ApiSuccessResponse } from './api.types';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorResponse['error']) {
    super(body.message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

export interface ApiRequestLog {
  method: string;
  path: string;
  url: string;
  hasAuth: boolean;
  body?: unknown;
}

export interface ApiResponseLog {
  method: string;
  path: string;
  url: string;
  status: number;
  durationMs: number;
  ok: boolean;
  code?: string;
  error?: string;
}

export interface ApiClientLogger {
  onRequest?: (log: ApiRequestLog) => void;
  onResponse?: (log: ApiResponseLog) => void;
}

export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void;
  logger?: ApiClientLogger;
}

function summarizeBody(body: RequestInit['body']): unknown {
  if (!body || typeof body !== 'string') {
    return undefined;
  }

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    const safe = { ...parsed };
    for (const key of ['password', 'token']) {
      if (key in safe) {
        safe[key] = '[redacted]';
      }
    }
    return safe;
  } catch {
    return '[non-json body]';
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { client: ApiClientOptions; timeoutMs?: number }
): Promise<T> {
  const { client, timeoutMs = 15000, ...init } = options;
  const method = (init.method ?? 'GET').toUpperCase();
  const url = `${client.baseUrl}${path}`;
  const startedAt = Date.now();
  const token = client.getToken ? await client.getToken() : null;

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  client.logger?.onRequest?.({
    method,
    path,
    url,
    hasAuth: Boolean(token),
    body: summarizeBody(init.body ?? null),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const durationMs = Date.now() - startedAt;
    let payload: ApiSuccessResponse<T> | ApiErrorResponse;

    try {
      payload = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;
    } catch {
      client.logger?.onResponse?.({
        method,
        path,
        url,
        status: response.status,
        durationMs,
        ok: false,
        error: 'Response was not valid JSON',
      });

      throw new ApiClientError(response.status, {
        code: 'INTERNAL_ERROR',
        message: 'Invalid API response',
      });
    }

    if (!response.ok || !payload.success) {
      if (!payload.success && response.status === 401) {
        client.onUnauthorized?.();
      }

      const errorBody =
        !payload.success
          ? payload.error
          : {
              code: 'INTERNAL_ERROR' as const,
              message: 'Unexpected API response',
            };

      client.logger?.onResponse?.({
        method,
        path,
        url,
        status: response.status,
        durationMs,
        ok: false,
        code: errorBody.code,
        error: errorBody.message,
      });

      if (!payload.success) {
        throw new ApiClientError(response.status, payload.error);
      }

      throw new ApiClientError(response.status, errorBody);
    }

    client.logger?.onResponse?.({
      method,
      path,
      url,
      status: response.status,
      durationMs,
      ok: true,
    });

    return payload.data;
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    if (error instanceof ApiClientError) {
      throw error;
    }

    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Request timed out. Check your network and API URL.'
        : error instanceof Error
          ? error.message
          : 'Network request failed';

    client.logger?.onResponse?.({
      method,
      path,
      url,
      status: 0,
      durationMs,
      ok: false,
      error: message,
    });

    throw new Error(message);
  } finally {
    clearTimeout(timeoutId);
  }
}
