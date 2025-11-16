-- +goose Up

-- USERS
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- BANKS
CREATE INDEX IF NOT EXISTS idx_banks_name ON banks(name);

-- ACCOUNTS
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_bank_id ON accounts(bank_id);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts(is_active);

-- CATEGORIES
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_category_id ON categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- MERCHANTS
CREATE INDEX IF NOT EXISTS idx_merchants_name ON merchants(name);
CREATE INDEX IF NOT EXISTS idx_merchants_normalized_name ON merchants(normalized_name);
CREATE INDEX IF NOT EXISTS idx_merchants_default_category_id ON merchants(default_category_id);

-- TRANSACTIONS
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_number ON transactions(reference_number);
CREATE INDEX IF NOT EXISTS idx_transactions_is_recurring ON transactions(is_recurring);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_amount ON transactions(user_id, amount);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);

-- TRANSACTION ATTACHMENTS
CREATE INDEX IF NOT EXISTS idx_txn_attachments_txn_id ON transaction_attachments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_txn_attachments_uploaded_by ON transaction_attachments(uploaded_by);

-- SMS LOGS
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_received_at ON sms_logs(received_at);

-- MONTHLY EXPENSE ALLOCATION
CREATE INDEX IF NOT EXISTS idx_mea_user_id ON monthly_expense_allocation(user_id);
CREATE INDEX IF NOT EXISTS idx_mea_category_id ON monthly_expense_allocation(category_id);

-- MONTHLY BUDGETS
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_user_id ON monthly_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_category_id ON monthly_budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_month_year ON monthly_budgets(month_year);

-- RECURRING TRANSACTIONS
CREATE INDEX IF NOT EXISTS idx_recurring_tx_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tx_account_id ON recurring_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tx_category_id ON recurring_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tx_next_due_date ON recurring_transactions(next_due_date);

-- SPENDING LIMITS
CREATE INDEX IF NOT EXISTS idx_spending_limits_user_id ON spending_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_limits_category_id ON spending_limits(category_id);

-- GOALS
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);

-- GOAL INVESTMENTS
CREATE INDEX IF NOT EXISTS idx_goal_investments_goal_id ON goal_investments(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_investments_account_id ON goal_investments(account_id);

-- GOAL TRANSACTIONS
CREATE INDEX IF NOT EXISTS idx_goal_tx_goal_id ON goal_transactions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_tx_investment_id ON goal_transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_goal_tx_txn_id ON goal_transactions(transaction_id);

-- BANK STATEMENT UPLOADS
CREATE INDEX IF NOT EXISTS idx_bsu_user_id ON bank_statement_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_bsu_account_id ON bank_statement_uploads(account_id);
CREATE INDEX IF NOT EXISTS idx_bsu_upload_status ON bank_statement_uploads(upload_status);

-- STATEMENT TRANSACTIONS
CREATE INDEX IF NOT EXISTS idx_stmt_tx_upload_id ON statement_transactions(upload_id);
CREATE INDEX IF NOT EXISTS idx_stmt_tx_account_id ON statement_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_stmt_tx_txn_date ON statement_transactions(transaction_date);

-- TRANSACTION RECONCILIATION
CREATE INDEX IF NOT EXISTS idx_reco_upload_id ON transaction_reconciliation(upload_id);
CREATE INDEX IF NOT EXISTS idx_reco_stmt_tx_id ON transaction_reconciliation(statement_transaction_id);
CREATE INDEX IF NOT EXISTS idx_reco_app_tx_id ON transaction_reconciliation(app_transaction_id);
CREATE INDEX IF NOT EXISTS idx_reco_status ON transaction_reconciliation(reconciliation_status);

-- USER NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- NOTIFICATION PREFERENCES
CREATE INDEX IF NOT EXISTS idx_notif_prefs_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_prefs_type ON notification_preferences(notification_type);

-- ACTIVITY LOGS
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- JOBS
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_name ON jobs(queue_name);
CREATE INDEX IF NOT EXISTS idx_jobs_started_at ON jobs(started_at);


-- +goose Down

DROP INDEX IF EXISTS idx_users_clerk_id;
DROP INDEX IF EXISTS idx_users_email;

DROP INDEX IF EXISTS idx_banks_name;

DROP INDEX IF EXISTS idx_accounts_user_id;
DROP INDEX IF EXISTS idx_accounts_bank_id;
DROP INDEX IF EXISTS idx_accounts_is_active;

DROP INDEX IF EXISTS idx_categories_user_id;
DROP INDEX IF EXISTS idx_categories_parent_category_id;
DROP INDEX IF EXISTS idx_categories_type;

DROP INDEX IF EXISTS idx_merchants_name;
DROP INDEX IF EXISTS idx_merchants_normalized_name;
DROP INDEX IF EXISTS idx_merchants_default_category_id;

DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_transactions_account_id;
DROP INDEX IF EXISTS idx_transactions_category_id;
DROP INDEX IF EXISTS idx_transactions_merchant_id;
DROP INDEX IF EXISTS idx_transactions_transaction_date;
DROP INDEX IF EXISTS idx_transactions_reference_number;
DROP INDEX IF EXISTS idx_transactions_is_recurring;

DROP INDEX IF EXISTS idx_transactions_user_date;
DROP INDEX IF EXISTS idx_transactions_user_amount;
DROP INDEX IF EXISTS idx_transactions_user_type;

DROP INDEX IF EXISTS idx_txn_attachments_txn_id;
DROP INDEX IF EXISTS idx_txn_attachments_uploaded_by;

DROP INDEX IF EXISTS idx_sms_logs_user_id;
DROP INDEX IF EXISTS idx_sms_logs_received_at;

DROP INDEX IF EXISTS idx_mea_user_id;
DROP INDEX IF EXISTS idx_mea_category_id;

DROP INDEX IF EXISTS idx_monthly_budgets_user_id;
DROP INDEX IF EXISTS idx_monthly_budgets_category_id;
DROP INDEX IF EXISTS idx_monthly_budgets_month_year;

DROP INDEX IF EXISTS idx_recurring_tx_user_id;
DROP INDEX IF EXISTS idx_recurring_tx_account_id;
DROP INDEX IF EXISTS idx_recurring_tx_category_id;
DROP INDEX IF EXISTS idx_recurring_tx_next_due_date;

DROP INDEX IF EXISTS idx_spending_limits_user_id;
DROP INDEX IF EXISTS idx_spending_limits_category_id;

DROP INDEX IF EXISTS idx_goals_user_id;
DROP INDEX IF EXISTS idx_goals_status;

DROP INDEX IF EXISTS idx_goal_investments_goal_id;
DROP INDEX IF EXISTS idx_goal_investments_account_id;

DROP INDEX IF EXISTS idx_goal_tx_goal_id;
DROP INDEX IF EXISTS idx_goal_tx_investment_id;
DROP INDEX IF EXISTS idx_goal_tx_txn_id;

DROP INDEX IF EXISTS idx_bsu_user_id;
DROP INDEX IF EXISTS idx_bsu_account_id;
DROP INDEX IF EXISTS idx_bsu_upload_status;

DROP INDEX IF EXISTS idx_stmt_tx_upload_id;
DROP INDEX IF EXISTS idx_stmt_tx_account_id;
DROP INDEX IF EXISTS idx_stmt_tx_txn_date;

DROP INDEX IF EXISTS idx_reco_upload_id;
DROP INDEX IF EXISTS idx_reco_stmt_tx_id;
DROP INDEX IF EXISTS idx_reco_app_tx_id;
DROP INDEX IF EXISTS idx_reco_status;

DROP INDEX IF EXISTS idx_user_notifications_user_id;
DROP INDEX IF EXISTS idx_user_notifications_is_read;

DROP INDEX IF EXISTS idx_notif_prefs_user_id;
DROP INDEX IF EXISTS idx_notif_prefs_type;

DROP INDEX IF EXISTS idx_activity_logs_user_id;
DROP INDEX IF EXISTS idx_activity_logs_created_at;

DROP INDEX IF EXISTS idx_jobs_user_id;
DROP INDEX IF EXISTS idx_jobs_status;
DROP INDEX IF EXISTS idx_jobs_job_type;
DROP INDEX IF EXISTS idx_jobs_queue_name;
DROP INDEX IF EXISTS idx_jobs_started_at;
