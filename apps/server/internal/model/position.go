package model

import (
	"time"

	"gorm.io/gorm"
)

// Position 职位模型
type Position struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	AnnouncementID     *uint          `gorm:"index" json:"announcement_id"`                                                            // 关联公告ID
	FenbiAnnouncementID *uint         `gorm:"index" json:"fenbi_announcement_id"`                                                      // 粉笔公告ID
	PositionID         string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"position_id"`                                // 职位唯一标识
	PositionCode       string         `gorm:"type:varchar(50);index" json:"position_code"`                                             // 职位代码
	PositionName       string         `gorm:"type:varchar(200);not null;index" json:"position_name" es:"type:text,analyzer:ik_max_word"` // 岗位名称

	// 招录单位
	DepartmentCode  string `gorm:"type:varchar(50);index" json:"department_code"`                                     // 单位代码
	DepartmentName  string `gorm:"type:varchar(200);index" json:"department_name" es:"type:text,analyzer:ik_max_word"` // 招录单位
	DepartmentLevel string `gorm:"type:varchar(50)" json:"department_level"`                                           // 单位层级

	// 招录条件
	RecruitCount     int             `gorm:"default:1" json:"recruit_count"`                   // 招录人数
	Education        string          `gorm:"type:varchar(50);index" json:"education"`         // 学历要求
	Degree           string          `gorm:"type:varchar(50)" json:"degree"`                  // 学位要求
	MajorCategory    string          `gorm:"type:varchar(100)" json:"major_category"`         // 专业大类
	MajorRequirement string          `gorm:"type:text" json:"major_requirement"`              // 专业要求原文
	MajorList        JSONStringArray `gorm:"type:json" json:"major_list"`                     // 专业列表JSON
	IsUnlimitedMajor bool            `gorm:"default:false;index" json:"is_unlimited_major"`   // 是否不限专业

	// 工作地点
	WorkLocation string `gorm:"type:varchar(200)" json:"work_location"` // 工作地点
	Province     string `gorm:"type:varchar(50);index" json:"province"` // 省份
	City         string `gorm:"type:varchar(50);index" json:"city"`     // 城市
	District     string `gorm:"type:varchar(50)" json:"district"`       // 区县

	// 其他条件
	PoliticalStatus      string `gorm:"type:varchar(50)" json:"political_status"`          // 政治面貌要求
	Age                  string `gorm:"type:varchar(100)" json:"age"`                      // 年龄要求原文
	AgeMin               int    `gorm:"default:18" json:"age_min"`                         // 最小年龄
	AgeMax               int    `gorm:"default:35" json:"age_max"`                         // 最大年龄
	WorkExperience       string `gorm:"type:varchar(200)" json:"work_experience"`          // 工作经历要求原文
	WorkExperienceYears  int    `gorm:"default:0" json:"work_experience_years"`            // 最低工作年限
	IsForFreshGraduate   *bool  `gorm:"index" json:"is_for_fresh_graduate"`                // 是否限应届(NULL=不限,true=仅应届,false=需经验)
	Gender               string `gorm:"type:varchar(10)" json:"gender"`                    // 性别要求
	HouseholdRequirement string `gorm:"type:varchar(200)" json:"household_requirement"`    // 户籍要求
	ServicePeriod        string `gorm:"type:varchar(100)" json:"service_period"`           // 服务期限
	OtherConditions      string `gorm:"type:text" json:"other_conditions"`                 // 其他条件

	// 考试信息
	ExamType     string `gorm:"type:varchar(50);index" json:"exam_type"`  // 考试类型
	ExamCategory string `gorm:"type:varchar(50)" json:"exam_category"`    // 考试分类(A/B/C类)

	// 时间信息
	RegistrationStart *time.Time `gorm:"type:datetime;index" json:"registration_start"` // 报名开始时间
	RegistrationEnd   *time.Time `gorm:"type:datetime;index" json:"registration_end"`   // 报名截止时间
	ExamDate          *time.Time `gorm:"type:datetime" json:"exam_date"`                // 笔试时间
	InterviewDate     *time.Time `gorm:"type:datetime" json:"interview_date"`           // 面试时间

	// 其他信息
	SalaryRange string `gorm:"type:varchar(100)" json:"salary_range"` // 薪资范围
	Remark      string `gorm:"type:text" json:"remark"`               // 备注
	SourceURL   string `gorm:"type:varchar(500)" json:"source_url"`   // 来源链接

	// 报名统计(可选)
	ApplicantCount   int     `gorm:"default:0" json:"applicant_count"`                       // 报名人数
	PassCount        int     `gorm:"default:0" json:"pass_count"`                            // 过审人数
	CompetitionRatio float64 `gorm:"type:decimal(10,2);default:0" json:"competition_ratio"`  // 竞争比

	// AI解析元数据
	ParseConfidence int        `gorm:"default:0" json:"parse_confidence"` // 解析置信度(0-100)
	ParsedAt        *time.Time `gorm:"type:datetime" json:"parsed_at"`    // 解析时间

	// 状态
	Status int `gorm:"type:tinyint;default:0;index" json:"status"` // 0: pending, 1: published, 2: offline

	// 系统字段
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Announcements []Announcement `gorm:"many2many:what_position_announcements;" json:"announcements,omitempty"`
}

func (Position) TableName() string {
	return "what_positions"
}

// PositionBriefResponse 职位简要信息（列表用）
type PositionBriefResponse struct {
	ID                 uint       `json:"id"`
	PositionName       string     `json:"position_name"`
	PositionCode       string     `json:"position_code,omitempty"`
	DepartmentName     string     `json:"department_name"`
	DepartmentLevel    string     `json:"department_level,omitempty"`
	RecruitCount       int        `json:"recruit_count"`
	Education          string     `json:"education,omitempty"`
	IsUnlimitedMajor   bool       `json:"is_unlimited_major"`
	Province           string     `json:"province,omitempty"`
	City               string     `json:"city,omitempty"`
	ExamType           string     `json:"exam_type,omitempty"`
	RegistrationEnd    *time.Time `json:"registration_end,omitempty"`
	CompetitionRatio   float64    `json:"competition_ratio,omitempty"`
	IsForFreshGraduate *bool      `json:"is_for_fresh_graduate,omitempty"`
	Status             int        `json:"status"`
	CreatedAt          time.Time  `json:"created_at"`
}

// ToBriefResponse 转换为简要响应
func (p *Position) ToBriefResponse() *PositionBriefResponse {
	return &PositionBriefResponse{
		ID:                 p.ID,
		PositionName:       p.PositionName,
		PositionCode:       p.PositionCode,
		DepartmentName:     p.DepartmentName,
		DepartmentLevel:    p.DepartmentLevel,
		RecruitCount:       p.RecruitCount,
		Education:          p.Education,
		IsUnlimitedMajor:   p.IsUnlimitedMajor,
		Province:           p.Province,
		City:               p.City,
		ExamType:           p.ExamType,
		RegistrationEnd:    p.RegistrationEnd,
		CompetitionRatio:   p.CompetitionRatio,
		IsForFreshGraduate: p.IsForFreshGraduate,
		Status:             p.Status,
		CreatedAt:          p.CreatedAt,
	}
}

// PositionDetailResponse 职位详情响应
type PositionDetailResponse struct {
	Position
	IsFavorite bool `json:"is_favorite,omitempty"`
}

// ToDetailResponse 转换为详情响应
func (p *Position) ToDetailResponse(isFavorite bool) *PositionDetailResponse {
	return &PositionDetailResponse{
		Position:   *p,
		IsFavorite: isFavorite,
	}
}
