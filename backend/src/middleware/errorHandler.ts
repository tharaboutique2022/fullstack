import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

function logHandledError(
  req: Request,
  level: 'warn' | 'error',
  label: string,
  meta: Record<string, unknown>
): void {
  const log = level === 'error' ? logger.error : logger.warn;
  log(label, {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    ...meta,
  });
}

export function notFoundHandler(req: Request, res: Response): Response {
  logHandledError(req, 'warn', 'Route not found', {});

  return sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): Response {
  if (err instanceof AppError) {
    logHandledError(req, err.statusCode >= 500 ? 'error' : 'warn', `AppError: ${err.code}`, {
      status: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
    });

    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  if (err instanceof ZodError) {
    const details = Object.fromEntries(
      Object.entries(err.flatten().fieldErrors).filter(([, value]) => value !== undefined)
    ) as Record<string, string[]>;

    logHandledError(req, 'warn', 'Validation failed', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details,
    });

    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logHandledError(req, 'warn', 'Database error', {
      status: err.code === 'P2002' ? 409 : err.code === 'P2025' ? 404 : 500,
      prismaCode: err.code,
      message: err.message,
      meta: err.meta,
    });

    if (err.code === 'P2002') {
      return sendError(res, 'A record with this value already exists', 409, 'CONFLICT');
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Record not found', 404, 'NOT_FOUND');
    }
  }

  if (err instanceof SyntaxError && 'body' in err) {
    logHandledError(req, 'warn', 'Invalid JSON body', {
      status: 400,
      message: err.message,
    });

    return sendError(res, 'Invalid JSON body', 400, 'BAD_REQUEST');
  }

  logHandledError(req, 'error', 'Unhandled server error', {
    status: 500,
    message: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
  });

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Internal server error';

  return sendError(res, message, 500, 'INTERNAL_ERROR');
}

export function validate<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
}
