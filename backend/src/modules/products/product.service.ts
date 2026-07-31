import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';
import { slugify } from '../../utils/helpers';
import type { CategoryInput, ListCategoriesQuery, PaginationQuery, ProductInput } from '../catalog/catalog.validation';
import {
  buildCategoryProductFilter,
  enrichCategoriesWithDisplayImages,
  getDescendantIds,
  loadCategoryRows,
  serializeCategory,
} from './category.utils';
import {
  productWithVariantsInclude,
  serializeProduct,
  type ProductWithVariants,
} from './product.serializer';
import type { ProductOptionInput, ProductVariantInput } from './variant.utils';
import { getOptionValueText } from './variant.utils';

interface ListOptions extends Partial<PaginationQuery> {
  categoryId?: string;
  departmentId?: string;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  brand?: string;
  stockStatus?: 'in_stock' | 'out_of_stock';
  minPrice?: number;
  maxPrice?: number;
  activeOnly?: boolean;
}

function buildProductSearchFilter(search?: string) {
  if (!search) return {};
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } },
      { slug: { contains: search, mode: 'insensitive' as const } },
    ],
  };
}

async function syncProductVariants(
  productId: string,
  hasVariants: boolean,
  options: ProductOptionInput[] | undefined,
  variants: ProductVariantInput[] | undefined,
  basePrice: number
) {
  await prisma.productVariantValue.deleteMany({
    where: { variant: { productId } },
  });
  await prisma.productVariant.deleteMany({ where: { productId } });
  await prisma.productOptionValue.deleteMany({
    where: { option: { productId } },
  });
  await prisma.productOption.deleteMany({ where: { productId } });

  if (!hasVariants) {
    return;
  }

  if (!options?.length || !variants?.length) {
    throw AppError.badRequest('Variant products require options and variants');
  }

  const optionValueMap = new Map<string, string>();

  for (const [optionIndex, option] of options.entries()) {
    const createdOption = await prisma.productOption.create({
      data: {
        productId,
        name: option.name.trim(),
        position: optionIndex,
        values: {
          create: option.values.map((entry, valueIndex) => ({
            value: getOptionValueText(entry),
            imageUrl: entry.imageUrl ?? null,
            position: valueIndex,
          })),
        },
      },
      include: { values: true },
    });

    for (const value of createdOption.values) {
      optionValueMap.set(`${option.name.trim()}::${value.value}`, value.id);
    }
  }

  for (const variant of variants) {
    const optionValueIds = variant.optionValues.map((value, index) => {
      const optionName = options[index]?.name.trim();
      if (!optionName) {
        throw AppError.badRequest('Variant option values do not match product options');
      }
      const optionValueId = optionValueMap.get(`${optionName}::${value.trim()}`);
      if (!optionValueId) {
        throw AppError.badRequest(`Invalid variant option value: ${value}`);
      }
      return optionValueId;
    });

    if (optionValueIds.length !== options.length) {
      throw AppError.badRequest('Each variant must include a value for every option');
    }

    await prisma.productVariant.create({
      data: {
        productId,
        sku: variant.sku ?? null,
        price: variant.price ?? basePrice,
        stockStatus: variant.stockStatus ?? 'in_stock',
        imageUrl: variant.imageUrl ?? null,
        isActive: variant.isActive ?? true,
        optionValues: {
          create: optionValueIds.map((optionValueId) => ({ optionValueId })),
        },
      },
    });
  }
}

async function fetchProductWithVariants(id: string, activeOnly = false) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      ...(activeOnly ? { isActive: true } : {}),
    },
    include: productWithVariantsInclude,
  });

  if (!product) {
    throw AppError.notFound('Product not found');
  }

  return serializeProduct(product);
}

export async function listProductCategories(
  {
    activeOnly = false,
    parentId,
    rootsOnly = false,
    kind,
  }: {
    activeOnly?: boolean;
  } & Partial<ListCategoriesQuery> = {}
) {
  const where = {
    ...(activeOnly ? { isActive: true } : {}),
    ...(rootsOnly ? { parentId: null } : {}),
    ...(parentId !== undefined && !rootsOnly ? { parentId } : {}),
    ...(kind ? { kind } : {}),
  };

  const categories = await prisma.productCategory.findMany({
    where,
    include: { parent: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  const serialized = categories.map(serializeCategory);
  if (!activeOnly) {
    return serialized;
  }

  return enrichCategoriesWithDisplayImages(serialized);
}

async function assertValidCategoryParent(data: {
  parentId?: string | null;
  kind?: CategoryInput['kind'];
  categoryId?: string;
}) {
  if (data.parentId) {
    const parent = await prisma.productCategory.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw AppError.badRequest('Parent category not found');
    }
    if (data.kind === 'department') {
      throw AppError.badRequest('Department categories cannot have a parent');
    }
    if (data.categoryId && data.parentId === data.categoryId) {
      throw AppError.badRequest('Category cannot be its own parent');
    }
  } else if (data.kind && data.kind !== 'department') {
    throw AppError.badRequest('Only department categories can be root-level');
  }
}

export async function createProductCategory(data: CategoryInput) {
  const slug = data.slug || slugify(data.name);
  const kind = data.kind ?? (data.parentId ? 'group' : 'department');

  await assertValidCategoryParent({ parentId: data.parentId, kind });

  return serializeCategory(
    await prisma.productCategory.create({
      data: {
        name: data.name,
        slug,
        parentId: data.parentId ?? null,
        kind,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { parent: true },
    })
  );
}

export async function updateProductCategory(id: string, data: Partial<CategoryInput>) {
  const existing = await prisma.productCategory.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Category not found');
  }

  const nextParentId = data.parentId !== undefined ? data.parentId : existing.parentId;
  const nextKind = data.kind ?? existing.kind;

  await assertValidCategoryParent({ parentId: nextParentId, kind: nextKind, categoryId: id });

  if (data.parentId !== undefined && data.parentId) {
    const rows = await loadCategoryRows(false);
    const descendants = getDescendantIds(id, rows);
    if (descendants.includes(data.parentId)) {
      throw AppError.badRequest('Category cannot be moved under its own descendant');
    }
  }

  return serializeCategory(
    await prisma.productCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug ? slugify(data.slug) : data.slug,
        parentId: data.parentId !== undefined ? data.parentId : undefined,
        kind: data.kind,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
      include: { parent: true },
    })
  );
}

export async function deleteProductCategory(id: string) {
  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.productCategory.count({ where: { parentId: id } }),
  ]);

  if (childCount > 0) {
    throw AppError.badRequest('Cannot delete category with sub-categories');
  }

  if (productCount > 0) {
    throw AppError.badRequest('Cannot delete category with existing products');
  }

  return prisma.productCategory.delete({ where: { id } });
}

export async function listProducts({
  categoryId,
  departmentId,
  search,
  sort = 'newest',
  brand,
  stockStatus,
  minPrice,
  maxPrice,
  activeOnly = false,
  page = 1,
  limit = 10,
}: ListOptions = {}) {
  const categoryFilter = categoryId
    ? await buildCategoryProductFilter(categoryId, departmentId)
    : {};

  const where = {
    ...categoryFilter,
    ...(activeOnly ? { isActive: true } : {}),
    ...(brand ? { brand: { equals: brand, mode: 'insensitive' as const } } : {}),
    ...(stockStatus ? { stockStatus } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...buildProductSearchFilter(search),
  };

  const orderBy =
    sort === 'price_asc'
      ? { price: 'asc' as const }
      : sort === 'price_desc'
        ? { price: 'desc' as const }
        : { createdAt: 'desc' as const };

  const [rawItems, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productWithVariantsInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const items = rawItems.map((product) => serializeProduct(product as ProductWithVariants));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getProductById(id: string, { activeOnly = false }: { activeOnly?: boolean } = {}) {
  return fetchProductWithVariants(id, activeOnly);
}

export async function createProduct(data: ProductInput) {
  const slug = data.slug || slugify(data.name);
  const hasVariants = data.hasVariants ?? false;

  if (hasVariants && (!data.options?.length || !data.variants?.length)) {
    throw AppError.badRequest('Variant products require options and variants');
  }

  const product = await prisma.product.create({
    data: {
      categoryId: data.categoryId,
      brand: data.brand?.trim() || null,
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      stockStatus: data.stockStatus ?? 'in_stock',
      isActive: data.isActive ?? true,
      hasVariants,
    },
  });

  await syncProductVariants(product.id, hasVariants, data.options, data.variants, data.price);

  return fetchProductWithVariants(product.id);
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Product not found');
  }

  const hasVariants = data.hasVariants ?? existing.hasVariants;
  const price = data.price ?? Number(existing.price);

  if (hasVariants && data.options !== undefined && (!data.options.length || !data.variants?.length)) {
    throw AppError.badRequest('Variant products require options and variants');
  }

  await prisma.product.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      brand: data.brand !== undefined ? data.brand?.trim() || null : undefined,
      name: data.name,
      slug: data.slug ? slugify(data.slug) : data.slug,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      stockStatus: data.stockStatus,
      isActive: data.isActive,
      hasVariants,
    },
  });

  if (data.hasVariants === false || hasVariants === false) {
    await syncProductVariants(id, false, undefined, undefined, price);
  } else if (hasVariants && data.options !== undefined) {
    await syncProductVariants(id, true, data.options, data.variants, price);
  }

  return fetchProductWithVariants(id);
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}
