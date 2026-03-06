package investment

import (
	"context"
	"encoding/json"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/tasks"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog"
)

type InvestmentService struct {
	r           investmentRepository
	taskService investmentTaskService
}

func NewInvestMentService(r investmentRepository, taskService investmentTaskService) *InvestmentService {
	return &InvestmentService{
		r:           r,
		taskService: taskService,
	}
}

// ── Goal methods ─────────────────────────────────────────────────────────────

func (s *InvestmentService) CreateNewGoal(c echo.Context, params *CreateGoalReq, clerkId string) (*Goal, error) {
	return s.r.CreateNewGoal(c.Request().Context(), params, clerkId)
}

func (s *InvestmentService) GetGoalsWithFilter(c echo.Context, params *GetGoalsWithFilter, clerkId string) ([]Goal, error) {
	return s.r.GetGoalsWithFilter(c.Request().Context(), params, clerkId)
}

func (s *InvestmentService) GetGoalById(c echo.Context, params *GetGoalById, clerkId string) (*Goal, error) {
	return s.r.GetGoalById(c.Request().Context(), params, clerkId)
}

func (s *InvestmentService) UpdateGoals(c echo.Context, params *UpdateGoals, clerkId string) (*Goal, error) {
	return s.r.UpdateGoal(c.Request().Context(), params.Id, clerkId, params)
}

func (s *InvestmentService) DeleteGoal(c echo.Context, params *DeleteGoalReq, clerkId string) error {
	return s.r.DeleteGoal(c.Request().Context(), params.Id, clerkId)
}

// ── GoalInvestment methods ───────────────────────────────────────────────────

func (s *InvestmentService) CreateGoalInvestment(c echo.Context, params *CreateGoalInvestmentReq, clerkID string) (*GoalInvestment, error) {
	return s.r.CreateGoalInvestment(c.Request().Context(), params, clerkID)
}

func (s *InvestmentService) GetGoalInvestments(c echo.Context, params *GetGoalInvestmentsReq, clerkID string) ([]GoalInvestment, error) {
	return s.r.GetGoalInvestments(c.Request().Context(), params, clerkID)
}

func (s *InvestmentService) GetGoalInvestmentById(c echo.Context, id uuid.UUID, clerkID string) (*GoalInvestment, error) {
	return s.r.GetGoalInvestmentById(c.Request().Context(), id, clerkID)
}

func (s *InvestmentService) UpdateGoalInvestment(c echo.Context, id uuid.UUID, clerkID string, params *UpdateGoalInvestmentReq) (*GoalInvestment, error) {
	return s.r.UpdateGoalInvestment(c.Request().Context(), id, clerkID, params)
}

func (s *InvestmentService) DeleteGoalInvestment(c echo.Context, id uuid.UUID, clerkID string) error {
	return s.r.DeleteGoalInvestment(c.Request().Context(), id, clerkID)
}

// ── GoalTransaction methods ──────────────────────────────────────────────────

func (s *InvestmentService) LinkTransaction(c echo.Context, params *LinkTransactionReq, clerkID string) (*GoalTransaction, error) {
	return s.r.LinkTransaction(c.Request().Context(), params, clerkID)
}

func (s *InvestmentService) UnlinkTransaction(c echo.Context, goalTransactionID uuid.UUID, clerkID string) error {
	return s.r.UnlinkTransaction(c.Request().Context(), goalTransactionID, clerkID)
}

func (s *InvestmentService) GetGoalTransactionsByInvestment(c echo.Context, investmentID uuid.UUID) ([]GoalTransaction, error) {
	return s.r.GetGoalTransactionsByInvestment(c.Request().Context(), investmentID)
}

func (s *InvestmentService) GetGoalTransactionsByGoal(c echo.Context, goalID uuid.UUID) ([]GoalTransaction, error) {
	return s.r.GetGoalTransactionsByGoal(c.Request().Context(), goalID)
}

// ── Auto-link job methods ────────────────────────────────────────────────────

// EnqueueAutoLink enqueues a background job to fuzzy-match the given transaction IDs
// against the user's active SIP rules. Always enqueues — never inlines.
func (s *InvestmentService) EnqueueAutoLink(c echo.Context, clerkID string, txnIDs []uuid.UUID) error {
	log := zerolog.Ctx(c.Request().Context())
	return s.enqueueAutoLinkCtx(c.Request().Context(), clerkID, txnIDs, log)
}

// EnqueueAutoLinkCtx is the context-based variant used by non-HTTP callers
// (e.g. CreateTxn service, reconciliation queue handler).
func (s *InvestmentService) EnqueueAutoLinkCtx(ctx context.Context, clerkID string, txnIDs []uuid.UUID, log *zerolog.Logger) error {
	return s.enqueueAutoLinkCtx(ctx, clerkID, txnIDs, log)
}

func (s *InvestmentService) enqueueAutoLinkCtx(ctx context.Context, clerkID string, txnIDs []uuid.UUID, log *zerolog.Logger) error {
	task, err := s.taskService.NewInvestmentAutoLinkTask(tasks.InvestmentAutoLinkPayload{
		UserID:         clerkID,
		TransactionIDs: txnIDs,
	})
	if err != nil {
		return err
	}
	return s.taskService.EnqueueTask(ctx, task, clerkID, log, jobs.JobTypeINVESTMENTAUTOLINK)
}

// RunAutoLinkJob is called by the Asynq worker handler.
func (s *InvestmentService) RunAutoLinkJob(ctx context.Context, payload InvestmentAutoLinkPayload, logger *zerolog.Logger) (*InvestmentAutoLinkResult, error) {
	result, err := s.r.AutoLinkTransactions(ctx, payload.UserID, payload.TransactionIDs)
	if err != nil {
		return nil, err
	}

	resultBytes, err := json.Marshal(result)
	if err != nil {
		logger.Warn().Err(err).Msg("[invest-autolink] failed to marshal result for logging")
	} else {
		logger.Info().
			RawJSON("result", resultBytes).
			Int("matched", result.Matched).
			Int("unmatched", result.Unmatched).
			Int("errors", result.Errors).
			Msg("[invest-autolink] job completed")
	}

	return result, nil
}
