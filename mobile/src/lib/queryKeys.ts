export const authKeys = {
  me: ['auth', 'me'] as const,
};

export const cartKeys = {
  cart: ['cart'] as const,
};

export const orderKeys = {
  list: ['orders'] as const,
  detail: (id: string) => ['orders', id] as const,
  checkoutQuote: (couponCode?: string) => ['orders', 'checkout-quote', couponCode ?? ''] as const,
};

export const wishlistKeys = {
  list: ['wishlist'] as const,
  status: (productId: string) => ['wishlist', 'status', productId] as const,
};

export const reviewKeys = {
  product: (productId: string) => ['reviews', 'product', productId] as const,
};

export const notificationKeys = {
  list: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};
