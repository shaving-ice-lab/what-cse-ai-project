"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Image,
  Hash,
  X,
  Plus,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { usePost, useCategories } from "@/hooks/useCommunity";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { loading, createPost } = usePost();
  const { categories, fetchCategories } = useCategories();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // 加载分类
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 检查登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      router.push("/login?redirect=/community/create");
    }
  }, [isAuthenticated, router]);

  // 添加标签
  const addTag = () => {
    const tag = newTag.trim();
    if (tag && tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // 处理标签输入回车
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // 提交帖子
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("请输入标题");
      return;
    }
    if (!content.trim()) {
      toast.error("请输入内容");
      return;
    }
    if (title.trim().length < 5) {
      toast.error("标题至少5个字符");
      return;
    }
    if (content.trim().length < 10) {
      toast.error("内容至少10个字符");
      return;
    }

    try {
      const post = await createPost({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId || undefined,
        tags: tags.length > 0 ? tags : undefined,
        cover_image: coverImage || undefined,
      });
      router.push(`/community/${post.id}`);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8 max-w-3xl">
        {/* Back Button */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回社区
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
            <FileText className="w-8 h-8 text-amber-500" />
            发布帖子
          </h1>
          <p className="text-stone-500 mt-1">分享你的经验和想法</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入帖子标题（5-100字）"
              maxLength={100}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <p className="mt-2 text-xs text-stone-400 text-right">{title.length}/100</p>
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              选择分类
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryId(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  categoryId === null
                    ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                不选择
              </button>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    categoryId === cat.id
                      ? "text-white"
                      : "text-stone-600 hover:bg-stone-200"
                  }`}
                  style={
                    categoryId === cat.id
                      ? { backgroundColor: cat.color }
                      : { backgroundColor: `${cat.color}15` }
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你想分享的内容...&#10;&#10;• 真实经验分享更受欢迎&#10;• 排版清晰的内容更易阅读&#10;• 遵守社区规范，友善交流"
              rows={12}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none"
            />
            <p className="mt-2 text-xs text-stone-400 text-right">
              {content.length} 字
            </p>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              标签 <span className="text-stone-400 font-normal">（最多5个）</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-100"
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-amber-400 hover:text-amber-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="添加标签"
                    maxLength={20}
                    className="w-32 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 placeholder-stone-400 outline-none focus:bg-white focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-stone-400">
              添加相关标签可以让更多人看到你的帖子
            </p>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 mb-2">发帖提示</p>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• 标题简洁明了，概括主要内容</li>
                  <li>• 内容详实有价值，分享真实经验</li>
                  <li>• 遵守社区规范，文明友善交流</li>
                  <li>• 不要发布广告、违规内容</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-400">
              发布后可在帖子详情页进行编辑
            </p>
            <div className="flex gap-3">
              <Link
                href="/community"
                className="px-6 py-3 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                发布帖子
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
