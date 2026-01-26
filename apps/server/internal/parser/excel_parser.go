package parser

import (
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/extrame/xls"
	"github.com/xuri/excelize/v2"
	"go.uber.org/zap"
)

// ExcelPositionParser parses Excel files to extract position data
type ExcelPositionParser struct {
	Logger *zap.Logger
}

// NewExcelParser creates a new Excel parser
func NewExcelParser(logger *zap.Logger) *ExcelPositionParser {
	return &ExcelPositionParser{Logger: logger}
}

// Parse parses an Excel file and extracts positions
func (p *ExcelPositionParser) Parse(filePath string) ([]ParsedPosition, error) {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open excel file: %w", err)
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
// Supports both .xlsx and .xls formats
func (p *ExcelPositionParser) ExtractText(filePath string) (string, error) {
	ext := strings.ToLower(filepath.Ext(filePath))
	
	if ext == ".xls" {
		return p.extractTextFromXLS(filePath)
	}
	
	return p.extractTextFromXLSX(filePath)
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
