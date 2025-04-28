-- Migration: Standardize field naming (name → title)
-- Description: Ensure consistency across the database by standardizing on 'title' instead of 'name'

-- This migration doesn't need to modify tables that already use 'title' consistently
-- Based on database inspection, most tables already use 'title' correctly

-- Values table: Rename 'name' to 'title'
ALTER TABLE "public"."values" RENAME COLUMN "name" TO "title";

-- Update triggers and functions if they reference these columns
-- For any downstream foreign key constraints, they should continue to work since we're just renaming columns

-- Update any indexes that might reference the old column names
DROP INDEX IF EXISTS "public"."values_name_idx";
CREATE INDEX IF NOT EXISTS "values_title_idx" ON "public"."values" ("title");

-- Update any views that might reference the old column names
-- (Add appropriate view updates if needed)

-- Note: This migration assumes 'values' is the primary table needing column renaming
-- based on code inspection. If other tables need similar treatment, add them here.
