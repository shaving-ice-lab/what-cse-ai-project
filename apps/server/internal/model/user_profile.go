package model

import (
	"time"

	"gorm.io/gorm"
)

// UserProfile 用户画像模型
type UserProfile struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"uniqueIndex;not null" json:"user_id"`

	// 学历信息
	Education        string     `gorm:"type:varchar(20)" json:"education"`       // 最高学历: 大专/本科/硕士研究生/博士研究生
	Degree           string     `gorm:"type:varchar(20)" json:"degree"`          // 学位: 无/学士/硕士/博士
	GraduationDate   *time.Time `gorm:"type:date" json:"graduation_date"`        // 毕业时间
	GraduateYear     *int       `gorm:"type:int" json:"graduate_year"`           // 毕业年份
	IsCurrentStudent bool       `gorm:"default:false" json:"is_current_student"` // 是否在读
	School           string     `gorm:"type:varchar(100)" json:"school"`         // 毕业院校
	SchoolType       string     `gorm:"type:varchar(50)" json:"school_type"`     // 学校类型: 985/211/双一流/普通本科/大专
	IsFreshGraduate  bool       `gorm:"default:false" json:"is_fresh_graduate"`  // 是否应届生

	// 专业信息
	Major           string `gorm:"type:varchar(100)" json:"major"`            // 专业名称
	MajorCategory   string `gorm:"type:varchar(50)" json:"major_category"`    // 专业大类
	MajorCode       string `gorm:"type:varchar(20)" json:"major_code"`        // 专业代码
	SecondMajor     string `gorm:"type:varchar(100)" json:"second_major"`     // 第二专业
	SecondMajorCode string `gorm:"type:varchar(20)" json:"second_major_code"` // 第二专业代码

	// 个人信息
	Gender             string     `gorm:"type:varchar(10)" json:"gender"`           // 性别: 男/女
	BirthDate          *time.Time `gorm:"type:date" json:"birth_date"`              // 出生日期
	AgeAtExam          *int       `gorm:"type:int" json:"age_at_exam"`              // 考试时年龄(自动计算)
	PoliticalStatus    string     `gorm:"type:varchar(20)" json:"political_status"` // 政治面貌
	WorkYears          int        `gorm:"default:0" json:"work_years"`              // 工作年限
	GrassrootsExpYears int        `gorm:"default:0" json:"grassroots_exp_years"`    // 基层工作年限

	// 地域信息
	HukouProvince   string `gorm:"type:varchar(50)" json:"hukou_province"`   // 户籍省份
	HukouCity       string `gorm:"type:varchar(50)" json:"hukou_city"`       // 户籍城市
	CurrentProvince string `gorm:"type:varchar(50)" json:"current_province"` // 现居省份
	CurrentCity     string `gorm:"type:varchar(50)" json:"current_city"`     // 现居城市

	// 身份类型
	IdentityType string `gorm:"type:varchar(50)" json:"identity_type"` // 应届生/社会人员/服务基层人员

	// 系统字段
	ProfileCompleteness int        `gorm:"default:0" json:"profile_completeness"` // 资料完整度(0-100)
	LastMatchAt         *time.Time `gorm:"type:datetime" json:"last_match_at"`    // 上次匹配时间

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (UserProfile) TableName() string {
	return "what_user_profiles"
}

// CalculateAge 计算年龄
func (p *UserProfile) CalculateAge() int {
	if p.BirthDate == nil {
		return 0
	}
	now := time.Now()
	age := now.Year() - p.BirthDate.Year()
	if now.YearDay() < p.BirthDate.YearDay() {
		age--
	}
	return age
}

// CalculateCompleteness 计算资料完整度
func (p *UserProfile) CalculateCompleteness() int {
	score := 0
	totalFields := 15

	// 学历信息 (4个字段, 权重高)
	if p.Education != "" {
		score += 2
	}
	if p.Degree != "" {
		score += 1
	}
	if p.School != "" {
		score += 1
	}
	if p.GraduateYear != nil || p.GraduationDate != nil {
		score += 1
	}

	// 专业信息 (2个字段)
	if p.Major != "" {
		score += 2
	}
	if p.MajorCategory != "" {
		score += 1
	}

	// 个人信息 (5个字段)
	if p.Gender != "" {
		score += 1
	}
	if p.BirthDate != nil {
		score += 2
	}
	if p.PoliticalStatus != "" {
		score += 2
	}
	if p.IdentityType != "" {
		score += 1
	}

	// 地域信息 (2个字段)
	if p.HukouProvince != "" {
		score += 1
	}
	if p.CurrentProvince != "" {
		score += 1
	}

	// 计算百分比 (最高16分)
	maxScore := totalFields + 1 // 16
	completeness := (score * 100) / maxScore
	if completeness > 100 {
		completeness = 100
	}
	return completeness
}

// UserProfileResponse 用户画像响应结构
type UserProfileResponse struct {
	ID     uint `json:"id"`
	UserID uint `json:"user_id"`

	// 学历信息
	Education        string `json:"education"`
	Degree           string `json:"degree"`
	GraduationDate   string `json:"graduation_date,omitempty"`
	GraduateYear     *int   `json:"graduate_year,omitempty"`
	IsCurrentStudent bool   `json:"is_current_student"`
	School           string `json:"school"`
	SchoolType       string `json:"school_type"`
	IsFreshGraduate  bool   `json:"is_fresh_graduate"`

	// 专业信息
	Major           string `json:"major"`
	MajorCategory   string `json:"major_category"`
	MajorCode       string `json:"major_code,omitempty"`
	SecondMajor     string `json:"second_major,omitempty"`
	SecondMajorCode string `json:"second_major_code,omitempty"`

	// 个人信息
	Gender             string `json:"gender"`
	BirthDate          string `json:"birth_date,omitempty"`
	Age                int    `json:"age"`
	PoliticalStatus    string `json:"political_status"`
	WorkYears          int    `json:"work_years"`
	GrassrootsExpYears int    `json:"grassroots_exp_years"`
	IdentityType       string `json:"identity_type"`

	// 地域信息
	HukouProvince   string `json:"hukou_province"`
	HukouCity       string `json:"hukou_city"`
	CurrentProvince string `json:"current_province"`
	CurrentCity     string `json:"current_city"`

	// 系统字段
	ProfileCompleteness int    `json:"profile_completeness"`
	LastMatchAt         string `json:"last_match_at,omitempty"`

	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// ToResponse 转换为响应结构
func (p *UserProfile) ToResponse() *UserProfileResponse {
	resp := &UserProfileResponse{
		ID:                  p.ID,
		UserID:              p.UserID,
		Education:           p.Education,
		Degree:              p.Degree,
		GraduateYear:        p.GraduateYear,
		IsCurrentStudent:    p.IsCurrentStudent,
		School:              p.School,
		SchoolType:          p.SchoolType,
		IsFreshGraduate:     p.IsFreshGraduate,
		Major:               p.Major,
		MajorCategory:       p.MajorCategory,
		MajorCode:           p.MajorCode,
		SecondMajor:         p.SecondMajor,
		SecondMajorCode:     p.SecondMajorCode,
		Gender:              p.Gender,
		Age:                 p.CalculateAge(),
		PoliticalStatus:     p.PoliticalStatus,
		WorkYears:           p.WorkYears,
		GrassrootsExpYears:  p.GrassrootsExpYears,
		IdentityType:        p.IdentityType,
		HukouProvince:       p.HukouProvince,
		HukouCity:           p.HukouCity,
		CurrentProvince:     p.CurrentProvince,
		CurrentCity:         p.CurrentCity,
		ProfileCompleteness: p.ProfileCompleteness,
		CreatedAt:           p.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:           p.UpdatedAt.Format("2006-01-02 15:04:05"),
	}

	if p.GraduationDate != nil {
		resp.GraduationDate = p.GraduationDate.Format("2006-01-02")
	}
	if p.BirthDate != nil {
		resp.BirthDate = p.BirthDate.Format("2006-01-02")
	}
	if p.LastMatchAt != nil {
		resp.LastMatchAt = p.LastMatchAt.Format("2006-01-02 15:04:05")
	}

	return resp
}

// 枚举定义 - 参见 position_constants.go 中的统一定义

// SchoolType 学校类型
type SchoolType string

const (
	SchoolType985        SchoolType = "985"
	SchoolType211        SchoolType = "211"
	SchoolTypeDoubleTops SchoolType = "双一流"
	SchoolTypeRegular    SchoolType = "普通本科"
	SchoolTypeCollege    SchoolType = "大专"
)

// IdentityType 身份类型
type IdentityType string

const (
	IdentityTypeFreshGrad IdentityType = "应届生"
	IdentityTypeSocial    IdentityType = "社会人员"
	IdentityTypeGrassroot IdentityType = "服务基层人员"
)
