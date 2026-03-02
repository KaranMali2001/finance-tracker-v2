-- name: CreateGoalInvestment :one
INSERT INTO goal_investments (
  goal_id, user_id, investment_type, contribution_type, contribution_value,
  current_value, account_id, auto_invest, investment_day,
  merchant_name_pattern, description_pattern
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
) RETURNING *;

-- name: GetGoalInvestmentsByUser :many
SELECT * FROM goal_investments
WHERE user_id = $1
AND (sqlc.narg('goal_id')::uuid IS NULL OR goal_id = sqlc.narg('goal_id')::uuid)
AND (sqlc.narg('contribution_type')::text IS NULL OR contribution_type = sqlc.narg('contribution_type')::text)
AND (sqlc.narg('investment_type')::text IS NULL OR investment_type = sqlc.narg('investment_type')::text)
ORDER BY created_at DESC;

-- name: GetGoalInvestmentById :one
SELECT * FROM goal_investments
WHERE id = $1 AND user_id = $2;

-- name: UpdateGoalInvestment :one
UPDATE goal_investments
SET
  investment_type        = COALESCE(NULLIF($1::varchar, ''), investment_type),
  contribution_type      = COALESCE(NULLIF($2::varchar, ''), contribution_type),
  contribution_value     = COALESCE($3::numeric, contribution_value),
  current_value          = COALESCE($4::numeric, current_value),
  auto_invest            = COALESCE($5::boolean, auto_invest),
  investment_day         = COALESCE($6::int, investment_day),
  merchant_name_pattern  = COALESCE(NULLIF($7::varchar, ''), merchant_name_pattern),
  description_pattern    = COALESCE(NULLIF($8::varchar, ''), description_pattern),
  updated_at             = CURRENT_TIMESTAMP
WHERE id = $9 AND user_id = $10
RETURNING *;

-- name: DeleteGoalInvestment :exec
DELETE FROM goal_investments
WHERE id = $1 AND user_id = $2;

-- name: GetActiveSipRulesByUser :many
SELECT
  gi.id, gi.goal_id, gi.user_id, gi.investment_type, gi.contribution_type,
  gi.contribution_value, gi.current_value, gi.account_id, gi.auto_invest,
  gi.investment_day, gi.merchant_name_pattern, gi.description_pattern,
  gi.created_at, gi.updated_at,
  rt.id AS recurring_txn_id, rt.next_due_date, rt.frequency, rt.amount AS expected_amount
FROM goal_investments gi
JOIN recurring_transactions rt ON rt.goal_investment_id = gi.id
WHERE gi.user_id = $1
  AND gi.auto_invest = true
  AND gi.contribution_type = 'sip'
  AND rt.is_active = true
  AND rt.recurring_type = 'investment_sip';

-- name: SetGoalInvestmentCurrentValue :one
UPDATE goal_investments
SET current_value = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $2 AND user_id = $3
RETURNING *;

-- name: SumCurrentValueByGoal :one
SELECT COALESCE(SUM(current_value), 0)::numeric AS total
FROM goal_investments
WHERE goal_id = $1;
