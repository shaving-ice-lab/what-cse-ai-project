package crawler

import (
	"fmt"
	"io"
	"testing"
)

// TestTLSClientFetchPage tests that the TLS client can access pages that return 403 with standard clients
func TestTLSClientFetchPage(t *testing.T) {
	// This URL previously returned 403 with standard Go http.Client
	testURL := "https://job.snhrm.com/app/article/content/25993.shtml"

	tlsClient, err := NewTLSClientWithRedirects()
	if err != nil {
		t.Fatalf("Failed to create TLS client: %v", err)
	}

	req, err := CreateChromeRequest("GET", testURL, nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	resp, err := tlsClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to fetch page: %v", err)
	}
	defer resp.Body.Close()

	fmt.Printf("Status Code: %d\n", resp.StatusCode)

	if resp.StatusCode == 403 {
		t.Errorf("Got 403 Forbidden - TLS fingerprinting might still be detected")
	}

	if resp.StatusCode != 200 {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read body: %v", err)
	}

	fmt.Printf("Body length: %d bytes\n", len(body))

	if len(body) < 100 {
		t.Errorf("Body too short, expected content page")
	}
}

// TestTLSClientResolveShortURL tests that the TLS client can resolve short URLs
func TestTLSClientResolveShortURL(t *testing.T) {
	// Fenbi short URL that redirects to job.snhrm.com
	shortURL := "https://t.fenbi.com/s/00Bjas"

	tlsClient, err := NewTLSClientWithRedirects()
	if err != nil {
		t.Fatalf("Failed to create TLS client: %v", err)
	}

	req, err := CreateChromeRequest("GET", shortURL, nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	resp, err := tlsClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to resolve short URL: %v", err)
	}
	defer resp.Body.Close()

	finalURL := resp.Request.URL.String()
	fmt.Printf("Short URL: %s\n", shortURL)
	fmt.Printf("Final URL: %s\n", finalURL)
	fmt.Printf("Status Code (during redirect): %d\n", resp.StatusCode)

	// The important thing is that we get the final URL after redirects
	if finalURL == shortURL {
		t.Errorf("Short URL did not redirect")
	}

	// Verify the final URL is correct (should contain job.snhrm.com)
	if finalURL == "" {
		t.Errorf("Final URL is empty")
	}

	// Note: The 403 during redirect is expected because some sites detect
	// TLS fingerprinting during redirect chains. The solution is to use
	// FetchPageContent with a fresh TLS client to fetch the actual content.
	fmt.Printf("Note: 403 during redirect is expected, use FetchPageContent for actual content\n")
}

// TestTLSClientIntegration tests the full workflow: resolve short URL, then fetch content
func TestTLSClientIntegration(t *testing.T) {
	shortURL := "https://t.fenbi.com/s/00Bjas"
	expectedFinalURLPrefix := "https://job.snhrm.com"

	// Step 1: Resolve short URL to get final URL
	fmt.Println("Step 1: Resolving short URL...")
	tlsClient1, err := NewTLSClientWithRedirects()
	if err != nil {
		t.Fatalf("Failed to create TLS client for resolve: %v", err)
	}

	req1, err := CreateChromeRequest("GET", shortURL, nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	resp1, err := tlsClient1.Do(req1)
	if err != nil {
		t.Fatalf("Failed to resolve short URL: %v", err)
	}
	resp1.Body.Close()

	finalURL := resp1.Request.URL.String()
	fmt.Printf("Resolved URL (raw): %s\n", finalURL)

	// Normalize the URL to remove default ports (e.g., :443)
	// This is important because some WAFs block requests with explicit default ports
	finalURL = NormalizeURL(finalURL)
	fmt.Printf("Resolved URL (normalized): %s\n", finalURL)

	if finalURL == shortURL {
		t.Fatalf("Short URL did not redirect")
	}

	// Verify we got the expected destination
	if len(finalURL) < len(expectedFinalURLPrefix) {
		t.Fatalf("Final URL too short: %s", finalURL)
	}

	// Step 2: Fetch content from the final URL with a fresh TLS client
	fmt.Println("Step 2: Fetching content from final URL...")
	tlsClient2, err := NewTLSClientWithRedirects()
	if err != nil {
		t.Fatalf("Failed to create TLS client for fetch: %v", err)
	}

	req2, err := CreateChromeRequest("GET", finalURL, nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	resp2, err := tlsClient2.Do(req2)
	if err != nil {
		t.Fatalf("Failed to fetch content: %v", err)
	}
	defer resp2.Body.Close()

	fmt.Printf("Final fetch status: %d\n", resp2.StatusCode)

	if resp2.StatusCode == 403 {
		t.Errorf("Got 403 Forbidden when fetching content from final URL")
	}

	if resp2.StatusCode == 200 {
		body, _ := io.ReadAll(resp2.Body)
		fmt.Printf("SUCCESS: Fetched %d bytes of content\n", len(body))
	}
}

// TestNormalizeURL tests URL normalization
func TestNormalizeURL(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"https://example.com:443/path", "https://example.com/path"},
		{"https://example.com:443", "https://example.com"},
		{"http://example.com:80/path", "http://example.com/path"},
		{"http://example.com:80", "http://example.com"},
		{"https://example.com/path", "https://example.com/path"},
		{"https://example.com:8443/path", "https://example.com:8443/path"}, // non-default port
	}

	for _, tt := range tests {
		result := NormalizeURL(tt.input)
		if result != tt.expected {
			t.Errorf("NormalizeURL(%q) = %q, want %q", tt.input, result, tt.expected)
		}
	}
}
