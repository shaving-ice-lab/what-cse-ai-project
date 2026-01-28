package model

import (
	"time"

	"gorm.io/gorm"
)

// =====================================================
// 帖子分类
// =====================================================

// PostCategory 帖子分类
type PostCategory struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(50);not null;uniqueIndex" json:"name"`
	Code        string         `gorm:"type:varchar(50);not null;uniqueIndex" json:"code"`
	Description string         `gorm:"type:varchar(200)" json:"description,omitempty"`
	Icon        string         `gorm:"type:varchar(100)" json:"icon,omitempty"`
	Color       string         `gorm:"type:varchar(20);default:'#6366f1'" json:"color"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	IsEnabled   bool           `gorm:"default:true;index" json:"is_enabled"`
	PostCount   int            `gorm:"default:0" json:"post_count"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (PostCategory) TableName() string {
	return "what_post_categories"
}

// =====================================================
// 帖子
// =====================================================

// PostStatus 帖子状态
type PostStatus int

const (
	PostStatusDraft     PostStatus = 0 // 草稿
	PostStatusPublished PostStatus = 1 // 已发布
	PostStatusHidden    PostStatus = 2 // 隐藏
	PostStatusDeleted   PostStatus = 3 // 已删除
)

// Post 帖子
type Post struct {
	ID         uint            `gorm:"primaryKey" json:"id"`
	UserID     uint            `gorm:"index;not null" json:"user_id"`
	CategoryID uint            `gorm:"index" json:"category_id,omitempty"`
	Title      string          `gorm:"type:varchar(200);not null" json:"title"`
	Content    string          `gorm:"type:text;not null" json:"content"`
	Summary    string          `gorm:"type:varchar(500)" json:"summary,omitempty"` // 摘要，可自动生成
	CoverImage string          `gorm:"type:varchar(500)" json:"cover_image,omitempty"`
	Tags       JSONStringArray `gorm:"type:json" json:"tags,omitempty"` // 标签列表

	// 统计数据
	ViewCount    int `gorm:"default:0;index" json:"view_count"`
	LikeCount    int `gorm:"default:0;index" json:"like_count"`
	CommentCount int `gorm:"default:0" json:"comment_count"`
	ShareCount   int `gorm:"default:0" json:"share_count"`

	// 状态
	Status    PostStatus `gorm:"type:tinyint;default:1;index" json:"status"`
	IsTop     bool       `gorm:"default:false;index" json:"is_top"`     // 是否置顶
	IsHot     bool       `gorm:"default:false;index" json:"is_hot"`     // 是否热门
	IsEssence bool       `gorm:"default:false;index" json:"is_essence"` // 是否精华

	// 时间
	PublishedAt *time.Time     `gorm:"type:datetime" json:"published_at,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	User     *User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Category *PostCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (Post) TableName() string {
	return "what_posts"
}

// PostBriefResponse 帖子简要信息（列表用）
type PostBriefResponse struct {
	ID           uint          `json:"id"`
	UserID       uint          `json:"user_id"`
	CategoryID   uint          `json:"category_id,omitempty"`
	Title        string        `json:"title"`
	Summary      string        `json:"summary,omitempty"`
	CoverImage   string        `json:"cover_image,omitempty"`
	Tags         []string      `json:"tags,omitempty"`
	ViewCount    int           `json:"view_count"`
	LikeCount    int           `json:"like_count"`
	CommentCount int           `json:"comment_count"`
	IsTop        bool          `json:"is_top"`
	IsHot        bool          `json:"is_hot"`
	IsEssence    bool          `json:"is_essence"`
	PublishedAt  *time.Time    `json:"published_at,omitempty"`
	CreatedAt    time.Time     `json:"created_at"`
	Author       *PostAuthor   `json:"author,omitempty"`
	Category     *PostCategory `json:"category,omitempty"`
}

// PostAuthor 帖子作者信息
type PostAuthor struct {
	ID       uint   `json:"id"`
	Nickname string `json:"nickname"`
	Avatar   string `json:"avatar,omitempty"`
}

// ToBriefResponse 转换为简要响应
func (p *Post) ToBriefResponse() *PostBriefResponse {
	resp := &PostBriefResponse{
		ID:           p.ID,
		UserID:       p.UserID,
		CategoryID:   p.CategoryID,
		Title:        p.Title,
		Summary:      p.Summary,
		CoverImage:   p.CoverImage,
		Tags:         p.Tags,
		ViewCount:    p.ViewCount,
		LikeCount:    p.LikeCount,
		CommentCount: p.CommentCount,
		IsTop:        p.IsTop,
		IsHot:        p.IsHot,
		IsEssence:    p.IsEssence,
		PublishedAt:  p.PublishedAt,
		CreatedAt:    p.CreatedAt,
		Category:     p.Category,
	}
	if p.User != nil {
		resp.Author = &PostAuthor{
			ID:       p.User.ID,
			Nickname: p.User.Nickname,
			Avatar:   p.User.Avatar,
		}
	}
	return resp
}

// PostDetailResponse 帖子详情响应
type PostDetailResponse struct {
	ID           uint          `json:"id"`
	UserID       uint          `json:"user_id"`
	CategoryID   uint          `json:"category_id,omitempty"`
	Title        string        `json:"title"`
	Content      string        `json:"content"`
	Summary      string        `json:"summary,omitempty"`
	CoverImage   string        `json:"cover_image,omitempty"`
	Tags         []string      `json:"tags,omitempty"`
	ViewCount    int           `json:"view_count"`
	LikeCount    int           `json:"like_count"`
	CommentCount int           `json:"comment_count"`
	ShareCount   int           `json:"share_count"`
	IsTop        bool          `json:"is_top"`
	IsHot        bool          `json:"is_hot"`
	IsEssence    bool          `json:"is_essence"`
	IsLiked      bool          `json:"is_liked"`
	PublishedAt  *time.Time    `json:"published_at,omitempty"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
	Author       *PostAuthor   `json:"author,omitempty"`
	Category     *PostCategory `json:"category,omitempty"`
}

// ToDetailResponse 转换为详情响应
func (p *Post) ToDetailResponse(isLiked bool) *PostDetailResponse {
	resp := &PostDetailResponse{
		ID:           p.ID,
		UserID:       p.UserID,
		CategoryID:   p.CategoryID,
		Title:        p.Title,
		Content:      p.Content,
		Summary:      p.Summary,
		CoverImage:   p.CoverImage,
		Tags:         p.Tags,
		ViewCount:    p.ViewCount,
		LikeCount:    p.LikeCount,
		CommentCount: p.CommentCount,
		ShareCount:   p.ShareCount,
		IsTop:        p.IsTop,
		IsHot:        p.IsHot,
		IsEssence:    p.IsEssence,
		IsLiked:      isLiked,
		PublishedAt:  p.PublishedAt,
		CreatedAt:    p.CreatedAt,
		UpdatedAt:    p.UpdatedAt,
		Category:     p.Category,
	}
	if p.User != nil {
		resp.Author = &PostAuthor{
			ID:       p.User.ID,
			Nickname: p.User.Nickname,
			Avatar:   p.User.Avatar,
		}
	}
	return resp
}

// =====================================================
// 评论
// =====================================================

// Comment 评论
type Comment struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	PostID   uint   `gorm:"index;not null" json:"post_id"`
	UserID   uint   `gorm:"index;not null" json:"user_id"`
	ParentID *uint  `gorm:"index" json:"parent_id,omitempty"` // 父评论ID，用于回复
	ReplyTo  *uint  `gorm:"index" json:"reply_to,omitempty"`  // 回复的用户ID
	Content  string `gorm:"type:text;not null" json:"content"`

	// 统计
	LikeCount  int `gorm:"default:0" json:"like_count"`
	ReplyCount int `gorm:"default:0" json:"reply_count"`

	// 状态
	Status int `gorm:"type:tinyint;default:1;index" json:"status"` // 0: hidden, 1: visible

	// 时间
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	User        *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReplyToUser *User      `gorm:"-" json:"reply_to_user,omitempty"`
	Replies     []*Comment `gorm:"-" json:"replies,omitempty"`
}

func (Comment) TableName() string {
	return "what_comments"
}

// CommentResponse 评论响应
type CommentResponse struct {
	ID         uint               `json:"id"`
	PostID     uint               `json:"post_id"`
	ParentID   *uint              `json:"parent_id,omitempty"`
	Content    string             `json:"content"`
	LikeCount  int                `json:"like_count"`
	ReplyCount int                `json:"reply_count"`
	IsLiked    bool               `json:"is_liked"`
	CreatedAt  time.Time          `json:"created_at"`
	Author     *PostAuthor        `json:"author,omitempty"`
	ReplyTo    *PostAuthor        `json:"reply_to,omitempty"`
	Replies    []*CommentResponse `json:"replies,omitempty"`
}

// ToResponse 转换为响应
func (c *Comment) ToResponse(isLiked bool) *CommentResponse {
	resp := &CommentResponse{
		ID:         c.ID,
		PostID:     c.PostID,
		ParentID:   c.ParentID,
		Content:    c.Content,
		LikeCount:  c.LikeCount,
		ReplyCount: c.ReplyCount,
		IsLiked:    isLiked,
		CreatedAt:  c.CreatedAt,
	}
	if c.User != nil {
		resp.Author = &PostAuthor{
			ID:       c.User.ID,
			Nickname: c.User.Nickname,
			Avatar:   c.User.Avatar,
		}
	}
	if c.ReplyToUser != nil {
		resp.ReplyTo = &PostAuthor{
			ID:       c.ReplyToUser.ID,
			Nickname: c.ReplyToUser.Nickname,
			Avatar:   c.ReplyToUser.Avatar,
		}
	}
	return resp
}

// =====================================================
// 点赞
// =====================================================

// LikeType 点赞类型
type LikeType string

const (
	LikeTypePost    LikeType = "post"
	LikeTypeComment LikeType = "comment"
)

// Like 点赞
type Like struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"index;not null" json:"user_id"`
	LikeType  LikeType       `gorm:"type:varchar(20);index;not null" json:"like_type"`
	TargetID  uint           `gorm:"index;not null" json:"target_id"` // 帖子ID或评论ID
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Like) TableName() string {
	return "what_likes"
}

// =====================================================
// 热门话题
// =====================================================

// HotTopic 热门话题
type HotTopic struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(100);not null;uniqueIndex" json:"name"`
	Description string         `gorm:"type:varchar(500)" json:"description,omitempty"`
	Icon        string         `gorm:"type:varchar(100)" json:"icon,omitempty"`
	Color       string         `gorm:"type:varchar(20);default:'#f59e0b'" json:"color"`
	PostCount   int            `gorm:"default:0;index" json:"post_count"`
	ViewCount   int            `gorm:"default:0" json:"view_count"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	IsHot       bool           `gorm:"default:false;index" json:"is_hot"`
	IsEnabled   bool           `gorm:"default:true;index" json:"is_enabled"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (HotTopic) TableName() string {
	return "what_hot_topics"
}
