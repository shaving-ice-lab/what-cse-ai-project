"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Badge,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@what-cse/ui";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  Zap,
  Loader2,
  Users,
  Eye,
  Sparkles,
  Calendar,
  Briefcase,
  MapPin,
  UserCheck,
  ArrowRight,
  Timer,
  Paperclip,
  Link2,
  Copy,
  Check,
  ChevronRight,
  Activity,
  X,
} from "lucide-react";
import { type ParseURLResult } from "@/services/api";

// 类型定义
type TaskStep = {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  message?: string;
  startTime?: Date;
  endTime?: Date;
  data?: any;
};

type TaskItem = {
  id: number;
  fenbi_announcement_id?: number;
  fenbi_id?: string;
  title: string;
  fenbiUrl?: string;
  status: "pending" | "running" | "parsing" | "completed" | "failed" | "skipped";
  message?: string;
  parseResult?: ParseURLResult;
  startTime?: string;
  endTime?: string;
  steps?: TaskStep[];
  isFromDB?: boolean;
};

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskItem | null;
}

// 状态配置
const statusConfig = {
  completed: {
    label: "完成",
    gradient: "from-emerald-500 to-green-600",
    bg: "bg-emerald-500",
    light: "bg-emerald-50 dark:bg-emerald-950/50",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle,
  },
  parsing: {
    label: "解析中",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500",
    light: "bg-violet-50 dark:bg-violet-950/50",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-600 dark:text-violet-400",
    icon: Loader2,
    animate: true,
  },
  pending: {
    label: "待处理",
    gradient: "from-slate-400 to-slate-500",
    bg: "bg-slate-400",
    light: "bg-slate-50 dark:bg-slate-900/50",
    border: "border-slate-200 dark:border-slate-700",
    text: "text-slate-600 dark:text-slate-400",
    icon: Clock,
  },
  running: {
    label: "执行中",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-500",
    light: "bg-blue-50 dark:bg-blue-950/50",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-400",
    icon: Loader2,
    animate: true,
  },
  failed: {
    label: "失败",
    gradient: "from-red-500 to-rose-600",
    bg: "bg-red-500",
    light: "bg-red-50 dark:bg-red-950/50",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-600 dark:text-red-400",
    icon: XCircle,
  },
  skipped: {
    label: "已跳过",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500",
    light: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-600 dark:text-amber-400",
    icon: AlertCircle,
  },
};

// 复制按钮
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded hover:bg-muted/80 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </button>
  );
}

export function TaskDetailDialog({ open, onOpenChange, task }: TaskDetailDialogProps) {
  const stats = useMemo(() => {
    if (!task) return null;
    const steps = task.steps || [];
    const totalTime = steps.reduce((acc, s) => acc + (s.data?.duration_ms || 0), 0);
    const successCount = steps.filter((s) => s.status === "completed").length;
    const failedCount = steps.filter((s) => s.status === "failed").length;
    let durationMs = 0;
    if (task.startTime && task.endTime) {
      durationMs = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
    } else if (totalTime > 0) {
      durationMs = totalTime;
    }
    return { totalTime, durationMs, successCount, failedCount, totalSteps: steps.length };
  }, [task]);

  if (!task) return null;

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;
  const hasParseResult = task.parseResult?.data;
  const llm = task.parseResult?.data?.llm_analysis;
  const attachments = task.parseResult?.data?.attachments || [];
  const positions = llm?.positions || [];

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] h-[90vh] p-0 flex flex-col overflow-hidden gap-0" hideCloseButton>
        <DialogTitle className="sr-only">任务详情</DialogTitle>

        {/* ===== 顶部标题栏 ===== */}
        <div className={`flex-shrink-0 relative overflow-hidden`}>
          {/* 渐变背景 */}
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10`} />
          
          <div className="relative px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              {/* 左侧：状态图标 + 标题 */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-lg flex-shrink-0`}>
                  <StatusIcon className={`h-5 w-5 ${config.animate ? "animate-spin" : ""}`} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 className="text-lg font-bold leading-tight line-clamp-2 pr-4">
                    {task.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span>任务ID: <code className="font-mono text-foreground">{task.id}</code></span>
                    <span>·</span>
                    {task.startTime && (
                      <span>开始: {new Date(task.startTime).toLocaleTimeString("zh-CN")}</span>
                    )}
                    {task.endTime && (
                      <>
                        <span>·</span>
                        <span>结束: {new Date(task.endTime).toLocaleTimeString("zh-CN")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 右侧：状态指标 */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* 状态Badge */}
                <Badge className={`${config.bg} text-white px-3 py-1 text-sm font-semibold`}>
                  {config.label}
                </Badge>
                {/* 耗时 */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span className="font-mono font-semibold text-foreground">
                    {stats?.durationMs ? formatDuration(stats.durationMs) : "--"}
                  </span>
                </div>
                {/* 成功率 */}
                {stats && stats.totalSteps > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-foreground">
                      {stats.successCount}/{stats.totalSteps}
                    </span>
                  </div>
                )}
                {/* 关闭按钮 */}
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 链接栏 ===== */}
        <div className="flex-shrink-0 px-6 py-2.5 bg-muted/40 border-y flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link2 className="h-4 w-4" />
            <span>粉笔链接:</span>
          </div>
          {task.fenbiUrl ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <a
                href={task.fenbiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {task.fenbiUrl}
              </a>
              <CopyBtn text={task.fenbiUrl} />
              <a href={task.fenbiUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-muted/80">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </div>
          ) : (
            <span className="text-muted-foreground">无链接</span>
          )}
          {task.parseResult?.data?.final_url && task.parseResult.data.final_url !== task.fenbiUrl && (
            <div className="flex items-center gap-2 ml-auto text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <a
                href={task.parseResult.data.final_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline flex items-center gap-1"
              >
                最终链接
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* ===== 主内容区 - 左右分栏 ===== */}
        <div className="flex-1 min-h-0 flex overflow-hidden border-b">
          {/* 左侧：执行流程 */}
          <div className="w-[280px] flex-shrink-0 border-r flex flex-col bg-muted/20">
            <div className="flex-shrink-0 h-[49px] px-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-600" />
                <span className="font-semibold">执行流程</span>
              </div>
              {stats && stats.totalSteps > 0 && (
                <Badge variant="secondary" className="font-mono">
                  {stats.totalSteps} 步
                </Badge>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {task.steps && task.steps.length > 0 ? (
                  task.steps.map((step, idx) => {
                    const isCompleted = step.status === "completed";
                    const isFailed = step.status === "failed";
                    const isRunning = step.status === "running";
                    return (
                      <div
                        key={idx}
                        className={`
                          p-3 rounded-lg border transition-all
                          ${isCompleted ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" :
                            isFailed ? "bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-800" :
                            isRunning ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-400/50" :
                            "bg-muted/50 border-muted"}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${isCompleted ? "bg-emerald-500 text-white" :
                              isFailed ? "bg-red-500 text-white" :
                              isRunning ? "bg-blue-500 text-white" :
                              "bg-muted-foreground/20 text-muted-foreground"}
                          `}>
                            {isRunning ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isCompleted ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : isFailed ? (
                              <XCircle className="h-3.5 w-3.5" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span className="font-medium text-sm flex-1 truncate">{step.name}</span>
                          {step.data?.duration_ms !== undefined && (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {step.data.duration_ms}ms
                            </span>
                          )}
                        </div>
                        {step.message && (
                          <p className={`text-xs mt-1.5 pl-8 ${isFailed ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                            {step.message}
                          </p>
                        )}
                        {step.data?.details && (
                          <details className="mt-1.5 pl-8">
                            <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                              <ChevronRight className="h-3 w-3" />
                              详情
                            </summary>
                            <pre className="mt-1 text-[11px] bg-background p-2 rounded overflow-auto max-h-20 whitespace-pre-wrap border">
                              {step.data.details}
                            </pre>
                          </details>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">{task.status === "pending" ? "等待执行" : "暂无步骤"}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            {/* 底部统计 */}
            {stats && stats.totalSteps > 0 && (
              <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/30 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">总耗时</span>
                  <span className="font-mono font-semibold">{formatDuration(stats.totalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">成功</span>
                  <span className={`font-semibold ${stats.failedCount ? "text-amber-600" : "text-emerald-600"}`}>
                    {stats.successCount}/{stats.totalSteps}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：解析结果 */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {hasParseResult ? (
              <Tabs defaultValue="ai" className="flex-1 flex flex-col min-h-0">
                {/* Tab 导航 */}
                <div className="flex-shrink-0 h-[49px] px-4 border-b bg-muted/20 flex items-center">
                  <TabsList className="h-9 p-1 bg-muted/60 rounded-lg gap-1">
                    <TabsTrigger value="ai" className="h-7 px-3 text-sm rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
                      AI 分析
                    </TabsTrigger>
                    <TabsTrigger value="content" className="h-7 px-3 text-sm rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                      <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                      内容
                    </TabsTrigger>
                    <TabsTrigger value="positions" className="h-7 px-3 text-sm rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                      <Users className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                      岗位
                      {positions.length > 0 && (
                        <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{positions.length}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="attachments" className="h-7 px-3 text-sm rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                      <Paperclip className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                      附件
                      {attachments.length > 0 && (
                        <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{attachments.length}</Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* AI 分析 Tab */}
                <TabsContent value="ai" className="flex-1 min-h-0 m-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-5 space-y-4">
                      {llm ? (
                        llm.error ? (
                          <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                              <XCircle className="h-5 w-5" />
                              <span className="font-semibold">AI 分析失败</span>
                            </div>
                            <p className="mt-2 text-sm text-red-600/80 dark:text-red-400/80">{llm.error}</p>
                          </div>
                        ) : (
                          <>
                            {/* 公告摘要 */}
                            {llm.summary && (
                              <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50/50 dark:from-violet-950/50 dark:to-purple-950/30 rounded-xl border border-violet-200/60 dark:border-violet-800/60">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                    <Sparkles className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="font-semibold text-violet-700 dark:text-violet-300">公告摘要</span>
                                </div>
                                <p className="text-sm leading-relaxed text-violet-900/90 dark:text-violet-100/90">
                                  {llm.summary}
                                </p>
                              </div>
                            )}

                            {/* 考试信息 */}
                            {llm.exam_info && (llm.exam_info.exam_type || llm.exam_info.registration_start || llm.exam_info.registration_end) && (
                              <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border">
                                <div className="flex items-center gap-2 mb-4">
                                  <Calendar className="h-4 w-4 text-slate-600" />
                                  <span className="font-semibold">考试信息</span>
                                </div>
                                <div className="space-y-3">
                                  {llm.exam_info.exam_type && (
                                    <Badge className="bg-indigo-600 text-white text-sm px-3 py-1">
                                      {llm.exam_info.exam_type}
                                    </Badge>
                                  )}
                                  <div className="grid grid-cols-2 gap-3">
                                    {llm.exam_info.registration_start && (
                                      <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                                        <div className="text-xs text-muted-foreground mb-1">报名开始</div>
                                        <div className="font-semibold">{llm.exam_info.registration_start}</div>
                                      </div>
                                    )}
                                    {llm.exam_info.registration_end && (
                                      <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                                        <div className="text-xs text-red-600 dark:text-red-400 mb-1">报名截止</div>
                                        <div className="font-semibold text-red-600 dark:text-red-400">{llm.exam_info.registration_end}</div>
                                      </div>
                                    )}
                                    {llm.exam_info.exam_date && (
                                      <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border col-span-2">
                                        <div className="text-xs text-muted-foreground mb-1">考试时间</div>
                                        <div className="font-semibold">{llm.exam_info.exam_date}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 招录职位概览 */}
                            {positions.length > 0 && (
                              <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-emerald-600" />
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">招录职位</span>
                                  </div>
                                  <Badge className="bg-emerald-600 text-white">{positions.length} 个</Badge>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-auto">
                                  {positions.slice(0, 5).map((pos, idx) => (
                                    <div key={idx} className="p-3 bg-white dark:bg-slate-800 rounded-lg border flex items-center justify-between">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold flex-shrink-0">
                                          {idx + 1}
                                        </div>
                                        <span className="text-sm font-medium truncate">{pos.position_name || "未知职位"}</span>
                                        {pos.department_name && (
                                          <Badge variant="outline" className="text-[10px] h-5 ml-1 truncate max-w-[120px]">
                                            {pos.department_name}
                                          </Badge>
                                        )}
                                      </div>
                                      {pos.recruit_count && (
                                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 flex-shrink-0">
                                          招 {pos.recruit_count} 人
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                  {positions.length > 5 && (
                                    <p className="text-xs text-center text-muted-foreground pt-2">
                                      还有 {positions.length - 5} 个职位，切换到"岗位"标签查看全部
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 置信度 */}
                            <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">分析置信度</span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      (llm.confidence || 0) >= 80 ? "bg-emerald-500" :
                                      (llm.confidence || 0) >= 60 ? "bg-amber-500" : "bg-red-500"
                                    }`}
                                    style={{ width: `${llm.confidence || 0}%` }}
                                  />
                                </div>
                                <span className="text-lg font-bold w-12 text-right">{llm.confidence || 0}%</span>
                              </div>
                            </div>

                            {/* LLM 原始响应 */}
                            {llm.raw_response && (
                              <details className="group">
                                <summary className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground py-2">
                                  <Eye className="h-3.5 w-3.5" />
                                  查看 LLM 原始响应
                                </summary>
                                <div className="mt-2 p-3 bg-muted rounded-lg max-h-40 overflow-auto">
                                  <pre className="text-xs whitespace-pre-wrap font-mono">{llm.raw_response}</pre>
                                </div>
                              </details>
                            )}
                          </>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <Zap className="h-12 w-12 mb-3 opacity-20" />
                          <p className="text-sm">暂无 AI 分析结果</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* 内容 Tab */}
                <TabsContent value="content" className="flex-1 min-h-0 m-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-5 space-y-4">
                      {task.parseResult?.data?.page_title && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase mb-1">页面标题</div>
                          <p className="font-semibold text-lg">{task.parseResult.data.page_title}</p>
                        </div>
                      )}
                      {task.parseResult?.data?.page_content ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground font-medium uppercase">页面正文</span>
                            <Badge variant="outline">{task.parseResult.data.page_content.length.toLocaleString()} 字符</Badge>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-xl border max-h-[400px] overflow-auto">
                            <pre className="text-sm whitespace-pre-wrap leading-relaxed">{task.parseResult.data.page_content}</pre>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <FileText className="h-12 w-12 mb-3 opacity-20" />
                          <p className="text-sm">未提取到页面内容</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* 岗位 Tab */}
                <TabsContent value="positions" className="flex-1 min-h-0 m-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-5 space-y-4">
                      {positions.length > 0 ? (
                        <>
                          {/* 统计卡片 */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{positions.length}</div>
                              <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">岗位数</div>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {positions.reduce((s, p) => s + (p.recruit_count || 0), 0)}
                              </div>
                              <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">总招录人数</div>
                            </div>
                            <div className="p-4 bg-violet-50 dark:bg-violet-950/40 rounded-xl border border-violet-200 dark:border-violet-800 text-center">
                              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                                {new Set(positions.map(p => p.department_name).filter(Boolean)).size}
                              </div>
                              <div className="text-xs text-violet-600/70 dark:text-violet-400/70 mt-1">招录单位</div>
                            </div>
                          </div>
                          {/* 岗位列表 - 表格形式 */}
                          <div className="rounded-xl border overflow-hidden bg-card overflow-x-auto">
                            <Table className="table-auto">
                              <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                  <TableHead className="whitespace-nowrap text-center font-semibold px-3">#</TableHead>
                                  <TableHead className="whitespace-nowrap font-semibold px-3">岗位名称</TableHead>
                                  <TableHead className="whitespace-nowrap font-semibold px-3">招录单位</TableHead>
                                  <TableHead className="whitespace-nowrap font-semibold px-3">学历要求</TableHead>
                                  <TableHead className="whitespace-nowrap font-semibold px-3">工作地点</TableHead>
                                  <TableHead className="whitespace-nowrap font-semibold px-3">政治面貌</TableHead>
                                  <TableHead className="whitespace-nowrap text-center font-semibold px-3">招录人数</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {positions.map((pos, idx) => (
                                  <TableRow key={idx} className="hover:bg-muted/30">
                                    <TableCell className="text-center whitespace-nowrap py-2 px-3">
                                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                                        {idx + 1}
                                      </span>
                                    </TableCell>
                                    <TableCell className="font-medium whitespace-nowrap py-2 px-3">
                                      {pos.position_name || <span className="text-muted-foreground">未知职位</span>}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-2 px-3">
                                      {pos.department_name ? (
                                        <span className="text-sm" title={pos.department_name}>{pos.department_name}</span>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-2 px-3">
                                      {pos.education ? (
                                        <Badge variant="outline" className="text-xs font-normal">{pos.education}</Badge>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-2 px-3">
                                      {pos.work_location ? (
                                        <span className="text-sm" title={pos.work_location}>{pos.work_location}</span>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-2 px-3">
                                      {pos.political_status ? (
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs font-normal whitespace-nowrap ${
                                            pos.political_status.includes("党员") 
                                              ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300" 
                                              : ""
                                          }`}
                                        >
                                          {pos.political_status}
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center whitespace-nowrap py-2 px-3">
                                      {pos.recruit_count ? (
                                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white whitespace-nowrap">
                                          {pos.recruit_count} 人
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <Users className="h-12 w-12 mb-3 opacity-20" />
                          <p className="text-sm">暂无岗位数据</p>
                          <p className="text-xs mt-1">AI 未能从公告中提取到具体岗位信息</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* 附件 Tab */}
                <TabsContent value="attachments" className="flex-1 min-h-0 m-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-5 space-y-3">
                      {attachments.length > 0 ? (
                        attachments.map((att, idx) => {
                          const colors: Record<string, { bg: string; text: string; border: string }> = {
                            pdf: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-600", border: "border-red-200 dark:border-red-800" },
                            excel: { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-600", border: "border-green-200 dark:border-green-800" },
                            word: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600", border: "border-blue-200 dark:border-blue-800" },
                          };
                          const c = colors[att.type] || { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted" };
                          return (
                            <div key={idx} className={`p-4 rounded-xl border ${c.bg} ${c.border}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`p-2 rounded-lg border ${c.border}`}>
                                    <FileText className={`h-5 w-5 ${c.text}`} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate" title={att.name}>{att.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs uppercase">{att.type}</Badge>
                                      {att.content && <span className="text-xs text-muted-foreground">{att.content.length.toLocaleString()} 字符</span>}
                                    </div>
                                  </div>
                                </div>
                                {att.url && (
                                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                  </a>
                                )}
                              </div>
                              {att.error && (
                                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                                  <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                  <span>{att.error}</span>
                                </div>
                              )}
                              {att.content && !att.error && (
                                <details className="mt-3">
                                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    查看提取内容
                                  </summary>
                                  <div className="mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg max-h-40 overflow-auto border">
                                    <pre className="text-xs whitespace-pre-wrap font-mono">{att.content}</pre>
                                  </div>
                                </details>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <Paperclip className="h-12 w-12 mb-3 opacity-20" />
                          <p className="text-sm">该页面未发现附件</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              /* 无解析结果 */
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <div className={`p-8 rounded-full ${config.light} border-2 border-dashed ${config.border}`}>
                  {task.status === "parsing" || task.status === "running" ? (
                    <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
                  ) : task.status === "pending" ? (
                    <Clock className="h-12 w-12 text-slate-400" />
                  ) : (
                    <AlertCircle className="h-12 w-12 text-slate-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mt-6 mb-1">
                  {task.status === "parsing" || task.status === "running" ? "正在解析中..." :
                   task.status === "pending" ? "等待执行" :
                   task.status === "failed" ? "解析失败" : "暂无解析结果"}
                </h3>
                <p className="text-center max-w-sm">
                  {task.status === "parsing" || task.status === "running" ? "正在提取内容、下载附件并进行 AI 分析" :
                   task.status === "pending" ? "任务尚未开始执行" :
                   task.status === "failed" ? "请查看左侧步骤了解失败原因" : "任务未能完成解析"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== 底部操作栏 ===== */}
        <div className="flex-shrink-0 px-6 py-3 bg-muted/30 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {llm?.summary && (
              <span className="truncate max-w-[350px] inline-block">{llm.summary.slice(0, 80)}...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {task.fenbiUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={task.fenbiUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  打开粉笔
                </a>
              </Button>
            )}
            <Button size="sm" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
