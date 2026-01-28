package ai

// PromptTemplates holds various prompt templates for AI extraction
var PromptTemplates = map[string]string{
	"position_extraction": `你是公务员考试职位信息提取专家。请从以下公告内容中提取职位信息，并以JSON格式输出。

## 要求：
1. 严格按照字段定义提取信息
2. 无法确定的字段填null，不要猜测
3. 为每个主要字段提供confidence分数(0-100)
4. 识别出的不确定信息放入warnings数组
5. 重点识别：年龄要求、性别要求、应届限制、户籍要求、服务期限等限制条件

## 专业要求识别规则：
- 如果出现"不限专业"、"专业不限"、"无专业限制"等表述，major_unlimited 设为 true
- 如果出现"不限户籍"、"户籍不限"等表述，hukou_required 设为 false
- 如果出现"仅限应届"、"应届毕业生"等表述，fresh_graduate_only 设为 true
- 如果出现"X年以上工作经验"，提取工作年限数字

## 输出字段定义：
{
  "positions": [
    {
      "position_name": "职位名称",
      "department_name": "招录机关名称",
      "department_code": "招录机关代码(如有)",
      "position_code": "职位代码(如有)",
      "department_level": "单位层级(中央/省级/市级/县级/乡镇)",
      "recruit_count": 招录人数(数字，默认1),
      "work_location": "工作地点(省市区)",
      "education_min": "最低学历要求(大专/本科/硕士研究生/博士研究生)",
      "degree_required": "学位要求(学士/硕士/博士/不限)",
      "major_specific": ["具体专业要求列表"],
      "major_category": "专业大类(如：管理学、法学、经济学)",
      "major_unlimited": 是否专业不限(true/false),
      "political_status": "政治面貌要求(中共党员/中共党员或共青团员/共青团员/群众/不限)",
      "age_requirement": "年龄要求原文",
      "age_max": 最大年龄(数字),
      "age_min": 最小年龄(数字，默认18),
      "work_exp_years_min": 最低工作年限(数字，无要求填0),
      "work_experience": "工作经历要求原文",
      "grassroots_exp_years": 基层工作经验年限(数字，无要求填0),
      "hukou_required": 是否限户籍(true/false),
      "hukou_provinces": ["限制的省份或地区"],
      "household_requirement": "户籍要求原文",
      "gender_required": "性别要求(男/女/不限)",
      "fresh_graduate_only": 是否仅限应届生(true/false/null表示不限),
      "service_period": "服务期限(如：5年、最低服务年限5年)",
      "exam_category": "考试分类(综合管理类A/社会科学专技类B/自然科学专技类C/中小学教师类D/医疗卫生类E)",
      "other_requirements": "其他条件",
      "notes": "备注",
      "confidence": 置信度(0-100)
    }
  ],
  "exam_info": {
    "exam_type": "考试类型(公务员/事业单位/教师招聘/医疗卫生/银行招聘/国企招聘/军队文职/三支一扶/选调生/社区工作者/其他)",
    "registration_start": "报名开始日期(YYYY-MM-DD)",
    "registration_end": "报名截止日期(YYYY-MM-DD)",
    "exam_date_written": "笔试日期(YYYY-MM-DD)",
    "interview_date": "面试日期(YYYY-MM-DD，如有)"
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

	"list_page_verification": `你是网页结构分析专家。请判断以下页面是否是一个"公告列表页/栏目页"。

## 当前页面URL
{{page_url}}

## 目标文章URL（需要在列表页中找到）
{{article_url}}

## 页面HTML内容
{{html_content}}

## 判断标准

**公告列表页的特征：**
1. 主体内容是多篇文章/公告的标题列表（通常是ul/li或table结构）
2. 通常有发布日期列表
3. 可能有分页导航（上一页/下一页）
4. URL通常包含 channelList、channel、list、index 等关键词
5. 页面标题通常是栏目名称（如"公告公示"、"通知公告"）

**文章详情页（引用其他文章）的特征：**
1. 主体内容是一篇完整的文章正文
2. 可能有"相关阅读"、"推荐文章"、"热门文章"等区域引用其他文章
3. URL通常包含 content、article、detail、news 加数字ID
4. 页面标题通常是具体的文章标题

## 请返回JSON格式

{
  "is_list_page": true或false,
  "confidence": 0-100的整数,
  "page_type": "list_page" 或 "article_page" 或 "other",
  "reason": "判断理由"
}

请分析并输出JSON：`,

	"list_page_extraction": `你是网页结构分析专家。请分析以下HTML内容，找出当前文章所属的列表页/栏目页URL。

## 核心目标：
找到包含当前文章链接的上级列表页。列表页通常是一个栏目页面，显示多篇同类文章的标题和链接。

## 分析要点（按优先级）：
1. 【最高优先】面包屑导航中的上级链接（通常显示：首页 > 栏目名 > 当前文章）
2. 【高优先】包含"返回列表"、"更多公告"、"返回"等文字的链接
3. 【中优先】URL中包含channel、channelList、list、category、column等关键词的链接
4. 【中优先】侧边栏中的栏目导航链接
5. 【低优先】通过URL结构推断（去掉文章ID部分）

## 列表页URL特征：
- 通常包含：/channelList/、/channel/、/list/、/index、/column/、/category/
- 通常不包含纯数字ID作为最后路径段（纯数字ID通常是文章详情页）
- 示例：/channelList/10808.html 是列表页，/content/43033.html 是文章页

## 当前页面URL：
{{current_url}}

## HTML内容（部分）：
{{html_content}}

## 输出JSON格式（必须严格遵守）：
{
  "list_page_urls": [
    {
      "url": "完整的列表页URL（必须是绝对URL）",
      "confidence": 置信度(0-100的整数),
      "reason": "判断依据说明"
    }
  ],
  "analysis": "分析过程说明"
}

## 重要注意：
- 只返回可能是公告列表页/栏目页的URL
- 不要返回：首页、登录页、搜索页、其他文章详情页
- url必须是完整的绝对URL
- 按置信度从高到低排序
- 如果找不到，返回空数组

请分析并输出JSON：`,

	"history_data_extraction": `你是公务员考试历年数据提取专家。请从以下公告内容中提取历年招录数据，包括分数线和竞争比等信息。

## 要求：
1. 严格按照字段定义提取信息
2. 无法确定的字段填null，不要猜测
3. 识别多年份、多职位的历史数据
4. 特别注意：进面分数线、笔试分数线、最终录取分数线
5. 识别报名人数、审核通过人数、竞争比

## 数据来源类型识别：
- 成绩公告：包含具体分数线
- 报名统计：包含报名人数、审核人数、竞争比
- 录用公示：包含最终录取分数
- 历年汇总：多年数据整理

## 输出字段定义：
{
  "history_records": [
    {
      "year": 招录年份(数字，如2024),
      "exam_type": "考试类型(国考/省考/事业单位/选调生等)",
      "exam_category": "考试分类(A类/B类/C类，如有)",
      "province": "省份",
      "city": "城市(如有)",
      "department_name": "招录单位名称",
      "department_code": "单位代码(如有)",
      "position_name": "岗位名称",
      "position_code": "职位代码(如有)",
      "department_level": "单位层级(中央/省级/市级/县级/乡镇)",
      "recruit_count": 招录人数(数字),
      "apply_count": 报名人数(数字，如无填null),
      "pass_count": 审核通过人数(数字，如无填null),
      "competition_ratio": 竞争比(小数，如无填null，格式如45.5),
      "interview_score": 进面分数线(小数，如无填null),
      "written_score": 笔试分数线(小数，如无填null),
      "final_score": 最终录取分数线(小数，如无填null),
      "education": "学历要求(如有)",
      "source": "数据来源描述",
      "remark": "备注说明",
      "confidence": 置信度(0-100)
    }
  ],
  "data_type": "数据类型(score_line/registration_stats/admission/comprehensive)",
  "total_records": 提取到的记录总数,
  "confidence": 整体置信度(0-100),
  "warnings": ["提取过程中的警告信息"]
}

## 分数线识别规则：
- "进面分数"、"入围分数"、"面试分数线" → interview_score
- "笔试成绩"、"笔试分数"、"行测+申论" → written_score
- "综合成绩"、"最终成绩"、"录取分数" → final_score

## 竞争比计算规则：
- 如果提供了报名人数和招录人数，计算 competition_ratio = apply_count / recruit_count
- 如果直接提供了竞争比（如"1:45"），转换为数字45
- 如果是"审核通过人数:招录人数"格式，提取pass_count

## 公告内容：
{{content}}

请提取并输出JSON：`,

	"score_line_extraction": `你是公务员考试分数线提取专家。请从以下内容中专门提取分数线数据。

## 要求：
1. 识别各类分数线：笔试分数线、进面分数线、录取分数线
2. 区分不同类型的分数线（省级以上/市地级/行政执法类等）
3. 提取分数线对应的职位或类别
4. 注意识别合格分数线和实际录取分数线的区别

## 分数线类型：
- 笔试合格线：最低通过笔试的分数
- 进面分数线：获得面试资格的最低分数
- 录取分数线：最终被录取的最低分数

## 输出JSON格式：
{
  "score_lines": [
    {
      "year": 年份,
      "exam_type": "考试类型",
      "category": "职位类别(省级以上/市地级/行政执法/西部边远等)",
      "line_type": "分数线类型(written_qualify/interview/admission)",
      "total_score": 总分要求(如有),
      "xingce_score": 行测分数要求(如有),
      "shenlun_score": 申论分数要求(如有),
      "public_basic_score": 公共基础分数要求(如有),
      "professional_score": 专业科目分数要求(如有),
      "applicable_scope": "适用范围描述",
      "confidence": 置信度(0-100)
    }
  ],
  "exam_info": {
    "exam_name": "考试名称",
    "year": 年份,
    "announcement_type": "公告类型(合格线公告/成绩公告等)"
  },
  "confidence": 整体置信度(0-100)
}

## 内容：
{{content}}

请提取并输出JSON：`,

	"competition_ratio_extraction": `你是公务员考试报名数据提取专家。请从以下内容中提取报名统计和竞争比数据。

## 要求：
1. 识别报名人数、审核通过人数、缴费人数等数据
2. 计算或提取竞争比
3. 区分不同时间点的统计（报名首日、中期、最终）
4. 识别热门岗位和冷门岗位

## 竞争比解读：
- "报名人数:招录人数" = 报录比
- "审核通过:招录人数" = 过审比
- "缴费人数:招录人数" = 实际竞争比

## 输出JSON格式：
{
  "registration_stats": [
    {
      "year": 年份,
      "exam_type": "考试类型",
      "stat_date": "统计日期(YYYY-MM-DD，如有)",
      "stat_type": "统计类型(daily/final/position)",
      "department_name": "单位名称(如是单位统计)",
      "position_name": "岗位名称(如是岗位统计)",
      "position_code": "职位代码(如有)",
      "recruit_count": 招录人数,
      "apply_count": 报名人数,
      "pass_count": 审核通过人数,
      "paid_count": 缴费确认人数(如有),
      "competition_ratio": 竞争比,
      "is_hot": 是否热门岗位(true/false，竞争比>100可判定为热门),
      "is_cold": 是否冷门岗位(true/false，无人报名或竞争比<3),
      "confidence": 置信度(0-100)
    }
  ],
  "summary": {
    "total_positions": 总职位数(如有),
    "total_recruit": 总招录人数(如有),
    "total_apply": 总报名人数(如有),
    "total_pass": 总审核通过人数(如有),
    "avg_competition": 平均竞争比(如有),
    "max_competition": 最高竞争比(如有),
    "zero_apply_count": 无人报名岗位数(如有)
  },
  "confidence": 整体置信度(0-100)
}

## 内容：
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
