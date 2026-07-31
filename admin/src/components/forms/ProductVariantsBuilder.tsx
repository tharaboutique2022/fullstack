import { useMemo } from 'react';
import type {
  ProductOptionInput,
  ProductOptionValueInput,
  ProductVariantInput,
} from '@ecomm/shared/api.types';

export type { ProductOptionInput, ProductVariantInput };

function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((combo) => curr.map((value) => [...combo, value])),
    [[]]
  );
}

function getValueText(entry: ProductOptionValueInput): string {
  return entry.value.trim();
}

export function generateVariantCombinations(
  options: ProductOptionInput[],
  basePrice: number
): ProductVariantInput[] {
  const valueGroups = options.map((option) =>
    option.values.map(getValueText).filter(Boolean)
  );
  if (!valueGroups.length || valueGroups.some((group) => group.length === 0)) {
    return [];
  }

  return cartesianProduct(valueGroups).map((optionValues) => ({
    optionValues,
    price: basePrice,
    stockStatus: 'in_stock',
    isActive: true,
  }));
}

function variantKey(optionValues: string[]): string {
  return optionValues.join('|');
}

const emptyOptionValue = (): ProductOptionValueInput => ({ value: '', imageUrl: '' });

interface OptionValuesEditorProps {
  values: ProductOptionValueInput[];
  onChange: (values: ProductOptionValueInput[]) => void;
}

function OptionValuesEditor({ values, onChange }: OptionValuesEditorProps) {
  function updateValue(index: number, patch: Partial<ProductOptionValueInput>) {
    onChange(values.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function addValue() {
    onChange([...values, emptyOptionValue()]);
  }

  function removeValue(index: number) {
    const next = values.filter((_, i) => i !== index);
    onChange(next.length ? next : [emptyOptionValue()]);
  }

  return (
    <div className="option-values-editor">
      <span className="option-values-label">Values</span>
      {values.map((entry, valueIndex) => (
        <div key={valueIndex} className="option-value-row">
          <input
            value={entry.value}
            onChange={(e) => updateValue(valueIndex, { value: e.target.value })}
            placeholder="e.g. Red, M, 32"
          />
          <input
            value={entry.imageUrl ?? ''}
            onChange={(e) => updateValue(valueIndex, { imageUrl: e.target.value })}
            placeholder="Swatch image URL (optional)"
          />
          {entry.imageUrl ? (
            <img
              src={entry.imageUrl}
              alt=""
              className="option-value-swatch"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => removeValue(valueIndex)}
            aria-label="Remove value"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary btn-sm" onClick={addValue}>
        + Add value
      </button>
    </div>
  );
}

interface ProductVariantsBuilderProps {
  basePrice: number;
  options: ProductOptionInput[];
  variants: ProductVariantInput[];
  onChange: (options: ProductOptionInput[], variants: ProductVariantInput[]) => void;
}

export function ProductVariantsBuilder({
  basePrice,
  options,
  variants,
  onChange,
}: ProductVariantsBuilderProps) {
  const canGenerate = useMemo(
    () =>
      options.length > 0 &&
      options.every(
        (option) => option.name.trim() && option.values.some((entry) => getValueText(entry))
      ),
    [options]
  );

  function updateOption(index: number, patch: Partial<ProductOptionInput>) {
    const next = options.map((option, i) => (i === index ? { ...option, ...patch } : option));
    onChange(next, variants);
  }

  function addOption() {
    onChange([...options, { name: '', values: [emptyOptionValue()] }], variants);
  }

  function removeOption(index: number) {
    onChange(
      options.filter((_, i) => i !== index),
      []
    );
  }

  function generateVariants() {
    const generated = generateVariantCombinations(options, Number(basePrice) || 0);
    const existingByKey = new Map(variants.map((variant) => [variantKey(variant.optionValues), variant]));
    const merged = generated.map((variant) => {
      const existing = existingByKey.get(variantKey(variant.optionValues));
      if (!existing) return variant;
      return {
        ...variant,
        price: existing.price,
        stockStatus: existing.stockStatus,
        sku: existing.sku,
        imageUrl: existing.imageUrl,
        isActive: existing.isActive,
      };
    });
    onChange(options, merged);
  }

  function updateVariant(index: number, patch: Partial<ProductVariantInput>) {
    const next = variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant));
    onChange(options, next);
  }

  return (
    <div className="variants-builder">
      <div className="variants-section-header">
        <div>
          <h4>Product options</h4>
          <p className="muted">Add options such as Size or Color. Use swatch images for color variants.</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addOption}>
          + Add option
        </button>
      </div>

      {options.map((option, index) => (
        <div key={index} className="variant-option-card">
          <div className="variant-option-header">
            <label className="form-field">
              Option name
              <input
                value={option.name}
                onChange={(e) => updateOption(index, { name: e.target.value })}
                placeholder="e.g. Size, Color"
              />
            </label>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => removeOption(index)}
            >
              Remove option
            </button>
          </div>
          <OptionValuesEditor
            values={option.values}
            onChange={(values) => updateOption(index, { values })}
          />
        </div>
      ))}

      <div className="variants-actions">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={generateVariants}
          disabled={!canGenerate}
        >
          Generate variants
        </button>
        <span className="muted">
          {variants.length ? `${variants.length} variant(s)` : 'No variants generated yet'}
        </span>
      </div>

      {variants.length > 0 ? (
        <div className="variants-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Combination</th>
                <th>Image URL</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>SKU</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={index}>
                  <td>{variant.optionValues.join(' / ')}</td>
                  <td>
                    <div className="variant-image-cell">
                      <input
                        className="table-input"
                        value={variant.imageUrl ?? ''}
                        onChange={(e) =>
                          updateVariant(index, { imageUrl: e.target.value.trim() || null })
                        }
                        placeholder="https://..."
                      />
                      {variant.imageUrl ? (
                        <img
                          src={variant.imageUrl}
                          alt=""
                          className="variant-thumb"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="table-input"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, { price: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="table-input"
                      value={variant.stockStatus ?? 'in_stock'}
                      onChange={(e) =>
                        updateVariant(index, {
                          stockStatus: e.target.value as 'in_stock' | 'out_of_stock',
                        })
                      }
                    >
                      <option value="in_stock">In stock</option>
                      <option value="out_of_stock">Out of stock</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="table-input"
                      value={variant.sku ?? ''}
                      onChange={(e) => updateVariant(index, { sku: e.target.value || null })}
                      placeholder="Optional"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
