-- ============================================================================
-- Migration: v8_scientific_questionnaire
-- Purpose:   Add scientific questionnaire fields to user_profiles for
--            Mifflin-St Jeor BMR/TDEE calculation and enhanced onboarding
-- Affected:  user_profiles
-- Notes:     All new columns are nullable for backward compatibility.
--            Existing users retain their current data; new fields populate
--            when they redo onboarding or update settings.
-- ============================================================================

-- ── New columns ─────────────────────────────────────────────────────────────

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS age INT,
  ADD COLUMN IF NOT EXISTS activity_level TEXT,
  ADD COLUMN IF NOT EXISTS meals_per_day TEXT,
  ADD COLUMN IF NOT EXISTS eating_approach TEXT,
  ADD COLUMN IF NOT EXISTS emphasis_areas TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS average_daily_steps INT,
  ADD COLUMN IF NOT EXISTS progress_tracking_methods TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fat_target INT,
  ADD COLUMN IF NOT EXISTS carb_target INT,
  ADD COLUMN IF NOT EXISTS bmr INT,
  ADD COLUMN IF NOT EXISTS tdee INT;

-- ── CHECK constraints for enum-like text columns ────────────────────────────

ALTER TABLE user_profiles
  ADD CONSTRAINT chk_activity_level CHECK (
    activity_level IS NULL OR activity_level IN (
      'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'
    )
  );

ALTER TABLE user_profiles
  ADD CONSTRAINT chk_meals_per_day CHECK (
    meals_per_day IS NULL OR meals_per_day IN ('2', '3', '4', '5', '6+')
  );

ALTER TABLE user_profiles
  ADD CONSTRAINT chk_eating_approach CHECK (
    eating_approach IS NULL OR eating_approach IN (
      'no_preference', 'clean_eating', 'flexible_dieting', 'keto', 'high_carb', 'intermittent_fasting'
    )
  );
