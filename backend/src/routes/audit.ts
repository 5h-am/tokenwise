import { Router } from 'express';
import { auditLimiter, defaultLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { auditInputSchema } from '../schema/auditSchema.js';
import { normalizeAuditInput } from '../middleware/normalize.js';
import { createAuditHandler, getAuditHandler } from '../handlers/auditHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const auditRouter = Router();

auditRouter.post(
  '/',
  auditLimiter,
  validate(auditInputSchema),
  normalizeAuditInput,
  asyncHandler(createAuditHandler)
);

auditRouter.get(
  '/:shareId',
  defaultLimiter,
  asyncHandler(getAuditHandler)
);
