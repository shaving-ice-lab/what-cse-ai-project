package crawler

import (
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
	"go.uber.org/zap"
)

// Announcement represents a crawled announcement
type Announcement struct {
	URL           string    `json:"url"`
	Title         string    `json:"title"`
	Content       string    `json:"content"`
	ContentHTML   string    `json:"content_html"`
	PublishDate   string    `json:"publish_date,omitempty"`
	SourceName    string    `json:"source_name"`
	SourceListID  uint      `json:"source_list_id"`
	Category      string    `json:"category,omitempty"`
	Attachments   []Attachment `json:"attachments,omitempty"`
	CrawledAt     time.Time `json:"crawled_at"`
}

// Attachment represents a file attachment
type Attachment struct {
	URL       string `json:"url"`
	Name      string `json:"name"`
	Type      string `json:"type"` // pdf, excel, word
	LocalPath string `json:"local_path,omitempty"`
}

// AnnouncementSpider crawls announcement detail pages
type AnnouncementSpider struct {
	*Spider
	Articles      []Article
	Announcements []Announcement
	datePattern   *regexp.Regexp
}

// NewAnnouncementSpider creates a new announcement spider
func NewAnnouncementSpider(config *SpiderConfig, logger *zap.Logger) *AnnouncementSpider {
	spider := NewSpider("announcement", config, logger)

	return &AnnouncementSpider{
		Spider:        spider,
		Announcements: make([]Announcement, 0),
		datePattern:   regexp.MustCompile(`(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)`),
	}
}

// SetArticles sets the articles to crawl
func (s *AnnouncementSpider) SetArticles(articles []Article) {
	s.Articles = articles
}

// Run executes the announcement crawl
func (s *AnnouncementSpider) Run() (*AnnouncementCrawlResult, error) {
	startTime := time.Now()
	result := &AnnouncementCrawlResult{
		Announcements: make([]Announcement, 0),
	}

	// Setup HTML callback for content extraction
	s.Collector.OnHTML("html", func(e *colly.HTMLElement) {
		article := s.findArticleByURL(e.Request.URL.String())
		if article == nil {
			return
		}

		announcement := s.extractAnnouncement(e, article)
		if announcement != nil {
			s.Announcements = append(s.Announcements, *announcement)
			result.SuccessCount++
		} else {
			result.FailedCount++
		}
	})

	// Visit all article URLs
	for _, article := range s.Articles {
		if err := s.Visit(article.URL); err != nil {
			s.Logger.Error("Failed to visit article",
				zap.String("url", article.URL),
				zap.Error(err),
			)
			result.Errors = append(result.Errors, err.Error())
			result.FailedCount++
		}
	}

	s.Wait()

	result.Announcements = s.Announcements
	result.RequestCount = s.GetRequestCount()
	result.Duration = time.Since(startTime)

	s.Logger.Info("Announcement crawl completed",
		zap.Int("success", result.SuccessCount),
		zap.Int("failed", result.FailedCount),
		zap.Int64("requests", result.RequestCount),
		zap.Duration("duration", result.Duration),
	)

	return result, nil
}

// findArticleByURL finds the article by URL
func (s *AnnouncementSpider) findArticleByURL(url string) *Article {
	for i := range s.Articles {
		if s.Articles[i].URL == url {
			return &s.Articles[i]
		}
	}
	return nil
}

// extractAnnouncement extracts announcement content from a page
func (s *AnnouncementSpider) extractAnnouncement(e *colly.HTMLElement, article *Article) *Announcement {
	announcement := &Announcement{
		URL:          article.URL,
		SourceName:   article.SourceName,
		SourceListID: article.SourceListID,
		Category:     article.Category,
		CrawledAt:    time.Now(),
	}

	// Extract title
	announcement.Title = s.extractTitle(e, article.Title)

	// Extract content
	content, contentHTML := s.extractContent(e)
	announcement.Content = content
	announcement.ContentHTML = contentHTML

	// Extract publish date
	announcement.PublishDate = s.extractPublishDate(e, article.PublishDate)

	// Extract attachments
	announcement.Attachments = s.extractAttachments(e)

	// Validate
	if announcement.Title == "" || len(announcement.Content) < 50 {
		s.Logger.Warn("Invalid announcement content",
			zap.String("url", article.URL),
			zap.String("title", announcement.Title),
			zap.Int("content_length", len(announcement.Content)),
		)
		return nil
	}

	return announcement
}

// extractTitle extracts the title from the page
func (s *AnnouncementSpider) extractTitle(e *colly.HTMLElement, fallback string) string {
	// Try common title selectors
	titleSelectors := []string{
		"h1",
		".article-title",
		".news-title",
		".content-title",
		".detail-title",
		"#title",
		".title",
	}

	for _, sel := range titleSelectors {
		title := strings.TrimSpace(e.DOM.Find(sel).First().Text())
		if title != "" && len(title) > 3 {
			return title
		}
	}

	// Try page title
	pageTitle := strings.TrimSpace(e.DOM.Find("title").Text())
	if pageTitle != "" {
		// Remove common suffixes
		suffixes := []string{" - ", " | ", "_", "–"}
		for _, suffix := range suffixes {
			if idx := strings.Index(pageTitle, suffix); idx > 0 {
				pageTitle = pageTitle[:idx]
			}
		}
		if len(pageTitle) > 3 {
			return pageTitle
		}
	}

	return fallback
}

// extractContent extracts the main content from the page
func (s *AnnouncementSpider) extractContent(e *colly.HTMLElement) (string, string) {
	// Remove unwanted elements
	e.DOM.Find("script, style, nav, header, footer, aside, .sidebar, .comment, .ad").Remove()

	// Try common content selectors
	contentSelectors := []string{
		"article",
		".article-content",
		".content",
		".post-content",
		"#content",
		".main-content",
		".detail-content",
		".news-content",
		".zwContent",
		".TRS_Editor",
		".pages_content",
		".content_txt",
		".Custom_UnifyPageContent",
	}

	for _, sel := range contentSelectors {
		contentElem := e.DOM.Find(sel).First()
		if contentElem.Length() > 0 {
			html, _ := contentElem.Html()
			text := strings.TrimSpace(contentElem.Text())
			if len(text) > 100 {
				return cleanText(text), html
			}
		}
	}

	// Fallback to body
	body := e.DOM.Find("body")
	if body.Length() > 0 {
		html, _ := body.Html()
		text := strings.TrimSpace(body.Text())
		return cleanText(text), html
	}

	return "", ""
}

// extractPublishDate extracts the publish date from the page
func (s *AnnouncementSpider) extractPublishDate(e *colly.HTMLElement, fallback string) string {
	// Try common date selectors
	dateSelectors := []string{
		".publish-date",
		".date",
		".time",
		".article-time",
		".news-date",
		"time",
		".pubdate",
		".info-time",
	}

	for _, sel := range dateSelectors {
		dateText := strings.TrimSpace(e.DOM.Find(sel).First().Text())
		if match := s.datePattern.FindString(dateText); match != "" {
			return match
		}
	}

	// Search in meta tags
	metaDate := e.DOM.Find("meta[name='publishdate'], meta[property='article:published_time']").AttrOr("content", "")
	if metaDate != "" {
		return metaDate
	}

	// Search in page content
	pageText := e.DOM.Find("body").Text()
	if match := s.datePattern.FindString(pageText[:min(1000, len(pageText))]); match != "" {
		return match
	}

	return fallback
}

// extractAttachments extracts file attachments from the page
func (s *AnnouncementSpider) extractAttachments(e *colly.HTMLElement) []Attachment {
	attachments := make([]Attachment, 0)

	// Find links to common attachment types
	extensions := map[string]string{
		".pdf":  "pdf",
		".xls":  "excel",
		".xlsx": "excel",
		".doc":  "word",
		".docx": "word",
	}

	e.DOM.Find("a[href]").Each(func(_ int, selection *goquery.Selection) {
		href, exists := selection.Attr("href")
		if !exists || href == "" {
			return
		}

		href = strings.ToLower(href)
		for ext, fileType := range extensions {
			if strings.Contains(href, ext) {
				fullURL, err := JoinURL(e.Request.URL.String(), href)
				if err != nil {
					continue
				}

				name := strings.TrimSpace(selection.Text())
				if name == "" {
					// Extract from URL
					parts := strings.Split(href, "/")
					name = parts[len(parts)-1]
				}

				attachments = append(attachments, Attachment{
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

// AnnouncementCrawlResult holds the result of an announcement crawl
type AnnouncementCrawlResult struct {
	Announcements []Announcement `json:"announcements"`
	SuccessCount  int            `json:"success_count"`
	FailedCount   int            `json:"failed_count"`
	RequestCount  int64          `json:"request_count"`
	Duration      time.Duration  `json:"duration"`
	Errors        []string       `json:"errors,omitempty"`
}

// cleanText cleans up extracted text
func cleanText(text string) string {
	// Replace multiple newlines with double newline
	re := regexp.MustCompile(`\n{3,}`)
	text = re.ReplaceAllString(text, "\n\n")

	// Replace multiple spaces with single space
	re = regexp.MustCompile(`[ \t]+`)
	text = re.ReplaceAllString(text, " ")

	return strings.TrimSpace(text)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
