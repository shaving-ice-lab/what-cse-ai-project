"use client";

import { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from "react";
import Link from "next/link";
import { useToolbar } from "./ToolbarContext";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Play,
  Archive,
  Loader2,
  LayoutGrid,
  FolderOpen,
  Folder,
  Video,
  FileText,
  Headphones,
  Users,
  Clock,
  Star,
  Eye,
  EyeOff,
  BarChart3,
  Mic,
  Hash,
  TrendingUp,
  Layers,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  Copy,
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle2,
  ListOrdered,
  PlayCircle,
  Globe,
  LayoutList,
  LayoutDashboard,
  CheckCheck,
  PanelRightClose,
  PanelRight,
  CopyPlus,
  Download,
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
} from "@what-cse/ui";
import {
  courseApi,
  Course,
  CourseCategory,
  CourseStatus,
  ContentType,
  Difficulty,
  Subject,
  CreateCourseRequest,
  getSubjectName,
  getDifficultyLabel,
  getContentTypeLabel,
  getStatusLabel,
} from "@/services/course-api";
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

// Subject color themes - consistent with categories page
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

// Content Type Icon
function ContentTypeIcon({ type, className }: { type: ContentType; className?: string }) {
  switch (type) {
    case "video":
      return <Video className={className} />;
    case "audio":
      return <Headphones className={className} />;
    case "document":
      return <FileText className={className} />;
    default:
      return <BookOpen className={className} />;
  }
}

// ============================================
// Course Form Dialog
// ============================================

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CourseCategory[];
  defaultCategoryId?: number;
  onSubmit: (data: CreateCourseRequest) => void;
}

function CourseFormDialog({
  open,
  onOpenChange,
  categories,
  defaultCategoryId,
  onSubmit,
}: CourseFormDialogProps) {
  const [formData, setFormData] = useState<CreateCourseRequest>({
    category_id: defaultCategoryId || 0,
    title: "",
    subtitle: "",
    description: "",
    cover_image: "",
    content_type: "video",
    difficulty: "beginner",
    author_name: "",
    author_intro: "",
    is_free: false,
    vip_only: false,
    status: "draft",
  });

  useEffect(() => {
    if (open && defaultCategoryId) {
      setFormData((prev) => ({ ...prev, category_id: defaultCategoryId }));
    }
  }, [open, defaultCategoryId]);

  const handleSubmit = () => {
    if (!formData.title || !formData.category_id) {
      toast.error("请填写课程标题和选择分类");
      return;
    }
    onSubmit(formData);
    onOpenChange(false);
    setFormData({
      category_id: defaultCategoryId || 0,
      title: "",
      subtitle: "",
      description: "",
      cover_image: "",
      content_type: "video",
      difficulty: "beginner",
      author_name: "",
      author_intro: "",
      is_free: false,
      vip_only: false,
      status: "draft",
    });
  };

  const flattenCategories = (cats: CourseCategory[], level = 0): { id: number; name: string; level: number; subject?: Subject }[] => {
    const result: { id: number; name: string; level: number; subject?: Subject }[] = [];
    for (const cat of cats) {
      result.push({ id: cat.id, name: cat.name, level, subject: cat.subject });
      if (cat.children) {
        result.push(...flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  };

  const flatCategories = flattenCategories(categories);

  // Get theme based on selected category
  const selectedCategory = flatCategories.find(c => c.id === formData.category_id);
  const theme = selectedCategory?.subject ? subjectThemes[selectedCategory.subject] : subjectThemes.xingce;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh]">
        {/* Header with gradient */}
        <div className={`relative px-6 pt-6 pb-4 bg-gradient-to-r ${theme.gradient} bg-opacity-10`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-10`} />
          <DialogHeader className="relative">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm`}>
                <ContentTypeIcon type={formData.content_type} className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">新建课程</DialogTitle>
                <DialogDescription className="mt-0.5">
                  创建新的学习课程内容
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5 space-y-5">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-amber-500" />
                基本信息
              </h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">课程标题 <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="输入课程标题"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">副标题</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="输入副标题（可选）"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Classification Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-amber-500" />
                课程属性
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">所属分类 <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.category_id ? formData.category_id.toString() : ""}
                    onValueChange={(v) => setFormData({ ...formData, category_id: Number(v) })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {flatCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          <span className="flex items-center gap-2">
                            {cat.subject && (
                              <SubjectIcon subject={cat.subject} className={`h-3.5 w-3.5 ${subjectThemes[cat.subject].text}`} />
                            )}
                            {"　".repeat(cat.level)}{cat.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="video">
                        <span className="flex items-center gap-2">
                          <Video className="h-3.5 w-3.5 text-blue-500" />
                          视频
                        </span>
                      </SelectItem>
                      <SelectItem value="document">
                        <span className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-emerald-500" />
                          文档
                        </span>
                      </SelectItem>
                      <SelectItem value="audio">
                        <span className="flex items-center gap-2">
                          <Headphones className="h-3.5 w-3.5 text-violet-500" />
                          音频
                        </span>
                      </SelectItem>
                      <SelectItem value="mixed">
                        <span className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-amber-500" />
                          综合
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">难度级别</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v) => setFormData({ ...formData, difficulty: v as Difficulty })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">
                        <span className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          入门
                        </span>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <span className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          进阶
                        </span>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <span className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          高级
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">发布状态</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as CourseStatus })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <span className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-400" />
                          草稿
                        </span>
                      </SelectItem>
                      <SelectItem value="published">
                        <span className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          发布
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-amber-500" />
                课程描述
              </h4>
              <div className="space-y-2">
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入课程简介，描述课程的主要内容和学习目标..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Author & Media Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-amber-500" />
                讲师与封面
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">讲师名称</Label>
                  <Input
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    placeholder="讲师名称"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">封面图片URL</Label>
                  <Input
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://..."
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Access Settings */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-amber-500" />
                访问权限
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  formData.is_free 
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" 
                    : "bg-muted/30 border-muted"
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      formData.is_free ? "bg-green-500/20" : "bg-muted"
                    }`}>
                      <Star className={`h-4 w-4 ${formData.is_free ? "text-green-600" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">免费课程</Label>
                      <p className="text-xs text-muted-foreground">所有用户可学习</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_free}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_free: checked, vip_only: checked ? false : formData.vip_only })
                    }
                  />
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  formData.vip_only 
                    ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" 
                    : "bg-muted/30 border-muted"
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      formData.vip_only ? "bg-amber-500/20" : "bg-muted"
                    }`}>
                      <Users className={`h-4 w-4 ${formData.vip_only ? "text-amber-600" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">VIP专属</Label>
                      <p className="text-xs text-muted-foreground">仅VIP可学习</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.vip_only}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, vip_only: checked, is_free: checked ? false : formData.is_free })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9">
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            className={`h-9 bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
          >
            创建课程
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
  colorTheme?: typeof subjectThemes[Subject];
  showQuickActions?: boolean;
  enableContextMenu?: boolean;
  searchQuery?: string;
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
          {onToggleActive && (
            <DropdownMenuItem onClick={onToggleActive} className="text-sm">
              {isActive ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-2" />
                  下架
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-2" />
                  发布
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
  onAdd?: () => void;
  loading?: boolean;
  emptyText?: string;
  searchable?: boolean;
  showQuickActions?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  enableContextMenu?: boolean;
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
  onAdd,
  loading,
  emptyText = "暂无数据",
  searchable = false,
  showQuickActions = false,
  filterable = false,
  sortable = false,
  enableContextMenu = false,
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

  return (
    <div className="flex flex-col h-full min-w-[180px] w-[180px] md:min-w-[200px] md:w-[200px] lg:min-w-[220px] lg:w-[220px] flex-shrink-0 border-r border-border/40 bg-background/95">
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
                      已发布 ({activeCount})
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={statusFilter === "inactive"}
                      onCheckedChange={() => setStatusFilter("inactive")}
                      className="text-xs py-1"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mr-1.5" />
                      草稿/下架 ({inactiveCount})
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
// Course Detail Panel
// ============================================

interface CourseDetailPanelProps {
  course: Course | null;
  onEdit: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

function CourseDetailPanel({ course, onEdit, onPublish, onArchive, onDelete }: CourseDetailPanelProps) {
  // Calculate course health score
  const getCourseHealth = (c: Course) => {
    let score = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check description
    if (c.description && c.description.length > 30) {
      score += 20;
    } else {
      issues.push("描述太短或缺失");
      suggestions.push("添加详细的课程描述");
    }
    
    // Check cover image
    if (c.cover_image) {
      score += 15;
    } else {
      issues.push("缺少封面图");
      suggestions.push("添加吸引人的封面图片");
    }
    
    // Check chapters
    if (c.chapter_count && c.chapter_count > 0) {
      score += 25;
    } else {
      issues.push("暂无章节内容");
      suggestions.push("添加课程章节和内容");
    }
    
    // Check status
    if (c.status === "published") {
      score += 20;
    } else if (c.status === "draft") {
      suggestions.push("课程完善后发布上线");
    }
    
    // Check author
    if (c.author_name) {
      score += 10;
    } else {
      suggestions.push("添加讲师信息增加可信度");
    }
    
    // Check rating
    if (c.rating && c.rating > 0) {
      score += 10;
    }
    
    return { score, issues, suggestions };
  };

  if (!course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-muted/5 to-muted/20 min-w-[280px] max-w-[340px] lg:min-w-[320px] lg:max-w-[380px]">
        <div className="relative animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl animate-pulse" />
          <div className="relative h-16 w-16 rounded-xl bg-muted/40 flex items-center justify-center mb-4 border border-muted-foreground/10">
            <BookOpen className="h-8 w-8 opacity-30" />
          </div>
        </div>
        <p className="text-xs font-medium">选择课程查看详情</p>
        <p className="text-[11px] mt-1 text-muted-foreground/60">双击可快速编辑</p>
      </div>
    );
  }

  const healthInfo = getCourseHealth(course);

  // Determine theme based on course's category subject
  const categorySubject = course.category?.subject as Subject | undefined;
  const theme = categorySubject ? subjectThemes[categorySubject] : subjectThemes.xingce;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-background to-muted/10 min-w-[280px] max-w-[340px] lg:min-w-[320px] lg:max-w-[380px] animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header with cover image - 更紧凑 */}
      <div className="relative">
        <div className={`h-28 bg-gradient-to-br ${theme.gradient} opacity-20`} />
        <div className="absolute inset-0 flex items-center justify-center">
          {course.cover_image ? (
            <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}>
              <ContentTypeIcon type={course.content_type} className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent h-16" />
      </div>

      {/* Title - 更紧凑 */}
      <div className="px-4 -mt-4 relative">
        <h2 className="text-lg font-bold leading-tight">{course.title}</h2>
        {course.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{course.subtitle}</p>}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 pt-3 space-y-4">
          {/* Quick Preview Link - 更紧凑 */}
          {course.status === "published" && (
            <a
              href={`http://localhost:3000/learn/course/${course.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium hover:opacity-90 transition-all shadow-sm"
            >
              <Globe className="h-3.5 w-3.5" />
              前台预览
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {/* Course Health Score - 更紧凑 */}
          <div className={`rounded-lg p-3 border ${
            healthInfo.score >= 80 ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" :
            healthInfo.score >= 50 ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" :
            "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                完整度
              </h3>
              <div className={`text-base font-bold ${
                healthInfo.score >= 80 ? "text-emerald-600" :
                healthInfo.score >= 50 ? "text-amber-600" :
                "text-red-600"
              }`}>
                {healthInfo.score}%
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  healthInfo.score >= 80 ? "bg-emerald-500" :
                  healthInfo.score >= 50 ? "bg-amber-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${healthInfo.score}%` }}
              />
            </div>
            {healthInfo.suggestions.length > 0 && (
              <div className="space-y-1">
                {healthInfo.suggestions.slice(0, 2).map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <Info className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status badges - 更紧凑 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant={course.status === "published" ? "default" : course.status === "archived" ? "secondary" : "outline"}
              className={`px-2 py-0.5 text-[11px] ${course.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : ""}`}
            >
              {course.status === "published" && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />}
              {getStatusLabel(course.status)}
            </Badge>
            <Badge variant="outline" className="px-2 py-0.5 text-[11px]">
              <ContentTypeIcon type={course.content_type} className="h-2.5 w-2.5 mr-1" />
              {getContentTypeLabel(course.content_type)}
            </Badge>
            <Badge
              className={`px-2 py-0.5 text-[11px] ${
                course.difficulty === "beginner"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/50"
                  : course.difficulty === "intermediate"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50"
                  : "bg-red-100 text-red-700 dark:bg-red-900/50"
              }`}
            >
              {getDifficultyLabel(course.difficulty)}
            </Badge>
            {course.is_free && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 text-[11px]">免费</Badge>
            )}
            {course.vip_only && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-0.5 text-[11px]">VIP</Badge>
            )}
          </div>

          {/* Description Card - 更紧凑 */}
          <div className={`rounded-lg ${theme.bgLight} ${theme.bgDark} ${theme.border} border p-3`}>
            <h3 className={`text-[11px] font-semibold ${theme.text} uppercase tracking-wider mb-1.5 flex items-center gap-1`}>
              <FileText className="h-3 w-3" />
              简介
            </h3>
            <p className="text-xs leading-relaxed">
              {course.description || <span className="text-muted-foreground italic">暂无简介</span>}
            </p>
          </div>

          {/* Stats Grid - 更紧凑 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-md bg-blue-50 dark:bg-blue-950/30 p-2 border border-blue-100 dark:border-blue-900">
              <div className="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">学习人次</p>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300 truncate">{course.study_count.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 p-2 border border-amber-100 dark:border-amber-900">
              <div className="h-8 w-8 rounded bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">评分</p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{course.rating?.toFixed(1) || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-purple-50 dark:bg-purple-950/30 p-2 border border-purple-100 dark:border-purple-900">
              <div className="h-8 w-8 rounded bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70">时长</p>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{course.duration ? `${Math.floor(course.duration / 60)}分` : "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 p-2 border border-emerald-100 dark:border-emerald-900">
              <div className="h-8 w-8 rounded bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Layers className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">章节</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{course.chapter_count || 0}章</p>
              </div>
            </div>
          </div>

          {/* Info Grid - 更紧凑 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted/30 p-2">
              <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">分类</h3>
              <p className="text-xs font-medium truncate">{course.category?.name || "-"}</p>
            </div>
            <div className="rounded-md bg-muted/30 p-2">
              <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">讲师</h3>
              <p className="text-xs font-medium truncate">{course.author_name || "-"}</p>
            </div>
            <div className="rounded-md bg-muted/30 p-2">
              <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">排序</h3>
              <p className="text-xs font-medium">#{course.sort_order}</p>
            </div>
            <div className="rounded-md bg-muted/30 p-2">
              <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">ID</h3>
              <p className="text-xs font-mono text-muted-foreground">{course.id}</p>
            </div>
          </div>

          {/* Quick Links - 更紧凑 */}
          <div className="rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 p-3">
            <h3 className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              快捷操作
            </h3>
            <div className="space-y-1.5">
              <Link
                href={`/learning/courses/${course.id}`}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-white/60 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs transition-all"
              >
                <ListOrdered className="h-3 w-3" />
                管理章节
                <span className="ml-auto text-[10px] text-violet-500">{course.chapter_count || 0}章</span>
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(course.id.toString());
                  toast.success("已复制课程 ID", { description: course.id.toString() });
                }}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded bg-white/60 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs transition-all"
              >
                <Copy className="h-3 w-3" />
                复制ID
                <span className="ml-auto font-mono text-[10px] text-violet-500">#{course.id}</span>
              </button>
            </div>
          </div>

          {/* Actions - 更紧凑 */}
          <div className="pt-3 border-t space-y-2">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Edit className="h-3 w-3" />
              操作
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              <Button size="sm" variant="outline" onClick={onEdit} className="justify-start h-7 text-xs">
                <Edit className="h-3 w-3 mr-1" />
                编辑
              </Button>
              {course.status === "draft" && (
                <Button size="sm" variant="outline" onClick={onPublish} className="justify-start h-7 text-xs text-green-600 hover:bg-green-50">
                  <Play className="h-3 w-3 mr-1" />
                  发布
                </Button>
              )}
              {course.status === "published" && (
                <Button size="sm" variant="outline" onClick={onArchive} className="justify-start h-7 text-xs text-orange-600 hover:bg-orange-50">
                  <Archive className="h-3 w-3 mr-1" />
                  下架
                </Button>
              )}
              {course.status === "archived" && (
                <Button size="sm" variant="outline" onClick={onPublish} className="justify-start h-7 text-xs text-green-600 hover:bg-green-50">
                  <Play className="h-3 w-3 mr-1" />
                  上线
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onDelete} className="justify-start h-7 text-xs text-red-600 hover:bg-red-50">
                <Trash2 className="h-3 w-3 mr-1" />
                删除
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

const subjects: Subject[] = ["xingce", "shenlun", "mianshi", "gongji"];

export default function CourseManager() {
  const { setToolbarContent } = useToolbar();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Selection state
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // UI State
  const [viewDensity, setViewDensity] = useState<"compact" | "comfortable">("comfortable");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(true);
  
  // Batch selection state
  const [batchMode, setBatchMode] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());

  // Fetch categories
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

  // Fetch courses for selected category
  const fetchCourses = useCallback(async (categoryId: number) => {
    setCoursesLoading(true);
    try {
      const result = await courseApi.getCourses({
        category_id: categoryId,
        page_size: 100,
      });
      setCourses(result.courses || []);
      setLastRefreshTime(new Date());
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

  // When category changes, fetch courses
  useEffect(() => {
    if (selectedCategory) {
      fetchCourses(selectedCategory.id);
      setSelectedCourse(null);
    } else {
      setCourses([]);
      setSelectedCourse(null);
    }
  }, [selectedCategory, fetchCourses]);

  // Group categories by subject
  const categoriesBySubject = categories.reduce((acc, cat) => {
    if (!acc[cat.subject]) {
      acc[cat.subject] = [];
    }
    acc[cat.subject].push(cat);
    return acc;
  }, {} as Record<string, CourseCategory[]>);

  // Get total course count for subject
  const getSubjectCourseCount = (subject: Subject) => {
    const countAll = (cats: CourseCategory[]): number => {
      return cats.reduce((sum, cat) => {
        return sum + (cat.course_count || 0) + (cat.children ? countAll(cat.children) : 0);
      }, 0);
    };
    return countAll(categoriesBySubject[subject] || []);
  };

  // Handlers
  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedCategory(null);
    setSelectedCourse(null);
  };

  const handleSelectCategory = (category: CourseCategory) => {
    setSelectedCategory(category);
    setSelectedCourse(null);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCreateCourse = async (data: CreateCourseRequest) => {
    try {
      await courseApi.createCourse(data);
      toast.success("课程已创建");
      if (selectedCategory) {
        fetchCourses(selectedCategory.id);
      }
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "创建失败");
    }
  };

  const handlePublish = async () => {
    if (!selectedCourse) return;
    try {
      await courseApi.publishCourse(selectedCourse.id);
      toast.success("课程已发布");
      if (selectedCategory) fetchCourses(selectedCategory.id);
    } catch (error: any) {
      toast.error(error.message || "发布失败");
    }
  };

  const handleArchive = async () => {
    if (!selectedCourse) return;
    if (!confirm("确定要下架该课程吗？")) return;
    try {
      await courseApi.archiveCourse(selectedCourse.id);
      toast.success("课程已下架");
      if (selectedCategory) fetchCourses(selectedCategory.id);
    } catch (error: any) {
      toast.error(error.message || "下架失败");
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;
    if (!confirm("确定要删除该课程吗？删除后不可恢复。")) return;
    try {
      await courseApi.deleteCourse(selectedCourse.id);
      toast.success("课程已删除");
      setSelectedCourse(null);
      if (selectedCategory) fetchCourses(selectedCategory.id);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // Flatten categories for a subject (include children as selectable)
  const flattenWithChildren = (cats: CourseCategory[]): CourseCategory[] => {
    const result: CourseCategory[] = [];
    for (const cat of cats) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenWithChildren(cat.children));
      }
    }
    return result;
  };

  // Prepare column data with color themes
  const subjectItems = subjects.map((subject) => {
    const theme = subjectThemes[subject];
    return {
      id: subject,
      name: getSubjectName(subject),
      subtitle: `${getSubjectCourseCount(subject)} 门课程`,
      count: getSubjectCourseCount(subject),
      hasChildren: (categoriesBySubject[subject]?.length || 0) > 0,
      isActive: true,
      colorTheme: theme,
    };
  });

  const currentTheme = selectedSubject ? subjectThemes[selectedSubject] : null;

  const categoryItems = selectedSubject
    ? flattenWithChildren(categoriesBySubject[selectedSubject] || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        subtitle: `${cat.course_count || 0} 门课程`,
        count: cat.course_count,
        isActive: cat.is_active,
        hasChildren: (cat.course_count || 0) > 0,
        data: cat,
        colorTheme: currentTheme || undefined,
      }))
    : [];

  const courseItems = courses.map((course) => ({
    id: course.id,
    name: course.title,
    subtitle: course.author_name || getStatusLabel(course.status),
    isActive: course.status !== "archived",
    hasChildren: false,
    data: course,
    colorTheme: currentTheme || undefined,
  }));

  const handleRefresh = useCallback(() => {
    fetchCategories();
    if (selectedCategory) fetchCourses(selectedCategory.id);
  }, [fetchCategories, fetchCourses, selectedCategory]);

  // Register toolbar content
  useLayoutEffect(() => {
    setToolbarContent(
      <>
        <Button size="sm" variant="ghost" onClick={() => {
          setBatchMode(prev => {
            if (prev) setSelectedCourseIds(new Set());
            return !prev;
          });
        }} className={`h-8 w-8 p-0 ${batchMode ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : ''}`}>
          <CheckCheck className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={loading} className="h-8 w-8 p-0">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}
          className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-sm">
          <Plus className="mr-1 h-3.5 w-3.5" />
          新建
        </Button>
      </>
    );
    return () => setToolbarContent(null);
  }, [setToolbarContent, loading, batchMode, handleRefresh]);

  return (
    <TooltipProvider delayDuration={300}>
    <div className="h-full flex flex-col">
      {/* Batch Action Bar */}
      {batchMode && selectedCourseIds.size > 0 && (
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800">
          <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">已选 {selectedCourseIds.size} 门课程</span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" onClick={async () => {
            if (!confirm(`确定要批量发布 ${selectedCourseIds.size} 门课程吗？`)) return;
            let count = 0; for (const id of selectedCourseIds) { try { await courseApi.publishCourse(id); count++; } catch {} }
            toast.success(`已发布 ${count} 门课程`);
            setSelectedCourseIds(new Set());
            if (selectedCategory) fetchCourses(selectedCategory.id);
          }} className="h-7 text-xs text-green-600 hover:bg-green-100">
            <Play className="h-3 w-3 mr-1" />发布
          </Button>
          <Button size="sm" variant="ghost" onClick={async () => {
            if (!confirm(`确定要批量下架 ${selectedCourseIds.size} 门课程吗？`)) return;
            let count = 0; for (const id of selectedCourseIds) { try { await courseApi.archiveCourse(id); count++; } catch {} }
            toast.success(`已下架 ${count} 门课程`);
            setSelectedCourseIds(new Set());
            if (selectedCategory) fetchCourses(selectedCategory.id);
          }} className="h-7 text-xs text-orange-600 hover:bg-orange-100">
            <Archive className="h-3 w-3 mr-1" />下架
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedCourseIds(new Set())} className="h-7 text-xs">取消</Button>
        </div>
      )}

      {/* Main Content - Miller Columns */}
      <div className="flex-1 flex flex-col overflow-hidden mx-4 my-3">
        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-border/50 rounded-xl">
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs overflow-x-auto">
              <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {selectedSubject ? (
                <>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                  <button onClick={() => { setSelectedCategory(null); setSelectedCourse(null); }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${subjectThemes[selectedSubject].bgLight} ${subjectThemes[selectedSubject].bgDark} ${subjectThemes[selectedSubject].text} font-medium text-[11px]`}>
                    <SubjectIcon subject={selectedSubject} className="h-3 w-3" />
                    {getSubjectName(selectedSubject)}
                  </button>
                  {selectedCategory && <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                    <button onClick={() => setSelectedCourse(null)}
                      className="px-1.5 py-0.5 rounded bg-muted/50 font-medium text-[11px] hover:bg-muted">{selectedCategory.name}</button>
                  </>}
                  {selectedCourse && <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                    <span className="px-1.5 py-0.5 rounded bg-muted/50 font-medium text-[11px] truncate max-w-[120px]">{selectedCourse.title}</span>
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

          {/* Column 2: Categories */}
          {selectedSubject && (
            <Column
              title="分类"
              items={categoryItems}
              selectedId={selectedCategory?.id || null}
              onSelect={(_, data) => handleSelectCategory(data)}
              emptyText="暂无分类"
              searchable
              filterable
              sortable
            />
          )}

          {/* Column 3: Courses */}
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
              onQuickDelete={handleDelete}
              onToggleActive={(_, data) => {
                if (data.status === "published") {
                  handleArchive();
                } else {
                  handlePublish();
                }
              }}
              onAdd={() => setCreateDialogOpen(true)}
              loading={coursesLoading}
              emptyText="暂无课程"
              searchable
              showQuickActions
              filterable
              sortable
              enableContextMenu
            />
          )}

          {/* Detail Panel */}
          {showDetailPanel && (
            <CourseDetailPanel
              course={selectedCourse}
              onEdit={() => selectedCourse && (window.location.href = `/learning/courses/${selectedCourse.id}`)}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          )}
          </div>
        </Card>
      </div>

      {/* Dialog */}
      <CourseFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        categories={categories}
        defaultCategoryId={selectedCategory?.id}
        onSubmit={handleCreateCourse}
      />

    </div>
    </TooltipProvider>
  );
}
