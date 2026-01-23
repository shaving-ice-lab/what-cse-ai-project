"use client";

import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "新职位匹配",
    content: "有3个新职位符合您的条件，快来看看吧！",
    type: "match",
    is_read: false,
    created_at: "2024-11-01 10:30",
  },
  {
    id: 2,
    title: "公告更新",
    content: "2024年国考报名即将截止，请尽快报名",
    type: "announcement",
    is_read: false,
    created_at: "2024-10-30 14:20",
  },
  {
    id: 3,
    title: "收藏职位更新",
    content: '您收藏的"综合管理岗"职位竞争比已更新',
    type: "favorite",
    is_read: true,
    created_at: "2024-10-28 09:15",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">消息通知</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `您有 ${unreadCount} 条未读消息` : "暂无未读消息"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5"
          >
            <Check className="w-4 h-4" />
            <span>全部已读</span>
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border p-4 ${
                !notification.is_read ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3
                      className={`font-semibold ${
                        !notification.is_read ? "text-gray-800" : "text-gray-600"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-500 mt-1">{notification.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{notification.created_at}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg"
                      title="标记为已读"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">暂无消息通知</p>
        </div>
      )}
    </div>
  );
}
