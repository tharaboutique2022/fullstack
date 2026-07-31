import type {
  AuthPayload,
  CategoryInput,
  LoginInput,
  PaginatedResult,
  Product,
  ProductCategory,
  ProductInput,
  ServiceProvider,
  ServiceCategory,
  ServiceProviderInput,
} from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const authApi = {
  login: (body: LoginInput) =>
    request<AuthPayload>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  me: () => request<AuthPayload['user']>('/api/auth/me'),
};

export const catalogApi = {
  productCategories: () => request<ProductCategory[]>('/api/admin/product-categories'),
  createProductCategory: (body: CategoryInput) =>
    request<ProductCategory>('/api/admin/product-categories', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProductCategory: (id: string, body: Partial<CategoryInput>) =>
    request<ProductCategory>(`/api/admin/product-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteProductCategory: (id: string) =>
    request<null>(`/api/admin/product-categories/${id}`, { method: 'DELETE' }),

  products: (params?: { page?: number; limit?: number; categoryId?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.categoryId) search.set('categoryId', params.categoryId);
    const query = search.toString();
    return request<PaginatedResult<Product>>(`/api/admin/products${query ? `?${query}` : ''}`);
  },
  createProduct: (body: ProductInput) =>
    request<Product>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProduct: (id: string, body: Partial<ProductInput>) =>
    request<Product>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteProduct: (id: string) =>
    request<null>(`/api/admin/products/${id}`, { method: 'DELETE' }),

  serviceCategories: () => request<ServiceCategory[]>('/api/admin/service-categories'),
  createServiceCategory: (body: CategoryInput) =>
    request<ServiceCategory>('/api/admin/service-categories', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateServiceCategory: (id: string, body: Partial<CategoryInput>) =>
    request<ServiceCategory>(`/api/admin/service-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteServiceCategory: (id: string) =>
    request<null>(`/api/admin/service-categories/${id}`, { method: 'DELETE' }),

  services: (params?: { page?: number; limit?: number; categoryId?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.categoryId) search.set('categoryId', params.categoryId);
    const query = search.toString();
    return request<PaginatedResult<ServiceProvider>>(
      `/api/admin/service-providers${query ? `?${query}` : ''}`
    );
  },
  createService: (body: ServiceProviderInput) =>
    request<ServiceProvider>('/api/admin/service-providers', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateService: (id: string, body: Partial<ServiceProviderInput>) =>
    request<ServiceProvider>(`/api/admin/service-providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteService: (id: string) =>
    request<null>(`/api/admin/service-providers/${id}`, { method: 'DELETE' }),
};
