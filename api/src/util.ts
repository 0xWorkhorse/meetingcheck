import { createHash, randomBytes } from 'node:crypto';
import { env } from './env.js';

export function hashIp(ip: string): string {
  return createHash('sha256').update(`${env.IP_SALT}:${ip}`).digest('hex').slice(0, 32);
}

export function clientIp(req: { header(name: string): string | undefined }): string {
  return req.header('cf-connecting-ip')
    ?? req.header('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.header('x-real-ip')
    ?? '0.0.0.0';
}

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString('hex')}`;
}

export function isUuidLike(s: string): boolean {
  return /^[0-9a-f-]{8,64}$/i.test(s);
}
