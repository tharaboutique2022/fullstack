# Environment Variables

## Backend (`backend/.env`)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql://postgres:postgres@localhost:5432/ecomm_beauty_dev` | PostgreSQL connection string |
| `JWT_SECRET` | Yes | `your-long-random-secret` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration |
| `PORT` | No | `4000` | API server port |
| `NODE_ENV` | No | `development` | Runtime environment |
| `LOG_LEVEL` | No | `debug` (dev) / `info` (prod) | Server log verbosity: `debug`, `info`, `warn`, `error` |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin(s), comma-separated |
| `ADMIN_NAME` | No | `Admin` | Seed admin display name |
| `ADMIN_EMAIL` | No | `admin@example.com` | Seed admin email |
| `ADMIN_PASSWORD` | No | `Admin@123` | Seed admin password |
| `RAZORPAY_KEY_ID` | Yes (payments) | `rzp_test_...` | Razorpay Key ID (Dashboard → Settings → API Keys) |
| `RAZORPAY_KEY_SECRET` | Yes (payments) | `your_secret` | Razorpay Key Secret (server only, never in mobile app) |
| `RAZORPAY_MERCHANT_NAME` | No | `Thara Boutique` | Name shown on Razorpay checkout |

Copy from `backend/.env.example` and update values before production deployment.

## Mobile (`mobile/.env`)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Yes | `http://192.168.1.10:4000` | Backend API URL |
| `EXPO_PUBLIC_DEBUG_API` | No | `true` | Log API requests in Metro/device console (`false` to disable) |

**Physical device (Expo Go):** use your PC's **LAN IP**, not `localhost`. `localhost` on the phone refers to the phone itself.

1. Find your PC IP: `ipconfig` (Windows) → IPv4 under Wi-Fi
2. Set `EXPO_PUBLIC_API_BASE_URL=http://<your-ip>:4000`
3. Phone and PC must be on the **same Wi-Fi**
4. Restart Expo after changing `.env`: `npx expo start --clear`

**Android emulator:** use `http://10.0.2.2:4000`

## Production notes

- Use a strong random `JWT_SECRET`
- Never commit `.env` to git
- Use managed PostgreSQL (Railway, Supabase, Render, etc.)
- Set `NODE_ENV=production`
