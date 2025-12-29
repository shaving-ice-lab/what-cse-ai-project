import { useState } from "react";
import { Search, Plus, Edit, Trash2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface Admin {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
  status: number;
  lastLogin: string;
  createdAt: string;
}

const MOCK_ADMINS: Admin[] = [
  {
    id: 1,
    username: "admin",
    nickname: "超级管理员",
    email: "admin@example.com",
    role: "super_admin",
    status: 1,
    lastLogin: "2024-11-15 14:30",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    username: "editor1",
    nickname: "编辑小王",
    email: "editor1@example.com",
    role: "editor",
    status: 1,
    lastLogin: "2024-11-15 10:00",
    createdAt: "2024-03-15",
  },
  {
    id: 3,
    username: "manager",
    nickname: "数据管理员",
    email: "manager@example.com",
    role: "admin",
    status: 1,
    lastLogin: "2024-11-14 18:00",
    createdAt: "2024-05-20",
  },
  {
    id: 4,
    username: "editor2",
    nickname: "编辑小李",
    email: "editor2@example.com",
    role: "editor",
    status: 0,
    lastLogin: "2024-10-30 09:00",
    createdAt: "2024-06-10",
  },
];

const ROLE_CONFIG = {
  super_admin: { label: "超级管理员", color: "bg-purple-100 text-purple-600", icon: ShieldCheck },
  admin: { label: "管理员", color: "bg-blue-100 text-blue-600", icon: Shield },
  editor: { label: "编辑", color: "bg-green-100 text-green-600", icon: Shield },
};

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<Admin[]>(MOCK_ADMINS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState<{
    username: string;
    nickname: string;
    email: string;
    password: string;
    role: "admin" | "editor";
  }>({ username: "", nickname: "", email: "", password: "", role: "editor" });

  const filteredAdmins = admins.filter(
    (a) =>
      a.username.includes(searchTerm) ||
      a.nickname.includes(searchTerm) ||
      a.email.includes(searchTerm)
  );

  const handleAdd = () => {
    if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
      toast.error("请填写完整信息");
      return;
    }
    const newId = Math.max(...admins.map((a) => a.id)) + 1;
    setAdmins((prev) => [
      ...prev,
      {
        id: newId,
        username: newAdmin.username,
        nickname: newAdmin.nickname || newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        status: 1,
        lastLogin: "-",
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    setShowAddModal(false);
    setNewAdmin({ username: "", nickname: "", email: "", password: "", role: "editor" });
    toast.success("管理员添加成功");
  };

  const handleDelete = (id: number, username: string) => {
    if (username === "admin") {
      toast.error("不能删除超级管理员");
      return;
    }
    if (!confirm(`确定要删除管理员"${username}"吗？`)) return;
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    toast.success("已删除");
  };

  const handleToggleStatus = (id: number, username: string) => {
    if (username === "admin") {
      toast.error("不能禁用超级管理员");
      return;
    }
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 1 ? 0 : 1 } : a))
    );
    toast.success("状态已更新");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">管理员账号</h1>
          <p className="text-gray-500 mt-1">管理系统管理员账号</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          添加管理员
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索管理员..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                管理员
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                邮箱
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAdmins.map((admin) => {
              const roleConfig = ROLE_CONFIG[admin.role];
              return (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                        {admin.nickname.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-800">{admin.nickname}</p>
                        <p className="text-xs text-gray-500">@{admin.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${roleConfig.color}`}
                    >
                      <roleConfig.icon className="w-3 h-3" />
                      {roleConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(admin.id, admin.username)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        admin.status === 1
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {admin.status === 1 ? "正常" : "已禁用"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{admin.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded text-gray-500" title="编辑">
                        <Edit className="w-4 h-4" />
                      </button>
                      {admin.status === 1 ? (
                        <button
                          onClick={() => handleToggleStatus(admin.id, admin.username)}
                          className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
                          title="禁用"
                        >
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(admin.id, admin.username)}
                          className="p-2 hover:bg-green-100 rounded text-green-600"
                          title="启用"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(admin.id, admin.username)}
                        className="p-2 hover:bg-red-100 rounded text-red-500"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="p-4 border-t text-sm text-gray-500">
          共 {filteredAdmins.length} 个管理员
        </div>
      </div>

      {/* 添加管理员弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">添加管理员</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="登录用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                <input
                  type="text"
                  value={newAdmin.nickname}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, nickname: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="显示名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="设置密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) =>
                    setNewAdmin((prev) => ({ ...prev, role: e.target.value as "admin" | "editor" }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="editor">编辑</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
