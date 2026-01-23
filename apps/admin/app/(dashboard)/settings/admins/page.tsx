"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, Shield } from "lucide-react";

interface Admin {
  id: number;
  username: string;
  role: string;
  status: string;
  last_login: string;
  created_at: string;
}

const mockAdmins: Admin[] = [
  {
    id: 1,
    username: "admin",
    role: "super_admin",
    status: "active",
    last_login: "2024-12-20 10:30",
    created_at: "2024-01-01",
  },
  {
    id: 2,
    username: "editor",
    role: "editor",
    status: "active",
    last_login: "2024-12-19 15:20",
    created_at: "2024-03-15",
  },
  {
    id: 3,
    username: "viewer",
    role: "viewer",
    status: "inactive",
    last_login: "2024-11-01 09:00",
    created_at: "2024-06-20",
  },
];

const roleLabels: Record<string, string> = {
  super_admin: "超级管理员",
  admin: "管理员",
  editor: "编辑",
  viewer: "查看者",
};

export default function AdminsPage() {
  const [admins] = useState<Admin[]>(mockAdmins);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">管理员管理</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          <span>添加管理员</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索管理员..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                用户名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                最后登录
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
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-gray-800">{admin.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      admin.role === "super_admin"
                        ? "bg-purple-100 text-purple-600"
                        : admin.role === "admin"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {roleLabels[admin.role] || admin.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      admin.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {admin.status === "active" ? "正常" : "禁用"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{admin.last_login}</td>
                <td className="px-6 py-4 text-gray-600">{admin.created_at}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    {admin.role !== "super_admin" && (
                      <button className="p-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
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
