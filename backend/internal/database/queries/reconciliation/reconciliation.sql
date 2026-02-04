-- name: CreateBankStatementUpload :one
INSERT INTO bank_statement_uploads (
    user_id,
    account_id,
    file_name,
    file_type,
    file_size,
    statement_period_start,
    statement_period_end,
    upload_status
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING id;

-- name: InsertStatementTransaction :one
INSERT INTO statement_transactions (
    upload_id,
    account_id,
    transaction_date,
    description,
    amount,
    type,
    balance,
    reference_number,
    raw_row_hash,
    row_number,
    is_duplicate
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
ON CONFLICT (upload_id, raw_row_hash) DO NOTHING
RETURNING raw_row_hash;
