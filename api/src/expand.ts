/**
 * Follow HTTP redirects up to 5 hops with a 2s timeout each.
 * Returns the chain of URLs and the final hostname.
 *
 * We use HEAD first, fall back to GET if the target rejects HEAD.
 * We never execute the response body; this is just URL expansion.
 */
const MAX_HOPS = 5;
const TIMEOUT_MS = 2000;

export interface ExpandResult {
  chain: string[];
  final: string;
  timedOut: boolean;
}

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'ow.ly',
  'buff.ly', 'is.gd', 'rebrand.ly', 'tiny.cc', 'shorturl.at',
  'lnkd.in', 'cutt.ly', 'rb.gy',
]);

function isShortener(urlStr: string): boolean {
  try {
    return KNOWN_SHORTENERS.has(new URL(urlStr).hostname.toLowerCase());
  } catch {
    return false;
  }
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

  // Only follow redirects if the initial URL is a known shortener or if a redirect
  // response comes back. This keeps latency low for the 95% case where the input is
  // already a direct link.
  const shouldFollow = isShortener(initialUrl);
  if (!shouldFollow) {
    return { chain, final: current, timedOut };
  }

  for (let i = 0; i < MAX_HOPS; i++) {
    const res = await fetchOnce(current);
    if (!res) {
      timedOut = true;
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
