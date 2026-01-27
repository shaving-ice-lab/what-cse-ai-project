"use client";

import { TrendingUp, TrendingDown, Users, Target, Award, BarChart3, PieChart } from "lucide-react";

interface StatItem {
  label: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

interface PositionStatsProps {
  totalPositions: number;
  totalRecruits: number;
  avgCompetitionRatio: number;
  matchedPositions?: number;
  byExamType?: { type: string; count: number; percentage: number }[];
}

export default function PositionStats({
  totalPositions,
  totalRecruits,
  avgCompetitionRatio,
  matchedPositions,
  byExamType,
}: PositionStatsProps) {
  const stats: StatItem[] = [
    {
      label: "符合条件职位",
      value: totalPositions.toLocaleString(),
      icon: <Target className="w-5 h-5" />,
      color: "amber",
    },
    {
      label: "总招录人数",
      value: totalRecruits.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: "emerald",
    },
    {
      label: "平均竞争比",
      value: `${avgCompetitionRatio.toFixed(0)}:1`,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "blue",
    },
    ...(matchedPositions !== undefined
      ? [
          {
            label: "高度匹配",
            value: matchedPositions.toLocaleString(),
            change: 12,
            icon: <Award className="w-5 h-5" />,
            color: "violet",
          },
        ]
      : []),
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; text: string; ring: string }> = {
      amber: {
        bg: "bg-amber-50",
        icon: "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-md",
        text: "text-amber-600",
        ring: "ring-amber-500/20",
      },
      emerald: {
        bg: "bg-emerald-50",
        icon: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
        text: "text-emerald-600",
        ring: "ring-emerald-500/20",
      },
      blue: {
        bg: "bg-blue-50",
        icon: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
        text: "text-blue-600",
        ring: "ring-blue-500/20",
      },
      violet: {
        bg: "bg-violet-50",
        icon: "bg-gradient-to-br from-violet-400 to-violet-600 text-white",
        text: "text-violet-600",
        ring: "ring-violet-500/20",
      },
    };
    return colors[color] || colors.amber;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-stone-100">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={stat.label}
              className="group p-4 lg:p-5 hover:bg-stone-50/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-stone-500">{stat.label}</p>
                  <p className="font-display text-2xl lg:text-3xl font-bold text-stone-800">
                    {stat.value}
                  </p>
                  {stat.change !== undefined && (
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        stat.change >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {stat.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{Math.abs(stat.change)}% 较上周</span>
                    </div>
                  )}
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon} group-hover:scale-110 transition-transform`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exam Type Distribution */}
      {byExamType && byExamType.length > 0 && (
        <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/30">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-stone-400" />
            <span className="text-sm font-medium text-stone-600">考试类型分布</span>
          </div>
          <div className="flex items-center gap-3">
            {byExamType.map((item, index) => {
              const typeColors: Record<string, string> = {
                国考: "bg-blue-500",
                省考: "bg-emerald-500",
                事业单位: "bg-violet-500",
                选调生: "bg-amber-500",
              };
              return (
                <div
                  key={item.type}
                  className="flex-1 animate-fade-in"
                  style={{ animationDelay: `${(index + stats.length) * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone-500">{item.type}</span>
                    <span className="text-xs font-medium text-stone-700">{item.count}</span>
                  </div>
                  <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        typeColors[item.type] || "bg-stone-400"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-400 mt-1 block">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
