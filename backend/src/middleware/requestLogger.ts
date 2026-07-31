import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import type { ApiErrorResponse, ApiSuccessResponse } from '@ecomm/shared';
import { logger } from '../utils/logger';

const SENSITIVE_PATHS = ['/api/auth/login', '/api/auth/register'];

type ApiPayload = ApiSuccessResponse | ApiErrorResponse;

function shouldLogBody(path: string): boolean {
  return !SENSITIVE_PATHS.some((item) => path.startsWith(item));
}

function summarizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const record = { ...(body as Record<string, unknown>) };
  for (const key of ['password', 'passwordHash', 'token']) {
    if (key in record) {
      record[key] = '[redacted]';
    }
  }

  return record;
}

function captureResponsePayload(res: Response): void {
  const originalJson = res.json.bind(res);

  res.json = function jsonWithCapture(body: ApiPayload) {
    res.locals.responsePayload = body;
    return originalJson(body);
  };
}

function getErrorDetails(payload: ApiPayload | undefined) {
  if (!payload || payload.success) {
    return undefined;
  }

  return {
    code: payload.error.code,
    message: payload.error.message,
    details: payload.error.details,
  };
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID().slice(0, 8);
  req.requestId = requestId;
  res.locals.requestId = requestId;
  const startedAt = Date.now();

  captureResponsePayload(res);

  logger.http(`→ ${req.method} ${req.originalUrl}`, {
    requestId,
    ip: req.ip,
    userAgent: req.get('user-agent') ?? undefined,
    body: shouldLogBody(req.originalUrl) ? summarizeBody(req.body) : '[redacted]',
  });

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const errorDetails = getErrorDetails(res.locals.responsePayload);
    const status = res.statusCode;
    const baseMeta = {
      requestId,
      status,
      durationMs: `${durationMs}ms`,
      userId: req.user?.id,
      role: req.user?.role,
    };

    if (status >= 500) {
      logger.error(`✗ ${req.method} ${req.originalUrl}`, {
        ...baseMeta,
        ...errorDetails,
      });
      return;
    }

    if (status >= 400) {
      logger.warn(`✗ ${req.method} ${req.originalUrl}`, {
        ...baseMeta,
        ...errorDetails,
      });
      return;
    }

    logger.http(`← ${req.method} ${req.originalUrl}`, baseMeta);
  });

  next();
}
