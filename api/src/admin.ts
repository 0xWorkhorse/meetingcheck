/**
 * Admin-only endpoints: stats JSON.
 *
 * The human-facing dashboard now lives at https://meetingcheck.io/admin as a
 * static asset in the web service (see web/public/admin/index.html). That page
 * fetches from this JSON endpoint with a Bearer token. CORS on the main
 * router already allows https://meetingcheck.io as an origin, so the cross-
 * origin request works without extra headers here.
 */
import type { Hono, Context, Next } from 'hono';
import { env } from './env.js';
import { query, queryOne } from './db.js';
import type { AppVariables } from './middleware.js';

type Ctx = Context<{ Variables: AppVariables }>;

function requireAdmin(c: Ctx, next: Next): Promise<Response | void> | Response {
  const auth = c.req.header('authorization');
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  return next();
}

export function registerAdminRoutes(app: Hono<{ Variables: AppVariables }>): void {
  app.get('/v1/admin/stats', requireAdmin, statsHandler);
}

async function statsHandler(c: Ctx): Promise<Response> {
  // Five queries fired in parallel — none of them are hot-path and the tables
  // have indexes on checked_at / created_at / (status, last_seen). If any
  // one of these goes over ~200ms in practice, flag it and we'll materialize.
  const [
    checkCountsRow,
    reportCountsRow,
    threatCountsRow,
    verdictRows,
    topDangerousRows,
    recentConfirmedRows,
  ] = await Promise.all([
    // check_log counts + unique installs across windows, one statement
    queryOne<{
      c24: string; c7: string; c30: string; call: string;
      u24: string; u7: string; u30: string;
    }>(`
      SELECT
        COUNT(*) FILTER (WHERE checked_at >= NOW() - INTERVAL '24 hours')::TEXT AS c24,
        COUNT(*) FILTER (WHERE checked_at >= NOW() - INTERVAL '7 days')::TEXT   AS c7,
        COUNT(*) FILTER (WHERE checked_at >= NOW() - INTERVAL '30 days')::TEXT  AS c30,
        COUNT(*)::TEXT                                                          AS call,
        COUNT(DISTINCT install_id) FILTER (
          WHERE install_id IS NOT NULL AND checked_at >= NOW() - INTERVAL '24 hours'
        )::TEXT AS u24,
        COUNT(DISTINCT install_id) FILTER (
          WHERE install_id IS NOT NULL AND checked_at >= NOW() - INTERVAL '7 days'
        )::TEXT AS u7,
        COUNT(DISTINCT install_id) FILTER (
          WHERE install_id IS NOT NULL AND checked_at >= NOW() - INTERVAL '30 days'
        )::TEXT AS u30
      FROM check_log
    `),
    // reports counts
    queryOne<{ r24: string; r7: string; pending: string; confirmed: string }>(`
      SELECT
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::TEXT AS r24,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::TEXT   AS r7,
        COUNT(*) FILTER (WHERE status = 'pending')::TEXT                        AS pending,
        COUNT(*) FILTER (WHERE status = 'confirmed')::TEXT                      AS confirmed
      FROM reports
    `),
    // threat_feed status buckets
    queryOne<{ confirmed: string; suspected: string }>(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'confirmed')::TEXT AS confirmed,
        COUNT(*) FILTER (WHERE status = 'suspected')::TEXT AS suspected
      FROM threat_feed
    `),
    // verdict breakdown, last 24h
    query<{ verdict: string; n: string }>(`
      SELECT verdict, COUNT(*)::TEXT AS n
      FROM check_log
      WHERE checked_at >= NOW() - INTERVAL '24 hours'
      GROUP BY verdict
    `),
    // top dangerous hosts by hit count, last 7d
    query<{ hostname: string; hits: string }>(`
      SELECT hostname, COUNT(*)::TEXT AS hits
      FROM check_log
      WHERE verdict = 'DANGEROUS'
        AND checked_at >= NOW() - INTERVAL '7 days'
        AND hostname <> ''
      GROUP BY hostname
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `),
    // most recently confirmed threat-feed entries
    query<{ registrable_domain: string; first_seen: string; brand_impersonated: string | null }>(`
      SELECT registrable_domain, first_seen, brand_impersonated
      FROM threat_feed
      WHERE status = 'confirmed'
      ORDER BY last_seen DESC
      LIMIT 10
    `),
  ]);

  const verdicts24h: Record<string, number> = {
    SAFE: 0, DANGEROUS: 0, UNRECOGNIZED: 0, INVALID: 0,
  };
  for (const row of verdictRows) {
    verdicts24h[row.verdict] = Number(row.n);
  }

  return c.json({
    generated_at: new Date().toISOString(),
    checks: {
      last_24h:  Number(checkCountsRow?.c24  ?? 0),
      last_7d:   Number(checkCountsRow?.c7   ?? 0),
      last_30d:  Number(checkCountsRow?.c30  ?? 0),
      all_time:  Number(checkCountsRow?.call ?? 0),
    },
    unique_install_ids: {
      last_24h: Number(checkCountsRow?.u24 ?? 0),
      last_7d:  Number(checkCountsRow?.u7  ?? 0),
      last_30d: Number(checkCountsRow?.u30 ?? 0),
    },
    verdicts_24h: verdicts24h,
    reports: {
      last_24h:        Number(reportCountsRow?.r24       ?? 0),
      last_7d:         Number(reportCountsRow?.r7        ?? 0),
      pending_review:  Number(reportCountsRow?.pending   ?? 0),
      confirmed_total: Number(reportCountsRow?.confirmed ?? 0),
    },
    top_dangerous_domains_7d: topDangerousRows.map((r) => ({
      hostname: r.hostname,
      hits: Number(r.hits),
    })),
    threat_feed: {
      confirmed_total:   Number(threatCountsRow?.confirmed ?? 0),
      suspected_pending: Number(threatCountsRow?.suspected ?? 0),
      most_recent_confirmed: recentConfirmedRows.map((r) => ({
        domain: r.registrable_domain,
        first_seen: r.first_seen,
        brand: r.brand_impersonated,
      })),
    },
  });
}
