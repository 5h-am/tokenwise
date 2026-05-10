import type { Request, Response } from 'express';
import { processAudit, getPublicAudit } from '../services/auditService.js';
import type { AuditInput } from '../engine/types.js';

export async function createAuditHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as AuditInput;
  const { shareId, report } = await processAudit(input);
  const body: Record<string, unknown> = { shareId, ...report };
  delete body['email'];
  delete body['companyName'];
  delete body['role'];

  res.status(201).json(body);
}

export async function getAuditHandler(req: Request, res: Response): Promise<void> {
  const shareId = req.params['shareId'] as string;
  const { shareId: sid, report } = await getPublicAudit(shareId);

  const publicResponse: Record<string, unknown> = {
    shareId: sid,
    ...(report as unknown as Record<string, unknown>),
  };
  delete publicResponse['email'];
  delete publicResponse['companyName'];
  delete publicResponse['role'];

  res.status(200).json(publicResponse);
}
