"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Users,
  Trash2,
  Building2,
  GraduationCap,
  Search,
  Filter,
  CheckSquare,
  Square,
  Trash,
} from "lucide-react";

interface FavoritePosition {
  id: number;
  position_name: string;
  department_name: string;
  work_location: string;
  recruit_count: number;
  education_requirement: string;
  exam_type: string;
  match_score: number;
  created_at: string;
}

const mockFavorites: FavoritePosition[] = [
  {
    id: 1,
    position_name: "综合管理岗",
    department_name: "国家税务总局北京市税务局",
    work_location: "北京市",
    recruit_count: 3,
    education_requirement: "本科及以上",
    exam_type: "国考",
    match_score: 95,
    created_at: "2024-11-01",
  },
  {
    id: 2,
    position_name: "信息技术岗",
    department_name: "海关总署广州海关",
    work_location: "广州市",
    recruit_count: 2,
    education_requirement: "本科及以上",
    exam_type: "国考",
    match_score: 88,
    created_at: "2024-10-28",
  },
  {
    id: 3,
    position_name: "法律事务岗",
    department_name: "最高人民法院",
    work_location: "北京市",
    recruit_count: 1,
    education_requirement: "硕士研究生及以上",
    exam_type: "国考",
    match_score: 72,
    created_at: "2024-10-25",
  },
  {
    id: 4,
    position_name: "执法岗",
    department_name: "广东省市场监督管理局",
    work_location: "深圳市",
    recruit_count: 5,
    education_requirement: "本科及以上",
    exam_type: "省考",
    match_score: 65,
    created_at: "2024-10-20",
  },
];

function getScoreColor(score: number) {
  if (score >= 90) return "from-emerald-500 to-emerald-600";
  if (score >= 70) return "from-amber-500 to-amber-600";
  if (score >= 50) return "from-orange-500 to-orange-600";
  return "from-stone-400 to-stone-500";
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoritePosition[]>(mockFavorites);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRemove = (id: number) => {
    setFavorites(favorites.filter((f) => f.id !== id));
    setSelectedIds(selectedIds.filter((sid) => sid !== id));
  };

  const handleBatchRemove = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`确定要取消收藏选中的 ${selectedIds.length} 个职位吗？`)) {
      setFavorites(favorites.filter((f) => !selectedIds.includes(f.id)));
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === favorites.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(favorites.map((f) => f.id));
    }
  };

  const filteredFavorites = favorites.filter(
    (f) =>
      f.position_name.includes(searchQuery) ||
      f.department_name.includes(searchQuery)
  );

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            我的收藏
          </h1>
          <p className="text-stone-500 mt-1">已收藏 {favorites.length} 个职位</p>
        </div>
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
              placeholder="搜索收藏的职位..."
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Batch Actions */}
          {favorites.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-3 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
              >
                {selectedIds.length === favorites.length ? (
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

      {/* Favorites List */}
      {filteredFavorites.length > 0 ? (
        <div className="space-y-4">
          {filteredFavorites.map((position, index) => (
            <div
              key={position.id}
              className={`group bg-white rounded-2xl border shadow-card transition-all duration-300 overflow-hidden animate-fade-in ${
                selectedIds.includes(position.id)
                  ? "border-amber-300 ring-2 ring-amber-500/20"
                  : "border-stone-200/50 hover:shadow-card-hover"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Match Score Bar */}
              <div
                className={`h-1 bg-gradient-to-r ${getScoreColor(position.match_score)}`}
              />

              <div className="p-5 lg:p-6">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(position.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    {selectedIds.includes(position.id) ? (
                      <CheckSquare className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/positions/${position.id}`}
                        className="text-lg font-semibold text-stone-800 hover:text-amber-600 transition-colors truncate"
                      >
                        {position.position_name}
                      </Link>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                          position.exam_type === "国考"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {position.exam_type}
                      </span>
                    </div>

                    {/* Department */}
                    <p className="flex items-center gap-1.5 text-stone-600 mb-3">
                      <Building2 className="w-4 h-4 text-stone-400" />
                      <span className="truncate">{position.department_name}</span>
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                        <MapPin className="w-3.5 h-3.5" />
                        {position.work_location}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {position.education_requirement}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                        <Users className="w-3.5 h-3.5" />
                        招{position.recruit_count}人
                      </span>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemove(position.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="取消收藏"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    {/* Match Score */}
                    <div className="text-right">
                      <div
                        className={`text-2xl font-display font-bold bg-gradient-to-r ${getScoreColor(
                          position.match_score
                        )} bg-clip-text text-transparent`}
                      >
                        {position.match_score}%
                      </div>
                      <p className="text-xs text-stone-500">匹配度</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 text-sm text-stone-500">
                  <span>收藏于 {position.created_at}</span>
                  <Link
                    href={`/positions/${position.id}`}
                    className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Heart className="w-16 h-16 mx-auto text-stone-200 mb-4" />
          <p className="text-stone-500 mb-2">
            {searchQuery ? "没有找到匹配的收藏" : "暂无收藏的职位"}
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
    </div>
  );
}
