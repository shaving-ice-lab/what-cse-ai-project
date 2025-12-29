package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/what-cse/server/internal/config"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserExists         = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
	ErrUserDisabled       = errors.New("user account is disabled")
)

type AuthService struct {
	userRepo *repository.UserRepository
	cfg      *config.JWTConfig
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.JWTConfig) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

type RegisterRequest struct {
	Phone    string `json:"phone" validate:"required_without=Email"`
	Email    string `json:"email" validate:"required_without=Phone,omitempty,email"`
	Password string `json:"password" validate:"required,min=6"`
	Nickname string `json:"nickname"`
}

type LoginRequest struct {
	Account  string `json:"account" validate:"required"` // phone or email
	Password string `json:"password" validate:"required"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type Claims struct {
	UserID uint   `json:"user_id"`
	Phone  string `json:"phone"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

func (s *AuthService) Register(req *RegisterRequest) (*model.User, error) {
	// Check if user already exists
	if req.Phone != "" {
		existing, _ := s.userRepo.FindByPhone(req.Phone)
		if existing != nil {
			return nil, ErrUserExists
		}
	}
	if req.Email != "" {
		existing, _ := s.userRepo.FindByEmail(req.Email)
		if existing != nil {
			return nil, ErrUserExists
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &model.User{
		Phone:        req.Phone,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Nickname:     req.Nickname,
		Status:       int(model.UserStatusNormal),
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) Login(req *LoginRequest) (*model.User, *TokenResponse, error) {
	// Find user by phone or email
	var user *model.User
	var err error

	user, err = s.userRepo.FindByPhone(req.Account)
	if err != nil || user == nil {
		user, err = s.userRepo.FindByEmail(req.Account)
	}

	if err != nil || user == nil {
		return nil, nil, ErrUserNotFound
	}

	// Check if user is disabled
	if user.Status == int(model.UserStatusDisabled) {
		return nil, nil, ErrUserDisabled
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	// Generate tokens
	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (s *AuthService) RefreshToken(refreshToken string) (*TokenResponse, error) {
	// Parse and validate refresh token
	claims, err := s.parseToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// Find user
	user, err := s.userRepo.FindByID(claims.UserID)
	if err != nil || user == nil {
		return nil, ErrUserNotFound
	}

	// Check if user is disabled
	if user.Status == int(model.UserStatusDisabled) {
		return nil, ErrUserDisabled
	}

	// Generate new tokens
	return s.generateTokens(user)
}

func (s *AuthService) generateTokens(user *model.User) (*TokenResponse, error) {
	now := time.Now()
	expirationTime := now.Add(time.Duration(s.cfg.ExpirationHours) * time.Hour)
	refreshExpirationTime := now.Add(time.Duration(s.cfg.RefreshHours) * time.Hour)

	// Create access token claims
	claims := &Claims{
		UserID: user.ID,
		Phone:  user.Phone,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(now),
			Subject:   string(rune(user.ID)),
		},
	}

	// Generate access token
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessTokenString, err := accessToken.SignedString([]byte(s.cfg.Secret))
	if err != nil {
		return nil, err
	}

	// Create refresh token claims
	refreshClaims := &Claims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(refreshExpirationTime),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	// Generate refresh token
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(s.cfg.Secret))
	if err != nil {
		return nil, err
	}

	return &TokenResponse{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresIn:    int64(s.cfg.ExpirationHours * 3600),
	}, nil
}

func (s *AuthService) parseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	return s.parseToken(tokenString)
}
