"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Heart,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  GraduationCap,
  Building2,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
} from "lucide-react";

// Mock data
const mockPositions = [
  {
    id: 1,
    name: "科员（一）",
    department: "国家税务总局北京市税务局",
    location: "北京市朝阳区",
    education: "本科及以上",
    major: "会计学、财务管理",
    examType: "国考",
    recruitCount: 3,
    registeredCount: 360,
    competitionRatio: "120:1",
    matchScore: 95,
  },
  {
    id: 2,
    name: "综合管理岗",
    department: "海关总署广州海关",
    location: "广州市",
    education: "本科及以上",
    major: "计算机类",
    examType: "国考",
    recruitCount: 2,
    registeredCount: 180,
    competitionRatio: "90:1",
    matchScore: 88,
  },
  {
    id: 3,
    name: "信息技术岗",
    department: "财政部驻北京专员办",
    location: "北京市",
    education: "硕士及以上",
    major: "软件工程、计算机科学",
    examType: "国考",
    recruitCount: 1,
    registeredCount: 85,
    competitionRatio: "85:1",
    matchScore: 72,
  },
  {
    id: 4,
    name: "执法岗",
    department: "广东省市场监督管理局",
    location: "深圳市",
    education: "本科及以上",
    major: "法学类",
    examType: "省考",
    recruitCount: 5,
    registeredCount: 420,
    competitionRatio: "84:1",
    matchScore: 65,
  },
  {
    id: 5,
    name: "文秘岗",
    department: "中共中央办公厅",
    location: "北京市",
    education: "硕士及以上",
    major: "中文类、新闻类",
    examType: "国考",
    recruitCount: 2,
    registeredCount: 560,
    competitionRatio: "280:1",
    matchScore: 58,
  },
];

const examTypes = ["全部", "国考", "省考", "事业单位"];
const educationOptions = ["不限", "大专及以上", "本科及以上", "硕士及以上", "博士"];
const sortOptions = [
  { value: "match", label: "匹配度优先" },
  { value: "newest", label: "最新发布" },
  { value: "competition", label: "竞争比低" },
  { value: "recruit", label: "招录人数多" },
];

function getScoreColor(score: number) {
  if (score >= 90) return "from-emerald-500 to-emerald-600";
  if (score >= 70) return "from-amber-500 to-amber-600";
  if (score >= 50) return "from-orange-500 to-orange-600";
  return "from-stone-400 to-stone-500";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "完美匹配";
  if (score >= 70) return "高度匹配";
  if (score >= 50) return "部分匹配";
  return "匹配较低";
}

export default function PositionListPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("全部");
  const [selectedEducation, setSelectedEducation] = useState("不限");
  const [selectedSort, setSelectedSort] = useState("match");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedExamType("全部");
    setSelectedEducation("不限");
  };

  const hasActiveFilters = selectedExamType !== "全部" || selectedEducation !== "不限" || searchQuery;

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 mb-2">
          职位查询
        </h1>
        <p className="text-stone-500">找到最适合您的公务员职位</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card mb-6">
        <div className="p-4 lg:p-6">
          {/* Search Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索职位名称、部门、专业..."
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">筛选</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-4 animate-fade-in">
              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  考试类型
                </label>
                <div className="flex flex-wrap gap-2">
                  {examTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedExamType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedExamType === type
                          ? "bg-amber-500 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  学历要求
                </label>
                <div className="flex flex-wrap gap-2">
                  {educationOptions.map((edu) => (
                    <button
                      key={edu}
                      onClick={() => setSelectedEducation(edu)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedEducation === edu
                          ? "bg-amber-500 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {edu}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                  清除筛选
                </button>
                <button className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md">
                  应用筛选
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-stone-600">
          共找到{" "}
          <span className="font-semibold text-stone-800">{mockPositions.length}</span>{" "}
          个职位
        </p>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-600 outline-none focus:border-amber-500 cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>

          {/* View Mode */}
          <div className="hidden sm:flex items-center bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-500"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-500"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Position List */}
      <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-4"}>
        {mockPositions.map((position, index) => (
          <div
            key={position.id}
            className="group bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Match Score Bar */}
            <div className={`h-1 bg-gradient-to-r ${getScoreColor(position.matchScore)}`} />

            <div className="p-5 lg:p-6">
              <div className="flex items-start justify-between gap-4">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      href={`/positions/${position.id}`}
                      className="text-lg font-semibold text-stone-800 hover:text-amber-600 transition-colors truncate"
                    >
                      {position.name}
                    </Link>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                        position.examType === "国考"
                          ? "bg-blue-100 text-blue-700"
                          : position.examType === "省考"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {position.examType}
                    </span>
                  </div>

                  {/* Department */}
                  <p className="flex items-center gap-1.5 text-stone-600 mb-3">
                    <Building2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <span className="truncate">{position.department}</span>
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {position.location}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {position.education}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                      <Users className="w-3.5 h-3.5" />
                      招{position.recruitCount}人
                    </span>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-3">
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(position.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(position.id)
                        ? "bg-red-50 text-red-500"
                        : "hover:bg-stone-100 text-stone-400"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(position.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  {/* Match Score */}
                  <div className="text-right">
                    <div
                      className={`text-2xl font-display font-bold bg-gradient-to-r ${getScoreColor(
                        position.matchScore
                      )} bg-clip-text text-transparent`}
                    >
                      {position.matchScore}%
                    </div>
                    <p className="text-xs text-stone-500">
                      {getScoreLabel(position.matchScore)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-4 text-sm text-stone-500">
                  <span>
                    竞争比:{" "}
                    <span className="font-medium text-amber-600">
                      {position.competitionRatio}
                    </span>
                  </span>
                  <span>已报名: {position.registeredCount}人</span>
                </div>
                <Link
                  href={`/positions/${position.id}`}
                  className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  查看详情 →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <button className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
          上一页
        </button>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
              page === 1
                ? "bg-amber-500 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {page}
          </button>
        ))}
        <span className="px-2 text-stone-400">...</span>
        <button className="w-10 h-10 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
          10
        </button>
        <button className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
          下一页
        </button>
      </div>
    </div>
  );
}
