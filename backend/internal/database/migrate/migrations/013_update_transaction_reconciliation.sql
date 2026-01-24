-- Migration: 013_update_transaction_reconciliation.sql

-- +goose Up
ALTER TABLE transaction_reconciliation
    ADD COLUMN result_type reconciliation_result_type NOT NULL DEFAULT 'HIGH_CONFIDENCE_MATCH',
    ADD COLUMN match_signals JSONB,
    ADD COLUMN auto_created_txn_id UUID REFERENCES transactions(id),
    ADD COLUMN reviewed_by reconciliation_actor,
    ADD COLUMN reviewed_at TIMESTAMP;

-- Rename existing columns for clarity
ALTER TABLE transaction_reconciliation
    RENAME COLUMN reconciliation_status TO match_status;

-- Index for review queries
CREATE INDEX idx_transaction_reconciliation_result_type ON transaction_reconciliation(result_type);
CREATE INDEX idx_transaction_reconciliation_user_action ON transaction_reconciliation(user_action);
CREATE INDEX idx_transaction_reconciliation_upload_id ON transaction_reconciliation(upload_id);

COMMENT ON COLUMN transaction_reconciliation.result_type IS 'Type of reconciliation result';
COMMENT ON COLUMN transaction_reconciliation.match_signals IS 'JSON object explaining why match occurred: {"date_match": true, "amount_match": true, "description_similarity": 0.85}';
COMMENT ON COLUMN transaction_reconciliation.auto_created_txn_id IS 'Reference to transaction auto-created from this statement txn';

-- +goose Down
DROP INDEX IF EXISTS idx_transaction_reconciliation_upload_id;
DROP INDEX IF EXISTS idx_transaction_reconciliation_user_action;
DROP INDEX IF EXISTS idx_transaction_reconciliation_result_type;

ALTER TABLE transaction_reconciliation
    RENAME COLUMN match_status TO reconciliation_status;

ALTER TABLE transaction_reconciliation
    DROP COLUMN IF EXISTS reviewed_at,
    DROP COLUMN IF EXISTS reviewed_by,
    DROP COLUMN IF EXISTS auto_created_txn_id,
    DROP COLUMN IF EXISTS match_signals,
    DROP COLUMN IF EXISTS result_type;
