-- Tiny Tallies Database Schema
-- Apply with: wrangler d1 execute tiny-tallies-db --file=./src/db/schema.sql

-- Users (linked to Google/Apple identity)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  email TEXT,
  display_name TEXT,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  UNIQUE(provider, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);

-- Privacy consent records
CREATE TABLE IF NOT EXISTS consent_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  acknowledged_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_records(user_id);

-- Child profiles (synced from device)
CREATE TABLE IF NOT EXISTS child_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  child_grade INTEGER NOT NULL,
  avatar_id TEXT,
  frame_id TEXT,
  theme_id TEXT,
  elo_rating REAL NOT NULL DEFAULT 1000,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  age_range TEXT,
  state_code TEXT,
  benchmark_opt_in INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_user ON child_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_benchmark ON child_profiles(benchmark_opt_in, age_range, state_code);

-- Score deltas (append-only log for incremental sync)
CREATE TABLE IF NOT EXISTS score_deltas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  elo_delta REAL NOT NULL DEFAULT 0,
  xp_delta INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  timestamp INTEGER NOT NULL,
  device_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_score_deltas_child ON score_deltas(child_id);
CREATE INDEX IF NOT EXISTS idx_score_deltas_dedup ON score_deltas(child_id, device_id, timestamp);

-- Badges (additive, idempotent by child_id + badge_id)
CREATE TABLE IF NOT EXISTS badges (
  child_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at INTEGER NOT NULL,
  PRIMARY KEY (child_id, badge_id)
);

-- Benchmark aggregates (precomputed percentiles by cohort)
-- Recomputed on sync push for opted-in children
CREATE TABLE IF NOT EXISTS benchmark_aggregates (
  age_range TEXT NOT NULL,          -- '6-7', '7-8', '8-9'
  scope TEXT NOT NULL,              -- 'national' or US state code (e.g. 'NY')
  skill_domain TEXT NOT NULL,       -- 'addition', 'subtraction', 'overall', etc.
  percentile_25 REAL NOT NULL DEFAULT 0,
  percentile_50 REAL NOT NULL DEFAULT 0,
  percentile_75 REAL NOT NULL DEFAULT 0,
  percentile_90 REAL NOT NULL DEFAULT 0,
  sample_size INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (age_range, scope, skill_domain)
);

CREATE INDEX IF NOT EXISTS idx_benchmark_age_scope ON benchmark_aggregates(age_range, scope);

-- Skill states (latest snapshot per child per skill)
CREATE TABLE IF NOT EXISTS skill_states (
  child_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  elo REAL NOT NULL DEFAULT 1000,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  mastery REAL NOT NULL DEFAULT 0,
  leitner_box INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (child_id, skill_id)
);
