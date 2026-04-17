-- meetingcheck Postgres schema
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS reports (
  id                  TEXT PRIMARY KEY,
  url                 TEXT NOT NULL,
  hostname            TEXT NOT NULL,
  registrable_domain  TEXT NOT NULL,
  context             TEXT,
  received_from       TEXT CHECK (received_from IN ('telegram','email','dm','calendar','discord','extension','other')),
  install_id          TEXT,
  ip_hash             TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','rejected','duplicate')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at         TIMESTAMPTZ,
  reviewer_note       TEXT
);
CREATE INDEX IF NOT EXISTS idx_reports_domain_status ON reports(registrable_domain, status);
CREATE INDEX IF NOT EXISTS idx_reports_created       ON reports(created_at DESC);

CREATE TABLE IF NOT EXISTS threat_feed (
  registrable_domain  TEXT PRIMARY KEY,
  first_seen          TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen           TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_count        INTEGER NOT NULL DEFAULT 0,
  brand_impersonated  TEXT,
  status              TEXT NOT NULL CHECK (status IN ('confirmed','suspected','rejected')),
  notes               TEXT
);
CREATE INDEX IF NOT EXISTS idx_threat_status ON threat_feed(status, last_seen DESC);

CREATE TABLE IF NOT EXISTS check_log (
  id          BIGSERIAL PRIMARY KEY,
  hostname    TEXT NOT NULL,
  verdict     TEXT NOT NULL,
  ip_hash     TEXT,
  install_id  TEXT,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_check_log_time ON check_log(checked_at DESC);

-- Track which migrations have run. Simple and explicit; lighter than drizzle-kit for
-- the handful of migrations we'll have.
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     TEXT PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
