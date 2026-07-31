import { useState } from 'react';
import type { Order, OrderStatus } from '@ecomm/shared/api.types';
import { formatInstantInTimeZone, formatIndianMobileDisplay } from '@ecomm/shared';
import { useAdminOrders, useOrderStatusMutation } from '@/hooks/useOperations';
import { QueryState } from '@/components/QueryState';
import { Modal } from '@/components/Modal';
import { getErrorMessage } from '@/lib/apiClient';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'delivered',
  'cancelled',
];

function formatIst(iso: string) {
  return formatInstantInTimeZone(iso, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function displayPhone(phone?: string | null) {
  return phone ? formatIndianMobileDisplay(phone) : '—';
}

function statusLabel(status: OrderStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus>('pending');

  const ordersQuery = useAdminOrders({
    page,
    status: statusFilter || undefined,
  });
  const statusMutation = useOrderStatusMutation();

  function openOrder(order: Order) {
    setSelectedOrder(order);
    setNextStatus(order.status);
  }

  async function handleStatusUpdate() {
    if (!selectedOrder) return;
    await statusMutation.mutateAsync({ id: selectedOrder.id, status: nextStatus });
    setSelectedOrder((current) =>
      current ? { ...current, status: nextStatus } : null
    );
  }

  const totalPages = ordersQuery.data?.pagination.totalPages ?? 1;

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Orders</h2>
          <p className="muted">View and update customer product orders.</p>
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as OrderStatus | '');
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      <QueryState
        isLoading={ordersQuery.isPending && !ordersQuery.data}
        isError={ordersQuery.isError}
        error={ordersQuery.error}
        isEmpty={!ordersQuery.data?.items.length}
        emptyMessage="No orders yet."
      >
        <div className="card section-card">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.data?.items.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>
                    <div>{order.user?.name ?? '—'}</div>
                    <div className="muted">{order.user?.email ?? order.userId}</div>
                  </td>
                  <td>{displayPhone(order.contactPhone ?? order.user?.phone)}</td>
                  <td>₹{order.totalAmount}</td>
                  <td>
                    <span className={`status-pill status-${order.status}`}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td>{formatIst(order.createdAt)}</td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openOrder(order)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 ? (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span className="muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </QueryState>

      <Modal
        open={!!selectedOrder}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : 'Order'}
        onClose={() => setSelectedOrder(null)}
        wide
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={statusMutation.isPending || nextStatus === selectedOrder?.status}
              onClick={handleStatusUpdate}
            >
              {statusMutation.isPending ? 'Saving…' : 'Update status'}
            </button>
          </>
        }
      >
        {selectedOrder ? (
          <>
            <div className="detail-grid">
              <div>
                <div className="muted">Customer</div>
                <div>{selectedOrder.user?.name ?? '—'}</div>
                <div className="muted">{selectedOrder.user?.email}</div>
              </div>
              <div>
                <div className="muted">Delivery phone</div>
                <div>{displayPhone(selectedOrder.contactPhone ?? selectedOrder.user?.phone)}</div>
              </div>
              <div>
                <div className="muted">Shipping address</div>
                <div>{selectedOrder.shippingAddress ?? '—'}</div>
              </div>
              <div>
                <div className="muted">Status</div>
                <select
                  className="filter-select"
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="muted">Placed at (IST)</div>
                <div>{formatIst(selectedOrder.createdAt)}</div>
              </div>
            </div>

            {statusMutation.error ? (
              <p className="form-error">{getErrorMessage(statusMutation.error)}</p>
            ) : null}

            <h4 style={{ marginTop: 24 }}>Items</h4>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.variantTitle ?? '—'}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.priceAtOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="detail-totals">
              <div>
                <span className="muted">Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div>
                <span className="muted">Platform fee</span>
                <span>₹{selectedOrder.platformFee}</span>
              </div>
              <div>
                <span className="muted">Shipping</span>
                <span>₹{selectedOrder.shippingCharge}</span>
              </div>
              <div className="detail-total-row">
                <span>Total</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            {selectedOrder.notes ? (
              <>
                <h4 style={{ marginTop: 16 }}>Notes</h4>
                <p>{selectedOrder.notes}</p>
              </>
            ) : null}
          </>
        ) : null}
      </Modal>
    </>
  );
}
