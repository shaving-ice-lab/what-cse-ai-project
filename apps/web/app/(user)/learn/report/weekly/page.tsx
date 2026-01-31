"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Target,
  Trophy,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Zap,
  Award,
  Loader2,
  BarChart3,
  Flame,
  CheckCircle2,
  XCircle,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Lightbulb,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  useWeeklyReport,
  formatStudyTime,
  formatPercent,
  getSubjectLabel,
  getSubjectColorClass,
} from "@/hooks/useLearningStats";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

// AI 周报类型
interface AIWeeklyAnalysis {
  summary: string;
  highlights: string[];
  improvements: string[];
  needsAttention: string[];
  nextWeekSuggestions: string[];
}

// 获取周开始日期（周一）
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// 格式化周范围
function formatWeekRange(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const now = new Date();
  const thisWeekStart = getWeekStart(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  if (start.toDateString() === thisWeekStart.toDateString()) {
    return "本周";
  } else if (start.toDateString() === lastWeekStart.toDateString()) {
    return "上周";
  }

  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
}

// 每日趋势条形图
function DailyTrendChart({ data }: { data: { date: string; day_of_week: string; minutes: number; question_count: number; correct_rate: number; is_goal_achieved: boolean }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>暂无学习数据</p>
      </div>
    );
  }

  const maxMinutes = Math.max(...data.map(d => d.minutes), 60);

  return (
    <div className="flex items-end justify-between gap-2 h-48">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center">
          <div className="flex-1 w-full flex items-end justify-center">
            <div
              className={`w-8 rounded-t-lg transition-all duration-300 ${
                item.is_goal_achieved
                  ? "bg-gradient-to-t from-green-500 to-emerald-400"
                  : item.minutes > 0
                  ? "bg-gradient-to-t from-amber-500 to-orange-400"
                  : "bg-stone-200"
              }`}
              style={{ height: `${Math.max((item.minutes / maxMinutes) * 100, 5)}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <div className="text-xs font-medium text-stone-600">{item.day_of_week}</div>
            <div className="text-xs text-stone-400">{formatStudyTime(item.minutes)}</div>
            {item.is_goal_achieved && (
              <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mt-1" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// 统计卡片
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/50 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-stone-500">{label}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-stone-800">{value}</div>
        {subValue && <div className="text-xs text-stone-400 mt-1">{subValue}</div>}
      </div>
    </div>
  );
}

// 知识点卡片
function KnowledgePointCard({
  name,
  subject,
  correctRate,
  trend,
  isStrong,
}: {
  name: string;
  subject: string;
  correctRate: number;
  trend: "up" | "down" | "stable";
  isStrong: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${
      isStrong ? "bg-green-50" : "bg-red-50"
    }`}>
      <div>
        <div className="font-medium text-stone-700">{name}</div>
        <div className="text-xs text-stone-500">{getSubjectLabel(subject)}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${isStrong ? "text-green-600" : "text-red-600"}`}>
          {formatPercent(correctRate)}
        </span>
        {trend === "up" ? (
          <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : trend === "down" ? (
          <ArrowDownRight className="w-4 h-4 text-red-500" />
        ) : null}
      </div>
    </div>
  );
}

export default function WeeklyReportPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading, report, fetchWeeklyReport } = useWeeklyReport();
  const [selectedWeek, setSelectedWeek] = useState<Date>(getWeekStart(new Date()));
  const [aiAnalysis, setAIAnalysis] = useState<AIWeeklyAnalysis | null>(null);

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      const weekStartStr = selectedWeek.toISOString().split("T")[0];
      fetchWeeklyReport(weekStartStr);
    }
  }, [isAuthenticated, selectedWeek, fetchWeeklyReport]);

  // 生成 AI 分析（模拟）
  useEffect(() => {
    if (report) {
      const totalHours = (report.overview.total_minutes / 60).toFixed(1);
      const improvement = report.overview.avg_correct_rate > 65 ? "提升了3.2%" : "下降了1.5%";
      
      setAIAnalysis({
        summary: `本周您共学习了${report.overview.learning_days}天，总计${totalHours}小时，完成${report.overview.total_questions}道题目，平均正确率${formatPercent(report.overview.avg_correct_rate)}，相比上周${improvement}。`,
        highlights: [
          `本周学习天数达到${report.overview.learning_days}天，${report.overview.learning_days >= 5 ? "保持了良好的学习连续性" : "建议增加学习天数"}`,
          "数量关系正确率提升8%，进步明显",
          "完成了2套完整模拟测试",
        ],
        improvements: [
          "做题速度有所提升，平均每题用时减少10秒",
          "资料分析准确率提升至72%",
          `学习时长比上周增加${Math.round(report.overview.total_minutes * 0.1)}分钟`,
        ],
        needsAttention: [
          "言语理解正确率略有下降，需要加强练习",
          "周末学习时间较少，建议合理安排",
          "错题回顾不够及时，建议每日复习",
        ],
        nextWeekSuggestions: [
          "重点突破言语理解中的逻辑填空题型",
          "每天安排30分钟错题复习时间",
          "周末至少安排2小时集中学习",
          "尝试一次完整的限时模拟考试",
        ],
      });
    }
  }, [report]);

  // 切换周
  const changeWeek = (weeks: number) => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + weeks * 7);
    if (newWeek <= new Date()) {
      setSelectedWeek(newWeek);
    }
  };

  const thisWeekStart = getWeekStart(new Date());
  const isThisWeek = selectedWeek.toDateString() === thisWeekStart.toDateString();

  // 未登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h2 className="text-xl font-semibold text-stone-700 mb-2">登录查看学习报告</h2>
          <p className="text-stone-500 mb-6">登录后即可查看你的每周学习数据</p>
          <Link
            href="/login"
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
            <h1 className="text-2xl font-bold text-stone-800">每周学习报告</h1>
          </div>
          <Link
            href="/learn/report/ability"
            className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            能力分析 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 周选择器 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => changeWeek(-1)}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-stone-200/50 shadow-sm">
            <Calendar className="w-5 h-5 text-amber-500" />
            <span className="font-medium text-stone-700">
              {report ? formatWeekRange(report.week_start, report.week_end) : "本周"}
            </span>
          </div>
          <button
            onClick={() => changeWeek(1)}
            disabled={isThisWeek}
            className={`p-2 rounded-lg transition-colors ${
              isThisWeek ? "text-stone-300 cursor-not-allowed" : "hover:bg-stone-100 text-stone-600"
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
            {/* 周汇总 */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                周汇总
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  icon={Clock}
                  label="总学习时长"
                  value={formatStudyTime(report.overview.total_minutes)}
                  subValue={`日均 ${formatStudyTime(report.overview.avg_daily_minutes)}`}
                  color="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <StatCard
                  icon={Zap}
                  label="总做题数"
                  value={report.overview.total_questions}
                  subValue="道"
                  color="bg-gradient-to-br from-amber-500 to-orange-600"
                />
                <StatCard
                  icon={Target}
                  label="平均正确率"
                  value={formatPercent(report.overview.avg_correct_rate)}
                  color="bg-gradient-to-br from-emerald-500 to-teal-600"
                />
                <StatCard
                  icon={Calendar}
                  label="学习天数"
                  value={`${report.overview.learning_days}/7`}
                  subValue="天"
                  color="bg-gradient-to-br from-purple-500 to-violet-600"
                />
                <StatCard
                  icon={BookOpen}
                  label="完成课程"
                  value={report.overview.course_completed}
                  subValue="门"
                  color="bg-gradient-to-br from-pink-500 to-rose-600"
                />
                <StatCard
                  icon={Flame}
                  label="连续打卡"
                  value={report.consecutive_days}
                  subValue="天"
                  color="bg-gradient-to-br from-red-500 to-orange-600"
                />
              </div>
            </section>

            {/* 每日趋势 */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                每日趋势
              </h2>
              <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                <DailyTrendChart data={report.daily_trend} />
                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-stone-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-emerald-400" />
                    <span>达成目标</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-amber-500 to-orange-400" />
                    <span>未达标</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 科目分布 */}
            {report.subject_breakdown && report.subject_breakdown.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  科目学习分布
                </h2>
                <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                  <div className="space-y-4">
                    {report.subject_breakdown.map((item, idx) => {
                      const totalMinutes = report.subject_breakdown.reduce((sum, s) => sum + s.minutes, 1);
                      const percent = (item.minutes / totalMinutes) * 100;
                      return (
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
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* 知识点分析 */}
            {(report.knowledge_points?.strong_points?.length > 0 || report.knowledge_points?.weak_points?.length > 0) && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  知识点分析
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* 强项 */}
                  <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-stone-700">强项知识点</span>
                    </div>
                    {report.knowledge_points?.strong_points?.length > 0 ? (
                      <div className="space-y-3">
                        {report.knowledge_points.strong_points.slice(0, 5).map((point, idx) => (
                          <KnowledgePointCard
                            key={idx}
                            name={point.name}
                            subject={point.subject}
                            correctRate={point.correct_rate}
                            trend={point.trend as "up" | "down" | "stable"}
                            isStrong={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-stone-400">暂无数据</div>
                    )}
                  </div>

                  {/* 薄弱 */}
                  <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-stone-700">薄弱知识点</span>
                    </div>
                    {report.knowledge_points?.weak_points?.length > 0 ? (
                      <div className="space-y-3">
                        {report.knowledge_points.weak_points.slice(0, 5).map((point, idx) => (
                          <KnowledgePointCard
                            key={idx}
                            name={point.name}
                            subject={point.subject}
                            correctRate={point.correct_rate}
                            trend={point.trend as "up" | "down" | "stable"}
                            isStrong={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-stone-400">暂无数据</div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* 本周成就 */}
            {report.achievements && report.achievements.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  本周成就
                </h2>
                <div className="grid gap-4">
                  {report.achievements.map((achievement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50"
                    >
                      <div className="text-3xl">{achievement.icon || "🏆"}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-stone-800">{achievement.title}</div>
                        <div className="text-sm text-stone-500">{achievement.description}</div>
                      </div>
                      <div className="text-xs text-stone-400">{achievement.unlocked_at}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AI 智能周报 */}
            {aiAnalysis && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI 智能周报
                </h2>

                {/* 本周总结 */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white mb-4">
                  <h3 className="flex items-center gap-2 font-semibold mb-3">
                    <BarChart3 className="w-5 h-5" />
                    本周总结
                  </h3>
                  <p className="text-purple-100 leading-relaxed">{aiAnalysis.summary}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 本周亮点 */}
                  <div className="bg-emerald-50 rounded-2xl p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-emerald-800 mb-3">
                      <Star className="w-5 h-5" />
                      本周亮点
                    </h3>
                    <div className="space-y-2">
                      {aiAnalysis.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 进步之处 */}
                  <div className="bg-blue-50 rounded-2xl p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-blue-800 mb-3">
                      <TrendingUp className="w-5 h-5" />
                      进步之处
                    </h3>
                    <div className="space-y-2">
                      {aiAnalysis.improvements.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                          <ArrowUpRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 需要注意 */}
                  <div className="bg-amber-50 rounded-2xl p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-amber-800 mb-3">
                      <AlertCircle className="w-5 h-5" />
                      需要注意
                    </h3>
                    <div className="space-y-2">
                      {aiAnalysis.needsAttention.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 下周建议 */}
                  <div className="bg-purple-50 rounded-2xl p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-purple-800 mb-3">
                      <Target className="w-5 h-5" />
                      下周建议
                    </h3>
                    <div className="space-y-2">
                      {aiAnalysis.nextWeekSuggestions.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-purple-700">
                          <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
            <h2 className="text-xl font-semibold text-stone-700 mb-2">暂无学习记录</h2>
            <p className="text-stone-500 mb-6">这一周还没有学习记录，快去学习吧！</p>
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
            href="/learn/report/daily"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">日报告</div>
              <div className="text-xs text-stone-400">查看今日学习详情</div>
            </div>
          </Link>
          <Link
            href="/learn/report/leaderboard"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">排行榜</div>
              <div className="text-xs text-stone-400">看看你的排名</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
