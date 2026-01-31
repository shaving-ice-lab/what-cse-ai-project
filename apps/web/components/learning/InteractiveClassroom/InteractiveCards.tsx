"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronRight,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =====================================================
// 翻转卡片组件（用于概念学习）
// =====================================================

interface FlipCardProps {
  front: {
    title: string;
    subtitle?: string;
  };
  back: {
    content: string;
    examples?: string[];
    tips?: string;
  };
  color?: string;
  className?: string;
}

export function FlipCard({
  front,
  back,
  color = "from-purple-500 to-violet-500",
  className,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn("relative h-64 cursor-pointer perspective-1000", className)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* 正面 */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className={cn(
            "w-full h-full rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-xl bg-gradient-to-br",
            color
          )}>
            <Lightbulb className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-xl font-bold text-center mb-2">{front.title}</h3>
            {front.subtitle && (
              <p className="text-sm opacity-80 text-center">{front.subtitle}</p>
            )}
            <div className="absolute bottom-4 flex items-center gap-2 text-sm opacity-70">
              <span>点击查看详解</span>
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 背面 */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full rounded-2xl bg-white border-2 border-stone-200 p-5 flex flex-col shadow-xl overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("p-1.5 rounded-lg bg-gradient-to-br text-white", color)}>
                <Lightbulb className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-stone-800">{front.title}</h4>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed flex-1">
              {back.content}
            </p>
            {back.examples && back.examples.length > 0 && (
              <div className="mt-3 pt-3 border-t border-stone-200">
                <p className="text-xs font-medium text-stone-500 mb-2">示例：</p>
                <div className="space-y-1">
                  {back.examples.slice(0, 2).map((ex, idx) => (
                    <p key={idx} className="text-xs text-stone-600 flex items-start gap-1">
                      <span className="text-purple-400">•</span>
                      {ex}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {back.tips && (
              <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-700">💡 {back.tips}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// =====================================================
// 概念卡片网格
// =====================================================

interface ConceptCardGridProps {
  concepts: {
    name: string;
    definition?: string;
    detailed_explanation?: string;
    application_scenarios?: string[];
    example?: string;
    tips?: string;
  }[];
}

export function ConceptCardGrid({ concepts }: ConceptCardGridProps) {
  const colors = [
    "from-purple-500 to-violet-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-indigo-500 to-blue-500",
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {concepts.map((concept, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <FlipCard
            front={{
              title: concept.name,
              subtitle: concept.definition?.slice(0, 30) + "...",
            }}
            back={{
              content: concept.detailed_explanation || concept.definition || "",
              examples: concept.application_scenarios,
              tips: concept.tips,
            }}
            color={colors[idx % colors.length]}
          />
        </motion.div>
      ))}
    </div>
  );
}

// =====================================================
// 渐进式展示卡片
// =====================================================

interface ProgressiveRevealProps {
  items: {
    label: string;
    content: string;
    highlight?: boolean;
  }[];
  title?: string;
}

export function ProgressiveReveal({ items, title }: ProgressiveRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, revealedCount);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-stone-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {title}
          </h3>
          <span className="text-sm text-stone-400">
            {showAll ? items.length : revealedCount} / {items.length}
          </span>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {visibleItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "p-4 rounded-xl",
                item.highlight
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
                  : "bg-stone-50"
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  item.highlight
                    ? "bg-amber-500 text-white"
                    : "bg-stone-300 text-stone-700"
                )}>
                  {idx + 1}
                </span>
                <div>
                  <p className="font-medium text-stone-700 mb-1">{item.label}</p>
                  <p className="text-sm text-stone-600">{item.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!showAll && revealedCount < items.length && (
        <div className="mt-4 flex items-center gap-3">
          <motion.button
            onClick={() => setRevealedCount(prev => prev + 1)}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-2">
              <Eye className="w-5 h-5" />
              揭示下一个要点
            </span>
          </motion.button>
          <button
            onClick={() => setShowAll(true)}
            className="px-4 py-3 text-stone-500 hover:text-stone-700 text-sm"
          >
            显示全部
          </button>
        </div>
      )}

      {(showAll || revealedCount >= items.length) && revealedCount > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setRevealedCount(0);
            setShowAll(false);
          }}
          className="mt-4 w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重新开始
        </motion.button>
      )}
    </div>
  );
}

// =====================================================
// 记忆口诀卡片
// =====================================================

interface FormulaCardProps {
  name: string;
  content: string;
  explanation?: string;
  memoryAid?: string;
  examples?: string[];
}

export function FormulaCard({
  name,
  content,
  explanation,
  memoryAid,
  examples,
}: FormulaCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden"
      layout
    >
      <div className="p-5">
        <h4 className="font-bold text-amber-800 mb-3">{name}</h4>
        <motion.div
          className="bg-gradient-to-r from-amber-400 to-orange-400 text-white p-4 rounded-xl text-center text-lg font-bold tracking-wider shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          {content}
        </motion.div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {explanation && (
                <p className="text-sm text-stone-600 leading-relaxed">
                  {explanation}
                </p>
              )}
              {memoryAid && (
                <div className="p-3 bg-white/60 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">记忆技巧：</span>
                    {memoryAid}
                  </p>
                </div>
              )}
              {examples && examples.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-stone-500">应用示例：</p>
                  {examples.map((ex, idx) => (
                    <p key={idx} className="text-sm text-stone-600 flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      {ex}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 w-full py-2 text-sm text-amber-700 hover:text-amber-800 flex items-center justify-center gap-1"
        >
          {showDetails ? (
            <>
              <EyeOff className="w-4 h-4" />
              收起详情
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              查看详情
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// =====================================================
// 错误陷阱卡片
// =====================================================

interface MistakeCardProps {
  mistake: string;
  reason: string;
  correction: string;
  frequency?: string;
  typicalCase?: string;
  prevention?: string;
}

export function MistakeCard({
  mistake,
  reason,
  correction,
  frequency,
  typicalCase,
  prevention,
}: MistakeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-2xl border-2 border-red-100 overflow-hidden hover:border-red-200 transition-colors"
      layout
    >
      <div className="p-5">
        {/* 头部 */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-700">{mistake}</h4>
            {frequency && (
              <p className="text-xs text-red-400 mt-1">错误频率：{frequency}</p>
            )}
          </div>
        </div>

        {/* 对比展示 */}
        <div className="grid gap-3">
          <div className="p-3 bg-red-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-red-600">错误原因</span>
            </div>
            <p className="text-sm text-red-700">{reason}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">正确做法</span>
            </div>
            <p className="text-sm text-emerald-700">{correction}</p>
          </div>
        </div>

        {/* 展开内容 */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {typicalCase && (
                <div className="p-3 bg-stone-50 rounded-lg">
                  <p className="text-xs font-medium text-stone-500 mb-1">典型案例：</p>
                  <p className="text-sm text-stone-600">{typicalCase}</p>
                </div>
              )}
              {prevention && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-600 mb-1">预防措施：</p>
                  <p className="text-sm text-blue-700">{prevention}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {(typicalCase || prevention) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 w-full py-2 text-sm text-stone-500 hover:text-stone-700 flex items-center justify-center gap-1"
          >
            {expanded ? "收起" : "查看更多"}
            <ChevronRight
              className={cn(
                "w-4 h-4 transition-transform",
                expanded && "rotate-90"
              )}
            />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default FlipCard;
