"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
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
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@what-cse/ui";
import { cn } from "@what-cse/ui";
import {
  ContentTask,
  TaskStatus,
  getTaskStatusLabel,
  getTaskTypeLabel,
  getTaskStatusColor,
  getTaskKey,
} from "@/services/content-generator-api";

interface TaskHistoryPanelProps {
  tasks: ContentTask[];
  tasksTotal: number;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    processing: <Loader2 className="h-3 w-3 animate-spin" />,
    generating: <Loader2 className="h-3 w-3 animate-spin" />,
    completed: <CheckCircle className="h-3 w-3" />,
    failed: <XCircle className="h-3 w-3" />,
  };
  return (
    <Badge className={cn(getTaskStatusColor(status), "gap-1")}>
      {icons[status]}
      {getTaskStatusLabel(status)}
    </Badge>
  );
}

export function TaskHistoryPanel({
  tasks,
  tasksTotal,
  loading,
  page,
  onPageChange,
  onRefresh,
}: TaskHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "processing" | "generating" | "completed" | "failed"
  >("all");
  const [filterKeyword, setFilterKeyword] = useState("");

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== "all") {
      if (filterStatus === "processing" && t.status !== "processing" && t.status !== "generating") return false;
      if (filterStatus !== "processing" && t.status !== filterStatus) return false;
    }
    if (filterKeyword && !(t.template_name ?? "").toLowerCase().includes(filterKeyword.toLowerCase())) return false;
    return true;
  });

  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(tasksTotal / pageSize));

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    processing: tasks.filter((t) => t.status === "processing" || t.status === "generating").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex-shrink-0 border-t bg-muted/30">
        {/* Header - Always visible */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                )}
                <Activity className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">任务历史</span>
              </div>
              
              {/* Quick stats */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {taskStats.completed}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  {taskStats.processing}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  {taskStats.pending}
                </span>
                {taskStats.failed > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {taskStats.failed}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              disabled={loading}
              className="h-7 px-2"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </Button>
          </div>
        </CollapsibleTrigger>

        {/* Collapsible Content */}
        <CollapsibleContent>
          <div className="border-t">
            {/* Filter Row */}
            {tasks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-background">
                <div className="relative flex-1 min-w-[120px] max-w-[200px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="搜索任务..."
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    className="h-7 text-xs pl-7"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(v: typeof filterStatus) => setFilterStatus(v)}>
                  <SelectTrigger className="w-[90px] h-7 text-xs">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">全部状态</SelectItem>
                    <SelectItem value="completed" className="text-xs">已完成</SelectItem>
                    <SelectItem value="processing" className="text-xs">处理中</SelectItem>
                    <SelectItem value="pending" className="text-xs">待处理</SelectItem>
                    <SelectItem value="failed" className="text-xs">失败</SelectItem>
                  </SelectContent>
                </Select>
                {(filterKeyword || filterStatus !== "all") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setFilterKeyword("");
                      setFilterStatus("all");
                    }}
                    className="h-7 text-xs px-2"
                  >
                    清除
                  </Button>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {filteredTasks.length}/{tasks.length} 条
                </span>
              </div>
            )}

            {/* Task List */}
            <div className="h-[180px]">
              {filteredTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-xs">加载中...</p>
                    </>
                  ) : tasks.length === 0 ? (
                    <>
                      <Activity className="h-6 w-6 text-muted-foreground/30" />
                      <p className="text-xs">暂无任务记录</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 text-muted-foreground/30" />
                      <p className="text-xs">没有匹配的任务</p>
                    </>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/80 z-10">
                      <TableRow className="hover:bg-transparent border-b">
                        <TableHead className="w-20 py-1.5 px-3 text-[10px] font-medium">状态</TableHead>
                        <TableHead className="py-1.5 px-3 text-[10px] font-medium">任务名称</TableHead>
                        <TableHead className="w-16 py-1.5 px-3 text-[10px] font-medium">类型</TableHead>
                        <TableHead className="w-20 py-1.5 px-3 text-[10px] font-medium">进度</TableHead>
                        <TableHead className="w-14 py-1.5 px-3 text-[10px] font-medium">时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow
                          key={getTaskKey(task)}
                          className={cn(
                            "transition-colors border-b border-border/50",
                            task.status === "completed"
                              ? "bg-emerald-50/30 hover:bg-emerald-50/50 dark:bg-emerald-950/10"
                              : task.status === "processing" || task.status === "generating"
                                ? "bg-violet-50/30 hover:bg-violet-50/50 dark:bg-violet-950/10"
                                : task.status === "failed"
                                  ? "bg-red-50/30 hover:bg-red-50/50 dark:bg-red-950/10"
                                  : "hover:bg-muted/50"
                          )}
                        >
                          <TableCell className="py-1.5 px-3">
                            <TaskStatusBadge status={task.status} />
                          </TableCell>
                          <TableCell className="py-1.5 px-3">
                            <span className="text-xs line-clamp-1">
                              {task.template_name ?? `任务 #${task.id}`}
                            </span>
                          </TableCell>
                          <TableCell className="py-1.5 px-3">
                            <span className="text-[10px] text-muted-foreground">
                              {getTaskTypeLabel(task.task_type)}
                            </span>
                          </TableCell>
                          <TableCell className="py-1.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    task.status === "completed"
                                      ? "bg-emerald-500"
                                      : task.status === "failed"
                                        ? "bg-red-500"
                                        : "bg-violet-500"
                                  )}
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-8 text-right">
                                {task.progress}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 px-3 text-[10px] text-muted-foreground font-mono">
                            {new Date(task.created_at).toLocaleTimeString("zh-CN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-4 py-2 border-t bg-background">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="h-6 text-xs px-2"
                >
                  上一页
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page}/{totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="h-6 text-xs px-2"
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
