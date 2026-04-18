import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`env ${name} is not set`);
  return v;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),

  DATABASE_URL: required('DATABASE_URL'),
  DATABASE_SSL: process.env.DATABASE_SSL, // 'disable' | undefined

  REDIS_URL: required('REDIS_URL'),

  IP_SALT: required('IP_SALT'),

  TURNSTILE_SECRET_KEY: optional('TURNSTILE_SECRET_KEY'),
  ADMIN_TOKEN: optional('ADMIN_TOKEN'),

  TELEGRAM_BOT_TOKEN: optional('TELEGRAM_BOT_TOKEN'),
  TELEGRAM_CHAT_ID: optional('TELEGRAM_CHAT_ID'),

  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGIN ?? 'https://meetingcheck.io')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};

export const isProd = env.NODE_ENV === 'production';
