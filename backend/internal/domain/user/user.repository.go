package user

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
)

type UserRepository struct {
	queries *generated.Queries
}

func NewUserRepository(s *server.Server, queries *generated.Queries) *UserRepository {
	return &UserRepository{
		queries: queries,
	}
}

func (r *UserRepository) UpdateUser(c context.Context, updateUser *UpdateUserReq, clerkId string) (*User, error) {
	user := generated.UpdateUserParams{
		DatabaseUrl:     utils.StringPtrToText(updateUser.DatabaseUrl),
		UseLlmParsing:   utils.BoolPtrToBool(updateUser.UseLlmParsing),
		LifetimeIncome:  utils.Float64PtrToNum(updateUser.LifetimeIncome),
		LifetimeExpense: utils.Float64PtrToNum(updateUser.LifetimeExpense),
		ClerkID:         clerkId,
	}
	u, err := r.queries.UpdateUser(c, user)
	if err != nil {
		return nil, err
	}

	return &User{

		Email:           u.Email,
		IsActive:        utils.BoolToBool(u.IsActive),
		ClerkId:         u.ClerkID,
		LifetimeExpense: utils.NumericToFloat64(u.LifetimeExpense),
		LifetimeIncome:  utils.NumericToFloat64(u.LifetimeIncome),
		DatabaseUrl:     utils.TextToString(u.DatabaseUrl),
		UseLlmParsing:   utils.BoolToBool(u.UseLlmParsing),
		CreatedAt:       utils.TimestampToTime(u.CreatedAt),
		UpdatedAt:       utils.TimestampToTime(u.UpdatedAt),
	}, nil

}
func (r *UserRepository) GetUserByClerkId(c context.Context, clerkId string) (*User, error) {
	user, err := r.queries.GetAuthUser(c, clerkId)
	if err != nil {
		return nil, err
	}
	return &User{

		Email:           user.Email,
		LifetimeIncome:  utils.NumericToFloat64(user.LifetimeIncome),
		LifetimeExpense: utils.NumericToFloat64(user.LifetimeExpense),
		UseLlmParsing:   utils.BoolToBool(user.UseLlmParsing),
		IsActive:        utils.BoolToBool(user.IsActive),
		DatabaseUrl:     utils.TextToString(user.DatabaseUrl),
		CreatedAt:       utils.TimestampToTime(user.CreatedAt),
		UpdatedAt:       utils.TimestampToTime(user.UpdatedAt),
	}, nil
}
