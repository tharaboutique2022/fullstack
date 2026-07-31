import type { ApiErrorResponse, ApiMeta, ApiSuccessResponse, PaginationMeta } from '@ecomm/shared';
import type { Response } from 'express';

function buildMeta(extra?: Partial<ApiMeta & { pagination?: PaginationMeta }>): ApiMeta & {
  pagination?: PaginationMeta;
} {
  return {
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Partial<ApiMeta & { pagination?: PaginationMeta }>
): Response<ApiSuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: buildMeta(meta),
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code: ApiErrorResponse['error']['code'] = 'INTERNAL_ERROR',
  details?: Record<string, string[]>
): Response<ApiErrorResponse> {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    meta: buildMeta(),
  });
}
