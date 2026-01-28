"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Search,
  Loader2,
  RefreshCcw,
  Trash2,
  BookOpen,
  TrendingUp,
  Target,
  Brain,
  RotateCcw,
  CheckCheck,
  X,
  Edit3,
  Sparkles,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Globe,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import {
  WrongQuestion,
  WrongQuestionStats,
  WrongQuestionQueryParams,
  getWrongQuestions,
  getWrongQuestionStats,
  getNeedReviewQuestions,
  markAsMastered,
  removeWrongQuestion,
  restoreWrongQuestion,
  updateWrongQuestionNote,
  updateWrongQuestionReason,
  batchMarkAsMastered,
  exportWrongQuestions,
  ExportFormat,
  ERROR_REASONS,
} from "@/services/api/study-note";

// 状态标签映射
const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "待复习", color: "bg-amber-100 text-amber-700" },
  mastered: { label: "已掌握", color: "bg-green-100 text-green-700" },
  removed: { label: "已移除", color: "bg-stone-100 text-stone-500" },
};

// 统计卡片组件
function StatCard({ icon: Icon, label, value, color, subValue }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  subValue?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-5 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-stone-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-stone-800">{value}</div>
      {subValue && <div className="text-xs text-stone-400 mt-1">{subValue}</div>}
    </div>
  );
}

// 导出格式选项
const EXPORT_FORMATS: { value: ExportFormat; label: string; icon: React.ElementType; description: string }[] = [
  { value: "csv", label: "CSV 表格", icon: FileSpreadsheet, description: "适合用 Excel 打开分析" },
  { value: "markdown", label: "Markdown", icon: FileText, description: "适合笔记软件导入" },
  { value: "html", label: "HTML 网页", icon: Globe, description: "可打印的精美页面" },
  { value: "json", label: "JSON 数据", icon: FileCode, description: "原始数据备份" },
];

// 导出弹窗组件
function ExportModal({
  isOpen,
  onClose,
  onExport,
  stats,
}: {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, options: { includeNote: boolean; includeStats: boolean }) => void;
  stats: WrongQuestionStats | null;
}) {
  const [format, setFormat] = useState<ExportFormat>("html");
  const [includeNote, setIncludeNote] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport(format, { includeNote, includeStats });
      onClose();
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-500" />
              导出错题本
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            将错题导出到本地，方便复习打印
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">选择导出格式</label>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FORMATS.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      format === f.value
                        ? "border-amber-500 bg-amber-50"
                        : "border-stone-200 hover:border-amber-300"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${format === f.value ? "text-amber-600" : "text-stone-400"}`} />
                    <div className={`font-medium ${format === f.value ? "text-amber-700" : "text-stone-700"}`}>
                      {f.label}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">{f.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">导出选项</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNote}
                  onChange={(e) => setIncludeNote(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">包含我的笔记和错误原因</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">包含统计信息</span>
              </label>
            </div>
          </div>

          {/* Preview Info */}
          {stats && (
            <div className="p-4 bg-stone-50 rounded-xl">
              <div className="text-sm text-stone-600">
                即将导出 <span className="font-bold text-amber-600">{stats.active_count}</span> 道待复习错题
              </div>
              <div className="text-xs text-stone-400 mt-1">
                已掌握 {stats.mastered_count} 道 | 总计 {stats.total_count} 道
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                开始导出
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// 错题卡片组件
function WrongQuestionCard({
  wrong,
  onMarkMastered,
  onRemove,
  onRestore,
  onUpdateNote,
  onUpdateReason,
}: {
  wrong: WrongQuestion;
  onMarkMastered: (id: number) => void;
  onRemove: (id: number) => void;
  onRestore: (id: number) => void;
  onUpdateNote: (id: number, note: string) => void;
  onUpdateReason: (id: number, reason: string) => void;
}) {
  const [showNote, setShowNote] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [note, setNote] = useState(wrong.user_note || "");
  const [reason, setReason] = useState(wrong.error_reason || "");

  const question = wrong.question;

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${statusLabels[wrong.status]?.color || "bg-stone-100"}`}>
            {statusLabels[wrong.status]?.label || wrong.status}
          </div>
          {wrong.category_name && (
            <span className="text-sm text-stone-500">{wrong.category_name}</span>
          )}
          {wrong.error_reason && (
            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded">
              {wrong.error_reason}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span>错{wrong.wrong_count}次</span>
          {wrong.correct_count > 0 && (
            <span className="text-green-600">对{wrong.correct_count}次</span>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="p-4">
        {question && (
          <>
            <div
              className="prose prose-sm max-w-none text-stone-700 mb-4"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />

            {/* Options */}
            {question.options && question.options.length > 0 && (
              <div className="space-y-2 mb-4">
                {question.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-stone-50 rounded-lg text-sm text-stone-600"
                  >
                    <span className="font-medium mr-2">{opt.key}.</span>
                    {opt.content}
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* User Note */}
        {wrong.user_note && !showNote && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
            <span className="font-medium">笔记：</span>
            {wrong.user_note}
          </div>
        )}

        {/* Note Editor */}
        {showNote && (
          <div className="mt-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加笔记，帮助记忆..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowNote(false)}
                className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onUpdateNote(wrong.id, note);
                  setShowNote(false);
                }}
                className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                保存
              </button>
            </div>
          </div>
        )}

        {/* Reason Selector */}
        {showReason && (
          <div className="mt-4">
            <div className="text-sm font-medium text-stone-600 mb-2">选择错误原因：</div>
            <div className="flex flex-wrap gap-2">
              {ERROR_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setReason(r);
                    onUpdateReason(wrong.id, r);
                    setShowReason(false);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    reason === r
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReason(false)}
              className="mt-2 text-sm text-stone-500 hover:text-stone-700"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
        <div className="text-xs text-stone-400">
          首次做错: {new Date(wrong.first_wrong_at).toLocaleDateString()}
          {wrong.next_review_at && (
            <span className="ml-3">
              下次复习: {new Date(wrong.next_review_at).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {wrong.status === "active" && (
            <>
              <button
                onClick={() => setShowNote(true)}
                className="p-2 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="添加笔记"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowReason(true)}
                className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="标记原因"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMarkMastered(wrong.id)}
                className="p-2 text-stone-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="标记已掌握"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRemove(wrong.id)}
                className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="移除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          {wrong.status === "removed" && (
            <button
              onClick={() => onRestore(wrong.id)}
              className="p-2 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="恢复"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <Link
            href={`/learn/practice/question/${wrong.question_id}`}
            className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-1"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            重做
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MistakesPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WrongQuestionStats | null>(null);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [needReview, setNeedReview] = useState<WrongQuestion[]>([]);

  // Filters
  const [params, setParams] = useState<WrongQuestionQueryParams>({
    page: 1,
    page_size: 10,
    status: "active",
  });
  const [keyword, setKeyword] = useState("");

  // Selected items for batch operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [statsRes, questionsRes, needReviewRes] = await Promise.all([
        getWrongQuestionStats(),
        getWrongQuestions(params),
        getNeedReviewQuestions(5),
      ]);

      setStats(statsRes);
      setWrongQuestions(questionsRes.items || []);
      setTotal(questionsRes.total);
      setNeedReview(needReviewRes || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [token, params]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Handlers
  const handleSearch = () => {
    setParams((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const handleMarkMastered = async (id: number) => {
    try {
      await markAsMastered(id);
      fetchData();
    } catch (error) {
      console.error("Failed to mark as mastered:", error);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeWrongQuestion(id);
      fetchData();
    } catch (error) {
      console.error("Failed to remove:", error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreWrongQuestion(id);
      fetchData();
    } catch (error) {
      console.error("Failed to restore:", error);
    }
  };

  const handleUpdateNote = async (id: number, note: string) => {
    try {
      await updateWrongQuestionNote(id, note);
      fetchData();
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleUpdateReason = async (id: number, reason: string) => {
    try {
      await updateWrongQuestionReason(id, reason);
      fetchData();
    } catch (error) {
      console.error("Failed to update reason:", error);
    }
  };

  const handleBatchMastered = async () => {
    if (selectedIds.length === 0) return;
    try {
      await batchMarkAsMastered(selectedIds);
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      console.error("Failed to batch mark as mastered:", error);
    }
  };

  const handleExport = async (format: ExportFormat, options: { includeNote: boolean; includeStats: boolean }) => {
    try {
      await exportWrongQuestions({
        format,
        status: "active", // Export active questions by default
        include_note: options.includeNote,
        include_stats: options.includeStats,
      });
    } catch (error) {
      console.error("Failed to export:", error);
      alert("导出失败，请稍后重试");
    }
  };

  // Require auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <h2 className="text-xl font-bold text-stone-800 mb-2">请先登录</h2>
          <p className="text-stone-500 mb-6">登录后可查看您的错题本</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
          >
            立即登录
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        stats={stats}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
            <Link href="/learn" className="hover:text-amber-600">
              学习中心
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>错题本</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              我的错题本
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
              {needReview.length > 0 && (
                <Link
                  href="/learn/practice/review"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  开始复习 ({stats?.need_review_count || needReview.length})
                </Link>
              )}
            </div>
          </div>
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={AlertCircle}
                  label="待复习"
                  value={stats.active_count}
                  color="bg-amber-100 text-amber-600"
                  subValue={`今日新增 ${stats.today_new_count}`}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="已掌握"
                  value={stats.mastered_count}
                  color="bg-green-100 text-green-600"
                />
                <StatCard
                  icon={Brain}
                  label="需要复习"
                  value={stats.need_review_count}
                  color="bg-purple-100 text-purple-600"
                  subValue="基于遗忘曲线"
                />
                <StatCard
                  icon={Target}
                  label="错题总数"
                  value={stats.total_count}
                  color="bg-blue-100 text-blue-600"
                />
              </div>
            )}

            {/* Need Review Section */}
            {needReview.length > 0 && (
              <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-purple-800 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    今日待复习
                  </h2>
                  <Link
                    href="/learn/practice/review"
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    全部复习 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {needReview.slice(0, 5).map((wrong) => (
                    <Link
                      key={wrong.id}
                      href={`/learn/practice/question/${wrong.question_id}`}
                      className="flex-shrink-0 px-4 py-2 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
                    >
                      <div className="text-xs text-purple-600 mb-1">
                        {wrong.category_name || "未分类"}
                      </div>
                      <div className="text-sm text-stone-700 line-clamp-1 max-w-[200px]">
                        {wrong.question?.content?.replace(/<[^>]*>/g, "").slice(0, 30)}...
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-stone-200/50 shadow-card p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="搜索题目内容..."
                    className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={params.status || ""}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                      page: 1,
                    }))
                  }
                  className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">全部状态</option>
                  <option value="active">待复习</option>
                  <option value="mastered">已掌握</option>
                  <option value="removed">已移除</option>
                </select>

                {/* Error Reason Filter */}
                <select
                  value={params.error_reason || ""}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      error_reason: e.target.value,
                      page: 1,
                    }))
                  }
                  className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">全部原因</option>
                  {ERROR_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={`${params.sort_by || "last_wrong_at"}-${params.sort_order || "desc"}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setParams((prev) => ({
                      ...prev,
                      sort_by: sortBy as any,
                      sort_order: sortOrder as any,
                      page: 1,
                    }));
                  }}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="last_wrong_at-desc">最近做错</option>
                  <option value="wrong_count-desc">错误最多</option>
                  <option value="created_at-desc">最新添加</option>
                  <option value="next_review_at-asc">待复习优先</option>
                </select>

                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  搜索
                </button>
              </div>

              {/* Batch Operations */}
              {selectedIds.length > 0 && (
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-4">
                  <span className="text-sm text-stone-500">
                    已选择 {selectedIds.length} 道题
                  </span>
                  <button
                    onClick={handleBatchMastered}
                    className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    批量标记已掌握
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    取消选择
                  </button>
                </div>
              )}
            </div>

            {/* Error Reason Stats */}
            {stats && stats.error_reason_stats && stats.error_reason_stats.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-200/50 shadow-card p-4 mb-6">
                <h3 className="text-sm font-medium text-stone-600 mb-3">错误原因分布</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.error_reason_stats.map((stat) => (
                    <button
                      key={stat.reason}
                      onClick={() =>
                        setParams((prev) => ({
                          ...prev,
                          error_reason: stat.reason,
                          page: 1,
                        }))
                      }
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        params.error_reason === stat.reason
                          ? "bg-red-50 border-red-200 text-red-600"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {stat.reason} ({stat.count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Questions List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : wrongQuestions.length > 0 ? (
              <div className="space-y-4">
                {wrongQuestions.map((wrong) => (
                  <WrongQuestionCard
                    key={wrong.id}
                    wrong={wrong}
                    onMarkMastered={handleMarkMastered}
                    onRemove={handleRemove}
                    onRestore={handleRestore}
                    onUpdateNote={handleUpdateNote}
                    onUpdateReason={handleUpdateReason}
                  />
                ))}

                {/* Pagination */}
                {total > params.page_size! && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() =>
                        setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                      }
                      disabled={params.page === 1}
                      className="px-4 py-2 border border-stone-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                    >
                      上一页
                    </button>
                    <span className="px-4 py-2 text-sm text-stone-500">
                      {params.page} / {Math.ceil(total / params.page_size!)}
                    </span>
                    <button
                      onClick={() =>
                        setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                      }
                      disabled={params.page! >= Math.ceil(total / params.page_size!)}
                      className="px-4 py-2 border border-stone-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                <h3 className="text-lg font-medium text-stone-600 mb-2">暂无错题</h3>
                <p className="text-stone-400 mb-6">
                  去做题吧，做错的题目会自动加入错题本
                </p>
                <Link
                  href="/learn/practice"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                >
                  开始做题
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
