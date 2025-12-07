-- name: CreateTxn :one
INSERT INTO transactions(
     user_id,account_id,to_account_id,category_id,merchant_id,type,amount,description,tags,sms_id,payment_method,reference_number,is_recurring,notes,transaction_date
   
) VALUES (
   $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
)
RETURNING *
;
-- name: GetTxnsWithFilters :many
SELECT 
t.id AS id,
t.type AS type,
t.amount AS amount,
t.description AS description,
t.notes as notes,
t.transaction_date AS transaction_date,
t.payment_method AS payment_method,
t.reference_number AS reference_number,
t.is_recurring AS is_recurring,
t.tags As tags,
a.id AS account_id,
a.account_number AS account_number,
a.account_type AS account_type,
a.account_name AS account_name,
ta.id AS to_account_id,
ta.account_name AS to_account_name,
ta.account_number AS to_account_number,
s.id AS sms_id,
s.raw_message AS sms_message,
c.id AS category_id,
c.name AS category_name,
m.id AS merchant_id,
m.name AS merchant_name
from transactions t 

LEFT JOIN accounts a  ON t.account_id=a.id

LEFT JOIN accounts ta  ON t.to_account_id=ta.id

LEFT JOIN categories c ON t.category_id=c.id

LEFT JOIN merchants m       ON t.merchant_id = m.id


LEFT JOIN sms_logs s    ON t.sms_id = s.id  

WHERE a.user_id=$1

AND ($2::uuid IS NULL OR account_id=$2)
AND ($3::uuid IS NULL OR category_id=$3)
AND ($4::uuid IS NULL OR merchant_id=$4)
AND t.deleted_at IS NULL 
AND t.deleted_by IS NULL;



-- name: SoftDeleteTxns :many
UPDATE transactions
SET (deleted_at, deleted_by) = ($1, $2)
WHERE user_id = $3
  AND id = ANY($4::uuid[])
RETURNING *;

-- name: HardDeleteTxns :exec
DELETE FROM transactions WHERE user_id=$1 AND id=ANY($2::uuid[]);

-- name: UpdateTxn :one
UPDATE transactions t
SET 
    category_id = COALESCE($2, t.category_id),
    merchant_id = COALESCE($3, t.merchant_id),
    amount = COALESCE($4, t.amount),
    description = COALESCE($5, t.description),
    transaction_date = COALESCE($6, t.transaction_date),
     type = COALESCE(NULLIF($7::text, ''), t.type)
FROM accounts a
WHERE t.id = $1
  AND a.id = t.account_id
  AND a.user_id = $8  -- pass authenticated user_id as parameter
RETURNING t.id;
