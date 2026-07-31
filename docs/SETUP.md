# Local Setup

## Prerequisites

- Node.js 20+
- Docker Desktop (recommended) or local PostgreSQL 16+

## 1. Start PostgreSQL

### Option A — Docker (recommended)

From project root:

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:

- Database: `ecomm_beauty_dev`
- User: `postgres`
- Password: `postgres`

### Option B — Local PostgreSQL on Windows

If Docker is not installed:

1. Install PostgreSQL 16 from https://www.postgresql.org/download/windows/
2. Create database `ecomm_beauty_dev`
3. Update `backend/.env` `DATABASE_URL` with your username/password

Example:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ecomm_beauty_dev"
```

## 2. Backend setup

```bash
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

API runs at `http://localhost:4000` (TypeScript via `tsx`).

## 3. Admin setup

```bash
cd admin
copy .env.example .env
npm install
npm run dev
```

Admin runs at `http://localhost:5173`.

## 4. Mobile setup

```bash
cd mobile
copy .env.example .env
npm install
npm run start
```

Use Expo Go on your device/emulator. For Android emulator, API base URL may need `http://10.0.2.2:4000`.

## 5. Verify API

```bash
curl http://localhost:4000/health
```

Admin login:

```bash
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin@123\"}"
```

## Useful commands

```bash
npm run dev              # Start API with nodemon
npm run prisma:studio    # Open Prisma Studio
npm run db:seed          # Seed admin + sample categories
```

## Troubleshooting

- **Cannot connect to PostgreSQL**: Ensure Docker container is running with `docker compose ps`.
- **Port 5432 in use**: Stop local PostgreSQL or change the port in `docker-compose.yml` and `DATABASE_URL`.
- **Migration failed**: Delete `backend/prisma/migrations` only in early dev if needed, then rerun migrate.
