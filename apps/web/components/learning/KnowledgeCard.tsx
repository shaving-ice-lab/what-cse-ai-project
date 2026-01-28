"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  RotateCcw,
  Heart,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  Tag,
  ExternalLink,
  Share2,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// 掌握度级别
export type MasteryLevel = "mastered" | "learning" | "unfamiliar" | "unknown";

// 知识点数据
export interface KnowledgePointData {
  id: string;
  title: string;
  keywords?: string[];
  summary?: string;
  content: string;
  examples?: string[];
  tips?: string[];
  relatedTopics?: { id: string; title: string }[];
  difficulty?: 1 | 2 | 3 | 4 | 5;
  category?: string;
}

interface KnowledgeCardProps {
  data: KnowledgePointData;
  masteryLevel?: MasteryLevel;
  isFavorited?: boolean;
  showFront?: boolean;
  onFlip?: () => void;
  onMasteryChange?: (level: MasteryLevel) => void;
  onFavoriteToggle?: () => void;
  onRelatedClick?: (id: string) => void;
  className?: string;
}

// 掌握度颜色和标签
const MASTERY_CONFIG = {
  mastered: {
    label: "已掌握",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: CheckCircle2,
  },
  learning: {
    label: "学习中",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: HelpCircle,
  },
  unfamiliar: {
    label: "不熟悉",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
  },
  unknown: {
    label: "未学习",
    color: "text-stone-500",
    bgColor: "bg-stone-50",
    borderColor: "border-stone-200",
    icon: HelpCircle,
  },
};

// 难度星星
function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className={cn(
            "w-2 h-2 rounded-full",
            star <= level ? "bg-amber-400" : "bg-stone-200"
          )}
        />
      ))}
    </div>
  );
}

export function KnowledgeCard({
  data,
  masteryLevel = "unknown",
  isFavorited = false,
  showFront = true,
  onFlip,
  onMasteryChange,
  onFavoriteToggle,
  onRelatedClick,
  className,
}: KnowledgeCardProps) {
  const [isFlipped, setIsFlipped] = useState(!showFront);
  const [isAnimating, setIsAnimating] = useState(false);

  const masteryConfig = MASTERY_CONFIG[masteryLevel];
  const MasteryIcon = masteryConfig.icon;

  // 翻转卡片
  const handleFlip = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsFlipped((prev) => !prev);
    onFlip?.();

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, [isAnimating, onFlip]);

  // 设置掌握度
  const handleMasteryChange = useCallback(
    (level: MasteryLevel) => {
      onMasteryChange?.(level);
    },
    [onMasteryChange]
  );

  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto perspective-1000",
        className
      )}
      style={{ perspective: "1000px" }}
    >
      <div
        className={cn(
          "relative w-full transition-transform duration-500 preserve-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
      >
        {/* 正面 - 知识点名称和关键词 */}
        <div
          className={cn(
            "absolute w-full backface-hidden rounded-2xl border-2 shadow-lg overflow-hidden",
            masteryConfig.borderColor,
            masteryConfig.bgColor
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="p-6">
            {/* 顶部 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    masteryConfig.bgColor,
                    masteryConfig.color
                  )}
                >
                  <MasteryIcon className="w-3 h-3" />
                  {masteryConfig.label}
                </span>
                {data.difficulty && <DifficultyStars level={data.difficulty} />}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle?.();
                }}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isFavorited
                    ? "text-red-500 bg-red-50"
                    : "text-stone-400 hover:text-red-400 hover:bg-red-50"
                )}
              >
                <Heart
                  className={cn("w-5 h-5", isFavorited && "fill-current")}
                />
              </button>
            </div>

            {/* 分类 */}
            {data.category && (
              <p className="text-xs text-stone-500 mb-2">{data.category}</p>
            )}

            {/* 标题 */}
            <h3 className="text-xl font-bold text-stone-800 mb-4">
              {data.title}
            </h3>

            {/* 摘要 */}
            {data.summary && (
              <p className="text-sm text-stone-600 mb-4 line-clamp-2">
                {data.summary}
              </p>
            )}

            {/* 关键词 */}
            {data.keywords && data.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-sm text-stone-600 border border-stone-200"
                  >
                    <Tag className="w-3 h-3 text-amber-500" />
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            {/* 翻转提示 */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400">
              <RotateCcw className="w-4 h-4" />
              点击翻转查看详情
            </div>
          </div>
        </div>

        {/* 背面 - 详细解释和示例 */}
        <div
          className="absolute w-full backface-hidden rounded-2xl border-2 border-stone-200 shadow-lg bg-white overflow-hidden rotate-y-180"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="p-6 max-h-[480px] overflow-y-auto">
            {/* 标题 */}
            <h3 className="text-lg font-bold text-stone-800 mb-4 pb-3 border-b border-stone-100">
              {data.title}
            </h3>

            {/* 详细内容 */}
            <div className="space-y-4">
              {/* 核心内容 */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  知识要点
                </h4>
                <div
                  className="text-sm text-stone-600 leading-relaxed prose prose-sm prose-stone max-w-none"
                  dangerouslySetInnerHTML={{ __html: data.content }}
                />
              </div>

              {/* 示例 */}
              {data.examples && data.examples.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    📝 示例
                  </h4>
                  <div className="space-y-2">
                    {data.examples.map((example, index) => (
                      <div
                        key={index}
                        className="p-3 bg-stone-50 rounded-lg text-sm text-stone-600"
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 技巧提示 */}
              {data.tips && data.tips.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    💡 技巧提示
                  </h4>
                  <ul className="space-y-1">
                    {data.tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-stone-600"
                      >
                        <span className="text-amber-500">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 关联知识点 */}
              {data.relatedTopics && data.relatedTopics.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    🔗 关联知识点
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.relatedTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRelatedClick?.(topic.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm text-stone-600 transition-colors"
                      >
                        {topic.title}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 翻转提示 */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-stone-400">
              <RotateCcw className="w-4 h-4" />
              点击翻转返回
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="mt-4 flex items-center justify-between">
        {/* 掌握度选择 */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-500 mr-2">掌握度:</span>
          {(
            ["unfamiliar", "learning", "mastered"] as MasteryLevel[]
          ).map((level) => {
            const config = MASTERY_CONFIG[level];
            const Icon = config.icon;
            return (
              <button
                key={level}
                onClick={() => handleMasteryChange(level)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  masteryLevel === level
                    ? cn(config.bgColor, config.color)
                    : "text-stone-400 hover:bg-stone-100"
                )}
                title={config.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* 其他操作 */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // 分享功能
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
            title="分享"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // 添加到学习计划
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
            title="加入学习计划"
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 知识卡片组（翻卡学习模式）
interface KnowledgeCardDeckProps {
  cards: KnowledgePointData[];
  onComplete?: (results: Map<string, MasteryLevel>) => void;
  className?: string;
}

export function KnowledgeCardDeck({
  cards,
  onComplete,
  className,
}: KnowledgeCardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteryLevels, setMasteryLevels] = useState<Map<string, MasteryLevel>>(
    new Map()
  );
  const [showFront, setShowFront] = useState(true);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleMasteryChange = useCallback((level: MasteryLevel) => {
    setMasteryLevels((prev) => {
      const next = new Map(prev);
      next.set(currentCard.id, level);
      return next;
    });
  }, [currentCard?.id]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowFront(true);
    } else {
      onComplete?.(masteryLevels);
    }
  }, [currentIndex, cards.length, masteryLevels, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowFront(true);
    }
  }, [currentIndex]);

  if (!currentCard) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 进度条 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-stone-500 min-w-[60px] text-right">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* 卡片 */}
      <KnowledgeCard
        data={currentCard}
        masteryLevel={masteryLevels.get(currentCard.id) || "unknown"}
        showFront={showFront}
        onFlip={() => setShowFront((prev) => !prev)}
        onMasteryChange={handleMasteryChange}
      />

      {/* 导航按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            currentIndex === 0
              ? "text-stone-300 cursor-not-allowed"
              : "text-stone-600 hover:bg-stone-100"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          上一个
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          {currentIndex === cards.length - 1 ? "完成" : "下一个"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default KnowledgeCard;
