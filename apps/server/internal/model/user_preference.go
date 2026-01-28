package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

type UserPreference struct {
	ID                   uint            `gorm:"primaryKey" json:"id"`
	UserID               uint            `gorm:"uniqueIndex;not null" json:"user_id"`
	PreferredProvinces   JSONStringArray `gorm:"type:json" json:"preferred_provinces"`
	PreferredCities      JSONStringArray `gorm:"type:json" json:"preferred_cities"`
	PreferredDepartments JSONStringArray `gorm:"type:json" json:"preferred_departments"`
	ExamTypes            JSONStringArray `gorm:"type:json" json:"exam_types"`                            // 国考, 省考, 事业单位, 选调生
	PreferredDeptLevels  JSONStringArray `gorm:"type:json" json:"preferred_dept_levels"`                 // 意向单位层级
	SalaryExpectationMin *int            `gorm:"type:int" json:"salary_expectation_min"`                 // 期望最低薪资
	SalaryExpectationMax *int            `gorm:"type:int" json:"salary_expectation_max"`                 // 期望最高薪资
	AcceptUnlimitedMajor bool            `gorm:"default:true" json:"accept_unlimited_major"`             // 是否接受不限专业职位
	AcceptFreshGradOnly  bool            `gorm:"default:false" json:"accept_fresh_grad_only"`            // 是否仅看应届生职位
	MatchStrategy        string          `gorm:"type:varchar(20);default:'smart'" json:"match_strategy"` // strict, loose, smart
	CreatedAt            time.Time       `json:"created_at"`
	UpdatedAt            time.Time       `json:"updated_at"`
	DeletedAt            gorm.DeletedAt  `gorm:"index" json:"-"`
}

func (UserPreference) TableName() string {
	return "what_user_preferences"
}

type MatchStrategy string

const (
	MatchStrategyStrict MatchStrategy = "strict"
	MatchStrategyLoose  MatchStrategy = "loose"
	MatchStrategySmart  MatchStrategy = "smart"
)

// JSONStringArray is a custom type for storing string arrays in JSON format
type JSONStringArray []string

func (j JSONStringArray) Value() (driver.Value, error) {
	if j == nil {
		return "[]", nil
	}
	return json.Marshal(j)
}

func (j *JSONStringArray) Scan(value interface{}) error {
	if value == nil {
		*j = []string{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for JSONStringArray")
	}

	return json.Unmarshal(bytes, j)
}
