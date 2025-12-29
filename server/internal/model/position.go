package model

import (
	"time"

	"gorm.io/gorm"
)

type Position struct {
	ID                    uint           `gorm:"primaryKey" json:"id"`
	PositionID            string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"position_id"`
	PositionName          string         `gorm:"type:varchar(100);not null;index" json:"position_name"`
	DepartmentCode        string         `gorm:"type:varchar(50);index" json:"department_code"`
	DepartmentName        string         `gorm:"type:varchar(200);index" json:"department_name"`
	DepartmentLevel       string         `gorm:"type:varchar(20)" json:"department_level"` // 中央, 省级, 市级, 县级, 乡镇
	WorkLocationProvince  string         `gorm:"type:varchar(50);index" json:"work_location_province"`
	WorkLocationCity      string         `gorm:"type:varchar(50);index" json:"work_location_city"`
	WorkLocationDistrict  string         `gorm:"type:varchar(50)" json:"work_location_district"`
	RecruitCount          int            `gorm:"default:1" json:"recruit_count"`
	ExamType              string         `gorm:"type:varchar(20);index" json:"exam_type"` // 国考, 省考, 事业单位, 选调生
	EducationMin          string         `gorm:"type:varchar(20)" json:"education_min"`
	EducationMax          string         `gorm:"type:varchar(20)" json:"education_max"`
	DegreeRequired        string         `gorm:"type:varchar(10);default:'不限'" json:"degree_required"` // 是, 否, 不限
	MajorCategory         JSONStringArray `gorm:"type:json" json:"major_category"`
	MajorSpecific         JSONStringArray `gorm:"type:json" json:"major_specific"`
	MajorUnlimited        bool           `gorm:"default:false" json:"major_unlimited"`
	PoliticalStatus       string         `gorm:"type:varchar(20);default:'不限'" json:"political_status"`
	WorkExpYearsMin       int            `gorm:"default:0" json:"work_exp_years_min"`
	AgeMin                int            `gorm:"default:18" json:"age_min"`
	AgeMax                int            `gorm:"default:35" json:"age_max"`
	GenderRequired        string         `gorm:"type:varchar(10);default:'不限'" json:"gender_required"` // 男, 女, 不限
	HukouRequired         bool           `gorm:"default:false" json:"hukou_required"`
	HukouProvinces        JSONStringArray `gorm:"type:json" json:"hukou_provinces"`
	RegistrationStart     *time.Time     `gorm:"type:datetime" json:"registration_start"`
	RegistrationEnd       *time.Time     `gorm:"type:datetime" json:"registration_end"`
	ExamDateWritten       *time.Time     `gorm:"type:date" json:"exam_date_written"`
	ApplicantCount        int            `gorm:"default:0" json:"applicant_count"`
	CompetitionRatio      float64        `gorm:"type:decimal(10,2);default:0" json:"competition_ratio"`
	ParseConfidence       int            `gorm:"default:100" json:"parse_confidence"` // 0-100
	Status                int            `gorm:"type:tinyint;default:0;index" json:"status"` // 0: pending, 1: published, 2: offline
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`

	Announcements []Announcement `gorm:"many2many:position_announcements;" json:"announcements,omitempty"`
}

func (Position) TableName() string {
	return "positions"
}

type PositionStatus int

const (
	PositionStatusPending   PositionStatus = 0
	PositionStatusPublished PositionStatus = 1
	PositionStatusOffline   PositionStatus = 2
)

type ExamType string

const (
	ExamTypeNational   ExamType = "国考"
	ExamTypeProvincial ExamType = "省考"
	ExamTypeInstitution ExamType = "事业单位"
	ExamTypeSelection  ExamType = "选调生"
)

type DepartmentLevel string

const (
	DepartmentLevelCentral   DepartmentLevel = "中央"
	DepartmentLevelProvince  DepartmentLevel = "省级"
	DepartmentLevelCity      DepartmentLevel = "市级"
	DepartmentLevelCounty    DepartmentLevel = "县级"
	DepartmentLevelTownship  DepartmentLevel = "乡镇"
)
