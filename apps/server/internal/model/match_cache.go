package model

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// MatchCache 匹配结果缓存
// 用于缓存用户与职位的匹配结果，避免重复计算
type MatchCache struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	UserID     uint   `gorm:"index:idx_match_cache_user_position,unique;not null" json:"user_id"`
	PositionID string `gorm:"type:varchar(50);index:idx_match_cache_user_position,unique;not null" json:"position_id"`

	// 匹配结果
	MatchScore int    `gorm:"type:int;not null" json:"match_score"`         // 总匹配分数 0-100
	HardScore  int    `gorm:"type:int;not null" json:"hard_score"`          // 硬性条件得分 0-100
	SoftScore  int    `gorm:"type:int;not null" json:"soft_score"`          // 软性条件得分 0-100
	StarLevel  int    `gorm:"type:tinyint;not null" json:"star_level"`      // 星级 1-5
	MatchLevel string `gorm:"type:varchar(20);not null" json:"match_level"` // 匹配等级文字
	IsEligible bool   `gorm:"default:false" json:"is_eligible"`             // 是否符合条件

	// 详情（JSON存储）
	MatchDetailsJSON   string `gorm:"type:text" json:"-"` // 匹配详情 JSON
	UnmatchReasonsJSON string `gorm:"type:text" json:"-"` // 不匹配原因 JSON
	SuggestionsJSON    string `gorm:"type:text" json:"-"` // 建议 JSON

	// 缓存元数据
	ProfileVersion  int64     `gorm:"type:bigint;not null" json:"profile_version"`  // 用户画像版本号
	PositionVersion int64     `gorm:"type:bigint;not null" json:"position_version"` // 职位版本号（更新时间戳）
	ExpiresAt       time.Time `gorm:"type:datetime;index" json:"expires_at"`        // 过期时间

	// 系统字段
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (MatchCache) TableName() string {
	return "what_match_cache"
}

// MatchCacheDetail 匹配详情（用于 JSON 序列化）
type MatchCacheDetail struct {
	Condition   string `json:"condition"`
	UserValue   string `json:"user_value"`
	Required    string `json:"required"`
	IsMatch     bool   `json:"is_match"`
	IsHardMatch bool   `json:"is_hard_match"`
	Score       int    `json:"score"`
	MaxScore    int    `json:"max_score"`
	Weight      int    `json:"weight"`
}

// SetMatchDetails 设置匹配详情
func (m *MatchCache) SetMatchDetails(details []MatchCacheDetail) error {
	data, err := json.Marshal(details)
	if err != nil {
		return err
	}
	m.MatchDetailsJSON = string(data)
	return nil
}

// GetMatchDetails 获取匹配详情
func (m *MatchCache) GetMatchDetails() ([]MatchCacheDetail, error) {
	if m.MatchDetailsJSON == "" {
		return []MatchCacheDetail{}, nil
	}
	var details []MatchCacheDetail
	err := json.Unmarshal([]byte(m.MatchDetailsJSON), &details)
	return details, err
}

// SetUnmatchReasons 设置不匹配原因
func (m *MatchCache) SetUnmatchReasons(reasons []string) error {
	data, err := json.Marshal(reasons)
	if err != nil {
		return err
	}
	m.UnmatchReasonsJSON = string(data)
	return nil
}

// GetUnmatchReasons 获取不匹配原因
func (m *MatchCache) GetUnmatchReasons() ([]string, error) {
	if m.UnmatchReasonsJSON == "" {
		return []string{}, nil
	}
	var reasons []string
	err := json.Unmarshal([]byte(m.UnmatchReasonsJSON), &reasons)
	return reasons, err
}

// SetSuggestions 设置建议
func (m *MatchCache) SetSuggestions(suggestions []string) error {
	data, err := json.Marshal(suggestions)
	if err != nil {
		return err
	}
	m.SuggestionsJSON = string(data)
	return nil
}

// GetSuggestions 获取建议
func (m *MatchCache) GetSuggestions() ([]string, error) {
	if m.SuggestionsJSON == "" {
		return []string{}, nil
	}
	var suggestions []string
	err := json.Unmarshal([]byte(m.SuggestionsJSON), &suggestions)
	return suggestions, err
}

// IsExpired 检查缓存是否过期
func (m *MatchCache) IsExpired() bool {
	return time.Now().After(m.ExpiresAt)
}

// MatchCacheStats 匹配缓存统计
type MatchCacheStats struct {
	TotalCached       int64   `json:"total_cached"`        // 总缓存数量
	ExpiredCount      int64   `json:"expired_count"`       // 过期缓存数量
	HitRate           float64 `json:"hit_rate"`            // 缓存命中率
	AverageMatchScore float64 `json:"average_match_score"` // 平均匹配分
	EligibleRate      float64 `json:"eligible_rate"`       // 符合条件比例
}
