package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

// =====================================================
// Post Handler
// =====================================================

type CommunityHandler struct {
	postService     *service.PostService
	commentService  *service.CommentService
	categoryService *service.CategoryService
	topicService    *service.HotTopicService
}

func NewCommunityHandler(
	postService *service.PostService,
	commentService *service.CommentService,
	categoryService *service.CategoryService,
	topicService *service.HotTopicService,
) *CommunityHandler {
	return &CommunityHandler{
		postService:     postService,
		commentService:  commentService,
		categoryService: categoryService,
		topicService:    topicService,
	}
}

// =====================================================
// Post APIs
// =====================================================

// CreatePost creates a new post
// @Summary Create Post
// @Description Create a new post
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreatePostRequest true "Post details"
// @Success 200 {object} Response
// @Router /api/v1/community/posts [post]
func (h *CommunityHandler) CreatePost(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.CreatePostRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.Title == "" || req.Content == "" {
		return fail(c, 400, "Title and content are required")
	}

	post, err := h.postService.CreatePost(userID, &req)
	if err != nil {
		return fail(c, 500, "Failed to create post: "+err.Error())
	}

	return success(c, post)
}

// UpdatePost updates a post
// @Summary Update Post
// @Description Update an existing post
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Post ID"
// @Param request body service.UpdatePostRequest true "Post details"
// @Success 200 {object} Response
// @Router /api/v1/community/posts/{id} [put]
func (h *CommunityHandler) UpdatePost(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid post ID")
	}

	var req service.UpdatePostRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.postService.UpdatePost(userID, uint(postID), &req); err != nil {
		if err == service.ErrPostNotFound {
			return fail(c, 404, "Post not found")
		}
		if err == service.ErrPostAccessDenied {
			return fail(c, 403, "Access denied")
		}
		return fail(c, 500, "Failed to update post: "+err.Error())
	}

	return success(c, map[string]string{"message": "Post updated"})
}

// DeletePost deletes a post
// @Summary Delete Post
// @Description Delete a post
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Post ID"
// @Success 200 {object} Response
// @Router /api/v1/community/posts/{id} [delete]
func (h *CommunityHandler) DeletePost(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid post ID")
	}

	if err := h.postService.DeletePost(userID, uint(postID)); err != nil {
		if err == service.ErrPostNotFound {
			return fail(c, 404, "Post not found")
		}
		if err == service.ErrPostAccessDenied {
			return fail(c, 403, "Access denied")
		}
		return fail(c, 500, "Failed to delete post: "+err.Error())
	}

	return success(c, map[string]string{"message": "Post deleted"})
}

// GetPost gets a post by ID
// @Summary Get Post
// @Description Get a post by ID
// @Tags Community
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} Response
// @Router /api/v1/community/posts/{id} [get]
func (h *CommunityHandler) GetPost(c echo.Context) error {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid post ID")
	}

	userID := getUserIDFromContext(c)

	post, err := h.postService.GetPost(uint(postID), userID)
	if err != nil {
		if err == service.ErrPostNotFound {
			return fail(c, 404, "Post not found")
		}
		return fail(c, 500, "Failed to get post: "+err.Error())
	}

	return success(c, post)
}

// GetPosts gets posts with filters
// @Summary Get Posts
// @Description Get posts with filters and pagination
// @Tags Community
// @Accept json
// @Produce json
// @Param category_id query int false "Category ID"
// @Param keyword query string false "Search keyword"
// @Param order_by query string false "Order by (latest, hot, views, likes)"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/community/posts [get]
func (h *CommunityHandler) GetPosts(c echo.Context) error {
	params := &repository.PostQueryParams{}
	if err := c.Bind(params); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}

	userID := getUserIDFromContext(c)

	result, err := h.postService.GetPosts(params, userID)
	if err != nil {
		return fail(c, 500, "Failed to get posts: "+err.Error())
	}

	return success(c, result)
}

// GetUserPosts gets posts by user
// @Summary Get User Posts
// @Description Get all posts by a user
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/community/posts/my [get]
func (h *CommunityHandler) GetUserPosts(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	result, err := h.postService.GetUserPosts(userID, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to get posts: "+err.Error())
	}

	return success(c, result)
}

// LikePost likes a post
// @Summary Like Post
// @Description Like a post
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Post ID"
// @Success 200 {object} Response
// @Router /api/v1/community/posts/{id}/like [post]
func (h *CommunityHandler) LikePost(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid post ID")
	}

	if err := h.postService.LikePost(userID, uint(postID)); err != nil {
		if err == service.ErrPostNotFound {
			return fail(c, 404, "Post not found")
		}
		if err == service.ErrAlreadyLiked {
			return fail(c, 409, "Already liked")
		}
		return fail(c, 500, "Failed to like post: "+err.Error())
	}

	return success(c, map[string]string{"message": "Liked"})
}

// UnlikePost unlikes a post
// @Summary Unlike Post
// @Description Unlike a post
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Post ID"
// @Success 200 {object} Response
// @Router /api/v1/community/posts/{id}/like [delete]
func (h *CommunityHandler) UnlikePost(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid post ID")
	}

	if err := h.postService.UnlikePost(userID, uint(postID)); err != nil {
		if err == service.ErrNotLiked {
			return fail(c, 400, "Not liked")
		}
		return fail(c, 500, "Failed to unlike post: "+err.Error())
	}

	return success(c, map[string]string{"message": "Unliked"})
}

// =====================================================
// Comment APIs
// =====================================================

// CreateComment creates a new comment
// @Summary Create Comment
// @Description Create a new comment
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreateCommentRequest true "Comment details"
// @Success 200 {object} Response
// @Router /api/v1/community/comments [post]
func (h *CommunityHandler) CreateComment(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.CreateCommentRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.PostID == 0 || req.Content == "" {
		return fail(c, 400, "Post ID and content are required")
	}

	comment, err := h.commentService.CreateComment(userID, &req)
	if err != nil {
		if err == service.ErrPostNotFound {
			return fail(c, 404, "Post not found")
		}
		if err == service.ErrCommentNotFound {
			return fail(c, 404, "Parent comment not found")
		}
		return fail(c, 500, "Failed to create comment: "+err.Error())
	}

	return success(c, comment.ToResponse(false))
}

// DeleteComment deletes a comment
// @Summary Delete Comment
// @Description Delete a comment
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Comment ID"
// @Success 200 {object} Response
// @Router /api/v1/community/comments/{id} [delete]
func (h *CommunityHandler) DeleteComment(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	commentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid comment ID")
	}

	if err := h.commentService.DeleteComment(userID, uint(commentID)); err != nil {
		if err == service.ErrCommentNotFound {
			return fail(c, 404, "Comment not found")
		}
		if err == service.ErrCommentAccessDenied {
			return fail(c, 403, "Access denied")
		}
		return fail(c, 500, "Failed to delete comment: "+err.Error())
	}

	return success(c, map[string]string{"message": "Comment deleted"})
}

// GetComments gets comments for a post
// @Summary Get Comments
// @Description Get comments for a post with pagination
// @Tags Community
// @Accept json
// @Produce json
// @Param post_id path int true "Post ID"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/community/posts/{post_id}/comments [get]
func (h *CommunityHandler) GetComments(c echo.Context) error {
	postID, err := strconv.ParseUint(c.Param("post_id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid post ID")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	userID := getUserIDFromContext(c)

	result, err := h.commentService.GetComments(uint(postID), page, pageSize, userID)
	if err != nil {
		return fail(c, 500, "Failed to get comments: "+err.Error())
	}

	return success(c, result)
}

// GetReplies gets replies to a comment
// @Summary Get Replies
// @Description Get replies to a comment with pagination
// @Tags Community
// @Accept json
// @Produce json
// @Param id path int true "Comment ID"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/community/comments/{id}/replies [get]
func (h *CommunityHandler) GetReplies(c echo.Context) error {
	commentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid comment ID")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	userID := getUserIDFromContext(c)

	result, err := h.commentService.GetReplies(uint(commentID), page, pageSize, userID)
	if err != nil {
		return fail(c, 500, "Failed to get replies: "+err.Error())
	}

	return success(c, result)
}

// LikeComment likes a comment
// @Summary Like Comment
// @Description Like a comment
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Comment ID"
// @Success 200 {object} Response
// @Router /api/v1/community/comments/{id}/like [post]
func (h *CommunityHandler) LikeComment(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	commentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid comment ID")
	}

	if err := h.commentService.LikeComment(userID, uint(commentID)); err != nil {
		if err == service.ErrCommentNotFound {
			return fail(c, 404, "Comment not found")
		}
		if err == service.ErrAlreadyLiked {
			return fail(c, 409, "Already liked")
		}
		return fail(c, 500, "Failed to like comment: "+err.Error())
	}

	return success(c, map[string]string{"message": "Liked"})
}

// UnlikeComment unlikes a comment
// @Summary Unlike Comment
// @Description Unlike a comment
// @Tags Community
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Comment ID"
// @Success 200 {object} Response
// @Router /api/v1/community/comments/{id}/like [delete]
func (h *CommunityHandler) UnlikeComment(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	commentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid comment ID")
	}

	if err := h.commentService.UnlikeComment(userID, uint(commentID)); err != nil {
		if err == service.ErrNotLiked {
			return fail(c, 400, "Not liked")
		}
		return fail(c, 500, "Failed to unlike comment: "+err.Error())
	}

	return success(c, map[string]string{"message": "Unliked"})
}

// =====================================================
// Category APIs
// =====================================================

// GetCategories gets all categories
// @Summary Get Categories
// @Description Get all post categories
// @Tags Community
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/community/categories [get]
func (h *CommunityHandler) GetCategories(c echo.Context) error {
	categories, err := h.categoryService.GetCategories()
	if err != nil {
		return fail(c, 500, "Failed to get categories: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"categories": categories,
	})
}

// =====================================================
// Hot Topic APIs
// =====================================================

// GetHotTopics gets hot topics
// @Summary Get Hot Topics
// @Description Get hot topics
// @Tags Community
// @Accept json
// @Produce json
// @Param limit query int false "Limit" default(10)
// @Success 200 {object} Response
// @Router /api/v1/community/topics/hot [get]
func (h *CommunityHandler) GetHotTopics(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}

	topics, err := h.topicService.GetHotTopics(limit)
	if err != nil {
		return fail(c, 500, "Failed to get hot topics: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"topics": topics,
	})
}

// =====================================================
// Admin APIs
// =====================================================

// AdminCreateCategory creates a new category (admin only)
// @Summary Create Category (Admin)
// @Description Create a new post category
// @Tags Community Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreateCategoryRequest true "Category details"
// @Success 200 {object} Response
// @Router /api/v1/admin/community/categories [post]
func (h *CommunityHandler) AdminCreateCategory(c echo.Context) error {
	var req service.CreateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.Name == "" || req.Code == "" {
		return fail(c, 400, "Name and code are required")
	}

	category, err := h.categoryService.CreateCategory(&req)
	if err != nil {
		return fail(c, 500, "Failed to create category: "+err.Error())
	}

	return success(c, category)
}

// AdminUpdateCategory updates a category (admin only)
// @Summary Update Category (Admin)
// @Description Update a post category
// @Tags Community Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Param request body service.UpdateCategoryRequest true "Category details"
// @Success 200 {object} Response
// @Router /api/v1/admin/community/categories/{id} [put]
func (h *CommunityHandler) AdminUpdateCategory(c echo.Context) error {
	categoryID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid category ID")
	}

	var req service.UpdateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.categoryService.UpdateCategory(uint(categoryID), &req); err != nil {
		return fail(c, 500, "Failed to update category: "+err.Error())
	}

	return success(c, map[string]string{"message": "Category updated"})
}

// AdminDeleteCategory deletes a category (admin only)
// @Summary Delete Category (Admin)
// @Description Delete a post category
// @Tags Community Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/community/categories/{id} [delete]
func (h *CommunityHandler) AdminDeleteCategory(c echo.Context) error {
	categoryID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid category ID")
	}

	if err := h.categoryService.DeleteCategory(uint(categoryID)); err != nil {
		return fail(c, 500, "Failed to delete category: "+err.Error())
	}

	return success(c, map[string]string{"message": "Category deleted"})
}

// RegisterRoutes registers all community routes
func (h *CommunityHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	communityGroup := g.Group("/community")

	// Public routes
	communityGroup.GET("/posts", h.GetPosts)
	communityGroup.GET("/posts/:id", h.GetPost)
	communityGroup.GET("/posts/:post_id/comments", h.GetComments)
	communityGroup.GET("/comments/:id/replies", h.GetReplies)
	communityGroup.GET("/categories", h.GetCategories)
	communityGroup.GET("/topics/hot", h.GetHotTopics)

	// Protected routes
	communityGroup.POST("/posts", h.CreatePost, authMiddleware)
	communityGroup.PUT("/posts/:id", h.UpdatePost, authMiddleware)
	communityGroup.DELETE("/posts/:id", h.DeletePost, authMiddleware)
	communityGroup.GET("/posts/my", h.GetUserPosts, authMiddleware)
	communityGroup.POST("/posts/:id/like", h.LikePost, authMiddleware)
	communityGroup.DELETE("/posts/:id/like", h.UnlikePost, authMiddleware)

	communityGroup.POST("/comments", h.CreateComment, authMiddleware)
	communityGroup.DELETE("/comments/:id", h.DeleteComment, authMiddleware)
	communityGroup.POST("/comments/:id/like", h.LikeComment, authMiddleware)
	communityGroup.DELETE("/comments/:id/like", h.UnlikeComment, authMiddleware)
}

// RegisterAdminRoutes registers admin routes for community
func (h *CommunityHandler) RegisterAdminRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	communityGroup := g.Group("/community")
	communityGroup.Use(authMiddleware)

	communityGroup.POST("/categories", h.AdminCreateCategory)
	communityGroup.PUT("/categories/:id", h.AdminUpdateCategory)
	communityGroup.DELETE("/categories/:id", h.AdminDeleteCategory)
}
