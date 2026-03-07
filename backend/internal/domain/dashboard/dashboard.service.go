package dashboard

import "context"

type DashboardService struct {
	repo dashboardRepository
}

func NewDashboardService(repo dashboardRepository) *DashboardService {
	return &DashboardService{repo: repo}
}

func (s *DashboardService) StreamDashboard(ctx context.Context, clerkID, dateFrom, dateTo string, events chan<- DashboardEvent) {
	s.repo.StreamDashboard(ctx, clerkID, dateFrom, dateTo, events)
}
