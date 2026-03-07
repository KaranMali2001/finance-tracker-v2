-- name: GetNetWorthTrend :many
SELECT
  DATE_TRUNC('month', t.transaction_date)::date AS month,
  SUM(SUM(
    CASE
      WHEN t.type IN ('CREDIT','INCOME','REFUND','INVESTMENT') THEN t.amount
      WHEN t.type IN ('DEBIT','SUBSCRIPTION') THEN -t.amount
      ELSE 0
    END
  )) OVER (ORDER BY DATE_TRUNC('month', t.transaction_date))::numeric AS running_net_worth
FROM transactions t
WHERE t.user_id = $1
  AND t.transaction_date BETWEEN $2 AND $3
  AND t.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', t.transaction_date)
ORDER BY month;

-- name: GetSpendByCategory :many
SELECT
  c.name AS category_name,
  SUM(t.amount)::numeric AS total_amount
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.user_id = $1
  AND t.type IN ('DEBIT', 'SUBSCRIPTION')
  AND t.transaction_date BETWEEN $2 AND $3
  AND t.deleted_at IS NULL
  AND t.category_id IS NOT NULL
GROUP BY c.name
ORDER BY total_amount DESC;

-- name: GetBudgetHealth :one
SELECT
  COALESCE(SUM(t.amount), 0)::numeric AS total_spent,
  COUNT(*)::int AS transaction_count,
  COUNT(DISTINCT DATE_TRUNC('month', t.transaction_date))::int AS months_in_range,
  u.monthly_budget
FROM users u
LEFT JOIN transactions t ON t.user_id = u.clerk_id
  AND t.type IN ('DEBIT', 'SUBSCRIPTION')
  AND t.transaction_date BETWEEN $2 AND $3
  AND t.deleted_at IS NULL
WHERE u.clerk_id = $1
GROUP BY u.monthly_budget;

-- name: GetGoalProgress :many
SELECT
  g.id,
  g.name,
  g.target_amount,
  g.current_amount,
  g.target_date,
  g.status,
  COALESCE(gi_sum.invested_total, 0)::numeric AS invested_in_period
FROM goals g
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(t.amount), 0) AS invested_total
  FROM goal_transactions gt
  JOIN transactions t ON t.id = gt.transaction_id
  WHERE gt.goal_id = g.id
    AND t.transaction_date BETWEEN $2 AND $3
    AND t.deleted_at IS NULL
) gi_sum ON true
WHERE g.user_id = $1
ORDER BY g.priority ASC NULLS LAST, g.created_at ASC;

-- name: GetAccountBalances :many
SELECT
  a.id,
  a.account_name,
  a.account_type,
  a.current_balance,
  COALESCE(period_flow.income, 0)::numeric AS period_income,
  COALESCE(period_flow.expense, 0)::numeric AS period_expense
FROM accounts a
LEFT JOIN LATERAL (
  SELECT
    SUM(CASE WHEN t.type IN ('CREDIT','INCOME','REFUND') THEN t.amount ELSE 0 END) AS income,
    SUM(CASE WHEN t.type IN ('DEBIT','SUBSCRIPTION') THEN t.amount ELSE 0 END) AS expense
  FROM transactions t
  WHERE t.account_id = a.id
    AND t.transaction_date BETWEEN $2 AND $3
    AND t.deleted_at IS NULL
) period_flow ON true
WHERE a.user_id = $1
  AND a.deleted_at IS NULL
ORDER BY a.current_balance DESC;

-- name: GetPortfolioMix :many
SELECT
  gi.investment_type,
  SUM(gi.current_value)::numeric AS total_value
FROM goal_investments gi
WHERE gi.user_id = $1
GROUP BY gi.investment_type
ORDER BY total_value DESC;
