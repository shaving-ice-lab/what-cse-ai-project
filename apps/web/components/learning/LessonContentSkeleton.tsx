"use client";

import React from "react";
import { cn } from "@/lib/utils";

// =====================================================
// 骨架屏基础组件
// =====================================================

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-stone-200/70 rounded",
        className
      )}
    />
  );
}

// =====================================================
// 课程内容骨架屏
// =====================================================

export function LessonContentSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 考情分析骨架 */}
      <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="ml-auto h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>

      {/* 课程导入骨架 */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* 核心概念骨架 */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="ml-auto h-5 w-20" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-stone-50 rounded-xl">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>

      {/* 方法步骤骨架 */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 pb-4 border-b border-stone-100 last:border-0">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 记忆口诀骨架 */}
      <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100/50">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 bg-white/50 rounded-xl">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>

      {/* 练习题目骨架 */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="ml-auto h-5 w-16" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-4 w-full mb-4" />
              <div className="space-y-2 mb-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-10 w-full rounded" />
                ))}
              </div>
              <Skeleton className="h-8 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 课程总结骨架 */}
      <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// 模块卡片骨架屏
// =====================================================

export function ModuleCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden animate-pulse">
      <Skeleton className="h-1.5 w-full" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="w-5 h-5 rounded" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-14 rounded-lg" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-8" />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-2 h-2 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// 模块网格骨架屏
// =====================================================

export function ModuleGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ModuleCardSkeleton key={idx} />
      ))}
    </div>
  );
}

// =====================================================
// 素材内容骨架屏
// =====================================================

export function MaterialContentSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 头部骨架 */}
      <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100/50">
        <Skeleton className="h-7 w-48 mb-4" />
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>

      {/* 金句骨架 */}
      <div className="bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-2xl p-8">
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-4/5" />
      </div>

      {/* 内容骨架 */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* 使用场景骨架 */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="ml-auto h-5 w-16" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>

      {/* 范文片段骨架 */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="w-24 h-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 p-4 bg-stone-50 rounded-xl">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-11/12 mb-1" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// 知识点详情骨架屏
// =====================================================

export function KnowledgeDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 头部卡片骨架 */}
      <div className="bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="h-7 w-32 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-4 h-4 rounded" />
            ))}
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Tab 骨架 */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>

      {/* 内容骨架 */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        <div className="mt-6">
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonContentSkeleton;
