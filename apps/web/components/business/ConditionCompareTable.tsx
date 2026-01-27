"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConditionItem {
  name: string;
  userValue: string;
  positionValue: string;
  isMatch: boolean;
}

interface ConditionCompareTableProps {
  conditions: ConditionItem[];
  className?: string;
}

export function ConditionCompareTable({ conditions, className }: ConditionCompareTableProps) {
  const matchedCount = conditions.filter((c) => c.isMatch).length;
  const totalCount = conditions.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 rounded-xl">
        <span className="text-sm text-stone-600">条件匹配情况</span>
        <span className="text-sm font-medium">
          <span className="text-emerald-600">{matchedCount}</span>
          <span className="text-stone-400"> / {totalCount}</span>
          <span className="text-stone-500 ml-1">项符合</span>
        </span>
      </div>

      {/* Conditions List */}
      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border",
              condition.isMatch
                ? "bg-emerald-50/50 border-emerald-200"
                : "bg-red-50/50 border-red-200"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-stone-500">{condition.name}</p>
              <div className="flex items-center gap-4 mt-1">
                <div>
                  <span className="text-xs text-stone-400">要求: </span>
                  <span className="text-sm font-medium text-stone-700">
                    {condition.positionValue}
                  </span>
                </div>
                <div className="w-px h-4 bg-stone-200" />
                <div>
                  <span className="text-xs text-stone-400">您: </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      condition.isMatch ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {condition.userValue}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-4",
                condition.isMatch ? "bg-emerald-500" : "bg-red-500"
              )}
            >
              {condition.isMatch ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <X className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
