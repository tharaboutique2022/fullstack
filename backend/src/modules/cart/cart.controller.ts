import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody } from '../../utils/validatedRequest';
import * as cartService from './cart.service';
import type { AddCartItemInput, MergeCartInput, UpdateCartItemInput } from './cart.validation';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);
  sendSuccess(res, cart, 'Cart fetched successfully');
});

export const addCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.addCartItem(req.user!.id, getValidatedBody<AddCartItemInput>(req));
  sendSuccess(res, cart, 'Item added to cart', 201);
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.updateCartItem(
    req.user!.id,
    getRouteParam(req.params.id),
    getValidatedBody<UpdateCartItemInput>(req)
  );
  sendSuccess(res, cart, 'Cart item updated successfully');
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeCartItem(req.user!.id, getRouteParam(req.params.id));
  sendSuccess(res, cart, 'Cart item removed successfully');
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.clearCart(req.user!.id);
  sendSuccess(res, cart, 'Cart cleared successfully');
});

export const mergeCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.mergeGuestCart(
    req.user!.id,
    getValidatedBody<MergeCartInput>(req).items
  );
  sendSuccess(res, cart, 'Guest cart merged successfully');
});
