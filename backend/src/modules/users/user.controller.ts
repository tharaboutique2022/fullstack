import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as userService from './user.service';

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const result = await userService.listCustomers({ page, limit, search });
  sendSuccess(res, result);
});
