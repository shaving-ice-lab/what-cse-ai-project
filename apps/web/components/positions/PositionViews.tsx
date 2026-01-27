"use client";

import Link from "next/link";
import {
  Heart,
  MapPin,
  Users,
  GraduationCap,
  Building2,
  ChevronRight,
  Scale,
  Clock,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type { Position, MatchResult } from "@/types";

// 类型定义
interface ViewPosition extends Partial<Position> {
  id: number;
  position_name: string;
  department_name: string;
  work_location?: string;
  work_location_province?: string;
  work_location_city?: string;
  education_requirement?: string;
  major_requirement?: string;
  recruit_count: number;
  exam_type: string;
  registration_count?: number;
  matchScore?: number;
  competition_ratio?: number;
  political_status_requirement?: string;
  base_work_experience?: string;
}

interface PositionViewProps {
  positions: ViewPosition[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onCompare?: (id: number) => void;
  compareList?: number[];
}

// 工具函数
function getScoreColor(score: number) {
  if (score >= 90) return "from-emerald-500 to-emerald-600";
  if (score >= 70) return "from-amber-500 to-amber-600";
  if (score >= 50) return "from-orange-500 to-orange-600";
  return "from-stone-400 to-stone-500";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "完美匹配";
  if (score >= 70) return "高度匹配";
  if (score >= 50) return "部分匹配";
  return "匹配较低";
}

function getScoreBgColor(score: number) {
  if (score >= 90) return "bg-emerald-50 border-emerald-200";
  if (score >= 70) return "bg-amber-50 border-amber-200";
  if (score >= 50) return "bg-orange-50 border-orange-200";
  return "bg-stone-50 border-stone-200";
}

function getExamTypeStyle(examType: string) {
  switch (examType) {
    case "国考":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "省考":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "事业单位":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "选调生":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
}

function formatCompetitionRatio(ratio?: number) {
  if (!ratio) return "暂无";
  return `${ratio.toFixed(0)}:1`;
}

function getLocation(position: ViewPosition) {
  if (position.work_location) return position.work_location;
  if (position.work_location_province && position.work_location_city) {
    return `${position.work_location_province}${position.work_location_city}`;
  }
  return position.work_location_province || "未知";
}

// 列表视图组件
export function ListView({
  positions,
  favorites,
  onToggleFavorite,
  onCompare,
  compareList = [],
}: PositionViewProps) {
  return (
    <div className="space-y-4">
      {positions.map((position, index) => (
        <div
          key={position.id}
          className="group bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Match Score Bar */}
          {position.matchScore !== undefined && (
            <div className={`h-1 bg-gradient-to-r ${getScoreColor(position.matchScore)}`} />
          )}

          <div className="p-5 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Link
                    href={`/positions/${position.id}`}
                    className="text-lg font-semibold text-stone-800 hover:text-amber-600 transition-colors"
                  >
                    {position.position_name}
                  </Link>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${getExamTypeStyle(
                      position.exam_type
                    )}`}
                  >
                    {position.exam_type}
                  </span>
                  {position.matchScore !== undefined && position.matchScore >= 80 && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
                      推荐
                    </span>
                  )}
                </div>

                {/* Department */}
                <p className="flex items-center gap-1.5 text-stone-600 mb-3">
                  <Building2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span className="truncate">{position.department_name}</span>
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                    <MapPin className="w-3.5 h-3.5" />
                    {getLocation(position)}
                  </span>
                  {position.education_requirement && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {position.education_requirement}
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                    <Users className="w-3.5 h-3.5" />招{position.recruit_count}人
                  </span>
                  {position.major_requirement && position.major_requirement !== "不限" && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg text-amber-700 border border-amber-200">
                      {position.major_requirement.length > 10
                        ? position.major_requirement.slice(0, 10) + "..."
                        : position.major_requirement}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side */}
              <div className="flex flex-col items-end gap-3">
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {onCompare && (
                    <button
                      onClick={() => onCompare(position.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        compareList.includes(position.id)
                          ? "bg-blue-50 text-blue-500"
                          : "hover:bg-stone-100 text-stone-400"
                      }`}
                      title="加入对比"
                    >
                      <Scale className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => onToggleFavorite(position.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(position.id)
                        ? "bg-red-50 text-red-500"
                        : "hover:bg-stone-100 text-stone-400"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${favorites.includes(position.id) ? "fill-current" : ""}`}
                    />
                  </button>
                </div>

                {/* Match Score */}
                {position.matchScore !== undefined && (
                  <div className="text-right">
                    <div
                      className={`text-2xl font-display font-bold bg-gradient-to-r ${getScoreColor(
                        position.matchScore
                      )} bg-clip-text text-transparent`}
                    >
                      {position.matchScore}%
                    </div>
                    <p className="text-xs text-stone-500">{getScoreLabel(position.matchScore)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-4 text-sm text-stone-500">
                {position.competition_ratio !== undefined && (
                  <span>
                    竞争比:{" "}
                    <span className="font-medium text-amber-600">
                      {formatCompetitionRatio(position.competition_ratio)}
                    </span>
                  </span>
                )}
                {position.registration_count !== undefined && (
                  <span>已报名: {position.registration_count}人</span>
                )}
              </div>
              <Link
                href={`/positions/${position.id}`}
                className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors group/link"
              >
                查看详情
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 卡片视图组件
export function GridView({
  positions,
  favorites,
  onToggleFavorite,
  onCompare,
  compareList = [],
}: PositionViewProps) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {positions.map((position, index) => (
        <div
          key={position.id}
          className="group bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in flex flex-col"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Header with Score */}
          <div
            className={`px-5 py-4 border-b ${
              position.matchScore !== undefined
                ? getScoreBgColor(position.matchScore)
                : "bg-stone-50 border-stone-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-md border ${getExamTypeStyle(
                      position.exam_type
                    )}`}
                  >
                    {position.exam_type}
                  </span>
                </div>
                <Link
                  href={`/positions/${position.id}`}
                  className="font-semibold text-stone-800 hover:text-amber-600 transition-colors line-clamp-1"
                >
                  {position.position_name}
                </Link>
              </div>
              {position.matchScore !== undefined && (
                <div className="text-right ml-3">
                  <div
                    className={`text-xl font-display font-bold bg-gradient-to-r ${getScoreColor(
                      position.matchScore
                    )} bg-clip-text text-transparent`}
                  >
                    {position.matchScore}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            <p className="flex items-center gap-1.5 text-sm text-stone-600 mb-3">
              <Building2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <span className="line-clamp-1">{position.department_name}</span>
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex items-center gap-1.5 text-stone-500">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{getLocation(position)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-500">
                <Users className="w-3.5 h-3.5" />
                <span>招{position.recruit_count}人</span>
              </div>
              {position.education_requirement && (
                <div className="flex items-center gap-1.5 text-stone-500">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="truncate">{position.education_requirement}</span>
                </div>
              )}
              {position.competition_ratio !== undefined && (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Scale className="w-3.5 h-3.5" />
                  <span>{formatCompetitionRatio(position.competition_ratio)}</span>
                </div>
              )}
            </div>

            {/* Major Tag */}
            {position.major_requirement && position.major_requirement !== "不限" && (
              <div className="mb-4">
                <span className="inline-block px-2.5 py-1 text-xs bg-amber-50 rounded-lg text-amber-700 border border-amber-200 truncate max-w-full">
                  {position.major_requirement}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
              <div className="flex items-center gap-1">
                {onCompare && (
                  <button
                    onClick={() => onCompare(position.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      compareList.includes(position.id)
                        ? "bg-blue-50 text-blue-500"
                        : "hover:bg-stone-100 text-stone-400"
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onToggleFavorite(position.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    favorites.includes(position.id)
                      ? "bg-red-50 text-red-500"
                      : "hover:bg-stone-100 text-stone-400"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${favorites.includes(position.id) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
              <Link
                href={`/positions/${position.id}`}
                className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                详情 <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 表格视图组件
export function TableView({
  positions,
  favorites,
  onToggleFavorite,
  onCompare,
  compareList = [],
}: PositionViewProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                职位信息
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                地区
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                学历
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                招录
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                竞争比
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                匹配度
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {positions.map((position, index) => (
              <tr
                key={position.id}
                className="hover:bg-stone-50/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/positions/${position.id}`}
                        className="font-medium text-stone-800 hover:text-amber-600 transition-colors truncate"
                      >
                        {position.position_name}
                      </Link>
                      <span
                        className={`flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded ${getExamTypeStyle(
                          position.exam_type
                        )}`}
                      >
                        {position.exam_type}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 truncate">{position.department_name}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-stone-600">{getLocation(position)}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-stone-600">
                    {position.education_requirement || "-"}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center min-w-8 h-6 px-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                    {position.recruit_count}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-medium text-stone-600">
                    {formatCompetitionRatio(position.competition_ratio)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  {position.matchScore !== undefined ? (
                    <span
                      className={`inline-flex items-center justify-center min-w-12 h-7 px-2 rounded-lg text-sm font-bold bg-gradient-to-r ${getScoreColor(
                        position.matchScore
                      )} text-white`}
                    >
                      {position.matchScore}%
                    </span>
                  ) : (
                    <span className="text-sm text-stone-400">-</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    {onCompare && (
                      <button
                        onClick={() => onCompare(position.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          compareList.includes(position.id)
                            ? "bg-blue-50 text-blue-500"
                            : "hover:bg-stone-100 text-stone-400"
                        }`}
                        title="加入对比"
                      >
                        <Scale className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleFavorite(position.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        favorites.includes(position.id)
                          ? "bg-red-50 text-red-500"
                          : "hover:bg-stone-100 text-stone-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.includes(position.id) ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <Link
                      href={`/positions/${position.id}`}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
