import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';
import { slugify } from '../../utils/helpers';
import type { CategoryInput, PaginationQuery } from '../catalog/catalog.validation';
import type { ServiceProviderInput } from './provider.validation';
import {
  providerAdminInclude,
  providerDetailInclude,
  providerListInclude,
  serializeServiceCategory,
  serializeServiceProvider,
} from './provider.serializer';

interface ListOptions extends Partial<PaginationQuery> {
  categoryId?: string;
  search?: string;
  activeOnly?: boolean;
}

function buildProviderSearchFilter(search?: string) {
  if (!search) return {};
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } },
      { tagline: { contains: search, mode: 'insensitive' as const } },
      { location: { contains: search, mode: 'insensitive' as const } },
      { tags: { has: search } },
    ],
  };
}

export async function listServiceCategories({ activeOnly = false }: { activeOnly?: boolean } = {}) {
  const categories = await prisma.serviceCategory.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return categories.map(serializeServiceCategory);
}

export async function createServiceCategory(data: CategoryInput) {
  const slug = data.slug || slugify(data.name);
  const category = await prisma.serviceCategory.create({
    data: {
      name: data.name,
      slug,
      subtitle: data.subtitle ?? null,
      imageUrl: data.imageUrl,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  return serializeServiceCategory(category);
}

export async function updateServiceCategory(id: string, data: Partial<CategoryInput>) {
  const category = await prisma.serviceCategory.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug ? slugify(data.slug) : data.slug,
      subtitle: data.subtitle,
      imageUrl: data.imageUrl,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  });

  return serializeServiceCategory(category);
}

export async function deleteServiceCategory(id: string) {
  const providerCount = await prisma.serviceProvider.count({ where: { categoryId: id } });

  if (providerCount > 0) {
    throw AppError.badRequest('Cannot delete category with existing providers');
  }

  await prisma.serviceCategory.delete({ where: { id } });
}

export async function listServiceProviders({
  categoryId,
  search,
  activeOnly = false,
  page = 1,
  limit = 10,
}: ListOptions = {}) {
  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(activeOnly ? { isActive: true } : {}),
    ...buildProviderSearchFilter(search),
  };

  const [rows, total] = await Promise.all([
    prisma.serviceProvider.findMany({
      where,
      include: providerListInclude,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.serviceProvider.count({ where }),
  ]);

  return {
    items: rows.map((row) => serializeServiceProvider(row, { includeRelations: true })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getServiceProviderById(
  id: string,
  { activeOnly = false, admin = false }: { activeOnly?: boolean; admin?: boolean } = {}
) {
  const provider = await prisma.serviceProvider.findFirst({
    where: {
      id,
      ...(activeOnly ? { isActive: true } : {}),
    },
    include: admin ? providerAdminInclude : providerDetailInclude,
  });

  if (!provider) {
    throw AppError.notFound('Service provider not found');
  }

  return serializeServiceProvider(provider);
}

export async function createServiceProvider(data: ServiceProviderInput) {
  const slug = data.slug || slugify(data.name);

  const provider = await prisma.$transaction(async (tx) => {
    const created = await tx.serviceProvider.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug,
        tagline: data.tagline ?? null,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        location: data.location ?? null,
        distanceKm: data.distanceKm ?? null,
        rating: data.rating ?? null,
        reviewCount: data.reviewCount ?? 0,
        audienceTag: data.audienceTag ?? null,
        tags: data.tags ?? [],
        priceFrom: data.priceFrom,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        gallery: data.gallery?.length
          ? {
              create: data.gallery.map((imageUrl, index) => ({
                imageUrl,
                sortOrder: index,
              })),
            }
          : undefined,
        timeSlots: data.timeSlots?.length
          ? {
              create: data.timeSlots.map((slotTime, index) => ({
                slotTime,
                sortOrder: index,
              })),
            }
          : undefined,
        packages: data.packages?.length
          ? {
              create: data.packages.map((pkg, index) => ({
                name: pkg.name,
                description: pkg.description ?? null,
                priceMin: pkg.priceMin,
                priceMax: pkg.priceMax ?? null,
                durationMinutes: pkg.durationMinutes ?? 60,
                sortOrder: pkg.sortOrder ?? index,
                isActive: pkg.isActive ?? true,
                gallery: pkg.gallery?.length
                  ? {
                      create: pkg.gallery.map((imageUrl, imageIndex) => ({
                        imageUrl,
                        sortOrder: imageIndex,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: providerAdminInclude,
    });

    return created;
  });

  return serializeServiceProvider(provider);
}

export async function updateServiceProvider(id: string, data: Partial<ServiceProviderInput>) {
  const provider = await prisma.serviceProvider.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug ? slugify(data.slug) : data.slug,
      tagline: data.tagline,
      description: data.description,
      imageUrl: data.imageUrl,
      location: data.location,
      distanceKm: data.distanceKm,
      rating: data.rating,
      reviewCount: data.reviewCount,
      audienceTag: data.audienceTag,
      tags: data.tags,
      priceFrom: data.priceFrom,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
    include: providerAdminInclude,
  });

  return serializeServiceProvider(provider);
}

export async function deleteServiceProvider(id: string) {
  await prisma.serviceProvider.delete({ where: { id } });
}

export async function listProviderTimeSlots(providerId: string, { activeOnly = true } = {}) {
  const provider = await prisma.serviceProvider.findFirst({
    where: { id: providerId, ...(activeOnly ? { isActive: true } : {}) },
    include: {
      timeSlots: {
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!provider) {
    throw AppError.notFound('Service provider not found');
  }

  return provider.timeSlots.map((slot) => ({
    id: slot.id,
    providerId: slot.providerId,
    slotTime: slot.slotTime,
    sortOrder: slot.sortOrder,
    isActive: slot.isActive,
  }));
}
