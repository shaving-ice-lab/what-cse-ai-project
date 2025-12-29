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
import { toast } from "@/components/ui/toaster";

interface CrawlerTask {
  id: number;
  name: string;
  type: "list_monitor" | "announcement" | "position";
  status: "running" | "stopped" | "error" | "completed";
  lastRunTime: string;
  nextRunTime: string;
  successCount: number;
  errorCount: number;
  frequency: string;
}

const MOCK_TASKS: CrawlerTask[] = [
  {
    id: 1,
    name: "国考公告监控",
    type: "list_monitor",
    status: "running",
    lastRunTime: "2024-11-15 14:30",
    nextRunTime: "2024-11-15 16:30",
    successCount: 156,
    errorCount: 2,
    frequency: "每2小时",
  },
  {
    id: 2,
    name: "省考公告监控",
    type: "list_monitor",
    status: "running",
    lastRunTime: "2024-11-15 10:00",
    nextRunTime: "2024-11-15 16:00",
    successCount: 89,
    errorCount: 1,
    frequency: "每6小时",
  },
  {
    id: 3,
    name: "公告详情爬取",
    type: "announcement",
    status: "completed",
    lastRunTime: "2024-11-15 13:00",
    nextRunTime: "-",
    successCount: 45,
    errorCount: 0,
    frequency: "手动触发",
  },
  {
    id: 4,
    name: "职位表解析",
    type: "position",
    status: "error",
    lastRunTime: "2024-11-15 12:00",
    nextRunTime: "-",
    successCount: 12,
    errorCount: 5,
    frequency: "手动触发",
  },
  {
    id: 5,
    name: "事业单位监控",
    type: "list_monitor",
    status: "stopped",
    lastRunTime: "2024-11-14 20:00",
    nextRunTime: "-",
    successCount: 34,
    errorCount: 0,
    frequency: "每日",
  },
];

const STATUS_CONFIG = {
  running: { label: "运行中", color: "bg-green-100 text-green-600", icon: Play },
  stopped: { label: "已停止", color: "bg-gray-100 text-gray-600", icon: Pause },
  error: { label: "异常", color: "bg-red-100 text-red-600", icon: XCircle },
  completed: { label: "已完成", color: "bg-blue-100 text-blue-600", icon: CheckCircle },
};

export default function AdminCrawlers() {
  const [tasks, setTasks] = useState<CrawlerTask[]>(MOCK_TASKS);
  const [loading, setLoading] = useState<number | null>(null);

  const handleStart = async (id: number) => {
    setLoading(id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "running" as const } : t)));
      toast.success("任务已启动");
    } catch {
      toast.error("启动失败");
    } finally {
      setLoading(null);
    }
  };

  const handleStop = async (id: number) => {
    setLoading(id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "stopped" as const } : t)));
      toast.success("任务已停止");
    } catch {
      toast.error("停止失败");
    } finally {
      setLoading(null);
    }
  };

  const handleTrigger = async (id: number) => {
    setLoading(id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("手动触发成功，任务已加入队列");
    } catch {
      toast.error("触发失败");
    } finally {
      setLoading(null);
    }
  };

  const runningCount = tasks.filter((t) => t.status === "running").length;
  const errorCount = tasks.filter((t) => t.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">爬虫管理</h1>
          <p className="text-gray-500 mt-1">管理数据采集任务</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Play className="w-4 h-4" />
          新建任务
        </button>
      </div>

      {/* 状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总任务数</p>
              <p className="text-xl font-bold">{tasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Play className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">运行中</p>
              <p className="text-xl font-bold text-green-600">{runningCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">异常</p>
              <p className="text-xl font-bold text-red-600">{errorCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日采集</p>
              <p className="text-xl font-bold">1,234</p>
            </div>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                任务名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                执行频率
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                上次运行
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                成功/失败
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.map((task) => {
              const statusConfig = STATUS_CONFIG[task.status];
              return (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{task.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {task.type === "list_monitor"
                        ? "列表监控"
                        : task.type === "announcement"
                          ? "公告爬取"
                          : "职位解析"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}
                    >
                      <statusConfig.icon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.frequency}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.lastRunTime}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-green-600">{task.successCount}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-red-600">{task.errorCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {task.status === "running" ? (
                        <button
                          onClick={() => handleStop(task.id)}
                          disabled={loading === task.id}
                          className="p-2 hover:bg-gray-100 rounded text-gray-500"
                          title="停止"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStart(task.id)}
                          disabled={loading === task.id}
                          className="p-2 hover:bg-green-100 rounded text-green-600"
                          title="启动"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleTrigger(task.id)}
                        disabled={loading === task.id}
                        className="p-2 hover:bg-blue-100 rounded text-blue-600"
                        title="手动触发"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded text-gray-500" title="设置">
                        <Settings className="w-4 h-4" />
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
