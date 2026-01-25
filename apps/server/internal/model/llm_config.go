package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// LLMProvider represents supported LLM providers
type LLMProvider string

const (
	LLMProviderOpenAI    LLMProvider = "openai"
	LLMProviderAzure     LLMProvider = "azure"
	LLMProviderAnthropic LLMProvider = "anthropic"
	LLMProviderDeepSeek  LLMProvider = "deepseek"
	LLMProviderOllama    LLMProvider = "ollama"
	LLMProviderCustom    LLMProvider = "custom"
)

// ExtraParams represents additional configuration parameters
type ExtraParams map[string]interface{}

func (p ExtraParams) Value() (driver.Value, error) {
	if p == nil {
		return nil, nil
	}
	return json.Marshal(p)
}

func (p *ExtraParams) Scan(value interface{}) error {
	if value == nil {
		*p = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, p)
}

// LLMConfig represents an LLM service provider configuration
type LLMConfig struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	Name            string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
	Provider        string         `gorm:"type:varchar(50);not null;index" json:"provider"`
	Model           string         `gorm:"type:varchar(100);not null" json:"model"`
	APIURL          string         `gorm:"column:api_url;type:varchar(500);not null" json:"api_url"`
	APIKeyEncrypted string         `gorm:"column:api_key_encrypted;type:text;not null" json:"-"`
	OrganizationID  string         `gorm:"column:organization_id;type:varchar(100)" json:"organization_id,omitempty"`
	MaxTokens       int            `gorm:"type:int;default:4096" json:"max_tokens"`
	Temperature     float64        `gorm:"type:decimal(3,2);default:0.70" json:"temperature"`
	Timeout         int            `gorm:"type:int;default:60" json:"timeout"`
	IsDefault       bool           `gorm:"type:tinyint(1);default:0;index" json:"is_default"`
	IsEnabled       bool           `gorm:"type:tinyint(1);default:1;index" json:"is_enabled"`
	ExtraParams     ExtraParams    `gorm:"type:json" json:"extra_params,omitempty"`
	Description     string         `gorm:"type:text" json:"description,omitempty"`
	LastTestAt      *time.Time     `gorm:"type:datetime" json:"last_test_at,omitempty"`
	LastTestStatus  *int           `gorm:"type:tinyint" json:"last_test_status,omitempty"`
	LastTestMessage string         `gorm:"type:text" json:"last_test_message,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (LLMConfig) TableName() string {
	return "what_llm_configs"
}

// LLMConfigResponse is the response structure without sensitive data
type LLMConfigResponse struct {
	ID              uint        `json:"id"`
	Name            string      `json:"name"`
	Provider        string      `json:"provider"`
	Model           string      `json:"model"`
	APIURL          string      `json:"api_url"`
	APIKeyMasked    string      `json:"api_key_masked"` // Masked API key for display
	OrganizationID  string      `json:"organization_id,omitempty"`
	MaxTokens       int         `json:"max_tokens"`
	Temperature     float64     `json:"temperature"`
	Timeout         int         `json:"timeout"`
	IsDefault       bool        `json:"is_default"`
	IsEnabled       bool        `json:"is_enabled"`
	ExtraParams     ExtraParams `json:"extra_params,omitempty"`
	Description     string      `json:"description,omitempty"`
	LastTestAt      *time.Time  `json:"last_test_at,omitempty"`
	LastTestStatus  *int        `json:"last_test_status,omitempty"`
	LastTestMessage string      `json:"last_test_message,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}

// ToResponse converts LLMConfig to LLMConfigResponse with masked API key
func (c *LLMConfig) ToResponse(maskedKey string) LLMConfigResponse {
	return LLMConfigResponse{
		ID:              c.ID,
		Name:            c.Name,
		Provider:        c.Provider,
		Model:           c.Model,
		APIURL:          c.APIURL,
		APIKeyMasked:    maskedKey,
		OrganizationID:  c.OrganizationID,
		MaxTokens:       c.MaxTokens,
		Temperature:     c.Temperature,
		Timeout:         c.Timeout,
		IsDefault:       c.IsDefault,
		IsEnabled:       c.IsEnabled,
		ExtraParams:     c.ExtraParams,
		Description:     c.Description,
		LastTestAt:      c.LastTestAt,
		LastTestStatus:  c.LastTestStatus,
		LastTestMessage: c.LastTestMessage,
		CreatedAt:       c.CreatedAt,
		UpdatedAt:       c.UpdatedAt,
	}
}

// CreateLLMConfigRequest represents the request to create an LLM config
type CreateLLMConfigRequest struct {
	Name           string      `json:"name" binding:"required"`
	Provider       string      `json:"provider" binding:"required"`
	Model          string      `json:"model" binding:"required"`
	APIURL         string      `json:"api_url" binding:"required"`
	APIKey         string      `json:"api_key" binding:"required"`
	OrganizationID string      `json:"organization_id"`
	MaxTokens      int         `json:"max_tokens"`
	Temperature    float64     `json:"temperature"`
	Timeout        int         `json:"timeout"`
	IsDefault      bool        `json:"is_default"`
	IsEnabled      bool        `json:"is_enabled"`
	ExtraParams    ExtraParams `json:"extra_params"`
	Description    string      `json:"description"`
}

// UpdateLLMConfigRequest represents the request to update an LLM config
type UpdateLLMConfigRequest struct {
	Name           string      `json:"name"`
	Provider       string      `json:"provider"`
	Model          string      `json:"model"`
	APIURL         string      `json:"api_url"`
	APIKey         string      `json:"api_key"` // Optional, only update if provided
	OrganizationID string      `json:"organization_id"`
	MaxTokens      *int        `json:"max_tokens"`
	Temperature    *float64    `json:"temperature"`
	Timeout        *int        `json:"timeout"`
	IsDefault      *bool       `json:"is_default"`
	IsEnabled      *bool       `json:"is_enabled"`
	ExtraParams    ExtraParams `json:"extra_params"`
	Description    string      `json:"description"`
}

// TestLLMConfigRequest represents the request to test an LLM config
type TestLLMConfigRequest struct {
	Prompt string `json:"prompt"`
}

// LLMSelectOption represents a simplified option for select dropdowns
type LLMSelectOption struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	Provider string `json:"provider"`
	Model    string `json:"model"`
}
