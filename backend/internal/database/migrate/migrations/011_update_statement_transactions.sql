-- +goose Up
ALTER TABLE statement_transactions
    ADD COLUMN raw_row_hash VARCHAR(64) NOT NULL,
    ADD COLUMN row_number INT NOT NULL,
    ADD COLUMN is_duplicate BOOLEAN DEFAULT false;

-- Unique constraint to prevent duplicate rows within same upload
CREATE UNIQUE INDEX idx_statement_transactions_unique_hash
    ON statement_transactions(upload_id, raw_row_hash);

-- Index for duplicate detection queries
CREATE INDEX idx_statement_transactions_hash ON statement_transactions(raw_row_hash);
CREATE INDEX idx_statement_transactions_upload_id ON statement_transactions(upload_id);

COMMENT ON COLUMN statement_transactions.raw_row_hash IS 'SHA256 hash of (date + amount + description + reference_number + row_position) for duplicate detection';
COMMENT ON COLUMN statement_transactions.row_number IS 'Original position in Excel file (1-based)';

-- +goose Down
DROP INDEX IF EXISTS idx_statement_transactions_upload_id;
DROP INDEX IF EXISTS idx_statement_transactions_hash;
DROP INDEX IF EXISTS idx_statement_transactions_unique_hash;

ALTER TABLE statement_transactions
    DROP COLUMN IF EXISTS is_duplicate,
    DROP COLUMN IF EXISTS row_number,
    DROP COLUMN IF EXISTS raw_row_hash;