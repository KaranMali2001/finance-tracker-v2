# Investment Tracking — Implementation Plan

## Table of Contents
1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Database Schema Changes](#database-schema-changes)
4. [Architecture](#architecture)
5. [API Specifications](#api-specifications)
6. [Job Architecture — Auto-Link](#job-architecture--auto-link)
7. [Fuzzy Matching Algorithm](#fuzzy-matching-algorithm)
8. [Sequence Diagrams](#sequence-diagrams)
9. [Implementation Phases](#implementation-phases)

---

## Overview

### What We Are Building

An investment tracking system where:
- Investments can be **standalone** (e.g., mutual fund SIP not tied to any goal) or **goal-attached** (e.g., saving ₹10k/month toward buying a phone)
- Investment contributions can be **one-time** (lump sum) or **SIP** (recurring, linked to a `recurring_transaction` rule)
- When a new transaction is created (single or bulk), a background job checks if it matches any active SIP investment rules for that user and auto-links it
- `recurring_transactions` is shared — it is used for SIP investment rules AND for expense recurrences (subscriptions, rent, etc.)

### What Already Exists
- `goals` table + full CRUD API — keeps as-is
- `goal_investments` table — extended (schema changes below)
- `goal_transactions` table — extended (schema changes below)
- `recurring_transactions` table — reused for SIP rules, extended with `goal_investment_id`
- Asynq infrastructure (`tasks/`, `queue/`) — pattern reused directly
- `tokenJaccard` fuzzy matching — extracted to shared utility from reconciliation domain
- `user_notifications` + `notification_preferences` tables — deferred, not in scope now

---

## Core Concepts

### Investment Types
| Type | Description |
|---|---|
| Standalone | `goal_investment` with `goal_id = NULL`. Just tracking contributions to something (mutual fund, stock, etc.) |
| Goal-attached | `goal_investment` with a `goal_id`. Contributions count toward a goal's `current_amount` |

### Contribution Types
| Type | Description |
|---|---|
| `one_time` | Single lump-sum contribution. No recurring rule. Manually linked to a transaction. |
| `sip` | Recurring contribution. Has a linked `recurring_transaction` rule. Auto-linked via background job. |

### Recurring Transactions (shared concept)
`recurring_transactions` already exists for expense tracking (subscriptions, rent). SIP investments reuse this same table. A `recurring_type` enum column distinguishes the purpose of each rule:

| `recurring_type` | Description |
|---|---|
| `expense` | Regular expense — subscription, rent, EMI. Not linked to any investment. |
| `investment_sip` | SIP contribution rule. Has a `goal_investment_id` FK. Drives auto-link matching. |

This lets the frontend and queries filter rules by intent without joining `goal_investments`.

### Auto-Link Flow
1. Transaction(s) created → job enqueued with `[]transaction_id` + `user_id`
2. Job fetches all active SIP investment rules for the user (small set)
3. For each transaction → fuzzy match against all rules in memory
4. Match → insert `goal_transaction` (source=`auto`) → update `goal_investment.current_value` → if goal-attached, update `goals.current_amount` → check goal completion
5. No match → no action, transaction is unaffected

---

## Database Schema Changes

### Migration: `018_investment_tracking.sql`

```sql
-- +goose Up

-- 1. No new DB enums.
--    contribution_type and recurring_type are VARCHAR — values enforced at the application layer.
--    Only job_type is a DB enum because it already exists as one.

-- 2. Extend goal_investments
--    - goal_id becomes nullable (standalone investments)
--    - add user_id for direct queries without joining goals
--    - add merchant_name_pattern for fuzzy matching
--    - contribution_type uses the new enum
--    - drop old varchar contribution_type, add enum column

ALTER TABLE goal_investments
  ALTER COLUMN goal_id DROP NOT NULL;

ALTER TABLE goal_investments
  ADD COLUMN user_id VARCHAR(255) NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  ADD COLUMN merchant_name_pattern VARCHAR(200),
  ADD COLUMN description_pattern VARCHAR(200);

ALTER TABLE goal_investments
  DROP COLUMN contribution_type;

-- contribution_type is VARCHAR — allowed values ('one_time', 'sip') enforced in Go, not DB
ALTER TABLE goal_investments
  ADD COLUMN contribution_type VARCHAR(20) NOT NULL DEFAULT 'one_time';

-- 3. Extend goal_transactions
--    - source distinguishes manual vs auto-linked
--    - expected_amount stores what the SIP rule expected (for display)
ALTER TABLE goal_transactions
  ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'manual',
  ADD COLUMN expected_amount DECIMAL(15,2);

-- 4. Extend recurring_transactions
--    - recurring_type distinguishes expense rules from SIP investment rules
--    - goal_investment_id links SIP rules to an investment (NULL for expense type)
-- recurring_type is VARCHAR — allowed values ('expense', 'investment_sip') enforced in Go, not DB
ALTER TABLE recurring_transactions
  ADD COLUMN recurring_type VARCHAR(20) NOT NULL DEFAULT 'expense',
  ADD COLUMN goal_investment_id UUID REFERENCES goal_investments(id) ON DELETE SET NULL;

-- 5. job_type enum — add new job types
ALTER TYPE job_type ADD VALUE 'INVESTMENT_AUTO_LINK';

-- 6. Indexes
CREATE INDEX idx_goal_investments_user_id ON goal_investments(user_id);
CREATE INDEX idx_goal_investments_goal_id ON goal_investments(goal_id) WHERE goal_id IS NOT NULL;
CREATE INDEX idx_goal_transactions_goal_id ON goal_transactions(goal_id);
CREATE INDEX idx_recurring_transactions_goal_investment_id ON recurring_transactions(goal_investment_id) WHERE goal_investment_id IS NOT NULL;

-- +goose Down
DROP INDEX IF EXISTS idx_recurring_transactions_goal_investment_id;
DROP INDEX IF EXISTS idx_goal_transactions_goal_id;
DROP INDEX IF EXISTS idx_goal_investments_goal_id;
DROP INDEX IF EXISTS idx_goal_investments_user_id;
ALTER TABLE recurring_transactions DROP COLUMN IF EXISTS goal_investment_id;
ALTER TABLE recurring_transactions DROP COLUMN IF EXISTS recurring_type;
DROP TYPE IF EXISTS recurring_transaction_type;
ALTER TABLE goal_transactions DROP COLUMN IF EXISTS expected_amount;
ALTER TABLE goal_transactions DROP COLUMN IF EXISTS source;
ALTER TABLE goal_investments DROP COLUMN IF EXISTS description_pattern;
ALTER TABLE goal_investments DROP COLUMN IF EXISTS merchant_name_pattern;
ALTER TABLE goal_investments DROP COLUMN IF EXISTS contribution_type;
ALTER TABLE goal_investments ADD COLUMN contribution_type VARCHAR(20) DEFAULT 'one_time';
ALTER TABLE goal_investments DROP COLUMN IF EXISTS user_id;
ALTER TABLE goal_investments ALTER COLUMN goal_id SET NOT NULL;
DROP TYPE IF EXISTS investment_contribution_type;
```

### Final `goal_investments` shape (after migration)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| goal_id | UUID nullable FK → goals | NULL for standalone |
| user_id | VARCHAR(255) FK → users | for direct queries |
| investment_type | VARCHAR(50) | Go constant — see `InvestmentType` constants below |
| contribution_type | investment_contribution_type | `one_time` \| `sip` |
| contribution_value | DECIMAL(15,2) | expected SIP amount or lump sum amount |
| current_value | DECIMAL(15,2) | running total of all contributions |
| account_id | UUID FK → accounts | account to watch for matching |
| auto_invest | BOOLEAN | true = auto-link enabled |
| investment_day | INT | expected day-of-month for SIP |
| merchant_name_pattern | VARCHAR(200) | fuzzy match target string |
| description_pattern | VARCHAR(200) | fallback if merchant name not matched |
| created_at / updated_at | TIMESTAMP | |

### Final `goal_transactions` shape (after migration)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| goal_id | UUID FK → goals | |
| investment_id | UUID FK → goal_investments | |
| transaction_id | UUID FK → transactions | actual linked txn |
| amount | DECIMAL(15,2) | actual amount contributed |
| expected_amount | DECIMAL(15,2) | what the SIP rule expected |
| source | VARCHAR(20) | `manual` \| `auto` |
| transaction_date | TIMESTAMP | |
| notes | TEXT | |
| created_at / updated_at | TIMESTAMP | |

---

## Code Reuse & Shared Libraries

Everything below is **already written** — the investment feature consumes it, doesn't rewrite it.

### 1. `tokenJaccard` + `tokenSet` → move to `utils/fuzzy.go`

**Current location:** `recon.service.go:528-553` (private functions, package-scoped)

**Action:** Extract to `backend/internal/utils/fuzzy.go` as exported `TokenJaccard(a, b string) float64`.
`recon.service.go` replaces its private copy with `utils.TokenJaccard(...)` — no behavior change.
Investment auto-link job imports the same function.

```
backend/internal/utils/fuzzy.go   ← NEW: TokenJaccard, tokenSet
reconciliation/recon.service.go   ← update: replace local tokenJaccard with utils.TokenJaccard
investment/investment.service.go  ← uses: utils.TokenJaccard
```

---

### 2. `ParseMultiDate` → move to `utils/date.go`

**Current location:** `investment.repository.go:48-63` and `investment.repository.go:186-202` — the same 5-format date parse loop is **duplicated twice** in the same file.

**Action:** Extract to `backend/internal/utils/date.go` as `ParseMultiDate(s string) (time.Time, error)`.
Investment repository replaces both copies. Any future domain that needs flexible date parsing imports this.

```go
// utils/date.go
var dateFormats = []string{
    "2006-01-02",
    time.RFC3339,
    "2006-01-02T15:04:05Z",
    "2006-01-02T15:04:05.000Z",
    "2006-01-02 15:04:05",
}

func ParseMultiDate(s string) (time.Time, error) {
    for _, f := range dateFormats {
        if t, err := time.Parse(f, s); err == nil {
            return t, nil
        }
    }
    return time.Time{}, fmt.Errorf("unparseable date: %s", s)
}
```

Note: `recon.utils.go` has `ParseExcelDate` which handles Excel serial numbers on top of string formats — that stays in the reconciliation package since it's Excel-specific. `ParseMultiDate` is for API inputs only.

---

### 3. `logMem` → move to `utils/mem.go`

**Current location:** `recon.service.go:581-591` — logs heap alloc/GC stats per job phase.

**Action:** Extract to `backend/internal/utils/mem.go` as `LogMem(phase string, log *zerolog.Logger)`.
The investment auto-link job reuses this for the same purpose (tracking memory in the background worker).

```
backend/internal/utils/mem.go    ← NEW: LogMem
reconciliation/recon.service.go  ← update: replace local logMem with utils.LogMem
investment/investment.service.go ← uses: utils.LogMem in RunAutoLinkJob
```

---

### 4. `BalanceUpdater` (`account.balance.go`) — already shared, no change needed

**Already consumed by:** `TxnService`, `ReconService`
**Investment auto-link job does NOT use it** — investment contributions don't change account balance (the underlying transaction already did that when it was created). The job only links the existing transaction to an investment rule. No balance adjustment needed.

---

### 5. `TaskService.EnqueueTask` + `TaskService.NewTask` — reuse directly

**Current location:** `tasks/base.task.go:126-162`

Investment task follows the exact same pattern as reconciliation:
- `NewInvestmentAutoLinkTask(payload)` → returns `*asynq.Task`
- `EnqueueTask(ctx, task, userId, logger, jobs.JobTypeINVESTMENTAUTOLINK)` → enqueues + creates jobs row

No changes to `TaskService` needed. Just add a new task type constant and a new task constructor file.

---

### 6. `reconTaskService` interface pattern → replicate for investment

**Current location:** `reconciliation/reconciliation.interfaces.go:68-71`

```go
type reconTaskService interface {
    NewBankReconciliationTask(payload tasks.BankReconciliationPayload) (*asynq.Task, error)
    EnqueueTask(...) error
}
```

Investment domain defines its own narrow interface in `investment.interfaces.go`:

```go
type investmentTaskService interface {
    NewInvestmentAutoLinkTask(payload tasks.InvestmentAutoLinkPayload) (*asynq.Task, error)
    EnqueueTask(ctx context.Context, task *asynq.Task, userId string, logger *zerolog.Logger, jobType jobs.JobType) error
}
```

Same `*tasks.TaskService` satisfies both. No new concrete type needed.

---

### 7. `TxnService` narrow interface for job enqueue — new, follows existing pattern

`TxnService` already takes `balanceApplier` via a narrow interface (defined in `transaction.interfaces.go`). The investment job enqueuer follows the same pattern:

```go
// transaction/transaction.interfaces.go — add:
type investmentJobEnqueuer interface {
    EnqueueInvestmentAutoLink(ctx context.Context, userID string, txnIDs []uuid.UUID) error
}
```

A thin wrapper method on `*tasks.TaskService` satisfies this:

```go
// tasks/investment.task.go
func (ts *TaskService) EnqueueInvestmentAutoLink(ctx context.Context, userID string, txnIDs []uuid.UUID) error {
    payload := InvestmentAutoLinkPayload{UserID: userID, TransactionIDs: txnIDs}
    task, err := ts.NewInvestmentAutoLinkTask(payload)
    if err != nil {
        return err
    }
    return ts.client.EnqueueContext(ctx, task)  // fire-and-forget, no job row needed here
}
```

---

### 8. `database.TxManager` — reuse as-is

All investment service operations (link, unlink, recalculate, auto-link job writes) use `tm.WithTx(...)` — identical pattern to every other domain. No changes needed.

---

### 9. `utils/database_utils.go` — reuse all converters

`Float64PtrToNum`, `UUIDToPgtype`, `UUIDPtrToPgtype`, `StringPtrToText`, `TimestampToPgtype`, `TextToString`, `UUIDToUUID`, `BoolToBool`, `Int4ToInt` — all used as-is in investment repository. Already the standard pattern across all domains.

---

### Summary table

| What | From | To | Action |
|---|---|---|---|
| `tokenJaccard` + `tokenSet` | `recon.service.go` | `utils/fuzzy.go` | Extract + export |
| `ParseMultiDate` | `investment.repository.go` (×2) | `utils/date.go` | Extract + deduplicate |
| `logMem` | `recon.service.go` | `utils/mem.go` | Extract + export |
| `BalanceUpdater.Apply/ApplyBatch` | `account.balance.go` | — | Use as-is (no balance change on auto-link) |
| `TaskService.EnqueueTask` | `tasks/base.task.go` | — | Use as-is |
| `reconTaskService` interface pattern | `reconciliation.interfaces.go` | `investment.interfaces.go` | Replicate pattern |
| `investmentJobEnqueuer` interface | — | `transaction.interfaces.go` | New, follows balanceApplier pattern |
| `database.TxManager` | `database/tx.manager.go` | — | Use as-is |
| All `utils/database_utils.go` converters | `utils/database_utils.go` | — | Use as-is |

---

## Architecture

### Domain Structure

```
backend/internal/domain/investment/
  investment.dto.go           ← extend with GoalInvestment, GoalTransaction DTOs
  investment.handler.go       ← extend with new endpoints
  investment.interfaces.go    ← extend investmentQuerier + add investmentTaskService
  investment.repository.go    ← extend with goal_investments + goal_transactions CRUD
  investment.router.go        ← register new routes under /investment
  investment.service.go       ← extend with business logic (goal completion check)
```

```
backend/internal/tasks/
  investment.task.go          ← NEW: InvestmentAutoLinkPayload, NewInvestmentAutoLinkTask()
  base.task.go                ← add TaskInvestmentAutoLink constant
```

```
backend/internal/queue/
  queue.go                    ← register handler for TaskInvestmentAutoLink
                              ← inject investmentService into JobService
```

```
backend/internal/utils/
  fuzzy.go                    ← NEW: extract tokenJaccard from reconciliation into shared util
```

### Dependency Injection

```
InvestmentModule.Deps {
  queries          investmentQuerier    // *generated.Queries
  tm               *database.TxManager
  taskService      investmentTaskService // narrow interface → *tasks.TaskService
}

InvestmentRepository  ← queries, tm
InvestmentService     ← repo, tm, taskService
InvestmentHandler     ← *server.Server, svc
```

`TxnService` needs to enqueue after transaction creation. Add a narrow interface in `transaction/transaction.interfaces.go`:

```go
type investmentJobEnqueuer interface {
    EnqueueInvestmentAutoLink(ctx context.Context, userID string, txnIDs []uuid.UUID) error
}
```

Satisfied by `*tasks.TaskService`. Injected into `TxnService`. Called after `tm.WithTx` commits.

---

## API Specifications

All routes under `/investment` (existing prefix). New sub-routes added.

### Goal Investments (standalone + goal-attached)

```
POST   /investment/investments              Create a goal_investment
GET    /investment/investments              List all for user (filter: goal_id, contribution_type, account_id)
GET    /investment/investments/:id          Get by ID
PUT    /investment/investments/:id          Update
DELETE /investment/investments/:id          Delete
```

### Goal Transactions (contribution history)

```
POST   /investment/investments/:id/transactions          Manually link a transaction
POST   /investment/investments/:id/transactions/bulk     Bulk link multiple transactions
GET    /investment/investments/:id/transactions          List contributions for an investment
DELETE /investment/transactions/:txn_id                  Unlink a goal_transaction
POST   /investment/investments/:id/recalculate           Recompute current_value from goal_transactions
```

#### Auto-recalculate on link / unlink

`current_value` on `goal_investments` (and `current_amount` on `goals` if goal-attached) must stay in sync with the actual `goal_transactions` rows. Rather than doing `+= amount` / `-= amount` (which drifts on partial failures), **every link and unlink operation recomputes from scratch** inside the same `tm.WithTx` block:

```
INSERT/DELETE goal_transaction
→ SELECT SUM(amount) FROM goal_transactions WHERE investment_id = ?
→ UPDATE goal_investments SET current_value = <sum>
→ IF goal_id IS NOT NULL:
    SELECT SUM(gi.current_value) FROM goal_investments gi WHERE gi.goal_id = ?
    UPDATE goals SET current_amount = <sum>
    IF current_amount >= target_amount: SET status='completed', achieved_at=NOW()
```

This means `current_value` is always a pure derivative of `goal_transactions` — it can never drift. The explicit `POST .../recalculate` endpoint exists as a repair tool in case of any data inconsistency (e.g. a past bug, a direct DB edit), not as part of the normal flow.

### Recurring rules for SIP

```
POST   /investment/investments/:id/sip-rule         Create a recurring_transaction linked to this investment
GET    /investment/investments/:id/sip-rule         Get the SIP rule for this investment
DELETE /investment/investments/:id/sip-rule         Detach/delete SIP rule
```

Note: `recurring_transactions` CRUD already exists (or will exist) in its own domain. These endpoints only handle the investment↔recurring link. We do not duplicate the full recurring_transaction CRUD here.

### Application-layer enums (Go constants in `investment.dto.go`)

```go
// ContributionType values — stored as VARCHAR in DB, validated here
type ContributionType string

const (
    ContributionTypeOneTime ContributionType = "one_time"
    ContributionTypeSIP     ContributionType = "sip"
)

// RecurringType values — stored as VARCHAR in DB, validated here
type RecurringType string

const (
    RecurringTypeExpense       RecurringType = "expense"
    RecurringTypeInvestmentSIP RecurringType = "investment_sip"
)

// InvestmentType values — stored as VARCHAR in DB, validated here
// System-defined list; user picks from these, no free-form strings
type InvestmentType string

const (
    InvestmentTypeMutualFund  InvestmentType = "mutual_fund"
    InvestmentTypeStock       InvestmentType = "stock"
    InvestmentTypeFD          InvestmentType = "fd"           // Fixed Deposit
    InvestmentTypePPF         InvestmentType = "ppf"
    InvestmentTypeNPS         InvestmentType = "nps"
    InvestmentTypeGold        InvestmentType = "gold"
    InvestmentTypeRealEstate  InvestmentType = "real_estate"
    InvestmentTypeCrypto      InvestmentType = "crypto"
    InvestmentTypeOther       InvestmentType = "other"
)
```

Validation via `validate:"required,oneof=one_time sip"`, `validate:"required,oneof=expense investment_sip"`, and `validate:"required,oneof=mutual_fund stock fd ppf nps gold real_estate crypto other"` tags on DTOs. Adding a new type = add a constant + update the `oneof` tag. No migration needed.

### DTOs

```go
// CreateGoalInvestmentReq
type CreateGoalInvestmentReq struct {
    GoalId               *uuid.UUID `json:"goal_id,omitempty"`           // nil = standalone
    InvestmentType       string     `json:"investment_type" validate:"required,oneof=mutual_fund stock fd ppf nps gold real_estate crypto other"`
    ContributionType     string     `json:"contribution_type" validate:"required,oneof=one_time sip"`
    ContributionValue    float64    `json:"contribution_value" validate:"required,gt=0"`
    AccountId            uuid.UUID  `json:"account_id" validate:"required"`
    AutoInvest           bool       `json:"auto_invest"`
    InvestmentDay        *int       `json:"investment_day,omitempty"`    // 1-28, required if sip
    MerchantNamePattern  *string    `json:"merchant_name_pattern,omitempty"`
    DescriptionPattern   *string    `json:"description_pattern,omitempty"`
}

// GoalInvestment (response)
type GoalInvestment struct {
    Id                  uuid.UUID  `json:"id"`
    GoalId              *uuid.UUID `json:"goal_id,omitempty"`
    UserId              string     `json:"user_id"`
    InvestmentType      string     `json:"investment_type"`
    ContributionType    string     `json:"contribution_type"`
    ContributionValue   float64    `json:"contribution_value"`
    CurrentValue        float64    `json:"current_value"`
    AccountId           uuid.UUID  `json:"account_id"`
    AutoInvest          bool       `json:"auto_invest"`
    InvestmentDay       *int       `json:"investment_day,omitempty"`
    MerchantNamePattern *string    `json:"merchant_name_pattern,omitempty"`
    DescriptionPattern  *string    `json:"description_pattern,omitempty"`
    SipStatus           string     `json:"sip_status,omitempty"` // on_track | missed | ahead — computed
    CreatedAt           time.Time  `json:"created_at"`
    UpdatedAt           time.Time  `json:"updated_at"`
}

// LinkTransactionReq — manual link
type LinkTransactionReq struct {
    TransactionId uuid.UUID `json:"transaction_id" validate:"required"`
    Notes         *string   `json:"notes,omitempty"`
}

// GoalTransaction (response)
type GoalTransaction struct {
    Id              uuid.UUID  `json:"id"`
    GoalId          uuid.UUID  `json:"goal_id"`
    InvestmentId    uuid.UUID  `json:"investment_id"`
    TransactionId   *uuid.UUID `json:"transaction_id,omitempty"`
    Amount          float64    `json:"amount"`
    ExpectedAmount  *float64   `json:"expected_amount,omitempty"`
    Source          string     `json:"source"` // manual | auto
    TransactionDate time.Time  `json:"transaction_date"`
    Notes           *string    `json:"notes,omitempty"`
    CreatedAt       time.Time  `json:"created_at"`
}
```

---

## Job Architecture — Auto-Link

### Task definition (`tasks/investment.task.go`)

```go
type InvestmentAutoLinkPayload struct {
    UserID         string      `json:"user_id"`
    TransactionIDs []uuid.UUID `json:"transaction_ids"`
}
```

Enqueued with `LowQueueConfig` (same as reconciliation — non-blocking, 2 retries, 10 min timeout).

### Job result / error structure (stored in `jobs.result` JSONB)

The `jobs` table has `result JSONB` and `last_error TEXT`. For this job we write structured JSON to `result` so the UI or admin can inspect exactly what happened per transaction:

```go
type InvestmentAutoLinkResult struct {
    TotalProcessed int                          `json:"total_processed"`
    Matched        int                          `json:"matched"`
    Unmatched      int                          `json:"unmatched"`
    Errors         int                          `json:"errors"`
    Items          []InvestmentAutoLinkItemResult `json:"items"`
}

type InvestmentAutoLinkItemResult struct {
    TransactionID   string  `json:"transaction_id"`
    Status          string  `json:"status"`           // "matched" | "unmatched" | "error"
    MatchedRuleID   *string `json:"matched_rule_id,omitempty"`
    MatchScore      float64 `json:"match_score,omitempty"`
    Error           *string `json:"error,omitempty"`  // populated if status="error"
}
```

This means:
- A partial failure (one transaction errors, rest succeed) is fully visible in the job result
- The `last_error` field on `jobs` row stays as the top-level fatal error (if the whole job crashes)
- Per-transaction errors are in `result.items[n].error` — DB constraint violation, missing account, etc.
- The job is still marked `completed` if it processed all items (even if some had errors) — `failed` is reserved for unrecoverable crashes

This lets you build a job detail view later that shows exactly which transactions were linked and which failed, with reasons.

### Where it is enqueued

In `TxnService.CreateTxn` and `TxnService.BulkCreateTxns` (if it exists), **after** `tm.WithTx` commits:

```go
// after tx commits — fire and forget
_ = s.investmentJobEnqueuer.EnqueueInvestmentAutoLink(
    c.Request().Context(), clerkId, []uuid.UUID{result.Id},
)
```

For bulk: collect all created txn IDs → enqueue one job with the full slice.

### Job handler (`queue/queue.go`)

Follows identical pattern to `handleBankReconciliationTask`:
1. Fetch job from DB, set status = processing
2. Unmarshal payload
3. Call `investmentService.RunAutoLinkJob(ctx, payload, logger)`
4. Update job status = completed / failed

### `RunAutoLinkJob` logic (`investment.service.go`)

```
1. Fetch all active SIP goal_investments for userID where auto_invest = true
   → This is a small set (O(10s) of rules)

2. For each transaction_id in payload.TransactionIDs:
   a. Fetch transaction (id, account_id, description, merchant_id, amount, transaction_date)
   b. For each SIP rule:
      - account_id must match exactly → skip if not
      - fuzzy score = tokenJaccard(txn.description, rule.merchant_name_pattern)
        fallback: tokenJaccard(txn.description, rule.description_pattern)
      - score >= 0.6 → candidate match
      - |txn.transaction_date - rule.next_due_date| <= 15 days → confirm match
   c. Best scoring match wins (if multiple rules match, take highest score)
   d. On match:
      - INSERT goal_transaction (source='auto', expected_amount=rule.contribution_value)
      - UPDATE goal_investment SET current_value = current_value + txn.amount
      - If rule.goal_id IS NOT NULL:
          UPDATE goals SET current_amount = current_amount + txn.amount
          If current_amount >= target_amount:
            UPDATE goals SET status='completed', achieved_at=NOW()
      - UPDATE recurring_transaction SET next_due_date = next_due_date + interval(frequency)

3. All DB writes for one transaction happen inside a single tm.WithTx block
```

---

## Fuzzy Matching Algorithm

### Extract to shared utility

`tokenJaccard` currently lives in the reconciliation domain. Extract to `backend/internal/utils/fuzzy.go`:

```go
package utils

import "strings"

func TokenJaccard(a, b string) float64 {
    setA := tokenSet(a)
    setB := tokenSet(b)
    if len(setA) == 0 && len(setB) == 0 {
        return 1.0
    }
    intersection := 0
    for t := range setA {
        if setB[t] {
            intersection++
        }
    }
    union := len(setA) + len(setB) - intersection
    if union == 0 {
        return 0
    }
    return float64(intersection) / float64(union)
}

func tokenSet(s string) map[string]bool {
    set := make(map[string]bool)
    for _, t := range strings.FieldsFunc(strings.ToLower(s), func(r rune) bool {
        return !('a' <= r && r <= 'z') && !('0' <= r && r <= '9')
    }) {
        set[t] = true
    }
    return set
}
```

Reconciliation domain updates its import to use `utils.TokenJaccard`.

### Match thresholds
| Scenario | Threshold |
|---|---|
| Merchant name pattern set | 0.6 |
| Description pattern only | 0.5 (looser, descriptions are noisier) |
| Date window | ±15 days of `next_due_date` |

---

## Sequence Diagrams

### Single transaction creation → auto-link

```
Client → POST /transaction
  TxnService.CreateTxn
    tm.WithTx {
      TxnRepository.CreateTxns        → DB INSERT transactions
      BalanceUpdater.Apply             → DB UPDATE accounts/users
    }                                  ← tx commits
    investmentJobEnqueuer.Enqueue      → Redis (Asynq) ← non-blocking
  ← 201 response to client

[async]
Asynq worker picks up job
  InvestmentService.RunAutoLinkJob
    DB SELECT goal_investments WHERE user_id=? AND auto_invest=true AND contribution_type='sip'
    for each txn_id:
      DB SELECT transaction
      for each rule:
        account_id check
        tokenJaccard(description, pattern)
        date window check
      best match found?
      tm.WithTx {
        INSERT goal_transactions
        UPDATE goal_investments.current_value
        UPDATE goals.current_amount (if goal-attached)
        UPDATE goals.status='completed' (if current >= target)
        UPDATE recurring_transactions.next_due_date
      }
```

### Bulk import → auto-link

```
Client → POST /transaction/bulk (N transactions)
  TxnService.BulkCreateTxns
    tm.WithTx { INSERT N transactions, UPDATE balances }
    collect txnIDs = [id1, id2, ..., idN]
    investmentJobEnqueuer.Enqueue(userID, txnIDs)  ← ONE job, array payload
  ← 201 response

[async — one job processes all N]
Asynq worker
  RunAutoLinkJob(userID, [id1..idN])
    load rules once
    iterate transactions
    batch writes per matched transaction
```

---

## Implementation Phases

### Phase 1 — Schema + SQL queries
1. Write migration `018_investment_tracking.sql`
2. Write SQLC queries in `backend/internal/database/queries/investment/goal_investment.sql`:
   - `CreateGoalInvestment`
   - `GetGoalInvestmentsByUser` (filter: goal_id, contribution_type, auto_invest)
   - `GetGoalInvestmentById`
   - `UpdateGoalInvestment`
   - `DeleteGoalInvestment`
   - `GetActiveSipRulesByUser` (WHERE auto_invest=true AND contribution_type='sip')
3. Write SQLC queries in `backend/internal/database/queries/investment/goal_transaction.sql`:
   - `CreateGoalTransaction`
   - `GetGoalTransactionsByInvestment`
   - `DeleteGoalTransaction`
   - `SumGoalTransactionsByInvestment` — `SELECT COALESCE(SUM(amount), 0) FROM goal_transactions WHERE investment_id = $1`
   - `SumCurrentValueByGoal` — `SELECT COALESCE(SUM(gi.current_value), 0) FROM goal_investments gi WHERE gi.goal_id = $1`
4. Run `sqlc generate`

### Phase 2 — Shared utility extractions
1. Create `backend/internal/utils/fuzzy.go` — export `TokenJaccard(a, b string) float64`
2. Create `backend/internal/utils/date.go` — export `ParseMultiDate(s string) (time.Time, error)`
3. Create `backend/internal/utils/mem.go` — export `LogMem(phase string, log *zerolog.Logger)`
4. Update `reconciliation/recon.service.go` — replace `tokenJaccard` with `utils.TokenJaccard`, replace `logMem` with `utils.LogMem`
5. Update `investment/investment.repository.go` — replace both duplicated date-parse loops with `utils.ParseMultiDate`

### Phase 3 — Investment domain backend
1. Extend `investment.interfaces.go` — add new querier methods + `investmentTaskService` interface
2. Extend `investment.repository.go` — implement goal_investment + goal_transaction CRUD
3. Extend `investment.service.go` — implement `RunAutoLinkJob`, goal completion check, SIP status computation
4. Extend `investment.dto.go` — add all new DTOs
5. Extend `investment.handler.go` — add new endpoints
6. Extend `investment.router.go` — register new routes

### Phase 4 — Task + Queue wiring
1. Add `TaskInvestmentAutoLink` to `tasks/base.task.go`
2. Create `tasks/investment.task.go` with payload + task constructor
3. Add `investmentJobEnqueuer` interface to `transaction/transaction.interfaces.go`
4. Inject into `TxnService`, call after tx commits in `CreateTxn` (and bulk if applicable)
5. Add handler registration in `queue/queue.go`
6. Inject `InvestmentService` into `JobService`

### Phase 5 — Swagger + Frontend types
1. `task docs:generate:backend`
2. `task docs:generate:frontend`

### Phase 6 — Frontend
1. New pages under `/dashboard/investments/`:
   - `/investments` — list all `goal_investments` (standalone + goal-attached) with SIP status badge
   - `/investments/new` — create form (choose goal or standalone, one_time vs sip)
   - `/investments/:id` — detail with contribution history, progress, SIP rule info
2. Update existing goal detail page to show attached investments and their `current_value`
3. New hooks: `useGoalInvestments`, `useGoalTransactions`, `useCreateGoalInvestment`, etc.

---

## Open Items / Decisions Made

| Decision | Choice |
|---|---|
| Standalone investments | `goal_id = NULL` on `goal_investments` |
| SIP rule storage | Reuse `recurring_transactions` with `goal_investment_id` FK |
| Auto-link trigger | Always via Asynq queue, even for single transactions |
| Job payload | `{ user_id, transaction_ids: [] }` — one job, array of IDs |
| Fuzzy match | `tokenJaccard` extracted to `utils/fuzzy.go`, threshold 0.6 |
| Date window | ±15 days of `next_due_date` |
| Amount check | Not required for matching; expected amount stored for display only |
| Notifications | Out of scope for now |
| `next_due_date` update | Happens inside the same tx as `goal_transaction` insert |
| `current_value` sync | Recomputed from `SUM(goal_transactions.amount)` on every link/unlink — never incremental |
| `investment_type` | Go constants (`InvestmentType`), `oneof` validator, no DB enum, no migration for new types |
