/**
 * Official meeting-service domains. An exact match or subdomain match is SAFE.
 * Versioned in the repo; the API can push updates without requiring extension updates.
 */
export const OFFICIAL_DOMAINS: Record<string, readonly string[]> = {
  zoom:     ['zoom.us', 'zoom.com', 'zoomgov.com'],
  meet:     ['meet.google.com'],
  teams:    ['teams.microsoft.com', 'teams.live.com'],
  webex:    ['webex.com'],
  gotomeet: ['gotomeeting.com', 'goto.com'],
  calendly: ['calendly.com'],
  cal:      ['cal.com'],
  whereby:  ['whereby.com'],
  jitsi:    ['meet.jit.si'],
  around:   ['around.co'],
};

/**
 * Brand tokens that indicate impersonation when found in a non-official hostname.
 * Keep these short and distinctive — a token like "cal" would match too many legitimate
 * domains, so we use "calendly" only.
 */
export const BRAND_TOKENS: Record<string, readonly string[]> = {
  zoom:     ['zoom'],
  meet:     ['googlemeet', 'gmeet'],
  calendly: ['calendly'],
  webex:    ['webex'],
  teams:    ['msteams'],
};

/**
 * Typosquat patterns for the highest-value brands. Each pattern is intentionally narrow
 * to avoid false positives on real words.
 */
export const TYPOSQUAT_PATTERNS: ReadonlyArray<{ brand: string; regex: RegExp }> = [
  { brand: 'Zoom',     regex: /zo0m|z00m|zooom|zuum|z-oom|zoomm/i },
  { brand: 'Google',   regex: /g00gle|go0gle|googIe|goog1e/ },
  { brand: 'Calendly', regex: /ca1endly|calendIy|calendl1/i },
];

export const SUSPICIOUS_TLDS: readonly string[] = [
  '.click', '.link', '.top', '.xyz', '.live',
  '.icu', '.zip', '.mov', '.cam', '.country',
];
