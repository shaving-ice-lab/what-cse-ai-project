package service

import (
	"errors"
	"math"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

// =====================================================
// §25.3 知识点内容生成 Service
// =====================================================

var (
	ErrKnowledgeDetailNotFound = errors.New("knowledge detail not found")
	ErrFlashCardNotFound       = errors.New("flash card not found")
	ErrMindMapNotFound         = errors.New("mind map not found")
)

// KnowledgeDetailService 知识点详情服务
type KnowledgeDetailService struct {
	repo *repository.KnowledgeDetailRepository
}

func NewKnowledgeDetailService(repo *repository.KnowledgeDetailRepository) *KnowledgeDetailService {
	return &KnowledgeDetailService{repo: repo}
}

// CreateDetail 创建知识点详情
func (s *KnowledgeDetailService) CreateDetail(req *CreateKnowledgeDetailRequest) (*model.KnowledgeDetail, error) {
	detail := &model.KnowledgeDetail{
		KnowledgePointID: req.KnowledgePointID,
		ContentType:      req.ContentType,
		Title:            req.Title,
		Content:          req.Content,
		SortOrder:        req.SortOrder,
		IsActive:         true,
		Metadata:         req.Metadata,
	}
	if err := s.repo.Create(detail); err != nil {
		return nil, err
	}
	return detail, nil
}

// UpdateDetail 更新知识点详情
func (s *KnowledgeDetailService) UpdateDetail(id uint, req *UpdateKnowledgeDetailRequest) error {
	detail, err := s.repo.GetByID(id)
	if err != nil {
		return ErrKnowledgeDetailNotFound
	}

	if req.Title != nil {
		detail.Title = *req.Title
	}
	if req.Content != nil {
		detail.Content = *req.Content
	}
	if req.SortOrder != nil {
		detail.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		detail.IsActive = *req.IsActive
	}
	if req.Metadata != nil {
		detail.Metadata = req.Metadata
	}

	return s.repo.Update(detail)
}

// DeleteDetail 删除知识点详情
func (s *KnowledgeDetailService) DeleteDetail(id uint) error {
	return s.repo.Delete(id)
}

// GetDetail 获取知识点详情
func (s *KnowledgeDetailService) GetDetail(id uint) (*model.KnowledgeDetailResponse, error) {
	detail, err := s.repo.GetByID(id)
	if err != nil {
		return nil, ErrKnowledgeDetailNotFound
	}
	s.repo.IncrViewCount(id)
	return detail.ToResponse(), nil
}

// GetByKnowledgePoint 获取知识点的所有详情
func (s *KnowledgeDetailService) GetByKnowledgePoint(knowledgePointID uint) ([]*model.KnowledgeDetailResponse, error) {
	details, err := s.repo.GetByKnowledgePoint(knowledgePointID)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.KnowledgeDetailResponse, len(details))
	for i, d := range details {
		responses[i] = d.ToResponse()
	}
	return responses, nil
}

// GetByType 获取指定类型的详情
func (s *KnowledgeDetailService) GetByType(knowledgePointID uint, contentType model.KnowledgeDetailContentType) ([]*model.KnowledgeDetailResponse, error) {
	details, err := s.repo.GetByKnowledgePointAndType(knowledgePointID, contentType)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.KnowledgeDetailResponse, len(details))
	for i, d := range details {
		responses[i] = d.ToResponse()
	}
	return responses, nil
}

// ListDetails 列表查询
func (s *KnowledgeDetailService) ListDetails(params *repository.KnowledgeDetailQueryParams) ([]*model.KnowledgeDetailResponse, int64, error) {
	details, total, err := s.repo.List(params)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]*model.KnowledgeDetailResponse, len(details))
	for i, d := range details {
		responses[i] = d.ToResponse()
	}
	return responses, total, nil
}

// Request types
type CreateKnowledgeDetailRequest struct {
	KnowledgePointID uint                             `json:"knowledge_point_id" binding:"required"`
	ContentType      model.KnowledgeDetailContentType `json:"content_type" binding:"required"`
	Title            string                           `json:"title"`
	Content          string                           `json:"content" binding:"required"`
	SortOrder        int                              `json:"sort_order"`
	Metadata         map[string]interface{}           `json:"metadata,omitempty"`
}

type UpdateKnowledgeDetailRequest struct {
	Title     *string                `json:"title,omitempty"`
	Content   *string                `json:"content,omitempty"`
	SortOrder *int                   `json:"sort_order,omitempty"`
	IsActive  *bool                  `json:"is_active,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// =====================================================
// §25.3.2 速记卡片服务
// =====================================================

// FlashCardService 速记卡片服务
type FlashCardService struct {
	repo       *repository.FlashCardRepository
	recordRepo *repository.UserFlashCardRecordRepository
}

func NewFlashCardService(repo *repository.FlashCardRepository, recordRepo *repository.UserFlashCardRecordRepository) *FlashCardService {
	return &FlashCardService{repo: repo, recordRepo: recordRepo}
}

// CreateCard 创建卡片
func (s *FlashCardService) CreateCard(req *CreateFlashCardRequest) (*model.KnowledgeFlashCard, error) {
	card := &model.KnowledgeFlashCard{
		KnowledgePointID: req.KnowledgePointID,
		CategoryID:       req.CategoryID,
		CardType:         req.CardType,
		Title:            req.Title,
		FrontContent:     req.FrontContent,
		BackContent:      req.BackContent,
		Example:          req.Example,
		Mnemonic:         req.Mnemonic,
		Tags:             req.Tags,
		Difficulty:       req.Difficulty,
		Importance:       req.Importance,
		SortOrder:        req.SortOrder,
		IsActive:         true,
	}
	if card.Difficulty == 0 {
		card.Difficulty = 3
	}
	if card.Importance == 0 {
		card.Importance = 3
	}
	if err := s.repo.Create(card); err != nil {
		return nil, err
	}
	return card, nil
}

// BatchCreateCards 批量创建卡片
func (s *FlashCardService) BatchCreateCards(cards []*model.KnowledgeFlashCard) error {
	for _, card := range cards {
		if card.Difficulty == 0 {
			card.Difficulty = 3
		}
		if card.Importance == 0 {
			card.Importance = 3
		}
		card.IsActive = true
	}
	return s.repo.BatchCreate(cards)
}

// UpdateCard 更新卡片
func (s *FlashCardService) UpdateCard(id uint, req *UpdateFlashCardRequest) error {
	card, err := s.repo.GetByID(id)
	if err != nil {
		return ErrFlashCardNotFound
	}

	if req.Title != nil {
		card.Title = *req.Title
	}
	if req.FrontContent != nil {
		card.FrontContent = *req.FrontContent
	}
	if req.BackContent != nil {
		card.BackContent = *req.BackContent
	}
	if req.Example != nil {
		card.Example = *req.Example
	}
	if req.Mnemonic != nil {
		card.Mnemonic = *req.Mnemonic
	}
	if req.Tags != nil {
		card.Tags = req.Tags
	}
	if req.Difficulty != nil {
		card.Difficulty = *req.Difficulty
	}
	if req.Importance != nil {
		card.Importance = *req.Importance
	}
	if req.SortOrder != nil {
		card.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		card.IsActive = *req.IsActive
	}

	return s.repo.Update(card)
}

// DeleteCard 删除卡片
func (s *FlashCardService) DeleteCard(id uint) error {
	return s.repo.Delete(id)
}

// GetCard 获取卡片
func (s *FlashCardService) GetCard(id uint) (*model.KnowledgeFlashCardResponse, error) {
	card, err := s.repo.GetByID(id)
	if err != nil {
		return nil, ErrFlashCardNotFound
	}
	s.repo.IncrViewCount(id)
	return card.ToResponse(), nil
}

// ListCards 列表查询
func (s *FlashCardService) ListCards(params *repository.FlashCardQueryParams) ([]*model.KnowledgeFlashCardResponse, int64, error) {
	cards, total, err := s.repo.List(params)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]*model.KnowledgeFlashCardResponse, len(cards))
	for i, c := range cards {
		responses[i] = c.ToResponse()
	}
	return responses, total, nil
}

// GetByType 获取指定类型的卡片
func (s *FlashCardService) GetByType(cardType model.FlashCardType, limit int) ([]*model.KnowledgeFlashCardResponse, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	cards, err := s.repo.GetByType(cardType, limit)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.KnowledgeFlashCardResponse, len(cards))
	for i, c := range cards {
		responses[i] = c.ToResponse()
	}
	return responses, nil
}

// GetRandomCards 随机获取卡片
func (s *FlashCardService) GetRandomCards(cardType model.FlashCardType, count int) ([]*model.KnowledgeFlashCardResponse, error) {
	if count <= 0 || count > 50 {
		count = 10
	}
	cards, err := s.repo.GetRandomCards(cardType, count)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.KnowledgeFlashCardResponse, len(cards))
	for i, c := range cards {
		responses[i] = c.ToResponse()
	}
	return responses, nil
}

// GetTypeStats 获取类型统计
func (s *FlashCardService) GetTypeStats() ([]model.FlashCardTypeStats, error) {
	return s.repo.GetTypeStats()
}

// ReviewCard 复习卡片（间隔重复算法）
func (s *FlashCardService) ReviewCard(userID, cardID uint, quality int) error {
	// quality: 1-5, 1=完全忘记, 5=非常熟悉
	record, err := s.recordRepo.GetByUserAndCard(userID, cardID)
	if err != nil {
		// 新记录
		record = &model.UserFlashCardRecord{
			UserID:     userID,
			CardID:     cardID,
			Status:     model.UserFlashCardStatusLearning,
			EaseFactor: 2.5,
		}
	}

	record.ReviewCount++
	now := time.Now()
	record.LastReviewAt = &now

	if quality >= 3 {
		record.CorrectCount++
	} else {
		record.WrongCount++
	}

	// SM-2 算法计算下次复习时间
	if quality < 3 {
		// 忘记了，重新学习
		record.Interval = 1
		record.Status = model.UserFlashCardStatusLearning
	} else {
		// 记住了
		if record.Interval == 0 {
			record.Interval = 1
		} else if record.Interval == 1 {
			record.Interval = 6
		} else {
			record.Interval = int(float64(record.Interval) * record.EaseFactor)
		}

		// 更新难度系数
		record.EaseFactor = record.EaseFactor + (0.1 - float64(5-quality)*(0.08+float64(5-quality)*0.02))
		if record.EaseFactor < 1.3 {
			record.EaseFactor = 1.3
		}

		// 更新状态
		if record.CorrectCount >= 5 && float64(record.CorrectCount)/float64(record.ReviewCount) >= 0.8 {
			record.Status = model.UserFlashCardStatusMastered
			s.repo.IncrMasterCount(cardID)
		} else {
			record.Status = model.UserFlashCardStatusReview
		}
	}

	nextReview := now.AddDate(0, 0, record.Interval)
	record.NextReviewAt = &nextReview

	return s.recordRepo.Upsert(record)
}

// GetDueCards 获取需要复习的卡片
func (s *FlashCardService) GetDueCards(userID uint, limit int) ([]*model.UserFlashCardRecord, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	return s.recordRepo.GetDueCards(userID, limit)
}

// GetUserCardStats 获取用户学习统计
func (s *FlashCardService) GetUserCardStats(userID uint) (map[model.UserFlashCardStatus]int64, error) {
	return s.recordRepo.GetUserStats(userID)
}

// Request types
type CreateFlashCardRequest struct {
	KnowledgePointID *uint               `json:"knowledge_point_id,omitempty"`
	CategoryID       *uint               `json:"category_id,omitempty"`
	CardType         model.FlashCardType `json:"card_type" binding:"required"`
	Title            string              `json:"title" binding:"required"`
	FrontContent     string              `json:"front_content" binding:"required"`
	BackContent      string              `json:"back_content" binding:"required"`
	Example          string              `json:"example,omitempty"`
	Mnemonic         string              `json:"mnemonic,omitempty"`
	Tags             []string            `json:"tags,omitempty"`
	Difficulty       int                 `json:"difficulty,omitempty"`
	Importance       int                 `json:"importance,omitempty"`
	SortOrder        int                 `json:"sort_order,omitempty"`
}

type UpdateFlashCardRequest struct {
	Title        *string  `json:"title,omitempty"`
	FrontContent *string  `json:"front_content,omitempty"`
	BackContent  *string  `json:"back_content,omitempty"`
	Example      *string  `json:"example,omitempty"`
	Mnemonic     *string  `json:"mnemonic,omitempty"`
	Tags         []string `json:"tags,omitempty"`
	Difficulty   *int     `json:"difficulty,omitempty"`
	Importance   *int     `json:"importance,omitempty"`
	SortOrder    *int     `json:"sort_order,omitempty"`
	IsActive     *bool    `json:"is_active,omitempty"`
}

// =====================================================
// §25.3.3 思维导图服务
// =====================================================

// MindMapService 思维导图服务
type MindMapService struct {
	repo *repository.MindMapRepository
}

func NewMindMapService(repo *repository.MindMapRepository) *MindMapService {
	return &MindMapService{repo: repo}
}

// CreateMindMap 创建思维导图
func (s *MindMapService) CreateMindMap(userID uint, req *CreateMindMapRequest) (*model.KnowledgeMindMap, error) {
	mindMap := &model.KnowledgeMindMap{
		KnowledgePointID: req.KnowledgePointID,
		CategoryID:       req.CategoryID,
		MapType:          req.MapType,
		Title:            req.Title,
		Description:      req.Description,
		MapData:          req.MapData,
		ThumbnailURL:     req.ThumbnailURL,
		Tags:             req.Tags,
		IsActive:         true,
		IsPublic:         req.IsPublic,
		CreatedBy:        userID,
	}
	if err := s.repo.Create(mindMap); err != nil {
		return nil, err
	}
	return mindMap, nil
}

// UpdateMindMap 更新思维导图
func (s *MindMapService) UpdateMindMap(id uint, req *UpdateMindMapRequest) error {
	mindMap, err := s.repo.GetByID(id)
	if err != nil {
		return ErrMindMapNotFound
	}

	if req.Title != nil {
		mindMap.Title = *req.Title
	}
	if req.Description != nil {
		mindMap.Description = *req.Description
	}
	if req.MapData != nil {
		mindMap.MapData = *req.MapData
	}
	if req.ThumbnailURL != nil {
		mindMap.ThumbnailURL = *req.ThumbnailURL
	}
	if req.Tags != nil {
		mindMap.Tags = req.Tags
	}
	if req.IsActive != nil {
		mindMap.IsActive = *req.IsActive
	}
	if req.IsPublic != nil {
		mindMap.IsPublic = *req.IsPublic
	}

	return s.repo.Update(mindMap)
}

// DeleteMindMap 删除思维导图
func (s *MindMapService) DeleteMindMap(id uint) error {
	return s.repo.Delete(id)
}

// GetMindMap 获取思维导图
func (s *MindMapService) GetMindMap(id uint) (*model.KnowledgeMindMapResponse, error) {
	mindMap, err := s.repo.GetByID(id)
	if err != nil {
		return nil, ErrMindMapNotFound
	}
	s.repo.IncrViewCount(id)
	return mindMap.ToResponse(), nil
}

// ListMindMaps 列表查询
func (s *MindMapService) ListMindMaps(params *repository.MindMapQueryParams) ([]*model.KnowledgeMindMapResponse, int64, error) {
	mindMaps, total, err := s.repo.List(params)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]*model.KnowledgeMindMapResponse, len(mindMaps))
	for i, m := range mindMaps {
		responses[i] = m.ToResponse()
	}
	return responses, total, nil
}

// GetByKnowledgePoint 获取知识点的导图
func (s *MindMapService) GetByKnowledgePoint(knowledgePointID uint) ([]*model.KnowledgeMindMapResponse, error) {
	mindMaps, err := s.repo.GetByKnowledgePoint(knowledgePointID)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.KnowledgeMindMapResponse, len(mindMaps))
	for i, m := range mindMaps {
		responses[i] = m.ToResponse()
	}
	return responses, nil
}

// GetByCategory 获取分类的导图
func (s *MindMapService) GetByCategory(categoryID uint) ([]*model.KnowledgeMindMapResponse, error) {
	mindMaps, err := s.repo.GetByCategory(categoryID)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.KnowledgeMindMapResponse, len(mindMaps))
	for i, m := range mindMaps {
		responses[i] = m.ToResponse()
	}
	return responses, nil
}

// GetByType 获取指定类型的导图
func (s *MindMapService) GetByType(mapType model.MindMapType, limit int) ([]*model.KnowledgeMindMapResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	mindMaps, err := s.repo.GetByType(mapType, limit)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.KnowledgeMindMapResponse, len(mindMaps))
	for i, m := range mindMaps {
		responses[i] = m.ToResponse()
	}
	return responses, nil
}

// GetTypeStats 获取类型统计
func (s *MindMapService) GetTypeStats() ([]model.MindMapTypeStats, error) {
	return s.repo.GetTypeStats()
}

// DownloadMindMap 下载导图（增加下载次数）
func (s *MindMapService) DownloadMindMap(id uint) (*model.KnowledgeMindMapResponse, error) {
	mindMap, err := s.repo.GetByID(id)
	if err != nil {
		return nil, ErrMindMapNotFound
	}
	s.repo.IncrDownloadCount(id)
	return mindMap.ToResponse(), nil
}

// GenerateFromKnowledgePoint 从知识点生成思维导图数据
func (s *MindMapService) GenerateFromKnowledgePoint(knowledgePoint *model.KnowledgePoint) string {
	// 生成基础的思维导图数据结构
	root := &model.MindMapNode{
		ID:       "root",
		Text:     knowledgePoint.Name,
		Note:     knowledgePoint.Description,
		Expanded: true,
		Children: make([]*model.MindMapNode, 0),
	}

	// 如果有子知识点，添加为子节点
	for i, child := range knowledgePoint.Children {
		childNode := &model.MindMapNode{
			ID:       "node_" + string(rune('0'+i)),
			Text:     child.Name,
			Note:     child.Description,
			Expanded: false,
		}
		root.Children = append(root.Children, childNode)
	}

	// 返回JSON格式
	return `{"root":{"id":"root","text":"` + knowledgePoint.Name + `","expanded":true}}`
}

// Request types
type CreateMindMapRequest struct {
	KnowledgePointID *uint             `json:"knowledge_point_id,omitempty"`
	CategoryID       *uint             `json:"category_id,omitempty"`
	MapType          model.MindMapType `json:"map_type" binding:"required"`
	Title            string            `json:"title" binding:"required"`
	Description      string            `json:"description,omitempty"`
	MapData          string            `json:"map_data" binding:"required"`
	ThumbnailURL     string            `json:"thumbnail_url,omitempty"`
	Tags             []string          `json:"tags,omitempty"`
	IsPublic         bool              `json:"is_public"`
}

type UpdateMindMapRequest struct {
	Title        *string  `json:"title,omitempty"`
	Description  *string  `json:"description,omitempty"`
	MapData      *string  `json:"map_data,omitempty"`
	ThumbnailURL *string  `json:"thumbnail_url,omitempty"`
	Tags         []string `json:"tags,omitempty"`
	IsActive     *bool    `json:"is_active,omitempty"`
	IsPublic     *bool    `json:"is_public,omitempty"`
}

// =====================================================
// 综合服务
// =====================================================

// KnowledgeContentService 知识点内容综合服务
type KnowledgeContentService struct {
	detailService  *KnowledgeDetailService
	cardService    *FlashCardService
	mindMapService *MindMapService
	statsRepo      *repository.KnowledgeContentStatsRepository
}

func NewKnowledgeContentService(
	detailService *KnowledgeDetailService,
	cardService *FlashCardService,
	mindMapService *MindMapService,
	statsRepo *repository.KnowledgeContentStatsRepository,
) *KnowledgeContentService {
	return &KnowledgeContentService{
		detailService:  detailService,
		cardService:    cardService,
		mindMapService: mindMapService,
		statsRepo:      statsRepo,
	}
}

// GetStats 获取统计数据
func (s *KnowledgeContentService) GetStats() (*model.KnowledgeContentStats, error) {
	return s.statsRepo.GetStats()
}

// GetKnowledgePointFullContent 获取知识点的完整内容
func (s *KnowledgeContentService) GetKnowledgePointFullContent(knowledgePointID uint) (*KnowledgePointFullContent, error) {
	content := &KnowledgePointFullContent{
		KnowledgePointID: knowledgePointID,
	}

	// 获取详情
	details, err := s.detailService.GetByKnowledgePoint(knowledgePointID)
	if err == nil {
		content.Details = details
	}

	// 获取卡片（限制数量）
	cards, _, err := s.cardService.ListCards(&repository.FlashCardQueryParams{
		KnowledgePointID: knowledgePointID,
		PageSize:         10,
	})
	if err == nil {
		content.FlashCards = cards
	}

	// 获取导图
	mindMaps, err := s.mindMapService.GetByKnowledgePoint(knowledgePointID)
	if err == nil {
		content.MindMaps = mindMaps
	}

	return content, nil
}

// KnowledgePointFullContent 知识点完整内容
type KnowledgePointFullContent struct {
	KnowledgePointID uint                                `json:"knowledge_point_id"`
	Details          []*model.KnowledgeDetailResponse    `json:"details,omitempty"`
	FlashCards       []*model.KnowledgeFlashCardResponse `json:"flash_cards,omitempty"`
	MindMaps         []*model.KnowledgeMindMapResponse   `json:"mind_maps,omitempty"`
}

// 用于防止未使用的导入错误
var _ = math.Abs
