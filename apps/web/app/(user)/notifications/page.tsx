"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  FileText,
  Target,
  Clock,
  ChevronRight,
  Settings,
} from "lucide-react";

interface Notification {
  id: number;
  type: "announcement" | "match" | "system" | "reminder";
  title: string;
  content: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "announcement",
    title: "新公告发布",
    content: "2024年度中央机关及其直属机构考试录用公务员公告已发布",
    link: "/announcements/1",
    is_read: false,
    created_at: "2024-11-20 10:30",
  },
  {
    id: 2,
    type: "match",
    title: "发现新匹配职位",
    content: "根据您的条件，系统为您匹配到5个新的高匹配度职位",
    link: "/match",
    is_read: false,
    created_at: "2024-11-19 15:20",
  },
  {
    id: 3,
    type: "reminder",
    title: "报名即将截止",
    content: "您收藏的「综合管理岗」报名将于3天后截止",
    link: "/positions/1",
    is_read: false,
    created_at: "2024-11-19 09:00",
  },
  {
    id: 4,
    type: "system",
    title: "系统通知",
    content: "您的个人信息已成功更新",
    is_read: true,
    created_at: "2024-11-18 14:00",
  },
  {
    id: 5,
    type: "announcement",
    title: "考试时间公布",
    content: "2024年国考笔试时间已确定为11月26日",
    link: "/announcements/2",
    is_read: true,
    created_at: "2024-11-15 08:00",
  },
];

const typeConfig = {
  announcement: {
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "公告",
  },
  match: {
    icon: Target,
    color: "text-amber-600",
    bg: "bg-amber-100",
    label: "匹配",
  },
  reminder: {
    icon: Clock,
    color: "text-rose-600",
    bg: "bg-rose-100",
    label: "提醒",
  },
  system: {
    icon: AlertCircle,
    color: "text-stone-600",
    bg: "bg-stone-100",
    label: "系统",
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<string>("all");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => n.type === filter);

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
            <Bell className="w-8 h-8 text-amber-500" />
            消息通知
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 text-sm font-medium bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-stone-500 mt-1">查看系统通知和公告提醒</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              全部已读
            </button>
          )}
          <Link
            href="/preferences"
            className="p-2.5 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "全部" },
          { key: "unread", label: `未读 (${unreadCount})` },
          { key: "announcement", label: "公告" },
          { key: "match", label: "匹配" },
          { key: "reminder", label: "提醒" },
          { key: "system", label: "系统" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === item.key
                ? "bg-amber-500 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification, index) => {
            const config = typeConfig[notification.type];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`group bg-white rounded-2xl border shadow-card transition-all duration-300 animate-fade-in ${
                  notification.is_read
                    ? "border-stone-200/50"
                    : "border-amber-200 bg-amber-50/30"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-4 lg:p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-md ${config.bg} ${config.color}`}
                        >
                          {config.label}
                        </span>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-amber-500 rounded-full" />
                        )}
                        <span className="text-xs text-stone-400 ml-auto">
                          {notification.created_at}
                        </span>
                      </div>
                      <h3 className="font-semibold text-stone-800 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-stone-600 line-clamp-2">
                        {notification.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="标记已读"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Bell className="w-16 h-16 mx-auto text-stone-200 mb-4" />
          <p className="text-stone-500">
            {filter === "unread" ? "没有未读消息" : "暂无消息通知"}
          </p>
        </div>
      )}
    </div>
  );
}
