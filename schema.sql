-- Pippa D1 schema. Run once per database:
--   npm run db:init:local   (for wrangler dev)
--   npm run db:init:remote  (for production)

CREATE TABLE IF NOT EXISTS users (
  email       TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A participant's case: their office profile and the 4-step course challenge.
CREATE TABLE IF NOT EXISTS cases (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  title       TEXT NOT NULL,
  profile     TEXT NOT NULL,   -- JSON: office, programmes, who served, scale
  challenge   TEXT NOT NULL,   -- JSON: problem, mission, stakeholders, value
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cases_email ON cases(email);

-- Every analysis Pippa runs, saved with its structured output.
CREATE TABLE IF NOT EXISTS runs (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  case_id     TEXT,
  tool        TEXT NOT NULL,   -- 'funder' | 'resources'
  title       TEXT NOT NULL,
  need        TEXT NOT NULL,   -- JSON: the stated need + answers to questions
  output      TEXT NOT NULL,   -- JSON: structured result
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_runs_email ON runs(email, created_at);

-- Per-user daily counter for the AI spend cap.
CREATE TABLE IF NOT EXISTS usage (
  email  TEXT NOT NULL,
  day    TEXT NOT NULL,
  calls  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (email, day)
);
