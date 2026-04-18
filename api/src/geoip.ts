/**
 * Hosting lookup: resolve hostname → IPv4, then IPv4 → country via ip-api.com.
 *
 * Tradeoffs:
 *  - ip-api.com is free and requires no API key. Rate limit is 45 req/min from
 *    a single client IP; with our Redis cache (6h per hostname) we'll stay well
 *    below that for normal traffic. If we ever hit the limit we can swap in
 *    MaxMind GeoLite2 as an in-process DB.
 *  - DNS resolution uses Node's system resolver. That's fine; if we ever need
 *    deterministic resolution across environments we can `setServers(['1.1.1.1'])`.
 *  - Both DNS and the GeoIP HTTP call run with a combined 1.5s timeout. Users
 *    never wait more than that on a cache miss.
 */
import { promises as dns } from 'node:dns';
import { getCachedGeoip, setCachedGeoip } from './redis.js';

const LOOKUP_TIMEOUT_MS = 1500;
const USER_AGENT = 'meetingcheck/0.2 (+https://meetingcheck.io)';

export interface HostingInfo {
  /** ISO 3166-1 alpha-2 country code for the first A-record, or null. */
  country: string | null;
  /** First resolved IPv4 address, or null if DNS failed. */
  ip: string | null;
  /** Whether the lookup completed end-to-end (DNS + GeoIP). */
  checked: boolean;
}

interface IpApiResponse {
  status?: 'success' | 'fail';
  countryCode?: string;
}

export async function getHosting(hostname: string): Promise<HostingInfo> {
  if (!hostname) return { country: null, ip: null, checked: false };

  const cached = await getCachedGeoip<HostingInfo>(hostname);
  if (cached) return cached;

  const result = await withTimeout(resolveAndLocate(hostname), LOOKUP_TIMEOUT_MS, {
    country: null,
    ip: null,
    checked: false,
  });
  // Cache all outcomes, even failures, so we don't re-hammer on errors.
  await setCachedGeoip(hostname, result);
  return result;
}

async function resolveAndLocate(hostname: string): Promise<HostingInfo> {
  let ip: string | null = null;
  try {
    const records = await dns.resolve4(hostname);
    ip = records[0] ?? null;
  } catch {
    return { country: null, ip: null, checked: false };
  }
  if (!ip) return { country: null, ip: null, checked: false };

  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`, {
      headers: { 'user-agent': USER_AGENT },
    });
    if (!res.ok) return { country: null, ip, checked: false };
    const body = (await res.json()) as IpApiResponse;
    if (body.status !== 'success' || !body.countryCode) {
      return { country: null, ip, checked: true };
    }
    return { country: body.countryCode, ip, checked: true };
  } catch {
    return { country: null, ip, checked: false };
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    p.then((v) => {
      clearTimeout(timer);
      resolve(v);
    }).catch(() => {
      clearTimeout(timer);
      resolve(fallback);
    });
  });
}
