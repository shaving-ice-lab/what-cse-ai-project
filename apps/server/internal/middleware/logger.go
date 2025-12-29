package middleware

import (
	"time"

	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

func RequestLogger(logger *zap.Logger) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			err := next(c)

			latency := time.Since(start)

			logger.Info("request",
				zap.String("method", c.Request().Method),
				zap.String("uri", c.Request().RequestURI),
				zap.Int("status", c.Response().Status),
				zap.Duration("latency", latency),
				zap.String("ip", c.RealIP()),
				zap.String("user_agent", c.Request().UserAgent()),
			)

			return err
		}
	}
}
