// Package ai provides AI-based content cleaning functionality
package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"go.uber.org/zap"
)

// ContentCleaningResult holds the result of content cleaning by LLM
type ContentCleaningResult struct {
	Title       string                     `json:"title"`
	Content     string                     `json:"content"`
	PublishDate *string                    `json:"publish_date,omitempty"`
	Source      string                     `json:"source,omitempty"`
	Attachments []ContentCleaningAttachment `json:"attachments,omitempty"`
	Confidence  int                        `json:"confidence"`
}

// ContentCleaningAttachment represents an attachment found during content cleaning
type ContentCleaningAttachment struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

// MaxHTMLContentLength is the maximum length of HTML content to send to LLM
// to avoid exceeding token limits (approximately 32k characters)
const MaxHTMLContentLength = 32000

// CleanPageContent uses LLM to extract clean content from HTML
func (e *AIExtractor) CleanPageContent(ctx context.Context, htmlContent string) (*ContentCleaningResult, error) {
	if e.OpenAI == nil {
		return nil, fmt.Errorf("OpenAI client not initialized")
	}

	// Truncate HTML content if too long to avoid token limit issues
	if len(htmlContent) > MaxHTMLContentLength {
		htmlContent = htmlContent[:MaxHTMLContentLength]
		if e.Logger != nil {
			e.Logger.Warn("HTML content truncated due to length limit",
				zap.Int("max_length", MaxHTMLContentLength),
			)
		}
	}

	// Build prompt using the template
	prompt := buildContentCleaningPrompt(htmlContent)

	// Call LLM
	response, err := e.OpenAI.ChatCompletion(ctx, prompt, e.Config.Temperature, e.Config.MaxOutputTokens)
	if err != nil {
		return nil, fmt.Errorf("LLM content cleaning failed: %w", err)
	}

	// Parse the response
	result, err := parseContentCleaningResponse(response)
	if err != nil {
		if e.Logger != nil {
			e.Logger.Error("Failed to parse LLM content cleaning response",
				zap.String("response", response[:min(500, len(response))]),
				zap.Error(err),
			)
		}
		return nil, fmt.Errorf("failed to parse LLM response: %w", err)
	}

	if e.Logger != nil {
		e.Logger.Info("Content cleaning completed",
			zap.String("title", result.Title),
			zap.Int("content_length", len(result.Content)),
			zap.Int("attachments_count", len(result.Attachments)),
			zap.Int("confidence", result.Confidence),
		)
	}

	return result, nil
}

// buildContentCleaningPrompt builds the prompt for content cleaning
func buildContentCleaningPrompt(htmlContent string) string {
	template := GetPromptTemplate("content_cleaning")
	if template == "" {
		// Fallback if template not found
		template = `你是网页内容提取专家。请从以下HTML内容中提取公告的核心信息，去除导航、广告、侧边栏等干扰内容。

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

请提取并输出JSON：`
	}

	return strings.Replace(template, "{{content}}", htmlContent, 1)
}

// parseContentCleaningResponse parses the LLM response for content cleaning
func parseContentCleaningResponse(response string) (*ContentCleaningResult, error) {
	// Try to extract JSON from response (reuse existing extractJSON function)
	jsonStr := extractJSON(response)
	if jsonStr == "" {
		return nil, fmt.Errorf("no JSON found in response")
	}

	var result ContentCleaningResult
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		// Try to fix common JSON issues (reuse existing fixCommonJSONIssues function)
		jsonStr = fixCommonJSONIssues(jsonStr)
		if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
			return nil, err
		}
	}

	return &result, nil
}
