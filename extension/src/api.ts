import { check, format, type FormattedCheckResult } from '@isthislinksafe/detector';

export const API_BASE = 'https://api.isthislinksafe.com';

export type CheckResponse = FormattedCheckResult & {
  resolved_hostname: string;
  redirect_chain: string[];
  expansion_timed_out: boolean;
  scanned_at: string;
};

async function getInstallId(): Promise<string> {
  const stored = await chrome.storage.local.get('install_id');
  if (stored.install_id) return stored.install_id as string;
  const id = crypto.randomUUID();
  await chrome.storage.local.set({ install_id: id });
  return id;
}

/** Map Chrome's BCP-47 UI language (e.g. `es-419`) to a detector locale code. */
function uiLocale(): string {
  return (chrome.i18n.getUILanguage?.() ?? 'en').split('-')[0].toLowerCase();
}

const LOCAL_TTL_MS = 15 * 60 * 1000;

async function getCached(hostname: string): Promise<CheckResponse | null> {
  const key = `verdict:${hostname}`;
  const stored = await chrome.storage.local.get(key);
  const entry = stored[key] as { value: CheckResponse; expiresAt: number } | undefined;
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.value;
}

async function setCached(hostname: string, value: CheckResponse): Promise<void> {
  await chrome.storage.local.set({
    [`verdict:${hostname}`]: { value, expiresAt: Date.now() + LOCAL_TTL_MS },
  });
}

export async function checkUrlRemote(url: string): Promise<CheckResponse> {
  let hostname = '';
  try { hostname = new URL(url).hostname.toLowerCase(); } catch {}

  if (hostname) {
    const cached = await getCached(hostname);
    if (cached) return cached;
  }

  const installId = await getInstallId();
  const res = await fetch(`${API_BASE}/v1/check`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-install-id': installId,
      'x-locale': uiLocale(),
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`api ${res.status}`);
  const body: CheckResponse = await res.json();
  if (body.resolved_hostname) await setCached(body.resolved_hostname, body);
  return body;
}

/**
 * Offline fallback: run the detector locally and format with the UI locale.
 * Redirect expansion is unavailable offline.
 */
export function checkUrlLocal(url: string): CheckResponse {
  const r = check(url);
  const f = format(r, uiLocale());
  return {
    ...f,
    resolved_hostname: f.hostname,
    redirect_chain: [url],
    expansion_timed_out: false,
    scanned_at: new Date().toISOString(),
  };
}

export async function reportScam(url: string, context?: string): Promise<{ report_id: string; status: string }> {
  const installId = await getInstallId();
  const res = await fetch(`${API_BASE}/v1/report`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-install-id': installId,
      'x-locale': uiLocale(),
    },
    body: JSON.stringify({ url, context, received_from: 'extension' }),
  });
  if (!res.ok) throw new Error(`report ${res.status}`);
  return res.json();
}
