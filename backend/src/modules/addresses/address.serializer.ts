import type { Address } from '@prisma/client';

export function serializeAddress(address: Address) {
  return {
    id: address.id,
    userId: address.userId,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}
