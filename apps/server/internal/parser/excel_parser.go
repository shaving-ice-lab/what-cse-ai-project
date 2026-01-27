package parser

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/extrame/xls"
	"github.com/xuri/excelize/v2"
	"go.uber.org/zap"
)

// isHTMLFile checks if a file is actually HTML content (common on gov sites)
func isHTMLFile(filePath string) bool {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return false
	}
	
	// Check for common HTML signatures
	content := strings.ToLower(string(data[:min(1000, len(data))]))
	return strings.Contains(content, "<html") ||
		strings.Contains(content, "<!doctype html") ||
		strings.Contains(content, "<table") ||
		strings.Contains(content, "<head")
}

// extractTextFromHTML extracts text from HTML files disguised as Excel
func (p *ExcelPositionParser) extractTextFromHTML(filePath string) (string, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", err
	}
	
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(data))
	if err != nil {
		return "", err
	}
	
	var builder strings.Builder
	
	// Extract text from tables
	doc.Find("table").Each(func(idx int, table *goquery.Selection) {
		builder.WriteString(fmt.Sprintf("=== Table %d ===\n", idx+1))
		table.Find("tr").Each(func(_ int, row *goquery.Selection) {
			var cells []string
			row.Find("th, td").Each(func(_ int, cell *goquery.Selection) {
				text := strings.TrimSpace(cell.Text())
				cells = append(cells, text)
			})
			if len(cells) > 0 {
				builder.WriteString(strings.Join(cells, "\t"))
				builder.WriteString("\n")
			}
		})
		builder.WriteString("\n")
	})
	
	// If no tables found, extract all text
	if builder.Len() == 0 {
		builder.WriteString(doc.Find("body").Text())
	}
	
	return builder.String(), nil
}

// ExcelPositionParser parses Excel files to extract position data
type ExcelPositionParser struct {
	Logger *zap.Logger
}

// NewExcelParser creates a new Excel parser
func NewExcelParser(logger *zap.Logger) *ExcelPositionParser {
	return &ExcelPositionParser{Logger: logger}
}

// Parse parses an Excel file and extracts positions
// Supports both .xlsx and .xls formats, also handles HTML files disguised as Excel
func (p *ExcelPositionParser) Parse(filePath string) ([]ParsedPosition, error) {
	// First, check if the file is actually HTML disguised as Excel
	if isHTMLFile(filePath) {
		if p.Logger != nil {
			p.Logger.Debug("Detected HTML content in Excel file, using HTML parser",
				zap.String("file", filePath),
			)
		}
		return p.parseHTML(filePath)
	}
	
	ext := strings.ToLower(filepath.Ext(filePath))
	
	// Try appropriate parser based on extension
	if ext == ".xls" {
		positions, err := p.parseXLS(filePath)
		if err == nil && len(positions) > 0 {
			return positions, nil
		}
		// Fallback to HTML parser
		htmlPositions, htmlErr := p.parseHTML(filePath)
		if htmlErr == nil && len(htmlPositions) > 0 {
			return htmlPositions, nil
		}
		if err != nil {
			return nil, fmt.Errorf("failed to parse xls file: %w", err)
		}
		return positions, nil
	}
	
	// For .xlsx files, try excelize first
	positions, err := p.parseXLSX(filePath)
	if err != nil {
		// If xlsx parsing fails, the file might actually be an xls file
		// (common on Chinese government websites that save HTML as .xls/.xlsx)
		if p.Logger != nil {
			p.Logger.Debug("XLSX parsing failed, trying fallback parsers",
				zap.String("file", filePath),
				zap.Error(err),
			)
		}
		
		// Try xls parser as fallback
		xlsPositions, xlsErr := p.parseXLS(filePath)
		if xlsErr == nil && len(xlsPositions) > 0 {
			return xlsPositions, nil
		}
		
		// Try HTML parser as last resort
		htmlPositions, htmlErr := p.parseHTML(filePath)
		if htmlErr == nil && len(htmlPositions) > 0 {
			if p.Logger != nil {
				p.Logger.Debug("File is actually HTML, parsed using HTML parser",
					zap.String("file", filePath),
				)
			}
			return htmlPositions, nil
		}
		
		// All parsers failed, return original error
		return nil, fmt.Errorf("failed to open excel file: %w", err)
	}
	
	return positions, nil
}

// parseHTML parses HTML files disguised as Excel and extracts positions
func (p *ExcelPositionParser) parseHTML(filePath string) ([]ParsedPosition, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}
	
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	
	var allPositions []ParsedPosition
	
	// Process all tables
	doc.Find("table").Each(func(_ int, table *goquery.Selection) {
		positions := p.parseHTMLTable(table)
		allPositions = append(allPositions, positions...)
	})
	
	return allPositions, nil
}

// parseHTMLTable parses a single HTML table
func (p *ExcelPositionParser) parseHTMLTable(table *goquery.Selection) []ParsedPosition {
	var rows [][]string
	
	// Extract all rows
	table.Find("tr").Each(func(_ int, row *goquery.Selection) {
		var cells []string
		row.Find("th, td").Each(func(_ int, cell *goquery.Selection) {
			cells = append(cells, strings.TrimSpace(cell.Text()))
		})
		if len(cells) > 0 {
			rows = append(rows, cells)
		}
	})
	
	if len(rows) < 2 {
		return nil
	}
	
	// Find header row
	headerRowIdx := -1
	for i, row := range rows {
		if p.isHeaderRow(row) {
			headerRowIdx = i
			break
		}
	}
	
	if headerRowIdx < 0 {
		return nil
	}
	
	// Map headers
	headers := rows[headerRowIdx]
	mappedHeaders := p.mapHeaders(headers)
	
	// Parse data rows
	var positions []ParsedPosition
	for i := headerRowIdx + 1; i < len(rows); i++ {
		row := rows[i]
		if len(row) == 0 {
			continue
		}
		
		position := p.parseRow(row, mappedHeaders)
		if position != nil && position.PositionName != "" {
			positions = append(positions, *position)
		}
	}
	
	return positions
}

// parseXLSX parses .xlsx files using excelize
func (p *ExcelPositionParser) parseXLSX(filePath string) ([]ParsedPosition, error) {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var allPositions []ParsedPosition

	// Process all sheets
	for _, sheetName := range f.GetSheetList() {
		positions, err := p.parseSheet(f, sheetName)
		if err != nil {
			if p.Logger != nil {
				p.Logger.Warn("Failed to parse sheet",
					zap.String("sheet", sheetName),
					zap.Error(err),
				)
			}
			continue
		}
		allPositions = append(allPositions, positions...)
	}

	if p.Logger != nil {
		p.Logger.Debug("Excel parsing completed",
			zap.String("file", filePath),
			zap.Int("sheets", len(f.GetSheetList())),
			zap.Int("positions", len(allPositions)),
		)
	}

	return allPositions, nil
}

// parseXLS parses .xls files using extrame/xls library
func (p *ExcelPositionParser) parseXLS(filePath string) ([]ParsedPosition, error) {
	xlsFile, err := xls.Open(filePath, "utf-8")
	if err != nil {
		return nil, err
	}

	var allPositions []ParsedPosition

	// Process all sheets
	for sheetIdx := 0; sheetIdx < xlsFile.NumSheets(); sheetIdx++ {
		sheet := xlsFile.GetSheet(sheetIdx)
		if sheet == nil {
			continue
		}

		positions, err := p.parseXLSSheet(sheet)
		if err != nil {
			if p.Logger != nil {
				p.Logger.Warn("Failed to parse XLS sheet",
					zap.String("sheet", sheet.Name),
					zap.Error(err),
				)
			}
			continue
		}
		allPositions = append(allPositions, positions...)
	}

	if p.Logger != nil {
		p.Logger.Debug("XLS parsing completed",
			zap.String("file", filePath),
			zap.Int("positions", len(allPositions)),
		)
	}

	return allPositions, nil
}

// parseXLSSheet parses a single sheet from an XLS file
func (p *ExcelPositionParser) parseXLSSheet(sheet *xls.WorkSheet) ([]ParsedPosition, error) {
	maxRow := int(sheet.MaxRow)
	if maxRow < 2 {
		return nil, nil // Not enough rows
	}

	// Convert sheet to rows format
	var rows [][]string
	for rowIdx := 0; rowIdx <= maxRow; rowIdx++ {
		row := sheet.Row(rowIdx)
		if row == nil {
			rows = append(rows, []string{})
			continue
		}

		var cells []string
		lastCol := row.LastCol()
		for colIdx := 0; colIdx < lastCol; colIdx++ {
			cells = append(cells, row.Col(colIdx))
		}
		rows = append(rows, cells)
	}

	// Find header row
	headerRowIdx := -1
	for i, row := range rows {
		if p.isHeaderRow(row) {
			headerRowIdx = i
			break
		}
	}

	if headerRowIdx < 0 {
		return nil, nil // No valid header found
	}

	// Map headers
	headers := rows[headerRowIdx]
	mappedHeaders := p.mapHeaders(headers)

	// Parse data rows
	var positions []ParsedPosition
	for i := headerRowIdx + 1; i < len(rows); i++ {
		row := rows[i]
		if len(row) == 0 {
			continue
		}

		position := p.parseRow(row, mappedHeaders)
		if position != nil && position.PositionName != "" {
			positions = append(positions, *position)
		}
	}

	return positions, nil
}

// parseSheet parses a single sheet
func (p *ExcelPositionParser) parseSheet(f *excelize.File, sheetName string) ([]ParsedPosition, error) {
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, err
	}

	if len(rows) < 2 {
		return nil, nil // Not enough rows
	}

	// Find header row (first row with position-related keywords)
	headerRowIdx := -1
	for i, row := range rows {
		if p.isHeaderRow(row) {
			headerRowIdx = i
			break
		}
	}

	if headerRowIdx < 0 {
		return nil, nil // No valid header found
	}

	// Map headers
	headers := rows[headerRowIdx]
	mappedHeaders := p.mapHeaders(headers)

	// Parse data rows
	var positions []ParsedPosition
	for i := headerRowIdx + 1; i < len(rows); i++ {
		row := rows[i]
		if len(row) == 0 {
			continue
		}

		position := p.parseRow(row, mappedHeaders)
		if position != nil && position.PositionName != "" {
			positions = append(positions, *position)
		}
	}

	return positions, nil
}

// isHeaderRow checks if a row is a header row
func (p *ExcelPositionParser) isHeaderRow(row []string) bool {
	rowText := strings.Join(row, " ")

	matchCount := 0
	for _, keyword := range PositionTableKeywords {
		if strings.Contains(rowText, keyword) {
			matchCount++
		}
	}

	return matchCount >= 3
}

// mapHeaders maps Excel headers to standard field names
func (p *ExcelPositionParser) mapHeaders(headers []string) []string {
	mapped := make([]string, len(headers))

	for i, header := range headers {
		header = strings.TrimSpace(header)
		if header == "" {
			continue
		}

		// Try exact match
		if fieldName, ok := FieldMapping[header]; ok {
			mapped[i] = fieldName
			continue
		}

		// Try partial match
		for key, fieldName := range FieldMapping {
			if strings.Contains(header, key) || strings.Contains(key, header) {
				mapped[i] = fieldName
				break
			}
		}

		if mapped[i] == "" {
			mapped[i] = normalizeFieldName(header)
		}
	}

	return mapped
}

// parseRow parses a single data row
func (p *ExcelPositionParser) parseRow(row []string, mappedHeaders []string) *ParsedPosition {
	position := &ParsedPosition{
		ParseConfidence: 90,
	}
	hasData := false

	for i, value := range row {
		if i >= len(mappedHeaders) || mappedHeaders[i] == "" {
			continue
		}

		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}

		hasData = true
		p.setPositionField(position, mappedHeaders[i], value)
	}

	if !hasData {
		return nil
	}

	return position
}

// setPositionField sets a field on the position based on field name
func (p *ExcelPositionParser) setPositionField(pos *ParsedPosition, fieldName, value string) {
	switch fieldName {
	case "position_name":
		pos.PositionName = value
	case "department_name":
		pos.DepartmentName = value
	case "department_code":
		pos.DepartmentCode = value
	case "position_code":
		pos.PositionCode = value
	case "recruit_count":
		if count, err := strconv.Atoi(extractNumber(value)); err == nil {
			pos.RecruitCount = count
		}
	case "work_location":
		pos.WorkLocation = value
	case "education_min":
		pos.EducationMin = value
	case "major_specific":
		if strings.Contains(value, "不限") || strings.Contains(value, "无限制") {
			pos.MajorUnlimited = true
		} else {
			pos.MajorSpecific = splitMajors(value)
		}
	case "political_status":
		pos.PoliticalStatus = value
	case "gender_required":
		pos.GenderRequired = normalizeGender(value)
	case "age_requirement":
		pos.AgeRequirement = value
	case "work_exp_requirement":
		pos.WorkExpRequirement = value
	case "hukou_requirement":
		pos.HukouRequirement = value
	case "other_requirements":
		pos.OtherRequirements = value
	case "notes":
		pos.Notes = value
	}
}

// GetSheetNames returns the names of all sheets in the Excel file
func (p *ExcelPositionParser) GetSheetNames(filePath string) ([]string, error) {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	return f.GetSheetList(), nil
}

// GetSheetData returns raw data from a specific sheet
func (p *ExcelPositionParser) GetSheetData(filePath, sheetName string) ([][]string, error) {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	return f.GetRows(sheetName)
}

// ExtractText extracts all text content from an Excel file
// Supports both .xlsx and .xls formats, with fallback for misnamed files
// Also handles HTML files disguised as Excel (common on Chinese gov websites)
func (p *ExcelPositionParser) ExtractText(filePath string) (string, error) {
	// First, check if the file is actually HTML disguised as Excel
	if isHTMLFile(filePath) {
		if p.Logger != nil {
			p.Logger.Debug("Detected HTML content in Excel file, using HTML parser",
				zap.String("file", filePath),
			)
		}
		return p.extractTextFromHTML(filePath)
	}
	
	ext := strings.ToLower(filepath.Ext(filePath))
	
	if ext == ".xls" {
		// Try xls parser first
		text, err := p.extractTextFromXLS(filePath)
		if err == nil && text != "" {
			return text, nil
		}
		// Fallback to xlsx parser (some .xls files are actually xlsx)
		xlsxText, xlsxErr := p.extractTextFromXLSX(filePath)
		if xlsxErr == nil && xlsxText != "" {
			return xlsxText, nil
		}
		// Try HTML as last resort
		htmlText, htmlErr := p.extractTextFromHTML(filePath)
		if htmlErr == nil && htmlText != "" {
			return htmlText, nil
		}
		// Return original error
		if err != nil {
			return "", err
		}
		return "", xlsxErr
	}
	
	// For .xlsx files, try excelize first
	text, err := p.extractTextFromXLSX(filePath)
	if err != nil {
		// If xlsx parsing fails, try xls parser as fallback
		if p.Logger != nil {
			p.Logger.Debug("XLSX text extraction failed, trying fallback parsers",
				zap.String("file", filePath),
				zap.Error(err),
			)
		}
		
		xlsText, xlsErr := p.extractTextFromXLS(filePath)
		if xlsErr == nil && xlsText != "" {
			return xlsText, nil
		}
		
		// Try HTML as last resort (some sites save HTML as .xlsx)
		htmlText, htmlErr := p.extractTextFromHTML(filePath)
		if htmlErr == nil && htmlText != "" {
			if p.Logger != nil {
				p.Logger.Debug("File is actually HTML, extracted using HTML parser",
					zap.String("file", filePath),
				)
			}
			return htmlText, nil
		}
		
		// All parsers failed, return original error
		return "", fmt.Errorf("failed to open excel file: %w", err)
	}
	
	return text, nil
}

// extractTextFromXLSX extracts text from .xlsx files
func (p *ExcelPositionParser) extractTextFromXLSX(filePath string) (string, error) {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open excel file: %w", err)
	}
	defer f.Close()

	var builder strings.Builder

	// Process all sheets
	for _, sheetName := range f.GetSheetList() {
		rows, err := f.GetRows(sheetName)
		if err != nil {
			continue
		}

		builder.WriteString(fmt.Sprintf("=== Sheet: %s ===\n", sheetName))
		
		for _, row := range rows {
			// Join cells with tab separator
			line := strings.Join(row, "\t")
			if strings.TrimSpace(line) != "" {
				builder.WriteString(line)
				builder.WriteString("\n")
			}
		}
		builder.WriteString("\n")
	}

	return builder.String(), nil
}

// extractTextFromXLS extracts text from .xls files (legacy Excel format)
func (p *ExcelPositionParser) extractTextFromXLS(filePath string) (string, error) {
	xlsFile, err := xls.Open(filePath, "utf-8")
	if err != nil {
		return "", fmt.Errorf("failed to open xls file: %w", err)
	}

	var builder strings.Builder

	// Process all sheets
	for sheetIdx := 0; sheetIdx < xlsFile.NumSheets(); sheetIdx++ {
		sheet := xlsFile.GetSheet(sheetIdx)
		if sheet == nil {
			continue
		}

		builder.WriteString(fmt.Sprintf("=== Sheet: %s ===\n", sheet.Name))

		// Get max row
		maxRow := int(sheet.MaxRow)
		for rowIdx := 0; rowIdx <= maxRow; rowIdx++ {
			row := sheet.Row(rowIdx)
			if row == nil {
				continue
			}

			var cells []string
			lastCol := row.LastCol()
			for colIdx := 0; colIdx < lastCol; colIdx++ {
				cell := row.Col(colIdx)
				cells = append(cells, cell)
			}

			line := strings.Join(cells, "\t")
			if strings.TrimSpace(line) != "" {
				builder.WriteString(line)
				builder.WriteString("\n")
			}
		}
		builder.WriteString("\n")
	}

	return builder.String(), nil
}
