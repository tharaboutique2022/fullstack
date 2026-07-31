import type {
  PaginatedResult,
  Product,
  ProductCategory,
  ProductCategoryKind,
  ServiceProvider,
  ServiceCategory,
} from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const catalogApi = {
  health: () => request<{ status: 'ok' }>('/health'),
  productCategories: (params?: { parentId?: string; rootsOnly?: boolean; kind?: ProductCategoryKind }) => {
    const search = new URLSearchParams();
    if (params?.parentId) search.set('parentId', params.parentId);
    if (params?.rootsOnly) search.set('rootsOnly', 'true');
    if (params?.kind) search.set('kind', params.kind);
    const query = search.toString();
    return request<ProductCategory[]>(`/api/categories/products${query ? `?${query}` : ''}`);
  },
  products: (params?: {
    search?: string;
    limit?: number;
    page?: number;
    categoryId?: string;
    departmentId?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
    brand?: string;
    stockStatus?: 'in_stock' | 'out_of_stock';
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const search = new URLSearchParams();
    search.set('limit', String(params?.limit ?? 50));
    if (params?.page) search.set('page', String(params.page));
    if (params?.search) search.set('search', params.search);
    if (params?.categoryId) search.set('categoryId', params.categoryId);
    if (params?.departmentId) search.set('departmentId', params.departmentId);
    if (params?.sort) search.set('sort', params.sort);
    if (params?.brand) search.set('brand', params.brand);
    if (params?.stockStatus) search.set('stockStatus', params.stockStatus);
    if (params?.minPrice != null) search.set('minPrice', String(params.minPrice));
    if (params?.maxPrice != null) search.set('maxPrice', String(params.maxPrice));
    return request<PaginatedResult<Product>>(`/api/products?${search.toString()}`);
  },
  product: (id: string) => request<Product>(`/api/products/${id}`),
  serviceCategories: () => request<ServiceCategory[]>('/api/categories/services'),
  serviceProviders: (params?: { categoryId?: string; limit?: number; search?: string }) => {
    const search = new URLSearchParams();
    if (params?.categoryId) search.set('categoryId', params.categoryId);
    if (params?.search) search.set('search', params.search);
    search.set('limit', String(params?.limit ?? 20));
    const query = search.toString();
    return request<PaginatedResult<ServiceProvider>>(`/api/service-providers?${query}`);
  },
  serviceProvider: (id: string) => request<ServiceProvider>(`/api/service-providers/${id}`),
  /** @deprecated Use serviceProviders */
  services: () => request<PaginatedResult<ServiceProvider>>('/api/services?limit=20'),
};
