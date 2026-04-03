-- ============================================================
-- Zensure — Database Schema
-- Run this entire file in the Supabase SQL Editor:
--   Dashboard → SQL Editor → New query → paste → Run
-- All statements are idempotent (safe to re-run).
-- ============================================================

-- Enable UUID generation (already enabled on Supabase by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  email          TEXT        UNIQUE NOT NULL,
  password_hash  TEXT        NOT NULL,
  city           TEXT        NOT NULL,
  avg_income     NUMERIC     NOT NULL DEFAULT 650,
  working_hours  NUMERIC     NOT NULL DEFAULT 8,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Policies (AI-calculated per user on registration)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policies (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
  premium     NUMERIC     NOT NULL,
  coverage    NUMERIC     NOT NULL,
  deductible  NUMERIC     NOT NULL,
  payout_cap  NUMERIC     NOT NULL,
  risk_score  NUMERIC     NOT NULL,
  status      TEXT        DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Activity (GPS-tracked shifts)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        REFERENCES users(id) ON DELETE CASCADE,
  active_hours      NUMERIC     NOT NULL DEFAULT 0,
  distance          NUMERIC     NOT NULL DEFAULT 0,
  location_variance NUMERIC     NOT NULL DEFAULT 0,
  location_points   JSONB       DEFAULT '[]',
  date              DATE        DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Trigger events (weather / AQI snapshots that activate coverage)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS triggers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  city         TEXT        NOT NULL,
  weather_data JSONB       NOT NULL,
  aqi          NUMERIC     NOT NULL,
  trigger_type TEXT        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Payouts (decision-engine results)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payouts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        REFERENCES users(id) ON DELETE CASCADE,
  expected_income   NUMERIC     NOT NULL,
  actual_income     NUMERIC     NOT NULL,
  loss              NUMERIC     NOT NULL,
  payout            NUMERIC     NOT NULL,
  status            TEXT        NOT NULL,
  rejection_reason  TEXT,
  fraud_score       NUMERIC,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Income history (seed data + ongoing records for AI prediction)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS income_history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  amount     NUMERIC     NOT NULL,
  date       DATE        DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Indexes for common query patterns
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_policies_user_id       ON policies(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_date   ON activities(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_payouts_user_id        ON payouts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_income_history_user    ON income_history(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_triggers_city_created  ON triggers(city, created_at DESC);

-- ============================================================
-- Done. Tables are ready for Zensure.
-- ============================================================
