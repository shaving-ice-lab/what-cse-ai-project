"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Eye,
  ExternalLink,
  Loader2,
  LogIn,
  Key,
  Database,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Link,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
  TrendingUp,
  FileText,
  Cookie,
  Upload,
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
} from "@what-cse/ui";
import {
  fenbiApi,
  FenbiCredential,
  FenbiLoginStatus,
  FenbiCategory,
  FenbiAnnouncement,
  FenbiCrawlProgress,
} from "@/services/api";

export default function FenbiCrawlerPage() {
  // State
  const [loading, setLoading] = useState(true);
  const [credential, setCredential] = useState<FenbiCredential | null>(null);
  const [loginStatus, setLoginStatus] = useState<FenbiLoginStatus | null>(null);
  const [categories, setCategories] = useState<{
    regions: FenbiCategory[];
    exam_types: FenbiCategory[];
    years: FenbiCategory[];
  }>({ regions: [], exam_types: [], years: [] });
  const [announcements, setAnnouncements] = useState<FenbiAnnouncement[]>([]);
  const [announcementsTotal, setAnnouncementsTotal] = useState(0);
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const [stats, setStats] = useState<{
    total: number;
    by_crawl_status: Record<number, number>;
  } | null>(null);

  // Dialog states
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [credentialForm, setCredentialForm] = useState({ phone: "", password: "" });
  const [cookieDialogOpen, setCookieDialogOpen] = useState(false);
  const [cookieForm, setCookieForm] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<FenbiAnnouncement | null>(null);

  // Loading states
  const [loggingIn, setLoggingIn] = useState(false);
  const [savingCredential, setSavingCredential] = useState(false);
  const [importingCookies, setImportingCookies] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState<FenbiCrawlProgress | null>(null);

  // Filter states
  const [filterRegion, setFilterRegion] = useState("");
  const [filterExamType, setFilterExamType] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Crawl config
  const [crawlRegions, setCrawlRegions] = useState<string[]>([]);
  const [crawlExamTypes, setCrawlExamTypes] = useState<string[]>([]);
  const [crawlYears, setCrawlYears] = useState<number[]>([]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [credRes, statusRes, catRes, statsRes] = await Promise.all([
        fenbiApi.getCredential(),
        fenbiApi.checkLoginStatus(),
        fenbiApi.getCategories(),
        fenbiApi.getStats(),
      ]);

      if ((credRes as any).has_credential) {
        setCredential((credRes as any).credential);
      }
      setLoginStatus(statusRes as FenbiLoginStatus);
      setCategories({
        regions: (catRes as any).regions || [],
        exam_types: (catRes as any).exam_types || [],
        years: (catRes as any).years || [],
      });
      setStats(statsRes as any);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fenbiApi.getAnnouncements({
        page: announcementsPage,
        page_size: 20,
        region: filterRegion || undefined,
        exam_type: filterExamType || undefined,
        year: filterYear ? parseInt(filterYear) : undefined,
      });
      setAnnouncements((res as any).announcements || []);
      setAnnouncementsTotal((res as any).total || 0);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    }
  }, [announcementsPage, filterRegion, filterExamType, filterYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Handlers
  const handleSaveCredential = async () => {
    if (!credentialForm.phone || !credentialForm.password) {
      return;
    }

    setSavingCredential(true);
    try {
      const res = await fenbiApi.saveCredential(credentialForm);
      setCredential((res as any).credential);
      setCredentialDialogOpen(false);
      setCredentialForm({ phone: "", password: "" });
      const statusRes = await fenbiApi.checkLoginStatus();
      setLoginStatus(statusRes as FenbiLoginStatus);
    } catch (error) {
      console.error("Failed to save credential:", error);
    } finally {
      setSavingCredential(false);
    }
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      const res = await fenbiApi.login();
      setLoginStatus(res as FenbiLoginStatus);
    } catch (error) {
      console.error("Failed to login:", error);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      const res = await fenbiApi.checkLoginStatus();
      setLoginStatus(res as FenbiLoginStatus);
    } catch (error) {
      console.error("Failed to check status:", error);
    }
  };

  const handleImportCookies = async () => {
    if (!cookieForm.trim()) {
      return;
    }

    setImportingCookies(true);
    try {
      const res = await fenbiApi.importCookies({ cookies: cookieForm.trim() });
      setLoginStatus((res as any).login_status as FenbiLoginStatus);
      setCookieDialogOpen(false);
      setCookieForm("");
      // Refresh data after successful import
      await fetchData();
    } catch (error) {
      console.error("Failed to import cookies:", error);
    } finally {
      setImportingCookies(false);
    }
  };

  const handleTriggerCrawl = async () => {
    setCrawling(true);
    setCrawlProgress(null);
    try {
      // 排除省考和国考的考试类型
      const excludedExamTypes = ["shengkao", "guokao"];
      let examTypesToCrawl: string[] | undefined;
      
      if (crawlExamTypes.length > 0) {
        // 用户选择了特定类型
        examTypesToCrawl = crawlExamTypes;
      } else {
        // 用户选择"全部类型"时，自动排除省考和国考
        examTypesToCrawl = categories.exam_types
          .filter((type) => !excludedExamTypes.includes(type.code))
          .map((type) => type.code);
      }
      
      const res = await fenbiApi.triggerCrawl({
        regions: crawlRegions.length > 0 ? crawlRegions : undefined,
        exam_types: examTypesToCrawl,
        years: crawlYears.length > 0 ? crawlYears : undefined,
      });
      setCrawlProgress(res as FenbiCrawlProgress);
      await Promise.all([fetchAnnouncements(), fetchData()]);
    } catch (error) {
      console.error("Failed to trigger crawl:", error);
    } finally {
      setCrawling(false);
    }
  };

  const handleCrawlDetail = async (id: number) => {
    try {
      await fenbiApi.crawlAnnouncementDetail(id);
      fetchAnnouncements();
    } catch (error) {
      console.error("Failed to crawl detail:", error);
    }
  };

  const handleViewDetail = (announcement: FenbiAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setDetailDialogOpen(true);
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 2:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCrawlStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="text-xs">待爬取</Badge>;
      case 1:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">已爬列表</Badge>;
      case 2:
        return <Badge className="text-xs">已爬详情</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">未知</Badge>;
    }
  };

  const totalPages = Math.ceil(announcementsTotal / 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
          <p className="text-muted-foreground text-sm">正在加载数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] flex gap-5">
      {/* Left Panel - Control & Stats */}
      <div className="w-[360px] flex-shrink-0 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-3">
            {/* Login Status Card */}
            <Card className="border-l-4 border-l-primary/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    账号状态
                  </CardTitle>
                  {getStatusIcon(loginStatus?.status || 0)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">
                    {loginStatus?.status_text || "未配置"}
                  </span>
                  {credential && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {credential.phone_masked}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!loginStatus?.is_logged_in && credential && (
                    <Button size="sm" onClick={handleLogin} disabled={loggingIn} className="flex-1">
                      {loggingIn ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-3 w-3" />
                      )}
                      登录
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleCheckStatus} className="flex-1">
                    检查状态
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setCookieDialogOpen(true)} title="导入Cookie">
                    <Cookie className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    // 打开对话框时预填充已保存的凭证
                    if (credential) {
                      setCredentialForm({
                        phone: credential.phone || "",
                        password: credential.password || "",
                      });
                    } else {
                      setCredentialForm({ phone: "", password: "" });
                    }
                    setCredentialDialogOpen(true);
                  }}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-background">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900/50">
                      <Database className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">总公告</span>
                  </div>
                  <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                    {stats?.total || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">已完成</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {stats?.by_crawl_status?.[2] || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50">
                      <Link className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">待详情</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats?.by_crawl_status?.[1] || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/50">
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">最后检查</span>
                  </div>
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-300 truncate">
                    {loginStatus?.last_check_at
                      ? new Date(loginStatus.last_check_at).toLocaleString("zh-CN", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Crawl Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  爬虫配置
                </CardTitle>
                <CardDescription className="text-xs">
                  选择筛选条件开始数据采集
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    地区
                  </Label>
                  <Select
                    value={crawlRegions[0] || "all"}
                    onValueChange={(value) => setCrawlRegions(value === "all" ? [] : [value])}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择地区" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部地区</SelectItem>
                      {categories.regions.map((region) => (
                        <SelectItem key={region.code} value={region.code}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3" />
                    考试类型
                  </Label>
                  <Select
                    value={crawlExamTypes[0] || "all"}
                    onValueChange={(value) => setCrawlExamTypes(value === "all" ? [] : [value])}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择考试类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {categories.exam_types
                        .filter((type) => type.code !== "shengkao" && type.code !== "guokao")
                        .map((type) => (
                          <SelectItem key={type.code} value={type.code}>
                            {type.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    年份
                  </Label>
                  <Select
                    value={crawlYears[0]?.toString() || "all"}
                    onValueChange={(value) =>
                      setCrawlYears(value === "all" ? [] : [parseInt(value)])
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择年份" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部年份</SelectItem>
                      {categories.years.map((year) => (
                        <SelectItem key={year.code} value={year.code}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleTriggerCrawl}
                  disabled={crawling || !loginStatus?.is_logged_in}
                >
                  {crawling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  开始爬取
                </Button>

                {/* Crawl Progress */}
                {crawlProgress && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">爬取进度</span>
                      <Badge variant={crawlProgress.status === "completed" ? "default" : "secondary"} className="text-xs">
                        {crawlProgress.status === "completed" ? "已完成" : "进行中"}
                      </Badge>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${
                            crawlProgress.total_tasks > 0
                              ? (crawlProgress.completed_tasks / crawlProgress.total_tasks) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      爬取 {crawlProgress.items_crawled} 项 · 保存 {crawlProgress.items_saved} 项
                    </div>
                  </div>
                )}

                {!loginStatus?.is_logged_in && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs">
                    请先登录粉笔账号才能进行爬取
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Data List */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">公告列表</CardTitle>
                  <CardDescription className="text-xs">
                    共 {announcementsTotal} 条记录
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterRegion || "_all"} onValueChange={(v) => { setFilterRegion(v === "_all" ? "" : v); setAnnouncementsPage(1); }}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue placeholder="地区" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">全部地区</SelectItem>
                    {categories.regions.map((region) => (
                      <SelectItem key={region.code} value={region.code}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterExamType || "_all"} onValueChange={(v) => { setFilterExamType(v === "_all" ? "" : v); setAnnouncementsPage(1); }}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">全部类型</SelectItem>
                    {categories.exam_types.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterYear || "_all"} onValueChange={(v) => { setFilterYear(v === "_all" ? "" : v); setAnnouncementsPage(1); }}>
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue placeholder="年份" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">全部</SelectItem>
                    {categories.years.map((year) => (
                      <SelectItem key={year.code} value={year.code}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[40%]">标题</TableHead>
                      <TableHead className="w-[12%]">地区</TableHead>
                      <TableHead className="w-[15%]">考试类型</TableHead>
                      <TableHead className="w-[8%]">年份</TableHead>
                      <TableHead className="w-[12%]">状态</TableHead>
                      <TableHead className="w-[13%]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Database className="h-8 w-8 opacity-50" />
                            <p className="text-sm">暂无公告数据</p>
                            <p className="text-xs">请先执行爬取任务</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      announcements.map((announcement) => (
                        <TableRow key={announcement.id} className="group">
                          <TableCell className="py-3">
                            <div className="max-w-[350px]">
                              <a
                                href={announcement.fenbi_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium text-sm line-clamp-2"
                              >
                                {announcement.title}
                              </a>
                              {announcement.original_url && (
                                <a
                                  href={announcement.original_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  原文链接
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{announcement.region_name || "-"}</TableCell>
                          <TableCell className="text-sm">{announcement.exam_type_name || "-"}</TableCell>
                          <TableCell className="text-sm">{announcement.year || "-"}</TableCell>
                          <TableCell>{getCrawlStatusBadge(announcement.crawl_status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetail(announcement)}
                                className="h-7 text-xs"
                                title="查看详情"
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                              {announcement.crawl_status < 2 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCrawlDetail(announcement.id)}
                                  disabled={!loginStatus?.is_logged_in}
                                  className="h-7 text-xs"
                                  title="获取原文"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Pagination */}
            {announcementsTotal > 0 && (
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t bg-muted/30">
                <div className="text-xs text-muted-foreground">
                  第 {(announcementsPage - 1) * 20 + 1}-{Math.min(announcementsPage * 20, announcementsTotal)} 条，共 {announcementsTotal} 条
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnnouncementsPage((p) => Math.max(1, p - 1))}
                    disabled={announcementsPage === 1}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs px-3 py-1 bg-background border rounded">
                    {announcementsPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnnouncementsPage((p) => Math.min(totalPages, p + 1))}
                    disabled={announcementsPage >= totalPages}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credential Dialog */}
      <Dialog open={credentialDialogOpen} onOpenChange={setCredentialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              粉笔账号设置
            </DialogTitle>
            <DialogDescription>
              设置粉笔网登录凭证，用于爬取公告数据
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                placeholder="请输入粉笔账号手机号"
                value={credentialForm.phone}
                onChange={(e) =>
                  setCredentialForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="text"
                placeholder="请输入密码"
                value={credentialForm.password}
                onChange={(e) =>
                  setCredentialForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCredentialDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCredential} disabled={savingCredential}>
              {savingCredential ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              保存并登录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cookie Import Dialog */}
      <Dialog open={cookieDialogOpen} onOpenChange={setCookieDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              导入Cookie
            </DialogTitle>
            <DialogDescription>
              直接从浏览器复制Cookie或从HAR文件提取，跳过登录直接使用
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cookies">Cookie字符串</Label>
              <Textarea
                id="cookies"
                placeholder={`请粘贴Cookie字符串，格式如：\nsid=xxx; userid=xxx; PHPSESSID=xxx\n\n获取方式：\n1. 在浏览器中登录粉笔网\n2. 打开开发者工具 (F12)\n3. 切换到 Network 标签\n4. 刷新页面，点击任意请求\n5. 在 Headers 中找到 Cookie 字段并复制`}
                value={cookieForm}
                onChange={(e) => setCookieForm(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs space-y-1">
              <p className="font-medium">注意事项：</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Cookie有效期通常为30天</li>
                <li>导入后会自动验证Cookie是否有效</li>
                <li>如果Cookie失效，需要重新获取并导入</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCookieDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImportCookies} disabled={importingCookies || !cookieForm.trim()}>
              {importingCookies ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              导入并验证
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              公告详情
            </DialogTitle>
            <DialogDescription>
              查看公告的完整信息
            </DialogDescription>
          </DialogHeader>
          {selectedAnnouncement && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">标题</Label>
                  <p className="text-sm font-medium leading-relaxed">{selectedAnnouncement.title}</p>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      地区
                    </Label>
                    <p className="text-sm">
                      {selectedAnnouncement.region_name || "-"}
                      {selectedAnnouncement.region_code && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({selectedAnnouncement.region_code})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      考试类型
                    </Label>
                    <p className="text-sm">
                      {selectedAnnouncement.exam_type_name || "-"}
                      {selectedAnnouncement.exam_type_code && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({selectedAnnouncement.exam_type_code})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      年份
                    </Label>
                    <p className="text-sm">{selectedAnnouncement.year || "-"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      发布日期
                    </Label>
                    <p className="text-sm">
                      {selectedAnnouncement.publish_date
                        ? new Date(selectedAnnouncement.publish_date).toLocaleDateString("zh-CN")
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">爬取状态</Label>
                  <div>{getCrawlStatusBadge(selectedAnnouncement.crawl_status)}</div>
                </div>

                {/* IDs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">数据库ID</Label>
                    <p className="text-sm font-mono">{selectedAnnouncement.id}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">粉笔ID</Label>
                    <p className="text-sm font-mono">{selectedAnnouncement.fenbi_id || "-"}</p>
                  </div>
                </div>

                {/* URLs */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      粉笔链接
                    </Label>
                    {selectedAnnouncement.fenbi_url ? (
                      <a
                        href={selectedAnnouncement.fenbi_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                      >
                        {selectedAnnouncement.fenbi_url}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">-</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      原文链接
                    </Label>
                    {selectedAnnouncement.original_url ? (
                      <a
                        href={selectedAnnouncement.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                      >
                        {selectedAnnouncement.original_url}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">未获取</p>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">创建时间</Label>
                    <p className="text-xs text-muted-foreground">
                      {selectedAnnouncement.created_at
                        ? new Date(selectedAnnouncement.created_at).toLocaleString("zh-CN")
                        : "-"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">更新时间</Label>
                    <p className="text-xs text-muted-foreground">
                      {selectedAnnouncement.updated_at
                        ? new Date(selectedAnnouncement.updated_at).toLocaleString("zh-CN")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              关闭
            </Button>
            {selectedAnnouncement && selectedAnnouncement.fenbi_url && (
              <Button asChild>
                <a
                  href={selectedAnnouncement.fenbi_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  打开粉笔页面
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
