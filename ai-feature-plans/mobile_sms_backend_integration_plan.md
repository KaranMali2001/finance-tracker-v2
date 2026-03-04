# Mobile SMS → Backend Integration Plan

## Overview

Connect the React Native mobile app to the Go backend for SMS-based transaction creation.
Covers device authentication (QR-based API key), SMS submission with transaction creation,
LLM fallback for failed parses, and investment auto-link wired into all transaction creation paths.

---

## Scope

1. **Device auth middleware** — API key auth path alongside Clerk JWT
2. **Extend `POST /sms`** — accept pre-parsed fields, create transaction on success
3. **LLM fallback** — async Asynq job when parse fails and `use_llm_parsing = true`
4. **Investment auto-link on all txn creation** — wire auto-link enqueue into `CreateTxn` service
5. **Auto-link after reconciliation** — enqueue auto-link at end of reconciliation job
6. **Mobile: QR scan + SMS submission** — scan QR, store API key, POST SMS on receive

---

## Current State

| Item | Status |
|------|--------|
| `GET /user/generate-api-key` — generates API key + QR PNG | ✅ exists |
| `GetUserByApiKey` in user service | ✅ exists |
| `user.api_key`, `user.qr_string` DB fields | ✅ exists |
| `POST /sms` — stores raw SMS only | ✅ exists, needs extension |
| `sms_logs` table with LLM fields | ✅ exists |
| `use_llm_parsing` flag on user | ✅ exists |
| `TaskInvestmentAutoLink` Asynq task | ✅ exists |
| `POST /investment/autolink` manual trigger | ✅ exists |
| Auto-link in `CreateTxn` service | ❌ not wired |
| Auto-link after reconciliation job | ❌ not wired |
| Device API key middleware | ❌ not built |
| LLM SMS parse job | ❌ not built |
| Mobile QR scan flow | ❌ not built |
| Mobile SMS → backend submission | ❌ not built |

---

## Part 1 — Device Auth Middleware

### Goal
Allow the mobile app to authenticate using a device API key instead of a Clerk JWT,
without bundling the Clerk SDK into the mobile app.

### Design

- Header: `X-Device-Api-Key: <64-char hex key>`
- Middleware reads this header, calls `userService.GetUserByApiKey(key)`
- On success: injects `userId` (internal UUID) and `clerkId` into the Echo context
  using the same keys as the existing Clerk middleware (`middleware.UserIDKey`)
- On failure: 401

The SMS endpoint will use this middleware instead of `RequireAuth` (Clerk).
All other endpoints remain Clerk-only.

### Files to touch

- `backend/internal/middleware/` — new file `device_auth.middleware.go`
- Needs a narrow interface `deviceUserProvider` with `GetUserByApiKey(ctx, key) (*user.User, error)`
- `backend/internal/domain/sms/sms.router.go` — swap middleware on SMS routes

### QR Flow (already works, no backend changes needed)

```
Web app → GET /user/generate-api-key (Clerk auth)
        ← { api_key: "abc...", qr_string: "data:image/png;base64,..." }

QR encodes: financeapp://setup?api_key=abc...

Mobile scans QR → parses deep link → stores api_key in SecureStore
Mobile subsequent requests → X-Device-Api-Key: abc...
```

---

## Part 2 — Extend `POST /sms`

### New Request Shape

```go
type CreateSmsReq struct {
    // existing
    Sender      string    `json:"sender"`
    RawMessage  string    `json:"raw_message"`
    ReceivedAt  time.Time `json:"received_at"`

    // new — from mobile parser
    ParseStatus     string   `json:"parse_status"`      // "success" | "failed"
    Amount          *float64 `json:"amount"`             // required if success
    AccountNumber   *string  `json:"account_number"`     // required if success
    TransactionType *string  `json:"transaction_type"`   // "debit" | "credit"
    Merchant        *string  `json:"merchant"`
    ReferenceNumber *string  `json:"reference_number"`
}
```

### SMS Service Logic (`sms.service.go` — `CreateSms`)

```
1. Create sms_log record (always)

2. If parse_status == "success":
   a. Look up account by account_number within the user's accounts
   b. If account not found → return sms_log, skip transaction (no error)
   c. If account found → call txn.CreateTxn(accountId, amount, type, merchant, referenceNo, smsId)
      - CreateTxn now also enqueues auto-link (see Part 3)

3. If parse_status == "failed":
   a. Update sms_log.parsing_status = "failed"
   b. Fetch user.use_llm_parsing flag
   c. If true → enqueue LLmSmsParse task with sms_log.id
   d. If false → return sms_log as-is

4. Return sms_log
```

### Cross-domain dependency

SMS service needs to call transaction service. Add narrow interface in `sms/sms.interfaces.go`:

```go
type smsTransactionCreator interface {
    CreateTxn(ctx context.Context, clerkId string, req CreateTxnReq) (*Transaction, error)
}

type smsAccountLookup interface {
    GetAccountByNumber(ctx context.Context, clerkId string, accountNumber string) (*Account, error)
}
```

`SmsService` constructor gains these two dependencies.

### New SQL query needed

```sql
-- backend/internal/database/queries/account/account.sql
-- name: GetAccountByNumber :one
SELECT * FROM accounts
WHERE clerk_id = $1 AND account_number = $2 AND deleted_at IS NULL
LIMIT 1;
```

---

## Part 3 — Wire Auto-Link into All Transaction Creation

### Goal
Every time a transaction is created (single, SMS, or reconciliation), enqueue the
investment auto-link job for that transaction. Manual `POST /investment/autolink` remains
for bulk re-runs but is no longer the only trigger.

### Changes to `txn.service.go`

`TxnService` gains a new dependency:

```go
type txnAutoLinker interface {
    EnqueueAutoLink(ctx context.Context, clerkId string, txnIDs []uuid.UUID) error
}
```

`CreateTxn` after successful creation + balance update:

```go
// fire-and-forget — log error but don't fail the request
if err := s.autoLinker.EnqueueAutoLink(ctx, clerkId, []uuid.UUID{txn.Id}); err != nil {
    s.log.Error().Err(err).Msg("failed to enqueue auto-link")
}
```

Constructor: `NewTxnService(repo txnRepository, bal balanceApplier, al txnAutoLinker, log *zerolog.Logger)`

`txnAutoLinker` is satisfied by `*investment.InvestmentService`.

Registration order in `main.go` — investment module must be constructed before transaction module
(already the case since investment module was added before transaction).

---

## Part 4 — Auto-Link After Reconciliation Job

### Where to change

`backend/internal/queue/queue.go` — `handleBankReconciliationTask()`

After `ReconService.RunReconciliationJob()` completes and accepted transactions are committed:

```go
createdTxnIDs := result.AcceptedTransactionIDs  // already returned by RunReconciliationJob
if len(createdTxnIDs) > 0 {
    if err := s.investmentService.EnqueueAutoLink(ctx, payload.UserID, createdTxnIDs); err != nil {
        log.Error().Err(err).Msg("failed to enqueue auto-link after reconciliation")
    }
}
```

`RunReconciliationJob` may need to return created transaction IDs — check if it already does.
If not, extend `ReconJobResult` to include `AcceptedTransactionIDs []uuid.UUID`.

---

## Part 5 — LLM SMS Parse Job

### New task type

```go
// backend/internal/tasks/sms.task.go
const TaskLlmSmsParse = "sms:llm_parse"

type LlmSmsParsePayload struct {
    SmsID  uuid.UUID `json:"sms_id"`
    UserID string    `json:"user_id"`   // clerkId
}
```

### Job handler (`queue/queue.go` — `handleLlmSmsParseTask`)

```
1. Fetch sms_log by ID
2. Update llm_parsed_attempted = true
3. Call Google GenAI with raw_message → extract amount, account_number, type, merchant
4. If successful:
   a. Update sms_log: parsing_status = "llm_success", llm_parsed = true, llm_response = JSON
   b. Look up account by account_number
   c. If found → CreateTxn (which also enqueues auto-link)
5. If failed:
   a. Update sms_log: parsing_status = "llm_failed", error_message = reason
```

### LLM prompt strategy

Send raw SMS text. Ask model to return JSON:
```json
{
  "amount": 1500.00,
  "account_number": "1234",
  "transaction_type": "debit",
  "merchant": "Swiggy",
  "reference_number": "UPI/123456"
}
```

Null fields for anything not found. Validate that at minimum `amount` and `account_number`
are present before attempting transaction creation.

### New SQL queries needed

```sql
-- name: GetSmsById :one
SELECT * FROM sms_logs WHERE id = $1;

-- name: UpdateSmsLlmResult :one
UPDATE sms_logs SET
  llm_parsed_attempted = $2,
  llm_parsed = $3,
  llm_response = $4,
  parsing_status = $5,
  error_message = $6
WHERE id = $1
RETURNING *;
```

---

## Part 6 — Mobile Changes

### 6a. QR Scan Screen

New screen `QrScanScreen.tsx`:
- Uses `expo-camera` or `expo-barcode-scanner`
- On scan: parse deep link `financeapp://setup?api_key=<key>`
- Store key: `SecureStore.setItemAsync('device_api_key', key)`
- Navigate to home on success

### 6b. API Client

New file `src/utils/apiClient.ts`:

```typescript
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function smsApiClient() {
  const apiKey = await SecureStore.getItemAsync('device_api_key');
  return axios.create({
    baseURL: BASE_URL,
    headers: { 'X-Device-Api-Key': apiKey ?? '' },
  });
}
```

### 6c. SMS Submission Hook

New hook `src/hooks/useSubmitSms.ts`:

```typescript
// Called from useSmsListener after each SMS is parsed
async function submitSms(parsed: ParsedSms) {
  const client = await smsApiClient();

  const isSuccess = parsed.parsed.transaction.amount !== null
    && parsed.parsed.account.number !== null;

  await client.post('/sms', {
    sender: parsed.raw.address,
    raw_message: parsed.raw.body,
    received_at: new Date(parseInt(parsed.raw.date)).toISOString(),
    parse_status: isSuccess ? 'success' : 'failed',
    amount: isSuccess ? parseFloat(parsed.parsed.transaction.amount!) : undefined,
    account_number: isSuccess ? parsed.parsed.account.number : undefined,
    transaction_type: parsed.parsed.transaction.type,
    merchant: parsed.parsed.transaction.merchant,
    reference_number: parsed.parsed.transaction.referenceNo,
  });
}
```

### 6d. Wire into SmsScreen

`useSmsListener` callback → call `submitSms` after parsing.
Show submission status (sent / failed) on `SmsCard`.

---

## Implementation Order

1. **Device auth middleware** (backend) — unblocks all mobile API calls
2. **Auto-link wired into `CreateTxn`** — foundational, needed by SMS and recon paths
3. **Auto-link after reconciliation** — self-contained queue change
4. **SQL queries + sqlc generate** — `GetAccountByNumber`, `GetSmsById`, `UpdateSmsLlmResult`
5. **Extend `POST /sms`** — new request fields, transaction creation logic
6. **LLM task + handler** — new task type, queue handler, GenAI call
7. **Regenerate Swagger + TS client** — after all backend endpoint changes
8. **Mobile: QR scan screen**
9. **Mobile: API client + submit hook**
10. **Mobile: Wire into SmsScreen**

---

## Open Questions / Decisions Recorded

| Decision | Choice |
|----------|--------|
| Auth method | Device API key (no Clerk on mobile) |
| QR mechanism | Direct — key embedded in QR, no token exchange |
| Parse decision | Mobile parses, sends result; backend makes LLM decision |
| LLM call | Async (Asynq job), not inline |
| Account not found | Create SMS log, skip transaction silently |
| Auto-link scope | All transaction creation paths |
| SMS batch | Not needed — app submits one SMS at a time as received |
| Recon auto-link | Auto-enqueue at end of reconciliation job |
