"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Clock,
  AlertCircle,
  CheckCircle,
  Trash2,
  RotateCcw,
  X,
  FileText,
} from "lucide-react";
import { cn } from "@what-cse/ui/lib/utils";
import {
  practiceApi,
  PracticeSession,
  PracticeSessionDetail,
  getSessionTypeName,
  formatTime,
} from "@/services/api/practice";

interface ResumeSessionModalProps {
  onResume?: (session: PracticeSessionDetail) => void;
  onDismiss?: () => void;
  autoCheck?: boolean; // Automatically check for resumable sessions
  checkInterval?: number; // How often to check (ms)
}

// Session card component
function SessionCard({
  session,
  onResume,
  onAbandon,
  isResuming,
}: {
  session: PracticeSession;
  onResume: () => void;
  onAbandon: () => void;
  isResuming: boolean;
}) {
  const progress = Math.round(session.progress);
  const timeAgo = session.last_saved_at
    ? getTimeAgo(new Date(session.last_saved_at))
    : "未知";

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-stone-800">
            {session.title || getSessionTypeName(session.session_type)}
          </h4>
          <p className="text-sm text-stone-500 mt-0.5">
            {getSessionTypeName(session.session_type)} · {session.total_questions} 题
          </p>
        </div>
        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
          {session.is_interrupted ? "中断" : "进行中"}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-stone-600">进度</span>
          <span className="font-medium text-stone-800">
            {session.completed_count}/{session.total_questions} ({progress}%)
          </span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="p-2 bg-stone-50 rounded-lg">
          <div className="text-sm font-bold text-green-600">{session.correct_count}</div>
          <div className="text-xs text-stone-400">正确</div>
        </div>
        <div className="p-2 bg-stone-50 rounded-lg">
          <div className="text-sm font-bold text-red-600">{session.wrong_count}</div>
          <div className="text-xs text-stone-400">错误</div>
        </div>
        <div className="p-2 bg-stone-50 rounded-lg">
          <div className="text-sm font-bold text-stone-600">
            {formatTime(session.total_time_spent)}
          </div>
          <div className="text-xs text-stone-400">用时</div>
        </div>
      </div>

      {/* Last saved info */}
      <div className="flex items-center gap-1 text-xs text-stone-400 mb-4">
        <Clock className="w-3 h-3" />
        <span>上次保存: {timeAgo}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onResume}
          disabled={isResuming}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors disabled:opacity-50"
        >
          {isResuming ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              恢复中...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              继续答题
            </>
          )}
        </button>
        <button
          onClick={onAbandon}
          disabled={isResuming}
          className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          title="放弃"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Helper function for relative time
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "刚刚";
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString("zh-CN");
}

/**
 * Modal component to prompt users to resume interrupted sessions
 */
export function ResumeSessionModal({
  onResume,
  onDismiss,
  autoCheck = true,
  checkInterval = 5000, // Check every 5 seconds on mount
}: ResumeSessionModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResuming, setIsResuming] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Check for resumable sessions
  const checkResumableSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await practiceApi.getResumableSessions();
      if (data && data.length > 0) {
        setSessions(data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Failed to check resumable sessions:", error);
    } finally {
      setIsLoading(false);
      setHasChecked(true);
    }
  }, []);

  // Auto-check on mount
  useEffect(() => {
    if (autoCheck && !hasChecked) {
      // Small delay before checking
      const timer = setTimeout(checkResumableSessions, 500);
      return () => clearTimeout(timer);
    }
  }, [autoCheck, hasChecked, checkResumableSessions]);

  // Handle resume
  const handleResume = async (sessionId: number) => {
    setIsResuming(sessionId);
    try {
      const session = await practiceApi.resumeSession(sessionId);
      setIsOpen(false);
      
      if (onResume) {
        onResume(session);
      } else {
        // Default: navigate to the session page
        router.push(`/learn/practice/session/${sessionId}`);
      }
    } catch (error) {
      console.error("Failed to resume session:", error);
    } finally {
      setIsResuming(null);
    }
  };

  // Handle abandon
  const handleAbandon = async (sessionId: number) => {
    if (!confirm("确定要放弃这个练习吗？放弃后无法恢复。")) {
      return;
    }

    try {
      await practiceApi.abandonSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (sessions.length <= 1) {
        setIsOpen(false);
        onDismiss?.();
      }
    } catch (error) {
      console.error("Failed to abandon session:", error);
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsOpen(false);
    onDismiss?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-stone-50 to-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-stone-800">发现未完成的练习</h2>
              <p className="text-sm text-stone-500">是否继续之前的答题？</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RotateCcw className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-stone-500">
              没有未完成的练习
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onResume={() => handleResume(session.id)}
                  onAbandon={() => handleAbandon(session.id)}
                  isResuming={isResuming === session.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400">
              系统会自动保存您的答题进度
            </p>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800 transition-colors"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check for resumable sessions and show prompt
 */
export function useResumableSessionCheck(options?: {
  enabled?: boolean;
  onFound?: (sessions: PracticeSession[]) => void;
}) {
  const [hasResumable, setHasResumable] = useState(false);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async () => {
    if (options?.enabled === false) return;

    setIsChecking(true);
    try {
      const data = await practiceApi.getResumableSessions();
      if (data && data.length > 0) {
        setSessions(data);
        setHasResumable(true);
        options?.onFound?.(data);
      }
    } catch (error) {
      console.error("Failed to check resumable sessions:", error);
    } finally {
      setIsChecking(false);
    }
  }, [options]);

  useEffect(() => {
    check();
  }, [check]);

  return {
    hasResumable,
    sessions,
    isChecking,
    recheck: check,
  };
}

export default ResumeSessionModal;
