import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('error', (err) => {
  console.error('[redis]', err.message);
});

// ---------- Verdict cache (by hostname) ----------

const VERDICT_TTL_S = 15 * 60;
const STATS_TTL_S = 60;
const CERT_TTL_S = 6 * 60 * 60; // 6h — CT data doesn't change fast
const GEOIP_TTL_S = 6 * 60 * 60; // 6h — hosting rarely migrates day-to-day
const WHOIS_TTL_S = 30 * 24 * 60 * 60; // 30d — creation date never changes

export async function getCachedVerdict<T = unknown>(hostname: string): Promise<T | null> {
  const raw = await redis.get(`verdict:${hostname}`);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCachedVerdict(hostname: string, value: unknown): Promise<void> {
  await redis.setex(`verdict:${hostname}`, VERDICT_TTL_S, JSON.stringify(value));
}

export async function invalidateVerdict(hostname: string): Promise<void> {
  await redis.del(`verdict:${hostname}`);
}

export async function getCachedStats<T = unknown>(): Promise<T | null> {
  const raw = await redis.get('stats:v1');
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCachedStats(value: unknown): Promise<void> {
  await redis.setex('stats:v1', STATS_TTL_S, JSON.stringify(value));
}

// ---------- Cert-age cache (by registrable domain) ----------

export async function getCachedCert<T = unknown>(domain: string): Promise<T | null> {
  const raw = await redis.get(`cert:${domain}`);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCachedCert(domain: string, value: unknown): Promise<void> {
  await redis.setex(`cert:${domain}`, CERT_TTL_S, JSON.stringify(value));
}

// ---------- GeoIP cache (by hostname) ----------

export async function getCachedGeoip<T = unknown>(host: string): Promise<T | null> {
  const raw = await redis.get(`geoip:${host}`);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCachedGeoip(host: string, value: unknown): Promise<void> {
  await redis.setex(`geoip:${host}`, GEOIP_TTL_S, JSON.stringify(value));
}

// ---------- WHOIS cache (by registrable domain) ----------

export async function getCachedWhois<T = unknown>(domain: string): Promise<T | null> {
  const raw = await redis.get(`whois:${domain}`);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCachedWhois(domain: string, value: unknown): Promise<void> {
  await redis.setex(`whois:${domain}`, WHOIS_TTL_S, JSON.stringify(value));
}

// ---------- Rate limiter (fixed window via INCR + EXPIRE NX) ----------

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch seconds
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const bucket = `rl:${key}`;
  const pipeline = redis.pipeline();
  pipeline.incr(bucket);
  // Set TTL only if it wasn't already set (first request in the window).
  pipeline.expire(bucket, windowSeconds, 'NX');
  pipeline.ttl(bucket);
  const results = await pipeline.exec();
  if (!results) return { allowed: true, remaining: limit, resetAt: 0 };

  const count = Number(results[0]?.[1] ?? 0);
  const ttl   = Number(results[2]?.[1] ?? windowSeconds);
  const remaining = Math.max(0, limit - count);
  const resetAt = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : windowSeconds);
  return { allowed: count <= limit, remaining, resetAt };
}
