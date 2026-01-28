"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Filter,
  Check,
  X,
  Zap,
  Award,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
  UserCircle,
} from "lucide-react";
import { useMatchResults, usePerformMatch, getMatchScoreColor, getMatchScoreLabel } from "@/hooks/useMatch";
import type { MatchResult as ApiMatchResult, MatchParams } from "@/services/api/match";

// Score Ring Component
function ScoreRing({
  score,
  size = 80,
  strokeWidth = 8,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = getMatchScoreColor(score);

  const colorMap: Record<string, { stroke: string; bg: string }> = {
    emerald: { stroke: "#10b981", bg: "#d1fae5" },
    amber: { stroke: "#f59e0b", bg: "#fef3c7" },
    orange: { stroke: "#f97316", bg: "#ffedd5" },
    stone: { stroke: "#78716c", bg: "#e7e5e4" },
  };

  const colors = colorMap[color] || colorMap.stone;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bg}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-xl font-display font-bold"
          style={{ color: colors.stroke }}
        >
          {score}%
        </span>
      </div>
    </div>
  );
}

export default function MatchPage() {
  const [page, setPage] = useState(1);
  const [params, setParams] = useState<MatchParams>({
    strategy: "smart",
    page: 1,
    page_size: 20,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useMatchResults(params);
  const performMatch = usePerformMatch();

  const results = data?.results || [];
  const stats = data?.stats;
  const userProfile = data?.user_profile;

  // 选中第一个结果
  const selectedResult = useMemo(() => {
    if (selectedId) {
      return results.find((r) => r.position.id === selectedId);
    }
    return results[0];
  }, [results, selectedId]);

  const handleRefresh = async () => {
    await refetch();
  };

  // 如果没有选中的结果，自动选中第一个
  if (results.length > 0 && !selectedId) {
    setSelectedId(results[0].position.id);
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
          <p className="text-stone-500">正在智能匹配中...</p>
        </div>
      </div>
    );
  }

  // 错误状态 - 需要完善画像
  if (isError) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-stone-200/50 shadow-card p-8">
          <UserCircle className="w-16 h-16 text-amber-400 mb-4" />
          <h2 className="text-xl font-semibold text-stone-800 mb-2">请先完善您的画像</h2>
          <p className="text-stone-500 text-center mb-6 max-w-md">
            为了进行智能职位匹配，我们需要了解您的学历、专业、政治面貌等基本信息
          </p>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
          >
            <UserCircle className="w-5 h-5" />
            完善个人画像
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500" />
            智能匹配
          </h1>
          <p className="text-stone-500 mt-1">根据您的条件智能匹配最适合的职位</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <UserCircle className="w-4 h-4" />
            {userProfile?.completeness || 0}% 完整
          </Link>
          <Link
            href="/preferences"
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            筛选条件
          </Link>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 transition-all shadow-amber-md hover:shadow-amber-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "匹配中..." : "重新匹配"}
          </button>
        </div>
      </div>

      {/* User Profile Summary */}
      {userProfile && !userProfile.is_complete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-amber-800 font-medium">画像完整度：{userProfile.completeness}%</p>
            <p className="text-amber-600 text-sm">完善个人信息可获得更精准的匹配结果</p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            去完善
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">符合条件</p>
              <p className="text-2xl font-display font-bold text-stone-800">{stats?.eligible_positions || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">高度匹配</p>
              <p className="text-2xl font-display font-bold text-emerald-600">{stats?.high_match_count || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">中度匹配</p>
              <p className="text-2xl font-display font-bold text-amber-600">{stats?.medium_match_count || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
              <Zap className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">平均匹配度</p>
              <p className="text-2xl font-display font-bold text-violet-600">{Math.round(stats?.average_score || 0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2 space-y-4">
          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-8 text-center">
              <Target className="w-16 h-16 mx-auto text-stone-200 mb-4" />
              <h3 className="text-lg font-medium text-stone-600 mb-2">暂无匹配结果</h3>
              <p className="text-stone-400">请尝试调整筛选条件或完善个人画像</p>
            </div>
          ) : (
            results.map((result, index) => {
              const color = getMatchScoreColor(result.match_score);
              const isSelected = selectedId === result.position.id;

              return (
                <div
                  key={result.position.id}
                  onClick={() => setSelectedId(result.position.id)}
                  className={`bg-white rounded-2xl border shadow-card cursor-pointer transition-all duration-300 overflow-hidden animate-fade-in ${
                    isSelected
                      ? "border-amber-300 ring-2 ring-amber-500/20"
                      : "border-stone-200/50 hover:shadow-card-hover hover:-translate-y-0.5"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Score Bar */}
                  <div
                    className={`h-1 bg-gradient-to-r ${
                      color === "emerald"
                        ? "from-emerald-500 to-emerald-600"
                        : color === "amber"
                          ? "from-amber-500 to-amber-600"
                          : color === "orange"
                            ? "from-orange-500 to-orange-600"
                            : "from-stone-400 to-stone-500"
                    }`}
                  />

                  <div className="p-5 lg:p-6">
                    <div className="flex items-start gap-4">
                      {/* Score Ring */}
                      <ScoreRing score={result.match_score} size={72} strokeWidth={6} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-semibold text-stone-800 truncate">
                            {result.position.position_name}
                          </h3>
                          {result.position.exam_type && (
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                                result.position.exam_type === "国考"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {result.position.exam_type}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                              color === "emerald"
                                ? "bg-emerald-100 text-emerald-700"
                                : color === "amber"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {result.match_level}
                          </span>
                          {!result.is_eligible && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-red-100 text-red-700">
                              条件不符
                            </span>
                          )}
                        </div>
                        <p className="flex items-center gap-1.5 text-stone-600 mb-2">
                          <Building2 className="w-4 h-4 text-stone-400" />
                          <span className="truncate">{result.position.department_name}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-sm text-stone-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {result.position.province} {result.position.city}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        className={`w-5 h-5 flex-shrink-0 transition-colors ${
                          isSelected ? "text-amber-500" : "text-stone-300"
                        }`}
                      />
                    </div>

                    {/* Score Details */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-stone-100 text-sm">
                      <span className="text-stone-500">
                        硬性条件:{" "}
                        <span className="font-medium text-stone-700">{result.hard_score}%</span>
                      </span>
                      <span className="text-stone-500">
                        软性条件:{" "}
                        <span className="font-medium text-stone-700">{result.soft_score}%</span>
                      </span>
                      <Link
                        href={`/positions/${result.position.id}`}
                        className="ml-auto text-amber-600 hover:text-amber-700 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        查看详情 →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              匹配详情
            </h3>

            {selectedResult ? (
              <div className="space-y-6">
                {/* Score Display */}
                <div className="text-center py-6 border-b border-stone-100">
                  <ScoreRing score={selectedResult.match_score} size={100} strokeWidth={10} />
                  <p className="text-stone-600 mt-3 font-medium">{selectedResult.position.position_name}</p>
                  <p className="text-sm text-stone-500">{selectedResult.position.department_name}</p>
                  <div className="flex justify-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < selectedResult.star_level ? "text-amber-400" : "text-stone-200"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Match Details */}
                <div className="space-y-3">
                  {selectedResult.match_details.map((detail, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        detail.is_match
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-red-50/50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-stone-700">{detail.condition}</p>
                            {detail.is_hard_match && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 rounded">硬性</span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-1">
                            要求: {detail.required}
                          </p>
                          <p className="text-xs text-stone-500">您: {detail.user_value}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${detail.is_match ? "bg-emerald-500" : "bg-red-400"}`}
                                style={{ width: `${(detail.score / detail.max_score) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-stone-500">{detail.score}/{detail.max_score}</span>
                          </div>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            detail.is_match ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        >
                          {detail.is_match ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <X className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                {selectedResult.suggestions && selectedResult.suggestions.length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-2">改进建议</p>
                    <ul className="space-y-1">
                      {selectedResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Unmatch Reasons */}
                {selectedResult.unmatch_reasons && selectedResult.unmatch_reasons.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <p className="text-sm font-medium text-red-800 mb-2">不符合原因</p>
                    <ul className="space-y-1">
                      {selectedResult.unmatch_reasons.map((reason, index) => (
                        <li key={index} className="text-xs text-red-700 flex items-start gap-2">
                          <X className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <Link
                    href={`/positions/${selectedResult.position.id}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
                  >
                    查看职位详情
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button className="flex items-center justify-center gap-2 w-full py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors">
                    添加到收藏
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-stone-500">
                <Target className="w-16 h-16 mx-auto text-stone-200 mb-4" />
                <p>点击左侧职位查看匹配详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
