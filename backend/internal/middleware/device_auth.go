package middleware

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/errs"
	"github.com/labstack/echo/v4"
)

type deviceUserProvider interface {
	GetClerkIdByApiKey(c echo.Context, apiKey string) (string, error)
}

type DeviceAuthMiddleware struct {
	userProvider deviceUserProvider
}

func NewDeviceAuthMiddleware(u deviceUserProvider) *DeviceAuthMiddleware {
	return &DeviceAuthMiddleware{userProvider: u}
}

func (d *DeviceAuthMiddleware) RequireDeviceAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		apiKey := c.Request().Header.Get("X-Device-Api-Key")
		if apiKey == "" {
			return errs.NewUnauthorizedError("missing device API key", false)
		}

		clerkId, err := d.userProvider.GetClerkIdByApiKey(c, apiKey)
		if err != nil {
			return errs.NewUnauthorizedError("invalid device API key", false)
		}

		c.Set(UserIDKey, clerkId)
		return next(c)
	}
}
