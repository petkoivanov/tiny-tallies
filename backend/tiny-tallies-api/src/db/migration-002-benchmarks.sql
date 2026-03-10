-- Migration 002: Add peer benchmarking demographics and aggregates
-- Apply with: wrangler d1 execute tiny-tallies-db --remote --file=./src/db/migration-002-benchmarks.sql

-- Add demographic columns to child_profiles
ALTER TABLE child_profiles ADD COLUMN age_range TEXT;
ALTER TABLE child_profiles ADD COLUMN state_code TEXT;
ALTER TABLE child_profiles ADD COLUMN benchmark_opt_in INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_child_profiles_benchmark ON child_profiles(benchmark_opt_in, age_range, state_code);

-- Benchmark aggregates (precomputed percentiles by cohort)
CREATE TABLE IF NOT EXISTS benchmark_aggregates (
  age_range TEXT NOT NULL,
  scope TEXT NOT NULL,
  skill_domain TEXT NOT NULL,
  percentile_25 REAL NOT NULL DEFAULT 0,
  percentile_50 REAL NOT NULL DEFAULT 0,
  percentile_75 REAL NOT NULL DEFAULT 0,
  percentile_90 REAL NOT NULL DEFAULT 0,
  sample_size INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (age_range, scope, skill_domain)
);

CREATE INDEX IF NOT EXISTS idx_benchmark_age_scope ON benchmark_aggregates(age_range, scope);
