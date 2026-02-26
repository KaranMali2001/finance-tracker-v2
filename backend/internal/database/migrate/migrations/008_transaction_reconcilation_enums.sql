-- Migration: 008_add_reconciliation_enums.sql

-- +goose Up
CREATE TYPE transaction_source AS ENUM (
    'SMS',
    'MANUAL',
    'STATEMENT_AUTO'
);

CREATE TYPE transaction_reconciliation_status AS ENUM (
    'UNRECONCILED',      -- Default: Not yet reconciled
    'AUTO_VERIFIED',     -- System auto-matched (high confidence)
    'PENDING_REVIEW',    -- Low confidence or auto-created, needs user review
    'USER_VERIFIED',     -- User manually approved/merged
    'REJECTED'           -- User rejected (soft deleted)
);

CREATE TYPE reconciliation_actor AS ENUM (
    'SYSTEM',
    'USER'
);

CREATE TYPE upload_processing_status AS ENUM (
    'UPLOADED',          -- File in S3, job created but not started
    'PROCESSING',        -- Job is running
    'COMPLETED',         -- Job finished successfully
    'FAILED',            -- Job failed with errors
    'CANCELLED'          -- User cancelled (future feature)
);

CREATE TYPE reconciliation_result_type AS ENUM (
    'HIGH_CONFIDENCE_MATCH',   -- Found app txn with confidence ≥ threshold
    'LOW_CONFIDENCE_MATCH',    -- Found app txn with confidence < threshold
    'MISSING_IN_APP',          -- No app txn found (auto-created or flagged)
    'NOT_IN_STATEMENT',        -- App txn not found in bank statement
    'MANUALLY_MATCHED',        -- User manually linked
    'CASH_TRANSACTION'         -- Skipped from matching (is_cash=true)
);

-- +goose Down
DROP TYPE IF EXISTS reconciliation_result_type;
DROP TYPE IF EXISTS upload_processing_status;
DROP TYPE IF EXISTS reconciliation_actor;
DROP TYPE IF EXISTS transaction_reconciliation_status;
DROP TYPE IF EXISTS transaction_source;