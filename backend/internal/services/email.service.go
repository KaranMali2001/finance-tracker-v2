package services

import (
	"context"
	"fmt"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	"github.com/rs/zerolog"

	"github.com/resend/resend-go/v2"
)

type EmailService struct {
	resendClient *resend.Client
	logger       zerolog.Logger
	fromEmail    string
}

func NewEmailService(cfg *config.IntegrationConfig, logger *zerolog.Logger, from string) *EmailService {
	return &EmailService{
		resendClient: resend.NewClient(cfg.ResendAPIKey),
		logger:       *logger,
		fromEmail:    from,
	}
}

type WelcomeEmailParams struct {
	UserEmail string
}

func (e *EmailService) SendWelcomeEmail(ctx context.Context, userEmail string) error {
	e.logger.Info().Str("sending email to user", userEmail)
	subject := "Welcome to Finance Tracker"
	htmlContent := e.buildWelcomeEmailHTML(userEmail)
	textContent := e.buildWelcomeEmailText(userEmail)
	emailParams := &resend.SendEmailRequest{
		From:    e.fromEmail,
		To:      []string{userEmail},
		Subject: subject,
		Html:    htmlContent,
		Text:    textContent,
	}
	sent, err := e.resendClient.Emails.Send(emailParams)
	if err != nil {
		e.logger.Error().Err(err).Msg("error while Sending email through Resend Client")
		return err
	}
	e.logger.Info().Str("Welcome email sent successfully and sent ID is", sent.Id)
	return nil
}
func (e *EmailService) buildWelcomeEmailHTML(userName string) string {
	name := "there"
	if userName != "" {
		name = userName
	}

	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Welcome to Finance Tracker</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #4CAF50;">Welcome to Finance Tracker!</h1>
	<p>Hi %s,</p>
	<p>Thank you for joining Finance Tracker! We're excited to help you manage your finances effectively.</p>
	<p>Get started by:</p>
	<ul>
		<li>Adding your first account</li>
		<li>Tracking your income and expenses</li>
		<li>Setting up your financial goals</li>
	</ul>
	<p>If you have any questions, feel free to reach out to our support team.</p>
	<p>Best regards,<br>The Finance Tracker Team</p>
</body>
</html>
`, name)
}

func (e *EmailService) buildWelcomeEmailText(userName string) string {
	name := "there"
	if userName != "" {
		name = userName
	}

	return fmt.Sprintf(`
Welcome to Finance Tracker!

Hi %s,

Thank you for joining Finance Tracker! We're excited to help you manage your finances effectively.

Get started by:
- Adding your first account
- Tracking your income and expenses
- Setting up your financial goals

If you have any questions, feel free to reach out to our support team.

Best regards,
The Finance Tracker Team
`, name)
}
