import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody } from '../../utils/validatedRequest';
import type { AddressInput } from './address.validation';
import * as addressService from './address.service';

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await addressService.listAddresses(req.user!.id);
  sendSuccess(res, addresses, 'Addresses fetched successfully');
});

export const getDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.getDefaultAddress(req.user!.id);
  sendSuccess(res, address, 'Default address fetched successfully');
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.createAddress(
    req.user!.id,
    getValidatedBody<AddressInput>(req)
  );
  sendSuccess(res, address, 'Address created successfully', 201);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.updateAddress(
    req.user!.id,
    getRouteParam(req.params.id),
    getValidatedBody<Partial<AddressInput>>(req)
  );
  sendSuccess(res, address, 'Address updated successfully');
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  await addressService.deleteAddress(req.user!.id, getRouteParam(req.params.id));
  sendSuccess(res, null, 'Address deleted successfully');
});
