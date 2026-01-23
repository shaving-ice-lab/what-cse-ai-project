"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  RefreshCw,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface CrawlerTask {
  id: number;
  name: string;
  source: string;
  status: "running" | "stopped" | "error" | "completed";
  last_run: string;
  next_run: string;
  items_count: number;
}

const mockTasks: CrawlerTask[] = [
  {
    id: 1,
    name: "国考职位采集",
    source: "scs.gov.cn",
    status: "completed",
    last_run: "2024-12-20 10:00",
    next_run: "2024-12-21 10:00",
    items_count: 3245,
  },
  {
    id: 2,
    name: "北京省考采集",
    source: "rsj.beijing.gov.cn",
    status: "running",
    last_run: "2024-12-20 14:00",
    next_run: "-",
    items_count: 890,
  },
  {
    id: 3,
    name: "公告采集",
    source: "multiple",
    status: "stopped",
    last_run: "2024-12-19 08:00",
    next_run: "手动触发",
    items_count: 156,
  },
  {
    id: 4,
    name: "事业单位采集",
    source: "mohrss.gov.cn",
    status: "error",
    last_run: "2024-12-20 06:00",
    next_run: "待修复",
    items_count: 0,
  },
];

export default function CrawlersPage() {
  const [tasks] = useState<CrawlerTask[]>(mockTasks);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "running":
        return { text: "运行中", class: "bg-blue-100 text-blue-600" };
      case "completed":
        return { text: "已完成", class: "bg-green-100 text-green-600" };
      case "error":
        return { text: "异常", class: "bg-red-100 text-red-600" };
      default:
        return { text: "已停止", class: "bg-gray-100 text-gray-600" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">爬虫管理</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Play className="w-4 h-4" />
          <span>运行全部</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-800">{tasks.length}</div>
          <div className="text-gray-500 text-sm">总任务数</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter((t) => t.status === "running").length}
          </div>
          <div className="text-gray-500 text-sm">运行中</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {tasks.reduce((sum, t) => sum + t.items_count, 0).toLocaleString()}
          </div>
          <div className="text-gray-500 text-sm">采集数据量</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">
            {tasks.filter((t) => t.status === "error").length}
          </div>
          <div className="text-gray-500 text-sm">异常任务</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                任务名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                数据源
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                上次运行
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                下次运行
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
            {tasks.map((task) => {
              const statusInfo = getStatusText(task.status);
              return (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span className="font-medium text-gray-800">{task.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{task.source}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}
                    >
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{task.last_run}</td>
                  <td className="px-6 py-4 text-gray-600">{task.next_run}</td>
                  <td className="px-6 py-4 text-gray-600">{task.items_count.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {task.status === "running" ? (
                        <button className="p-1 hover:bg-yellow-50 rounded" title="暂停">
                          <Pause className="w-4 h-4 text-yellow-500" />
                        </button>
                      ) : (
                        <button className="p-1 hover:bg-green-50 rounded" title="运行">
                          <Play className="w-4 h-4 text-green-500" />
                        </button>
                      )}
                      <button className="p-1 hover:bg-gray-100 rounded" title="配置">
                        <Settings className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
