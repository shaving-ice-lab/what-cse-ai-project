"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Clock,
  Users,
  Target,
  Trophy,
  ChevronRight,
  Search,
  Filter,
  Play,
  BarChart3,
  Award,
  Calendar,
  Star,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  practiceApi,
  ExamPaper,
  PaperType,
  getPaperTypeName,
  getSubjectName,
  getExamTypeName,
  getRegionName,
  formatTime,
} from "@/services/api/practice";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

// 试卷类型筛选选项
const paperTypeOptions = [
  { value: "all", label: "全部类型" },
  { value: "real_exam", label: "真题卷" },
  { value: "mock", label: "模拟卷" },
  { value: "daily", label: "每日练习" },
];

// 科目筛选选项
const subjectOptions = [
  { value: "all", label: "全部科目" },
  { value: "xingce", label: "行测" },
  { value: "shenlun", label: "申论" },
  { value: "mianshi", label: "面试" },
  { value: "gongji", label: "公基" },
];

// 年份选项
const yearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [{ value: "all", label: "全部年份" }];
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push({ value: String(i), label: `${i}年` });
  }
  return years;
};

// 地区筛选选项
const regionOptions = [
  { value: "all", label: "全部地区" },
  { value: "national", label: "国家级" },
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "guangdong", label: "广东" },
  { value: "jiangsu", label: "江苏" },
  { value: "zhejiang", label: "浙江" },
  { value: "shandong", label: "山东" },
  { value: "sichuan", label: "四川" },
  { value: "hubei", label: "湖北" },
  { value: "hunan", label: "湖南" },
  { value: "henan", label: "河南" },
  { value: "hebei", label: "河北" },
  { value: "fujian", label: "福建" },
  { value: "liaoning", label: "辽宁" },
  { value: "shaanxi", label: "陕西" },
  { value: "anhui", label: "安徽" },
  { value: "jiangxi", label: "江西" },
  { value: "shanxi", label: "山西" },
  { value: "yunnan", label: "云南" },
  { value: "guizhou", label: "贵州" },
  { value: "chongqing", label: "重庆" },
  { value: "tianjin", label: "天津" },
  { value: "other", label: "其他地区" },
];

// 试卷卡片组件
function PaperCard({ paper }: { paper: ExamPaper }) {
  const getTypeColor = (type: PaperType) => {
    const colors: Record<PaperType, string> = {
      real_exam: "from-blue-500 to-indigo-500",
      mock: "from-emerald-500 to-teal-500",
      daily: "from-amber-500 to-orange-500",
      custom: "from-purple-500 to-pink-500",
    };
    return colors[type] || "from-stone-500 to-stone-600";
  };

  const getTypeBgColor = (type: PaperType) => {
    const colors: Record<PaperType, string> = {
      real_exam: "bg-blue-50 text-blue-700",
      mock: "bg-emerald-50 text-emerald-700",
      daily: "bg-amber-50 text-amber-700",
      custom: "bg-purple-50 text-purple-700",
    };
    return colors[type] || "bg-stone-50 text-stone-700";
  };

  const hasUserScore = paper.user_best_score !== undefined && paper.user_best_score !== null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-warm-lg transition-all group overflow-hidden">
      {/* 顶部色带 */}
      <div className={`h-1.5 bg-gradient-to-r ${getTypeColor(paper.paper_type)}`} />
      
      <div className="p-5">
        {/* 标题和标签 */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-800 group-hover:text-amber-600 transition-colors line-clamp-2">
              {paper.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`px-2 py-0.5 text-xs rounded-lg font-medium ${getTypeBgColor(paper.paper_type)}`}>
                {getPaperTypeName(paper.paper_type)}
              </span>
              {paper.subject && (
                <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-lg">
                  {getSubjectName(paper.subject)}
                </span>
              )}
              {paper.region && (
                <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs rounded-lg">
                  {getRegionName(paper.region)}
                </span>
              )}
              {paper.year && (
                <span className="text-xs text-stone-400">{paper.year}年</span>
              )}
              {paper.is_free && (
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-lg">
                  免费
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>

        {/* 描述 */}
        {paper.description && (
          <p className="text-sm text-stone-500 line-clamp-2 mb-3">{paper.description}</p>
        )}

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-stone-400" />
            <span>{paper.total_questions}题</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>{paper.time_limit}分钟</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-stone-400" />
            <span>{paper.attempt_count.toLocaleString()}人做过</span>
          </div>
        </div>

        {/* 底部：分数信息和开始按钮 */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="flex flex-col gap-1">
            {/* 平均分 */}
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-stone-600">
                平均分：<span className="font-bold text-stone-800">{paper.avg_score.toFixed(1)}</span>
                <span className="text-stone-400">/{paper.total_score}</span>
              </span>
            </div>
            {/* 我的成绩 */}
            {hasUserScore && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600">
                  我的最高：<span className="font-bold">{paper.user_best_score!.toFixed(1)}</span>
                  <span className="text-emerald-400">/{paper.total_score}</span>
                  {paper.user_attempt_count && paper.user_attempt_count > 1 && (
                    <span className="text-stone-400 ml-1">（{paper.user_attempt_count}次）</span>
                  )}
                </span>
              </div>
            )}
          </div>
          <Link
            href={`/practice/exam/${paper.id}`}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors shadow-amber-sm"
          >
            <Play className="w-4 h-4" />
            {hasUserScore ? "再做" : "开始"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function PapersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  // URL参数
  const initialType = searchParams.get("type") || "all";
  const initialSubject = searchParams.get("subject") || "all";
  const initialYear = searchParams.get("year") || "all";
  const initialRegion = searchParams.get("region") || "all";
  const initialKeyword = searchParams.get("keyword") || "";

  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // 筛选状态
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [subjectFilter, setSubjectFilter] = useState(initialSubject);
  const [yearFilter, setYearFilter] = useState(initialYear);
  const [regionFilter, setRegionFilter] = useState(initialRegion);
  const [keyword, setKeyword] = useState(initialKeyword);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        page_size: pageSize,
      };
      if (typeFilter !== "all") params.paper_type = typeFilter;
      if (subjectFilter !== "all") params.subject = subjectFilter;
      if (yearFilter !== "all") params.year = parseInt(yearFilter);
      if (regionFilter !== "all") params.region = regionFilter;
      if (keyword) params.keyword = keyword;

      const res = await practiceApi.getPapers(params);
      setPapers(res.papers || []);
      setTotal(res.total || 0);
    } catch (error: any) {
      toast.error(error.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, subjectFilter, yearFilter, regionFilter, keyword]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // 同步URL参数
  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (subjectFilter !== "all") params.set("subject", subjectFilter);
    if (yearFilter !== "all") params.set("year", yearFilter);
    if (regionFilter !== "all") params.set("region", regionFilter);
    if (keyword) params.set("keyword", keyword);
    
    const query = params.toString();
    router.replace(query ? `?${query}` : "", { scroll: false });
  }, [typeFilter, subjectFilter, yearFilter, regionFilter, keyword, router]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            试卷中心
          </h1>
          <p className="text-stone-500 text-sm mt-1">历年真题、模拟试卷，全方位备考</p>
        </div>

        {/* 筛选栏 */}
        <div className="bg-white rounded-xl border border-stone-200/50 shadow-card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* 搜索 */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="搜索试卷..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="h-6 w-px bg-stone-200" />

            {/* 类型筛选 */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
            >
              {paperTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* 科目筛选 */}
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
            >
              {subjectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* 年份筛选 */}
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
            >
              {yearOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* 地区筛选 */}
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
            >
              {regionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex-1" />

            {/* 刷新 */}
            <button
              onClick={fetchPapers}
              disabled={loading}
              className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-stone-600">
            共 <span className="font-bold text-stone-800">{total}</span> 套试卷
          </div>
        </div>

        {/* 试卷列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200/50 p-5 animate-pulse">
                <div className="h-4 bg-stone-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-stone-100 rounded w-1/2 mb-4" />
                <div className="flex gap-4 mb-4">
                  <div className="h-4 bg-stone-100 rounded w-16" />
                  <div className="h-4 bg-stone-100 rounded w-16" />
                  <div className="h-4 bg-stone-100 rounded w-20" />
                </div>
                <div className="h-10 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-700 mb-2">暂无试卷</h3>
            <p className="text-stone-500">请调整筛选条件或稍后重试</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="text-sm text-stone-500">
                  第 {page} 页 / 共 {totalPages} 页
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PapersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    }>
      <PapersContent />
    </Suspense>
  );
}
