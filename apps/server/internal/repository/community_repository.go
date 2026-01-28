package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// =====================================================
// Post Repository
// =====================================================

type PostRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{db: db}
}

// PostQueryParams 帖子查询参数
type PostQueryParams struct {
	CategoryID uint     `query:"category_id"`
	UserID     uint     `query:"user_id"`
	Keyword    string   `query:"keyword"`
	Tags       []string `query:"tags"`
	Status     *int     `query:"status"`
	IsTop      *bool    `query:"is_top"`
	IsHot      *bool    `query:"is_hot"`
	IsEssence  *bool    `query:"is_essence"`
	OrderBy    string   `query:"order_by"` // latest, hot, views, likes
	Page       int      `query:"page"`
	PageSize   int      `query:"page_size"`
}

// Create creates a new post
func (r *PostRepository) Create(post *model.Post) error {
	return r.db.Create(post).Error
}

// Update updates a post
func (r *PostRepository) Update(post *model.Post) error {
	return r.db.Save(post).Error
}

// UpdateFields updates specific fields
func (r *PostRepository) UpdateFields(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).Updates(updates).Error
}

// Delete soft deletes a post
func (r *PostRepository) Delete(id uint) error {
	return r.db.Delete(&model.Post{}, id).Error
}

// GetByID gets a post by ID
func (r *PostRepository) GetByID(id uint) (*model.Post, error) {
	var post model.Post
	err := r.db.Preload("User").Preload("Category").First(&post, id).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

// GetList gets posts with filters and pagination
func (r *PostRepository) GetList(params *PostQueryParams) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	query := r.db.Model(&model.Post{})

	// Apply filters
	if params.CategoryID > 0 {
		query = query.Where("category_id = ?", params.CategoryID)
	}
	if params.UserID > 0 {
		query = query.Where("user_id = ?", params.UserID)
	}
	if params.Keyword != "" {
		keyword := "%" + params.Keyword + "%"
		query = query.Where("title LIKE ? OR content LIKE ?", keyword, keyword)
	}
	if params.Status != nil {
		query = query.Where("status = ?", *params.Status)
	} else {
		// Default: only published posts
		query = query.Where("status = ?", model.PostStatusPublished)
	}
	if params.IsTop != nil {
		query = query.Where("is_top = ?", *params.IsTop)
	}
	if params.IsHot != nil {
		query = query.Where("is_hot = ?", *params.IsHot)
	}
	if params.IsEssence != nil {
		query = query.Where("is_essence = ?", *params.IsEssence)
	}

	// Count total
	query.Count(&total)

	// Order by
	switch params.OrderBy {
	case "hot":
		query = query.Order("is_top DESC, is_hot DESC, like_count DESC, created_at DESC")
	case "views":
		query = query.Order("is_top DESC, view_count DESC, created_at DESC")
	case "likes":
		query = query.Order("is_top DESC, like_count DESC, created_at DESC")
	default: // latest
		query = query.Order("is_top DESC, created_at DESC")
	}

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Preload("User").Preload("Category").
		Offset(offset).
		Limit(params.PageSize).
		Find(&posts).Error

	return posts, total, err
}

// GetUserPosts gets all posts by a user
func (r *PostRepository) GetUserPosts(userID uint, page, pageSize int) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	query := r.db.Model(&model.Post{}).Where("user_id = ?", userID)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Order("created_at DESC").
		Preload("Category").
		Offset(offset).
		Limit(pageSize).
		Find(&posts).Error

	return posts, total, err
}

// IncrementViewCount increments the view count
func (r *PostRepository) IncrementViewCount(id uint) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

// IncrementLikeCount increments the like count
func (r *PostRepository) IncrementLikeCount(id uint) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).
		UpdateColumn("like_count", gorm.Expr("like_count + 1")).Error
}

// DecrementLikeCount decrements the like count
func (r *PostRepository) DecrementLikeCount(id uint) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).
		UpdateColumn("like_count", gorm.Expr("GREATEST(like_count - 1, 0)")).Error
}

// IncrementCommentCount increments the comment count
func (r *PostRepository) IncrementCommentCount(id uint) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).
		UpdateColumn("comment_count", gorm.Expr("comment_count + 1")).Error
}

// DecrementCommentCount decrements the comment count
func (r *PostRepository) DecrementCommentCount(id uint) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).
		UpdateColumn("comment_count", gorm.Expr("GREATEST(comment_count - 1, 0)")).Error
}

// =====================================================
// Comment Repository
// =====================================================

type CommentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

// Create creates a new comment
func (r *CommentRepository) Create(comment *model.Comment) error {
	return r.db.Create(comment).Error
}

// Delete soft deletes a comment
func (r *CommentRepository) Delete(id uint) error {
	return r.db.Delete(&model.Comment{}, id).Error
}

// GetByID gets a comment by ID
func (r *CommentRepository) GetByID(id uint) (*model.Comment, error) {
	var comment model.Comment
	err := r.db.Preload("User").First(&comment, id).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

// GetByPostID gets comments by post ID with pagination
func (r *CommentRepository) GetByPostID(postID uint, page, pageSize int) ([]model.Comment, int64, error) {
	var comments []model.Comment
	var total int64

	// Only get top-level comments (no parent)
	query := r.db.Model(&model.Comment{}).
		Where("post_id = ? AND parent_id IS NULL AND status = 1", postID)

	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Order("created_at DESC").
		Preload("User").
		Offset(offset).
		Limit(pageSize).
		Find(&comments).Error

	return comments, total, err
}

// GetReplies gets replies to a comment
func (r *CommentRepository) GetReplies(parentID uint, limit int) ([]model.Comment, error) {
	var replies []model.Comment

	if limit <= 0 {
		limit = 10
	}

	err := r.db.Where("parent_id = ? AND status = 1", parentID).
		Order("created_at ASC").
		Preload("User").
		Limit(limit).
		Find(&replies).Error

	return replies, err
}

// GetAllReplies gets all replies to a comment with pagination
func (r *CommentRepository) GetAllReplies(parentID uint, page, pageSize int) ([]model.Comment, int64, error) {
	var replies []model.Comment
	var total int64

	query := r.db.Model(&model.Comment{}).Where("parent_id = ? AND status = 1", parentID)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Order("created_at ASC").
		Preload("User").
		Offset(offset).
		Limit(pageSize).
		Find(&replies).Error

	return replies, total, err
}

// IncrementLikeCount increments the like count
func (r *CommentRepository) IncrementLikeCount(id uint) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", id).
		UpdateColumn("like_count", gorm.Expr("like_count + 1")).Error
}

// DecrementLikeCount decrements the like count
func (r *CommentRepository) DecrementLikeCount(id uint) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", id).
		UpdateColumn("like_count", gorm.Expr("GREATEST(like_count - 1, 0)")).Error
}

// IncrementReplyCount increments the reply count
func (r *CommentRepository) IncrementReplyCount(id uint) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", id).
		UpdateColumn("reply_count", gorm.Expr("reply_count + 1")).Error
}

// DecrementReplyCount decrements the reply count
func (r *CommentRepository) DecrementReplyCount(id uint) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", id).
		UpdateColumn("reply_count", gorm.Expr("GREATEST(reply_count - 1, 0)")).Error
}

// =====================================================
// Like Repository
// =====================================================

type LikeRepository struct {
	db *gorm.DB
}

func NewLikeRepository(db *gorm.DB) *LikeRepository {
	return &LikeRepository{db: db}
}

// AddLike adds a like
func (r *LikeRepository) AddLike(userID uint, likeType model.LikeType, targetID uint) error {
	like := &model.Like{
		UserID:   userID,
		LikeType: likeType,
		TargetID: targetID,
	}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "like_type"}, {Name: "target_id"}},
		DoNothing: true,
	}).Create(like).Error
}

// RemoveLike removes a like
func (r *LikeRepository) RemoveLike(userID uint, likeType model.LikeType, targetID uint) error {
	return r.db.Where("user_id = ? AND like_type = ? AND target_id = ?", userID, likeType, targetID).
		Delete(&model.Like{}).Error
}

// IsLiked checks if user has liked
func (r *LikeRepository) IsLiked(userID uint, likeType model.LikeType, targetID uint) bool {
	var count int64
	r.db.Model(&model.Like{}).
		Where("user_id = ? AND like_type = ? AND target_id = ?", userID, likeType, targetID).
		Count(&count)
	return count > 0
}

// BatchCheckLiked checks multiple targets
func (r *LikeRepository) BatchCheckLiked(userID uint, likeType model.LikeType, targetIDs []uint) (map[uint]bool, error) {
	var likes []model.Like
	err := r.db.Where("user_id = ? AND like_type = ? AND target_id IN ?", userID, likeType, targetIDs).
		Select("target_id").
		Find(&likes).Error
	if err != nil {
		return nil, err
	}

	result := make(map[uint]bool)
	for _, id := range targetIDs {
		result[id] = false
	}
	for _, l := range likes {
		result[l.TargetID] = true
	}
	return result, nil
}

// =====================================================
// Category Repository
// =====================================================

type PostCategoryRepository struct {
	db *gorm.DB
}

func NewPostCategoryRepository(db *gorm.DB) *PostCategoryRepository {
	return &PostCategoryRepository{db: db}
}

// GetAll gets all enabled categories
func (r *PostCategoryRepository) GetAll() ([]model.PostCategory, error) {
	var categories []model.PostCategory
	err := r.db.Where("is_enabled = ?", true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetByID gets a category by ID
func (r *PostCategoryRepository) GetByID(id uint) (*model.PostCategory, error) {
	var category model.PostCategory
	err := r.db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetByCode gets a category by code
func (r *PostCategoryRepository) GetByCode(code string) (*model.PostCategory, error) {
	var category model.PostCategory
	err := r.db.Where("code = ?", code).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// Create creates a new category
func (r *PostCategoryRepository) Create(category *model.PostCategory) error {
	return r.db.Create(category).Error
}

// Update updates a category
func (r *PostCategoryRepository) Update(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.PostCategory{}).Where("id = ?", id).Updates(updates).Error
}

// Delete soft deletes a category
func (r *PostCategoryRepository) Delete(id uint) error {
	return r.db.Delete(&model.PostCategory{}, id).Error
}

// IncrementPostCount increments post count
func (r *PostCategoryRepository) IncrementPostCount(id uint) error {
	return r.db.Model(&model.PostCategory{}).Where("id = ?", id).
		UpdateColumn("post_count", gorm.Expr("post_count + 1")).Error
}

// DecrementPostCount decrements post count
func (r *PostCategoryRepository) DecrementPostCount(id uint) error {
	return r.db.Model(&model.PostCategory{}).Where("id = ?", id).
		UpdateColumn("post_count", gorm.Expr("GREATEST(post_count - 1, 0)")).Error
}

// =====================================================
// Hot Topic Repository
// =====================================================

type HotTopicRepository struct {
	db *gorm.DB
}

func NewHotTopicRepository(db *gorm.DB) *HotTopicRepository {
	return &HotTopicRepository{db: db}
}

// GetHotTopics gets hot topics
func (r *HotTopicRepository) GetHotTopics(limit int) ([]model.HotTopic, error) {
	var topics []model.HotTopic
	if limit <= 0 {
		limit = 10
	}
	err := r.db.Where("is_enabled = ?", true).
		Order("is_hot DESC, post_count DESC, sort_order ASC").
		Limit(limit).
		Find(&topics).Error
	return topics, err
}

// GetAll gets all topics
func (r *HotTopicRepository) GetAll() ([]model.HotTopic, error) {
	var topics []model.HotTopic
	err := r.db.Where("is_enabled = ?", true).
		Order("sort_order ASC, post_count DESC").
		Find(&topics).Error
	return topics, err
}

// GetByID gets a topic by ID
func (r *HotTopicRepository) GetByID(id uint) (*model.HotTopic, error) {
	var topic model.HotTopic
	err := r.db.First(&topic, id).Error
	if err != nil {
		return nil, err
	}
	return &topic, nil
}

// Create creates a new topic
func (r *HotTopicRepository) Create(topic *model.HotTopic) error {
	return r.db.Create(topic).Error
}

// Update updates a topic
func (r *HotTopicRepository) Update(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.HotTopic{}).Where("id = ?", id).Updates(updates).Error
}

// Delete soft deletes a topic
func (r *HotTopicRepository) Delete(id uint) error {
	return r.db.Delete(&model.HotTopic{}, id).Error
}
