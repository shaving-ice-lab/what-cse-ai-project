package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// WechatRSSSourceRepository handles database operations for WeChat RSS sources
type WechatRSSSourceRepository struct {
	db *gorm.DB
}

func NewWechatRSSSourceRepository(db *gorm.DB) *WechatRSSSourceRepository {
	return &WechatRSSSourceRepository{db: db}
}

func (r *WechatRSSSourceRepository) Create(source *model.WechatRSSSource) error {
	return r.db.Create(source).Error
}

func (r *WechatRSSSourceRepository) FindByID(id uint) (*model.WechatRSSSource, error) {
	var source model.WechatRSSSource
	err := r.db.First(&source, id).Error
	if err != nil {
		return nil, err
	}
	return &source, nil
}

func (r *WechatRSSSourceRepository) FindByRSSURL(rssURL string) (*model.WechatRSSSource, error) {
	var source model.WechatRSSSource
	err := r.db.Where("rss_url = ?", rssURL).First(&source).Error
	if err != nil {
		return nil, err
	}
	return &source, nil
}

func (r *WechatRSSSourceRepository) ExistsByRSSURL(rssURL string) (bool, error) {
	var count int64
	err := r.db.Model(&model.WechatRSSSource{}).Where("rss_url = ?", rssURL).Count(&count).Error
	return count > 0, err
}

func (r *WechatRSSSourceRepository) List(status *model.WechatRSSSourceStatus) ([]model.WechatRSSSource, error) {
	var sources []model.WechatRSSSource
	query := r.db.Model(&model.WechatRSSSource{})
	if status != nil {
		query = query.Where("status = ?", *status)
	}
	err := query.Order("created_at DESC").Find(&sources).Error
	return sources, err
}

func (r *WechatRSSSourceRepository) ListDueToCrawl() ([]model.WechatRSSSource, error) {
	var sources []model.WechatRSSSource
	now := time.Now()
	err := r.db.Where("status = ? AND (next_crawl_at IS NULL OR next_crawl_at <= ?)",
		model.WechatRSSSourceStatusActive, now).
		Order("next_crawl_at ASC").
		Find(&sources).Error
	return sources, err
}

func (r *WechatRSSSourceRepository) Update(source *model.WechatRSSSource) error {
	return r.db.Save(source).Error
}

func (r *WechatRSSSourceRepository) UpdateStatus(id uint, status model.WechatRSSSourceStatus, errorMsg string) error {
	updates := map[string]interface{}{
		"status":        status,
		"error_message": errorMsg,
	}
	if status == model.WechatRSSSourceStatusError {
		updates["error_count"] = gorm.Expr("error_count + 1")
	} else if status == model.WechatRSSSourceStatusActive {
		updates["error_count"] = 0
		updates["error_message"] = ""
	}
	return r.db.Model(&model.WechatRSSSource{}).Where("id = ?", id).Updates(updates).Error
}

func (r *WechatRSSSourceRepository) UpdateCrawlTime(id uint, lastCrawl, nextCrawl time.Time) error {
	return r.db.Model(&model.WechatRSSSource{}).Where("id = ?", id).Updates(map[string]interface{}{
		"last_crawl_at": lastCrawl,
		"next_crawl_at": nextCrawl,
	}).Error
}

func (r *WechatRSSSourceRepository) IncrementArticleCount(id uint, count int) error {
	return r.db.Model(&model.WechatRSSSource{}).Where("id = ?", id).
		Update("article_count", gorm.Expr("article_count + ?", count)).Error
}

func (r *WechatRSSSourceRepository) Delete(id uint) error {
	return r.db.Delete(&model.WechatRSSSource{}, id).Error
}

func (r *WechatRSSSourceRepository) GetTotalCount() (int64, error) {
	var count int64
	err := r.db.Model(&model.WechatRSSSource{}).Count(&count).Error
	return count, err
}

func (r *WechatRSSSourceRepository) GetCountByStatus(status model.WechatRSSSourceStatus) (int64, error) {
	var count int64
	err := r.db.Model(&model.WechatRSSSource{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

// WechatRSSArticleRepository handles database operations for WeChat RSS articles
type WechatRSSArticleRepository struct {
	db *gorm.DB
}

func NewWechatRSSArticleRepository(db *gorm.DB) *WechatRSSArticleRepository {
	return &WechatRSSArticleRepository{db: db}
}

func (r *WechatRSSArticleRepository) Create(article *model.WechatRSSArticle) error {
	return r.db.Create(article).Error
}

func (r *WechatRSSArticleRepository) FindByID(id uint) (*model.WechatRSSArticle, error) {
	var article model.WechatRSSArticle
	err := r.db.Preload("Source").First(&article, id).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *WechatRSSArticleRepository) FindByGUID(guid string) (*model.WechatRSSArticle, error) {
	var article model.WechatRSSArticle
	err := r.db.Where("guid = ?", guid).First(&article).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *WechatRSSArticleRepository) ExistsByGUID(guid string) (bool, error) {
	var count int64
	err := r.db.Model(&model.WechatRSSArticle{}).Where("guid = ?", guid).Count(&count).Error
	return count > 0, err
}

func (r *WechatRSSArticleRepository) List(params *model.WechatRSSArticleListParams) ([]model.WechatRSSArticle, int64, error) {
	var articles []model.WechatRSSArticle
	var total int64

	query := r.db.Model(&model.WechatRSSArticle{}).Preload("Source")

	if params.SourceID > 0 {
		query = query.Where("source_id = ?", params.SourceID)
	}
	if params.ReadStatus != nil {
		query = query.Where("read_status = ?", *params.ReadStatus)
	}
	if params.Keyword != "" {
		query = query.Where("title LIKE ? OR description LIKE ?", "%"+params.Keyword+"%", "%"+params.Keyword+"%")
	}
	if params.StartDate != nil {
		query = query.Where("pub_date >= ?", params.StartDate)
	}
	if params.EndDate != nil {
		query = query.Where("pub_date <= ?", params.EndDate)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (params.Page - 1) * params.PageSize
	if err := query.Offset(offset).Limit(params.PageSize).Order("pub_date DESC, created_at DESC").Find(&articles).Error; err != nil {
		return nil, 0, err
	}

	return articles, total, nil
}

func (r *WechatRSSArticleRepository) ListBySourceID(sourceID uint, limit int) ([]model.WechatRSSArticle, error) {
	var articles []model.WechatRSSArticle
	query := r.db.Where("source_id = ?", sourceID).Order("pub_date DESC")
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Find(&articles).Error
	return articles, err
}

func (r *WechatRSSArticleRepository) Update(article *model.WechatRSSArticle) error {
	return r.db.Save(article).Error
}

func (r *WechatRSSArticleRepository) UpdateReadStatus(id uint, status model.WechatRSSReadStatus) error {
	updates := map[string]interface{}{
		"read_status": status,
	}
	if status == model.WechatRSSReadStatusRead || status == model.WechatRSSReadStatusStarred {
		updates["read_at"] = time.Now()
	}
	return r.db.Model(&model.WechatRSSArticle{}).Where("id = ?", id).Updates(updates).Error
}

func (r *WechatRSSArticleRepository) BatchUpdateReadStatus(ids []uint, status model.WechatRSSReadStatus) error {
	updates := map[string]interface{}{
		"read_status": status,
	}
	if status == model.WechatRSSReadStatusRead || status == model.WechatRSSReadStatusStarred {
		updates["read_at"] = time.Now()
	}
	return r.db.Model(&model.WechatRSSArticle{}).Where("id IN ?", ids).Updates(updates).Error
}

func (r *WechatRSSArticleRepository) MarkAllAsRead(sourceID uint) error {
	query := r.db.Model(&model.WechatRSSArticle{}).Where("read_status = ?", model.WechatRSSReadStatusUnread)
	if sourceID > 0 {
		query = query.Where("source_id = ?", sourceID)
	}
	return query.Updates(map[string]interface{}{
		"read_status": model.WechatRSSReadStatusRead,
		"read_at":     time.Now(),
	}).Error
}

func (r *WechatRSSArticleRepository) BatchCreate(articles []model.WechatRSSArticle) (int, error) {
	result := r.db.CreateInBatches(articles, 100)
	return int(result.RowsAffected), result.Error
}

func (r *WechatRSSArticleRepository) BatchUpsert(articles []model.WechatRSSArticle) (int, error) {
	var created int
	for _, article := range articles {
		exists, _ := r.ExistsByGUID(article.GUID)
		if !exists {
			if err := r.Create(&article); err == nil {
				created++
			}
		}
	}
	return created, nil
}

func (r *WechatRSSArticleRepository) Delete(id uint) error {
	return r.db.Delete(&model.WechatRSSArticle{}, id).Error
}

func (r *WechatRSSArticleRepository) DeleteBySourceID(sourceID uint) error {
	return r.db.Where("source_id = ?", sourceID).Delete(&model.WechatRSSArticle{}).Error
}

func (r *WechatRSSArticleRepository) GetTotalCount() (int64, error) {
	var count int64
	err := r.db.Model(&model.WechatRSSArticle{}).Count(&count).Error
	return count, err
}

func (r *WechatRSSArticleRepository) GetUnreadCount(sourceID uint) (int64, error) {
	var count int64
	query := r.db.Model(&model.WechatRSSArticle{}).Where("read_status = ?", model.WechatRSSReadStatusUnread)
	if sourceID > 0 {
		query = query.Where("source_id = ?", sourceID)
	}
	err := query.Count(&count).Error
	return count, err
}

func (r *WechatRSSArticleRepository) GetStarredCount() (int64, error) {
	var count int64
	err := r.db.Model(&model.WechatRSSArticle{}).Where("read_status = ?", model.WechatRSSReadStatusStarred).Count(&count).Error
	return count, err
}

func (r *WechatRSSArticleRepository) GetTodayCount() (int64, error) {
	var count int64
	today := time.Now().Truncate(24 * time.Hour)
	err := r.db.Model(&model.WechatRSSArticle{}).Where("created_at >= ?", today).Count(&count).Error
	return count, err
}

func (r *WechatRSSArticleRepository) GetCountBySource() (map[uint]int64, error) {
	var results []struct {
		SourceID uint
		Count    int64
	}

	err := r.db.Model(&model.WechatRSSArticle{}).
		Select("source_id, COUNT(*) as count").
		Group("source_id").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[uint]int64)
	for _, r := range results {
		stats[r.SourceID] = r.Count
	}
	return stats, nil
}

func (r *WechatRSSArticleRepository) GetUnreadCountBySource() (map[uint]int64, error) {
	var results []struct {
		SourceID uint
		Count    int64
	}

	err := r.db.Model(&model.WechatRSSArticle{}).
		Select("source_id, COUNT(*) as count").
		Where("read_status = ?", model.WechatRSSReadStatusUnread).
		Group("source_id").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[uint]int64)
	for _, r := range results {
		stats[r.SourceID] = r.Count
	}
	return stats, nil
}
