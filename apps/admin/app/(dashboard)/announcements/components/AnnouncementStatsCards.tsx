"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CalendarPlus,
  CheckCircle,
  Users,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, Skeleton } from "@what-cse/ui";
import { announcementApi } from "@/services/announcement-api";
import type { AnnouncementStats } from "@/types/announcement";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

function StatsCard({ title, value, icon, loading, onClick, variant = "default" }: StatsCardProps) {
  const variantClasses = {
    default: "bg-card",
    primary: "bg-blue-50 border-blue-100",
    success: "bg-green-50 border-green-100",
    warning: "bg-amber-50 border-amber-100",
    danger: "bg-red-50 border-red-100",
  };

  const iconClasses = {
    default: "text-muted-foreground",
    primary: "text-blue-600",
    success: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };

  return (
    <Card
      className={`${variantClasses[variant]} ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-background ${iconClasses[variant]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AnnouncementStatsCardsProps {
  onFilterChange?: (filter: Partial<{ status?: number; reg_status?: string }>) => void;
}

export function AnnouncementStatsCards({ onFilterChange }: AnnouncementStatsCardsProps) {
  const [stats, setStats] = useState<AnnouncementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await announcementApi.getStats();
        setStats(data);
      } catch (err) {
        console.error("获取统计数据失败:", err);
        setError(err instanceof Error ? err.message : "获取统计数据失败");
        // 使用模拟数据
        setStats({
          total: 0,
          published_count: 0,
          draft_count: 0,
          today_new_count: 0,
          registering_count: 0,
          total_positions: 0,
          total_recruit: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error && !stats) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + "万";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatsCard
        title="总公告数"
        value={formatNumber(stats?.total || 0)}
        icon={<FileText className="h-5 w-5" />}
        loading={loading}
        variant="primary"
      />
      <StatsCard
        title="已发布"
        value={formatNumber(stats?.published_count || 0)}
        icon={<CheckCircle className="h-5 w-5" />}
        loading={loading}
        variant="success"
        onClick={() => onFilterChange?.({ status: 1 })}
      />
      <StatsCard
        title="草稿"
        value={formatNumber(stats?.draft_count || 0)}
        icon={<FileText className="h-5 w-5" />}
        loading={loading}
        onClick={() => onFilterChange?.({ status: 0 })}
      />
      <StatsCard
        title="今日新增"
        value={formatNumber(stats?.today_new_count || 0)}
        icon={<CalendarPlus className="h-5 w-5" />}
        loading={loading}
      />
      <StatsCard
        title="报名中"
        value={formatNumber(stats?.registering_count || 0)}
        icon={<Clock className="h-5 w-5" />}
        loading={loading}
        variant="warning"
        onClick={() => onFilterChange?.({ reg_status: "registering" })}
      />
      <StatsCard
        title="关联职位"
        value={formatNumber(stats?.total_positions || 0)}
        icon={<Briefcase className="h-5 w-5" />}
        loading={loading}
      />
    </div>
  );
}

export default AnnouncementStatsCards;
