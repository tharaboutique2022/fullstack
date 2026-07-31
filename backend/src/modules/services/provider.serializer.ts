import type {
  Prisma,
  ServiceCategory,
  ServicePackage,
  ServiceProvider,
  ServiceProviderImage,
  ServiceProviderTimeSlot,
} from '@prisma/client';

export const providerListInclude = {
  category: true,
} satisfies Prisma.ServiceProviderInclude;

export const providerDetailInclude = {
  category: true,
  packages: {
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      gallery: { orderBy: { sortOrder: 'asc' } },
    },
  },
  gallery: { orderBy: { sortOrder: 'asc' } },
  timeSlots: {
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  },
} satisfies Prisma.ServiceProviderInclude;

export const providerAdminInclude = {
  category: true,
  packages: {
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { gallery: { orderBy: { sortOrder: 'asc' } } },
  },
  gallery: { orderBy: { sortOrder: 'asc' } },
  timeSlots: { orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.ServiceProviderInclude;

function decimalToString(value: Prisma.Decimal | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value.toString();
}

export function serializeServiceCategory(category: {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    subtitle: category.subtitle,
    imageUrl: category.imageUrl,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

type PackageWithGallery = ServicePackage & {
  gallery?: { id: string; packageId: string; imageUrl: string; sortOrder: number }[];
};

type ProviderSerializable = ServiceProvider & {
  category?: ServiceCategory;
  packages?: PackageWithGallery[];
  gallery?: ServiceProviderImage[];
  timeSlots?: ServiceProviderTimeSlot[];
};

export function serializeServiceProvider(
  provider: ProviderSerializable,
  { includeRelations = true }: { includeRelations?: boolean } = {}
) {
  return {
    id: provider.id,
    categoryId: provider.categoryId,
    name: provider.name,
    slug: provider.slug,
    tagline: provider.tagline,
    description: provider.description,
    imageUrl: provider.imageUrl,
    location: provider.location,
    distanceKm: decimalToString(provider.distanceKm),
    rating: decimalToString(provider.rating),
    reviewCount: provider.reviewCount,
    audienceTag: provider.audienceTag,
    tags: provider.tags,
    priceFrom: provider.priceFrom.toString(),
    isActive: provider.isActive,
    sortOrder: provider.sortOrder,
    createdAt: provider.createdAt.toISOString(),
    updatedAt: provider.updatedAt.toISOString(),
    ...(includeRelations && provider.category
      ? { category: serializeServiceCategory(provider.category) }
      : {}),
    ...(includeRelations && provider.packages?.length
      ? {
          packages: provider.packages.map((pkg) => ({
            id: pkg.id,
            providerId: pkg.providerId,
            name: pkg.name,
            description: pkg.description,
            priceMin: pkg.priceMin.toString(),
            priceMax: pkg.priceMax ? pkg.priceMax.toString() : null,
            durationMinutes: pkg.durationMinutes,
            sortOrder: pkg.sortOrder,
            isActive: pkg.isActive,
            createdAt: pkg.createdAt.toISOString(),
            updatedAt: pkg.updatedAt.toISOString(),
            gallery: (pkg.gallery ?? []).map((image) => ({
              id: image.id,
              packageId: image.packageId,
              imageUrl: image.imageUrl,
              sortOrder: image.sortOrder,
            })),
          })),
        }
      : {}),
    ...(includeRelations && provider.gallery?.length
      ? {
          gallery: provider.gallery.map((image) => ({
            id: image.id,
            providerId: image.providerId,
            imageUrl: image.imageUrl,
            sortOrder: image.sortOrder,
          })),
        }
      : {}),
    ...(includeRelations && provider.timeSlots?.length
      ? {
          timeSlots: provider.timeSlots.map((slot) => ({
            id: slot.id,
            providerId: slot.providerId,
            slotTime: slot.slotTime,
            sortOrder: slot.sortOrder,
            isActive: slot.isActive,
          })),
        }
      : {}),
  };
}
