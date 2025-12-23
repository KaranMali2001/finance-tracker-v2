package sms

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
)

type SmsRepository struct {
	s *server.Server
	q *generated.Queries
}

func NewSmsRepository(s *server.Server, q *generated.Queries) *SmsRepository {
	return &SmsRepository{
		s: s,
		q: q,
	}
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
