"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Zap,
  Award,
  Loader2,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  useDailyReport,
  useLearningGoal,
  formatStudyTime,
  formatPercent,
  getSubjectLabel,
  getSubjectColorClass,
  calculateGoalProgress,
} from "@/hooks/useLearningStats";
import { useAuthStore } from "@/stores/authStore";

// 日期格式化
function formatDateStr(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "今日";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "昨日";
  }
  
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`;
}

// 统计卡片
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  change,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  change?: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/50 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-stone-500">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-stone-800">{value}</div>
          {subValue && <div className="text-xs text-stone-400 mt-1">{subValue}</div>}
        </div>
        {change !== undefined && change !== 0 && (
          <div className={`flex items-center gap-1 text-sm ${change > 0 ? "text-green-600" : "text-red-600"}`}>
            {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{change > 0 ? "+" : ""}{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 科目分布条形图
function SubjectBarChart({ data }: { data: { subject: string; minutes: number; question_count: number; correct_rate: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>暂无学习数据</p>
      </div>
    );
  }

  const maxMinutes = Math.max(...data.map(d => d.minutes), 1);

  return (
    <div className="space-y-4">
      {data.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-stone-700">{getSubjectLabel(item.subject)}</span>
            <span className="text-stone-500">
              {formatStudyTime(item.minutes)} · {item.question_count}题 · {formatPercent(item.correct_rate)}
            </span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getSubjectColorClass(item.subject)} rounded-full transition-all duration-500`}
              style={{ width: `${(item.minutes / maxMinutes) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// 目标进度环
function GoalRing({ actual, goal, label, unit }: { actual: number; goal: number; label: string; unit: string }) {
  const percent = calculateGoalProgress(actual, goal);
  const isAchieved = percent >= 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="#e5e5e5"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={isAchieved ? "#22c55e" : "#f59e0b"}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isAchieved ? (
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          ) : (
            <span className="text-lg font-bold text-stone-700">{percent}%</span>
          )}
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-stone-700">{label}</div>
        <div className="text-xs text-stone-400">
          {actual}/{goal}{unit}
        </div>
      </div>
    </div>
  );
}

export default function DailyReportPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading, report, fetchDailyReport } = useDailyReport();
  const { goal, fetchGoal } = useLearningGoal();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      fetchDailyReport(dateStr);
      fetchGoal();
    }
  }, [isAuthenticated, selectedDate, fetchDailyReport, fetchGoal]);

  // 切换日期
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // 未登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h2 className="text-xl font-semibold text-stone-700 mb-2">登录查看学习报告</h2>
          <p className="text-stone-500 mb-6">登录后即可查看你的每日学习数据</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 头部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
              <Link href="/learn" className="hover:text-amber-600">学习中心</Link>
              <span>/</span>
              <span>学习报告</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-800">每日学习报告</h1>
          </div>
          <Link
            href="/learn/report/weekly"
            className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            查看周报 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 日期选择器 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-stone-200/50 shadow-sm">
            <Calendar className="w-5 h-5 text-amber-500" />
            <span className="font-medium text-stone-700">
              {formatDateStr(selectedDate.toISOString().split("T")[0])}
            </span>
          </div>
          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            className={`p-2 rounded-lg transition-colors ${
              isToday ? "text-stone-300 cursor-not-allowed" : "hover:bg-stone-100 text-stone-600"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : report ? (
          <>
            {/* 今日概览 */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                学习概览
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Clock}
                  label="学习时长"
                  value={formatStudyTime(report.overview.total_minutes)}
                  color="bg-gradient-to-br from-blue-500 to-indigo-600"
                  change={report.comparison_with_yesterday?.total_minutes_change}
                />
                <StatCard
                  icon={Zap}
                  label="做题数量"
                  value={report.overview.question_count}
                  subValue="道"
                  color="bg-gradient-to-br from-amber-500 to-orange-600"
                  change={report.comparison_with_yesterday?.question_count_change}
                />
                <StatCard
                  icon={Target}
                  label="正确率"
                  value={formatPercent(report.overview.correct_rate)}
                  color="bg-gradient-to-br from-emerald-500 to-teal-600"
                />
                <StatCard
                  icon={BookOpen}
                  label="完成章节"
                  value={report.overview.chapter_completed}
                  subValue="个"
                  color="bg-gradient-to-br from-purple-500 to-violet-600"
                />
              </div>
            </section>

            {/* 目标达成 */}
            {report.comparison_with_goal && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  目标达成
                </h2>
                <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                  <div className="flex items-center justify-around">
                    <GoalRing
                      actual={report.comparison_with_goal.minutes_actual}
                      goal={report.comparison_with_goal.minutes_goal}
                      label="学习时长"
                      unit="分钟"
                    />
                    <GoalRing
                      actual={report.comparison_with_goal.questions_actual}
                      goal={report.comparison_with_goal.questions_goal}
                      label="做题数量"
                      unit="题"
                    />
                  </div>
                  {report.comparison_with_goal.is_goal_achieved && (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">恭喜！今日目标已完成</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 科目分布 */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-500" />
                科目分布
              </h2>
              <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                <SubjectBarChart data={report.subject_breakdown} />
              </div>
            </section>

            {/* 今日成就 */}
            {report.achievements && report.achievements.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  今日成就
                </h2>
                <div className="grid gap-4">
                  {report.achievements.map((achievement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50"
                    >
                      <div className="text-3xl">{achievement.icon || "🏆"}</div>
                      <div>
                        <div className="font-semibold text-stone-800">{achievement.title}</div>
                        <div className="text-sm text-stone-500">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 与昨日对比 */}
            {report.comparison_with_yesterday && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  与昨日对比
                </h2>
                <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                  <div className="grid grid-cols-3 gap-6">
                    <ComparisonItem
                      label="学习时长"
                      change={report.comparison_with_yesterday.total_minutes_change}
                      unit="分钟"
                    />
                    <ComparisonItem
                      label="做题数量"
                      change={report.comparison_with_yesterday.question_count_change}
                      unit="题"
                    />
                    <ComparisonItem
                      label="正确率"
                      change={report.comparison_with_yesterday.correct_rate_change}
                      unit="%"
                      isPercent
                    />
                  </div>
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
            <h2 className="text-xl font-semibold text-stone-700 mb-2">暂无学习记录</h2>
            <p className="text-stone-500 mb-6">这一天还没有学习记录，快去学习吧！</p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
            >
              开始学习
            </Link>
          </div>
        )}

        {/* 快捷导航 */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link
            href="/learn/report/weekly"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">周报告</div>
              <div className="text-xs text-stone-400">查看本周学习趋势</div>
            </div>
          </Link>
          <Link
            href="/learn/report/ability"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">能力分析</div>
              <div className="text-xs text-stone-400">查看综合能力评估</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 对比项组件
function ComparisonItem({
  label,
  change,
  unit,
  isPercent = false,
}: {
  label: string;
  change: number;
  unit: string;
  isPercent?: boolean;
}) {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  const displayChange = isPercent ? Math.round(change * 10) / 10 : Math.abs(change);

  return (
    <div className="text-center">
      <div className="text-sm text-stone-500 mb-2">{label}</div>
      <div className={`flex items-center justify-center gap-1 ${
        isNeutral ? "text-stone-400" : isPositive ? "text-green-600" : "text-red-600"
      }`}>
        {isNeutral ? (
          <Minus className="w-5 h-5" />
        ) : isPositive ? (
          <TrendingUp className="w-5 h-5" />
        ) : (
          <TrendingDown className="w-5 h-5" />
        )}
        <span className="text-lg font-semibold">
          {isNeutral ? "持平" : `${isPositive ? "+" : "-"}${displayChange}${unit}`}
        </span>
      </div>
    </div>
  );
}
