import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody } from '../../utils/validatedRequest';
import * as reviewService from './review.service';

export const createProductReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createProductReview(req.user!.id, getValidatedBody(req));
  sendSuccess(res, review, 'Review submitted', 201);
});

export const createServiceReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createServiceReview(req.user!.id, getValidatedBody(req));
  sendSuccess(res, review, 'Review submitted', 201);
});

export const listProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await reviewService.listProductReviews(getRouteParam(req.params.productId));
  sendSuccess(res, reviews);
});

export const listProviderReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await reviewService.listProviderReviews(getRouteParam(req.params.providerId));
  sendSuccess(res, reviews);
});
