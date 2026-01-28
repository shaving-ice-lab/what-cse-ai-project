"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ListTodo,
  RefreshCw,
  Search,
  Plus,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Activity,
  Zap,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Skeleton,
  Textarea,
  Switch,
  ScrollArea,
  Progress,
  Separator,
} from "@what-cse/ui";
import {
  aiContentApi,
  AIBatchTask,
  AIContentType,
  AIRelatedType,
  AIBatchTaskStatus,
  CreateAIBatchTaskRequest,
  getContentTypeLabel,
  getRelatedTypeLabel,
  getTaskStatusLabel,
  getTaskStatusColor,
} from "@/services/ai-content-api";
import { toast } from "sonner";

// ============================================
// Stats Cards Component
// ============================================

interface TaskStatsData {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

function StatsCards({
  stats,
  loading,
}: {
  stats: TaskStatsData;
  loading: boolean;
}) {
  const cards = [
    {
      title: "总任务数",
      value: stats.total,
      icon: ListTodo,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "等待中",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "处理中",
      value: stats.processing,
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "已完成",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "失败",
      value: stats.failed,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Create Task Dialog
// ============================================

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAIBatchTaskRequest) => void;
}

function CreateTaskDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateTaskDialogProps) {
  const [formData, setFormData] = useState<CreateAIBatchTaskRequest>({
    task_name: "",
    content_type: "question_analysis",
    related_type: "question",
    target_ids: [],
    priority: 0,
    config: {
      concurrency: 3,
      retry_count: 2,
      skip_existing: true,
      auto_approve: false,
    },
  });
  const [targetIdsText, setTargetIdsText] = useState("");

  const handleSubmit = () => {
    if (!formData.task_name) {
      toast.error("请输入任务名称");
      return;
    }

    // Parse target IDs
    const ids = targetIdsText
      .split(/[,，\s\n]+/)
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    if (ids.length === 0) {
      toast.error("请输入有效的目标 ID");
      return;
    }

    onSubmit({ ...formData, target_ids: ids });
    onOpenChange(false);

    // Reset form
    setFormData({
      task_name: "",
      content_type: "question_analysis",
      related_type: "question",
      target_ids: [],
      priority: 0,
      config: {
        concurrency: 3,
        retry_count: 2,
        skip_existing: true,
        auto_approve: false,
      },
    });
    setTargetIdsText("");
  };

  const contentTypeOptions: { value: AIContentType; label: string; relatedType: AIRelatedType }[] = [
    { value: "question_analysis", label: "题目解析", relatedType: "question" },
    { value: "question_tips", label: "解题技巧", relatedType: "question" },
    { value: "question_similar", label: "相似题目", relatedType: "question" },
    { value: "knowledge_summary", label: "知识点总结", relatedType: "knowledge_point" },
    { value: "knowledge_mindmap", label: "知识点导图", relatedType: "knowledge_point" },
    { value: "knowledge_examples", label: "例题解析", relatedType: "knowledge_point" },
    { value: "chapter_summary", label: "章节总结", relatedType: "chapter" },
    { value: "chapter_keypoints", label: "章节重点", relatedType: "chapter" },
    { value: "chapter_exercises", label: "配套练习", relatedType: "chapter" },
    { value: "course_preview", label: "预习要点", relatedType: "course" },
    { value: "course_review", label: "复习要点", relatedType: "course" },
  ];

  const handleContentTypeChange = (value: AIContentType) => {
    const option = contentTypeOptions.find((o) => o.value === value);
    setFormData({
      ...formData,
      content_type: value,
      related_type: option?.relatedType || "question",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建批量生成任务</DialogTitle>
          <DialogDescription>创建 AI 内容批量生成任务</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 任务名称 */}
          <div className="space-y-2">
            <Label>任务名称 *</Label>
            <Input
              value={formData.task_name}
              onChange={(e) =>
                setFormData({ ...formData, task_name: e.target.value })
              }
              placeholder="例如：2024年行测题目解析生成"
            />
          </div>

          {/* 内容类型 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>生成内容类型 *</Label>
              <Select
                value={formData.content_type}
                onValueChange={(v) => handleContentTypeChange(v as AIContentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>关联类型</Label>
              <Input
                value={getRelatedTypeLabel(formData.related_type)}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* 目标 ID */}
          <div className="space-y-2">
            <Label>
              目标 {getRelatedTypeLabel(formData.related_type)} ID *
            </Label>
            <Textarea
              value={targetIdsText}
              onChange={(e) => setTargetIdsText(e.target.value)}
              placeholder="输入目标 ID，多个 ID 用逗号、空格或换行分隔&#10;例如：1, 2, 3, 4, 5"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              当前已输入{" "}
              {
                targetIdsText
                  .split(/[,，\s\n]+/)
                  .filter((s) => /^\d+$/.test(s.trim())).length
              }{" "}
              个有效 ID
            </p>
          </div>

          {/* 优先级 */}
          <div className="space-y-2">
            <Label>优先级</Label>
            <Select
              value={formData.priority?.toString() || "0"}
              onValueChange={(v) =>
                setFormData({ ...formData, priority: parseInt(v) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">普通</SelectItem>
                <SelectItem value="5">较高</SelectItem>
                <SelectItem value="10">最高</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* 高级配置 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">高级配置</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>并发数</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.config?.concurrency || 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        concurrency: parseInt(e.target.value) || 3,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>重试次数</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={formData.config?.retry_count || 2}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        retry_count: parseInt(e.target.value) || 2,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="skip_existing" className="cursor-pointer">
                跳过已存在的内容
              </Label>
              <Switch
                id="skip_existing"
                checked={formData.config?.skip_existing ?? true}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, skip_existing: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto_approve" className="cursor-pointer">
                自动审核通过
              </Label>
              <Switch
                id="auto_approve"
                checked={formData.config?.auto_approve ?? false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, auto_approve: checked },
                  })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="mr-2 h-4 w-4" />
            创建任务
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Task Detail Dialog
// ============================================

interface TaskDetailDialogProps {
  task: AIBatchTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (id: number) => void;
  onRetry: (id: number) => void;
}

function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onCancel,
  onRetry,
}: TaskDetailDialogProps) {
  if (!task) return null;

  const progress =
    task.total_count > 0
      ? Math.round((task.processed_count / task.total_count) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-blue-500" />
            任务详情
          </DialogTitle>
          <DialogDescription>{task.task_name}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {/* 状态和进度 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={getTaskStatusColor(task.status)}>
                  {getTaskStatusLabel(task.status)}
                </Badge>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">内容类型：</span>
                <span className="ml-2 font-medium">
                  {getContentTypeLabel(task.content_type)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">关联类型：</span>
                <span className="ml-2 font-medium">
                  {getRelatedTypeLabel(task.related_type)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">总数量：</span>
                <span className="ml-2 font-medium">{task.total_count}</span>
              </div>
              <div>
                <span className="text-muted-foreground">已处理：</span>
                <span className="ml-2 font-medium">{task.processed_count}</span>
              </div>
              <div>
                <span className="text-muted-foreground">成功数：</span>
                <span className="ml-2 font-medium text-green-600">
                  {task.success_count}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">失败数：</span>
                <span className="ml-2 font-medium text-red-600">
                  {task.failed_count}
                </span>
              </div>
            </div>

            <Separator />

            {/* 时间信息 */}
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">创建时间：</span>
                <span className="ml-2">
                  {new Date(task.created_at).toLocaleString()}
                </span>
              </div>
              {task.started_at && (
                <div>
                  <span className="text-muted-foreground">开始时间：</span>
                  <span className="ml-2">
                    {new Date(task.started_at).toLocaleString()}
                  </span>
                </div>
              )}
              {task.completed_at && (
                <div>
                  <span className="text-muted-foreground">完成时间：</span>
                  <span className="ml-2">
                    {new Date(task.completed_at).toLocaleString()}
                  </span>
                </div>
              )}
              {task.creator && (
                <div>
                  <span className="text-muted-foreground">创建人：</span>
                  <span className="ml-2">{task.creator.username}</span>
                </div>
              )}
            </div>

            {/* 配置信息 */}
            {task.config && (
              <>
                <Separator />
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">任务配置</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">并发数：</span>
                      <span className="ml-2">{task.config.concurrency || 3}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">重试次数：</span>
                      <span className="ml-2">{task.config.retry_count || 2}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">跳过已存在：</span>
                      <span className="ml-2">
                        {task.config.skip_existing ? "是" : "否"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">自动审核：</span>
                      <span className="ml-2">
                        {task.config.auto_approve ? "是" : "否"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 错误日志 */}
            {task.error_log && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-600">错误日志</h4>
                  <pre className="text-xs bg-red-50 text-red-700 p-3 rounded-md overflow-auto max-h-40">
                    {task.error_log}
                  </pre>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          {(task.status === "pending" || task.status === "processing") && (
            <Button
              variant="destructive"
              onClick={() => {
                onCancel(task.id);
                onOpenChange(false);
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              取消任务
            </Button>
          )}
          {task.status === "failed" && (
            <Button
              onClick={() => {
                onRetry(task.id);
                onOpenChange(false);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              重试任务
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function AITaskManagementPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<AIBatchTask[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Stats
  const [stats, setStats] = useState<TaskStatsData>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<AIBatchTaskStatus | "all">("all");
  const [contentTypeFilter, setContentTypeFilter] = useState<AIContentType | "all">("all");

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<AIBatchTask | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiContentApi.getTasks({
        page,
        page_size: pageSize,
        content_type: contentTypeFilter !== "all" ? contentTypeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      setTasks(res.tasks || []);
      setTotal(res.total || 0);

      // Calculate stats from current data
      const all = res.tasks || [];
      setStats({
        total: res.total,
        pending: all.filter((t) => t.status === "pending").length,
        processing: all.filter((t) => t.status === "processing").length,
        completed: all.filter((t) => t.status === "completed").length,
        failed: all.filter((t) => t.status === "failed").length,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, contentTypeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh for processing tasks
  useEffect(() => {
    const hasProcessing = tasks.some((t) => t.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [tasks, fetchData]);

  // Create task
  const handleCreateTask = async (data: CreateAIBatchTaskRequest) => {
    try {
      await aiContentApi.createTask(data);
      toast.success("任务已创建");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "创建任务失败");
    }
  };

  // Cancel task
  const handleCancelTask = async (id: number) => {
    if (!confirm("确定要取消该任务吗？")) return;
    try {
      await aiContentApi.cancelTask(id);
      toast.success("任务已取消");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  // Retry task
  const handleRetryTask = async (id: number) => {
    try {
      await aiContentApi.retryTask(id);
      toast.success("任务已重新开始");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const contentTypeOptions: { value: AIContentType; label: string }[] = [
    { value: "question_analysis", label: "题目解析" },
    { value: "question_tips", label: "解题技巧" },
    { value: "question_similar", label: "相似题目" },
    { value: "knowledge_summary", label: "知识点总结" },
    { value: "knowledge_mindmap", label: "知识点导图" },
    { value: "chapter_summary", label: "章节总结" },
    { value: "course_preview", label: "预习要点" },
    { value: "course_review", label: "复习要点" },
  ];

  const getStatusIcon = (status: AIBatchTaskStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-blue-500" />
            AI 生成任务
          </h1>
          <p className="text-muted-foreground">管理 AI 内容批量生成任务</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            创建任务
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <StatsCards stats={stats} loading={loading} />

      {/* 任务列表 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>任务列表</CardTitle>
                <CardDescription>共 {total} 个生成任务</CardDescription>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as AIBatchTaskStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">等待中</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={contentTypeFilter}
                onValueChange={(v) => {
                  setContentTypeFilter(v as AIContentType | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="内容类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {contentTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无生成任务</p>
              <p className="text-sm">点击"创建任务"开始批量生成</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead className="min-w-[200px]">任务名称</TableHead>
                      <TableHead>内容类型</TableHead>
                      <TableHead>进度</TableHead>
                      <TableHead>成功/失败</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => {
                      const progress =
                        task.total_count > 0
                          ? Math.round(
                              (task.processed_count / task.total_count) * 100
                            )
                          : 0;

                      return (
                        <TableRow key={task.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{task.id}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{task.task_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {getRelatedTypeLabel(task.related_type)} ×{" "}
                                {task.total_count}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getContentTypeLabel(task.content_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 w-24">
                              <div className="flex justify-between text-xs">
                                <span>{task.processed_count}/{task.total_count}</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-600">
                                {task.success_count}
                              </span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-red-600">
                                {task.failed_count}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <Badge variant={getTaskStatusColor(task.status)}>
                                {getTaskStatusLabel(task.status)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(task.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDetailTask(task);
                                    setDetailDialogOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  查看详情
                                </DropdownMenuItem>
                                {task.status === "failed" && (
                                  <DropdownMenuItem
                                    onClick={() => handleRetryTask(task.id)}
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    重试
                                  </DropdownMenuItem>
                                )}
                                {(task.status === "pending" ||
                                  task.status === "processing") && (
                                  <DropdownMenuItem
                                    onClick={() => handleCancelTask(task.id)}
                                    className="text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    取消
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    第 {page} 页 / 共 {totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 创建任务对话框 */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateTask}
      />

      {/* 任务详情对话框 */}
      <TaskDetailDialog
        task={detailTask}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onCancel={handleCancelTask}
        onRetry={handleRetryTask}
      />
    </div>
  );
}
