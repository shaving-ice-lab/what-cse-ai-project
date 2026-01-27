package parser

import (
	"archive/zip"
	"bytes"
	"encoding/binary"
	"encoding/xml"
	"fmt"
	"io"
	"os"
	"regexp"
	"strings"
	"unicode/utf16"

	"github.com/richardlehane/mscfb"
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
	lowerPath := strings.ToLower(filePath)

	// Check file extension
	if strings.HasSuffix(lowerPath, ".docx") {
		return p.extractFromDocx(filePath)
	}

	if strings.HasSuffix(lowerPath, ".doc") {
		return p.extractFromDoc(filePath)
	}

	return "", fmt.Errorf("unsupported file format, please use .doc or .docx")
}

// extractFromDoc extracts text from an old .doc file (Office 97-2003)
func (p *WordPositionParser) extractFromDoc(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open doc file: %w", err)
	}
	defer file.Close()

	// Parse the OLE2/CFB container
	doc, err := mscfb.New(file)
	if err != nil {
		return "", fmt.Errorf("failed to parse doc file (invalid format): %w", err)
	}

	var wordDocStream, tableStream *mscfb.File
	var table0Stream, table1Stream *mscfb.File

	// Find the required streams
	for entry, err := doc.Next(); err == nil; entry, err = doc.Next() {
		name := entry.Name
		switch name {
		case "WordDocument":
			wordDocStream = entry
		case "0Table":
			table0Stream = entry
		case "1Table":
			table1Stream = entry
		}
	}

	if wordDocStream == nil {
		return "", fmt.Errorf("WordDocument stream not found in doc file")
	}

	// Read WordDocument stream
	wordDocData, err := io.ReadAll(wordDocStream)
	if err != nil {
		return "", fmt.Errorf("failed to read WordDocument stream: %w", err)
	}

	if len(wordDocData) < 12 {
		return "", fmt.Errorf("WordDocument stream too small")
	}

	// Parse FIB (File Information Block)
	// Check which table to use (bit 9 of flags)
	if len(wordDocData) >= 12 {
		flags := binary.LittleEndian.Uint16(wordDocData[10:12])
		if flags&0x0200 != 0 {
			tableStream = table1Stream
		} else {
			tableStream = table0Stream
		}
	}

	// Try to extract text using different methods
	text, err := p.extractTextFromDocStreams(wordDocData, tableStream)
	if err != nil {
		// Fallback: try simple text extraction
		if p.Logger != nil {
			p.Logger.Debug("Falling back to simple text extraction", zap.Error(err))
		}
		return p.extractSimpleTextFromDoc(wordDocData), nil
	}

	return text, nil
}

// extractTextFromDocStreams extracts text using FIB information
func (p *WordPositionParser) extractTextFromDocStreams(wordDocData []byte, tableStream *mscfb.File) (string, error) {
	if len(wordDocData) < 76 {
		return "", fmt.Errorf("WordDocument data too small for FIB")
	}

	// FIB structure - get text positions
	// fcMin is at offset 24 (4 bytes) - start of text in file
	// ccpText is at offset 76 (4 bytes) - character count of main document text

	// For Word 97+, text is typically stored as Unicode (UTF-16LE)
	// Read ccpText (character count) from FIB
	if len(wordDocData) < 80 {
		return "", fmt.Errorf("FIB too small")
	}

	ccpText := binary.LittleEndian.Uint32(wordDocData[76:80])

	// Try to find and extract text
	// The text is usually located after the FIB
	// For simplicity, we'll try to extract readable text from the stream

	if ccpText == 0 || ccpText > 10000000 {
		// Fallback to simple extraction
		return p.extractSimpleTextFromDoc(wordDocData), nil
	}

	// Try to read from piece table if table stream is available
	if tableStream != nil {
		tableData, err := io.ReadAll(tableStream)
		if err == nil && len(tableData) > 0 {
			text := p.extractTextFromPieceTable(wordDocData, tableData, ccpText)
			if len(text) > 0 {
				return text, nil
			}
		}
	}

	// Fallback to simple extraction
	return p.extractSimpleTextFromDoc(wordDocData), nil
}

// extractTextFromPieceTable extracts text using the piece table
func (p *WordPositionParser) extractTextFromPieceTable(wordDocData, tableData []byte, ccpText uint32) string {
	// The piece table is complex; for now, try simple extraction
	// This is a simplified approach that works for many documents

	var result strings.Builder

	// Try to find Unicode text (UTF-16LE encoded)
	for i := 0; i < len(wordDocData)-1; i += 2 {
		if i+1 >= len(wordDocData) {
			break
		}

		// Read as UTF-16LE
		code := uint16(wordDocData[i]) | uint16(wordDocData[i+1])<<8

		// Skip control characters and invalid codes
		if code >= 0x20 && code < 0xFFFE {
			if code < 0x80 {
				// ASCII range
				result.WriteByte(byte(code))
			} else if code < 0xD800 || code >= 0xE000 {
				// Valid Unicode
				result.WriteRune(rune(code))
			}
		} else if code == 0x0D || code == 0x0A {
			result.WriteByte('\n')
		}
	}

	return cleanExtractedText(result.String())
}

// extractSimpleTextFromDoc extracts text using a simple heuristic approach
func (p *WordPositionParser) extractSimpleTextFromDoc(data []byte) string {
	var result strings.Builder

	// Method 1: Try UTF-16LE decoding (common in Word 97-2003)
	utf16Text := p.tryUTF16LEDecode(data)
	if len(utf16Text) > 100 {
		return cleanExtractedText(utf16Text)
	}

	// Method 2: Extract ASCII/CP1252 text
	inText := false
	consecutiveText := 0

	for i := 0; i < len(data); i++ {
		b := data[i]

		// Check if it's a printable character or common control char
		if (b >= 0x20 && b < 0x7F) || b == 0x0D || b == 0x0A || b == 0x09 {
			if b == 0x0D || b == 0x0A {
				if inText && consecutiveText > 3 {
					result.WriteByte('\n')
				}
				consecutiveText = 0
			} else {
				result.WriteByte(b)
				consecutiveText++
				inText = true
			}
		} else if b >= 0x80 && b <= 0xFF {
			// Extended ASCII (Windows-1252)
			// Convert common Chinese/extended characters
			result.WriteByte(b)
			consecutiveText++
			inText = true
		} else {
			if consecutiveText > 3 {
				result.WriteByte(' ')
			}
			consecutiveText = 0
			inText = false
		}
	}

	return cleanExtractedText(result.String())
}

// tryUTF16LEDecode attempts to decode data as UTF-16LE
func (p *WordPositionParser) tryUTF16LEDecode(data []byte) string {
	if len(data) < 2 {
		return ""
	}

	// Look for text regions in the data
	// Word documents often have text in specific regions
	var bestText string
	var bestLen int

	// Scan through data looking for valid UTF-16LE sequences
	for start := 0; start < len(data)-100; start++ {
		text := p.decodeUTF16LERegion(data[start:])
		if len(text) > bestLen {
			bestLen = len(text)
			bestText = text
		}

		// Skip to next potential start
		if bestLen > 1000 {
			break
		}
	}

	return bestText
}

// decodeUTF16LERegion decodes a region of data as UTF-16LE
func (p *WordPositionParser) decodeUTF16LERegion(data []byte) string {
	if len(data) < 2 {
		return ""
	}

	var codes []uint16
	validCount := 0
	invalidCount := 0

	for i := 0; i < len(data)-1 && i < 50000; i += 2 {
		code := binary.LittleEndian.Uint16(data[i : i+2])

		// Check if valid character
		if (code >= 0x20 && code < 0xD800) || (code >= 0xE000 && code < 0xFFFE) ||
			code == 0x0D || code == 0x0A || code == 0x09 {
			codes = append(codes, code)
			validCount++
			invalidCount = 0
		} else if code == 0 {
			// Null terminator or padding
			if validCount > 10 {
				break
			}
			codes = nil
			validCount = 0
		} else {
			invalidCount++
			if invalidCount > 10 && validCount < 50 {
				// Reset if too many invalid chars early on
				codes = nil
				validCount = 0
				invalidCount = 0
			} else if invalidCount > 50 {
				break
			}
		}
	}

	if len(codes) < 10 {
		return ""
	}

	// Convert to string
	runes := utf16.Decode(codes)
	return string(runes)
}

// cleanExtractedText cleans up extracted text
func cleanExtractedText(text string) string {
	// Remove excessive whitespace and control characters
	var result strings.Builder
	prevSpace := false
	prevNewline := false

	for _, r := range text {
		if r == '\n' || r == '\r' {
			if !prevNewline {
				result.WriteByte('\n')
				prevNewline = true
			}
			prevSpace = false
		} else if r == ' ' || r == '\t' {
			if !prevSpace && !prevNewline {
				result.WriteByte(' ')
				prevSpace = true
			}
		} else if r >= 0x20 || r == 0x4E00 {
			// Printable character or Chinese character range start
			result.WriteRune(r)
			prevSpace = false
			prevNewline = false
		}
	}

	return strings.TrimSpace(result.String())
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
