"use client";

import { Users, Briefcase, FileText, TrendingUp, Bell, Activity, Clock } from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: string;
}

const stats: StatCard[] = [
  {
    title: "总用户数",
    value: "12,345",
    change: "+12.5%",
    changeType: "up",
    icon: <Users className="w-6 h-6" />,
    color: "bg-blue-500",
  },
  {
    title: "职位总数",
    value: "8,765",
    change: "+5.2%",
    changeType: "up",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-green-500",
  },
  {
    title: "今日活跃用户",
    value: "2,156",
    change: "+8.1%",
    changeType: "up",
    icon: <Activity className="w-6 h-6" />,
    color: "bg-purple-500",
  },
  {
    title: "公告数量",
    value: "456",
    change: "+2.3%",
    changeType: "up",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-orange-500",
  },
];

const recentActivities = [
  { id: 1, action: "新用户注册", user: "张***", time: "5分钟前" },
  { id: 2, action: "发布公告", user: "管理员", time: "10分钟前" },
  { id: 3, action: "更新职位数据", user: "系统", time: "30分钟前" },
  { id: 4, action: "用户反馈处理", user: "管理员", time: "1小时前" },
  { id: 5, action: "爬虫任务完成", user: "系统", time: "2小时前" },
];

const pendingTasks = [
  { id: 1, title: "待审核职位", count: 23, priority: "high" },
  { id: 2, title: "用户反馈", count: 12, priority: "medium" },
  { id: 3, title: "数据异常", count: 3, priority: "low" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎回来，管理员</p>
        </div>
        <div className="text-sm text-gray-500">最后更新: {new Date().toLocaleString("zh-CN")}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div className={`${stat.color} text-white p-3 rounded-lg`}>{stat.icon}</div>
              <div
                className={`flex items-center text-sm ${
                  stat.changeType === "up"
                    ? "text-green-500"
                    : stat.changeType === "down"
                      ? "text-red-500"
                      : "text-gray-500"
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-500 text-sm">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">数据趋势</h2>
            <select className="text-sm border rounded-lg px-3 py-1">
              <option>最近7天</option>
              <option>最近30天</option>
              <option>最近90天</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">图表组件待集成</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">待处理任务</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">{task.title}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-600"
                      : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                  }`}
                >
                  {task.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">最近活动</h2>
          <button className="text-sm text-primary hover:underline">查看全部</button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
