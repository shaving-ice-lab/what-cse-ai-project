package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type UserProfileRepository struct {
	db *gorm.DB
}

func NewUserProfileRepository(db *gorm.DB) *UserProfileRepository {
	return &UserProfileRepository{db: db}
}

func (r *UserProfileRepository) Create(profile *model.UserProfile) error {
	return r.db.Create(profile).Error
}

func (r *UserProfileRepository) FindByUserID(userID uint) (*model.UserProfile, error) {
	var profile model.UserProfile
	err := r.db.Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *UserProfileRepository) Update(profile *model.UserProfile) error {
	return r.db.Save(profile).Error
}

func (r *UserProfileRepository) Upsert(profile *model.UserProfile) error {
	existing, err := r.FindByUserID(profile.UserID)
	if err != nil {
		// Create new profile
		return r.Create(profile)
	}
	// Update existing profile
	profile.ID = existing.ID
	return r.Update(profile)
}

type UserPreferenceRepository struct {
	db *gorm.DB
}

func NewUserPreferenceRepository(db *gorm.DB) *UserPreferenceRepository {
	return &UserPreferenceRepository{db: db}
}

func (r *UserPreferenceRepository) Create(pref *model.UserPreference) error {
	return r.db.Create(pref).Error
}

func (r *UserPreferenceRepository) FindByUserID(userID uint) (*model.UserPreference, error) {
	var pref model.UserPreference
	err := r.db.Where("user_id = ?", userID).First(&pref).Error
	if err != nil {
		return nil, err
	}
	return &pref, nil
}

func (r *UserPreferenceRepository) Update(pref *model.UserPreference) error {
	return r.db.Save(pref).Error
}

func (r *UserPreferenceRepository) Upsert(pref *model.UserPreference) error {
	existing, err := r.FindByUserID(pref.UserID)
	if err != nil {
		return r.Create(pref)
	}
	pref.ID = existing.ID
	return r.Update(pref)
}

type UserCertificateRepository struct {
	db *gorm.DB
}

func NewUserCertificateRepository(db *gorm.DB) *UserCertificateRepository {
	return &UserCertificateRepository{db: db}
}

func (r *UserCertificateRepository) Create(cert *model.UserCertificate) error {
	return r.db.Create(cert).Error
}

func (r *UserCertificateRepository) FindByID(id uint) (*model.UserCertificate, error) {
	var cert model.UserCertificate
	err := r.db.First(&cert, id).Error
	if err != nil {
		return nil, err
	}
	return &cert, nil
}

func (r *UserCertificateRepository) FindByUserID(userID uint) ([]model.UserCertificate, error) {
	var certs []model.UserCertificate
	err := r.db.Where("user_id = ?", userID).Find(&certs).Error
	if err != nil {
		return nil, err
	}
	return certs, nil
}

func (r *UserCertificateRepository) Update(cert *model.UserCertificate) error {
	return r.db.Save(cert).Error
}

func (r *UserCertificateRepository) Delete(id uint) error {
	return r.db.Delete(&model.UserCertificate{}, id).Error
}
