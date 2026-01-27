package ai

// PromptTemplates holds various prompt templates for AI extraction
var PromptTemplates = map[string]string{
	"position_extraction": `你是公务员考试职位信息提取专家。请从以下公告内容中提取职位信息，并以JSON格式输出。

## 要求：
1. 严格按照字段定义提取信息
2. 无法确定的字段填null，不要猜测
3. 为每个主要字段提供confidence分数(0-100)
4. 识别出的不确定信息放入warnings数组

## 输出字段定义：
{
  "positions": [
    {
      "position_name": "职位名称",
      "department_name": "招录机关名称",
      "department_code": "招录机关代码",
      "position_code": "职位代码",
      "recruit_count": 招录人数(数字),
      "work_location": "工作地点",
      "education_min": "最低学历要求(大专/本科/硕士/博士)",
      "degree_required": "是否要求学位(是/否/不限)",
      "major_specific": ["具体专业要求"],
      "major_unlimited": 是否专业不限(true/false),
      "political_status": "政治面貌要求(党员/团员/不限)",
      "age_max": 最大年龄(数字),
      "age_min": 最小年龄(数字),
      "work_exp_years_min": 最低工作年限(数字),
      "grassroots_exp_years": 基层工作经验年限(数字),
      "hukou_required": 是否限户籍(true/false),
      "hukou_provinces": ["限制的省份"],
      "gender_required": "性别要求(男/女/不限)",
      "fresh_graduate_only": 是否仅限应届生(true/false),
      "other_requirements": "其他条件",
      "notes": "备注",
      "confidence": 置信度(0-100)
    }
  ],
  "exam_info": {
    "exam_type": "考试类型(国考/省考/事业单位/选调生)",
    "registration_start": "报名开始日期(YYYY-MM-DD)",
    "registration_end": "报名截止日期(YYYY-MM-DD)",
    "exam_date_written": "笔试日期(YYYY-MM-DD)"
  },
  "confidence": 整体置信度(0-100),
  "warnings": ["提取过程中的警告信息"]
}

## 公告内容：
{{content}}

请提取并输出JSON：`,

	"announcement_type": `请判断以下公告的类型，并以JSON格式输出。

公告类型包括：
- recruitment: 招录公告/招考公告
- registration_stats: 报名人数统计
- written_exam: 笔试公告/准考证公告
- score_release: 成绩公告
- qualification_review: 资格复审公告
- interview: 面试公告
- physical_exam: 体检公告
- political_review: 政审公告
- publicity: 拟录用公示
- supplement: 递补/调剂公告
- other: 其他

公告标题：{{title}}
公告内容（前500字）：{{content}}

请输出JSON格式：
{"type": "类型代码", "confidence": 置信度0-100}`,

	"content_summary": `请对以下公考招聘公告进行摘要，提取关键信息：

公告内容：
{{content}}

请输出JSON格式：
{
  "summary": "100字以内的内容摘要",
  "key_points": ["关键点1", "关键点2", ...],
  "exam_type": "考试类型",
  "target_audience": "目标人群描述"
}`,

	"requirement_parsing": `请解析以下职位要求文本，提取结构化信息：

要求文本：
{{text}}

请输出JSON格式：
{
  "education": "学历要求",
  "degree": "学位要求",
  "majors": ["专业1", "专业2"],
  "major_unlimited": 是否专业不限(true/false),
  "political_status": "政治面貌",
  "age_range": "年龄范围",
  "work_experience": "工作经历要求",
  "other": "其他要求"
}`,

	"table_extraction": `请从以下HTML表格内容中提取职位信息：

表格内容：
{{table_html}}

请识别表头并提取每行的职位数据，输出JSON格式：
{
  "headers": ["列名1", "列名2", ...],
  "positions": [
    {
      "row_index": 1,
      "data": {
        "字段名": "值",
        ...
      }
    }
  ]
}`,

	"content_cleaning": `你是网页内容提取专家。请从以下HTML内容中提取公告的核心信息，去除导航、广告、侧边栏等干扰内容。

## 要求：
1. 只提取正文内容，去除页头、页脚、导航、广告、分享按钮等
2. 保留正文的段落结构
3. 提取文中提到的附件信息（文件名、下载链接）
4. 识别发布日期、来源等元信息

## 输出JSON格式：
{
  "title": "文章标题",
  "content": "正文内容（保留段落换行）",
  "publish_date": "发布日期（YYYY-MM-DD格式，如无法确定填null）",
  "source": "来源/发布机构",
  "attachments": [
    {"name": "附件名称", "url": "附件链接"}
  ],
  "confidence": 提取置信度(0-100)
}

## HTML内容：
{{content}}

请提取并输出JSON：`,
}

// AnnouncementTypes defines the possible announcement types
var AnnouncementTypes = map[string]string{
	"recruitment":          "招录公告",
	"registration_stats":   "报名统计",
	"written_exam":         "笔试公告",
	"score_release":        "成绩公告",
	"qualification_review": "资格复审",
	"interview":            "面试公告",
	"physical_exam":        "体检公告",
	"political_review":     "政审公告",
	"publicity":            "录用公示",
	"supplement":           "递补调剂",
	"other":                "其他",
}

// ExamTypes defines the possible exam types
var ExamTypes = map[string]string{
	"national_exam":       "国考",
	"provincial_exam":     "省考",
	"public_institution":  "事业单位",
	"selection_transfer":  "选调生",
	"military_civilian":   "军转干",
	"three_support":       "三支一扶",
	"special_position":    "特岗教师",
	"community_worker":    "社区工作者",
	"other":               "其他",
}

// EducationLevels defines education level mappings
var EducationLevels = map[string]int{
	"高中":   1,
	"中专":   1,
	"大专":   2,
	"本科":   3,
	"硕士":   4,
	"研究生": 4,
	"博士":   5,
}

// PoliticalStatus defines political status options
var PoliticalStatus = []string{
	"中共党员",
	"共青团员",
	"群众",
	"民主党派",
	"不限",
}

// GetPromptTemplate returns a prompt template by name
func GetPromptTemplate(name string) string {
	if template, ok := PromptTemplates[name]; ok {
		return template
	}
	return ""
}

// GetAnnouncementTypeName returns the Chinese name for an announcement type
func GetAnnouncementTypeName(typeCode string) string {
	if name, ok := AnnouncementTypes[typeCode]; ok {
		return name
	}
	return "未知"
}

// GetExamTypeName returns the Chinese name for an exam type
func GetExamTypeName(typeCode string) string {
	if name, ok := ExamTypes[typeCode]; ok {
		return name
	}
	return "未知"
}

// CompareEducationLevels compares two education levels
// Returns 1 if a > b, -1 if a < b, 0 if equal
func CompareEducationLevels(a, b string) int {
	levelA, okA := EducationLevels[a]
	levelB, okB := EducationLevels[b]

	if !okA || !okB {
		return 0
	}

	if levelA > levelB {
		return 1
	} else if levelA < levelB {
		return -1
	}
	return 0
}
