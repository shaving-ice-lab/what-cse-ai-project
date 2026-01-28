"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  Check,
  X,
  MapPin,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Star,
  Loader2,
  Sparkles,
  Lightbulb,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useComparePositionsEnhanced, useAddFavorite, useRemoveFavorite } from "@/hooks/usePosition";
import type { Position, CompareResponse, CompareItem, Recommendation, CompareSummary } from "@/services/api/position";

export default function ComparePositionsPage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").map(Number).filter(Boolean) : [];

  const { data, isLoading, error } = useComparePositionsEnhanced(ids);
  const items = data?.items || [];
  const positions = items.map((item) => item.position);
  const recommendation = data?.recommendation;
  const summary = data?.summary;

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  // 比较项配置
  const compareFields = [
    { key: "recruit_count", label: "招录人数", type: "number" },
    { key: "education", label: "学历要求", type: "text" },
    { key: "degree", label: "学位要求", type: "text" },
    { key: "major_requirement", label: "专业要求", type: "text", multiline: true },
    { key: "political_status", label: "政治面貌", type: "text" },
    { key: "age", label: "年龄要求", type: "text" },
    { key: "work_experience", label: "工作经验", type: "text" },
    { key: "gender", label: "性别要求", type: "text" },
    { key: "household_requirement", label: "户籍要求", type: "text" },
    { key: "service_period", label: "服务期限", type: "text" },
    { key: "exam_type", label: "考试类型", type: "text" },
    { key: "department_level", label: "单位层级", type: "text" },
    { key: "registration_end", label: "报名截止", type: "date" },
    { key: "exam_date", label: "笔试时间", type: "date" },
  ];

  // 格式化值
  const formatValue = (value: unknown, type: string): string => {
    if (value === null || value === undefined || value === "") return "不限";
    if (type === "date" && typeof value === "string") {
      const date = new Date(value);
      return date.toLocaleDateString("zh-CN");
    }
    if (type === "number") return String(value);
    return String(value);
  };

  // 检查是否有差异
  const hasDifference = (key: string): boolean => {
    if (positions.length < 2) return false;
    const values = positions.map((p) => formatValue((p as Record<string, unknown>)[key], "text"));
    return new Set(values).size > 1;
  };

  // 获取最优值（招录人数取最大）
  const getBestValue = (key: string, type: string): string | null => {
    if (positions.length < 2) return null;
    if (key === "recruit_count") {
      const max = Math.max(...positions.map((p) => p.recruit_count || 0));
      return String(max);
    }
    return null;
  };

  if (ids.length < 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <Scale className="h-16 w-16 text-stone-300 mb-4" />
        <h2 className="text-xl font-semibold text-stone-700 mb-2">请选择至少2个职位进行对比</h2>
        <p className="text-stone-500 mb-6">返回职位列表添加更多职位到对比</p>
        <Link
          href="/positions"
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
        >
          <ArrowLeft className="h-4 w-4 inline mr-2" />
          返回职位列表
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin mb-4" />
        <p className="text-stone-500">加载中...</p>
      </div>
    );
  }

  if (error || positions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-stone-700 mb-2">加载失败</h2>
        <p className="text-stone-500 mb-6">
          {error instanceof Error ? error.message : "无法加载职位数据"}
        </p>
        <Link
          href="/positions"
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
        >
          <ArrowLeft className="h-4 w-4 inline mr-2" />
          返回职位列表
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 头部 */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/positions"
                className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-amber-500" />
                  职位对比
                </h1>
                <p className="text-sm text-stone-500">共对比 {positions.length} 个职位</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 对比表格 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* 表头 - 职位名称 */}
              <thead>
                <tr className="bg-stone-50">
                  <th className="w-[180px] p-4 text-left font-semibold text-stone-600 border-b border-r border-stone-200 sticky left-0 bg-stone-50 z-10">
                    对比项
                  </th>
                  {positions.map((position) => (
                    <th
                      key={position.id}
                      className="min-w-[260px] p-4 text-left border-b border-r border-stone-200 last:border-r-0"
                    >
                      <Link
                        href={`/positions/${position.id}`}
                        className="font-bold text-stone-800 hover:text-amber-600 transition-colors line-clamp-2"
                      >
                        {position.position_name}
                      </Link>
                      <p className="text-sm text-stone-500 mt-1 flex items-center gap-1 line-clamp-1">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        {position.department_name}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-stone-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {position.province}
                          {position.city && `·${position.city}`}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* 表体 - 对比项 */}
              <tbody>
                {compareFields.map((field, idx) => {
                  const isDiff = hasDifference(field.key);
                  const bestValue = getBestValue(field.key, field.type);

                  return (
                    <tr
                      key={field.key}
                      className={`${isDiff ? "bg-amber-50/50" : ""} ${
                        idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"
                      }`}
                    >
                      <td className="p-4 font-medium text-stone-700 border-r border-b border-stone-200 sticky left-0 bg-inherit z-10">
                        <div className="flex items-center gap-2">
                          {field.label}
                          {isDiff && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-xs rounded">
                              差异
                            </span>
                          )}
                        </div>
                      </td>
                      {positions.map((position) => {
                        const value = formatValue(
                          (position as Record<string, unknown>)[field.key],
                          field.type
                        );
                        const isBest = bestValue && value === bestValue;

                        return (
                          <td
                            key={position.id}
                            className={`p-4 border-r border-b border-stone-200 last:border-r-0 ${
                              field.multiline ? "align-top" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`${
                                  value === "不限"
                                    ? "text-emerald-600 font-medium"
                                    : "text-stone-700"
                                } ${field.multiline ? "whitespace-pre-wrap" : ""}`}
                              >
                                {value}
                              </span>
                              {isBest && (
                                <span className="shrink-0 px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-xs rounded">
                                  最优
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* 快捷标签行 */}
                <tr className="bg-stone-50">
                  <td className="p-4 font-medium text-stone-700 border-r border-b border-stone-200 sticky left-0 bg-stone-50 z-10">
                    特殊标签
                  </td>
                  {positions.map((position) => (
                    <td
                      key={position.id}
                      className="p-4 border-r border-b border-stone-200 last:border-r-0"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {position.is_unlimited_major && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">
                            不限专业
                          </span>
                        )}
                        {position.is_for_fresh_graduate && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
                            应届可报
                          </span>
                        )}
                        {!position.is_unlimited_major && !position.is_for_fresh_graduate && (
                          <span className="text-stone-400 text-sm">无</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 操作行 */}
                <tr>
                  <td className="p-4 font-medium text-stone-700 border-r border-stone-200 sticky left-0 bg-white z-10">
                    操作
                  </td>
                  {positions.map((position) => (
                    <td
                      key={position.id}
                      className="p-4 border-r border-stone-200 last:border-r-0"
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/positions/${position.id}`}
                          className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 inline mr-1" />
                          查看详情
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI 综合建议 */}
        {summary && (
          <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI 综合建议
            </h3>
            
            {/* 总体分析 */}
            <div className="mb-4 p-4 bg-white/60 rounded-xl">
              <p className="text-stone-700">{summary.overview}</p>
            </div>

            {/* 重点差异 */}
            {summary.highlights.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-500" />
                  重点差异
                </h4>
                <ul className="space-y-1.5">
                  {summary.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-sm text-stone-600 flex items-start gap-2 bg-white/40 rounded-lg px-3 py-2">
                      <span className="text-orange-500 shrink-0">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 选择建议 */}
            {summary.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  选择建议
                </h4>
                <ul className="space-y-1.5">
                  {summary.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-stone-600 flex items-start gap-2 bg-white/40 rounded-lg px-3 py-2">
                      <span className="text-amber-500 shrink-0">💡</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 智能推荐卡片 */}
        {recommendation && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recommendation.most_recruit && (
              <div className="bg-white rounded-xl border border-blue-200 shadow-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">招录人数最多</span>
                </div>
                <p className="font-semibold text-stone-800 line-clamp-1">{recommendation.most_recruit.position_name}</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{recommendation.most_recruit.value}</p>
              </div>
            )}

            {recommendation.lowest_requirement && (
              <div className="bg-white rounded-xl border border-green-200 shadow-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">条件最宽松</span>
                </div>
                <p className="font-semibold text-stone-800 line-clamp-1">{recommendation.lowest_requirement.position_name}</p>
                <p className="text-sm text-green-600 mt-1 line-clamp-2">{recommendation.lowest_requirement.reason}</p>
              </div>
            )}

            {recommendation.best_for_fresh_grad && (
              <div className="bg-white rounded-xl border border-purple-200 shadow-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">适合应届生</span>
                </div>
                <p className="font-semibold text-stone-800 line-clamp-1">{recommendation.best_for_fresh_grad.position_name}</p>
                <p className="text-sm text-purple-600 mt-1">{recommendation.best_for_fresh_grad.reason}</p>
              </div>
            )}

            {recommendation.soonest_deadline && (
              <div className="bg-white rounded-xl border border-amber-200 shadow-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-600">即将截止</span>
                </div>
                <p className="font-semibold text-stone-800 line-clamp-1">{recommendation.soonest_deadline.position_name}</p>
                <p className="text-lg font-bold text-amber-700 mt-1">{recommendation.soonest_deadline.value}</p>
              </div>
            )}

            {recommendation.lowest_competition && (
              <div className="bg-white rounded-xl border border-teal-200 shadow-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-600">竞争最小</span>
                </div>
                <p className="font-semibold text-stone-800 line-clamp-1">{recommendation.lowest_competition.position_name}</p>
                <p className="text-lg font-bold text-teal-700 mt-1">{recommendation.lowest_competition.value}</p>
              </div>
            )}
          </div>
        )}

        {/* 对比总结 */}
        <div className="mt-6 bg-white rounded-2xl border border-stone-200 shadow-card p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-500" />
            对比分析
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* 招录人数最多 */}
            {(() => {
              const maxRecruit = Math.max(...positions.map((p) => p.recruit_count || 0));
              const best = positions.find((p) => p.recruit_count === maxRecruit);
              return best ? (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 mb-1">招录人数最多</p>
                  <p className="font-semibold text-blue-800">{best.position_name}</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">{maxRecruit}人</p>
                </div>
              ) : null;
            })()}

            {/* 不限专业 */}
            {(() => {
              const unlimited = positions.filter((p) => p.is_unlimited_major);
              return unlimited.length > 0 ? (
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-600 mb-1">不限专业职位</p>
                  <p className="font-semibold text-green-800">{unlimited.length}个</p>
                  <p className="text-sm text-green-600 mt-1">
                    {unlimited.map((p) => p.position_name).join("、")}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-stone-50 rounded-xl">
                  <p className="text-sm text-stone-500 mb-1">不限专业职位</p>
                  <p className="font-semibold text-stone-600">暂无</p>
                </div>
              );
            })()}

            {/* 应届可报 */}
            {(() => {
              const freshGrad = positions.filter((p) => p.is_for_fresh_graduate);
              return freshGrad.length > 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-600 mb-1">应届可报职位</p>
                  <p className="font-semibold text-amber-800">{freshGrad.length}个</p>
                  <p className="text-sm text-amber-600 mt-1">
                    {freshGrad.map((p) => p.position_name).join("、")}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-stone-50 rounded-xl">
                  <p className="text-sm text-stone-500 mb-1">应届可报职位</p>
                  <p className="font-semibold text-stone-600">暂无</p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
