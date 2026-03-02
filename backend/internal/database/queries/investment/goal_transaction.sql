-- name: CreateGoalTransaction :one
INSERT INTO goal_transactions (
  goal_id, investment_id, transaction_id, amount, expected_amount,
  source, transaction_date, notes
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: GetGoalTransactionsByInvestment :many
SELECT * FROM goal_transactions
WHERE investment_id = $1
ORDER BY transaction_date DESC;

-- name: GetGoalTransactionsByGoal :many
SELECT * FROM goal_transactions
WHERE goal_id = $1
ORDER BY transaction_date DESC;

-- name: DeleteGoalTransaction :exec
DELETE FROM goal_transactions
WHERE id = $1;

-- name: SumGoalTransactionsByInvestment :one
SELECT COALESCE(SUM(amount), 0)::numeric AS total
FROM goal_transactions
WHERE investment_id = $1;

-- name: SumGoalTransactionsByGoal :one
SELECT COALESCE(SUM(amount), 0)::numeric AS total
FROM goal_transactions
WHERE goal_id = $1;
