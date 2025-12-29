package model

import (
	"time"

	"gorm.io/gorm"
)

type UserProfile struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	UserID            uint           `gorm:"uniqueIndex;not null" json:"user_id"`
	Gender            string         `gorm:"type:varchar(10)" json:"gender"` // male, female, other
	BirthDate         *time.Time     `gorm:"type:date" json:"birth_date"`
	HukouProvince     string         `gorm:"type:varchar(50)" json:"hukou_province"`
	HukouCity         string         `gorm:"type:varchar(50)" json:"hukou_city"`
	PoliticalStatus   string         `gorm:"type:varchar(20)" json:"political_status"` // 党员, 预备党员, 团员, 群众
	Education         string         `gorm:"type:varchar(20)" json:"education"`        // 大专, 本科, 硕士, 博士
	Major             string         `gorm:"type:varchar(100)" json:"major"`
	School            string         `gorm:"type:varchar(100)" json:"school"`
	GraduationDate    *time.Time     `gorm:"type:date" json:"graduation_date"`
	IsFreshGraduate   bool           `gorm:"default:false" json:"is_fresh_graduate"`
	WorkYears         int            `gorm:"default:0" json:"work_years"`
	GrassrootsExpYears int           `gorm:"default:0" json:"grassroots_exp_years"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

func (UserProfile) TableName() string {
	return "user_profiles"
}

type PoliticalStatus string

const (
	PoliticalStatusPartyMember    PoliticalStatus = "党员"
	PoliticalStatusProbationary   PoliticalStatus = "预备党员"
	PoliticalStatusLeagueMember   PoliticalStatus = "团员"
	PoliticalStatusMass           PoliticalStatus = "群众"
)

type Education string

const (
	EducationCollege  Education = "大专"
	EducationBachelor Education = "本科"
	EducationMaster   Education = "硕士"
	EducationDoctor   Education = "博士"
)
