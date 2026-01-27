"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Label,
  Badge,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@what-cse/ui";
import {
  Zap,
  Link,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  FileText,
  Database,
  ExternalLink,
  Eye,
  MapPin,
  Briefcase,
  Calendar,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Hash,
  Users,
  GraduationCap,
  Building2,
  Target,
  UserCheck,
} from "lucide-react";
import { type ParseURLResult } from "@/services/api";

interface ParseResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ParseURLResult | null;
  title?: string;
}

// Step status icon component
const StepStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-3 w-3 text-emerald-600" />;
    case "error":
      return <XCircle className="h-3 w-3 text-red-600" />;
    case "partial":
      return <AlertCircle className="h-3 w-3 text-amber-600" />;
    default:
      return <Clock className="h-3 w-3 text-gray-400" />;
  }
};

// Get status color classes
const getStepStyles = (status: string) => {
  switch (status) {
    case "success":
      return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800";
    case "error":
      return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
    case "partial":
      return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
    default:
      return "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700";
  }
};

// File type icon and color
const getFileTypeStyles = (type: string) => {
  switch (type) {
    case "pdf":
      return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600" };
    case "excel":
      return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600" };
    case "word":
      return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600" };
    default:
      return { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-600" };
  }
};

// Copy button component
const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-6 px-2 text-xs gap-1"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-600" />
          <span className="text-emerald-600">已复制</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {label && <span>{label}</span>}
        </>
      )}
    </Button>
  );
};

export function ParseResultDialog({ open, onOpenChange, result, title }: ParseResultDialogProps) {
  // Calculate stats
  const stats = useMemo(() => {
    if (!result?.steps) return null;
    const totalTime = result.steps.reduce((acc, s) => acc + s.duration_ms, 0);
    const successCount = result.steps.filter((s) => s.status === "success").length;
    const errorCount = result.steps.filter((s) => s.status === "error").length;
    return { totalTime, successCount, errorCount, totalSteps: result.steps.length };
  }, [result?.steps]);

  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-fuchsia-500/20 px-5 py-3 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="flex items-center gap-2.5 text-base">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span>{title || "解析结果"}</span>
                {result?.success && (
                  <Badge className="bg-emerald-500/90 text-xs">解析成功</Badge>
                )}
                {result?.error && !result.success && (
                  <Badge variant="destructive" className="text-xs">解析失败</Badge>
                )}
              </DialogTitle>
              {stats && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">{(stats.totalTime / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    <span>{stats.successCount}/{stats.totalSteps}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogDescription className="text-xs mt-0.5">
              查看公告的智能解析结果，包含AI分析、内容、岗位信息、附件等
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Error State */}
          {result?.error && !result.success && (
            <div className="p-5 h-full overflow-auto">
              <div className="max-w-lg mx-auto">
                <div className="p-5 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-800 dark:text-red-200">解析失败</h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {result.error}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Results */}
          {result?.success && (
            <div className="flex h-full">
              {/* Left Panel - Steps */}
              <div className="w-64 flex-shrink-0 border-r flex flex-col bg-muted/10">
                <div className="flex-shrink-0 h-10 px-3 flex items-center border-b bg-muted/20">
                  <Activity className="h-3.5 w-3.5 text-violet-600 mr-1.5" />
                  <span className="text-xs font-semibold">解析流程</span>
                  <Badge variant="outline" className="ml-auto text-[10px] h-5">
                    {result.steps.length} 步
                  </Badge>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1.5">
                    {result.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-md border text-xs ${getStepStyles(step.status)}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 flex items-center justify-center rounded bg-background/80 text-[10px] font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <StepStatusIcon status={step.status} />
                          <span className="font-medium flex-1 truncate">{step.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {step.duration_ms}ms
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 pl-6 line-clamp-2">
                          {step.message}
                        </p>
                        {step.details && (
                          <details className="mt-1 pl-6">
                            <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                              详情
                            </summary>
                            <pre className="mt-1 text-[10px] bg-background/80 p-1.5 rounded overflow-auto max-h-20 whitespace-pre-wrap">
                              {step.details}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {stats && (
                  <div className="flex-shrink-0 px-3 py-2 border-t bg-muted/20 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">总耗时</span>
                      <span className="font-mono font-medium">{(stats.totalTime / 1000).toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">成功</span>
                      <span className="font-medium text-emerald-600">{stats.successCount}/{stats.totalSteps}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Tabs */}
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {result.data && (
                  <Tabs defaultValue="llm" className="flex-1 flex flex-col min-h-0">
                    <div className="flex-shrink-0 h-10 px-3 flex items-center border-b bg-muted/20">
                      <TabsList className="h-7 bg-transparent p-0 gap-1">
                        <TabsTrigger
                          value="llm"
                          className="h-7 px-3 text-xs data-[state=active]:bg-violet-100 dark:data-[state=active]:bg-violet-900/30 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 rounded"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          AI 分析
                        </TabsTrigger>
                        <TabsTrigger
                          value="content"
                          className="h-7 px-3 text-xs data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          内容
                        </TabsTrigger>
                        <TabsTrigger
                          value="positions"
                          className="h-7 px-3 text-xs data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 rounded"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          岗位分析
                          {result.data.llm_analysis?.positions && result.data.llm_analysis.positions.length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                              {result.data.llm_analysis.positions.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger
                          value="attachments"
                          className="h-7 px-3 text-xs data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-300 rounded"
                        >
                          <Database className="h-3 w-3 mr-1" />
                          附件
                          {result.data.attachments && result.data.attachments.length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                              {result.data.attachments.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger
                          value="urls"
                          className="h-7 px-3 text-xs data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 rounded"
                        >
                          <Link className="h-3 w-3 mr-1" />
                          链接
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* AI Analysis Tab */}
                    <TabsContent value="llm" className="flex-1 min-h-0 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-3">
                          {result.data.llm_analysis ? (
                            result.data.llm_analysis.error ? (
                              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 mb-1">
                                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                                  <span className="text-xs font-medium text-red-700 dark:text-red-300">分析失败</span>
                                </div>
                                <p className="text-xs text-red-600 dark:text-red-400">
                                  {result.data.llm_analysis.error}
                                </p>
                              </div>
                            ) : (
                              <>
                                {/* Summary Card */}
                                {result.data.llm_analysis.summary && (
                                  <div className="p-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                                        <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">公告摘要</span>
                                      </div>
                                      <CopyButton text={result.data.llm_analysis.summary} label="复制" />
                                    </div>
                                    <p className="text-xs leading-relaxed text-violet-900 dark:text-violet-100">
                                      {result.data.llm_analysis.summary}
                                    </p>
                                  </div>
                                )}

                                {/* Exam Info Card */}
                                {result.data.llm_analysis.exam_info && (
                                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">考试信息</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {result.data.llm_analysis.exam_info.exam_type && (
                                        <div className="col-span-2">
                                          <Badge className="bg-blue-600 text-white text-xs h-5">
                                            {result.data.llm_analysis.exam_info.exam_type}
                                          </Badge>
                                        </div>
                                      )}
                                      {result.data.llm_analysis.exam_info.registration_start && (
                                        <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                                          <p className="text-[10px] text-muted-foreground mb-0.5">报名开始</p>
                                          <p className="text-xs font-medium">{result.data.llm_analysis.exam_info.registration_start}</p>
                                        </div>
                                      )}
                                      {result.data.llm_analysis.exam_info.registration_end && (
                                        <div className="p-2 bg-white/50 dark:bg-black/20 rounded border-l-2 border-red-400">
                                          <p className="text-[10px] text-muted-foreground mb-0.5">报名截止</p>
                                          <p className="text-xs font-semibold text-red-600">{result.data.llm_analysis.exam_info.registration_end}</p>
                                        </div>
                                      )}
                                      {result.data.llm_analysis.exam_info.exam_date && (
                                        <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                                          <p className="text-[10px] text-muted-foreground mb-0.5">考试时间</p>
                                          <p className="text-xs font-medium">{result.data.llm_analysis.exam_info.exam_date}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Positions Card */}
                                {result.data.llm_analysis.positions && result.data.llm_analysis.positions.length > 0 && (
                                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-1.5">
                                        <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">招录职位</span>
                                      </div>
                                      <Badge className="bg-emerald-600 text-xs h-5">
                                        {result.data.llm_analysis.positions.length} 个
                                      </Badge>
                                    </div>
                                    <div className="space-y-1.5 max-h-48 overflow-auto">
                                      {result.data.llm_analysis.positions.map((pos, idx) => (
                                        <div key={idx} className="p-2 bg-white dark:bg-gray-900/50 rounded border text-xs">
                                          <div className="flex items-start justify-between">
                                            <span className="font-medium">{pos.position_name || "未知职位"}</span>
                                            {pos.recruit_count && (
                                              <Badge variant="outline" className="text-[10px] h-4 bg-emerald-50 dark:bg-emerald-900/30">
                                                招 {pos.recruit_count} 人
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex flex-wrap gap-1 mt-1.5">
                                            {pos.department_name && (
                                              <Badge variant="outline" className="text-[10px] h-4 gap-0.5">
                                                <MapPin className="h-2.5 w-2.5" />
                                                {pos.department_name}
                                              </Badge>
                                            )}
                                            {pos.education && (
                                              <Badge variant="outline" className="text-[10px] h-4">
                                                {pos.education}
                                              </Badge>
                                            )}
                                            {pos.political_status && (
                                              <Badge 
                                                variant="outline" 
                                                className={`text-[10px] h-4 gap-0.5 ${
                                                  pos.political_status.includes("党员") 
                                                    ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300" 
                                                    : ""
                                                }`}
                                              >
                                                <UserCheck className="h-2.5 w-2.5" />
                                                {pos.political_status}
                                              </Badge>
                                            )}
                                          </div>
                                          {pos.major && pos.major.length > 0 && (
                                            <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1">
                                              专业：{pos.major.join("、")}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Confidence */}
                                <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                                  <span className="text-xs text-muted-foreground">分析置信度</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          (result.data.llm_analysis.confidence || 0) >= 80
                                            ? "bg-emerald-500"
                                            : (result.data.llm_analysis.confidence || 0) >= 60
                                            ? "bg-amber-500"
                                            : "bg-red-500"
                                        }`}
                                        style={{ width: `${result.data.llm_analysis.confidence || 0}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold w-8 text-right">
                                      {result.data.llm_analysis.confidence || 0}%
                                    </span>
                                  </div>
                                </div>

                                {/* Raw Response */}
                                {result.data.llm_analysis.raw_response && (
                                  <details className="group">
                                    <summary className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer hover:text-foreground py-1">
                                      <Eye className="h-3 w-3" />
                                      查看 LLM 原始响应
                                    </summary>
                                    <div className="mt-1 p-2 bg-muted rounded-lg max-h-40 overflow-auto">
                                      <pre className="text-[10px] whitespace-pre-wrap font-mono">
                                        {result.data.llm_analysis.raw_response}
                                      </pre>
                                    </div>
                                  </details>
                                )}
                              </>
                            )
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                              <Zap className="h-8 w-8 mb-2 opacity-30" />
                              <p className="text-xs">暂无 AI 分析结果</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Page Content Tab */}
                    <TabsContent value="content" className="flex-1 min-h-0 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-3">
                          {result.data.page_title && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center justify-between mb-1">
                                <Label className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase">
                                  页面标题
                                </Label>
                                <CopyButton text={result.data.page_title} />
                              </div>
                              <p className="text-sm font-medium">{result.data.page_title}</p>
                            </div>
                          )}
                          {result.data.page_content && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <Label className="text-[10px] text-muted-foreground uppercase">页面正文</Label>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] h-4">
                                    <Hash className="h-2.5 w-2.5 mr-0.5" />
                                    {result.data.page_content.length.toLocaleString()} 字符
                                  </Badge>
                                  <CopyButton text={result.data.page_content} />
                                </div>
                              </div>
                              <div className="p-3 bg-muted/50 rounded-lg border overflow-auto max-h-[300px]">
                                <pre className="text-xs whitespace-pre-wrap leading-relaxed">
                                  {result.data.page_content}
                                </pre>
                              </div>
                            </div>
                          )}
                          {!result.data.page_title && !result.data.page_content && (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                              <FileText className="h-8 w-8 mb-2 opacity-30" />
                              <p className="text-xs">未提取到页面内容</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Positions Analysis Tab */}
                    <TabsContent value="positions" className="flex-1 min-h-0 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                          {result.data.llm_analysis?.positions && result.data.llm_analysis.positions.length > 0 ? (
                            <>
                              {/* Stats Summary */}
                              <div className="grid grid-cols-4 gap-2">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
                                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase mb-1">岗位数</p>
                                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                    {result.data.llm_analysis.positions.length}
                                  </p>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase mb-1">总招录</p>
                                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                    {result.data.llm_analysis.positions.reduce((sum, p) => sum + (p.recruit_count || 0), 0)} 人
                                  </p>
                                </div>
                                <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800 text-center">
                                  <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium uppercase mb-1">招录单位</p>
                                  <p className="text-xl font-bold text-violet-700 dark:text-violet-300">
                                    {new Set(result.data.llm_analysis.positions.map(p => p.department_name).filter(Boolean)).size}
                                  </p>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
                                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium uppercase mb-1">分析置信度</p>
                                  <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                                    {result.data.llm_analysis.confidence || 0}%
                                  </p>
                                </div>
                              </div>

                              {/* Positions Table */}
                              <div className="border rounded-lg overflow-hidden">
                                <div className="bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 border-b">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                      岗位详情列表
                                    </span>
                                  </div>
                                </div>
                                <div className="divide-y max-h-[350px] overflow-auto">
                                  {result.data.llm_analysis.positions.map((pos, idx) => (
                                    <div key={idx} className="p-3 hover:bg-muted/30 transition-colors">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="flex items-center justify-center w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                            {idx + 1}
                                          </span>
                                          <span className="text-sm font-medium">{pos.position_name || "未知职位"}</span>
                                        </div>
                                        {pos.recruit_count && (
                                          <Badge className="bg-emerald-600 text-white text-xs h-5">
                                            招 {pos.recruit_count} 人
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        {pos.department_name && (
                                          <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Building2 className="h-3 w-3" />
                                            <span>单位：</span>
                                            <span className="text-foreground">{pos.department_name}</span>
                                          </div>
                                        )}
                                        {pos.education && (
                                          <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <GraduationCap className="h-3 w-3" />
                                            <span>学历：</span>
                                            <span className="text-foreground">{pos.education}</span>
                                          </div>
                                        )}
                                        {pos.work_location && (
                                          <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span>地点：</span>
                                            <span className="text-foreground">{pos.work_location}</span>
                                          </div>
                                        )}
                                        {pos.political_status && (
                                          <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <UserCheck className="h-3 w-3" />
                                            <span>政治面貌：</span>
                                            <span className={`font-medium ${
                                              pos.political_status.includes("党员") 
                                                ? "text-red-600 dark:text-red-400" 
                                                : "text-foreground"
                                            }`}>{pos.political_status}</span>
                                          </div>
                                        )}
                                        {pos.major && pos.major.length > 0 && (
                                          <div className="flex items-start gap-1.5 text-muted-foreground col-span-2">
                                            <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                            <span className="flex-shrink-0">专业：</span>
                                            <span className="text-foreground line-clamp-2">{pos.major.join("、")}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Data Source Info */}
                              <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Sparkles className="h-3 w-3" />
                                  <span className="font-medium">数据来源说明</span>
                                </div>
                                <p>
                                  以上岗位信息由 AI 从原网页内容
                                  {result.data.attachments && result.data.attachments.length > 0 && (
                                    <>及 {result.data.attachments.length} 个附件</>
                                  )}
                                  中智能提取，仅供参考。完整职位表请以原文附件为准。
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                              <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/30 mb-3">
                                <Users className="h-10 w-10 text-emerald-400 opacity-50" />
                              </div>
                              <p className="text-sm font-medium mb-1">暂无岗位数据</p>
                              <p className="text-xs text-center max-w-[280px]">
                                AI 未能从公告内容中提取到具体岗位信息，请查看原文附件获取完整职位表
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Attachments Tab */}
                    <TabsContent value="attachments" className="flex-1 min-h-0 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-2">
                          {result.data.attachments && result.data.attachments.length > 0 ? (
                            result.data.attachments.map((att, idx) => {
                              const styles = getFileTypeStyles(att.type);
                              return (
                                <div key={idx} className="p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className={`p-1.5 rounded ${styles.bg}`}>
                                        <FileText className={`h-4 w-4 ${styles.text}`} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium truncate max-w-[250px]" title={att.name}>
                                          {att.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <Badge variant="outline" className="text-[10px] h-4 uppercase">
                                            {att.type}
                                          </Badge>
                                          {att.content && (
                                            <span className="text-[10px] text-muted-foreground">
                                              {att.content.length.toLocaleString()} 字符
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {att.url && (
                                      <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        下载
                                      </a>
                                    )}
                                  </div>
                                  {att.error && (
                                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 rounded flex items-start gap-1.5">
                                      <XCircle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                                      <p className="text-[10px] text-red-600 dark:text-red-400">{att.error}</p>
                                    </div>
                                  )}
                                  {att.content && !att.error && (
                                    <details className="mt-2">
                                      <summary className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer hover:text-foreground py-1">
                                        <Eye className="h-3 w-3" />
                                        查看提取内容
                                      </summary>
                                      <div className="mt-1 p-2 bg-muted/50 rounded max-h-48 overflow-auto">
                                        <pre className="text-[10px] whitespace-pre-wrap font-mono">{att.content}</pre>
                                      </div>
                                    </details>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                              <Database className="h-8 w-8 mb-2 opacity-30" />
                              <p className="text-xs">该页面未发现附件</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* URLs Tab */}
                    <TabsContent value="urls" className="flex-1 min-h-0 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-3">
                          {/* Original Input URL */}
                          <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Link className="h-3 w-3 text-violet-600" />
                                <Label className="text-[10px] text-violet-600 dark:text-violet-400 font-medium uppercase">
                                  原始输入链接
                                </Label>
                              </div>
                              {result.data.input_url && <CopyButton text={result.data.input_url} />}
                            </div>
                            <a
                              href={result.data.input_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-violet-700 dark:text-violet-300 hover:underline flex items-center gap-1.5 break-all"
                            >
                              <span className="flex-1">{result.data.input_url || "-"}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
                            </a>
                          </div>

                          {/* Arrow for redirect */}
                          {result.data.final_url && result.data.final_url !== result.data.input_url && (
                            <div className="flex items-center justify-center gap-2 text-muted-foreground py-1">
                              <div className="h-px flex-1 bg-muted-foreground/20" />
                              <div className="flex items-center gap-1 text-[10px]">
                                <ArrowRight className="h-3 w-3" />
                                短链接跳转
                              </div>
                              <div className="h-px flex-1 bg-muted-foreground/20" />
                            </div>
                          )}

                          {/* Final Article URL */}
                          {result.data.final_url && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                                  <Label className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase">
                                    最终文章链接
                                  </Label>
                                  {result.data.final_url === result.data.input_url && (
                                    <Badge variant="outline" className="text-[10px] h-4 text-muted-foreground">
                                      无跳转
                                    </Badge>
                                  )}
                                </div>
                                <CopyButton text={result.data.final_url} />
                              </div>
                              <a
                                href={result.data.final_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1.5 break-all"
                              >
                                <span className="flex-1">{result.data.final_url}</span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
                              </a>
                            </div>
                          )}

                          {/* Page Title */}
                          {result.data.page_title && (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <Label className="text-[10px] text-muted-foreground uppercase">页面标题</Label>
                                <CopyButton text={result.data.page_title} />
                              </div>
                              <p className="text-xs font-medium">{result.data.page_title}</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-2 border-t bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {result?.data?.llm_analysis?.summary && (
              <CopyButton text={result.data.llm_analysis.summary} label="复制摘要" />
            )}
          </div>
          <Button variant="outline" size="sm" className="h-7" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
