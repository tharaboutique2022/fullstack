import type { CorsOptions } from 'cors';
import { env } from './env';

const productionOrigins = env.corsOrigin.split(',').map((origin) => origin.trim());

export const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (env.nodeEnv === 'development') {
      callback(null, true);
      return;
    }

    if (productionOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
};
