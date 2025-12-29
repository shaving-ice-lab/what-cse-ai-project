package middleware

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/redis/go-redis/v9"
)

type RateLimiterConfig struct {
	Rate      int           // Number of requests allowed
	Period    time.Duration // Time period for rate limiting
	BurstSize int           // Maximum burst size
	KeyPrefix string        // Redis key prefix
}

type RateLimiter struct {
	redis     *redis.Client
	config    RateLimiterConfig
	localRate *LocalRateLimiter
}

func NewRateLimiter(redisClient *redis.Client, config RateLimiterConfig) *RateLimiter {
	if config.KeyPrefix == "" {
		config.KeyPrefix = "ratelimit:"
	}
	if config.BurstSize == 0 {
		config.BurstSize = config.Rate
	}

	return &RateLimiter{
		redis:     redisClient,
		config:    config,
		localRate: NewLocalRateLimiter(config.Rate, config.Period),
	}
}

func (rl *RateLimiter) Allow(key string) (bool, int, time.Duration) {
	if rl.redis != nil {
		return rl.allowRedis(key)
	}
	return rl.localRate.Allow(key)
}

func (rl *RateLimiter) allowRedis(key string) (bool, int, time.Duration) {
	ctx := context.Background()
	fullKey := rl.config.KeyPrefix + key
	now := time.Now().Unix()
	windowStart := now - int64(rl.config.Period.Seconds())

	pipe := rl.redis.Pipeline()
	pipe.ZRemRangeByScore(ctx, fullKey, "0", fmt.Sprintf("%d", windowStart))
	pipe.ZCard(ctx, fullKey)
	pipe.ZAdd(ctx, fullKey, redis.Z{Score: float64(now), Member: now})
	pipe.Expire(ctx, fullKey, rl.config.Period)

	results, err := pipe.Exec(ctx)
	if err != nil {
		return rl.localRate.Allow(key)
	}

	count := results[1].(*redis.IntCmd).Val()
	remaining := rl.config.Rate - int(count) - 1
	if remaining < 0 {
		remaining = 0
	}

	if int(count) >= rl.config.Rate {
		return false, remaining, rl.config.Period
	}

	return true, remaining, rl.config.Period
}

type LocalRateLimiter struct {
	rate     int
	period   time.Duration
	requests map[string][]time.Time
	mu       sync.Mutex
}

func NewLocalRateLimiter(rate int, period time.Duration) *LocalRateLimiter {
	limiter := &LocalRateLimiter{
		rate:     rate,
		period:   period,
		requests: make(map[string][]time.Time),
	}
	go limiter.cleanup()
	return limiter
}

func (l *LocalRateLimiter) Allow(key string) (bool, int, time.Duration) {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-l.period)

	requests := l.requests[key]
	var validRequests []time.Time
	for _, t := range requests {
		if t.After(windowStart) {
			validRequests = append(validRequests, t)
		}
	}

	if len(validRequests) >= l.rate {
		remaining := 0
		return false, remaining, l.period
	}

	validRequests = append(validRequests, now)
	l.requests[key] = validRequests

	remaining := l.rate - len(validRequests)
	return true, remaining, l.period
}

func (l *LocalRateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	for range ticker.C {
		l.mu.Lock()
		now := time.Now()
		for key, requests := range l.requests {
			var validRequests []time.Time
			for _, t := range requests {
				if t.After(now.Add(-l.period)) {
					validRequests = append(validRequests, t)
				}
			}
			if len(validRequests) == 0 {
				delete(l.requests, key)
			} else {
				l.requests[key] = validRequests
			}
		}
		l.mu.Unlock()
	}
}

func RateLimitMiddleware(limiter *RateLimiter) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			key := getClientKey(c)

			allowed, remaining, resetAfter := limiter.Allow(key)

			c.Response().Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", limiter.config.Rate))
			c.Response().Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
			c.Response().Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(resetAfter).Unix()))

			if !allowed {
				return c.JSON(http.StatusTooManyRequests, map[string]interface{}{
					"code":    429,
					"message": "Rate limit exceeded. Please try again later.",
				})
			}

			return next(c)
		}
	}
}

func getClientKey(c echo.Context) string {
	if userID, ok := c.Get("user_id").(uint); ok && userID > 0 {
		return fmt.Sprintf("user:%d", userID)
	}

	xff := c.Request().Header.Get("X-Forwarded-For")
	if xff != "" {
		return "ip:" + xff
	}

	return "ip:" + c.RealIP()
}

func DefaultRateLimiter(redisClient *redis.Client) *RateLimiter {
	return NewRateLimiter(redisClient, RateLimiterConfig{
		Rate:      100,
		Period:    time.Minute,
		BurstSize: 120,
		KeyPrefix: "ratelimit:",
	})
}

func StrictRateLimiter(redisClient *redis.Client) *RateLimiter {
	return NewRateLimiter(redisClient, RateLimiterConfig{
		Rate:      20,
		Period:    time.Minute,
		BurstSize: 25,
		KeyPrefix: "ratelimit:strict:",
	})
}
