package sms

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type SmsLogs struct {
	Id                 string    `json:"id,omitempty"`
	UserId             uuid.UUID `json:"user_id,omitempty"`
	Sender             string    `json:"sender,omitempty"`
	RawMessage         string    `json:"raw_message,omitempty"`
	ReceivedAt         time.Time `json:"received_at,omitempty"`
	ParsingStatus      string    `json:"parsing_status,omitempty"`
	ErrorMessage       *string   `json:"error_message,omitempty"`
	RetryCount         uint8     `json:"retry_count,omitempty"`
	LlmParsed          bool      `json:"llm_parsed,omitempty"`
	LlmParsedAttempted bool      `json:"llm_parsed_attempted,omitempty"`
	LlmResponse        *string   `json:"llm_response,omitempty"`
	CreatedAt          time.Time `json:"created_at,omitempty"`
	UpdatedAt          time.Time `json:"updated_at,omitempty"`
	LastRetryAt        time.Time `json:"last_retry_at,omitempty"`
}
type GetSmsByIdReq struct {
	SmsId uuid.UUID `param:"id" validate:"required"`
}
type CreateSmsReq struct {
	Sender     string    `json:"sender,omitempty"`
	RawMessage string    `json:"raw_message,omitempty"`
	ReceivedAt time.Time `json:"received_at,omitempty"`
}
type GetSmsesReq struct{}

func (u *GetSmsesReq) Validate() error {
	return nil
}

func (u *CreateSmsReq) Validate() error {
	return validator.New().Struct(u)
}

func (u *GetSmsByIdReq) Validate() error {
	return validator.New().Struct(u)
}
