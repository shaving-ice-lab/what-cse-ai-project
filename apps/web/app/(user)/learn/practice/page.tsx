"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Trophy,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
  Award,
  TrendingUp,
  Calendar,
  Sparkles,
  BookOpen,
  Zap,
  ArrowLeft,
  RotateCcw,
  Play,
  PauseCircle,
  Timer,
  Star,
  PartyPopper,
  CheckCheck,
  Activity,
  Brain,
  BarChart3,
  ArrowRight,
  History,
  Settings,
  ListChecks,
} from "lucide-react";
import { cn } from "@what-cse/ui";
import {
  useDailyPractice,
  useStreak,
  usePracticeCalendar,
  getDifficultyLabel,
  getDifficultyColor,
  getQuestionTypeLabel,
  formatTimeSpent,
} from "@/hooks/usePractice";
import { useAuthStore } from "@/stores/authStore";
import { DailyQuestion, QuestionBrief } from "@/services/api/practice";

// 练习统计数据展示
const practiceFeatures = [
  { value: "智能推荐", label: "根据薄弱点", icon: Brain },
  { value: "10题/天", label: "每日练习", icon: Target },
  { value: "实时反馈", label: "答案解析", icon: Zap },
  { value: "数据追踪", label: "学习统计", icon: BarChart3 },
];

// 快捷入口
const quickActions = [
  {
    icon: History,
    label: "练习历史",
    href: "/learn/practice/history",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: ListChecks,
    label: "专项练习",
    href: "/learn/practice/specialized",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Trophy,
    label: "排行榜",
    href: "/learn/practice/leaderboard",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Settings,
    label: "练习设置",
    href: "/learn/practice/settings",
    color: "text-stone-600",
    bg: "bg-stone-100",
  },
];

// 科目练习分类
const subjectPractices = [
  {
    id: "xingce",
    name: "行测练习",
    description: "数量关系、判断推理、言语理解、资料分析",
    questionCount: 12580,
    icon: BarChart3,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    gradient: "from-blue-500 to-indigo-600",
    features: ["逻辑推理", "数学运算", "言语理解"],
  },
  {
    id: "shenlun",
    name: "申论练习",
    description: "归纳概括、提出对策、综合分析、文章写作",
    questionCount: 3240,
    icon: BookOpen,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    gradient: "from-emerald-500 to-teal-600",
    features: ["材料分析", "对策提出", "大作文"],
  },
  {
    id: "mianshi",
    name: "面试练习",
    description: "综合分析、计划组织、人际关系、应急应变",
    questionCount: 2860,
    icon: Target,
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    gradient: "from-violet-500 to-purple-600",
    features: ["综合分析", "情景应变", "表达技巧"],
  },
  {
    id: "gongji",
    name: "公基练习",
    description: "政治理论、法律知识、经济常识、管理知识",
    questionCount: 8920,
    icon: Brain,
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    gradient: "from-amber-500 to-orange-600",
    features: ["法律常识", "政治理论", "时事热点"],
  },
];

// 科目练习卡片组件
function SubjectPracticeCard({ subject }: { subject: (typeof subjectPractices)[0] }) {
  const IconComponent = subject.icon;

  return (
    <Link
      href={`/learn/practice/specialized?subject=${subject.id}`}
      className="group relative bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* 顶部渐变装饰 */}
      <div
        className={`h-1 bg-gradient-to-r ${subject.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
      />

      <div className="p-5">
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`relative w-12 h-12 rounded-xl ${subject.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <IconComponent className={`w-6 h-6 ${subject.textColor}`} />
            {/* 悬浮光效 */}
            <div
              className={`absolute inset-0 rounded-xl bg-gradient-to-br ${subject.gradient} opacity-0 group-hover:opacity-20 transition-opacity`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-stone-800 group-hover:text-amber-600 transition-colors">
              {subject.name}
            </h3>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {subject.questionCount.toLocaleString()} 道题目
            </p>
          </div>
        </div>

        {/* 描述 */}
        <p className="text-sm text-stone-600 mb-3 line-clamp-2">{subject.description}</p>

        {/* 特性标签 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {subject.features.map((feature, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 text-xs font-medium ${subject.bgColor} ${subject.textColor} rounded-md transition-transform group-hover:scale-105`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {feature}
            </span>
          ))}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-xs text-stone-500 flex items-center gap-1">
            <Target className="w-3 h-3" />
            专项突破
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:gap-2 transition-all">
            开始练习
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// 成就徽章
const achievementBadges = [
  {
    id: "streak_7",
    name: "七日连胜",
    description: "连续打卡7天",
    icon: Flame,
    unlocked: true,
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
  {
    id: "streak_30",
    name: "月度达人",
    description: "连续打卡30天",
    icon: Award,
    unlocked: false,
    color: "text-amber-500",
    bg: "bg-amber-100",
  },
  {
    id: "accuracy_90",
    name: "精准狙击",
    description: "正确率达到90%",
    icon: Target,
    unlocked: true,
    color: "text-emerald-500",
    bg: "bg-emerald-100",
  },
  {
    id: "total_100",
    name: "百题斩",
    description: "累计完成100题",
    icon: Trophy,
    unlocked: true,
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    id: "total_500",
    name: "五百题王",
    description: "累计完成500题",
    icon: Star,
    unlocked: false,
    color: "text-violet-500",
    bg: "bg-violet-100",
  },
  {
    id: "speed_master",
    name: "速度之星",
    description: "平均答题时间<30秒",
    icon: Zap,
    unlocked: false,
    color: "text-cyan-500",
    bg: "bg-cyan-100",
  },
];

// 热门练习模式
const popularPracticeModes = [
  {
    id: "daily",
    title: "每日一练",
    description: "每天10道精选题目，智能推送薄弱点",
    icon: Flame,
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    tag: "推荐",
    tagColor: "bg-amber-100 text-amber-700",
    stats: { users: "2.3万", rate: "87%" },
  },
  {
    id: "mock",
    title: "模拟考试",
    description: "真实考试环境，限时作答",
    icon: Clock,
    gradient: "from-blue-500 to-indigo-500",
    bgLight: "bg-blue-50",
    tag: "热门",
    tagColor: "bg-blue-100 text-blue-700",
    stats: { users: "1.8万", rate: "82%" },
  },
  {
    id: "weak",
    title: "薄弱点强化",
    description: "AI分析错题，精准提升",
    icon: Target,
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-50",
    tag: "智能",
    tagColor: "bg-violet-100 text-violet-700",
    stats: { users: "1.2万", rate: "91%" },
  },
  {
    id: "random",
    title: "随机练习",
    description: "随机抽取题目，检验综合能力",
    icon: Sparkles,
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50",
    tag: "灵活",
    tagColor: "bg-emerald-100 text-emerald-700",
    stats: { users: "9千", rate: "78%" },
  },
];

// 热门练习模式卡片
function PracticeModeCard({ mode }: { mode: (typeof popularPracticeModes)[0] }) {
  const IconComponent = mode.icon;

  return (
    <Link
      href={`/learn/practice/${mode.id}`}
      className="group block bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* 顶部渐变区域 */}
      <div className={`relative h-24 bg-gradient-to-br ${mode.gradient} overflow-hidden`}>
        {/* 装饰性元素 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/20 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* 网格图案背景 */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id={`grid-${mode.id}`} width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${mode.id})`} />
        </svg>

        {/* 中心图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <IconComponent className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* 标签 */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-0.5 text-xs font-medium ${mode.tagColor} rounded-md shadow-sm`}>
            {mode.tag}
          </span>
        </div>

        {/* hover 效果 */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="px-4 py-2 bg-white/95 rounded-full flex items-center gap-2 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 text-stone-700" />
            <span className="text-sm font-medium text-stone-700">开始练习</span>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors mb-1">
          {mode.title}
        </h3>
        <p className="text-sm text-stone-500 mb-3 line-clamp-1">{mode.description}</p>

        {/* 统计 */}
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            {mode.stats.users}人在练
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            平均{mode.stats.rate}正确率
          </span>
        </div>
      </div>
    </Link>
  );
}

// 题目卡片组件
function QuestionCard({
  question,
  dailyQuestion,
  index,
  isActive,
  onAnswer,
  showAnswer,
}: {
  question: QuestionBrief;
  dailyQuestion: DailyQuestion;
  index: number;
  isActive: boolean;
  onAnswer: (questionId: number, answer: string) => void;
  showAnswer: boolean;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(dailyQuestion.user_answer || "");
  const isAnswered = dailyQuestion.is_correct !== undefined;

  const handleSelect = (key: string) => {
    if (isAnswered || !isActive) return;
    setSelectedAnswer(key);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || isAnswered) return;
    onAnswer(question.id, selectedAnswer);
  };

  // 获取选项样式
  const getOptionStyle = (key: string) => {
    if (!isAnswered) {
      return selectedAnswer === key
        ? "border-amber-400 bg-amber-50 shadow-sm"
        : "border-stone-200 hover:border-amber-300 hover:bg-amber-50/30";
    }

    const correctAnswer = (question as any).answer || "";
    const isCorrectOption = key === correctAnswer;
    const isUserSelected = key === dailyQuestion.user_answer;

    if (isCorrectOption) {
      return "border-emerald-400 bg-emerald-50";
    }
    if (isUserSelected && !dailyQuestion.is_correct) {
      return "border-red-400 bg-red-50";
    }
    return "border-stone-200 opacity-50";
  };

  return (
    <div className={cn("transition-all duration-300", isActive ? "block" : "hidden")}>
      {/* 题目头部 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-sm font-semibold rounded-lg border border-amber-200">
            第 {index + 1} 题
          </span>
          <span className="px-2.5 py-1 text-xs bg-stone-100 text-stone-600 rounded-lg font-medium">
            {getQuestionTypeLabel(question.question_type)}
          </span>
          <span
            className={cn(
              "px-2.5 py-1 text-xs rounded-lg font-medium",
              getDifficultyColor(question.difficulty)
            )}
          >
            {getDifficultyLabel(question.difficulty)}
          </span>
        </div>
        {isAnswered && (
          <div className="flex items-center gap-2">
            {dailyQuestion.is_correct ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                回答正确
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                <XCircle className="w-4 h-4" />
                回答错误
              </span>
            )}
            {dailyQuestion.time_spent && (
              <span className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-2.5 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeSpent(dailyQuestion.time_spent)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 题目内容 */}
      <div className="mb-6 p-5 bg-stone-50 rounded-xl border border-stone-100">
        <p className="text-base text-stone-800 leading-relaxed whitespace-pre-wrap">
          {question.content}
        </p>
      </div>

      {/* 选项 */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-3 mb-6">
          {question.options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              disabled={isAnswered}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                getOptionStyle(option.key),
                !isAnswered && "cursor-pointer active:scale-[0.99]"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold border-2 transition-all",
                  selectedAnswer === option.key && !isAnswered
                    ? "border-amber-400 text-amber-600 bg-amber-100"
                    : isAnswered && option.key === (question as any).answer
                      ? "border-emerald-400 text-emerald-600 bg-emerald-100"
                      : isAnswered &&
                          option.key === dailyQuestion.user_answer &&
                          !dailyQuestion.is_correct
                        ? "border-red-400 text-red-600 bg-red-100"
                        : "border-stone-300 text-stone-500 bg-stone-50"
                )}
              >
                {option.key}
              </span>
              <span className="text-stone-700 pt-1 leading-relaxed">{option.content}</span>
            </button>
          ))}
        </div>
      )}

      {/* 提交按钮 */}
      {!isAnswered && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className={cn(
            "w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200",
            selectedAnswer
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.99]"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
          )}
        >
          {selectedAnswer ? "确认提交" : "请选择答案"}
        </button>
      )}

      {/* 答案解析 */}
      {isAnswered && showAnswer && (question as any).analysis && (
        <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            答案解析
          </h4>
          <p className="text-sm text-blue-700 whitespace-pre-wrap leading-relaxed">
            {(question as any).analysis}
          </p>
          {(question as any).tips && (
            <div className="mt-4 p-3 bg-white/60 rounded-lg">
              <p className="text-sm text-blue-600 flex items-start gap-2">
                <Zap className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                <span>
                  <strong className="text-amber-600">答题技巧：</strong>
                  {(question as any).tips}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 进度指示器组件
function ProgressIndicator({
  questions,
  currentIndex,
  onSelect,
}: {
  questions: DailyQuestion[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  // 计算统计数据
  const completedCount = questions.filter((q) => q.is_correct !== undefined).length;
  const correctCount = questions.filter((q) => q.is_correct === true).length;

  return (
    <div className="space-y-4">
      {/* 统计摘要 */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-stone-500">
          已答 <span className="font-semibold text-stone-700">{completedCount}</span>/
          {questions.length}
        </span>
        {completedCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{correctCount}</span>
            <span className="text-stone-400">/</span>
            <span className="text-red-600 font-semibold">{completedCount - correctCount}</span>
          </span>
        )}
      </div>

      {/* 题目按钮 */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const isAnswered = q.is_correct !== undefined;
          const isActive = index === currentIndex;

          return (
            <button
              key={q.question_id}
              onClick={() => onSelect(index)}
              className={cn(
                "aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 ease-out",
                isActive
                  ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-110 ring-2 ring-amber-300 ring-offset-2"
                  : isAnswered
                    ? q.is_correct
                      ? "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 border-2 border-emerald-200 hover:shadow-md hover:scale-105"
                      : "bg-gradient-to-br from-red-50 to-red-100 text-red-600 border-2 border-red-200 hover:shadow-md hover:scale-105"
                    : "bg-stone-50 text-stone-500 border-2 border-stone-200 hover:bg-stone-100 hover:border-amber-300 hover:text-amber-600 hover:scale-105"
              )}
            >
              {isAnswered ? (
                q.is_correct ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )
              ) : (
                index + 1
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 打卡成功庆祝组件
function CompletionCelebration({
  stats,
  streak,
  onClose,
}: {
  stats: {
    correctCount: number;
    wrongCount: number;
    totalTime: number;
    correctRate: number;
  };
  streak: number;
  onClose: () => void;
}) {
  // 计算等级评价
  const getGrade = (rate: number) => {
    if (rate >= 90) return { label: "优秀", color: "text-emerald-600", emoji: "🏆" };
    if (rate >= 80) return { label: "良好", color: "text-blue-600", emoji: "👍" };
    if (rate >= 60) return { label: "及格", color: "text-amber-600", emoji: "💪" };
    return { label: "加油", color: "text-stone-600", emoji: "📚" };
  };
  const grade = getGrade(stats.correctRate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-ping delay-300" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-500" />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-amber-300 rounded-full animate-ping delay-700" />
      </div>

      <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300 relative">
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-t-3xl" />

        {/* 庆祝图标 */}
        <div className="relative w-32 h-32 mx-auto mb-6 mt-2">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-ping opacity-30" />
          <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-inner">
            <PartyPopper className="w-14 h-14 text-amber-500" />
          </div>
          <Sparkles className="absolute -top-3 -right-3 w-12 h-12 text-amber-400 animate-bounce" />
          <Star className="absolute -bottom-2 -left-2 w-10 h-10 text-orange-400 animate-pulse" />
          <Trophy className="absolute -top-2 left-2 w-8 h-8 text-yellow-500 animate-bounce delay-150" />
          <Award className="absolute -bottom-1 right-2 w-7 h-7 text-amber-500 animate-bounce delay-300" />
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-stone-800 mb-1">太棒了！今日打卡完成！</h2>
        <p className="text-stone-500 mb-6">坚持学习，每天进步一点点 {grade.emoji}</p>

        {/* 等级评价 */}
        <div className="mb-4 py-2 px-4 bg-stone-50 rounded-xl inline-flex items-center gap-2">
          <span className="text-sm text-stone-500">本次评价：</span>
          <span className={`text-lg font-bold ${grade.color}`}>{grade.label}</span>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-emerald-600">{stats.correctCount}</div>
            <div className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 正确
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-red-600">{stats.wrongCount}</div>
            <div className="text-xs text-red-600 font-medium flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3" /> 错误
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-blue-600">{Math.round(stats.correctRate)}%</div>
            <div className="text-xs text-blue-600 font-medium flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> 正确率
            </div>
          </div>
        </div>

        {/* 连续打卡 */}
        <div className="flex items-center justify-center gap-4 mb-6 p-5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border border-amber-200">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm text-amber-700 font-medium">连续打卡</div>
            <div className="text-4xl font-bold text-amber-800">
              {streak} <span className="text-lg font-normal">天</span>
            </div>
          </div>
          {streak >= 7 && <div className="ml-auto text-2xl">🔥</div>}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Link
            href="/learn"
            className="flex-1 py-3.5 px-4 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            返回学习
          </Link>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            查看解析
          </button>
        </div>
      </div>
    </div>
  );
}

// 打卡日历组件
function MiniCalendar({
  calendar,
  year,
  month,
}: {
  calendar: { date: string; completed: boolean; correct_rate?: number }[];
  year: number;
  month: number;
}) {
  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

  // 获取该月第一天是星期几
  const firstDay = new Date(year, month - 1, 1).getDay();

  // 计算本月打卡天数和平均正确率
  const completedDays = calendar.filter((item) => item.completed).length;
  const avgCorrectRate =
    completedDays > 0
      ? Math.round(
          calendar
            .filter((item) => item.completed && item.correct_rate)
            .reduce((sum, item) => sum + (item.correct_rate || 0), 0) / completedDays
        )
      : 0;

  // 获取正确率颜色
  const getCorrectRateColor = (rate?: number) => {
    if (!rate) return "";
    if (rate >= 80) return "from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200";
    if (rate >= 60) return "from-amber-100 to-amber-50 text-amber-600 border-amber-200";
    return "from-red-100 to-red-50 text-red-600 border-red-200";
  };

  return (
    <div className="p-5">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-stone-800">
            {year}年{monthNames[month - 1]}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-stone-500">
            已打卡 <span className="font-semibold text-amber-600">{completedDays}</span> 天
          </div>
          {completedDays > 0 && (
            <div className="text-xs text-stone-400">
              平均正确率 <span className="font-medium text-emerald-600">{avgCorrectRate}%</span>
            </div>
          )}
        </div>
      </div>

      {/* 本月进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
          <span>本月进度</span>
          <span>
            {completedDays}/{new Date(year, month, 0).getDate()} 天
          </span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedDays / new Date(year, month, 0).getDate()) * 100}%` }}
          />
        </div>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, idx) => (
          <div
            key={day}
            className={cn(
              "text-center text-xs font-medium py-1.5",
              idx === 0 || idx === 6 ? "text-amber-600" : "text-stone-500"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 空白占位 */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* 日期 */}
        {calendar.map((item) => {
          const day = parseInt(item.date.split("-")[2]);
          const today = new Date().toISOString().split("T")[0];
          const isToday = item.date === today;
          const correctRateColor = item.completed ? getCorrectRateColor(item.correct_rate) : "";

          return (
            <div
              key={item.date}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-xs font-medium relative transition-all cursor-pointer group",
                isToday && "ring-2 ring-amber-400 ring-offset-1",
                item.completed
                  ? `bg-gradient-to-br ${correctRateColor || "from-emerald-100 to-emerald-50 text-emerald-600"} border hover:scale-110 hover:shadow-md`
                  : isToday
                    ? "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100"
                    : "bg-stone-50 text-stone-400 hover:bg-stone-100"
              )}
              title={
                item.completed ? `${item.date}\n正确率: ${item.correct_rate || 0}%` : item.date
              }
            >
              {item.completed ? <CheckCircle2 className="w-4 h-4" /> : day}
              {/* 悬停提示 */}
              {item.completed && item.correct_rate !== undefined && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-stone-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {item.correct_rate}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 主页面组件
export default function DailyPracticePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Hooks
  const {
    loading: practiceLoading,
    error: practiceError,
    practice,
    fetchTodayPractice,
    submitAnswer,
  } = useDailyPractice();

  const { streak, fetchStreak } = useStreak();
  const { calendar, fetchCalendar } = usePracticeCalendar();

  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  // 加载数据
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTodayPractice();
      fetchStreak();
      fetchCalendar();
    }
  }, [authLoading, isAuthenticated, fetchTodayPractice, fetchStreak, fetchCalendar]);

  // 计时器
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  // 开始计时
  useEffect(() => {
    if (practice && practice.status !== "completed") {
      setIsTimerRunning(true);
    }
  }, [practice]);

  // 检查是否完成并显示庆祝
  useEffect(() => {
    if (practice && practice.status === "completed" && !showCelebration) {
      setIsTimerRunning(false);
      // 只在刚完成时显示庆祝（通过检查最后一题是否刚被回答）
      const lastQuestion = practice.questions[practice.questions.length - 1];
      if (lastQuestion?.is_correct !== undefined) {
        setShowCelebration(true);
        fetchStreak(); // 刷新打卡数据
      }
    }
  }, [practice, showCelebration, fetchStreak]);

  // 提交答案处理
  const handleAnswer = useCallback(
    async (questionId: number, answer: string) => {
      try {
        await submitAnswer({
          question_id: questionId,
          user_answer: answer,
          time_spent: timer,
        });
        setTimer(0); // 重置计时器

        // 自动跳转到下一题
        if (practice && currentIndex < practice.questions.length - 1) {
          setTimeout(() => {
            setCurrentIndex(currentIndex + 1);
          }, 1500);
        }
      } catch (err) {
        console.error("提交答案失败:", err);
      }
    },
    [submitAnswer, timer, practice, currentIndex]
  );

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!practice) return;

      // 忽略在输入框中的按键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < practice.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [practice, currentIndex]);

  // 未登录状态 - 显示欢迎页面
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="pb-20 lg:pb-0 bg-stone-50">
        {/* Hero Section - 与 /learn 页面风格一致 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-white">
          <div className="absolute top-10 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-2xl" />

          <div className="container relative mx-auto px-4 lg:px-6 pt-10 pb-12">
            {/* Top Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-sm font-medium text-amber-700">
                <Flame className="w-4 h-4" /> 每日一练
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-600">
                <Activity className="w-4 h-4" /> AI智能推荐
              </span>
            </div>

            {/* Title + Description */}
            <div className="max-w-3xl mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
                每日精练，<span className="text-gradient-amber">稳步提升</span>
              </h1>
              <p className="text-base md:text-lg text-stone-600">
                每天10道精选题目，根据你的薄弱点智能推送，坚持打卡，成绩看得见
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {practiceFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-stone-900">{feature.value}</p>
                      <p className="text-sm text-stone-500">{feature.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-6 py-8">
          {/* 登录提示卡片 */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
                  <Flame className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 mb-3">登录开始每日一练</h2>
                <p className="text-stone-500 mb-6 max-w-md mx-auto">
                  记录你的学习进度，保持连续打卡，查看详细学习报告
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/login"
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    立即登录
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-8 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                  >
                    免费注册
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 练习优势 */}
          <section className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-stone-800 mb-2">每日一练的优势</h2>
              <p className="text-base text-stone-500">坚持打卡，助力上岸</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "智能题目推荐",
                  description: "AI分析你的答题数据，精准推送薄弱知识点题目",
                },
                {
                  icon: Flame,
                  title: "连续打卡激励",
                  description: "每日打卡记录，养成良好学习习惯，见证成长",
                },
                {
                  icon: TrendingUp,
                  title: "数据可视化",
                  description: "详细的正确率统计和趋势分析，清晰了解进步",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl border border-stone-200 p-6 hover:border-amber-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-stone-500">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 热门练习模式 */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                <Flame className="w-5 h-5 text-orange-500" />
                热门练习模式
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularPracticeModes.map((mode) => (
                <PracticeModeCard key={mode.id} mode={mode} />
              ))}
            </div>
          </section>

          {/* 科目分类练习 */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                <ListChecks className="w-5 h-5 text-amber-600" />
                按科目练习
              </h2>
              <Link
                href="/learn/practice/specialized"
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjectPractices.map((subject) => (
                <SubjectPracticeCard key={subject.id} subject={subject} />
              ))}
            </div>
          </section>
        </div>

        {/* 高效刷题技巧 - 全宽背景 */}
        <section className="bg-white border-y border-stone-200 mt-8">
          <div className="container mx-auto px-4 lg:px-6 py-10">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-stone-800 mb-2">高效刷题技巧</h2>
              <p className="text-base text-stone-500">掌握方法，事半功倍</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Clock,
                  title: "限时答题",
                  description: "培养时间观念，提升答题速度",
                },
                {
                  icon: Brain,
                  title: "错题复习",
                  description: "定期回顾错题，强化薄弱环节",
                },
                {
                  icon: Target,
                  title: "专项突破",
                  description: "针对弱项专项训练，逐个击破",
                },
                {
                  icon: TrendingUp,
                  title: "持续坚持",
                  description: "每日打卡，养成学习习惯",
                },
              ].map((tip, idx) => (
                <div
                  key={idx}
                  className="group text-center p-5 rounded-2xl hover:bg-amber-50 transition-colors"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-colors">
                    <tip.icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="text-base font-semibold text-stone-800 mb-1">{tip.title}</h3>
                  <p className="text-sm text-stone-500">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 lg:px-6 py-10">
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-10 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-5 left-5 w-24 h-24 border-2 border-white rounded-full" />
              <div className="absolute bottom-5 right-5 w-16 h-16 border-2 border-white rounded-full" />
            </div>
            <div className="relative">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-4">
                开始您的备考之旅
              </h2>
              <p className="text-base text-amber-100 mb-6 max-w-lg mx-auto">
                注册账号完善个人信息，解锁完整学习功能，获取个性化推荐
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/auth/register"
                  className="px-8 py-3 bg-white text-amber-600 text-base font-semibold rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
                >
                  免费注册
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 bg-amber-600 text-white text-base font-semibold rounded-xl border-2 border-white/30 hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  立即登录
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 加载中
  if (practiceLoading || authLoading) {
    return (
      <div className="pb-20 lg:pb-0 bg-stone-50 min-h-screen">
        {/* Hero Section - 保持一致性 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-white">
          <div className="absolute top-10 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-2xl" />

          <div className="container relative mx-auto px-4 lg:px-6 pt-8 pb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-sm font-medium text-amber-700">
                <Flame className="w-4 h-4" /> 每日一练
              </span>
            </div>
            <div className="max-w-3xl mb-6">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-2">
                今日练习
              </h1>
              <p className="text-base text-stone-600">正在加载今日练习...</p>
            </div>
            {/* 骨架屏进度条 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-32 bg-stone-200 rounded" />
                  <div className="h-5 w-24 bg-stone-200 rounded hidden sm:block" />
                </div>
                <div className="h-6 w-12 bg-stone-200 rounded" />
              </div>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-stone-200 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-6 py-6">
          {/* 骨架屏快捷入口 */}
          <div className="mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-lg bg-stone-200" />
                  <div className="h-5 w-20 bg-stone-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* 主内容骨架屏 */}
          <div className="grid lg:grid-cols-[1fr,320px] gap-6">
            {/* 左侧题目区骨架 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-8 w-20 bg-stone-200 rounded-lg" />
                <div className="h-6 w-16 bg-stone-100 rounded-lg" />
                <div className="h-6 w-12 bg-stone-100 rounded-lg" />
              </div>
              <div className="mb-6 p-5 bg-stone-50 rounded-xl">
                <div className="h-4 w-full bg-stone-200 rounded mb-2" />
                <div className="h-4 w-3/4 bg-stone-200 rounded mb-2" />
                <div className="h-4 w-5/6 bg-stone-200 rounded" />
              </div>
              <div className="space-y-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-stone-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-stone-200" />
                    <div className="h-4 flex-1 bg-stone-200 rounded" />
                  </div>
                ))}
              </div>
              <div className="h-12 w-full bg-stone-200 rounded-xl" />
            </div>

            {/* 右侧统计骨架 */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
                <div className="h-5 w-20 bg-stone-200 rounded mb-4" />
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div key={i} className="aspect-square rounded-xl bg-stone-200" />
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
                <div className="h-5 w-20 bg-stone-200 rounded mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 bg-stone-100 rounded-xl">
                      <div className="h-7 w-12 bg-stone-200 rounded mx-auto mb-1" />
                      <div className="h-3 w-8 bg-stone-200 rounded mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (practiceError) {
    return (
      <div className="pb-20 lg:pb-0 bg-stone-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-white">
          <div className="absolute top-10 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-2xl" />

          <div className="container relative mx-auto px-4 lg:px-6 pt-10 pb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-sm font-medium text-amber-700">
                <Flame className="w-4 h-4" /> 每日一练
              </span>
            </div>
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
                每日精练，<span className="text-gradient-amber">稳步提升</span>
              </h1>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800 mb-2">加载失败</h2>
              <p className="text-stone-500 mb-6">{practiceError}</p>
              <button
                onClick={() => fetchTodayPractice()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重新加载
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!practice) return null;

  const currentQuestion = practice.questions[currentIndex];
  const questionDetail = currentQuestion?.question;

  return (
    <div className="pb-20 lg:pb-0 bg-stone-50 min-h-screen">
      {/* 庆祝弹窗 */}
      {showCelebration && (
        <CompletionCelebration
          stats={{
            correctCount: practice.correct_count,
            wrongCount: practice.wrong_count,
            totalTime: practice.total_time_spent,
            correctRate: practice.correct_rate,
          }}
          streak={streak?.current_streak || 1}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* Hero Section - 与 /learn 页面风格一致 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-white">
        <div className="absolute top-10 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-2xl" />

        <div className="container relative mx-auto px-4 lg:px-6 pt-8 pb-10">
          {/* 顶部导航 + 标签 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/learn"
                className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">返回学习中心</span>
              </Link>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-sm font-medium text-amber-700">
                <Flame className="w-4 h-4" /> 每日一练
              </span>
              {practice.status === "completed" && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> 今日已完成
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* 计时器 */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-stone-200">
                <Timer className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-sm font-medium">
                  {Math.floor(timer / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(timer % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* 连续打卡 */}
              {streak && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    连续 {streak.current_streak} 天
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 标题区域 */}
          <div className="max-w-3xl mb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-2">
              今日练习
            </h1>
            <p className="text-base text-stone-600">
              {practice.status === "completed"
                ? "太棒了！今日练习已完成，可以查看解析或继续巩固"
                : "完成今日10道题目，保持学习节奏"}
            </p>
          </div>

          {/* 进度卡片 */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* 今日进度 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  今日进度
                </h3>
                <span className="text-lg font-bold text-amber-600">
                  {Math.round(practice.progress)}%
                </span>
              </div>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${practice.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-stone-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  已完成{" "}
                  <span className="font-semibold text-stone-800">{practice.completed_count}</span>/
                  {practice.total_questions} 题
                </span>
                <span className="flex items-center gap-1.5 text-stone-600">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  正确率{" "}
                  <span className="font-semibold text-stone-800">
                    {Math.round(practice.correct_rate)}%
                  </span>
                </span>
              </div>
            </div>

            {/* 本周目标 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-500" />
                  本周目标
                </h3>
                <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full font-medium">
                  {streak ? `${Math.min(streak.current_streak, 7)}/7 天` : "0/7 天"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const completed = streak ? day <= streak.current_streak : false;
                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                        completed
                          ? "bg-gradient-to-br from-violet-500 to-purple-500 text-white"
                          : "bg-stone-100 text-stone-400"
                      )}
                    >
                      {completed ? <CheckCircle2 className="w-4 h-4" /> : day}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-stone-500 text-center">
                {streak && streak.current_streak >= 7
                  ? "🎉 恭喜完成本周目标！"
                  : `再坚持 ${7 - (streak?.current_streak || 0)} 天完成本周目标`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* 快捷入口 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
              <Zap className="w-5 h-5 text-amber-600" />
              练习工具
            </h2>
            <Link
              href="/learn/practice/history"
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className="relative flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                {/* 悬浮时的背景渐变 */}
                <div
                  className={`absolute inset-0 ${action.bg} opacity-0 group-hover:opacity-30 transition-opacity`}
                />

                <div
                  className={`relative w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="relative font-medium text-stone-700 group-hover:text-amber-600 transition-colors">
                  {action.label}
                </span>
                <ChevronRight className="relative w-4 h-4 text-stone-400 ml-auto group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* 主内容区 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
              <BookOpen className="w-5 h-5 text-amber-600" />
              答题区域
            </h2>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <span className="hidden sm:inline">当前进度：</span>
              <span className="font-semibold text-amber-600">{currentIndex + 1}</span>
              <span>/</span>
              <span>{practice.questions.length}</span>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr,320px] gap-6">
          {/* 左侧：题目卡片 */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            {questionDetail && (
              <QuestionCard
                question={questionDetail}
                dailyQuestion={currentQuestion}
                index={currentIndex}
                isActive={true}
                onAnswer={handleAnswer}
                showAnswer={currentQuestion.is_correct !== undefined}
              />
            )}

            {/* 底部导航 */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-stone-100">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200",
                  currentIndex === 0
                    ? "text-stone-300 cursor-not-allowed bg-stone-50"
                    : "text-stone-600 hover:bg-amber-50 hover:text-amber-600 active:scale-95 border border-transparent hover:border-amber-200"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">上一题</span>
              </button>

              <div className="flex items-center gap-2">
                {/* 进度指示器 */}
                <div className="hidden md:flex items-center gap-1">
                  {practice.questions
                    .slice(
                      Math.max(0, currentIndex - 2),
                      Math.min(practice.questions.length, currentIndex + 3)
                    )
                    .map((q, idx) => {
                      const actualIdx = Math.max(0, currentIndex - 2) + idx;
                      const isActive = actualIdx === currentIndex;
                      const isAnswered = q.is_correct !== undefined;
                      return (
                        <div
                          key={q.question_id}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            isActive
                              ? "w-6 bg-amber-500"
                              : isAnswered
                                ? q.is_correct
                                  ? "bg-emerald-400"
                                  : "bg-red-400"
                                : "bg-stone-300"
                          )}
                        />
                      );
                    })}
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <span className="text-sm font-bold text-amber-600">{currentIndex + 1}</span>
                  <span className="text-amber-400">/</span>
                  <span className="text-sm font-medium text-amber-500">
                    {practice.questions.length}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setCurrentIndex(Math.min(practice.questions.length - 1, currentIndex + 1))
                }
                disabled={currentIndex === practice.questions.length - 1}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200",
                  currentIndex === practice.questions.length - 1
                    ? "text-stone-300 cursor-not-allowed bg-stone-50"
                    : "text-stone-600 hover:bg-amber-50 hover:text-amber-600 active:scale-95 border border-transparent hover:border-amber-200"
                )}
              >
                <span className="hidden sm:inline">下一题</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 快捷操作 */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all border border-transparent hover:border-amber-200 group"
                title="收藏题目"
              >
                <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">收藏</span>
              </button>
              <button
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-stone-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all border border-transparent hover:border-violet-200 group"
                title="标记疑难"
              >
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">标记</span>
              </button>
              <button
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200 group"
                title="反馈问题"
              >
                <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">反馈</span>
              </button>
            </div>

            {/* 键盘快捷键提示 - 仅桌面端显示 */}
            <div className="hidden lg:flex items-center justify-center gap-4 mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-500 font-mono text-[10px]">
                  A
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-500 font-mono text-[10px]">
                  B
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-500 font-mono text-[10px]">
                  C
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-500 font-mono text-[10px]">
                  D
                </kbd>
                选择答案
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-500 font-mono text-[10px]">
                  ←
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-500 font-mono text-[10px]">
                  →
                </kbd>
                切换题目
              </span>
            </div>
          </div>

          {/* 右侧：进度和统计 */}
          <div className="space-y-4">
            {/* 答题卡 */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                答题卡
              </h3>
              <ProgressIndicator
                questions={practice.questions}
                currentIndex={currentIndex}
                onSelect={setCurrentIndex}
              />
            </div>

            {/* 今日统计 */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                今日统计
              </h3>

              {/* 正确率环形进度 */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-stone-100"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (practice.completed_count > 0 ? practice.correct_rate / 100 : 0))}`}
                      strokeLinecap="round"
                      className="text-emerald-500 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-stone-800">
                      {practice.completed_count > 0 ? Math.round(practice.correct_rate) : 0}%
                    </span>
                    <span className="text-xs text-stone-500">正确率</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100 group hover:bg-emerald-100 transition-colors">
                  <div className="text-xl font-bold text-emerald-600">{practice.correct_count}</div>
                  <div className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 正确
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center border border-red-100 group hover:bg-red-100 transition-colors">
                  <div className="text-xl font-bold text-red-600">{practice.wrong_count}</div>
                  <div className="text-xs text-red-600 font-medium flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" /> 错误
                  </div>
                </div>
                <div className="col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-700 font-medium">总用时</span>
                  </div>
                  <span className="text-lg font-bold text-amber-600">
                    {formatTimeSpent(practice.total_time_spent || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* 连续打卡信息 */}
            {streak && (
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white overflow-hidden group hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                {/* 装饰性背景 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/30 rounded-full blur-xl" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/20 rounded-full blur-lg" />
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Flame className="w-5 h-5 group-hover:animate-pulse" />
                      连续打卡
                    </h3>
                    <Award className="w-5 h-5 opacity-80 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div className="text-4xl font-bold mb-1 flex items-end gap-2">
                    {streak.current_streak}
                    <span className="text-lg font-normal text-amber-100">天</span>
                    {streak.current_streak >= 7 && <span className="text-xl">🔥</span>}
                  </div>
                  <p className="text-sm text-amber-100">
                    累计做题 {streak.total_questions} 道，平均正确率{" "}
                    {Math.round(streak.avg_correct_rate)}%
                  </p>
                </div>
              </div>
            )}

            {/* 打卡日历 */}
            {calendar.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <MiniCalendar
                  calendar={calendar}
                  year={new Date().getFullYear()}
                  month={new Date().getMonth() + 1}
                />
              </div>
            )}

            {/* 成就徽章 */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  成就徽章
                </h3>
                <Link
                  href="/learn/practice/achievements"
                  className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-0.5 group"
                >
                  查看全部
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {achievementBadges.slice(0, 6).map((badge, idx) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={cn(
                        "relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300 group cursor-pointer",
                        badge.unlocked
                          ? `${badge.bg} hover:scale-110 hover:shadow-md hover:z-10`
                          : "bg-stone-100"
                      )}
                      title={badge.description}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <BadgeIcon
                        className={cn(
                          "w-6 h-6 mb-1 transition-transform",
                          badge.unlocked ? `${badge.color} group-hover:scale-110` : "text-stone-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-medium text-center leading-tight",
                          badge.unlocked ? "text-stone-700" : "text-stone-400"
                        )}
                      >
                        {badge.name}
                      </span>
                      {badge.unlocked && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                          <CheckCircle2 className="w-2 h-2 text-white" />
                        </div>
                      )}
                      {!badge.unlocked && (
                        <div className="absolute inset-0 bg-stone-200/50 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                          <div className="w-6 h-6 rounded-full bg-stone-300 flex items-center justify-center shadow-inner">
                            <span className="text-xs">🔒</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* 徽章进度提示 */}
              <div className="mt-3 pt-3 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-500">
                  已解锁{" "}
                  <span className="font-semibold text-amber-600">
                    {achievementBadges.filter((b) => b.unlocked).length}
                  </span>
                  /{achievementBadges.length} 个徽章
                </p>
              </div>
            </div>

            {/* 学习小贴士 */}
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 overflow-hidden group hover:shadow-md transition-all">
              {/* 装饰性元素 */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-200/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
                    今日学习小贴士
                    <span className="text-xs font-normal bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                      💡 每日更新
                    </span>
                  </h4>
                  <p className="text-sm text-blue-600 leading-relaxed">{getTodayTip()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 热门练习模式 */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
              <Flame className="w-5 h-5 text-orange-500" />
              热门练习模式
              <span className="text-sm font-normal text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">
                多种方式
              </span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularPracticeModes.map((mode) => (
              <PracticeModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </section>

        {/* 科目分类练习 */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
              <ListChecks className="w-5 h-5 text-amber-600" />
              按科目练习
            </h2>
            <Link
              href="/learn/practice/specialized"
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectPractices.map((subject) => (
              <SubjectPracticeCard key={subject.id} subject={subject} />
            ))}
          </div>
        </section>
      </div>

      {/* 练习技巧 - 全宽背景区域 */}
      <section className="bg-white border-y border-stone-200 mt-8">
        <div className="container mx-auto px-4 lg:px-6 py-10">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-stone-800 mb-2">高效刷题技巧</h2>
            <p className="text-base text-stone-500">掌握方法，事半功倍</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: "限时答题",
                description: "培养时间观念，提升答题速度",
              },
              {
                icon: Brain,
                title: "错题复习",
                description: "定期回顾错题，强化薄弱环节",
              },
              {
                icon: Target,
                title: "专项突破",
                description: "针对弱项专项训练，逐个击破",
              },
              {
                icon: TrendingUp,
                title: "持续坚持",
                description: "每日打卡，养成学习习惯",
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="group text-center p-5 rounded-2xl hover:bg-amber-50 transition-colors"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-colors">
                  <tip.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-stone-800 mb-1">{tip.title}</h3>
                <p className="text-sm text-stone-500">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 lg:px-6 py-10">
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-10 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-5 left-5 w-24 h-24 border-2 border-white rounded-full" />
            <div className="absolute bottom-5 right-5 w-16 h-16 border-2 border-white rounded-full" />
            <div className="absolute top-1/2 left-1/4 w-12 h-12 border-2 border-white rounded-full" />
          </div>
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="w-8 h-8 text-white" />
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white">
                坚持每日练习，离上岸更近一步
              </h2>
            </div>
            <p className="text-base text-amber-100 mb-6 max-w-lg mx-auto">
              {practice.status === "completed"
                ? "今日练习已完成！明天继续保持，连续打卡会有惊喜哦~"
                : `还剩 ${practice.total_questions - practice.completed_count} 道题目，坚持完成今日任务！`}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/learn"
                className="px-8 py-3 bg-white text-amber-600 text-base font-semibold rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
              >
                返回学习中心
              </Link>
              <Link
                href="/learn/practice/specialized"
                className="px-8 py-3 bg-amber-600 text-white text-base font-semibold rounded-xl border-2 border-white/30 hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                <ListChecks className="w-5 h-5" />
                专项训练
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// 获取今日学习小贴士
function getTodayTip(): string {
  const tips = [
    "每道题仔细审题，不要被选项误导，找准题目关键词再作答。",
    "做完题后认真看解析，理解解题思路比单纯记答案更重要。",
    "错题要及时记录，定期复习，避免同样的错误再犯。",
    "限时答题能提高专注力，建议每道题控制在1-2分钟内。",
    "保持每天固定时间练习，养成良好的学习习惯。",
    "遇到不会的题不要死磕，标记后继续，最后再回来思考。",
    "适当休息，学习效率比学习时长更重要。",
    "总结同类题型的解题规律，举一反三事半功倍。",
  ];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return tips[dayOfYear % tips.length];
}
