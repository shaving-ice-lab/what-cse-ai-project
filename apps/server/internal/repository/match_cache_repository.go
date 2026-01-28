package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// MatchCacheRepository 匹配缓存仓库
type MatchCacheRepository struct {
	db *gorm.DB
}

// NewMatchCacheRepository 创建匹配缓存仓库
func NewMatchCacheRepository(db *gorm.DB) *MatchCacheRepository {
	return &MatchCacheRepository{db: db}
}

// =====================================================
// 缓存 CRUD 操作
// =====================================================

// Get 获取单个匹配缓存
func (r *MatchCacheRepository) Get(userID uint, positionID string) (*model.MatchCache, error) {
	var cache model.MatchCache
	err := r.db.Where("user_id = ? AND position_id = ?", userID, positionID).First(&cache).Error
	if err != nil {
		return nil, err
	}
	return &cache, nil
}

// GetValid 获取有效的匹配缓存（未过期且版本匹配）
func (r *MatchCacheRepository) GetValid(userID uint, positionID string, profileVersion, positionVersion int64) (*model.MatchCache, error) {
	var cache model.MatchCache
	err := r.db.Where(
		"user_id = ? AND position_id = ? AND profile_version = ? AND position_version = ? AND expires_at > ?",
		userID, positionID, profileVersion, positionVersion, time.Now(),
	).First(&cache).Error
	if err != nil {
		return nil, err
	}
	return &cache, nil
}

// GetByUser 获取用户的所有有效缓存
func (r *MatchCacheRepository) GetByUser(userID uint, page, pageSize int) ([]model.MatchCache, int64, error) {
	var caches []model.MatchCache
	var total int64

	query := r.db.Model(&model.MatchCache{}).Where("user_id = ? AND expires_at > ?", userID, time.Now())
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	err := query.Order("match_score DESC").Offset(offset).Limit(pageSize).Find(&caches).Error
	return caches, total, err
}

// GetTopMatches 获取用户的最高匹配结果
func (r *MatchCacheRepository) GetTopMatches(userID uint, limit int) ([]model.MatchCache, error) {
	var caches []model.MatchCache
	err := r.db.Where("user_id = ? AND expires_at > ?", userID, time.Now()).
		Order("match_score DESC").
		Limit(limit).
		Find(&caches).Error
	return caches, err
}

// GetEligibleMatches 获取符合条件的匹配
func (r *MatchCacheRepository) GetEligibleMatches(userID uint, page, pageSize int) ([]model.MatchCache, int64, error) {
	var caches []model.MatchCache
	var total int64

	query := r.db.Model(&model.MatchCache{}).
		Where("user_id = ? AND is_eligible = ? AND expires_at > ?", userID, true, time.Now())
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	err := query.Order("match_score DESC").Offset(offset).Limit(pageSize).Find(&caches).Error
	return caches, total, err
}

// BatchGet 批量获取匹配缓存
func (r *MatchCacheRepository) BatchGet(userID uint, positionIDs []string) (map[string]*model.MatchCache, error) {
	var caches []model.MatchCache
	err := r.db.Where("user_id = ? AND position_id IN ? AND expires_at > ?", userID, positionIDs, time.Now()).
		Find(&caches).Error
	if err != nil {
		return nil, err
	}

	result := make(map[string]*model.MatchCache)
	for i := range caches {
		result[caches[i].PositionID] = &caches[i]
	}
	return result, nil
}

// Set 保存或更新匹配缓存（使用 Upsert）
func (r *MatchCacheRepository) Set(cache *model.MatchCache) error {
	return r.db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "user_id"}, {Name: "position_id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"match_score", "hard_score", "soft_score", "star_level", "match_level", "is_eligible",
			"match_details_json", "unmatch_reasons_json", "suggestions_json",
			"profile_version", "position_version", "expires_at", "updated_at",
		}),
	}).Create(cache).Error
}

// BatchSet 批量保存匹配缓存
func (r *MatchCacheRepository) BatchSet(caches []model.MatchCache) error {
	if len(caches) == 0 {
		return nil
	}
	return r.db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "user_id"}, {Name: "position_id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"match_score", "hard_score", "soft_score", "star_level", "match_level", "is_eligible",
			"match_details_json", "unmatch_reasons_json", "suggestions_json",
			"profile_version", "position_version", "expires_at", "updated_at",
		}),
	}).CreateInBatches(caches, 100).Error
}

// =====================================================
// 缓存清理操作
// =====================================================

// Delete 删除单个缓存
func (r *MatchCacheRepository) Delete(userID uint, positionID string) error {
	return r.db.Where("user_id = ? AND position_id = ?", userID, positionID).
		Delete(&model.MatchCache{}).Error
}

// DeleteByUser 删除用户的所有缓存（用户画像变更时调用）
func (r *MatchCacheRepository) DeleteByUser(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&model.MatchCache{}).Error
}

// DeleteByPosition 删除职位的所有缓存（职位更新时调用）
func (r *MatchCacheRepository) DeleteByPosition(positionID string) error {
	return r.db.Where("position_id = ?", positionID).Delete(&model.MatchCache{}).Error
}

// DeleteByPositions 批量删除职位缓存
func (r *MatchCacheRepository) DeleteByPositions(positionIDs []string) error {
	if len(positionIDs) == 0 {
		return nil
	}
	return r.db.Where("position_id IN ?", positionIDs).Delete(&model.MatchCache{}).Error
}

// DeleteExpired 删除所有过期缓存
func (r *MatchCacheRepository) DeleteExpired() (int64, error) {
	result := r.db.Where("expires_at < ?", time.Now()).Delete(&model.MatchCache{})
	return result.RowsAffected, result.Error
}

// DeleteOlderThan 删除指定时间之前的缓存
func (r *MatchCacheRepository) DeleteOlderThan(before time.Time) (int64, error) {
	result := r.db.Where("created_at < ?", before).Delete(&model.MatchCache{})
	return result.RowsAffected, result.Error
}

// Cleanup 清理过期和无效缓存（定时任务调用）
func (r *MatchCacheRepository) Cleanup() (int64, error) {
	// 删除过期缓存
	result := r.db.Where("expires_at < ?", time.Now()).Delete(&model.MatchCache{})
	return result.RowsAffected, result.Error
}

// =====================================================
// 缓存统计
// =====================================================

// GetStats 获取缓存统计
func (r *MatchCacheRepository) GetStats() (*model.MatchCacheStats, error) {
	stats := &model.MatchCacheStats{}

	// 总缓存数量
	r.db.Model(&model.MatchCache{}).Count(&stats.TotalCached)

	// 过期缓存数量
	r.db.Model(&model.MatchCache{}).Where("expires_at < ?", time.Now()).Count(&stats.ExpiredCount)

	// 平均匹配分和符合条件比例
	type Result struct {
		AvgScore      float64
		EligibleCount int64
	}
	var result Result
	r.db.Model(&model.MatchCache{}).
		Where("expires_at > ?", time.Now()).
		Select("AVG(match_score) as avg_score, SUM(CASE WHEN is_eligible THEN 1 ELSE 0 END) as eligible_count").
		Scan(&result)

	stats.AverageMatchScore = result.AvgScore

	var validCount int64
	r.db.Model(&model.MatchCache{}).Where("expires_at > ?", time.Now()).Count(&validCount)
	if validCount > 0 {
		stats.EligibleRate = float64(result.EligibleCount) / float64(validCount) * 100
	}

	return stats, nil
}

// GetUserStats 获取用户的缓存统计
func (r *MatchCacheRepository) GetUserStats(userID uint) (*model.MatchCacheStats, error) {
	stats := &model.MatchCacheStats{}

	// 用户缓存数量
	r.db.Model(&model.MatchCache{}).Where("user_id = ?", userID).Count(&stats.TotalCached)

	// 过期缓存数量
	r.db.Model(&model.MatchCache{}).
		Where("user_id = ? AND expires_at < ?", userID, time.Now()).
		Count(&stats.ExpiredCount)

	// 平均匹配分和符合条件比例
	type Result struct {
		AvgScore      float64
		EligibleCount int64
	}
	var result Result
	r.db.Model(&model.MatchCache{}).
		Where("user_id = ? AND expires_at > ?", userID, time.Now()).
		Select("AVG(match_score) as avg_score, SUM(CASE WHEN is_eligible THEN 1 ELSE 0 END) as eligible_count").
		Scan(&result)

	stats.AverageMatchScore = result.AvgScore

	var validCount int64
	r.db.Model(&model.MatchCache{}).
		Where("user_id = ? AND expires_at > ?", userID, time.Now()).
		Count(&validCount)
	if validCount > 0 {
		stats.EligibleRate = float64(result.EligibleCount) / float64(validCount) * 100
	}

	return stats, nil
}

// CountByUser 获取用户的缓存数量
func (r *MatchCacheRepository) CountByUser(userID uint) int64 {
	var count int64
	r.db.Model(&model.MatchCache{}).
		Where("user_id = ? AND expires_at > ?", userID, time.Now()).
		Count(&count)
	return count
}

// CountValidCaches 获取有效缓存数量
func (r *MatchCacheRepository) CountValidCaches() int64 {
	var count int64
	r.db.Model(&model.MatchCache{}).Where("expires_at > ?", time.Now()).Count(&count)
	return count
}

// =====================================================
// 预计算热门职位
// =====================================================

// PrecomputeHotPositions 预计算热门职位的匹配结果
// 返回需要计算的职位ID列表（仅返回尚未为该用户缓存的职位）
func (r *MatchCacheRepository) GetUncachedHotPositions(userID uint, hotPositionIDs []string) ([]string, error) {
	if len(hotPositionIDs) == 0 {
		return []string{}, nil
	}

	// 获取已缓存的职位ID
	var cachedPositionIDs []string
	err := r.db.Model(&model.MatchCache{}).
		Where("user_id = ? AND position_id IN ? AND expires_at > ?", userID, hotPositionIDs, time.Now()).
		Pluck("position_id", &cachedPositionIDs).Error
	if err != nil {
		return nil, err
	}

	// 计算未缓存的职位ID
	cachedSet := make(map[string]bool)
	for _, id := range cachedPositionIDs {
		cachedSet[id] = true
	}

	var uncachedIDs []string
	for _, id := range hotPositionIDs {
		if !cachedSet[id] {
			uncachedIDs = append(uncachedIDs, id)
		}
	}

	return uncachedIDs, nil
}

// GetPositionMatchCount 获取职位被匹配的次数
func (r *MatchCacheRepository) GetPositionMatchCount(positionID string) int64 {
	var count int64
	r.db.Model(&model.MatchCache{}).Where("position_id = ?", positionID).Count(&count)
	return count
}

// GetHotCachedPositions 获取被缓存最多的职位ID列表
func (r *MatchCacheRepository) GetHotCachedPositions(limit int) ([]string, error) {
	type Result struct {
		PositionID string
		Count      int64
	}
	var results []Result

	err := r.db.Model(&model.MatchCache{}).
		Select("position_id, COUNT(*) as count").
		Group("position_id").
		Order("count DESC").
		Limit(limit).
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	positionIDs := make([]string, len(results))
	for i, r := range results {
		positionIDs[i] = r.PositionID
	}
	return positionIDs, nil
}
