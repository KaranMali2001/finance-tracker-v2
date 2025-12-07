package sms

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type SmsService struct {
	server *server.Server
	r      *SmsRepository
}

func NewSmsService(s *server.Server, r *SmsRepository) *SmsService {
	return &SmsService{
		server: s,
		r:      r,
	}
}

func (s *SmsService) GetSmses(c echo.Context, payload *GetSmsesReq, clerkId string) ([]SmsLogs, error) {
	return s.r.GetSmses(c.Request().Context(), payload, clerkId)
}

func (s *SmsService) GetSmsById(c echo.Context, payload *GetSmsByIdReq, clerkId string) (*SmsLogs, error) {
	return s.r.GetSmsById(c.Request().Context(), payload, clerkId)
}

func (s *SmsService) CreateSms(c echo.Context, payload *CreateSmsReq, clerkId string) (*SmsLogs, error) {
	return s.r.CreateSms(c.Request().Context(), payload, clerkId)
}
