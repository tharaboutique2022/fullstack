import type { Request, Response } from 'express';
import { AppError } from '../../errors/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getRouteParam } from '../../utils/routeParams';
import * as notificationService from './notification.service';

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const items = await notificationService.listNotifications(req.user!.id);
  sendSuccess(res, items);
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.getUnreadCount(req.user!.id);
  sendSuccess(res, result);
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const item = await notificationService.markNotificationRead(
    req.user!.id,
    getRouteParam(req.params.id)
  );
  if (!item) {
    throw AppError.notFound('Notification not found');
  }
  sendSuccess(res, item, 'Notification marked as read');
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllNotificationsRead(req.user!.id);
  sendSuccess(res, null, 'All notifications marked as read');
});
