"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  TrendingUp,
  AlertCircle,
  Sparkles,
  RotateCcw,
  CheckCheck,
  Star,
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
  Skeleton,
  Textarea,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@what-cse/ui";
import {
  aiContentApi,
  AIGeneratedContent,
  AIContentType,
  AIRelatedType,
  AIContentStatus,
  getContentTypeLabel,
  getRelatedTypeLabel,
  getContentStatusLabel,
  getContentStatusColor,
  getQualityScoreLabel,
  getQualityScoreColor,
} from "@/services/ai-content-api";
import { toast } from "sonner";

// ============================================
// Stats Cards Component
// ============================================

interface StatsData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

function StatsCards({
  stats,
  loading,
}: {
  stats: StatsData;
  loading: boolean;
}) {
  const cards = [
    {
      title: "总内容数",
      value: stats.total,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "待审核",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "已通过",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "已拒绝",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
// Content Preview Dialog
// ============================================

interface ContentPreviewDialogProps {
  content: AIGeneratedContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function ContentPreviewDialog({
  content,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: ContentPreviewDialogProps) {
  const [activeTab, setActiveTab] = useState("content");

  if (!content) return null;

  const renderContentData = () => {
    const data = content.content;
    const sections = [];

    if (data.summary) {
      sections.push(
        <div key="summary" className="space-y-1">
          <h4 className="text-sm font-medium">摘要</h4>
          <p className="text-sm text-muted-foreground">{data.summary}</p>
        </div>
      );
    }

    if (data.analysis) {
      sections.push(
        <div key="analysis" className="space-y-1">
          <h4 className="text-sm font-medium">解析</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {data.analysis}
          </p>
        </div>
      );
    }

    if (data.key_points && data.key_points.length > 0) {
      sections.push(
        <div key="key_points" className="space-y-1">
          <h4 className="text-sm font-medium">关键考点</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {data.key_points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (data.solution_steps && data.solution_steps.length > 0) {
      sections.push(
        <div key="steps" className="space-y-1">
          <h4 className="text-sm font-medium">解题步骤</h4>
          <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
            {data.solution_steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      );
    }

    if (data.tips && data.tips.length > 0) {
      sections.push(
        <div key="tips" className="space-y-1">
          <h4 className="text-sm font-medium">解题技巧</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {data.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (data.main_points && data.main_points.length > 0) {
      sections.push(
        <div key="main_points" className="space-y-1">
          <h4 className="text-sm font-medium">主要观点</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {data.main_points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (data.recommendations && data.recommendations.length > 0) {
      sections.push(
        <div key="recommendations" className="space-y-1">
          <h4 className="text-sm font-medium">学习建议</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {data.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (data.examples && data.examples.length > 0) {
      sections.push(
        <div key="examples" className="space-y-2">
          <h4 className="text-sm font-medium">例题</h4>
          {data.examples.map((example, i) => (
            <div
              key={i}
              className="border rounded-lg p-3 space-y-2 bg-muted/30"
            >
              <p className="text-sm font-medium">{example.question}</p>
              {example.options && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {example.options.map((opt, j) => (
                    <p key={j}>{opt}</p>
                  ))}
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium">答案：</span>
                {example.answer}
              </div>
              <p className="text-sm text-muted-foreground">{example.analysis}</p>
            </div>
          ))}
        </div>
      );
    }

    return sections.length > 0 ? (
      <div className="space-y-4">{sections}</div>
    ) : (
      <p className="text-sm text-muted-foreground">暂无详细内容</p>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI 生成内容预览
          </DialogTitle>
          <DialogDescription>
            {content.title || `${getContentTypeLabel(content.content_type)} #${content.id}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-2">
          <Badge variant={getContentStatusColor(content.status)}>
            {getContentStatusLabel(content.status)}
          </Badge>
          <Badge variant="outline">
            {getContentTypeLabel(content.content_type)}
          </Badge>
          <Badge variant="secondary">
            {getRelatedTypeLabel(content.related_type)} #{content.related_id}
          </Badge>
          <div className="flex items-center gap-1 ml-auto">
            <Star className={`h-4 w-4 ${getQualityScoreColor(content.quality_score)}`} />
            <span className={`text-sm font-medium ${getQualityScoreColor(content.quality_score)}`}>
              {content.quality_score.toFixed(1)} ({getQualityScoreLabel(content.quality_score)})
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">内容详情</TabsTrigger>
            <TabsTrigger value="metadata">元数据</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="content" className="mt-0 px-1">
              {renderContentData()}
            </TabsContent>

            <TabsContent value="metadata" className="mt-0 px-1 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">AI 模型：</span>
                  <span className="ml-2 font-medium">
                    {content.metadata?.model_name || "未知"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">版本：</span>
                  <span className="ml-2 font-medium">v{content.version}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Token 消耗：</span>
                  <span className="ml-2 font-medium">
                    {content.metadata?.tokens_used || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">生成耗时：</span>
                  <span className="ml-2 font-medium">
                    {content.metadata?.generate_time ? `${content.metadata.generate_time}ms` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">来源：</span>
                  <span className="ml-2 font-medium">
                    {content.metadata?.source || "API"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">生成时间：</span>
                  <span className="ml-2 font-medium">
                    {new Date(content.generated_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {content.metadata?.prompt && (
                <div className="mt-4 space-y-1">
                  <h4 className="text-sm font-medium">Prompt 模板</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                    {content.metadata.prompt}
                  </pre>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="gap-2">
          {content.status === "pending" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  onReject(content.id);
                  onOpenChange(false);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                拒绝
              </Button>
              <Button
                onClick={() => {
                  onApprove(content.id);
                  onOpenChange(false);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                通过
              </Button>
            </>
          )}
          {content.status !== "pending" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function AIContentReviewPage() {
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<AIGeneratedContent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Stats
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AIContentStatus | "all">("all");
  const [contentTypeFilter, setContentTypeFilter] = useState<AIContentType | "all">("all");
  const [relatedTypeFilter, setRelatedTypeFilter] = useState<AIRelatedType | "all">("all");

  // Preview dialog
  const [previewContent, setPreviewContent] = useState<AIGeneratedContent | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Selected items for batch operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiContentApi.getContents({
        page,
        page_size: pageSize,
        content_type: contentTypeFilter !== "all" ? contentTypeFilter : undefined,
        related_type: relatedTypeFilter !== "all" ? relatedTypeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        keyword: searchTerm || undefined,
      });

      setContents(res.contents || []);
      setTotal(res.total || 0);

      // Calculate stats from current data (simplified)
      const all = res.contents || [];
      setStats({
        total: res.total,
        pending: all.filter((c) => c.status === "pending").length,
        approved: all.filter((c) => c.status === "approved").length,
        rejected: all.filter((c) => c.status === "rejected").length,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, contentTypeFilter, relatedTypeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Approve content
  const handleApprove = async (id: number) => {
    try {
      await aiContentApi.approveContent(id);
      toast.success("内容已通过");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  // Reject content
  const handleReject = async (id: number) => {
    try {
      await aiContentApi.rejectContent(id);
      toast.success("内容已拒绝");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  // Delete content
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该内容吗？删除后不可恢复。")) return;
    try {
      await aiContentApi.deleteContent(id);
      toast.success("内容已删除");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // Regenerate content
  const handleRegenerate = async (id: number) => {
    try {
      await aiContentApi.regenerateContent(id);
      toast.success("正在重新生成内容");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  // Batch approve
  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) {
      toast.error("请先选择内容");
      return;
    }
    try {
      const result = await aiContentApi.batchApprove(Array.from(selectedIds));
      toast.success(`已通过 ${result.success_count} 条内容`);
      setSelectedIds(new Set());
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "批量操作失败");
    }
  };

  // Batch reject
  const handleBatchReject = async () => {
    if (selectedIds.size === 0) {
      toast.error("请先选择内容");
      return;
    }
    try {
      const result = await aiContentApi.batchReject(Array.from(selectedIds));
      toast.success(`已拒绝 ${result.success_count} 条内容`);
      setSelectedIds(new Set());
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "批量操作失败");
    }
  };

  // Toggle selection
  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toggle all
  const toggleAll = () => {
    if (selectedIds.size === contents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contents.map((c) => c.id)));
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  // Truncate content
  const truncateText = (text: string, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const contentTypeOptions: { value: AIContentType; label: string }[] = [
    { value: "question_analysis", label: "题目解析" },
    { value: "question_tips", label: "解题技巧" },
    { value: "question_similar", label: "相似题目" },
    { value: "knowledge_summary", label: "知识点总结" },
    { value: "knowledge_mindmap", label: "知识点导图" },
    { value: "knowledge_examples", label: "例题解析" },
    { value: "chapter_summary", label: "章节总结" },
    { value: "chapter_keypoints", label: "章节重点" },
    { value: "course_preview", label: "预习要点" },
    { value: "course_review", label: "复习要点" },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-500" />
            AI 内容审核
          </h1>
          <p className="text-muted-foreground">审核和管理 AI 生成的学习内容</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <StatsCards stats={stats} loading={loading} />

      {/* 内容列表 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>内容列表</CardTitle>
                <CardDescription>共 {total} 条 AI 生成内容</CardDescription>
              </div>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedIds.size} 项
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchApprove}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    批量通过
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchReject}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    批量拒绝
                  </Button>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索内容..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as AIContentStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="approved">已通过</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
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

              <Select
                value={relatedTypeFilter}
                onValueChange={(v) => {
                  setRelatedTypeFilter(v as AIRelatedType | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="关联类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部关联</SelectItem>
                  <SelectItem value="question">题目</SelectItem>
                  <SelectItem value="knowledge_point">知识点</SelectItem>
                  <SelectItem value="chapter">章节</SelectItem>
                  <SelectItem value="course">课程</SelectItem>
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
                  <Skeleton className="h-5 w-5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无 AI 生成内容</p>
              <p className="text-sm">生成内容后将显示在这里</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === contents.length && contents.length > 0}
                          onChange={toggleAll}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead className="min-w-[200px]">内容摘要</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>关联</TableHead>
                      <TableHead>质量分</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>生成时间</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(content.id)}
                            onChange={() => toggleSelection(content.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{content.id}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {content.title || truncateText(content.content.summary || content.content.analysis || "无标题")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              v{content.version}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getContentTypeLabel(content.content_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {getRelatedTypeLabel(content.related_type)} #{content.related_id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className={`h-4 w-4 ${getQualityScoreColor(content.quality_score)}`} />
                            <span className={`text-sm font-medium ${getQualityScoreColor(content.quality_score)}`}>
                              {content.quality_score.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getContentStatusColor(content.status)}>
                            {getContentStatusLabel(content.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(content.generated_at).toLocaleDateString()}
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
                                  setPreviewContent(content);
                                  setPreviewOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                预览
                              </DropdownMenuItem>
                              {content.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprove(content.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    通过
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReject(content.id)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    拒绝
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleRegenerate(content.id)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                重新生成
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(content.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
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

      {/* 内容预览对话框 */}
      <ContentPreviewDialog
        content={previewContent}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
