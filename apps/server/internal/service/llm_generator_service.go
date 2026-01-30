package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

// Prompt 模板常量 - 参考 scripts/content_generator/prompts/
const (
	// 分类描述生成 prompt (300-500字)
	CategoryDescriptionSystemPrompt = `你是一位资深的公务员考试辅导专家，拥有20年的教学经验。

你的任务是为公考课程分类节点生成详细的描述信息，这些信息将用于：
1. 前端页面展示，帮助学员了解课程内容
2. 搜索引擎优化，提高课程的可发现性
3. 学习路径规划，帮助学员选择合适的课程

请严格按照以下 JSON 格式输出，不要包含任何其他内容：

{
  "name": "分类简称（2-8个字，简洁明了）",
  "description": "一句话描述（30-50字，概括核心内容和价值）",
  "long_description": "详细介绍（150-250字，包含：1.该分类的核心内容 2.在考试中的重要性 3.学习该分类能获得的能力提升 4.适合的学习人群）",
  "features": [
    "特点1：具体的功能或亮点（15-25字）",
    "特点2：具体的功能或亮点（15-25字）",
    "特点3：具体的功能或亮点（15-25字）",
    "特点4：具体的功能或亮点（15-25字）"
  ],
  "learning_objectives": [
    "学习目标1：具体可衡量的目标（15-30字）",
    "学习目标2：具体可衡量的目标（15-30字）",
    "学习目标3：具体可衡量的目标（15-30字）"
  ],
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "difficulty": "基础/进阶/提高/冲刺",
  "icon_suggestion": "建议的图标名称（如 book, calculator, brain 等）",
  "color_suggestion": "建议的主题色（如 #6366f1, #10b981 等）"
}

注意事项：
- 不要使用"等等"、"..."这样的模糊表述
- 不要出现占位符或示例内容
- 不要使用过于口语化的表达
- 确保JSON格式正确，可以被直接解析`

	// 课程内容生成 prompt (15000-20000字)
	CourseContentSystemPrompt = `你是一位资深的公务员考试辅导专家，拥有20年的教学经验。你需要根据给定的课程主题，生成高质量的教学内容。

核心要求：内容必须详细充实，每个模块都要有实质内容！

## 输出格式要求

必须输出严格的 JSON 格式，包含以下结构：

{
    "chapter_title": "课程标题",
    "subject": "xingce/shenlun/mianshi/gongji",
    "knowledge_point": "知识点路径",
    "estimated_duration": "60分钟",
    "difficulty_level": "基础/进阶/提高/冲刺",
    
    "exam_analysis": {
        "description": "考情分析（详细描述考试规律和命题特点）",
        "frequency": "考查频率说明",
        "score_weight": "分值占比说明",
        "difficulty_trend": "近年难度趋势",
        "exam_forms": ["考查形式1", "考查形式2"],
        "key_patterns": ["命题规律1", "命题规律2"]
    },
    
    "lesson_content": {
        "introduction": "课程导入（包含引入案例、重要性说明、学习价值）",
        "learning_goals": ["学习目标1", "学习目标2", "学习目标3"],
        "prerequisites": ["前置知识1", "前置知识2"],
        "core_concepts": [
            {
                "name": "概念名称",
                "definition": "概念定义",
                "detailed_explanation": "详细解释（200字以上）",
                "application_scenarios": ["适用场景1", "适用场景2"],
                "example": "具体示例"
            }
        ],
        "method_steps": [
            {
                "step": 1,
                "title": "步骤标题",
                "content": "详细说明（150字以上）",
                "tips": "操作技巧",
                "time_allocation": "建议用时"
            }
        ],
        "formulas": [
            {
                "name": "口诀名称",
                "content": "口诀内容",
                "detailed_explanation": "详细解释",
                "memory_aid": "记忆技巧"
            }
        ],
        "common_mistakes": [
            {
                "mistake": "错误类型",
                "frequency": "错误频率",
                "reason": "错误原因分析",
                "correction": "正确做法"
            }
        ],
        "summary_points": ["核心要点1", "核心要点2"]
    },
    
    "lesson_sections": [
        {
            "order": 1,
            "title": "章节标题",
            "content": "章节内容（详细说明）",
            "section_type": "intro/theory/method/example/warning/drill/summary",
            "duration": "5分钟",
            "key_points": ["重点1", "重点2"]
        }
    ],
    
    "practice_problems": [
        {
            "order": 1,
            "difficulty": "★★★☆☆",
            "problem": "完整题目内容",
            "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
            "answer": "A",
            "analysis": "详细解析（包含审题要点、解题步骤、选项分析）",
            "knowledge_point": "考查知识点"
        }
    ],
    
    "homework": {
        "required": ["必做作业1", "必做作业2"],
        "optional": ["选做作业1"],
        "thinking_questions": ["思考题1"]
    }
}

## 禁止事项

- 禁止使用占位符：不要出现"xxx"、"..."、"此处省略"等
- 禁止内容过短：任何字段都必须有充实的实质内容
- 禁止简单罗列：解析必须有完整的逻辑分析
- 禁止错误信息：引用必须准确`

	// 题目批次生成 prompt (10题×700字)
	QuestionBatchSystemPrompt = `你是一位资深的公务员考试命题专家，拥有丰富的命题经验。你需要根据给定的题目主题，生成高质量的练习题目。

## 内容质量要求

1. **题目数量**：生成 10 道题目
2. **难度分布**：简单2题、中等5题、困难3题
3. **原创性**：题目必须原创，不能直接复制已知真题
4. **解析详细**：每道题解析必须详细充实

## 输出格式

必须输出严格的 JSON 格式：

{
    "batch_info": {
        "category": "大类（如：言语理解）",
        "topic": "题型（如：逻辑填空）",
        "sub_topic": "子题型（如：实词辨析）",
        "batch_number": 1,
        "count": 10,
        "difficulty_distribution": "简单2题、中等5题、困难3题"
    },
    "questions": [
        {
            "content": "完整题干内容（问题描述清晰完整）",
            "options": [
                "A. 选项A（完整表述）",
                "B. 选项B",
                "C. 选项C",
                "D. 选项D"
            ],
            "answer": "A",
            "analysis": "【答案】A\n\n【难度】★★★☆☆\n\n【考点】xxx\n\n【审题要点】...\n\n【解题思路】...\n\n【详细解析】...\n\n【选项分析】\nA项：...\nB项：...\nC项：...\nD项：...\n\n【技巧总结】...\n\n【易错提醒】...",
            "difficulty": 3,
            "question_type": "single_choice",
            "knowledge_points": ["知识点1", "知识点2"],
            "source": "原创",
            "time_suggestion": "45秒"
        }
    ]
}

## 难度等级说明

- 1 = 简单 ★☆☆☆☆
- 2 = 较易 ★★☆☆☆
- 3 = 中等 ★★★☆☆
- 4 = 较难 ★★★★☆
- 5 = 困难 ★★★★★`

	// 素材批次生成 prompt (5条×1000字)
	MaterialBatchSystemPrompt = `你是一位资深的公务员考试申论和面试辅导专家，拥有丰富的素材积累。你需要根据给定的素材主题，生成高质量的学习素材。

## 内容质量要求

1. **素材数量**：每批次生成 5 条素材
2. **内容丰富**：每条素材必须详细充实
3. **实用性强**：素材必须可直接用于申论写作和面试答题
4. **准确性**：引用必须准确，数据必须真实

## 输出格式

必须输出严格的 JSON 格式：

{
    "batch_info": {
        "category": "素材大类（如：名言警句）",
        "topic": "素材主题（如：习近平讲话）",
        "sub_topic": "子主题（如：乡村振兴）",
        "batch_number": 1,
        "count": 5
    },
    "materials": [
        {
            "title": "素材标题/名言出处",
            "quote": "原文金句（20-50字的核心引用内容）",
            "content": "素材完整内容与背景解读（详细说明出处、背景、含义）",
            "source": "出处来源",
            "source_date": "2024-03-05",
            "speaker": "发言人",
            "occasion": "发言场合",
            "material_type": "quote/case/hot_topic/interview/sentence/template",
            "theme": "主题",
            "sub_themes": ["子主题1", "子主题2"],
            "usage_scenarios": [
                {
                    "scenario": "使用场景名称",
                    "example": "完整的使用示例"
                }
            ],
            "related_policies": ["相关政策1", "相关政策2"],
            "writing_segments": [
                {
                    "type": "开头段/论证段/过渡段/结尾段",
                    "content": "可直接使用的范文片段"
                }
            ],
            "tags": ["标签1", "标签2", "标签3"]
        }
    ]
}`
)

const CourseContentModuleSystemPrompt = `你是一位资深的公务员考试辅导专家，拥有20年的教学经验。

你的任务是分段生成课程内容的单个模块，必须满足：
1. 输出严格 JSON，不要任何解释文字
2. 不要使用 Markdown 代码块
3. 内容必须具体、完整、可直接用于教学
4. 只生成所要求的模块，不要输出其他字段
5. 必须保持中文输出，表达规范、专业`

var (
	ErrGenerationFailed      = errors.New("内容生成失败")
	ErrGenerationTimeout     = errors.New("生成超时")
	ErrInvalidGenerationType = errors.New("无效的生成类型")
	ErrGenTaskNotFound       = errors.New("生成任务不存在")
)

// LLMGeneratorService LLM 内容生成服务
type LLMGeneratorService struct {
	llmConfigService     *LLMConfigService
	categoryRepo         *repository.CourseCategoryRepository
	courseRepo           *repository.CourseRepository
	chapterRepo          *repository.CourseChapterRepository
	taskRepo             *repository.GenerationTaskRepository
	contentImportService *ContentImportService // 内容导入服务（可选，用于自动导入）
	logger               *zap.Logger
}

// NewLLMGeneratorService 创建 LLM 生成服务
func NewLLMGeneratorService(
	llmConfigService *LLMConfigService,
	categoryRepo *repository.CourseCategoryRepository,
	courseRepo *repository.CourseRepository,
	chapterRepo *repository.CourseChapterRepository,
	taskRepo *repository.GenerationTaskRepository,
	logger *zap.Logger,
) *LLMGeneratorService {
	return &LLMGeneratorService{
		llmConfigService: llmConfigService,
		categoryRepo:     categoryRepo,
		courseRepo:       courseRepo,
		chapterRepo:      chapterRepo,
		taskRepo:         taskRepo,
		logger:           logger,
	}
}

// =====================================================
// 分类描述生成
// =====================================================

// GenerateCategoryDescriptionRequest 生成分类描述请求
type GenerateCategoryDescriptionRequest struct {
	CategoryID uint `json:"category_id" validate:"required"`
	Force      bool `json:"force,omitempty"` // 强制重新生成
}

// CategoryDescriptionResult 分类描述生成结果
type CategoryDescriptionResult struct {
	Name               string   `json:"name"`
	Description        string   `json:"description"`
	LongDescription    string   `json:"long_description"`
	Features           []string `json:"features"`
	LearningObjectives []string `json:"learning_objectives"`
	Keywords           []string `json:"keywords"`
	Difficulty         string   `json:"difficulty"`
	IconSuggestion     string   `json:"icon_suggestion"`
	ColorSuggestion    string   `json:"color_suggestion"`
}

// GenerateCategoryDescription 生成分类描述
func (s *LLMGeneratorService) GenerateCategoryDescription(ctx context.Context, req GenerateCategoryDescriptionRequest) (*CategoryDescriptionResult, error) {
	// 获取分类信息
	category, err := s.categoryRepo.GetByID(req.CategoryID)
	if err != nil {
		return nil, fmt.Errorf("获取分类失败: %w", err)
	}

	// 构建用户 prompt
	subjectNames := map[string]string{
		"xingce":  "行政职业能力测验（行测）",
		"shenlun": "申论",
		"mianshi": "面试",
		"gongji":  "公共基础知识",
	}

	levelNames := map[int]string{
		1: "科目模块",
		2: "知识分类",
		3: "专题",
	}

	subjectFull := subjectNames[category.Subject]
	if subjectFull == "" {
		subjectFull = category.Subject
	}
	levelName := levelNames[category.Level]
	if levelName == "" {
		levelName = fmt.Sprintf("Level %d", category.Level)
	}

	// 获取父分类名称
	var parentName string
	if category.ParentID != nil && *category.ParentID > 0 {
		parent, err := s.categoryRepo.GetByID(*category.ParentID)
		if err == nil {
			parentName = parent.Name
		}
	}

	userPrompt := fmt.Sprintf(`请为以下公考课程分类生成详细的描述信息：

## 分类信息
- **分类名称**：%s
- **所属科目**：%s
- **层级类型**：%s（Level %d）`, category.Name, subjectFull, levelName, category.Level)

	if parentName != "" {
		userPrompt += fmt.Sprintf("\n- **父级分类**：%s", parentName)
	}

	userPrompt += `

请根据以上信息，生成该分类的详细描述。确保：
1. 描述内容与分类名称和层级相匹配
2. 突出该分类在公考备考中的重要性
3. 提供具体实用的学习建议
4. 严格按照JSON格式输出`

	// 调用 LLM 生成
	response, err := s.llmConfigService.CallWithOptions(
		CategoryDescriptionSystemPrompt+"\n\n"+userPrompt,
		120, // 2分钟超时
		4096,
	)
	if err != nil {
		s.logger.Error("LLM 调用失败", zap.Error(err))
		return nil, fmt.Errorf("%w: %v", ErrGenerationFailed, err)
	}

	// 解析 JSON 响应
	var result CategoryDescriptionResult
	if err := parseJSONResponse(response, &result); err != nil {
		s.logger.Error("JSON 解析失败", zap.Error(err), zap.String("response", response))
		return nil, fmt.Errorf("解析生成结果失败: %w", err)
	}

	// 更新分类信息
	updates := map[string]interface{}{
		"description":         result.Description,
		"long_description":    result.LongDescription,
		"features":            result.Features,
		"learning_objectives": result.LearningObjectives,
		"keywords":            result.Keywords,
		"difficulty":          result.Difficulty,
	}
	if result.IconSuggestion != "" {
		updates["icon"] = result.IconSuggestion
	}
	if result.ColorSuggestion != "" {
		updates["color"] = result.ColorSuggestion
	}

	if err := s.categoryRepo.UpdateFields(req.CategoryID, updates); err != nil {
		s.logger.Warn("更新分类信息失败", zap.Error(err))
	}

	return &result, nil
}

// =====================================================
// 课程内容生成
// =====================================================

// LLMCourseContentRequest LLM课程内容生成请求
type LLMCourseContentRequest struct {
	ChapterID      uint   `json:"chapter_id" validate:"required"`
	ChapterTitle   string `json:"chapter_title,omitempty"`
	Subject        string `json:"subject,omitempty"`
	KnowledgePoint string `json:"knowledge_point,omitempty"`
	Force          bool   `json:"force,omitempty"`
}

// GenerateCourseContent 生成课程内容（异步，创建任务）
func (s *LLMGeneratorService) GenerateCourseContent(ctx context.Context, req LLMCourseContentRequest) (*model.GenerationTask, error) {
	// 获取章节信息
	chapter, err := s.chapterRepo.GetByID(req.ChapterID)
	if err != nil {
		return nil, fmt.Errorf("获取章节失败: %w", err)
	}

	chapterTitle := req.ChapterTitle
	if chapterTitle == "" {
		chapterTitle = chapter.Title
	}

	// 创建生成任务
	targetInfo, _ := json.Marshal(map[string]interface{}{
		"chapter_id":      req.ChapterID,
		"chapter_title":   chapterTitle,
		"subject":         req.Subject,
		"knowledge_point": req.KnowledgePoint,
	})

	task := &model.GenerationTask{
		TaskType:   model.GenerationTaskTypeCourse,
		TargetID:   &req.ChapterID,
		TargetInfo: string(targetInfo),
		Status:     model.GenerationTaskStatusPending,
		CreatedAt:  time.Now(),
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	// 启动异步生成
	go s.executeCourseGeneration(task.ID, chapterTitle, req.Subject, req.KnowledgePoint)

	return task, nil
}

// executeCourseGeneration 执行课程内容生成
func (s *LLMGeneratorService) executeCourseGeneration(taskID uint, chapterTitle, subject, knowledgePoint string) {
	ctx := context.Background()
	startTime := time.Now()

	// 更新任务状态为生成中
	s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusGenerating, "", 0, 0)

	subjectFull := GetSubjectFullName(subject)
	moduleCtx := courseModuleContext{
		ChapterTitle:   chapterTitle,
		Subject:        subject,
		SubjectFull:    subjectFull,
		KnowledgePoint: knowledgePoint,
	}

	// 调用 LLM 分模块生成（确保完整输出）
	response, parsedContent, err := s.generateCourseContentByModules(
		ctx,
		taskID,
		moduleCtx,
		600,   // 单模块超时
		32768, // 单模块 max tokens
	)

	duration := time.Since(startTime).Milliseconds()

	if err != nil {
		s.logger.Error("课程内容生成失败", zap.Error(err))
		s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusFailed, err.Error(), 0, int(duration))
		return
	}

	// 保存结果
	s.taskRepo.UpdateResult(ctx, taskID, response, int(duration))

	// 自动导入（如果可用）
	if s.contentImportService != nil && parsedContent != nil {
		if result, err := s.contentImportService.ImportCourseContent(ctx, 0, parsedContent); err == nil {
			s.logger.Info("课程内容导入成功",
				zap.Uint("task_id", taskID),
				zap.Int("modules_created", result.ModulesCreated),
				zap.Int("word_count", result.WordCount),
			)
		}
	}
}

// =====================================================
// 题目批次生成
// =====================================================

// GenerateQuestionBatchRequest 生成题目批次请求
type GenerateQuestionBatchRequest struct {
	Category string `json:"category" validate:"required"` // 大类
	Topic    string `json:"topic" validate:"required"`    // 题型
	SubTopic string `json:"sub_topic,omitempty"`          // 子题型
	Subject  string `json:"subject,omitempty"`            // 科目
}

// GenerateQuestionBatch 生成题目批次（异步，创建任务）
func (s *LLMGeneratorService) GenerateQuestionBatch(ctx context.Context, req GenerateQuestionBatchRequest) (*model.GenerationTask, error) {
	// 创建生成任务
	targetInfo, _ := json.Marshal(req)

	task := &model.GenerationTask{
		TaskType:   model.GenerationTaskTypeQuestion,
		TargetInfo: string(targetInfo),
		Status:     model.GenerationTaskStatusPending,
		CreatedAt:  time.Now(),
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	// 启动异步生成
	go s.executeQuestionGeneration(task.ID, req)

	return task, nil
}

// executeQuestionGeneration 执行题目生成
func (s *LLMGeneratorService) executeQuestionGeneration(taskID uint, req GenerateQuestionBatchRequest) {
	ctx := context.Background()
	startTime := time.Now()

	// 更新任务状态为生成中
	s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusGenerating, "", 0, 0)

	// 构建用户 prompt
	userPrompt := fmt.Sprintf(`请为以下题型生成一批练习题目：

## 题目信息

- **大类**：%s
- **题型**：%s
- **子题型**：%s
- **科目**：%s

## 生成要求

1. 严格按照系统提示中的 JSON 格式输出
2. 生成 10 道题目
3. 难度分布：简单2题、中等5题、困难3题
4. 每道题解析必须详细
5. 所有内容必须用中文

请开始生成：`, req.Category, req.Topic, req.SubTopic, req.Subject)

	// 调用 LLM 生成
	response, err := s.llmConfigService.CallWithOptions(
		QuestionBatchSystemPrompt+"\n\n"+userPrompt,
		300, // 5分钟超时
		32768,
	)

	duration := time.Since(startTime).Milliseconds()

	if err != nil {
		s.logger.Error("题目生成失败", zap.Error(err))
		s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusFailed, err.Error(), 0, int(duration))
		return
	}

	// 保存结果
	s.taskRepo.UpdateResult(ctx, taskID, response, int(duration))
}

// =====================================================
// 素材批次生成
// =====================================================

// GenerateMaterialBatchRequest 生成素材批次请求
type GenerateMaterialBatchRequest struct {
	Category     string `json:"category" validate:"required"` // 素材大类
	Topic        string `json:"topic" validate:"required"`    // 素材主题
	SubTopic     string `json:"sub_topic,omitempty"`          // 子主题
	MaterialType string `json:"material_type,omitempty"`      // 素材类型
}

// GenerateMaterialBatch 生成素材批次（异步，创建任务）
func (s *LLMGeneratorService) GenerateMaterialBatch(ctx context.Context, req GenerateMaterialBatchRequest) (*model.GenerationTask, error) {
	// 创建生成任务
	targetInfo, _ := json.Marshal(req)

	task := &model.GenerationTask{
		TaskType:   model.GenerationTaskTypeMaterial,
		TargetInfo: string(targetInfo),
		Status:     model.GenerationTaskStatusPending,
		CreatedAt:  time.Now(),
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	// 启动异步生成
	go s.executeMaterialGeneration(task.ID, req)

	return task, nil
}

// executeMaterialGeneration 执行素材生成
func (s *LLMGeneratorService) executeMaterialGeneration(taskID uint, req GenerateMaterialBatchRequest) {
	ctx := context.Background()
	startTime := time.Now()

	// 更新任务状态为生成中
	s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusGenerating, "", 0, 0)

	// 素材类型映射
	materialTypeNames := map[string]string{
		"quote":     "名言警句",
		"case":      "案例素材",
		"hot_topic": "热点专题",
		"interview": "面试素材",
		"sentence":  "优美语句",
		"template":  "答题模板",
	}

	materialTypeName := materialTypeNames[req.MaterialType]
	if materialTypeName == "" {
		materialTypeName = req.MaterialType
	}

	// 构建用户 prompt
	userPrompt := fmt.Sprintf(`请为以下素材主题生成一批学习素材：

## 素材信息

- **素材大类**：%s
- **素材主题**：%s
- **子主题**：%s
- **素材类型**：%s

## 生成要求

1. 严格按照系统提示中的 JSON 格式输出
2. 生成 5 条素材
3. 每条素材内容必须详细充实
4. 引用必须准确，内容必须实用
5. 所有内容必须用中文

请开始生成：`, req.Category, req.Topic, req.SubTopic, materialTypeName)

	// 调用 LLM 生成
	response, err := s.llmConfigService.CallWithOptions(
		MaterialBatchSystemPrompt+"\n\n"+userPrompt,
		300, // 5分钟超时
		32768,
	)

	duration := time.Since(startTime).Milliseconds()

	if err != nil {
		s.logger.Error("素材生成失败", zap.Error(err))
		s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusFailed, err.Error(), 0, int(duration))
		return
	}

	// 保存结果
	s.taskRepo.UpdateResult(ctx, taskID, response, int(duration))
}

// =====================================================
// 任务管理
// =====================================================

// GetTask 获取任务
func (s *LLMGeneratorService) GetTask(id uint) (*model.GenerationTask, error) {
	return s.taskRepo.GetByID(id)
}

// ListTasks 列出任务
func (s *LLMGeneratorService) ListTasks(taskType string, status string, page, pageSize int) ([]model.GenerationTask, int64, error) {
	return s.taskRepo.List(taskType, status, page, pageSize)
}

// CancelTask 取消任务
func (s *LLMGeneratorService) CancelTask(id uint) error {
	task, err := s.taskRepo.GetByID(id)
	if err != nil {
		return ErrGenTaskNotFound
	}

	if task.Status == model.GenerationTaskStatusCompleted {
		return errors.New("已完成的任务无法取消")
	}

	return s.taskRepo.UpdateStatus(id, model.GenerationTaskStatusCancelled, "用户取消", 0, 0)
}

// =====================================================
// 辅助函数
// =====================================================

// parseJSONResponse 解析 JSON 响应
func parseJSONResponse(response string, result interface{}) error {
	cleanContent := normalizeJSONResponse(response)
	return json.Unmarshal([]byte(cleanContent), result)
}

const (
	// 0 表示不限制续写次数（无限续写）
	courseContentContinuationMaxAttempts   = 0
	courseContentContinuationMaxNoProgress = 8
	courseContentContinuationTailRunes     = 1200
	courseContentContinuationOverlapRunes  = 800
)

// normalizeJSONResponse 清理代码块与非 JSON 文本
func normalizeJSONResponse(response string) string {
	clean := strings.TrimSpace(response)
	clean = strings.ReplaceAll(clean, "```json", "")
	clean = strings.ReplaceAll(clean, "```", "")
	clean = strings.TrimSpace(clean)

	if extracted, _ := extractTopLevelJSONObject(clean); extracted != "" {
		return extracted
	}
	return clean
}

// extractTopLevelJSONObject 提取顶层 JSON 对象（避免截断为局部对象）
func extractTopLevelJSONObject(input string) (string, bool) {
	start := strings.Index(input, "{")
	if start == -1 {
		return "", false
	}

	inString := false
	escape := false
	depth := 0

	for i := start; i < len(input); i++ {
		ch := input[i]

		if inString {
			if escape {
				escape = false
				continue
			}
			if ch == '\\' {
				escape = true
				continue
			}
			if ch == '"' {
				inString = false
			}
			continue
		}

		if ch == '"' {
			inString = true
			continue
		}
		if ch == '{' {
			depth++
		} else if ch == '}' {
			depth--
			if depth == 0 {
				return strings.TrimSpace(input[start : i+1]), true
			}
		}
	}

	return strings.TrimSpace(input[start:]), false
}

func tailRunes(s string, max int) string {
	r := []rune(s)
	if len(r) <= max {
		return s
	}
	return string(r[len(r)-max:])
}

func mergeWithOverlap(base, addition string, maxOverlap int) string {
	if base == "" {
		return addition
	}
	baseRunes := []rune(base)
	addRunes := []rune(addition)
	max := maxOverlap
	if len(baseRunes) < max {
		max = len(baseRunes)
	}
	if len(addRunes) < max {
		max = len(addRunes)
	}
	for i := max; i > 0; i-- {
		if string(baseRunes[len(baseRunes)-i:]) == string(addRunes[:i]) {
			return string(baseRunes) + string(addRunes[i:])
		}
	}
	return base + addition
}

func buildContinuationPrompt(partial string) string {
	clean := strings.TrimSpace(partial)
	clean = strings.ReplaceAll(clean, "```json", "")
	clean = strings.ReplaceAll(clean, "```", "")
	tail := tailRunes(clean, courseContentContinuationTailRunes)

	return fmt.Sprintf(
		"你上一次输出未完成，请从中断处继续补全 JSON。\\n"+
			"严禁重复：请不要重复任何已经输出过的字符或字段。\\n"+
			"如果你不确定从哪里继续，请只输出“剩余部分”，避免任何重叠。\\n\\n"+
			"要求（必须严格遵守）：\\n"+
			"1. 只输出剩余 JSON 内容，不要重复已输出内容\\n"+
			"2. 不要输出解释文字，不要使用 Markdown 代码块\\n"+
			"3. 不要重新输出开头或已出现的对象/数组/字段\\n"+
			"4. 若前文在字符串中断，请直接续写该字符串的剩余内容\\n"+
			"5. 若前文在数组/对象中断，请仅补全剩余元素并闭合括号\\n"+
			"6. 最终输出必须与之前内容拼接后构成完整 JSON\\n\\n"+
			"上一段输出的结尾（仅供定位，不要重复）：\\n%s", tail)
}

func parseCourseContentFromResponse(response string) (*model.GeneratedCourseContent, error) {
	clean := normalizeJSONResponse(response)
	if clean == "" {
		return nil, errors.New("empty response")
	}
	if !strings.Contains(clean, `"chapter_title"`) || !strings.Contains(clean, `"lesson_content"`) {
		return nil, errors.New("missing required fields")
	}
	var content model.GeneratedCourseContent
	if err := json.Unmarshal([]byte(clean), &content); err != nil {
		return nil, err
	}
	if !isCourseContentComplete(&content) {
		return nil, errors.New("content incomplete")
	}
	return &content, nil
}

func isCourseContentComplete(content *model.GeneratedCourseContent) bool {
	if content == nil {
		return false
	}
	if strings.TrimSpace(content.ChapterTitle) == "" {
		return false
	}
	if strings.TrimSpace(content.Subject) == "" {
		return false
	}
	if strings.TrimSpace(content.KnowledgePoint) == "" {
		return false
	}
	if strings.TrimSpace(content.ExamAnalysis.Description) == "" {
		return false
	}
	if strings.TrimSpace(content.LessonContent.Introduction) == "" {
		return false
	}
	if len(content.LessonContent.LearningGoals) == 0 {
		return false
	}
	if len(content.LessonContent.CoreConcepts) == 0 {
		return false
	}
	if len(content.LessonContent.MethodSteps) == 0 {
		return false
	}
	if len(content.LessonSections) == 0 {
		return false
	}
	if len(content.PracticeProblems) == 0 {
		return false
	}
	return true
}

func (s *LLMGeneratorService) generateCourseContentWithContinuation(
	taskID uint,
	systemPrompt string,
	userPrompt string,
	timeoutSeconds int,
	maxTokens int,
) (string, *model.GeneratedCourseContent, error) {
	basePrompt := systemPrompt + "\n\n" + userPrompt
	combined := ""
	var lastParseErr error
	attempt := 0
	noProgress := 0

	for {
		prompt := basePrompt
		if attempt > 0 {
			prompt = systemPrompt + "\n\n" + buildContinuationPrompt(combined)
		}

		response, err := s.llmConfigService.CallWithOptions(prompt, timeoutSeconds, maxTokens)
		if err != nil {
			return combined, nil, err
		}

		prevLen := len(combined)
		if combined == "" {
			combined = response
		} else {
			combined = mergeWithOverlap(combined, response, courseContentContinuationOverlapRunes)
		}
		if len(combined) <= prevLen+10 {
			noProgress++
		} else {
			noProgress = 0
		}

		if content, err := parseCourseContentFromResponse(combined); err == nil {
			return combined, content, nil
		} else {
			lastParseErr = err
		}

		if content, err := parseCourseContentFromResponse(response); err == nil {
			return response, content, nil
		}

		attempt++

		if courseContentContinuationMaxAttempts > 0 && attempt > courseContentContinuationMaxAttempts {
			s.logger.Warn("课程内容续写达到上限，返回部分内容",
				zap.Uint("task_id", taskID),
				zap.Int("attempts", attempt),
				zap.Error(lastParseErr),
			)
			break
		}

		if noProgress >= courseContentContinuationMaxNoProgress {
			s.logger.Warn("课程内容续写无进展，终止继续",
				zap.Uint("task_id", taskID),
				zap.Int("attempts", attempt),
				zap.Error(lastParseErr),
			)
			break
		}

		s.logger.Warn("课程内容未完成，继续续写",
			zap.Uint("task_id", taskID),
			zap.Int("attempt", attempt),
			zap.Error(lastParseErr),
		)
	}

	return combined, nil, nil
}

type courseModuleContext struct {
	ChapterTitle   string
	Subject        string
	SubjectFull    string
	KnowledgePoint string
	Section        string
	Subsection     string
	ParentTopic    string
}

func buildCourseModuleBaseInfo(ctx courseModuleContext) string {
	section := ctx.Section
	if section == "" {
		section = "未分类"
	}
	subsection := ctx.Subsection
	if subsection == "" {
		subsection = "未分类"
	}
	parent := ctx.ParentTopic
	if parent == "" {
		parent = "无"
	}
	subject := ctx.SubjectFull
	if subject == "" {
		subject = ctx.Subject
	}
	return fmt.Sprintf(
		"## 课程信息\n- 章节标题：%s\n- 科目：%s\n- 知识点：%s\n- 章节：%s\n- 小节：%s\n- 父主题：%s",
		ctx.ChapterTitle, subject, ctx.KnowledgePoint, section, subsection, parent,
	)
}

func buildModulePrompt(ctx courseModuleContext, moduleName string, schema string, requirements []string, hints []string) string {
	baseInfo := buildCourseModuleBaseInfo(ctx)
	reqLines := strings.Join(requirements, "\n")
	hintLines := ""
	if len(hints) > 0 {
		hintLines = "\n\n参考信息：\n- " + strings.Join(hints, "\n- ")
	}
	return fmt.Sprintf(
		"请生成课程内容的「%s」模块。\n\n%s%s\n\n输出要求：\n%s\n\n输出 JSON 格式：\n%s",
		moduleName, baseInfo, hintLines, reqLines, schema,
	)
}

func buildModuleContinuationPrompt(moduleName, partial string) string {
	return fmt.Sprintf("模块：%s\n%s", moduleName, buildContinuationPrompt(partial))
}

func parseJSONModule(response string, target interface{}) error {
	clean := normalizeJSONResponse(response)
	if strings.TrimSpace(clean) == "" {
		return errors.New("empty response")
	}
	return json.Unmarshal([]byte(clean), target)
}

func (s *LLMGeneratorService) generateModuleWithContinuation(
	taskID uint,
	moduleName string,
	systemPrompt string,
	userPrompt string,
	timeoutSeconds int,
	maxTokens int,
	parse func(string) error,
) (string, error) {
	basePrompt := systemPrompt + "\n\n" + userPrompt
	combined := ""
	var lastParseErr error
	attempt := 0
	noProgress := 0

	for {
		prompt := basePrompt
		if attempt > 0 {
			prompt = systemPrompt + "\n\n" + buildModuleContinuationPrompt(moduleName, combined)
		}

		response, err := s.llmConfigService.CallWithOptions(prompt, timeoutSeconds, maxTokens)
		if err != nil {
			return combined, err
		}

		prevLen := len(combined)
		if combined == "" {
			combined = response
		} else {
			combined = mergeWithOverlap(combined, response, courseContentContinuationOverlapRunes)
		}
		if len(combined) <= prevLen+10 {
			noProgress++
		} else {
			noProgress = 0
		}

		if err := parse(combined); err == nil {
			return combined, nil
		} else {
			lastParseErr = err
		}

		if err := parse(response); err == nil {
			return response, nil
		}

		attempt++
		if courseContentContinuationMaxAttempts > 0 && attempt > courseContentContinuationMaxAttempts {
			s.logger.Warn("模块续写达到上限，返回部分内容",
				zap.Uint("task_id", taskID),
				zap.String("module", moduleName),
				zap.Int("attempts", attempt),
				zap.Error(lastParseErr),
			)
			break
		}

		if noProgress >= courseContentContinuationMaxNoProgress {
			s.logger.Warn("模块续写无进展，终止继续",
				zap.Uint("task_id", taskID),
				zap.String("module", moduleName),
				zap.Int("attempts", attempt),
				zap.Error(lastParseErr),
			)
			break
		}

		s.logger.Warn("模块未完成，继续续写",
			zap.Uint("task_id", taskID),
			zap.String("module", moduleName),
			zap.Int("attempt", attempt),
			zap.Error(lastParseErr),
		)
	}

	return combined, lastParseErr
}

func (s *LLMGeneratorService) generateCourseContentByModules(
	ctx context.Context,
	taskID uint,
	moduleCtx courseModuleContext,
	timeoutSeconds int,
	maxTokens int,
) (string, *model.GeneratedCourseContent, error) {
	_ = ctx
	content := &model.GeneratedCourseContent{}

	baseRequirements := []string{
		"必须输出严格 JSON，不要解释文字",
		"不要使用 Markdown 代码块",
		"内容必须详细具体，不要占位符",
		"只输出所要求模块",
	}

	// 1) 课程元信息
	{
		schema := `{
  "chapter_title": "课程标题",
  "subject": "xingce/shenlun/mianshi/gongji",
  "knowledge_point": "知识点路径",
  "estimated_duration": "60分钟",
  "difficulty_level": "基础/进阶/提高/冲刺",
  "word_count_target": "15000-20000字"
}`
		userPrompt := buildModulePrompt(moduleCtx, "课程元信息", schema, baseRequirements, nil)
		var meta struct {
			ChapterTitle      string `json:"chapter_title"`
			Subject           string `json:"subject"`
			KnowledgePoint    string `json:"knowledge_point"`
			EstimatedDuration string `json:"estimated_duration"`
			DifficultyLevel   string `json:"difficulty_level"`
			WordCountTarget   string `json:"word_count_target"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "课程元信息", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &meta); err != nil {
				return err
			}
			if strings.TrimSpace(meta.ChapterTitle) == "" || strings.TrimSpace(meta.Subject) == "" {
				return errors.New("missing meta fields")
			}
			return nil
		})
		if err != nil {
			return "", nil, err
		}
		content.ChapterTitle = meta.ChapterTitle
		content.Subject = meta.Subject
		content.KnowledgePoint = meta.KnowledgePoint
		content.EstimatedDuration = meta.EstimatedDuration
		content.DifficultyLevel = meta.DifficultyLevel
		content.WordCountTarget = meta.WordCountTarget
	}

	// 2) 考情分析
	{
		schema := `{
  "exam_analysis": {
    "description": "考情分析（详细）",
    "frequency": "考查频率说明",
    "score_weight": "分值占比说明",
    "difficulty_trend": "近年难度趋势",
    "exam_forms": ["考查形式1", "考查形式2"],
    "key_patterns": ["命题规律1", "命题规律2"],
    "recent_trends": "最新趋势（可选）"
  }
}`
		userPrompt := buildModulePrompt(moduleCtx, "考情分析", schema, baseRequirements, nil)
		var wrap struct {
			ExamAnalysis model.GenExamAnalysis `json:"exam_analysis"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "考情分析", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if strings.TrimSpace(wrap.ExamAnalysis.Description) == "" {
				return errors.New("empty exam_analysis")
			}
			return nil
		})
		if err != nil {
			return "", nil, err
		}
		content.ExamAnalysis = wrap.ExamAnalysis
	}

	// 3) 课程导入 + 目标 + 前置
	{
		schema := `{
  "lesson_content": {
    "introduction": "课程导入（包含引入案例、重要性说明、学习价值）",
    "learning_goals": ["学习目标1", "学习目标2", "学习目标3"],
    "prerequisites": ["前置知识1", "前置知识2"]
  }
}`
		userPrompt := buildModulePrompt(moduleCtx, "课程导入与学习目标", schema, baseRequirements, nil)
		var wrap struct {
			LessonContent struct {
				Introduction  string   `json:"introduction"`
				LearningGoals []string `json:"learning_goals"`
				Prerequisites []string `json:"prerequisites"`
			} `json:"lesson_content"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "课程导入与学习目标", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if strings.TrimSpace(wrap.LessonContent.Introduction) == "" || len(wrap.LessonContent.LearningGoals) == 0 {
				return errors.New("lesson intro incomplete")
			}
			return nil
		})
		if err != nil {
			return "", nil, err
		}
		content.LessonContent.Introduction = wrap.LessonContent.Introduction
		content.LessonContent.LearningGoals = wrap.LessonContent.LearningGoals
		content.LessonContent.Prerequisites = wrap.LessonContent.Prerequisites
	}

	// 4) 核心概念
	{
		schema := `{
  "core_concepts": [
    {
      "name": "概念名称",
      "definition": "概念定义",
      "detailed_explanation": "详细解释（200字以上）",
      "application_scenarios": ["适用场景1", "适用场景2"],
      "example": "具体示例",
      "common_pairs": ["常见搭配1", "常见搭配2"]
    }
  ]
}`
		userPrompt := buildModulePrompt(moduleCtx, "核心概念", schema, baseRequirements, nil)
		var wrap struct {
			CoreConcepts []model.GenCoreConcept `json:"core_concepts"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "核心概念", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if len(wrap.CoreConcepts) == 0 {
				return errors.New("core_concepts empty")
			}
			return nil
		})
		if err != nil {
			return "", nil, err
		}
		content.LessonContent.CoreConcepts = wrap.CoreConcepts
	}

	coreConceptNames := []string{}
	for _, c := range content.LessonContent.CoreConcepts {
		if strings.TrimSpace(c.Name) != "" {
			coreConceptNames = append(coreConceptNames, c.Name)
		}
	}

	// 5) 方法步骤
	{
		schema := `{
  "method_steps": [
    {
      "step": 1,
      "title": "步骤标题",
      "content": "详细说明（150字以上）",
      "tips": "操作技巧",
      "time_allocation": "建议用时",
      "common_errors": "常见错误",
      "key_signals": ["关键提示1", "关键提示2"]
    }
  ]
}`
		hints := []string{}
		if len(coreConceptNames) > 0 {
			hints = append(hints, "核心概念："+strings.Join(coreConceptNames, "、"))
		}
		userPrompt := buildModulePrompt(moduleCtx, "方法步骤", schema, baseRequirements, hints)
		var wrap struct {
			MethodSteps []model.GenMethodStep `json:"method_steps"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "方法步骤", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if len(wrap.MethodSteps) == 0 {
				return errors.New("method_steps empty")
			}
			return nil
		})
		if err != nil {
			return "", nil, err
		}
		content.LessonContent.MethodSteps = wrap.MethodSteps
	}

	// 6) 记忆口诀（可选）
	{
		schema := `{
  "formulas": [
    {
      "name": "口诀名称",
      "content": "口诀内容",
      "detailed_explanation": "详细解释",
      "memory_aid": "记忆技巧",
      "examples": ["例子1", "例子2"]
    }
  ]
}`
		userPrompt := buildModulePrompt(moduleCtx, "记忆口诀", schema, baseRequirements, nil)
		var wrap struct {
			Formulas []model.GenFormula `json:"formulas"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "记忆口诀", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if len(wrap.Formulas) == 0 {
				return errors.New("formulas empty")
			}
			return nil
		})
		if err == nil {
			content.LessonContent.Formulas = wrap.Formulas
		} else {
			s.logger.Warn("记忆口诀生成失败，跳过该模块", zap.Uint("task_id", taskID), zap.Error(err))
		}
	}

	// 7) 记忆技巧（可选）
	{
		schema := `{
  "memory_tips": [
    {
      "tip": "技巧标题",
      "content": "技巧说明",
      "example": "示例",
      "word_pairs": ["词组1", "词组2"]
    }
  ]
}`
		userPrompt := buildModulePrompt(moduleCtx, "记忆技巧", schema, baseRequirements, nil)
		var wrap struct {
			MemoryTips []model.GenMemoryTip `json:"memory_tips"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "记忆技巧", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if len(wrap.MemoryTips) == 0 {
				return errors.New("memory_tips empty")
			}
			return nil
		})
		if err == nil {
			content.LessonContent.MemoryTips = wrap.MemoryTips
		} else {
			s.logger.Warn("记忆技巧生成失败，跳过该模块", zap.Uint("task_id", taskID), zap.Error(err))
		}
	}

	// 8) 易错点（可选）
	{
		schema := `{
  "common_mistakes": [
    {
      "mistake": "错误类型",
      "frequency": "错误频率",
      "reason": "错误原因分析",
      "correction": "正确做法",
      "prevention": "预防建议"
    }
  ]
}`
		userPrompt := buildModulePrompt(moduleCtx, "易错点", schema, baseRequirements, nil)
		var wrap struct {
			CommonMistakes []model.GenCommonMistake `json:"common_mistakes"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "易错点", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if len(wrap.CommonMistakes) == 0 {
				return errors.New("common_mistakes empty")
			}
			return nil
		})
		if err == nil {
			content.LessonContent.CommonMistakes = wrap.CommonMistakes
		} else {
			s.logger.Warn("易错点生成失败，跳过该模块", zap.Uint("task_id", taskID), zap.Error(err))
		}
	}

	// 9) 应试策略（可选）
	{
		schema := `{
  "exam_strategies": [
    {
      "strategy": "策略名称",
      "content": "策略说明"
    }
  ]
}`
		userPrompt := buildModulePrompt(moduleCtx, "应试策略", schema, baseRequirements, nil)
		var wrap struct {
			ExamStrategies []model.GenExamStrategy `json:"exam_strategies"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "应试策略", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if len(wrap.ExamStrategies) == 0 {
				return errors.New("exam_strategies empty")
			}
			return nil
		})
		if err == nil {
			content.LessonContent.ExamStrategies = wrap.ExamStrategies
		} else {
			s.logger.Warn("应试策略生成失败，跳过该模块", zap.Uint("task_id", taskID), zap.Error(err))
		}
	}

	// 10) 高频词汇（可选）
	{
		schema := `{
  "vocabulary_accumulation": {
    "must_know": ["高频词组1", "高频词组2"],
    "should_know": ["常考词组1", "常考词组2"],
    "nice_to_know": ["拓展词组1", "拓展词组2"]
  }
}`
		userPrompt := buildModulePrompt(moduleCtx, "高频词汇积累", schema, baseRequirements, nil)
		var wrap struct {
			VocabularyAccumulation *model.GenVocabularyAccum `json:"vocabulary_accumulation"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "高频词汇积累", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if wrap.VocabularyAccumulation == nil {
				return errors.New("vocabulary_accumulation empty")
			}
			if len(wrap.VocabularyAccumulation.MustKnow) == 0 {
				return errors.New("must_know empty")
			}
			return nil
		})
		if err == nil {
			content.LessonContent.VocabularyAccum = wrap.VocabularyAccumulation
		} else {
			s.logger.Warn("高频词汇生成失败，跳过该模块", zap.Uint("task_id", taskID), zap.Error(err))
		}
	}

	// 11) 拓展知识 + 总结 + 思维导图（可选）
	{
		schema := `{
  "extension_knowledge": "拓展知识内容",
  "summary_points": ["核心要点1", "核心要点2"],
  "mind_map_mermaid": "mindmap\n  root((主题))\n    分支1\n      子项"
}`
		userPrompt := buildModulePrompt(moduleCtx, "拓展知识与总结", schema, baseRequirements, nil)
		var wrap struct {
			ExtensionKnowledge string   `json:"extension_knowledge"`
			SummaryPoints      []string `json:"summary_points"`
			MindMapMermaid     string   `json:"mind_map_mermaid"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "拓展知识与总结", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if strings.TrimSpace(wrap.ExtensionKnowledge) == "" || len(wrap.SummaryPoints) == 0 {
				return errors.New("extension summary empty")
			}
			return nil
		})
		if err == nil {
			content.LessonContent.ExtensionKnow = wrap.ExtensionKnowledge
			content.LessonContent.SummaryPoints = wrap.SummaryPoints
			content.LessonContent.MindMapMermaid = wrap.MindMapMermaid
		} else {
			s.logger.Warn("拓展知识生成失败，跳过该模块", zap.Uint("task_id", taskID), zap.Error(err))
		}
	}

	// 12) 快速笔记（可选）
	{
		schema := `{
  "quick_notes": {
    "formulas": [
      {
        "name": "口诀名称",
        "content": "口诀内容",
        "explanation": "解释说明"
      }
    ],
    "key_points": ["要点1", "要点2"],
    "common_mistakes": [
      {
        "mistake": "错误点",
        "correction": "纠正建议"
      }
    ],
    "exam_tips": ["技巧1", "技巧2"]
  }
}`
		userPrompt := buildModulePrompt(moduleCtx, "快速笔记", schema, baseRequirements, nil)
		var wrap struct {
			QuickNotes *model.GenQuickNotes `json:"quick_notes"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "快速笔记", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if wrap.QuickNotes == nil || len(wrap.QuickNotes.KeyPoints) == 0 {
				return errors.New("quick_notes empty")
			}
			return nil
		})
		if err == nil {
			content.LessonContent.QuickNotes = wrap.QuickNotes
		} else {
			s.logger.Warn("快速笔记生成失败，跳过该模块", zap.Uint("task_id", taskID), zap.Error(err))
		}
	}

	// 13) 课程章节
	{
		schema := `{
  "lesson_sections": [
    {
      "order": 1,
      "title": "章节标题",
      "content": "章节内容（详细说明）",
      "section_type": "intro/theory/method/example/warning/drill/summary",
      "duration": "5分钟",
      "key_points": ["重点1", "重点2"]
    }
  ]
}`
		hints := []string{}
		if len(coreConceptNames) > 0 {
			hints = append(hints, "核心概念："+strings.Join(coreConceptNames, "、"))
		}
		buildLessonSectionsPrompt := func(rangeName string, startOrder int, count int) string {
			requirements := append([]string{}, baseRequirements...)
			requirements = append(requirements,
				fmt.Sprintf("请生成 %d 个章节段落，order 从 %d 开始连续递增，到 %d 为止", count, startOrder, startOrder+count-1),
				"不要输出范围外的章节，不要重复已有章节",
			)
			return buildModulePrompt(moduleCtx, "课程章节内容"+rangeName, schema, requirements, hints)
		}

		totalSections := 9
		sectionsPerPage := 3
		for start := 1; start <= totalSections; start += sectionsPerPage {
			count := sectionsPerPage
			if start+count-1 > totalSections {
				count = totalSections - start + 1
			}
			rangeName := fmt.Sprintf("（第%d-%d节）", start, start+count-1)
			var wrap struct {
				LessonSections []model.GenLessonSection `json:"lesson_sections"`
			}
			_, err := s.generateModuleWithContinuation(
				taskID,
				"课程章节内容"+rangeName,
				CourseContentModuleSystemPrompt,
				buildLessonSectionsPrompt(rangeName, start, count),
				timeoutSeconds,
				maxTokens,
				func(resp string) error {
					if err := parseJSONModule(resp, &wrap); err != nil {
						return err
					}
					if len(wrap.LessonSections) == 0 {
						return errors.New("lesson_sections empty")
					}
					return nil
				},
			)
			if err != nil {
				return "", nil, err
			}
			content.LessonSections = append(content.LessonSections, wrap.LessonSections...)
		}
		sort.Slice(content.LessonSections, func(i, j int) bool {
			return content.LessonSections[i].Order < content.LessonSections[j].Order
		})
	}

	// 14) 练习题目（分页生成）
	{
		schema := `{
  "practice_problems": [
    {
      "order": 1,
      "difficulty": "★★★☆☆",
      "problem": "完整题目内容",
      "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
      "answer": "A",
      "analysis": "详细解析（包含审题要点、解题步骤、选项分析）",
      "knowledge_point": "考查知识点"
    }
  ]
}`
		hints := []string{}
		if len(coreConceptNames) > 0 {
			hints = append(hints, "核心概念："+strings.Join(coreConceptNames, "、"))
		}
		buildPracticePrompt := func(rangeName string, startOrder int, count int) string {
			requirements := append([]string{}, baseRequirements...)
			requirements = append(requirements,
				fmt.Sprintf("请生成 %d 道题目，order 从 %d 开始连续递增，到 %d 为止", count, startOrder, startOrder+count-1),
				"不要输出范围外的题目，不要重复已有题目",
			)
			return buildModulePrompt(moduleCtx, "练习题目"+rangeName, schema, requirements, hints)
		}

		totalProblems := 12
		problemsPerPage := 4
		for start := 1; start <= totalProblems; start += problemsPerPage {
			count := problemsPerPage
			if start+count-1 > totalProblems {
				count = totalProblems - start + 1
			}
			rangeName := fmt.Sprintf("（第%d-%d题）", start, start+count-1)
			var wrap struct {
				PracticeProblems []model.GenPracticeItem `json:"practice_problems"`
			}
			_, err := s.generateModuleWithContinuation(
				taskID,
				"练习题目"+rangeName,
				CourseContentModuleSystemPrompt,
				buildPracticePrompt(rangeName, start, count),
				timeoutSeconds,
				maxTokens,
				func(resp string) error {
					if err := parseJSONModule(resp, &wrap); err != nil {
						return err
					}
					if len(wrap.PracticeProblems) == 0 {
						return errors.New("practice_problems empty")
					}
					return nil
				},
			)
			if err != nil {
				return "", nil, err
			}
			content.PracticeProblems = append(content.PracticeProblems, wrap.PracticeProblems...)
		}
		sort.Slice(content.PracticeProblems, func(i, j int) bool {
			return content.PracticeProblems[i].Order < content.PracticeProblems[j].Order
		})
	}

	// 15) 课后作业（可选）
	{
		schema := `{
  "homework": {
    "required": ["必做作业1", "必做作业2"],
    "optional": ["选做作业1"],
    "thinking_questions": ["思考题1"]
  }
}`
		userPrompt := buildModulePrompt(moduleCtx, "课后作业", schema, baseRequirements, nil)
		var wrap struct {
			Homework model.GenHomeworkContent `json:"homework"`
		}
		_, err := s.generateModuleWithContinuation(taskID, "课后作业", CourseContentModuleSystemPrompt, userPrompt, timeoutSeconds, maxTokens, func(resp string) error {
			if err := parseJSONModule(resp, &wrap); err != nil {
				return err
			}
			if len(wrap.Homework.Required) == 0 && len(wrap.Homework.Optional) == 0 && len(wrap.Homework.ThinkingQuestions) == 0 {
				return errors.New("homework empty")
			}
			return nil
		})
		if err == nil {
			content.Homework = wrap.Homework
		} else {
			s.logger.Warn("课后作业生成失败，跳过该模块", zap.Uint("task_id", taskID), zap.Error(err))
		}
	}

	if !isCourseContentComplete(content) {
		return "", nil, errors.New("course content incomplete after module generation")
	}

	finalBytes, err := json.Marshal(content)
	if err != nil {
		return "", nil, err
	}
	return string(finalBytes), content, nil
}

// =====================================================
// V2 增强版：批量生成与自动导入
// =====================================================

// SetContentImportService 设置内容导入服务（用于自动导入）
func (s *LLMGeneratorService) SetContentImportService(importService *ContentImportService) {
	s.contentImportService = importService
}

// contentImportService 内容导入服务（可选）
var _ = (*LLMGeneratorService)(nil) // 确保接口实现

// GenerateCourseContentV2Request 生成课程内容请求（V2增强版）
type GenerateCourseContentV2Request struct {
	ChapterID      uint   `json:"chapter_id" validate:"required"`
	ChapterTitle   string `json:"chapter_title,omitempty"`
	Subject        string `json:"subject,omitempty"`
	KnowledgePoint string `json:"knowledge_point,omitempty"`
	ParentTopic    string `json:"parent_topic,omitempty"`
	Section        string `json:"section,omitempty"`
	Subsection     string `json:"subsection,omitempty"`
	AutoApprove    bool   `json:"auto_approve,omitempty"`
	AutoImport     bool   `json:"auto_import,omitempty"`
	// 从前端传入的 prompt（可选，如果不传则使用后端默认）
	SystemPrompt       string `json:"system_prompt,omitempty"`
	UserPromptTemplate string `json:"user_prompt_template,omitempty"`
}

// GenerateCourseContentV2 生成课程内容（V2增强版：使用高质量Prompt）
func (s *LLMGeneratorService) GenerateCourseContentV2(ctx context.Context, req GenerateCourseContentV2Request) (*model.GenerationTask, error) {
	// 获取章节信息
	chapter, err := s.chapterRepo.GetByID(req.ChapterID)
	if err != nil {
		return nil, fmt.Errorf("获取章节失败: %w", err)
	}

	chapterTitle := req.ChapterTitle
	if chapterTitle == "" {
		chapterTitle = chapter.Title
	}

	// 创建生成任务
	targetInfo, _ := json.Marshal(map[string]interface{}{
		"chapter_id":      req.ChapterID,
		"chapter_title":   chapterTitle,
		"subject":         req.Subject,
		"knowledge_point": req.KnowledgePoint,
		"auto_approve":    req.AutoApprove,
		"auto_import":     req.AutoImport,
	})

	task := &model.GenerationTask{
		TaskType:   model.GenerationTaskTypeCourse,
		TargetID:   &req.ChapterID,
		TargetInfo: string(targetInfo),
		Status:     model.GenerationTaskStatusPending,
		CreatedAt:  time.Now(),
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	// 启动异步生成
	go s.executeCourseGenerationV2(task.ID, req)

	return task, nil
}

// executeCourseGenerationV2 执行课程内容生成（V2增强版）
func (s *LLMGeneratorService) executeCourseGenerationV2(taskID uint, req GenerateCourseContentV2Request) {
	ctx := context.Background()
	startTime := time.Now()

	// 更新任务状态为生成中
	s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusGenerating, "", 0, 0)

	// 获取章节标题
	chapterTitle := req.ChapterTitle
	if chapterTitle == "" {
		if chapter, err := s.chapterRepo.GetByID(req.ChapterID); err == nil {
			chapterTitle = chapter.Title
		}
	}

	subjectFull := GetSubjectFullName(req.Subject)

	s.logger.Info("开始生成课程内容（分模块）",
		zap.Uint("task_id", taskID),
		zap.String("chapter_title", chapterTitle),
		zap.Bool("use_frontend_prompt", req.SystemPrompt != ""))

	moduleCtx := courseModuleContext{
		ChapterTitle:   chapterTitle,
		Subject:        req.Subject,
		SubjectFull:    subjectFull,
		KnowledgePoint: req.KnowledgePoint,
		Section:        req.Section,
		Subsection:     req.Subsection,
		ParentTopic:    req.ParentTopic,
	}

	// 调用 LLM 分模块生成（确保完整输出）
	response, parsedContent, err := s.generateCourseContentByModules(
		ctx,
		taskID,
		moduleCtx,
		600,   // 单模块超时
		32768, // 单模块 max tokens
	)

	duration := time.Since(startTime).Milliseconds()

	if err != nil {
		s.logger.Error("课程内容生成失败", zap.Error(err))
		s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusFailed, err.Error(), 0, int(duration))
		return
	}

	// 保存原始结果
	s.taskRepo.UpdateResult(ctx, taskID, response, int(duration))

	// 如果启用自动导入
	if req.AutoImport && s.contentImportService != nil {
		if parsedContent != nil {
			if result, err := s.contentImportService.ImportCourseContent(ctx, req.ChapterID, parsedContent); err != nil {
				s.logger.Error("导入课程内容失败", zap.Error(err), zap.Uint("task_id", taskID))
			} else {
				s.logger.Info("课程内容导入成功",
					zap.Uint("task_id", taskID),
					zap.Uint("chapter_id", req.ChapterID),
					zap.Int("modules_created", result.ModulesCreated),
					zap.Int("word_count", result.WordCount),
				)
			}
		} else {
			s.logger.Warn("课程内容解析未完成，跳过自动导入", zap.Uint("task_id", taskID))
		}
	}
}

// autoImportCourseContent 自动导入课程内容
func (s *LLMGeneratorService) autoImportCourseContent(ctx context.Context, taskID, chapterID uint, response string, autoApprove bool) {
	// 解析生成的内容
	var content model.GeneratedCourseContent
	if err := parseJSONResponse(response, &content); err != nil {
		s.logger.Error("解析课程内容失败", zap.Error(err), zap.Uint("task_id", taskID))
		return
	}

	// 导入内容
	result, err := s.contentImportService.ImportCourseContent(ctx, chapterID, &content)
	if err != nil {
		s.logger.Error("导入课程内容失败", zap.Error(err), zap.Uint("task_id", taskID))
		return
	}

	s.logger.Info("课程内容导入成功",
		zap.Uint("task_id", taskID),
		zap.Uint("chapter_id", chapterID),
		zap.Int("modules_created", result.ModulesCreated),
		zap.Int("word_count", result.WordCount))
}

// BatchGenerateChapterLessons 批量生成章节课程内容
func (s *LLMGeneratorService) BatchGenerateChapterLessons(ctx context.Context, req model.BatchGenerateChapterLessonsRequest) (*model.BatchGenerateResult, error) {
	result := &model.BatchGenerateResult{
		TotalTasks: len(req.ChapterIDs),
	}

	for _, chapterID := range req.ChapterIDs {
		// 获取章节信息
		chapter, err := s.chapterRepo.GetByID(chapterID)
		if err != nil {
			result.SkippedTasks++
			result.SkippedReasons = append(result.SkippedReasons, fmt.Sprintf("章节 %d 不存在", chapterID))
			continue
		}

		// 创建生成任务
		genReq := GenerateCourseContentV2Request{
			ChapterID:          chapterID,
			ChapterTitle:       chapter.Title,
			Subject:            req.Subject,
			AutoApprove:        req.AutoApprove,
			AutoImport:         req.AutoImport,
			SystemPrompt:       req.SystemPrompt,
			UserPromptTemplate: req.UserPromptTemplate,
		}

		task, err := s.GenerateCourseContentV2(ctx, genReq)
		if err != nil {
			result.SkippedTasks++
			result.SkippedReasons = append(result.SkippedReasons, fmt.Sprintf("章节 %d 创建任务失败: %v", chapterID, err))
			continue
		}

		result.CreatedTasks++
		result.TaskIDs = append(result.TaskIDs, task.ID)
	}

	return result, nil
}

// BatchGenerateCourseLessons 批量生成课程下所有章节
func (s *LLMGeneratorService) BatchGenerateCourseLessons(ctx context.Context, req model.BatchGenerateCourseLessonsRequest) (*model.BatchGenerateResult, error) {
	// 获取课程下所有章节
	chapters, err := s.chapterRepo.GetByCourse(req.CourseID)
	if err != nil {
		return nil, fmt.Errorf("获取课程章节失败: %w", err)
	}

	var chapterIDs []uint
	for _, ch := range chapters {
		// 如果跳过已有内容
		if req.SkipExisting && len(ch.ContentJSON) > 0 {
			continue
		}
		chapterIDs = append(chapterIDs, ch.ID)
	}

	return s.BatchGenerateChapterLessons(ctx, model.BatchGenerateChapterLessonsRequest{
		ChapterIDs:         chapterIDs,
		Subject:            req.Subject,
		AutoApprove:        req.AutoApprove,
		AutoImport:         req.AutoImport,
		SystemPrompt:       req.SystemPrompt,
		UserPromptTemplate: req.UserPromptTemplate,
	})
}

// BatchGenerateCategoryLessons 批量生成分类下所有章节
func (s *LLMGeneratorService) BatchGenerateCategoryLessons(ctx context.Context, req model.BatchGenerateCategoryLessonsRequest) (*model.BatchGenerateResult, error) {
	// 获取分类下所有课程
	var categoryIDs []uint
	categoryIDs = append(categoryIDs, req.CategoryID)

	// 如果包含子分类，递归获取
	if req.IncludeSubCategories {
		subCategories, err := s.categoryRepo.GetDescendants(req.CategoryID)
		if err == nil {
			for _, cat := range subCategories {
				categoryIDs = append(categoryIDs, cat.ID)
			}
		}
	}

	// 获取所有课程
	var allChapterIDs []uint
	for _, catID := range categoryIDs {
		courses, err := s.courseRepo.GetByCategoryID(catID, 0, 1000) // 获取最多1000个课程
		if err != nil {
			continue
		}

		for _, course := range courses {
			chapters, err := s.chapterRepo.GetByCourse(course.ID)
			if err != nil {
				continue
			}

			for _, ch := range chapters {
				if req.SkipExisting && len(ch.ContentJSON) > 0 {
					continue
				}
				allChapterIDs = append(allChapterIDs, ch.ID)
			}
		}
	}

	return s.BatchGenerateChapterLessons(ctx, model.BatchGenerateChapterLessonsRequest{
		ChapterIDs:         allChapterIDs,
		Subject:            req.Subject,
		AutoApprove:        req.AutoApprove,
		AutoImport:         req.AutoImport,
		SystemPrompt:       req.SystemPrompt,
		UserPromptTemplate: req.UserPromptTemplate,
	})
}

// GenerateQuestionBatchV2 生成题目批次（V2增强版）
func (s *LLMGeneratorService) GenerateQuestionBatchV2(ctx context.Context, req model.BatchGenerateQuestionsRequest) (*model.GenerationTask, error) {
	// 创建生成任务
	targetInfo, _ := json.Marshal(req)

	task := &model.GenerationTask{
		TaskType:   model.GenerationTaskTypeQuestion,
		TargetInfo: string(targetInfo),
		Status:     model.GenerationTaskStatusPending,
		CreatedAt:  time.Now(),
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	// 启动异步生成
	go s.executeQuestionGenerationV2(task.ID, req)

	return task, nil
}

// executeQuestionGenerationV2 执行题目生成（V2增强版）
func (s *LLMGeneratorService) executeQuestionGenerationV2(taskID uint, req model.BatchGenerateQuestionsRequest) {
	ctx := context.Background()
	startTime := time.Now()

	s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusGenerating, "", 0, 0)

	// 构建用户 prompt
	subTopic := req.SubTopic
	if subTopic == "" {
		subTopic = "通用"
	}
	subject := req.Subject
	if subject == "" {
		subject = "未分类"
	}
	specialReq := "无特殊要求"

	userPrompt := fmt.Sprintf(QuestionBatchUserPromptTemplate,
		req.Category, req.Topic, subTopic, subject, specialReq)

	// 调用 LLM 生成
	response, err := s.llmConfigService.CallWithOptions(
		QuestionBatchSystemPromptV2+"\n\n"+userPrompt,
		600, // 10分钟超时
		65536,
	)

	duration := time.Since(startTime).Milliseconds()

	if err != nil {
		s.logger.Error("题目生成失败", zap.Error(err))
		s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusFailed, err.Error(), 0, int(duration))
		return
	}

	s.taskRepo.UpdateResult(ctx, taskID, response, int(duration))

	// 如果启用自动导入
	if req.AutoImport && s.contentImportService != nil {
		s.autoImportQuestionBatch(ctx, taskID, response)
	}
}

// autoImportQuestionBatch 自动导入题目批次
func (s *LLMGeneratorService) autoImportQuestionBatch(ctx context.Context, taskID uint, response string) {
	var batch model.GeneratedQuestionBatch
	if err := parseJSONResponse(response, &batch); err != nil {
		s.logger.Error("解析题目内容失败", zap.Error(err), zap.Uint("task_id", taskID))
		return
	}

	// 导入内容（使用默认分类）
	result, err := s.contentImportService.ImportQuestionBatch(ctx, 0, &batch)
	if err != nil {
		s.logger.Error("导入题目内容失败", zap.Error(err), zap.Uint("task_id", taskID))
		return
	}

	s.logger.Info("题目内容导入成功",
		zap.Uint("task_id", taskID),
		zap.Int("questions_created", result.QuestionsCreated))
}

// GenerateMaterialBatchV2 生成素材批次（V2增强版）
func (s *LLMGeneratorService) GenerateMaterialBatchV2(ctx context.Context, req model.BatchGenerateMaterialsRequest) (*model.GenerationTask, error) {
	targetInfo, _ := json.Marshal(req)

	task := &model.GenerationTask{
		TaskType:   model.GenerationTaskTypeMaterial,
		TargetInfo: string(targetInfo),
		Status:     model.GenerationTaskStatusPending,
		CreatedAt:  time.Now(),
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	go s.executeMaterialGenerationV2(task.ID, req)

	return task, nil
}

// executeMaterialGenerationV2 执行素材生成（V2增强版）
func (s *LLMGeneratorService) executeMaterialGenerationV2(taskID uint, req model.BatchGenerateMaterialsRequest) {
	ctx := context.Background()
	startTime := time.Now()

	s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusGenerating, "", 0, 0)

	// 构建用户 prompt
	subTopic := req.SubTopic
	if subTopic == "" {
		subTopic = "通用"
	}
	materialType := GetMaterialTypeName(req.MaterialType)
	specialReq := "无特殊要求"

	userPrompt := fmt.Sprintf(MaterialBatchUserPromptTemplate,
		req.Category, req.Topic, subTopic, materialType, specialReq)

	response, err := s.llmConfigService.CallWithOptions(
		MaterialBatchSystemPromptV2+"\n\n"+userPrompt,
		600,
		65536,
	)

	duration := time.Since(startTime).Milliseconds()

	if err != nil {
		s.logger.Error("素材生成失败", zap.Error(err))
		s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusFailed, err.Error(), 0, int(duration))
		return
	}

	s.taskRepo.UpdateResult(ctx, taskID, response, int(duration))

	if req.AutoImport && s.contentImportService != nil {
		s.autoImportMaterialBatch(ctx, taskID, response)
	}
}

// autoImportMaterialBatch 自动导入素材批次
func (s *LLMGeneratorService) autoImportMaterialBatch(ctx context.Context, taskID uint, response string) {
	var batch model.GeneratedMaterialBatch
	if err := parseJSONResponse(response, &batch); err != nil {
		s.logger.Error("解析素材内容失败", zap.Error(err), zap.Uint("task_id", taskID))
		return
	}

	result, err := s.contentImportService.ImportMaterialBatch(ctx, 0, &batch)
	if err != nil {
		s.logger.Error("导入素材内容失败", zap.Error(err), zap.Uint("task_id", taskID))
		return
	}

	s.logger.Info("素材内容导入成功",
		zap.Uint("task_id", taskID),
		zap.Int("materials_created", result.MaterialsCreated))
}

// GenerateCategoryDescriptionV2 生成分类描述（V2增强版）
func (s *LLMGeneratorService) GenerateCategoryDescriptionV2(ctx context.Context, categoryID uint, force bool) (*model.GeneratedCategoryDescription, error) {
	// 获取分类信息
	category, err := s.categoryRepo.GetByID(categoryID)
	if err != nil {
		return nil, fmt.Errorf("获取分类失败: %w", err)
	}

	// 构建用户 prompt
	subjectFull := GetSubjectFullName(category.Subject)
	levelName := GetLevelName(category.Level)

	parentName := ""
	if category.ParentID != nil && *category.ParentID > 0 {
		parent, err := s.categoryRepo.GetByID(*category.ParentID)
		if err == nil {
			parentName = parent.Name
		}
	}

	var siblingNames []string
	if category.ParentID != nil && *category.ParentID > 0 {
		siblings, err := s.categoryRepo.GetChildren(*category.ParentID)
		if err == nil {
			for _, sibling := range siblings {
				if sibling.ID != category.ID {
					siblingNames = append(siblingNames, sibling.Name)
				}
			}
		}
	} else if category.Subject != "" {
		siblings, err := s.categoryRepo.GetBySubject(category.Subject)
		if err == nil {
			for _, sibling := range siblings {
				if sibling.ID != category.ID && sibling.Level == category.Level && sibling.ParentID == nil {
					siblingNames = append(siblingNames, sibling.Name)
				}
			}
		}
	}

	parentLine := ""
	if parentName != "" {
		parentLine = fmt.Sprintf("\n- **父级分类**：%s", parentName)
	}
	durationLine := ""
	if category.EstimatedDuration != "" {
		durationLine = fmt.Sprintf("\n- **预计时长**：%s", category.EstimatedDuration)
	}
	siblingsLine := ""
	if len(siblingNames) > 0 {
		displayNames := siblingNames
		if len(displayNames) > 5 {
			displayNames = displayNames[:5]
		}
		siblingsText := strings.Join(displayNames, "、")
		if len(siblingNames) > 5 {
			siblingsText = fmt.Sprintf("%s等%d个", siblingsText, len(siblingNames))
		}
		siblingsLine = fmt.Sprintf("\n- **同级分类**：%s", siblingsText)
	}

	userPrompt := fmt.Sprintf(CategoryDescriptionUserPromptTemplate,
		category.Name, subjectFull, levelName, category.Level, parentLine, durationLine, siblingsLine)

	// 调用 LLM 生成
	response, err := s.llmConfigService.CallWithOptions(
		CategoryDescriptionSystemPromptV2+"\n\n"+userPrompt,
		180, // 3分钟超时
		8192,
	)
	if err != nil {
		s.logger.Error("LLM 调用失败", zap.Error(err))
		return nil, fmt.Errorf("%w: %v", ErrGenerationFailed, err)
	}

	// 解析 JSON 响应
	var result model.GeneratedCategoryDescription
	if err := parseJSONResponse(response, &result); err != nil {
		s.logger.Error("JSON 解析失败", zap.Error(err), zap.String("response", response))
		return nil, fmt.Errorf("解析生成结果失败: %w", err)
	}

	// 更新分类信息
	updates := map[string]interface{}{
		"description":         result.Description,
		"long_description":    result.LongDescription,
		"features":            result.Features,
		"learning_objectives": result.LearningObjectives,
		"keywords":            result.Keywords,
		"difficulty":          result.Difficulty,
	}
	if result.IconSuggestion != "" {
		updates["icon"] = result.IconSuggestion
	}
	if result.ColorSuggestion != "" {
		updates["color"] = result.ColorSuggestion
	}

	if err := s.categoryRepo.UpdateFields(categoryID, updates); err != nil {
		s.logger.Warn("更新分类信息失败", zap.Error(err))
	}

	return &result, nil
}

// =====================================================
// 通用内容生成（支持自定义 Prompt）
// =====================================================

// GenerateContentRequest 通用内容生成请求
type GenerateContentRequest struct {
	GenerateType string            `json:"generate_type" validate:"required"` // question_analysis, knowledge_summary, similar_questions, material_classify
	Prompt       string            `json:"prompt,omitempty"`                  // 自定义 prompt，为空时使用默认模板
	TargetIDs    []uint            `json:"target_ids,omitempty"`              // 目标ID列表（可选）
	TargetData   map[string]string `json:"target_data,omitempty"`             // 目标数据（如题目内容、知识点信息等）
	Options      struct {
		BatchSize int    `json:"batch_size,omitempty"` // 批次大小
		Model     string `json:"model,omitempty"`      // 指定模型
		Overwrite bool   `json:"overwrite,omitempty"`  // 是否覆盖已有内容
	} `json:"options,omitempty"`
}

// GenerateContentResult 通用内容生成结果
type GenerateContentResult struct {
	TaskID       uint   `json:"task_id"`
	GenerateType string `json:"generate_type"`
	Status       string `json:"status"`
	Message      string `json:"message"`
}

// 默认 Prompt 模板
var defaultPromptTemplates = map[string]string{
	"question_analysis": `你是一位资深的公务员考试辅导专家，请为以下题目生成详细的解析内容。

## 输出要求
请按照以下结构输出解析内容：

### 1. 核心知识点
- 列出本题考查的1-3个核心知识点
- 说明知识点在考试中的重要程度

### 2. 解题思路
- 分步骤说明解题过程
- 标注关键的思考节点
- 指出解题的突破口

### 3. 答案解析
- 给出正确答案
- 逐一分析每个选项的对错原因
- 解释干扰项的设置意图

### 4. 知识延伸
- 关联相关知识点
- 补充拓展内容
- 提示类似题型

### 5. 易错提醒
- 指出常见错误
- 说明避坑技巧

## 输出格式
使用 Markdown 格式输出，确保结构清晰、重点突出。`,

	"knowledge_summary": `你是一位资深的公务员考试辅导专家，请为以下知识点生成结构化的总结内容。

## 输出要求
请按照以下结构输出总结内容：

### 1. 概念定义
- 给出准确的定义
- 解释核心概念
- 说明适用范围

### 2. 重点考点
- 列出高频考点（按重要性排序）
- 标注必考内容
- 说明考查方式

### 3. 记忆技巧
- 提供口诀或助记词
- 归纳记忆框架
- 给出图表或思维导图结构

### 4. 常见题型
- 分类列举题型
- 给出解题模板
- 提供答题技巧

### 5. 知识关联
- 与其他知识点的联系
- 综合应用场景
- 跨学科关联

## 输出格式
使用 Markdown 格式输出，适当使用表格、列表等增强可读性。`,

	"similar_questions": `你是一位资深的公务员考试命题专家，请根据原题生成相似的练习题目。

## 生成要求

### 1. 题目要求
- 保持相同的考查知识点
- 维持相近的难度级别
- 变换题目情境和数据
- 确保题目表述清晰准确

### 2. 选项要求
- 提供4个选项（A、B、C、D）
- 正确答案设置合理
- 干扰项具有迷惑性但不能有争议
- 选项长度相近，格式统一

### 3. 解析要求
- 标明正确答案
- 详细解释每个选项
- 点明解题关键
- 给出记忆技巧

## 输出格式

**题目：**
[题目内容]

**选项：**
A. [选项A]
B. [选项B]
C. [选项C]
D. [选项D]

**答案：** [正确选项]

**解析：**
[详细解析内容]`,

	"material_classify": `你是一位资深的公务员考试内容运营专家，请对以下学习素材进行智能分类和整理。

## 分析要求

### 1. 主题识别
- 识别素材的核心主题
- 判断所属学科领域
- 确定适用的考试类型

### 2. 标签提取
- 提取3-5个关键标签
- 识别相关关键词
- 标注难度级别

### 3. 分类建议
- 建议一级分类
- 建议二级分类
- 建议知识点归属

### 4. 质量评估
- 内容准确性评分（1-5分）
- 时效性评估
- 适用性分析
- 改进建议

## 输出格式

| 字段 | 内容 |
|------|------|
| 主题 | [主题描述] |
| 学科 | [所属学科] |
| 标签 | [标签1], [标签2], [标签3] |
| 一级分类 | [分类名称] |
| 二级分类 | [分类名称] |
| 难度 | [简单/中等/困难] |
| 质量评分 | [X/5分] |`,
}

// GenerateWithCustomPrompt 使用自定义 Prompt 生成内容（异步任务）
func (s *LLMGeneratorService) GenerateWithCustomPrompt(ctx context.Context, req GenerateContentRequest) (*model.GenerationTask, error) {
	// 获取 prompt（优先使用自定义，否则使用默认模板）
	prompt := req.Prompt
	if prompt == "" {
		defaultPrompt, exists := defaultPromptTemplates[req.GenerateType]
		if !exists {
			return nil, fmt.Errorf("不支持的生成类型: %s", req.GenerateType)
		}
		prompt = defaultPrompt
	}

	// 构建目标信息
	targetInfo, _ := json.Marshal(map[string]interface{}{
		"generate_type": req.GenerateType,
		"target_ids":    req.TargetIDs,
		"target_data":   req.TargetData,
		"batch_size":    req.Options.BatchSize,
		"model":         req.Options.Model,
		"overwrite":     req.Options.Overwrite,
		"prompt":        prompt,
	})

	// 确定任务类型
	taskType := model.GenerationTaskType("custom_" + req.GenerateType)

	// 创建生成任务
	task := &model.GenerationTask{
		TaskType:   taskType,
		TargetInfo: string(targetInfo),
		Status:     model.GenerationTaskStatusPending,
		CreatedAt:  time.Now(),
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	// 启动异步生成
	go s.executeCustomGeneration(task.ID, req.GenerateType, prompt, req.TargetData, req.Options.Model)

	return task, nil
}

// executeCustomGeneration 执行自定义内容生成
func (s *LLMGeneratorService) executeCustomGeneration(taskID uint, generateType, prompt string, targetData map[string]string, modelID string) {
	ctx := context.Background()
	startTime := time.Now()

	// 更新任务状态为生成中
	s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusGenerating, "", 0, 0)

	// 构建完整的 prompt（如果有目标数据，添加到 prompt 中）
	fullPrompt := prompt
	if len(targetData) > 0 {
		fullPrompt += "\n\n## 目标内容\n"
		for key, value := range targetData {
			fullPrompt += fmt.Sprintf("- **%s**: %s\n", key, value)
		}
	}

	// 根据生成类型设置超时和 token 限制
	timeout := 300     // 默认 5 分钟
	maxTokens := 16384 // 默认 16K tokens

	switch generateType {
	case "question_analysis", "similar_questions":
		timeout = 180
		maxTokens = 8192
	case "knowledge_summary":
		timeout = 300
		maxTokens = 16384
	case "material_classify":
		timeout = 120
		maxTokens = 4096
	}

	// 调用 LLM 生成
	var response string
	var err error

	if modelID != "" {
		// 使用指定模型 (将 modelID 字符串转换为 uint)
		var configID uint
		if _, parseErr := fmt.Sscanf(modelID, "%d", &configID); parseErr == nil && configID > 0 {
			response, err = s.llmConfigService.CallWithConfigID(configID, fullPrompt, timeout, maxTokens)
		} else {
			// 如果解析失败，使用默认模型
			response, err = s.llmConfigService.CallWithOptions(fullPrompt, timeout, maxTokens)
		}
	} else {
		// 使用默认模型
		response, err = s.llmConfigService.CallWithOptions(fullPrompt, timeout, maxTokens)
	}

	duration := time.Since(startTime).Milliseconds()

	if err != nil {
		s.logger.Error("自定义内容生成失败",
			zap.Error(err),
			zap.String("generate_type", generateType),
			zap.Uint("task_id", taskID),
		)
		s.taskRepo.UpdateStatus(taskID, model.GenerationTaskStatusFailed, err.Error(), 0, int(duration))
		return
	}

	// 保存结果
	s.taskRepo.UpdateResult(ctx, taskID, response, int(duration))
	s.logger.Info("自定义内容生成完成",
		zap.Uint("task_id", taskID),
		zap.String("generate_type", generateType),
		zap.Int64("duration_ms", duration),
	)
}
