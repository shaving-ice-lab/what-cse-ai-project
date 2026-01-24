"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Play,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@what-cse/ui";
import { adminApi, ListPage } from "@/services/api";

const CRAWL_FREQUENCIES = [
  { value: "hourly", label: "每小时" },
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
];

const CATEGORIES = [
  { value: "national_exam", label: "国考" },
  { value: "provincial_exam", label: "省考" },
  { value: "public_institution", label: "事业单位" },
  { value: "selection_transfer", label: "选调生" },
  { value: "other", label: "其他" },
];

interface ListPageFormData {
  url: string;
  source_name: string;
  category: string;
  crawl_frequency: string;
  article_selector: string;
  pagination_pattern: string;
}

const defaultFormData: ListPageFormData = {
  url: "",
  source_name: "",
  category: "",
  crawl_frequency: "daily",
  article_selector: "",
  pagination_pattern: "",
};

export default function ListPagesPage() {
  const [listPages, setListPages] = useState<ListPage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<ListPage | null>(null);
  const [formData, setFormData] = useState<ListPageFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await adminApi.getListPages({ page, page_size: pageSize });
      setListPages((res as any).list_pages || []);
      setTotal((res as any).total || 0);
    } catch (error) {
      console.error("Failed to fetch list pages:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await adminApi.createListPage(formData);
      setIsCreateDialogOpen(false);
      setFormData(defaultFormData);
      fetchData();
    } catch (error) {
      console.error("Failed to create list page:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPage) return;
    setSubmitting(true);
    try {
      await adminApi.updateListPage(selectedPage.id, {
        source_name: formData.source_name,
        category: formData.category,
        crawl_frequency: formData.crawl_frequency,
        article_selector: formData.article_selector,
        pagination_pattern: formData.pagination_pattern,
      });
      setIsEditDialogOpen(false);
      setSelectedPage(null);
      setFormData(defaultFormData);
      fetchData();
    } catch (error) {
      console.error("Failed to update list page:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPage) return;
    setSubmitting(true);
    try {
      await adminApi.deleteListPage(selectedPage.id);
      setIsDeleteDialogOpen(false);
      setSelectedPage(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete list page:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (listPage: ListPage) => {
    try {
      const newStatus = listPage.status === "active" ? "inactive" : "active";
      await adminApi.updateListPage(listPage.id, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleTest = async (listPage: ListPage) => {
    setSelectedPage(listPage);
    setIsTestDialogOpen(true);
    setTesting(true);
    setTestResult(null);
    try {
      const result = await adminApi.testListPageCrawl(listPage.id);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: String(error) });
    } finally {
      setTesting(false);
    }
  };

  const openEditDialog = (listPage: ListPage) => {
    setSelectedPage(listPage);
    setFormData({
      url: listPage.url,
      source_name: listPage.source_name,
      category: listPage.category,
      crawl_frequency: listPage.crawl_frequency,
      article_selector: listPage.article_selector,
      pagination_pattern: listPage.pagination_pattern,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (listPage: ListPage) => {
    setSelectedPage(listPage);
    setIsDeleteDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge>启用</Badge>;
      case "error":
        return <Badge variant="destructive">异常</Badge>;
      default:
        return <Badge variant="secondary">停用</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  const getFrequencyLabel = (value: string) => {
    return CRAWL_FREQUENCIES.find((f) => f.value === value)?.label || value;
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">列表页管理</h1>
          <p className="text-muted-foreground">管理监控的数据源列表页</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            添加列表页
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总列表页</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">启用中</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {listPages.filter((p) => p.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总文章数</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {listPages.reduce((sum, p) => sum + p.article_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 列表页表格 */}
      <Card>
        <CardHeader>
          <CardTitle>列表页</CardTitle>
          <CardDescription>管理所有监控的数据源列表页</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>来源名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="hidden md:table-cell">频率</TableHead>
                  <TableHead className="hidden lg:table-cell">文章数</TableHead>
                  <TableHead className="hidden lg:table-cell">上次爬取</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暂无列表页，点击"添加列表页"添加
                    </TableCell>
                  </TableRow>
                ) : (
                  listPages.map((listPage) => (
                    <TableRow key={listPage.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(listPage.status)}
                          <div>
                            <div className="font-medium">{listPage.source_name || "未命名"}</div>
                            <a
                              href={listPage.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                              {new URL(listPage.url).hostname}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryLabel(listPage.category)}</TableCell>
                      <TableCell>{getStatusBadge(listPage.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getFrequencyLabel(listPage.crawl_frequency)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-medium">
                        {listPage.article_count}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Clock className="h-3 w-3" />
                          {formatDate(listPage.last_crawl_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">操作</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleTest(listPage)}>
                              <Play className="mr-2 h-4 w-4" />
                              测试爬取
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(listPage)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(listPage)}>
                              {listPage.status === "active" ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  停用
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  启用
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(listPage)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>添加列表页</DialogTitle>
            <DialogDescription>添加新的数据源列表页进行监控</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">列表页URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com/list"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source_name">来源名称</Label>
              <Input
                id="source_name"
                placeholder="例如：国家公务员局"
                value={formData.source_name}
                onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>分类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>爬取频率</Label>
                <Select
                  value={formData.crawl_frequency}
                  onValueChange={(value) => setFormData({ ...formData, crawl_frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择频率" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRAWL_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="article_selector">文章选择器 (CSS)</Label>
              <Input
                id="article_selector"
                placeholder="例如：.list-item a"
                value={formData.article_selector}
                onChange={(e) => setFormData({ ...formData, article_selector: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pagination_pattern">分页模式</Label>
              <Input
                id="pagination_pattern"
                placeholder="例如：?page={n}"
                value={formData.pagination_pattern}
                onChange={(e) => setFormData({ ...formData, pagination_pattern: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={submitting || !formData.url}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑列表页</DialogTitle>
            <DialogDescription>修改列表页配置</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>列表页URL</Label>
              <Input value={formData.url} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_source_name">来源名称</Label>
              <Input
                id="edit_source_name"
                placeholder="例如：国家公务员局"
                value={formData.source_name}
                onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>分类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>爬取频率</Label>
                <Select
                  value={formData.crawl_frequency}
                  onValueChange={(value) => setFormData({ ...formData, crawl_frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择频率" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRAWL_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_article_selector">文章选择器 (CSS)</Label>
              <Input
                id="edit_article_selector"
                placeholder="例如：.list-item a"
                value={formData.article_selector}
                onChange={(e) => setFormData({ ...formData, article_selector: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_pagination_pattern">分页模式</Label>
              <Input
                id="edit_pagination_pattern"
                placeholder="例如：?page={n}"
                value={formData.pagination_pattern}
                onChange={(e) => setFormData({ ...formData, pagination_pattern: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除列表页 "{selectedPage?.source_name || selectedPage?.url}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Result Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>测试爬取结果</DialogTitle>
            <DialogDescription>
              {selectedPage?.source_name || selectedPage?.url}
            </DialogDescription>
          </DialogHeader>
          {testing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">正在测试...</span>
            </div>
          ) : testResult ? (
            <div className="space-y-4">
              {testResult.success ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">发现文章</div>
                      <div className="text-2xl font-bold">{testResult.total_found}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">请求数</div>
                      <div className="text-2xl font-bold">{testResult.request_count}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">新文章</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {testResult.new_articles}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">耗时</div>
                      <div className="text-2xl font-bold">{testResult.duration_ms}ms</div>
                    </div>
                  </div>
                  {testResult.sample_articles && testResult.sample_articles.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">示例文章</div>
                      <ul className="space-y-2">
                        {testResult.sample_articles.map((article: any, idx: number) => (
                          <li key={idx} className="text-sm">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary flex items-center gap-1"
                            >
                              {article.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                  测试失败: {testResult.error}
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setIsTestDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
