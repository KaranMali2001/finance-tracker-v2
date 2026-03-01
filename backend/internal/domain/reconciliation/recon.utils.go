package reconciliation

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/xuri/excelize/v2"
)

func RowHash(transactionDate time.Time, amount float64, drCr string, description string) string {
	dateStr := transactionDate.Format(time.RFC3339)
	amountStr := fmt.Sprintf("%.2f", amount)
	sum := dateStr + "|" + amountStr + "|" + drCr + "|" + description
	h := sha256.Sum256([]byte(sum))
	return hex.EncodeToString(h[:])
}

func SafeCell(row []string, i int) string {
	if i < len(row) {
		return row[i]
	}
	return ""
}

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
		if t.Year() < 1990 {
			return time.Time{}, fmt.Errorf("date out of range (got year %d): %s", t.Year(), v)
		}
		return t, nil
	}
	return time.Time{}, fmt.Errorf("unparseable date: %s", v)
}

func ParseExcelAmount(row []string, col int) (float64, error) {
	v := strings.TrimSpace(SafeCell(row, col))
	v = strings.ReplaceAll(v, ",", "")
	var f float64
	if _, err := fmt.Sscanf(v, "%f", &f); err != nil {
		return 0, fmt.Errorf("invalid amount: %s", v)
	}
	return f, nil
}

func MarkDuplicatesFromInsertedSet(rows []ParsedTxns, insertedHashes map[string]struct{}) {
	for i := range rows {
		h := ""
		if rows[i].RawRowHash != nil {
			h = *rows[i].RawRowHash
		}
		_, inserted := insertedHashes[h]
		rows[i].IsDuplicate = utils.PtrBool(!inserted)
	}
}

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
