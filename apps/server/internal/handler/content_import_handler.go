package handler

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
	"gorm.io/gorm"
)

// ContentImportHandler MCP 内容导入处理器
type ContentImportHandler struct {
	db              *gorm.DB
	courseService   *service.CourseService
	questionService *service.QuestionService
	materialService *service.MaterialService
}

// NewContentImportHandler 创建内容导入处理器
func NewContentImportHandler(
	db *gorm.DB,
	courseService *service.CourseService,
	questionService *service.QuestionService,
	materialService *service.MaterialService,
) *ContentImportHandler {
	return &ContentImportHandler{
		db:              db,
		courseService:   courseService,
		questionService: questionService,
		materialService: materialService,
	}
}

// RegisterRoutes 注册路由
func (h *ContentImportHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	admin := e.Group("/api/v1/admin/content/import", authMiddleware)

	// MCP 生成内容导入
	admin.POST("/course-lesson", h.ImportCourseLesson)
	admin.POST("/questions", h.ImportQuestions)
	admin.POST("/materials", h.ImportMaterials)
}

// RegisterInternalRoutes 注册内部路由（开发环境，无需认证）
// 用于 MCP 内容生成器脚本直接导入内容
func (h *ContentImportHandler) RegisterInternalRoutes(e *echo.Echo) {
	internal := e.Group("/api/v1/internal/content/import")

	// 内部导入接口（仅开发环境使用）
	internal.POST("/course-lesson", h.ImportCourseLesson)
	internal.POST("/questions", h.ImportQuestions)
	internal.POST("/materials", h.ImportMaterials)
	internal.POST("/category-tree", h.ImportCategoryTree)
}

// =====================================================
// 课程教学内容导入
// =====================================================

// CourseLessonImportRequest 课程教学内容导入请求（支持 MCP v4.0 完整结构）
type CourseLessonImportRequest struct {
	// 元数据（来自 MCP 生成器）
	Metadata *CourseLessonMetadata `json:"_metadata"`

	// 基础信息
	ChapterTitle       string `json:"chapter_title" validate:"required"`
	Subject            string `json:"subject" validate:"required"`
	KnowledgePoint     string `json:"knowledge_point"`
	EstimatedDuration  string `json:"estimated_duration,omitempty"`
	DifficultyLevel    string `json:"difficulty_level,omitempty"`
	WordCountTarget    string `json:"word_count_target,omitempty"`

	// 考情分析（500字）
	ExamAnalysis *ExamAnalysisContent `json:"exam_analysis,omitempty"`

	// 课程内容主体（包含多个子模块）
	LessonContent    map[string]interface{} `json:"lesson_content" validate:"required"`
	LessonSections   []LessonSection        `json:"lesson_sections"`
	PracticeProblems []PracticeProblem      `json:"practice_problems"`

	// 课后作业（300字）
	Homework *HomeworkContent `json:"homework,omitempty"`

	// 补充材料
	SupplementaryMaterials *SupplementaryMaterials `json:"supplementary_materials,omitempty"`
}

// ExamAnalysisContent 考情分析内容
type ExamAnalysisContent struct {
	Description     string   `json:"description"`      // 考情分析（500字）
	Frequency       string   `json:"frequency"`        // 考查频率
	ScoreWeight     string   `json:"score_weight"`     // 分值占比
	DifficultyTrend string   `json:"difficulty_trend"` // 难度趋势
	ExamForms       []string `json:"exam_forms"`       // 考查形式
	KeyPatterns     []string `json:"key_patterns"`     // 关键模式
	RecentTrends    string   `json:"recent_trends"`    // 近年趋势
}

// HomeworkContent 课后作业内容
type HomeworkContent struct {
	Required          []string `json:"required"`           // 必做作业
	Optional          []string `json:"optional"`           // 选做作业
	ThinkingQuestions []string `json:"thinking_questions"` // 思考题
	Preview           string   `json:"preview"`            // 预习任务
}

// SupplementaryMaterials 补充材料
type SupplementaryMaterials struct {
	VocabularyList string `json:"vocabulary_list"` // 词汇列表
	MindMap        string `json:"mind_map"`        // 思维导图
	QuickReference string `json:"quick_reference"` // 速查口诀
	ErrorCollection string `json:"error_collection"` // 错误汇总
}

// CourseLessonMetadata MCP 生成的课程元数据
type CourseLessonMetadata struct {
	GeneratedAt  string `json:"generated_at"`
	LineNumber   int    `json:"line_number"`
	LessonOrder  int    `json:"lesson_order"`    // 课程全局顺序
	Section      string `json:"section"`         // 所属章节，如 "1.1 言语理解与表达课程"
	Subsection   string `json:"subsection"`      // 所属小节，如 "实词辨析精讲（20课时）"
	ParentTitle  string `json:"parent_title"`    // 父级课程标题
	IsSubLesson  bool   `json:"is_sub_lesson"`   // 是否为子课程
}

// LessonSection 课程小节（支持 MCP v4.0 完整结构）
type LessonSection struct {
	Order       int                      `json:"order"`
	Title       string                   `json:"title"`
	Content     string                   `json:"content"`
	SectionType string                   `json:"section_type"` // intro/theory/method/example/warning/drill/summary
	Duration    string                   `json:"duration,omitempty"`
	KeyPoints   []string                 `json:"key_points,omitempty"`
	ConceptMap  string                   `json:"concept_map,omitempty"`
	Flowchart   string                   `json:"flowchart,omitempty"`

	// 例题（section_type="example"时）
	Examples []map[string]interface{} `json:"examples,omitempty"`

	// 易错陷阱（section_type="warning"时）
	Traps []map[string]interface{} `json:"traps,omitempty"`

	// 真题演练（section_type="drill"时）
	RealExamQuestions []map[string]interface{} `json:"real_exam_questions,omitempty"`

	// 思维导图（section_type="summary"时）
	MindMap           string   `json:"mind_map,omitempty"`
	KeyTakeaways      []string `json:"key_takeaways,omitempty"`
	NextLessonPreview string   `json:"next_lesson_preview,omitempty"`
}

// PracticeProblem 练习题（支持 MCP v4.0 完整结构）
type PracticeProblem struct {
	Order             int      `json:"order"`
	Difficulty        string   `json:"difficulty,omitempty"`        // 难度星级
	DifficultyLevel   string   `json:"difficulty_level,omitempty"`  // 难度等级：基础/中等/较难/困难
	Problem           string   `json:"problem"`
	Options           []string `json:"options"`
	Answer            string   `json:"answer"`
	Analysis          string   `json:"analysis"`
	KnowledgePoint    string   `json:"knowledge_point,omitempty"`
	TimeSuggestion    string   `json:"time_suggestion,omitempty"`
	SimilarType       string   `json:"similar_type,omitempty"`
	ErrorAnalysis     string   `json:"error_analysis,omitempty"`
	AdvancedTechnique string   `json:"advanced_technique,omitempty"`
}

// ImportCourseLesson 导入课程教学内容
// @Summary 导入 MCP 生成的课程教学内容
// @Tags ContentImport
// @Accept json
// @Param request body CourseLessonImportRequest true "课程内容"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/content/import/course-lesson [post]
func (h *ContentImportHandler) ImportCourseLesson(c echo.Context) error {
	var req CourseLessonImportRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	// 1. 根据元数据构建完整的分类层级
	// 层级结构：Subject(行测) -> Section(1.1 言语理解) -> Subsection(实词辨析精讲)
	category, err := h.findOrCreateCategoryHierarchy(req.Subject, req.Metadata)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建分类失败: " + err.Error(),
		})
	}

	// 2. 查找或创建课程（使用 Subsection 或 ParentTitle 作为课程标题）
	courseTitle := h.getCourseTitle(req)
	course, err := h.findOrCreateCourse(category.ID, courseTitle, req.Subject)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建课程失败: " + err.Error(),
		})
	}

	// 3. 创建课程章节并保存内容
	chapter, err := h.createChapterWithContent(course.ID, req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建章节失败: " + err.Error(),
		})
	}

	// 4. 如果有练习题，创建关联题目
	questionCount := 0
	if len(req.PracticeProblems) > 0 {
		questionCount, err = h.createPracticeQuestions(category.ID, req.PracticeProblems, req.ChapterTitle)
		if err != nil {
			// 不影响主流程，只记录错误
			c.Logger().Warnf("创建练习题失败: %v", err)
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "课程内容导入成功",
		"data": map[string]interface{}{
			"course_id":      course.ID,
			"chapter_id":     chapter.ID,
			"category_id":    category.ID,
			"question_count": questionCount,
			"lesson_order":   h.getLessonOrder(req),
		},
	})
}

// getCourseTitle 获取课程标题
func (h *ContentImportHandler) getCourseTitle(req CourseLessonImportRequest) string {
	if req.Metadata != nil {
		// 如果是子课程，使用父级标题作为课程名；否则使用 Subsection
		if req.Metadata.IsSubLesson && req.Metadata.ParentTitle != "" {
			return req.Metadata.ParentTitle
		}
		if req.Metadata.Subsection != "" {
			return req.Metadata.Subsection
		}
	}
	return req.ChapterTitle
}

// getLessonOrder 获取课程顺序
func (h *ContentImportHandler) getLessonOrder(req CourseLessonImportRequest) int {
	if req.Metadata != nil && req.Metadata.LessonOrder > 0 {
		return req.Metadata.LessonOrder
	}
	return 0
}

// findOrCreateCategoryHierarchy 创建分类层级
func (h *ContentImportHandler) findOrCreateCategoryHierarchy(subject string, metadata *CourseLessonMetadata) (*model.CourseCategory, error) {
	// 第一级：科目分类 (xingce -> 行测)
	subjectName := getSubjectName(subject)
	rootCategory, err := h.findOrCreateCategoryByCode(subject, subjectName, nil)
	if err != nil {
		return nil, err
	}

	if metadata == nil || metadata.Section == "" {
		return rootCategory, nil
	}

	// 第二级：章节分类 (1.1 言语理解与表达课程)
	sectionCode := generateCategoryCode(metadata.Section)
	sectionCategory, err := h.findOrCreateCategoryByCode(sectionCode, metadata.Section, &rootCategory.ID)
	if err != nil {
		return nil, err
	}

	if metadata.Subsection == "" {
		return sectionCategory, nil
	}

	// 第三级：小节分类 (实词辨析精讲)
	subsectionCode := generateCategoryCode(metadata.Subsection)
	subsectionCategory, err := h.findOrCreateCategoryByCode(subsectionCode, metadata.Subsection, &sectionCategory.ID)
	if err != nil {
		return nil, err
	}

	return subsectionCategory, nil
}

// findOrCreateCategoryByCode 根据代码查找或创建分类
func (h *ContentImportHandler) findOrCreateCategoryByCode(code, name string, parentID *uint) (*model.CourseCategory, error) {
	var category model.CourseCategory
	result := h.db.Where("code = ?", code).First(&category)
	if result.Error == nil {
		return &category, nil
	}

	// 计算层级
	level := 1
	path := ""
	if parentID != nil {
		var parent model.CourseCategory
		if err := h.db.First(&parent, *parentID).Error; err == nil {
			level = parent.Level + 1
			if parent.Path != "" {
				path = parent.Path + "/" + fmt.Sprint(*parentID)
			} else {
				path = fmt.Sprint(*parentID)
			}
		}
	}

	category = model.CourseCategory{
		ParentID: parentID,
		Name:     name,
		Code:     code,
		IsActive: true,
		Level:    level,
		Path:     path,
	}
	if err := h.db.Create(&category).Error; err != nil {
		return nil, err
	}

	return &category, nil
}

// 查找或创建分类
func (h *ContentImportHandler) findOrCreateCategory(subject, title string) (*model.CourseCategory, error) {
	// 根据 subject 映射到分类代码
	subjectCode := subject
	subjectName := getSubjectName(subject)

	var category model.CourseCategory
	result := h.db.Where("code = ?", subjectCode).First(&category)
	if result.Error == nil {
		return &category, nil
	}

	// 创建新分类
	category = model.CourseCategory{
		Name:     subjectName,
		Code:     subjectCode,
		Subject:  subject,
		IsActive: true,
		Level:    1,
	}
	if err := h.db.Create(&category).Error; err != nil {
		return nil, err
	}

	return &category, nil
}

// 查找或创建课程
func (h *ContentImportHandler) findOrCreateCourse(categoryID uint, title, subject string) (*model.Course, error) {
	var course model.Course
	result := h.db.Where("category_id = ? AND title = ?", categoryID, title).First(&course)
	if result.Error == nil {
		return &course, nil
	}

	// 创建新课程
	now := time.Now()
	course = model.Course{
		CategoryID:  categoryID,
		Title:       title,
		ContentType: model.CourseContentArticle,
		Difficulty:  model.CourseDifficultyBasic,
		IsFree:      true,
		Status:      model.CourseStatusPublished,
		PublishedAt: &now,
	}
	if err := h.db.Create(&course).Error; err != nil {
		return nil, err
	}

	return &course, nil
}

// 创建章节并保存内容（支持 MCP v4.0 完整 13 模块结构）
func (h *ContentImportHandler) createChapterWithContent(courseID uint, req CourseLessonImportRequest) (*model.CourseChapter, error) {
	// 构建完整的内容 JSON（用于存储原始数据）
	fullContentJSON, err := buildFullContentJSON(req)
	if err != nil {
		return nil, fmt.Errorf("构建内容JSON失败: %w", err)
	}

	// 构建富文本内容（用于展示）
	contentTextJSON, _ := serializeToJSON(req.LessonContent)
	fullContent := buildFullContent(contentTextJSON, req.LessonSections)

	// 计算字数
	wordCount := countContentWords(fullContent)

	// 提取考情分析
	examAnalysis := ""
	if req.ExamAnalysis != nil {
		examAnalysis = req.ExamAnalysis.Description
	}

	// 计算排序顺序和层级
	sortOrder, lessonOrder, level, parentID := h.calculateChapterOrder(courseID, req)

	// 检查章节是否已存在（根据标题去重）
	var existingChapter model.CourseChapter
	if err := h.db.Where("course_id = ? AND title = ?", courseID, req.ChapterTitle).First(&existingChapter).Error; err == nil {
		// 章节已存在，更新内容
		existingChapter.ContentText = fullContent
		existingChapter.ContentJSON = model.JSONRawMessage(fullContentJSON)
		existingChapter.ExamAnalysis = examAnalysis
		existingChapter.WordCount = wordCount
		existingChapter.LessonOrder = lessonOrder
		if err := h.db.Save(&existingChapter).Error; err != nil {
			return nil, err
		}

		// 更新模块
		if err := h.updateChapterModules(existingChapter.ID, req); err != nil {
			// 不影响主流程
			fmt.Printf("更新模块失败: %v\n", err)
		}

		return &existingChapter, nil
	}

	// 创建新章节
	chapter := &model.CourseChapter{
		CourseID:     courseID,
		ParentID:     parentID,
		Title:        req.ChapterTitle,
		ContentType:  model.CourseContentArticle,
		ContentText:  fullContent,
		ContentJSON:  model.JSONRawMessage(fullContentJSON),
		ExamAnalysis: examAnalysis,
		WordCount:    wordCount,
		SortOrder:    sortOrder,
		LessonOrder:  lessonOrder,
		Level:        level,
	}

	if err := h.db.Create(chapter).Error; err != nil {
		return nil, err
	}

	// 创建课程模块
	if err := h.createChapterModules(chapter.ID, req); err != nil {
		// 不影响主流程
		fmt.Printf("创建模块失败: %v\n", err)
	}

	// 更新课程章节计数
	h.db.Model(&model.Course{}).Where("id = ?", courseID).UpdateColumn("chapter_count", gorm.Expr("chapter_count + 1"))

	return chapter, nil
}

// calculateChapterOrder 计算章节的排序和层级
func (h *ContentImportHandler) calculateChapterOrder(courseID uint, req CourseLessonImportRequest) (sortOrder, lessonOrder, level int, parentID *uint) {
	sortOrder = 0
	lessonOrder = 0
	level = 1

	if req.Metadata != nil {
		if req.Metadata.LessonOrder > 0 {
			sortOrder = req.Metadata.LessonOrder
			lessonOrder = req.Metadata.LessonOrder
		}
		// 如果是子课程，需要设置父章节
		if req.Metadata.IsSubLesson && req.Metadata.ParentTitle != "" {
			var parentChapter model.CourseChapter
			if err := h.db.Where("course_id = ? AND title = ?", courseID, req.Metadata.ParentTitle).First(&parentChapter).Error; err == nil {
				parentID = &parentChapter.ID
				level = 2
			}
		}
	}

	// 如果没有元数据顺序，使用当前章节数量+1
	if sortOrder == 0 {
		var count int64
		h.db.Model(&model.CourseChapter{}).Where("course_id = ?", courseID).Count(&count)
		sortOrder = int(count + 1)
	}

	return sortOrder, lessonOrder, level, parentID
}

// createChapterModules 创建章节的所有模块
func (h *ContentImportHandler) createChapterModules(chapterID uint, req CourseLessonImportRequest) error {
	var modules []model.CourseLessonModule

	// 1. 考情分析模块
	if req.ExamAnalysis != nil {
		examJSON, _ := json.Marshal(req.ExamAnalysis)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeExamAnalysis,
			Title:       "考情分析",
			ContentJSON: model.JSONRawMessage(examJSON),
			ContentText: req.ExamAnalysis.Description,
			WordCount:   len([]rune(req.ExamAnalysis.Description)),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeExamAnalysis],
		})
	}

	// 2. 从 lesson_content 提取模块
	if req.LessonContent != nil {
		// 课程导入
		if intro, ok := req.LessonContent["introduction"].(string); ok && intro != "" {
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeIntroduction,
				Title:       "课程导入",
				ContentText: intro,
				WordCount:   len([]rune(intro)),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeIntroduction],
			})
		}

		// 核心概念
		if concepts, ok := req.LessonContent["core_concepts"]; ok {
			conceptsJSON, _ := json.Marshal(concepts)
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeConcepts,
				Title:       "核心概念",
				ContentJSON: model.JSONRawMessage(conceptsJSON),
				WordCount:   countJSONWords(conceptsJSON),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeConcepts],
			})
		}

		// 方法步骤
		if methods, ok := req.LessonContent["method_steps"]; ok {
			methodsJSON, _ := json.Marshal(methods)
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeMethods,
				Title:       "方法步骤",
				ContentJSON: model.JSONRawMessage(methodsJSON),
				WordCount:   countJSONWords(methodsJSON),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeMethods],
			})
		}

		// 记忆口诀
		if formulas, ok := req.LessonContent["formulas"]; ok {
			formulasJSON, _ := json.Marshal(formulas)
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeFormulas,
				Title:       "记忆口诀",
				ContentJSON: model.JSONRawMessage(formulasJSON),
				WordCount:   countJSONWords(formulasJSON),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeFormulas],
			})
		}

		// 易错点
		if mistakes, ok := req.LessonContent["common_mistakes"]; ok {
			mistakesJSON, _ := json.Marshal(mistakes)
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeMistakes,
				Title:       "易错陷阱",
				ContentJSON: model.JSONRawMessage(mistakesJSON),
				WordCount:   countJSONWords(mistakesJSON),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeMistakes],
			})
		}

		// 高频词汇
		if vocab, ok := req.LessonContent["vocabulary_accumulation"]; ok {
			vocabJSON, _ := json.Marshal(vocab)
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeVocabulary,
				Title:       "高频词汇",
				ContentJSON: model.JSONRawMessage(vocabJSON),
				WordCount:   countJSONWords(vocabJSON),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeVocabulary],
			})
		}

		// 拓展知识
		if ext, ok := req.LessonContent["extension_knowledge"].(string); ok && ext != "" {
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeExtension,
				Title:       "拓展知识",
				ContentText: ext,
				WordCount:   len([]rune(ext)),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeExtension],
			})
		}

		// 总结要点
		if summary, ok := req.LessonContent["summary_points"]; ok {
			summaryJSON, _ := json.Marshal(summary)
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeSummary,
				Title:       "课程总结",
				ContentJSON: model.JSONRawMessage(summaryJSON),
				WordCount:   countJSONWords(summaryJSON),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeSummary],
			})
		}

		// 思维导图 (Mermaid 格式)
		if mindMap, ok := req.LessonContent["mind_map_mermaid"].(string); ok && mindMap != "" {
			mindMapJSON, _ := json.Marshal(map[string]string{"mermaid": mindMap})
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeMindMap,
				Title:       "思维导图",
				ContentJSON: model.JSONRawMessage(mindMapJSON),
				ContentText: mindMap,
				WordCount:   len([]rune(mindMap)),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeMindMap],
			})
		}

		// 快速笔记
		if quickNotes, ok := req.LessonContent["quick_notes"]; ok {
			quickNotesJSON, _ := json.Marshal(quickNotes)
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeQuickNotes,
				Title:       "快速笔记",
				ContentJSON: model.JSONRawMessage(quickNotesJSON),
				WordCount:   countJSONWords(quickNotesJSON),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeQuickNotes],
			})
		}
	}

	// 3. 从 lesson_sections 提取模块
	for _, section := range req.LessonSections {
		var moduleType model.LessonModuleType
		switch section.SectionType {
		case "example":
			moduleType = model.ModuleTypeExamples
		case "drill":
			moduleType = model.ModuleTypeDrills
		default:
			continue // 跳过其他类型
		}

		sectionJSON, _ := json.Marshal(section)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  moduleType,
			Title:       section.Title,
			ContentJSON: model.JSONRawMessage(sectionJSON),
			ContentText: section.Content,
			WordCount:   len([]rune(section.Content)),
			SortOrder:   model.ModuleTypeSortOrder[moduleType],
		})
	}

	// 4. 课后作业模块
	if req.Homework != nil {
		homeworkJSON, _ := json.Marshal(req.Homework)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeHomework,
			Title:       "课后作业",
			ContentJSON: model.JSONRawMessage(homeworkJSON),
			WordCount:   countJSONWords(homeworkJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeHomework],
		})
	}

	// 批量创建模块
	if len(modules) > 0 {
		return h.db.Create(&modules).Error
	}

	return nil
}

// updateChapterModules 更新章节模块（先删后建）
func (h *ContentImportHandler) updateChapterModules(chapterID uint, req CourseLessonImportRequest) error {
	// 删除旧模块
	if err := h.db.Where("chapter_id = ?", chapterID).Delete(&model.CourseLessonModule{}).Error; err != nil {
		return err
	}

	// 创建新模块
	return h.createChapterModules(chapterID, req)
}

// buildFullContentJSON 构建完整的内容 JSON
func buildFullContentJSON(req CourseLessonImportRequest) ([]byte, error) {
	fullContent := map[string]interface{}{
		"chapter_title":   req.ChapterTitle,
		"subject":         req.Subject,
		"knowledge_point": req.KnowledgePoint,
	}

	if req.ExamAnalysis != nil {
		fullContent["exam_analysis"] = req.ExamAnalysis
	}
	if req.LessonContent != nil {
		fullContent["lesson_content"] = req.LessonContent
	}
	if len(req.LessonSections) > 0 {
		fullContent["lesson_sections"] = req.LessonSections
	}
	if len(req.PracticeProblems) > 0 {
		fullContent["practice_problems"] = req.PracticeProblems
	}
	if req.Homework != nil {
		fullContent["homework"] = req.Homework
	}
	if req.SupplementaryMaterials != nil {
		fullContent["supplementary_materials"] = req.SupplementaryMaterials
	}

	return json.Marshal(fullContent)
}

// countContentWords 计算内容字数
func countContentWords(content string) int {
	// 计算中文字符数
	chineseCount := 0
	for _, r := range content {
		if r >= 0x4e00 && r <= 0x9fff {
			chineseCount++
		}
	}
	return chineseCount
}

// countJSONWords 计算 JSON 内容中的字数
func countJSONWords(data []byte) int {
	// 简单实现：统计 JSON 字符串中的中文字符
	return countContentWords(string(data))
}

// 创建练习题
func (h *ContentImportHandler) createPracticeQuestions(categoryID uint, problems []PracticeProblem, source string) (int, error) {
	var questions []model.Question

	for _, p := range problems {
		options := make(model.QuestionOptions, len(p.Options))
		for i, opt := range p.Options {
			key := string(rune('A' + i))
			content := opt
			// 尝试解析 "A. xxx" 格式
			if len(opt) > 2 && opt[1] == '.' {
				key = string(opt[0])
				content = opt[3:]
			}
			options[i] = model.QuestionOption{Key: key, Content: content}
		}

		// 解析难度（支持字符串和数字格式）
		difficulty := parseDifficulty(p.Difficulty, p.DifficultyLevel)

		question := model.Question{
			CategoryID:   categoryID,
			QuestionType: model.QuestionTypeSingleChoice,
			Content:      p.Problem,
			Options:      options,
			Answer:       p.Answer,
			Analysis:     p.Analysis,
			Difficulty:   difficulty,
			SourceType:   model.QuestionSourceOriginal,
			Status:       model.QuestionStatusPublished,
		}
		questions = append(questions, question)
	}

	if err := h.db.Create(&questions).Error; err != nil {
		return 0, err
	}

	return len(questions), nil
}

// parseDifficulty 解析难度值
func parseDifficulty(difficultyStr string, difficultyLevel string) int {
	// 优先使用 difficultyLevel
	switch difficultyLevel {
	case "基础":
		return 1
	case "中等":
		return 3
	case "较难":
		return 4
	case "困难":
		return 5
	}

	// 尝试从难度星级解析（如 "★★☆☆☆"）
	if difficultyStr != "" {
		starCount := 0
		for _, r := range difficultyStr {
			if r == '★' {
				starCount++
			}
		}
		if starCount > 0 {
			return starCount
		}
	}

	// 默认中等难度
	return 3
}

// =====================================================
// 题目内容导入
// =====================================================

// QuestionsImportRequest 题目导入请求
type QuestionsImportRequest struct {
	CategoryName    string            `json:"category_name"`
	SubCategoryName string            `json:"sub_category_name"`
	Questions       []QuestionImport  `json:"questions" validate:"required"`
}

// QuestionImport 单个题目导入
type QuestionImport struct {
	Content         string                   `json:"content" validate:"required"`
	Options         []model.QuestionOption   `json:"options"`
	Answer          string                   `json:"answer" validate:"required"`
	Analysis        string                   `json:"analysis"`
	Difficulty      int                      `json:"difficulty"`
	QuestionType    string                   `json:"question_type"`
	SourceType      string                   `json:"source_type"`
	Source          string                   `json:"source"`
	Tags            []string                 `json:"tags"`
	CategoryName    string                   `json:"category_name"`
	SubCategoryName string                   `json:"sub_category_name"`
}

// ImportQuestions 批量导入题目
// @Summary 批量导入 MCP 生成的题目
// @Tags ContentImport
// @Accept json
// @Param request body QuestionsImportRequest true "题目数据"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/content/import/questions [post]
func (h *ContentImportHandler) ImportQuestions(c echo.Context) error {
	var req QuestionsImportRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	if len(req.Questions) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "题目列表不能为空",
		})
	}

	// 查找或创建分类
	categoryID, err := h.findOrCreateQuestionCategory(req.CategoryName, req.SubCategoryName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建分类失败: " + err.Error(),
		})
	}

	// 批量创建题目
	var questions []model.Question
	for _, q := range req.Questions {
		questionType := model.QuestionTypeSingleChoice
		if q.QuestionType != "" {
			questionType = model.QuestionType(q.QuestionType)
		}

		sourceType := model.QuestionSourceOriginal
		if q.SourceType != "" {
			sourceType = model.QuestionSourceType(q.SourceType)
		}

		question := model.Question{
			CategoryID:   categoryID,
			QuestionType: questionType,
			Content:      q.Content,
			Options:      q.Options,
			Answer:       q.Answer,
			Analysis:     q.Analysis,
			Difficulty:   q.Difficulty,
			SourceType:   sourceType,
			Tags:         q.Tags,
			Status:       model.QuestionStatusPublished,
		}
		questions = append(questions, question)
	}

	if err := h.db.Create(&questions).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建题目失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "题目导入成功",
		"data": map[string]interface{}{
			"count":       len(questions),
			"category_id": categoryID,
		},
	})
}

// 查找或创建题目分类
func (h *ContentImportHandler) findOrCreateQuestionCategory(categoryName, subCategoryName string) (uint, error) {
	if categoryName == "" {
		categoryName = "未分类"
	}

	// 先查找
	var category model.CourseCategory
	query := h.db.Where("name = ?", categoryName)
	if subCategoryName != "" {
		query = query.Where("description LIKE ?", "%"+subCategoryName+"%")
	}
	
	if err := query.First(&category).Error; err == nil {
		return category.ID, nil
	}

	// 创建新分类
	code := generateCategoryCode(categoryName)
	category = model.CourseCategory{
		Name:        categoryName,
		Code:        code,
		Description: subCategoryName,
		IsActive:    true,
		Level:       1,
	}
	if err := h.db.Create(&category).Error; err != nil {
		return 0, err
	}

	return category.ID, nil
}

// =====================================================
// 素材内容导入
// =====================================================

// MaterialsImportRequest 素材导入请求
type MaterialsImportRequest struct {
	CategoryName string           `json:"category_name"`
	Type         string           `json:"type"`
	Items        []MaterialImport `json:"items" validate:"required"`
}

// MaterialImport 单个素材导入
type MaterialImport struct {
	Title       string   `json:"title" validate:"required"`
	Content     string   `json:"content" validate:"required"`
	Source      string   `json:"source"`
	Type        string   `json:"type"`
	SubType     string   `json:"sub_type"`
	ThemeTopics []string `json:"theme_topics"`
	Usage       string   `json:"usage"`
	Tags        []string `json:"tags"`
	Subject     string   `json:"subject"`
}

// ImportMaterials 批量导入素材
// @Summary 批量导入 MCP 生成的素材
// @Tags ContentImport
// @Accept json
// @Param request body MaterialsImportRequest true "素材数据"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/content/import/materials [post]
func (h *ContentImportHandler) ImportMaterials(c echo.Context) error {
	var req MaterialsImportRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	if len(req.Items) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "素材列表不能为空",
		})
	}

	// 查找或创建素材分类
	categoryID, err := h.findOrCreateMaterialCategory(req.CategoryName, req.Type)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建分类失败: " + err.Error(),
		})
	}

	// 批量创建素材
	var materials []model.LearningMaterial
	for _, m := range req.Items {
		materialType := model.MaterialType(req.Type)
		if m.Type != "" {
			materialType = model.MaterialType(m.Type)
		}

		subType := model.MaterialSubType(m.SubType)

		material := model.LearningMaterial{
			CategoryID:  categoryID,
			Type:        materialType,
			SubType:     subType,
			Title:       m.Title,
			Content:     m.Content,
			Source:      m.Source,
			ThemeTopics: m.ThemeTopics,
			Usage:       m.Usage,
			Tags:        m.Tags,
			Subject:     m.Subject,
			IsFree:      true,
			Status:      model.MaterialStatusPublished,
		}
		materials = append(materials, material)
	}

	if err := h.db.Create(&materials).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建素材失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "素材导入成功",
		"data": map[string]interface{}{
			"count":       len(materials),
			"category_id": categoryID,
		},
	})
}

// 查找或创建素材分类
func (h *ContentImportHandler) findOrCreateMaterialCategory(categoryName, materialType string) (uint, error) {
	if categoryName == "" {
		categoryName = "未分类素材"
	}

	// 先查找
	var category model.MaterialCategory
	if err := h.db.Where("name = ?", categoryName).First(&category).Error; err == nil {
		return category.ID, nil
	}

	// 创建新分类
	code := generateCategoryCode(categoryName)
	category = model.MaterialCategory{
		Name:         categoryName,
		Code:         code,
		MaterialType: model.MaterialType(materialType),
		IsActive:     true,
		Level:        1,
	}
	if err := h.db.Create(&category).Error; err != nil {
		return 0, err
	}

	return category.ID, nil
}

// =====================================================
// 辅助函数
// =====================================================

func getSubjectName(subject string) string {
	names := map[string]string{
		"xingce":  "行测",
		"shenlun": "申论",
		"mianshi": "面试",
		"gongji":  "公共基础知识",
	}
	if name, ok := names[subject]; ok {
		return name
	}
	return subject
}

func serializeToJSON(data interface{}) (string, error) {
	bytes, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func buildFullContent(lessonContent string, sections []LessonSection) string {
	// 简单拼接，实际可以根据需要格式化
	content := lessonContent + "\n\n"
	for _, s := range sections {
		content += "## " + s.Title + "\n\n"
		content += s.Content + "\n\n"
	}
	return content
}

func generateCategoryCode(name string) string {
	hash := md5.Sum([]byte(name))
	return fmt.Sprintf("cat_%x", hash[:4])
}

// =====================================================
// 课程分类树导入
// =====================================================

// CategoryTreeImportRequest 分类树导入请求
type CategoryTreeImportRequest struct {
	Categories []CategoryImport `json:"categories" validate:"required"`
}

// CategoryImport 单个分类导入数据
type CategoryImport struct {
	Code               string   `json:"code" validate:"required"`
	Name               string   `json:"name" validate:"required"`
	Level              int      `json:"level" validate:"required"`
	ParentCode         string   `json:"parent_code,omitempty"`
	Subject            string   `json:"subject,omitempty"`
	TaskType           string   `json:"task_type,omitempty"`
	SortOrder          int      `json:"sort_order"`
	EstimatedDuration  string   `json:"estimated_duration,omitempty"`
	Description        string   `json:"description,omitempty"`
	LongDescription    string   `json:"long_description,omitempty"`
	Features           []string `json:"features,omitempty"`
	LearningObjectives []string `json:"learning_objectives,omitempty"`
	Keywords           []string `json:"keywords,omitempty"`
	Difficulty         string   `json:"difficulty,omitempty"`
	Icon               string   `json:"icon,omitempty"`
	Color              string   `json:"color,omitempty"`
}

// ImportCategoryTree 批量导入课程分类树
// @Summary 批量导入课程分类树（从 todolist.md 解析）
// @Tags ContentImport
// @Accept json
// @Param request body CategoryTreeImportRequest true "分类树数据"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/internal/content/import/category-tree [post]
func (h *ContentImportHandler) ImportCategoryTree(c echo.Context) error {
	var req CategoryTreeImportRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	if len(req.Categories) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "分类列表不能为空",
		})
	}

	// 用于存储已创建的分类（code -> ID）
	codeToID := make(map[string]uint)
	var importedCount int
	var updatedCount int
	var errors []string

	// 按层级排序处理（确保父分类先创建）
	// 层级从小到大处理
	for level := 1; level <= 6; level++ {
		for _, cat := range req.Categories {
			if cat.Level != level {
				continue
			}

			// 查找父分类 ID
			var parentID *uint
			if cat.ParentCode != "" {
				if pid, ok := codeToID[cat.ParentCode]; ok {
					parentID = &pid
				} else {
					// 尝试从数据库查找父分类
					var parent model.CourseCategory
					if err := h.db.Where("code = ?", cat.ParentCode).First(&parent).Error; err == nil {
						parentID = &parent.ID
						codeToID[cat.ParentCode] = parent.ID
					}
				}
			}

			// 检查分类是否已存在
			var existing model.CourseCategory
			err := h.db.Where("code = ?", cat.Code).First(&existing).Error

			if err == nil {
				// 分类已存在，更新它
				updates := map[string]interface{}{
					"name":                cat.Name,
					"level":               cat.Level,
					"sort_order":          cat.SortOrder,
					"description":         cat.Description,
					"long_description":    cat.LongDescription,
					"features":            model.JSONStringArray(cat.Features),
					"learning_objectives": model.JSONStringArray(cat.LearningObjectives),
					"keywords":            model.JSONStringArray(cat.Keywords),
					"difficulty":          cat.Difficulty,
					"estimated_duration":  cat.EstimatedDuration,
				}
				if cat.Icon != "" {
					updates["icon"] = cat.Icon
				}
				if cat.Color != "" {
					updates["color"] = cat.Color
				}
				if cat.Subject != "" {
					updates["subject"] = cat.Subject
				}
				if parentID != nil {
					updates["parent_id"] = parentID
				}

				if err := h.db.Model(&existing).Updates(updates).Error; err != nil {
					errors = append(errors, fmt.Sprintf("更新分类 %s 失败: %v", cat.Code, err))
					continue
				}
				codeToID[cat.Code] = existing.ID
				updatedCount++
			} else {
				// 创建新分类
				path := ""
				if parentID != nil {
					var parent model.CourseCategory
					if err := h.db.First(&parent, *parentID).Error; err == nil {
						if parent.Path != "" {
							path = parent.Path + "/" + fmt.Sprint(*parentID)
						} else {
							path = fmt.Sprint(*parentID)
						}
					}
				}

				newCategory := model.CourseCategory{
					Code:               cat.Code,
					Name:               cat.Name,
					ParentID:           parentID,
					Level:              cat.Level,
					Path:               path,
					Subject:            cat.Subject,
					SortOrder:          cat.SortOrder,
					Description:        cat.Description,
					LongDescription:    cat.LongDescription,
					Features:           cat.Features,
					LearningObjectives: cat.LearningObjectives,
					Keywords:           cat.Keywords,
					Difficulty:         cat.Difficulty,
					EstimatedDuration:  cat.EstimatedDuration,
					Icon:               cat.Icon,
					Color:              cat.Color,
					IsActive:           true,
				}

				if err := h.db.Create(&newCategory).Error; err != nil {
					errors = append(errors, fmt.Sprintf("创建分类 %s 失败: %v", cat.Code, err))
					continue
				}
				codeToID[cat.Code] = newCategory.ID
				importedCount++
			}
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    200,
		"message": "分类树导入完成",
		"data": map[string]interface{}{
			"total":    len(req.Categories),
			"imported": importedCount,
			"updated":  updatedCount,
			"errors":   errors,
		},
	})
}
