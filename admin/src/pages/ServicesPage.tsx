import { useState } from 'react';
import type { ServiceProvider, ServiceCategory } from '@ecomm/shared/api.types';
import {
  useServiceCategories,
  useServiceCategoryMutations,
  useServiceMutations,
  useServices,
} from '@/hooks/useCatalog';
import { QueryState } from '@/components/QueryState';
import { Modal } from '@/components/Modal';
import {
  CategoryForm,
  categoryToFormValues,
  emptyCategoryForm,
  formValuesToCategoryInput,
  type CategoryFormValues,
} from '@/components/forms/CategoryForm';
import {
  ServiceForm,
  emptyServiceForm,
  formValuesToServiceInput,
  serviceToFormValues,
  type ServiceFormValues,
} from '@/components/forms/ServiceForm';
import { getErrorMessage } from '@/lib/apiClient';

type CategoryModal = { mode: 'create' } | { mode: 'edit'; category: ServiceCategory };
type ServiceModal = { mode: 'create' } | { mode: 'edit'; service: ServiceProvider };
type DeleteTarget =
  | { type: 'category'; item: ServiceCategory }
  | { type: 'service'; item: ServiceProvider };

export function ServicesPage() {
  const categoriesQuery = useServiceCategories();
  const servicesQuery = useServices();
  const categoryMutations = useServiceCategoryMutations();
  const serviceMutations = useServiceMutations();

  const [categoryModal, setCategoryModal] = useState<CategoryModal | null>(null);
  const [serviceModal, setServiceModal] = useState<ServiceModal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormValues>(emptyCategoryForm);
  const [serviceForm, setServiceForm] = useState<ServiceFormValues>(emptyServiceForm);

  function openCreateCategory() {
    setCategoryForm(emptyCategoryForm);
    setCategoryModal({ mode: 'create' });
  }

  function openEditCategory(category: ServiceCategory) {
    setCategoryForm(categoryToFormValues(category));
    setCategoryModal({ mode: 'edit', category });
  }

  function openCreateService() {
    const firstCategoryId = categoriesQuery.data?.[0]?.id ?? '';
    setServiceForm({ ...emptyServiceForm, categoryId: firstCategoryId });
    setServiceModal({ mode: 'create' });
  }

  function openEditService(service: ServiceProvider) {
    setServiceForm(serviceToFormValues(service));
    setServiceModal({ mode: 'edit', service });
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

  async function handleServiceSubmit() {
    const body = formValuesToServiceInput(serviceForm);
    if (serviceModal?.mode === 'edit') {
      await serviceMutations.update.mutateAsync({ id: serviceModal.service.id, body });
    } else {
      await serviceMutations.create.mutateAsync(body);
    }
    setServiceModal(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'category') {
      await categoryMutations.remove.mutateAsync(deleteTarget.item.id);
    } else {
      await serviceMutations.remove.mutateAsync(deleteTarget.item.id);
    }
    setDeleteTarget(null);
  }

  const categoryMutationError = categoryMutations.create.error ?? categoryMutations.update.error;
  const serviceMutationError = serviceMutations.create.error ?? serviceMutations.update.error;
  const deleteError = categoryMutations.remove.error ?? serviceMutations.remove.error;

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Services</h2>
          <p className="muted">Manage beauty service categories and offerings.</p>
        </div>
      </div>

      <QueryState
        isLoading={
          (categoriesQuery.isPending && !categoriesQuery.data) ||
          (servicesQuery.isPending && !servicesQuery.data)
        }
        isError={categoriesQuery.isError || servicesQuery.isError}
        error={categoriesQuery.error ?? servicesQuery.error}
      >
        <div className="card section-card">
          <div className="section-header">
            <h3>Service categories</h3>
            <button type="button" className="btn btn-primary" onClick={openCreateCategory}>
              + Add category
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Sort</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoriesQuery.data?.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.sortOrder}</td>
                  <td>
                    <span className={`status-pill ${category.isActive ? 'active' : 'inactive'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditCategory(category)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget({ type: 'category', item: category })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card section-card">
          <div className="section-header">
            <h3>Service providers</h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateService}
              disabled={!categoriesQuery.data?.length}
            >
              + Add provider
            </button>
          </div>

          {!categoriesQuery.data?.length ? (
            <p className="muted">Add a category first before creating services.</p>
          ) : (
            <QueryState
              isLoading={false}
              isError={false}
              isEmpty={!servicesQuery.data?.items.length}
              emptyMessage="No providers yet. Click Add provider to create one."
            >
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price from</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servicesQuery.data?.items.map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.category?.name ?? '-'}</td>
                      <td>₹{service.priceFrom}</td>
                      <td>{service.location ?? '-'}</td>
                      <td>
                        <span className={`status-pill ${service.isActive ? 'active' : 'inactive'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditService(service)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget({ type: 'service', item: service })}
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
        open={!!categoryModal}
        title={categoryModal?.mode === 'edit' ? 'Edit category' : 'Add category'}
        onClose={() => setCategoryModal(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setCategoryModal(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={categoryMutations.create.isPending || categoryMutations.update.isPending}
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
          variant="service"
          error={categoryMutationError}
        />
      </Modal>

      <Modal
        open={!!serviceModal}
        title={serviceModal?.mode === 'edit' ? 'Edit provider' : 'Add provider'}
        onClose={() => setServiceModal(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setServiceModal(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={serviceMutations.create.isPending || serviceMutations.update.isPending}
              onClick={handleServiceSubmit}
            >
              {serviceMutations.create.isPending || serviceMutations.update.isPending
                ? 'Saving...'
                : 'Save'}
            </button>
          </>
        }
      >
        <ServiceForm
          values={serviceForm}
          categories={categoriesQuery.data ?? []}
          onChange={setServiceForm}
          error={serviceMutationError}
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
              disabled={categoryMutations.remove.isPending || serviceMutations.remove.isPending}
              onClick={handleDelete}
            >
              {categoryMutations.remove.isPending || serviceMutations.remove.isPending
                ? 'Deleting...'
                : 'Delete'}
            </button>
          </>
        }
      >
        {deleteError ? (
          <div className="error-box">{getErrorMessage(deleteError)}</div>
        ) : null}
        <p>
          Are you sure you want to delete <strong>{deleteTarget?.item.name}</strong>? This action
          cannot be undone.
        </p>
      </Modal>
    </>
  );
}
