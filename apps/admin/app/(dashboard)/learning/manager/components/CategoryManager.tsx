"use client";

import { useState, useEffect, useCallback, useMemo, useLayoutEffect } from "react";
import { useToolbar } from "./ToolbarContext";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  RefreshCw,
  Power,
  PowerOff,
  Loader2,
  LayoutGrid,
  FolderOpen,
  Folder,
  BarChart3,
  FileText,
  Mic,
  BookOpen,
  Sparkles,
  TrendingUp,
  Hash,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Copy,
  ClipboardCopy,
  GripVertical,
  ArrowUpDown,
  Check,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Settings2,
  Info,
  AlertCircle,
  LayoutList,
  LayoutDashboard,
  Clock,
  CheckCheck,
  PanelRightClose,
  PanelRight,
  CopyPlus,
  Download,
  CheckSquare2,
  SquareDashed,
  Video,
  Headphones,
  X,
  Save,
  Star,
  ImagePlus,
  Play,
  Archive,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
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
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from "@what-cse/ui";
import {
  courseApi,
  CourseCategory,
  Course,
  CourseChapter,
  CourseStatus,
  ContentType,
  Difficulty,
  Subject,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateCourseRequest,
  CreateChapterRequest,
  UpdateChapterRequest,
  getSubjectName,
  getStatusLabel,
  getContentTypeLabel,
  getDifficultyLabel,
} from "@/services/course-api";
import { RichTextEditor } from "@/components/RichTextEditor";
import { generatorApi } from "@/services/generator-api";
import { toast } from "sonner";

// Utility: Highlight search terms in text
function HighlightText({ text, searchQuery }: { text: string; searchQuery: string }) {
  if (!searchQuery.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// Utility: Export data as JSON file
function exportToJson(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Subject color themes - each subject has a unique identity
const subjectThemes: Record<Subject, {
  icon: LucideIcon;
  gradient: string;
  bgLight: string;
  bgDark: string;
  text: string;
  border: string;
  ring: string;
}> = {
  xingce: {
    icon: BarChart3,
    gradient: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    ring: "ring-blue-500/20",
  },
  shenlun: {
    icon: FileText,
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    ring: "ring-emerald-500/20",
  },
  mianshi: {
    icon: Mic,
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/30",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800",
    ring: "ring-violet-500/20",
  },
  gongji: {
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    ring: "ring-amber-500/20",
  },
};

const SubjectIcon = ({ subject, className }: { subject: Subject; className?: string }) => {
  const Icon = subjectThemes[subject].icon;
  return <Icon className={className} />;
};

// ============================================
// Category Form Dialog
// ============================================

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CourseCategory | null;
  parentId?: number | null;
  parentName?: string;
  defaultSubject?: Subject;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void;
}

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  parentId,
  parentName,
  defaultSubject,
  onSubmit,
}: CategoryFormDialogProps) {
  const isEdit = !!category;

  const [formData, setFormData] = useState<CreateCategoryRequest>({
    parent_id: undefined,
    code: "",
    name: "",
    description: "",
    icon: "",
    color: "",
    subject: "xingce",
    exam_type: "national",
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (open) {
      if (category) {
        setFormData({
          parent_id: category.parent_id,
          code: category.code,
          name: category.name,
          description: category.description || "",
          icon: category.icon || "",
          color: category.color || "",
          subject: category.subject,
          exam_type: category.exam_type || "national",
          sort_order: category.sort_order,
          is_active: category.is_active,
        });
      } else {
        setFormData({
          parent_id: parentId || undefined,
          code: "",
          name: "",
          description: "",
          icon: "",
          color: "",
          subject: defaultSubject || "xingce",
          exam_type: "national",
          sort_order: 0,
          is_active: true,
        });
      }
    }
  }, [open, category, parentId, defaultSubject]);

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast.error("请填写分类编码和名称");
      return;
    }
    onSubmit(formData);
  };

  const theme = subjectThemes[formData.subject];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className={`relative px-6 pt-6 pb-4 bg-gradient-to-r ${theme.gradient} bg-opacity-10`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-10`} />
          <DialogHeader className="relative">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm`}>
                <SubjectIcon subject={formData.subject} className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">{isEdit ? "编辑分类" : "新建分类"}</DialogTitle>
                <DialogDescription className="mt-0.5">
                  {isEdit
                    ? "修改课程分类信息"
                    : parentName
                    ? `在「${parentName}」下创建子分类`
                    : "创建新的课程分类"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-amber-500" />
              基本信息
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">分类编码 <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="如: xc_yy"
                  disabled={isEdit}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">分类名称 <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如: 言语理解"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Classification Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-amber-500" />
              分类属性
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">所属科目</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(v) => setFormData({ ...formData, subject: v as Subject })}
                  disabled={isEdit && !!category?.parent_id}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["xingce", "shenlun", "mianshi", "gongji"] as Subject[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        <span className="flex items-center gap-2">
                          <SubjectIcon subject={s} className={`h-3.5 w-3.5 ${subjectThemes[s].text}`} />
                          {getSubjectName(s)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">考试类型</Label>
                <Select
                  value={formData.exam_type}
                  onValueChange={(v) => setFormData({ ...formData, exam_type: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">国考</SelectItem>
                    <SelectItem value="provincial">省考</SelectItem>
                    <SelectItem value="institution">事业单位</SelectItem>
                    <SelectItem value="all">通用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-amber-500" />
              其他设置
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">图标</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="emoji 或图标名"
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">排序权重</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="分类描述（可选）..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${theme.bgLight} ${theme.bgDark} border ${theme.border}`}>
              <div className="flex items-center gap-2">
                <Power className={`h-4 w-4 ${formData.is_active ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                <div>
                  <Label className="text-sm font-medium">启用状态</Label>
                  <p className="text-xs text-muted-foreground">启用后将在前端显示</p>
                </div>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9">
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            className={`h-9 bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
          >
            {isEdit ? "保存更改" : "创建分类"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Column Item Component
// ============================================

interface ColumnItemProps {
  name: string;
  subtitle?: string;
  count?: number;
  isActive?: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  onQuickEdit?: () => void;
  onQuickDelete?: () => void;
  onToggleActive?: () => void;
  onCopyCode?: () => void;
  colorTheme?: typeof subjectThemes[Subject];
  showQuickActions?: boolean;
  enableContextMenu?: boolean;
  searchQuery?: string; // For highlighting search matches
}

function ColumnItem({
  name,
  subtitle,
  count,
  isActive = true,
  isSelected,
  hasChildren,
  onClick,
  onDoubleClick,
  onQuickEdit,
  onQuickDelete,
  onToggleActive,
  onCopyCode,
  colorTheme,
  showQuickActions = false,
  enableContextMenu = false,
  searchQuery = "",
}: ColumnItemProps) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  
  const itemContent = (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`
        group relative flex items-center gap-1.5 px-2 py-1.5 cursor-pointer 
        transition-all duration-150 ease-out rounded mx-0.5 my-px
        ${isSelected 
          ? colorTheme 
            ? `bg-gradient-to-r ${colorTheme.gradient} text-white shadow-sm` 
            : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
          : "hover:bg-muted/60"
        }
        ${!isActive ? "opacity-50" : ""}
      `}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate leading-tight">
          <HighlightText text={name} searchQuery={searchQuery} />
        </div>
        {subtitle && (
          <div className={`text-[10px] truncate transition-colors leading-tight ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
            <HighlightText text={subtitle} searchQuery={searchQuery} />
          </div>
        )}
      </div>

      {/* Quick Actions - show on hover */}
      {showQuickActions && !isSelected && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-px bg-background/95 backdrop-blur-sm rounded shadow-sm border px-0.5 py-0.5 animate-in fade-in-0 zoom-in-95 duration-150">
          {onQuickEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickEdit(); }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="编辑"
            >
              <Edit className="h-2.5 w-2.5" />
            </button>
          )}
          {onQuickDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickDelete(); }}
              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-muted-foreground hover:text-red-600 transition-colors"
              title="删除"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      )}

      {/* Count badge - more compact */}
      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] px-1 py-px rounded font-medium transition-all flex-shrink-0 ${
            isSelected 
              ? "bg-white/20 text-white" 
              : "bg-muted/60 text-muted-foreground"
          } ${showQuickActions && !isSelected ? 'group-hover:opacity-0' : ''}`}
        >
          {count}
        </span>
      )}

      {/* Inactive indicator - simplified */}
      {!isActive && (
        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isSelected ? "bg-white/50" : "bg-orange-400"}`} />
      )}

      {/* Arrow for items with children */}
      {hasChildren && (
        <ChevronRight 
          className={`h-3 w-3 flex-shrink-0 transition-all duration-200 ${
            isSelected 
              ? "text-white/60" 
              : "text-muted-foreground/50 group-hover:text-muted-foreground"
          }`} 
        />
      )}
    </div>
  );

  // Wrap with context menu if enabled (only opens on right-click)
  if (enableContextMenu) {
    return (
      <div 
        className="relative"
        onContextMenu={(e) => { 
          e.preventDefault(); 
          setContextMenuOpen(true);
        }}
      >
        {itemContent}
        <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
          <DropdownMenuTrigger className="sr-only" />
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            操作
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {onQuickEdit && (
            <DropdownMenuItem onClick={onQuickEdit} className="text-sm">
              <Edit className="h-3.5 w-3.5 mr-2" />
              编辑
              <span className="ml-auto text-xs text-muted-foreground">双击</span>
            </DropdownMenuItem>
          )}
          {onCopyCode && subtitle && (
            <DropdownMenuItem onClick={onCopyCode} className="text-sm">
              <Copy className="h-3.5 w-3.5 mr-2" />
              复制编码
            </DropdownMenuItem>
          )}
          {onToggleActive && (
            <DropdownMenuItem onClick={onToggleActive} className="text-sm">
              {isActive ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-2" />
                  禁用
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-2" />
                  启用
                </>
              )}
            </DropdownMenuItem>
          )}
          {onQuickDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onQuickDelete} className="text-sm text-red-600 focus:text-red-600">
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                删除
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return itemContent;
}

// ============================================
// Column Component
// ============================================

type StatusFilter = "all" | "active" | "inactive";
type SortOrder = "default" | "name-asc" | "name-desc" | "count-asc" | "count-desc";

interface ColumnProps {
  title: string;
  items: Array<{
    id: string | number;
    name: string;
    subtitle?: string;
    count?: number;
    isActive?: boolean;
    hasChildren: boolean;
    data?: any;
    colorTheme?: typeof subjectThemes[Subject];
  }>;
  selectedId: string | number | null;
  onSelect: (id: string | number, data?: any) => void;
  onDoubleClick?: (id: string | number, data?: any) => void;
  onQuickEdit?: (id: string | number, data?: any) => void;
  onQuickDelete?: (id: string | number, data?: any) => void;
  onToggleActive?: (id: string | number, data?: any) => void;
  onCopyCode?: (id: string | number, data?: any) => void;
  onAdd?: () => void;
  loading?: boolean;
  emptyText?: string;
  searchable?: boolean;
  showQuickActions?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  enableContextMenu?: boolean;
  wide?: boolean; // 是否使用更宽的列宽
}

function Column({
  title,
  items,
  selectedId,
  onSelect,
  onDoubleClick,
  onQuickEdit,
  onQuickDelete,
  onToggleActive,
  onCopyCode,
  onAdd,
  loading,
  emptyText = "暂无数据",
  searchable = false,
  showQuickActions = false,
  filterable = false,
  sortable = false,
  enableContextMenu = false,
  wide = false,
}: ColumnProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");

  // Filter and sort items
  let processedItems = items;

  // Apply status filter
  if (statusFilter !== "all") {
    processedItems = processedItems.filter(item => 
      statusFilter === "active" ? item.isActive !== false : item.isActive === false
    );
  }

  // Apply search filter
  if (searchQuery.trim()) {
    processedItems = processedItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply sorting
  if (sortOrder !== "default") {
    processedItems = [...processedItems].sort((a, b) => {
      switch (sortOrder) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "count-asc":
          return (a.count || 0) - (b.count || 0);
        case "count-desc":
          return (b.count || 0) - (a.count || 0);
        default:
          return 0;
      }
    });
  }

  const activeCount = items.filter(i => i.isActive !== false).length;
  const inactiveCount = items.filter(i => i.isActive === false).length;
  const hasFilters = statusFilter !== "all" || sortOrder !== "default";

  // 根据 wide 属性决定列宽
  const widthClass = wide 
    ? "min-w-[260px] w-[260px] md:min-w-[300px] md:w-[300px] lg:min-w-[340px] lg:w-[340px]"
    : "min-w-[180px] w-[180px] md:min-w-[200px] md:w-[200px] lg:min-w-[220px] lg:w-[220px]";

  return (
    <div className={`flex flex-col h-full ${widthClass} flex-shrink-0 border-r border-border/40 bg-background/95`}>
      {/* Column Header - 更紧凑 */}
      <div className="flex items-center justify-between px-2.5 py-2 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-semibold text-foreground/70 tracking-wide truncate">
            {title}
          </span>
          {hasFilters && (
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {(filterable || sortable) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 transition-colors ${hasFilters ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'hover:bg-muted/80'}`}
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {filterable && (
                  <>
                    <DropdownMenuLabel className="text-[11px] py-1">状态</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem 
                      checked={statusFilter === "all"}
                      onCheckedChange={() => setStatusFilter("all")}
                      className="text-xs py-1"
                    >
                      全部 ({items.length})
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={statusFilter === "active"}
                      onCheckedChange={() => setStatusFilter("active")}
                      className="text-xs py-1"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      已启用 ({activeCount})
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={statusFilter === "inactive"}
                      onCheckedChange={() => setStatusFilter("inactive")}
                      className="text-xs py-1"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mr-1.5" />
                      已禁用 ({inactiveCount})
                    </DropdownMenuCheckboxItem>
                  </>
                )}
                {filterable && sortable && <DropdownMenuSeparator />}
                {sortable && (
                  <>
                    <DropdownMenuLabel className="text-[11px] py-1">排序</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem 
                      checked={sortOrder === "default"}
                      onCheckedChange={() => setSortOrder("default")}
                      className="text-xs py-1"
                    >
                      默认
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={sortOrder === "name-asc"}
                      onCheckedChange={() => setSortOrder("name-asc")}
                      className="text-xs py-1"
                    >
                      名称 A→Z
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={sortOrder === "name-desc"}
                      onCheckedChange={() => setSortOrder("name-desc")}
                      className="text-xs py-1"
                    >
                      名称 Z→A
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={sortOrder === "count-desc"}
                      onCheckedChange={() => setSortOrder("count-desc")}
                      className="text-xs py-1"
                    >
                      数量↓
                    </DropdownMenuCheckboxItem>
                  </>
                )}
                {hasFilters && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => { setStatusFilter("all"); setSortOrder("default"); }}
                      className="text-xs py-1 text-blue-600"
                    >
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      重置
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {searchable && (
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-5 w-5 transition-colors ${isSearching ? 'bg-muted text-foreground' : 'hover:bg-muted/80'}`}
              onClick={() => {
                setIsSearching(!isSearching);
                if (isSearching) setSearchQuery("");
              }}
              title="搜索"
            >
              <Search className="h-3 w-3" />
            </Button>
          )}
          {onAdd && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 hover:bg-amber-500/10 hover:text-amber-600 transition-colors" 
              onClick={onAdd} 
              title="新建"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Input - 更紧凑 */}
      {searchable && isSearching && (
        <div className="px-1.5 py-1.5 border-b border-border/40 bg-muted/10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/60" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索..."
              className="h-7 pl-7 pr-6 text-xs bg-background border-border/50 focus-visible:ring-1"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-xs">×</span>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-[10px] text-muted-foreground mt-1 px-0.5">
              {processedItems.length} 项
            </p>
          )}
        </div>
      )}

      {/* Column Content */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-1 space-y-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="flex flex-col gap-1 px-2 py-1.5 mx-0.5 rounded bg-muted/30"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="h-3 w-3/4 rounded bg-muted/60 animate-pulse" />
                <div className="h-2 w-1/2 rounded bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        ) : processedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-3 text-muted-foreground">
            <div className="h-10 w-10 rounded-lg bg-muted/40 flex items-center justify-center mb-2">
              {searchQuery || hasFilters ? <Filter className="h-4 w-4 opacity-40" /> : <Folder className="h-4 w-4 opacity-40" />}
            </div>
            <span className="text-[11px] text-center">
              {searchQuery ? `未找到` : hasFilters ? "无匹配项" : emptyText}
            </span>
            {hasFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 h-6 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => { setStatusFilter("all"); setSortOrder("default"); setSearchQuery(""); }}
              >
                重置
              </Button>
            )}
            {!searchQuery && !hasFilters && onAdd && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 h-6 text-[11px] text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={onAdd}
              >
                <Plus className="h-3 w-3 mr-0.5" />
                添加
              </Button>
            )}
          </div>
        ) : (
          <div className="p-0.5">
            {processedItems.map((item) => (
              <div key={item.id}>
                <ColumnItem
                  name={item.name}
                  subtitle={item.subtitle}
                  count={item.count}
                  isActive={item.isActive}
                  isSelected={selectedId === item.id}
                  hasChildren={item.hasChildren}
                  onClick={() => onSelect(item.id, item.data)}
                  onDoubleClick={() => onDoubleClick?.(item.id, item.data)}
                  onQuickEdit={onQuickEdit ? () => onQuickEdit(item.id, item.data) : undefined}
                  onQuickDelete={onQuickDelete ? () => onQuickDelete(item.id, item.data) : undefined}
                  onToggleActive={onToggleActive ? () => onToggleActive(item.id, item.data) : undefined}
                  onCopyCode={onCopyCode ? () => onCopyCode(item.id, item.data) : undefined}
                  colorTheme={item.colorTheme}
                  showQuickActions={showQuickActions}
                  enableContextMenu={enableContextMenu}
                  searchQuery={searchQuery}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Column Footer - 更紧凑 */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 border-t border-border/40 bg-muted/15 text-[10px] text-muted-foreground">
        <span className="font-medium tabular-nums">{processedItems.length}</span>
        {(searchQuery || hasFilters) && <span className="text-muted-foreground/50">/{items.length}</span>}
        <span className="text-muted-foreground/50">项</span>
        {hasFilters && (
          <button
            onClick={() => { setStatusFilter("all"); setSortOrder("default"); }}
            className="ml-auto text-blue-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Detail Panel Component - 分类详情
// ============================================

interface DetailPanelProps {
  category: CourseCategory | null;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onAddChild: () => void;
  onDuplicate: () => void;
  onRefresh: () => void;
}

function DetailPanel({ category, onEdit, onDelete, onToggleActive, onAddChild, onDuplicate, onRefresh }: DetailPanelProps) {
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const handleGenerateDescription = async () => {
    if (!category) return;
    setGeneratingDescription(true);
    try {
      const result = await generatorApi.generateCategoryDescription(category.id, { force: true });
      toast.success("描述生成成功");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "生成失败");
    } finally {
      setGeneratingDescription(false);
    }
  };

  // 空状态
  if (!category) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-4">
          <FolderOpen className="h-7 w-7 text-amber-500/60" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">选择分类查看详情</p>
        <p className="text-xs text-muted-foreground/60 mt-1">双击可快速编辑</p>
      </div>
    );
  }

  const theme = subjectThemes[category.subject];

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-200">
      {/* 头部 */}
      <div className={`px-4 py-4 border-b bg-gradient-to-r ${theme.bgLight} ${theme.bgDark}`}>
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
            <SubjectIcon subject={category.subject} className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold truncate">{category.name}</h2>
              {category.is_active ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-orange-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{category.code}</p>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <p className="text-lg font-bold text-foreground">{category.course_count}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">课程</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <p className="text-lg font-bold text-foreground">{category.children?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">子分类</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <p className="text-lg font-bold text-foreground">#{category.sort_order}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">排序</p>
            </div>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">描述</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleGenerateDescription}
                disabled={generatingDescription}
                className="h-6 px-2 text-[10px] text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              >
                {generatingDescription ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI生成
                  </>
                )}
              </Button>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 min-h-[60px]">
              <p className="text-xs leading-relaxed text-foreground/80">
                {category.description || <span className="text-muted-foreground italic">暂无描述，点击"AI生成"自动生成</span>}
              </p>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">基本信息</h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">科目</span>
                <span className={`text-xs font-medium flex items-center gap-1 ${theme.text}`}>
                  <SubjectIcon subject={category.subject} className="h-3 w-3" />
                  {getSubjectName(category.subject)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">考试类型</span>
                <span className="text-xs font-medium">
                  {category.exam_type === "national" ? "国考" : category.exam_type === "provincial" ? "省考" : category.exam_type === "institution" ? "事业单位" : "通用"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">状态</span>
                <span className={`text-xs font-medium ${category.is_active ? "text-emerald-600" : "text-orange-600"}`}>
                  {category.is_active ? "已启用" : "已禁用"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">ID</span>
                <span className="text-xs font-mono text-muted-foreground">{category.id}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* 底部操作栏 */}
      <div className="p-3 border-t bg-muted/20">
        <div className="grid grid-cols-4 gap-1.5">
          <Button size="sm" variant="ghost" onClick={onEdit} className="h-8 flex-col gap-0.5 text-muted-foreground hover:text-foreground">
            <Edit className="h-4 w-4" />
            <span className="text-[10px]">编辑</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={onAddChild} className="h-8 flex-col gap-0.5 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" />
            <span className="text-[10px]">子分类</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onToggleActive} 
            className={`h-8 flex-col gap-0.5 ${category.is_active ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"}`}
          >
            {category.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            <span className="text-[10px]">{category.is_active ? "禁用" : "启用"}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="h-8 flex-col gap-0.5 text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px]">删除</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Course Detail Panel Component - 课程详情
// ============================================

interface CourseDetailPanelProps {
  course: Course | null;
  onEdit: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onManageChapters: () => void;
}

function CourseDetailPanel({ course, onEdit, onPublish, onArchive, onDelete, onManageChapters }: CourseDetailPanelProps) {
  // 空状态
  if (!course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mb-4">
          <BookOpen className="h-7 w-7 text-blue-500/60" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">选择课程查看详情</p>
        <p className="text-xs text-muted-foreground/60 mt-1">双击可快速编辑</p>
      </div>
    );
  }

  const categorySubject = course.category?.subject as Subject | undefined;
  const theme = categorySubject ? subjectThemes[categorySubject] : subjectThemes.xingce;

  // 状态配置
  const statusConfig = {
    published: { label: "已发布", color: "text-emerald-600", bg: "bg-emerald-500", dot: true },
    draft: { label: "草稿", color: "text-gray-500", bg: "bg-gray-400", dot: false },
    archived: { label: "已下架", color: "text-orange-500", bg: "bg-orange-400", dot: false },
  };
  const status = statusConfig[course.status] || statusConfig.draft;

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-200">
      {/* 头部 - 封面区域 */}
      <div className="relative h-28 overflow-hidden">
        {course.cover_image ? (
          <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} opacity-30`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* 状态标签 */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color} bg-background/90 backdrop-blur-sm`}>
            {status.dot && <span className={`h-1.5 w-1.5 rounded-full ${status.bg} animate-pulse`} />}
            {status.label}
          </span>
        </div>
      </div>

      {/* 标题区域 */}
      <div className="px-4 -mt-6 relative z-10">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg mb-2`}>
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-base font-semibold leading-tight">{course.title}</h2>
        {course.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{course.subtitle}</p>}
      </div>

      {/* 内容 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 统计数据 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-base font-bold text-foreground">{course.chapter_count || 0}</p>
              <p className="text-[10px] text-muted-foreground">章节</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-base font-bold text-foreground">{course.study_count || 0}</p>
              <p className="text-[10px] text-muted-foreground">学习</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-base font-bold text-foreground">{course.rating?.toFixed(1) || "-"}</p>
              <p className="text-[10px] text-muted-foreground">评分</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/40">
              <p className="text-base font-bold text-foreground">{course.duration ? Math.floor(course.duration / 60) : 0}</p>
              <p className="text-[10px] text-muted-foreground">分钟</p>
            </div>
          </div>

          {/* 快捷入口 */}
          <div className="flex gap-2">
            <button
              onClick={onManageChapters}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r ${theme.gradient} text-white text-xs font-medium hover:opacity-90 transition-all shadow-sm`}
            >
              <Layers className="h-3.5 w-3.5" />
              管理章节
            </button>
            {course.status === "published" && (
              <a
                href={`http://localhost:3000/learn/course/${course.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 text-xs font-medium transition-all"
              >
                <Eye className="h-3.5 w-3.5" />
                预览
              </a>
            )}
          </div>

          {/* 基本信息 */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">基本信息</h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">分类</span>
                <span className="text-xs font-medium">{course.category?.name || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">难度</span>
                <span className={`text-xs font-medium ${
                  course.difficulty === "beginner" ? "text-green-600" :
                  course.difficulty === "intermediate" ? "text-blue-600" : "text-red-600"
                }`}>
                  {getDifficultyLabel(course.difficulty)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">讲师</span>
                <span className="text-xs font-medium">{course.author_name || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">权限</span>
                <span className="text-xs font-medium">
                  {course.is_free ? "免费" : course.vip_only ? "VIP专属" : "付费"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">ID</span>
                <span className="text-xs font-mono text-muted-foreground">{course.id}</span>
              </div>
            </div>
          </div>

          {/* 描述 */}
          {course.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground">描述</h3>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs leading-relaxed text-foreground/80 line-clamp-3">{course.description}</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 底部操作栏 */}
      <div className="p-3 border-t bg-muted/20">
        <div className="grid grid-cols-4 gap-1.5">
          <Button size="sm" variant="ghost" onClick={onEdit} className="h-8 flex-col gap-0.5 text-muted-foreground hover:text-foreground">
            <Edit className="h-4 w-4" />
            <span className="text-[10px]">编辑</span>
          </Button>
          {course.status === "draft" && (
            <Button size="sm" variant="ghost" onClick={onPublish} className="h-8 flex-col gap-0.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
              <CheckCheck className="h-4 w-4" />
              <span className="text-[10px]">发布</span>
            </Button>
          )}
          {course.status === "published" && (
            <Button size="sm" variant="ghost" onClick={onArchive} className="h-8 flex-col gap-0.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50">
              <EyeOff className="h-4 w-4" />
              <span className="text-[10px]">下架</span>
            </Button>
          )}
          {course.status === "archived" && (
            <Button size="sm" variant="ghost" onClick={onPublish} className="h-8 flex-col gap-0.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
              <Eye className="h-4 w-4" />
              <span className="text-[10px]">上线</span>
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              navigator.clipboard.writeText(course.id.toString());
              toast.success("已复制课程ID");
            }} 
            className="h-8 flex-col gap-0.5 text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-4 w-4" />
            <span className="text-[10px]">复制ID</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="h-8 flex-col gap-0.5 text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px]">删除</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Chapter Manager Modal - 章节管理弹窗
// ============================================

interface ChapterManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onUpdate: () => void;
}

// 内容类型图标
function ContentTypeIcon({ type, className }: { type: ContentType; className?: string }) {
  switch (type) {
    case "video": return <Video className={className} />;
    case "audio": return <Headphones className={className} />;
    case "document": return <FileText className={className} />;
    default: return <BookOpen className={className} />;
  }
}

// 章节表单弹窗
interface ChapterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  chapter?: CourseChapter | null;
  parentId?: number;
  onSubmit: (data: CreateChapterRequest | UpdateChapterRequest, isEdit: boolean) => void;
}

function ChapterFormDialog({ open, onOpenChange, courseId, chapter, parentId, onSubmit }: ChapterFormDialogProps) {
  const [formData, setFormData] = useState<CreateChapterRequest>({
    course_id: courseId,
    parent_id: parentId,
    title: "",
    description: "",
    content_type: "video",
    content_url: "",
    content_text: "",
    duration_minutes: 0,
    is_free_preview: false,
    sort_order: 0,
  });

  useEffect(() => {
    if (chapter) {
      setFormData({
        course_id: courseId,
        parent_id: chapter.parent_id,
        title: chapter.title,
        description: chapter.description || "",
        content_type: chapter.content_type,
        content_url: chapter.content_url || "",
        content_text: chapter.content_text || "",
        duration_minutes: chapter.duration_minutes,
        is_free_preview: chapter.is_free_preview,
        sort_order: chapter.sort_order,
      });
    } else {
      setFormData({
        course_id: courseId,
        parent_id: parentId,
        title: "",
        description: "",
        content_type: "video",
        content_url: "",
        content_text: "",
        duration_minutes: 0,
        is_free_preview: false,
        sort_order: 0,
      });
    }
  }, [chapter, courseId, parentId, open]);

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error("请填写章节标题");
      return;
    }
    onSubmit(formData, !!chapter);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{chapter ? "编辑章节" : "新建章节"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs">章节标题 *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入章节标题"
              className="h-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">内容类型</Label>
              <Select
                value={formData.content_type}
                onValueChange={(v) => setFormData({ ...formData, content_type: v as ContentType })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="document">文档</SelectItem>
                  <SelectItem value="audio">音频</SelectItem>
                  <SelectItem value="mixed">综合</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">时长（分钟）</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">内容URL</Label>
            <Input
              value={formData.content_url}
              onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
              placeholder="视频/音频/文档地址"
              className="h-9"
            />
          </div>
          {(formData.content_type === "document" || formData.content_type === "mixed") && (
            <div className="space-y-2">
              <Label className="text-xs">文本内容</Label>
              <RichTextEditor
                value={formData.content_text || ""}
                onChange={(value) => setFormData({ ...formData, content_text: value })}
                placeholder="编辑文档内容..."
                minHeight="120px"
              />
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Switch
              checked={formData.is_free_preview}
              onCheckedChange={(checked) => setFormData({ ...formData, is_free_preview: checked })}
            />
            <Label className="text-xs">可免费试看</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">取消</Button>
          <Button onClick={handleSubmit} size="sm">{chapter ? "保存" : "创建"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 章节树节点
interface ChapterTreeNodeProps {
  chapter: CourseChapter;
  level: number;
  onEdit: (chapter: CourseChapter) => void;
  onDelete: (chapter: CourseChapter) => void;
  onAddChild: (parentId: number) => void;
}

function ChapterTreeNode({ chapter, level, onEdit, onDelete, onAddChild }: ChapterTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = chapter.children && chapter.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors ${level > 0 ? "ml-5" : ""}`}
      >
        <button
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={`w-5 h-5 flex items-center justify-center rounded ${hasChildren ? "hover:bg-muted" : ""}`}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <span className="w-3.5" />
          )}
        </button>
        <ContentTypeIcon type={chapter.content_type} className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{chapter.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{getContentTypeLabel(chapter.content_type)}</span>
            {chapter.duration_minutes > 0 && (
              <>
                <span>·</span>
                <span>{chapter.duration_minutes}分钟</span>
              </>
            )}
            {chapter.is_free_preview && (
              <Badge variant="secondary" className="h-4 px-1 text-[9px]">试看</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(chapter)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          {level < 2 && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddChild(chapter.id)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => onDelete(chapter)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="border-l border-border/50 ml-5">
          {chapter.children!.map((child) => (
            <ChapterTreeNode
              key={child.id}
              chapter={child}
              level={level + 1}
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

// 课程编辑器主弹窗 - 包含基本信息、章节管理、发布设置
function ChapterManagerModal({ open, onOpenChange, course, onUpdate }: ChapterManagerModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  
  // 课程表单数据
  const [formData, setFormData] = useState<UpdateCourseRequest>({});
  
  // 章节相关状态
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chapterFormOpen, setChapterFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CourseChapter | null>(null);
  const [parentChapterId, setParentChapterId] = useState<number | undefined>(undefined);
  
  // 分类数据
  const [categories, setCategories] = useState<CourseCategory[]>([]);

  // 初始化表单数据
  useEffect(() => {
    if (open && course) {
      setFormData({
        category_id: course.category_id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        cover_image: course.cover_image,
        content_type: course.content_type,
        difficulty: course.difficulty,
        author_name: course.author_name,
        author_avatar: course.author_avatar,
        author_intro: course.author_intro,
        is_free: course.is_free,
        price: course.price,
        vip_only: course.vip_only,
        sort_order: course.sort_order,
        status: course.status,
      });
      fetchChapters();
      fetchCategories();
    }
  }, [open, course]);

  // 加载分类
  const fetchCategories = async () => {
    try {
      const res = await courseApi.getCategories({});
      setCategories(res.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // 扁平化分类用于下拉选择
  const flattenCategories = (cats: CourseCategory[], level = 0): { id: number; name: string; level: number }[] => {
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

  // 加载章节
  const fetchChapters = useCallback(async () => {
    if (!course) return;
    setChaptersLoading(true);
    try {
      const res = await courseApi.getChapters(course.id);
      setChapters(res.chapters || []);
    } catch (error) {
      toast.error("加载章节失败");
    } finally {
      setChaptersLoading(false);
    }
  }, [course]);

  // 保存课程
  const handleSave = async () => {
    if (!course) return;
    setSaving(true);
    try {
      await courseApi.updateCourse(course.id, formData);
      toast.success("保存成功");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 发布课程
  const handlePublish = async () => {
    if (!course) return;
    try {
      await courseApi.publishCourse(course.id);
      toast.success("课程已发布");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "发布失败");
    }
  };

  // 下架课程
  const handleArchive = async () => {
    if (!course || !confirm("确定要下架该课程吗？")) return;
    try {
      await courseApi.archiveCourse(course.id);
      toast.success("课程已下架");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "下架失败");
    }
  };

  // 删除课程
  const handleDelete = async () => {
    if (!course || !confirm("确定要删除该课程吗？删除后不可恢复。")) return;
    try {
      await courseApi.deleteCourse(course.id);
      toast.success("课程已删除");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // 章节操作
  const handleAddChapter = (parentId?: number) => {
    setEditingChapter(null);
    setParentChapterId(parentId);
    setChapterFormOpen(true);
  };

  const handleEditChapter = (chapter: CourseChapter) => {
    setEditingChapter(chapter);
    setParentChapterId(chapter.parent_id);
    setChapterFormOpen(true);
  };

  const handleDeleteChapter = async (chapter: CourseChapter) => {
    if (!confirm(`确定删除「${chapter.title}」？`)) return;
    try {
      await courseApi.deleteChapter(chapter.id);
      toast.success("章节已删除");
      fetchChapters();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  const handleChapterSubmit = async (data: CreateChapterRequest | UpdateChapterRequest, isEdit: boolean) => {
    try {
      if (isEdit && editingChapter) {
        await courseApi.updateChapter(editingChapter.id, data as UpdateChapterRequest);
        toast.success("章节已更新");
      } else {
        await courseApi.createChapter(data as CreateChapterRequest);
        toast.success("章节已创建");
      }
      setChapterFormOpen(false);
      fetchChapters();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  // 统计
  const countChapters = (chs: CourseChapter[]): number => {
    return chs.reduce((sum, ch) => sum + 1 + (ch.children ? countChapters(ch.children) : 0), 0);
  };
  const totalDuration = (chs: CourseChapter[]): number => {
    return chs.reduce((sum, ch) => sum + ch.duration_minutes + (ch.children ? totalDuration(ch.children) : 0), 0);
  };

  if (!course) return null;

  const categorySubject = course.category?.subject as Subject | undefined;
  const theme = categorySubject ? subjectThemes[categorySubject] : subjectThemes.xingce;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0 overflow-hidden">
          {/* 头部 */}
          <div className={`px-5 py-4 border-b bg-gradient-to-r ${theme.bgLight} ${theme.bgDark}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm`}>
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">编辑课程</h2>
                  <p className="text-xs text-muted-foreground truncate max-w-[500px]">{course.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={course.status === "published" ? "default" : course.status === "archived" ? "secondary" : "outline"}>
                  {getStatusLabel(course.status)}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs 内容 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-5 pt-3 border-b bg-muted/20">
              <TabsList className="h-9 bg-transparent p-0 gap-4">
                <TabsTrigger value="basic" className="h-9 px-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm">
                  基本信息
                </TabsTrigger>
                <TabsTrigger value="chapters" className="h-9 px-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm">
                  章节管理 ({countChapters(chapters)})
                </TabsTrigger>
                <TabsTrigger value="settings" className="h-9 px-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm">
                  发布设置
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 基本信息 Tab */}
            <TabsContent value="basic" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-[480px]">
                <div className="p-5 space-y-5">
                  {/* 课程标题 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">课程标题 *</Label>
                      <Input
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="输入课程标题"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">副标题</Label>
                      <Input
                        value={formData.subtitle || ""}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="输入副标题（可选）"
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* 课程简介 */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">课程简介</Label>
                    <Textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="详细描述课程内容..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* 分类、类型、难度 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">所属分类</Label>
                      <Select
                        value={formData.category_id?.toString()}
                        onValueChange={(v) => setFormData({ ...formData, category_id: Number(v) })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {flatCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {"　".repeat(cat.level)}{cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">内容类型</Label>
                      <Select
                        value={formData.content_type}
                        onValueChange={(v) => setFormData({ ...formData, content_type: v as ContentType })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">视频</SelectItem>
                          <SelectItem value="document">文档</SelectItem>
                          <SelectItem value="audio">音频</SelectItem>
                          <SelectItem value="mixed">综合</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">难度级别</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(v) => setFormData({ ...formData, difficulty: v as Difficulty })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">入门</SelectItem>
                          <SelectItem value="intermediate">进阶</SelectItem>
                          <SelectItem value="advanced">高级</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* 封面图片 */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">封面图片</Label>
                    <div className="flex items-start gap-4">
                      <div className="w-40 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/50 flex-shrink-0">
                        {formData.cover_image ? (
                          <img src={formData.cover_image} alt="封面" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <ImagePlus className="h-6 w-6 mx-auto mb-1 opacity-40" />
                            <p className="text-[10px]">暂无封面</p>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <Input
                          value={formData.cover_image || ""}
                          onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                          placeholder="https://..."
                          className="h-9"
                        />
                        <p className="text-[10px] text-muted-foreground">推荐尺寸：16:9 比例，至少 1280x720 像素</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* 讲师信息 */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">讲师信息</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground">讲师名称</Label>
                        <Input
                          value={formData.author_name || ""}
                          onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                          placeholder="讲师名称"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground">讲师头像URL</Label>
                        <Input
                          value={formData.author_avatar || ""}
                          onChange={(e) => setFormData({ ...formData, author_avatar: e.target.value })}
                          placeholder="https://..."
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">讲师介绍</Label>
                      <Textarea
                        value={formData.author_intro || ""}
                        onChange={(e) => setFormData({ ...formData, author_intro: e.target.value })}
                        placeholder="讲师简介..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 章节管理 Tab */}
            <TabsContent value="chapters" className="flex-1 m-0 overflow-hidden flex flex-col">
              {/* 统计栏 */}
              <div className="flex items-center gap-4 px-5 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{countChapters(chapters)}</span>
                  <span className="text-xs text-muted-foreground">章节</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{totalDuration(chapters)}</span>
                  <span className="text-xs text-muted-foreground">分钟</span>
                </div>
                <div className="flex-1" />
                <Button size="sm" onClick={() => handleAddChapter()} className={`h-8 bg-gradient-to-r ${theme.gradient} hover:opacity-90`}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  添加章节
                </Button>
              </div>
              
              {/* 章节列表 */}
              <ScrollArea className="flex-1 h-[400px]">
                {chaptersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : chapters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <FileText className="h-7 w-7 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">暂无章节</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">点击上方按钮添加第一个章节</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-0.5">
                    {chapters.map((chapter) => (
                      <ChapterTreeNode
                        key={chapter.id}
                        chapter={chapter}
                        level={0}
                        onEdit={handleEditChapter}
                        onDelete={handleDeleteChapter}
                        onAddChild={handleAddChapter}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* 发布设置 Tab */}
            <TabsContent value="settings" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-[480px]">
                <div className="p-5 space-y-5">
                  {/* 定价设置 */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">定价设置</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                        <div>
                          <p className="text-sm font-medium">免费课程</p>
                          <p className="text-xs text-muted-foreground">所有用户都可以免费学习</p>
                        </div>
                        <Switch
                          checked={formData.is_free}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            is_free: checked,
                            vip_only: checked ? false : formData.vip_only,
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                        <div>
                          <p className="text-sm font-medium">VIP专属</p>
                          <p className="text-xs text-muted-foreground">仅VIP会员可以学习</p>
                        </div>
                        <Switch
                          checked={formData.vip_only}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            vip_only: checked,
                            is_free: checked ? false : formData.is_free,
                          })}
                        />
                      </div>
                      {!formData.is_free && !formData.vip_only && (
                        <div className="p-3 border rounded-lg bg-muted/20">
                          <Label className="text-xs">单独购买价格（元）</Label>
                          <Input
                            type="number"
                            value={formData.price || ""}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                            placeholder="0.00"
                            className="h-9 w-32 mt-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* 课程统计 */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">课程统计</Label>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 border rounded-lg bg-muted/20">
                        <Eye className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground" />
                        <p className="text-lg font-bold">{course.view_count || 0}</p>
                        <p className="text-[10px] text-muted-foreground">浏览量</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg bg-muted/20">
                        <BookOpen className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground" />
                        <p className="text-lg font-bold">{course.study_count || 0}</p>
                        <p className="text-[10px] text-muted-foreground">学习人次</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg bg-muted/20">
                        <Star className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground" />
                        <p className="text-lg font-bold">{course.like_count || 0}</p>
                        <p className="text-[10px] text-muted-foreground">点赞</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg bg-muted/20">
                        <FileText className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground" />
                        <p className="text-lg font-bold">{course.chapter_count || 0}</p>
                        <p className="text-[10px] text-muted-foreground">章节数</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 危险操作 */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-destructive">危险操作</Label>
                    <div className="p-3 border border-destructive/30 rounded-lg bg-destructive/5">
                      <p className="text-xs text-muted-foreground mb-3">以下操作不可撤销，请谨慎操作</p>
                      <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        删除课程
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* 底部操作栏 */}
          <div className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground">
              ID: {course.id} · 创建于 {new Date(course.created_at || "").toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              {course.status === "draft" && (
                <Button size="sm" variant="outline" onClick={handlePublish}>
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  发布
                </Button>
              )}
              {course.status === "published" && (
                <Button size="sm" variant="outline" onClick={handleArchive}>
                  <Archive className="h-3.5 w-3.5 mr-1.5" />
                  下架
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={saving} className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90`}>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 章节编辑表单 */}
      {course && (
        <ChapterFormDialog
          open={chapterFormOpen}
          onOpenChange={setChapterFormOpen}
          courseId={course.id}
          chapter={editingChapter}
          parentId={parentChapterId}
          onSubmit={handleChapterSubmit}
        />
      )}
    </>
  );
}

// ============================================
// Main Page Component
// ============================================

const subjects: Subject[] = ["xingce", "shenlun", "mianshi", "gongji"];

export default function CategoryManager() {
  const { setToolbarContent } = useToolbar();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<number | null>(null);
  const [parentNameForNew, setParentNameForNew] = useState<string>("");
  const [defaultSubjectForNew, setDefaultSubjectForNew] = useState<Subject>("xingce");

  // Selection state for columns
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLevel1, setSelectedLevel1] = useState<CourseCategory | null>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<CourseCategory | null>(null);
  const [selectedLevel3, setSelectedLevel3] = useState<CourseCategory | null>(null);

  // Course state - 新增：课程相关状态
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // UI State
  const [viewDensity, setViewDensity] = useState<"compact" | "comfortable">("comfortable");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(true);
  // 详情面板显示模式：category 或 course
  const [detailPanelMode, setDetailPanelMode] = useState<"category" | "course">("category");
  
  // Batch selection state
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 章节管理 Modal 状态
  const [chapterModalOpen, setChapterModalOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await courseApi.getCategories({});
      setCategories(result.categories || []);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("加载分类失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 新增：加载课程
  const fetchCourses = useCallback(async (categoryId: number) => {
    setCoursesLoading(true);
    try {
      const result = await courseApi.getCourses({
        category_id: categoryId,
        page_size: 100,
      });
      setCourses(result.courses || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("加载课程失败");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 当选中分类变化时，加载该分类下的课程
  useEffect(() => {
    // 获取当前选中的分类（优先级：三级 > 二级 > 一级）
    const currentCategory = selectedLevel3 || selectedLevel2 || selectedLevel1;
    if (currentCategory) {
      fetchCourses(currentCategory.id);
      setSelectedCourse(null);
      setDetailPanelMode("category");
    } else {
      setCourses([]);
      setSelectedCourse(null);
      setDetailPanelMode("category");
    }
  }, [selectedLevel1, selectedLevel2, selectedLevel3, fetchCourses]);

  // Group categories by subject
  const categoriesBySubject = categories.reduce((acc, cat) => {
    if (!acc[cat.subject]) {
      acc[cat.subject] = [];
    }
    acc[cat.subject].push(cat);
    return acc;
  }, {} as Record<string, CourseCategory[]>);

  // Get counts
  const getSubjectCount = (subject: Subject) => {
    const countAll = (cats: CourseCategory[]): number => {
      return cats.reduce((sum, cat) => {
        return sum + 1 + (cat.children ? countAll(cat.children) : 0);
      }, 0);
    };
    return countAll(categoriesBySubject[subject] || []);
  };

  // Handlers
  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedLevel1(null);
    setSelectedLevel2(null);
    setSelectedLevel3(null);
  };

  const handleSelectLevel1 = (category: CourseCategory) => {
    setSelectedLevel1(category);
    setSelectedLevel2(null);
    setSelectedLevel3(null);
  };

  const handleSelectLevel2 = (category: CourseCategory) => {
    setSelectedLevel2(category);
    setSelectedLevel3(null);
  };

  const handleSelectLevel3 = (category: CourseCategory) => {
    setSelectedLevel3(category);
  };

  // 新增：处理课程选择
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setDetailPanelMode("course");
  };

  // 新增：课程操作
  const handlePublishCourse = async () => {
    if (!selectedCourse) return;
    try {
      await courseApi.publishCourse(selectedCourse.id);
      toast.success("课程已发布");
      const selectedCategory = getSelectedCategory();
      if (selectedCategory) fetchCourses(selectedCategory.id);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "发布失败");
    }
  };

  const handleArchiveCourse = async () => {
    if (!selectedCourse) return;
    if (!confirm("确定要下架该课程吗？")) return;
    try {
      await courseApi.archiveCourse(selectedCourse.id);
      toast.success("课程已下架");
      const selectedCategory = getSelectedCategory();
      if (selectedCategory) fetchCourses(selectedCategory.id);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "下架失败");
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    if (!confirm("确定要删除该课程吗？删除后不可恢复。")) return;
    try {
      await courseApi.deleteCourse(selectedCourse.id);
      toast.success("课程已删除");
      setSelectedCourse(null);
      setDetailPanelMode("category");
      const selectedCategory = getSelectedCategory();
      if (selectedCategory) fetchCourses(selectedCategory.id);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // Get the currently selected category for detail panel
  const getSelectedCategory = (): CourseCategory | null => {
    if (selectedLevel3) return selectedLevel3;
    if (selectedLevel2) return selectedLevel2;
    if (selectedLevel1) return selectedLevel1;
    return null;
  };

  // Dialog handlers
  const handleAddInSubject = (subject: Subject) => {
    setEditingCategory(null);
    setParentIdForNew(null);
    setParentNameForNew("");
    setDefaultSubjectForNew(subject);
    setDialogOpen(true);
  };

  const handleAddChild = (parent: CourseCategory) => {
    setEditingCategory(null);
    setParentIdForNew(parent.id);
    setParentNameForNew(parent.name);
    setDefaultSubjectForNew(parent.subject);
    setDialogOpen(true);
  };

  const handleEdit = (category: CourseCategory) => {
    setEditingCategory(category);
    setParentIdForNew(null);
    setParentNameForNew("");
    setDialogOpen(true);
  };

  const handleDelete = async (category: CourseCategory) => {
    if (!confirm(`确定要删除「${category.name}」吗？删除后不可恢复。`)) return;
    try {
      await courseApi.deleteCategory(category.id);
      toast.success("分类已删除");
      // Clear selection if deleted
      if (selectedLevel3?.id === category.id) setSelectedLevel3(null);
      if (selectedLevel2?.id === category.id) {
        setSelectedLevel2(null);
        setSelectedLevel3(null);
      }
      if (selectedLevel1?.id === category.id) {
        setSelectedLevel1(null);
        setSelectedLevel2(null);
        setSelectedLevel3(null);
      }
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  const handleToggleActive = async (category: CourseCategory) => {
    try {
      await courseApi.updateCategory(category.id, { is_active: !category.is_active });
      toast.success(category.is_active ? "已禁用" : "已启用");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  const handleSubmit = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      if (editingCategory) {
        await courseApi.updateCategory(editingCategory.id, data);
        toast.success("分类已更新");
      } else {
        await courseApi.createCategory(data as CreateCategoryRequest);
        toast.success("分类已创建");
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  // Quick duplicate category
  const handleDuplicate = async (category: CourseCategory) => {
    try {
      const newCode = `${category.code}_copy_${Date.now().toString(36).slice(-4)}`;
      const duplicateData: CreateCategoryRequest = {
        parent_id: category.parent_id,
        code: newCode,
        name: `${category.name} (副本)`,
        description: category.description,
        icon: category.icon,
        color: category.color,
        subject: category.subject,
        exam_type: category.exam_type,
        sort_order: category.sort_order + 1,
        is_active: false, // Duplicates start as inactive
      };
      await courseApi.createCategory(duplicateData);
      toast.success("分类已复制", { description: `新分类: ${duplicateData.name}` });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "复制失败");
    }
  };

  // Prepare column data with color themes
  const subjectItems = subjects.map((subject) => {
    const theme = subjectThemes[subject];
    return {
      id: subject,
      name: getSubjectName(subject),
      subtitle: `${getSubjectCount(subject)} 个分类`,
      count: getSubjectCount(subject),
      hasChildren: (categoriesBySubject[subject]?.length || 0) > 0,
      isActive: true,
      colorTheme: theme,
    };
  });

  const currentTheme = selectedSubject ? subjectThemes[selectedSubject] : null;

  const level1Items = selectedSubject
    ? (categoriesBySubject[selectedSubject] || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        subtitle: cat.code,
        count: cat.course_count,
        isActive: cat.is_active,
        hasChildren: (cat.children?.length || 0) > 0,
        data: cat,
        colorTheme: currentTheme || undefined,
      }))
    : [];

  const level2Items = selectedLevel1?.children
    ? selectedLevel1.children.map((cat) => ({
        id: cat.id,
        name: cat.name,
        subtitle: cat.code,
        count: cat.course_count,
        isActive: cat.is_active,
        hasChildren: (cat.children?.length || 0) > 0,
        data: cat,
        colorTheme: currentTheme || undefined,
      }))
    : [];

  const level3Items = selectedLevel2?.children
    ? selectedLevel2.children.map((cat) => ({
        id: cat.id,
        name: cat.name,
        subtitle: cat.code,
        count: cat.course_count,
        isActive: cat.is_active,
        hasChildren: (cat.children?.length || 0) > 0,
        data: cat,
        colorTheme: currentTheme || undefined,
      }))
    : [];

  // 新增：课程列表数据（格式与分类列一致）
  const courseItems = courses.map((course) => ({
    id: course.id,
    name: course.title || "未命名课程",
    subtitle: course.status ? getStatusLabel(course.status) : "草稿", // 副标题显示状态
    count: course.chapter_count || undefined, // 徽章显示章节数（0时不显示）
    isActive: course.status === "published",
    hasChildren: false,
    data: course,
    colorTheme: currentTheme || undefined,
  }));

  const selectedCategory = getSelectedCategory();

  const handleCreateCategory = useCallback(() => {
    setEditingCategory(null);
    setParentIdForNew(null);
    setParentNameForNew("");
    setDefaultSubjectForNew(selectedSubject || "xingce");
    setDialogOpen(true);
  }, [selectedSubject]);

  // Register toolbar content
  useLayoutEffect(() => {
    setToolbarContent(
      <>
        <Button size="sm" variant="ghost" onClick={() => {
          setBatchMode(prev => {
            if (prev) setSelectedIds(new Set());
            return !prev;
          });
        }} className={`h-8 w-8 p-0 ${batchMode ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : ''}`}>
          <CheckCheck className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={fetchCategories} disabled={loading} className="h-8 w-8 p-0">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
        <Button
          size="sm"
          onClick={handleCreateCategory}
          className="h-8 px-3 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          新建
        </Button>
      </>
    );
    return () => setToolbarContent(null);
  }, [setToolbarContent, loading, batchMode, handleCreateCategory, fetchCategories]);

  return (
    <TooltipProvider delayDuration={300}>
    <div className="h-full flex flex-col">
      {/* Batch Action Bar */}
      {batchMode && selectedIds.size > 0 && (
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800">
          <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">已选 {selectedIds.size} 项</span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" onClick={async () => {
            if (!confirm(`确定要批量启用 ${selectedIds.size} 个分类吗？`)) return;
            for (const id of selectedIds) { try { await courseApi.updateCategory(id, { is_active: true }); } catch {} }
            toast.success(`已启用 ${selectedIds.size} 个分类`);
            setSelectedIds(new Set());
            fetchCategories();
          }} className="h-7 text-xs text-green-600 hover:bg-green-100">
            <Power className="h-3 w-3 mr-1" />启用
          </Button>
          <Button size="sm" variant="ghost" onClick={async () => {
            if (!confirm(`确定要批量禁用 ${selectedIds.size} 个分类吗？`)) return;
            for (const id of selectedIds) { try { await courseApi.updateCategory(id, { is_active: false }); } catch {} }
            toast.success(`已禁用 ${selectedIds.size} 个分类`);
            setSelectedIds(new Set());
            fetchCategories();
          }} className="h-7 text-xs text-orange-600 hover:bg-orange-100">
            <PowerOff className="h-3 w-3 mr-1" />禁用
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="h-7 text-xs">取消</Button>
        </div>
      )}

      {/* Main Content - 两栏布局：左侧多栏 + 右侧详情 */}
      <div className="flex-1 flex gap-3 overflow-hidden mx-4 my-3">
        {/* 左侧 Card：多栏区域 */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-border/50 rounded-xl">
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs overflow-x-auto">
              <Layers className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {selectedSubject ? (
                <>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                  <button onClick={() => { setSelectedLevel1(null); setSelectedLevel2(null); setSelectedLevel3(null); }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${subjectThemes[selectedSubject].bgLight} ${subjectThemes[selectedSubject].bgDark} ${subjectThemes[selectedSubject].text} font-medium text-[11px]`}>
                    <SubjectIcon subject={selectedSubject} className="h-3 w-3" />
                    {getSubjectName(selectedSubject)}
                  </button>
                  {selectedLevel1 && <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                    <button onClick={() => { setSelectedLevel2(null); setSelectedLevel3(null); }}
                      className="px-1.5 py-0.5 rounded bg-muted/50 font-medium text-[11px] hover:bg-muted">{selectedLevel1.name}</button>
                  </>}
                  {selectedLevel2 && <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                    <button onClick={() => setSelectedLevel3(null)}
                      className="px-1.5 py-0.5 rounded bg-muted/50 font-medium text-[11px] hover:bg-muted">{selectedLevel2.name}</button>
                  </>}
                  {selectedLevel3 && <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                    <span className="px-1.5 py-0.5 rounded bg-muted/50 font-medium text-[11px]">{selectedLevel3.name}</span>
                  </>}
                </>
              ) : (
                <span className="text-muted-foreground text-[11px] ml-1">选择科目开始浏览</span>
              )}
            </div>
            
            <div className="ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={() => setShowDetailPanel(!showDetailPanel)} className="h-6 w-6 p-0">
                    {showDetailPanel ? <PanelRightClose className="h-3.5 w-3.5 text-muted-foreground" /> : <PanelRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{showDetailPanel ? "隐藏详情" : "显示详情"}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
            {/* Column 1: Subjects */}
            <Column
              title="科目"
              items={subjectItems}
              selectedId={selectedSubject}
              onSelect={(id) => handleSelectSubject(id as Subject)}
              loading={loading}
              emptyText="暂无科目"
            />

            {/* Column 2: Level 1 Categories */}
            {selectedSubject && (
              <Column
                title="一级分类"
                items={level1Items}
                selectedId={selectedLevel1?.id || null}
                onSelect={(_, data) => handleSelectLevel1(data)}
                onDoubleClick={(_, data) => handleEdit(data)}
                onQuickEdit={(_, data) => handleEdit(data)}
                onQuickDelete={(_, data) => handleDelete(data)}
                onToggleActive={(_, data) => handleToggleActive(data)}
                onCopyCode={(_, data) => {
                  navigator.clipboard.writeText(data.code);
                  toast.success("已复制编码", { description: data.code });
                }}
                onAdd={() => handleAddInSubject(selectedSubject)}
                emptyText="暂无分类"
                searchable
                showQuickActions
                filterable
                sortable
                enableContextMenu
              />
            )}

            {/* Column 3: Level 2 Categories */}
            {selectedLevel1 && level2Items.length > 0 && (
              <Column
                title="二级分类（本级课程）"
                items={level2Items}
                selectedId={selectedLevel2?.id || null}
                onSelect={(_, data) => handleSelectLevel2(data)}
                onDoubleClick={(_, data) => handleEdit(data)}
                onQuickEdit={(_, data) => handleEdit(data)}
                onQuickDelete={(_, data) => handleDelete(data)}
                onToggleActive={(_, data) => handleToggleActive(data)}
                onCopyCode={(_, data) => {
                  navigator.clipboard.writeText(data.code);
                  toast.success("已复制编码", { description: data.code });
                }}
                onAdd={() => handleAddChild(selectedLevel1)}
                emptyText="暂无子分类"
                searchable
                showQuickActions
                filterable
                sortable
                enableContextMenu
              />
            )}

            {/* Column 4: Level 3 Categories */}
            {selectedLevel2 && level3Items.length > 0 && (
              <Column
                title="三级分类（本级课程）"
                items={level3Items}
                selectedId={selectedLevel3?.id || null}
                onSelect={(_, data) => handleSelectLevel3(data)}
                onDoubleClick={(_, data) => handleEdit(data)}
                onQuickEdit={(_, data) => handleEdit(data)}
                onQuickDelete={(_, data) => handleDelete(data)}
                onToggleActive={(_, data) => handleToggleActive(data)}
                onCopyCode={(_, data) => {
                  navigator.clipboard.writeText(data.code);
                  toast.success("已复制编码", { description: data.code });
                }}
                onAdd={() => handleAddChild(selectedLevel2)}
                emptyText="暂无子分类"
                searchable
                showQuickActions
                filterable
                sortable
                enableContextMenu
              />
            )}

            {/* Column 5: Courses - 课程列 */}
            {selectedCategory && (
              <Column
                title="课程"
                items={courseItems}
                selectedId={selectedCourse?.id || null}
                onSelect={(_, data) => handleSelectCourse(data)}
                onDoubleClick={(_, data) => {
                  window.location.href = `/learning/courses/${data.id}`;
                }}
                onQuickEdit={(_, data) => {
                  window.location.href = `/learning/courses/${data.id}`;
                }}
                onQuickDelete={() => handleDeleteCourse()}
                onToggleActive={(_, data) => {
                  if (data.status === "published") {
                    handleArchiveCourse();
                  } else {
                    handlePublishCourse();
                  }
                }}
                loading={coursesLoading}
                emptyText="暂无课程"
                searchable
                showQuickActions
                filterable
                sortable
                enableContextMenu
                wide
              />
            )}
          </div>
        </Card>

        {/* 右侧 Card：详情面板 */}
        {showDetailPanel && (
          <Card className="w-[340px] lg:w-[380px] flex-shrink-0 flex flex-col overflow-hidden shadow-sm border-border/50 rounded-xl">
            {detailPanelMode === "course" && selectedCourse ? (
              <CourseDetailPanel
                course={selectedCourse}
                onEdit={() => setChapterModalOpen(true)}
                onPublish={handlePublishCourse}
                onArchive={handleArchiveCourse}
                onDelete={handleDeleteCourse}
                onManageChapters={() => setChapterModalOpen(true)}
              />
            ) : (
              <DetailPanel
                category={selectedCategory}
                onEdit={() => selectedCategory && handleEdit(selectedCategory)}
                onDelete={() => selectedCategory && handleDelete(selectedCategory)}
                onToggleActive={() => selectedCategory && handleToggleActive(selectedCategory)}
                onAddChild={() => selectedCategory && handleAddChild(selectedCategory)}
                onDuplicate={() => selectedCategory && handleDuplicate(selectedCategory)}
                onRefresh={fetchCategories}
              />
            )}
          </Card>
        )}
      </div>

      {/* Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        parentId={parentIdForNew}
        parentName={parentNameForNew}
        defaultSubject={defaultSubjectForNew}
        onSubmit={handleSubmit}
      />

      {/* 章节管理 Modal */}
      <ChapterManagerModal
        open={chapterModalOpen}
        onOpenChange={setChapterModalOpen}
        course={selectedCourse}
        onUpdate={() => {
          // 刷新课程数据
          const currentCategory = selectedLevel3 || selectedLevel2 || selectedLevel1;
          if (currentCategory) {
            fetchCourses(currentCategory.id);
          }
          fetchCategories();
        }}
      />

    </div>
    </TooltipProvider>
  );
}
