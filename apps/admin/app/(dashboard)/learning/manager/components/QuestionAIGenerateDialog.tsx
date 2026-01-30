"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  CheckCircle,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@what-cse/ui";
import {
  questionApi,
  QuestionType,
  QuestionSourceType,
  AIGeneratedQuestion,
  getQuestionTypeName,
  getDifficultyLabel,
  getDifficultyColor,
  getSourceTypeName,
  getYearOptions,
} from "@/services/question-api";
import { CourseCategory } from "@/services/course-api";
import { toast } from "sonner";

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CourseCategory[];
  onSuccess: () => void;
}

export function AIGenerateDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: AIGenerateDialogProps) {
  const [step, setStep] = useState<"config" | "preview" | "result">("config");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // 配置参数
  const [categoryId, setCategoryId] = useState<number>(0);
  const [questionType, setQuestionType] = useState<QuestionType>("single_choice");
  const [difficulty, setDifficulty] = useState<number>(3);
  const [count, setCount] = useState<number>(5);
  const [topic, setTopic] = useState<string>("");
  const [sourceType, setSourceType] = useState<QuestionSourceType>("mock");
  const [sourceYear, setSourceYear] = useState<number>(new Date().getFullYear());

  // 生成的题目
  const [generatedQuestions, setGeneratedQuestions] = useState<AIGeneratedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  
  // 编辑状态
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<AIGeneratedQuestion | null>(null);

  // 扁平化分类
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

  // 重置状态
  const handleReset = () => {
    setStep("config");
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());
    setExpandedQuestions(new Set());
    setEditingIndex(null);
    setEditingQuestion(null);
  };

  // 生成题目
  const handleGenerate = async () => {
    if (!categoryId) {
      toast.error("请选择题目分类");
      return;
    }

    setGenerating(true);
    try {
      const response = await questionApi.aiGenerateQuestions({
        category_id: categoryId,
        question_type: questionType,
        difficulty,
        count,
        topic: topic || undefined,
        source_type: sourceType,
        source_year: sourceYear,
      });

      setGeneratedQuestions(response.questions);
      // 默认全选
      setSelectedQuestions(new Set(response.questions.map((_, i) => i)));
      setStep("preview");
      toast.success(`成功生成 ${response.count} 道题目`);
    } catch (error: any) {
      toast.error(error.message || "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  // 切换选中
  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedQuestions.size === generatedQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(generatedQuestions.map((_, i) => i)));
    }
  };

  // 切换展开
  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  // 开始编辑
  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingQuestion({ ...generatedQuestions[index] });
  };

  // 保存编辑
  const saveEditing = () => {
    if (editingIndex !== null && editingQuestion) {
      const newQuestions = [...generatedQuestions];
      newQuestions[editingIndex] = editingQuestion;
      setGeneratedQuestions(newQuestions);
      setEditingIndex(null);
      setEditingQuestion(null);
      toast.success("题目已更新");
    }
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingQuestion(null);
  };

  // 删除题目
  const deleteQuestion = (index: number) => {
    const newQuestions = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(newQuestions);
    const newSelected = new Set<number>();
    selectedQuestions.forEach((i) => {
      if (i < index) newSelected.add(i);
      else if (i > index) newSelected.add(i - 1);
    });
    setSelectedQuestions(newSelected);
  };

  // 保存选中的题目
  const handleSave = async () => {
    if (selectedQuestions.size === 0) {
      toast.error("请至少选择一道题目");
      return;
    }

    const questionsToSave = Array.from(selectedQuestions)
      .sort((a, b) => a - b)
      .map((i) => generatedQuestions[i]);

    setSaving(true);
    try {
      const result = await questionApi.aiSaveQuestions({
        category_id: categoryId,
        source_type: sourceType,
        source_year: sourceYear,
        questions: questionsToSave,
      });

      toast.success(`成功保存 ${result.success} 道题目`);
      setStep("result");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleReset();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI 辅助生成题目
          </DialogTitle>
          <DialogDescription>
            {step === "config" && "设置生成参数，AI 将根据您的要求生成题目"}
            {step === "preview" && "预览生成的题目，可以编辑、删除或选择要保存的题目"}
            {step === "result" && "题目已保存完成"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* 配置步骤 */}
          {step === "config" && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                {/* 分类选择 */}
                <div className="space-y-2">
                  <Label>题目分类 *</Label>
                  <Select
                    value={categoryId?.toString() || ""}
                    onValueChange={(v) => setCategoryId(Number(v))}
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

                {/* 题型选择 */}
                <div className="space-y-2">
                  <Label>题目类型 *</Label>
                  <Select
                    value={questionType}
                    onValueChange={(v) => setQuestionType(v as QuestionType)}
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
                    </SelectContent>
                  </Select>
                </div>

                {/* 难度选择 */}
                <div className="space-y-2">
                  <Label>难度等级 *</Label>
                  <Select
                    value={difficulty.toString()}
                    onValueChange={(v) => setDifficulty(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">入门 (1星)</SelectItem>
                      <SelectItem value="2">简单 (2星)</SelectItem>
                      <SelectItem value="3">中等 (3星)</SelectItem>
                      <SelectItem value="4">困难 (4星)</SelectItem>
                      <SelectItem value="5">极难 (5星)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 生成数量 */}
                <div className="space-y-2">
                  <Label>生成数量 *</Label>
                  <Select
                    value={count.toString()}
                    onValueChange={(v) => setCount(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 8, 10].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} 道题
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 来源类型 */}
                <div className="space-y-2">
                  <Label>来源类型</Label>
                  <Select
                    value={sourceType}
                    onValueChange={(v) => setSourceType(v as QuestionSourceType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mock">模拟题</SelectItem>
                      <SelectItem value="original">原创题</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 来源年份 */}
                <div className="space-y-2">
                  <Label>来源年份</Label>
                  <Select
                    value={sourceYear.toString()}
                    onValueChange={(v) => setSourceYear(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getYearOptions().map((y) => (
                        <SelectItem key={y.value} value={y.value.toString()}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 主题/关键词 */}
              <div className="space-y-2">
                <Label>主题/关键词（可选）</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="输入主题或关键词，如：逻辑填空、数列推理、法律法规等"
                />
                <p className="text-xs text-muted-foreground">
                  提供主题可以让 AI 生成更精准的题目内容
                </p>
              </div>

              {/* 提示 */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-700 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI 生成说明
                </h4>
                <ul className="text-sm text-purple-600 space-y-1">
                  <li>• AI 会根据您选择的分类、题型和难度生成对应的题目</li>
                  <li>• 生成的题目会包含题干、选项（如有）、答案和解析</li>
                  <li>• 您可以在预览时编辑、删除或调整生成的题目</li>
                  <li>• 生成的题目默认保存为"草稿"状态，需手动发布</li>
                </ul>
              </div>
            </div>
          )}

          {/* 预览步骤 */}
          {step === "preview" && (
            <div className="space-y-4 py-4">
              {/* 操作栏 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {selectedQuestions.size === generatedQuestions.length
                      ? "取消全选"
                      : "全选"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedQuestions.size} / {generatedQuestions.length} 道题目
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStep("config");
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新生成
                </Button>
              </div>

              {/* 题目列表 */}
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-4">
                  {generatedQuestions.map((q, index) => (
                    <Card
                      key={index}
                      className={`transition-colors ${
                        selectedQuestions.has(index)
                          ? "border-purple-300 bg-purple-50/50"
                          : "opacity-60"
                      }`}
                    >
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.has(index)}
                              onChange={() => toggleSelect(index)}
                              className="h-4 w-4"
                            />
                            <span className="font-medium">第 {index + 1} 题</span>
                            <Badge variant="secondary" className="text-xs">
                              {getQuestionTypeName(questionType)}
                            </Badge>
                            <Badge
                              className={`text-xs ${getDifficultyColor(q.difficulty)}`}
                            >
                              {getDifficultyLabel(q.difficulty)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleExpand(index)}
                            >
                              {expandedQuestions.has(index) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => startEditing(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => deleteQuestion(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3 pt-0">
                        {/* 编辑模式 */}
                        {editingIndex === index && editingQuestion ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>题干</Label>
                              <Textarea
                                value={editingQuestion.content}
                                onChange={(e) =>
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    content: e.target.value,
                                  })
                                }
                                rows={3}
                              />
                            </div>
                            {editingQuestion.options && (
                              <div className="space-y-2">
                                <Label>选项</Label>
                                {editingQuestion.options.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <span className="w-8 text-center font-medium">
                                      {opt.key}.
                                    </span>
                                    <Input
                                      value={opt.content}
                                      onChange={(e) => {
                                        const newOptions = [
                                          ...(editingQuestion.options || []),
                                        ];
                                        newOptions[i] = {
                                          ...newOptions[i],
                                          content: e.target.value,
                                        };
                                        setEditingQuestion({
                                          ...editingQuestion,
                                          options: newOptions,
                                        });
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>答案</Label>
                              <Input
                                value={editingQuestion.answer}
                                onChange={(e) =>
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    answer: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>解析</Label>
                              <Textarea
                                value={editingQuestion.analysis}
                                onChange={(e) =>
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    analysis: e.target.value,
                                  })
                                }
                                rows={4}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                              >
                                取消
                              </Button>
                              <Button size="sm" onClick={saveEditing}>
                                保存
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* 预览模式 */
                          <div className="space-y-3">
                            <p className="text-sm whitespace-pre-wrap">{q.content}</p>
                            {q.options && (
                              <div className="space-y-1 pl-4">
                                {q.options.map((opt, i) => (
                                  <div
                                    key={i}
                                    className={`text-sm ${
                                      q.answer.includes(opt.key)
                                        ? "text-green-600 font-medium"
                                        : ""
                                    }`}
                                  >
                                    {opt.key}. {opt.content}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="font-medium text-green-600">
                                答案：{q.answer}
                              </span>
                            </div>
                            {expandedQuestions.has(index) && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">解析：</p>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {q.analysis}
                                  </p>
                                </div>
                                {q.tips && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">解题技巧：</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {q.tips}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* 结果步骤 */}
          {step === "result" && (
            <div className="space-y-6 py-8 text-center">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">保存成功</h3>
                <p className="text-muted-foreground">
                  已成功保存 {selectedQuestions.size} 道 AI 生成的题目
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  题目已保存为"草稿"状态，您可以在题目列表中查看和发布
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "config" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成题目
                  </>
                )}
              </Button>
            </>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={handleReset}>
                返回配置
              </Button>
              <Button onClick={handleSave} disabled={saving || selectedQuestions.size === 0}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存 {selectedQuestions.size} 道题目
                  </>
                )}
              </Button>
            </>
          )}
          {step === "result" && (
            <Button onClick={() => onOpenChange(false)}>完成</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
