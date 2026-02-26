-- Migration: 012_update_bank_statement_uploads.sql

-- +goose Up
ALTER TABLE bank_statement_uploads
    ADD COLUMN processing_status upload_processing_status DEFAULT 'UPLOADED',
    ADD COLUMN duplicate_rows INT DEFAULT 0,
    ADD COLUMN error_rows INT DEFAULT 0,
    ADD COLUMN valid_rows INT DEFAULT 0,
    ADD COLUMN parsing_errors JSONB,
    ADD COLUMN job_id UUID REFERENCES jobs(id);

-- Index for status queries
CREATE INDEX idx_bank_statement_uploads_status ON bank_statement_uploads(processing_status);
CREATE INDEX idx_bank_statement_uploads_job_id ON bank_statement_uploads(job_id);

COMMENT ON COLUMN bank_statement_uploads.processing_status IS 'Current processing state of the upload';
COMMENT ON COLUMN bank_statement_uploads.parsing_errors IS 'Array of parsing errors: [{"row": 23, "error": "Invalid date", "data": {...}}]';

-- +goose Down
DROP INDEX IF EXISTS idx_bank_statement_uploads_job_id;
DROP INDEX IF EXISTS idx_bank_statement_uploads_status;

ALTER TABLE bank_statement_uploads
    DROP COLUMN IF EXISTS job_id,
    DROP COLUMN IF EXISTS parsing_errors,
    DROP COLUMN IF EXISTS valid_rows,
    DROP COLUMN IF EXISTS error_rows,
    DROP COLUMN IF EXISTS duplicate_rows,
    DROP COLUMN IF EXISTS processing_status;
