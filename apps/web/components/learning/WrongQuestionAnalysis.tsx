"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Brain,
  BookOpen,
  Target,
  ChevronRight,
  TrendingUp,
  Lightbulb,
  RotateCcw,
  Link2,
  PieChart,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// 错误类型
export type ErrorType = "careless" | "knowledge" | "method" | "calculation" | "understanding";

// 错因分析
export interface ErrorAnalysis {
  errorType: ErrorType;
  description: string;
  correctThinking: string;
}

// 推荐资料
export interface RecommendedResource {
  id: number;
  type: "course" | "chapter" | "article" | "video";
  title: string;
  description?: string;
  duration?: string;
}

// 相似题目
export interface SimilarQuestion {
  id: number;
  content: string;
  difficulty: number;
  source?: string;
}

// 错题统计
export interface ErrorStatistics {
  totalErrors: number;
  byType: { type: ErrorType; count: number; percentage: number }[];
  byKnowledge: { knowledgeId: number; name: string; count: number }[];
  frequentErrors: string[];
}

// 错题分析数据
export interface WrongQuestionData {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  errorAnalysis: ErrorAnalysis;
  reviewKnowledge: { id: number; name: string; priority: "high" | "medium" | "low" }[];
  recommendedResources: RecommendedResource[];
  similarQuestions: SimilarQuestion[];
  statistics?: ErrorStatistics;
}

// 组件Props
interface WrongQuestionAnalysisProps {
  data?: WrongQuestionData;
  questionId: number;
  userAnswer?: string;
  correctAnswer?: string;
  onKnowledgeClick?: (knowledgeId: number) => void;
  onResourceClick?: (resourceId: number, type: string) => void;
  onPracticeClick?: (questionId: number) => void;
  onRetryClick?: () => void;
  className?: string;
}

// 错误类型配置
const ERROR_TYPE_CONFIG: Record<
  ErrorType,
  { label: string; icon: typeof AlertTriangle; color: string; bgColor: string; description: string }
> = {
  careless: {
    label: "粗心大意",
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    description: "看错题目条件或计算失误",
  },
  knowledge: {
    label: "知识点缺失",
    icon: BookOpen,
    color: "text-red-600",
    bgColor: "bg-red-100",
    description: "相关知识点掌握不牢固",
  },
  method: {
    label: "方法错误",
    icon: Target,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "解题思路或方法选择有误",
  },
  calculation: {
    label: "计算错误",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description: "运算过程中出现错误",
  },
  understanding: {
    label: "理解偏差",
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "对题意理解不准确",
  },
};

// 错因分析卡片
function ErrorAnalysisCard({ analysis }: { analysis: ErrorAnalysis }) {
  const config = ERROR_TYPE_CONFIG[analysis.errorType];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* 错误类型标签 */}
      <div className={cn("p-4", config.bgColor)}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center">
            <Icon className={cn("w-6 h-6", config.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("font-bold text-lg", config.color)}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-stone-600">{config.description}</p>
          </div>
        </div>
      </div>

      {/* 具体错因 */}
      <div className="p-4 space-y-4">
        <div>
          <h4 className="font-medium text-stone-700 mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            具体错因分析
          </h4>
          <p className="text-sm text-stone-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {analysis.description}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-stone-700 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            正确思路引导
          </h4>
          <p className="text-sm text-stone-600 bg-green-50 p-3 rounded-lg border border-green-100">
            {analysis.correctThinking}
          </p>
        </div>
      </div>
    </div>
  );
}

// 推荐资料卡片
function ResourceCard({
  resource,
  onClick,
}: {
  resource: RecommendedResource;
  onClick?: () => void;
}) {
  const typeConfig = {
    course: { label: "课程", color: "text-blue-600", bgColor: "bg-blue-100" },
    chapter: { label: "章节", color: "text-green-600", bgColor: "bg-green-100" },
    article: { label: "文章", color: "text-purple-600", bgColor: "bg-purple-100" },
    video: { label: "视频", color: "text-amber-600", bgColor: "bg-amber-100" },
  };

  const config = typeConfig[resource.type];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors text-left"
    >
      <span
        className={cn(
          "px-2 py-1 text-xs font-medium rounded",
          config.bgColor,
          config.color
        )}
      >
        {config.label}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-700 truncate">
          {resource.title}
        </p>
        {resource.description && (
          <p className="text-xs text-stone-500 truncate">{resource.description}</p>
        )}
      </div>
      {resource.duration && (
        <span className="text-xs text-stone-400">{resource.duration}</span>
      )}
      <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />
    </button>
  );
}

// 相似题目卡片
function SimilarQuestionCard({
  question,
  onClick,
}: {
  question: SimilarQuestion;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 rounded-lg transition-all text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">难度:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className={cn(
                  "w-2 h-2 rounded-full",
                  star <= question.difficulty ? "bg-amber-400" : "bg-stone-200"
                )}
              />
            ))}
          </div>
        </div>
        {question.source && (
          <span className="text-xs text-stone-400">{question.source}</span>
        )}
      </div>
      <p className="text-sm text-stone-700 line-clamp-2">{question.content}</p>
    </button>
  );
}

// 错题统计组件
function ErrorStatisticsCard({ statistics }: { statistics: ErrorStatistics }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-amber-500" />
        错题统计分析
      </h3>

      {/* 错误类型分布 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-stone-600 mb-3">按错因分类</h4>
        <div className="space-y-2">
          {statistics.byType.map((item) => {
            const config = ERROR_TYPE_CONFIG[item.type];
            return (
              <div key={item.type} className="flex items-center gap-3">
                <span className="text-xs text-stone-600 w-20">{config.label}</span>
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", config.bgColor.replace("bg-", "bg-"))}
                    style={{ width: `${item.percentage}%`, backgroundColor: config.color.replace("text-", "").replace("-600", "") }}
                  />
                </div>
                <span className="text-xs text-stone-500 w-12 text-right">
                  {item.count}题 ({item.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 高频错误提醒 */}
      {statistics.frequentErrors.length > 0 && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            高频错误类型提醒
          </h4>
          <ul className="space-y-1">
            {statistics.frequentErrors.map((error, idx) => (
              <li key={idx} className="text-sm text-amber-600 flex items-start gap-2">
                <span>•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function WrongQuestionAnalysis({
  data,
  questionId,
  userAnswer,
  correctAnswer,
  onKnowledgeClick,
  onResourceClick,
  onPracticeClick,
  onRetryClick,
  className,
}: WrongQuestionAnalysisProps) {
  // 模拟数据
  const mockData: WrongQuestionData = {
    questionId,
    userAnswer: userAnswer || "A",
    correctAnswer: correctAnswer || "B",
    errorAnalysis: {
      errorType: "knowledge",
      description:
        "对行程问题中「相遇」与「追及」的概念混淆，导致错误使用了速度之差的公式。在相遇问题中，两人相向而行，应使用速度之和。",
      correctThinking:
        "首先判断运动类型：相向运动用速度和，同向运动用速度差。本题两人从两地相向出发，属于相遇问题，应该用「总路程÷速度和」来计算相遇时间。",
    },
    reviewKnowledge: [
      { id: 1, name: "行程问题基本公式", priority: "high" },
      { id: 2, name: "相遇问题", priority: "high" },
      { id: 3, name: "追及问题", priority: "medium" },
    ],
    recommendedResources: [
      {
        id: 1,
        type: "course",
        title: "行程问题专题突破",
        description: "系统讲解各类行程问题",
        duration: "45分钟",
      },
      {
        id: 2,
        type: "video",
        title: "相遇与追及辨析",
        description: "详细对比两种问题类型",
        duration: "15分钟",
      },
      {
        id: 3,
        type: "article",
        title: "行程问题常见错误总结",
        description: "避坑指南",
      },
    ],
    similarQuestions: [
      {
        id: 101,
        content: "甲乙两车从AB两地同时相向出发，甲车速度60km/h，乙车速度40km/h...",
        difficulty: 2,
        source: "2023国考",
      },
      {
        id: 102,
        content: "小明和小红分别从学校和家出发相向而行，10分钟后相遇...",
        difficulty: 3,
        source: "模拟题",
      },
      {
        id: 103,
        content: "两列火车从相距500km的两站同时相向开出...",
        difficulty: 3,
        source: "2022省考",
      },
    ],
    statistics: {
      totalErrors: 25,
      byType: [
        { type: "knowledge", count: 10, percentage: 40 },
        { type: "method", count: 7, percentage: 28 },
        { type: "careless", count: 5, percentage: 20 },
        { type: "calculation", count: 3, percentage: 12 },
      ],
      byKnowledge: [
        { knowledgeId: 1, name: "行程问题", count: 8 },
        { knowledgeId: 2, name: "数字推理", count: 6 },
        { knowledgeId: 3, name: "概率问题", count: 4 },
      ],
      frequentErrors: [
        "行程问题中相遇与追及概念混淆",
        "工程问题中效率与时间关系理解有误",
        "排列组合计算时遗漏或重复",
      ],
    },
  };

  const displayData = data || mockData;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 答题结果 */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
        <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-red-700">回答错误</p>
          <p className="text-sm text-red-600">
            你的答案：<span className="font-medium">{displayData.userAnswer}</span>
            ，正确答案：<span className="font-medium">{displayData.correctAnswer}</span>
          </p>
        </div>
        <button
          onClick={onRetryClick}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重做此题
        </button>
      </div>

      {/* AI 错因分析 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-stone-800">AI 错因分析</h3>
        </div>
        <ErrorAnalysisCard analysis={displayData.errorAnalysis} />
      </div>

      {/* AI 补救建议 */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          AI 补救建议
        </h3>

        {/* 需要复习的知识点 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-stone-600 mb-3">
            需要复习的知识点
          </h4>
          <div className="flex flex-wrap gap-2">
            {displayData.reviewKnowledge.map((knowledge) => (
              <button
                key={knowledge.id}
                onClick={() => onKnowledgeClick?.(knowledge.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  knowledge.priority === "high"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : knowledge.priority === "medium"
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                )}
              >
                <Brain className="w-4 h-4" />
                {knowledge.name}
                {knowledge.priority === "high" && (
                  <span className="text-xs">优先</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 推荐学习资料 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-stone-600 mb-3">
            推荐学习资料
          </h4>
          <div className="space-y-2">
            {displayData.recommendedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onClick={() => onResourceClick?.(resource.id, resource.type)}
              />
            ))}
          </div>
        </div>

        {/* 相似题目练习 */}
        <div>
          <h4 className="text-sm font-medium text-stone-600 mb-3">
            相似题目练习
          </h4>
          <div className="space-y-2">
            {displayData.similarQuestions.map((question) => (
              <SimilarQuestionCard
                key={question.id}
                question={question}
                onClick={() => onPracticeClick?.(question.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 错题统计 */}
      {displayData.statistics && (
        <ErrorStatisticsCard statistics={displayData.statistics} />
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onRetryClick}
          className="flex-1 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          重做此题
        </button>
        <button
          onClick={() => onPracticeClick?.(displayData.similarQuestions[0]?.id)}
          className="flex-1 py-3 border-2 border-amber-500 text-amber-600 font-medium rounded-xl hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          练习相似题
        </button>
      </div>
    </div>
  );
}

export default WrongQuestionAnalysis;
