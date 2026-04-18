/**
 * Certificate Transparency age lookup via crt.sh.
 *
 * crt.sh indexes public CT logs. Query `?q=<host>&output=json` returns every
 * cert that was issued for that host (or its wildcards). We take the *minimum*
 * not_before across non-CA entries — i.e., the first time any cert was ever
 * issued for this hostname. That gives us "domain age on the internet" in a
 * way that doesn't trust WHOIS and can't be faked.
 *
 * Caveats we accept:
 *  - crt.sh is slow (500–3000ms typical, sometimes timing out under load).
 *  - It's eventually-consistent with CT logs — brand new certs may not show up
 *    for minutes to hours. That's fine for our use: a domain whose *first*
 *    cert was issued 2 days ago is suspicious regardless.
 *  - We cache per registrable domain for 6h so repeat checks are free.
 */
import { getRegistrableDomain } from '@meetingcheck/detector';
import { getCachedCert, setCachedCert } from './redis.js';

const CRT_SH_TIMEOUT_MS = 3000;
const USER_AGENT = 'meetingcheck/0.2 (+https://meetingcheck.io)';

export interface CertAge {
  /** Days since the earliest CT-logged cert for this domain. Null if unavailable. */
  days: number | null;
  /** Whether the lookup completed (even if it returned no data). */
  checked: boolean;
  /** ISO date string of the earliest cert, for debugging. */
  firstSeen?: string;
}

interface CrtShEntry {
  not_before?: string;
  // crt.sh returns many fields; we only read not_before.
}

export async function getCertAge(hostname: string): Promise<CertAge> {
  const domain = getRegistrableDomain(hostname);
  if (!domain || domain.length < 3) return { days: null, checked: false };

  const cached = await getCachedCert<CertAge>(domain);
  if (cached) return cached;

  const result = await fetchCrtSh(domain);
  // Cache even the "checked but nothing found" shape so we don't hammer crt.sh
  // on repeat lookups for empty domains.
  await setCachedCert(domain, result);
  return result;
}

async function fetchCrtSh(domain: string): Promise<CertAge> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRT_SH_TIMEOUT_MS);
  try {
    const url = `https://crt.sh/?q=${encodeURIComponent('%.' + domain)}&output=json`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'accept': 'application/json', 'user-agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) return { days: null, checked: false };

    const body = (await res.json()) as CrtShEntry[] | null;
    if (!Array.isArray(body) || body.length === 0) {
      // Lookup succeeded but returned nothing — domain has no CT-logged certs.
      // That's itself suspicious (legitimate domains generate CT entries); we
      // mark as "checked but unknown age" so the UI can show appropriate copy.
      return { days: null, checked: true };
    }

    let earliest = Infinity;
    for (const entry of body) {
      if (!entry.not_before) continue;
      const t = Date.parse(entry.not_before);
      if (!Number.isNaN(t) && t < earliest) earliest = t;
    }
    if (!Number.isFinite(earliest)) return { days: null, checked: true };

    const days = Math.max(0, Math.floor((Date.now() - earliest) / (1000 * 60 * 60 * 24)));
    return { days, checked: true, firstSeen: new Date(earliest).toISOString() };
  } catch {
    return { days: null, checked: false };
  } finally {
    clearTimeout(timer);
  }
}
