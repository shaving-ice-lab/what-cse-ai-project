"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Briefcase,
  Users,
  CalendarPlus,
  Clock,
  AlertCircle,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, Skeleton } from "@what-cse/ui";
import { positionApi } from "@/services/position-api";
import type { PositionStats } from "@/types/position";

// 数字动画 Hook
function useAnimatedNumber(
  targetValue: number,
  duration: number = 1000,
  enabled: boolean = true
) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        startValueRef.current = displayValue;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const currentValue = Math.round(
        startValueRef.current + (targetValue - startValueRef.current) * easedProgress
      );
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    },
    [targetValue, duration, displayValue]
  );

  useEffect(() => {
    if (!enabled || targetValue === displayValue) return;

    // 如果目标值为 0 或动画被禁用，直接设置
    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    // 重置动画
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, enabled, animate]);

  return displayValue;
}

// 动画数字组件
function AnimatedNumber({
  value,
  formatter,
  loading,
}: {
  value: number;
  formatter: (num: number) => string;
  loading?: boolean;
}) {
  const animatedValue = useAnimatedNumber(value, 1200, !loading);

  if (loading) {
    return <Skeleton className="h-8 w-24 mt-1" />;
  }

  return <span className="text-2xl font-bold mt-1">{formatter(animatedValue)}</span>;
}

interface StatsCardProps {
  title: string;
  value: number;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
  onClick?: () => void;
  loading?: boolean;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  formatter?: (num: number) => string;
}

function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  onClick,
  loading,
  variant = "default",
  formatter = (num) => num.toLocaleString(),
}: StatsCardProps) {
  const variantStyles = {
    default: "bg-white",
    primary: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200",
  };

  const iconStyles = {
    default: "bg-gray-100 text-gray-600",
    primary: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-amber-100 text-amber-600",
    danger: "bg-red-100 text-red-600",
  };

  return (
    <Card
      className={`${variantStyles[variant]} ${onClick ? "cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <AnimatedNumber value={value} formatter={formatter} loading={loading} />
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend !== undefined && !loading && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs ${
                  trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp className={`h-3 w-3 ${trend < 0 ? "rotate-180" : ""}`} />
                <span>{trend >= 0 ? "+" : ""}{trend}%</span>
                <span className="text-muted-foreground">较昨日</span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${iconStyles[variant]} transition-transform ${onClick ? "group-hover:scale-110" : ""}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PositionStatsCardsProps {
  onFilterChange?: (filter: Partial<{ status?: string; unlimited_major?: boolean; expiring_days?: number; updated_today?: boolean }>) => void;
}

export function PositionStatsCards({ onFilterChange }: PositionStatsCardsProps) {
  const [stats, setStats] = useState<PositionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await positionApi.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取统计数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "万";
    }
    return num.toLocaleString();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatsCard
        title="总职位数"
        value={stats?.total_count || 0}
        icon={<Briefcase className="h-5 w-5" />}
        loading={loading}
        variant="primary"
        formatter={formatNumber}
      />
      <StatsCard
        title="总招录人数"
        value={stats?.total_recruit_count || 0}
        icon={<Users className="h-5 w-5" />}
        loading={loading}
        variant="success"
        formatter={formatNumber}
      />
      <StatsCard
        title="今日新增"
        value={stats?.today_new_count || 0}
        icon={<CalendarPlus className="h-5 w-5" />}
        loading={loading}
        onClick={() => onFilterChange?.({ updated_today: true })}
        formatter={formatNumber}
      />
      <StatsCard
        title="报名中"
        value={stats?.registering_count || 0}
        icon={<Clock className="h-5 w-5" />}
        loading={loading}
        variant="warning"
        onClick={() => onFilterChange?.({ status: "registering" })}
        formatter={formatNumber}
      />
      <StatsCard
        title="3天内截止"
        value={stats?.expiring_count || 0}
        icon={<AlertCircle className="h-5 w-5" />}
        loading={loading}
        variant="danger"
        onClick={() => onFilterChange?.({ expiring_days: 3 })}
        formatter={formatNumber}
      />
      <StatsCard
        title="已发布"
        value={stats?.published_count || 0}
        icon={<BookOpen className="h-5 w-5" />}
        loading={loading}
        formatter={formatNumber}
      />
    </div>
  );
}

export default PositionStatsCards;
