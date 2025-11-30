-- name: CreateAccount :one
INSERT INTO accounts (
    account_number,
    account_type,
    account_name,
    bank_id,
    user_id,
    is_primary
)
VALUES ($1, $2, $3, $4, $5,$6)
RETURNING *;


-- name: GetAccountById :one
SELECT * FROM accounts LEFT JOIN banks ON accounts.bank_id=banks.id WHERE accounts.id=$1 AND accounts.user_id=$2 AND accounts.deleted_at IS NULL;

-- name: UpdateAccount :one
-- name: UpdateAccount :one
UPDATE accounts a 
SET
  account_number = COALESCE(sqlc.narg(account_number), a.account_number),
  account_type = COALESCE(sqlc.narg(account_type), a.account_type),
  account_name = COALESCE(sqlc.narg(account_name), a.account_name),
  current_balance = COALESCE(sqlc.narg(current_balance), a.current_balance),
  is_primary = COALESCE(sqlc.narg(is_primary), a.is_primary),
  bank_id = COALESCE(sqlc.narg(bank_id), a.bank_id),
  updated_at = NOW()
FROM banks b
WHERE a.id = sqlc.arg(id) 
  AND a.user_id = sqlc.arg(user_id)
  AND a.deleted_at IS NULL 
  AND a.bank_id = b.id
RETURNING a.*, 
          b.id AS bank_id, 
          b.name AS bank_name, 
          b.code AS bank_code, 
          b.is_active AS bank_is_active, 
          b.created_at AS bank_created_at, 
          b.updated_at AS bank_updated_at;

-- name: GetAccountsByUserId :many
SELECT * FROM accounts LEFT JOIN banks ON accounts.bank_id=banks.id WHERE accounts.user_id=$1 AND accounts.deleted_at IS NULL;

-- name: DeleteAccount :exec
DELETE FROM accounts WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL;