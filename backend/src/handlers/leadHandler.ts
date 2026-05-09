import type { Request, Response } from 'express';
import { processLead } from '../services/leadService.js';
import type { LeadInput } from '../schema/leadSchema.js';

export async function createLeadHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as LeadInput;
  await processLead(input);
  res.status(200).json({ status: 'ok' });
}
