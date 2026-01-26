package service

import (
	"crypto/aes"
	"crypto/cipher"
	cryptorand "crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"os"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/what-cse/server/internal/crawler"
	"github.com/what-cse/server/internal/model"
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
	logger *zap.Logger,
) *FenbiService {
	return &FenbiService{
		credRepo:         credRepo,
		categoryRepo:     categoryRepo,
		announcementRepo: announcementRepo,
		spiderConfig:     spiderConfig,
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
	RawData        map[string]interface{} `json:"raw_data,omitempty"`
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
	timestamp := time.Now().Format("20060102_150405")
	htmlFilePath := fmt.Sprintf("fenbi_test_detail_%s_%s.html", selectedItem.FenbiID, timestamp)
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

	// Check if original_url was found
	message := "Cookie有效，成功获取公告详情"
	if detail.OriginalURL != "" {
		message += "和原始链接"
		if finalURL != "" {
			message += "，并成功解析最终跳转URL"
		}
	} else {
		message += "，但未找到原始链接（HTML已保存到文件供检查）"
	}

	// Success - we got the original URL and other data
	return &TestCrawlResult{
		Success: true,
		Message: message,
		TestResult: &TestCrawlDetail{
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
		},
	}, nil
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
