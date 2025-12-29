package service

import (
	"fmt"
	"strings"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

type MatchService struct {
	positionRepo *repository.PositionRepository
	userRepo     *repository.UserRepository
	profileRepo  *repository.UserProfileRepository
	prefRepo     *repository.UserPreferenceRepository
}

func NewMatchService(
	positionRepo *repository.PositionRepository,
	userRepo *repository.UserRepository,
	profileRepo *repository.UserProfileRepository,
	prefRepo *repository.UserPreferenceRepository,
) *MatchService {
	return &MatchService{
		positionRepo: positionRepo,
		userRepo:     userRepo,
		profileRepo:  profileRepo,
		prefRepo:     prefRepo,
	}
}

type MatchResult struct {
	Position       model.Position   `json:"position"`
	MatchScore     int              `json:"match_score"` // 0-100
	MatchDetails   []MatchCondition `json:"match_details"`
	UnmatchReasons []string         `json:"unmatch_reasons,omitempty"`
	IsEligible     bool             `json:"is_eligible"`
}

type MatchCondition struct {
	Condition   string `json:"condition"`
	UserValue   string `json:"user_value"`
	Required    string `json:"required"`
	IsMatch     bool   `json:"is_match"`
	IsHardMatch bool   `json:"is_hard_match"` // 硬性条件
	Score       int    `json:"score"`         // 该条件得分
}

type MatchRequest struct {
	Strategy string `json:"strategy"` // strict, loose, smart
	Page     int    `json:"page"`
	PageSize int    `json:"page_size"`
}

type MatchResponse struct {
	Results  []MatchResult `json:"results"`
	Total    int64         `json:"total"`
	Page     int           `json:"page"`
	PageSize int           `json:"page_size"`
	Stats    MatchStats    `json:"stats"`
}

type MatchStats struct {
	TotalPositions    int64 `json:"total_positions"`
	EligiblePositions int64 `json:"eligible_positions"`
	HighMatchCount    int64 `json:"high_match_count"`   // 匹配度>80%
	MediumMatchCount  int64 `json:"medium_match_count"` // 匹配度60-80%
	LowMatchCount     int64 `json:"low_match_count"`    // 匹配度<60%
}

func (s *MatchService) MatchPositions(userID uint, req *MatchRequest) (*MatchResponse, error) {
	// Get user profile and preferences
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}

	preferences, _ := s.prefRepo.FindByUserID(userID)

	// Get all published positions
	filter := &repository.PositionFilter{}
	publishedStatus := int(model.PositionStatusPublished)
	filter.Status = &publishedStatus

	// Apply preference filters if available
	if preferences != nil && len(preferences.PreferredProvinces) > 0 {
		filter.Province = preferences.PreferredProvinces[0] // Simplified for now
	}

	positions, total, err := s.positionRepo.List(filter, nil, 1, 1000) // Get all for matching
	if err != nil {
		return nil, err
	}

	// Calculate match scores for each position
	var results []MatchResult
	var stats MatchStats
	stats.TotalPositions = total

	strategy := req.Strategy
	if strategy == "" {
		strategy = "smart"
	}

	for _, position := range positions {
		result := s.calculateMatch(profile, preferences, &position, strategy)

		if result.IsEligible {
			stats.EligiblePositions++
		}

		if result.MatchScore >= 80 {
			stats.HighMatchCount++
		} else if result.MatchScore >= 60 {
			stats.MediumMatchCount++
		} else {
			stats.LowMatchCount++
		}

		// For strict mode, only include eligible positions
		if strategy == "strict" && !result.IsEligible {
			continue
		}

		results = append(results, result)
	}

	// Sort by match score (descending)
	sortByMatchScore(results)

	// Apply pagination
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}

	start := (req.Page - 1) * req.PageSize
	end := start + req.PageSize
	if start >= len(results) {
		results = []MatchResult{}
	} else if end > len(results) {
		results = results[start:]
	} else {
		results = results[start:end]
	}

	return &MatchResponse{
		Results:  results,
		Total:    int64(len(results)),
		Page:     req.Page,
		PageSize: req.PageSize,
		Stats:    stats,
	}, nil
}

func (s *MatchService) calculateMatch(profile *model.UserProfile, pref *model.UserPreference, position *model.Position, strategy string) MatchResult {
	result := MatchResult{
		Position:   *position,
		IsEligible: true,
	}

	var details []MatchCondition
	var unmatchReasons []string
	totalScore := 0
	maxScore := 0

	// 1. Education check (Hard condition - 25 points)
	eduMatch := s.checkEducation(profile.Education, position.EducationMin)
	details = append(details, MatchCondition{
		Condition:   "学历要求",
		UserValue:   profile.Education,
		Required:    position.EducationMin,
		IsMatch:     eduMatch,
		IsHardMatch: true,
		Score:       boolToScore(eduMatch, 25),
	})
	maxScore += 25
	if eduMatch {
		totalScore += 25
	} else {
		result.IsEligible = false
		unmatchReasons = append(unmatchReasons, "学历不符合要求")
	}

	// 2. Political status check (Hard condition - 15 points)
	politicalMatch := s.checkPoliticalStatus(profile.PoliticalStatus, position.PoliticalStatus)
	details = append(details, MatchCondition{
		Condition:   "政治面貌",
		UserValue:   profile.PoliticalStatus,
		Required:    position.PoliticalStatus,
		IsMatch:     politicalMatch,
		IsHardMatch: true,
		Score:       boolToScore(politicalMatch, 15),
	})
	maxScore += 15
	if politicalMatch {
		totalScore += 15
	} else {
		result.IsEligible = false
		unmatchReasons = append(unmatchReasons, "政治面貌不符合要求")
	}

	// 3. Age check (Hard condition - 15 points)
	ageMatch := s.checkAge(profile.BirthDate, position.AgeMin, position.AgeMax)
	details = append(details, MatchCondition{
		Condition:   "年龄要求",
		UserValue:   "根据出生日期计算",
		Required:    formatAgeRange(position.AgeMin, position.AgeMax),
		IsMatch:     ageMatch,
		IsHardMatch: true,
		Score:       boolToScore(ageMatch, 15),
	})
	maxScore += 15
	if ageMatch {
		totalScore += 15
	} else {
		result.IsEligible = false
		unmatchReasons = append(unmatchReasons, "年龄不符合要求")
	}

	// 4. Hukou check (Hard condition if required - 10 points)
	if position.HukouRequired {
		hukouMatch := s.checkHukou(profile.HukouProvince, position.HukouProvinces)
		details = append(details, MatchCondition{
			Condition:   "户籍要求",
			UserValue:   profile.HukouProvince,
			Required:    formatHukouRequirement(position.HukouProvinces),
			IsMatch:     hukouMatch,
			IsHardMatch: true,
			Score:       boolToScore(hukouMatch, 10),
		})
		maxScore += 10
		if hukouMatch {
			totalScore += 10
		} else {
			result.IsEligible = false
			unmatchReasons = append(unmatchReasons, "户籍不符合要求")
		}
	}

	// 5. Work experience check (Soft condition - 10 points)
	expMatch := profile.WorkYears >= position.WorkExpYearsMin
	details = append(details, MatchCondition{
		Condition:   "工作经验",
		UserValue:   formatWorkYears(profile.WorkYears),
		Required:    formatWorkYears(position.WorkExpYearsMin),
		IsMatch:     expMatch,
		IsHardMatch: false,
		Score:       boolToScore(expMatch, 10),
	})
	maxScore += 10
	if expMatch {
		totalScore += 10
	}

	// 6. Location preference (Soft condition - 15 points)
	locationScore := 0
	if pref != nil {
		locationScore = s.calculateLocationScore(position.WorkLocationProvince, position.WorkLocationCity, pref.PreferredProvinces, pref.PreferredCities)
	}
	details = append(details, MatchCondition{
		Condition:   "工作地点偏好",
		UserValue:   formatPreferredLocations(pref),
		Required:    position.WorkLocationProvince + " " + position.WorkLocationCity,
		IsMatch:     locationScore > 0,
		IsHardMatch: false,
		Score:       locationScore,
	})
	maxScore += 15
	totalScore += locationScore

	// 7. Major check (Soft condition - 10 points)
	majorMatch := position.MajorUnlimited || s.checkMajor(profile.Major, position.MajorSpecific)
	majorScore := 0
	if majorMatch {
		if position.MajorUnlimited {
			majorScore = 7 // Partial score for unlimited
		} else {
			majorScore = 10 // Full score for exact match
		}
	}
	details = append(details, MatchCondition{
		Condition:   "专业要求",
		UserValue:   profile.Major,
		Required:    formatMajorRequirement(position.MajorUnlimited, position.MajorSpecific),
		IsMatch:     majorMatch,
		IsHardMatch: false,
		Score:       majorScore,
	})
	maxScore += 10
	totalScore += majorScore

	// Calculate final match score
	if maxScore > 0 {
		result.MatchScore = (totalScore * 100) / maxScore
	}

	result.MatchDetails = details
	result.UnmatchReasons = unmatchReasons

	return result
}

// Helper functions
func (s *MatchService) checkEducation(userEdu, requiredEdu string) bool {
	eduLevel := map[string]int{
		"大专": 1,
		"本科": 2,
		"硕士": 3,
		"博士": 4,
	}

	userLevel, ok1 := eduLevel[userEdu]
	requiredLevel, ok2 := eduLevel[requiredEdu]

	if !ok1 || !ok2 {
		return true // If unknown, assume match
	}

	return userLevel >= requiredLevel
}

func (s *MatchService) checkPoliticalStatus(userStatus, requiredStatus string) bool {
	if requiredStatus == "不限" || requiredStatus == "" {
		return true
	}
	return userStatus == requiredStatus ||
		(requiredStatus == "党员" && userStatus == "预备党员")
}

func (s *MatchService) checkAge(birthDate *time.Time, minAge, maxAge int) bool {
	if birthDate == nil {
		return true // Can't determine, assume match
	}

	age := calculateAge(*birthDate)
	return age >= minAge && age <= maxAge
}

func (s *MatchService) checkHukou(userProvince string, allowedProvinces []string) bool {
	if len(allowedProvinces) == 0 {
		return true
	}

	for _, p := range allowedProvinces {
		if p == userProvince {
			return true
		}
	}
	return false
}

func (s *MatchService) checkMajor(userMajor string, requiredMajors []string) bool {
	if len(requiredMajors) == 0 {
		return true
	}

	for _, m := range requiredMajors {
		if m == userMajor {
			return true
		}
	}
	return false
}

func (s *MatchService) calculateLocationScore(province, city string, prefProvinces, prefCities []string) int {
	score := 0

	for _, p := range prefProvinces {
		if p == province {
			score += 10
			break
		}
	}

	for _, c := range prefCities {
		if c == city {
			score += 5
			break
		}
	}

	return score
}

// Utility functions
func boolToScore(match bool, maxScore int) int {
	if match {
		return maxScore
	}
	return 0
}

func formatAgeRange(min, max int) string {
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
		return "不限"
	}
	return fmt.Sprintf("%d年以上", years)
}

func formatPreferredLocations(pref *model.UserPreference) string {
	if pref == nil {
		return "未设置"
	}
	locations := append(pref.PreferredProvinces, pref.PreferredCities...)
	if len(locations) == 0 {
		return "未设置"
	}
	return strings.Join(locations, ", ")
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

func calculateAge(birthDate time.Time) int {
	now := time.Now()
	age := now.Year() - birthDate.Year()
	if now.YearDay() < birthDate.YearDay() {
		age--
	}
	return age
}

func sortByMatchScore(results []MatchResult) {
	for i := 0; i < len(results)-1; i++ {
		for j := i + 1; j < len(results); j++ {
			if results[j].MatchScore > results[i].MatchScore {
				results[i], results[j] = results[j], results[i]
			}
		}
	}
}

// Match Report
type MatchReport struct {
	UserProfile     *model.UserProfile `json:"user_profile"`
	TotalPositions  int64              `json:"total_positions"`
	EligibleCount   int64              `json:"eligible_count"`
	ByExamType      map[string]int64   `json:"by_exam_type"`
	ByProvince      map[string]int64   `json:"by_province"`
	Strengths       []string           `json:"strengths"`
	Weaknesses      []string           `json:"weaknesses"`
	Recommendations []string           `json:"recommendations"`
}

func (s *MatchService) GenerateMatchReport(userID uint) (*MatchReport, error) {
	profile, err := s.profileRepo.FindByUserID(userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}

	// Get match results
	matchResp, err := s.MatchPositions(userID, &MatchRequest{
		Strategy: "smart",
		Page:     1,
		PageSize: 1000,
	})
	if err != nil {
		return nil, err
	}

	report := &MatchReport{
		UserProfile:    profile,
		TotalPositions: matchResp.Stats.TotalPositions,
		EligibleCount:  matchResp.Stats.EligiblePositions,
		ByExamType:     make(map[string]int64),
		ByProvince:     make(map[string]int64),
	}

	// Analyze strengths and weaknesses
	if profile.Education == "硕士" || profile.Education == "博士" {
		report.Strengths = append(report.Strengths, "高学历优势，可报考更多岗位")
	}
	if profile.PoliticalStatus == "党员" {
		report.Strengths = append(report.Strengths, "党员身份可报考限党员岗位")
	}
	if profile.WorkYears >= 2 {
		report.Strengths = append(report.Strengths, "有工作经验，可报考有经验要求岗位")
	}

	if profile.Education == "大专" {
		report.Weaknesses = append(report.Weaknesses, "大专学历限制较多，建议提升学历")
	}
	if profile.PoliticalStatus == "群众" {
		report.Weaknesses = append(report.Weaknesses, "非党员身份，部分岗位无法报考")
	}

	// Recommendations
	report.Recommendations = append(report.Recommendations, "建议完善个人简历信息以获得更精准匹配")
	if matchResp.Stats.EligiblePositions > 0 {
		report.Recommendations = append(report.Recommendations,
			fmt.Sprintf("您当前可报考%d个岗位，建议尽早收藏关注", matchResp.Stats.EligiblePositions))
	}

	return report, nil
}
