import type { Context, Next } from 'hono';
import { rateLimit } from './redis.js';
import { clientIp, hashIp, isUuidLike } from './util.js';

export interface AppVariables {
  ipHash: string;
  installId: string | null;
}

export async function context(c: Context<{ Variables: AppVariables }>, next: Next) {
  c.set('ipHash', hashIp(clientIp(c.req)));
  const h = c.req.header('x-install-id');
  c.set('installId', h && isUuidLike(h) ? h : null);
  await next();
}

/**
 * Route-specific rate limit. Key is (install_id or ip_hash) + route + limit bucket.
 */
export function rateLimitMiddleware(
  bucket: string,
  anonymousLimit: number,
  knownInstallLimit: number,
  windowSeconds: number,
) {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    const installId = c.get('installId');
    const ipHash = c.get('ipHash');
    const limit = installId ? knownInstallLimit : anonymousLimit;
    const key = `${bucket}:${installId ?? ipHash}`;
    const rl = await rateLimit(key, limit, windowSeconds);
    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', String(rl.remaining));
    c.header('X-RateLimit-Reset', String(rl.resetAt));
    if (!rl.allowed) {
      return c.json({ error: 'rate_limited', resetAt: rl.resetAt }, 429);
    }
    await next();
  };
}
