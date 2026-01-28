"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Database,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  Info,
  ArrowRight,
  FileText,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  ScrollArea,
} from "@what-cse/ui";
import { migrateApi, MigrationState, MigrationStats, MigrationLogEntry } from "@/services/api";

export default function MigratePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [state, setState] = useState<MigrationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch stats and status
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, statusRes] = await Promise.all([
        migrateApi.getStats(),
        migrateApi.getStatus(),
      ]);
      setStats(statsRes);
      setState(statusRes);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "获取数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling when migration is running
  useEffect(() => {
    if (state?.status === "running") {
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await migrateApi.getStatus();
          setState(statusRes);
          
          // Update stats too
          const statsRes = await migrateApi.getStats();
          setStats(statsRes);
          
          // Stop polling if migration is done
          if (statusRes.status !== "running") {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
          }
        } catch (err) {
          console.error("Failed to poll status:", err);
        }
      }, 2000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [state?.status]);

  // Start migration
  const handleStart = async () => {
    try {
      setError(null);
      const result = await migrateApi.startMigration();
      setState(result);
    } catch (err: any) {
      setError(err?.message || "启动迁移失败");
    }
  };

  // Stop migration
  const handleStop = async () => {
    try {
      await migrateApi.stopMigration();
      const statusRes = await migrateApi.getStatus();
      setState(statusRes);
    } catch (err: any) {
      setError(err?.message || "停止迁移失败");
    }
  };

  // Get status badge
  const getStatusBadge = (status: MigrationState["status"]) => {
    switch (status) {
      case "idle":
        return <Badge variant="secondary">空闲</Badge>;
      case "running":
        return <Badge className="bg-blue-500 text-white">运行中</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500 text-white">已完成</Badge>;
      case "failed":
        return <Badge variant="destructive">失败</Badge>;
      case "stopped":
        return <Badge className="bg-orange-500 text-white">已停止</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  // Get log level icon
  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      case "warn":
        return <AlertCircle className="h-3.5 w-3.5 text-orange-500" />;
      default:
        return <Info className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  // Calculate progress percentage
  const getProgress = () => {
    if (!state || state.total_tasks === 0) return 0;
    return Math.round((state.processed_tasks / state.total_tasks) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
          <p className="text-muted-foreground text-sm">正在加载数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            数据迁移
          </h1>
          <p className="text-muted-foreground mt-1">
            将粉笔解析任务中的职位数据迁移到职位表
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={state?.status === "running"}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              已完成解析任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completed_tasks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              共 {stats?.total_parse_tasks || 0} 个任务
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              预估可迁移职位
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ~{stats?.estimated_positions?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              数据库已有 {stats?.positions_in_db?.toLocaleString() || 0} 个职位
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              本次迁移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {state?.created_count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              新建职位 / 更新 {state?.updated_count || 0} / 重复 {state?.duplicate_count || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              迁移状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusBadge(state?.status || "idle")}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {state?.status === "running" ? (
                <>处理中: {state?.processed_tasks || 0} / {state?.total_tasks || 0}</>
              ) : state?.completed_at ? (
                <>完成于: {new Date(state.completed_at).toLocaleString("zh-CN")}</>
              ) : (
                "点击开始迁移"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Migration Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            迁移控制
          </CardTitle>
          <CardDescription>
            从已完成的粉笔解析任务中提取职位数据，标准化后写入职位表
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {state?.status === "running" && state?.total_tasks > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">迁移进度</span>
                <span className="font-medium">{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>已处理 {state?.processed_tasks} / {state?.total_tasks} 个任务</span>
                <span>
                  成功: {state?.successful_tasks} | 失败: {state?.failed_tasks} | 跳过: {state?.skipped_tasks}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {state?.status === "running" ? (
              <Button variant="destructive" onClick={handleStop}>
                <Square className="h-4 w-4 mr-2" />
                停止迁移
              </Button>
            ) : (
              <Button onClick={handleStart} disabled={!stats?.completed_tasks}>
                <Play className="h-4 w-4 mr-2" />
                开始迁移
              </Button>
            )}

            {state?.status === "running" && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在处理...
              </div>
            )}
          </div>

          {/* Migration Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <div className="font-medium">迁移说明：</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>迁移会读取所有已完成的粉笔解析任务中的职位数据</li>
              <li>自动进行数据清洗和标准化处理（学历、政治面貌、省市区等）</li>
              <li>根据职位代码和名称进行去重，避免重复数据</li>
              <li>新职位默认状态为"待审核"，需要在职位管理页面审核发布</li>
              <li>迁移过程可随时停止，已处理的数据会保留</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Migration Logs */}
      {state?.logs && state.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              迁移日志
              <Badge variant="secondary" className="ml-2">
                {state.logs.length} 条
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {state.logs.slice(-100).reverse().map((log, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded text-sm ${
                      log.level === "error"
                        ? "bg-red-50 dark:bg-red-950/20"
                        : log.level === "warn"
                        ? "bg-orange-50 dark:bg-orange-950/20"
                        : "bg-muted/30"
                    }`}
                  >
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.time).toLocaleTimeString("zh-CN")}
                        </span>
                        {log.task_id && (
                          <Badge variant="outline" className="text-xs">
                            任务 #{log.task_id}
                          </Badge>
                        )}
                      </div>
                      <p className={`mt-0.5 ${
                        log.level === "error" ? "text-red-700 dark:text-red-300" : ""
                      }`}>
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Last Error */}
      {state?.last_error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              错误信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300">{state.last_error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
