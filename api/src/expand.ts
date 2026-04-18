/**
 * Follow HTTP redirects up to 5 hops with a 2s timeout each.
 * Returns the chain of URLs and the final hostname.
 *
 * We use HEAD first, fall back to GET if the target rejects HEAD.
 * We never execute the response body; this is just URL expansion.
 *
 * We try expansion on every non-official host (scammers use obscure redirectors
 * and own-domain redirects, not just bit.ly). Official hosts skip the lookup so
 * SAFE verdicts stay fast — nobody's redirecting zoom.us to a drainer.
 */
import { OFFICIAL_DOMAINS } from '@meetingcheck/detector';

const MAX_HOPS = 5;
const TIMEOUT_MS = 2000;

export interface ExpandResult {
  chain: string[];
  final: string;
  timedOut: boolean;
}

const OFFICIAL_SET: ReadonlySet<string> = new Set(
  Object.values(OFFICIAL_DOMAINS).flat() as string[],
);

function isOfficialHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (OFFICIAL_SET.has(lower)) return true;
  for (const official of OFFICIAL_SET) {
    if (lower.endsWith('.' + official)) return true;
  }
  return false;
}

async function fetchOnce(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
    });
    if (res.status === 405 || res.status === 501) {
      // HEAD not allowed — retry with GET but don't read the body
      const getController = new AbortController();
      const getTimer = setTimeout(() => getController.abort(), TIMEOUT_MS);
      try {
        return await fetch(url, {
          method: 'GET',
          redirect: 'manual',
          signal: getController.signal,
        });
      } finally {
        clearTimeout(getTimer);
      }
    }
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function expand(initialUrl: string): Promise<ExpandResult> {
  const chain: string[] = [initialUrl];
  let current = initialUrl;
  let timedOut = false;

  // Skip expansion for well-known official hosts — we trust them not to redirect
  // to anything dangerous, and we want their SAFE verdict to be instant.
  let initialHost = '';
  try { initialHost = new URL(initialUrl).hostname.toLowerCase(); } catch { return { chain, final: current, timedOut }; }
  if (isOfficialHost(initialHost)) {
    return { chain, final: current, timedOut };
  }

  for (let i = 0; i < MAX_HOPS; i++) {
    const res = await fetchOnce(current);
    if (!res) {
      // On the first hop a null result means the host is unreachable or timed out.
      // Don't mark every non-redirecting check as timedOut — only actual network failures.
      if (i === 0) timedOut = true;
      break;
    }
    const location = res.headers.get('location');
    if (!location || res.status < 300 || res.status >= 400) break;

    let next: string;
    try {
      next = new URL(location, current).toString();
    } catch {
      break;
    }
    if (chain.includes(next)) break; // loop guard
    chain.push(next);
    current = next;
  }

  return { chain, final: current, timedOut };
}
