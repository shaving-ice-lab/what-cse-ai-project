"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";

// =====================================================
// 类型定义
// =====================================================

export interface Section {
  id: string;
  title: string;
  type: SectionType;
  icon?: string;
  duration?: number; // 预计学习时间（分钟）
  completed?: boolean;
  locked?: boolean;
}

export type SectionType = 
  | "exam_analysis"
  | "introduction"
  | "learning_goals"
  | "prerequisites"
  | "core_concepts"
  | "method_steps"
  | "formulas"
  | "memory_tips"
  | "examples"
  | "common_mistakes"
  | "exam_strategies"
  | "real_exam_drills"
  | "practice"
  | "vocabulary"
  | "extension"
  | "summary"
  | "mind_map"
  | "quick_notes"
  | "homework";

export interface LearningProgress {
  currentSectionIndex: number;
  completedSections: string[];
  timeSpent: number; // 秒
  startTime?: number;
  quizScores: Record<string, number>;
  notes: Record<string, string>;
  bookmarks: string[];
}

interface ClassroomContextType {
  // 当前状态
  sections: Section[];
  currentSectionIndex: number;
  currentSection: Section | null;
  progress: LearningProgress;
  isFullscreen: boolean;
  isSidebarOpen: boolean;
  showNotes: boolean;
  fontSize: "small" | "medium" | "large";
  
  // 导航方法
  goToSection: (index: number) => void;
  goToNextSection: () => void;
  goToPrevSection: () => void;
  goToSectionById: (id: string) => void;
  
  // 进度方法
  markSectionComplete: (sectionId: string) => void;
  updateQuizScore: (sectionId: string, score: number) => void;
  addNote: (sectionId: string, note: string) => void;
  toggleBookmark: (sectionId: string) => void;
  
  // UI 控制
  toggleFullscreen: () => void;
  toggleSidebar: () => void;
  toggleNotes: () => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
  
  // 工具方法
  setSections: (sections: Section[]) => void;
  getProgressPercentage: () => number;
}

const ClassroomContext = createContext<ClassroomContextType | null>(null);

// =====================================================
// Provider 组件
// =====================================================

export function ClassroomProvider({ 
  children,
  initialSections = [],
  onProgressUpdate,
}: { 
  children: ReactNode;
  initialSections?: Section[];
  onProgressUpdate?: (progress: LearningProgress) => void;
}) {
  const [sections, setSectionsState] = useState<Section[]>(initialSections);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [fontSize, setFontSizeState] = useState<"small" | "medium" | "large">("medium");
  const [progress, setProgress] = useState<LearningProgress>({
    currentSectionIndex: 0,
    completedSections: [],
    timeSpent: 0,
    startTime: Date.now(),
    quizScores: {},
    notes: {},
    bookmarks: [],
  });

  // 当前章节
  const currentSection = useMemo(() => {
    return sections[currentSectionIndex] || null;
  }, [sections, currentSectionIndex]);

  // 设置章节
  const setSections = useCallback((newSections: Section[]) => {
    setSectionsState(newSections);
  }, []);

  // 导航到指定章节
  const goToSection = useCallback((index: number) => {
    if (index >= 0 && index < sections.length) {
      setCurrentSectionIndex(index);
      setProgress(prev => ({
        ...prev,
        currentSectionIndex: index,
      }));
    }
  }, [sections.length]);

  // 下一章节
  const goToNextSection = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      goToSection(currentSectionIndex + 1);
    }
  }, [currentSectionIndex, sections.length, goToSection]);

  // 上一章节
  const goToPrevSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      goToSection(currentSectionIndex - 1);
    }
  }, [currentSectionIndex, goToSection]);

  // 通过 ID 导航
  const goToSectionById = useCallback((id: string) => {
    const index = sections.findIndex(s => s.id === id);
    if (index !== -1) {
      goToSection(index);
    }
  }, [sections, goToSection]);

  // 标记章节完成
  const markSectionComplete = useCallback((sectionId: string) => {
    setProgress(prev => ({
      ...prev,
      completedSections: prev.completedSections.includes(sectionId)
        ? prev.completedSections
        : [...prev.completedSections, sectionId],
    }));
  }, []);

  // 更新测验分数
  const updateQuizScore = useCallback((sectionId: string, score: number) => {
    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [sectionId]: score,
      },
    }));
  }, []);

  // 添加笔记
  const addNote = useCallback((sectionId: string, note: string) => {
    setProgress(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [sectionId]: note,
      },
    }));
  }, []);

  // 切换书签
  const toggleBookmark = useCallback((sectionId: string) => {
    setProgress(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(sectionId)
        ? prev.bookmarks.filter(id => id !== sectionId)
        : [...prev.bookmarks, sectionId],
    }));
  }, []);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // 侧边栏切换
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // 笔记面板切换
  const toggleNotes = useCallback(() => {
    setShowNotes(prev => !prev);
  }, []);

  // 设置字体大小
  const setFontSize = useCallback((size: "small" | "medium" | "large") => {
    setFontSizeState(size);
  }, []);

  // 计算进度百分比
  const getProgressPercentage = useCallback(() => {
    if (sections.length === 0) return 0;
    return Math.round((progress.completedSections.length / sections.length) * 100);
  }, [sections.length, progress.completedSections.length]);

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在输入框中触发
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          goToPrevSection();
          break;
        case "ArrowRight":
          goToNextSection();
          break;
        case "f":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case "s":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleSidebar();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToPrevSection, goToNextSection, toggleFullscreen, toggleSidebar]);

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 进度更新回调
  useEffect(() => {
    onProgressUpdate?.(progress);
  }, [progress, onProgressUpdate]);

  const value: ClassroomContextType = {
    sections,
    currentSectionIndex,
    currentSection,
    progress,
    isFullscreen,
    isSidebarOpen,
    showNotes,
    fontSize,
    goToSection,
    goToNextSection,
    goToPrevSection,
    goToSectionById,
    markSectionComplete,
    updateQuizScore,
    addNote,
    toggleBookmark,
    toggleFullscreen,
    toggleSidebar,
    toggleNotes,
    setFontSize,
    setSections,
    getProgressPercentage,
  };

  return (
    <ClassroomContext.Provider value={value}>
      {children}
    </ClassroomContext.Provider>
  );
}

// =====================================================
// Hook
// =====================================================

export function useClassroom() {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error("useClassroom must be used within a ClassroomProvider");
  }
  return context;
}

export default ClassroomContext;
