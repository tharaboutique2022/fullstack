import {
  useProductCategories,
  useProducts,
  useServiceCategories,
  useServices,
} from '@/hooks/useCatalog';
import { useAdminBookings, useAdminOrders } from '@/hooks/useOperations';
import { QueryState } from '@/components/QueryState';

export function DashboardPage() {
  const productCategories = useProductCategories();
  const products = useProducts();
  const serviceCategories = useServiceCategories();
  const services = useServices();
  const orders = useAdminOrders();
  const bookings = useAdminBookings();

  const isLoading =
    (productCategories.isPending && !productCategories.data) ||
    (products.isPending && !products.data) ||
    (serviceCategories.isPending && !serviceCategories.data) ||
    (services.isPending && !services.data) ||
    (orders.isPending && !orders.data) ||
    (bookings.isPending && !bookings.data);

  const isError =
    productCategories.isError ||
    products.isError ||
    serviceCategories.isError ||
    services.isError ||
    orders.isError ||
    bookings.isError;

  const error =
    productCategories.error ??
    products.error ??
    serviceCategories.error ??
    services.error ??
    orders.error ??
    bookings.error;

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Overview of catalog and customer activity.</p>
        </div>
        <span className="badge">Admin</span>
      </div>

      <QueryState isLoading={isLoading} isError={isError} error={error}>
        <div className="grid">
          <div className="card">
            <div className="muted">Product Categories</div>
            <div className="stat">{productCategories.data?.length ?? 0}</div>
          </div>
          <div className="card">
            <div className="muted">Products</div>
            <div className="stat">{products.data?.pagination.total ?? 0}</div>
          </div>
          <div className="card">
            <div className="muted">Service Categories</div>
            <div className="stat">{serviceCategories.data?.length ?? 0}</div>
          </div>
          <div className="card">
            <div className="muted">Services</div>
            <div className="stat">{services.data?.pagination.total ?? 0}</div>
          </div>
          <div className="card">
            <div className="muted">Orders</div>
            <div className="stat">{orders.data?.pagination.total ?? 0}</div>
          </div>
          <div className="card">
            <div className="muted">Bookings</div>
            <div className="stat">{bookings.data?.pagination.total ?? 0}</div>
          </div>
        </div>
      </QueryState>
    </>
  );
}
