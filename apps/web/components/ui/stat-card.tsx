"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "amber" | "emerald" | "blue" | "violet" | "rose";
  className?: string;
}

const colorMap = {
  amber: {
    iconBg: "bg-gradient-to-br from-amber-100 to-amber-50",
    iconColor: "text-amber-600",
  },
  emerald: {
    iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
    iconColor: "text-emerald-600",
  },
  blue: {
    iconBg: "bg-gradient-to-br from-blue-100 to-blue-50",
    iconColor: "text-blue-600",
  },
  violet: {
    iconBg: "bg-gradient-to-br from-violet-100 to-violet-50",
    iconColor: "text-violet-600",
  },
  rose: {
    iconBg: "bg-gradient-to-br from-rose-100 to-rose-50",
    iconColor: "text-rose-600",
  },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  prefix = "",
  trend,
  color = "amber",
  className,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn("bg-white rounded-2xl border border-stone-200/50 shadow-card p-5", className)}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            colors.iconBg
          )}
        >
          <Icon className={cn("w-6 h-6", colors.iconColor)} />
        </div>
        <div>
          <p className="text-sm text-stone-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-stone-800">
              <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
            </p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
