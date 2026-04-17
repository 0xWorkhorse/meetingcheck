# @isthislinksafe/api

Hono on Cloudflare Workers. D1 for persistence, KV for verdict caching and rate limits.

## First-time setup

```bash
# Create the D1 database and KV namespace, then paste their IDs into wrangler.toml:
wrangler d1 create isthislinksafe
wrangler kv:namespace create CACHE

# Apply the schema (local + prod):
npm run db:migrate:local
npm run db:migrate:prod

# Secrets (prompted):
wrangler secret put TURNSTILE_SECRET
wrangler secret put ADMIN_TOKEN
```

## Routes

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/check` | Strict verdict for a URL. Rate: 30/min (120/min with install_id). |
| `POST` | `/v1/report` | Community report. Rate: 10/hour per install_id. Turnstile required in prod. |
| `GET` | `/v1/stats` | Public homepage stats. 60s cache. |
| `GET` | `/v1/threat-feed` | Confirmed scam domains. |
| `GET` | `/v1/official-domains` | Pushable OFFICIAL_DOMAINS for extension updates without store review. |
| `POST` | `/admin/review` | Confirm/reject a reported domain. Bearer `ADMIN_TOKEN`. |

## Rate-limit headers

Rate limiting is implemented with KV fixed windows. Currently the response body exposes the `resetAt` timestamp on 429 — add `X-RateLimit-*` headers if needed when the extension or third-party clients start using this.

## Privacy

- IPs are hashed with SHA-256 + per-environment salt before being written.
- Install IDs are client-generated UUIDs, never tied to identity.
- `check_log` rows are purged after 30 days (add a scheduled worker to do this).
