-- isthislinksafe D1 schema

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  hostname TEXT NOT NULL,
  registrable_domain TEXT NOT NULL,
  context TEXT,
  received_from TEXT,
  install_id TEXT,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER,
  reviewer_note TEXT
);
CREATE INDEX IF NOT EXISTS idx_reports_domain ON reports(registrable_domain, status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);

CREATE TABLE IF NOT EXISTS threat_feed (
  registrable_domain TEXT PRIMARY KEY,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  report_count INTEGER NOT NULL DEFAULT 0,
  brand_impersonated TEXT,
  status TEXT NOT NULL,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_threat_status ON threat_feed(status, last_seen);

CREATE TABLE IF NOT EXISTS check_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostname TEXT NOT NULL,
  verdict TEXT NOT NULL,
  ip_hash TEXT,
  install_id TEXT,
  checked_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_check_log_time ON check_log(checked_at);
