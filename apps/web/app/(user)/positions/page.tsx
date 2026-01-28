"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  RefreshCw,
  Download,
  Star,
  Scale,
  Flame,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Eye,
  Clock,
  Users,
  Target,
  BarChart3,
  Activity,
  Award,
  SlidersHorizontal,
  Check,
  RotateCcw,
  MapPin,
  GraduationCap,
  Calendar,
  Loader2,
} from "lucide-react";
import { QuickFilters, quickFilters } from "@/components/positions";
import { positionApi, type PositionBrief, type PositionQueryParams, type PositionStats as PositionStatsType } from "@/services/api/position";
import { favoriteApi } from "@/services/api/favorite";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

// 筛选配置
const filterConfig = {
  examType: {
    label: "考试类型",
    key: "exam_type",
    options: ["公务员", "事业单位", "教师招聘", "医疗卫生", "银行招聘", "国企招聘", "军队文职", "三支一扶", "选调生"],
  },
  province: {
    label: "省份",
    key: "province",
    options: [
      "北京", "上海", "广东", "江苏", "浙江", "山东", "四川", "湖北", "河南", "陕西",
      "福建", "湖南", "安徽", "河北", "辽宁", "天津", "重庆", "云南", "贵州", "广西",
      "山西", "江西", "黑龙江", "吉林", "甘肃", "内蒙古", "新疆", "海南", "宁夏", "青海", "西藏",
    ],
  },
  departmentLevel: {
    label: "部门层级",
    key: "department_level",
    options: ["中央", "省级", "市级", "县级", "乡镇"],
  },
  education: {
    label: "学历要求",
    key: "education",
    options: ["不限", "大专", "本科", "硕士研究生", "博士研究生"],
  },
  politicalStatus: {
    label: "政治面貌",
    key: "political_status",
    options: ["不限", "中共党员", "中共党员或共青团员", "共青团员", "群众"],
  },
  majorCategory: {
    label: "专业大类",
    key: "major_category",
    options: ["哲学", "经济学", "法学", "教育学", "文学", "历史学", "理学", "工学", "农学", "医学", "管理学", "艺术学", "军事学"],
  },
  ageRange: {
    label: "年龄要求",
    key: "age_max",
    options: ["≤25岁", "≤30岁", "≤35岁", "≤40岁", "≤45岁", "不限"],
  },
  workExperience: {
    label: "工作经验",
    key: "work_experience",
    options: ["无要求", "1年以上", "2年以上", "3年以上", "5年以上"],
  },
};

// 本地存储键
const STORAGE_KEY = "position_filter_preferences";

// 从 URL 参数解析筛选条件
function parseFiltersFromUrl(searchParams: URLSearchParams): Record<string, string[]> {
  const filters: Record<string, string[]> = {
    examType: [],
    province: [],
    departmentLevel: [],
    education: [],
    politicalStatus: [],
    majorCategory: [],
    ageRange: [],
    workExperience: [],
  };

  Object.keys(filterConfig).forEach((key) => {
    const config = filterConfig[key as keyof typeof filterConfig];
    const value = searchParams.get(config.key);
    if (value) {
      filters[key] = value.split(",");
    }
  });

  return filters;
}

// 从 URL 参数解析快捷筛选
function parseQuickFiltersFromUrl(searchParams: URLSearchParams): string[] {
  const activeFilters: string[] = [];
  
  if (searchParams.get("updated_today") === "true") activeFilters.push("today-new");
  if (searchParams.get("expiring_days") === "3") activeFilters.push("expiring-soon");
  if (searchParams.get("unlimited_major") === "true") activeFilters.push("major-unlimited");
  if (searchParams.get("household_unlimited") === "true") activeFilters.push("household-unlimited");
  if (searchParams.get("fresh_graduate") === "true") activeFilters.push("fresh-graduate");
  if (searchParams.get("no_experience") === "true") activeFilters.push("no-exp");
  if (searchParams.get("min_recruit") === "3") activeFilters.push("more-recruit");
  
  return activeFilters;
}

// 保存筛选条件到本地存储
function saveFiltersToStorage(filters: Record<string, string[]>, quickFilters: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ filters, quickFilters, timestamp: Date.now() }));
  } catch (e) {
    // Ignore storage errors
  }
}

// 从本地存储加载筛选条件
function loadFiltersFromStorage(): { filters: Record<string, string[]>; quickFilters: string[] } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // 只保留24小时内的记忆
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return { filters: data.filters, quickFilters: data.quickFilters };
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
  return null;
}

// 多选下拉组件
function MultiSelect({
  label,
  options,
  selected,
  onChange,
  className = "",
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1 text-sm border rounded transition-colors ${
          selected.length > 0
            ? "bg-amber-50 border-amber-300 text-amber-700"
            : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="px-1 py-0.5 bg-amber-500 text-white text-xs rounded">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-warm-lg z-50 min-w-[160px] max-h-[240px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-stone-50 ${selected.includes(opt) ? "text-amber-600" : "text-stone-700"}`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(opt) ? "bg-amber-500 border-amber-500" : "border-stone-300"}`}
                >
                  {selected.includes(opt) && <Check className="w-3 h-3 text-white" />}
                </div>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type SortKey = "created_at" | "recruit_count" | "registration_end";

export default function PositionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 初始化筛选状态
  const [isInitialized, setIsInitialized] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({
    examType: [],
    province: [],
    departmentLevel: [],
    education: [],
    politicalStatus: [],
    majorCategory: [],
    ageRange: [],
    workExperience: [],
  });
  const [majorCategories, setMajorCategories] = useState<string[]>([]);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [compareList, setCompareList] = useState<number[]>([]);
  const { isAuthenticated } = useAuthStore();
  
  // API 数据状态
  const [positions, setPositions] = useState<PositionBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PositionStatsType | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  
  // 初始化：从 URL 或本地存储加载筛选条件
  useEffect(() => {
    const urlFilters = parseFiltersFromUrl(searchParams);
    const urlQuickFilters = parseQuickFiltersFromUrl(searchParams);
    const keyword = searchParams.get("keyword") || "";
    
    // 如果 URL 有参数，使用 URL 参数
    const hasUrlParams = Object.values(urlFilters).some(arr => arr.length > 0) || 
                        urlQuickFilters.length > 0 || 
                        keyword;
    
    if (hasUrlParams) {
      setFilters(urlFilters);
      setActiveQuickFilters(urlQuickFilters);
      setSearchQuery(keyword);
    } else {
      // 否则尝试从本地存储加载
      const stored = loadFiltersFromStorage();
      if (stored) {
        setFilters(stored.filters);
        setActiveQuickFilters(stored.quickFilters);
      }
    }
    
    setIsInitialized(true);
  }, []);

  // 构建 API 查询参数
  const buildQueryParams = useCallback((): PositionQueryParams => {
    const params: PositionQueryParams = {
      page,
      page_size: pageSize,
      sort_by: sortKey,
      sort_order: sortAsc ? "asc" : "desc",
    };
    
    if (searchQuery) params.keyword = searchQuery;
    if (filters.province.length > 0) params.province = filters.province[0];
    if (filters.education.length > 0) params.education = filters.education[0];
    if (filters.examType.length > 0) params.exam_type = filters.examType[0];
    if (filters.departmentLevel.length > 0) params.department_level = filters.departmentLevel[0];
    if (filters.politicalStatus.length > 0) params.political_status = filters.politicalStatus[0];
    if (filters.majorCategory.length > 0) params.major_category = filters.majorCategory[0];
    
    // 年龄范围筛选
    if (filters.ageRange.length > 0) {
      const ageValue = filters.ageRange[0];
      if (ageValue === "≤25岁") params.age_max = 25;
      else if (ageValue === "≤30岁") params.age_max = 30;
      else if (ageValue === "≤35岁") params.age_max = 35;
      else if (ageValue === "≤40岁") params.age_max = 40;
      else if (ageValue === "≤45岁") params.age_max = 45;
      // "不限"不设置参数
    }
    
    // 工作经验筛选
    if (filters.workExperience.length > 0) {
      const expValue = filters.workExperience[0];
      if (expValue === "无要求") {
        params.no_experience = true;
      } else if (expValue === "1年以上") {
        params.work_experience_years_min = 1;
      } else if (expValue === "2年以上") {
        params.work_experience_years_min = 2;
      } else if (expValue === "3年以上") {
        params.work_experience_years_min = 3;
      } else if (expValue === "5年以上") {
        params.work_experience_years_min = 5;
      }
    }
    
    // 快捷筛选转换为 API 参数
    if (activeQuickFilters.includes("today-new")) params.updated_today = true;
    if (activeQuickFilters.includes("expiring-soon")) params.expiring_days = 3;
    if (activeQuickFilters.includes("major-unlimited")) params.unlimited_major = true;
    if (activeQuickFilters.includes("fresh-graduate")) params.fresh_graduate = true;
    if (activeQuickFilters.includes("no-exp")) params.no_experience = true;
    if (activeQuickFilters.includes("more-recruit")) params.min_recruit = 3;
    
    return params;
  }, [page, pageSize, sortKey, sortAsc, searchQuery, filters, activeQuickFilters]);
  
  // 同步筛选条件到 URL
  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(filterConfig).forEach(([key, config]) => {
      const values = filters[key as keyof typeof filters];
      if (values && values.length > 0) {
        params.set(config.key, values.join(","));
      }
    });
    
    // 快捷筛选
    if (activeQuickFilters.includes("today-new")) params.set("updated_today", "true");
    if (activeQuickFilters.includes("expiring-soon")) params.set("expiring_days", "3");
    if (activeQuickFilters.includes("major-unlimited")) params.set("unlimited_major", "true");
    if (activeQuickFilters.includes("household-unlimited")) params.set("household_unlimited", "true");
    if (activeQuickFilters.includes("fresh-graduate")) params.set("fresh_graduate", "true");
    if (activeQuickFilters.includes("no-exp")) params.set("no_experience", "true");
    if (activeQuickFilters.includes("more-recruit")) params.set("min_recruit", "3");
    
    if (searchQuery) params.set("keyword", searchQuery);
    if (page > 1) params.set("page", String(page));
    
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : "", { scroll: false });
  }, [filters, activeQuickFilters, searchQuery, page, router]);
  
  // 获取职位数据
  const fetchPositions = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      setError(null);
      const params = buildQueryParams();
      const response = await positionApi.getPositions(params);
      setPositions(response.positions || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取职位列表失败");
      setPositions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, buildQueryParams]);
  
  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await positionApi.getStats();
      setStats(statsData);
    } catch (err) {
      // 静默失败
    }
  }, []);
  
  // 获取筛选选项（专业大类等）
  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await positionApi.getFilterOptions();
      if (options.major_categories && options.major_categories.length > 0) {
        setMajorCategories(options.major_categories);
      }
    } catch (err) {
      // 静默失败
    }
  }, []);
  
  // 初始化时加载数据
  useEffect(() => {
    if (isInitialized) {
      fetchPositions();
      fetchStats();
      fetchFilterOptions();
    }
  }, [isInitialized, fetchPositions, fetchStats, fetchFilterOptions]);
  
  // 筛选条件变化时同步 URL 和本地存储
  useEffect(() => {
    if (isInitialized) {
      syncToUrl();
      saveFiltersToStorage(filters, activeQuickFilters);
    }
  }, [isInitialized, filters, activeQuickFilters, searchQuery, page, syncToUrl]);

  // 更新筛选
  const updateFilter = (key: string, val: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };
  
  // 切换快捷筛选
  const toggleQuickFilter = (id: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
    setPage(1);
  };
  
  // 清除所有快捷筛选
  const clearAllQuickFilters = () => {
    setActiveQuickFilters([]);
    setPage(1);
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      examType: [],
      province: [],
      departmentLevel: [],
      education: [],
      politicalStatus: [],
      majorCategory: [],
      ageRange: [],
      workExperience: [],
    });
    setActiveQuickFilters([]);
    setSearchQuery("");
    setPage(1);
    // 清除本地存储
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  };

  // 活跃筛选数量
  const activeFilterCount =
    Object.values(filters).filter((v) => v.length > 0).length + activeQuickFilters.length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
    setPage(1);
  };

  // 检查职位收藏状态
  const checkFavoriteStatus = useCallback(async (positionIds: string[]) => {
    if (!isAuthenticated || positionIds.length === 0) return;
    try {
      const result = await favoriteApi.checkFavorites("position", positionIds);
      setFavoriteMap(prev => ({ ...prev, ...result.favorites }));
    } catch (err) {
      // 静默失败
    }
  }, [isAuthenticated]);
  
  // 当职位列表更新时检查收藏状态
  useEffect(() => {
    if (positions.length > 0 && isAuthenticated) {
      const positionIds = positions.map(p => p.position_id);
      checkFavoriteStatus(positionIds);
    }
  }, [positions, isAuthenticated, checkFavoriteStatus]);
  
  const toggleFav = async (id: number, positionId: string) => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      return;
    }
    
    const isFavorited = favoriteMap[positionId];
    
    try {
      if (isFavorited) {
        await favoriteApi.remove("position", positionId);
        setFavoriteMap(prev => ({ ...prev, [positionId]: false }));
        toast.success("已取消收藏");
      } else {
        await favoriteApi.add({ favorite_type: "position", target_id: positionId });
        setFavoriteMap(prev => ({ ...prev, [positionId]: true }));
        toast.success("已添加到收藏");
      }
    } catch (err) {
      toast.error(isFavorited ? "取消收藏失败" : "收藏失败");
    }
  };
  
  const toggleCompare = (id: number) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length >= 5 ? prev : [...prev, id]
    );
  };

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  };

  // 计算距离截止天数
  const getDaysUntilDeadline = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const now = new Date();
    const endDate = new Date(endDateStr);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen text-stone-800">
      {/* 筛选区域 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-stone-200/50 sticky top-0 z-30 shadow-warm-sm">
        <div className="max-w-[1800px] mx-auto">
          {/* 快捷筛选行 */}
          <div className="px-3 py-2 border-b border-stone-100">
            <QuickFilters
              activeFilters={activeQuickFilters}
              onFilterChange={toggleQuickFilter}
              onClearAll={activeQuickFilters.length > 0 ? clearAllQuickFilters : undefined}
            />
          </div>
          
          {/* 主筛选行 */}
          <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPositions()}
                placeholder="搜索职位/部门/专业"
                className="w-48 pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="h-6 w-px bg-stone-200" />

            {/* 主要筛选器 */}
            <MultiSelect
              label="考试类型"
              options={filterConfig.examType.options}
              selected={filters.examType}
              onChange={(v) => updateFilter("examType", v)}
            />
            <MultiSelect
              label="省份"
              options={filterConfig.province.options}
              selected={filters.province}
              onChange={(v) => updateFilter("province", v)}
            />
            <MultiSelect
              label="部门层级"
              options={filterConfig.departmentLevel.options}
              selected={filters.departmentLevel}
              onChange={(v) => updateFilter("departmentLevel", v)}
            />
            <MultiSelect
              label="学历要求"
              options={filterConfig.education.options}
              selected={filters.education}
              onChange={(v) => updateFilter("education", v)}
            />
            <MultiSelect
              label="政治面貌"
              options={filterConfig.politicalStatus.options}
              selected={filters.politicalStatus}
              onChange={(v) => updateFilter("politicalStatus", v)}
            />
            
            {/* 新增筛选器 */}
            <MultiSelect
              label="专业大类"
              options={majorCategories.length > 0 ? majorCategories : ["哲学", "经济学", "法学", "教育学", "文学", "历史学", "理学", "工学", "农学", "医学", "管理学", "艺术学"]}
              selected={filters.majorCategory}
              onChange={(v) => updateFilter("majorCategory", v)}
            />
            <MultiSelect
              label="年龄要求"
              options={filterConfig.ageRange.options}
              selected={filters.ageRange}
              onChange={(v) => updateFilter("ageRange", v)}
            />
            <MultiSelect
              label="工作经验"
              options={filterConfig.workExperience.options}
              selected={filters.workExperience}
              onChange={(v) => updateFilter("workExperience", v)}
            />

            <div className="flex-1" />

            {/* 重置 */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2 py-1 text-sm text-stone-500 hover:text-stone-700"
              >
                <RotateCcw className="w-3 h-3" />
                重置
              </button>
            )}

            {/* 刷新 */}
            <button 
              onClick={fetchPositions}
              className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* 已选筛选标签 */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-t border-stone-100 bg-amber-50/50 flex-wrap">
              <span className="text-xs text-stone-500">已选:</span>
              {Object.entries(filters).map(([key, vals]) =>
                vals.map((v) => (
                  <span
                    key={`${key}-${v}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700"
                  >
                    {v}
                    <button
                      onClick={() =>
                        updateFilter(key, vals.filter((x) => x !== v))
                      }
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
              {activeQuickFilters.map((qf) => (
                <span
                  key={qf}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-200 rounded-lg text-xs text-amber-700"
                >
                  {quickFilters.find((q) => q.id === qf)?.label}
                  <button
                    onClick={() => toggleQuickFilter(qf)}
                    className="text-amber-400 hover:text-amber-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 对比栏 */}
          {compareList.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-t border-stone-100 bg-emerald-50">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">已选 {compareList.length}/5 个职位</span>
              <Link 
                href={`/positions/compare?ids=${compareList.join(",")}`}
                className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
              >
                开始对比
              </Link>
              <button
                onClick={() => setCompareList([])}
                className="text-emerald-600 hover:text-emerald-700 text-xs"
              >
                清除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 数据表格 */}
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-stone-200/50 p-3 shadow-card">
              <div className="text-2xl font-bold text-stone-800">{stats.total}</div>
              <div className="text-xs text-stone-500">总职位数</div>
            </div>
            <div className="bg-white rounded-xl border border-stone-200/50 p-3 shadow-card">
              <div className="text-2xl font-bold text-emerald-600">{stats.total_recruit}</div>
              <div className="text-xs text-stone-500">总招录人数</div>
            </div>
            <div className="bg-white rounded-xl border border-stone-200/50 p-3 shadow-card">
              <div className="text-2xl font-bold text-amber-600">{stats.today_new_count}</div>
              <div className="text-xs text-stone-500">今日新增</div>
            </div>
            <div className="bg-white rounded-xl border border-stone-200/50 p-3 shadow-card">
              <div className="text-2xl font-bold text-blue-600">{stats.registering_count}</div>
              <div className="text-xs text-stone-500">报名中</div>
            </div>
            <div className="bg-white rounded-xl border border-stone-200/50 p-3 shadow-card">
              <div className="text-2xl font-bold text-red-500">{stats.expiring_count}</div>
              <div className="text-xs text-stone-500">即将截止</div>
            </div>
            <div className="bg-white rounded-xl border border-stone-200/50 p-3 shadow-card">
              <div className="text-2xl font-bold text-purple-600">{stats.unlimited_major_count}</div>
              <div className="text-xs text-stone-500">不限专业</div>
            </div>
          </div>
        )}
        
        <div className="bg-white border border-stone-200/50 rounded-2xl overflow-hidden shadow-card">
          {/* 表格头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/50">
            <div className="text-sm text-stone-600">
              共 <span className="font-semibold text-stone-800">{total}</span> 个职位
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">排序:</span>
              <button
                onClick={() => handleSort("created_at")}
                className={`px-2 py-1 text-sm rounded ${sortKey === "created_at" ? "bg-amber-100 text-amber-700" : "text-stone-600 hover:bg-stone-100"}`}
              >
                最新 {sortKey === "created_at" && (sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />)}
              </button>
              <button
                onClick={() => handleSort("recruit_count")}
                className={`px-2 py-1 text-sm rounded ${sortKey === "recruit_count" ? "bg-amber-100 text-amber-700" : "text-stone-600 hover:bg-stone-100"}`}
              >
                招录 {sortKey === "recruit_count" && (sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />)}
              </button>
              <button
                onClick={() => handleSort("registration_end")}
                className={`px-2 py-1 text-sm rounded ${sortKey === "registration_end" ? "bg-amber-100 text-amber-700" : "text-stone-600 hover:bg-stone-100"}`}
              >
                截止 {sortKey === "registration_end" && (sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />)}
              </button>
            </div>
          </div>
          
          {/* 加载状态 */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <span className="ml-3 text-stone-500">加载中...</span>
            </div>
          )}
          
          {/* 错误状态 */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-red-500 mb-2">{error}</div>
              <button
                onClick={fetchPositions}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                重试
              </button>
            </div>
          )}
          
          {/* 数据列表 */}
          {!loading && !error && positions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-2 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200 w-8">
                      <Scale className="w-4 h-4 text-stone-400" />
                    </th>
                    <th className="px-2 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200 min-w-[180px]">
                      职位名称
                    </th>
                    <th className="px-2 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200 min-w-[200px]">
                      招录单位
                    </th>
                    <th className="px-2 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200">
                      类型
                    </th>
                    <th className="px-2 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200">
                      地区
                    </th>
                    <th className="px-2 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200">
                      学历
                    </th>
                    <th className="px-2 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200">
                      招录
                    </th>
                    <th className="px-2 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200">
                      报名截止
                    </th>
                    <th className="px-2 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200 w-20">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p, idx) => {
                    const daysLeft = getDaysUntilDeadline(p.registration_end);
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-stone-100 hover:bg-amber-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-stone-50/30"}`}
                      >
                        <td className="px-2 py-2">
                          <input
                            type="checkbox"
                            checked={compareList.includes(p.id)}
                            onChange={() => toggleCompare(p.id)}
                            className="rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1.5">
                            {favoriteMap[p.position_id] && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                            )}
                            <Link
                              href={`/positions/${p.id}`}
                              className="font-medium text-stone-800 hover:text-amber-600 line-clamp-1"
                            >
                              {p.position_name}
                            </Link>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {p.is_unlimited_major && (
                              <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-xs rounded">
                                不限专业
                              </span>
                            )}
                            {p.is_for_fresh_graduate && (
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                                应届可报
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="line-clamp-1 text-stone-700" title={p.department_name}>
                            {p.department_name}
                          </div>
                          {p.department_level && (
                            <span className="text-xs text-stone-400">{p.department_level}</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.exam_type && (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                              p.exam_type === "公务员" ? "bg-blue-100 text-blue-700" :
                              p.exam_type === "事业单位" ? "bg-violet-100 text-violet-700" :
                              p.exam_type === "教师招聘" ? "bg-emerald-100 text-emerald-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {p.exam_type}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-stone-700 text-xs">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {p.province}{p.city && `·${p.city}`}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center text-stone-600">
                          <div className="flex items-center justify-center gap-1">
                            <GraduationCap className="w-3 h-3 text-stone-400" />
                            {p.education || "不限"}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className={`font-mono font-bold ${
                            p.recruit_count >= 5 ? "text-emerald-600" :
                            p.recruit_count >= 3 ? "text-green-500" :
                            "text-stone-700"
                          }`}>
                            {p.recruit_count}
                          </span>
                          <span className="text-xs text-stone-400 ml-0.5">人</span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="text-xs text-stone-600">
                            {formatDate(p.registration_end)}
                          </div>
                          {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && (
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              daysLeft <= 3 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                            }`}>
                              {daysLeft === 0 ? "今日" : `${daysLeft}天`}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => toggleFav(p.id, p.position_id)}
                              className={`p-1 rounded-lg transition-colors ${
                                favoriteMap[p.position_id] ? "text-amber-500" : "text-stone-400 hover:text-amber-500"
                              }`}
                              title={favoriteMap[p.position_id] ? "取消收藏" : "收藏"}
                            >
                              <Star className={`w-4 h-4 ${favoriteMap[p.position_id] ? "fill-current" : ""}`} />
                            </button>
                            <Link
                              href={`/positions/${p.id}`}
                              className="p-1 rounded-lg text-stone-400 hover:text-amber-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 空数据状态 */}
          {!loading && !error && positions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Filter className="w-12 h-12 text-stone-300 mb-4" />
              <h3 className="text-lg font-semibold text-stone-700 mb-2">暂无符合条件的职位</h3>
              <p className="text-stone-500 mb-4">请调整筛选条件或搜索关键词</p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-amber-md"
              >
                重置筛选
              </button>
            </div>
          )}

          {/* 分页 */}
          {!loading && positions.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50/50">
              <div className="text-sm text-stone-500">
                第 {page}/{totalPages} 页，共 {total} 条
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
