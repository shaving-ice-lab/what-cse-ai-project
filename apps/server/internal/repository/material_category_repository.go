package repository

import (
	"github.com/what-cse/server/internal/model"

	"gorm.io/gorm"
)

// MaterialCategoryRepository 素材分类仓储
type MaterialCategoryRepository struct {
	db *gorm.DB
}

// NewMaterialCategoryRepository 创建素材分类仓储
func NewMaterialCategoryRepository(db *gorm.DB) *MaterialCategoryRepository {
	return &MaterialCategoryRepository{db: db}
}

// =====================================================
// 分类 CRUD
// =====================================================

// Create 创建分类
func (r *MaterialCategoryRepository) Create(category *model.MaterialCategory) error {
	return r.db.Create(category).Error
}

// FindByID 根据ID查找分类
func (r *MaterialCategoryRepository) FindByID(id uint) (*model.MaterialCategory, error) {
	var category model.MaterialCategory
	err := r.db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// FindByCode 根据编码查找分类
func (r *MaterialCategoryRepository) FindByCode(code string) (*model.MaterialCategory, error) {
	var category model.MaterialCategory
	err := r.db.Where("code = ?", code).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// Update 更新分类
func (r *MaterialCategoryRepository) Update(category *model.MaterialCategory) error {
	return r.db.Save(category).Error
}

// Delete 删除分类
func (r *MaterialCategoryRepository) Delete(id uint) error {
	return r.db.Delete(&model.MaterialCategory{}, id).Error
}

// =====================================================
// 分类查询
// =====================================================

// List 获取所有分类
func (r *MaterialCategoryRepository) List() ([]*model.MaterialCategory, error) {
	var categories []*model.MaterialCategory
	err := r.db.Where("is_active = ?", true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// ListAll 获取所有分类（包括未激活）
func (r *MaterialCategoryRepository) ListAll() ([]*model.MaterialCategory, error) {
	var categories []*model.MaterialCategory
	err := r.db.Order("sort_order ASC, id ASC").Find(&categories).Error
	return categories, err
}

// GetRootCategories 获取根分类
func (r *MaterialCategoryRepository) GetRootCategories() ([]*model.MaterialCategory, error) {
	var categories []*model.MaterialCategory
	err := r.db.Where("parent_id IS NULL AND is_active = ?", true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetChildren 获取子分类
func (r *MaterialCategoryRepository) GetChildren(parentID uint) ([]*model.MaterialCategory, error) {
	var categories []*model.MaterialCategory
	err := r.db.Where("parent_id = ? AND is_active = ?", parentID, true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetByMaterialType 按素材类型获取分类
func (r *MaterialCategoryRepository) GetByMaterialType(materialType model.MaterialType) ([]*model.MaterialCategory, error) {
	var categories []*model.MaterialCategory
	err := r.db.Where("material_type = ? AND is_active = ?", materialType, true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetBySubject 按科目获取分类
func (r *MaterialCategoryRepository) GetBySubject(subject string) ([]*model.MaterialCategory, error) {
	var categories []*model.MaterialCategory
	err := r.db.Where("subject = ? AND is_active = ?", subject, true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetTree 获取分类树（递归加载子分类）
func (r *MaterialCategoryRepository) GetTree() ([]*model.MaterialCategory, error) {
	var categories []*model.MaterialCategory
	err := r.db.Where("is_active = ?", true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return r.buildTree(categories, nil), nil
}

// GetTreeByMaterialType 按素材类型获取分类树
func (r *MaterialCategoryRepository) GetTreeByMaterialType(materialType model.MaterialType) ([]*model.MaterialCategory, error) {
	var categories []*model.MaterialCategory
	err := r.db.Where("material_type = ? AND is_active = ?", materialType, true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return r.buildTree(categories, nil), nil
}

// GetTreeBySubject 按科目获取分类树
func (r *MaterialCategoryRepository) GetTreeBySubject(subject string) ([]*model.MaterialCategory, error) {
	var categories []*model.MaterialCategory
	err := r.db.Where("subject = ? AND is_active = ?", subject, true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return r.buildTree(categories, nil), nil
}

// buildTree 构建分类树
func (r *MaterialCategoryRepository) buildTree(categories []*model.MaterialCategory, parentID *uint) []*model.MaterialCategory {
	var result []*model.MaterialCategory
	for _, category := range categories {
		// 判断是否为当前层级的分类
		if (parentID == nil && category.ParentID == nil) ||
			(parentID != nil && category.ParentID != nil && *category.ParentID == *parentID) {
			// 递归获取子分类
			children := r.buildTree(categories, &category.ID)
			// 将指针切片转换为值切片赋给Children
			category.Children = make([]model.MaterialCategory, len(children))
			for i, child := range children {
				category.Children[i] = *child
			}
			result = append(result, category)
		}
	}
	return result
}

// =====================================================
// 统计方法
// =====================================================

// GetMaterialCount 获取分类下的素材数量
func (r *MaterialCategoryRepository) GetMaterialCount(categoryID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.LearningMaterial{}).
		Where("category_id = ?", categoryID).
		Count(&count).Error
	return count, err
}

// UpdateMaterialCount 更新分类下的素材数量
func (r *MaterialCategoryRepository) UpdateMaterialCount(categoryID uint) error {
	var count int64
	r.db.Model(&model.LearningMaterial{}).
		Where("category_id = ? AND status = ?", categoryID, model.MaterialStatusPublished).
		Count(&count)

	return r.db.Model(&model.MaterialCategory{}).
		Where("id = ?", categoryID).
		Update("material_count", count).Error
}

// UpdateAllMaterialCounts 更新所有分类的素材数量
func (r *MaterialCategoryRepository) UpdateAllMaterialCounts() error {
	// 使用子查询更新
	return r.db.Exec(`
		UPDATE what_material_categories c
		SET material_count = (
			SELECT COUNT(*) 
			FROM what_learning_materials m 
			WHERE m.category_id = c.id 
			AND m.status = 'published'
			AND m.deleted_at IS NULL
		)
	`).Error
}

// =====================================================
// 路径相关
// =====================================================

// GetPath 获取分类的完整路径
func (r *MaterialCategoryRepository) GetPath(id uint) (string, error) {
	category, err := r.FindByID(id)
	if err != nil {
		return "", err
	}
	return category.Path, nil
}

// GetAncestors 获取所有祖先分类
func (r *MaterialCategoryRepository) GetAncestors(id uint) ([]*model.MaterialCategory, error) {
	var ancestors []*model.MaterialCategory
	category, err := r.FindByID(id)
	if err != nil {
		return nil, err
	}

	for category.ParentID != nil {
		parent, err := r.FindByID(*category.ParentID)
		if err != nil {
			break
		}
		ancestors = append([]*model.MaterialCategory{parent}, ancestors...)
		category = parent
	}

	return ancestors, nil
}

// GetDescendants 获取所有后代分类
func (r *MaterialCategoryRepository) GetDescendants(id uint) ([]*model.MaterialCategory, error) {
	var allCategories []*model.MaterialCategory
	err := r.db.Where("is_active = ?", true).Find(&allCategories).Error
	if err != nil {
		return nil, err
	}

	var result []*model.MaterialCategory
	r.collectDescendants(allCategories, id, &result)
	return result, nil
}

// collectDescendants 递归收集后代分类
func (r *MaterialCategoryRepository) collectDescendants(categories []*model.MaterialCategory, parentID uint, result *[]*model.MaterialCategory) {
	for _, cat := range categories {
		if cat.ParentID != nil && *cat.ParentID == parentID {
			*result = append(*result, cat)
			r.collectDescendants(categories, cat.ID, result)
		}
	}
}

// =====================================================
// 批量操作
// =====================================================

// BatchCreate 批量创建分类
func (r *MaterialCategoryRepository) BatchCreate(categories []*model.MaterialCategory) error {
	if len(categories) == 0 {
		return nil
	}
	return r.db.CreateInBatches(categories, 100).Error
}

// BatchUpdateActive 批量更新激活状态
func (r *MaterialCategoryRepository) BatchUpdateActive(ids []uint, isActive bool) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.Model(&model.MaterialCategory{}).
		Where("id IN ?", ids).
		Update("is_active", isActive).Error
}

// BatchUpdateSortOrder 批量更新排序
func (r *MaterialCategoryRepository) BatchUpdateSortOrder(orders map[uint]int) error {
	for id, order := range orders {
		if err := r.db.Model(&model.MaterialCategory{}).
			Where("id = ?", id).
			Update("sort_order", order).Error; err != nil {
			return err
		}
	}
	return nil
}

// =====================================================
// 检查方法
// =====================================================

// ExistsByCode 检查编码是否存在
func (r *MaterialCategoryRepository) ExistsByCode(code string) (bool, error) {
	var count int64
	err := r.db.Model(&model.MaterialCategory{}).
		Where("code = ?", code).
		Count(&count).Error
	return count > 0, err
}

// ExistsByCodeExcludeID 检查编码是否存在（排除指定ID）
func (r *MaterialCategoryRepository) ExistsByCodeExcludeID(code string, excludeID uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.MaterialCategory{}).
		Where("code = ? AND id != ?", code, excludeID).
		Count(&count).Error
	return count > 0, err
}

// HasChildren 检查是否有子分类
func (r *MaterialCategoryRepository) HasChildren(id uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.MaterialCategory{}).
		Where("parent_id = ?", id).
		Count(&count).Error
	return count > 0, err
}

// HasMaterials 检查是否有关联的素材
func (r *MaterialCategoryRepository) HasMaterials(id uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.LearningMaterial{}).
		Where("category_id = ?", id).
		Count(&count).Error
	return count > 0, err
}
