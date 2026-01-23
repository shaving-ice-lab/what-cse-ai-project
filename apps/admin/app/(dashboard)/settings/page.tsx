"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, Shield, Bell, Database, Globe, Users } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "公考智选",
    siteDescription: "公务员职位智能筛选系统",
    allowRegistration: true,
    requireEmailVerification: false,
    defaultPageSize: 20,
    crawlerInterval: 24,
  });

  const handleSave = () => {
    console.log("Saving settings:", settings);
    // Save settings logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">系统设置</h1>
        <Link
          href="/settings/admins"
          className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <Users className="w-4 h-4" />
          <span>管理员管理</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本设置 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">基本设置</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">站点名称</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">站点描述</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* 用户设置 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">用户设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">允许用户注册</div>
                <div className="text-sm text-gray-500">关闭后新用户无法注册</div>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, allowRegistration: !settings.allowRegistration })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.allowRegistration ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.allowRegistration ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">邮箱验证</div>
                <div className="text-sm text-gray-500">注册时要求验证邮箱</div>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    requireEmailVerification: !settings.requireEmailVerification,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.requireEmailVerification ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.requireEmailVerification ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 数据设置 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">数据设置</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">默认分页大小</label>
              <select
                value={settings.defaultPageSize}
                onChange={(e) =>
                  setSettings({ ...settings, defaultPageSize: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                爬虫运行间隔（小时）
              </label>
              <input
                type="number"
                value={settings.crawlerInterval}
                onChange={(e) =>
                  setSettings({ ...settings, crawlerInterval: parseInt(e.target.value) })
                }
                min={1}
                max={168}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">通知设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">系统通知</div>
                <div className="text-sm text-gray-500">重要系统事件通知</div>
              </div>
              <button className="relative w-12 h-6 rounded-full transition-colors bg-primary">
                <span className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">爬虫异常通知</div>
                <div className="text-sm text-gray-500">爬虫任务异常时发送通知</div>
              </div>
              <button className="relative w-12 h-6 rounded-full transition-colors bg-primary">
                <span className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Save className="w-4 h-4" />
          <span>保存设置</span>
        </button>
      </div>
    </div>
  );
}
