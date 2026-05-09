import type { Request, Response } from 'express';
import { processAudit, getPublicAudit } from '../services/auditService.js';
import type { AuditInput } from '../engine/types.js';

export async function createAuditHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as AuditInput;
  const result = await processAudit(input);
  res.status(201).json(result);
}

export async function getAuditHandler(req: Request, res: Response): Promise<void> {
  const shareId = req.params['shareId'] as string;
  const result = await getPublicAudit(shareId);

  const publicResponse: Record<string, unknown> = { ...result };
  delete publicResponse['email'];
  delete publicResponse['companyName'];
  delete publicResponse['role'];

  res.status(200).json(publicResponse);
}
