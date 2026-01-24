"use client";

import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getScoreConfig(score: number) {
  if (score >= 90) {
    return {
      label: "完美匹配",
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
    };
  }
  if (score >= 70) {
    return {
      label: "高度匹配",
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-100",
      text: "text-amber-700",
    };
  }
  if (score >= 50) {
    return {
      label: "部分匹配",
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-100",
      text: "text-orange-700",
    };
  }
  return {
    label: "匹配较低",
    gradient: "from-stone-400 to-stone-500",
    bg: "bg-stone-100",
    text: "text-stone-600",
  };
}

export function MatchScoreBadge({
  score,
  size = "md",
  showLabel = true,
  className,
}: MatchScoreBadgeProps) {
  const config = getScoreConfig(score);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const labelSizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <div
        className={cn(
          "font-display font-bold bg-gradient-to-r bg-clip-text text-transparent",
          config.gradient,
          sizeClasses[size]
        )}
      >
        {score}%
      </div>
      {showLabel && (
        <span
          className={cn(
            "font-medium rounded-md",
            config.bg,
            config.text,
            labelSizeClasses[size]
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}
