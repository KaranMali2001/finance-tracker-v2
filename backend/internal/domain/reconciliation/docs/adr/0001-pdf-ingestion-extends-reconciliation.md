# PDF/Excel LLM ingestion lives inside the reconciliation context

We add "parse a bank statement PDF/Excel via an LLM, preview it, confirm, and import" as an **ingestion adapter within the existing `reconciliation` domain**, not as a new bounded context. A bank statement remains a *verification lens* over the user's ledger (App Transactions from SMS/manual are the source of truth); the LLM parser is a new front-end that produces the same `statement_transactions` the matching pipeline already consumes.

## Considered Options

- **New "statement import" domain** treating the PDF as the primary source of transactions — rejected because it would duplicate the hardest, most valuable code we have (matching, scoring, dedup, auto-create) and re-frame the statement as truth, contradicting the non-destructive "statement verifies the ledger" model.
- **Thin parsing domain + shared recon core** — rejected as premature separation; parsing has no independent lifecycle worth isolating yet.

## Consequences

- The double-counting guard the user asked for is the existing matching algorithm, reused verbatim on `statement_transactions` — no second dedup implementation.
- The existing `POST /reconciliation/upload` contract changes: it now enqueues a `STATEMENT_PARSE` job and no longer reconciles inline; reconciliation runs after an explicit confirm. (The previous synchronous excelize parse + immediate reconcile is retired.)
- All formats (PDF, Excel, CSV) funnel through the LLM into one normalized-rows pipeline.
