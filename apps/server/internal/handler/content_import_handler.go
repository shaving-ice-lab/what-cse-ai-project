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
}

// =====================================================
// 课程教学内容导入
// =====================================================

// CourseLessonImportRequest 课程教学内容导入请求
type CourseLessonImportRequest struct {
	// 元数据（来自 MCP 生成器）
	Metadata *CourseLessonMetadata `json:"_metadata"`

	ChapterTitle     string                 `json:"chapter_title" validate:"required"`
	Subject          string                 `json:"subject" validate:"required"`
	KnowledgePoint   string                 `json:"knowledge_point"`
	LessonContent    map[string]interface{} `json:"lesson_content" validate:"required"`
	LessonSections   []LessonSection        `json:"lesson_sections"`
	PracticeProblems []PracticeProblem      `json:"practice_problems"`
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

// LessonSection 课程小节
type LessonSection struct {
	Order       int                      `json:"order"`
	Title       string                   `json:"title"`
	Content     string                   `json:"content"`
	SectionType string                   `json:"section_type"`
	KeyPoints   []string                 `json:"key_points,omitempty"`
	Examples    []map[string]interface{} `json:"examples,omitempty"`
}

// PracticeProblem 练习题
type PracticeProblem struct {
	Order      int      `json:"order"`
	Problem    string   `json:"problem"`
	Options    []string `json:"options"`
	Answer     string   `json:"answer"`
	Analysis   string   `json:"analysis"`
	Difficulty int      `json:"difficulty"`
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

// 创建章节并保存内容
func (h *ContentImportHandler) createChapterWithContent(courseID uint, req CourseLessonImportRequest) (*model.CourseChapter, error) {
	// 检查章节是否已存在（根据标题去重）
	var existingChapter model.CourseChapter
	if err := h.db.Where("course_id = ? AND title = ?", courseID, req.ChapterTitle).First(&existingChapter).Error; err == nil {
		// 章节已存在，更新内容
		contentJSON, _ := serializeToJSON(req.LessonContent)
		fullContent := buildFullContent(contentJSON, req.LessonSections)
		existingChapter.ContentText = fullContent
		if err := h.db.Save(&existingChapter).Error; err != nil {
			return nil, err
		}
		return &existingChapter, nil
	}

	// 序列化 lesson_content 为 JSON 字符串
	contentJSON, err := serializeToJSON(req.LessonContent)
	if err != nil {
		return nil, err
	}

	// 构建完整内容（包含 sections）
	fullContent := buildFullContent(contentJSON, req.LessonSections)

	// 计算排序顺序：优先使用元数据中的顺序
	sortOrder := 0
	level := 1
	var parentID *uint

	if req.Metadata != nil {
		if req.Metadata.LessonOrder > 0 {
			sortOrder = req.Metadata.LessonOrder
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

	chapter := &model.CourseChapter{
		CourseID:    courseID,
		ParentID:    parentID,
		Title:       req.ChapterTitle,
		ContentType: model.CourseContentArticle,
		ContentText: fullContent,
		SortOrder:   sortOrder,
		Level:       level,
	}

	if err := h.db.Create(chapter).Error; err != nil {
		return nil, err
	}

	// 更新课程章节计数
	h.db.Model(&model.Course{}).Where("id = ?", courseID).UpdateColumn("chapter_count", gorm.Expr("chapter_count + 1"))

	return chapter, nil
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

		question := model.Question{
			CategoryID:   categoryID,
			QuestionType: model.QuestionTypeSingleChoice,
			Content:      p.Problem,
			Options:      options,
			Answer:       p.Answer,
			Analysis:     p.Analysis,
			Difficulty:   p.Difficulty,
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
