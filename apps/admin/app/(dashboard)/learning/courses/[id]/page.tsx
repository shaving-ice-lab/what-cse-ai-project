"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Save,
  Play,
  Archive,
  Trash2,
  Plus,
  Edit,
  GripVertical,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Video,
  FileText,
  Headphones,
  Clock,
  Eye,
  ImagePlus,
  Upload,
  Star,
  RefreshCw,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  ScrollArea,
} from "@what-cse/ui";
import {
  courseApi,
  Course,
  CourseCategory,
  CourseChapter,
  CourseStatus,
  ContentType,
  Difficulty,
  UpdateCourseRequest,
  CreateChapterRequest,
  UpdateChapterRequest,
  getDifficultyLabel,
  getContentTypeLabel,
  getStatusLabel,
} from "@/services/course-api";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";

// ============================================
// Content Type Icon
// ============================================

function ContentTypeIcon({
  type,
  className,
}: {
  type: ContentType;
  className?: string;
}) {
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
// Chapter Form Dialog
// ============================================

interface ChapterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  chapter?: CourseChapter | null;
  parentId?: number;
  onSubmit: (data: CreateChapterRequest | UpdateChapterRequest, isEdit: boolean) => void;
}

function ChapterFormDialog({
  open,
  onOpenChange,
  courseId,
  chapter,
  parentId,
  onSubmit,
}: ChapterFormDialogProps) {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{chapter ? "编辑章节" : "新建章节"}</DialogTitle>
          <DialogDescription>
            {chapter ? "修改章节信息" : "添加新的课程章节"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>章节标题 *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="输入章节标题"
            />
          </div>

          <div className="space-y-2">
            <Label>章节描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="章节描述（可选）"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>内容类型</Label>
              <Select
                value={formData.content_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, content_type: v as ContentType })
                }
              >
                <SelectTrigger>
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
              <Label>时长（分钟）</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>内容URL</Label>
            <Input
              value={formData.content_url}
              onChange={(e) =>
                setFormData({ ...formData, content_url: e.target.value })
              }
              placeholder="视频/音频/文档地址"
            />
          </div>

          {(formData.content_type === "document" || formData.content_type === "mixed") && (
            <div className="space-y-2">
              <Label>文本内容</Label>
              <RichTextEditor
                value={formData.content_text || ""}
                onChange={(value) =>
                  setFormData({ ...formData, content_text: value })
                }
                placeholder="在这里编辑文档内容..."
                minHeight="150px"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_free_preview}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_free_preview: checked })
              }
            />
            <Label>可免费试看</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            {chapter ? "保存修改" : "创建章节"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Chapter Tree Item
// ============================================

interface ChapterTreeItemProps {
  chapter: CourseChapter;
  level: number;
  onEdit: (chapter: CourseChapter) => void;
  onDelete: (chapter: CourseChapter) => void;
  onAddChild: (parentId: number) => void;
}

function ChapterTreeItem({
  chapter,
  level,
  onEdit,
  onDelete,
  onAddChild,
}: ChapterTreeItemProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = chapter.children && chapter.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors ${
          level > 0 ? "ml-6" : ""
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          
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

          <ContentTypeIcon
            type={chapter.content_type}
            className="h-4 w-4 text-muted-foreground"
          />
          
          <div className="flex-1">
            <p className="font-medium">{chapter.title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{getContentTypeLabel(chapter.content_type)}</span>
              {chapter.duration_minutes > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {chapter.duration_minutes}分钟
                  </span>
                </>
              )}
              {chapter.is_free_preview && (
                <Badge variant="secondary" className="text-xs">
                  试看
                </Badge>
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
            <DropdownMenuItem onClick={() => onEdit(chapter)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            {level < 2 && (
              <DropdownMenuItem onClick={() => onAddChild(chapter.id)}>
                <Plus className="mr-2 h-4 w-4" />
                添加子章节
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(chapter)}
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
          {chapter.children!.map((child) => (
            <ChapterTreeItem
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

// ============================================
// Main Page Component
// ============================================

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);

  // Form state
  const [formData, setFormData] = useState<UpdateCourseRequest>({});

  // Chapter dialog state
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CourseChapter | null>(null);
  const [parentChapterId, setParentChapterId] = useState<number | undefined>(undefined);

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
      const [courseRes, categoriesRes, chaptersRes] = await Promise.all([
        courseApi.getCourse(courseId),
        courseApi.getCategories(),
        courseApi.getChapters(courseId),
      ]);

      setCourse(courseRes);
      setCategories(categoriesRes.categories || []);
      setChapters(chaptersRes.chapters || []);
      
      // 初始化表单数据
      setFormData({
        category_id: courseRes.category_id,
        title: courseRes.title,
        subtitle: courseRes.subtitle,
        description: courseRes.description,
        cover_image: courseRes.cover_image,
        content_type: courseRes.content_type,
        difficulty: courseRes.difficulty,
        author_name: courseRes.author_name,
        author_avatar: courseRes.author_avatar,
        author_intro: courseRes.author_intro,
        is_free: courseRes.is_free,
        price: courseRes.price,
        vip_only: courseRes.vip_only,
        sort_order: courseRes.sort_order,
        status: courseRes.status,
      });
    } catch (error) {
      console.error("Failed to fetch course:", error);
      toast.error("加载课程失败");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId, fetchData]);

  // 保存课程
  const handleSave = async () => {
    setSaving(true);
    try {
      await courseApi.updateCourse(courseId, formData);
      toast.success("保存成功");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 发布课程
  const handlePublish = async () => {
    try {
      await courseApi.publishCourse(courseId);
      toast.success("课程已发布");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "发布失败");
    }
  };

  // 下架课程
  const handleArchive = async () => {
    if (!confirm("确定要下架该课程吗？")) return;
    try {
      await courseApi.archiveCourse(courseId);
      toast.success("课程已下架");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "下架失败");
    }
  };

  // 删除课程
  const handleDelete = async () => {
    if (!confirm("确定要删除该课程吗？删除后不可恢复。")) return;
    try {
      await courseApi.deleteCourse(courseId);
      toast.success("课程已删除");
      router.push("/learning/courses");
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // 章节操作
  const handleAddChapter = (parentId?: number) => {
    setEditingChapter(null);
    setParentChapterId(parentId);
    setChapterDialogOpen(true);
  };

  const handleEditChapter = (chapter: CourseChapter) => {
    setEditingChapter(chapter);
    setParentChapterId(chapter.parent_id);
    setChapterDialogOpen(true);
  };

  const handleDeleteChapter = async (chapter: CourseChapter) => {
    if (!confirm(`确定要删除章节"${chapter.title}"吗？`)) return;
    try {
      await courseApi.deleteChapter(chapter.id);
      toast.success("章节已删除");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  const handleChapterSubmit = async (
    data: CreateChapterRequest | UpdateChapterRequest,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && editingChapter) {
        await courseApi.updateChapter(editingChapter.id, data as UpdateChapterRequest);
        toast.success("章节已更新");
      } else {
        await courseApi.createChapter(data as CreateChapterRequest);
        toast.success("章节已创建");
      }
      setChapterDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">课程不存在</p>
        <Button asChild className="mt-4">
          <Link href="/learning/courses">返回课程列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 面包屑导航 */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/learning/courses">课程管理</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{course.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/learning/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-500" />
              编辑课程
            </h1>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              course.status === "published"
                ? "default"
                : course.status === "archived"
                ? "secondary"
                : "outline"
            }
          >
            {getStatusLabel(course.status)}
          </Badge>
          {course.status === "draft" && (
            <Button onClick={handlePublish}>
              <Play className="mr-2 h-4 w-4" />
              发布
            </Button>
          )}
          {course.status === "published" && (
            <Button variant="outline" onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              下架
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      {/* 编辑内容 */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="chapters">
            章节管理 ({chapters.length})
          </TabsTrigger>
          <TabsTrigger value="settings">发布设置</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>课程信息</CardTitle>
              <CardDescription>编辑课程的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>课程标题 *</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="输入课程标题"
                  />
                </div>

                <div className="space-y-2">
                  <Label>副标题</Label>
                  <Input
                    value={formData.subtitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="输入副标题（可选）"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>课程简介</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="详细描述课程内容..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>所属分类</Label>
                  <Select
                    value={formData.category_id?.toString()}
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
                  <Label>内容类型</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, content_type: v as ContentType })
                    }
                  >
                    <SelectTrigger>
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
                  <Label>难度级别</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v) =>
                      setFormData({ ...formData, difficulty: v as Difficulty })
                    }
                  >
                    <SelectTrigger>
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

              <Separator />

              <div>
                <h3 className="font-medium mb-4">封面图片</h3>
                <div className="flex items-start gap-6">
                  <div className="w-48 h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted">
                    {formData.cover_image ? (
                      <img
                        src={formData.cover_image}
                        alt="封面"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImagePlus className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">暂无封面</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>封面图片URL</Label>
                    <Input
                      value={formData.cover_image || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, cover_image: e.target.value })
                      }
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground">
                      推荐尺寸：16:9 比例，至少 1280x720 像素
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">讲师信息</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>讲师名称</Label>
                    <Input
                      value={formData.author_name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, author_name: e.target.value })
                      }
                      placeholder="讲师名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>讲师头像URL</Label>
                    <Input
                      value={formData.author_avatar || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, author_avatar: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label>讲师介绍</Label>
                  <Textarea
                    value={formData.author_intro || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, author_intro: e.target.value })
                    }
                    placeholder="讲师简介..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 章节管理 */}
        <TabsContent value="chapters" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>章节列表</CardTitle>
                  <CardDescription>
                    管理课程章节，支持多级目录结构
                  </CardDescription>
                </div>
                <Button onClick={() => handleAddChapter()}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加章节
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {chapters.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无章节</p>
                  <p className="text-sm">点击"添加章节"开始创建</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <ChapterTreeItem
                        key={chapter.id}
                        chapter={chapter}
                        level={0}
                        onEdit={handleEditChapter}
                        onDelete={handleDeleteChapter}
                        onAddChild={handleAddChapter}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 发布设置 */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>定价设置</CardTitle>
              <CardDescription>设置课程的访问权限和价格</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">免费课程</p>
                  <p className="text-sm text-muted-foreground">
                    所有用户都可以免费学习
                  </p>
                </div>
                <Switch
                  checked={formData.is_free}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      is_free: checked,
                      vip_only: checked ? false : formData.vip_only,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">VIP专属</p>
                  <p className="text-sm text-muted-foreground">
                    仅VIP会员可以学习
                  </p>
                </div>
                <Switch
                  checked={formData.vip_only}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      vip_only: checked,
                      is_free: checked ? false : formData.is_free,
                    })
                  }
                />
              </div>

              {!formData.is_free && !formData.vip_only && (
                <div className="space-y-2">
                  <Label>单独购买价格（元）</Label>
                  <Input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || undefined,
                      })
                    }
                    placeholder="0.00"
                    className="w-48"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>课程统计</CardTitle>
              <CardDescription>查看课程的学习数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{course.view_count}</p>
                  <p className="text-sm text-muted-foreground">浏览量</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BookOpen className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{course.study_count}</p>
                  <p className="text-sm text-muted-foreground">学习人次</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{course.like_count}</p>
                  <p className="text-sm text-muted-foreground">点赞</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{course.chapter_count}</p>
                  <p className="text-sm text-muted-foreground">章节数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">危险操作</CardTitle>
              <CardDescription>以下操作不可撤销，请谨慎操作</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                删除课程
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 章节编辑对话框 */}
      <ChapterFormDialog
        open={chapterDialogOpen}
        onOpenChange={setChapterDialogOpen}
        courseId={courseId}
        chapter={editingChapter}
        parentId={parentChapterId}
        onSubmit={handleChapterSubmit}
      />
    </div>
  );
}
