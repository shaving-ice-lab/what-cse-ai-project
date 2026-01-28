import request from "../request";

// =====================================================
// 类型定义
// =====================================================

// 帖子作者
export interface PostAuthor {
  id: number;
  nickname: string;
  avatar?: string;
}

// 帖子分类
export interface PostCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color: string;
  post_count: number;
}

// 热门话题
export interface HotTopic {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  post_count: number;
  view_count: number;
  is_hot: boolean;
}

// 帖子简要信息（列表用）
export interface PostBrief {
  id: number;
  user_id: number;
  category_id?: number;
  title: string;
  summary?: string;
  cover_image?: string;
  tags?: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  is_top: boolean;
  is_hot: boolean;
  is_essence: boolean;
  published_at?: string;
  created_at: string;
  author?: PostAuthor;
  category?: PostCategory;
}

// 帖子详情
export interface PostDetail extends PostBrief {
  content: string;
  share_count: number;
  is_liked: boolean;
  updated_at: string;
}

// 评论
export interface Comment {
  id: number;
  post_id: number;
  parent_id?: number;
  content: string;
  like_count: number;
  reply_count: number;
  is_liked: boolean;
  created_at: string;
  author?: PostAuthor;
  reply_to?: PostAuthor;
  replies?: Comment[];
}

// =====================================================
// 请求/响应类型
// =====================================================

// 帖子列表查询参数
export interface PostQueryParams {
  category_id?: number;
  keyword?: string;
  order_by?: "latest" | "hot" | "views" | "likes";
  page?: number;
  page_size?: number;
}

// 帖子列表响应
export interface PostListResponse {
  posts: PostBrief[];
  total: number;
  page: number;
  page_size: number;
}

// 评论列表响应
export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page: number;
  page_size: number;
}

// 创建帖子请求
export interface CreatePostRequest {
  category_id?: number;
  title: string;
  content: string;
  summary?: string;
  cover_image?: string;
  tags?: string[];
}

// 更新帖子请求
export interface UpdatePostRequest {
  category_id?: number;
  title?: string;
  content?: string;
  summary?: string;
  cover_image?: string;
  tags?: string[];
}

// 创建评论请求
export interface CreateCommentRequest {
  post_id: number;
  parent_id?: number;
  reply_to?: number;
  content: string;
}

// =====================================================
// API 接口
// =====================================================

export const communityApi = {
  // =====================================================
  // 帖子相关
  // =====================================================

  // 获取帖子列表
  getPosts: (params?: PostQueryParams): Promise<PostListResponse> =>
    request.get("/community/posts", { params }),

  // 获取帖子详情
  getPost: (id: number): Promise<PostDetail> =>
    request.get(`/community/posts/${id}`),

  // 获取我的帖子
  getMyPosts: (params?: { page?: number; page_size?: number }): Promise<PostListResponse> =>
    request.get("/community/posts/my", { params }),

  // 创建帖子
  createPost: (data: CreatePostRequest): Promise<PostBrief> =>
    request.post("/community/posts", data),

  // 更新帖子
  updatePost: (id: number, data: UpdatePostRequest): Promise<void> =>
    request.put(`/community/posts/${id}`, data),

  // 删除帖子
  deletePost: (id: number): Promise<void> =>
    request.delete(`/community/posts/${id}`),

  // 点赞帖子
  likePost: (id: number): Promise<void> =>
    request.post(`/community/posts/${id}/like`),

  // 取消点赞帖子
  unlikePost: (id: number): Promise<void> =>
    request.delete(`/community/posts/${id}/like`),

  // =====================================================
  // 评论相关
  // =====================================================

  // 获取评论列表
  getComments: (
    postId: number,
    params?: { page?: number; page_size?: number }
  ): Promise<CommentListResponse> =>
    request.get(`/community/posts/${postId}/comments`, { params }),

  // 获取评论的回复
  getReplies: (
    commentId: number,
    params?: { page?: number; page_size?: number }
  ): Promise<CommentListResponse> =>
    request.get(`/community/comments/${commentId}/replies`, { params }),

  // 创建评论
  createComment: (data: CreateCommentRequest): Promise<Comment> =>
    request.post("/community/comments", data),

  // 删除评论
  deleteComment: (id: number): Promise<void> =>
    request.delete(`/community/comments/${id}`),

  // 点赞评论
  likeComment: (id: number): Promise<void> =>
    request.post(`/community/comments/${id}/like`),

  // 取消点赞评论
  unlikeComment: (id: number): Promise<void> =>
    request.delete(`/community/comments/${id}/like`),

  // =====================================================
  // 分类相关
  // =====================================================

  // 获取所有分类
  getCategories: (): Promise<{ categories: PostCategory[] }> =>
    request.get("/community/categories"),

  // =====================================================
  // 热门话题相关
  // =====================================================

  // 获取热门话题
  getHotTopics: (limit?: number): Promise<{ topics: HotTopic[] }> =>
    request.get("/community/topics/hot", { params: { limit } }),
};
