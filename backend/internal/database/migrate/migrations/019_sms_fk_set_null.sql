-- +goose Up
ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_sms_id_fkey;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_sms_id_fkey
        FOREIGN KEY (sms_id) REFERENCES sms_logs(id) ON DELETE SET NULL;

-- +goose Down
ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_sms_id_fkey;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_sms_id_fkey
        FOREIGN KEY (sms_id) REFERENCES sms_logs(id);
