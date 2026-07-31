import type {
  Product,
  ProductCategory,
  ProductInput,
  ProductOptionInput,
  ProductVariantInput,
  StockStatus,
} from '@ecomm/shared/api.types';
import { getErrorMessage } from '@/lib/apiClient';
import { ProductVariantsBuilder } from '@/components/forms/ProductVariantsBuilder';

export interface ProductFormValues {
  categoryId: string;
  brand: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stockStatus: StockStatus;
  isActive: boolean;
  imageUrl: string;
  hasVariants: boolean;
  options: ProductOptionInput[];
  variants: ProductVariantInput[];
}

export const emptyProductForm: ProductFormValues = {
  categoryId: '',
  brand: '',
  name: '',
  slug: '',
  description: '',
  price: '',
  stockStatus: 'in_stock',
  isActive: true,
  imageUrl: '',
  hasVariants: false,
  options: [],
  variants: [],
};

export function productToFormValues(product: Product): ProductFormValues {
  return {
    categoryId: product.categoryId,
    brand: product.brand ?? '',
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    price: product.price,
    stockStatus: product.stockStatus,
    isActive: product.isActive,
    imageUrl: product.imageUrl ?? '',
    hasVariants: product.hasVariants,
    options:
      product.options?.map((option) => ({
        name: option.name,
        values: option.values.map((value) => ({
          value: value.value,
          imageUrl: value.imageUrl ?? '',
        })),
      })) ?? [],
    variants:
      product.variants?.map((variant) => ({
        optionValues: variant.selections
          .sort((a, b) => a.optionName.localeCompare(b.optionName))
          .map((selection) => selection.value),
        price: Number(variant.price),
        stockStatus: variant.stockStatus,
        sku: variant.sku,
        imageUrl: variant.imageUrl,
        isActive: variant.isActive,
      })) ?? [],
  };
}

export function formValuesToProductInput(values: ProductFormValues): ProductInput {
  const payload: ProductInput = {
    categoryId: values.categoryId,
    brand: values.brand.trim() || null,
    name: values.name.trim(),
    slug: values.slug.trim() || undefined,
    description: values.description.trim() || null,
    price: Number(values.price),
    stockStatus: values.stockStatus,
    isActive: values.isActive,
    imageUrl: values.imageUrl.trim() || null,
    hasVariants: values.hasVariants,
  };

  if (values.hasVariants) {
    payload.options = values.options.map((option) => ({
      name: option.name.trim(),
      values: option.values
        .map((entry) => ({
          value: entry.value.trim(),
          imageUrl: entry.imageUrl?.trim() || null,
        }))
        .filter((entry) => entry.value),
    }));
    payload.variants = values.variants.map((variant) => ({
      optionValues: variant.optionValues,
      price: variant.price,
      stockStatus: variant.stockStatus,
      sku: variant.sku ?? null,
      imageUrl: variant.imageUrl ?? null,
      isActive: variant.isActive ?? true,
    }));
  }

  return payload;
}

interface ProductFormProps {
  values: ProductFormValues;
  categories: ProductCategory[];
  onChange: (values: ProductFormValues) => void;
  error?: unknown;
}

export function ProductForm({ values, categories, onChange, error }: ProductFormProps) {
  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function formatCategoryLabel(category: ProductCategory): string {
    const parts = [category.name];
    let current = category;
    while (current.parentId) {
      const parent = categories.find((item) => item.id === current.parentId);
      if (!parent) break;
      parts.unshift(parent.name);
      current = parent;
    }
    return parts.join(' / ');
  }

  const leafCategories = categories.filter((category) => category.kind === 'leaf');

  function toggleVariants(enabled: boolean) {
    onChange({
      ...values,
      hasVariants: enabled,
      options: enabled && !values.options.length
        ? [{ name: 'Size', values: [{ value: '', imageUrl: '' }] }]
        : values.options,
      variants: enabled ? values.variants : [],
    });
  }

  return (
    <>
      {error ? <div className="error-box">{getErrorMessage(error)}</div> : null}

      <label className="form-field">
        Category (leaf) *
        <select
          value={values.categoryId}
          onChange={(e) => update('categoryId', e.target.value)}
          required
        >
          <option value="">Select leaf category</option>
          {leafCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {formatCategoryLabel(cat)}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        Brand
        <input
          value={values.brand}
          onChange={(e) => update('brand', e.target.value)}
          placeholder="e.g. Adidas, Lakme"
        />
      </label>

      <label className="form-field">
        Name *
        <input
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Silk Saree"
          required
        />
      </label>

      <label className="form-field">
        Slug
        <input
          value={values.slug}
          onChange={(e) => update('slug', e.target.value)}
          placeholder="Auto-generated if empty"
        />
      </label>

      <label className="form-field">
        Base price (₹) *
        <input
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(e) => update('price', e.target.value)}
          required
        />
      </label>

      <label className="form-field">
        Description
        <textarea
          rows={3}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Product description"
        />
      </label>

      {!values.hasVariants ? (
        <label className="form-field">
          Stock status
          <select
            value={values.stockStatus}
            onChange={(e) => update('stockStatus', e.target.value as StockStatus)}
          >
            <option value="in_stock">In stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </label>
      ) : null}

      <label className="form-field">
        Image URL
        <input
          value={values.imageUrl}
          onChange={(e) => update('imageUrl', e.target.value)}
          placeholder="https://..."
        />
      </label>

      <label className="form-field form-checkbox">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => update('isActive', e.target.checked)}
        />
        Active
      </label>

      <label className="form-field form-checkbox">
        <input
          type="checkbox"
          checked={values.hasVariants}
          onChange={(e) => toggleVariants(e.target.checked)}
        />
        This product has variants (size, color, etc.)
      </label>

      {values.hasVariants ? (
        <ProductVariantsBuilder
          basePrice={Number(values.price) || 0}
          options={values.options}
          variants={values.variants}
          onChange={(options, variants) => onChange({ ...values, options, variants })}
        />
      ) : null}
    </>
  );
}
