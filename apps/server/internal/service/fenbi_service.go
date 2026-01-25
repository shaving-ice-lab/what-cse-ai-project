package service

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
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
	for _, region := range req.Regions {
		// Get the fenbi_param_id for this region from database
		regionParamID := s.GetRegionParamID(region)

		for _, examType := range req.ExamTypes {
			// Get the fenbi_param_id for this exam type from database
			examTypeParamID := s.GetExamTypeParamID(examType)

			for _, year := range req.Years {
				progress.CurrentTask = s.formatTaskName(region, examType, year)

				// Crawl all pages for this combination
				// Pass regionParamID and examTypeParamID directly (numeric IDs) instead of codes
				page := 1
				for {
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

	progress.Status = "completed"
	progress.Message = "爬取完成"

	return progress, nil
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
			s.announcementRepo.UpdateOriginalURL(ann.ID, detail.OriginalURL)
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

// Password encryption helpers

func encryptPassword(password string) (string, error) {
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	plaintext := []byte(password)
	ciphertext := make([]byte, aes.BlockSize+len(plaintext))
	iv := ciphertext[:aes.BlockSize]

	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
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
