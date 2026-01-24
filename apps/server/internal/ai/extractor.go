// Package ai provides AI-based extraction functionality
package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"

	"go.uber.org/zap"
)

// AIConfig holds configuration for AI extraction
type AIConfig struct {
	Provider            string        `mapstructure:"provider"`
	OpenAIAPIKey        string        `mapstructure:"openai_api_key"`
	OpenAIBaseURL       string        `mapstructure:"openai_base_url"`
	OpenAIModel         string        `mapstructure:"openai_model"`
	AnthropicAPIKey     string        `mapstructure:"anthropic_api_key"`
	AnthropicModel      string        `mapstructure:"anthropic_model"`
	MaxInputTokens      int           `mapstructure:"max_input_tokens"`
	MaxOutputTokens     int           `mapstructure:"max_output_tokens"`
	Temperature         float32       `mapstructure:"temperature"`
	ConfidenceThreshold int           `mapstructure:"confidence_threshold"`
	Timeout             time.Duration `mapstructure:"timeout"`
}

// DefaultAIConfig returns default AI configuration
func DefaultAIConfig() *AIConfig {
	return &AIConfig{
		Provider:            "openai",
		OpenAIBaseURL:       "https://api.openai.com/v1",
		OpenAIModel:         "gpt-4o-mini",
		AnthropicModel:      "claude-3-haiku-20240307",
		MaxInputTokens:      8000,
		MaxOutputTokens:     4096,
		Temperature:         0.1,
		ConfidenceThreshold: 85,
		Timeout:             60 * time.Second,
	}
}

// AIExtractor handles AI-based information extraction
type AIExtractor struct {
	Config       *AIConfig
	OpenAI       *OpenAIClient
	Logger       *zap.Logger
}

// NewAIExtractor creates a new AI extractor
func NewAIExtractor(config *AIConfig, logger *zap.Logger) *AIExtractor {
	if config == nil {
		config = DefaultAIConfig()
	}

	extractor := &AIExtractor{
		Config: config,
		Logger: logger,
	}

	// Initialize OpenAI client
	if config.OpenAIAPIKey != "" {
		extractor.OpenAI = NewOpenAIClient(
			config.OpenAIAPIKey,
			config.OpenAIBaseURL,
			config.OpenAIModel,
			logger,
		)
	}

	return extractor
}

// PositionExtractionResult holds the result of position extraction
type PositionExtractionResult struct {
	Positions  []ExtractedPosition `json:"positions"`
	ExamInfo   *ExtractedExamInfo  `json:"exam_info,omitempty"`
	Confidence int                 `json:"confidence"`
	Warnings   []string            `json:"warnings,omitempty"`
}

// ExtractedPosition represents a position extracted by AI
type ExtractedPosition struct {
	PositionName       string   `json:"position_name"`
	DepartmentName     string   `json:"department_name"`
	DepartmentCode     string   `json:"department_code,omitempty"`
	PositionCode       string   `json:"position_code,omitempty"`
	RecruitCount       int      `json:"recruit_count"`
	WorkLocation       string   `json:"work_location,omitempty"`
	EducationMin       string   `json:"education_min,omitempty"`
	DegreeRequired     string   `json:"degree_required,omitempty"`
	MajorSpecific      []string `json:"major_specific,omitempty"`
	MajorUnlimited     bool     `json:"major_unlimited"`
	PoliticalStatus    string   `json:"political_status,omitempty"`
	AgeMin             *int     `json:"age_min,omitempty"`
	AgeMax             *int     `json:"age_max,omitempty"`
	WorkExpYearsMin    *int     `json:"work_exp_years_min,omitempty"`
	GrassrootsExpYears *int     `json:"grassroots_exp_years,omitempty"`
	HukouRequired      bool     `json:"hukou_required"`
	HukouProvinces     []string `json:"hukou_provinces,omitempty"`
	GenderRequired     string   `json:"gender_required,omitempty"`
	FreshGraduateOnly  bool     `json:"fresh_graduate_only"`
	OtherRequirements  string   `json:"other_requirements,omitempty"`
	Notes              string   `json:"notes,omitempty"`
	Confidence         int      `json:"confidence"`
}

// ExtractedExamInfo holds exam information extracted by AI
type ExtractedExamInfo struct {
	ExamType          string `json:"exam_type"`
	RegistrationStart string `json:"registration_start,omitempty"`
	RegistrationEnd   string `json:"registration_end,omitempty"`
	ExamDateWritten   string `json:"exam_date_written,omitempty"`
}

// ExtractPositions extracts position information from announcement content
func (e *AIExtractor) ExtractPositions(ctx context.Context, content string) (*PositionExtractionResult, error) {
	if e.OpenAI == nil {
		return nil, fmt.Errorf("OpenAI client not initialized")
	}

	// Truncate content if too long
	if len(content) > e.Config.MaxInputTokens*2 {
		content = content[:e.Config.MaxInputTokens*2]
		if e.Logger != nil {
			e.Logger.Warn("Content truncated due to length limit",
				zap.Int("original_length", len(content)),
				zap.Int("max_tokens", e.Config.MaxInputTokens),
			)
		}
	}

	prompt := buildPositionExtractionPrompt(content)

	response, err := e.OpenAI.ChatCompletion(ctx, prompt, e.Config.Temperature, e.Config.MaxOutputTokens)
	if err != nil {
		return nil, fmt.Errorf("AI extraction failed: %w", err)
	}

	result, err := parsePositionExtractionResponse(response)
	if err != nil {
		if e.Logger != nil {
			e.Logger.Error("Failed to parse AI response",
				zap.String("response", response[:min(500, len(response))]),
				zap.Error(err),
			)
		}
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	if e.Logger != nil {
		e.Logger.Info("Position extraction completed",
			zap.Int("positions_count", len(result.Positions)),
			zap.Int("confidence", result.Confidence),
		)
	}

	return result, nil
}

// IdentifyAnnouncementType identifies the type of announcement
func (e *AIExtractor) IdentifyAnnouncementType(ctx context.Context, title, content string) (string, int, error) {
	if e.OpenAI == nil {
		return "", 0, fmt.Errorf("OpenAI client not initialized")
	}

	// Use only first 500 chars of content
	if len(content) > 500 {
		content = content[:500]
	}

	prompt := buildAnnouncementTypePrompt(title, content)

	response, err := e.OpenAI.ChatCompletion(ctx, prompt, e.Config.Temperature, 256)
	if err != nil {
		return "", 0, err
	}

	announcementType, confidence := parseAnnouncementTypeResponse(response)
	return announcementType, confidence, nil
}

// buildPositionExtractionPrompt builds the prompt for position extraction
func buildPositionExtractionPrompt(content string) string {
	return fmt.Sprintf(`你是公务员考试职位信息提取专家。请从以下公告内容中提取职位信息，并以JSON格式输出。

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
%s

请提取并输出JSON：`, content)
}

// buildAnnouncementTypePrompt builds the prompt for announcement type identification
func buildAnnouncementTypePrompt(title, content string) string {
	return fmt.Sprintf(`请判断以下公告的类型，并以JSON格式输出。

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

公告标题：%s
公告内容（前500字）：%s

请输出JSON格式：
{"type": "类型代码", "confidence": 置信度0-100}`, title, content)
}

// parsePositionExtractionResponse parses the AI response for position extraction
func parsePositionExtractionResponse(response string) (*PositionExtractionResult, error) {
	// Try to extract JSON from response
	jsonStr := extractJSON(response)
	if jsonStr == "" {
		return nil, fmt.Errorf("no JSON found in response")
	}

	var result PositionExtractionResult
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		// Try to fix common JSON issues
		jsonStr = fixCommonJSONIssues(jsonStr)
		if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
			return nil, err
		}
	}

	return &result, nil
}

// parseAnnouncementTypeResponse parses the AI response for announcement type
func parseAnnouncementTypeResponse(response string) (string, int) {
	jsonStr := extractJSON(response)
	if jsonStr == "" {
		return "other", 0
	}

	var result struct {
		Type       string `json:"type"`
		Confidence int    `json:"confidence"`
	}

	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		return "other", 0
	}

	return result.Type, result.Confidence
}

// extractJSON extracts JSON content from a string
func extractJSON(s string) string {
	// Try to find JSON in code block
	re := regexp.MustCompile("```(?:json)?\\s*([\\s\\S]*?)```")
	if matches := re.FindStringSubmatch(s); len(matches) > 1 {
		return strings.TrimSpace(matches[1])
	}

	// Try to find raw JSON
	start := strings.Index(s, "{")
	if start == -1 {
		return ""
	}

	// Find matching closing brace
	depth := 0
	for i := start; i < len(s); i++ {
		switch s[i] {
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return s[start : i+1]
			}
		}
	}

	return ""
}

// fixCommonJSONIssues attempts to fix common JSON parsing issues
func fixCommonJSONIssues(s string) string {
	// Remove trailing commas before closing brackets
	re := regexp.MustCompile(`,\s*}`)
	s = re.ReplaceAllString(s, "}")

	re = regexp.MustCompile(`,\s*]`)
	s = re.ReplaceAllString(s, "]")

	return s
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
