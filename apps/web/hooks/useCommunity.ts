import { useState, useCallback } from "react";
import {
  communityApi,
  PostQueryParams,
  PostListResponse,
  PostDetail,
  PostBrief,
  PostCategory,
  HotTopic,
  Comment,
  CommentListResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
} from "@/services/api/community";
import { toast } from "@what-cse/ui";

// =====================================================
// 帖子列表 Hook
// =====================================================

export function usePosts() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PostListResponse | null>(null);

  const fetchPosts = useCallback(async (params?: PostQueryParams) => {
    setLoading(true);
    try {
      const result = await communityApi.getPosts(params);
      setData(result);
      return result;
    } catch (error) {
      toast.error("获取帖子列表失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyPosts = useCallback(
    async (params?: { page?: number; page_size?: number }) => {
      setLoading(true);
      try {
        const result = await communityApi.getMyPosts(params);
        setData(result);
        return result;
      } catch (error) {
        toast.error("获取我的帖子失败");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    data,
    posts: data?.posts || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.page_size || 20,
    fetchPosts,
    fetchMyPosts,
  };
}

// =====================================================
// 帖子详情 Hook
// =====================================================

export function usePost() {
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<PostDetail | null>(null);

  const fetchPost = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const result = await communityApi.getPost(id);
      setPost(result);
      return result;
    } catch (error) {
      toast.error("获取帖子详情失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (data: CreatePostRequest) => {
    setLoading(true);
    try {
      const result = await communityApi.createPost(data);
      toast.success("发布成功");
      return result;
    } catch (error) {
      toast.error("发布失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id: number, data: UpdatePostRequest) => {
    setLoading(true);
    try {
      await communityApi.updatePost(id, data);
      toast.success("更新成功");
      return true;
    } catch (error) {
      toast.error("更新失败");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id: number) => {
    try {
      await communityApi.deletePost(id);
      toast.success("删除成功");
      return true;
    } catch (error) {
      toast.error("删除失败");
      return false;
    }
  }, []);

  const likePost = useCallback(async (id: number) => {
    try {
      await communityApi.likePost(id);
      setPost((prev) =>
        prev && prev.id === id
          ? { ...prev, is_liked: true, like_count: prev.like_count + 1 }
          : prev
      );
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "点赞失败";
      if (message.includes("Already")) {
        toast.info("已经点过赞了");
      } else {
        toast.error(message);
      }
      return false;
    }
  }, []);

  const unlikePost = useCallback(async (id: number) => {
    try {
      await communityApi.unlikePost(id);
      setPost((prev) =>
        prev && prev.id === id
          ? { ...prev, is_liked: false, like_count: Math.max(0, prev.like_count - 1) }
          : prev
      );
      return true;
    } catch (error) {
      toast.error("取消点赞失败");
      return false;
    }
  }, []);

  return {
    loading,
    post,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    setPost,
  };
}

// =====================================================
// 评论 Hook
// =====================================================

export function useComments() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CommentListResponse | null>(null);

  const fetchComments = useCallback(
    async (postId: number, params?: { page?: number; page_size?: number }) => {
      setLoading(true);
      try {
        const result = await communityApi.getComments(postId, params);
        setData(result);
        return result;
      } catch (error) {
        toast.error("获取评论失败");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchReplies = useCallback(
    async (
      commentId: number,
      params?: { page?: number; page_size?: number }
    ) => {
      try {
        const result = await communityApi.getReplies(commentId, params);
        return result;
      } catch (error) {
        toast.error("获取回复失败");
        throw error;
      }
    },
    []
  );

  const createComment = useCallback(async (data: CreateCommentRequest) => {
    try {
      const result = await communityApi.createComment(data);
      toast.success("评论成功");
      return result;
    } catch (error) {
      toast.error("评论失败");
      throw error;
    }
  }, []);

  const deleteComment = useCallback(async (id: number) => {
    try {
      await communityApi.deleteComment(id);
      toast.success("评论已删除");
      return true;
    } catch (error) {
      toast.error("删除评论失败");
      return false;
    }
  }, []);

  const likeComment = useCallback(async (id: number) => {
    try {
      await communityApi.likeComment(id);
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "点赞失败";
      if (!message.includes("Already")) {
        toast.error(message);
      }
      return false;
    }
  }, []);

  const unlikeComment = useCallback(async (id: number) => {
    try {
      await communityApi.unlikeComment(id);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  return {
    loading,
    data,
    comments: data?.comments || [],
    total: data?.total || 0,
    fetchComments,
    fetchReplies,
    createComment,
    deleteComment,
    likeComment,
    unlikeComment,
    setData,
  };
}

// =====================================================
// 分类 Hook
// =====================================================

export function useCategories() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<PostCategory[]>([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await communityApi.getCategories();
      setCategories(result.categories);
      return result.categories;
    } catch (error) {
      toast.error("获取分类失败");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    categories,
    fetchCategories,
  };
}

// =====================================================
// 热门话题 Hook
// =====================================================

export function useHotTopics() {
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<HotTopic[]>([]);

  const fetchHotTopics = useCallback(async (limit?: number) => {
    setLoading(true);
    try {
      const result = await communityApi.getHotTopics(limit);
      setTopics(result.topics);
      return result.topics;
    } catch (error) {
      // Silently fail for hot topics
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    topics,
    fetchHotTopics,
  };
}
