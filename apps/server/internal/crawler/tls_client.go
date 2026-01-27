// Package crawler provides TLS client functionality for bypassing TLS fingerprint detection
package crawler

import (
	"net/url"
	"strings"

	http "github.com/bogdanfinn/fhttp"
	tls_client "github.com/bogdanfinn/tls-client"
	"github.com/bogdanfinn/tls-client/profiles"
)

// TLSClientWrapper wraps tls-client for use in the crawler
type TLSClientWrapper struct {
	client tls_client.HttpClient
}

// NewTLSClient creates a new TLS client that mimics Chrome browser TLS fingerprint
func NewTLSClient() (*TLSClientWrapper, error) {
	jar := tls_client.NewCookieJar()
	options := []tls_client.HttpClientOption{
		tls_client.WithTimeoutSeconds(30),
		tls_client.WithClientProfile(profiles.Chrome_131),
		tls_client.WithCookieJar(jar),
		// Follow redirects by default
		tls_client.WithNotFollowRedirects(),
	}

	client, err := tls_client.NewHttpClient(tls_client.NewNoopLogger(), options...)
	if err != nil {
		return nil, err
	}

	return &TLSClientWrapper{client: client}, nil
}

// NewTLSClientWithRedirects creates a TLS client that follows redirects
func NewTLSClientWithRedirects() (*TLSClientWrapper, error) {
	jar := tls_client.NewCookieJar()
	options := []tls_client.HttpClientOption{
		tls_client.WithTimeoutSeconds(30),
		tls_client.WithClientProfile(profiles.Chrome_131),
		tls_client.WithCookieJar(jar),
		// Follow redirects
	}

	client, err := tls_client.NewHttpClient(tls_client.NewNoopLogger(), options...)
	if err != nil {
		return nil, err
	}

	return &TLSClientWrapper{client: client}, nil
}

// Do executes an HTTP request
func (t *TLSClientWrapper) Do(req *http.Request) (*http.Response, error) {
	return t.client.Do(req)
}

// Get performs a GET request
func (t *TLSClientWrapper) Get(url string) (*http.Response, error) {
	return t.client.Get(url)
}

// SetCookies sets cookies for the given URL
func (t *TLSClientWrapper) SetCookies(u *url.URL, cookies []*http.Cookie) {
	t.client.SetCookies(u, cookies)
}

// GetCookies returns cookies for the given URL
func (t *TLSClientWrapper) GetCookies(u *url.URL) []*http.Cookie {
	return t.client.GetCookies(u)
}

// NormalizeURL removes default ports from URLs to avoid WAF detection
// e.g., https://example.com:443/path -> https://example.com/path
func NormalizeURL(urlStr string) string {
	// Remove :443 from HTTPS URLs
	urlStr = strings.Replace(urlStr, "https://", "HTTPS_PLACEHOLDER", 1)
	if strings.Contains(urlStr, ":443/") {
		urlStr = strings.Replace(urlStr, ":443/", "/", 1)
	} else if strings.HasSuffix(urlStr, ":443") {
		urlStr = strings.TrimSuffix(urlStr, ":443")
	}
	urlStr = strings.Replace(urlStr, "HTTPS_PLACEHOLDER", "https://", 1)

	// Remove :80 from HTTP URLs
	urlStr = strings.Replace(urlStr, "http://", "HTTP_PLACEHOLDER", 1)
	if strings.Contains(urlStr, ":80/") {
		urlStr = strings.Replace(urlStr, ":80/", "/", 1)
	} else if strings.HasSuffix(urlStr, ":80") {
		urlStr = strings.TrimSuffix(urlStr, ":80")
	}
	urlStr = strings.Replace(urlStr, "HTTP_PLACEHOLDER", "http://", 1)

	return urlStr
}

// CreateChromeRequest creates a request with Chrome-like headers
func CreateChromeRequest(method, targetURL string, body interface{}) (*http.Request, error) {
	var req *http.Request
	var err error

	if body != nil {
		// For requests with body, caller should handle body encoding
		req, err = http.NewRequest(method, targetURL, nil)
	} else {
		req, err = http.NewRequest(method, targetURL, nil)
	}

	if err != nil {
		return nil, err
	}

	// Set Chrome-like headers with proper order
	req.Header = http.Header{
		"accept":                    {"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"},
		"accept-language":           {"zh-CN,zh;q=0.9,en;q=0.8"},
		"cache-control":             {"max-age=0"},
		"sec-ch-ua":                 {`"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"`},
		"sec-ch-ua-mobile":          {"?0"},
		"sec-ch-ua-platform":        {`"Windows"`},
		"sec-fetch-dest":            {"document"},
		"sec-fetch-mode":            {"navigate"},
		"sec-fetch-site":            {"none"},
		"sec-fetch-user":            {"?1"},
		"upgrade-insecure-requests": {"1"},
		"user-agent":                {"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"},
		http.HeaderOrderKey: {
			"accept",
			"accept-language",
			"cache-control",
			"sec-ch-ua",
			"sec-ch-ua-mobile",
			"sec-ch-ua-platform",
			"sec-fetch-dest",
			"sec-fetch-mode",
			"sec-fetch-site",
			"sec-fetch-user",
			"upgrade-insecure-requests",
			"user-agent",
		},
		http.PHeaderOrderKey: {
			":method",
			":authority",
			":scheme",
			":path",
		},
	}

	return req, nil
}
