package crawler

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"regexp"
	"strings"
	"time"

	"go.uber.org/zap"
)

// WechatMPCrawler handles WeChat MP platform API interactions
type WechatMPCrawler struct {
	client      *http.Client
	logger      *zap.Logger
	baseURL     string
	fingerprint string // Used for login verification
}

// NewWechatMPCrawler creates a new WeChat MP platform crawler
func NewWechatMPCrawler(logger *zap.Logger) *WechatMPCrawler {
	jar, _ := cookiejar.New(nil)
	return &WechatMPCrawler{
		client: &http.Client{
			Timeout: 30 * time.Second,
			Jar:     jar,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= 10 {
					return fmt.Errorf("stopped after 10 redirects")
				}
				return nil
			},
		},
		logger:  logger,
		baseURL: "https://mp.weixin.qq.com",
	}
}

// QRCodeInfo represents the QR code response for login
type QRCodeInfo struct {
	QRCodeURL string `json:"qrcode_url"` // Base64 encoded QR code image or URL
	UUID      string `json:"uuid"`       // Unique identifier for polling login status
	ExpiresIn int    `json:"expires_in"` // QR code validity in seconds
}

// LoginStatus represents the status of a login attempt
type LoginStatus struct {
	Status      string `json:"status"`       // waiting/scanned/confirmed/expired/error
	Message     string `json:"message"`      // Human-readable message
	Token       string `json:"token"`        // Login token (only when confirmed)
	Cookies     string `json:"cookies"`      // JSON-encoded cookies (only when confirmed)
	AccountName string `json:"account_name"` // Account name (only when confirmed)
	AccountID   string `json:"account_id"`   // Account ID (only when confirmed)
}

// MPAccountInfo represents a WeChat MP account info
type MPAccountInfo struct {
	FakeID      string `json:"fake_id"`
	Nickname    string `json:"nickname"`
	Alias       string `json:"alias"`       // 微信号
	RoundHeadImg string `json:"round_head_img"`
	ServiceType int    `json:"service_type"`
}

// MPArticle represents a single article from WeChat MP
type MPArticle struct {
	AID         string     `json:"aid"`
	Title       string     `json:"title"`
	Digest      string     `json:"digest"`
	Link        string     `json:"link"`
	Cover       string     `json:"cover"`
	CreateTime  int64      `json:"create_time"`
	UpdateTime  int64      `json:"update_time"`
}

// MPArticleListResponse represents the response from article list API
type MPArticleListResponse struct {
	AppMsgCnt   int         `json:"app_msg_cnt"`
	Articles    []MPArticle `json:"articles"`
}

// GetQRCode gets a new login QR code from WeChat MP platform
// Based on we-mp-rss implementation
func (c *WechatMPCrawler) GetQRCode(ctx context.Context) (*QRCodeInfo, error) {
	c.logger.Info("Getting WeChat MP login QR code")

	// Step 1: Visit the main page first to establish session
	mainPageURL := c.baseURL + "/"
	req, err := http.NewRequestWithContext(ctx, "GET", mainPageURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create main page request: %w", err)
	}
	c.setDefaultHeaders(req)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch main page: %w", err)
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()
	
	c.logger.Info("Main page response", 
		zap.Int("status", resp.StatusCode),
		zap.String("final_url", resp.Request.URL.String()))

	// Step 2: Call startlogin to initiate login process and get UUID
	uuid := generateUUID()
	fingerprint := generateUUID()
	
	startLoginURL := fmt.Sprintf("%s/cgi-bin/bizlogin?action=startlogin", c.baseURL)
	formData := url.Values{
		"fingerprint":  {fingerprint},
		"token":        {""},
		"lang":         {"zh_CN"},
		"f":            {"json"},
		"ajax":         {"1"},
		"redirect_url": {""},
		"login_type":   {"3"},
	}
	
	req, err = http.NewRequestWithContext(ctx, "POST", startLoginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create startlogin request: %w", err)
	}
	c.setDefaultHeaders(req)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Referer", c.baseURL+"/")
	req.Header.Set("X-Requested-With", "XMLHttpRequest")

	resp, err = c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to start login: %w", err)
	}
	
	startLoginBody, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	
	c.logger.Info("Start login response", 
		zap.Int("status", resp.StatusCode),
		zap.String("body", string(startLoginBody)))

	// Try to get UUID from cookies
	baseURL, _ := url.Parse(c.baseURL)
	cookies := c.client.Jar.Cookies(baseURL)
	for _, cookie := range cookies {
		if cookie.Name == "uuid" {
			uuid = cookie.Value
			break
		}
	}
	
	c.logger.Info("Using UUID for QR code", zap.String("uuid", uuid))

	// Step 3: Get the QR code image using scanloginqrcode endpoint
	timestamp := time.Now().UnixMilli()
	qrcodeURL := fmt.Sprintf("%s/cgi-bin/scanloginqrcode?action=getqrcode&uuid=%s&random=%d", 
		c.baseURL, uuid, timestamp)
	
	c.logger.Info("Fetching QR code", zap.String("url", qrcodeURL))
	
	req, err = http.NewRequestWithContext(ctx, "GET", qrcodeURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create QR code request: %w", err)
	}
	c.setDefaultHeaders(req)
	req.Header.Set("Referer", c.baseURL+"/")
	req.Header.Set("Accept", "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")
	req.Header.Set("Sec-Fetch-Dest", "image")
	req.Header.Set("Sec-Fetch-Mode", "no-cors")
	req.Header.Set("Sec-Fetch-Site", "same-origin")

	resp, err = c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch QR code: %w", err)
	}
	defer resp.Body.Close()

	c.logger.Info("QR code response", 
		zap.Int("status", resp.StatusCode),
		zap.String("content_type", resp.Header.Get("Content-Type")),
		zap.Int64("content_length", resp.ContentLength))

	// Read QR code image as bytes
	qrcodeBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read QR code: %w", err)
	}

	c.logger.Info("QR code bytes read", zap.Int("size", len(qrcodeBytes)))

	// Check if we got actual image data
	if len(qrcodeBytes) < 100 {
		// Likely not an image, log the content for debugging
		c.logger.Warn("QR code response too small, might be an error page",
			zap.String("content", string(qrcodeBytes)))
		return nil, fmt.Errorf("failed to get QR code image, response too small (%d bytes)", len(qrcodeBytes))
	}

	// Determine image type based on content
	contentType := resp.Header.Get("Content-Type")
	imageType := "png"
	if strings.Contains(contentType, "jpeg") || strings.Contains(contentType, "jpg") {
		imageType = "jpeg"
	} else if strings.Contains(contentType, "gif") {
		imageType = "gif"
	}

	// Convert to base64 for frontend display
	qrcodeBase64 := fmt.Sprintf("data:image/%s;base64,%s", 
		imageType, encodeToBase64(qrcodeBytes))

	c.logger.Info("QR code generated successfully", zap.String("uuid", uuid), zap.Int("image_size", len(qrcodeBytes)))

	// Store fingerprint for later use in login check
	c.fingerprint = fingerprint

	return &QRCodeInfo{
		QRCodeURL: qrcodeBase64,
		UUID:      uuid,
		ExpiresIn: 300, // 5 minutes
	}, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// CheckLoginStatus checks the current login status
// Uses scanloginqrcode?action=ask endpoint as per we-mp-rss implementation
func (c *WechatMPCrawler) CheckLoginStatus(ctx context.Context, uuid string) (*LoginStatus, error) {
	c.logger.Debug("Checking login status", zap.String("uuid", uuid))

	// Use fingerprint from GetQRCode, or generate a new one
	fingerprint := c.fingerprint
	if fingerprint == "" {
		fingerprint = generateUUID()
	}

	statusURL := fmt.Sprintf("%s/cgi-bin/scanloginqrcode?action=ask&fingerprint=%s&lang=zh_CN&f=json&ajax=1",
		c.baseURL, fingerprint)

	req, err := http.NewRequestWithContext(ctx, "GET", statusURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create status request: %w", err)
	}
	c.setDefaultHeaders(req)
	req.Header.Set("Referer", c.baseURL+"/")
	req.Header.Set("X-Requested-With", "XMLHttpRequest")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to check status: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	c.logger.Debug("Login status response", zap.String("body", string(body)))

	// Parse response
	var result struct {
		BaseResp struct {
			Ret    int    `json:"ret"`
			ErrMsg string `json:"err_msg"`
		} `json:"base_resp"`
		Status     int    `json:"status"`
		UserAvatar string `json:"userAvatar"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse status: %w", err)
	}

	status := &LoginStatus{}

	// Status codes based on we-mp-rss implementation:
	// 0 - waiting, 1 - success, 2 - scanned, 3 - success, 4 - scanned waiting confirm
	switch result.Status {
	case 0:
		status.Status = "waiting"
		status.Message = "等待扫码"
	case 2, 4:
		status.Status = "scanned"
		status.Message = "已扫码，请在手机上确认"
	case 1, 3:
		status.Status = "confirmed"
		status.Message = "登录成功"
		
		// Try to complete login and get token
		loginResult, err := c.completeLogin(ctx, fingerprint)
		if err != nil {
			status.Status = "error"
			status.Message = fmt.Sprintf("登录完成失败: %v", err)
		} else {
			status.Token = loginResult.Token
			status.Cookies = loginResult.Cookies
			status.AccountName = loginResult.AccountName
			status.AccountID = loginResult.AccountID
		}
	case -1:
		status.Status = "cancelled"
		status.Message = "用户取消登录"
	default:
		status.Status = "waiting"
		status.Message = "等待扫码"
	}

	return status, nil
}

// completeLogin completes the login process after QR code confirmation
// Based on we-mp-rss implementation
func (c *WechatMPCrawler) completeLogin(ctx context.Context, fingerprint string) (*LoginStatus, error) {
	// Bizlogin to complete the authentication
	loginURL := fmt.Sprintf("%s/cgi-bin/bizlogin?action=login", c.baseURL)

	formData := url.Values{
		"userlang":         {"zh_CN"},
		"redirect_url":     {""},
		"cookie_forbidden": {"0"},
		"cookie_cleaned":   {"0"},
		"plugin_used":      {"0"},
		"login_type":       {"3"},
		"fingerprint":      {fingerprint},
		"token":            {""},
		"lang":             {"zh_CN"},
		"f":                {"json"},
		"ajax":             {"1"},
	}

	req, err := http.NewRequestWithContext(ctx, "POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create login request: %w", err)
	}
	c.setDefaultHeaders(req)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Referer", c.baseURL+"/")
	req.Header.Set("X-Requested-With", "XMLHttpRequest")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to complete login: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read login response: %w", err)
	}

	c.logger.Info("Login response", zap.String("body", string(body)))

	var result struct {
		BaseResp struct {
			Ret    int    `json:"ret"`
			ErrMsg string `json:"err_msg"`
		} `json:"base_resp"`
		RedirectURL string `json:"redirect_url"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse login response: %w", err)
	}

	if result.BaseResp.Ret != 0 {
		return nil, fmt.Errorf("login failed: %s", result.BaseResp.ErrMsg)
	}

	// Extract token from redirect URL
	token := ""
	if result.RedirectURL != "" {
		// RedirectURL is usually like /cgi-bin/home?t=home/index&lang=zh_CN&token=xxx
		re := regexp.MustCompile(`token=([^&\s"']+)`)
		if matches := re.FindStringSubmatch(result.RedirectURL); len(matches) > 1 {
			token = matches[1]
		}
	}

	c.logger.Info("Extracted token from redirect", zap.String("token", token))

	if token == "" {
		// Try to get token from subsequent requests
		token, _ = c.extractTokenFromHome(ctx)
	}

	// Serialize cookies
	cookiesJSON, _ := json.Marshal(c.getCookiesMap())

	// Get account info
	accountName, accountID := c.getAccountInfo(ctx, token)

	return &LoginStatus{
		Status:      "confirmed",
		Message:     "登录成功",
		Token:       token,
		Cookies:     string(cookiesJSON),
		AccountName: accountName,
		AccountID:   accountID,
	}, nil
}

// extractTokenFromHome extracts token from the home page
func (c *WechatMPCrawler) extractTokenFromHome(ctx context.Context) (string, error) {
	homeURL := fmt.Sprintf("%s/cgi-bin/home?t=home/index&lang=zh_CN", c.baseURL)
	
	req, err := http.NewRequestWithContext(ctx, "GET", homeURL, nil)
	if err != nil {
		return "", err
	}
	c.setDefaultHeaders(req)

	resp, err := c.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	// Extract token from page content
	tokenRegex := regexp.MustCompile(`token=(\d+)`)
	if matches := tokenRegex.FindStringSubmatch(string(body)); len(matches) > 1 {
		return matches[1], nil
	}

	return "", fmt.Errorf("token not found in home page")
}

// getAccountInfo gets the logged-in account information
func (c *WechatMPCrawler) getAccountInfo(ctx context.Context, token string) (name, id string) {
	infoURL := fmt.Sprintf("%s/cgi-bin/settingpage?t=setting/index&action=index&token=%s&lang=zh_CN", 
		c.baseURL, token)

	req, err := http.NewRequestWithContext(ctx, "GET", infoURL, nil)
	if err != nil {
		return "", ""
	}
	c.setDefaultHeaders(req)

	resp, err := c.client.Do(req)
	if err != nil {
		return "", ""
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", ""
	}

	content := string(body)

	// Extract account name
	nameRegex := regexp.MustCompile(`nickname\s*[:=]\s*["']([^"']+)["']`)
	if matches := nameRegex.FindStringSubmatch(content); len(matches) > 1 {
		name = matches[1]
	}

	// Extract account ID
	idRegex := regexp.MustCompile(`fakeid\s*[:=]\s*["']([^"']+)["']`)
	if matches := idRegex.FindStringSubmatch(content); len(matches) > 1 {
		id = matches[1]
	}

	return name, id
}

// SearchAccount searches for a public account by keyword
func (c *WechatMPCrawler) SearchAccount(ctx context.Context, keyword, token string, cookies map[string]string) ([]MPAccountInfo, error) {
	c.logger.Info("Searching WeChat MP account", zap.String("keyword", keyword))

	// Set cookies if provided
	if cookies != nil {
		c.setCookies(cookies)
	}

	searchURL := fmt.Sprintf("%s/cgi-bin/searchbiz?action=search_biz&begin=0&count=5&query=%s&token=%s&lang=zh_CN&f=json&ajax=1",
		c.baseURL, url.QueryEscape(keyword), token)

	req, err := http.NewRequestWithContext(ctx, "GET", searchURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create search request: %w", err)
	}
	c.setDefaultHeaders(req)
	req.Header.Set("Referer", fmt.Sprintf("%s/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=10&token=%s", c.baseURL, token))

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to search: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	c.logger.Debug("Search response", zap.String("body", string(body)))

	var result struct {
		BaseResp struct {
			Ret    int    `json:"ret"`
			ErrMsg string `json:"err_msg"`
		} `json:"base_resp"`
		List []struct {
			FakeID       string `json:"fakeid"`
			Nickname     string `json:"nickname"`
			Alias        string `json:"alias"`
			RoundHeadImg string `json:"round_head_img"`
			ServiceType  int    `json:"service_type"`
		} `json:"list"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse search response: %w", err)
	}

	if result.BaseResp.Ret != 0 {
		// Check for common error codes
		if result.BaseResp.Ret == -1 || result.BaseResp.Ret == 200003 {
			return nil, fmt.Errorf("token expired, please re-login")
		}
		return nil, fmt.Errorf("search failed: %s (code: %d)", result.BaseResp.ErrMsg, result.BaseResp.Ret)
	}

	accounts := make([]MPAccountInfo, 0, len(result.List))
	for _, item := range result.List {
		accounts = append(accounts, MPAccountInfo{
			FakeID:      item.FakeID,
			Nickname:    item.Nickname,
			Alias:       item.Alias,
			RoundHeadImg: item.RoundHeadImg,
			ServiceType: item.ServiceType,
		})
	}

	return accounts, nil
}

// GetFakeIDFromBiz gets the fakeid for a public account using its biz parameter
func (c *WechatMPCrawler) GetFakeIDFromBiz(ctx context.Context, biz, token string, cookies map[string]string) (*MPAccountInfo, error) {
	c.logger.Info("Getting fakeid from biz", zap.String("biz", biz))

	// Search using the biz as keyword - this usually finds the account
	accounts, err := c.SearchAccount(ctx, biz, token, cookies)
	if err != nil {
		return nil, err
	}

	if len(accounts) == 0 {
		return nil, fmt.Errorf("no account found for biz: %s", biz)
	}

	// Return the first match
	return &accounts[0], nil
}

// GetArticleList gets the article list for a public account
func (c *WechatMPCrawler) GetArticleList(ctx context.Context, fakeid, token string, cookies map[string]string, begin, count int) (*MPArticleListResponse, error) {
	c.logger.Info("Getting article list", zap.String("fakeid", fakeid), zap.Int("begin", begin))

	// Set cookies if provided
	if cookies != nil {
		c.setCookies(cookies)
	}

	// Use appmsgpublish API for getting published articles
	articleURL := fmt.Sprintf("%s/cgi-bin/appmsgpublish?sub=list&sub_action=list_ex&begin=%d&count=%d&fakeid=%s&type=101&query=&token=%s&lang=zh_CN&f=json&ajax=1",
		c.baseURL, begin, count, fakeid, token)

	req, err := http.NewRequestWithContext(ctx, "GET", articleURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create article request: %w", err)
	}
	c.setDefaultHeaders(req)
	req.Header.Set("Referer", fmt.Sprintf("%s/cgi-bin/appmsgpublish?t=appmsg/manage&token=%s", c.baseURL, token))

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get articles: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	c.logger.Debug("Article list response", zap.String("body", string(body)[:min(500, len(body))]))

	var result struct {
		BaseResp struct {
			Ret    int    `json:"ret"`
			ErrMsg string `json:"err_msg"`
		} `json:"base_resp"`
		AppMsgCnt   int    `json:"app_msg_cnt"`
		PublishPage string `json:"publish_page"` // JSON string containing articles
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if result.BaseResp.Ret != 0 {
		if result.BaseResp.Ret == -1 || result.BaseResp.Ret == 200003 {
			return nil, fmt.Errorf("token expired, please re-login")
		}
		return nil, fmt.Errorf("get articles failed: %s (code: %d)", result.BaseResp.ErrMsg, result.BaseResp.Ret)
	}

	// Parse the publish_page JSON
	articles, err := c.parsePublishPage(result.PublishPage)
	if err != nil {
		c.logger.Warn("Failed to parse publish_page", zap.Error(err))
	}

	return &MPArticleListResponse{
		AppMsgCnt: result.AppMsgCnt,
		Articles:  articles,
	}, nil
}

// parsePublishPage parses the publish_page JSON string to extract articles
func (c *WechatMPCrawler) parsePublishPage(publishPage string) ([]MPArticle, error) {
	if publishPage == "" {
		return nil, nil
	}

	var pageData struct {
		PublishList []struct {
			PublishInfo struct {
				AppMsgInfo []struct {
					Title      string `json:"title"`
					Digest     string `json:"digest"`
					Link       string `json:"content_url"`
					Cover      string `json:"cover"`
					CreateTime int64  `json:"create_time"`
					UpdateTime int64  `json:"update_time"`
					AID        string `json:"aid"`
				} `json:"appmsg_info"`
			} `json:"publish_info"`
		} `json:"publish_list"`
	}

	if err := json.Unmarshal([]byte(publishPage), &pageData); err != nil {
		return nil, fmt.Errorf("failed to parse publish_page: %w", err)
	}

	var articles []MPArticle
	for _, pub := range pageData.PublishList {
		for _, info := range pub.PublishInfo.AppMsgInfo {
			articles = append(articles, MPArticle{
				AID:        info.AID,
				Title:      info.Title,
				Digest:     info.Digest,
				Link:       info.Link,
				Cover:      info.Cover,
				CreateTime: info.CreateTime,
				UpdateTime: info.UpdateTime,
			})
		}
	}

	return articles, nil
}

// SetAuthInfo sets authentication info for subsequent requests
func (c *WechatMPCrawler) SetAuthInfo(token string, cookies map[string]string) {
	c.setCookies(cookies)
}

// setDefaultHeaders sets common headers for requests
func (c *WechatMPCrawler) setDefaultHeaders(req *http.Request) {
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/javascript, */*; q=0.01")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
	req.Header.Set("X-Requested-With", "XMLHttpRequest")
}

// setCookies sets cookies on the HTTP client
func (c *WechatMPCrawler) setCookies(cookies map[string]string) {
	u, _ := url.Parse(c.baseURL)
	var cookieList []*http.Cookie
	for name, value := range cookies {
		cookieList = append(cookieList, &http.Cookie{
			Name:  name,
			Value: value,
		})
	}
	c.client.Jar.SetCookies(u, cookieList)
}

// getCookiesMap returns current cookies as a map
func (c *WechatMPCrawler) getCookiesMap() map[string]string {
	u, _ := url.Parse(c.baseURL)
	cookies := c.client.Jar.Cookies(u)
	result := make(map[string]string)
	for _, cookie := range cookies {
		result[cookie.Name] = cookie.Value
	}
	return result
}

// Helper functions

func encodeToBase64(data []byte) string {
	const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	
	result := make([]byte, 0, ((len(data)+2)/3)*4)
	for i := 0; i < len(data); i += 3 {
		var n uint32
		remaining := len(data) - i
		
		n = uint32(data[i]) << 16
		if remaining > 1 {
			n |= uint32(data[i+1]) << 8
		}
		if remaining > 2 {
			n |= uint32(data[i+2])
		}
		
		result = append(result, base64Chars[(n>>18)&0x3F])
		result = append(result, base64Chars[(n>>12)&0x3F])
		
		if remaining > 1 {
			result = append(result, base64Chars[(n>>6)&0x3F])
		} else {
			result = append(result, '=')
		}
		
		if remaining > 2 {
			result = append(result, base64Chars[n&0x3F])
		} else {
			result = append(result, '=')
		}
	}
	
	return string(result)
}

func generateUUID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
