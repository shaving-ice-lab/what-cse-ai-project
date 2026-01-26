"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Zap,
  FileText,
  Cookie,
  Upload,
  FlaskConical,
  Square,
  Timer,
  Activity,
} from "lucide-react";
import { ParseUrlDialog } from "./components/ParseUrlDialog";
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
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    test_result?: {
      announcement_id?: number;
      title?: string;
      fenbi_url?: string;
      original_url?: string;
      final_url?: string;
      page_content?: {
        title?: string;
        content?: string;
        html?: string;
      };
      attachments?: Array<{
        name: string;
        url: string;
        type: string;
        local_path?: string;
        content?: string;
        error?: string;
      }>;
      llm_analysis?: {
        summary?: string;
        positions?: Array<{
          position_name?: string;
          department_name?: string;
          recruit_count?: number;
          education?: string;
          major?: string[];
          work_location?: string;
        }>;
        exam_info?: {
          exam_type?: string;
          registration_start?: string;
          registration_end?: string;
          exam_date?: string;
        };
        confidence?: number;
        raw_response?: string;
        error?: string;
      };
      raw_data?: Record<string, unknown>;
    };
  } | null>(null);

  // Loading states
  const [loggingIn, setLoggingIn] = useState(false);
  const [savingCredential, setSavingCredential] = useState(false);
  const [importingCookies, setImportingCookies] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState<FenbiCrawlProgress | null>(null);
  const [testing, setTesting] = useState(false);

  // URL Parse dialog states
  const [parseDialogOpen, setParseDialogOpen] = useState(false);

  // Filter states
  const [filterRegion, setFilterRegion] = useState("");
  const [filterExamType, setFilterExamType] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Task queue - 公告任务队列
  const [taskQueue, setTaskQueue] = useState<Array<{
    id: number;
    title: string;
    status: "pending" | "running" | "completed" | "failed" | "skipped";
    message?: string;
    startTime?: Date;
    endTime?: Date;
  }>>([]);
  const [crawlStartTime, setCrawlStartTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  // Crawl config
  const [crawlRegions, setCrawlRegions] = useState<string[]>([]);
  const [crawlExamTypes, setCrawlExamTypes] = useState<string[]>([]);
  const [crawlYears, setCrawlYears] = useState<number[]>([]);

  // Crawl interval ref for real-time updates
  const crawlIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Abort controller ref for canceling crawl requests
  const crawlAbortControllerRef = useRef<AbortController | null>(null);

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
      setLoginStatus(statusRes as unknown as FenbiLoginStatus);
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

  // Cleanup crawl interval on unmount
  useEffect(() => {
    return () => {
      if (crawlIntervalRef.current) {
        clearInterval(crawlIntervalRef.current);
      }
    };
  }, []);

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

  // 已知公告ID的集合，用于检测新增公告
  const knownAnnouncementIdsRef = useRef<Set<number>>(new Set());

  // 定义刷新函数，直接调用 API 避免闭包问题
  const refreshCrawlData = async () => {
    try {
      const [announcementsRes, statsRes] = await Promise.all([
        fenbiApi.getAnnouncements({
          page: 1, // 始终显示第一页，这样能看到最新爬取的内容
          page_size: 20,
          region: filterRegion || undefined,
          exam_type: filterExamType || undefined,
          year: filterYear ? parseInt(filterYear) : undefined,
        }),
        fenbiApi.getStats(),
      ]);
      
      const newAnnouncements = (announcementsRes as any).announcements || [];
      
      // 检测新增的公告，添加到任务队列
      const newTasks: Array<{
        id: number;
        title: string;
        status: "pending" | "running" | "completed" | "failed" | "skipped";
        message?: string;
        startTime?: Date;
        endTime?: Date;
      }> = [];
      
      for (const ann of newAnnouncements) {
        if (!knownAnnouncementIdsRef.current.has(ann.id)) {
          knownAnnouncementIdsRef.current.add(ann.id);
          newTasks.push({
            id: ann.id,
            title: ann.title,
            status: "completed",
            startTime: new Date(),
            endTime: new Date(),
          });
        }
      }
      
      // 将新任务添加到队列顶部
      if (newTasks.length > 0) {
        setTaskQueue((prev) => [...newTasks, ...prev].slice(0, 100)); // 最多保留100条
      }
      
      setAnnouncements(newAnnouncements);
      setAnnouncementsTotal((announcementsRes as any).total || 0);
      setAnnouncementsPage(1); // 重置到第一页
      setStats(statsRes as any);
    } catch (error) {
      console.error("Failed to refresh during crawl:", error);
    }
  };

  const handleTriggerCrawl = async () => {
    setCrawling(true);
    setCrawlProgress(null);
    setActiveTab("tasks"); // 切换到任务 Tab
    setCrawlStartTime(new Date());
    setTaskQueue([]); // 清空任务队列
    
    // 初始化已知公告ID集合（当前已有的公告）
    knownAnnouncementIdsRef.current = new Set(announcements.map((a) => a.id));
    
    const excludedExamTypes = ["shengkao", "guokao"];
    const examTypesToCrawl = crawlExamTypes.length > 0 
      ? crawlExamTypes 
      : categories.exam_types.filter((type) => !excludedExamTypes.includes(type.code)).map((type) => type.code);
    
    // 创建 AbortController 用于取消请求
    crawlAbortControllerRef.current = new AbortController();
    
    // 启动定时器，每1.5秒刷新一次公告列表和统计数据
    crawlIntervalRef.current = setInterval(refreshCrawlData, 1500);
    
    try {
      const res = await fenbiApi.triggerCrawl({
        regions: crawlRegions.length > 0 ? crawlRegions : undefined,
        exam_types: examTypesToCrawl,
        years: crawlYears.length > 0 ? crawlYears : undefined,
      }, crawlAbortControllerRef.current.signal);
      
      const progress = res as FenbiCrawlProgress;
      setCrawlProgress(progress);
      
      // 标记所有正在处理的任务为完成
      setTaskQueue((prev) => prev.map((task) => 
        task.status === "running" ? { ...task, status: "completed" as const, endTime: new Date() } : task
      ));
    } catch (error: any) {
      // 忽略用户主动取消的错误
      const isCanceled = error?.name === 'CanceledError' || 
                         error?.name === 'AbortError' || 
                         error?.code === 'ERR_CANCELED' ||
                         error?.message === 'canceled';
      if (!isCanceled) {
        console.error("Failed to trigger crawl:", error);
        // 标记正在处理的任务为失败
        setTaskQueue((prev) => prev.map((task) => 
          task.status === "running" ? { ...task, status: "failed" as const, message: "爬取失败", endTime: new Date() } : task
        ));
      } else {
        // 标记正在处理的任务为已停止
        setTaskQueue((prev) => prev.map((task) => 
          task.status === "running" ? { ...task, status: "completed" as const, message: "已停止", endTime: new Date() } : task
        ));
      }
    } finally {
      // 停止定时器
      if (crawlIntervalRef.current) {
        clearInterval(crawlIntervalRef.current);
        crawlIntervalRef.current = null;
      }
      // 清除 AbortController
      crawlAbortControllerRef.current = null;
      // 最终刷新一次确保数据完整
      await refreshCrawlData();
      setCrawling(false);
    }
  };

  const handleStopCrawl = async () => {
    try {
      // 调用后端停止爬取 API
      await fenbiApi.stopCrawl();
    } catch (error) {
      console.error("Failed to stop crawl on server:", error);
    }
    
    // 取消正在进行的请求
    if (crawlAbortControllerRef.current) {
      crawlAbortControllerRef.current.abort();
      crawlAbortControllerRef.current = null;
    }
    // 停止定时器
    if (crawlIntervalRef.current) {
      clearInterval(crawlIntervalRef.current);
      crawlIntervalRef.current = null;
    }
    // 更新状态
    setCrawling(false);
    setCrawlProgress((prev) => prev ? { ...prev, status: "stopped", message: "爬取已停止" } : null);
    
    // 最终刷新一次数据
    await refreshCrawlData();
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

  const handleTestCrawl = async () => {
    setTesting(true);
    setTestResult(null);
    setTestDialogOpen(true);
    try {
      const res = await fenbiApi.testCrawl();
      setTestResult(res as typeof testResult);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error?.message || "测试请求失败",
      });
    } finally {
      setTesting(false);
    }
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

  // Crawl config dialog state
  const [crawlConfigDialogOpen, setCrawlConfigDialogOpen] = useState(false);

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] flex flex-col gap-2">
      {/* Top Toolbar - Compact */}
      <div className="flex-shrink-0 flex items-center gap-3">
        {/* Tab Switcher */}
        <TabsList className="h-8">
          <TabsTrigger value="tasks" className="gap-1.5 text-xs px-3 h-7">
            <Activity className="h-3.5 w-3.5" />
            任务队列
            {crawling && (
              <span className="ml-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {taskQueue.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {taskQueue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5 text-xs px-3 h-7">
            <FileText className="h-3.5 w-3.5" />
            公告列表
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
              {announcementsTotal}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Account Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border">
          {getStatusIcon(loginStatus?.status || 0)}
          <span className="text-sm font-medium">
            {loginStatus?.status_text || "未配置"}
          </span>
          {credential && (
            <span className="text-xs text-muted-foreground">
              {credential.phone_masked}
            </span>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 px-3 py-1.5 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-xs text-muted-foreground">总数</span>
            <span className="text-sm font-bold text-violet-600">{stats?.total || 0}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">已完成</span>
            <span className="text-sm font-bold text-emerald-600">{stats?.by_crawl_status?.[2] || 0}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <Link className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs text-muted-foreground">待详情</span>
            <span className="text-sm font-bold text-blue-600">{stats?.by_crawl_status?.[1] || 0}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!loginStatus?.is_logged_in && credential && (
            <Button size="sm" variant="outline" onClick={handleLogin} disabled={loggingIn} className="h-8">
              {loggingIn ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
              )}
              登录
            </Button>
          )}
          
          {crawling ? (
            <Button size="sm" variant="destructive" onClick={handleStopCrawl} className="h-8">
              <Square className="mr-1.5 h-3.5 w-3.5" />
              停止
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleTriggerCrawl}
              disabled={!loginStatus?.is_logged_in}
              className="h-8"
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              开始爬取
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCrawlConfigDialogOpen(true)}
            className="h-8"
            title="爬虫配置"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleTestCrawl}
            disabled={!loginStatus?.is_logged_in || testing}
            className="h-8"
            title="测试爬取"
          >
            {testing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FlaskConical className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setParseDialogOpen(true)}
            disabled={!loginStatus?.is_logged_in}
            className="h-8"
            title="解析URL"
          >
            <Link className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCookieDialogOpen(true)}
            className="h-8"
            title="导入Cookie"
          >
            <Cookie className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (credential) {
                setCredentialForm({
                  phone: credential.phone || "",
                  password: credential.password || "",
                });
              } else {
                setCredentialForm({ phone: "", password: "" });
              }
              setCredentialDialogOpen(true);
            }}
            className="h-8"
            title="账号设置"
          >
            <Key className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Login Warning */}
      {!loginStatus?.is_logged_in && (
        <div className="flex-shrink-0 px-3 py-2 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5" />
          请先登录粉笔账号或导入Cookie才能进行爬取
        </div>
      )}

      {/* Tasks Tab */}
      <TabsContent value="tasks" className="flex-1 overflow-hidden mt-0">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0 py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      任务队列
                    </CardTitle>
                    {crawling && (
                      <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        爬取中
                      </Badge>
                    )}
                    {crawlProgress && (
                      <span className="text-xs text-muted-foreground">
                        已爬取 {crawlProgress.items_crawled} 项 · 已保存 {crawlProgress.items_saved} 项
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {crawlStartTime && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        开始于 {crawlStartTime.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                    )}
                    {crawling && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleStopCrawl}
                        className="h-7 text-xs"
                      >
                        <Square className="h-3 w-3 mr-1" />
                        停止
                      </Button>
                    )}
                    {!crawling && taskQueue.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTaskQueue([])}
                        className="h-7 text-xs"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        清除
                      </Button>
                    )}
                  </div>
                </div>
                {/* Progress Bar */}
                {crawling && crawlProgress && crawlProgress.total_tasks > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300"
                            style={{
                              width: `${(crawlProgress.completed_tasks / crawlProgress.total_tasks) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {crawlProgress.completed_tasks}/{crawlProgress.total_tasks}
                      </span>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                <ScrollArea className="flex-1">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 py-2 text-xs">状态</TableHead>
                        <TableHead className="py-2 text-xs">公告标题</TableHead>
                        <TableHead className="w-24 py-2 text-xs">完成时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskQueue.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-16">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              {crawling ? (
                                <>
                                  <Loader2 className="h-8 w-8 animate-spin opacity-50" />
                                  <p className="text-sm">正在获取公告列表...</p>
                                  <p className="text-xs">请稍候，新爬取的公告将显示在此处</p>
                                </>
                              ) : (
                                <>
                                  <Activity className="h-8 w-8 opacity-30" />
                                  <p className="text-sm">暂无任务</p>
                                  <p className="text-xs">点击"开始爬取"开始新任务</p>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        taskQueue.map((task) => (
                          <TableRow key={task.id} className="group">
                            <TableCell className="py-2">
                              <div className="flex items-center justify-center">
                                {task.status === "completed" && (
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                )}
                                {task.status === "running" && (
                                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                )}
                                {task.status === "pending" && (
                                  <Clock className="h-4 w-4 text-gray-400" />
                                )}
                                {task.status === "failed" && (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                {task.status === "skipped" && (
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              <span className={`text-sm ${
                                task.status === "completed" ? "text-foreground" :
                                task.status === "running" ? "text-blue-700 dark:text-blue-300 font-medium" :
                                task.status === "failed" ? "text-red-700 dark:text-red-300" :
                                "text-muted-foreground"
                              }`}>
                                {task.title}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground">
                              {task.endTime ? task.endTime.toLocaleTimeString("zh-CN", { 
                                hour: "2-digit", 
                                minute: "2-digit", 
                                second: "2-digit" 
                              }) : "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
      </TabsContent>

      {/* List Tab */}
      <TabsContent value="list" className="flex-1 overflow-hidden mt-0">
        <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0 py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      公告列表
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {announcementsTotal} 条
                    </Badge>
                    {crawling && (
                      <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        实时更新中
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={filterRegion || "_all"} onValueChange={(v) => { setFilterRegion(v === "_all" ? "" : v); setAnnouncementsPage(1); }}>
                      <SelectTrigger className="w-24 h-7 text-xs">
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
                      <SelectTrigger className="w-24 h-7 text-xs">
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
                      <SelectTrigger className="w-20 h-7 text-xs">
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
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[45%] py-2 text-xs">标题</TableHead>
                          <TableHead className="w-[10%] py-2 text-xs">地区</TableHead>
                          <TableHead className="w-[12%] py-2 text-xs">考试类型</TableHead>
                          <TableHead className="w-[8%] py-2 text-xs">年份</TableHead>
                          <TableHead className="w-[12%] py-2 text-xs">状态</TableHead>
                          <TableHead className="w-[13%] py-2 text-xs">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {announcements.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
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
                              <TableCell className="py-2">
                                <div>
                                  <a
                                    href={announcement.fenbi_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium text-sm line-clamp-1"
                                  >
                                    {announcement.title}
                                  </a>
                                  {announcement.original_url && (
                                    <a
                                      href={announcement.original_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      原文
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs py-2">{announcement.region_name || "-"}</TableCell>
                              <TableCell className="text-xs py-2">{announcement.exam_type_name || "-"}</TableCell>
                              <TableCell className="text-xs py-2">{announcement.year || "-"}</TableCell>
                              <TableCell className="py-2">{getCrawlStatusBadge(announcement.crawl_status)}</TableCell>
                              <TableCell className="py-2">
                                <div className="flex items-center gap-0.5">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewDetail(announcement)}
                                    className="h-6 w-6 p-0"
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
                                      className="h-6 w-6 p-0"
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
                  <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t bg-muted/20">
                    <div className="text-xs text-muted-foreground">
                      {(announcementsPage - 1) * 20 + 1}-{Math.min(announcementsPage * 20, announcementsTotal)} / {announcementsTotal}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAnnouncementsPage((p) => Math.max(1, p - 1))}
                        disabled={announcementsPage === 1}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs px-2 min-w-[60px] text-center">
                        {announcementsPage} / {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAnnouncementsPage((p) => Math.min(totalPages, p + 1))}
                        disabled={announcementsPage >= totalPages}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Crawl Config Dialog */}
      <Dialog open={crawlConfigDialogOpen} onOpenChange={setCrawlConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              爬虫配置
            </DialogTitle>
            <DialogDescription>
              选择筛选条件开始数据采集
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                地区
              </Label>
              <Select
                value={crawlRegions[0] || "all"}
                onValueChange={(value) => setCrawlRegions(value === "all" ? [] : [value])}
              >
                <SelectTrigger>
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
              <Label className="text-sm flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                考试类型
              </Label>
              <Select
                value={crawlExamTypes[0] || "all"}
                onValueChange={(value) => setCrawlExamTypes(value === "all" ? [] : [value])}
              >
                <SelectTrigger>
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
              <Label className="text-sm flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                年份
              </Label>
              <Select
                value={crawlYears[0]?.toString() || "all"}
                onValueChange={(value) =>
                  setCrawlYears(value === "all" ? [] : [parseInt(value)])
                }
              >
                <SelectTrigger>
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

            {/* Current Config Summary */}
            <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
              <p className="font-medium">当前配置：</p>
              <p>地区: {crawlRegions.length === 0 ? "全部" : categories.regions.find((r) => r.code === crawlRegions[0])?.name || crawlRegions[0]}</p>
              <p>类型: {crawlExamTypes.length === 0 ? "全部（排除省考/国考）" : categories.exam_types.find((t) => t.code === crawlExamTypes[0])?.name || crawlExamTypes[0]}</p>
              <p>年份: {crawlYears.length === 0 ? "全部" : crawlYears.join(", ")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCrawlConfigDialogOpen(false)}>
              关闭
            </Button>
            <Button
              onClick={() => {
                setCrawlConfigDialogOpen(false);
                handleTriggerCrawl();
              }}
              disabled={!loginStatus?.is_logged_in || crawling}
            >
              <Play className="mr-2 h-4 w-4" />
              开始爬取
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Test Crawl Result Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Cookie 爬取测试结果
            </DialogTitle>
            <DialogDescription>
              测试使用当前 Cookie 爬取公告数据是否正常
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              {testing ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">正在测试爬取...</p>
                </div>
              ) : testResult ? (
                <>
                  {/* 测试状态 */}
                  <div className={`p-4 rounded-lg ${
                    testResult.success 
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800" 
                      : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                  }`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <span className={`font-medium ${
                        testResult.success 
                          ? "text-emerald-700 dark:text-emerald-300" 
                          : "text-red-700 dark:text-red-300"
                      }`}>
                        {testResult.success ? "测试成功" : "测试失败"}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${
                      testResult.success 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {testResult.message}
                    </p>
                  </div>

                  {/* 测试结果详情 */}
                  {testResult.test_result && (
                    <div className="space-y-4">
                      {/* 公告信息 */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">测试公告</Label>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">{testResult.test_result.title || "-"}</p>
                          {testResult.test_result.announcement_id && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {testResult.test_result.announcement_id}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 粉笔链接 */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Link className="h-3 w-3" />
                          粉笔链接
                        </Label>
                        {testResult.test_result.fenbi_url ? (
                          <a
                            href={testResult.test_result.fenbi_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                          >
                            {testResult.test_result.fenbi_url}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">-</p>
                        )}
                      </div>

                      {/* 原文链接（短链接） */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          原文链接（短链接）
                        </Label>
                        {testResult.test_result.original_url ? (
                          <a
                            href={testResult.test_result.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                          >
                            {testResult.test_result.original_url}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">未获取到原文链接</p>
                        )}
                      </div>

                      {/* 最终跳转链接 */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Link className="h-3 w-3" />
                          最终跳转链接
                        </Label>
                        {testResult.test_result.final_url ? (
                          <a
                            href={testResult.test_result.final_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                          >
                            {testResult.test_result.final_url}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">未解析或不是短链接</p>
                        )}
                      </div>

                      {/* 页面内容 */}
                      {testResult.test_result.page_content && (
                        <div className="space-y-2 pt-3 border-t">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            原文页面内容
                          </Label>
                          <div className="p-3 bg-muted rounded-lg space-y-2">
                            <p className="text-sm font-medium">{testResult.test_result.page_content.title || "无标题"}</p>
                            <div className="text-xs text-muted-foreground max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                              {testResult.test_result.page_content.content?.substring(0, 2000) || "无内容"}
                              {(testResult.test_result.page_content.content?.length || 0) > 2000 && "..."}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 附件列表 */}
                      {testResult.test_result.attachments && testResult.test_result.attachments.length > 0 && (
                        <div className="space-y-2 pt-3 border-t">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            附件 ({testResult.test_result.attachments.length})
                          </Label>
                          <div className="space-y-3">
                            {testResult.test_result.attachments.map((att, idx) => (
                              <div key={idx} className="p-3 bg-muted rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{att.type.toUpperCase()}</Badge>
                                    <span className="text-sm font-medium">{att.name}</span>
                                  </div>
                                  {att.url && (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      下载
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                                {att.error && (
                                  <p className="text-xs text-red-500">{att.error}</p>
                                )}
                                {att.content && !att.error && (
                                  <div className="text-xs text-muted-foreground max-h-[150px] overflow-y-auto whitespace-pre-wrap bg-background p-2 rounded">
                                    {att.content.substring(0, 1500)}
                                    {att.content.length > 1500 && "..."}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* LLM 分析结果 */}
                      {testResult.test_result.llm_analysis && (
                        <div className="space-y-2 pt-3 border-t">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            LLM 智能分析
                          </Label>
                          {testResult.test_result.llm_analysis.error ? (
                            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                              {testResult.test_result.llm_analysis.error}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* 摘要 */}
                              {testResult.test_result.llm_analysis.summary && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">摘要</p>
                                  <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {testResult.test_result.llm_analysis.summary}
                                  </p>
                                </div>
                              )}

                              {/* 考试信息 */}
                              {testResult.test_result.llm_analysis.exam_info && (
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="text-xs font-medium mb-2">考试信息</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {testResult.test_result.llm_analysis.exam_info.exam_type && (
                                      <div>
                                        <span className="text-muted-foreground">考试类型：</span>
                                        {testResult.test_result.llm_analysis.exam_info.exam_type}
                                      </div>
                                    )}
                                    {testResult.test_result.llm_analysis.exam_info.registration_start && (
                                      <div>
                                        <span className="text-muted-foreground">报名开始：</span>
                                        {testResult.test_result.llm_analysis.exam_info.registration_start}
                                      </div>
                                    )}
                                    {testResult.test_result.llm_analysis.exam_info.registration_end && (
                                      <div>
                                        <span className="text-muted-foreground">报名截止：</span>
                                        {testResult.test_result.llm_analysis.exam_info.registration_end}
                                      </div>
                                    )}
                                    {testResult.test_result.llm_analysis.exam_info.exam_date && (
                                      <div>
                                        <span className="text-muted-foreground">考试时间：</span>
                                        {testResult.test_result.llm_analysis.exam_info.exam_date}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 职位信息 */}
                              {testResult.test_result.llm_analysis.positions && testResult.test_result.llm_analysis.positions.length > 0 && (
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="text-xs font-medium mb-2">提取的职位 ({testResult.test_result.llm_analysis.positions.length}个)</p>
                                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {testResult.test_result.llm_analysis.positions.slice(0, 5).map((pos, idx) => (
                                      <div key={idx} className="text-xs p-2 bg-background rounded">
                                        <div className="font-medium">{pos.position_name || "未知职位"}</div>
                                        <div className="text-muted-foreground mt-1 grid grid-cols-2 gap-1">
                                          {pos.department_name && <span>单位：{pos.department_name}</span>}
                                          {pos.recruit_count && <span>招录：{pos.recruit_count}人</span>}
                                          {pos.education && <span>学历：{pos.education}</span>}
                                          {pos.work_location && <span>地点：{pos.work_location}</span>}
                                        </div>
                                        {pos.major && pos.major.length > 0 && (
                                          <div className="text-muted-foreground mt-1">
                                            专业：{pos.major.join("、")}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {testResult.test_result.llm_analysis.positions.length > 5 && (
                                      <p className="text-xs text-muted-foreground text-center">
                                        还有 {testResult.test_result.llm_analysis.positions.length - 5} 个职位...
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 置信度 */}
                              {testResult.test_result.llm_analysis.confidence !== undefined && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>分析置信度：</span>
                                  <Badge variant={testResult.test_result.llm_analysis.confidence >= 80 ? "default" : "secondary"}>
                                    {testResult.test_result.llm_analysis.confidence}%
                                  </Badge>
                                </div>
                              )}

                              {/* 原始响应（可展开） */}
                              {testResult.test_result.llm_analysis.raw_response && (
                                <details className="text-xs">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    查看 LLM 原始响应
                                  </summary>
                                  <div className="mt-2 p-2 bg-muted rounded max-h-[200px] overflow-auto whitespace-pre-wrap font-mono text-[10px]">
                                    {testResult.test_result.llm_analysis.raw_response}
                                  </div>
                                </details>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <FlaskConical className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">点击测试按钮开始测试</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              关闭
            </Button>
            {!testing && (
              <Button onClick={handleTestCrawl} disabled={!loginStatus?.is_logged_in}>
                <FlaskConical className="mr-2 h-4 w-4" />
                重新测试
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parse URL Dialog */}
      <ParseUrlDialog open={parseDialogOpen} onOpenChange={setParseDialogOpen} />

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
                      原文链接（短链接）
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
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      最终跳转链接
                    </Label>
                    {selectedAnnouncement.final_url ? (
                      <a
                        href={selectedAnnouncement.final_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                      >
                        {selectedAnnouncement.final_url}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">未解析</p>
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
    </Tabs>
  );
}
