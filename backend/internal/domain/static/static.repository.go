package static

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
)

type StaticRepository struct {
	server  *server.Server
	queries *generated.Queries
}

func NewStaticRepository(s *server.Server, q *generated.Queries) *StaticRepository {
	return &StaticRepository{
		server:  s,
		queries: q,
	}
}
func (r *StaticRepository) GetBanks(c context.Context) ([]Bank, error) {
	dbBanks, err := r.queries.GetBanks(c)
	if err != nil {
		return nil, err
	}
	banks := make([]Bank, len(dbBanks))
	for i, bank := range dbBanks {
		banks[i] = Bank{
			Id:   utils.UUIDToString(bank.ID),
			Name: bank.Name,
			Code: utils.TextToString(bank.Code),
		}
	}
	return banks, nil
}
func (r *StaticRepository) GetCategories(c context.Context) ([]Categories, error) {
	dbCategories, err := r.queries.GetCategories(c)
	if err != nil {
		return nil, err
	}
	categories := make([]Categories, len(dbCategories))
	for i, cat := range dbCategories {
		categories[i] = Categories{
			Id:   utils.UUIDToString(cat.ID),
			Name: cat.Name,
			Type: cat.Type,
		}
	}
	return categories, nil
}
func (r *StaticRepository) GetMerchants(c context.Context) ([]Merchants, error) {
	dbMerchanats, err := r.queries.GetMerchants(c)
	if err != nil {
		return nil, err
	}
	merchanats := make([]Merchants, len(dbMerchanats))
	for i, m := range dbMerchanats {
		merchanats[i] = Merchants{
			Id:   utils.UUIDToString(m.ID),
			Name: m.Name,
		}
	}
	return merchanats, nil

}
