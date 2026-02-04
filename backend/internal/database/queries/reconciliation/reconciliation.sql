-- name: CreateBankStatementUpload :one
INSERT INTO bank_statement_uploads (
    user_id, account_id, file_name, file_type, file_size,
    statement_period_start, statement_period_end, upload_status
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id;

-- name: InsertStatementTransactionsBatch :batchone
INSERT INTO statement_transactions (
    upload_id, account_id, transaction_date, description, amount, type,
    balance, reference_number, raw_row_hash, row_number, is_duplicate
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
ON CONFLICT (account_id, raw_row_hash) DO NOTHING
RETURNING raw_row_hash;

-- name: ListBankStatementUploadsByUser :many
SELECT id, user_id, account_id, file_name, upload_status, processing_status,
       statement_period_start, statement_period_end, created_at
FROM bank_statement_uploads
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetBankStatementUploadByID :one
SELECT id, user_id, account_id, file_name, upload_status, processing_status,
       statement_period_start, statement_period_end, created_at, updated_at
FROM bank_statement_uploads
WHERE id = $1 AND user_id = $2;



-- Delete reconciliation rows for this upload.
-- name: DeleteTransactionReconciliationByUploadID :exec
DELETE FROM transaction_reconciliation WHERE upload_id = $1;

-- Delete statement transactions for this upload.
-- name: DeleteStatementTransactionsByUploadID :exec
DELETE FROM statement_transactions WHERE upload_id = $1;

-- Delete the bank statement upload (must run after the above in same tx).
-- name: DeleteBankStatementUploadByID :exec
DELETE FROM bank_statement_uploads WHERE id = $1 AND user_id = $2;
