package service

import (
	"errors"
	"strings"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrPostNotFound        = errors.New("post not found")
	ErrPostAccessDenied    = errors.New("post access denied")
	ErrCommentNotFound     = errors.New("comment not found")
	ErrCommentAccessDenied = errors.New("comment access denied")
	ErrAlreadyLiked        = errors.New("already liked")
	ErrNotLiked            = errors.New("not liked")
	ErrCategoryNotFound    = errors.New("category not found")
)

// =====================================================
// Post Service
// =====================================================

type PostService struct {
	postRepo     *repository.PostRepository
	commentRepo  *repository.CommentRepository
	likeRepo     *repository.LikeRepository
	categoryRepo *repository.PostCategoryRepository
	userRepo     *repository.UserRepository
}

func NewPostService(
	postRepo *repository.PostRepository,
	commentRepo *repository.CommentRepository,
	likeRepo *repository.LikeRepository,
	categoryRepo *repository.PostCategoryRepository,
	userRepo *repository.UserRepository,
) *PostService {
	return &PostService{
		postRepo:     postRepo,
		commentRepo:  commentRepo,
		likeRepo:     likeRepo,
		categoryRepo: categoryRepo,
		userRepo:     userRepo,
	}
}

// CreatePostRequest 创建帖子请求
type CreatePostRequest struct {
	CategoryID uint     `json:"category_id"`
	Title      string   `json:"title" validate:"required,min=1,max=200"`
	Content    string   `json:"content" validate:"required"`
	Summary    string   `json:"summary"`
	CoverImage string   `json:"cover_image"`
	Tags       []string `json:"tags"`
}

// CreatePost creates a new post
func (s *PostService) CreatePost(userID uint, req *CreatePostRequest) (*model.Post, error) {
	// Generate summary if not provided
	summary := req.Summary
	if summary == "" && len(req.Content) > 0 {
		// Take first 200 characters as summary
		runes := []rune(req.Content)
		if len(runes) > 200 {
			summary = string(runes[:200]) + "..."
		} else {
			summary = req.Content
		}
		// Remove HTML tags from summary
		summary = stripHTMLTags(summary)
	}

	now := time.Now()
	post := &model.Post{
		UserID:      userID,
		CategoryID:  req.CategoryID,
		Title:       req.Title,
		Content:     req.Content,
		Summary:     summary,
		CoverImage:  req.CoverImage,
		Tags:        req.Tags,
		Status:      model.PostStatusPublished,
		PublishedAt: &now,
	}

	if err := s.postRepo.Create(post); err != nil {
		return nil, err
	}

	// Increment category post count
	if req.CategoryID > 0 {
		s.categoryRepo.IncrementPostCount(req.CategoryID)
	}

	return post, nil
}

// UpdatePostRequest 更新帖子请求
type UpdatePostRequest struct {
	CategoryID uint     `json:"category_id"`
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	Summary    string   `json:"summary"`
	CoverImage string   `json:"cover_image"`
	Tags       []string `json:"tags"`
}

// UpdatePost updates a post
func (s *PostService) UpdatePost(userID, postID uint, req *UpdatePostRequest) error {
	post, err := s.postRepo.GetByID(postID)
	if err != nil {
		return ErrPostNotFound
	}

	if post.UserID != userID {
		return ErrPostAccessDenied
	}

	// Update category post count if changed
	if req.CategoryID > 0 && req.CategoryID != post.CategoryID {
		if post.CategoryID > 0 {
			s.categoryRepo.DecrementPostCount(post.CategoryID)
		}
		s.categoryRepo.IncrementPostCount(req.CategoryID)
		post.CategoryID = req.CategoryID
	}

	if req.Title != "" {
		post.Title = req.Title
	}
	if req.Content != "" {
		post.Content = req.Content
		// Update summary
		if req.Summary != "" {
			post.Summary = req.Summary
		} else {
			runes := []rune(req.Content)
			if len(runes) > 200 {
				post.Summary = string(runes[:200]) + "..."
			} else {
				post.Summary = req.Content
			}
			post.Summary = stripHTMLTags(post.Summary)
		}
	}
	if req.CoverImage != "" {
		post.CoverImage = req.CoverImage
	}
	if len(req.Tags) > 0 {
		post.Tags = req.Tags
	}

	return s.postRepo.Update(post)
}

// DeletePost deletes a post
func (s *PostService) DeletePost(userID, postID uint) error {
	post, err := s.postRepo.GetByID(postID)
	if err != nil {
		return ErrPostNotFound
	}

	if post.UserID != userID {
		return ErrPostAccessDenied
	}

	// Decrement category post count
	if post.CategoryID > 0 {
		s.categoryRepo.DecrementPostCount(post.CategoryID)
	}

	return s.postRepo.Delete(postID)
}

// GetPost gets a post by ID
func (s *PostService) GetPost(postID uint, userID uint) (*model.PostDetailResponse, error) {
	post, err := s.postRepo.GetByID(postID)
	if err != nil {
		return nil, ErrPostNotFound
	}

	// Check if published or owner
	if post.Status != model.PostStatusPublished && post.UserID != userID {
		return nil, ErrPostNotFound
	}

	// Increment view count
	s.postRepo.IncrementViewCount(postID)

	// Check if user liked
	isLiked := false
	if userID > 0 {
		isLiked = s.likeRepo.IsLiked(userID, model.LikeTypePost, postID)
	}

	return post.ToDetailResponse(isLiked), nil
}

// PostListResponse 帖子列表响应
type PostListResponse struct {
	Posts    []*model.PostBriefResponse `json:"posts"`
	Total    int64                      `json:"total"`
	Page     int                        `json:"page"`
	PageSize int                        `json:"page_size"`
}

// GetPosts gets posts with filters
func (s *PostService) GetPosts(params *repository.PostQueryParams, userID uint) (*PostListResponse, error) {
	posts, total, err := s.postRepo.GetList(params)
	if err != nil {
		return nil, err
	}

	// Convert to brief responses
	briefPosts := make([]*model.PostBriefResponse, len(posts))
	for i, p := range posts {
		briefPosts[i] = p.ToBriefResponse()
	}

	return &PostListResponse{
		Posts:    briefPosts,
		Total:    total,
		Page:     params.Page,
		PageSize: params.PageSize,
	}, nil
}

// GetUserPosts gets all posts by a user
func (s *PostService) GetUserPosts(userID uint, page, pageSize int) (*PostListResponse, error) {
	posts, total, err := s.postRepo.GetUserPosts(userID, page, pageSize)
	if err != nil {
		return nil, err
	}

	briefPosts := make([]*model.PostBriefResponse, len(posts))
	for i, p := range posts {
		briefPosts[i] = p.ToBriefResponse()
	}

	return &PostListResponse{
		Posts:    briefPosts,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// LikePost likes a post
func (s *PostService) LikePost(userID, postID uint) error {
	// Check if post exists
	_, err := s.postRepo.GetByID(postID)
	if err != nil {
		return ErrPostNotFound
	}

	// Check if already liked
	if s.likeRepo.IsLiked(userID, model.LikeTypePost, postID) {
		return ErrAlreadyLiked
	}

	// Add like
	if err := s.likeRepo.AddLike(userID, model.LikeTypePost, postID); err != nil {
		return err
	}

	// Increment like count
	return s.postRepo.IncrementLikeCount(postID)
}

// UnlikePost unlikes a post
func (s *PostService) UnlikePost(userID, postID uint) error {
	// Check if liked
	if !s.likeRepo.IsLiked(userID, model.LikeTypePost, postID) {
		return ErrNotLiked
	}

	// Remove like
	if err := s.likeRepo.RemoveLike(userID, model.LikeTypePost, postID); err != nil {
		return err
	}

	// Decrement like count
	return s.postRepo.DecrementLikeCount(postID)
}

// =====================================================
// Comment Service
// =====================================================

type CommentService struct {
	commentRepo *repository.CommentRepository
	postRepo    *repository.PostRepository
	likeRepo    *repository.LikeRepository
	userRepo    *repository.UserRepository
}

func NewCommentService(
	commentRepo *repository.CommentRepository,
	postRepo *repository.PostRepository,
	likeRepo *repository.LikeRepository,
	userRepo *repository.UserRepository,
) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
		postRepo:    postRepo,
		likeRepo:    likeRepo,
		userRepo:    userRepo,
	}
}

// CreateCommentRequest 创建评论请求
type CreateCommentRequest struct {
	PostID   uint   `json:"post_id" validate:"required"`
	ParentID *uint  `json:"parent_id"`
	ReplyTo  *uint  `json:"reply_to"`
	Content  string `json:"content" validate:"required"`
}

// CreateComment creates a new comment
func (s *CommentService) CreateComment(userID uint, req *CreateCommentRequest) (*model.Comment, error) {
	// Check if post exists
	_, err := s.postRepo.GetByID(req.PostID)
	if err != nil {
		return nil, ErrPostNotFound
	}

	// If reply, check parent comment exists
	if req.ParentID != nil {
		parentComment, err := s.commentRepo.GetByID(*req.ParentID)
		if err != nil {
			return nil, ErrCommentNotFound
		}
		// Increment parent's reply count
		s.commentRepo.IncrementReplyCount(parentComment.ID)
	}

	comment := &model.Comment{
		PostID:   req.PostID,
		UserID:   userID,
		ParentID: req.ParentID,
		ReplyTo:  req.ReplyTo,
		Content:  req.Content,
		Status:   1,
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return nil, err
	}

	// Increment post comment count
	s.postRepo.IncrementCommentCount(req.PostID)

	// Load user info
	comment, _ = s.commentRepo.GetByID(comment.ID)
	return comment, nil
}

// DeleteComment deletes a comment
func (s *CommentService) DeleteComment(userID, commentID uint) error {
	comment, err := s.commentRepo.GetByID(commentID)
	if err != nil {
		return ErrCommentNotFound
	}

	if comment.UserID != userID {
		return ErrCommentAccessDenied
	}

	// Decrement parent's reply count if it's a reply
	if comment.ParentID != nil {
		s.commentRepo.DecrementReplyCount(*comment.ParentID)
	}

	// Decrement post comment count
	s.postRepo.DecrementCommentCount(comment.PostID)

	return s.commentRepo.Delete(commentID)
}

// CommentListResponse 评论列表响应
type CommentListResponse struct {
	Comments []*model.CommentResponse `json:"comments"`
	Total    int64                    `json:"total"`
	Page     int                      `json:"page"`
	PageSize int                      `json:"page_size"`
}

// GetComments gets comments for a post
func (s *CommentService) GetComments(postID uint, page, pageSize int, userID uint) (*CommentListResponse, error) {
	comments, total, err := s.commentRepo.GetByPostID(postID, page, pageSize)
	if err != nil {
		return nil, err
	}

	// Collect comment IDs for like check
	commentIDs := make([]uint, len(comments))
	for i, c := range comments {
		commentIDs[i] = c.ID
	}

	// Check which comments are liked
	likedMap := make(map[uint]bool)
	if userID > 0 && len(commentIDs) > 0 {
		likedMap, _ = s.likeRepo.BatchCheckLiked(userID, model.LikeTypeComment, commentIDs)
	}

	// Convert to responses with replies
	responses := make([]*model.CommentResponse, len(comments))
	for i, c := range comments {
		resp := c.ToResponse(likedMap[c.ID])

		// Load first few replies
		if c.ReplyCount > 0 {
			replies, _ := s.commentRepo.GetReplies(c.ID, 3)
			replyResponses := make([]*model.CommentResponse, len(replies))
			for j, r := range replies {
				isLiked := false
				if userID > 0 {
					isLiked = s.likeRepo.IsLiked(userID, model.LikeTypeComment, r.ID)
				}
				replyResponses[j] = r.ToResponse(isLiked)
			}
			resp.Replies = replyResponses
		}

		responses[i] = resp
	}

	return &CommentListResponse{
		Comments: responses,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// GetReplies gets all replies to a comment
func (s *CommentService) GetReplies(commentID uint, page, pageSize int, userID uint) (*CommentListResponse, error) {
	replies, total, err := s.commentRepo.GetAllReplies(commentID, page, pageSize)
	if err != nil {
		return nil, err
	}

	// Check which replies are liked
	replyIDs := make([]uint, len(replies))
	for i, r := range replies {
		replyIDs[i] = r.ID
	}

	likedMap := make(map[uint]bool)
	if userID > 0 && len(replyIDs) > 0 {
		likedMap, _ = s.likeRepo.BatchCheckLiked(userID, model.LikeTypeComment, replyIDs)
	}

	responses := make([]*model.CommentResponse, len(replies))
	for i, r := range replies {
		responses[i] = r.ToResponse(likedMap[r.ID])
	}

	return &CommentListResponse{
		Comments: responses,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// LikeComment likes a comment
func (s *CommentService) LikeComment(userID, commentID uint) error {
	// Check if comment exists
	_, err := s.commentRepo.GetByID(commentID)
	if err != nil {
		return ErrCommentNotFound
	}

	// Check if already liked
	if s.likeRepo.IsLiked(userID, model.LikeTypeComment, commentID) {
		return ErrAlreadyLiked
	}

	// Add like
	if err := s.likeRepo.AddLike(userID, model.LikeTypeComment, commentID); err != nil {
		return err
	}

	// Increment like count
	return s.commentRepo.IncrementLikeCount(commentID)
}

// UnlikeComment unlikes a comment
func (s *CommentService) UnlikeComment(userID, commentID uint) error {
	// Check if liked
	if !s.likeRepo.IsLiked(userID, model.LikeTypeComment, commentID) {
		return ErrNotLiked
	}

	// Remove like
	if err := s.likeRepo.RemoveLike(userID, model.LikeTypeComment, commentID); err != nil {
		return err
	}

	// Decrement like count
	return s.commentRepo.DecrementLikeCount(commentID)
}

// =====================================================
// Category Service
// =====================================================

type CategoryService struct {
	categoryRepo *repository.PostCategoryRepository
}

func NewCategoryService(categoryRepo *repository.PostCategoryRepository) *CategoryService {
	return &CategoryService{categoryRepo: categoryRepo}
}

// GetCategories gets all categories
func (s *CategoryService) GetCategories() ([]model.PostCategory, error) {
	return s.categoryRepo.GetAll()
}

// GetCategory gets a category by ID
func (s *CategoryService) GetCategory(id uint) (*model.PostCategory, error) {
	return s.categoryRepo.GetByID(id)
}

// CreateCategoryRequest 创建分类请求
type CreateCategoryRequest struct {
	Name        string `json:"name" validate:"required"`
	Code        string `json:"code" validate:"required"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	SortOrder   int    `json:"sort_order"`
}

// CreateCategory creates a new category
func (s *CategoryService) CreateCategory(req *CreateCategoryRequest) (*model.PostCategory, error) {
	category := &model.PostCategory{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Icon:        req.Icon,
		Color:       req.Color,
		SortOrder:   req.SortOrder,
		IsEnabled:   true,
	}

	if category.Color == "" {
		category.Color = "#6366f1"
	}

	if err := s.categoryRepo.Create(category); err != nil {
		return nil, err
	}

	return category, nil
}

// UpdateCategoryRequest 更新分类请求
type UpdateCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	SortOrder   *int   `json:"sort_order"`
	IsEnabled   *bool  `json:"is_enabled"`
}

// UpdateCategory updates a category
func (s *CategoryService) UpdateCategory(id uint, req *UpdateCategoryRequest) error {
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Icon != "" {
		updates["icon"] = req.Icon
	}
	if req.Color != "" {
		updates["color"] = req.Color
	}
	if req.SortOrder != nil {
		updates["sort_order"] = *req.SortOrder
	}
	if req.IsEnabled != nil {
		updates["is_enabled"] = *req.IsEnabled
	}

	if len(updates) == 0 {
		return nil
	}

	return s.categoryRepo.Update(id, updates)
}

// DeleteCategory deletes a category
func (s *CategoryService) DeleteCategory(id uint) error {
	return s.categoryRepo.Delete(id)
}

// =====================================================
// Hot Topic Service
// =====================================================

type HotTopicService struct {
	topicRepo *repository.HotTopicRepository
}

func NewHotTopicService(topicRepo *repository.HotTopicRepository) *HotTopicService {
	return &HotTopicService{topicRepo: topicRepo}
}

// GetHotTopics gets hot topics
func (s *HotTopicService) GetHotTopics(limit int) ([]model.HotTopic, error) {
	return s.topicRepo.GetHotTopics(limit)
}

// GetAllTopics gets all topics
func (s *HotTopicService) GetAllTopics() ([]model.HotTopic, error) {
	return s.topicRepo.GetAll()
}

// Helper function to strip HTML tags
func stripHTMLTags(s string) string {
	var result strings.Builder
	inTag := false
	for _, r := range s {
		if r == '<' {
			inTag = true
		} else if r == '>' {
			inTag = false
		} else if !inTag {
			result.WriteRune(r)
		}
	}
	return result.String()
}
