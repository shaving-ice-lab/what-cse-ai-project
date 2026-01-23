"use client";

import Link from "next/link";
import { MapPin, Users, Bookmark, BookmarkCheck } from "lucide-react";

interface PositionCardProps {
  id: number;
  positionName: string;
  departmentName: string;
  workLocation: string;
  recruitCount: number;
  educationRequirement: string;
  matchScore?: number;
  isFavorited?: boolean;
  onFavoriteClick?: (id: number) => void;
  className?: string;
}

export function PositionCard({
  id,
  positionName,
  departmentName,
  workLocation,
  recruitCount,
  educationRequirement,
  matchScore,
  isFavorited = false,
  onFavoriteClick,
  className = "",
}: PositionCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-50";
    if (score >= 60) return "text-yellow-500 bg-yellow-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <div
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link
            href={`/positions/${id}`}
            className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors block truncate"
          >
            {positionName}
          </Link>
          <p className="text-gray-600 mt-1 truncate">{departmentName}</p>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {matchScore !== undefined && (
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(matchScore)}`}
            >
              {matchScore}分
            </span>
          )}
          {onFavoriteClick && (
            <button
              onClick={() => onFavoriteClick(id)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isFavorited ? (
                <BookmarkCheck className="w-5 h-5 text-primary" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-3 mt-3 text-sm text-gray-500">
        <span className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {workLocation}
        </span>
        <span className="flex items-center">
          <Users className="w-4 h-4 mr-1" />招{recruitCount}人
        </span>
        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
          {educationRequirement}
        </span>
      </div>
    </div>
  );
}
