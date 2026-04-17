# @isthislinksafe/api

Hono on Node. Postgres for persistence, Redis for verdict cache + rate limits. Deploys to Railway.

> Migrated from Cloudflare Workers (D1 + KV) in v0.2.0. Route shapes and response JSON are unchanged from the caller's perspective.

## Stack

| Concern       | Implementation |
|---|---|
| Runtime       | Node.js 20+, long-running via `@hono/node-server` |
| Framework     | Hono (same framework, portable handler code) |
| Database      | Postgres 16, `pg` with a small connection pool |
| Cache         | Redis (`ioredis`), 15-minute verdict TTL |
| Rate limiter  | Redis `INCR` + `EXPIRE NX`, fixed window |
| Cron          | Separate Railway service, shared repo and DB |
| Config        | `railway.json` + `Dockerfile`, monorepo-aware |

## Local dev

```bash
cp .env.example .env
# Start Postgres and Redis (Docker or local install)
docker run -d --name pg    -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
docker run -d --name redis -p 6379:6379 redis:7

# From repo root:
npm install
npm --workspace @isthislinksafe/detector run build
npm --workspace @isthislinksafe/api run db:migrate
npm --workspace @isthislinksafe/api run dev
```

The API listens on `http://localhost:3000`.

## Routes

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/health` | Liveness probe. Returns 503 if DB or Redis are unhealthy. Configured as Railway's healthcheck. |
| `POST` | `/v1/check` | Strict verdict. Rate: 30/min (anon) · 120/min (install_id). Locale via `x-locale` or `Accept-Language`. |
| `POST` | `/v1/report` | Community report. Rate: 10/hour. Turnstile required in prod. |
| `GET`  | `/v1/stats` | Homepage stats. 60s Redis cache. |
| `GET`  | `/v1/threat-feed` | Confirmed scam domains. |
| `GET`  | `/v1/official-domains` | Pushable OFFICIAL_DOMAINS without extension updates. |
| `GET`  | `/v1/locales` | Locales supported by the detector formatter. |
| `POST` | `/admin/review` | Confirm/reject a reported domain. Bearer `ADMIN_TOKEN`. |

Rate-limit responses expose `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.

## Deploy to Railway (first time)

1. **Create the project and wire databases.**
   - Railway dashboard → New Project → deploy from GitHub.
   - Service Root Directory: repo root. Railway picks up `api/railway.json`.
   - + New → Database → Postgres.
   - + New → Database → Redis.

2. **Set env vars.** In the API service's Variables tab:
   ```
   DATABASE_URL          ${{ Postgres.DATABASE_URL }}
   REDIS_URL             ${{ Redis.REDIS_URL }}
   IP_SALT               <openssl rand -hex 32>
   ADMIN_TOKEN           <openssl rand -hex 32>
   TURNSTILE_SECRET_KEY  <from Cloudflare Turnstile dashboard>
   ALLOWED_ORIGIN        https://isthislinksafe.com
   NODE_ENV              production
   ```

3. **Migrate.** One-off against the deployed DB:
   ```
   railway run -s api -- npm run db:migrate
   ```
   Or run locally with Railway's env: `railway link`, then `railway run npm run db:migrate`.

4. **Add the cron service.**
   - + New → empty service from the same repo.
   - Root Directory: repo root.
   - Build: reuse the same Dockerfile (`api/Dockerfile`).
   - Start command: `node dist/cron/purge-check-log.js`
   - Schedule: `0 4 * * *` (daily 04:00 UTC).
   - Reference the same `DATABASE_URL`.

5. **Custom domain.** Service → Settings → Networking → Custom Domain → `api.isthislinksafe.com`.

## Post-deploy smoke test

```bash
BASE=https://api.isthislinksafe.com

# Safe
curl -s -X POST $BASE/v1/check -H 'content-type: application/json' \
  -d '{"url":"https://zoom.us/j/123"}' | jq

# Dangerous
curl -s -X POST $BASE/v1/check -H 'content-type: application/json' \
  -d '{"url":"https://uswebzoomus.com/j/123"}' | jq

# Health
curl -s $BASE/health | jq
```

First check is uncached (~100ms); second hit to the same hostname is <10ms from Redis.

## Privacy

- IPs are `IP_SALT`-salted SHA-256 hashed before write. Salt rotation invalidates rate-limit buckets (fine).
- Install IDs are client-generated UUIDs, never tied to identity.
- `check_log` rows are purged daily after 30 days by the cron service.

## Migration notes (from Workers)

- D1 SQLite → Postgres. `?` placeholders → `$1, $2, …`. `INTEGER` timestamps → `TIMESTAMPTZ`.
- KV → Redis. `kv.get/put` → `redis.get/setex`. Rate limits now use `INCR`/`EXPIRE NX` instead of fixed-window counters in KV.
- `c.executionCtx.waitUntil()` → fire-and-forget promise (the Node server stays alive; nothing to keep hot).
- `crypto.subtle` (Workers) → `node:crypto.createHash` (simpler and sync, matches runtime idiom).
- `wrangler.toml` removed. Replaced by `railway.json` + `Dockerfile` + env vars.
