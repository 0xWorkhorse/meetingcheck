import type { CheckResponse } from '../../api.js';
import type { UiMessages } from '../../i18n/types.js';
import { format } from '../../i18n/format.js';
import type { ReactNode } from 'react';

export type SignalState = 'ok' | 'bad' | 'warn' | 'pending';
export type SignalRow = { label: string; state: SignalState; value: ReactNode };

/** Build the signal rows shown under the URL input, in reveal order. */
export function deriveSignals(res: CheckResponse, t: UiMessages): SignalRow[] {
  const urlFmt: SignalRow =
    res.verdict === 'INVALID'
      ? { label: t.checker.signals.urlFormat, state: 'bad', value: t.checker.values.malformed }
      : { label: t.checker.signals.urlFormat, state: 'ok',  value: t.checker.values.valid };

  // Redirects: does this URL actually go where it says it does?
  //   expansion_timed_out → FAILED (warn)
  //   chain.length === 1  → DIRECT (ok)
  //   chain.length  >  1  → N HOPS (warn) — legit services do use shorteners,
  //                         but hidden redirects are often a phishing tell
  let redirects: SignalRow;
  if (res.expansion_timed_out) {
    redirects = { label: t.checker.signals.redirects, state: 'warn', value: t.checker.values.redirectsFailed };
  } else if (res.redirect_chain.length <= 1) {
    redirects = { label: t.checker.signals.redirects, state: 'ok',   value: t.checker.values.redirectsDirect };
  } else {
    redirects = {
      label: t.checker.signals.redirects,
      state: 'warn',
      value: format(t.checker.values.redirectsHops, { n: res.redirect_chain.length - 1 }),
    };
  }

  // Character check: pure ASCII is trivially fine. Non-ASCII + brand collision
  // (the detector flagged homoglyph) is the dangerous case. Non-ASCII without
  // a brand collision is just Unicode — flag warn and show the decoded form.
  const homoglyphHit = res.signals.find((s) => s.id === 'homoglyph');
  let character: SignalRow;
  if (!res.homoglyph_non_ascii) {
    character = { label: t.checker.signals.characterCheck, state: 'ok', value: t.checker.values.charAsciiClean };
  } else if (homoglyphHit) {
    character = {
      label: t.checker.signals.characterCheck,
      state: 'bad',
      value: format(t.checker.values.charSpoof, { decoded: res.homoglyph_decoded ?? '' }),
    };
  } else if (res.homoglyph_punycode) {
    character = {
      label: t.checker.signals.characterCheck,
      state: 'warn',
      value: format(t.checker.values.charPunycode, { decoded: res.homoglyph_decoded ?? '' }),
    };
  } else {
    character = {
      label: t.checker.signals.characterCheck,
      state: 'warn',
      value: t.checker.values.charNonAscii,
    };
  }

  let official: SignalRow;
  if (res.verdict === 'SAFE') {
    const brandSig = res.signals.find((s) => s.id === 'official_domain');
    const brand = brandSig?.brand ?? '';
    official = {
      label: t.checker.signals.officialDomain,
      state: 'ok',
      value: brand ? brand.toUpperCase() : t.checker.values.allowlisted,
    };
  } else if (res.verdict === 'DANGEROUS') {
    const look = res.signals.find((s) => s.id === 'subdomain_trick' || s.id === 'typosquat' || s.id === 'homoglyph');
    official = {
      label: t.checker.signals.officialDomain,
      state: 'bad',
      value: look ? t.checker.values.lookalike : t.checker.values.notAllowlisted,
    };
  } else if (res.verdict === 'UNRECOGNIZED') {
    official = { label: t.checker.signals.officialDomain, state: 'warn', value: t.checker.values.unknown };
  } else {
    official = { label: t.checker.signals.officialDomain, state: 'bad', value: 'N/A' };
  }

  // Cert transparency: real crt.sh lookup. Three display bands:
  //   days == null && !checked → UNAVAILABLE (warn) — lookup timed out or failed
  //   days == null &&  checked → NEW DOMAIN   (bad)  — no CT entries at all is suspicious
  //   days < 14                → FRESH {n}D   (bad)  — brand-new domains are the scam pattern
  //   days < 60                → VALID {n}D   (warn) — probably fine, still young
  //   days >= 60               → VALID > 60D  (ok)
  let cert: SignalRow;
  if (res.cert_age_days == null) {
    cert = res.cert_checked
      ? { label: t.checker.signals.certTransparency, state: 'bad',  value: t.checker.values.certNewDomain }
      : { label: t.checker.signals.certTransparency, state: 'warn', value: t.checker.values.certUnavailable };
  } else if (res.cert_age_days < 14) {
    cert = {
      label: t.checker.signals.certTransparency,
      state: 'bad',
      value: format(t.checker.values.certFresh, { n: res.cert_age_days }),
    };
  } else if (res.cert_age_days < 60) {
    cert = {
      label: t.checker.signals.certTransparency,
      state: 'warn',
      value: format(t.checker.values.certValidDays, { n: res.cert_age_days }),
    };
  } else {
    cert = {
      label: t.checker.signals.certTransparency,
      state: 'ok',
      value: t.checker.values.certValidOld,
    };
  }

  // Hosting: where does the server actually live? We show the country code
  // neutrally (color by whether we *got* the answer, not by which country).
  //   country known → SHOW CC (ok — factual info)
  //   lookup failed → UNAVAILABLE (warn)
  //   DNS worked but GeoIP didn't know the IP → UNKNOWN (warn)
  let hosting: SignalRow;
  if (res.hosting_country) {
    hosting = {
      label: t.checker.signals.hosting,
      state: 'ok',
      value: format(t.checker.values.hostingKnown, { cc: res.hosting_country }),
    };
  } else if (res.hosting_checked) {
    hosting = { label: t.checker.signals.hosting, state: 'warn', value: t.checker.values.hostingUnknown };
  } else {
    hosting = { label: t.checker.signals.hosting, state: 'warn', value: t.checker.values.hostingUnavailable };
  }

  // WHOIS domain age: registrar-recorded creation. Same band structure as CT.
  //   days == null && !checked → UNAVAILABLE (warn) — timed out / privacy-proxied
  //   days == null &&  checked → PRIVATE       (warn) — privacy redaction
  //   days <  30               → FRESH {n}D    (bad)
  //   days <  365              → {n}D          (warn)
  //   days >= 365              → > 1Y          (ok)
  let whoisAge: SignalRow;
  if (res.whois_age_days == null) {
    whoisAge = res.whois_checked
      ? { label: t.checker.signals.domainAge, state: 'warn', value: t.checker.values.whoisPrivate }
      : { label: t.checker.signals.domainAge, state: 'warn', value: t.checker.values.whoisUnavailable };
  } else if (res.whois_age_days < 30) {
    whoisAge = {
      label: t.checker.signals.domainAge,
      state: 'bad',
      value: format(t.checker.values.whoisFresh, { n: res.whois_age_days }),
    };
  } else if (res.whois_age_days < 365) {
    whoisAge = {
      label: t.checker.signals.domainAge,
      state: 'warn',
      value: format(t.checker.values.whoisYoung, { n: res.whois_age_days }),
    };
  } else {
    whoisAge = { label: t.checker.signals.domainAge, state: 'ok', value: t.checker.values.whoisMature };
  }

  let community: SignalRow;
  if (res.community_status === 'confirmed' || res.community_report_count > 0) {
    community = {
      label: t.checker.signals.communityFeed,
      state: 'bad',
      value: format(t.checker.values.flagged, { n: res.community_report_count }),
    };
  } else if (res.verdict === 'SAFE') {
    community = { label: t.checker.signals.communityFeed, state: 'ok',   value: t.checker.values.clean };
  } else if (res.verdict === 'UNRECOGNIZED') {
    community = { label: t.checker.signals.communityFeed, state: 'ok',   value: t.checker.values.noReports };
  } else {
    community = { label: t.checker.signals.communityFeed, state: 'warn', value: t.checker.values.noReports };
  }

  return [urlFmt, redirects, character, official, hosting, whoisAge, cert, community];
}

export interface VerdictMeta {
  cls: string;
  color: string;
  label: string;
  icon: string;
}

export function verdictMeta(v: CheckResponse['verdict'], t: UiMessages): VerdictMeta {
  switch (v) {
    case 'SAFE':
      return { cls: 'verdict-bg-safe',    color: 'text-safe',   label: t.verdictWords.safe,         icon: '✓' };
    case 'DANGEROUS':
      return { cls: 'verdict-bg-danger',  color: 'text-danger', label: t.verdictWords.dangerous,    icon: '◆' };
    case 'UNRECOGNIZED':
      return { cls: 'verdict-bg-unrecog', color: 'text-warn',   label: t.verdictWords.unrecognized, icon: '?' };
    default:
      return { cls: '',                   color: 'text-ink',    label: t.verdictWords.invalid,      icon: '—' };
  }
}

export function adviceFor(v: CheckResponse['verdict'], t: UiMessages): string {
  switch (v) {
    case 'SAFE':         return t.checker.advice.safe;
    case 'DANGEROUS':    return t.checker.advice.dangerous;
    case 'UNRECOGNIZED': return t.checker.advice.unrecognized;
    default:             return t.checker.advice.invalid;
  }
}

export function makeSessionId(): string {
  const hex = Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
  return '0x' + hex;
}
