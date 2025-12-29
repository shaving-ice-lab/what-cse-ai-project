package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/what-cse/server/internal/config"
)

type RedisCache struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisCache(cfg *config.RedisConfig) (*RedisCache, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Host + ":" + string(rune(cfg.Port)),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	ctx := context.Background()

	// Test connection
	_, err := client.Ping(ctx).Result()
	if err != nil {
		return nil, err
	}

	return &RedisCache{
		client: client,
		ctx:    ctx,
	}, nil
}

func (c *RedisCache) Set(key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.client.Set(c.ctx, key, data, expiration).Err()
}

func (c *RedisCache) Get(key string, dest interface{}) error {
	data, err := c.client.Get(c.ctx, key).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(data, dest)
}

func (c *RedisCache) Delete(key string) error {
	return c.client.Del(c.ctx, key).Err()
}

func (c *RedisCache) Exists(key string) bool {
	result, _ := c.client.Exists(c.ctx, key).Result()
	return result > 0
}

func (c *RedisCache) SetString(key string, value string, expiration time.Duration) error {
	return c.client.Set(c.ctx, key, value, expiration).Err()
}

func (c *RedisCache) GetString(key string) (string, error) {
	return c.client.Get(c.ctx, key).Result()
}

func (c *RedisCache) Incr(key string) (int64, error) {
	return c.client.Incr(c.ctx, key).Result()
}

func (c *RedisCache) Expire(key string, expiration time.Duration) error {
	return c.client.Expire(c.ctx, key, expiration).Err()
}

func (c *RedisCache) TTL(key string) (time.Duration, error) {
	return c.client.TTL(c.ctx, key).Result()
}

// Hash operations
func (c *RedisCache) HSet(key string, field string, value interface{}) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.client.HSet(c.ctx, key, field, data).Err()
}

func (c *RedisCache) HGet(key string, field string, dest interface{}) error {
	data, err := c.client.HGet(c.ctx, key, field).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(data, dest)
}

func (c *RedisCache) HDel(key string, fields ...string) error {
	return c.client.HDel(c.ctx, key, fields...).Err()
}

// List operations
func (c *RedisCache) LPush(key string, values ...interface{}) error {
	return c.client.LPush(c.ctx, key, values...).Err()
}

func (c *RedisCache) LRange(key string, start, stop int64) ([]string, error) {
	return c.client.LRange(c.ctx, key, start, stop).Result()
}

func (c *RedisCache) LTrim(key string, start, stop int64) error {
	return c.client.LTrim(c.ctx, key, start, stop).Err()
}

// Set operations
func (c *RedisCache) SAdd(key string, members ...interface{}) error {
	return c.client.SAdd(c.ctx, key, members...).Err()
}

func (c *RedisCache) SMembers(key string) ([]string, error) {
	return c.client.SMembers(c.ctx, key).Result()
}

func (c *RedisCache) SIsMember(key string, member interface{}) (bool, error) {
	return c.client.SIsMember(c.ctx, key, member).Result()
}

func (c *RedisCache) SRem(key string, members ...interface{}) error {
	return c.client.SRem(c.ctx, key, members...).Err()
}

// Keys pattern matching
func (c *RedisCache) Keys(pattern string) ([]string, error) {
	return c.client.Keys(c.ctx, pattern).Result()
}

func (c *RedisCache) DeleteByPattern(pattern string) error {
	keys, err := c.Keys(pattern)
	if err != nil {
		return err
	}
	if len(keys) > 0 {
		return c.client.Del(c.ctx, keys...).Err()
	}
	return nil
}

func (c *RedisCache) Close() error {
	return c.client.Close()
}

// Cache key constants
const (
	KeyUserSession        = "user:session:"
	KeyUserProfile        = "user:profile:"
	KeyPositionList       = "position:list:"
	KeyPositionDetail     = "position:detail:"
	KeyMajorDictionary    = "dict:major"
	KeyRegionDictionary   = "dict:region"
	KeyAnnouncementLatest = "announcement:latest"
)

// Cache durations
const (
	SessionExpiration        = 24 * time.Hour
	ProfileExpiration        = 1 * time.Hour
	PositionListExpiration   = 5 * time.Minute
	PositionDetailExpiration = 30 * time.Minute
	DictionaryExpiration     = 24 * time.Hour
)
