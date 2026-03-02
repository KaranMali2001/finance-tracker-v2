package investment

import (
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type InvestmentHandler struct {
	server  *server.Server
	base    handler.Handler
	service *InvestmentService
}

func NewInvestmentHandler(s *server.Server, service *InvestmentService) *InvestmentHandler {
	return &InvestmentHandler{
		server:  s,
		base:    handler.NewHandler(),
		service: service,
	}
}

// ── Goal handlers ─────────────────────────────────────────────────────────────

// CreateNewGoal godoc
// @Summary Create a new investment goal
// @Description Creates a new investment goal for the authenticated user
// @Tags Investment
// @Accept json
// @Produce json
// @Param goal body CreateGoalReq true "Goal creation request"
// @Success 201 {object} Goal
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/goal [post]
func (h *InvestmentHandler) CreateNewGoal(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *CreateGoalReq) (*Goal, error) {
			return h.service.CreateNewGoal(c, payload, middleware.GetUserID(c))
		}, http.StatusCreated, &CreateGoalReq{},
	)(c)
}

// GetGoalsWithFilter godoc
// @Summary List investment goals with optional filters
// @Description Retrieves investment goals for the authenticated user
// @Tags Investment
// @Produce json
// @Param status query string false "Goal status"
// @Param target_date_before query string false "Target date before (YYYY-MM-DD)"
// @Param target_date_after query string false "Target date after (YYYY-MM-DD)"
// @Param target_amount_less_than query number false "Target amount less than"
// @Param target_amount_greater_than query number false "Target amount greater than"
// @Param priority query integer false "Priority level"
// @Param created_at_after query string false "Created at after (ISO 8601)"
// @Success 200 {array} Goal
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/goal [get]
func (h *InvestmentHandler) GetGoalsWithFilter(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetGoalsWithFilter) ([]Goal, error) {
			return h.service.GetGoalsWithFilter(c, payload, middleware.GetUserID(c))
		}, http.StatusOK, &GetGoalsWithFilter{},
	)(c)
}

// GetGoalById godoc
// @Summary Get investment goal by ID
// @Description Retrieves a specific investment goal by ID
// @Tags Investment
// @Produce json
// @Param id path string true "Goal ID" format(uuid)
// @Success 200 {object} Goal
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/goal/{id} [get]
func (h *InvestmentHandler) GetGoalById(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetGoalById) (*Goal, error) {
			return h.service.GetGoalById(c, payload, middleware.GetUserID(c))
		}, http.StatusOK, &GetGoalById{},
	)(c)
}

// UpdateGoals godoc
// @Summary Update an investment goal
// @Description Updates an existing investment goal
// @Tags Investment
// @Accept json
// @Produce json
// @Param id path string true "Goal ID" format(uuid)
// @Param goal body UpdateGoals true "Goal update request"
// @Success 200 {object} Goal
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/goal/{id} [put]
func (h *InvestmentHandler) UpdateGoals(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *UpdateGoals) (*Goal, error) {
			return h.service.UpdateGoals(c, payload, middleware.GetUserID(c))
		}, http.StatusOK, &UpdateGoals{},
	)(c)
}

// DeleteGoal godoc
// @Summary Delete an investment goal
// @Description Deletes an investment goal by ID
// @Tags Investment
// @Param id path string true "Goal ID" format(uuid)
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/goal/{id} [delete]
func (h *InvestmentHandler) DeleteGoal(c echo.Context) error {
	return handler.HandleNoContent(
		h.base,
		func(c echo.Context, payload *DeleteGoalReq) error {
			return h.service.DeleteGoal(c, payload, middleware.GetUserID(c))
		}, http.StatusNoContent, &DeleteGoalReq{},
	)(c)
}

// CreateGoalInvestment godoc
// @Summary Create a goal investment rule
// @Description Creates a new investment rule (one-time or SIP) optionally linked to a goal
// @Tags Investment
// @Accept json
// @Produce json
// @Param investment body CreateGoalInvestmentReq true "Investment rule"
// @Success 201 {object} GoalInvestment
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/rule [post]
func (h *InvestmentHandler) CreateGoalInvestment(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *CreateGoalInvestmentReq) (*GoalInvestment, error) {
			return h.service.CreateGoalInvestment(c, payload, middleware.GetUserID(c))
		}, http.StatusCreated, &CreateGoalInvestmentReq{},
	)(c)
}

// GetGoalInvestments godoc
// @Summary List investment rules
// @Description Lists investment rules for the authenticated user with optional filters
// @Tags Investment
// @Produce json
// @Param goal_id query string false "Filter by goal ID" format(uuid)
// @Param contribution_type query string false "Filter by contribution type (one_time|sip)"
// @Param investment_type query string false "Filter by investment type"
// @Success 200 {array} GoalInvestment
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/rule [get]
func (h *InvestmentHandler) GetGoalInvestments(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetGoalInvestmentsReq) ([]GoalInvestment, error) {
			return h.service.GetGoalInvestments(c, payload, middleware.GetUserID(c))
		}, http.StatusOK, &GetGoalInvestmentsReq{},
	)(c)
}

// GetGoalInvestmentById godoc
// @Summary Get investment rule by ID
// @Description Returns a single investment rule
// @Tags Investment
// @Produce json
// @Param id path string true "Investment rule ID" format(uuid)
// @Success 200 {object} GoalInvestment
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/rule/{id} [get]
func (h *InvestmentHandler) GetGoalInvestmentById(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetGoalInvestmentByIDReq) (*GoalInvestment, error) {
			return h.service.GetGoalInvestmentById(c, payload.ID, middleware.GetUserID(c))
		}, http.StatusOK, &GetGoalInvestmentByIDReq{},
	)(c)
}

// UpdateGoalInvestment godoc
// @Summary Update an investment rule
// @Description Updates an existing investment rule
// @Tags Investment
// @Accept json
// @Produce json
// @Param id path string true "Investment rule ID" format(uuid)
// @Param investment body UpdateGoalInvestmentReq true "Investment update"
// @Success 200 {object} GoalInvestment
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/rule/{id} [put]
func (h *InvestmentHandler) UpdateGoalInvestment(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *UpdateGoalInvestmentReq) (*GoalInvestment, error) {
			return h.service.UpdateGoalInvestment(c, payload.ID, middleware.GetUserID(c), payload)
		}, http.StatusOK, &UpdateGoalInvestmentReq{},
	)(c)
}

// DeleteGoalInvestment godoc
// @Summary Delete an investment rule
// @Description Deletes an investment rule by ID
// @Tags Investment
// @Param id path string true "Investment rule ID" format(uuid)
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/rule/{id} [delete]
func (h *InvestmentHandler) DeleteGoalInvestment(c echo.Context) error {
	return handler.HandleNoContent(
		h.base,
		func(c echo.Context, payload *DeleteGoalInvestmentReq) error {
			return h.service.DeleteGoalInvestment(c, payload.ID, middleware.GetUserID(c))
		}, http.StatusNoContent, &DeleteGoalInvestmentReq{},
	)(c)
}

// ── GoalTransaction handlers ──────────────────────────────────────────────────

// LinkTransaction godoc
// @Summary Manually link a transaction to an investment rule
// @Description Creates a goal_transaction record linking a transaction to an investment
// @Tags Investment
// @Accept json
// @Produce json
// @Param link body LinkTransactionReq true "Link request"
// @Success 201 {object} GoalTransaction
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/link [post]
func (h *InvestmentHandler) LinkTransaction(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *LinkTransactionReq) (*GoalTransaction, error) {
			return h.service.LinkTransaction(c, payload, middleware.GetUserID(c))
		}, http.StatusCreated, &LinkTransactionReq{},
	)(c)
}

// UnlinkTransaction godoc
// @Summary Unlink a goal transaction
// @Description Removes a goal_transaction link and recalculates the investment current_value
// @Tags Investment
// @Param id path string true "GoalTransaction ID" format(uuid)
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/link/{id} [delete]
func (h *InvestmentHandler) UnlinkTransaction(c echo.Context) error {
	return handler.HandleNoContent(
		h.base,
		func(c echo.Context, payload *UnlinkTransactionReq) error {
			return h.service.UnlinkTransaction(c, payload.ID, middleware.GetUserID(c))
		}, http.StatusNoContent, &UnlinkTransactionReq{},
	)(c)
}

// GetGoalTransactionsByInvestment godoc
// @Summary List goal transactions for an investment rule
// @Description Returns all linked transactions for the given investment rule
// @Tags Investment
// @Produce json
// @Param investment_id path string true "Investment rule ID" format(uuid)
// @Success 200 {array} GoalTransaction
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/rule/{investment_id}/transactions [get]
func (h *InvestmentHandler) GetGoalTransactionsByInvestment(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetGoalTransactionsByInvestmentReq) ([]GoalTransaction, error) {
			return h.service.GetGoalTransactionsByInvestment(c, payload.InvestmentID)
		}, http.StatusOK, &GetGoalTransactionsByInvestmentReq{},
	)(c)
}

// GetGoalTransactionsByGoal godoc
// @Summary List goal transactions for a goal
// @Description Returns all linked transactions for the given goal
// @Tags Investment
// @Produce json
// @Param goal_id path string true "Goal ID" format(uuid)
// @Success 200 {array} GoalTransaction
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/goal/{goal_id}/transactions [get]
func (h *InvestmentHandler) GetGoalTransactionsByGoal(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetGoalTransactionsByGoalReq) ([]GoalTransaction, error) {
			return h.service.GetGoalTransactionsByGoal(c, payload.GoalID)
		}, http.StatusOK, &GetGoalTransactionsByGoalReq{},
	)(c)
}

// ── Auto-link handler ─────────────────────────────────────────────────────────

// EnqueueAutoLink godoc
// @Summary Enqueue an auto-link job for a batch of transactions
// @Description Enqueues a background job that fuzzy-matches the given transactions against active SIP rules
// @Tags Investment
// @Accept json
// @Param body body EnqueueAutoLinkReq true "Transaction IDs to match"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /investment/autolink [post]
func (h *InvestmentHandler) EnqueueAutoLink(c echo.Context) error {
	return handler.HandleNoContent(
		h.base,
		func(c echo.Context, payload *EnqueueAutoLinkReq) error {
			return h.service.EnqueueAutoLink(c, middleware.GetUserID(c), payload.TransactionIDs)
		}, http.StatusNoContent, &EnqueueAutoLinkReq{},
	)(c)
}
