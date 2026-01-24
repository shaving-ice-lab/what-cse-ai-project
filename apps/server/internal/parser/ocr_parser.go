package parser

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	"go.uber.org/zap"
)

// OCRConfig holds configuration for OCR parsing
type OCRConfig struct {
	Engine       string `mapstructure:"engine"`        // tesseract, api
	TesseractCmd string `mapstructure:"tesseract_cmd"` // Path to tesseract binary
	Language     string `mapstructure:"language"`      // chi_sim+eng
	APIURL       string `mapstructure:"api_url"`       // For cloud OCR API
	APIKey       string `mapstructure:"api_key"`
	Timeout      time.Duration `mapstructure:"timeout"`
}

// DefaultOCRConfig returns default OCR configuration
func DefaultOCRConfig() *OCRConfig {
	return &OCRConfig{
		Engine:       "tesseract",
		TesseractCmd: "tesseract",
		Language:     "chi_sim+eng",
		Timeout:      60 * time.Second,
	}
}

// OCRPositionParser handles OCR-based text extraction
type OCRPositionParser struct {
	Config *OCRConfig
	Logger *zap.Logger
}

// NewOCRParser creates a new OCR parser
func NewOCRParser(config *OCRConfig, logger *zap.Logger) *OCRPositionParser {
	if config == nil {
		config = DefaultOCRConfig()
	}
	return &OCRPositionParser{
		Config: config,
		Logger: logger,
	}
}

// ParseImage extracts text from an image file using OCR
func (p *OCRPositionParser) ParseImage(imagePath string) (string, error) {
	switch p.Config.Engine {
	case "tesseract":
		return p.parseWithTesseract(imagePath)
	case "api":
		return p.parseWithAPI(imagePath)
	default:
		return p.parseWithTesseract(imagePath)
	}
}

// parseWithTesseract uses local Tesseract OCR
func (p *OCRPositionParser) parseWithTesseract(imagePath string) (string, error) {
	// Check if tesseract is available
	_, err := exec.LookPath(p.Config.TesseractCmd)
	if err != nil {
		return "", fmt.Errorf("tesseract not found: %w", err)
	}

	// Run tesseract
	args := []string{
		imagePath,
		"stdout",
		"-l", p.Config.Language,
		"--psm", "6", // Assume uniform block of text
	}

	cmd := exec.Command(p.Config.TesseractCmd, args...)
	
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err = cmd.Run()
	if err != nil {
		if p.Logger != nil {
			p.Logger.Error("Tesseract OCR failed",
				zap.String("image", imagePath),
				zap.String("stderr", stderr.String()),
				zap.Error(err),
			)
		}
		return "", fmt.Errorf("tesseract failed: %w - %s", err, stderr.String())
	}

	text := strings.TrimSpace(stdout.String())

	if p.Logger != nil {
		p.Logger.Debug("OCR completed",
			zap.String("image", imagePath),
			zap.Int("text_length", len(text)),
		)
	}

	return text, nil
}

// parseWithAPI uses a cloud OCR API
func (p *OCRPositionParser) parseWithAPI(imagePath string) (string, error) {
	if p.Config.APIURL == "" {
		return "", fmt.Errorf("OCR API URL not configured")
	}

	// Read image file
	imageData, err := os.ReadFile(imagePath)
	if err != nil {
		return "", fmt.Errorf("failed to read image: %w", err)
	}

	// Create request
	client := &http.Client{Timeout: p.Config.Timeout}

	req, err := http.NewRequest("POST", p.Config.APIURL, bytes.NewReader(imageData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/octet-stream")
	if p.Config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+p.Config.APIKey)
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("OCR API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("OCR API error: %d - %s", resp.StatusCode, string(body))
	}

	// Parse response
	var result struct {
		Text  string `json:"text"`
		Error string `json:"error"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to parse OCR response: %w", err)
	}

	if result.Error != "" {
		return "", fmt.Errorf("OCR API error: %s", result.Error)
	}

	return result.Text, nil
}

// ParsePDFPages extracts text from PDF pages using OCR
func (p *OCRPositionParser) ParsePDFPages(pdfPath string, outputDir string) ([]string, error) {
	// This would convert PDF pages to images first, then OCR each
	// For now, return an error indicating this needs image conversion
	return nil, fmt.Errorf("PDF to image conversion not implemented - use external tool like poppler/pdftoppm")
}

// IsAvailable checks if OCR is available
func (p *OCRPositionParser) IsAvailable() bool {
	if p.Config.Engine == "api" {
		return p.Config.APIURL != ""
	}

	_, err := exec.LookPath(p.Config.TesseractCmd)
	return err == nil
}

// GetSupportedLanguages returns available Tesseract languages
func (p *OCRPositionParser) GetSupportedLanguages() ([]string, error) {
	if p.Config.Engine != "tesseract" {
		return nil, fmt.Errorf("language listing only supported for tesseract")
	}

	cmd := exec.Command(p.Config.TesseractCmd, "--list-langs")
	
	var stdout bytes.Buffer
	cmd.Stdout = &stdout

	if err := cmd.Run(); err != nil {
		return nil, err
	}

	lines := strings.Split(stdout.String(), "\n")
	var languages []string
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line != "" && !strings.HasPrefix(line, "List of") {
			languages = append(languages, line)
		}
	}

	return languages, nil
}

// OCRResult holds the result of OCR processing
type OCRResult struct {
	Text       string            `json:"text"`
	Confidence float64           `json:"confidence"`
	Boxes      []OCRBoundingBox  `json:"boxes,omitempty"`
	Tables     [][][]string      `json:"tables,omitempty"`
	Duration   time.Duration     `json:"duration"`
}

// OCRBoundingBox represents a text region in the image
type OCRBoundingBox struct {
	Text       string  `json:"text"`
	X          int     `json:"x"`
	Y          int     `json:"y"`
	Width      int     `json:"width"`
	Height     int     `json:"height"`
	Confidence float64 `json:"confidence"`
}

// ParseImageWithDetails extracts text with bounding box information
func (p *OCRPositionParser) ParseImageWithDetails(imagePath string) (*OCRResult, error) {
	startTime := time.Now()
	
	result := &OCRResult{}

	// For tesseract, we can get detailed output with TSV format
	if p.Config.Engine == "tesseract" {
		text, err := p.parseWithTesseractTSV(imagePath)
		if err != nil {
			return nil, err
		}
		result.Text = text
	} else {
		text, err := p.ParseImage(imagePath)
		if err != nil {
			return nil, err
		}
		result.Text = text
	}

	result.Duration = time.Since(startTime)
	return result, nil
}

// parseWithTesseractTSV extracts text using Tesseract TSV output
func (p *OCRPositionParser) parseWithTesseractTSV(imagePath string) (string, error) {
	args := []string{
		imagePath,
		"stdout",
		"-l", p.Config.Language,
		"--psm", "6",
		"tsv",
	}

	cmd := exec.Command(p.Config.TesseractCmd, args...)
	
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("tesseract failed: %w", err)
	}

	// Parse TSV output
	lines := strings.Split(stdout.String(), "\n")
	var textParts []string

	for i, line := range lines {
		if i == 0 {
			continue // Skip header
		}

		fields := strings.Split(line, "\t")
		if len(fields) >= 12 {
			text := fields[11]
			if strings.TrimSpace(text) != "" {
				textParts = append(textParts, text)
			}
		}
	}

	return strings.Join(textParts, " "), nil
}
