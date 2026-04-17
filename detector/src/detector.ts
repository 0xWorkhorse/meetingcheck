/**
 * isthislinksafe — core detector
 * Strict mode: SAFE only if on official list, DANGEROUS on any impersonation signal.
 * MIT licensed — designed to be auditable.
 */
import {
  OFFICIAL_DOMAINS,
  BRAND_TOKENS,
  TYPOSQUAT_PATTERNS,
  SUSPICIOUS_TLDS,
} from './domains.js';
import { getRegistrableDomain, normalizeHostname } from './domain-utils.js';

export type Verdict = 'SAFE' | 'DANGEROUS' | 'UNRECOGNIZED' | 'INVALID';
export type SignalLevel = 'ok' | 'warning' | 'critical' | 'info';

export interface Signal {
  id: string;
  level: SignalLevel;
  label: string;
  detail: string;
  brand?: string;
}

export interface CheckResult {
  verdict: Verdict;
  confidence: number;
  title: string;
  reason: string;
  hostname: string;
  registrableDomain: string;
  signals: Signal[];
}

export interface CheckOptions {
  /**
   * Registrable domains confirmed via the community threat feed.
   * Pass an empty array when unavailable (e.g. offline/extension first-run).
   */
  reportedDomains?: ReadonlySet<string>;
}

function isOfficial(hostname: string): string | null {
  const lower = hostname.toLowerCase();
  for (const [brand, domains] of Object.entries(OFFICIAL_DOMAINS)) {
    for (const domain of domains) {
      if (lower === domain || lower.endsWith('.' + domain)) {
        return brand;
      }
    }
  }
  return null;
}

function detectSubdomainTrick(hostname: string): { brand: string; fakeDomain: string } | null {
  const lower = hostname.toLowerCase();
  for (const [brand, domains] of Object.entries(OFFICIAL_DOMAINS)) {
    for (const domain of domains) {
      // Brand domain appears in hostname but it's not the registrable domain.
      // e.g. "zoom.us.meeting-join.co" contains "zoom.us." but doesn't end with ".zoom.us".
      if (lower.includes(domain + '.') && !lower.endsWith('.' + domain) && lower !== domain) {
        return { brand, fakeDomain: getRegistrableDomain(lower) };
      }
    }
  }
  return null;
}

function detectBrandImpersonation(hostname: string): Array<{ brand: string; token: string }> {
  const normalized = normalizeHostname(hostname);
  const hits: Array<{ brand: string; token: string }> = [];
  for (const [brand, tokens] of Object.entries(BRAND_TOKENS)) {
    for (const token of tokens) {
      if (normalized.includes(token)) {
        hits.push({ brand, token });
        break;
      }
    }
  }
  return hits;
}

function detectTyposquat(hostname: string): string | null {
  for (const { brand, regex } of TYPOSQUAT_PATTERNS) {
    if (regex.test(hostname)) return brand;
  }
  return null;
}

function detectSuspiciousTld(hostname: string): string | null {
  const lower = hostname.toLowerCase();
  for (const tld of SUSPICIOUS_TLDS) {
    if (lower.endsWith(tld)) return tld;
  }
  return null;
}

function detectPunycode(hostname: string): boolean {
  return hostname.toLowerCase().includes('xn--');
}

export function check(rawUrl: string, opts: CheckOptions = {}): CheckResult {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return {
      verdict: 'INVALID',
      confidence: 1,
      title: 'Not a valid URL',
      reason: 'Could not parse this as a URL. Paste the full link starting with https://',
      hostname: '',
      registrableDomain: '',
      signals: [],
    };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return {
      verdict: 'INVALID',
      confidence: 1,
      title: 'Unsupported protocol',
      reason: `Protocol ${url.protocol} is not supported. Paste a http(s) link.`,
      hostname: '',
      registrableDomain: '',
      signals: [],
    };
  }

  const hostname = url.hostname.toLowerCase();
  const registrableDomain = getRegistrableDomain(hostname);
  const signals: Signal[] = [
    { id: 'hostname', level: 'info', label: 'Domain', detail: hostname },
  ];

  // --- Dangerous signal: community-reported ---
  const reported = opts.reportedDomains;
  if (reported && reported.has(registrableDomain)) {
    signals.push({
      id: 'community_reports',
      level: 'critical',
      label: 'Community reported',
      detail: `${registrableDomain} is on the confirmed threat feed`,
    });
    return {
      verdict: 'DANGEROUS',
      confidence: 0.99,
      title: 'Confirmed scam',
      reason: `${registrableDomain} has been reported by the community as a scam. Do not open this link.`,
      hostname,
      registrableDomain,
      signals,
    };
  }

  // --- Dangerous signal: subdomain trick ---
  const subdomainTrick = detectSubdomainTrick(hostname);
  if (subdomainTrick) {
    signals.push({
      id: 'subdomain_trick',
      level: 'critical',
      label: 'Subdomain trick',
      detail: `pretends to be ${subdomainTrick.brand}; real domain is ${subdomainTrick.fakeDomain}`,
      brand: subdomainTrick.brand,
    });
    return {
      verdict: 'DANGEROUS',
      confidence: 0.99,
      title: 'Almost certainly a scam',
      reason: `The real domain here is ${subdomainTrick.fakeDomain}, not ${subdomainTrick.brand}. This is a classic subdomain spoofing pattern. Do not open this link.`,
      hostname,
      registrableDomain,
      signals,
    };
  }

  // --- Safe signal: official domain ---
  const officialBrand = isOfficial(hostname);
  if (officialBrand) {
    signals.push({
      id: 'official',
      level: 'ok',
      label: 'Verified',
      detail: `official ${officialBrand} domain`,
      brand: officialBrand,
    });
    if (url.protocol !== 'https:') {
      signals.push({ id: 'no_https', level: 'warning', label: 'Protocol', detail: 'not using HTTPS' });
    }
    return {
      verdict: 'SAFE',
      confidence: 0.99,
      title: 'Looks legitimate',
      reason: `This is a real ${officialBrand} domain. Always verify the sender through a trusted channel before joining the call.`,
      hostname,
      registrableDomain,
      signals,
    };
  }

  // --- Dangerous signal: brand impersonation / typosquat / punycode + brand ---
  const impersonation = detectBrandImpersonation(hostname);
  const typosquat = detectTyposquat(hostname);
  const suspiciousTld = detectSuspiciousTld(hostname);
  const punycode = detectPunycode(hostname);

  // Punycode + brand context is always DANGEROUS.
  const punycodeWithBrand = punycode && (impersonation.length > 0 || typosquat);

  if (impersonation.length > 0 || typosquat || punycodeWithBrand) {
    for (const imp of impersonation) {
      signals.push({
        id: 'brand_impersonation',
        level: 'critical',
        label: 'Impersonation',
        detail: `contains "${imp.token}" but is not on the official ${imp.brand} domain list`,
        brand: imp.brand,
      });
    }
    if (typosquat) {
      signals.push({
        id: 'typosquat',
        level: 'critical',
        label: 'Typosquat',
        detail: `misspelled ${typosquat}`,
        brand: typosquat,
      });
    }
    if (suspiciousTld) {
      signals.push({ id: 'suspicious_tld', level: 'warning', label: 'Suspicious TLD', detail: suspiciousTld });
    }
    if (punycode) {
      signals.push({ id: 'punycode', level: 'warning', label: 'Punycode', detail: 'unicode characters in domain' });
    }
    return {
      verdict: 'DANGEROUS',
      confidence: suspiciousTld || punycode ? 0.98 : 0.95,
      title: 'Almost certainly a scam',
      reason: 'This domain is trying to look like a real meeting service but is not on the official list. This matches the exact pattern used in the Feb 2026 fake-Zoom campaigns. Do not open this link.',
      hostname,
      registrableDomain,
      signals,
    };
  }

  // --- Unrecognized: not official, no impersonation signal ---
  if (suspiciousTld) {
    signals.push({ id: 'suspicious_tld', level: 'warning', label: 'Suspicious TLD', detail: suspiciousTld });
  }
  if (punycode) {
    signals.push({ id: 'punycode', level: 'warning', label: 'Punycode', detail: 'unicode characters in domain' });
  }
  signals.push({ id: 'not_official', level: 'warning', label: 'Not recognized', detail: 'not on the official meeting service list' });

  return {
    verdict: 'UNRECOGNIZED',
    confidence: 0.8,
    title: 'Not a known meeting service',
    reason: 'This is not on our list of official meeting services (Zoom, Google Meet, Teams, Webex, Calendly, and others). If someone sent this as a meeting link, do not open it without verifying through a trusted channel first.',
    hostname,
    registrableDomain,
    signals,
  };
}
