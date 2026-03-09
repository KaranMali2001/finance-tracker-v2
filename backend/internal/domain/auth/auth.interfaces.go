package auth

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/rs/zerolog"
)

var _ authQuerier = (*generated.Queries)(nil)

type authQuerier interface {
	InsertUser(ctx context.Context, arg generated.InsertUserParams) (generated.User, error)
	GetAuthUser(ctx context.Context, clerkID string) (generated.User, error)
}

type authRepository interface {
	CreateUser(ctx context.Context, user *UserCreateRequest) (*UserResponse, error)
	GetAuthUser(ctx context.Context, clerkId string) (*GetAuthUserResponse, error)
}

type authTaskService interface {
	EnqueueWelcomeEmail(ctx context.Context, userEmail string, userId string, logger *zerolog.Logger) error
}
