-- name: CreateTxn :one
INSERT INTO transactions(
     user_id,account_id,to_account_id,category_id,merchant_id,type,amount,description,tags,sms_id,payment_method,reference_number,is_recurring,notes,transaction_date
   
) VALUES (
   $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
)
RETURNING *
;
-- name: GetTxnsWithFilters :many
SELECT * from transactions 
WHERE (user_id=$1) 
AND ($2::uuid IS NULL OR account_id=$2)
AND ($3::uuid IS NULL OR category_id=$3)
AND ($4::uuid IS NULL OR merchant_id=$4)
AND deleted_at IS NULL 
AND deleted_by IS NULL;



-- name: SoftDeleteTxns :many
UPDATE transactions
SET (deleted_at, deleted_by) = ($1, $2)
WHERE user_id = $3
  AND id = ANY($4::uuid[])
RETURNING *;

-- name: HardDeleteTxns :exec
DELETE FROM transactions WHERE user_id=$1 AND id=ANY($2::uuid[]);