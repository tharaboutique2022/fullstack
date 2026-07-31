import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/api/wishlist';
import { wishlistKeys } from '@/lib/queryKeys';

export { wishlistKeys };

export function useWishlist(enabled = true) {
  return useQuery({
    queryKey: wishlistKeys.list,
    queryFn: wishlistApi.list,
    enabled,
  });
}

export function useWishlistStatus(productId: string, enabled = true) {
  return useQuery({
    queryKey: wishlistKeys.status(productId),
    queryFn: () => wishlistApi.status(productId),
    enabled: enabled && !!productId,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      wishlisted,
    }: {
      productId: string;
      wishlisted: boolean;
    }) => {
      if (wishlisted) {
        await wishlistApi.remove(productId);
        return { productId, wishlisted: false };
      }
      const item = await wishlistApi.add(productId);
      return { productId, wishlisted: true, item };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(wishlistKeys.status(result.productId), {
        wishlisted: result.wishlisted,
      });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list });
    },
  });
}
