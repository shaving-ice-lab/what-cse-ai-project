package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type LLMConfigRepository struct {
	db *gorm.DB
}

func NewLLMConfigRepository(db *gorm.DB) *LLMConfigRepository {
	return &LLMConfigRepository{db: db}
}

// Create creates a new LLM config
func (r *LLMConfigRepository) Create(config *model.LLMConfig) error {
	return r.db.Create(config).Error
}

// GetByID retrieves an LLM config by ID
func (r *LLMConfigRepository) GetByID(id uint) (*model.LLMConfig, error) {
	var config model.LLMConfig
	err := r.db.First(&config, id).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// GetByName retrieves an LLM config by name
func (r *LLMConfigRepository) GetByName(name string) (*model.LLMConfig, error) {
	var config model.LLMConfig
	err := r.db.Where("name = ?", name).First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// GetDefault retrieves the default LLM config
func (r *LLMConfigRepository) GetDefault() (*model.LLMConfig, error) {
	var config model.LLMConfig
	err := r.db.Where("is_default = ? AND is_enabled = ?", true, true).First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// List retrieves all LLM configs with optional filters
func (r *LLMConfigRepository) List(provider string, isEnabled *bool) ([]model.LLMConfig, error) {
	var configs []model.LLMConfig
	query := r.db.Model(&model.LLMConfig{})

	if provider != "" {
		query = query.Where("provider = ?", provider)
	}
	if isEnabled != nil {
		query = query.Where("is_enabled = ?", *isEnabled)
	}

	err := query.Order("is_default DESC, created_at DESC").Find(&configs).Error
	return configs, err
}

// ListEnabled retrieves all enabled LLM configs
func (r *LLMConfigRepository) ListEnabled() ([]model.LLMConfig, error) {
	enabled := true
	return r.List("", &enabled)
}

// Update updates an LLM config
func (r *LLMConfigRepository) Update(config *model.LLMConfig) error {
	return r.db.Save(config).Error
}

// Delete soft deletes an LLM config
func (r *LLMConfigRepository) Delete(id uint) error {
	return r.db.Delete(&model.LLMConfig{}, id).Error
}

// ClearDefault clears the default flag from all configs
func (r *LLMConfigRepository) ClearDefault() error {
	return r.db.Model(&model.LLMConfig{}).Where("is_default = ?", true).Update("is_default", false).Error
}

// SetDefault sets a config as the default
func (r *LLMConfigRepository) SetDefault(id uint) error {
	// First clear all defaults
	if err := r.ClearDefault(); err != nil {
		return err
	}
	// Then set the new default
	return r.db.Model(&model.LLMConfig{}).Where("id = ?", id).Update("is_default", true).Error
}

// UpdateTestResult updates the test result for a config
func (r *LLMConfigRepository) UpdateTestResult(id uint, status int, message string) error {
	return r.db.Model(&model.LLMConfig{}).Where("id = ?", id).Updates(map[string]interface{}{
		"last_test_at":      gorm.Expr("NOW()"),
		"last_test_status":  status,
		"last_test_message": message,
	}).Error
}

// GetSelectOptions retrieves simplified options for select dropdowns
func (r *LLMConfigRepository) GetSelectOptions() ([]model.LLMSelectOption, error) {
	var options []model.LLMSelectOption
	err := r.db.Model(&model.LLMConfig{}).
		Select("id, name, provider, model").
		Where("is_enabled = ?", true).
		Order("is_default DESC, name ASC").
		Find(&options).Error
	return options, err
}

// ExistsByName checks if a config with the given name exists
func (r *LLMConfigRepository) ExistsByName(name string, excludeID uint) (bool, error) {
	var count int64
	query := r.db.Model(&model.LLMConfig{}).Where("name = ?", name)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	err := query.Count(&count).Error
	return count > 0, err
}
