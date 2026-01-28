package config

import (
	"errors"
)

// MatchWeightConfig 匹配权重配置
type MatchWeightConfig struct {
	// 硬性条件权重
	Education int `json:"education" yaml:"education"` // 学历匹配权重（默认25%）
	Political int `json:"political" yaml:"political"` // 政治面貌权重（默认15%）
	Age       int `json:"age" yaml:"age"`             // 年龄匹配权重（默认15%）
	Hukou     int `json:"hukou" yaml:"hukou"`         // 户籍要求权重（默认10%）

	// 软性条件权重
	Major      int `json:"major" yaml:"major"`           // 专业匹配权重（默认10%）
	Experience int `json:"experience" yaml:"experience"` // 工作经验权重（默认10%）
	Location   int `json:"location" yaml:"location"`     // 工作地点偏好权重（默认15%）
}

// DefaultMatchWeights 默认匹配权重配置
var DefaultMatchWeights = MatchWeightConfig{
	Education:  25,
	Political:  15,
	Age:        15,
	Hukou:      10,
	Major:      10,
	Experience: 10,
	Location:   15,
}

// Validate 验证权重配置（总和必须为100）
func (w *MatchWeightConfig) Validate() error {
	total := w.Education + w.Political + w.Age + w.Hukou + w.Major + w.Experience + w.Location
	if total != 100 {
		return errors.New("match weights must sum to 100")
	}

	// 验证每个权重值是否在有效范围内
	if w.Education < 0 || w.Education > 100 {
		return errors.New("education weight must be between 0 and 100")
	}
	if w.Political < 0 || w.Political > 100 {
		return errors.New("political weight must be between 0 and 100")
	}
	if w.Age < 0 || w.Age > 100 {
		return errors.New("age weight must be between 0 and 100")
	}
	if w.Hukou < 0 || w.Hukou > 100 {
		return errors.New("hukou weight must be between 0 and 100")
	}
	if w.Major < 0 || w.Major > 100 {
		return errors.New("major weight must be between 0 and 100")
	}
	if w.Experience < 0 || w.Experience > 100 {
		return errors.New("experience weight must be between 0 and 100")
	}
	if w.Location < 0 || w.Location > 100 {
		return errors.New("location weight must be between 0 and 100")
	}

	return nil
}

// GetHardWeightTotal 获取硬性条件总权重
func (w *MatchWeightConfig) GetHardWeightTotal() int {
	return w.Education + w.Political + w.Age + w.Hukou
}

// GetSoftWeightTotal 获取软性条件总权重
func (w *MatchWeightConfig) GetSoftWeightTotal() int {
	return w.Major + w.Experience + w.Location
}

// MatchScoreLevel 匹配分数等级
type MatchScoreLevel int

const (
	MatchScoreLevelLow     MatchScoreLevel = 1 // 低匹配 (0-49%)
	MatchScoreLevelMedium  MatchScoreLevel = 2 // 中匹配 (50-69%)
	MatchScoreLevelHigh    MatchScoreLevel = 3 // 高匹配 (70-84%)
	MatchScoreLevelPerfect MatchScoreLevel = 4 // 完美匹配 (85-100%)
)

// GetMatchLevel 根据分数获取匹配等级
func GetMatchLevel(score int) MatchScoreLevel {
	switch {
	case score >= 85:
		return MatchScoreLevelPerfect
	case score >= 70:
		return MatchScoreLevelHigh
	case score >= 50:
		return MatchScoreLevelMedium
	default:
		return MatchScoreLevelLow
	}
}

// GetMatchLevelName 获取匹配等级名称
func GetMatchLevelName(level MatchScoreLevel) string {
	switch level {
	case MatchScoreLevelPerfect:
		return "完美匹配"
	case MatchScoreLevelHigh:
		return "高度匹配"
	case MatchScoreLevelMedium:
		return "中度匹配"
	default:
		return "低匹配"
	}
}

// GetMatchLevelStars 获取匹配等级星级（1-5星）
func GetMatchLevelStars(score int) int {
	switch {
	case score >= 90:
		return 5
	case score >= 80:
		return 4
	case score >= 70:
		return 3
	case score >= 50:
		return 2
	default:
		return 1
	}
}
