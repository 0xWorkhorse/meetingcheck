/**
 * WHOIS-based domain age lookup.
 *
 * Why bother when CT transparency already gives us a first-cert-issued date?
 * Because CT and WHOIS disagree in interesting ways:
 *  - WHOIS records the actual registrar-assigned creation date.
 *  - CT logs the first time any cert was publicly issued, which can be days-
 *    to-weeks AFTER registration (the attacker registered early, issued late)
 *    or earlier than WHOIS if the registrar reset the record.
 * Showing both gives users two independent age signals.
 *
 * Caveats:
 *  - WHOIS is slow. We race with a 3s timeout and cache for 30d on success.
 *  - Many TLDs now privacy-proxy the creation date. For those we return
 *    { age_days: null, checked: true } so the UI can show 'UNKNOWN'.
 *  - The whoiser package handles protocol variants across registries, but
 *    field names vary wildly; we look at the common ones.
 */
import { whoisDomain } from 'whoiser';
import { getRegistrableDomain } from '@meetingcheck/detector';
import { getCachedWhois, setCachedWhois } from './redis.js';

const WHOIS_TIMEOUT_MS = 3000;

export interface WhoisInfo {
  /** Days since registrar-recorded creation date. Null if unavailable/privacy-proxied. */
  age_days: number | null;
  /** Whether the lookup completed (even if it returned no creation date). */
  checked: boolean;
  /** ISO date of creation for debugging; not surfaced to the UI. */
  createdAt?: string;
}

const CREATED_KEYS = [
  'Created Date',
  'Creation Date',
  'created',
  'Created On',
  'Registered on',
  'Registered',
  'Domain Registration Date',
];

export async function getWhoisAge(hostname: string): Promise<WhoisInfo> {
  const domain = getRegistrableDomain(hostname);
  if (!domain || domain.length < 3) return { age_days: null, checked: false };

  const cached = await getCachedWhois<WhoisInfo>(domain);
  if (cached) return cached;

  const result = await withTimeout(lookupWhois(domain), WHOIS_TIMEOUT_MS, {
    age_days: null,
    checked: false,
  });
  await setCachedWhois(domain, result);
  return result;
}

async function lookupWhois(domain: string): Promise<WhoisInfo> {
  try {
    const data = await whoisDomain(domain, { follow: 2, timeout: WHOIS_TIMEOUT_MS });
    const created = extractCreated(data);
    if (!created) return { age_days: null, checked: true };
    const days = Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)));
    return { age_days: days, checked: true, createdAt: created.toISOString() };
  } catch {
    return { age_days: null, checked: false };
  }
}

/**
 * whoisDomain returns an object keyed by WHOIS server with each server's raw
 * record. We walk every response and take the earliest parseable creation
 * date — different servers report different precisions, and the earliest is
 * the most reliable.
 */
function extractCreated(data: Record<string, Record<string, unknown>>): Date | null {
  let earliest: number | null = null;
  for (const record of Object.values(data)) {
    if (!record || typeof record !== 'object') continue;
    for (const key of CREATED_KEYS) {
      const val = record[key];
      if (typeof val !== 'string') continue;
      const t = Date.parse(val);
      if (!Number.isNaN(t) && (earliest === null || t < earliest)) earliest = t;
    }
  }
  return earliest === null ? null : new Date(earliest);
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
