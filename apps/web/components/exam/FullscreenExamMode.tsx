"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Maximize,
  Minimize,
  Calculator as CalculatorIcon,
  FileText,
  Clock,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@what-cse/ui/lib/utils";
import { Calculator } from "./Calculator";
import { Scratchpad } from "./Scratchpad";

interface FullscreenExamModeProps {
  children: React.ReactNode;
  examTitle?: string;
  totalTime?: number; // seconds
  currentTime?: number; // seconds elapsed
  onTimeUp?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

// Anti-cheat warning modal
function AntiCheatWarning({ 
  isOpen, 
  onClose, 
  warningCount 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  warningCount: number;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden animate-shake">
        <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-xl font-bold text-white">警告</h2>
            <p className="text-red-100 text-sm">检测到窗口切换</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-stone-700 mb-4">
            您已离开考试页面 <span className="font-bold text-red-600">{warningCount}</span> 次。
            频繁切换窗口可能导致考试成绩无效。
          </p>
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">
              请专注于考试，避免切换到其他应用程序或浏览器标签页。
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            我知道了，继续考试
          </button>
        </div>
      </div>
    </div>
  );
}

// Toolbar component
function ExamToolbar({
  isFullscreen,
  onToggleFullscreen,
  showCalculator,
  onToggleCalculator,
  showScratchpad,
  onToggleScratchpad,
  warningCount,
  soundEnabled,
  onToggleSound,
}: {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  showCalculator: boolean;
  onToggleCalculator: () => void;
  showScratchpad: boolean;
  onToggleScratchpad: () => void;
  warningCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Warning indicator */}
      {warningCount > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>警告 {warningCount} 次</span>
        </div>
      )}

      <div className="h-6 w-px bg-stone-200" />

      {/* Calculator */}
      <button
        onClick={onToggleCalculator}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          showCalculator
            ? "bg-amber-100 text-amber-700"
            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
        )}
        title="计算器"
      >
        <CalculatorIcon className="w-4 h-4" />
        <span className="hidden sm:inline">计算器</span>
      </button>

      {/* Scratchpad */}
      <button
        onClick={onToggleScratchpad}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          showScratchpad
            ? "bg-blue-100 text-blue-700"
            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
        )}
        title="草稿纸"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">草稿纸</span>
      </button>

      <div className="h-6 w-px bg-stone-200" />

      {/* Sound toggle */}
      <button
        onClick={onToggleSound}
        className={cn(
          "p-2 rounded-lg transition-colors",
          soundEnabled
            ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
            : "bg-stone-100 text-stone-400 hover:bg-stone-200"
        )}
        title={soundEnabled ? "关闭提示音" : "开启提示音"}
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Fullscreen toggle */}
      <button
        onClick={onToggleFullscreen}
        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-colors"
        title={isFullscreen ? "退出全屏" : "进入全屏"}
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        <span className="hidden sm:inline">{isFullscreen ? "退出全屏" : "全屏模式"}</span>
      </button>
    </div>
  );
}

export function FullscreenExamMode({
  children,
  examTitle = "模拟考试",
  totalTime,
  currentTime = 0,
  onTimeUp,
  onSubmit,
  isSubmitting = false,
}: FullscreenExamModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(currentTime);
  const lastActiveRef = useRef(true);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate remaining time
  const remainingTime = totalTime ? totalTime - elapsedTime : null;
  const isTimeWarning = remainingTime !== null && remainingTime <= 300 && remainingTime > 0; // 5 minutes warning
  const isTimeCritical = remainingTime !== null && remainingTime <= 60 && remainingTime > 0; // 1 minute critical

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1;
        if (totalTime && newTime >= totalTime) {
          onTimeUp?.();
          clearInterval(timer);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [totalTime, onTimeUp]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Anti-cheat: detect window/tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && lastActiveRef.current) {
        // User switched away
        lastActiveRef.current = false;
      } else if (!document.hidden && !lastActiveRef.current) {
        // User came back
        lastActiveRef.current = true;
        setWarningCount((prev) => {
          const newCount = prev + 1;
          setShowWarningModal(true);
          
          // Play warning sound if enabled
          if (soundEnabled) {
            try {
              const audio = new Audio("/sounds/warning.mp3");
              audio.play().catch(() => {});
            } catch {}
          }
          
          return newCount;
        });
      }
    };

    const handleBlur = () => {
      // Window lost focus
      if (lastActiveRef.current) {
        lastActiveRef.current = false;
      }
    };

    const handleFocus = () => {
      // Window gained focus
      if (!lastActiveRef.current) {
        lastActiveRef.current = true;
        setWarningCount((prev) => {
          const newCount = prev + 1;
          setShowWarningModal(true);
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [soundEnabled]);

  // Prevent accidental page close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "考试正在进行中，确定要离开吗？";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F11 for fullscreen
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
      // Escape to close tools
      if (e.key === "Escape") {
        if (showCalculator) setShowCalculator(false);
        if (showScratchpad) setShowScratchpad(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen, showCalculator, showScratchpad]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-screen bg-gradient-to-b from-stone-50 to-white",
        isFullscreen && "fixed inset-0 z-50 overflow-auto"
      )}
    >
      {/* Anti-cheat warning modal */}
      <AntiCheatWarning
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        warningCount={warningCount}
      />

      {/* Calculator */}
      <Calculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        position={{ x: 100, y: 150 }}
      />

      {/* Scratchpad */}
      <Scratchpad
        isOpen={showScratchpad}
        onClose={() => setShowScratchpad(false)}
        position={{ x: 500, y: 150 }}
      />

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Exam title */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-stone-800">{examTitle}</h1>
              {isFullscreen && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                  全屏模式
                </span>
              )}
            </div>

            {/* Center: Timer */}
            {remainingTime !== null && (
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold",
                  isTimeCritical
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : isTimeWarning
                    ? "bg-amber-100 text-amber-700"
                    : "bg-stone-100 text-stone-700"
                )}
              >
                <Clock className="w-5 h-5" />
                <span>{formatTime(remainingTime)}</span>
              </div>
            )}

            {/* Right: Toolbar */}
            <ExamToolbar
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              showCalculator={showCalculator}
              onToggleCalculator={() => setShowCalculator(!showCalculator)}
              showScratchpad={showScratchpad}
              onToggleScratchpad={() => setShowScratchpad(!showScratchpad)}
              warningCount={warningCount}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>

      {/* CSS for shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default FullscreenExamMode;
