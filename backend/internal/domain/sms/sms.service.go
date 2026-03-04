package sms

import (
	"errors"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/transaction"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
)

type SmsService struct {
	r          smsRepository
	txnSvc     smsTxnCreator
	llmTaskSvc smsLlmTaskEnqueuer
	userSvc    smsUserProvider
}

func NewSmsService(r smsRepository, txnSvc smsTxnCreator, llmTaskSvc smsLlmTaskEnqueuer, userSvc smsUserProvider) *SmsService {
	return &SmsService{r: r, txnSvc: txnSvc, llmTaskSvc: llmTaskSvc, userSvc: userSvc}
}

func (s *SmsService) GetSmses(c echo.Context, payload *GetSmsesReq, clerkId string) ([]SmsLogs, error) {
	return s.r.GetSmses(c.Request().Context(), payload, clerkId)
}

func (s *SmsService) GetSmsById(c echo.Context, payload *GetSmsByIdReq, clerkId string) (*SmsLogs, error) {
	return s.r.GetSmsById(c.Request().Context(), payload, clerkId)
}

func (s *SmsService) DeleteSms(c echo.Context, payload *DeleteSmsReq, clerkId string) error {
	return s.r.DeleteSms(c.Request().Context(), payload, clerkId)
}

func (s *SmsService) CreateSms(c echo.Context, payload *CreateSmsReq, clerkId string) (*SmsLogs, error) {
	log := middleware.GetLogger(c)
	ctx := c.Request().Context()

	smsLog, err := s.r.CreateSms(ctx, payload, clerkId)
	if err != nil {
		return nil, err
	}

	if payload.ParseStatus == "success" && payload.Amount != nil && payload.AccountNumber != nil {
		accountID, err := s.r.GetAccountIdByNumber(ctx, clerkId, *payload.AccountNumber)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				log.Warn().Str("account_number", *payload.AccountNumber).Msg("[sms] account not found, skipping transaction creation")
				return smsLog, nil
			}
			log.Error().Err(err).Msg("[sms] failed to look up account by number")
			return smsLog, nil
		}

		smsID, _ := uuid.Parse(smsLog.Id)
		txnType := transaction.TxnTypeDebit
		if payload.TransactionType != nil && *payload.TransactionType == "credit" {
			txnType = transaction.TxnTypeCredit
		}

		txnReq := &transaction.CreateTxnReq{
			AccountId:       *accountID,
			Type:            txnType,
			Amount:          *payload.Amount,
			ReferenceNumber: payload.ReferenceNumber,
			Description:     payload.Merchant,
			SmsId:           &smsID,
			TransactionDate: &payload.ReceivedAt,
		}
		if _, err := s.txnSvc.CreateTxn(c, txnReq, clerkId); err != nil {
			log.Error().Err(err).Msg("[sms] failed to create transaction from SMS")
			return smsLog, nil
		}
		if updated, err := s.r.UpdateSmsParsingStatus(ctx, smsID, "success", nil); err != nil {
			log.Error().Err(err).Msg("[sms] failed to mark parsing_status=success")
		} else {
			smsLog = updated
		}
		return smsLog, nil
	}

	if payload.ParseStatus == "failed" {
		smsID, err := uuid.Parse(smsLog.Id)
		if err != nil {
			return smsLog, nil
		}
		failedStatus := "failed"
		if updated, err := s.r.UpdateSmsParsingStatus(ctx, smsID, failedStatus, nil); err != nil {
			log.Error().Err(err).Msg("[sms] failed to mark parsing_status=failed")
		} else {
			smsLog = updated
		}
		if s.llmTaskSvc != nil && s.userSvc != nil {
			useLlm, err := s.userSvc.GetUseLlmParsing(ctx, clerkId)
			if err != nil {
				log.Error().Err(err).Msg("[sms] failed to fetch use_llm_parsing flag")
			} else if useLlm {
				if err := s.llmTaskSvc.EnqueueLlmSmsParse(ctx, smsID, clerkId); err != nil {
					log.Error().Err(err).Msg("[sms] failed to enqueue LLM parse task")
				}
			}
		}
	}

	return smsLog, nil
}
