"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Check, X, Eye } from "lucide-react";

interface Position {
  id: number;
  name: string;
  department: string;
  location: string;
  exam_type: string;
  created_at: string;
}

const mockPendingPositions: Position[] = [
  {
    id: 4,
    name: "行政管理岗",
    department: "中央办公厅",
    location: "北京",
    exam_type: "国考",
    created_at: "2024-12-18",
  },
  {
    id: 5,
    name: "综合文秘",
    department: "国务院办公厅",
    location: "北京",
    exam_type: "国考",
    created_at: "2024-12-19",
  },
  {
    id: 6,
    name: "财务管理",
    department: "财政部",
    location: "北京",
    exam_type: "国考",
    created_at: "2024-12-20",
  },
];

export default function PendingPositionsPage() {
  const [positions] = useState<Position[]>(mockPendingPositions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">待审核职位</h1>
        <Link href="/positions" className="text-primary hover:underline">
          返回职位管理
        </Link>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索待审核职位..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
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
                提交时间
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
                <td className="px-6 py-4 text-gray-600">{position.created_at}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/positions/${position.id}`}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Link>
                    <button className="p-1 hover:bg-green-50 rounded" title="通过">
                      <Check className="w-4 h-4 text-green-500" />
                    </button>
                    <button className="p-1 hover:bg-red-50 rounded" title="拒绝">
                      <X className="w-4 h-4 text-red-500" />
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
