"use client";

import Link from "next/link";
import { MapPin, Users, Building2, Heart, GraduationCap } from "lucide-react";

interface PositionCardProps {
  id: number;
  positionName: string;
  departmentName: string;
  workLocation: string;
  recruitCount: number;
  educationRequirement: string;
  examType?: string;
  competitionRatio?: string;
  matchScore?: number;
  isFavorited?: boolean;
  onFavoriteClick?: (id: number) => void;
  className?: string;
}

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

export function PositionCard({
  id,
  positionName,
  departmentName,
  workLocation,
  recruitCount,
  educationRequirement,
  examType,
  competitionRatio,
  matchScore,
  isFavorited = false,
  onFavoriteClick,
  className = "",
}: PositionCardProps) {
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
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/positions/${id}`}
                className="text-lg font-semibold text-stone-800 hover:text-amber-600 transition-colors truncate"
              >
                {positionName}
              </Link>
              {examType && (
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-md flex-shrink-0 ${
                    examType === "国考"
                      ? "bg-blue-100 text-blue-700"
                      : examType === "省考"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-violet-100 text-violet-700"
                  }`}
                >
                  {examType}
                </span>
              )}
            </div>

            {/* Department */}
            <p className="flex items-center gap-1.5 text-stone-600 mb-3">
              <Building2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <span className="truncate">{departmentName}</span>
            </p>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                <MapPin className="w-3.5 h-3.5" />
                {workLocation}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                <GraduationCap className="w-3.5 h-3.5" />
                {educationRequirement}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-600">
                <Users className="w-3.5 h-3.5" />招{recruitCount}人
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col items-end gap-3">
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
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </button>
            )}

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
          <div className="flex items-center gap-4 text-sm text-stone-500">
            {competitionRatio && (
              <span>
                竞争比: <span className="font-medium text-amber-600">{competitionRatio}</span>
              </span>
            )}
          </div>
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
