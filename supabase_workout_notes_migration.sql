-- ============================================================
-- Gainlytics v2 — Add notes column to workouts table
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard → SQL Editor → New query
--
-- Adds a session-level free-text notes field on each workout row
-- (distinct from per-set notes stored inside the exercises JSON).
-- ============================================================

ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS notes TEXT;
