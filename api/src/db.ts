import pg from 'pg';
import { env } from './env.js';

export const db = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  // Railway's internal network uses self-signed certs for Postgres.
  // Set DATABASE_SSL=disable to opt out (useful for local docker).
  ssl: env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false },
});

db.on('error', (err) => {
  console.error('[pg] pool error:', err.message);
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const r = await db.query<T>(sql, params);
  return r.rows;
}

export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
