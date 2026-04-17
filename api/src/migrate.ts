/**
 * Simple forward-only migrator. Applies every .sql file in ./migrations/ in name order
 * that hasn't yet been recorded in schema_migrations.
 *
 * Run: npm run db:migrate
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, query } from './db.js';

const MIGRATIONS_DIR = join(fileURLToPath(new URL('../migrations', import.meta.url)));

async function main() {
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  // Ensure the migrations table exists by running the first file if nothing exists.
  // The first migration (0001_init.sql) creates schema_migrations itself.
  let applied = new Set<string>();
  try {
    const rows = await query<{ version: string }>('SELECT version FROM schema_migrations');
    applied = new Set(rows.map((r) => r.version));
  } catch {
    // Table doesn't exist yet — will be created by 0001.
  }

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] skip ${file} (already applied)`);
      continue;
    }
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`[migrate] applying ${file}`);
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  console.log('[migrate] done');
  await db.end();
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
