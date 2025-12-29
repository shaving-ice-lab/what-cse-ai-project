package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type PositionRepository struct {
	db *gorm.DB
}

func NewPositionRepository(db *gorm.DB) *PositionRepository {
	return &PositionRepository{db: db}
}

type PositionFilter struct {
	ExamType        string `query:"exam_type"`
	Province        string `query:"province"`
	City            string `query:"city"`
	EducationMin    string `query:"education_min"`
	MajorUnlimited  *bool  `query:"major_unlimited"`
	PoliticalStatus string `query:"political_status"`
	DepartmentLevel string `query:"department_level"`
	GenderRequired  string `query:"gender_required"`
	RecruitCountMin int    `query:"recruit_count_min"`
	AgeMax          int    `query:"age_max"`
	Keyword         string `query:"keyword"`
	Status          *int   `query:"status"`
}

type PositionSort struct {
	Field string `query:"sort_field"` // created_at, recruit_count, competition_ratio
	Order string `query:"sort_order"` // asc, desc
}

func (r *PositionRepository) Create(position *model.Position) error {
	return r.db.Create(position).Error
}

func (r *PositionRepository) FindByID(id uint) (*model.Position, error) {
	var position model.Position
	err := r.db.First(&position, id).Error
	if err != nil {
		return nil, err
	}
	return &position, nil
}

func (r *PositionRepository) FindByPositionID(positionID string) (*model.Position, error) {
	var position model.Position
	err := r.db.Where("position_id = ?", positionID).First(&position).Error
	if err != nil {
		return nil, err
	}
	return &position, nil
}

func (r *PositionRepository) Update(position *model.Position) error {
	return r.db.Save(position).Error
}

func (r *PositionRepository) Delete(id uint) error {
	return r.db.Delete(&model.Position{}, id).Error
}

func (r *PositionRepository) List(filter *PositionFilter, sort *PositionSort, page, pageSize int) ([]model.Position, int64, error) {
	var positions []model.Position
	var total int64

	query := r.db.Model(&model.Position{})

	// Apply filters
	if filter != nil {
		if filter.ExamType != "" {
			query = query.Where("exam_type = ?", filter.ExamType)
		}
		if filter.Province != "" {
			query = query.Where("work_location_province = ?", filter.Province)
		}
		if filter.City != "" {
			query = query.Where("work_location_city = ?", filter.City)
		}
		if filter.EducationMin != "" {
			query = query.Where("education_min = ?", filter.EducationMin)
		}
		if filter.MajorUnlimited != nil {
			query = query.Where("major_unlimited = ?", *filter.MajorUnlimited)
		}
		if filter.PoliticalStatus != "" {
			query = query.Where("political_status = ?", filter.PoliticalStatus)
		}
		if filter.DepartmentLevel != "" {
			query = query.Where("department_level = ?", filter.DepartmentLevel)
		}
		if filter.GenderRequired != "" {
			query = query.Where("gender_required = ?", filter.GenderRequired)
		}
		if filter.RecruitCountMin > 0 {
			query = query.Where("recruit_count >= ?", filter.RecruitCountMin)
		}
		if filter.AgeMax > 0 {
			query = query.Where("age_max >= ?", filter.AgeMax)
		}
		if filter.Keyword != "" {
			keyword := "%" + filter.Keyword + "%"
			query = query.Where("position_name LIKE ? OR department_name LIKE ?", keyword, keyword)
		}
		if filter.Status != nil {
			query = query.Where("status = ?", *filter.Status)
		} else {
			query = query.Where("status = ?", model.PositionStatusPublished)
		}
	}

	// Count total
	query.Count(&total)

	// Apply sorting
	if sort != nil && sort.Field != "" {
		order := "DESC"
		if sort.Order == "asc" {
			order = "ASC"
		}
		query = query.Order(sort.Field + " " + order)
	} else {
		query = query.Order("created_at DESC")
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Find(&positions).Error
	if err != nil {
		return nil, 0, err
	}

	return positions, total, nil
}

func (r *PositionRepository) FindWithAnnouncements(id uint) (*model.Position, error) {
	var position model.Position
	err := r.db.Preload("Announcements").First(&position, id).Error
	if err != nil {
		return nil, err
	}
	return &position, nil
}

func (r *PositionRepository) UpdateStatus(id uint, status int) error {
	return r.db.Model(&model.Position{}).Where("id = ?", id).Update("status", status).Error
}

func (r *PositionRepository) BatchCreate(positions []model.Position) error {
	return r.db.CreateInBatches(positions, 100).Error
}

func (r *PositionRepository) GetStatsByExamType() (map[string]int64, error) {
	var results []struct {
		ExamType string
		Count    int64
	}

	err := r.db.Model(&model.Position{}).
		Select("exam_type, COUNT(*) as count").
		Where("status = ?", model.PositionStatusPublished).
		Group("exam_type").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	for _, r := range results {
		stats[r.ExamType] = r.Count
	}
	return stats, nil
}

func (r *PositionRepository) GetStatsByProvince() (map[string]int64, error) {
	var results []struct {
		Province string
		Count    int64
	}

	err := r.db.Model(&model.Position{}).
		Select("work_location_province as province, COUNT(*) as count").
		Where("status = ?", model.PositionStatusPublished).
		Group("work_location_province").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	for _, r := range results {
		stats[r.Province] = r.Count
	}
	return stats, nil
}

func (r *PositionRepository) GetStatsByStatus() (map[string]int64, error) {
	var results []struct {
		Status int
		Count  int64
	}

	err := r.db.Model(&model.Position{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	statusNames := map[int]string{
		0: "pending",
		1: "published",
		2: "offline",
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

type RecruitStats struct {
	TotalRecruitCount   int64
	AvgCompetitionRatio float64
}

func (r *PositionRepository) GetRecruitStats() (*RecruitStats, error) {
	var stats RecruitStats

	err := r.db.Model(&model.Position{}).
		Select("COALESCE(SUM(recruit_count), 0) as total_recruit_count, COALESCE(AVG(competition_ratio), 0) as avg_competition_ratio").
		Where("status = ?", model.PositionStatusPublished).
		Scan(&stats).Error

	if err != nil {
		return nil, err
	}

	return &stats, nil
}
