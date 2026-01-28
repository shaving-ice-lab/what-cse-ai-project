"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Bookmark,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from "lucide-react";

// 时间点类型
export type TimePointType = "keypoint" | "summary" | "important" | "example" | "tip";

// 时间点数据
export interface VideoTimePoint {
  id: number;
  timestamp: number; // 秒
  title: string;
  description?: string;
  type: TimePointType;
  knowledgePointId?: number;
}

// 视频时间轴Props
interface VideoTimelineProps {
  timePoints: VideoTimePoint[];
  currentTime?: number;
  duration?: number;
  onSeek?: (timestamp: number) => void;
  className?: string;
}

// 格式化时间显示
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// 时间点类型配置
const TIME_POINT_CONFIG: Record<
  TimePointType,
  { icon: typeof Lightbulb; color: string; bgColor: string; label: string }
> = {
  keypoint: {
    icon: Lightbulb,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    label: "重点",
  },
  summary: {
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "总结",
  },
  important: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "注意",
  },
  example: {
    icon: Play,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "例题",
  },
  tip: {
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    label: "技巧",
  },
};

// 单个时间点组件
function TimePointItem({
  point,
  isActive,
  onSeek,
}: {
  point: VideoTimePoint;
  isActive: boolean;
  onSeek?: (timestamp: number) => void;
}) {
  const config = TIME_POINT_CONFIG[point.type];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onSeek?.(point.timestamp)}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
        isActive
          ? "bg-amber-50 border border-amber-200"
          : "hover:bg-stone-50 border border-transparent"
      )}
    >
      {/* 图标 */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          config.bgColor
        )}
      >
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-stone-400">
            {formatTime(point.timestamp)}
          </span>
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded",
              config.bgColor,
              config.color
            )}
          >
            {config.label}
          </span>
        </div>
        <h4
          className={cn(
            "text-sm font-medium",
            isActive ? "text-amber-700" : "text-stone-700"
          )}
        >
          {point.title}
        </h4>
        {point.description && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-2">
            {point.description}
          </p>
        )}
      </div>
    </button>
  );
}

// 进度条上的标记点
function TimelineMarker({
  point,
  duration,
  onClick,
  isActive,
}: {
  point: VideoTimePoint;
  duration: number;
  onClick?: () => void;
  isActive: boolean;
}) {
  const position = (point.timestamp / duration) * 100;
  const config = TIME_POINT_CONFIG[point.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-transform hover:scale-125",
        isActive ? "ring-2 ring-amber-400 ring-offset-1" : "",
        config.bgColor
      )}
      style={{ left: `${position}%` }}
      title={`${formatTime(point.timestamp)} - ${point.title}`}
    />
  );
}

export function VideoTimeline({
  timePoints,
  currentTime = 0,
  duration = 0,
  onSeek,
  className,
}: VideoTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterType, setFilterType] = useState<TimePointType | "all">("all");

  // 按时间排序的时间点
  const sortedPoints = useMemo(
    () => [...timePoints].sort((a, b) => a.timestamp - b.timestamp),
    [timePoints]
  );

  // 过滤后的时间点
  const filteredPoints = useMemo(
    () =>
      filterType === "all"
        ? sortedPoints
        : sortedPoints.filter((p) => p.type === filterType),
    [sortedPoints, filterType]
  );

  // 当前活跃的时间点（最近过去的）
  const activePoint = useMemo(() => {
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      if (sortedPoints[i].timestamp <= currentTime) {
        return sortedPoints[i];
      }
    }
    return null;
  }, [sortedPoints, currentTime]);

  // 统计各类型数量
  const typeCounts = useMemo(() => {
    const counts: Record<TimePointType, number> = {
      keypoint: 0,
      summary: 0,
      important: 0,
      example: 0,
      tip: 0,
    };
    timePoints.forEach((p) => counts[p.type]++);
    return counts;
  }, [timePoints]);

  if (timePoints.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-white rounded-xl border border-stone-200", className)}>
      {/* 头部 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-stone-800">AI 视频要点</h3>
            <p className="text-xs text-stone-500">{timePoints.length} 个知识要点</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-stone-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-stone-400" />
        )}
      </button>

      {isExpanded && (
        <>
          {/* 时间轴可视化 */}
          {duration > 0 && (
            <div className="px-4 pb-4">
              <div className="relative h-4 bg-stone-100 rounded-full">
                {/* 当前进度 */}
                <div
                  className="absolute inset-y-0 left-0 bg-amber-500/30 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                {/* 标记点 */}
                {sortedPoints.map((point) => (
                  <TimelineMarker
                    key={point.id}
                    point={point}
                    duration={duration}
                    onClick={() => onSeek?.(point.timestamp)}
                    isActive={activePoint?.id === point.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 类型筛选 */}
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                filterType === "all"
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              全部 ({timePoints.length})
            </button>
            {Object.entries(typeCounts).map(([type, count]) =>
              count > 0 ? (
                <button
                  key={type}
                  onClick={() => setFilterType(type as TimePointType)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                    filterType === type
                      ? cn(
                          TIME_POINT_CONFIG[type as TimePointType].bgColor,
                          TIME_POINT_CONFIG[type as TimePointType].color
                        )
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  {TIME_POINT_CONFIG[type as TimePointType].label} ({count})
                </button>
              ) : null
            )}
          </div>

          {/* 时间点列表 */}
          <div className="max-h-80 overflow-y-auto px-4 pb-4 space-y-2">
            {filteredPoints.map((point) => (
              <TimePointItem
                key={point.id}
                point={point}
                isActive={activePoint?.id === point.id}
                onSeek={onSeek}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default VideoTimeline;
