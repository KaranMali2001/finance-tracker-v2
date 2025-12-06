-- +goose Up
ALTER TABLE users ADD COLUMN "api_key" VARCHAR(255);
ALTER TABLE users ADD COLUMN "qr_string" TEXT;
CREATE INDEX IF NOT EXISTS "idx_users_api_key" ON "users"("api_key");

-- +goose Down
ALTER TABLE users DROP COLUMN IF EXISTS "api_key";
ALTER TABLE users DROP COLUMN IF EXISTS "qr_string";
DROP INDEX IF EXISTS "idx_users_api_key";