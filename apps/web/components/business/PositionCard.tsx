"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  Building2,
  Heart,
  GraduationCap,
  Scale,
  Clock,
  Flame,
  Zap,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface PositionCardProps {
  id: number;
  positionName: string;
  departmentName: string;
  departmentLevel?: string;
  workLocation?: string;
  province?: string;
  city?: string;
  recruitCount: number;
  educationRequirement?: string;
  examType?: string;
  competitionRatio?: number;
  applicantCount?: number;
  matchScore?: number;
  isFavorited?: boolean;
  isInCompare?: boolean;
  // 新增属性
  registrationEnd?: string;
  registrationStart?: string;
  isUnlimitedMajor?: boolean;
  isForFreshGraduate?: boolean;
  isHot?: boolean;
  // 事件处理
  onFavoriteClick?: (id: number) => void;
  onCompareClick?: (id: number) => void;
  className?: string;
}

// 匹配度颜色
function getScoreColor(score: number) {
  if (score >= 90) return "from-emerald-500 to-emerald-600";
  if (score >= 70) return "from-amber-500 to-amber-600";
  if (score >= 50) return "from-orange-500 to-orange-600";
  return "from-stone-400 to-stone-500";
}

// 匹配度标签
function getScoreLabel(score: number) {
  if (score >= 90) return "完美匹配";
  if (score >= 70) return "高度匹配";
  if (score >= 50) return "部分匹配";
  return "匹配较低";
}

// 竞争热度颜色和标签
function getCompetitionInfo(ratio?: number): { color: string; bgColor: string; label: string; icon: React.ReactNode } {
  if (!ratio) return { color: "text-stone-500", bgColor: "bg-stone-100", label: "暂无", icon: null };
  
  if (ratio <= 30) {
    return {
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      label: "低竞争",
      icon: <TrendingUp className="w-3 h-3" />,
    };
  }
  if (ratio <= 60) {
    return {
      color: "text-green-600",
      bgColor: "bg-green-50",
      label: "适中",
      icon: null,
    };
  }
  if (ratio <= 100) {
    return {
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      label: "较热",
      icon: <Flame className="w-3 h-3" />,
    };
  }
  if (ratio <= 200) {
    return {
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      label: "很热",
      icon: <Flame className="w-3 h-3" />,
    };
  }
  return {
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "极热",
    icon: <Flame className="w-3 h-3" />,
  };
}

// 计算倒计时
function useCountdown(endDateStr?: string) {
  return useMemo(() => {
    if (!endDateStr) return null;
    
    const now = new Date();
    const endDate = new Date(endDateStr);
    const diffTime = endDate.getTime() - now.getTime();
    
    if (diffTime < 0) {
      return { days: 0, hours: 0, isExpired: true, isUrgent: false };
    }
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return {
      days,
      hours,
      isExpired: false,
      isUrgent: days <= 3,
    };
  }, [endDateStr]);
}

export function PositionCard({
  id,
  positionName,
  departmentName,
  departmentLevel,
  workLocation,
  province,
  city,
  recruitCount,
  educationRequirement,
  examType,
  competitionRatio,
  applicantCount,
  matchScore,
  isFavorited = false,
  isInCompare = false,
  registrationEnd,
  registrationStart,
  isUnlimitedMajor = false,
  isForFreshGraduate = false,
  isHot = false,
  onFavoriteClick,
  onCompareClick,
  className = "",
}: PositionCardProps) {
  const countdown = useCountdown(registrationEnd);
  const competitionInfo = getCompetitionInfo(competitionRatio);
  
  // 构建地点显示
  const locationDisplay = workLocation || (province ? `${province}${city ? `·${city}` : ""}` : "");
  
  // 判断报名状态
  const registrationStatus = useMemo(() => {
    if (!registrationEnd && !registrationStart) return null;
    
    const now = new Date();
    const start = registrationStart ? new Date(registrationStart) : null;
    const end = registrationEnd ? new Date(registrationEnd) : null;
    
    if (start && now < start) return "upcoming"; // 即将开始
    if (end && now > end) return "ended"; // 已结束
    return "ongoing"; // 报名中
  }, [registrationStart, registrationEnd]);

  return (
    <div
      className={`group bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Match Score Bar (if score provided) */}
      {matchScore !== undefined && (
        <div className={`h-1 bg-gradient-to-r ${getScoreColor(matchScore)}`} />
      )}

      <div className="p-5 lg:p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header with Tags */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link
                href={`/positions/${id}`}
                className="text-lg font-semibold text-stone-800 hover:text-amber-600 transition-colors line-clamp-1"
              >
                {positionName}
              </Link>
              
              {/* Position Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 考试类型 */}
                {examType && (
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-md flex-shrink-0 ${
                      examType === "公务员"
                        ? "bg-blue-100 text-blue-700"
                        : examType === "事业单位"
                          ? "bg-violet-100 text-violet-700"
                          : examType === "教师招聘"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {examType}
                  </span>
                )}
                
                {/* 热门标签 */}
                {isHot && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-md">
                    <Flame className="w-3 h-3" />
                    热门
                  </span>
                )}
                
                {/* 不限专业 */}
                {isUnlimitedMajor && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                    <Zap className="w-3 h-3" />
                    不限专业
                  </span>
                )}
                
                {/* 应届可报 */}
                {isForFreshGraduate && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                    <Sparkles className="w-3 h-3" />
                    应届可报
                  </span>
                )}
              </div>
            </div>

            {/* Department */}
            <p className="flex items-center gap-1.5 text-stone-600 mb-3">
              <Building2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <span className="truncate">{departmentName}</span>
              {departmentLevel && (
                <span className="text-xs text-stone-400 flex-shrink-0">({departmentLevel})</span>
              )}
            </p>

            {/* Info Tags */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {locationDisplay && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                  <MapPin className="w-3.5 h-3.5" />
                  {locationDisplay}
                </span>
              )}
              {educationRequirement && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {educationRequirement}
                </span>
              )}
              <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                <Users className="w-3.5 h-3.5" />招{recruitCount}人
              </span>
            </div>
          </div>

          {/* Right Side - Actions & Score */}
          <div className="flex flex-col items-end gap-2">
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Compare Button */}
              {onCompareClick && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCompareClick(id);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isInCompare
                      ? "bg-emerald-50 text-emerald-600"
                      : "hover:bg-stone-100 text-stone-400"
                  }`}
                  title={isInCompare ? "已加入对比" : "加入对比"}
                >
                  <Scale className={`w-5 h-5 ${isInCompare ? "fill-emerald-100" : ""}`} />
                </button>
              )}
              
              {/* Favorite Button */}
              {onFavoriteClick && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFavoriteClick(id);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorited ? "bg-red-50 text-red-500" : "hover:bg-stone-100 text-stone-400"
                  }`}
                  title={isFavorited ? "取消收藏" : "收藏"}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
                </button>
              )}
            </div>

            {/* Match Score (if provided) */}
            {matchScore !== undefined && (
              <div className="text-right">
                <div
                  className={`text-2xl font-display font-bold bg-gradient-to-r ${getScoreColor(
                    matchScore
                  )} bg-clip-text text-transparent`}
                >
                  {matchScore}%
                </div>
                <p className="text-xs text-stone-500">{getScoreLabel(matchScore)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
          {/* Left: Competition & Registration Info */}
          <div className="flex items-center gap-4 text-sm">
            {/* Competition Ratio with Heat Indicator */}
            {competitionRatio !== undefined && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${competitionInfo.bgColor} ${competitionInfo.color}`}>
                {competitionInfo.icon}
                <span className="font-medium">{competitionRatio}:1</span>
                <span className="text-xs opacity-75">{competitionInfo.label}</span>
              </span>
            )}
            
            {/* Applicant Count */}
            {applicantCount !== undefined && applicantCount > 0 && (
              <span className="text-stone-500">
                报名 <span className="font-medium text-stone-700">{applicantCount}</span> 人
              </span>
            )}
            
            {/* Registration Countdown */}
            {countdown && !countdown.isExpired && registrationStatus === "ongoing" && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                  countdown.isUrgent
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {countdown.isUrgent ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                <span className="font-medium">
                  {countdown.days > 0 ? `${countdown.days}天` : ""}
                  {countdown.hours > 0 || countdown.days === 0 ? `${countdown.hours}小时` : ""}
                </span>
                <span className="text-xs">截止</span>
              </span>
            )}
            
            {/* Registration Status */}
            {registrationStatus === "ended" && (
              <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded">
                已截止
              </span>
            )}
            {registrationStatus === "upcoming" && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                即将开始
              </span>
            )}
          </div>

          {/* Right: View Details Link */}
          <Link
            href={`/positions/${id}`}
            className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            查看详情 →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PositionCard;
