import type { ServiceCategory, ServiceProviderInput } from '@ecomm/shared/api.types';
import { getErrorMessage } from '@/lib/apiClient';

export interface ServiceFormValues {
  categoryId: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  priceFrom: string;
  location: string;
  isActive: boolean;
  imageUrl: string;
}

export const emptyServiceForm: ServiceFormValues = {
  categoryId: '',
  name: '',
  slug: '',
  tagline: '',
  description: '',
  priceFrom: '',
  location: '',
  isActive: true,
  imageUrl: '',
};

export function serviceToFormValues(service: {
  categoryId: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  priceFrom: string;
  location: string | null;
  isActive: boolean;
  imageUrl: string | null;
}): ServiceFormValues {
  return {
    categoryId: service.categoryId,
    name: service.name,
    slug: service.slug,
    tagline: service.tagline ?? '',
    description: service.description ?? '',
    priceFrom: service.priceFrom,
    location: service.location ?? '',
    isActive: service.isActive,
    imageUrl: service.imageUrl ?? '',
  };
}

export function formValuesToServiceInput(values: ServiceFormValues): ServiceProviderInput {
  return {
    categoryId: values.categoryId,
    name: values.name.trim(),
    slug: values.slug.trim() || undefined,
    tagline: values.tagline.trim() || null,
    description: values.description.trim() || null,
    priceFrom: Number(values.priceFrom),
    location: values.location.trim() || null,
    isActive: values.isActive,
    imageUrl: values.imageUrl.trim() || null,
  };
}

interface ServiceFormProps {
  values: ServiceFormValues;
  categories: ServiceCategory[];
  onChange: (values: ServiceFormValues) => void;
  error?: unknown;
}

export function ServiceForm({ values, categories, onChange, error }: ServiceFormProps) {
  function update<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <>
      {error ? <div className="error-box">{getErrorMessage(error)}</div> : null}

      <label className="form-field">
        Category *
        <select
          value={values.categoryId}
          onChange={(e) => update('categoryId', e.target.value)}
          required
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        Name *
        <input
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Nandhini Mehandi"
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
        Tagline
        <input
          value={values.tagline}
          onChange={(e) => update('tagline', e.target.value)}
          placeholder="Short headline"
        />
      </label>

      <label className="form-field">
        Price from (₹) *
        <input
          type="number"
          min="0"
          step="0.01"
          value={values.priceFrom}
          onChange={(e) => update('priceFrom', e.target.value)}
          required
        />
      </label>

      <label className="form-field">
        Location
        <input
          value={values.location}
          onChange={(e) => update('location', e.target.value)}
          placeholder="Area, City"
        />
      </label>

      <label className="form-field">
        Description
        <textarea
          rows={3}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Provider description"
        />
      </label>

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
    </>
  );
}
