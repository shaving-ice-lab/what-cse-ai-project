package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrContentImportFailed = errors.New("内容导入失败")
	ErrInvalidFormat       = errors.New("无效的内容格式")
)

// ContentImportService 内容导入服务
// 用于将 LLM 生成的内容自动导入数据库
type ContentImportService struct {
	db            *gorm.DB
	chapterRepo   *repository.CourseChapterRepository
	courseRepo    *repository.CourseRepository
	categoryRepo  *repository.CourseCategoryRepository
	questionRepo  *repository.QuestionRepository
	materialRepo  *repository.MaterialRepository
	aiContentRepo *repository.AIContentRepository
	logger        *zap.Logger
}

// NewContentImportService 创建内容导入服务
func NewContentImportService(
	db *gorm.DB,
	chapterRepo *repository.CourseChapterRepository,
	courseRepo *repository.CourseRepository,
	categoryRepo *repository.CourseCategoryRepository,
	questionRepo *repository.QuestionRepository,
	materialRepo *repository.MaterialRepository,
	aiContentRepo *repository.AIContentRepository,
	logger *zap.Logger,
) *ContentImportService {
	return &ContentImportService{
		db:            db,
		chapterRepo:   chapterRepo,
		courseRepo:    courseRepo,
		categoryRepo:  categoryRepo,
		questionRepo:  questionRepo,
		materialRepo:  materialRepo,
		aiContentRepo: aiContentRepo,
		logger:        logger,
	}
}

// =====================================================
// 课程内容导入
// =====================================================

// ImportCourseContentResult 导入课程内容结果
type ImportCourseContentResult struct {
	ChapterID      uint   `json:"chapter_id"`
	ModulesCreated int    `json:"modules_created"`
	WordCount      int    `json:"word_count"`
	Success        bool   `json:"success"`
	Error          string `json:"error,omitempty"`
}

// ImportCourseContent 导入生成的课程内容到数据库
func (s *ContentImportService) ImportCourseContent(ctx context.Context, chapterID uint, content *model.GeneratedCourseContent) (*ImportCourseContentResult, error) {
	result := &ImportCourseContentResult{ChapterID: chapterID}

	// 1. 获取章节
	chapter, err := s.chapterRepo.GetByID(chapterID)
	if err != nil {
		result.Error = "章节不存在"
		return result, fmt.Errorf("章节不存在: %w", err)
	}

	// 2. 构建完整的内容 JSON
	contentJSON, err := json.Marshal(content)
	if err != nil {
		result.Error = "序列化内容失败"
		return result, fmt.Errorf("%w: %v", ErrContentImportFailed, err)
	}

	// 3. 构建富文本内容
	contentText := s.buildCourseContentText(content)
	wordCount := s.countWords(contentText)

	// 4. 更新章节内容
	updates := map[string]interface{}{
		"content_json": model.JSONRawMessage(contentJSON),
		"content_text": contentText,
		"word_count":   wordCount,
	}

	// 添加考情分析
	if content.ExamAnalysis.Description != "" {
		updates["exam_analysis"] = content.ExamAnalysis.Description
	}

	if err := s.chapterRepo.UpdateFields(chapterID, updates); err != nil {
		result.Error = fmt.Sprintf("更新章节失败: %v", err)
		return result, fmt.Errorf("%w: %v", ErrContentImportFailed, err)
	}

	// 5. 删除旧模块
	if err := s.chapterRepo.DeleteModulesByChapterID(chapterID); err != nil {
		s.logger.Warn("删除旧模块失败", zap.Error(err))
	}

	// 6. 创建新模块
	modules := s.buildCourseModules(chapterID, content)
	if len(modules) > 0 {
		if err := s.chapterRepo.CreateModules(modules); err != nil {
			s.logger.Error("创建模块失败", zap.Error(err))
			result.Error = fmt.Sprintf("创建模块失败: %v", err)
		} else {
			result.ModulesCreated = len(modules)
		}
	}

	// 7. 更新课程章节数（如果需要）
	if chapter.CourseID > 0 {
		s.db.Model(&model.Course{}).Where("id = ?", chapter.CourseID).
			UpdateColumn("chapter_count", gorm.Expr("(SELECT COUNT(*) FROM what_course_chapters WHERE course_id = ? AND deleted_at IS NULL)", chapter.CourseID))
	}

	result.WordCount = wordCount
	result.Success = true
	return result, nil
}

// buildCourseContentText 构建课程富文本内容
func (s *ContentImportService) buildCourseContentText(content *model.GeneratedCourseContent) string {
	var parts []string

	// 标题
	parts = append(parts, fmt.Sprintf("# %s\n", content.ChapterTitle))

	// 考情分析
	if content.ExamAnalysis.Description != "" {
		parts = append(parts, "## 考情分析\n")
		parts = append(parts, content.ExamAnalysis.Description+"\n")
	}

	// 课程导入
	if content.LessonContent.Introduction != "" {
		parts = append(parts, "## 课程导入\n")
		parts = append(parts, content.LessonContent.Introduction+"\n")
	}

	// 核心概念
	if len(content.LessonContent.CoreConcepts) > 0 {
		parts = append(parts, "## 核心概念\n")
		for _, c := range content.LessonContent.CoreConcepts {
			parts = append(parts, fmt.Sprintf("### %s\n", c.Name))
			parts = append(parts, fmt.Sprintf("**定义**：%s\n", c.Definition))
			parts = append(parts, c.DetailedExplanation+"\n")
		}
	}

	// 方法步骤
	if len(content.LessonContent.MethodSteps) > 0 {
		parts = append(parts, "## 方法步骤\n")
		for _, m := range content.LessonContent.MethodSteps {
			parts = append(parts, fmt.Sprintf("### %s\n", m.Title))
			parts = append(parts, m.Content+"\n")
			if m.Tips != "" {
				parts = append(parts, fmt.Sprintf("**技巧**：%s\n", m.Tips))
			}
		}
	}

	// 记忆口诀
	if len(content.LessonContent.Formulas) > 0 {
		parts = append(parts, "## 记忆口诀\n")
		for _, f := range content.LessonContent.Formulas {
			parts = append(parts, fmt.Sprintf("### %s\n", f.Name))
			parts = append(parts, fmt.Sprintf("**口诀**：%s\n", f.Content))
			parts = append(parts, f.DetailedExplanation+"\n")
		}
	}

	// 易错点
	if len(content.LessonContent.CommonMistakes) > 0 {
		parts = append(parts, "## 易错陷阱\n")
		for _, m := range content.LessonContent.CommonMistakes {
			parts = append(parts, fmt.Sprintf("### %s\n", m.Mistake))
			parts = append(parts, m.Reason+"\n")
			parts = append(parts, fmt.Sprintf("**正确做法**：%s\n", m.Correction))
		}
	}

	// 章节内容
	for _, section := range content.LessonSections {
		parts = append(parts, fmt.Sprintf("## %s\n", section.Title))
		parts = append(parts, section.Content+"\n")
	}

	// 练习题目
	if len(content.PracticeProblems) > 0 {
		parts = append(parts, "## 练习题目\n")
		for _, p := range content.PracticeProblems {
			parts = append(parts, fmt.Sprintf("### 题目 %d %s\n", p.Order, p.Difficulty))
			parts = append(parts, p.Problem+"\n")
			for _, opt := range p.Options {
				parts = append(parts, opt+"\n")
			}
			parts = append(parts, fmt.Sprintf("\n**答案**：%s\n", p.Answer))
			parts = append(parts, fmt.Sprintf("**解析**：%s\n", p.Analysis))
		}
	}

	// 课程总结
	if len(content.LessonContent.SummaryPoints) > 0 {
		parts = append(parts, "## 课程总结\n")
		for _, point := range content.LessonContent.SummaryPoints {
			parts = append(parts, "- "+point+"\n")
		}
	}

	// 课后作业
	if len(content.Homework.Required) > 0 {
		parts = append(parts, "## 课后作业\n")
		parts = append(parts, "### 必做作业\n")
		for _, hw := range content.Homework.Required {
			parts = append(parts, "- "+hw+"\n")
		}
	}

	return strings.Join(parts, "\n")
}

// buildCourseModules 构建课程模块
func (s *ContentImportService) buildCourseModules(chapterID uint, content *model.GeneratedCourseContent) []model.CourseLessonModule {
	var modules []model.CourseLessonModule

	// 1. 考情分析模块
	if content.ExamAnalysis.Description != "" {
		examJSON, _ := json.Marshal(content.ExamAnalysis)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeExamAnalysis,
			Title:       "考情分析",
			ContentJSON: model.JSONRawMessage(examJSON),
			ContentText: content.ExamAnalysis.Description,
			WordCount:   s.countWords(content.ExamAnalysis.Description),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeExamAnalysis],
		})
	}

	// 2. 课程导入模块
	if content.LessonContent.Introduction != "" {
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeIntroduction,
			Title:       "课程导入",
			ContentText: content.LessonContent.Introduction,
			WordCount:   s.countWords(content.LessonContent.Introduction),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeIntroduction],
		})
	}

	// 3. 核心概念模块
	if len(content.LessonContent.CoreConcepts) > 0 {
		conceptsJSON, _ := json.Marshal(content.LessonContent.CoreConcepts)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeConcepts,
			Title:       "核心概念",
			ContentJSON: model.JSONRawMessage(conceptsJSON),
			WordCount:   s.countJSONWords(conceptsJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeConcepts],
		})
	}

	// 4. 方法步骤模块
	if len(content.LessonContent.MethodSteps) > 0 {
		methodsJSON, _ := json.Marshal(content.LessonContent.MethodSteps)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeMethods,
			Title:       "方法步骤",
			ContentJSON: model.JSONRawMessage(methodsJSON),
			WordCount:   s.countJSONWords(methodsJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeMethods],
		})
	}

	// 5. 记忆口诀模块
	if len(content.LessonContent.Formulas) > 0 {
		formulasJSON, _ := json.Marshal(content.LessonContent.Formulas)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeFormulas,
			Title:       "记忆口诀",
			ContentJSON: model.JSONRawMessage(formulasJSON),
			WordCount:   s.countJSONWords(formulasJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeFormulas],
		})
	}

	// 6. 易错陷阱模块
	if len(content.LessonContent.CommonMistakes) > 0 {
		mistakesJSON, _ := json.Marshal(content.LessonContent.CommonMistakes)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeMistakes,
			Title:       "易错陷阱",
			ContentJSON: model.JSONRawMessage(mistakesJSON),
			WordCount:   s.countJSONWords(mistakesJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeMistakes],
		})
	}

	// 7. 高频词汇模块
	if content.LessonContent.VocabularyAccum != nil {
		vocabJSON, _ := json.Marshal(content.LessonContent.VocabularyAccum)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeVocabulary,
			Title:       "高频词汇",
			ContentJSON: model.JSONRawMessage(vocabJSON),
			WordCount:   s.countJSONWords(vocabJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeVocabulary],
		})
	}

	// 8. 拓展知识模块
	if content.LessonContent.ExtensionKnow != "" {
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeExtension,
			Title:       "拓展知识",
			ContentText: content.LessonContent.ExtensionKnow,
			WordCount:   s.countWords(content.LessonContent.ExtensionKnow),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeExtension],
		})
	}

	// 9. 课程总结模块
	if len(content.LessonContent.SummaryPoints) > 0 {
		summaryJSON, _ := json.Marshal(content.LessonContent.SummaryPoints)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeSummary,
			Title:       "课程总结",
			ContentJSON: model.JSONRawMessage(summaryJSON),
			WordCount:   s.countJSONWords(summaryJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeSummary],
		})
	}

	// 10. 思维导图模块
	if content.LessonContent.MindMapMermaid != "" {
		mindMapJSON, _ := json.Marshal(map[string]string{"mermaid": content.LessonContent.MindMapMermaid})
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeMindMap,
			Title:       "思维导图",
			ContentJSON: model.JSONRawMessage(mindMapJSON),
			ContentText: content.LessonContent.MindMapMermaid,
			WordCount:   s.countWords(content.LessonContent.MindMapMermaid),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeMindMap],
		})
	}

	// 11. 快速笔记模块
	if content.LessonContent.QuickNotes != nil {
		quickNotesJSON, _ := json.Marshal(content.LessonContent.QuickNotes)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeQuickNotes,
			Title:       "快速笔记",
			ContentJSON: model.JSONRawMessage(quickNotesJSON),
			WordCount:   s.countJSONWords(quickNotesJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeQuickNotes],
		})
	}

	// 12. 精讲例题模块（从 lesson_sections 提取）
	for _, section := range content.LessonSections {
		if section.SectionType == "example" && len(section.Examples) > 0 {
			sectionJSON, _ := json.Marshal(section)
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeExamples,
				Title:       section.Title,
				ContentJSON: model.JSONRawMessage(sectionJSON),
				ContentText: section.Content,
				WordCount:   s.countWords(section.Content),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeExamples],
			})
		}
	}

	// 13. 真题演练模块
	for _, section := range content.LessonSections {
		if section.SectionType == "drill" && len(section.RealExamQuestions) > 0 {
			sectionJSON, _ := json.Marshal(section)
			modules = append(modules, model.CourseLessonModule{
				ChapterID:   chapterID,
				ModuleType:  model.ModuleTypeDrills,
				Title:       section.Title,
				ContentJSON: model.JSONRawMessage(sectionJSON),
				ContentText: section.Content,
				WordCount:   s.countWords(section.Content),
				SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeDrills],
			})
		}
	}

	// 14. 练习题目模块
	if len(content.PracticeProblems) > 0 {
		practiceJSON, _ := json.Marshal(content.PracticeProblems)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypePractice,
			Title:       "练习题目",
			ContentJSON: model.JSONRawMessage(practiceJSON),
			WordCount:   s.countJSONWords(practiceJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypePractice],
		})
	}

	// 15. 课后作业模块
	if len(content.Homework.Required) > 0 || len(content.Homework.Optional) > 0 {
		homeworkJSON, _ := json.Marshal(content.Homework)
		modules = append(modules, model.CourseLessonModule{
			ChapterID:   chapterID,
			ModuleType:  model.ModuleTypeHomework,
			Title:       "课后作业",
			ContentJSON: model.JSONRawMessage(homeworkJSON),
			WordCount:   s.countJSONWords(homeworkJSON),
			SortOrder:   model.ModuleTypeSortOrder[model.ModuleTypeHomework],
		})
	}

	return modules
}

// =====================================================
// 题目批次导入
// =====================================================

// ImportQuestionBatchResult 导入题目批次结果
type ImportQuestionBatchResult struct {
	CategoryID       uint   `json:"category_id"`
	QuestionsCreated int    `json:"questions_created"`
	Success          bool   `json:"success"`
	Error            string `json:"error,omitempty"`
}

// ImportQuestionBatch 导入生成的题目批次到数据库
func (s *ContentImportService) ImportQuestionBatch(ctx context.Context, categoryID uint, batch *model.GeneratedQuestionBatch) (*ImportQuestionBatchResult, error) {
	result := &ImportQuestionBatchResult{CategoryID: categoryID}

	// 验证分类是否存在
	if categoryID > 0 {
		if _, err := s.categoryRepo.GetByID(categoryID); err != nil {
			result.Error = "分类不存在"
			return result, fmt.Errorf("分类不存在: %w", err)
		}
	}

	// 批量创建题目
	var questions []model.Question
	for _, q := range batch.Questions {
		// 解析选项
		options := make(model.QuestionOptions, len(q.Options))
		for i, opt := range q.Options {
			key := string(rune('A' + i))
			content := opt
			// 尝试解析 "A. xxx" 格式
			if len(opt) > 2 && opt[1] == '.' {
				key = string(opt[0])
				content = strings.TrimSpace(opt[3:])
			}
			options[i] = model.QuestionOption{Key: key, Content: content}
		}

		// 解析题型
		questionType := model.QuestionTypeSingleChoice
		if q.QuestionType != "" {
			questionType = model.QuestionType(q.QuestionType)
		}

		tips := q.KeyTechnique
		if tips == "" {
			tips = q.ErrorPronePoint
		}

		question := model.Question{
			CategoryID:   categoryID,
			QuestionType: questionType,
			Content:      q.Content,
			Options:      options,
			Answer:       q.Answer,
			Analysis:     q.Analysis,
			Difficulty:   q.Difficulty,
			Tips:         tips,
			Tags:         q.Tags,
			SourceType:   model.QuestionSourceOriginal,
			Status:       model.QuestionStatusPublished,
		}
		questions = append(questions, question)
	}

	if len(questions) > 0 {
		if err := s.db.Create(&questions).Error; err != nil {
			result.Error = fmt.Sprintf("创建题目失败: %v", err)
			return result, fmt.Errorf("%w: %v", ErrContentImportFailed, err)
		}
		result.QuestionsCreated = len(questions)
	}

	result.Success = true
	return result, nil
}

// =====================================================
// 素材批次导入
// =====================================================

// ImportMaterialBatchResult 导入素材批次结果
type ImportMaterialBatchResult struct {
	CategoryID       uint   `json:"category_id"`
	MaterialsCreated int    `json:"materials_created"`
	Success          bool   `json:"success"`
	Error            string `json:"error,omitempty"`
}

// ImportMaterialBatch 导入生成的素材批次到数据库
func (s *ContentImportService) ImportMaterialBatch(ctx context.Context, categoryID uint, batch *model.GeneratedMaterialBatch) (*ImportMaterialBatchResult, error) {
	result := &ImportMaterialBatchResult{CategoryID: categoryID}

	// 批量创建素材
	var materials []model.LearningMaterial
	for _, m := range batch.Materials {
		// 解析素材类型
		materialType := model.MaterialType(m.MaterialType)
		if materialType == "" {
			materialType = model.MaterialTypeQuote
		}

		// 构建使用场景文本
		var usageTexts []string
		for _, u := range m.UsageScenarios {
			usageTexts = append(usageTexts, fmt.Sprintf("%s: %s", u.Scenario, u.Example))
		}
		usage := strings.Join(usageTexts, "\n\n")

		content := m.Content
		if m.Quote != "" {
			content = fmt.Sprintf("【金句】%s\n\n%s", m.Quote, m.Content)
		}

		var writingParts []string
		for _, segment := range m.WritingSegments {
			label := segment.Type
			if label == "" {
				label = "范文片段"
			}
			writingParts = append(writingParts, fmt.Sprintf("【%s】\n%s", label, segment.Content))
		}
		writingText := strings.Join(writingParts, "\n\n")

		var analysisParts []string
		if len(m.RelatedPolicies) > 0 {
			analysisParts = append(analysisParts, fmt.Sprintf("相关政策：%s", strings.Join(m.RelatedPolicies, "、")))
		}
		if m.Extension != nil {
			if len(m.Extension.RelatedQuotes) > 0 {
				analysisParts = append(analysisParts, fmt.Sprintf("相关金句：%s", strings.Join(m.Extension.RelatedQuotes, "、")))
			}
			if len(m.Extension.RelatedMaterials) > 0 {
				analysisParts = append(analysisParts, fmt.Sprintf("相关素材：%s", strings.Join(m.Extension.RelatedMaterials, "、")))
			}
			if m.Extension.ReadingSuggestions != "" {
				analysisParts = append(analysisParts, fmt.Sprintf("阅读建议：%s", m.Extension.ReadingSuggestions))
			}
			if m.Extension.ExamTips != "" {
				analysisParts = append(analysisParts, fmt.Sprintf("备考提醒：%s", m.Extension.ExamTips))
			}
		}
		analysis := strings.Join(analysisParts, "\n\n")

		material := model.LearningMaterial{
			CategoryID:  categoryID,
			Type:        materialType,
			Title:       m.Title,
			Content:     content,
			Source:      m.Source,
			Author:      m.Speaker,
			ThemeTopics: m.SubThemes,
			Usage:       usage,
			Example:     writingText,
			Analysis:    analysis,
			Tags:        m.Tags,
			Keywords:    m.Keywords,
			IsFree:      true,
			Status:      model.MaterialStatusPublished,
		}
		materials = append(materials, material)
	}

	if len(materials) > 0 {
		if err := s.db.Create(&materials).Error; err != nil {
			result.Error = fmt.Sprintf("创建素材失败: %v", err)
			return result, fmt.Errorf("%w: %v", ErrContentImportFailed, err)
		}
		result.MaterialsCreated = len(materials)
	}

	result.Success = true
	return result, nil
}

// =====================================================
// AI 生成内容查询（使用现有 ai_content.go 的模型）
// =====================================================

// GetAIContentList 获取 AI 生成内容列表（使用 repository）
func (s *ContentImportService) GetAIContentList(ctx context.Context, contentType, status string, page, pageSize int) ([]model.AIGeneratedContent, int64, error) {
	params := repository.AIContentListParams{
		Page:     page,
		PageSize: pageSize,
	}
	if contentType != "" {
		params.ContentType = model.AIContentType(contentType)
	}
	if status != "" {
		params.Status = model.AIContentStatus(status)
	}

	return s.aiContentRepo.List(params)
}

// GetAIContentByID 获取单个 AI 生成内容
func (s *ContentImportService) GetAIContentByID(ctx context.Context, id uint) (*model.AIGeneratedContent, error) {
	return s.aiContentRepo.GetByID(id)
}

// ApproveAIContent 审核通过 AI 内容
func (s *ContentImportService) ApproveAIContent(ctx context.Context, contentID uint, reviewerID uint) error {
	return s.aiContentRepo.UpdateStatus(contentID, model.AIContentStatusApproved, &reviewerID)
}

// RejectAIContent 拒绝 AI 内容
func (s *ContentImportService) RejectAIContent(ctx context.Context, contentID uint, reviewerID uint, reason string) error {
	// 先更新状态
	if err := s.aiContentRepo.UpdateStatus(contentID, model.AIContentStatusRejected, &reviewerID); err != nil {
		return err
	}
	// 注意：现有模型没有 RejectReason 字段，这里仅更新状态
	return nil
}

// ImportApprovedContent 导入已审核的内容（简化版）
func (s *ContentImportService) ImportApprovedContent(ctx context.Context, contentID uint) error {
	// 获取内容
	content, err := s.aiContentRepo.GetByID(contentID)
	if err != nil {
		return fmt.Errorf("内容不存在: %w", err)
	}

	if content.Status != model.AIContentStatusApproved {
		return errors.New("内容未审核通过")
	}

	// 根据内容类型和关联类型处理
	// 由于现有模型结构与新结构不同，这里提供基础实现
	s.logger.Info("导入已审核内容",
		zap.Uint("content_id", contentID),
		zap.String("content_type", string(content.ContentType)),
		zap.String("related_type", string(content.RelatedType)),
		zap.Uint("related_id", content.RelatedID))

	return nil
}

// =====================================================
// 辅助函数
// =====================================================

// countWords 计算中文字数
func (s *ContentImportService) countWords(text string) int {
	count := 0
	for _, r := range text {
		if r >= 0x4e00 && r <= 0x9fff {
			count++
		}
	}
	return count
}

// countJSONWords 计算 JSON 内容中的中文字数
func (s *ContentImportService) countJSONWords(data []byte) int {
	return s.countWords(string(data))
}
