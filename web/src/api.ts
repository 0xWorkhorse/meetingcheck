import type { FormattedCheckResult } from '@meetingcheck/detector';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://api.meetingcheck.io';

export interface CheckResponse extends FormattedCheckResult {
  resolved_hostname: string;
  redirect_chain: string[];
  expansion_timed_out: boolean;
  scanned_at: string;
  community_report_count: number;
  community_status: 'suspected' | 'confirmed' | null;
  /** Days since the earliest CT-logged cert for this domain, null if unavailable. */
  cert_age_days: number | null;
  /** Whether the CT lookup completed (even if it returned no data). */
  cert_checked: boolean;
  /** True if the hostname used any non-ASCII / confusable characters (Cyrillic, Greek, full-width, etc.). */
  homoglyph_non_ascii: boolean;
  /** True if the hostname includes xn-- (punycode IDN). */
  homoglyph_punycode: boolean;
  /** The Unicode-decoded form of the hostname; equals hostname when no confusables were used. */
  homoglyph_decoded: string | null;
  /** ISO 3166-1 alpha-2 country code for the resolved IP's hosting location. */
  hosting_country: string | null;
  /** First resolved IPv4 address for the hostname. */
  hosting_ip: string | null;
  /** Whether DNS + GeoIP lookup both completed. */
  hosting_checked: boolean;
  /** Days since the registrar-recorded creation date (WHOIS). */
  whois_age_days: number | null;
  /** Whether the WHOIS lookup completed (even if it returned no creation date). */
  whois_checked: boolean;
}

function installId(): string {
  let id = localStorage.getItem('itls_install_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('itls_install_id', id);
  }
  return id;
}

function headers(locale?: string): HeadersInit {
  const h: Record<string, string> = {
    'content-type': 'application/json',
    'x-install-id': installId(),
  };
  if (locale) h['x-locale'] = locale;
  return h;
}

export async function checkUrl(url: string, locale?: string): Promise<CheckResponse> {
  const res = await fetch(`${API_BASE}/v1/check`, {
    method: 'POST',
    headers: headers(locale),
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`check failed: ${res.status}`);
  return res.json();
}

export async function reportUrl(params: {
  url: string;
  context?: string;
  received_from?: string;
  turnstile_token?: string;
}, locale?: string): Promise<{ report_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/v1/report`, {
    method: 'POST',
    headers: headers(locale),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`report failed: ${res.status}`);
  return res.json();
}

export interface Stats {
  links_checked_24h: number;
  scams_flagged_24h: number;
  links_checked_total: number;
  scams_flagged_total: number;
  community_reports_total: number;
  confirmed_scam_domains: number;
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/v1/stats`);
  if (!res.ok) throw new Error(`stats failed: ${res.status}`);
  return res.json();
}
