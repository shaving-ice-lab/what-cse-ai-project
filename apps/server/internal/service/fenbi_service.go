package service

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	cryptorand "crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"go.uber.org/zap"

	"github.com/what-cse/server/internal/ai"
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

// CrawlPosition 保存当前爬取位置
type CrawlPosition struct {
	RegionIndex   int
	ExamTypeIndex int
	YearIndex     int
	PageIndex     int
	Regions       []string
	ExamTypes     []string
	Years         []int
}

type FenbiService struct {
	credRepo         *repository.FenbiCredentialRepository
	categoryRepo     *repository.FenbiCategoryRepository
	announcementRepo *repository.FenbiAnnouncementRepository
	parseTaskRepo    *repository.FenbiParseTaskRepository
	spiderConfig     *crawler.SpiderConfig
	llmConfigService *LLMConfigService
	logger           *zap.Logger

	// Crawl control
	crawlMutex    sync.Mutex
	crawlRunning  bool
	crawlStopped  bool
	crawlPosition *CrawlPosition // 保存当前爬取位置
	crawlProgress *CrawlProgress // 保存最新进度快照
	crawlUpdated  time.Time      // 进度更新时间
}

func NewFenbiService(
	credRepo *repository.FenbiCredentialRepository,
	categoryRepo *repository.FenbiCategoryRepository,
	announcementRepo *repository.FenbiAnnouncementRepository,
	parseTaskRepo *repository.FenbiParseTaskRepository,
	spiderConfig *crawler.SpiderConfig,
	llmConfigService *LLMConfigService,
	logger *zap.Logger,
) *FenbiService {
	return &FenbiService{
		credRepo:         credRepo,
		categoryRepo:     categoryRepo,
		announcementRepo: announcementRepo,
		parseTaskRepo:    parseTaskRepo,
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
	MaxPages  int      `json:"max_pages"` // 最大爬取页数，0表示不限制
	Reset     bool     `json:"reset"`     // 是否重置爬取位置，从头开始
	SkipSave  bool     `json:"skip_save"` // 是否跳过保存到数据库，由前端解析后再保存
}

type CrawlProgress struct {
	TotalTasks     int    `json:"total_tasks"`
	CompletedTasks int    `json:"completed_tasks"`
	CurrentTask    string `json:"current_task"`
	ItemsCrawled   int    `json:"items_crawled"`
	ItemsSaved     int    `json:"items_saved"`
	Status         string `json:"status"` // running, completed, failed, paused
	Message        string `json:"message,omitempty"`
	HasMoreData    bool   `json:"has_more_data"` // 是否还有更多数据
	PagesCrawled   int    `json:"pages_crawled"` // 已爬取的页数
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
	s.setCrawlProgressSnapshot(progress)

	// 检查是否需要从上次位置继续
	startRegionIdx := 0
	startExamTypeIdx := 0
	startYearIdx := 0
	startPage := 1

	s.crawlMutex.Lock()
	// 如果设置了 reset，清除保存的位置
	if req.Reset {
		s.crawlPosition = nil
		s.logger.Info("Reset crawl position, starting from beginning")
	} else if s.crawlPosition != nil && s.isSameRequest(req, s.crawlPosition) {
		startRegionIdx = s.crawlPosition.RegionIndex
		startExamTypeIdx = s.crawlPosition.ExamTypeIndex
		startYearIdx = s.crawlPosition.YearIndex
		startPage = s.crawlPosition.PageIndex
		s.logger.Info("Continuing from saved position",
			zap.Int("region_idx", startRegionIdx),
			zap.Int("exam_type_idx", startExamTypeIdx),
			zap.Int("year_idx", startYearIdx),
			zap.Int("page", startPage),
		)
	} else {
		// 新的爬取请求，清除旧位置
		s.crawlPosition = nil
	}
	s.crawlMutex.Unlock()

	// Crawl each combination
crawlLoop:
	for regionIdx, region := range req.Regions {
		// 跳过已处理的 region
		if regionIdx < startRegionIdx {
			continue
		}

		// Check if crawl was stopped
		s.crawlMutex.Lock()
		stopped := s.crawlStopped
		s.crawlMutex.Unlock()
		if stopped {
			s.logger.Info("Crawl stopped by user")
			progress.Status = "stopped"
			progress.Message = "爬取已停止"
			s.setCrawlProgressSnapshot(progress)
			return progress, nil
		}

		// Get the fenbi_param_id for this region from database
		regionParamID := s.GetRegionParamID(region)

		for examTypeIdx, examType := range req.ExamTypes {
			// 跳过已处理的 examType
			if regionIdx == startRegionIdx && examTypeIdx < startExamTypeIdx {
				continue
			}

			// Check if crawl was stopped
			s.crawlMutex.Lock()
			stopped := s.crawlStopped
			s.crawlMutex.Unlock()
			if stopped {
				s.logger.Info("Crawl stopped by user")
				progress.Status = "stopped"
				progress.Message = "爬取已停止"
				s.setCrawlProgressSnapshot(progress)
				return progress, nil
			}

			// Get the fenbi_param_id for this exam type from database
			examTypeParamID := s.GetExamTypeParamID(examType)

			for yearIdx, year := range req.Years {
				// 跳过已处理的 year
				if regionIdx == startRegionIdx && examTypeIdx == startExamTypeIdx && yearIdx < startYearIdx {
					continue
				}

				// Check if crawl was stopped
				s.crawlMutex.Lock()
				stopped := s.crawlStopped
				s.crawlMutex.Unlock()
				if stopped {
					s.logger.Info("Crawl stopped by user")
					progress.Status = "stopped"
					progress.Message = "爬取已停止"
					s.setCrawlProgressSnapshot(progress)
					return progress, nil
				}

				progress.CurrentTask = s.formatTaskName(region, examType, year)
				s.setCrawlProgressSnapshot(progress)

				// Crawl all pages for this combination
				// 如果是从上次位置继续，使用保存的页数
				page := 1
				if regionIdx == startRegionIdx && examTypeIdx == startExamTypeIdx && yearIdx == startYearIdx {
					page = startPage
				}

				for {
					// Check if crawl was stopped before each page request
					s.crawlMutex.Lock()
					stopped := s.crawlStopped
					s.crawlMutex.Unlock()
					if stopped {
						s.logger.Info("Crawl stopped by user during page crawl")
						progress.Status = "stopped"
						progress.Message = "爬取已停止"
						s.setCrawlProgressSnapshot(progress)
						break crawlLoop
					}

					// Check if we've reached the max pages limit
					if req.MaxPages > 0 && progress.PagesCrawled >= req.MaxPages {
						s.logger.Info("Reached max pages limit, saving position",
							zap.Int("max_pages", req.MaxPages),
							zap.Int("pages_crawled", progress.PagesCrawled),
							zap.Int("region_idx", regionIdx),
							zap.Int("exam_type_idx", examTypeIdx),
							zap.Int("year_idx", yearIdx),
							zap.Int("next_page", page+1),
						)
						// 保存当前位置，下次从下一页继续
						s.crawlMutex.Lock()
						s.crawlPosition = &CrawlPosition{
							RegionIndex:   regionIdx,
							ExamTypeIndex: examTypeIdx,
							YearIndex:     yearIdx,
							PageIndex:     page + 1, // 下次从下一页开始
							Regions:       req.Regions,
							ExamTypes:     req.ExamTypes,
							Years:         req.Years,
						}
						s.crawlMutex.Unlock()

						progress.Status = "paused"
						progress.Message = "已达到页数限制，等待处理"
						progress.HasMoreData = true
						s.setCrawlProgressSnapshot(progress)
						return progress, nil
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
					progress.PagesCrawled++

					// Convert and save items (only if not skipping save)
					announcements := s.convertToAnnouncements(result.Items, region, examType, year)
					if !req.SkipSave {
						saved, _ := s.announcementRepo.BatchUpsert(announcements)
						progress.ItemsSaved += saved
					} else {
						// 跳过保存时，ItemsSaved 表示可保存的条目数
						progress.ItemsSaved += len(announcements)
					}
					s.setCrawlProgressSnapshot(progress)

					if !result.HasNextPage || result.TotalFound == 0 {
						break
					}
					page++

					// Rate limiting
					time.Sleep(500 * time.Millisecond)
				}

				progress.CompletedTasks++
				s.setCrawlProgressSnapshot(progress)
			}
		}
	}

	// 爬取完成，清除保存的位置
	s.crawlMutex.Lock()
	s.crawlPosition = nil
	s.crawlMutex.Unlock()

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
	s.setCrawlProgressSnapshot(progress)

	return progress, nil
}

// setCrawlProgressSnapshot stores a safe progress snapshot
func (s *FenbiService) setCrawlProgressSnapshot(progress *CrawlProgress) {
	if progress == nil {
		s.crawlMutex.Lock()
		s.crawlProgress = nil
		s.crawlUpdated = time.Now()
		s.crawlMutex.Unlock()
		return
	}

	snapshot := *progress
	s.crawlMutex.Lock()
	s.crawlProgress = &snapshot
	s.crawlUpdated = time.Now()
	s.crawlMutex.Unlock()
}

// GetCrawlStatus returns current crawl running state and progress snapshot
func (s *FenbiService) GetCrawlStatus() (bool, *CrawlProgress, *time.Time) {
	s.crawlMutex.Lock()
	defer s.crawlMutex.Unlock()

	var snapshot *CrawlProgress
	if s.crawlProgress != nil {
		copy := *s.crawlProgress
		snapshot = &copy
	}

	if s.crawlUpdated.IsZero() {
		return s.crawlRunning, snapshot, nil
	}

	updated := s.crawlUpdated
	return s.crawlRunning, snapshot, &updated
}

// isSameRequest 检查请求参数是否与保存的位置一致
func (s *FenbiService) isSameRequest(req *TriggerCrawlRequest, pos *CrawlPosition) bool {
	if pos == nil {
		return false
	}
	if len(req.Regions) != len(pos.Regions) || len(req.ExamTypes) != len(pos.ExamTypes) || len(req.Years) != len(pos.Years) {
		return false
	}
	for i, r := range req.Regions {
		if r != pos.Regions[i] {
			return false
		}
	}
	for i, e := range req.ExamTypes {
		if e != pos.ExamTypes[i] {
			return false
		}
	}
	for i, y := range req.Years {
		if y != pos.Years[i] {
			return false
		}
	}
	return true
}

// ResetCrawlPosition 重置爬取位置（用于重新开始爬取）
func (s *FenbiService) ResetCrawlPosition() {
	s.crawlMutex.Lock()
	defer s.crawlMutex.Unlock()
	s.crawlPosition = nil
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
	PositionName    string   `json:"position_name"`
	DepartmentName  string   `json:"department_name"`
	RecruitCount    int      `json:"recruit_count"`
	Education       string   `json:"education,omitempty"`
	Major           []string `json:"major,omitempty"`
	WorkLocation    string   `json:"work_location,omitempty"`
	PoliticalStatus string   `json:"political_status,omitempty"` // 政治面貌要求：中共党员、共青团员、不限等
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
	InputURL       string             `json:"input_url"`
	FinalURL       string             `json:"final_url,omitempty"`
	PageTitle      string             `json:"page_title,omitempty"`
	PageContent    string             `json:"page_content,omitempty"`
	Attachments    []AttachmentResult `json:"attachments,omitempty"`
	LLMAnalysis    *LLMAnalysisResult `json:"llm_analysis,omitempty"`
	ListPageURL    string             `json:"list_page_url,omitempty"`    // 列表页URL (用于监控)
	ListPageSource string             `json:"list_page_source,omitempty"` // 列表页来源 (url_parse/html_extract/llm)
}

// ListPageCandidate represents a candidate list page URL
type ListPageCandidate struct {
	URL        string `json:"url"`
	Source     string `json:"source"`     // url_parse, html_extract, llm
	Confidence int    `json:"confidence"` // 0-100
	Reason     string `json:"reason,omitempty"`
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

	// Track Fenbi info for saving to database after successful parsing
	var fenbiID string
	var fenbiDetail *crawler.FenbiDetailInfo

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

		fenbiID = crawler.ExtractFenbiIDFromURL(inputURL)
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
				fenbiDetail = detail // Save detail for later database update
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

	// Truncate content for response (100,000 chars ≈ 25,000 Chinese characters)
	contentPreview := pageContent.Text
	if len(contentPreview) > 100000 {
		contentPreview = contentPreview[:100000] + "\n\n...(内容已截断，共" + fmt.Sprintf("%d", len(pageContent.Text)) + "字符)"
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

	// Step 5: Save to database if this is a Fenbi URL and parsing was successful
	if fenbiID != "" && result.Success {
		stepStart = time.Now()
		saveErr := s.saveOrUpdateFenbiAnnouncement(fenbiID, fenbiDetail, result.Data)
		if saveErr != nil {
			s.logger.Warn("Failed to save Fenbi announcement to database",
				zap.String("fenbi_id", fenbiID),
				zap.Error(saveErr),
			)
			result.Steps = append(result.Steps, ParseStep{
				Name:     "保存到数据库",
				Status:   "error",
				Message:  fmt.Sprintf("保存失败: %v", saveErr),
				Duration: time.Since(stepStart).Milliseconds(),
			})
		} else {
			result.Steps = append(result.Steps, ParseStep{
				Name:     "保存到数据库",
				Status:   "success",
				Message:  "已保存解析结果到数据库",
				Duration: time.Since(stepStart).Milliseconds(),
			})
			s.logger.Info("Saved Fenbi announcement to database",
				zap.String("fenbi_id", fenbiID),
			)
		}
	}

	// Step 6: Extract and validate list page URL for monitoring using DFS algorithm
	if finalURL != "" && pageContent != nil {
		stepStart = time.Now()

		// Use DFS algorithm to find the real list page that contains this article
		dfsResult := s.findListPageDFS(finalURL, pageContent.HTML, spider)

		if dfsResult.Found {
			result.Steps = append(result.Steps, ParseStep{
				Name:     "提取列表页URL",
				Status:   "success",
				Message:  fmt.Sprintf("成功提取列表页 (策略: %s, 深度: %d)", dfsResult.Source, dfsResult.Depth),
				Duration: time.Since(stepStart).Milliseconds(),
				Details:  fmt.Sprintf("列表页: %s\n原因: %s\n搜索路径: %s", dfsResult.ListURL, dfsResult.Reason, strings.Join(dfsResult.Path, " → ")),
			})
			result.Data.ListPageURL = dfsResult.ListURL
			result.Data.ListPageSource = dfsResult.Source

			// Update database with list page URL if fenbiID exists
			if fenbiID != "" {
				s.updateAnnouncementListPage(fenbiID, dfsResult.ListURL, dfsResult.Source)
			}

			s.logger.Info("List page found via DFS",
				zap.String("list_page_url", dfsResult.ListURL),
				zap.String("source", dfsResult.Source),
				zap.Int("depth", dfsResult.Depth),
				zap.Int("confidence", dfsResult.Confidence),
			)
		} else {
			result.Steps = append(result.Steps, ParseStep{
				Name:     "提取列表页URL",
				Status:   "skipped",
				Message:  "DFS搜索未找到包含当前文章的列表页",
				Duration: time.Since(stepStart).Milliseconds(),
				Details:  "尝试了多种策略(URL分析、HTML链接、LLM)，但未找到包含当前文章链接的上级页面",
			})
			s.logger.Info("DFS search did not find valid list page",
				zap.String("article_url", finalURL),
			)
		}
	} else {
		result.Steps = append(result.Steps, ParseStep{
			Name:     "提取列表页URL",
			Status:   "skipped",
			Message:  "无最终URL或页面内容，跳过列表页提取",
			Duration: 0,
		})
	}

	return result, nil
}

// saveOrUpdateFenbiAnnouncement saves or updates a Fenbi announcement in the database
func (s *FenbiService) saveOrUpdateFenbiAnnouncement(fenbiID string, detail *crawler.FenbiDetailInfo, parseData *ParseURLData) error {
	// Try to find existing record
	existing, err := s.announcementRepo.FindByFenbiID(fenbiID)
	if err != nil && err.Error() != "record not found" {
		return fmt.Errorf("查询公告失败: %w", err)
	}

	if existing != nil {
		// Update existing record
		existing.CrawlStatus = 2 // 解析完成
		if parseData.FinalURL != "" {
			existing.FinalURL = parseData.FinalURL
		}
		if detail != nil && detail.OriginalURL != "" {
			existing.OriginalURL = detail.OriginalURL
		}
		return s.announcementRepo.Update(existing)
	}

	// Create new record
	announcement := &model.FenbiAnnouncement{
		FenbiID:     fenbiID,
		Title:       parseData.PageTitle,
		FenbiURL:    fmt.Sprintf("https://www.fenbi.com/page/exam-information-detail/%s", fenbiID),
		OriginalURL: "",
		FinalURL:    parseData.FinalURL,
		CrawlStatus: 2, // 解析完成
	}

	if detail != nil {
		if detail.Title != "" {
			announcement.Title = detail.Title
		}
		announcement.OriginalURL = detail.OriginalURL
	}

	return s.announcementRepo.Create(announcement)
}

// updateAnnouncementListPage updates the list page URL for an announcement
func (s *FenbiService) updateAnnouncementListPage(fenbiID string, listPageURL string, listPageSource string) {
	if fenbiID == "" || listPageURL == "" {
		return
	}

	existing, err := s.announcementRepo.FindByFenbiID(fenbiID)
	if err != nil {
		s.logger.Debug("Cannot find announcement to update list page",
			zap.String("fenbi_id", fenbiID),
			zap.Error(err),
		)
		return
	}

	existing.ListPageURL = listPageURL
	existing.ListPageSource = listPageSource

	if err := s.announcementRepo.Update(existing); err != nil {
		s.logger.Warn("Failed to update announcement list page",
			zap.String("fenbi_id", fenbiID),
			zap.Error(err),
		)
	} else {
		s.logger.Debug("Updated announcement list page",
			zap.String("fenbi_id", fenbiID),
			zap.String("list_page_url", listPageURL),
			zap.String("source", listPageSource),
		)
	}
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

		// Generate local path with correct extension
		fileName := fmt.Sprintf("%d_%s", i+1, att.Name)
		// Sanitize filename
		fileName = strings.ReplaceAll(fileName, "/", "_")
		fileName = strings.ReplaceAll(fileName, "\\", "_")

		// Ensure file has correct extension based on detected type
		// This is needed because Name may come from link text without extension
		fileExt := strings.ToLower(filepath.Ext(fileName))
		expectedExtMap := map[string][]string{
			"pdf":   {".pdf"},
			"excel": {".xls", ".xlsx"},
			"word":  {".doc", ".docx"},
		}
		if expectedExts, ok := expectedExtMap[att.Type]; ok {
			hasCorrectExt := false
			for _, ext := range expectedExts {
				if fileExt == ext {
					hasCorrectExt = true
					break
				}
			}
			if !hasCorrectExt {
				// Add default extension for this type
				defaultExt := expectedExts[0]
				if att.Type == "excel" {
					defaultExt = ".xlsx" // Prefer xlsx for excel
				} else if att.Type == "word" {
					defaultExt = ".docx" // Prefer docx for word
				}
				fileName = fileName + defaultExt
				s.logger.Debug("Added missing extension to filename",
					zap.String("original_name", att.Name),
					zap.String("new_filename", fileName),
					zap.String("type", att.Type),
				)
			}
		}

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
      "work_location": "工作地点",
      "political_status": "政治面貌要求（如：中共党员、共青团员、不限等，仅在明确要求时填写）"
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
4. 如果某个字段信息不明确，可以省略该字段，但position_name和recruit_count是必填项
5. political_status字段：如果公告明确要求党员或有政治面貌限制，请提取；如无明确要求可省略或填"不限"`)

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
		PositionName    string   `json:"position_name"`
		DepartmentName  string   `json:"department_name"`
		RecruitCount    int      `json:"recruit_count"`
		Education       string   `json:"education"`
		Major           []string `json:"major"`
		WorkLocation    string   `json:"work_location"`
		PoliticalStatus string   `json:"political_status"`
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
			PositionName:    pos.PositionName,
			DepartmentName:  pos.DepartmentName,
			RecruitCount:    pos.RecruitCount,
			Education:       pos.Education,
			Major:           pos.Major,
			WorkLocation:    pos.WorkLocation,
			PoliticalStatus: pos.PoliticalStatus,
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

// === AI Content Cleaner Adapter ===

// AICleanerAdapter adapts ai.AIExtractor to crawler.AIContentCleaner interface
type AICleanerAdapter struct {
	extractor *ai.AIExtractor
	logger    *zap.Logger
}

// NewAICleanerAdapter creates a new adapter for AIExtractor
func NewAICleanerAdapter(extractor *ai.AIExtractor, logger *zap.Logger) *AICleanerAdapter {
	return &AICleanerAdapter{
		extractor: extractor,
		logger:    logger,
	}
}

// CleanPageContent implements crawler.AIContentCleaner interface
func (a *AICleanerAdapter) CleanPageContent(ctx context.Context, htmlContent string) (*crawler.AICleaningResult, error) {
	if a.extractor == nil {
		return nil, errors.New("AI extractor not initialized")
	}

	// Call the AI extractor
	result, err := a.extractor.CleanPageContent(ctx, htmlContent)
	if err != nil {
		return nil, err
	}

	// Convert ai.ContentCleaningResult to crawler.AICleaningResult
	crawlerResult := &crawler.AICleaningResult{
		Title:      result.Title,
		Content:    result.Content,
		Source:     result.Source,
		Confidence: result.Confidence,
	}

	if result.PublishDate != nil {
		crawlerResult.PublishDate = result.PublishDate
	}

	// Convert attachments
	for _, att := range result.Attachments {
		crawlerResult.Attachments = append(crawlerResult.Attachments, crawler.AICleaningAttachment{
			Name: att.Name,
			URL:  att.URL,
		})
	}

	return crawlerResult, nil
}

// createSpiderWithLLMCleaner creates a FenbiSpider with LLM content cleaner enabled
func (s *FenbiService) createSpiderWithLLMCleaner() (*crawler.FenbiSpider, error) {
	spider := crawler.NewFenbiSpider(s.spiderConfig, s.logger)

	// Try to get active LLM config and create AI extractor
	if s.llmConfigService != nil {
		activeConfig, err := s.llmConfigService.GetActiveConfigForExtractor()
		if err == nil && activeConfig != nil {
			adapter := NewAICleanerAdapter(activeConfig, s.logger)
			spider.SetAIContentCleaner(adapter)
			s.logger.Info("LLM content cleaner enabled for spider")
		} else {
			s.logger.Debug("LLM content cleaner not available", zap.Error(err))
		}
	}

	return spider, nil
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

// === Parse Task Management ===

// CreateParseTaskRequest is the request for creating parse tasks
type CreateParseTaskRequest struct {
	Tasks []CreateParseTaskItem `json:"tasks"`
}

// CreateParseTaskItem is a single task item to create
type CreateParseTaskItem struct {
	FenbiAnnouncementID *uint  `json:"fenbi_announcement_id,omitempty"`
	FenbiID             string `json:"fenbi_id,omitempty"`
	Title               string `json:"title"`
	FenbiURL            string `json:"fenbi_url,omitempty"`
}

// CreateParseTasks creates multiple parse tasks
func (s *FenbiService) CreateParseTasks(req *CreateParseTaskRequest) ([]*model.FenbiParseTaskResponse, error) {
	if len(req.Tasks) == 0 {
		return nil, errors.New("no tasks to create")
	}

	var tasksToCreate []model.FenbiParseTask
	for _, item := range req.Tasks {
		// Check if task already exists
		if item.FenbiID != "" {
			exists, _ := s.parseTaskRepo.ExistsByFenbiID(item.FenbiID)
			if exists {
				continue // Skip existing task
			}
		}

		task := model.FenbiParseTask{
			FenbiAnnouncementID: item.FenbiAnnouncementID,
			FenbiID:             item.FenbiID,
			Title:               item.Title,
			FenbiURL:            item.FenbiURL,
			Status:              string(model.FenbiParseTaskStatusPending),
		}
		tasksToCreate = append(tasksToCreate, task)
	}

	if len(tasksToCreate) == 0 {
		return nil, nil // All tasks already exist
	}

	_, err := s.parseTaskRepo.BatchCreate(tasksToCreate)
	if err != nil {
		return nil, err
	}

	// Fetch and return created tasks
	params := &repository.FenbiParseTaskListParams{
		Page:     1,
		PageSize: len(tasksToCreate),
	}
	tasks, _, err := s.parseTaskRepo.List(params)
	if err != nil {
		return nil, err
	}

	var responses []*model.FenbiParseTaskResponse
	for i := range tasks {
		responses = append(responses, tasks[i].ToResponse())
	}
	return responses, nil
}

// ListParseTasksRequest is the request for listing parse tasks
type ListParseTasksRequest struct {
	Status   string `query:"status"`
	Keyword  string `query:"keyword"`
	Page     int    `query:"page"`
	PageSize int    `query:"page_size"`
}

// ListParseTasks returns a list of parse tasks
func (s *FenbiService) ListParseTasks(req *ListParseTasksRequest) ([]*model.FenbiParseTaskResponse, int64, error) {
	params := &repository.FenbiParseTaskListParams{
		Status:   req.Status,
		Keyword:  req.Keyword,
		Page:     req.Page,
		PageSize: req.PageSize,
	}

	tasks, total, err := s.parseTaskRepo.List(params)
	if err != nil {
		return nil, 0, err
	}

	var responses []*model.FenbiParseTaskResponse
	for i := range tasks {
		responses = append(responses, tasks[i].ToResponse())
	}
	return responses, total, nil
}

// GetParseTask returns a single parse task by ID
func (s *FenbiService) GetParseTask(id uint) (*model.FenbiParseTaskResponse, error) {
	task, err := s.parseTaskRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return task.ToResponse(), nil
}

// UpdateParseTaskRequest is the request for updating a parse task
type UpdateParseTaskRequest struct {
	Status             string           `json:"status"`
	Message            string           `json:"message,omitempty"`
	Steps              []map[string]any `json:"steps,omitempty"`
	ParseResultSummary map[string]any   `json:"parse_result_summary,omitempty"`
}

// UpdateParseTask updates a parse task
func (s *FenbiService) UpdateParseTask(id uint, req *UpdateParseTaskRequest) (*model.FenbiParseTaskResponse, error) {
	task, err := s.parseTaskRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if req.Status != "" {
		task.Status = req.Status
	}
	task.Message = req.Message

	if req.Steps != nil {
		task.Steps = model.JSON{"steps": req.Steps}
	}
	if req.ParseResultSummary != nil {
		task.ParseResultSummary = req.ParseResultSummary
	}

	// Update timestamps based on status
	now := time.Now()
	if req.Status == string(model.FenbiParseTaskStatusRunning) || req.Status == string(model.FenbiParseTaskStatusParsing) {
		task.StartedAt = &now
	}
	if req.Status == string(model.FenbiParseTaskStatusCompleted) || req.Status == string(model.FenbiParseTaskStatusFailed) || req.Status == string(model.FenbiParseTaskStatusSkipped) {
		task.CompletedAt = &now
	}

	err = s.parseTaskRepo.Update(task)
	if err != nil {
		return nil, err
	}

	return task.ToResponse(), nil
}

// DeleteParseTask deletes a parse task by ID
func (s *FenbiService) DeleteParseTask(id uint) error {
	return s.parseTaskRepo.Delete(id)
}

// DeleteAllParseTasks deletes all parse tasks
func (s *FenbiService) DeleteAllParseTasks() error {
	return s.parseTaskRepo.DeleteAll()
}

// GetParseTaskStats returns parse task statistics
func (s *FenbiService) GetParseTaskStats() (map[string]int64, error) {
	return s.parseTaskRepo.GetStats()
}

// === List Page Extraction Methods ===

// extractListPageURLs uses multiple strategies to extract list page URLs (including LLM when needed)
func (s *FenbiService) extractListPageURLs(finalURL string, pageHTML string) []ListPageCandidate {
	candidates := s.extractListPageURLsWithoutLLM(finalURL, pageHTML)

	// Strategy 3: LLM analysis (only when no high confidence result from other methods)
	hasHighConfidence := false
	for _, c := range candidates {
		if c.Confidence >= 80 {
			hasHighConfidence = true
			break
		}
	}
	if !hasHighConfidence && pageHTML != "" {
		seen := make(map[string]bool)
		for _, c := range candidates {
			seen[c.URL] = true
		}
		if llmCandidates := s.extractByLLM(finalURL, pageHTML); len(llmCandidates) > 0 {
			for _, c := range llmCandidates {
				if !seen[c.URL] {
					candidates = append(candidates, c)
					seen[c.URL] = true
				}
			}
		}
		// Re-sort after adding LLM candidates
		sort.Slice(candidates, func(i, j int) bool {
			return candidates[i].Confidence > candidates[j].Confidence
		})
	}

	return candidates
}

// extractListPageURLsWithoutLLM extracts list page URLs using URL and HTML analysis only (no LLM)
func (s *FenbiService) extractListPageURLsWithoutLLM(finalURL string, pageHTML string) []ListPageCandidate {
	candidates := make([]ListPageCandidate, 0)
	seen := make(map[string]bool)

	// Strategy 1: URL path analysis (fast, no cost)
	if urls := s.extractByURLPath(finalURL); len(urls) > 0 {
		for _, u := range urls {
			if !seen[u] {
				candidates = append(candidates, ListPageCandidate{
					URL:        u,
					Source:     "url_parse",
					Confidence: 60,
					Reason:     "通过URL路径分析提取",
				})
				seen[u] = true
			}
		}
	}

	// Strategy 2: HTML link extraction (medium reliability)
	if htmlCandidates := s.extractByHTMLLinks(finalURL, pageHTML); len(htmlCandidates) > 0 {
		for _, c := range htmlCandidates {
			if !seen[c.URL] {
				candidates = append(candidates, c)
				seen[c.URL] = true
			}
		}
	}

	// Sort by confidence (descending)
	sort.Slice(candidates, func(i, j int) bool {
		return candidates[i].Confidence > candidates[j].Confidence
	})

	return candidates
}

// extractByURLPath extracts list page URLs by analyzing URL path structure
func (s *FenbiService) extractByURLPath(finalURL string) []string {
	if finalURL == "" {
		return nil
	}

	parsedURL, err := url.Parse(finalURL)
	if err != nil || parsedURL.Path == "" || parsedURL.Path == "/" {
		return nil
	}

	results := make([]string, 0)
	path := strings.TrimSuffix(parsedURL.Path, "/")

	// Method 1: Remove the file name (e.g., detail.html, content.shtml)
	if idx := strings.LastIndex(path, "/"); idx > 0 {
		// Check if last segment looks like a file
		lastSegment := path[idx+1:]
		if strings.Contains(lastSegment, ".") {
			dir := path[:idx+1]
			parentURL := &url.URL{Scheme: parsedURL.Scheme, Host: parsedURL.Host, Path: dir}
			results = append(results, parentURL.String())
		}
	}

	// Method 2: Remove the last path segment
	parts := strings.Split(path, "/")
	if len(parts) > 2 {
		parentPath := strings.Join(parts[:len(parts)-1], "/") + "/"
		parentURL := &url.URL{Scheme: parsedURL.Scheme, Host: parsedURL.Host, Path: parentPath}
		parentURLStr := parentURL.String()
		if !stringSliceContains(results, parentURLStr) {
			results = append(results, parentURLStr)
		}
	}

	// Method 3: Try common list page suffixes
	listSuffixes := []string{"list.html", "index.html", "index.shtml", "index.htm", ""}
	if len(parts) > 2 {
		basePath := strings.Join(parts[:len(parts)-1], "/") + "/"
		for _, suffix := range listSuffixes {
			listPath := basePath + suffix
			listURL := &url.URL{Scheme: parsedURL.Scheme, Host: parsedURL.Host, Path: listPath}
			listURLStr := listURL.String()
			if !stringSliceContains(results, listURLStr) {
				results = append(results, listURLStr)
			}
		}
	}

	s.logger.Debug("extractByURLPath results",
		zap.String("final_url", finalURL),
		zap.Strings("candidates", results),
	)

	return results
}

// extractByHTMLLinks extracts list page URLs by analyzing HTML links
func (s *FenbiService) extractByHTMLLinks(baseURL string, html string) []ListPageCandidate {
	if html == "" {
		return nil
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		s.logger.Warn("Failed to parse HTML for link extraction", zap.Error(err))
		return nil
	}

	candidates := make([]ListPageCandidate, 0)
	seen := make(map[string]bool)
	baseParsed, _ := url.Parse(baseURL)

	addCandidate := func(url string, confidence int, reason string) {
		if url == "" || url == baseURL || seen[url] || strings.Contains(url, "login") {
			return
		}
		seen[url] = true
		candidates = append(candidates, ListPageCandidate{
			URL:        url,
			Source:     "html_extract",
			Confidence: confidence,
			Reason:     reason,
		})
	}

	// 1. Search for links with list-related text patterns (highest priority)
	textPatterns := []struct {
		keywords   []string
		confidence int
	}{
		{[]string{"返回列表", "回到列表", "返回上一页", "back to list"}, 95},
		{[]string{"更多公告", "更多信息", "查看更多", "more"}, 90},
		{[]string{"公告列表", "招聘公告", "考试公告", "通知公告", "信息公开"}, 85},
		{[]string{"列表", "目录", "栏目"}, 75},
	}

	doc.Find("a[href]").Each(func(_ int, sel *goquery.Selection) {
		href, exists := sel.Attr("href")
		if !exists || href == "" || href == "#" || strings.HasPrefix(href, "javascript:") {
			return
		}

		text := strings.TrimSpace(sel.Text())
		title, _ := sel.Attr("title")
		searchText := strings.ToLower(text + " " + title)

		for _, p := range textPatterns {
			for _, kw := range p.keywords {
				if strings.Contains(searchText, strings.ToLower(kw)) {
					fullURL := resolveURL(baseParsed, href)
					addCandidate(fullURL, p.confidence, fmt.Sprintf("链接文字包含'%s'", kw))
					return
				}
			}
		}
	})

	// 2. Search breadcrumb navigation (very reliable)
	breadcrumbSelectors := []string{
		".breadcrumb a", ".crumb a", ".nav-path a", ".location a",
		".position a", ".path a", ".site-path a", ".current-position a",
		"[class*='bread'] a", "[class*='crumb'] a", "[class*='path'] a",
		"[id*='bread'] a", "[id*='crumb'] a", "[id*='path'] a",
		// Chinese government website common patterns
		".weizhi a", ".dqwz a", ".subnav a", ".channel-nav a",
		"[class*='位置'] a", "[class*='导航'] a",
	}
	for _, selector := range breadcrumbSelectors {
		doc.Find(selector).Each(func(_ int, sel *goquery.Selection) {
			href, exists := sel.Attr("href")
			if !exists || href == "" || href == "#" {
				return
			}
			fullURL := resolveURL(baseParsed, href)
			addCandidate(fullURL, 90, "面包屑导航链接")
		})
	}

	// 3. Search for links with list-related URL patterns
	urlPatterns := []struct {
		pattern    string
		confidence int
	}{
		{"channelList", 95},
		{"channel", 90},
		{"/list", 90},
		{"/index", 85},
		{"/news", 80},
		{"/info", 75},
		{"/article", 75},
		{"/notice", 80},
		{"/gonggao", 80},
		{"/xinxi", 75},
	}

	doc.Find("a[href]").Each(func(_ int, sel *goquery.Selection) {
		href, exists := sel.Attr("href")
		if !exists || href == "" || href == "#" || strings.HasPrefix(href, "javascript:") {
			return
		}

		fullURL := resolveURL(baseParsed, href)
		if fullURL == "" {
			return
		}

		hrefLower := strings.ToLower(href)
		for _, p := range urlPatterns {
			if strings.Contains(hrefLower, strings.ToLower(p.pattern)) {
				// Don't add if it looks like a detail page (has numeric ID at end)
				if !looksLikeDetailPage(fullURL) {
					addCandidate(fullURL, p.confidence, fmt.Sprintf("URL包含'%s'", p.pattern))
				}
				break
			}
		}
	})

	// 4. Search sidebar/navigation areas
	navSelectors := []string{
		".sidebar a", ".side-nav a", ".left-nav a", ".right-nav a",
		".nav-list a", ".menu a", ".channel a",
		"[class*='sidebar'] a", "[class*='sidenav'] a",
	}
	for _, selector := range navSelectors {
		doc.Find(selector).Each(func(_ int, sel *goquery.Selection) {
			href, exists := sel.Attr("href")
			if !exists || href == "" || href == "#" {
				return
			}
			fullURL := resolveURL(baseParsed, href)
			if !looksLikeDetailPage(fullURL) {
				addCandidate(fullURL, 70, "侧边栏导航链接")
			}
		})
	}

	s.logger.Debug("extractByHTMLLinks results",
		zap.String("base_url", baseURL),
		zap.Int("candidates_count", len(candidates)),
	)

	return candidates
}

// looksLikeDetailPage checks if a URL looks like a detail/article page
func looksLikeDetailPage(urlStr string) bool {
	parsed, err := url.Parse(urlStr)
	if err != nil {
		return false
	}
	path := parsed.Path
	// Check if path ends with a numeric ID
	parts := strings.Split(strings.TrimSuffix(path, "/"), "/")
	if len(parts) > 0 {
		lastPart := parts[len(parts)-1]
		// Remove extension
		lastPart = strings.TrimSuffix(lastPart, ".html")
		lastPart = strings.TrimSuffix(lastPart, ".shtml")
		lastPart = strings.TrimSuffix(lastPart, ".htm")
		// Check if it's mostly numeric (article ID)
		digitCount := 0
		for _, c := range lastPart {
			if c >= '0' && c <= '9' {
				digitCount++
			}
		}
		// If more than half is digits, likely a detail page
		if len(lastPart) > 0 && float64(digitCount)/float64(len(lastPart)) > 0.5 {
			return true
		}
	}
	return false
}

// extractByLLM uses LLM to analyze HTML and extract list page URLs
func (s *FenbiService) extractByLLM(currentURL string, html string) []ListPageCandidate {
	if s.llmConfigService == nil {
		s.logger.Debug("LLM service not available for list page extraction")
		return nil
	}

	// Truncate HTML to avoid token limit issues (keep first 30k chars)
	truncatedHTML := html
	if len(html) > 30000 {
		truncatedHTML = html[:30000]
	}

	// Build prompt using template
	template := ai.GetPromptTemplate("list_page_extraction")
	if template == "" {
		s.logger.Warn("list_page_extraction prompt template not found")
		return nil
	}

	prompt := strings.Replace(template, "{{current_url}}", currentURL, 1)
	prompt = strings.Replace(prompt, "{{html_content}}", truncatedHTML, 1)

	s.logger.Info("Calling LLM for list page extraction",
		zap.String("current_url", currentURL),
		zap.Int("html_length", len(truncatedHTML)),
	)

	// Call LLM with shorter timeout
	response, err := s.llmConfigService.CallWithConfigID(0, prompt, 60, 2048)
	if err != nil {
		s.logger.Warn("LLM list page extraction failed", zap.Error(err))
		return nil
	}

	// Parse LLM response
	var result struct {
		ListPageURLs []struct {
			URL        string `json:"url"`
			Confidence int    `json:"confidence"`
			Reason     string `json:"reason"`
		} `json:"list_page_urls"`
		Analysis string `json:"analysis"`
	}

	jsonStr := s.extractJSONFromResponse(response)
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		s.logger.Warn("Failed to parse LLM list page extraction response",
			zap.Error(err),
			zap.String("response", response[:min(500, len(response))]),
		)
		return nil
	}

	candidates := make([]ListPageCandidate, 0)
	for _, u := range result.ListPageURLs {
		if u.URL != "" && u.URL != currentURL {
			candidates = append(candidates, ListPageCandidate{
				URL:        u.URL,
				Source:     "llm",
				Confidence: u.Confidence,
				Reason:     u.Reason,
			})
		}
	}

	s.logger.Info("LLM list page extraction completed",
		zap.Int("candidates_count", len(candidates)),
		zap.String("analysis", result.Analysis),
	)

	return candidates
}

// DFSListPageResult represents the result of DFS list page search
type DFSListPageResult struct {
	Found      bool
	ListURL    string
	Source     string // url_parse, html_extract, llm
	Confidence int
	Reason     string
	Depth      int
	Path       []string // Search path taken
}

// findListPageDFS uses DFS algorithm to find the real list page that contains the article
func (s *FenbiService) findListPageDFS(articleURL string, articleHTML string, spider *crawler.FenbiSpider) *DFSListPageResult {
	const maxDepth = 3 // Maximum search depth to avoid infinite recursion
	visited := make(map[string]bool)
	visited[articleURL] = true // Mark article URL as visited

	s.logger.Info("Starting DFS list page search",
		zap.String("article_url", articleURL),
		zap.Int("max_depth", maxDepth),
	)

	// Phase 1: Try with URL analysis and HTML link extraction (fast, no LLM cost)
	result := s.searchListPageRecursive(articleURL, articleHTML, articleURL, 0, maxDepth, visited, []string{articleURL}, spider, false)

	if result.Found {
		s.logger.Info("DFS found valid list page (phase 1)",
			zap.String("list_url", result.ListURL),
			zap.String("source", result.Source),
			zap.Int("depth", result.Depth),
			zap.Strings("path", result.Path),
		)
		return result
	}

	// Phase 2: If not found, try with LLM analysis
	s.logger.Info("Phase 1 failed, trying with LLM analysis")
	llmCandidates := s.extractByLLM(articleURL, articleHTML)
	if len(llmCandidates) > 0 {
		for _, candidate := range llmCandidates {
			if visited[candidate.URL] {
				continue
			}
			visited[candidate.URL] = true

			s.logger.Debug("Checking LLM candidate",
				zap.String("url", candidate.URL),
				zap.Int("confidence", candidate.Confidence),
			)

			content, err := spider.FetchPageContent(candidate.URL)
			if err != nil {
				continue
			}

			containsArticle, matchReason := s.pageContainsArticleLink(content.HTML, articleURL, candidate.URL)
			if containsArticle {
				s.logger.Info("DFS found valid list page via LLM (phase 2)",
					zap.String("list_url", candidate.URL),
				)
				return &DFSListPageResult{
					Found:      true,
					ListURL:    candidate.URL,
					Source:     "llm",
					Confidence: candidate.Confidence,
					Reason:     fmt.Sprintf("%s; %s", candidate.Reason, matchReason),
					Depth:      1,
					Path:       []string{articleURL, candidate.URL},
				}
			}

			// Continue DFS from LLM candidate
			if maxDepth > 1 {
				subResult := s.searchListPageRecursive(
					candidate.URL,
					content.HTML,
					articleURL,
					1,
					maxDepth,
					visited,
					[]string{articleURL, candidate.URL},
					spider,
					false,
				)
				if subResult.Found {
					return subResult
				}
			}
		}
	}

	s.logger.Info("DFS did not find valid list page",
		zap.Int("visited_count", len(visited)),
	)

	return &DFSListPageResult{Found: false}
}

// searchListPageRecursive performs recursive DFS search for list page
// useLLM parameter is reserved for future use (LLM is now called separately in findListPageDFS)
func (s *FenbiService) searchListPageRecursive(
	currentURL string,
	currentHTML string,
	articleURL string,
	depth int,
	maxDepth int,
	visited map[string]bool,
	path []string,
	spider *crawler.FenbiSpider,
	useLLM bool,
) *DFSListPageResult {

	s.logger.Debug("DFS searching at depth",
		zap.Int("depth", depth),
		zap.String("current_url", currentURL),
		zap.Int("visited_count", len(visited)),
	)

	// Get candidate list pages from current page (without LLM - LLM is called separately in phase 2)
	candidates := s.extractListPageURLsWithoutLLM(currentURL, currentHTML)

	s.logger.Debug("Found candidates at current level",
		zap.Int("count", len(candidates)),
		zap.String("current_url", currentURL),
	)

	// Try each candidate
	for _, candidate := range candidates {
		if visited[candidate.URL] {
			continue
		}
		visited[candidate.URL] = true

		s.logger.Debug("Checking candidate",
			zap.String("url", candidate.URL),
			zap.String("source", candidate.Source),
			zap.Int("confidence", candidate.Confidence),
		)

		// Fetch candidate page content
		content, err := spider.FetchPageContent(candidate.URL)
		if err != nil {
			s.logger.Debug("Failed to fetch candidate page",
				zap.String("url", candidate.URL),
				zap.Error(err),
			)
			continue
		}

		// Check if this candidate page contains a link to our article
		containsArticle, matchReason := s.pageContainsArticleLink(content.HTML, articleURL, candidate.URL)

		if containsArticle {
			// Found it! This is the real list page
			newPath := append(path, candidate.URL)
			return &DFSListPageResult{
				Found:      true,
				ListURL:    candidate.URL,
				Source:     candidate.Source,
				Confidence: candidate.Confidence,
				Reason:     fmt.Sprintf("%s; %s", candidate.Reason, matchReason),
				Depth:      depth + 1,
				Path:       newPath,
			}
		}

		// If not found and not at max depth, continue DFS on this candidate
		if depth < maxDepth-1 {
			newPath := append(path, candidate.URL)
			result := s.searchListPageRecursive(
				candidate.URL,
				content.HTML,
				articleURL,
				depth+1,
				maxDepth,
				visited,
				newPath,
				spider,
				false,
			)
			if result.Found {
				return result
			}
		}
	}

	// Not found at this level
	return &DFSListPageResult{Found: false}
}

// pageContainsArticleLink checks if a page contains a link to the specified article
// AND verifies that the page looks like a proper list page (has multiple article-like links)
func (s *FenbiService) pageContainsArticleLink(pageHTML string, articleURL string, pageURL string) (bool, string) {
	if pageHTML == "" || articleURL == "" {
		return false, ""
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(pageHTML))
	if err != nil {
		return false, ""
	}

	// Parse article URL to extract key parts for matching
	articleParsed, err := url.Parse(articleURL)
	if err != nil {
		return false, ""
	}

	pageParsed, _ := url.Parse(pageURL)

	// Extract article identifier (e.g., "43033" from "/content/43033.html")
	articlePath := articleParsed.Path
	articleID := extractArticleID(articlePath)
	// Get the article's directory pattern (e.g., "/content/" from "/content/43033.html")
	articleDirPattern := extractDirPattern(articlePath)

	s.logger.Debug("Checking if page contains article link",
		zap.String("article_url", articleURL),
		zap.String("article_id", articleID),
		zap.String("article_dir_pattern", articleDirPattern),
		zap.String("page_url", pageURL),
	)

	foundArticleLink := false
	matchReason := ""
	similarLinkCount := 0 // Count links with similar pattern to verify it's a list page

	doc.Find("a[href]").Each(func(_ int, sel *goquery.Selection) {
		href, exists := sel.Attr("href")
		if !exists || href == "" || href == "#" || strings.HasPrefix(href, "javascript:") {
			return
		}

		// Resolve relative URL
		fullHref := resolveURL(pageParsed, href)
		if fullHref == "" {
			return
		}

		hrefParsed, err := url.Parse(fullHref)
		if err != nil {
			return
		}

		// Check if this link points to our article
		if !foundArticleLink {
			// Method 1: Exact URL match
			if fullHref == articleURL {
				foundArticleLink = true
				matchReason = "完整URL匹配"
			}

			// Method 2: Path match (same host and path)
			if !foundArticleLink && hrefParsed.Host == articleParsed.Host && hrefParsed.Path == articlePath {
				foundArticleLink = true
				matchReason = "路径匹配"
			}

			// Method 3: Strict article ID match - ID must be in the path segment
			if !foundArticleLink && articleID != "" && hrefParsed.Host == articleParsed.Host {
				// Check if the href path ends with the article ID (with extension)
				hrefPath := hrefParsed.Path
				if strings.Contains(hrefPath, "/"+articleID+".") || strings.HasSuffix(hrefPath, "/"+articleID) {
					foundArticleLink = true
					matchReason = fmt.Sprintf("文章ID'%s'路径匹配", articleID)
				}
			}
		}

		// Count similar links to verify this is a list page
		// A valid list page should have multiple links with similar URL patterns
		if articleDirPattern != "" && strings.Contains(hrefParsed.Path, articleDirPattern) {
			similarLinkCount++
		}
	})

	// Validation: A valid list page should have at least 3 similar article links
	isValidListPage := similarLinkCount >= 3

	s.logger.Debug("Page analysis result",
		zap.String("page_url", pageURL),
		zap.Bool("found_article_link", foundArticleLink),
		zap.String("match_reason", matchReason),
		zap.Int("similar_link_count", similarLinkCount),
		zap.Bool("is_valid_list_page", isValidListPage),
	)

	if foundArticleLink && isValidListPage {
		// Use LLM to verify this is a real list page (not an article page with references)
		isRealListPage, llmReason := s.verifyListPageWithLLM(pageURL, pageHTML, articleURL)
		if isRealListPage {
			return true, fmt.Sprintf("%s (列表页包含%d个同类链接); %s", matchReason, similarLinkCount, llmReason)
		}

		s.logger.Info("LLM rejected candidate as list page",
			zap.String("page_url", pageURL),
			zap.String("reason", llmReason),
		)
		return false, ""
	}

	// If found article link but not enough similar links, it's probably not the right list page
	if foundArticleLink && !isValidListPage {
		s.logger.Debug("Found article link but page doesn't look like a list page",
			zap.String("page_url", pageURL),
			zap.Int("similar_links", similarLinkCount),
		)
	}

	return false, ""
}

// verifyListPageWithLLM uses LLM to verify if a page is a real list page
// Returns (isListPage, reason)
func (s *FenbiService) verifyListPageWithLLM(pageURL string, pageHTML string, articleURL string) (bool, string) {
	if s.llmConfigService == nil {
		return true, "LLM服务不可用，跳过验证"
	}

	// Truncate HTML to avoid token limit (keep first 20k chars)
	truncatedHTML := pageHTML
	if len(pageHTML) > 20000 {
		truncatedHTML = pageHTML[:20000]
	}

	template := ai.GetPromptTemplate("list_page_verification")
	if template == "" {
		return true, "验证模板不存在，跳过验证"
	}

	prompt := strings.Replace(template, "{{page_url}}", pageURL, 1)
	prompt = strings.Replace(prompt, "{{article_url}}", articleURL, 1)
	prompt = strings.Replace(prompt, "{{html_content}}", truncatedHTML, 1)

	s.logger.Info("Calling LLM for list page verification",
		zap.String("page_url", pageURL),
		zap.String("article_url", articleURL),
	)

	response, err := s.llmConfigService.CallWithConfigID(0, prompt, 30, 1024)
	if err != nil {
		s.logger.Warn("LLM list page verification failed", zap.Error(err))
		return true, "LLM调用失败，跳过验证"
	}

	var result struct {
		IsListPage bool   `json:"is_list_page"`
		Confidence int    `json:"confidence"`
		PageType   string `json:"page_type"`
		Reason     string `json:"reason"`
	}

	jsonStr := s.extractJSONFromResponse(response)
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		s.logger.Warn("Failed to parse LLM verification response", zap.Error(err))
		return true, "LLM响应解析失败，跳过验证"
	}

	s.logger.Info("LLM list page verification result",
		zap.String("page_url", pageURL),
		zap.Bool("is_list_page", result.IsListPage),
		zap.Int("confidence", result.Confidence),
		zap.String("page_type", result.PageType),
		zap.String("reason", result.Reason),
	)

	// Only accept if LLM confirms it's a list page with confidence >= 70
	if result.IsListPage && result.Confidence >= 70 {
		return true, fmt.Sprintf("LLM验证通过: %s (置信度%d%%)", result.Reason, result.Confidence)
	}

	return false, fmt.Sprintf("LLM判定非列表页: %s", result.Reason)
}

// extractDirPattern extracts the directory pattern from a URL path
// e.g., "/content/43033.html" -> "/content/"
// e.g., "/news/2024/12345.shtml" -> "/news/"
func extractDirPattern(path string) string {
	parts := strings.Split(path, "/")
	if len(parts) < 2 {
		return ""
	}
	// Return the first meaningful directory segment
	for _, part := range parts {
		if part != "" && !strings.Contains(part, ".") {
			return "/" + part + "/"
		}
	}
	return ""
}

// extractArticleID extracts the article identifier from a URL path
// e.g., "/content/43033.html" -> "43033"
// e.g., "/news/2024/article_12345.shtml" -> "12345"
func extractArticleID(path string) string {
	// Remove file extension
	path = strings.TrimSuffix(path, ".html")
	path = strings.TrimSuffix(path, ".shtml")
	path = strings.TrimSuffix(path, ".htm")
	path = strings.TrimSuffix(path, ".aspx")
	path = strings.TrimSuffix(path, ".jsp")
	path = strings.TrimSuffix(path, ".php")

	// Get the last segment
	parts := strings.Split(path, "/")
	if len(parts) == 0 {
		return ""
	}
	lastPart := parts[len(parts)-1]

	// Try to extract numeric ID
	// Pattern: may have prefix like "article_", "content_", etc.
	if idx := strings.LastIndex(lastPart, "_"); idx >= 0 {
		lastPart = lastPart[idx+1:]
	}

	// If it's purely numeric or looks like an ID, return it
	if len(lastPart) >= 3 && len(lastPart) <= 20 {
		return lastPart
	}

	return ""
}

// Helper function to resolve relative URL to absolute URL
func resolveURL(base *url.URL, href string) string {
	if base == nil || href == "" {
		return ""
	}

	// Already absolute URL
	if strings.HasPrefix(href, "http://") || strings.HasPrefix(href, "https://") {
		return href
	}

	// Parse and resolve relative URL
	refURL, err := url.Parse(href)
	if err != nil {
		return ""
	}

	return base.ResolveReference(refURL).String()
}

// Helper function to check if a slice contains a string
func stringSliceContains(slice []string, str string) bool {
	for _, s := range slice {
		if s == str {
			return true
		}
	}
	return false
}
