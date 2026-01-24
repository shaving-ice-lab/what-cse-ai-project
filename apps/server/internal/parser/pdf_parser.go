package parser

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
	"go.uber.org/zap"
)

// PDFPositionParser parses PDF files to extract position data
type PDFPositionParser struct {
	Logger    *zap.Logger
	OCRParser OCRParser
}

// OCRParser interface for OCR functionality
type OCRParser interface {
	ParseImage(imagePath string) (string, error)
}

// NewPDFParser creates a new PDF parser
func NewPDFParser(logger *zap.Logger) *PDFPositionParser {
	return &PDFPositionParser{Logger: logger}
}

// SetOCRParser sets the OCR parser for scanned PDFs
func (p *PDFPositionParser) SetOCRParser(ocr OCRParser) {
	p.OCRParser = ocr
}

// Parse parses a PDF file and extracts positions
func (p *PDFPositionParser) Parse(filePath string) ([]ParsedPosition, error) {
	// First try to extract text directly
	text, err := p.ExtractText(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to extract text from PDF: %w", err)
	}

	// If text is too short, it might be a scanned PDF
	if len(strings.TrimSpace(text)) < 100 {
		if p.Logger != nil {
			p.Logger.Info("PDF appears to be scanned, text extraction limited",
				zap.String("file", filePath),
				zap.Int("text_length", len(text)),
			)
		}
		// Could call OCR here if OCRParser is set
		// For now, return empty with a note
		return nil, nil
	}

	// Try to extract tables from text
	positions := p.parseTextContent(text)

	if p.Logger != nil {
		p.Logger.Debug("PDF parsing completed",
			zap.String("file", filePath),
			zap.Int("text_length", len(text)),
			zap.Int("positions", len(positions)),
		)
	}

	return positions, nil
}

// ExtractText extracts all text from a PDF file
func (p *PDFPositionParser) ExtractText(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open PDF: %w", err)
	}
	defer file.Close()

	// Get file info for size
	info, err := file.Stat()
	if err != nil {
		return "", fmt.Errorf("failed to get file info: %w", err)
	}

	// Create a configuration
	conf := model.NewDefaultConfiguration()

	// Read the PDF content
	ctx, err := api.ReadContext(file, conf)
	if err != nil {
		return "", fmt.Errorf("failed to read PDF context: %w", err)
	}

	// Extract text from all pages
	var textBuffer bytes.Buffer

	pageCount := ctx.PageCount
	if p.Logger != nil {
		p.Logger.Debug("PDF info",
			zap.String("file", filePath),
			zap.Int64("size", info.Size()),
			zap.Int("pages", pageCount),
		)
	}

	// pdfcpu has limited text extraction capability
	// For production, consider using a more robust library like unidoc/unipdf
	// For now, we use a temporary directory to extract content
	tempDir, err := os.MkdirTemp("", "pdf_extract_*")
	if err != nil {
		return "", fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Extract content to temp directory
	if err := api.ExtractContentFile(filePath, tempDir, nil, conf); err != nil {
		// If extraction fails, return empty string (PDF might be image-based)
		if p.Logger != nil {
			p.Logger.Debug("PDF content extraction failed, might be image-based",
				zap.String("file", filePath),
				zap.Error(err),
			)
		}
		return "", nil
	}

	// Read extracted content files
	files, err := os.ReadDir(tempDir)
	if err != nil {
		return "", nil
	}

	for _, f := range files {
		if f.IsDir() {
			continue
		}
		content, err := os.ReadFile(fmt.Sprintf("%s/%s", tempDir, f.Name()))
		if err != nil {
			continue
		}
		textBuffer.Write(content)
		textBuffer.WriteString("\n")
	}

	return textBuffer.String(), nil
}

// parseTextContent attempts to parse position data from extracted text
func (p *PDFPositionParser) parseTextContent(text string) []ParsedPosition {
	var positions []ParsedPosition

	// Try to identify table-like structures in text
	lines := strings.Split(text, "\n")

	// Look for patterns that indicate position data
	// This is a simplified approach - real implementation would need more sophisticated parsing

	var currentPosition *ParsedPosition

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Check for department/position patterns
		if matched, dept := p.extractDepartment(line); matched {
			if currentPosition != nil && currentPosition.PositionName != "" {
				positions = append(positions, *currentPosition)
			}
			currentPosition = &ParsedPosition{
				DepartmentName:  dept,
				ParseConfidence: 70,
			}
			continue
		}

		// Check for position name patterns
		if currentPosition != nil {
			if matched, pos := p.extractPositionName(line); matched {
				currentPosition.PositionName = pos
				continue
			}

			// Extract other fields
			p.extractFieldsFromLine(currentPosition, line)
		}
	}

	// Add last position
	if currentPosition != nil && currentPosition.PositionName != "" {
		positions = append(positions, *currentPosition)
	}

	return positions
}

// extractDepartment tries to extract department name from a line
func (p *PDFPositionParser) extractDepartment(line string) (bool, string) {
	patterns := []string{
		`^(.{2,30})(局|部|厅|委|办|院|署|中心)$`,
		`^招录机关[：:]\s*(.+)$`,
		`^部门名称[：:]\s*(.+)$`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		if matches := re.FindStringSubmatch(line); len(matches) > 1 {
			return true, strings.TrimSpace(matches[len(matches)-1])
		}
	}

	return false, ""
}

// extractPositionName tries to extract position name from a line
func (p *PDFPositionParser) extractPositionName(line string) (bool, string) {
	patterns := []string{
		`^(.{2,30})(岗|员|师|官)$`,
		`^职位名称[：:]\s*(.+)$`,
		`^岗位名称[：:]\s*(.+)$`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		if matches := re.FindStringSubmatch(line); len(matches) > 1 {
			return true, strings.TrimSpace(matches[len(matches)-1])
		}
	}

	return false, ""
}

// extractFieldsFromLine extracts various fields from a text line
func (p *PDFPositionParser) extractFieldsFromLine(pos *ParsedPosition, line string) {
	// Education patterns
	educationPatterns := []string{`本科`, `硕士`, `博士`, `大专`, `研究生`}
	for _, edu := range educationPatterns {
		if strings.Contains(line, edu) && pos.EducationMin == "" {
			pos.EducationMin = edu
			break
		}
	}

	// Recruit count pattern
	recruitPattern := regexp.MustCompile(`(\d+)\s*人`)
	if matches := recruitPattern.FindStringSubmatch(line); len(matches) > 1 {
		if count, err := parseInt(matches[1]); err == nil && pos.RecruitCount == 0 {
			pos.RecruitCount = count
		}
	}

	// Major patterns
	majorPatterns := []string{
		`专业[：:]\s*(.+?)(?:[，,。]|$)`,
		`专业要求[：:]\s*(.+?)(?:[，,。]|$)`,
	}
	for _, pattern := range majorPatterns {
		re := regexp.MustCompile(pattern)
		if matches := re.FindStringSubmatch(line); len(matches) > 1 {
			major := strings.TrimSpace(matches[1])
			if strings.Contains(major, "不限") {
				pos.MajorUnlimited = true
			} else if len(pos.MajorSpecific) == 0 {
				pos.MajorSpecific = splitMajors(major)
			}
			break
		}
	}

	// Political status
	politicalPatterns := []string{`党员`, `团员`, `群众`}
	for _, pol := range politicalPatterns {
		if strings.Contains(line, pol) && pos.PoliticalStatus == "" {
			pos.PoliticalStatus = pol
			break
		}
	}
}

// GetPageCount returns the number of pages in a PDF
func (p *PDFPositionParser) GetPageCount(filePath string) (int, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	conf := model.NewDefaultConfiguration()
	ctx, err := api.ReadContext(file, conf)
	if err != nil {
		return 0, err
	}

	return ctx.PageCount, nil
}

// IsScannedPDF checks if a PDF is likely a scanned document
func (p *PDFPositionParser) IsScannedPDF(filePath string) (bool, error) {
	text, err := p.ExtractText(filePath)
	if err != nil {
		return false, err
	}

	// If very little text was extracted, it's likely scanned
	cleanText := strings.TrimSpace(text)
	return len(cleanText) < 100, nil
}

// ExtractToWriter extracts text to an io.Writer
func (p *PDFPositionParser) ExtractToWriter(filePath string, w io.Writer) error {
	text, err := p.ExtractText(filePath)
	if err != nil {
		return err
	}

	_, err = w.Write([]byte(text))
	return err
}

func parseInt(s string) (int, error) {
	s = strings.TrimSpace(s)
	return strconv.Atoi(s)
}
