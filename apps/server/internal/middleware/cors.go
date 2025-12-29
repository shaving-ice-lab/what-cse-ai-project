package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

type CORSConfig struct {
	AllowedOrigins   []string
	AllowedMethods   []string
	AllowedHeaders   []string
	ExposedHeaders   []string
	AllowCredentials bool
	MaxAge           int
}

func DefaultCORSConfig() CORSConfig {
	return CORSConfig{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-Requested-With",
			"X-CSRF-Token",
		},
		ExposedHeaders: []string{
			"X-RateLimit-Limit",
			"X-RateLimit-Remaining",
			"X-RateLimit-Reset",
		},
		AllowCredentials: true,
		MaxAge:           86400,
	}
}

func ProductionCORSConfig(allowedOrigins []string) CORSConfig {
	return CORSConfig{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-Requested-With",
			"X-CSRF-Token",
		},
		ExposedHeaders: []string{
			"X-RateLimit-Limit",
			"X-RateLimit-Remaining",
			"X-RateLimit-Reset",
		},
		AllowCredentials: true,
		MaxAge:           86400,
	}
}

func CORSMiddleware(config CORSConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			res := c.Response()

			origin := req.Header.Get("Origin")
			if origin == "" {
				return next(c)
			}

			allowedOrigin := ""
			for _, o := range config.AllowedOrigins {
				if o == "*" {
					if config.AllowCredentials {
						allowedOrigin = origin
					} else {
						allowedOrigin = "*"
					}
					break
				}
				if o == origin {
					allowedOrigin = origin
					break
				}
				if strings.HasPrefix(o, "*.") {
					suffix := o[1:]
					if strings.HasSuffix(origin, suffix) {
						allowedOrigin = origin
						break
					}
				}
			}

			if allowedOrigin == "" {
				return next(c)
			}

			res.Header().Set("Access-Control-Allow-Origin", allowedOrigin)

			if config.AllowCredentials {
				res.Header().Set("Access-Control-Allow-Credentials", "true")
			}

			if len(config.ExposedHeaders) > 0 {
				res.Header().Set("Access-Control-Expose-Headers", strings.Join(config.ExposedHeaders, ", "))
			}

			if req.Method == http.MethodOptions {
				res.Header().Set("Access-Control-Allow-Methods", strings.Join(config.AllowedMethods, ", "))
				res.Header().Set("Access-Control-Allow-Headers", strings.Join(config.AllowedHeaders, ", "))

				if config.MaxAge > 0 {
					res.Header().Set("Access-Control-Max-Age", string(rune(config.MaxAge)))
				}

				return c.NoContent(http.StatusNoContent)
			}

			return next(c)
		}
	}
}

func CORSWithDefaultConfig() echo.MiddlewareFunc {
	return CORSMiddleware(DefaultCORSConfig())
}
