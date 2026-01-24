"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Share2,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  MapPin,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  FileText,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

// Mock position data
const mockPosition = {
  id: 1,
  name: "科员（一）",
  department: "国家税务总局北京市税务局",
  location: "北京市朝阳区",
  examType: "国考",
  recruitCount: 3,
  registeredCount: 360,
  competitionRatio: "120:1",
  matchScore: 85,
  education: "本科及以上",
  major: "会计学、财务管理",
  age: "18-35周岁",
  politicalStatus: "中共党员",
  workExperience: "不限",
  description: "负责税务征收管理、纳税服务等工作。",
  requirements: [
    { name: "学历要求", value: "本科及以上", matched: true },
    { name: "专业要求", value: "会计学、财务管理", matched: true },
    { name: "政治面貌", value: "中共党员", matched: false },
    { name: "年龄要求", value: "18-35周岁", matched: true },
    { name: "工作经验", value: "不限", matched: true },
  ],
  timeline: [
    { date: "2024-10-15 ~ 2024-10-24", title: "报名时间", status: "completed" },
    { date: "2024-11-26", title: "笔试时间", status: "active" },
    { date: "待定", title: "成绩查询", status: "pending" },
    { date: "待定", title: "面试时间", status: "pending" },
  ],
  announcements: [
    { id: 1, title: "2024年国家公务员考试公告", date: "2024-10-15" },
    { id: 2, title: "2024年国考报名统计（截至10月20日）", date: "2024-10-20" },
    { id: 3, title: "2024年国考笔试公告", date: "2024-11-10" },
  ],
};

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

export default function PositionDetailPage() {
  const params = useParams();
  const [isFavorited, setIsFavorited] = useState(false);
  const position = mockPosition;

  const matchedCount = position.requirements.filter((r) => r.matched).length;
  const totalCount = position.requirements.length;

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Back Button */}
      <Link
        href="/positions"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回列表</span>
      </Link>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Position Header */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
            {/* Match Score Bar */}
            <div
              className={`h-1.5 bg-gradient-to-r ${getScoreColor(position.matchScore)}`}
            />

            <div className="p-6 lg:p-8">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800">
                      {position.name}
                    </h1>
                    <span className="px-3 py-1 text-sm font-medium rounded-lg bg-blue-100 text-blue-700">
                      {position.examType}
                    </span>
                  </div>
                  <p className="flex items-center gap-2 text-lg text-stone-600">
                    <Building2 className="w-5 h-5 text-stone-400" />
                    {position.department}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`p-3 rounded-xl border transition-colors ${
                      isFavorited
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "border-stone-200 text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
                    />
                  </button>
                  <button className="p-3 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Match Score Card */}
              <div
                className={`p-5 rounded-2xl bg-gradient-to-br ${
                  position.matchScore >= 70
                    ? "from-emerald-50 to-emerald-100/50 border border-emerald-200"
                    : position.matchScore >= 50
                    ? "from-amber-50 to-amber-100/50 border border-amber-200"
                    : "from-stone-50 to-stone-100/50 border border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Score Circle */}
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-stone-200"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="url(#scoreGradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(position.matchScore / 100) * 226} 226`}
                        />
                        <defs>
                          <linearGradient
                            id="scoreGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop
                              offset="0%"
                              stopColor={
                                position.matchScore >= 70 ? "#10b981" : "#f59e0b"
                              }
                            />
                            <stop
                              offset="100%"
                              stopColor={
                                position.matchScore >= 70 ? "#059669" : "#d97706"
                              }
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-2xl font-display font-bold ${
                            position.matchScore >= 70
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {position.matchScore}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p
                        className={`font-semibold text-lg ${
                          position.matchScore >= 70
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {getScoreLabel(position.matchScore)}
                      </p>
                      <p
                        className={`text-sm ${
                          position.matchScore >= 70
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        符合 {matchedCount}/{totalCount} 项报考条件
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/match"
                    className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                      position.matchScore >= 70
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                  >
                    查看详细分析
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              基本信息
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-stone-500 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  招录人数
                </p>
                <p className="text-xl font-semibold text-stone-800">
                  {position.recruitCount}人
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-stone-500 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  报名人数
                </p>
                <p className="text-xl font-semibold text-stone-800">
                  {position.registeredCount}人
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-stone-500 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  竞争比
                </p>
                <p className="text-xl font-semibold text-amber-600">
                  {position.competitionRatio}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-stone-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  工作地点
                </p>
                <p className="text-xl font-semibold text-stone-800">
                  {position.location}
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-500" />
              报考条件
            </h2>
            <div className="space-y-4">
              {position.requirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    req.matched
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div>
                    <p className="text-sm text-stone-500">{req.name}</p>
                    <p className="font-medium text-stone-800">{req.value}</p>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      req.matched ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  >
                    {req.matched ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <X className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Warning (if not matched) */}
          {!position.requirements.find((r) => r.name === "政治面貌")?.matched && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">注意事项</p>
                  <p className="text-sm text-amber-700 mt-1">
                    该职位要求中共党员身份，请确认您符合此条件后再报考。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              考试日程
            </h3>
            <div className="space-y-0">
              {position.timeline.map((item, index) => (
                <div
                  key={index}
                  className={`timeline-item ${item.status}`}
                >
                  <div>
                    <p className="font-medium text-stone-800">{item.title}</p>
                    <p className="text-sm text-stone-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Announcements */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              关联公告
            </h3>
            <div className="space-y-3">
              {position.announcements.map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/announcements/${announcement.id}`}
                  className="block p-4 rounded-xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors group"
                >
                  <p className="text-sm font-medium text-stone-800 group-hover:text-amber-700 line-clamp-2 transition-colors">
                    {announcement.title}
                  </p>
                  <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {announcement.date}
                  </p>
                </Link>
              ))}
            </div>
            <Link
              href="/announcements"
              className="flex items-center justify-center gap-1 mt-4 py-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              查看更多公告
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Apply Button (Mobile Fixed) */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-lg border-t border-stone-200">
            <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md">
              立即报名
            </button>
          </div>

          {/* Desktop Apply Button */}
          <button className="hidden lg:block w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md hover:shadow-amber-lg btn-shine">
            立即报名
          </button>
        </div>
      </div>
    </div>
  );
}
