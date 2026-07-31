import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddressInput } from '@ecomm/shared/api.types';
import { addressesApi } from '@/api/addresses';

export const addressKeys = {
  list: ['addresses'] as const,
  default: ['addresses', 'default'] as const,
};

function invalidateAddresses(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: addressKeys.list });
  queryClient.invalidateQueries({ queryKey: addressKeys.default });
}

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: addressKeys.list,
    queryFn: addressesApi.list,
    enabled,
  });
}

export function useDefaultAddress(enabled = true) {
  return useQuery({
    queryKey: addressKeys.default,
    queryFn: addressesApi.default,
    enabled,
  });
}

export function useAddressMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (body: AddressInput) => addressesApi.create(body),
    onSuccess: () => invalidateAddresses(queryClient),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AddressInput> }) =>
      addressesApi.update(id, body),
    onSuccess: () => invalidateAddresses(queryClient),
  });

  const remove = useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => invalidateAddresses(queryClient),
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => addressesApi.update(id, { isDefault: true }),
    onSuccess: () => invalidateAddresses(queryClient),
  });

  return { create, update, remove, setDefault };
}
