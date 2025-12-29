package service

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
	"github.com/what-cse/server/internal/config"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"golang.org/x/crypto/bcrypt"
	"time"
)

var (
	ErrAdminNotFound      = errors.New("admin not found")
	ErrAdminDisabled      = errors.New("admin account is disabled")
	ErrInvalidAdminCredentials = errors.New("invalid admin credentials")
)

type AdminService struct {
	adminRepo    *repository.AdminRepository
	userRepo     *repository.UserRepository
	positionRepo *repository.PositionRepository
	cfg          *config.JWTConfig
}

func NewAdminService(
	adminRepo *repository.AdminRepository,
	userRepo *repository.UserRepository,
	positionRepo *repository.PositionRepository,
	cfg *config.JWTConfig,
) *AdminService {
	return &AdminService{
		adminRepo:    adminRepo,
		userRepo:     userRepo,
		positionRepo: positionRepo,
		cfg:          cfg,
	}
}

type AdminLoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type AdminTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
	Admin       AdminInfo `json:"admin"`
}

type AdminInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

type AdminClaims struct {
	AdminID  uint   `json:"admin_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func (s *AdminService) Login(req *AdminLoginRequest) (*AdminTokenResponse, error) {
	admin, err := s.adminRepo.FindByUsername(req.Username)
	if err != nil || admin == nil {
		return nil, ErrAdminNotFound
	}

	if admin.Status == 0 {
		return nil, ErrAdminDisabled
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidAdminCredentials
	}

	token, err := s.generateAdminToken(admin)
	if err != nil {
		return nil, err
	}

	return &AdminTokenResponse{
		AccessToken: token,
		ExpiresIn:   int64(s.cfg.ExpirationHours * 3600),
		Admin: AdminInfo{
			ID:       admin.ID,
			Username: admin.Username,
			Role:     admin.Role,
		},
	}, nil
}

func (s *AdminService) generateAdminToken(admin *model.Admin) (string, error) {
	now := time.Now()
	expirationTime := now.Add(time.Duration(s.cfg.ExpirationHours) * time.Hour)

	claims := &AdminClaims{
		AdminID:  admin.ID,
		Username: admin.Username,
		Role:     admin.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.Secret))
}

func (s *AdminService) ValidateAdminToken(tokenString string) (*AdminClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &AdminClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*AdminClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// User management
func (s *AdminService) ListUsers(page, pageSize int, keyword string) ([]model.User, int64, error) {
	if keyword != "" {
		return s.userRepo.Search(keyword, page, pageSize)
	}
	return s.userRepo.List(page, pageSize)
}

func (s *AdminService) UpdateUserStatus(userID uint, status int) error {
	return s.userRepo.UpdateStatus(userID, status)
}

// Position management
func (s *AdminService) ListPositionsForAdmin(filter *repository.PositionFilter, page, pageSize int) ([]model.Position, int64, error) {
	return s.positionRepo.List(filter, nil, page, pageSize)
}

func (s *AdminService) UpdatePositionStatus(positionID uint, status int) error {
	return s.positionRepo.UpdateStatus(positionID, status)
}

// Statistics
type DashboardStats struct {
	TotalUsers         int64            `json:"total_users"`
	TotalPositions     int64            `json:"total_positions"`
	TotalAnnouncements int64            `json:"total_announcements"`
	NewUsersToday      int64            `json:"new_users_today"`
	PositionsByExamType map[string]int64 `json:"positions_by_exam_type"`
	PositionsByProvince map[string]int64 `json:"positions_by_province"`
}

func (s *AdminService) GetDashboardStats() (*DashboardStats, error) {
	stats := &DashboardStats{}

	// Get user count
	_, total, err := s.userRepo.List(1, 1)
	if err == nil {
		stats.TotalUsers = total
	}

	// Get position stats
	byExamType, err := s.positionRepo.GetStatsByExamType()
	if err == nil {
		stats.PositionsByExamType = byExamType
		for _, count := range byExamType {
			stats.TotalPositions += count
		}
	}

	byProvince, err := s.positionRepo.GetStatsByProvince()
	if err == nil {
		stats.PositionsByProvince = byProvince
	}

	return stats, nil
}
