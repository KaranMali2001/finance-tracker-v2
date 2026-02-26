-- +goose Up

-- Speeds up fetching/counting statement transactions for an upload (paginated detail view)
CREATE INDEX idx_stmt_txns_upload_deleted
    ON statement_transactions(upload_id, deleted_at)
    WHERE deleted_at IS NULL;

-- Speeds up the reconciliation job query: non-duplicate rows for processing
CREATE INDEX idx_stmt_txns_upload_dup
    ON statement_transactions(upload_id, is_duplicate, deleted_at)
    WHERE deleted_at IS NULL;

-- Speeds up fetching/counting reconciliation results by upload + filtering by user_action
CREATE INDEX idx_recon_upload_action
    ON transaction_reconciliation(upload_id, user_action);

-- Speeds up the core app-transaction date range query used during reconciliation matching
CREATE INDEX idx_txns_account_date
    ON transactions(account_id, transaction_date)
    WHERE deleted_at IS NULL;

-- +goose Down

DROP INDEX IF EXISTS idx_stmt_txns_upload_deleted;
DROP INDEX IF EXISTS idx_stmt_txns_upload_dup;
DROP INDEX IF EXISTS idx_recon_upload_action;
DROP INDEX IF EXISTS idx_txns_account_date;
