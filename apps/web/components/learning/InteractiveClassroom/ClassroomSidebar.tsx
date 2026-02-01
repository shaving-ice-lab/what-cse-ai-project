"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Lock,
  Bookmark,
  Clock,
  TrendingUp,
  BookOpen,
  Target,
  Lightbulb,
  ListOrdered,
  Brain,
  AlertTriangle,
  GraduationCap,
  ClipboardList,
  BookMarked,
  Layers,
  Map,
  Sparkles,
  Home,
  Play,
} from "lucide-react";
import { useClassroom, SectionType } from "./ClassroomContext";
import { cn } from "@/lib/utils";

// =====================================================
// 章节类型图标映射
// =====================================================

const sectionIcons: Record<SectionType, React.ReactNode> = {
  exam_analysis: <TrendingUp className="w-4 h-4" />,
  introduction: <BookOpen className="w-4 h-4" />,
  learning_goals: <Target className="w-4 h-4" />,
  prerequisites: <BookOpen className="w-4 h-4" />,
  core_concepts: <Lightbulb className="w-4 h-4" />,
  method_steps: <ListOrdered className="w-4 h-4" />,
  formulas: <Brain className="w-4 h-4" />,
  memory_tips: <Sparkles className="w-4 h-4" />,
  examples: <GraduationCap className="w-4 h-4" />,
  common_mistakes: <AlertTriangle className="w-4 h-4" />,
  exam_strategies: <Target className="w-4 h-4" />,
  real_exam_drills: <GraduationCap className="w-4 h-4" />,
  practice: <ClipboardList className="w-4 h-4" />,
  vocabulary: <BookMarked className="w-4 h-4" />,
  extension: <Layers className="w-4 h-4" />,
  summary: <CheckCircle className="w-4 h-4" />,
  mind_map: <Map className="w-4 h-4" />,
  quick_notes: <Sparkles className="w-4 h-4" />,
  homework: <ClipboardList className="w-4 h-4" />,
};

// 章节类型颜色映射
const sectionColors: Record<SectionType, string> = {
  exam_analysis: "bg-blue-500",
  introduction: "bg-emerald-500",
  learning_goals: "bg-amber-500",
  prerequisites: "bg-stone-500",
  core_concepts: "bg-purple-500",
  method_steps: "bg-cyan-500",
  formulas: "bg-amber-500",
  memory_tips: "bg-emerald-500",
  examples: "bg-indigo-500",
  common_mistakes: "bg-red-500",
  exam_strategies: "bg-emerald-600",
  real_exam_drills: "bg-teal-500",
  practice: "bg-violet-500",
  vocabulary: "bg-pink-500",
  extension: "bg-slate-500",
  summary: "bg-emerald-500",
  mind_map: "bg-teal-500",
  quick_notes: "bg-amber-500",
  homework: "bg-blue-500",
};

// =====================================================
// 主组件
// =====================================================

interface ClassroomSidebarProps {
  courseTitle?: string;
  chapterTitle?: string;
  onBack?: () => void;
}

export function ClassroomSidebar({ courseTitle, chapterTitle, onBack }: ClassroomSidebarProps) {
  const {
    sections,
    currentSectionIndex,
    progress,
    isSidebarOpen,
    toggleSidebar,
    goToSection,
    getProgressPercentage,
  } = useClassroom();

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}分${secs}秒`;
    }
    return `${secs}秒`;
  };

  // 预计剩余时间
  const estimatedTimeLeft = useMemo(() => {
    const remainingSections = sections.slice(currentSectionIndex + 1);
    const totalMinutes = remainingSections.reduce((sum, s) => sum + (s.duration || 3), 0);
    return totalMinutes;
  }, [sections, currentSectionIndex]);

  const progressPercentage = getProgressPercentage();

  return (
    <>
      {/* 侧边栏 */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed lg:relative z-40 w-80 h-full bg-white border-r border-stone-200 flex flex-col shadow-xl lg:shadow-none"
          >
            {/* 头部 */}
            <div className="p-4 border-b border-stone-200 bg-gradient-to-br from-stone-50 to-white">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors mb-3 group"
                >
                  <div className="p-1.5 rounded-lg bg-stone-100 group-hover:bg-stone-200 transition-colors">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="text-sm">返回课程</span>
                </button>
              )}

              {courseTitle && (
                <h2 className="font-bold text-stone-800 truncate text-lg">{courseTitle}</h2>
              )}
              {chapterTitle && (
                <p className="text-sm text-stone-500 truncate mt-1">{chapterTitle}</p>
              )}

              {/* 学习时间统计 */}
              <div className="flex items-center gap-4 mt-4 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>已学 {formatTime(progress.timeSpent)}</span>
                </div>
                {estimatedTimeLeft > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    <span>约剩 {estimatedTimeLeft} 分钟</span>
                  </div>
                )}
              </div>
            </div>

            {/* 进度条 */}
            <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-stone-600 font-medium">学习进度</span>
                <span className="text-amber-600 font-bold">{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-stone-400 mt-2">
                已完成 {progress.completedSections.length} / {sections.length} 个章节
              </p>
            </div>

            {/* 章节列表 */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                {sections.map((section, index) => {
                  const isActive = index === currentSectionIndex;
                  const isCompleted = progress.completedSections.includes(section.id);
                  const isBookmarked = progress.bookmarks.includes(section.id);
                  const IconComponent = sectionIcons[section.type];
                  const colorClass = sectionColors[section.type];

                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => !section.locked && goToSection(index)}
                      disabled={section.locked}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-sm"
                          : section.locked
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-stone-50 border-2 border-transparent"
                      )}
                      whileHover={!section.locked ? { x: 4 } : {}}
                      whileTap={!section.locked ? { scale: 0.98 } : {}}
                    >
                      {/* 序号/状态图标 */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                          isActive
                            ? `${colorClass} text-white shadow-md`
                            : isCompleted
                              ? "bg-emerald-100 text-emerald-600"
                              : section.locked
                                ? "bg-stone-100 text-stone-400"
                                : "bg-stone-100 text-stone-500"
                        )}
                      >
                        {section.locked ? (
                          <Lock className="w-4 h-4" />
                        ) : isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          IconComponent
                        )}
                      </div>

                      {/* 标题 */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium truncate text-sm",
                            isActive
                              ? "text-amber-800"
                              : isCompleted
                                ? "text-stone-700"
                                : section.locked
                                  ? "text-stone-400"
                                  : "text-stone-700"
                          )}
                        >
                          {section.title}
                        </p>
                        {section.duration && (
                          <p className="text-xs text-stone-400 mt-0.5">
                            约 {section.duration} 分钟
                          </p>
                        )}
                      </div>

                      {/* 书签标记 */}
                      {isBookmarked && (
                        <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}

                      {/* 当前指示器 */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-1.5 h-8 bg-amber-500 rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 底部快捷操作 */}
            <div className="p-4 border-t border-stone-200 bg-stone-50/50">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>← → 键切换章节</span>
                <span>Ctrl+S 收起侧栏</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 收起状态的小按钮 */}
      <motion.button
        onClick={toggleSidebar}
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-white border border-stone-200 rounded-r-xl shadow-lg hover:bg-stone-50 transition-colors",
          isSidebarOpen ? "lg:hidden" : ""
        )}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-5 h-5 text-stone-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-stone-600" />
        )}
      </motion.button>

      {/* 移动端遮罩 */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ClassroomSidebar;
