package services

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"html/template"
	"strings"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	"github.com/rs/zerolog"

	"github.com/resend/resend-go/v2"
)

//go:embed templates/welcome.html
var welcomeEmailTemplate string

type EmailService struct {
	resendClient *resend.Client
	logger       zerolog.Logger
	fromEmail    string
	welcomeTmpl  *template.Template
}

type WelcomeEmailData struct {
	UserName string
	Year     int
}

func NewEmailService(cfg *config.IntegrationConfig, logger *zerolog.Logger, from string) (*EmailService, error) {
	tmpl, err := template.New("welcome").Parse(welcomeEmailTemplate)
	if err != nil {
		return nil, fmt.Errorf("failed to parse welcome email template: %w", err)
	}

	return &EmailService{
		resendClient: resend.NewClient(cfg.ResendAPIKey),
		logger:       *logger,
		fromEmail:    from,
		welcomeTmpl:  tmpl,
	}, nil
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
func (e *EmailService) buildWelcomeEmailHTML(userEmail string) string {
	// Extract name from email (part before @) or use a friendly default
	userName := "there"
	if userEmail != "" {
		parts := strings.Split(userEmail, "@")
		if len(parts) > 0 && parts[0] != "" {
			// Capitalize first letter
			name := strings.ToLower(parts[0])
			if len(name) > 0 {
				userName = strings.ToUpper(string(name[0])) + name[1:]
			}
		}
	}

	data := WelcomeEmailData{
		UserName: userName,
		Year:     time.Now().Year(),
	}

	var buf bytes.Buffer
	if err := e.welcomeTmpl.Execute(&buf, data); err != nil {
		e.logger.Error().Err(err).Msg("failed to execute welcome email template")
		// Fallback to simple HTML if template fails
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
`, userName)
	}

	return buf.String()
}

func (e *EmailService) buildWelcomeEmailText(userEmail string) string {
	// Extract name from email (part before @) or use a friendly default
	userName := "there"
	if userEmail != "" {
		parts := strings.Split(userEmail, "@")
		if len(parts) > 0 && parts[0] != "" {
			// Capitalize first letter
			name := strings.ToLower(parts[0])
			if len(name) > 0 {
				userName = strings.ToUpper(string(name[0])) + name[1:]
			}
		}
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
`, userName)
}
