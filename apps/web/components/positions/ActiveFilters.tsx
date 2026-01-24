"use client";

import { X, XCircle, Sparkles } from "lucide-react";
import { FilterValues } from "./PositionFilters";

interface ActiveFiltersProps {
  values: FilterValues;
  onRemove: (key: keyof FilterValues, value?: string) => void;
  onClearAll: () => void;
}

interface FilterTag {
  key: keyof FilterValues;
  value: string;
  label: string;
  color: string;
}

export default function ActiveFilters({
  values,
  onRemove,
  onClearAll,
}: ActiveFiltersProps) {
  const tags: FilterTag[] = [];

  // 考试类型
  values.examType.forEach((v) => {
    tags.push({ key: "examType", value: v, label: v, color: "blue" });
  });

  // 省份
  values.province.forEach((v) => {
    tags.push({
      key: "province",
      value: v,
      label: v.replace(/省|市|自治区|壮族|维吾尔|回族/g, ""),
      color: "emerald",
    });
  });

  // 部门层级
  values.departmentLevel.forEach((v) => {
    tags.push({ key: "departmentLevel", value: v, label: v, color: "violet" });
  });

  // 学历
  values.educationMin.forEach((v) => {
    tags.push({ key: "educationMin", value: v, label: v, color: "amber" });
  });

  // 专业
  values.majorCategory.forEach((v) => {
    tags.push({ key: "majorCategory", value: v, label: v, color: "pink" });
  });

  // 政治面貌
  values.politicalStatus.forEach((v) => {
    if (v !== "不限") {
      tags.push({ key: "politicalStatus", value: v, label: v, color: "red" });
    }
  });

  // 工作经验
  values.workExpYearsMin.forEach((v) => {
    if (v !== "0") {
      tags.push({
        key: "workExpYearsMin",
        value: v,
        label: `${v}年经验`,
        color: "orange",
      });
    }
  });

  // 年龄范围
  if (values.ageRange[0] !== 18 || values.ageRange[1] !== 35) {
    tags.push({
      key: "ageRange",
      value: `${values.ageRange[0]}-${values.ageRange[1]}`,
      label: `${values.ageRange[0]}-${values.ageRange[1]}岁`,
      color: "cyan",
    });
  }

  // 招录人数
  if (values.recruitCountMin !== null) {
    tags.push({
      key: "recruitCountMin",
      value: String(values.recruitCountMin),
      label: `≥${values.recruitCountMin}人`,
      color: "teal",
    });
  }

  // 竞争比
  if (values.competitionRatioMax !== null) {
    tags.push({
      key: "competitionRatioMax",
      value: String(values.competitionRatioMax),
      label: `竞争比≤${values.competitionRatioMax}:1`,
      color: "indigo",
    });
  }

  // 性别
  values.genderRequired.forEach((v) => {
    if (v !== "不限") {
      tags.push({ key: "genderRequired", value: v, label: v, color: "slate" });
    }
  });

  if (tags.length === 0) {
    return null;
  }

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-200",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    pink: {
      bg: "bg-pink-50",
      text: "text-pink-700",
      border: "border-pink-200",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
    },
    cyan: {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-200",
    },
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    slate: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
    },
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-stone-500 mr-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>已选条件:</span>
        </div>
        
        {tags.map((tag, index) => {
          const colors = colorClasses[tag.color] || colorClasses.blue;
          return (
            <button
              key={`${tag.key}-${tag.value}-${index}`}
              onClick={() => onRemove(tag.key, tag.value)}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all hover:opacity-80 ${colors.bg} ${colors.text} ${colors.border} animate-scale-in`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span>{tag.label}</span>
              <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}

        {tags.length > 1 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>清除全部</span>
          </button>
        )}
      </div>
    </div>
  );
}
