/**
 * Cloudflare Turnstile verification. Skipped if TURNSTILE_SECRET is not set
 * (useful for local development).
 */
export async function verifyTurnstile(
  token: string | undefined,
  remoteIp: string,
  secret: string | undefined,
): Promise<boolean> {
  if (!secret) return true; // dev mode
  if (!token) return false;

  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  body.append('remoteip', remoteIp);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const json: { success?: boolean } = await res.json();
    return Boolean(json.success);
  } catch {
    return false;
  }
}
