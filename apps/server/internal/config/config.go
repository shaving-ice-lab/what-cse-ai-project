package config

import (
	"strings"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server        ServerConfig        `mapstructure:"server"`
	Database      DatabaseConfig      `mapstructure:"database"`
	Redis         RedisConfig         `mapstructure:"redis"`
	JWT           JWTConfig           `mapstructure:"jwt"`
	Log           LogConfig           `mapstructure:"log"`
	Elasticsearch ElasticsearchConfig `mapstructure:"elasticsearch"`
	Crawler       CrawlerConfig       `mapstructure:"crawler"`
	AI            AIConfig            `mapstructure:"ai"`
	Scheduler     SchedulerConfig     `mapstructure:"scheduler"`
	Schedule      ScheduleConfig      `mapstructure:"schedule"`
	OCR           OCRConfig           `mapstructure:"ocr"`
}

type ElasticsearchConfig struct {
	Addresses []string `mapstructure:"addresses"`
	Username  string   `mapstructure:"username"`
	Password  string   `mapstructure:"password"`
	IndexName string   `mapstructure:"index_name"`
}

type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type DatabaseConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
	Charset  string `mapstructure:"charset"`
}

type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

type JWTConfig struct {
	Secret          string `mapstructure:"secret"`
	ExpirationHours int    `mapstructure:"expiration_hours"`
	RefreshHours    int    `mapstructure:"refresh_hours"`
}

type LogConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
	Output string `mapstructure:"output"`
}

// CrawlerConfig holds crawler-related configuration
type CrawlerConfig struct {
	ConcurrentRequests int           `mapstructure:"concurrent_requests"`
	DownloadDelay      time.Duration `mapstructure:"download_delay"`
	RetryTimes         int           `mapstructure:"retry_times"`
	Timeout            time.Duration `mapstructure:"timeout"`
	UserAgent          string        `mapstructure:"user_agent"`
	ProxyEnabled       bool          `mapstructure:"proxy_enabled"`
	ProxyURL           string        `mapstructure:"proxy_url"`
}

// AIConfig holds AI-related configuration
type AIConfig struct {
	Provider            string        `mapstructure:"provider"`
	OpenAI              OpenAIConfig  `mapstructure:"openai"`
	MaxInputTokens      int           `mapstructure:"max_input_tokens"`
	MaxOutputTokens     int           `mapstructure:"max_output_tokens"`
	Temperature         float32       `mapstructure:"temperature"`
	ConfidenceThreshold int           `mapstructure:"confidence_threshold"`
	Timeout             time.Duration `mapstructure:"timeout"`
}

// OpenAIConfig holds OpenAI-specific configuration
type OpenAIConfig struct {
	APIKey  string `mapstructure:"api_key"`
	BaseURL string `mapstructure:"base_url"`
	Model   string `mapstructure:"model"`
}

// SchedulerConfig holds task scheduler configuration
type SchedulerConfig struct {
	RedisAddr     string `mapstructure:"redis_addr"`
	RedisPassword string `mapstructure:"redis_password"`
	RedisDB       int    `mapstructure:"redis_db"`
	Concurrency   int    `mapstructure:"concurrency"`
	RetryMax      int    `mapstructure:"retry_max"`
}

// ScheduleConfig holds scheduled task cron expressions
type ScheduleConfig struct {
	ListMonitor ListMonitorSchedule `mapstructure:"list_monitor"`
}

// ListMonitorSchedule holds cron expressions for list monitor tasks
type ListMonitorSchedule struct {
	HighPriority   string `mapstructure:"high_priority"`
	MediumPriority string `mapstructure:"medium_priority"`
	LowPriority    string `mapstructure:"low_priority"`
}

// OCRConfig holds OCR-related configuration
type OCRConfig struct {
	Engine       string `mapstructure:"engine"`
	TesseractCmd string `mapstructure:"tesseract_cmd"`
	Language     string `mapstructure:"language"`
}

func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath(".")

	// Support environment variable override
	viper.SetEnvPrefix("CSE")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	// Set defaults
	setDefaults()

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

func setDefaults() {
	// Server defaults
	viper.SetDefault("server.port", 9000)
	viper.SetDefault("server.mode", "development")

	// Database defaults
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 3306)
	viper.SetDefault("database.user", "root")
	viper.SetDefault("database.password", "")
	viper.SetDefault("database.dbname", "what_cse")
	viper.SetDefault("database.charset", "utf8mb4")

	// Redis defaults
	viper.SetDefault("redis.host", "localhost")
	viper.SetDefault("redis.port", 6379)
	viper.SetDefault("redis.password", "")
	viper.SetDefault("redis.db", 0)

	// JWT defaults
	viper.SetDefault("jwt.secret", "your-secret-key-change-in-production")
	viper.SetDefault("jwt.expiration_hours", 24)
	viper.SetDefault("jwt.refresh_hours", 168)

	// Log defaults
	viper.SetDefault("log.level", "info")
	viper.SetDefault("log.format", "json")
	viper.SetDefault("log.output", "stdout")

	// Elasticsearch defaults
	viper.SetDefault("elasticsearch.addresses", []string{"http://localhost:9200"})
	viper.SetDefault("elasticsearch.username", "")
	viper.SetDefault("elasticsearch.password", "")
	viper.SetDefault("elasticsearch.index_name", "positions")

	// Crawler defaults
	viper.SetDefault("crawler.concurrent_requests", 16)
	viper.SetDefault("crawler.download_delay", "1s")
	viper.SetDefault("crawler.retry_times", 3)
	viper.SetDefault("crawler.timeout", "30s")
	viper.SetDefault("crawler.user_agent", "random")
	viper.SetDefault("crawler.proxy_enabled", false)

	// AI defaults
	viper.SetDefault("ai.provider", "openai")
	viper.SetDefault("ai.openai.base_url", "https://api.openai.com/v1")
	viper.SetDefault("ai.openai.model", "gpt-4o-mini")
	viper.SetDefault("ai.max_input_tokens", 8000)
	viper.SetDefault("ai.max_output_tokens", 4096)
	viper.SetDefault("ai.temperature", 0.1)
	viper.SetDefault("ai.confidence_threshold", 85)
	viper.SetDefault("ai.timeout", "60s")

	// Scheduler defaults
	viper.SetDefault("scheduler.redis_addr", "localhost:6379")
	viper.SetDefault("scheduler.redis_db", 1)
	viper.SetDefault("scheduler.concurrency", 10)
	viper.SetDefault("scheduler.retry_max", 3)

	// Schedule defaults
	viper.SetDefault("schedule.list_monitor.high_priority", "0 */2 * * *")
	viper.SetDefault("schedule.list_monitor.medium_priority", "0 */6 * * *")
	viper.SetDefault("schedule.list_monitor.low_priority", "0 8 * * *")

	// OCR defaults
	viper.SetDefault("ocr.engine", "tesseract")
	viper.SetDefault("ocr.tesseract_cmd", "tesseract")
	viper.SetDefault("ocr.language", "chi_sim+eng")
}
