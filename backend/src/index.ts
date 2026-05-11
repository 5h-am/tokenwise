import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { auditRouter } from './routes/audit.js';
import { leadRouter } from './routes/lead.js';
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
  app.use(
    cors({
      origin: process.env['ALLOWED_ORIGIN'] ?? 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));

  app.use(defaultLimiter);

  app.use('/api/health', healthRouter);
  app.use('/api/audit', auditRouter);
  app.use('/api/leads', leadRouter);

  app.use(errorHandler);

  return app;
}

export const app = createApp();
