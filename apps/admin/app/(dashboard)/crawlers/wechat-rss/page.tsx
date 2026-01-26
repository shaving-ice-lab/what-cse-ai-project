"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Loader2,
  Rss,
  BookOpen,
  Star,
  StarOff,
  Check,
  CheckCheck,
  AlertCircle,
  Pause,
  Play,
  Settings,
  Search,
  Filter,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  Link2,
  Sparkles,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@what-cse/ui";
import {
  wechatRssApi,
  WechatRSSSource,
  WechatRSSArticle,
  WechatRSSStats,
  WechatRSSSourceType,
  WechatRSSSourceStatus,
  WechatRSSReadStatus,
} from "@/services/api";

export default function WechatRSSPage() {
  // State
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<WechatRSSSource[]>([]);
  const [articles, setArticles] = useState<WechatRSSArticle[]>([]);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [articlesPage, setArticlesPage] = useState(1);
  const [stats, setStats] = useState<WechatRSSStats | null>(null);

  // Dialog states
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<WechatRSSSource | null>(null);
  const [sourceForm, setSourceForm] = useState({
    name: "",
    wechat_id: "",
    rss_url: "",
    source_type: "custom" as WechatRSSSourceType,
    crawl_frequency: 60,
    description: "",
  });
  const [articleSheetOpen, setArticleSheetOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<WechatRSSArticle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<WechatRSSSource | null>(null);

  // Quick add dialog (paste article URL)
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false);
  const [articleUrlInput, setArticleUrlInput] = useState("");
  const [parsingArticle, setParsingArticle] = useState(false);
  const [parseStatus, setParseStatus] = useState<string>(""); // 解析状态提示
  const [parseError, setParseError] = useState<string>(""); // 解析错误信息
  const [parsedInfo, setParsedInfo] = useState<{
    biz: string;
    title?: string;
    author?: string;
    rss_urls: string[];
    extraction_method?: string; // 提取方式
  } | null>(null);
  const [creatingFromArticle, setCreatingFromArticle] = useState(false);

  // Loading states
  const [saving, setSaving] = useState(false);
  const [crawling, setCrawling] = useState<number | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    title?: string;
    item_count?: number;
  } | null>(null);

  // Filter states
  const [filterSource, setFilterSource] = useState<string>("");
  const [filterReadStatus, setFilterReadStatus] = useState<string>("");
  const [filterKeyword, setFilterKeyword] = useState("");

  // Active tab
  const [activeTab, setActiveTab] = useState("sources");

  // Fetch sources
  const fetchSources = useCallback(async () => {
    try {
      const res = await wechatRssApi.getSources();
      if (res.data) {
        setSources(res.data.sources || []);
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error);
    }
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      const res = await wechatRssApi.getArticles({
        source_id: filterSource ? parseInt(filterSource) : undefined,
        read_status: filterReadStatus as WechatRSSReadStatus || undefined,
        keyword: filterKeyword || undefined,
        page: articlesPage,
        page_size: 20,
      });
      if (res.data) {
        setArticles(res.data.articles || []);
        setArticlesTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    }
  }, [filterSource, filterReadStatus, filterKeyword, articlesPage]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await wechatRssApi.getStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchSources(), fetchStats()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchSources, fetchStats]);

  // Fetch articles when tab changes or filters change
  useEffect(() => {
    if (activeTab === "articles") {
      fetchArticles();
    }
  }, [activeTab, fetchArticles]);

  // Validate RSS URL
  const handleValidateURL = async () => {
    if (!sourceForm.rss_url) return;
    
    setValidating(true);
    setValidationResult(null);
    try {
      const res = await wechatRssApi.validateRSSURL(sourceForm.rss_url);
      if (res.data) {
        setValidationResult({
          valid: res.data.valid,
          title: res.data.title,
          item_count: res.data.item_count,
        });
        if (res.data.valid && res.data.title && !sourceForm.name) {
          setSourceForm(prev => ({ ...prev, name: res.data.title || "" }));
        }
      }
    } catch {
      setValidationResult({ valid: false });
    } finally {
      setValidating(false);
    }
  };

  // Save source
  const handleSaveSource = async () => {
    if (!sourceForm.rss_url || !sourceForm.name) return;

    setSaving(true);
    try {
      if (editingSource) {
        await wechatRssApi.updateSource(editingSource.id, {
          name: sourceForm.name,
          wechat_id: sourceForm.wechat_id || undefined,
          rss_url: sourceForm.rss_url,
          source_type: sourceForm.source_type,
          crawl_frequency: sourceForm.crawl_frequency,
          description: sourceForm.description || undefined,
        });
      } else {
        await wechatRssApi.createSource({
          name: sourceForm.name,
          wechat_id: sourceForm.wechat_id || undefined,
          rss_url: sourceForm.rss_url,
          source_type: sourceForm.source_type,
          crawl_frequency: sourceForm.crawl_frequency,
          description: sourceForm.description || undefined,
        });
      }
      setSourceDialogOpen(false);
      resetSourceForm();
      fetchSources();
      fetchStats();
    } catch (error) {
      console.error("Failed to save source:", error);
    } finally {
      setSaving(false);
    }
  };

  // Delete source
  const handleDeleteSource = async () => {
    if (!sourceToDelete) return;

    try {
      await wechatRssApi.deleteSource(sourceToDelete.id);
      setDeleteDialogOpen(false);
      setSourceToDelete(null);
      fetchSources();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete source:", error);
    }
  };

  // Crawl source
  const handleCrawlSource = async (sourceId: number) => {
    setCrawling(sourceId);
    try {
      await wechatRssApi.crawlSource(sourceId);
      fetchSources();
      fetchStats();
      if (activeTab === "articles") {
        fetchArticles();
      }
    } catch (error) {
      console.error("Failed to crawl source:", error);
    } finally {
      setCrawling(null);
    }
  };

  // Toggle source status
  const handleToggleSourceStatus = async (source: WechatRSSSource) => {
    const newStatus: WechatRSSSourceStatus = source.status === "active" ? "paused" : "active";
    try {
      await wechatRssApi.updateSource(source.id, { status: newStatus });
      fetchSources();
    } catch (error) {
      console.error("Failed to toggle source status:", error);
    }
  };

  // Mark article as read
  const handleMarkRead = async (articleId: number) => {
    try {
      await wechatRssApi.markArticleRead(articleId);
      fetchArticles();
      fetchStats();
    } catch (error) {
      console.error("Failed to mark article as read:", error);
    }
  };

  // Toggle article star
  const handleToggleStar = async (articleId: number) => {
    try {
      await wechatRssApi.toggleArticleStar(articleId);
      fetchArticles();
      fetchStats();
    } catch (error) {
      console.error("Failed to toggle star:", error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const sourceId = filterSource ? parseInt(filterSource) : undefined;
      await wechatRssApi.markAllAsRead(sourceId);
      fetchArticles();
      fetchStats();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Reset source form
  const resetSourceForm = () => {
    setSourceForm({
      name: "",
      wechat_id: "",
      rss_url: "",
      source_type: "custom",
      crawl_frequency: 60,
      description: "",
    });
    setEditingSource(null);
    setValidationResult(null);
  };

  // Parse article URL
  const handleParseArticleURL = async () => {
    if (!articleUrlInput) return;
    
    setParsingArticle(true);
    setParsedInfo(null);
    setParseError("");
    setParseStatus("正在获取文章页面...");
    
    try {
      setParseStatus("正在解析页面内容，提取公众号信息...");
      const res = await wechatRssApi.parseArticleURL(articleUrlInput);
      // 响应拦截器已经返回 data.data，所以直接使用 res
      if (res) {
        setParseStatus("");
        setParsedInfo({
          biz: res.biz,
          title: res.title,
          author: res.author,
          rss_urls: res.rss_urls,
          extraction_method: res.extraction_method,
        });
      }
    } catch (error: unknown) {
      console.error("Failed to parse article URL:", error);
      setParseStatus("");
      const errMsg = error instanceof Error ? error.message : "解析失败";
      // 提取更友好的错误信息
      if (errMsg.includes("环境异常") || errMsg.includes("验证")) {
        setParseError("微信检测到服务器访问，请复制浏览器中包含 __biz= 参数的完整URL");
      } else if (errMsg.includes("biz") || errMsg.includes("__biz")) {
        setParseError("无法提取公众号ID，请使用包含 __biz= 参数的完整文章链接");
      } else {
        setParseError(errMsg);
      }
    } finally {
      setParsingArticle(false);
    }
  };

  // Create from article URL
  const handleCreateFromArticle = async () => {
    if (!articleUrlInput) return;
    
    setCreatingFromArticle(true);
    try {
      const res = await wechatRssApi.createFromArticle(articleUrlInput);
      // 响应拦截器已经返回 data.data，所以直接使用 res
      if (res) {
        setQuickAddDialogOpen(false);
        setArticleUrlInput("");
        setParsedInfo(null);
        fetchSources();
        fetchStats();
        alert("订阅创建成功！");
      }
    } catch (error: unknown) {
      console.error("Failed to create from article:", error);
      const errMsg = error instanceof Error ? error.message : "创建失败";
      alert(errMsg);
    } finally {
      setCreatingFromArticle(false);
    }
  };

  // Reset quick add dialog
  const resetQuickAddDialog = () => {
    setArticleUrlInput("");
    setParsedInfo(null);
    setParseStatus("");
    setParseError("");
  };

  // Open edit dialog
  const openEditDialog = (source: WechatRSSSource) => {
    setEditingSource(source);
    setSourceForm({
      name: source.name,
      wechat_id: source.wechat_id || "",
      rss_url: source.rss_url,
      source_type: source.source_type,
      crawl_frequency: source.crawl_frequency,
      description: source.description || "",
    });
    setSourceDialogOpen(true);
  };

  // View article
  const handleViewArticle = async (article: WechatRSSArticle) => {
    setSelectedArticle(article);
    setArticleSheetOpen(true);
    if (article.read_status === "unread") {
      await handleMarkRead(article.id);
    }
  };

  // Copy RSS URL
  const handleCopyRSSUrl = (sourceId: number) => {
    const url = `${window.location.origin}/rss/wechat/${sourceId}`;
    navigator.clipboard.writeText(url);
  };

  // Format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  // Get status badge
  const getStatusBadge = (status: WechatRSSSourceStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success">正常</Badge>;
      case "paused":
        return <Badge variant="secondary">已暂停</Badge>;
      case "error":
        return <Badge variant="destructive">错误</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get read status badge
  const getReadStatusBadge = (status: WechatRSSReadStatus) => {
    switch (status) {
      case "unread":
        return <Badge variant="default">未读</Badge>;
      case "read":
        return <Badge variant="secondary">已读</Badge>;
      case "starred":
        return <Badge variant="warning">收藏</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">公众号RSS</h1>
          <p className="text-muted-foreground">
            订阅微信公众号RSS源，自动抓取文章
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => { resetQuickAddDialog(); setQuickAddDialogOpen(true); }}
          >
            <Link2 className="mr-2 h-4 w-4" />
            粘贴文章链接
          </Button>
          <Button onClick={() => { resetSourceForm(); setSourceDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            添加订阅
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">订阅源</CardTitle>
            <Rss className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_sources || 0}</div>
            <p className="text-xs text-muted-foreground">
              活跃 {stats?.active_sources || 0} / 暂停 {stats?.paused_sources || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">文章总数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_articles || 0}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 {stats?.today_articles || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未读文章</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats?.unread_articles || 0}</div>
            <p className="text-xs text-muted-foreground">
              待阅读
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">收藏文章</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats?.starred_articles || 0}</div>
            <p className="text-xs text-muted-foreground">
              已收藏
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sources">订阅源管理</TabsTrigger>
          <TabsTrigger value="articles">文章列表</TabsTrigger>
        </TabsList>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>订阅源列表</CardTitle>
              <CardDescription>
                管理你的微信公众号RSS订阅源
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Rss className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">暂无订阅源</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    点击上方按钮添加你的第一个RSS订阅源
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>文章数</TableHead>
                      <TableHead>未读</TableHead>
                      <TableHead>抓取频率</TableHead>
                      <TableHead>最后抓取</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{source.name}</span>
                            {source.wechat_id && (
                              <span className="text-xs text-muted-foreground">
                                @{source.wechat_id}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{source.source_type_text}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(source.status)}</TableCell>
                        <TableCell>{source.article_count}</TableCell>
                        <TableCell>
                          {source.unread_count > 0 ? (
                            <Badge variant="destructive">{source.unread_count}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>{source.crawl_frequency}分钟</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(source.last_crawl_at)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCrawlSource(source.id)}
                              disabled={crawling === source.id}
                              title="立即抓取"
                            >
                              {crawling === source.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleSourceStatus(source)}
                              title={source.status === "active" ? "暂停" : "启用"}
                            >
                              {source.status === "active" ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyRSSUrl(source.id)}
                              title="复制RSS地址"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(source)}
                              title="编辑"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSourceToDelete(source);
                                setDeleteDialogOpen(true);
                              }}
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="全部订阅源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部订阅源</SelectItem>
                      {sources.map((source) => (
                        <SelectItem key={source.id} value={source.id.toString()}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Select value={filterReadStatus} onValueChange={setFilterReadStatus}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="阅读状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部</SelectItem>
                    <SelectItem value="unread">未读</SelectItem>
                    <SelectItem value="read">已读</SelectItem>
                    <SelectItem value="starred">收藏</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索文章..."
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleMarkAllRead}
                  disabled={!stats?.unread_articles}
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  全部已读
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <Card>
            <CardContent className="pt-6">
              {articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">暂无文章</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    订阅RSS源后，文章将自动出现在这里
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className={`flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer ${
                          article.read_status === "unread" ? "bg-accent/30" : ""
                        }`}
                        onClick={() => handleViewArticle(article)}
                      >
                        {article.image_url && (
                          <img
                            src={article.image_url}
                            alt=""
                            className="h-16 w-24 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium line-clamp-2 ${
                              article.read_status === "unread" ? "" : "text-muted-foreground"
                            }`}>
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                              {getReadStatusBadge(article.read_status)}
                            </div>
                          </div>
                          {article.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {article.description.replace(/<[^>]*>/g, "")}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{article.source_name}</span>
                            {article.author && <span>作者: {article.author}</span>}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(article.pub_date)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(article.id);
                            }}
                            title={article.read_status === "starred" ? "取消收藏" : "收藏"}
                          >
                            {article.read_status === "starred" ? (
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(article.link, "_blank");
                            }}
                            title="打开原文"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {articlesTotal > 20 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        共 {articlesTotal} 篇文章
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArticlesPage((p) => Math.max(1, p - 1))}
                          disabled={articlesPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          上一页
                        </Button>
                        <span className="text-sm">
                          第 {articlesPage} / {Math.ceil(articlesTotal / 20)} 页
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArticlesPage((p) => p + 1)}
                          disabled={articlesPage >= Math.ceil(articlesTotal / 20)}
                        >
                          下一页
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Source Dialog */}
      <Dialog open={sourceDialogOpen} onOpenChange={(open) => {
        if (!open) resetSourceForm();
        setSourceDialogOpen(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSource ? "编辑订阅源" : "添加订阅源"}</DialogTitle>
            <DialogDescription>
              添加微信公众号RSS订阅源，支持RSSHub、WeRSS等第三方服务
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rss_url">RSS地址 *</Label>
              <div className="flex gap-2">
                <Input
                  id="rss_url"
                  placeholder="https://rsshub.app/wechat/mp/xxx"
                  value={sourceForm.rss_url}
                  onChange={(e) => setSourceForm({ ...sourceForm, rss_url: e.target.value })}
                />
                <Button
                  variant="outline"
                  onClick={handleValidateURL}
                  disabled={!sourceForm.rss_url || validating}
                >
                  {validating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "验证"
                  )}
                </Button>
              </div>
              {validationResult && (
                <p className={`text-sm ${validationResult.valid ? "text-green-600" : "text-destructive"}`}>
                  {validationResult.valid
                    ? `✓ 有效的RSS源，包含 ${validationResult.item_count} 篇文章`
                    : "✗ 无效的RSS地址"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">订阅源名称 *</Label>
              <Input
                id="name"
                placeholder="公众号名称"
                value={sourceForm.name}
                onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wechat_id">公众号ID（可选）</Label>
              <Input
                id="wechat_id"
                placeholder="公众号原始ID"
                value={sourceForm.wechat_id}
                onChange={(e) => setSourceForm({ ...sourceForm, wechat_id: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>来源类型</Label>
                <Select
                  value={sourceForm.source_type}
                  onValueChange={(value) =>
                    setSourceForm({ ...sourceForm, source_type: value as WechatRSSSourceType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rsshub">RSSHub</SelectItem>
                    <SelectItem value="werss">WeRSS</SelectItem>
                    <SelectItem value="feeddd">Feeddd</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crawl_frequency">抓取频率（分钟）</Label>
                <Input
                  id="crawl_frequency"
                  type="number"
                  min={5}
                  max={1440}
                  value={sourceForm.crawl_frequency}
                  onChange={(e) =>
                    setSourceForm({ ...sourceForm, crawl_frequency: parseInt(e.target.value) || 60 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Textarea
                id="description"
                placeholder="订阅源描述"
                value={sourceForm.description}
                onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSourceDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSaveSource}
              disabled={!sourceForm.rss_url || !sourceForm.name || saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSource ? "保存" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除订阅源 "{sourceToDelete?.name}" 吗？此操作将同时删除该源下的所有文章，且无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteSource}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Article Detail Sheet */}
      <Sheet open={articleSheetOpen} onOpenChange={setArticleSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedArticle && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left pr-8">{selectedArticle.title}</SheetTitle>
                <SheetDescription className="text-left">
                  <div className="flex items-center gap-4 text-sm">
                    <span>{selectedArticle.source_name}</span>
                    {selectedArticle.author && <span>作者: {selectedArticle.author}</span>}
                    <span>{formatDate(selectedArticle.pub_date)}</span>
                  </div>
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStar(selectedArticle.id)}
                  >
                    {selectedArticle.read_status === "starred" ? (
                      <>
                        <Star className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                        取消收藏
                      </>
                    ) : (
                      <>
                        <StarOff className="mr-2 h-4 w-4" />
                        收藏
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedArticle.link, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    查看原文
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {selectedArticle.content ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                  ) : selectedArticle.description ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.description }} />
                  ) : (
                    <p className="text-muted-foreground">暂无内容，请点击"查看原文"阅读</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Quick Add Dialog (Paste Article URL) */}
      <Dialog open={quickAddDialogOpen} onOpenChange={(open) => {
        if (!open) resetQuickAddDialog();
        setQuickAddDialogOpen(open);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              快速订阅
            </DialogTitle>
            <DialogDescription>
              粘贴任意微信公众号文章链接，自动识别并创建订阅
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="article_url">文章链接</Label>
              <div className="flex gap-2">
                <Input
                  id="article_url"
                  placeholder="https://mp.weixin.qq.com/s/..."
                  value={articleUrlInput}
                  onChange={(e) => {
                    setArticleUrlInput(e.target.value);
                    // 清除之前的结果
                    if (parsedInfo) setParsedInfo(null);
                    if (parseError) setParseError("");
                  }}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleParseArticleURL}
                  disabled={!articleUrlInput || parsingArticle}
                >
                  {parsingArticle ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "解析"
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>支持完整链接或短链接 (mp.weixin.qq.com)</p>
              </div>
            </div>

            {/* 解析状态显示 */}
            {parsingArticle && parseStatus && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {parseStatus}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      系统会依次尝试：正则匹配 → JS引擎解析 → 无头浏览器
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 解析错误显示 */}
            {parseError && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-700 dark:text-red-300">解析失败</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">{parseError}</p>
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-red-200 dark:border-red-800">
                  <p className="font-medium">解决方法：</p>
                  <ol className="list-decimal list-inside space-y-1 ml-1">
                    <li>在浏览器中打开文章链接</li>
                    <li>按 F12 打开开发者工具</li>
                    <li>在控制台输入 <code className="bg-muted px-1 rounded">window.biz</code> 回车</li>
                    <li>复制得到的值，或复制地址栏完整URL</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 解析成功显示 */}
            {parsedInfo && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-300">解析成功</span>
                  {parsedInfo.extraction_method && (
                    <Badge variant="outline" className="text-xs">
                      {parsedInfo.extraction_method}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-muted-foreground w-20">公众号ID:</span>
                    <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                      {parsedInfo.biz}
                    </code>
                  </div>
                  {parsedInfo.author && (
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground w-20">公众号:</span>
                      <span className="font-medium">{parsedInfo.author}</span>
                    </div>
                  )}
                  {parsedInfo.title && (
                    <div className="flex items-start text-sm">
                      <span className="text-muted-foreground w-20 shrink-0">文章标题:</span>
                      <span className="line-clamp-2">{parsedInfo.title}</span>
                    </div>
                  )}
                  <div className="flex items-start text-sm">
                    <span className="text-muted-foreground w-20 shrink-0">RSS源:</span>
                    <div className="space-y-1">
                      {parsedInfo.rss_urls.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-1 py-0.5 rounded truncate max-w-[280px]">
                            {url}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => navigator.clipboard.writeText(url)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickAddDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreateFromArticle}
              disabled={!parsedInfo || creatingFromArticle}
            >
              {creatingFromArticle && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建订阅
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
