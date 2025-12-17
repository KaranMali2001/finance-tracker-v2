package investment

import (
	"github.com/labstack/echo/v4"
)

type InvestmentService struct {
	r *InvestmentRepository
}

func NewInvestMentService(r *InvestmentRepository) *InvestmentService {
	return &InvestmentService{
		r: r,
	}
}

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
