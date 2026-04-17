/**
 * Cron: purge check_log rows older than 30 days.
 *
 * Runs as a separate Railway service in the same project (same repo, same
 * DATABASE_URL reference), with:
 *   Schedule:       0 4 * * *
 *   Start Command:  node dist/cron/purge-check-log.js
 */
import { db } from '../db.js';

async function main() {
  const result = await db.query(
    `DELETE FROM check_log WHERE checked_at < NOW() - INTERVAL '30 days'`,
  );
  console.log(`[cron] purged ${result.rowCount ?? 0} check_log rows`);
  await db.end();
}

main().catch((err) => {
  console.error('[cron] purge failed:', err);
  process.exit(1);
});
