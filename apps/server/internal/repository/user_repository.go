package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByPhone(phone string) (*model.User, error) {
	var user model.User
	err := r.db.Where("phone = ?", phone).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Update(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) UpdateStatus(id uint, status int) error {
	return r.db.Model(&model.User{}).Where("id = ?", id).Update("status", status).Error
}

func (r *UserRepository) Delete(id uint) error {
	return r.db.Delete(&model.User{}, id).Error
}

func (r *UserRepository) FindWithProfile(id uint) (*model.User, error) {
	var user model.User
	err := r.db.Preload("Profile").Preload("Certificates").Preload("Preferences").First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) List(page, pageSize int) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	r.db.Model(&model.User{}).Count(&total)

	offset := (page - 1) * pageSize
	err := r.db.Offset(offset).Limit(pageSize).Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *UserRepository) Search(keyword string, page, pageSize int) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	query := r.db.Model(&model.User{}).Where("phone LIKE ? OR email LIKE ? OR nickname LIKE ?",
		"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *UserRepository) GetStatsByStatus() (map[string]int64, error) {
	var results []struct {
		Status int
		Count  int64
	}

	err := r.db.Model(&model.User{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	statusNames := map[int]string{
		0: "disabled",
		1: "active",
	}
	for _, r := range results {
		name := statusNames[r.Status]
		if name == "" {
			name = "unknown"
		}
		stats[name] = r.Count
	}
	return stats, nil
}

type UserTimeStats struct {
	Today     int64
	ThisWeek  int64
	ThisMonth int64
}

func (r *UserRepository) GetUserTimeStats() (*UserTimeStats, error) {
	stats := &UserTimeStats{}

	// Today
	r.db.Model(&model.User{}).
		Where("DATE(created_at) = CURDATE()").
		Count(&stats.Today)

	// This week
	r.db.Model(&model.User{}).
		Where("YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)").
		Count(&stats.ThisWeek)

	// This month
	r.db.Model(&model.User{}).
		Where("YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())").
		Count(&stats.ThisMonth)

	return stats, nil
}
