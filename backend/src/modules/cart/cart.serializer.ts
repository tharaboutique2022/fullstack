import type { Prisma } from '@prisma/client';
import { buildVariantTitle } from '../products/variant.utils';

export const cartInclude = {
  items: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          price: true,
          hasVariants: true,
          stockStatus: true,
          isActive: true,
        },
      },
      variant: {
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
    },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;

function getVariantTitle(
  variant: NonNullable<CartWithItems['items'][number]['variant']>
): string {
  const optionValues = variant.optionValues.map((link) => ({
    option: { name: link.optionValue.option.name },
    value: link.optionValue.value,
  }));

  return buildVariantTitle(optionValues);
}

function getLineAvailability(item: CartWithItems['items'][number]): boolean {
  if (!item.product.isActive) {
    return false;
  }

  if (item.product.hasVariants) {
    return !!item.variant?.isActive && item.variant.stockStatus === 'in_stock';
  }

  return item.product.stockStatus === 'in_stock';
}

function getUnitPrice(item: CartWithItems['items'][number]): number {
  if (item.variant) {
    return Number(item.variant.price);
  }

  return Number(item.product.price);
}

function getDisplayImageUrl(item: CartWithItems['items'][number]): string | null {
  return item.variant?.imageUrl ?? item.product.imageUrl;
}

export function serializeCart(cart: CartWithItems) {
  const items = cart.items.map((item) => {
    const unitPrice = getUnitPrice(item);
    const lineTotal = unitPrice * item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: unitPrice.toFixed(2),
      lineTotal: lineTotal.toFixed(2),
      isAvailable: getLineAvailability(item),
      imageUrl: getDisplayImageUrl(item),
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl,
        hasVariants: item.product.hasVariants,
      },
      variant: item.variant
        ? {
            id: item.variant.id,
            title: getVariantTitle(item.variant),
            price: item.variant.price.toString(),
            stockStatus: item.variant.stockStatus,
            imageUrl: item.variant.imageUrl,
            sku: item.variant.sku,
          }
        : null,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    userId: cart.userId,
    itemCount,
    subtotal: subtotal.toFixed(2),
    items,
    updatedAt: cart.updatedAt.toISOString(),
  };
}
