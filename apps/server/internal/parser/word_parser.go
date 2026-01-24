package parser

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"os"
	"regexp"
	"strings"

	"go.uber.org/zap"
)

// WordPositionParser parses Word documents to extract position data
type WordPositionParser struct {
	Logger *zap.Logger
}

// NewWordParser creates a new Word parser
func NewWordParser(logger *zap.Logger) *WordPositionParser {
	return &WordPositionParser{Logger: logger}
}

// Parse parses a Word document and extracts positions
func (p *WordPositionParser) Parse(filePath string) ([]ParsedPosition, error) {
	text, err := p.ExtractText(filePath)
	if err != nil {
		return nil, err
	}

	// Parse the extracted text for positions
	positions := p.parseTextContent(text)

	if p.Logger != nil {
		p.Logger.Debug("Word document parsing completed",
			zap.String("file", filePath),
			zap.Int("text_length", len(text)),
			zap.Int("positions", len(positions)),
		)
	}

	return positions, nil
}

// ExtractText extracts text from a Word document
func (p *WordPositionParser) ExtractText(filePath string) (string, error) {
	// Check file extension
	if strings.HasSuffix(strings.ToLower(filePath), ".docx") {
		return p.extractFromDocx(filePath)
	}
	
	// For .doc files, we'd need a different approach (e.g., external library or conversion)
	// For now, return an error for old format
	return "", fmt.Errorf("old .doc format not supported, please convert to .docx")
}

// extractFromDocx extracts text from a .docx file
func (p *WordPositionParser) extractFromDocx(filePath string) (string, error) {
	// Open the ZIP archive (docx is just a ZIP file)
	reader, err := zip.OpenReader(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open docx: %w", err)
	}
	defer reader.Close()

	// Find and read word/document.xml
	var documentXML *zip.File
	for _, file := range reader.File {
		if file.Name == "word/document.xml" {
			documentXML = file
			break
		}
	}

	if documentXML == nil {
		return "", fmt.Errorf("document.xml not found in docx")
	}

	// Read the document content
	rc, err := documentXML.Open()
	if err != nil {
		return "", err
	}
	defer rc.Close()

	content, err := io.ReadAll(rc)
	if err != nil {
		return "", err
	}

	// Parse XML and extract text
	return p.extractTextFromXML(content)
}

// DocxDocument represents the structure of a Word document XML
type DocxDocument struct {
	Body DocxBody `xml:"body"`
}

type DocxBody struct {
	Paragraphs []DocxParagraph `xml:"p"`
	Tables     []DocxTable     `xml:"tbl"`
}

type DocxParagraph struct {
	Runs []DocxRun `xml:"r"`
}

type DocxRun struct {
	Text string `xml:"t"`
}

type DocxTable struct {
	Rows []DocxRow `xml:"tr"`
}

type DocxRow struct {
	Cells []DocxCell `xml:"tc"`
}

type DocxCell struct {
	Paragraphs []DocxParagraph `xml:"p"`
}

// extractTextFromXML extracts text from Word XML content
func (p *WordPositionParser) extractTextFromXML(xmlContent []byte) (string, error) {
	// Create a custom decoder that handles the namespace
	decoder := xml.NewDecoder(bytes.NewReader(xmlContent))
	decoder.DefaultSpace = "w"

	var text strings.Builder
	var inText bool

	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			// Try simple regex extraction as fallback
			return p.extractTextRegex(string(xmlContent)), nil
		}

		switch t := token.(type) {
		case xml.StartElement:
			// Look for text elements
			if t.Name.Local == "t" {
				inText = true
			}
			// Add newline for paragraphs
			if t.Name.Local == "p" {
				text.WriteString("\n")
			}
		case xml.EndElement:
			if t.Name.Local == "t" {
				inText = false
			}
		case xml.CharData:
			if inText {
				text.Write(t)
			}
		}
	}

	return strings.TrimSpace(text.String()), nil
}

// extractTextRegex extracts text using regex as a fallback
func (p *WordPositionParser) extractTextRegex(xmlContent string) string {
	// Remove XML tags and extract text content
	re := regexp.MustCompile(`<w:t[^>]*>([^<]*)</w:t>`)
	matches := re.FindAllStringSubmatch(xmlContent, -1)

	var text strings.Builder
	for _, match := range matches {
		if len(match) > 1 {
			text.WriteString(match[1])
		}
	}

	return text.String()
}

// parseTextContent parses extracted text for position data
func (p *WordPositionParser) parseTextContent(text string) []ParsedPosition {
	var positions []ParsedPosition

	lines := strings.Split(text, "\n")
	
	var currentPosition *ParsedPosition
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Check for department patterns
		if matched, dept := p.extractDepartment(line); matched {
			if currentPosition != nil && currentPosition.PositionName != "" {
				positions = append(positions, *currentPosition)
			}
			currentPosition = &ParsedPosition{
				DepartmentName:  dept,
				ParseConfidence: 75,
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
func (p *WordPositionParser) extractDepartment(line string) (bool, string) {
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
func (p *WordPositionParser) extractPositionName(line string) (bool, string) {
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
func (p *WordPositionParser) extractFieldsFromLine(pos *ParsedPosition, line string) {
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

// ExtractTables extracts tables from a Word document
func (p *WordPositionParser) ExtractTables(filePath string) ([][]string, error) {
	reader, err := zip.OpenReader(filePath)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	var documentXML *zip.File
	for _, file := range reader.File {
		if file.Name == "word/document.xml" {
			documentXML = file
			break
		}
	}

	if documentXML == nil {
		return nil, fmt.Errorf("document.xml not found")
	}

	rc, err := documentXML.Open()
	if err != nil {
		return nil, err
	}
	defer rc.Close()

	content, err := io.ReadAll(rc)
	if err != nil {
		return nil, err
	}

	return p.parseTablesFromXML(content)
}

// parseTablesFromXML extracts tables from XML content
func (p *WordPositionParser) parseTablesFromXML(xmlContent []byte) ([][]string, error) {
	// Simple regex-based table extraction
	tablePattern := regexp.MustCompile(`<w:tbl>(.*?)</w:tbl>`)
	rowPattern := regexp.MustCompile(`<w:tr[^>]*>(.*?)</w:tr>`)
	cellPattern := regexp.MustCompile(`<w:tc[^>]*>(.*?)</w:tc>`)
	textPattern := regexp.MustCompile(`<w:t[^>]*>([^<]*)</w:t>`)

	var tables [][]string

	tableMatches := tablePattern.FindAllStringSubmatch(string(xmlContent), -1)
	for _, tableMatch := range tableMatches {
		if len(tableMatch) < 2 {
			continue
		}

		rowMatches := rowPattern.FindAllStringSubmatch(tableMatch[1], -1)
		for _, rowMatch := range rowMatches {
			if len(rowMatch) < 2 {
				continue
			}

			var row []string
			cellMatches := cellPattern.FindAllStringSubmatch(rowMatch[1], -1)
			for _, cellMatch := range cellMatches {
				if len(cellMatch) < 2 {
					continue
				}

				var cellText strings.Builder
				textMatches := textPattern.FindAllStringSubmatch(cellMatch[1], -1)
				for _, textMatch := range textMatches {
					if len(textMatch) > 1 {
						cellText.WriteString(textMatch[1])
					}
				}
				row = append(row, cellText.String())
			}

			if len(row) > 0 {
				tables = append(tables, row)
			}
		}
	}

	return tables, nil
}

// GetDocumentInfo returns basic information about a Word document
func (p *WordPositionParser) GetDocumentInfo(filePath string) (map[string]string, error) {
	info := make(map[string]string)

	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return nil, err
	}

	info["name"] = fileInfo.Name()
	info["size"] = fmt.Sprintf("%d", fileInfo.Size())
	info["modified"] = fileInfo.ModTime().String()

	if strings.HasSuffix(strings.ToLower(filePath), ".docx") {
		reader, err := zip.OpenReader(filePath)
		if err == nil {
			defer reader.Close()
			info["format"] = "docx"
			info["files"] = fmt.Sprintf("%d", len(reader.File))
		}
	} else {
		info["format"] = "doc"
	}

	return info, nil
}
