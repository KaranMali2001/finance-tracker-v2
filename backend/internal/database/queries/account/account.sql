-- name: CreateAccount :one
INSERT INTO accounts (account_number,account_type,account_name,bank_id,user_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetAccountById :one
SELECT * FROM accounts LEFT JOIN banks ON accounts.bank_id=banks.id WHERE accounts.id=$1 AND accounts.user_id=$2 AND accounts.deleted_at IS NULL;

-- name: UpdateAccount :one
UPDATE accounts a SET
  account_number=COALESCE($1, a.account_number),
  account_type=COALESCE($2, a.account_type),
  account_name=COALESCE($3, a.account_name),
  current_balance=COALESCE($4, a.current_balance),
  is_primary=COALESCE($5, a.is_primary),
  bank_id=COALESCE($6, a.bank_id),
  deleted_at=COALESCE($7, a.deleted_at)
FROM banks b
WHERE a.id=$8 AND a.user_id=$9 AND a.deleted_at IS NULL AND a.bank_id = b.id
RETURNING a.*, b.id AS bank_id, b.name AS bank_name, b.code AS bank_code, 
          b.is_active AS bank_is_active, b.created_at AS bank_created_at, 
          b.updated_at AS bank_updated_at;

-- name: GetAccountsByUserId :many
SELECT * FROM accounts LEFT JOIN banks ON accounts.bank_id=banks.id WHERE accounts.user_id=$1 AND accounts.deleted_at IS NULL;