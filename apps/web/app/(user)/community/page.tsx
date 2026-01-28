"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Heart,
  Eye,
  MessageCircle,
  Search,
  Plus,
  Flame,
  Clock,
  TrendingUp,
  Star,
  ChevronDown,
  User,
  Loader2,
  Filter,
  Hash,
} from "lucide-react";
import { usePosts, useCategories, useHotTopics } from "@/hooks/useCommunity";
import { PostBrief, PostCategory, HotTopic } from "@/services/api/community";
import { useAuthStore } from "@/stores/authStore";

// 排序选项
const sortOptions = [
  { value: "latest", label: "最新发布", icon: Clock },
  { value: "hot", label: "热门讨论", icon: Flame },
  { value: "views", label: "最多浏览", icon: Eye },
  { value: "likes", label: "最多点赞", icon: Heart },
];

// 帖子卡片组件
function PostCard({ post, index }: { post: PostBrief; index: number }) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="group block bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top indicator for featured posts */}
      {(post.is_top || post.is_hot || post.is_essence) && (
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
      )}

      <div className="p-5 lg:p-6">
        {/* Header with tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
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
          {post.category && (
            <span
              className="px-2 py-0.5 text-xs font-medium rounded-md"
              style={{
                backgroundColor: `${post.category.color}20`,
                color: post.category.color,
              }}
            >
              {post.category.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-stone-800 group-hover:text-amber-600 transition-colors mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Summary */}
        {post.summary && (
          <p className="text-stone-500 text-sm mb-4 line-clamp-2">{post.summary}</p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-lg"
              >
                <Hash className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 text-stone-400 text-xs">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.nickname}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                <User className="w-4 h-4 text-stone-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-stone-700">
                {post.author?.nickname || "匿名用户"}
              </p>
              <p className="text-xs text-stone-400">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatNumber(post.view_count)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {formatNumber(post.like_count)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {post.comment_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// 热门话题卡片
function HotTopicCard({ topic }: { topic: HotTopic }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
      >
        #
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-700 truncate">{topic.name}</p>
        <p className="text-xs text-stone-400">{topic.post_count} 讨论</p>
      </div>
      {topic.is_hot && <Flame className="w-4 h-4 text-orange-500" />}
    </div>
  );
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + "万";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

export default function CommunityPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading, posts, total, fetchPosts } = usePosts();
  const { categories, fetchCategories } = useCategories();
  const { topics, fetchHotTopics } = useHotTopics();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "hot" | "views" | "likes">("latest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 初始加载
  useEffect(() => {
    fetchCategories();
    fetchHotTopics(10);
  }, [fetchCategories, fetchHotTopics]);

  // 加载帖子
  useEffect(() => {
    fetchPosts({
      category_id: selectedCategory || undefined,
      keyword: searchQuery || undefined,
      order_by: sortBy,
      page,
      page_size: pageSize,
    });
  }, [fetchPosts, selectedCategory, searchQuery, sortBy, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const currentSort = sortOptions.find((s) => s.value === sortBy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-amber-500" />
              考公交流社区
            </h1>
            <p className="text-stone-500 mt-1">分享经验、互助交流、共同进步</p>
          </div>
          {isAuthenticated && (
            <Link
              href="/community/create"
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
            >
              <Plus className="w-5 h-5" />
              发布帖子
            </Link>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索帖子..."
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </form>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors min-w-[140px]"
                  >
                    {currentSort && <currentSort.icon className="w-4 h-4" />}
                    <span>{currentSort?.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 ml-auto transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showSortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute top-full right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-50 py-2 min-w-[160px]">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value as typeof sortBy);
                              setShowSortMenu(false);
                              setPage(1);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-stone-50 ${
                              sortBy === option.value
                                ? "text-amber-600 bg-amber-50"
                                : "text-stone-600"
                            }`}
                          >
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Category Tags */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === null
                        ? "bg-amber-500 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    全部
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? "text-white"
                          : "text-stone-600 hover:bg-stone-200"
                      }`}
                      style={
                        selectedCategory === cat.id
                          ? { backgroundColor: cat.color }
                          : { backgroundColor: `${cat.color}15` }
                      }
                    >
                      {cat.name}
                      {cat.post_count > 0 && (
                        <span className="ml-1 text-xs opacity-70">({cat.post_count})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            )}

            {/* Posts List */}
            {!loading && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                  <Filter className="w-16 h-16 mx-auto text-stone-200 mb-4" />
                  <p className="text-stone-500 mb-2">
                    {searchQuery ? "没有找到匹配的帖子" : "暂无帖子"}
                  </p>
                  {isAuthenticated && !searchQuery && (
                    <Link
                      href="/community/create"
                      className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
                    >
                      <Plus className="w-5 h-5" />
                      发布第一个帖子
                    </Link>
                  )}
                </div>
              )
            )}

            {/* Pagination */}
            {total > pageSize && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <span className="px-4 py-2 text-stone-600">
                    第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / pageSize)}
                    className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Hot Topics */}
            {topics.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-800 mb-4">
                  <Flame className="w-5 h-5 text-orange-500" />
                  热门话题
                </h3>
                <div className="space-y-1">
                  {topics.map((topic) => (
                    <HotTopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              </div>
            )}

            {/* User Stats (placeholder) */}
            {isAuthenticated && (
              <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">我的动态</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <Link href="/community?tab=my" className="group">
                    <p className="text-2xl font-bold text-amber-500 group-hover:scale-110 transition-transform">
                      0
                    </p>
                    <p className="text-sm text-stone-500">帖子</p>
                  </Link>
                  <div>
                    <p className="text-2xl font-bold text-stone-700">0</p>
                    <p className="text-sm text-stone-500">获赞</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-stone-700">0</p>
                    <p className="text-sm text-stone-500">评论</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-800 mb-3">
                <Star className="w-5 h-5 text-amber-500" />
                社区公约
              </h3>
              <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  友善交流，互相尊重
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  分享真实经验，不传播虚假信息
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  禁止广告和违规内容
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  保护个人隐私，不泄露敏感信息
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
