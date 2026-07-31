import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CategoryInput, ProductInput, ServiceProviderInput } from '@ecomm/shared/api.types';
import { catalogApi } from '@/api/catalog';

export const catalogKeys = {
  productCategories: ['productCategories'] as const,
  products: (params?: { page?: number; categoryId?: string }) =>
    ['products', params] as const,
  serviceCategories: ['serviceCategories'] as const,
  services: (params?: { page?: number; categoryId?: string }) =>
    ['services', params] as const,
};

export function useProductCategories() {
  return useQuery({
    queryKey: catalogKeys.productCategories,
    queryFn: catalogApi.productCategories,
  });
}

export function useProducts(params?: { page?: number; categoryId?: string }) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogApi.products({ ...params, limit: 20 }),
  });
}

export function useServiceCategories() {
  return useQuery({
    queryKey: catalogKeys.serviceCategories,
    queryFn: catalogApi.serviceCategories,
  });
}

export function useServices(params?: { page?: number; categoryId?: string }) {
  return useQuery({
    queryKey: catalogKeys.services(params),
    queryFn: () => catalogApi.services({ ...params, limit: 20 }),
  });
}

function invalidateProductCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: catalogKeys.productCategories });
  queryClient.invalidateQueries({ queryKey: ['products'] });
}

function invalidateServiceCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: catalogKeys.serviceCategories });
  queryClient.invalidateQueries({ queryKey: ['services'] });
}

export function useProductCategoryMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CategoryInput) => catalogApi.createProductCategory(body),
    onSuccess: () => invalidateProductCatalog(queryClient),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CategoryInput> }) =>
      catalogApi.updateProductCategory(id, body),
    onSuccess: () => invalidateProductCatalog(queryClient),
  });

  const remove = useMutation({
    mutationFn: (id: string) => catalogApi.deleteProductCategory(id),
    onSuccess: () => invalidateProductCatalog(queryClient),
  });

  return { create, update, remove };
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (body: ProductInput) => catalogApi.createProduct(body),
    onSuccess: () => invalidateProductCatalog(queryClient),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ProductInput> }) =>
      catalogApi.updateProduct(id, body),
    onSuccess: () => invalidateProductCatalog(queryClient),
  });

  const remove = useMutation({
    mutationFn: (id: string) => catalogApi.deleteProduct(id),
    onSuccess: () => invalidateProductCatalog(queryClient),
  });

  return { create, update, remove };
}

export function useServiceCategoryMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CategoryInput) => catalogApi.createServiceCategory(body),
    onSuccess: () => invalidateServiceCatalog(queryClient),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CategoryInput> }) =>
      catalogApi.updateServiceCategory(id, body),
    onSuccess: () => invalidateServiceCatalog(queryClient),
  });

  const remove = useMutation({
    mutationFn: (id: string) => catalogApi.deleteServiceCategory(id),
    onSuccess: () => invalidateServiceCatalog(queryClient),
  });

  return { create, update, remove };
}

export function useServiceMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (body: ServiceProviderInput) => catalogApi.createService(body),
    onSuccess: () => invalidateServiceCatalog(queryClient),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ServiceProviderInput> }) =>
      catalogApi.updateService(id, body),
    onSuccess: () => invalidateServiceCatalog(queryClient),
  });

  const remove = useMutation({
    mutationFn: (id: string) => catalogApi.deleteService(id),
    onSuccess: () => invalidateServiceCatalog(queryClient),
  });

  return { create, update, remove };
}
