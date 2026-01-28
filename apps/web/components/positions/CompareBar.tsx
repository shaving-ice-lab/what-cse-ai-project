"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  ArrowRight,
  MapPin,
  Users,
} from "lucide-react";
import type { PositionBrief } from "@/services/api/position";

interface CompareBarProps {
  positions: PositionBrief[];
  maxCount?: number;
  onRemove: (id: number) => void;
  onClear: () => void;
}

export function CompareBar({
  positions,
  maxCount = 5,
  onRemove,
  onClear,
}: CompareBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (positions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-warm-lg">
      {/* 折叠状态 */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Scale className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <span className="font-semibold text-stone-800">职位对比</span>
            <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
              {positions.length}/{maxCount}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <Trash2 className="h-4 w-4 inline mr-1" />
            清空
          </button>
          <Link
            href={`/positions/compare?ids=${positions.map((p) => p.id).join(",")}`}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-sm"
            onClick={(e) => e.stopPropagation()}
          >
            开始对比
            <ArrowRight className="h-4 w-4 inline ml-1" />
          </Link>
          <button className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* 展开状态 */}
      {isExpanded && (
        <div className="border-t border-stone-100 bg-stone-50/50">
          <div className="flex gap-3 p-4 overflow-x-auto">
            {positions.map((position) => (
              <div
                key={position.id}
                className="relative flex-shrink-0 w-[220px] p-4 bg-white rounded-xl border border-stone-200 shadow-card hover:shadow-card-hover transition-shadow"
              >
                {/* 删除按钮 */}
                <button
                  className="absolute -top-2 -right-2 p-1 bg-white border border-stone-200 rounded-full shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                  onClick={() => onRemove(position.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* 职位信息 */}
                <Link href={`/positions/${position.id}`} className="block">
                  <h4 className="font-semibold text-stone-800 line-clamp-1 hover:text-amber-600 transition-colors">
                    {position.position_name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                    {position.department_name}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-blue-600">
                      <Users className="h-3.5 w-3.5" />
                      {position.recruit_count}人
                    </span>
                    <span className="flex items-center gap-1 text-stone-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {position.province}
                    </span>
                  </div>
                </Link>
              </div>
            ))}

            {/* 空位提示 */}
            {positions.length < maxCount && (
              <div className="flex-shrink-0 w-[220px] p-4 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400">
                <Scale className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-sm">还可添加 {maxCount - positions.length} 个</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompareBar;
