import type { UserRole } from '@ecomm/shared';
import type { ApiErrorResponse, ApiSuccessResponse } from '@ecomm/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: UserRole;
        createdAt: Date;
      };
      validatedQuery?: unknown;
      validatedBody?: unknown;
      requestId?: string;
    }

    interface Locals {
      requestId?: string;
      responsePayload?: ApiSuccessResponse | ApiErrorResponse;
    }
  }
}

export {};
