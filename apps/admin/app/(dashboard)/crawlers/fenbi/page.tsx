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
  Bot,
  Sparkles,
  MoreHorizontal,
  User,
  TestTube,
  LinkIcon,
  Search,
  Filter,
  UserCheck,
} from "lucide-react";
import { ParseUrlDialog } from "./components/ParseUrlDialog";
import { ParseResultDialog } from "./components/ParseResultDialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@what-cse/ui";
import {
  fenbiApi,
  FenbiCredential,
  FenbiLoginStatus,
  FenbiCategory,
  FenbiAnnouncement,
  FenbiCrawlProgress,
  ParseStep,
  ParseURLResult,
  FenbiParseTask,
  CreateParseTaskItem,
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
  
  // Parse result dialog states (for viewing task results)
  const [parseResultDialogOpen, setParseResultDialogOpen] = useState(false);
  const [selectedTaskResult, setSelectedTaskResult] = useState<{
    result: ParseURLResult | null;
    title: string;
  } | null>(null);

  // Filter states
  const [filterRegion, setFilterRegion] = useState("");
  const [filterExamType, setFilterExamType] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "tasks" | "completed" | "pending" | "failed">("all"); // 状态筛选
  const [filterKeyword, setFilterKeyword] = useState(""); // 关键词搜索

  // 任务步骤类型
  type TaskStep = {
    name: string;
    status: "pending" | "running" | "completed" | "failed";
    message?: string;
    startTime?: Date;
    endTime?: Date;
    data?: any; // 步骤相关的数据
  };

  const normalizeStepStatus = (status: string): TaskStep["status"] => {
    switch (status) {
      case "success":
      case "completed":
        return "completed";
      case "error":
      case "failed":
        return "failed";
      case "running":
        return "running";
      case "pending":
        return "pending";
      case "partial":
      case "skipped":
        return "completed";
      default:
        return "pending";
    }
  };

  const applyStepUpdate = (
    steps: TaskStep[] | undefined,
    stepName: string,
    updates: Partial<TaskStep>
  ) => {
    const baseSteps = steps || [];
    const stepIndex = baseSteps.findIndex((s) => s.name === stepName);
    if (stepIndex >= 0) {
      const nextSteps = [...baseSteps];
      nextSteps[stepIndex] = { ...nextSteps[stepIndex], ...updates };
      return nextSteps;
    }
    return [...baseSteps, { name: stepName, status: "pending" as const, ...updates }];
  };

  // Task queue - 公告任务队列（支持LLM解析）
  // 任务类型定义 - 前端使用的字段格式
  type TaskItem = {
    id: number;
    fenbi_announcement_id?: number;
    fenbi_id?: string;
    title: string;
    fenbiUrl?: string; // 前端使用驼峰命名
    status: "pending" | "running" | "parsing" | "completed" | "failed" | "skipped";
    message?: string;
    parseResult?: ParseURLResult;
    startTime?: string;
    endTime?: string;
    steps?: TaskStep[];
    isFromDB?: boolean; // 标识是否从数据库恢复（用于显示提示）
  };

  const toParseTaskSteps = (steps: TaskStep[]): ParseStep[] =>
    steps.map((step) => ({
      name: step.name,
      status:
        step.status === "completed"
          ? "success"
          : step.status === "failed"
          ? "error"
          : step.status,
      message: step.message || "",
      duration_ms: step.data?.duration_ms ?? 0,
      details: typeof step.data?.details === "string" ? step.data.details : undefined,
    }));

  const truncateText = (value?: string, limit = 60000) => {
    if (!value) return value;
    return value.length > limit ? `${value.slice(0, limit)}...(内容已截断)` : value;
  };

  const persistParseTaskUpdate = async (
    taskId: number,
    data: {
      status?: TaskItem["status"];
      message?: string;
      steps?: ParseStep[];
      parse_result_summary?: Record<string, unknown>;
    }
  ) => {
    try {
      await fenbiApi.updateParseTask(taskId, data);
    } catch (error) {
      console.error("Failed to update task in DB:", error);
    }
  };

  const persistTasksByStatus = async (
    tasks: TaskItem[],
    status: TaskItem["status"],
    message: string
  ) => {
    if (tasks.length === 0) return;
    await Promise.all(
      tasks.map((task) => persistParseTaskUpdate(task.id, { status, message }))
    );
  };

  const [taskQueue, setTaskQueue] = useState<TaskItem[]>([]);
  const [taskQueueLoading, setTaskQueueLoading] = useState(true);
  const [crawlStartTime, setCrawlStartTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  // 将 API 返回的任务转换为前端 TaskItem 格式
  const mapApiTaskToTaskItem = (task: FenbiParseTask): TaskItem => {
    const summary = task.parse_result_summary;
    const attachments = Array.isArray(summary?.attachments) ? summary.attachments : [];
    const positions =
      Array.isArray(summary?.positions) && summary.positions.length > 0
        ? summary.positions
        : (summary?.positions_count || 0) > 0
        ? Array(summary?.positions_count || 0).fill({ position_name: "已解析职位" })
        : [];
    const llmAnalysis =
      summary &&
      (summary.summary ||
        positions.length > 0 ||
        summary.exam_info ||
        summary.confidence !== undefined ||
        summary.raw_response ||
        summary.llm_error)
        ? {
            summary: summary.summary,
            confidence: summary.confidence,
            positions,
            exam_info: summary.exam_info,
            raw_response: summary.raw_response,
            error: summary.llm_error,
          }
        : undefined;
    const hasAnyData = Boolean(
      summary?.page_title ||
        summary?.page_content ||
        attachments.length > 0 ||
        llmAnalysis
    );
    const success =
      typeof summary?.success === "boolean" ? summary.success : hasAnyData;

    return {
      id: task.id,
      fenbi_announcement_id: task.fenbi_announcement_id,
      fenbi_id: task.fenbi_id,
      title: task.title,
      fenbiUrl: task.fenbi_url,
      status: task.status,
      message: task.message,
      startTime: task.started_at,
      endTime: task.completed_at,
      isFromDB: true, // 标识为从数据库恢复
      // 从数据库恢复完整的解析结果
      parseResult: summary
        ? {
            success,
            error: summary.error,
            steps: task.steps || [],
            data: {
              input_url: task.fenbi_url || "",
              page_title: summary.page_title,
              page_content: summary.page_content,
              final_url: summary.final_url,
              attachments,
              llm_analysis: llmAnalysis,
            },
          }
        : undefined,
      // 正确映射步骤，包含 duration_ms 和 details
      steps: task.steps?.map((step) => ({
        name: step.name,
        status: normalizeStepStatus(step.status),
        message: step.message,
        data: {
          duration_ms: step.duration_ms,
          details: step.details,
        },
      })),
    };
  };

  // 从数据库加载任务队列
  const loadTaskQueueFromDB = useCallback(async () => {
    try {
      setTaskQueueLoading(true);
      const result = await fenbiApi.getParseTasks({ page_size: 500 });
      const tasks: TaskItem[] = (result.tasks || []).map(mapApiTaskToTaskItem);
      setTaskQueue(tasks);
    } catch (error) {
      console.error("Failed to load task queue from DB:", error);
    } finally {
      setTaskQueueLoading(false);
    }
  }, []);

  // 初始化时加载任务
  useEffect(() => {
    loadTaskQueueFromDB();
  }, [loadTaskQueueFromDB]);
  
  // 任务详情 dialog
  const [taskDetailDialogOpen, setTaskDetailDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<typeof taskQueue[0] | null>(null);
  
  // 任务队列的 ref（用于在异步操作中获取最新值）
  const taskQueueRef = useRef(taskQueue);
  useEffect(() => {
    taskQueueRef.current = taskQueue;
  }, [taskQueue]);

  // Crawl config
  const [crawlRegions, setCrawlRegions] = useState<string[]>([]);
  const [crawlExamTypes, setCrawlExamTypes] = useState<string[]>([]);
  const [crawlYears, setCrawlYears] = useState<number[]>([]);
  const [parseParallelCount, setParseParallelCount] = useState(3); // LLM解析并行数，默认3
  const [hasMorePages, setHasMorePages] = useState(false); // 是否还有更多页面
  const [currentPageCount, setCurrentPageCount] = useState(0); // 当前已爬取的页数

  const loadCrawlStatus = useCallback(async () => {
    try {
      const status = await fenbiApi.getCrawlStatus();
      if (status?.progress) {
        setCrawlProgress(status.progress);
        setHasMorePages(!!status.progress.has_more_data);
        setCurrentPageCount(status.progress.pages_crawled || 0);
      } else {
        setCrawlProgress(null);
        setHasMorePages(false);
        setCurrentPageCount(0);
      }
      setCrawling(Boolean(status?.running));
    } catch (error) {
      console.error("Failed to load crawl status:", error);
    }
  }, []);

  useEffect(() => {
    loadCrawlStatus();
  }, [loadCrawlStatus]);

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
  // 停止解析标志
  const stopParsingRef = useRef(false);

  // 定义刷新函数，直接调用 API 避免闭包问题
  const refreshCrawlData = async () => {
    try {
      // 获取更多数据以检测新公告（不带筛选条件，获取最新的数据）
      const [announcementsRes, statsRes, latestRes] = await Promise.all([
        fenbiApi.getAnnouncements({
          page: 1,
          page_size: 20,
          region: filterRegion || undefined,
          exam_type: filterExamType || undefined,
          year: filterYear ? parseInt(filterYear) : undefined,
        }),
        fenbiApi.getStats(),
        // 额外请求：获取最新的100条数据（不带筛选）用于检测新公告
        fenbiApi.getAnnouncements({
          page: 1,
          page_size: 100,
        }),
      ]);
      
      const newAnnouncements = (announcementsRes as any).announcements || [];
      const latestAnnouncements = (latestRes as any).announcements || [];
      
      // 检测新增的公告，创建任务到数据库
      const newTaskItems: CreateParseTaskItem[] = [];
      
      // 从最新的数据中检测新公告
      for (const ann of latestAnnouncements) {
        if (!knownAnnouncementIdsRef.current.has(ann.id)) {
          knownAnnouncementIdsRef.current.add(ann.id);
          newTaskItems.push({
            fenbi_announcement_id: ann.id,
            fenbi_id: ann.fenbi_id,
            title: ann.title,
            fenbi_url: ann.fenbi_url,
          });
        }
      }
      
      // 调用 API 创建任务到数据库
      let createdTasks: TaskItem[] = [];
      if (newTaskItems.length > 0) {
        try {
          const result = await fenbiApi.createParseTasks(newTaskItems);
          // 将 API 返回的任务转换为 TaskItem 格式并添加到队列
          createdTasks = (result.tasks || []).map(mapApiTaskToTaskItem);
          
          // 将新任务添加到队列顶部
          if (createdTasks.length > 0) {
            setTaskQueue((prev) => [...createdTasks, ...prev].slice(0, 500)); // 最多保留500条
          }
        } catch (error) {
          console.error("Failed to create parse tasks:", error);
        }
      }
      
      setAnnouncements(newAnnouncements);
      setAnnouncementsTotal((announcementsRes as any).total || 0);
      setAnnouncementsPage(1); // 重置到第一页
      setStats(statsRes as any);
      
      return createdTasks; // 返回新增的任务列表，用于后续解析
    } catch (error) {
      console.error("Failed to refresh during crawl:", error);
      return [];
    }
  };
  
  // 更新任务步骤的辅助函数
  const updateTaskStep = (taskId: number, stepName: string, updates: Partial<TaskStep>) => {
    setTaskQueue((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSteps = applyStepUpdate(t.steps, stepName, updates);
        return { ...t, steps: updatedSteps };
      })
    );
  };

  // 将后端步骤状态转换为前端状态
  const mapStepStatus = (status: string): "pending" | "running" | "completed" | "failed" => {
    switch (status) {
      case "success":
        return "completed";
      case "error":
        return "failed";
      case "partial":
        return "completed"; // partial 也算完成，只是有部分失败
      case "skipped":
        return "completed"; // skipped 也算完成
      case "running":
        return "running";
      case "pending":
        return "pending";
      case "completed":
        return "completed";
      case "failed":
        return "failed";
      default:
        return "pending";
    }
  };

  // 并行解析控制函数
  // tasks 参数: 直接传入任务数组，避免依赖异步更新的 taskQueueRef
  const parseWithConcurrencyLimit = async (
    tasks: Array<{ id: number; title: string; fenbiUrl?: string }>,
    concurrency: number
  ) => {
    const executing: Promise<void>[] = [];
    
    // 创建一个 Map 用于快速查找任务信息
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    for (const task of tasks) {
      const taskId = task.id;
      
      // 检查是否应该停止
      if (stopParsingRef.current) {
        break;
      }
      
      const p = (async () => {
        // 直接使用传入的任务信息，而不是从 ref 中查找
        const currentTask = taskMap.get(taskId);
        
        // 初始化任务步骤（与后端 ParseURL 步骤一致）
        const initialSteps: TaskStep[] = [
          { name: "提取粉笔原文链接", status: "pending" },
          { name: "解析短链接", status: "pending" },
          { name: "获取页面内容", status: "pending" },
          { name: "下载解析附件", status: "pending" },
          { name: "LLM智能分析", status: "pending" },
          { name: "保存到数据库", status: "pending" },
        ];
        let currentSteps = initialSteps;
        
        // 更新任务状态为解析中
        setTaskQueue((prev) =>
          prev.map((t) =>
            t.id === taskId 
              ? { ...t, status: "parsing" as const, startTime: new Date().toISOString(), steps: initialSteps } 
              : t
          )
        );
        await persistParseTaskUpdate(taskId, {
          status: "parsing",
          message: "解析中",
          steps: toParseTaskSteps(currentSteps),
        });
        
        // 检查 fenbiUrl 是否存在
        if (!currentTask?.fenbiUrl) {
          // 更新第一个步骤为失败
          currentSteps = applyStepUpdate(currentSteps, "提取粉笔原文链接", {
            status: "failed",
            message: "公告URL为空",
            startTime: new Date(),
            endTime: new Date(),
          });
          updateTaskStep(taskId, "提取粉笔原文链接", { 
            status: "failed", 
            message: "公告URL为空", 
            startTime: new Date(),
            endTime: new Date() 
          });
          setTaskQueue((prev) =>
            prev.map((t) =>
              t.id === taskId
                ? { ...t, status: "failed" as const, message: "无URL", endTime: new Date().toISOString() }
                : t
            )
          );
          await persistParseTaskUpdate(taskId, {
            status: "failed",
            message: "无URL",
            steps: toParseTaskSteps(currentSteps),
          });
          return;
        }
        
        // 标记第一个步骤为运行中
        currentSteps = applyStepUpdate(currentSteps, "提取粉笔原文链接", { 
          status: "running", 
          startTime: new Date(),
          message: "正在解析..."
        });
        updateTaskStep(taskId, "提取粉笔原文链接", { 
          status: "running", 
          startTime: new Date(),
          message: "正在解析..."
        });
        await persistParseTaskUpdate(taskId, {
          steps: toParseTaskSteps(currentSteps),
        });
        
        try {
          // 调用解析API（后端会返回详细的步骤信息）
          const result = await fenbiApi.parseUrl(currentTask.fenbiUrl);
          
          // 根据后端返回的 steps 更新前端任务步骤
          if (result.steps && result.steps.length > 0) {
            // 使用后端返回的步骤信息更新前端显示
            const updatedSteps: TaskStep[] = result.steps.map((step) => ({
              name: step.name,
              status: mapStepStatus(step.status),
              message: step.message,
              startTime: new Date(), // 后端没有返回具体时间，使用当前时间
              endTime: new Date(),
              data: step.details ? { details: step.details, duration_ms: step.duration_ms } : { duration_ms: step.duration_ms },
            }));
            currentSteps = updatedSteps;
            
            // 更新任务的所有步骤
            setTaskQueue((prev) =>
              prev.map((t) =>
                t.id === taskId
                  ? { ...t, steps: updatedSteps }
                  : t
              )
            );
          }
          
          // 判断整体是否成功
          const hasError = result.steps?.some((s) => s.status === "error");
          const finalStatus = result.success ? "completed" : (hasError ? "failed" : "completed");
          const finalMessage = result.success 
            ? (result.data?.llm_analysis?.summary 
                ? `解析完成，提取 ${result.data.llm_analysis.positions?.length || 0} 个岗位` 
                : "解析完成")
            : (result.error || "解析失败");
          
          // 更新前端状态
          setTaskQueue((prev) =>
            prev.map((t) =>
              t.id === taskId
                ? { 
                    ...t, 
                    status: finalStatus as "completed" | "failed", 
                    parseResult: result, 
                    message: finalMessage,
                    endTime: new Date().toISOString() 
                  }
                : t
            )
          );
          
          // 同步更新到数据库（保存完整解析结果，用于刷新后恢复）
        await persistParseTaskUpdate(taskId, {
          status: finalStatus,
          message: finalMessage,
          steps: result.steps,
          parse_result_summary: {
            success: result.success,
            error: result.error,
            positions_count: result.data?.llm_analysis?.positions?.length || 0,
            summary: result.data?.llm_analysis?.summary,
            confidence: result.data?.llm_analysis?.confidence,
            // 保存完整数据用于刷新后恢复
            page_title: result.data?.page_title,
            page_content: truncateText(result.data?.page_content, 60000),
            final_url: result.data?.final_url,
            attachments: result.data?.attachments?.map(att => ({
              name: att.name,
              url: att.url,
              type: att.type,
              content: truncateText(att.content, 20000),
              error: att.error,
            })),
            positions: result.data?.llm_analysis?.positions,
            exam_info: result.data?.llm_analysis?.exam_info,
            raw_response: truncateText(result.data?.llm_analysis?.raw_response, 20000),
            llm_error: result.data?.llm_analysis?.error,
          },
        });
        } catch (error: any) {
          // 标记任务失败
        currentSteps = applyStepUpdate(currentSteps, "提取粉笔原文链接", { 
          status: "failed", 
          message: error?.message || "请求失败",
          endTime: new Date() 
        });
          updateTaskStep(taskId, "提取粉笔原文链接", { 
            status: "failed", 
            message: error?.message || "请求失败",
            endTime: new Date() 
          });
          
          if (!stopParsingRef.current) {
            // 更新前端状态
            setTaskQueue((prev) =>
              prev.map((t) =>
                t.id === taskId
                  ? { ...t, status: "failed" as const, message: error?.message || "解析失败", endTime: new Date().toISOString() }
                  : t
            )
            );
            
            // 同步更新到数据库
          await persistParseTaskUpdate(taskId, {
            status: "failed",
            message: error?.message || "解析失败",
            steps: toParseTaskSteps(currentSteps),
          });
          }
        }
      })();
      
      const pWithCleanup = p.then(() => {
        executing.splice(executing.indexOf(pWithCleanup), 1);
      });
      executing.push(pWithCleanup);
      
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
    
    await Promise.all(executing);
  };

  // 爬取单页数据的核心函数
  const crawlSinglePage = async (isReset: boolean) => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    const excludedExamTypes = ["shengkao", "guokao"];
    const examTypesToCrawl = crawlExamTypes.length > 0 
      ? crawlExamTypes 
      : categories.exam_types.filter((type) => !excludedExamTypes.includes(type.code)).map((type) => type.code);
    
    const pageNum = isReset ? 1 : currentPageCount + 1;
    
    // 更新进度显示：正在爬取第N页
    setCrawlProgress({
      total_tasks: 0,
      completed_tasks: 0,
      current_task: `正在爬取第 ${pageNum} 页...`,
      items_crawled: 0,
      items_saved: 0,
      status: "running",
      message: `正在爬取第 ${pageNum} 页数据...`,
    });
    
    // 调用爬取 API，设置 max_pages: 1 只爬取一页
    let crawlResult: FenbiCrawlProgress | null = null;
    crawlResult = await fenbiApi.triggerCrawl({
      regions: crawlRegions.length > 0 ? crawlRegions : undefined,
      exam_types: examTypesToCrawl,
      years: crawlYears.length > 0 ? crawlYears : undefined,
      max_pages: 1, // 每次只爬取一页
      reset: isReset, // 是否重置位置
      // 不跳过保存，数据先存入数据库，refreshCrawlData 从数据库获取新数据创建任务
    }) as FenbiCrawlProgress;
    
    // 获取新爬取的数据
    const newTasks = await refreshCrawlData();
    
    // 更新状态
    const hasMore = crawlResult?.has_more_data ?? false;
    setHasMorePages(hasMore);
    setCurrentPageCount(pageNum);
    
    // 更新进度
    setCrawlProgress({
      total_tasks: newTasks.length,
      completed_tasks: 0,
      current_task: hasMore ? `第 ${pageNum} 页完成，共 ${newTasks.length} 条` : `爬取完成，共 ${newTasks.length} 条`,
      items_crawled: crawlResult?.items_crawled || 0,
      items_saved: crawlResult?.items_saved || 0,
      status: hasMore ? "paused" : "completed",
      message: hasMore ? `第 ${pageNum} 页爬取完成，点击"下一页"继续` : "全部爬取完成",
    });
    
    // 如果有新数据，执行LLM解析
    if (newTasks.length > 0) {
      // 更新进度：开始解析
      setCrawlProgress((prev) => prev ? {
        ...prev,
        current_task: `第 ${pageNum} 页：解析 ${newTasks.length} 条数据...`,
        status: "running",
        message: `正在解析第 ${pageNum} 页数据 (${newTasks.length} 条)...`,
      } : null);
      
      // 执行并行LLM解析 - 直接传入任务数组，避免依赖异步更新的 ref
      await parseWithConcurrencyLimit(newTasks, parseParallelCount);
      
      // 解析完成，更新进度
      setCrawlProgress((prev) => prev ? {
        ...prev,
        current_task: hasMore ? `第 ${pageNum} 页完成` : "全部完成",
        status: hasMore ? "paused" : "completed",
        message: hasMore ? `第 ${pageNum} 页解析完成，点击"下一页"继续` : "全部爬取和解析完成",
      } : null);
    }
    
    return { hasMore, newTasksCount: newTasks.length };
  };

  const handleTriggerCrawl = async () => {
    // 辅助函数：延迟
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    setCrawling(true);
    setCrawlProgress(null);
    setActiveTab("tasks"); // 切换到任务 Tab
    setCrawlStartTime(new Date());
    // 不再清空任务队列，保留之前的任务记录
    // setTaskQueue([]); 
    stopParsingRef.current = false; // 重置停止标志
    setHasMorePages(false); // 重置更多页面标志
    setCurrentPageCount(0); // 重置页数计数
    
    // 等待 UI 更新
    await sleep(100);
    
    // 初始化已知公告ID集合（包括当前任务队列中的ID + 数据库中的公告ID）
    // 这样可以避免重复添加已存在的任务
    const existingTaskIds = new Set(taskQueue.map((t) => t.id));
    knownAnnouncementIdsRef.current = new Set([...existingTaskIds, ...announcements.map((a) => a.id)]);
    
    try {
      // 只爬取第一页，不自动继续
      await crawlSinglePage(true);
      
    } catch (error: any) {
      // 忽略用户主动取消的错误
      const isCanceled = error?.name === 'CanceledError' || 
                         error?.name === 'AbortError' || 
                         error?.code === 'ERR_CANCELED' ||
                         error?.message === 'canceled';
      const runningTasks = taskQueueRef.current.filter(
        (task) => task.status === "running" || task.status === "parsing"
      );
      if (!isCanceled) {
        console.error("Failed to trigger crawl:", error);
        // 标记正在处理的任务为失败
        await persistTasksByStatus(runningTasks, "failed", "爬取失败");
        setTaskQueue((prev) => prev.map((task) => 
          task.status === "running" || task.status === "parsing"
            ? { ...task, status: "failed" as const, message: "爬取失败", endTime: new Date().toISOString() }
            : task
        ));
      } else {
        // 标记正在处理的任务为已停止
        await persistTasksByStatus(runningTasks, "skipped", "已停止");
        setTaskQueue((prev) => prev.map((task) => 
          task.status === "running" || task.status === "parsing"
            ? { ...task, status: "skipped" as const, message: "已停止", endTime: new Date().toISOString() }
            : task
        ));
      }
    } finally {
      // 停止定时器（如果有）
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

  // 手动触发下一页爬取
  const handleNextPage = async () => {
    if (!hasMorePages || crawling) return;
    
    setCrawling(true);
    stopParsingRef.current = false;
    
    try {
      await crawlSinglePage(false); // 不重置，继续下一页
    } catch (error: any) {
      console.error("Failed to crawl next page:", error);
      const runningTasks = taskQueueRef.current.filter(
        (task) => task.status === "running" || task.status === "parsing"
      );
      await persistTasksByStatus(runningTasks, "failed", "爬取失败");
      setTaskQueue((prev) => prev.map((task) => 
        task.status === "running" || task.status === "parsing"
          ? { ...task, status: "failed" as const, message: "爬取失败", endTime: new Date().toISOString() }
          : task
      ));
    } finally {
      await refreshCrawlData();
      setCrawling(false);
    }
  };

  const handleStopCrawl = async () => {
    // 设置停止解析标志
    stopParsingRef.current = true;
    
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
    
    // 标记所有待处理的任务为已跳过
    const pendingTasks = taskQueueRef.current.filter(
      (task) => task.status === "pending" || task.status === "parsing"
    );
    await persistTasksByStatus(pendingTasks, "skipped", "已停止");
    setTaskQueue((prev) => prev.map((task) => 
      task.status === "pending" || task.status === "parsing"
        ? { ...task, status: "skipped" as const, message: "已停止", endTime: new Date().toISOString() }
        : task
    ));
    
    // 更新状态
    setCrawling(false);
    setCrawlProgress((prev) => prev ? { ...prev, status: "stopped", message: "爬取已停止" } : null);
    
    // 最终刷新一次数据
    await refreshCrawlData();
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
        return <Badge variant="outline" className="text-xs whitespace-nowrap">待爬取</Badge>;
      case 1:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs whitespace-nowrap">已爬列表</Badge>;
      case 2:
        return <Badge className="text-xs whitespace-nowrap">已爬详情</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs whitespace-nowrap">未知</Badge>;
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

  // 根据筛选条件过滤任务列表
  const getFilteredTasks = () => {
    return taskQueue.filter(task => {
      // 状态筛选
      if (filterStatus === "completed" && task.status !== "completed") return false;
      if (filterStatus === "pending" && task.status !== "pending") return false;
      if (filterStatus === "failed" && task.status !== "failed" && task.status !== "skipped") return false;
      
      // 关键词搜索
      if (filterKeyword && !task.title.toLowerCase().includes(filterKeyword.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const displayTasks = getFilteredTasks();
  
  // 计算任务统计
  const taskStats = {
    total: taskQueue.length,
    completed: taskQueue.filter(t => t.status === "completed").length,
    pending: taskQueue.filter(t => t.status === "pending").length,
    parsing: taskQueue.filter(t => t.status === "parsing" || t.status === "running").length,
    failed: taskQueue.filter(t => t.status === "failed" || t.status === "skipped").length,
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] flex flex-col gap-2">
      {/* Top Toolbar */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-2">

        {/* Account Status - Compact */}
        <div 
          className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md border cursor-pointer hover:bg-muted/80 transition-colors"
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
          title="点击管理账号"
        >
          {getStatusIcon(loginStatus?.status || 0)}
          <span className="text-xs font-medium">
            {credential?.phone_masked || "未配置账号"}
          </span>
        </div>

        {/* Inline Stats */}
        <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
          <span className="text-foreground font-medium">{stats?.total || 0}</span>
          <span>总数</span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-emerald-600 font-medium">{stats?.by_crawl_status?.[2] || 0}</span>
          <span>已完成</span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-blue-600 font-medium">{(stats?.total || 0) - (stats?.by_crawl_status?.[2] || 0)}</span>
          <span>待处理</span>
        </div>

        {/* Login Warning - Inline */}
        {!loginStatus?.is_logged_in && (
          <div className="hidden lg:flex items-center gap-1 text-xs text-orange-600">
            <AlertCircle className="h-3 w-3" />
            <span>请先登录</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Primary Actions */}
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
              停止爬取
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

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={handleTestCrawl}
                disabled={!loginStatus?.is_logged_in || testing}
              >
                {testing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FlaskConical className="mr-2 h-4 w-4" />
                )}
                测试爬取
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParseDialogOpen(true)}
                disabled={!loginStatus?.is_logged_in}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                解析URL
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCookieDialogOpen(true)}>
                <Cookie className="mr-2 h-4 w-4" />
                导入Cookie
              </DropdownMenuItem>
              <DropdownMenuItem
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
              >
                <Key className="mr-2 h-4 w-4" />
                账号设置
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task List */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 py-3 px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Left: Title and Status */}
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                任务列表
              </CardTitle>
              {taskQueue.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary">{taskStats.total} 任务</Badge>
                  {taskStats.completed > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {taskStats.completed}
                    </Badge>
                  )}
                  {taskStats.parsing > 0 && (
                    <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      {taskStats.parsing}
                    </Badge>
                  )}
                  {taskStats.failed > 0 && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                      <XCircle className="h-3 w-3 mr-1" />
                      {taskStats.failed}
                    </Badge>
                  )}
                </div>
              )}
              {crawling && (
                <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  爬取中
                </Badge>
              )}
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {crawlStartTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="h-3 w-3" />
                  {crawlStartTime.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              )}
              {!crawling && hasMorePages && (
                <Button size="sm" variant="default" onClick={handleNextPage} className="h-7 text-xs">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  下一页
                </Button>
              )}
              {!crawling && taskQueue.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      // 调用 API 清除所有任务
                      await fenbiApi.deleteAllParseTasks();
                      setTaskQueue([]);
                      setHasMorePages(false);
                      setCurrentPageCount(0);
                    } catch (error) {
                      console.error("Failed to clear tasks:", error);
                    }
                  }}
                  className="h-7 text-xs"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  清除任务
                </Button>
              )}
            </div>
          </div>
          
          {/* Filter Row - 简化版 */}
          {taskQueue.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="搜索任务标题..."
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  className="h-7 text-xs pl-7"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={(v: typeof filterStatus) => setFilterStatus(v)}>
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Clear Filters */}
              {(filterKeyword || filterStatus !== "all") && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFilterKeyword("");
                    setFilterStatus("all");
                  }}
                  className="h-7 text-xs"
                >
                  清除筛选
                </Button>
              )}
            </div>
          )}
          
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
                  <TableHead className="w-16 py-2 text-xs">状态</TableHead>
                  <TableHead className="py-2 text-xs">任务标题</TableHead>
                  <TableHead className="w-28 py-2 text-xs">时间</TableHead>
                  <TableHead className="w-20 py-2 text-xs">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Empty State */}
                {displayTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        {crawling ? (
                          <>
                            <Loader2 className="h-8 w-8 animate-spin opacity-50" />
                            <p className="text-sm">正在获取公告列表...</p>
                          </>
                        ) : taskQueue.length === 0 ? (
                          <>
                            <Activity className="h-8 w-8 opacity-30" />
                            <p className="text-sm">暂无任务</p>
                            <p className="text-xs">点击"开始爬取"创建解析任务</p>
                          </>
                        ) : (
                          <>
                            <Search className="h-8 w-8 opacity-30" />
                            <p className="text-sm">没有匹配的任务</p>
                            <p className="text-xs">请调整筛选条件</p>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {/* Task Rows */}
                {displayTasks.map((task) => (
                  <TableRow 
                    key={`task-${task.id}`} 
                    className={`group cursor-pointer hover:bg-muted/50 ${
                      task.status === "completed" ? "bg-emerald-50/30 dark:bg-emerald-950/10" :
                      task.status === "parsing" || task.status === "running" ? "bg-violet-50/30 dark:bg-violet-950/10" :
                      task.status === "failed" || task.status === "skipped" ? "bg-red-50/30 dark:bg-red-950/10" :
                      ""
                    }`}
                    onClick={() => {
                      setSelectedTask(task);
                      setTaskDetailDialogOpen(true);
                    }}
                  >
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        {task.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        )}
                        {task.status === "parsing" && (
                          <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />
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
                      <div className="flex flex-col">
                        <span className={`text-sm line-clamp-1 ${
                          task.status === "completed" ? "text-foreground" :
                          task.status === "parsing" ? "text-violet-700 dark:text-violet-300 font-medium" :
                          task.status === "failed" || task.status === "skipped" ? "text-red-700 dark:text-red-300" :
                          "text-muted-foreground"
                        }`}>
                          {task.title}
                        </span>
                        {task.message && (
                          <span className={`text-xs line-clamp-1 ${
                            task.status === "failed" || task.status === "skipped" ? "text-red-500" : "text-muted-foreground"
                          }`}>
                            {task.message}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {task.endTime ? new Date(task.endTime).toLocaleTimeString("zh-CN", { 
                        hour: "2-digit", minute: "2-digit", second: "2-digit" 
                      }) : task.startTime ? new Date(task.startTime).toLocaleTimeString("zh-CN", { 
                        hour: "2-digit", minute: "2-digit", second: "2-digit" 
                      }) : "-"}
                    </TableCell>
                    <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setSelectedTask(task);
                            setTaskDetailDialogOpen(true);
                          }}
                          title="查看详情"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {task.fenbiUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            asChild
                            title="打开粉笔"
                          >
                            <a href={task.fenbiUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          
          {/* Footer Stats */}
          {taskQueue.length > 0 && (
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t bg-muted/20">
              <div className="text-xs text-muted-foreground">
                显示 {displayTasks.length} / {taskQueue.length} 任务
              </div>
              <div className="text-xs text-muted-foreground">
                {taskStats.completed > 0 && <span className="text-emerald-600 mr-3">{taskStats.completed} 完成</span>}
                {taskStats.parsing > 0 && <span className="text-violet-600 mr-3">{taskStats.parsing} 进行中</span>}
                {taskStats.pending > 0 && <span className="text-gray-500 mr-3">{taskStats.pending} 待处理</span>}
                {taskStats.failed > 0 && <span className="text-red-500">{taskStats.failed} 失败</span>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                LLM解析并行数
              </Label>
              <Select
                value={parseParallelCount.toString()}
                onValueChange={(value) => setParseParallelCount(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 8, 10].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} 个并行
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                同时进行LLM解析的最大任务数，建议根据API限流设置
              </p>
            </div>

            {/* Current Config Summary */}
            <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
              <p className="font-medium">当前配置：</p>
              <p>地区: {crawlRegions.length === 0 ? "全部" : categories.regions.find((r) => r.code === crawlRegions[0])?.name || crawlRegions[0]}</p>
              <p>类型: {crawlExamTypes.length === 0 ? "全部（排除省考/国考）" : categories.exam_types.find((t) => t.code === crawlExamTypes[0])?.name || crawlExamTypes[0]}</p>
              <p>年份: {crawlYears.length === 0 ? "全部" : crawlYears.join(", ")}</p>
              <p>LLM并行: {parseParallelCount} 个</p>
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

      {/* Task Detail Dialog - 任务执行详情（融合完整结果） */}
      <Dialog open={taskDetailDialogOpen} onOpenChange={setTaskDetailDialogOpen}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">任务执行详情</DialogTitle>
          {selectedTask && (
            <>
              {/* Header - 任务概览 */}
              <div className="flex-shrink-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-fuchsia-500/20 px-5 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex-shrink-0">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold truncate">{selectedTask.title}</span>
                        {selectedTask.status === "completed" && (
                          <Badge className="bg-emerald-500/90 text-xs flex-shrink-0">完成</Badge>
                        )}
                        {selectedTask.status === "parsing" && (
                          <Badge className="bg-violet-500/90 text-xs flex-shrink-0">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            解析中
                          </Badge>
                        )}
                        {selectedTask.status === "pending" && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">待处理</Badge>
                        )}
                        {selectedTask.status === "failed" && (
                          <Badge variant="destructive" className="text-xs flex-shrink-0">失败</Badge>
                        )}
                        {selectedTask.status === "skipped" && (
                          <Badge className="bg-orange-500/90 text-xs flex-shrink-0">已跳过</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        任务ID: {selectedTask.id} · 
                        {selectedTask.startTime && ` 开始: ${new Date(selectedTask.startTime).toLocaleTimeString("zh-CN")}`}
                        {selectedTask.endTime && ` · 结束: ${new Date(selectedTask.endTime).toLocaleTimeString("zh-CN")}`}
                      </p>
                    </div>
                  </div>
                  {/* 统计数据 */}
                  {selectedTask.steps && selectedTask.steps.length > 0 && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono">
                          {(selectedTask.steps.reduce((acc, s) => acc + (s.data?.duration_ms || 0), 0) / 1000).toFixed(1)}s
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        <span>{selectedTask.steps.filter(s => s.status === "completed").length}/{selectedTask.steps.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* URL Bar - 紧凑型 */}
              <div className="flex-shrink-0 px-5 py-2 bg-muted/30 border-b flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>粉笔链接:</span>
                </div>
                {selectedTask.fenbiUrl ? (
                  <a
                    href={selectedTask.fenbiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate flex items-center gap-1 min-w-0 flex-1"
                  >
                    <span className="truncate">{selectedTask.fenbiUrl}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
                  </a>
                ) : (
                  <span className="text-xs text-red-500">无URL</span>
                )}
                {selectedTask.parseResult?.data?.final_url && selectedTask.parseResult.data.final_url !== selectedTask.fenbiUrl && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <a
                      href={selectedTask.parseResult.data.final_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline truncate flex items-center gap-1 min-w-0"
                    >
                      <span className="truncate">最终链接</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
                    </a>
                  </>
                )}
              </div>

              {/* 错误信息 - 如果有 */}
              {selectedTask.status === "failed" && selectedTask.message && (
                <div className="flex-shrink-0 mx-5 mt-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">任务执行失败</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{selectedTask.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content - 左右分栏布局 */}
              <div className="flex-1 min-h-0 overflow-hidden flex">
                {/* 左侧 - 执行步骤 */}
                <div className="w-64 flex-shrink-0 border-r flex flex-col bg-muted/10">
                  <div className="flex-shrink-0 h-10 px-3 flex items-center border-b bg-muted/20">
                    <Activity className="h-3.5 w-3.5 text-violet-600 mr-1.5" />
                    <span className="text-xs font-semibold">执行流程</span>
                    {selectedTask.steps && selectedTask.steps.length > 0 && (
                      <Badge variant="outline" className="ml-auto text-[10px] h-5">
                        {selectedTask.steps.length} 步
                      </Badge>
                    )}
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1.5">
                      {selectedTask.steps && selectedTask.steps.length > 0 ? (
                        selectedTask.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-md border text-xs ${
                              step.status === "completed"
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                                : step.status === "running"
                                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                                : step.status === "failed"
                                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                                : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 flex items-center justify-center rounded bg-background/80 text-[10px] font-bold text-muted-foreground">
                                {idx + 1}
                              </span>
                              {step.status === "completed" && (
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                              )}
                              {step.status === "running" && (
                                <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                              )}
                              {step.status === "failed" && (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              {step.status === "pending" && (
                                <Clock className="h-3 w-3 text-gray-400" />
                              )}
                              <span className="font-medium flex-1 truncate">{step.name}</span>
                              {step.data?.duration_ms !== undefined && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {step.data.duration_ms}ms
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] mt-1 pl-6 line-clamp-2 ${
                              step.status === "failed" ? "text-red-600" : "text-muted-foreground"
                            }`}>
                              {step.message}
                            </p>
                            {step.data?.details && (
                              <details className="mt-1 pl-6">
                                <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                                  详情
                                </summary>
                                <pre className="mt-1 text-[10px] bg-background/80 p-1.5 rounded overflow-auto max-h-20 whitespace-pre-wrap">
                                  {step.data.details}
                                </pre>
                              </details>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <Clock className="h-8 w-8 mb-2 opacity-30" />
                          <p className="text-xs">
                            {selectedTask.status === "pending" ? "等待执行" : "暂无步骤"}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  {/* 底部统计 */}
                  {selectedTask.steps && selectedTask.steps.length > 0 && (
                    <div className="flex-shrink-0 px-3 py-2 border-t bg-muted/20 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">总耗时</span>
                        <span className="font-mono font-medium">
                          {(selectedTask.steps.reduce((acc, s) => acc + (s.data?.duration_ms || 0), 0) / 1000).toFixed(2)}s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">成功</span>
                        <span className="font-medium text-emerald-600">
                          {selectedTask.steps.filter(s => s.status === "completed").length}/{selectedTask.steps.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 右侧 - 解析结果 Tabs */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                  {selectedTask.parseResult?.data ? (
                    <>
                      {selectedTask.parseResult.success === false && selectedTask.parseResult.error && (
                        <div className="flex-shrink-0 px-4 py-2 text-xs bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                          {selectedTask.parseResult.error}
                        </div>
                      )}
                      <Tabs defaultValue="llm" className="flex-1 flex flex-col min-h-0">
                      <div className="flex-shrink-0 h-10 px-3 flex items-center border-b bg-muted/20">
                        <TabsList className="h-7 bg-transparent p-0 gap-1">
                          <TabsTrigger
                            value="llm"
                            className="h-7 px-3 text-xs data-[state=active]:bg-violet-100 dark:data-[state=active]:bg-violet-900/30 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 rounded"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            AI 分析
                          </TabsTrigger>
                          <TabsTrigger
                            value="content"
                            className="h-7 px-3 text-xs data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            内容
                          </TabsTrigger>
                          <TabsTrigger
                            value="positions"
                            className="h-7 px-3 text-xs data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 rounded"
                          >
                            <User className="h-3 w-3 mr-1" />
                            岗位
                            {selectedTask.parseResult.data.llm_analysis?.positions && selectedTask.parseResult.data.llm_analysis.positions.length > 0 && (
                              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                                {selectedTask.parseResult.data.llm_analysis.positions.length}
                              </Badge>
                            )}
                          </TabsTrigger>
                          <TabsTrigger
                            value="attachments"
                            className="h-7 px-3 text-xs data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-300 rounded"
                          >
                            <Database className="h-3 w-3 mr-1" />
                            附件
                            {selectedTask.parseResult.data.attachments && selectedTask.parseResult.data.attachments.length > 0 && (
                              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                                {selectedTask.parseResult.data.attachments.length}
                              </Badge>
                            )}
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      {/* AI 分析 Tab */}
                      <TabsContent value="llm" className="flex-1 min-h-0 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <div className="p-4 space-y-3">
                            {selectedTask.parseResult.data.llm_analysis ? (
                              selectedTask.parseResult.data.llm_analysis.error ? (
                                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                                  <div className="flex items-center gap-2 mb-1">
                                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                                    <span className="text-xs font-medium text-red-700 dark:text-red-300">分析失败</span>
                                  </div>
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {selectedTask.parseResult.data.llm_analysis.error}
                                  </p>
                                </div>
                              ) : (
                                <>
                                  {/* 摘要卡片 */}
                                  {selectedTask.parseResult.data.llm_analysis.summary && (
                                    <div className="p-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                                        <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">公告摘要</span>
                                      </div>
                                      <p className="text-xs leading-relaxed text-violet-900 dark:text-violet-100">
                                        {selectedTask.parseResult.data.llm_analysis.summary}
                                      </p>
                                    </div>
                                  )}

                                  {/* 考试信息卡片 */}
                                  {selectedTask.parseResult.data.llm_analysis.exam_info && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">考试信息</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {selectedTask.parseResult.data.llm_analysis.exam_info.exam_type && (
                                          <div className="col-span-2">
                                            <Badge className="bg-blue-600 text-white text-xs h-5">
                                              {selectedTask.parseResult.data.llm_analysis.exam_info.exam_type}
                                            </Badge>
                                          </div>
                                        )}
                                        {selectedTask.parseResult.data.llm_analysis.exam_info.registration_start && (
                                          <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                                            <p className="text-[10px] text-muted-foreground mb-0.5">报名开始</p>
                                            <p className="text-xs font-medium">{selectedTask.parseResult.data.llm_analysis.exam_info.registration_start}</p>
                                          </div>
                                        )}
                                        {selectedTask.parseResult.data.llm_analysis.exam_info.registration_end && (
                                          <div className="p-2 bg-white/50 dark:bg-black/20 rounded border-l-2 border-red-400">
                                            <p className="text-[10px] text-muted-foreground mb-0.5">报名截止</p>
                                            <p className="text-xs font-semibold text-red-600">{selectedTask.parseResult.data.llm_analysis.exam_info.registration_end}</p>
                                          </div>
                                        )}
                                        {selectedTask.parseResult.data.llm_analysis.exam_info.exam_date && (
                                          <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                                            <p className="text-[10px] text-muted-foreground mb-0.5">考试时间</p>
                                            <p className="text-xs font-medium">{selectedTask.parseResult.data.llm_analysis.exam_info.exam_date}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* 招录职位卡片 */}
                                  {selectedTask.parseResult.data.llm_analysis.positions && selectedTask.parseResult.data.llm_analysis.positions.length > 0 && (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                          <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">招录职位</span>
                                        </div>
                                        <Badge className="bg-emerald-600 text-xs h-5">
                                          {selectedTask.parseResult.data.llm_analysis.positions.length} 个
                                        </Badge>
                                      </div>
                                      <div className="space-y-1.5 max-h-48 overflow-auto">
                                        {selectedTask.parseResult.data.llm_analysis.positions.slice(0, 5).map((pos, idx) => (
                                          <div key={idx} className="p-2 bg-white dark:bg-gray-900/50 rounded border text-xs">
                                            <div className="flex items-start justify-between">
                                              <span className="font-medium">{pos.position_name || "未知职位"}</span>
                                              {pos.recruit_count && (
                                                <Badge variant="outline" className="text-[10px] h-4 bg-emerald-50 dark:bg-emerald-900/30">
                                                  招 {pos.recruit_count} 人
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                              {pos.department_name && (
                                                <Badge variant="outline" className="text-[10px] h-4 gap-0.5">
                                                  <MapPin className="h-2.5 w-2.5" />
                                                  {pos.department_name}
                                                </Badge>
                                              )}
                                              {pos.education && (
                                                <Badge variant="outline" className="text-[10px] h-4">
                                                  {pos.education}
                                                </Badge>
                                              )}
                                              {pos.political_status && (
                                                <Badge 
                                                  variant="outline" 
                                                  className={`text-[10px] h-4 gap-0.5 ${
                                                    pos.political_status.includes("党员") 
                                                      ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300" 
                                                      : ""
                                                  }`}
                                                >
                                                  <UserCheck className="h-2.5 w-2.5" />
                                                  {pos.political_status}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                        {selectedTask.parseResult.data.llm_analysis.positions.length > 5 && (
                                          <p className="text-[10px] text-center text-muted-foreground py-1">
                                            还有 {selectedTask.parseResult.data.llm_analysis.positions.length - 5} 个职位，切换到"岗位"标签查看全部
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* 置信度 */}
                                  <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                                    <span className="text-xs text-muted-foreground">分析置信度</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            (selectedTask.parseResult.data.llm_analysis.confidence || 0) >= 80
                                              ? "bg-emerald-500"
                                              : (selectedTask.parseResult.data.llm_analysis.confidence || 0) >= 60
                                              ? "bg-amber-500"
                                              : "bg-red-500"
                                          }`}
                                          style={{ width: `${selectedTask.parseResult.data.llm_analysis.confidence || 0}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-semibold w-8 text-right">
                                        {selectedTask.parseResult.data.llm_analysis.confidence || 0}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* LLM 原始响应 */}
                                  {selectedTask.parseResult.data.llm_analysis.raw_response && (
                                    <details className="group">
                                      <summary className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer hover:text-foreground py-1">
                                        <Eye className="h-3 w-3" />
                                        查看 LLM 原始响应
                                      </summary>
                                      <div className="mt-1 p-2 bg-muted rounded-lg max-h-40 overflow-auto">
                                        <pre className="text-[10px] whitespace-pre-wrap font-mono">
                                          {selectedTask.parseResult.data.llm_analysis.raw_response}
                                        </pre>
                                      </div>
                                    </details>
                                  )}
                                </>
                              )
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Zap className="h-8 w-8 mb-2 opacity-30" />
                                <p className="text-xs">暂无 AI 分析结果</p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      {/* 内容 Tab */}
                      <TabsContent value="content" className="flex-1 min-h-0 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <div className="p-4 space-y-3">
                            {selectedTask.parseResult.data.page_title && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                <Label className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase">
                                  页面标题
                                </Label>
                                <p className="text-sm font-medium mt-1">{selectedTask.parseResult.data.page_title}</p>
                              </div>
                            )}
                            {selectedTask.parseResult.data.page_content && (
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <Label className="text-[10px] text-muted-foreground uppercase">页面正文</Label>
                                  <Badge variant="outline" className="text-[10px] h-4">
                                    {selectedTask.parseResult.data.page_content.length.toLocaleString()} 字符
                                  </Badge>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg border overflow-auto max-h-[350px]">
                                  <pre className="text-xs whitespace-pre-wrap leading-relaxed">
                                    {selectedTask.parseResult.data.page_content}
                                  </pre>
                                </div>
                              </div>
                            )}
                            {!selectedTask.parseResult.data.page_title && !selectedTask.parseResult.data.page_content && (
                              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <FileText className="h-8 w-8 mb-2 opacity-30" />
                                {selectedTask.isFromDB ? (
                                  <>
                                    <p className="text-xs">页面内容未保存到数据库</p>
                                    <p className="text-[10px] mt-1 opacity-70">仅保存摘要信息，重新解析可获取完整内容</p>
                                  </>
                                ) : (
                                  <p className="text-xs">未提取到页面内容</p>
                                )}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      {/* 岗位 Tab */}
                      <TabsContent value="positions" className="flex-1 min-h-0 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <div className="p-4 space-y-4">
                            {selectedTask.parseResult.data.llm_analysis?.positions && selectedTask.parseResult.data.llm_analysis.positions.length > 0 ? (
                              <>
                                {/* 统计摘要 */}
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase mb-1">岗位数</p>
                                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                      {selectedTask.parseResult.data.llm_analysis.positions.length}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase mb-1">总招录</p>
                                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                      {selectedTask.parseResult.data.llm_analysis.positions.reduce((sum, p) => sum + (p.recruit_count || 0), 0)} 人
                                    </p>
                                  </div>
                                  <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800 text-center">
                                    <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium uppercase mb-1">招录单位</p>
                                    <p className="text-xl font-bold text-violet-700 dark:text-violet-300">
                                      {new Set(selectedTask.parseResult.data.llm_analysis.positions.map(p => p.department_name).filter(Boolean)).size}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium uppercase mb-1">置信度</p>
                                    <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                                      {selectedTask.parseResult.data.llm_analysis.confidence || 0}%
                                    </p>
                                  </div>
                                </div>

                                {/* 岗位列表 */}
                                {selectedTask.isFromDB && selectedTask.parseResult.data.llm_analysis.positions[0]?.position_name === "已解析职位" ? (
                                  // 从数据库恢复的任务，只有数量统计
                                  <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-amber-50 dark:bg-amber-950/30 px-4 py-6 text-center">
                                      <Database className="h-8 w-8 mx-auto mb-2 text-amber-600 opacity-60" />
                                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                                        已保存 {selectedTask.parseResult.data.llm_analysis.positions.length} 个岗位统计
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        岗位详情未保存到数据库，重新解析可获取完整信息
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  // 当前会话解析的任务，显示完整详情
                                  <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 border-b">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-emerald-600" />
                                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                          岗位详情列表
                                        </span>
                                      </div>
                                    </div>
                                    <div className="divide-y max-h-[300px] overflow-auto">
                                      {selectedTask.parseResult.data.llm_analysis.positions.map((pos, idx) => (
                                        <div key={idx} className="p-3 hover:bg-muted/30 transition-colors">
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              <span className="flex items-center justify-center w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                                {idx + 1}
                                              </span>
                                              <span className="text-sm font-medium">{pos.position_name || "未知职位"}</span>
                                            </div>
                                            {pos.recruit_count && (
                                              <Badge className="bg-emerald-600 text-white text-xs h-5">
                                                招 {pos.recruit_count} 人
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            {pos.department_name && (
                                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Briefcase className="h-3 w-3" />
                                                <span>单位：</span>
                                                <span className="text-foreground">{pos.department_name}</span>
                                              </div>
                                            )}
                                            {pos.education && (
                                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                <span>学历：</span>
                                                <span className="text-foreground">{pos.education}</span>
                                              </div>
                                            )}
                                            {pos.work_location && (
                                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span>地点：</span>
                                                <span className="text-foreground">{pos.work_location}</span>
                                              </div>
                                            )}
                                            {pos.political_status && (
                                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <UserCheck className="h-3 w-3" />
                                                <span>政治面貌：</span>
                                                <span className={`font-medium ${
                                                  pos.political_status.includes("党员") 
                                                    ? "text-red-600 dark:text-red-400" 
                                                    : "text-foreground"
                                                }`}>{pos.political_status}</span>
                                              </div>
                                            )}
                                            {pos.major && pos.major.length > 0 && (
                                              <div className="flex items-start gap-1.5 text-muted-foreground col-span-2">
                                                <Database className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                <span className="flex-shrink-0">专业：</span>
                                                <span className="text-foreground line-clamp-2">{pos.major.join("、")}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <User className="h-8 w-8 mb-2 opacity-30" />
                                {selectedTask.isFromDB ? (
                                  <>
                                    <p className="text-xs">岗位详情未保存到数据库</p>
                                    <p className="text-[10px] text-center mt-1 max-w-[240px]">
                                      仅保存岗位数量统计，重新解析可获取完整岗位信息
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-xs">暂无岗位数据</p>
                                    <p className="text-[10px] text-center mt-1 max-w-[240px]">
                                      AI 未能从公告中提取到具体岗位，请查看附件获取完整职位表
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      {/* 附件 Tab */}
                      <TabsContent value="attachments" className="flex-1 min-h-0 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <div className="p-4 space-y-2">
                            {selectedTask.parseResult.data.attachments && selectedTask.parseResult.data.attachments.length > 0 ? (
                              selectedTask.parseResult.data.attachments.map((att, idx) => {
                                const getFileTypeStyles = (type: string) => {
                                  switch (type) {
                                    case "pdf":
                                      return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600" };
                                    case "excel":
                                      return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600" };
                                    case "word":
                                      return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600" };
                                    default:
                                      return { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-600" };
                                  }
                                };
                                const styles = getFileTypeStyles(att.type);
                                return (
                                  <div key={idx} className="p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`p-1.5 rounded ${styles.bg}`}>
                                          <FileText className={`h-4 w-4 ${styles.text}`} />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-medium truncate max-w-[250px]" title={att.name}>
                                            {att.name}
                                          </p>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <Badge variant="outline" className="text-[10px] h-4 uppercase">
                                              {att.type}
                                            </Badge>
                                            {att.content && (
                                              <span className="text-[10px] text-muted-foreground">
                                                {att.content.length.toLocaleString()} 字符
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {att.url && (
                                        <a
                                          href={att.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          下载
                                        </a>
                                      )}
                                    </div>
                                    {att.error && (
                                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 rounded flex items-start gap-1.5">
                                        <XCircle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-red-600 dark:text-red-400">{att.error}</p>
                                      </div>
                                    )}
                                    {att.content && !att.error && (
                                      <details className="mt-2">
                                        <summary className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer hover:text-foreground py-1">
                                          <Eye className="h-3 w-3" />
                                          查看提取内容
                                        </summary>
                                        <div className="mt-1 p-2 bg-muted/50 rounded max-h-48 overflow-auto">
                                          <pre className="text-[10px] whitespace-pre-wrap font-mono">{att.content}</pre>
                                        </div>
                                      </details>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Database className="h-8 w-8 mb-2 opacity-30" />
                                {selectedTask.isFromDB ? (
                                  <>
                                    <p className="text-xs">附件信息未保存到数据库</p>
                                    <p className="text-[10px] text-center mt-1 max-w-[240px]">
                                      重新解析可获取完整附件列表
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-xs">该页面未发现附件</p>
                                )}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                    </>
                  ) : (
                    /* 无解析结果时的空状态 */
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-xl" />
                        <div className="relative p-6 rounded-full bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-2 border-dashed border-violet-200 dark:border-violet-800">
                          {selectedTask.status === "parsing" ? (
                            <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
                          ) : selectedTask.status === "pending" ? (
                            <Clock className="h-12 w-12 text-violet-400" />
                          ) : (
                            <AlertCircle className="h-12 w-12 text-violet-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-base font-medium mt-5 mb-1">
                        {selectedTask.status === "parsing" ? "正在解析中..." : 
                         selectedTask.status === "pending" ? "等待执行" : 
                         selectedTask.status === "failed" ? "解析失败" : "暂无解析结果"}
                      </p>
                      <p className="text-sm text-center max-w-md">
                        {selectedTask.status === "parsing" ? "正在提取内容、下载附件并进行 AI 分析" : 
                         selectedTask.status === "pending" ? "任务尚未开始执行" : 
                         selectedTask.status === "failed" ? "请查看左侧步骤了解失败原因" : "任务未能完成解析"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-5 py-2 border-t bg-muted/20 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {selectedTask.parseResult?.data?.llm_analysis?.summary && (
                    <span className="truncate max-w-[300px] inline-block align-middle">
                      {selectedTask.parseResult.data.llm_analysis.summary.slice(0, 60)}...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedTask.fenbiUrl && (
                    <Button asChild variant="outline" size="sm" className="h-7">
                      <a href={selectedTask.fenbiUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        打开粉笔
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="h-7" onClick={() => setTaskDetailDialogOpen(false)}>
                    关闭
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Parse Result Dialog (for viewing task parse results) */}
      <ParseResultDialog
        open={parseResultDialogOpen}
        onOpenChange={setParseResultDialogOpen}
        result={selectedTaskResult?.result || null}
        title={selectedTaskResult?.title}
      />
    </div>
  );
}
