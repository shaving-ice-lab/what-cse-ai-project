"use client";

import { useState, useEffect } from "react";
import { 
  Trophy,
  ChevronRight,
  ThumbsUp,
  Plus,
  TrendingUp,
  Users,
  Award,
  Medal,
  Loader2,
  X,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import { toolsApi, ScoreShare, ScoreShareQueryParams, ScoreStatistics, ScoreShareRequest } from "@/services/api";

export default function ScoreSharePage() {
  const [activeTab, setActiveTab] = useState<"list" | "ranking" | "stats">("list");
  const [shares, setShares] = useState<ScoreShare[]>([]);
  const [rankings, setRankings] = useState<ScoreShare[]>([]);
  const [statistics, setStatistics] = useState<ScoreStatistics | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState<ScoreShareQueryParams>({
    exam_type: "",
    exam_year: new Date().getFullYear(),
    exam_province: "",
    page: 1,
    page_size: 20,
  });

  const examTypes = ["全部", "国考", "省考", "事业单位"];
  const years = [2026, 2025, 2024, 2023, 2022];
  const provinces = [
    "全部", "北京", "上海", "广东", "江苏", "浙江", "山东", "河南", "四川", "湖北", "湖南",
    "河北", "福建", "安徽", "陕西", "辽宁", "云南", "广西", "山西", "贵州", "江西"
  ];
  const passStatuses = [
    { value: "", label: "全部" },
    { value: "进面", label: "进面" },
    { value: "未进", label: "未进" },
    { value: "待定", label: "待定" },
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "list") {
          const response = await toolsApi.scores.list({
            ...filters,
            exam_type: filters.exam_type === "全部" ? "" : filters.exam_type,
            exam_province: filters.exam_province === "全部" ? "" : filters.exam_province,
          });
          setShares(response.shares || []);
          setTotal(response.total);
        } else if (activeTab === "ranking") {
          const response = await toolsApi.scores.getRanking(
            filters.exam_type === "全部" ? "" : filters.exam_type,
            filters.exam_year,
            filters.exam_province === "全部" ? "" : filters.exam_province,
            filters.page,
            filters.page_size
          );
          setRankings(response.rankings || []);
          setTotal(response.total);
        } else {
          const stats = await toolsApi.scores.getStatistics(
            filters.exam_type === "全部" ? "" : filters.exam_type,
            filters.exam_year,
            filters.exam_province === "全部" ? "" : filters.exam_province
          );
          setStatistics(stats);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, filters]);

  const handleLike = async (id: number) => {
    try {
      await toolsApi.scores.like(id);
      // Update local state
      setShares((prev) =>
        prev.map((s) => (s.id === id ? { ...s, like_count: s.like_count + 1 } : s))
      );
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50" };
    if (index === 1) return { icon: Medal, color: "text-gray-400", bg: "bg-gray-50" };
    if (index === 2) return { icon: Award, color: "text-amber-600", bg: "bg-amber-50" };
    return null;
  };

  const totalPages = Math.ceil(total / (filters.page_size || 20));

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-center gap-2 text-amber-200 text-sm mb-2">
            <a href="/tools" className="hover:text-white">考试工具箱</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">成绩晒分</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">成绩晒分</h1>
                <p className="text-amber-100 mt-1">分享成绩，查看排行榜</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 rounded-xl font-medium hover:bg-amber-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              晒分
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-stone-200 w-fit">
          {[
            { key: "list", label: "晒分列表", icon: Users },
            { key: "ranking", label: "分数排行", icon: TrendingUp },
            { key: "stats", label: "数据统计", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-amber-500 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Exam Type */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">考试类型：</span>
              <div className="flex gap-1">
                {examTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilters((f) => ({ ...f, exam_type: type, page: 1 }))}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filters.exam_type === type || (type === "全部" && !filters.exam_type)
                        ? "bg-amber-500 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Year */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">年份：</span>
              <select
                value={filters.exam_year}
                onChange={(e) => setFilters((f) => ({ ...f, exam_year: Number(e.target.value), page: 1 }))}
                className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:border-amber-500 outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">省份：</span>
              <select
                value={filters.exam_province}
                onChange={(e) => setFilters((f) => ({ ...f, exam_province: e.target.value, page: 1 }))}
                className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:border-amber-500 outline-none"
              >
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : activeTab === "stats" && statistics ? (
          // Statistics View
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <p className="text-sm text-stone-500 mb-1">晒分人数</p>
              <p className="text-3xl font-bold text-stone-800">{statistics.total_count}</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <p className="text-sm text-stone-500 mb-1">行测平均分</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.avg_xingce?.toFixed(1) || "-"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <p className="text-sm text-stone-500 mb-1">申论平均分</p>
              <p className="text-3xl font-bold text-emerald-600">{statistics.avg_shenlun?.toFixed(1) || "-"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <p className="text-sm text-stone-500 mb-1">总分平均</p>
              <p className="text-3xl font-bold text-amber-600">{statistics.avg_total?.toFixed(1) || "-"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <p className="text-sm text-stone-500 mb-1">行测最高分</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.max_xingce?.toFixed(1) || "-"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <p className="text-sm text-stone-500 mb-1">申论最高分</p>
              <p className="text-3xl font-bold text-emerald-600">{statistics.max_shenlun?.toFixed(1) || "-"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <p className="text-sm text-stone-500 mb-1">总分最高</p>
              <p className="text-3xl font-bold text-amber-600">{statistics.max_total?.toFixed(1) || "-"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <p className="text-sm text-stone-500 mb-1">进面率</p>
              <p className="text-3xl font-bold text-purple-600">{statistics.pass_rate?.toFixed(1) || "0"}%</p>
            </div>

            {/* Distribution */}
            {statistics.distribution && statistics.distribution.length > 0 && (
              <div className="md:col-span-2 lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-4">分数分布</h3>
                <div className="space-y-3">
                  {statistics.distribution.map((dist) => (
                    <div key={dist.range} className="flex items-center gap-4">
                      <span className="w-24 text-sm text-stone-600">{dist.range}</span>
                      <div className="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                          style={{ width: `${dist.percent}%` }}
                        />
                      </div>
                      <span className="w-20 text-sm text-stone-600 text-right">
                        {dist.count}人 ({dist.percent.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // List / Ranking View
          <>
            {(activeTab === "list" ? shares : rankings).length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                <Trophy className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">暂无晒分数据</p>
                <p className="text-sm text-stone-400 mt-1">快来晒出你的成绩吧</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(activeTab === "list" ? shares : rankings).map((share, index) => {
                  const rankBadge = activeTab === "ranking" ? getRankBadge(index) : null;
                  return (
                    <div
                      key={share.id}
                      className="bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all p-5"
                    >
                      <div className="flex items-start gap-4">
                        {/* Rank Badge */}
                        {activeTab === "ranking" && (
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            rankBadge ? rankBadge.bg : "bg-stone-100"
                          }`}>
                            {rankBadge ? (
                              <rankBadge.icon className={`w-5 h-5 ${rankBadge.color}`} />
                            ) : (
                              <span className="text-stone-500">{index + 1}</span>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-stone-800">{share.nickname}</span>
                            {share.is_verified && (
                              <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-md">
                              {share.exam_type}
                            </span>
                            <span className="text-xs text-stone-400">
                              {share.exam_year}年 {share.exam_province}
                            </span>
                          </div>

                          {/* Scores */}
                          <div className="flex flex-wrap gap-4 mb-3">
                            {share.xingce_score && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-stone-500">行测:</span>
                                <span className="text-lg font-bold text-blue-600">{share.xingce_score}</span>
                              </div>
                            )}
                            {share.shenlun_score && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-stone-500">申论:</span>
                                <span className="text-lg font-bold text-emerald-600">{share.shenlun_score}</span>
                              </div>
                            )}
                            {share.total_score && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-stone-500">总分:</span>
                                <span className="text-lg font-bold text-amber-600">{share.total_score}</span>
                              </div>
                            )}
                            {share.pass_status && (
                              <span className={`px-2 py-0.5 text-xs rounded-md ${
                                share.pass_status === "进面" 
                                  ? "bg-emerald-100 text-emerald-700" 
                                  : share.pass_status === "未进"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-stone-100 text-stone-600"
                              }`}>
                                {share.pass_status}
                              </span>
                            )}
                          </div>

                          {/* Position */}
                          {share.position_name && (
                            <p className="text-sm text-stone-500 mb-2">
                              报考职位：{share.position_name}
                            </p>
                          )}

                          {/* Comment */}
                          {share.comment && (
                            <p className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3">
                              "{share.comment}"
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => handleLike(share.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm">{share.like_count}</span>
                          </button>
                          <span className="text-xs text-stone-400">
                            {new Date(share.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                  disabled={filters.page === 1}
                  className="px-4 py-2 text-sm rounded-lg border border-stone-200 hover:border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-sm text-stone-600">
                  {filters.page} / {totalPages}
                </span>
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, (f.page || 1) + 1) }))}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 text-sm rounded-lg border border-stone-200 hover:border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Modal */}
      {showModal && <ShareModal onClose={() => setShowModal(false)} onSuccess={() => {
        setShowModal(false);
        setFilters((f) => ({ ...f })); // Refresh
      }} />}
    </div>
  );
}

// Share Modal Component
function ShareModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ScoreShareRequest>({
    exam_type: "国考",
    exam_year: new Date().getFullYear(),
    exam_province: "",
    is_anonymous: true,
    nickname: "",
  });

  const handleSubmit = async () => {
    if (!form.xingce_score && !form.shenlun_score && !form.total_score) {
      alert("请至少填写一项分数");
      return;
    }

    setLoading(true);
    try {
      await toolsApi.scores.create(form);
      onSuccess();
    } catch (error) {
      console.error("Failed to create share:", error);
      alert("提交失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800">晒出我的成绩</h2>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg">
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Exam Type */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">考试类型 *</label>
              <select
                value={form.exam_type}
                onChange={(e) => setForm((f) => ({ ...f, exam_type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 outline-none"
              >
                <option value="国考">国考</option>
                <option value="省考">省考</option>
                <option value="事业单位">事业单位</option>
              </select>
            </div>

            {/* Year & Province */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">考试年份 *</label>
                <select
                  value={form.exam_year}
                  onChange={(e) => setForm((f) => ({ ...f, exam_year: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 outline-none"
                >
                  {[2026, 2025, 2024, 2023, 2022].map((y) => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">考试省份</label>
                <input
                  type="text"
                  value={form.exam_province}
                  onChange={(e) => setForm((f) => ({ ...f, exam_province: e.target.value }))}
                  placeholder="如：广东"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">行测分数</label>
                <input
                  type="number"
                  value={form.xingce_score || ""}
                  onChange={(e) => setForm((f) => ({ ...f, xingce_score: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="0-100"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 outline-none text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">申论分数</label>
                <input
                  type="number"
                  value={form.shenlun_score || ""}
                  onChange={(e) => setForm((f) => ({ ...f, shenlun_score: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="0-100"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 outline-none text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">总分</label>
                <input
                  type="number"
                  value={form.total_score || ""}
                  onChange={(e) => setForm((f) => ({ ...f, total_score: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="0-200"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 outline-none text-center"
                />
              </div>
            </div>

            {/* Pass Status */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">进面状态</label>
              <div className="flex gap-2">
                {["进面", "未进", "待定"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setForm((f) => ({ ...f, pass_status: status }))}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      form.pass_status === status
                        ? status === "进面" ? "bg-emerald-500 text-white" : status === "未进" ? "bg-red-500 text-white" : "bg-stone-500 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">报考职位</label>
              <input
                type="text"
                value={form.position_name}
                onChange={(e) => setForm((f) => ({ ...f, position_name: e.target.value }))}
                placeholder="可选填"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">心得感想</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="可选填，分享你的备考经验"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 outline-none resize-none"
              />
            </div>

            {/* Anonymous */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_anonymous}
                  onChange={(e) => setForm((f) => ({ ...f, is_anonymous: e.target.checked }))}
                  className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">匿名展示</span>
              </label>
              {!form.is_anonymous && (
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  placeholder="展示昵称"
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-stone-200 focus:border-amber-500 outline-none"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
              提交晒分
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
