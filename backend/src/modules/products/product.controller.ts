import type { Request, Response } from 'express';
import * as productService from './product.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody, getValidatedQuery } from '../../utils/validatedRequest';
import type { CategoryInput, ListCatalogQuery, ListCategoriesQuery, ProductInput } from '../catalog/catalog.validation';

function isPublicRoute(req: Request): boolean {
  return req.originalUrl.startsWith('/api/categories') || req.originalUrl.startsWith('/api/products');
}

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<ListCategoriesQuery>(req) ?? {};
  const publicRoute = isPublicRoute(req);
  const categories = await productService.listProductCategories({
    activeOnly: publicRoute,
    parentId: query.parentId,
    rootsOnly: query.rootsOnly,
    // Shop grid in the app = root departments only
    kind: publicRoute && query.rootsOnly ? 'department' : query.kind,
  });
  sendSuccess(res, categories, 'Product categories fetched successfully');
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await productService.createProductCategory(getValidatedBody<CategoryInput>(req));
  sendSuccess(res, category, 'Product category created successfully', 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await productService.updateProductCategory(
    getRouteParam(req.params.id),
    getValidatedBody<Partial<CategoryInput>>(req)
  );
  sendSuccess(res, category, 'Product category updated successfully');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProductCategory(getRouteParam(req.params.id));
  sendSuccess(res, null, 'Product category deleted successfully');
});

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<ListCatalogQuery>(req);
  const result = await productService.listProducts({
    categoryId: query.categoryId,
    departmentId: query.departmentId,
    search: query.search,
    sort: query.sort,
    activeOnly: isPublicRoute(req),
    page: query.page,
    limit: query.limit,
  });

  sendSuccess(res, result, 'Products fetched successfully', 200, {
    pagination: result.pagination,
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(getRouteParam(req.params.id), {
    activeOnly: isPublicRoute(req),
  });
  sendSuccess(res, product, 'Product fetched successfully');
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(getValidatedBody<ProductInput>(req));
  sendSuccess(res, product, 'Product created successfully', 201);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(
    getRouteParam(req.params.id),
    getValidatedBody<Partial<ProductInput>>(req)
  );
  sendSuccess(res, product, 'Product updated successfully');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(getRouteParam(req.params.id));
  sendSuccess(res, null, 'Product deleted successfully');
});
