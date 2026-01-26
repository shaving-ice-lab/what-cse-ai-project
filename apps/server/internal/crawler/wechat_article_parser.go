package crawler

import (
	"context"
	"fmt"
	"html"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
	"github.com/dop251/goja"
	"go.uber.org/zap"
)

// WechatArticleParser handles WeChat article URL parsing
type WechatArticleParser struct {
	client  *http.Client
	Logger  *zap.Logger
	timeout time.Duration
}

// NewWechatArticleParser creates a new WeChat article parser
func NewWechatArticleParser(logger *zap.Logger) *WechatArticleParser {
	return &WechatArticleParser{
		client: &http.Client{
			Timeout: 30 * time.Second,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= 10 {
					return fmt.Errorf("stopped after 10 redirects")
				}
				return nil
			},
		},
		Logger:  logger,
		timeout: 30 * time.Second,
	}
}

// WechatArticleInfo represents parsed WeChat article information
type WechatArticleInfo struct {
	Biz              string `json:"biz"`               // __biz parameter (base64 encoded)
	Title            string `json:"title"`             // Article title
	Author           string `json:"author"`            // Public account name
	ArticleURL       string `json:"article_url"`       // Original article URL
	ExtractionMethod string `json:"extraction_method"` // How the biz was extracted
}

// ParseWechatArticleURL parses a WeChat article URL and extracts __biz from URL params
func ParseWechatArticleURL(articleURL string) (*WechatArticleInfo, error) {
	// Validate URL format
	if !strings.Contains(articleURL, "mp.weixin.qq.com") {
		return nil, fmt.Errorf("not a valid WeChat article URL")
	}

	// Parse URL
	parsedURL, err := url.Parse(articleURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse URL: %w", err)
	}

	// Extract __biz parameter from URL
	biz := parsedURL.Query().Get("__biz")
	if biz == "" {
		return nil, fmt.Errorf("__biz not found in URL")
	}

	info := &WechatArticleInfo{
		Biz:        biz,
		ArticleURL: articleURL,
	}

	return info, nil
}

// FetchWechatArticleInfo fetches article page and extracts public account info
// This handles both full URLs (with __biz) and short URLs (/s/xxx)
// Extraction strategy: HTTP+Regex → Goja JS Engine → Headless Browser
func (p *WechatArticleParser) FetchWechatArticleInfo(ctx context.Context, articleURL string) (*WechatArticleInfo, error) {
	// Validate URL format
	if !strings.Contains(articleURL, "mp.weixin.qq.com") {
		return nil, fmt.Errorf("not a valid WeChat article URL")
	}

	p.Logger.Info("=== 开始解析微信文章 ===", zap.String("url", articleURL))

	// Step 1: Try simple HTTP fetch + regex extraction
	p.Logger.Info("[第1步] 尝试 HTTP + 正则提取...")
	info, htmlContent, err := p.fetchWechatArticleInfoSimple(ctx, articleURL)
	if err == nil && info.Biz != "" {
		info.ExtractionMethod = "HTTP+正则"
		p.Logger.Info("✓ HTTP + 正则提取成功",
			zap.String("biz", info.Biz),
			zap.String("author", info.Author),
			zap.String("title", info.Title),
		)
		return info, nil
	}

	p.Logger.Info("✗ HTTP + 正则提取失败", zap.Error(err))

	// Step 2: Try Goja JS engine (lightweight, no browser needed)
	if htmlContent != "" {
		p.Logger.Info("[第2步] 尝试 Goja JS 引擎解析...")
		info, err = p.extractWechatInfoWithGoja(articleURL, htmlContent)
		if err == nil && info.Biz != "" {
			info.ExtractionMethod = "Goja JS引擎"
			p.Logger.Info("✓ Goja JS 引擎解析成功",
				zap.String("biz", info.Biz),
				zap.String("author", info.Author),
				zap.String("title", info.Title),
			)
			return info, nil
		}
		p.Logger.Info("✗ Goja JS 引擎解析失败", zap.Error(err))
	} else {
		p.Logger.Info("[第2步] 跳过 Goja (无HTML内容)")
	}

	// Step 3: Fall back to headless browser for full JavaScript execution
	p.Logger.Info("[第3步] 尝试无头浏览器 (Headless Chrome)...")
	info, err = p.fetchWechatArticleInfoWithBrowser(ctx, articleURL)
	if err != nil {
		p.Logger.Error("✗ 无头浏览器也失败了", zap.Error(err))
		return nil, err
	}
	info.ExtractionMethod = "无头浏览器"
	p.Logger.Info("✓ 无头浏览器解析成功",
		zap.String("biz", info.Biz),
		zap.String("author", info.Author),
		zap.String("title", info.Title),
	)
	return info, nil
}

// fetchWechatArticleInfoSimple tries to extract info using simple HTTP request
// Returns the parsed info, HTML content (for retry with other methods), and error
func (p *WechatArticleParser) fetchWechatArticleInfoSimple(ctx context.Context, articleURL string) (*WechatArticleInfo, string, error) {
	p.Logger.Debug("  → 发起HTTP请求...")

	// Create request
	req, err := http.NewRequestWithContext(ctx, "GET", articleURL, nil)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers to look like a browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")

	// Fetch the page
	resp, err := p.client.Do(req)
	if err != nil {
		p.Logger.Debug("  → HTTP请求失败", zap.Error(err))
		return nil, "", fmt.Errorf("failed to fetch article: %w", err)
	}
	defer resp.Body.Close()

	p.Logger.Debug("  → HTTP响应", zap.Int("status", resp.StatusCode))

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read response: %w", err)
	}
	content := string(body)
	p.Logger.Debug("  → 获取到HTML内容", zap.Int("length", len(content)))

	// Check if WeChat is blocking the request (verification required)
	if strings.Contains(content, "环境异常") || strings.Contains(content, "去验证") {
		p.Logger.Debug("  → 检测到微信验证页面")
		return nil, content, fmt.Errorf("微信需要验证，将尝试其他方式")
	}

	p.Logger.Debug("  → 开始正则提取biz...")
	info, err := p.extractWechatInfoFromContent(articleURL, content)
	return info, content, err
}

// extractWechatInfoWithGoja uses Goja JS engine to execute JavaScript and extract biz
func (p *WechatArticleParser) extractWechatInfoWithGoja(articleURL, htmlContent string) (*WechatArticleInfo, error) {
	p.Logger.Debug("Trying Goja JS engine extraction")

	// Create Goja VM
	vm := goja.New()

	// Create window object to capture biz
	windowObj := vm.NewObject()
	vm.Set("window", windowObj)

	// Create minimal document mock
	documentObj := vm.NewObject()
	vm.Set("document", documentObj)

	// Extract all script contents that might set window.biz
	scriptRegex := regexp.MustCompile(`<script[^>]*>([\s\S]*?)</script>`)
	scripts := scriptRegex.FindAllStringSubmatch(htmlContent, -1)

	var biz string
	for _, match := range scripts {
		if len(match) < 2 {
			continue
		}
		scriptContent := match[1]

		// Skip empty scripts or external scripts
		if strings.TrimSpace(scriptContent) == "" {
			continue
		}

		// Look for scripts that might contain biz assignment
		if !strings.Contains(scriptContent, "biz") &&
			!strings.Contains(scriptContent, "window.") {
			continue
		}

		// Try to execute the script
		_, err := vm.RunString(scriptContent)
		if err != nil {
			// Script execution failed, continue to next script
			p.Logger.Debug("Script execution failed", zap.Error(err))
			continue
		}

		// Check if window.biz was set
		bizVal := windowObj.Get("biz")
		if bizVal != nil && !goja.IsUndefined(bizVal) && !goja.IsNull(bizVal) {
			biz = bizVal.String()
			if biz != "" {
				p.Logger.Debug("Found biz via Goja", zap.String("biz", biz))
				break
			}
		}
	}

	// If still not found, try direct variable extraction
	if biz == "" {
		// Look for specific pattern: window.biz = "value" or var biz = "value"
		patterns := []string{
			`window\.biz\s*=\s*["']([^"']+)["']`,
			`var\s+biz\s*=\s*["']([^"']+)["']`,
			`["']biz["']\s*:\s*["']([^"']+)["']`,
		}

		for _, pattern := range patterns {
			re := regexp.MustCompile(pattern)
			if matches := re.FindStringSubmatch(htmlContent); len(matches) > 1 {
				// Try to execute just the assignment
				assignScript := fmt.Sprintf(`window.biz = "%s";`, matches[1])
				vm.RunString(assignScript)
				bizVal := windowObj.Get("biz")
				if bizVal != nil && !goja.IsUndefined(bizVal) {
					biz = bizVal.String()
					break
				}
			}
		}
	}

	if biz == "" {
		return nil, fmt.Errorf("goja could not extract biz from scripts")
	}

	// Build the result info
	info := &WechatArticleInfo{
		Biz:        biz,
		ArticleURL: articleURL,
	}

	// Extract title and author using regex (same as before)
	titleRegex := regexp.MustCompile(`<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']`)
	if matches := titleRegex.FindStringSubmatch(htmlContent); len(matches) > 1 {
		info.Title = html.UnescapeString(matches[1])
	}
	if info.Title == "" {
		titleRegex2 := regexp.MustCompile(`<title>([^<]+)</title>`)
		if matches := titleRegex2.FindStringSubmatch(htmlContent); len(matches) > 1 {
			info.Title = html.UnescapeString(strings.TrimSpace(matches[1]))
		}
	}

	authorRegex := regexp.MustCompile(`<meta\s+property=["']og:article:author["']\s+content=["']([^"']+)["']`)
	if matches := authorRegex.FindStringSubmatch(htmlContent); len(matches) > 1 {
		info.Author = html.UnescapeString(matches[1])
	}
	if info.Author == "" {
		nicknameRegex := regexp.MustCompile(`var\s+nickname\s*=\s*["']([^"']+)["']`)
		if matches := nicknameRegex.FindStringSubmatch(htmlContent); len(matches) > 1 {
			info.Author = html.UnescapeString(matches[1])
		}
	}

	return info, nil
}

// fetchWechatArticleInfoWithBrowser uses headless browser to fetch and execute JavaScript
func (p *WechatArticleParser) fetchWechatArticleInfoWithBrowser(ctx context.Context, articleURL string) (*WechatArticleInfo, error) {
	p.Logger.Info("Using headless browser to fetch WeChat article", zap.String("url", articleURL))

	// Create a new browser context with timeout
	allocCtx, allocCancel := chromedp.NewExecAllocator(ctx,
		append(chromedp.DefaultExecAllocatorOptions[:],
			chromedp.Flag("headless", true),
			chromedp.Flag("disable-gpu", true),
			chromedp.Flag("no-sandbox", true),
			chromedp.Flag("disable-dev-shm-usage", true),
			chromedp.Flag("disable-extensions", true),
			chromedp.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
		)...,
	)
	defer allocCancel()

	browserCtx, browserCancel := chromedp.NewContext(allocCtx)
	defer browserCancel()

	// Set a timeout for the browser operations
	browserCtx, timeoutCancel := context.WithTimeout(browserCtx, 30*time.Second)
	defer timeoutCancel()

	var biz, title, author, pageContent string

	// Navigate and extract data
	err := chromedp.Run(browserCtx,
		chromedp.Navigate(articleURL),
		// Wait for the page to load
		chromedp.Sleep(2*time.Second),
		// Try to get window.biz
		chromedp.Evaluate(`window.biz || ""`, &biz),
		// Get title
		chromedp.Evaluate(`document.title || ""`, &title),
		// Try to get author from meta tag
		chromedp.Evaluate(`
			(function() {
				var meta = document.querySelector('meta[property="og:article:author"]');
				if (meta) return meta.getAttribute('content') || '';
				// Try nickname
				var nickname = document.querySelector('#js_name');
				if (nickname) return nickname.textContent.trim();
				return '';
			})()
		`, &author),
		// Get page content for fallback extraction
		chromedp.Evaluate(`document.documentElement.outerHTML`, &pageContent),
	)

	if err != nil {
		return nil, fmt.Errorf("browser fetch failed: %w", err)
	}

	// If biz not found from window.biz, try extracting from page content
	if biz == "" {
		info, err := p.extractWechatInfoFromContent(articleURL, pageContent)
		if err != nil {
			return nil, err
		}
		biz = info.Biz
		if title == "" {
			title = info.Title
		}
		if author == "" {
			author = info.Author
		}
	}

	if biz == "" {
		return nil, fmt.Errorf("could not extract public account ID (biz) even with browser")
	}

	info := &WechatArticleInfo{
		Biz:        biz,
		Title:      html.UnescapeString(title),
		Author:     html.UnescapeString(author),
		ArticleURL: articleURL,
	}

	p.Logger.Info("Successfully extracted WeChat article info with browser",
		zap.String("biz", info.Biz),
		zap.String("author", info.Author),
		zap.String("title", info.Title),
	)

	return info, nil
}

// extractWechatInfoFromContent extracts WeChat info from HTML content
func (p *WechatArticleParser) extractWechatInfoFromContent(articleURL, content string) (*WechatArticleInfo, error) {
	var biz string
	var matchMethod string

	// Method 1: Try URL params first (for full URLs)
	if parsedURL, err := url.Parse(articleURL); err == nil {
		biz = parsedURL.Query().Get("__biz")
		if biz != "" {
			matchMethod = "URL参数"
			p.Logger.Debug("    [正则] 从URL参数提取到biz", zap.String("biz", biz))
		}
	}

	// Method 2: Extract from window.biz (most common in current WeChat pages)
	if biz == "" {
		windowBizRegex := regexp.MustCompile(`window\.biz\s*=\s*["']([^"']+)["']`)
		if matches := windowBizRegex.FindStringSubmatch(content); len(matches) > 1 {
			biz = matches[1]
			matchMethod = "window.biz"
			p.Logger.Debug("    [正则] 从window.biz提取到biz", zap.String("biz", biz))
		}
	}

	// Method 3: Extract from var __biz = "xxx"
	if biz == "" {
		bizRegex := regexp.MustCompile(`var\s+__biz\s*=\s*["']([^"']+)["']`)
		if matches := bizRegex.FindStringSubmatch(content); len(matches) > 1 {
			biz = matches[1]
			matchMethod = "var __biz"
			p.Logger.Debug("    [正则] 从var __biz提取到biz", zap.String("biz", biz))
		}
	}

	// Method 4: Extract from __biz in any URL within the page
	if biz == "" {
		bizURLRegex := regexp.MustCompile(`__biz=([A-Za-z0-9=+/]+)`)
		if matches := bizURLRegex.FindStringSubmatch(content); len(matches) > 1 {
			biz = matches[1]
			matchMethod = "页面内URL"
			p.Logger.Debug("    [正则] 从页面内URL提取到biz", zap.String("biz", biz))
		}
	}

	// Method 5: Extract from biz property in JSON or object
	if biz == "" {
		bizJSONRegex := regexp.MustCompile(`["']?biz["']?\s*[:=]\s*["']([^"']+)["']`)
		if matches := bizJSONRegex.FindStringSubmatch(content); len(matches) > 1 {
			biz = matches[1]
			matchMethod = "JSON属性"
			p.Logger.Debug("    [正则] 从JSON属性提取到biz", zap.String("biz", biz))
		}
	}

	// Method 6: Extract from data attributes
	if biz == "" {
		dataRegex := regexp.MustCompile(`data-(?:__)?biz=["']([^"']+)["']`)
		if matches := dataRegex.FindStringSubmatch(content); len(matches) > 1 {
			biz = matches[1]
			matchMethod = "data属性"
			p.Logger.Debug("    [正则] 从data属性提取到biz", zap.String("biz", biz))
		}
	}

	if biz == "" {
		p.Logger.Debug("    [正则] 所有模式均未匹配到biz")
		return nil, fmt.Errorf("could not extract public account ID (__biz) from content")
	}

	p.Logger.Debug("    [正则] 提取成功", zap.String("method", matchMethod), zap.String("biz", biz))

	info := &WechatArticleInfo{
		Biz:        biz,
		ArticleURL: articleURL,
	}

	// Extract title from meta tag
	titleRegex := regexp.MustCompile(`<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']`)
	if matches := titleRegex.FindStringSubmatch(content); len(matches) > 1 {
		info.Title = html.UnescapeString(matches[1])
	}
	if info.Title == "" {
		titleRegex2 := regexp.MustCompile(`<title>([^<]+)</title>`)
		if matches := titleRegex2.FindStringSubmatch(content); len(matches) > 1 {
			info.Title = html.UnescapeString(strings.TrimSpace(matches[1]))
		}
	}

	// Extract author/account name
	authorRegex := regexp.MustCompile(`<meta\s+property=["']og:article:author["']\s+content=["']([^"']+)["']`)
	if matches := authorRegex.FindStringSubmatch(content); len(matches) > 1 {
		info.Author = html.UnescapeString(matches[1])
	}
	if info.Author == "" {
		nicknameRegex := regexp.MustCompile(`var\s+nickname\s*=\s*htmlDecode\(["']([^"']+)["']\)`)
		if matches := nicknameRegex.FindStringSubmatch(content); len(matches) > 1 {
			info.Author = html.UnescapeString(matches[1])
		}
	}
	if info.Author == "" {
		nameRegex := regexp.MustCompile(`(?:nick_name|user_name)\s*[:=]\s*["']([^"']+)["']`)
		if matches := nameRegex.FindStringSubmatch(content); len(matches) > 1 {
			info.Author = html.UnescapeString(matches[1])
		}
	}

	p.Logger.Debug("    [正则] 提取到元信息", zap.String("title", info.Title), zap.String("author", info.Author))

	return info, nil
}
