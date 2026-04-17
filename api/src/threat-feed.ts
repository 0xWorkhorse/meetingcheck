import { OFFICIAL_DOMAINS } from '@isthislinksafe/detector';

const OFFICIAL_SET: Set<string> = new Set(
  Object.values(OFFICIAL_DOMAINS).flat() as string[]
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

export async function getConfirmedDomains(db: D1Database): Promise<Set<string>> {
  const { results } = await db
    .prepare(`SELECT registrable_domain FROM threat_feed WHERE status = 'confirmed'`)
    .all<{ registrable_domain: string }>();
  return new Set(results.map(r => r.registrable_domain));
}

/**
 * If 3+ independent install_ids have reported the same registrable domain
 * in the last 24h, auto-promote to confirmed.
 */
export async function tryAutoPromote(
  db: D1Database,
  registrableDomain: string,
  brandImpersonated: string | null,
): Promise<void> {
  if (isProtectedDomain(registrableDomain)) return;

  const existing = await db
    .prepare(`SELECT status FROM threat_feed WHERE registrable_domain = ?`)
    .bind(registrableDomain)
    .first<{ status: string }>();

  // Never re-promote something previously rejected.
  if (existing?.status === 'rejected' || existing?.status === 'confirmed') return;

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const distinctRow = await db
    .prepare(
      `SELECT COUNT(DISTINCT COALESCE(install_id, ip_hash)) AS n
       FROM reports
       WHERE registrable_domain = ?
         AND created_at >= ?
         AND status IN ('pending', 'confirmed')`
    )
    .bind(registrableDomain, dayAgo)
    .first<{ n: number }>();

  const distinct = distinctRow?.n ?? 0;
  const now = Date.now();

  if (distinct >= 3) {
    await db
      .prepare(
        `INSERT INTO threat_feed (registrable_domain, first_seen, last_seen, report_count, brand_impersonated, status)
         VALUES (?, ?, ?, ?, ?, 'confirmed')
         ON CONFLICT(registrable_domain) DO UPDATE SET
           last_seen = excluded.last_seen,
           report_count = threat_feed.report_count + 1,
           status = 'confirmed'`
      )
      .bind(registrableDomain, now, now, distinct, brandImpersonated)
      .run();
  } else {
    // Record as suspected so we have a row to update; never override a rejected row.
    await db
      .prepare(
        `INSERT INTO threat_feed (registrable_domain, first_seen, last_seen, report_count, brand_impersonated, status)
         VALUES (?, ?, ?, ?, ?, 'suspected')
         ON CONFLICT(registrable_domain) DO UPDATE SET
           last_seen = excluded.last_seen,
           report_count = threat_feed.report_count + 1`
      )
      .bind(registrableDomain, now, now, distinct, brandImpersonated)
      .run();
  }
}
