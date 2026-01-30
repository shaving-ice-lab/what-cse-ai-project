package service

import (
	"errors"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrLearningContentNotFound      = errors.New("learning content not found")
	ErrInvalidLearningContentType   = errors.New("invalid content type")
)

type LearningContentService struct {
	repo *repository.LearningContentRepository
}

func NewLearningContentService(repo *repository.LearningContentRepository) *LearningContentService {
	return &LearningContentService{repo: repo}
}

// GetByType gets learning contents by content type
func (s *LearningContentService) GetByType(contentType string, params *model.LearningContentQueryParams) ([]*model.LearningContentResponse, int64, error) {
	// Validate content type
	ct := model.LearningContentType(contentType)
	if _, ok := model.ContentTypeNames[ct]; !ok {
		return nil, 0, ErrInvalidLearningContentType
	}

	contents, total, err := s.repo.GetByType(ct, params)
	if err != nil {
		return nil, 0, err
	}

	// Convert to response
	responses := make([]*model.LearningContentResponse, len(contents))
	for i, content := range contents {
		responses[i] = content.ToResponse()
	}

	return responses, total, nil
}

// GetByID gets learning content by ID
func (s *LearningContentService) GetByID(id uint) (*model.LearningContentResponse, error) {
	content, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrLearningContentNotFound
		}
		return nil, err
	}

	// Increment view count
	_ = s.repo.IncrementViewCount(id)

	return content.ToResponse(), nil
}

// GetAll gets all learning contents with filters
func (s *LearningContentService) GetAll(params *model.LearningContentQueryParams) ([]*model.LearningContentResponse, int64, error) {
	contents, total, err := s.repo.GetAll(params)
	if err != nil {
		return nil, 0, err
	}

	// Convert to response
	responses := make([]*model.LearningContentResponse, len(contents))
	for i, content := range contents {
		responses[i] = content.ToResponse()
	}

	return responses, total, nil
}

// GetBySubjectAndModule gets learning contents by subject and module
func (s *LearningContentService) GetBySubjectAndModule(subject, module string) ([]*model.LearningContentResponse, error) {
	contents, err := s.repo.GetBySubjectAndModule(subject, module)
	if err != nil {
		return nil, err
	}

	// Convert to response
	responses := make([]*model.LearningContentResponse, len(contents))
	for i, content := range contents {
		responses[i] = content.ToResponse()
	}

	return responses, nil
}

// Create creates a new learning content
func (s *LearningContentService) Create(content *model.LearningContent) error {
	// Validate content type
	if _, ok := model.ContentTypeNames[content.ContentType]; !ok {
		return ErrInvalidLearningContentType
	}
	return s.repo.Create(content)
}

// Update updates a learning content
func (s *LearningContentService) Update(id uint, updates map[string]interface{}) error {
	// Check if exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrLearningContentNotFound
		}
		return err
	}

	// Validate content type if being updated
	if ct, ok := updates["content_type"]; ok {
		contentType := model.LearningContentType(ct.(string))
		if _, ok := model.ContentTypeNames[contentType]; !ok {
			return ErrInvalidLearningContentType
		}
	}

	return s.repo.Update(id, updates)
}

// Delete deletes a learning content
func (s *LearningContentService) Delete(id uint) error {
	// Check if exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrLearningContentNotFound
		}
		return err
	}
	return s.repo.Delete(id)
}

// BatchCreate creates multiple learning contents
func (s *LearningContentService) BatchCreate(contents []model.LearningContent) error {
	// Validate content types
	for _, content := range contents {
		if _, ok := model.ContentTypeNames[content.ContentType]; !ok {
			return ErrInvalidLearningContentType
		}
	}
	return s.repo.BatchCreate(contents)
}

// GetAvailableFilters gets available filter options
func (s *LearningContentService) GetAvailableFilters() (map[string]interface{}, error) {
	subjects, err := s.repo.GetDistinctSubjects()
	if err != nil {
		return nil, err
	}

	// Build filter options with names
	subjectOptions := make([]map[string]string, len(subjects))
	for i, subject := range subjects {
		name := subject
		if n, ok := model.SubjectNames[subject]; ok {
			name = n
		}
		subjectOptions[i] = map[string]string{
			"value": subject,
			"label": name,
		}
	}

	// Get all content types
	contentTypes := make([]map[string]string, 0)
	for ct, name := range model.ContentTypeNames {
		contentTypes = append(contentTypes, map[string]string{
			"value": string(ct),
			"label": name,
		})
	}

	return map[string]interface{}{
		"subjects":      subjectOptions,
		"content_types": contentTypes,
	}, nil
}

// GetModulesForSubject gets available modules for a subject
func (s *LearningContentService) GetModulesForSubject(subject string) ([]map[string]string, error) {
	modules, err := s.repo.GetDistinctModules(subject)
	if err != nil {
		return nil, err
	}

	moduleOptions := make([]map[string]string, len(modules))
	for i, module := range modules {
		name := module
		if n, ok := model.ModuleNames[module]; ok {
			name = n
		}
		moduleOptions[i] = map[string]string{
			"value": module,
			"label": name,
		}
	}

	return moduleOptions, nil
}

// GetContentTypesForContext gets available content types for a subject/module
func (s *LearningContentService) GetContentTypesForContext(subject, module string) ([]map[string]string, error) {
	types, err := s.repo.GetContentTypes(subject, module)
	if err != nil {
		return nil, err
	}

	typeOptions := make([]map[string]string, len(types))
	for i, ct := range types {
		name := string(ct)
		if n, ok := model.ContentTypeNames[ct]; ok {
			name = n
		}
		typeOptions[i] = map[string]string{
			"value": string(ct),
			"label": name,
		}
	}

	return typeOptions, nil
}
