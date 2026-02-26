-- +goose up
ALTER TABLE bank_statement_uploads
  DROP COLUMN IF EXISTS file_url;

-- +goose down
ALTER TABLE bank_statement_uploads
  ADD COLUMN file_url VARCHAR(500);