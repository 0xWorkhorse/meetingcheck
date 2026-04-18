import type { CheckResponse } from '../../api.js';
import type { UiMessages } from '../../i18n/types.js';
import { format } from '../../i18n/format.js';
import type { ReactNode } from 'react';

export type SignalState = 'ok' | 'bad' | 'warn' | 'pending';
export type SignalRow = { label: string; state: SignalState; value: ReactNode };

/** Build the four signal rows shown under the URL input. */
export function deriveSignals(res: CheckResponse, t: UiMessages): SignalRow[] {
  const urlFmt: SignalRow =
    res.verdict === 'INVALID'
      ? { label: t.checker.signals.urlFormat, state: 'bad', value: t.checker.values.malformed }
      : { label: t.checker.signals.urlFormat, state: 'ok',  value: t.checker.values.valid };

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

  // Cert transparency: placeholder until we wire real CT log lookups.
  const cert: SignalRow = {
    label: t.checker.signals.certTransparency,
    state: 'warn',
    value: t.checker.values.notChecked,
  };

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

  return [urlFmt, official, cert, community];
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
