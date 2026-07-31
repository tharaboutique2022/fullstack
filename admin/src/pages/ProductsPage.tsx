import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@ecomm/shared/api.types';
import {
  useProductCategories,
  useProductMutations,
  useProducts,
} from '@/hooks/useCatalog';
import { QueryState } from '@/components/QueryState';
import { Modal } from '@/components/Modal';
import {
  ProductForm,
  emptyProductForm,
  formValuesToProductInput,
  productToFormValues,
  type ProductFormValues,
} from '@/components/forms/ProductForm';
import { getErrorMessage } from '@/lib/apiClient';

type ProductModal = { mode: 'create' } | { mode: 'edit'; product: Product };

export function ProductsPage() {
  const categoriesQuery = useProductCategories();
  const productsQuery = useProducts();
  const productMutations = useProductMutations();

  const [productModal, setProductModal] = useState<ProductModal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormValues>(emptyProductForm);

  const categories = categoriesQuery.data ?? [];
  const hasProductGroups = categories.some((category) => category.kind === 'leaf');

  function openCreateProduct() {
    const firstLeafId = categories.find((category) => category.kind === 'leaf')?.id ?? '';
    setProductForm({ ...emptyProductForm, categoryId: firstLeafId });
    setProductModal({ mode: 'create' });
  }

  function openEditProduct(product: Product) {
    setProductForm(productToFormValues(product));
    setProductModal({ mode: 'edit', product });
  }

  async function handleProductSubmit() {
    const body = formValuesToProductInput(productForm);
    if (productModal?.mode === 'edit') {
      await productMutations.update.mutateAsync({ id: productModal.product.id, body });
    } else {
      await productMutations.create.mutateAsync(body);
    }
    setProductModal(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await productMutations.remove.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const productMutationError = productMutations.create.error ?? productMutations.update.error;
  const deleteError = productMutations.remove.error;

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Products</h2>
          <p className="muted">Add and manage items customers can buy.</p>
        </div>
        <Link to="/product-categories" className="btn btn-secondary">
          Manage categories →
        </Link>
      </div>

      <QueryState
        isLoading={
          (categoriesQuery.isPending && !categoriesQuery.data) ||
          (productsQuery.isPending && !productsQuery.data)
        }
        isError={categoriesQuery.isError || productsQuery.isError}
        error={categoriesQuery.error ?? productsQuery.error}
      >
        <div className="card section-card">
          <div className="section-header">
            <h3>All products</h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateProduct}
              disabled={!hasProductGroups}
            >
              + Add product
            </button>
          </div>

          {!hasProductGroups ? (
            <div className="category-manager-empty">
              <p>Set up categories before adding products.</p>
              <Link to="/product-categories" className="btn btn-primary">
                Open product categories
              </Link>
            </div>
          ) : (
            <QueryState
              isLoading={false}
              isError={false}
              isEmpty={!productsQuery.data?.items.length}
              emptyMessage="No products yet. Click Add product to create one."
            >
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsQuery.data?.items.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.brand ?? '-'}</td>
                      <td>{product.category?.name ?? '-'}</td>
                      <td>
                        {product.hasVariants ? (
                          <>
                            From ₹{product.priceFrom}
                            <div className="muted" style={{ fontSize: '0.85rem' }}>
                              {product.variants?.length ?? 0} variants
                            </div>
                          </>
                        ) : (
                          <>₹{product.price}</>
                        )}
                      </td>
                      <td>
                        {product.hasVariants
                          ? `${product.variants?.filter((v) => v.stockStatus === 'in_stock').length ?? 0} in stock`
                          : product.stockStatus === 'in_stock'
                            ? 'In stock'
                            : 'Out of stock'}
                      </td>
                      <td>
                        <span className={`status-pill ${product.isActive ? 'active' : 'inactive'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(product)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </QueryState>
          )}
        </div>
      </QueryState>

      <Modal
        open={!!productModal}
        title={productModal?.mode === 'edit' ? 'Edit product' : 'Add product'}
        onClose={() => setProductModal(null)}
        wide
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setProductModal(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={productMutations.create.isPending || productMutations.update.isPending}
              onClick={handleProductSubmit}
            >
              {productMutations.create.isPending || productMutations.update.isPending
                ? 'Saving...'
                : 'Save'}
            </button>
          </>
        }
      >
        <ProductForm
          values={productForm}
          categories={categories}
          onChange={setProductForm}
          error={productMutationError}
        />
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Confirm delete"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={productMutations.remove.isPending}
              onClick={handleDelete}
            >
              {productMutations.remove.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        {deleteError ? <div className="error-box">{getErrorMessage(deleteError)}</div> : null}
        <p>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be
          undone.
        </p>
      </Modal>
    </>
  );
}
