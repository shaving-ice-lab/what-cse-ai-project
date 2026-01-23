"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, ExternalLink, CheckCircle, XCircle } from "lucide-react";

interface ListPage {
  id: number;
  name: string;
  url: string;
  type: string;
  status: "active" | "inactive" | "error";
  last_crawl: string;
  items_found: number;
}

const mockListPages: ListPage[] = [
  {
    id: 1,
    name: "国家公务员局-职位表",
    url: "http://bm.scs.gov.cn/pp/gkweb/core/web/ui/business/article/articlelist.html",
    type: "职位",
    status: "active",
    last_crawl: "2024-12-20 10:00",
    items_found: 3245,
  },
  {
    id: 2,
    name: "北京人社局-招考公告",
    url: "http://rsj.beijing.gov.cn/xxgk/tzgg/",
    type: "公告",
    status: "active",
    last_crawl: "2024-12-20 08:00",
    items_found: 56,
  },
  {
    id: 3,
    name: "浙江人事考试网",
    url: "https://www.zjks.gov.cn/",
    type: "综合",
    status: "error",
    last_crawl: "2024-12-19 12:00",
    items_found: 0,
  },
];

export default function ListPagesPage() {
  const [listPages] = useState<ListPage[]>(mockListPages);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">列表页管理</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          <span>添加列表页</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索列表页..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                上次采集
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                采集数量
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {listPages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(page.status)}
                    <span className="font-medium text-gray-800">{page.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:underline max-w-xs truncate"
                  >
                    <span className="truncate">{page.url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    {page.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      page.status === "active"
                        ? "bg-green-100 text-green-600"
                        : page.status === "error"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {page.status === "active" ? "正常" : page.status === "error" ? "异常" : "禁用"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{page.last_crawl}</td>
                <td className="px-6 py-4 text-gray-600">{page.items_found.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
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
