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

func (s *SmsRepository) GetSmses(c context.Context, payload *GetSmsesReq, clerkId string) ([]SmsLogs, error) {
	dbSmsLogs, err := s.q.GetSmses(c, clerkId)
	if err != nil {
		return nil, err
	}
	smsLogs := make([]SmsLogs, len(dbSmsLogs))
	for i, sms := range dbSmsLogs {
		smsLogs[i] = SmsLogs{
			Id:                 utils.UUIDToString(sms.ID),
			Sender:             sms.Sender,
			RawMessage:         sms.RawMessage,
			ReceivedAt:         sms.ReceivedAt.Time,
			ParsingStatus:      sms.ParsingStatus.String,
			ErrorMessage:       utils.TextToStringPtr(sms.ErrorMessage),
			RetryCount:         uint8(utils.Int4ToInt(sms.RetryCount)),
			LlmParsed:          sms.LlmParsed.Bool,
			LlmParsedAttempted: sms.LlmParseAttempted.Bool,
			LlmResponse:        utils.TextToStringPtr(sms.LlmResponse),
			CreatedAt:          sms.CreatedAt.Time,
			UpdatedAt:          sms.UpdatedAt.Time,
			LastRetryAt:        sms.LastRetryAt.Time,
		}
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
	return &SmsLogs{
		Id:                 utils.UUIDToString(sms.ID),
		Sender:             sms.Sender,
		RawMessage:         sms.RawMessage,
		ReceivedAt:         sms.ReceivedAt.Time,
		ParsingStatus:      sms.ParsingStatus.String,
		ErrorMessage:       utils.TextToStringPtr(sms.ErrorMessage),
		RetryCount:         uint8(utils.Int4ToInt(sms.RetryCount)),
		LlmParsed:          sms.LlmParsed.Bool,
		LlmParsedAttempted: sms.LlmParseAttempted.Bool,
		LlmResponse:        utils.TextToStringPtr(sms.LlmResponse),
		CreatedAt:          sms.CreatedAt.Time,
		UpdatedAt:          sms.UpdatedAt.Time,
		LastRetryAt:        sms.LastRetryAt.Time,
	}, nil
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
	return &SmsLogs{
		Id:                 utils.UUIDToString(sms.ID),
		Sender:             sms.Sender,
		RawMessage:         sms.RawMessage,
		ReceivedAt:         sms.ReceivedAt.Time,
		ParsingStatus:      sms.ParsingStatus.String,
		ErrorMessage:       utils.TextToStringPtr(sms.ErrorMessage),
		RetryCount:         uint8(utils.Int4ToInt(sms.RetryCount)),
		LlmParsed:          sms.LlmParsed.Bool,
		LlmParsedAttempted: sms.LlmParseAttempted.Bool,
		LlmResponse:        utils.TextToStringPtr(sms.LlmResponse),
		CreatedAt:          sms.CreatedAt.Time,
		UpdatedAt:          sms.UpdatedAt.Time,
		LastRetryAt:        sms.LastRetryAt.Time,
	}, nil
}
