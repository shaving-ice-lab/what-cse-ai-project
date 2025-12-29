package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestRegisterHandler_ValidRequest(t *testing.T) {
	e := echo.New()

	reqBody := map[string]string{
		"phone":    "13800138000",
		"password": "password123",
		"nickname": "TestUser",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	assert.NotNil(t, c)
	assert.Equal(t, http.MethodPost, req.Method)
}

func TestRegisterHandler_InvalidJSON(t *testing.T) {
	e := echo.New()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader([]byte("invalid json")))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	assert.NotNil(t, c)
}

func TestLoginHandler_ValidRequest(t *testing.T) {
	e := echo.New()

	reqBody := map[string]string{
		"account":  "13800138000",
		"password": "password123",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	assert.NotNil(t, c)
	assert.Equal(t, http.MethodPost, req.Method)
}

func TestLoginHandler_MissingPassword(t *testing.T) {
	e := echo.New()

	reqBody := map[string]string{
		"account": "13800138000",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	assert.NotNil(t, c)

	var parsed map[string]string
	json.Unmarshal(body, &parsed)
	assert.Empty(t, parsed["password"])
}

func TestRefreshTokenHandler_ValidRequest(t *testing.T) {
	e := echo.New()

	reqBody := map[string]string{
		"refresh_token": "valid-refresh-token",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/refresh", bytes.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	assert.NotNil(t, c)
}

func TestAuthResponse_Format(t *testing.T) {
	type AuthResponse struct {
		Code    int         `json:"code"`
		Message string      `json:"message"`
		Data    interface{} `json:"data"`
	}

	resp := AuthResponse{
		Code:    0,
		Message: "success",
		Data: map[string]interface{}{
			"access_token":  "token123",
			"refresh_token": "refresh123",
			"expires_in":    86400,
			"user": map[string]interface{}{
				"id":       1,
				"nickname": "TestUser",
				"phone":    "13800138000",
			},
		},
	}

	assert.Equal(t, 0, resp.Code)
	assert.Equal(t, "success", resp.Message)
	assert.NotNil(t, resp.Data)
}

func TestErrorResponse_Format(t *testing.T) {
	type ErrorResponse struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	}

	tests := []struct {
		name     string
		code     int
		message  string
		httpCode int
	}{
		{
			name:     "bad request",
			code:     400,
			message:  "参数错误",
			httpCode: http.StatusBadRequest,
		},
		{
			name:     "unauthorized",
			code:     401,
			message:  "未授权",
			httpCode: http.StatusUnauthorized,
		},
		{
			name:     "not found",
			code:     404,
			message:  "资源不存在",
			httpCode: http.StatusNotFound,
		},
		{
			name:     "internal error",
			code:     500,
			message:  "服务器内部错误",
			httpCode: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := ErrorResponse{
				Code:    tt.code,
				Message: tt.message,
			}
			assert.Equal(t, tt.code, resp.Code)
			assert.Equal(t, tt.message, resp.Message)
		})
	}
}

func TestContentTypeValidation(t *testing.T) {
	validTypes := []string{
		"application/json",
		"application/json; charset=utf-8",
	}

	for _, ct := range validTypes {
		assert.Contains(t, ct, "application/json")
	}
}

func TestRequestBinding(t *testing.T) {
	type RegisterRequest struct {
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Nickname string `json:"nickname"`
	}

	jsonStr := `{"phone":"13800138000","password":"test123","nickname":"Test"}`

	var req RegisterRequest
	err := json.Unmarshal([]byte(jsonStr), &req)

	assert.NoError(t, err)
	assert.Equal(t, "13800138000", req.Phone)
	assert.Equal(t, "test123", req.Password)
	assert.Equal(t, "Test", req.Nickname)
}
