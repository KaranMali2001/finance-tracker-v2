-- +goose Up
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_budget NUMERIC(15,2) NOT NULL DEFAULT 80000;

-- +goose Down
ALTER TABLE users DROP COLUMN IF EXISTS monthly_budget;
