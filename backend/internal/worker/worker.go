package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/dispatcher"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/investment"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/tasks"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

type emailSender interface {
	SendWelcomeEmail(ctx context.Context, email string) error
}

type reconRunner interface {
	RunReconciliationJob(ctx context.Context, payload tasks.BankReconciliationPayload, log *zerolog.Logger) ([]uuid.UUID, error)
}

type investRunner interface {
	RunAutoLinkJob(ctx context.Context, payload investment.InvestmentAutoLinkPayload, logger *zerolog.Logger) (*investment.InvestmentAutoLinkResult, error)
	EnqueueAutoLinkCtx(ctx context.Context, clerkID string, txnIDs []uuid.UUID, log *zerolog.Logger) error
}

type smsLlmRunner interface {
	RunLlmParse(ctx context.Context, smsID uuid.UUID, clerkID string, log *zerolog.Logger) error
}

type Worker struct {
	jobRepo       *jobs.JobRepository
	emailSvc      emailSender
	reconService  reconRunner
	investService investRunner
	smsLlmSvc     smsLlmRunner
	logger        *zerolog.Logger
}

type Deps struct {
	JobRepo       *jobs.JobRepository
	EmailSvc      emailSender
	ReconService  reconRunner
	InvestService investRunner
	SmsLlmSvc     smsLlmRunner
	Logger        *zerolog.Logger
}

func New(deps Deps) *Worker {
	return &Worker{
		jobRepo:       deps.JobRepo,
		emailSvc:      deps.EmailSvc,
		reconService:  deps.ReconService,
		investService: deps.InvestService,
		smsLlmSvc:     deps.SmsLlmSvc,
		logger:        deps.Logger,
	}
}

func (w *Worker) Handle(ctx context.Context, event dispatcher.JobPayload) error {
	switch event.Type {
	case string(tasks.TaskPing):
		w.logger.Info().Msg("[ping] worker is alive — pong")
		return nil
	case string(tasks.TaskWelcomeEmail):
		return w.handleWelcomeEmail(ctx, event.Payload)
	case string(tasks.TaskBankReconciliation):
		return w.handleBankReconciliation(ctx, event.Payload)
	case string(tasks.TaskInvestmentAutoLink):
		return w.handleInvestmentAutoLink(ctx, event.Payload)
	case string(tasks.TaskLlmSmsParse):
		return w.handleLlmSmsParse(ctx, event.Payload)
	}
	return fmt.Errorf("unknown job type: %s", event.Type)
}

func (w *Worker) markProcessing(ctx context.Context, jobID string) *jobs.Job {
	job, err := w.jobRepo.GetJobById(ctx, jobID)
	if err != nil {
		w.logger.Error().Err(err).Str("job_id", jobID).Msg("job not found in DB")
		return nil
	}
	status := jobs.JobStatusProcessing
	attempt := job.Attempts + 1
	_, _ = w.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
		ID:       job.ID,
		Status:   &status,
		Attempts: &attempt,
	})
	return job
}

func (w *Worker) markFailed(ctx context.Context, job *jobs.Job, errMsg string) {
	if job == nil {
		return
	}
	status := jobs.JobStatusFailed
	finishedAt := time.Now()
	_, _ = w.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
		ID:         job.ID,
		Status:     &status,
		LastError:  &errMsg,
		FinishedAt: &finishedAt,
	})
}

func (w *Worker) markCompleted(ctx context.Context, job *jobs.Job, result string) {
	if job == nil {
		return
	}
	status := jobs.JobStatusCompleted
	finishedAt := time.Now()
	_, _ = w.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
		ID:         job.ID,
		Status:     &status,
		Result:     &result,
		FinishedAt: &finishedAt,
	})
}

func (w *Worker) handleWelcomeEmail(ctx context.Context, raw json.RawMessage) error {
	var payload tasks.WelcomeEmailPayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal welcome email payload: %w", err)
	}

	job := w.markProcessing(ctx, payload.JobID)

	w.logger.Info().Str("email", payload.UserEmail).Msg("[email] sending welcome email")

	if err := w.emailSvc.SendWelcomeEmail(ctx, payload.UserEmail); err != nil {
		w.markFailed(ctx, job, err.Error())
		return err
	}

	w.markCompleted(ctx, job, fmt.Sprintf("Email sent successfully to %s", payload.UserEmail))
	return nil
}

func (w *Worker) handleBankReconciliation(ctx context.Context, raw json.RawMessage) error {
	var payload tasks.BankReconciliationPayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal reconciliation payload: %w", err)
	}

	job := w.markProcessing(ctx, payload.JobID)

	w.logger.Info().
		Str("upload_id", payload.UploadID.String()).
		Str("account_id", payload.AccountID.String()).
		Int("threshold", payload.ReconciliationThreshold).
		Msg("[recon] starting reconciliation job")

	createdIDs, err := w.reconService.RunReconciliationJob(ctx, payload, w.logger)
	if err != nil {
		w.markFailed(ctx, job, err.Error())
		w.logger.Error().Err(err).Str("upload_id", payload.UploadID.String()).Msg("[recon] job failed")
		return err
	}

	w.markCompleted(ctx, job, fmt.Sprintf("Reconciliation completed for upload %s", payload.UploadID.String()))

	if len(createdIDs) > 0 {
		if err := w.investService.EnqueueAutoLinkCtx(ctx, payload.UserID, createdIDs, w.logger); err != nil {
			w.logger.Error().Err(err).Str("upload_id", payload.UploadID.String()).Msg("[recon] failed to enqueue auto-link")
		}
	}

	w.logger.Info().Str("upload_id", payload.UploadID.String()).Msg("[recon] job completed")
	return nil
}

func (w *Worker) handleInvestmentAutoLink(ctx context.Context, raw json.RawMessage) error {
	var payload tasks.InvestmentAutoLinkPayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal investment auto-link payload: %w", err)
	}

	job := w.markProcessing(ctx, payload.JobID)

	domainPayload := investment.InvestmentAutoLinkPayload{
		UserID:         payload.UserID,
		TransactionIDs: payload.TransactionIDs,
	}

	result, err := w.investService.RunAutoLinkJob(ctx, domainPayload, w.logger)
	if err != nil {
		w.markFailed(ctx, job, err.Error())
		w.logger.Error().Err(err).Str("user_id", payload.UserID).Msg("[invest-autolink] job failed")
		return err
	}

	resultBytes, _ := json.Marshal(result)
	w.markCompleted(ctx, job, string(resultBytes))

	w.logger.Info().
		Str("user_id", payload.UserID).
		Int("matched", result.Matched).
		Int("unmatched", result.Unmatched).
		Int("errors", result.Errors).
		Msg("[invest-autolink] job completed")
	return nil
}

func (w *Worker) handleLlmSmsParse(ctx context.Context, raw json.RawMessage) error {
	var payload tasks.LlmSmsParsePayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal LLM SMS parse payload: %w", err)
	}

	w.logger.Info().Str("sms_id", payload.SmsID.String()).Str("user_id", payload.UserID).Msg("[sms-llm] starting LLM parse")

	if err := w.smsLlmSvc.RunLlmParse(ctx, payload.SmsID, payload.UserID, w.logger); err != nil {
		w.logger.Error().Err(err).Str("sms_id", payload.SmsID.String()).Msg("[sms-llm] LLM parse failed")
		return err
	}
	return nil
}
