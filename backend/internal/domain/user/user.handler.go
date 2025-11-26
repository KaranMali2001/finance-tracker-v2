package user

import (
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	server      *server.Server
	base        handler.Handler
	userService *UserService
}

func NewUserHandler(s *server.Server, userService *UserService) *UserHandler {
	return &UserHandler{
		server:      s,
		userService: userService,
		base:        handler.NewHandler(s),
	}
}

// UpdateUser godoc
// @Summary Update user
// @Description Updates the authenticated user's information
// @Tags User
// @Accept json
// @Produce json
// @Param user body UpdateUserReq true "User update request"
// @Success 200 {object} User
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /user [put]
func (h *UserHandler) UpdateUser(c echo.Context) error {
	return handler.Handle(h.base, func(c echo.Context, payload *UpdateUserReq) (*User, error) {
		clerkId := middleware.GetUserID(c)
		return h.userService.UpdateUser(c, payload, clerkId)
	}, http.StatusOK, &UpdateUserReq{})(c)
}
