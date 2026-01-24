"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  MapPin,
  ChevronRight,
  Search,
  Star,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  type: string;
  source: string;
  publish_date: string;
  region: string;
  exam_type: string;
  is_hot: boolean;
  summary?: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "2024年度中央机关及其直属机构考试录用公务员公告",
    type: "招考公告",
    source: "国家公务员局",
    publish_date: "2024-10-15",
    region: "全国",
    exam_type: "国考",
    is_hot: true,
    summary: "本次招录共计划招录39561人，比去年增加6.7%，共有311家单位参加招录。",
  },
  {
    id: 2,
    title: "2024年北京市公务员考试报名入口已开放",
    type: "报名通知",
    source: "北京市人社局",
    publish_date: "2024-11-01",
    region: "北京",
    exam_type: "省考",
    is_hot: true,
    summary: "北京市2024年公务员考试报名时间为11月1日至11月7日。",
  },
  {
    id: 3,
    title: "关于2024年度公务员考试时间安排的公告",
    type: "时间公告",
    source: "人力资源社会保障部",
    publish_date: "2024-10-20",
    region: "全国",
    exam_type: "国考",
    is_hot: false,
  },
  {
    id: 4,
    title: "广东省2024年考试录用公务员公告",
    type: "招考公告",
    source: "广东省人社厅",
    publish_date: "2024-11-10",
    region: "广东",
    exam_type: "省考",
    is_hot: true,
  },
  {
    id: 5,
    title: "2024年国考笔试注意事项及考场规则",
    type: "考试指南",
    source: "国家公务员局",
    publish_date: "2024-11-15",
    region: "全国",
    exam_type: "国考",
    is_hot: false,
  },
  {
    id: 6,
    title: "上海市2024年事业单位公开招聘公告",
    type: "招考公告",
    source: "上海市人社局",
    publish_date: "2024-11-08",
    region: "上海",
    exam_type: "事业单位",
    is_hot: false,
  },
];

const typeConfig: Record<string, { color: string; bg: string }> = {
  招考公告: { color: "text-blue-700", bg: "bg-blue-100" },
  报名通知: { color: "text-emerald-700", bg: "bg-emerald-100" },
  时间公告: { color: "text-amber-700", bg: "bg-amber-100" },
  考试指南: { color: "text-violet-700", bg: "bg-violet-100" },
  政策解读: { color: "text-rose-700", bg: "bg-rose-100" },
};

const types = ["全部", "招考公告", "报名通知", "时间公告", "考试指南", "政策解读"];
const examTypes = ["全部", "国考", "省考", "事业单位"];

export default function AnnouncementListPage() {
  const [announcements] = useState<Announcement[]>(mockAnnouncements);
  const [selectedType, setSelectedType] = useState<string>("全部");
  const [selectedExamType, setSelectedExamType] = useState<string>("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnnouncements = announcements.filter((a) => {
    if (selectedType !== "全部" && a.type !== selectedType) return false;
    if (selectedExamType !== "全部" && a.exam_type !== selectedExamType) return false;
    if (searchQuery && !a.title.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-amber-500" />
          公告中心
        </h1>
        <p className="text-stone-500 mt-1">最新公务员考试公告与政策解读</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索公告标题..."
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? "bg-amber-500 text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Exam Type Filter */}
        <div className="flex flex-wrap gap-2">
          {examTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedExamType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedExamType === type
                  ? "bg-stone-800 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Announcement List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement, index) => {
          const config = typeConfig[announcement.type] || {
            color: "text-stone-700",
            bg: "bg-stone-100",
          };

          return (
            <Link
              key={announcement.id}
              href={`/announcements/${announcement.id}`}
              className="group block bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-5 lg:p-6">
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl border border-stone-200 flex-shrink-0">
                    <span className="text-xs text-stone-500">
                      {announcement.publish_date.split("-")[1]}月
                    </span>
                    <span className="text-xl font-bold text-stone-800">
                      {announcement.publish_date.split("-")[2]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-md ${config.bg} ${config.color}`}
                      >
                        {announcement.type}
                      </span>
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-stone-100 text-stone-600">
                        {announcement.exam_type}
                      </span>
                      {announcement.is_hot && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md bg-red-100 text-red-600">
                          <Star className="w-3 h-3" />
                          热门
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-stone-800 group-hover:text-amber-600 transition-colors line-clamp-2 mb-2">
                      {announcement.title}
                    </h3>

                    {/* Summary */}
                    {announcement.summary && (
                      <p className="text-sm text-stone-500 line-clamp-2 mb-3">
                        {announcement.summary}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                      <span className="flex items-center gap-1">
                        <Bell className="w-3.5 h-3.5" />
                        {announcement.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {announcement.region}
                      </span>
                      <span className="flex items-center gap-1 sm:hidden">
                        <Clock className="w-3.5 h-3.5" />
                        {announcement.publish_date}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto text-stone-200 mb-4" />
          <p className="text-stone-500 mb-2">暂无相关公告</p>
          <button
            onClick={() => {
              setSelectedType("全部");
              setSelectedExamType("全部");
              setSearchQuery("");
            }}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            清除筛选条件
          </button>
        </div>
      )}
    </div>
  );
}
