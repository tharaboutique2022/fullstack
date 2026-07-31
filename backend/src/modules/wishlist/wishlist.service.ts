import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';
import { productWithVariantsInclude, serializeProduct } from '../products/product.serializer';

export async function listWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: { include: productWithVariantsInclude },
    },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    createdAt: item.createdAt.toISOString(),
    product: serializeProduct(item.product),
  }));
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
  });

  if (!product) {
    throw AppError.notFound('Product not found');
  }

  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
    include: {
      product: { include: productWithVariantsInclude },
    },
  });

  return {
    id: item.id,
    productId: item.productId,
    createdAt: item.createdAt.toISOString(),
    product: serializeProduct(item.product),
  };
}

export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });
}

export async function isProductWishlisted(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return { wishlisted: !!item };
}
