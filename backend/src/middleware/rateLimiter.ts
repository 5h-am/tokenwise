import rateLimit from 'express-rate-limit';

const windowMs = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '900000', 10);
const max = parseInt(process.env['RATE_LIMIT_MAX'] ?? '10', 10);

const rateLimitResponse = (retryAfter: number) => ({
  error: {
    message: `Too many requests. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
  },
});

export const auditLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const retryAfter =
      typeof options.windowMs === 'number' ? options.windowMs / 1000 : 900;
    res.status(429).json(rateLimitResponse(retryAfter));
  },
});

export const leadLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, _options) => {
    res.status(429).json(rateLimitResponse(60));
  },
});

export const defaultLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, _options) => {
    res.status(429).json(rateLimitResponse(60));
  },
});
