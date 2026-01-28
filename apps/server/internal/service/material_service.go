package service

import (
	"errors"
	"strings"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

// 错误定义
var (
	ErrLearningMaterialNotFound     = errors.New("素材不存在")
	ErrMaterialCategoryNotFound     = errors.New("素材分类不存在")
	ErrMaterialCategoryCodeExists   = errors.New("分类编码已存在")
	ErrMaterialCategoryHasChildren  = errors.New("分类下存在子分类，无法删除")
	ErrMaterialCategoryHasMaterials = errors.New("分类下存在素材，无法删除")
	ErrMaterialAlreadyCollected     = errors.New("已收藏该素材")
	ErrMaterialNotCollected         = errors.New("未收藏该素材")
)

// MaterialService 素材服务
type MaterialService struct {
	materialRepo         *repository.MaterialRepository
	materialCategoryRepo *repository.MaterialCategoryRepository
}

// NewMaterialService 创建素材服务
func NewMaterialService(
	materialRepo *repository.MaterialRepository,
	materialCategoryRepo *repository.MaterialCategoryRepository,
) *MaterialService {
	return &MaterialService{
		materialRepo:         materialRepo,
		materialCategoryRepo: materialCategoryRepo,
	}
}

// =====================================================
// 素材管理
// =====================================================

// CreateMaterialRequest 创建素材请求
type CreateMaterialRequest struct {
	CategoryID   uint                  `json:"category_id" binding:"required"`
	Type         model.MaterialType    `json:"type" binding:"required"`
	SubType      model.MaterialSubType `json:"sub_type"`
	Title        string                `json:"title" binding:"required"`
	Content      string                `json:"content" binding:"required"`
	Source       string                `json:"source"`
	Author       string                `json:"author"`
	Year         *int                  `json:"year"`
	Tags         []string              `json:"tags"`
	Keywords     []string              `json:"keywords"`
	ThemeTopics  []string              `json:"theme_topics"`
	Subject      string                `json:"subject"`
	Analysis     string                `json:"analysis"`
	Usage        string                `json:"usage"`
	Example      string                `json:"example"`
	Translation  string                `json:"translation"`
	Background   string                `json:"background"`
	Significance string                `json:"significance"`
	IsFree       bool                  `json:"is_free"`
	VIPOnly      bool                  `json:"vip_only"`
	IsHot        bool                  `json:"is_hot"`
	IsFeatured   bool                  `json:"is_featured"`
	Status       model.MaterialStatus  `json:"status"`
	SortOrder    int                   `json:"sort_order"`
}

// CreateMaterial 创建素材
func (s *MaterialService) CreateMaterial(req *CreateMaterialRequest) (*model.LearningMaterial, error) {
	// 检查分类是否存在
	category, err := s.materialCategoryRepo.FindByID(req.CategoryID)
	if err != nil {
		return nil, ErrMaterialCategoryNotFound
	}

	material := &model.LearningMaterial{
		CategoryID:   req.CategoryID,
		Type:         req.Type,
		SubType:      req.SubType,
		Title:        req.Title,
		Content:      req.Content,
		Source:       req.Source,
		Author:       req.Author,
		Year:         req.Year,
		Tags:         req.Tags,
		Keywords:     req.Keywords,
		ThemeTopics:  req.ThemeTopics,
		Subject:      req.Subject,
		Analysis:     req.Analysis,
		Usage:        req.Usage,
		Example:      req.Example,
		Translation:  req.Translation,
		Background:   req.Background,
		Significance: req.Significance,
		IsFree:       req.IsFree,
		VIPOnly:      req.VIPOnly,
		IsHot:        req.IsHot,
		IsFeatured:   req.IsFeatured,
		Status:       req.Status,
		SortOrder:    req.SortOrder,
	}

	// 设置默认状态
	if material.Status == "" {
		material.Status = model.MaterialStatusDraft
	}

	// 如果是发布状态，设置发布时间
	if material.Status == model.MaterialStatusPublished {
		now := time.Now()
		material.PublishedAt = &now
	}

	if err := s.materialRepo.Create(material); err != nil {
		return nil, err
	}

	// 更新分类素材数量
	s.materialCategoryRepo.UpdateMaterialCount(category.ID)

	return material, nil
}

// UpdateMaterialRequest 更新素材请求
type UpdateMaterialRequest struct {
	CategoryID   *uint                 `json:"category_id"`
	Type         model.MaterialType    `json:"type"`
	SubType      model.MaterialSubType `json:"sub_type"`
	Title        string                `json:"title"`
	Content      string                `json:"content"`
	Source       string                `json:"source"`
	Author       string                `json:"author"`
	Year         *int                  `json:"year"`
	Tags         []string              `json:"tags"`
	Keywords     []string              `json:"keywords"`
	ThemeTopics  []string              `json:"theme_topics"`
	Subject      string                `json:"subject"`
	Analysis     string                `json:"analysis"`
	Usage        string                `json:"usage"`
	Example      string                `json:"example"`
	Translation  string                `json:"translation"`
	Background   string                `json:"background"`
	Significance string                `json:"significance"`
	IsFree       *bool                 `json:"is_free"`
	VIPOnly      *bool                 `json:"vip_only"`
	IsHot        *bool                 `json:"is_hot"`
	IsFeatured   *bool                 `json:"is_featured"`
	Status       model.MaterialStatus  `json:"status"`
	SortOrder    *int                  `json:"sort_order"`
}

// UpdateMaterial 更新素材
func (s *MaterialService) UpdateMaterial(id uint, req *UpdateMaterialRequest) error {
	material, err := s.materialRepo.FindByID(id)
	if err != nil {
		return ErrLearningMaterialNotFound
	}

	oldCategoryID := material.CategoryID

	// 更新字段
	if req.CategoryID != nil {
		// 检查新分类是否存在
		_, err := s.materialCategoryRepo.FindByID(*req.CategoryID)
		if err != nil {
			return ErrMaterialCategoryNotFound
		}
		material.CategoryID = *req.CategoryID
	}

	if req.Type != "" {
		material.Type = req.Type
	}
	if req.SubType != "" {
		material.SubType = req.SubType
	}
	if req.Title != "" {
		material.Title = req.Title
	}
	if req.Content != "" {
		material.Content = req.Content
	}
	material.Source = req.Source
	material.Author = req.Author
	material.Year = req.Year
	material.Tags = req.Tags
	material.Keywords = req.Keywords
	material.ThemeTopics = req.ThemeTopics
	material.Subject = req.Subject
	material.Analysis = req.Analysis
	material.Usage = req.Usage
	material.Example = req.Example
	material.Translation = req.Translation
	material.Background = req.Background
	material.Significance = req.Significance

	if req.IsFree != nil {
		material.IsFree = *req.IsFree
	}
	if req.VIPOnly != nil {
		material.VIPOnly = *req.VIPOnly
	}
	if req.IsHot != nil {
		material.IsHot = *req.IsHot
	}
	if req.IsFeatured != nil {
		material.IsFeatured = *req.IsFeatured
	}
	if req.SortOrder != nil {
		material.SortOrder = *req.SortOrder
	}

	// 状态变更处理
	if req.Status != "" && req.Status != material.Status {
		material.Status = req.Status
		if req.Status == model.MaterialStatusPublished && material.PublishedAt == nil {
			now := time.Now()
			material.PublishedAt = &now
		}
	}

	if err := s.materialRepo.Update(material); err != nil {
		return err
	}

	// 更新分类素材数量
	s.materialCategoryRepo.UpdateMaterialCount(material.CategoryID)
	if oldCategoryID != material.CategoryID {
		s.materialCategoryRepo.UpdateMaterialCount(oldCategoryID)
	}

	return nil
}

// GetMaterial 获取素材详情
func (s *MaterialService) GetMaterial(id uint) (*model.LearningMaterialResponse, error) {
	material, err := s.materialRepo.FindByID(id)
	if err != nil {
		return nil, ErrLearningMaterialNotFound
	}

	// 增加浏览次数
	s.materialRepo.IncrementViewCount(id)

	return material.ToResponse(), nil
}

// GetMaterialWithCollectStatus 获取素材详情（带收藏状态）
func (s *MaterialService) GetMaterialWithCollectStatus(id uint, userID uint) (*model.LearningMaterialResponse, error) {
	material, err := s.materialRepo.FindByID(id)
	if err != nil {
		return nil, ErrLearningMaterialNotFound
	}

	// 增加浏览次数
	s.materialRepo.IncrementViewCount(id)

	resp := material.ToResponse()

	// 检查收藏状态
	if userID > 0 {
		isCollected, _ := s.materialRepo.IsCollected(userID, id)
		resp.IsCollected = isCollected
	}

	return resp, nil
}

// DeleteMaterial 删除素材
func (s *MaterialService) DeleteMaterial(id uint) error {
	material, err := s.materialRepo.FindByID(id)
	if err != nil {
		return ErrLearningMaterialNotFound
	}

	categoryID := material.CategoryID

	if err := s.materialRepo.Delete(id); err != nil {
		return err
	}

	// 更新分类素材数量
	s.materialCategoryRepo.UpdateMaterialCount(categoryID)

	return nil
}

// ListMaterialsResponse 素材列表响应
type ListMaterialsResponse struct {
	Materials []*model.LearningMaterialBriefResponse `json:"materials"`
	Total     int64                                  `json:"total"`
	Page      int                                    `json:"page"`
	PageSize  int                                    `json:"page_size"`
}

// ListMaterials 获取素材列表
func (s *MaterialService) ListMaterials(params *model.MaterialQueryParams) (*ListMaterialsResponse, error) {
	materials, total, err := s.materialRepo.List(params)
	if err != nil {
		return nil, err
	}

	var responses []*model.LearningMaterialBriefResponse
	for _, m := range materials {
		responses = append(responses, m.ToBriefResponse())
	}

	return &ListMaterialsResponse{
		Materials: responses,
		Total:     total,
		Page:      params.Page,
		PageSize:  params.PageSize,
	}, nil
}

// SearchMaterials 搜索素材
func (s *MaterialService) SearchMaterials(keyword string, params *model.MaterialQueryParams) (*ListMaterialsResponse, error) {
	materials, total, err := s.materialRepo.Search(keyword, params)
	if err != nil {
		return nil, err
	}

	var responses []*model.LearningMaterialBriefResponse
	for _, m := range materials {
		responses = append(responses, m.ToBriefResponse())
	}

	return &ListMaterialsResponse{
		Materials: responses,
		Total:     total,
		Page:      params.Page,
		PageSize:  params.PageSize,
	}, nil
}

// GetHotMaterials 获取热门素材
func (s *MaterialService) GetHotMaterials(limit int) ([]*model.LearningMaterialBriefResponse, error) {
	if limit <= 0 {
		limit = 10
	}
	materials, err := s.materialRepo.GetHotMaterials(limit)
	if err != nil {
		return nil, err
	}

	var responses []*model.LearningMaterialBriefResponse
	for _, m := range materials {
		responses = append(responses, m.ToBriefResponse())
	}
	return responses, nil
}

// GetFeaturedMaterials 获取精选素材
func (s *MaterialService) GetFeaturedMaterials(limit int) ([]*model.LearningMaterialBriefResponse, error) {
	if limit <= 0 {
		limit = 10
	}
	materials, err := s.materialRepo.GetFeaturedMaterials(limit)
	if err != nil {
		return nil, err
	}

	var responses []*model.LearningMaterialBriefResponse
	for _, m := range materials {
		responses = append(responses, m.ToBriefResponse())
	}
	return responses, nil
}

// GetRandomMaterials 随机获取素材
func (s *MaterialService) GetRandomMaterials(materialType model.MaterialType, count int) ([]*model.LearningMaterialBriefResponse, error) {
	if count <= 0 {
		count = 5
	}
	materials, err := s.materialRepo.GetRandomMaterials(materialType, count)
	if err != nil {
		return nil, err
	}

	var responses []*model.LearningMaterialBriefResponse
	for _, m := range materials {
		responses = append(responses, m.ToBriefResponse())
	}
	return responses, nil
}

// GetMaterialsByThemeTopic 按主题获取素材
func (s *MaterialService) GetMaterialsByThemeTopic(topic string, limit int) ([]*model.LearningMaterialBriefResponse, error) {
	if limit <= 0 {
		limit = 20
	}
	materials, err := s.materialRepo.GetByThemeTopic(topic, limit)
	if err != nil {
		return nil, err
	}

	var responses []*model.LearningMaterialBriefResponse
	for _, m := range materials {
		responses = append(responses, m.ToBriefResponse())
	}
	return responses, nil
}

// GetMaterialStats 获取素材统计
func (s *MaterialService) GetMaterialStats() (*model.MaterialStats, error) {
	return s.materialRepo.GetStats()
}

// =====================================================
// 批量操作
// =====================================================

// BatchUpdateMaterialStatus 批量更新素材状态
func (s *MaterialService) BatchUpdateMaterialStatus(ids []uint, status model.MaterialStatus) error {
	return s.materialRepo.BatchUpdateStatus(ids, status)
}

// BatchSetMaterialHot 批量设置热门
func (s *MaterialService) BatchSetMaterialHot(ids []uint, isHot bool) error {
	return s.materialRepo.BatchSetHot(ids, isHot)
}

// BatchSetMaterialFeatured 批量设置精选
func (s *MaterialService) BatchSetMaterialFeatured(ids []uint, isFeatured bool) error {
	return s.materialRepo.BatchSetFeatured(ids, isFeatured)
}

// BatchDeleteMaterials 批量删除素材
func (s *MaterialService) BatchDeleteMaterials(ids []uint) error {
	return s.materialRepo.BatchDelete(ids)
}

// =====================================================
// 素材收藏
// =====================================================

// CollectMaterial 收藏素材
func (s *MaterialService) CollectMaterial(userID, materialID uint, note string) error {
	// 检查素材是否存在
	_, err := s.materialRepo.FindByID(materialID)
	if err != nil {
		return ErrLearningMaterialNotFound
	}

	// 检查是否已收藏
	isCollected, _ := s.materialRepo.IsCollected(userID, materialID)
	if isCollected {
		return ErrMaterialAlreadyCollected
	}

	collect := &model.MaterialCollect{
		UserID:     userID,
		MaterialID: materialID,
		Note:       note,
	}

	if err := s.materialRepo.CreateCollect(collect); err != nil {
		return err
	}

	// 更新收藏数量
	s.materialRepo.IncrementCollectCount(materialID, 1)

	return nil
}

// UncollectMaterial 取消收藏素材
func (s *MaterialService) UncollectMaterial(userID, materialID uint) error {
	// 检查是否已收藏
	isCollected, _ := s.materialRepo.IsCollected(userID, materialID)
	if !isCollected {
		return ErrMaterialNotCollected
	}

	if err := s.materialRepo.DeleteCollect(userID, materialID); err != nil {
		return err
	}

	// 更新收藏数量
	s.materialRepo.IncrementCollectCount(materialID, -1)

	return nil
}

// GetUserCollectedMaterials 获取用户收藏的素材
func (s *MaterialService) GetUserCollectedMaterials(userID uint, page, pageSize int) (*ListMaterialsResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	materials, total, err := s.materialRepo.GetUserCollects(userID, page, pageSize)
	if err != nil {
		return nil, err
	}

	var responses []*model.LearningMaterialBriefResponse
	for _, m := range materials {
		resp := m.ToBriefResponse()
		responses = append(responses, resp)
	}

	return &ListMaterialsResponse{
		Materials: responses,
		Total:     total,
		Page:      page,
		PageSize:  pageSize,
	}, nil
}

// =====================================================
// 素材分类管理
// =====================================================

// CreateMaterialCategoryRequest 创建分类请求
type CreateMaterialCategoryRequest struct {
	ParentID     *uint              `json:"parent_id"`
	Name         string             `json:"name" binding:"required"`
	Code         string             `json:"code" binding:"required"`
	MaterialType model.MaterialType `json:"material_type" binding:"required"`
	Subject      string             `json:"subject"`
	Icon         string             `json:"icon"`
	Color        string             `json:"color"`
	Description  string             `json:"description"`
	SortOrder    int                `json:"sort_order"`
}

// CreateMaterialCategory 创建素材分类
func (s *MaterialService) CreateMaterialCategory(req *CreateMaterialCategoryRequest) (*model.MaterialCategory, error) {
	// 检查编码是否已存在
	exists, _ := s.materialCategoryRepo.ExistsByCode(req.Code)
	if exists {
		return nil, ErrMaterialCategoryCodeExists
	}

	// 计算层级和路径
	level := 1
	path := ""
	if req.ParentID != nil {
		parent, err := s.materialCategoryRepo.FindByID(*req.ParentID)
		if err != nil {
			return nil, ErrMaterialCategoryNotFound
		}
		level = parent.Level + 1
		if parent.Path != "" {
			path = parent.Path + "/"
		}
	}

	category := &model.MaterialCategory{
		ParentID:     req.ParentID,
		Name:         req.Name,
		Code:         req.Code,
		MaterialType: req.MaterialType,
		Subject:      req.Subject,
		Icon:         req.Icon,
		Color:        req.Color,
		Description:  req.Description,
		SortOrder:    req.SortOrder,
		Level:        level,
		IsActive:     true,
	}

	if err := s.materialCategoryRepo.Create(category); err != nil {
		return nil, err
	}

	// 更新路径
	category.Path = path + string(rune(category.ID))
	s.materialCategoryRepo.Update(category)

	return category, nil
}

// UpdateMaterialCategoryRequest 更新分类请求
type UpdateMaterialCategoryRequest struct {
	Name         string             `json:"name"`
	Code         string             `json:"code"`
	MaterialType model.MaterialType `json:"material_type"`
	Subject      string             `json:"subject"`
	Icon         string             `json:"icon"`
	Color        string             `json:"color"`
	Description  string             `json:"description"`
	SortOrder    *int               `json:"sort_order"`
	IsActive     *bool              `json:"is_active"`
}

// UpdateMaterialCategory 更新素材分类
func (s *MaterialService) UpdateMaterialCategory(id uint, req *UpdateMaterialCategoryRequest) error {
	category, err := s.materialCategoryRepo.FindByID(id)
	if err != nil {
		return ErrMaterialCategoryNotFound
	}

	// 检查编码是否冲突
	if req.Code != "" && req.Code != category.Code {
		exists, _ := s.materialCategoryRepo.ExistsByCodeExcludeID(req.Code, id)
		if exists {
			return ErrMaterialCategoryCodeExists
		}
		category.Code = req.Code
	}

	if req.Name != "" {
		category.Name = req.Name
	}
	if req.MaterialType != "" {
		category.MaterialType = req.MaterialType
	}
	category.Subject = req.Subject
	category.Icon = req.Icon
	category.Color = req.Color
	category.Description = req.Description

	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		category.IsActive = *req.IsActive
	}

	return s.materialCategoryRepo.Update(category)
}

// DeleteMaterialCategory 删除素材分类
func (s *MaterialService) DeleteMaterialCategory(id uint) error {
	// 检查是否存在
	_, err := s.materialCategoryRepo.FindByID(id)
	if err != nil {
		return ErrMaterialCategoryNotFound
	}

	// 检查是否有子分类
	hasChildren, _ := s.materialCategoryRepo.HasChildren(id)
	if hasChildren {
		return ErrMaterialCategoryHasChildren
	}

	// 检查是否有关联的素材
	hasMaterials, _ := s.materialCategoryRepo.HasMaterials(id)
	if hasMaterials {
		return ErrMaterialCategoryHasMaterials
	}

	return s.materialCategoryRepo.Delete(id)
}

// GetMaterialCategory 获取素材分类详情
func (s *MaterialService) GetMaterialCategory(id uint) (*model.MaterialCategoryResponse, error) {
	category, err := s.materialCategoryRepo.FindByID(id)
	if err != nil {
		return nil, ErrMaterialCategoryNotFound
	}
	return category.ToResponse(), nil
}

// GetMaterialCategories 获取所有素材分类
func (s *MaterialService) GetMaterialCategories() ([]*model.MaterialCategoryResponse, error) {
	categories, err := s.materialCategoryRepo.List()
	if err != nil {
		return nil, err
	}

	var responses []*model.MaterialCategoryResponse
	for _, c := range categories {
		responses = append(responses, c.ToResponse())
	}
	return responses, nil
}

// GetMaterialCategoryTree 获取素材分类树
func (s *MaterialService) GetMaterialCategoryTree() ([]*model.MaterialCategoryResponse, error) {
	categories, err := s.materialCategoryRepo.GetTree()
	if err != nil {
		return nil, err
	}

	var responses []*model.MaterialCategoryResponse
	for _, c := range categories {
		responses = append(responses, c.ToResponse())
	}
	return responses, nil
}

// GetMaterialCategoriesByType 按素材类型获取分类
func (s *MaterialService) GetMaterialCategoriesByType(materialType model.MaterialType) ([]*model.MaterialCategoryResponse, error) {
	categories, err := s.materialCategoryRepo.GetByMaterialType(materialType)
	if err != nil {
		return nil, err
	}

	var responses []*model.MaterialCategoryResponse
	for _, c := range categories {
		responses = append(responses, c.ToResponse())
	}
	return responses, nil
}

// GetMaterialCategoriesBySubject 按科目获取分类
func (s *MaterialService) GetMaterialCategoriesBySubject(subject string) ([]*model.MaterialCategoryResponse, error) {
	categories, err := s.materialCategoryRepo.GetBySubject(subject)
	if err != nil {
		return nil, err
	}

	var responses []*model.MaterialCategoryResponse
	for _, c := range categories {
		responses = append(responses, c.ToResponse())
	}
	return responses, nil
}

// GetThemeTopics 获取热点主题列表
func (s *MaterialService) GetThemeTopics() []string {
	return model.HotTopicThemes
}

// GetMaterialTypes 获取素材类型列表
func (s *MaterialService) GetMaterialTypes() map[model.MaterialType]string {
	return model.MaterialTypeNames
}

// GetMaterialSubTypes 获取素材子类型列表
func (s *MaterialService) GetMaterialSubTypes() map[model.MaterialSubType]string {
	return model.MaterialSubTypeNames
}

// =====================================================
// 批量操作
// =====================================================

// BatchImportMaterialRequest 批量导入素材请求
type BatchImportMaterialRequest struct {
	CategoryID  uint                  `json:"category_id"`
	Type        model.MaterialType    `json:"type"`
	SubType     model.MaterialSubType `json:"sub_type"`
	Title       string                `json:"title"`
	Content     string                `json:"content"`
	Source      string                `json:"source"`
	Author      string                `json:"author"`
	Year        *int                  `json:"year"`
	Tags        string                `json:"tags"`         // 逗号分隔
	ThemeTopics string                `json:"theme_topics"` // 逗号分隔
	Subject     string                `json:"subject"`
	Analysis    string                `json:"analysis"`
	Usage       string                `json:"usage"`
}

// BatchImportResult 批量导入结果
type BatchImportResult struct {
	Total   int      `json:"total"`
	Success int      `json:"success"`
	Failed  int      `json:"failed"`
	Errors  []string `json:"errors,omitempty"`
}

// BatchImportMaterials 批量导入素材
func (s *MaterialService) BatchImportMaterials(items []*BatchImportMaterialRequest, defaultCategoryID uint, defaultType model.MaterialType) *BatchImportResult {
	result := &BatchImportResult{
		Total:  len(items),
		Errors: []string{},
	}

	for i, item := range items {
		// 使用默认值
		categoryID := item.CategoryID
		if categoryID == 0 {
			categoryID = defaultCategoryID
		}
		materialType := item.Type
		if materialType == "" {
			materialType = defaultType
		}

		// 验证必填字段
		if item.Title == "" || item.Content == "" {
			result.Failed++
			result.Errors = append(result.Errors, "第"+string(rune(i+1))+"行: 标题或内容为空")
			continue
		}

		// 检查分类是否存在
		if categoryID > 0 {
			if _, err := s.materialCategoryRepo.FindByID(categoryID); err != nil {
				result.Failed++
				result.Errors = append(result.Errors, "第"+string(rune(i+1))+"行: 分类不存在")
				continue
			}
		}

		// 解析标签
		var tags []string
		if item.Tags != "" {
			for _, tag := range splitAndTrim(item.Tags, ",") {
				if tag != "" {
					tags = append(tags, tag)
				}
			}
		}

		// 解析主题
		var themeTopics []string
		if item.ThemeTopics != "" {
			for _, topic := range splitAndTrim(item.ThemeTopics, ",") {
				if topic != "" {
					themeTopics = append(themeTopics, topic)
				}
			}
		}

		// 创建素材
		material := &model.LearningMaterial{
			CategoryID:  categoryID,
			Type:        materialType,
			SubType:     item.SubType,
			Title:       item.Title,
			Content:     item.Content,
			Source:      item.Source,
			Author:      item.Author,
			Year:        item.Year,
			Tags:        tags,
			ThemeTopics: themeTopics,
			Subject:     item.Subject,
			Analysis:    item.Analysis,
			Usage:       item.Usage,
			IsFree:      true,
			Status:      model.MaterialStatusDraft, // 批量导入默认为草稿
		}

		if err := s.materialRepo.Create(material); err != nil {
			result.Failed++
			result.Errors = append(result.Errors, "第"+string(rune(i+1))+"行: 创建失败")
			continue
		}

		result.Success++
	}

	// 更新分类素材数量
	if defaultCategoryID > 0 {
		s.materialCategoryRepo.UpdateMaterialCount(defaultCategoryID)
	}

	return result
}

// splitAndTrim 分割并去除空格
func splitAndTrim(s string, sep string) []string {
	var result []string
	for _, part := range strings.Split(s, sep) {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}
	return result
}

// =====================================================
// AI 素材生成
// =====================================================

// AIGenerateMaterialRequest AI 生成素材请求
type AIGenerateMaterialRequest struct {
	Type        model.MaterialType    `json:"type" binding:"required"`
	SubType     model.MaterialSubType `json:"sub_type"`
	Theme       string                `json:"theme"`        // 主题
	Subject     string                `json:"subject"`      // 科目
	Count       int                   `json:"count"`        // 生成数量
	CategoryID  uint                  `json:"category_id"`  // 分类ID
	AutoPublish bool                  `json:"auto_publish"` // 自动发布
}

// AIGeneratedMaterial AI 生成的素材
type AIGeneratedMaterial struct {
	Title       string   `json:"title"`
	Content     string   `json:"content"`
	Source      string   `json:"source,omitempty"`
	Author      string   `json:"author,omitempty"`
	Analysis    string   `json:"analysis,omitempty"`
	Usage       string   `json:"usage,omitempty"`
	Tags        []string `json:"tags,omitempty"`
	ThemeTopics []string `json:"theme_topics,omitempty"`
}

// AIGenerateMaterialResult AI 生成素材结果
type AIGenerateMaterialResult struct {
	Generated int                    `json:"generated"`
	Saved     int                    `json:"saved"`
	Materials []*AIGeneratedMaterial `json:"materials"`
	Errors    []string               `json:"errors,omitempty"`
}

// GenerateMaterialsWithAI 使用 AI 生成素材
func (s *MaterialService) GenerateMaterialsWithAI(req *AIGenerateMaterialRequest) (*AIGenerateMaterialResult, error) {
	if req.Count <= 0 {
		req.Count = 5
	}
	if req.Count > 20 {
		req.Count = 20
	}

	result := &AIGenerateMaterialResult{
		Materials: []*AIGeneratedMaterial{},
		Errors:    []string{},
	}

	// 根据不同类型生成素材
	var materials []*AIGeneratedMaterial

	switch req.Type {
	case model.MaterialTypeQuote:
		materials = s.generateQuoteMaterials(req)
	case model.MaterialTypeCase:
		materials = s.generateCaseMaterials(req)
	case model.MaterialTypeSentence:
		materials = s.generateSentenceMaterials(req)
	case model.MaterialTypeHotTopic:
		materials = s.generateHotTopicMaterials(req)
	case model.MaterialTypeInterview:
		materials = s.generateInterviewMaterials(req)
	case model.MaterialTypeKnowledge:
		materials = s.generateKnowledgeMaterials(req)
	default:
		materials = s.generateGenericMaterials(req)
	}

	result.Generated = len(materials)
	result.Materials = materials

	// 如果指定了分类，保存到数据库
	if req.CategoryID > 0 {
		status := model.MaterialStatusDraft
		if req.AutoPublish {
			status = model.MaterialStatusPublished
		}

		for _, m := range materials {
			material := &model.LearningMaterial{
				CategoryID:  req.CategoryID,
				Type:        req.Type,
				SubType:     req.SubType,
				Title:       m.Title,
				Content:     m.Content,
				Source:      m.Source,
				Author:      m.Author,
				Analysis:    m.Analysis,
				Usage:       m.Usage,
				Tags:        m.Tags,
				ThemeTopics: m.ThemeTopics,
				Subject:     req.Subject,
				IsFree:      true,
				Status:      status,
			}
			if status == model.MaterialStatusPublished {
				now := time.Now()
				material.PublishedAt = &now
			}

			if err := s.materialRepo.Create(material); err != nil {
				result.Errors = append(result.Errors, "保存失败: "+m.Title)
			} else {
				result.Saved++
			}
		}

		// 更新分类数量
		s.materialCategoryRepo.UpdateMaterialCount(req.CategoryID)
	}

	return result, nil
}

// generateQuoteMaterials 生成名言警句素材
func (s *MaterialService) generateQuoteMaterials(req *AIGenerateMaterialRequest) []*AIGeneratedMaterial {
	theme := req.Theme
	if theme == "" {
		theme = "综合"
	}

	// 预定义的名言警句模板（实际应用中应调用 LLM）
	quoteTemplates := map[string][]AIGeneratedMaterial{
		"乡村振兴": {
			{Title: "民族要复兴，乡村必振兴", Content: "民族要复兴，乡村必振兴。全面建设社会主义现代化国家，最艰巨最繁重的任务仍然在农村。", Source: "习近平总书记讲话", Author: "习近平", Analysis: "深刻阐述了乡村振兴与民族复兴的内在关系，强调农村在现代化建设中的重要地位。", Usage: "适用于乡村振兴、农业农村、共同富裕等主题的申论写作", Tags: []string{"乡村振兴", "民族复兴", "农村发展"}, ThemeTopics: []string{"乡村振兴"}},
			{Title: "农业强国是社会主义现代化强国的根基", Content: "农业强国是社会主义现代化强国的根基，满足人民美好生活需要、实现高质量发展、夯实国家安全基础，都离不开农业发展。", Source: "习近平总书记讲话", Author: "习近平", Analysis: "从国家战略高度阐述农业强国建设的重要性，体现了农业是国之大者的深刻认识。", Usage: "适用于农业现代化、粮食安全、国家安全等主题", Tags: []string{"农业强国", "现代化", "国家安全"}, ThemeTopics: []string{"乡村振兴", "粮食安全"}},
		},
		"生态文明": {
			{Title: "绿水青山就是金山银山", Content: "绿水青山就是金山银山，阐明了经济发展和生态环境保护的关系，揭示了保护生态环境就是保护生产力、改善生态环境就是发展生产力的道理。", Source: "习近平生态文明思想", Author: "习近平", Analysis: "这一理念深刻揭示了经济发展与生态保护的辩证统一关系，是生态文明建设的核心理念。", Usage: "适用于生态文明、环境保护、绿色发展、可持续发展等主题", Tags: []string{"生态文明", "绿色发展", "环境保护"}, ThemeTopics: []string{"生态文明", "绿色发展"}},
			{Title: "像保护眼睛一样保护生态环境", Content: "要像保护眼睛一样保护生态环境，像对待生命一样对待生态环境，让自然生态美景永驻人间，还自然以宁静、和谐、美丽。", Source: "习近平总书记讲话", Author: "习近平", Analysis: "用生动比喻强调生态环境保护的极端重要性，体现了对自然的敬畏和对人民的负责。", Usage: "适用于生态保护、美丽中国建设等主题", Tags: []string{"生态保护", "美丽中国", "人与自然"}, ThemeTopics: []string{"生态文明"}},
		},
		"科技创新": {
			{Title: "科技是第一生产力", Content: "科学技术是第一生产力，创新是引领发展的第一动力。抓创新就是抓发展，谋创新就是谋未来。", Source: "习近平总书记讲话", Author: "习近平", Analysis: "明确了科技创新在国家发展中的核心地位，强调创新驱动发展战略的重要性。", Usage: "适用于科技创新、高质量发展、新质生产力等主题", Tags: []string{"科技创新", "第一生产力", "创新驱动"}, ThemeTopics: []string{"科技创新"}},
			{Title: "关键核心技术是要不来、买不来、讨不来的", Content: "关键核心技术是要不来、买不来、讨不来的，只有把关键核心技术掌握在自己手中，才能从根本上保障国家经济安全、国防安全和其他安全。", Source: "习近平总书记讲话", Author: "习近平", Analysis: "强调科技自立自强的紧迫性和必要性，体现了对国家安全和发展的战略思考。", Usage: "适用于科技自立、国家安全、自主创新等主题", Tags: []string{"核心技术", "自主创新", "国家安全"}, ThemeTopics: []string{"科技创新", "国家安全"}},
		},
		"民生保障": {
			{Title: "人民对美好生活的向往就是我们的奋斗目标", Content: "人民对美好生活的向往，就是我们的奋斗目标。我们要坚持把人民群众的小事当作自己的大事，从人民群众关心的事情做起，从让人民群众满意的事情做起。", Source: "习近平总书记讲话", Author: "习近平", Analysis: "体现了以人民为中心的发展思想，明确了党的根本宗旨和执政理念。", Usage: "适用于民生保障、为民服务、以人民为中心等主题", Tags: []string{"以人民为中心", "民生保障", "为民服务"}, ThemeTopics: []string{"民生保障"}},
			{Title: "保障和改善民生没有终点，只有连续不断的新起点", Content: "保障和改善民生没有终点，只有连续不断的新起点。要采取针对性更强、覆盖面更大、作用更直接、效果更明显的举措，实实在在帮群众解难题、为群众增福祉、让群众享公平。", Source: "习近平总书记讲话", Author: "习近平", Analysis: "强调民生工作的持续性和实效性，体现了对人民群众切身利益的高度关注。", Usage: "适用于民生工作、公共服务、社会保障等主题", Tags: []string{"民生改善", "社会保障", "群众利益"}, ThemeTopics: []string{"民生保障"}},
		},
		"综合": {
			{Title: "实干兴邦，空谈误国", Content: "实干兴邦，空谈误国。社会主义是干出来的，新时代也是干出来的。我们要大力弘扬实干精神，努力让人民群众看到变化、得到实惠。", Source: "习近平总书记讲话", Author: "习近平", Analysis: "强调实干精神的重要性，倡导求真务实、真抓实干的工作作风。", Usage: "适用于工作作风、实干精神、干部担当等主题", Tags: []string{"实干精神", "务实", "担当作为"}, ThemeTopics: []string{}},
			{Title: "不忘初心，牢记使命", Content: "不忘初心，方得始终。中国共产党人的初心和使命，就是为中国人民谋幸福，为中华民族谋复兴。", Source: "党的十九大报告", Author: "习近平", Analysis: "阐明了中国共产党的初心使命，是全党开展学习教育的重要内容。", Usage: "适用于党建、初心使命、理想信念等主题", Tags: []string{"初心使命", "党建", "理想信念"}, ThemeTopics: []string{}},
		},
	}

	// 获取对应主题的素材
	templates, ok := quoteTemplates[theme]
	if !ok {
		templates = quoteTemplates["综合"]
	}

	// 根据请求数量返回
	result := make([]*AIGeneratedMaterial, 0, req.Count)
	for i := 0; i < req.Count && i < len(templates); i++ {
		m := templates[i]
		result = append(result, &m)
	}

	return result
}

// generateCaseMaterials 生成案例素材
func (s *MaterialService) generateCaseMaterials(req *AIGenerateMaterialRequest) []*AIGeneratedMaterial {
	theme := req.Theme
	if theme == "" {
		theme = "综合"
	}

	caseTemplates := map[string][]AIGeneratedMaterial{
		"乡村振兴": {
			{Title: "浙江千万工程经验", Content: "浙江省千村示范、万村整治工程从2003年开始实施，20年来造就了万千美丽乡村。该工程从农村环境整治入手，由点及面、迭代升级，推动乡村实现人居环境、公共服务、产业发展、文化建设等全面提升，为全国乡村振兴提供了成功样板。", Source: "浙江省乡村振兴实践", Author: "", Analysis: "该案例体现了久久为功、循序渐进的工作方法，是两山理论的生动实践，对推进乡村振兴具有重要借鉴意义。", Usage: "适用于乡村振兴、农村环境整治、美丽乡村建设等主题", Tags: []string{"千万工程", "美丽乡村", "浙江经验"}, ThemeTopics: []string{"乡村振兴"}},
		},
		"科技创新": {
			{Title: "华为5G技术自主创新", Content: "面对外部打压，华为坚持自主创新，每年将超过销售收入10%投入研发。在5G领域，华为累计获得超过11万件有效专利，其中90%以上为发明专利。华为5G技术在全球处于领先地位，向世界证明了中国企业的创新能力。", Source: "华为公司发展历程", Author: "", Analysis: "华为案例展示了自主创新的重要性，证明只有掌握核心技术才能不受制于人，对推进科技自立自强具有重要启示。", Usage: "适用于科技创新、自主研发、企业发展等主题", Tags: []string{"华为", "5G", "自主创新"}, ThemeTopics: []string{"科技创新"}},
		},
		"生态文明": {
			{Title: "塞罕坝林场生态修复", Content: "塞罕坝林场位于河北省最北部，曾经是黄沙遮天日、飞鸟无栖树的荒漠沙地。三代塞罕坝林场人坚持60多年造林，在荒漠上建成了世界上面积最大的人工林场，创造了荒原变林海的人间奇迹，被授予联合国地球卫士奖。", Source: "塞罕坝林场发展史", Author: "", Analysis: "塞罕坝精神体现了艰苦奋斗、久久为功的优良作风，是践行绿色发展理念的生动典范。", Usage: "适用于生态文明、绿色发展、艰苦奋斗等主题", Tags: []string{"塞罕坝", "生态修复", "艰苦奋斗"}, ThemeTopics: []string{"生态文明"}},
		},
		"综合": {
			{Title: "脱贫攻坚战全面胜利", Content: "经过8年持续奋斗，到2020年底，我国如期完成新时代脱贫攻坚目标任务，现行标准下9899万农村贫困人口全部脱贫，832个贫困县全部摘帽，12.8万个贫困村全部出列，创造了人类减贫史上的奇迹。", Source: "中国脱贫攻坚纪实", Author: "", Analysis: "脱贫攻坚的全面胜利，彰显了中国共产党的领导优势和中国特色社会主义制度优势，是以人民为中心发展思想的生动体现。", Usage: "适用于脱贫攻坚、民生保障、制度优势等主题", Tags: []string{"脱贫攻坚", "全面小康", "民生保障"}, ThemeTopics: []string{"民生保障"}},
		},
	}

	templates, ok := caseTemplates[theme]
	if !ok {
		templates = caseTemplates["综合"]
	}

	result := make([]*AIGeneratedMaterial, 0, req.Count)
	for i := 0; i < req.Count && i < len(templates); i++ {
		m := templates[i]
		result = append(result, &m)
	}

	return result
}

// generateSentenceMaterials 生成优美语句素材
func (s *MaterialService) generateSentenceMaterials(req *AIGenerateMaterialRequest) []*AIGeneratedMaterial {
	sentenceTemplates := []AIGeneratedMaterial{
		{Title: "开头句式-时代背景", Content: "当今时代，是一个大发展、大变革、大调整的时代。站在新的历史起点上，我们面临着前所未有的机遇与挑战。", Source: "申论写作", Analysis: "从时代背景切入，展现宏观视野，适合作为文章开头。", Usage: "适用于各类社会话题的开篇", Tags: []string{"开头句式", "时代背景"}, ThemeTopics: []string{}},
		{Title: "过渡句式-承上启下", Content: "诚然，我们在取得显著成绩的同时，也要清醒地看到存在的问题和不足。只有正视问题，才能找准方向、精准施策。", Source: "申论写作", Analysis: "承认成绩的同时引出问题，自然过渡，逻辑严密。", Usage: "适用于文章中间部分的转折过渡", Tags: []string{"过渡句式", "辩证分析"}, ThemeTopics: []string{}},
		{Title: "结尾句式-展望未来", Content: "展望未来，我们坚信：只要我们坚定信心、凝心聚力、真抓实干，就一定能够战胜前进道路上的一切艰难险阻，创造更加美好的明天。", Source: "申论写作", Analysis: "表达坚定信心和美好期望，收束有力，余韵悠长。", Usage: "适用于文章结尾的升华总结", Tags: []string{"结尾句式", "展望未来"}, ThemeTopics: []string{}},
		{Title: "论证句式-递进式", Content: "这不仅关乎当前发展大局，更关乎长远战略全局；不仅是经济问题，更是政治问题；不仅影响当代，更影响子孙后代。", Source: "申论写作", Analysis: "层层递进，强调问题的重要性和紧迫性。", Usage: "适用于论证问题重要性时", Tags: []string{"论证句式", "递进式"}, ThemeTopics: []string{}},
	}

	result := make([]*AIGeneratedMaterial, 0, req.Count)
	for i := 0; i < req.Count && i < len(sentenceTemplates); i++ {
		m := sentenceTemplates[i]
		result = append(result, &m)
	}

	return result
}

// generateHotTopicMaterials 生成热点专题素材
func (s *MaterialService) generateHotTopicMaterials(req *AIGenerateMaterialRequest) []*AIGeneratedMaterial {
	theme := req.Theme
	if theme == "" {
		theme = "新质生产力"
	}

	hotTopicTemplates := map[string][]AIGeneratedMaterial{
		"新质生产力": {
			{Title: "新质生产力的内涵与特征", Content: "新质生产力是创新起主导作用，摆脱传统经济增长方式、生产力发展路径，具有高科技、高效能、高质量特征，符合新发展理念的先进生产力质态。其核心要素包括：劳动者、劳动资料、劳动对象的优化组合，以及科技创新、产业升级、绿色发展的有机统一。", Source: "习近平经济思想", Analysis: "深入理解新质生产力的科学内涵，是把握高质量发展方向的关键。", Usage: "适用于经济发展、科技创新、高质量发展等主题", Tags: []string{"新质生产力", "高质量发展", "科技创新"}, ThemeTopics: []string{"新质生产力", "高质量发展"}},
			{Title: "发展新质生产力的路径", Content: "发展新质生产力，一要深化科技体制改革，加快实现高水平科技自立自强；二要推进产业智能化、绿色化、融合化，建设现代化产业体系；三要培育壮大新兴产业和未来产业，抢占发展制高点；四要推动传统产业转型升级，增强发展新动能。", Source: "政策解读", Analysis: "从多个维度阐述发展新质生产力的实践路径，具有很强的指导意义。", Usage: "适用于论述发展措施和政策建议时", Tags: []string{"新质生产力", "产业升级", "政策建议"}, ThemeTopics: []string{"新质生产力", "科技创新"}},
		},
		"数字经济": {
			{Title: "数字经济的发展趋势", Content: "数字经济正在成为重组全球要素资源、重塑全球经济结构、改变全球竞争格局的关键力量。我国数字经济规模连续多年位居世界第二，数字基础设施全球领先，数字化应用场景丰富，为经济高质量发展注入了强劲动力。", Source: "数字中国发展报告", Analysis: "全面认识数字经济的战略意义，对把握发展机遇具有重要参考价值。", Usage: "适用于数字经济、新基建、数字化转型等主题", Tags: []string{"数字经济", "数字化", "高质量发展"}, ThemeTopics: []string{"数字经济", "科技创新"}},
		},
	}

	templates, ok := hotTopicTemplates[theme]
	if !ok {
		templates = hotTopicTemplates["新质生产力"]
	}

	result := make([]*AIGeneratedMaterial, 0, req.Count)
	for i := 0; i < req.Count && i < len(templates); i++ {
		m := templates[i]
		result = append(result, &m)
	}

	return result
}

// generateInterviewMaterials 生成面试素材
func (s *MaterialService) generateInterviewMaterials(req *AIGenerateMaterialRequest) []*AIGeneratedMaterial {
	interviewTemplates := []AIGeneratedMaterial{
		{Title: "面试开场金句-表达决心", Content: "作为一名即将步入公务员队伍的年轻人，我深感使命光荣、责任重大。我将以饱满的热情、务实的作风、扎实的工作，不负组织重托，不负人民期望。", Source: "面试金句库", Analysis: "展现政治站位高、工作态度端正，适合作为自我介绍或表态发言的开场。", Usage: "适用于自我介绍、表态发言等场合", Tags: []string{"面试开场", "表态发言"}, ThemeTopics: []string{}},
		{Title: "综合分析题-辩证思维", Content: "对于这个问题，我们要用辩证的眼光来看。一方面，我们要充分肯定其积极意义；另一方面，我们也要清醒地看到可能存在的问题和风险。只有全面客观地分析问题，才能提出切实可行的对策。", Source: "面试答题框架", Analysis: "体现辩证思维能力，避免片面化、绝对化，是综合分析题的基本答题思路。", Usage: "适用于综合分析类题目", Tags: []string{"综合分析", "辩证思维"}, ThemeTopics: []string{}},
		{Title: "应急应变题-处置原则", Content: "面对突发情况，我会保持冷静，按照轻重缓急原则有序处置：首先，确保人员安全，稳定现场秩序；其次，及时向上级汇报，争取指导和支持；再次，迅速查明原因，采取针对性措施；最后，做好善后工作，总结经验教训。", Source: "面试答题框架", Analysis: "展现处置突发事件的能力和素质，逻辑清晰，层次分明。", Usage: "适用于应急应变类题目", Tags: []string{"应急应变", "处置原则"}, ThemeTopics: []string{}},
	}

	result := make([]*AIGeneratedMaterial, 0, req.Count)
	for i := 0; i < req.Count && i < len(interviewTemplates); i++ {
		m := interviewTemplates[i]
		result = append(result, &m)
	}

	return result
}

// generateKnowledgeMaterials 生成常识素材
func (s *MaterialService) generateKnowledgeMaterials(req *AIGenerateMaterialRequest) []*AIGeneratedMaterial {
	knowledgeTemplates := []AIGeneratedMaterial{
		{Title: "党的二十大召开时间", Content: "中国共产党第二十次全国代表大会于2022年10月16日至22日在北京召开。大会的主题是：高举中国特色社会主义伟大旗帜，全面贯彻新时代中国特色社会主义思想，弘扬伟大建党精神，自信自强、守正创新，踔厉奋发、勇毅前行，为全面建设社会主义现代化国家、全面推进中华民族伟大复兴而团结奋斗。", Source: "时政常识", Analysis: "党的二十大是重要的政治常识考点，需要掌握召开时间、地点、主题等关键信息。", Usage: "适用于政治常识、时政热点等考查", Tags: []string{"党的二十大", "时政常识"}, ThemeTopics: []string{}},
		{Title: "中国式现代化的特征", Content: "中国式现代化是人口规模巨大的现代化、全体人民共同富裕的现代化、物质文明和精神文明相协调的现代化、人与自然和谐共生的现代化、走和平发展道路的现代化。这五个方面既是中国式现代化的鲜明特色，也是中国式现代化的本质要求。", Source: "党的二十大报告", Analysis: "深刻理解中国式现代化的科学内涵和本质特征，是学习党的创新理论的重要内容。", Usage: "适用于政治理论、时政热点等考查", Tags: []string{"中国式现代化", "政治理论"}, ThemeTopics: []string{}},
	}

	result := make([]*AIGeneratedMaterial, 0, req.Count)
	for i := 0; i < req.Count && i < len(knowledgeTemplates); i++ {
		m := knowledgeTemplates[i]
		result = append(result, &m)
	}

	return result
}

// generateGenericMaterials 生成通用素材
func (s *MaterialService) generateGenericMaterials(req *AIGenerateMaterialRequest) []*AIGeneratedMaterial {
	return []*AIGeneratedMaterial{
		{
			Title:   "示例素材",
			Content: "这是一条 AI 生成的示例素材，实际内容需要根据主题和类型进行定制生成。",
			Source:  "AI生成",
			Tags:    []string{"示例"},
		},
	}
}

// GetMaterialTemplates 获取素材模板
func (s *MaterialService) GetMaterialTemplates(materialType model.MaterialType) []map[string]interface{} {
	templates := []map[string]interface{}{}

	switch materialType {
	case model.MaterialTypeQuote:
		templates = append(templates, map[string]interface{}{
			"name":        "名言警句模板",
			"description": "适用于领导人讲话、名人名言等",
			"fields":      []string{"title", "content", "source", "author", "analysis", "usage", "tags"},
		})
	case model.MaterialTypeCase:
		templates = append(templates, map[string]interface{}{
			"name":        "案例素材模板",
			"description": "适用于典型案例、事迹材料等",
			"fields":      []string{"title", "content", "source", "analysis", "usage", "tags", "theme_topics"},
		})
	case model.MaterialTypeSentence:
		templates = append(templates, map[string]interface{}{
			"name":        "优美语句模板",
			"description": "适用于开头句式、过渡句式、结尾句式等",
			"fields":      []string{"title", "content", "analysis", "usage", "tags"},
		})
	}

	return templates
}

// =====================================================
// 素材内容预填充
// =====================================================

// PresetDataCategory 预置数据分类
type PresetDataCategory struct {
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Count       int    `json:"count"`
}

// PresetDataInfo 预置数据信息
type PresetDataInfo struct {
	TotalCategories int                  `json:"total_categories"`
	TotalMaterials  int                  `json:"total_materials"`
	Categories      []PresetDataCategory `json:"categories"`
}

// GetPresetDataInfo 获取预置数据信息
func (s *MaterialService) GetPresetDataInfo() *PresetDataInfo {
	info := &PresetDataInfo{
		Categories: []PresetDataCategory{
			{Name: "习近平讲话金句", Code: "xi_quotes", Description: "习近平总书记重要讲话金句", Count: 50},
			{Name: "古代名言警句", Code: "ancient_quotes", Description: "经典古文名句", Count: 30},
			{Name: "正面典型案例", Code: "positive_cases", Description: "先进人物、地方经验案例", Count: 20},
			{Name: "热点专题素材", Code: "hot_topics", Description: "乡村振兴、生态文明等热点", Count: 30},
			{Name: "优美语句库", Code: "sentences", Description: "开头、过渡、结尾句式", Count: 40},
			{Name: "面试答题素材", Code: "interview", Description: "面试金句和答题框架", Count: 25},
		},
	}

	for _, cat := range info.Categories {
		info.TotalMaterials += cat.Count
	}
	info.TotalCategories = len(info.Categories)

	return info
}

// PrefillMaterialsRequest 预填充素材请求
type PrefillMaterialsRequest struct {
	CategoryCodes    []string `json:"category_codes"`     // 要填充的分类代码
	TargetCategoryID uint     `json:"target_category_id"` // 目标分类ID
	AutoPublish      bool     `json:"auto_publish"`
}

// PrefillMaterialsResult 预填充结果
type PrefillMaterialsResult struct {
	Total   int      `json:"total"`
	Success int      `json:"success"`
	Failed  int      `json:"failed"`
	Errors  []string `json:"errors,omitempty"`
}

// PrefillMaterials 预填充素材数据
func (s *MaterialService) PrefillMaterials(req *PrefillMaterialsRequest) (*PrefillMaterialsResult, error) {
	result := &PrefillMaterialsResult{
		Errors: []string{},
	}

	status := model.MaterialStatusDraft
	if req.AutoPublish {
		status = model.MaterialStatusPublished
	}

	for _, code := range req.CategoryCodes {
		var materials []*model.LearningMaterial

		switch code {
		case "xi_quotes":
			materials = s.getXiJinpingQuotes(req.TargetCategoryID, status)
		case "ancient_quotes":
			materials = s.getAncientQuotes(req.TargetCategoryID, status)
		case "positive_cases":
			materials = s.getPositiveCases(req.TargetCategoryID, status)
		case "hot_topics":
			materials = s.getHotTopicMaterials(req.TargetCategoryID, status)
		case "sentences":
			materials = s.getSentenceMaterials(req.TargetCategoryID, status)
		case "interview":
			materials = s.getInterviewMaterials(req.TargetCategoryID, status)
		default:
			continue
		}

		for _, m := range materials {
			result.Total++
			if err := s.materialRepo.Create(m); err != nil {
				result.Failed++
				result.Errors = append(result.Errors, m.Title+": 创建失败")
			} else {
				result.Success++
			}
		}
	}

	// 更新分类数量
	if req.TargetCategoryID > 0 {
		s.materialCategoryRepo.UpdateMaterialCount(req.TargetCategoryID)
	}

	return result, nil
}

// getXiJinpingQuotes 获取习近平讲话金句
func (s *MaterialService) getXiJinpingQuotes(categoryID uint, status model.MaterialStatus) []*model.LearningMaterial {
	now := time.Now()
	quotes := []struct {
		Title    string
		Content  string
		Theme    string
		Year     int
		Analysis string
		Usage    string
	}{
		// 乡村振兴主题
		{"民族要复兴，乡村必振兴", "民族要复兴，乡村必振兴。全面建设社会主义现代化国家，最艰巨最繁重的任务仍然在农村。", "乡村振兴", 2021, "深刻阐述了乡村振兴与民族复兴的内在关系，强调农村在现代化建设中的重要地位。", "适用于乡村振兴、三农问题、共同富裕等主题"},
		{"农业强国是社会主义现代化强国的根基", "农业强国是社会主义现代化强国的根基，满足人民美好生活需要、实现高质量发展、夯实国家安全基础，都离不开农业发展。", "乡村振兴", 2022, "从国家战略高度阐述农业强国建设的重要性。", "适用于农业现代化、粮食安全等主题"},
		{"中国人的饭碗任何时候都要牢牢端在自己手中", "中国人的饭碗任何时候都要牢牢端在自己手中，饭碗主要装中国粮。", "粮食安全", 2022, "强调粮食安全的极端重要性，体现了忧患意识和底线思维。", "适用于粮食安全、国家安全等主题"},

		// 生态文明主题
		{"绿水青山就是金山银山", "绿水青山就是金山银山，阐明了经济发展和生态环境保护的关系。", "生态文明", 2013, "揭示了经济发展与生态保护的辩证统一关系，是生态文明建设的核心理念。", "适用于生态文明、环境保护、绿色发展等主题"},
		{"像保护眼睛一样保护生态环境", "要像保护眼睛一样保护生态环境，像对待生命一样对待生态环境。", "生态文明", 2015, "用生动比喻强调生态环境保护的极端重要性。", "适用于生态保护、美丽中国建设等主题"},
		{"生态兴则文明兴，生态衰则文明衰", "生态兴则文明兴，生态衰则文明衰。生态环境是人类生存和发展的根基。", "生态文明", 2018, "从文明兴衰高度阐述生态环境的重要性。", "适用于生态文明建设的论述"},
		{"共同构建人与自然生命共同体", "我们要坚持以人为本，统筹考虑人与自然和谐共生，共同构建人与自然生命共同体。", "生态文明", 2021, "体现了人与自然和谐共生的发展理念。", "适用于生态文明、可持续发展等主题"},

		// 科技创新主题
		{"科学技术是第一生产力", "科学技术是第一生产力，创新是引领发展的第一动力。", "科技创新", 2018, "明确了科技创新在国家发展中的核心地位。", "适用于科技创新、高质量发展等主题"},
		{"关键核心技术是要不来、买不来、讨不来的", "关键核心技术是要不来、买不来、讨不来的，只有把关键核心技术掌握在自己手中，才能从根本上保障国家经济安全、国防安全。", "科技创新", 2018, "强调科技自立自强的紧迫性和必要性。", "适用于科技自立、国家安全等主题"},
		{"加快实现高水平科技自立自强", "科技自立自强是国家强盛之基、安全之要。我们必须完整、准确、全面贯彻新发展理念，深入实施创新驱动发展战略，加快实现高水平科技自立自强。", "科技创新", 2022, "系统阐述科技自立自强的战略意义。", "适用于科技创新、创新驱动发展等主题"},
		{"发展新质生产力", "发展新质生产力是推动高质量发展的内在要求和重要着力点。新质生产力是创新起主导作用，摆脱传统经济增长方式、生产力发展路径，具有高科技、高效能、高质量特征。", "科技创新", 2024, "提出新质生产力的科学内涵和发展要求。", "适用于新质生产力、高质量发展等主题"},

		// 民生保障主题
		{"人民对美好生活的向往，就是我们的奋斗目标", "人民对美好生活的向往，就是我们的奋斗目标。", "民生保障", 2012, "体现了以人民为中心的发展思想。", "适用于民生保障、为民服务等主题"},
		{"保障和改善民生没有终点", "保障和改善民生没有终点，只有连续不断的新起点。", "民生保障", 2017, "强调民生工作的持续性和实效性。", "适用于民生工作、社会保障等主题"},
		{"让人民群众的获得感成色更足", "要坚持以人民为中心的发展思想，让人民群众的获得感成色更足、幸福感更可持续、安全感更有保障。", "民生保障", 2020, "具体阐述人民获得感的内涵要求。", "适用于民生改善、共同富裕等主题"},
		{"江山就是人民，人民就是江山", "江山就是人民，人民就是江山。打江山、守江山，守的是人民的心。", "民生保障", 2021, "深刻揭示党与人民的血肉联系。", "适用于党建、为民服务等主题"},

		// 依法治国主题
		{"法治是治国理政的基本方式", "法治是治国理政的基本方式，依法治国是坚持和发展中国特色社会主义的本质要求。", "依法治国", 2014, "阐明法治在国家治理中的重要地位。", "适用于法治建设、依法治国等主题"},
		{"努力让人民群众在每一个司法案件中感受到公平正义", "努力让人民群众在每一个司法案件中感受到公平正义。", "依法治国", 2013, "体现了司法为民的价值追求。", "适用于司法公正、法治建设等主题"},
		{"坚持依法治国、依法执政、依法行政共同推进", "坚持依法治国、依法执政、依法行政共同推进，坚持法治国家、法治政府、法治社会一体建设。", "依法治国", 2020, "系统阐述全面依法治国的工作布局。", "适用于法治建设等主题"},

		// 文化建设主题
		{"文化自信是更基础、更广泛、更深厚的自信", "文化自信，是更基础、更广泛、更深厚的自信，是更基本、更深沉、更持久的力量。", "文化建设", 2016, "深刻阐述文化自信的重要地位。", "适用于文化自信、文化建设等主题"},
		{"坚持创造性转化、创新性发展", "推动中华优秀传统文化创造性转化、创新性发展，继承革命文化，发展社会主义先进文化。", "文化建设", 2017, "明确了文化发展的基本方针。", "适用于文化传承创新等主题"},

		// 社会治理主题
		{"社会治理是一门科学", "社会治理是一门科学，管得太死，一潭死水不行；管得太松，波涛汹涌也不行。", "社会治理", 2014, "揭示了社会治理的辩证规律。", "适用于社会治理、基层治理等主题"},
		{"加强和创新社会治理", "加强和创新社会治理，坚持系统治理、依法治理、综合治理、源头治理。", "社会治理", 2019, "明确了社会治理的基本方法。", "适用于社会治理创新等主题"},

		// 国际关系主题
		{"构建人类命运共同体", "我们要站在世界历史的高度审视当今世界发展趋势和面临的重大问题，坚持和平发展道路，推动构建人类命运共同体。", "国际关系", 2017, "提出人类命运共同体的宏伟构想。", "适用于国际关系、全球治理等主题"},
		{"中国人民是具有伟大创造精神的人民", "中国人民是具有伟大创造精神、伟大奋斗精神、伟大团结精神、伟大梦想精神的人民。", "民族精神", 2018, "高度概括中国人民的伟大精神。", "适用于民族精神、中国精神等主题"},

		// 党建主题
		{"打铁必须自身硬", "打铁必须自身硬。党要团结带领人民进行伟大斗争、推进伟大事业、实现伟大梦想，必须毫不动摇坚持和完善党的领导，毫不动摇把党建设得更加坚强有力。", "党建", 2017, "强调党的自身建设的重要性。", "适用于党建、从严治党等主题"},
		{"不忘初心、牢记使命", "不忘初心，方得始终。中国共产党人的初心和使命，就是为中国人民谋幸福，为中华民族谋复兴。", "党建", 2017, "阐明党的初心使命。", "适用于初心使命、党建等主题"},
		{"自我革命是我们党跳出历史周期率的第二个答案", "自我革命是我们党跳出历史周期率的第二个答案。", "党建", 2022, "提出党的自我革命的重大命题。", "适用于党的建设、自我革命等主题"},

		// 奋斗精神主题
		{"撸起袖子加油干", "撸起袖子加油干！", "奋斗精神", 2017, "鼓舞全国人民实干奋斗的号召。", "适用于实干精神、奋斗进取等主题"},
		{"幸福都是奋斗出来的", "幸福都是奋斗出来的。", "奋斗精神", 2018, "揭示幸福与奋斗的关系。", "适用于奋斗精神等主题"},
		{"伟大梦想不是等得来、喊得来的，而是拼出来、干出来的", "伟大梦想不是等得来、喊得来的，而是拼出来、干出来的。", "奋斗精神", 2018, "强调实干的重要性。", "适用于实干精神、追梦圆梦等主题"},

		// 青年主题
		{"青年兴则国家兴，青年强则国家强", "青年兴则国家兴，青年强则国家强。青年一代有理想、有本领、有担当，国家就有前途，民族就有希望。", "青年", 2017, "阐述青年与国家民族的关系。", "适用于青年发展、教育等主题"},
		{"立志做有理想、敢担当、能吃苦、肯奋斗的新时代好青年", "立志做有理想、敢担当、能吃苦、肯奋斗的新时代好青年。", "青年", 2022, "对新时代青年提出的要求。", "适用于青年培养、教育等主题"},
	}

	materials := make([]*model.LearningMaterial, 0, len(quotes))
	for _, q := range quotes {
		m := &model.LearningMaterial{
			CategoryID:  categoryID,
			Type:        model.MaterialTypeQuote,
			SubType:     model.SubTypeXiQuote,
			Title:       q.Title,
			Content:     q.Content,
			Source:      "习近平总书记讲话",
			Author:      "习近平",
			Year:        &q.Year,
			Tags:        []string{"习近平讲话", q.Theme},
			ThemeTopics: []string{q.Theme},
			Analysis:    q.Analysis,
			Usage:       q.Usage,
			Subject:     "申论",
			IsFree:      true,
			Status:      status,
		}
		if status == model.MaterialStatusPublished {
			m.PublishedAt = &now
		}
		materials = append(materials, m)
	}
	return materials
}

// getAncientQuotes 获取古代名言警句
func (s *MaterialService) getAncientQuotes(categoryID uint, status model.MaterialStatus) []*model.LearningMaterial {
	now := time.Now()
	quotes := []struct {
		Title    string
		Content  string
		Source   string
		Author   string
		Theme    string
		Analysis string
		Usage    string
	}{
		{"天行健，君子以自强不息", "天行健，君子以自强不息；地势坤，君子以厚德载物。", "《周易》", "周文王", "奋斗精神", "强调君子应效法天地，自强不息、厚德载物。", "适用于奋斗精神、个人品德修养等主题"},
		{"穷则独善其身，达则兼济天下", "穷则独善其身，达则兼济天下。", "《孟子》", "孟子", "人生态度", "阐述不同境遇下的处世之道。", "适用于人生态度、社会责任等主题"},
		{"先天下之忧而忧，后天下之乐而乐", "先天下之忧而忧，后天下之乐而乐。", "《岳阳楼记》", "范仲淹", "家国情怀", "表达士大夫以天下为己任的崇高情怀。", "适用于家国情怀、责任担当等主题"},
		{"苟利国家生死以，岂因祸福避趋之", "苟利国家生死以，岂因祸福避趋之。", "林则徐诗", "林则徐", "爱国精神", "表达为国家利益不惜牺牲个人的爱国情怀。", "适用于爱国主义、担当精神等主题"},
		{"为天地立心，为生民立命，为往圣继绝学，为万世开太平", "为天地立心，为生民立命，为往圣继绝学，为万世开太平。", "张载语录", "张载", "使命担当", "概括了儒者的使命担当和宏大志向。", "适用于使命担当、理想信念等主题"},
		{"修身齐家治国平天下", "古之欲明明德于天下者，先治其国；欲治其国者，先齐其家；欲齐其家者，先修其身。", "《大学》", "曾参", "自我修养", "阐述个人修养与治国平天下的逻辑关系。", "适用于个人修养、干部素质等主题"},
		{"路漫漫其修远兮，吾将上下而求索", "路漫漫其修远兮，吾将上下而求索。", "《离骚》", "屈原", "求索精神", "表达不懈追求真理的精神。", "适用于探索精神、科学研究等主题"},
		{"不积跬步，无以至千里", "不积跬步，无以至千里；不积小流，无以成江海。", "《荀子》", "荀子", "积累", "强调积累的重要性。", "适用于学习积累、循序渐进等主题"},
		{"吾日三省吾身", "吾日三省吾身：为人谋而不忠乎？与朋友交而不信乎？传不习乎？", "《论语》", "曾子", "自我反省", "强调每日自我反省的重要性。", "适用于自我修养、作风建设等主题"},
		{"己所不欲，勿施于人", "己所不欲，勿施于人。", "《论语》", "孔子", "处世原则", "提出将心比心的道德准则。", "适用于道德修养、人际关系等主题"},
		{"知之者不如好之者，好之者不如乐之者", "知之者不如好之者，好之者不如乐之者。", "《论语》", "孔子", "学习态度", "阐述学习境界的三个层次。", "适用于学习态度、兴趣培养等主题"},
		{"纸上得来终觉浅，绝知此事要躬行", "纸上得来终觉浅，绝知此事要躬行。", "陆游诗", "陆游", "实践", "强调实践的重要性。", "适用于理论联系实际、实践出真知等主题"},
		{"千磨万击还坚劲，任尔东西南北风", "千磨万击还坚劲，任尔东西南北风。", "郑板桥诗", "郑板桥", "坚韧", "赞美竹子坚韧不拔的品格。", "适用于坚韧精神、意志品质等主题"},
		{"长风破浪会有时，直挂云帆济沧海", "长风破浪会有时，直挂云帆济沧海。", "李白诗", "李白", "志向", "表达乘风破浪、实现理想的信心。", "适用于理想信念、奋斗进取等主题"},
		{"落红不是无情物，化作春泥更护花", "落红不是无情物，化作春泥更护花。", "龚自珍诗", "龚自珍", "奉献", "表达无私奉献的精神。", "适用于奉献精神、服务人民等主题"},
		{"人生自古谁无死，留取丹心照汗青", "人生自古谁无死，留取丹心照汗青。", "文天祥诗", "文天祥", "爱国", "表达为国捐躯的英雄气概。", "适用于爱国主义、民族气节等主题"},
		{"横眉冷对千夫指，俯首甘为孺子牛", "横眉冷对千夫指，俯首甘为孺子牛。", "鲁迅诗", "鲁迅", "精神", "体现爱憎分明、为人民服务的精神。", "适用于为民服务、战斗精神等主题"},
		{"千里之行，始于足下", "千里之行，始于足下。", "《老子》", "老子", "行动", "强调脚踏实地、从小事做起。", "适用于脚踏实地、从基层做起等主题"},
		{"博学之，审问之，慎思之，明辨之，笃行之", "博学之，审问之，慎思之，明辨之，笃行之。", "《中庸》", "子思", "学习方法", "概括了学习的五个环节。", "适用于学习方法、治学态度等主题"},
		{"苟日新，日日新，又日新", "苟日新，日日新，又日新。", "《大学》", "", "创新", "强调不断自我更新、追求进步。", "适用于改革创新、自我提升等主题"},
	}

	materials := make([]*model.LearningMaterial, 0, len(quotes))
	for _, q := range quotes {
		m := &model.LearningMaterial{
			CategoryID:  categoryID,
			Type:        model.MaterialTypeQuote,
			SubType:     model.SubTypeAncientQuote,
			Title:       q.Title,
			Content:     q.Content,
			Source:      q.Source,
			Author:      q.Author,
			Tags:        []string{"古代名言", q.Theme},
			ThemeTopics: []string{q.Theme},
			Analysis:    q.Analysis,
			Usage:       q.Usage,
			Subject:     "申论",
			IsFree:      true,
			Status:      status,
		}
		if status == model.MaterialStatusPublished {
			m.PublishedAt = &now
		}
		materials = append(materials, m)
	}
	return materials
}

// getPositiveCases 获取正面典型案例
func (s *MaterialService) getPositiveCases(categoryID uint, status model.MaterialStatus) []*model.LearningMaterial {
	now := time.Now()
	cases := []struct {
		Title    string
		Content  string
		Source   string
		Theme    string
		CaseType string
		Analysis string
		Usage    string
	}{
		{"张桂梅：大山里的教育燃灯者", "张桂梅，云南华坪女子高级中学校长。她扎根贫困地区40余年，创办了全国第一所免费女子高中，帮助1800多名贫困女孩圆了大学梦。她身患多种疾病，却始终坚守在教育一线，被誉为大山里的教育燃灯者。2021年被授予全国脱贫攻坚楷模称号。", "感动中国人物", "教育", "人物事迹", "张桂梅的事迹体现了教育工作者的崇高师德和无私奉献精神，是新时代共产党员的优秀代表。", "适用于教育公平、脱贫攻坚、女性发展、党员先锋模范等主题"},
		{"黄文秀：扎根基层的青春之花", "黄文秀，广西百色市乐业县新化镇百坭村原第一书记。她北京师范大学研究生毕业后，放弃大城市工作机会，主动请缨到贫困村担任驻村第一书记。在扶贫一线，她带领群众发展产业，使贫困发生率从22.88%降至2.71%。2019年，她在返回驻村途中遭遇山洪不幸遇难，年仅30岁。", "时代楷模", "扶贫", "人物事迹", "黄文秀用生命诠释了共产党人的初心使命，是青年干部扎根基层、服务人民的榜样。", "适用于脱贫攻坚、青年担当、基层工作、初心使命等主题"},
		{"浙江千万工程：美丽乡村的中国样板", "浙江省千村示范、万村整治工程从2003年开始实施，20年来造就了万千美丽乡村。该工程从农村环境整治入手，由点及面、迭代升级，推动乡村实现人居环境、公共服务、产业发展、文化建设等全面提升，2018年荣获联合国最高环保荣誉地球卫士奖。", "地方经验", "乡村振兴", "地方经验", "千万工程体现了久久为功、循序渐进的工作方法，是两山理论的生动实践。", "适用于乡村振兴、农村环境整治、美丽乡村建设等主题"},
		{"塞罕坝：荒原变林海的绿色奇迹", "塞罕坝林场位于河北省最北部，曾经是黄沙遮天日、飞鸟无栖树的荒漠沙地。三代塞罕坝人坚持60多年造林，在荒漠上建成了世界最大的人工林场，森林覆盖率从11.4%提高到82%，创造了荒原变林海的人间奇迹，2017年被联合国授予地球卫士奖。", "生态建设典型", "生态文明", "地方经验", "塞罕坝精神体现了艰苦奋斗、久久为功的优良作风，是践行绿色发展理念的生动典范。", "适用于生态文明、绿色发展、艰苦奋斗、接续奋斗等主题"},
		{"华为：自主创新的中国力量", "华为技术有限公司成立于1987年，面对外部打压，坚持自主创新，每年将超过销售收入10%投入研发。在5G领域，华为累计获得超过11万件有效专利，5G技术全球领先。华为的发展历程证明，只有掌握核心技术才能不受制于人。", "企业发展", "科技创新", "企业案例", "华为案例展示了自主创新的重要性，是中国企业科技自立自强的典型代表。", "适用于科技创新、自主研发、企业发展、核心技术突破等主题"},
		{"北京冬奥会：简约、安全、精彩的盛会", "2022年北京冬奥会是新冠疫情发生以来首次如期举办的全球综合性体育盛会。中国以简约、安全、精彩的办赛理念，为世界奉献了一届精彩非凡的冰雪盛会，兑现了对国际社会的庄严承诺，展现了中国的制度优势和治理能力。", "重大活动", "综合", "活动案例", "北京冬奥会的成功举办充分彰显了中国特色社会主义制度优势和中国智慧。", "适用于制度优势、国际形象、疫情防控、办大事能力等主题"},
		{"深圳：改革开放的精彩缩影", "深圳经济特区从一个边陲小镇发展成为具有全球影响力的国际化大都市。40多年来，深圳GDP从1979年的1.97亿元增长到2023年的3.46万亿元，增长超过1.7万倍，创造了世界工业化、城市化、现代化发展史上的奇迹。", "改革开放", "改革创新", "地方经验", "深圳的发展奇迹是改革开放伟大成就的精彩缩影，证明了改革开放是决定当代中国命运的关键一招。", "适用于改革开放、创新发展、经济发展等主题"},
		{"袁隆平：杂交水稻之父", "袁隆平院士毕生致力于杂交水稻研究，发明三系法籼型杂交水稻，成功研究出两系法杂交水稻，创建了超级杂交稻技术体系。他的科研成果使中国杂交水稻技术一直保持世界领先水平，为我国粮食安全、农业科学发展和世界粮食供给作出了巨大贡献。", "科学家事迹", "科技创新", "人物事迹", "袁隆平的事迹体现了科学家精神，是中国科技工作者的杰出代表。", "适用于科学家精神、粮食安全、科技创新等主题"},
		{"枫桥经验：基层治理的中国智慧", "枫桥经验发端于20世纪60年代初浙江省诸暨市枫桥镇，坚持发动和依靠群众，就地解决矛盾纠纷，实现小事不出村、大事不出镇、矛盾不上交。新时代枫桥经验不断发展创新，成为基层社会治理的重要法宝。", "社会治理", "社会治理", "地方经验", "枫桥经验体现了党的群众路线，是基层社会治理现代化的中国方案。", "适用于基层治理、矛盾化解、群众工作等主题"},
		{"港珠澳大桥：超级工程的中国制造", "港珠澳大桥全长55公里，是世界最长的跨海大桥，集桥、岛、隧于一体。大桥建设历时9年，攻克了无数技术难关，创造了多项世界之最，被称为新世界七大奇迹之一，充分展示了中国桥梁建设的实力。", "重大工程", "科技创新", "工程案例", "港珠澳大桥的建成是中国制造、中国创造、中国建造的生动体现。", "适用于科技创新、工匠精神、超级工程等主题"},
	}

	materials := make([]*model.LearningMaterial, 0, len(cases))
	for _, c := range cases {
		m := &model.LearningMaterial{
			CategoryID:  categoryID,
			Type:        model.MaterialTypeCase,
			SubType:     model.SubTypePositiveCase,
			Title:       c.Title,
			Content:     c.Content,
			Source:      c.Source,
			Tags:        []string{"典型案例", c.CaseType, c.Theme},
			ThemeTopics: []string{c.Theme},
			Analysis:    c.Analysis,
			Usage:       c.Usage,
			Subject:     "申论",
			IsFree:      true,
			Status:      status,
		}
		if status == model.MaterialStatusPublished {
			m.PublishedAt = &now
		}
		materials = append(materials, m)
	}
	return materials
}

// getHotTopicMaterials 获取热点专题素材
func (s *MaterialService) getHotTopicMaterials(categoryID uint, status model.MaterialStatus) []*model.LearningMaterial {
	now := time.Now()
	topics := []struct {
		Title    string
		Content  string
		Theme    string
		Analysis string
		Usage    string
	}{
		{"新质生产力的内涵与发展路径", "新质生产力是创新起主导作用，摆脱传统经济增长方式、生产力发展路径，具有高科技、高效能、高质量特征，符合新发展理念的先进生产力质态。发展新质生产力，要深化科技体制改革、推进产业智能化绿色化融合化、培育壮大新兴产业和未来产业、推动传统产业转型升级。", "新质生产力", "深入理解新质生产力的科学内涵，把握高质量发展的关键要求。", "适用于经济发展、科技创新、产业升级等主题"},
		{"数字经济赋能高质量发展", "数字经济是以数据资源为关键要素，以现代信息网络为主要载体，以信息通信技术融合应用为重要推动力的新经济形态。我国数字经济规模已超50万亿元，占GDP比重超过40%。要加快数字基础设施建设，推进产业数字化和数字产业化，促进数字经济与实体经济深度融合。", "数字经济", "数字经济正成为推动经济高质量发展的新引擎。", "适用于数字化转型、高质量发展、新基建等主题"},
		{"乡村振兴与农业农村现代化", "全面推进乡村振兴是实现中华民族伟大复兴的一项重大任务。要坚持农业农村优先发展，加快建设农业强国，扎实推动乡村产业、人才、文化、生态、组织振兴，推进城乡融合发展，促进农民农村共同富裕。", "乡村振兴", "乡村振兴是新时代三农工作的总抓手，关系国家发展全局。", "适用于乡村振兴、三农问题、城乡融合等主题"},
		{"双碳目标与绿色低碳发展", "中国力争2030年前二氧化碳排放达到峰值、2060年前实现碳中和。实现双碳目标，要推动能源清洁低碳高效利用，加快发展风电、光伏等新能源，推进产业结构优化升级，倡导绿色生活方式。这是我国对国际社会的庄严承诺，也是推动高质量发展的内在要求。", "双碳目标", "双碳目标体现了中国负责任大国担当和推动绿色发展的坚定决心。", "适用于生态文明、绿色发展、能源转型等主题"},
		{"共同富裕的中国方案", "共同富裕是社会主义的本质要求，是中国式现代化的重要特征。要坚持在高质量发展中促进共同富裕，正确处理效率与公平的关系，构建初次分配、再分配、第三次分配协调配套的制度体系，形成中间大、两头小的橄榄型分配结构。", "共同富裕", "共同富裕是中国特色社会主义的本质要求，是全体人民的共同期盼。", "适用于共同富裕、民生保障、收入分配等主题"},
		{"基层治理现代化探索", "基层治理是国家治理的基石。要坚持党建引领基层治理，完善网格化管理、精细化服务、信息化支撑的基层治理平台，推动社会治理重心向基层下移，构建共建共治共享的社会治理格局，不断提升基层治理体系和治理能力现代化水平。", "基层治理", "基层治理现代化是国家治理体系和治理能力现代化的重要组成部分。", "适用于基层治理、社会治理、党建引领等主题"},
		{"人才强国战略与人才发展", "人才是实现民族振兴、赢得国际竞争主动的战略资源。要深入实施人才强国战略，培养造就大批德才兼备的高素质人才，聚天下英才而用之。要深化人才发展体制机制改革，营造尊重人才、求贤若渴的良好环境。", "人才发展", "人才是第一资源，创新驱动本质上是人才驱动。", "适用于人才战略、科教兴国、创新发展等主题"},
		{"健康中国建设与医疗改革", "健康中国建设是关系全民健康和国家发展的重大战略。要深化医药卫生体制改革，完善公共卫生体系，推进健康中国行动，促进优质医疗资源扩容下沉和区域均衡布局，让人民群众享有更高水平的卫生健康服务。", "健康中国", "人民健康是民族昌盛和国家富强的重要标志。", "适用于健康中国、医疗改革、公共卫生等主题"},
		{"教育强国与教育公平", "建设教育强国是中华民族伟大复兴的基础工程。要坚持教育优先发展，深化教育领域综合改革，加快义务教育优质均衡发展和城乡一体化，促进教育公平，提高教育质量，培养德智体美劳全面发展的社会主义建设者和接班人。", "教育强国", "教育是国之大计、党之大计，是民族振兴、社会进步的重要基石。", "适用于教育改革、教育公平、人才培养等主题"},
		{"文化自信与文化传承创新", "文化自信是更基础、更广泛、更深厚的自信。要坚定文化自信，推动中华优秀传统文化创造性转化、创新性发展，继承革命文化，发展社会主义先进文化，提升国家文化软实力和中华文化影响力。", "文化建设", "文化兴国运兴，文化强民族强。", "适用于文化自信、文化传承、软实力建设等主题"},
	}

	materials := make([]*model.LearningMaterial, 0, len(topics))
	for _, t := range topics {
		m := &model.LearningMaterial{
			CategoryID:  categoryID,
			Type:        model.MaterialTypeHotTopic,
			Title:       t.Title,
			Content:     t.Content,
			Tags:        []string{"热点专题", t.Theme},
			ThemeTopics: []string{t.Theme},
			Analysis:    t.Analysis,
			Usage:       t.Usage,
			Subject:     "申论",
			IsFree:      true,
			Status:      status,
		}
		if status == model.MaterialStatusPublished {
			m.PublishedAt = &now
		}
		materials = append(materials, m)
	}
	return materials
}

// getSentenceMaterials 获取优美语句素材
func (s *MaterialService) getSentenceMaterials(categoryID uint, status model.MaterialStatus) []*model.LearningMaterial {
	now := time.Now()
	sentences := []struct {
		Title    string
		Content  string
		SubType  model.MaterialSubType
		Analysis string
		Usage    string
	}{
		// 开头句式
		{"时代背景式开头", "当今时代，是一个大发展、大变革、大调整的时代。站在新的历史起点上，我们面临着前所未有的机遇与挑战。", model.SubTypeOpeningSentence, "从时代背景切入，展现宏观视野，适合作为文章开头。", "适用于各类社会话题的开篇"},
		{"引经据典式开头", "古人云：'不谋万世者，不足谋一时；不谋全局者，不足谋一域。'这句话深刻揭示了统筹兼顾、系统思维的重要性。", model.SubTypeOpeningSentence, "引用名言警句开篇，增强文章说服力和文化底蕴。", "适用于需要理论支撑的主题"},
		{"问题导入式开头", "当前，我国经济社会发展取得历史性成就的同时，也面临一些深层次矛盾和问题。如何破解这些难题，成为摆在我们面前的重要课题。", model.SubTypeOpeningSentence, "直面问题切入，引发读者思考，增强文章针对性。", "适用于问题分析类文章"},
		{"数据引入式开头", "据统计，截至2023年底，我国常住人口城镇化率已达到66.16%，比2012年提高了13.6个百分点。这组数据的背后，折射出我国城镇化进程的历史性跨越。", model.SubTypeOpeningSentence, "用数据说话，增强文章的客观性和说服力。", "适用于需要数据支撑的主题"},
		{"对比映衬式开头", "从'黄沙遮天日，飞鸟无栖树'的荒漠沙地，到'蓝天常驻、绿水长流'的美丽家园，这一沧桑巨变，见证了中国生态文明建设的伟大成就。", model.SubTypeOpeningSentence, "通过今昔对比，形成强烈反差，突出变化成就。", "适用于成就展示类主题"},

		// 过渡句式
		{"承上启下式过渡", "诚然，我们在取得显著成绩的同时，也要清醒地看到存在的问题和不足。只有正视问题，才能找准方向、精准施策。", model.SubTypeTransitionSentence, "承认成绩的同时引出问题，自然过渡，逻辑严密。", "适用于文章中间部分的转折过渡"},
		{"递进深化式过渡", "更为重要的是，我们不仅要解决眼前的问题，更要着眼长远，建立健全长效机制，从根本上解决制约发展的深层次矛盾。", model.SubTypeTransitionSentence, "层层递进，将论述引向深入。", "适用于深化论证时使用"},
		{"并列展开式过渡", "一方面，要加强顶层设计，完善制度体系；另一方面，要注重基层实践，推动落实见效。两者相辅相成、缺一不可。", model.SubTypeTransitionSentence, "从两个维度展开论述，结构清晰。", "适用于多角度分析问题"},
		{"因果关联式过渡", "正是基于这样的认识，我们必须采取更加有力有效的措施，推动各项工作取得新的更大成效。", model.SubTypeTransitionSentence, "通过因果关系自然过渡到对策部分。", "适用于从分析过渡到对策"},

		// 结尾句式
		{"展望未来式结尾", "展望未来，我们坚信：只要我们坚定信心、凝心聚力、真抓实干，就一定能够战胜前进道路上的一切艰难险阻，创造更加美好的明天。", model.SubTypeEndingSentence, "表达坚定信心和美好期望，收束有力，余韵悠长。", "适用于文章结尾的升华总结"},
		{"呼吁号召式结尾", "让我们携起手来，以更加坚定的信念、更加昂扬的斗志、更加务实的作风，为实现中华民族伟大复兴的中国梦而不懈奋斗！", model.SubTypeEndingSentence, "发出号召，激发读者共鸣，增强文章感染力。", "适用于需要动员性的文章结尾"},
		{"回扣主题式结尾", "实践证明，只有坚持走中国特色社会主义道路，才能发展中国、稳定中国、富强中国。这是历史的结论，也是未来的指引。", model.SubTypeEndingSentence, "回扣文章主题，首尾呼应，结构完整。", "适用于理论性较强的文章"},
		{"名言收束式结尾", "正如习近平总书记所说：'道虽迩，不行不至；事虽小，不为不成。'让我们从现在做起、从点滴做起，以实际行动书写新时代的壮丽篇章。", model.SubTypeEndingSentence, "引用名言收尾，增强说服力和权威性。", "适用于各类主题的文章结尾"},

		// 论证句式
		{"递进论证式", "这不仅关乎当前发展大局，更关乎长远战略全局；不仅是经济问题，更是政治问题；不仅影响当代，更影响子孙后代。", model.SubTypeArgumentSentence, "层层递进，强调问题的重要性和紧迫性。", "适用于论证问题重要性时"},
		{"对比论证式", "实践告诉我们：发展是解决一切问题的基础和关键，但发展必须是科学发展、高质量发展，而不是粗放式、竭泽而渔式的发展。", model.SubTypeArgumentSentence, "通过对比突出正确观点。", "适用于观点辨析类论证"},
		{"举例论证式", "事实胜于雄辩。从'两弹一星'到载人航天，从青藏铁路到港珠澳大桥，一个个奇迹的创造，无不印证了中国人民的伟大创造力。", model.SubTypeArgumentSentence, "用具体事例增强论证的说服力。", "适用于需要实例支撑的论证"},
		{"引用论证式", "习近平总书记深刻指出：'中国式现代化是走和平发展道路的现代化。'这一重要论述，深刻阐明了中国式现代化的鲜明特征。", model.SubTypeArgumentSentence, "引用权威论述增强论证的权威性。", "适用于政论文章的论证"},
		{"假设论证式", "试想，如果我们在关键核心技术上总是受制于人，那么经济安全、国防安全从何谈起？发展的自主权又如何能够牢牢掌握在自己手中？", model.SubTypeArgumentSentence, "通过假设引发思考，增强论证效果。", "适用于反面论证"},
	}

	materials := make([]*model.LearningMaterial, 0, len(sentences))
	for _, s := range sentences {
		m := &model.LearningMaterial{
			CategoryID: categoryID,
			Type:       model.MaterialTypeSentence,
			SubType:    s.SubType,
			Title:      s.Title,
			Content:    s.Content,
			Tags:       []string{"写作句式", string(s.SubType)},
			Analysis:   s.Analysis,
			Usage:      s.Usage,
			Subject:    "申论",
			IsFree:     true,
			Status:     status,
		}
		if status == model.MaterialStatusPublished {
			m.PublishedAt = &now
		}
		materials = append(materials, m)
	}
	return materials
}

// getInterviewMaterials 获取面试素材
func (s *MaterialService) getInterviewMaterials(categoryID uint, status model.MaterialStatus) []*model.LearningMaterial {
	now := time.Now()
	interviews := []struct {
		Title    string
		Content  string
		SubType  model.MaterialSubType
		Analysis string
		Usage    string
	}{
		// 开场金句
		{"表态发言开场", "作为一名即将步入公务员队伍的年轻人，我深感使命光荣、责任重大。我将以饱满的热情、务实的作风、扎实的工作，不负组织重托，不负人民期望。", model.SubTypeOpeningGold, "展现政治站位高、工作态度端正，适合作为自我介绍或表态发言的开场。", "适用于自我介绍、表态发言等场合"},
		{"岗位认知开场", "我深刻认识到，公务员不仅是一份职业，更是一份为人民服务的事业。选择这条路，就是选择了责任与担当，选择了奉献与付出。", model.SubTypeOpeningGold, "体现对公务员职业的深刻理解。", "适用于谈岗位认知、职业规划等场合"},

		// 综合分析题框架
		{"综合分析-辩证看待", "对于这个问题，我们要用辩证的眼光来看。一方面，我们要充分肯定其积极意义；另一方面，我们也要清醒地看到可能存在的问题和风险。只有全面客观地分析问题，才能提出切实可行的对策。", model.SubTypeComprehensive, "体现辩证思维能力，避免片面化、绝对化。", "适用于综合分析类题目"},
		{"综合分析-现象本质", "这一现象的出现，表面上看是......，实质上反映的是......的深层次问题。我们既要治标，更要治本，从根本上解决问题。", model.SubTypeComprehensive, "由表及里分析问题，体现分析深度。", "适用于社会现象分析题"},
		{"综合分析-多维分析", "分析这个问题，我认为可以从以下几个维度来把握：从历史维度看......；从现实维度看......；从发展维度看......", model.SubTypeComprehensive, "多角度分析问题，展现思维广度。", "适用于复杂问题的综合分析"},

		// 计划组织题框架
		{"计划组织-调研活动", "接到这项任务后，我会按照'事前充分准备、事中有序推进、事后总结反馈'的原则开展工作。第一，明确调研目的和重点......第二，制定详细方案......第三，组建调研团队......第四，实施调研......第五，撰写报告......", model.SubTypePlanning, "条理清晰，步骤完整，体现组织协调能力。", "适用于调研类计划组织题"},
		{"计划组织-活动策划", "对于这项活动，我会从'定目标、定方案、定人员、定时间、定预算'五个方面进行周密策划，确保活动取得预期效果。", model.SubTypePlanning, "五定法框架清晰，便于展开论述。", "适用于活动策划类题目"},

		// 应急应变题框架
		{"应急应变-处置原则", "面对突发情况，我会保持冷静，按照轻重缓急原则有序处置：首先，确保人员安全，稳定现场秩序；其次，及时向上级汇报，争取指导和支持；再次，迅速查明原因，采取针对性措施；最后，做好善后工作，总结经验教训。", model.SubTypeEmergency, "展现处置突发事件的能力和素质。", "适用于应急应变类题目"},
		{"应急应变-舆情应对", "面对舆情，我会坚持'快速反应、主动发声、客观真实、依法依规'的原则，及时回应群众关切，防止事态扩大。", model.SubTypeEmergency, "体现舆情应对的正确理念和方法。", "适用于舆情应对类题目"},

		// 人际关系题框架
		{"人际关系-处理原则", "对于人际关系问题，我会本着'工作为重、换位思考、求同存异、主动沟通'的原则来处理，既维护团结协作的工作氛围，又推动工作的顺利开展。", model.SubTypeInterpersonal, "体现正确的人际关系处理理念。", "适用于人际关系类题目"},
		{"人际关系-领导关系", "面对与领导的分歧，我会首先服从领导的决定，在执行过程中进一步观察、思考；如果确实发现问题，我会选择合适的时机、采取恰当的方式向领导汇报建议。", model.SubTypeInterpersonal, "体现服从意识和主动担当的平衡。", "适用于与领导关系的处理"},

		// 结尾金句
		{"奋斗担当结尾", "路虽远，行则将至；事虽难，做则必成。我将以实际行动践行初心使命，在平凡的岗位上书写不平凡的人生！", model.SubTypeClosingGold, "表达奋斗决心，收束有力。", "适用于各类面试题目的结尾"},
		{"服务人民结尾", "群众利益无小事，一枝一叶总关情。我将始终把人民群众的利益放在首位，做一名让党放心、让人民满意的公务员！", model.SubTypeClosingGold, "体现为民服务的宗旨意识。", "适用于民生相关题目的结尾"},
	}

	materials := make([]*model.LearningMaterial, 0, len(interviews))
	for _, i := range interviews {
		m := &model.LearningMaterial{
			CategoryID: categoryID,
			Type:       model.MaterialTypeInterview,
			SubType:    i.SubType,
			Title:      i.Title,
			Content:    i.Content,
			Tags:       []string{"面试素材", string(i.SubType)},
			Analysis:   i.Analysis,
			Usage:      i.Usage,
			Subject:    "面试",
			IsFree:     true,
			Status:     status,
		}
		if status == model.MaterialStatusPublished {
			m.PublishedAt = &now
		}
		materials = append(materials, m)
	}
	return materials
}
