package auth

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
)

type AuthRepository struct {
	queries *generated.Queries
}

func NewAuthRepository(s *server.Server, queries *generated.Queries) *AuthRepository {
	return &AuthRepository{
		queries: queries,
	}
}

func (r *AuthRepository) CreateUser(c context.Context, user *UserCreateRequest) (*UserResponse, error) {
	insertUser := &generated.InsertUserParams{
		Email:   user.Email,
		ClerkID: user.ClerkId,
	}
	userData, err := r.queries.InsertUser(c, *insertUser)
	if err != nil {
		return nil, err
	}
	// r.server.Queue.Client.Enqueue()

	return &UserResponse{

		Email:     userData.Email,
		IsActive:  utils.BoolToBool(userData.IsActive),
		ClerkId:   userData.ClerkID,
		CreatedAt: utils.TimestampToTime(userData.CreatedAt),
		UpdatedAt: utils.TimestampToTime(userData.UpdatedAt),
	}, nil
}
func (r *AuthRepository) GetAuthUser(c context.Context, clerkId string) (*GetAuthUserResponse, error) {
	user, err := r.queries.GetAuthUser(c, clerkId)
	if err != nil {
		return nil, err
	}
	return &GetAuthUserResponse{

		Email:                        user.Email,
		LifetimeIncome:               utils.NumericToFloat64Ptr(user.LifetimeIncome),
		LifetimeExpense:              utils.NumericToFloat64Ptr(user.LifetimeExpense),
		UseLlmParsing:                utils.BoolToBoolPtr(user.UseLlmParsing),
		LlmParseCredits:              utils.Int4ToIntPtr(user.LlmParseCredits),
		IsActive:                     utils.BoolToBoolPtr(user.IsActive),
		DatabaseUrl:                  utils.TextToStringPtr(user.DatabaseUrl),
		CreatedAt:                    utils.TimestampToTime(user.CreatedAt),
		UpdatedAt:                    utils.TimestampToTime(user.UpdatedAt),
		TransactionImageParseAttempt: utils.Int4ToUint(user.TransactionImageParseAttempts),
		TransactionImageParseSuccess: utils.Int4ToUint(user.TransactionImageParseSuccesses),
	}, nil
}
