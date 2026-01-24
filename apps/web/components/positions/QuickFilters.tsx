"use client";

import { Zap, TrendingUp, GraduationCap, Users, Target, Clock } from "lucide-react";

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface QuickFiltersProps {
  activeFilter: string | null;
  onFilterChange: (filterId: string | null) => void;
}

const quickFilters: QuickFilter[] = [
  {
    id: "high-match",
    label: "高匹配度",
    icon: <Target className="w-4 h-4" />,
    description: "匹配度≥80%",
  },
  {
    id: "low-competition",
    label: "低竞争比",
    icon: <TrendingUp className="w-4 h-4" />,
    description: "竞争比≤50:1",
  },
  {
    id: "more-recruit",
    label: "招人多",
    icon: <Users className="w-4 h-4" />,
    description: "招录≥3人",
  },
  {
    id: "no-exp",
    label: "应届可报",
    icon: <GraduationCap className="w-4 h-4" />,
    description: "无工作经验要求",
  },
  {
    id: "major-unlimited",
    label: "专业不限",
    icon: <Zap className="w-4 h-4" />,
    description: "专业不限制",
  },
  {
    id: "recent",
    label: "最新发布",
    icon: <Clock className="w-4 h-4" />,
    description: "7天内发布",
  },
];

export default function QuickFilters({
  activeFilter,
  onFilterChange,
}: QuickFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
      <span className="text-sm text-stone-500 flex-shrink-0 mr-1">快速筛选:</span>
      {quickFilters.map((filter) => (
        <button
          key={filter.id}
          onClick={() =>
            onFilterChange(activeFilter === filter.id ? null : filter.id)
          }
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === filter.id
              ? "bg-amber-500 text-white shadow-amber-md"
              : "bg-white border border-stone-200 text-stone-600 hover:border-amber-300 hover:bg-amber-50"
          }`}
          title={filter.description}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
