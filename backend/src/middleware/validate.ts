import { AnyZodObject, ZodError } from 'zod';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../lib/AppError.js';

export function validate(schema: AnyZodObject): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new AppError(`Validation failed: ${messages}`, 400, true));
      } else {
        next(error);
      }
    }
  };
}
