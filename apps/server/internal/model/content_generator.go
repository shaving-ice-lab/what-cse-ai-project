package model

import (
	"time"

	"gorm.io/gorm"
)

// =====================================================
// 内容生成任务
// =====================================================

// ContentGeneratorTaskStatus 生成任务状态
type ContentGeneratorTaskStatus string

const (
	TaskStatusPending    ContentGeneratorTaskStatus = "pending"    // 待处理
	TaskStatusProcessing ContentGeneratorTaskStatus = "processing" // 处理中
	TaskStatusCompleted  ContentGeneratorTaskStatus = "completed"  // 已完成
	TaskStatusFailed     ContentGeneratorTaskStatus = "failed"     // 失败
)

// ContentGeneratorTaskType 生成任务类型
type ContentGeneratorTaskType string

const (
	TaskTypeCategory   ContentGeneratorTaskType = "category"  // 分类生成
	TaskTypeCourse     ContentGeneratorTaskType = "course"    // 课程生成
	TaskTypeChapter    ContentGeneratorTaskType = "chapter"   // 章节生成
	TaskTypeKnowledge  ContentGeneratorTaskType = "knowledge" // 知识点生成
	TaskTypeBulkImport ContentGeneratorTaskType = "bulk"      // 批量导入
	TaskTypeTemplate   ContentGeneratorTaskType = "template"  // 模板生成
)

// ContentGeneratorTask 内容生成任务
type ContentGeneratorTask struct {
	ID             uint                       `gorm:"primaryKey" json:"id"`
	TaskType       ContentGeneratorTaskType   `gorm:"type:varchar(20);not null" json:"task_type"`
	Status         ContentGeneratorTaskStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	Subject        string                     `gorm:"type:varchar(50)" json:"subject,omitempty"`        // 科目
	TemplateName   string                     `gorm:"type:varchar(100)" json:"template_name,omitempty"` // 模板名称
	TotalItems     int                        `gorm:"default:0" json:"total_items"`                     // 总项数
	ProcessedItems int                        `gorm:"default:0" json:"processed_items"`                 // 已处理项数
	SuccessItems   int                        `gorm:"default:0" json:"success_items"`                   // 成功项数
	FailedItems    int                        `gorm:"default:0" json:"failed_items"`                    // 失败项数
	ErrorMessage   string                     `gorm:"type:text" json:"error_message,omitempty"`
	InputData      string                     `gorm:"type:mediumtext" json:"input_data,omitempty"`  // 输入数据JSON
	ResultData     string                     `gorm:"type:mediumtext" json:"result_data,omitempty"` // 结果数据JSON
	CreatedBy      uint                       `gorm:"index" json:"created_by"`
	StartedAt      *time.Time                 `json:"started_at,omitempty"`
	CompletedAt    *time.Time                 `json:"completed_at,omitempty"`
	CreatedAt      time.Time                  `json:"created_at"`
	UpdatedAt      time.Time                  `json:"updated_at"`
	DeletedAt      gorm.DeletedAt             `gorm:"index" json:"-"`
}

func (ContentGeneratorTask) TableName() string {
	return "what_content_generator_tasks"
}

// =====================================================
// 课程模板
// =====================================================

// CourseTemplate 课程模板
type CourseTemplate struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(100);not null;uniqueIndex" json:"name"`
	Subject     string         `gorm:"type:varchar(50);index" json:"subject"` // 科目
	ExamType    string         `gorm:"type:varchar(50)" json:"exam_type,omitempty"`
	Description string         `gorm:"type:varchar(500)" json:"description,omitempty"`
	Structure   string         `gorm:"type:mediumtext" json:"structure"` // JSON结构定义
	IsBuiltin   bool           `gorm:"default:false" json:"is_builtin"`  // 是否内置模板
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	UsageCount  int            `gorm:"default:0" json:"usage_count"`
	CreatedBy   uint           `gorm:"index" json:"created_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (CourseTemplate) TableName() string {
	return "what_course_templates"
}

// =====================================================
// 请求/响应结构
// =====================================================

// BatchCreateCategoryRequest 批量创建分类请求
type BatchCreateCategoryRequest struct {
	Subject  string                    `json:"subject" binding:"required"`
	ExamType string                    `json:"exam_type,omitempty"`
	Items    []BatchCreateCategoryItem `json:"items" binding:"required,min=1"`
}

type BatchCreateCategoryItem struct {
	Code        string                    `json:"code" binding:"required"`
	Name        string                    `json:"name" binding:"required"`
	Description string                    `json:"description,omitempty"`
	Icon        string                    `json:"icon,omitempty"`
	Color       string                    `json:"color,omitempty"`
	SortOrder   int                       `json:"sort_order"`
	Children    []BatchCreateCategoryItem `json:"children,omitempty"`
}

// BatchCreateCourseRequest 批量创建课程请求
type BatchCreateCourseRequest struct {
	CategoryID  uint                    `json:"category_id" binding:"required"`
	ContentType CourseContentType       `json:"content_type"`
	Difficulty  CourseDifficulty        `json:"difficulty"`
	TeacherName string                  `json:"teacher_name,omitempty"`
	IsFree      bool                    `json:"is_free"`
	VIPOnly     bool                    `json:"vip_only"`
	Status      CourseStatus            `json:"status"`
	Items       []BatchCreateCourseItem `json:"items" binding:"required,min=1"`
}

type BatchCreateCourseItem struct {
	Title       string                   `json:"title" binding:"required"`
	Subtitle    string                   `json:"subtitle,omitempty"`
	Description string                   `json:"description,omitempty"`
	CoverImage  string                   `json:"cover_image,omitempty"`
	Duration    int                      `json:"duration"`
	Tags        []string                 `json:"tags,omitempty"`
	Chapters    []BatchCreateChapterItem `json:"chapters,omitempty"`
}

type BatchCreateChapterItem struct {
	Title         string                   `json:"title" binding:"required"`
	ContentType   CourseContentType        `json:"content_type,omitempty"`
	ContentURL    string                   `json:"content_url,omitempty"`
	ContentText   string                   `json:"content_text,omitempty"`
	Duration      int                      `json:"duration"`
	IsFreePreview bool                     `json:"is_free_preview"`
	Children      []BatchCreateChapterItem `json:"children,omitempty"`
}

// BatchCreateKnowledgeRequest 批量创建知识点请求
type BatchCreateKnowledgeRequest struct {
	CategoryID uint                       `json:"category_id" binding:"required"`
	Items      []BatchCreateKnowledgeItem `json:"items" binding:"required,min=1"`
}

type BatchCreateKnowledgeItem struct {
	Code           string                     `json:"code" binding:"required"`
	Name           string                     `json:"name" binding:"required"`
	Description    string                     `json:"description,omitempty"`
	Importance     int                        `json:"importance"`
	Frequency      KnowledgeFrequency         `json:"frequency"`
	Tips           string                     `json:"tips,omitempty"`
	RelatedCourses []int                      `json:"related_courses,omitempty"`
	Children       []BatchCreateKnowledgeItem `json:"children,omitempty"`
}

// GenerateFromTemplateRequest 从模板生成请求
type GenerateFromTemplateRequest struct {
	TemplateID uint           `json:"template_id" binding:"required"`
	Subject    string         `json:"subject,omitempty"`
	ExamType   string         `json:"exam_type,omitempty"`
	Options    map[string]any `json:"options,omitempty"` // 自定义选项
}

// BatchImportRequest 批量导入请求
type BatchImportRequest struct {
	ImportType string `json:"import_type" binding:"required"` // category, course, chapter, knowledge
	Subject    string `json:"subject,omitempty"`
	DataFormat string `json:"data_format"` // json, csv
	Data       string `json:"data" binding:"required"`
}

// ContentGeneratorTaskResponse 任务响应
type ContentGeneratorTaskResponse struct {
	ID             uint                       `json:"id"`
	TaskType       ContentGeneratorTaskType   `json:"task_type"`
	Status         ContentGeneratorTaskStatus `json:"status"`
	Subject        string                     `json:"subject,omitempty"`
	TemplateName   string                     `json:"template_name,omitempty"`
	TotalItems     int                        `json:"total_items"`
	ProcessedItems int                        `json:"processed_items"`
	SuccessItems   int                        `json:"success_items"`
	FailedItems    int                        `json:"failed_items"`
	ErrorMessage   string                     `json:"error_message,omitempty"`
	Progress       float64                    `json:"progress"` // 0-100
	StartedAt      *time.Time                 `json:"started_at,omitempty"`
	CompletedAt    *time.Time                 `json:"completed_at,omitempty"`
	CreatedAt      time.Time                  `json:"created_at"`
}

func (t *ContentGeneratorTask) ToResponse() *ContentGeneratorTaskResponse {
	progress := float64(0)
	if t.TotalItems > 0 {
		progress = float64(t.ProcessedItems) / float64(t.TotalItems) * 100
	}
	return &ContentGeneratorTaskResponse{
		ID:             t.ID,
		TaskType:       t.TaskType,
		Status:         t.Status,
		Subject:        t.Subject,
		TemplateName:   t.TemplateName,
		TotalItems:     t.TotalItems,
		ProcessedItems: t.ProcessedItems,
		SuccessItems:   t.SuccessItems,
		FailedItems:    t.FailedItems,
		ErrorMessage:   t.ErrorMessage,
		Progress:       progress,
		StartedAt:      t.StartedAt,
		CompletedAt:    t.CompletedAt,
		CreatedAt:      t.CreatedAt,
	}
}

// CourseTemplateResponse 课程模板响应
type CourseTemplateResponse struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Subject     string    `json:"subject"`
	ExamType    string    `json:"exam_type,omitempty"`
	Description string    `json:"description,omitempty"`
	IsBuiltin   bool      `json:"is_builtin"`
	IsActive    bool      `json:"is_active"`
	UsageCount  int       `json:"usage_count"`
	CreatedAt   time.Time `json:"created_at"`
}

func (t *CourseTemplate) ToResponse() *CourseTemplateResponse {
	return &CourseTemplateResponse{
		ID:          t.ID,
		Name:        t.Name,
		Subject:     t.Subject,
		ExamType:    t.ExamType,
		Description: t.Description,
		IsBuiltin:   t.IsBuiltin,
		IsActive:    t.IsActive,
		UsageCount:  t.UsageCount,
		CreatedAt:   t.CreatedAt,
	}
}

// =====================================================
// 预定义课程结构
// =====================================================

// XingCeCourseStructure 行测课程结构定义
var XingCeCourseStructure = map[string][]string{
	"言语理解与表达": {
		"逻辑填空-实词辨析",
		"逻辑填空-成语辨析",
		"逻辑填空-关联词",
		"片段阅读-主旨概括",
		"片段阅读-意图判断",
		"片段阅读-细节理解",
		"片段阅读-标题选择",
		"语句表达-语句排序",
		"语句表达-语句填空",
	},
	"数量关系": {
		"数学运算-计算问题",
		"数学运算-行程问题",
		"数学运算-工程问题",
		"数学运算-利润问题",
		"数学运算-排列组合",
		"数学运算-概率问题",
		"数学运算-几何问题",
		"数学运算-其他问题",
		"数字推理-基础数列",
		"数字推理-递推数列",
		"数字推理-特殊数列",
	},
	"判断推理": {
		"图形推理-位置规律",
		"图形推理-样式规律",
		"图形推理-属性规律",
		"图形推理-数量规律",
		"图形推理-空间重构",
		"定义判断-方法精讲",
		"定义判断-题型精讲",
		"类比推理-语义关系",
		"类比推理-逻辑关系",
		"类比推理-语法关系",
		"逻辑判断-翻译推理",
		"逻辑判断-真假推理",
		"逻辑判断-分析推理",
		"逻辑判断-加强削弱",
	},
	"资料分析": {
		"核心概念-增长问题",
		"核心概念-比重问题",
		"核心概念-倍数问题",
		"核心概念-平均数问题",
		"速算技巧-截位直除",
		"速算技巧-特征数字",
		"速算技巧-有效数字",
		"速算技巧-同位比较",
		"材料解读-文字材料",
		"材料解读-表格材料",
		"材料解读-图形材料",
	},
	"常识判断": {
		"政治常识-时政热点",
		"政治常识-中特理论",
		"法律常识-宪法",
		"法律常识-民法典",
		"法律常识-刑法",
		"法律常识-行政法",
		"经济常识",
		"历史常识",
		"地理常识",
		"科技常识",
		"文学常识",
	},
}

// ShenlunCourseStructure 申论课程结构定义
var ShenlunCourseStructure = map[string][]string{
	"归纳概括": {
		"方法精讲",
		"题型实战",
	},
	"提出对策": {
		"对策来源分析",
		"对策维度框架",
	},
	"综合分析": {
		"各类分析题型精讲",
	},
	"贯彻执行": {
		"公文格式规范",
		"讲话稿类",
		"宣传倡议类",
		"报告总结类",
		"方案计划类",
		"新闻传媒类",
		"其他文书",
	},
	"文章写作": {
		"立意技巧",
		"标题拟定",
		"开头写法",
		"分论点论证",
		"结尾写法",
		"高分范文赏析",
	},
}

// MianshiCourseStructure 面试课程结构定义
var MianshiCourseStructure = map[string][]string{
	"结构化面试": {
		"综合分析-社会现象",
		"综合分析-政策理解",
		"综合分析-名言警句",
		"综合分析-哲理故事",
		"计划组织-调研类",
		"计划组织-宣传类",
		"计划组织-活动策划",
		"计划组织-会议组织",
		"人际关系题",
		"应急应变题",
		"自我认知题",
		"情景模拟题",
	},
	"无领导小组讨论": {
		"题型分类精讲",
		"角色策略",
		"讨论技巧",
	},
	"面试礼仪": {
		"着装礼仪",
		"仪态举止",
		"语言表达",
		"心理调适",
	},
}

// GongjiCourseStructure 公基课程结构定义
var GongjiCourseStructure = map[string][]string{
	"政治理论": {
		"马克思主义哲学",
		"毛泽东思想",
		"中国特色社会主义理论",
		"习近平新时代思想",
		"党史党建",
	},
	"法律知识": {
		"法理学",
		"宪法",
		"民法典",
		"刑法",
		"行政法",
		"其他法律",
	},
	"公文写作": {
		"公文格式规范",
		"常用文种精讲",
		"公文处理流程",
	},
	"经济管理": {},
	"人文历史": {},
	"科技地理": {},
}

// GetCourseStructure 获取课程结构
func GetCourseStructure(subject string) map[string][]string {
	switch subject {
	case "xingce":
		return XingCeCourseStructure
	case "shenlun":
		return ShenlunCourseStructure
	case "mianshi":
		return MianshiCourseStructure
	case "gongji":
		return GongjiCourseStructure
	default:
		return nil
	}
}

// GetSubjectName 获取科目名称
func GetSubjectName(subject string) string {
	names := map[string]string{
		"xingce":  "行测",
		"shenlun": "申论",
		"mianshi": "面试",
		"gongji":  "公基",
	}
	if name, ok := names[subject]; ok {
		return name
	}
	return subject
}

// GenerateContentStats 生成统计
type GenerateContentStats struct {
	TotalCategories      int `json:"total_categories"`
	TotalCourses         int `json:"total_courses"`
	TotalChapters        int `json:"total_chapters"`
	TotalKnowledgePoints int `json:"total_knowledge_points"`
}
