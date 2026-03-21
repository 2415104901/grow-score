-- ============================================================
-- Supabase Database Schema
-- Project: 儿童积分管理系统 (Family Score System)
-- Branch:  001-family-score-system
-- Date:    2026-03-20
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table: children
-- ============================================================
CREATE TABLE IF NOT EXISTS children (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (trim(name) <> ''),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: profiles
-- Extends Supabase auth.users with role and child binding
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  child_id     UUID REFERENCES children(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Enforce: child role must have child_id, parent must not
  CONSTRAINT child_role_requires_child_id
    CHECK (
      (role = 'child' AND child_id IS NOT NULL) OR
      (role = 'parent' AND child_id IS NULL)
    )
);

-- ============================================================
-- Table: rules
-- ============================================================
CREATE TABLE IF NOT EXISTS rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (trim(name) <> ''),
  score       INTEGER NOT NULL CHECK (score <> 0),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: records (IMMUTABLE — no UPDATE or DELETE policies)
-- ============================================================
CREATE TABLE IF NOT EXISTS records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            UUID NOT NULL REFERENCES children(id),
  rule_id             UUID REFERENCES rules(id) ON DELETE SET NULL,
  rule_name_snapshot  TEXT NOT NULL CHECK (trim(rule_name_snapshot) <> ''),
  score_snapshot      INTEGER NOT NULL CHECK (score_snapshot <> 0),
  date                DATE NOT NULL CHECK (date <= CURRENT_DATE),
  created_by          UUID NOT NULL REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  correction_of       UUID REFERENCES records(id)  -- reserved for Phase 2
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_records_child_date
  ON records (child_id, date);

CREATE INDEX IF NOT EXISTS idx_records_child_id
  ON records (child_id);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id
  ON profiles (user_id);

-- ============================================================
-- Updated_at trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_rules_updated_at
  BEFORE UPDATE ON rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- records has no UPDATE trigger (immutable)
