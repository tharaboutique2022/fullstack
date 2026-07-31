import { useEffect, useState } from 'react';
import type { Booking, BookingStatus, PaymentStatus } from '@ecomm/shared/api.types';
import { formatInstantInTimeZone, formatIndianMobileDisplay } from '@ecomm/shared';
import {
  useAdminBookings,
  useBookingPaymentMutation,
  useBookingStatusMutation,
} from '@/hooks/useOperations';
import { QueryState } from '@/components/QueryState';
import { Modal } from '@/components/Modal';
import { getErrorMessage } from '@/lib/apiClient';

const BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

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

function statusLabel(status: BookingStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function paymentLabel(status: PaymentStatus) {
  if (status === 'paid') return 'Paid';
  if (status === 'failed') return 'Failed';
  if (status === 'refunded') return 'Refunded';
  return 'Pending';
}

export function BookingsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [nextStatus, setNextStatus] = useState<BookingStatus>('pending');
  const [nextPaymentStatus, setNextPaymentStatus] = useState<PaymentStatus>('pending');
  const [negotiatedAmount, setNegotiatedAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const bookingsQuery = useAdminBookings({
    page,
    status: statusFilter || undefined,
  });
  const statusMutation = useBookingStatusMutation();
  const paymentMutation = useBookingPaymentMutation();

  useEffect(() => {
    if (!selectedBooking) return;
    setNextStatus(selectedBooking.status);
    setNextPaymentStatus(selectedBooking.paymentStatus);
    setNegotiatedAmount(String(selectedBooking.totalAmount));
    setPaymentNotes(selectedBooking.notes ?? '');
  }, [selectedBooking]);

  function openBooking(booking: Booking) {
    setSelectedBooking(booking);
  }

  async function handleStatusUpdate() {
    if (!selectedBooking) return;
    await statusMutation.mutateAsync({ id: selectedBooking.id, status: nextStatus });
    setSelectedBooking((current) =>
      current ? { ...current, status: nextStatus } : null
    );
  }

  async function handlePaymentUpdate() {
    if (!selectedBooking) return;

    const amount = Number(negotiatedAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const updated = await paymentMutation.mutateAsync({
      id: selectedBooking.id,
      paymentStatus: nextPaymentStatus,
      totalAmount: amount,
      notes: paymentNotes.trim() || null,
    });

    setSelectedBooking(updated);
  }

  const totalPages = bookingsQuery.data?.pagination.totalPages ?? 1;
  const paymentDirty =
    selectedBooking &&
    (nextPaymentStatus !== selectedBooking.paymentStatus ||
      negotiatedAmount !== String(selectedBooking.totalAmount) ||
      paymentNotes !== (selectedBooking.notes ?? ''));

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Bookings</h2>
          <p className="muted">View and manage beauty service appointments.</p>
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as BookingStatus | '');
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      <QueryState
        isLoading={bookingsQuery.isPending && !bookingsQuery.data}
        isError={bookingsQuery.isError}
        error={bookingsQuery.error}
        isEmpty={!bookingsQuery.data?.items.length}
        emptyMessage="No bookings yet."
      >
        <div className="card section-card">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Provider</th>
                <th>Package</th>
                <th>Date & time</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookingsQuery.data?.items.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div>{booking.user?.name ?? '—'}</div>
                    <div className="muted">{booking.user?.email ?? booking.userId}</div>
                  </td>
                  <td>
                    <div>{displayPhone(booking.contactPhone ?? booking.user?.phone)}</div>
                    {booking.alternatePhone ? (
                      <div className="muted">Alt: {displayPhone(booking.alternatePhone)}</div>
                    ) : null}
                  </td>
                  <td>{booking.provider?.name ?? '—'}</td>
                  <td>{booking.package?.name ?? '—'}</td>
                  <td>
                    {booking.bookingDate}
                    <div className="muted">{booking.bookingTime}</div>
                  </td>
                  <td>₹{booking.totalAmount}</td>
                  <td>
                    <span className={`status-pill payment-${booking.paymentStatus}`}>
                      {paymentLabel(booking.paymentStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill status-${booking.status}`}>
                      {statusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openBooking(booking)}
                    >
                      Manage
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
        open={!!selectedBooking}
        title="Booking details"
        onClose={() => setSelectedBooking(null)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedBooking(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={statusMutation.isPending || nextStatus === selectedBooking?.status}
              onClick={handleStatusUpdate}
            >
              {statusMutation.isPending ? 'Saving…' : 'Update status'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={paymentMutation.isPending || !paymentDirty}
              onClick={handlePaymentUpdate}
            >
              {paymentMutation.isPending ? 'Saving…' : 'Save payment'}
            </button>
          </>
        }
      >
        {selectedBooking ? (
          <>
            <div className="detail-grid">
              <div>
                <div className="muted">Customer</div>
                <div>{selectedBooking.user?.name ?? '—'}</div>
                <div className="muted">{selectedBooking.user?.email}</div>
              </div>
              <div>
                <div className="muted">Primary phone</div>
                <div>{displayPhone(selectedBooking.contactPhone ?? selectedBooking.user?.phone)}</div>
                {selectedBooking.alternatePhone ? (
                  <div className="muted">
                    Alternate: {displayPhone(selectedBooking.alternatePhone)}
                  </div>
                ) : null}
              </div>
              <div>
                <div className="muted">Provider</div>
                <div>{selectedBooking.provider?.name ?? '—'}</div>
                {selectedBooking.provider?.location ? (
                  <div className="muted">{selectedBooking.provider.location}</div>
                ) : null}
              </div>
              <div>
                <div className="muted">Package</div>
                <div>{selectedBooking.package?.name ?? '—'}</div>
                {selectedBooking.package?.durationMinutes ? (
                  <div className="muted">{selectedBooking.package.durationMinutes} min</div>
                ) : null}
              </div>
              <div>
                <div className="muted">Appointment</div>
                <div>
                  {selectedBooking.bookingDate} · {selectedBooking.bookingTime}
                </div>
                <div className="muted">Booked {formatIst(selectedBooking.createdAt)} IST</div>
              </div>
              <div>
                <div className="muted">Booking status</div>
                <select
                  className="filter-select"
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as BookingStatus)}
                >
                  {BOOKING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h4 style={{ marginTop: 20, marginBottom: 8 }}>Payment & negotiated price</h4>
            <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
              Update payment after speaking with the customer. You can change the final amount if
              price was negotiated.
            </p>

            <div className="detail-grid">
              <div>
                <div className="muted">Payment status</div>
                <select
                  className="filter-select"
                  value={nextPaymentStatus}
                  onChange={(event) => setNextPaymentStatus(event.target.value as PaymentStatus)}
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {paymentLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="muted">Final amount (₹)</div>
                <input
                  className="filter-select"
                  type="number"
                  min="1"
                  step="1"
                  value={negotiatedAmount}
                  onChange={(event) => setNegotiatedAmount(event.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="muted">Internal notes</div>
              <textarea
                className="filter-select"
                rows={3}
                value={paymentNotes}
                onChange={(event) => setPaymentNotes(event.target.value)}
                placeholder="Negotiation details, offline payment reference, etc."
              />
            </div>

            {statusMutation.error ? (
              <p className="form-error">{getErrorMessage(statusMutation.error)}</p>
            ) : null}
            {paymentMutation.error ? (
              <p className="form-error">{getErrorMessage(paymentMutation.error)}</p>
            ) : null}
          </>
        ) : null}
      </Modal>
    </>
  );
}
