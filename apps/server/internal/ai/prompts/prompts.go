// Package prompts provides AI prompt templates for various content generation tasks
package prompts

import (
	"strings"
)

// PromptType represents the type of prompt template
type PromptType string

const (
	// Question related prompts
	PromptTypeQuestionAnalysis PromptType = "question_analysis"
	PromptTypeQuestionTips     PromptType = "question_tips"
	PromptTypeQuestionSimilar  PromptType = "question_similar"

	// Knowledge related prompts
	PromptTypeKnowledgeSummary  PromptType = "knowledge_summary"
	PromptTypeKnowledgeMindmap  PromptType = "knowledge_mindmap"
	PromptTypeKnowledgeExamples PromptType = "knowledge_examples"

	// Course/Chapter related prompts
	PromptTypeChapterSummary   PromptType = "chapter_summary"
	PromptTypeChapterKeypoints PromptType = "chapter_keypoints"
	PromptTypeCoursePreview    PromptType = "course_preview"
	PromptTypeCourseReview     PromptType = "course_review"

	// Personalized learning prompts
	PromptTypeLearningPath     PromptType = "learning_path"
	PromptTypeWeaknessAnalysis PromptType = "weakness_analysis"
	PromptTypeAbilityReport    PromptType = "ability_report"
)

// PromptCategory represents the category of prompt
type PromptCategory string

const (
	CategoryQuestion     PromptCategory = "question"
	CategoryKnowledge    PromptCategory = "knowledge"
	CategoryCourse       PromptCategory = "course"
	CategoryPersonalized PromptCategory = "personal"
	CategoryReport       PromptCategory = "report"
)

// PromptInfo contains information about a prompt template
type PromptInfo struct {
	Type        PromptType
	Category    PromptCategory
	Name        string
	Description string
	Variables   []string
}

// AllPromptTypes returns all available prompt types
var AllPromptTypes = []PromptInfo{
	// Question prompts
	{
		Type:        PromptTypeQuestionAnalysis,
		Category:    CategoryQuestion,
		Name:        "题目深度解析",
		Description: "生成题目的详细解析，包括考点、解题步骤、选项分析等",
		Variables:   []string{"question_content", "options", "answer", "question_type", "difficulty", "knowledge_points"},
	},
	{
		Type:        PromptTypeQuestionTips,
		Category:    CategoryQuestion,
		Name:        "解题技巧",
		Description: "生成解题技巧和秒杀方法",
		Variables:   []string{"question_content", "options", "answer", "question_type", "knowledge_points"},
	},
	{
		Type:        PromptTypeQuestionSimilar,
		Category:    CategoryQuestion,
		Name:        "相似题目生成",
		Description: "基于原题生成相似的练习题",
		Variables:   []string{"question_content", "options", "answer", "question_type", "knowledge_points", "count"},
	},

	// Knowledge prompts
	{
		Type:        PromptTypeKnowledgeSummary,
		Category:    CategoryKnowledge,
		Name:        "知识点总结",
		Description: "生成知识点的学习总结，包括定义、要点、记忆方法等",
		Variables:   []string{"knowledge_name", "category", "description", "importance", "frequency"},
	},
	{
		Type:        PromptTypeKnowledgeMindmap,
		Category:    CategoryKnowledge,
		Name:        "知识点思维导图",
		Description: "生成知识点的思维导图数据结构",
		Variables:   []string{"knowledge_name", "category", "description", "sub_points"},
	},
	{
		Type:        PromptTypeKnowledgeExamples,
		Category:    CategoryKnowledge,
		Name:        "知识点例题",
		Description: "生成知识点的经典例题及解析",
		Variables:   []string{"knowledge_name", "category", "description", "key_concepts", "count"},
	},

	// Course prompts
	{
		Type:        PromptTypeChapterSummary,
		Category:    CategoryCourse,
		Name:        "章节总结",
		Description: "生成章节的学习总结",
		Variables:   []string{"chapter_title", "course_name", "description", "content_summary", "knowledge_points"},
	},
	{
		Type:        PromptTypeChapterKeypoints,
		Category:    CategoryCourse,
		Name:        "章节重点",
		Description: "提炼章节的学习重点",
		Variables:   []string{"chapter_title", "course_name", "content", "knowledge_points"},
	},
	{
		Type:        PromptTypeCoursePreview,
		Category:    CategoryCourse,
		Name:        "课程预习要点",
		Description: "生成课程的预习指导",
		Variables:   []string{"course_title", "description", "chapters", "prerequisites"},
	},
	{
		Type:        PromptTypeCourseReview,
		Category:    CategoryCourse,
		Name:        "课程复习要点",
		Description: "生成课程的复习指导",
		Variables:   []string{"course_title", "description", "chapters", "key_points"},
	},

	// Personalized learning prompts
	{
		Type:        PromptTypeLearningPath,
		Category:    CategoryPersonalized,
		Name:        "学习路径规划",
		Description: "根据用户情况生成个性化学习路径",
		Variables:   []string{"exam_type", "exam_date", "current_level", "available_hours", "strong_subjects", "weak_subjects", "completed_content"},
	},
	{
		Type:        PromptTypeWeaknessAnalysis,
		Category:    CategoryPersonalized,
		Name:        "薄弱点分析",
		Description: "分析用户学习数据，找出薄弱环节",
		Variables:   []string{"user_id", "practice_stats", "accuracy_by_subject", "accuracy_by_knowledge", "avg_time_per_question", "error_distribution", "study_duration"},
	},
	{
		Type:        PromptTypeAbilityReport,
		Category:    CategoryReport,
		Name:        "能力分析报告",
		Description: "生成用户的能力分析报告",
		Variables:   []string{"user_id", "total_study_hours", "total_questions", "overall_accuracy", "accuracy_by_subject", "accuracy_by_type", "score_trend", "last_mock_score"},
	},
}

// GetPromptTemplate returns the prompt template for the given type
func GetPromptTemplate(promptType PromptType) string {
	switch promptType {
	case PromptTypeQuestionAnalysis:
		return GetQuestionAnalysisPrompt()
	case PromptTypeQuestionTips:
		return GetQuestionTipsPrompt()
	case PromptTypeQuestionSimilar:
		return GetQuestionSimilarPrompt()
	case PromptTypeKnowledgeSummary:
		return GetKnowledgeSummaryPrompt()
	case PromptTypeKnowledgeMindmap:
		return GetKnowledgeMindmapPrompt()
	case PromptTypeKnowledgeExamples:
		return GetKnowledgeExamplesPrompt()
	case PromptTypeChapterSummary:
		return GetChapterSummaryPrompt()
	case PromptTypeChapterKeypoints:
		return GetChapterKeypointsPrompt()
	case PromptTypeCoursePreview:
		return GetCoursePreviewPrompt()
	case PromptTypeCourseReview:
		return GetCourseReviewPrompt()
	case PromptTypeLearningPath:
		return GetLearningPathPrompt()
	case PromptTypeWeaknessAnalysis:
		return GetWeaknessAnalysisPrompt()
	case PromptTypeAbilityReport:
		return GetAbilityReportPrompt()
	default:
		return ""
	}
}

// GetPromptInfo returns the prompt info for the given type
func GetPromptInfo(promptType PromptType) *PromptInfo {
	for _, info := range AllPromptTypes {
		if info.Type == promptType {
			return &info
		}
	}
	return nil
}

// GetPromptsByCategory returns all prompts in a category
func GetPromptsByCategory(category PromptCategory) []PromptInfo {
	var result []PromptInfo
	for _, info := range AllPromptTypes {
		if info.Category == category {
			result = append(result, info)
		}
	}
	return result
}

// RenderPrompt replaces variables in the prompt template with actual values
func RenderPrompt(template string, variables map[string]string) string {
	result := template
	for key, value := range variables {
		placeholder := "{{" + key + "}}"
		result = strings.ReplaceAll(result, placeholder, value)
	}
	return result
}

// ValidateVariables checks if all required variables are provided
func ValidateVariables(promptType PromptType, variables map[string]string) []string {
	info := GetPromptInfo(promptType)
	if info == nil {
		return []string{"unknown prompt type"}
	}

	var missing []string
	for _, v := range info.Variables {
		if _, ok := variables[v]; !ok {
			missing = append(missing, v)
		}
	}
	return missing
}
