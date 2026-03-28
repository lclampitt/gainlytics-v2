-- Run this in the Supabase SQL Editor
-- Adds onboarding fields to the profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN  DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS display_name         TEXT,
  ADD COLUMN IF NOT EXISTS units_preference     TEXT     DEFAULT 'lbs',
  ADD COLUMN IF NOT EXISTS height_in            NUMERIC;

-- Back-fill existing users so they don't see the wizard
UPDATE profiles
  SET onboarding_completed = TRUE
  WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;
