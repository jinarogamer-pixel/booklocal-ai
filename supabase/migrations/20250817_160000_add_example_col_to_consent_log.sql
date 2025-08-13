-- Migration: Add example column to consent_log for demonstration
ALTER TABLE consent_log ADD COLUMN IF NOT EXISTS example_col text;
