"use client";

import { cn } from "@/lib/utils";
import { Check, Clock, Circle } from "lucide-react";

interface TimelineItem {
  title: string;
  date: string;
  status: "completed" | "active" | "pending";
  description?: string;
}

interface PositionTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function PositionTimeline({ items, className }: PositionTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={index}
            className="relative pl-8 pb-6 last:pb-0"
          >
            {/* Connecting Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[11px] top-6 w-0.5 h-full",
                  item.status === "completed" ? "bg-emerald-200" : "bg-stone-200"
                )}
              />
            )}

            {/* Status Icon */}
            <div
              className={cn(
                "absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2",
                item.status === "completed" &&
                  "bg-emerald-500 border-emerald-500 text-white",
                item.status === "active" &&
                  "bg-amber-500 border-amber-500 text-white animate-pulse-ring",
                item.status === "pending" &&
                  "bg-white border-stone-300 text-stone-400"
              )}
            >
              {item.status === "completed" ? (
                <Check className="w-3.5 h-3.5" />
              ) : item.status === "active" ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-2 h-2 fill-current" />
              )}
            </div>

            {/* Content */}
            <div>
              <h4
                className={cn(
                  "font-medium",
                  item.status === "completed" && "text-emerald-700",
                  item.status === "active" && "text-amber-700",
                  item.status === "pending" && "text-stone-500"
                )}
              >
                {item.title}
              </h4>
              <p className="text-sm text-stone-500 mt-0.5">{item.date}</p>
              {item.description && (
                <p className="text-sm text-stone-600 mt-1">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
