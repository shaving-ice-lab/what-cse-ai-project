"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { useToolbar } from "./ToolbarContext";
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
  Sparkles,
  Zap,
  Target,
  GraduationCap,
  Layers,
  ArrowUpRight,
  Activity,
  ChevronsUpDown,
  ChevronsDownUp,
  LayoutGrid,
  LayoutList,
  Copy,
  Eye,
  Keyboard,
  Info,
  ChevronUp,
  Hash,
  Network,
  PanelRightClose,
  PanelRightOpen,
  Clock,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Folder,
  SlidersHorizontal,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  History,
  ArrowRight,
  Wand2,
  Boxes,
  TrendingDown,
  BarChart3,
  PieChart,
  FileDown,
  Printer,
  MousePointerClick,
  Grip,
  ChevronLeft,
  Home,
  ArrowDown,
  ArrowUp,
  CircleCheck,
  Timer,
  Calendar,
  FlaskConical,
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
  Progress,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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
// Mini Ring Chart Component
// ============================================

function MiniRingChart({ 
  value, 
  total, 
  color,
  size = 40,
}: { 
  value: number; 
  total: number; 
  color: string;
  size?: number;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const circumference = 2 * Math.PI * 15;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted/30"
        />
        <circle
          cx="20"
          cy="20"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className={color}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

// ============================================
// Active Filter Breadcrumb Component
// ============================================

interface FilterBreadcrumbProps {
  categoryFilter: number | "all";
  frequencyFilter: Frequency | "all";
  searchTerm: string;
  categories: { id: number; name: string; level: number }[];
  onClearCategory: () => void;
  onClearFrequency: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

function FilterBreadcrumb({
  categoryFilter,
  frequencyFilter,
  searchTerm,
  categories,
  onClearCategory,
  onClearFrequency,
  onClearSearch,
  onClearAll,
}: FilterBreadcrumbProps) {
  const hasFilters = categoryFilter !== "all" || frequencyFilter !== "all" || searchTerm;
  
  if (!hasFilters) return null;

  const categoryName = categories.find(c => c.id === categoryFilter)?.name;

  const frequencyLabels: Record<string, string> = {
    high: "高频",
    medium: "中频",
    low: "低频",
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-dashed">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Filter className="h-3 w-3" />
        <span>筛选:</span>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {categoryFilter !== "all" && categoryName && (
          <Badge variant="secondary" className="text-xs pl-2 pr-1 gap-1">
            <FolderTree className="h-3 w-3" />
            {categoryName}
            <button 
              onClick={onClearCategory}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        
        {frequencyFilter !== "all" && (
          <Badge variant="secondary" className="text-xs pl-2 pr-1 gap-1">
            <Activity className="h-3 w-3" />
            {frequencyLabels[frequencyFilter]}
            <button 
              onClick={onClearFrequency}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        
        {searchTerm && (
          <Badge variant="secondary" className="text-xs pl-2 pr-1 gap-1">
            <Search className="h-3 w-3" />
            "{searchTerm}"
            <button 
              onClick={onClearSearch}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClearAll}
        className="ml-auto text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
      >
        清除全部
      </Button>
    </div>
  );
}

// ============================================
// Quick Jump Dialog Component
// ============================================

interface QuickJumpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  points: KnowledgePoint[];
  onSelect: (point: KnowledgePoint) => void;
}

function QuickJumpDialog({ open, onOpenChange, points, onSelect }: QuickJumpDialogProps) {
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchValue("");
    }
  }, [open]);

  // Flatten points for search
  const flattenAllPoints = (pts: KnowledgePoint[]): KnowledgePoint[] => {
    const result: KnowledgePoint[] = [];
    for (const pt of pts) {
      result.push(pt);
      if (pt.children) {
        result.push(...flattenAllPoints(pt.children));
      }
    }
    return result;
  };

  const allPoints = useMemo(() => flattenAllPoints(points), [points]);

  const filteredPoints = useMemo(() => {
    if (!searchValue.trim()) return allPoints.slice(0, 10);
    const term = searchValue.toLowerCase();
    return allPoints
      .filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.code.toLowerCase().includes(term)
      )
      .slice(0, 10);
  }, [allPoints, searchValue]);

  const getFrequencyIcon = (frequency: Frequency) => {
    switch (frequency) {
      case "high": return <Zap className="h-3 w-3" />;
      case "medium": return <Target className="h-3 w-3" />;
      case "low": return <Lightbulb className="h-3 w-3" />;
      default: return <Brain className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="搜索知识点名称或编码..."
              className="pl-9 pr-4"
            />
          </div>
        </div>
        
        <ScrollArea className="max-h-[300px]">
          <div className="p-2">
            {filteredPoints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">没有找到匹配的知识点</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPoints.map((point) => (
                  <button
                    key={point.id}
                    onClick={() => {
                      onSelect(point);
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 text-left transition-colors group"
                  >
                    <div className="p-1.5 rounded-md bg-muted">
                      {getFrequencyIcon(point.frequency)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{point.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{point.code}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
              导航
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd>
              选择
            </span>
          </div>
          <span>共 {allPoints.length} 个知识点</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState({ 
  hasFilters, 
  onClearFilters, 
  onCreateFirst 
}: { 
  hasFilters: boolean; 
  onClearFilters: () => void; 
  onCreateFirst: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-muted mb-4">
        <Brain className="h-12 w-12 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {hasFilters ? "没有找到匹配的知识点" : "暂无知识点"}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {hasFilters 
          ? "尝试调整筛选条件或搜索关键词"
          : "创建知识点来构建您的学习体系"}
      </p>
      
      {hasFilters ? (
        <Button variant="outline" onClick={onClearFilters} className="gap-2">
          <X className="h-4 w-4" />
          清除筛选
        </Button>
      ) : (
        <Button onClick={onCreateFirst}>
          <Plus className="mr-2 h-4 w-4" />
          创建知识点
        </Button>
      )}
    </div>
  );
}

// ============================================
// Animated Counter Component
// ============================================

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

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
  activeFilter?: Frequency | "all";
  onFilterClick?: (filter: Frequency | "all") => void;
}

function StatsCards({ stats, loading, activeFilter = "all", onFilterClick }: StatsCardsProps) {
  const cards = [
    {
      title: "知识点总数",
      value: stats.total,
      icon: Brain,
      trend: "全部",
      filterValue: "all" as const,
    },
    {
      title: "高频考点",
      value: stats.highFrequency,
      icon: Zap,
      trend: "必考",
      filterValue: "high" as Frequency,
    },
    {
      title: "中频考点",
      value: stats.mediumFrequency,
      icon: Target,
      trend: "常考",
      filterValue: "medium" as Frequency,
    },
    {
      title: "低频考点",
      value: stats.lowFrequency,
      icon: Lightbulb,
      trend: "拓展",
      filterValue: "low" as Frequency,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </CardHeader>
            <CardContent className="relative">
              <Skeleton className="h-9 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const isActive = activeFilter === card.filterValue;
        return (
          <Card 
            key={index} 
            onClick={() => onFilterClick?.(card.filterValue)}
            className={`
              relative overflow-hidden group cursor-pointer
              transition-all duration-200 hover:shadow-md
              ${isActive 
                ? "ring-2 ring-primary shadow-md" 
                : ""
              }
            `}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            )}
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-muted">
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      <AnimatedNumber value={card.value} />
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {card.trend}
                    </Badge>
                  </div>
                  {/* Click hint */}
                  <div className="mt-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {isActive ? "点击取消筛选" : "点击筛选"}
                  </div>
                </div>
                {/* Percentage */}
                <div className="text-right">
                  <span className="text-lg font-semibold text-muted-foreground">
                    {stats.total > 0 ? Math.round((card.value / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
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

  const frequencyOptions = [
    { value: "high", label: "高频", icon: Zap },
    { value: "medium", label: "中频", icon: Target },
    { value: "low", label: "低频", icon: Lightbulb },
  ];

  const importanceOptions = [
    { value: "1", label: "了解", stars: 1 },
    { value: "2", label: "理解", stars: 2 },
    { value: "3", label: "掌握", stars: 3 },
    { value: "4", label: "重点", stars: 4 },
    { value: "5", label: "必考", stars: 5 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-muted">
                {point ? <Edit className="h-5 w-5 text-muted-foreground" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
              </div>
              {point ? "编辑知识点" : "新建知识点"}
            </DialogTitle>
            <DialogDescription>
              {point ? "修改知识点的详细信息" : "创建一个新的知识点并设置相关属性"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Brain className="h-4 w-4" />
                基本信息
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">知识点名称 <span className="text-rose-500">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="输入知识点名称"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">编码 <span className="text-rose-500">*</span></Label>
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="如 xc_yanyu_sc"
                    className="h-10 font-mono text-sm"
                  />
                </div>
              </div>

              {!point && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">所属分类 <span className="text-rose-500">*</span></Label>
                  <Select
                    value={formData.category_id ? formData.category_id.toString() : ""}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category_id: Number(v) })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {flatCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          <span className="flex items-center gap-1">
                            {"　".repeat(cat.level)}
                            <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                            {cat.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="知识点简要描述..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            <Separator />

            {/* 考试属性 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Activity className="h-4 w-4" />
                考试属性
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">考试频率</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {frequencyOptions.map((opt) => {
                      const isSelected = formData.frequency === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, frequency: opt.value as Frequency })}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all ${
                            isSelected 
                              ? "border-primary bg-primary/5" 
                              : "border-transparent bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          <opt.icon className={`h-4 w-4 ${isSelected ? "text-foreground" : "text-muted-foreground"}`} />
                          <span className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">重要程度</Label>
                  <Select
                    value={formData.importance?.toString() || "3"}
                    onValueChange={(v) =>
                      setFormData({ ...formData, importance: Number(v) })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {importanceOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <span className="text-foreground">
                              {"★".repeat(opt.stars)}{"☆".repeat(5 - opt.stars)}
                            </span>
                            <span>{opt.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">学习提示</Label>
                <Textarea
                  value={formData.tips}
                  onChange={(e) =>
                    setFormData({ ...formData, tips: e.target.value })
                  }
                  placeholder="学习建议和技巧..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            <Separator />

            {/* 关联课程设置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  关联课程
                </div>
                <Badge variant="secondary" className="text-xs">
                  已选 {formData.related_courses?.length || 0} 门
                </Badge>
              </div>
              
              {/* 已选课程列表 */}
              {formData.related_courses && formData.related_courses.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-dashed">
                  {formData.related_courses.map((courseId) => {
                    const course = courses.find((c) => c.id === courseId);
                    return (
                      <Badge
                        key={courseId}
                        variant="secondary"
                        className="flex items-center gap-1.5 pr-1 py-1 bg-background shadow-sm"
                      >
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="max-w-[150px] truncate">{course?.title || `课程#${courseId}`}</span>
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
                          className="ml-0.5 hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* 课程搜索和选择 */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={courseSearchTerm}
                    onChange={(e) => setCourseSearchTerm(e.target.value)}
                    placeholder="搜索课程..."
                    className="pl-9 h-10"
                  />
                </div>

                {/* 课程列表 */}
                <div className="border rounded-lg overflow-hidden">
                  <ScrollArea className="h-[160px]">
                    <div className="p-1.5 space-y-1">
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
                              className={`w-full flex items-center gap-3 p-2.5 text-left rounded-md transition-all ${
                                isSelected 
                                  ? "bg-primary/5 ring-1 ring-primary/20" 
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-muted-foreground/30"
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
                              {isSelected && (
                                <Badge variant="secondary" className="text-[10px]">
                                  已选
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      {courses.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">暂无课程</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-4">
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {point ? "保存修改" : "创建知识点"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Text Highlighter Component
// ============================================

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-primary/20 text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

// ============================================
// Knowledge Point Detail Sheet
// ============================================

interface KnowledgeDetailSheetProps {
  point: KnowledgePoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onEdit: (point: KnowledgePoint) => void;
  onDelete: (point: KnowledgePoint) => void;
}

function KnowledgeDetailSheet({
  point,
  open,
  onOpenChange,
  courses,
  onEdit,
  onDelete,
}: KnowledgeDetailSheetProps) {
  if (!point) return null;

  const getFrequencyConfig = (frequency: Frequency) => {
    switch (frequency) {
      case "high":
        return { 
          bg: "bg-muted", 
          text: "text-foreground",
          icon: Zap,
          label: "高频考点",
          description: "历年考试中频繁出现，必须重点掌握"
        };
      case "medium":
        return { 
          bg: "bg-muted", 
          text: "text-foreground",
          icon: Target,
          label: "中频考点",
          description: "考试中偶尔出现，需要理解掌握"
        };
      case "low":
        return { 
          bg: "bg-muted", 
          text: "text-muted-foreground",
          icon: Lightbulb,
          label: "低频考点",
          description: "考试中较少出现，了解即可"
        };
      default:
        return { 
          bg: "bg-muted", 
          text: "text-muted-foreground",
          icon: Brain,
          label: "未知",
          description: ""
        };
    }
  };

  const frequencyConfig = getFrequencyConfig(point.frequency);
  const FrequencyIcon = frequencyConfig.icon;
  const relatedCoursesList = point.related_courses?.map(id => 
    courses.find(c => c.id === id)
  ).filter(Boolean) || [];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(point.code);
    toast.success("编码已复制到剪贴板");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted">
                  <Brain className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <SheetTitle className="text-xl">{point.name}</SheetTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className="font-mono text-xs cursor-pointer hover:bg-muted"
                      onClick={handleCopyCode}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {point.code}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl ${frequencyConfig.bg} border border-dashed`}>
                <div className="flex items-center gap-2 mb-2">
                  <FrequencyIcon className={`h-4 w-4 ${frequencyConfig.text}`} />
                  <span className={`text-sm font-medium ${frequencyConfig.text}`}>
                    {frequencyConfig.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {frequencyConfig.description}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-muted border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-foreground fill-foreground" />
                  <span className="text-sm font-medium">
                    重要程度 {point.importance}/5
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= point.importance 
                          ? "text-foreground fill-foreground" 
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            {point.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  描述
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <p className="text-sm leading-relaxed">{point.description}</p>
                </div>
              </div>
            )}

            {/* Tips */}
            {point.tips && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  学习提示
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <p className="text-sm leading-relaxed">
                    {point.tips}
                  </p>
                </div>
              </div>
            )}

            {/* Related Courses */}
            {relatedCoursesList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Link2 className="h-4 w-4" />
                    关联课程
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {relatedCoursesList.length} 门
                  </Badge>
                </div>
                <div className="space-y-2">
                  {relatedCoursesList.map((course) => (
                    <div 
                      key={course!.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors group cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-muted">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{course!.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {course!.category?.name || "未分类"}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {point.children && point.children.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Network className="h-4 w-4" />
                    子知识点
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {point.children.length} 个
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {point.children.map((child) => {
                    const childFreq = getFrequencyConfig(child.frequency);
                    const ChildIcon = childFreq.icon;
                    return (
                      <div 
                        key={child.id}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border"
                      >
                        <ChildIcon className={`h-3.5 w-3.5 ${childFreq.text}`} />
                        <span className="text-sm flex-1 truncate">{child.name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {child.code}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Info className="h-4 w-4" />
                元信息
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/30 flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{point.id}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">排序:</span>
                  <span>{point.sort_order}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyCode}
          >
            <Copy className="mr-2 h-4 w-4" />
            复制编码
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onDelete(point);
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(point);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================
// Category Sidebar Component (Compact)
// ============================================

interface CategorySidebarProps {
  categories: CourseCategory[];
  selectedCategory: number | "all";
  onSelectCategory: (id: number | "all") => void;
  stats: {
    total: number;
    byCategory: Record<number, number>;
  };
}

function CategorySidebar({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  stats 
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleExpanded = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: CourseCategory, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.id;
    const count = stats.byCategory[category.id] || 0;

    return (
      <div key={category.id}>
        <button
          onClick={() => onSelectCategory(category.id)}
          className={`
            w-full flex items-center gap-1 px-2 py-1 rounded text-left text-xs
            transition-colors duration-100
            ${isSelected 
              ? "bg-primary/10 text-foreground font-medium" 
              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            }
          `}
          style={{ paddingLeft: `${8 + level * 10}px` }}
        >
          {hasChildren ? (
            <span 
              onClick={(e) => toggleExpanded(category.id, e)}
              className="p-0.5 -ml-0.5 hover:bg-muted rounded cursor-pointer"
            >
              <ChevronRight 
                className={`h-3 w-3 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} 
              />
            </span>
          ) : (
            <span className="w-4 flex-shrink-0" />
          )}
          <span className="truncate flex-1">{category.name}</span>
          {count > 0 && (
            <span className="text-[10px] text-muted-foreground/70 tabular-nums ml-1">
              {count}
            </span>
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-0.5">
      {/* All categories option */}
      <button
        onClick={() => onSelectCategory("all")}
        className={`
          w-full flex items-center gap-1 px-2 py-1 rounded text-left text-xs
          transition-colors duration-100
          ${selectedCategory === "all" 
            ? "bg-primary/10 text-foreground font-medium" 
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          }
        `}
      >
        <span className="w-4 flex-shrink-0" />
        <span className="flex-1">全部</span>
        <span className="text-[10px] text-muted-foreground/70 tabular-nums">
          {stats.total}
        </span>
      </button>
      
      <Separator className="my-1.5" />
      
      {/* Category tree */}
      {categories.map(cat => renderCategory(cat))}
    </div>
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
  onPreview?: (point: KnowledgePoint) => void;
  isLast?: boolean;
  searchTerm?: string;
  isExpanded?: boolean;
  viewMode?: "tree" | "compact";
}

function KnowledgeTreeItem({
  point,
  level,
  courses,
  onEdit,
  onDelete,
  onAddChild,
  onPreview,
  isLast = false,
  searchTerm = "",
  isExpanded,
  viewMode = "tree",
}: KnowledgeTreeItemProps) {
  const [localExpanded, setLocalExpanded] = useState(level < 2);
  const expanded = isExpanded !== undefined ? isExpanded : localExpanded;
  const hasChildren = point.children && point.children.length > 0;
  const relatedCourseCount = point.related_courses?.length || 0;
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getFrequencyConfig = (frequency: Frequency) => {
    switch (frequency) {
      case "high":
        return { 
          bg: "bg-muted", 
          text: "text-foreground",
          border: "border-border",
          icon: Zap,
          label: "高频",
          pulse: false,
        };
      case "medium":
        return { 
          bg: "bg-muted", 
          text: "text-foreground",
          border: "border-border",
          icon: Target,
          label: "中频",
          pulse: false,
        };
      case "low":
        return { 
          bg: "bg-muted", 
          text: "text-muted-foreground",
          border: "border-border",
          icon: Lightbulb,
          label: "低频",
          pulse: false,
        };
      default:
        return { 
          bg: "bg-muted", 
          text: "text-muted-foreground",
          border: "border-muted",
          icon: Brain,
          label: "未知",
          pulse: false,
        };
    }
  };

  const frequencyConfig = getFrequencyConfig(point.frequency);
  const FrequencyIcon = frequencyConfig.icon;

  const getLevelStyles = () => {
    const baseStyles = [
      "border-l-4 border-l-primary/60",
      "border-l-4 border-l-primary/40",
      "border-l-4 border-l-primary/20",
    ];
    return baseStyles[Math.min(level, baseStyles.length - 1)];
  };

  const getImportanceDisplay = (importance: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 transition-all ${
              star <= importance 
                ? "text-foreground fill-current" 
                : "text-muted-foreground/20"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(point.code);
    toast.success("编码已复制到剪贴板");
  };

  const toggleExpanded = () => {
    if (isExpanded === undefined) {
      setLocalExpanded(!localExpanded);
    }
  };

  // Compact view mode
  if (viewMode === "compact") {
    return (
      <div className="relative">
        <div
          className={`
            group relative flex items-center gap-2 py-2 px-3 rounded-lg
            hover:bg-muted/50 transition-all duration-150
            ${searchTerm && (point.name.toLowerCase().includes(searchTerm.toLowerCase()) || point.code.toLowerCase().includes(searchTerm.toLowerCase())) 
              ? "bg-muted" 
              : ""
            }
          `}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {/* Expand button */}
          {hasChildren ? (
            <button
              onClick={toggleExpanded}
              className="p-0.5 rounded hover:bg-muted"
            >
              <ChevronRight 
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} 
              />
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Frequency indicator */}
          <div className={`w-1.5 h-1.5 rounded-full ${frequencyConfig.bg.replace('bg-gradient-to-r', 'bg')} ${frequencyConfig.text.replace('text-', 'bg-')}`} />

          {/* Name */}
          <span className="font-medium text-sm truncate flex-1">
            <HighlightText text={point.name} highlight={searchTerm} />
          </span>

          {/* Code */}
          <Badge variant="outline" className="text-[9px] font-mono h-4 px-1 hidden sm:inline-flex">
            <HighlightText text={point.code} highlight={searchTerm} />
          </Badge>

          {/* Importance mini */}
          <span className="text-muted-foreground text-[10px]">{"★".repeat(point.importance)}</span>

          {/* Quick actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={() => onEdit(point)}
              className="p-1 hover:bg-muted rounded"
            >
              <Edit className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && expanded && (
          <div>
            {point.children!.map((child, index) => (
              <KnowledgeTreeItem
                key={child.id}
                point={child}
                level={level + 1}
                courses={courses}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onPreview={onPreview}
                isLast={index === point.children!.length - 1}
                searchTerm={searchTerm}
                isExpanded={isExpanded}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Tree view mode (default)
  return (
    <div className="relative">
      {/* Tree connection lines */}
      {level > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-6"
          style={{ marginLeft: `${(level - 1) * 24}px` }}
        >
          <div className={`absolute left-3 top-0 w-px bg-border ${isLast ? "h-7" : "h-full"}`} />
          <div className="absolute left-3 top-7 w-3 h-px bg-border" />
        </div>
      )}

      <div
        onMouseEnter={() => setShowQuickActions(true)}
        onMouseLeave={() => setShowQuickActions(false)}
        onDoubleClick={() => onPreview?.(point)}
        className={`
          group relative flex items-center gap-3 p-3 rounded-xl 
          bg-card hover:bg-muted/50 
          border shadow-sm hover:shadow-md
          transition-all duration-200 cursor-pointer
          ${getLevelStyles()}
          ${searchTerm && (point.name.toLowerCase().includes(searchTerm.toLowerCase()) || point.code.toLowerCase().includes(searchTerm.toLowerCase())) 
            ? "ring-2 ring-primary/30 bg-muted/50" 
            : ""
          }
        `}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Expand/Collapse button */}
        <div className="flex-shrink-0">
          {hasChildren ? (
            <button
              onClick={toggleExpanded}
              className={`
                p-1.5 rounded-lg transition-all duration-200
                ${expanded 
                  ? "bg-primary/10 text-foreground" 
                  : "bg-muted hover:bg-primary/10"
                }
              `}
            >
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`} 
              />
            </button>
          ) : (
            <div className="p-1.5">
              <div className="w-4 h-4 rounded-full bg-muted/50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className="flex-shrink-0 p-2 rounded-lg bg-muted">
          <Brain className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-foreground truncate">
              <HighlightText text={point.name} highlight={searchTerm} />
            </h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-[10px] font-mono px-1.5 py-0 h-5 bg-muted/50 border-dashed cursor-pointer hover:bg-muted transition-colors"
                    onClick={handleCopyCode}
                  >
                    <Hash className="h-2.5 w-2.5 mr-0.5" />
                    <HighlightText text={point.code} highlight={searchTerm} />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  点击复制编码
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {hasChildren && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                <Network className="h-2.5 w-2.5 mr-0.5" />
                {point.children?.length} 子项
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Frequency badge */}
            <Badge 
              className={`text-[10px] px-2 py-0.5 h-5 ${frequencyConfig.bg} ${frequencyConfig.text} border ${frequencyConfig.border}`}
            >
              <FrequencyIcon className="h-3 w-3 mr-1" />
              {frequencyConfig.label}
            </Badge>
            
            {/* Importance stars */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    {getImportanceDisplay(point.importance)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  重要程度: {point.importance}/5
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Related courses */}
            {relatedCourseCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="text-[10px] px-2 py-0.5 h-5 cursor-help hover:bg-muted transition-colors"
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      {relatedCourseCount} 课程
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="font-semibold mb-1.5 flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      关联课程
                    </p>
                    <ul className="text-xs space-y-1">
                      {point.related_courses?.slice(0, 5).map((courseId) => {
                        const course = courses.find((c) => c.id === courseId);
                        return (
                          <li key={courseId} className="flex items-center gap-1.5">
                            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{course?.title || `课程#${courseId}`}</span>
                          </li>
                        );
                      })}
                      {relatedCourseCount > 5 && (
                        <li className="text-muted-foreground">
                          ...还有 {relatedCourseCount - 5} 门课程
                        </li>
                      )}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Description preview */}
            {point.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px] hidden lg:inline cursor-help">
                      {point.description}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[300px] text-xs">
                    {point.description}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Quick Actions (visible on hover) */}
        <div className={`flex-shrink-0 flex items-center gap-1 transition-all duration-200 ${showQuickActions ? "opacity-100" : "opacity-0"}`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-lg"
                  onClick={() => onEdit(point)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">编辑</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {level < 2 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-lg"
                    onClick={() => onAddChild(point.id, point.category_id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">添加子项</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onPreview?.(point)} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyCode} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                复制编码
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(point)}
                className="text-destructive cursor-pointer focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除知识点
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {point.children!.map((child, index) => (
            <KnowledgeTreeItem
              key={child.id}
              point={child}
              level={level + 1}
              courses={courses}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onPreview={onPreview}
              isLast={index === point.children!.length - 1}
              searchTerm={searchTerm}
              isExpanded={isExpanded}
              viewMode={viewMode}
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

export default function KnowledgePointManager() {
  const { setToolbarContent } = useToolbar();
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<KnowledgePoint[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [frequencyFilter, setFrequencyFilter] = useState<Frequency | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // View controls
  const [viewMode, setViewMode] = useState<"tree" | "compact">("tree");
  const [allExpanded, setAllExpanded] = useState<boolean | undefined>(undefined);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCategorySidebar, setShowCategorySidebar] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<KnowledgePoint | null>(null);
  const [parentPointId, setParentPointId] = useState<number | undefined>(undefined);
  const [defaultCategoryId, setDefaultCategoryId] = useState<number | undefined>(undefined);

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [previewPoint, setPreviewPoint] = useState<KnowledgePoint | null>(null);

  // Quick jump dialog
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    highFrequency: 0,
    mediumFrequency: 0,
    lowFrequency: 0,
  });

  // Category stats for sidebar
  const [categoryStats, setCategoryStats] = useState<Record<number, number>>({});

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl/Cmd + N to create new
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !dialogOpen && !quickJumpOpen) {
        e.preventDefault();
        handleAdd();
      }
      // Ctrl/Cmd + G to quick jump
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !dialogOpen) {
        e.preventDefault();
        setQuickJumpOpen(true);
      }
      // Escape to clear search or close dialogs
      if (e.key === 'Escape') {
        if (quickJumpOpen) {
          setQuickJumpOpen(false);
        } else if (searchTerm) {
          setSearchTerm("");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogOpen, searchTerm, quickJumpOpen]);

  // 扁平化分类
  const flattenCategories = useCallback((
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
  }, []);

  const flatCategories = useMemo(() => flattenCategories(categories), [categories, flattenCategories]);

  // 扁平化知识点
  const flattenPoints = useCallback((pts: KnowledgePoint[]): KnowledgePoint[] => {
    const result: KnowledgePoint[] = [];
    for (const pt of pts) {
      result.push(pt);
      if (pt.children) {
        result.push(...flattenPoints(pt.children));
      }
    }
    return result;
  }, []);

  // 加载数据
  const fetchData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
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
      const flat = flattenPoints(allPoints);
      setStats({
        total: flat.length,
        highFrequency: flat.filter(p => p.frequency === "high").length,
        mediumFrequency: flat.filter(p => p.frequency === "medium").length,
        lowFrequency: flat.filter(p => p.frequency === "low").length,
      });

      // 计算分类统计
      const catStats: Record<number, number> = {};
      flat.forEach(p => {
        if (p.category_id) {
          catStats[p.category_id] = (catStats[p.category_id] || 0) + 1;
        }
      });
      setCategoryStats(catStats);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [categoryFilter, frequencyFilter, flattenPoints]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Register toolbar content
  useLayoutEffect(() => {
    setToolbarContent(
      <>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="搜索知识点..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-48 pl-8 pr-3 text-sm bg-muted/40 border-transparent focus:border-border focus:bg-background transition-colors"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" onClick={() => setQuickJumpOpen(true)} className="h-8 w-8 p-0">
                <Target className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">快速跳转</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button size="sm" variant="ghost" onClick={() => fetchData(true)} disabled={isRefreshing} className="h-8 w-8 p-0">
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
        <Button size="sm" onClick={() => handleAdd()}
          className="h-8 px-3 text-xs bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-sm">
          <Plus className="mr-1 h-3.5 w-3.5" />
          新建
        </Button>
      </>
    );
    return () => setToolbarContent(null);
  }, [setToolbarContent, searchTerm, isRefreshing]);

  // 过滤知识点
  const filteredPoints = useMemo(() => {
    const filterFn = (pts: KnowledgePoint[]): KnowledgePoint[] => {
      if (!searchTerm) return pts;
      
      const term = searchTerm.toLowerCase();
      return pts.reduce((acc: KnowledgePoint[], pt) => {
        const matches = pt.name.toLowerCase().includes(term) || 
                       pt.code.toLowerCase().includes(term) ||
                       (pt.description && pt.description.toLowerCase().includes(term));
        
        if (pt.children && pt.children.length > 0) {
          const filteredChildren = filterFn(pt.children);
          if (filteredChildren.length > 0) {
            acc.push({ ...pt, children: filteredChildren });
            return acc;
          }
        }
        
        if (matches) {
          acc.push(pt);
        }
        return acc;
      }, []);
    };
    
    return filterFn([...points]);
  }, [points, searchTerm]);

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

  const handlePreview = (point: KnowledgePoint) => {
    setPreviewPoint(point);
    setDetailSheetOpen(true);
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

  const hasActiveFilters = categoryFilter !== "all" || frequencyFilter !== "all" || searchTerm;

  // Handle stats card click to filter
  const handleStatsFilter = (filter: Frequency | "all") => {
    if (filter === frequencyFilter) {
      setFrequencyFilter("all");
    } else {
      setFrequencyFilter(filter);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mini Stats Bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 border-b border-border/30 bg-muted/20">
        {[
          { label: "全部", value: stats.total, filter: "all" as const, active: frequencyFilter === "all" },
          { label: "高频", value: stats.highFrequency, filter: "high" as Frequency, active: frequencyFilter === "high", icon: Zap },
          { label: "中频", value: stats.mediumFrequency, filter: "medium" as Frequency, active: frequencyFilter === "medium", icon: Target },
          { label: "低频", value: stats.lowFrequency, filter: "low" as Frequency, active: frequencyFilter === "low", icon: Lightbulb },
        ].map((item) => (
          <button
            key={item.filter}
            onClick={() => handleStatsFilter(item.filter)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              item.active 
                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {item.icon && <item.icon className="h-3 w-3" />}
            <span>{item.label}</span>
            <span className={`ml-0.5 ${item.active ? "" : "text-muted-foreground/60"}`}>{item.value}</span>
          </button>
        ))}
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex gap-3 p-4 overflow-hidden">
        {/* 分类侧边栏 */}
        {showCategorySidebar && (
          <Card className="w-56 flex-shrink-0 hidden lg:flex flex-col shadow-sm border-border/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
              <div className="flex items-center gap-1.5">
                <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">分类导航</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCategorySidebar(false)}>
                <PanelRightClose className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-2">
              <CategorySidebar
                categories={categories}
                selectedCategory={categoryFilter}
                onSelectCategory={setCategoryFilter}
                stats={{ total: stats.total, byCategory: categoryStats }}
              />
            </ScrollArea>
          </Card>
        )}

        {/* 知识点列表 */}
        <Card className="flex-1 flex flex-col shadow-sm border-border/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">知识点列表</span>
              {categoryFilter && (
                <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
                  {categories.find(c => c.id.toString() === categoryFilter)?.name || "筛选中"}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Toggle sidebar button */}
              {!showCategorySidebar && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCategorySidebar(true)}>
                        <PanelRightOpen className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">显示分类导航</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* View mode toggle */}
              <div className="flex items-center rounded border bg-muted/40 p-0.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setViewMode("tree")}
                        className={`p-1 rounded transition-all ${viewMode === "tree" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">树形视图</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setViewMode("compact")}
                        className={`p-1 rounded transition-all ${viewMode === "compact" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        <LayoutList className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">紧凑视图</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Expand/Collapse all */}
              <div className="flex items-center rounded border bg-muted/40 p-0.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setAllExpanded(true)}
                        className={`p-1 rounded transition-all ${allExpanded === true ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        <ChevronsUpDown className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">展开全部</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setAllExpanded(false)}
                        className={`p-1 rounded transition-all ${allExpanded === false ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        <ChevronsDownUp className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">收起全部</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setCategoryFilter("all"); setFrequencyFilter("all"); }}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <X className="mr-1 h-3 w-3" />清除
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-3">
            <Select value={categoryFilter === "all" ? "all" : categoryFilter.toString()} onValueChange={(v) => setCategoryFilter(v === "all" ? "all" : Number(v))}>
              <SelectTrigger className="w-[160px] h-8 text-xs mb-3">
                <FolderTree className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {flatCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{"　".repeat(cat.level)}{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter breadcrumb */}
            {hasActiveFilters && (
              <FilterBreadcrumb
                categoryFilter={categoryFilter}
                frequencyFilter={frequencyFilter}
                searchTerm={searchTerm}
                categories={flatCategories}
                onClearCategory={() => setCategoryFilter("all")}
                onClearFrequency={() => setFrequencyFilter("all")}
                onClearSearch={() => setSearchTerm("")}
                onClearAll={() => { setSearchTerm(""); setCategoryFilter("all"); setFrequencyFilter("all"); }}
              />
            )}

            {loading ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse" style={{ marginLeft: `${(i % 3) * 16}px` }}>
                    <Skeleton className="h-7 w-7 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <div className="flex gap-1.5"><Skeleton className="h-4 w-14 rounded-full" /><Skeleton className="h-4 w-16 rounded-full" /></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPoints.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onClearFilters={() => { setSearchTerm(""); setCategoryFilter("all"); setFrequencyFilter("all"); }} onCreateFirst={() => handleAdd()} />
            ) : (
              <ScrollArea className="h-[calc(100vh-22rem)]">
                <div className={viewMode === "compact" ? "space-y-0.5" : "space-y-1.5 pr-3"}>
                {filteredPoints.map((point, index) => (
                  <KnowledgeTreeItem
                    key={point.id}
                    point={point}
                    level={0}
                    courses={courses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddChild={handleAdd}
                    onPreview={handlePreview}
                    isLast={index === filteredPoints.length - 1}
                    searchTerm={searchTerm}
                    isExpanded={allExpanded}
                    viewMode={viewMode}
                  />
                ))}
              </div>
              
              {/* 底部统计 */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Brain className="h-3 w-3" />
                    共 {flattenPoints(filteredPoints).length} 个知识点
                    {hasActiveFilters && <span className="ml-1">(筛选)</span>}
                  </span>
                </div>
              </div>
            </ScrollArea>
          )}
          </div>
        </Card>
      </div>

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

      {/* 知识点详情侧边栏 */}
      <KnowledgeDetailSheet
        point={previewPoint}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        courses={courses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 快速跳转对话框 */}
      <QuickJumpDialog
        open={quickJumpOpen}
        onOpenChange={setQuickJumpOpen}
        points={points}
        onSelect={handlePreview}
      />
    </div>
  );
}
