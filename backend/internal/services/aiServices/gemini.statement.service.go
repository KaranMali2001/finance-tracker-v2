package aiservices

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/rs/zerolog"
	"google.golang.org/genai"
)

// statementParseModel is the Gemini model used for bank-statement extraction.
// Gemini 3.1 Flash-Lite was chosen for native PDF input and higher accuracy than
// 2.5 Flash-Lite. NOTE: verify this exact model ID against the live Gemini API.
const statementParseModel = "gemini-3.1-flash-lite"

// StatementLLMResult is the raw structured output from the LLM for a bank statement.
type StatementLLMResult struct {
	IsStatement    bool              `json:"is_statement"`
	BankName       string            `json:"bank_name"`
	AccountLast4   string            `json:"account_last4"`
	Currency       string            `json:"currency"`
	PeriodStart    string            `json:"period_start"`
	PeriodEnd      string            `json:"period_end"`
	OpeningBalance *float64          `json:"opening_balance"`
	ClosingBalance *float64          `json:"closing_balance"`
	Rows           []StatementLLMRow `json:"rows"`
}

type StatementLLMRow struct {
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
}

// ParseStatement extracts every transaction line from a bank/credit-card statement.
// PDFs are sent natively as page-images; tabular text (CSV extracted from Excel) is
// sent as a text part. Output is enforced via responseSchema JSON mode.
func (gs *GeminiService) ParseStatement(ctx context.Context, data []byte, mimeType string, categories, merchants map[string]string, log *zerolog.Logger) (*StatementLLMResult, error) {
	var parts []*genai.Part
	if mimeType == "application/pdf" {
		parts = append(parts, &genai.Part{InlineData: &genai.Blob{MIMEType: mimeType, Data: data}})
	} else {
		parts = append(parts, genai.NewPartFromText("STATEMENT DATA (tabular text):\n"+string(data)))
	}
	parts = append(parts, genai.NewPartFromText(buildStatementPrompt(categories, merchants)))

	temp := float32(0)
	cfg := &genai.GenerateContentConfig{
		Temperature:      &temp,
		ResponseMIMEType: "application/json",
		ResponseSchema:   statementResponseSchema(),
	}
	content := []*genai.Content{{Parts: parts, Role: genai.RoleUser}}

	resp, err := gs.GeminiClient.Models.GenerateContent(ctx, statementParseModel, content, cfg)
	if err != nil {
		return nil, err
	}
	text := resp.Text()
	log.Info().Int("resp_len", len(text)).Msg("[stmt-parse] gemini response received")

	var result StatementLLMResult
	if err := json.Unmarshal([]byte(extractJSON(text)), &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal statement parse result: %w", err)
	}
	return &result, nil
}

func buildStatementPrompt(categories, merchants map[string]string) string {
	var catList strings.Builder
	for id, name := range categories {
		catList.WriteString(fmt.Sprintf("- %s: %s\n", id, name))
	}
	var merchantList strings.Builder
	for id, name := range merchants {
		merchantList.WriteString(fmt.Sprintf("- %s: %s\n", id, name))
	}
	return fmt.Sprintf(`You are parsing a bank or credit-card statement. Extract EVERY transaction line item.

Rules:
1. Do NOT invent, merge, or skip rows. Return exactly the transactions present in the document, in order.
2. "amount" must be a POSITIVE number, without currency symbols or thousands separators.
3. "type" is "DEBIT" (money out / withdrawal / purchase) or "CREDIT" (money in / deposit). If the running balance decreased for the row, it is DEBIT; if it increased, it is CREDIT.
4. "running_balance" is the account balance AFTER the transaction, if the statement shows a balance column; otherwise null.
5. Extract statement-level "opening_balance" and "closing_balance" if present; otherwise null.
6. All dates in ISO format YYYY-MM-DD.
7. Map each row to the best-matching category ID and merchant ID from the lists below, using the EXACT id string. If none matches, set the id to "" (empty string); you may still fill category_name / merchant_name with a best guess.
8. Extract "account_last4" (last 4 digits of the account/card), "bank_name", "currency" (ISO code such as INR or USD), and the statement "period_start"/"period_end" (YYYY-MM-DD) from the header.
9. If this document is NOT a bank or credit-card statement, set "is_statement" to false and return an empty "rows" array.

Available Categories (id: name):
%s

Available Merchants (id: name):
%s`, catList.String(), merchantList.String())
}

func statementResponseSchema() *genai.Schema {
	str := func() *genai.Schema { return &genai.Schema{Type: genai.TypeString} }
	num := func() *genai.Schema { return &genai.Schema{Type: genai.TypeNumber} }
	nullNum := func() *genai.Schema { t := true; return &genai.Schema{Type: genai.TypeNumber, Nullable: &t} }

	row := &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"transaction_date": str(),
			"description":      str(),
			"amount":           num(),
			"type":             {Type: genai.TypeString, Enum: []string{"DEBIT", "CREDIT"}},
			"reference_number": str(),
			"running_balance":  nullNum(),
			"category_id":      str(),
			"category_name":    str(),
			"merchant_id":      str(),
			"merchant_name":    str(),
		},
		Required: []string{"transaction_date", "description", "amount", "type"},
	}

	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"is_statement":    {Type: genai.TypeBoolean},
			"bank_name":       str(),
			"account_last4":   str(),
			"currency":        str(),
			"period_start":    str(),
			"period_end":      str(),
			"opening_balance": nullNum(),
			"closing_balance": nullNum(),
			"rows":            {Type: genai.TypeArray, Items: row},
		},
		Required: []string{"is_statement", "rows"},
	}
}
