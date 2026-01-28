"use client";

import { useMemo } from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Edit3,
  CreditCard,
  Ticket,
  BookOpen,
  Award,
  Users,
  Trophy,
} from "lucide-react";
import { Badge } from "@what-cse/ui";
import type { CalendarEvent, CalendarEventType } from "@/services/calendar-api";

// 事件类型图标映射
const EVENT_TYPE_ICONS: Record<CalendarEventType, React.ComponentType<{ className?: string }>> = {
  announcement: FileText,
  registration_start: Edit3,
  registration_end: Clock,
  payment_end: CreditCard,
  print_ticket: Ticket,
  written_exam: BookOpen,
  written_result: Award,
  interview: Users,
  final_result: Trophy,
  custom: Circle,
};

// 标准考试流程顺序
const EXAM_FLOW_ORDER: CalendarEventType[] = [
  "announcement",
  "registration_start",
  "registration_end",
  "payment_end",
  "print_ticket",
  "written_exam",
  "written_result",
  "interview",
  "final_result",
];

interface ExamTimelineProps {
  events: CalendarEvent[];
  positionId?: string;
  onEventClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export function ExamTimeline({ events, positionId, onEventClick, compact = false }: ExamTimelineProps) {
  // 过滤并排序事件
  const sortedEvents = useMemo(() => {
    let filtered = events;
    if (positionId) {
      filtered = events.filter((e) => e.position_id === positionId);
    }

    // 按照标准流程顺序排序
    return [...filtered].sort((a, b) => {
      const orderA = EXAM_FLOW_ORDER.indexOf(a.event_type);
      const orderB = EXAM_FLOW_ORDER.indexOf(b.event_type);
      if (orderA !== -1 && orderB !== -1) {
        return orderA - orderB;
      }
      // 按日期排序
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    });
  }, [events, positionId]);

  // 找到当前阶段（第一个未完成且未过期的事件）
  const currentStageIndex = useMemo(() => {
    const now = new Date();
    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const eventDate = new Date(event.event_date);
      if (event.status === "pending" && eventDate >= now) {
        return i;
      }
    }
    return -1; // 所有事件都已完成或过期
  }, [sortedEvents]);

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">暂无时间线事件</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {sortedEvents.map((event, index) => {
          const Icon = EVENT_TYPE_ICONS[event.event_type] || Circle;
          const isCompleted = event.status === "completed";
          const isCurrent = index === currentStageIndex;
          const isPast = event.is_overdue && event.status === "pending";

          return (
            <div key={event.id} className="flex items-center">
              <div
                onClick={() => onEventClick?.(event)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : isCurrent
                    ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1"
                    : isPast
                    ? "bg-red-100 text-red-700"
                    : "bg-muted text-muted-foreground"
                }`}
                title={`${event.event_type_name}: ${event.event_date}`}
              >
                <Icon className="h-3 w-3" />
                {isCurrent && <span className="font-medium">{event.event_type_name}</span>}
              </div>
              {index < sortedEvents.length - 1 && (
                <div
                  className={`w-4 h-0.5 ${
                    index < currentStageIndex || (currentStageIndex === -1 && isCompleted)
                      ? "bg-green-500"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 时间线 */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

      <div className="space-y-4">
        {sortedEvents.map((event, index) => {
          const Icon = EVENT_TYPE_ICONS[event.event_type] || Circle;
          const isCompleted = event.status === "completed";
          const isCancelled = event.status === "cancelled";
          const isCurrent = index === currentStageIndex;
          const isPast = event.is_overdue && event.status === "pending";

          return (
            <div
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className={`relative pl-10 cursor-pointer group ${
                isCancelled ? "opacity-50" : ""
              }`}
            >
              {/* 节点 */}
              <div
                className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCancelled
                    ? "bg-muted text-muted-foreground"
                    : isCurrent
                    ? "bg-blue-500 text-white ring-4 ring-blue-100"
                    : isPast
                    ? "bg-red-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </div>

              {/* 连接线高亮（已完成部分） */}
              {index > 0 && (index <= currentStageIndex || (currentStageIndex === -1 && isCompleted)) && (
                <div
                  className="absolute left-[17px] -top-4 w-0.5 h-4 bg-green-500"
                />
              )}

              {/* 内容 */}
              <div
                className={`p-3 rounded-lg border transition-colors group-hover:bg-accent ${
                  isCurrent ? "border-blue-200 bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.event_type_name}</span>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          当前阶段
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                          已完成
                        </Badge>
                      )}
                      {isCancelled && (
                        <Badge variant="outline" className="text-xs">
                          已取消
                        </Badge>
                      )}
                      {isPast && !isCompleted && !isCancelled && (
                        <Badge variant="destructive" className="text-xs">
                          已逾期
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.event_title}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{event.event_date}</div>
                    {event.event_time && (
                      <div className="text-muted-foreground">{event.event_time}</div>
                    )}
                    {event.days_remaining >= 0 && event.status === "pending" && (
                      <div
                        className={`text-xs mt-1 ${
                          event.days_remaining <= 3 ? "text-amber-600" : "text-muted-foreground"
                        }`}
                      >
                        {event.days_remaining === 0
                          ? "今天"
                          : event.days_remaining === 1
                          ? "明天"
                          : `${event.days_remaining}天后`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 进度指示 */}
      {currentStageIndex >= 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">
              当前进度：{currentStageIndex + 1}/{sortedEvents.length}
            </span>
            <span className="text-blue-600 font-medium">
              {Math.round(((currentStageIndex) / sortedEvents.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(currentStageIndex / sortedEvents.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamTimeline;
