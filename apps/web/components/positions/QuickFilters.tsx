"use client";

import { Zap, TrendingUp, GraduationCap, Users, Target, Clock, Sparkles, AlertTriangle, MapPinOff } from "lucide-react";

export interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
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
    icon: <Sparkles className="w-4 h-4" />,
    description: "今天发布的职位",
    apiParam: { key: "updated_today", value: true },
  },
  {
    id: "expiring-soon",
    label: "即将截止",
    icon: <AlertTriangle className="w-4 h-4" />,
    description: "3天内报名截止",
    apiParam: { key: "expiring_days", value: 3 },
  },
  {
    id: "major-unlimited",
    label: "不限专业",
    icon: <Zap className="w-4 h-4" />,
    description: "专业不限制",
    apiParam: { key: "unlimited_major", value: true },
  },
  {
    id: "household-unlimited",
    label: "不限户籍",
    icon: <MapPinOff className="w-4 h-4" />,
    description: "无户籍限制",
    apiParam: { key: "household_unlimited", value: true },
  },
  {
    id: "fresh-graduate",
    label: "应届可报",
    icon: <GraduationCap className="w-4 h-4" />,
    description: "应届生可报考",
    apiParam: { key: "fresh_graduate", value: true },
  },
  {
    id: "no-exp",
    label: "无经验要求",
    icon: <Target className="w-4 h-4" />,
    description: "无工作经验要求",
    apiParam: { key: "no_experience", value: true },
  },
  {
    id: "more-recruit",
    label: "招人多",
    icon: <Users className="w-4 h-4" />,
    description: "招录≥3人",
    apiParam: { key: "min_recruit", value: 3 },
  },
  {
    id: "low-competition",
    label: "低竞争比",
    icon: <TrendingUp className="w-4 h-4" />,
    description: "竞争比≤50:1",
    apiParam: { key: "competition_ratio_max", value: 50 },
  },
  {
    id: "recent",
    label: "近期发布",
    icon: <Clock className="w-4 h-4" />,
    description: "7天内发布",
    apiParam: { key: "days", value: 7 },
  },
];

export default function QuickFilters({ activeFilters, onFilterChange, onClearAll }: QuickFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
      <span className="text-sm text-stone-500 flex-shrink-0 mr-1">快速筛选:</span>
      {quickFilters.map((filter) => {
        const isActive = activeFilters.includes(filter.id);
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-amber-500 text-white shadow-amber-md"
                : "bg-white border border-stone-200 text-stone-600 hover:border-amber-300 hover:bg-amber-50"
            }`}
            title={filter.description}
          >
            {filter.icon}
            <span>{filter.label}</span>
          </button>
        );
      })}
      {activeFilters.length > 0 && onClearAll && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors flex-shrink-0"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
