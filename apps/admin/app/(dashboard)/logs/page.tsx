"use client";

import { useState } from "react";
import {
  Search,
  RefreshCw,
  Download,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
} from "@what-cse/ui";

interface LogEntry {
  id: number;
  level: "info" | "warning" | "error";
  message: string;
  source: string;
  timestamp: string;
}

const mockLogs: LogEntry[] = [
  {
    id: 1,
    level: "info",
    message: "用户 user123 登录成功",
    source: "auth",
    timestamp: "2024-12-20 14:30:25",
  },
  {
    id: 2,
    level: "warning",
    message: "爬虫任务执行超时",
    source: "crawler",
    timestamp: "2024-12-20 14:28:10",
  },
  {
    id: 3,
    level: "error",
    message: "数据库连接失败",
    source: "database",
    timestamp: "2024-12-20 14:25:00",
  },
  {
    id: 4,
    level: "info",
    message: "公告 ID:123 发布成功",
    source: "announcement",
    timestamp: "2024-12-20 14:20:15",
  },
  {
    id: 5,
    level: "info",
    message: "职位数据同步完成，共 3245 条",
    source: "sync",
    timestamp: "2024-12-20 14:15:00",
  },
  {
    id: 6,
    level: "warning",
    message: "API 请求频率过高",
    source: "api",
    timestamp: "2024-12-20 14:10:30",
  },
  {
    id: 7,
    level: "error",
    message: "邮件发送失败：SMTP 连接超时",
    source: "email",
    timestamp: "2024-12-20 14:05:22",
  },
  {
    id: 8,
    level: "info",
    message: "系统备份完成",
    source: "system",
    timestamp: "2024-12-20 14:00:00",
  },
];

export default function LogsPage() {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "info":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            INFO
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            WARN
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            ERROR
          </Badge>
        );
      default:
        return <Badge variant="outline">{level.toUpperCase()}</Badge>;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const infoCount = logs.filter((l) => l.level === "info").length;
  const warningCount = logs.filter((l) => l.level === "warning").length;
  const errorCount = logs.filter((l) => l.level === "error").length;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">系统日志</h1>
          <p className="text-muted-foreground">查看和分析系统运行日志</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总日志数</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">信息</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">警告</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">错误</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* 日志列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>日志记录</CardTitle>
              <CardDescription>系统运行和操作日志</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索日志..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  <SelectItem value="info">信息</SelectItem>
                  <SelectItem value="warning">警告</SelectItem>
                  <SelectItem value="error">错误</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium leading-relaxed">{log.message}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {getLevelBadge(log.level)}
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {log.timestamp}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  没有找到匹配的日志
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
