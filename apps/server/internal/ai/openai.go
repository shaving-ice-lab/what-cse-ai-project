package ai

import (
	"context"
	"fmt"

	"github.com/sashabaranov/go-openai"
	"go.uber.org/zap"
)

// OpenAIClient wraps the OpenAI API client
type OpenAIClient struct {
	client *openai.Client
	model  string
	logger *zap.Logger
}

// NewOpenAIClient creates a new OpenAI client
func NewOpenAIClient(apiKey, baseURL, model string, logger *zap.Logger) *OpenAIClient {
	config := openai.DefaultConfig(apiKey)
	if baseURL != "" && baseURL != "https://api.openai.com/v1" {
		config.BaseURL = baseURL
	}

	return &OpenAIClient{
		client: openai.NewClientWithConfig(config),
		model:  model,
		logger: logger,
	}
}

// ChatCompletion sends a chat completion request
func (c *OpenAIClient) ChatCompletion(ctx context.Context, prompt string, temperature float32, maxTokens int) (string, error) {
	req := openai.ChatCompletionRequest{
		Model: c.model,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: "你是公务员考试数据处理专家，擅长从公告中提取结构化信息。请只返回JSON格式的结果。",
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt,
			},
		},
		Temperature: temperature,
		MaxTokens:   maxTokens,
	}

	if c.logger != nil {
		c.logger.Debug("Sending OpenAI request",
			zap.String("model", c.model),
			zap.Int("prompt_length", len(prompt)),
			zap.Int("max_tokens", maxTokens),
		)
	}

	resp, err := c.client.CreateChatCompletion(ctx, req)
	if err != nil {
		if c.logger != nil {
			c.logger.Error("OpenAI request failed",
				zap.Error(err),
			)
		}
		return "", fmt.Errorf("OpenAI API error: %w", err)
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	content := resp.Choices[0].Message.Content

	if c.logger != nil {
		c.logger.Debug("OpenAI response received",
			zap.Int("response_length", len(content)),
			zap.Int("prompt_tokens", resp.Usage.PromptTokens),
			zap.Int("completion_tokens", resp.Usage.CompletionTokens),
		)
	}

	return content, nil
}

// ChatCompletionWithHistory sends a chat completion request with message history
func (c *OpenAIClient) ChatCompletionWithHistory(ctx context.Context, messages []openai.ChatCompletionMessage, temperature float32, maxTokens int) (string, error) {
	req := openai.ChatCompletionRequest{
		Model:       c.model,
		Messages:    messages,
		Temperature: temperature,
		MaxTokens:   maxTokens,
	}

	resp, err := c.client.CreateChatCompletion(ctx, req)
	if err != nil {
		return "", fmt.Errorf("OpenAI API error: %w", err)
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return resp.Choices[0].Message.Content, nil
}

// CreateEmbedding creates an embedding for the given text
func (c *OpenAIClient) CreateEmbedding(ctx context.Context, text string) ([]float32, error) {
	req := openai.EmbeddingRequest{
		Model: openai.AdaEmbeddingV2,
		Input: []string{text},
	}

	resp, err := c.client.CreateEmbeddings(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("embedding API error: %w", err)
	}

	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("no embedding returned")
	}

	return resp.Data[0].Embedding, nil
}

// StreamChatCompletion streams a chat completion response
func (c *OpenAIClient) StreamChatCompletion(ctx context.Context, prompt string, temperature float32, maxTokens int, callback func(content string)) error {
	req := openai.ChatCompletionRequest{
		Model: c.model,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: "你是公务员考试数据处理专家，擅长从公告中提取结构化信息。",
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt,
			},
		},
		Temperature: temperature,
		MaxTokens:   maxTokens,
		Stream:      true,
	}

	stream, err := c.client.CreateChatCompletionStream(ctx, req)
	if err != nil {
		return fmt.Errorf("stream creation error: %w", err)
	}
	defer stream.Close()

	for {
		response, err := stream.Recv()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return fmt.Errorf("stream error: %w", err)
		}

		if len(response.Choices) > 0 {
			callback(response.Choices[0].Delta.Content)
		}
	}

	return nil
}

// GetModel returns the current model name
func (c *OpenAIClient) GetModel() string {
	return c.model
}

// SetModel sets the model to use
func (c *OpenAIClient) SetModel(model string) {
	c.model = model
}
