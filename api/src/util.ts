/**
 * Hash an IP address so we can rate-limit and dedupe without storing PII.
 * SHA-256 with a per-deployment salt. Salt rotation invalidates existing rate-limit
 * buckets, which is fine.
 */
export async function hashIp(ip: string, salt: string): Promise<string> {
  const buf = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function clientIp(req: Request): string {
  return req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? '0.0.0.0';
}

export function newId(prefix: string): string {
  const rand = crypto.getRandomValues(new Uint8Array(12));
  const hex = [...rand].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
}

export function isUuidLike(s: string): boolean {
  return /^[0-9a-f-]{8,64}$/i.test(s);
}
