import { useQuery } from '@tanstack/react-query';
import type { ProductCategoryKind } from '@ecomm/shared/api.types';
import { catalogApi } from '@/api/catalog';

export const catalogKeys = {
  health: ['health'] as const,
  productCategories: (params?: { parentId?: string; rootsOnly?: boolean; kind?: ProductCategoryKind }) =>
    ['productCategories', params] as const,
  rootProductCategories: ['rootProductCategories'] as const,
  categoryChildren: (parentId: string) => ['categoryChildren', parentId] as const,
  products: ['products'] as const,
  categoryProducts: (params: {
    categoryId: string;
    departmentId?: string;
    sort?: string;
    brand?: string;
    stockStatus?: 'in_stock' | 'out_of_stock';
    minPrice?: number;
    maxPrice?: number;
  }) => ['categoryProducts', params] as const,
  product: (id: string) => ['product', id] as const,
  serviceCategories: ['serviceCategories'] as const,
  services: ['services'] as const,
  serviceProviders: (categoryId?: string) => ['serviceProviders', categoryId] as const,
  serviceProvider: (id: string) => ['serviceProvider', id] as const,
  searchProducts: (query: string) => ['searchProducts', query] as const,
  searchProviders: (query: string) => ['searchProviders', query] as const,
  discoverProducts: ['discoverProducts'] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: catalogKeys.health,
    queryFn: catalogApi.health,
  });
}

export function useProductCategories(params?: {
  parentId?: string;
  rootsOnly?: boolean;
  kind?: ProductCategoryKind;
}) {
  return useQuery({
    queryKey: catalogKeys.productCategories(params),
    queryFn: () => catalogApi.productCategories(params),
  });
}

export function useRootProductCategories() {
  return useQuery({
    queryKey: catalogKeys.rootProductCategories,
    queryFn: () => catalogApi.productCategories({ rootsOnly: true }),
  });
}

export function useCategoryChildren(parentId: string) {
  return useQuery({
    queryKey: catalogKeys.categoryChildren(parentId),
    queryFn: () => catalogApi.productCategories({ parentId }),
    enabled: !!parentId,
  });
}

export function useCategoryProducts(params: {
  categoryId: string;
  departmentId?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  brand?: string;
  stockStatus?: 'in_stock' | 'out_of_stock';
  minPrice?: number;
  maxPrice?: number;
}) {
  return useQuery({
    queryKey: catalogKeys.categoryProducts(params),
    queryFn: () =>
      catalogApi.products({
        categoryId: params.categoryId,
        departmentId: params.departmentId,
        sort: params.sort,
        brand: params.brand,
        stockStatus: params.stockStatus,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        limit: 50,
      }),
    enabled: !!params.categoryId,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: catalogKeys.products,
    queryFn: () => catalogApi.products(),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: catalogKeys.product(id),
    queryFn: () => catalogApi.product(id),
    enabled: !!id,
  });
}

export function useServiceCategories() {
  return useQuery({
    queryKey: catalogKeys.serviceCategories,
    queryFn: catalogApi.serviceCategories,
  });
}

export function useServices() {
  return useQuery({
    queryKey: catalogKeys.services,
    queryFn: catalogApi.services,
  });
}

export function useServiceProviders(categoryId?: string) {
  return useQuery({
    queryKey: catalogKeys.serviceProviders(categoryId),
    queryFn: () => catalogApi.serviceProviders({ categoryId, limit: 20 }),
    enabled: !!categoryId,
  });
}

export function useServiceProvider(id: string) {
  return useQuery({
    queryKey: catalogKeys.serviceProvider(id),
    queryFn: () => catalogApi.serviceProvider(id),
    enabled: !!id,
  });
}

export function useDepartmentProducts(departmentId?: string) {
  return useQuery({
    queryKey: ['departmentProducts', departmentId],
    queryFn: () => catalogApi.products({ categoryId: departmentId, limit: 8 }),
    enabled: !!departmentId,
  });
}

export function useDiscoverProducts() {
  return useQuery({
    queryKey: catalogKeys.discoverProducts,
    queryFn: () => catalogApi.products({ limit: 9 }),
  });
}

export function useSearchProducts(query: string, enabled = true) {
  return useQuery({
    queryKey: catalogKeys.searchProducts(query),
    queryFn: () => catalogApi.products({ search: query, limit: 30 }),
    enabled: enabled && query.trim().length >= 2,
  });
}

export function useSearchProviders(query: string, enabled = true) {
  return useQuery({
    queryKey: catalogKeys.searchProviders(query),
    queryFn: () => catalogApi.serviceProviders({ search: query, limit: 10 }),
    enabled: enabled && query.trim().length >= 2,
  });
}
