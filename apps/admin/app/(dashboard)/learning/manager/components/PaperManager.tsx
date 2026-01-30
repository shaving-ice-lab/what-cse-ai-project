"use client";

import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import Link from "next/link";
import { useToolbar } from "./ToolbarContext";
import {
  FileStack,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Copy,
  Trophy,
  FileUp,
} from "lucide-react";
import { PaperImportDialog } from "./PaperImportDialog";
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
  Switch,
  Textarea,
} from "@what-cse/ui";
import {
  questionApi,
  ExamPaper,
  PaperType,
  PaperStatus,
  CreatePaperRequest,
  getPaperTypeName,
  getPaperStatusLabel,
  getExamTypeOptions,
  getSubjectOptions,
  getYearOptions,
} from "@/services/question-api";
import { toast } from "sonner";

// ============================================
// Stats Cards Component
// ============================================

interface StatsCardsProps {
  papers: ExamPaper[];
  loading: boolean;
}

function StatsCards({ papers, loading }: StatsCardsProps) {
  const totalPapers = papers.length;
  const publishedPapers = papers.filter((p) => p.status === 1).length;
  const totalAttempts = papers.reduce((sum, p) => sum + p.attempt_count, 0);
  const avgScore = papers.length > 0
    ? papers.reduce((sum, p) => sum + p.avg_score, 0) / papers.length
    : 0;

  const cards = [
    {
      title: "总试卷数",
      value: totalPapers,
      icon: FileStack,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "已发布",
      value: publishedPapers,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "总作答人次",
      value: totalAttempts,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "平均分",
      value: avgScore.toFixed(1),
      icon: Trophy,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
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
// Paper Form Dialog
// ============================================

interface PaperFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePaperRequest) => void;
}

function PaperFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: PaperFormDialogProps) {
  const [formData, setFormData] = useState<CreatePaperRequest>({
    title: "",
    paper_type: "mock",
    exam_type: "",
    subject: "",
    total_score: 100,
    time_limit: 120,
    is_free: false,
    status: 0,
    description: "",
  });

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error("请填写试卷标题");
      return;
    }
    onSubmit(formData);
    onOpenChange(false);
    setFormData({
      title: "",
      paper_type: "mock",
      exam_type: "",
      subject: "",
      total_score: 100,
      time_limit: 120,
      is_free: false,
      status: 0,
      description: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-base">新建试卷</DialogTitle>
          <DialogDescription className="text-xs">创建新的考试试卷</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">试卷标题 *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="输入试卷标题"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">试卷类型</Label>
              <Select
                value={formData.paper_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, paper_type: v as PaperType })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real_exam">真题卷</SelectItem>
                  <SelectItem value="mock">模拟卷</SelectItem>
                  <SelectItem value="daily">每日练习</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">考试类型</Label>
              <Select
                value={formData.exam_type || ""}
                onValueChange={(v) =>
                  setFormData({ ...formData, exam_type: v })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="选择考试类型" />
                </SelectTrigger>
                <SelectContent>
                  {getExamTypeOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">科目</Label>
              <Select
                value={formData.subject || ""}
                onValueChange={(v) =>
                  setFormData({ ...formData, subject: v })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="选择科目" />
                </SelectTrigger>
                <SelectContent>
                  {getSubjectOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">年份</Label>
              <Select
                value={formData.year?.toString() || ""}
                onValueChange={(v) =>
                  setFormData({ ...formData, year: v ? Number(v) : undefined })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="选择年份" />
                </SelectTrigger>
                <SelectContent>
                  {getYearOptions().map((year) => (
                    <SelectItem key={year.value} value={year.value.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">总分</Label>
              <Input
                type="number"
                value={formData.total_score}
                onChange={(e) =>
                  setFormData({ ...formData, total_score: Number(e.target.value) })
                }
                placeholder="100"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">时间限制（分钟）</Label>
              <Input
                type="number"
                value={formData.time_limit}
                onChange={(e) =>
                  setFormData({ ...formData, time_limit: Number(e.target.value) })
                }
                placeholder="120"
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">试卷描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="输入试卷描述..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_free}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_free: checked })
                }
              />
              <Label className="text-sm">免费试卷</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.status === 1}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 1 : 0 })
                }
              />
              <Label className="text-sm">立即发布</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button size="sm" onClick={handleSubmit}>创建试卷</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function PaperManager() {
  const { setToolbarContent } = useToolbar();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaperStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PaperType | "all">("all");
  const [examTypeFilter, setExamTypeFilter] = useState<string | "all">("all");
  const [subjectFilter, setSubjectFilter] = useState<string | "all">("all");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await questionApi.getPapers({
        page,
        page_size: pageSize,
        keyword: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        paper_type: typeFilter !== "all" ? typeFilter : undefined,
        exam_type: examTypeFilter !== "all" ? examTypeFilter : undefined,
        subject: subjectFilter !== "all" ? subjectFilter : undefined,
      });

      setPapers(res.papers || []);
      setTotal(res.total || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, typeFilter, examTypeFilter, subjectFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 创建试卷
  const handleCreatePaper = async (data: CreatePaperRequest) => {
    try {
      await questionApi.createPaper(data);
      toast.success("试卷已创建");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "创建失败");
    }
  };

  // 删除试卷
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该试卷吗？删除后不可恢复。")) return;
    try {
      await questionApi.deletePaper(id);
      toast.success("试卷已删除");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // 更新试卷状态
  const handleToggleStatus = async (paper: ExamPaper) => {
    const newStatus = paper.status === 1 ? 0 : 1;
    try {
      await questionApi.updatePaper(paper.id, { status: newStatus as PaperStatus });
      toast.success(newStatus === 1 ? "试卷已发布" : "试卷已下架");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const getSubjectLabel = (subject: string | undefined): string => {
    const map: Record<string, string> = {
      xingce: "行测",
      shenlun: "申论",
      mianshi: "面试",
      gongji: "公基",
    };
    return map[subject || ""] || subject || "-";
  };

  const getExamTypeLabel = (examType: string | undefined): string => {
    const map: Record<string, string> = {
      guokao: "国考",
      shengkao: "省考",
      shiyedanwei: "事业单位",
      xuandiao: "选调",
      junduiwenzhi: "军队文职",
    };
    return map[examType || ""] || examType || "-";
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  // Stats calculated from papers
  const totalPapers = papers.length;
  const publishedPapers = papers.filter((p) => p.status === 1).length;
  const totalAttempts = papers.reduce((sum, p) => sum + p.attempt_count, 0);
  const avgScore = papers.length > 0
    ? papers.reduce((sum, p) => sum + p.avg_score, 0) / papers.length
    : 0;

  // Register toolbar content
  useLayoutEffect(() => {
    setToolbarContent(
      <>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索试卷..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="h-8 w-40 pl-8 pr-3 text-sm bg-muted/40 border-transparent focus:border-border focus:bg-background transition-colors"
          />
        </div>
        <Button size="sm" variant="ghost" onClick={() => setImportDialogOpen(true)} className="h-8 w-8 p-0">
          <FileUp className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8 p-0">
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}
          className="h-8 px-3 text-xs bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-sm">
          <Plus className="mr-1 h-3.5 w-3.5" />
          新建
        </Button>
      </>
    );
    return () => setToolbarContent(null);
  }, [setToolbarContent, searchTerm, isRefreshing]);

  return (
    <div className="h-full flex flex-col">
      {/* Mini Stats Bar */}
      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-b border-border/30 bg-muted/20 overflow-x-auto">
        {[
          { label: "总数", value: totalPapers, icon: FileStack },
          { label: "已发布", value: publishedPapers, icon: CheckCircle },
          { label: "作答", value: totalAttempts, icon: Users },
          { label: "均分", value: avgScore.toFixed(1), icon: Trophy },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <item.icon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <Card className="flex-1 flex flex-col shadow-sm border-border/50 rounded-xl overflow-hidden">
          {/* Filter Bar */}
          <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-muted/20">
            <Select
              value={statusFilter === "all" ? "all" : statusFilter.toString()}
              onValueChange={(v) => {
                setStatusFilter(v === "all" ? "all" : (Number(v) as PaperStatus));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="0">草稿</SelectItem>
                <SelectItem value="1">已发布</SelectItem>
                <SelectItem value="2">已归档</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v as PaperType | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="real_exam">真题卷</SelectItem>
                <SelectItem value="mock">模拟卷</SelectItem>
                <SelectItem value="daily">每日练习</SelectItem>
                <SelectItem value="custom">自定义</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={examTypeFilter}
              onValueChange={(v) => {
                setExamTypeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue placeholder="考试" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部考试</SelectItem>
                {getExamTypeOptions().map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={subjectFilter}
              onValueChange={(v) => {
                setSubjectFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[80px] h-8 text-xs">
                <SelectValue placeholder="科目" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {getSubjectOptions().map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">共 {total} 套</span>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="space-y-1 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-transparent">
                  <Skeleton className="h-3.5 w-10" />
                  <Skeleton className="h-3.5 w-40 flex-1" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3.5 w-12" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileStack className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">暂无试卷</p>
              <p className="text-xs mt-1 opacity-70">点击"新建"添加试卷</p>
            </div>
          ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] py-2 text-xs">ID</TableHead>
                    <TableHead className="min-w-[180px] py-2 text-xs">试卷标题</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">类型</TableHead>
                    <TableHead className="w-[110px] py-2 text-xs">考试/科目</TableHead>
                    <TableHead className="w-[70px] py-2 text-xs">题目数</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">时限</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">作答人次</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">平均分</TableHead>
                    <TableHead className="w-[90px] py-2 text-xs">状态</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {papers.map((paper) => (
                    <TableRow key={paper.id} className="hover:bg-muted/50">
                      <TableCell className="py-2 font-mono text-xs text-muted-foreground">
                        #{paper.id}
                      </TableCell>
                      <TableCell className="py-2">
                        <div>
                          <p className="text-sm">{paper.title}</p>
                          {paper.year && (
                            <span className="text-xs text-muted-foreground">
                              {paper.year}年
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="secondary" className="text-xs">
                          {getPaperTypeName(paper.paper_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-xs text-muted-foreground">
                          {getExamTypeLabel(paper.exam_type)} / {getSubjectLabel(paper.subject)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-sm">
                        <span>{paper.total_questions}</span>
                        <span className="text-muted-foreground text-xs ml-0.5">题</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{paper.time_limit}分</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">
                        {paper.attempt_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2 text-sm">
                        <span>{paper.avg_score.toFixed(1)}</span>
                        <span className="text-muted-foreground text-xs">/{paper.total_score}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={
                              paper.status === 1
                                ? "default"
                                : paper.status === 2
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {getPaperStatusLabel(paper.status)}
                          </Badge>
                          {paper.is_free && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              免费
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-xs">操作</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="text-sm">
                              <Link href={`/learning/papers/${paper.id}`}>
                                <Edit className="mr-2 h-3.5 w-3.5" />
                                编辑
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(paper)} className="text-sm">
                              {paper.status === 1 ? (
                                <>
                                  <XCircle className="mr-2 h-3.5 w-3.5" />
                                  下架
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-3.5 w-3.5" />
                                  发布
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(paper.id)}
                              className="text-sm text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t bg-muted/10">
              <span className="text-xs text-muted-foreground">共 {total} 套</span>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 text-xs"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}>
                  上一页
                </Button>
                <span className="text-xs px-2">{page} / {totalPages}</span>
                <Button size="sm" variant="ghost" className="h-7 text-xs"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}>
                  下一页
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 新建试卷对话框 */}
      <PaperFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreatePaper}
      />

      {/* 批量导入对话框 */}
      <PaperImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}
