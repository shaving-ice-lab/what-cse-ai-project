package repository

import (
	"strings"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type MajorRepository struct {
	db *gorm.DB
}

func NewMajorRepository(db *gorm.DB) *MajorRepository {
	return &MajorRepository{db: db}
}

// GetCategories 获取所有专业大类
func (r *MajorRepository) GetCategories() ([]model.MajorCategory, error) {
	var categories []model.MajorCategory
	err := r.db.Order("sort_order ASC, code ASC").Find(&categories).Error
	return categories, err
}

// GetCategoryByCode 根据代码获取专业大类
func (r *MajorRepository) GetCategoryByCode(code string) (*model.MajorCategory, error) {
	var category model.MajorCategory
	err := r.db.Where("code = ?", code).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetMajors 获取专业列表（支持筛选）
func (r *MajorRepository) GetMajors(categoryCode string, educationLevel string, page, pageSize int) ([]model.Major, int64, error) {
	var majors []model.Major
	var total int64

	query := r.db.Model(&model.Major{})

	if categoryCode != "" {
		query = query.Where("category_code = ?", categoryCode)
	}
	if educationLevel != "" {
		query = query.Where("education_level = ?", educationLevel)
	}

	// Count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Pagination
	offset := (page - 1) * pageSize
	err := query.Order("sort_order ASC, code ASC").
		Offset(offset).Limit(pageSize).
		Find(&majors).Error

	return majors, total, err
}

// GetMajorByCode 根据代码获取专业
func (r *MajorRepository) GetMajorByCode(code string) (*model.Major, error) {
	var major model.Major
	err := r.db.Where("code = ?", code).First(&major).Error
	if err != nil {
		return nil, err
	}
	return &major, nil
}

// SearchMajors 搜索专业
func (r *MajorRepository) SearchMajors(keyword string, limit int) ([]model.Major, error) {
	var majors []model.Major

	if limit <= 0 {
		limit = 20
	}

	// Search by name, code, or synonyms
	keyword = "%" + strings.TrimSpace(keyword) + "%"
	err := r.db.Where("name LIKE ? OR code LIKE ?", keyword, keyword).
		Order("sort_order ASC").
		Limit(limit).
		Find(&majors).Error

	return majors, err
}

// GetMajorsByCategoryCode 根据大类代码获取专业列表
func (r *MajorRepository) GetMajorsByCategoryCode(categoryCode string) ([]model.Major, error) {
	var majors []model.Major
	err := r.db.Where("category_code = ?", categoryCode).
		Order("sort_order ASC, code ASC").
		Find(&majors).Error
	return majors, err
}

// GetCascadeData 获取级联数据
func (r *MajorRepository) GetCascadeData() ([]model.MajorCascadeResponse, error) {
	// 获取所有大类
	categories, err := r.GetCategories()
	if err != nil {
		return nil, err
	}

	// 构建级联结构
	result := make([]model.MajorCascadeResponse, 0, len(categories))
	for _, cat := range categories {
		majors, err := r.GetMajorsByCategoryCode(cat.Code)
		if err != nil {
			continue
		}

		children := make([]*model.MajorCascadeResponse, 0, len(majors))
		for _, major := range majors {
			children = append(children, &model.MajorCascadeResponse{
				Code: major.Code,
				Name: major.Name,
			})
		}

		result = append(result, model.MajorCascadeResponse{
			Code:     cat.Code,
			Name:     cat.Name,
			Children: children,
		})
	}

	return result, nil
}

// CreateCategory 创建专业大类
func (r *MajorRepository) CreateCategory(category *model.MajorCategory) error {
	return r.db.Create(category).Error
}

// CreateMajor 创建专业
func (r *MajorRepository) CreateMajor(major *model.Major) error {
	return r.db.Create(major).Error
}

// BatchCreateCategories 批量创建专业大类
func (r *MajorRepository) BatchCreateCategories(categories []model.MajorCategory) error {
	if len(categories) == 0 {
		return nil
	}
	return r.db.CreateInBatches(categories, 100).Error
}

// BatchCreateMajors 批量创建专业
func (r *MajorRepository) BatchCreateMajors(majors []model.Major) error {
	if len(majors) == 0 {
		return nil
	}
	return r.db.CreateInBatches(majors, 100).Error
}

// DeleteAllMajors 删除所有专业数据（用于重新导入）
func (r *MajorRepository) DeleteAllMajors() error {
	return r.db.Exec("DELETE FROM what_majors").Error
}

// DeleteAllCategories 删除所有专业大类（用于重新导入）
func (r *MajorRepository) DeleteAllCategories() error {
	return r.db.Exec("DELETE FROM what_major_categories").Error
}
