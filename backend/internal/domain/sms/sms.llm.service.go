package sms

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/transaction"
	aiservices "github.com/KaranMali2001/finance-tracker-v2-backend/internal/services/aiServices"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rs/zerolog"
)

// llmSmsQuerier is the narrow slice of generated.Queries the LLM service needs.
type llmSmsQuerier interface {
	GetSmsById(ctx context.Context, arg generated.GetSmsByIdParams) (generated.SmsLog, error)
	UpdateSmsLlmResult(ctx context.Context, arg generated.UpdateSmsLlmResultParams) (generated.SmsLog, error)
	GetAccountByNumber(ctx context.Context, arg generated.GetAccountByNumberParams) (generated.Account, error)
}

// geminiSmsParser is satisfied by *aiservices.GeminiService.
type geminiSmsParser interface {
	ParseSmsTxn(ctx context.Context, rawSms string, log *zerolog.Logger) (*aiservices.ParsedTxn, error)
}

// smsTxnCreatorCtx is a context-based variant for use outside echo handlers.
type smsTxnCreatorCtx interface {
	CreateTxnCtx(ctx context.Context, payload *transaction.CreateTxnReq, clerkId string) (*transaction.Transaction, error)
}

// SmsLlmService runs the LLM fallback parse flow for a failed SMS log.
type SmsLlmService struct {
	q      llmSmsQuerier
	gemini geminiSmsParser
	txnSvc smsTxnCreatorCtx
}

func NewSmsLlmService(q llmSmsQuerier, gemini geminiSmsParser, txnSvc smsTxnCreatorCtx) *SmsLlmService {
	return &SmsLlmService{q: q, gemini: gemini, txnSvc: txnSvc}
}

func (s *SmsLlmService) RunLlmParse(ctx context.Context, smsID uuid.UUID, clerkID string, log *zerolog.Logger) error {
	smsLog, err := s.q.GetSmsById(ctx, generated.GetSmsByIdParams{
		ID:     utils.UUIDToPgtype(smsID),
		UserID: clerkID,
	})
	if err != nil {
		return fmt.Errorf("sms not found: %w", err)
	}

	_, err = s.q.UpdateSmsLlmResult(ctx, generated.UpdateSmsLlmResultParams{
		ID:                utils.UUIDToPgtype(smsID),
		LlmParseAttempted: pgtype.Bool{Bool: true, Valid: true},
		LlmParsed:         pgtype.Bool{Bool: false, Valid: true},
		LlmResponse:       pgtype.Text{},
		ParsingStatus:     pgtype.Text{String: "llm_processing", Valid: true},
		ErrorMessage:      pgtype.Text{},
	})
	if err != nil {
		log.Error().Err(err).Msg("[sms-llm] failed to mark llm_processing")
	}

	parsed, err := s.gemini.ParseSmsTxn(ctx, smsLog.RawMessage, log)
	if err != nil {
		errMsg := err.Error()
		_, _ = s.q.UpdateSmsLlmResult(ctx, generated.UpdateSmsLlmResultParams{
			ID:                utils.UUIDToPgtype(smsID),
			LlmParseAttempted: pgtype.Bool{Bool: true, Valid: true},
			LlmParsed:         pgtype.Bool{Bool: false, Valid: true},
			ParsingStatus:     pgtype.Text{String: "llm_failed", Valid: true},
			ErrorMessage:      pgtype.Text{String: errMsg, Valid: true},
		})
		return fmt.Errorf("gemini parse failed: %w", err)
	}

	responseBytes, _ := json.Marshal(parsed)
	responseStr := string(responseBytes)

	if parsed.Amount == 0 || parsed.AccountNum == nil {
		_, _ = s.q.UpdateSmsLlmResult(ctx, generated.UpdateSmsLlmResultParams{
			ID:                utils.UUIDToPgtype(smsID),
			LlmParseAttempted: pgtype.Bool{Bool: true, Valid: true},
			LlmParsed:         pgtype.Bool{Bool: false, Valid: true},
			LlmResponse:       pgtype.Text{String: responseStr, Valid: true},
			ParsingStatus:     pgtype.Text{String: "llm_failed", Valid: true},
			ErrorMessage:      pgtype.Text{String: "missing required fields: amount or account_number", Valid: true},
		})
		return nil
	}

	acc, err := s.q.GetAccountByNumber(ctx, generated.GetAccountByNumberParams{
		UserID:        clerkID,
		AccountNumber: *parsed.AccountNum,
	})
	if err != nil {
		_, _ = s.q.UpdateSmsLlmResult(ctx, generated.UpdateSmsLlmResultParams{
			ID:                utils.UUIDToPgtype(smsID),
			LlmParseAttempted: pgtype.Bool{Bool: true, Valid: true},
			LlmParsed:         pgtype.Bool{Bool: true, Valid: true},
			LlmResponse:       pgtype.Text{String: responseStr, Valid: true},
			ParsingStatus:     pgtype.Text{String: "llm_success_no_account", Valid: true},
		})
		log.Warn().Str("account_number", *parsed.AccountNum).Msg("[sms-llm] account not found, skipping transaction")
		return nil
	}

	accountID := utils.UUIDToUUID(acc.ID)
	txnType := transaction.TxnTypeDebit
	if parsed.Type == "CREDIT" {
		txnType = transaction.TxnTypeCredit
	}

	if _, err := s.txnSvc.CreateTxnCtx(ctx, &transaction.CreateTxnReq{
		AccountId:       accountID,
		Type:            txnType,
		Amount:          parsed.Amount,
		Description:     parsed.Description,
		ReferenceNumber: parsed.ReferenceNumber,
		SmsId:           &smsID,
	}, clerkID); err != nil {
		log.Error().Err(err).Msg("[sms-llm] failed to create transaction")
	}

	_, _ = s.q.UpdateSmsLlmResult(ctx, generated.UpdateSmsLlmResultParams{
		ID:                utils.UUIDToPgtype(smsID),
		LlmParseAttempted: pgtype.Bool{Bool: true, Valid: true},
		LlmParsed:         pgtype.Bool{Bool: true, Valid: true},
		LlmResponse:       pgtype.Text{String: responseStr, Valid: true},
		ParsingStatus:     pgtype.Text{String: "llm_success", Valid: true},
	})

	log.Info().Str("sms_id", smsID.String()).Msg("[sms-llm] successfully parsed and created transaction")
	return nil
}
