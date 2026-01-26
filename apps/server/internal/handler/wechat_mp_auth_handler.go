package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

// WechatMPAuthHandler handles WeChat MP platform authentication API requests
type WechatMPAuthHandler struct {
	mpAuthService    *service.WechatMPAuthService
	wechatRSSService *service.WechatRSSService
}

// NewWechatMPAuthHandler creates a new WeChat MP auth handler
func NewWechatMPAuthHandler(
	mpAuthService *service.WechatMPAuthService,
	wechatRSSService *service.WechatRSSService,
) *WechatMPAuthHandler {
	return &WechatMPAuthHandler{
		mpAuthService:    mpAuthService,
		wechatRSSService: wechatRSSService,
	}
}

// GetAuthStatus returns the current WeChat MP authentication status
// @Summary Get Auth Status (Admin)
// @Description Get the current WeChat MP platform authentication status
// @Tags Admin - WeChat MP Auth
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-mp/auth [get]
func (h *WechatMPAuthHandler) GetAuthStatus(c echo.Context) error {
	status, err := h.mpAuthService.GetAuthStatus()
	if err != nil {
		return fail(c, http.StatusInternalServerError, "获取授权状态失败: "+err.Error())
	}

	return success(c, status)
}

// GetQRCode generates a new login QR code for WeChat MP platform
// @Summary Get Login QR Code (Admin)
// @Description Generate a new QR code for WeChat MP platform login
// @Tags Admin - WeChat MP Auth
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-mp/qrcode [get]
func (h *WechatMPAuthHandler) GetQRCode(c echo.Context) error {
	qrCode, err := h.mpAuthService.GetQRCode(c.Request().Context())
	if err != nil {
		return fail(c, http.StatusInternalServerError, "获取二维码失败: "+err.Error())
	}

	return success(c, qrCode)
}

// CheckLoginStatus checks the login status for a QR code scan
// @Summary Check Login Status (Admin)
// @Description Check the login status after scanning QR code
// @Tags Admin - WeChat MP Auth
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param uuid query string true "QR code UUID"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-mp/status [get]
func (h *WechatMPAuthHandler) CheckLoginStatus(c echo.Context) error {
	uuid := c.QueryParam("uuid")
	if uuid == "" {
		return fail(c, http.StatusBadRequest, "UUID参数不能为空")
	}

	status, err := h.mpAuthService.CheckLoginStatus(c.Request().Context(), uuid)
	if err != nil {
		return fail(c, http.StatusInternalServerError, "检查登录状态失败: "+err.Error())
	}

	return success(c, status)
}

// Logout logs out from WeChat MP platform
// @Summary Logout (Admin)
// @Description Logout from WeChat MP platform, invalidating current auth
// @Tags Admin - WeChat MP Auth
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-mp/logout [post]
func (h *WechatMPAuthHandler) Logout(c echo.Context) error {
	if err := h.mpAuthService.Logout(); err != nil {
		return fail(c, http.StatusInternalServerError, "登出失败: "+err.Error())
	}

	return success(c, map[string]string{
		"message": "登出成功",
	})
}

// SearchAccount searches for WeChat public accounts
// @Summary Search Account (Admin)
// @Description Search for WeChat public accounts by keyword
// @Tags Admin - WeChat MP Auth
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param keyword query string true "Search keyword"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-mp/search [get]
func (h *WechatMPAuthHandler) SearchAccount(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	if keyword == "" {
		return fail(c, http.StatusBadRequest, "搜索关键词不能为空")
	}

	accounts, err := h.mpAuthService.SearchAccount(c.Request().Context(), keyword)
	if err != nil {
		if err == service.ErrWechatMPAuthExpired {
			return fail(c, http.StatusUnauthorized, "授权已过期，请重新扫码授权")
		}
		return fail(c, http.StatusInternalServerError, "搜索失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"accounts": accounts,
		"total":    len(accounts),
	})
}

// CreateSourceViaAPI creates a subscription source using WeChat MP API
// @Summary Create Source via WeChat API (Admin)
// @Description Create a subscription source using WeChat MP platform API
// @Tags Admin - WeChat MP Auth
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body CreateSourceViaAPIRequest true "Article URL"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-mp/create-source [post]
func (h *WechatMPAuthHandler) CreateSourceViaAPI(c echo.Context) error {
	var req CreateSourceViaAPIRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "无效的请求参数")
	}

	if req.ArticleURL == "" {
		return fail(c, http.StatusBadRequest, "文章链接不能为空")
	}

	source, err := h.wechatRSSService.CreateSourceViaWechatAPI(req.ArticleURL)
	if err != nil {
		if err == service.ErrWechatMPAuthRequired {
			return fail(c, http.StatusUnauthorized, "请先扫码授权微信公众平台")
		}
		if err == service.ErrWechatMPAuthExpired {
			return fail(c, http.StatusUnauthorized, "授权已过期，请重新扫码授权")
		}
		if err == service.ErrWechatRSSSourceExists {
			return fail(c, http.StatusConflict, "该公众号已订阅")
		}
		return fail(c, http.StatusInternalServerError, "创建订阅失败: "+err.Error())
	}

	return success(c, source)
}

// CreateSourceViaAPIRequest represents the request for creating source via API
type CreateSourceViaAPIRequest struct {
	ArticleURL string `json:"article_url"`
}

// CreateSourceViaAccountRequest represents the request for creating source via account info
type CreateSourceViaAccountRequest struct {
	FakeID   string `json:"fake_id"`
	Nickname string `json:"nickname"`
	Alias    string `json:"alias"`
	HeadImg  string `json:"head_img"`
}

// CreateSourceViaAccount creates a subscription source using account info from search
// @Summary Create Source via Account Info (Admin)
// @Description Create a subscription source using account info from search results
// @Tags Admin - WeChat MP Auth
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body CreateSourceViaAccountRequest true "Account Info"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-mp/create-source-by-account [post]
func (h *WechatMPAuthHandler) CreateSourceViaAccount(c echo.Context) error {
	var req CreateSourceViaAccountRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "无效的请求参数")
	}

	if req.FakeID == "" {
		return fail(c, http.StatusBadRequest, "fakeid不能为空")
	}

	source, err := h.wechatRSSService.CreateSourceViaAccountInfo(req.FakeID, req.Nickname, req.Alias, req.HeadImg)
	if err != nil {
		if err == service.ErrWechatRSSSourceExists {
			return fail(c, http.StatusConflict, "该公众号已订阅")
		}
		return fail(c, http.StatusInternalServerError, "创建订阅失败: "+err.Error())
	}

	return success(c, source)
}

// GetArticles gets articles from a public account via WeChat API
// @Summary Get Articles via API (Admin)
// @Description Get articles from a public account using WeChat MP platform API
// @Tags Admin - WeChat MP Auth
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param fakeid query string true "Public account fakeid"
// @Param begin query int false "Start index (default 0)"
// @Param count query int false "Number of articles (default 5, max 10)"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-mp/articles [get]
func (h *WechatMPAuthHandler) GetArticles(c echo.Context) error {
	fakeid := c.QueryParam("fakeid")
	if fakeid == "" {
		return fail(c, http.StatusBadRequest, "fakeid参数不能为空")
	}

	begin := 0
	if beginStr := c.QueryParam("begin"); beginStr != "" {
		if v, err := strconv.Atoi(beginStr); err == nil {
			begin = v
		}
	}

	count := 5
	if countStr := c.QueryParam("count"); countStr != "" {
		if v, err := strconv.Atoi(countStr); err == nil {
			count = v
		}
	}
	if count > 10 {
		count = 10
	}

	articles, err := h.mpAuthService.GetArticleList(c.Request().Context(), fakeid, begin, count)
	if err != nil {
		if err == service.ErrWechatMPAuthExpired {
			return fail(c, http.StatusUnauthorized, "授权已过期，请重新扫码授权")
		}
		return fail(c, http.StatusInternalServerError, "获取文章失败: "+err.Error())
	}

	return success(c, articles)
}
