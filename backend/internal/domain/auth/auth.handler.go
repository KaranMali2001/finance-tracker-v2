package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	server  *server.Server
	base    handler.Handler
	service *AuthService
}

func NewAuthHandler(s *server.Server, service *AuthService) *AuthHandler {
	return &AuthHandler{
		server:  s,
		base:    handler.NewHandler(s),
		service: service,
	}
}

func (h *AuthHandler) CreateUser(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read request body")
	}

	// Restore the body so it can be read again if needed
	c.Request().Body = io.NopCloser(bytes.NewReader(body))

	// Verify webhook signature using utility function
	if err := VerifyClerkWebhook(body, c.Request().Header, h.server.Config.Auth.WebhookKey); err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid webhook signature")
	}

	// Parse payload to extract only clerk_id and email
	var webhookPayload ClerkUserCreatedWebhook
	if err := json.Unmarshal(body, &webhookPayload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid webhook payload")
	}

	if webhookPayload.EventType != "user.created" {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid webhook event type")
	}
	var email string
	if len(webhookPayload.Data.EmailAddresses) > 0 {
		email = webhookPayload.Data.EmailAddresses[0].EmailAddress
	} else if h.server.Config.Primary.Env == "local" {
		email = fmt.Sprintf("user-%s@example.com", webhookPayload.Data.ID)
	} else {
		return echo.NewHTTPError(http.StatusBadRequest, "no email addresses found")
	}
	req := &UserCreateRequest{
		Email:   email,
		ClerkId: webhookPayload.Data.ID,
	}

	reqBody, err := json.Marshal(req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to marshal request")
	}
	c.Request().Body = io.NopCloser(bytes.NewReader(reqBody))

	return handler.Handle(h.base, func(c echo.Context, payload *UserCreateRequest) (*UserResponse, error) {
		return h.service.CreateUser(c, payload)
	},
		http.StatusCreated,
		&UserCreateRequest{},
	)(c)
}

// GetAuthUser godoc
// @Summary Get authenticated user
// @Description Returns the current authenticated user's information
// @Tags Auth
// @Produce json
// @Success 200 {object} GetAuthUserResponse
// @Failure 401 {object} map[string]string "Unauthorized"
// @Router /auth/user [get]
func (h *AuthHandler) GetAuthUser(c echo.Context) error {
	return handler.Handle(h.base, func(c echo.Context, payload *GetAuthUserRequest) (*GetAuthUserResponse, error) {
		clerkId := middleware.GetUserID(c)
		return h.service.GetAuthUser(c, clerkId)
	}, http.StatusOK, &GetAuthUserRequest{})(c)
}
