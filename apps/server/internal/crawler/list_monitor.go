package crawler

import (
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
	"go.uber.org/zap"
)

// ListPage represents a monitored list page configuration
type ListPage struct {
	ID                uint   `json:"id"`
	URL               string `json:"url"`
	SourceName        string `json:"source_name"`
	Category          string `json:"category"`
	ArticleSelector   string `json:"article_selector"`
	PaginationPattern string `json:"pagination_pattern"`
	Status            string `json:"status"`
}

// ListMonitorSpider crawls list pages to discover new articles
type ListMonitorSpider struct {
	*Spider
	ListPages   []ListPage
	NewArticles []Article
	datePattern *regexp.Regexp
}

// NewListMonitorSpider creates a new list monitor spider
func NewListMonitorSpider(config *SpiderConfig, logger *zap.Logger) *ListMonitorSpider {
	spider := NewSpider("list_monitor", config, logger)

	return &ListMonitorSpider{
		Spider:      spider,
		NewArticles: make([]Article, 0),
		datePattern: regexp.MustCompile(`(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)`),
	}
}

// SetListPages sets the list pages to monitor
func (s *ListMonitorSpider) SetListPages(pages []ListPage) {
	s.ListPages = pages
}

// SetCrawledURLs sets the already crawled URLs for deduplication
func (s *ListMonitorSpider) SetCrawledURLs(urls map[string]bool) {
	s.CrawledURLs = urls
}

// Run executes the list monitoring crawl
func (s *ListMonitorSpider) Run() (*CrawlResult, error) {
	startTime := time.Now()
	result := &CrawlResult{
		Articles: make([]Article, 0),
	}

	// Setup HTML callback for article extraction
	s.Collector.OnHTML("html", func(e *colly.HTMLElement) {
		listPage := s.findListPageByURL(e.Request.URL.String())
		if listPage == nil {
			return
		}

		articles := s.extractArticles(e, listPage)
		for _, article := range articles {
			if !s.IsURLCrawled(article.URL) {
				s.MarkURLCrawled(article.URL)
				s.NewArticles = append(s.NewArticles, article)
				result.NewArticles++
			}
			result.TotalFound++
		}

		// Handle pagination
		s.handlePagination(e, listPage)
	})

	// Visit all active list pages
	for _, page := range s.ListPages {
		if page.Status != "active" {
			continue
		}
		if err := s.Visit(page.URL); err != nil {
			s.Logger.Error("Failed to visit list page",
				zap.String("url", page.URL),
				zap.Error(err),
			)
			result.Errors = append(result.Errors, err.Error())
		}
	}

	s.Wait()

	result.Articles = s.NewArticles
	result.RequestCount = s.GetRequestCount()
	result.Duration = time.Since(startTime)

	s.Logger.Info("List monitor crawl completed",
		zap.Int("total_found", result.TotalFound),
		zap.Int("new_articles", result.NewArticles),
		zap.Int64("requests", result.RequestCount),
		zap.Duration("duration", result.Duration),
	)

	return result, nil
}

// findListPageByURL finds the list page configuration by URL
func (s *ListMonitorSpider) findListPageByURL(url string) *ListPage {
	for i := range s.ListPages {
		if strings.HasPrefix(url, s.ListPages[i].URL) {
			return &s.ListPages[i]
		}
	}
	return nil
}

// extractArticles extracts article links from a list page
func (s *ListMonitorSpider) extractArticles(e *colly.HTMLElement, listPage *ListPage) []Article {
	articles := make([]Article, 0)

	// Determine the selector to use
	selector := listPage.ArticleSelector
	if selector == "" {
		selector = "a"
	}

	// Try multiple common selectors if the primary one fails
	selectors := []string{selector}
	if selector == "a" {
		selectors = append(selectors,
			".list-item a",
			".article-list a",
			".news-list a",
			"ul.list li a",
			".content-list a",
			"table.list a",
			".zwlb a",
			".list_con a",
		)
	}

	for _, sel := range selectors {
		e.DOM.Find(sel).Each(func(_ int, selection *goquery.Selection) {
			href, exists := selection.Attr("href")
			if !exists || href == "" || strings.HasPrefix(href, "#") || strings.HasPrefix(href, "javascript:") {
				return
			}

			// Build full URL
			fullURL, err := JoinURL(e.Request.URL.String(), href)
			if err != nil {
				return
			}

			// Extract title
			title := strings.TrimSpace(selection.Text())
			if title == "" {
				title, _ = selection.Attr("title")
			}

			// Skip empty titles or navigation links
			if title == "" || len(title) < 3 {
				return
			}

			// Extract date if possible
			publishDate := s.extractDate(selection)

			article := Article{
				URL:          fullURL,
				Title:        title,
				PublishDate:  publishDate,
				SourceListID: listPage.ID,
				SourceName:   listPage.SourceName,
				Category:     listPage.Category,
				DiscoveredAt: time.Now(),
			}

			articles = append(articles, article)
		})

		if len(articles) > 0 {
			break
		}
	}

	return articles
}

// extractDate extracts date from element or its siblings
func (s *ListMonitorSpider) extractDate(selection *goquery.Selection) string {
	// Check the element text
	text := selection.Text()
	if match := s.datePattern.FindString(text); match != "" {
		return match
	}

	// Check parent element
	parent := selection.Parent()
	if parent != nil {
		text = parent.Text()
		if match := s.datePattern.FindString(text); match != "" {
			return match
		}
	}

	// Check siblings
	siblings := selection.Siblings()
	siblings.Each(func(_ int, sib *goquery.Selection) {
		text := sib.Text()
		if match := s.datePattern.FindString(text); match != "" {
			// Found date in sibling
			return
		}
	})

	return ""
}

// handlePagination handles pagination for list pages
func (s *ListMonitorSpider) handlePagination(e *colly.HTMLElement, listPage *ListPage) {
	// Method 1: Use pagination pattern from config
	if listPage.PaginationPattern != "" {
		// This would need to be implemented based on the pattern format
		return
	}

	// Method 2: Find "next page" link
	nextSelectors := []string{
		"a.next",
		".pagination .next a",
		"a[class*='next']",
		".page-next a",
		".pager-next a",
	}

	for _, sel := range nextSelectors {
		nextLink := e.DOM.Find(sel).First()
		if nextLink.Length() > 0 {
			if href, exists := nextLink.Attr("href"); exists && href != "" {
				fullURL, err := JoinURL(e.Request.URL.String(), href)
				if err == nil && !s.IsURLCrawled(fullURL) {
					s.Visit(fullURL)
				}
			}
			return
		}
	}

	// Method 3: Find link containing "下一页" text
	nextTexts := []string{"下一页", "下页", "»", ">", "Next"}
	e.DOM.Find("a").Each(func(_ int, selection *goquery.Selection) {
		text := strings.TrimSpace(selection.Text())
		for _, nextText := range nextTexts {
			if strings.Contains(text, nextText) {
				if href, exists := selection.Attr("href"); exists && href != "" && !strings.HasPrefix(href, "javascript:") {
					fullURL, err := JoinURL(e.Request.URL.String(), href)
					if err == nil && !s.IsURLCrawled(fullURL) {
						s.Visit(fullURL)
					}
				}
				return
			}
		}
	})
}

// GetNewArticles returns the newly discovered articles
func (s *ListMonitorSpider) GetNewArticles() []Article {
	return s.NewArticles
}
