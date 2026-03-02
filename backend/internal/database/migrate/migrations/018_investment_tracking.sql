-- +goose Up

-- 1. No new DB enums.
--    contribution_type and recurring_type are VARCHAR — values enforced at the application layer.
--    Only job_type is a DB enum because it already exists as one.

-- 2. Extend goal_investments
--    - goal_id becomes nullable (standalone investments have no goal)
--    - add user_id for direct queries without joining goals
--    - add merchant_name_pattern + description_pattern for fuzzy matching
--    - replace old VARCHAR contribution_type with a fresh one (default one_time)

ALTER TABLE goal_investments
  ALTER COLUMN goal_id DROP NOT NULL;

ALTER TABLE goal_investments
  ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) NOT NULL DEFAULT '' REFERENCES users(clerk_id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS merchant_name_pattern VARCHAR(200),
  ADD COLUMN IF NOT EXISTS description_pattern VARCHAR(200);

ALTER TABLE goal_investments
  ADD COLUMN IF NOT EXISTS contribution_type VARCHAR(20) NOT NULL DEFAULT 'one_time';

-- 3. Extend goal_transactions
--    - source: 'manual' (user linked) or 'auto' (job linked)
--    - expected_amount: what the SIP rule expected (stored for display)
ALTER TABLE goal_transactions
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS expected_amount DECIMAL(15,2);

-- 4. Extend recurring_transactions
--    - recurring_type: 'expense' or 'investment_sip' (enforced in Go)
--    - goal_investment_id: links SIP rules to an investment (NULL for expense type)
ALTER TABLE recurring_transactions
  ADD COLUMN IF NOT EXISTS recurring_type VARCHAR(20) NOT NULL DEFAULT 'expense',
  ADD COLUMN IF NOT EXISTS goal_investment_id UUID REFERENCES goal_investments(id) ON DELETE SET NULL;

-- 5. job_type enum — add new job type for investment auto-link
ALTER TYPE job_type ADD VALUE IF NOT EXISTS 'INVESTMENT_AUTO_LINK';

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_goal_investments_user_id ON goal_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_investments_goal_id ON goal_investments(goal_id) WHERE goal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_goal_transactions_goal_id ON goal_transactions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_transactions_investment_id ON goal_transactions(investment_id) WHERE investment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_goal_investment_id ON recurring_transactions(goal_investment_id) WHERE goal_investment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_goal_investments_user_contribution ON goal_investments(user_id, contribution_type) WHERE contribution_type = 'sip';

-- +goose Down
DROP INDEX IF EXISTS idx_goal_investments_user_contribution;
DROP INDEX IF EXISTS idx_recurring_transactions_goal_investment_id;
DROP INDEX IF EXISTS idx_goal_transactions_investment_id;
DROP INDEX IF EXISTS idx_goal_transactions_goal_id;
DROP INDEX IF EXISTS idx_goal_investments_goal_id;
DROP INDEX IF EXISTS idx_goal_investments_user_id;
ALTER TABLE recurring_transactions DROP COLUMN IF EXISTS goal_investment_id;
ALTER TABLE recurring_transactions DROP COLUMN IF EXISTS recurring_type;
ALTER TABLE goal_transactions DROP COLUMN IF EXISTS expected_amount;
ALTER TABLE goal_transactions DROP COLUMN IF EXISTS source;
ALTER TABLE goal_investments DROP COLUMN IF EXISTS description_pattern;
ALTER TABLE goal_investments DROP COLUMN IF EXISTS merchant_name_pattern;
ALTER TABLE goal_investments DROP COLUMN IF EXISTS contribution_type;
ALTER TABLE goal_investments ADD COLUMN contribution_type VARCHAR(20);
ALTER TABLE goal_investments DROP COLUMN IF EXISTS user_id;
ALTER TABLE goal_investments ALTER COLUMN goal_id SET NOT NULL;
