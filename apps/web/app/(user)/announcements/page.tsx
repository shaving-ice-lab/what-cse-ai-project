"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Calendar, MapPin, ExternalLink, Filter } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  type: string;
  source: string;
  publish_date: string;
  region: string;
  exam_type: string;
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
  },
  {
    id: 2,
    title: "2024年北京市公务员考试报名入口已开放",
    type: "报名通知",
    source: "北京市人社局",
    publish_date: "2024-11-01",
    region: "北京",
    exam_type: "省考",
  },
  {
    id: 3,
    title: "关于2024年度公务员考试时间安排的公告",
    type: "时间公告",
    source: "人力资源社会保障部",
    publish_date: "2024-10-20",
    region: "全国",
    exam_type: "国考",
  },
  {
    id: 4,
    title: "广东省2024年考试录用公务员公告",
    type: "招考公告",
    source: "广东省人社厅",
    publish_date: "2024-11-10",
    region: "广东",
    exam_type: "省考",
  },
];

const typeColors: Record<string, string> = {
  招考公告: "bg-blue-100 text-blue-600",
  报名通知: "bg-green-100 text-green-600",
  时间公告: "bg-yellow-100 text-yellow-600",
  政策解读: "bg-purple-100 text-purple-600",
};

export default function AnnouncementListPage() {
  const [announcements] = useState<Announcement[]>(mockAnnouncements);
  const [selectedType, setSelectedType] = useState<string>("全部");

  const types = ["全部", "招考公告", "报名通知", "时间公告", "政策解读"];

  const filteredAnnouncements =
    selectedType === "全部" ? announcements : announcements.filter((a) => a.type === selectedType);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">公告中心</h1>
          <p className="text-gray-500 mt-1">最新公务员考试公告与政策解读</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          <span>筛选</span>
        </button>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedType === type
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      typeColors[announcement.type] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {announcement.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {announcement.exam_type}
                  </span>
                </div>
                <Link
                  href={`/announcements/${announcement.id}`}
                  className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors"
                >
                  {announcement.title}
                </Link>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Bell className="w-4 h-4" />
                    <span>{announcement.source}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{announcement.region}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{announcement.publish_date}</span>
                  </span>
                </div>
              </div>
              <Link
                href={`/announcements/${announcement.id}`}
                className="flex items-center text-primary text-sm hover:underline ml-4"
              >
                查看详情
                <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p>暂无相关公告</p>
        </div>
      )}
    </div>
  );
}
