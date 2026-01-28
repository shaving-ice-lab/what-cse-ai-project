"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Search,
  RefreshCw,
  BookOpen,
  Check,
  X,
  AlertCircle,
  ArrowUpDown,
  CheckSquare,
  Square,
  MinusSquare,
  Power,
  PowerOff,
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
  courseApi,
  CourseCategory,
  Subject,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  getSubjectName,
  getSubjectIcon,
} from "@/services/course-api";
import { toast } from "sonner";

// ============================================
// Drag and Drop Context
// ============================================

interface DragState {
  draggedId: number | null;
  draggedCategory: CourseCategory | null;
  targetId: number | null;
  dropPosition: "before" | "after" | "inside" | null;
}

// ============================================
// Category Tree Node Component (with Drag & Drop)
// ============================================

interface CategoryNodeProps {
  category: CourseCategory;
  level?: number;
  onEdit: (category: CourseCategory) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentId: number) => void;
  // Drag and drop props
  isDragMode: boolean;
  dragState: DragState;
  onDragStart: (category: CourseCategory) => void;
  onDragEnd: () => void;
  onDragOver: (categoryId: number, position: "before" | "after" | "inside") => void;
  onDrop: () => void;
  // Batch selection props
  isBatchMode: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
}

function CategoryNode({
  category,
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
  isDragMode,
  dragState,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isBatchMode,
  selectedIds,
  onToggleSelect,
}: CategoryNodeProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = category.children && category.children.length > 0;
  const nodeRef = useRef<HTMLDivElement>(null);

  const isDragging = dragState.draggedId === category.id;
  const isDropTarget = dragState.targetId === category.id;
  const isSelected = selectedIds.has(category.id);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", category.id.toString());
    onDragStart(category);
  };

  // Handle drag over to determine drop position
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragState.draggedId === category.id) return;

    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    const height = rect.height;

    let position: "before" | "after" | "inside";
    if (y < height * 0.25) {
      position = "before";
    } else if (y > height * 0.75) {
      position = "after";
    } else {
      position = "inside";
    }

    onDragOver(category.id, position);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop();
  };

  // Get drop indicator styles
  const getDropIndicatorClass = () => {
    if (!isDropTarget || !isDragMode) return "";
    switch (dragState.dropPosition) {
      case "before":
        return "border-t-2 border-t-amber-500";
      case "after":
        return "border-b-2 border-b-amber-500";
      case "inside":
        return "bg-amber-50 border-amber-500";
      default:
        return "";
    }
  };

  return (
    <div>
      <div
        ref={nodeRef}
        draggable={isDragMode}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group flex items-center gap-2 p-3 rounded-lg border transition-all duration-150 ${
          !category.is_active ? "opacity-60" : ""
        } ${
          isDragging
            ? "opacity-50 border-dashed border-amber-400 bg-amber-50"
            : isSelected
            ? "border-blue-400 bg-blue-50"
            : "border-transparent hover:border-muted hover:bg-muted/50"
        } ${getDropIndicatorClass()} ${
          isDragMode ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Checkbox - only show in batch mode */}
        {isBatchMode && (
          <button
            onClick={() => onToggleSelect(category.id)}
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-blue-600 transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="h-5 w-5 text-blue-600" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Drag handle - only show in drag mode */}
        {isDragMode && (
          <div className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Expand/Collapse button - only show when not in drag mode and not in batch mode */}
        {!isDragMode && !isBatchMode && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`w-6 h-6 flex items-center justify-center rounded hover:bg-muted ${
              !hasChildren ? "invisible" : ""
            }`}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}

        {/* Icon */}
        <span className="text-xl">{category.icon || "📁"}</span>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{category.name}</span>
            <span className="text-xs text-muted-foreground">
              ({category.code})
            </span>
            {isDragMode && (
              <span className="text-xs text-muted-foreground">
                排序: {category.sort_order}
              </span>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-muted-foreground truncate">
              {category.description}
            </p>
          )}
        </div>

        {/* Course count */}
        <Badge variant="secondary" className="mr-2">
          {category.course_count} 课程
        </Badge>

        {/* Status */}
        {!category.is_active && (
          <Badge variant="outline" className="mr-2">
            已禁用
          </Badge>
        )}

        {/* Actions - hide in drag mode and batch mode */}
        {!isDragMode && !isBatchMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAddChild(category.id)}>
                <Plus className="mr-2 h-4 w-4" />
                添加子分类
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(category.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children - always show in drag/batch mode for selection, otherwise respect expanded state */}
      {hasChildren && (expanded || isDragMode || isBatchMode) && (
        <div className={`border-l border-muted ml-6 ${isDragMode ? "pl-2" : ""}`}>
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              isDragMode={isDragMode}
              dragState={dragState}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
              isBatchMode={isBatchMode}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Category Form Dialog
// ============================================

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CourseCategory | null;
  parentId?: number | null;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void;
}

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  parentId,
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

  // Reset form when dialog opens
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
          subject: "xingce",
          exam_type: "national",
          sort_order: 0,
          is_active: true,
        });
      }
    }
  }, [open, category, parentId]);

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast.error("请填写分类编码和名称");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑分类" : "新建分类"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改课程分类信息" : "创建新的课程分类"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>分类编码 *</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="如: xc_yy"
                disabled={isEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>分类名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="如: 言语理解"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>所属科目</Label>
              <Select
                value={formData.subject}
                onValueChange={(v) =>
                  setFormData({ ...formData, subject: v as Subject })
                }
                disabled={isEdit && !!category?.parent_id}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xingce">
                    📊 行测
                  </SelectItem>
                  <SelectItem value="shenlun">
                    📝 申论
                  </SelectItem>
                  <SelectItem value="mianshi">
                    🎤 面试
                  </SelectItem>
                  <SelectItem value="gongji">
                    📚 公基
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>考试类型</Label>
              <Select
                value={formData.exam_type}
                onValueChange={(v) => setFormData({ ...formData, exam_type: v })}
              >
                <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>图标</Label>
              <Input
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="emoji 或图标"
              />
            </div>
            <div className="space-y-2">
              <Label>排序权重</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({ ...formData, sort_order: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="分类描述..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>启用状态</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>{isEdit ? "保存" : "创建"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function CourseCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<Subject | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(
    null
  );
  const [parentIdForNew, setParentIdForNew] = useState<number | null>(null);

  // Drag and drop state
  const [isDragMode, setIsDragMode] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    draggedId: null,
    draggedCategory: null,
    targetId: null,
    dropPosition: null,
  });

  // Batch selection state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params: { subject?: Subject } = {};
      if (subjectFilter !== "all") {
        params.subject = subjectFilter;
      }
      const result = await courseApi.getCategories(params);
      setCategories(result.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("加载分类失败");
    } finally {
      setLoading(false);
    }
  }, [subjectFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 新建分类
  const handleAddCategory = () => {
    setEditingCategory(null);
    setParentIdForNew(null);
    setDialogOpen(true);
  };

  // 添加子分类
  const handleAddChild = (parentId: number) => {
    setEditingCategory(null);
    setParentIdForNew(parentId);
    setDialogOpen(true);
  };

  // 编辑分类
  const handleEdit = (category: CourseCategory) => {
    setEditingCategory(category);
    setParentIdForNew(null);
    setDialogOpen(true);
  };

  // 删除分类
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该分类吗？删除后不可恢复。")) return;
    try {
      await courseApi.deleteCategory(id);
      toast.success("分类已删除");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // 提交表单
  const handleSubmit = async (
    data: CreateCategoryRequest | UpdateCategoryRequest
  ) => {
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

  // ============================================
  // Drag and Drop Handlers
  // ============================================

  // Flatten categories tree to get all categories with their parent info
  const flattenCategories = (
    cats: CourseCategory[],
    parentId: number | null = null
  ): Array<{ category: CourseCategory; parentId: number | null; siblings: CourseCategory[] }> => {
    const result: Array<{ category: CourseCategory; parentId: number | null; siblings: CourseCategory[] }> = [];
    for (const cat of cats) {
      result.push({ category: cat, parentId, siblings: cats });
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, cat.id));
      }
    }
    return result;
  };

  // Find category by id in the tree
  const findCategoryById = (
    cats: CourseCategory[],
    id: number
  ): CourseCategory | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Get siblings of a category (categories at the same level with same parent)
  const getSiblings = (
    cats: CourseCategory[],
    categoryId: number,
    parentId: number | null = null
  ): { siblings: CourseCategory[]; parentId: number | null } | null => {
    for (const cat of cats) {
      if (cat.id === categoryId) {
        return { siblings: cats, parentId };
      }
      if (cat.children) {
        const result = getSiblings(cat.children, categoryId, cat.id);
        if (result) return result;
      }
    }
    return null;
  };

  // Handle drag start
  const handleDragStart = (category: CourseCategory) => {
    setDragState({
      draggedId: category.id,
      draggedCategory: category,
      targetId: null,
      dropPosition: null,
    });
  };

  // Handle drag end (reset state)
  const handleDragEnd = () => {
    setDragState({
      draggedId: null,
      draggedCategory: null,
      targetId: null,
      dropPosition: null,
    });
  };

  // Handle drag over (update target)
  const handleDragOver = (
    categoryId: number,
    position: "before" | "after" | "inside"
  ) => {
    if (dragState.draggedId === categoryId) return;
    setDragState((prev) => ({
      ...prev,
      targetId: categoryId,
      dropPosition: position,
    }));
  };

  // Handle drop - calculate new sort orders and call API
  const handleDrop = async () => {
    const { draggedId, draggedCategory, targetId, dropPosition } = dragState;
    if (!draggedId || !targetId || !dropPosition || !draggedCategory) {
      handleDragEnd();
      return;
    }

    // Get target category info
    const targetInfo = getSiblings(categories, targetId);
    const draggedInfo = getSiblings(categories, draggedId);

    if (!targetInfo || !draggedInfo) {
      handleDragEnd();
      return;
    }

    // Build the reorder request based on the drop position
    const reorderItems: { id: number; sort_order: number }[] = [];

    if (dropPosition === "inside") {
      // Moving inside another category - just update the dragged item's sort order
      // For simplicity, we'll just put it at the end
      const targetCategory = findCategoryById(categories, targetId);
      const maxOrder = targetCategory?.children?.reduce(
        (max, c) => Math.max(max, c.sort_order),
        0
      ) || 0;
      reorderItems.push({ id: draggedId, sort_order: maxOrder + 10 });
    } else {
      // Moving before or after - recalculate sort orders for siblings
      const targetCategory = findCategoryById(categories, targetId);
      if (!targetCategory) {
        handleDragEnd();
        return;
      }

      // Only reorder if they're at the same level (same parent)
      if (targetInfo.parentId !== draggedInfo.parentId) {
        toast.info("跨层级排序暂不支持，请使用编辑功能调整");
        handleDragEnd();
        return;
      }

      // Get all siblings excluding the dragged item
      const siblings = targetInfo.siblings.filter((s) => s.id !== draggedId);
      const targetIndex = siblings.findIndex((s) => s.id === targetId);

      // Insert the dragged category at the appropriate position
      const newOrder = [...siblings];
      const insertIndex = dropPosition === "before" ? targetIndex : targetIndex + 1;
      newOrder.splice(insertIndex, 0, draggedCategory);

      // Calculate new sort orders (using increments of 10)
      newOrder.forEach((cat, index) => {
        reorderItems.push({ id: cat.id, sort_order: (index + 1) * 10 });
      });
    }

    // Reset drag state
    handleDragEnd();

    if (reorderItems.length === 0) return;

    // Call API to save the new order
    setReordering(true);
    try {
      await courseApi.reorderCategories({ items: reorderItems });
      toast.success("排序已更新");
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "排序更新失败");
    } finally {
      setReordering(false);
    }
  };

  // Toggle drag mode
  const toggleDragMode = () => {
    if (isDragMode) {
      // Exiting drag mode - reset drag state
      handleDragEnd();
    }
    setIsDragMode(!isDragMode);
    // Exit batch mode when entering drag mode
    if (!isDragMode) {
      setIsBatchMode(false);
      setSelectedIds(new Set());
    }
  };

  // ============================================
  // Batch Selection Handlers
  // ============================================

  // Toggle batch mode
  const toggleBatchMode = () => {
    if (isBatchMode) {
      // Exiting batch mode - clear selection
      setSelectedIds(new Set());
    }
    setIsBatchMode(!isBatchMode);
    // Exit drag mode when entering batch mode
    if (!isBatchMode) {
      setIsDragMode(false);
      handleDragEnd();
    }
  };

  // Toggle individual selection
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get all category IDs (flatten tree)
  const getAllCategoryIds = (cats: CourseCategory[]): number[] => {
    const ids: number[] = [];
    for (const cat of cats) {
      ids.push(cat.id);
      if (cat.children && cat.children.length > 0) {
        ids.push(...getAllCategoryIds(cat.children));
      }
    }
    return ids;
  };

  // Select all / deselect all
  const handleSelectAll = () => {
    const allIds = getAllCategoryIds(filteredCategories);
    if (selectedIds.size === allIds.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(allIds));
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error("请先选择要删除的分类");
      return;
    }
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个分类吗？删除后不可恢复。`)) {
      return;
    }
    setBatchLoading(true);
    try {
      const result = await courseApi.batchDeleteCategories(Array.from(selectedIds));
      if (result.succeeded > 0) {
        toast.success(`成功删除 ${result.succeeded} 个分类`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} 个分类删除失败`);
      }
      setSelectedIds(new Set());
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "批量删除失败");
    } finally {
      setBatchLoading(false);
    }
  };

  // Batch enable
  const handleBatchEnable = async () => {
    if (selectedIds.size === 0) {
      toast.error("请先选择要启用的分类");
      return;
    }
    setBatchLoading(true);
    try {
      const result = await courseApi.batchUpdateCategories(Array.from(selectedIds), {
        is_active: true,
      });
      if (result.succeeded > 0) {
        toast.success(`成功启用 ${result.succeeded} 个分类`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} 个分类启用失败`);
      }
      setSelectedIds(new Set());
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "批量启用失败");
    } finally {
      setBatchLoading(false);
    }
  };

  // Batch disable
  const handleBatchDisable = async () => {
    if (selectedIds.size === 0) {
      toast.error("请先选择要禁用的分类");
      return;
    }
    setBatchLoading(true);
    try {
      const result = await courseApi.batchUpdateCategories(Array.from(selectedIds), {
        is_active: false,
      });
      if (result.succeeded > 0) {
        toast.success(`成功禁用 ${result.succeeded} 个分类`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} 个分类禁用失败`);
      }
      setSelectedIds(new Set());
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "批量禁用失败");
    } finally {
      setBatchLoading(false);
    }
  };

  // 过滤分类（按搜索词）- 禁用在拖拽模式下
  const filteredCategories = isDragMode
    ? categories
    : categories.filter((cat) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          cat.name.toLowerCase().includes(term) ||
          cat.code.toLowerCase().includes(term)
        );
      });

  // 统计各科目分类数
  const subjectCounts = categories.reduce((acc, cat) => {
    acc[cat.subject] = (acc[cat.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-amber-500" />
            课程分类管理
          </h1>
          <p className="text-muted-foreground">管理公考学习包的课程分类体系</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isBatchMode ? "default" : "outline"}
            size="sm"
            onClick={toggleBatchMode}
            disabled={reordering || batchLoading}
            className={isBatchMode ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            {isBatchMode ? "退出批量" : "批量操作"}
          </Button>
          <Button
            variant={isDragMode ? "default" : "outline"}
            size="sm"
            onClick={toggleDragMode}
            disabled={reordering || isBatchMode}
            className={isDragMode ? "bg-amber-500 hover:bg-amber-600" : ""}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {isDragMode ? "完成排序" : "调整排序"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchCategories} disabled={isDragMode || isBatchMode}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button size="sm" onClick={handleAddCategory} disabled={isDragMode || isBatchMode}>
            <Plus className="mr-2 h-4 w-4" />
            新建分类
          </Button>
        </div>
      </div>

      {/* 批量操作模式提示和操作栏 */}
      {isBatchMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">批量操作模式</p>
                <p className="text-sm text-blue-600">
                  已选择 {selectedIds.size} 个分类
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={batchLoading}
              >
                {selectedIds.size === getAllCategoryIds(filteredCategories).length ? (
                  <>
                    <MinusSquare className="mr-2 h-4 w-4" />
                    取消全选
                  </>
                ) : (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    全选
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchEnable}
                disabled={batchLoading || selectedIds.size === 0}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <Power className="mr-2 h-4 w-4" />
                批量启用
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchDisable}
                disabled={batchLoading || selectedIds.size === 0}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <PowerOff className="mr-2 h-4 w-4" />
                批量禁用
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchDelete}
                disabled={batchLoading || selectedIds.size === 0}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                批量删除
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 拖拽模式提示 */}
      {isDragMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <GripVertical className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">排序模式已开启</p>
            <p className="text-sm text-amber-600">
              拖拽分类项可调整顺序。拖拽到目标位置上方/下方可插入，拖拽到目标中间可作为子分类。完成后点击"完成排序"按钮退出。
            </p>
          </div>
        </div>
      )}

      {/* 科目统计卡片 */}
      <div className={`grid gap-4 md:grid-cols-4 ${isDragMode || isBatchMode ? "opacity-60 pointer-events-none" : ""}`}>
        {(["xingce", "shenlun", "mianshi", "gongji"] as Subject[]).map(
          (subject) => (
            <Card
              key={subject}
              className={`cursor-pointer transition-colors ${
                subjectFilter === subject
                  ? "border-amber-500 bg-amber-50"
                  : "hover:border-muted-foreground/30"
              }`}
              onClick={() =>
                !isDragMode && !isBatchMode && setSubjectFilter(subjectFilter === subject ? "all" : subject)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getSubjectIcon(subject)}</span>
                    <div>
                      <p className="font-medium">{getSubjectName(subject)}</p>
                      <p className="text-sm text-muted-foreground">
                        {subjectCounts[subject] || 0} 个分类
                      </p>
                    </div>
                  </div>
                  {subjectFilter === subject && (
                    <Check className="h-5 w-5 text-amber-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* 分类列表 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                {isDragMode ? "拖拽调整排序" : isBatchMode ? "选择分类" : "分类列表"}
              </CardTitle>
              <CardDescription>
                {isDragMode ? (
                  "按住拖拽手柄拖动分类到目标位置"
                ) : isBatchMode ? (
                  "点击复选框选择要操作的分类"
                ) : (
                  <>
                    共 {filteredCategories.length} 个分类
                    {subjectFilter !== "all" &&
                      ` · 筛选: ${getSubjectName(subjectFilter)}`}
                  </>
                )}
              </CardDescription>
            </div>
            {!isDragMode && !isBatchMode && (
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索分类..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 flex-1 max-w-[200px]" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无分类</p>
              <p className="text-sm">点击"新建分类"开始创建</p>
            </div>
          ) : (
            <div className={`space-y-1 ${reordering || batchLoading ? "opacity-50 pointer-events-none" : ""}`}>
              {filteredCategories.map((category) => (
                <CategoryNode
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddChild={handleAddChild}
                  isDragMode={isDragMode}
                  dragState={dragState}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isBatchMode={isBatchMode}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分类表单弹窗 */}
      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        parentId={parentIdForNew}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
