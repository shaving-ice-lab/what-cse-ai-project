"use client";

import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import Link from "next/link";
import { useToolbar } from "./ToolbarContext";
import {
  FileQuestion,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  RefreshCw,
  Eye,
  Upload,
  Filter,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  CircleDot,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Copy,
  FileUp,
  Sparkles,
} from "lucide-react";
import { ImportDialog } from "./QuestionImportDialog";
import { AIGenerateDialog } from "./QuestionAIGenerateDialog";
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
  Question,
  QuestionType,
  QuestionSourceType,
  QuestionStatus,
  CreateQuestionRequest,
  getQuestionTypeName,
  getSourceTypeName,
  getDifficultyLabel,
  getDifficultyColor,
  getQuestionStatusLabel,
  getExamTypeOptions,
  getYearOptions,
} from "@/services/question-api";
import { courseApi, CourseCategory } from "@/services/course-api";
import { toast } from "sonner";

// ============================================
// Stats Cards Component
// ============================================

interface StatsCardsProps {
  questions: Question[];
  loading: boolean;
}

function StatsCards({ questions, loading }: StatsCardsProps) {
  const totalQuestions = questions.length;
  const publishedQuestions = questions.filter((q) => q.status === 1).length;
  const draftQuestions = questions.filter((q) => q.status === 0).length;
  const avgCorrectRate =
    questions.length > 0
      ? questions.reduce((sum, q) => sum + q.correct_rate, 0) / questions.length
      : 0;

  const cards = [
    {
      title: "总题目数",
      value: totalQuestions,
      icon: FileQuestion,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "已发布",
      value: publishedQuestions,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "草稿",
      value: draftQuestions,
      icon: FileText,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "平均正确率",
      value: `${avgCorrectRate.toFixed(1)}%`,
      icon: TrendingUp,
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
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Question Form Dialog
// ============================================

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CourseCategory[];
  onSubmit: (data: CreateQuestionRequest) => void;
}

function QuestionFormDialog({
  open,
  onOpenChange,
  categories,
  onSubmit,
}: QuestionFormDialogProps) {
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    category_id: 0,
    question_type: "single_choice",
    difficulty: 3,
    source_type: "mock",
    content: "",
    answer: "",
    analysis: "",
    tips: "",
    options: [
      { key: "A", content: "" },
      { key: "B", content: "" },
      { key: "C", content: "" },
      { key: "D", content: "" },
    ],
    is_vip: false,
    status: 0,
  });

  const handleSubmit = () => {
    if (!formData.content || !formData.category_id) {
      toast.error("请填写题目内容和选择分类");
      return;
    }
    if (!formData.answer) {
      toast.error("请填写正确答案");
      return;
    }
    onSubmit(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      category_id: 0,
      question_type: "single_choice",
      difficulty: 3,
      source_type: "mock",
      content: "",
      answer: "",
      analysis: "",
      tips: "",
      options: [
        { key: "A", content: "" },
        { key: "B", content: "" },
        { key: "C", content: "" },
        { key: "D", content: "" },
      ],
      is_vip: false,
      status: 0,
    });
  };

  const handleOptionChange = (index: number, content: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = { ...newOptions[index], content };
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    const currentOptions = formData.options || [];
    const nextKey = String.fromCharCode(65 + currentOptions.length); // A, B, C, D, E...
    setFormData({
      ...formData,
      options: [...currentOptions, { key: nextKey, content: "" }],
    });
  };

  const removeOption = (index: number) => {
    const currentOptions = formData.options || [];
    if (currentOptions.length <= 2) {
      toast.error("至少需要2个选项");
      return;
    }
    const newOptions = currentOptions.filter((_, i) => i !== index);
    // Re-key options
    const reKeyedOptions = newOptions.map((opt, i) => ({
      ...opt,
      key: String.fromCharCode(65 + i),
    }));
    setFormData({ ...formData, options: reKeyedOptions });
  };

  // Flatten categories for select
  const flattenCategories = (
    cats: CourseCategory[],
    level = 0
  ): { id: number; name: string; level: number }[] => {
    const result: { id: number; name: string; level: number }[] = [];
    for (const cat of cats) {
      result.push({ id: cat.id, name: cat.name, level });
      if (cat.children) {
        result.push(...flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  };

  const flatCategories = flattenCategories(categories);
  const isChoiceType = ["single_choice", "multi_choice", "judge"].includes(formData.question_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">新建题目</DialogTitle>
          <DialogDescription className="text-xs">创建新的练习题目</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">所属分类 *</Label>
              <Select
                value={formData.category_id ? formData.category_id.toString() : ""}
                onValueChange={(v) =>
                  setFormData({ ...formData, category_id: Number(v) })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {"　".repeat(cat.level)}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">题型 *</Label>
              <Select
                value={formData.question_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, question_type: v as QuestionType })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_choice">单选题</SelectItem>
                  <SelectItem value="multi_choice">多选题</SelectItem>
                  <SelectItem value="judge">判断题</SelectItem>
                  <SelectItem value="fill_blank">填空题</SelectItem>
                  <SelectItem value="essay">简答题</SelectItem>
                  <SelectItem value="material">材料题</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">难度</Label>
              <Select
                value={formData.difficulty.toString()}
                onValueChange={(v) =>
                  setFormData({ ...formData, difficulty: Number(v) })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">入门</SelectItem>
                  <SelectItem value="2">简单</SelectItem>
                  <SelectItem value="3">中等</SelectItem>
                  <SelectItem value="4">困难</SelectItem>
                  <SelectItem value="5">极难</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">来源类型</Label>
              <Select
                value={formData.source_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, source_type: v as QuestionSourceType })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real_exam">真题</SelectItem>
                  <SelectItem value="mock">模拟题</SelectItem>
                  <SelectItem value="original">原创题</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">来源年份</Label>
              <Select
                value={formData.source_year?.toString() || ""}
                onValueChange={(v) =>
                  setFormData({ ...formData, source_year: v ? Number(v) : undefined })
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

          {/* 题目内容 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">题目内容 *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="输入题目内容..."
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* 选项（仅选择题） */}
          {isChoiceType && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">选项</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加
                </Button>
              </div>
              <div className="space-y-1.5">
                {(formData.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-center text-sm font-medium text-muted-foreground">{option.key}.</span>
                    <Input
                      value={option.content}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`选项 ${option.key}`}
                      className="flex-1 h-9 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 正确答案 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">正确答案 *</Label>
            {isChoiceType ? (
              <Input
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value.toUpperCase() })
                }
                placeholder={formData.question_type === "multi_choice" ? "多选请用逗号分隔，如：A,B,D" : "输入正确选项，如：A"}
                maxLength={formData.question_type === "multi_choice" ? 20 : 1}
                className="h-9 text-sm"
              />
            ) : (
              <Textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="输入正确答案..."
                rows={2}
                className="text-sm resize-none"
              />
            )}
          </div>

          {/* 解析 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">答案解析</Label>
            <Textarea
              value={formData.analysis}
              onChange={(e) =>
                setFormData({ ...formData, analysis: e.target.value })
              }
              placeholder="输入答案解析..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* 解题技巧 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">解题技巧</Label>
            <Textarea
              value={formData.tips}
              onChange={(e) =>
                setFormData({ ...formData, tips: e.target.value })
              }
              placeholder="输入解题技巧（可选）..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* 设置 */}
          <div className="flex items-center gap-6 pt-1">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_vip}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_vip: checked })
                }
              />
              <Label className="text-sm">VIP专属</Label>
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
          <Button size="sm" onClick={handleSubmit}>创建题目</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function QuestionManager() {
  const { setToolbarContent } = useToolbar();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<number | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<QuestionSourceType | "all">("all");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [aiGenerateDialogOpen, setAiGenerateDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesRes, questionsRes] = await Promise.all([
        courseApi.getCategories(),
        questionApi.getQuestions({
          page,
          page_size: pageSize,
          keyword: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          category_id: categoryFilter !== "all" ? categoryFilter : undefined,
          question_type: typeFilter !== "all" ? typeFilter : undefined,
          difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
          source_type: sourceFilter !== "all" ? sourceFilter : undefined,
        }),
      ]);

      setCategories(categoriesRes.categories || []);
      setQuestions(questionsRes.questions || []);
      setTotal(questionsRes.total || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, categoryFilter, typeFilter, difficultyFilter, sourceFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 创建题目
  const handleCreateQuestion = async (data: CreateQuestionRequest) => {
    try {
      await questionApi.createQuestion(data);
      toast.success("题目已创建");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "创建失败");
    }
  };

  // 删除题目
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该题目吗？删除后不可恢复。")) return;
    try {
      await questionApi.deleteQuestion(id);
      toast.success("题目已删除");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // 更新题目状态
  const handleToggleStatus = async (question: Question) => {
    const newStatus = question.status === 1 ? 0 : 1;
    try {
      await questionApi.updateQuestion(question.id, { status: newStatus as QuestionStatus });
      toast.success(newStatus === 1 ? "题目已发布" : "题目已下架");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  // 复制题目
  const handleCopy = async (question: Question) => {
    try {
      const newQuestion: CreateQuestionRequest = {
        category_id: question.category_id,
        question_type: question.question_type,
        difficulty: question.difficulty,
        source_type: question.source_type,
        source_year: question.source_year,
        source_region: question.source_region,
        source_exam: question.source_exam,
        content: question.content + " (副本)",
        options: question.options,
        answer: question.answer,
        analysis: question.analysis,
        tips: question.tips,
        knowledge_points: question.knowledge_points,
        tags: question.tags,
        is_vip: question.is_vip,
        status: 0,
      };
      await questionApi.createQuestion(newQuestion);
      toast.success("题目已复制");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "复制失败");
    }
  };

  // Flatten categories
  const flattenCategories = (
    cats: CourseCategory[],
    level = 0
  ): { id: number; name: string; level: number }[] => {
    const result: { id: number; name: string; level: number }[] = [];
    for (const cat of cats) {
      result.push({ id: cat.id, name: cat.name, level });
      if (cat.children) {
        result.push(...flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  };

  const flatCategories = flattenCategories(categories);
  const totalPages = Math.ceil(total / pageSize);

  // 截断内容显示
  const truncateContent = (content: string, maxLength = 80) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  // Register toolbar content
  useLayoutEffect(() => {
    setToolbarContent(
      <>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索题目..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="h-8 w-40 pl-8 pr-3 text-sm bg-muted/40 border-transparent focus:border-border focus:bg-background transition-colors"
          />
        </div>
        <Button size="sm" variant="ghost" onClick={() => setImportDialogOpen(true)} className="h-8 w-8 p-0">
          <FileUp className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setAiGenerateDialogOpen(true)} className="h-8 w-8 p-0">
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={fetchData} disabled={loading} className="h-8 w-8 p-0">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}
          className="h-8 px-3 text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-sm">
          <Plus className="mr-1 h-3.5 w-3.5" />
          新建
        </Button>
      </>
    );
    return () => setToolbarContent(null);
  }, [setToolbarContent, searchTerm, loading]);

  return (
    <div className="h-full flex flex-col">
      {/* Mini Stats Bar */}
      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-b border-border/30 bg-muted/20 overflow-x-auto">
        {[
          { label: "全部", value: questions.length, icon: FileQuestion },
          { label: "单选", value: questions.filter(q => q.question_type === "single_choice").length, icon: CheckCircle },
          { label: "多选", value: questions.filter(q => q.question_type === "multi_choice").length, icon: CheckSquare },
          { label: "判断", value: questions.filter(q => q.question_type === "judge").length, icon: CircleDot },
          { label: "已发布", value: questions.filter(q => q.status === 1).length, icon: CheckCircle2 },
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
            <Select value={statusFilter === "all" ? "all" : statusFilter.toString()} onValueChange={(v) => { setStatusFilter(v === "all" ? "all" : (Number(v) as QuestionStatus)); setPage(1); }}>
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

            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as QuestionType | "all"); setPage(1); }}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue placeholder="题型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部题型</SelectItem>
                <SelectItem value="single_choice">单选</SelectItem>
                <SelectItem value="multi_choice">多选</SelectItem>
                <SelectItem value="judge">判断</SelectItem>
                <SelectItem value="fill_blank">填空</SelectItem>
                <SelectItem value="essay">简答</SelectItem>
                <SelectItem value="material">材料</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter === "all" ? "all" : difficultyFilter.toString()} onValueChange={(v) => { setDifficultyFilter(v === "all" ? "all" : Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue placeholder="难度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部难度</SelectItem>
                <SelectItem value="1">入门</SelectItem>
                <SelectItem value="2">简单</SelectItem>
                <SelectItem value="3">中等</SelectItem>
                <SelectItem value="4">困难</SelectItem>
                <SelectItem value="5">极难</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v as QuestionSourceType | "all"); setPage(1); }}>
              <SelectTrigger className="w-[85px] h-8 text-xs">
                <SelectValue placeholder="来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="real_exam">真题</SelectItem>
                <SelectItem value="mock">模拟</SelectItem>
                <SelectItem value="original">原创</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter === "all" ? "all" : categoryFilter.toString()} onValueChange={(v) => { setCategoryFilter(v === "all" ? "all" : Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {flatCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{"　".repeat(cat.level)}{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">共 {total} 题</span>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-transparent">
                    <Skeleton className="h-3.5 w-10" />
                    <Skeleton className="h-3.5 w-48 flex-1" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-10 rounded-full" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileQuestion className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">暂无题目</p>
                <p className="text-xs mt-1 opacity-70">点击"新建"添加题目</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[45px] py-2 text-xs">ID</TableHead>
                    <TableHead className="min-w-[220px] py-2 text-xs">题目内容</TableHead>
                    <TableHead className="w-[70px] py-2 text-xs">题型</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">难度</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">来源</TableHead>
                    <TableHead className="w-[90px] py-2 text-xs">正确率</TableHead>
                    <TableHead className="w-[90px] py-2 text-xs">状态</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">操作</TableHead>
                  </TableRow>
                </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id} className="hover:bg-muted/50">
                        <TableCell className="py-2 font-mono text-xs text-muted-foreground">
                          #{question.id}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="space-y-0.5">
                            <p className="text-sm line-clamp-2">{truncateContent(question.content)}</p>
                            <div className="flex items-center gap-1.5">
                              {question.category && (
                                <Badge variant="outline" className="text-xs">
                                  {question.category.name}
                                </Badge>
                              )}
                              {question.source_year && (
                                <span className="text-xs text-muted-foreground">
                                  {question.source_year}年
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="secondary" className="text-xs">
                            {getQuestionTypeName(question.question_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                            {getDifficultyLabel(question.difficulty)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {getSourceTypeName(question.source_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1 text-sm">
                            <span className={question.correct_rate >= 50 ? "text-green-600" : "text-amber-600"}>
                              {question.correct_rate.toFixed(1)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({question.attempt_count})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1">
                            <Badge
                              variant={
                                question.status === 1
                                  ? "default"
                                  : question.status === 2
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {getQuestionStatusLabel(question.status)}
                            </Badge>
                            {question.is_vip && (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                                VIP
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
                                <Link href={`/learning/questions/${question.id}`}>
                                  <Edit className="mr-2 h-3.5 w-3.5" />
                                  编辑
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopy(question)} className="text-sm">
                                <Copy className="mr-2 h-3.5 w-3.5" />
                                复制
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(question)} className="text-sm">
                                {question.status === 1 ? (
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
                                onClick={() => handleDelete(question.id)}
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
                <span className="text-xs text-muted-foreground">共 {total} 条</span>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>上一页</Button>
                  <span className="text-xs px-2">{page} / {totalPages}</span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一页</Button>
                </div>
              </div>
            )}
          </Card>
        </div>

      {/* 新建题目对话框 */}
      <QuestionFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        categories={categories}
        onSubmit={handleCreateQuestion}
      />

      {/* 批量导入对话框 */}
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        categories={categories}
        onSuccess={fetchData}
      />

      {/* AI 生成对话框 */}
      <AIGenerateDialog
        open={aiGenerateDialogOpen}
        onOpenChange={setAiGenerateDialogOpen}
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
}
