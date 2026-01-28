package service

import (
	"fmt"
	"regexp"
	"strings"
	"time"
	"unicode"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"gorm.io/gorm"
)

// ContentQualityService 内容质量检查服务
type ContentQualityService struct {
	db           *gorm.DB
	questionRepo *repository.QuestionRepository
	courseRepo   *repository.CourseRepository
}

// NewContentQualityService 创建内容质量检查服务
func NewContentQualityService(
	db *gorm.DB,
	questionRepo *repository.QuestionRepository,
	courseRepo *repository.CourseRepository,
) *ContentQualityService {
	return &ContentQualityService{
		db:           db,
		questionRepo: questionRepo,
		courseRepo:   courseRepo,
	}
}

// =====================================================
// 质量检查结果模型
// =====================================================

// QualityCheckResult 质量检查结果
type QualityCheckResult struct {
	ID         uint       `json:"id" gorm:"primaryKey"`
	CheckType  string     `json:"check_type"`  // typo, format, duplicate, coverage, difficulty
	TargetType string     `json:"target_type"` // question, course, material
	TargetID   uint       `json:"target_id"`
	Severity   string     `json:"severity"` // error, warning, info
	Message    string     `json:"message"`
	Suggestion string     `json:"suggestion,omitempty"`
	IsResolved bool       `json:"is_resolved" gorm:"default:false"`
	ResolvedAt *time.Time `json:"resolved_at,omitempty"`
	ResolvedBy *uint      `json:"resolved_by,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

func (QualityCheckResult) TableName() string {
	return "what_content_quality_results"
}

// =====================================================
// 质量检查请求
// =====================================================

// QualityCheckRequest 质量检查请求
type QualityCheckRequest struct {
	CheckType  string `json:"check_type" binding:"required"` // typo, format, duplicate, coverage, difficulty
	TargetType string `json:"target_type,omitempty"`         // question, course, material, all
	Limit      int    `json:"limit,omitempty"`               // 检查数量限制
}

// QualityCheckTaskResult 检查任务结果
type QualityCheckTaskResult struct {
	TotalChecked int `json:"total_checked"`
	IssuesFound  int `json:"issues_found"`
	ErrorCount   int `json:"error_count"`
	WarningCount int `json:"warning_count"`
	InfoCount    int `json:"info_count"`
}

// =====================================================
// 检查任务入口
// =====================================================

// RunQualityCheck 运行质量检查
func (s *ContentQualityService) RunQualityCheck(req *QualityCheckRequest, createdBy uint) (*model.ContentGeneratorTask, error) {
	// 创建任务
	task := &model.ContentGeneratorTask{
		TaskType:     "quality_check",
		Status:       model.TaskStatusPending,
		Subject:      req.CheckType,
		TemplateName: fmt.Sprintf("%s质量检查", getCheckTypeName(req.CheckType)),
		CreatedBy:    createdBy,
	}

	if err := s.db.Create(task).Error; err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	// 异步执行检查
	go func() {
		now := time.Now()
		task.Status = model.TaskStatusProcessing
		task.StartedAt = &now
		s.db.Save(task)

		var result QualityCheckTaskResult

		switch req.CheckType {
		case "typo":
			result = s.runTypoCheck(req)
		case "format":
			result = s.runFormatCheck(req)
		case "duplicate":
			result = s.runDuplicateCheck(req)
		case "coverage":
			result = s.runCoverageCheck(req)
		case "difficulty":
			result = s.runDifficultyCheck(req)
		default:
			task.ErrorMessage = "未知的检查类型"
			task.Status = model.TaskStatusFailed
			s.db.Save(task)
			return
		}

		task.TotalItems = result.TotalChecked
		task.ProcessedItems = result.TotalChecked
		task.SuccessItems = result.TotalChecked - result.IssuesFound
		task.FailedItems = result.IssuesFound

		if result.ErrorCount > 0 {
			task.ErrorMessage = fmt.Sprintf("发现 %d 个错误, %d 个警告, %d 个提示",
				result.ErrorCount, result.WarningCount, result.InfoCount)
		}

		completed := time.Now()
		task.CompletedAt = &completed
		task.Status = model.TaskStatusCompleted

		s.db.Save(task)
	}()

	return task, nil
}

// =====================================================
// 错别字检查
// =====================================================

func (s *ContentQualityService) runTypoCheck(req *QualityCheckRequest) QualityCheckTaskResult {
	result := QualityCheckTaskResult{}

	// 获取题目列表
	limit := 100
	if req.Limit > 0 {
		limit = req.Limit
	}

	var questions []model.Question
	s.db.Limit(limit).Find(&questions)

	result.TotalChecked = len(questions)

	// 常见错别字映射
	typoMap := map[string]string{
		"的地得": "的/地/得使用可能有误",
		"做作":  "做/作使用可能有误",
		"在再":  "在/再使用可能有误",
		"已以":  "已/以使用可能有误",
		"象像":  "象/像使用可能有误",
	}

	for _, q := range questions {
		// 检查题目内容
		for typo, msg := range typoMap {
			if containsAnyChar(q.Content, typo) {
				s.saveQualityResult(&QualityCheckResult{
					CheckType:  "typo",
					TargetType: "question",
					TargetID:   q.ID,
					Severity:   "warning",
					Message:    fmt.Sprintf("题目内容: %s", msg),
					Suggestion: "请检查用字是否正确",
				})
				result.IssuesFound++
				result.WarningCount++
			}
		}

		// 检查解析内容
		if q.Analysis != "" {
			for typo, msg := range typoMap {
				if containsAnyChar(q.Analysis, typo) {
					s.saveQualityResult(&QualityCheckResult{
						CheckType:  "typo",
						TargetType: "question",
						TargetID:   q.ID,
						Severity:   "warning",
						Message:    fmt.Sprintf("解析内容: %s", msg),
						Suggestion: "请检查用字是否正确",
					})
					result.IssuesFound++
					result.WarningCount++
				}
			}
		}
	}

	return result
}

// =====================================================
// 格式规范检查
// =====================================================

func (s *ContentQualityService) runFormatCheck(req *QualityCheckRequest) QualityCheckTaskResult {
	result := QualityCheckTaskResult{}

	limit := 100
	if req.Limit > 0 {
		limit = req.Limit
	}

	var questions []model.Question
	s.db.Limit(limit).Find(&questions)

	result.TotalChecked = len(questions)

	for _, q := range questions {
		// 检查题目是否以句号结尾
		content := strings.TrimSpace(q.Content)
		if content != "" && !strings.HasSuffix(content, "。") && !strings.HasSuffix(content, "？") && !strings.HasSuffix(content, "：") && !strings.HasSuffix(content, "?") && !strings.HasSuffix(content, ":") {
			s.saveQualityResult(&QualityCheckResult{
				CheckType:  "format",
				TargetType: "question",
				TargetID:   q.ID,
				Severity:   "info",
				Message:    "题目内容未以标点符号结尾",
				Suggestion: "建议在题目末尾添加适当的标点符号",
			})
			result.IssuesFound++
			result.InfoCount++
		}

		// 检查选项数量
		if q.QuestionType == model.QuestionTypeSingleChoice || q.QuestionType == model.QuestionTypeMultiChoice {
			if len(q.Options) < 2 {
				s.saveQualityResult(&QualityCheckResult{
					CheckType:  "format",
					TargetType: "question",
					TargetID:   q.ID,
					Severity:   "error",
					Message:    "选择题选项数量不足",
					Suggestion: "选择题至少需要2个选项",
				})
				result.IssuesFound++
				result.ErrorCount++
			}
		}

		// 检查是否缺少解析
		if q.Analysis == "" {
			s.saveQualityResult(&QualityCheckResult{
				CheckType:  "format",
				TargetType: "question",
				TargetID:   q.ID,
				Severity:   "warning",
				Message:    "题目缺少答案解析",
				Suggestion: "建议为题目添加详细的答案解析",
			})
			result.IssuesFound++
			result.WarningCount++
		}

		// 检查答案格式
		if q.QuestionType == model.QuestionTypeSingleChoice {
			if len(q.Answer) != 1 || !isValidOptionKey(q.Answer) {
				s.saveQualityResult(&QualityCheckResult{
					CheckType:  "format",
					TargetType: "question",
					TargetID:   q.ID,
					Severity:   "error",
					Message:    "单选题答案格式不正确",
					Suggestion: "单选题答案应为单个大写字母(A/B/C/D等)",
				})
				result.IssuesFound++
				result.ErrorCount++
			}
		}
	}

	return result
}

// =====================================================
// 重复内容检测
// =====================================================

func (s *ContentQualityService) runDuplicateCheck(req *QualityCheckRequest) QualityCheckTaskResult {
	result := QualityCheckTaskResult{}

	limit := 500
	if req.Limit > 0 {
		limit = req.Limit
	}

	var questions []model.Question
	s.db.Limit(limit).Find(&questions)

	result.TotalChecked = len(questions)

	// 使用简单的相似度检测
	for i := 0; i < len(questions); i++ {
		for j := i + 1; j < len(questions); j++ {
			similarity := calculateSimilarity(questions[i].Content, questions[j].Content)
			if similarity > 0.9 {
				s.saveQualityResult(&QualityCheckResult{
					CheckType:  "duplicate",
					TargetType: "question",
					TargetID:   questions[i].ID,
					Severity:   "warning",
					Message:    fmt.Sprintf("与题目 #%d 高度相似 (%.1f%%)", questions[j].ID, similarity*100),
					Suggestion: "请检查是否为重复题目",
				})
				result.IssuesFound++
				result.WarningCount++
			}
		}
	}

	return result
}

// =====================================================
// 知识点覆盖度分析
// =====================================================

func (s *ContentQualityService) runCoverageCheck(req *QualityCheckRequest) QualityCheckTaskResult {
	result := QualityCheckTaskResult{}

	// 按分类统计题目数量
	type CategoryStats struct {
		CategoryID    uint
		CategoryName  string
		QuestionCount int
	}

	var stats []CategoryStats
	s.db.Raw(`
		SELECT 
			c.id as category_id, 
			c.name as category_name, 
			COUNT(q.id) as question_count
		FROM what_course_categories c
		LEFT JOIN what_questions q ON c.id = q.category_id AND q.deleted_at IS NULL
		WHERE c.deleted_at IS NULL
		GROUP BY c.id, c.name
	`).Scan(&stats)

	result.TotalChecked = len(stats)

	// 检查覆盖度
	for _, stat := range stats {
		if stat.QuestionCount == 0 {
			s.saveQualityResult(&QualityCheckResult{
				CheckType:  "coverage",
				TargetType: "category",
				TargetID:   stat.CategoryID,
				Severity:   "error",
				Message:    fmt.Sprintf("分类[%s]下没有题目", stat.CategoryName),
				Suggestion: "建议为该分类添加相关题目",
			})
			result.IssuesFound++
			result.ErrorCount++
		} else if stat.QuestionCount < 10 {
			s.saveQualityResult(&QualityCheckResult{
				CheckType:  "coverage",
				TargetType: "category",
				TargetID:   stat.CategoryID,
				Severity:   "warning",
				Message:    fmt.Sprintf("分类[%s]题目数量较少(%d题)", stat.CategoryName, stat.QuestionCount),
				Suggestion: "建议增加该分类的题目数量",
			})
			result.IssuesFound++
			result.WarningCount++
		}
	}

	return result
}

// =====================================================
// 难度分布分析
// =====================================================

func (s *ContentQualityService) runDifficultyCheck(req *QualityCheckRequest) QualityCheckTaskResult {
	result := QualityCheckTaskResult{}

	// 按分类和难度统计
	type DifficultyStats struct {
		CategoryID   uint
		CategoryName string
		Difficulty   int
		Count        int
	}

	var stats []DifficultyStats
	s.db.Raw(`
		SELECT 
			c.id as category_id, 
			c.name as category_name, 
			q.difficulty,
			COUNT(q.id) as count
		FROM what_course_categories c
		LEFT JOIN what_questions q ON c.id = q.category_id AND q.deleted_at IS NULL
		WHERE c.deleted_at IS NULL AND q.id IS NOT NULL
		GROUP BY c.id, c.name, q.difficulty
		ORDER BY c.id, q.difficulty
	`).Scan(&stats)

	// 按分类聚合
	categoryDifficulties := make(map[uint]map[int]int)
	categoryNames := make(map[uint]string)

	for _, stat := range stats {
		if categoryDifficulties[stat.CategoryID] == nil {
			categoryDifficulties[stat.CategoryID] = make(map[int]int)
		}
		categoryDifficulties[stat.CategoryID][stat.Difficulty] = stat.Count
		categoryNames[stat.CategoryID] = stat.CategoryName
	}

	result.TotalChecked = len(categoryDifficulties)

	// 检查每个分类的难度分布
	for catID, difficulties := range categoryDifficulties {
		total := 0
		for _, count := range difficulties {
			total += count
		}

		if total == 0 {
			continue
		}

		// 检查是否缺少某些难度级别
		for level := 1; level <= 5; level++ {
			if difficulties[level] == 0 {
				var severity string
				var levelName string

				switch level {
				case 1:
					levelName = "入门"
					severity = "info"
				case 2:
					levelName = "简单"
					severity = "info"
				case 3:
					levelName = "中等"
					severity = "warning"
				case 4:
					levelName = "困难"
					severity = "info"
				case 5:
					levelName = "极难"
					severity = "info"
				}

				s.saveQualityResult(&QualityCheckResult{
					CheckType:  "difficulty",
					TargetType: "category",
					TargetID:   catID,
					Severity:   severity,
					Message:    fmt.Sprintf("分类[%s]缺少%s难度题目", categoryNames[catID], levelName),
					Suggestion: fmt.Sprintf("建议添加%s难度的题目以完善难度梯度", levelName),
				})
				result.IssuesFound++
				if severity == "warning" {
					result.WarningCount++
				} else {
					result.InfoCount++
				}
			}
		}

		// 检查难度分布是否均衡
		midCount := difficulties[3]
		if total > 20 && float64(midCount)/float64(total) < 0.2 {
			s.saveQualityResult(&QualityCheckResult{
				CheckType:  "difficulty",
				TargetType: "category",
				TargetID:   catID,
				Severity:   "warning",
				Message:    fmt.Sprintf("分类[%s]中等难度题目比例较低(%.1f%%)", categoryNames[catID], float64(midCount)/float64(total)*100),
				Suggestion: "建议增加中等难度题目的比例",
			})
			result.IssuesFound++
			result.WarningCount++
		}
	}

	return result
}

// =====================================================
// 获取检查结果
// =====================================================

// GetQualityResults 获取质量检查结果
func (s *ContentQualityService) GetQualityResults(page, pageSize int, checkType, severity string) ([]QualityCheckResult, int64, error) {
	var results []QualityCheckResult
	var total int64

	query := s.db.Model(&QualityCheckResult{})

	if checkType != "" {
		query = query.Where("check_type = ?", checkType)
	}
	if severity != "" {
		query = query.Where("severity = ?", severity)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&results).Error; err != nil {
		return nil, 0, err
	}

	return results, total, nil
}

// ResolveIssue 解决问题
func (s *ContentQualityService) ResolveIssue(id uint, resolvedBy uint) error {
	now := time.Now()
	return s.db.Model(&QualityCheckResult{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_resolved": true,
		"resolved_at": now,
		"resolved_by": resolvedBy,
	}).Error
}

// =====================================================
// 辅助函数
// =====================================================

func (s *ContentQualityService) saveQualityResult(result *QualityCheckResult) error {
	result.CreatedAt = time.Now()
	return s.db.Create(result).Error
}

func getCheckTypeName(checkType string) string {
	names := map[string]string{
		"typo":       "错别字",
		"format":     "格式规范",
		"duplicate":  "重复内容",
		"coverage":   "知识点覆盖",
		"difficulty": "难度分布",
	}
	if name, ok := names[checkType]; ok {
		return name
	}
	return checkType
}

func containsAnyChar(s, chars string) bool {
	for _, c := range chars {
		if strings.ContainsRune(s, c) {
			return true
		}
	}
	return false
}

func isValidOptionKey(s string) bool {
	if len(s) != 1 {
		return false
	}
	c := rune(s[0])
	return unicode.IsUpper(c) && c >= 'A' && c <= 'Z'
}

// calculateSimilarity 计算两个字符串的相似度（简化版Jaccard相似度）
func calculateSimilarity(s1, s2 string) float64 {
	if s1 == "" || s2 == "" {
		return 0
	}

	// 分词（简单按字符分割）
	words1 := splitToWords(s1)
	words2 := splitToWords(s2)

	// 计算交集和并集
	set1 := make(map[string]bool)
	for _, w := range words1 {
		set1[w] = true
	}

	intersection := 0
	for _, w := range words2 {
		if set1[w] {
			intersection++
		}
	}

	union := len(set1)
	for _, w := range words2 {
		if !set1[w] {
			union++
		}
	}

	if union == 0 {
		return 0
	}

	return float64(intersection) / float64(union)
}

func splitToWords(s string) []string {
	// 移除标点符号
	reg := regexp.MustCompile(`[^\p{L}\p{N}]+`)
	s = reg.ReplaceAllString(s, " ")

	// 按空格分词
	words := strings.Fields(s)

	// 对于中文，按字符分割
	var result []string
	for _, word := range words {
		for _, r := range word {
			if unicode.Is(unicode.Han, r) {
				result = append(result, string(r))
			} else {
				result = append(result, word)
				break
			}
		}
	}

	return result
}
