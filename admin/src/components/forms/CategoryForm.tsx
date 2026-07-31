import type { CategoryInput, ProductCategory, ProductCategoryKind } from '@ecomm/shared/api.types';
import { getErrorMessage } from '@/lib/apiClient';

export interface CategoryFormValues {
  name: string;
  slug: string;
  parentId: string;
  kind: ProductCategoryKind;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string;
}

export const emptyCategoryForm: CategoryFormValues = {
  name: '',
  slug: '',
  parentId: '',
  kind: 'department',
  sortOrder: 0,
  isActive: true,
  imageUrl: '',
};

export function categoryToFormValues(category: {
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
  parentId?: string | null;
  kind?: ProductCategoryKind;
}): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    parentId: category.parentId ?? '',
    kind: category.kind ?? 'group',
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    imageUrl: category.imageUrl ?? '',
  };
}

export function formValuesToCategoryInput(values: CategoryFormValues): CategoryInput {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || undefined,
    parentId: values.parentId.trim() ? values.parentId : null,
    kind: values.kind,
    sortOrder: values.sortOrder,
    isActive: values.isActive,
    imageUrl: values.imageUrl.trim() || null,
  };
}

interface CategoryFormProps {
  values: CategoryFormValues;
  onChange: (values: CategoryFormValues) => void;
  variant?: 'product' | 'service';
  showImage?: boolean;
  pathPreview?: string;
  error?: unknown;
}

/** Minimal rename/edit form — no wizard, no kind/parent pickers for product categories. */
export function CategoryForm({
  values,
  onChange,
  variant = 'product',
  showImage = false,
  pathPreview,
  error,
}: CategoryFormProps) {
  function update<K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  if (variant === 'service') {
    return (
      <>
        {error ? <div className="error-box">{getErrorMessage(error)}</div> : null}
        <label className="form-field">
          Name *
          <input value={values.name} onChange={(e) => update('name', e.target.value)} required />
        </label>
        <label className="form-field">
          Slug
          <input value={values.slug} onChange={(e) => update('slug', e.target.value)} />
        </label>
        <label className="form-field">
          Sort order
          <input
            type="number"
            value={values.sortOrder}
            onChange={(e) => update('sortOrder', Number(e.target.value))}
          />
        </label>
        <label className="form-field">
          Image URL
          <input value={values.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} />
        </label>
        <label className="form-field form-checkbox">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => update('isActive', e.target.checked)}
          />
          Active
        </label>
      </>
    );
  }

  return (
    <>
      {error ? <div className="error-box">{getErrorMessage(error)}</div> : null}
      {pathPreview ? (
        <div className="category-preview-box">
          <span className="muted">In the app</span>
          <strong>{pathPreview}</strong>
        </div>
      ) : null}

      <label className="form-field">
        Name *
        <input
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Display name"
          required
        />
      </label>

      {showImage ? (
        <label className="form-field">
          Category avatar URL
          <input
            value={values.imageUrl}
            onChange={(e) => update('imageUrl', e.target.value)}
            placeholder="Leave empty to use first product image"
          />
          {values.imageUrl ? (
            <img src={values.imageUrl} alt="" className="category-avatar-preview" />
          ) : null}
          <span className="category-field-hint">
            Shown as the round icon in the app. Leave blank to auto-use the first product image in
            this category.
          </span>
        </label>
      ) : null}

      <details className="category-advanced">
        <summary>Advanced (optional)</summary>
        <label className="form-field">
          Sort order
          <input
            type="number"
            value={values.sortOrder}
            onChange={(e) => update('sortOrder', Number(e.target.value))}
          />
        </label>
        <label className="form-field">
          Slug
          <input
            value={values.slug}
            onChange={(e) => update('slug', e.target.value)}
            placeholder="Auto from name"
          />
        </label>
      </details>

      <label className="form-field form-checkbox">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => update('isActive', e.target.checked)}
        />
        Show in app
      </label>
    </>
  );
}

export function canSubmitCategoryForm(values: CategoryFormValues): boolean {
  return values.name.trim().length >= 2;
}
