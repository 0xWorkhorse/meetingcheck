/**
 * Registrable-domain extractor. Intentionally simple; handles the 99% case for .com/.us/.co.uk.
 * For full PSL coverage, swap this for the `tldts` package once it matters.
 */
const TWO_PART_TLDS = new Set([
  'co.uk', 'com.au', 'co.jp', 'co.kr', 'com.br',
  'co.nz', 'co.za', 'com.sg', 'com.mx', 'co.in',
]);

export function getRegistrableDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split('.');
  if (parts.length <= 2) return hostname.toLowerCase();
  const lastTwo = parts.slice(-2).join('.');
  if (TWO_PART_TLDS.has(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

/**
 * Normalize a hostname by stripping separators and punycode markers so that
 * `us-web-zoom-us.com` reveals the `uswebzoomus` string for token matching.
 */
export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/[-_.]/g, '');
}
