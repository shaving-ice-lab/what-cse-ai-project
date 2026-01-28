"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { PaperImportDialog } from "./components/PaperImportDialog";
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
          <DialogTitle>新建试卷</DialogTitle>
          <DialogDescription>创建新的考试试卷</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>试卷标题 *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="输入试卷标题"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>试卷类型</Label>
              <Select
                value={formData.paper_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, paper_type: v as PaperType })
                }
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>考试类型</Label>
              <Select
                value={formData.exam_type || ""}
                onValueChange={(v) =>
                  setFormData({ ...formData, exam_type: v })
                }
              >
                <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>科目</Label>
              <Select
                value={formData.subject || ""}
                onValueChange={(v) =>
                  setFormData({ ...formData, subject: v })
                }
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>年份</Label>
              <Select
                value={formData.year?.toString() || ""}
                onValueChange={(v) =>
                  setFormData({ ...formData, year: v ? Number(v) : undefined })
                }
              >
                <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>总分</Label>
              <Input
                type="number"
                value={formData.total_score}
                onChange={(e) =>
                  setFormData({ ...formData, total_score: Number(e.target.value) })
                }
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label>时间限制（分钟）</Label>
              <Input
                type="number"
                value={formData.time_limit}
                onChange={(e) =>
                  setFormData({ ...formData, time_limit: Number(e.target.value) })
                }
                placeholder="120"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>试卷描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="输入试卷描述..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_free}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_free: checked })
                }
              />
              <Label>免费试卷</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.status === 1}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 1 : 0 })
                }
              />
              <Label>立即发布</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>创建试卷</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function PaperManagementPage() {
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileStack className="h-6 w-6 text-purple-500" />
            试卷管理
          </h1>
          <p className="text-muted-foreground">管理公考题库的考试试卷</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            批量导入
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建试卷
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <StatsCards papers={papers} loading={loading} />

      {/* 试卷列表 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>试卷列表</CardTitle>
                <CardDescription>共 {total} 套试卷</CardDescription>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索试卷..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter === "all" ? "all" : statusFilter.toString()}
                onValueChange={(v) => {
                  setStatusFilter(v === "all" ? "all" : (Number(v) as PaperStatus));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
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
                <SelectTrigger className="w-[100px]">
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
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="考试类型" />
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
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="科目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部科目</SelectItem>
                  {getSubjectOptions().map((opt) => (
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
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileStack className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无试卷</p>
              <p className="text-sm">点击"新建试卷"开始创建</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead className="min-w-[200px]">试卷标题</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>考试/科目</TableHead>
                      <TableHead>题目数</TableHead>
                      <TableHead>时限</TableHead>
                      <TableHead>作答人次</TableHead>
                      <TableHead>平均分</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {papers.map((paper) => (
                      <TableRow key={paper.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{paper.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{paper.title}</p>
                            {paper.year && (
                              <span className="text-xs text-muted-foreground">
                                {paper.year}年
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getPaperTypeName(paper.paper_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getExamTypeLabel(paper.exam_type)} / {getSubjectLabel(paper.subject)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{paper.total_questions}</span>
                          <span className="text-muted-foreground text-xs">题</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{paper.time_limit}分钟</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {paper.attempt_count.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{paper.avg_score.toFixed(1)}</span>
                          <span className="text-muted-foreground text-xs">/{paper.total_score}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              paper.status === 1
                                ? "default"
                                : paper.status === 2
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {getPaperStatusLabel(paper.status)}
                          </Badge>
                          {paper.is_free && (
                            <Badge variant="outline" className="ml-1 bg-green-50 text-green-700">
                              免费
                            </Badge>
                          )}
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
                              <DropdownMenuItem asChild>
                                <Link href={`/learning/papers/${paper.id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  编辑
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(paper)}>
                                {paper.status === 1 ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    下架
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    发布
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(paper.id)}
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
