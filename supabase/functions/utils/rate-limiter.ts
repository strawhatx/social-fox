// Simple rate limiting using memory storage
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS = {
  'oauth-callback': { requests: 10, windowMs: 60000 }, // 10 requests per minute
  'process-oauth': { requests: 20, windowMs: 60000 },  // 20 requests per minute
  'default': { requests: 100, windowMs: 60000 }         // Default limit
};

export const applyRateLimit = async (req: Request, endpoint: string): Promise<Response | null> => {
  const clientIP = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  
  const key = `${endpoint}:${clientIP}`;
  const limit = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
  const now = Date.now();
  
  let record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + limit.windowMs };
    requestCounts.set(key, record);
    return null; // No rate limit exceeded
  }
  
  if (record.count >= limit.requests) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { 
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
        }
      }
    );
  }
  
  record.count++;
  return null; // Rate limit not exceeded
};