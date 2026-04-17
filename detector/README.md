# @isthislinksafe/detector

Strict meeting-link verification engine. MIT licensed so anyone can audit the rules.

## Install

```bash
npm install @isthislinksafe/detector
```

## Usage

```ts
import { check } from '@isthislinksafe/detector';

check('https://uswebzoomus.com/j/123');
// {
//   verdict: 'DANGEROUS',
//   confidence: 0.95,
//   title: 'Almost certainly a scam',
//   reason: '...',
//   hostname: 'uswebzoomus.com',
//   registrableDomain: 'uswebzoomus.com',
//   signals: [ { id: 'brand_impersonation', level: 'critical', ... } ]
// }
```

With a community threat feed:

```ts
const reported = new Set<string>(['some-scam.xyz', 'another.click']);
check('https://some-scam.xyz/join', { reportedDomains: reported });
// verdict: 'DANGEROUS', signal: community_reports
```

## Verdicts

| Verdict | Meaning |
|---|---|
| `SAFE` | Hostname matches an entry in the official meeting-service list. |
| `DANGEROUS` | At least one critical signal fires: subdomain trick, brand impersonation, typosquat, community report, or punycode + brand context. |
| `UNRECOGNIZED` | Not official, no clear impersonation signal. UI copy tells users not to trust as a meeting link. |
| `INVALID` | URL could not be parsed, or uses an unsupported protocol. |

## Signals

- `subdomain_trick` — brand domain appears in hostname but isn't the registrable domain.
- `brand_impersonation` — normalized hostname contains a brand token, but hostname isn't on the official list.
- `typosquat` — known misspelling pattern (zo0m, z00m, ca1endly, etc.).
- `community_reports` — registrable domain is in the confirmed threat feed.
- `suspicious_tld` — hostname ends in a high-abuse TLD.
- `punycode` — hostname contains `xn--`.

## Design decisions

**Strict mode, not `LIKELY SAFE`.** Either it's on the official list or it isn't. Trades false positives on obscure meeting services for zero false negatives on the attack surface that matters.

**Narrow brand tokens.** We match `googlemeet`/`gmeet`, not bare `meet`. Otherwise every internal company meeting-room domain gets flagged and the tool becomes noise.

**Allow-list wins.** The community threat feed is never allowed to flag an official domain. Promotion logic in the API enforces this at report-time.

## Tests

```bash
npm test
```

The corpus in `tests/corpus.ts` is the source of truth for expected behavior. New attack patterns should land here first with an expected verdict, then be made to pass.
