# E-Commerce & Beauty Service Booking Application

TypeScript monorepo with shared API types, structured error handling, and TanStack Query on both frontends.

## Structure

```text
shared/    Shared API types + fetch client
backend/   Express + Prisma + PostgreSQL (TypeScript)
admin/     React + Vite admin dashboard (TypeScript + TanStack Query)
mobile/    Expo React Native app (TypeScript + TanStack Query)
docs/      Setup and API docs
```

## Quick start

1. Start PostgreSQL (Docker or local install)
2. Install dependencies:

```bash
npm install
```

3. Backend:

```bash
cd backend
copy .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

4. Admin:

```bash
cd admin
copy .env.example .env
npm run dev
```

5. Mobile:

```bash
cd mobile
copy .env.example .env
npm run start
```

## Default admin

- Email: `admin@example.com`
- Password: `Admin@123`

## API response format

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": { "timestamp": "2026-06-25T10:00:00.000Z" }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "email": ["Invalid email address"] }
  },
  "meta": { "timestamp": "2026-06-25T10:00:00.000Z" }
}
```

See [docs/SETUP.md](docs/SETUP.md) and [docs/API.md](docs/API.md).
