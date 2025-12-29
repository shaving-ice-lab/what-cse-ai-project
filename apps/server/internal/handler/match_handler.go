package handler

import (
	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type MatchHandler struct {
	matchService *service.MatchService
}

func NewMatchHandler(matchService *service.MatchService) *MatchHandler {
	return &MatchHandler{matchService: matchService}
}

// GetMatchedPositions returns positions matched to user's profile
// @Summary Get Matched Positions
// @Description Get positions that match current user's profile and preferences
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param strategy query string false "Match strategy: strict, loose, smart" default(smart)
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/match/positions [get]
func (h *MatchHandler) GetMatchedPositions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.MatchRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.matchService.MatchPositions(userID, &req)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first")
		}
		return fail(c, 500, "Failed to match positions: "+err.Error())
	}

	return success(c, result)
}

// GetMatchReport returns a comprehensive match report
// @Summary Get Match Report
// @Description Generate a comprehensive match report for current user
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/match/report [get]
func (h *MatchHandler) GetMatchReport(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	report, err := h.matchService.GenerateMatchReport(userID)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first")
		}
		return fail(c, 500, "Failed to generate report: "+err.Error())
	}

	return success(c, report)
}

func (h *MatchHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	g.GET("/positions", h.GetMatchedPositions, authMiddleware)
	g.GET("/report", h.GetMatchReport, authMiddleware)
}
