import { useState } from "react";
import { Bell, CheckCircle, Info, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

type NotificationType = "info" | "success" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "新公告发布",
    content: "2024年国家公务员考试公告已发布，点击查看详情",
    time: "2小时前",
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "匹配职位推荐",
    content: "发现5个与您条件高度匹配的新职位",
    time: "1天前",
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "报名截止提醒",
    content: '您收藏的"国家税务总局北京市税务局-综合管理岗"报名将于3天后截止',
    time: "2天前",
    read: true,
  },
  {
    id: "4",
    type: "info",
    title: "系统通知",
    content: "您的个人简历已更新成功",
    time: "3天前",
    read: true,
  },
];

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "warning":
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.read);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("已全部标记为已读");
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("通知已删除");
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success("已清空所有通知");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <h1 className="text-2xl font-bold">消息通知</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            全部已读
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="px-3 py-1.5 text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            清空全部
          </button>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            filter === "unread"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          未读 {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* 通知列表 */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{filter === "unread" ? "没有未读消息" : "暂无消息通知"}</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 transition-colors ${
                !notification.read ? "border-l-4 border-primary" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${!notification.read ? "text-gray-900" : "text-gray-600"}`}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{notification.content}</p>
                  <div className="flex gap-3 mt-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        标记已读
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
