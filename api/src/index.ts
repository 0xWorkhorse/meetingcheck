import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import {
  check,
  decodeAndSkeleton,
  format,
  pickLocale,
  AVAILABLE_LOCALES,
  LOCALES,
  OFFICIAL_DOMAINS,
  type CheckResult,
} from '@meetingcheck/detector';
import { env } from './env.js';
import { db, query, queryOne } from './db.js';
import { redis, getCachedVerdict, setCachedVerdict, getCachedStats, setCachedStats, invalidateVerdict } from './redis.js';
import { context, rateLimitMiddleware, type AppVariables } from './middleware.js';
import { clientIp, isUuidLike, newId } from './util.js';
import { expand } from './expand.js';
import { getConfirmedDomains, isProtectedDomain, tryAutoPromote } from './threat-feed.js';
import { verifyTurnstile } from './turnstile.js';
import { notifyNewReport } from './notify.js';
import { getCertAge } from './cert.js';
import { getHosting } from './geoip.js';
import { getWhoisAge } from './whois.js';

const app = new Hono<{ Variables: AppVariables }>();

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (env.ALLOWED_ORIGINS.includes(origin)) return origin;
      if (origin.startsWith('chrome-extension://')) return origin;
      if (origin.startsWith('moz-extension://')) return origin;
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return origin;
      return null;
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['content-type', 'x-install-id', 'x-locale', 'accept-language', 'authorization'],
    exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  }),
);

app.use('*', context);

function resolveLocale(c: { req: { header(name: string): string | undefined } }): string {
  const explicit = c.req.header('x-locale');
  if (explicit && AVAILABLE_LOCALES.includes(explicit)) return explicit;
  return pickLocale(c.req.header('accept-language'));
}

/**
 * Fire-and-forget on Node: just don't await. The Hono response flushes regardless.
 * Errors are swallowed intentionally — these writes are best-effort logging.
 */
function fireAndForget<T>(p: Promise<T>) {
  p.catch((err) => console.error('[background]', err));
}

// ---------- Root + Health ----------

app.get('/', (c) => c.json({ service: 'meetingcheck', version: '0.2.0' }));

app.get('/health', async (c) => {
  try {
    await Promise.all([db.query('SELECT 1'), redis.ping()]);
    return c.json({ ok: true, db: 'up', redis: 'up' });
  } catch (err) {
    return c.json({ ok: false, error: (err as Error).message }, 503);
  }
});

// ---------- /v1/check ----------

app.post('/v1/check', rateLimitMiddleware('check', 30, 120, 60), async (c) => {
  let body: { url?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json' }, 400);
  }
  const input = (body.url ?? '').trim();
  if (!input || input.length > 2048) return c.json({ error: 'missing_or_too_long' }, 400);

  const expansion = await expand(input);
  const finalUrl = expansion.final;

  let finalHostname = '';
  try { finalHostname = new URL(finalUrl).hostname.toLowerCase(); } catch {}

  let checkResult = finalHostname ? await getCachedVerdict<CheckResult>(finalHostname) : null;
  if (!checkResult) {
    const reportedDomains = await getConfirmedDomains();
    checkResult = check(finalUrl, { reportedDomains });
    if (finalHostname && checkResult.verdict !== 'INVALID') {
      await setCachedVerdict(finalHostname, checkResult);
    }
  }

  const locale = resolveLocale(c);
  const formatted = format(checkResult, locale);

  // Fetch enrichments in parallel — none block the verdict itself. Slowest wins:
  // CT (crt.sh) and WHOIS can each take up to 3s; DNS+GeoIP capped at 1.5s;
  // community DB query is ~50ms.
  const [community, cert, hosting, whois] = await Promise.all([
    checkResult.registrableDomain
      ? queryOne<{ report_count: string; status: string }>(
          `SELECT report_count::TEXT, status FROM threat_feed WHERE registrable_domain = $1`,
          [checkResult.registrableDomain],
        )
      : Promise.resolve(null),
    finalHostname
      ? getCertAge(finalHostname)
      : Promise.resolve({ days: null, checked: false }),
    finalHostname
      ? getHosting(finalHostname)
      : Promise.resolve({ country: null, ip: null, checked: false }),
    finalHostname
      ? getWhoisAge(finalHostname)
      : Promise.resolve({ age_days: null, checked: false }),
  ]);

  fireAndForget(
    query(
      `INSERT INTO check_log (hostname, verdict, ip_hash, install_id) VALUES ($1, $2, $3, $4)`,
      [finalHostname, checkResult.verdict, c.get('ipHash'), c.get('installId')],
    ),
  );

  const charDecode = finalHostname ? decodeAndSkeleton(finalHostname) : null;

  return c.json({
    ...formatted,
    resolved_hostname: finalHostname,
    redirect_chain: expansion.chain,
    expansion_timed_out: expansion.timedOut,
    scanned_at: new Date().toISOString(),
    community_report_count: community ? Number(community.report_count) : 0,
    community_status: community?.status ?? null,
    cert_age_days: cert.days,
    cert_checked: cert.checked,
    // Character-level analysis of the (post-expansion) hostname.
    // non_ascii: any code point outside ASCII (including punycode source).
    // decoded: the Unicode form of xn-- labels expanded back out.
    homoglyph_non_ascii: charDecode?.used ?? false,
    homoglyph_decoded: charDecode?.decoded ?? null,
    homoglyph_punycode: finalHostname.includes('xn--'),
    hosting_country: hosting.country,
    hosting_ip: hosting.ip,
    hosting_checked: hosting.checked,
    whois_age_days: whois.age_days,
    whois_checked: whois.checked,
  });
});

// ---------- /v1/report ----------

app.post('/v1/report', rateLimitMiddleware('report', 10, 10, 3600), async (c) => {
  let body: { url?: string; context?: string; received_from?: string; turnstile_token?: string; honeypot?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json' }, 400);
  }

  if (body.honeypot) return c.json({ report_id: 'ignored', status: 'queued' });

  const url = (body.url ?? '').trim();
  if (!url || url.length > 2048) return c.json({ error: 'missing_or_too_long' }, 400);

  const ok = await verifyTurnstile(body.turnstile_token, clientIp(c.req), env.TURNSTILE_SECRET_KEY);
  if (!ok) return c.json({ error: 'turnstile_failed' }, 403);

  const parsed = check(url);
  if (parsed.verdict === 'INVALID') return c.json({ error: 'invalid_url' }, 400);
  if (isProtectedDomain(parsed.registrableDomain)) return c.json({ error: 'protected_domain' }, 400);

  const brand = parsed.signals.find((s) => s.brand)?.brand?.toLowerCase() ?? null;
  const id = newId('rpt');

  await query(
    `INSERT INTO reports (id, url, hostname, registrable_domain, context, received_from, install_id, ip_hash, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
    [
      id,
      url,
      parsed.hostname,
      parsed.registrableDomain,
      body.context ?? null,
      body.received_from ?? null,
      c.get('installId'),
      c.get('ipHash'),
    ],
  );

  fireAndForget(tryAutoPromote(parsed.registrableDomain, brand));
  fireAndForget(
    notifyNewReport({
      reportId: id,
      url,
      hostname: parsed.hostname,
      registrableDomain: parsed.registrableDomain,
      brand,
      receivedFrom: body.received_from ?? null,
      context: body.context ?? null,
    }),
  );

  return c.json({ report_id: id, status: 'queued' });
});

// ---------- /v1/stats ----------

app.get('/v1/stats', async (c) => {
  const cached = await getCachedStats();
  if (cached) return c.json(cached);

  const [checks24, flagged24, checksTotal, flaggedTotal, reportsTotal, confirmed] = await Promise.all([
    queryOne<{ n: string }>(`SELECT COUNT(*)::TEXT AS n FROM check_log WHERE checked_at >= NOW() - INTERVAL '24 hours'`),
    queryOne<{ n: string }>(`SELECT COUNT(*)::TEXT AS n FROM check_log WHERE checked_at >= NOW() - INTERVAL '24 hours' AND verdict = 'DANGEROUS'`),
    queryOne<{ n: string }>(`SELECT COUNT(*)::TEXT AS n FROM check_log`),
    queryOne<{ n: string }>(`SELECT COUNT(*)::TEXT AS n FROM check_log WHERE verdict = 'DANGEROUS'`),
    queryOne<{ n: string }>(`SELECT COUNT(*)::TEXT AS n FROM reports`),
    queryOne<{ n: string }>(`SELECT COUNT(*)::TEXT AS n FROM threat_feed WHERE status = 'confirmed'`),
  ]);

  const stats = {
    links_checked_24h:       Number(checks24?.n ?? 0),
    scams_flagged_24h:       Number(flagged24?.n ?? 0),
    links_checked_total:     Number(checksTotal?.n ?? 0),
    scams_flagged_total:     Number(flaggedTotal?.n ?? 0),
    community_reports_total: Number(reportsTotal?.n ?? 0),
    confirmed_scam_domains:  Number(confirmed?.n ?? 0),
  };
  await setCachedStats(stats);
  return c.json(stats);
});

// ---------- /v1/threat-feed ----------

app.get('/v1/threat-feed', async (c) => {
  const rows = await query(
    `SELECT registrable_domain, first_seen, last_seen, brand_impersonated
     FROM threat_feed WHERE status = 'confirmed'
     ORDER BY last_seen DESC LIMIT 500`,
  );
  return c.json({ domains: rows });
});

// ---------- /v1/official-domains ----------

app.get('/v1/official-domains', (c) =>
  c.json(
    { version: '0.2.0', domains: OFFICIAL_DOMAINS },
    200,
    { 'cache-control': 'public, max-age=3600' },
  ),
);

// ---------- /v1/locales ----------

app.get('/v1/locales', (c) =>
  c.json(
    {
      available: Object.values(LOCALES).map((l) => ({ code: l.code, name: l.name })),
      resolved: resolveLocale(c),
    },
    200,
    { 'cache-control': 'public, max-age=3600' },
  ),
);

// ---------- Admin review ----------

app.post('/admin/review', async (c) => {
  const auth = c.req.header('authorization');
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  const body = await c.req.json<{
    registrable_domain: string;
    status: 'confirmed' | 'rejected';
    note?: string;
  }>();
  if (isProtectedDomain(body.registrable_domain) && body.status === 'confirmed') {
    return c.json({ error: 'protected_domain' }, 400);
  }
  await query(
    `INSERT INTO threat_feed (registrable_domain, first_seen, last_seen, report_count, brand_impersonated, status, notes)
     VALUES ($1, NOW(), NOW(), 0, NULL, $2, $3)
     ON CONFLICT (registrable_domain) DO UPDATE SET
       last_seen = NOW(),
       status = EXCLUDED.status,
       notes = EXCLUDED.notes`,
    [body.registrable_domain, body.status, body.note ?? null],
  );
  await invalidateVerdict(body.registrable_domain);
  return c.json({ ok: true });
});

// ---------- Start ----------

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`[api] listening on :${info.port} (${env.NODE_ENV})`);
});

// Graceful shutdown so Railway rolling restarts don't drop connections mid-flight.
for (const sig of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sig, async () => {
    console.log(`[api] received ${sig}, shutting down`);
    try { await db.end(); } catch {}
    try { redis.disconnect(); } catch {}
    process.exit(0);
  });
}

export default app;
