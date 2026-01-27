"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Database,
  Clock,
  Activity,
  AlertTriangle,
  List,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@what-cse/ui";
import { adminApi, CrawlTask, CrawlerStats } from "@/services/api";

// Spider types
const SPIDER_TYPES = [
  { id: "list_monitor", name: "列表页监控", description: "监控已知列表页的更新" },
  { id: "announcement", name: "公告爬取", description: "抓取公告详情页" },
  { id: "positions", name: "职位提取", description: "解析职位表数据" },
];

export default function CrawlersPage() {
  const [tasks, setTasks] = useState<CrawlTask[]>([]);
  const [stats, setStats] = useState<CrawlerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CrawlTask | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        adminApi.getCrawlTasks({ page: 1, page_size: 20 }),
        adminApi.getCrawlerStatistics(),
      ]);
      setTasks((tasksRes as any).tasks || []);
      setStats(statsRes as CrawlerStats);
    } catch (error) {
      console.error("Failed to fetch crawler data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleTrigger = async (spiderType: string) => {
    setTriggering(spiderType);
    try {
      await adminApi.triggerCrawler({ spider_type: spiderType });
      // Refresh data after triggering
      await fetchData();
    } catch (error) {
      console.error("Failed to trigger crawler:", error);
    } finally {
      setTriggering(null);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      await adminApi.cancelCrawlTask(taskId);
      await fetchData();
    } catch (error) {
      console.error("Failed to cancel task:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">运行中</Badge>;
      case "completed":
        return <Badge>已完成</Badge>;
      case "failed":
        return <Badge variant="destructive">失败</Badge>;
      case "cancelled":
        return <Badge variant="secondary">已取消</Badge>;
      default:
        return <Badge variant="outline">等待中</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  const getTaskTypeName = (type: string) => {
    const spider = SPIDER_TYPES.find((s) => s.id === type);
    return spider?.name || type;
  };

  // Calculate stats
  const runningCount = stats?.tasks?.running_count || 0;
  const totalTasks = stats?.tasks?.total || 0;
  const totalListPages = stats?.list_pages?.total || 0;
  const activeListPages = stats?.list_pages?.by_status?.active || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">爬虫管理</h1>
          <p className="text-muted-foreground">管理数据采集任务</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Play className="mr-2 h-4 w-4" />
                运行爬虫
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>选择爬虫类型</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SPIDER_TYPES.map((spider) => (
                <DropdownMenuItem
                  key={spider.id}
                  onClick={() => handleTrigger(spider.id)}
                  disabled={triggering !== null}
                >
                  {triggering === spider.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  <div>
                    <div>{spider.name}</div>
                    <div className="text-xs text-muted-foreground">{spider.description}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总任务数</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行中</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{runningCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">监控列表页</CardTitle>
            <List className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeListPages}</div>
            <p className="text-xs text-muted-foreground">共 {totalListPages} 个</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">失败任务</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.tasks?.by_status?.failed || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>最近任务</CardTitle>
          <CardDescription>最近的数据采集任务记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任务名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="hidden md:table-cell">开始时间</TableHead>
                  <TableHead className="hidden lg:table-cell">进度</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      暂无任务记录
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium">{task.task_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getTaskTypeName(task.task_type)}
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(task.started_at || task.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(task.progress)}%
                          </span>
                        </div>
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
                            <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                              <FileText className="mr-2 h-4 w-4" />
                              查看详情
                            </DropdownMenuItem>
                            {task.status === "running" || task.status === "pending" ? (
                              <DropdownMenuItem
                                onClick={() => handleCancelTask(task.task_id)}
                                className="text-red-600"
                              >
                                <Pause className="mr-2 h-4 w-4" />
                                取消任务
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>任务详情</DialogTitle>
            <DialogDescription>任务ID: {selectedTask?.task_id}</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">任务名称</div>
                  <div className="font-medium">{selectedTask.task_name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">状态</div>
                  <div>{getStatusBadge(selectedTask.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">开始时间</div>
                  <div>{formatDate(selectedTask.started_at)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">完成时间</div>
                  <div>{formatDate(selectedTask.completed_at)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">抓取数量</div>
                  <div>{selectedTask.items_scraped}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">保存数量</div>
                  <div>{selectedTask.items_saved}</div>
                </div>
              </div>
              {selectedTask.error_message && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">错误信息</div>
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {selectedTask.error_message}
                  </div>
                </div>
              )}
              {selectedTask.result && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">结果</div>
                  <pre className="p-3 bg-muted rounded-md text-sm overflow-auto max-h-48">
                    {JSON.stringify(selectedTask.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
