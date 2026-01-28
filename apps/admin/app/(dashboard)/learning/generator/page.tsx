"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wand2,
  BookOpen,
  FolderTree,
  Lightbulb,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  Database,
  BarChart3,
  FileText,
  List,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@what-cse/ui";
import {
  generatorApi,
  GeneratorTask,
  ContentStats,
  SubjectStructure,
  Subject,
  SUBJECTS,
  getSubjectName,
  getSubjectIcon,
  getTaskStatusLabel,
  getTaskStatusColor,
  getTaskTypeLabel,
} from "@/services/content-generator-api";
import { toast } from "sonner";

// ============================================
// Stats Cards
// ============================================

function StatsCards({ stats, loading }: { stats?: ContentStats; loading: boolean }) {
  const cards = [
    {
      title: "分类数",
      value: stats?.total_categories || 0,
      icon: FolderTree,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "课程数",
      value: stats?.total_courses || 0,
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "章节数",
      value: stats?.total_chapters || 0,
      icon: FileText,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "知识点数",
      value: stats?.total_knowledge_points || 0,
      icon: Lightbulb,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
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
            <div className="text-2xl font-bold">
              {card.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Task Status Badge
// ============================================

function TaskStatusBadge({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    processing: <Loader2 className="h-3 w-3 animate-spin" />,
    completed: <CheckCircle className="h-3 w-3" />,
    failed: <XCircle className="h-3 w-3" />,
  };

  return (
    <Badge className={`${getTaskStatusColor(status as any)} gap-1`}>
      {icons[status]}
      {getTaskStatusLabel(status as any)}
    </Badge>
  );
}

// ============================================
// Progress Bar
// ============================================

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="bg-amber-500 h-2 rounded-full transition-all"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}

// ============================================
// Quick Generate Dialog
// ============================================

function QuickGenerateDialog({
  open,
  onOpenChange,
  onGenerate,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (subject: Subject, type: "categories" | "courses", categoryId?: number) => void;
  loading: boolean;
}) {
  const [subject, setSubject] = useState<Subject>("xingce");
  const [generateType, setGenerateType] = useState<"categories" | "courses">("categories");
  const [structure, setStructure] = useState<SubjectStructure | null>(null);

  // 加载科目结构
  useEffect(() => {
    if (open && subject) {
      generatorApi.getSubjectStructure(subject).then(setStructure).catch(console.error);
    }
  }, [open, subject]);

  const handleGenerate = () => {
    onGenerate(subject, generateType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-amber-500" />
            快速生成内容
          </DialogTitle>
          <DialogDescription>
            根据预设的课程结构快速生成分类和课程
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 科目选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">选择科目</label>
            <div className="grid grid-cols-4 gap-3">
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSubject(s.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    subject === s.value
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-sm font-medium">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 生成类型 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">生成内容</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGenerateType("categories")}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  generateType === "categories"
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FolderTree className="h-6 w-6 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">课程分类</div>
                  <div className="text-sm text-muted-foreground">生成科目下的分类结构</div>
                </div>
              </button>
              <button
                onClick={() => setGenerateType("courses")}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  generateType === "courses"
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <BookOpen className="h-6 w-6 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">课程内容</div>
                  <div className="text-sm text-muted-foreground">生成课程和章节</div>
                </div>
              </button>
            </div>
          </div>

          {/* 结构预览 */}
          {structure && (
            <div className="space-y-2">
              <label className="text-sm font-medium">结构预览</label>
              <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                {Object.entries(structure.structure).map(([category, items], idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <div className="font-medium text-sm flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-blue-500" />
                      {category}
                      <Badge variant="secondary" className="ml-auto">
                        {items.length} 项
                      </Badge>
                    </div>
                    {items.length > 0 && (
                      <div className="ml-6 mt-2 space-y-1">
                        {items.slice(0, 5).map((item, i) => (
                          <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <ChevronRight className="h-3 w-3" />
                            {item}
                          </div>
                        ))}
                        {items.length > 5 && (
                          <div className="text-sm text-muted-foreground">
                            ...还有 {items.length - 5} 项
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                开始生成
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function ContentGeneratorPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContentStats | undefined>();
  const [tasks, setTasks] = useState<GeneratorTask[]>([]);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [quickDialogOpen, setQuickDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // 加载数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes] = await Promise.all([
        generatorApi.getStats(),
        generatorApi.getTasks({ page, page_size: pageSize }),
      ]);
      setStats(statsRes);
      setTasks(tasksRes.tasks || []);
      setTasksTotal(tasksRes.total || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 轮询更新任务状态
  useEffect(() => {
    const hasProcessingTask = tasks.some((t) => t.status === "processing" || t.status === "pending");
    if (!hasProcessingTask) return;

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [tasks, fetchData]);

  // 快速生成
  const handleQuickGenerate = async (subject: Subject, type: "categories" | "courses", categoryId?: number) => {
    setGenerating(true);
    try {
      let task: GeneratorTask;
      if (type === "categories") {
        task = await generatorApi.quickGenerateCategories(subject);
      } else {
        // TODO: 需要先获取分类ID
        task = await generatorApi.quickGenerateCourses(subject, categoryId || 1);
      }
      toast.success(`任务已创建: ${task.template_name || getTaskTypeLabel(task.task_type)}`);
      setQuickDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const totalPages = Math.ceil(tasksTotal / pageSize);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-amber-500" />
            内容生成器
          </h1>
          <p className="text-muted-foreground">快速生成学习包课程内容</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button size="sm" onClick={() => setQuickDialogOpen(true)}>
            <Wand2 className="mr-2 h-4 w-4" />
            快速生成
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <StatsCards stats={stats} loading={loading} />

      {/* 内容 */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2">
            <List className="h-4 w-4" />
            生成任务
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            结构预览
          </TabsTrigger>
        </TabsList>

        {/* 任务列表 */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>任务列表</CardTitle>
              <CardDescription>查看内容生成任务的执行状态</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无生成任务</p>
                  <p className="text-sm">点击"快速生成"开始创建内容</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>任务</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>进度</TableHead>
                          <TableHead>创建时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {task.template_name || `任务 #${task.id}`}
                                </p>
                                {task.subject && (
                                  <p className="text-sm text-muted-foreground">
                                    {getSubjectIcon(task.subject as Subject)} {getSubjectName(task.subject as Subject)}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getTaskTypeLabel(task.task_type as any)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <TaskStatusBadge status={task.status} />
                            </TableCell>
                            <TableCell className="min-w-[200px]">
                              <div className="space-y-1">
                                <ProgressBar progress={task.progress} />
                                <div className="text-xs text-muted-foreground">
                                  {task.success_items}/{task.total_items} 成功
                                  {task.failed_items > 0 && (
                                    <span className="text-red-500 ml-2">
                                      {task.failed_items} 失败
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(task.created_at).toLocaleString("zh-CN")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* 分页 */}
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
        </TabsContent>

        {/* 结构预览 */}
        <TabsContent value="preview">
          <StructurePreview />
        </TabsContent>
      </Tabs>

      {/* 快速生成对话框 */}
      <QuickGenerateDialog
        open={quickDialogOpen}
        onOpenChange={setQuickDialogOpen}
        onGenerate={handleQuickGenerate}
        loading={generating}
      />
    </div>
  );
}

// ============================================
// Structure Preview Component
// ============================================

function StructurePreview() {
  const [subject, setSubject] = useState<Subject>("xingce");
  const [structure, setStructure] = useState<SubjectStructure | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    generatorApi
      .getSubjectStructure(subject)
      .then(setStructure)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [subject]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>预设课程结构</CardTitle>
            <CardDescription>查看各科目的预设课程分类和知识点结构</CardDescription>
          </div>
          <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.icon} {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <div className="ml-6 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : structure ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(structure.structure).map(([category, items], idx) => (
              <div key={idx} className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FolderTree className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">{category}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {items.length} 个知识点
                  </Badge>
                </div>
                {items.length > 0 ? (
                  <div className="space-y-1">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground py-1 px-2 rounded hover:bg-gray-50"
                      >
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    暂无子分类
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>加载结构失败</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
