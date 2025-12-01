-- +goose Up
CREATE TYPE  "txn_type" AS ENUM (
    'DEBIT',
    'CREDIT',
    'SUBSCRIPTION',
    'INVESTMENT',
    'INCOME',
    'REFUND'
    );
ALTER TABLE "transactions"
ALTER COLUMN "type" TYPE "txn_type" USING "type"::"txn_type";
-- +goose Down
ALTER TABLE transactions
ALTER COLUMN type TYPE text USING type::text;
DROP TYPE  "txn_type";