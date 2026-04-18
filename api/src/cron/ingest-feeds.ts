/**
 * Cron: pull external threat feeds, filter for meeting-brand hits, upsert
 * into threat_feed with source='urlhaus' | 'openphish'.
 *
 * We deliberately do NOT ingest the full feeds (URLhaus alone has >1M entries).
 * Broad URL phishing data isn't a useful signal for a meeting-link verifier —
 * we only want hosts that smell like meeting-service impersonation.
 *
 * Runs as a separate Railway cron service with:
 *   Schedule:       every 6h (cron "0 0,6,12,18 * * *")
 *   Start Command:  node dist/cron/ingest-feeds.js
 */
import { getDomain } from 'tldts';
import { OFFICIAL_DOMAINS } from '@meetingcheck/detector';
import { db } from '../db.js';

const URLHAUS_CSV = 'https://urlhaus.abuse.ch/downloads/csv_online/';
const OPENPHISH_TXT = 'https://openphish.com/feed.txt';
const FETCH_TIMEOUT_MS = 30_000;

// Registrable root → brand. Used to decide if a hostname is *trying* to be
// a meeting service, and to tag brand_impersonated for the admin UI.
const BRAND_ROOTS: ReadonlyArray<{ root: string; brand: string }> = [
  { root: 'zoom',     brand: 'Zoom'     },
  { root: 'meet',     brand: 'Google Meet' },
  { root: 'gmeet',    brand: 'Google Meet' },
  { root: 'google',   brand: 'Google Meet' },
  { root: 'teams',    brand: 'Microsoft Teams' },
  { root: 'msteams',  brand: 'Microsoft Teams' },
  { root: 'webex',    brand: 'Webex' },
  { root: 'calendly', brand: 'Calendly' },
  { root: 'calendy',  brand: 'Calendly' }, // common misspelling scammers use
  { root: 'whereby',  brand: 'Whereby' },
];

const OFFICIAL_SET: ReadonlySet<string> = new Set(
  Object.values(OFFICIAL_DOMAINS).flat() as string[],
);

function isOfficialHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (OFFICIAL_SET.has(lower)) return true;
  for (const official of OFFICIAL_SET) {
    if (lower.endsWith('.' + official)) return true;
  }
  return false;
}

/** Returns the matching brand if the hostname contains an impersonation token. */
function matchBrand(hostname: string): string | null {
  const normalized = hostname.toLowerCase().replace(/[-_.]/g, '');
  for (const { root, brand } of BRAND_ROOTS) {
    if (normalized.includes(root)) return brand;
  }
  return null;
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'meetingcheck/0.2 (+https://meetingcheck.io)' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Very small CSV parser tuned for URLhaus's quoted-fields format. */
function parseUrlhausCsv(body: string): string[] {
  const urls: string[] = [];
  for (const line of body.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    // columns: id, dateadded, url, url_status, threat, tags, urlhaus_link, reporter
    // Fields are wrapped in quotes. We only need the 3rd field.
    const match = /^"[^"]*","[^"]*","([^"]+)"/.exec(line);
    if (match) urls.push(match[1]);
  }
  return urls;
}

function parseOpenPhishText(body: string): string[] {
  return body.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('#'));
}

function extractHost(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

interface Candidate {
  registrable: string;
  hostname: string;
  brand: string;
  source: 'urlhaus' | 'openphish';
}

function distill(urls: string[], source: 'urlhaus' | 'openphish'): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const url of urls) {
    const host = extractHost(url);
    if (!host) continue;
    if (isOfficialHost(host)) continue; // never ingest legitimate hosts
    const brand = matchBrand(host);
    if (!brand) continue; // not targeting a meeting brand
    const registrable = getDomain(host);
    if (!registrable) continue;
    if (seen.has(registrable)) continue;
    seen.add(registrable);
    out.push({ registrable, hostname: host, brand, source });
  }
  return out;
}

async function upsert(candidates: Candidate[]): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;
  for (const c of candidates) {
    const res = await db.query(
      `INSERT INTO threat_feed (registrable_domain, first_seen, last_seen, report_count, brand_impersonated, status, source)
       VALUES ($1, NOW(), NOW(), 0, $2, 'confirmed', $3)
       ON CONFLICT (registrable_domain) DO UPDATE SET
         last_seen = NOW(),
         -- Never downgrade a rejected entry. Never flip a community-confirmed
         -- row to external. Only update external-sourced or suspected rows.
         status = CASE
           WHEN threat_feed.status = 'rejected' THEN threat_feed.status
           WHEN threat_feed.source = 'community' THEN threat_feed.status
           ELSE 'confirmed'
         END
       RETURNING (xmax = 0) AS was_insert`,
      [c.registrable, c.brand, c.source],
    );
    if (res.rows[0]?.was_insert) inserted++;
    else updated++;
  }
  return { inserted, updated };
}

async function main() {
  const start = Date.now();
  console.log('[ingest-feeds] pulling URLhaus + OpenPhish…');

  const results = await Promise.allSettled([
    fetchText(URLHAUS_CSV).then((body) => distill(parseUrlhausCsv(body), 'urlhaus')),
    fetchText(OPENPHISH_TXT).then((body) => distill(parseOpenPhishText(body), 'openphish')),
  ]);

  const candidates: Candidate[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      candidates.push(...r.value);
    } else {
      console.warn('[ingest-feeds] source failed:', r.reason);
    }
  }

  if (candidates.length === 0) {
    console.log('[ingest-feeds] 0 candidates after filtering — nothing to do');
    await db.end();
    return;
  }

  const stats = await upsert(candidates);
  console.log(
    `[ingest-feeds] ${candidates.length} candidates → ${stats.inserted} inserted, ${stats.updated} refreshed (${Date.now() - start}ms)`,
  );
  await db.end();
}

main().catch((err) => {
  console.error('[ingest-feeds] failed:', err);
  process.exit(1);
});
