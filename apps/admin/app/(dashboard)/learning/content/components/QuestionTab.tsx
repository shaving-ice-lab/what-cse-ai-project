"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileQuestion,
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Activity,
  ListChecks,
  Search,
  Zap,
  ChevronsUpDown,
  ChevronsDownUp,
  Shuffle,
  Layers,
  Settings2,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@what-cse/ui";
import { cn } from "@what-cse/ui";
import {
  questionApi,
  QuestionType,
  QuestionSourceType,
  getQuestionTypeName,
  getDifficultyLabel,
} from "@/services/question-api";
import { courseApi, CourseCategory } from "@/services/course-api";
import { toast } from "sonner";

// 题型选择模式
type QuestionTypeMode = "all" | "random" | QuestionType;
// 分类选择模式
type CategoryMode = "all" | "random";

interface QuestionTabProps {
  onTaskCreated?: () => void;
}

// 生成任务类型
type GenerationTask = {
  id: string;
  categoryId: number;
  categoryName: string;
  categoryPath: string;
  questionType: QuestionType;
  difficulty: number;
  count: number;
  status: "pending" | "generating" | "completed" | "failed";
  successCount?: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
};

type MainTabValue = "tree" | "generating" | "completed";

// 分类节点组件
function CategoryNode({
  node,
  level,
  expandedIds,
  onToggle,
  onGenerate,
  generatingCategories,
}: {
  node: CourseCategory;
  level: number;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  onGenerate: (categoryId: number, categoryName: string, categoryPath: string) => void;
  generatingCategories: Set<number>;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isGenerating = generatingCategories.has(node.id);

  // 构建分类路径
  const getCategoryPath = (cat: CourseCategory, path: string[] = []): string => {
    return [...path, cat.name].join(" / ");
  };

  return (
    <div className="py-0.5">
      <div
        className={cn(
          "flex items-center gap-1.5 py-1.5 pr-2 rounded-md group",
          hasChildren && "cursor-pointer hover:bg-muted/50"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="flex-shrink-0 p-0 border-0 bg-transparent"
            onClick={() => onToggle(node.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <FileQuestion className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium truncate flex-1">{node.name}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs opacity-0 group-hover:opacity-100 flex-shrink-0"
          disabled={isGenerating}
          onClick={(e) => {
            e.stopPropagation();
            onGenerate(node.id, node.name, getCategoryPath(node));
          }}
        >
          {isGenerating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Zap className="h-3 w-3 mr-0.5" />
              生成题目
            </>
          )}
        </Button>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onGenerate={onGenerate}
              generatingCategories={generatingCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function QuestionTab({ onTaskCreated }: QuestionTabProps) {
  // 分类树状态
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // 生成配置
  const [questionTypeMode, setQuestionTypeMode] = useState<QuestionTypeMode>("all");
  const [difficulty, setDifficulty] = useState<number | "random">("random");
  const [totalCount, setTotalCount] = useState<number>(100); // 总题数
  const [customCount, setCustomCount] = useState<string>("100");
  const [sourceType, setSourceType] = useState<QuestionSourceType>("mock");
  const [categoryMode, setCategoryMode] = useState<CategoryMode>("all");
  const [randomCategoryCount, setRandomCategoryCount] = useState<number>(10);
  
  // 自动化选项
  const [autoSave, setAutoSave] = useState(true);
  const [balanceTypes, setBalanceTypes] = useState(true); // 均衡分配题型

  // 题型列表 - 常用的5种题型
  const questionTypes: QuestionType[] = ["single_choice", "multi_choice", "judge", "fill_blank", "essay"];
  const difficulties = [1, 2, 3, 4, 5];

  // 随机选择题型
  const getRandomQuestionType = (): QuestionType => {
    return questionTypes[Math.floor(Math.random() * questionTypes.length)];
  };

  // 随机选择难度
  const getRandomDifficulty = (): number => {
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  };

  // 获取题型列表（根据模式）
  const getQuestionTypesToGenerate = (): QuestionType[] => {
    if (questionTypeMode === "all") {
      return questionTypes;
    } else if (questionTypeMode === "random") {
      return [getRandomQuestionType()];
    } else {
      return [questionTypeMode];
    }
  };

  // 处理自定义数量输入
  const handleCustomCountChange = (value: string) => {
    setCustomCount(value);
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 1000) {
      setTotalCount(num);
    }
  };

  // 预设数量选项
  const presetCounts = [10, 20, 50, 100, 200, 500];

  // 生成任务状态
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [generatingCategories, setGeneratingCategories] = useState<Set<number>>(new Set());
  const [generatingAll, setGeneratingAll] = useState(false);

  // 主 Tab 状态
  const [mainTab, setMainTab] = useState<MainTabValue>("tree");
  const [taskSearchKeyword, setTaskSearchKeyword] = useState("");

  // 加载分类树
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const result = await courseApi.getCategoriesTree({});
      setCategories(result.categories || []);
      // 默认展开第一层
      const firstLevelIds = new Set((result.categories || []).map((c) => c.id));
      setExpandedIds(firstLevelIds);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 收集所有叶子分类
  const collectLeafCategories = useCallback((
    cats: CourseCategory[],
    path: string[] = []
  ): { id: number; name: string; path: string }[] => {
    let leaves: { id: number; name: string; path: string }[] = [];
    for (const cat of cats) {
      const currentPath = [...path, cat.name];
      if (!cat.children || cat.children.length === 0) {
        leaves.push({
          id: cat.id,
          name: cat.name,
          path: currentPath.join(" / "),
        });
      } else {
        leaves = leaves.concat(collectLeafCategories(cat.children, currentPath));
      }
    }
    return leaves;
  }, []);

  // 统计信息
  const stats = useMemo(() => {
    const countCategories = (cats: CourseCategory[]): number => {
      let total = cats.length;
      for (const cat of cats) {
        if (cat.children?.length) {
          total += countCategories(cat.children);
        }
      }
      return total;
    };
    
    // 计算叶子分类数量
    const leafCategories = collectLeafCategories(categories);
    const leafCount = leafCategories.length;
    const targetCategoryCount = categoryMode === "random" 
      ? Math.min(randomCategoryCount, leafCount) 
      : leafCount;
    
    return {
      totalCategories: countCategories(categories),
      leafCategories: leafCount,
      targetCategoryCount,
      generatingCount: tasks.filter((t) => ["pending", "generating"].includes(t.status)).length,
      completedCount: tasks.filter((t) => t.status === "completed").length,
      failedCount: tasks.filter((t) => t.status === "failed").length,
    };
  }, [categories, tasks, categoryMode, randomCategoryCount, collectLeafCategories]);

  // 任务列表
  const generatingTasks = useMemo(() => {
    return tasks
      .filter((t) => ["pending", "generating"].includes(t.status))
      .filter((t) => !taskSearchKeyword || t.categoryName.toLowerCase().includes(taskSearchKeyword.toLowerCase()));
  }, [tasks, taskSearchKeyword]);

  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => ["completed", "failed"].includes(t.status))
      .filter((t) => !taskSearchKeyword || t.categoryName.toLowerCase().includes(taskSearchKeyword.toLowerCase()));
  }, [tasks, taskSearchKeyword]);

  // 切换展开
  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 展开全部
  const handleExpandAll = useCallback(() => {
    const collectAllIds = (cats: CourseCategory[]): number[] => {
      let ids: number[] = [];
      for (const cat of cats) {
        if (cat.children?.length) {
          ids.push(cat.id);
          ids = ids.concat(collectAllIds(cat.children));
        }
      }
      return ids;
    };
    setExpandedIds(new Set(collectAllIds(categories)));
  }, [categories]);

  // 收缩全部
  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // 单个分类生成（支持指定题型）
  const handleGenerateForCategory = async (
    categoryId: number,
    categoryName: string,
    categoryPath: string,
    countOverride?: number, // 可覆盖数量
    typeOverride?: QuestionType // 可覆盖题型
  ) => {
    // 确定实际使用的题型和难度
    const actualType = typeOverride || (questionTypeMode === "random" ? getRandomQuestionType() : 
                       questionTypeMode === "all" ? getRandomQuestionType() : questionTypeMode);
    const actualDifficulty = difficulty === "random" ? getRandomDifficulty() : difficulty;
    const actualCount = countOverride || 5; // 单个点击默认5道

    const taskId = `${categoryId}-${actualType}-${Date.now()}`;
    const newTask: GenerationTask = {
      id: taskId,
      categoryId,
      categoryName,
      categoryPath,
      questionType: actualType,
      difficulty: actualDifficulty,
      count: actualCount,
      status: "generating",
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setGeneratingCategories((prev) => new Set(prev).add(categoryId));
    setMainTab("generating");

    try {
      const response = await questionApi.aiGenerateQuestions({
        category_id: categoryId,
        question_type: actualType,
        difficulty: actualDifficulty,
        count: actualCount,
        source_type: sourceType,
      });

      // 根据autoSave设置决定是否保存
      if (autoSave && response.questions && response.questions.length > 0) {
        const saveResult = await questionApi.aiSaveQuestions({
          category_id: categoryId,
          source_type: sourceType,
          questions: response.questions,
        });

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "completed",
                  successCount: saveResult.success,
                  completedAt: new Date().toISOString(),
                }
              : t
          )
        );
        toast.success(`${categoryName}: 成功生成并保存 ${saveResult.success} 道 ${getQuestionTypeName(actualType)}`);
      } else if (response.questions && response.questions.length > 0) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "completed",
                  successCount: response.questions.length,
                  completedAt: new Date().toISOString(),
                }
              : t
          )
        );
        toast.success(`${categoryName}: 生成 ${response.questions.length} 道 ${getQuestionTypeName(actualType)}（未保存）`);
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "completed",
                  successCount: 0,
                  completedAt: new Date().toISOString(),
                }
              : t
          )
        );
        toast.info(`${categoryName}: 没有生成题目`);
      }

      onTaskCreated?.();
    } catch (error: any) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "failed",
                errorMessage: error.message || "生成失败",
                completedAt: new Date().toISOString(),
              }
            : t
        )
      );
      toast.error(`${categoryName}: ${error.message || "生成失败"}`);
    } finally {
      setGeneratingCategories((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
  };

  // 随机打乱数组
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 批量生成（支持全部题型和随机分类）
  const handleGenerateAll = async () => {
    let leafCategories = collectLeafCategories(categories);
    if (leafCategories.length === 0) {
      toast.info("没有可生成的分类");
      return;
    }

    // 根据分类模式选择分类
    if (categoryMode === "random") {
      leafCategories = shuffleArray(leafCategories).slice(0, Math.min(randomCategoryCount, leafCategories.length));
    }

    // 获取要生成的题型
    const typesToGenerate = questionTypeMode === "all" ? questionTypes : 
                           questionTypeMode === "random" ? [getRandomQuestionType()] :
                           [questionTypeMode];

    setGeneratingAll(true);
    setMainTab("generating");

    if (questionTypeMode === "all" && balanceTypes) {
      // 全部题型模式：均衡分配到各题型
      const totalTypes = typesToGenerate.length;
      const questionsPerType = Math.floor(totalCount / totalTypes);
      const typeRemainder = totalCount % totalTypes;
      
      toast.info(`开始批量生成 ${totalCount} 道题目，均衡分配到 ${totalTypes} 种题型，${leafCategories.length} 个分类`);

      // 为每种题型分配题目
      for (let typeIdx = 0; typeIdx < typesToGenerate.length; typeIdx++) {
        const qType = typesToGenerate[typeIdx];
        const typeTotal = typeIdx < typeRemainder ? questionsPerType + 1 : questionsPerType;
        
        // 计算每个分类应该生成多少题（该题型）
        const countPerCategory = Math.max(1, Math.floor(typeTotal / leafCategories.length));
        const catRemainder = typeTotal % leafCategories.length;

        // 为该题型在各分类生成题目
        for (let i = 0; i < leafCategories.length; i++) {
          const leaf = leafCategories[i];
          const categoryCount = i < catRemainder ? countPerCategory + 1 : countPerCategory;
          if (categoryCount > 0) {
            await handleGenerateForCategory(leaf.id, leaf.name, leaf.path, categoryCount, qType);
          }
        }
      }
    } else {
      // 单一题型或随机模式
      const countPerCategory = Math.max(1, Math.floor(totalCount / leafCategories.length));
      const remainder = totalCount % leafCategories.length;

      toast.info(`开始批量生成 ${totalCount} 道题目，分配到 ${leafCategories.length} 个分类`);

      for (let i = 0; i < leafCategories.length; i++) {
        const leaf = leafCategories[i];
        const categoryCount = i < remainder ? countPerCategory + 1 : countPerCategory;
        const qType = questionTypeMode === "random" ? getRandomQuestionType() : 
                     questionTypeMode === "all" ? getRandomQuestionType() : questionTypeMode;
        await handleGenerateForCategory(leaf.id, leaf.name, leaf.path, categoryCount, qType);
      }
    }

    setGeneratingAll(false);
    toast.success(`批量生成完成，共处理 ${leafCategories.length} 个分类`);
  };

  return (
    <div className="h-full flex gap-4 p-4">
      {/* 左侧配置面板 */}
      <div className="w-[360px] flex-shrink-0 h-full">
        <ScrollArea className="h-full pr-2">
          <div className="flex flex-col gap-4 pb-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  AI 题目生成
                </CardTitle>
                <CardDescription className="text-xs">
                  自动化批量生成各类题目
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 题型模式 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">题型选择</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[200px]">
                          <p className="text-xs">全部：生成所有题型，均衡分配</p>
                          <p className="text-xs">随机：每次随机选择一种题型</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={questionTypeMode} onValueChange={(v) => setQuestionTypeMode(v as QuestionTypeMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" />
                          全部题型（均衡分配）
                        </span>
                      </SelectItem>
                      <SelectItem value="random">
                        <span className="flex items-center gap-2">
                          <Shuffle className="h-3.5 w-3.5" />
                          随机题型
                        </span>
                      </SelectItem>
                      <SelectItem value="single_choice">单选题</SelectItem>
                      <SelectItem value="multi_choice">多选题</SelectItem>
                      <SelectItem value="judge">判断题</SelectItem>
                      <SelectItem value="fill_blank">填空题</SelectItem>
                      <SelectItem value="essay">简答题</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 均衡分配开关 - 仅在全部题型时显示 */}
                {questionTypeMode === "all" && (
                  <div className="flex items-center justify-between py-1">
                    <div className="space-y-0.5">
                      <Label className="text-xs">均衡分配题型</Label>
                      <p className="text-[10px] text-muted-foreground">每种题型生成相同数量</p>
                    </div>
                    <Switch checked={balanceTypes} onCheckedChange={setBalanceTypes} />
                  </div>
                )}

                {/* 难度 */}
                <div className="space-y-2">
                  <Label className="text-xs">难度</Label>
                  <Select 
                    value={difficulty.toString()} 
                    onValueChange={(v) => setDifficulty(v === "random" ? "random" : parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">
                        <span className="flex items-center gap-2">
                          <Shuffle className="h-3.5 w-3.5" />
                          随机难度
                        </span>
                      </SelectItem>
                      {[1, 2, 3, 4, 5].map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {getDifficultyLabel(d)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* 分类选择模式 */}
                <div className="space-y-2">
                  <Label className="text-xs">分类选择</Label>
                  <Select value={categoryMode} onValueChange={(v) => setCategoryMode(v as CategoryMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" />
                          全部分类
                        </span>
                      </SelectItem>
                      <SelectItem value="random">
                        <span className="flex items-center gap-2">
                          <Shuffle className="h-3.5 w-3.5" />
                          随机选择分类
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 随机分类数量 - 仅在随机模式时显示 */}
                {categoryMode === "random" && (
                  <div className="space-y-2">
                    <Label className="text-xs">随机分类数量</Label>
                    <Select 
                      value={randomCategoryCount.toString()} 
                      onValueChange={(v) => setRandomCategoryCount(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 30, 50].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            随机 {n} 个分类
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                {/* 总题数 - 支持自定义输入 */}
                <div className="space-y-2">
                  <Label className="text-xs">生成总题数</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      value={customCount}
                      onChange={(e) => handleCustomCountChange(e.target.value)}
                      className="w-24"
                      placeholder="数量"
                    />
                    <div className="flex flex-wrap gap-1 flex-1">
                      {presetCounts.map((n) => (
                        <Button
                          key={n}
                          variant={totalCount === n ? "default" : "outline"}
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            setTotalCount(n);
                            setCustomCount(n.toString());
                          }}
                        >
                          {n}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {questionTypeMode === "all" && balanceTypes 
                      ? `将生成 ${Math.floor(totalCount / questionTypes.length)} 道/题型，共 ${questionTypes.length} 种题型`
                      : `题目将平均分配到各个分类`}
                  </p>
                </div>

                <Separator />

                {/* 自动化选项 */}
                <div className="space-y-3">
                  <Label className="text-xs flex items-center gap-2">
                    <Settings2 className="h-3.5 w-3.5" />
                    自动化选项
                  </Label>
                  <div className="flex items-center justify-between py-1">
                    <div className="space-y-0.5">
                      <Label className="text-xs">自动保存</Label>
                      <p className="text-[10px] text-muted-foreground">生成后自动保存到题库</p>
                    </div>
                    <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                  </div>
                </div>

                <Separator />

                {/* 生成计划预览 */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">生成计划</p>
                  <div className="space-y-1 text-[11px] text-blue-600 dark:text-blue-400">
                    <p>• 总数：<span className="font-semibold">{totalCount}</span> 道题目</p>
                    <p>• 题型：<span className="font-semibold">
                      {questionTypeMode === "all" ? `全部 ${questionTypes.length} 种` : 
                       questionTypeMode === "random" ? "随机" : getQuestionTypeName(questionTypeMode)}
                    </span></p>
                    <p>• 分类：<span className="font-semibold">
                      {categoryMode === "random" 
                        ? `随机 ${stats.targetCategoryCount} 个（共 ${stats.leafCategories} 个）`
                        : `全部 ${stats.leafCategories} 个`}
                    </span></p>
                    {questionTypeMode === "all" && balanceTypes && (
                      <p>• 每种题型约：<span className="font-semibold">{Math.floor(totalCount / questionTypes.length)}</span> 道</p>
                    )}
                    <p>• 每分类约：<span className="font-semibold">
                      {stats.targetCategoryCount > 0 
                        ? Math.max(1, Math.floor(totalCount / (questionTypeMode === "all" && balanceTypes 
                            ? stats.targetCategoryCount * questionTypes.length 
                            : stats.targetCategoryCount)))
                        : 0}
                    </span> 道</p>
                  </div>
                </div>

                {/* 统计 */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">叶子分类</p>
                    <p className="text-lg font-semibold">{stats.leafCategories}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">生成中</p>
                    <p className="text-lg font-semibold text-blue-600">{stats.generatingCount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">已完成</p>
                    <p className="text-lg font-semibold text-emerald-600">{stats.completedCount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">失败</p>
                    <p className="text-lg font-semibold text-red-500">{stats.failedCount}</p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerateAll}
                  disabled={generatingAll || loadingCategories || categories.length === 0}
                >
                  {generatingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {categoryMode === "random" 
                    ? `批量生成（随机 ${randomCategoryCount} 分类）` 
                    : "批量生成所有分类"}
                </Button>
              </CardContent>
            </Card>

            {/* 提示 */}
            <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
              <p className="font-medium mb-1">使用说明</p>
              <ul className="space-y-1 text-[11px]">
                <li>• <strong>全部题型</strong>：生成单选、多选、判断、填空、简答全部 5 种题型</li>
                <li>• <strong>随机分类</strong>：随机选择指定数量的分类进行生成</li>
                <li>• 直接输入数字可自定义总题数（1-1000）</li>
                <li>• 在分类树中点击单个分类可单独生成 5 道题</li>
                <li>• 开启自动保存后，生成的题目将直接入库</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* 右侧主内容区 */}
      <Card className="flex-1 min-w-0 flex flex-col overflow-hidden border-0 shadow-lg bg-gradient-to-b from-background to-muted/5">
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTabValue)} className="flex-1 flex flex-col">
          {/* Tab Header */}
          <div className="flex-shrink-0 border-b bg-muted/30">
            {/* Stats Bar */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-border/50">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-muted-foreground">生成中</span>
                  <span className="font-semibold text-blue-600">{stats.generatingCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">已完成</span>
                  <span className="font-semibold text-emerald-600">{stats.completedCount}</span>
                </div>
                {stats.failedCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">失败</span>
                    <span className="font-semibold text-red-500">{stats.failedCount}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                共 {tasks.length} 个任务
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 py-2 flex items-center justify-between">
              <TabsList className="h-8 p-0.5 bg-muted/60 rounded-lg">
                <TabsTrigger
                  value="tree"
                  className="h-7 px-3 text-xs gap-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <FolderTree className="h-3.5 w-3.5" />
                  分类树
                </TabsTrigger>
                <TabsTrigger
                  value="generating"
                  className="h-7 px-3 text-xs gap-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Activity className="h-3.5 w-3.5" />
                  生成中
                  {stats.generatingCount > 0 && (
                    <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-medium bg-blue-500 text-white">
                      {stats.generatingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="h-7 px-3 text-xs gap-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <ListChecks className="h-3.5 w-3.5" />
                  已完成
                  {stats.completedCount > 0 && (
                    <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-medium bg-emerald-500 text-white">
                      {stats.completedCount > 99 ? "99+" : stats.completedCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-1.5">
                {mainTab === "tree" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExpandAll}
                      disabled={loadingCategories}
                      title="展开全部"
                      className="h-7 w-7 p-0 hover:bg-muted"
                    >
                      <ChevronsUpDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCollapseAll}
                      disabled={expandedIds.size === 0}
                      title="收缩全部"
                      className="h-7 w-7 p-0 hover:bg-muted"
                    >
                      <ChevronsDownUp className="h-3.5 w-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchCategories}
                  disabled={loadingCategories}
                  className="h-7 px-2 hover:bg-muted"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", loadingCategories && "animate-spin")} />
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="flex-1 overflow-hidden p-0 relative">
            {/* 分类树 Tab */}
            <TabsContent value="tree" className="absolute inset-0 m-0 data-[state=inactive]:hidden">
              <ScrollArea className="h-full w-full">
                <div className="px-4 py-3 space-y-2">
                  {loadingCategories && (
                    <div className="flex flex-col items-center gap-3 py-16">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-primary/20" />
                        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                      <p className="text-sm text-muted-foreground">正在加载分类...</p>
                    </div>
                  )}
                  {!loadingCategories && categories.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-16">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <FolderTree className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">暂无分类数据</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">请先在课程结构中创建分类</p>
                      </div>
                    </div>
                  )}
                  {!loadingCategories &&
                    categories.map((category) => (
                      <CategoryNode
                        key={category.id}
                        node={category}
                        level={0}
                        expandedIds={expandedIds}
                        onToggle={toggleExpanded}
                        onGenerate={handleGenerateForCategory}
                        generatingCategories={generatingCategories}
                      />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 生成中 Tab */}
            <TabsContent value="generating" className="absolute inset-0 m-0 flex flex-col data-[state=inactive]:hidden">
              <div className="px-4 py-2.5 border-b bg-muted/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    placeholder="搜索任务..."
                    value={taskSearchKeyword}
                    onChange={(e) => setTaskSearchKeyword(e.target.value)}
                    className="h-9 text-sm pl-9 bg-background/80"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {generatingTasks.length === 0 && (
                  <div className="flex flex-col items-center gap-4 py-16">
                    <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                      <Activity className="h-10 w-10 text-blue-300 dark:text-blue-700" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">暂无正在生成的任务</p>
                      <p className="text-xs text-muted-foreground/70">在分类树中点击"生成"按钮开始</p>
                    </div>
                  </div>
                )}
                {generatingTasks.length > 0 && (
                  <div className="divide-y divide-border/50">
                    {generatingTasks.map((task) => (
                      <div key={task.id} className="px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{task.categoryName}</span>
                              <Badge variant="outline" className="text-[10px] h-5 border-0 bg-blue-100 text-blue-700">
                                {task.count} 题
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {getQuestionTypeName(task.questionType)} · {getDifficultyLabel(task.difficulty)}
                            </p>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(task.createdAt).toLocaleTimeString("zh-CN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {generatingTasks.length > 0 && (
                <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/20 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {generatingTasks.length} 个任务正在处理
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>处理中</span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 已完成 Tab */}
            <TabsContent value="completed" className="absolute inset-0 m-0 flex flex-col data-[state=inactive]:hidden">
              <div className="px-4 py-2.5 border-b bg-muted/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    placeholder="搜索任务..."
                    value={taskSearchKeyword}
                    onChange={(e) => setTaskSearchKeyword(e.target.value)}
                    className="h-9 text-sm pl-9 bg-background/80"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {completedTasks.length === 0 && (
                  <div className="flex flex-col items-center gap-4 py-16">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                      <ListChecks className="h-10 w-10 text-emerald-300 dark:text-emerald-700" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">暂无已完成的任务</p>
                      <p className="text-xs text-muted-foreground/70">完成的任务将在这里显示</p>
                    </div>
                  </div>
                )}
                {completedTasks.length > 0 && (
                  <div className="divide-y divide-border/50">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "px-4 py-3",
                          task.status === "completed"
                            ? "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                            : "hover:bg-red-50/50 dark:hover:bg-red-950/20"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              task.status === "completed"
                                ? "bg-emerald-100 dark:bg-emerald-900/50"
                                : "bg-red-100 dark:bg-red-900/50"
                            )}
                          >
                            {task.status === "completed" ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-sm font-medium truncate",
                                  task.status === "failed" && "text-red-700 dark:text-red-300"
                                )}
                              >
                                {task.categoryName}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] h-5 border-0",
                                  task.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                )}
                              >
                                {task.status === "completed"
                                  ? `成功 ${task.successCount} 题`
                                  : "失败"}
                              </Badge>
                            </div>
                            {task.errorMessage && (
                              <p className="text-xs text-red-500 mt-0.5 truncate">{task.errorMessage}</p>
                            )}
                            {!task.errorMessage && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {getQuestionTypeName(task.questionType)} · {getDifficultyLabel(task.difficulty)}
                              </p>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {task.completedAt
                              ? new Date(task.completedAt).toLocaleTimeString("zh-CN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {completedTasks.length > 0 && (
                <div className="flex-shrink-0 px-4 py-2.5 border-t bg-muted/20 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">显示 {completedTasks.length} 个任务</div>
                  <div className="flex items-center gap-4 text-xs">
                    {stats.completedCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-600 font-medium">{stats.completedCount} 成功</span>
                      </div>
                    )}
                    {stats.failedCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-red-500 font-medium">{stats.failedCount} 失败</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
