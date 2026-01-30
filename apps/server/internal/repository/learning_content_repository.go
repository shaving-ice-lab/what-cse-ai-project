package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type LearningContentRepository struct {
	db *gorm.DB
}

func NewLearningContentRepository(db *gorm.DB) *LearningContentRepository {
	return &LearningContentRepository{db: db}
}

// Create creates a new learning content
func (r *LearningContentRepository) Create(content *model.LearningContent) error {
	return r.db.Create(content).Error
}

// Update updates a learning content
func (r *LearningContentRepository) Update(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.LearningContent{}).Where("id = ?", id).Updates(updates).Error
}

// Delete soft deletes a learning content
func (r *LearningContentRepository) Delete(id uint) error {
	return r.db.Delete(&model.LearningContent{}, id).Error
}

// GetByID gets learning content by ID
func (r *LearningContentRepository) GetByID(id uint) (*model.LearningContent, error) {
	var content model.LearningContent
	err := r.db.Where("id = ?", id).First(&content).Error
	if err != nil {
		return nil, err
	}
	return &content, nil
}

// GetByType gets learning contents by content type
func (r *LearningContentRepository) GetByType(contentType model.LearningContentType, params *model.LearningContentQueryParams) ([]model.LearningContent, int64, error) {
	var contents []model.LearningContent
	var total int64

	query := r.db.Model(&model.LearningContent{}).Where("content_type = ?", contentType)

	// Apply filters
	if params != nil {
		if params.Subject != "" {
			query = query.Where("subject = ?", params.Subject)
		}
		if params.Module != "" {
			query = query.Where("module = ?", params.Module)
		}
		if params.CategoryID != nil {
			query = query.Where("category_id = ?", *params.CategoryID)
		}
		if params.IsActive != nil {
			query = query.Where("is_active = ?", *params.IsActive)
		} else {
			// Default to active only
			query = query.Where("is_active = ?", true)
		}
	} else {
		query = query.Where("is_active = ?", true)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	page := 1
	pageSize := 50
	if params != nil {
		if params.Page > 0 {
			page = params.Page
		}
		if params.PageSize > 0 {
			pageSize = params.PageSize
		}
	}
	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	// Order by sort_order and created_at
	query = query.Order("sort_order ASC, created_at DESC")

	if err := query.Find(&contents).Error; err != nil {
		return nil, 0, err
	}

	return contents, total, nil
}

// GetAll gets all learning contents with filters
func (r *LearningContentRepository) GetAll(params *model.LearningContentQueryParams) ([]model.LearningContent, int64, error) {
	var contents []model.LearningContent
	var total int64

	query := r.db.Model(&model.LearningContent{})

	// Apply filters
	if params != nil {
		if params.ContentType != "" {
			query = query.Where("content_type = ?", params.ContentType)
		}
		if params.Subject != "" {
			query = query.Where("subject = ?", params.Subject)
		}
		if params.Module != "" {
			query = query.Where("module = ?", params.Module)
		}
		if params.CategoryID != nil {
			query = query.Where("category_id = ?", *params.CategoryID)
		}
		if params.IsActive != nil {
			query = query.Where("is_active = ?", *params.IsActive)
		}
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	page := 1
	pageSize := 50
	if params != nil {
		if params.Page > 0 {
			page = params.Page
		}
		if params.PageSize > 0 {
			pageSize = params.PageSize
		}
	}
	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	// Order by sort_order and created_at
	query = query.Order("sort_order ASC, created_at DESC")

	if err := query.Find(&contents).Error; err != nil {
		return nil, 0, err
	}

	return contents, total, nil
}

// GetBySubjectAndModule gets learning contents by subject and module
func (r *LearningContentRepository) GetBySubjectAndModule(subject, module string) ([]model.LearningContent, error) {
	var contents []model.LearningContent

	query := r.db.Model(&model.LearningContent{}).
		Where("is_active = ?", true).
		Order("sort_order ASC, created_at DESC")

	if subject != "" {
		query = query.Where("subject = ?", subject)
	}
	if module != "" {
		query = query.Where("module = ?", module)
	}

	if err := query.Find(&contents).Error; err != nil {
		return nil, err
	}

	return contents, nil
}

// IncrementViewCount increments the view count
func (r *LearningContentRepository) IncrementViewCount(id uint) error {
	return r.db.Model(&model.LearningContent{}).
		Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

// BatchCreate creates multiple learning contents
func (r *LearningContentRepository) BatchCreate(contents []model.LearningContent) error {
	return r.db.CreateInBatches(contents, 100).Error
}

// GetDistinctSubjects gets all distinct subjects
func (r *LearningContentRepository) GetDistinctSubjects() ([]string, error) {
	var subjects []string
	err := r.db.Model(&model.LearningContent{}).
		Where("is_active = ? AND subject != ''", true).
		Distinct("subject").
		Pluck("subject", &subjects).Error
	return subjects, err
}

// GetDistinctModules gets all distinct modules for a subject
func (r *LearningContentRepository) GetDistinctModules(subject string) ([]string, error) {
	var modules []string
	query := r.db.Model(&model.LearningContent{}).
		Where("is_active = ? AND module != ''", true)
	
	if subject != "" {
		query = query.Where("subject = ?", subject)
	}
	
	err := query.Distinct("module").Pluck("module", &modules).Error
	return modules, err
}

// GetContentTypes gets all content types for a subject/module
func (r *LearningContentRepository) GetContentTypes(subject, module string) ([]model.LearningContentType, error) {
	var types []model.LearningContentType
	
	query := r.db.Model(&model.LearningContent{}).
		Where("is_active = ?", true)
	
	if subject != "" {
		query = query.Where("subject = ?", subject)
	}
	if module != "" {
		query = query.Where("module = ?", module)
	}
	
	err := query.Distinct("content_type").Pluck("content_type", &types).Error
	return types, err
}
