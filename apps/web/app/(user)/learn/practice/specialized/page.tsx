"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Zap,
  Flame,
  Timer,
  BookOpen,
  Brain,
  ChevronRight,
  Settings,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { cn } from "@what-cse/ui/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  practiceApi,
  PracticeTemplate,
  PracticeSession,
  PracticeSessionDetail,
  CreatePracticeSessionRequest,
  PracticeStats,
  getSessionTypeName,
  getSessionStatusName,
  getSessionStatusColor,
  getDifficultyLabel,
  getDifficultyColor,
  formatTime,
} from "@/services/api/practice";
import { courseApi, CourseCategory } from "@/services/api/course";

// 快速练习模板卡片
function QuickTemplateCard({ template, onSelect }: { template: PracticeTemplate; onSelect: () => void }) {
  const iconMap: Record<string, React.ReactNode> = {
    zap: <Zap className="w-6 h-6" />,
    target: <Target className="w-6 h-6" />,
    flame: <Flame className="w-6 h-6" />,
    brain: <Brain className="w-6 h-6" />,
    timer: <Timer className="w-6 h-6" />,
  };

  const colorMap: Record<string, string> = {
    amber: "from-amber-500 to-orange-500",
    blue: "from-blue-500 to-indigo-500",
    orange: "from-orange-500 to-red-500",
    purple: "from-purple-500 to-violet-500",
    red: "from-red-500 to-pink-500",
  };

  return (
    <button
      onClick={onSelect}
      className="group relative overflow-hidden rounded-2xl bg-white border border-stone-200/50 hover:shadow-lg transition-all text-left"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity", colorMap[template.color] || colorMap.amber)} />
      <div className="p-5">
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4", colorMap[template.color] || colorMap.amber)}>
          {iconMap[template.icon] || <Target className="w-6 h-6" />}
        </div>
        <h3 className="font-semibold text-stone-800 mb-1 group-hover:text-amber-600 transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-stone-500">{template.description}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-stone-400">
          <span>{template.config.question_count}题</span>
          {template.config.total_time_limit && (
            <>
              <span>•</span>
              <span>{Math.floor(template.config.total_time_limit / 60)}分钟</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

// 进行中的练习卡片
function ActiveSessionCard({ session, onContinue }: { session: PracticeSession; onContinue: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-4 hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className={cn("px-2 py-0.5 text-xs rounded-lg", getSessionStatusColor(session.status))}>
          {getSessionStatusName(session.status)}
        </span>
        <span className="text-xs text-stone-400">
          {new Date(session.created_at).toLocaleDateString()}
        </span>
      </div>
      <h4 className="font-medium text-stone-800 mb-2">
        {session.title || getSessionTypeName(session.session_type)}
      </h4>
      <div className="flex items-center gap-4 text-sm text-stone-500 mb-3">
        <span>{session.completed_count}/{session.total_questions}题</span>
        <span>{Math.round(session.progress)}%</span>
        {session.time_limit > 0 && (
          <span className="flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" />
            {formatTime(session.time_limit - session.total_time_spent)}
          </span>
        )}
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
          style={{ width: `${session.progress}%` }}
        />
      </div>
      <button
        onClick={onContinue}
        className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" />
        继续练习
      </button>
    </div>
  );
}

// 历史记录卡片
function SessionHistoryCard({ session }: { session: PracticeSession }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={cn("px-2 py-0.5 text-xs rounded-lg", getSessionStatusColor(session.status))}>
          {getSessionStatusName(session.status)}
        </span>
        <span className="text-xs text-stone-400">
          {new Date(session.created_at).toLocaleDateString()}
        </span>
      </div>
      <h4 className="font-medium text-stone-800 mb-2">
        {session.title || getSessionTypeName(session.session_type)}
      </h4>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-center p-2 bg-stone-50 rounded-lg">
          <div className="font-semibold text-stone-800">{session.total_questions}</div>
          <div className="text-xs text-stone-500">总题数</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="font-semibold text-green-600">{session.correct_count}</div>
          <div className="text-xs text-stone-500">正确</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="font-semibold text-blue-600">{Math.round(session.correct_rate)}%</div>
          <div className="text-xs text-stone-500">正确率</div>
        </div>
      </div>
    </div>
  );
}

// 自定义练习配置弹窗
function CustomPracticeModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: CreatePracticeSessionRequest) => void;
  categories: CourseCategory[];
}) {
  const [questionCount, setQuestionCount] = useState(20);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [smartRandom, setSmartRandom] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      session_type: selectedCategories.length > 0 ? "specialized" : "random",
      question_count: questionCount,
      category_ids: selectedCategories.length > 0 ? selectedCategories : undefined,
      difficulties: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
      smart_random: smartRandom,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-800">自定义练习</h2>
          <p className="text-sm text-stone-500 mt-1">根据需求定制专属练习</p>
        </div>

        <div className="p-6 space-y-6">
          {/* 题目数量 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">题目数量</label>
            <div className="flex gap-2">
              {[10, 20, 30, 50].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                    questionCount === count
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  {count}题
                </button>
              ))}
            </div>
          </div>

          {/* 难度选择 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">难度筛选</label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setSelectedDifficulties((prev) =>
                      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
                    );
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    selectedDifficulties.includes(diff)
                      ? getDifficultyColor(diff).replace("bg-", "bg-").replace("-100", "-500") + " text-white"
                      : getDifficultyColor(diff)
                  )}
                >
                  {getDifficultyLabel(diff)}
                </button>
              ))}
            </div>
            {selectedDifficulties.length === 0 && (
              <p className="text-xs text-stone-400 mt-1">不选择则包含所有难度</p>
            )}
          </div>

          {/* 知识点选择 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">知识点筛选</label>
            <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategories((prev) =>
                      prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                    );
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm transition-colors",
                    selectedCategories.includes(cat.id)
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-xs text-stone-400 mt-1">不选择则包含所有知识点</p>
            )}
          </div>

          {/* 智能推送 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-stone-700">智能推送</label>
              <p className="text-xs text-stone-400">根据你的薄弱点优先推送</p>
            </div>
            <button
              onClick={() => setSmartRandom(!smartRandom)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                smartRandom ? "bg-amber-500" : "bg-stone-200"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  smartRandom ? "right-1" : "left-1"
                )}
              />
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-stone-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            开始练习
          </button>
        </div>
      </div>
    </div>
  );
}

// 主页面组件
export default function SpecializedPracticePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  // 状态
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<PracticeTemplate[]>([]);
  const [activeSessions, setActiveSessions] = useState<PracticeSession[]>([]);
  const [historySessions, setHistorySessions] = useState<PracticeSession[]>([]);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // 加载数据
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesRes, activeRes, historyRes, statsRes, categoriesRes] = await Promise.all([
        practiceApi.getQuickTemplates(),
        practiceApi.getActiveSessions(),
        practiceApi.getUserSessions({ page: 1, page_size: 5 }),
        practiceApi.getPracticeStats(),
        courseApi.getCategories(),
      ]);

      setTemplates(templatesRes || []);
      setActiveSessions(activeRes || []);
      setHistorySessions(historyRes?.data?.filter(s => s.status === "completed") || []);
      setStats(statsRes);
      setCategories(categoriesRes?.categories || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 创建练习会话
  const createSession = useCallback(async (config: CreatePracticeSessionRequest) => {
    setCreating(true);
    try {
      const session = await practiceApi.createSession(config);
      if (session) {
        router.push(`/learn/practice/session/${session.id}`);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("创建练习失败，请稍后再试");
    } finally {
      setCreating(false);
      setShowCustomModal(false);
    }
  }, [router]);

  // 从模板创建会话
  const createFromTemplate = useCallback(async (template: PracticeTemplate) => {
    await createSession({
      session_type: template.session_type,
      title: template.name,
      question_count: template.config.question_count,
      smart_random: template.config.smart_random,
      total_time_limit: template.config.total_time_limit,
      show_countdown: template.config.show_countdown,
    });
  }, [createSession]);

  // 继续练习
  const continueSession = useCallback((session: PracticeSession) => {
    router.push(`/learn/practice/session/${session.id}`);
  }, [router]);

  // 未登录
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-white">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h2 className="text-xl font-semibold text-stone-800 mb-2">登录后开始练习</h2>
          <p className="text-stone-500 mb-4">记录学习进度，智能推送题目</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }

  // 加载中
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-stone-500">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* 自定义练习弹窗 */}
      <CustomPracticeModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSubmit={createSession}
        categories={categories}
      />

      {/* 创建中遮罩 */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-stone-600">正在生成题目...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回学习</span>
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">专项练习</h1>
          <p className="text-stone-500">选择练习模式，针对性提升能力</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-stone-200/50">
              <div className="text-2xl font-bold text-stone-800">{stats.total_sessions}</div>
              <div className="text-sm text-stone-500">练习次数</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-200/50">
              <div className="text-2xl font-bold text-stone-800">{stats.total_questions}</div>
              <div className="text-sm text-stone-500">累计做题</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-200/50">
              <div className="text-2xl font-bold text-green-600">{Math.round(stats.avg_correct_rate)}%</div>
              <div className="text-sm text-stone-500">正确率</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-200/50">
              <div className="text-2xl font-bold text-blue-600">{formatTime(stats.total_time_spent)}</div>
              <div className="text-sm text-stone-500">学习时长</div>
            </div>
          </div>
        )}

        {/* 进行中的练习 */}
        {activeSessions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              进行中的练习
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {activeSessions.map((session) => (
                <ActiveSessionCard
                  key={session.id}
                  session={session}
                  onContinue={() => continueSession(session)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 快速开始 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              快速开始
            </h2>
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
            >
              <Settings className="w-4 h-4" />
              自定义练习
            </button>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {templates.map((template) => (
              <QuickTemplateCard
                key={template.id}
                template={template}
                onSelect={() => createFromTemplate(template)}
              />
            ))}
          </div>
        </section>

        {/* 练习历史 */}
        {historySessions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                最近记录
              </h2>
              <Link
                href="/learn/practice/history"
                className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {historySessions.slice(0, 3).map((session) => (
                <SessionHistoryCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
