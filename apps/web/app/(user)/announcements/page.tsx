"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Star,
  Flame,
  ChevronDown,
  Filter,
  X,
  Eye,
  Clock,
  FileText,
  Bell,
  MapPin,
  SlidersHorizontal,
  Check,
  RotateCcw,
  CalendarDays,
  Building2,
  TrendingUp,
  Users,
  BookOpen,
} from "lucide-react";

// 筛选配置
const filterConfig = {
  type: { label: "公告类型", options: ["招考公告", "报名通知", "时间公告", "考试指南", "政策解读", "成绩查询", "面试公告"] },
  examType: { label: "考试类型", options: ["国考", "省考", "事业单位", "选调生", "军队文职", "三支一扶"] },
  region: { label: "地区", options: ["全国", "北京", "上海", "广东", "江苏", "浙江", "山东", "四川", "湖北", "河南", "陕西", "福建", "湖南", "安徽", "河北", "辽宁", "天津", "重庆"] },
  source: { label: "发布机构", options: ["国家公务员局", "人社部", "省人社厅", "市人社局", "组织部", "其他"] },
  status: { label: "状态", options: ["进行中", "已结束", "即将开始"] },
};

// 快捷筛选
const quickFilters = [
  { id: "hot", label: "热门公告", icon: Flame },
  { id: "recent", label: "最近发布", icon: Clock },
  { id: "recruiting", label: "正在报名", icon: Users },
  { id: "fav", label: "我的收藏", icon: Star },
  { id: "important", label: "重点关注", icon: TrendingUp },
];

// 模拟数据
const announcements = [
  { id: 1, code: "GK2024-001", title: "2024年度中央机关及其直属机构考试录用公务员公告", type: "招考公告", examType: "国考", source: "国家公务员局", region: "全国", publishDate: "2024-10-15", deadline: "2024-11-08", recruitCount: 39561, applyCount: 3036903, views: 128560, status: "进行中", isHot: true, isFav: true },
  { id: 2, code: "BJ2024-001", title: "2024年北京市公务员考试报名入口已开放", type: "报名通知", examType: "省考", source: "北京市人社局", region: "北京", publishDate: "2024-11-01", deadline: "2024-11-07", recruitCount: 4567, applyCount: 89230, views: 45680, status: "进行中", isHot: true, isFav: false },
  { id: 3, code: "GK2024-002", title: "关于2024年度公务员考试时间安排的公告", type: "时间公告", examType: "国考", source: "人力资源社会保障部", region: "全国", publishDate: "2024-10-20", deadline: "", recruitCount: 0, applyCount: 0, views: 89320, status: "已发布", isHot: false, isFav: false },
  { id: 4, code: "GD2024-001", title: "广东省2024年考试录用公务员公告", type: "招考公告", examType: "省考", source: "广东省人社厅", region: "广东", publishDate: "2024-11-10", deadline: "2024-11-20", recruitCount: 18532, applyCount: 356420, views: 67890, status: "进行中", isHot: true, isFav: false },
  { id: 5, code: "GK2024-003", title: "2024年国考笔试注意事项及考场规则", type: "考试指南", examType: "国考", source: "国家公务员局", region: "全国", publishDate: "2024-11-15", deadline: "", recruitCount: 0, applyCount: 0, views: 56780, status: "已发布", isHot: false, isFav: false },
  { id: 6, code: "SH2024-001", title: "上海市2024年事业单位公开招聘公告", type: "招考公告", examType: "事业单位", source: "上海市人社局", region: "上海", publishDate: "2024-11-08", deadline: "2024-11-25", recruitCount: 3890, applyCount: 78650, views: 34560, status: "进行中", isHot: false, isFav: true },
  { id: 7, code: "JS2024-001", title: "江苏省2024年公务员考试公告", type: "招考公告", examType: "省考", source: "江苏省人社厅", region: "江苏", publishDate: "2024-11-05", deadline: "2024-11-15", recruitCount: 12456, applyCount: 234560, views: 45230, status: "进行中", isHot: true, isFav: false },
  { id: 8, code: "ZJ2024-001", title: "浙江省2024年选调生招录公告", type: "招考公告", examType: "选调生", source: "浙江省委组织部", region: "浙江", publishDate: "2024-10-28", deadline: "2024-11-10", recruitCount: 850, applyCount: 15680, views: 23450, status: "已结束", isHot: false, isFav: false },
  { id: 9, code: "SD2024-001", title: "山东省2024年公务员考试报名指南", type: "考试指南", examType: "省考", source: "山东省人社厅", region: "山东", publishDate: "2024-11-12", deadline: "", recruitCount: 0, applyCount: 0, views: 28960, status: "已发布", isHot: false, isFav: false },
  { id: 10, code: "SC2024-001", title: "四川省2024年三支一扶招募公告", type: "招考公告", examType: "三支一扶", source: "四川省人社厅", region: "四川", publishDate: "2024-10-25", deadline: "2024-11-05", recruitCount: 2100, applyCount: 45320, views: 19870, status: "已结束", isHot: false, isFav: false },
  { id: 11, code: "HB2024-001", title: "湖北省2024年公务员录用面试公告", type: "面试公告", examType: "省考", source: "湖北省人社厅", region: "湖北", publishDate: "2024-11-18", deadline: "2024-12-01", recruitCount: 5680, applyCount: 0, views: 15670, status: "即将开始", isHot: false, isFav: false },
  { id: 12, code: "HN2024-001", title: "河南省2024年公务员考试成绩查询入口", type: "成绩查询", examType: "省考", source: "河南省人社厅", region: "河南", publishDate: "2024-11-20", deadline: "", recruitCount: 0, applyCount: 0, views: 67890, status: "已发布", isHot: true, isFav: false },
  { id: 13, code: "GK2024-004", title: "中央机关及其直属机构2024年度考试录用公务员政策解读", type: "政策解读", examType: "国考", source: "国家公务员局", region: "全国", publishDate: "2024-10-18", deadline: "", recruitCount: 0, applyCount: 0, views: 34560, status: "已发布", isHot: false, isFav: false },
  { id: 14, code: "JD2024-001", title: "2024年军队文职人员公开招考公告", type: "招考公告", examType: "军队文职", source: "军委政治工作部", region: "全国", publishDate: "2024-10-22", deadline: "2024-11-12", recruitCount: 33806, applyCount: 568920, views: 89560, status: "进行中", isHot: true, isFav: true },
  { id: 15, code: "SX2024-001", title: "陕西省2024年事业单位公开招聘公告", type: "招考公告", examType: "事业单位", source: "陕西省人社厅", region: "陕西", publishDate: "2024-11-06", deadline: "2024-11-18", recruitCount: 2890, applyCount: 56780, views: 18920, status: "进行中", isHot: false, isFav: false },
];

type SortKey = "publishDate" | "views" | "recruitCount" | "applyCount";

// 多选下拉组件
function MultiSelect({ label, options, selected, onChange, className = "" }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };
  return (
    <div className={`relative ${className}`}>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1 text-sm border rounded transition-colors ${
          selected.length > 0 ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
        }`}>
        {label}{selected.length > 0 && <span className="px-1 py-0.5 bg-amber-500 text-white text-xs rounded">{selected.length}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[160px] max-h-[240px] overflow-y-auto">
            {options.map(opt => (
              <button key={opt} onClick={() => toggle(opt)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-slate-50 ${selected.includes(opt) ? "text-amber-600" : "text-slate-700"}`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(opt) ? "bg-amber-500 border-amber-500" : "border-slate-300"}`}>
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

export default function AnnouncementListPage() {
  // 筛选状态
  const [filters, setFilters] = useState<Record<string, string[]>>({
    type: [], examType: [], region: [], source: [], status: [],
  });
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("publishDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([1, 6, 14]);

  // 更新筛选
  const updateFilter = (key: string, val: string[]) => setFilters(prev => ({ ...prev, [key]: val }));
  const toggleQuick = (id: string) => setActiveQuickFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  // 重置筛选
  const resetFilters = () => {
    setFilters({ type: [], examType: [], region: [], source: [], status: [] });
    setActiveQuickFilters([]);
    setSearchQuery("");
  };

  // 活跃筛选数量
  const activeFilterCount = Object.values(filters).filter(v => v.length > 0).length + activeQuickFilters.length;

  // 筛选和排序数据
  const filteredData = useMemo(() => {
    let data = [...announcements];

    // 文本搜索
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(a => a.title.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.source.toLowerCase().includes(q));
    }

    // 多选筛选
    if (filters.type.length) data = data.filter(a => filters.type.includes(a.type));
    if (filters.examType.length) data = data.filter(a => filters.examType.includes(a.examType));
    if (filters.region.length) data = data.filter(a => filters.region.includes(a.region));
    if (filters.source.length) data = data.filter(a => filters.source.some(s => a.source.includes(s)));
    if (filters.status.length) data = data.filter(a => filters.status.includes(a.status));

    // 快捷筛选
    if (activeQuickFilters.includes("hot")) data = data.filter(a => a.isHot);
    if (activeQuickFilters.includes("recent")) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      data = data.filter(a => new Date(a.publishDate) >= oneWeekAgo);
    }
    if (activeQuickFilters.includes("recruiting")) data = data.filter(a => a.status === "进行中");
    if (activeQuickFilters.includes("fav")) data = data.filter(a => favorites.includes(a.id));

    // 排序
    data.sort((a, b) => {
      let aVal: number | string, bVal: number | string;
      if (sortKey === "publishDate") {
        aVal = new Date(a.publishDate).getTime();
        bVal = new Date(b.publishDate).getTime();
      } else {
        aVal = a[sortKey];
        bVal = b[sortKey];
      }
      return sortAsc ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    return data;
  }, [filters, activeQuickFilters, searchQuery, sortKey, sortAsc, favorites]);

  // 统计
  const stats = useMemo(() => ({
    total: filteredData.length,
    totalRecruit: filteredData.reduce((s, a) => s + a.recruitCount, 0),
    totalViews: filteredData.reduce((s, a) => s + a.views, 0),
    hotCount: filteredData.filter(a => a.isHot).length,
    recruiting: filteredData.filter(a => a.status === "进行中").length,
  }), [filteredData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const toggleFav = (id: number) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const typeColor = (type: string) => {
    const colors: Record<string, string> = {
      "招考公告": "bg-blue-100 text-blue-700",
      "报名通知": "bg-emerald-100 text-emerald-700",
      "时间公告": "bg-amber-100 text-amber-700",
      "考试指南": "bg-violet-100 text-violet-700",
      "政策解读": "bg-rose-100 text-rose-700",
      "成绩查询": "bg-cyan-100 text-cyan-700",
      "面试公告": "bg-orange-100 text-orange-700",
    };
    return colors[type] || "bg-slate-100 text-slate-700";
  };

  const examTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "国考": "bg-blue-100 text-blue-700",
      "省考": "bg-emerald-100 text-emerald-700",
      "事业单位": "bg-violet-100 text-violet-700",
      "选调生": "bg-amber-100 text-amber-700",
      "军队文职": "bg-slate-200 text-slate-700",
      "三支一扶": "bg-orange-100 text-orange-700",
    };
    return colors[type] || "bg-slate-100 text-slate-700";
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      "进行中": "bg-emerald-100 text-emerald-700",
      "已结束": "bg-slate-100 text-slate-500",
      "即将开始": "bg-amber-100 text-amber-700",
      "已发布": "bg-blue-50 text-blue-600",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + "万";
    if (num >= 1000) return (num / 1000).toFixed(1) + "千";
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 筛选区域 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto">
          {/* 主筛选行 */}
          <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索代码/标题/来源"
                className="w-48 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400" />
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* 主要筛选器 */}
            <MultiSelect label="公告类型" options={filterConfig.type.options} selected={filters.type} onChange={v => updateFilter("type", v)} />
            <MultiSelect label="考试类型" options={filterConfig.examType.options} selected={filters.examType} onChange={v => updateFilter("examType", v)} />
            <MultiSelect label="地区" options={filterConfig.region.options} selected={filters.region} onChange={v => updateFilter("region", v)} />
            <MultiSelect label="状态" options={filterConfig.status.options} selected={filters.status} onChange={v => updateFilter("status", v)} />

            <div className="flex-1" />

            {/* 高级筛选按钮 */}
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1 px-2 py-1 text-sm border rounded transition-colors ${
                showAdvanced ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}>
              <SlidersHorizontal className="w-4 h-4" />
              高级筛选
              {activeFilterCount > 0 && <span className="px-1 py-0.5 bg-amber-500 text-white text-xs rounded">{activeFilterCount}</span>}
            </button>

            {/* 重置 */}
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="flex items-center gap-1 px-2 py-1 text-sm text-slate-500 hover:text-slate-700">
                <RotateCcw className="w-3 h-3" />重置
              </button>
            )}

            {/* 工具按钮 */}
            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><RefreshCw className="w-4 h-4" /></button>
            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><Download className="w-4 h-4" /></button>
          </div>

          {/* 高级筛选面板 */}
          {showAdvanced && (
            <div className="border-t border-slate-100 bg-slate-50/50">
              {/* 第二行筛选器 */}
              <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">更多条件:</span>
                <MultiSelect label="发布机构" options={filterConfig.source.options} selected={filters.source} onChange={v => updateFilter("source", v)} />
              </div>

              {/* 快捷筛选 */}
              <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-100 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">快捷筛选:</span>
                {quickFilters.map(qf => (
                  <button key={qf.id} onClick={() => toggleQuick(qf.id)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${
                      activeQuickFilters.includes(qf.id)
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}>
                    <qf.icon className="w-3 h-3" />{qf.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 已选筛选标签 */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-t border-slate-100 bg-amber-50/50 flex-wrap">
              <span className="text-xs text-slate-500">已选:</span>
              {Object.entries(filters).map(([key, vals]) => vals.map(v => (
                <span key={`${key}-${v}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-700">
                  {v}
                  <button onClick={() => updateFilter(key, vals.filter(x => x !== v))} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )))}
              {activeQuickFilters.map(qf => (
                <span key={qf} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-200 rounded text-xs text-amber-700">
                  {quickFilters.find(q => q.id === qf)?.label}
                  <button onClick={() => toggleQuick(qf)} className="text-amber-400 hover:text-amber-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 数据表格 */}
      <div className="max-w-[1800px] mx-auto px-2 py-3">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-2.5 text-left font-semibold text-slate-600 border-b border-slate-200 w-8">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="px-2 py-2.5 text-left font-semibold text-slate-600 border-b border-slate-200 w-24">编号</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-slate-600 border-b border-slate-200 min-w-[280px]">公告标题</th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-600 border-b border-slate-200 w-24">类型</th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-600 border-b border-slate-200 w-24">考试</th>
                  <th className="px-2 py-2.5 text-left font-semibold text-slate-600 border-b border-slate-200 w-32">来源</th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-600 border-b border-slate-200 w-20">地区</th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-600 border-b border-slate-200 cursor-pointer hover:bg-slate-200 w-24" onClick={() => handleSort("publishDate")}>
                    <div className="flex items-center justify-center gap-1">
                      发布日期{sortKey === "publishDate" && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-600 border-b border-slate-200 w-24">截止日期</th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-600 border-b border-slate-200 cursor-pointer hover:bg-slate-200 w-20" onClick={() => handleSort("recruitCount")}>
                    <div className="flex items-center justify-center gap-1">
                      招录{sortKey === "recruitCount" && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-600 border-b border-slate-200 cursor-pointer hover:bg-slate-200 w-20" onClick={() => handleSort("views")}>
                    <div className="flex items-center justify-center gap-1">
                      浏览{sortKey === "views" && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-600 border-b border-slate-200 w-20">状态</th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-600 border-b border-slate-200 w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((a, idx) => (
                  <tr key={a.id} className={`border-b border-slate-100 hover:bg-amber-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                    <td className="px-2 py-2">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-slate-500">{a.code}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        {a.isHot && <Flame className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        {favorites.includes(a.id) && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                        <Link href={`/announcements/${a.id}`} className="font-medium text-slate-800 hover:text-amber-600 truncate" title={a.title}>
                          {a.title.length > 35 ? a.title.slice(0, 35) + "…" : a.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${typeColor(a.type)}`}>{a.type}</span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${examTypeColor(a.examType)}`}>{a.examType}</span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1 text-slate-600 text-xs">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="truncate" title={a.source}>{a.source.length > 8 ? a.source.slice(0, 8) + "…" : a.source}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-600 text-xs">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {a.region}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-600 text-xs">
                        <CalendarDays className="w-3 h-3 text-slate-400" />
                        {a.publishDate.slice(5)}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center text-xs">
                      {a.deadline ? (
                        <span className={`${new Date(a.deadline) < new Date() ? "text-slate-400" : "text-red-600 font-medium"}`}>
                          {a.deadline.slice(5)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {a.recruitCount > 0 ? (
                        <span className="font-mono font-bold text-emerald-600">{formatNumber(a.recruitCount)}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="font-mono text-slate-600">{formatNumber(a.views)}</span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor(a.status)}`}>{a.status}</span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => toggleFav(a.id)} className={`p-1 rounded transition-colors ${favorites.includes(a.id) ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}`}>
                          <Star className={`w-4 h-4 ${favorites.includes(a.id) ? "fill-current" : ""}`} />
                        </button>
                        <Link href={`/announcements/${a.id}`} className="p-1 rounded text-slate-400 hover:text-amber-600">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 底部状态栏 */}
          <div className="bg-slate-50 border-t border-slate-200 px-3 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-slate-600">
              <span>共 <b className="text-slate-800">{stats.total}</b> 条</span>
              <span>招录 <b className="text-emerald-600">{formatNumber(stats.totalRecruit)}</b> 人</span>
              <span>总浏览 <b className="text-amber-600">{formatNumber(stats.totalViews)}</b></span>
              <span>进行中 <b className="text-blue-600">{stats.recruiting}</b></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>公告实时更新</span>
              <Clock className="w-4 h-4" />
              <span>刚刚</span>
            </div>
          </div>
        </div>

        {filteredData.length === 0 && (
          <div className="bg-white p-12 text-center rounded-lg border border-slate-200 mt-3">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无符合条件的公告</h3>
            <p className="text-slate-500 mb-4">请调整筛选条件或搜索关键词</p>
            <button onClick={resetFilters} className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600">重置筛选</button>
          </div>
        )}
      </div>
    </div>
  );
}
