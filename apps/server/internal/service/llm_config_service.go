package service

import (
	"bytes"
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrLLMConfigNotFound     = errors.New("LLM config not found")
	ErrLLMConfigNameExists   = errors.New("LLM config name already exists")
	ErrLLMConfigTestFailed   = errors.New("LLM config test failed")
	ErrNoDefaultLLMConfig    = errors.New("no default LLM config")
	ErrLLMConfigDisabled     = errors.New("LLM config is disabled")
)

// LLM encryption key (should be from config in production)
var llmEncryptionKey = []byte("whatcse-llm-secret-key-aes256!!")

type LLMConfigService struct {
	repo   *repository.LLMConfigRepository
	logger *zap.Logger
}

func NewLLMConfigService(repo *repository.LLMConfigRepository, logger *zap.Logger) *LLMConfigService {
	return &LLMConfigService{
		repo:   repo,
		logger: logger,
	}
}

// Create creates a new LLM config
func (s *LLMConfigService) Create(req *model.CreateLLMConfigRequest) (*model.LLMConfigResponse, error) {
	// Check if name already exists
	exists, err := s.repo.ExistsByName(req.Name, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrLLMConfigNameExists
	}

	// Encrypt API key
	encryptedKey, err := encryptAPIKey(req.APIKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt API key: %w", err)
	}

	// Set default values
	maxTokens := req.MaxTokens
	if maxTokens <= 0 {
		maxTokens = 4096
	}
	temperature := req.Temperature
	if temperature <= 0 {
		temperature = 0.7
	}
	timeout := req.Timeout
	if timeout <= 0 {
		timeout = 60
	}

	config := &model.LLMConfig{
		Name:            req.Name,
		Provider:        req.Provider,
		Model:           req.Model,
		APIURL:          req.APIURL,
		APIKeyEncrypted: encryptedKey,
		OrganizationID:  req.OrganizationID,
		MaxTokens:       maxTokens,
		Temperature:     temperature,
		Timeout:         timeout,
		IsDefault:       req.IsDefault,
		IsEnabled:       true,
		ExtraParams:     req.ExtraParams,
		Description:     req.Description,
	}

	// If this is set as default, clear other defaults first
	if req.IsDefault {
		if err := s.repo.ClearDefault(); err != nil {
			s.logger.Warn("Failed to clear default", zap.Error(err))
		}
	}

	if err := s.repo.Create(config); err != nil {
		return nil, err
	}

	maskedKey := maskAPIKey(req.APIKey)
	resp := config.ToResponse(maskedKey)
	return &resp, nil
}

// GetByID retrieves an LLM config by ID
func (s *LLMConfigService) GetByID(id uint) (*model.LLMConfigResponse, error) {
	config, err := s.repo.GetByID(id)
	if err != nil {
		return nil, ErrLLMConfigNotFound
	}

	// Decrypt API key for masking
	apiKey, err := decryptAPIKey(config.APIKeyEncrypted)
	if err != nil {
		s.logger.Warn("Failed to decrypt API key", zap.Error(err))
		apiKey = "****"
	}

	maskedKey := maskAPIKey(apiKey)
	resp := config.ToResponse(maskedKey)
	return &resp, nil
}

// List retrieves all LLM configs
func (s *LLMConfigService) List(provider string, isEnabled *bool) ([]model.LLMConfigResponse, error) {
	configs, err := s.repo.List(provider, isEnabled)
	if err != nil {
		return nil, err
	}

	var responses []model.LLMConfigResponse
	for _, config := range configs {
		apiKey, err := decryptAPIKey(config.APIKeyEncrypted)
		if err != nil {
			apiKey = "****"
		}
		maskedKey := maskAPIKey(apiKey)
		responses = append(responses, config.ToResponse(maskedKey))
	}

	return responses, nil
}

// Update updates an LLM config
func (s *LLMConfigService) Update(id uint, req *model.UpdateLLMConfigRequest) (*model.LLMConfigResponse, error) {
	config, err := s.repo.GetByID(id)
	if err != nil {
		return nil, ErrLLMConfigNotFound
	}

	// Check if new name already exists (if name is being changed)
	if req.Name != "" && req.Name != config.Name {
		exists, err := s.repo.ExistsByName(req.Name, id)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, ErrLLMConfigNameExists
		}
		config.Name = req.Name
	}

	// Update fields if provided
	if req.Provider != "" {
		config.Provider = req.Provider
	}
	if req.Model != "" {
		config.Model = req.Model
	}
	if req.APIURL != "" {
		config.APIURL = req.APIURL
	}
	if req.APIKey != "" {
		encryptedKey, err := encryptAPIKey(req.APIKey)
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt API key: %w", err)
		}
		config.APIKeyEncrypted = encryptedKey
	}
	if req.OrganizationID != "" {
		config.OrganizationID = req.OrganizationID
	}
	if req.MaxTokens != nil {
		config.MaxTokens = *req.MaxTokens
	}
	if req.Temperature != nil {
		config.Temperature = *req.Temperature
	}
	if req.Timeout != nil {
		config.Timeout = *req.Timeout
	}
	if req.IsDefault != nil {
		if *req.IsDefault && !config.IsDefault {
			// Setting as default, clear other defaults first
			if err := s.repo.ClearDefault(); err != nil {
				s.logger.Warn("Failed to clear default", zap.Error(err))
			}
		}
		config.IsDefault = *req.IsDefault
	}
	if req.IsEnabled != nil {
		config.IsEnabled = *req.IsEnabled
	}
	if req.ExtraParams != nil {
		config.ExtraParams = req.ExtraParams
	}
	if req.Description != "" {
		config.Description = req.Description
	}

	if err := s.repo.Update(config); err != nil {
		return nil, err
	}

	apiKey, _ := decryptAPIKey(config.APIKeyEncrypted)
	maskedKey := maskAPIKey(apiKey)
	resp := config.ToResponse(maskedKey)
	return &resp, nil
}

// Delete deletes an LLM config
func (s *LLMConfigService) Delete(id uint) error {
	_, err := s.repo.GetByID(id)
	if err != nil {
		return ErrLLMConfigNotFound
	}
	return s.repo.Delete(id)
}

// SetDefault sets a config as the default
func (s *LLMConfigService) SetDefault(id uint) error {
	_, err := s.repo.GetByID(id)
	if err != nil {
		return ErrLLMConfigNotFound
	}
	return s.repo.SetDefault(id)
}

// GetDefault retrieves the default LLM config
func (s *LLMConfigService) GetDefault() (*model.LLMConfigResponse, error) {
	config, err := s.repo.GetDefault()
	if err != nil {
		return nil, ErrNoDefaultLLMConfig
	}

	apiKey, _ := decryptAPIKey(config.APIKeyEncrypted)
	maskedKey := maskAPIKey(apiKey)
	resp := config.ToResponse(maskedKey)
	return &resp, nil
}

// GetSelectOptions retrieves simplified options for select dropdowns
func (s *LLMConfigService) GetSelectOptions() ([]model.LLMSelectOption, error) {
	return s.repo.GetSelectOptions()
}

// Test tests an LLM config connection
func (s *LLMConfigService) Test(id uint, prompt string) (string, error) {
	config, err := s.repo.GetByID(id)
	if err != nil {
		return "", ErrLLMConfigNotFound
	}

	if !config.IsEnabled {
		return "", ErrLLMConfigDisabled
	}

	// Decrypt API key
	apiKey, err := decryptAPIKey(config.APIKeyEncrypted)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt API key: %w", err)
	}

	// Default test prompt
	if prompt == "" {
		prompt = "Hello, please respond with 'OK' if you can receive this message."
	}

	// Call the LLM API
	response, err := s.callLLM(config, apiKey, prompt)
	
	// Update test result
	status := 1
	message := "测试成功"
	if err != nil {
		status = 0
		message = err.Error()
	}
	s.repo.UpdateTestResult(id, status, message)

	if err != nil {
		return "", fmt.Errorf("%w: %v", ErrLLMConfigTestFailed, err)
	}

	return response, nil
}

// GetDecryptedAPIKey returns the decrypted API key for a config (internal use)
func (s *LLMConfigService) GetDecryptedAPIKey(id uint) (string, error) {
	config, err := s.repo.GetByID(id)
	if err != nil {
		return "", ErrLLMConfigNotFound
	}

	return decryptAPIKey(config.APIKeyEncrypted)
}

// GetConfigForUse returns a config ready for use with decrypted API key
func (s *LLMConfigService) GetConfigForUse(id uint) (*model.LLMConfig, string, error) {
	config, err := s.repo.GetByID(id)
	if err != nil {
		return nil, "", ErrLLMConfigNotFound
	}

	if !config.IsEnabled {
		return nil, "", ErrLLMConfigDisabled
	}

	apiKey, err := decryptAPIKey(config.APIKeyEncrypted)
	if err != nil {
		return nil, "", fmt.Errorf("failed to decrypt API key: %w", err)
	}

	return config, apiKey, nil
}

// callLLM makes a test call to the LLM API
func (s *LLMConfigService) callLLM(config *model.LLMConfig, apiKey string, prompt string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(config.Timeout)*time.Second)
	defer cancel()

	// Build request based on provider
	var reqBody []byte
	var err error

	switch model.LLMProvider(config.Provider) {
	case model.LLMProviderOpenAI, model.LLMProviderDeepSeek, model.LLMProviderCustom:
		reqBody, err = s.buildOpenAIRequest(config, prompt)
	case model.LLMProviderAnthropic:
		reqBody, err = s.buildAnthropicRequest(config, prompt)
	case model.LLMProviderOllama:
		reqBody, err = s.buildOllamaRequest(config, prompt)
	default:
		// Default to OpenAI format
		reqBody, err = s.buildOpenAIRequest(config, prompt)
	}

	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", config.APIURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")

	// Set auth header based on provider
	switch model.LLMProvider(config.Provider) {
	case model.LLMProviderAnthropic:
		req.Header.Set("x-api-key", apiKey)
		req.Header.Set("anthropic-version", "2023-06-01")
	default:
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}

	if config.OrganizationID != "" {
		req.Header.Set("OpenAI-Organization", config.OrganizationID)
	}

	client := &http.Client{
		Timeout: time.Duration(config.Timeout) * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response based on provider
	return s.parseResponse(config.Provider, body)
}

func (s *LLMConfigService) buildOpenAIRequest(config *model.LLMConfig, prompt string) ([]byte, error) {
	reqData := map[string]interface{}{
		"model": config.Model,
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"max_tokens":  config.MaxTokens,
		"temperature": config.Temperature,
	}

	return json.Marshal(reqData)
}

func (s *LLMConfigService) buildAnthropicRequest(config *model.LLMConfig, prompt string) ([]byte, error) {
	reqData := map[string]interface{}{
		"model": config.Model,
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"max_tokens": config.MaxTokens,
	}

	return json.Marshal(reqData)
}

func (s *LLMConfigService) buildOllamaRequest(config *model.LLMConfig, prompt string) ([]byte, error) {
	reqData := map[string]interface{}{
		"model":  config.Model,
		"prompt": prompt,
		"stream": false,
	}

	return json.Marshal(reqData)
}

func (s *LLMConfigService) parseResponse(provider string, body []byte) (string, error) {
	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	switch model.LLMProvider(provider) {
	case model.LLMProviderOllama:
		if response, ok := result["response"].(string); ok {
			return response, nil
		}
	default:
		// OpenAI-compatible format
		if choices, ok := result["choices"].([]interface{}); ok && len(choices) > 0 {
			if choice, ok := choices[0].(map[string]interface{}); ok {
				if message, ok := choice["message"].(map[string]interface{}); ok {
					if content, ok := message["content"].(string); ok {
						return content, nil
					}
				}
			}
		}
	}

	return "", errors.New("unable to parse response")
}

// Encryption helpers

func encryptAPIKey(apiKey string) (string, error) {
	block, err := aes.NewCipher(llmEncryptionKey)
	if err != nil {
		return "", err
	}

	plaintext := []byte(apiKey)
	ciphertext := make([]byte, aes.BlockSize+len(plaintext))
	iv := ciphertext[:aes.BlockSize]

	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)

	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func decryptAPIKey(encrypted string) (string, error) {
	ciphertext, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(llmEncryptionKey)
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

func maskAPIKey(apiKey string) string {
	if len(apiKey) <= 8 {
		return strings.Repeat("*", len(apiKey))
	}
	return apiKey[:4] + strings.Repeat("*", len(apiKey)-8) + apiKey[len(apiKey)-4:]
}
