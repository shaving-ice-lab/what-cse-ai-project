package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

type ErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func ErrorHandler(logger *zap.Logger) echo.HTTPErrorHandler {
	return func(err error, c echo.Context) {
		var code int
		var message string

		if he, ok := err.(*echo.HTTPError); ok {
			code = he.Code
			if m, ok := he.Message.(string); ok {
				message = m
			} else {
				message = http.StatusText(code)
			}
		} else {
			code = http.StatusInternalServerError
			message = "Internal Server Error"
		}

		logger.Error("HTTP error",
			zap.Int("code", code),
			zap.String("message", message),
			zap.Error(err),
		)

		if !c.Response().Committed {
			if c.Request().Method == http.MethodHead {
				c.NoContent(code)
			} else {
				c.JSON(code, ErrorResponse{
					Code:    code,
					Message: message,
				})
			}
		}
	}
}

func RecoverMiddleware(logger *zap.Logger) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			defer func() {
				if r := recover(); r != nil {
					logger.Error("Panic recovered",
						zap.Any("panic", r),
						zap.String("uri", c.Request().RequestURI),
					)
					c.JSON(http.StatusInternalServerError, ErrorResponse{
						Code:    500,
						Message: "Internal Server Error",
					})
				}
			}()
			return next(c)
		}
	}
}
