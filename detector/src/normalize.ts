/**
 * Input normalization for the detector.
 *
 * Users paste URLs in many shapes that the WHATWG URL constructor rejects:
 *   - Bare hostnames                    → "zoom.us"
 *   - Hostname + path, no scheme         → "meet.google.com/tfn-wtyz-qny"
 *   - Surrounded by <angle brackets>     → email-style URL wrapping
 *   - Markdown link syntax               → "[Join](https://zoom.us/j/123)"
 *   - Full URL inside a text blob        → pasted calendar invite, Slack message
 *   - Quoted / parenthesized             → "\"zoom.us/j/123\""
 *   - Native app schemes                 → "zoommtg://zoom.us/join?confno=123"
 *
 * This module accepts any of those and returns either a clean http(s) URL
 * the detector can parse, or a stable error code the caller can map to a
 * localized INVALID verdict.
 */
import { OFFICIAL_DOMAINS } from './domains.js';

export type NormalizeOk = { url: string; extractedFrom?: string };
export type NormalizeErr = { error: NormalizeErrorCode };
export type NormalizeResult = NormalizeOk | NormalizeErr;

/**
 * Error codes (stable, dot-separated). The detector maps each to a specific
 * i18n reasonKey for an INVALID verdict.
 *   - `empty`                → input was blank/whitespace
 *   - `no_url`               → text blob with no URL-like substring
 *   - `scheme.zoommtg`       → zoommtg:// native app link
 *   - `scheme.msteams`       → msteams: native app link
 *   - `scheme.tel`           → tel: phone link
 *   - `scheme.mailto`        → mailto: email link
 *   - `scheme.other:<name>`  → any other non-http scheme (ftp, file, data, …)
 */
export type NormalizeErrorCode =
  | 'empty'
  | 'no_url'
  | 'scheme.zoommtg'
  | 'scheme.msteams'
  | 'scheme.tel'
  | 'scheme.mailto'
  | `scheme.other:${string}`;

/**
 * Official-domain registrables, flattened. Used to prioritize one URL over
 * another when the input has multiple candidates.
 */
const OFFICIAL_SET: ReadonlySet<string> = new Set(
  Object.values(OFFICIAL_DOMAINS).flat() as string[],
);

// Characters that end a URL in prose: whitespace, ASCII brackets/quotes, and
// the common non-ASCII punctuation that browsers auto-substitute for ASCII
// quotes/brackets (smart quotes, guillemets, CJK corner brackets). Keeping
// this centralized so the full-URL and hostname-path regexes agree.
const URL_TERMINATORS =
  '\\s<>"\'`()\\[\\]{}' +
  '«»' +        // « »   French guillemets
  '‘’‚' +  // ' ' ‚   curly / low single quotes
  '“”„' +  // " " „   curly / low double quotes
  '「」『』'; // 「 」 『 』   CJK corner brackets
const RE_FULL_URL      = new RegExp('\\bhttps?://[^' + URL_TERMINATORS + ']+', 'gi');
const RE_HOSTNAME_PATH = new RegExp(
  '\\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}(?:/[^' + URL_TERMINATORS + ']*)?',
  'gi',
);
// Strict hostname-only (used for the "bare hostname → https://" path).
const RE_HOSTNAME_ONLY = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

// Trailing-punctuation strippers. Runs AFTER the regex as belt-and-suspenders:
// the regex shouldn't produce these, but if an upstream change relaxes it,
// this still keeps the output clean.
const RE_TRAIL_PUNCT = /[.,;:!?)>\]'"‘’‚“”„»」』`]+$/;

export function normalizeInput(raw: string): NormalizeResult {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return { error: 'empty' };

  // Peel markdown link syntax first — `[text](url)`. We take the URL half.
  const mdMatch = /^\s*\[[^\]]*\]\(\s*([^)]+?)\s*\)\s*$/.exec(trimmed);
  const afterMd = mdMatch ? mdMatch[1] : trimmed;

  // Peel surrounding wrappers: <>, (), "", '', backticks.
  const peeled = stripWrappers(afterMd);

  // Single-token input (no whitespace) gets a direct parse attempt first.
  // Most real-world inputs land here; keeping this path fast avoids regex
  // work on the common case.
  if (!/\s/.test(peeled)) {
    const direct = tryDirect(peeled);
    if (direct) return withExtractedFrom(direct, raw, peeled);
  }

  // Multi-line / text-blob input — extract URL candidates and pick the best.
  const best = pickBest(peeled);
  if (best) return withExtractedFrom(best, raw, peeled);

  return { error: 'no_url' };
}

/**
 * Strip a *single layer* of matching wrappers. We don't recurse: `<<url>>`
 * would be unusual and stripping one layer plus the URL regex handles the
 * realistic cases.
 */
function stripWrappers(s: string): string {
  const trimmed = s.trim();
  const pairs: Array<[string, string]> = [
    ['<', '>'],
    ['(', ')'],
    ['"', '"'],
    ["'", "'"],
    ['`', '`'],
    ['“', '”'],    // " "   curly double
    ['‘', '’'],    // ' '   curly single
    ['„', '“'],    // „ "   German/CEE opening-low → closing-high
    ['«', '»'],    // « »   French guillemets
    ['「', '」'],    // 「 」   CJK corner brackets
    ['『', '』'],    // 『 』   CJK white corner brackets
  ];
  for (const [open, close] of pairs) {
    if (trimmed.startsWith(open) && trimmed.endsWith(close) && trimmed.length >= 2) {
      return trimmed.slice(1, -1).trim();
    }
  }
  // Also strip trailing punctuation that often survives (sentence enders).
  return trimmed.replace(/[.,;:!?]+$/, '');
}

/**
 * Try to turn a single whitespace-free token into a usable URL, or detect a
 * rejectable scheme.
 *
 * Returns:
 *   - { url }                 → ready for the detector
 *   - { error }               → known-rejectable scheme
 *   - null                    → not recognizable; caller will fall through
 *                               to blob extraction
 */
function tryDirect(token: string): NormalizeResult | null {
  if (!token) return null;

  const schemeMatch = /^([a-z][a-z0-9+.\-]*):/i.exec(token);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme === 'http' || scheme === 'https') {
      try {
        const parsed = new URL(token);
        return { url: parsed.toString() };
      } catch {
        return null;
      }
    }
    return { error: mapScheme(scheme) };
  }

  // No scheme — could be bare hostname or hostname+path.
  if (looksLikeHostnameOrPath(token)) {
    return { url: 'https://' + token };
  }
  return null;
}

/**
 * Extract every URL-looking candidate from the text blob and return the
 * highest-priority one.
 *
 * Priority (highest first):
 *   1. Full http(s) URL on an OFFICIAL_DOMAINS host      — SAFE-eligible
 *   2. Bare hostname+path on an OFFICIAL_DOMAINS host    — SAFE-eligible
 *   3. Any full http(s) URL
 *   4. Any bare hostname+path (has a slash)
 *   5. Any bare hostname
 */
function pickBest(blob: string): NormalizeOk | null {
  interface Candidate { url: string; tier: number }
  const seen = new Set<string>();
  const candidates: Candidate[] = [];

  // Tier 1+3: full http(s) URLs
  for (const m of blob.matchAll(RE_FULL_URL)) {
    const url = trimTrailingPunct(m[0]);
    if (seen.has(url)) continue;
    seen.add(url);
    const tier = isOfficialHost(hostOf(url)) ? 1 : 3;
    candidates.push({ url, tier });
  }

  // Tier 2+4+5: hostname[+path] without scheme. Don't re-extract substrings
  // we already matched as full URLs.
  for (const m of blob.matchAll(RE_HOSTNAME_PATH)) {
    const raw = trimTrailingPunct(m[0]);
    // Skip fragments that were already part of a full URL match.
    if ([...seen].some((u) => u.includes(raw))) continue;
    const withScheme = 'https://' + raw;
    if (seen.has(withScheme)) continue;
    seen.add(withScheme);
    const host = hostOf(withScheme);
    const hasPath = raw.includes('/');
    let tier: number;
    if (isOfficialHost(host)) tier = 2;
    else if (hasPath) tier = 4;
    else tier = 5;
    candidates.push({ url: withScheme, tier });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.tier - b.tier);
  return { url: candidates[0].url };
}

function trimTrailingPunct(s: string): string {
  return s.replace(RE_TRAIL_PUNCT, '');
}

function hostOf(url: string): string {
  try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}

function isOfficialHost(host: string): boolean {
  if (!host) return false;
  if (OFFICIAL_SET.has(host)) return true;
  for (const official of OFFICIAL_SET) {
    if (host.endsWith('.' + official)) return true;
  }
  return false;
}

function looksLikeHostnameOrPath(s: string): boolean {
  const [hostPart] = s.split('/');
  return RE_HOSTNAME_ONLY.test(hostPart);
}

function mapScheme(scheme: string): NormalizeErrorCode {
  switch (scheme) {
    case 'zoommtg': return 'scheme.zoommtg';
    case 'msteams': return 'scheme.msteams';
    case 'tel':     return 'scheme.tel';
    case 'mailto':  return 'scheme.mailto';
    default:        return `scheme.other:${scheme}`;
  }
}

/**
 * Attach `extractedFrom` only when we materially changed the input. Pure
 * trim/wrapper-strip round-trips don't count — we only signal extraction
 * when the user would see a different URL than what they pasted.
 */
function withExtractedFrom(
  result: NormalizeResult,
  rawInput: string,
  peeled: string,
): NormalizeResult {
  if ('error' in result) return result;
  const out = result.url;
  // If the raw input (trimmed) equals the output, no extraction happened.
  const rawTrimmed = rawInput.trim();
  if (rawTrimmed === out) return { url: out };
  // If the only change was stripping wrappers / adding https:// to a bare
  // hostname, we STILL want to show it when that differs from the raw paste —
  // the user benefits from seeing "Checked: https://zoom.us/j/123" even if
  // they pasted "zoom.us/j/123". That's the whole point of the note.
  return { url: out, extractedFrom: rawTrimmed };
}
