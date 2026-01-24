package crawler

import (
	"time"

	"go.uber.org/zap"
)

// Position represents a crawled position
type Position struct {
	PositionName         string   `json:"position_name"`
	DepartmentName       string   `json:"department_name"`
	DepartmentCode       string   `json:"department_code,omitempty"`
	PositionCode         string   `json:"position_code,omitempty"`
	RecruitCount         int      `json:"recruit_count"`
	WorkLocation         string   `json:"work_location,omitempty"`
	WorkLocationProvince string   `json:"work_location_province,omitempty"`
	WorkLocationCity     string   `json:"work_location_city,omitempty"`
	EducationMin         string   `json:"education_min,omitempty"`
	DegreeRequired       *bool    `json:"degree_required,omitempty"`
	MajorSpecific        []string `json:"major_specific,omitempty"`
	MajorUnlimited       bool     `json:"major_unlimited"`
	PoliticalStatus      string   `json:"political_status,omitempty"`
	AgeMin               *int     `json:"age_min,omitempty"`
	AgeMax               *int     `json:"age_max,omitempty"`
	WorkExpYearsMin      *int     `json:"work_exp_years_min,omitempty"`
	GrassrootsExpYears   *int     `json:"grassroots_exp_years,omitempty"`
	HukouRequired        bool     `json:"hukou_required"`
	HukouProvinces       []string `json:"hukou_provinces,omitempty"`
	GenderRequired       string   `json:"gender_required,omitempty"`
	FreshGraduateOnly    bool     `json:"fresh_graduate_only"`
	OtherRequirements    string   `json:"other_requirements,omitempty"`
	Notes                string   `json:"notes,omitempty"`
	SourceURL            string   `json:"source_url"`
	AnnouncementID       uint     `json:"announcement_id"`
	AttachmentURL        string   `json:"attachment_url,omitempty"`
	ParseSource          string   `json:"parse_source"` // html_table, excel, pdf, word, ai
	ExamType             string   `json:"exam_type,omitempty"`
	ParseConfidence      int      `json:"parse_confidence"`
}

// PositionExtractionResult holds the result of position extraction
type PositionExtractionResult struct {
	Positions  []Position `json:"positions"`
	ExamInfo   *ExamInfo  `json:"exam_info,omitempty"`
	Confidence int        `json:"confidence"`
	Warnings   []string   `json:"warnings,omitempty"`
	Error      string     `json:"error,omitempty"`
}

// ExamInfo holds exam-related information extracted from announcements
type ExamInfo struct {
	ExamType           string `json:"exam_type"`
	RegistrationStart  string `json:"registration_start,omitempty"`
	RegistrationEnd    string `json:"registration_end,omitempty"`
	ExamDateWritten    string `json:"exam_date_written,omitempty"`
}

// PositionSpider handles position data extraction
type PositionSpider struct {
	Logger       *zap.Logger
	HTMLParser   HTMLTableParser
	ExcelParser  ExcelParser
	PDFParser    PDFParser
	WordParser   WordParser
	AIExtractor  AIPositionExtractor
}

// HTMLTableParser interface for HTML table parsing
type HTMLTableParser interface {
	ParseTables(html string) ([]Position, error)
}

// ExcelParser interface for Excel file parsing
type ExcelParser interface {
	Parse(filePath string) ([]Position, error)
}

// PDFParser interface for PDF file parsing
type PDFParser interface {
	Parse(filePath string) ([]Position, error)
	ExtractText(filePath string) (string, error)
}

// WordParser interface for Word file parsing
type WordParser interface {
	Parse(filePath string) ([]Position, error)
	ExtractText(filePath string) (string, error)
}

// AIPositionExtractor interface for AI-based position extraction
type AIPositionExtractor interface {
	ExtractPositions(content string) (*PositionExtractionResult, error)
	IdentifyAnnouncementType(title, content string) (string, int, error)
}

// NewPositionSpider creates a new position spider
func NewPositionSpider(logger *zap.Logger) *PositionSpider {
	return &PositionSpider{
		Logger: logger,
	}
}

// SetHTMLParser sets the HTML table parser
func (s *PositionSpider) SetHTMLParser(parser HTMLTableParser) {
	s.HTMLParser = parser
}

// SetExcelParser sets the Excel parser
func (s *PositionSpider) SetExcelParser(parser ExcelParser) {
	s.ExcelParser = parser
}

// SetPDFParser sets the PDF parser
func (s *PositionSpider) SetPDFParser(parser PDFParser) {
	s.PDFParser = parser
}

// SetWordParser sets the Word parser
func (s *PositionSpider) SetWordParser(parser WordParser) {
	s.WordParser = parser
}

// SetAIExtractor sets the AI extractor
func (s *PositionSpider) SetAIExtractor(extractor AIPositionExtractor) {
	s.AIExtractor = extractor
}

// ExtractFromAnnouncement extracts positions from an announcement
func (s *PositionSpider) ExtractFromAnnouncement(announcement *Announcement) (*PositionExtractionResult, error) {
	startTime := time.Now()
	result := &PositionExtractionResult{
		Positions: make([]Position, 0),
		Warnings:  make([]string, 0),
	}

	// Try HTML table extraction first
	if s.HTMLParser != nil && announcement.ContentHTML != "" {
		positions, err := s.HTMLParser.ParseTables(announcement.ContentHTML)
		if err == nil && len(positions) > 0 {
			for i := range positions {
				positions[i].SourceURL = announcement.URL
				positions[i].ParseSource = "html_table"
				positions[i].ParseConfidence = 90
			}
			result.Positions = append(result.Positions, positions...)
			s.Logger.Info("Extracted positions from HTML tables",
				zap.String("url", announcement.URL),
				zap.Int("count", len(positions)),
			)
		}
	}

	// Try extracting from attachments
	for _, attachment := range announcement.Attachments {
		if attachment.LocalPath == "" {
			continue
		}

		var positions []Position
		var err error

		switch attachment.Type {
		case "excel":
			if s.ExcelParser != nil {
				positions, err = s.ExcelParser.Parse(attachment.LocalPath)
			}
		case "pdf":
			if s.PDFParser != nil {
				positions, err = s.PDFParser.Parse(attachment.LocalPath)
			}
		case "word":
			if s.WordParser != nil {
				positions, err = s.WordParser.Parse(attachment.LocalPath)
			}
		}

		if err != nil {
			result.Warnings = append(result.Warnings, "Failed to parse "+attachment.Name+": "+err.Error())
			continue
		}

		if len(positions) > 0 {
			for i := range positions {
				positions[i].SourceURL = announcement.URL
				positions[i].AttachmentURL = attachment.URL
				positions[i].ParseSource = attachment.Type
				positions[i].ParseConfidence = 85
			}
			result.Positions = append(result.Positions, positions...)
			s.Logger.Info("Extracted positions from attachment",
				zap.String("file", attachment.Name),
				zap.Int("count", len(positions)),
			)
		}
	}

	// If no positions found, try AI extraction
	if len(result.Positions) == 0 && s.AIExtractor != nil && announcement.Content != "" {
		aiResult, err := s.AIExtractor.ExtractPositions(announcement.Content)
		if err != nil {
			result.Warnings = append(result.Warnings, "AI extraction failed: "+err.Error())
		} else if aiResult != nil {
			for i := range aiResult.Positions {
				aiResult.Positions[i].SourceURL = announcement.URL
				aiResult.Positions[i].ParseSource = "ai"
			}
			result.Positions = append(result.Positions, aiResult.Positions...)
			result.ExamInfo = aiResult.ExamInfo
			result.Warnings = append(result.Warnings, aiResult.Warnings...)
			s.Logger.Info("Extracted positions using AI",
				zap.String("url", announcement.URL),
				zap.Int("count", len(aiResult.Positions)),
				zap.Int("confidence", aiResult.Confidence),
			)
		}
	}

	// Calculate overall confidence
	if len(result.Positions) > 0 {
		totalConfidence := 0
		for _, pos := range result.Positions {
			totalConfidence += pos.ParseConfidence
		}
		result.Confidence = totalConfidence / len(result.Positions)
	}

	s.Logger.Info("Position extraction completed",
		zap.String("url", announcement.URL),
		zap.Int("total_positions", len(result.Positions)),
		zap.Int("confidence", result.Confidence),
		zap.Duration("duration", time.Since(startTime)),
	)

	return result, nil
}

// ExtractFromAttachment extracts positions from a single attachment
func (s *PositionSpider) ExtractFromAttachment(attachment *Attachment, announcementID uint, sourceURL string) ([]Position, error) {
	if attachment.LocalPath == "" {
		return nil, nil
	}

	var positions []Position
	var err error

	switch attachment.Type {
	case "excel":
		if s.ExcelParser != nil {
			positions, err = s.ExcelParser.Parse(attachment.LocalPath)
		}
	case "pdf":
		if s.PDFParser != nil {
			positions, err = s.PDFParser.Parse(attachment.LocalPath)
		}
	case "word":
		if s.WordParser != nil {
			positions, err = s.WordParser.Parse(attachment.LocalPath)
		}
	}

	if err != nil {
		return nil, err
	}

	// Set common fields
	for i := range positions {
		positions[i].SourceURL = sourceURL
		positions[i].AnnouncementID = announcementID
		positions[i].AttachmentURL = attachment.URL
		positions[i].ParseSource = attachment.Type
	}

	return positions, nil
}
