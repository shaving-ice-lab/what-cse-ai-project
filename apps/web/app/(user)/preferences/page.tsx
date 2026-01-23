"use client";

import { useState } from "react";
import { Settings, Save } from "lucide-react";

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState({
    exam_types: ["国考", "省考"],
    regions: ["北京", "上海"],
    education_levels: ["本科及以上"],
    notification_enabled: true,
    email_notification: true,
  });

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">偏好设置</h1>
          <p className="text-gray-500 mt-1">设置您的职位筛选偏好</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Save className="w-4 h-4" />
          <span>保存设置</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            考试类型偏好
          </h3>
          <div className="flex flex-wrap gap-3">
            {["国考", "省考", "事业单位", "选调生"].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.exam_types.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences((prev) => ({
                        ...prev,
                        exam_types: [...prev.exam_types, type],
                      }));
                    } else {
                      setPreferences((prev) => ({
                        ...prev,
                        exam_types: prev.exam_types.filter((t) => t !== type),
                      }));
                    }
                  }}
                  className="w-4 h-4 text-primary"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">地区偏好</h3>
          <div className="flex flex-wrap gap-3">
            {["北京", "上海", "广东", "江苏", "浙江", "四川", "重庆"].map((region) => (
              <label key={region} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.regions.includes(region)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences((prev) => ({
                        ...prev,
                        regions: [...prev.regions, region],
                      }));
                    } else {
                      setPreferences((prev) => ({
                        ...prev,
                        regions: prev.regions.filter((r) => r !== region),
                      }));
                    }
                  }}
                  className="w-4 h-4 text-primary"
                />
                <span>{region}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">通知设置</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>启用推送通知</span>
              <input
                type="checkbox"
                checked={preferences.notification_enabled}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    notification_enabled: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>启用邮件通知</span>
              <input
                type="checkbox"
                checked={preferences.email_notification}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    email_notification: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-primary"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
