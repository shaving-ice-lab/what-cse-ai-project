package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"go.uber.org/zap"

	"github.com/what-cse/server/internal/crawler"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrWechatMPAuthNotFound     = errors.New("wechat MP auth not found")
	ErrWechatMPAuthExpired      = errors.New("wechat MP auth expired")
	ErrWechatMPAuthInvalid      = errors.New("wechat MP auth invalid")
	ErrWechatMPLoginFailed      = errors.New("wechat MP login failed")
	ErrWechatMPQRCodeFailed     = errors.New("failed to get QR code")
	ErrWechatMPAccountNotFound  = errors.New("wechat MP account not found")
)

// WechatMPAuthService handles WeChat MP platform authentication
type WechatMPAuthService struct {
	authRepo  *repository.WechatMPAuthRepository
	mpCrawler *crawler.WechatMPCrawler
	logger    *zap.Logger

	// Token validity threshold (hours before expiry to mark as expiring)
	expiringThreshold time.Duration
}

// NewWechatMPAuthService creates a new WechatMPAuthService
func NewWechatMPAuthService(
	authRepo *repository.WechatMPAuthRepository,
	logger *zap.Logger,
) *WechatMPAuthService {
	return &WechatMPAuthService{
		authRepo:          authRepo,
		mpCrawler:         crawler.NewWechatMPCrawler(logger),
		logger:            logger,
		expiringThreshold: 20 * time.Hour, // Mark as expiring after 20 hours
	}
}

// GetAuthStatus gets the current authentication status
func (s *WechatMPAuthService) GetAuthStatus() (*model.WechatMPAuthResponse, error) {
	auth, err := s.authRepo.GetLatest()
	if err != nil {
		return &model.WechatMPAuthResponse{
			Status:     model.WechatMPAuthStatusInvalid,
			StatusText: "未授权",
			Message:    "未找到授权信息，请扫码授权",
		}, nil
	}

	// Check and update status based on time
	s.checkAndUpdateAuthStatus(auth)

	return auth.ToResponse(), nil
}

// GetValidAuth gets a valid auth for API calls
func (s *WechatMPAuthService) GetValidAuth() (*model.WechatMPAuth, error) {
	auth, err := s.authRepo.GetLatest()
	if err != nil {
		return nil, ErrWechatMPAuthNotFound
	}

	// Check and update status
	s.checkAndUpdateAuthStatus(auth)

	// Check if usable
	if auth.Status == model.WechatMPAuthStatusExpired || auth.Status == model.WechatMPAuthStatusInvalid {
		return nil, ErrWechatMPAuthExpired
	}

	// Update last used time
	s.authRepo.UpdateLastUsed(auth.ID)

	return auth, nil
}

// checkAndUpdateAuthStatus checks auth status based on time elapsed
func (s *WechatMPAuthService) checkAndUpdateAuthStatus(auth *model.WechatMPAuth) {
	if auth.Status == model.WechatMPAuthStatusExpired || auth.Status == model.WechatMPAuthStatusInvalid {
		return
	}

	elapsed := time.Since(auth.CreatedAt)

	// Mark as expiring if over threshold
	if auth.Status == model.WechatMPAuthStatusActive && elapsed > s.expiringThreshold {
		auth.Status = model.WechatMPAuthStatusExpiring
		s.authRepo.UpdateStatus(auth.ID, model.WechatMPAuthStatusExpiring)
		s.logger.Info("Auth marked as expiring", zap.Uint("id", auth.ID))
	}

	// Mark as expired if over 24 hours
	if elapsed > 24*time.Hour {
		auth.Status = model.WechatMPAuthStatusExpired
		s.authRepo.UpdateStatus(auth.ID, model.WechatMPAuthStatusExpired)
		s.logger.Info("Auth marked as expired", zap.Uint("id", auth.ID))
	}
}

// GetQRCode gets a new login QR code
func (s *WechatMPAuthService) GetQRCode(ctx context.Context) (*model.WechatMPQRCodeResponse, error) {
	s.logger.Info("Requesting new QR code for WeChat MP login")

	qrInfo, err := s.mpCrawler.GetQRCode(ctx)
	if err != nil {
		s.logger.Error("Failed to get QR code", zap.Error(err))
		return nil, ErrWechatMPQRCodeFailed
	}

	return &model.WechatMPQRCodeResponse{
		QRCodeURL: qrInfo.QRCodeURL,
		UUID:      qrInfo.UUID,
		ExpiresIn: qrInfo.ExpiresIn,
	}, nil
}

// CheckLoginStatus checks the login status
func (s *WechatMPAuthService) CheckLoginStatus(ctx context.Context, uuid string) (*model.WechatMPLoginStatusResponse, error) {
	s.logger.Debug("Checking login status", zap.String("uuid", uuid))

	status, err := s.mpCrawler.CheckLoginStatus(ctx, uuid)
	if err != nil {
		return nil, err
	}

	// If login confirmed, save auth info
	if status.Status == "confirmed" && status.Token != "" {
		// Mark all previous auths as expired
		s.authRepo.MarkAllExpired()

		// Create new auth record
		auth := &model.WechatMPAuth{
			Token:       status.Token,
			Cookies:     status.Cookies,
			AccountName: status.AccountName,
			AccountID:   status.AccountID,
			Status:      model.WechatMPAuthStatusActive,
		}

		if err := s.authRepo.Create(auth); err != nil {
			s.logger.Error("Failed to save auth info", zap.Error(err))
			return nil, err
		}

		s.logger.Info("Login successful, auth saved",
			zap.String("account", status.AccountName),
			zap.Uint("auth_id", auth.ID),
		)
	}

	return &model.WechatMPLoginStatusResponse{
		Status:  status.Status,
		Message: status.Message,
	}, nil
}

// HandleAPIError handles API errors and updates auth status if needed
func (s *WechatMPAuthService) HandleAPIError(errCode int) {
	// Common error codes indicating token expiry
	if errCode == -1 || errCode == 200003 {
		auth, err := s.authRepo.GetLatest()
		if err == nil {
			s.authRepo.UpdateStatus(auth.ID, model.WechatMPAuthStatusExpired)
			s.logger.Warn("Auth marked as expired due to API error", zap.Int("code", errCode))
		}
	}
}

// Logout removes the current auth
func (s *WechatMPAuthService) Logout() error {
	return s.authRepo.MarkAllExpired()
}

// GetCookiesMap returns cookies as a map for API calls
func (s *WechatMPAuthService) GetCookiesMap(auth *model.WechatMPAuth) (map[string]string, error) {
	if auth.Cookies == "" {
		return nil, nil
	}

	var cookies map[string]string
	if err := json.Unmarshal([]byte(auth.Cookies), &cookies); err != nil {
		return nil, fmt.Errorf("failed to parse cookies: %w", err)
	}

	return cookies, nil
}

// SearchAccount searches for a public account
func (s *WechatMPAuthService) SearchAccount(ctx context.Context, keyword string) ([]crawler.MPAccountInfo, error) {
	auth, err := s.GetValidAuth()
	if err != nil {
		return nil, err
	}

	cookies, err := s.GetCookiesMap(auth)
	if err != nil {
		return nil, err
	}

	accounts, err := s.mpCrawler.SearchAccount(ctx, keyword, auth.Token, cookies)
	if err != nil {
		// Check if token expired
		if isTokenExpiredError(err) {
			s.authRepo.UpdateStatus(auth.ID, model.WechatMPAuthStatusExpired)
		}
		return nil, err
	}

	return accounts, nil
}

// GetFakeIDFromBiz gets fakeid from biz parameter
func (s *WechatMPAuthService) GetFakeIDFromBiz(ctx context.Context, biz string) (*crawler.MPAccountInfo, error) {
	auth, err := s.GetValidAuth()
	if err != nil {
		return nil, err
	}

	cookies, err := s.GetCookiesMap(auth)
	if err != nil {
		return nil, err
	}

	account, err := s.mpCrawler.GetFakeIDFromBiz(ctx, biz, auth.Token, cookies)
	if err != nil {
		if isTokenExpiredError(err) {
			s.authRepo.UpdateStatus(auth.ID, model.WechatMPAuthStatusExpired)
		}
		return nil, err
	}

	return account, nil
}

// GetArticleList gets articles from a public account
func (s *WechatMPAuthService) GetArticleList(ctx context.Context, fakeid string, begin, count int) (*crawler.MPArticleListResponse, error) {
	auth, err := s.GetValidAuth()
	if err != nil {
		return nil, err
	}

	cookies, err := s.GetCookiesMap(auth)
	if err != nil {
		return nil, err
	}

	articles, err := s.mpCrawler.GetArticleList(ctx, fakeid, auth.Token, cookies, begin, count)
	if err != nil {
		if isTokenExpiredError(err) {
			s.authRepo.UpdateStatus(auth.ID, model.WechatMPAuthStatusExpired)
		}
		return nil, err
	}

	// Update last used time
	s.authRepo.UpdateLastUsed(auth.ID)

	return articles, nil
}

// isTokenExpiredError checks if the error indicates token expiry
func isTokenExpiredError(err error) bool {
	if err == nil {
		return false
	}
	errMsg := err.Error()
	return contains(errMsg, "token expired") || contains(errMsg, "please re-login")
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsSubstring(s, substr))
}

func containsSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
