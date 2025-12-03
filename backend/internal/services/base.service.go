package services

import (
	"fmt"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	aiservices "github.com/KaranMali2001/finance-tracker-v2-backend/internal/services/aiServices"

	"github.com/rs/zerolog"
)

type Services struct {
	EmailService  *EmailService
	GeminiService *aiservices.GeminiService
}

func NewServices(cfg *config.Config, logger *zerolog.Logger) (*Services, error) {
	fromEmail := cfg.Integration.ResendEmail
	if fromEmail == "" {
		fromEmail = "onboarding@resend.dev" // Default fallback to Resend's default email
	}
	emailService, err := NewEmailService(&cfg.Integration, logger, fromEmail)
	if err != nil {
		return nil, fmt.Errorf("failed to create email service: %w", err)
	}
	geminiService, err := aiservices.NewGeminiService(&cfg.AIConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini service: %w", err)
	}
	return &Services{
		EmailService:  emailService,
		GeminiService: geminiService,
	}, nil
}
