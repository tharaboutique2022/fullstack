import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody } from '../../utils/validatedRequest';
import * as wishlistService from './wishlist.service';

export const listWishlist = asyncHandler(async (req: Request, res: Response) => {
  const items = await wishlistService.listWishlist(req.user!.id);
  sendSuccess(res, items);
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = getValidatedBody<{ productId: string }>(req);
  const item = await wishlistService.addToWishlist(req.user!.id, productId);
  sendSuccess(res, item, 'Added to wishlist', 201);
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  await wishlistService.removeFromWishlist(req.user!.id, getRouteParam(req.params.productId));
  sendSuccess(res, null, 'Removed from wishlist');
});

export const getWishlistStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await wishlistService.isProductWishlisted(
    req.user!.id,
    getRouteParam(req.params.productId)
  );
  sendSuccess(res, status);
});
