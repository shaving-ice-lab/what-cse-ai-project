package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type AdminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) Create(admin *model.Admin) error {
	return r.db.Create(admin).Error
}

func (r *AdminRepository) FindByID(id uint) (*model.Admin, error) {
	var admin model.Admin
	err := r.db.First(&admin, id).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *AdminRepository) FindByUsername(username string) (*model.Admin, error) {
	var admin model.Admin
	err := r.db.Where("username = ?", username).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *AdminRepository) Update(admin *model.Admin) error {
	return r.db.Save(admin).Error
}

func (r *AdminRepository) UpdateStatus(id uint, status int) error {
	return r.db.Model(&model.Admin{}).Where("id = ?", id).Update("status", status).Error
}

func (r *AdminRepository) List(page, pageSize int) ([]model.Admin, int64, error) {
	var admins []model.Admin
	var total int64

	r.db.Model(&model.Admin{}).Count(&total)

	offset := (page - 1) * pageSize
	err := r.db.Offset(offset).Limit(pageSize).Find(&admins).Error
	if err != nil {
		return nil, 0, err
	}

	return admins, total, nil
}

func (r *AdminRepository) Delete(id uint) error {
	return r.db.Delete(&model.Admin{}, id).Error
}
