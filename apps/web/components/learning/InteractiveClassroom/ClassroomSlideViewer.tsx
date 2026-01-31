"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  RotateCcw,
} from "lucide-react";
import { useClassroom } from "./ClassroomContext";
import { cn } from "@/lib/utils";

// =====================================================
// 幻灯片查看器组件
// =====================================================

interface ClassroomSlideViewerProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showProgressDots?: boolean;
  autoMarkComplete?: boolean;
}

export function ClassroomSlideViewer({
  children,
  showNavigation = true,
  showProgressDots = true,
  autoMarkComplete = true,
}: ClassroomSlideViewerProps) {
  const {
    sections,
    currentSectionIndex,
    currentSection,
    progress,
    fontSize,
    goToNextSection,
    goToPrevSection,
    goToSection,
    markSectionComplete,
  } = useClassroom();

  const [slideDirection, setSlideDirection] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // 检测是否已完成当前章节
  const isCurrentCompleted = currentSection
    ? progress.completedSections.includes(currentSection.id)
    : false;

  // 处理下一章节
  const handleNext = useCallback(() => {
    setSlideDirection(1);
    if (autoMarkComplete && currentSection) {
      markSectionComplete(currentSection.id);
    }
    goToNextSection();
    setHasInteracted(false);
  }, [autoMarkComplete, currentSection, markSectionComplete, goToNextSection]);

  // 处理上一章节
  const handlePrev = useCallback(() => {
    setSlideDirection(-1);
    goToPrevSection();
    setHasInteracted(false);
  }, [goToPrevSection]);

  // 处理完成当前章节
  const handleComplete = useCallback(() => {
    if (currentSection) {
      markSectionComplete(currentSection.id);
    }
  }, [currentSection, markSectionComplete]);

  // 字体大小类
  const fontSizeClass = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  }[fontSize];

  // 动画变体
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* 顶部进度条 */}
      <div className="flex-shrink-0 h-1 bg-stone-200">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentSectionIndex + 1) / sections.length) * 100}%`,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={currentSectionIndex}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className={cn(
              "absolute inset-0 overflow-y-auto",
              fontSizeClass
            )}
          >
            <div className="min-h-full p-6 lg:p-8">
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部导航 */}
      {showNavigation && (
        <div className="flex-shrink-0 border-t border-stone-200 bg-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* 上一步 */}
            <motion.button
              onClick={handlePrev}
              disabled={currentSectionIndex === 0}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
                currentSectionIndex === 0
                  ? "opacity-40 cursor-not-allowed text-stone-400"
                  : "text-stone-700 hover:bg-stone-100 active:bg-stone-200"
              )}
              whileHover={currentSectionIndex !== 0 ? { x: -4 } : {}}
              whileTap={currentSectionIndex !== 0 ? { scale: 0.98 } : {}}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">上一节</span>
            </motion.button>

            {/* 进度点 */}
            {showProgressDots && (
              <div className="flex items-center gap-1.5">
                {sections.slice(
                  Math.max(0, currentSectionIndex - 3),
                  Math.min(sections.length, currentSectionIndex + 4)
                ).map((section, idx) => {
                  const actualIndex = Math.max(0, currentSectionIndex - 3) + idx;
                  const isActive = actualIndex === currentSectionIndex;
                  const isCompleted = progress.completedSections.includes(section.id);

                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => goToSection(actualIndex)}
                      className={cn(
                        "rounded-full transition-all",
                        isActive
                          ? "w-8 h-2.5 bg-amber-500"
                          : isCompleted
                          ? "w-2.5 h-2.5 bg-emerald-400"
                          : "w-2.5 h-2.5 bg-stone-300 hover:bg-stone-400"
                      )}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  );
                })}
              </div>
            )}

            {/* 完成/下一步 */}
            <div className="flex items-center gap-3">
              {/* 标记完成按钮 */}
              {!isCurrentCompleted && currentSectionIndex !== sections.length - 1 && (
                <motion.button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-4 py-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">已掌握</span>
                </motion.button>
              )}

              {/* 下一步按钮 */}
              <motion.button
                onClick={handleNext}
                disabled={currentSectionIndex === sections.length - 1}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all",
                  currentSectionIndex === sections.length - 1
                    ? "opacity-40 cursor-not-allowed bg-stone-200 text-stone-500"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40"
                )}
                whileHover={
                  currentSectionIndex !== sections.length - 1
                    ? { x: 4, scale: 1.02 }
                    : {}
                }
                whileTap={
                  currentSectionIndex !== sections.length - 1
                    ? { scale: 0.98 }
                    : {}
                }
              >
                <span className="hidden sm:inline">
                  {currentSectionIndex === sections.length - 1
                    ? "已完成"
                    : "下一节"}
                </span>
                {currentSectionIndex === sections.length - 1 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* 章节完成提示 */}
      <AnimatePresence>
        {isCurrentCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">已完成本节</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// 章节头部组件
// =====================================================

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = "bg-amber-100 text-amber-700",
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <div className="flex items-center gap-4">
        {icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl"
          >
            {icon}
          </motion.div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-stone-800">{title}</h2>
            {badge && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={cn("px-3 py-1 rounded-full text-sm font-medium", badgeColor)}
              >
                {badge}
              </motion.span>
            )}
          </div>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-stone-500 mt-1"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// 内容卡片组件
// =====================================================

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "default" | "highlight" | "warning" | "success" | "info";
}

export function ContentCard({
  children,
  className,
  delay = 0,
  variant = "default",
}: ContentCardProps) {
  const variantStyles = {
    default: "bg-white border-stone-200",
    highlight: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
    warning: "bg-gradient-to-br from-red-50 to-rose-50 border-red-200",
    success: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
    info: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className={cn(
        "rounded-2xl border p-6 shadow-sm",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// =====================================================
// 步骤展示组件（逐步展开）
// =====================================================

interface StepRevealProps {
  steps: {
    title: string;
    content: string;
    tips?: string;
  }[];
}

export function StepReveal({ steps }: StepRevealProps) {
  const [revealedSteps, setRevealedSteps] = useState(1);

  const revealNext = () => {
    if (revealedSteps < steps.length) {
      setRevealedSteps(prev => prev + 1);
    }
  };

  const resetSteps = () => {
    setRevealedSteps(1);
  };

  return (
    <div className="space-y-4">
      {steps.slice(0, revealedSteps).map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex gap-4"
        >
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
            {idx + 1}
          </div>
          <div className="flex-1 pb-4 border-b border-stone-200 last:border-0">
            <h4 className="font-semibold text-stone-800 mb-2">{step.title}</h4>
            <p className="text-stone-600 leading-relaxed">{step.content}</p>
            {step.tips && (
              <div className="mt-2 p-3 bg-cyan-50 rounded-lg text-sm text-cyan-700">
                💡 {step.tips}
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* 控制按钮 */}
      <div className="flex items-center gap-3 pt-4">
        {revealedSteps < steps.length ? (
          <motion.button
            onClick={revealNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlayCircle className="w-5 h-5" />
            显示下一步 ({revealedSteps}/{steps.length})
          </motion.button>
        ) : (
          <motion.button
            onClick={resetSteps}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-5 h-5" />
            重新开始
          </motion.button>
        )}

        {revealedSteps < steps.length && (
          <button
            onClick={() => setRevealedSteps(steps.length)}
            className="text-sm text-stone-500 hover:text-stone-700 underline"
          >
            显示全部
          </button>
        )}
      </div>
    </div>
  );
}

export default ClassroomSlideViewer;
