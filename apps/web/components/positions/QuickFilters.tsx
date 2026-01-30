"use client";

import { Zap, TrendingUp, GraduationCap, Users, Target, Clock, Sparkles, AlertTriangle, MapPinOff, X, Filter, Crown, BadgeCheck, Building2, Briefcase, DollarSign, UserCheck } from "lucide-react";

export interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  apiParam?: {
    key: string;
    value: string | boolean | number;
  };
}

interface QuickFiltersProps {
  activeFilters: string[];
  onFilterChange: (filterId: string) => void;
  onClearAll?: () => void;
}

export const quickFilters: QuickFilter[] = [
  {
    id: "today-new",
    label: "今日新增",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    description: "今天发布的职位",
    color: "amber",
    apiParam: { key: "updated_today", value: true },
  },
  {
    id: "expiring-soon",
    label: "即将截止",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    description: "3天内报名截止",
    color: "red",
    apiParam: { key: "expiring_days", value: 3 },
  },
  {
    id: "major-unlimited",
    label: "不限专业",
    icon: <Zap className="w-3.5 h-3.5" />,
    description: "专业不限制",
    color: "emerald",
    apiParam: { key: "unlimited_major", value: true },
  },
  {
    id: "household-unlimited",
    label: "不限户籍",
    icon: <MapPinOff className="w-3.5 h-3.5" />,
    description: "无户籍限制",
    color: "teal",
    apiParam: { key: "household_unlimited", value: true },
  },
  {
    id: "fresh-graduate",
    label: "应届可报",
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    description: "应届生可报考",
    color: "blue",
    apiParam: { key: "fresh_graduate", value: true },
  },
  {
    id: "no-exp",
    label: "无经验要求",
    icon: <Target className="w-3.5 h-3.5" />,
    description: "无工作经验要求",
    color: "violet",
    apiParam: { key: "no_experience", value: true },
  },
  {
    id: "more-recruit",
    label: "招人多",
    icon: <Users className="w-3.5 h-3.5" />,
    description: "招录≥3人",
    color: "green",
    apiParam: { key: "min_recruit", value: 3 },
  },
  {
    id: "low-competition",
    label: "低竞争比",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    description: "竞争比≤50:1",
    color: "cyan",
    apiParam: { key: "competition_ratio_max", value: 50 },
  },
  {
    id: "recent",
    label: "近期发布",
    icon: <Clock className="w-3.5 h-3.5" />,
    description: "7天内发布",
    color: "orange",
    apiParam: { key: "days", value: 7 },
  },
  {
    id: "central-level",
    label: "中央机关",
    icon: <Crown className="w-3.5 h-3.5" />,
    description: "中央直属机关职位",
    color: "purple",
    apiParam: { key: "department_level", value: "中央" },
  },
  {
    id: "province-level",
    label: "省级单位",
    icon: <Building2 className="w-3.5 h-3.5" />,
    description: "省级机关职位",
    color: "indigo",
    apiParam: { key: "department_level", value: "省级" },
  },
  {
    id: "party-member",
    label: "党员优先",
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
    description: "中共党员可报",
    color: "rose",
    apiParam: { key: "political_status", value: "中共党员" },
  },
  {
    id: "high-salary",
    label: "高薪岗位",
    icon: <DollarSign className="w-3.5 h-3.5" />,
    description: "年薪15万以上",
    color: "yellow",
    apiParam: { key: "min_salary", value: 150000 },
  },
  {
    id: "no-base-exp",
    label: "无基层要求",
    icon: <Briefcase className="w-3.5 h-3.5" />,
    description: "不要求基层工作经历",
    color: "lime",
    apiParam: { key: "no_base_experience", value: true },
  },
  {
    id: "unlimited-all",
    label: "三不限",
    icon: <UserCheck className="w-3.5 h-3.5" />,
    description: "专业+学历+政治面貌不限",
    color: "pink",
    apiParam: { key: "unlimited_all", value: true },
  },
];

// 根据颜色获取样式类
const getColorClasses = (color: string, isActive: boolean) => {
  const colorMap: Record<string, { active: string; inactive: string }> = {
    amber: {
      active: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200/50",
      inactive: "text-amber-700 hover:bg-amber-50 hover:border-amber-300",
    },
    red: {
      active: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-200/50",
      inactive: "text-red-600 hover:bg-red-50 hover:border-red-300",
    },
    emerald: {
      active: "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-200/50",
      inactive: "text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300",
    },
    teal: {
      active: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-200/50",
      inactive: "text-teal-700 hover:bg-teal-50 hover:border-teal-300",
    },
    blue: {
      active: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200/50",
      inactive: "text-blue-700 hover:bg-blue-50 hover:border-blue-300",
    },
    violet: {
      active: "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-200/50",
      inactive: "text-violet-700 hover:bg-violet-50 hover:border-violet-300",
    },
    green: {
      active: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200/50",
      inactive: "text-green-700 hover:bg-green-50 hover:border-green-300",
    },
    cyan: {
      active: "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-200/50",
      inactive: "text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300",
    },
    orange: {
      active: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50",
      inactive: "text-orange-700 hover:bg-orange-50 hover:border-orange-300",
    },
    purple: {
      active: "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-200/50",
      inactive: "text-purple-700 hover:bg-purple-50 hover:border-purple-300",
    },
    indigo: {
      active: "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-200/50",
      inactive: "text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300",
    },
    rose: {
      active: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200/50",
      inactive: "text-rose-700 hover:bg-rose-50 hover:border-rose-300",
    },
    yellow: {
      active: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-200/50",
      inactive: "text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300",
    },
    lime: {
      active: "bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-lg shadow-lime-200/50",
      inactive: "text-lime-700 hover:bg-lime-50 hover:border-lime-300",
    },
    pink: {
      active: "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200/50",
      inactive: "text-pink-700 hover:bg-pink-50 hover:border-pink-300",
    },
  };

  const styles = colorMap[color] || colorMap.amber;
  return isActive ? styles.active : styles.inactive;
};

export default function QuickFilters({ activeFilters, onFilterChange, onClearAll }: QuickFiltersProps) {
  const activeCount = activeFilters.length;

  return (
    <div className="relative">
      {/* 快速筛选区域 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {/* 标签 */}
        <div className="flex items-center gap-1 text-xs text-stone-400 flex-shrink-0 mr-1">
          <Filter className="w-3 h-3" />
          <span>快速筛选</span>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-4 bg-stone-200 flex-shrink-0" />

        {/* 筛选按钮组 */}
        <div className="flex items-center gap-1.5">
          {quickFilters.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            const colorClasses = getColorClasses(filter.color || "amber", isActive);

            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`
                  group relative flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium 
                  whitespace-nowrap transition-all duration-200 ease-out
                  ${isActive 
                    ? `${colorClasses} scale-[1.02]` 
                    : `bg-white border border-stone-200 ${colorClasses}`
                  }
                `}
                title={filter.description}
              >
                <span className={`transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}>
                  {filter.icon}
                </span>
                <span>{filter.label}</span>
                {isActive && (
                  <span className="ml-0.5 opacity-80">
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 清除所有筛选按钮 */}
        {activeCount > 0 && onClearAll && (
          <>
            <div className="w-px h-4 bg-stone-200 flex-shrink-0 ml-1" />
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-red-500 
                         hover:bg-red-50 rounded-full transition-all duration-200 flex-shrink-0 border border-transparent hover:border-red-200"
            >
              <X className="w-3 h-3" />
              <span>清除 ({activeCount})</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
