"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  TrendingUp,
  BookOpen,
  Play,
  FileText,
  Target,
  Brain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Flame,
  Award,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { useStudyTime, useKnowledgeMastery } from "@/hooks/useStudyTools";
import { useAuthStore } from "@/stores/authStore";
import { StudyStatistics, KnowledgeMastery } from "@/services/api/study-tools";

// 格式化时长
function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

// 统计卡片
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  color 
}: { 
  icon: typeof Clock; 
  label: string; 
  value: string | number; 
  subValue?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-5">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-stone-800">{value}</div>
      <div className="text-sm text-stone-500">{label}</div>
      {subValue && <div className="text-xs text-stone-400 mt-1">{subValue}</div>}
    </div>
  );
}

// 周期选择器
function PeriodSelector({ 
  period, 
  onChange 
}: { 
  period: "day" | "week" | "month"; 
  onChange: (p: "day" | "week" | "month") => void;
}) {
  const periods = [
    { key: "day", label: "今日" },
    { key: "week", label: "本周" },
    { key: "month", label: "本月" },
  ] as const;

  return (
    <div className="flex bg-stone-100 rounded-lg p-1">
      {periods.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            period === p.key
              ? "bg-white text-amber-600 shadow-sm"
              : "text-stone-600 hover:text-stone-800"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// 学习趋势图表
function TrendChart({ trend }: { trend: { date: string; total_minutes: number }[] }) {
  if (!trend || trend.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-stone-400">
        暂无数据
      </div>
    );
  }

  const maxMinutes = Math.max(...trend.map(t => t.total_minutes), 1);

  return (
    <div className="h-40 flex items-end gap-1">
      {trend.map((day, idx) => {
        const height = (day.total_minutes / maxMinutes) * 100;
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString("zh-CN", { weekday: "short" });
        
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-sm transition-all hover:from-amber-600 hover:to-amber-500"
                style={{ height: `${Math.max(height, 4)}%` }}
                title={`${day.total_minutes}分钟`}
              />
            </div>
            <span className="text-xs text-stone-400">{dayName}</span>
          </div>
        );
      })}
    </div>
  );
}

// 学习分布饼图（简化版）
function StudyDistribution({ stats }: { stats: StudyStatistics }) {
  const total = stats.total_minutes || 1;
  const items = [
    { label: "视频学习", value: stats.video_minutes, color: "bg-blue-500" },
    { label: "做题练习", value: stats.practice_minutes, color: "bg-green-500" },
    { label: "文章阅读", value: stats.article_minutes, color: "bg-purple-500" },
    { label: "其他", value: stats.other_minutes, color: "bg-stone-400" },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const percentage = Math.round((item.value / total) * 100);
        return (
          <div key={idx}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-stone-600">{item.label}</span>
              <span className="text-stone-800 font-medium">{formatDuration(item.value)}</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 知识点掌握度卡片
function MasteryCard({ mastery }: { mastery: KnowledgeMastery }) {
  const getMasteryColor = (level: number) => {
    if (level >= 80) return "text-green-600 bg-green-50";
    if (level >= 60) return "text-blue-600 bg-blue-50";
    if (level >= 40) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className={`p-4 rounded-xl ${mastery.is_weak ? "bg-red-50 border border-red-200" : "bg-stone-50"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-stone-800">{mastery.knowledge_name}</span>
        <span className={`px-2 py-1 text-xs rounded-lg ${getMasteryColor(mastery.mastery_level)}`}>
          {Math.round(mastery.mastery_level)}%
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-stone-500">
        <span>做题: {mastery.total_questions}</span>
        <span>正确率: {Math.round(mastery.correct_rate)}%</span>
      </div>
      {mastery.is_weak && (
        <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />
          薄弱知识点，建议加强练习
        </div>
      )}
    </div>
  );
}

export default function StudyStatsPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    loading: timeLoading,
    dailyStats,
    weeklyStats,
    monthlyStats,
    fetchDailyStats,
    fetchWeeklyStats,
    fetchMonthlyStats,
  } = useStudyTime();

  const {
    loading: masteryLoading,
    weakPoints,
    stats: masteryStats,
    fetchWeakPoints,
    fetchStats: fetchMasteryStats,
  } = useKnowledgeMastery();

  const [period, setPeriod] = useState<"day" | "week" | "month">("week");

  // 获取当前显示的统计数据
  const currentStats = period === "day" ? dailyStats : period === "week" ? weeklyStats : monthlyStats;

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchDailyStats();
      fetchWeeklyStats();
      fetchMonthlyStats();
      fetchWeakPoints(5);
      fetchMasteryStats();
    }
  }, [isAuthenticated, fetchDailyStats, fetchWeeklyStats, fetchMonthlyStats, fetchWeakPoints, fetchMasteryStats]);

  // 未登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 mb-2">请先登录</h2>
            <p className="text-stone-500 mb-6">登录后即可查看学习统计</p>
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

  const loading = timeLoading || masteryLoading;

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
                <BarChart3 className="w-6 h-6 text-amber-500" />
                学习统计
              </h1>
              <p className="text-stone-500 mt-1">了解你的学习情况</p>
            </div>
            <PeriodSelector period={period} onChange={setPeriod} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 概览统计 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Clock}
                label="学习时长"
                value={currentStats ? formatDuration(currentStats.total_minutes) : "0"}
                subValue={currentStats?.daily_average_minutes ? `日均 ${currentStats.daily_average_minutes} 分钟` : undefined}
                color="bg-amber-500"
              />
              <StatCard
                icon={Play}
                label="学习次数"
                value={currentStats?.session_count || 0}
                color="bg-blue-500"
              />
              <StatCard
                icon={Target}
                label="做题数量"
                value={currentStats?.question_count || 0}
                color="bg-green-500"
              />
              <StatCard
                icon={TrendingUp}
                label="正确率"
                value={`${Math.round(currentStats?.correct_rate || 0)}%`}
                color="bg-purple-500"
              />
            </div>

            {/* 学习趋势 */}
            {(period === "week" || period === "month") && currentStats?.trend && (
              <div className="bg-white rounded-2xl border border-stone-200/50 p-6">
                <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  学习趋势
                </h3>
                <TrendChart trend={currentStats.trend} />
              </div>
            )}

            {/* 学习时长分布 */}
            {currentStats && currentStats.total_minutes > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200/50 p-6">
                <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  学习分布
                </h3>
                <StudyDistribution stats={currentStats} />
              </div>
            )}

            {/* 知识点掌握度 */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 掌握度统计 */}
              {masteryStats && (
                <div className="bg-white rounded-2xl border border-stone-200/50 p-6">
                  <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-amber-500" />
                    知识掌握度
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-3xl font-bold text-green-600">{masteryStats.mastered}</div>
                      <div className="text-sm text-green-700">已掌握</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600">{masteryStats.familiar}</div>
                      <div className="text-sm text-blue-700">较熟悉</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-xl">
                      <div className="text-3xl font-bold text-amber-600">{masteryStats.learning}</div>
                      <div className="text-sm text-amber-700">学习中</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <div className="text-3xl font-bold text-red-600">{masteryStats.weak}</div>
                      <div className="text-sm text-red-700">需加强</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 薄弱知识点 */}
              <div className="bg-white rounded-2xl border border-stone-200/50 p-6">
                <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  薄弱知识点
                </h3>
                {weakPoints.length === 0 ? (
                  <div className="text-center py-8 text-stone-500">
                    <Award className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>太棒了！暂无薄弱知识点</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weakPoints.map((point, idx) => (
                      <MasteryCard key={idx} mastery={point} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 无数据提示 */}
            {(!currentStats || currentStats.total_minutes === 0) && (
              <div className="bg-white rounded-2xl border border-stone-200/50 p-8 text-center">
                <Flame className="w-16 h-16 mx-auto text-amber-300 mb-4" />
                <h3 className="text-xl font-semibold text-stone-800 mb-2">
                  {period === "day" ? "今天还没有学习记录" : `这${period === "week" ? "周" : "个月"}还没有学习记录`}
                </h3>
                <p className="text-stone-500 mb-6">开始学习，让数据动起来！</p>
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  开始学习
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
