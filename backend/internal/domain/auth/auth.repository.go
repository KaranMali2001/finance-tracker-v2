package auth

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
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
		Id:        userData.ID.String(),
		Email:     userData.Email,
		IsActive:  userData.IsActive.Bool,
		ClerkId:   userData.ClerkID,
		CreatedAt: userData.CreatedAt.Time,
		UpdatedAt: userData.CreatedAt.Time,
	}, nil
}
