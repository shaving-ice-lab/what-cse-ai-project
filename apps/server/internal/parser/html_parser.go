// Package parser provides document parsing functionality
package parser

import (
	"regexp"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"go.uber.org/zap"
)

// FieldMapping maps Chinese column headers to standard field names
var FieldMapping = map[string]string{
	"招录机关": "department_name",
	"部门名称": "department_name",
	"用人单位": "department_name",
	"招录单位": "department_name",
	"职位名称": "position_name",
	"岗位名称": "position_name",
	"职位代码": "position_code",
	"岗位代码": "position_code",
	"招录人数": "recruit_count",
	"计划人数": "recruit_count",
	"录用人数": "recruit_count",
	"人数":   "recruit_count",
	"学历":   "education_min",
	"学历要求": "education_min",
	"专业":   "major_specific",
	"专业要求": "major_specific",
	"政治面貌": "political_status",
	"年龄":   "age_requirement",
	"年龄要求": "age_requirement",
	"工作经历": "work_exp_requirement",
	"户籍":   "hukou_requirement",
	"户籍要求": "hukou_requirement",
	"性别":   "gender_required",
	"性别要求": "gender_required",
	"工作地点": "work_location",
	"备注":   "notes",
	"其他条件": "other_requirements",
}

// PositionTableKeywords are keywords that indicate a position table
var PositionTableKeywords = []string{"职位", "岗位", "部门", "学历", "专业", "人数"}

// HTMLTableParser parses HTML tables to extract position data
type HTMLTableParser struct {
	Logger *zap.Logger
}

// NewHTMLTableParser creates a new HTML table parser
func NewHTMLTableParser(logger *zap.Logger) *HTMLTableParser {
	return &HTMLTableParser{Logger: logger}
}

// ParsedPosition represents a parsed position from HTML table
type ParsedPosition struct {
	PositionName      string   `json:"position_name"`
	DepartmentName    string   `json:"department_name"`
	DepartmentCode    string   `json:"department_code,omitempty"`
	PositionCode      string   `json:"position_code,omitempty"`
	RecruitCount      int      `json:"recruit_count"`
	WorkLocation      string   `json:"work_location,omitempty"`
	EducationMin      string   `json:"education_min,omitempty"`
	MajorSpecific     []string `json:"major_specific,omitempty"`
	MajorUnlimited    bool     `json:"major_unlimited"`
	PoliticalStatus   string   `json:"political_status,omitempty"`
	GenderRequired    string   `json:"gender_required,omitempty"`
	AgeRequirement    string   `json:"age_requirement,omitempty"`
	WorkExpRequirement string  `json:"work_exp_requirement,omitempty"`
	HukouRequirement  string   `json:"hukou_requirement,omitempty"`
	OtherRequirements string   `json:"other_requirements,omitempty"`
	Notes             string   `json:"notes,omitempty"`
	ParseConfidence   int      `json:"parse_confidence"`
}

// ParseTables parses HTML content and extracts positions from tables
func (p *HTMLTableParser) ParseTables(html string) ([]ParsedPosition, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return nil, err
	}

	var allPositions []ParsedPosition

	doc.Find("table").Each(func(_ int, table *goquery.Selection) {
		if p.isPositionTable(table) {
			positions := p.parseTable(table)
			allPositions = append(allPositions, positions...)
		}
	})

	if p.Logger != nil {
		p.Logger.Debug("HTML table parsing completed",
			zap.Int("tables_found", doc.Find("table").Length()),
			zap.Int("positions_extracted", len(allPositions)),
		)
	}

	return allPositions, nil
}

// isPositionTable checks if a table contains position data
func (p *HTMLTableParser) isPositionTable(table *goquery.Selection) bool {
	headerRow := table.Find("tr").First()
	headerText := headerRow.Text()

	matchCount := 0
	for _, keyword := range PositionTableKeywords {
		if strings.Contains(headerText, keyword) {
			matchCount++
		}
	}

	return matchCount >= 3
}

// parseTable parses a single table and extracts positions
func (p *HTMLTableParser) parseTable(table *goquery.Selection) []ParsedPosition {
	var positions []ParsedPosition

	// Get headers from first row
	var headers []string
	table.Find("tr").First().Find("th, td").Each(func(_ int, cell *goquery.Selection) {
		headers = append(headers, strings.TrimSpace(cell.Text()))
	})

	// Map headers to field names
	mappedHeaders := p.mapHeaders(headers)

	// Parse data rows
	table.Find("tr").Each(func(rowIdx int, row *goquery.Selection) {
		if rowIdx == 0 {
			return // Skip header row
		}

		position := ParsedPosition{
			ParseConfidence: 85,
		}
		hasData := false

		row.Find("td").Each(func(colIdx int, cell *goquery.Selection) {
			if colIdx >= len(mappedHeaders) || mappedHeaders[colIdx] == "" {
				return
			}

			fieldName := mappedHeaders[colIdx]
			value := strings.TrimSpace(cell.Text())

			if value == "" {
				return
			}

			hasData = true
			p.setPositionField(&position, fieldName, value)
		})

		if hasData && position.PositionName != "" {
			positions = append(positions, position)
		}
	})

	return positions
}

// mapHeaders maps table headers to standard field names
func (p *HTMLTableParser) mapHeaders(headers []string) []string {
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

		// If no match, use normalized header as field name
		if mapped[i] == "" {
			mapped[i] = normalizeFieldName(header)
		}
	}

	return mapped
}

// setPositionField sets a field on the position based on field name
func (p *HTMLTableParser) setPositionField(pos *ParsedPosition, fieldName, value string) {
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

// normalizeFieldName converts a Chinese field name to snake_case
func normalizeFieldName(name string) string {
	// Simple conversion - replace spaces with underscores and lowercase
	name = strings.ToLower(name)
	name = strings.ReplaceAll(name, " ", "_")
	return name
}

// extractNumber extracts a number from a string
func extractNumber(s string) string {
	re := regexp.MustCompile(`\d+`)
	match := re.FindString(s)
	if match != "" {
		return match
	}
	return "0"
}

// splitMajors splits a major requirement string into individual majors
func splitMajors(s string) []string {
	// Common separators
	separators := []string{"、", ",", ";", "/", "，", "；"}
	
	result := []string{s}
	for _, sep := range separators {
		var newResult []string
		for _, part := range result {
			newResult = append(newResult, strings.Split(part, sep)...)
		}
		result = newResult
	}

	// Clean and deduplicate
	seen := make(map[string]bool)
	var cleaned []string
	for _, major := range result {
		major = strings.TrimSpace(major)
		if major != "" && !seen[major] {
			seen[major] = true
			cleaned = append(cleaned, major)
		}
	}

	return cleaned
}

// normalizeGender normalizes gender requirement values
func normalizeGender(s string) string {
	s = strings.TrimSpace(s)
	if strings.Contains(s, "男") && !strings.Contains(s, "女") {
		return "男"
	}
	if strings.Contains(s, "女") && !strings.Contains(s, "男") {
		return "女"
	}
	if strings.Contains(s, "不限") || s == "" {
		return "不限"
	}
	return s
}
