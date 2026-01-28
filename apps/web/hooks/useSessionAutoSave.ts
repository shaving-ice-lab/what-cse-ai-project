"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { practiceApi, SaveProgressRequest, InterruptSessionRequest } from "@/services/api/practice";

interface AutoSaveOptions {
  sessionId: number;
  enabled?: boolean;
  saveInterval?: number; // milliseconds, default 30000 (30 seconds)
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  onInterrupt?: () => void;
}

interface SessionProgress {
  currentIndex: number;
  totalTimeSpent: number;
  answers: Map<number, { userAnswer: string; timeSpent: number }>;
}

interface UseSessionAutoSaveReturn {
  // Status
  isSaving: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;

  // Actions
  updateProgress: (currentIndex: number, totalTimeSpent: number) => void;
  updateAnswer: (questionId: number, userAnswer: string, timeSpent: number) => void;
  saveNow: () => Promise<void>;
  interruptSession: (reason?: string) => Promise<void>;
  clearProgress: () => void;
}

/**
 * Hook for auto-saving practice session progress
 * Implements:
 * - 定时自动保存答案 (periodic auto-save)
 * - 关闭页面提醒 (page close warning)
 * - 重新打开恢复进度 (restore progress support)
 */
export function useSessionAutoSave({
  sessionId,
  enabled = true,
  saveInterval = 30000, // 30 seconds
  onSaveSuccess,
  onSaveError,
  onInterrupt,
}: AutoSaveOptions): UseSessionAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Store progress data
  const progressRef = useRef<SessionProgress>({
    currentIndex: 0,
    totalTimeSpent: 0,
    answers: new Map(),
  });

  // Track if component is mounted
  const isMountedRef = useRef(true);

  // Save progress to server
  const saveProgress = useCallback(async (): Promise<void> => {
    if (!enabled || !sessionId) return;

    const progress = progressRef.current;
    
    // Build request
    const request: SaveProgressRequest = {
      current_index: progress.currentIndex,
      total_time_spent: progress.totalTimeSpent,
      answers: Array.from(progress.answers.entries()).map(([questionId, data]) => ({
        question_id: questionId,
        user_answer: data.userAnswer,
        time_spent: data.timeSpent,
      })),
    };

    setIsSaving(true);

    try {
      await practiceApi.saveProgress(sessionId, request);
      if (isMountedRef.current) {
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
        onSaveSuccess?.();
      }
    } catch (error) {
      if (isMountedRef.current) {
        onSaveError?.(error as Error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [enabled, sessionId, onSaveSuccess, onSaveError]);

  // Interrupt session (mark as interrupted with data)
  const interruptSession = useCallback(async (reason?: string): Promise<void> => {
    if (!sessionId) return;

    const progress = progressRef.current;

    const request: InterruptSessionRequest = {
      reason: reason || "page_close",
      current_index: progress.currentIndex,
      total_time_spent: progress.totalTimeSpent,
      answers: Array.from(progress.answers.entries()).map(([questionId, data]) => ({
        question_id: questionId,
        user_answer: data.userAnswer,
        time_spent: data.timeSpent,
      })),
    };

    try {
      await practiceApi.interruptSession(sessionId, request);
      onInterrupt?.();
    } catch (error) {
      console.error("Failed to interrupt session:", error);
    }
  }, [sessionId, onInterrupt]);

  // Update progress state
  const updateProgress = useCallback((currentIndex: number, totalTimeSpent: number) => {
    progressRef.current.currentIndex = currentIndex;
    progressRef.current.totalTimeSpent = totalTimeSpent;
    setHasUnsavedChanges(true);
  }, []);

  // Update single answer
  const updateAnswer = useCallback((questionId: number, userAnswer: string, timeSpent: number) => {
    progressRef.current.answers.set(questionId, { userAnswer, timeSpent });
    setHasUnsavedChanges(true);
  }, []);

  // Clear progress (after session complete)
  const clearProgress = useCallback(() => {
    progressRef.current = {
      currentIndex: 0,
      totalTimeSpent: 0,
      answers: new Map(),
    };
    setHasUnsavedChanges(false);
  }, []);

  // Auto-save on interval
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      if (hasUnsavedChanges) {
        saveProgress();
      }
    }, saveInterval);

    return () => clearInterval(timer);
  }, [enabled, hasUnsavedChanges, saveInterval, saveProgress]);

  // Save on page visibility change (user switches tab)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden && hasUnsavedChanges) {
        // User is leaving - save immediately
        saveProgress();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled, hasUnsavedChanges, saveProgress]);

  // Warn and interrupt on page close/refresh
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Show confirmation dialog
        e.preventDefault();
        e.returnValue = "您的答题进度尚未保存，确定要离开吗？";

        // Try to save/interrupt (may not complete)
        interruptSession("page_close");

        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, hasUnsavedChanges, interruptSession]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    isSaving,
    lastSavedAt,
    hasUnsavedChanges,
    updateProgress,
    updateAnswer,
    saveNow: saveProgress,
    interruptSession,
    clearProgress,
  };
}

export default useSessionAutoSave;
