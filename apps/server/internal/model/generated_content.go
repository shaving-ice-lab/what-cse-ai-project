package model

// =====================================================
// LLM 生成的课程内容结构（对应 CourseContentSystemPromptV2 输出）
// 使用 Gen 前缀避免与 ai_content.go 中的类型冲突
// =====================================================

// GeneratedCourseContent 生成的课程内容（完整结构）
type GeneratedCourseContent struct {
	ChapterTitle      string `json:"chapter_title"`
	Subject           string `json:"subject"`
	KnowledgePoint    string `json:"knowledge_point"`
	EstimatedDuration string `json:"estimated_duration"`
	DifficultyLevel   string `json:"difficulty_level"`
	WordCountTarget   string `json:"word_count_target,omitempty"`

	ExamAnalysis     GenExamAnalysis    `json:"exam_analysis"`
	LessonContent    GenLessonContent   `json:"lesson_content"`
	LessonSections   []GenLessonSection `json:"lesson_sections"`
	PracticeProblems []GenPracticeItem  `json:"practice_problems"`
	Homework         GenHomeworkContent `json:"homework"`
}

// GenExamAnalysis 考情分析（LLM生成）
type GenExamAnalysis struct {
	Description     string   `json:"description"`
	Frequency       string   `json:"frequency"`
	ScoreWeight     string   `json:"score_weight"`
	DifficultyTrend string   `json:"difficulty_trend"`
	ExamForms       []string `json:"exam_forms"`
	KeyPatterns     []string `json:"key_patterns"`
	RecentTrends    string   `json:"recent_trends,omitempty"`
}

// GenLessonContent 课程内容主体（LLM生成）
type GenLessonContent struct {
	Introduction    string              `json:"introduction"`
	LearningGoals   []string            `json:"learning_goals"`
	Prerequisites   []string            `json:"prerequisites"`
	CoreConcepts    []GenCoreConcept    `json:"core_concepts"`
	MethodSteps     []GenMethodStep     `json:"method_steps"`
	Formulas        []GenFormula        `json:"formulas"`
	MemoryTips      []GenMemoryTip      `json:"memory_tips,omitempty"`
	CommonMistakes  []GenCommonMistake  `json:"common_mistakes"`
	ExamStrategies  []GenExamStrategy   `json:"exam_strategies,omitempty"`
	VocabularyAccum *GenVocabularyAccum `json:"vocabulary_accumulation,omitempty"`
	ExtensionKnow   string              `json:"extension_knowledge,omitempty"`
	SummaryPoints   []string            `json:"summary_points"`
	MindMapMermaid  string              `json:"mind_map_mermaid,omitempty"`
	QuickNotes      *GenQuickNotes      `json:"quick_notes,omitempty"`
}

// GenCoreConcept 核心概念（LLM生成）
type GenCoreConcept struct {
	Name                 string   `json:"name"`
	Definition           string   `json:"definition"`
	DetailedExplanation  string   `json:"detailed_explanation"`
	ApplicationScenarios []string `json:"application_scenarios"`
	Example              string   `json:"example"`
	CommonPairs          []string `json:"common_pairs,omitempty"`
	Tips                 string   `json:"tips,omitempty"`
}

// GenMethodStep 方法步骤（LLM生成）
type GenMethodStep struct {
	Step                  int      `json:"step"`
	Title                 string   `json:"title"`
	Content               string   `json:"content"`
	Tips                  string   `json:"tips,omitempty"`
	TimeAllocation        string   `json:"time_allocation,omitempty"`
	CommonErrors          string   `json:"common_errors,omitempty"`
	KeySignals            []string `json:"key_signals,omitempty"`
	AnalysisOrder         string   `json:"analysis_order,omitempty"`
	VerificationChecklist []string `json:"verification_checklist,omitempty"`
}

// GenFormula 口诀公式（LLM生成）
type GenFormula struct {
	Name                string   `json:"name"`
	Content             string   `json:"content"`
	DetailedExplanation string   `json:"detailed_explanation"`
	MemoryAid           string   `json:"memory_aid,omitempty"`
	Examples            []string `json:"examples,omitempty"`
}

// GenMemoryTip 记忆技巧（LLM生成）
type GenMemoryTip struct {
	Tip       string   `json:"tip"`
	Content   string   `json:"content"`
	Example   string   `json:"example,omitempty"`
	WordPairs []string `json:"word_pairs,omitempty"`
}

// GenCommonMistake 易错点（LLM生成）
type GenCommonMistake struct {
	Mistake     string `json:"mistake"`
	Frequency   string `json:"frequency"`
	Reason      string `json:"reason"`
	TypicalCase string `json:"typical_case,omitempty"`
	Correction  string `json:"correction"`
	Prevention  string `json:"prevention,omitempty"`
}

// GenExamStrategy 考试策略（LLM生成）
type GenExamStrategy struct {
	Strategy string `json:"strategy"`
	Content  string `json:"content"`
}

// GenVocabularyAccum 词汇积累（LLM生成）
type GenVocabularyAccum struct {
	MustKnow   []string `json:"must_know"`
	ShouldKnow []string `json:"should_know"`
	NiceToKnow []string `json:"nice_to_know"`
}

// GenQuickNotes 快速笔记（LLM生成）
type GenQuickNotes struct {
	Formulas       []GenQuickFormula `json:"formulas"`
	KeyPoints      []string          `json:"key_points"`
	CommonMistakes []GenQuickMistake `json:"common_mistakes"`
	ExamTips       []string          `json:"exam_tips"`
}

// GenQuickFormula 快速笔记中的口诀（LLM生成）
type GenQuickFormula struct {
	Name        string `json:"name"`
	Content     string `json:"content"`
	Explanation string `json:"explanation"`
}

// GenQuickMistake 快速笔记中的易错点（LLM生成）
type GenQuickMistake struct {
	Mistake    string `json:"mistake"`
	Correction string `json:"correction"`
}

// GenLessonSection 课程章节（LLM生成）
type GenLessonSection struct {
	Order             int                   `json:"order"`
	Title             string                `json:"title"`
	Content           string                `json:"content"`
	SectionType       string                `json:"section_type"` // intro/theory/method/example/warning/drill/summary
	Duration          string                `json:"duration"`
	KeyPoints         []string              `json:"key_points,omitempty"`
	ConceptMap        string                `json:"concept_map,omitempty"`
	Flowchart         string                `json:"flowchart,omitempty"`
	Examples          []GenExampleItem      `json:"examples,omitempty"`
	Traps             []GenTrapItem         `json:"traps,omitempty"`
	RealExamQuestions []GenRealExamQuestion `json:"real_exam_questions,omitempty"`
	MindMap           string                `json:"mind_map,omitempty"`
	KeyTakeaways      []string              `json:"key_takeaways,omitempty"`
	NextLessonPreview string                `json:"next_lesson_preview,omitempty"`
}

// GenExampleItem 例题项（LLM生成）
type GenExampleItem struct {
	Title           string            `json:"title"`
	Source          string            `json:"source"`
	Difficulty      string            `json:"difficulty"`
	Problem         string            `json:"problem"`
	ContextAnalysis string            `json:"context_analysis"`
	ThinkingProcess string            `json:"thinking_process"`
	OptionAnalysis  map[string]string `json:"option_analysis"`
	Answer          string            `json:"answer"`
	KeyTechnique    string            `json:"key_technique"`
	Extension       string            `json:"extension,omitempty"`
	TimeSpent       string            `json:"time_spent,omitempty"`
}

// GenTrapItem 陷阱项（LLM生成）
type GenTrapItem struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Case        string `json:"case"`
	Solution    string `json:"solution"`
}

// GenRealExamQuestion 真题演练（LLM生成）
type GenRealExamQuestion struct {
	Year          string `json:"year"`
	Problem       string `json:"problem"`
	TimeLimit     string `json:"time_limit"`
	Answer        string `json:"answer"`
	QuickAnalysis string `json:"quick_analysis"`
}

// GenPracticeItem 练习题（LLM生成）
type GenPracticeItem struct {
	Order             int      `json:"order"`
	Difficulty        string   `json:"difficulty"`
	DifficultyLevel   string   `json:"difficulty_level,omitempty"`
	Problem           string   `json:"problem"`
	Options           []string `json:"options"`
	Answer            string   `json:"answer"`
	Analysis          string   `json:"analysis"`
	KnowledgePoint    string   `json:"knowledge_point,omitempty"`
	TimeSuggestion    string   `json:"time_suggestion,omitempty"`
	SimilarType       string   `json:"similar_type,omitempty"`
	AdvancedTechnique string   `json:"advanced_technique,omitempty"`
}

// GenHomeworkContent 课后作业（LLM生成）
type GenHomeworkContent struct {
	Required          []string `json:"required"`
	Optional          []string `json:"optional"`
	ThinkingQuestions []string `json:"thinking_questions"`
	Preview           string   `json:"preview,omitempty"`
}

// =====================================================
// 生成的题目批次结构（对应 QuestionBatchSystemPromptV2 输出）
// =====================================================

// GeneratedQuestionBatch 生成的题目批次
type GeneratedQuestionBatch struct {
	BatchInfo GenBatchInfo             `json:"batch_info"`
	Questions []GeneratedQuestion      `json:"questions"`
	Summary   *GenQuestionBatchSummary `json:"summary,omitempty"`
}

// GenBatchInfo 批次信息（LLM生成）
type GenBatchInfo struct {
	Category               string `json:"category"`
	Topic                  string `json:"topic"`
	SubTopic               string `json:"sub_topic,omitempty"`
	Subject                string `json:"subject,omitempty"`
	BatchNumber            int    `json:"batch_number"`
	Count                  int    `json:"count"`
	DifficultyDistribution string `json:"difficulty_distribution,omitempty"`
	TotalWordCount         string `json:"total_word_count,omitempty"`
}

// GeneratedQuestion 生成的题目
type GeneratedQuestion struct {
	Order             int      `json:"order"`
	Content           string   `json:"content"`
	Options           []string `json:"options"`
	Answer            string   `json:"answer"`
	Analysis          string   `json:"analysis"`
	Difficulty        int      `json:"difficulty"`
	DifficultyStars   string   `json:"difficulty_stars,omitempty"`
	QuestionType      string   `json:"question_type"`
	KnowledgePoints   []string `json:"knowledge_points"`
	Tags              []string `json:"tags,omitempty"`
	Source            string   `json:"source,omitempty"`
	TimeSuggestion    string   `json:"time_suggestion,omitempty"`
	ErrorProneOptions []string `json:"error_prone_options,omitempty"`
	KeyTechnique      string   `json:"key_technique,omitempty"`
	ErrorPronePoint   string   `json:"error_prone_point,omitempty"`
}

// GenQuestionBatchSummary 题目批次总结（LLM生成）
type GenQuestionBatchSummary struct {
	KnowledgeCoverage []string `json:"knowledge_coverage"`
	TechniqueSummary  []string `json:"technique_summary"`
	CommonTraps       []string `json:"common_traps"`
}

// =====================================================
// 生成的素材批次结构（对应 MaterialBatchSystemPromptV2 输出）
// =====================================================

// GeneratedMaterialBatch 生成的素材批次
type GeneratedMaterialBatch struct {
	BatchInfo GenMaterialBatchInfo     `json:"batch_info"`
	Materials []GeneratedMaterial      `json:"materials"`
	Summary   *GenMaterialBatchSummary `json:"summary,omitempty"`
}

// GenMaterialBatchInfo 素材批次信息（LLM生成）
type GenMaterialBatchInfo struct {
	Category       string `json:"category"`
	Topic          string `json:"topic"`
	SubTopic       string `json:"sub_topic,omitempty"`
	BatchNumber    int    `json:"batch_number"`
	Count          int    `json:"count"`
	TotalWordCount string `json:"total_word_count,omitempty"`
}

// GeneratedMaterial 生成的素材
type GeneratedMaterial struct {
	Order            int                   `json:"order"`
	Title            string                `json:"title"`
	Quote            string                `json:"quote"`
	Content          string                `json:"content"`
	Source           string                `json:"source"`
	SourceDate       string                `json:"source_date,omitempty"`
	Speaker          string                `json:"speaker,omitempty"`
	Occasion         string                `json:"occasion,omitempty"`
	MaterialType     string                `json:"material_type"`
	Theme            string                `json:"theme"`
	SubThemes        []string              `json:"sub_themes,omitempty"`
	Keywords         []string              `json:"keywords,omitempty"`
	UsageScenarios   []GenUsageScenario    `json:"usage_scenarios"`
	RelatedPolicies  []string              `json:"related_policies,omitempty"`
	WritingSegments  []GenWritingSegment   `json:"writing_segments,omitempty"`
	Extension        *GenMaterialExtension `json:"extension,omitempty"`
	InterviewUsage   *GenInterviewUsage    `json:"interview_usage,omitempty"`
	RelatedMaterials []string              `json:"related_materials,omitempty"`
	MemoryTips       string                `json:"memory_tips,omitempty"`
	Tags             []string              `json:"tags,omitempty"`
}

// GenUsageScenario 使用场景（LLM生成）
type GenUsageScenario struct {
	Scenario string `json:"scenario"`
	Example  string `json:"example"`
}

// GenWritingSegment 写作片段（LLM生成）
type GenWritingSegment struct {
	Type    string `json:"type"`
	Content string `json:"content"`
}

// GenMaterialExtension 素材拓展延伸（LLM生成）
type GenMaterialExtension struct {
	RelatedQuotes      []string `json:"related_quotes,omitempty"`
	RelatedMaterials   []string `json:"related_materials,omitempty"`
	ReadingSuggestions string   `json:"reading_suggestions,omitempty"`
	ExamTips           string   `json:"exam_tips,omitempty"`
}

// GenInterviewUsage 面试用法（LLM生成）
type GenInterviewUsage struct {
	QuestionTypes  []string `json:"question_types"`
	AnswerTemplate string   `json:"answer_template"`
}

// GenMaterialBatchSummary 素材批次总结（LLM生成）
type GenMaterialBatchSummary struct {
	ThemeCoverage          []string `json:"theme_coverage"`
	UsageTips              []string `json:"usage_tips"`
	CombinationSuggestions []string `json:"combination_suggestions"`
}

// =====================================================
// 生成的分类描述结构（对应 CategoryDescriptionSystemPromptV2 输出）
// =====================================================

// GeneratedCategoryDescription 生成的分类描述
type GeneratedCategoryDescription struct {
	Name               string   `json:"name"`
	Description        string   `json:"description"`
	LongDescription    string   `json:"long_description"`
	Features           []string `json:"features"`
	LearningObjectives []string `json:"learning_objectives"`
	Keywords           []string `json:"keywords"`
	Difficulty         string   `json:"difficulty"`
	IconSuggestion     string   `json:"icon_suggestion,omitempty"`
	ColorSuggestion    string   `json:"color_suggestion,omitempty"`
}

// GenExamInfo 考试信息（LLM生成）
type GenExamInfo struct {
	Frequency   string `json:"frequency"`
	ScoreWeight string `json:"score_weight"`
	Difficulty  string `json:"difficulty"`
	Trend       string `json:"trend"`
}

// =====================================================
// 批量生成请求和响应
// =====================================================

// BatchGenerateChapterLessonsRequest 批量生成章节课程请求
type BatchGenerateChapterLessonsRequest struct {
	ChapterIDs         []uint `json:"chapter_ids" validate:"required,min=1"`
	Subject            string `json:"subject,omitempty"`
	AutoApprove        bool   `json:"auto_approve,omitempty"`
	AutoImport         bool   `json:"auto_import,omitempty"`
	// 从前端传入的 prompt（可选，如果不传则使用后端默认）
	SystemPrompt       string `json:"system_prompt,omitempty"`
	UserPromptTemplate string `json:"user_prompt_template,omitempty"`
}

// BatchGenerateCourseLessonsRequest 批量生成课程下所有章节请求
type BatchGenerateCourseLessonsRequest struct {
	CourseID           uint   `json:"course_id" validate:"required"`
	Subject            string `json:"subject,omitempty"`
	AutoApprove        bool   `json:"auto_approve,omitempty"`
	AutoImport         bool   `json:"auto_import,omitempty"`
	SkipExisting       bool   `json:"skip_existing,omitempty"` // 跳过已有内容的章节
	SystemPrompt       string `json:"system_prompt,omitempty"`
	UserPromptTemplate string `json:"user_prompt_template,omitempty"`
}

// BatchGenerateCategoryLessonsRequest 批量生成分类下所有章节请求
type BatchGenerateCategoryLessonsRequest struct {
	CategoryID           uint   `json:"category_id" validate:"required"`
	Subject              string `json:"subject,omitempty"`
	AutoApprove          bool   `json:"auto_approve,omitempty"`
	AutoImport           bool   `json:"auto_import,omitempty"`
	SkipExisting         bool   `json:"skip_existing,omitempty"`
	IncludeSubCategories bool   `json:"include_sub_categories,omitempty"` // 包含子分类
	SystemPrompt         string `json:"system_prompt,omitempty"`
	UserPromptTemplate   string `json:"user_prompt_template,omitempty"`
}

// GenerateSingleChapterLessonRequest 生成单个章节课程请求
type GenerateSingleChapterLessonRequest struct {
	ChapterID      uint   `json:"chapter_id" validate:"required"`
	ChapterTitle   string `json:"chapter_title,omitempty"`
	Subject        string `json:"subject,omitempty"`
	KnowledgePoint string `json:"knowledge_point,omitempty"`
	AutoApprove    bool   `json:"auto_approve,omitempty"`
	AutoImport     bool   `json:"auto_import,omitempty"`
}

// BatchGenerateQuestionsRequest 批量生成题目请求
type BatchGenerateQuestionsRequest struct {
	Category    string `json:"category" validate:"required"`
	Topic       string `json:"topic" validate:"required"`
	SubTopic    string `json:"sub_topic,omitempty"`
	Subject     string `json:"subject,omitempty"`
	BatchCount  int    `json:"batch_count,omitempty"` // 生成几批，默认1批（10题）
	AutoApprove bool   `json:"auto_approve,omitempty"`
	AutoImport  bool   `json:"auto_import,omitempty"`
}

// BatchGenerateMaterialsRequest 批量生成素材请求
type BatchGenerateMaterialsRequest struct {
	Category     string `json:"category" validate:"required"`
	Topic        string `json:"topic" validate:"required"`
	SubTopic     string `json:"sub_topic,omitempty"`
	MaterialType string `json:"material_type,omitempty"`
	BatchCount   int    `json:"batch_count,omitempty"` // 生成几批，默认1批（5条）
	AutoApprove  bool   `json:"auto_approve,omitempty"`
	AutoImport   bool   `json:"auto_import,omitempty"`
}

// BatchGenerateResult 批量生成结果
type BatchGenerateResult struct {
	TotalTasks     int      `json:"total_tasks"`
	CreatedTasks   int      `json:"created_tasks"`
	SkippedTasks   int      `json:"skipped_tasks"`
	TaskIDs        []uint   `json:"task_ids"`
	SkippedReasons []string `json:"skipped_reasons,omitempty"`
}
