import { useMemo, useState } from 'react';
import type { ProductCategory, ProductCategoryKind } from '@ecomm/shared/api.types';
import {
  buildCategoryTree,
  getCategoryPath,
  getMisconfiguredShopRoots,
  isBrandsGroup,
  type CategoryTreeNode,
} from '@/lib/categoryHelpers';

export type CategoryAddIntent =
  | { type: 'shop' }
  | { type: 'menu'; parent: ProductCategory }
  | { type: 'brand'; parent: ProductCategory }
  | { type: 'products'; parent: ProductCategory };

interface CategoryManagerProps {
  categories: ProductCategory[];
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
  onQuickCreate: (input: {
    name: string;
    kind: ProductCategoryKind;
    parentId: string | null;
  }) => Promise<void>;
  onAddShop: () => void;
  isSaving?: boolean;
}

export function CategoryManager({
  categories,
  onEdit,
  onDelete,
  onQuickCreate,
  onAddShop,
  isSaving = false,
}: CategoryManagerProps) {
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const hiddenRoots = useMemo(() => getMisconfiguredShopRoots(categories), [categories]);
  const [expandedShops, setExpandedShops] = useState<Set<string>>(() => new Set(tree.map((node) => node.id)));
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function toggleShop(id: string) {
    setExpandedShops((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setDraft(key: string, value: string) {
    setDrafts((current) => ({ ...current, [key]: value }));
  }

  async function submitDraft(key: string, kind: ProductCategoryKind, parentId: string | null) {
    const name = (drafts[key] ?? '').trim();
    if (!name) return;
    await onQuickCreate({ name, kind, parentId });
    setDraft(key, '');
  }

  return (
    <div className="category-manager">
      <details className="category-help-details">
        <summary>How does this appear in the app?</summary>
        <p>
          Customers tap a <strong>main shop tile</strong> (Men, Women), open a <strong>menu item</strong>{' '}
          (Shirt, Brands), then see <strong>products</strong>. Put brand names only inside a menu called{' '}
          <strong>Brands</strong>.
        </p>
        <p className="muted">
          Example path: Men → Shirt → Casual Shirts → product with brand Adidas
        </p>
      </details>

      {hiddenRoots.length > 0 ? (
        <div className="category-warning-box">
          <strong>Not shown in app</strong>
          <p className="muted">
            These top-level categories are not shop tiles. Only items added via “Add main shop tile”
            appear in the app. Edit to move under a shop, or delete if unused.
          </p>
          <ul className="category-warning-list">
            {hiddenRoots.map((category) => (
              <li key={category.id}>
                {category.name} ({category.kind})
                <button type="button" className="chip-action" onClick={() => onEdit(category)}>
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tree.length === 0 ? (
        <div className="category-manager-empty">
          <p>No shop tiles yet.</p>
          <button type="button" className="btn btn-primary" onClick={onAddShop}>
            Add your first shop tile (e.g. Women)
          </button>
        </div>
      ) : (
        <div className="shop-tile-grid">
          {tree.map((shop) => (
            <ShopPanel
              key={shop.id}
              shop={shop}
              expanded={expandedShops.has(shop.id)}
              onToggle={() => toggleShop(shop.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              draft={drafts[`menu-${shop.id}`] ?? ''}
              onDraftChange={(value) => setDraft(`menu-${shop.id}`, value)}
              onAddMenu={() => submitDraft(`menu-${shop.id}`, 'group', shop.id)}
              isSaving={isSaving}
              drafts={drafts}
              setDraft={setDraft}
              onQuickCreate={onQuickCreate}
            />
          ))}
        </div>
      )}

      {tree.length > 0 ? (
        <button type="button" className="btn btn-secondary category-add-shop" onClick={onAddShop}>
          + Add another main shop tile
        </button>
      ) : null}
    </div>
  );
}

function ShopPanel({
  shop,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  draft,
  onDraftChange,
  onAddMenu,
  isSaving,
  drafts,
  setDraft,
  onQuickCreate,
}: {
  shop: CategoryTreeNode;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  onAddMenu: () => void;
  isSaving: boolean;
  drafts: Record<string, string>;
  setDraft: (key: string, value: string) => void;
  onQuickCreate: CategoryManagerProps['onQuickCreate'];
}) {
  return (
    <div className="shop-panel">
      <div className="shop-panel-head">
        {shop.imageUrl ? (
          <img src={shop.imageUrl} alt="" className="shop-panel-thumb" />
        ) : (
          <div className="shop-panel-thumb shop-panel-thumb-fallback">{shop.name.slice(0, 1)}</div>
        )}
        <div className="shop-panel-title">
          <strong>{shop.name}</strong>
          <span className="muted">Main shop tile in app</span>
          {!shop.isActive ? <span className="status-pill inactive">Hidden from app</span> : null}
        </div>
        <div className="table-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onToggle}>
            {expanded ? 'Hide menu' : 'Manage menu'}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(shop)}>
            Edit
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(shop)}>
            Delete
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="shop-panel-body">
          {shop.children.length === 0 ? (
            <p className="muted shop-panel-hint">
              Add menu items customers tap inside {shop.name} — e.g. <strong>Shirt</strong>,{' '}
              <strong>Brands</strong>, <strong>Makeup Items</strong>.
            </p>
          ) : (
            shop.children.map((menu) => (
              <MenuBlock
                key={menu.id}
                menu={menu}
                shopName={shop.name}
                onEdit={onEdit}
                onDelete={onDelete}
                drafts={drafts}
                setDraft={setDraft}
                onQuickCreate={onQuickCreate}
                isSaving={isSaving}
              />
            ))
          )}

          <InlineAddRow
            label={`Add menu item under ${shop.name}`}
            placeholder='e.g. Shirt, Brands, Makeup Items'
            value={draft}
            onChange={onDraftChange}
            onSubmit={onAddMenu}
            disabled={isSaving}
            hint='Use the exact name Brands if you want a brand list (Adidas, Lakme…)'
          />
        </div>
      ) : null}
    </div>
  );
}

function MenuBlock({
  menu,
  shopName,
  onEdit,
  onDelete,
  drafts,
  setDraft,
  onQuickCreate,
  isSaving,
}: {
  menu: CategoryTreeNode;
  shopName: string;
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
  drafts: Record<string, string>;
  setDraft: (key: string, value: string) => void;
  onQuickCreate: CategoryManagerProps['onQuickCreate'];
  isSaving: boolean;
}) {
  const brands = isBrandsGroup(menu);

  async function submitChild(kind: ProductCategoryKind) {
    const key = `${brands ? 'brand' : 'products'}-${menu.id}`;
    const name = (drafts[key] ?? '').trim();
    if (!name) return;
    await onQuickCreate({ name, kind, parentId: menu.id });
    setDraft(key, '');
  }

  return (
    <div className={`menu-block${brands ? ' menu-block-brands' : ''}`}>
      <div className="menu-block-head">
        <div>
          <strong>{menu.name}</strong>
          <span className="muted">
            {brands ? 'Brand filters' : 'Opens product groups'}
          </span>
        </div>
        <div className="table-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(menu)}>
            Edit
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(menu)}>
            Delete
          </button>
        </div>
      </div>

      {brands ? (
        <>
          <ul className="category-chip-list">
            {menu.children.map((brand) => (
              <li key={brand.id} className="category-chip">
                <span>{brand.name}</span>
                <button type="button" className="chip-action" onClick={() => onEdit(brand)}>
                  Edit
                </button>
                <button type="button" className="chip-action danger" onClick={() => onDelete(brand)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <InlineAddRow
            label="Add brand name"
            placeholder="e.g. Adidas, Lakme"
            value={drafts[`brand-${menu.id}`] ?? ''}
            onChange={(value) => setDraft(`brand-${menu.id}`, value)}
            onSubmit={() => submitChild('brand')}
            disabled={isSaving}
            hint="When adding products, use the same brand name on the product."
          />
        </>
      ) : (
        <>
          <ul className="category-chip-list">
            {menu.children.map((leaf) => (
              <li key={leaf.id} className="category-chip category-chip-product">
                <span>{leaf.name}</span>
                <span className="muted">Products here</span>
                <button type="button" className="chip-action" onClick={() => onEdit(leaf)}>
                  Edit
                </button>
                <button type="button" className="chip-action danger" onClick={() => onDelete(leaf)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <InlineAddRow
            label={`Add product group under ${shopName} → ${menu.name}`}
            placeholder="e.g. Casual Shirts, Lipstick"
            value={drafts[`products-${menu.id}`] ?? ''}
            onChange={(value) => setDraft(`products-${menu.id}`, value)}
            onSubmit={() => submitChild('leaf')}
            disabled={isSaving}
            hint="Assign this when you add a product in the table below."
          />
        </>
      )}
    </div>
  );
}

function InlineAddRow({
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
  disabled,
  hint,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <form
      className="inline-add-row"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="inline-add-label">{label}</label>
      <div className="inline-add-controls">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={disabled || !value.trim()}>
          Add
        </button>
      </div>
      {hint ? <span className="category-field-hint">{hint}</span> : null}
    </form>
  );
}

export function getCategoryAddIntentLabel(intent: CategoryAddIntent): string {
  switch (intent.type) {
    case 'shop':
      return 'Add main shop tile';
    case 'menu':
      return `Add menu under ${intent.parent.name}`;
    case 'brand':
      return 'Add brand name';
    case 'products':
      return 'Add product group';
  }
}

export function getCategoryPathLabel(category: ProductCategory, categories: ProductCategory[]): string {
  return getCategoryPath(category, categories);
}
