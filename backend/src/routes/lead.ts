import { Router } from 'express';
import { leadLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { leadInputSchema } from '../schema/leadSchema.js';
import { normalizeLeadInput } from '../middleware/normalize.js';
import { createLeadHandler } from '../handlers/leadHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const leadRouter = Router();

leadRouter.post(
  '/',
  leadLimiter,
  validate(leadInputSchema),
  normalizeLeadInput,
  asyncHandler(createLeadHandler)
);
