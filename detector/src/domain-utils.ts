import { getDomain } from 'tldts';

/**
 * Registrable-domain extractor, backed by the Public Suffix List via `tldts`.
 * Returns the eTLD+1 for a hostname — `foo.bar.co.uk` → `bar.co.uk`,
 * `zoom.us` → `zoom.us`, `us06web.zoom.us` → `zoom.us`.
 *
 * Falls back to the lowercased hostname if the PSL can't extract a registrable
 * (malformed input, IP address, etc.).
 */
export function getRegistrableDomain(hostname: string): string {
  const lower = hostname.toLowerCase();
  return getDomain(lower) ?? lower;
}

/**
 * Normalize a hostname by stripping separators and punycode markers so that
 * `us-web-zoom-us.com` reveals the `uswebzoomus` string for token matching.
 */
export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/[-_.]/g, '');
}
