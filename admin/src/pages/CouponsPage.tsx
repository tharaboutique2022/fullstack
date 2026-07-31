import { useState } from 'react';
import type { Coupon } from '@ecomm/shared/api.types';
import { formatInstantInTimeZone } from '@ecomm/shared';
import { useAdminCoupons, useCreateCouponMutation } from '@/hooks/useCoupons';
import type { CreateCouponInput } from '@/api/coupons';
import { QueryState } from '@/components/QueryState';
import { Modal } from '@/components/Modal';
import { getErrorMessage } from '@/lib/apiClient';

interface CouponFormValues {
  code: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: string;
  minOrderAmount: string;
  maxUses: string;
  isActive: boolean;
}

const emptyCouponForm: CouponFormValues = {
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  minOrderAmount: '0',
  maxUses: '',
  isActive: true,
};

function formatDiscount(coupon: Coupon) {
  return coupon.discountType === 'percent'
    ? `${coupon.discountValue}%`
    : `₹${coupon.discountValue}`;
}

function formatDate(iso: string) {
  return formatInstantInTimeZone(iso, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formValuesToInput(values: CouponFormValues): CreateCouponInput {
  return {
    code: values.code.trim(),
    description: values.description.trim() || null,
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    minOrderAmount: values.minOrderAmount.trim() ? Number(values.minOrderAmount) : 0,
    maxUses: values.maxUses.trim() ? Number(values.maxUses) : null,
    isActive: values.isActive,
  };
}

export function CouponsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CouponFormValues>(emptyCouponForm);

  const couponsQuery = useAdminCoupons();
  const createMutation = useCreateCouponMutation();

  function openCreate() {
    setForm(emptyCouponForm);
    setCreateOpen(true);
  }

  async function handleCreate() {
    await createMutation.mutateAsync(formValuesToInput(form));
    setCreateOpen(false);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h2>Coupons</h2>
          <p className="muted">Create and manage discount codes for orders.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          New coupon
        </button>
      </div>

      <QueryState
        isLoading={couponsQuery.isPending && !couponsQuery.data}
        isError={couponsQuery.isError}
        error={couponsQuery.error}
        isEmpty={!couponsQuery.data?.length}
        emptyMessage="No coupons yet."
      >
        <div className="card section-card">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Min order</th>
                <th>Uses</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {couponsQuery.data?.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <strong>{coupon.code}</strong>
                  </td>
                  <td>{coupon.description ?? '—'}</td>
                  <td>{formatDiscount(coupon)}</td>
                  <td>₹{coupon.minOrderAmount}</td>
                  <td>
                    {coupon.usedCount}
                    {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ''}
                  </td>
                  <td>
                    <span className={`status-pill ${coupon.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(coupon.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>

      <Modal
        open={createOpen}
        title="New coupon"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={createMutation.isPending || !form.code.trim() || !form.discountValue.trim()}
              onClick={handleCreate}
            >
              {createMutation.isPending ? 'Creating…' : 'Create coupon'}
            </button>
          </>
        }
      >
        <div className="form-field">
          <label htmlFor="coupon-code">Code</label>
          <input
            id="coupon-code"
            value={form.code}
            onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            placeholder="SUMMER20"
          />
        </div>

        <div className="form-field">
          <label htmlFor="coupon-description">Description</label>
          <input
            id="coupon-description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Optional note for admins"
          />
        </div>

        <div className="form-field">
          <label htmlFor="coupon-discount-type">Discount type</label>
          <select
            id="coupon-discount-type"
            value={form.discountType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                discountType: event.target.value as 'percent' | 'fixed',
              }))
            }
          >
            <option value="percent">Percent</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="coupon-discount-value">
            Discount value {form.discountType === 'percent' ? '(%)' : '(₹)'}
          </label>
          <input
            id="coupon-discount-value"
            type="number"
            min="0"
            step={form.discountType === 'percent' ? '1' : '0.01'}
            value={form.discountValue}
            onChange={(event) =>
              setForm((current) => ({ ...current, discountValue: event.target.value }))
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="coupon-min-order">Minimum order amount (₹)</label>
          <input
            id="coupon-min-order"
            type="number"
            min="0"
            step="0.01"
            value={form.minOrderAmount}
            onChange={(event) =>
              setForm((current) => ({ ...current, minOrderAmount: event.target.value }))
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="coupon-max-uses">Max uses (optional)</label>
          <input
            id="coupon-max-uses"
            type="number"
            min="1"
            step="1"
            value={form.maxUses}
            onChange={(event) =>
              setForm((current) => ({ ...current, maxUses: event.target.value }))
            }
            placeholder="Leave blank for unlimited"
          />
        </div>

        <div className="form-field">
          <label>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />{' '}
            Active
          </label>
        </div>

        {createMutation.error ? (
          <p className="form-error">{getErrorMessage(createMutation.error)}</p>
        ) : null}
      </Modal>
    </>
  );
}
