/**
 * KV-backed fixed-window rate limiter. Keyed by IP hash + route.
 * Fixed windows drift at boundaries (a user can burst 2x the limit across a window flip),
 * which is acceptable for the traffic shape we expect. Upgrade to a token bucket if abuse emerges.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / windowSeconds);
  const cacheKey = `rl:${key}:${window}`;
  const resetAt = (window + 1) * windowSeconds;

  const raw = await kv.get(cacheKey);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= limit) {
    return { allowed: false, remaining: 0, resetAt };
  }

  await kv.put(cacheKey, String(count + 1), { expirationTtl: windowSeconds + 5 });
  return { allowed: true, remaining: limit - count - 1, resetAt };
}
