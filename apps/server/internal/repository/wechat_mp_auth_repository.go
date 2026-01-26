package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// WechatMPAuthRepository handles database operations for WeChat MP authentication
type WechatMPAuthRepository struct {
	db *gorm.DB
}

// NewWechatMPAuthRepository creates a new WechatMPAuthRepository
func NewWechatMPAuthRepository(db *gorm.DB) *WechatMPAuthRepository {
	return &WechatMPAuthRepository{db: db}
}

// Create creates a new auth record
func (r *WechatMPAuthRepository) Create(auth *model.WechatMPAuth) error {
	return r.db.Create(auth).Error
}

// GetLatest gets the latest auth record
func (r *WechatMPAuthRepository) GetLatest() (*model.WechatMPAuth, error) {
	var auth model.WechatMPAuth
	err := r.db.Order("created_at DESC").First(&auth).Error
	if err != nil {
		return nil, err
	}
	return &auth, nil
}

// GetActive gets the latest active auth record
func (r *WechatMPAuthRepository) GetActive() (*model.WechatMPAuth, error) {
	var auth model.WechatMPAuth
	err := r.db.Where("status = ?", model.WechatMPAuthStatusActive).
		Order("created_at DESC").First(&auth).Error
	if err != nil {
		return nil, err
	}
	return &auth, nil
}

// GetByID gets an auth record by ID
func (r *WechatMPAuthRepository) GetByID(id uint) (*model.WechatMPAuth, error) {
	var auth model.WechatMPAuth
	err := r.db.First(&auth, id).Error
	if err != nil {
		return nil, err
	}
	return &auth, nil
}

// Update updates an auth record
func (r *WechatMPAuthRepository) Update(auth *model.WechatMPAuth) error {
	return r.db.Save(auth).Error
}

// UpdateStatus updates the status of an auth record
func (r *WechatMPAuthRepository) UpdateStatus(id uint, status model.WechatMPAuthStatus) error {
	return r.db.Model(&model.WechatMPAuth{}).Where("id = ?", id).
		Update("status", status).Error
}

// UpdateStatusByToken updates the status of auth records by token
func (r *WechatMPAuthRepository) UpdateStatusByToken(token string, status model.WechatMPAuthStatus) error {
	return r.db.Model(&model.WechatMPAuth{}).Where("token = ?", token).
		Update("status", status).Error
}

// UpdateLastUsed updates the last_used_at timestamp
func (r *WechatMPAuthRepository) UpdateLastUsed(id uint) error {
	now := time.Now()
	return r.db.Model(&model.WechatMPAuth{}).Where("id = ?", id).
		Update("last_used_at", now).Error
}

// MarkAllExpired marks all auth records as expired
func (r *WechatMPAuthRepository) MarkAllExpired() error {
	return r.db.Model(&model.WechatMPAuth{}).
		Where("status IN ?", []model.WechatMPAuthStatus{
			model.WechatMPAuthStatusActive,
			model.WechatMPAuthStatusExpiring,
		}).
		Update("status", model.WechatMPAuthStatusExpired).Error
}

// Delete deletes an auth record
func (r *WechatMPAuthRepository) Delete(id uint) error {
	return r.db.Delete(&model.WechatMPAuth{}, id).Error
}

// DeleteAll deletes all auth records
func (r *WechatMPAuthRepository) DeleteAll() error {
	return r.db.Where("1 = 1").Delete(&model.WechatMPAuth{}).Error
}

// Count returns the total count of auth records
func (r *WechatMPAuthRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&model.WechatMPAuth{}).Count(&count).Error
	return count, err
}

// HasActiveAuth checks if there's an active auth
func (r *WechatMPAuthRepository) HasActiveAuth() (bool, error) {
	var count int64
	err := r.db.Model(&model.WechatMPAuth{}).
		Where("status = ?", model.WechatMPAuthStatusActive).
		Count(&count).Error
	return count > 0, err
}
