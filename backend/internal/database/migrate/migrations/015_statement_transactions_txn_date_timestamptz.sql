-- +goose Up
-- Store transaction date with time (TIMESTAMPTZ) for statement transactions.
-- Existing DATE values are converted with time 00:00:00 in server timezone.
ALTER TABLE statement_transactions
    ALTER COLUMN transaction_date TYPE TIMESTAMPTZ USING transaction_date::timestamptz;

-- Unique constraint: one row per (account_id, raw_row_hash) so the same transaction
-- cannot be stored twice for the same account (across any upload).
DROP INDEX IF EXISTS idx_statement_transactions_unique_hash;
CREATE UNIQUE INDEX idx_statement_transactions_unique_account_hash
    ON statement_transactions(account_id, raw_row_hash);

-- +goose Down
DROP INDEX IF EXISTS idx_statement_transactions_unique_account_hash;
CREATE UNIQUE INDEX idx_statement_transactions_unique_hash
    ON statement_transactions(upload_id, raw_row_hash);

ALTER TABLE statement_transactions
    ALTER COLUMN transaction_date TYPE DATE USING transaction_date::date;
