-- +goose Up

-- Add soft-delete column to statement_transactions
ALTER TABLE statement_transactions
    ADD COLUMN deleted_at TIMESTAMPTZ;

-- Change the FK on transactions.statement_txn_id to SET NULL on delete
-- so that soft-deleting (or hard-deleting) a statement_transaction does not
-- violate the constraint on the transactions table.
ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_statement_txn_id_fkey;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_statement_txn_id_fkey
        FOREIGN KEY (statement_txn_id)
        REFERENCES statement_transactions(id)
        ON DELETE SET NULL;

-- +goose Down

ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_statement_txn_id_fkey;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_statement_txn_id_fkey
        FOREIGN KEY (statement_txn_id)
        REFERENCES statement_transactions(id);

ALTER TABLE statement_transactions
    DROP COLUMN IF EXISTS deleted_at;
