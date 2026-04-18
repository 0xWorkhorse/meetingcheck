/**
 * Admin-only endpoints: stats JSON + a tiny self-contained HTML dashboard.
 *
 * The JSON endpoint is gated by the existing Bearer token (env.ADMIN_TOKEN).
 * The HTML page is public (it's just static markup with inline CSS/JS); it
 * prompts for the token in a password field and stores it in sessionStorage
 * so it's wiped when the tab closes. The page fetches from the same origin,
 * so no CORS headers are needed here.
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
  // JSON — the machine-readable version.
  app.get('/v1/admin/stats', requireAdmin, statsHandler);

  // HTML — the human-readable version. No auth on the page itself; it prompts
  // for the token client-side and authenticates the fetch.
  app.get('/admin/stats', (c) =>
    c.html(DASHBOARD_HTML, 200, {
      'cache-control': 'no-store',
      'content-security-policy':
        // Only our own scripts run; they're inline so 'unsafe-inline' is
        // required. Everything else blocked to keep the admin page small
        // surface area.
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    }),
  );
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

/**
 * Self-contained admin dashboard. Everything inline so it serves instantly
 * with no second round-trip and no external CDN dependency.
 */
const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="color-scheme" content="dark" />
  <title>Meetingcheck · Admin stats</title>
  <style>
    :root {
      --bg:       #14110a;
      --bg-2:     #1f1b13;
      --ink:      #f0e8d4;
      --ink-2:    #d8cfba;
      --muted:    #8a8270;
      --rule:     rgba(240, 232, 212, 0.14);
      --danger:   #ef4a34;
      --safe:     #4fa66a;
      --warn:     #d6a130;
      --unknown:  #8a8270;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--ink);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      padding: 24px;
    }
    .wrap { max-width: 1100px; margin: 0 auto; }
    header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--rule);
      margin-bottom: 24px;
    }
    h1 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
    }
    h2 {
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      margin: 28px 0 10px;
      font-weight: 600;
    }
    .meta { color: var(--muted); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
    .meta b { color: var(--ink); font-weight: 500; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .card {
      background: var(--bg-2);
      border: 1px solid var(--rule);
      padding: 14px 16px;
    }
    .card .label { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); }
    .card .n {
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-size: 32px;
      font-weight: 700;
      margin-top: 6px;
      letter-spacing: -0.02em;
    }
    .card .sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .verdict-bar { display: grid; grid-template-columns: 1fr; gap: 6px; }
    .verdict-row { display: grid; grid-template-columns: 110px 1fr auto; align-items: center; gap: 10px; font-size: 12px; }
    .verdict-row .lab { letter-spacing: 0.12em; text-transform: uppercase; font-size: 10px; }
    .verdict-row .bar { height: 8px; background: var(--rule); position: relative; overflow: hidden; }
    .verdict-row .bar > span { display: block; height: 100%; }
    .verdict-row .n { font-weight: 700; min-width: 48px; text-align: right; }
    .v-safe .lab, .v-safe .n { color: var(--safe); }
    .v-safe .bar > span { background: var(--safe); }
    .v-dangerous .lab, .v-dangerous .n { color: var(--danger); }
    .v-dangerous .bar > span { background: var(--danger); }
    .v-unrecognized .lab, .v-unrecognized .n { color: var(--warn); }
    .v-unrecognized .bar > span { background: var(--warn); }
    .v-invalid .lab, .v-invalid .n { color: var(--unknown); }
    .v-invalid .bar > span { background: var(--unknown); }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px dotted var(--rule); }
    th { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
    td.n { text-align: right; font-weight: 700; color: var(--danger); }
    td.host, td.domain { font-family: ui-monospace, monospace; word-break: break-all; color: var(--ink); }
    td.brand, td.when { color: var(--muted); font-size: 11px; }
    .empty { color: var(--muted); font-style: italic; padding: 18px; text-align: center; border: 1px dotted var(--rule); }
    .error { color: var(--danger); border: 1px solid var(--danger); padding: 12px 14px; margin-bottom: 16px; }
    .login {
      max-width: 380px;
      margin: 80px auto;
      padding: 24px;
      border: 1px solid var(--rule);
      background: var(--bg-2);
    }
    .login h1 { margin-bottom: 6px; }
    .login p { color: var(--muted); font-size: 12px; margin: 0 0 16px; }
    .login input {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--rule);
      color: var(--ink);
      padding: 10px 12px;
      font-family: inherit;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .login input:focus { outline: none; border-color: var(--ink); }
    .login button {
      width: 100%;
      background: var(--ink);
      color: var(--bg);
      border: 0;
      padding: 10px 12px;
      font-family: inherit;
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
      cursor: pointer;
    }
    .login button:hover { background: var(--ink-2); }
    .logout {
      background: transparent; border: 1px solid var(--rule); color: var(--muted);
      font-family: inherit; font-size: 10px; letter-spacing: 0.12em;
      text-transform: uppercase; padding: 4px 10px; cursor: pointer;
    }
    .logout:hover { color: var(--ink); border-color: var(--ink); }
    @media (max-width: 640px) {
      body { padding: 16px; }
      h2 { margin-top: 22px; }
      .card .n { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="wrap" id="root"></div>
  <script>
  (function () {
    'use strict';
    var TOKEN_KEY = 'mc-admin-token';
    var REFRESH_MS = 60000;
    var root = document.getElementById('root');
    var refreshTimer = null;
    var lastFetchAt = null;
    var tickTimer = null;

    function getToken() { try { return sessionStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
    function setToken(t) { try { sessionStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
    function clearToken() { try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) {} }

    function esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }
    function when(iso) {
      if (!iso) return '—';
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '—';
      var now = Date.now();
      var diff = Math.floor((now - d.getTime()) / 1000);
      if (diff < 60) return diff + 's ago';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return Math.floor(diff / 86400) + 'd ago';
    }

    function renderLogin(errorMsg) {
      root.innerHTML =
        '<div class="login">' +
          '<h1>Meetingcheck Admin</h1>' +
          '<p>Paste the admin bearer token to view launch-day stats.</p>' +
          (errorMsg ? '<div class="error">' + esc(errorMsg) + '</div>' : '') +
          '<form id="loginform">' +
            '<input type="password" id="tokeninput" autocomplete="off" spellcheck="false" placeholder="Admin token" autofocus />' +
            '<button type="submit">Unlock</button>' +
          '</form>' +
        '</div>';
      document.getElementById('loginform').addEventListener('submit', function (e) {
        e.preventDefault();
        var v = document.getElementById('tokeninput').value.trim();
        if (!v) return;
        setToken(v);
        lastFetchAt = null;
        start();
      });
    }

    function verdictBar(label, value, total, cls) {
      var pct = total > 0 ? Math.max(2, Math.round((value / total) * 100)) : 0;
      return '' +
        '<div class="verdict-row ' + cls + '">' +
          '<span class="lab">' + esc(label) + '</span>' +
          '<span class="bar"><span style="width:' + pct + '%"></span></span>' +
          '<span class="n">' + fmt(value) + '</span>' +
        '</div>';
    }

    function renderDashboard(data) {
      var v = data.verdicts_24h || {};
      var total24 = (v.SAFE || 0) + (v.DANGEROUS || 0) + (v.UNRECOGNIZED || 0) + (v.INVALID || 0);
      var tdRows = (data.top_dangerous_domains_7d || []).map(function (d) {
        return '<tr><td class="host">' + esc(d.hostname) + '</td><td class="n">' + fmt(d.hits) + '</td></tr>';
      }).join('');
      var confirmedRows = ((data.threat_feed && data.threat_feed.most_recent_confirmed) || []).map(function (d) {
        return '<tr>' +
          '<td class="domain">' + esc(d.domain) + '</td>' +
          '<td class="brand">' + esc(d.brand || '—') + '</td>' +
          '<td class="when">' + when(d.first_seen) + '</td>' +
        '</tr>';
      }).join('');
      root.innerHTML =
        '<header>' +
          '<h1>Meetingcheck · Admin</h1>' +
          '<div class="meta">' +
            'Updated <b id="updated">just now</b>' +
            ' · <button class="logout" id="logout" title="Forget token">Lock</button>' +
          '</div>' +
        '</header>' +

        '<h2>Checks</h2>' +
        '<div class="grid">' +
          card('24h',     fmt(data.checks.last_24h)) +
          card('7d',      fmt(data.checks.last_7d)) +
          card('30d',     fmt(data.checks.last_30d)) +
          card('All time', fmt(data.checks.all_time)) +
        '</div>' +

        '<h2>Unique installs</h2>' +
        '<div class="grid">' +
          card('24h', fmt(data.unique_install_ids.last_24h)) +
          card('7d',  fmt(data.unique_install_ids.last_7d)) +
          card('30d', fmt(data.unique_install_ids.last_30d)) +
        '</div>' +

        '<h2>Verdicts · last 24h</h2>' +
        (total24 > 0
          ? '<div class="verdict-bar">' +
              verdictBar('Safe',         v.SAFE         || 0, total24, 'v-safe') +
              verdictBar('Dangerous',    v.DANGEROUS    || 0, total24, 'v-dangerous') +
              verdictBar('Unrecognized', v.UNRECOGNIZED || 0, total24, 'v-unrecognized') +
              verdictBar('Invalid',      v.INVALID      || 0, total24, 'v-invalid') +
            '</div>'
          : '<div class="empty">No checks in the last 24h.</div>') +

        '<h2>Reports</h2>' +
        '<div class="grid">' +
          card('24h',             fmt(data.reports.last_24h)) +
          card('7d',              fmt(data.reports.last_7d)) +
          card('Pending review',  fmt(data.reports.pending_review)) +
          card('Confirmed total', fmt(data.reports.confirmed_total)) +
        '</div>' +

        '<h2>Top dangerous domains · 7d</h2>' +
        (tdRows
          ? '<table><thead><tr><th>Hostname</th><th style="text-align:right">Hits</th></tr></thead><tbody>' + tdRows + '</tbody></table>'
          : '<div class="empty">No DANGEROUS checks in the last 7 days.</div>') +

        '<h2>Threat feed</h2>' +
        '<div class="grid" style="margin-bottom:12px">' +
          card('Confirmed total',   fmt(data.threat_feed.confirmed_total)) +
          card('Suspected pending', fmt(data.threat_feed.suspected_pending)) +
        '</div>' +
        (confirmedRows
          ? '<table><thead><tr><th>Domain</th><th>Brand</th><th>First seen</th></tr></thead><tbody>' + confirmedRows + '</tbody></table>'
          : '<div class="empty">No confirmed entries yet.</div>');

      document.getElementById('logout').addEventListener('click', function () {
        if (refreshTimer) clearInterval(refreshTimer);
        if (tickTimer) clearInterval(tickTimer);
        clearToken();
        renderLogin(null);
      });
    }

    function card(label, value) {
      return '<div class="card"><div class="label">' + esc(label) + '</div><div class="n">' + value + '</div></div>';
    }

    function updateTick() {
      var el = document.getElementById('updated');
      if (!el || !lastFetchAt) return;
      var diff = Math.floor((Date.now() - lastFetchAt) / 1000);
      if (diff < 5) el.textContent = 'just now';
      else if (diff < 60) el.textContent = diff + 's ago';
      else el.textContent = Math.floor(diff / 60) + 'm ago';
    }

    async function fetchStats() {
      var token = getToken();
      if (!token) { renderLogin(null); return; }
      try {
        var res = await fetch('/v1/admin/stats', {
          headers: { 'authorization': 'Bearer ' + token, 'accept': 'application/json' },
          cache: 'no-store',
        });
        if (res.status === 401) {
          clearToken();
          if (refreshTimer) clearInterval(refreshTimer);
          if (tickTimer) clearInterval(tickTimer);
          renderLogin('Token rejected. Try again.');
          return;
        }
        if (!res.ok) {
          renderLogin('Request failed (' + res.status + ').');
          return;
        }
        var data = await res.json();
        lastFetchAt = Date.now();
        renderDashboard(data);
      } catch (err) {
        renderLogin('Network error: ' + (err && err.message ? err.message : 'unknown'));
      }
    }

    function start() {
      fetchStats();
      if (refreshTimer) clearInterval(refreshTimer);
      if (tickTimer) clearInterval(tickTimer);
      refreshTimer = setInterval(fetchStats, REFRESH_MS);
      tickTimer = setInterval(updateTick, 1000);
    }

    if (getToken()) start();
    else renderLogin(null);
  })();
  </script>
</body>
</html>`;
