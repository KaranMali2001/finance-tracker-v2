package services

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	"github.com/rs/zerolog"
)

type Services struct {
	EmailService *EmailService
}

func NewServices(cfg *config.Config, logger *zerolog.Logger) *Services {
	fromEmail := cfg.Integration.ResendEmail
	if fromEmail == "" {
		fromEmail = "onboarding@resend.dev" // Default fallback to Resend's default email
	}
	return &Services{
		EmailService: NewEmailService(&cfg.Integration, logger, fromEmail),
	}
}
