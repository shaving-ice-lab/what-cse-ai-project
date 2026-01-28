"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Target,
  Brain,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  BookOpen,
  AlertTriangle,
  Link2,
  Copy,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useQuestionAIContent } from "@/hooks/useAIContent";

// 解题步骤
export interface SolutionStep {
  step: number;
  title: string;
  content: string;
  highlight?: boolean;
}

// 选项分析
export interface OptionAnalysis {
  option: string;
  content: string;
  isCorrect: boolean;
  explanation: string;
}

// 关联知识点
export interface RelatedKnowledge {
  id: number;
  name: string;
  description?: string;
  importance?: "high" | "medium" | "low";
}

// 解题技巧
export interface SolutionTip {
  type: "quick" | "trick" | "shortcut";
  title: string;
  content: string;
  applicability?: string;
}

// 题目解析数据
export interface QuestionAnalysisData {
  questionId: number;
  examPoints?: string[]; // 考点标注
  keyInfo?: string[]; // 关键信息提取
  solutionSteps?: SolutionStep[]; // 解题步骤
  optionAnalysis?: OptionAnalysis[]; // 选项分析
  tips?: SolutionTip[]; // 解题技巧
  relatedKnowledge?: RelatedKnowledge[]; // 关联知识点
  similarPoints?: string[]; // 相似考点
  confusionPoints?: string[]; // 易混淆点
}

// 组件Props
interface QuestionAnalysisProps {
  questionId: number;
  data?: QuestionAnalysisData;
  userAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  onKnowledgeClick?: (knowledgeId: number) => void;
  onCopy?: (content: string) => void;
  onBookmark?: () => void;
  className?: string;
}

// 考点标签组件
function ExamPointTag({ point }: { point: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
      <Target className="w-3 h-3" />
      {point}
    </span>
  );
}

// 解题步骤卡片
function SolutionStepCard({
  step,
  isLast,
}: {
  step: SolutionStep;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {/* 步骤指示器 */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            step.highlight
              ? "bg-amber-500 text-white"
              : "bg-stone-200 text-stone-600"
          )}
        >
          {step.step}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-stone-200 mt-2" />}
      </div>

      {/* 步骤内容 */}
      <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
        <h4
          className={cn(
            "font-medium mb-1",
            step.highlight ? "text-amber-700" : "text-stone-700"
          )}
        >
          {step.title}
        </h4>
        <p className="text-sm text-stone-600 leading-relaxed">{step.content}</p>
      </div>
    </div>
  );
}

// 选项分析卡片
function OptionAnalysisCard({ analysis }: { analysis: OptionAnalysis }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-colors",
        analysis.isCorrect
          ? "border-green-200 bg-green-50"
          : "border-stone-200 bg-white hover:bg-stone-50"
      )}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {analysis.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-stone-400" />
          )}
          <span
            className={cn(
              "font-medium",
              analysis.isCorrect ? "text-green-700" : "text-stone-700"
            )}
          >
            {analysis.option}. {analysis.content}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </div>
      {expanded && (
        <p className="mt-2 text-sm text-stone-600 pl-7">
          {analysis.explanation}
        </p>
      )}
    </div>
  );
}

// 解题技巧卡片
function TipCard({ tip }: { tip: SolutionTip }) {
  const typeConfig = {
    quick: {
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      label: "快速解法",
    },
    trick: {
      icon: Lightbulb,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      label: "技巧点拨",
    },
    shortcut: {
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      label: "秒杀方法",
    },
  };

  const config = typeConfig[tip.type];
  const Icon = config.icon;

  return (
    <div className="p-4 bg-white rounded-xl border border-stone-200">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            config.bgColor
          )}
        >
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      </div>
      <h4 className="font-medium text-stone-800 mb-1">{tip.title}</h4>
      <p className="text-sm text-stone-600">{tip.content}</p>
      {tip.applicability && (
        <p className="text-xs text-stone-400 mt-2">
          适用场景：{tip.applicability}
        </p>
      )}
    </div>
  );
}

// 知识点卡片
function KnowledgeCard({
  knowledge,
  onClick,
}: {
  knowledge: RelatedKnowledge;
  onClick?: () => void;
}) {
  const importanceColors = {
    high: "border-red-200 bg-red-50",
    medium: "border-amber-200 bg-amber-50",
    low: "border-stone-200 bg-stone-50",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg border text-left transition-all hover:shadow-md",
        importanceColors[knowledge.importance || "medium"]
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-stone-700">{knowledge.name}</span>
        <Link2 className="w-4 h-4 text-stone-400" />
      </div>
      {knowledge.description && (
        <p className="text-xs text-stone-500 line-clamp-2">
          {knowledge.description}
        </p>
      )}
    </button>
  );
}

export function QuestionAnalysis({
  questionId,
  data,
  userAnswer,
  correctAnswer,
  isCorrect,
  onKnowledgeClick,
  onCopy,
  onBookmark,
  className,
}: QuestionAnalysisProps) {
  const [activeSection, setActiveSection] = useState<string | null>("analysis");
  const { loading, analysis: aiAnalysis } = useQuestionAIContent(questionId);

  // 合并数据
  const analysisData = data || {
    examPoints: aiAnalysis?.content?.key_points || [],
    solutionSteps:
      aiAnalysis?.content?.solution_steps?.map((step, idx) => ({
        step: idx + 1,
        title: `步骤 ${idx + 1}`,
        content: step,
      })) || [],
    tips:
      aiAnalysis?.content?.quick_solution_tips?.map((tip) => ({
        type: "quick" as const,
        title: "快速解法",
        content: tip,
      })) || [],
  };

  // 模拟数据（实际使用时从API获取）
  const mockData: QuestionAnalysisData = {
    questionId,
    examPoints: analysisData.examPoints?.length
      ? analysisData.examPoints
      : ["数量关系", "行程问题", "相遇追及"],
    keyInfo: ["速度差", "时间相同", "距离比"],
    solutionSteps: analysisData.solutionSteps?.length
      ? analysisData.solutionSteps
      : [
          {
            step: 1,
            title: "审题提取关键信息",
            content:
              "从题目中提取出甲乙两人的速度、出发时间、行走方向等关键信息。",
          },
          {
            step: 2,
            title: "建立数量关系",
            content:
              "根据「路程=速度×时间」建立方程，设未知量为相遇时间 t。",
            highlight: true,
          },
          {
            step: 3,
            title: "列式求解",
            content: "根据两人速度之和乘以时间等于总路程，列出方程并求解。",
          },
          {
            step: 4,
            title: "验证答案",
            content: "将求得的时间代入检验，确保符合题目条件。",
          },
        ],
    optionAnalysis: [
      {
        option: "A",
        content: "2小时",
        isCorrect: false,
        explanation: "计算时忽略了乙的出发延迟时间，导致结果偏小。",
      },
      {
        option: "B",
        content: "2.5小时",
        isCorrect: true,
        explanation:
          "正确计算了两人的相遇时间，考虑了出发时间差和速度差。",
      },
      {
        option: "C",
        content: "3小时",
        isCorrect: false,
        explanation: "错误地使用了速度之差而非速度之和进行计算。",
      },
      {
        option: "D",
        content: "3.5小时",
        isCorrect: false,
        explanation: "计算过程中单位换算错误，导致结果偏大。",
      },
    ],
    tips: analysisData.tips?.length
      ? analysisData.tips
      : [
          {
            type: "quick",
            title: "速度和法",
            content:
              "相遇问题直接用「总路程÷速度和」计算，无需设未知数。",
            applicability: "同时出发的相遇问题",
          },
          {
            type: "trick",
            title: "比例法",
            content: "当速度比已知时，可直接通过比例关系求解时间。",
            applicability: "速度成比例的行程问题",
          },
        ],
    relatedKnowledge: [
      {
        id: 1,
        name: "行程问题基本公式",
        description: "路程=速度×时间的变形与应用",
        importance: "high",
      },
      {
        id: 2,
        name: "相遇问题",
        description: "两物体相向运动的时间计算",
        importance: "high",
      },
      {
        id: 3,
        name: "追及问题",
        description: "同向运动的追及时间计算",
        importance: "medium",
      },
    ],
    confusionPoints: ["相遇与追及的公式区别", "同时出发与不同时出发的处理"],
  };

  const displayData = data || mockData;

  // 切换展开区域
  const toggleSection = useCallback((section: string) => {
    setActiveSection((prev) => (prev === section ? null : section));
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* 答题结果提示 */}
      {typeof isCorrect === "boolean" && (
        <div
          className={cn(
            "p-4 rounded-xl flex items-center gap-3",
            isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          )}
        >
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-green-700">回答正确！</p>
                <p className="text-sm text-green-600">
                  你的答案：{userAnswer}
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-medium text-red-700">回答错误</p>
                <p className="text-sm text-red-600">
                  你的答案：{userAnswer}，正确答案：{correctAnswer}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* 考点标注 */}
      {displayData.examPoints && displayData.examPoints.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            考点标注
          </h3>
          <div className="flex flex-wrap gap-2">
            {displayData.examPoints.map((point, idx) => (
              <ExamPointTag key={idx} point={point} />
            ))}
          </div>
        </div>
      )}

      {/* AI 深度解析 */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          onClick={() => toggleSection("analysis")}
          className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-stone-800">AI 深度解析</h3>
              <p className="text-xs text-stone-500">分步骤解题思路</p>
            </div>
          </div>
          {activeSection === "analysis" ? (
            <ChevronUp className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          )}
        </button>

        {activeSection === "analysis" && (
          <div className="p-4 pt-0 space-y-4">
            {/* 关键信息提取 */}
            {displayData.keyInfo && displayData.keyInfo.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-700 mb-2">
                  关键信息提取：
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayData.keyInfo.map((info, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white text-amber-700 text-xs rounded border border-amber-200"
                    >
                      {info}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 解题步骤 */}
            {displayData.solutionSteps && displayData.solutionSteps.length > 0 && (
              <div className="space-y-0">
                {displayData.solutionSteps.map((step, idx) => (
                  <SolutionStepCard
                    key={step.step}
                    step={step}
                    isLast={idx === displayData.solutionSteps!.length - 1}
                  />
                ))}
              </div>
            )}

            {/* 选项分析 */}
            {displayData.optionAnalysis &&
              displayData.optionAnalysis.length > 0 && (
                <div>
                  <h4 className="font-medium text-stone-700 mb-3">选项逐一分析</h4>
                  <div className="space-y-2">
                    {displayData.optionAnalysis.map((analysis) => (
                      <OptionAnalysisCard
                        key={analysis.option}
                        analysis={analysis}
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* AI 解题技巧 */}
      {displayData.tips && displayData.tips.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <button
            onClick={() => toggleSection("tips")}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-stone-800">AI 解题技巧</h3>
                <p className="text-xs text-stone-500">
                  {displayData.tips.length} 个技巧
                </p>
              </div>
            </div>
            {activeSection === "tips" ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </button>

          {activeSection === "tips" && (
            <div className="p-4 pt-0 grid md:grid-cols-2 gap-3">
              {displayData.tips.map((tip, idx) => (
                <TipCard key={idx} tip={tip} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI 知识延伸 */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          onClick={() => toggleSection("knowledge")}
          className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-stone-800">AI 知识延伸</h3>
              <p className="text-xs text-stone-500">关联知识点与易混淆点</p>
            </div>
          </div>
          {activeSection === "knowledge" ? (
            <ChevronUp className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          )}
        </button>

        {activeSection === "knowledge" && (
          <div className="p-4 pt-0 space-y-4">
            {/* 关联知识点 */}
            {displayData.relatedKnowledge &&
              displayData.relatedKnowledge.length > 0 && (
                <div>
                  <h4 className="font-medium text-stone-700 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-stone-500" />
                    关联知识点
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {displayData.relatedKnowledge.map((knowledge) => (
                      <KnowledgeCard
                        key={knowledge.id}
                        knowledge={knowledge}
                        onClick={() => onKnowledgeClick?.(knowledge.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* 易混淆点 */}
            {displayData.confusionPoints &&
              displayData.confusionPoints.length > 0 && (
                <div>
                  <h4 className="font-medium text-stone-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    易混淆点辨析
                  </h4>
                  <div className="space-y-2">
                    {displayData.confusionPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-amber-50 rounded-lg text-sm text-amber-700 flex items-start gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopy?.("解析内容")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            复制解析
          </button>
          <button
            onClick={onBookmark}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
          >
            <Bookmark className="w-4 h-4" />
            收藏
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
            <ThumbsUp className="w-4 h-4" />
            有帮助
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
            <MessageSquare className="w-4 h-4" />
            反馈
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionAnalysis;
