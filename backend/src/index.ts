import 'dotenv/config';
import express from 'express';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { defaultLimiter } from './middleware/rateLimiter.js';

const REQUIRED_ENV = ['DATABASE_URL'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.json());

  app.use(defaultLimiter);

  app.use('/api/health', healthRouter);

  app.use(errorHandler);

  return app;
}

export const app = createApp();
