import { useState } from "react";
import { Search, Filter, FileText, User, Settings, Database, Shield } from "lucide-react";

interface LogEntry {
  id: number;
  type: "user" | "system" | "data" | "security";
  action: string;
  operator: string;
  ip: string;
  detail: string;
  createdAt: string;
}

const MOCK_LOGS: LogEntry[] = [
  {
    id: 1,
    type: "user",
    action: "用户登录",
    operator: "admin",
    ip: "192.168.1.100",
    detail: "管理员登录成功",
    createdAt: "2024-11-15 14:30:25",
  },
  {
    id: 2,
    type: "data",
    action: "职位审核",
    operator: "editor1",
    ip: "192.168.1.101",
    detail: "审核通过职位ID: 1234",
    createdAt: "2024-11-15 14:28:10",
  },
  {
    id: 3,
    type: "data",
    action: "公告发布",
    operator: "editor1",
    ip: "192.168.1.101",
    detail: "发布公告: 2024年国考公告",
    createdAt: "2024-11-15 14:25:00",
  },
  {
    id: 4,
    type: "system",
    action: "系统配置",
    operator: "admin",
    ip: "192.168.1.100",
    detail: "修改系统配置: 缓存时间",
    createdAt: "2024-11-15 14:20:00",
  },
  {
    id: 5,
    type: "security",
    action: "密码修改",
    operator: "editor2",
    ip: "192.168.1.102",
    detail: "用户修改密码",
    createdAt: "2024-11-15 14:15:00",
  },
  {
    id: 6,
    type: "data",
    action: "爬虫任务",
    operator: "system",
    ip: "127.0.0.1",
    detail: "启动爬虫任务: 国考公告监控",
    createdAt: "2024-11-15 14:00:00",
  },
  {
    id: 7,
    type: "user",
    action: "用户登出",
    operator: "manager",
    ip: "192.168.1.103",
    detail: "管理员退出登录",
    createdAt: "2024-11-15 13:55:00",
  },
  {
    id: 8,
    type: "security",
    action: "登录失败",
    operator: "unknown",
    ip: "10.0.0.50",
    detail: "登录失败: 用户名或密码错误",
    createdAt: "2024-11-15 13:50:00",
  },
  {
    id: 9,
    type: "data",
    action: "数据导入",
    operator: "admin",
    ip: "192.168.1.100",
    detail: "导入职位数据: 500条",
    createdAt: "2024-11-15 13:30:00",
  },
  {
    id: 10,
    type: "system",
    action: "缓存清理",
    operator: "system",
    ip: "127.0.0.1",
    detail: "自动清理过期缓存",
    createdAt: "2024-11-15 12:00:00",
  },
];

const TYPE_CONFIG = {
  user: { label: "用户", color: "bg-blue-100 text-blue-600", icon: User },
  system: { label: "系统", color: "bg-gray-100 text-gray-600", icon: Settings },
  data: { label: "数据", color: "bg-green-100 text-green-600", icon: Database },
  security: { label: "安全", color: "bg-red-100 text-red-600", icon: Shield },
};

export default function AdminLogs() {
  const [logs] = useState<LogEntry[]>(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.action.includes(searchTerm) ||
      log.operator.includes(searchTerm) ||
      log.detail.includes(searchTerm);
    const matchType = !typeFilter || log.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">操作日志</h1>
            <p className="text-gray-500 mt-1">查看系统操作记录</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex flex-wrap items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索日志..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="">全部类型</option>
            <option value="user">用户</option>
            <option value="system">系统</option>
            <option value="data">数据</option>
            <option value="security">安全</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <span className="text-gray-400">至</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作人
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                IP地址
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                详情
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                时间
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLogs.map((log) => {
              const typeConfig = TYPE_CONFIG[log.type];
              return (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${typeConfig.color}`}
                    >
                      <typeConfig.icon className="w-3 h-3" />
                      {typeConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.operator}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.ip}</td>
                  <td
                    className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                    title={log.detail}
                  >
                    {log.detail}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">共 {filteredLogs.length} 条记录</p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">上一页</button>
            <button className="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">下一页</button>
          </div>
        </div>
      </div>

      {/* 日志统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">用户操作</p>
              <p className="text-xl font-bold">{logs.filter((l) => l.type === "user").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Database className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">数据操作</p>
              <p className="text-xl font-bold">{logs.filter((l) => l.type === "data").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">系统操作</p>
              <p className="text-xl font-bold">{logs.filter((l) => l.type === "system").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">安全事件</p>
              <p className="text-xl font-bold">
                {logs.filter((l) => l.type === "security").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
