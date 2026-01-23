"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Eye, Edit, Trash2 } from "lucide-react";

interface User {
  id: number;
  nickname: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    nickname: "考公人",
    phone: "138****1234",
    email: "user1@example.com",
    status: "active",
    created_at: "2024-10-15",
  },
  {
    id: 2,
    nickname: "小明",
    phone: "139****5678",
    email: "user2@example.com",
    status: "active",
    created_at: "2024-10-20",
  },
  {
    id: 3,
    nickname: "张三",
    phone: "137****9012",
    email: "user3@example.com",
    status: "inactive",
    created_at: "2024-10-25",
  },
];

export default function AdminUsersPage() {
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索用户..."
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
                用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                手机号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                邮箱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                注册时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{user.nickname}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.status === "active" ? "正常" : "禁用"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.created_at}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link href={`/users/${user.id}`} className="p-1 hover:bg-gray-100 rounded">
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
