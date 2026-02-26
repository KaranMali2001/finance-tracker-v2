

-- +goose Up
ALTER TABLE transactions
    ADD COLUMN source transaction_source DEFAULT 'MANUAL',
    ADD COLUMN reconciliation_status transaction_reconciliation_status DEFAULT 'UNRECONCILED',
    ADD COLUMN reconciled_by reconciliation_actor,
    ADD COLUMN reconciled_at TIMESTAMP,
    ADD COLUMN statement_txn_id UUID REFERENCES statement_transactions(id);

ALTER TABLE users
    ADD COLUMN reconciliation_threshold INT DEFAULT 70;

COMMENT ON COLUMN users.reconciliation_threshold IS 'Confidence threshold (0-100) for auto-verification. Default: 70';
-- Index for reconciliation queries
CREATE INDEX idx_transactions_reconciliation_status ON transactions(reconciliation_status);
CREATE INDEX idx_transactions_source ON transactions(source);
CREATE INDEX idx_transactions_statement_txn_id ON transactions(statement_txn_id);

-- +goose Down
DROP INDEX IF EXISTS idx_transactions_statement_txn_id;
DROP INDEX IF EXISTS idx_transactions_source;
DROP INDEX IF EXISTS idx_transactions_reconciliation_status;
ALTER TABLE users
    DROP COLUMN IF EXISTS reconciliation_threshold;
ALTER TABLE transactions
    DROP COLUMN IF EXISTS statement_txn_id,
    DROP COLUMN IF EXISTS reconciled_at,
    DROP COLUMN IF EXISTS reconciled_by,
    DROP COLUMN IF EXISTS reconciliation_status,
    DROP COLUMN IF EXISTS source;