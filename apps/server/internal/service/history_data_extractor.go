package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"go.uber.org/zap"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrExtractionFailed    = errors.New("extraction failed")
	ErrNoHistoricalData    = errors.New("no historical data found")
	ErrInvalidSourceFormat = errors.New("invalid source format")
)

// =====================================================
// 历年数据提取服务
// =====================================================

// HistoryDataExtractorService 历年数据提取服务
type HistoryDataExtractorService struct {
	historyRepo      *repository.PositionHistoryRepository
	llmConfigService *LLMConfigService
	logger           *zap.Logger
}

// NewHistoryDataExtractorService 创建历年数据提取服务实例
func NewHistoryDataExtractorService(
	historyRepo *repository.PositionHistoryRepository,
	llmConfigService *LLMConfigService,
	logger *zap.Logger,
) *HistoryDataExtractorService {
	return &HistoryDataExtractorService{
		historyRepo:      historyRepo,
		llmConfigService: llmConfigService,
		logger:           logger,
	}
}

// =====================================================
// Prompt 模板定义
// =====================================================

// 历年数据提取 Prompt 模板
const HistoryDataExtractionPrompt = `你是一个专业的公务员考试数据提取助手。请从以下文本内容中提取历年招录数据。

## 提取要求

1. **分数线数据**：提取面试分数线、笔试分数线、最终录取分数线
2. **竞争比数据**：提取报名人数、过审人数、招录人数，计算竞争比
3. **年份信息**：明确数据所属年份
4. **职位信息**：提取职位名称、单位名称、职位代码（如有）

## 输入内容

{{.Content}}

## 输出格式

请以 JSON 格式输出提取的数据，格式如下：
{
  "records": [
    {
      "year": 2024,
      "position_name": "职位名称",
      "position_code": "职位代码（如有）",
      "department_name": "单位名称",
      "recruit_count": 1,
      "apply_count": 100,
      "pass_count": 80,
      "competition_ratio": 80.0,
      "interview_score": 135.5,
      "written_score": 120.0,
      "final_score": 145.0,
      "exam_type": "国考/省考/事业单位",
      "province": "省份",
      "city": "城市",
      "remark": "备注信息"
    }
  ],
  "summary": {
    "total_records": 1,
    "years_covered": [2024],
    "data_quality": "high/medium/low",
    "notes": "提取说明"
  }
}

## 注意事项

1. 如果某项数据无法提取，设为 null 或 0
2. 竞争比 = 报名人数 / 招录人数（如无报名人数，使用过审人数计算）
3. 分数请保留一位小数
4. 年份请使用四位数字格式（如 2024）
5. 如果文本中没有任何可提取的历年数据，返回空的 records 数组

请只输出 JSON，不要有其他文字说明。`

// 分数线专项提取 Prompt
const ScoreLineExtractionPrompt = `你是一个专业的公务员考试分数线数据提取助手。请从以下内容中专门提取分数线相关数据。

## 提取目标

1. **进面分数线**：考生进入面试的最低分数
2. **笔试分数线**：笔试合格分数线
3. **最终录取分数线**：最终被录取的考生分数线
4. **分数线类型**：区分是最低分、最高分还是平均分

## 输入内容

{{.Content}}

## 输出格式

{
  "score_lines": [
    {
      "year": 2024,
      "position_name": "职位名称",
      "department_name": "单位名称",
      "exam_type": "考试类型",
      "province": "省份",
      "interview_score": {
        "min": 130.5,
        "max": 145.0,
        "avg": 138.0
      },
      "written_score": {
        "min": 110.0,
        "max": 125.0,
        "avg": 118.0
      },
      "final_score": {
        "min": 140.0,
        "max": 155.0,
        "avg": 148.0
      },
      "recruit_count": 2,
      "source": "数据来源说明"
    }
  ],
  "extraction_quality": "high/medium/low",
  "notes": "提取说明或特殊情况"
}

请只输出 JSON，不要有其他文字说明。`

// 竞争比专项提取 Prompt
const CompetitionRatioExtractionPrompt = `你是一个专业的公务员考试竞争比数据提取助手。请从以下内容中专门提取竞争比相关数据。

## 提取目标

1. **报名人数**：该职位的报名总人数
2. **过审人数**：通过资格审查的人数
3. **招录人数**：该职位的招录计划人数
4. **竞争比**：报名人数/招录人数 或 过审人数/招录人数

## 输入内容

{{.Content}}

## 输出格式

{
  "competition_data": [
    {
      "year": 2024,
      "position_name": "职位名称",
      "position_code": "职位代码",
      "department_name": "单位名称",
      "exam_type": "考试类型",
      "province": "省份",
      "recruit_count": 1,
      "apply_count": 500,
      "pass_count": 450,
      "competition_ratio": 500.0,
      "competition_type": "报名竞争比/过审竞争比",
      "data_time": "数据采集时间点（如报名截止日期）",
      "is_final": true,
      "source": "数据来源说明"
    }
  ],
  "statistics": {
    "total_positions": 1,
    "avg_competition_ratio": 500.0,
    "max_competition_ratio": 500.0,
    "min_competition_ratio": 500.0,
    "zero_apply_count": 0
  },
  "extraction_quality": "high/medium/low",
  "notes": "提取说明"
}

请只输出 JSON，不要有其他文字说明。`

// =====================================================
// 数据提取结构体
// =====================================================

// ExtractedHistoryRecord 提取的历年记录
type ExtractedHistoryRecord struct {
	Year             int     `json:"year"`
	PositionName     string  `json:"position_name"`
	PositionCode     string  `json:"position_code"`
	DepartmentName   string  `json:"department_name"`
	RecruitCount     int     `json:"recruit_count"`
	ApplyCount       int     `json:"apply_count"`
	PassCount        int     `json:"pass_count"`
	CompetitionRatio float64 `json:"competition_ratio"`
	InterviewScore   float64 `json:"interview_score"`
	WrittenScore     float64 `json:"written_score"`
	FinalScore       float64 `json:"final_score"`
	ExamType         string  `json:"exam_type"`
	Province         string  `json:"province"`
	City             string  `json:"city"`
	Remark           string  `json:"remark"`
}

// ExtractionSummary 提取摘要
type ExtractionSummary struct {
	TotalRecords int    `json:"total_records"`
	YearsCovered []int  `json:"years_covered"`
	DataQuality  string `json:"data_quality"`
	Notes        string `json:"notes"`
}

// HistoryExtractionResult 历史数据提取结果
type HistoryExtractionResult struct {
	Records []ExtractedHistoryRecord `json:"records"`
	Summary ExtractionSummary        `json:"summary"`
}

// ScoreData 分数数据
type ScoreData struct {
	Min float64 `json:"min"`
	Max float64 `json:"max"`
	Avg float64 `json:"avg"`
}

// ScoreLineRecord 分数线记录
type ScoreLineRecord struct {
	Year           int       `json:"year"`
	PositionName   string    `json:"position_name"`
	DepartmentName string    `json:"department_name"`
	ExamType       string    `json:"exam_type"`
	Province       string    `json:"province"`
	InterviewScore ScoreData `json:"interview_score"`
	WrittenScore   ScoreData `json:"written_score"`
	FinalScore     ScoreData `json:"final_score"`
	RecruitCount   int       `json:"recruit_count"`
	Source         string    `json:"source"`
}

// ScoreLineExtractionResult 分数线提取结果
type ScoreLineExtractionResult struct {
	ScoreLines        []ScoreLineRecord `json:"score_lines"`
	ExtractionQuality string            `json:"extraction_quality"`
	Notes             string            `json:"notes"`
}

// CompetitionRecord 竞争比记录
type CompetitionRecord struct {
	Year             int     `json:"year"`
	PositionName     string  `json:"position_name"`
	PositionCode     string  `json:"position_code"`
	DepartmentName   string  `json:"department_name"`
	ExamType         string  `json:"exam_type"`
	Province         string  `json:"province"`
	RecruitCount     int     `json:"recruit_count"`
	ApplyCount       int     `json:"apply_count"`
	PassCount        int     `json:"pass_count"`
	CompetitionRatio float64 `json:"competition_ratio"`
	CompetitionType  string  `json:"competition_type"`
	DataTime         string  `json:"data_time"`
	IsFinal          bool    `json:"is_final"`
	Source           string  `json:"source"`
}

// CompetitionStatistics 竞争比统计
type CompetitionStatistics struct {
	TotalPositions      int     `json:"total_positions"`
	AvgCompetitionRatio float64 `json:"avg_competition_ratio"`
	MaxCompetitionRatio float64 `json:"max_competition_ratio"`
	MinCompetitionRatio float64 `json:"min_competition_ratio"`
	ZeroApplyCount      int     `json:"zero_apply_count"`
}

// CompetitionExtractionResult 竞争比提取结果
type CompetitionExtractionResult struct {
	CompetitionData   []CompetitionRecord   `json:"competition_data"`
	Statistics        CompetitionStatistics `json:"statistics"`
	ExtractionQuality string                `json:"extraction_quality"`
	Notes             string                `json:"notes"`
}

// =====================================================
// 提取方法
// =====================================================

// ExtractHistoryData 提取历年数据（通用）
func (s *HistoryDataExtractorService) ExtractHistoryData(ctx context.Context, content string) (*HistoryExtractionResult, error) {
	if content == "" {
		return nil, ErrInvalidSourceFormat
	}

	// 构建 Prompt
	prompt := strings.Replace(HistoryDataExtractionPrompt, "{{.Content}}", content, 1)

	// 调用 LLM
	response, err := s.callLLM(ctx, prompt)
	if err != nil {
		s.logger.Error("LLM call failed", zap.Error(err))
		return nil, fmt.Errorf("%w: %v", ErrExtractionFailed, err)
	}

	// 解析结果
	var result HistoryExtractionResult
	if err := json.Unmarshal([]byte(response), &result); err != nil {
		s.logger.Error("Failed to parse extraction result", zap.Error(err), zap.String("response", response))
		// 尝试使用正则提取
		result = s.fallbackExtraction(content)
	}

	// 数据清洗和验证
	result = s.cleanAndValidate(result)

	return &result, nil
}

// ExtractScoreLines 提取分数线数据
func (s *HistoryDataExtractorService) ExtractScoreLines(ctx context.Context, content string) (*ScoreLineExtractionResult, error) {
	if content == "" {
		return nil, ErrInvalidSourceFormat
	}

	// 构建 Prompt
	prompt := strings.Replace(ScoreLineExtractionPrompt, "{{.Content}}", content, 1)

	// 调用 LLM
	response, err := s.callLLM(ctx, prompt)
	if err != nil {
		s.logger.Error("LLM call failed for score line extraction", zap.Error(err))
		return nil, fmt.Errorf("%w: %v", ErrExtractionFailed, err)
	}

	// 解析结果
	var result ScoreLineExtractionResult
	if err := json.Unmarshal([]byte(response), &result); err != nil {
		s.logger.Error("Failed to parse score line result", zap.Error(err))
		// 尝试使用正则提取分数
		result = s.fallbackScoreExtraction(content)
	}

	return &result, nil
}

// ExtractCompetitionRatio 提取竞争比数据
func (s *HistoryDataExtractorService) ExtractCompetitionRatio(ctx context.Context, content string) (*CompetitionExtractionResult, error) {
	if content == "" {
		return nil, ErrInvalidSourceFormat
	}

	// 构建 Prompt
	prompt := strings.Replace(CompetitionRatioExtractionPrompt, "{{.Content}}", content, 1)

	// 调用 LLM
	response, err := s.callLLM(ctx, prompt)
	if err != nil {
		s.logger.Error("LLM call failed for competition ratio extraction", zap.Error(err))
		return nil, fmt.Errorf("%w: %v", ErrExtractionFailed, err)
	}

	// 解析结果
	var result CompetitionExtractionResult
	if err := json.Unmarshal([]byte(response), &result); err != nil {
		s.logger.Error("Failed to parse competition ratio result", zap.Error(err))
		// 尝试使用正则提取竞争比
		result = s.fallbackCompetitionExtraction(content)
	}

	return &result, nil
}

// =====================================================
// 保存提取结果
// =====================================================

// SaveExtractedData 保存提取的历年数据
func (s *HistoryDataExtractorService) SaveExtractedData(result *HistoryExtractionResult, source, sourceURL string) (int, error) {
	if result == nil || len(result.Records) == 0 {
		return 0, ErrNoHistoricalData
	}

	savedCount := 0
	for _, record := range result.Records {
		history := &model.PositionHistory{
			PositionCode:     record.PositionCode,
			PositionName:     record.PositionName,
			DepartmentName:   record.DepartmentName,
			Year:             record.Year,
			RecruitCount:     record.RecruitCount,
			ApplyCount:       record.ApplyCount,
			PassCount:        record.PassCount,
			CompetitionRatio: record.CompetitionRatio,
			InterviewScore:   record.InterviewScore,
			WrittenScore:     record.WrittenScore,
			FinalScore:       record.FinalScore,
			ExamType:         record.ExamType,
			Province:         record.Province,
			City:             record.City,
			Source:           source,
			SourceURL:        sourceURL,
			Remark:           record.Remark,
		}

		// 自动计算竞争比（如果没有）
		if history.CompetitionRatio == 0 && history.RecruitCount > 0 {
			if history.ApplyCount > 0 {
				history.CompetitionRatio = float64(history.ApplyCount) / float64(history.RecruitCount)
			} else if history.PassCount > 0 {
				history.CompetitionRatio = float64(history.PassCount) / float64(history.RecruitCount)
			}
		}

		if err := s.historyRepo.Create(history); err != nil {
			s.logger.Error("Failed to save history record", zap.Error(err))
			continue
		}
		savedCount++
	}

	return savedCount, nil
}

// SaveScoreLineData 保存分数线数据
func (s *HistoryDataExtractorService) SaveScoreLineData(result *ScoreLineExtractionResult, source, sourceURL string) (int, error) {
	if result == nil || len(result.ScoreLines) == 0 {
		return 0, ErrNoHistoricalData
	}

	savedCount := 0
	for _, record := range result.ScoreLines {
		history := &model.PositionHistory{
			PositionName:   record.PositionName,
			DepartmentName: record.DepartmentName,
			Year:           record.Year,
			RecruitCount:   record.RecruitCount,
			InterviewScore: record.InterviewScore.Avg,
			WrittenScore:   record.WrittenScore.Avg,
			FinalScore:     record.FinalScore.Avg,
			ExamType:       record.ExamType,
			Province:       record.Province,
			Source:         source,
			SourceURL:      sourceURL,
			Remark:         fmt.Sprintf("分数范围: 面试[%.1f-%.1f] 笔试[%.1f-%.1f]", record.InterviewScore.Min, record.InterviewScore.Max, record.WrittenScore.Min, record.WrittenScore.Max),
		}

		if err := s.historyRepo.Create(history); err != nil {
			s.logger.Error("Failed to save score line record", zap.Error(err))
			continue
		}
		savedCount++
	}

	return savedCount, nil
}

// SaveCompetitionData 保存竞争比数据
func (s *HistoryDataExtractorService) SaveCompetitionData(result *CompetitionExtractionResult, source, sourceURL string) (int, error) {
	if result == nil || len(result.CompetitionData) == 0 {
		return 0, ErrNoHistoricalData
	}

	savedCount := 0
	for _, record := range result.CompetitionData {
		history := &model.PositionHistory{
			PositionCode:     record.PositionCode,
			PositionName:     record.PositionName,
			DepartmentName:   record.DepartmentName,
			Year:             record.Year,
			RecruitCount:     record.RecruitCount,
			ApplyCount:       record.ApplyCount,
			PassCount:        record.PassCount,
			CompetitionRatio: record.CompetitionRatio,
			ExamType:         record.ExamType,
			Province:         record.Province,
			Source:           source,
			SourceURL:        sourceURL,
			Remark:           fmt.Sprintf("%s, 数据时间: %s, 是否最终数据: %v", record.CompetitionType, record.DataTime, record.IsFinal),
		}

		if err := s.historyRepo.Create(history); err != nil {
			s.logger.Error("Failed to save competition data record", zap.Error(err))
			continue
		}
		savedCount++
	}

	return savedCount, nil
}

// =====================================================
// 辅助方法
// =====================================================

// callLLM 调用 LLM 服务
func (s *HistoryDataExtractorService) callLLM(ctx context.Context, prompt string) (string, error) {
	_ = ctx // context 用于未来扩展

	// 使用默认配置调用 LLM，设置 60 秒超时，4096 tokens
	response, err := s.llmConfigService.CallWithOptions(prompt, 60, 4096)
	if err != nil {
		return "", fmt.Errorf("failed to call LLM: %w", err)
	}

	// 清理响应（移除可能的 markdown 代码块标记）
	response = strings.TrimPrefix(response, "```json")
	response = strings.TrimPrefix(response, "```")
	response = strings.TrimSuffix(response, "```")
	response = strings.TrimSpace(response)

	return response, nil
}

// cleanAndValidate 清洗和验证提取结果
func (s *HistoryDataExtractorService) cleanAndValidate(result HistoryExtractionResult) HistoryExtractionResult {
	validRecords := []ExtractedHistoryRecord{}

	for _, record := range result.Records {
		// 验证必要字段
		if record.Year < 1990 || record.Year > 2100 {
			continue
		}
		if record.PositionName == "" && record.DepartmentName == "" {
			continue
		}

		// 清洗数据
		record.PositionName = strings.TrimSpace(record.PositionName)
		record.DepartmentName = strings.TrimSpace(record.DepartmentName)
		record.ExamType = normalizeExamType(record.ExamType)
		record.Province = normalizeProvince(record.Province)

		// 修正竞争比
		if record.CompetitionRatio <= 0 && record.RecruitCount > 0 && record.ApplyCount > 0 {
			record.CompetitionRatio = float64(record.ApplyCount) / float64(record.RecruitCount)
		}

		validRecords = append(validRecords, record)
	}

	result.Records = validRecords
	result.Summary.TotalRecords = len(validRecords)

	// 更新年份覆盖
	yearsMap := make(map[int]bool)
	for _, r := range validRecords {
		yearsMap[r.Year] = true
	}
	years := []int{}
	for y := range yearsMap {
		years = append(years, y)
	}
	result.Summary.YearsCovered = years

	return result
}

// fallbackExtraction 备用提取方法（使用正则）
func (s *HistoryDataExtractorService) fallbackExtraction(content string) HistoryExtractionResult {
	result := HistoryExtractionResult{
		Records: []ExtractedHistoryRecord{},
		Summary: ExtractionSummary{
			DataQuality: "low",
			Notes:       "使用正则表达式备用提取",
		},
	}

	// 提取年份
	yearPattern := regexp.MustCompile(`(20\d{2})年`)
	years := yearPattern.FindAllStringSubmatch(content, -1)

	// 提取分数
	scorePattern := regexp.MustCompile(`(\d{2,3}(?:\.\d{1,2})?)\s*分`)
	scores := scorePattern.FindAllStringSubmatch(content, -1)

	// 提取竞争比
	ratioPattern := regexp.MustCompile(`(\d+(?:\.\d{1,2})?)\s*[:：]\s*1`)
	ratios := ratioPattern.FindAllStringSubmatch(content, -1)

	// 提取人数
	countPattern := regexp.MustCompile(`(\d+)\s*人`)
	counts := countPattern.FindAllStringSubmatch(content, -1)

	// 如果提取到任何数据，构建记录
	if len(years) > 0 || len(scores) > 0 || len(ratios) > 0 {
		record := ExtractedHistoryRecord{
			Remark: "正则提取的原始数据",
		}

		// 设置年份
		if len(years) > 0 {
			year, _ := strconv.Atoi(years[0][1])
			record.Year = year
		}

		// 设置分数（假设第一个是面试分数）
		if len(scores) > 0 {
			score, _ := strconv.ParseFloat(scores[0][1], 64)
			record.InterviewScore = score
		}
		if len(scores) > 1 {
			score, _ := strconv.ParseFloat(scores[1][1], 64)
			record.WrittenScore = score
		}

		// 设置竞争比
		if len(ratios) > 0 {
			ratio, _ := strconv.ParseFloat(ratios[0][1], 64)
			record.CompetitionRatio = ratio
		}

		// 设置人数
		if len(counts) > 0 {
			count, _ := strconv.Atoi(counts[0][1])
			record.ApplyCount = count
		}

		if record.Year > 0 || record.InterviewScore > 0 || record.CompetitionRatio > 0 {
			result.Records = append(result.Records, record)
		}
	}

	result.Summary.TotalRecords = len(result.Records)
	return result
}

// fallbackScoreExtraction 备用分数线提取
func (s *HistoryDataExtractorService) fallbackScoreExtraction(content string) ScoreLineExtractionResult {
	result := ScoreLineExtractionResult{
		ScoreLines:        []ScoreLineRecord{},
		ExtractionQuality: "low",
		Notes:             "使用正则表达式备用提取",
	}

	// 提取年份
	yearPattern := regexp.MustCompile(`(20\d{2})年`)
	yearMatches := yearPattern.FindAllStringSubmatch(content, -1)

	// 提取各种分数
	interviewPattern := regexp.MustCompile(`面试[分线]?[：:]*\s*(\d{2,3}(?:\.\d{1,2})?)`)
	writtenPattern := regexp.MustCompile(`笔试[分线]?[：:]*\s*(\d{2,3}(?:\.\d{1,2})?)`)
	finalPattern := regexp.MustCompile(`[最终录取总][分线]?[：:]*\s*(\d{2,3}(?:\.\d{1,2})?)`)

	record := ScoreLineRecord{}

	if len(yearMatches) > 0 {
		year, _ := strconv.Atoi(yearMatches[0][1])
		record.Year = year
	}

	if matches := interviewPattern.FindStringSubmatch(content); len(matches) > 1 {
		score, _ := strconv.ParseFloat(matches[1], 64)
		record.InterviewScore = ScoreData{Min: score, Max: score, Avg: score}
	}

	if matches := writtenPattern.FindStringSubmatch(content); len(matches) > 1 {
		score, _ := strconv.ParseFloat(matches[1], 64)
		record.WrittenScore = ScoreData{Min: score, Max: score, Avg: score}
	}

	if matches := finalPattern.FindStringSubmatch(content); len(matches) > 1 {
		score, _ := strconv.ParseFloat(matches[1], 64)
		record.FinalScore = ScoreData{Min: score, Max: score, Avg: score}
	}

	if record.Year > 0 || record.InterviewScore.Avg > 0 || record.WrittenScore.Avg > 0 {
		result.ScoreLines = append(result.ScoreLines, record)
	}

	return result
}

// fallbackCompetitionExtraction 备用竞争比提取
func (s *HistoryDataExtractorService) fallbackCompetitionExtraction(content string) CompetitionExtractionResult {
	result := CompetitionExtractionResult{
		CompetitionData:   []CompetitionRecord{},
		Statistics:        CompetitionStatistics{},
		ExtractionQuality: "low",
		Notes:             "使用正则表达式备用提取",
	}

	// 提取年份
	yearPattern := regexp.MustCompile(`(20\d{2})年`)
	yearMatches := yearPattern.FindAllStringSubmatch(content, -1)

	// 提取竞争比
	ratioPattern := regexp.MustCompile(`竞争比[：:]*\s*(\d+(?:\.\d{1,2})?)\s*[:：]\s*1`)
	simpleRatioPattern := regexp.MustCompile(`(\d+(?:\.\d{1,2})?)\s*[:：]\s*1`)

	// 提取人数
	applyPattern := regexp.MustCompile(`报名[人数]*[：:]*\s*(\d+)`)
	passPattern := regexp.MustCompile(`过审[人数]*[：:]*\s*(\d+)`)
	recruitPattern := regexp.MustCompile(`招录?[人数计划]*[：:]*\s*(\d+)`)

	record := CompetitionRecord{}

	if len(yearMatches) > 0 {
		year, _ := strconv.Atoi(yearMatches[0][1])
		record.Year = year
	}

	// 提取竞争比
	if matches := ratioPattern.FindStringSubmatch(content); len(matches) > 1 {
		ratio, _ := strconv.ParseFloat(matches[1], 64)
		record.CompetitionRatio = ratio
	} else if matches := simpleRatioPattern.FindStringSubmatch(content); len(matches) > 1 {
		ratio, _ := strconv.ParseFloat(matches[1], 64)
		record.CompetitionRatio = ratio
	}

	// 提取人数
	if matches := applyPattern.FindStringSubmatch(content); len(matches) > 1 {
		count, _ := strconv.Atoi(matches[1])
		record.ApplyCount = count
	}

	if matches := passPattern.FindStringSubmatch(content); len(matches) > 1 {
		count, _ := strconv.Atoi(matches[1])
		record.PassCount = count
	}

	if matches := recruitPattern.FindStringSubmatch(content); len(matches) > 1 {
		count, _ := strconv.Atoi(matches[1])
		record.RecruitCount = count
	}

	// 计算竞争比（如果没有直接提取到）
	if record.CompetitionRatio == 0 && record.RecruitCount > 0 {
		if record.ApplyCount > 0 {
			record.CompetitionRatio = float64(record.ApplyCount) / float64(record.RecruitCount)
			record.CompetitionType = "报名竞争比"
		} else if record.PassCount > 0 {
			record.CompetitionRatio = float64(record.PassCount) / float64(record.RecruitCount)
			record.CompetitionType = "过审竞争比"
		}
	}

	if record.Year > 0 || record.CompetitionRatio > 0 || record.ApplyCount > 0 {
		result.CompetitionData = append(result.CompetitionData, record)
	}

	// 计算统计数据
	if len(result.CompetitionData) > 0 {
		result.Statistics.TotalPositions = len(result.CompetitionData)
		var totalRatio float64
		for _, r := range result.CompetitionData {
			totalRatio += r.CompetitionRatio
			if r.CompetitionRatio > result.Statistics.MaxCompetitionRatio {
				result.Statistics.MaxCompetitionRatio = r.CompetitionRatio
			}
			if result.Statistics.MinCompetitionRatio == 0 || r.CompetitionRatio < result.Statistics.MinCompetitionRatio {
				result.Statistics.MinCompetitionRatio = r.CompetitionRatio
			}
			if r.ApplyCount == 0 {
				result.Statistics.ZeroApplyCount++
			}
		}
		result.Statistics.AvgCompetitionRatio = totalRatio / float64(len(result.CompetitionData))
	}

	return result
}

// normalizeExamType 标准化考试类型
func normalizeExamType(examType string) string {
	examType = strings.TrimSpace(strings.ToLower(examType))
	if strings.Contains(examType, "国考") || strings.Contains(examType, "国家") {
		return "国考"
	}
	if strings.Contains(examType, "省考") || strings.Contains(examType, "联考") {
		return "省考"
	}
	if strings.Contains(examType, "事业") {
		return "事业单位"
	}
	if strings.Contains(examType, "选调") {
		return "选调生"
	}
	return examType
}

// normalizeProvince 标准化省份名称
func normalizeProvince(province string) string {
	province = strings.TrimSpace(province)
	// 移除"省"、"市"、"自治区"等后缀
	suffixes := []string{"省", "市", "自治区", "特别行政区", "维吾尔", "壮族", "回族"}
	for _, suffix := range suffixes {
		province = strings.TrimSuffix(province, suffix)
	}
	return province
}
