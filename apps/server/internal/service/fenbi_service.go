package service

import (
	"crypto/aes"
	"crypto/cipher"
	cryptorand "crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/what-cse/server/internal/crawler"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/parser"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrCredentialNotFound        = errors.New("credential not found")
	ErrNotLoggedIn               = errors.New("not logged in")
	ErrCrawlFailed               = errors.New("crawl failed")
	ErrFenbiAnnouncementNotFound = errors.New("fenbi announcement not found")
	ErrCrawlStopped              = errors.New("crawl stopped by user")
)

// Encryption key for password storage (should be from config in production)
// AES requires exactly 16, 24, or 32 bytes key (32 bytes = AES-256)
var encryptionKey = []byte("whatcse-fenbi-secret-key-aes256!")

type FenbiService struct {
	credRepo         *repository.FenbiCredentialRepository
	categoryRepo     *repository.FenbiCategoryRepository
	announcementRepo *repository.FenbiAnnouncementRepository
	spiderConfig     *crawler.SpiderConfig
	llmConfigService *LLMConfigService
	logger           *zap.Logger

	// Crawl control
	crawlMutex   sync.Mutex
	crawlRunning bool
	crawlStopped bool
}

func NewFenbiService(
	credRepo *repository.FenbiCredentialRepository,
	categoryRepo *repository.FenbiCategoryRepository,
	announcementRepo *repository.FenbiAnnouncementRepository,
	spiderConfig *crawler.SpiderConfig,
	llmConfigService *LLMConfigService,
	logger *zap.Logger,
) *FenbiService {
	return &FenbiService{
		credRepo:         credRepo,
		categoryRepo:     categoryRepo,
		announcementRepo: announcementRepo,
		spiderConfig:     spiderConfig,
		llmConfigService: llmConfigService,
		logger:           logger,
	}
}

// === Credential Management ===

type SaveCredentialRequest struct {
	Phone    string `json:"phone" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func (s *FenbiService) SaveCredential(req *SaveCredentialRequest) (*model.FenbiCredentialResponse, error) {
	// Encrypt password for storage
	encryptedPassword, err := encryptPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Check if credential already exists
	existing, _ := s.credRepo.FindByPhone(req.Phone)
	if existing != nil {
		// Update existing
		existing.PasswordEncrypted = encryptedPassword
		existing.LoginStatus = int(model.FenbiLoginStatusNotLoggedIn)
		existing.Cookies = ""
		if err := s.credRepo.Update(existing); err != nil {
			return nil, err
		}
		return existing.ToResponse(), nil
	}

	// Create new credential
	credential := &model.FenbiCredential{
		Phone:             req.Phone,
		PasswordEncrypted: encryptedPassword,
		LoginStatus:       int(model.FenbiLoginStatusNotLoggedIn),
		IsDefault:         true, // First one is default
	}

	if err := s.credRepo.Create(credential); err != nil {
		return nil, err
	}

	return credential.ToResponse(), nil
}

func (s *FenbiService) GetCredential() (*model.FenbiCredentialResponse, error) {
	credential, err := s.credRepo.FindDefault()
	if err != nil {
		return nil, ErrCredentialNotFound
	}

	// Decrypt password to return (only single account allowed)
	password, err := decryptPassword(credential.PasswordEncrypted)
	if err != nil {
		s.logger.Warn("Failed to decrypt password", zap.Error(err))
		return credential.ToResponse(), nil
	}

	return credential.ToResponseWithPassword(password), nil
}

func (s *FenbiService) DeleteCredential(id uint) error {
	return s.credRepo.Delete(id)
}

// === Login Management ===

type LoginStatusResponse struct {
	IsLoggedIn      bool       `json:"is_logged_in"`
	Status          int        `json:"status"`
	StatusText      string     `json:"status_text"`
	Phone           string     `json:"phone,omitempty"`
	PhoneMasked     string     `json:"phone_masked,omitempty"`
	LastLoginAt     *time.Time `json:"last_login_at,omitempty"`
	LastCheckAt     *time.Time `json:"last_check_at,omitempty"`
	CookieExpiresAt *time.Time `json:"cookie_expires_at,omitempty"`
}

// ImportCookiesRequest represents the request to import cookies directly
type ImportCookiesRequest struct {
	Cookies string `json:"cookies" validate:"required"`
	Phone   string `json:"phone,omitempty"` // Optional, can be retrieved from session
}

func (s *FenbiService) Login() (*LoginStatusResponse, error) {
	credential, err := s.credRepo.FindDefault()
	if err != nil {
		return nil, ErrCredentialNotFound
	}

	// Decrypt password
	password, err := decryptPassword(credential.PasswordEncrypted)
	if err != nil {
		return nil, err
	}

	// Create spider and login
	spider := crawler.NewFenbiSpider(s.spiderConfig, s.logger)
	result, err := spider.Login(credential.Phone, password)
	if err != nil {
		// Update status to not logged in
		s.credRepo.UpdateLoginStatus(credential.ID, int(model.FenbiLoginStatusNotLoggedIn), "")
		return &LoginStatusResponse{
			IsLoggedIn: false,
			Status:     int(model.FenbiLoginStatusNotLoggedIn),
			StatusText: result.Message,
		}, err
	}

	// Update credential with cookies
	credential.Cookies = result.Cookies
	credential.CookieExpiresAt = result.ExpiresAt
	credential.LoginStatus = int(model.FenbiLoginStatusLoggedIn)
	now := time.Now()
	credential.LastLoginAt = &now
	credential.LastCheckAt = &now

	if err := s.credRepo.Update(credential); err != nil {
		s.logger.Error("Failed to update credential", zap.Error(err))
	}

	phoneMasked := ""
	if len(credential.Phone) >= 4 {
		phoneMasked = credential.Phone[:3] + "****" + credential.Phone[len(credential.Phone)-4:]
	}

	return &LoginStatusResponse{
		IsLoggedIn:      true,
		Status:          int(model.FenbiLoginStatusLoggedIn),
		StatusText:      "已登录",
		Phone:           credential.Phone,
		PhoneMasked:     phoneMasked,
		LastLoginAt:     credential.LastLoginAt,
		LastCheckAt:     credential.LastCheckAt,
		CookieExpiresAt: credential.CookieExpiresAt,
	}, nil
}

// ImportCookies imports cookies directly from browser or HAR file
func (s *FenbiService) ImportCookies(req *ImportCookiesRequest) (*LoginStatusResponse, error) {
	// Create spider to validate cookies
	spider := crawler.NewFenbiSpider(s.spiderConfig, s.logger)
	spider.SetCookies(req.Cookies)

	// Validate cookies by checking login status
	isValid, err := spider.CheckLoginStatus()
	if err != nil || !isValid {
		s.logger.Warn("Imported cookies are invalid",
			zap.Error(err),
			zap.Bool("is_valid", isValid),
		)
		return &LoginStatusResponse{
			IsLoggedIn: false,
			Status:     int(model.FenbiLoginStatusNotLoggedIn),
			StatusText: "Cookie无效或已过期",
		}, errors.New("imported cookies are invalid or expired")
	}

	// Find or create credential
	var credential *model.FenbiCredential
	existing, _ := s.credRepo.FindDefault()
	if existing != nil {
		credential = existing
	} else {
		// Create new credential with placeholder phone
		phone := req.Phone
		if phone == "" {
			phone = "imported_user"
		}
		credential = &model.FenbiCredential{
			Phone:     phone,
			IsDefault: true,
		}
		if err := s.credRepo.Create(credential); err != nil {
			return nil, err
		}
	}

	// Update credential with imported cookies
	credential.Cookies = req.Cookies
	credential.LoginStatus = int(model.FenbiLoginStatusLoggedIn)
	expiresAt := time.Now().Add(30 * 24 * time.Hour) // Assume 30 days expiration
	credential.CookieExpiresAt = &expiresAt
	now := time.Now()
	credential.LastLoginAt = &now
	credential.LastCheckAt = &now

	if err := s.credRepo.Update(credential); err != nil {
		return nil, err
	}

	phoneMasked := ""
	if len(credential.Phone) >= 4 {
		phoneMasked = credential.Phone[:3] + "****" + credential.Phone[len(credential.Phone)-4:]
	}

	s.logger.Info("Cookies imported successfully")

	return &LoginStatusResponse{
		IsLoggedIn:      true,
		Status:          int(model.FenbiLoginStatusLoggedIn),
		StatusText:      "已登录（通过Cookie导入）",
		Phone:           credential.Phone,
		PhoneMasked:     phoneMasked,
		LastLoginAt:     credential.LastLoginAt,
		LastCheckAt:     credential.LastCheckAt,
		CookieExpiresAt: credential.CookieExpiresAt,
	}, nil
}

func (s *FenbiService) CheckLoginStatus() (*LoginStatusResponse, error) {
	credential, err := s.credRepo.FindDefault()
	if err != nil {
		return &LoginStatusResponse{
			IsLoggedIn: false,
			Status:     int(model.FenbiLoginStatusNotLoggedIn),
			StatusText: "未配置账号",
		}, nil
	}

	phoneMasked := ""
	if len(credential.Phone) >= 4 {
		phoneMasked = credential.Phone[:3] + "****" + credential.Phone[len(credential.Phone)-4:]
	}

	// If not logged in or no cookies
	if credential.LoginStatus != int(model.FenbiLoginStatusLoggedIn) || credential.Cookies == "" {
		return &LoginStatusResponse{
			IsLoggedIn:  false,
			Status:      credential.LoginStatus,
			StatusText:  getLoginStatusText(credential.LoginStatus),
			Phone:       credential.Phone,
			PhoneMasked: phoneMasked,
			LastLoginAt: credential.LastLoginAt,
			LastCheckAt: credential.LastCheckAt,
		}, nil
	}

	now := time.Now()

	// Check if cookies have expired based on saved expiration time
	if credential.CookieExpiresAt != nil && credential.CookieExpiresAt.Before(now) {
		// Cookies have expired
		s.credRepo.UpdateLoginStatus(credential.ID, int(model.FenbiLoginStatusExpired), credential.Cookies)
		return &LoginStatusResponse{
			IsLoggedIn:      false,
			Status:          int(model.FenbiLoginStatusExpired),
			StatusText:      "登录已过期",
			Phone:           credential.Phone,
			PhoneMasked:     phoneMasked,
			LastLoginAt:     credential.LastLoginAt,
			LastCheckAt:     &now,
			CookieExpiresAt: credential.CookieExpiresAt,
		}, nil
	}

	// Update last check time
	s.credRepo.UpdateLastCheck(credential.ID)

	// If we have valid cookies and they haven't expired, consider logged in
	// Real validation will happen when actual crawl operations are performed
	return &LoginStatusResponse{
		IsLoggedIn:      true,
		Status:          int(model.FenbiLoginStatusLoggedIn),
		StatusText:      "已登录",
		Phone:           credential.Phone,
		PhoneMasked:     phoneMasked,
		LastLoginAt:     credential.LastLoginAt,
		LastCheckAt:     &now,
		CookieExpiresAt: credential.CookieExpiresAt,
	}, nil
}

// === Category Management ===

func (s *FenbiService) GetCategories(categoryType string) ([]model.FenbiCategory, error) {
	return s.categoryRepo.ListByType(categoryType, true)
}

func (s *FenbiService) GetAllCategories() (map[string][]model.FenbiCategory, error) {
	result := make(map[string][]model.FenbiCategory)

	regions, err := s.categoryRepo.ListByType(string(model.FenbiCategoryTypeRegion), true)
	if err != nil {
		return nil, err
	}
	result["regions"] = regions

	examTypes, err := s.categoryRepo.ListByType(string(model.FenbiCategoryTypeExamType), true)
	if err != nil {
		return nil, err
	}
	result["exam_types"] = examTypes

	years, err := s.categoryRepo.ListByType(string(model.FenbiCategoryTypeYear), true)
	if err != nil {
		return nil, err
	}
	result["years"] = years

	return result, nil
}

// === Crawler Operations ===

type TriggerCrawlRequest struct {
	Regions   []string `json:"regions"`
	ExamTypes []string `json:"exam_types"`
	Years     []int    `json:"years"`
}

type CrawlProgress struct {
	TotalTasks     int    `json:"total_tasks"`
	CompletedTasks int    `json:"completed_tasks"`
	CurrentTask    string `json:"current_task"`
	ItemsCrawled   int    `json:"items_crawled"`
	ItemsSaved     int    `json:"items_saved"`
	Status         string `json:"status"` // running, completed, failed
	Message        string `json:"message,omitempty"`
}

func (s *FenbiService) TriggerCrawl(req *TriggerCrawlRequest) (*CrawlProgress, error) {
	// Set crawl state
	s.crawlMutex.Lock()
	if s.crawlRunning {
		s.crawlMutex.Unlock()
		return nil, errors.New("crawl already running")
	}
	s.crawlRunning = true
	s.crawlStopped = false
	s.crawlMutex.Unlock()

	// Ensure we reset crawlRunning when done
	defer func() {
		s.crawlMutex.Lock()
		s.crawlRunning = false
		s.crawlMutex.Unlock()
	}()

	// Check login status first
	credential, err := s.credRepo.FindDefault()
	if err != nil {
		return nil, ErrCredentialNotFound
	}

	if credential.LoginStatus != int(model.FenbiLoginStatusLoggedIn) || credential.Cookies == "" {
		return nil, ErrNotLoggedIn
	}

	// Create spider and set cookies
	spider := crawler.NewFenbiSpider(s.spiderConfig, s.logger)
	spider.SetCookies(credential.Cookies)

	// Validate cookies with Fenbi API before crawling
	isValid, err := spider.CheckLoginStatus()
	if err != nil || !isValid {
		s.logger.Warn("Cookies invalid or expired, attempting auto re-login",
			zap.Error(err),
			zap.Bool("is_valid", isValid),
		)

		// Try to auto re-login using saved credentials
		password, err := decryptPassword(credential.PasswordEncrypted)
		if err != nil {
			s.logger.Error("Failed to decrypt password for auto re-login", zap.Error(err))
			s.credRepo.UpdateLoginStatus(credential.ID, int(model.FenbiLoginStatusExpired), credential.Cookies)
			return nil, ErrNotLoggedIn
		}

		// Perform login
		result, err := spider.Login(credential.Phone, password)
		if err != nil || !result.Success {
			s.logger.Error("Auto re-login failed", zap.Error(err))
			s.credRepo.UpdateLoginStatus(credential.ID, int(model.FenbiLoginStatusExpired), credential.Cookies)
			return nil, ErrNotLoggedIn
		}

		// Update credential with new cookies
		credential.Cookies = result.Cookies
		credential.CookieExpiresAt = result.ExpiresAt
		credential.LoginStatus = int(model.FenbiLoginStatusLoggedIn)
		now := time.Now()
		credential.LastLoginAt = &now
		credential.LastCheckAt = &now

		if err := s.credRepo.Update(credential); err != nil {
			s.logger.Error("Failed to update credential after auto re-login", zap.Error(err))
		}

		s.logger.Info("Auto re-login successful, cookies updated")
	}

	// Default values if empty
	if len(req.Regions) == 0 {
		req.Regions = []string{"all"}
	}
	if len(req.ExamTypes) == 0 {
		req.ExamTypes = []string{"shengkao"} // Default to provincial exam
	}
	if len(req.Years) == 0 {
		req.Years = []int{time.Now().Year()}
	}

	progress := &CrawlProgress{
		Status: "running",
	}

	// Calculate total tasks
	progress.TotalTasks = len(req.Regions) * len(req.ExamTypes) * len(req.Years)

	// Crawl each combination
crawlLoop:
	for _, region := range req.Regions {
		// Check if crawl was stopped
		s.crawlMutex.Lock()
		stopped := s.crawlStopped
		s.crawlMutex.Unlock()
		if stopped {
			s.logger.Info("Crawl stopped by user")
			progress.Status = "stopped"
			progress.Message = "爬取已停止"
			return progress, nil
		}

		// Get the fenbi_param_id for this region from database
		regionParamID := s.GetRegionParamID(region)

		for _, examType := range req.ExamTypes {
			// Check if crawl was stopped
			s.crawlMutex.Lock()
			stopped := s.crawlStopped
			s.crawlMutex.Unlock()
			if stopped {
				s.logger.Info("Crawl stopped by user")
				progress.Status = "stopped"
				progress.Message = "爬取已停止"
				return progress, nil
			}

			// Get the fenbi_param_id for this exam type from database
			examTypeParamID := s.GetExamTypeParamID(examType)

			for _, year := range req.Years {
				// Check if crawl was stopped
				s.crawlMutex.Lock()
				stopped := s.crawlStopped
				s.crawlMutex.Unlock()
				if stopped {
					s.logger.Info("Crawl stopped by user")
					progress.Status = "stopped"
					progress.Message = "爬取已停止"
					return progress, nil
				}

				progress.CurrentTask = s.formatTaskName(region, examType, year)

				// Crawl all pages for this combination
				// Pass regionParamID and examTypeParamID directly (numeric IDs) instead of codes
				page := 1
				for {
					// Check if crawl was stopped before each page request
					s.crawlMutex.Lock()
					stopped := s.crawlStopped
					s.crawlMutex.Unlock()
					if stopped {
						s.logger.Info("Crawl stopped by user during page crawl")
						progress.Status = "stopped"
						progress.Message = "爬取已停止"
						break crawlLoop
					}

					result, err := spider.CrawlAnnouncementList(regionParamID, examTypeParamID, year, page)
					if err != nil {
						s.logger.Error("Crawl failed",
							zap.String("region", region),
							zap.String("exam_type", examType),
							zap.Int("year", year),
							zap.Int("page", page),
							zap.Error(err),
						)
						break
					}

					progress.ItemsCrawled += result.TotalFound

					// Convert and save items
					announcements := s.convertToAnnouncements(result.Items, region, examType, year)
					saved, _ := s.announcementRepo.BatchUpsert(announcements)
					progress.ItemsSaved += saved

					if !result.HasNextPage || result.TotalFound == 0 {
						break
					}
					page++

					// Rate limiting
					time.Sleep(500 * time.Millisecond)
				}

				progress.CompletedTasks++
			}
		}
	}

	// Check if stopped during crawl
	s.crawlMutex.Lock()
	stopped := s.crawlStopped
	s.crawlMutex.Unlock()
	if stopped {
		progress.Status = "stopped"
		progress.Message = "爬取已停止"
	} else {
		progress.Status = "completed"
		progress.Message = "爬取完成"
	}

	return progress, nil
}

// StopCrawl stops the running crawl task
func (s *FenbiService) StopCrawl() error {
	s.crawlMutex.Lock()
	defer s.crawlMutex.Unlock()

	if !s.crawlRunning {
		return errors.New("no crawl task running")
	}

	s.crawlStopped = true
	s.logger.Info("Crawl stop requested")
	return nil
}

// IsCrawlRunning returns whether a crawl task is currently running
func (s *FenbiService) IsCrawlRunning() bool {
	s.crawlMutex.Lock()
	defer s.crawlMutex.Unlock()
	return s.crawlRunning
}

func (s *FenbiService) CrawlAnnouncementDetail(id uint) (*model.FenbiAnnouncement, error) {
	announcement, err := s.announcementRepo.FindByID(id)
	if err != nil {
		return nil, ErrFenbiAnnouncementNotFound
	}

	// Check login status
	credential, err := s.credRepo.FindDefault()
	if err != nil {
		return nil, ErrCredentialNotFound
	}

	if credential.LoginStatus != int(model.FenbiLoginStatusLoggedIn) || credential.Cookies == "" {
		return nil, ErrNotLoggedIn
	}

	// Create spider and set cookies
	spider := crawler.NewFenbiSpider(s.spiderConfig, s.logger)
	spider.SetCookies(credential.Cookies)

	// Validate cookies before crawling
	isValid, _ := spider.CheckLoginStatus()
	if !isValid {
		// Try auto re-login
		password, err := decryptPassword(credential.PasswordEncrypted)
		if err != nil || password == "" {
			s.credRepo.UpdateLoginStatus(credential.ID, int(model.FenbiLoginStatusExpired), credential.Cookies)
			return nil, ErrNotLoggedIn
		}

		result, err := spider.Login(credential.Phone, password)
		if err != nil || !result.Success {
			s.credRepo.UpdateLoginStatus(credential.ID, int(model.FenbiLoginStatusExpired), credential.Cookies)
			return nil, ErrNotLoggedIn
		}

		// Update credential with new cookies
		credential.Cookies = result.Cookies
		credential.CookieExpiresAt = result.ExpiresAt
		credential.LoginStatus = int(model.FenbiLoginStatusLoggedIn)
		now := time.Now()
		credential.LastLoginAt = &now
		s.credRepo.Update(credential)
	}

	// Crawl detail
	detail, err := spider.CrawlAnnouncementDetail(announcement.FenbiID)
	if err != nil {
		return nil, err
	}

	// Update announcement with original URL
	if detail.OriginalURL != "" {
		announcement.OriginalURL = detail.OriginalURL

		// If original URL is a short URL (t.fenbi.com), resolve it to get the final URL
		if crawler.IsShortURL(detail.OriginalURL) {
			s.logger.Info("Resolving short URL for announcement",
				zap.Uint("id", announcement.ID),
				zap.String("short_url", detail.OriginalURL),
			)
			finalURL, resolveErr := spider.ResolveShortURL(detail.OriginalURL)
			if resolveErr != nil {
				s.logger.Warn("Failed to resolve short URL",
					zap.String("short_url", detail.OriginalURL),
					zap.Error(resolveErr),
				)
			} else if finalURL != "" {
				announcement.FinalURL = finalURL
				s.logger.Info("Resolved short URL successfully",
					zap.String("short_url", detail.OriginalURL),
					zap.String("final_url", finalURL),
				)
			}
		}
	}
	announcement.CrawlStatus = int(model.FenbiCrawlStatusDetailCrawled)

	if err := s.announcementRepo.Update(announcement); err != nil {
		return nil, err
	}

	return announcement, nil
}

func (s *FenbiService) BatchCrawlDetails(limit int) (int, error) {
	// Get pending announcements
	announcements, err := s.announcementRepo.ListPendingDetails(limit)
	if err != nil {
		return 0, err
	}

	if len(announcements) == 0 {
		return 0, nil
	}

	// Check login status
	credential, err := s.credRepo.FindDefault()
	if err != nil {
		return 0, ErrCredentialNotFound
	}

	if credential.LoginStatus != int(model.FenbiLoginStatusLoggedIn) || credential.Cookies == "" {
		return 0, ErrNotLoggedIn
	}

	// Create spider and set cookies
	spider := crawler.NewFenbiSpider(s.spiderConfig, s.logger)
	spider.SetCookies(credential.Cookies)

	// Validate cookies before crawling
	isValid, _ := spider.CheckLoginStatus()
	if !isValid {
		// Try auto re-login
		password, err := decryptPassword(credential.PasswordEncrypted)
		if err != nil || password == "" {
			s.credRepo.UpdateLoginStatus(credential.ID, int(model.FenbiLoginStatusExpired), credential.Cookies)
			return 0, ErrNotLoggedIn
		}

		result, err := spider.Login(credential.Phone, password)
		if err != nil || !result.Success {
			s.credRepo.UpdateLoginStatus(credential.ID, int(model.FenbiLoginStatusExpired), credential.Cookies)
			return 0, ErrNotLoggedIn
		}

		// Update credential with new cookies
		credential.Cookies = result.Cookies
		credential.CookieExpiresAt = result.ExpiresAt
		credential.LoginStatus = int(model.FenbiLoginStatusLoggedIn)
		now := time.Now()
		credential.LastLoginAt = &now
		s.credRepo.Update(credential)
	}

	crawled := 0
	for _, ann := range announcements {
		detail, err := spider.CrawlAnnouncementDetail(ann.FenbiID)
		if err != nil {
			s.logger.Error("Failed to crawl detail",
				zap.String("fenbi_id", ann.FenbiID),
				zap.Error(err),
			)
			continue
		}

		// Update announcement
		if detail.OriginalURL != "" {
			originalURL := detail.OriginalURL
			finalURL := ""

			// If original URL is a short URL (t.fenbi.com), resolve it to get the final URL
			if crawler.IsShortURL(originalURL) {
				s.logger.Info("Resolving short URL for announcement",
					zap.Uint("id", ann.ID),
					zap.String("short_url", originalURL),
				)
				resolved, resolveErr := spider.ResolveShortURL(originalURL)
				if resolveErr != nil {
					s.logger.Warn("Failed to resolve short URL",
						zap.String("short_url", originalURL),
						zap.Error(resolveErr),
					)
				} else if resolved != "" {
					finalURL = resolved
					s.logger.Info("Resolved short URL successfully",
						zap.String("short_url", originalURL),
						zap.String("final_url", finalURL),
					)
				}
			}

			s.announcementRepo.UpdateURLs(ann.ID, originalURL, finalURL)
		} else {
			s.announcementRepo.UpdateCrawlStatus(ann.ID, int(model.FenbiCrawlStatusDetailCrawled))
		}

		crawled++
		time.Sleep(500 * time.Millisecond) // Rate limiting
	}

	return crawled, nil
}

// === Announcement Queries ===

type ListAnnouncementsRequest struct {
	RegionCode   string `json:"region_code"`
	ExamTypeCode string `json:"exam_type_code"`
	Year         int    `json:"year"`
	CrawlStatus  *int   `json:"crawl_status"`
	Keyword      string `json:"keyword"`
	Page         int    `json:"page"`
	PageSize     int    `json:"page_size"`
}

type ListAnnouncementsResponse struct {
	Announcements []model.FenbiAnnouncement `json:"announcements"`
	Total         int64                     `json:"total"`
	Page          int                       `json:"page"`
	PageSize      int                       `json:"page_size"`
}

func (s *FenbiService) ListAnnouncements(req *ListAnnouncementsRequest) (*ListAnnouncementsResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}

	params := &repository.FenbiAnnouncementListParams{
		RegionCode:   req.RegionCode,
		ExamTypeCode: req.ExamTypeCode,
		Year:         req.Year,
		CrawlStatus:  req.CrawlStatus,
		Keyword:      req.Keyword,
		Page:         req.Page,
		PageSize:     req.PageSize,
	}

	announcements, total, err := s.announcementRepo.List(params)
	if err != nil {
		return nil, err
	}

	return &ListAnnouncementsResponse{
		Announcements: announcements,
		Total:         total,
		Page:          req.Page,
		PageSize:      req.PageSize,
	}, nil
}

func (s *FenbiService) GetAnnouncementStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	total, _ := s.announcementRepo.GetTotalCount()
	stats["total"] = total

	byCrawlStatus, _ := s.announcementRepo.GetStatsByCrawlStatus()
	stats["by_crawl_status"] = byCrawlStatus

	byRegion, _ := s.announcementRepo.GetStatsByRegion()
	stats["by_region"] = byRegion

	byYear, _ := s.announcementRepo.GetStatsByYear()
	stats["by_year"] = byYear

	return stats, nil
}

// TestCrawlResult represents the result of a test crawl
type TestCrawlResult struct {
	Success    bool             `json:"success"`
	Message    string           `json:"message"`
	TestResult *TestCrawlDetail `json:"test_result,omitempty"`
}

// TestCrawlDetail contains the detailed test crawl results
type TestCrawlDetail struct {
	AnnouncementID uint                   `json:"announcement_id,omitempty"`
	Title          string                 `json:"title,omitempty"`
	FenbiURL       string                 `json:"fenbi_url,omitempty"`
	OriginalURL    string                 `json:"original_url,omitempty"`
	FinalURL       string                 `json:"final_url,omitempty"`
	PageContent    *PageContentResult     `json:"page_content,omitempty"`
	Attachments    []AttachmentResult     `json:"attachments,omitempty"`
	LLMAnalysis    *LLMAnalysisResult     `json:"llm_analysis,omitempty"`
	RawData        map[string]interface{} `json:"raw_data,omitempty"`
}

// PageContentResult holds the fetched page content
type PageContentResult struct {
	Title   string `json:"title"`
	Content string `json:"content"`
	HTML    string `json:"html,omitempty"`
}

// AttachmentResult holds information about a downloaded and parsed attachment
type AttachmentResult struct {
	Name      string `json:"name"`
	URL       string `json:"url"`
	Type      string `json:"type"`
	LocalPath string `json:"local_path,omitempty"`
	Content   string `json:"content,omitempty"`
	Error     string `json:"error,omitempty"`
}

// LLMAnalysisResult holds the LLM analysis results
type LLMAnalysisResult struct {
	Summary     string                  `json:"summary"`
	Positions   []ExtractedPositionInfo `json:"positions,omitempty"`
	ExamInfo    *ExtractedExamInfo      `json:"exam_info,omitempty"`
	Confidence  int                     `json:"confidence"`
	RawResponse string                  `json:"raw_response,omitempty"`
	Error       string                  `json:"error,omitempty"`
}

// ExtractedPositionInfo is a simplified position info for TestCrawl result
type ExtractedPositionInfo struct {
	PositionName   string   `json:"position_name"`
	DepartmentName string   `json:"department_name"`
	RecruitCount   int      `json:"recruit_count"`
	Education      string   `json:"education,omitempty"`
	Major          []string `json:"major,omitempty"`
	WorkLocation   string   `json:"work_location,omitempty"`
}

// ExtractedExamInfo holds exam information extracted by LLM
type ExtractedExamInfo struct {
	ExamType          string `json:"exam_type,omitempty"`
	RegistrationStart string `json:"registration_start,omitempty"`
	RegistrationEnd   string `json:"registration_end,omitempty"`
	ExamDate          string `json:"exam_date,omitempty"`
}

// ParseURLResult represents the result of parsing a URL
type ParseURLResult struct {
	Success bool          `json:"success"`
	Steps   []ParseStep   `json:"steps"`
	Data    *ParseURLData `json:"data,omitempty"`
	Error   string        `json:"error,omitempty"`
}

// ParseStep represents a step in the parsing process
type ParseStep struct {
	Name     string `json:"name"`
	Status   string `json:"status"` // "success", "error", "skipped"
	Message  string `json:"message"`
	Duration int64  `json:"duration_ms"`
	Details  string `json:"details,omitempty"`
}

// ParseURLData contains the parsed data from the URL
type ParseURLData struct {
	InputURL    string             `json:"input_url"`
	FinalURL    string             `json:"final_url,omitempty"`
	PageTitle   string             `json:"page_title,omitempty"`
	PageContent string             `json:"page_content,omitempty"`
	Attachments []AttachmentResult `json:"attachments,omitempty"`
	LLMAnalysis *LLMAnalysisResult `json:"llm_analysis,omitempty"`
}

// TestCrawl tests the cookie-based crawling by fetching a sample announcement
// Each test fetches fresh data from Fenbi API and randomly selects an item to test
func (s *FenbiService) TestCrawl() (*TestCrawlResult, error) {
	// Check login status
	credential, err := s.credRepo.FindDefault()
	if err != nil {
		return &TestCrawlResult{
			Success: false,
			Message: "未配置粉笔账号",
			TestResult: &TestCrawlDetail{
				RawData: map[string]interface{}{
					"error": "credential not found",
				},
			},
		}, ErrCredentialNotFound
	}

	if credential.LoginStatus != int(model.FenbiLoginStatusLoggedIn) || credential.Cookies == "" {
		return &TestCrawlResult{
			Success: false,
			Message: "未登录或Cookie为空，请先登录或导入Cookie",
			TestResult: &TestCrawlDetail{
				RawData: map[string]interface{}{
					"login_status":    credential.LoginStatus,
					"has_cookies":     credential.Cookies != "",
					"cookies_preview": s.getCookiesPreview(credential.Cookies),
				},
			},
		}, ErrNotLoggedIn
	}

	// Create spider and set cookies
	spider := crawler.NewFenbiSpider(s.spiderConfig, s.logger)
	spider.SetCookies(credential.Cookies)

	// First, get detailed login status for debugging
	loginDetails := spider.CheckLoginStatusWithDetails()
	isValid := loginDetails["any_valid"].(bool)

	if !isValid {
		s.logger.Warn("Test crawl: cookies invalid", zap.Any("login_details", loginDetails))

		return &TestCrawlResult{
			Success: false,
			Message: "Cookie已失效，请重新登录或导入新的Cookie",
			TestResult: &TestCrawlDetail{
				RawData: map[string]interface{}{
					"login_check_details": loginDetails,
					"cookies_preview":     s.getCookiesPreview(credential.Cookies),
					"credential_phone":    credential.Phone,
					"last_login_at":       credential.LastLoginAt,
					"last_check_at":       credential.LastCheckAt,
					"cookie_expires":      credential.CookieExpiresAt,
				},
			},
		}, nil
	}

	// Always fetch fresh data from Fenbi API for testing
	// Initialize random seed with current nanoseconds for true randomness
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	// Use a random page (1-10) to get different results each time
	randomPage := rng.Intn(10) + 1
	// Also randomize the year between current year and previous year
	currentYear := time.Now().Year()
	randomYear := currentYear - rng.Intn(2) // Current year or last year

	s.logger.Info("Test crawl: fetching fresh data from Fenbi API",
		zap.Int("random_page", randomPage),
		zap.Int("random_year", randomYear),
	)

	result, err := spider.CrawlAnnouncementList("", "", randomYear, randomPage)
	if err != nil {
		return &TestCrawlResult{
			Success: false,
			Message: "测试列表爬取失败: " + err.Error(),
			TestResult: &TestCrawlDetail{
				RawData: map[string]interface{}{
					"error":       err.Error(),
					"random_page": randomPage,
					"random_year": randomYear,
				},
			},
		}, nil
	}

	if len(result.Items) == 0 {
		return &TestCrawlResult{
			Success: true,
			Message: "Cookie有效，但未找到可测试的公告数据",
			TestResult: &TestCrawlDetail{
				RawData: map[string]interface{}{
					"list_crawl_result": result,
					"random_page":       randomPage,
					"random_year":       randomYear,
				},
			},
		}, nil
	}

	// Randomly select an item from the list for detailed testing
	randomIndex := rng.Intn(len(result.Items))
	selectedItem := result.Items[randomIndex]

	s.logger.Info("Test crawl: randomly selected item",
		zap.Int("random_index", randomIndex),
		zap.Int("total_items", len(result.Items)),
		zap.String("fenbi_id", selectedItem.FenbiID),
		zap.String("title", selectedItem.Title),
	)

	// Now test crawling the detail page to get original URL
	detail, rawHTML, err := spider.CrawlAnnouncementDetailWithHTML(selectedItem.FenbiID)

	// Save the raw HTML to a file for debugging (with timestamp to avoid overwriting)
	// Files are saved to temp folder to avoid cluttering the root directory
	tempDir := "temp"
	if mkdirErr := os.MkdirAll(tempDir, 0755); mkdirErr != nil {
		s.logger.Warn("Failed to create temp directory", zap.Error(mkdirErr))
	}
	timestamp := time.Now().Format("20060102_150405")
	htmlFilePath := fmt.Sprintf("%s/fenbi_test_detail_%s_%s.html", tempDir, selectedItem.FenbiID, timestamp)
	if writeErr := os.WriteFile(htmlFilePath, []byte(rawHTML), 0644); writeErr != nil {
		s.logger.Warn("Failed to save HTML file", zap.Error(writeErr))
	} else {
		s.logger.Info("Saved HTML to file", zap.String("path", htmlFilePath))
	}

	if err != nil {
		return &TestCrawlResult{
			Success: false,
			Message: "测试详情爬取失败: " + err.Error(),
			TestResult: &TestCrawlDetail{
				Title:    selectedItem.Title,
				FenbiURL: selectedItem.FenbiURL,
				RawData: map[string]interface{}{
					"html_file":    htmlFilePath,
					"html_length":  len(rawHTML),
					"error":        err.Error(),
					"fenbi_id":     selectedItem.FenbiID,
					"random_page":  randomPage,
					"random_year":  randomYear,
					"random_index": randomIndex,
				},
			},
		}, nil
	}

	// Try to resolve the short URL to get the final URL
	finalURL := ""
	if detail.OriginalURL != "" && crawler.IsShortURL(detail.OriginalURL) {
		s.logger.Info("Test crawl: Resolving short URL",
			zap.String("short_url", detail.OriginalURL),
		)
		resolved, resolveErr := spider.ResolveShortURL(detail.OriginalURL)
		if resolveErr != nil {
			s.logger.Warn("Test crawl: Failed to resolve short URL",
				zap.String("short_url", detail.OriginalURL),
				zap.Error(resolveErr),
			)
		} else if resolved != "" {
			finalURL = resolved
			s.logger.Info("Test crawl: Resolved short URL successfully",
				zap.String("short_url", detail.OriginalURL),
				zap.String("final_url", finalURL),
			)
		}
	}

	// Initialize test result with basic info
	testResult := &TestCrawlDetail{
		Title:       selectedItem.Title,
		FenbiURL:    selectedItem.FenbiURL,
		OriginalURL: detail.OriginalURL,
		FinalURL:    finalURL,
		RawData: map[string]interface{}{
			"html_file":    htmlFilePath,
			"html_length":  len(rawHTML),
			"fenbi_id":     selectedItem.FenbiID,
			"title":        selectedItem.Title,
			"fenbi_url":    selectedItem.FenbiURL,
			"original_url": detail.OriginalURL,
			"final_url":    finalURL,
			"region_code":  selectedItem.RegionCode,
			"region_name":  selectedItem.RegionName,
			"exam_type":    selectedItem.ExamTypeCode,
			"year":         selectedItem.Year,
			"publish_date": selectedItem.PublishDate,
			"random_page":  randomPage,
			"random_year":  randomYear,
			"random_index": randomIndex,
			"total_items":  len(result.Items),
			"test_time":    time.Now().Format("2006-01-02 15:04:05"),
		},
	}

	// === Enhanced flow: Fetch page content, download attachments, LLM analysis ===
	if finalURL != "" {
		s.logger.Info("Test crawl: Starting enhanced flow - fetching final URL content",
			zap.String("final_url", finalURL),
		)

		// Step 1: Fetch page content
		pageContent, fetchErr := spider.FetchPageContent(finalURL)
		if fetchErr != nil {
			s.logger.Warn("Test crawl: Failed to fetch page content",
				zap.String("url", finalURL),
				zap.Error(fetchErr),
			)
			testResult.PageContent = &PageContentResult{
				Title:   "",
				Content: fmt.Sprintf("获取页面内容失败: %v", fetchErr),
			}
		} else {
			s.logger.Info("Test crawl: Fetched page content successfully",
				zap.String("title", pageContent.Title),
				zap.Int("text_length", len(pageContent.Text)),
				zap.Int("attachments_count", len(pageContent.Attachments)),
			)

			// Truncate content for display (max 5000 chars)
			contentPreview := pageContent.Text
			if len(contentPreview) > 5000 {
				contentPreview = contentPreview[:5000] + "...(内容已截断)"
			}

			testResult.PageContent = &PageContentResult{
				Title:   pageContent.Title,
				Content: contentPreview,
			}

			// Step 2: Download and parse attachments
			if len(pageContent.Attachments) > 0 {
				testResult.Attachments = s.processAttachments(spider, pageContent.Attachments)
			}

			// Step 3: LLM Analysis (use default LLM config)
			testResult.LLMAnalysis = s.performLLMAnalysis(pageContent, testResult.Attachments, 0)
		}
	}

	// Build message
	message := "Cookie有效，成功获取公告详情"
	if detail.OriginalURL != "" {
		message += "和原始链接"
		if finalURL != "" {
			message += "，并成功解析最终跳转URL"
			if testResult.PageContent != nil && testResult.PageContent.Title != "" {
				message += "，已获取原文页面内容"
			}
			if len(testResult.Attachments) > 0 {
				message += fmt.Sprintf("，发现%d个附件", len(testResult.Attachments))
			}
			if testResult.LLMAnalysis != nil && testResult.LLMAnalysis.Error == "" {
				message += "，LLM分析完成"
			}
		}
	} else {
		message += "，但未找到原始链接（HTML已保存到文件供检查）"
	}

	return &TestCrawlResult{
		Success:    true,
		Message:    message,
		TestResult: testResult,
	}, nil
}

// ParseURL parses a specific URL and returns detailed analysis with process steps
// llmConfigID: optional LLM config ID to use (0 = use default)
func (s *FenbiService) ParseURL(inputURL string, llmConfigID uint) (*ParseURLResult, error) {
	result := &ParseURLResult{
		Steps: make([]ParseStep, 0),
		Data: &ParseURLData{
			InputURL: inputURL,
		},
	}

	// Check login status
	credential, err := s.credRepo.FindDefault()
	if err != nil {
		result.Success = false
		result.Error = "未配置粉笔账号"
		return result, ErrCredentialNotFound
	}

	if credential.LoginStatus != int(model.FenbiLoginStatusLoggedIn) || credential.Cookies == "" {
		result.Success = false
		result.Error = "未登录或Cookie为空，请先登录或导入Cookie"
		return result, ErrNotLoggedIn
	}

	// Create spider and set cookies
	spider := crawler.NewFenbiSpider(s.spiderConfig, s.logger)
	spider.SetCookies(credential.Cookies)

	// Step 0: If this is a Fenbi detail page URL, extract the original short URL first
	stepStart := time.Now()
	currentURL := inputURL
	if crawler.IsFenbiDetailURL(inputURL) {
		s.logger.Info("ParseURL: Detected Fenbi detail page URL, extracting original URL",
			zap.String("url", inputURL),
		)

		fenbiID := crawler.ExtractFenbiIDFromURL(inputURL)
		if fenbiID == "" {
			result.Steps = append(result.Steps, ParseStep{
				Name:     "提取粉笔原文链接",
				Status:   "error",
				Message:  "无法从URL提取粉笔公告ID",
				Duration: time.Since(stepStart).Milliseconds(),
				Details:  fmt.Sprintf("输入URL: %s", inputURL),
			})
		} else {
			// Crawl the Fenbi detail page to get the original URL
			detail, crawlErr := spider.CrawlAnnouncementDetail(fenbiID)
			if crawlErr != nil {
				result.Steps = append(result.Steps, ParseStep{
					Name:     "提取粉笔原文链接",
					Status:   "error",
					Message:  fmt.Sprintf("爬取粉笔详情页失败: %v", crawlErr),
					Duration: time.Since(stepStart).Milliseconds(),
					Details:  fmt.Sprintf("粉笔ID: %s\n输入URL: %s", fenbiID, inputURL),
				})
			} else if detail.OriginalURL == "" {
				result.Steps = append(result.Steps, ParseStep{
					Name:     "提取粉笔原文链接",
					Status:   "error",
					Message:  "粉笔详情页未找到原文链接",
					Duration: time.Since(stepStart).Milliseconds(),
					Details:  fmt.Sprintf("粉笔ID: %s\n标题: %s", fenbiID, detail.Title),
				})
			} else {
				currentURL = detail.OriginalURL
				result.Steps = append(result.Steps, ParseStep{
					Name:     "提取粉笔原文链接",
					Status:   "success",
					Message:  fmt.Sprintf("成功提取原文链接: %s", detail.OriginalURL),
					Duration: time.Since(stepStart).Milliseconds(),
					Details:  fmt.Sprintf("粉笔ID: %s\n标题: %s\n原文短链接: %s", fenbiID, detail.Title, detail.OriginalURL),
				})
				s.logger.Info("ParseURL: Extracted original URL from Fenbi detail page",
					zap.String("fenbi_id", fenbiID),
					zap.String("original_url", detail.OriginalURL),
				)
			}
		}
	} else {
		result.Steps = append(result.Steps, ParseStep{
			Name:     "提取粉笔原文链接",
			Status:   "skipped",
			Message:  "非粉笔详情页链接，跳过提取",
			Duration: time.Since(stepStart).Milliseconds(),
		})
	}

	// Step 1: Resolve short URL if needed
	stepStart = time.Now()
	finalURL := currentURL
	if crawler.IsShortURL(currentURL) {
		s.logger.Info("ParseURL: Resolving short URL", zap.String("url", currentURL))
		resolved, resolveErr := spider.ResolveShortURL(currentURL)
		if resolveErr != nil {
			result.Steps = append(result.Steps, ParseStep{
				Name:     "解析短链接",
				Status:   "error",
				Message:  fmt.Sprintf("解析失败: %v", resolveErr),
				Duration: time.Since(stepStart).Milliseconds(),
			})
		} else if resolved != "" {
			finalURL = resolved
			result.Steps = append(result.Steps, ParseStep{
				Name:     "解析短链接",
				Status:   "success",
				Message:  "成功解析短链接",
				Duration: time.Since(stepStart).Milliseconds(),
				Details:  fmt.Sprintf("短链接: %s\n最终URL: %s", currentURL, finalURL),
			})
		}
	} else {
		result.Steps = append(result.Steps, ParseStep{
			Name:     "解析短链接",
			Status:   "skipped",
			Message:  "非粉笔短链接，跳过解析",
			Duration: time.Since(stepStart).Milliseconds(),
		})
	}
	result.Data.FinalURL = finalURL

	// Step 2: Fetch page content
	stepStart = time.Now()
	pageContent, fetchErr := spider.FetchPageContent(finalURL)
	if fetchErr != nil {
		result.Steps = append(result.Steps, ParseStep{
			Name:     "获取页面内容",
			Status:   "error",
			Message:  fmt.Sprintf("获取失败: %v", fetchErr),
			Duration: time.Since(stepStart).Milliseconds(),
		})
		result.Success = false
		result.Error = fmt.Sprintf("获取页面内容失败: %v", fetchErr)
		return result, nil
	}

	result.Steps = append(result.Steps, ParseStep{
		Name:     "获取页面内容",
		Status:   "success",
		Message:  fmt.Sprintf("成功获取页面，标题: %s", pageContent.Title),
		Duration: time.Since(stepStart).Milliseconds(),
		Details:  fmt.Sprintf("内容长度: %d 字符\n发现附件: %d 个", len(pageContent.Text), len(pageContent.Attachments)),
	})
	result.Data.PageTitle = pageContent.Title

	// Truncate content for response
	contentPreview := pageContent.Text
	if len(contentPreview) > 10000 {
		contentPreview = contentPreview[:10000] + "\n\n...(内容已截断，共" + fmt.Sprintf("%d", len(pageContent.Text)) + "字符)"
	}
	result.Data.PageContent = contentPreview

	// Step 3: Process attachments
	if len(pageContent.Attachments) > 0 {
		stepStart = time.Now()
		attachmentResults := s.processAttachments(spider, pageContent.Attachments)
		result.Data.Attachments = attachmentResults

		successCount := 0
		errorCount := 0
		for _, att := range attachmentResults {
			if att.Error == "" {
				successCount++
			} else {
				errorCount++
			}
		}

		stepStatus := "success"
		if errorCount > 0 && successCount == 0 {
			stepStatus = "error"
		} else if errorCount > 0 {
			stepStatus = "partial"
		}

		var detailsBuilder strings.Builder
		for _, att := range attachmentResults {
			if att.Error != "" {
				detailsBuilder.WriteString(fmt.Sprintf("- %s (%s): 失败 - %s\n", att.Name, att.Type, att.Error))
			} else {
				contentLen := len(att.Content)
				detailsBuilder.WriteString(fmt.Sprintf("- %s (%s): 成功，提取 %d 字符\n", att.Name, att.Type, contentLen))
			}
		}

		result.Steps = append(result.Steps, ParseStep{
			Name:     "下载解析附件",
			Status:   stepStatus,
			Message:  fmt.Sprintf("处理 %d 个附件，成功 %d 个，失败 %d 个", len(attachmentResults), successCount, errorCount),
			Duration: time.Since(stepStart).Milliseconds(),
			Details:  detailsBuilder.String(),
		})
	} else {
		result.Steps = append(result.Steps, ParseStep{
			Name:     "下载解析附件",
			Status:   "skipped",
			Message:  "页面无附件",
			Duration: 0,
		})
	}

	// Step 4: LLM Analysis
	stepStart = time.Now()
	llmResult := s.performLLMAnalysis(pageContent, result.Data.Attachments, llmConfigID)
	result.Data.LLMAnalysis = llmResult

	if llmResult.Error != "" {
		result.Steps = append(result.Steps, ParseStep{
			Name:     "LLM智能分析",
			Status:   "error",
			Message:  llmResult.Error,
			Duration: time.Since(stepStart).Milliseconds(),
		})
	} else {
		posCount := len(llmResult.Positions)
		var llmDetails strings.Builder
		llmDetails.WriteString(fmt.Sprintf("摘要: %s\n", llmResult.Summary))
		if posCount > 0 {
			llmDetails.WriteString(fmt.Sprintf("\n提取职位数: %d\n", posCount))
			for i, pos := range llmResult.Positions {
				if i >= 3 {
					llmDetails.WriteString(fmt.Sprintf("...还有 %d 个职位\n", posCount-3))
					break
				}
				llmDetails.WriteString(fmt.Sprintf("- %s (%s)\n", pos.PositionName, pos.DepartmentName))
			}
		}
		if llmResult.ExamInfo != nil {
			llmDetails.WriteString(fmt.Sprintf("\n考试类型: %s\n", llmResult.ExamInfo.ExamType))
			if llmResult.ExamInfo.RegistrationEnd != "" {
				llmDetails.WriteString(fmt.Sprintf("报名截止: %s\n", llmResult.ExamInfo.RegistrationEnd))
			}
		}

		result.Steps = append(result.Steps, ParseStep{
			Name:     "LLM智能分析",
			Status:   "success",
			Message:  fmt.Sprintf("分析完成，置信度: %d%%，提取职位: %d 个", llmResult.Confidence, posCount),
			Duration: time.Since(stepStart).Milliseconds(),
			Details:  llmDetails.String(),
		})
	}

	result.Success = true
	return result, nil
}

// processAttachments downloads and parses attachments
func (s *FenbiService) processAttachments(spider *crawler.FenbiSpider, attachments []crawler.PageAttachment) []AttachmentResult {
	results := make([]AttachmentResult, 0, len(attachments))

	// Create temp directory for attachments
	tempDir := filepath.Join("temp", "fenbi_attachments", time.Now().Format("20060102_150405"))
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		s.logger.Warn("Failed to create temp directory", zap.Error(err))
	}

	for i, att := range attachments {
		// Limit to first 3 attachments for testing
		if i >= 3 {
			break
		}

		result := AttachmentResult{
			Name: att.Name,
			URL:  att.URL,
			Type: att.Type,
		}

		// Generate local path
		fileName := fmt.Sprintf("%d_%s", i+1, att.Name)
		// Sanitize filename
		fileName = strings.ReplaceAll(fileName, "/", "_")
		fileName = strings.ReplaceAll(fileName, "\\", "_")
		localPath := filepath.Join(tempDir, fileName)

		s.logger.Info("Downloading attachment",
			zap.String("name", att.Name),
			zap.String("url", att.URL),
			zap.String("type", att.Type),
			zap.String("local_path", localPath),
		)

		// Download file
		if err := spider.DownloadFile(att.URL, localPath); err != nil {
			s.logger.Warn("Failed to download attachment",
				zap.String("name", att.Name),
				zap.Error(err),
			)
			result.Error = fmt.Sprintf("下载失败: %v", err)
			results = append(results, result)
			continue
		}

		result.LocalPath = localPath

		// Parse content based on type
		content, parseErr := s.parseAttachmentContent(localPath, att.Type)
		if parseErr != nil {
			s.logger.Warn("Failed to parse attachment",
				zap.String("name", att.Name),
				zap.Error(parseErr),
			)
			result.Error = fmt.Sprintf("解析失败: %v", parseErr)
		} else {
			// Store full content - no truncation for LLM analysis
			result.Content = content
			s.logger.Info("Parsed attachment content",
				zap.String("name", att.Name),
				zap.Int("content_length", len(content)),
			)
		}

		results = append(results, result)
	}

	return results
}

// parseAttachmentContent parses attachment content based on file type
func (s *FenbiService) parseAttachmentContent(filePath, fileType string) (string, error) {
	switch fileType {
	case "pdf":
		pdfParser := parser.NewPDFParser(s.logger)
		return pdfParser.ExtractText(filePath)
	case "word":
		wordParser := parser.NewWordParser(s.logger)
		return wordParser.ExtractText(filePath)
	case "excel":
		excelParser := parser.NewExcelParser(s.logger)
		return excelParser.ExtractText(filePath)
	default:
		return "", fmt.Errorf("unsupported file type: %s", fileType)
	}
}

// performLLMAnalysis uses LLM to analyze page content and attachments
// llmConfigID: optional LLM config ID to use (0 = use default)
func (s *FenbiService) performLLMAnalysis(pageContent *crawler.PageContent, attachments []AttachmentResult, llmConfigID uint) *LLMAnalysisResult {
	result := &LLMAnalysisResult{}

	// Check if LLM service is available
	if s.llmConfigService == nil {
		result.Error = "LLM服务未配置"
		return result
	}

	// Build prompt for LLM analysis
	var promptBuilder strings.Builder
	promptBuilder.WriteString(`你是一个专业的公务员/事业单位招聘公告分析助手。请仔细分析以下招聘公告内容，**特别注意从附件（如岗位表、职位表）中提取详细的职位信息**。

## 分析任务
1. 提取公告摘要（包含招录总人数、招录单位数量、报名时间等关键信息）
2. **重点任务**：从附件的职位表/岗位表中提取每个具体职位的详细信息
3. 提取考试相关时间信息

`)
	promptBuilder.WriteString("## 公告标题\n")
	promptBuilder.WriteString(pageContent.Title)
	promptBuilder.WriteString("\n\n## 公告正文\n")

	// Include full content - Gemini supports 1M tokens
	promptBuilder.WriteString(pageContent.Text)

	// Add attachment content - NO truncation for attachments as they contain the position table
	// Gemini 1.5 Pro supports 1M tokens, so we can include very large attachment content
	hasAttachments := false
	totalAttachmentChars := 0
	const maxTotalAttachmentChars = 2000000 // 2M chars total for all attachments (~500k tokens)

	for _, att := range attachments {
		if att.Content != "" && att.Error == "" {
			hasAttachments = true
			promptBuilder.WriteString(fmt.Sprintf("\n\n## 附件: %s\n", att.Name))
			promptBuilder.WriteString("**请从此附件中提取所有职位信息**\n")

			attContent := att.Content
			remainingChars := maxTotalAttachmentChars - totalAttachmentChars

			// Only truncate if we're approaching the total limit
			if len(attContent) > remainingChars && remainingChars > 0 {
				attContent = attContent[:remainingChars] + fmt.Sprintf("...(附件内容已截断，原始长度: %d 字符)", len(att.Content))
				s.logger.Warn("Attachment content truncated due to total limit",
					zap.String("attachment", att.Name),
					zap.Int("original_length", len(att.Content)),
					zap.Int("truncated_to", remainingChars),
				)
			}

			promptBuilder.WriteString(attContent)
			totalAttachmentChars += len(attContent)

			s.logger.Info("Added attachment content to LLM prompt",
				zap.String("attachment", att.Name),
				zap.Int("content_length", len(attContent)),
				zap.Int("total_attachment_chars", totalAttachmentChars),
			)
		}
	}

	if hasAttachments {
		promptBuilder.WriteString("\n\n**重要提示**：请务必从上述附件中提取所有职位信息，每个职位单独列出。\n")
	}

	promptBuilder.WriteString("\n\n请严格按照以下JSON格式返回分析结果（直接返回JSON，不要添加markdown代码块）：\n")
	promptBuilder.WriteString(`{
  "summary": "公告摘要，需包含：招录总人数、涉及单位数量、报名方式、考试方式等(150-300字)",
  "positions": [
    {
      "position_name": "具体职位名称（必填）",
      "department_name": "招录单位/部门名称",
      "recruit_count": 招录人数(数字，必填),
      "education": "学历要求（如：本科及以上、研究生等）",
      "major": ["专业要求列表，多个专业用数组"],
      "work_location": "工作地点"
    }
  ],
  "exam_info": {
    "exam_type": "考试类型（如：事业单位公开招聘、省考、选调等）",
    "registration_start": "报名开始时间",
    "registration_end": "报名截止时间",
    "exam_date": "笔试/考试时间"
  },
  "confidence": 分析置信度(0-100的整数，如果能完整提取职位信息则为80以上)
}

注意事项：
1. positions数组必须包含从附件职位表中提取的所有职位，不要遗漏
2. 如果职位表内容很多，至少提取前30个职位
3. recruit_count必须是数字类型
4. 如果某个字段信息不明确，可以省略该字段，但position_name和recruit_count是必填项`)

	s.logger.Info("Calling LLM for analysis",
		zap.Int("prompt_length", promptBuilder.Len()),
		zap.Uint("llm_config_id", llmConfigID),
	)

	// Call LLM with extended timeout (5 minutes) and large max_tokens (32k) for complete position extraction
	// Use specified config ID or default if 0
	response, err := s.llmConfigService.CallWithConfigID(llmConfigID, promptBuilder.String(), 300, 32768)
	if err != nil {
		s.logger.Warn("LLM analysis failed", zap.Error(err), zap.Uint("llm_config_id", llmConfigID))
		result.Error = fmt.Sprintf("LLM调用失败: %v", err)
		return result
	}

	result.RawResponse = response

	// Parse LLM response as JSON
	s.parseLLMAnalysisResponse(response, result)

	s.logger.Info("LLM analysis completed",
		zap.Int("response_length", len(response)),
		zap.String("summary", result.Summary),
		zap.Int("positions_count", len(result.Positions)),
	)

	return result
}

// LLMAnalysisJSON is the expected JSON structure from LLM
type LLMAnalysisJSON struct {
	Summary   string `json:"summary"`
	Positions []struct {
		PositionName   string   `json:"position_name"`
		DepartmentName string   `json:"department_name"`
		RecruitCount   int      `json:"recruit_count"`
		Education      string   `json:"education"`
		Major          []string `json:"major"`
		WorkLocation   string   `json:"work_location"`
	} `json:"positions"`
	ExamInfo struct {
		ExamType          string `json:"exam_type"`
		RegistrationStart string `json:"registration_start"`
		RegistrationEnd   string `json:"registration_end"`
		ExamDate          string `json:"exam_date"`
	} `json:"exam_info"`
	Confidence int `json:"confidence"`
}

// parseLLMAnalysisResponse parses the LLM response JSON into result struct
func (s *FenbiService) parseLLMAnalysisResponse(response string, result *LLMAnalysisResult) {
	// Try to extract JSON from response (LLM might include markdown code blocks)
	jsonStr := s.extractJSONFromResponse(response)

	var parsed LLMAnalysisJSON
	if err := json.Unmarshal([]byte(jsonStr), &parsed); err != nil {
		s.logger.Warn("Failed to parse LLM response as JSON, using fallback",
			zap.Error(err),
			zap.String("json_str", jsonStr[:min(500, len(jsonStr))]),
		)
		// Fallback: try to extract summary manually
		result.Summary = s.extractSummaryManually(response)
		result.Confidence = 50
		return
	}

	// Map parsed data to result
	result.Summary = parsed.Summary
	result.Confidence = parsed.Confidence
	if result.Confidence == 0 {
		result.Confidence = 70 // Default
	}

	// Map positions
	for _, pos := range parsed.Positions {
		result.Positions = append(result.Positions, ExtractedPositionInfo{
			PositionName:   pos.PositionName,
			DepartmentName: pos.DepartmentName,
			RecruitCount:   pos.RecruitCount,
			Education:      pos.Education,
			Major:          pos.Major,
			WorkLocation:   pos.WorkLocation,
		})
	}

	// Map exam info
	if parsed.ExamInfo.ExamType != "" || parsed.ExamInfo.RegistrationStart != "" {
		result.ExamInfo = &ExtractedExamInfo{
			ExamType:          parsed.ExamInfo.ExamType,
			RegistrationStart: parsed.ExamInfo.RegistrationStart,
			RegistrationEnd:   parsed.ExamInfo.RegistrationEnd,
			ExamDate:          parsed.ExamInfo.ExamDate,
		}
	}
}

// extractJSONFromResponse extracts JSON content from LLM response
// which might be wrapped in markdown code blocks
func (s *FenbiService) extractJSONFromResponse(response string) string {
	// Remove markdown code blocks if present
	response = strings.TrimSpace(response)

	// Check for ```json ... ``` pattern
	if strings.HasPrefix(response, "```json") {
		response = strings.TrimPrefix(response, "```json")
		if idx := strings.LastIndex(response, "```"); idx != -1 {
			response = response[:idx]
		}
	} else if strings.HasPrefix(response, "```") {
		response = strings.TrimPrefix(response, "```")
		if idx := strings.LastIndex(response, "```"); idx != -1 {
			response = response[:idx]
		}
	}

	response = strings.TrimSpace(response)

	// Try to find JSON object boundaries
	startIdx := strings.Index(response, "{")
	endIdx := strings.LastIndex(response, "}")

	if startIdx != -1 && endIdx != -1 && endIdx > startIdx {
		return response[startIdx : endIdx+1]
	}

	return response
}

// extractSummaryManually extracts summary when JSON parsing fails
func (s *FenbiService) extractSummaryManually(response string) string {
	// Try to find "summary" field in the response
	if idx := strings.Index(response, `"summary"`); idx != -1 {
		start := strings.Index(response[idx:], `:`)
		if start != -1 {
			start += idx + 1
			// Skip whitespace and opening quote
			for start < len(response) && (response[start] == ' ' || response[start] == '\n' || response[start] == '\t') {
				start++
			}
			if start < len(response) && response[start] == '"' {
				start++
				// Find closing quote
				end := start
				for end < len(response) {
					if response[end] == '"' && (end == 0 || response[end-1] != '\\') {
						break
					}
					end++
				}
				if end > start {
					summary := response[start:end]
					summary = strings.ReplaceAll(summary, `\"`, `"`)
					summary = strings.ReplaceAll(summary, `\n`, "\n")
					return summary
				}
			}
		}
	}

	// Fallback: return first 500 chars
	if len(response) > 500 {
		return response[:500] + "..."
	}
	return response
}

// === Helper Functions ===

// GetRegionParamID returns the fenbi_param_id for a region code
// It first tries to fetch from the database, falling back to hardcoded mapping
func (s *FenbiService) GetRegionParamID(regionCode string) string {
	if regionCode == "" || regionCode == "all" {
		return ""
	}

	// Try to get from database first
	paramID, err := s.categoryRepo.GetFenbiParamID("region", regionCode)
	if err == nil && paramID != "" {
		s.logger.Debug("Got fenbi_param_id from database",
			zap.String("region_code", regionCode),
			zap.String("fenbi_param_id", paramID),
		)
		return paramID
	}

	// Fallback to hardcoded mapping
	s.logger.Debug("Using hardcoded fenbi_param_id",
		zap.String("region_code", regionCode),
		zap.String("reason", "not found in database"),
	)
	return crawler.GetRegionID(regionCode)
}

// GetExamTypeParamID returns the fenbi_param_id for an exam type code
// It first tries to fetch from the database, falling back to hardcoded mapping
func (s *FenbiService) GetExamTypeParamID(examTypeCode string) string {
	if examTypeCode == "" || examTypeCode == "all" {
		return ""
	}

	// Try to get from database first
	paramID, err := s.categoryRepo.GetFenbiParamID("exam_type", examTypeCode)
	if err == nil && paramID != "" {
		s.logger.Debug("Got exam_type fenbi_param_id from database",
			zap.String("exam_type_code", examTypeCode),
			zap.String("fenbi_param_id", paramID),
		)
		return paramID
	}

	// Fallback to hardcoded mapping (exam types use sequential IDs 1-20)
	s.logger.Debug("Using hardcoded exam_type fenbi_param_id",
		zap.String("exam_type_code", examTypeCode),
		zap.String("reason", "not found in database"),
	)
	return crawler.GetExamTypeID(examTypeCode)
}

func (s *FenbiService) formatTaskName(region, examType string, year int) string {
	regionName := crawler.GetRegionName(region)
	examTypeName := crawler.GetExamTypeName(examType)
	return regionName + " - " + examTypeName + " - " + string(rune(year))
}

func (s *FenbiService) convertToAnnouncements(items []crawler.FenbiListItem, region, examType string, year int) []model.FenbiAnnouncement {
	var announcements []model.FenbiAnnouncement
	for _, item := range items {
		// Use region/examType from item if available (for "all" queries), otherwise use parameters
		regionCode := item.RegionCode
		if regionCode == "" {
			regionCode = region
		}
		regionName := item.RegionName
		if regionName == "" {
			regionName = crawler.GetRegionName(regionCode)
		}

		examTypeCode := item.ExamTypeCode
		if examTypeCode == "" {
			examTypeCode = examType
		}
		examTypeName := item.ExamTypeName
		if examTypeName == "" {
			examTypeName = crawler.GetExamTypeName(examTypeCode)
		}

		itemYear := item.Year
		if itemYear == 0 {
			itemYear = year
		}

		ann := model.FenbiAnnouncement{
			FenbiID:      item.FenbiID,
			Title:        item.Title,
			FenbiURL:     item.FenbiURL,
			RegionCode:   regionCode,
			RegionName:   regionName,
			ExamTypeCode: examTypeCode,
			ExamTypeName: examTypeName,
			Year:         itemYear,
			CrawlStatus:  int(model.FenbiCrawlStatusListCrawled),
		}

		// Parse publish date if available
		if item.PublishDate != "" {
			// Try to parse date
			if t, err := time.Parse("2006-01-02", item.PublishDate); err == nil {
				ann.PublishDate = &t
			} else if t, err := time.Parse("2006/01/02", item.PublishDate); err == nil {
				ann.PublishDate = &t
			}
		}

		announcements = append(announcements, ann)
	}
	return announcements
}

func getLoginStatusText(status int) string {
	switch model.FenbiLoginStatus(status) {
	case model.FenbiLoginStatusLoggedIn:
		return "已登录"
	case model.FenbiLoginStatusExpired:
		return "已过期"
	default:
		return "未登录"
	}
}

// getCookiesPreview returns a preview of the cookies (for debugging, without exposing full values)
func (s *FenbiService) getCookiesPreview(cookies string) map[string]string {
	result := make(map[string]string)
	if cookies == "" {
		return result
	}

	parts := strings.Split(cookies, ";")
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		kv := strings.SplitN(part, "=", 2)
		if len(kv) == 2 {
			name := strings.TrimSpace(kv[0])
			value := strings.TrimSpace(kv[1])
			// Show first 10 chars and length for security
			preview := value
			if len(value) > 10 {
				preview = value[:10] + "..." + fmt.Sprintf("(len=%d)", len(value))
			}
			result[name] = preview
		}
	}
	return result
}

// Password encryption helpers

func encryptPassword(password string) (string, error) {
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	plaintext := []byte(password)
	ciphertext := make([]byte, aes.BlockSize+len(plaintext))
	iv := ciphertext[:aes.BlockSize]

	if _, err := io.ReadFull(cryptorand.Reader, iv); err != nil {
		return "", err
	}

	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)

	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func decryptPassword(encrypted string) (string, error) {
	ciphertext, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	if len(ciphertext) < aes.BlockSize {
		return "", errors.New("ciphertext too short")
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(ciphertext, ciphertext)

	return string(ciphertext), nil
}
