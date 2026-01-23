"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Eye, Edit, Trash2, Plus } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  type: string;
  status: string;
  publish_date: string;
  created_at: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "2025年国家公务员考试公告",
    type: "国考",
    status: "published",
    publish_date: "2024-10-15",
    created_at: "2024-10-15",
  },
  {
    id: 2,
    title: "2025年北京市公务员考试公告",
    type: "省考",
    status: "published",
    publish_date: "2024-11-01",
    created_at: "2024-11-01",
  },
  {
    id: 3,
    title: "2025年浙江省公务员考试公告",
    type: "省考",
    status: "draft",
    publish_date: "",
    created_at: "2024-11-20",
  },
];

export default function AnnouncementsPage() {
  const [announcements] = useState<Announcement[]>(mockAnnouncements);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">公告管理</h1>
        <Link
          href="/announcements/create"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          <span>发布公告</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索公告..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>筛选</span>
          </button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                标题
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                发布日期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                创建时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {announcements.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800 max-w-xs truncate">{item.title}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "published"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.status === "published" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.publish_date || "-"}</td>
                <td className="px-6 py-4 text-gray-600">{item.created_at}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/announcements/${item.id}`}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Link>
                    <Link
                      href={`/announcements/${item.id}/edit`}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </Link>
                    <button className="p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
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
