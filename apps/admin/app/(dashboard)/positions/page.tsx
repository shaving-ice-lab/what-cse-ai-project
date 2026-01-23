"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Eye, Edit, Trash2 } from "lucide-react";

interface Position {
  id: number;
  name: string;
  department: string;
  location: string;
  exam_type: string;
  status: string;
  created_at: string;
}

const mockPositions: Position[] = [
  {
    id: 1,
    name: "科员（一）",
    department: "国家税务总局北京市税务局",
    location: "北京",
    exam_type: "国考",
    status: "published",
    created_at: "2024-10-15",
  },
  {
    id: 2,
    name: "综合管理岗",
    department: "海关总署广州海关",
    location: "广州",
    exam_type: "国考",
    status: "published",
    created_at: "2024-10-18",
  },
  {
    id: 3,
    name: "信息技术岗",
    department: "财政部驻北京专员办",
    location: "北京",
    exam_type: "国考",
    status: "pending",
    created_at: "2024-10-20",
  },
];

export default function AdminPositionsPage() {
  const [positions] = useState<Position[]>(mockPositions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">职位管理</h1>
        <div className="flex space-x-3">
          <Link href="/positions/pending" className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            待审核职位
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索职位..."
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
                职位名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                部门
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                地点
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {positions.map((position) => (
              <tr key={position.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{position.name}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{position.department}</td>
                <td className="px-6 py-4 text-gray-600">{position.location}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    {position.exam_type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      position.status === "published"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {position.status === "published" ? "已发布" : "待审核"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/positions/${position.id}`}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Link>
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
