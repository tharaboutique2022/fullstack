export const ORDER_PLATFORM_FEE = 7;
export const ORDER_STANDARD_SHIPPING = 44;

export function calculateOrderTotal(subtotal: number, discount = 0): number {
  const discountedSubtotal = Math.max(subtotal - discount, 0);
  return discountedSubtotal + ORDER_PLATFORM_FEE + ORDER_STANDARD_SHIPPING;
}
