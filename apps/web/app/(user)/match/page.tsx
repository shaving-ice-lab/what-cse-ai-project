"use client";

import { useState } from "react";
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
} from "lucide-react";

interface MatchResult {
  id: number;
  position_name: string;
  department_name: string;
  work_location: string;
  exam_type: string;
  total_score: number;
  hard_score: number;
  soft_score: number;
  match_details: {
    name: string;
    is_match: boolean;
    user_value: string;
    position_value: string;
  }[];
}

const mockResults: MatchResult[] = [
  {
    id: 1,
    position_name: "综合管理岗",
    department_name: "国家税务总局北京市税务局",
    work_location: "北京市",
    exam_type: "国考",
    total_score: 95,
    hard_score: 100,
    soft_score: 90,
    match_details: [
      { name: "学历", is_match: true, user_value: "本科", position_value: "本科及以上" },
      {
        name: "专业",
        is_match: true,
        user_value: "计算机科学与技术",
        position_value: "计算机类",
      },
      { name: "政治面貌", is_match: true, user_value: "中共党员", position_value: "中共党员" },
      { name: "工作经验", is_match: true, user_value: "2年", position_value: "不限" },
    ],
  },
  {
    id: 2,
    position_name: "信息技术岗",
    department_name: "海关总署广州海关",
    work_location: "广州市",
    exam_type: "国考",
    total_score: 88,
    hard_score: 100,
    soft_score: 76,
    match_details: [
      { name: "学历", is_match: true, user_value: "本科", position_value: "本科及以上" },
      {
        name: "专业",
        is_match: true,
        user_value: "计算机科学与技术",
        position_value: "计算机类",
      },
      {
        name: "工作经验",
        is_match: false,
        user_value: "2年",
        position_value: "3年以上基层工作经验",
      },
      { name: "政治面貌", is_match: true, user_value: "中共党员", position_value: "不限" },
    ],
  },
  {
    id: 3,
    position_name: "财务管理岗",
    department_name: "财政部驻北京专员办",
    work_location: "北京市",
    exam_type: "国考",
    total_score: 72,
    hard_score: 80,
    soft_score: 64,
    match_details: [
      { name: "学历", is_match: true, user_value: "本科", position_value: "本科及以上" },
      {
        name: "专业",
        is_match: false,
        user_value: "计算机科学与技术",
        position_value: "财务会计类",
      },
      { name: "政治面貌", is_match: true, user_value: "中共党员", position_value: "不限" },
      { name: "工作经验", is_match: true, user_value: "2年", position_value: "不限" },
    ],
  },
  {
    id: 4,
    position_name: "网络安全岗",
    department_name: "公安部网络安全保卫局",
    work_location: "北京市",
    exam_type: "国考",
    total_score: 92,
    hard_score: 100,
    soft_score: 84,
    match_details: [
      { name: "学历", is_match: true, user_value: "本科", position_value: "本科及以上" },
      {
        name: "专业",
        is_match: true,
        user_value: "计算机科学与技术",
        position_value: "计算机类、网络安全",
      },
      { name: "政治面貌", is_match: true, user_value: "中共党员", position_value: "中共党员" },
      { name: "工作经验", is_match: true, user_value: "2年", position_value: "2年以上" },
    ],
  },
];

function getScoreColor(score: number) {
  if (score >= 90) return "emerald";
  if (score >= 70) return "amber";
  if (score >= 50) return "orange";
  return "stone";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "完美匹配";
  if (score >= 70) return "高度匹配";
  if (score >= 50) return "部分匹配";
  return "匹配度低";
}

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
  const color = getScoreColor(score);

  const colorMap = {
    emerald: { stroke: "#10b981", bg: "#d1fae5" },
    amber: { stroke: "#f59e0b", bg: "#fef3c7" },
    orange: { stroke: "#f97316", bg: "#ffedd5" },
    stone: { stroke: "#78716c", bg: "#e7e5e4" },
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[color].bg}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[color].stroke}
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
          className={`text-xl font-display font-bold text-${color}-600`}
          style={{ color: colorMap[color].stroke }}
        >
          {score}%
        </span>
      </div>
    </div>
  );
}

export default function MatchPage() {
  const [results] = useState<MatchResult[]>(mockResults);
  const [selectedId, setSelectedId] = useState<number | null>(mockResults[0]?.id || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedResult = results.find((r) => r.id === selectedId);

  const stats = {
    total: results.length,
    perfect: results.filter((r) => r.total_score >= 90).length,
    high: results.filter((r) => r.total_score >= 70 && r.total_score < 90).length,
    average: Math.round(results.reduce((acc, r) => acc + r.total_score, 0) / results.length),
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

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
            href="/preferences"
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            筛选条件
          </Link>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 transition-all shadow-amber-md hover:shadow-amber-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "匹配中..." : "重新匹配"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">匹配职位</p>
              <p className="text-2xl font-display font-bold text-stone-800">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">完美匹配</p>
              <p className="text-2xl font-display font-bold text-emerald-600">
                {stats.perfect}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">高度匹配</p>
              <p className="text-2xl font-display font-bold text-amber-600">
                {stats.high}
              </p>
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
              <p className="text-2xl font-display font-bold text-violet-600">
                {stats.average}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2 space-y-4">
          {results.map((result, index) => {
            const color = getScoreColor(result.total_score);
            const isSelected = selectedId === result.id;

            return (
              <div
                key={result.id}
                onClick={() => setSelectedId(result.id)}
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
                    <ScoreRing score={result.total_score} size={72} strokeWidth={6} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-stone-800 truncate">
                          {result.position_name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                            result.exam_type === "国考"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {result.exam_type}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                            color === "emerald"
                              ? "bg-emerald-100 text-emerald-700"
                              : color === "amber"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {getScoreLabel(result.total_score)}
                        </span>
                      </div>
                      <p className="flex items-center gap-1.5 text-stone-600 mb-2">
                        <Building2 className="w-4 h-4 text-stone-400" />
                        <span className="truncate">{result.department_name}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-stone-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {result.work_location}
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
                      <span className="font-medium text-stone-700">
                        {result.hard_score}%
                      </span>
                    </span>
                    <span className="text-stone-500">
                      软性条件:{" "}
                      <span className="font-medium text-stone-700">
                        {result.soft_score}%
                      </span>
                    </span>
                    <Link
                      href={`/positions/${result.id}`}
                      className="ml-auto text-amber-600 hover:text-amber-700 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      查看详情 →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
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
                  <ScoreRing score={selectedResult.total_score} size={100} strokeWidth={10} />
                  <p className="text-stone-600 mt-3 font-medium">
                    {selectedResult.position_name}
                  </p>
                  <p className="text-sm text-stone-500">
                    {selectedResult.department_name}
                  </p>
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
                          <p className="text-sm font-medium text-stone-700">{detail.name}</p>
                          <p className="text-xs text-stone-500 mt-1">
                            要求: {detail.position_value}
                          </p>
                          <p className="text-xs text-stone-500">您: {detail.user_value}</p>
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

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <Link
                    href={`/positions/${selectedResult.id}`}
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
