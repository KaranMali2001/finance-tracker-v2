package reconciliation

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
)

// RowHash builds a deterministic hash for duplicate detection.
// Uses: transaction date (as-is), amount, Dr/Cr, and description (when available).
func RowHash(transactionDate time.Time, amount float64, drCr string, description string) string {
	dateStr := transactionDate.Format(time.RFC3339)
	amountStr := fmt.Sprintf("%.2f", amount)
	sum := dateStr + "|" + amountStr + "|" + drCr + "|" + description
	h := sha256.Sum256([]byte(sum))
	return hex.EncodeToString(h[:])
}

// PtrString returns a pointer to s. Returns nil if s is empty.
func PtrString(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// PtrBool returns a pointer to b.
func PtrBool(b bool) *bool {
	return &b
}

// SafeCell returns row[i] or "" if index out of range.
func SafeCell(row []string, i int) string {
	if i < len(row) {
		return row[i]
	}
	return ""
}

// ParseExcelDate parses the cell at col in row as a date/datetime (uses whatever is in the column).
func ParseExcelDate(row []string, col int) (time.Time, error) {
	v := strings.TrimSpace(SafeCell(row, col))
	if v == "" {
		return time.Time{}, fmt.Errorf("empty date")
	}
	if t, err := time.Parse(time.RFC3339, v); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02 15:04:05", v); err == nil {
		return t, nil
	}
	if t, err := time.Parse("02-01-2006 15:04:05", v); err == nil {
		return t, nil
	}
	if t, err := time.Parse("02-01-2006", v); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02", v); err == nil {
		return t, nil
	}
	var f float64
	if _, err := fmt.Sscanf(v, "%f", &f); err == nil && f > 0 {
		t, _ := excelize.ExcelDateToTime(f, false)
		// Reject Excel serial dates that fall before 1990 (e.g. day-of-month 14 parsed as serial 14 => 1900-01-14).
		if t.Year() < 1990 {
			return time.Time{}, fmt.Errorf("date out of range (got year %d): %s", t.Year(), v)
		}
		return t, nil
	}
	return time.Time{}, fmt.Errorf("unparseable date: %s", v)
}

// ParseExcelAmount parses the cell at col in row as a numeric amount.
func ParseExcelAmount(row []string, col int) (float64, error) {
	v := strings.TrimSpace(SafeCell(row, col))
	v = strings.ReplaceAll(v, ",", "")
	var f float64
	if _, err := fmt.Sscanf(v, "%f", &f); err != nil {
		return 0, fmt.Errorf("invalid amount: %s", v)
	}
	return f, nil
}

// MarkDuplicatesFromInsertedSet sets IsDuplicate on rows whose RawRowHash is not in insertedHashes.
// Call after insert: DB returns only hashes that were inserted (ON CONFLICT DO NOTHING);
// any hash not in that set is a duplicate.
func MarkDuplicatesFromInsertedSet(rows []ParsedTxns, insertedHashes map[string]struct{}) {
	for i := range rows {
		h := ""
		if rows[i].RawRowHash != nil {
			h = *rows[i].RawRowHash
		}
		_, inserted := insertedHashes[h]
		rows[i].IsDuplicate = PtrBool(!inserted)
	}
}

// SummaryFromRows builds UploadSummary from parsed rows and parse errors.
func SummaryFromRows(rows []ParsedTxns, parseErrors []ParseError) UploadSummary {
	dup := 0
	for i := range rows {
		if rows[i].IsDuplicate != nil && *rows[i].IsDuplicate {
			dup++
		}
	}
	valid := len(rows) - dup
	return UploadSummary{
		TotalRows:     len(rows) + len(parseErrors),
		DuplicateRows: dup,
		ErrorRows:     len(parseErrors),
		ValidRows:     valid,
		Errors:        parseErrors,
	}
}
