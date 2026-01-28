"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Users,
  Trash2,
  Building2,
  GraduationCap,
  Search,
  CheckSquare,
  Square,
  Trash,
  Download,
  FileText,
  Loader2,
  Bell,
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorite";
import { FavoriteResponse, FavoriteType } from "@/services/api/favorite";

function getExamTypeStyle(examType: string) {
  if (examType?.includes("国考")) return "bg-blue-100 text-blue-700";
  if (examType?.includes("省考")) return "bg-emerald-100 text-emerald-700";
  if (examType?.includes("事业")) return "bg-purple-100 text-purple-700";
  return "bg-stone-100 text-stone-700";
}

export default function FavoritesPage() {
  const {
    loading,
    favorites,
    total,
    stats,
    fetchFavorites,
    removeFavorite,
    batchRemove,
    exportFavorites,
  } = useFavorites();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FavoriteType | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const params: { favorite_type?: FavoriteType; page: number; page_size: number } = {
      page,
      page_size: pageSize,
    };
    if (activeTab !== "all") {
      params.favorite_type = activeTab;
    }
    fetchFavorites(params);
  }, [fetchFavorites, activeTab, page]);

  const handleRemove = async (favorite: FavoriteResponse) => {
    const success = await removeFavorite(favorite.favorite_type, favorite.target_id);
    if (success) {
      fetchFavorites({ favorite_type: activeTab === "all" ? undefined : activeTab, page, page_size: pageSize });
      setSelectedIds(selectedIds.filter((id) => id !== favorite.id));
    }
  };

  const handleBatchRemove = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`确定要取消收藏选中的 ${selectedIds.length} 个项目吗？`)) {
      const success = await batchRemove(selectedIds);
      if (success) {
        fetchFavorites({ favorite_type: activeTab === "all" ? undefined : activeTab, page, page_size: pageSize });
        setSelectedIds([]);
      }
    }
  };

  const handleExport = async () => {
    await exportFavorites(activeTab === "all" ? undefined : activeTab);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFavorites.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFavorites.map((f) => f.id));
    }
  };

  const filteredFavorites = favorites.filter((f) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (f.position) {
      return (
        f.position.position_name?.toLowerCase().includes(query) ||
        f.position.department_name?.toLowerCase().includes(query)
      );
    }
    if (f.announcement) {
      return f.announcement.title?.toLowerCase().includes(query);
    }
    return false;
  });

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            我的收藏
          </h1>
          <p className="text-stone-500 mt-1">
            已收藏 {total} 个项目
            {stats.position && ` (职位 ${stats.position})`}
            {stats.announcement && ` (公告 ${stats.announcement})`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/subscriptions"
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>订阅管理</span>
          </Link>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all" as const, label: "全部", count: total },
          { key: "position" as const, label: "职位", count: stats.position || 0 },
          { key: "announcement" as const, label: "公告", count: stats.announcement || 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-amber-500 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索收藏..."
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Batch Actions */}
          {filteredFavorites.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-3 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
              >
                {selectedIds.length === filteredFavorites.length && filteredFavorites.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-amber-500" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">全选</span>
              </button>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBatchRemove}
                  className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash className="w-5 h-5" />
                  <span className="hidden sm:inline">删除 ({selectedIds.length})</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* Favorites List */}
      {!loading && filteredFavorites.length > 0 ? (
        <div className="space-y-4">
          {filteredFavorites.map((favorite, index) => (
            <div
              key={favorite.id}
              className={`group bg-white rounded-2xl border shadow-card transition-all duration-300 overflow-hidden animate-fade-in ${
                selectedIds.includes(favorite.id)
                  ? "border-amber-300 ring-2 ring-amber-500/20"
                  : "border-stone-200/50 hover:shadow-card-hover"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Type indicator */}
              <div className={`h-1 ${
                favorite.favorite_type === "position" 
                  ? "bg-gradient-to-r from-amber-500 to-amber-600"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
              }`} />

              <div className="p-5 lg:p-6">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button onClick={() => toggleSelect(favorite.id)} className="mt-1 flex-shrink-0">
                    {selectedIds.includes(favorite.id) ? (
                      <CheckSquare className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {favorite.favorite_type === "position" && favorite.position ? (
                      <>
                        {/* Position Header */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Link
                            href={`/positions/${favorite.position.id}`}
                            className="text-lg font-semibold text-stone-800 hover:text-amber-600 transition-colors"
                          >
                            {favorite.position.position_name}
                          </Link>
                          {favorite.position.exam_type && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${getExamTypeStyle(favorite.position.exam_type)}`}>
                              {favorite.position.exam_type}
                            </span>
                          )}
                        </div>

                        {/* Department */}
                        <p className="flex items-center gap-1.5 text-stone-600 mb-3">
                          <Building2 className="w-4 h-4 text-stone-400" />
                          <span className="truncate">{favorite.position.department_name}</span>
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {favorite.position.province && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                              <MapPin className="w-3.5 h-3.5" />
                              {favorite.position.city || favorite.position.province}
                            </span>
                          )}
                          {favorite.position.education && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {favorite.position.education}
                            </span>
                          )}
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                            <Users className="w-3.5 h-3.5" />招{favorite.position.recruit_count || 1}人
                          </span>
                        </div>
                      </>
                    ) : favorite.favorite_type === "announcement" && favorite.announcement ? (
                      <>
                        {/* Announcement Header */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Link
                            href={`/announcements/${favorite.announcement.id}`}
                            className="text-lg font-semibold text-stone-800 hover:text-amber-600 transition-colors"
                          >
                            {favorite.announcement.title}
                          </Link>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700">
                            公告
                          </span>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {favorite.announcement.exam_type && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                              <FileText className="w-3.5 h-3.5" />
                              {favorite.announcement.exam_type}
                            </span>
                          )}
                          {favorite.announcement.province && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                              <MapPin className="w-3.5 h-3.5" />
                              {favorite.announcement.province}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-stone-500">收藏项目信息不可用</p>
                    )}
                  </div>

                  {/* Right Side */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemove(favorite)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="取消收藏"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 text-sm text-stone-500">
                  <span>收藏于 {new Date(favorite.created_at).toLocaleDateString()}</span>
                  <Link
                    href={favorite.favorite_type === "position" && favorite.position
                      ? `/positions/${favorite.position.id}`
                      : favorite.favorite_type === "announcement" && favorite.announcement
                        ? `/announcements/${favorite.announcement.id}`
                        : "#"
                    }
                    className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Heart className="w-16 h-16 mx-auto text-stone-200 mb-4" />
          <p className="text-stone-500 mb-2">
            {searchQuery ? "没有找到匹配的收藏" : "暂无收藏"}
          </p>
          {!searchQuery && (
            <Link
              href="/positions"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
            >
              去浏览职位
            </Link>
          )}
        </div>
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
  );
}
