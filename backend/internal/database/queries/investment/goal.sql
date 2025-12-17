-- name: CreateGoal :one
INSERT INTO goals (
user_id,name,target_amount,current_amount,target_date,status,priority
)VALUES (
$1,$2,$3,$4,$5,$6,$7
)RETURNING *;

-- name: GetGoals :many
SELECT g.id, g.user_id, g.name, g.target_amount, g.current_amount, g.target_date, 
       g.status, g.priority, g.created_at, g.updated_at, g.achieved_at
FROM goals g
WHERE g.user_id = $1
AND (sqlc.narg('status')::text IS NULL OR g.status = sqlc.narg('status')::text)
AND (sqlc.narg('priority')::integer IS NULL OR g.priority = sqlc.narg('priority')::integer)
AND (sqlc.narg('max_amount')::numeric IS NULL OR g.target_amount <= sqlc.narg('max_amount')::numeric)
AND (sqlc.narg('min_amount')::numeric IS NULL OR g.target_amount >= sqlc.narg('min_amount')::numeric)
AND (sqlc.narg('created_after')::timestamp IS NULL OR g.created_at >= sqlc.narg('created_after')::timestamp)
AND (sqlc.narg('target_before')::date IS NULL OR g.target_date <= sqlc.narg('target_before')::date)
AND (sqlc.narg('target_after')::date IS NULL OR g.target_date >= sqlc.narg('target_after')::date);


-- name: GetGoalById :one
SELECT * FROM goals g
WHERE g.id=$1 AND g.user_id=$2;

-- name: UpdateGoal :one
UPDATE goals
SET
  name            = COALESCE(NULLIF($1::varchar, ''), name),
  target_amount   = COALESCE($2::numeric, target_amount),
  target_date     = COALESCE($3::date, target_date),
  status          = COALESCE(NULLIF($4::varchar, ''), status),
  priority        = COALESCE(NULLIF($5::int, 0), priority),
  current_amount  = COALESCE($6::numeric, current_amount),
  achieved_at     = COALESCE($7::timestamp, achieved_at)
WHERE id = $8
  AND user_id = $9
RETURNING *;
