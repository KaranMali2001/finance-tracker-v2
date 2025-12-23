-- +goose Up
       ALTER TYPE job_status ADD VALUE 'completed';
       ALTER TABLE jobs ALTER COLUMN job_id TYPE VARCHAR(255);

-- +goose Down
-- Note: Removing enum values in PostgreSQL requires recreating the type and updating all dependent columns.
-- This is a complex operation that may not be necessary for rollback purposes.
-- If rollback is required, you would need to:
-- 1. Create a new enum without 'completed'
-- 2. Update all jobs with status 'completed' to another status (e.g., 'failed')
-- 3. Alter the jobs table to use the new enum
-- 4. Drop the old enum
-- For now, we'll leave a comment here as a placeholder.
-- ALTER TYPE job_status DROP VALUE 'completed'; -- This syntax doesn't exist in PostgreSQL

