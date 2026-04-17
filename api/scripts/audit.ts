/**
 * isthislinksafe pre-launch audit.
 *
 * Hits the deployed HTTP API (set AUDIT_API_URL), plus direct Postgres and
 * Redis connections (DATABASE_URL / REDIS_URL) to verify server-side state.
 *
 *   AUDIT_API_URL=https://api.isthislinksafe.com \
 *   AUDIT_ADMIN_TOKEN=... \
 *   DATABASE_URL=... \
 *   REDIS_URL=... \
 *   npm run audit
 *
 * Exits 0 if every blocker passed, 1 otherwise. Warnings never block.
 * Test data is prefixed `audit-` so it can always be identified and cleaned.
 */
import 'dotenv/config';
import pg from 'pg';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import { AUDIT_CORPUS } from './audit-corpus.js';

// ---------- Config ----------

const API_URL = (process.env.AUDIT_API_URL ?? '').replace(/\/$/, '');
const ADMIN_TOKEN = process.env.AUDIT_ADMIN_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL;

if (!API_URL)      die('AUDIT_API_URL is required (e.g. https://api.isthislinksafe.com)');
if (!DATABASE_URL) die('DATABASE_URL is required');
if (!REDIS_URL)    die('REDIS_URL is required');

const AUDIT_RUN_ID = `audit-${Date.now()}`;
const SENTINEL_DOMAIN = `${AUDIT_RUN_ID}.example`;
const SECOND_SENTINEL = `${AUDIT_RUN_ID}-b.example`;

type Severity = 'blocker' | 'warning';
type Status = 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
interface CheckResult { name: string; severity: Severity; status: Status; ms: number; note?: string }
interface Check { name: string; severity: Severity; fn: () => Promise<string | void> }

// ---------- Clients ----------

const db = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false },
  max: 4,
});

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 2,
  lazyConnect: true,
  retryStrategy: () => null, // don't retry indefinitely in the audit harness
});
redis.on('error', () => { /* surface failures via the checks, not as log noise */ });

// ---------- Helpers ----------

async function http(path: string, opts: {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  expectStatus?: number | number[];
} = {}): Promise<{ status: number; headers: Headers; body: any; ms: number }> {
  const start = Date.now();
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers: { 'content-type': 'application/json', ...opts.headers },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const ms = Date.now() - start;
  const text = await res.text();
  let body: any = text;
  try { body = JSON.parse(text); } catch { /* keep as text */ }
  if (opts.expectStatus !== undefined) {
    const allowed = Array.isArray(opts.expectStatus) ? opts.expectStatus : [opts.expectStatus];
    if (!allowed.includes(res.status)) {
      throw new Error(`${opts.method ?? 'GET'} ${path} → ${res.status} (want ${allowed.join('|')}): ${text.slice(0, 200)}`);
    }
  }
  return { status: res.status, headers: res.headers, body, ms };
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function die(msg: string): never {
  console.error(`[audit] ${msg}`);
  process.exit(1);
}

// ---------- BLOCKERS ----------

async function checkHealth() {
  const r = await http('/health', { expectStatus: 200 });
  assert(r.body?.ok === true, `/health returned ok=${r.body?.ok}`);
  // Direct DB + Redis pings too — the endpoint may lie.
  const pgRows = await db.query('SELECT 1 AS ok');
  assert(pgRows.rows[0]?.ok === 1, 'Postgres SELECT 1 did not return');
  const pong = await redis.ping();
  assert(pong === 'PONG', `Redis PING returned ${pong}`);
  return 'api + db + redis all responding';
}

async function checkSchemaAndSeed() {
  const tables = await db.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('reports','threat_feed','check_log','schema_migrations')`,
  );
  const tableSet = new Set(tables.rows.map((r) => r.table_name));
  for (const t of ['reports', 'threat_feed', 'check_log', 'schema_migrations']) {
    assert(tableSet.has(t), `missing table: ${t}`);
  }

  const indexes = await db.query<{ indexname: string }>(
    `SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`,
  );
  const idxSet = new Set(indexes.rows.map((r) => r.indexname));
  for (const i of ['idx_reports_domain_status', 'idx_check_log_time']) {
    assert(idxSet.has(i), `missing index: ${i}`);
  }

  const migrations = await db.query<{ version: string }>(
    `SELECT version FROM schema_migrations ORDER BY version`,
  );
  const versions = migrations.rows.map((r) => r.version);
  assert(versions.includes('0001_init.sql'), 'migration 0001_init.sql not applied');

  const seedRows = await db.query<{ registrable_domain: string }>(
    `SELECT registrable_domain FROM threat_feed
      WHERE status = 'confirmed'
        AND registrable_domain IN ('uswebzoomus.com','us01web-zoom.us','googlemeetinterview.click')`,
  );
  const seedSet = new Set(seedRows.rows.map((r) => r.registrable_domain));
  const missing = ['uswebzoomus.com', 'us01web-zoom.us', 'googlemeetinterview.click']
    .filter((d) => !seedSet.has(d));
  assert(missing.length === 0, `threat_feed missing confirmed seed domains: ${missing.join(', ')}`);

  return `${versions.length} migrations, ${seedSet.size}/3 seed domains confirmed`;
}

async function checkDetectorWiring() {
  const installId = randomUUID();
  let matched = 0;
  const failures: string[] = [];
  for (const tc of AUDIT_CORPUS) {
    const r = await http('/v1/check', {
      method: 'POST',
      body: { url: tc.url },
      headers: { 'x-install-id': installId, 'x-locale': 'en' },
      expectStatus: 200,
    });
    if (r.body?.verdict === tc.expected) {
      matched++;
    } else {
      failures.push(`${tc.url} → got ${r.body?.verdict}, want ${tc.expected} (${tc.note})`);
    }
  }
  assert(failures.length === 0,
    `${failures.length}/${AUDIT_CORPUS.length} detector mismatches:\n    ${failures.join('\n    ')}`);
  return `${matched}/${AUDIT_CORPUS.length} corpus cases returned expected verdict`;
}

async function checkApiContract() {
  const installId = randomUUID();

  const ok = await http('/v1/check', {
    method: 'POST',
    body: { url: 'https://zoom.us/j/123' },
    headers: { 'x-install-id': installId },
    expectStatus: 200,
  });
  for (const key of ['verdict', 'confidence', 'title', 'reason', 'hostname', 'signals', 'scanned_at'] as const) {
    assert(key in ok.body, `/v1/check response missing field: ${key}`);
  }
  assert(Array.isArray(ok.body.signals), '/v1/check signals is not an array');

  // Missing body and malformed JSON should both 400.
  const badRes = await fetch(`${API_URL}/v1/check`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: 'not-json',
  });
  assert(badRes.status === 400, `/v1/check with malformed body → ${badRes.status}`);

  await http('/v1/check', { method: 'POST', body: {}, expectStatus: 400 });

  const stats = await http('/v1/stats', { expectStatus: 200 });
  for (const key of ['links_checked_24h', 'scams_flagged_24h', 'community_reports_total', 'confirmed_scam_domains'] as const) {
    assert(typeof stats.body[key] === 'number', `stats.${key} is not a number`);
  }

  const tf = await http('/v1/threat-feed', { expectStatus: 200 });
  assert(Array.isArray(tf.body?.domains), '/v1/threat-feed.domains is not an array');

  const off = await http('/v1/official-domains', { expectStatus: 200 });
  assert(off.body?.domains?.zoom?.includes('zoom.us'), 'official domains missing zoom.us');

  const locales = await http('/v1/locales', { expectStatus: 200 });
  assert(Array.isArray(locales.body?.available) && locales.body.available.length >= 2,
    '/v1/locales missing available list');

  // /admin without bearer → 401; with wrong → 401.
  await http('/admin/review', {
    method: 'POST',
    body: { registrable_domain: SENTINEL_DOMAIN, status: 'rejected' },
    expectStatus: 401,
  });
  await http('/admin/review', {
    method: 'POST',
    body: { registrable_domain: SENTINEL_DOMAIN, status: 'rejected' },
    headers: { authorization: 'Bearer nope' },
    expectStatus: 401,
  });
  if (ADMIN_TOKEN) {
    const admin = await http('/admin/review', {
      method: 'POST',
      body: { registrable_domain: SENTINEL_DOMAIN, status: 'rejected', note: `[audit] ${AUDIT_RUN_ID}` },
      headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
      expectStatus: 200,
    });
    assert(admin.body?.ok === true, 'admin review did not return ok=true');
    return 'contract + admin 401/200 paths verified';
  }
  return 'contract verified (admin path skipped — AUDIT_ADMIN_TOKEN not set)';
}

async function checkRateLimiter() {
  // Use a fresh install_id so we get our own bucket (120/min known-install). We
  // deliberately don't stress the anon (30/min) bucket because we'd block the
  // audit runner's IP from prod traffic for a full minute on a shared egress.
  const installId = randomUUID();
  const LIMIT = 120;
  const over = LIMIT + 1;
  let firstTooMany = -1;
  let lastRemaining = -1;
  let resetAt = 0;

  for (let i = 0; i < over; i++) {
    const r = await http('/v1/check', {
      method: 'POST',
      body: { url: `https://zoom.us/j/${i}` },
      headers: { 'x-install-id': installId },
      // Don't throw on 429 — we're looking for it.
    });
    const remainingHeader = r.headers.get('x-ratelimit-remaining');
    if (remainingHeader != null) lastRemaining = Number(remainingHeader);
    const resetHeader = r.headers.get('x-ratelimit-reset');
    if (resetHeader != null) resetAt = Number(resetHeader);
    if (r.status === 429 && firstTooMany === -1) firstTooMany = i + 1;
    if (r.status === 429) break;
  }

  assert(firstTooMany > 0, `no 429 returned across ${over} requests (rate limit not firing)`);
  assert(firstTooMany <= LIMIT + 1, `429 fired at request ${firstTooMany}, expected near ${LIMIT + 1}`);
  const now = Math.floor(Date.now() / 1000);
  assert(resetAt > now && resetAt < now + 120, `X-RateLimit-Reset ${resetAt} not within the next minute`);
  return `429 at req ${firstTooMany}, remaining→${lastRemaining}, reset in ~${resetAt - now}s`;
}

async function checkAutoPromote() {
  // Clean any prior state.
  await db.query('DELETE FROM reports     WHERE registrable_domain IN ($1,$2)', [SENTINEL_DOMAIN, SECOND_SENTINEL]);
  await db.query('DELETE FROM threat_feed WHERE registrable_domain IN ($1,$2)', [SENTINEL_DOMAIN, SECOND_SENTINEL]);

  // 3 distinct install_ids report the first sentinel → must auto-promote.
  for (let i = 0; i < 3; i++) {
    const rid = randomUUID();
    const r = await http('/v1/report', {
      method: 'POST',
      body: {
        url: `https://${SENTINEL_DOMAIN}/join`,
        context: `[audit] ${AUDIT_RUN_ID} promote ${i}`,
        received_from: 'other',
      },
      headers: { 'x-install-id': rid },
    });
    assert(r.status === 200, `report #${i} returned ${r.status}: ${JSON.stringify(r.body)}`);
  }

  // Give the fire-and-forget tryAutoPromote a beat to land.
  for (let attempt = 0; attempt < 20; attempt++) {
    const row = await db.query<{ status: string }>(
      `SELECT status FROM threat_feed WHERE registrable_domain = $1`, [SENTINEL_DOMAIN],
    );
    if (row.rows[0]?.status === 'confirmed') break;
    await sleep(100);
  }
  const promoted = await db.query<{ status: string }>(
    `SELECT status FROM threat_feed WHERE registrable_domain = $1`, [SENTINEL_DOMAIN],
  );
  assert(promoted.rows[0]?.status === 'confirmed',
    `expected threat_feed row for ${SENTINEL_DOMAIN} with status=confirmed; got ${JSON.stringify(promoted.rows)}`);

  // 2 reports for the second sentinel → must stay suspected (or pending).
  for (let i = 0; i < 2; i++) {
    const rid = randomUUID();
    await http('/v1/report', {
      method: 'POST',
      body: {
        url: `https://${SECOND_SENTINEL}/join`,
        context: `[audit] ${AUDIT_RUN_ID} no-promote ${i}`,
        received_from: 'other',
      },
      headers: { 'x-install-id': rid },
      expectStatus: 200,
    });
  }
  await sleep(200);
  const notPromoted = await db.query<{ status: string }>(
    `SELECT status FROM threat_feed WHERE registrable_domain = $1`, [SECOND_SENTINEL],
  );
  assert(notPromoted.rows[0]?.status !== 'confirmed',
    `${SECOND_SENTINEL} should NOT be confirmed at 2 reports; got ${notPromoted.rows[0]?.status}`);

  return `${SENTINEL_DOMAIN} promoted at 3 reports; ${SECOND_SENTINEL} held at ${notPromoted.rows[0]?.status ?? 'none'}`;
}

async function checkVerdictCache() {
  const hostname = `cache-probe-${Date.now()}.example`;
  const url = `https://${hostname}/meeting`;

  await redis.del(`verdict:${hostname}`);

  const first = await http('/v1/check', {
    method: 'POST',
    body: { url },
    headers: { 'x-install-id': randomUUID() },
    expectStatus: 200,
  });
  const second = await http('/v1/check', {
    method: 'POST',
    body: { url },
    headers: { 'x-install-id': randomUUID() },
    expectStatus: 200,
  });

  const cached = await redis.get(`verdict:${hostname}`);
  assert(cached != null, `expected redis key verdict:${hostname} after first check, none found`);
  const ttl = await redis.ttl(`verdict:${hostname}`);
  assert(ttl > 0 && ttl <= 900, `verdict TTL ${ttl}s out of expected 0-900s range`);

  // Parsed cached shape should look like a CheckResult (keys + params, no pre-rendered strings).
  const parsed = JSON.parse(cached!) as { titleKey?: string; title?: string };
  assert(parsed.titleKey != null, 'cached value missing titleKey — cache may be storing formatted output');
  assert(parsed.title == null, 'cached value contains pre-rendered title — must be locale-neutral');

  // Clean up.
  await redis.del(`verdict:${hostname}`);
  return `cache round-trip ok (cold ${first.ms}ms → warm ${second.ms}ms, ttl ${ttl}s, locale-neutral shape)`;
}

async function checkI18n() {
  const url = 'https://uswebzoomus.com/j/123';
  const installId = randomUUID();

  const es = await http('/v1/check', {
    method: 'POST', body: { url }, headers: { 'x-install-id': installId, 'x-locale': 'es' }, expectStatus: 200,
  });
  assert(es.body?.locale === 'es', `x-locale: es → response.locale = ${es.body?.locale}`);
  assert(/estafa|enlace|suplantaci/i.test(es.body?.reason ?? ''),
    `x-locale: es response does not look Spanish: ${es.body?.reason}`);

  const en = await http('/v1/check', {
    method: 'POST', body: { url }, headers: { 'x-install-id': installId, 'x-locale': 'en' }, expectStatus: 200,
  });
  assert(en.body?.locale === 'en', `x-locale: en → response.locale = ${en.body?.locale}`);
  assert(/scam|meeting|official/i.test(en.body?.reason ?? ''),
    `x-locale: en response does not look English: ${en.body?.reason}`);

  const accept = await http('/v1/check', {
    method: 'POST', body: { url }, headers: { 'x-install-id': installId, 'accept-language': 'es-MX,es;q=0.9,en;q=0.8' },
    expectStatus: 200,
  });
  assert(accept.body?.locale === 'es', `Accept-Language: es-MX → response.locale = ${accept.body?.locale}`);

  const fr = await http('/v1/check', {
    method: 'POST', body: { url }, headers: { 'x-install-id': installId, 'x-locale': 'fr' }, expectStatus: 200,
  });
  assert(fr.body?.locale === 'en', `x-locale: fr (unsupported) should fall back to en, got ${fr.body?.locale}`);

  // Malicious locale string — must not 500, must fall back.
  const xss = await http('/v1/check', {
    method: 'POST', body: { url }, headers: { 'x-install-id': installId, 'x-locale': '<script>alert(1)</script>' },
    expectStatus: 200,
  });
  assert(xss.body?.locale === 'en', `hostile x-locale should fall back to en, got ${xss.body?.locale}`);

  return 'en/es/Accept-Language/unsupported/hostile all route to the right locale';
}

async function checkCacheIsLocaleNeutral() {
  // The one check that catches "cache stored formatted output" — a real bug
  // that's easy to make in the handler.
  const hostname = `locale-probe-${Date.now()}.example`;
  const url = `https://${hostname}/x`;
  const installId = randomUUID();

  await redis.del(`verdict:${hostname}`);

  const enRes = await http('/v1/check', {
    method: 'POST', body: { url }, headers: { 'x-install-id': installId, 'x-locale': 'en' }, expectStatus: 200,
  });
  const esRes = await http('/v1/check', {
    method: 'POST', body: { url }, headers: { 'x-install-id': installId, 'x-locale': 'es' }, expectStatus: 200,
  });

  assert(enRes.body?.locale === 'en', `first request locale = ${enRes.body?.locale}`);
  assert(esRes.body?.locale === 'es', `second request (after cache) locale = ${esRes.body?.locale}`);
  assert(enRes.body?.title !== esRes.body?.title,
    `cache returned identical title across locales (${enRes.body?.title}) — cache is NOT locale-neutral`);
  assert(enRes.body?.titleKey === esRes.body?.titleKey,
    `titleKey differed across locales (should be same): ${enRes.body?.titleKey} vs ${esRes.body?.titleKey}`);

  await redis.del(`verdict:${hostname}`);
  return `cache serves same verdict key in both languages with different rendered strings`;
}

// ---------- WARNINGS ----------

async function checkPerfCold() {
  const installId = randomUUID();
  const hostname = `perf-cold-${Date.now()}.example`;
  await redis.del(`verdict:${hostname}`);
  const samples: number[] = [];
  for (let i = 0; i < 5; i++) {
    await redis.del(`verdict:${hostname}-${i}`);
    const r = await http('/v1/check', {
      method: 'POST',
      body: { url: `https://${hostname}-${i}/x` },
      headers: { 'x-install-id': installId },
      expectStatus: 200,
    });
    samples.push(r.ms);
  }
  const p95 = percentile(samples, 0.95);
  if (p95 > 300) throw new Error(`cold p95 ${p95}ms > 300ms (samples: ${samples.join(',')})`);
  return `cold p95 ${p95}ms over 5 samples`;
}

async function checkPerfWarm() {
  const installId = randomUUID();
  const url = 'https://zoom.us/j/perf-warm';
  // Prime the cache.
  await http('/v1/check', { method: 'POST', body: { url }, headers: { 'x-install-id': installId }, expectStatus: 200 });
  const samples: number[] = [];
  for (let i = 0; i < 10; i++) {
    const r = await http('/v1/check', {
      method: 'POST', body: { url }, headers: { 'x-install-id': installId }, expectStatus: 200,
    });
    samples.push(r.ms);
  }
  const p95 = percentile(samples, 0.95);
  if (p95 > 50) throw new Error(`warm p95 ${p95}ms > 50ms (samples: ${samples.join(',')})`);
  return `warm p95 ${p95}ms over 10 samples`;
}

async function checkCronPurge() {
  // Insert a synthetic row 31 days old, run the purge query, verify gone.
  const res = await db.query(
    `INSERT INTO check_log (hostname, verdict, ip_hash, install_id, checked_at)
     VALUES ($1, 'UNRECOGNIZED', 'audit', $2, NOW() - INTERVAL '31 days')
     RETURNING id`,
    [`purge-probe-${AUDIT_RUN_ID}.example`, AUDIT_RUN_ID],
  );
  const rowId = res.rows[0]?.id as string | undefined;
  assert(rowId != null, 'could not insert synthetic check_log row');

  const purge = await db.query(
    `DELETE FROM check_log WHERE checked_at < NOW() - INTERVAL '30 days' AND install_id = $1`,
    [AUDIT_RUN_ID],
  );
  assert((purge.rowCount ?? 0) >= 1, `cron purge query deleted ${purge.rowCount ?? 0} rows, expected ≥ 1`);
  return `cron purge query deleted ${purge.rowCount} row(s)`;
}

async function checkCors() {
  const preflight = await fetch(`${API_URL}/v1/check`, {
    method: 'OPTIONS',
    headers: {
      origin: 'chrome-extension://ajmlbjncbeekbdbmnamnpngibgifmgag',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type,x-install-id',
    },
  });
  if (preflight.status !== 204 && preflight.status !== 200) {
    throw new Error(`CORS preflight returned ${preflight.status}`);
  }
  const allow = preflight.headers.get('access-control-allow-origin');
  assert(allow != null, 'CORS preflight missing Access-Control-Allow-Origin');
  if (allow === '*') return 'preflight OK, but Allow-Origin is * — consider restricting';
  return `preflight OK, Allow-Origin=${allow}`;
}

// ---------- Cleanup ----------

async function cleanup() {
  try {
    await db.query('DELETE FROM reports     WHERE registrable_domain IN ($1,$2)', [SENTINEL_DOMAIN, SECOND_SENTINEL]);
    await db.query('DELETE FROM threat_feed WHERE registrable_domain IN ($1,$2,$3)',
      [SENTINEL_DOMAIN, SECOND_SENTINEL,
       // checkApiContract inserts SENTINEL_DOMAIN via the admin path as 'rejected' — drop that too.
       SENTINEL_DOMAIN]);
    await db.query(`DELETE FROM check_log WHERE install_id = $1`, [AUDIT_RUN_ID]);
    await db.query(`DELETE FROM check_log WHERE hostname LIKE 'audit-%' AND checked_at > NOW() - INTERVAL '1 hour'`);
  } catch (err) {
    console.error('[audit] cleanup failed (not fatal):', (err as Error).message);
  }
}

// ---------- Runner ----------

const CHECKS: Check[] = [
  { name: 'health endpoint',                  severity: 'blocker', fn: checkHealth },
  { name: 'database schema + seed data',      severity: 'blocker', fn: checkSchemaAndSeed },
  { name: `detector wiring (${AUDIT_CORPUS.length}/${AUDIT_CORPUS.length} corpus)`, severity: 'blocker', fn: checkDetectorWiring },
  { name: 'API contract',                     severity: 'blocker', fn: checkApiContract },
  { name: 'rate limiter enforces 120/min',    severity: 'blocker', fn: checkRateLimiter },
  { name: 'auto-promote at 3 distinct reporters', severity: 'blocker', fn: checkAutoPromote },
  { name: 'verdict cache round-trip',         severity: 'blocker', fn: checkVerdictCache },
  { name: 'i18n en/es/fallback',              severity: 'blocker', fn: checkI18n },
  { name: 'cache is locale-neutral',          severity: 'blocker', fn: checkCacheIsLocaleNeutral },
  { name: 'cold check p95 < 300ms',           severity: 'warning', fn: checkPerfCold },
  { name: 'warm check p95 < 50ms',            severity: 'warning', fn: checkPerfWarm },
  { name: 'cron purge dry-run',               severity: 'warning', fn: checkCronPurge },
  { name: 'CORS preflight',                   severity: 'warning', fn: checkCors },
];

async function main() {
  console.log('isthislinksafe pre-launch audit');
  console.log('================================');
  console.log(`Target: ${API_URL}`);
  console.log(`Time:   ${new Date().toISOString()}`);
  console.log('');

  const results: CheckResult[] = [];
  for (const c of CHECKS) {
    const start = Date.now();
    let status: Status = 'PASS';
    let note: string | undefined;
    try {
      const out = await c.fn();
      if (typeof out === 'string') note = out;
    } catch (err) {
      status = c.severity === 'blocker' ? 'FAIL' : 'WARN';
      note = (err as Error).message;
    }
    results.push({ name: c.name, severity: c.severity, status, ms: Date.now() - start, note });
  }

  await cleanup();
  try { await db.end(); } catch {}
  try { redis.disconnect(); } catch {}

  printReport(results);
}

function printReport(results: CheckResult[]) {
  const blockers = results.filter((r) => r.severity === 'blocker');
  const warnings = results.filter((r) => r.severity === 'warning');

  console.log('BLOCKERS');
  for (const r of blockers) printLine(r);
  console.log('');
  console.log('WARNINGS');
  for (const r of warnings) printLine(r);
  console.log('');

  const blockerFails = blockers.filter((r) => r.status === 'FAIL').length;
  const blockerPasses = blockers.filter((r) => r.status === 'PASS').length;
  const warnFails = warnings.filter((r) => r.status !== 'PASS').length;

  if (blockerFails === 0) {
    console.log(`Result: ${blockerPasses} blocker checks passed` +
      (warnFails ? `, ${warnFails} warning${warnFails === 1 ? '' : 's'}` : ''));
    console.log('EXIT 0');
    process.exit(0);
  } else {
    console.log(`Result: ${blockerFails} blocker${blockerFails === 1 ? '' : 's'} failed — DO NOT LAUNCH`);
    console.log('EXIT 1');
    process.exit(1);
  }
}

function printLine(r: CheckResult) {
  const tag = r.status === 'PASS' ? '[PASS]'
    : r.status === 'FAIL' ? '[FAIL]'
    : r.status === 'WARN' ? '[WARN]'
    : '[SKIP]';
  const name = r.name.padEnd(40);
  const ms = `${r.ms}ms`.padStart(7);
  const suffix = r.note ? `  ${r.note}` : '';
  console.log(`  ${tag}  ${name}  ${ms}${suffix}`);
}

function percentile(nums: number[], p: number): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1);
  return sorted[i];
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error('[audit] fatal:', err);
  cleanup().finally(() => process.exit(1));
});
