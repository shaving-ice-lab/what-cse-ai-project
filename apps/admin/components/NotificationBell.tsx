"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Circle,
  Megaphone,
  BriefcaseIcon,
  Settings2,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import {
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  ScrollArea,
} from "@what-cse/ui";
import { notificationApi } from "@/services/notification-api";
import { useAuthStore } from "@/stores/authStore";
import type { Notification, NotificationType } from "@/types/notification";

// 通知类型图标
const TypeIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "announcement":
      return <Megaphone className="h-3 w-3 text-blue-500" />;
    case "position":
      return <BriefcaseIcon className="h-3 w-3 text-green-500" />;
    case "system":
      return <Settings2 className="h-3 w-3 text-amber-500" />;
    default:
      return <Bell className="h-3 w-3 text-gray-500" />;
  }
};

interface NotificationBellProps {
  /** 自动刷新间隔（毫秒），0 表示不自动刷新 */
  refreshInterval?: number;
  /** 预览显示的最大数量 */
  previewCount?: number;
}

export function NotificationBell({
  refreshInterval = 60000, // 默认1分钟刷新一次
  previewCount = 5,
}: NotificationBellProps) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // 加载通知
  const fetchNotifications = useCallback(async () => {
    // 只有在已认证时才获取通知
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications({
        page: 1,
        page_size: previewCount,
        unread_only: false,
      });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      // 静默处理认证错误，避免控制台刷屏
      if (err instanceof Error && err.message === "Unauthorized") {
        return;
      }
      console.error("获取通知失败:", err);
    } finally {
      setLoading(false);
    }
  }, [previewCount, isAuthenticated]);

  // 初始加载 - 等待 hydration 完成后再获取
  useEffect(() => {
    if (_hasHydrated) {
      fetchNotifications();
    }
  }, [fetchNotifications, _hasHydrated]);

  // 自动刷新 - 只有认证后才自动刷新
  useEffect(() => {
    if (refreshInterval <= 0 || !isAuthenticated) return;

    const interval = setInterval(fetchNotifications, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchNotifications, isAuthenticated]);

  // 下拉框打开时刷新
  useEffect(() => {
    if (open && isAuthenticated) {
      fetchNotifications();
    }
  }, [open, fetchNotifications, isAuthenticated]);

  // 标记为已读
  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("标记已读失败:", err);
    }
  };

  // 标记全部为已读
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("标记全部已读失败:", err);
    }
  };

  // 点击通知项
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await notificationApi.markAsRead(notification.id);
        fetchNotifications();
      } catch (err) {
        console.error("标记已读失败:", err);
      }
    }

    // 如果有链接则跳转
    if (notification.link) {
      router.push(notification.link);
    }

    setOpen(false);
  };

  // 查看全部
  const handleViewAll = () => {
    router.push("/notifications");
    setOpen(false);
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
      return "刚刚";
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString("zh-CN");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">通知</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px]">
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span>通知消息</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 text-[10px]">
                {unreadCount} 条未读
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              全部已读
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-[320px]">
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-2 p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="py-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex cursor-pointer gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors ${
                    !notification.is_read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* 状态指示器 */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <TypeIcon type={notification.type} />
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm leading-tight ${
                          !notification.is_read ? "font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <button
                          className="shrink-0 p-1 hover:bg-muted rounded"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title="标记已读"
                        >
                          <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {notification.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm">暂无通知消息</p>
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            variant="outline"
            className="w-full justify-center"
            size="sm"
            onClick={handleViewAll}
          >
            查看全部通知
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
