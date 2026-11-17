# Reconciliation

The context that verifies a user's tracked transactions against an authoritative bank statement, detects duplicates and gaps, and lets the user resolve discrepancies. A bank statement is treated as a **verification lens** over the user's ledger — not as the primary source of truth.

## Language

**App Transaction**:
A transaction in the user's ledger, originating from SMS parsing or manual entry. The source of truth being verified.
_Avoid_: user txn, ledger entry

**Statement Upload**:
A single user-initiated ingestion of one bank statement file (PDF, Excel, or CSV) for one account and period.
_Avoid_: import, statement job

**Parsed Draft Row**:
The LLM's extracted, normalized output for one statement line — unconfirmed. Lives only in the parse job's result and the client until the user confirms. Not yet a database row in the ledger or statement tables.
_Avoid_: draft txn, staged row, preview row

**Statement Transaction**:
A confirmed row from a statement, persisted in `statement_transactions`, that enters the matching algorithm. A Parsed Draft Row becomes a Statement Transaction only after the user confirms the extraction.
_Avoid_: statement row (when unconfirmed), bank txn

**Reconciliation Result**:
A derived record (`transaction_reconciliation`) describing the outcome of matching one Statement Transaction against App Transactions — its result type, confidence, and match signals.
_Avoid_: match, recon record

**Match Confidence**:
A 0–100 score produced by `scoreMatch` from date/amount/description/reference signals. Compared against the user's **Reconciliation Threshold** (default 70) to decide auto-verification.

**Extraction Preview**:
The first user gate — the screen showing Parsed Draft Rows for correction before anything is persisted. Answers "did we read the statement correctly?"
_Avoid_: review (that's the second gate)

**Reconciliation Review**:
The second user gate — the existing UI showing Reconciliation Results (auto-verified / pending / not-in-statement) for accept/reject. Answers "is this a duplicate, or genuinely new?"

**Auto-Created Transaction**:
An App Transaction the system creates from a Statement Transaction that had no match (`MISSING_IN_APP`), tagged with source `STATEMENT_AUTO` and held in `PENDING_REVIEW` until the user accepts it.

## Relationships

- A **Statement Upload** produces many **Parsed Draft Rows** (in the parse job result).
- On confirm, each kept **Parsed Draft Row** becomes one **Statement Transaction**.
- Each **Statement Transaction** produces exactly one **Reconciliation Result**.
- A **Reconciliation Result** references at most one **App Transaction** (the match), or triggers an **Auto-Created Transaction** when none exists.
- A statement is ingested via two gates in order: **Extraction Preview** → **Reconciliation Review**.

## Example dialogue

> **Dev:** "When the LLM finishes parsing the PDF, are those rows Statement Transactions?"
> **Domain expert:** "No — they're Parsed Draft Rows until the user confirms the Extraction Preview. Only confirmed rows get inserted as Statement Transactions and enter matching."
> **Dev:** "And if a Statement Transaction has no matching App Transaction?"
> **Domain expert:** "It becomes an Auto-Created Transaction, source STATEMENT_AUTO, pending review — never silently trusted."

## Flagged ambiguities

- "review" was used for both gates — resolved: **Extraction Preview** (gate 1, correctness of parsing) vs **Reconciliation Review** (gate 2, duplicate resolution). These are distinct.
- "transaction" was overloaded — resolved: **App Transaction** (ledger, source of truth) vs **Statement Transaction** (confirmed statement row) vs **Parsed Draft Row** (unconfirmed LLM output).
