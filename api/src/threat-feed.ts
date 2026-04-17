import { OFFICIAL_DOMAINS } from '@meetingcheck/detector';
import { query, queryOne } from './db.js';

const OFFICIAL_SET: Set<string> = new Set(
  Object.values(OFFICIAL_DOMAINS).flat() as string[],
);

/**
 * Official domains can never appear in the threat feed.
 * A threat feed that can flag zoom.us is worse than no threat feed.
 */
export function isProtectedDomain(registrableDomain: string): boolean {
  const lower = registrableDomain.toLowerCase();
  if (OFFICIAL_SET.has(lower)) return true;
  for (const official of OFFICIAL_SET) {
    if (lower.endsWith('.' + official)) return true;
  }
  return false;
}

export async function getConfirmedDomains(): Promise<Set<string>> {
  const rows = await query<{ registrable_domain: string }>(
    `SELECT registrable_domain FROM threat_feed WHERE status = 'confirmed'`,
  );
  return new Set(rows.map((r) => r.registrable_domain));
}

/**
 * If 3+ independent install_ids (or ip_hashes, as a fallback) have reported
 * the same registrable domain in the last 24h, auto-promote to `confirmed`.
 * Never override a `rejected` row. Never touch protected (official) domains.
 */
export async function tryAutoPromote(
  registrableDomain: string,
  brandImpersonated: string | null,
): Promise<void> {
  if (isProtectedDomain(registrableDomain)) return;

  const existing = await queryOne<{ status: string }>(
    `SELECT status FROM threat_feed WHERE registrable_domain = $1`,
    [registrableDomain],
  );
  if (existing?.status === 'rejected' || existing?.status === 'confirmed') return;

  const distinctRow = await queryOne<{ n: string }>(
    `SELECT COUNT(DISTINCT COALESCE(install_id, ip_hash))::TEXT AS n
     FROM reports
     WHERE registrable_domain = $1
       AND created_at >= NOW() - INTERVAL '24 hours'
       AND status IN ('pending', 'confirmed')`,
    [registrableDomain],
  );
  const distinct = Number(distinctRow?.n ?? 0);

  if (distinct >= 3) {
    await query(
      `INSERT INTO threat_feed (registrable_domain, first_seen, last_seen, report_count, brand_impersonated, status)
       VALUES ($1, NOW(), NOW(), $2, $3, 'confirmed')
       ON CONFLICT (registrable_domain) DO UPDATE SET
         last_seen = NOW(),
         report_count = threat_feed.report_count + 1,
         status = 'confirmed'`,
      [registrableDomain, distinct, brandImpersonated],
    );
  } else {
    await query(
      `INSERT INTO threat_feed (registrable_domain, first_seen, last_seen, report_count, brand_impersonated, status)
       VALUES ($1, NOW(), NOW(), $2, $3, 'suspected')
       ON CONFLICT (registrable_domain) DO UPDATE SET
         last_seen = NOW(),
         report_count = threat_feed.report_count + 1`,
      [registrableDomain, distinct, brandImpersonated],
    );
  }
}
