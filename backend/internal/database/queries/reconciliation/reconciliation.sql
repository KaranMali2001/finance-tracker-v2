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

-- Soft-delete statement transactions for this upload.
-- name: SoftDeleteStatementTransactionsByUploadID :exec
UPDATE statement_transactions SET deleted_at = NOW() WHERE upload_id = $1 AND deleted_at IS NULL;

-- Delete the bank statement upload (must run after the above in same tx).
-- name: DeleteBankStatementUploadByID :exec
DELETE FROM bank_statement_uploads WHERE id = $1 AND user_id = $2;

-- name: UpdateUploadSummary :exec
UPDATE bank_statement_uploads
SET
    valid_rows     = $2,
    duplicate_rows = $3,
    error_rows     = $4,
    parsing_errors = $5
WHERE id = $1;

-- name: GetUploadWithSummary :one
SELECT id, user_id, account_id, file_name, upload_status, processing_status,
       statement_period_start, statement_period_end,
       valid_rows, duplicate_rows, error_rows, parsing_errors,
       created_at, updated_at
FROM bank_statement_uploads
WHERE id = $1 AND user_id = $2;

-- name: ListStatementTransactionsByUploadID :many
SELECT id, upload_id, account_id, transaction_date, description, amount, type,
       balance, reference_number, raw_row_hash, row_number, is_duplicate
FROM statement_transactions
WHERE upload_id = $1 AND deleted_at IS NULL
ORDER BY row_number ASC
LIMIT $2 OFFSET $3;

-- name: CountStatementTransactionsByUploadID :one
SELECT COUNT(*) FROM statement_transactions
WHERE upload_id = $1 AND deleted_at IS NULL;

-- name: GetStatementDateRange :one
SELECT
    MIN(transaction_date) AS min_date,
    MAX(transaction_date) AS max_date
FROM statement_transactions
WHERE upload_id = $1 AND is_duplicate = false AND deleted_at IS NULL;

-- name: GetStatementTransactionsForProcessing :many
SELECT id, upload_id, account_id, transaction_date,
       description, amount, type, reference_number, raw_row_hash
FROM statement_transactions
WHERE upload_id = $1 AND is_duplicate = false AND deleted_at IS NULL
ORDER BY transaction_date ASC;

-- name: InsertReconciliationResultBatch :batchexec
INSERT INTO transaction_reconciliation (
    upload_id, statement_transaction_id, app_transaction_id,
    result_type, confidence_score, match_signals, match_status
) VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: UpdateUploadProcessingStatus :exec
UPDATE bank_statement_uploads
SET processing_status = $2, job_id = $3
WHERE id = $1;

-- name: GetReconciliationResultsByUploadID :many
SELECT
    tr.id,
    tr.upload_id,
    tr.statement_transaction_id,
    tr.app_transaction_id,
    tr.result_type,
    tr.confidence_score,
    tr.match_signals,
    tr.match_status,
    tr.user_action,
    tr.created_at,
    st.transaction_date  AS stmt_date,
    st.description       AS stmt_description,
    st.amount            AS stmt_amount,
    st.type              AS stmt_type,
    st.reference_number  AS stmt_reference_number,
    st.row_number        AS stmt_row_number
FROM transaction_reconciliation tr
JOIN statement_transactions st ON st.id = tr.statement_transaction_id AND st.deleted_at IS NULL
WHERE tr.upload_id = $1
ORDER BY st.transaction_date ASC, tr.result_type ASC
LIMIT $2 OFFSET $3;

-- name: CountReconciliationResultsByUploadID :one
SELECT COUNT(*) FROM transaction_reconciliation tr
JOIN statement_transactions st ON st.id = tr.statement_transaction_id AND st.deleted_at IS NULL
WHERE tr.upload_id = $1;

-- name: BulkUpdateReconciliationResultStatus :many
UPDATE transaction_reconciliation tr
SET
    user_action    = $2,
    user_action_at = NOW(),
    reviewed_by    = 'USER',
    reviewed_at    = NOW()
FROM bank_statement_uploads bsu
WHERE tr.id = ANY($1::uuid[])
  AND tr.upload_id = bsu.id
  AND tr.upload_id = $4
  AND bsu.user_id = $3
RETURNING tr.id, tr.user_action;
