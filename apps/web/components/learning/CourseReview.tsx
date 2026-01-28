"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  BookOpen,
  Brain,
  AlertTriangle,
  Clock,
  Calendar,
  Target,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Lightbulb,
  FileText,
  Play,
  Award,
} from "lucide-react";
import { useCourseReview } from "@/hooks/useAIContent";
import { AIContent } from "@/services/api/ai-content";

interface CourseReviewProps {
  courseId: number;
  courseName?: string;
  onStartPractice?: () => void;
  onReviewWrong?: () => void;
  onContinue?: () => void;
  className?: string;
}

// 知识点掌握状态
type MasteryStatus = "mastered" | "familiar" | "learning" | "unknown";

// 知识点项
interface KnowledgeItem {
  id: string;
  title: string;
  status: MasteryStatus;
}

// 知识点清单组件
function KnowledgeChecklist({
  items,
  onToggle,
}: {
  items: KnowledgeItem[];
  onToggle: (id: string) => void;
}) {
  const masteredCount = items.filter((i) => i.status === "mastered").length;

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 overflow-hidden">
      <div className="px-5 py-4 bg-stone-50 border-b border-stone-200/50">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-stone-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            知识点清单
          </h4>
          <span className="text-sm text-stone-500">
            已掌握 {masteredCount}/{items.length}
          </span>
        </div>
        <div className="mt-2 h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(masteredCount / items.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
              item.status === "mastered"
                ? "bg-green-50 border border-green-200"
                : "bg-stone-50 hover:bg-stone-100 border border-stone-200"
            )}
          >
            {item.status === "mastered" ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-stone-400 flex-shrink-0" />
            )}
            <span
              className={cn(
                "text-sm",
                item.status === "mastered"
                  ? "text-green-700"
                  : "text-stone-700"
              )}
            >
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 核心公式/概念汇总组件
function ConceptSummary({ concepts }: { concepts: string[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
      >
        <h4 className="font-semibold text-stone-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          核心公式/概念汇总
        </h4>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-stone-400 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          {concepts.map((concept, idx) => (
            <div
              key={idx}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <p className="text-sm text-blue-800">{concept}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 易错点提醒组件
function ErrorProneReminder({ errors }: { errors: string[] }) {
  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
      <h4 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        易错点提醒
      </h4>
      <div className="space-y-3">
        {errors.map((error, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
              {idx + 1}
            </span>
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 艾宾浩斯遗忘曲线复习计划
function ReviewSchedule({
  nextReviewDate,
  reviewCount,
}: {
  nextReviewDate: string;
  reviewCount: number;
}) {
  const scheduleItems = [
    { day: "第1天", desc: "首次学习后24小时", status: reviewCount >= 1 ? "done" : "pending" },
    { day: "第3天", desc: "加深记忆", status: reviewCount >= 2 ? "done" : reviewCount === 1 ? "current" : "future" },
    { day: "第7天", desc: "强化巩固", status: reviewCount >= 3 ? "done" : reviewCount === 2 ? "current" : "future" },
    { day: "第14天", desc: "长期记忆", status: reviewCount >= 4 ? "done" : reviewCount === 3 ? "current" : "future" },
    { day: "第30天", desc: "永久记忆", status: reviewCount >= 5 ? "done" : reviewCount === 4 ? "current" : "future" },
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-5">
      <h4 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-purple-500" />
        艾宾浩斯复习计划
      </h4>
      <div className="flex items-center justify-between mb-4 p-3 bg-purple-50 rounded-lg">
        <span className="text-sm text-purple-700">下次复习时间</span>
        <span className="font-semibold text-purple-800">{nextReviewDate}</span>
      </div>
      <div className="space-y-2">
        {scheduleItems.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg",
              item.status === "current" && "bg-amber-50",
              item.status === "done" && "opacity-60"
            )}
          >
            {item.status === "done" ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : item.status === "current" ? (
              <Clock className="w-5 h-5 text-amber-500" />
            ) : (
              <Circle className="w-5 h-5 text-stone-300" />
            )}
            <span className="text-sm font-medium text-stone-700">
              {item.day}
            </span>
            <span className="text-sm text-stone-500">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 巩固练习按钮组
function PracticeButtons({
  onReviewPractice,
  onWrongReview,
  onEnhancePractice,
}: {
  onReviewPractice?: () => void;
  onWrongReview?: () => void;
  onEnhancePractice?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-5">
      <h4 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-amber-500" />
        巩固练习
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={onReviewPractice}
          className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center flex-shrink-0">
            <Play className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-medium text-stone-800">AI复习题</p>
            <p className="text-xs text-stone-500">巩固知识点</p>
          </div>
        </button>

        <button
          onClick={onWrongReview}
          className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200 hover:border-red-300 hover:bg-red-50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-medium text-stone-800">错题重现</p>
            <p className="text-xs text-stone-500">攻克薄弱点</p>
          </div>
        </button>

        <button
          onClick={onEnhancePractice}
          className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-medium text-stone-800">强化训练</p>
            <p className="text-xs text-stone-500">拓展提升</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export function CourseReview({
  courseId,
  courseName,
  onStartPractice,
  onReviewWrong,
  onContinue,
  className,
}: CourseReviewProps) {
  const { loading, review, error } = useCourseReview(courseId);
  const content = review?.content as AIContent | undefined;

  // 知识点状态
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([
    { id: "1", title: "核心概念理解", status: "mastered" },
    { id: "2", title: "基本公式运用", status: "familiar" },
    { id: "3", title: "典型例题解法", status: "learning" },
    { id: "4", title: "变形题应对", status: "unknown" },
    { id: "5", title: "综合应用能力", status: "unknown" },
  ]);

  // 切换知识点状态
  const toggleKnowledge = useCallback((id: string) => {
    setKnowledgeItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "mastered" ? "unknown" : "mastered",
            }
          : item
      )
    );
  }, []);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-20", className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-stone-500">正在生成复习内容...</p>
        </div>
      </div>
    );
  }

  // 解析复习内容
  const reviewPoints = content?.review_points || [];
  const tips = content?.tips || [];
  const mainPoints = content?.main_points || [];
  const estimatedTime = content?.estimated_time || 45;

  // 核心概念
  const concepts = mainPoints.length > 0 ? mainPoints : [
    "概念一：基本定义和核心要素",
    "概念二：主要公式及其推导",
    "概念三：实际应用场景和方法",
  ];

  // 易错点
  const errorProne = tips.length > 0 ? tips : [
    "易错点1：概念混淆，注意区分相似术语",
    "易错点2：公式运用错误，注意适用条件",
    "易错点3：计算失误，建议验算检查",
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* 头部 */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI 章节总结</h3>
            <p className="text-sm text-white/80">{courseName || "课程复习"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>预计 {estimatedTime} 分钟</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{knowledgeItems.length} 个知识点</span>
          </div>
        </div>
      </div>

      {/* 知识点清单 */}
      <KnowledgeChecklist items={knowledgeItems} onToggle={toggleKnowledge} />

      {/* 核心概念汇总 */}
      <ConceptSummary concepts={concepts} />

      {/* 易错点提醒 */}
      <ErrorProneReminder errors={errorProne} />

      {/* 艾宾浩斯复习计划 */}
      <ReviewSchedule
        nextReviewDate="明天 (第1次复习)"
        reviewCount={0}
      />

      {/* 巩固练习 */}
      <PracticeButtons
        onReviewPractice={onStartPractice}
        onWrongReview={onReviewWrong}
        onEnhancePractice={onStartPractice}
      />

      {/* 继续学习按钮 */}
      <button
        onClick={onContinue}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
      >
        复习完成，继续下一章
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default CourseReview;
