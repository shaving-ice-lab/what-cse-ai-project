// Package crawler provides Fenbi web crawling functionality
package crawler

import (
	"bufio"
	"compress/gzip"
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"go.uber.org/zap"
	"golang.org/x/net/html/charset"
	"golang.org/x/text/encoding/simplifiedchinese"
	"golang.org/x/text/transform"
)

const (
	// Primary login endpoints (tiku subdomain - may accept plain passwords)
	FenbiTikuLoginURL = "https://tiku.fenbi.com/api/users/loginV2"
	// Fallback login endpoints (login subdomain - requires RSA encryption)
	FenbiLoginURL          = "https://login.fenbi.com/api/users/loginV2"
	FenbiListURL           = "https://www.fenbi.com/page/exams-information-list"
	FenbiDetailURL         = "https://www.fenbi.com/page/exam-information-detail"
	FenbiCheckLoginURL     = "https://login.fenbi.com/api/users/session"
	FenbiTikuCheckLoginURL = "https://tiku.fenbi.com/api/users/session"
	FenbiRSAPublicKeyURL   = "https://login.fenbi.com/api/users/getPublicKey"

	// New API endpoint for querying exam announcements
	FenbiExamAPIURL = "https://market-api.fenbi.com/toolkit/api/v1/pc/exam/queryByCondition"

	// Hardcoded RSA public key from fenbi's encrypt.js
	// This is Base64 encoded hex modulus, exponent is 65537 (0x10001)
	FenbiHardcodedPublicKey = "ANKi9PWuvDOsagwIVvrPx77mXNV0APmjySsYjB1/GtUTY6cyKNRl2RCTt608m9nYk5VeCG2EAZRQmQNQTyfZkw0Uo+MytAkjj17BXOpY4o6+BToi7rRKfTGl6J60/XBZcGSzN1XVZ80ElSjaGE8Ocg8wbPN18tbmsy761zN5SuIl"
)

// FenbiExamAPIRequest represents the request body for the exam API
type FenbiExamAPIRequest struct {
	DistrictID     string `json:"districtId"`
	ExamType       string `json:"examType"`
	Year           string `json:"year"`
	EnrollStatus   *int   `json:"enrollStatus"`
	RecruitNumCode *int   `json:"recruitNumCode"`
	Start          int    `json:"start"`
	Len            int    `json:"len"`
	NeedTotal      bool   `json:"needTotal"`
}

// FenbiExamAPIResponse represents the API response
type FenbiExamAPIResponse struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Data struct {
		StickTopArticles []FenbiExamArticle `json:"stickTopArticles"`
		Articles         []FenbiExamArticle `json:"articles"`
		Total            int                `json:"total"`
	} `json:"data"`
}

// FenbiExamArticle represents an article in the API response
type FenbiExamArticle struct {
	ID        int64  `json:"id"`
	ExamID    int64  `json:"examId"`
	Title     string `json:"title"`
	IssueTime int64  `json:"issueTime"`
	TagsList  []struct {
		ID   int    `json:"id"`
		Type int    `json:"type"` // 1=region, 2=examType, 3=year
		Name string `json:"name"`
	} `json:"tagsList"`
	AnnouncementArticleInfoRet struct {
		EnrollStatus    int    `json:"enrollStatus"`
		EnrollStartTime int64  `json:"enrollStartTime"`
		EnrollEndTime   int64  `json:"enrollEndTime"`
		RecruitNumRet   string `json:"recruitNumRet"`
		PositionNum     int    `json:"positionNum"`
	} `json:"announcementArticleInfoRet"`
	ExamType int `json:"examType"`
}

// FenbiSpider handles Fenbi website crawling
type FenbiSpider struct {
	*Spider
	httpClient *http.Client
	cookies    []*http.Cookie
	logger     *zap.Logger
}

// FenbiListItem represents an announcement item from the list page
type FenbiListItem struct {
	FenbiID      string `json:"fenbi_id"`
	Title        string `json:"title"`
	FenbiURL     string `json:"fenbi_url"`
	RegionCode   string `json:"region_code"`
	RegionName   string `json:"region_name"`
	ExamTypeCode string `json:"exam_type_code"`
	ExamTypeName string `json:"exam_type_name"`
	Year         int    `json:"year"`
	PublishDate  string `json:"publish_date"`
}

// FenbiDetailInfo represents detail info from the detail page
type FenbiDetailInfo struct {
	FenbiID     string `json:"fenbi_id"`
	Title       string `json:"title"`
	OriginalURL string `json:"original_url"` // 短链接 (t.fenbi.com)
	FinalURL    string `json:"final_url"`    // 最终跳转URL
	Content     string `json:"content"`
}

// FenbiCrawlResult holds the result of a crawl operation
type FenbiCrawlResult struct {
	Items       []FenbiListItem `json:"items"`
	TotalFound  int             `json:"total_found"`
	HasNextPage bool            `json:"has_next_page"`
	CurrentPage int             `json:"current_page"`
}

// LoginResult represents the login result
type LoginResult struct {
	Success   bool       `json:"success"`
	Message   string     `json:"message"`
	Cookies   string     `json:"cookies"`
	ExpiresAt *time.Time `json:"expires_at"`
	UserID    string     `json:"user_id,omitempty"`
}

// NewFenbiSpider creates a new Fenbi spider instance
func NewFenbiSpider(config *SpiderConfig, logger *zap.Logger) *FenbiSpider {
	jar, _ := cookiejar.New(nil)

	client := &http.Client{
		Jar:     jar,
		Timeout: 30 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	spider := &FenbiSpider{
		Spider:     NewSpider("fenbi", config, logger),
		httpClient: client,
		logger:     logger,
	}

	return spider
}

// SetCookies sets the cookies for authenticated requests
func (s *FenbiSpider) SetCookies(cookieStr string) error {
	if cookieStr == "" {
		return nil
	}

	// Parse cookie string and set to jar for all Fenbi domains
	fenbiURL, _ := url.Parse("https://www.fenbi.com")
	loginURL, _ := url.Parse("https://login.fenbi.com")
	tikuURL, _ := url.Parse("https://tiku.fenbi.com")

	cookies := parseCookieString(cookieStr)
	s.cookies = cookies
	s.httpClient.Jar.SetCookies(fenbiURL, cookies)
	s.httpClient.Jar.SetCookies(loginURL, cookies)
	s.httpClient.Jar.SetCookies(tikuURL, cookies)

	s.logger.Debug("SetCookies completed",
		zap.Int("cookies_count", len(cookies)),
		zap.String("cookies_preview", cookieStr[:min(len(cookieStr), 100)]),
	)

	return nil
}

// GetRSAPublicKey fetches the RSA public key from Fenbi
func (s *FenbiSpider) GetRSAPublicKey() (string, error) {
	req, err := http.NewRequest("GET", FenbiRSAPublicKeyURL, nil)
	if err != nil {
		return "", fmt.Errorf("创建请求失败: %w", err)
	}

	// Set comprehensive headers to mimic browser request
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Origin", "https://www.fenbi.com")
	req.Header.Set("Referer", "https://www.fenbi.com/")
	req.Header.Set("Sec-Fetch-Dest", "empty")
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("Sec-Fetch-Site", "same-site")
	req.Header.Set("Connection", "keep-alive")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("请求失败(网络错误): %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("读取响应失败: %w", err)
	}

	// Check for empty response first
	if len(body) == 0 {
		s.logger.Error("GetRSAPublicKey: empty response",
			zap.Int("status_code", resp.StatusCode),
			zap.String("url", FenbiRSAPublicKeyURL),
		)
		return "", errors.New("粉笔API返回空响应，可能是网络问题或API已变更，请稍后重试")
	}

	// Log for debugging
	bodyPreview := string(body)
	if len(bodyPreview) > 200 {
		bodyPreview = bodyPreview[:200]
	}
	s.logger.Debug("GetRSAPublicKey response",
		zap.Int("status_code", resp.StatusCode),
		zap.Int("body_length", len(body)),
		zap.String("body_preview", bodyPreview),
	)

	if resp.StatusCode != http.StatusOK {
		bodyStr := string(body)
		if len(bodyStr) > 500 {
			bodyStr = bodyStr[:500]
		}
		return "", fmt.Errorf("请求返回非200状态码: %d, body: %s", resp.StatusCode, bodyStr)
	}

	// Check if response is HTML (redirect or error page)
	bodyStr := string(body)
	if strings.Contains(bodyStr, "<html") || strings.Contains(bodyStr, "<!DOCTYPE") {
		return "", errors.New("粉笔API返回了HTML页面而非JSON，可能需要验证码或登录状态异常")
	}

	var result struct {
		Code int `json:"code"`
		Data struct {
			PublicKey string `json:"publicKey"`
		} `json:"data"`
		Message string `json:"message"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		preview := bodyStr
		if len(preview) > 200 {
			preview = preview[:200]
		}
		return "", fmt.Errorf("JSON解析失败: %w, 原始响应: %s", err, preview)
	}

	if result.Code != 1 {
		msg := result.Message
		if msg == "" {
			msg = "未知错误"
		}
		return "", fmt.Errorf("获取公钥失败: code=%d, message=%s", result.Code, msg)
	}

	if result.Data.PublicKey == "" {
		return "", errors.New("API返回的公钥为空")
	}

	return result.Data.PublicKey, nil
}

// EncryptPassword encrypts the password using RSA public key
// The publicKeyBase64 is a base64-encoded hex string representing the modulus
func (s *FenbiSpider) EncryptPassword(password, publicKeyBase64 string) (string, error) {
	// Decode base64 to get the modulus bytes
	modulusBytes, err := base64.StdEncoding.DecodeString(publicKeyBase64)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64 public key: %w", err)
	}

	// Convert bytes to big.Int for modulus
	n := new(big.Int).SetBytes(modulusBytes)

	// Exponent is always 65537 (0x10001) for Fenbi
	e := 65537

	rsaPub := &rsa.PublicKey{
		N: n,
		E: e,
	}

	s.logger.Debug("RSA public key for encryption",
		zap.Int("modulus_bits", n.BitLen()),
		zap.Int("exponent", e),
	)

	// Encrypt with RSA PKCS1v15
	encrypted, err := rsa.EncryptPKCS1v15(rand.Reader, rsaPub, []byte(password))
	if err != nil {
		return "", fmt.Errorf("failed to encrypt password: %w", err)
	}

	// Convert to hex string then to base64 (matching Fenbi's encrypt.js)
	hexStr := fmt.Sprintf("%x", encrypted)
	// Pad with leading zero if needed to ensure even length
	if len(hexStr)%2 != 0 {
		hexStr = "0" + hexStr
	}

	result := hexToBase64(hexStr)

	s.logger.Debug("Password encryption result",
		zap.Int("encrypted_bytes", len(encrypted)),
		zap.Int("hex_length", len(hexStr)),
		zap.Int("base64_length", len(result)),
	)

	return result, nil
}

// EncryptPasswordWithHardcodedKey encrypts password using the hardcoded public key
func (s *FenbiSpider) EncryptPasswordWithHardcodedKey(password string) (string, error) {
	return s.EncryptPassword(password, FenbiHardcodedPublicKey)
}

// hexToBase64 converts hex string to base64 (matching Fenbi's ai() function)
func hexToBase64(hexStr string) string {
	const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	var result strings.Builder

	for i := 0; i+3 <= len(hexStr); i += 3 {
		val, _ := strconv.ParseInt(hexStr[i:i+3], 16, 64)
		result.WriteByte(base64Chars[val>>6])
		result.WriteByte(base64Chars[val&63])
	}

	remainder := len(hexStr) % 3
	if remainder == 1 {
		val, _ := strconv.ParseInt(hexStr[len(hexStr)-1:], 16, 64)
		result.WriteByte(base64Chars[val<<2])
	} else if remainder == 2 {
		val, _ := strconv.ParseInt(hexStr[len(hexStr)-2:], 16, 64)
		result.WriteByte(base64Chars[val>>2])
		result.WriteByte(base64Chars[(val&3)<<4])
	}

	// Pad to multiple of 4
	for result.Len()%4 != 0 {
		result.WriteByte('=')
	}

	return result.String()
}

// InitSession visits the Fenbi main page to initialize cookies/session
func (s *FenbiSpider) InitSession() error {
	req, err := http.NewRequest("GET", "https://www.fenbi.com/", nil)
	if err != nil {
		return err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		s.logger.Warn("Failed to init session", zap.Error(err))
		return err
	}
	defer resp.Body.Close()

	// Read and discard body
	io.Copy(io.Discard, resp.Body)

	s.logger.Debug("InitSession completed",
		zap.Int("status_code", resp.StatusCode),
		zap.Int("cookies_count", len(resp.Cookies())),
	)

	return nil
}

// Login performs login to Fenbi
// It first tries the tiku.fenbi.com endpoint with plain password,
// then falls back to login.fenbi.com with RSA-encrypted password if needed
func (s *FenbiSpider) Login(phone, password string) (*LoginResult, error) {
	// Initialize session first to get initial cookies
	if err := s.InitSession(); err != nil {
		s.logger.Warn("Failed to init session, continuing anyway", zap.Error(err))
	}

	// Use login.fenbi.com with RSA encryption (same as the website)
	return s.loginWithRSA(phone, password)
}

// loginWithTiku attempts login via tiku.fenbi.com with RSA encrypted password
func (s *FenbiSpider) loginWithTiku(phone, password string) (*LoginResult, error) {
	// Encrypt password using hardcoded public key (same as website)
	encryptedPassword, err := s.EncryptPasswordWithHardcodedKey(password)
	if err != nil {
		return &LoginResult{Success: false, Message: "密码加密失败: " + err.Error()}, err
	}

	formData := url.Values{}
	formData.Set("phone", phone)
	formData.Set("password", encryptedPassword)
	formData.Set("persistent", "true")
	formData.Set("app", "web")

	loginURL := FenbiTikuLoginURL + "?app=web&av=100&hav=100&kav=100"

	s.logger.Info("Tiku login request",
		zap.String("url", loginURL),
		zap.String("phone", phone),
		zap.String("encrypted_password", encryptedPassword),
		zap.String("payload", formData.Encode()),
	)

	req, err := http.NewRequest("POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		return &LoginResult{Success: false, Message: "创建请求失败"}, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Origin", "https://tiku.fenbi.com")
	req.Header.Set("Referer", "https://tiku.fenbi.com/")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return &LoginResult{Success: false, Message: "请求失败: " + err.Error()}, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	bodyStr := string(body)

	s.logger.Info("Tiku login response",
		zap.Int("status_code", resp.StatusCode),
		zap.Int("body_length", len(body)),
		zap.String("body_full", bodyStr),
	)

	// Check if response is HTML (error page)
	if strings.Contains(bodyStr, "<html") || strings.Contains(bodyStr, "<!DOCTYPE") {
		return &LoginResult{Success: false, Message: "服务器返回HTML页面，可能需要验证码"}, errors.New("server returned HTML instead of JSON")
	}

	if len(body) == 0 {
		return &LoginResult{Success: false, Message: "服务器返回空响应"}, errors.New("empty response")
	}

	var loginResp struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			UserID int64 `json:"id"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &loginResp); err != nil {
		s.logger.Error("Failed to parse tiku login response",
			zap.Error(err),
			zap.String("body", bodyStr[:min(len(bodyStr), 500)]),
		)
		return &LoginResult{Success: false, Message: "解析响应失败: " + bodyStr[:min(len(bodyStr), 100)]}, err
	}

	if loginResp.Code != 1 {
		msg := loginResp.Message
		if msg == "" {
			msg = "登录失败，错误码: " + strconv.Itoa(loginResp.Code)
		}
		return &LoginResult{Success: false, Message: msg}, errors.New(msg)
	}

	s.logger.Info("Tiku login successful", zap.Int64("user_id", loginResp.Data.UserID))

	// Collect cookies
	cookies := resp.Cookies()
	cookieStr := serializeCookies(cookies)

	// Set cookie expiration (typically 30 days)
	expiresAt := time.Now().Add(30 * 24 * time.Hour)

	s.cookies = cookies
	s.SetCookies(cookieStr)

	return &LoginResult{
		Success:   true,
		Message:   "登录成功",
		Cookies:   cookieStr,
		ExpiresAt: &expiresAt,
		UserID:    strconv.FormatInt(loginResp.Data.UserID, 10),
	}, nil
}

// loginWithRSA attempts login via login.fenbi.com with RSA-encrypted password
func (s *FenbiSpider) loginWithRSA(phone, password string) (*LoginResult, error) {
	// Use hardcoded public key (from fenbi's encrypt.js)
	// This avoids the API call which often fails due to CORS/anti-bot protections
	encryptedPassword, err := s.EncryptPasswordWithHardcodedKey(password)
	if err != nil {
		return &LoginResult{Success: false, Message: "密码加密失败: " + err.Error()}, err
	}

	s.logger.Debug("Encrypted password for login",
		zap.String("encrypted_preview", encryptedPassword[:min(len(encryptedPassword), 50)]+"..."),
	)

	// Prepare form data
	formData := url.Values{}
	formData.Set("phone", phone)
	formData.Set("password", encryptedPassword)
	formData.Set("persistent", "true")
	formData.Set("app", "web")

	// Create request
	loginURL := FenbiLoginURL + "?app=web&av=100&hav=100&kav=100"

	s.logger.Info("RSA login request",
		zap.String("url", loginURL),
		zap.String("phone", phone),
		zap.String("encrypted_password", encryptedPassword),
		zap.String("payload", formData.Encode()),
	)

	req, err := http.NewRequest("POST", loginURL, strings.NewReader(formData.Encode()))
	if err != nil {
		return &LoginResult{Success: false, Message: "创建请求失败"}, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Origin", "https://www.fenbi.com")
	req.Header.Set("Referer", "https://www.fenbi.com/")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return &LoginResult{Success: false, Message: "请求失败: " + err.Error()}, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	bodyStr := string(body)

	// Log Set-Cookie headers
	var setCookies []string
	for _, cookie := range resp.Cookies() {
		setCookies = append(setCookies, cookie.String())
	}

	s.logger.Info("RSA login response",
		zap.Int("status_code", resp.StatusCode),
		zap.Int("body_length", len(body)),
		zap.String("body_full", bodyStr),
		zap.Strings("set_cookies", setCookies),
		zap.String("set_cookie_header", resp.Header.Get("Set-Cookie")),
	)

	// Check if response is HTML (error page)
	if strings.Contains(bodyStr, "<html") || strings.Contains(bodyStr, "<!DOCTYPE") {
		return &LoginResult{Success: false, Message: "服务器返回HTML页面，可能需要验证码"}, errors.New("server returned HTML instead of JSON")
	}

	if len(body) == 0 {
		return &LoginResult{Success: false, Message: "服务器返回空响应"}, errors.New("empty response")
	}

	var loginResp struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			UserID int64 `json:"id"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &loginResp); err != nil {
		s.logger.Error("Failed to parse RSA login response",
			zap.Error(err),
			zap.String("body", bodyStr[:min(len(bodyStr), 500)]),
		)
		return &LoginResult{Success: false, Message: "解析响应失败: " + bodyStr[:min(len(bodyStr), 100)]}, err
	}

	if loginResp.Code != 1 {
		msg := loginResp.Message
		if msg == "" {
			msg = "登录失败，错误码: " + strconv.Itoa(loginResp.Code)
		}
		return &LoginResult{Success: false, Message: msg}, errors.New(msg)
	}

	s.logger.Info("RSA login successful", zap.Int64("user_id", loginResp.Data.UserID))

	// Collect cookies from both response headers and cookie jar
	// First get cookies from response Set-Cookie headers
	respCookies := resp.Cookies()

	// Also get cookies from the jar (for login.fenbi.com and fenbi.com domains)
	loginDomainURL, _ := url.Parse("https://login.fenbi.com")
	fenbiDomainURL, _ := url.Parse("https://www.fenbi.com")

	jarCookiesLogin := s.httpClient.Jar.Cookies(loginDomainURL)
	jarCookiesFenbi := s.httpClient.Jar.Cookies(fenbiDomainURL)

	// Log all cookies for debugging
	s.logger.Info("Cookies collected",
		zap.Int("response_cookies_count", len(respCookies)),
		zap.Int("jar_login_cookies_count", len(jarCookiesLogin)),
		zap.Int("jar_fenbi_cookies_count", len(jarCookiesFenbi)),
		zap.String("response_cookies", serializeCookies(respCookies)),
		zap.String("jar_login_cookies", serializeCookies(jarCookiesLogin)),
		zap.String("jar_fenbi_cookies", serializeCookies(jarCookiesFenbi)),
	)

	// Merge all cookies (prefer jar cookies as they are most complete)
	cookieMap := make(map[string]*http.Cookie)
	for _, c := range respCookies {
		cookieMap[c.Name] = c
	}
	for _, c := range jarCookiesLogin {
		cookieMap[c.Name] = c
	}
	for _, c := range jarCookiesFenbi {
		cookieMap[c.Name] = c
	}

	var allCookies []*http.Cookie
	for _, c := range cookieMap {
		allCookies = append(allCookies, c)
	}

	cookieStr := serializeCookies(allCookies)

	s.logger.Info("Final merged cookies",
		zap.Int("total_cookies_count", len(allCookies)),
		zap.String("cookies_string", cookieStr),
	)

	// Set cookie expiration (typically 30 days)
	expiresAt := time.Now().Add(30 * 24 * time.Hour)

	s.cookies = allCookies
	s.SetCookies(cookieStr)

	return &LoginResult{
		Success:   true,
		Message:   "登录成功",
		Cookies:   cookieStr,
		ExpiresAt: &expiresAt,
		UserID:    strconv.FormatInt(loginResp.Data.UserID, 10),
	}, nil
}

// CheckLoginStatus checks if the current session is still valid
// Since the old /api/users/session endpoint no longer exists (returns 404),
// we now validate by checking if we have valid cookie values and optionally
// testing with the actual business API
func (s *FenbiSpider) CheckLoginStatus() (bool, error) {
	// Log current cookies before checking
	s.logger.Info("CheckLoginStatus - current cookies",
		zap.String("cookies", serializeCookies(s.cookies)),
	)

	// Check if we have the essential cookies
	hasUserID := false
	hasSess := false
	for _, cookie := range s.cookies {
		switch cookie.Name {
		case "userid":
			if cookie.Value != "" && cookie.Value != "0" {
				hasUserID = true
			}
		case "sess":
			if cookie.Value != "" {
				hasSess = true
			}
		}
	}

	if hasUserID && hasSess {
		s.logger.Info("CheckLoginStatus: found valid userid and sess cookies")
		return true, nil
	}

	s.logger.Warn("CheckLoginStatus: missing essential cookies",
		zap.Bool("has_userid", hasUserID),
		zap.Bool("has_sess", hasSess),
	)
	return false, nil
}

// CheckLoginStatusWithDetails returns detailed login check results for debugging
func (s *FenbiSpider) CheckLoginStatusWithDetails() map[string]interface{} {
	result := map[string]interface{}{
		"cookies_count": len(s.cookies),
		"cookies":       map[string]string{},
	}

	// Extract cookie values for debugging
	cookieMap := result["cookies"].(map[string]string)
	hasUserID := false
	hasSess := false
	
	for _, cookie := range s.cookies {
		// Show preview of cookie value
		value := cookie.Value
		if len(value) > 20 {
			value = value[:20] + "..."
		}
		cookieMap[cookie.Name] = value
		
		switch cookie.Name {
		case "userid":
			if cookie.Value != "" && cookie.Value != "0" {
				hasUserID = true
			}
		case "sess":
			if cookie.Value != "" {
				hasSess = true
			}
		}
	}

	result["has_userid"] = hasUserID
	result["has_sess"] = hasSess
	result["any_valid"] = hasUserID && hasSess
	
	// Also try to make a test API call to verify cookies actually work
	testResult := s.testAPICall()
	result["api_test"] = testResult

	return result
}

// testAPICall makes a test API call to verify cookies work
func (s *FenbiSpider) testAPICall() map[string]interface{} {
	result := map[string]interface{}{}
	
	// Try the exam list API with minimal params
	apiReq := FenbiExamAPIRequest{
		Year:      fmt.Sprintf("%d", time.Now().Year()),
		Start:     0,
		Len:       1,
		NeedTotal: true,
	}

	reqBody, err := json.Marshal(apiReq)
	if err != nil {
		result["error"] = "marshal error: " + err.Error()
		return result
	}

	targetURL := FenbiExamAPIURL + "?app=web&av=100&hav=100&kav=100"
	req, err := http.NewRequest("POST", targetURL, strings.NewReader(string(reqBody)))
	if err != nil {
		result["error"] = "request error: " + err.Error()
		return result
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Referer", "https://www.fenbi.com/")
	req.Header.Set("Origin", "https://www.fenbi.com")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		result["error"] = "http error: " + err.Error()
		return result
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	result["status_code"] = resp.StatusCode
	
	// Try to parse the response
	var apiResp FenbiExamAPIResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		result["parse_error"] = err.Error()
		result["response"] = string(body)
	} else {
		result["api_code"] = apiResp.Code
		result["api_msg"] = apiResp.Msg
		result["total_found"] = apiResp.Data.Total
		result["articles_count"] = len(apiResp.Data.Articles)
		result["success"] = apiResp.Code == 1
	}

	return result
}

// CrawlAnnouncementList crawls the announcement list page
func (s *FenbiSpider) CrawlAnnouncementList(regionCode, examTypeCode string, year, page int) (*FenbiCrawlResult, error) {
	// Use the new Fenbi API instead of scraping HTML
	// API: POST https://market-api.fenbi.com/toolkit/api/v1/pc/exam/queryByCondition

	pageSize := 15
	start := (page - 1) * pageSize

	// Build API request
	apiReq := FenbiExamAPIRequest{
		Year:      fmt.Sprintf("%d", year),
		Start:     start,
		Len:       pageSize,
		NeedTotal: true,
	}

	// Set district ID if region specified
	if regionCode != "" && regionCode != "all" {
		regionID := GetRegionID(regionCode)
		if regionID != "" {
			apiReq.DistrictID = regionID
		}
	}

	// Set exam type ID
	if examTypeCode != "" && examTypeCode != "all" {
		examTypeID := GetExamTypeID(examTypeCode)
		if examTypeID != "" {
			apiReq.ExamType = examTypeID
		}
	}

	s.logger.Info("Crawling Fenbi API",
		zap.String("region_code", regionCode),
		zap.String("district_id", apiReq.DistrictID),
		zap.String("exam_type_code", examTypeCode),
		zap.String("exam_type_id", apiReq.ExamType),
		zap.Int("year", year),
		zap.Int("page", page),
		zap.Int("start", start),
	)

	// Encode request body
	reqBody, err := json.Marshal(apiReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	targetURL := FenbiExamAPIURL + "?app=web&av=100&hav=100&kav=100"
	req, err := http.NewRequest("POST", targetURL, strings.NewReader(string(reqBody)))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Referer", "https://www.fenbi.com/")
	req.Header.Set("Origin", "https://www.fenbi.com")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read response body
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	s.logger.Debug("Fenbi API response",
		zap.Int("status_code", resp.StatusCode),
		zap.Int("body_length", len(bodyBytes)),
	)

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Parse API response
	var apiResp FenbiExamAPIResponse
	if err := json.Unmarshal(bodyBytes, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to parse API response: %w", err)
	}

	if apiResp.Code != 1 {
		return nil, fmt.Errorf("API error: code=%d, msg=%s", apiResp.Code, apiResp.Msg)
	}

	// Convert API response to FenbiCrawlResult
	// 注意：TotalFound 应该是当前页的项目数，而不是所有页面的总数
	result := &FenbiCrawlResult{
		Items:       []FenbiListItem{},
		CurrentPage: page,
		TotalFound:  0, // 将在处理完 items 后设置为 len(result.Items)
	}

	// Process articles
	allArticles := append(apiResp.Data.StickTopArticles, apiResp.Data.Articles...)
	for _, article := range allArticles {
		item := FenbiListItem{
			FenbiID:      fmt.Sprintf("%d", article.ID),
			Title:        article.Title,
			FenbiURL:     fmt.Sprintf("https://www.fenbi.com/page/exam-information-detail/%d", article.ID),
			RegionCode:   regionCode,
			ExamTypeCode: examTypeCode,
			Year:         year,
		}

		// Extract region and exam type names from tags
		for _, tag := range article.TagsList {
			switch tag.Type {
			case 1: // Region
				item.RegionName = tag.Name
				// Convert region tag ID to region code
				tagIDStr := fmt.Sprintf("%d", tag.ID)
				item.RegionCode = GetRegionCodeByID(tagIDStr)
			case 2: // Exam type
				item.ExamTypeName = tag.Name
				// Convert exam type name to code
				item.ExamTypeCode = GetExamTypeCodeByID(tag.Name)
			case 3: // Year
				if y, err := strconv.Atoi(tag.Name); err == nil {
					item.Year = y
				}
			}
		}

		// Convert issue time to date string
		if article.IssueTime > 0 {
			t := time.UnixMilli(article.IssueTime)
			item.PublishDate = t.Format("2006-01-02")
		}

		result.Items = append(result.Items, item)
	}

	// 设置 TotalFound 为当前页的项目数
	result.TotalFound = len(result.Items)

	// Calculate if there are more pages
	totalPages := (apiResp.Data.Total + pageSize - 1) / pageSize
	result.HasNextPage = page < totalPages

	s.logger.Info("Crawled Fenbi API",
		zap.String("region", regionCode),
		zap.String("examType", examTypeCode),
		zap.Int("year", year),
		zap.Int("page", page),
		zap.Int("total", apiResp.Data.Total),
		zap.Int("items_found", len(result.Items)),
		zap.Bool("has_next", result.HasNextPage),
	)

	return result, nil
}

// CrawlAnnouncementDetail crawls the announcement detail page to get the original URL
func (s *FenbiSpider) CrawlAnnouncementDetail(fenbiID string) (*FenbiDetailInfo, error) {
	detail, _, err := s.CrawlAnnouncementDetailWithHTML(fenbiID)
	return detail, err
}

// CrawlAnnouncementDetailWithHTML crawls the announcement detail page and returns both parsed info and raw HTML
func (s *FenbiSpider) CrawlAnnouncementDetailWithHTML(fenbiID string) (*FenbiDetailInfo, string, error) {
	targetURL := fmt.Sprintf("%s/%s", FenbiDetailURL, fenbiID)

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return nil, "", err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Referer", FenbiListURL)
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")

	// Log cookies being sent
	s.logger.Info("CrawlAnnouncementDetail request",
		zap.String("url", targetURL),
		zap.String("cookies", serializeCookies(s.cookies)),
	)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	// Read the entire body
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read body: %w", err)
	}
	rawHTML := string(bodyBytes)

	s.logger.Info("CrawlAnnouncementDetail response",
		zap.Int("status_code", resp.StatusCode),
		zap.Int("body_length", len(rawHTML)),
	)

	if resp.StatusCode != http.StatusOK {
		return nil, rawHTML, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(rawHTML))
	if err != nil {
		return nil, rawHTML, err
	}

	detail := &FenbiDetailInfo{
		FenbiID: fenbiID,
	}

	// Extract title
	detail.Title = strings.TrimSpace(doc.Find("h1, .detail-title, .title").First().Text())

	// Use rawHTML directly for regex matching (goquery may modify HTML)
	// Pattern 1: Look for t.fenbi.com short URL (most common format)
	// Format: https://t.fenbi.com/s/xxxxx (appears as plain text after "原文网址在这里")
	if detail.OriginalURL == "" {
		// Match t.fenbi.com short URLs
		tFenbiPattern := regexp.MustCompile(`https?://t\.fenbi\.com/s/[a-zA-Z0-9]+`)
		if matches := tFenbiPattern.FindString(rawHTML); matches != "" {
			detail.OriginalURL = matches
			s.logger.Info("Found t.fenbi.com short URL", zap.String("url", matches))
		}
	}

	// Pattern 2: Look for URL in text after "原文网址" marker
	if detail.OriginalURL == "" {
		// The URL appears in a <p> tag after the "原文网址" section
		patterns := []string{
			`原文网址[^<]*</[^>]+>[^<]*<[^>]+>[^<]*<[^>]+>[^<]*<p[^>]*>(https?://[^<]+)</p>`,
			`原文网址.*?<p[^>]*>(https?://[^<]+)</p>`,
		}
		for _, pattern := range patterns {
			re := regexp.MustCompile(pattern)
			if matches := re.FindStringSubmatch(rawHTML); len(matches) > 1 {
				url := strings.TrimSpace(matches[1])
				// Skip fenbi.com main site URLs, we want external or short URLs
				if isValidExternalURL(url) && !strings.Contains(url, "www.fenbi.com") && !strings.Contains(url, "nodestatic.fbstatic") {
					detail.OriginalURL = url
					s.logger.Info("Found URL via pattern", zap.String("pattern", pattern), zap.String("url", url))
					break
				}
			}
		}
	}

	// Pattern 3: Link with text containing "原文" or "来源"
	if detail.OriginalURL == "" {
		doc.Find("a").Each(func(i int, sel *goquery.Selection) {
			text := sel.Text()
			if href, exists := sel.Attr("href"); exists {
				if strings.Contains(text, "原文") || strings.Contains(text, "来源") || strings.Contains(text, "查看原文") {
					if isValidExternalURL(href) {
						detail.OriginalURL = href
					}
				}
			}
		})
	}

	// Pattern 4: Text containing "原文网址" followed by a URL in <a> tag
	if detail.OriginalURL == "" {
		patterns := []string{
			`原文网址[：:]\s*<a[^>]*href=["']([^"']+)["']`,
			`原文链接[：:]\s*<a[^>]*href=["']([^"']+)["']`,
			`来源[：:]\s*<a[^>]*href=["']([^"']+)["']`,
			`原文地址[：:]\s*<a[^>]*href=["']([^"']+)["']`,
		}
		for _, pattern := range patterns {
			re := regexp.MustCompile(pattern)
			if matches := re.FindStringSubmatch(rawHTML); len(matches) > 1 {
				if isValidExternalURL(matches[1]) {
					detail.OriginalURL = matches[1]
					break
				}
			}
		}
	}

	// Pattern 5: Look for external links in the content area
	if detail.OriginalURL == "" {
		doc.Find(".content a, .detail-content a, .article-content a").Each(func(i int, sel *goquery.Selection) {
			if href, exists := sel.Attr("href"); exists {
				if isValidExternalURL(href) && !strings.Contains(href, "fenbi.com") {
					detail.OriginalURL = href
				}
			}
		})
	}

	s.logger.Info("Crawled Fenbi detail page",
		zap.String("fenbi_id", fenbiID),
		zap.String("title", detail.Title),
		zap.String("original_url", detail.OriginalURL),
	)

	return detail, rawHTML, nil
}

// GetCookiesString returns the current cookies as a string
func (s *FenbiSpider) GetCookiesString() string {
	return serializeCookies(s.cookies)
}

// ResolveShortURL resolves a short URL (t.fenbi.com/s/xxxxx) to its final destination URL
// by following redirects with cookies
func (s *FenbiSpider) ResolveShortURL(shortURL string) (string, error) {
	if shortURL == "" {
		return "", nil
	}

	// Create a client that follows redirects and records the final URL
	// We need a separate client that follows redirects (unlike s.httpClient which doesn't)
	client := &http.Client{
		Timeout: 30 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// Allow up to 10 redirects
			if len(via) >= 10 {
				return errors.New("too many redirects")
			}
			return nil
		},
	}

	req, err := http.NewRequest("GET", shortURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")

	// Set cookies
	if len(s.cookies) > 0 {
		var cookieStrs []string
		for _, c := range s.cookies {
			cookieStrs = append(cookieStrs, fmt.Sprintf("%s=%s", c.Name, c.Value))
		}
		req.Header.Set("Cookie", strings.Join(cookieStrs, "; "))
	}

	s.logger.Debug("Resolving short URL",
		zap.String("short_url", shortURL),
	)

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to resolve short URL: %w", err)
	}
	defer resp.Body.Close()

	// The final URL after all redirects
	finalURL := resp.Request.URL.String()

	s.logger.Info("Resolved short URL",
		zap.String("short_url", shortURL),
		zap.String("final_url", finalURL),
		zap.Int("status_code", resp.StatusCode),
	)

	// If we ended up at the same URL (no redirect), or at an error page, return empty
	if finalURL == shortURL {
		s.logger.Warn("Short URL did not redirect", zap.String("url", shortURL))
		return "", nil
	}

	return finalURL, nil
}

// IsShortURL checks if the URL is a Fenbi short URL (t.fenbi.com)
func IsShortURL(urlStr string) bool {
	return strings.Contains(urlStr, "t.fenbi.com/s/")
}

// IsFenbiDetailURL checks if the URL is a Fenbi announcement detail page URL
// e.g., https://www.fenbi.com/page/exam-information-detail/463xxx
func IsFenbiDetailURL(urlStr string) bool {
	return strings.Contains(urlStr, "fenbi.com/page/exam-information-detail/")
}

// ExtractFenbiIDFromURL extracts the Fenbi announcement ID from a detail page URL
// e.g., from "https://www.fenbi.com/page/exam-information-detail/463811898787840" returns "463811898787840"
func ExtractFenbiIDFromURL(urlStr string) string {
	// Pattern: .../exam-information-detail/XXXXXX
	parts := strings.Split(urlStr, "/exam-information-detail/")
	if len(parts) < 2 {
		return ""
	}
	// Get the ID part (may have query params or trailing slash)
	idPart := parts[1]
	// Remove query params
	if idx := strings.Index(idPart, "?"); idx != -1 {
		idPart = idPart[:idx]
	}
	// Remove trailing slash
	idPart = strings.TrimSuffix(idPart, "/")
	return idPart
}

// PageContent represents the content fetched from a page
type PageContent struct {
	URL         string            `json:"url"`
	Title       string            `json:"title"`
	HTML        string            `json:"html"`
	Text        string            `json:"text"`
	Attachments []PageAttachment  `json:"attachments"`
}

// PageAttachment represents an attachment found on a page
type PageAttachment struct {
	URL       string `json:"url"`
	Name      string `json:"name"`
	Type      string `json:"type"` // pdf, excel, word
	LocalPath string `json:"local_path,omitempty"`
}

// FetchPageContent fetches and parses content from a URL
func (s *FenbiSpider) FetchPageContent(targetURL string) (*PageContent, error) {
	if targetURL == "" {
		return nil, errors.New("target URL is empty")
	}

	s.logger.Info("Fetching page content", zap.String("url", targetURL))

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers to mimic browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
	req.Header.Set("Accept-Encoding", "gzip, deflate")

	// Use a client that follows redirects
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch page: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Handle gzip encoding
	var reader io.Reader = resp.Body
	if resp.Header.Get("Content-Encoding") == "gzip" {
		gzReader, err := gzip.NewReader(resp.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to create gzip reader: %w", err)
		}
		defer gzReader.Close()
		reader = gzReader
	}

	// Read body
	bodyBytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Detect and convert encoding (handle GBK/GB2312 common on Chinese government sites)
	htmlContent, detectedCharset := s.decodeHTML(bodyBytes, resp.Header.Get("Content-Type"))

	s.logger.Debug("Detected charset",
		zap.String("url", targetURL),
		zap.String("charset", detectedCharset),
	)

	// Parse HTML using goquery
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlContent))
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}

	content := &PageContent{
		URL:  targetURL,
		HTML: htmlContent,
	}

	// Extract title
	content.Title = strings.TrimSpace(doc.Find("title").First().Text())
	if content.Title == "" {
		content.Title = strings.TrimSpace(doc.Find("h1").First().Text())
	}

	// Extract main text content
	// Remove script and style elements
	doc.Find("script, style, nav, header, footer, aside").Remove()
	
	// Try to find main content area - common selectors for Chinese gov sites
	mainContent := doc.Find("article, .article, .content, .main-content, #content, #main, .detail-content, .article-content, .TRS_Editor, .zwgk_cont, .news_cont, .art_content").First()
	if mainContent.Length() == 0 {
		mainContent = doc.Find("body")
	}
	
	content.Text = strings.TrimSpace(mainContent.Text())
	// Clean up excessive whitespace but preserve some structure
	content.Text = regexp.MustCompile(`[ \t]+`).ReplaceAllString(content.Text, " ")
	content.Text = regexp.MustCompile(`\n\s*\n`).ReplaceAllString(content.Text, "\n")

	// Extract attachments
	content.Attachments = s.extractPageAttachments(doc, targetURL)

	s.logger.Info("Fetched page content",
		zap.String("url", targetURL),
		zap.String("title", content.Title),
		zap.Int("text_length", len(content.Text)),
		zap.Int("attachments_count", len(content.Attachments)),
		zap.String("charset", detectedCharset),
	)

	return content, nil
}

// decodeHTML detects and converts HTML encoding to UTF-8
func (s *FenbiSpider) decodeHTML(body []byte, contentType string) (string, string) {
	// First try to detect from Content-Type header
	detectedCharset := "utf-8"
	
	// Try to detect charset from HTML meta tags or Content-Type
	reader := bufio.NewReader(strings.NewReader(string(body)))
	encoding, name, certain := charset.DetermineEncoding(body, contentType)
	
	if certain || name != "" {
		detectedCharset = name
		if encoding != nil {
			decoded, err := io.ReadAll(transform.NewReader(reader, encoding.NewDecoder()))
			if err == nil {
				return string(decoded), detectedCharset
			}
		}
	}

	// Check for common Chinese encodings in meta tag
	htmlStr := string(body)
	lowerHTML := strings.ToLower(htmlStr)
	
	// Check meta charset
	if strings.Contains(lowerHTML, "charset=gb2312") || 
	   strings.Contains(lowerHTML, "charset=gbk") ||
	   strings.Contains(lowerHTML, "charset=\"gb2312\"") ||
	   strings.Contains(lowerHTML, "charset=\"gbk\"") {
		// Convert from GBK to UTF-8
		decoded, err := io.ReadAll(transform.NewReader(
			strings.NewReader(string(body)),
			simplifiedchinese.GBK.NewDecoder(),
		))
		if err == nil {
			if strings.Contains(lowerHTML, "gb2312") {
				detectedCharset = "gb2312"
			} else {
				detectedCharset = "gbk"
			}
			return string(decoded), detectedCharset
		}
	}

	// Default to UTF-8
	return htmlStr, detectedCharset
}

// extractPageAttachments extracts file attachments from the page
func (s *FenbiSpider) extractPageAttachments(doc *goquery.Document, baseURL string) []PageAttachment {
	attachments := make([]PageAttachment, 0)

	// Find links to common attachment types
	extensions := map[string]string{
		".pdf":  "pdf",
		".xls":  "excel",
		".xlsx": "excel",
		".doc":  "word",
		".docx": "word",
	}

	doc.Find("a[href]").Each(func(_ int, selection *goquery.Selection) {
		href, exists := selection.Attr("href")
		if !exists || href == "" {
			return
		}

		hrefLower := strings.ToLower(href)
		for ext, fileType := range extensions {
			if strings.Contains(hrefLower, ext) {
				// Resolve relative URL
				fullURL := href
				if !strings.HasPrefix(href, "http://") && !strings.HasPrefix(href, "https://") {
					// Parse base URL
					baseURLParsed, err := url.Parse(baseURL)
					if err != nil {
						continue
					}
					refURL, err := url.Parse(href)
					if err != nil {
						continue
					}
					fullURL = baseURLParsed.ResolveReference(refURL).String()
				}

				name := strings.TrimSpace(selection.Text())
				if name == "" {
					// Extract from URL
					parts := strings.Split(href, "/")
					name = parts[len(parts)-1]
					// URL decode the name
					if decoded, err := url.QueryUnescape(name); err == nil {
						name = decoded
					}
				}

				attachments = append(attachments, PageAttachment{
					URL:  fullURL,
					Name: name,
					Type: fileType,
				})
				break
			}
		}
	})

	return attachments
}

// DownloadFile downloads a file from URL to the specified path
func (s *FenbiSpider) DownloadFile(fileURL, savePath string) error {
	if fileURL == "" {
		return errors.New("file URL is empty")
	}

	s.logger.Info("Downloading file",
		zap.String("url", fileURL),
		zap.String("save_path", savePath),
	)

	req, err := http.NewRequest("GET", fileURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "*/*")

	client := &http.Client{
		Timeout: 120 * time.Second, // Longer timeout for file downloads
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to download file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status code: %d", resp.StatusCode)
	}

	// Create the directory if it doesn't exist
	dir := filepath.Dir(savePath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create directory: %w", err)
		}
	}

	// Create the file
	out, err := os.Create(savePath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer out.Close()

	// Write the body to file
	written, err := io.Copy(out, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	s.logger.Info("Downloaded file successfully",
		zap.String("url", fileURL),
		zap.String("save_path", savePath),
		zap.Int64("bytes", written),
	)

	return nil
}

// Helper functions

func parseCookieString(cookieStr string) []*http.Cookie {
	var cookies []*http.Cookie
	parts := strings.Split(cookieStr, ";")
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		kv := strings.SplitN(part, "=", 2)
		if len(kv) == 2 {
			cookies = append(cookies, &http.Cookie{
				Name:  strings.TrimSpace(kv[0]),
				Value: strings.TrimSpace(kv[1]),
			})
		}
	}
	return cookies
}

func serializeCookies(cookies []*http.Cookie) string {
	var parts []string
	for _, cookie := range cookies {
		parts = append(parts, fmt.Sprintf("%s=%s", cookie.Name, cookie.Value))
	}
	return strings.Join(parts, "; ")
}

func isValidExternalURL(href string) bool {
	if href == "" || href == "#" {
		return false
	}
	// Check if it's an absolute URL
	if strings.HasPrefix(href, "http://") || strings.HasPrefix(href, "https://") {
		return true
	}
	return false
}

// FenbiRegionMapping maps region codes to Chinese names
var FenbiRegionMapping = map[string]string{
	"all":          "全部",
	"national":     "国家级机构",
	"anhui":        "安徽",
	"beijing":      "北京",
	"chongqing":    "重庆",
	"fujian":       "福建",
	"guangdong":    "广东",
	"gansu":        "甘肃",
	"guangxi":      "广西",
	"guizhou":      "贵州",
	"hebei":        "河北",
	"hubei":        "湖北",
	"heilongjiang": "黑龙江",
	"henan":        "河南",
	"hainan":       "海南",
	"hunan":        "湖南",
	"jilin":        "吉林",
	"jiangsu":      "江苏",
	"jiangxi":      "江西",
	"liaoning":     "辽宁",
	"neimenggu":    "内蒙古",
	"ningxia":      "宁夏",
	"qinghai":      "青海",
	"sichuan":      "四川",
	"shandong":     "山东",
	"shanghai":     "上海",
	"shanxi":       "山西",
	"shaanxi":      "陕西",
	"tianjin":      "天津",
	"xinjiang":     "新疆",
	"xizang":       "西藏",
	"yunnan":       "云南",
	"zhejiang":     "浙江",
}

// FenbiRegionIDMapping maps region codes to Fenbi's numeric IDs used in URL params
// These IDs are obtained from Fenbi website's actual URL parameters (2026-01-25)
// IMPORTANT: The canonical source of this mapping is in the database (what_fenbi_categories.fenbi_param_id)
// This hardcoded mapping is a fallback only. Please update the database for production use.
var FenbiRegionIDMapping = map[string]string{
	"all":          "",     // Empty for all regions (returns all data)
	"national":     "4012", // 国家级机构
	"anhui":        "1",    // 安徽
	"beijing":      "159",  // 北京
	"chongqing":    "180",  // 重庆
	"fujian":       "223",  // 福建
	"guangdong":    "336",  // 广东
	"gansu":        "557",  // 甘肃
	"guangxi":      "683",  // 广西
	"guizhou":      "836",  // 贵州
	"hebei":        "947",  // 河北
	"hubei":        "1157", // 湖北
	"heilongjiang": "1307", // 黑龙江
	"henan":        "1480", // 河南
	"hainan":       "1694", // 海南
	"hunan":        "1723", // 湖南
	"jilin":        "1887", // 吉林
	"jiangsu":      "1978", // 江苏
	"jiangxi":      "2130", // 江西
	"liaoning":     "2267", // 辽宁
	"neimenggu":    "2416", // 内蒙古
	"ningxia":      "2551", // 宁夏
	"qinghai":      "2589", // 青海
	"sichuan":      "2650", // 四川
	"shandong":     "2894", // 山东
	"shanghai":     "3091", // 上海
	"shanxi":       "3114", // 山西
	"shaanxi":      "3268", // 陕西
	"tianjin":      "3406", // 天津
	"xinjiang":     "3428", // 新疆
	"xizang":       "3559", // 西藏
	"yunnan":       "3648", // 云南
	"zhejiang":     "3818", // 浙江
}

// FenbiRegionCodeMapping is the reverse mapping from numeric IDs to region codes
var FenbiRegionCodeMapping = map[string]string{
	"4012": "national",     // 国家级机构
	"1":    "anhui",        // 安徽
	"159":  "beijing",      // 北京
	"180":  "chongqing",    // 重庆
	"223":  "fujian",       // 福建
	"336":  "guangdong",    // 广东
	"557":  "gansu",        // 甘肃
	"683":  "guangxi",      // 广西
	"836":  "guizhou",      // 贵州
	"947":  "hebei",        // 河北
	"1157": "hubei",        // 湖北
	"1307": "heilongjiang", // 黑龙江
	"1480": "henan",        // 河南
	"1694": "hainan",       // 海南
	"1723": "hunan",        // 湖南
	"1887": "jilin",        // 吉林
	"1978": "jiangsu",      // 江苏
	"2130": "jiangxi",      // 江西
	"2267": "liaoning",     // 辽宁
	"2416": "neimenggu",    // 内蒙古
	"2551": "ningxia",      // 宁夏
	"2589": "qinghai",      // 青海
	"2650": "sichuan",      // 四川
	"2894": "shandong",     // 山东
	"3091": "shanghai",     // 上海
	"3114": "shanxi",       // 山西
	"3268": "shaanxi",      // 陕西
	"3406": "tianjin",      // 天津
	"3428": "xinjiang",     // 新疆
	"3559": "xizang",       // 西藏
	"3648": "yunnan",       // 云南
	"3818": "zhejiang",     // 浙江
}

// GetRegionID converts region code to Fenbi's numeric ID for URL params
func GetRegionID(code string) string {
	// If empty or "all", return empty (no region filter)
	if code == "" || code == "all" {
		return ""
	}

	// Check if it's a known region code
	if id, ok := FenbiRegionIDMapping[code]; ok {
		return id
	}

	// If code is already numeric (user passed an ID directly), return as-is
	if _, err := strconv.Atoi(code); err == nil {
		return code
	}

	// Unknown region code, return empty to fetch all data
	return ""
}

// GetRegionCodeByID converts Fenbi's numeric ID back to region code
func GetRegionCodeByID(id string) string {
	if code, ok := FenbiRegionCodeMapping[id]; ok {
		return code
	}
	// Return the ID itself if no mapping found
	return id
}

// FenbiExamTypeMapping maps exam type codes to Chinese names
var FenbiExamTypeMapping = map[string]string{
	"shengkao":          "省考",
	"guokao":            "国考",
	"junduiwenzhi":      "军队文职",
	"xuandiao":          "选调",
	"shiyedanwei":       "事业单位",
	"daxueshengcunguan": "大学生村官",
	"sanzhiyifu":        "三支一扶",
	"lianxuan":          "遴选",
	"zhaojing":          "招警",
	"guoqi":             "国企",
	"jiaoshi":           "教师",
	"yiliao":            "医疗",
	"yinhang":           "银行",
	"qita":              "其他",
	"nongxinshe":        "农信社",
	"paiqian":           "派遣/临时/购买服务等",
	"liankao":           "联考/统考",
	"shequ":             "社区工作者",
	"gaoxiao":           "高校",
	"gongwuyuandanzhao": "公务员单招",
}

// FenbiExamTypeIDMapping maps exam type codes to Fenbi's numeric IDs used in URL params
// These IDs are obtained from Fenbi website's actual URL parameters (2026-01-25)
// IMPORTANT: The canonical source of this mapping is in the database (what_fenbi_categories.fenbi_param_id)
// This hardcoded mapping is a fallback only.
var FenbiExamTypeIDMapping = map[string]string{
	"shengkao":          "1",
	"guokao":            "2",
	"junduiwenzhi":      "3",
	"xuandiao":          "4",
	"shiyedanwei":       "5",
	"daxueshengcunguan": "6",
	"sanzhiyifu":        "7",
	"lianxuan":          "8",
	"zhaojing":          "9",
	"guoqi":             "10",
	"jiaoshi":           "11",
	"yiliao":            "12",
	"yinhang":           "13",
	"qita":              "14",
	"nongxinshe":        "15",
	"paiqian":           "16",
	"liankao":           "17",
	"shequ":             "18",
	"gaoxiao":           "19",
	"gongwuyuandanzhao": "20",
}

// FenbiExamTypeCodeMapping maps exam type Chinese names to codes
var FenbiExamTypeCodeMapping = map[string]string{
	"省考":          "shengkao",
	"国考":          "guokao",
	"军队文职":        "junduiwenzhi",
	"选调":          "xuandiao",
	"事业单位":        "shiyedanwei",
	"大学生村官":       "daxueshengcunguan",
	"三支一扶":        "sanzhiyifu",
	"遴选":          "lianxuan",
	"招警":          "zhaojing",
	"国企":          "guoqi",
	"教师":          "jiaoshi",
	"医疗":          "yiliao",
	"银行":          "yinhang",
	"其他":          "qita",
	"农信社":         "nongxinshe",
	"派遣/临时/购买服务等": "paiqian",
	"联考/统考":       "liankao",
	"社区工作者":       "shequ",
	"高校":          "gaoxiao",
	"公务员单招":       "gongwuyuandanzhao",
}

// GetExamTypeCodeByID converts exam type ID or name to code
func GetExamTypeCodeByID(idOrName string) string {
	// First try to find by Chinese name (more reliable for API responses)
	if code, ok := FenbiExamTypeCodeMapping[idOrName]; ok {
		return code
	}
	// Return the original value if no mapping found
	return idOrName
}

// GetExamTypeID converts exam type code to Fenbi's numeric ID for URL parameters
func GetExamTypeID(examTypeCode string) string {
	if examTypeCode == "" || examTypeCode == "all" {
		return ""
	}

	// Check if already a numeric ID
	if _, err := strconv.Atoi(examTypeCode); err == nil {
		return examTypeCode
	}

	// Convert from code to numeric ID using hardcoded mapping (fallback)
	if id, ok := FenbiExamTypeIDMapping[examTypeCode]; ok {
		return id
	}

	// Unknown exam type code, return empty to fetch all data
	return ""
}

// GetRegionName returns the Chinese name for a region code
func GetRegionName(code string) string {
	if name, ok := FenbiRegionMapping[code]; ok {
		return name
	}
	return code
}

// GetExamTypeName returns the Chinese name for an exam type code
func GetExamTypeName(code string) string {
	if name, ok := FenbiExamTypeMapping[code]; ok {
		return name
	}
	return code
}
