package repository

import (
	"github.com/what-cse/server/internal/model"

	"gorm.io/gorm"
)

// =====================================================
// §25.3 知识点内容生成 Repository
// =====================================================

// KnowledgeDetailRepository 知识点详情 Repository
type KnowledgeDetailRepository struct {
	db *gorm.DB
}

func NewKnowledgeDetailRepository(db *gorm.DB) *KnowledgeDetailRepository {
	return &KnowledgeDetailRepository{db: db}
}

// Create 创建知识点详情
func (r *KnowledgeDetailRepository) Create(detail *model.KnowledgeDetail) error {
	return r.db.Create(detail).Error
}

// BatchCreate 批量创建
func (r *KnowledgeDetailRepository) BatchCreate(details []*model.KnowledgeDetail) error {
	return r.db.CreateInBatches(details, 100).Error
}

// Update 更新知识点详情
func (r *KnowledgeDetailRepository) Update(detail *model.KnowledgeDetail) error {
	return r.db.Save(detail).Error
}

// Delete 删除知识点详情
func (r *KnowledgeDetailRepository) Delete(id uint) error {
	return r.db.Delete(&model.KnowledgeDetail{}, id).Error
}

// GetByID 根据ID获取
func (r *KnowledgeDetailRepository) GetByID(id uint) (*model.KnowledgeDetail, error) {
	var detail model.KnowledgeDetail
	err := r.db.First(&detail, id).Error
	if err != nil {
		return nil, err
	}
	return &detail, nil
}

// GetByKnowledgePoint 获取知识点的所有详情
func (r *KnowledgeDetailRepository) GetByKnowledgePoint(knowledgePointID uint) ([]*model.KnowledgeDetail, error) {
	var details []*model.KnowledgeDetail
	err := r.db.Where("knowledge_point_id = ? AND is_active = ?", knowledgePointID, true).
		Order("content_type, sort_order").
		Find(&details).Error
	return details, err
}

// GetByKnowledgePointAndType 获取指定类型的详情
func (r *KnowledgeDetailRepository) GetByKnowledgePointAndType(knowledgePointID uint, contentType model.KnowledgeDetailContentType) ([]*model.KnowledgeDetail, error) {
	var details []*model.KnowledgeDetail
	err := r.db.Where("knowledge_point_id = ? AND content_type = ? AND is_active = ?", knowledgePointID, contentType, true).
		Order("sort_order").
		Find(&details).Error
	return details, err
}

// List 获取列表
func (r *KnowledgeDetailRepository) List(params *KnowledgeDetailQueryParams) ([]*model.KnowledgeDetail, int64, error) {
	var details []*model.KnowledgeDetail
	var total int64

	query := r.db.Model(&model.KnowledgeDetail{})

	if params.KnowledgePointID > 0 {
		query = query.Where("knowledge_point_id = ?", params.KnowledgePointID)
	}
	if params.ContentType != "" {
		query = query.Where("content_type = ?", params.ContentType)
	}
	if params.IsActive != nil {
		query = query.Where("is_active = ?", *params.IsActive)
	}

	query.Count(&total)

	if params.PageSize > 0 {
		offset := (params.Page - 1) * params.PageSize
		query = query.Offset(offset).Limit(params.PageSize)
	}

	err := query.Order("sort_order").Find(&details).Error
	return details, total, err
}

// IncrViewCount 增加查看次数
func (r *KnowledgeDetailRepository) IncrViewCount(id uint) error {
	return r.db.Model(&model.KnowledgeDetail{}).Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

// KnowledgeDetailQueryParams 查询参数
type KnowledgeDetailQueryParams struct {
	KnowledgePointID uint
	ContentType      model.KnowledgeDetailContentType
	IsActive         *bool
	Page             int
	PageSize         int
}

// =====================================================
// §25.3.2 速记卡片 Repository
// =====================================================

// FlashCardRepository 速记卡片 Repository
type FlashCardRepository struct {
	db *gorm.DB
}

func NewFlashCardRepository(db *gorm.DB) *FlashCardRepository {
	return &FlashCardRepository{db: db}
}

// Create 创建卡片
func (r *FlashCardRepository) Create(card *model.KnowledgeFlashCard) error {
	return r.db.Create(card).Error
}

// BatchCreate 批量创建
func (r *FlashCardRepository) BatchCreate(cards []*model.KnowledgeFlashCard) error {
	return r.db.CreateInBatches(cards, 100).Error
}

// Update 更新卡片
func (r *FlashCardRepository) Update(card *model.KnowledgeFlashCard) error {
	return r.db.Save(card).Error
}

// Delete 删除卡片
func (r *FlashCardRepository) Delete(id uint) error {
	return r.db.Delete(&model.KnowledgeFlashCard{}, id).Error
}

// GetByID 根据ID获取
func (r *FlashCardRepository) GetByID(id uint) (*model.KnowledgeFlashCard, error) {
	var card model.KnowledgeFlashCard
	err := r.db.First(&card, id).Error
	if err != nil {
		return nil, err
	}
	return &card, nil
}

// GetByKnowledgePoint 获取知识点的卡片
func (r *FlashCardRepository) GetByKnowledgePoint(knowledgePointID uint) ([]*model.KnowledgeFlashCard, error) {
	var cards []*model.KnowledgeFlashCard
	err := r.db.Where("knowledge_point_id = ? AND is_active = ?", knowledgePointID, true).
		Order("sort_order").
		Find(&cards).Error
	return cards, err
}

// GetByCategory 获取分类下的卡片
func (r *FlashCardRepository) GetByCategory(categoryID uint) ([]*model.KnowledgeFlashCard, error) {
	var cards []*model.KnowledgeFlashCard
	err := r.db.Where("category_id = ? AND is_active = ?", categoryID, true).
		Order("sort_order").
		Find(&cards).Error
	return cards, err
}

// GetByType 获取指定类型的卡片
func (r *FlashCardRepository) GetByType(cardType model.FlashCardType, limit int) ([]*model.KnowledgeFlashCard, error) {
	var cards []*model.KnowledgeFlashCard
	query := r.db.Where("card_type = ? AND is_active = ?", cardType, true).
		Order("importance DESC, sort_order")
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Find(&cards).Error
	return cards, err
}

// List 获取卡片列表
func (r *FlashCardRepository) List(params *FlashCardQueryParams) ([]*model.KnowledgeFlashCard, int64, error) {
	var cards []*model.KnowledgeFlashCard
	var total int64

	query := r.db.Model(&model.KnowledgeFlashCard{})

	if params.KnowledgePointID > 0 {
		query = query.Where("knowledge_point_id = ?", params.KnowledgePointID)
	}
	if params.CategoryID > 0 {
		query = query.Where("category_id = ?", params.CategoryID)
	}
	if params.CardType != "" {
		query = query.Where("card_type = ?", params.CardType)
	}
	if params.Difficulty > 0 {
		query = query.Where("difficulty = ?", params.Difficulty)
	}
	if params.Importance > 0 {
		query = query.Where("importance >= ?", params.Importance)
	}
	if params.IsActive != nil {
		query = query.Where("is_active = ?", *params.IsActive)
	}
	if params.Keyword != "" {
		query = query.Where("title LIKE ? OR front_content LIKE ?", "%"+params.Keyword+"%", "%"+params.Keyword+"%")
	}

	query.Count(&total)

	orderBy := "sort_order"
	if params.OrderBy != "" {
		orderBy = params.OrderBy
	}

	if params.PageSize > 0 {
		offset := (params.Page - 1) * params.PageSize
		query = query.Offset(offset).Limit(params.PageSize)
	}

	err := query.Order(orderBy).Find(&cards).Error
	return cards, total, err
}

// GetRandomCards 随机获取卡片
func (r *FlashCardRepository) GetRandomCards(cardType model.FlashCardType, count int) ([]*model.KnowledgeFlashCard, error) {
	var cards []*model.KnowledgeFlashCard
	query := r.db.Where("is_active = ?", true)
	if cardType != "" {
		query = query.Where("card_type = ?", cardType)
	}
	err := query.Order("RAND()").Limit(count).Find(&cards).Error
	return cards, err
}

// IncrViewCount 增加查看次数
func (r *FlashCardRepository) IncrViewCount(id uint) error {
	return r.db.Model(&model.KnowledgeFlashCard{}).Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

// IncrCollectCount 增加收藏次数
func (r *FlashCardRepository) IncrCollectCount(id uint, delta int) error {
	return r.db.Model(&model.KnowledgeFlashCard{}).Where("id = ?", id).
		UpdateColumn("collect_count", gorm.Expr("collect_count + ?", delta)).Error
}

// IncrMasterCount 增加掌握人数
func (r *FlashCardRepository) IncrMasterCount(id uint) error {
	return r.db.Model(&model.KnowledgeFlashCard{}).Where("id = ?", id).
		UpdateColumn("master_count", gorm.Expr("master_count + 1")).Error
}

// GetTypeStats 获取类型统计
func (r *FlashCardRepository) GetTypeStats() ([]model.FlashCardTypeStats, error) {
	var stats []model.FlashCardTypeStats
	err := r.db.Model(&model.KnowledgeFlashCard{}).
		Select("card_type, COUNT(*) as count, SUM(view_count) as view_sum").
		Where("is_active = ?", true).
		Group("card_type").
		Find(&stats).Error
	return stats, err
}

// FlashCardQueryParams 查询参数
type FlashCardQueryParams struct {
	KnowledgePointID uint
	CategoryID       uint
	CardType         model.FlashCardType
	Difficulty       int
	Importance       int
	IsActive         *bool
	Keyword          string
	Page             int
	PageSize         int
	OrderBy          string
}

// =====================================================
// §25.3.3 思维导图 Repository
// =====================================================

// MindMapRepository 思维导图 Repository
type MindMapRepository struct {
	db *gorm.DB
}

func NewMindMapRepository(db *gorm.DB) *MindMapRepository {
	return &MindMapRepository{db: db}
}

// Create 创建导图
func (r *MindMapRepository) Create(mindMap *model.KnowledgeMindMap) error {
	return r.db.Create(mindMap).Error
}

// Update 更新导图
func (r *MindMapRepository) Update(mindMap *model.KnowledgeMindMap) error {
	return r.db.Save(mindMap).Error
}

// Delete 删除导图
func (r *MindMapRepository) Delete(id uint) error {
	return r.db.Delete(&model.KnowledgeMindMap{}, id).Error
}

// GetByID 根据ID获取
func (r *MindMapRepository) GetByID(id uint) (*model.KnowledgeMindMap, error) {
	var mindMap model.KnowledgeMindMap
	err := r.db.First(&mindMap, id).Error
	if err != nil {
		return nil, err
	}
	return &mindMap, nil
}

// GetByKnowledgePoint 获取知识点的导图
func (r *MindMapRepository) GetByKnowledgePoint(knowledgePointID uint) ([]*model.KnowledgeMindMap, error) {
	var mindMaps []*model.KnowledgeMindMap
	err := r.db.Where("knowledge_point_id = ? AND is_active = ?", knowledgePointID, true).
		Find(&mindMaps).Error
	return mindMaps, err
}

// GetByCategory 获取分类下的导图
func (r *MindMapRepository) GetByCategory(categoryID uint) ([]*model.KnowledgeMindMap, error) {
	var mindMaps []*model.KnowledgeMindMap
	err := r.db.Where("category_id = ? AND is_active = ?", categoryID, true).
		Find(&mindMaps).Error
	return mindMaps, err
}

// GetByType 获取指定类型的导图
func (r *MindMapRepository) GetByType(mapType model.MindMapType, limit int) ([]*model.KnowledgeMindMap, error) {
	var mindMaps []*model.KnowledgeMindMap
	query := r.db.Where("map_type = ? AND is_active = ? AND is_public = ?", mapType, true, true).
		Order("view_count DESC")
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Find(&mindMaps).Error
	return mindMaps, err
}

// List 获取导图列表
func (r *MindMapRepository) List(params *MindMapQueryParams) ([]*model.KnowledgeMindMap, int64, error) {
	var mindMaps []*model.KnowledgeMindMap
	var total int64

	query := r.db.Model(&model.KnowledgeMindMap{})

	if params.KnowledgePointID > 0 {
		query = query.Where("knowledge_point_id = ?", params.KnowledgePointID)
	}
	if params.CategoryID > 0 {
		query = query.Where("category_id = ?", params.CategoryID)
	}
	if params.MapType != "" {
		query = query.Where("map_type = ?", params.MapType)
	}
	if params.IsActive != nil {
		query = query.Where("is_active = ?", *params.IsActive)
	}
	if params.IsPublic != nil {
		query = query.Where("is_public = ?", *params.IsPublic)
	}
	if params.CreatedBy > 0 {
		query = query.Where("created_by = ?", params.CreatedBy)
	}
	if params.Keyword != "" {
		query = query.Where("title LIKE ? OR description LIKE ?", "%"+params.Keyword+"%", "%"+params.Keyword+"%")
	}

	query.Count(&total)

	orderBy := "created_at DESC"
	if params.OrderBy != "" {
		orderBy = params.OrderBy
	}

	if params.PageSize > 0 {
		offset := (params.Page - 1) * params.PageSize
		query = query.Offset(offset).Limit(params.PageSize)
	}

	err := query.Order(orderBy).Find(&mindMaps).Error
	return mindMaps, total, err
}

// IncrViewCount 增加查看次数
func (r *MindMapRepository) IncrViewCount(id uint) error {
	return r.db.Model(&model.KnowledgeMindMap{}).Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

// IncrCollectCount 增加收藏次数
func (r *MindMapRepository) IncrCollectCount(id uint, delta int) error {
	return r.db.Model(&model.KnowledgeMindMap{}).Where("id = ?", id).
		UpdateColumn("collect_count", gorm.Expr("collect_count + ?", delta)).Error
}

// IncrDownloadCount 增加下载次数
func (r *MindMapRepository) IncrDownloadCount(id uint) error {
	return r.db.Model(&model.KnowledgeMindMap{}).Where("id = ?", id).
		UpdateColumn("download_count", gorm.Expr("download_count + 1")).Error
}

// GetTypeStats 获取类型统计
func (r *MindMapRepository) GetTypeStats() ([]model.MindMapTypeStats, error) {
	var stats []model.MindMapTypeStats
	err := r.db.Model(&model.KnowledgeMindMap{}).
		Select("map_type, COUNT(*) as count, SUM(view_count) as view_sum").
		Where("is_active = ?", true).
		Group("map_type").
		Find(&stats).Error
	return stats, err
}

// MindMapQueryParams 查询参数
type MindMapQueryParams struct {
	KnowledgePointID uint
	CategoryID       uint
	MapType          model.MindMapType
	IsActive         *bool
	IsPublic         *bool
	CreatedBy        uint
	Keyword          string
	Page             int
	PageSize         int
	OrderBy          string
}

// =====================================================
// 用户卡片学习记录 Repository
// =====================================================

// UserFlashCardRecordRepository 用户卡片学习记录 Repository
type UserFlashCardRecordRepository struct {
	db *gorm.DB
}

func NewUserFlashCardRecordRepository(db *gorm.DB) *UserFlashCardRecordRepository {
	return &UserFlashCardRecordRepository{db: db}
}

// Upsert 创建或更新记录
func (r *UserFlashCardRecordRepository) Upsert(record *model.UserFlashCardRecord) error {
	return r.db.Save(record).Error
}

// GetByUserAndCard 获取用户的卡片记录
func (r *UserFlashCardRecordRepository) GetByUserAndCard(userID, cardID uint) (*model.UserFlashCardRecord, error) {
	var record model.UserFlashCardRecord
	err := r.db.Where("user_id = ? AND card_id = ?", userID, cardID).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// GetUserCards 获取用户的卡片学习记录
func (r *UserFlashCardRecordRepository) GetUserCards(userID uint, status model.UserFlashCardStatus, limit int) ([]*model.UserFlashCardRecord, error) {
	var records []*model.UserFlashCardRecord
	query := r.db.Where("user_id = ?", userID).Preload("Card")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Order("next_review_at").Find(&records).Error
	return records, err
}

// GetDueCards 获取需要复习的卡片
func (r *UserFlashCardRecordRepository) GetDueCards(userID uint, limit int) ([]*model.UserFlashCardRecord, error) {
	var records []*model.UserFlashCardRecord
	err := r.db.Where("user_id = ? AND next_review_at <= NOW() AND status != ?", userID, model.UserFlashCardStatusMastered).
		Preload("Card").
		Order("next_review_at").
		Limit(limit).
		Find(&records).Error
	return records, err
}

// GetUserStats 获取用户学习统计
func (r *UserFlashCardRecordRepository) GetUserStats(userID uint) (map[model.UserFlashCardStatus]int64, error) {
	var results []struct {
		Status model.UserFlashCardStatus
		Count  int64
	}
	err := r.db.Model(&model.UserFlashCardRecord{}).
		Select("status, COUNT(*) as count").
		Where("user_id = ?", userID).
		Group("status").
		Find(&results).Error
	if err != nil {
		return nil, err
	}

	stats := make(map[model.UserFlashCardStatus]int64)
	for _, r := range results {
		stats[r.Status] = r.Count
	}
	return stats, nil
}

// =====================================================
// 统计 Repository
// =====================================================

// KnowledgeContentStatsRepository 知识点内容统计 Repository
type KnowledgeContentStatsRepository struct {
	db *gorm.DB
}

func NewKnowledgeContentStatsRepository(db *gorm.DB) *KnowledgeContentStatsRepository {
	return &KnowledgeContentStatsRepository{db: db}
}

// GetStats 获取统计数据
func (r *KnowledgeContentStatsRepository) GetStats() (*model.KnowledgeContentStats, error) {
	stats := &model.KnowledgeContentStats{}

	// 详情统计
	r.db.Model(&model.KnowledgeDetail{}).Count(&stats.TotalDetails)
	r.db.Model(&model.KnowledgeDetail{}).Where("is_active = ?", true).Count(&stats.ActiveDetails)

	// 卡片统计
	r.db.Model(&model.KnowledgeFlashCard{}).Count(&stats.TotalFlashCards)
	r.db.Model(&model.KnowledgeFlashCard{}).Where("is_active = ?", true).Count(&stats.ActiveFlashCards)

	// 导图统计
	r.db.Model(&model.KnowledgeMindMap{}).Count(&stats.TotalMindMaps)
	r.db.Model(&model.KnowledgeMindMap{}).Where("is_active = ?", true).Count(&stats.ActiveMindMaps)

	// 总查看次数
	var detailViews, cardViews, mapViews int64
	r.db.Model(&model.KnowledgeDetail{}).Select("COALESCE(SUM(view_count), 0)").Scan(&detailViews)
	r.db.Model(&model.KnowledgeFlashCard{}).Select("COALESCE(SUM(view_count), 0)").Scan(&cardViews)
	r.db.Model(&model.KnowledgeMindMap{}).Select("COALESCE(SUM(view_count), 0)").Scan(&mapViews)
	stats.TotalViewCount = detailViews + cardViews + mapViews

	// 总收藏次数
	var cardCollects, mapCollects int64
	r.db.Model(&model.KnowledgeFlashCard{}).Select("COALESCE(SUM(collect_count), 0)").Scan(&cardCollects)
	r.db.Model(&model.KnowledgeMindMap{}).Select("COALESCE(SUM(collect_count), 0)").Scan(&mapCollects)
	stats.TotalCollectCount = cardCollects + mapCollects

	return stats, nil
}
