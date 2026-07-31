import type { Prisma, ProductCategoryKind } from '@prisma/client';
import { prisma } from '../../config/prisma';

type CategoryRow = {
  id: string;
  parentId: string | null;
  kind: ProductCategoryKind;
};

export async function loadCategoryRows(activeOnly = false): Promise<CategoryRow[]> {
  return prisma.productCategory.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    select: { id: true, parentId: true, kind: true },
  });
}

export function getDescendantIds(categoryId: string, rows: CategoryRow[]): string[] {
  const childrenByParent = new Map<string | null, string[]>();
  for (const row of rows) {
    const siblings = childrenByParent.get(row.parentId) ?? [];
    siblings.push(row.id);
    childrenByParent.set(row.parentId, siblings);
  }

  const result: string[] = [];
  const queue = [categoryId];
  while (queue.length) {
    const current = queue.shift()!;
    result.push(current);
    const children = childrenByParent.get(current) ?? [];
    queue.push(...children);
  }
  return result;
}

export function getLeafCategoryIds(categoryId: string, rows: CategoryRow[]): string[] {
  const scoped = new Set(getDescendantIds(categoryId, rows));
  const hasChild = new Set<string>();
  for (const row of rows) {
    if (row.parentId && scoped.has(row.parentId)) {
      hasChild.add(row.parentId);
    }
  }

  return rows
    .filter((row) => scoped.has(row.id) && row.kind === 'leaf')
    .map((row) => row.id);
}

export function findDepartmentId(categoryId: string, rows: CategoryRow[]): string | null {
  const byId = new Map(rows.map((row) => [row.id, row]));
  let current = byId.get(categoryId);
  while (current) {
    if (current.kind === 'department') return current.id;
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return null;
}

export async function buildCategoryProductFilter(
  categoryId: string,
  departmentId?: string
): Promise<Prisma.ProductWhereInput> {
  const category = await prisma.productCategory.findUnique({ where: { id: categoryId } });
  if (!category) {
    return { categoryId: { in: [] } };
  }

  const rows = await loadCategoryRows(false);
  const resolvedDepartmentId = departmentId ?? findDepartmentId(categoryId, rows);
  const departmentLeafIds = resolvedDepartmentId
    ? getLeafCategoryIds(resolvedDepartmentId, rows)
    : getLeafCategoryIds(categoryId, rows);

  if (category.kind === 'brand') {
    return {
      brand: { equals: category.name, mode: 'insensitive' },
      categoryId: { in: departmentLeafIds },
    };
  }

  if (category.kind === 'leaf') {
    return { categoryId: category.id };
  }

  const leafIds = getLeafCategoryIds(categoryId, rows);
  const scopedLeafIds = resolvedDepartmentId
    ? leafIds.filter((id) => departmentLeafIds.includes(id))
    : leafIds;

  return scopedLeafIds.length
    ? { categoryId: { in: scopedLeafIds } }
    : { categoryId: { in: [] } };
}

export function serializeCategory<T extends {
  id: string;
  parentId: string | null;
  kind: ProductCategoryKind;
  name: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  parent?: {
    id: string;
    parentId: string | null;
    kind: ProductCategoryKind;
    name: string;
    slug: string;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}>(category: T) {
  return {
    ...category,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    parent: category.parent
      ? {
          ...category.parent,
          createdAt: category.parent.createdAt.toISOString(),
          updatedAt: category.parent.updatedAt.toISOString(),
        }
      : category.parent ?? undefined,
  };
}

export async function enrichCategoriesWithDisplayImages<
  T extends { id: string; kind: ProductCategoryKind; imageUrl: string | null },
>(categories: T[]): Promise<T[]> {
  const needsFallback = categories.some((category) => !category.imageUrl);
  if (!needsFallback) {
    return categories;
  }

  const rows = await loadCategoryRows(true);
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      imageUrl: { not: null },
    },
    orderBy: { createdAt: 'asc' },
    select: { categoryId: true, imageUrl: true },
  });

  const imageByLeafId = new Map<string, string>();
  for (const product of products) {
    if (product.imageUrl && !imageByLeafId.has(product.categoryId)) {
      imageByLeafId.set(product.categoryId, product.imageUrl);
    }
  }

  return categories.map((category) => {
    if (category.imageUrl) {
      return category;
    }

    const leafIds =
      category.kind === 'leaf' || category.kind === 'brand'
        ? [category.id]
        : getLeafCategoryIds(category.id, rows);

    const fallbackImage = leafIds
      .map((leafId) => imageByLeafId.get(leafId))
      .find((imageUrl): imageUrl is string => Boolean(imageUrl));

    return fallbackImage ? { ...category, imageUrl: fallbackImage } : category;
  });
}
