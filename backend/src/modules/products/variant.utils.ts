export interface ProductOptionInput {
  name: string;
  values: ProductOptionValueInput[];
}

export interface ProductOptionValueInput {
  value: string;
  imageUrl?: string | null;
}

export function getOptionValueText(value: ProductOptionValueInput): string {
  return value.value.trim();
}

export interface ProductVariantInput {
  optionValues: string[];
  price: number;
  stockStatus?: 'in_stock' | 'out_of_stock';
  sku?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
}

export function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((combo) => curr.map((value) => [...combo, value])),
    [[]]
  );
}

export function generateVariantCombinations(
  options: ProductOptionInput[],
  basePrice: number
): ProductVariantInput[] {
  if (!options.length) return [];

  const valueGroups = options.map((option) =>
    option.values.map(getOptionValueText).filter(Boolean)
  );
  if (valueGroups.some((group) => group.length === 0)) return [];

  return cartesianProduct(valueGroups).map((optionValues) => ({
    optionValues,
    price: basePrice,
    stockStatus: 'in_stock' as const,
    isActive: true,
  }));
}

export function buildCartLineKey(productId: string, variantId?: string | null): string {
  return `${productId}:${variantId ?? 'default'}`;
}

export function buildVariantTitle(optionValues: Array<{ option: { name: string }; value: string }>): string {
  return optionValues.map((item) => item.value).join(' / ');
}
