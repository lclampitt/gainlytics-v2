-- ============================================================
-- Gainlytics v2 — Usage Tracking Migration
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard → SQL Editor → New query
-- ============================================================

-- Add analyzer usage tracking columns to the profiles table.
-- analyzer_uses_this_month: resets each calendar month via backend logic.
-- analyzer_month: stores the current month (e.g. "2026-03") to detect resets.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS analyzer_uses_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS analyzer_month           TEXT    DEFAULT '';
