// Simple in-memory rate limiter for MVP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const { maxRequests, windowMs } = options;
  
  const record = rateLimitMap.get(identifier);
  
  // If no record or window has expired, start fresh
  if (!record || now >= record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }
  
  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  // Increment count
  record.count++;
  rateLimitMap.set(identifier, record);
  
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((record, key) => {
    if (now >= record.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}, 60000); // Cleanup every minute