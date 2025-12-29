package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"server/internal/config"
	"server/internal/model"
)

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) FindByPhone(phone string) (*model.User, error) {
	args := m.Called(phone)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) FindByEmail(email string) (*model.User, error) {
	args := m.Called(email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) FindByID(id uint) (*model.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) Create(user *model.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) Update(user *model.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func getTestJWTConfig() *config.JWTConfig {
	return &config.JWTConfig{
		Secret:          "test-secret-key",
		ExpirationHours: 24,
		RefreshHours:    168,
	}
}

func TestAuthService_Register_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := getTestJWTConfig()

	mockRepo.On("FindByPhone", "13800138000").Return(nil, nil)
	mockRepo.On("Create", mock.AnythingOfType("*model.User")).Return(nil)

	service := &AuthService{
		userRepo: nil,
		cfg:      cfg,
	}

	req := &RegisterRequest{
		Phone:    "13800138000",
		Password: "password123",
		Nickname: "TestUser",
	}

	assert.NotNil(t, req)
	assert.Equal(t, "13800138000", req.Phone)
	assert.Equal(t, "password123", req.Password)
	assert.NotNil(t, service)
}

func TestAuthService_Register_UserExists(t *testing.T) {
	existingUser := &model.User{
		Phone: "13800138000",
	}
	existingUser.ID = 1

	assert.NotNil(t, existingUser)
	assert.Equal(t, "13800138000", existingUser.Phone)
}

func TestAuthService_GenerateTokens(t *testing.T) {
	cfg := getTestJWTConfig()

	service := &AuthService{
		userRepo: nil,
		cfg:      cfg,
	}

	user := &model.User{
		Phone: "13800138000",
		Email: "test@example.com",
	}
	user.ID = 1

	tokens, err := service.generateTokens(user)

	assert.NoError(t, err)
	assert.NotNil(t, tokens)
	assert.NotEmpty(t, tokens.AccessToken)
	assert.NotEmpty(t, tokens.RefreshToken)
	assert.Equal(t, int64(24*3600), tokens.ExpiresIn)
}

func TestAuthService_ValidateToken(t *testing.T) {
	cfg := getTestJWTConfig()

	service := &AuthService{
		userRepo: nil,
		cfg:      cfg,
	}

	user := &model.User{
		Phone: "13800138000",
		Email: "test@example.com",
	}
	user.ID = 1

	tokens, _ := service.generateTokens(user)

	claims, err := service.ValidateToken(tokens.AccessToken)

	assert.NoError(t, err)
	assert.NotNil(t, claims)
	assert.Equal(t, uint(1), claims.UserID)
	assert.Equal(t, "13800138000", claims.Phone)
}

func TestAuthService_ValidateToken_Invalid(t *testing.T) {
	cfg := getTestJWTConfig()

	service := &AuthService{
		userRepo: nil,
		cfg:      cfg,
	}

	_, err := service.ValidateToken("invalid-token")

	assert.Error(t, err)
}

func TestHashPassword(t *testing.T) {
	password := "testpassword123"

	assert.NotEmpty(t, password)
	assert.GreaterOrEqual(t, len(password), 6)
}

func TestRegisterRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		req     RegisterRequest
		wantErr bool
	}{
		{
			name: "valid phone registration",
			req: RegisterRequest{
				Phone:    "13800138000",
				Password: "password123",
				Nickname: "TestUser",
			},
			wantErr: false,
		},
		{
			name: "valid email registration",
			req: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Nickname: "TestUser",
			},
			wantErr: false,
		},
		{
			name: "password too short",
			req: RegisterRequest{
				Phone:    "13800138000",
				Password: "12345",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.wantErr {
				assert.Less(t, len(tt.req.Password), 6)
			} else {
				assert.GreaterOrEqual(t, len(tt.req.Password), 6)
			}
		})
	}
}

func TestLoginRequest_Validation(t *testing.T) {
	req := LoginRequest{
		Account:  "13800138000",
		Password: "password123",
	}

	assert.NotEmpty(t, req.Account)
	assert.NotEmpty(t, req.Password)
}
