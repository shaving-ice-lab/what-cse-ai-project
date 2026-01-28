"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  User,
  Clock,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  Send,
  ChevronDown,
  ChevronUp,
  Flag,
  Hash,
  Flame,
  TrendingUp,
  Star,
} from "lucide-react";
import { usePost, useComments } from "@/hooks/useCommunity";
import { Comment, CreateCommentRequest } from "@/services/api/community";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
}

// 评论组件
function CommentItem({
  comment,
  onReply,
  onLike,
  onDelete,
  currentUserId,
  level = 0,
}: {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onLike: (id: number, isLiked: boolean) => void;
  onDelete: (id: number) => void;
  currentUserId?: number;
  level?: number;
}) {
  const [showReplies, setShowReplies] = useState(level === 0 && (comment.replies?.length || 0) > 0);
  const [liked, setLiked] = useState(comment.is_liked);
  const [likeCount, setLikeCount] = useState(comment.like_count);

  const handleLike = async () => {
    const success = await onLike(comment.id, liked);
    if (success) {
      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    }
  };

  return (
    <div className={`${level > 0 ? "ml-12 mt-3" : ""}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        {comment.author?.avatar ? (
          <img
            src={comment.author.avatar}
            alt={comment.author.nickname}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-stone-500" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-stone-800">
              {comment.author?.nickname || "匿名用户"}
            </span>
            {comment.reply_to && (
              <>
                <span className="text-stone-400">回复</span>
                <span className="font-medium text-amber-600">
                  @{comment.reply_to.nickname}
                </span>
              </>
            )}
            <span className="text-xs text-stone-400">{formatDate(comment.created_at)}</span>
          </div>

          <p className="text-stone-700 whitespace-pre-wrap break-words">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 text-sm">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                liked ? "text-red-500" : "text-stone-400 hover:text-red-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            <button
              onClick={() => onReply(comment)}
              className="flex items-center gap-1 text-stone-400 hover:text-amber-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              回复
            </button>
            {currentUserId === comment.author?.id && (
              <button
                onClick={() => {
                  if (confirm("确定要删除这条评论吗？")) {
                    onDelete(comment.id);
                  }
                }}
                className="flex items-center gap-1 text-stone-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            )}
          </div>

          {/* Replies Toggle */}
          {level === 0 && comment.reply_count > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 mt-3 text-sm text-amber-600 hover:text-amber-700"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  收起回复
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  展开 {comment.reply_count} 条回复
                </>
              )}
            </button>
          )}

          {/* Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-3 border-l-2 border-stone-100">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  level={1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = parseInt(params.id as string);

  const { isAuthenticated, user } = useAuthStore();
  const { loading: postLoading, post, fetchPost, likePost, unlikePost, deletePost } = usePost();
  const {
    loading: commentsLoading,
    comments,
    total: totalComments,
    fetchComments,
    createComment,
    deleteComment,
    likeComment,
    unlikeComment,
  } = useComments();

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 加载帖子
  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [fetchPost, postId]);

  // 加载评论
  useEffect(() => {
    if (postId) {
      fetchComments(postId, { page, page_size: pageSize });
    }
  }, [fetchComments, postId, page]);

  // 处理点赞帖子
  const handleLikePost = async () => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      return;
    }
    if (post?.is_liked) {
      await unlikePost(post.id);
    } else if (post) {
      await likePost(post.id);
    }
  };

  // 处理删除帖子
  const handleDeletePost = async () => {
    if (!post) return;
    if (confirm("确定要删除这个帖子吗？删除后无法恢复。")) {
      const success = await deletePost(post.id);
      if (success) {
        router.push("/community");
      }
    }
  };

  // 处理发表评论
  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      return;
    }
    if (!commentText.trim()) {
      toast.error("请输入评论内容");
      return;
    }

    setSubmitting(true);
    try {
      const data: CreateCommentRequest = {
        post_id: postId,
        content: commentText.trim(),
      };
      if (replyingTo) {
        data.parent_id = replyingTo.parent_id || replyingTo.id;
        data.reply_to = replyingTo.author?.id;
      }
      await createComment(data);
      setCommentText("");
      setReplyingTo(null);
      // Refresh comments
      fetchComments(postId, { page: 1, page_size: pageSize });
      setPage(1);
    } finally {
      setSubmitting(false);
    }
  };

  // 处理点赞评论
  const handleLikeComment = async (id: number, isLiked: boolean) => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      return false;
    }
    if (isLiked) {
      return await unlikeComment(id);
    } else {
      return await likeComment(id);
    }
  };

  // 处理删除评论
  const handleDeleteComment = async (id: number) => {
    const success = await deleteComment(id);
    if (success) {
      fetchComments(postId, { page, page_size: pageSize });
    }
  };

  // 处理回复
  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    // Focus on textarea
    document.getElementById("comment-input")?.focus();
  };

  // 处理分享
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("链接已复制到剪贴板");
    }
  };

  if (postLoading && !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-stone-500 mb-4">帖子不存在或已被删除</p>
        <Link
          href="/community"
          className="text-amber-600 hover:text-amber-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回社区
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回社区
        </Link>

        {/* Post Card */}
        <article className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden mb-6">
          {/* Tags */}
          {(post.is_top || post.is_hot || post.is_essence) && (
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          )}

          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.nickname}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-stone-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-stone-800">
                    {post.author?.nickname || "匿名用户"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-stone-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                    {post.category && (
                      <>
                        <span>·</span>
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: `${post.category.color}20`,
                            color: post.category.color,
                          }}
                        >
                          {post.category.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu */}
              {user?.id === post.user_id && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute top-full right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-50 py-2 min-w-[140px]">
                        <Link
                          href={`/community/edit/${post.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:bg-stone-50 w-full text-left"
                        >
                          <Edit className="w-4 h-4" />
                          编辑
                        </Link>
                        <button
                          onClick={handleDeletePost}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {post.is_top && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-md">
                  <Star className="w-3 h-3" />
                  置顶
                </span>
              )}
              {post.is_hot && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-md">
                  <Flame className="w-3 h-3" />
                  热门
                </span>
              )}
              {post.is_essence && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  精华
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 mb-6">
              {post.title}
            </h1>

            {/* Content */}
            <div className="prose prose-stone max-w-none mb-6">
              <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 pt-6 border-t border-stone-100">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-600 text-sm rounded-lg"
                  >
                    <Hash className="w-4 h-4" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-stone-100">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLikePost}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    post.is_liked
                      ? "bg-red-50 text-red-500"
                      : "bg-stone-50 text-stone-600 hover:bg-red-50 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.is_liked ? "fill-current" : ""}`} />
                  {post.like_count > 0 && <span>{post.like_count}</span>}
                </button>
                <button
                  onClick={() => document.getElementById("comment-input")?.focus()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 text-stone-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {post.comment_count > 0 && <span>{post.comment_count}</span>}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 text-stone-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  分享
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-stone-400">
                <Eye className="w-4 h-4" />
                <span>{post.view_count} 次浏览</span>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
          <div className="p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">
              评论 ({totalComments})
            </h2>

            {/* Comment Input */}
            <div className="mb-8">
              {replyingTo && (
                <div className="flex items-center gap-2 mb-2 text-sm text-stone-500">
                  <span>回复 @{replyingTo.author?.nickname}</span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    取消
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-stone-500" />
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    id="comment-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      isAuthenticated
                        ? replyingTo
                          ? `回复 @${replyingTo.author?.nickname}...`
                          : "写下你的评论..."
                        : "请登录后评论"
                    }
                    disabled={!isAuthenticated}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!isAuthenticated || !commentText.trim() || submitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      发表评论
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {commentsLoading && comments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onLike={handleLikeComment}
                    onDelete={handleDeleteComment}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无评论，来发表第一条评论吧</p>
              </div>
            )}

            {/* Pagination */}
            {totalComments > pageSize && (
              <div className="flex justify-center mt-8 pt-6 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <span className="px-4 py-2 text-stone-600">
                    {page} / {Math.ceil(totalComments / pageSize)}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(totalComments / pageSize)}
                    className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
