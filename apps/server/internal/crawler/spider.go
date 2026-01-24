// Package crawler provides web crawling functionality for the CSE position system.
package crawler

import (
	"crypto/md5"
	"encoding/hex"
	"net/url"
	"sync"
	"time"

	"github.com/gocolly/colly/v2"
	"github.com/gocolly/colly/v2/extensions"
	"go.uber.org/zap"
)

// SpiderConfig holds configuration for the spider
type SpiderConfig struct {
	ConcurrentRequests int           `mapstructure:"concurrent_requests"`
	DownloadDelay      time.Duration `mapstructure:"download_delay"`
	RetryTimes         int           `mapstructure:"retry_times"`
	UserAgent          string        `mapstructure:"user_agent"`
	ProxyEnabled       bool          `mapstructure:"proxy_enabled"`
	ProxyURL           string        `mapstructure:"proxy_url"`
	Timeout            time.Duration `mapstructure:"timeout"`
}

// DefaultSpiderConfig returns default spider configuration
func DefaultSpiderConfig() *SpiderConfig {
	return &SpiderConfig{
		ConcurrentRequests: 16,
		DownloadDelay:      1 * time.Second,
		RetryTimes:         3,
		UserAgent:          "random",
		ProxyEnabled:       false,
		Timeout:            30 * time.Second,
	}
}

// Spider is the base spider structure with common functionality
type Spider struct {
	Name         string
	Config       *SpiderConfig
	Collector    *colly.Collector
	Logger       *zap.Logger
	CrawledURLs  map[string]bool
	mu           sync.RWMutex
	requestCount int64
}

// NewSpider creates a new spider instance with the given configuration
func NewSpider(name string, config *SpiderConfig, logger *zap.Logger) *Spider {
	if config == nil {
		config = DefaultSpiderConfig()
	}

	spider := &Spider{
		Name:        name,
		Config:      config,
		Logger:      logger,
		CrawledURLs: make(map[string]bool),
	}

	spider.initCollector()
	return spider
}

// initCollector initializes the Colly collector with configuration
func (s *Spider) initCollector() {
	s.Collector = colly.NewCollector(
		colly.MaxDepth(3),
		colly.Async(true),
	)

	// Set rate limiting
	s.Collector.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: s.Config.ConcurrentRequests,
		Delay:       s.Config.DownloadDelay,
		RandomDelay: s.Config.DownloadDelay / 2,
	})

	// Set retry
	s.Collector.SetRequestTimeout(s.Config.Timeout)

	// Set User-Agent
	if s.Config.UserAgent == "random" {
		extensions.RandomUserAgent(s.Collector)
	} else if s.Config.UserAgent != "" {
		s.Collector.UserAgent = s.Config.UserAgent
	}

	// Set proxy if enabled
	if s.Config.ProxyEnabled && s.Config.ProxyURL != "" {
		s.Collector.SetProxy(s.Config.ProxyURL)
	}

	// Setup callbacks
	s.setupCallbacks()
}

// setupCallbacks sets up common callbacks for the collector
func (s *Spider) setupCallbacks() {
	s.Collector.OnRequest(func(r *colly.Request) {
		s.mu.Lock()
		s.requestCount++
		s.mu.Unlock()
		s.Logger.Debug("Requesting",
			zap.String("spider", s.Name),
			zap.String("url", r.URL.String()),
		)
	})

	s.Collector.OnResponse(func(r *colly.Response) {
		s.Logger.Debug("Response received",
			zap.String("spider", s.Name),
			zap.String("url", r.Request.URL.String()),
			zap.Int("status", r.StatusCode),
			zap.Int("body_size", len(r.Body)),
		)
	})

	s.Collector.OnError(func(r *colly.Response, err error) {
		s.Logger.Error("Request failed",
			zap.String("spider", s.Name),
			zap.String("url", r.Request.URL.String()),
			zap.Error(err),
		)
	})
}

// Visit visits a URL with the collector
func (s *Spider) Visit(url string) error {
	return s.Collector.Visit(url)
}

// Wait waits for all requests to complete
func (s *Spider) Wait() {
	s.Collector.Wait()
}

// Clone creates a clone of the collector for child requests
func (s *Spider) Clone() *colly.Collector {
	return s.Collector.Clone()
}

// GetRequestCount returns the total number of requests made
func (s *Spider) GetRequestCount() int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.requestCount
}

// IsURLCrawled checks if a URL has already been crawled
func (s *Spider) IsURLCrawled(url string) bool {
	hash := HashURL(url)
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.CrawledURLs[hash]
}

// MarkURLCrawled marks a URL as crawled
func (s *Spider) MarkURLCrawled(url string) {
	hash := HashURL(url)
	s.mu.Lock()
	defer s.mu.Unlock()
	s.CrawledURLs[hash] = true
}

// HashURL creates an MD5 hash of a URL
func HashURL(urlStr string) string {
	hash := md5.Sum([]byte(urlStr))
	return hex.EncodeToString(hash[:])
}

// JoinURL joins a base URL with a relative URL
func JoinURL(base, relative string) (string, error) {
	baseURL, err := url.Parse(base)
	if err != nil {
		return "", err
	}

	relURL, err := url.Parse(relative)
	if err != nil {
		return "", err
	}

	return baseURL.ResolveReference(relURL).String(), nil
}

// GetDomain extracts the domain from a URL
func GetDomain(urlStr string) (string, error) {
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return "", err
	}
	return parsedURL.Host, nil
}

// Article represents a discovered article from a list page
type Article struct {
	URL          string    `json:"url"`
	Title        string    `json:"title"`
	PublishDate  string    `json:"publish_date,omitempty"`
	SourceListID uint      `json:"source_list_id"`
	SourceName   string    `json:"source_name"`
	Category     string    `json:"category,omitempty"`
	DiscoveredAt time.Time `json:"discovered_at"`
}

// CrawlResult holds the result of a crawl operation
type CrawlResult struct {
	Articles      []Article `json:"articles"`
	TotalFound    int       `json:"total_found"`
	NewArticles   int       `json:"new_articles"`
	RequestCount  int64     `json:"request_count"`
	Duration      time.Duration `json:"duration"`
	Errors        []string  `json:"errors,omitempty"`
}
