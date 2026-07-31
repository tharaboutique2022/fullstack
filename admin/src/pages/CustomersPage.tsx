import { useState } from 'react';
import { formatInstantInTimeZone, formatIndianMobileDisplay } from '@ecomm/shared';
import { useAdminCustomers } from '@/hooks/useUsers';
import { QueryState } from '@/components/QueryState';

function formatJoined(iso: string) {
  return formatInstantInTimeZone(iso, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function displayPhone(phone?: string | null) {
  return phone ? formatIndianMobileDisplay(phone) : '—';
}

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const customersQuery = useAdminCustomers({
    page,
    search: search.trim() || undefined,
  });

  const totalPages = customersQuery.data?.pagination.totalPages ?? 1;

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Customers</h2>
          <p className="muted">Browse registered customers and their activity.</p>
        </div>
        <input
          className="filter-select"
          type="search"
          placeholder="Search name, email, or phone…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <QueryState
        isLoading={customersQuery.isPending && !customersQuery.data}
        isError={customersQuery.isError}
        error={customersQuery.error}
        isEmpty={!customersQuery.data?.items.length}
        emptyMessage={search ? 'No customers match your search.' : 'No customers yet.'}
      >
        <div className="card section-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Bookings</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customersQuery.data?.items.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{displayPhone(customer.phone)}</td>
                  <td>{customer.orderCount}</td>
                  <td>{customer.bookingCount}</td>
                  <td>{formatJoined(customer.createdAt)}</td>
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
    </>
  );
}
