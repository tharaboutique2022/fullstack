# API Reference

Base URL: `http://localhost:4000`

## Response contract

All endpoints return a consistent JSON envelope.

### Success

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {},
  "meta": {
    "timestamp": "2026-06-25T10:00:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email address"]
    }
  },
  "meta": {
    "timestamp": "2026-06-25T10:00:00.000Z"
  }
}
```

### Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Invalid request body/query |
| `BAD_REQUEST` | 400 | Business rule violation |
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | Insufficient role |
| `NOT_FOUND` | 404 | Resource/route not found |
| `CONFLICT` | 409 | Duplicate record |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

Protected routes require:

```text
Authorization: Bearer <token>
```

## Health

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/health` | No |

## Auth

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/register` | No | `{ name, email, phone?, password }` |
| POST | `/api/auth/login` | No | `{ email, password }` |
| POST | `/api/auth/forgot-password` | No | `{ email }` — returns `{ message, devOtp? }` in non-production |
| POST | `/api/auth/reset-password` | No | `{ email, otp, password }` |
| GET | `/api/auth/me` | User | - |

## Cart

All routes require a valid JWT (`user` or `admin` role).

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/api/cart` | User | - |
| POST | `/api/cart/items` | User | `{ productId, variantId?, quantity? }` |
| PATCH | `/api/cart/items/:id` | User | `{ quantity }` |
| DELETE | `/api/cart/items/:id` | User | - |
| DELETE | `/api/cart` | User | - |

### Add to cart rules

- Simple products: send `productId` only (no `variantId`).
- Variant products: `variantId` is required.
- Duplicate lines merge by increasing `quantity` (max 99 per line).
- Out-of-stock or inactive products/variants are rejected on add/update.

### Cart response shape

```json
{
  "id": "uuid",
  "userId": "uuid",
  "itemCount": 2,
  "subtotal": "1999.00",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 1,
      "unitPrice": "999.00",
      "lineTotal": "999.00",
      "isAvailable": true,
      "imageUrl": "https://...",
      "product": { "id": "...", "name": "...", "slug": "...", "imageUrl": null, "hasVariants": true },
      "variant": { "id": "...", "title": "M / Red", "price": "999.00", "stockStatus": "in_stock", "imageUrl": null, "sku": null }
    }
  ],
  "updatedAt": "2026-06-25T10:00:00.000Z"
}
```

## Public catalog

| Method | Endpoint | Auth | Query |
|--------|----------|------|-------|
| GET | `/api/categories/products` | No | `parentId?`, `rootsOnly?`, `kind?` |
| GET | `/api/products` | No | `page`, `limit`, `categoryId?`, `departmentId?`, `search?`, `sort?` |
| GET | `/api/products/:id` | No | - |
| GET | `/api/categories/services` | No | - |
| GET | `/api/service-providers` | No | `page`, `limit`, `categoryId?`, `search?` |
| GET | `/api/service-providers/:id` | No | - |
| GET | `/api/service-providers/:id/time-slots` | No | - |
| GET | `/api/services` | No | Alias for service-providers list |
| GET | `/api/services/:id` | No | Alias for service-provider detail |

| PATCH | `/api/auth/me` | User | `{ name?, phone? }` |

## Addresses

All routes require a valid JWT.

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/api/addresses` | User | - |
| GET | `/api/addresses/default` | User | - |
| POST | `/api/addresses` | User | `{ label?, line1, line2?, city, state, pincode, isDefault? }` |
| PUT | `/api/addresses/:id` | User | partial address fields |
| DELETE | `/api/addresses/:id` | User | - |

## Bookings

All routes require a valid JWT.

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/api/bookings` | User | - |
| GET | `/api/bookings/:id` | User | - |
| POST | `/api/bookings` | User | `{ providerId, packageId, bookingDate, bookingTime, contactPhone, alternatePhone?, notes? }` |
| POST | `/api/bookings/:id/cancel` | User | `{ reason }` (min 5 chars) |

`bookingDate` format: `YYYY-MM-DD`. `bookingTime` must match an active provider time slot (e.g. `"07:00 AM"`).

## Orders

All routes require a valid JWT.

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/api/orders/checkout-quote` | User | - |
| GET | `/api/orders` | User | - |
| GET | `/api/orders/:id` | User | - |
| POST | `/api/orders` | User | `{ notes?, shippingOption?, addressId?, contactPhone, paymentMethod: "online" }` |
| POST | `/api/orders/:id/cancel` | User | `{ reason }` (min 5 chars) |

`POST /api/orders` creates an order from the current cart (platform fee ₹7 + standard shipping ₹44), clears the cart, and creates a **Razorpay** order. Response:

```json
{
  "order": { "...": "..." },
  "payment": {
    "gateway": "razorpay",
    "keyId": "rzp_test_...",
    "razorpayOrderId": "order_...",
    "amount": 12345,
    "currency": "INR",
    "name": "Thara Boutique",
    "description": "Order ORD-...",
    "prefill": { "name": "...", "email": "...", "contact": "..." }
  },
  "paymentError": "optional if initiation failed"
}
```

## Payments (Razorpay)

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/payments/orders/:id/initiate` | User | Retry payment for a pending/failed order |
| POST | `/api/payments/razorpay/verify` | User | Verify payment after Razorpay checkout |
| GET | `/api/payments/orders/:id/status` | User | Order + payment fields |

`POST /api/payments/razorpay/verify` body:

```json
{
  "orderId": "uuid",
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "..."
}
```

On successful verification, order `paymentStatus` becomes `paid` and order `status` moves from `pending` to `confirmed`.

## Admin catalog

All routes require admin JWT under `/api/admin/*`.

Service provider CRUD uses `/api/admin/service-providers` (legacy `/api/admin/services` aliases remain).

## Admin orders & bookings

All routes require admin JWT.

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/admin/orders` | Query: `page`, `limit`, `status?` |
| GET | `/api/admin/orders/:id` | - |
| PATCH | `/api/admin/orders/:id/status` | `{ status }` |
| GET | `/api/admin/bookings` | Query: `page`, `limit`, `status?` |
| GET | `/api/admin/bookings/:id` | - |
| PATCH | `/api/admin/bookings/:id/status` | `{ status }` |

Order statuses: `pending`, `confirmed`, `processing`, `delivered`, `cancelled`.

Booking statuses: `pending`, `confirmed`, `completed`, `cancelled`.

Admin list/detail responses include a `user` summary (`name`, `email`, `phone`).

## Default admin (seed)

- Email: `admin@example.com`
- Password: `Admin@123`

## Shared types

TypeScript types live in `shared/src/api.types.ts` and are used by backend, admin, and mobile.
