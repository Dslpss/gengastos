import { Request, Response, NextFunction } from "express";

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // requests per window

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientId = req.ip || "unknown";
  const now = Date.now();

  const record = requestCounts.get(clientId);

  if (!record || now > record.resetTime) {
    requestCounts.set(clientId, {
      count: 1,
      resetTime: now + WINDOW_SIZE,
    });
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
    });
  }

  record.count++;
  next();
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [clientId, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(clientId);
    }
  }
}, WINDOW_SIZE);
