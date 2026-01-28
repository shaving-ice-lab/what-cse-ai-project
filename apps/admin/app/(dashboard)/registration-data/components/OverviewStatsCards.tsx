"use client";

import {
  Users,
  UserCheck,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  Award,
} from "lucide-react";
import { Card, CardContent, Skeleton } from "@what-cse/ui";
import type { RegistrationOverview } from "@/types/registration-data";

interface OverviewStatsCardsProps {
  data: RegistrationOverview | null;
  loading: boolean;
}

export function OverviewStatsCards({ data, loading }: OverviewStatsCardsProps) {
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "万";
    }
    return num.toLocaleString();
  };

  const stats = [
    {
      title: "总报名人数",
      value: data?.total_applicants || 0,
      format: formatNumber,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "总过审人数",
      value: data?.total_pass_count || 0,
      format: formatNumber,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "平均竞争比",
      value: data?.avg_competition_ratio || 0,
      format: (v: number) => v.toFixed(1) + ":1",
      icon: TrendingUp,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "最高竞争比",
      value: data?.max_competition_ratio || 0,
      format: (v: number) => v.toFixed(0) + ":1",
      icon: Award,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "无人报考职位",
      value: data?.no_applicant_count || 0,
      format: (v: number) => v.toString(),
      icon: AlertCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "低竞争比职位",
      value: data?.low_competition_count || 0,
      format: (v: number) => v.toString(),
      icon: TrendingDown,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
      description: "竞争比<10:1",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {stat.format(stat.value)}
                    </p>
                    {stat.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
