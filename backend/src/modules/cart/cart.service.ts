import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';
import { buildCartLineKey } from '../products/variant.utils';
import { cartInclude, serializeCart } from './cart.serializer';
import type { AddCartItemInput, UpdateCartItemInput } from './cart.validation';

const MAX_CART_QUANTITY = 99;

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: cartInclude,
  });
}

async function fetchCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (!cart) {
    return getOrCreateCart(userId);
  }

  return cart;
}

async function resolveCartLine(productId: string, variantId?: string | null) {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
  });

  if (!product) {
    throw AppError.notFound('Product not found or unavailable');
  }

  if (product.hasVariants) {
    if (!variantId) {
      throw AppError.badRequest('variantId is required for products with variants');
    }

    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
        isActive: true,
      },
    });

    if (!variant) {
      throw AppError.notFound('Product variant not found or unavailable');
    }

    if (variant.stockStatus === 'out_of_stock') {
      throw AppError.badRequest('Selected variant is out of stock');
    }

    return {
      cartLineKey: buildCartLineKey(productId, variantId),
      variantId,
    };
  }

  if (variantId) {
    throw AppError.badRequest('variantId is not allowed for products without variants');
  }

  if (product.stockStatus === 'out_of_stock') {
    throw AppError.badRequest('Product is out of stock');
  }

  return {
    cartLineKey: buildCartLineKey(productId),
    variantId: null,
  };
}

async function getOwnedCartItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: { userId },
    },
    include: {
      cart: true,
      product: true,
      variant: true,
    },
  });

  if (!item) {
    throw AppError.notFound('Cart item not found');
  }

  return item;
}

async function assertLineAvailable(productId: string, variantId: string | null) {
  await resolveCartLine(productId, variantId);
}

export async function getCart(userId: string) {
  const cart = await fetchCart(userId);
  return serializeCart(cart);
}

export async function addCartItem(userId: string, input: AddCartItemInput) {
  const { cartLineKey, variantId } = await resolveCartLine(input.productId, input.variantId);
  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find((item) => item.cartLineKey === cartLineKey);
  const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

  if (nextQuantity > MAX_CART_QUANTITY) {
    throw AppError.badRequest(`Maximum quantity per item is ${MAX_CART_QUANTITY}`);
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        variantId,
        cartLineKey,
        quantity: input.quantity,
      },
    });
  }

  const updatedCart = await fetchCart(userId);
  return serializeCart(updatedCart);
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  input: UpdateCartItemInput
) {
  const item = await getOwnedCartItem(userId, itemId);
  await assertLineAvailable(item.productId, item.variantId);

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: input.quantity },
  });

  const updatedCart = await fetchCart(userId);
  return serializeCart(updatedCart);
}

export async function removeCartItem(userId: string, itemId: string) {
  await getOwnedCartItem(userId, itemId);

  await prisma.cartItem.delete({
    where: { id: itemId },
  });

  const updatedCart = await fetchCart(userId);
  return serializeCart(updatedCart);
}

export async function clearCart(userId: string) {
  const cart = await fetchCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  const updatedCart = await fetchCart(userId);
  return serializeCart(updatedCart);
}

export async function mergeGuestCart(userId: string, items: AddCartItemInput[]) {
  for (const item of items) {
    try {
      await addCartItem(userId, item);
    } catch {
      // Skip unavailable guest items during merge
    }
  }

  return getCart(userId);
}
