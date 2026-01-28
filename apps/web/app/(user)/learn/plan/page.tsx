"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  Trash2,
  Edit3,
  Plus,
  ChevronRight,
  Flame,
  TrendingUp,
  Award,
  Loader2,
  BookOpen,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useStudyPlan, useDailyTasks } from "@/hooks/useStudyTools";
import { useAuthStore } from "@/stores/authStore";
import { StudyPlan, StudyPlanTemplate } from "@/services/api/study-tools";

// 日期格式化
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

// 计算剩余天数
function getDaysRemaining(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

// 状态颜色
function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    case "paused":
      return "bg-amber-100 text-amber-700";
    case "abandoned":
      return "bg-stone-100 text-stone-500";
    default:
      return "bg-stone-100 text-stone-500";
  }
}

// 状态文本
function getStatusText(status: string) {
  switch (status) {
    case "active":
      return "进行中";
    case "completed":
      return "已完成";
    case "paused":
      return "已暂停";
    case "abandoned":
      return "已放弃";
    default:
      return status;
  }
}

// 当前计划卡片
function ActivePlanCard({ plan, onPause, onComplete, onEdit }: { 
  plan: StudyPlan; 
  onPause: () => void;
  onComplete: () => void;
  onEdit: () => void;
}) {
  const progress = plan.progress || 0;
  const daysRemaining = getDaysRemaining(plan.end_date);

  return (
    <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* 装饰元素 */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
      <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full" />

      <div className="relative z-10">
        {/* 顶部 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm text-white/80">当前学习计划</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{plan.title}</h2>
            {plan.exam_type && (
              <span className="text-sm text-white/80">目标：{plan.exam_type}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPause}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title={plan.status === "paused" ? "继续" : "暂停"}
            >
              {plan.status === "paused" ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button
              onClick={onEdit}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="编辑"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>学习进度</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{plan.completed_days}</div>
            <div className="text-xs text-white/80">已学习天数</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{daysRemaining}</div>
            <div className="text-xs text-white/80">剩余天数</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{plan.daily_study_time}</div>
            <div className="text-xs text-white/80">每日目标(分钟)</div>
          </div>
        </div>

        {/* 时间信息 */}
        <div className="flex items-center gap-4 text-sm text-white/80">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(plan.start_date)}</span>
          </div>
          <span>→</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(plan.end_date)}</span>
          </div>
        </div>

        {/* 完成按钮 */}
        <button
          onClick={onComplete}
          className="mt-4 w-full py-3 bg-white text-amber-600 font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          标记完成
        </button>
      </div>
    </div>
  );
}

// 今日任务组件
function TodayTasks() {
  const { tasks, stats, loading, fetchTasks, fetchStats, completeTask } = useDailyTasks();

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/50 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-800 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          今日任务
        </h3>
        {stats && (
          <span className="text-sm text-stone-500">
            {stats.completed}/{stats.total} 已完成
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-stone-500">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>今日暂无任务</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                task.is_completed
                  ? "bg-green-50 border-green-200"
                  : "bg-stone-50 border-stone-200 hover:border-amber-300"
              }`}
            >
              <button
                onClick={() => !task.is_completed && completeTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.is_completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-stone-300 hover:border-amber-500"
                }`}
              >
                {task.is_completed && <CheckCircle2 className="w-4 h-4" />}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${task.is_completed ? "text-stone-500 line-through" : "text-stone-800"}`}>
                  {task.target_content}
                </p>
                <div className="flex items-center gap-4 text-xs text-stone-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.target_time}分钟
                  </span>
                  {task.target_count > 0 && (
                    <span>目标: {task.target_count}题</span>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-lg ${
                task.is_completed ? "bg-green-100 text-green-600" : "bg-stone-200 text-stone-600"
              }`}>
                {task.task_type === "course" ? "课程" : task.task_type === "practice" ? "练习" : "复习"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 模板卡片
function TemplateCard({ template, onSelect }: { template: StudyPlanTemplate; onSelect: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-lg hover:border-amber-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-stone-800">{template.name}</h4>
          <p className="text-sm text-stone-500">{template.exam_type}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-lg ${
          template.difficulty === "easy" ? "bg-green-100 text-green-600" :
          template.difficulty === "medium" ? "bg-amber-100 text-amber-600" :
          "bg-red-100 text-red-600"
        }`}>
          {template.difficulty === "easy" ? "简单" : template.difficulty === "medium" ? "中等" : "困难"}
        </span>
      </div>
      
      {template.description && (
        <p className="text-sm text-stone-600 mb-3 line-clamp-2">{template.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {template.duration}天
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {template.daily_study_time}分钟/天
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          {template.use_count}人使用
        </span>
      </div>

      <button
        onClick={onSelect}
        className="w-full py-2.5 bg-amber-50 text-amber-600 font-medium rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        使用此模板
      </button>
    </div>
  );
}

// 创建计划对话框
function CreatePlanModal({ 
  isOpen, 
  onClose, 
  templates,
  onSelectTemplate,
  onCreateCustom 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  templates: StudyPlanTemplate[];
  onSelectTemplate: (template: StudyPlanTemplate) => void;
  onCreateCustom: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-800">创建学习计划</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* 自定义创建 */}
          <button
            onClick={onCreateCustom}
            className="w-full p-4 mb-6 border-2 border-dashed border-stone-300 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all flex items-center justify-center gap-3 text-stone-600 hover:text-amber-600"
          >
            <Plus className="w-6 h-6" />
            <span className="font-medium">自定义创建计划</span>
          </button>

          {/* 模板列表 */}
          <h3 className="font-semibold text-stone-800 mb-4">或选择计划模板</h3>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-stone-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无可用模板</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => onSelectTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudyPlanPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    loading,
    error,
    activePlan,
    plans,
    templates,
    fetchActivePlan,
    fetchPlans,
    fetchTemplates,
    createFromTemplate,
    updateStatus,
  } = useStudyPlan();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchActivePlan();
      fetchPlans({ page: 1, page_size: 10 });
      fetchTemplates();
    }
  }, [isAuthenticated, fetchActivePlan, fetchPlans, fetchTemplates]);

  // 处理模板选择
  const handleSelectTemplate = async (template: StudyPlanTemplate) => {
    try {
      const startDate = new Date();
      await createFromTemplate({
        template_id: template.id,
        start_date: startDate.toISOString().split("T")[0],
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create plan from template:", err);
    }
  };

  // 处理暂停/继续
  const handlePauseResume = async () => {
    if (!activePlan) return;
    const newStatus = activePlan.status === "paused" ? "active" : "paused";
    await updateStatus(activePlan.id, newStatus);
  };

  // 处理完成
  const handleComplete = async () => {
    if (!activePlan) return;
    if (confirm("确定要标记此计划为已完成吗？")) {
      await updateStatus(activePlan.id, "completed");
    }
  };

  // 未登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 mb-2">请先登录</h2>
            <p className="text-stone-500 mb-6">登录后即可创建和管理学习计划</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 头部 */}
        <div className="mb-8">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 text-stone-500 hover:text-amber-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习中心
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-amber-500" />
                学习计划
              </h1>
              <p className="text-stone-500 mt-1">制定计划，高效备考</p>
            </div>
            {!activePlan && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                创建计划
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 当前计划 */}
            {activePlan ? (
              <>
                <ActivePlanCard
                  plan={activePlan}
                  onPause={handlePauseResume}
                  onComplete={handleComplete}
                  onEdit={() => {}}
                />
                <TodayTasks />
              </>
            ) : (
              /* 无计划时的提示 */
              <div className="bg-white rounded-2xl border border-stone-200/50 p-8 text-center">
                <Sparkles className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                <h3 className="text-xl font-semibold text-stone-800 mb-2">还没有学习计划</h3>
                <p className="text-stone-500 mb-6">创建一个学习计划，让备考更有条理</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  创建学习计划
                </button>
              </div>
            )}

            {/* 历史计划 */}
            {plans.filter(p => p.id !== activePlan?.id).length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200/50 p-6">
                <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  历史计划
                </h3>
                <div className="space-y-3">
                  {plans
                    .filter(p => p.id !== activePlan?.id)
                    .map((plan) => (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                      >
                        <div>
                          <h4 className="font-medium text-stone-800">{plan.title}</h4>
                          <p className="text-sm text-stone-500">
                            {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs rounded-lg ${getStatusColor(plan.status)}`}>
                            {getStatusText(plan.status)}
                          </span>
                          <span className="text-sm text-stone-500">
                            {Math.round(plan.progress)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 创建计划对话框 */}
        <CreatePlanModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          templates={templates}
          onSelectTemplate={handleSelectTemplate}
          onCreateCustom={() => {
            // TODO: 跳转到自定义创建页面
            setShowCreateModal(false);
          }}
        />
      </div>
    </div>
  );
}
