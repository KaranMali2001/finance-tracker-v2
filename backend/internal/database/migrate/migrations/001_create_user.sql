-- +goose Up
CREATE TYPE "job_status" AS ENUM (
  'pending',
  'processing',
  'failed'
);

CREATE TYPE "job_type" AS ENUM (
  'WELCOME_EMAIL',
  'WEBHOOK',
  'BANK_RECONCILIATION',
  'REPORTS'
);

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
"clerk_id" VARCHAR(255) UNIQUE NOT NULL,
"email" VARCHAR(255) UNIQUE NOT NULL,
"database_url" VARCHAR(255),
"lifetime_income" DECIMAL(15,2) DEFAULT 0,
"lifetime_expense" DECIMAL(15,2) DEFAULT 0,
  "use_llm_parsing" BOOLEAN DEFAULT false,
  "llm_parse_credits" INT DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "banks" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "code" VARCHAR(20) UNIQUE,

  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "accounts" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
  "bank_id" UUID NOT NULL,
"account_number" VARCHAR(50) NOT NULL,
"account_type" VARCHAR(20) NOT NULL,
"account_name" VARCHAR(100),
"current_balance" DECIMAL(15,2) DEFAULT 0,
  "is_primary" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" TIMESTAMP
);

CREATE TABLE "categories" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
"name" VARCHAR(100) NOT NULL,
  "user_id" UUID,
  "parent_category_id" UUID,
"icon" VARCHAR(50),
"color" VARCHAR(7),
"type" VARCHAR(10) NOT NULL,
  "is_system" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "merchants" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
"name" VARCHAR(200) NOT NULL,
"normalized_name" VARCHAR(200),
  "default_category_id" UUID,
"mcc_code" VARCHAR(4),
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "transactions" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
  "to_account_id" UUID,
  "category_id" UUID,
  "merchant_id" UUID,
"type" VARCHAR(10) NOT NULL,
"amount" DECIMAL(15,2) NOT NULL,
  "description" TEXT,
  "notes" TEXT,
"tags" VARCHAR(255),
  "transaction_date" TIMESTAMP NOT NULL,
  "sms_id" UUID,
"payment_method" VARCHAR(50),
"reference_number" VARCHAR(100),
  "is_recurring" BOOLEAN DEFAULT false,
  "is_excluded" BOOLEAN DEFAULT false,
  "is_cash" BOOLEAN DEFAULT false,
  "deleted_at" TIMESTAMP,
  "deleted_by" UUID,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "transaction_attachments" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "transaction_id" UUID NOT NULL,
"file_name" VARCHAR(255) NOT NULL,
"file_url" VARCHAR(500) NOT NULL,
"file_type" VARCHAR(50),
  "file_size" INT,
"thumbnail_url" VARCHAR(500),
  "llm_parsed" BOOLEAN DEFAULT false,
  "llm_parse_attempted" BOOLEAN DEFAULT false,
  "llm_extracted_data" JSONB,
  "uploaded_by" UUID NOT NULL,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "sms_logs" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
"sender" VARCHAR(50) NOT NULL,
  "raw_message" TEXT NOT NULL,
  "received_at" TIMESTAMP NOT NULL,
"parsing_status" VARCHAR(20) DEFAULT 'failed',
  "error_message" TEXT,
  "retry_count" INT DEFAULT 0,
  "llm_parsed" BOOLEAN DEFAULT false,
  "llm_parse_attempted" BOOLEAN DEFAULT false,
  "llm_response" TEXT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "last_retry_at" TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "monthly_expense_allocation" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
"name" VARCHAR(200) NOT NULL,
  "category_id" UUID,
"allocated_amount" DECIMAL(15,2) NOT NULL,
"allocation_percentage" DECIMAL(5,2),
  "priority" INT DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "monthly_budgets" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
  "category_id" UUID NOT NULL,
  "allocation_id" UUID,
  "month_year" DATE NOT NULL,
"budget_amount" DECIMAL(15,2) NOT NULL,
"spent_amount" DECIMAL(15,2) DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "recurring_transactions" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
  "category_id" UUID,
  "merchant_id" UUID,
  "allocation_id" UUID,
"name" VARCHAR(200) NOT NULL,
"amount" DECIMAL(15,2) NOT NULL,
  "is_fixed_amount" BOOLEAN DEFAULT true,
"frequency" VARCHAR(20) NOT NULL,
  "start_date" DATE NOT NULL,
  "next_due_date" DATE NOT NULL,
  "end_date" DATE,
  "auto_create_transaction" BOOLEAN DEFAULT false,
  "reminder_enabled" BOOLEAN DEFAULT true,
  "reminder_days_before" INT DEFAULT 3,
  "is_active" BOOLEAN DEFAULT true,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "spending_limits" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
  "category_id" UUID,
"limit_type" VARCHAR(20) NOT NULL,
"limit_amount" DECIMAL(15,2) NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
"alert_threshold" DECIMAL(5,2) DEFAULT 80,
"current_spent" DECIMAL(15,2) DEFAULT 0,
  "last_reset_at" TIMESTAMP,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "goals" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
"name" VARCHAR(200) NOT NULL,
"target_amount" DECIMAL(15,2) NOT NULL,
"current_amount" DECIMAL(15,2) DEFAULT 0,
  "target_date" DATE NOT NULL,
"status" VARCHAR(20) DEFAULT 'active',
  "priority" INT DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "achieved_at" TIMESTAMP
);

CREATE TABLE "goal_investments" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "goal_id" UUID NOT NULL,
"investment_type" VARCHAR(50) NOT NULL,
"contribution_type" VARCHAR(20) NOT NULL,
"contribution_value" DECIMAL(15,2) NOT NULL,
"current_value" DECIMAL(15,2) DEFAULT 0,
  "account_id" UUID,
  "auto_invest" BOOLEAN DEFAULT false,
  "investment_day" INT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "goal_transactions" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "goal_id" UUID NOT NULL,
  "investment_id" UUID,
  "transaction_id" UUID,
"amount" DECIMAL(15,2) NOT NULL,
  "transaction_date" TIMESTAMP NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "bank_statement_uploads" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
"file_name" VARCHAR(255) NOT NULL,
"file_url" VARCHAR(500),
"file_type" VARCHAR(20),
  "file_size" INT,
  "statement_period_start" DATE,
  "statement_period_end" DATE,
"upload_status" VARCHAR(20) DEFAULT 'processing',
  "processing_started_at" TIMESTAMP,
  "processing_completed_at" TIMESTAMP,
  "total_transactions_found" INT DEFAULT 0,
  "matched_transactions" INT DEFAULT 0,
  "unmatched_transactions" INT DEFAULT 0,
  "missing_transactions" INT DEFAULT 0,
  "error_message" TEXT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "statement_transactions" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "upload_id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
  "transaction_date" DATE NOT NULL,
"description" TEXT,
"amount" DECIMAL(15,2) NOT NULL,
"type" VARCHAR(10) NOT NULL,
"balance" DECIMAL(15,2),
"reference_number" VARCHAR(100),
  "raw_data" JSONB,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "transaction_reconciliation" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "upload_id" UUID NOT NULL,
  "statement_transaction_id" UUID,
  "app_transaction_id" UUID,
"reconciliation_status" VARCHAR(30) NOT NULL,
"confidence_score" DECIMAL(5,2),
"amount_difference" DECIMAL(15,2),
  "date_difference" INT,
"user_action" VARCHAR(20) DEFAULT 'pending',
  "user_action_at" TIMESTAMP,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "user_notifications" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
"notification_type" VARCHAR(50) NOT NULL,
"title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
"entity_type" VARCHAR(50),
  "entity_id" UUID,
"priority" VARCHAR(20) DEFAULT 'medium',
  "email_sent" BOOLEAN DEFAULT false,
  "email_sent_at" TIMESTAMP,
  "email_error" TEXT,
  "is_read" BOOLEAN DEFAULT false,
  "read_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "notification_preferences" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID NOT NULL,
"notification_type" VARCHAR(50) NOT NULL,
  "email_enabled" BOOLEAN DEFAULT true,
"threshold_amount" DECIMAL(15,2),
  "days_before" INT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "activity_logs" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID,
"action" VARCHAR(100) NOT NULL,
"entity_type" VARCHAR(50),
  "entity_id" UUID,
"ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "jobs" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" UUID,
"job_type" VARCHAR(255),
  "job_id" UUID,
  "status" job_status,
  "payload" JSONB,
  "result" JSONB,
  "attempts" INT DEFAULT 0,
  "max_attempts" INT DEFAULT 3,
  "last_error" TEXT,
  "priority" INT DEFAULT 0,
"queue_name" VARCHAR(255),
  "started_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "locked_at" TIMESTAMP,
  "finished_at" TIMESTAMP,
"locked_by" VARCHAR(255),
  "timeout_seconds" INT DEFAULT 30,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

ALTER TABLE "accounts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "accounts" ADD FOREIGN KEY ("bank_id") REFERENCES "banks" ("id");

ALTER TABLE "categories" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "categories" ADD FOREIGN KEY ("parent_category_id") REFERENCES "categories" ("id");

ALTER TABLE "merchants" ADD FOREIGN KEY ("default_category_id") REFERENCES "categories" ("id");

ALTER TABLE "transactions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "transactions" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "transactions" ADD FOREIGN KEY ("to_account_id") REFERENCES "accounts" ("id");

ALTER TABLE "transactions" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "transactions" ADD FOREIGN KEY ("merchant_id") REFERENCES "merchants" ("id");

ALTER TABLE "transactions" ADD FOREIGN KEY ("deleted_by") REFERENCES "users" ("id");

ALTER TABLE "transaction_attachments" ADD FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE;

ALTER TABLE "transaction_attachments" ADD FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id");

ALTER TABLE "sms_logs" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "monthly_expense_allocation" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "monthly_expense_allocation" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "monthly_budgets" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "monthly_budgets" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "monthly_budgets" ADD FOREIGN KEY ("allocation_id") REFERENCES "monthly_expense_allocation" ("id");

ALTER TABLE "recurring_transactions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "recurring_transactions" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "recurring_transactions" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "recurring_transactions" ADD FOREIGN KEY ("merchant_id") REFERENCES "merchants" ("id");

ALTER TABLE "recurring_transactions" ADD FOREIGN KEY ("allocation_id") REFERENCES "monthly_expense_allocation" ("id");

ALTER TABLE "spending_limits" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "spending_limits" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "goals" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "goal_investments" ADD FOREIGN KEY ("goal_id") REFERENCES "goals" ("id") ON DELETE CASCADE;

ALTER TABLE "goal_investments" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "goal_transactions" ADD FOREIGN KEY ("goal_id") REFERENCES "goals" ("id") ON DELETE CASCADE;

ALTER TABLE "goal_transactions" ADD FOREIGN KEY ("investment_id") REFERENCES "goal_investments" ("id");

ALTER TABLE "goal_transactions" ADD FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id");

ALTER TABLE "bank_statement_uploads" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "bank_statement_uploads" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "statement_transactions" ADD FOREIGN KEY ("upload_id") REFERENCES "bank_statement_uploads" ("id") ON DELETE CASCADE;

ALTER TABLE "statement_transactions" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "transaction_reconciliation" ADD FOREIGN KEY ("upload_id") REFERENCES "bank_statement_uploads" ("id") ON DELETE CASCADE;

ALTER TABLE "transaction_reconciliation" ADD FOREIGN KEY ("statement_transaction_id") REFERENCES "statement_transactions" ("id");

ALTER TABLE "transaction_reconciliation" ADD FOREIGN KEY ("app_transaction_id") REFERENCES "transactions" ("id");

ALTER TABLE "user_notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "notification_preferences" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "activity_logs" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL;

-- +goose Down
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notification_preferences;
DROP TABLE IF EXISTS user_notifications;
DROP TABLE IF EXISTS transaction_reconciliation;
DROP TABLE IF EXISTS statement_transactions;
DROP TABLE IF EXISTS bank_statement_uploads;
DROP TABLE IF EXISTS goal_transactions;
DROP TABLE IF EXISTS goal_investments;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS spending_limits;
DROP TABLE IF EXISTS recurring_transactions;
DROP TABLE IF EXISTS monthly_budgets;
DROP TABLE IF EXISTS monthly_expense_allocation;
DROP TABLE IF EXISTS sms_logs;
DROP TABLE IF EXISTS transaction_attachments;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS merchants;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS banks;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS job_type;
DROP TYPE IF EXISTS job_status;