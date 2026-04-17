import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { check } from '@isthislinksafe/detector';
import type { Bindings, Variables } from './bindings.js';
import { clientIp, hashIp, isUuidLike, newId } from './util.js';
import { rateLimit } from './rate-limit.js';
import { expand } from './expand.js';
import { getConfirmedDomains, isProtectedDomain, tryAutoPromote } from './threat-feed.js';
import { verifyTurnstile } from './turnstile.js';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    // Allow the website, extension popups (chrome-extension:// / moz-extension://),
    // and localhost for development.
    if (origin === 'https://isthislinksafe.com') return origin;
    if (origin.startsWith('chrome-extension://')) return origin;
    if (origin.startsWith('moz-extension://')) return origin;
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return origin;
    return null;
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['content-type', 'x-install-id'],
}));

app.use('*', async (c, next) => {
  const ip = clientIp(c.req.raw);
  const salt = c.env.ENVIRONMENT === 'production' ? 'prod-v1' : 'dev-v1';
  c.set('ipHash', await hashIp(ip, salt));
  const installHeader = c.req.header('x-install-id');
  c.set('installId', installHeader && isUuidLike(installHeader) ? installHeader : null);
  return next();
});

app.get('/', (c) => c.json({ service: 'isthislinksafe', version: '0.1.0' }));

// ---------- /v1/check ----------
app.post('/v1/check', async (c) => {
  const installId = c.get('installId');
  const ipHash = c.get('ipHash');
  const limit = installId ? 120 : 30;
  const rl = await rateLimit(c.env.CACHE, `check:${installId ?? ipHash}`, limit, 60);
  if (!rl.allowed) {
    return c.json({ error: 'rate_limited', resetAt: rl.resetAt }, 429);
  }

  let body: { url?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json' }, 400);
  }
  const input = (body.url ?? '').trim();
  if (!input || input.length > 2048) {
    return c.json({ error: 'missing_or_too_long' }, 400);
  }

  // Expand shortened URLs. If expansion fails, fall through to checking the original.
  const expansion = await expand(input);
  const finalUrl = expansion.final;

  // Cache verdict by hostname, not full URL — paths don't affect the verdict.
  let finalHostname = '';
  try { finalHostname = new URL(finalUrl).hostname.toLowerCase(); } catch {}
  const cacheKey = `verdict:${finalHostname}`;
  const cached = finalHostname ? await c.env.CACHE.get(cacheKey, 'json') : null;

  let checkResult;
  if (cached) {
    checkResult = cached as ReturnType<typeof check>;
  } else {
    const reportedDomains = await getConfirmedDomains(c.env.DB);
    checkResult = check(finalUrl, { reportedDomains });
    if (finalHostname && checkResult.verdict !== 'INVALID') {
      await c.env.CACHE.put(cacheKey, JSON.stringify(checkResult), { expirationTtl: 900 });
    }
  }

  // Log the check asynchronously. Don't block the response.
  c.executionCtx.waitUntil(
    c.env.DB
      .prepare(
        `INSERT INTO check_log (hostname, verdict, ip_hash, install_id, checked_at) VALUES (?, ?, ?, ?, ?)`
      )
      .bind(finalHostname, checkResult.verdict, ipHash, installId, Date.now())
      .run()
      .catch(() => { /* swallow — logging is best-effort */ })
  );

  return c.json({
    ...checkResult,
    resolved_hostname: finalHostname,
    redirect_chain: expansion.chain,
    expansion_timed_out: expansion.timedOut,
    scanned_at: new Date().toISOString(),
  });
});

// ---------- /v1/report ----------
app.post('/v1/report', async (c) => {
  const installId = c.get('installId');
  const ipHash = c.get('ipHash');
  const rl = await rateLimit(c.env.CACHE, `report:${installId ?? ipHash}`, 10, 3600);
  if (!rl.allowed) {
    return c.json({ error: 'rate_limited', resetAt: rl.resetAt }, 429);
  }

  let body: { url?: string; context?: string; received_from?: string; turnstile_token?: string; honeypot?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json' }, 400);
  }

  // Honeypot — bots fill this, humans don't see it.
  if (body.honeypot) return c.json({ report_id: 'ignored', status: 'queued' });

  const url = (body.url ?? '').trim();
  if (!url || url.length > 2048) return c.json({ error: 'missing_or_too_long' }, 400);

  const ok = await verifyTurnstile(body.turnstile_token, clientIp(c.req.raw), c.env.TURNSTILE_SECRET);
  if (!ok) return c.json({ error: 'turnstile_failed' }, 403);

  const parsed = check(url);
  if (parsed.verdict === 'INVALID') return c.json({ error: 'invalid_url' }, 400);

  // Official domains can never be reported as scams.
  if (isProtectedDomain(parsed.registrableDomain)) {
    return c.json({ error: 'protected_domain' }, 400);
  }

  const brand = parsed.signals.find(s => s.brand)?.brand?.toLowerCase() ?? null;
  const id = newId('rpt');
  const now = Date.now();

  await c.env.DB
    .prepare(
      `INSERT INTO reports (id, url, hostname, registrable_domain, context, received_from, install_id, ip_hash, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    )
    .bind(
      id, url, parsed.hostname, parsed.registrableDomain,
      body.context ?? null,
      body.received_from ?? null,
      installId,
      ipHash,
      now,
    )
    .run();

  c.executionCtx.waitUntil(tryAutoPromote(c.env.DB, parsed.registrableDomain, brand));

  return c.json({ report_id: id, status: 'queued' });
});

// ---------- /v1/stats ----------
app.get('/v1/stats', async (c) => {
  const cached = await c.env.CACHE.get('stats:v1', 'json');
  if (cached) return c.json(cached);

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const [checks24, flagged24, reportsTotal, confirmed] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) AS n FROM check_log WHERE checked_at >= ?`).bind(dayAgo).first<{ n: number }>(),
    c.env.DB.prepare(`SELECT COUNT(*) AS n FROM check_log WHERE checked_at >= ? AND verdict = 'DANGEROUS'`).bind(dayAgo).first<{ n: number }>(),
    c.env.DB.prepare(`SELECT COUNT(*) AS n FROM reports`).first<{ n: number }>(),
    c.env.DB.prepare(`SELECT COUNT(*) AS n FROM threat_feed WHERE status = 'confirmed'`).first<{ n: number }>(),
  ]);

  const stats = {
    links_checked_24h: checks24?.n ?? 0,
    scams_flagged_24h: flagged24?.n ?? 0,
    community_reports_total: reportsTotal?.n ?? 0,
    confirmed_scam_domains: confirmed?.n ?? 0,
  };
  await c.env.CACHE.put('stats:v1', JSON.stringify(stats), { expirationTtl: 60 });
  return c.json(stats);
});

// ---------- /v1/threat-feed ----------
app.get('/v1/threat-feed', async (c) => {
  const { results } = await c.env.DB
    .prepare(
      `SELECT registrable_domain, first_seen, last_seen, brand_impersonated
       FROM threat_feed WHERE status = 'confirmed'
       ORDER BY last_seen DESC LIMIT 500`
    )
    .all();
  return c.json({ domains: results });
});

// ---------- /v1/official-domains ----------
app.get('/v1/official-domains', async (c) => {
  const { OFFICIAL_DOMAINS } = await import('@isthislinksafe/detector');
  return c.json({
    version: '0.1.0',
    domains: OFFICIAL_DOMAINS,
  }, 200, { 'cache-control': 'public, max-age=3600' });
});

// ---------- Admin review ----------
app.post('/admin/review', async (c) => {
  const auth = c.req.header('authorization');
  const token = c.env.ADMIN_TOKEN;
  if (!token || auth !== `Bearer ${token}`) {
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
  const now = Date.now();
  await c.env.DB
    .prepare(
      `INSERT INTO threat_feed (registrable_domain, first_seen, last_seen, report_count, brand_impersonated, status, notes)
       VALUES (?, ?, ?, 0, NULL, ?, ?)
       ON CONFLICT(registrable_domain) DO UPDATE SET
         last_seen = excluded.last_seen,
         status = excluded.status,
         notes = excluded.notes`
    )
    .bind(body.registrable_domain, now, now, body.status, body.note ?? null)
    .run();
  // Bust the cache for that hostname.
  await c.env.CACHE.delete(`verdict:${body.registrable_domain}`);
  return c.json({ ok: true });
});

export default app;
