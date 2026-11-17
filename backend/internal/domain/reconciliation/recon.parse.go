package reconciliation

import (
	"bytes"
	"encoding/json"
	"math"
	"strings"
	"time"

	aiservices "github.com/KaranMali2001/finance-tracker-v2-backend/internal/services/aiServices"
	"github.com/xuri/excelize/v2"
)

// ParseStatus is the outcome of a STATEMENT_PARSE job, stored in jobs.result.
type ParseStatus string

const (
	ParseStatusCompleted    ParseStatus = "COMPLETED"
	ParseStatusEncryptedPDF ParseStatus = "ENCRYPTED_PDF"
	ParseStatusNotStatement ParseStatus = "NOT_A_STATEMENT"
	ParseStatusTooManyPages ParseStatus = "TOO_MANY_PAGES"
	ParseStatusFailed       ParseStatus = "PARSE_FAILED"
)

// Deterministic row flags (never LLM self-confidence).
const (
	FlagBalanceMismatch = "balance_mismatch"
	FlagMissingAmount   = "missing_amount"
	FlagUnparseableDate = "unparseable_date"
)

const balanceTolerance = 0.01

// StatementParseJobResult is the full result of a parse job — the Parsed Draft Rows
// plus statement metadata and the balance check, serialized into jobs.result and
// read by the Extraction Preview.
type StatementParseJobResult struct {
	Status       ParseStatus   `json:"status"`
	Message      string        `json:"message,omitempty"`
	Statement    StatementMeta `json:"statement"`
	BalanceCheck BalanceCheck  `json:"balance_check"`
	Rows         []DraftRow    `json:"rows"`
}

type StatementMeta struct {
	BankName       string   `json:"bank_name"`
	AccountLast4   string   `json:"account_last4"`
	Currency       string   `json:"currency"`
	PeriodStart    string   `json:"period_start"`
	PeriodEnd      string   `json:"period_end"`
	OpeningBalance *float64 `json:"opening_balance"`
	ClosingBalance *float64 `json:"closing_balance"`
}

// DraftRow is one Parsed Draft Row — unconfirmed until the user confirms the preview.
type DraftRow struct {
	Index           int      `json:"index"`
	TransactionDate string   `json:"transaction_date"`
	Description     string   `json:"description"`
	Amount          float64  `json:"amount"`
	Type            string   `json:"type"`
	ReferenceNumber string   `json:"reference_number"`
	RunningBalance  *float64 `json:"running_balance"`
	CategoryID      string   `json:"category_id"`
	CategoryName    string   `json:"category_name"`
	MerchantID      string   `json:"merchant_id"`
	MerchantName    string   `json:"merchant_name"`
	Flags           []string `json:"flags"`
}

type BalanceCheck struct {
	Applicable      bool     `json:"applicable"`
	Reconciles      bool     `json:"reconciles"`
	ExpectedClosing *float64 `json:"expected_closing,omitempty"`
	ComputedClosing *float64 `json:"computed_closing,omitempty"`
	Tolerance       float64  `json:"tolerance"`
}

// AssembleDraftResult converts raw LLM output into a job result: it maps rows,
// refines DEBIT/CREDIT from balance direction where available, runs the
// balance-continuity check, and attaches deterministic per-row flags.
func AssembleDraftResult(llm *aiservices.StatementLLMResult) StatementParseJobResult {
	rows := make([]DraftRow, 0, len(llm.Rows))
	for i, r := range llm.Rows {
		rows = append(rows, DraftRow{
			Index:           i,
			TransactionDate: r.TransactionDate,
			Description:     r.Description,
			Amount:          r.Amount,
			Type:            normalizeType(r.Type),
			ReferenceNumber: r.ReferenceNumber,
			RunningBalance:  r.RunningBalance,
			CategoryID:      r.CategoryID,
			CategoryName:    r.CategoryName,
			MerchantID:      r.MerchantID,
			MerchantName:    r.MerchantName,
			Flags:           []string{},
		})
	}

	meta := StatementMeta{
		BankName:       llm.BankName,
		AccountLast4:   llm.AccountLast4,
		Currency:       llm.Currency,
		PeriodStart:    llm.PeriodStart,
		PeriodEnd:      llm.PeriodEnd,
		OpeningBalance: llm.OpeningBalance,
		ClosingBalance: llm.ClosingBalance,
	}

	refineTypesFromBalance(meta.OpeningBalance, rows)
	bc := checkBalanceContinuity(meta.OpeningBalance, meta.ClosingBalance, rows, balanceTolerance)
	applyRowValidationFlags(rows)

	return StatementParseJobResult{
		Statement:    meta,
		BalanceCheck: bc,
		Rows:         rows,
	}
}

func normalizeType(t string) string {
	if strings.EqualFold(strings.TrimSpace(t), "CREDIT") {
		return string(CREDIT)
	}
	return string(DEBIT)
}

// inferTypeFromBalance derives DEBIT/CREDIT from the direction the running balance moved.
func inferTypeFromBalance(prev, running float64) string {
	if running >= prev {
		return string(CREDIT)
	}
	return string(DEBIT)
}

func signedDelta(row DraftRow) float64 {
	if row.Type == string(CREDIT) {
		return row.Amount
	}
	return -row.Amount
}

// refineTypesFromBalance overrides row.Type using the running-balance direction when
// both the previous and current balance are known — the most reliable signal (Q8).
func refineTypesFromBalance(opening *float64, rows []DraftRow) {
	var prev *float64 = opening
	for i := range rows {
		if rows[i].RunningBalance != nil && prev != nil {
			rows[i].Type = inferTypeFromBalance(*prev, *rows[i].RunningBalance)
		}
		if rows[i].RunningBalance != nil {
			prev = rows[i].RunningBalance
		} else if prev != nil {
			v := *prev + signedDelta(rows[i])
			prev = &v
		}
	}
}

// checkBalanceContinuity validates each row's balance movement against its amount and
// the statement-level opening→closing continuity, flagging rows that break it.
// Best-effort: not applicable when neither an opening balance nor any running balance exists.
func checkBalanceContinuity(opening, closing *float64, rows []DraftRow, tolerance float64) BalanceCheck {
	hasRunning := false
	for i := range rows {
		if rows[i].RunningBalance != nil {
			hasRunning = true
			break
		}
	}
	bc := BalanceCheck{Tolerance: tolerance}
	if opening == nil && !hasRunning {
		return bc
	}
	bc.Applicable = true

	var prev *float64 = opening
	for i := range rows {
		if rows[i].RunningBalance != nil && prev != nil {
			moved := *rows[i].RunningBalance - *prev
			if math.Abs(math.Abs(moved)-rows[i].Amount) > tolerance {
				rows[i].Flags = appendFlag(rows[i].Flags, FlagBalanceMismatch)
			}
		}
		if rows[i].RunningBalance != nil {
			prev = rows[i].RunningBalance
		} else if prev != nil {
			v := *prev + signedDelta(rows[i])
			prev = &v
		}
	}

	var computed *float64
	if opening != nil {
		sum := *opening
		for i := range rows {
			sum += signedDelta(rows[i])
		}
		computed = &sum
	} else if len(rows) > 0 && rows[len(rows)-1].RunningBalance != nil {
		computed = rows[len(rows)-1].RunningBalance
	}
	bc.ComputedClosing = computed
	bc.ExpectedClosing = closing

	noRowMismatch := !anyBalanceMismatch(rows)
	if computed != nil && closing != nil {
		bc.Reconciles = math.Abs(*computed-*closing) <= tolerance && noRowMismatch
	} else {
		bc.Reconciles = noRowMismatch
	}
	return bc
}

func applyRowValidationFlags(rows []DraftRow) {
	for i := range rows {
		if rows[i].Amount <= 0 {
			rows[i].Flags = appendFlag(rows[i].Flags, FlagMissingAmount)
		}
		if _, err := time.Parse("2006-01-02", strings.TrimSpace(rows[i].TransactionDate)); err != nil {
			rows[i].Flags = appendFlag(rows[i].Flags, FlagUnparseableDate)
		}
	}
}

func appendFlag(flags []string, f string) []string {
	for _, existing := range flags {
		if existing == f {
			return flags
		}
	}
	return append(flags, f)
}

func anyBalanceMismatch(rows []DraftRow) bool {
	for i := range rows {
		for _, f := range rows[i].Flags {
			if f == FlagBalanceMismatch {
				return true
			}
		}
	}
	return false
}

// ExcelToCSV flattens the first sheet of an .xlsx workbook into CSV text for the LLM.
func ExcelToCSV(data []byte) (string, error) {
	f, err := excelize.OpenReader(bytes.NewReader(data))
	if err != nil {
		return "", err
	}
	defer f.Close()
	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		return "", errNoSheet
	}
	rows, err := f.GetRows(sheets[0])
	if err != nil {
		return "", err
	}
	var b strings.Builder
	for _, row := range rows {
		b.WriteString(strings.Join(row, ","))
		b.WriteString("\n")
	}
	return b.String(), nil
}

var errNoSheet = &parseError{msg: "no sheet found in workbook"}

type parseError struct{ msg string }

func (e *parseError) Error() string { return e.msg }

// isEncryptedPDF is a lightweight heuristic: encrypted PDFs carry an /Encrypt entry
// in the trailer. v1 rejects these (no password support).
func isEncryptedPDF(data []byte) bool {
	return bytes.Contains(data, []byte("/Encrypt"))
}

// isExcelMime reports whether the upload should be flattened to CSV before parsing.
func isExcelMime(mime string) bool {
	m := strings.ToLower(mime)
	return strings.Contains(m, "spreadsheet") ||
		strings.Contains(m, "excel") ||
		strings.Contains(m, "openxmlformats")
}

func marshalResult(r StatementParseJobResult) (string, error) {
	b, err := json.Marshal(r)
	if err != nil {
		return "", err
	}
	return string(b), nil
}
