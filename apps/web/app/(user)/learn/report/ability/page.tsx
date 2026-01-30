"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  ChevronRight,
  Calendar,
  Loader2,
  BarChart3,
  Star,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Lightbulb,
  AlertCircle,
  BookOpen,
  Brain,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import {
  useAIAbilityReport,
  formatPercent,
  getSubjectLabel,
  getSubjectColorClass,
  getRankColor,
} from "@/hooks/useLearningStats";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

// 雷达图组件
function RadarChart({ data }: { data: { dimension: string; value: number; full_mark: number }[] }) {
  if (!data || data.length === 0) return null;

  const size = 200;
  const center = size / 2;
  const radius = 80;
  const angleStep = (2 * Math.PI) / data.length;

  // 计算多边形点
  const getPoint = (index: number, value: number, maxValue: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxValue) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // 生成多边形路径
  const polygonPoints = data
    .map((d, i) => {
      const point = getPoint(i, d.value, d.full_mark);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  // 背景网格
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景网格 */}
        {gridLevels.map((level, idx) => (
          <polygon
            key={idx}
            points={data
              .map((_, i) => {
                const point = getPoint(i, level * 100, 100);
                return `${point.x},${point.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="1"
          />
        ))}

        {/* 轴线 */}
        {data.map((_, i) => {
          const point = getPoint(i, 100, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#e5e5e5"
              strokeWidth="1"
            />
          );
        })}

        {/* 数据区域 */}
        <polygon
          points={polygonPoints}
          fill="rgba(245, 158, 11, 0.2)"
          stroke="#f59e0b"
          strokeWidth="2"
        />

        {/* 数据点 */}
        {data.map((d, i) => {
          const point = getPoint(i, d.value, d.full_mark);
          return (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#f59e0b"
            />
          );
        })}

        {/* 标签 */}
        {data.map((d, i) => {
          const labelRadius = radius + 25;
          const angle = i * angleStep - Math.PI / 2;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-stone-600"
            >
              {d.dimension}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// 科目能力卡片
function SubjectAbilityCard({
  subject,
  subjectName,
  score,
  correctRate,
  rank,
  trend,
}: {
  subject: string;
  subjectName: string;
  score: number;
  correctRate: number;
  rank: string;
  trend: "up" | "down" | "stable";
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-stone-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getSubjectColorClass(subject)} flex items-center justify-center`}>
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-stone-700">{subjectName}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded ${getRankColor(rank)}`}>
          {rank}级
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">能力分</span>
          <span className="font-semibold text-stone-800">{Math.round(score)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">正确率</span>
          <span className="font-semibold text-stone-800">{formatPercent(correctRate)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">趋势</span>
          <div className={`flex items-center gap-1 ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-stone-400"
          }`}>
            {trend === "up" ? (
              <>
                <ArrowUpRight className="w-4 h-4" />
                <span>上升</span>
              </>
            ) : trend === "down" ? (
              <>
                <ArrowDownRight className="w-4 h-4" />
                <span>下降</span>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4" />
                <span>稳定</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 题型统计卡片
function QuestionTypeCard({
  typeName,
  totalCount,
  correctRate,
  avgTime,
  isWeak,
}: {
  typeName: string;
  totalCount: number;
  correctRate: number;
  avgTime: number;
  isWeak: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${isWeak ? "bg-red-50" : "bg-stone-50"}`}>
      <div className="flex items-center gap-3">
        {isWeak ? (
          <XCircle className="w-5 h-5 text-red-500" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
        <div>
          <div className="font-medium text-stone-700">{typeName}</div>
          <div className="text-xs text-stone-500">{totalCount}题 · 平均{avgTime}秒/题</div>
        </div>
      </div>
      <span className={`font-semibold ${isWeak ? "text-red-600" : "text-green-600"}`}>
        {formatPercent(correctRate)}
      </span>
    </div>
  );
}

// 进步曲线
function ProgressCurve({ data }: { data: { date: string; score: number; correct_rate: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>暂无进步数据</p>
      </div>
    );
  }

  const maxScore = Math.max(...data.map(d => d.score), 100);
  const minScore = Math.min(...data.map(d => d.score), 0);
  const range = maxScore - minScore || 1;

  return (
    <div className="h-40 flex items-end gap-1">
      {data.slice(-14).map((item, idx) => {
        const height = ((item.score - minScore) / range) * 100;
        return (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center group"
          >
            <div className="flex-1 w-full flex items-end">
              <div
                className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t transition-all hover:opacity-80"
                style={{ height: `${Math.max(height, 5)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-stone-400 hidden group-hover:block">
              {formatPercent(item.correct_rate)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AbilityReportPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading, report, fetchAIAbilityReport } = useAIAbilityReport();
  const [showAIInterpretation, setShowAIInterpretation] = useState(false);
  const [expandedStrategy, setExpandedStrategy] = useState<number | null>(null);

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchAIAbilityReport();
    }
  }, [isAuthenticated, fetchAIAbilityReport]);

  // 从 API 获取 AI 分析数据
  const aiAnalysis = report?.ai_analysis;
  const radarInterpretation = aiAnalysis?.radar_interpretation;
  const comparisonAnalysis = aiAnalysis?.comparison_analysis;
  const improvementPlan = aiAnalysis?.improvement_plan;

  // 转换雷达图解读数据
  const strengthAreas = radarInterpretation?.dimension_analysis?.filter(d => d.level === "优秀" || d.level === "良好") || [];
  const weaknessAreas = radarInterpretation?.dimension_analysis?.filter(d => d.level === "待提升" || d.level === "中等") || [];
  const keyInsights = [
    radarInterpretation?.strength_analysis,
    radarInterpretation?.weakness_analysis,
  ].filter(Boolean) as string[];

  // 未登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h2 className="text-xl font-semibold text-stone-700 mb-2">登录查看能力分析</h2>
          <p className="text-stone-500 mb-6">登录后即可查看你的能力分析报告</p>
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
            <h1 className="text-2xl font-bold text-stone-800">能力分析</h1>
          </div>
          <Link
            href="/learn/report/leaderboard"
            className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            排行榜 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : report ? (
          <>
            {/* 综合能力分 */}
            <section className="mb-8">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="text-white/80">综合能力分</span>
                    </div>
                    <div className="text-5xl font-bold">{Math.round(report.overall_score)}</div>
                    {report.comparison_with_avg && (
                      <div className="mt-2 text-sm text-white/80">
                        超过 {report.comparison_with_avg.percentile}% 的用户
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {report.predicted_score && (
                      <div>
                        <div className="text-sm text-white/80">预测分数区间</div>
                        <div className="text-xl font-semibold">
                          {Math.round(report.predicted_score.min_score)} - {Math.round(report.predicted_score.max_score)}
                        </div>
                        <div className="text-xs text-white/60">
                          置信度 {Math.round(report.predicted_score.confidence * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 能力雷达图 */}
            {report.radar_data && report.radar_data.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  能力雷达图
                </h2>
                <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                  <RadarChart data={report.radar_data} />
                </div>
              </section>
            )}

            {/* 各科目能力 */}
            {report.subject_scores && report.subject_scores.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  各科目能力
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {report.subject_scores.map((subject, idx) => (
                    <SubjectAbilityCard
                      key={idx}
                      subject={subject.subject}
                      subjectName={subject.subject_name}
                      score={subject.score}
                      correctRate={subject.correct_rate}
                      rank={subject.rank}
                      trend={subject.trend as "up" | "down" | "stable"}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 题型分析 */}
            {report.question_type_stats && report.question_type_stats.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  题型分析
                </h2>
                <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                  <div className="space-y-3">
                    {report.question_type_stats.map((type, idx) => (
                      <QuestionTypeCard
                        key={idx}
                        typeName={type.type_name}
                        totalCount={type.total_count}
                        correctRate={type.correct_rate}
                        avgTime={type.avg_time}
                        isWeak={type.is_weak}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 进步曲线 */}
            {report.progress_curve && report.progress_curve.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  进步曲线（近30天）
                </h2>
                <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                  <ProgressCurve data={report.progress_curve} />
                  <div className="mt-4 text-center text-sm text-stone-400">
                    正确率变化趋势
                  </div>
                </div>
              </section>
            )}

            {/* 与平均水平对比 */}
            {report.comparison_with_avg && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  与平均水平对比
                </h2>
                <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                  <div className="grid grid-cols-3 gap-6">
                    <ComparisonItem
                      label="能力分"
                      value={report.comparison_with_avg.overall_vs_avg}
                    />
                    <ComparisonItem
                      label="学习时长"
                      value={report.comparison_with_avg.study_time_vs_avg}
                      unit="分钟/天"
                    />
                    <ComparisonItem
                      label="正确率"
                      value={report.comparison_with_avg.correct_rate_vs_avg}
                      unit="%"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* AI 能力解读 */}
            {radarInterpretation && (
              <section className="mb-8">
                <button
                  onClick={() => setShowAIInterpretation(!showAIInterpretation)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white hover:from-purple-600 hover:to-indigo-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    <div className="text-left">
                      <h2 className="text-lg font-semibold">AI 智能解读</h2>
                      <p className="text-sm text-purple-100">点击展开查看 AI 生成的深度分析</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 transition-transform", showAIInterpretation && "rotate-180")} />
                </button>

                {showAIInterpretation && (
                  <div className="mt-4 space-y-6">
                    {/* 总体评价 */}
                    <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-800 mb-4">
                        <Brain className="w-5 h-5 text-purple-500" />
                        总体评价
                      </h3>
                      <p className="text-stone-600 leading-relaxed">{radarInterpretation.overall_summary}</p>
                      
                      {/* 关键洞察 */}
                      {keyInsights.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {keyInsights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              {insight}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 各维度详细分析 */}
                    {radarInterpretation.dimension_analysis && radarInterpretation.dimension_analysis.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-800 mb-4">
                          <Target className="w-5 h-5 text-purple-500" />
                          各维度能力解读
                        </h3>
                        <div className="space-y-4">
                          {radarInterpretation.dimension_analysis.map((dim, idx) => (
                            <div key={idx} className={cn(
                              "p-4 rounded-xl",
                              dim.level === "优秀" ? "bg-emerald-50" :
                              dim.level === "良好" ? "bg-blue-50" :
                              dim.level === "中等" ? "bg-amber-50" : "bg-red-50"
                            )}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-stone-700">{dim.dimension}</span>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    dim.level === "优秀" ? "bg-emerald-100 text-emerald-700" :
                                    dim.level === "良好" ? "bg-blue-100 text-blue-700" :
                                    dim.level === "中等" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                  )}>
                                    {dim.level}
                                  </span>
                                </div>
                                <span className={cn(
                                  "font-semibold",
                                  dim.level === "优秀" || dim.level === "良好" ? "text-emerald-600" : 
                                  dim.level === "中等" ? "text-amber-600" : "text-red-600"
                                )}>
                                  {dim.score}分
                                </span>
                              </div>
                              <p className="text-sm text-stone-500 mb-2">{dim.description}</p>
                              <p className="text-xs text-stone-600 bg-white/50 p-2 rounded-lg">{dim.tips}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 优势与薄弱分析 */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* 优势领域 */}
                      <div className="bg-emerald-50 rounded-2xl p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-800 mb-4">
                          <CheckCircle2 className="w-5 h-5" />
                          优势领域
                        </h3>
                        {strengthAreas.length > 0 ? (
                          <div className="space-y-4">
                            {strengthAreas.map((area, idx) => (
                              <div key={idx} className="bg-white rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-stone-700">{area.dimension}</span>
                                  <span className="text-emerald-600 font-semibold">{area.score}分</span>
                                </div>
                                <p className="text-sm text-stone-500 mb-2">{area.description}</p>
                                <p className="text-xs text-emerald-600">{area.tips}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-stone-500">暂无突出优势领域</p>
                        )}
                      </div>

                      {/* 薄弱领域 */}
                      <div className="bg-red-50 rounded-2xl p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-red-800 mb-4">
                          <AlertCircle className="w-5 h-5" />
                          需提升领域
                        </h3>
                        {weaknessAreas.length > 0 ? (
                          <div className="space-y-4">
                            {weaknessAreas.map((area, idx) => (
                              <div key={idx} className="bg-white rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-stone-700">{area.dimension}</span>
                                  <span className="text-red-600 font-semibold">{area.score}分</span>
                                </div>
                                <p className="text-sm text-stone-500 mb-2">{area.description}</p>
                                <p className="text-xs text-red-600">{area.tips}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-stone-500">各领域表现均衡</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* AI 对标分析 */}
            {comparisonAnalysis && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  AI 对标分析
                </h2>
                <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                  {/* 量化差距描述 */}
                  {comparisonAnalysis.quantified_gap && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl mb-6">
                      <p className="text-stone-700">{comparisonAnalysis.quantified_gap}</p>
                    </div>
                  )}

                  {/* 与目标差距 */}
                  {comparisonAnalysis.target_gap && (
                    <div className="mb-6">
                      <h4 className="font-medium text-stone-700 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        目标差距分析
                      </h4>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-stone-600">当前分数</span>
                          <span className="font-bold text-lg">{comparisonAnalysis.target_gap.current_score.toFixed(1)}</span>
                        </div>
                        <div className="h-4 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                            style={{ width: `${Math.min((comparisonAnalysis.target_gap.current_score / comparisonAnalysis.target_gap.target_score) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-stone-400">目标: {comparisonAnalysis.target_gap.target_score}分</span>
                          <span className={cn(
                            comparisonAnalysis.target_gap.gap_value <= 0 ? "text-emerald-500" : "text-red-500"
                          )}>
                            {comparisonAnalysis.target_gap.gap_value <= 0 ? "已达标" : `差距: ${comparisonAnalysis.target_gap.gap_value.toFixed(1)}分`}
                          </span>
                        </div>
                      </div>
                      <p className="text-stone-600 text-sm">{comparisonAnalysis.target_gap.gap_description}</p>
                      {comparisonAnalysis.target_gap.estimated_days > 0 && (
                        <p className="text-amber-600 text-sm mt-2">
                          预计需要 <span className="font-bold">{comparisonAnalysis.target_gap.estimated_days}</span> 天达成目标
                        </p>
                      )}

                      {/* 各科目差距 */}
                      {comparisonAnalysis.target_gap.subject_gaps && comparisonAnalysis.target_gap.subject_gaps.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h5 className="text-sm font-medium text-stone-600">各科目差距</h5>
                          {comparisonAnalysis.target_gap.subject_gaps.map((gap, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-20 text-sm font-medium text-stone-700">{gap.subject_name}</div>
                              <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    gap.priority <= 2 ? "bg-red-500" : gap.priority <= 3 ? "bg-amber-500" : "bg-emerald-500"
                                  )}
                                  style={{ width: `${Math.min((gap.current_score / gap.target_score) * 100, 100)}%` }}
                                />
                              </div>
                              <div className="w-24 text-right text-sm">
                                <span className="text-stone-600">{gap.current_score.toFixed(0)}</span>
                                <span className="text-stone-400"> / {gap.target_score.toFixed(0)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 与平均水平对比 */}
                  {comparisonAnalysis.average_gap && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        与平均水平对比
                      </h4>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-stone-600">您的分数: {comparisonAnalysis.average_gap.current_score.toFixed(1)}</span>
                        <span className="text-stone-400">平均分数: {comparisonAnalysis.average_gap.average_score.toFixed(1)}</span>
                        <span className={cn(
                          "font-semibold",
                          comparisonAnalysis.average_gap.gap_value >= 0 ? "text-emerald-600" : "text-red-600"
                        )}>
                          {comparisonAnalysis.average_gap.gap_value >= 0 ? "+" : ""}{comparisonAnalysis.average_gap.gap_value.toFixed(1)}分
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">{comparisonAnalysis.average_gap.gap_description}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        您超过了 <span className="font-bold">{comparisonAnalysis.average_gap.percentile_rank}%</span> 的考生
                      </p>
                    </div>
                  )}

                  {/* 与优秀者对比 */}
                  {comparisonAnalysis.top_gap && (
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        与优秀者（前10%）对比
                      </h4>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-stone-600">您的分数: {comparisonAnalysis.top_gap.current_score.toFixed(1)}</span>
                        <span className="text-stone-400">优秀者平均: {comparisonAnalysis.top_gap.top_score.toFixed(1)}</span>
                        <span className={cn(
                          "font-semibold",
                          comparisonAnalysis.top_gap.gap_value <= 0 ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {comparisonAnalysis.top_gap.gap_value <= 0 ? "已达标" : `差距: ${comparisonAnalysis.top_gap.gap_value.toFixed(1)}分`}
                        </span>
                      </div>
                      <p className="text-sm text-amber-700">{comparisonAnalysis.top_gap.gap_description}</p>
                    </div>
                  )}

                  {/* 主要差距领域 */}
                  {comparisonAnalysis.key_gap_areas && comparisonAnalysis.key_gap_areas.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl">
                      <h4 className="font-medium text-red-800 mb-2">主要差距领域</h4>
                      <div className="flex flex-wrap gap-2">
                        {comparisonAnalysis.key_gap_areas.map((area, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white text-red-600 text-sm rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* AI 提升策略 */}
            {improvementPlan && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  AI 提升建议
                </h2>
                <div className="space-y-4">
                  {/* 短期策略 */}
                  {improvementPlan.short_term_strategy && (
                    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden">
                      <button
                        onClick={() => setExpandedStrategy(expandedStrategy === 0 ? null : 0)}
                        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100">
                            <span className="text-lg font-bold text-red-600">1</span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-stone-800">短期突破计划</h3>
                            <p className="text-sm text-stone-500">{improvementPlan.short_term_strategy.period} · 预计提升{improvementPlan.short_term_strategy.expected_gain}分</p>
                          </div>
                        </div>
                        <ChevronDown className={cn("w-5 h-5 text-stone-400 transition-transform", expandedStrategy === 0 && "rotate-180")} />
                      </button>
                      {expandedStrategy === 0 && (
                        <div className="px-4 pb-4">
                          <div className="ml-14 space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-stone-700 mb-2">目标</h4>
                              <ul className="space-y-1">
                                {improvementPlan.short_term_strategy.goals.map((goal, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                                    <Target className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    {goal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-stone-700 mb-2">行动建议</h4>
                              <ul className="space-y-1">
                                {improvementPlan.short_term_strategy.actions.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 中期策略 */}
                  {improvementPlan.medium_term_strategy && (
                    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden">
                      <button
                        onClick={() => setExpandedStrategy(expandedStrategy === 1 ? null : 1)}
                        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100">
                            <span className="text-lg font-bold text-amber-600">2</span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-stone-800">中期巩固计划</h3>
                            <p className="text-sm text-stone-500">{improvementPlan.medium_term_strategy.period} · 预计提升{improvementPlan.medium_term_strategy.expected_gain}分</p>
                          </div>
                        </div>
                        <ChevronDown className={cn("w-5 h-5 text-stone-400 transition-transform", expandedStrategy === 1 && "rotate-180")} />
                      </button>
                      {expandedStrategy === 1 && (
                        <div className="px-4 pb-4">
                          <div className="ml-14 space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-stone-700 mb-2">目标</h4>
                              <ul className="space-y-1">
                                {improvementPlan.medium_term_strategy.goals.map((goal, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                                    <Target className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    {goal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-stone-700 mb-2">行动建议</h4>
                              <ul className="space-y-1">
                                {improvementPlan.medium_term_strategy.actions.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 长期策略 */}
                  {improvementPlan.long_term_strategy && (
                    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden">
                      <button
                        onClick={() => setExpandedStrategy(expandedStrategy === 2 ? null : 2)}
                        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
                            <span className="text-lg font-bold text-emerald-600">3</span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-stone-800">长期提升规划</h3>
                            <p className="text-sm text-stone-500">{improvementPlan.long_term_strategy.period} · 预计提升{improvementPlan.long_term_strategy.expected_gain}分</p>
                          </div>
                        </div>
                        <ChevronDown className={cn("w-5 h-5 text-stone-400 transition-transform", expandedStrategy === 2 && "rotate-180")} />
                      </button>
                      {expandedStrategy === 2 && (
                        <div className="px-4 pb-4">
                          <div className="ml-14 space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-stone-700 mb-2">目标</h4>
                              <ul className="space-y-1">
                                {improvementPlan.long_term_strategy.goals.map((goal, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                                    <Target className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    {goal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-stone-700 mb-2">行动建议</h4>
                              <ul className="space-y-1">
                                {improvementPlan.long_term_strategy.actions.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 重点突破方向 */}
                  {improvementPlan.focus_areas && improvementPlan.focus_areas.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-800 mb-4">
                        <Sparkles className="w-5 h-5" />
                        重点突破方向
                      </h3>
                      <div className="space-y-4">
                        {improvementPlan.focus_areas.map((area, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                  area.priority === 1 ? "bg-red-500" : area.priority === 2 ? "bg-amber-500" : "bg-blue-500"
                                )}>
                                  {area.priority}
                                </span>
                                <span className="font-medium text-stone-800">{area.area}</span>
                              </div>
                              <span className="text-sm text-stone-500">预计{area.estimated_time}小时</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-stone-600 mb-2">
                              <span>当前: {area.current_level}</span>
                              <ArrowRight className="w-4 h-4 text-stone-400" />
                              <span>目标: {area.target_level}</span>
                            </div>
                            {area.recommend_tasks && (
                              <ul className="space-y-1 mt-2">
                                {area.recommend_tasks.map((task, taskIdx) => (
                                  <li key={taskIdx} className="text-sm text-stone-500 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-purple-400 rounded-full" />
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 周计划建议 */}
                  {improvementPlan.weekly_plan && improvementPlan.weekly_plan.length > 0 && (
                    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm p-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-800 mb-4">
                        <Calendar className="w-5 h-5 text-amber-500" />
                        周计划建议
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {improvementPlan.weekly_plan.map((week, idx) => (
                          <div key={idx} className="p-4 bg-stone-50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-stone-700">第{week.week}周</span>
                              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">{week.theme}</span>
                            </div>
                            <ul className="space-y-1 text-sm text-stone-600 mb-2">
                              {week.main_tasks.map((task, taskIdx) => (
                                <li key={taskIdx} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                            <div className="flex items-center gap-4 text-xs text-stone-500">
                              <span>目标: {Math.round(week.target_minutes / 60)}小时学习</span>
                              <span>{week.target_questions}题练习</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 激励建议 */}
                  {improvementPlan.motivational_tips && improvementPlan.motivational_tips.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-800 mb-4">
                        <Lightbulb className="w-5 h-5" />
                        学习建议
                      </h3>
                      <div className="space-y-2">
                        {improvementPlan.motivational_tips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-stone-600">
                            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Target className="w-16 h-16 mx-auto mb-4 text-stone-300" />
            <h2 className="text-xl font-semibold text-stone-700 mb-2">数据不足</h2>
            <p className="text-stone-500 mb-6">需要更多学习数据才能生成能力分析报告</p>
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
            href="/learn/report/weekly"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">周报告</div>
              <div className="text-xs text-stone-400">查看本周学习趋势</div>
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
  value,
  unit = "",
}: {
  label: string;
  value: number;
  unit?: string;
}) {
  const isPositive = value > 0;
  const isNeutral = Math.abs(value) < 0.5;

  return (
    <div className="text-center">
      <div className="text-sm text-stone-500 mb-2">{label}</div>
      <div className={`flex items-center justify-center gap-1 ${
        isNeutral ? "text-stone-400" : isPositive ? "text-green-600" : "text-red-600"
      }`}>
        {isNeutral ? (
          <Minus className="w-5 h-5" />
        ) : isPositive ? (
          <ArrowUpRight className="w-5 h-5" />
        ) : (
          <ArrowDownRight className="w-5 h-5" />
        )}
        <span className="text-lg font-semibold">
          {isNeutral ? "持平" : `${isPositive ? "+" : ""}${Math.round(value * 10) / 10}${unit}`}
        </span>
      </div>
    </div>
  );
}
