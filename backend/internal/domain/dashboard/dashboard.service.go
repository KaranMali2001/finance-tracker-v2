package dashboard

import "context"

type DashboardService struct {
	repo dashboardRepository
}

func NewDashboardService(repo dashboardRepository) *DashboardService {
	return &DashboardService{repo: repo}
}

func (s *DashboardService) GetDashboard(ctx context.Context, clerkID, dateFrom, dateTo string) (*DashboardRes, error) {
	return s.repo.GetDashboard(ctx, clerkID, dateFrom, dateTo)
}
