-- Migration: 021_statement_upload_file_bytes.sql
-- Transient storage of the raw uploaded statement so the async STATEMENT_PARSE
-- worker can read it after the HTTP request ends. Cleared after reconciliation.

-- +goose Up
ALTER TABLE bank_statement_uploads
    ADD COLUMN file_bytes BYTEA,
    ADD COLUMN file_mime  VARCHAR(128);

COMMENT ON COLUMN bank_statement_uploads.file_bytes IS 'Transient raw upload bytes; set NULL after the reconciliation job completes';
COMMENT ON COLUMN bank_statement_uploads.file_mime IS 'MIME type of the uploaded file (application/pdf, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)';

-- +goose Down
ALTER TABLE bank_statement_uploads
    DROP COLUMN IF EXISTS file_mime,
    DROP COLUMN IF EXISTS file_bytes;
