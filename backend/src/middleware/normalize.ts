import type { Request, Response, NextFunction } from 'express';

export function normalizeAuditInput(req: Request, _res: Response, next: NextFunction): void {
  next();
}

export function normalizeLeadInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body.email === 'string') {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  next();
}
