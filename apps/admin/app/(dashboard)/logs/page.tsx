"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface LogEntry {
  id: number;
  level: "info" | "warning" | "error";
  message: string;
  source: string;
  timestamp: string;
}

const mockLogs: LogEntry[] = [
  {
    id: 1,
    level: "info",
    message: "用户 user123 登录成功",
    source: "auth",
    timestamp: "2024-12-20 14:30:25",
  },
  {
    id: 2,
    level: "warning",
    message: "爬虫任务执行超时",
    source: "crawler",
    timestamp: "2024-12-20 14:28:10",
  },
  {
    id: 3,
    level: "error",
    message: "数据库连接失败",
    source: "database",
    timestamp: "2024-12-20 14:25:00",
  },
  {
    id: 4,
    level: "info",
    message: "公告 ID:123 发布成功",
    source: "announcement",
    timestamp: "2024-12-20 14:20:15",
  },
  {
    id: 5,
    level: "info",
    message: "职位数据同步完成，共 3245 条",
    source: "sync",
    timestamp: "2024-12-20 14:15:00",
  },
  {
    id: 6,
    level: "warning",
    message: "API 请求频率过高",
    source: "api",
    timestamp: "2024-12-20 14:10:30",
  },
  {
    id: 7,
    level: "error",
    message: "邮件发送失败：SMTP 连接超时",
    source: "email",
    timestamp: "2024-12-20 14:05:22",
  },
];

export default function LogsPage() {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelClass = (level: string) => {
    switch (level) {
      case "info":
        return "bg-blue-100 text-blue-600";
      case "warning":
        return "bg-yellow-100 text-yellow-600";
      case "error":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredLogs =
    levelFilter === "all" ? logs : logs.filter((log) => log.level === levelFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">系统日志</h1>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            <span>刷新</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-800">{logs.length}</div>
          <div className="text-gray-500 text-sm">总日志数</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">
            {logs.filter((l) => l.level === "info").length}
          </div>
          <div className="text-gray-500 text-sm">信息</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {logs.filter((l) => l.level === "warning").length}
          </div>
          <div className="text-gray-500 text-sm">警告</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">
            {logs.filter((l) => l.level === "error").length}
          </div>
          <div className="text-gray-500 text-sm">错误</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索日志..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">级别:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm"
            >
              <option value="all">全部</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
            </select>
          </div>
        </div>

        <div className="divide-y">
          {filteredLogs.map((log) => (
            <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getLevelIcon(log.level)}
                  <div>
                    <div className="text-gray-800">{log.message}</div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded text-xs ${getLevelClass(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span>来源: {log.source}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
