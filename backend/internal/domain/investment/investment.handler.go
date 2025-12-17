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
		base:    handler.NewHandler(s),
		service: service,
	}
}

// CreateNewGoal godoc
// @Summary Create a new investment goal
// @Description Creates a new investment goal for the authenticated user
// @Tags Investment
// @Accept json
// @Produce json
// @Name CreateNewGoal
// @Param goal body CreateGoalReq true "Goal creation request"
// @Success 201 {object} Goal
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /investment/goal [post]
func (h *InvestmentHandler) CreateNewGoal(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *CreateGoalReq) (*Goal, error) {
			clerkId := middleware.GetUserID(c)
			return h.service.CreateNewGoal(c, payload, clerkId)
		}, http.StatusCreated, &CreateGoalReq{},
	)(c)
}

// GetGoalsWithFilter godoc
// @Summary Get investment goals with filters
// @Description Retrieves investment goals for the authenticated user with optional filters
// @Tags Investment
// @Produce json
// @Name GetGoalsWithFilter
// @Param status query string false "Goal status"
// @Param target_date_before query string false "Target date before (YYYY-MM-DD)" format(date)
// @Param target_date_after query string false "Target date after (YYYY-MM-DD)" format(date)
// @Param target_amount_less_than query number false "Target amount less than"
// @Param target_amount_greater_than query number false "Target amount greater than"
// @Param priority query integer false "Priority level"
// @Param created_at_before query string false "Created at before (ISO 8601)" format(date-time)
// @Param created_at_after query string false "Created at after (ISO 8601)" format(date-time)
// @Success 200 {array} Goal
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /investment/goal [get]
func (h *InvestmentHandler) GetGoalsWithFilter(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetGoalsWithFilter) ([]Goal, error) {
			clerkId := middleware.GetUserID(c)
			return h.service.GetGoalsWithFilter(c, payload, clerkId)
		},
		http.StatusOK,
		&GetGoalsWithFilter{},
	)(c)
}

// GetGoalById godoc
// @Summary Get investment goal by ID
// @Description Retrieves a specific investment goal by ID for the authenticated user
// @Tags Investment
// @Produce json
// @Name GetGoalById
// @Param id path string true "Goal ID" format(uuid)
// @Success 200 {object} Goal
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Not Found"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /investment/goal/{id} [get]
func (h *InvestmentHandler) GetGoalById(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetGoalById) (*Goal, error) {
			clerkId := middleware.GetUserID(c)
			return h.service.GetGoalById(c, payload, clerkId)
		},
		http.StatusOK,
		&GetGoalById{},
	)(c)
}

// UpdateGoals godoc
// @Summary Update an investment goal
// @Description Updates an existing investment goal for the authenticated user
// @Tags Investment
// @Accept json
// @Produce json
// @Name UpdateGoals
// @Param id path string true "Goal ID" format(uuid)
// @Param goal body UpdateGoals true "Goal update request"
// @Success 200 {object} Goal
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Not Found"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /investment/goal/{id} [put]
func (h *InvestmentHandler) UpdateGoals(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *UpdateGoals) (*Goal, error) {
			clerkId := middleware.GetUserID(c)
			return h.service.UpdateGoals(c, payload, clerkId)
		},
		http.StatusOK,
		&UpdateGoals{},
	)(c)
}
