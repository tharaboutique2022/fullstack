import type { Prisma } from '@prisma/client';

export const productWithVariantsInclude = {
  category: true,
  options: {
    orderBy: { position: 'asc' as const },
    include: {
      values: {
        orderBy: { position: 'asc' as const },
      },
    },
  },
  variants: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      optionValues: {
        include: {
          optionValue: {
            include: {
              option: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: typeof productWithVariantsInclude;
}>;

export function serializeProduct(product: ProductWithVariants) {
  const variants = product.variants.map((variant) => {
    const selections = variant.optionValues
      .map((link) => ({
        optionId: link.optionValue.option.id,
        optionName: link.optionValue.option.name,
        valueId: link.optionValue.id,
        value: link.optionValue.value,
        imageUrl: link.optionValue.imageUrl,
      }))
      .sort((a, b) => a.optionName.localeCompare(b.optionName));

    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      price: variant.price.toString(),
      stockStatus: variant.stockStatus,
      imageUrl: variant.imageUrl,
      isActive: variant.isActive,
      title: selections.map((item) => item.value).join(' / '),
      optionValueIds: selections.map((item) => item.valueId),
      selections,
    };
  });

  const activePrices = variants
    .filter((variant) => variant.isActive)
    .map((variant) => Number(variant.price));

  const priceFrom =
    product.hasVariants && activePrices.length
      ? Math.min(...activePrices)
      : Number(product.price);

  return {
    id: product.id,
    categoryId: product.categoryId,
    brand: product.brand,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    priceFrom: priceFrom.toString(),
    imageUrl: product.imageUrl,
    stockStatus: product.stockStatus,
    isActive: product.isActive,
    hasVariants: product.hasVariants,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: product.category
      ? {
          ...product.category,
          createdAt: product.category.createdAt.toISOString(),
          updatedAt: product.category.updatedAt.toISOString(),
        }
      : undefined,
    options: product.options.map((option) => ({
      id: option.id,
      productId: option.productId,
      name: option.name,
      position: option.position,
      values: option.values.map((value) => ({
        id: value.id,
        optionId: value.optionId,
        value: value.value,
        imageUrl: value.imageUrl,
        position: value.position,
      })),
    })),
    variants,
  };
}
