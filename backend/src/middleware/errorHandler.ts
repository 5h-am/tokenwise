import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError.js';

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: ErrorResponse = { error: { message: err.message } };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof Error) {
    const isDev = process.env['NODE_ENV'] !== 'production';
    const body: ErrorResponse = {
      error: {
        message: isDev ? err.message : 'Internal server error',
      },
    };
    res.status(500).json(body);
    return;
  }

  res.status(500).json({ error: { message: 'Internal server error' } });
}
