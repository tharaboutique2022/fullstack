import type { ProductCategory, ProductCategoryKind } from '@ecomm/shared/api.types';

export interface CategoryTreeNode extends ProductCategory {
  children: CategoryTreeNode[];
  depth: number;
  pathLabel: string;
}

export interface CategoryKindMeta {
  kind: ProductCategoryKind;
  label: string;
  badge: string;
  description: string;
  mobilePreview: string;
  example: string;
  stepHint: string;
}

export const CATEGORY_KIND_META: Record<ProductCategoryKind, CategoryKindMeta> = {
  department: {
    kind: 'department',
    label: 'Shop section',
    badge: 'Level 1',
    description: 'The big tiles customers see first on the Categories tab.',
    mobilePreview: 'Categories tab → 2-column grid',
    example: 'Women, Men, Kids, Beauty',
    stepHint: 'No parent needed — this is a top-level shop section.',
  },
  group: {
    kind: 'group',
    label: 'Browse section',
    badge: 'Level 2',
    description: 'Accordion rows inside a shop section. Use “Brands” for brand filters.',
    mobilePreview: 'Tap a section → accordion list',
    example: 'Brands, Shirt, Makeup Items',
    stepHint: 'Choose which shop section this belongs to (e.g. Men).',
  },
  brand: {
    kind: 'brand',
    label: 'Brand name',
    badge: 'Level 3',
    description: 'A brand customers pick under the Brands browse section.',
    mobilePreview: 'Brands accordion → Adidas, Lakme…',
    example: 'Adidas, Lakme, MAC',
    stepHint: 'Must be placed under a browse section called “Brands”.',
  },
  leaf: {
    kind: 'leaf',
    label: 'Product category',
    badge: 'Products go here',
    description: 'The category you assign when adding a product in admin.',
    mobilePreview: 'Product listing after browsing',
    example: 'Casual Shirts, Lipstick, Kurtis',
    stepHint: 'Choose the browse section it belongs to (e.g. Men → Shirt).',
  },
};

export const CATEGORY_FLOW_STEPS = [
  { level: 1, title: 'Shop section', example: 'Men', note: 'Grid on Categories tab' },
  { level: 2, title: 'Browse section', example: 'Shirt / Brands', note: 'Accordion in app' },
  { level: 3, title: 'Brand or product type', example: 'Adidas / Casual Shirts', note: 'Filters or products' },
  { level: 4, title: 'Products', example: 'Adidas Casual Shirt', note: 'Add in Products table below' },
] as const;

export function isBrandsGroup(category: ProductCategory): boolean {
  return category.kind === 'group' && category.slug === 'brands';
}

export function getCategoryPath(category: ProductCategory, categories: ProductCategory[]): string {
  const parts = [category.name];
  let current = category;
  while (current.parentId) {
    const parent = categories.find((item) => item.id === current.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    current = parent;
  }
  return parts.join(' → ');
}

export function buildCategoryTree(categories: ProductCategory[]): CategoryTreeNode[] {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const byParent = new Map<string | null, ProductCategory[]>();

  for (const category of sorted) {
    const siblings = byParent.get(category.parentId) ?? [];
    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }

  function walk(parentId: string | null, depth: number, prefix: string): CategoryTreeNode[] {
    const siblings = byParent.get(parentId) ?? [];
    const nodes =
      parentId === null ? siblings.filter((category) => category.kind === 'department') : siblings;

    return nodes.map((category) => {
      const pathLabel = prefix ? `${prefix} → ${category.name}` : category.name;
      return {
        ...category,
        depth,
        pathLabel,
        children: walk(category.id, depth + 1, pathLabel),
      };
    });
  }

  return walk(null, 0, '');
}

/** Root categories that are not valid shop tiles (hidden from the mobile app). */
export function getMisconfiguredShopRoots(categories: ProductCategory[]): ProductCategory[] {
  return categories.filter((category) => !category.parentId && category.kind !== 'department');
}

export function isVisibleShopTile(category: ProductCategory): boolean {
  return category.kind === 'department' && category.isActive;
}

export function getValidParentOptions(
  kind: ProductCategoryKind,
  categories: ProductCategory[],
  editingCategoryId?: string
): ProductCategory[] {
  const pool = categories.filter((category) => category.id !== editingCategoryId);

  switch (kind) {
    case 'department':
      return [];
    case 'group':
      return pool.filter((category) => category.kind === 'department');
    case 'brand':
      return pool.filter((category) => isBrandsGroup(category));
    case 'leaf':
      return pool.filter(
        (category) => category.kind === 'group' && !isBrandsGroup(category)
      );
    default:
      return [];
  }
}

export function getSuggestedChildKind(parent: ProductCategory): ProductCategoryKind | null {
  if (parent.kind === 'department') return 'group';
  if (isBrandsGroup(parent)) return 'brand';
  if (parent.kind === 'group') return 'leaf';
  return null;
}

export function getKindBadgeClass(kind: ProductCategoryKind): string {
  return `category-kind-pill kind-${kind}`;
}

export function validateCategoryForm(values: {
  name: string;
  kind: ProductCategoryKind;
  parentId: string;
}): string | null {
  if (!values.name.trim()) return 'Name is required.';

  if (values.kind === 'department') {
    if (values.parentId.trim()) return 'Shop sections cannot have a parent.';
    return null;
  }

  if (!values.parentId.trim()) {
    return `Please select where this ${CATEGORY_KIND_META[values.kind].label.toLowerCase()} belongs.`;
  }

  return null;
}

export function getMobilePreviewPath(
  values: { name: string; kind: ProductCategoryKind; parentId: string },
  categories: ProductCategory[]
): string {
  if (values.kind === 'department') {
    return `Categories tab → ${values.name || '…'}`;
  }

  const parent = categories.find((category) => category.id === values.parentId);
  if (!parent) return 'Select a parent to preview the app path.';

  const section = parent.kind === 'department' ? parent.name : getCategoryPath(parent, categories).split(' → ')[0];

  switch (values.kind) {
    case 'group':
      return `${section} → ${values.name || '…'}`;
    case 'brand':
      return `${section} → Brands → ${values.name || '…'}`;
    case 'leaf':
      return `${getCategoryPath(parent, categories)} → ${values.name || '…'}`;
    default:
      return values.name;
  }
}
