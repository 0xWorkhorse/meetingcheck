-- External feeds (URLhaus, OpenPhish) share the threat_feed table with
-- community-sourced entries, distinguished by `source`. Default 'community'
-- is backfilled for every existing row.

ALTER TABLE threat_feed
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'community';

-- Speed up "who put this here?" queries from the admin path and from the
-- feed-ingestion dedup check.
CREATE INDEX IF NOT EXISTS idx_threat_feed_source ON threat_feed(source);
