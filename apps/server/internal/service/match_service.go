package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/what-cse/server/internal/config"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

// Match service errors
var (
	ErrProfileNotFound = errors.New("用户画像不存在")
)

// CacheTTL 缓存过期时间常量
const (
	DefaultCacheTTL = 24 * time.Hour // 默认缓存24小时
	HotCacheTTL     = 48 * time.Hour // 热门职位缓存48小时
)

type MatchService struct {
	positionRepo   *repository.PositionRepository
	userRepo       *repository.UserRepository
	profileRepo    *repository.UserProfileRepository
	prefRepo       *repository.UserPreferenceRepository
	matchCacheRepo *repository.MatchCacheRepository
	weights        config.MatchWeightConfig
	cacheEnabled   bool
}

func NewMatchService(
	positionRepo *repository.PositionRepository,
	userRepo *repository.UserRepository,
	profileRepo *repository.UserProfileRepository,
	prefRepo *repository.UserPreferenceRepository,
) *MatchService {
	return &MatchService{
		positionRepo:   positionRepo,
		userRepo:       userRepo,
		profileRepo:    profileRepo,
		prefRepo:       prefRepo,
		matchCacheRepo: nil, // 可选，通过 SetMatchCacheRepo 设置
		weights:        config.DefaultMatchWeights,
		cacheEnabled:   false,
	}
}

// SetMatchCacheRepo 设置匹配缓存仓库（启用缓存）
func (s *MatchService) SetMatchCacheRepo(repo *repository.MatchCacheRepository) {
	s.matchCacheRepo = repo
	s.cacheEnabled = repo != nil
}

// IsCacheEnabled 检查缓存是否启用
func (s *MatchService) IsCacheEnabled() bool {
	return s.cacheEnabled && s.matchCacheRepo != nil
}

// =====================================================
// 请求和响应结构体
// =====================================================

// MatchResult 匹配结果
type MatchResult struct {
	Position       model.Position   `json:"position"`
	MatchScore     int              `json:"match_score"` // 0-100 总分
	HardScore      int              `json:"hard_score"`  // 硬性条件得分
	SoftScore      int              `json:"soft_score"`  // 软性条件得分
	StarLevel      int              `json:"star_level"`  // 1-5星评级
	MatchLevel     string           `json:"match_level"` // 匹配等级文字
	MatchDetails   []MatchCondition `json:"match_details"`
	UnmatchReasons []string         `json:"unmatch_reasons,omitempty"`
	Suggestions    []string         `json:"suggestions,omitempty"` // 改进建议
	IsEligible     bool             `json:"is_eligible"`
}

// MatchCondition 单项匹配条件
type MatchCondition struct {
	Condition   string `json:"condition"`
	UserValue   string `json:"user_value"`
	Required    string `json:"required"`
	IsMatch     bool   `json:"is_match"`
	IsHardMatch bool   `json:"is_hard_match"` // 硬性条件
	Score       int    `json:"score"`         // 该条件得分
	MaxScore    int    `json:"max_score"`     // 满分
	Weight      int    `json:"weight"`        // 权重
}

// MatchRequest 匹配请求
type MatchRequest struct {
	Strategy     string `json:"strategy" query:"strategy"` // strict, loose, smart
	Page         int    `json:"page" query:"page"`
	PageSize     int    `json:"page_size" query:"page_size"`
	MinScore     int    `json:"min_score" query:"min_score"`         // 最低匹配度筛选
	OnlyEligible bool   `json:"only_eligible" query:"only_eligible"` // 仅显示符合条件的
	SortBy       string `json:"sort_by" query:"sort_by"`             // score, recruit_count, deadline
	Province     string `json:"province" query:"province"`           // 省份筛选
	ExamType     string `json:"exam_type" query:"exam_type"`         // 考试类型筛选
}

// MatchResponse 匹配响应
type MatchResponse struct {
	Results     []MatchResult            `json:"results"`
	Total       int64                    `json:"total"`
	Page        int                      `json:"page"`
	PageSize    int                      `json:"page_size"`
	Stats       MatchStats               `json:"stats"`
	UserProfile *MatchUserProfileSummary `json:"user_profile,omitempty"`
}

// MatchStats 匹配统计
type MatchStats struct {
	TotalPositions    int64   `json:"total_positions"`
	EligiblePositions int64   `json:"eligible_positions"`
	HighMatchCount    int64   `json:"high_match_count"`    // 匹配度>=85%
	MediumMatchCount  int64   `json:"medium_match_count"`  // 匹配度70-84%
	LowMatchCount     int64   `json:"low_match_count"`     // 匹配度<70%
	AverageScore      float64 `json:"average_score"`       // 平均匹配度
	PerfectMatchCount int64   `json:"perfect_match_count"` // 完美匹配(100%)数量
}

// MatchUserProfileSummary 用户画像摘要
type MatchUserProfileSummary struct {
	Education       string   `json:"education"`
	Major           string   `json:"major"`
	PoliticalStatus string   `json:"political_status"`
	Age             int      `json:"age"`
	WorkYears       int      `json:"work_years"`
	HukouProvince   string   `json:"hukou_province"`
	PreferProvinces []string `json:"prefer_provinces"`
	PreferCities    []string `json:"prefer_cities"`
	IsComplete      bool     `json:"is_complete"`  // 画像是否完整
	Completeness    int      `json:"completeness"` // 完整度百分比
}

// PositionMatchDetail 单个职位的匹配详情
type PositionMatchDetail struct {
	Position       *model.Position          `json:"position"`
	MatchScore     int                      `json:"match_score"`
	HardScore      int                      `json:"hard_score"`
	SoftScore      int                      `json:"soft_score"`
	StarLevel      int                      `json:"star_level"`
	MatchLevel     string                   `json:"match_level"`
	MatchDetails   []MatchCondition         `json:"match_details"`
	UnmatchReasons []string                 `json:"unmatch_reasons"`
	Suggestions    []string                 `json:"suggestions"`
	IsEligible     bool                     `json:"is_eligible"`
	UserProfile    *MatchUserProfileSummary `json:"user_profile"`
}

// MatchDimensionStats 各维度匹配统计
type MatchDimensionStats struct {
	Education  DimensionStat `json:"education"`
	Major      DimensionStat `json:"major"`
	Political  DimensionStat `json:"political"`
	Age        DimensionStat `json:"age"`
	Location   DimensionStat `json:"location"`
	Experience DimensionStat `json:"experience"`
}

// DimensionStat 维度统计
type DimensionStat struct {
	Name         string  `json:"name"`
	MatchCount   int64   `json:"match_count"`
	TotalCount   int64   `json:"total_count"`
	MatchRate    float64 `json:"match_rate"`
	AverageScore float64 `json:"average_score"`
}

// CustomWeightsRequest 自定义权重请求
type CustomWeightsRequest struct {
	Education  int `json:"education"`
	Political  int `json:"political"`
	Age        int `json:"age"`
	Hukou      int `json:"hukou"`
	Major      int `json:"major"`
	Experience int `json:"experience"`
	Location   int `json:"location"`
}

func (s *MatchService) MatchPositions(userID uint, req *MatchRequest) (*MatchResponse, error) {
	// Get user profile and preferences
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}

	preferences, _ := s.prefRepo.FindByUserID(userID)

	// Build filter
	filter := &repository.PositionFilter{}
	publishedStatus := int(model.PositionStatusPublished)
	filter.Status = &publishedStatus

	// Apply request filters
	if req.Province != "" {
		filter.Province = req.Province
	} else if preferences != nil && len(preferences.PreferredProvinces) > 0 && req.Strategy != "loose" {
		filter.Province = preferences.PreferredProvinces[0]
	}

	if req.ExamType != "" {
		filter.ExamType = req.ExamType
	}

	positions, total, err := s.positionRepo.List(filter, nil, 1, 2000) // Get more for matching
	if err != nil {
		return nil, err
	}

	// Calculate match scores for each position
	var allResults []MatchResult
	var stats MatchStats
	stats.TotalPositions = total

	strategy := req.Strategy
	if strategy == "" {
		strategy = "smart"
	}

	var totalScore int64

	for _, position := range positions {
		result := s.calculateMatch(profile, preferences, &position, strategy)

		if result.IsEligible {
			stats.EligiblePositions++
		}

		if result.MatchScore == 100 {
			stats.PerfectMatchCount++
		}

		if result.MatchScore >= 85 {
			stats.HighMatchCount++
		} else if result.MatchScore >= 70 {
			stats.MediumMatchCount++
		} else {
			stats.LowMatchCount++
		}

		totalScore += int64(result.MatchScore)

		// Apply filters
		if req.OnlyEligible && !result.IsEligible {
			continue
		}
		if req.MinScore > 0 && result.MatchScore < req.MinScore {
			continue
		}
		if strategy == "strict" && !result.IsEligible {
			continue
		}

		allResults = append(allResults, result)
	}

	// Calculate average score
	if len(positions) > 0 {
		stats.AverageScore = float64(totalScore) / float64(len(positions))
	}

	// Sort results
	switch req.SortBy {
	case "recruit_count":
		sortByRecruitCount(allResults)
	case "deadline":
		sortByDeadline(allResults)
	default:
		sortByMatchScore(allResults)
	}

	// Apply pagination
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}

	totalCount := int64(len(allResults))
	start := (req.Page - 1) * req.PageSize
	end := start + req.PageSize

	var results []MatchResult
	if start >= len(allResults) {
		results = []MatchResult{}
	} else if end > len(allResults) {
		results = allResults[start:]
	} else {
		results = allResults[start:end]
	}

	// Build user profile summary
	profileSummary := s.buildProfileSummary(profile, preferences)

	return &MatchResponse{
		Results:     results,
		Total:       totalCount,
		Page:        req.Page,
		PageSize:    req.PageSize,
		Stats:       stats,
		UserProfile: profileSummary,
	}, nil
}

// GetPositionMatchDetail 获取单个职位的匹配详情
func (s *MatchService) GetPositionMatchDetail(userID uint, positionID uint) (*PositionMatchDetail, error) {
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}

	preferences, _ := s.prefRepo.FindByUserID(userID)

	position, err := s.positionRepo.FindByID(positionID)
	if err != nil {
		return nil, ErrPositionNotFound
	}

	result := s.calculateMatch(profile, preferences, position, "smart")

	profileSummary := s.buildProfileSummary(profile, preferences)

	return &PositionMatchDetail{
		Position:       position,
		MatchScore:     result.MatchScore,
		HardScore:      result.HardScore,
		SoftScore:      result.SoftScore,
		StarLevel:      result.StarLevel,
		MatchLevel:     result.MatchLevel,
		MatchDetails:   result.MatchDetails,
		UnmatchReasons: result.UnmatchReasons,
		Suggestions:    result.Suggestions,
		IsEligible:     result.IsEligible,
		UserProfile:    profileSummary,
	}, nil
}

// GetMatchDimensionStats 获取各维度匹配统计
func (s *MatchService) GetMatchDimensionStats(userID uint) (*MatchDimensionStats, error) {
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}

	preferences, _ := s.prefRepo.FindByUserID(userID)

	// Get sample positions for statistics
	filter := &repository.PositionFilter{}
	publishedStatus := int(model.PositionStatusPublished)
	filter.Status = &publishedStatus

	positions, _, err := s.positionRepo.List(filter, nil, 1, 500)
	if err != nil {
		return nil, err
	}

	stats := &MatchDimensionStats{
		Education:  DimensionStat{Name: "学历"},
		Major:      DimensionStat{Name: "专业"},
		Political:  DimensionStat{Name: "政治面貌"},
		Age:        DimensionStat{Name: "年龄"},
		Location:   DimensionStat{Name: "工作地点"},
		Experience: DimensionStat{Name: "工作经验"},
	}

	for _, pos := range positions {
		stats.Education.TotalCount++
		stats.Major.TotalCount++
		stats.Political.TotalCount++
		stats.Age.TotalCount++
		stats.Location.TotalCount++
		stats.Experience.TotalCount++

		if s.checkEducation(profile.Education, pos.Education) {
			stats.Education.MatchCount++
		}
		if pos.IsUnlimitedMajor || s.checkMajor(profile.Major, pos.MajorList) {
			stats.Major.MatchCount++
		}
		if s.checkPoliticalStatus(profile.PoliticalStatus, pos.PoliticalStatus) {
			stats.Political.MatchCount++
		}
		if s.checkAge(profile.BirthDate, pos.AgeMin, pos.AgeMax) {
			stats.Age.MatchCount++
		}
		if preferences != nil {
			if s.calculateLocationScore(pos.Province, pos.City, preferences.PreferredProvinces, preferences.PreferredCities) > 0 {
				stats.Location.MatchCount++
			}
		}
		if profile.WorkYears >= pos.WorkExperienceYears {
			stats.Experience.MatchCount++
		}
	}

	// Calculate match rates
	calcRate := func(stat *DimensionStat) {
		if stat.TotalCount > 0 {
			stat.MatchRate = float64(stat.MatchCount) / float64(stat.TotalCount) * 100
		}
	}

	calcRate(&stats.Education)
	calcRate(&stats.Major)
	calcRate(&stats.Political)
	calcRate(&stats.Age)
	calcRate(&stats.Location)
	calcRate(&stats.Experience)

	return stats, nil
}

// UpdateWeights 更新用户的匹配权重
func (s *MatchService) UpdateWeights(userID uint, req *CustomWeightsRequest) error {
	newWeights := config.MatchWeightConfig{
		Education:  req.Education,
		Political:  req.Political,
		Age:        req.Age,
		Hukou:      req.Hukou,
		Major:      req.Major,
		Experience: req.Experience,
		Location:   req.Location,
	}

	if err := newWeights.Validate(); err != nil {
		return err
	}

	// TODO: 保存到用户偏好设置中
	// 目前仅在内存中更新
	s.weights = newWeights
	return nil
}

// GetCurrentWeights 获取当前权重配置
func (s *MatchService) GetCurrentWeights() *config.MatchWeightConfig {
	return &s.weights
}

// buildProfileSummary 构建用户画像摘要
func (s *MatchService) buildProfileSummary(profile *model.UserProfile, pref *model.UserPreference) *MatchUserProfileSummary {
	summary := &MatchUserProfileSummary{
		Education:       profile.Education,
		Major:           profile.Major,
		PoliticalStatus: profile.PoliticalStatus,
		WorkYears:       profile.WorkYears,
		HukouProvince:   profile.HukouProvince,
	}

	if profile.BirthDate != nil {
		summary.Age = calculateAge(*profile.BirthDate)
	}

	if pref != nil {
		summary.PreferProvinces = pref.PreferredProvinces
		summary.PreferCities = pref.PreferredCities
	}

	// Calculate completeness
	completeness := 0
	if profile.Education != "" {
		completeness += 20
	}
	if profile.Major != "" {
		completeness += 20
	}
	if profile.PoliticalStatus != "" {
		completeness += 15
	}
	if profile.BirthDate != nil {
		completeness += 15
	}
	if profile.HukouProvince != "" {
		completeness += 15
	}
	if pref != nil && len(pref.PreferredProvinces) > 0 {
		completeness += 15
	}

	summary.Completeness = completeness
	summary.IsComplete = completeness >= 80

	return summary
}

func (s *MatchService) calculateMatch(profile *model.UserProfile, pref *model.UserPreference, position *model.Position, strategy string) MatchResult {
	result := MatchResult{
		Position:   *position,
		IsEligible: true,
	}

	var details []MatchCondition
	var unmatchReasons []string
	var suggestions []string
	hardScore := 0
	hardMaxScore := 0
	softScore := 0
	softMaxScore := 0

	// 1. Education check (Hard condition)
	eduMatch := s.checkEducation(profile.Education, position.Education)
	eduWeight := s.weights.Education
	eduScore := boolToScore(eduMatch, eduWeight)
	details = append(details, MatchCondition{
		Condition:   "学历要求",
		UserValue:   profile.Education,
		Required:    formatEducationRequired(position.Education),
		IsMatch:     eduMatch,
		IsHardMatch: true,
		Score:       eduScore,
		MaxScore:    eduWeight,
		Weight:      eduWeight,
	})
	hardMaxScore += eduWeight
	if eduMatch {
		hardScore += eduWeight
	} else {
		result.IsEligible = false
		unmatchReasons = append(unmatchReasons, fmt.Sprintf("学历不符合要求（要求：%s，您：%s）", position.Education, profile.Education))
		if profile.Education != "" {
			suggestions = append(suggestions, "建议考虑在职研究生或成人教育提升学历")
		}
	}

	// 2. Political status check (Hard condition)
	politicalMatch := s.checkPoliticalStatus(profile.PoliticalStatus, position.PoliticalStatus)
	politicalWeight := s.weights.Political
	politicalScore := boolToScore(politicalMatch, politicalWeight)
	details = append(details, MatchCondition{
		Condition:   "政治面貌",
		UserValue:   formatPoliticalStatus(profile.PoliticalStatus),
		Required:    formatPoliticalRequired(position.PoliticalStatus),
		IsMatch:     politicalMatch,
		IsHardMatch: true,
		Score:       politicalScore,
		MaxScore:    politicalWeight,
		Weight:      politicalWeight,
	})
	hardMaxScore += politicalWeight
	if politicalMatch {
		hardScore += politicalWeight
	} else {
		result.IsEligible = false
		unmatchReasons = append(unmatchReasons, fmt.Sprintf("政治面貌不符合要求（要求：%s，您：%s）", position.PoliticalStatus, profile.PoliticalStatus))
		if position.PoliticalStatus == "中共党员" && profile.PoliticalStatus != "中共党员" {
			suggestions = append(suggestions, "可考虑向党组织递交入党申请书")
		}
	}

	// 3. Age check (Hard condition)
	ageMatch := s.checkAge(profile.BirthDate, position.AgeMin, position.AgeMax)
	ageWeight := s.weights.Age
	ageScore := boolToScore(ageMatch, ageWeight)
	userAge := "未设置"
	if profile.BirthDate != nil {
		userAge = fmt.Sprintf("%d岁", calculateAge(*profile.BirthDate))
	}
	details = append(details, MatchCondition{
		Condition:   "年龄要求",
		UserValue:   userAge,
		Required:    formatAgeRange(position.AgeMin, position.AgeMax),
		IsMatch:     ageMatch,
		IsHardMatch: true,
		Score:       ageScore,
		MaxScore:    ageWeight,
		Weight:      ageWeight,
	})
	hardMaxScore += ageWeight
	if ageMatch {
		hardScore += ageWeight
	} else {
		result.IsEligible = false
		unmatchReasons = append(unmatchReasons, fmt.Sprintf("年龄不符合要求（要求：%s，您：%s）", formatAgeRange(position.AgeMin, position.AgeMax), userAge))
	}

	// 4. Household registration check (Hard condition if specified)
	hukouWeight := s.weights.Hukou
	hukouRequired := position.HouseholdRequirement != "" && position.HouseholdRequirement != "不限"
	if hukouRequired {
		hukouMatch := strings.Contains(position.HouseholdRequirement, profile.HukouProvince) ||
			position.HouseholdRequirement == "不限" || profile.HukouProvince == ""
		hukouScore := boolToScore(hukouMatch, hukouWeight)
		details = append(details, MatchCondition{
			Condition:   "户籍要求",
			UserValue:   formatHukou(profile.HukouProvince, profile.HukouCity),
			Required:    position.HouseholdRequirement,
			IsMatch:     hukouMatch,
			IsHardMatch: true,
			Score:       hukouScore,
			MaxScore:    hukouWeight,
			Weight:      hukouWeight,
		})
		hardMaxScore += hukouWeight
		if hukouMatch {
			hardScore += hukouWeight
		} else {
			result.IsEligible = false
			unmatchReasons = append(unmatchReasons, fmt.Sprintf("户籍不符合要求（要求：%s）", position.HouseholdRequirement))
		}
	} else {
		// 不限户籍，给满分
		details = append(details, MatchCondition{
			Condition:   "户籍要求",
			UserValue:   formatHukou(profile.HukouProvince, profile.HukouCity),
			Required:    "不限",
			IsMatch:     true,
			IsHardMatch: true,
			Score:       hukouWeight,
			MaxScore:    hukouWeight,
			Weight:      hukouWeight,
		})
		hardMaxScore += hukouWeight
		hardScore += hukouWeight
	}

	// 5. Major check (Soft condition)
	majorWeight := s.weights.Major
	majorMatch := position.IsUnlimitedMajor || s.checkMajor(profile.Major, position.MajorList)
	var majorScoreVal int
	if majorMatch {
		if position.IsUnlimitedMajor {
			majorScoreVal = majorWeight * 70 / 100 // 专业不限给70%分数
		} else {
			majorScoreVal = majorWeight // 精确匹配给满分
		}
	}
	majorRequired := "专业不限"
	if !position.IsUnlimitedMajor && len(position.MajorList) > 0 {
		majorRequired = strings.Join(position.MajorList, "、")
		if len(majorRequired) > 50 {
			majorRequired = majorRequired[:50] + "..."
		}
	} else if position.MajorRequirement != "" {
		majorRequired = position.MajorRequirement
		if len(majorRequired) > 50 {
			majorRequired = majorRequired[:50] + "..."
		}
	}
	details = append(details, MatchCondition{
		Condition:   "专业要求",
		UserValue:   profile.Major,
		Required:    majorRequired,
		IsMatch:     majorMatch,
		IsHardMatch: false,
		Score:       majorScoreVal,
		MaxScore:    majorWeight,
		Weight:      majorWeight,
	})
	softMaxScore += majorWeight
	softScore += majorScoreVal
	if !majorMatch && profile.Major != "" {
		suggestions = append(suggestions, "可考虑第二学位或专业相关资格证书")
	}

	// 6. Work experience check (Soft condition)
	expWeight := s.weights.Experience
	expMatch := position.WorkExperienceYears == 0 || profile.WorkYears >= position.WorkExperienceYears
	expScore := boolToScore(expMatch, expWeight)
	details = append(details, MatchCondition{
		Condition:   "工作经验",
		UserValue:   formatWorkYears(profile.WorkYears),
		Required:    formatWorkYearsRequired(position.WorkExperienceYears),
		IsMatch:     expMatch,
		IsHardMatch: false,
		Score:       expScore,
		MaxScore:    expWeight,
		Weight:      expWeight,
	})
	softMaxScore += expWeight
	softScore += expScore
	if !expMatch {
		suggestions = append(suggestions, fmt.Sprintf("该职位需要%d年以上工作经验", position.WorkExperienceYears))
	}

	// 7. Location preference (Soft condition)
	locationWeight := s.weights.Location
	var locationScoreVal int
	if pref != nil {
		locationScoreVal = s.calculateLocationScore(position.Province, position.City, pref.PreferredProvinces, pref.PreferredCities)
		// Normalize to weight
		if locationScoreVal > 0 {
			locationScoreVal = locationScoreVal * locationWeight / 15
		}
	}
	details = append(details, MatchCondition{
		Condition:   "工作地点",
		UserValue:   formatPreferredLocations(pref),
		Required:    formatLocation(position.Province, position.City),
		IsMatch:     locationScoreVal > 0 || pref == nil,
		IsHardMatch: false,
		Score:       locationScoreVal,
		MaxScore:    locationWeight,
		Weight:      locationWeight,
	})
	softMaxScore += locationWeight
	softScore += locationScoreVal

	// Calculate scores
	totalMaxScore := hardMaxScore + softMaxScore
	totalScore := hardScore + softScore

	if totalMaxScore > 0 {
		result.MatchScore = (totalScore * 100) / totalMaxScore
	}
	if hardMaxScore > 0 {
		result.HardScore = (hardScore * 100) / hardMaxScore
	}
	if softMaxScore > 0 {
		result.SoftScore = (softScore * 100) / softMaxScore
	}

	result.StarLevel = config.GetMatchLevelStars(result.MatchScore)
	result.MatchLevel = config.GetMatchLevelName(config.GetMatchLevel(result.MatchScore))
	result.MatchDetails = details
	result.UnmatchReasons = unmatchReasons
	result.Suggestions = suggestions

	return result
}

// =====================================================
// Helper functions
// =====================================================

func (s *MatchService) checkEducation(userEdu, requiredEdu string) bool {
	if requiredEdu == "" || requiredEdu == "不限" {
		return true
	}

	eduLevel := model.EducationLevel
	userLevel, ok1 := eduLevel[userEdu]
	requiredLevel, ok2 := eduLevel[requiredEdu]

	if !ok1 || !ok2 {
		return true // If unknown, assume match
	}

	return userLevel >= requiredLevel
}

func (s *MatchService) checkPoliticalStatus(userStatus, requiredStatus string) bool {
	if requiredStatus == "" || requiredStatus == "不限" {
		return true
	}

	// 处理多种表述方式
	userStatus = normalizeMatchPoliticalStatus(userStatus)
	requiredStatus = normalizeMatchPoliticalStatus(requiredStatus)

	if requiredStatus == "中共党员" {
		return userStatus == "中共党员" || userStatus == "预备党员"
	}
	if requiredStatus == "中共党员或共青团员" {
		return userStatus == "中共党员" || userStatus == "预备党员" ||
			userStatus == "共青团员" || userStatus == "团员"
	}

	return userStatus == requiredStatus
}

func normalizeMatchPoliticalStatus(status string) string {
	switch status {
	case "党员":
		return "中共党员"
	case "团员":
		return "共青团员"
	default:
		return status
	}
}

func (s *MatchService) checkAge(birthDate *time.Time, minAge, maxAge int) bool {
	if birthDate == nil {
		return true // Can't determine, assume match
	}

	// 如果没有设置年龄限制
	if minAge == 0 && maxAge == 0 {
		return true
	}

	age := calculateAge(*birthDate)

	// 只检查设置的限制
	if minAge > 0 && age < minAge {
		return false
	}
	if maxAge > 0 && age > maxAge {
		return false
	}

	return true
}

func (s *MatchService) checkHukou(userProvince string, allowedProvinces []string) bool {
	if len(allowedProvinces) == 0 {
		return true
	}

	for _, p := range allowedProvinces {
		if p == userProvince || strings.Contains(p, userProvince) {
			return true
		}
	}
	return false
}

func (s *MatchService) checkMajor(userMajor string, requiredMajors []string) bool {
	if len(requiredMajors) == 0 || userMajor == "" {
		return true
	}

	userMajorLower := strings.ToLower(userMajor)
	for _, m := range requiredMajors {
		mLower := strings.ToLower(m)
		// 精确匹配或包含关系
		if userMajorLower == mLower ||
			strings.Contains(mLower, userMajorLower) ||
			strings.Contains(userMajorLower, mLower) {
			return true
		}
	}
	return false
}

func (s *MatchService) calculateLocationScore(province, city string, prefProvinces, prefCities []string) int {
	score := 0

	for _, p := range prefProvinces {
		if p == province || strings.Contains(province, p) {
			score += 10
			break
		}
	}

	for _, c := range prefCities {
		if c == city || strings.Contains(city, c) {
			score += 5
			break
		}
	}

	return score
}

// =====================================================
// Utility functions
// =====================================================

func boolToScore(match bool, maxScore int) int {
	if match {
		return maxScore
	}
	return 0
}

func formatAgeRange(min, max int) string {
	if min == 0 && max == 0 {
		return "不限"
	}
	if min == 0 {
		return fmt.Sprintf("%d岁以下", max)
	}
	if max == 0 {
		return fmt.Sprintf("%d岁以上", min)
	}
	return fmt.Sprintf("%d-%d岁", min, max)
}

func formatHukouRequirement(provinces []string) string {
	if len(provinces) == 0 {
		return "不限"
	}
	return strings.Join(provinces, "/")
}

func formatWorkYears(years int) string {
	if years == 0 {
		return "无工作经验"
	}
	return fmt.Sprintf("%d年", years)
}

func formatWorkYearsRequired(years int) string {
	if years == 0 {
		return "不限"
	}
	return fmt.Sprintf("%d年以上", years)
}

func formatPreferredLocations(pref *model.UserPreference) string {
	if pref == nil {
		return "未设置"
	}
	locations := append([]string{}, pref.PreferredProvinces...)
	locations = append(locations, pref.PreferredCities...)
	if len(locations) == 0 {
		return "未设置"
	}
	return strings.Join(locations, "、")
}

func formatMajorRequirement(unlimited bool, majors []string) string {
	if unlimited {
		return "专业不限"
	}
	if len(majors) == 0 {
		return "未知"
	}
	return strings.Join(majors, "/")
}

func formatEducationRequired(edu string) string {
	if edu == "" {
		return "不限"
	}
	return edu + "及以上"
}

func formatPoliticalStatus(status string) string {
	if status == "" {
		return "未设置"
	}
	return status
}

func formatPoliticalRequired(status string) string {
	if status == "" {
		return "不限"
	}
	return status
}

func formatHukou(province, city string) string {
	if province == "" && city == "" {
		return "未设置"
	}
	if city == "" {
		return province
	}
	return province + city
}

func formatLocation(province, city string) string {
	if province == "" && city == "" {
		return "未知"
	}
	if city == "" {
		return province
	}
	return province + " " + city
}

func calculateAge(birthDate time.Time) int {
	now := time.Now()
	age := now.Year() - birthDate.Year()
	if now.YearDay() < birthDate.YearDay() {
		age--
	}
	return age
}

// =====================================================
// Sorting functions
// =====================================================

func sortByMatchScore(results []MatchResult) {
	for i := 0; i < len(results)-1; i++ {
		for j := i + 1; j < len(results); j++ {
			if results[j].MatchScore > results[i].MatchScore {
				results[i], results[j] = results[j], results[i]
			}
		}
	}
}

func sortByRecruitCount(results []MatchResult) {
	for i := 0; i < len(results)-1; i++ {
		for j := i + 1; j < len(results); j++ {
			if results[j].Position.RecruitCount > results[i].Position.RecruitCount {
				results[i], results[j] = results[j], results[i]
			}
		}
	}
}

func sortByDeadline(results []MatchResult) {
	for i := 0; i < len(results)-1; i++ {
		for j := i + 1; j < len(results); j++ {
			// Sort by registration end date (ascending - soonest first)
			iEnd := results[i].Position.RegistrationEnd
			jEnd := results[j].Position.RegistrationEnd
			if iEnd != nil && jEnd != nil && jEnd.Before(*iEnd) {
				results[i], results[j] = results[j], results[i]
			} else if iEnd == nil && jEnd != nil {
				results[i], results[j] = results[j], results[i]
			}
		}
	}
}

// =====================================================
// Match Report
// =====================================================

type MatchReport struct {
	UserProfile       *MatchUserProfileSummary `json:"user_profile"`
	TotalPositions    int64                    `json:"total_positions"`
	EligibleCount     int64                    `json:"eligible_count"`
	ByExamType        map[string]int64         `json:"by_exam_type"`
	ByProvince        map[string]int64         `json:"by_province"`
	Strengths         []string                 `json:"strengths"`
	Weaknesses        []string                 `json:"weaknesses"`
	Recommendations   []string                 `json:"recommendations"`
	DimensionStats    *MatchDimensionStats     `json:"dimension_stats,omitempty"`
	MatchDistribution MatchDistribution        `json:"match_distribution"`
	TopMatches        []MatchResult            `json:"top_matches,omitempty"`
}

type MatchDistribution struct {
	Perfect []int `json:"perfect"` // 90-100%
	High    []int `json:"high"`    // 70-89%
	Medium  []int `json:"medium"`  // 50-69%
	Low     []int `json:"low"`     // 0-49%
}

func (s *MatchService) GenerateMatchReport(userID uint) (*MatchReport, error) {
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}

	preferences, _ := s.prefRepo.FindByUserID(userID)

	// Get match results
	matchResp, err := s.MatchPositions(userID, &MatchRequest{
		Strategy: "smart",
		Page:     1,
		PageSize: 500,
	})
	if err != nil {
		return nil, err
	}

	// Get dimension stats
	dimStats, _ := s.GetMatchDimensionStats(userID)

	profileSummary := s.buildProfileSummary(profile, preferences)

	report := &MatchReport{
		UserProfile:    profileSummary,
		TotalPositions: matchResp.Stats.TotalPositions,
		EligibleCount:  matchResp.Stats.EligiblePositions,
		ByExamType:     make(map[string]int64),
		ByProvince:     make(map[string]int64),
		DimensionStats: dimStats,
	}

	// Analyze results distribution
	for _, result := range matchResp.Results {
		// By exam type
		if result.Position.ExamType != "" {
			report.ByExamType[result.Position.ExamType]++
		}
		// By province
		if result.Position.Province != "" {
			report.ByProvince[result.Position.Province]++
		}

		// Distribution
		if result.MatchScore >= 90 {
			report.MatchDistribution.Perfect = append(report.MatchDistribution.Perfect, result.MatchScore)
		} else if result.MatchScore >= 70 {
			report.MatchDistribution.High = append(report.MatchDistribution.High, result.MatchScore)
		} else if result.MatchScore >= 50 {
			report.MatchDistribution.Medium = append(report.MatchDistribution.Medium, result.MatchScore)
		} else {
			report.MatchDistribution.Low = append(report.MatchDistribution.Low, result.MatchScore)
		}
	}

	// Top 5 matches
	if len(matchResp.Results) > 0 {
		topCount := 5
		if len(matchResp.Results) < topCount {
			topCount = len(matchResp.Results)
		}
		report.TopMatches = matchResp.Results[:topCount]
	}

	// Analyze strengths and weaknesses
	report.Strengths, report.Weaknesses = s.analyzeStrengthsWeaknesses(profile, dimStats)

	// Generate recommendations
	report.Recommendations = s.generateRecommendations(profile, matchResp.Stats, dimStats)

	return report, nil
}

func (s *MatchService) analyzeStrengthsWeaknesses(profile *model.UserProfile, dimStats *MatchDimensionStats) ([]string, []string) {
	var strengths, weaknesses []string

	// Education analysis
	if profile.Education == "博士" {
		strengths = append(strengths, "博士学历，可报考所有学历层级岗位")
	} else if profile.Education == "硕士" || profile.Education == "硕士研究生" {
		strengths = append(strengths, "硕士学历优势，可报考更多高层级岗位")
	} else if profile.Education == "本科" {
		strengths = append(strengths, "本科学历，满足大部分岗位要求")
	} else if profile.Education == "大专" {
		weaknesses = append(weaknesses, "大专学历限制较多，部分岗位要求本科及以上")
	}

	// Political status analysis
	if profile.PoliticalStatus == "中共党员" || profile.PoliticalStatus == "党员" {
		strengths = append(strengths, "党员身份可报考限定中共党员岗位")
	} else if profile.PoliticalStatus == "预备党员" {
		strengths = append(strengths, "预备党员身份，部分限党员岗位可报考")
	} else if profile.PoliticalStatus == "群众" {
		weaknesses = append(weaknesses, "非党员身份，部分限党员岗位无法报考")
	}

	// Work experience analysis
	if profile.WorkYears >= 5 {
		strengths = append(strengths, "丰富工作经验，可报考有经验要求的岗位")
	} else if profile.WorkYears >= 2 {
		strengths = append(strengths, "有一定工作经验，满足大部分经验要求")
	} else if profile.IsFreshGraduate {
		strengths = append(strengths, "应届毕业生身份，可报考定向招录岗位")
	}

	// Age analysis
	if profile.BirthDate != nil {
		age := calculateAge(*profile.BirthDate)
		if age <= 25 {
			strengths = append(strengths, "年龄优势明显，所有年龄限制岗位均可报考")
		} else if age > 35 {
			weaknesses = append(weaknesses, "年龄超过35岁，部分岗位可能有年龄限制")
		}
	}

	// Dimension stats analysis
	if dimStats != nil {
		if dimStats.Major.MatchRate >= 70 {
			strengths = append(strengths, fmt.Sprintf("专业匹配度高（%.0f%%），可选择范围广", dimStats.Major.MatchRate))
		} else if dimStats.Major.MatchRate < 30 {
			weaknesses = append(weaknesses, fmt.Sprintf("专业匹配度较低（%.0f%%），可选岗位受限", dimStats.Major.MatchRate))
		}
	}

	return strengths, weaknesses
}

func (s *MatchService) generateRecommendations(profile *model.UserProfile, stats MatchStats, dimStats *MatchDimensionStats) []string {
	var recommendations []string

	// Profile completeness
	if profile.Education == "" || profile.Major == "" {
		recommendations = append(recommendations, "建议完善学历和专业信息以获得更精准匹配")
	}
	if profile.BirthDate == nil {
		recommendations = append(recommendations, "建议填写出生日期以便系统检查年龄要求")
	}
	if profile.PoliticalStatus == "" {
		recommendations = append(recommendations, "建议填写政治面貌信息")
	}

	// Match results recommendations
	if stats.EligiblePositions > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("您当前符合%d个岗位条件，建议尽早收藏关注", stats.EligiblePositions))
	}

	if stats.HighMatchCount > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("有%d个高匹配度岗位（≥85%%），建议优先关注", stats.HighMatchCount))
	}

	if stats.PerfectMatchCount > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("发现%d个完美匹配岗位（100%%），强烈建议报考", stats.PerfectMatchCount))
	}

	// Dimension-specific recommendations
	if dimStats != nil {
		if dimStats.Education.MatchRate < 50 && profile.Education == "大专" {
			recommendations = append(recommendations, "考虑通过成人教育或自学考试提升学历")
		}
		if dimStats.Political.MatchRate < 70 && profile.PoliticalStatus == "群众" {
			recommendations = append(recommendations, "可考虑向党组织递交入党申请书")
		}
		if dimStats.Location.MatchRate < 30 {
			recommendations = append(recommendations, "建议扩大意向工作地区范围")
		}
	}

	// Default recommendation
	if len(recommendations) == 0 {
		recommendations = append(recommendations, "您的条件较为优秀，建议关注多个适合的岗位")
	}

	return recommendations
}

// =====================================================
// 缓存相关方法
// =====================================================

// getProfileVersion 获取用户画像版本号（用于缓存失效判断）
func (s *MatchService) getProfileVersion(profile *model.UserProfile) int64 {
	// 使用 UpdatedAt 的 Unix 时间戳作为版本号
	return profile.UpdatedAt.Unix()
}

// getPositionVersion 获取职位版本号（用于缓存失效判断）
func (s *MatchService) getPositionVersion(position *model.Position) int64 {
	// 使用 UpdatedAt 的 Unix 时间戳作为版本号
	return position.UpdatedAt.Unix()
}

// getCachedMatch 从缓存获取匹配结果
func (s *MatchService) getCachedMatch(userID uint, positionID string, profileVersion, positionVersion int64) (*MatchResult, bool) {
	if !s.IsCacheEnabled() {
		return nil, false
	}

	cache, err := s.matchCacheRepo.GetValid(userID, positionID, profileVersion, positionVersion)
	if err != nil {
		return nil, false
	}

	// 转换缓存为 MatchResult
	details, _ := cache.GetMatchDetails()
	unmatchReasons, _ := cache.GetUnmatchReasons()
	suggestions, _ := cache.GetSuggestions()

	result := &MatchResult{
		MatchScore:     cache.MatchScore,
		HardScore:      cache.HardScore,
		SoftScore:      cache.SoftScore,
		StarLevel:      cache.StarLevel,
		MatchLevel:     cache.MatchLevel,
		IsEligible:     cache.IsEligible,
		UnmatchReasons: unmatchReasons,
		Suggestions:    suggestions,
	}

	// 转换详情
	for _, d := range details {
		result.MatchDetails = append(result.MatchDetails, MatchCondition{
			Condition:   d.Condition,
			UserValue:   d.UserValue,
			Required:    d.Required,
			IsMatch:     d.IsMatch,
			IsHardMatch: d.IsHardMatch,
			Score:       d.Score,
			MaxScore:    d.MaxScore,
			Weight:      d.Weight,
		})
	}

	return result, true
}

// cacheMatchResult 缓存匹配结果
func (s *MatchService) cacheMatchResult(userID uint, position *model.Position, result *MatchResult, profileVersion int64) error {
	if !s.IsCacheEnabled() {
		return nil
	}

	cache := &model.MatchCache{
		UserID:          userID,
		PositionID:      position.PositionID,
		MatchScore:      result.MatchScore,
		HardScore:       result.HardScore,
		SoftScore:       result.SoftScore,
		StarLevel:       result.StarLevel,
		MatchLevel:      result.MatchLevel,
		IsEligible:      result.IsEligible,
		ProfileVersion:  profileVersion,
		PositionVersion: s.getPositionVersion(position),
		ExpiresAt:       time.Now().Add(DefaultCacheTTL),
	}

	// 转换详情为缓存格式
	var cacheDetails []model.MatchCacheDetail
	for _, d := range result.MatchDetails {
		cacheDetails = append(cacheDetails, model.MatchCacheDetail{
			Condition:   d.Condition,
			UserValue:   d.UserValue,
			Required:    d.Required,
			IsMatch:     d.IsMatch,
			IsHardMatch: d.IsHardMatch,
			Score:       d.Score,
			MaxScore:    d.MaxScore,
			Weight:      d.Weight,
		})
	}

	if err := cache.SetMatchDetails(cacheDetails); err != nil {
		return err
	}
	if err := cache.SetUnmatchReasons(result.UnmatchReasons); err != nil {
		return err
	}
	if err := cache.SetSuggestions(result.Suggestions); err != nil {
		return err
	}

	return s.matchCacheRepo.Set(cache)
}

// BatchCacheMatchResults 批量缓存匹配结果
func (s *MatchService) BatchCacheMatchResults(userID uint, results []MatchResult, profileVersion int64) error {
	if !s.IsCacheEnabled() || len(results) == 0 {
		return nil
	}

	var caches []model.MatchCache
	for _, result := range results {
		cache := model.MatchCache{
			UserID:          userID,
			PositionID:      result.Position.PositionID,
			MatchScore:      result.MatchScore,
			HardScore:       result.HardScore,
			SoftScore:       result.SoftScore,
			StarLevel:       result.StarLevel,
			MatchLevel:      result.MatchLevel,
			IsEligible:      result.IsEligible,
			ProfileVersion:  profileVersion,
			PositionVersion: s.getPositionVersion(&result.Position),
			ExpiresAt:       time.Now().Add(DefaultCacheTTL),
		}

		// 转换详情
		var cacheDetails []model.MatchCacheDetail
		for _, d := range result.MatchDetails {
			cacheDetails = append(cacheDetails, model.MatchCacheDetail{
				Condition:   d.Condition,
				UserValue:   d.UserValue,
				Required:    d.Required,
				IsMatch:     d.IsMatch,
				IsHardMatch: d.IsHardMatch,
				Score:       d.Score,
				MaxScore:    d.MaxScore,
				Weight:      d.Weight,
			})
		}

		_ = cache.SetMatchDetails(cacheDetails)
		_ = cache.SetUnmatchReasons(result.UnmatchReasons)
		_ = cache.SetSuggestions(result.Suggestions)

		caches = append(caches, cache)
	}

	return s.matchCacheRepo.BatchSet(caches)
}

// InvalidateUserCache 失效用户的所有缓存（用户画像变更时调用）
func (s *MatchService) InvalidateUserCache(userID uint) error {
	if !s.IsCacheEnabled() {
		return nil
	}
	return s.matchCacheRepo.DeleteByUser(userID)
}

// InvalidatePositionCache 失效职位的所有缓存（职位更新时调用）
func (s *MatchService) InvalidatePositionCache(positionID string) error {
	if !s.IsCacheEnabled() {
		return nil
	}
	return s.matchCacheRepo.DeleteByPosition(positionID)
}

// CleanupExpiredCache 清理过期缓存（定时任务调用）
func (s *MatchService) CleanupExpiredCache() (int64, error) {
	if !s.IsCacheEnabled() {
		return 0, nil
	}
	return s.matchCacheRepo.Cleanup()
}

// GetCacheStats 获取缓存统计
func (s *MatchService) GetCacheStats() (*model.MatchCacheStats, error) {
	if !s.IsCacheEnabled() {
		return nil, fmt.Errorf("缓存未启用")
	}
	return s.matchCacheRepo.GetStats()
}

// GetUserCacheStats 获取用户缓存统计
func (s *MatchService) GetUserCacheStats(userID uint) (*model.MatchCacheStats, error) {
	if !s.IsCacheEnabled() {
		return nil, fmt.Errorf("缓存未启用")
	}
	return s.matchCacheRepo.GetUserStats(userID)
}

// PrecomputeMatches 预计算热门职位的匹配结果
func (s *MatchService) PrecomputeMatches(userID uint, hotPositionIDs []string) error {
	if !s.IsCacheEnabled() || len(hotPositionIDs) == 0 {
		return nil
	}

	// 获取尚未缓存的职位
	uncachedIDs, err := s.matchCacheRepo.GetUncachedHotPositions(userID, hotPositionIDs)
	if err != nil {
		return err
	}

	if len(uncachedIDs) == 0 {
		return nil
	}

	// 获取用户画像
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return err
	}
	preferences, _ := s.prefRepo.FindByUserID(userID)
	profileVersion := s.getProfileVersion(profile)

	// 批量获取职位并计算匹配
	var results []MatchResult
	for _, posID := range uncachedIDs {
		position, err := s.positionRepo.FindByPositionID(posID)
		if err != nil {
			continue
		}

		result := s.calculateMatch(profile, preferences, position, "smart")
		result.Position = *position
		results = append(results, result)
	}

	// 批量缓存
	return s.BatchCacheMatchResults(userID, results, profileVersion)
}

// GetCachedTopMatches 获取用户缓存的高分匹配（快速返回）
func (s *MatchService) GetCachedTopMatches(userID uint, limit int) ([]MatchResult, error) {
	if !s.IsCacheEnabled() {
		return nil, fmt.Errorf("缓存未启用")
	}

	caches, err := s.matchCacheRepo.GetTopMatches(userID, limit)
	if err != nil {
		return nil, err
	}

	var results []MatchResult
	for _, cache := range caches {
		// 获取职位信息
		position, err := s.positionRepo.FindByPositionID(cache.PositionID)
		if err != nil {
			continue
		}

		details, _ := cache.GetMatchDetails()
		unmatchReasons, _ := cache.GetUnmatchReasons()
		suggestions, _ := cache.GetSuggestions()

		result := MatchResult{
			Position:       *position,
			MatchScore:     cache.MatchScore,
			HardScore:      cache.HardScore,
			SoftScore:      cache.SoftScore,
			StarLevel:      cache.StarLevel,
			MatchLevel:     cache.MatchLevel,
			IsEligible:     cache.IsEligible,
			UnmatchReasons: unmatchReasons,
			Suggestions:    suggestions,
		}

		for _, d := range details {
			result.MatchDetails = append(result.MatchDetails, MatchCondition{
				Condition:   d.Condition,
				UserValue:   d.UserValue,
				Required:    d.Required,
				IsMatch:     d.IsMatch,
				IsHardMatch: d.IsHardMatch,
				Score:       d.Score,
				MaxScore:    d.MaxScore,
				Weight:      d.Weight,
			})
		}

		results = append(results, result)
	}

	return results, nil
}

// MatchPositionsWithCache 带缓存的匹配（尝试从缓存获取，缓存未命中则计算并缓存）
func (s *MatchService) MatchPositionsWithCache(userID uint, req *MatchRequest) (*MatchResponse, error) {
	// 如果缓存未启用，直接调用原方法
	if !s.IsCacheEnabled() {
		return s.MatchPositions(userID, req)
	}

	// 获取用户画像和偏好
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}
	preferences, _ := s.prefRepo.FindByUserID(userID)
	profileVersion := s.getProfileVersion(profile)

	// 构建过滤条件
	filter := &repository.PositionFilter{}
	publishedStatus := int(model.PositionStatusPublished)
	filter.Status = &publishedStatus

	if req.Province != "" {
		filter.Province = req.Province
	} else if preferences != nil && len(preferences.PreferredProvinces) > 0 && req.Strategy != "loose" {
		filter.Province = preferences.PreferredProvinces[0]
	}

	if req.ExamType != "" {
		filter.ExamType = req.ExamType
	}

	// 获取职位列表
	positions, total, err := s.positionRepo.List(filter, nil, 1, 2000)
	if err != nil {
		return nil, err
	}

	// 收集职位ID用于批量缓存查询
	positionIDs := make([]string, len(positions))
	for i, p := range positions {
		positionIDs[i] = p.PositionID
	}

	// 批量获取缓存
	cachedResults, _ := s.matchCacheRepo.BatchGet(userID, positionIDs)

	var allResults []MatchResult
	var stats MatchStats
	var resultsToCache []MatchResult
	stats.TotalPositions = total

	strategy := req.Strategy
	if strategy == "" {
		strategy = "smart"
	}

	var totalScore int64

	for i := range positions {
		position := &positions[i]
		var result MatchResult

		// 尝试从缓存获取
		if cached, ok := cachedResults[position.PositionID]; ok {
			positionVersion := s.getPositionVersion(position)
			if cached.ProfileVersion == profileVersion && cached.PositionVersion == positionVersion {
				// 缓存命中且版本匹配
				details, _ := cached.GetMatchDetails()
				unmatchReasons, _ := cached.GetUnmatchReasons()
				suggestions, _ := cached.GetSuggestions()

				result = MatchResult{
					Position:       *position,
					MatchScore:     cached.MatchScore,
					HardScore:      cached.HardScore,
					SoftScore:      cached.SoftScore,
					StarLevel:      cached.StarLevel,
					MatchLevel:     cached.MatchLevel,
					IsEligible:     cached.IsEligible,
					UnmatchReasons: unmatchReasons,
					Suggestions:    suggestions,
				}

				for _, d := range details {
					result.MatchDetails = append(result.MatchDetails, MatchCondition{
						Condition:   d.Condition,
						UserValue:   d.UserValue,
						Required:    d.Required,
						IsMatch:     d.IsMatch,
						IsHardMatch: d.IsHardMatch,
						Score:       d.Score,
						MaxScore:    d.MaxScore,
						Weight:      d.Weight,
					})
				}
			} else {
				// 缓存版本不匹配，重新计算
				result = s.calculateMatch(profile, preferences, position, strategy)
				result.Position = *position
				resultsToCache = append(resultsToCache, result)
			}
		} else {
			// 缓存未命中，计算并准备缓存
			result = s.calculateMatch(profile, preferences, position, strategy)
			result.Position = *position
			resultsToCache = append(resultsToCache, result)
		}

		// 统计
		if result.IsEligible {
			stats.EligiblePositions++
		}
		if result.MatchScore == 100 {
			stats.PerfectMatchCount++
		}
		if result.MatchScore >= 85 {
			stats.HighMatchCount++
		} else if result.MatchScore >= 70 {
			stats.MediumMatchCount++
		} else {
			stats.LowMatchCount++
		}
		totalScore += int64(result.MatchScore)

		// 应用过滤
		if req.OnlyEligible && !result.IsEligible {
			continue
		}
		if req.MinScore > 0 && result.MatchScore < req.MinScore {
			continue
		}
		if strategy == "strict" && !result.IsEligible {
			continue
		}

		allResults = append(allResults, result)
	}

	// 异步批量缓存（不阻塞响应）
	if len(resultsToCache) > 0 {
		go func() {
			_ = s.BatchCacheMatchResults(userID, resultsToCache, profileVersion)
		}()
	}

	// 计算平均分
	if len(positions) > 0 {
		stats.AverageScore = float64(totalScore) / float64(len(positions))
	}

	// 排序
	switch req.SortBy {
	case "recruit_count":
		sortByRecruitCount(allResults)
	case "deadline":
		sortByDeadline(allResults)
	default:
		sortByMatchScore(allResults)
	}

	// 分页
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}

	totalCount := int64(len(allResults))
	start := (req.Page - 1) * req.PageSize
	end := start + req.PageSize

	var results []MatchResult
	if start >= len(allResults) {
		results = []MatchResult{}
	} else if end > len(allResults) {
		results = allResults[start:]
	} else {
		results = allResults[start:end]
	}

	profileSummary := s.buildProfileSummary(profile, preferences)

	return &MatchResponse{
		Results:     results,
		Total:       totalCount,
		Page:        req.Page,
		PageSize:    req.PageSize,
		Stats:       stats,
		UserProfile: profileSummary,
	}, nil
}
