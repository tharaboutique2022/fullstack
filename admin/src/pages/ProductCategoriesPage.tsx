import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProductCategory, ProductCategoryKind } from '@ecomm/shared/api.types';
import { useProductCategories, useProductCategoryMutations } from '@/hooks/useCatalog';
import { QueryState } from '@/components/QueryState';
import { Modal } from '@/components/Modal';
import { CategoryManager } from '@/components/catalog/CategoryManager';
import {
  CategoryForm,
  canSubmitCategoryForm,
  categoryToFormValues,
  emptyCategoryForm,
  formValuesToCategoryInput,
  type CategoryFormValues,
} from '@/components/forms/CategoryForm';
import { getCategoryPath } from '@/lib/categoryHelpers';
import { getErrorMessage } from '@/lib/apiClient';

type CategoryModal =
  | { mode: 'create-shop' }
  | { mode: 'edit'; category: ProductCategory };

export function ProductCategoriesPage() {
  const categoriesQuery = useProductCategories();
  const categoryMutations = useProductCategoryMutations();

  const [categoryModal, setCategoryModal] = useState<CategoryModal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormValues>(emptyCategoryForm);

  const categories = categoriesQuery.data ?? [];

  const categoryModalTitle =
    categoryModal?.mode === 'create-shop'
      ? 'Add main shop tile'
      : categoryModal?.mode === 'edit'
        ? `Edit “${categoryModal.category.name}”`
        : 'Edit category';

  const editPathPreview =
    categoryModal?.mode === 'edit'
      ? getCategoryPath(categoryModal.category, categories)
      : undefined;

  function openAddShop() {
    setCategoryForm({ ...emptyCategoryForm, kind: 'department', parentId: '' });
    setCategoryModal({ mode: 'create-shop' });
  }

  function openEditCategory(category: ProductCategory) {
    setCategoryForm(categoryToFormValues(category));
    setCategoryModal({ mode: 'edit', category });
  }

  async function handleQuickCreate(input: {
    name: string;
    kind: ProductCategoryKind;
    parentId: string | null;
  }) {
    await categoryMutations.create.mutateAsync({
      name: input.name,
      kind: input.kind,
      parentId: input.parentId,
    });
  }

  async function handleCategorySubmit() {
    const body = formValuesToCategoryInput(categoryForm);
    if (categoryModal?.mode === 'edit') {
      await categoryMutations.update.mutateAsync({ id: categoryModal.category.id, body });
    } else {
      await categoryMutations.create.mutateAsync(body);
    }
    setCategoryModal(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await categoryMutations.remove.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const categoryMutationError = categoryMutations.create.error ?? categoryMutations.update.error;
  const deleteError = categoryMutations.remove.error;

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Product categories</h2>
          <p className="muted">Set up how customers browse in the mobile app Categories tab.</p>
        </div>
        <Link to="/products" className="btn btn-secondary">
          Go to products →
        </Link>
      </div>

      <QueryState
        isLoading={categoriesQuery.isPending && !categoriesQuery.data}
        isError={categoriesQuery.isError}
        error={categoriesQuery.error}
      >
        <div className="card section-card">
          <CategoryManager
            categories={categories}
            onEdit={openEditCategory}
            onDelete={setDeleteTarget}
            onQuickCreate={handleQuickCreate}
            onAddShop={openAddShop}
            isSaving={categoryMutations.create.isPending}
          />
        </div>
      </QueryState>

      <Modal
        open={!!categoryModal}
        title={categoryModalTitle}
        onClose={() => setCategoryModal(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setCategoryModal(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                !canSubmitCategoryForm(categoryForm) ||
                categoryMutations.create.isPending ||
                categoryMutations.update.isPending
              }
              onClick={handleCategorySubmit}
            >
              {categoryMutations.create.isPending || categoryMutations.update.isPending
                ? 'Saving...'
                : 'Save'}
            </button>
          </>
        }
      >
        <CategoryForm
          values={categoryForm}
          onChange={setCategoryForm}
          showImage
          pathPreview={editPathPreview}
          error={categoryMutationError}
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
              disabled={categoryMutations.remove.isPending}
              onClick={handleDelete}
            >
              {categoryMutations.remove.isPending ? 'Deleting...' : 'Delete'}
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
