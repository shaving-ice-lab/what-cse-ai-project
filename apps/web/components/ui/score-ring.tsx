"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
  animated?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 90) return { stroke: "#10b981", bg: "#d1fae5", text: "text-emerald-600" };
  if (score >= 70) return { stroke: "#f59e0b", bg: "#fef3c7", text: "text-amber-600" };
  if (score >= 50) return { stroke: "#f97316", bg: "#ffedd5", text: "text-orange-600" };
  return { stroke: "#78716c", bg: "#e7e5e4", text: "text-stone-500" };
}

function getScoreLabel(score: number) {
  if (score >= 90) return "完美匹配";
  if (score >= 70) return "高度匹配";
  if (score >= 50) return "部分匹配";
  return "匹配较低";
}

export function ScoreRing({
  score,
  size = 80,
  strokeWidth = 8,
  className,
  showLabel = false,
  labelClassName,
  animated = true,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;
  const colors = getScoreColor(score);

  useEffect(() => {
    if (!animated) {
      setAnimatedScore(score);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animated, score]);

  useEffect(() => {
    if (!isVisible && animated) return;

    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, isVisible, animated]);

  return (
    <div ref={ref} className={cn("relative inline-flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.bg}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn("font-display font-bold", colors.text)}
            style={{ fontSize: size * 0.25 }}
          >
            {Math.round(animatedScore)}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className={cn("text-sm font-medium mt-2", colors.text, labelClassName)}
        >
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

// Compact version for list items
interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const colors = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "px-2 py-0.5 text-xs font-medium rounded-md",
          colors.text
        )}
        style={{ backgroundColor: colors.bg }}
      >
        {label}
      </span>
      <span className={cn("text-lg font-display font-bold", colors.text)}>
        {score}%
      </span>
    </div>
  );
}
