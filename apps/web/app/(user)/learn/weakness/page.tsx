"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Target,
  Lightbulb,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Clock,
  BookOpen,
  GraduationCap,
  FileText,
  Play,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Brain,
  Zap,
  BarChart3,
  PieChart,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@what-cse/ui";
import { useWeaknessAnalysis } from "@/hooks/useAILearningPath";
import { useAuthStore } from "@/stores/authStore";
import type {
  WeaknessAnalysisResult,
  WeakKnowledgePoint,
  WeakQuestionType,
  ErrorPattern,
  ImprovementPlan,
  ImprovementPhase,
  ImprovementRecommendation,
  TypicalMistake,
} from "@/services/api/ai-learning";

// =====================================================
// 主组件
// =====================================================

export default function WeaknessAnalysisPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    loading,
    analysis: apiAnalysis,
    mistakes: apiMistakes,
    fetchWeaknessAnalysis,
    fetchTypicalMistakes,
    analyzeWeakness,
    generateSpecializedPractice,
  } = useWeaknessAnalysis();

  const [activeTab, setActiveTab] = useState<"overview" | "details" | "plan">("overview");
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  // 加载薄弱点分析数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchWeaknessAnalysis();
      fetchTypicalMistakes();
    }
  }, [isAuthenticated, fetchWeaknessAnalysis, fetchTypicalMistakes]);

  // 使用API数据
  const analysis = apiAnalysis;
  const typicalMistakes = apiMistakes;

  // 开始专项练习
  const handleStartPractice = async (knowledgePoint: string) => {
    try {
      await generateSpecializedPractice({ knowledge_point: knowledgePoint, count: 20 });
      // TODO: 跳转到专项练习页面
    } catch (error) {
      // Error handled in hook
    }
  };

  // 重新分析
  const handleRefresh = async () => {
    try {
      await analyzeWeakness({});
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-500">正在分析您的学习数据...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-stone-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>暂无足够数据进行分析</p>
        <p className="text-sm mt-2">请先完成至少50道练习题</p>
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
                <h1 className="text-xl font-bold text-stone-800">AI 薄弱点分析</h1>
                <p className="text-sm text-stone-500">基于 {analysis.total_questions} 道题目的分析结果</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 综合评分卡片 */}
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm text-red-100">AI 智能诊断</span>
              </div>
              <h2 className="text-3xl font-bold mb-1">{analysis.overall_score} 分</h2>
              <p className="text-red-100">综合能力评分</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{analysis.correct_rate}%</p>
              <p className="text-sm text-red-100">总正确率</p>
            </div>
          </div>

          {/* 薄弱科目概览 */}
          <div className="grid grid-cols-4 gap-4">
            {analysis.weak_question_types.slice(0, 4).map((type) => (
              <div key={type.type} className="text-center">
                <p className="text-2xl font-bold">{type.correct_rate}%</p>
                <p className="text-xs text-red-100">{type.type_name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm">
          {[
            { id: "overview" as const, label: "薄弱概览", icon: PieChart },
            { id: "details" as const, label: "详细分析", icon: BarChart3 },
            { id: "plan" as const, label: "改进计划", icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-red-500 text-white"
                  : "text-stone-600 hover:bg-stone-50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 薄弱概览 */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 薄弱知识点列表 */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                薄弱知识点
                <span className="ml-2 text-sm font-normal text-stone-500">
                  共 {analysis.weak_knowledge_points.length} 个需要加强
                </span>
              </h3>

              <div className="space-y-3">
                {analysis.weak_knowledge_points.map((point) => (
                  <WeakPointCard
                    key={point.id}
                    point={point}
                    onPractice={() => handleStartPractice(point.name)}
                  />
                ))}
              </div>
            </section>

            {/* 典型错题 */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                <FileText className="w-5 h-5 text-amber-500" />
                典型错题
              </h3>

              <div className="space-y-4">
                {typicalMistakes.map((mistake) => (
                  <MistakeCard key={mistake.questionId} mistake={mistake} />
                ))}
              </div>

              <Link
                href="/learn/mistakes"
                className="flex items-center justify-center gap-2 mt-4 py-2 text-amber-600 hover:text-amber-700 transition-colors"
              >
                查看全部错题
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          </div>
        )}

        {/* 详细分析 */}
        {activeTab === "details" && (
          <div className="space-y-6">
            {/* 错误模式分析 */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                <Brain className="w-5 h-5 text-purple-500" />
                错误模式分析
              </h3>

              <div className="space-y-3">
                {analysis.error_patterns.map((pattern) => (
                  <ErrorPatternCard
                    key={pattern.pattern_id}
                    pattern={pattern}
                    isExpanded={expandedPattern === pattern.pattern_id}
                    onToggle={() =>
                      setExpandedPattern(
                        expandedPattern === pattern.pattern_id ? null : pattern.pattern_id
                      )
                    }
                  />
                ))}
              </div>
            </section>

            {/* 科目能力分析 */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                科目能力分析
              </h3>

              <div className="space-y-4">
                {analysis.weak_question_types.map((type) => (
                  <SubjectAnalysisBar key={type.type} subject={type} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 改进计划 */}
        {activeTab === "plan" && analysis.improvement_plan && (
          <div className="space-y-6">
            {/* 改进计划概览 */}
            <section className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm text-emerald-100">AI 生成的专项提升计划</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{analysis.improvement_plan.title}</h3>
              <p className="text-emerald-100 mb-4">{analysis.improvement_plan.description}</p>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{analysis.improvement_plan.total_days} 天计划</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>每日 {analysis.improvement_plan.daily_minutes} 分钟</span>
                </div>
              </div>
            </section>

            {/* 改进阶段 */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                <Zap className="w-5 h-5 text-amber-500" />
                执行阶段
              </h3>

              <div className="space-y-4">
                {analysis.improvement_plan.phases.map((phase, index) => (
                  <ImprovementPhaseCard
                    key={phase.phase_id}
                    phase={phase}
                    index={index}
                  />
                ))}
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                <h4 className="font-medium text-emerald-800 mb-2">预期效果</h4>
                <p className="text-sm text-emerald-700">
                  {analysis.improvement_plan.expected_outcome}
                </p>
              </div>
            </section>

            {/* 改进建议 */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                AI 改进建议
              </h3>

              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            </section>

            {/* 开始按钮 */}
            <button className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              立即开始专项突破
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// =====================================================
// 子组件
// =====================================================

// 薄弱知识点卡片
function WeakPointCard({
  point,
  onPractice,
}: {
  point: WeakKnowledgePoint;
  onPractice: () => void;
}) {
  const severityConfig = {
    critical: { color: "text-red-600", bg: "bg-red-100", label: "严重" },
    high: { color: "text-orange-600", bg: "bg-orange-100", label: "较弱" },
    medium: { color: "text-amber-600", bg: "bg-amber-100", label: "一般" },
    low: { color: "text-emerald-600", bg: "bg-emerald-100", label: "较好" },
  };

  const trendIcon = {
    improving: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    stable: <Minus className="w-4 h-4 text-stone-400" />,
    declining: <TrendingDown className="w-4 h-4 text-red-500" />,
  };

  const config = severityConfig[point.severity_level] || severityConfig.medium;

  return (
    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bg)}>
        <span className={cn("text-xl font-bold", config.color)}>
          {point.correct_rate}%
        </span>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-stone-800">{point.name}</h4>
          <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", config.bg, config.color)}>
            {config.label}
          </span>
          {trendIcon[point.trend]}
        </div>
        <p className="text-sm text-stone-500">{point.category}</p>
        <div className="flex items-center gap-4 mt-1 text-xs text-stone-400">
          <span>共 {point.total_count} 题</span>
          <span>正确 {point.correct_count} 题</span>
          <span>平均用时 {Math.round(point.avg_time)}秒</span>
        </div>
      </div>

      <button
        onClick={onPractice}
        className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
      >
        专项练习
      </button>
    </div>
  );
}

// 典型错题卡片
function MistakeCard({ mistake }: { mistake: TypicalMistake }) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="p-4 border border-stone-200 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">
          {mistake.knowledge_point}
        </span>
        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs">
          {mistake.error_type}
        </span>
      </div>

      <p className="text-stone-700 mb-3">{mistake.question_content}</p>

      <div className="flex items-center gap-4 text-sm mb-3">
        <span className="text-red-600">
          您的答案: {mistake.user_answer}
        </span>
        <span className="text-emerald-600">
          正确答案: {mistake.correct_answer}
        </span>
      </div>

      <button
        onClick={() => setShowAnalysis(!showAnalysis)}
        className="flex items-center gap-1 text-amber-600 text-sm hover:text-amber-700"
      >
        <Lightbulb className="w-4 h-4" />
        {showAnalysis ? "收起解析" : "查看解析"}
        <ChevronDown className={cn("w-4 h-4 transition-transform", showAnalysis && "rotate-180")} />
      </button>

      {showAnalysis && (
        <div className="mt-3 p-3 bg-amber-50 rounded-lg text-sm text-stone-700">
          {mistake.analysis}
        </div>
      )}
    </div>
  );
}

// 错误模式卡片
function ErrorPatternCard({
  pattern,
  isExpanded,
  onToggle,
}: {
  pattern: ErrorPattern;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors"
      >
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-purple-500" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-medium text-stone-800">{pattern.pattern_name}</h4>
          <p className="text-sm text-stone-500">{pattern.description}</p>
        </div>
        <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm font-medium">
          {pattern.frequency} 次
        </span>
        <ChevronDown
          className={cn("w-5 h-5 text-stone-400 transition-transform", isExpanded && "rotate-180")}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <h5 className="text-sm font-medium text-stone-700 mb-2">可能原因</h5>
            <ul className="space-y-1">
              {pattern.causes.map((cause, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="text-red-500">•</span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium text-stone-700 mb-2">解决方案</h5>
            <ul className="space-y-1">
              {pattern.solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-stone-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  {solution}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// 科目分析条
function SubjectAnalysisBar({ subject }: { subject: WeakQuestionType }) {
  const getBarColor = (rate: number) => {
    if (rate >= 75) return "bg-emerald-500";
    if (rate >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-stone-800">{subject.type_name}</span>
        <span className="text-sm text-stone-600">
          {subject.correct_rate}% ({subject.correct_count}/{subject.total_count})
        </span>
      </div>
      <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getBarColor(subject.correct_rate))}
          style={{ width: `${subject.correct_rate}%` }}
        />
      </div>
      {subject.common_mistakes.length > 0 && (
        <p className="text-xs text-stone-500 mt-1">
          常见错误: {subject.common_mistakes.join("、")}
        </p>
      )}
    </div>
  );
}

// 改进阶段卡片
function ImprovementPhaseCard({
  phase,
  index,
}: {
  phase: ImprovementPhase;
  index: number;
}) {
  return (
    <div className="relative pl-8 pb-4">
      {/* 时间线 */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center">
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {index + 1}
        </div>
        {index < 2 && <div className="flex-1 w-0.5 bg-amber-200" />}
      </div>

      <div className="bg-stone-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-stone-800">{phase.name}</h4>
          <span className="text-sm text-stone-500">{phase.days} 天</span>
        </div>
        <p className="text-sm text-stone-600 mb-3">{phase.description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {phase.focus.map((item, i) => (
            <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
              {item}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          {phase.goals.map((goal, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-stone-600">
              <Target className="w-4 h-4 text-amber-500" />
              {goal}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 建议卡片
function RecommendationCard({ recommendation }: { recommendation: ImprovementRecommendation }) {
  const typeConfig = {
    knowledge: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-100" },
    skill: { icon: Zap, color: "text-purple-500", bg: "bg-purple-100" },
    strategy: { icon: Target, color: "text-emerald-500", bg: "bg-emerald-100" },
    mindset: { icon: Brain, color: "text-amber-500", bg: "bg-amber-100" },
  };

  const config = typeConfig[recommendation.type] || typeConfig.knowledge;
  const Icon = config.icon;

  return (
    <div className="p-4 border border-stone-200 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-stone-800">{recommendation.title}</h4>
          <p className="text-sm text-stone-500">{recommendation.description}</p>
        </div>
        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs">
          优先级 {recommendation.priority}
        </span>
      </div>

      <div className="space-y-1">
        {recommendation.action_items.map((item, index) => (
          <div key={index} className="flex items-start gap-2 text-sm text-stone-600">
            <CheckCircle2 className="w-4 h-4 text-stone-400 mt-0.5" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
