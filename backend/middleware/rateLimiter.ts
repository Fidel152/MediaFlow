import { Request, Response, NextFunction } from 'express';

interface RequestBucket {
  count: number;
  resetTime: number;
}

const clientBuckets: Map<string, RequestBucket> = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 60; // 60 requests per minute

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown_client';
  const now = Date.now();
  
  let bucket = clientBuckets.get(clientIp);

  if (!bucket || now > bucket.resetTime) {
    bucket = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    clientBuckets.set(clientIp, bucket);
    return next();
  }

  bucket.count++;

  if (bucket.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Trop de requêtes effectuées. Veuillez patienter un instant avant de réessayer.',
    });
  }

  next();
}
