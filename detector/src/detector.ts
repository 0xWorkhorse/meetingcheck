/**
 * meetingcheck — core detector
 * Strict mode: SAFE only if on official list, DANGEROUS on any impersonation signal.
 * MIT licensed — designed to be auditable.
 *
 * The detector returns only stable IDs and template parameters. Display strings
 * live in ./i18n — consumers pick a locale via `format(result, messages)`.
 */
import {
  OFFICIAL_DOMAINS,
  BRAND_TOKENS,
  TYPOSQUAT_PATTERNS,
  SUSPICIOUS_TLDS,
} from './domains.js';
import { getRegistrableDomain, normalizeHostname } from './domain-utils.js';
import { decodeAndSkeleton } from './homoglyph.js';

export type Verdict = 'SAFE' | 'DANGEROUS' | 'UNRECOGNIZED' | 'INVALID';
export type SignalLevel = 'ok' | 'warning' | 'critical' | 'info';

export type ParamMap = Record<string, string>;

export interface Signal {
  id: string;
  level: SignalLevel;
  /** Parameters for interpolation into locale templates. */
  params?: ParamMap;
  brand?: string;
}

export interface CheckResult {
  verdict: Verdict;
  confidence: number;
  /** Locale key for the headline, e.g. `title.dangerous.subdomain_trick`. */
  titleKey: string;
  /** Locale key for the body paragraph. */
  reasonKey: string;
  /** Params for `reasonKey` (and `titleKey` if it takes any). */
  reasonParams?: ParamMap;
  hostname: string;
  registrableDomain: string;
  signals: Signal[];
}

export interface CheckOptions {
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

/**
 * True if the hostname is using visual look-alikes (punycode/Cyrillic/Greek/full-width)
 * that, once folded to ASCII, hit any of our brand signals. This catches attacks like
 * `xn--zom-ted.us` (Cyrillic `о` → skeleton `zoom.us`, an exact allowlist match) and
 * `gοοgle-meet.xyz` (Greek ο → skeleton contains the `googlemeet` brand token).
 *
 * We only run this if the hostname *actually used* confusable chars — that's what
 * makes the finding a homoglyph attack rather than a plain ASCII impersonation
 * (already covered by the separate impersonation check).
 */
function detectHomoglyphAttack(hostname: string): { brand: string; skeleton: string } | null {
  const { skeleton, used } = decodeAndSkeleton(hostname);
  if (!used) return null;

  // 1) Skeleton matches (or contains) an official root → brand collision.
  for (const [brand, domains] of Object.entries(OFFICIAL_DOMAINS)) {
    for (const domain of domains) {
      if (skeleton === domain || skeleton.endsWith('.' + domain)) {
        return { brand, skeleton };
      }
      if (skeleton.includes(domain + '.') && !skeleton.endsWith('.' + domain)) {
        return { brand, skeleton };
      }
    }
  }

  // 2) Skeleton contains a brand token (after hyphen/dot stripping).
  const normalized = normalizeHostname(skeleton);
  for (const [brand, tokens] of Object.entries(BRAND_TOKENS)) {
    for (const token of tokens) {
      if (normalized.includes(token)) return { brand, skeleton };
    }
  }

  // 3) Skeleton matches a known typosquat pattern.
  for (const { brand, regex } of TYPOSQUAT_PATTERNS) {
    if (regex.test(skeleton)) return { brand, skeleton };
  }

  return null;
}

export function check(rawUrl: string, opts: CheckOptions = {}): CheckResult {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return {
      verdict: 'INVALID',
      confidence: 1,
      titleKey: 'title.invalid.unparseable',
      reasonKey: 'reason.invalid.unparseable',
      hostname: '',
      registrableDomain: '',
      signals: [],
    };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return {
      verdict: 'INVALID',
      confidence: 1,
      titleKey: 'title.invalid.protocol',
      reasonKey: 'reason.invalid.protocol',
      reasonParams: { protocol: url.protocol },
      hostname: '',
      registrableDomain: '',
      signals: [],
    };
  }

  const hostname = url.hostname.toLowerCase();
  const registrableDomain = getRegistrableDomain(hostname);
  const signals: Signal[] = [
    { id: 'hostname', level: 'info', params: { host: hostname } },
  ];

  // --- Dangerous signal: community-reported ---
  const reported = opts.reportedDomains;
  if (reported && reported.has(registrableDomain)) {
    signals.push({
      id: 'community_reports',
      level: 'critical',
      params: { domain: registrableDomain },
    });
    return {
      verdict: 'DANGEROUS',
      confidence: 0.99,
      titleKey: 'title.dangerous.community',
      reasonKey: 'reason.dangerous.community',
      reasonParams: { domain: registrableDomain },
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
      brand: subdomainTrick.brand,
      params: { brand: subdomainTrick.brand, fakeDomain: subdomainTrick.fakeDomain },
    });
    return {
      verdict: 'DANGEROUS',
      confidence: 0.99,
      titleKey: 'title.dangerous.subdomain_trick',
      reasonKey: 'reason.dangerous.subdomain_trick',
      reasonParams: { brand: subdomainTrick.brand, fakeDomain: subdomainTrick.fakeDomain },
      hostname,
      registrableDomain,
      signals,
    };
  }

  // --- Dangerous signal: homoglyph / punycode spoof ---
  // Runs before the official-match check so that a visually-spoofed allowlist
  // member (xn--zm-qia.us "looks like" zoom.us) is flagged as DANGEROUS instead
  // of accidentally matching as SAFE via some later heuristic.
  const homoglyph = detectHomoglyphAttack(hostname);
  if (homoglyph) {
    signals.push({
      id: 'homoglyph',
      level: 'critical',
      brand: homoglyph.brand,
      params: { brand: homoglyph.brand, skeleton: homoglyph.skeleton },
    });
    if (detectPunycode(hostname)) {
      signals.push({ id: 'punycode', level: 'warning' });
    }
    return {
      verdict: 'DANGEROUS',
      confidence: 0.99,
      titleKey: 'title.dangerous.homoglyph',
      reasonKey: 'reason.dangerous.homoglyph',
      reasonParams: { brand: homoglyph.brand, skeleton: homoglyph.skeleton },
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
      brand: officialBrand,
      params: { brand: officialBrand },
    });
    if (url.protocol !== 'https:') {
      signals.push({ id: 'no_https', level: 'warning' });
    }
    return {
      verdict: 'SAFE',
      confidence: 0.99,
      titleKey: 'title.safe',
      reasonKey: 'reason.safe',
      reasonParams: { brand: officialBrand },
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

  const punycodeWithBrand = punycode && (impersonation.length > 0 || typosquat);

  if (impersonation.length > 0 || typosquat || punycodeWithBrand) {
    for (const imp of impersonation) {
      signals.push({
        id: 'brand_impersonation',
        level: 'critical',
        brand: imp.brand,
        params: { token: imp.token, brand: imp.brand },
      });
    }
    if (typosquat) {
      signals.push({
        id: 'typosquat',
        level: 'critical',
        brand: typosquat,
        params: { brand: typosquat },
      });
    }
    if (suspiciousTld) {
      signals.push({ id: 'suspicious_tld', level: 'warning', params: { tld: suspiciousTld } });
    }
    if (punycode) {
      signals.push({ id: 'punycode', level: 'warning' });
    }
    return {
      verdict: 'DANGEROUS',
      confidence: suspiciousTld || punycode ? 0.98 : 0.95,
      titleKey: 'title.dangerous.impersonation',
      reasonKey: 'reason.dangerous.impersonation',
      hostname,
      registrableDomain,
      signals,
    };
  }

  // --- Unrecognized ---
  if (suspiciousTld) {
    signals.push({ id: 'suspicious_tld', level: 'warning', params: { tld: suspiciousTld } });
  }
  if (punycode) {
    signals.push({ id: 'punycode', level: 'warning' });
  }
  signals.push({ id: 'not_official', level: 'warning' });

  return {
    verdict: 'UNRECOGNIZED',
    confidence: 0.8,
    titleKey: 'title.unrecognized',
    reasonKey: 'reason.unrecognized',
    hostname,
    registrableDomain,
    signals,
  };
}
