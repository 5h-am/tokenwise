import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { defaultLimiter } from '../middleware/rateLimiter.js';

export const healthRouter = Router();

healthRouter.get(
  '/',
  defaultLimiter,
  asyncHandler(async (_req, res) => {
    res.status(200).json({ status: 'ok', ts: new Date().toISOString() });
  })
);
