package sms

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
)

// smsQuerier is the narrow slice of generated.Queries that SmsRepository needs.
type smsQuerier interface {
	GetSmses(ctx context.Context, userID string) ([]generated.SmsLog, error)
	GetSmsById(ctx context.Context, arg generated.GetSmsByIdParams) (generated.SmsLog, error)
	DeleteSms(ctx context.Context, arg generated.DeleteSmsParams) error
	CreateSms(ctx context.Context, arg generated.CreateSmsParams) (generated.SmsLog, error)
}

// smsRepository is the interface SmsService depends on.
type smsRepository interface {
	GetSmses(ctx context.Context, payload *GetSmsesReq, clerkId string) ([]SmsLogs, error)
	GetSmsById(ctx context.Context, payload *GetSmsByIdReq, clerkId string) (*SmsLogs, error)
	DeleteSms(ctx context.Context, payload *DeleteSmsReq, clerkId string) error
	CreateSms(ctx context.Context, payload *CreateSmsReq, clerkId string) (*SmsLogs, error)
}

// Compile-time check: *generated.Queries must satisfy smsQuerier.
var _ smsQuerier = (*generated.Queries)(nil)
