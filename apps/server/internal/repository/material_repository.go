package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"

	"gorm.io/gorm"
)

// MaterialRepository 素材仓储
type MaterialRepository struct {
	db *gorm.DB
}

// NewMaterialRepository 创建素材仓储
func NewMaterialRepository(db *gorm.DB) *MaterialRepository {
	return &MaterialRepository{db: db}
}

// =====================================================
// 素材 CRUD
// =====================================================

// Create 创建素材
func (r *MaterialRepository) Create(material *model.LearningMaterial) error {
	return r.db.Create(material).Error
}

// BatchCreate 批量创建素材
func (r *MaterialRepository) BatchCreate(materials []*model.LearningMaterial) error {
	if len(materials) == 0 {
		return nil
	}
	return r.db.CreateInBatches(materials, 100).Error
}

// FindByID 根据ID查找素材
func (r *MaterialRepository) FindByID(id uint) (*model.LearningMaterial, error) {
	var material model.LearningMaterial
	err := r.db.Preload("Category").First(&material, id).Error
	if err != nil {
		return nil, err
	}
	return &material, nil
}

// Update 更新素材
func (r *MaterialRepository) Update(material *model.LearningMaterial) error {
	return r.db.Save(material).Error
}

// UpdateFields 更新指定字段
func (r *MaterialRepository) UpdateFields(id uint, fields map[string]interface{}) error {
	return r.db.Model(&model.LearningMaterial{}).Where("id = ?", id).Updates(fields).Error
}

// Delete 删除素材
func (r *MaterialRepository) Delete(id uint) error {
	return r.db.Delete(&model.LearningMaterial{}, id).Error
}

// BatchDelete 批量删除素材
func (r *MaterialRepository) BatchDelete(ids []uint) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.Delete(&model.LearningMaterial{}, ids).Error
}

// =====================================================
// 素材查询
// =====================================================

// List 获取素材列表
func (r *MaterialRepository) List(params *model.MaterialQueryParams) ([]*model.LearningMaterial, int64, error) {
	var materials []*model.LearningMaterial
	var total int64

	query := r.db.Model(&model.LearningMaterial{})

	// 应用筛选条件
	query = r.applyFilters(query, params)

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 排序
	query = r.applySort(query, params)

	// 分页
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize
	query = query.Offset(offset).Limit(params.PageSize)

	// 预加载关联
	query = query.Preload("Category")

	if err := query.Find(&materials).Error; err != nil {
		return nil, 0, err
	}

	return materials, total, nil
}

// Search 搜索素材
func (r *MaterialRepository) Search(keyword string, params *model.MaterialQueryParams) ([]*model.LearningMaterial, int64, error) {
	if keyword != "" {
		params.Keyword = keyword
	}
	return r.List(params)
}

// GetByType 按类型获取素材
func (r *MaterialRepository) GetByType(materialType model.MaterialType, limit int) ([]*model.LearningMaterial, error) {
	var materials []*model.LearningMaterial
	query := r.db.Where("type = ? AND status = ?", materialType, model.MaterialStatusPublished)

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Order("sort_order ASC, created_at DESC").
		Preload("Category").
		Find(&materials).Error

	return materials, err
}

// GetBySubType 按子类型获取素材
func (r *MaterialRepository) GetBySubType(subType model.MaterialSubType, limit int) ([]*model.LearningMaterial, error) {
	var materials []*model.LearningMaterial
	query := r.db.Where("sub_type = ? AND status = ?", subType, model.MaterialStatusPublished)

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Order("sort_order ASC, created_at DESC").
		Preload("Category").
		Find(&materials).Error

	return materials, err
}

// GetByCategoryID 按分类获取素材
func (r *MaterialRepository) GetByCategoryID(categoryID uint, limit int) ([]*model.LearningMaterial, error) {
	var materials []*model.LearningMaterial
	query := r.db.Where("category_id = ? AND status = ?", categoryID, model.MaterialStatusPublished)

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Order("sort_order ASC, created_at DESC").
		Preload("Category").
		Find(&materials).Error

	return materials, err
}

// GetHotMaterials 获取热门素材
func (r *MaterialRepository) GetHotMaterials(limit int) ([]*model.LearningMaterial, error) {
	var materials []*model.LearningMaterial
	err := r.db.Where("is_hot = ? AND status = ?", true, model.MaterialStatusPublished).
		Order("view_count DESC, collect_count DESC").
		Limit(limit).
		Preload("Category").
		Find(&materials).Error
	return materials, err
}

// GetFeaturedMaterials 获取精选素材
func (r *MaterialRepository) GetFeaturedMaterials(limit int) ([]*model.LearningMaterial, error) {
	var materials []*model.LearningMaterial
	err := r.db.Where("is_featured = ? AND status = ?", true, model.MaterialStatusPublished).
		Order("sort_order ASC, created_at DESC").
		Limit(limit).
		Preload("Category").
		Find(&materials).Error
	return materials, err
}

// GetRandomMaterials 随机获取素材
func (r *MaterialRepository) GetRandomMaterials(materialType model.MaterialType, count int) ([]*model.LearningMaterial, error) {
	var materials []*model.LearningMaterial
	query := r.db.Where("status = ?", model.MaterialStatusPublished)

	if materialType != "" {
		query = query.Where("type = ?", materialType)
	}

	err := query.Order("RAND()").
		Limit(count).
		Preload("Category").
		Find(&materials).Error

	return materials, err
}

// GetByThemeTopic 按主题获取素材
func (r *MaterialRepository) GetByThemeTopic(topic string, limit int) ([]*model.LearningMaterial, error) {
	var materials []*model.LearningMaterial
	query := r.db.Where("JSON_CONTAINS(theme_topics, ?) AND status = ?",
		`"`+topic+`"`, model.MaterialStatusPublished)

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Order("sort_order ASC, created_at DESC").
		Preload("Category").
		Find(&materials).Error

	return materials, err
}

// GetByYear 按年份获取素材
func (r *MaterialRepository) GetByYear(year int, materialType model.MaterialType, limit int) ([]*model.LearningMaterial, error) {
	var materials []*model.LearningMaterial
	query := r.db.Where("year = ? AND status = ?", year, model.MaterialStatusPublished)

	if materialType != "" {
		query = query.Where("type = ?", materialType)
	}

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Order("sort_order ASC, created_at DESC").
		Preload("Category").
		Find(&materials).Error

	return materials, err
}

// =====================================================
// 统计方法
// =====================================================

// GetStats 获取素材统计
func (r *MaterialRepository) GetStats() (*model.MaterialStats, error) {
	stats := &model.MaterialStats{}

	// 总数
	r.db.Model(&model.LearningMaterial{}).Count(&stats.TotalCount)

	// 按状态统计
	r.db.Model(&model.LearningMaterial{}).Where("status = ?", model.MaterialStatusPublished).Count(&stats.PublishedCount)
	r.db.Model(&model.LearningMaterial{}).Where("status = ?", model.MaterialStatusDraft).Count(&stats.DraftCount)

	// 按类型统计
	r.db.Model(&model.LearningMaterial{}).Where("type = ?", model.MaterialTypeQuote).Count(&stats.QuoteCount)
	r.db.Model(&model.LearningMaterial{}).Where("type = ?", model.MaterialTypeCase).Count(&stats.CaseCount)
	r.db.Model(&model.LearningMaterial{}).Where("type = ?", model.MaterialTypeSentence).Count(&stats.SentenceCount)
	r.db.Model(&model.LearningMaterial{}).Where("type = ?", model.MaterialTypeHotTopic).Count(&stats.HotTopicCount)
	r.db.Model(&model.LearningMaterial{}).Where("type = ?", model.MaterialTypeInterview).Count(&stats.InterviewCount)
	r.db.Model(&model.LearningMaterial{}).Where("type = ?", model.MaterialTypeKnowledge).Count(&stats.KnowledgeCount)

	// 热门和精选统计
	r.db.Model(&model.LearningMaterial{}).Where("is_hot = ?", true).Count(&stats.HotCount)
	r.db.Model(&model.LearningMaterial{}).Where("is_featured = ?", true).Count(&stats.FeaturedCount)

	// 今日新增
	today := time.Now().Format("2006-01-02")
	r.db.Model(&model.LearningMaterial{}).Where("DATE(created_at) = ?", today).Count(&stats.TodayNewCount)

	// 类型详细统计
	var typeStats []model.MaterialTypeStat
	r.db.Model(&model.LearningMaterial{}).
		Select("type, COUNT(*) as count").
		Group("type").
		Scan(&typeStats)

	for i := range typeStats {
		typeStats[i].Name = model.MaterialTypeNames[typeStats[i].Type]
	}
	stats.TypeStats = typeStats

	// 科目统计
	var subjectStats []model.MaterialSubjectStat
	r.db.Model(&model.LearningMaterial{}).
		Select("subject, COUNT(*) as count").
		Where("subject != ''").
		Group("subject").
		Scan(&subjectStats)
	stats.SubjectStats = subjectStats

	return stats, nil
}

// GetStatsByType 按类型获取统计
func (r *MaterialRepository) GetStatsByType(materialType model.MaterialType) ([]model.MaterialTypeStat, error) {
	var stats []model.MaterialTypeStat
	err := r.db.Model(&model.LearningMaterial{}).
		Where("type = ?", materialType).
		Select("sub_type as type, COUNT(*) as count").
		Group("sub_type").
		Scan(&stats).Error
	return stats, err
}

// IncrementViewCount 增加浏览次数
func (r *MaterialRepository) IncrementViewCount(id uint) error {
	return r.db.Model(&model.LearningMaterial{}).
		Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + ?", 1)).Error
}

// IncrementCollectCount 增加收藏次数
func (r *MaterialRepository) IncrementCollectCount(id uint, delta int) error {
	return r.db.Model(&model.LearningMaterial{}).
		Where("id = ?", id).
		UpdateColumn("collect_count", gorm.Expr("collect_count + ?", delta)).Error
}

// IncrementUseCount 增加使用次数
func (r *MaterialRepository) IncrementUseCount(id uint) error {
	return r.db.Model(&model.LearningMaterial{}).
		Where("id = ?", id).
		UpdateColumn("use_count", gorm.Expr("use_count + ?", 1)).Error
}

// =====================================================
// 批量操作
// =====================================================

// BatchUpdateStatus 批量更新状态
func (r *MaterialRepository) BatchUpdateStatus(ids []uint, status model.MaterialStatus) error {
	if len(ids) == 0 {
		return nil
	}
	updates := map[string]interface{}{
		"status": status,
	}
	if status == model.MaterialStatusPublished {
		now := time.Now()
		updates["published_at"] = &now
	}
	return r.db.Model(&model.LearningMaterial{}).
		Where("id IN ?", ids).
		Updates(updates).Error
}

// BatchSetHot 批量设置热门
func (r *MaterialRepository) BatchSetHot(ids []uint, isHot bool) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.Model(&model.LearningMaterial{}).
		Where("id IN ?", ids).
		Update("is_hot", isHot).Error
}

// BatchSetFeatured 批量设置精选
func (r *MaterialRepository) BatchSetFeatured(ids []uint, isFeatured bool) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.Model(&model.LearningMaterial{}).
		Where("id IN ?", ids).
		Update("is_featured", isFeatured).Error
}

// =====================================================
// 辅助方法
// =====================================================

// applyFilters 应用筛选条件
func (r *MaterialRepository) applyFilters(query *gorm.DB, params *model.MaterialQueryParams) *gorm.DB {
	if params == nil {
		return query
	}

	if params.CategoryID != nil {
		query = query.Where("category_id = ?", *params.CategoryID)
	}

	if params.Type != "" {
		query = query.Where("type = ?", params.Type)
	}

	if params.SubType != "" {
		query = query.Where("sub_type = ?", params.SubType)
	}

	if params.Subject != "" {
		query = query.Where("subject = ?", params.Subject)
	}

	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}

	if params.IsFree != nil {
		query = query.Where("is_free = ?", *params.IsFree)
	}

	if params.VIPOnly != nil {
		query = query.Where("vip_only = ?", *params.VIPOnly)
	}

	if params.IsHot != nil {
		query = query.Where("is_hot = ?", *params.IsHot)
	}

	if params.IsFeatured != nil {
		query = query.Where("is_featured = ?", *params.IsFeatured)
	}

	if params.Year != nil {
		query = query.Where("year = ?", *params.Year)
	}

	if params.Keyword != "" {
		keyword := "%" + params.Keyword + "%"
		query = query.Where("title LIKE ? OR content LIKE ? OR source LIKE ? OR author LIKE ?",
			keyword, keyword, keyword, keyword)
	}

	if len(params.Tags) > 0 {
		for _, tag := range params.Tags {
			query = query.Where("JSON_CONTAINS(tags, ?)", `"`+tag+`"`)
		}
	}

	if len(params.ThemeTopics) > 0 {
		for _, topic := range params.ThemeTopics {
			query = query.Where("JSON_CONTAINS(theme_topics, ?)", `"`+topic+`"`)
		}
	}

	return query
}

// applySort 应用排序
func (r *MaterialRepository) applySort(query *gorm.DB, params *model.MaterialQueryParams) *gorm.DB {
	if params == nil || params.SortBy == "" {
		return query.Order("sort_order ASC, created_at DESC")
	}

	order := params.SortBy
	if params.SortOrder == "asc" {
		order += " ASC"
	} else {
		order += " DESC"
	}

	return query.Order(order)
}

// =====================================================
// 素材收藏相关
// =====================================================

// CreateCollect 创建收藏
func (r *MaterialRepository) CreateCollect(collect *model.MaterialCollect) error {
	return r.db.Create(collect).Error
}

// DeleteCollect 删除收藏
func (r *MaterialRepository) DeleteCollect(userID, materialID uint) error {
	return r.db.Where("user_id = ? AND material_id = ?", userID, materialID).
		Delete(&model.MaterialCollect{}).Error
}

// IsCollected 检查是否已收藏
func (r *MaterialRepository) IsCollected(userID, materialID uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.MaterialCollect{}).
		Where("user_id = ? AND material_id = ?", userID, materialID).
		Count(&count).Error
	return count > 0, err
}

// GetUserCollects 获取用户收藏的素材
func (r *MaterialRepository) GetUserCollects(userID uint, page, pageSize int) ([]*model.LearningMaterial, int64, error) {
	var materials []*model.LearningMaterial
	var total int64

	// 获取总数
	err := r.db.Model(&model.MaterialCollect{}).
		Where("user_id = ?", userID).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// 分页
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	// 查询素材
	err = r.db.
		Joins("JOIN what_material_collects ON what_learning_materials.id = what_material_collects.material_id").
		Where("what_material_collects.user_id = ? AND what_material_collects.deleted_at IS NULL", userID).
		Order("what_material_collects.created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Preload("Category").
		Find(&materials).Error

	return materials, total, err
}

// BatchCheckCollected 批量检查收藏状态
func (r *MaterialRepository) BatchCheckCollected(userID uint, materialIDs []uint) (map[uint]bool, error) {
	result := make(map[uint]bool)
	if len(materialIDs) == 0 {
		return result, nil
	}

	var collects []model.MaterialCollect
	err := r.db.Where("user_id = ? AND material_id IN ?", userID, materialIDs).
		Find(&collects).Error
	if err != nil {
		return nil, err
	}

	for _, c := range collects {
		result[c.MaterialID] = true
	}

	return result, nil
}
