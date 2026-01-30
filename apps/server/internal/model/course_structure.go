package model

// =====================================================
// 课程结构预设类型定义
// 用于从 docs/courses 导入课程结构到数据库
// =====================================================

// SubjectStructurePreset 科目预设结构
type SubjectStructurePreset struct {
	Subject     string         `json:"subject"`     // xingce/shenlun/mianshi/gongji
	Name        string         `json:"name"`        // 行政职业能力测验
	TotalHours  int            `json:"total_hours"` // 总课时
	Description string         `json:"description"` // 科目描述
	Modules     []ModulePreset `json:"modules"`     // 模块列表
}

// ModulePreset 模块预设 (Level 1)
type ModulePreset struct {
	Code          string           `json:"code"`           // 模块代码 yanyu/shuliang/panduan/ziliao/changshi
	Name          string           `json:"name"`           // 言语理解与表达
	ShortName     string           `json:"short_name"`     // 言语理解
	Icon          string           `json:"icon"`           // 图标
	Color         string           `json:"color"`          // 颜色
	Description   string           `json:"description"`    // 简短描述
	QuestionCount int              `json:"question_count"` // 国考约 40 题
	AvgTime       int              `json:"avg_time"`       // 平均用时（分钟）
	Weight        int              `json:"weight"`         // 考试权重 %
	Difficulty    int              `json:"difficulty"`     // 难度 1-5
	Categories    []CategoryPreset `json:"categories"`     // 分类列表
}

// CategoryPreset 分类预设 (Level 2)
type CategoryPreset struct {
	Name              string        `json:"name"`               // 逻辑填空
	Code              string        `json:"code"`               // 分类代码
	EstimatedDuration string        `json:"estimated_duration"` // 45课时
	Description       string        `json:"description"`        // 分类描述
	Topics            []TopicPreset `json:"topics"`             // 专题列表
}

// TopicPreset 专题预设 (Level 3)
type TopicPreset struct {
	Name        string         `json:"name"`        // 实词辨析精讲
	Code        string         `json:"code"`        // 专题代码
	Duration    string         `json:"duration"`    // 20课时
	Description string         `json:"description"` // 专题描述
	Courses     []CoursePreset `json:"courses"`     // 课程列表
}

// CoursePreset 课程预设 (Level 4 - 存入 Course 表)
type CoursePreset struct {
	Name        string         `json:"name"`        // 实词辨析基础方法
	Duration    string         `json:"duration"`    // 4课时
	Description string         `json:"description"` // 课程描述
	Lessons     []LessonPreset `json:"lessons"`     // 章节列表
}

// LessonPreset 章节预设 (Level 5 - 存入 CourseChapter 表)
type LessonPreset struct {
	Title    string `json:"title"`    // 第1课：语素分析法
	Subtitle string `json:"subtitle"` // 拆分词语分析语素含义差异
}

// GetSubjectPreset 获取科目预设结构
func GetSubjectPreset(subject string) *SubjectStructurePreset {
	switch subject {
	case "xingce":
		return GetXingceStructure()
	case "shenlun":
		return GetShenlunStructure()
	case "mianshi":
		return GetMianshiStructure()
	case "gongji":
		return GetGongjiStructure()
	default:
		return nil
	}
}

// GetAllSubjectPresets 获取所有科目预设
func GetAllSubjectPresets() []*SubjectStructurePreset {
	return []*SubjectStructurePreset{
		GetXingceStructure(),
		GetShenlunStructure(),
		GetMianshiStructure(),
		GetGongjiStructure(),
	}
}
