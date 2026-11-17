package reconciliation

import (
	"testing"

	aiservices "github.com/KaranMali2001/finance-tracker-v2-backend/internal/services/aiServices"
	"github.com/xuri/excelize/v2"
)

func fptr(f float64) *float64 { return &f }

func hasFlag(flags []string, f string) bool {
	for _, x := range flags {
		if x == f {
			return true
		}
	}
	return false
}

func TestInferTypeFromBalance(t *testing.T) {
	tests := []struct {
		name          string
		prev, running float64
		want          string
	}{
		{"balance dropped -> debit", 1000, 800, string(DEBIT)},
		{"balance rose -> credit", 800, 1300, string(CREDIT)},
		{"unchanged -> credit (>=)", 500, 500, string(CREDIT)},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := inferTypeFromBalance(tt.prev, tt.running); got != tt.want {
				t.Fatalf("inferTypeFromBalance(%v,%v) = %s, want %s", tt.prev, tt.running, got, tt.want)
			}
		})
	}
}

func TestCheckBalanceContinuity_Reconciles(t *testing.T) {
	rows := []DraftRow{
		{Amount: 200, Type: string(DEBIT), RunningBalance: fptr(800)},
		{Amount: 500, Type: string(CREDIT), RunningBalance: fptr(1300)},
	}
	bc := checkBalanceContinuity(fptr(1000), fptr(1300), rows, balanceTolerance)

	if !bc.Applicable {
		t.Fatal("expected balance check to be applicable")
	}
	if !bc.Reconciles {
		t.Fatalf("expected reconciles=true, computed=%v expected=%v", bc.ComputedClosing, bc.ExpectedClosing)
	}
	if hasFlag(rows[0].Flags, FlagBalanceMismatch) || hasFlag(rows[1].Flags, FlagBalanceMismatch) {
		t.Fatal("expected no balance_mismatch flags on a clean statement")
	}
}

func TestCheckBalanceContinuity_FlagsMisreadRow(t *testing.T) {
	// r0 running should be 800 (1000-200); LLM misread it as 700 -> magnitude moved=300 != amount 200.
	rows := []DraftRow{
		{Amount: 200, Type: string(DEBIT), RunningBalance: fptr(700)},
		{Amount: 500, Type: string(CREDIT), RunningBalance: fptr(1200)},
	}
	bc := checkBalanceContinuity(fptr(1000), fptr(1300), rows, balanceTolerance)

	if !hasFlag(rows[0].Flags, FlagBalanceMismatch) {
		t.Fatalf("expected row 0 flagged balance_mismatch, flags=%v", rows[0].Flags)
	}
	if bc.Reconciles {
		t.Fatal("expected statement not to reconcile with a misread row")
	}
}

func TestCheckBalanceContinuity_NotApplicable(t *testing.T) {
	rows := []DraftRow{
		{Amount: 200, Type: string(DEBIT)},
		{Amount: 500, Type: string(CREDIT)},
	}
	bc := checkBalanceContinuity(nil, nil, rows, balanceTolerance)
	if bc.Applicable {
		t.Fatal("expected not applicable when no opening balance and no running balances")
	}
}

func TestApplyRowValidationFlags(t *testing.T) {
	rows := []DraftRow{
		{TransactionDate: "2026-01-03", Amount: 450, Flags: []string{}},
		{TransactionDate: "2026-01-03", Amount: 0, Flags: []string{}},
		{TransactionDate: "not-a-date", Amount: 100, Flags: []string{}},
	}
	applyRowValidationFlags(rows)

	if len(rows[0].Flags) != 0 {
		t.Fatalf("row 0 should have no flags, got %v", rows[0].Flags)
	}
	if !hasFlag(rows[1].Flags, FlagMissingAmount) {
		t.Fatalf("row 1 should be flagged missing_amount, got %v", rows[1].Flags)
	}
	if !hasFlag(rows[2].Flags, FlagUnparseableDate) {
		t.Fatalf("row 2 should be flagged unparseable_date, got %v", rows[2].Flags)
	}
}

func TestAssembleDraftResult_RefinesTypeAndFlags(t *testing.T) {
	llm := &aiservices.StatementLLMResult{
		IsStatement:    true,
		OpeningBalance: fptr(1000),
		ClosingBalance: fptr(1300),
		Rows: []aiservices.StatementLLMRow{
			// LLM mislabeled this as CREDIT, but the balance dropped -> should become DEBIT.
			{TransactionDate: "2026-01-03", Amount: 200, Type: "CREDIT", RunningBalance: fptr(800)},
			{TransactionDate: "2026-01-05", Amount: 500, Type: "CREDIT", RunningBalance: fptr(1300)},
		},
	}
	res := AssembleDraftResult(llm)

	if len(res.Rows) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(res.Rows))
	}
	if res.Rows[0].Type != string(DEBIT) {
		t.Fatalf("row 0 type should be refined to DEBIT, got %s", res.Rows[0].Type)
	}
	if !res.BalanceCheck.Reconciles {
		t.Fatal("expected balance to reconcile after type refinement")
	}
	if res.Rows[0].Index != 0 || res.Rows[1].Index != 1 {
		t.Fatal("row indices should be preserved in order")
	}
}

func TestExcelToCSV(t *testing.T) {
	f := excelize.NewFile()
	defer f.Close()
	f.SetCellValue("Sheet1", "A1", "Date")
	f.SetCellValue("Sheet1", "B1", "Amount")
	f.SetCellValue("Sheet1", "A2", "2026-01-01")
	f.SetCellValue("Sheet1", "B2", 100)

	buf, err := f.WriteToBuffer()
	if err != nil {
		t.Fatalf("failed to write workbook: %v", err)
	}
	csv, err := ExcelToCSV(buf.Bytes())
	if err != nil {
		t.Fatalf("ExcelToCSV error: %v", err)
	}
	if want := "Date,Amount"; !contains(csv, want) {
		t.Fatalf("csv missing header %q, got:\n%s", want, csv)
	}
	if want := "2026-01-01,100"; !contains(csv, want) {
		t.Fatalf("csv missing data row %q, got:\n%s", want, csv)
	}
}

func TestIsExcelMime(t *testing.T) {
	cases := map[string]bool{
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
		"application/vnd.ms-excel": true,
		"application/pdf":          false,
		"text/csv":                 false,
	}
	for mime, want := range cases {
		if got := isExcelMime(mime); got != want {
			t.Fatalf("isExcelMime(%q) = %v, want %v", mime, got, want)
		}
	}
}

func TestIsEncryptedPDF(t *testing.T) {
	if !isEncryptedPDF([]byte("%PDF-1.7 ... /Encrypt 12 0 R ... trailer")) {
		t.Fatal("expected encrypted PDF to be detected")
	}
	if isEncryptedPDF([]byte("%PDF-1.7 plain content stream")) {
		t.Fatal("expected unencrypted PDF not to be flagged")
	}
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (indexOf(s, sub) >= 0)
}

func indexOf(s, sub string) int {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}
