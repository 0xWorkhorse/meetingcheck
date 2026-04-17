# meetingcheck

> A strict link verifier for the one question you ask when a meeting invite shows up: is this actually Zoom / Meet / Calendly, or am I about to get drained?

Built for web3 professionals after the Feb 2026 fake-Zoom wave. Three-second strict binary verdict on meeting-service impersonation, plus a community threat feed contributed by the crypto community.

## Packages

| Package | License | Description |
|---|---|---|
| [`detector/`](./detector) | MIT | Core detection engine. Strict rules, auditable, framework-free. |
| [`extension/`](./extension) | MIT | Manifest V3 browser extension (Chrome + Firefox). |
| [`web/`](./web) | MIT | Website at meetingcheck.io. React + Vite + Tailwind. |
| [`api/`](./api) | private | Hono on Cloudflare Workers. D1 + KV. |

## Verdict states

- `SAFE` — hostname matches an entry in the official meeting-service domain list.
- `DANGEROUS` — at least one dangerous signal fires (subdomain trick, brand impersonation, typosquat, punycode + brand, community-reported).
- `UNRECOGNIZED` — not on the official list, no clear impersonation signal. Displayed as "do not trust as a meeting link."
- `INVALID` — malformed URL.

The design choice is strict: no `LIKELY SAFE`. Either the hostname is on the official list or it isn't. This trades false positives (real but obscure meeting services) for zero false negatives on the attack surface that matters.

## Develop

```bash
npm install
npm test                    # run the detector test corpus
npm run dev:web             # website
npm run dev:api             # API worker
npm run dev:extension       # extension watcher
```

## Contributing

New attack patterns are extremely welcome. Add a test case to `detector/tests/corpus.ts`, make sure it fails against the current rules, then update `detector/src/detector.ts` to catch it.
