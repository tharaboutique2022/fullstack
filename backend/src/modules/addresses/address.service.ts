import type { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';
import type { AddressInput } from './address.validation';
import { serializeAddress } from './address.serializer';

async function unsetDefaultAddresses(
  userId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma
) {
  await tx.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
}

export async function listAddresses(userId: string) {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  });

  return addresses.map(serializeAddress);
}

export async function getDefaultAddress(userId: string) {
  const address = await prisma.address.findFirst({
    where: { userId, isDefault: true },
    orderBy: { updatedAt: 'desc' },
  });

  return address ? serializeAddress(address) : null;
}

export async function getAddressById(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw AppError.notFound('Address not found');
  }

  return serializeAddress(address);
}

export async function createAddress(userId: string, input: AddressInput) {
  const shouldBeDefault =
    input.isDefault ?? (await prisma.address.count({ where: { userId } })) === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await unsetDefaultAddresses(userId, tx);
    }

    return tx.address.create({
      data: {
        userId,
        label: input.label ?? 'Home',
        line1: input.line1,
        line2: input.line2 ?? null,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        isDefault: shouldBeDefault,
      },
    });
  });

  return serializeAddress(address);
}

export async function updateAddress(userId: string, addressId: string, input: Partial<AddressInput>) {
  await getAddressById(userId, addressId);

  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await unsetDefaultAddresses(userId, tx);
    }

    return tx.address.update({
      where: { id: addressId },
      data: {
        label: input.label,
        line1: input.line1,
        line2: input.line2,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        isDefault: input.isDefault,
      },
    });
  });

  return serializeAddress(address);
}

export async function deleteAddress(userId: string, addressId: string) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    throw AppError.notFound('Address not found');
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id: addressId } });

    if (existing.isDefault) {
      const nextDefault = await tx.address.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      if (nextDefault) {
        await tx.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }
  });
}

export async function resolveOrderAddress(userId: string, addressId?: string) {
  if (addressId) {
    return getAddressById(userId, addressId);
  }

  const defaultAddress = await getDefaultAddress(userId);
  if (!defaultAddress) {
    throw AppError.badRequest('Add a delivery address before placing an order');
  }

  return defaultAddress;
}
