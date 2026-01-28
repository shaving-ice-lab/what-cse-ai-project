"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileQuestion,
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  XCircle,
  Eye,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Image,
  Table2,
  Calculator,
  BookOpen,
  Link2,
  X,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from "@what-cse/ui";
import {
  questionApi,
  Question,
  QuestionType,
  QuestionSourceType,
  QuestionStatus,
  QuestionOption,
  UpdateQuestionRequest,
  getQuestionTypeName,
  getSourceTypeName,
  getDifficultyLabel,
  getDifficultyColor,
  getQuestionStatusLabel,
  getYearOptions,
} from "@/services/question-api";
import { courseApi, CourseCategory } from "@/services/course-api";
import { toast } from "sonner";

// ============================================
// Main Page Component
// ============================================

export default function QuestionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const questionId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [categories, setCategories] = useState<CourseCategory[]>([]);

  // Form state
  const [formData, setFormData] = useState<UpdateQuestionRequest>({});
  const [options, setOptions] = useState<QuestionOption[]>([]);
  
  // Dialog states
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [formulaDialogOpen, setFormulaDialogOpen] = useState(false);
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false);
  
  // Image dialog state
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  
  // Table dialog state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  
  // Formula dialog state
  const [formulaText, setFormulaText] = useState("");
  
  // Knowledge points state (these would come from an API in a real app)
  const [allKnowledgePoints, setAllKnowledgePoints] = useState<{id: number; name: string; category: string}[]>([]);
  const [selectedKnowledgePoints, setSelectedKnowledgePoints] = useState<number[]>([]);
  const [knowledgeSearchTerm, setKnowledgeSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [questionRes, categoriesRes] = await Promise.all([
          questionApi.getQuestion(questionId),
          courseApi.getCategories(),
        ]);

        setQuestion(questionRes);
        setCategories(categoriesRes.categories || []);

        // Initialize form data
        setFormData({
          category_id: questionRes.category_id,
          question_type: questionRes.question_type,
          difficulty: questionRes.difficulty,
          source_type: questionRes.source_type,
          source_year: questionRes.source_year,
          source_region: questionRes.source_region,
          source_exam: questionRes.source_exam,
          content: questionRes.content,
          material_id: questionRes.material_id,
          answer: questionRes.answer,
          analysis: questionRes.analysis,
          tips: questionRes.tips,
          knowledge_points: questionRes.knowledge_points,
          tags: questionRes.tags,
          is_vip: questionRes.is_vip,
          status: questionRes.status,
        });

        setOptions(questionRes.options || [
          { key: "A", content: "" },
          { key: "B", content: "" },
          { key: "C", content: "" },
          { key: "D", content: "" },
        ]);
        
        // Initialize selected knowledge points
        setSelectedKnowledgePoints(questionRes.knowledge_points || []);
        
        // Mock knowledge points (in real app, fetch from API)
        setAllKnowledgePoints([
          { id: 1, name: "逻辑填空", category: "言语理解" },
          { id: 2, name: "片段阅读", category: "言语理解" },
          { id: 3, name: "语句表达", category: "言语理解" },
          { id: 4, name: "数学运算", category: "数量关系" },
          { id: 5, name: "数字推理", category: "数量关系" },
          { id: 6, name: "图形推理", category: "判断推理" },
          { id: 7, name: "定义判断", category: "判断推理" },
          { id: 8, name: "类比推理", category: "判断推理" },
          { id: 9, name: "逻辑判断", category: "判断推理" },
          { id: 10, name: "资料分析", category: "资料分析" },
          { id: 11, name: "政治常识", category: "常识判断" },
          { id: 12, name: "法律常识", category: "常识判断" },
          { id: 13, name: "经济常识", category: "常识判断" },
          { id: 14, name: "科技人文", category: "常识判断" },
        ]);
      } catch (error: any) {
        console.error("Failed to fetch question:", error);
        toast.error(error.message || "加载题目失败");
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      fetchData();
    }
  }, [questionId]);

  const handleSave = async () => {
    if (!formData.content) {
      toast.error("请填写题目内容");
      return;
    }
    if (!formData.answer) {
      toast.error("请填写正确答案");
      return;
    }

    setSaving(true);
    try {
      const updateData: UpdateQuestionRequest = {
        ...formData,
        options: isChoiceType ? options : undefined,
      };
      await questionApi.updateQuestion(questionId, updateData);
      toast.success("题目已保存");
      router.push("/learning/questions");
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除该题目吗？删除后不可恢复。")) return;
    try {
      await questionApi.deleteQuestion(questionId);
      toast.success("题目已删除");
      router.push("/learning/questions");
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  const handleOptionChange = (index: number, content: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], content };
    setOptions(newOptions);
  };

  const addOption = () => {
    const nextKey = String.fromCharCode(65 + options.length);
    setOptions([...options, { key: nextKey, content: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("至少需要2个选项");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    const reKeyedOptions = newOptions.map((opt, i) => ({
      ...opt,
      key: String.fromCharCode(65 + i),
    }));
    setOptions(reKeyedOptions);
  };

  // Insert image into content
  const insertImage = () => {
    if (!imageUrl) {
      toast.error("请输入图片链接");
      return;
    }
    const imageMarkdown = `![${imageAlt || "图片"}](${imageUrl})`;
    setFormData({ ...formData, content: (formData.content || "") + "\n" + imageMarkdown + "\n" });
    setImageUrl("");
    setImageAlt("");
    setImageDialogOpen(false);
    toast.success("图片已插入");
  };

  // Insert table into content
  const insertTable = () => {
    const headerRow = "| " + Array(tableCols).fill("表头").join(" | ") + " |";
    const separatorRow = "| " + Array(tableCols).fill("---").join(" | ") + " |";
    const dataRows = Array(tableRows - 1).fill("| " + Array(tableCols).fill("数据").join(" | ") + " |").join("\n");
    const tableMarkdown = `\n${headerRow}\n${separatorRow}\n${dataRows}\n`;
    setFormData({ ...formData, content: (formData.content || "") + tableMarkdown });
    setTableDialogOpen(false);
    toast.success("表格已插入");
  };

  // Insert formula into content
  const insertFormula = () => {
    if (!formulaText) {
      toast.error("请输入公式");
      return;
    }
    // Use LaTeX-style formula notation
    const formulaMarkdown = `$${formulaText}$`;
    setFormData({ ...formData, content: (formData.content || "") + " " + formulaMarkdown + " " });
    setFormulaText("");
    setFormulaDialogOpen(false);
    toast.success("公式已插入");
  };

  // Toggle knowledge point selection
  const toggleKnowledgePoint = (id: number) => {
    setSelectedKnowledgePoints(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  // Apply knowledge points
  const applyKnowledgePoints = () => {
    setFormData({ ...formData, knowledge_points: selectedKnowledgePoints });
    setKnowledgeDialogOpen(false);
    toast.success(`已关联 ${selectedKnowledgePoints.length} 个知识点`);
  };

  // Filter knowledge points by search
  const filteredKnowledgePoints = allKnowledgePoints.filter(kp => 
    kp.name.includes(knowledgeSearchTerm) || kp.category.includes(knowledgeSearchTerm)
  );

  // Group knowledge points by category
  const groupedKnowledgePoints = filteredKnowledgePoints.reduce((acc, kp) => {
    if (!acc[kp.category]) acc[kp.category] = [];
    acc[kp.category].push(kp);
    return acc;
  }, {} as Record<string, typeof allKnowledgePoints>);

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
  const isChoiceType = ["single_choice", "multi_choice", "judge"].includes(formData.question_type || "");

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

  if (!question) {
    return (
      <div className="text-center py-12">
        <FileQuestion className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">题目不存在</p>
        <Button asChild className="mt-4">
          <Link href="/learning/questions">返回列表</Link>
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
            <Link href="/learning/questions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileQuestion className="h-6 w-6 text-blue-500" />
              编辑题目
            </h1>
            <p className="text-muted-foreground">题目 #{question.id}</p>
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
        {/* 左侧：主要编辑区 */}
        <div className="md:col-span-2 space-y-6">
          {/* 题目内容 */}
          <Card>
            <CardHeader>
              <CardTitle>题目内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>题目内容 *</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setImageDialogOpen(true)}
                      title="插入图片"
                    >
                      <Image className="h-4 w-4 mr-1" />
                      图片
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTableDialogOpen(true)}
                      title="插入表格"
                    >
                      <Table2 className="h-4 w-4 mr-1" />
                      表格
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormulaDialogOpen(true)}
                      title="插入公式"
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      公式
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={formData.content || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="输入题目内容...&#10;&#10;支持 Markdown 格式：&#10;- 图片：![描述](图片链接)&#10;- 表格：| 列1 | 列2 |&#10;- 公式：$公式内容$"
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  支持 Markdown 语法，可使用上方工具栏快速插入图片、表格和公式
                </p>
              </div>

              {/* 选项（仅选择题） */}
              {isChoiceType && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>选项</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      添加选项
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-8 text-center font-medium">{option.key}.</span>
                        <Input
                          value={option.content}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`选项 ${option.key}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>正确答案 *</Label>
                {isChoiceType ? (
                  <Input
                    value={formData.answer || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, answer: e.target.value.toUpperCase() })
                    }
                    placeholder={formData.question_type === "multi_choice" ? "多选请用逗号分隔，如：A,B,D" : "输入正确选项，如：A"}
                  />
                ) : (
                  <Textarea
                    value={formData.answer || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, answer: e.target.value })
                    }
                    placeholder="输入正确答案..."
                    rows={3}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>答案解析</Label>
                <Textarea
                  value={formData.analysis || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, analysis: e.target.value })
                  }
                  placeholder="输入答案解析..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>解题技巧</Label>
                <Textarea
                  value={formData.tips || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tips: e.target.value })
                  }
                  placeholder="输入解题技巧..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：设置区 */}
        <div className="space-y-6">
          {/* 基本设置 */}
          <Card>
            <CardHeader>
              <CardTitle>基本设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>所属分类</Label>
                <Select
                  value={formData.category_id?.toString() || ""}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category_id: Number(v) })
                  }
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>题型</Label>
                <Select
                  value={formData.question_type || "single_choice"}
                  onValueChange={(v) =>
                    setFormData({ ...formData, question_type: v as QuestionType })
                  }
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>难度</Label>
                <Select
                  value={formData.difficulty?.toString() || "3"}
                  onValueChange={(v) =>
                    setFormData({ ...formData, difficulty: Number(v) })
                  }
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>发布状态</Label>
                <Select
                  value={formData.status?.toString() || "0"}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: Number(v) as QuestionStatus })
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
                  checked={formData.is_vip || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_vip: checked })
                  }
                />
                <Label>VIP专属题目</Label>
              </div>
            </CardContent>
          </Card>

          {/* 关联知识点 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">关联知识点</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setKnowledgeDialogOpen(true)}
                >
                  <Link2 className="h-3 w-3 mr-1" />
                  管理
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedKnowledgePoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  暂未关联知识点，点击"管理"添加
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedKnowledgePoints.map(id => {
                    const kp = allKnowledgePoints.find(p => p.id === id);
                    return kp ? (
                      <Badge key={id} variant="secondary" className="gap-1">
                        <BookOpen className="h-3 w-3" />
                        {kp.name}
                        <button
                          onClick={() => toggleKnowledgePoint(id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 来源信息 */}
          <Card>
            <CardHeader>
              <CardTitle>来源信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>来源类型</Label>
                <Select
                  value={formData.source_type || "mock"}
                  onValueChange={(v) =>
                    setFormData({ ...formData, source_type: v as QuestionSourceType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_exam">真题</SelectItem>
                    <SelectItem value="mock">模拟题</SelectItem>
                    <SelectItem value="original">原创题</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>来源年份</Label>
                <Select
                  value={formData.source_year?.toString() || ""}
                  onValueChange={(v) =>
                    setFormData({ ...formData, source_year: v ? Number(v) : undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择年份" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">不限</SelectItem>
                    {getYearOptions().map((year) => (
                      <SelectItem key={year.value} value={year.value.toString()}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>来源地区</Label>
                <Input
                  value={formData.source_region || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, source_region: e.target.value })
                  }
                  placeholder="如：国考、浙江省考等"
                />
              </div>

              <div className="space-y-2">
                <Label>来源考试</Label>
                <Input
                  value={formData.source_exam || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, source_exam: e.target.value })
                  }
                  placeholder="如：2024年国家公务员考试行测"
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
                  <Target className="h-4 w-4" />
                  作答次数
                </span>
                <span className="font-medium">{question.attempt_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  正确率
                </span>
                <span className="font-medium">{question.correct_rate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  平均用时
                </span>
                <span className="font-medium">{question.avg_time}秒</span>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                创建时间：{new Date(question.created_at).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                更新时间：{new Date(question.updated_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 插入图片对话框 */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              插入图片
            </DialogTitle>
            <DialogDescription>
              输入图片链接，将以 Markdown 格式插入到题目内容中
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>图片链接 *</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
              />
            </div>
            <div className="space-y-2">
              <Label>图片描述（可选）</Label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="图片的文字描述"
              />
            </div>
            {imageUrl && (
              <div className="border rounded-lg p-2">
                <p className="text-xs text-muted-foreground mb-2">预览：</p>
                <img 
                  src={imageUrl} 
                  alt={imageAlt || "预览"} 
                  className="max-h-40 mx-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={insertImage}>插入图片</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 插入表格对话框 */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Table2 className="h-5 w-5" />
              插入表格
            </DialogTitle>
            <DialogDescription>
              设置表格的行数和列数，将生成 Markdown 表格
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>行数</Label>
                <Select
                  value={tableRows.toString()}
                  onValueChange={(v) => setTableRows(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} 行</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>列数</Label>
                <Select
                  value={tableCols.toString()}
                  onValueChange={(v) => setTableCols(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} 列</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border rounded-lg p-3 bg-muted/50">
              <p className="text-xs text-muted-foreground mb-2">预览（{tableRows}×{tableCols}）：</p>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse">
                  <thead>
                    <tr>
                      {Array(tableCols).fill(0).map((_, i) => (
                        <th key={i} className="border px-2 py-1 bg-muted">表头{i+1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array(tableRows - 1).fill(0).map((_, r) => (
                      <tr key={r}>
                        {Array(tableCols).fill(0).map((_, c) => (
                          <td key={c} className="border px-2 py-1">数据</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={insertTable}>插入表格</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 插入公式对话框 */}
      <Dialog open={formulaDialogOpen} onOpenChange={setFormulaDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              插入公式
            </DialogTitle>
            <DialogDescription>
              输入 LaTeX 格式的数学公式
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>公式内容</Label>
              <Textarea
                value={formulaText}
                onChange={(e) => setFormulaText(e.target.value)}
                placeholder="例如：x^2 + y^2 = r^2"
                rows={3}
                className="font-mono"
              />
            </div>
            <div className="border rounded-lg p-3 bg-muted/50">
              <p className="text-xs text-muted-foreground mb-2">常用公式示例：</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button 
                  className="text-left p-2 hover:bg-muted rounded"
                  onClick={() => setFormulaText("x^2 + y^2 = r^2")}
                >
                  <code>x^2 + y^2 = r^2</code> → 平方和
                </button>
                <button 
                  className="text-left p-2 hover:bg-muted rounded"
                  onClick={() => setFormulaText("\\frac{a}{b}")}
                >
                  <code>\frac{'{a}{b}'}</code> → 分数
                </button>
                <button 
                  className="text-left p-2 hover:bg-muted rounded"
                  onClick={() => setFormulaText("\\sqrt{x}")}
                >
                  <code>\sqrt{'{x}'}</code> → 根号
                </button>
                <button 
                  className="text-left p-2 hover:bg-muted rounded"
                  onClick={() => setFormulaText("\\sum_{i=1}^{n}")}
                >
                  <code>\sum</code> → 求和
                </button>
                <button 
                  className="text-left p-2 hover:bg-muted rounded"
                  onClick={() => setFormulaText("\\pi \\times r^2")}
                >
                  <code>\pi × r^2</code> → 圆面积
                </button>
                <button 
                  className="text-left p-2 hover:bg-muted rounded"
                  onClick={() => setFormulaText("a \\times b \\div c")}
                >
                  <code>a × b ÷ c</code> → 运算
                </button>
              </div>
            </div>
            {formulaText && (
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">将插入：</p>
                <code className="text-sm">${formulaText}$</code>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormulaDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={insertFormula}>插入公式</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 知识点关联对话框 */}
      <Dialog open={knowledgeDialogOpen} onOpenChange={setKnowledgeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              关联知识点
            </DialogTitle>
            <DialogDescription>
              选择与此题目相关的知识点，便于分类学习和智能推荐
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="搜索知识点..."
              value={knowledgeSearchTerm}
              onChange={(e) => setKnowledgeSearchTerm(e.target.value)}
            />
            <ScrollArea className="h-[300px] border rounded-lg p-2">
              {Object.entries(groupedKnowledgePoints).map(([category, points]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {points.map(kp => (
                      <button
                        key={kp.id}
                        onClick={() => toggleKnowledgePoint(kp.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                          selectedKnowledgePoints.includes(kp.id)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <CheckCircle className={`h-4 w-4 ${
                          selectedKnowledgePoints.includes(kp.id) ? "opacity-100" : "opacity-0"
                        }`} />
                        {kp.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedKnowledgePoints).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  没有找到匹配的知识点
                </p>
              )}
            </ScrollArea>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                已选择 {selectedKnowledgePoints.length} 个知识点
              </span>
              {selectedKnowledgePoints.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedKnowledgePoints([])}
                >
                  清空选择
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKnowledgeDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={applyKnowledgePoints}>
              确认关联
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
