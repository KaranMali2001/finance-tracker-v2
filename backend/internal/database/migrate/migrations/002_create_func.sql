-- +goose Up

-- Prevent Goose from splitting the function into multiple statements
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;
-- +goose StatementEnd


CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_banks_updated_at
    BEFORE UPDATE ON banks
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_transaction_attachments_updated_at
    BEFORE UPDATE ON transaction_attachments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sms_logs_updated_at
    BEFORE UPDATE ON sms_logs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_monthly_expense_allocation_updated_at
    BEFORE UPDATE ON monthly_expense_allocation
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_monthly_budgets_updated_at
    BEFORE UPDATE ON monthly_budgets
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at
    BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_spending_limits_updated_at
    BEFORE UPDATE ON spending_limits
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_goal_investments_updated_at
    BEFORE UPDATE ON goal_investments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_goal_transactions_updated_at
    BEFORE UPDATE ON goal_transactions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_bank_statement_uploads_updated_at
    BEFORE UPDATE ON bank_statement_uploads
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_statement_transactions_updated_at
    BEFORE UPDATE ON statement_transactions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_transaction_reconciliation_updated_at
    BEFORE UPDATE ON transaction_reconciliation
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_notifications_updated_at
    BEFORE UPDATE ON user_notifications
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_activity_logs_updated_at
    BEFORE UPDATE ON activity_logs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();


-- +goose Down

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_banks_updated_at ON banks;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_merchants_updated_at ON merchants;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_transaction_attachments_updated_at ON transaction_attachments;
DROP TRIGGER IF EXISTS update_sms_logs_updated_at ON sms_logs;
DROP TRIGGER IF EXISTS update_monthly_expense_allocation_updated_at ON monthly_expense_allocation;
DROP TRIGGER IF EXISTS update_monthly_budgets_updated_at ON monthly_budgets;
DROP TRIGGER IF EXISTS update_recurring_transactions_updated_at ON recurring_transactions;
DROP TRIGGER IF EXISTS update_spending_limits_updated_at ON spending_limits;
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
DROP TRIGGER IF EXISTS update_goal_investments_updated_at ON goal_investments;
DROP TRIGGER IF EXISTS update_goal_transactions_updated_at ON goal_transactions;
DROP TRIGGER IF EXISTS update_bank_statement_uploads_updated_at ON bank_statement_uploads;
DROP TRIGGER IF EXISTS update_statement_transactions_updated_at ON statement_transactions;
DROP TRIGGER IF EXISTS update_transaction_reconciliation_updated_at ON transaction_reconciliation;
DROP TRIGGER IF EXISTS update_user_notifications_updated_at ON user_notifications;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
DROP TRIGGER IF EXISTS update_activity_logs_updated_at ON activity_logs;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;

DROP FUNCTION IF EXISTS update_updated_at_column();
