import { useState } from "react";
import { Settings, Save, Database, Globe, Bell, Shield } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultPageSize: number;
  cacheExpiration: number;
  crawlerEnabled: boolean;
  notificationEnabled: boolean;
  emailNotification: boolean;
  pushNotification: boolean;
}

const DEFAULT_CONFIG: SystemConfig = {
  siteName: "公考职位智能筛选系统",
  siteDescription: "帮助考生快速找到合适的公务员职位",
  contactEmail: "admin@example.com",
  maintenanceMode: false,
  allowRegistration: true,
  defaultPageSize: 20,
  cacheExpiration: 3600,
  crawlerEnabled: true,
  notificationEnabled: true,
  emailNotification: true,
  pushNotification: false,
};

export default function AdminSettings() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("配置已保存");
    } catch {
      toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">系统设置</h1>
            <p className="text-gray-500 mt-1">管理系统全局配置</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "保存中..." : "保存配置"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本设置 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">基本设置</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => setConfig((prev) => ({ ...prev, siteName: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">网站描述</label>
              <textarea
                value={config.siteDescription}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, siteDescription: e.target.value }))
                }
                className="w-full px-4 py-2 border rounded-lg"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系邮箱</label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) => setConfig((prev) => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">维护模式</p>
                <p className="text-sm text-gray-500">开启后用户将看到维护页面</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.maintenanceMode}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 用户设置 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">用户设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">允许注册</p>
                <p className="text-sm text-gray-500">是否允许新用户注册</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.allowRegistration}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, allowRegistration: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">默认分页大小</label>
              <select
                value={config.defaultPageSize}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, defaultPageSize: Number(e.target.value) }))
                }
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
                <option value={100}>100条/页</option>
              </select>
            </div>
          </div>
        </div>

        {/* 数据设置 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">数据设置</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                缓存过期时间（秒）
              </label>
              <input
                type="number"
                value={config.cacheExpiration}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, cacheExpiration: Number(e.target.value) }))
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">爬虫服务</p>
                <p className="text-sm text-gray-500">是否启用数据采集服务</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.crawlerEnabled}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, crawlerEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">通知设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">通知服务</p>
                <p className="text-sm text-gray-500">是否启用通知服务</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificationEnabled}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, notificationEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">邮件通知</p>
                <p className="text-sm text-gray-500">是否启用邮件通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailNotification}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, emailNotification: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">推送通知</p>
                <p className="text-sm text-gray-500">是否启用App推送通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pushNotification}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, pushNotification: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
