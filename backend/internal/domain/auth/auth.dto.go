package auth

import (
	"time"

	"github.com/go-playground/validator/v10"
)

type ClerkUserCreatedWebhook struct {
	Data struct {
		ID             string `json:"id"`
		EmailAddresses []struct {
			EmailAddress string `json:"email_address"`
		} `json:"email_addresses"`
	} `json:"data"`
	EventType string `json:"type"`
}

type UserResponse struct {
	Id        string    `json:"id"`
	Email     string    `json:"email"`
	IsActive  bool      `json:"is_active"`
	ClerkId   string    `json:"clerk_id,omitempty"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
}
type UserCreateRequest struct {
	Email   string `json:"email" validate:"required,email"`
	ClerkId string `json:"clerk_id" validate:"required"`
}

func (u *UserCreateRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(u)
}
