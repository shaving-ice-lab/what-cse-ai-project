"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  BookOpen,
  GraduationCap,
  RotateCcw,
  Play,
  Award,
  Zap,
  AlertCircle,
  Timer,
  Settings,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@what-cse/ui";
import { useAILearningPath } from "@/hooks/useAILearningPath";
import { useAuthStore } from "@/stores/authStore";
import type { LearningPath, ProgressSummary, DailyTask, LearningPhase } from "@/services/api/ai-learning";

// =====================================================
// 主组件
// =====================================================

export default function LearningPathPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    loading,
    path: apiPath,
    progressSummary: apiProgress,
    fetchLearningPath,
    fetchProgressSummary,
    generateLearningPath,
  } = useAILearningPath();

  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [localPath, setLocalPath] = useState<LearningPath | null>(null);

  // 加载学习路径数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchLearningPath();
      fetchProgressSummary();
    }
  }, [isAuthenticated, fetchLearningPath, fetchProgressSummary]);

  // 同步 API 数据到本地状态
  useEffect(() => {
    if (apiPath) {
      setLocalPath(apiPath);
    }
  }, [apiPath]);

  // 转换数据格式（兼容旧的组件接口）
  const path = localPath;
  const progress = apiProgress;

  // 完成任务
  const handleCompleteTask = (taskId: string) => {
    if (!localPath) return;

    setLocalPath({
      ...localPath,
      daily_tasks: localPath.daily_tasks.map((task) =>
        task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
      ),
    });

    toast.success("任务状态已更新");
  };

  // 刷新路径
  const handleRefreshPath = async () => {
    try {
      await generateLearningPath({
        target_exam: "国考",
        force: true,
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!path || !progress) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-stone-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>暂无学习路径</p>
        <button
          onClick={handleRefreshPath}
          className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          生成学习路径
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/learn"
                className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-stone-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-stone-800">AI 学习路径</h1>
                <p className="text-sm text-stone-500">{path.target_exam}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshPath}
                className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                title="重新生成"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 进度概览卡片 */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm text-amber-100">AI 智能规划</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{path.name}</h2>
              <p className="text-amber-100 text-sm">{path.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-100">
                <Flame className="w-5 h-5" />
                <span className="font-bold text-white">{progress.streak}</span>
                <span className="text-sm">天连续</span>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span>总体进度</span>
              <span className="font-bold">{progress.total_progress}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress.total_progress}%` }}
              />
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{progress.days_completed}</p>
              <p className="text-xs text-amber-100">已学习天数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{progress.days_remaining}</p>
              <p className="text-xs text-amber-100">剩余天数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{progress.today_completed}/{progress.today_total}</p>
              <p className="text-xs text-amber-100">今日任务</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{progress.phase_progress}%</p>
              <p className="text-xs text-amber-100">阶段进度</p>
            </div>
          </div>

          {/* 状态提示 */}
          <div className={cn(
            "mt-4 p-3 rounded-xl flex items-center gap-2 text-sm",
            progress.is_on_track ? "bg-emerald-500/20" : "bg-red-500/20"
          )}>
            {progress.is_on_track ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{progress.status_message}</span>
          </div>
        </div>

        {/* 学习阶段 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
            <Target className="w-5 h-5 text-amber-500" />
            学习阶段
          </h3>

          {/* 阶段时间轴 */}
          <div className="relative mb-6">
            <div className="flex items-center justify-between">
              {path.phases.map((phase, index) => (
                <div key={phase.id} className="flex-1 relative">
                  {/* 连接线 */}
                  {index < path.phases.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 bg-stone-200">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{
                          width: phase.is_completed ? "100%" : phase.is_current ? `${phase.progress}%` : "0%",
                        }}
                      />
                    </div>
                  )}

                  {/* 阶段节点 */}
                  <button
                    onClick={() => setActivePhaseIndex(index)}
                    className={cn(
                      "relative z-10 w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-all",
                      phase.is_completed
                        ? "bg-emerald-500 text-white"
                        : phase.is_current
                        ? "bg-amber-500 text-white ring-4 ring-amber-100"
                        : "bg-stone-200 text-stone-500"
                    )}
                  >
                    {phase.is_completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </button>

                  {/* 阶段名称 */}
                  <p
                    className={cn(
                      "text-center text-xs mt-2 transition-colors",
                      activePhaseIndex === index
                        ? "text-amber-600 font-medium"
                        : "text-stone-500"
                    )}
                  >
                    {phase.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 当前阶段详情 */}
          <div className="p-4 bg-stone-50 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-stone-800">
                  {path.phases[activePhaseIndex].name}
                </h4>
                <p className="text-sm text-stone-500">
                  第{path.phases[activePhaseIndex].start_day}天 - 第{path.phases[activePhaseIndex].end_day}天
                </p>
              </div>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  path.phases[activePhaseIndex].is_current
                    ? "bg-amber-100 text-amber-700"
                    : path.phases[activePhaseIndex].is_completed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-stone-200 text-stone-600"
                )}
              >
                {path.phases[activePhaseIndex].is_current
                  ? "进行中"
                  : path.phases[activePhaseIndex].is_completed
                  ? "已完成"
                  : "待开始"}
              </span>
            </div>

            <p className="text-sm text-stone-600 mb-4">
              {path.phases[activePhaseIndex].description}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* 阶段目标 */}
              <div>
                <h5 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4 text-amber-500" />
                  阶段目标
                </h5>
                <ul className="space-y-1">
                  {path.phases[activePhaseIndex].goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-stone-600">
                      <CheckCircle2 className="w-4 h-4 text-stone-400 mt-0.5" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 重点内容 */}
              <div>
                <h5 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  重点内容
                </h5>
                <div className="flex flex-wrap gap-2">
                  {path.phases[activePhaseIndex].focus.map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 今日任务 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800">
              <Calendar className="w-5 h-5 text-amber-500" />
              今日任务
            </h3>
            <span className="text-sm text-stone-500">
              {path.daily_tasks.filter(t => t.is_completed).length}/{path.daily_tasks.length} 已完成
            </span>
          </div>

          <div className="space-y-3">
            {path.daily_tasks.map((task) => (
              <DailyTaskCard
                key={task.id}
                task={task}
                onComplete={() => handleCompleteTask(task.id)}
              />
            ))}
          </div>
        </section>

        {/* 快捷操作 */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link
            href="/learn/weakness"
            className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-stone-800">薄弱点分析</h4>
              <p className="text-sm text-stone-500">查看 AI 分析的薄弱环节</p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </Link>

          <Link
            href="/learn/report/ability"
            className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-stone-800">能力报告</h4>
              <p className="text-sm text-stone-500">查看详细能力分析</p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </Link>
        </section>
      </main>
    </div>
  );
}

// =====================================================
// 每日任务卡片
// =====================================================

function DailyTaskCard({
  task,
  onComplete,
}: {
  task: DailyTask;
  onComplete: () => void;
}) {
  const typeConfig = {
    course: {
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      label: "课程",
    },
    practice: {
      icon: GraduationCap,
      color: "text-emerald-500",
      bgColor: "bg-emerald-100",
      label: "练习",
    },
    review: {
      icon: RotateCcw,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      label: "复习",
    },
  };

  const config = typeConfig[task.type] || typeConfig.practice;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-colors",
        task.is_completed
          ? "bg-stone-50 border-stone-200"
          : "bg-white border-stone-200 hover:border-amber-300"
      )}
    >
      {/* 完成状态 */}
      <button
        onClick={onComplete}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
          task.is_completed
            ? "bg-emerald-500 border-emerald-500"
            : "border-stone-300 hover:border-amber-500"
        )}
      >
        {task.is_completed && <CheckCircle2 className="w-4 h-4 text-white" />}
      </button>

      {/* 类型图标 */}
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bgColor)}>
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>

      {/* 任务内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              "font-medium",
              task.is_completed ? "text-stone-400 line-through" : "text-stone-800"
            )}
          >
            {task.title}
          </h4>
          {task.priority === 1 && (
            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">
              重要
            </span>
          )}
        </div>
        <p className={cn("text-sm", task.is_completed ? "text-stone-400" : "text-stone-500")}>
          {task.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("text-xs", config.color)}>{config.label}</span>
          <span className="text-xs text-stone-400">·</span>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Timer className="w-3 h-3" />
            {task.duration}分钟
          </span>
          {task.tags && task.tags.length > 0 && (
            <>
              <span className="text-xs text-stone-400">·</span>
              {task.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 开始按钮 */}
      {!task.is_completed && (
        <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
          <Play className="w-4 h-4" />
          开始
        </button>
      )}
    </div>
  );
}
