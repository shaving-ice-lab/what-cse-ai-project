"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  List,
  Grid3X3,
  CalendarDays,
  PanelRightClose,
  PanelRight,
  Timer,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Textarea,
  Label,
  Switch,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@what-cse/ui";
import {
  calendarApi,
  type CalendarEvent,
  type CalendarMonthResponse,
  type CalendarStats,
  type CreateEventRequest,
  type CalendarEventType,
  type CalendarEventStatus,
  type UpcomingEventsResponse,
  EVENT_TYPE_CONFIG,
} from "@/services/calendar-api";

// 获取月份的天数
function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // 补齐月初的空白天（上个月的末尾）
  const startDayOfWeek = firstDay.getDay();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // 当月的所有天
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // 补齐月末的空白天（下个月的开头）
  const remainingDays = 42 - days.length; // 6 行 x 7 列
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

// 格式化日期
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// 检查是否是今天
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// 检查是否是当前月份
function isCurrentMonth(date: Date, year: number, month: number): boolean {
  return date.getMonth() === month && date.getFullYear() === year;
}

// 获取状态徽章
function getStatusBadge(status: CalendarEventStatus) {
  const config = {
    pending: { label: "待处理", variant: "default" as const, icon: Clock },
    notified: { label: "已提醒", variant: "secondary" as const, icon: Bell },
    completed: { label: "已完成", variant: "outline" as const, icon: CheckCircle },
    cancelled: { label: "已取消", variant: "destructive" as const, icon: XCircle },
  };
  return config[status] || config.pending;
}

// 月份名称
const MONTH_NAMES = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

// 获取指定日期所在周的日期数组
function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

// 获取时间段标签
function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

export default function CalendarPage() {
  // 当前视图日期
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day);
    return start;
  });
  const [viewMode, setViewMode] = useState<"month" | "week" | "list" | "timeline">("month");

  // 数据状态
  const [monthData, setMonthData] = useState<CalendarMonthResponse | null>(null);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 表单状态
  const [formData, setFormData] = useState<CreateEventRequest>({
    event_type: "custom",
    event_title: "",
    event_description: "",
    event_date: formatDate(new Date()),
    all_day: true,
    reminder_enabled: true,
    reminder_times: [24, 2],
    notify_channels: ["push"],
  });

  // 加载月份数据
  const fetchMonthData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calendarApi.getEventsByMonth(currentYear, currentMonth + 1);
      setMonthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取日历数据失败");
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  // 加载统计数据
  const fetchStats = useCallback(async () => {
    try {
      const data = await calendarApi.getStats();
      setStats(data);
    } catch (err) {
      // 静默失败
    }
  }, []);

  // 加载即将到来的事件
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      const data = await calendarApi.getUpcomingEvents(7);
      setUpcomingEvents(data.events || []);
    } catch (err) {
      // 静默失败
    }
  }, []);

  useEffect(() => {
    fetchMonthData();
    fetchStats();
    fetchUpcomingEvents();
  }, [fetchMonthData, fetchStats, fetchUpcomingEvents]);

  // 切换月份
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    // 更新周视图的周起始日期
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day);
    setCurrentWeekStart(start);
  };

  // 周导航
  const goToPrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
    // 同步月份
    setCurrentYear(newStart.getFullYear());
    setCurrentMonth(newStart.getMonth());
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
    // 同步月份
    setCurrentYear(newStart.getFullYear());
    setCurrentMonth(newStart.getMonth());
  };

  // 获取周视图的日期数组
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  // 时间段
  const timeSlots = useMemo(() => getTimeSlots(), []);

  // 获取日期的事件
  const getEventsForDate = useCallback(
    (dateKey: string): CalendarEvent[] => {
      if (!monthData?.event_days) return [];
      return monthData.event_days[dateKey] || [];
    },
    [monthData]
  );

  // 日历网格
  const calendarDays = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // 处理日期点击
  const handleDateClick = (date: Date) => {
    const dateKey = formatDate(date);
    setSelectedDate(dateKey);
    setFormData((prev) => ({ ...prev, event_date: dateKey }));
  };

  // 打开创建对话框
  const openCreateDialog = (date?: string) => {
    setEditingEvent(null);
    setFormData({
      event_type: "custom",
      event_title: "",
      event_description: "",
      event_date: date || formatDate(new Date()),
      all_day: true,
      reminder_enabled: true,
      reminder_times: [24, 2],
      notify_channels: ["push"],
    });
    setCreateDialogOpen(true);
  };

  // 打开编辑对话框
  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      event_type: event.event_type,
      event_title: event.event_title,
      event_description: event.event_description || "",
      event_date: event.event_date,
      event_time: event.event_time || undefined,
      all_day: event.all_day,
      reminder_enabled: event.reminder_enabled,
      reminder_times: event.reminder_times,
      notify_channels: event.notify_channels,
      color: event.color,
    });
    setCreateDialogOpen(true);
  };

  // 保存事件
  const handleSaveEvent = async () => {
    try {
      if (editingEvent) {
        await calendarApi.updateEvent(editingEvent.id, {
          event_title: formData.event_title,
          event_description: formData.event_description,
          event_date: formData.event_date,
          event_time: formData.event_time,
          all_day: formData.all_day,
          reminder_enabled: formData.reminder_enabled,
          reminder_times: formData.reminder_times,
          notify_channels: formData.notify_channels,
          color: formData.color,
        });
      } else {
        await calendarApi.createEvent(formData);
      }
      setCreateDialogOpen(false);
      fetchMonthData();
      fetchStats();
      fetchUpcomingEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "保存失败");
    }
  };

  // 删除事件
  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("确定要删除这个事件吗？")) return;
    try {
      await calendarApi.deleteEvent(eventId);
      fetchMonthData();
      fetchStats();
      fetchUpcomingEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  // 标记完成
  const handleMarkCompleted = async (eventId: number) => {
    try {
      await calendarApi.markCompleted(eventId);
      fetchMonthData();
      fetchStats();
      fetchUpcomingEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  };

  // 标记取消
  const handleMarkCancelled = async (eventId: number) => {
    try {
      await calendarApi.markCancelled(eventId);
      fetchMonthData();
      fetchStats();
      fetchUpcomingEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">报考日历</h1>
          <p className="text-muted-foreground">管理考试时间、报名时间等重要日程</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { fetchMonthData(); fetchStats(); fetchUpcomingEvents(); }} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button onClick={() => openCreateDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            添加事件
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">即将到来</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcoming_count ?? "-"}</div>
            <p className="text-xs text-muted-foreground">7天内的事件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已逾期</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats?.overdue_count ?? "-"}</div>
            <p className="text-xs text-muted-foreground">未处理的过期事件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.by_status?.find((s) => s.status === "pending")?.count ?? "-"}
            </div>
            <p className="text-xs text-muted-foreground">等待提醒的事件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats?.by_status?.find((s) => s.status === "completed")?.count ?? "-"}
            </div>
            <p className="text-xs text-muted-foreground">已处理的事件</p>
          </CardContent>
        </Card>
      </div>

      {/* 日历主体区域 */}
      <div className="flex gap-6">
      {/* 视图切换和日历导航 */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={viewMode === "week" ? goToPrevWeek : goToPrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[180px] text-center">
                  {viewMode === "week" ? (
                    <>
                      {weekDays[0].getMonth() + 1}月{weekDays[0].getDate()}日 - {weekDays[6].getMonth() + 1}月{weekDays[6].getDate()}日
                    </>
                  ) : (
                    <>
                      {currentYear}年 {MONTH_NAMES[currentMonth]}
                    </>
                  )}
                </h2>
                <Button variant="outline" size="icon" onClick={viewMode === "week" ? goToNextWeek : goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday}>
                今天
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                <Grid3X3 className="mr-2 h-4 w-4" />
                月视图
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                周视图
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("timeline")}
              >
                <Timer className="mr-2 h-4 w-4" />
                时间线
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="mr-2 h-4 w-4" />
                列表
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                title={showSidebar ? "隐藏即将到来" : "显示即将到来"}
              >
                {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-md" />
              ))}
            </div>
          ) : viewMode === "month" ? (
            /* 月视图 */
            <div className="space-y-2">
              {/* 星期标题 */}
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 日期网格 */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const dateKey = formatDate(date);
                  const events = getEventsForDate(dateKey);
                  const isInCurrentMonth = isCurrentMonth(date, currentYear, currentMonth);
                  const isTodayDate = isToday(date);

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(date)}
                      className={`min-h-24 p-1 border rounded-md cursor-pointer transition-colors ${
                        isInCurrentMonth ? "bg-background" : "bg-muted/30"
                      } ${isTodayDate ? "ring-2 ring-primary" : ""} ${
                        selectedDate === dateKey ? "bg-primary/10" : ""
                      } hover:bg-accent`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isInCurrentMonth ? "" : "text-muted-foreground"
                        } ${isTodayDate ? "text-primary" : ""}`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {events.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(event);
                            }}
                            className="text-xs px-1 py-0.5 rounded truncate"
                            style={{ backgroundColor: event.color + "20", color: event.color }}
                            title={event.event_title}
                          >
                            {event.event_title}
                          </div>
                        ))}
                        {events.length > 3 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{events.length - 3} 更多
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === "week" ? (
            /* 周视图 */
            <div className="space-y-2">
              {/* 星期标题 */}
              <div className="grid grid-cols-8 gap-1">
                <div className="text-center text-sm font-medium text-muted-foreground py-2 w-16">
                  时间
                </div>
                {weekDays.map((date, i) => {
                  const isTodayDate = isToday(date);
                  return (
                    <div
                      key={i}
                      className={`text-center text-sm font-medium py-2 ${
                        isTodayDate ? "text-primary font-bold" : "text-muted-foreground"
                      }`}
                    >
                      <div>{WEEKDAY_NAMES[i]}</div>
                      <div className={`text-lg ${isTodayDate ? "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 时间网格 */}
              <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                {timeSlots.map((slot, slotIndex) => (
                  <div key={slot} className="grid grid-cols-8 gap-px bg-border">
                    <div className="bg-background text-xs text-muted-foreground p-1 w-16 text-right pr-2 sticky left-0">
                      {slot}
                    </div>
                    {weekDays.map((date, dayIndex) => {
                      const dateKey = formatDate(date);
                      const events = getEventsForDate(dateKey).filter((event) => {
                        if (event.all_day) return slotIndex === 0;
                        if (!event.event_time) return slotIndex === 9; // 默认9点
                        const hour = parseInt(event.event_time.split(":")[0], 10);
                        return hour === slotIndex;
                      });

                      return (
                        <div
                          key={dayIndex}
                          onClick={() => handleDateClick(date)}
                          className={`bg-background min-h-[32px] p-0.5 hover:bg-accent/50 cursor-pointer ${
                            isToday(date) ? "bg-primary/5" : ""
                          }`}
                        >
                          {events.map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(event);
                              }}
                              className="text-xs px-1 py-0.5 rounded truncate cursor-pointer"
                              style={{ backgroundColor: event.color + "30", color: event.color, borderLeft: `3px solid ${event.color}` }}
                              title={event.event_title}
                            >
                              {event.event_title}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : viewMode === "timeline" ? (
            /* 时间线视图 */
            <div className="space-y-4">
              {monthData?.events && monthData.events.length > 0 ? (
                <div className="relative">
                  {/* 时间线中轴 */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  
                  {/* 按日期分组 */}
                  {Object.entries(
                    monthData.events.reduce((acc, event) => {
                      const date = event.event_date;
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(event);
                      return acc;
                    }, {} as Record<string, CalendarEvent[]>)
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, events]) => {
                      const dateObj = new Date(date);
                      const isTodayDate = isToday(dateObj);
                      const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <div key={date} className="relative pl-12 pb-6">
                          {/* 日期节点 */}
                          <div
                            className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                              isTodayDate
                                ? "bg-primary border-primary"
                                : isPast
                                ? "bg-muted border-muted-foreground"
                                : "bg-background border-primary"
                            }`}
                          />
                          
                          {/* 日期标题 */}
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`text-sm font-medium ${
                                isTodayDate ? "text-primary" : isPast ? "text-muted-foreground" : ""
                              }`}
                            >
                              {dateObj.getMonth() + 1}月{dateObj.getDate()}日
                              {isTodayDate && <Badge className="ml-2" variant="default">今天</Badge>}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {WEEKDAY_NAMES[dateObj.getDay()]}
                            </span>
                          </div>
                          
                          {/* 事件卡片 */}
                          <div className="space-y-2">
                            {events.map((event) => {
                              const statusConfig = getStatusBadge(event.status);
                              const StatusIcon = statusConfig.icon;
                              
                              return (
                                <div
                                  key={event.id}
                                  onClick={() => openEditDialog(event)}
                                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                                  style={{ borderLeftColor: event.color, borderLeftWidth: "3px" }}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-sm">{event.event_title}</h4>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                        style={{ borderColor: event.color + "80", color: event.color }}
                                      >
                                        {event.event_type_name}
                                      </Badge>
                                    </div>
                                    {event.event_description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                        {event.event_description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                      {event.event_time && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {event.event_time}
                                        </span>
                                      )}
                                      <Badge variant={statusConfig.variant} className="text-xs">
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusConfig.label}
                                      </Badge>
                                      {event.days_remaining >= 0 && event.status === "pending" && !isPast && (
                                        <span
                                          className={`text-xs font-medium ${
                                            event.days_remaining === 0
                                              ? "text-red-500"
                                              : event.days_remaining <= 3
                                              ? "text-amber-500"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {event.days_remaining === 0
                                            ? "今天"
                                            : `${event.days_remaining}天后`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(event); }}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        编辑
                                      </DropdownMenuItem>
                                      {event.status === "pending" && (
                                        <>
                                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkCompleted(event.id); }}>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            标记完成
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkCancelled(event.id); }}>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            取消事件
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        删除
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>本月暂无事件</p>
                  <Button variant="outline" className="mt-4" onClick={() => openCreateDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加第一个事件
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* 列表视图 */
            <div className="space-y-4">
              {monthData?.events && monthData.events.length > 0 ? (
                monthData.events.map((event) => {
                  const statusConfig = getStatusBadge(event.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div
                        className="w-1 h-full min-h-[60px] rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{event.event_title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <CalendarDays className="h-4 w-4" />
                              <span>{event.event_date}</span>
                              {event.event_time && (
                                <>
                                  <Clock className="h-4 w-4 ml-2" />
                                  <span>{event.event_time}</span>
                                </>
                              )}
                            </div>
                            {event.event_description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {event.event_description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" style={{ borderColor: event.color, color: event.color }}>
                              {event.event_type_name}
                            </Badge>
                            <Badge variant={statusConfig.variant}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            {event.days_remaining >= 0 && event.status === "pending" && (
                              <Badge
                                variant={event.days_remaining <= 3 ? "destructive" : "secondary"}
                              >
                                {event.days_remaining === 0 ? "今天" : `${event.days_remaining}天后`}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(event)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          {event.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleMarkCompleted(event.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                标记完成
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkCancelled(event.id)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                取消事件
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>本月暂无事件</p>
                  <Button variant="outline" className="mt-4" onClick={() => openCreateDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加第一个事件
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 即将到来事件侧边栏 */}
      {showSidebar && (
        <Card className="lg:w-80 flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-500" />
              即将到来
            </CardTitle>
            <CardDescription>未来7天内的事件</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => openEditDialog(event)}
                    className="p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{event.event_title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          <span>{event.event_date}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: event.color + "80", color: event.color }}
                          >
                            {event.event_type_name}
                          </Badge>
                          {event.days_remaining >= 0 && (
                            <span
                              className={`text-xs font-medium ${
                                event.days_remaining === 0
                                  ? "text-red-500"
                                  : event.days_remaining <= 3
                                  ? "text-amber-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {event.days_remaining === 0
                                ? "今天"
                                : event.days_remaining === 1
                                ? "明天"
                                : `${event.days_remaining}天后`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length >= 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => setViewMode("list")}
                  >
                    查看全部
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无即将到来的事件</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => openCreateDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加事件
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>

      {/* 创建/编辑事件对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "编辑事件" : "添加事件"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "修改事件信息" : "创建一个新的日历事件"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 事件类型 */}
            <div className="space-y-2">
              <Label>事件类型</Label>
              <Select
                value={formData.event_type}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    event_type: v as CalendarEventType,
                    color: EVENT_TYPE_CONFIG[v as CalendarEventType]?.color,
                  }))
                }
                disabled={!!editingEvent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择事件类型" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        {config.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 事件标题 */}
            <div className="space-y-2">
              <Label>事件标题 *</Label>
              <Input
                value={formData.event_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, event_title: e.target.value }))}
                placeholder="输入事件标题"
              />
            </div>

            {/* 事件描述 */}
            <div className="space-y-2">
              <Label>事件描述</Label>
              <Textarea
                value={formData.event_description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, event_description: e.target.value }))
                }
                placeholder="输入事件描述（可选）"
                rows={3}
              />
            </div>

            {/* 日期和时间 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>事件日期 *</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>事件时间</Label>
                <Input
                  type="time"
                  value={formData.event_time || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, event_time: e.target.value || undefined }))
                  }
                  disabled={formData.all_day}
                />
              </div>
            </div>

            {/* 全天事件 */}
            <div className="flex items-center justify-between">
              <Label htmlFor="all-day">全天事件</Label>
              <Switch
                id="all-day"
                checked={formData.all_day}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, all_day: checked }))
                }
              />
            </div>

            {/* 提醒设置 */}
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder">开启提醒</Label>
              <Switch
                id="reminder"
                checked={formData.reminder_enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, reminder_enabled: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEvent} disabled={!formData.event_title || !formData.event_date}>
              {editingEvent ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
