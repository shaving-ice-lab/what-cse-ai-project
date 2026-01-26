package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

type LLMConfigHandler struct {
	llmConfigService *service.LLMConfigService
}

func NewLLMConfigHandler(llmConfigService *service.LLMConfigService) *LLMConfigHandler {
	return &LLMConfigHandler{llmConfigService: llmConfigService}
}

// List returns all LLM configs
// @Summary List LLM Configs (Admin)
// @Description Get all LLM configurations
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param provider query string false "Filter by provider"
// @Param is_enabled query bool false "Filter by enabled status"
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs [get]
func (h *LLMConfigHandler) List(c echo.Context) error {
	provider := c.QueryParam("provider")
	
	var isEnabled *bool
	if isEnabledStr := c.QueryParam("is_enabled"); isEnabledStr != "" {
		enabled := isEnabledStr == "true" || isEnabledStr == "1"
		isEnabled = &enabled
	}

	configs, err := h.llmConfigService.List(provider, isEnabled)
	if err != nil {
		return fail(c, 500, "获取LLM配置列表失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"configs": configs,
		"total":   len(configs),
	})
}

// GetByID returns a single LLM config by ID
// @Summary Get LLM Config by ID (Admin)
// @Description Get a single LLM configuration by ID
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Config ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs/{id} [get]
func (h *LLMConfigHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的配置ID")
	}

	config, err := h.llmConfigService.GetByID(uint(id))
	if err != nil {
		if err == service.ErrLLMConfigNotFound {
			return fail(c, 404, "LLM配置不存在")
		}
		return fail(c, 500, "获取LLM配置失败: "+err.Error())
	}

	return success(c, config)
}

// Create creates a new LLM config
// @Summary Create LLM Config (Admin)
// @Description Create a new LLM configuration
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body model.CreateLLMConfigRequest true "Config data"
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs [post]
func (h *LLMConfigHandler) Create(c echo.Context) error {
	var req model.CreateLLMConfigRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "无效的请求参数")
	}

	// Validate required fields
	if req.Name == "" {
		return fail(c, 400, "配置名称不能为空")
	}
	if req.Provider == "" {
		return fail(c, 400, "服务商不能为空")
	}
	if req.Model == "" {
		return fail(c, 400, "模型名称不能为空")
	}
	if req.APIURL == "" {
		return fail(c, 400, "API地址不能为空")
	}
	if req.APIKey == "" {
		return fail(c, 400, "API Key不能为空")
	}

	config, err := h.llmConfigService.Create(&req)
	if err != nil {
		if err == service.ErrLLMConfigNameExists {
			return fail(c, 400, "配置名称已存在")
		}
		return fail(c, 500, "创建LLM配置失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "LLM配置创建成功",
		"config":  config,
	})
}

// Update updates an existing LLM config
// @Summary Update LLM Config (Admin)
// @Description Update an existing LLM configuration
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Config ID"
// @Param request body model.UpdateLLMConfigRequest true "Config data"
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs/{id} [put]
func (h *LLMConfigHandler) Update(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的配置ID")
	}

	var req model.UpdateLLMConfigRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "无效的请求参数")
	}

	config, err := h.llmConfigService.Update(uint(id), &req)
	if err != nil {
		if err == service.ErrLLMConfigNotFound {
			return fail(c, 404, "LLM配置不存在")
		}
		if err == service.ErrLLMConfigNameExists {
			return fail(c, 400, "配置名称已存在")
		}
		return fail(c, 500, "更新LLM配置失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "LLM配置更新成功",
		"config":  config,
	})
}

// Delete deletes an LLM config
// @Summary Delete LLM Config (Admin)
// @Description Delete an LLM configuration
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Config ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs/{id} [delete]
func (h *LLMConfigHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的配置ID")
	}

	if err := h.llmConfigService.Delete(uint(id)); err != nil {
		if err == service.ErrLLMConfigNotFound {
			return fail(c, 404, "LLM配置不存在")
		}
		return fail(c, 500, "删除LLM配置失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "LLM配置删除成功",
	})
}

// SetDefault sets a config as the default
// @Summary Set Default LLM Config (Admin)
// @Description Set an LLM configuration as the default
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Config ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs/{id}/default [post]
func (h *LLMConfigHandler) SetDefault(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的配置ID")
	}

	if err := h.llmConfigService.SetDefault(uint(id)); err != nil {
		if err == service.ErrLLMConfigNotFound {
			return fail(c, 404, "LLM配置不存在")
		}
		return fail(c, 500, "设置默认配置失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "默认配置设置成功",
	})
}

// GetDefault returns the default LLM config
// @Summary Get Default LLM Config (Admin)
// @Description Get the default LLM configuration
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs/default [get]
func (h *LLMConfigHandler) GetDefault(c echo.Context) error {
	config, err := h.llmConfigService.GetDefault()
	if err != nil {
		if err == service.ErrNoDefaultLLMConfig {
			return fail(c, 404, "未设置默认LLM配置")
		}
		return fail(c, 500, "获取默认配置失败: "+err.Error())
	}

	return success(c, config)
}

// Test tests an LLM config connection
// @Summary Test LLM Config (Admin)
// @Description Test an LLM configuration by making a test API call
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Config ID"
// @Param request body model.TestLLMConfigRequest false "Test parameters"
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs/{id}/test [post]
func (h *LLMConfigHandler) Test(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的配置ID")
	}

	var req model.TestLLMConfigRequest
	c.Bind(&req) // Optional, ignore error

	response, err := h.llmConfigService.Test(uint(id), req.Prompt)
	if err != nil {
		if err == service.ErrLLMConfigNotFound {
			return fail(c, 404, "LLM配置不存在")
		}
		if err == service.ErrLLMConfigDisabled {
			return fail(c, 400, "LLM配置已禁用")
		}
		return fail(c, 500, "测试失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message":  "测试成功",
		"response": response,
	})
}

// GetSelectOptions returns simplified options for select dropdowns
// @Summary Get LLM Config Options (Admin)
// @Description Get simplified LLM config options for select dropdowns
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs/options [get]
func (h *LLMConfigHandler) GetSelectOptions(c echo.Context) error {
	options, err := h.llmConfigService.GetSelectOptions()
	if err != nil {
		return fail(c, 500, "获取配置选项失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"options": options,
	})
}

// GetProviders returns supported LLM providers
// @Summary Get LLM Providers (Admin)
// @Description Get list of supported LLM providers
// @Tags Admin - LLM Config
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/llm-configs/providers [get]
func (h *LLMConfigHandler) GetProviders(c echo.Context) error {
	providers := []map[string]interface{}{
		{
			"id":          "openai",
			"name":        "OpenAI",
			"description": "OpenAI GPT系列模型",
			"api_url":     "https://api.openai.com/v1/chat/completions",
			"models":      []string{"gpt-4", "gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"},
		},
		{
			"id":          "azure",
			"name":        "Azure OpenAI",
			"description": "微软Azure托管的OpenAI服务",
			"api_url":     "https://{your-resource}.openai.azure.com/openai/deployments/{deployment}/chat/completions?api-version=2024-02-15-preview",
			"models":      []string{"gpt-4", "gpt-35-turbo"},
		},
		{
			"id":          "anthropic",
			"name":        "Anthropic",
			"description": "Anthropic Claude系列模型",
			"api_url":     "https://api.anthropic.com/v1/messages",
			"models":      []string{"claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"},
		},
		{
			"id":          "deepseek",
			"name":        "DeepSeek",
			"description": "DeepSeek深度求索AI模型",
			"api_url":     "https://api.deepseek.com/chat/completions",
			"models":      []string{"deepseek-chat", "deepseek-coder"},
		},
		{
			"id":          "gemini",
			"name":        "Google Gemini",
			"description": "Google Gemini系列模型",
			"api_url":     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
			"models":      []string{"gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"},
		},
		{
			"id":          "ollama",
			"name":        "Ollama",
			"description": "本地部署的开源模型",
			"api_url":     "http://localhost:11434/api/generate",
			"models":      []string{"llama2", "llama3", "mistral", "codellama", "qwen"},
		},
		{
			"id":          "custom",
			"name":        "自定义",
			"description": "自定义OpenAI兼容接口",
			"api_url":     "",
			"models":      []string{},
		},
	}

	return success(c, map[string]interface{}{
		"providers": providers,
	})
}

// RegisterRoutes registers all LLM config API routes
func (h *LLMConfigHandler) RegisterRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	llm := g.Group("/llm-configs", adminAuthMiddleware)

	// CRUD operations
	llm.GET("", h.List)
	llm.POST("", h.Create)
	llm.GET("/:id", h.GetByID)
	llm.PUT("/:id", h.Update)
	llm.DELETE("/:id", h.Delete)

	// Default config
	llm.GET("/default", h.GetDefault)
	llm.POST("/:id/default", h.SetDefault)

	// Test connection
	llm.POST("/:id/test", h.Test)

	// Options for select dropdowns
	llm.GET("/options", h.GetSelectOptions)
	llm.GET("/providers", h.GetProviders)
}
