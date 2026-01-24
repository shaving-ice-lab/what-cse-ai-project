"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  MapPin,
  Building2,
  GraduationCap,
  Bell,
  Mail,
  Check,
  Loader2,
} from "lucide-react";

const examTypes = ["国考", "省考", "事业单位", "选调生"];
const regions = [
  "北京",
  "上海",
  "广东",
  "江苏",
  "浙江",
  "四川",
  "重庆",
  "山东",
  "湖北",
  "湖南",
];
const educationLevels = ["大专及以上", "本科及以上", "硕士及以上", "博士及以上"];

export default function PreferencesPage() {
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    exam_types: ["国考", "省考"],
    regions: ["北京", "上海"],
    education_levels: ["本科及以上"],
    notification_enabled: true,
    email_notification: true,
    sms_notification: false,
    match_notification: true,
    announcement_notification: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert("设置已保存");
  };

  const toggleItem = (key: keyof typeof preferences, item: string) => {
    const current = preferences[key] as string[];
    if (current.includes(item)) {
      setPreferences((prev) => ({
        ...prev,
        [key]: current.filter((i) => i !== item),
      }));
    } else {
      setPreferences((prev) => ({
        ...prev,
        [key]: [...current, item],
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
            <Settings className="w-8 h-8 text-amber-500" />
            偏好设置
          </h1>
          <p className="text-stone-500 mt-1">设置您的职位筛选和通知偏好</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 transition-all shadow-amber-md hover:shadow-amber-lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              保存设置
            </>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Exam Types */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            考试类型偏好
          </h3>
          <p className="text-sm text-stone-500 mb-4">
            选择您关注的考试类型，系统将优先推荐相关职位
          </p>
          <div className="flex flex-wrap gap-3">
            {examTypes.map((type) => {
              const isSelected = preferences.exam_types.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleItem("exam_types", type)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-amber-50 border-amber-300 text-amber-700"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-amber-500 bg-amber-500"
                        : "border-stone-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Regions */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            地区偏好
          </h3>
          <p className="text-sm text-stone-500 mb-4">
            选择您意向的工作地区，可多选
          </p>
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => {
              const isSelected = preferences.regions.includes(region);
              return (
                <button
                  key={region}
                  onClick={() => toggleItem("regions", region)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        {/* Education Preference */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-500" />
            学历要求偏好
          </h3>
          <p className="text-sm text-stone-500 mb-4">
            选择您符合的学历条件，用于筛选匹配的职位
          </p>
          <div className="space-y-3">
            {educationLevels.map((level) => {
              const isSelected = preferences.education_levels.includes(level);
              return (
                <button
                  key={level}
                  onClick={() => {
                    setPreferences((prev) => ({
                      ...prev,
                      education_levels: [level],
                    }));
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-amber-50 border-amber-300"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <span
                    className={isSelected ? "text-amber-700 font-medium" : "text-stone-600"}
                  >
                    {level}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-amber-500 bg-amber-500" : "border-stone-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            通知设置
          </h3>
          <p className="text-sm text-stone-500 mb-4">管理您的消息通知偏好</p>
          <div className="space-y-4">
            {[
              {
                key: "notification_enabled",
                label: "启用推送通知",
                desc: "接收系统推送的重要消息",
              },
              {
                key: "email_notification",
                label: "邮件通知",
                desc: "通过邮件接收消息提醒",
                icon: Mail,
              },
              {
                key: "match_notification",
                label: "匹配通知",
                desc: "当有新的高匹配度职位时通知我",
              },
              {
                key: "announcement_notification",
                label: "公告提醒",
                desc: "当有新公告发布时通知我",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-stone-700">{item.label}</p>
                  <p className="text-sm text-stone-500">{item.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setPreferences((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof prev],
                    }))
                  }
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    preferences[item.key as keyof typeof preferences]
                      ? "bg-amber-500"
                      : "bg-stone-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      preferences[item.key as keyof typeof preferences]
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
