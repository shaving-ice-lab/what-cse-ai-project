"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  RefreshCw,
  Eye,
  Play,
  Archive,
  Upload,
  Filter,
  Clock,
  Users,
  Star,
  Video,
  FileText,
  Headphones,
  CheckCircle,
  XCircle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  Avatar,
  AvatarFallback,
  AvatarImage,
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
  CourseStats,
  getSubjectName,
  getDifficultyLabel,
  getContentTypeLabel,
  getStatusLabel,
} from "@/services/course-api";
import { toast } from "sonner";

// ============================================
// Stats Cards Component
// ============================================

interface StatsCardsProps {
  stats?: CourseStats;
  loading: boolean;
}

function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: "总课程数",
      value: stats?.total_courses || 0,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "已发布",
      value: stats?.published_courses || 0,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "草稿",
      value: stats?.draft_courses || 0,
      icon: FileText,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "总学习人次",
      value: stats?.total_study_count || 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
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
// Course Form Dialog
// ============================================

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CourseCategory[];
  onSubmit: (data: CreateCourseRequest) => void;
}

function CourseFormDialog({
  open,
  onOpenChange,
  categories,
  onSubmit,
}: CourseFormDialogProps) {
  const [formData, setFormData] = useState<CreateCourseRequest>({
    category_id: 0,
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

  const handleSubmit = () => {
    if (!formData.title || !formData.category_id) {
      toast.error("请填写课程标题和选择分类");
      return;
    }
    onSubmit(formData);
    onOpenChange(false);
    setFormData({
      category_id: 0,
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

  // 扁平化分类用于选择
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建课程</DialogTitle>
          <DialogDescription>创建新的学习课程</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>课程标题 *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="输入课程标题"
            />
          </div>

          <div className="space-y-2">
            <Label>副标题</Label>
            <Input
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="输入副标题（可选）"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>发布状态</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as CourseStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">发布</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>课程简介</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="输入课程简介..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>讲师名称</Label>
              <Input
                value={formData.author_name}
                onChange={(e) =>
                  setFormData({ ...formData, author_name: e.target.value })
                }
                placeholder="讲师名称"
              />
            </div>
            <div className="space-y-2">
              <Label>封面图片URL</Label>
              <Input
                value={formData.cover_image}
                onChange={(e) =>
                  setFormData({ ...formData, cover_image: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_free}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_free: checked, vip_only: checked ? false : formData.vip_only })
                }
              />
              <Label>免费课程</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.vip_only}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, vip_only: checked, is_free: checked ? false : formData.is_free })
                }
              />
              <Label>VIP专属</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>创建课程</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function CourseManagementPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CourseStats | undefined>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CourseStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | "all">("all");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, categoriesRes, coursesRes] = await Promise.all([
        courseApi.getStats(),
        courseApi.getCategories(),
        courseApi.getCourses({
          page,
          page_size: pageSize,
          keyword: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          category_id: categoryFilter !== "all" ? categoryFilter : undefined,
          content_type: contentTypeFilter !== "all" ? contentTypeFilter : undefined,
        }),
      ]);

      setStats(statsRes);
      setCategories(categoriesRes.categories || []);
      setCourses(coursesRes.courses || []);
      setTotal(coursesRes.total || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, categoryFilter, contentTypeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 创建课程
  const handleCreateCourse = async (data: CreateCourseRequest) => {
    try {
      await courseApi.createCourse(data);
      toast.success("课程已创建");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "创建失败");
    }
  };

  // 发布课程
  const handlePublish = async (id: number) => {
    try {
      await courseApi.publishCourse(id);
      toast.success("课程已发布");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "发布失败");
    }
  };

  // 下架课程
  const handleArchive = async (id: number) => {
    if (!confirm("确定要下架该课程吗？")) return;
    try {
      await courseApi.archiveCourse(id);
      toast.success("课程已下架");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "下架失败");
    }
  };

  // 删除课程
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该课程吗？删除后不可恢复。")) return;
    try {
      await courseApi.deleteCourse(id);
      toast.success("课程已删除");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // 扁平化分类用于选择
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
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-500" />
            课程管理
          </h1>
          <p className="text-muted-foreground">管理公考学习包的课程内容</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建课程
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <StatsCards stats={stats} loading={loading} />

      {/* 课程列表 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>课程列表</CardTitle>
                <CardDescription>共 {total} 门课程</CardDescription>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索课程..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as CourseStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="archived">已下架</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter === "all" ? "all" : categoryFilter.toString()}
                onValueChange={(v) => {
                  setCategoryFilter(v === "all" ? "all" : Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px]">
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
                value={contentTypeFilter}
                onValueChange={(v) => {
                  setContentTypeFilter(v as ContentType | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="document">文档</SelectItem>
                  <SelectItem value="audio">音频</SelectItem>
                  <SelectItem value="mixed">综合</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-16 w-24 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无课程</p>
              <p className="text-sm">点击"新建课程"开始创建</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">课程</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>难度</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>学习人次</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                              {course.cover_image ? (
                                <img
                                  src={course.cover_image}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ContentTypeIcon
                                  type={course.content_type}
                                  className="h-6 w-6 text-muted-foreground"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{course.title}</p>
                              {course.subtitle && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {course.subtitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {course.category?.name || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ContentTypeIcon
                              type={course.content_type}
                              className="h-4 w-4 text-muted-foreground"
                            />
                            <span className="text-sm">
                              {getContentTypeLabel(course.content_type)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              course.difficulty === "beginner"
                                ? "secondary"
                                : course.difficulty === "intermediate"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {getDifficultyLabel(course.difficulty)}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                          {course.is_free && (
                            <Badge variant="outline" className="ml-1 bg-green-50 text-green-700">
                              免费
                            </Badge>
                          )}
                          {course.vip_only && (
                            <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700">
                              VIP
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {course.study_count.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/learning/courses/${course.id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  编辑
                                </Link>
                              </DropdownMenuItem>
                              {course.status === "draft" && (
                                <DropdownMenuItem onClick={() => handlePublish(course.id)}>
                                  <Play className="mr-2 h-4 w-4" />
                                  发布
                                </DropdownMenuItem>
                              )}
                              {course.status === "published" && (
                                <DropdownMenuItem onClick={() => handleArchive(course.id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  下架
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(course.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
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
            </>
          )}
        </CardContent>
      </Card>

      {/* 新建课程对话框 */}
      <CourseFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        categories={categories}
        onSubmit={handleCreateCourse}
      />
    </div>
  );
}
