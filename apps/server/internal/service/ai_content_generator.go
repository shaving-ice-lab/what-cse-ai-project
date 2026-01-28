package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrAIContentNotFound  = errors.New("AI生成内容不存在")
	ErrAIContentExists    = errors.New("AI内容已存在")
	ErrInvalidContentType = errors.New("无效的内容类型")
)

// AIContentGeneratorService AI内容生成服务
type AIContentGeneratorService struct {
	contentRepo  *repository.AIContentRepository
	questionRepo *repository.QuestionRepository
	courseRepo   *repository.CourseRepository
	// llmService   *LLMService // 如果有LLM服务
}

// NewAIContentGeneratorService 创建AI内容生成服务实例
func NewAIContentGeneratorService(
	contentRepo *repository.AIContentRepository,
	questionRepo *repository.QuestionRepository,
	courseRepo *repository.CourseRepository,
) *AIContentGeneratorService {
	return &AIContentGeneratorService{
		contentRepo:  contentRepo,
		questionRepo: questionRepo,
		courseRepo:   courseRepo,
	}
}

// =====================================================
// 题目解析生成
// =====================================================

// GenerateQuestionAnalysisRequest 生成题目解析请求
type GenerateQuestionAnalysisRequest struct {
	QuestionID uint   `json:"question_id" validate:"required"`
	ModelName  string `json:"model_name,omitempty"`
	Force      bool   `json:"force,omitempty"` // 强制重新生成
}

// GenerateQuestionAnalysis 生成题目深度解析
func (s *AIContentGeneratorService) GenerateQuestionAnalysis(ctx context.Context, req GenerateQuestionAnalysisRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeQuestion, req.QuestionID, model.AIContentTypeQuestionAnalysis)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeQuestion, req.QuestionID, model.AIContentTypeQuestionAnalysis)
		}
	}

	// 获取题目信息
	question, err := s.questionRepo.GetByID(req.QuestionID)
	if err != nil {
		return nil, fmt.Errorf("获取题目失败: %w", err)
	}

	// TODO: 调用LLM生成解析
	// 这里先使用模拟数据
	categoryName := "相关"
	if question.Category != nil {
		categoryName = question.Category.Name
	}
	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeQuestionAnalysis,
		RelatedType: model.AIRelatedTypeQuestion,
		RelatedID:   req.QuestionID,
		Title:       fmt.Sprintf("题目 #%d 深度解析", req.QuestionID),
		Content: model.JSONAIContent{
			Analysis: fmt.Sprintf("【解析】\n\n本题考查%s知识点。\n\n%s", categoryName, generateMockAnalysis(question)),
			KeyPoints: []string{
				"考点1：相关概念理解",
				"考点2：解题方法运用",
				"考点3：易错点提醒",
			},
			SolutionSteps: []string{
				"第一步：审题，明确题目要求",
				"第二步：分析条件，找出关键信息",
				"第三步：运用相关知识点解答",
				"第四步：验证答案，检查逻辑",
			},
			OptionAnalysis: map[string]string{
				"A": "选项A分析：...",
				"B": "选项B分析：...",
				"C": "选项C分析：...",
				"D": "选项D分析：...",
			},
			CommonMistakes: []string{
				"常见错误1：忽略题目中的限定条件",
				"常见错误2：概念混淆",
			},
			RelatedKnowledge: []uint{}, // 相关知识点ID
		},
		Metadata: model.JSONAIMetadata{
			ModelName:    req.ModelName,
			ModelVersion: "v1.0",
			Source:       "api",
		},
		QualityScore: 0,
		Status:       model.AIContentStatusPending,
		Version:      1,
		GeneratedAt:  time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// GenerateQuestionTips 生成解题技巧
func (s *AIContentGeneratorService) GenerateQuestionTips(ctx context.Context, req GenerateQuestionAnalysisRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeQuestion, req.QuestionID, model.AIContentTypeQuestionTips)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeQuestion, req.QuestionID, model.AIContentTypeQuestionTips)
		}
	}

	// 获取题目信息
	question, err := s.questionRepo.GetByID(req.QuestionID)
	if err != nil {
		return nil, fmt.Errorf("获取题目失败: %w", err)
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeQuestionTips,
		RelatedType: model.AIRelatedTypeQuestion,
		RelatedID:   req.QuestionID,
		Title:       fmt.Sprintf("题目 #%d 解题技巧", req.QuestionID),
		Content: model.JSONAIContent{
			Tips: []string{
				"技巧1：快速定位关键词",
				"技巧2：排除法应用",
				"技巧3：特殊值代入验证",
			},
			QuickSolutionTips: []string{
				fmt.Sprintf("【秒杀技巧】针对%s类题目，可以...", question.QuestionType),
			},
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// =====================================================
// 知识点内容生成
// =====================================================

// GenerateKnowledgeContentRequest 生成知识点内容请求
type GenerateKnowledgeContentRequest struct {
	KnowledgePointID uint   `json:"knowledge_point_id" validate:"required"`
	ModelName        string `json:"model_name,omitempty"`
	Force            bool   `json:"force,omitempty"`
}

// GenerateKnowledgeSummary 生成知识点总结
func (s *AIContentGeneratorService) GenerateKnowledgeSummary(ctx context.Context, req GenerateKnowledgeContentRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeKnowledgePoint, req.KnowledgePointID, model.AIContentTypeKnowledgeSummary)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeKnowledgePoint, req.KnowledgePointID, model.AIContentTypeKnowledgeSummary)
		}
	}

	// TODO: 获取知识点信息并调用LLM生成

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeKnowledgeSummary,
		RelatedType: model.AIRelatedTypeKnowledgePoint,
		RelatedID:   req.KnowledgePointID,
		Title:       fmt.Sprintf("知识点 #%d 学习总结", req.KnowledgePointID),
		Content: model.JSONAIContent{
			Definition: "该知识点的核心定义...",
			MainPoints: []string{
				"要点1：基本概念",
				"要点2：常见应用",
				"要点3：易错点",
			},
			Mnemonics:   "记忆口诀：...",
			CommonTypes: []string{"题型1", "题型2", "题型3"},
			KeyFormulas: []string{"公式1", "公式2"},
			MemoryMethods: []string{
				"联想记忆法：...",
				"对比记忆法：...",
			},
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// GenerateKnowledgeMindmap 生成知识点思维导图数据
func (s *AIContentGeneratorService) GenerateKnowledgeMindmap(ctx context.Context, req GenerateKnowledgeContentRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeKnowledgePoint, req.KnowledgePointID, model.AIContentTypeKnowledgeMindmap)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeKnowledgePoint, req.KnowledgePointID, model.AIContentTypeKnowledgeMindmap)
		}
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeKnowledgeMindmap,
		RelatedType: model.AIRelatedTypeKnowledgePoint,
		RelatedID:   req.KnowledgePointID,
		Title:       fmt.Sprintf("知识点 #%d 思维导图", req.KnowledgePointID),
		Content: model.JSONAIContent{
			MindmapData: &model.MindmapData{
				Root: model.MindmapNode{
					ID:    "root",
					Label: "核心概念",
					Color: "#ff6b6b",
					Children: []model.MindmapNode{
						{ID: "1", Label: "分支1", Color: "#4ecdc4"},
						{ID: "2", Label: "分支2", Color: "#45b7d1"},
						{ID: "3", Label: "分支3", Color: "#96ceb4"},
					},
				},
			},
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// =====================================================
// 章节/课程内容生成
// =====================================================

// GenerateChapterContentRequest 生成章节内容请求
type GenerateChapterContentRequest struct {
	ChapterID uint   `json:"chapter_id" validate:"required"`
	ModelName string `json:"model_name,omitempty"`
	Force     bool   `json:"force,omitempty"`
}

// GenerateChapterSummary 生成章节总结
func (s *AIContentGeneratorService) GenerateChapterSummary(ctx context.Context, req GenerateChapterContentRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeChapter, req.ChapterID, model.AIContentTypeChapterSummary)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeChapter, req.ChapterID, model.AIContentTypeChapterSummary)
		}
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeChapterSummary,
		RelatedType: model.AIRelatedTypeChapter,
		RelatedID:   req.ChapterID,
		Title:       fmt.Sprintf("章节 #%d 学习总结", req.ChapterID),
		Content: model.JSONAIContent{
			Summary: "本章节主要讲解了...",
			MainPoints: []string{
				"重点1：...",
				"重点2：...",
				"重点3：...",
			},
			KeyPoints: []string{
				"核心考点1",
				"核心考点2",
			},
			ReviewPoints: []string{
				"复习要点1",
				"复习要点2",
			},
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// GenerateCourseContentRequest 生成课程内容请求
type GenerateCourseContentRequest struct {
	CourseID  uint   `json:"course_id" validate:"required"`
	ModelName string `json:"model_name,omitempty"`
	Force     bool   `json:"force,omitempty"`
}

// GenerateCoursePreview 生成课程预习要点
func (s *AIContentGeneratorService) GenerateCoursePreview(ctx context.Context, req GenerateCourseContentRequest) (*model.AIGeneratedContent, error) {
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeCourse, req.CourseID, model.AIContentTypeCoursePreview)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeCourse, req.CourseID, model.AIContentTypeCoursePreview)
		}
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeCoursePreview,
		RelatedType: model.AIRelatedTypeCourse,
		RelatedID:   req.CourseID,
		Title:       fmt.Sprintf("课程 #%d 预习要点", req.CourseID),
		Content: model.JSONAIContent{
			PreviewPoints: []string{
				"预习要点1：了解基本概念",
				"预习要点2：回顾相关知识",
				"预习要点3：准备学习材料",
			},
			EstimatedTime: 30, // 预计预习时间（分钟）
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// GenerateCourseReview 生成课程复习要点
func (s *AIContentGeneratorService) GenerateCourseReview(ctx context.Context, req GenerateCourseContentRequest) (*model.AIGeneratedContent, error) {
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeCourse, req.CourseID, model.AIContentTypeCourseReview)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeCourse, req.CourseID, model.AIContentTypeCourseReview)
		}
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeCourseReview,
		RelatedType: model.AIRelatedTypeCourse,
		RelatedID:   req.CourseID,
		Title:       fmt.Sprintf("课程 #%d 复习要点", req.CourseID),
		Content: model.JSONAIContent{
			ReviewPoints: []string{
				"复习要点1：巩固核心概念",
				"复习要点2：做配套练习",
				"复习要点3：总结易错点",
			},
			Exercises:     []uint{}, // 配套练习题目ID
			EstimatedTime: 45,       // 预计复习时间（分钟）
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// =====================================================
// 相似题目生成
// =====================================================

// GenerateSimilarQuestionsRequest 生成相似题目请求
type GenerateSimilarQuestionsRequest struct {
	QuestionID uint   `json:"question_id" validate:"required"`
	Count      int    `json:"count,omitempty"` // 生成数量，默认3
	ModelName  string `json:"model_name,omitempty"`
	Force      bool   `json:"force,omitempty"`
}

// GenerateSimilarQuestions 生成相似题目
func (s *AIContentGeneratorService) GenerateSimilarQuestions(ctx context.Context, req GenerateSimilarQuestionsRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeQuestion, req.QuestionID, model.AIContentTypeQuestionSimilar)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeQuestion, req.QuestionID, model.AIContentTypeQuestionSimilar)
		}
	}

	// 获取原始题目信息
	question, err := s.questionRepo.GetByID(req.QuestionID)
	if err != nil {
		return nil, fmt.Errorf("获取题目失败: %w", err)
	}

	if req.Count <= 0 {
		req.Count = 3
	}

	// 生成相似题目（模拟数据，实际应调用 LLM）
	categoryName := "相关知识"
	if question.Category != nil {
		categoryName = question.Category.Name
	}

	similarQuestions := make([]model.ExampleQuestion, 0, req.Count)
	for i := 1; i <= req.Count; i++ {
		similarQuestions = append(similarQuestions, model.ExampleQuestion{
			Question: fmt.Sprintf("【变形题 %d】基于原题考点「%s」的举一反三练习：\n\n关于%s，以下说法正确的是？", i, categoryName, categoryName),
			Options:  []string{"A. 选项描述一", "B. 选项描述二", "C. 选项描述三", "D. 选项描述四"},
			Answer:   "A",
			Analysis: fmt.Sprintf("本题是原题的变形，同样考查%s知识点，但从不同角度出发，帮助巩固理解。", categoryName),
		})
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeQuestionSimilar,
		RelatedType: model.AIRelatedTypeQuestion,
		RelatedID:   req.QuestionID,
		Title:       fmt.Sprintf("题目 #%d 相似题目", req.QuestionID),
		Content: model.JSONAIContent{
			Summary:  fmt.Sprintf("基于原题生成的 %d 道相似练习题，用于举一反三训练", req.Count),
			Examples: similarQuestions,
			KeyPoints: []string{
				"同知识点变形训练",
				"不同难度梯度练习",
				"巩固核心考点",
			},
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
			Extra: map[string]string{
				"original_question_id": fmt.Sprintf("%d", req.QuestionID),
				"generated_count":      fmt.Sprintf("%d", req.Count),
			},
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// =====================================================
// 知识点例题生成
// =====================================================

// GenerateKnowledgeExamplesRequest 生成知识点例题请求
type GenerateKnowledgeExamplesRequest struct {
	KnowledgePointID uint   `json:"knowledge_point_id" validate:"required"`
	Count            int    `json:"count,omitempty"` // 例题数量，默认3
	ModelName        string `json:"model_name,omitempty"`
	Force            bool   `json:"force,omitempty"`
}

// GenerateKnowledgeExamples 生成知识点例题解析
func (s *AIContentGeneratorService) GenerateKnowledgeExamples(ctx context.Context, req GenerateKnowledgeExamplesRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeKnowledgePoint, req.KnowledgePointID, model.AIContentTypeKnowledgeExamples)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeKnowledgePoint, req.KnowledgePointID, model.AIContentTypeKnowledgeExamples)
		}
	}

	if req.Count <= 0 {
		req.Count = 3
	}

	// 生成例题（模拟数据，实际应调用 LLM）
	examples := []model.ExampleQuestion{
		{
			Question: "【典型例题 1】\n\n某公司2023年总营收为120万元，其中第一季度占25%，第二季度比第一季度增长20%。则第二季度的营收为多少万元？",
			Options:  []string{"A. 30万元", "B. 36万元", "C. 40万元", "D. 42万元"},
			Answer:   "B",
			Analysis: "【解析】\n第一季度营收 = 120 × 25% = 30万元\n第二季度比第一季度增长20%，即：30 × (1 + 20%) = 30 × 1.2 = 36万元\n\n【解题模板】\n1. 先求基准值\n2. 根据增长比例计算目标值\n公式：目标值 = 基准值 × (1 + 增长率)",
		},
		{
			Question: "【典型例题 2】\n\n某商品原价200元，先降价20%，后又涨价20%，则现价是多少元？",
			Options:  []string{"A. 192元", "B. 200元", "C. 208元", "D. 180元"},
			Answer:   "A",
			Analysis: "【解析】\n降价后：200 × (1 - 20%) = 200 × 0.8 = 160元\n涨价后：160 × (1 + 20%) = 160 × 1.2 = 192元\n\n【易错提醒】\n先降后涨与先涨后降结果相同，但都不等于原价！\n这是因为降价和涨价的基数不同。",
		},
		{
			Question: "【典型例题 3】\n\n2022年某市GDP为5000亿元，同比增长8%。则2021年该市GDP约为多少亿元？",
			Options:  []string{"A. 4600亿元", "B. 4630亿元", "C. 4800亿元", "D. 5400亿元"},
			Answer:   "B",
			Analysis: "【解析】\n设2021年GDP为x，则：x × (1 + 8%) = 5000\nx = 5000 ÷ 1.08 ≈ 4630亿元\n\n【解题模板】\n已知现期值和增长率，求基期值：\n基期值 = 现期值 ÷ (1 + 增长率)",
		},
	}

	// 根据请求数量调整
	if req.Count < len(examples) {
		examples = examples[:req.Count]
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeKnowledgeExamples,
		RelatedType: model.AIRelatedTypeKnowledgePoint,
		RelatedID:   req.KnowledgePointID,
		Title:       fmt.Sprintf("知识点 #%d 经典例题解析", req.KnowledgePointID),
		Content: model.JSONAIContent{
			Summary:  fmt.Sprintf("精选 %d 道经典例题，涵盖常见题型和解题方法", len(examples)),
			Examples: examples,
			KeyPoints: []string{
				"典型题型覆盖",
				"详细解题步骤",
				"解题模板总结",
				"易错点提醒",
			},
			Tips: []string{
				"先理解题意，明确已知条件和所求",
				"套用对应公式，注意单位换算",
				"验算答案，排除明显错误选项",
			},
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// =====================================================
// 章节重点与配套练习生成
// =====================================================

// GenerateChapterKeypoints 生成章节重点
func (s *AIContentGeneratorService) GenerateChapterKeypoints(ctx context.Context, req GenerateChapterContentRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeChapter, req.ChapterID, model.AIContentTypeChapterKeypoints)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeChapter, req.ChapterID, model.AIContentTypeChapterKeypoints)
		}
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeChapterKeypoints,
		RelatedType: model.AIRelatedTypeChapter,
		RelatedID:   req.ChapterID,
		Title:       fmt.Sprintf("章节 #%d 重点内容", req.ChapterID),
		Content: model.JSONAIContent{
			Summary: "本章节核心知识点和重难点梳理",
			KeyPoints: []string{
				"【重点一】核心概念理解：掌握基本定义和原理",
				"【重点二】公式运用：熟练应用核心公式解题",
				"【重点三】题型归纳：识别常见题型及解法",
				"【重点四】易错点：注意常见陷阱和易混淆概念",
			},
			MainPoints: []string{
				"概念定义要准确",
				"公式推导要熟练",
				"解题步骤要规范",
				"答案检验不能少",
			},
			Tips: []string{
				"建议学习时间：60-90分钟",
				"配合例题练习效果更佳",
				"重点内容建议做笔记",
			},
			EstimatedTime: 60,
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// GenerateChapterExercises 生成章节配套练习
func (s *AIContentGeneratorService) GenerateChapterExercises(ctx context.Context, req GenerateChapterContentRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeChapter, req.ChapterID, model.AIContentTypeChapterExercises)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeChapter, req.ChapterID, model.AIContentTypeChapterExercises)
		}
	}

	// 生成配套练习（模拟数据）
	exercises := []model.ExampleQuestion{
		{
			Question: "【基础练习 1】\n\n以下关于本章核心概念的描述，正确的是？",
			Options:  []string{"A. 选项A描述", "B. 选项B描述", "C. 选项C描述", "D. 选项D描述"},
			Answer:   "A",
			Analysis: "本题考查基础概念理解，A选项正确表述了核心定义。",
		},
		{
			Question: "【进阶练习 2】\n\n运用本章学习的方法，解决以下问题...",
			Options:  []string{"A. 结果一", "B. 结果二", "C. 结果三", "D. 结果四"},
			Answer:   "B",
			Analysis: "本题需要综合运用本章知识点，按步骤解答即可得出正确答案。",
		},
		{
			Question: "【综合练习 3】\n\n综合本章所学内容，分析以下情况...",
			Options:  []string{"A. 方案一", "B. 方案二", "C. 方案三", "D. 方案四"},
			Answer:   "C",
			Analysis: "本题是综合应用题，需要结合多个知识点进行分析判断。",
		},
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeChapterExercises,
		RelatedType: model.AIRelatedTypeChapter,
		RelatedID:   req.ChapterID,
		Title:       fmt.Sprintf("章节 #%d 配套练习", req.ChapterID),
		Content: model.JSONAIContent{
			Summary:  "本章节配套练习题，包含基础、进阶、综合三个层次",
			Examples: exercises,
			KeyPoints: []string{
				"基础题：巩固核心概念",
				"进阶题：熟练方法运用",
				"综合题：提升综合能力",
			},
			EstimatedTime: 30, // 预计完成时间30分钟
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// =====================================================
// 章节教学内容生成（完整图文教程）
// =====================================================

// GenerateChapterLessonRequest 生成章节教学内容请求
type GenerateChapterLessonRequest struct {
	ChapterID      uint   `json:"chapter_id" validate:"required"`
	ChapterTitle   string `json:"chapter_title,omitempty"`   // 章节标题（可选，不传则从数据库获取）
	CourseTitle    string `json:"course_title,omitempty"`    // 课程标题
	Subject        string `json:"subject,omitempty"`         // 科目（xingce/shenlun/mianshi/gongji）
	KnowledgePoint string `json:"knowledge_point,omitempty"` // 相关知识点
	ModelName      string `json:"model_name,omitempty"`
	Force          bool   `json:"force,omitempty"`
	AutoApprove    bool   `json:"auto_approve,omitempty"` // 是否自动审核通过
}

// GenerateChapterLesson 生成章节完整教学内容
func (s *AIContentGeneratorService) GenerateChapterLesson(ctx context.Context, req GenerateChapterLessonRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeChapter, req.ChapterID, model.AIContentTypeChapterLesson)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeChapter, req.ChapterID, model.AIContentTypeChapterLesson)
		}
	}

	// 获取章节信息（如果未提供标题）
	chapterTitle := req.ChapterTitle
	if chapterTitle == "" {
		chapter, err := s.courseRepo.GetChapterByID(req.ChapterID)
		if err != nil {
			chapterTitle = fmt.Sprintf("章节 #%d", req.ChapterID)
		} else {
			chapterTitle = chapter.Title
		}
	}

	// 根据科目和章节标题生成教学内容
	lessonContent := s.generateLessonContentBySubject(req.Subject, chapterTitle, req.KnowledgePoint)

	// 生成教学分节
	lessonSections := s.generateLessonSections(req.Subject, chapterTitle)

	// 生成随堂练习
	practiceProblems := s.generatePracticeProblems(req.Subject, chapterTitle)

	// 设置状态
	status := model.AIContentStatusPending
	if req.AutoApprove {
		status = model.AIContentStatusApproved
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeChapterLesson,
		RelatedType: model.AIRelatedTypeChapter,
		RelatedID:   req.ChapterID,
		Title:       fmt.Sprintf("%s - 教学内容", chapterTitle),
		Content: model.JSONAIContent{
			Summary:          fmt.Sprintf("本节课程详细讲解「%s」的核心知识点、方法技巧和实战应用。", chapterTitle),
			LessonContent:    lessonContent,
			LessonSections:   lessonSections,
			PracticeProblems: practiceProblems,
			KeyPoints:        lessonContent.CoreConcepts,
			Tips:             lessonContent.MemoryTips,
			CommonMistakes:   lessonContent.CommonMistakes,
			EstimatedTime:    lessonContent.EstimatedMinutes,
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
			Tags:      []string{req.Subject, "lesson", "ai-generated"},
			Extra: map[string]string{
				"chapter_title":   chapterTitle,
				"course_title":    req.CourseTitle,
				"subject":         req.Subject,
				"knowledge_point": req.KnowledgePoint,
			},
		},
		QualityScore: 4.0, // 默认质量评分
		Status:       status,
		Version:      1,
		GeneratedAt:  time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存教学内容失败: %w", err)
	}

	return content, nil
}

// generateLessonContentBySubject 根据科目生成教学内容
func (s *AIContentGeneratorService) generateLessonContentBySubject(subject, chapterTitle, knowledgePoint string) *model.LessonContent {
	// 根据科目选择不同的内容模板
	// TODO: 实际应用中应调用 LLM API 生成内容
	switch subject {
	case "xingce":
		return s.generateXingCeLessonContent(chapterTitle, knowledgePoint)
	case "shenlun":
		return s.generateShenlunLessonContent(chapterTitle, knowledgePoint)
	case "mianshi":
		return s.generateMianshiLessonContent(chapterTitle, knowledgePoint)
	case "gongji":
		return s.generateGongjiLessonContent(chapterTitle, knowledgePoint)
	default:
		return s.generateDefaultLessonContent(chapterTitle, knowledgePoint)
	}
}

// generateXingCeLessonContent 生成行测课程内容
func (s *AIContentGeneratorService) generateXingCeLessonContent(chapterTitle, knowledgePoint string) *model.LessonContent {
	return &model.LessonContent{
		Introduction: fmt.Sprintf(`## 课程导入

欢迎学习「%s」！

本节课是行测备考的重要组成部分，掌握本节内容将帮助你在考试中快速、准确地解答相关题目。

在开始学习前，请先回顾以下问题：
- 你是否了解该类题型的基本特征？
- 你知道常见的解题方法有哪些吗？
- 你能在规定时间内完成该类题目吗？

带着这些问题，让我们开始今天的学习！`, chapterTitle),

		LearningGoals: []string{
			"理解并掌握核心概念和定义",
			"熟练运用解题方法和技巧",
			"能够识别题目类型并选择合适的解法",
			"提高解题速度，达到考试要求的时间标准",
		},

		Prerequisites: []string{
			"基础数学运算能力",
			"基本逻辑思维能力",
			"了解行测考试题型分布",
		},

		CoreConcepts: []string{
			fmt.Sprintf("【核心概念一】%s的基本定义和特征", chapterTitle),
			"【核心概念二】相关公式和计算方法",
			"【核心概念三】常见题型分类",
			"【核心概念四】解题思路框架",
		},

		MainContent: fmt.Sprintf(`## 一、基础知识精讲

### 1.1 概念定义

「%s」是行测考试中的重要考点，主要考查考生对相关知识的理解和运用能力。

**核心定义**：
> 该知识点涉及...[具体定义内容]

**知识要点**：
1. 基本概念：理解核心术语的准确含义
2. 适用范围：明确知识点的应用场景
3. 关联知识：与其他考点的联系

### 1.2 题型特征

该类题目通常具有以下特征：
- **题干特点**：通常会出现...
- **选项设置**：A/B/C/D选项的区分度...
- **考查方式**：直接考查 vs 综合考查

---

## 二、方法技巧精讲

### 2.1 常规解法

**步骤一：审题**
仔细阅读题干，标记关键信息：
- 已知条件
- 所求内容
- 限制条件

**步骤二：分析**
根据题目类型，选择合适的方法：
- 直接计算法
- 代入验证法
- 排除法

**步骤三：求解**
按照选定的方法进行计算或推理。

**步骤四：验证**
将答案代入检验，确保正确性。

### 2.2 快速解法（秒杀技巧）

在时间紧迫的考试中，掌握快速解法尤为重要：

**技巧一：特征数字法**
当题目中出现特征数字（如25%%、50%%等）时，可以快速转化计算。

**技巧二：估算法**
对于选项差距较大的题目，可以通过估算快速定位答案。

**技巧三：排除法**
根据题意排除明显错误的选项，提高正确率。

---

## 三、典型例题讲解

### 例题1（基础题）

**题目**：[题目内容]

**解析**：
- 第一步：审题，明确所求
- 第二步：识别题型
- 第三步：运用方法求解
- 第四步：检验答案

**答案**：[正确选项]

### 例题2（进阶题）

**题目**：[题目内容]

**解析**：
- 分析思路
- 解题过程
- 总结方法

**答案**：[正确选项]

---

## 四、总结归纳

### 4.1 知识框架

%s
├── 基本概念
│   ├── 核心定义
│   └── 适用范围
├── 解题方法
│   ├── 常规解法
│   └── 快速技巧
└── 典型题型
    ├── 基础应用
    └── 综合提升

### 4.2 要点回顾

1. **概念理解**：准确把握核心定义
2. **方法掌握**：熟练运用解题技巧
3. **题型识别**：快速判断并选择方法
4. **限时训练**：提高解题速度`, chapterTitle, chapterTitle),

		Formulas: []string{
			"公式1：[基本公式]",
			"公式2：[变形公式]",
			"公式3：[快速计算公式]",
		},

		MemoryTips: []string{
			"口诀记忆：[朗朗上口的口诀]",
			"联想记忆：将抽象概念与具体场景关联",
			"框架记忆：构建知识体系，形成结构化记忆",
		},

		CommonMistakes: []string{
			"易错点1：概念混淆，注意区分相似术语",
			"易错点2：计算粗心，注意检验答案",
			"易错点3：审题不清，漏看条件或限制",
			"易错点4：方法选择错误，导致耗时过长",
		},

		SummaryPoints: []string{
			"掌握核心概念是基础",
			"方法技巧需要反复练习",
			"限时训练提高实战能力",
			"总结错题避免重复犯错",
		},

		ExtendedReading: `### 延伸阅读

**相关知识点**：
- [相关知识点1]
- [相关知识点2]

**推荐练习**：
- 历年真题练习
- 专项突破训练

**备考建议**：
- 制定学习计划，每日定量练习
- 建立错题本，定期回顾
- 模拟考试，适应时间压力`,

		EstimatedMinutes: 45,
	}
}

// generateShenlunLessonContent 生成申论课程内容
func (s *AIContentGeneratorService) generateShenlunLessonContent(chapterTitle, knowledgePoint string) *model.LessonContent {
	return &model.LessonContent{
		Introduction: fmt.Sprintf(`## 课程导入

欢迎学习申论「%s」！

申论是公务员考试的重要组成部分，考查的是考生的阅读理解能力、综合分析能力和文字表达能力。

本节课将系统讲解%s的答题思路和技巧，帮助你在申论考试中取得高分。`, chapterTitle, chapterTitle),

		LearningGoals: []string{
			"理解该题型的考查要求和评分标准",
			"掌握审题、找点、加工、书写的完整流程",
			"学会运用恰当的结构和语言表达",
			"能够在规定时间内完成高质量作答",
		},

		Prerequisites: []string{
			"基本的阅读理解能力",
			"了解申论考试基本题型",
			"具备一定的文字表达能力",
		},

		CoreConcepts: []string{
			"【审题要点】如何准确把握题目要求",
			"【材料分析】如何从材料中提取要点",
			"【逻辑框架】如何组织答案结构",
			"【语言表达】如何使用规范、准确的语言",
		},

		MainContent: fmt.Sprintf(`## 一、题型概述

### 1.1 题型定义

「%s」是申论考试中的常见题型，主要考查考生...

### 1.2 评分要点

阅卷老师主要从以下几个维度评分：
1. **内容完整性**：是否涵盖所有要点
2. **逻辑清晰度**：结构是否合理
3. **语言规范性**：表达是否准确、得体
4. **字数控制**：是否符合要求

---

## 二、答题方法

### 2.1 审题技巧

**第一步：确定作答对象**
明确题目要求回答的核心问题是什么。

**第二步：把握作答范围**
注意题目限定的材料范围。

**第三步：明确作答要求**
字数、格式、语言风格等要求。

### 2.2 找点技巧

**直接要点**：材料中明确表述的内容
**间接要点**：需要概括、归纳的内容
**延伸要点**：需要推理、分析的内容

### 2.3 加工技巧

**内容加工**：
- 合并同类项
- 提炼概括
- 逻辑排序

**形式加工**：
- 总分结构
- 序号标注
- 分条列点

---

## 三、实战演练

[具体例题和答案示例]`, chapterTitle),

		MemoryTips: []string{
			"审题口诀：对象+范围+要求",
			"找点口诀：直接+间接+延伸",
			"加工口诀：合并+概括+排序",
		},

		CommonMistakes: []string{
			"审题不清，遗漏作答要求",
			"要点不全，覆盖率不足",
			"语言口语化，不够规范",
			"结构混乱，缺乏逻辑",
		},

		SummaryPoints: []string{
			"审题是基础，决定方向",
			"找点是核心，决定分数",
			"加工是提升，体现能力",
			"书写是呈现，影响印象",
		},

		EstimatedMinutes: 60,
	}
}

// generateMianshiLessonContent 生成面试课程内容
func (s *AIContentGeneratorService) generateMianshiLessonContent(chapterTitle, knowledgePoint string) *model.LessonContent {
	return &model.LessonContent{
		Introduction: fmt.Sprintf(`## 课程导入

欢迎学习面试「%s」！

面试是公务员考试的关键环节，直接决定最终录用结果。本节课将帮助你掌握该类题目的答题框架和技巧。`, chapterTitle),

		LearningGoals: []string{
			"理解题型特点和考查要素",
			"掌握标准答题框架",
			"学会个性化表达",
			"提升临场应变能力",
		},

		Prerequisites: []string{
			"了解结构化面试基本流程",
			"具备基本的口头表达能力",
		},

		CoreConcepts: []string{
			"【破题要点】快速理解题目核心",
			"【框架结构】标准答题模板",
			"【内容充实】素材积累与运用",
			"【表达技巧】语言组织与呈现",
		},

		MainContent: fmt.Sprintf(`## 面试「%s」答题指南

### 一、题型特点
...

### 二、答题框架
...

### 三、实战演练
...`, chapterTitle),

		MemoryTips: []string{
			"答题框架：观点+分析+对策+总结",
			"时间分配：思考30秒，作答2-3分钟",
		},

		CommonMistakes: []string{
			"开头啰嗦，抓不住重点",
			"内容空洞，缺乏实例",
			"语言生硬，过于模板化",
		},

		SummaryPoints: []string{
			"框架是骨架，内容是血肉",
			"真诚表达，展现个性",
			"多练多说，熟能生巧",
		},

		EstimatedMinutes: 50,
	}
}

// generateGongjiLessonContent 生成公基课程内容
func (s *AIContentGeneratorService) generateGongjiLessonContent(chapterTitle, knowledgePoint string) *model.LessonContent {
	return &model.LessonContent{
		Introduction: fmt.Sprintf(`## 课程导入

欢迎学习公共基础知识「%s」！

公基知识点覆盖面广，需要系统学习和记忆。本节课将帮助你梳理重点，掌握高效记忆方法。`, chapterTitle),

		LearningGoals: []string{
			"系统掌握核心知识点",
			"理解知识点之间的关联",
			"掌握高效记忆技巧",
			"能够应对各类考查方式",
		},

		CoreConcepts: []string{
			"【核心概念】基础定义和原理",
			"【重点内容】高频考点梳理",
			"【关联知识】知识网络构建",
		},

		MainContent: fmt.Sprintf(`## 「%s」知识点精讲

### 一、基础概念
...

### 二、重点内容
...

### 三、真题演练
...`, chapterTitle),

		MemoryTips: []string{
			"关键词记忆法",
			"对比记忆法",
			"框架记忆法",
		},

		CommonMistakes: []string{
			"知识点混淆",
			"记忆不准确",
			"忽视时政更新",
		},

		SummaryPoints: []string{
			"构建知识体系",
			"重点反复巩固",
			"及时更新时政",
		},

		EstimatedMinutes: 40,
	}
}

// generateDefaultLessonContent 生成默认课程内容
func (s *AIContentGeneratorService) generateDefaultLessonContent(chapterTitle, knowledgePoint string) *model.LessonContent {
	return &model.LessonContent{
		Introduction: fmt.Sprintf(`## 课程导入

欢迎学习「%s」！

本节课将系统讲解相关知识点，帮助你全面掌握核心内容。`, chapterTitle),

		LearningGoals: []string{
			"理解核心概念",
			"掌握方法技巧",
			"能够灵活运用",
		},

		CoreConcepts: []string{
			"核心概念一",
			"核心概念二",
			"核心概念三",
		},

		MainContent: fmt.Sprintf(`## 「%s」内容详解

### 一、基础知识
...

### 二、方法技巧
...

### 三、实战练习
...`, chapterTitle),

		MemoryTips: []string{
			"理解记忆",
			"框架记忆",
		},

		CommonMistakes: []string{
			"概念混淆",
			"方法错误",
		},

		SummaryPoints: []string{
			"掌握基础是关键",
			"多练习多总结",
		},

		EstimatedMinutes: 30,
	}
}

// generateLessonSections 生成教学分节
func (s *AIContentGeneratorService) generateLessonSections(subject, chapterTitle string) []model.LessonSection {
	return []model.LessonSection{
		{
			Order:       1,
			Title:       "课程导入",
			Content:     "介绍本节课的学习目标和主要内容...",
			SectionType: model.LessonSectionTypeIntro,
			Duration:    5,
			KeyPoints:   []string{"学习目标", "内容概览"},
		},
		{
			Order:       2,
			Title:       "概念讲解",
			Content:     "详细讲解核心概念和定义...",
			SectionType: model.LessonSectionTypeConcept,
			Duration:    15,
			KeyPoints:   []string{"核心定义", "基本原理"},
		},
		{
			Order:       3,
			Title:       "方法技巧",
			Content:     "讲解常用的解题方法和技巧...",
			SectionType: model.LessonSectionTypeMethod,
			Duration:    15,
			KeyPoints:   []string{"常规方法", "快速技巧"},
		},
		{
			Order:       4,
			Title:       "例题演示",
			Content:     "通过典型例题讲解应用...",
			SectionType: model.LessonSectionTypeExample,
			Duration:    15,
			KeyPoints:   []string{"解题思路", "答案分析"},
			Examples: []model.LessonExample{
				{
					Title:      "例题1",
					Problem:    "题目内容...",
					Analysis:   "分析思路...",
					Solution:   "解答过程...",
					Answer:     "A",
					KeyInsight: "关键洞察...",
				},
			},
		},
		{
			Order:       5,
			Title:       "总结归纳",
			Content:     "回顾本节重点，总结知识框架...",
			SectionType: model.LessonSectionTypeSummary,
			Duration:    5,
			KeyPoints:   []string{"要点回顾", "知识框架"},
		},
	}
}

// generatePracticeProblems 生成随堂练习
func (s *AIContentGeneratorService) generatePracticeProblems(subject, chapterTitle string) []model.PracticeProblem {
	return []model.PracticeProblem{
		{
			Order:      1,
			Problem:    "【基础题】关于本节核心概念，以下说法正确的是？",
			Options:    []string{"A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"},
			Answer:     "A",
			Analysis:   "本题考查基础概念理解。A选项正确表述了核心定义...",
			Difficulty: 2,
			Type:       "单选题",
		},
		{
			Order:      2,
			Problem:    "【进阶题】运用本节所学方法，解决以下问题...",
			Options:    []string{"A. 结果一", "B. 结果二", "C. 结果三", "D. 结果四"},
			Answer:     "B",
			Analysis:   "本题需要综合运用所学知识点，按步骤解答...",
			Difficulty: 3,
			Type:       "单选题",
		},
		{
			Order:      3,
			Problem:    "【综合题】综合运用本节知识，分析以下情况...",
			Options:    []string{"A. 方案一", "B. 方案二", "C. 方案三", "D. 方案四"},
			Answer:     "C",
			Analysis:   "本题是综合应用题，需要结合多个知识点进行分析判断...",
			Difficulty: 4,
			Type:       "单选题",
		},
	}
}

// =====================================================
// 学习评估生成
// =====================================================

// GenerateProgressEvaluationRequest 生成学习进度评估请求
type GenerateProgressEvaluationRequest struct {
	UserID    uint   `json:"user_id" validate:"required"`
	CourseID  uint   `json:"course_id,omitempty"`
	ModelName string `json:"model_name,omitempty"`
	Force     bool   `json:"force,omitempty"`
}

// GenerateProgressEvaluation 生成学习进度评估
func (s *AIContentGeneratorService) GenerateProgressEvaluation(ctx context.Context, req GenerateProgressEvaluationRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeUser, req.UserID, model.AIContentTypeProgressEvaluation)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeUser, req.UserID, model.AIContentTypeProgressEvaluation)
		}
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeProgressEvaluation,
		RelatedType: model.AIRelatedTypeUser,
		RelatedID:   req.UserID,
		Title:       "学习进度评估报告",
		Content: model.JSONAIContent{
			Summary:         "根据您的学习数据，为您生成的学习进度评估",
			ProgressPercent: 65.5,
			LearningSteps: []model.LearningStep{
				{Step: 1, Title: "基础巩固", Description: "建议继续强化基础知识点", Duration: 60},
				{Step: 2, Title: "专项突破", Description: "针对薄弱环节进行专项训练", Duration: 90},
				{Step: 3, Title: "真题演练", Description: "开始进行真题模拟练习", Duration: 120},
			},
			WeakPoints: []model.WeakPoint{
				{KnowledgeName: "资料分析-增长率计算", MasteryLevel: 45, Suggestion: "建议加强公式记忆和计算练习"},
				{KnowledgeName: "言语理解-逻辑填空", MasteryLevel: 52, Suggestion: "多积累词汇，注意语境分析"},
			},
			Recommendations: []string{
				"当前学习进度良好，建议保持每日学习节奏",
				"薄弱知识点建议每天额外练习10题",
				"可以开始尝试限时做题，提高答题速度",
			},
			EstimatedTime: 180, // 建议每日学习时间
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// GenerateAbilityReportRequest 生成能力分析报告请求
type GenerateAbilityReportRequest struct {
	UserID    uint   `json:"user_id" validate:"required"`
	ModelName string `json:"model_name,omitempty"`
	Force     bool   `json:"force,omitempty"`
}

// GenerateAbilityReport 生成能力分析报告
func (s *AIContentGeneratorService) GenerateAbilityReport(ctx context.Context, req GenerateAbilityReportRequest) (*model.AIGeneratedContent, error) {
	// 检查是否已存在
	if !req.Force {
		exists, _ := s.contentRepo.Exists(model.AIRelatedTypeUser, req.UserID, model.AIContentTypeAbilityReport)
		if exists {
			return s.contentRepo.GetByRelated(model.AIRelatedTypeUser, req.UserID, model.AIContentTypeAbilityReport)
		}
	}

	content := &model.AIGeneratedContent{
		ContentType: model.AIContentTypeAbilityReport,
		RelatedType: model.AIRelatedTypeUser,
		RelatedID:   req.UserID,
		Title:       "能力分析报告",
		Content: model.JSONAIContent{
			Summary: "综合您的答题数据和学习行为，为您生成的能力分析报告",
			AbilityScores: map[string]int{
				"言语理解与表达": 75,
				"数量关系":    62,
				"判断推理":    78,
				"资料分析":    58,
				"常识判断":    70,
			},
			MainPoints: []string{
				"判断推理能力较强，是您的优势科目",
				"资料分析有较大提升空间，建议重点加强",
				"数量关系需要巩固基础公式和技巧",
			},
			Recommendations: []string{
				"【优势保持】判断推理维持当前水平，定期复习即可",
				"【重点突破】资料分析每日增加20题专项训练",
				"【稳步提升】数量关系注重公式记忆和秒杀技巧",
				"【综合建议】建议制定个性化学习计划，扬长补短",
			},
			WeakPoints: []model.WeakPoint{
				{KnowledgeName: "资料分析", MasteryLevel: 58, Suggestion: "重点加强增长率、比重计算"},
				{KnowledgeName: "数量关系", MasteryLevel: 62, Suggestion: "巩固工程问题、行程问题"},
			},
		},
		Metadata: model.JSONAIMetadata{
			ModelName: req.ModelName,
			Source:    "api",
		},
		Status:      model.AIContentStatusPending,
		Version:     1,
		GeneratedAt: time.Now(),
	}

	if err := s.contentRepo.Create(content); err != nil {
		return nil, fmt.Errorf("保存内容失败: %w", err)
	}

	return content, nil
}

// =====================================================
// 内容获取
// =====================================================

// GetAIContent 获取AI生成内容
func (s *AIContentGeneratorService) GetAIContent(id uint) (*model.AIGeneratedContent, error) {
	return s.contentRepo.GetByID(id)
}

// GetContentByRelated 根据关联获取内容
func (s *AIContentGeneratorService) GetContentByRelated(relatedType model.AIRelatedType, relatedID uint, contentType model.AIContentType) (*model.AIGeneratedContent, error) {
	return s.contentRepo.GetByRelated(relatedType, relatedID, contentType)
}

// GetAllContentsByRelated 获取关联的所有AI内容
func (s *AIContentGeneratorService) GetAllContentsByRelated(relatedType model.AIRelatedType, relatedID uint) ([]model.AIGeneratedContent, error) {
	return s.contentRepo.GetAllByRelated(relatedType, relatedID)
}

// ListContents 获取内容列表
func (s *AIContentGeneratorService) ListContents(params repository.AIContentListParams) ([]model.AIGeneratedContent, int64, error) {
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	return s.contentRepo.List(params)
}

// =====================================================
// 内容审核
// =====================================================

// ApproveContent 审核通过内容
func (s *AIContentGeneratorService) ApproveContent(id uint, approvedBy uint) error {
	return s.contentRepo.UpdateStatus(id, model.AIContentStatusApproved, &approvedBy)
}

// RejectContent 拒绝内容
func (s *AIContentGeneratorService) RejectContent(id uint, approvedBy uint) error {
	return s.contentRepo.UpdateStatus(id, model.AIContentStatusRejected, &approvedBy)
}

// GetPendingContents 获取待审核内容
func (s *AIContentGeneratorService) GetPendingContents(limit int) ([]model.AIGeneratedContent, error) {
	return s.contentRepo.GetPendingContents(limit)
}

// =====================================================
// 辅助函数
// =====================================================

// generateMockAnalysis 生成模拟解析（实际应调用LLM）
func generateMockAnalysis(question *model.Question) string {
	categoryName := "相关知识"
	if question.Category != nil {
		categoryName = question.Category.Name
	}
	return fmt.Sprintf(`
【题目类型】%s
【难度等级】%d

【解析过程】
1. 首先分析题目条件...
2. 根据%s相关知识点...
3. 得出答案为 %s

【考点归纳】
本题主要考查对%s的理解和运用。
`, question.QuestionType, question.Difficulty, categoryName, question.Answer, categoryName)
}
