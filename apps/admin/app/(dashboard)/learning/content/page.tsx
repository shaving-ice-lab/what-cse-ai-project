"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  RefreshCw,
  Search,
  Upload,
  FileText,
  Video,
  FileQuestion,
  BookOpen,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  PlayCircle,
  Download,
  Trash2,
  Eye,
  Settings,
  BarChart3,
  Layers,
  Wand2,
  FileUp,
  AlertCircle,
  Loader2,
  ChevronRight,
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
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
  Textarea,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch,
} from "@what-cse/ui";
import {
  contentGeneratorApi,
  ContentTask,
  ContentStats,
  CourseTemplate,
  TaskStatus,
  getTaskStatusLabel,
  getTaskTypeLabel,
  getSubjectLabel,
} from "@/services/content-generator-api";
import { toast } from "sonner";

// ============================================
// Stats Overview Component
// ============================================

interface StatsOverviewProps {
  stats?: ContentStats;
  loading: boolean;
}

function StatsOverview({ stats, loading }: StatsOverviewProps) {
  const cards = [
    {
      title: "课程分类",
      value: stats?.total_categories || 0,
      icon: Layers,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "课程数量",
      value: stats?.total_courses || 0,
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "章节数量",
      value: stats?.total_chapters || 0,
      icon: FileText,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "知识点",
      value: stats?.total_knowledge_points || 0,
      icon: Sparkles,
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
            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Task Status Badge
// ============================================

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const variants: Record<TaskStatus, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
    pending: { variant: "outline", icon: Clock },
    processing: { variant: "secondary", icon: Loader2 },
    completed: { variant: "default", icon: CheckCircle },
    failed: { variant: "destructive", icon: XCircle },
  };

  const { variant, icon: Icon } = variants[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />
      {getTaskStatusLabel(status)}
    </Badge>
  );
}

// ============================================
// Quick Generate Panel
// ============================================

interface QuickGeneratePanelProps {
  onTaskCreated: () => void;
}

function QuickGeneratePanel({ onTaskCreated }: QuickGeneratePanelProps) {
  const [generating, setGenerating] = useState<string | null>(null);

  const subjects = [
    { key: "xingce", name: "行测", description: "言语、数量、判断、资料、常识" },
    { key: "shenlun", name: "申论", description: "归纳概括、综合分析、贯彻执行、大作文" },
    { key: "mianshi", name: "面试", description: "结构化面试、无领导小组讨论" },
    { key: "gongji", name: "公基", description: "政治、法律、经济、历史、地理" },
  ];

  const handleQuickGenerate = async (subject: string, type: "categories" | "courses") => {
    setGenerating(`${subject}-${type}`);
    try {
      if (type === "categories") {
        await contentGeneratorApi.quickGenerateCategories(subject);
        toast.success(`${getSubjectLabel(subject)}分类结构生成任务已创建`);
      } else {
        // For courses, we need a category ID - this is a simplified example
        toast.info("请先生成分类结构，然后在分类管理中选择分类生成课程");
      }
      onTaskCreated();
    } catch (error: any) {
      toast.error(error.message || "生成失败");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-500" />
          快速生成
        </CardTitle>
        <CardDescription>一键生成预设的课程结构和内容框架</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject) => (
            <div
              key={subject.key}
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <h4 className="font-medium mb-1">{subject.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{subject.description}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  disabled={generating !== null}
                  onClick={() => handleQuickGenerate(subject.key, "categories")}
                >
                  {generating === `${subject.key}-categories` ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Layers className="h-3 w-3 mr-1" />
                  )}
                  生成分类
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// AI Content Generation Panel
// ============================================

interface AIGeneratePanelProps {
  onTaskCreated: () => void;
}

function AIGeneratePanel({ onTaskCreated }: AIGeneratePanelProps) {
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generateType, setGenerateType] = useState<string>("question_analysis");
  const [options, setOptions] = useState({
    batch_size: 50,
    overwrite: false,
  });

  const generateTypes = [
    { value: "question_analysis", label: "题目解析生成", description: "为题目自动生成详细解析" },
    { value: "knowledge_summary", label: "知识点总结", description: "根据课程内容生成知识点摘要" },
    { value: "similar_questions", label: "相似题生成", description: "根据原题生成变形练习题" },
    { value: "material_classify", label: "素材分类整理", description: "自动分类整理素材库" },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await contentGeneratorApi.generateAIContent({
        generate_type: generateType as any,
        options: {
          batch_size: options.batch_size,
          overwrite: options.overwrite,
        },
      });
      toast.success("AI内容生成任务已创建");
      setDialogOpen(false);
      onTaskCreated();
    } catch (error: any) {
      toast.error(error.message || "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI 内容生成
          </CardTitle>
          <CardDescription>使用 AI 自动生成题目解析、知识点总结等内容</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {generateTypes.map((type) => (
              <button
                key={type.value}
                className="p-4 border rounded-lg text-left hover:border-amber-500/50 hover:bg-amber-50/50 transition-colors"
                onClick={() => {
                  setGenerateType(type.value);
                  setDialogOpen(true);
                }}
              >
                <h4 className="font-medium mb-1">{type.label}</h4>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI 内容生成设置</DialogTitle>
            <DialogDescription>
              配置 AI 生成参数，系统将自动处理符合条件的内容
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>生成类型</Label>
              <Select value={generateType} onValueChange={setGenerateType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>批量处理数量</Label>
              <Select
                value={options.batch_size.toString()}
                onValueChange={(v) => setOptions({ ...options, batch_size: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 条</SelectItem>
                  <SelectItem value="50">50 条</SelectItem>
                  <SelectItem value="100">100 条</SelectItem>
                  <SelectItem value="500">500 条</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={options.overwrite}
                onCheckedChange={(checked) => setOptions({ ...options, overwrite: checked })}
              />
              <Label>覆盖已有内容</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              开始生成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================
// Import Panel
// ============================================

interface ImportPanelProps {
  onTaskCreated: () => void;
}

function ImportPanel({ onTaskCreated }: ImportPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importConfig, setImportConfig] = useState({
    import_type: "questions" as "questions" | "courses" | "materials" | "knowledge_points",
    file_format: "excel" as "excel" | "json" | "csv",
    skip_duplicates: true,
    auto_publish: false,
  });
  const [fileContent, setFileContent] = useState<string>("");

  const importTypes = [
    { value: "questions", label: "题目批量导入", icon: FileQuestion },
    { value: "courses", label: "课程批量导入", icon: BookOpen },
    { value: "materials", label: "素材批量导入", icon: FileText },
    { value: "knowledge_points", label: "知识点导入", icon: Layers },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string)?.split(",")[1] || "";
      setFileContent(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleImport = async () => {
    if (!fileContent) {
      toast.error("请选择要导入的文件");
      return;
    }

    setImporting(true);
    try {
      await contentGeneratorApi.importContent({
        import_type: importConfig.import_type,
        file_format: importConfig.file_format,
        data: fileContent,
        options: {
          skip_duplicates: importConfig.skip_duplicates,
          auto_publish: importConfig.auto_publish,
        },
      });
      toast.success("导入任务已创建");
      setDialogOpen(false);
      setFileContent("");
      onTaskCreated();
    } catch (error: any) {
      toast.error(error.message || "导入失败");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = (type: string) => {
    // In a real implementation, this would download a template file
    toast.info(`${type} 导入模板下载功能开发中...`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-green-500" />
            数据导入
          </CardTitle>
          <CardDescription>批量导入题目、课程、素材等内容</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {importTypes.map((type) => (
              <div
                key={type.value}
                className="p-4 border rounded-lg hover:border-green-500/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <type.icon className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">{type.label}</h4>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleDownloadTemplate(type.value)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    模板
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setImportConfig({ ...importConfig, import_type: type.value as any });
                      setDialogOpen(true);
                    }}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    导入
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>数据导入</DialogTitle>
            <DialogDescription>
              选择文件并配置导入选项
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>导入类型</Label>
              <Select
                value={importConfig.import_type}
                onValueChange={(v) => setImportConfig({ ...importConfig, import_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {importTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>文件格式</Label>
              <Select
                value={importConfig.file_format}
                onValueChange={(v) => setImportConfig({ ...importConfig, file_format: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>选择文件</Label>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv,.json"
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={importConfig.skip_duplicates}
                  onCheckedChange={(checked) =>
                    setImportConfig({ ...importConfig, skip_duplicates: checked })
                  }
                />
                <Label>跳过重复内容</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={importConfig.auto_publish}
                  onCheckedChange={(checked) =>
                    setImportConfig({ ...importConfig, auto_publish: checked })
                  }
                />
                <Label>自动发布</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImport} disabled={importing || !fileContent}>
              {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              开始导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================
// Quality Check Panel
// ============================================

interface QualityCheckPanelProps {
  onTaskCreated: () => void;
}

function QualityCheckPanel({ onTaskCreated }: QualityCheckPanelProps) {
  const [running, setRunning] = useState<string | null>(null);

  const checkTypes = [
    {
      key: "typo",
      name: "错别字检查",
      description: "检查题目和解析中的错别字",
      icon: AlertCircle,
      color: "text-red-500",
    },
    {
      key: "format",
      name: "格式规范检查",
      description: "检查内容格式是否符合规范",
      icon: Settings,
      color: "text-amber-500",
    },
    {
      key: "duplicate",
      name: "重复内容检测",
      description: "检测重复或高度相似的内容",
      icon: FileText,
      color: "text-blue-500",
    },
    {
      key: "coverage",
      name: "知识点覆盖分析",
      description: "分析知识点的内容覆盖情况",
      icon: BarChart3,
      color: "text-green-500",
    },
    {
      key: "difficulty",
      name: "难度分布分析",
      description: "分析题目难度分布是否合理",
      icon: Layers,
      color: "text-purple-500",
    },
  ];

  const handleRunCheck = async (checkType: string) => {
    setRunning(checkType);
    try {
      await contentGeneratorApi.runQualityCheck(checkType, "all");
      toast.success("质量检查任务已创建");
      onTaskCreated();
    } catch (error: any) {
      toast.error(error.message || "检查失败");
    } finally {
      setRunning(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-500" />
          内容质量检查
        </CardTitle>
        <CardDescription>检查并提升内容质量，发现潜在问题</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {checkTypes.map((check) => (
            <button
              key={check.key}
              className="p-4 border rounded-lg text-left hover:border-primary/50 hover:shadow-sm transition-all"
              disabled={running !== null}
              onClick={() => handleRunCheck(check.key)}
            >
              <check.icon className={`h-5 w-5 ${check.color} mb-2`} />
              <h4 className="font-medium text-sm mb-1">{check.name}</h4>
              <p className="text-xs text-muted-foreground">{check.description}</p>
              {running === check.key && (
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  运行中...
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Tasks List
// ============================================

interface TasksListProps {
  tasks: ContentTask[];
  loading: boolean;
  onRefresh: () => void;
}

function TasksList({ tasks, loading, onRefresh }: TasksListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>任务队列</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>任务队列</CardTitle>
          <CardDescription>最近的内容生成和导入任务</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无任务</p>
            <p className="text-sm">使用上方工具创建内容生成或导入任务</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任务类型</TableHead>
                  <TableHead>科目</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getTaskTypeLabel(task.task_type)}</span>
                        {task.template_name && (
                          <span className="text-xs text-muted-foreground">
                            ({task.template_name})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.subject ? (
                        <Badge variant="outline">{getSubjectLabel(task.subject)}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="space-y-1">
                        <Progress value={task.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {task.success_items}/{task.total_items}
                          </span>
                          <span>{task.progress.toFixed(0)}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TaskStatusBadge status={task.status} />
                      {task.failed_items > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {task.failed_items} 失败
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(task.created_at).toLocaleString("zh-CN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function ContentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContentStats | undefined>();
  const [tasks, setTasks] = useState<ContentTask[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes] = await Promise.all([
        contentGeneratorApi.getStats(),
        contentGeneratorApi.getTasks({ page: 1, page_size: 10 }),
      ]);
      setStats(statsRes);
      setTasks(tasksRes.tasks || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Use mock data if API fails
      setStats({
        total_categories: 0,
        total_courses: 0,
        total_chapters: 0,
        total_knowledge_points: 0,
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTaskCreated = () => {
    // Refresh tasks after a short delay
    setTimeout(fetchData, 500);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-500" />
            内容管理中心
          </h1>
          <p className="text-muted-foreground">
            管理课程内容、题库、素材的生成、导入和质量检查
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 统计概览 */}
      <StatsOverview stats={stats} loading={loading} />

      {/* 功能标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="generate">内容生成</TabsTrigger>
          <TabsTrigger value="import">数据导入</TabsTrigger>
          <TabsTrigger value="quality">质量检查</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* 快速生成 */}
          <QuickGeneratePanel onTaskCreated={handleTaskCreated} />

          {/* 任务队列 */}
          <TasksList tasks={tasks} loading={loading} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="generate" className="space-y-6 mt-6">
          {/* 快速生成 */}
          <QuickGeneratePanel onTaskCreated={handleTaskCreated} />

          {/* AI 内容生成 */}
          <AIGeneratePanel onTaskCreated={handleTaskCreated} />

          {/* 任务队列 */}
          <TasksList tasks={tasks} loading={loading} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="import" className="space-y-6 mt-6">
          {/* 数据导入 */}
          <ImportPanel onTaskCreated={handleTaskCreated} />

          {/* 任务队列 */}
          <TasksList tasks={tasks} loading={loading} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="quality" className="space-y-6 mt-6">
          {/* 质量检查 */}
          <QualityCheckPanel onTaskCreated={handleTaskCreated} />

          {/* 任务队列 */}
          <TasksList tasks={tasks} loading={loading} onRefresh={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
