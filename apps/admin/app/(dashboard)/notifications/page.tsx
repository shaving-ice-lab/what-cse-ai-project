"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Circle,
  Search,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  Megaphone,
  BriefcaseIcon,
  Settings2,
  CheckCheck,
  Send,
  XCircle,
  Mail,
  MailOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Textarea,
} from "@what-cse/ui";
import { notificationApi } from "@/services/notification-api";
import type {
  Notification,
  NotificationQueryParams,
  NotificationType,
  NotificationTypeLabels,
} from "@/types/notification";

// 通知类型标签
const typeLabels: Record<NotificationType, string> = {
  announcement: "公告通知",
  position: "职位通知",
  system: "系统消息",
};

// 通知类型图标
const TypeIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "announcement":
      return <Megaphone className="h-4 w-4 text-blue-500" />;
    case "position":
      return <BriefcaseIcon className="h-4 w-4 text-green-500" />;
    case "system":
      return <Settings2 className="h-4 w-4 text-amber-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

// 通知类型徽章
const TypeBadge = ({ type }: { type: NotificationType }) => {
  const variants: Record<NotificationType, string> = {
    announcement: "bg-blue-100 text-blue-700 border-blue-200",
    position: "bg-green-100 text-green-700 border-green-200",
    system: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <Badge variant="outline" className={variants[type] || "bg-gray-100 text-gray-700"}>
      {typeLabels[type] || type}
    </Badge>
  );
};

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 状态管理
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 发送通知对话框
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    type: "system" as NotificationType,
    title: "",
    content: "",
  });
  const [sending, setSending] = useState(false);

  // 筛选条件
  const [filters, setFilters] = useState<NotificationQueryParams>({
    page: Number(searchParams.get("page")) || 1,
    page_size: Number(searchParams.get("page_size")) || 20,
    unread_only: searchParams.get("unread_only") === "true",
    type: (searchParams.get("type") as NotificationType) || undefined,
  });

  // 加载通知列表
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationApi.getNotifications(filters);
      setNotifications(data.notifications || []);
      setTotal(data.total || 0);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取通知列表失败");
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 更新 URL 参数
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== false) {
        params.set(key, String(value));
      }
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  // 处理搜索
  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // 重置筛选
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      page_size: 20,
      unread_only: false,
      type: undefined,
    });
    setSelectedIds([]);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // 标记为已读
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  };

  // 标记全部为已读
  const handleMarkAllAsRead = async () => {
    if (!confirm("确定要将所有通知标记为已读吗？")) return;
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  };

  // 删除通知
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这条通知吗？")) return;
    try {
      await notificationApi.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  // 批量选择
  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 发送广播通知
  const handleSendBroadcast = async () => {
    if (!sendForm.title.trim() || !sendForm.content.trim()) {
      alert("请填写标题和内容");
      return;
    }
    try {
      setSending(true);
      await notificationApi.broadcastNotification({
        type: sendForm.type,
        title: sendForm.title.trim(),
        content: sendForm.content.trim(),
      });
      setSendDialogOpen(false);
      setSendForm({ type: "system", title: "", content: "" });
      alert("通知发送成功");
    } catch (err) {
      alert(err instanceof Error ? err.message : "发送失败");
    } finally {
      setSending(false);
    }
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

  const totalPages = Math.ceil(total / (filters.page_size || 20));
  const currentPage = filters.page || 1;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">消息中心</h1>
          <p className="text-muted-foreground">查看和管理系统通知消息</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/notifications/settings")}>
            <Settings2 className="mr-2 h-4 w-4" />
            通知设置
          </Button>
          <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                发送通知
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>发送系统通知</DialogTitle>
                <DialogDescription>
                  向所有用户发送广播通知
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">通知类型</label>
                  <Select
                    value={sendForm.type}
                    onValueChange={(v) =>
                      setSendForm((prev) => ({ ...prev, type: v as NotificationType }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">系统消息</SelectItem>
                      <SelectItem value="announcement">公告通知</SelectItem>
                      <SelectItem value="position">职位通知</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">标题</label>
                  <Input
                    placeholder="请输入通知标题"
                    value={sendForm.title}
                    onChange={(e) =>
                      setSendForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">内容</label>
                  <Textarea
                    placeholder="请输入通知内容"
                    rows={4}
                    value={sendForm.content}
                    onChange={(e) =>
                      setSendForm((prev) => ({ ...prev, content: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSendBroadcast} disabled={sending}>
                  {sending ? "发送中..." : "发送通知"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">全部通知</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">累计收到的通知数量</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未读消息</CardTitle>
            <Mail className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">待处理的未读消息</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已读消息</CardTitle>
            <MailOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{total - unreadCount}</div>
            <p className="text-xs text-muted-foreground">已查看的消息数量</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleMarkAllAsRead}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">快捷操作</CardTitle>
            <CheckCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-blue-600">全部已读</div>
            <p className="text-xs text-muted-foreground">点击标记所有为已读</p>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区 */}
      <Card>
        <CardContent className="pt-6">
          {/* 筛选工具栏 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {/* 搜索框 */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索通知..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch}>搜索</Button>

              {/* 未读筛选 */}
              <Select
                value={filters.unread_only ? "unread" : "all"}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    unread_only: v === "unread",
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="unread">仅未读</SelectItem>
                </SelectContent>
              </Select>

              {/* 类型筛选 */}
              <Select
                value={filters.type || "all"}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: v === "all" ? undefined : (v as NotificationType),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="announcement">公告通知</SelectItem>
                  <SelectItem value="position">职位通知</SelectItem>
                  <SelectItem value="system">系统消息</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" onClick={handleResetFilters}>
                重置
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                全部已读
              </Button>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* 通知列表 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === notifications.length && notifications.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead className="w-[40px]">状态</TableHead>
                  <TableHead className="w-[100px]">类型</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead className="hidden md:table-cell">内容</TableHead>
                  <TableHead className="w-[120px]">时间</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-60" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <TableRow
                      key={notification.id}
                      className={notification.is_read ? "bg-muted/30" : "bg-blue-50/30"}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(notification.id)}
                          onChange={() => handleSelectOne(notification.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        {notification.is_read ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-blue-500 fill-blue-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={notification.type} />
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[300px]">
                        <span className="truncate block text-sm text-muted-foreground" title={notification.content}>
                          {notification.content}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(notification.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">操作</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!notification.is_read && (
                              <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                标记已读
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">暂无通知消息</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between px-2 py-4">
            <p className="text-sm text-muted-foreground">
              共 <span className="font-medium">{total}</span> 条通知
              {totalPages > 1 && (
                <span className="ml-2">
                  第 {currentPage}/{totalPages} 页
                </span>
              )}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
