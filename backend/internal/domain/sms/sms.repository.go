package sms

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type SmsRepository struct {
	q  smsQuerier
	aq accountQuerier
}

func NewSmsRepository(q smsQuerier, aq accountQuerier) *SmsRepository {
	return &SmsRepository{q: q, aq: aq}
}

func SmsFromDB(s generated.SmsLog) *SmsLogs {
	return &SmsLogs{
		Id:                 utils.UUIDToString(s.ID),
		Sender:             s.Sender,
		RawMessage:         s.RawMessage,
		ReceivedAt:         s.ReceivedAt.Time,
		ParsingStatus:      s.ParsingStatus.String,
		ErrorMessage:       utils.TextToStringPtr(s.ErrorMessage),
		RetryCount:         uint8(utils.Int4ToInt(s.RetryCount)),
		LlmParsed:          s.LlmParsed.Bool,
		LlmParsedAttempted: s.LlmParseAttempted.Bool,
		LlmResponse:        utils.TextToStringPtr(s.LlmResponse),
		CreatedAt:          s.CreatedAt.Time,
		UpdatedAt:          s.UpdatedAt.Time,
		LastRetryAt:        s.LastRetryAt.Time,
	}
}

func (s *SmsRepository) GetSmses(c context.Context, payload *GetSmsesReq, clerkId string) ([]SmsLogs, error) {
	dbSmsLogs, err := s.q.GetSmses(c, clerkId)
	if err != nil {
		return nil, err
	}
	smsLogs := make([]SmsLogs, len(dbSmsLogs))
	for i, sms := range dbSmsLogs {
		smsLogs[i] = *SmsFromDB(sms)
	}
	return smsLogs, nil
}

func (s *SmsRepository) GetSmsById(c context.Context, payload *GetSmsByIdReq, clerkId string) (*SmsLogs, error) {
	params := generated.GetSmsByIdParams{
		ID:     utils.UUIDToPgtype(payload.SmsId),
		UserID: clerkId,
	}
	sms, err := s.q.GetSmsById(c, params)
	if err != nil {
		return nil, err
	}
	return SmsFromDB(sms), nil
}

func (s *SmsRepository) DeleteSms(c context.Context, payload *DeleteSmsReq, clerkId string) error {
	params := generated.DeleteSmsParams{
		UserID: clerkId,
		ID:     utils.UUIDToPgtype(payload.SmsId),
	}
	return s.q.DeleteSms(c, params)
}

func (s *SmsRepository) CreateSms(c context.Context, payload *CreateSmsReq, clerkId string) (*SmsLogs, error) {
	params := generated.CreateSmsParams{
		UserID:     clerkId,
		Sender:     payload.Sender,
		RawMessage: payload.RawMessage,
		ReceivedAt: utils.TimestampToPgtype(payload.ReceivedAt),
	}
	sms, err := s.q.CreateSms(c, params)
	if err != nil {
		return nil, err
	}
	return SmsFromDB(sms), nil
}

func (s *SmsRepository) GetAccountIdByNumber(ctx context.Context, clerkId, accountNumber string) (*uuid.UUID, error) {
	acc, err := s.aq.GetAccountByNumber(ctx, generated.GetAccountByNumberParams{
		UserID:        clerkId,
		AccountNumber: accountNumber,
	})
	if err != nil {
		return nil, err
	}
	id := utils.UUIDToUUID(acc.ID)
	return &id, nil
}

func (s *SmsRepository) UpdateSmsParsingStatus(ctx context.Context, smsID uuid.UUID, status string, errMsg *string) (*SmsLogs, error) {
	sms, err := s.q.UpdateSmsParsingStatus(ctx, generated.UpdateSmsParsingStatusParams{
		ID:            utils.UUIDToPgtype(smsID),
		ParsingStatus: pgtype.Text{String: status, Valid: true},
		ErrorMessage:  utils.StringPtrToText(errMsg),
	})
	if err != nil {
		return nil, err
	}
	return SmsFromDB(sms), nil
}
