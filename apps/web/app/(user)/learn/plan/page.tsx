"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Pause,
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
  Zap,
  BookMarked,
  GraduationCap,
  Timer,
  BarChart3,
  Star,
  Trophy,
  CalendarDays,
  ArrowUpRight,
  Rocket,
  Brain,
  FileText,
  Users,
  ChevronDown,
  X,
} from "lucide-react";
import { useStudyPlan, useDailyTasks, useStudyTime } from "@/hooks/useStudyTools";
import { useAuthStore } from "@/stores/authStore";
import { StudyPlan, StudyPlanTemplate } from "@/services/api/study-tools";
import { motion, AnimatePresence } from "framer-motion";

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

// 获取问候语
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 9) return "早安";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
}

// 励志名言
const motivationalQuotes = [
  { text: "千里之行，始于足下", author: "老子" },
  { text: "业精于勤，荒于嬉", author: "韩愈" },
  { text: "学如逆水行舟，不进则退", author: "《增广贤文》" },
  { text: "宝剑锋从磨砺出，梅花香自苦寒来", author: "《警世贤文》" },
  { text: "天道酬勤，功不唐捐", author: "民间谚语" },
];

// 获取随机名言
function getRandomQuote() {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

// 考试类型配置
const examTypes = [
  { id: "guokao", name: "国考", icon: GraduationCap, color: "from-rose-500 to-pink-600" },
  { id: "shengkao", name: "省考", icon: BookMarked, color: "from-blue-500 to-indigo-600" },
  { id: "shiye", name: "事业编", icon: FileText, color: "from-emerald-500 to-teal-600" },
  { id: "other", name: "其他", icon: Star, color: "from-amber-500 to-orange-600" },
];

// 模板难度配置
const difficultyConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  easy: { label: "轻松", color: "text-green-600", bgColor: "bg-green-100" },
  medium: { label: "适中", color: "text-amber-600", bgColor: "bg-amber-100" },
  hard: { label: "挑战", color: "text-red-600", bgColor: "bg-red-100" },
};

// ====================================================================
// 组件：当前计划卡片
// ====================================================================
function ActivePlanCard({ 
  plan, 
  onPause, 
  onComplete, 
  onEdit 
}: { 
  plan: StudyPlan; 
  onPause: () => void;
  onComplete: () => void;
  onEdit: () => void;
}) {
  const progress = plan.progress || 0;
  const daysRemaining = getDaysRemaining(plan.end_date);
  const totalDays = plan.total_days || 30;
  const completedDays = plan.completed_days || 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 md:p-8 text-white shadow-2xl"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
        {/* 网格纹理 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgY3g9IjIwIiBjeT0iMjAiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      <div className="relative z-10">
        {/* 顶部：标题与操作 */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-white/80">当前学习计划</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                plan.status === 'active' ? 'bg-green-400/30 text-green-100' : 'bg-amber-400/30 text-amber-100'
              }`}>
                {getStatusText(plan.status)}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{plan.title}</h2>
            {plan.exam_type && (
              <div className="flex items-center gap-2 text-white/70">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">目标：{plan.exam_type}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors text-sm font-medium"
            >
              {plan.status === "paused" ? (
                <>
                  <Play className="w-4 h-4" />
                  <span className="hidden md:inline">继续</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="hidden md:inline">暂停</span>
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* 进度环形图 + 统计数据 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* 左侧：进度环 */}
          <div className="flex items-center justify-center md:justify-start">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.83} 283`}
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${progress * 2.83} 283` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{Math.round(progress)}%</span>
                <span className="text-xs text-white/70">总进度</span>
              </div>
            </div>
          </div>

          {/* 右侧：统计数据 */}
          <div className="md:col-span-2 grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-white/20">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{completedDays}</div>
              <div className="text-xs text-white/70">已学习天数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-white/20">
                <Timer className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{daysRemaining}</div>
              <div className="text-xs text-white/70">剩余天数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-white/20">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{plan.daily_study_time}</div>
              <div className="text-xs text-white/70">每日目标(分钟)</div>
            </div>
          </div>
        </div>

        {/* 时间线 */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between text-sm text-white/80 mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(plan.start_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(plan.end_date)}
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedDays / totalDays) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/learn/practice"
            className="flex-1 py-3 px-6 bg-white text-amber-600 font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Zap className="w-5 h-5" />
            开始今日学习
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            className="py-3 px-6 bg-white/20 backdrop-blur-sm font-medium rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            标记完成
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ====================================================================
// 组件：今日任务
// ====================================================================
function TodayTasks() {
  const { tasks, stats, loading, fetchTasks, fetchStats, completeTask } = useDailyTasks();

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/50 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  const completedCount = stats?.completed || 0;
  const totalCount = stats?.total || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-stone-200/50 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">今日任务</h3>
            <p className="text-sm text-stone-500">{completedCount}/{totalCount} 已完成</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm font-medium text-stone-600">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 mb-3">
            <Calendar className="w-8 h-8 text-stone-400" />
          </div>
          <p className="text-stone-500">今日暂无任务</p>
          <p className="text-sm text-stone-400">根据计划自动生成每日任务</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                task.is_completed
                  ? "bg-green-50 border-green-200"
                  : "bg-stone-50 border-stone-200 hover:border-amber-300 hover:shadow-sm"
              }`}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !task.is_completed && completeTask(task.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.is_completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-stone-300 hover:border-amber-500"
                }`}
              >
                {task.is_completed && <CheckCircle2 className="w-4 h-4" />}
              </motion.button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${task.is_completed ? "text-stone-500 line-through" : "text-stone-800"}`}>
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
              <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg ${
                task.is_completed ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
              }`}>
                {task.task_type === "course" ? "课程" : task.task_type === "practice" ? "练习" : "复习"}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ====================================================================
// 组件：学习统计卡片
// ====================================================================
function StudyStatsCard() {
  const { weeklyStats, fetchWeeklyStats } = useStudyTime();
  
  useEffect(() => {
    fetchWeeklyStats();
  }, [fetchWeeklyStats]);

  const totalHours = weeklyStats?.total_hours || 0;
  const sessionCount = weeklyStats?.session_count || 0;
  const questionCount = weeklyStats?.question_count || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-stone-200/50 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-800">本周学习</h3>
          <p className="text-sm text-stone-500">继续加油！</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-stone-50 rounded-xl">
          <div className="text-2xl font-bold text-stone-800">{totalHours.toFixed(1)}</div>
          <div className="text-xs text-stone-500">学习时长(h)</div>
        </div>
        <div className="text-center p-3 bg-stone-50 rounded-xl">
          <div className="text-2xl font-bold text-stone-800">{sessionCount}</div>
          <div className="text-xs text-stone-500">学习次数</div>
        </div>
        <div className="text-center p-3 bg-stone-50 rounded-xl">
          <div className="text-2xl font-bold text-stone-800">{questionCount}</div>
          <div className="text-xs text-stone-500">做题数</div>
        </div>
      </div>
    </motion.div>
  );
}

// ====================================================================
// 组件：模板卡片
// ====================================================================
function TemplateCard({ 
  template, 
  onSelect,
  index 
}: { 
  template: StudyPlanTemplate; 
  onSelect: () => void;
  index: number;
}) {
  const config = difficultyConfig[template.difficulty] || difficultyConfig.medium;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group bg-white rounded-2xl border border-stone-200/50 p-5 hover:shadow-xl hover:border-amber-300 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors">{template.name}</h4>
          <p className="text-sm text-stone-500">{template.exam_type}</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${config.bgColor} ${config.color}`}>
          {config.label}
        </span>
      </div>
      
      {template.description && (
        <p className="text-sm text-stone-600 mb-4 line-clamp-2">{template.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500 mb-4">
        <span className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg">
          <Calendar className="w-3.5 h-3.5" />
          {template.duration}天
        </span>
        <span className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg">
          <Clock className="w-3.5 h-3.5" />
          {template.daily_study_time}分钟/天
        </span>
        <span className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg">
          <Users className="w-3.5 h-3.5" />
          {template.use_count}人使用
        </span>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSelect}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
      >
        <Plus className="w-4 h-4" />
        使用此模板
      </motion.button>
    </motion.div>
  );
}

// ====================================================================
// 组件：空状态引导
// ====================================================================
function EmptyStateGuide({ 
  templates,
  onSelectTemplate,
  onCreateCustom 
}: {
  templates: StudyPlanTemplate[];
  onSelectTemplate: (template: StudyPlanTemplate) => void;
  onCreateCustom: () => void;
}) {
  const quote = useMemo(() => getRandomQuote(), []);
  
  return (
    <div className="space-y-8">
      {/* Hero 引导区域 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-8 md:p-10 text-white"
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-2xl rotate-12" />
          <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-white/10 rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              开启你的备考之旅
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              制定科学计划<br />
              <span className="text-white/90">高效备战公考</span>
            </h2>
            
            <p className="text-lg text-white/80 mb-6 max-w-xl">
              根据你的目标考试和时间安排，我们为你推荐最适合的学习计划。坚持每天学习，离上岸更近一步！
            </p>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCreateCustom}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-600 font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                自定义创建计划
              </motion.button>
              <Link
                href="#templates"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm font-medium rounded-xl hover:bg-white/30 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                浏览计划模板
                <ChevronDown className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 装饰图标 */}
          <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center rotate-6">
                <Rocket className="w-16 h-16 text-white/80" />
              </div>
              <div className="absolute -bottom-4 -left-8 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center -rotate-12">
                <Brain className="w-10 h-10 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 名言卡片 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-stone-50 to-amber-50/50 rounded-2xl p-6 border border-stone-200/50"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <BookMarked className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-stone-800 mb-1">&ldquo;{quote.text}&rdquo;</p>
            <p className="text-sm text-stone-500">—— {quote.author}</p>
          </div>
        </div>
      </motion.div>

      {/* 计划模板区域 */}
      <div id="templates" className="scroll-mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-stone-800">热门计划模板</h3>
            <p className="text-stone-500 text-sm mt-1">选择适合你的备考计划，一键开启学习</p>
          </div>
          <Link 
            href="#" 
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
            <BookOpen className="w-16 h-16 mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 mb-2">暂无可用模板</p>
            <p className="text-sm text-stone-400">点击上方按钮创建自定义计划</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.slice(0, 6).map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onSelectTemplate(template)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* 功能特性 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { icon: Target, title: "智能规划", desc: "根据考试时间自动分配任务", color: "from-blue-400 to-indigo-500" },
          { icon: TrendingUp, title: "进度追踪", desc: "实时查看学习进度和数据", color: "from-green-400 to-emerald-500" },
          { icon: Flame, title: "每日任务", desc: "每天自动生成学习清单", color: "from-amber-400 to-orange-500" },
          { icon: Trophy, title: "成就激励", desc: "完成任务获得成就奖励", color: "from-purple-400 to-pink-500" },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-xl p-5 border border-stone-200/50 hover:shadow-lg transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-3`}>
              <feature.icon className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-stone-800 mb-1">{feature.title}</h4>
            <p className="text-sm text-stone-500">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ====================================================================
// 组件：创建计划对话框
// ====================================================================
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
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
  
  const filteredTemplates = selectedExamType
    ? templates.filter(t => t.exam_type.includes(selectedExamType))
    : templates;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* 头部 */}
          <div className="p-6 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">创建学习计划</h2>
                <p className="text-stone-500 mt-1">选择计划模板或自定义创建</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* 自定义创建 */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onCreateCustom}
              className="w-full p-5 mb-6 border-2 border-dashed border-amber-300 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all flex items-center gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                <Plus className="w-7 h-7" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors text-lg">
                  自定义创建计划
                </span>
                <p className="text-sm text-stone-500">根据个人情况定制专属学习计划</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 ml-auto transition-colors" />
            </motion.button>

            {/* 考试类型筛选 */}
            <div className="mb-6">
              <h3 className="font-semibold text-stone-800 mb-3">选择目标考试</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedExamType(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedExamType === null
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  全部
                </button>
                {examTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedExamType(type.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedExamType === type.name
                        ? "bg-amber-500 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 模板列表 */}
            <h3 className="font-semibold text-stone-800 mb-4">推荐计划模板</h3>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="mb-1">暂无匹配的模板</p>
                <p className="text-sm text-stone-400">尝试选择其他考试类型或创建自定义计划</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => onSelectTemplate(template)}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ====================================================================
// 组件：历史计划列表
// ====================================================================
function HistoryPlansList({ plans, activePlanId }: { plans: StudyPlan[]; activePlanId?: number }) {
  const historyPlans = plans.filter(p => p.id !== activePlanId);
  
  if (historyPlans.length === 0) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "paused":
        return "bg-amber-100 text-amber-700";
      case "abandoned":
        return "bg-stone-100 text-stone-500";
      default:
        return "bg-stone-100 text-stone-500";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-stone-200/50 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-800">历史计划</h3>
          <p className="text-sm text-stone-500">共 {historyPlans.length} 个计划</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {historyPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-stone-800 truncate">{plan.title}</h4>
              <p className="text-sm text-stone-500">
                {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusStyle(plan.status)}`}>
                {getStatusText(plan.status)}
              </span>
              <div className="flex items-center gap-1.5 text-sm text-stone-500">
                <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
                <span className="w-10 text-right">{Math.round(plan.progress)}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ====================================================================
// 主页面
// ====================================================================
export default function StudyPlanPage() {
  const { isAuthenticated, user } = useAuthStore();
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
  const greeting = useMemo(() => getGreeting(), []);

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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 mb-6">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">请先登录</h2>
            <p className="text-stone-500 mb-6">登录后即可创建和管理学习计划</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
            >
              立即登录
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-stone-50/50 pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {/* 头部 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-600 mb-4 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习中心
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-stone-500 mb-1">{greeting}，{user?.nickname || user?.username || '同学'}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-800 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  <Target className="w-5 h-5" />
                </div>
                学习计划
              </h1>
            </div>
            {activePlan && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 text-stone-700 font-medium rounded-xl hover:bg-stone-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
                新建计划
              </motion.button>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" />
              <p className="text-stone-500">加载中...</p>
            </div>
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
                
                <div className="grid md:grid-cols-2 gap-6">
                  <TodayTasks />
                  <StudyStatsCard />
                </div>
                
                <HistoryPlansList plans={plans} activePlanId={activePlan.id} />
              </>
            ) : (
              /* 无计划时的引导界面 */
              <EmptyStateGuide
                templates={templates}
                onSelectTemplate={handleSelectTemplate}
                onCreateCustom={() => setShowCreateModal(true)}
              />
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
