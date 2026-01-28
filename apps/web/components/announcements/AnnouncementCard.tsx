"use client";

import Link from "next/link";
import {
  Clock,
  MapPin,
  Briefcase,
  Users,
  Star,
  Flame,
  Calendar,
  ExternalLink,
  Eye,
  Building2,
} from "lucide-react";
import type { AnnouncementBrief } from "@/services/api/announcement";

interface AnnouncementCardProps {
  announcement: AnnouncementBrief;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: number) => void;
  variant?: "default" | "compact";
}

export function AnnouncementCard({
  announcement,
  isFavorite = false,
  onFavoriteToggle,
  variant = "default",
}: AnnouncementCardProps) {
  const now = new Date();
  const regStart = announcement.registration_start ? new Date(announcement.registration_start) : null;
  const regEnd = announcement.registration_end ? new Date(announcement.registration_end) : null;
  
  // 计算报名状态
  let regStatus: "registering" | "upcoming" | "ended" | null = null;
  let daysLeft: number | null = null;
  
  if (regStart && regEnd) {
    if (now < regStart) {
      regStatus = "upcoming";
      daysLeft = Math.ceil((regStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else if (now > regEnd) {
      regStatus = "ended";
    } else {
      regStatus = "registering";
      daysLeft = Math.ceil((regEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }
  
  // 是否是热门（根据职位数量或招录人数判断）
  const isHot = (announcement.position_count || 0) > 100 || (announcement.recruit_count || 0) > 1000;

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + "万";
    if (num >= 1000) return (num / 1000).toFixed(1) + "千";
    return num.toString();
  };

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 考试类型颜色
  const examTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      "公务员": "bg-blue-100 text-blue-700",
      "国考": "bg-blue-100 text-blue-700",
      "省考": "bg-emerald-100 text-emerald-700",
      "事业单位": "bg-violet-100 text-violet-700",
      "教师招聘": "bg-orange-100 text-orange-700",
      "医疗卫生": "bg-cyan-100 text-cyan-700",
      "选调生": "bg-amber-100 text-amber-700",
      "军队文职": "bg-stone-200 text-stone-700",
      "三支一扶": "bg-rose-100 text-rose-700",
    };
    return colors[type || ""] || "bg-stone-100 text-stone-700";
  };

  // 报名状态样式
  const regStatusStyle = {
    registering: "bg-emerald-500 text-white",
    upcoming: "bg-amber-500 text-white",
    ended: "bg-stone-300 text-stone-600",
  };

  if (variant === "compact") {
    return (
      <Link
        href={`/announcements/${announcement.id}`}
        className="block p-4 bg-white rounded-xl border border-stone-200/50 hover:border-amber-300 hover:shadow-warm-md transition-all group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isHot && <Flame className="w-4 h-4 text-red-500 flex-shrink-0" />}
              {announcement.exam_type && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${examTypeColor(announcement.exam_type)}`}>
                  {announcement.exam_type}
                </span>
              )}
            </div>
            <h3 className="font-medium text-stone-800 group-hover:text-amber-700 line-clamp-2 transition-colors">
              {announcement.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
              {announcement.province && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {announcement.province}
                </span>
              )}
              {announcement.publish_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(announcement.publish_date)}
                </span>
              )}
            </div>
          </div>
          {regStatus === "registering" && (
            <span className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-emerald-500 text-white rounded">
              报名中
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-warm-lg transition-all overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isHot && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded">
                <Flame className="w-3 h-3" />
                热门
              </span>
            )}
            {announcement.exam_type && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${examTypeColor(announcement.exam_type)}`}>
                {announcement.exam_type}
              </span>
            )}
            {regStatus && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${regStatusStyle[regStatus]}`}>
                {regStatus === "registering" && `报名中${daysLeft !== null ? ` · 剩${daysLeft}天` : ""}`}
                {regStatus === "upcoming" && `${daysLeft}天后开始`}
                {regStatus === "ended" && "已结束"}
              </span>
            )}
          </div>
          {onFavoriteToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavoriteToggle(announcement.id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? "text-amber-500"
                  : "text-stone-300 hover:text-amber-400"
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        {/* Title */}
        <Link
          href={`/announcements/${announcement.id}`}
          className="block mt-3"
        >
          <h3 className="text-lg font-semibold text-stone-800 hover:text-amber-700 line-clamp-2 transition-colors leading-snug">
            {announcement.title}
          </h3>
        </Link>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mt-3 text-sm text-stone-500">
          {announcement.source && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {announcement.source}
            </span>
          )}
          {announcement.province && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {announcement.province}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-stone-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-stone-500 text-xs mb-1">
            <Briefcase className="w-3 h-3" />
            职位数
          </div>
          <div className="text-lg font-bold text-stone-800">
            {announcement.position_count || 0}
          </div>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-amber-600 text-xs mb-1">
            <Users className="w-3 h-3" />
            招录人数
          </div>
          <div className="text-lg font-bold text-amber-600">
            {formatNumber(announcement.recruit_count || 0)}
          </div>
        </div>
        <div className="text-center p-3 bg-stone-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-stone-500 text-xs mb-1">
            <Eye className="w-3 h-3" />
            浏览量
          </div>
          <div className="text-lg font-bold text-stone-800">
            {formatNumber(announcement.views || 0)}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {(announcement.registration_start || announcement.registration_end) && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-sm">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-blue-700">
              报名时间：{formatDate(announcement.registration_start)} - {formatDate(announcement.registration_end)}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs text-stone-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          发布于 {formatDate(announcement.publish_date || announcement.created_at)}
        </span>
        <div className="flex items-center gap-2">
          {announcement.source_url && (
            <a
              href={announcement.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-500 hover:text-amber-600 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              原文
            </a>
          )}
          <Link
            href={`/announcements/${announcement.id}`}
            className="text-xs font-medium text-amber-600 hover:text-amber-700"
          >
            查看详情 →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementCard;
