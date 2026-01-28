"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Link,
  Play,
  List,
  FileText,
  Zap,
} from "lucide-react";

// 解题步骤
export interface SolutionStep {
  order: number;
  title: string;
  description: string;
  tips?: string;
  keyPoint?: boolean;
}

// 典型例题
export interface ExampleQuestion {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  analysis: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  source?: string;
}

// 常见错误
export interface CommonMistake {
  title: string;
  description: string;
  howToAvoid: string;
}

// 关联知识点
export interface RelatedKnowledge {
  id: string;
  title: string;
  type: "prerequisite" | "related" | "advanced";
}

// 题型数据
export interface QuestionTypeData {
  id: string;
  name: string;
  category: string;
  description: string;
  characteristics?: string[];
  solutionSteps: SolutionStep[];
  examples: ExampleQuestion[];
  commonMistakes?: CommonMistake[];
  tips?: string[];
  relatedKnowledge?: RelatedKnowledge[];
  timeRecommendation?: number; // 建议用时（秒）
  difficulty?: 1 | 2 | 3 | 4 | 5;
  frequency?: "high" | "medium" | "low"; // 出题频率
}

interface QuestionTypeGuideProps {
  data: QuestionTypeData;
  onKnowledgeClick?: (id: string) => void;
  onExamplePractice?: (example: ExampleQuestion) => void;
  className?: string;
}

// 难度标签
function DifficultyBadge({ level }: { level: number }) {
  const config = {
    1: { label: "简单", color: "bg-emerald-100 text-emerald-700" },
    2: { label: "较易", color: "bg-green-100 text-green-700" },
    3: { label: "中等", color: "bg-amber-100 text-amber-700" },
    4: { label: "较难", color: "bg-orange-100 text-orange-700" },
    5: { label: "困难", color: "bg-red-100 text-red-700" },
  }[level] || { label: "未知", color: "bg-stone-100 text-stone-700" };

  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.color)}>
      {config.label}
    </span>
  );
}

// 出题频率标签
function FrequencyBadge({ frequency }: { frequency: string }) {
  const config = {
    high: { label: "高频考点", color: "bg-red-100 text-red-600", icon: TrendingUp },
    medium: { label: "常规考点", color: "bg-amber-100 text-amber-600", icon: Target },
    low: { label: "偶考", color: "bg-stone-100 text-stone-600", icon: FileText },
  }[frequency] || { label: "未知", color: "bg-stone-100 text-stone-600", icon: FileText };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
        config.color
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// 例题卡片
function ExampleCard({
  example,
  index,
  expanded,
  onToggle,
  onPractice,
}: {
  example: ExampleQuestion;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onPractice?: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const isCorrect = example.options
    ? selectedOption === example.options.indexOf(example.answer)
    : false;

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* 头部 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-medium flex items-center justify-center">
            {index + 1}
          </span>
          <div className="text-left">
            <p className="font-medium text-stone-800">例题 {index + 1}</p>
            <div className="flex items-center gap-2 mt-1">
              <DifficultyBadge level={example.difficulty} />
              {example.source && (
                <span className="text-xs text-stone-500">{example.source}</span>
              )}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-stone-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-stone-400" />
        )}
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="border-t border-stone-100 p-4 space-y-4">
          {/* 题目 */}
          <div className="bg-stone-50 rounded-lg p-4">
            <p className="text-stone-700 leading-relaxed">{example.question}</p>
          </div>

          {/* 选项 */}
          {example.options && (
            <div className="space-y-2">
              {example.options.map((option, optIndex) => {
                const isSelected = selectedOption === optIndex;
                const isAnswer = option === example.answer;
                const showResult = showAnswer && isSelected;

                return (
                  <button
                    key={optIndex}
                    onClick={() => {
                      if (!showAnswer) {
                        setSelectedOption(optIndex);
                      }
                    }}
                    disabled={showAnswer}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all",
                      isSelected && !showAnswer && "border-amber-400 bg-amber-50",
                      showAnswer && isAnswer && "border-emerald-400 bg-emerald-50",
                      showAnswer && isSelected && !isAnswer && "border-red-400 bg-red-50",
                      !isSelected && !showAnswer && "border-stone-200 hover:border-stone-300",
                      showAnswer && !isAnswer && !isSelected && "border-stone-200 opacity-60"
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0",
                        isSelected && !showAnswer && "border-amber-500 text-amber-600",
                        showAnswer && isAnswer && "border-emerald-500 text-emerald-600 bg-emerald-100",
                        showAnswer && isSelected && !isAnswer && "border-red-500 text-red-600",
                        !isSelected && !showAnswer && "border-stone-300 text-stone-500"
                      )}
                    >
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className="flex-1 text-stone-700">{option}</span>
                    {showAnswer && isAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    {showAnswer && isSelected && !isAnswer && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {!showAnswer && selectedOption !== null && (
              <button
                onClick={() => setShowAnswer(true)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                确认答案
              </button>
            )}
            {showAnswer && (
              <button
                onClick={() => {
                  setShowAnswer(false);
                  setSelectedOption(null);
                }}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                重新作答
              </button>
            )}
            {onPractice && (
              <button
                onClick={onPractice}
                className="px-4 py-2 border border-amber-500 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors flex items-center gap-1"
              >
                <Play className="w-4 h-4" />
                开始练习
              </button>
            )}
          </div>

          {/* 答案解析 */}
          {showAnswer && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h5 className="flex items-center gap-2 font-medium text-blue-800 mb-2">
                <Lightbulb className="w-4 h-4" />
                答案解析
              </h5>
              <p className="text-sm text-blue-700 leading-relaxed">
                {example.analysis}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuestionTypeGuide({
  data,
  onKnowledgeClick,
  onExamplePractice,
  className,
}: QuestionTypeGuideProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["steps", "examples"])
  );
  const [expandedExample, setExpandedExample] = useState<number | null>(0);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* 头部信息 */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                {data.category}
              </span>
              {data.difficulty && <DifficultyBadge level={data.difficulty} />}
              {data.frequency && <FrequencyBadge frequency={data.frequency} />}
            </div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">
              {data.name}
            </h1>
            <p className="text-stone-600">{data.description}</p>
          </div>

          {data.timeRecommendation && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-amber-500" />
              <div className="text-right">
                <p className="text-lg font-bold text-stone-800">
                  {Math.floor(data.timeRecommendation / 60)}:{(data.timeRecommendation % 60).toString().padStart(2, "0")}
                </p>
                <p className="text-xs text-stone-500">建议用时</p>
              </div>
            </div>
          )}
        </div>

        {/* 题型特点 */}
        {data.characteristics && data.characteristics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-200/50">
            <h4 className="text-sm font-semibold text-stone-700 mb-2">
              题型特点
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.characteristics.map((char, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white rounded-full text-sm text-stone-600 shadow-sm"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 解题步骤 */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          onClick={() => toggleSection("steps")}
          className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
            <List className="w-5 h-5 text-amber-500" />
            解题步骤
          </h2>
          {expandedSections.has("steps") ? (
            <ChevronUp className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          )}
        </button>

        {expandedSections.has("steps") && (
          <div className="border-t border-stone-100 p-4">
            <div className="space-y-4">
              {data.solutionSteps.map((step, index) => (
                <div
                  key={step.order}
                  className={cn(
                    "relative pl-8",
                    index < data.solutionSteps.length - 1 && "pb-4"
                  )}
                >
                  {/* 连接线 */}
                  {index < data.solutionSteps.length - 1 && (
                    <div className="absolute left-[14px] top-7 bottom-0 w-0.5 bg-amber-200" />
                  )}

                  {/* 步骤号 */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                      step.keyPoint
                        ? "bg-amber-500 text-white"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {step.order}
                  </div>

                  {/* 内容 */}
                  <div>
                    <h4 className="font-medium text-stone-800 flex items-center gap-2">
                      {step.title}
                      {step.keyPoint && (
                        <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                          关键
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-stone-600 mt-1">
                      {step.description}
                    </p>
                    {step.tips && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {step.tips}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 典型例题 */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          onClick={() => toggleSection("examples")}
          className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            典型例题
            <span className="text-sm font-normal text-stone-500">
              ({data.examples.length}题)
            </span>
          </h2>
          {expandedSections.has("examples") ? (
            <ChevronUp className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          )}
        </button>

        {expandedSections.has("examples") && (
          <div className="border-t border-stone-100 p-4 space-y-3">
            {data.examples.map((example, index) => (
              <ExampleCard
                key={example.id}
                example={example}
                index={index}
                expanded={expandedExample === index}
                onToggle={() =>
                  setExpandedExample(expandedExample === index ? null : index)
                }
                onPractice={() => onExamplePractice?.(example)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 常见错误 */}
      {data.commonMistakes && data.commonMistakes.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <button
            onClick={() => toggleSection("mistakes")}
            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              常见错误
            </h2>
            {expandedSections.has("mistakes") ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </button>

          {expandedSections.has("mistakes") && (
            <div className="border-t border-stone-100 p-4 space-y-3">
              {data.commonMistakes.map((mistake, index) => (
                <div
                  key={index}
                  className="bg-red-50 rounded-lg p-4 border border-red-100"
                >
                  <h4 className="font-medium text-red-800 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {mistake.title}
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {mistake.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm text-emerald-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>避免方法：</strong>
                        {mistake.howToAvoid}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 解题技巧 */}
      {data.tips && data.tips.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <button
            onClick={() => toggleSection("tips")}
            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
              <Zap className="w-5 h-5 text-amber-500" />
              解题技巧
            </h2>
            {expandedSections.has("tips") ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </button>

          {expandedSections.has("tips") && (
            <div className="border-t border-stone-100 p-4">
              <ul className="space-y-2">
                {data.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-stone-600"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 关联知识点 */}
      {data.relatedKnowledge && data.relatedKnowledge.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <button
            onClick={() => toggleSection("related")}
            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800">
              <Link className="w-5 h-5 text-violet-500" />
              关联知识点
            </h2>
            {expandedSections.has("related") ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </button>

          {expandedSections.has("related") && (
            <div className="border-t border-stone-100 p-4">
              <div className="space-y-3">
                {/* 前置知识 */}
                {data.relatedKnowledge.filter((k) => k.type === "prerequisite").length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-stone-500 mb-2">
                      前置知识
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.relatedKnowledge
                        .filter((k) => k.type === "prerequisite")
                        .map((knowledge) => (
                          <button
                            key={knowledge.id}
                            onClick={() => onKnowledgeClick?.(knowledge.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                          >
                            {knowledge.title}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* 相关知识 */}
                {data.relatedKnowledge.filter((k) => k.type === "related").length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-stone-500 mb-2">
                      相关知识
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.relatedKnowledge
                        .filter((k) => k.type === "related")
                        .map((knowledge) => (
                          <button
                            key={knowledge.id}
                            onClick={() => onKnowledgeClick?.(knowledge.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-sm hover:bg-stone-200 transition-colors"
                          >
                            {knowledge.title}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* 进阶知识 */}
                {data.relatedKnowledge.filter((k) => k.type === "advanced").length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-stone-500 mb-2">
                      进阶学习
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.relatedKnowledge
                        .filter((k) => k.type === "advanced")
                        .map((knowledge) => (
                          <button
                            key={knowledge.id}
                            onClick={() => onKnowledgeClick?.(knowledge.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-sm hover:bg-violet-100 transition-colors"
                          >
                            {knowledge.title}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionTypeGuide;
