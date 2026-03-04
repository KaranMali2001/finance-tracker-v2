package sms

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/transaction"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// smsQuerier is the narrow slice of generated.Queries that SmsRepository needs.
type smsQuerier interface {
	GetSmses(ctx context.Context, userID string) ([]generated.SmsLog, error)
	GetSmsById(ctx context.Context, arg generated.GetSmsByIdParams) (generated.SmsLog, error)
	DeleteSms(ctx context.Context, arg generated.DeleteSmsParams) error
	CreateSms(ctx context.Context, arg generated.CreateSmsParams) (generated.SmsLog, error)
	UpdateSmsParsingStatus(ctx context.Context, arg generated.UpdateSmsParsingStatusParams) (generated.SmsLog, error)
}

// accountQuerier is the narrow slice of generated.Queries that SmsRepository needs for account lookup.
type accountQuerier interface {
	GetAccountByNumber(ctx context.Context, arg generated.GetAccountByNumberParams) (generated.Account, error)
}

// smsRepository is the interface SmsService depends on.
type smsRepository interface {
	GetSmses(ctx context.Context, payload *GetSmsesReq, clerkId string) ([]SmsLogs, error)
	GetSmsById(ctx context.Context, payload *GetSmsByIdReq, clerkId string) (*SmsLogs, error)
	DeleteSms(ctx context.Context, payload *DeleteSmsReq, clerkId string) error
	CreateSms(ctx context.Context, payload *CreateSmsReq, clerkId string) (*SmsLogs, error)
	GetAccountIdByNumber(ctx context.Context, clerkId, accountNumber string) (*uuid.UUID, error)
	UpdateSmsParsingStatus(ctx context.Context, smsID uuid.UUID, status string, errMsg *string) (*SmsLogs, error)
}

// smsTxnCreator is the subset of transaction.TxnService used by SmsService.
type smsTxnCreator interface {
	CreateTxn(c echo.Context, payload *transaction.CreateTxnReq, clerkId string) (*transaction.Transaction, error)
}

// smsLlmTaskEnqueuer is the subset of tasks.TaskService used by SmsService.
type smsLlmTaskEnqueuer interface {
	EnqueueLlmSmsParse(ctx context.Context, smsID uuid.UUID, clerkID string) error
}

// smsUserProvider is the subset of user.UserService needed by the SMS module for device auth.
type smsUserProvider interface {
	GetUseLlmParsing(ctx context.Context, clerkId string) (bool, error)
	GetClerkIdByApiKey(c echo.Context, apiKey string) (string, error)
}

// Compile-time checks.
var (
	_ smsQuerier     = (*generated.Queries)(nil)
	_ accountQuerier = (*generated.Queries)(nil)
)
