"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Clock,
  Star,
  Play,
  ChevronRight,
  ChevronDown,
  Filter,
  Search,
  Loader2,
  BookMarked,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
  Circle,
  FolderOpen,
  FileText,
} from "lucide-react";
import {
  useCourses,
  useCourseCategories,
  useKnowledge,
  getSubjectName,
  getSubjectIcon,
  formatDuration,
  getDifficultyLabel,
  getDifficultyColor,
} from "@/hooks/useCourse";
import { CourseBrief, CourseCategory, KnowledgePoint, CourseQueryParams } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";

// 科目配置
const subjectConfig: Record<string, { name: string; fullName: string; icon: string; color: string; bgColor: string }> = {
  xingce: {
    name: "行测",
    fullName: "行政职业能力测验",
    icon: "📊",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500",
  },
  shenlun: {
    name: "申论",
    fullName: "申论写作",
    icon: "📝",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500",
  },
  mianshi: {
    name: "面试",
    fullName: "结构化面试",
    icon: "🎤",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-500",
  },
  gongji: {
    name: "公基",
    fullName: "公共基础知识",
    icon: "📚",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500",
  },
};

// 难度筛选选项
const difficultyOptions = [
  { value: "", label: "全部难度" },
  { value: "beginner", label: "入门" },
  { value: "intermediate", label: "进阶" },
  { value: "advanced", label: "高级" },
];

// 排序选项
const sortOptions = [
  { value: "latest", label: "最新上线" },
  { value: "popular", label: "最多学习" },
  { value: "views", label: "最多浏览" },
  { value: "rating", label: "好评优先" },
];

// 分类树节点组件
function CategoryTreeNode({
  category,
  selectedId,
  onSelect,
  level = 0,
}: {
  category: CourseCategory;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(category.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
          isSelected
            ? "bg-amber-100 text-amber-700 font-medium"
            : "hover:bg-stone-100 text-stone-600"
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren ? (
          <ChevronRight
            className={`w-4 h-4 flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        ) : (
          <Circle className="w-2 h-2 flex-shrink-0 ml-1 mr-1" />
        )}
        <span className="truncate flex-1">{category.name}</span>
        <span className="text-xs text-stone-400">{category.course_count}</span>
      </button>

      {hasChildren && expanded && (
        <div className="ml-2">
          {category.children!.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 知识点树节点组件
function KnowledgeTreeNode({
  point,
  level = 0,
}: {
  point: KnowledgePoint;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = point.children && point.children.length > 0;

  const importanceStars = "★".repeat(point.importance) + "☆".repeat(5 - point.importance);
  const frequencyColors: Record<string, string> = {
    high: "text-red-500 bg-red-50",
    medium: "text-amber-500 bg-amber-50",
    low: "text-stone-400 bg-stone-50",
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          hasChildren ? "cursor-pointer hover:bg-stone-50" : ""
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <ChevronRight
            className={`w-4 h-4 flex-shrink-0 text-stone-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        ) : (
          <FileText className="w-4 h-4 flex-shrink-0 text-stone-400" />
        )}
        <span className="flex-1 text-stone-700">{point.name}</span>
        <span className={`px-1.5 py-0.5 text-xs rounded ${frequencyColors[point.frequency]}`}>
          {point.frequency === "high" ? "高频" : point.frequency === "medium" ? "中频" : "低频"}
        </span>
        <span className="text-xs text-amber-400" title={`重要程度: ${point.importance}/5`}>
          {importanceStars}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="ml-2">
          {point.children!.map((child) => (
            <KnowledgeTreeNode key={child.id} point={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// 课程卡片组件
function CourseCard({ course, index }: { course: CourseBrief; index: number }) {
  return (
    <Link
      href={`/learn/course/${course.id}`}
      className="group block bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Cover Image */}
      <div className="relative aspect-video bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
        {course.cover_image ? (
          <img
            src={course.cover_image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-stone-400" />
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(course.duration_minutes)}
        </div>

        {/* Free/VIP Badge */}
        {course.is_free ? (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-lg">
            免费
          </div>
        ) : course.vip_only ? (
          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
            <Star className="w-3 h-3" />
            VIP
          </div>
        ) : null}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-stone-800 ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Difficulty */}
        <div className="flex items-center gap-2 mb-2">
          {course.category && (
            <span className="text-xs text-stone-500">{course.category.name}</span>
          )}
          <span className={`px-2 py-0.5 text-xs rounded ${getDifficultyColor(course.difficulty)}`}>
            {getDifficultyLabel(course.difficulty)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Subtitle */}
        {course.subtitle && (
          <p className="text-sm text-stone-500 mb-3 line-clamp-1">{course.subtitle}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" />
            {course.study_count}人学习
          </span>
          <span className="flex items-center gap-1">
            <BookMarked className="w-3.5 h-3.5" />
            {course.chapter_count}章节
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function SubjectLearnPage() {
  const params = useParams();
  const subject = params.subject as string;
  const config = subjectConfig[subject];

  const { isAuthenticated } = useAuthStore();
  const { loading: coursesLoading, courses, total, fetchCourses } = useCourses();
  const { loading: categoriesLoading, categories, fetchCategoriesBySubject } = useCourseCategories();
  const { loading: knowledgeLoading, knowledgeTree, fetchKnowledgeTree } = useKnowledge();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "views" | "rating">("popular");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [showOnlyFree, setShowOnlyFree] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"categories" | "knowledge">("categories");

  // 加载分类
  useEffect(() => {
    fetchCategoriesBySubject(subject);
  }, [subject, fetchCategoriesBySubject]);

  // 加载课程
  useEffect(() => {
    const params: CourseQueryParams = {
      subject,
      page,
      page_size: 12,
      order_by: sortBy,
    };
    if (selectedCategoryId) params.category_id = selectedCategoryId;
    if (difficulty) params.difficulty = difficulty;
    if (keyword) params.keyword = keyword;
    if (showOnlyFree) params.is_free = true;

    fetchCourses(params);
  }, [subject, selectedCategoryId, difficulty, sortBy, keyword, page, showOnlyFree, fetchCourses]);

  // 加载知识点（当选择分类时）
  useEffect(() => {
    if (selectedCategoryId && sidebarTab === "knowledge") {
      fetchKnowledgeTree(selectedCategoryId);
    }
  }, [selectedCategoryId, sidebarTab, fetchKnowledgeTree]);

  // 计算总页数
  const totalPages = Math.ceil(total / 12);

  // 如果科目不存在
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">科目不存在</h1>
          <Link href="/learn" className="text-amber-600 hover:underline">
            返回学习中心
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <div className={`bg-gradient-to-br ${config.color} text-white`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习中心
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-5xl">{config.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{config.name}</h1>
              <p className="text-white/80">{config.fullName}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">{total}</span>
              <span className="text-white/80">门课程</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              <span className="font-semibold">{categories.length}</span>
              <span className="text-white/80">个分类</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
              {/* Tab switcher */}
              <div className="flex gap-2 mb-4 p-1 bg-stone-100 rounded-lg">
                <button
                  onClick={() => setSidebarTab("categories")}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    sidebarTab === "categories"
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  课程分类
                </button>
                <button
                  onClick={() => setSidebarTab("knowledge")}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    sidebarTab === "knowledge"
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  知识体系
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
                {sidebarTab === "categories" ? (
                  <div className="p-4">
                    <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-amber-500" />
                      课程分类
                    </h3>

                    {categoriesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <button
                          onClick={() => setSelectedCategoryId(null)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                            selectedCategoryId === null
                              ? "bg-amber-100 text-amber-700 font-medium"
                              : "hover:bg-stone-100 text-stone-600"
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>全部课程</span>
                          <span className="text-xs text-stone-400 ml-auto">{total}</span>
                        </button>

                        {categories.map((category) => (
                          <CategoryTreeNode
                            key={category.id}
                            category={category}
                            selectedId={selectedCategoryId}
                            onSelect={setSelectedCategoryId}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      知识体系
                    </h3>

                    {!selectedCategoryId ? (
                      <p className="text-sm text-stone-500 py-4 text-center">
                        请先选择一个课程分类
                      </p>
                    ) : knowledgeLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                      </div>
                    ) : knowledgeTree.length > 0 ? (
                      <div className="space-y-1">
                        {knowledgeTree.map((point) => (
                          <KnowledgeTreeNode key={point.id} point={point} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-500 py-4 text-center">
                        暂无知识点数据
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="搜索课程..."
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                {/* Difficulty Filter */}
                <select
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {difficultyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as typeof sortBy);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Free only toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyFree}
                    onChange={(e) => {
                      setShowOnlyFree(e.target.checked);
                      setPage(1);
                    }}
                    className="w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-stone-600">仅看免费</span>
                </label>
              </div>
            </div>

            {/* Results info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500">
                共找到 <span className="font-medium text-stone-800">{total}</span> 门课程
              </p>
            </div>

            {/* Course Grid */}
            {coursesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : courses.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {courses.map((course, idx) => (
                    <CourseCard key={course.id} course={course} index={idx} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-stone-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                    >
                      上一页
                    </button>
                    <span className="text-sm text-stone-600">
                      第 {page} 页 / 共 {totalPages} 页
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-stone-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                <h3 className="text-lg font-medium text-stone-800 mb-2">暂无课程</h3>
                <p className="text-stone-500">该分类下暂无课程，请尝试其他筛选条件</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
