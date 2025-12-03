package aiservices

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	"github.com/rs/zerolog"

	"google.golang.org/genai"
)

type GeminiService struct {
	GeminiClient *genai.Client
	Model        string
}

func NewGeminiService(cfg *config.AIConfig) (*GeminiService, error) {
	ctx := context.Background()
	c, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: cfg.GeminiAPIKey,
	})
	if err != nil {
		return nil, err
	}
	return &GeminiService{
		GeminiClient: c,
		Model:        "gemini-2.5-flash-lite",
	}, nil
}

type ParsedTxn struct {
	Amount            float64    `json:"amount,omitempty"`
	AccountNum        *string    `json:"account_num,omitempty"`
	CategoryId        *string    `json:"category_id,omitempty"`
	MerchantId        *string    `json:"merchant_id,omitempty"`
	Type              string     `json:"type,omitempty"`
	Description       *string    `json:"description,omitempty"`
	Notes             *string    `json:"notes,omitempty"`
	Tags              *string    `json:"tags,omitempty"`
	PaymentMethod     *string    `json:"payment_method,omitempty"`
	ReferenceNumber   *string    `json:"reference_number,omitempty"`
	TransactionDate   *time.Time `json:"transaction_date,omitempty"`
	TransactionTime   *time.Time `json:"transaction_time,omitempty"`
	TransactionType   *string    `json:"transaction_type,omitempty"`
	TransactionAmount *float64   `json:"transaction_amount,omitempty"`
}

func (gs *GeminiService) ParseTxn(ctx context.Context, file []byte, categories map[string]string, merchants map[string]string, mimeType string, log *zerolog.Logger) (*ParsedTxn, error) {

	parts := []*genai.Part{
		{
			InlineData: &genai.Blob{
				MIMEType: mimeType,
				Data:     file,
			},
		},
		genai.NewPartFromText(gs.buildPrompt(categories, merchants)),
	}
	content := []*genai.Content{
		{
			Parts: parts,
			Role:  genai.RoleUser,
		},
	}
	resp, err := gs.GeminiClient.Models.GenerateContent(ctx, gs.Model, content, nil)
	if err != nil {

		return nil, err
	}
	text := resp.Text()
	log.Info().Msgf("Generated Content from Gemini is %v", text)
	parsedTxn, err := parseResponse(text)
	if err != nil {

		return nil, err
	}
	return parsedTxn, nil
}
func (gs *GeminiService) buildPrompt(categories map[string]string, merchants map[string]string) string {
	var catList strings.Builder
	for catId, catName := range categories {
		catList.WriteString(fmt.Sprintf("- %s: %s\n", catId, catName))
	}

	var merchantList strings.Builder
	for merchId, merchName := range merchants {
		merchantList.WriteString(fmt.Sprintf("- %s: %s\n", merchId, merchName))
	}

	return fmt.Sprintf(`Analyze this transaction receipt/image and extract the following information in JSON format. Use snake_case for all field names.

{
  "amount": <numeric amount without currency symbols>,
  "account_num": <account number if visible, else null>,
  "category_id": <ID from categories list below that best matches, or null>,
  "merchant_id": <ID from merchants list below that best matches, or null>,
  "type": <Transaction type - one of: DEBIT, CREDIT, SUBSCRIPTION, INVESTMENT, INCOME, REFUND>,
  "description": <Brief description of the transaction based on merchant name and items purchased>,
  "notes": <Any additional notes or remarks visible on the receipt>,
  "tags": <Comma-separated tags relevant to the transaction, or null>,
  "payment_method": <Payment method used - e.g., "Credit Card", "Debit Card", "Cash", "UPI", "Net Banking", or null>,
  "reference_number": <Transaction reference number, order ID, or receipt number if visible, or null>,
  "transaction_date": <Transaction date in ISO 8601 format (YYYY-MM-DD), or null>,
  "transaction_time": <Transaction time in ISO 8601 format (YYYY-MM-DDTHH:MM:SS), or null>,
  "transaction_type": <Additional transaction type information if available, or null>,
  "transaction_amount": <Alternative amount field if different from main amount, or null>
}

Available Categories:
%s

Available Merchants:
%s

Instructions:
1. Extract the transaction amount as a number (without currency symbols). Use the "amount" field for the primary transaction amount.
2. If you see an account number, include it in "account_num"; otherwise set to null.
3. Match the merchant from the image to one in the merchants list and use its ID in "merchant_id".
4. Match the category based on the transaction type/merchant and use its ID in "category_id".
5. Determine the transaction type (DEBIT, CREDIT, etc.) based on the receipt context - purchases are typically DEBIT, refunds are REFUND, etc.
6. Extract description from merchant name and key items/services mentioned on the receipt.
7. Extract payment method from visible payment information (card type, UPI, cash, etc.).
8. Extract reference number, order ID, or receipt number if visible.
9. Extract transaction date and time if visible on the receipt (use ISO 8601 format).
10. Return ONLY valid JSON, no additional text or markdown formatting.
11. If you cannot determine a value, use null for that field.
12. All date/time fields should be in ISO 8601 format (e.g., "2024-01-15" for date, "2024-01-15T14:30:00" for datetime).`, catList.String(), merchantList.String())
}

// ParsedTxnJSON is used for unmarshaling JSON with string dates
type ParsedTxnJSON struct {
	Amount            *float64 `json:"amount,omitempty"`
	AccountNum        *string  `json:"account_num,omitempty"`
	CategoryId        *string  `json:"category_id,omitempty"`
	MerchantId        *string  `json:"merchant_id,omitempty"`
	Type              *string  `json:"type,omitempty"`
	Description       *string  `json:"description,omitempty"`
	Notes             *string  `json:"notes,omitempty"`
	Tags              *string  `json:"tags,omitempty"`
	PaymentMethod     *string  `json:"payment_method,omitempty"`
	ReferenceNumber   *string  `json:"reference_number,omitempty"`
	TransactionDate   *string  `json:"transaction_date,omitempty"`
	TransactionTime   *string  `json:"transaction_time,omitempty"`
	TransactionType   *string  `json:"transaction_type,omitempty"`
	TransactionAmount *float64 `json:"transaction_amount,omitempty"`
}

func parseResponse(text string) (*ParsedTxn, error) {
	// Extract JSON from response (handle markdown code blocks if present)
	jsonStr := extractJSON(text)

	var jsonTxn ParsedTxnJSON
	err := json.Unmarshal([]byte(jsonStr), &jsonTxn)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	// Convert to ParsedTxn with proper types
	txn := &ParsedTxn{}

	if jsonTxn.Amount != nil {
		txn.Amount = *jsonTxn.Amount
	}
	txn.AccountNum = jsonTxn.AccountNum
	txn.CategoryId = jsonTxn.CategoryId
	txn.MerchantId = jsonTxn.MerchantId
	if jsonTxn.Type != nil {
		txn.Type = *jsonTxn.Type
	}
	txn.Description = jsonTxn.Description
	txn.Notes = jsonTxn.Notes
	txn.Tags = jsonTxn.Tags
	txn.PaymentMethod = jsonTxn.PaymentMethod
	txn.ReferenceNumber = jsonTxn.ReferenceNumber
	txn.TransactionType = jsonTxn.TransactionType
	txn.TransactionAmount = jsonTxn.TransactionAmount

	// Parse transaction_date (ISO 8601 date format: YYYY-MM-DD)
	if jsonTxn.TransactionDate != nil && *jsonTxn.TransactionDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *jsonTxn.TransactionDate)
		if err == nil {
			txn.TransactionDate = &parsedDate
		}
	}

	// Parse transaction_time (ISO 8601 datetime format: YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM:SSZ)
	if jsonTxn.TransactionTime != nil && *jsonTxn.TransactionTime != "" {
		// Try multiple ISO 8601 formats
		timeFormats := []string{
			"2006-01-02T15:04:05",
			"2006-01-02T15:04:05Z",
			"2006-01-02T15:04:05-07:00",
			"2006-01-02T15:04:05.000Z",
			"2006-01-02 15:04:05",
		}
		var parsedTime time.Time
		var parseErr error
		for _, format := range timeFormats {
			parsedTime, parseErr = time.Parse(format, *jsonTxn.TransactionTime)
			if parseErr == nil {
				txn.TransactionTime = &parsedTime
				break
			}
		}
	}

	return txn, nil
}

func extractJSON(text string) string {
	text = strings.TrimSpace(text)
	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimPrefix(text, "```")
	text = strings.TrimSuffix(text, "```")
	return strings.TrimSpace(text)
}
