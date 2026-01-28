"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Copy,
  Bookmark,
  Sparkles,
  Calculator,
  Brain,
  Star,
} from "lucide-react";

// 要点类型
export type KeyPointType = "core" | "formula" | "concept" | "tip" | "summary";

// 单个要点数据
export interface KeyPoint {
  id: string;
  type: KeyPointType;
  title: string;
  content: string;
  isImportant?: boolean;
  isMastered?: boolean;
}

// 公式速记卡数据
export interface FlashCard {
  id: string;
  front: string; // 公式名称或问题
  back: string; // 公式内容或答案
  category?: string;
}

// 重点内容卡片Props
interface KeyPointsCardProps {
  keyPoints: KeyPoint[];
  flashCards?: FlashCard[];
  chapterTitle?: string;
  onMasteryToggle?: (id: string, mastered: boolean) => void;
  onCopy?: (content: string) => void;
  onBookmark?: (id: string) => void;
  className?: string;
}

// 要点类型配置
const KEY_POINT_CONFIG: Record<
  KeyPointType,
  { icon: typeof Lightbulb; color: string; bgColor: string; label: string }
> = {
  core: {
    icon: Lightbulb,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    label: "核心要点",
  },
  formula: {
    icon: Calculator,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "公式",
  },
  concept: {
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    label: "概念",
  },
  tip: {
    icon: Sparkles,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "技巧",
  },
  summary: {
    icon: BookOpen,
    color: "text-stone-600",
    bgColor: "bg-stone-100",
    label: "总结",
  },
};

// 单个要点项组件
function KeyPointItem({
  point,
  onMasteryToggle,
  onCopy,
  onBookmark,
}: {
  point: KeyPoint;
  onMasteryToggle?: (mastered: boolean) => void;
  onCopy?: () => void;
  onBookmark?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = KEY_POINT_CONFIG[point.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden transition-all",
        point.isMastered
          ? "border-green-200 bg-green-50/50"
          : "border-stone-200 bg-white"
      )}
    >
      {/* 头部 */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-stone-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* 掌握状态按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMasteryToggle?.(!point.isMastered);
          }}
          className="flex-shrink-0"
        >
          {point.isMastered ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-stone-300 hover:text-green-400 transition-colors" />
          )}
        </button>

        {/* 类型图标和标签 */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            config.bgColor
          )}
        >
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>

        {/* 标题 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                config.bgColor,
                config.color
              )}
            >
              {config.label}
            </span>
            {point.isImportant && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            )}
          </div>
          <h4
            className={cn(
              "text-sm font-medium mt-1 truncate",
              point.isMastered ? "text-green-700" : "text-stone-700"
            )}
          >
            {point.title}
          </h4>
        </div>

        {/* 展开图标 */}
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-stone-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-stone-400 flex-shrink-0" />
        )}
      </div>

      {/* 内容详情 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-stone-100">
          <div
            className="mt-3 text-sm text-stone-600 leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: point.content }}
          />
          {/* 操作按钮 */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy?.();
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              复制
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark?.();
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              收藏
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 公式速记卡组件
function FlashCardItem({ card }: { card: FlashCard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative h-32 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1000px" }}
    >
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-500 preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* 正面 - 问题/公式名称 */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white backface-hidden flex flex-col justify-center items-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          {card.category && (
            <span className="text-xs text-white/70 mb-1">{card.category}</span>
          )}
          <p className="text-center font-medium">{card.front}</p>
          <p className="text-xs text-white/60 mt-2">点击翻转查看</p>
        </div>

        {/* 背面 - 答案/公式内容 */}
        <div
          className="absolute inset-0 bg-white rounded-xl border-2 border-blue-200 p-4 backface-hidden flex flex-col justify-center items-center rotate-y-180"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-center text-stone-700 font-medium">{card.back}</p>
        </div>
      </div>
    </div>
  );
}

export function KeyPointsCard({
  keyPoints,
  flashCards = [],
  chapterTitle,
  onMasteryToggle,
  onCopy,
  onBookmark,
  className,
}: KeyPointsCardProps) {
  const [activeTab, setActiveTab] = useState<"points" | "cards">("points");
  const [showAll, setShowAll] = useState(false);

  // 计算掌握进度
  const masteredCount = keyPoints.filter((p) => p.isMastered).length;
  const masteryProgress =
    keyPoints.length > 0
      ? Math.round((masteredCount / keyPoints.length) * 100)
      : 0;

  // 重要要点排在前面
  const sortedPoints = [...keyPoints].sort((a, b) => {
    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;
    return 0;
  });

  const displayPoints = showAll ? sortedPoints : sortedPoints.slice(0, 5);

  return (
    <div className={cn("bg-white rounded-xl border border-stone-200", className)}>
      {/* 头部 */}
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">AI 提炼要点</h3>
              {chapterTitle && (
                <p className="text-xs text-stone-500">{chapterTitle}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-amber-600">{masteryProgress}%</p>
            <p className="text-xs text-stone-500">
              已掌握 {masteredCount}/{keyPoints.length}
            </p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${masteryProgress}%` }}
          />
        </div>
      </div>

      {/* 标签页切换（如果有速记卡） */}
      {flashCards.length > 0 && (
        <div className="flex border-b border-stone-200">
          <button
            onClick={() => setActiveTab("points")}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-colors",
              activeTab === "points"
                ? "text-amber-600 border-b-2 border-amber-500"
                : "text-stone-500 hover:text-stone-700"
            )}
          >
            重点内容
          </button>
          <button
            onClick={() => setActiveTab("cards")}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-colors",
              activeTab === "cards"
                ? "text-amber-600 border-b-2 border-amber-500"
                : "text-stone-500 hover:text-stone-700"
            )}
          >
            速记卡片
          </button>
        </div>
      )}

      {/* 内容区域 */}
      <div className="p-4">
        {activeTab === "points" ? (
          <div className="space-y-3">
            {displayPoints.map((point) => (
              <KeyPointItem
                key={point.id}
                point={point}
                onMasteryToggle={(mastered) =>
                  onMasteryToggle?.(point.id, mastered)
                }
                onCopy={() => onCopy?.(point.content)}
                onBookmark={() => onBookmark?.(point.id)}
              />
            ))}

            {/* 展开更多按钮 */}
            {keyPoints.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    收起
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    展开更多 ({keyPoints.length - 5})
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {flashCards.map((card) => (
              <FlashCardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KeyPointsCard;
