"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Star,
  TrendingUp,
  Lightbulb,
  FolderTree,
  Filter,
  Link2,
  X,
  Check,
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
  Textarea,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@what-cse/ui";
import {
  courseApi,
  Course,
  CourseCategory,
  KnowledgePoint,
  Frequency,
  CreateKnowledgeRequest,
  UpdateKnowledgeRequest,
  getFrequencyLabel,
  getSubjectName,
} from "@/services/course-api";
import { toast } from "sonner";

// ============================================
// Stats Cards Component
// ============================================

interface StatsCardsProps {
  stats: {
    total: number;
    highFrequency: number;
    mediumFrequency: number;
    lowFrequency: number;
  };
  loading: boolean;
}

function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: "知识点总数",
      value: stats.total,
      icon: Brain,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "高频考点",
      value: stats.highFrequency,
      icon: TrendingUp,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "中频考点",
      value: stats.mediumFrequency,
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "低频考点",
      value: stats.lowFrequency,
      icon: Lightbulb,
      color: "text-green-500",
      bgColor: "bg-green-50",
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
// Knowledge Point Form Dialog
// ============================================

interface KnowledgeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CourseCategory[];
  courses: Course[];
  point?: KnowledgePoint | null;
  parentId?: number;
  onSubmit: (data: CreateKnowledgeRequest | UpdateKnowledgeRequest, isEdit: boolean) => void;
}

function KnowledgeFormDialog({
  open,
  onOpenChange,
  categories,
  courses,
  point,
  parentId,
  onSubmit,
}: KnowledgeFormDialogProps) {
  const [formData, setFormData] = useState<CreateKnowledgeRequest>({
    category_id: 0,
    parent_id: parentId,
    code: "",
    name: "",
    description: "",
    importance: 3,
    frequency: "medium",
    tips: "",
    related_courses: [],
    sort_order: 0,
  });
  const [courseSearchTerm, setCourseSearchTerm] = useState("");

  useEffect(() => {
    if (point) {
      setFormData({
        category_id: point.category_id,
        parent_id: point.parent_id,
        code: point.code,
        name: point.name,
        description: point.description || "",
        importance: point.importance,
        frequency: point.frequency,
        tips: point.tips || "",
        related_courses: point.related_courses || [],
        sort_order: point.sort_order,
      });
    } else {
      setFormData({
        category_id: 0,
        parent_id: parentId,
        code: "",
        name: "",
        description: "",
        importance: 3,
        frequency: "medium",
        tips: "",
        related_courses: [],
        sort_order: 0,
      });
    }
  }, [point, parentId, open]);

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

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("请填写知识点名称");
      return;
    }
    if (!formData.code) {
      toast.error("请填写知识点编码");
      return;
    }
    if (!point && !formData.category_id) {
      toast.error("请选择所属分类");
      return;
    }
    onSubmit(formData, !!point);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{point ? "编辑知识点" : "新建知识点"}</DialogTitle>
          <DialogDescription>
            {point ? "修改知识点信息" : "添加新的知识点"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>知识点名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="输入知识点名称"
              />
            </div>

            <div className="space-y-2">
              <Label>编码 *</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="如 xc_yanyu_sc"
              />
            </div>
          </div>

          {!point && (
            <div className="space-y-2">
              <Label>所属分类 *</Label>
              <Select
                value={formData.category_id ? formData.category_id.toString() : ""}
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
          )}

          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="知识点简要描述..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>考试频率</Label>
              <Select
                value={formData.frequency}
                onValueChange={(v) =>
                  setFormData({ ...formData, frequency: v as Frequency })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高频</SelectItem>
                  <SelectItem value="medium">中频</SelectItem>
                  <SelectItem value="low">低频</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>重要程度 (1-5)</Label>
              <Select
                value={formData.importance?.toString() || "3"}
                onValueChange={(v) =>
                  setFormData({ ...formData, importance: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - 了解</SelectItem>
                  <SelectItem value="2">2 - 理解</SelectItem>
                  <SelectItem value="3">3 - 掌握</SelectItem>
                  <SelectItem value="4">4 - 重点</SelectItem>
                  <SelectItem value="5">5 - 必考</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>学习提示</Label>
            <Textarea
              value={formData.tips}
              onChange={(e) =>
                setFormData({ ...formData, tips: e.target.value })
              }
              placeholder="学习建议和技巧..."
              rows={2}
            />
          </div>

          {/* 关联课程设置 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              关联课程
            </Label>
            
            {/* 已选课程列表 */}
            {formData.related_courses && formData.related_courses.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-md">
                {formData.related_courses.map((courseId) => {
                  const course = courses.find((c) => c.id === courseId);
                  return (
                    <Badge
                      key={courseId}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      {course?.title || `课程#${courseId}`}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            related_courses: formData.related_courses?.filter(
                              (id) => id !== courseId
                            ),
                          })
                        }
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* 课程搜索和选择 */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                  placeholder="搜索课程..."
                  className="pl-9"
                />
              </div>

              {/* 课程列表 */}
              <ScrollArea className="h-[150px] border rounded-md">
                <div className="p-2 space-y-1">
                  {courses
                    .filter((course) => {
                      if (!courseSearchTerm) return true;
                      return course.title
                        .toLowerCase()
                        .includes(courseSearchTerm.toLowerCase());
                    })
                    .slice(0, 20)
                    .map((course) => {
                      const isSelected = formData.related_courses?.includes(
                        course.id
                      );
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                related_courses: formData.related_courses?.filter(
                                  (id) => id !== course.id
                                ),
                              });
                            } else {
                              setFormData({
                                ...formData,
                                related_courses: [
                                  ...(formData.related_courses || []),
                                  course.id,
                                ],
                              });
                            }
                          }}
                          className={`w-full flex items-center gap-2 p-2 text-left rounded-md hover:bg-muted transition-colors ${
                            isSelected ? "bg-primary/10" : ""
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {course.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {course.category?.name || "未分类"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  {courses.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      暂无课程
                    </p>
                  )}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                已选 {formData.related_courses?.length || 0} 门课程
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            {point ? "保存修改" : "创建知识点"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Knowledge Point Tree Item
// ============================================

interface KnowledgeTreeItemProps {
  point: KnowledgePoint;
  level: number;
  courses: Course[];
  onEdit: (point: KnowledgePoint) => void;
  onDelete: (point: KnowledgePoint) => void;
  onAddChild: (parentId: number, categoryId: number) => void;
}

function KnowledgeTreeItem({
  point,
  level,
  courses,
  onEdit,
  onDelete,
  onAddChild,
}: KnowledgeTreeItemProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = point.children && point.children.length > 0;
  const relatedCourseCount = point.related_courses?.length || 0;

  const getFrequencyColor = (frequency: Frequency) => {
    switch (frequency) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getImportanceStars = (importance: number) => {
    return "★".repeat(importance) + "☆".repeat(5 - importance);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors ${
          level > 0 ? "ml-6" : ""
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-muted rounded"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <Brain className="h-4 w-4 text-muted-foreground" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{point.name}</p>
              <Badge variant="outline" className="text-xs font-mono">
                {point.code}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <Badge className={`text-xs ${getFrequencyColor(point.frequency)}`}>
                {getFrequencyLabel(point.frequency)}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-amber-500">
                      {getImportanceStars(point.importance)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    重要程度: {point.importance}/5
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {relatedCourseCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {relatedCourseCount} 课程
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium mb-1">关联课程:</p>
                      <ul className="text-xs space-y-0.5">
                        {point.related_courses?.slice(0, 5).map((courseId) => {
                          const course = courses.find((c) => c.id === courseId);
                          return (
                            <li key={courseId}>
                              • {course?.title || `课程#${courseId}`}
                            </li>
                          );
                        })}
                        {relatedCourseCount > 5 && (
                          <li>...还有 {relatedCourseCount - 5} 门</li>
                        )}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {point.description && (
                <span className="truncate max-w-[200px]">{point.description}</span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(point)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            {level < 2 && (
              <DropdownMenuItem onClick={() => onAddChild(point.id, point.category_id)}>
                <Plus className="mr-2 h-4 w-4" />
                添加子知识点
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(point)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && expanded && (
        <div className="mt-1">
          {point.children!.map((child) => (
            <KnowledgeTreeItem
              key={child.id}
              point={child}
              level={level + 1}
              courses={courses}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function KnowledgePointsPage() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<KnowledgePoint[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [frequencyFilter, setFrequencyFilter] = useState<Frequency | "all">("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<KnowledgePoint | null>(null);
  const [parentPointId, setParentPointId] = useState<number | undefined>(undefined);
  const [defaultCategoryId, setDefaultCategoryId] = useState<number | undefined>(undefined);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    highFrequency: 0,
    mediumFrequency: 0,
    lowFrequency: 0,
  });

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

  // 加载数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesRes, pointsRes, coursesRes] = await Promise.all([
        courseApi.getCategories(),
        courseApi.getKnowledgePoints({
          category_id: categoryFilter !== "all" ? categoryFilter : undefined,
          frequency: frequencyFilter !== "all" ? frequencyFilter : undefined,
        }),
        courseApi.getCourses({ page_size: 100, status: "published" }),
      ]);

      setCategories(categoriesRes.categories || []);
      setPoints(pointsRes.knowledge_points || []);
      setCourses(coursesRes.courses || []);

      // 计算统计数据
      const allPoints = pointsRes.knowledge_points || [];
      const flatPoints = flattenPoints(allPoints);
      setStats({
        total: flatPoints.length,
        highFrequency: flatPoints.filter(p => p.frequency === "high").length,
        mediumFrequency: flatPoints.filter(p => p.frequency === "medium").length,
        lowFrequency: flatPoints.filter(p => p.frequency === "low").length,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, frequencyFilter]);

  // 扁平化知识点
  const flattenPoints = (pts: KnowledgePoint[]): KnowledgePoint[] => {
    const result: KnowledgePoint[] = [];
    for (const pt of pts) {
      result.push(pt);
      if (pt.children) {
        result.push(...flattenPoints(pt.children));
      }
    }
    return result;
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 过滤知识点
  const filterPoints = (pts: KnowledgePoint[]): KnowledgePoint[] => {
    if (!searchTerm) return pts;
    
    const term = searchTerm.toLowerCase();
    return pts.filter(pt => {
      const matches = pt.name.toLowerCase().includes(term) || 
                     pt.code.toLowerCase().includes(term) ||
                     (pt.description && pt.description.toLowerCase().includes(term));
      if (matches) return true;
      if (pt.children) {
        const filteredChildren = filterPoints(pt.children);
        if (filteredChildren.length > 0) {
          pt.children = filteredChildren;
          return true;
        }
      }
      return false;
    });
  };

  const filteredPoints = filterPoints([...points]);

  // 操作处理
  const handleAdd = (parentId?: number, categoryId?: number) => {
    setEditingPoint(null);
    setParentPointId(parentId);
    setDefaultCategoryId(categoryId);
    setDialogOpen(true);
  };

  const handleEdit = (point: KnowledgePoint) => {
    setEditingPoint(point);
    setParentPointId(point.parent_id);
    setDialogOpen(true);
  };

  const handleDelete = async (point: KnowledgePoint) => {
    if (!confirm(`确定要删除知识点"${point.name}"吗？`)) return;
    try {
      await courseApi.deleteKnowledgePoint(point.id);
      toast.success("知识点已删除");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  const handleSubmit = async (
    data: CreateKnowledgeRequest | UpdateKnowledgeRequest,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && editingPoint) {
        await courseApi.updateKnowledgePoint(editingPoint.id, data as UpdateKnowledgeRequest);
        toast.success("知识点已更新");
      } else {
        const createData = data as CreateKnowledgeRequest;
        if (defaultCategoryId && !createData.category_id) {
          createData.category_id = defaultCategoryId;
        }
        await courseApi.createKnowledgePoint(createData);
        toast.success("知识点已创建");
      }
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            知识点管理
          </h1>
          <p className="text-muted-foreground">管理公考学习的知识点体系</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button size="sm" onClick={() => handleAdd()}>
            <Plus className="mr-2 h-4 w-4" />
            新建知识点
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <StatsCards stats={stats} loading={loading} />

      {/* 知识点列表 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  知识点树
                </CardTitle>
                <CardDescription>按分类组织的知识点层级结构</CardDescription>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索知识点..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={categoryFilter === "all" ? "all" : categoryFilter.toString()}
                onValueChange={(v) =>
                  setCategoryFilter(v === "all" ? "all" : Number(v))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {"　".repeat(cat.level)}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={frequencyFilter}
                onValueChange={(v) =>
                  setFrequencyFilter(v as Frequency | "all")
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="考频" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部频率</SelectItem>
                  <SelectItem value="high">高频</SelectItem>
                  <SelectItem value="medium">中频</SelectItem>
                  <SelectItem value="low">低频</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPoints.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无知识点</p>
              <p className="text-sm">点击"新建知识点"开始创建</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {filteredPoints.map((point) => (
                  <KnowledgeTreeItem
                    key={point.id}
                    point={point}
                    level={0}
                    courses={courses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddChild={handleAdd}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* 知识点编辑对话框 */}
      <KnowledgeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        courses={courses}
        point={editingPoint}
        parentId={parentPointId}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
