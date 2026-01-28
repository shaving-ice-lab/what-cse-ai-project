"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Clock,
  Target,
  Award,
  ChevronRight,
  Calendar,
  BookOpen,
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  BarChart3,
} from "lucide-react";

// 知识点完成状态
export type KnowledgeStatus = "completed" | "in_progress" | "locked" | "not_started";

// 知识点节点
export interface KnowledgeNode {
  id: string;
  name: string;
  status: KnowledgeStatus;
  progress?: number;
  children?: KnowledgeNode[];
  totalItems?: number;
  completedItems?: number;
}

// 学习统计
export interface LearningStats {
  totalDuration: number; // 总学习时长（分钟）
  todayDuration: number; // 今日学习时长（分钟）
  streak: number; // 连续学习天数
  totalKnowledgePoints: number;
  completedKnowledgePoints: number;
  totalQuestions: number;
  correctQuestions: number;
  accuracy?: number;
}

// 学习日历数据
export interface LearningCalendarData {
  date: string; // YYYY-MM-DD
  duration: number; // 分钟
  completedItems: number;
}

// ============ 环形进度组件 ============
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 12,
  color = "#f59e0b",
  backgroundColor = "#e7e5e4",
  showLabel = true,
  label,
  animated = true,
  className,
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(progress);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 动画效果
          const duration = 1000;
          const steps = 60;
          const increment = progress / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= progress) {
              setAnimatedProgress(progress);
              clearInterval(timer);
            } else {
              setAnimatedProgress(current);
            }
          }, duration / steps);

          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [progress, animated]);

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex flex-col items-center", className)}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* 背景圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* 进度圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-bold text-stone-800"
            style={{ fontSize: size * 0.22 }}
          >
            {Math.round(animatedProgress)}%
          </span>
          {showLabel && label && (
            <span
              className="text-stone-500"
              style={{ fontSize: size * 0.1 }}
            >
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ 进度条组件 ============
interface ProgressBarProps {
  progress: number;
  label?: string;
  showValue?: boolean;
  color?: "amber" | "emerald" | "blue" | "violet" | "rose";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const progressBarColors = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
};

const progressBarBgColors = {
  amber: "bg-amber-100",
  emerald: "bg-emerald-100",
  blue: "bg-blue-100",
  violet: "bg-violet-100",
  rose: "bg-rose-100",
};

const progressBarSizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  progress,
  label,
  showValue = true,
  color = "amber",
  size = "md",
  className,
}: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-stone-700">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-stone-600">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full overflow-hidden",
          progressBarBgColors[color],
          progressBarSizes[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            progressBarColors[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// ============ 知识点完成度树 ============
interface KnowledgeTreeProps {
  data: KnowledgeNode[];
  onNodeClick?: (node: KnowledgeNode) => void;
  className?: string;
}

function KnowledgeTreeNode({
  node,
  level = 0,
  onNodeClick,
}: {
  node: KnowledgeNode;
  level?: number;
  onNodeClick?: (node: KnowledgeNode) => void;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    in_progress: {
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    locked: {
      icon: Circle,
      color: "text-stone-300",
      bgColor: "bg-stone-50",
    },
    not_started: {
      icon: Circle,
      color: "text-stone-400",
      bgColor: "bg-stone-50",
    },
  };

  const config = statusConfig[node.status];
  const Icon = config.icon;

  const progress =
    node.progress ??
    (node.totalItems && node.completedItems
      ? (node.completedItems / node.totalItems) * 100
      : 0);

  return (
    <div className="w-full">
      <button
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          }
          onNodeClick?.(node);
        }}
        className={cn(
          "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
          node.status !== "locked" && "hover:bg-stone-50",
          node.status === "locked" && "opacity-60 cursor-not-allowed"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        disabled={node.status === "locked"}
      >
        {/* 展开/折叠 */}
        {hasChildren && (
          <ChevronRight
            className={cn(
              "w-4 h-4 text-stone-400 transition-transform flex-shrink-0",
              expanded && "rotate-90"
            )}
          />
        )}
        {!hasChildren && <div className="w-4" />}

        {/* 状态图标 */}
        <Icon className={cn("w-5 h-5 flex-shrink-0", config.color)} />

        {/* 名称和进度 */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "font-medium truncate",
                node.status === "completed"
                  ? "text-stone-600"
                  : node.status === "locked"
                    ? "text-stone-400"
                    : "text-stone-800"
              )}
            >
              {node.name}
            </span>
            {node.status !== "locked" && (
              <span className="text-xs text-stone-500 flex-shrink-0">
                {node.completedItems ?? 0}/{node.totalItems ?? 0}
              </span>
            )}
          </div>
          {node.status !== "locked" && node.status !== "not_started" && (
            <div className="mt-1 h-1 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  node.status === "completed" ? "bg-emerald-500" : "bg-amber-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </button>

      {/* 子节点 */}
      {hasChildren && expanded && (
        <div className="ml-4">
          {node.children!.map((child) => (
            <KnowledgeTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function KnowledgeTree({
  data,
  onNodeClick,
  className,
}: KnowledgeTreeProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {data.map((node) => (
        <KnowledgeTreeNode
          key={node.id}
          node={node}
          onNodeClick={onNodeClick}
        />
      ))}
    </div>
  );
}

// ============ 学习时长统计 ============
interface LearningDurationProps {
  stats: LearningStats;
  className?: string;
}

export function LearningDuration({ stats, className }: LearningDurationProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? `${mins}分` : ""}`;
    }
    return `${mins}分钟`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 今日学习 */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-amber-700">今日学习</p>
            <p className="text-2xl font-bold text-stone-800">
              {formatDuration(stats.todayDuration)}
            </p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 border border-stone-200 text-center">
          <BarChart3 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-stone-800">
            {formatDuration(stats.totalDuration)}
          </p>
          <p className="text-xs text-stone-500">累计学习</p>
        </div>

        <div className="bg-white rounded-xl p-3 border border-stone-200 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-stone-800">{stats.streak}天</p>
          <p className="text-xs text-stone-500">连续学习</p>
        </div>

        <div className="bg-white rounded-xl p-3 border border-stone-200 text-center">
          <Target className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-stone-800">
            {stats.accuracy ?? Math.round((stats.correctQuestions / stats.totalQuestions) * 100)}%
          </p>
          <p className="text-xs text-stone-500">正确率</p>
        </div>
      </div>

      {/* 知识点完成情况 */}
      <div className="bg-white rounded-xl p-4 border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-stone-700">知识点完成</span>
          <span className="text-sm text-stone-500">
            {stats.completedKnowledgePoints}/{stats.totalKnowledgePoints}
          </span>
        </div>
        <ProgressBar
          progress={(stats.completedKnowledgePoints / stats.totalKnowledgePoints) * 100}
          showValue={false}
          color="emerald"
        />
      </div>

      {/* 题目完成情况 */}
      <div className="bg-white rounded-xl p-4 border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-stone-700">做题情况</span>
          <span className="text-sm text-stone-500">
            {stats.correctQuestions}/{stats.totalQuestions} 正确
          </span>
        </div>
        <ProgressBar
          progress={(stats.correctQuestions / stats.totalQuestions) * 100}
          showValue={false}
          color="blue"
        />
      </div>
    </div>
  );
}

// ============ 综合学习进度组件 ============
interface LearningProgressProps {
  stats: LearningStats;
  knowledgeTree?: KnowledgeNode[];
  calendarData?: LearningCalendarData[];
  onKnowledgeClick?: (node: KnowledgeNode) => void;
  className?: string;
}

export function LearningProgress({
  stats,
  knowledgeTree,
  calendarData,
  onKnowledgeClick,
  className,
}: LearningProgressProps) {
  const overallProgress =
    (stats.completedKnowledgePoints / stats.totalKnowledgePoints) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 总体进度环 */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          学习进度概览
        </h3>

        <div className="flex items-center gap-8">
          <ProgressRing
            progress={overallProgress}
            size={140}
            label="总完成度"
            color="#f59e0b"
          />

          <div className="flex-1 space-y-4">
            <ProgressBar
              progress={(stats.completedKnowledgePoints / stats.totalKnowledgePoints) * 100}
              label="知识点"
              color="emerald"
            />
            <ProgressBar
              progress={(stats.correctQuestions / stats.totalQuestions) * 100}
              label="做题正确率"
              color="blue"
            />
            <ProgressBar
              progress={Math.min(100, (stats.todayDuration / 60) * 100)}
              label="今日目标 (1小时)"
              color="violet"
            />
          </div>
        </div>
      </div>

      {/* 学习时长统计 */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          学习时长
        </h3>
        <LearningDuration stats={stats} />
      </div>

      {/* 知识点完成度树 */}
      {knowledgeTree && knowledgeTree.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            知识点完成情况
          </h3>
          <KnowledgeTree data={knowledgeTree} onNodeClick={onKnowledgeClick} />
        </div>
      )}
    </div>
  );
}

export default LearningProgress;
