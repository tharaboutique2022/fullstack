import type { Request, Response } from 'express';
import * as providerService from './provider.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody, getValidatedQuery } from '../../utils/validatedRequest';
import type { CategoryInput, ListCatalogQuery } from '../catalog/catalog.validation';
import type { ServiceProviderInput } from './provider.validation';

function isPublicRoute(req: Request): boolean {
  return (
    req.originalUrl.startsWith('/api/categories') ||
    req.originalUrl.startsWith('/api/service-providers')
  );
}

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await providerService.listServiceCategories({
    activeOnly: isPublicRoute(req),
  });
  sendSuccess(res, categories, 'Service categories fetched successfully');
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await providerService.createServiceCategory(getValidatedBody<CategoryInput>(req));
  sendSuccess(res, category, 'Service category created successfully', 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await providerService.updateServiceCategory(
    getRouteParam(req.params.id),
    getValidatedBody<Partial<CategoryInput>>(req)
  );
  sendSuccess(res, category, 'Service category updated successfully');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await providerService.deleteServiceCategory(getRouteParam(req.params.id));
  sendSuccess(res, null, 'Service category deleted successfully');
});

export const listProviders = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<ListCatalogQuery>(req);
  const result = await providerService.listServiceProviders({
    categoryId: query.categoryId,
    search: query.search,
    activeOnly: isPublicRoute(req),
    page: query.page,
    limit: query.limit,
  });

  sendSuccess(res, result, 'Service providers fetched successfully', 200, {
    pagination: result.pagination,
  });
});

export const getProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await providerService.getServiceProviderById(getRouteParam(req.params.id), {
    activeOnly: isPublicRoute(req),
    admin: !isPublicRoute(req),
  });
  sendSuccess(res, provider, 'Service provider fetched successfully');
});

export const listProviderTimeSlots = asyncHandler(async (req: Request, res: Response) => {
  const slots = await providerService.listProviderTimeSlots(getRouteParam(req.params.id), {
    activeOnly: isPublicRoute(req),
  });
  sendSuccess(res, slots, 'Time slots fetched successfully');
});

export const createProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await providerService.createServiceProvider(
    getValidatedBody<ServiceProviderInput>(req)
  );
  sendSuccess(res, provider, 'Service provider created successfully', 201);
});

export const updateProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await providerService.updateServiceProvider(
    getRouteParam(req.params.id),
    getValidatedBody<Partial<ServiceProviderInput>>(req)
  );
  sendSuccess(res, provider, 'Service provider updated successfully');
});

export const deleteProvider = asyncHandler(async (req: Request, res: Response) => {
  await providerService.deleteServiceProvider(getRouteParam(req.params.id));
  sendSuccess(res, null, 'Service provider deleted successfully');
});

/** @deprecated Use listProviders */
export const listServices = listProviders;

/** @deprecated Use getProvider */
export const getService = getProvider;

/** @deprecated Use createProvider */
export const createService = createProvider;

/** @deprecated Use updateProvider */
export const updateService = updateProvider;

/** @deprecated Use deleteProvider */
export const deleteService = deleteProvider;
