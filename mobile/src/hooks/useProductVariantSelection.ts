import { useCallback, useMemo, useState } from 'react';
import type { Product, ProductVariant } from '@ecomm/shared/api.types';

export function useProductVariantSelection(product?: Product) {
  const [selectedValueIds, setSelectedValueIds] = useState<Record<string, string>>({});

  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!product?.hasVariants || !product.options?.length || !product.variants?.length) {
      return null;
    }

    const selectedIds = product.options
      .map((option) => selectedValueIds[option.id])
      .filter(Boolean);

    if (selectedIds.length !== product.options.length) {
      return null;
    }

    return (
      product.variants.find((variant) =>
        selectedIds.every((valueId) => variant.optionValueIds.includes(valueId))
      ) ?? null
    );
  }, [product, selectedValueIds]);

  function selectOptionValue(optionId: string, valueId: string) {
    setSelectedValueIds((current) => ({ ...current, [optionId]: valueId }));
  }

  const resetSelection = useCallback(() => {
    setSelectedValueIds({});
  }, []);

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : product?.hasVariants
      ? product.priceFrom
      : product?.price;

  const displayImageUrl = useMemo(() => {
    if (!product) return null;
    if (selectedVariant?.imageUrl) return selectedVariant.imageUrl;
    return product.imageUrl;
  }, [product, selectedVariant]);

  const isAvailable = product?.hasVariants
    ? !!selectedVariant && selectedVariant.stockStatus === 'in_stock'
    : product?.stockStatus === 'in_stock';

  return {
    selectedValueIds,
    selectedVariant,
    selectOptionValue,
    resetSelection,
    displayPrice,
    displayImageUrl,
    isAvailable,
  };
}
