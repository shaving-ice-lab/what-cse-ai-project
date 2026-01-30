"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileStack,
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  XCircle,
  Clock,
  Users,
  Trophy,
  FileQuestion,
  GripVertical,
  Search,
  CheckCircle,
  Shuffle,
  Loader2,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Layers,
  FolderPlus,
  Pencil,
  Filter,
  Edit,
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
  Label,
  Skeleton,
  Switch,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@what-cse/ui";
import {
  questionApi,
  ExamPaper,
  Question,
  PaperType,
  PaperStatus,
  PaperQuestion,
  UpdatePaperRequest,
  getPaperTypeName,
  getPaperStatusLabel,
  getExamTypeOptions,
  getSubjectOptions,
  getYearOptions,
  getQuestionTypeName,
  getDifficultyLabel,
  getDifficultyColor,
  getCategoryOptions,
} from "@/services/question-api";
import { toast } from "sonner";

// ============================================
// Paper Section Interface
// ============================================

interface PaperSection {
  id: string;
  name: string;
  description?: string;
  questionIds: number[];
}

// ============================================
// Question Select Dialog (with Knowledge Point Filter)
// ============================================

interface QuestionSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (questions: Question[]) => void;
  selectedIds: number[];
}

function QuestionSelectDialog({
  open,
  onOpenChange,
  onSelect,
  selectedIds,
}: QuestionSelectDialogProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Filter states
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const categoryOptions = getCategoryOptions();

  // Get current subject's category options
  const getCurrentCategoryOptions = () => {
    if (filterSubject === "all") return [];
    const subjectData = categoryOptions[filterSubject as keyof typeof categoryOptions];
    return subjectData?.children || [];
  };

  const subjectOptions = [
    { value: "all", label: "全部科目" },
    { value: "xingce", label: "行测" },
    { value: "shenlun", label: "申论" },
    { value: "mianshi", label: "面试" },
    { value: "gongji", label: "公基" },
  ];

  const difficultyOptions = [
    { value: "all", label: "全部难度" },
    { value: "1", label: "入门" },
    { value: "2", label: "简单" },
    { value: "3", label: "中等" },
    { value: "4", label: "困难" },
    { value: "5", label: "极难" },
  ];

  // Reset category when subject changes
  useEffect(() => {
    setFilterCategory("all");
  }, [filterSubject]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        page_size: pageSize,
        keyword: searchTerm || undefined,
        status: 1, // Only published questions
      };
      if (filterSubject !== "all") params.subject = filterSubject;
      if (filterCategory !== "all") params.category = filterCategory;
      if (filterDifficulty !== "all") params.difficulty = parseInt(filterDifficulty);

      const res = await questionApi.getQuestions(params);
      setQuestions(res.questions || []);
      setTotal(res.total || 0);
    } catch (error) {
      toast.error("加载题目失败");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, filterSubject, filterCategory, filterDifficulty]);

  useEffect(() => {
    if (open) {
      fetchQuestions();
      setSelected([]);
    }
  }, [open, fetchQuestions]);

  const toggleSelect = (question: Question) => {
    if (selectedIds.includes(question.id)) {
      return; // Already in paper
    }
    const isSelected = selected.some((q) => q.id === question.id);
    if (isSelected) {
      setSelected(selected.filter((q) => q.id !== question.id));
    } else {
      setSelected([...selected, question]);
    }
  };

  const handleConfirm = () => {
    onSelect(selected);
    onOpenChange(false);
  };

  const totalPages = Math.ceil(total / pageSize);
  const hasActiveFilters = filterSubject !== "all" || filterCategory !== "all" || filterDifficulty !== "all";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            按知识点选题
          </DialogTitle>
          <DialogDescription>
            从题库中筛选并选择题目添加到试卷（已选择 {selected.length} 题）
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索题目..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Button 
            variant={hasActiveFilters ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            筛选
            {hasActiveFilters && <Badge variant="secondary" className="ml-1 text-xs">{
              [filterSubject !== "all", filterCategory !== "all", filterDifficulty !== "all"].filter(Boolean).length
            }</Badge>}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">科目</Label>
                <Select value={filterSubject} onValueChange={(v) => { setFilterSubject(v); setPage(1); }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">知识点/分类</Label>
                <Select 
                  value={filterCategory} 
                  onValueChange={(v) => { setFilterCategory(v); setPage(1); }}
                  disabled={filterSubject === "all"}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={filterSubject === "all" ? "请先选择科目" : "全部知识点"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部知识点</SelectItem>
                    {getCurrentCategoryOptions().map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">难度</Label>
                <Select value={filterDifficulty} onValueChange={(v) => { setFilterDifficulty(v); setPage(1); }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  找到 {total} 道符合条件的题目
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterSubject("all");
                    setFilterCategory("all");
                    setFilterDifficulty("all");
                    setPage(1);
                  }}
                >
                  清除筛选
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-auto border rounded-md">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>题目内容</TableHead>
                  <TableHead className="w-[100px]">知识点</TableHead>
                  <TableHead className="w-[80px]">题型</TableHead>
                  <TableHead className="w-[80px]">难度</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      没有找到符合条件的题目
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => {
                    const isInPaper = selectedIds.includes(question.id);
                    const isSelected = selected.some((q) => q.id === question.id);
                    return (
                      <TableRow
                        key={question.id}
                        className={`cursor-pointer ${isInPaper ? "opacity-50" : ""}`}
                        onClick={() => toggleSelect(question)}
                      >
                        <TableCell>
                          {isInPaper ? (
                            <Badge variant="outline" className="text-xs">已添加</Badge>
                          ) : (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-4 w-4"
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{question.id}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm line-clamp-2">{question.content}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {question.category || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {getQuestionTypeName(question.question_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                            {getDifficultyLabel(question.difficulty)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2">
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={selected.length === 0}>
            添加 {selected.length} 题
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Random Question Select Dialog
// ============================================

interface RandomSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (questions: Question[]) => void;
  selectedIds: number[];
}

function RandomSelectDialog({
  open,
  onOpenChange,
  onSelect,
  selectedIds,
}: RandomSelectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(10);
  const [subject, setSubject] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [questionType, setQuestionType] = useState<string>("all");
  const [sourceType, setSourceType] = useState<string>("all");
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const categoryOptions = getCategoryOptions();
  
  const subjectOptions = [
    { value: "all", label: "全部科目" },
    { value: "xingce", label: "行测" },
    { value: "shenlun", label: "申论" },
    { value: "mianshi", label: "面试" },
    { value: "gongji", label: "公基" },
  ];

  // 获取当前科目的知识点选项
  const getCurrentCategoryOptions = () => {
    if (subject === "all") return [];
    const subjectData = categoryOptions[subject as keyof typeof categoryOptions];
    return subjectData?.children || [];
  };

  const difficultyOptions = [
    { value: "all", label: "全部难度" },
    { value: "1", label: "入门" },
    { value: "2", label: "简单" },
    { value: "3", label: "中等" },
    { value: "4", label: "困难" },
    { value: "5", label: "极难" },
  ];

  const questionTypeOptions = [
    { value: "all", label: "全部题型" },
    { value: "single_choice", label: "单选题" },
    { value: "multi_choice", label: "多选题" },
    { value: "judge", label: "判断题" },
    { value: "fill_blank", label: "填空题" },
  ];

  const sourceTypeOptions = [
    { value: "all", label: "全部来源" },
    { value: "real_exam", label: "真题" },
    { value: "mock", label: "模拟题" },
    { value: "original", label: "原创题" },
  ];

  // 重置知识点当科目改变时
  useEffect(() => {
    setCategory("all");
  }, [subject]);

  const handlePreview = async () => {
    setLoading(true);
    setShowPreview(false);
    try {
      // Fetch random questions based on criteria
      const params: any = {
        page: 1,
        page_size: count * 3, // Fetch more to filter
        status: 1, // Only published
      };
      if (subject !== "all") params.subject = subject;
      if (category !== "all") params.category = category;
      if (difficulty !== "all") params.difficulty = parseInt(difficulty);
      if (questionType !== "all") params.question_type = questionType;
      if (sourceType !== "all") params.source_type = sourceType;

      const res = await questionApi.getQuestions(params);
      
      // Filter out already selected questions
      let availableQuestions = (res.questions || []).filter(
        (q) => !selectedIds.includes(q.id)
      );
      
      // Randomly select the requested count
      const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));
      
      setPreviewQuestions(selected);
      setShowPreview(true);
      
      if (selected.length < count) {
        toast.info(`仅找到 ${selected.length} 道符合条件的题目`);
      }
    } catch (error) {
      toast.error("获取题目失败");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (previewQuestions.length === 0) {
      toast.error("请先预览题目");
      return;
    }
    onSelect(previewQuestions);
    onOpenChange(false);
    setPreviewQuestions([]);
    setShowPreview(false);
  };

  const handleReroll = () => {
    handlePreview();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (!v) {
        setPreviewQuestions([]);
        setShowPreview(false);
      }
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-violet-500" />
            随机组卷
          </DialogTitle>
          <DialogDescription>
            设置筛选条件，系统将随机抽取题目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 配置区域 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">题目数量</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">科目</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">知识点</Label>
              <Select 
                value={category} 
                onValueChange={setCategory}
                disabled={subject === "all"}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={subject === "all" ? "请先选择科目" : "全部知识点"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部知识点</SelectItem>
                  {getCurrentCategoryOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">难度</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">题型</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">来源</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handlePreview} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {showPreview ? "重新抽取" : "抽取题目"}
            </Button>
            {showPreview && (
              <span className="text-sm text-muted-foreground">
                已抽取 {previewQuestions.length} 道题目
              </span>
            )}
          </div>

          {/* 预览区域 */}
          {showPreview && (
            <div className="border rounded-md max-h-60 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">序号</TableHead>
                    <TableHead>题目内容</TableHead>
                    <TableHead className="w-[80px]">题型</TableHead>
                    <TableHead className="w-[80px]">难度</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        没有找到符合条件的题目
                      </TableCell>
                    </TableRow>
                  ) : (
                    previewQuestions.map((q, index) => (
                      <TableRow key={q.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell>
                          <p className="text-sm line-clamp-2">{q.content}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {getQuestionTypeName(q.question_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getDifficultyColor(q.difficulty)}`}>
                            {getDifficultyLabel(q.difficulty)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={previewQuestions.length === 0}
          >
            添加 {previewQuestions.length} 题
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function PaperEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const paperId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paper, setPaper] = useState<ExamPaper | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdatePaperRequest>({});
  const [paperQuestions, setPaperQuestions] = useState<PaperQuestion[]>([]);
  const [questionDetails, setQuestionDetails] = useState<Map<number, Question>>(new Map());

  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [randomSelectDialogOpen, setRandomSelectDialogOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Section management
  const [sections, setSections] = useState<PaperSection[]>([]);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PaperSection | null>(null);
  const [sectionName, setSectionName] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "sections">("list");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const paperRes = await questionApi.getPaper(paperId);
        setPaper(paperRes);

        // Initialize form data
        setFormData({
          title: paperRes.title,
          paper_type: paperRes.paper_type,
          exam_type: paperRes.exam_type,
          subject: paperRes.subject,
          year: paperRes.year,
          region: paperRes.region,
          total_score: paperRes.total_score,
          time_limit: paperRes.time_limit,
          is_free: paperRes.is_free,
          status: paperRes.status,
          description: paperRes.description,
        });

        setPaperQuestions(paperRes.questions || []);

        // Fetch question details
        if (paperRes.questions && paperRes.questions.length > 0) {
          const questionIds = paperRes.questions.map((q) => q.question_id);
          // Fetch each question detail
          const details = new Map<number, Question>();
          for (const id of questionIds) {
            try {
              const q = await questionApi.getQuestion(id);
              details.set(id, q);
            } catch (e) {
              // Question might not exist
            }
          }
          setQuestionDetails(details);
        }
      } catch (error: any) {
        console.error("Failed to fetch paper:", error);
        toast.error(error.message || "加载试卷失败");
      } finally {
        setLoading(false);
      }
    };

    if (paperId) {
      fetchData();
    }
  }, [paperId]);

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("请填写试卷标题");
      return;
    }

    setSaving(true);
    try {
      const updateData: UpdatePaperRequest = {
        ...formData,
        questions: paperQuestions,
      };
      await questionApi.updatePaper(paperId, updateData);
      toast.success("试卷已保存");
      router.push("/learning/manager?tab=papers");
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除该试卷吗？删除后不可恢复。")) return;
    try {
      await questionApi.deletePaper(paperId);
      toast.success("试卷已删除");
      router.push("/learning/manager?tab=papers");
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  const handleAddQuestions = (questions: Question[]) => {
    const newQuestions: PaperQuestion[] = questions.map((q, index) => ({
      question_id: q.id,
      score: 1, // Default score
      order: paperQuestions.length + index + 1,
    }));
    setPaperQuestions([...paperQuestions, ...newQuestions]);

    // Add to details map
    const newDetails = new Map(questionDetails);
    questions.forEach((q) => newDetails.set(q.id, q));
    setQuestionDetails(newDetails);

    toast.success(`已添加 ${questions.length} 道题目`);
  };

  const handleRemoveQuestion = (questionId: number) => {
    const newQuestions = paperQuestions.filter((q) => q.question_id !== questionId);
    // Re-order
    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index + 1,
    }));
    setPaperQuestions(reorderedQuestions);
  };

  const handleScoreChange = (questionId: number, score: number) => {
    const newQuestions = paperQuestions.map((q) =>
      q.question_id === questionId ? { ...q, score } : q
    );
    setPaperQuestions(newQuestions);
  };

  const calculateTotalScore = () => {
    return paperQuestions.reduce((sum, q) => sum + q.score, 0);
  };

  // 拖拽排序处理
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // 重新排序
    const newQuestions = [...paperQuestions];
    const [draggedItem] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedItem);
    
    // 更新order
    const reorderedQuestions = newQuestions.map((q, i) => ({
      ...q,
      order: i + 1,
    }));
    
    setPaperQuestions(reorderedQuestions);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 上移/下移题目
  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === paperQuestions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...paperQuestions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    // 更新order
    const reorderedQuestions = newQuestions.map((q, i) => ({
      ...q,
      order: i + 1,
    }));

    setPaperQuestions(reorderedQuestions);
  };

  // Section management functions
  const handleAddSection = () => {
    setEditingSection(null);
    setSectionName("");
    setSectionDesc("");
    setSectionDialogOpen(true);
  };

  const handleEditSection = (section: PaperSection) => {
    setEditingSection(section);
    setSectionName(section.name);
    setSectionDesc(section.description || "");
    setSectionDialogOpen(true);
  };

  const handleSaveSection = () => {
    if (!sectionName.trim()) {
      toast.error("请输入分区名称");
      return;
    }

    if (editingSection) {
      // Update existing section
      setSections(sections.map(s => 
        s.id === editingSection.id 
          ? { ...s, name: sectionName, description: sectionDesc }
          : s
      ));
      toast.success("分区已更新");
    } else {
      // Add new section
      const newSection: PaperSection = {
        id: `section-${Date.now()}`,
        name: sectionName,
        description: sectionDesc,
        questionIds: [],
      };
      setSections([...sections, newSection]);
      toast.success("分区已添加");
    }
    setSectionDialogOpen(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!confirm("确定要删除该分区吗？分区内的题目将移至未分类。")) return;
    setSections(sections.filter(s => s.id !== sectionId));
    toast.success("分区已删除");
  };

  const handleAddToSection = (sectionId: string, questionId: number) => {
    // Remove from other sections first
    const newSections = sections.map(s => ({
      ...s,
      questionIds: s.questionIds.filter(id => id !== questionId),
    }));
    // Add to target section
    setSections(newSections.map(s => 
      s.id === sectionId 
        ? { ...s, questionIds: [...s.questionIds, questionId] }
        : s
    ));
  };

  const handleRemoveFromSection = (questionId: number) => {
    setSections(sections.map(s => ({
      ...s,
      questionIds: s.questionIds.filter(id => id !== questionId),
    })));
  };

  // Get questions not in any section
  const getUnsectionedQuestions = () => {
    const allSectionedIds = sections.flatMap(s => s.questionIds);
    return paperQuestions.filter(pq => !allSectionedIds.includes(pq.question_id));
  };

  // Get questions in a section
  const getSectionQuestions = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return [];
    return paperQuestions.filter(pq => section.questionIds.includes(pq.question_id));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-center py-12">
        <FileStack className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">试卷不存在</p>
        <Button asChild className="mt-4">
          <Link href="/learning/manager?tab=papers">返回列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/learning/manager?tab=papers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileStack className="h-6 w-6 text-purple-500" />
              编辑试卷
            </h1>
            <p className="text-muted-foreground">试卷 #{paper.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 左侧：题目管理 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>题目列表</CardTitle>
                <CardDescription>
                  共 {paperQuestions.length} 道题目，总分 {calculateTotalScore()} 分
                  {sections.length > 0 && ` · ${sections.length} 个分区`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-lg p-0.5">
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    className="h-7 px-2"
                    onClick={() => setViewMode("list")}
                  >
                    列表
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "sections" ? "default" : "ghost"}
                    className="h-7 px-2"
                    onClick={() => setViewMode("sections")}
                  >
                    <Layers className="h-3 w-3 mr-1" />
                    分区
                  </Button>
                </div>
                <Button size="sm" variant="outline" onClick={() => setRandomSelectDialogOpen(true)}>
                  <Shuffle className="mr-2 h-4 w-4" />
                  随机组卷
                </Button>
                <Button size="sm" onClick={() => setSelectDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加题目
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "sections" && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <span className="text-sm text-muted-foreground">
                    使用分区可以将题目按类型分组，如"单选题"、"多选题"等
                  </span>
                  <Button size="sm" variant="outline" onClick={handleAddSection}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    新建分区
                  </Button>
                </div>
              )}
              {paperQuestions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无题目</p>
                  <p className="text-sm">点击"添加题目"从题库选择</p>
                </div>
              ) : viewMode === "list" ? (
                // List View
                <div className="space-y-2">
                  {paperQuestions.map((pq, index) => {
                    const question = questionDetails.get(pq.question_id);
                    const isDragging = draggedIndex === index;
                    return (
                      <div
                        key={pq.question_id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all ${
                          isDragging ? "opacity-50 border-primary border-dashed" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing" />
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 p-0"
                              onClick={() => moveQuestion(index, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 p-0"
                              onClick={() => moveQuestion(index, "down")}
                              disabled={index === paperQuestions.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="w-6 text-center font-mono text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          {question ? (
                            <>
                              <p className="text-sm truncate">{question.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {getQuestionTypeName(question.question_type)}
                                </Badge>
                                <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                                  {getDifficultyLabel(question.difficulty)}
                                </Badge>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">题目 #{pq.question_id}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={pq.score}
                            onChange={(e) => handleScoreChange(pq.question_id, Number(e.target.value))}
                            className="w-16 h-8 text-center"
                            min={0}
                          />
                          <span className="text-sm text-muted-foreground">分</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveQuestion(pq.question_id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Section View
                <div className="space-y-6">
                  {/* Sections */}
                  {sections.map((section) => {
                    const sectionQuestions = getSectionQuestions(section.id);
                    return (
                      <div key={section.id} className="border rounded-lg">
                        <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            <span className="font-medium">{section.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {sectionQuestions.length} 题
                            </Badge>
                            {section.description && (
                              <span className="text-xs text-muted-foreground">
                                · {section.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditSection(section)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-2 space-y-2">
                          {sectionQuestions.length === 0 ? (
                            <p className="text-center py-4 text-sm text-muted-foreground">
                              该分区暂无题目，从下方未分类题目中拖入
                            </p>
                          ) : (
                            sectionQuestions.map((pq) => {
                              const question = questionDetails.get(pq.question_id);
                              return (
                                <div
                                  key={pq.question_id}
                                  className="flex items-center gap-3 p-2 border rounded hover:bg-muted/30"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{question?.content || `题目 #${pq.question_id}`}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={pq.score}
                                      onChange={(e) => handleScoreChange(pq.question_id, Number(e.target.value))}
                                      className="w-14 h-7 text-center text-xs"
                                      min={0}
                                    />
                                    <span className="text-xs text-muted-foreground">分</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleRemoveFromSection(pq.question_id)}
                                      title="移出分区"
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Unsectioned Questions */}
                  {getUnsectionedQuestions().length > 0 && (
                    <div className="border rounded-lg border-dashed">
                      <div className="flex items-center justify-between p-3 bg-muted/10 border-b border-dashed">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">未分类题目</span>
                          <Badge variant="outline" className="text-xs">
                            {getUnsectionedQuestions().length} 题
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        {getUnsectionedQuestions().map((pq) => {
                          const question = questionDetails.get(pq.question_id);
                          return (
                            <div
                              key={pq.question_id}
                              className="flex items-center gap-3 p-2 border rounded hover:bg-muted/30"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{question?.content || `题目 #${pq.question_id}`}</p>
                                {question && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {getQuestionTypeName(question.question_type)}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {sections.length > 0 && (
                                  <Select onValueChange={(v) => handleAddToSection(v, pq.question_id)}>
                                    <SelectTrigger className="h-7 w-24 text-xs">
                                      <SelectValue placeholder="移入分区" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {sections.map((s) => (
                                        <SelectItem key={s.id} value={s.id} className="text-xs">
                                          {s.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                <Input
                                  type="number"
                                  value={pq.score}
                                  onChange={(e) => handleScoreChange(pq.question_id, Number(e.target.value))}
                                  className="w-14 h-7 text-center text-xs"
                                  min={0}
                                />
                                <span className="text-xs text-muted-foreground">分</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleRemoveQuestion(pq.question_id)}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {sections.length === 0 && getUnsectionedQuestions().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>暂无分区</p>
                      <p className="text-sm">点击"新建分区"创建题目分组</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：设置区 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>试卷标题 *</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="输入试卷标题"
                />
              </div>

              <div className="space-y-2">
                <Label>试卷类型</Label>
                <Select
                  value={formData.paper_type || "mock"}
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

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>考试类型</Label>
                  <Select
                    value={formData.exam_type || ""}
                    onValueChange={(v) =>
                      setFormData({ ...formData, exam_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择" />
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
                <div className="space-y-2">
                  <Label>科目</Label>
                  <Select
                    value={formData.subject || ""}
                    onValueChange={(v) =>
                      setFormData({ ...formData, subject: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择" />
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

              <div className="space-y-2">
                <Label>发布状态</Label>
                <Select
                  value={formData.status?.toString() || "0"}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: Number(v) as PaperStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">草稿</SelectItem>
                    <SelectItem value="1">已发布</SelectItem>
                    <SelectItem value="2">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.is_free || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_free: checked })
                  }
                />
                <Label>免费试卷</Label>
              </div>
            </CardContent>
          </Card>

          {/* 考试设置 */}
          <Card>
            <CardHeader>
              <CardTitle>考试设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>总分</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={formData.total_score || 100}
                    onChange={(e) =>
                      setFormData({ ...formData, total_score: Number(e.target.value) })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">分</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  当前题目总分：{calculateTotalScore()} 分
                </p>
              </div>

              <div className="space-y-2">
                <Label>时间限制</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={formData.time_limit || 120}
                    onChange={(e) =>
                      setFormData({ ...formData, time_limit: Number(e.target.value) })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">分钟</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>试卷描述</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="输入试卷描述..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <Card>
            <CardHeader>
              <CardTitle>统计信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  作答人次
                </span>
                <span className="font-medium">{paper.attempt_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  平均分
                </span>
                <span className="font-medium">{paper.avg_score.toFixed(1)}</span>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                创建时间：{new Date(paper.created_at).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                更新时间：{new Date(paper.updated_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 题目选择对话框 */}
      <QuestionSelectDialog
        open={selectDialogOpen}
        onOpenChange={setSelectDialogOpen}
        onSelect={handleAddQuestions}
        selectedIds={paperQuestions.map((q) => q.question_id)}
      />

      {/* 随机组卷对话框 */}
      <RandomSelectDialog
        open={randomSelectDialogOpen}
        onOpenChange={setRandomSelectDialogOpen}
        onSelect={handleAddQuestions}
        selectedIds={paperQuestions.map((q) => q.question_id)}
      />

      {/* 分区设置对话框 */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {editingSection ? "编辑分区" : "新建分区"}
            </DialogTitle>
            <DialogDescription>
              {editingSection 
                ? "修改分区名称和描述" 
                : "创建新分区来组织试卷中的题目"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>分区名称 *</Label>
              <Input
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="如：单选题、多选题、阅读理解..."
              />
            </div>
            <div className="space-y-2">
              <Label>描述（可选）</Label>
              <Input
                value={sectionDesc}
                onChange={(e) => setSectionDesc(e.target.value)}
                placeholder="分区的简短说明"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveSection}>
              {editingSection ? "保存修改" : "创建分区"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
