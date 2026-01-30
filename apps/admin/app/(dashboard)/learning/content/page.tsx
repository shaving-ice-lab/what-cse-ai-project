"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FolderTree,
  Play,
  Zap,
  Bot,
  Eye,
  Filter,
  Settings2,
  FlaskConical,
  Target,
  Lightbulb,
  ListOrdered,
  Brain,
  AlertTriangle,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Layers,
  Sparkles,
  BookMarked,
  Map,
  FileText,
  Activity,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ScrollArea,
  Switch,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Separator,
} from "@what-cse/ui";
import { cn } from "@what-cse/ui";
import {
  contentGeneratorApi,
  ContentTask,
  ContentStats,
  TaskStatus,
  CourseTreeResponse,
  CourseTreeSubjectNode,
  CourseTreeCategoryNode,
  CourseTreeCourseNode,
  CourseTreeChapterNode,
  LLMConfigOption,
  COURSE_PROMPT_PREVIEW,
  getTaskStatusLabel,
  getTaskTypeLabel,
  getSubjectName,
  getTaskStatusColor,
} from "@/services/content-generator-api";
import { toast } from "sonner";

// ============================================
// Task Status Badge
// ============================================

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    processing: <Loader2 className="h-3 w-3 animate-spin" />,
    generating: <Loader2 className="h-3 w-3 animate-spin" />,
    completed: <CheckCircle className="h-3 w-3" />,
    failed: <XCircle className="h-3 w-3" />,
  };
  return (
    <Badge className={cn(getTaskStatusColor(status), "gap-1")}>
      {icons[status]}
      {getTaskStatusLabel(status)}
    </Badge>
  );
}

// ============================================
// Course Tree Components
// ============================================

function ChapterNode({
  chapter,
  onGenerate,
  generating,
}: {
  chapter: CourseTreeChapterNode;
  onGenerate: (chapterId: number) => void;
  generating: Set<number>;
}) {
  const isGenerating = generating.has(chapter.id);
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 pl-8 pr-2 text-sm hover:bg-muted/50 rounded-md group">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn("truncate", chapter.has_content && "text-muted-foreground")}>
          {chapter.title}
        </span>
        {chapter.has_content && (
          <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" title="已生成" />
        )}
      </div>
      {!chapter.has_content && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs opacity-0 group-hover:opacity-100"
          disabled={isGenerating}
          onClick={() => onGenerate(chapter.id)}
        >
          {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          生成
        </Button>
      )}
    </div>
  );
}

function CourseNode({
  course,
  expanded,
  onToggle,
  onGenerateChapter,
  onGenerateCourse,
  generatingChapters,
  generatingCourse,
}: {
  course: CourseTreeCourseNode;
  expanded: boolean;
  onToggle: () => void;
  onGenerateChapter: (chapterId: number) => void;
  onGenerateCourse: (courseId: number) => void;
  generatingChapters: Set<number>;
  generatingCourse: Set<number>;
}) {
  const pendingCount = course.chapters.filter((c) => !c.has_content).length;
  const isGeneratingCourse = generatingCourse.has(course.id);
  return (
    <div className="border-l border-muted pl-2 ml-3">
      <div
        className="flex items-center gap-1.5 py-1.5 pr-2 cursor-pointer hover:bg-muted/50 rounded-md group"
        onClick={onToggle}
      >
        {course.chapters.length > 0 ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        <BookOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium truncate flex-1">{course.title}</span>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {pendingCount} 待生成
          </Badge>
        )}
        {pendingCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs opacity-0 group-hover:opacity-100 flex-shrink-0"
            disabled={isGeneratingCourse}
            onClick={(e) => {
              e.stopPropagation();
              onGenerateCourse(course.id);
            }}
          >
            {isGeneratingCourse ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Zap className="h-3 w-3 mr-0.5" />
                全部生成
              </>
            )}
          </Button>
        )}
      </div>
      {expanded &&
        course.chapters.map((ch) => (
          <ChapterNode
            key={ch.id}
            chapter={ch}
            onGenerate={onGenerateChapter}
            generating={generatingChapters}
          />
        ))}
    </div>
  );
}

function CategoryNode({
  node,
  subject,
  expandedIds,
  onToggle,
  onGenerateChapter,
  onGenerateCategory,
  onGenerateCourse,
  generatingChapters,
  generatingCourse,
  generatingCategory,
}: {
  node: CourseTreeCategoryNode;
  subject: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onGenerateChapter: (chapterId: number) => void;
  onGenerateCategory: (categoryId: number) => void;
  onGenerateCourse: (courseId: number) => void;
  generatingChapters: Set<number>;
  generatingCourse: Set<number>;
  generatingCategory: Set<number>;
}) {
  const idStr = `cat-${node.id}`;
  const isExpanded = expandedIds.has(idStr);
  const hasChildren = (node.children?.length ?? 0) + (node.courses?.length ?? 0) > 0;
  const pendingChapterIds = (node.courses ?? [])
    .flatMap((c) => c.chapters.filter((ch) => !ch.has_content).map((ch) => ch.id));
  const isGeneratingCat = generatingCategory.has(node.id);

  return (
    <div className="py-0.5">
      <div
        className={cn(
          "flex items-center gap-1.5 py-1.5 pr-2 rounded-md group",
          hasChildren && "cursor-pointer hover:bg-muted/50"
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            className="flex-shrink-0 p-0 border-0 bg-transparent"
            onClick={() => onToggle(idStr)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <FolderTree className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium truncate flex-1">{node.name}</span>
        {pendingChapterIds.length > 0 && (
          <>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {pendingChapterIds.length} 待生成
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs opacity-0 group-hover:opacity-100 flex-shrink-0"
              disabled={isGeneratingCat}
              onClick={(e) => {
                e.stopPropagation();
                onGenerateCategory(node.id);
              }}
            >
              {isGeneratingCat ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-0.5" />
                  生成
                </>
              )}
            </Button>
          </>
        )}
      </div>
      {isExpanded && (
        <div className="ml-2">
          {(node.children ?? []).map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              subject={subject}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onGenerateChapter={onGenerateChapter}
              onGenerateCategory={onGenerateCategory}
              onGenerateCourse={onGenerateCourse}
              generatingChapters={generatingChapters}
              generatingCourse={generatingCourse}
              generatingCategory={generatingCategory}
            />
          ))}
          {(node.courses ?? []).map((course) => (
            <CourseNode
              key={course.id}
              course={course}
              expanded={expandedIds.has(`course-${course.id}`)}
              onToggle={() => onToggle(`course-${course.id}`)}
              onGenerateChapter={onGenerateChapter}
              onGenerateCourse={onGenerateCourse}
              generatingChapters={generatingChapters}
              generatingCourse={generatingCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Left Sidebar: Generate Control + Tree
// ============================================

function LeftSidebar({
  tree,
  loadingTree,
  onRefreshTree,
  onGenerateAll,
  onGenerateChapter,
  onGenerateCourse,
  onGenerateCategory,
  generatingChapters,
  generatingCourse,
  generatingCategory,
  generatingAll,
  skipExisting,
  setSkipExisting,
  llmConfigs,
  selectedModelId,
  setSelectedModelId,
  filterSubject,
  setFilterSubject,
  onShowPromptPreview,
  onTestGenerate,
  testGenerating,
}: {
  tree: CourseTreeResponse | null;
  loadingTree: boolean;
  onRefreshTree: () => void;
  onGenerateAll: () => void;
  onGenerateChapter: (chapterId: number) => void;
  onGenerateCourse: (courseId: number) => void;
  onGenerateCategory: (categoryId: number) => void;
  generatingChapters: Set<number>;
  generatingCourse: Set<number>;
  generatingCategory: Set<number>;
  generatingAll: boolean;
  skipExisting: boolean;
  setSkipExisting: (v: boolean) => void;
  llmConfigs: LLMConfigOption[];
  selectedModelId: number | null;
  setSelectedModelId: (id: number | null) => void;
  filterSubject: string;
  setFilterSubject: (v: string) => void;
  onShowPromptPreview: () => void;
  onTestGenerate: () => void;
  testGenerating: boolean;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter tree by subject
  const filteredTree = useMemo(() => {
    if (!tree || filterSubject === "all") return tree;
    return {
      subjects: tree.subjects.filter((s) => s.subject === filterSubject),
    };
  }, [tree, filterSubject]);

  const countChapters = (nodes: CourseTreeCategoryNode[], onlyPending: boolean): number => {
    let n = 0;
    for (const c of nodes) {
      for (const co of c.courses ?? []) {
        n += onlyPending
          ? co.chapters.filter((ch) => !ch.has_content).length
          : co.chapters.length;
      }
      if (c.children?.length) n += countChapters(c.children, onlyPending);
    }
    return n;
  };
  const totalChapters = filteredTree ? filteredTree.subjects.reduce((acc, s) => acc + countChapters(s.categories, false), 0) : 0;
  const pendingChapters = filteredTree ? filteredTree.subjects.reduce((acc, s) => acc + countChapters(s.categories, true), 0) : 0;
  const generatedChapters = totalChapters - pendingChapters;

  const selectedModel = llmConfigs.find((c) => c.id === selectedModelId);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 pr-3">
        {/* Generate control */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              生成设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Subject filter */}
            <div className="space-y-1.5">
              <Label className="text-xs">科目筛选</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="全部科目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部科目</SelectItem>
                  <SelectItem value="xingce">行测</SelectItem>
                  <SelectItem value="shenlun">申论</SelectItem>
                  <SelectItem value="mianshi">面试</SelectItem>
                  <SelectItem value="gongji">公基</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model selector */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Bot className="h-3 w-3" />
                生成模型
              </Label>
              <Select
                value={selectedModelId?.toString() ?? "default"}
                onValueChange={(v) => setSelectedModelId(v === "default" ? null : parseInt(v))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="默认模型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">默认模型</SelectItem>
                  {llmConfigs.map((config) => (
                    <SelectItem key={config.id} value={config.id.toString()}>
                      {config.name} ({config.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs cursor-pointer">跳过已有内容</Label>
              <Switch checked={skipExisting} onCheckedChange={setSkipExisting} />
            </div>
            <Button
              className="w-full"
              size="sm"
              disabled={loadingTree || generatingAll || pendingChapters === 0}
              onClick={onGenerateAll}
            >
              {generatingAll ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              一键全部生成
            </Button>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>已生成：{generatedChapters} 节</p>
              <p>待生成：{pendingChapters} 节</p>
              <p>共 {totalChapters} 节</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={onRefreshTree} disabled={loadingTree}>
                <RefreshCw className={cn("h-4 w-4 mr-1", loadingTree && "animate-spin")} />
                刷新
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={onShowPromptPreview}>
                <Eye className="h-4 w-4 mr-1" />
                Prompt
              </Button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={onTestGenerate}
              disabled={testGenerating || !filteredTree || totalChapters === 0}
            >
              {testGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FlaskConical className="h-4 w-4 mr-2" />
              )}
              测试生成（随机章节）
            </Button>
          </CardContent>
        </Card>

        {/* Course tree */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              课程结构
              {filterSubject !== "all" && (
                <Badge variant="secondary" className="text-xs ml-auto">
                  {getSubjectName(filterSubject)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTree ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : !filteredTree || filteredTree.subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {filterSubject !== "all" ? (
                  <>该科目暂无课程结构</>
                ) : (
                  <>
                    暂无课程结构，请先在
                    <a href="/learning/manager?tab=categories" className="text-primary underline ml-1">
                      课程管理
                    </a>
                    中编排分类与课程。
                  </>
                )}
              </p>
            ) : (
              <div className="space-y-1">
                {filteredTree.subjects.map((subject) => (
                  <SubjectBlock
                    key={subject.subject}
                    subject={subject}
                    expandedIds={expandedIds}
                    onToggle={toggle}
                    onGenerateChapter={onGenerateChapter}
                    onGenerateCategory={onGenerateCategory}
                    onGenerateCourse={onGenerateCourse}
                    generatingChapters={generatingChapters}
                    generatingCourse={generatingCourse}
                    generatingCategory={generatingCategory}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

function SubjectBlock({
  subject,
  expandedIds,
  onToggle,
  onGenerateChapter,
  onGenerateCategory,
  onGenerateCourse,
  generatingChapters,
  generatingCourse,
  generatingCategory,
}: {
  subject: CourseTreeSubjectNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onGenerateChapter: (chapterId: number) => void;
  onGenerateCategory: (categoryId: number) => void;
  onGenerateCourse: (courseId: number) => void;
  generatingChapters: Set<number>;
  generatingCourse: Set<number>;
  generatingCategory: Set<number>;
}) {
  const idStr = `subject-${subject.subject}`;
  const isExpanded = expandedIds.has(idStr);
  return (
    <div className="py-0.5">
      <button
        type="button"
        className="flex items-center gap-1.5 w-full py-2 pr-2 rounded-md hover:bg-muted/50 text-left"
        onClick={() => onToggle(idStr)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm font-semibold">{subject.name}</span>
      </button>
      {isExpanded &&
        subject.categories.map((cat) => (
          <CategoryNode
            key={cat.id}
            node={cat}
            subject={subject.subject}
            expandedIds={expandedIds}
            onToggle={onToggle}
            onGenerateChapter={onGenerateChapter}
            onGenerateCategory={onGenerateCategory}
            onGenerateCourse={onGenerateCourse}
            generatingChapters={generatingChapters}
            generatingCourse={generatingCourse}
            generatingCategory={generatingCategory}
          />
        ))}
    </div>
  );
}

// ============================================
// Main Page
// ============================================

type TestGenerationTask = {
  taskId: number;
  chapterId: number;
  chapterTitle: string;
  courseTitle: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt?: string;
  content?: any;
  error?: string;
};

export default function ContentGenerationPage() {
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState<CourseTreeResponse | null>(null);
  const [loadingTree, setLoadingTree] = useState(true);
  const [stats, setStats] = useState<ContentStats | undefined>();
  const [tasks, setTasks] = useState<ContentTask[]>([]);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "processing" | "generating" | "completed" | "failed"
  >("all");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [skipExisting, setSkipExisting] = useState(true);
  const [generatingChapters, setGeneratingChapters] = useState<Set<number>>(new Set());
  const [generatingCourse, setGeneratingCourse] = useState<Set<number>>(new Set());
  const [generatingCategory, setGeneratingCategory] = useState<Set<number>>(new Set());
  const [generatingAll, setGeneratingAll] = useState(false);

  // New state for LLM config, filter, and prompt preview
  const [llmConfigs, setLlmConfigs] = useState<LLMConfigOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // State for test generation
  const [testGenerating, setTestGenerating] = useState(false);
  const [testTasks, setTestTasks] = useState<TestGenerationTask[]>([]);
  const [selectedTestTaskId, setSelectedTestTaskId] = useState<number | null>(null);
  const [loadingTestTaskIds, setLoadingTestTaskIds] = useState<Set<number>>(new Set());

  // State for chapters with content (extracted from course tree)
  const [chaptersWithContent, setChaptersWithContent] = useState<{
    id: number;
    title: string;
    courseId: number;
    courseTitle: string;
    categoryName: string;
    subject: string;
  }[]>([]);
  const [selectedChapterForPreview, setSelectedChapterForPreview] = useState<number | null>(null);
  const [showChapterContentDialog, setShowChapterContentDialog] = useState(false);
  const [chapterContentLoading, setChapterContentLoading] = useState(false);
  const [chapterContentData, setChapterContentData] = useState<any>(null);

  const fetchLLMConfigs = useCallback(async () => {
    try {
      const configs = await contentGeneratorApi.getLLMConfigOptions();
      setLlmConfigs(configs);
      // Set default model if exists
      const defaultConfig = configs.find((c) => c.is_default);
      if (defaultConfig) {
        setSelectedModelId(defaultConfig.id);
      }
    } catch (e) {
      console.error("Failed to load LLM configs", e);
    }
  }, []);

  // Extract chapters with content from course tree
  const extractChaptersWithContent = useCallback((treeData: CourseTreeResponse | null) => {
    if (!treeData) return [];
    
    const chapters: {
      id: number;
      title: string;
      courseId: number;
      courseTitle: string;
      categoryName: string;
      subject: string;
    }[] = [];
    
    const processCategory = (category: CourseTreeCategoryNode, subject: string) => {
      for (const course of category.courses || []) {
        for (const chapter of course.chapters) {
          if (chapter.has_content) {
            chapters.push({
              id: chapter.id,
              title: chapter.title,
              courseId: course.id,
              courseTitle: course.title,
              categoryName: category.name,
              subject: subject,
            });
          }
        }
      }
      for (const child of category.children || []) {
        processCategory(child, subject);
      }
    };
    
    for (const subj of treeData.subjects) {
      for (const cat of subj.categories) {
        processCategory(cat, subj.subject);
      }
    }
    
    return chapters;
  }, []);

  // Update chapters with content when tree changes
  useEffect(() => {
    const chapters = extractChaptersWithContent(tree);
    setChaptersWithContent(chapters);
  }, [tree, extractChaptersWithContent]);

  const fetchTree = useCallback(async () => {
    setLoadingTree(true);
    try {
      const data = await contentGeneratorApi.getCourseTree();
      setTree(data);
    } catch (e) {
      toast.error("获取课程树失败");
      setTree(null);
    } finally {
      setLoadingTree(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes] = await Promise.all([
        contentGeneratorApi.getStats().catch(() => ({
          total_categories: 0,
          total_courses: 0,
          total_chapters: 0,
          total_knowledge_points: 0,
        })),
        contentGeneratorApi.getTasks({ page, page_size: 15 }).catch(() => ({ tasks: [], total: 0 })),
      ]);
      setStats(statsRes as ContentStats);
      setTasks((tasksRes as { tasks: ContentTask[]; total: number }).tasks ?? []);
      setTasksTotal((tasksRes as { tasks: ContentTask[]; total: number }).total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTree();
    fetchLLMConfigs();
  }, [fetchTree, fetchLLMConfigs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const hasProcessing = tasks.some(
      (t) => t.status === "processing" || t.status === "generating" || t.status === "pending"
    );
    if (!hasProcessing) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [tasks, fetchData]);

  const handleGenerateChapter = async (chapterId: number) => {
    setGeneratingChapters((prev) => new Set(prev).add(chapterId));
    try {
      await contentGeneratorApi.generateChapterLesson({
        chapter_id: chapterId,
        auto_import: true,
        auto_approve: false,
        // 不传入 prompt，使用后端默认的高质量 prompt
        // 避免前端 JSON 序列化时特殊字符（如 ``` ）导致的 API 400 错误
      });
      toast.success("已创建生成任务");
      fetchData();
      fetchTree();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "创建任务失败");
    } finally {
      setGeneratingChapters((prev) => {
        const next = new Set(prev);
        next.delete(chapterId);
        return next;
      });
    }
  };

  const handleGenerateCourse = async (courseId: number) => {
    setGeneratingCourse((prev) => new Set(prev).add(courseId));
    try {
      await contentGeneratorApi.generateCourseLessons({
        course_id: courseId,
        skip_existing: skipExisting,
        auto_import: true,
        auto_approve: false,
        // 不传入 prompt，使用后端默认的高质量 prompt
      });
      toast.success("已创建批量生成任务");
      fetchData();
      fetchTree();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "创建任务失败");
    } finally {
      setGeneratingCourse((prev) => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    }
  };

  const handleGenerateCategory = async (categoryId: number) => {
    setGeneratingCategory((prev) => new Set(prev).add(categoryId));
    try {
      await contentGeneratorApi.generateCategoryLessons({
        category_id: categoryId,
        include_sub_categories: true,
        skip_existing: skipExisting,
        auto_import: true,
        auto_approve: false,
        // 不传入 prompt，使用后端默认的高质量 prompt
      });
      toast.success("已创建批量生成任务");
      fetchData();
      fetchTree();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "创建任务失败");
    } finally {
      setGeneratingCategory((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
  };

  const collectChapterIds = useCallback(
    (nodes: CourseTreeCategoryNode[], onlyPending: boolean): number[] => {
      let ids: number[] = [];
      for (const n of nodes) {
        for (const co of n.courses ?? []) {
          const chapters = onlyPending
            ? co.chapters.filter((ch) => !ch.has_content)
            : co.chapters;
          ids = ids.concat(chapters.map((ch) => ch.id));
        }
        if (n.children?.length) ids = ids.concat(collectChapterIds(n.children, onlyPending));
      }
      return ids;
    },
    []
  );

  const handleGenerateAll = async () => {
    if (!tree) return;
    // Filter by selected subject
    const subjectsToProcess = filterSubject === "all"
      ? tree.subjects
      : tree.subjects.filter((s) => s.subject === filterSubject);
    
    const chapterIds = subjectsToProcess.flatMap((s) =>
      collectChapterIds(s.categories, skipExisting)
    );
    if (chapterIds.length === 0) {
      toast.info(skipExisting ? "没有待生成的章节" : "没有章节");
      return;
    }
    setGeneratingAll(true);
    try {
      const result = await contentGeneratorApi.batchGenerateChapterLessons({
        chapter_ids: chapterIds,
        subject: filterSubject !== "all" ? filterSubject : undefined,
        auto_import: true,
        auto_approve: false,
        // 不传入 prompt，使用后端默认的高质量 prompt
      });
      toast.success(`已创建 ${result.created_tasks} 个生成任务`);
      fetchData();
      fetchTree();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "批量生成失败");
    } finally {
      setGeneratingAll(false);
    }
  };

  // Collect all chapters with course info for random selection
  const collectAllChaptersWithInfo = useCallback(
    (nodes: CourseTreeCategoryNode[]): { chapter: CourseTreeChapterNode; courseTitle: string }[] => {
      let results: { chapter: CourseTreeChapterNode; courseTitle: string }[] = [];
      for (const n of nodes) {
        for (const co of n.courses ?? []) {
          for (const ch of co.chapters) {
            results.push({ chapter: ch, courseTitle: co.title });
          }
        }
        if (n.children?.length) {
          results = results.concat(collectAllChaptersWithInfo(n.children));
        }
      }
      return results;
    },
    []
  );

  // Helper: Extract JSON from markdown code block and parse (handles truncated JSON)
  const extractAndParseJSON = (text: string): { parsed: any; isComplete: boolean; raw: string } => {
    let jsonStr = text.trim();
    
    // Remove markdown code block wrapper if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();
    
    // Try direct parse first
    try {
      return { parsed: JSON.parse(jsonStr), isComplete: true, raw: jsonStr };
    } catch {
      // JSON is likely truncated, try to fix it
    }
    
    // Attempt to fix truncated JSON by closing open brackets/braces
    let fixedJson = jsonStr;
    const openBraces = (jsonStr.match(/{/g) || []).length;
    const closeBraces = (jsonStr.match(/}/g) || []).length;
    const openBrackets = (jsonStr.match(/\[/g) || []).length;
    const closeBrackets = (jsonStr.match(/\]/g) || []).length;
    
    // Remove trailing incomplete string/value
    fixedJson = fixedJson.replace(/,\s*"[^"]*$/, ""); // Remove incomplete key
    fixedJson = fixedJson.replace(/:\s*"[^"]*$/, ": null"); // Replace incomplete string value
    fixedJson = fixedJson.replace(/,\s*$/, ""); // Remove trailing comma
    
    // Close arrays
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixedJson += "]";
    }
    // Close objects
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixedJson += "}";
    }
    
    try {
      return { parsed: JSON.parse(fixedJson), isComplete: false, raw: jsonStr };
    } catch {
      return { parsed: null, isComplete: false, raw: jsonStr };
    }
  };

  const addTestTask = useCallback((task: TestGenerationTask) => {
    setTestTasks((prev) => [task, ...prev.filter((t) => t.taskId !== task.taskId)]);
  }, []);

  const updateTestTask = useCallback((taskId: number, updates: Partial<TestGenerationTask>) => {
    setTestTasks((prev) =>
      prev.map((t) =>
        t.taskId === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const resolveTestTaskContent = useCallback(async (taskStatus: any, chapterId: number) => {
    let contentToShow: any = null;
    let isContentTruncated = false;

    const taskResult = taskStatus?.result ?? taskStatus?.result_content;
    if (taskResult) {
      if (typeof taskResult === "string") {
        const { parsed, isComplete, raw } = extractAndParseJSON(taskResult);
        if (parsed) {
          contentToShow = parsed;
          isContentTruncated = !isComplete;
        } else {
          contentToShow = {
            _raw: raw,
            _parseError: true,
            _message: "JSON 解析失败，显示原始内容",
          };
        }
      } else {
        contentToShow = taskResult;
      }
    }

    if (!contentToShow) {
      try {
        const chapterResponse = await contentGeneratorApi.getChapterContent(chapterId);
        if (chapterResponse?.content) {
          if (typeof chapterResponse.content === "string") {
            const { parsed, isComplete, raw } = extractAndParseJSON(chapterResponse.content);
            if (parsed) {
              contentToShow = parsed;
              isContentTruncated = !isComplete;
            } else {
              contentToShow = {
                _raw: raw,
                _parseError: true,
                _message: "JSON 解析失败，显示原始内容",
              };
            }
          } else {
            contentToShow = chapterResponse.content;
          }
        }
      } catch (fetchErr) {
        console.error("Fetch chapter content error:", fetchErr);
      }
    }

    if (contentToShow) {
      contentToShow._isContentTruncated = isContentTruncated;
      return contentToShow;
    }
    return null;
  }, []);

  const handleViewTestTask = useCallback(
    async (task: TestGenerationTask) => {
      if (task.status !== "completed") {
        toast.info("任务未完成，暂不可查看");
        return;
      }
      setSelectedTestTaskId(task.taskId);
      if (task.content) return;

      setLoadingTestTaskIds((prev) => new Set(prev).add(task.taskId));
      try {
        const taskStatus = await contentGeneratorApi.getGenerationTask(task.taskId);
        const content = await resolveTestTaskContent(taskStatus, task.chapterId);
        if (content) {
          updateTestTask(task.taskId, { content });
        } else {
          toast.warning("内容获取失败，请稍后重试");
        }
      } catch (err) {
        toast.error("获取任务内容失败");
      } finally {
        setLoadingTestTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(task.taskId);
          return next;
        });
      }
    },
    [resolveTestTaskContent, updateTestTask]
  );

  const handleViewChapterContent = useCallback(async (chapterId: number) => {
    setSelectedChapterForPreview(chapterId);
    setShowChapterContentDialog(true);
    setChapterContentLoading(true);
    setChapterContentData(null);
    
    try {
      const response = await contentGeneratorApi.getChapterContent(chapterId);
      if (response?.content) {
        // Parse content if it's a string
        let contentData = response.content;
        if (typeof contentData === "string") {
          try {
            contentData = JSON.parse(contentData);
          } catch {
            // Keep as string if parse fails
          }
        }
        setChapterContentData(contentData);
      } else {
        setChapterContentData(null);
      }
    } catch (err) {
      console.error("Failed to fetch chapter content:", err);
      toast.error("获取章节内容失败");
      setChapterContentData(null);
    } finally {
      setChapterContentLoading(false);
    }
  }, []);

  // Test generation handler - randomly select a chapter and generate content
  const handleTestGenerate = async () => {
    if (!tree) return;

    // Filter by selected subject
    const subjectsToProcess = filterSubject === "all"
      ? tree.subjects
      : tree.subjects.filter((s) => s.subject === filterSubject);

    // Collect all chapters with course info
    const allChapters = subjectsToProcess.flatMap((s) =>
      collectAllChaptersWithInfo(s.categories)
    );

    if (allChapters.length === 0) {
      toast.error("没有可用的章节进行测试");
      return;
    }

    // Randomly select a chapter
    const randomIndex = Math.floor(Math.random() * allChapters.length);
    const selected = allChapters[randomIndex];

    setTestGenerating(true);

    try {
      toast.info(`正在为「${selected.chapter.title}」生成内容，这可能需要 1-3 分钟...`);
      
      // Create the generation task
      const result = await contentGeneratorApi.generateChapterLesson({
        chapter_id: selected.chapter.id,
        auto_import: true, // Import to chapter directly
        auto_approve: false,
        // 不传入 prompt，使用后端默认的高质量 prompt
      });

      const taskId = result?.task?.id;
      if (!taskId) {
        throw new Error("未能获取任务ID");
      }

      addTestTask({
        taskId,
        chapterId: selected.chapter.id,
        chapterTitle: selected.chapter.title,
        courseTitle: selected.courseTitle,
        status: (result?.task?.status as TaskStatus) || "pending",
        createdAt: new Date().toISOString(),
      });

      // Poll for task completion (max 5 minutes)
      const maxAttempts = 60; // 60 * 5s = 5 minutes
      let attempts = 0;
      let completed = false;
      let lastTaskStatus: any = null;

      while (attempts < maxAttempts && !completed) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;

        try {
          const taskStatus = await contentGeneratorApi.getGenerationTask(taskId);
          lastTaskStatus = taskStatus;
          const status = taskStatus?.status;

          if (status) updateTestTask(taskId, { status });

          if (status === "completed") {
            completed = true;
            toast.success("内容生成完成！");

            const content = await resolveTestTaskContent(taskStatus, selected.chapter.id);
            if (content) {
              if (content?._isContentTruncated) {
                toast.warning("内容被截断，仅显示部分内容");
              }
              updateTestTask(taskId, { status: "completed", content });
            } else {
              updateTestTask(taskId, { status: "completed", error: "内容获取失败" });
              toast.warning("内容生成完成，但获取内容失败");
            }
          } else if (status === "failed") {
            updateTestTask(taskId, { status: "failed", error: taskStatus?.error_message || "生成任务失败" });
            throw new Error(taskStatus?.error_message || "生成任务失败");
          } else {
            // Still processing - show progress
            if (attempts % 6 === 0) { // Every 30 seconds
              toast.info(`正在生成中... (已等待 ${attempts * 5} 秒)`);
            }
          }
        } catch (pollErr) {
          console.error("Poll task error:", pollErr);
          // Continue polling on error
        }
      }

      if (!completed) {
        toast.warning("生成超时，请在任务列表中查看进度");
        // Try to show whatever content we have from the last status
        if (lastTaskStatus) {
          const content = await resolveTestTaskContent(lastTaskStatus, selected.chapter.id);
          if (content) {
            updateTestTask(taskId, { content });
          }
        }
      }
      
      fetchData();
      fetchTree();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "测试生成失败");
    } finally {
      setTestGenerating(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== "all") {
      if (filterStatus === "processing" && t.status !== "processing" && t.status !== "generating") return false;
      if (filterStatus !== "processing" && t.status !== filterStatus) return false;
    }
    if (filterKeyword && !(t.template_name ?? "").toLowerCase().includes(filterKeyword.toLowerCase())) return false;
    return true;
  });
  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(tasksTotal / pageSize));
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    processing: tasks.filter(
      (t) => t.status === "processing" || t.status === "generating"
    ).length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };
  const selectedTestTask = useMemo(
    () => testTasks.find((task) => task.taskId === selectedTestTaskId) ?? null,
    [testTasks, selectedTestTaskId]
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">内容生成</h1>
          <p className="text-sm text-muted-foreground">
            按课程结构生成教学内容 · {stats?.total_categories ?? 0} 分类 · {stats?.total_courses ?? 0} 课程 ·{" "}
            {stats?.total_chapters ?? 0} 章节
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchData(); fetchTree(); }} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-4 w-4", loading && "animate-spin")} />
          刷新
        </Button>
      </div>

      <div className="flex gap-4 h-[calc(100vh-11rem)]">
        <aside className="w-[400px] flex-shrink-0 border-r pr-4">
          <LeftSidebar
            tree={tree}
            loadingTree={loadingTree}
            onRefreshTree={fetchTree}
            onGenerateAll={handleGenerateAll}
            onGenerateChapter={handleGenerateChapter}
            onGenerateCourse={handleGenerateCourse}
            onGenerateCategory={handleGenerateCategory}
            generatingChapters={generatingChapters}
            generatingCourse={generatingCourse}
            generatingCategory={generatingCategory}
            generatingAll={generatingAll}
            skipExisting={skipExisting}
            setSkipExisting={setSkipExisting}
            llmConfigs={llmConfigs}
            selectedModelId={selectedModelId}
            setSelectedModelId={setSelectedModelId}
            filterSubject={filterSubject}
            setFilterSubject={setFilterSubject}
            onShowPromptPreview={() => setShowPromptPreview(true)}
            onTestGenerate={handleTestGenerate}
            testGenerating={testGenerating}
          />
        </aside>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <Card className="flex-shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                测试任务
                {testTasks.length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {testTasks.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {testTasks.length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground text-center">暂无测试任务</div>
              ) : (
                <ScrollArea className="max-h-[220px]">
                  <div className="divide-y">
                    {testTasks.map((task) => {
                      const isSelected = selectedTestTaskId === task.taskId;
                      const isLoading = loadingTestTaskIds.has(task.taskId);
                      return (
                        <div key={`test-task-${task.taskId}`} className="flex items-center justify-between gap-3 px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <TaskStatusBadge status={task.status} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">
                                {task.courseTitle} - {task.chapterTitle}
                              </p>
                              <p className="text-[11px] text-muted-foreground">任务 #{task.taskId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.status === "completed" ? (
                              <Button
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                className="h-7 text-xs"
                                onClick={() => handleViewTestTask(task)}
                                disabled={isLoading}
                              >
                                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "查看"}
                              </Button>
                            ) : task.status === "failed" ? (
                              <Badge variant="destructive" className="text-xs">
                                失败
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                处理中
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {selectedTestTask && (
                <div className="border-t">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-xs font-medium">测试内容预览</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setSelectedTestTaskId(null)}
                    >
                      关闭
                    </Button>
                  </div>
                  {selectedTestTask.error && (
                    <div className="px-3 pb-2 text-xs text-red-600">{selectedTestTask.error}</div>
                  )}
                  <ScrollArea className="max-h-[45vh]">
                    {selectedTestTask.content ? (
                      <TestContentRenderer content={selectedTestTask.content} />
                    ) : (
                      <div className="px-4 pb-4 text-xs text-muted-foreground">
                        内容尚未准备好，请稍后再试。
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chapters With Content Card */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  已生成内容
                  {chaptersWithContent.length > 0 && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      {chaptersWithContent.length}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchTree}
                  disabled={loadingTree}
                  className="h-7 text-xs"
                >
                  <RefreshCw className={cn("h-3 w-3", loadingTree && "animate-spin")} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingTree ? (
                <div className="p-4 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : chaptersWithContent.length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground text-center">
                  暂无已生成的内容
                  <p className="mt-1 text-[11px]">使用左侧课程树的"生成"按钮来生成章节内容</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[250px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 py-2 text-xs">ID</TableHead>
                        <TableHead className="py-2 text-xs">章节标题</TableHead>
                        <TableHead className="py-2 text-xs">所属课程</TableHead>
                        <TableHead className="w-16 py-2 text-xs">科目</TableHead>
                        <TableHead className="w-16 py-2 text-xs">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chaptersWithContent.slice(0, 20).map((chapter) => (
                        <TableRow key={chapter.id} className="hover:bg-muted/50">
                          <TableCell className="py-2 text-xs font-mono">{chapter.id}</TableCell>
                          <TableCell className="py-2 text-xs">
                            <span className="line-clamp-1">{chapter.title}</span>
                          </TableCell>
                          <TableCell className="py-2 text-xs">
                            <span className="line-clamp-1 text-muted-foreground">{chapter.courseTitle}</span>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant="outline" className="text-xs">
                              {getSubjectName(chapter.subject)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleViewChapterContent(chapter.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              查看
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
              {chaptersWithContent.length > 20 && (
                <div className="px-4 py-2 border-t text-xs text-muted-foreground text-center">
                  显示前 20 条，共 {chaptersWithContent.length} 条已生成内容
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0 py-3 px-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Left: Title and Status */}
              <div className="flex items-center gap-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  任务列表
                </CardTitle>
                {tasks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary">{taskStats.total} 任务</Badge>
                    {taskStats.completed > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {taskStats.completed}
                      </Badge>
                    )}
                    {(taskStats.processing > 0 || taskStats.pending > 0) && (
                      <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        {taskStats.processing + taskStats.pending}
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
              </div>

              {/* Right: Refresh */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchData()}
                  disabled={loading}
                  className="h-7 text-xs"
                >
                  <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
                  刷新
                </Button>
              </div>
            </div>

            {/* Filter Row */}
            {tasks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="搜索任务..."
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
                    <SelectItem value="processing">处理中</SelectItem>
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
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
            <ScrollArea className="flex-1">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 py-2 text-xs">状态</TableHead>
                    <TableHead className="py-2 text-xs">任务名称</TableHead>
                    <TableHead className="w-28 py-2 text-xs">时间</TableHead>
                    <TableHead className="w-20 py-2 text-xs">类型</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Empty State */}
                  {filteredTasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          {loading ? (
                            <>
                              <Loader2 className="h-8 w-8 animate-spin opacity-50" />
                              <p className="text-sm">正在加载任务...</p>
                            </>
                          ) : tasks.length === 0 ? (
                            <>
                              <Activity className="h-8 w-8 opacity-30" />
                              <p className="text-sm">暂无任务</p>
                              <p className="text-xs">使用左侧课程树创建生成任务</p>
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
                  {filteredTasks.map((task) => (
                    <TableRow
                      key={`task-${task.id}`}
                      className={`group cursor-pointer hover:bg-muted/50 ${
                        task.status === "completed"
                          ? "bg-emerald-50/30 dark:bg-emerald-950/10"
                          : task.status === "processing" || task.status === "generating"
                            ? "bg-violet-50/30 dark:bg-violet-950/10"
                            : task.status === "failed"
                              ? "bg-red-50/30 dark:bg-red-950/10"
                              : ""
                      }`}
                    >
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5">
                          {task.status === "completed" && (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          )}
                          {(task.status === "processing" || task.status === "generating") && (
                            <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />
                          )}
                          {task.status === "pending" && <Clock className="h-4 w-4 text-gray-400" />}
                          {task.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-col">
                          <span
                            className={`text-sm line-clamp-1 ${
                              task.status === "completed"
                                ? "text-foreground"
                                : task.status === "processing" || task.status === "generating"
                                  ? "text-violet-700 dark:text-violet-300 font-medium"
                                  : task.status === "failed"
                                    ? "text-red-700 dark:text-red-300"
                                    : "text-muted-foreground"
                            }`}
                          >
                            {task.template_name ?? `任务 #${task.id}`}
                          </span>
                          {task.subject && (
                            <span
                              className={`text-xs line-clamp-1 ${
                                task.status === "failed"
                                  ? "text-red-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {getSubjectName(task.subject)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {new Date(task.created_at).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {getTaskTypeLabel(task.task_type)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            {/* Footer Stats */}
            {tasks.length > 0 && (
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t bg-muted/20">
                <div className="text-xs text-muted-foreground">
                  显示 {filteredTasks.length} / {tasks.length} 任务
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground">
                    {taskStats.completed > 0 && (
                      <span className="text-emerald-600 mr-3">{taskStats.completed} 完成</span>
                    )}
                    {taskStats.processing > 0 && (
                      <span className="text-violet-600 mr-3">{taskStats.processing} 进行中</span>
                    )}
                    {taskStats.pending > 0 && (
                      <span className="text-gray-500 mr-3">{taskStats.pending} 待处理</span>
                    )}
                    {taskStats.failed > 0 && (
                      <span className="text-red-500">{taskStats.failed} 失败</span>
                    )}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-7 text-xs"
                      >
                        上一页
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="h-7 text-xs"
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prompt Preview Dialog */}
      <Dialog open={showPromptPreview} onOpenChange={setShowPromptPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Prompt 预览（完整版）
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-6 pr-4">
              {/* Selected model info */}
              {selectedModelId && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium mb-1">当前选择的模型</p>
                  <p className="text-sm text-muted-foreground">
                    {llmConfigs.find((c) => c.id === selectedModelId)?.name ?? "默认模型"} (
                    {llmConfigs.find((c) => c.id === selectedModelId)?.model ?? "default"})
                  </p>
                </div>
              )}

              {/* System Prompt */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="secondary">System Prompt</Badge>
                  课程内容生成系统提示词（完整版）
                </h3>
                <div className="rounded-lg border bg-muted/30">
                  <ScrollArea className="h-[50vh]">
                    <pre className="text-xs p-4 whitespace-pre-wrap font-mono leading-relaxed">
                      {COURSE_PROMPT_PREVIEW.system_prompt}
                    </pre>
                  </ScrollArea>
                </div>
              </div>

              <Separator />

              {/* User Prompt Template */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline">User Prompt</Badge>
                  用户提示词模板
                </h3>
                <div className="rounded-lg border bg-muted/30">
                  <pre className="text-xs p-4 whitespace-pre-wrap font-mono leading-relaxed">
                    {COURSE_PROMPT_PREVIEW.user_prompt_template}
                  </pre>
                </div>
              </div>

              <Separator />

              {/* Variables */}
              <div>
                <h3 className="text-sm font-semibold mb-2">模板变量</h3>
                <div className="flex flex-wrap gap-2">
                  {COURSE_PROMPT_PREVIEW.variables.map((v) => (
                    <Badge key={v} variant="outline" className="font-mono text-xs">
                      {`{${v}}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  这些变量会在生成时根据选中的章节信息自动替换：
                </p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
                  <li><code className="bg-muted px-1 rounded">title</code> - 章节标题</li>
                  <li><code className="bg-muted px-1 rounded">section</code> - 所属章节（分类名称）</li>
                  <li><code className="bg-muted px-1 rounded">subsection</code> - 所属小节（课程名称）</li>
                  <li><code className="bg-muted px-1 rounded">subject</code> - 科目（xingce/shenlun/mianshi/gongji）</li>
                  <li><code className="bg-muted px-1 rounded">parent</code> - 父级主题</li>
                  <li><code className="bg-muted px-1 rounded">special_requirements</code> - 特殊要求（可选）</li>
                </ul>
              </div>

              <Separator />

              {/* Quick summary */}
              <div>
                <h3 className="text-sm font-semibold mb-2">内容模块速览</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-blue-50 border border-blue-100">
                    <span className="font-medium text-blue-700">考情分析</span>
                    <span className="text-blue-600 ml-1">500字</span>
                  </div>
                  <div className="p-2 rounded bg-green-50 border border-green-100">
                    <span className="font-medium text-green-700">核心概念</span>
                    <span className="text-green-600 ml-1">6个×350字</span>
                  </div>
                  <div className="p-2 rounded bg-purple-50 border border-purple-100">
                    <span className="font-medium text-purple-700">方法步骤</span>
                    <span className="text-purple-600 ml-1">6步×350字</span>
                  </div>
                  <div className="p-2 rounded bg-amber-50 border border-amber-100">
                    <span className="font-medium text-amber-700">记忆口诀</span>
                    <span className="text-amber-600 ml-1">4个</span>
                  </div>
                  <div className="p-2 rounded bg-indigo-50 border border-indigo-100">
                    <span className="font-medium text-indigo-700">例题精讲</span>
                    <span className="text-indigo-600 ml-1">8道×550字</span>
                  </div>
                  <div className="p-2 rounded bg-red-50 border border-red-100">
                    <span className="font-medium text-red-700">易错陷阱</span>
                    <span className="text-red-600 ml-1">6个×200字</span>
                  </div>
                  <div className="p-2 rounded bg-teal-50 border border-teal-100">
                    <span className="font-medium text-teal-700">真题演练</span>
                    <span className="text-teal-600 ml-1">6道×400字</span>
                  </div>
                  <div className="p-2 rounded bg-violet-50 border border-violet-100">
                    <span className="font-medium text-violet-700">练习题目</span>
                    <span className="text-violet-600 ml-1">12道×400字</span>
                  </div>
                  <div className="p-2 rounded bg-pink-50 border border-pink-100">
                    <span className="font-medium text-pink-700">高频词汇</span>
                    <span className="text-pink-600 ml-1">40组</span>
                  </div>
                  <div className="p-2 rounded bg-cyan-50 border border-cyan-100">
                    <span className="font-medium text-cyan-700">思维导图</span>
                    <span className="text-cyan-600 ml-1">Mermaid</span>
                  </div>
                  <div className="p-2 rounded bg-orange-50 border border-orange-100">
                    <span className="font-medium text-orange-700">快速笔记</span>
                    <span className="text-orange-600 ml-1">考前速记</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-medium text-slate-700">总字数</span>
                    <span className="text-slate-600 ml-1">15000-20000字</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Chapter Content Preview Dialog */}
      <Dialog open={showChapterContentDialog} onOpenChange={setShowChapterContentDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              章节内容预览
              {selectedChapterForPreview && (
                <Badge variant="outline" className="ml-2">
                  章节 #{selectedChapterForPreview}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-shrink-0 flex items-center gap-4 text-xs text-muted-foreground border-b pb-3">
            {selectedChapterForPreview && (
              <>
                <span>章节 ID: {selectedChapterForPreview}</span>
                {chaptersWithContent.find(c => c.id === selectedChapterForPreview) && (
                  <>
                    <span>课程: {chaptersWithContent.find(c => c.id === selectedChapterForPreview)?.courseTitle}</span>
                    <span>科目: {getSubjectName(chaptersWithContent.find(c => c.id === selectedChapterForPreview)?.subject || "")}</span>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            {chapterContentLoading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : chapterContentData ? (
              <TestContentRenderer content={chapterContentData} />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                暂无内容数据或加载失败
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ============================================
// Test Content Renderer (Enhanced version for LLM content preview)
// ============================================

interface TestContentProps {
  content: any;
}

function TestContentRenderer({ content }: TestContentProps) {
  if (!content) {
    return <div className="text-center py-8 text-muted-foreground">暂无内容</div>;
  }

  // Handle parse error case
  if (content._parseError) {
    return (
      <div className="space-y-4 p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-amber-800">JSON 解析失败</h3>
          </div>
          <p className="text-sm text-amber-700 mb-3">{content._message || "无法解析生成的内容，显示原始数据"}</p>
        </div>
        <div className="bg-stone-50 rounded-xl p-4 border">
          <h4 className="text-sm font-medium text-stone-600 mb-2">原始响应内容</h4>
          <pre className="text-xs bg-white p-3 rounded-lg overflow-x-auto font-mono max-h-[60vh] whitespace-pre-wrap">
            {content._raw || JSON.stringify(content, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const { exam_analysis, lesson_content, lesson_sections, practice_problems, homework } = content;

  return (
    <div className="space-y-6 p-4">
      {/* 内容截断提示 */}
      {content._isContentTruncated && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-700">
              内容因 Token 限制被截断，仅显示部分内容。建议增加 LLM 的 max_tokens 配置。
            </span>
          </div>
        </div>
      )}

      {/* 章节标题 */}
      {content.chapter_title && (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/20">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {content.chapter_title}
          </h2>
          {content.knowledge_point && (
            <p className="text-sm text-muted-foreground mt-1.5">{content.knowledge_point}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-3 text-sm">
            {content.estimated_duration && (
              <span className="flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-full">
                <Clock className="h-4 w-4 text-primary/70" />
                <span className="text-stone-600">{content.estimated_duration}</span>
              </span>
            )}
            {content.difficulty_level && (
              <Badge variant="secondary" className="px-2.5">{content.difficulty_level}</Badge>
            )}
            {content.word_count_target && (
              <span className="flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-full">
                <FileText className="h-4 w-4 text-primary/70" />
                <span className="text-stone-600">{content.word_count_target}</span>
              </span>
            )}
            {content.subject && (
              <Badge variant="outline" className="px-2.5">{content.subject}</Badge>
            )}
          </div>
        </div>
      )}

      {/* 考情分析 - 增强版 */}
      {exam_analysis && (
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg text-white shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-blue-900 text-lg">考情分析</h3>
            {exam_analysis.frequency && (
              <Badge className="ml-auto bg-blue-100 text-blue-700 hover:bg-blue-100">{exam_analysis.frequency}</Badge>
            )}
          </div>
          
          {/* 核心描述 */}
          <p className="text-sm text-stone-700 leading-relaxed">{exam_analysis.description}</p>
          
          {/* 统计信息 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {exam_analysis.score_weight && (
              <div className="bg-white/70 rounded-lg p-2.5">
                <p className="text-xs text-stone-500">分值权重</p>
                <p className="text-sm font-medium text-blue-800">{exam_analysis.score_weight}</p>
              </div>
            )}
            {exam_analysis.difficulty_trend && (
              <div className="bg-white/70 rounded-lg p-2.5">
                <p className="text-xs text-stone-500">难度趋势</p>
                <p className="text-sm font-medium text-blue-800">{exam_analysis.difficulty_trend}</p>
              </div>
            )}
            {exam_analysis.recent_trends && (
              <div className="bg-white/70 rounded-lg p-2.5 col-span-2 md:col-span-1">
                <p className="text-xs text-stone-500">最新趋势</p>
                <p className="text-sm font-medium text-blue-800 line-clamp-2">{exam_analysis.recent_trends}</p>
              </div>
            )}
          </div>
          
          {/* 考试形式 */}
          {exam_analysis.exam_forms && exam_analysis.exam_forms.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-blue-700 mb-2">常见考查形式</p>
              <div className="flex flex-wrap gap-1.5">
                {exam_analysis.exam_forms.map((form: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-white/50 border-blue-200">{form}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* 命题规律 */}
          {exam_analysis.key_patterns && exam_analysis.key_patterns.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-blue-700 mb-2">命题规律</p>
              <ul className="space-y-1">
                {exam_analysis.key_patterns.map((pattern: string, idx: number) => (
                  <li key={idx} className="text-xs flex items-start gap-1.5">
                    <span className="text-blue-500 mt-0.5">◆</span>
                    <span className="text-stone-600">{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 课程导入 */}
      {lesson_content?.introduction && (
        <section className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg text-white shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">课程导入</h3>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{lesson_content.introduction}</p>
        </section>
      )}

      {/* 学习目标 */}
      {lesson_content?.learning_goals && lesson_content.learning_goals.length > 0 && (
        <section className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg text-white shadow-sm">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">学习目标</h3>
          </div>
          <ul className="space-y-2.5">
            {lesson_content.learning_goals.map((goal: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm">
                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-stone-700">{goal}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 前置知识 */}
      {lesson_content?.prerequisites && lesson_content.prerequisites.length > 0 && (
        <section className="bg-stone-50 rounded-xl p-5 border">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-stone-500 to-stone-600 rounded-lg text-white shadow-sm">
              <BookMarked className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">前置知识</h3>
          </div>
          <ul className="space-y-2">
            {lesson_content.prerequisites.map((prereq: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-stone-400 mt-0.5">•</span>
                <span className="text-stone-600">{prereq}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 核心概念 */}
      {lesson_content?.core_concepts && lesson_content.core_concepts.length > 0 && (
        <section className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg text-white shadow-sm">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">核心概念</h3>
            <Badge variant="secondary" className="ml-auto">{lesson_content.core_concepts.length} 个</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {lesson_content.core_concepts.map((concept: any, idx: number) => (
              <Collapsible key={idx} className="group">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50/50 rounded-xl border border-purple-100 hover:border-purple-200 transition-colors">
                  <CollapsibleTrigger className="w-full text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-purple-900">{concept.name}</h4>
                      <ChevronRight className="h-4 w-4 text-purple-400 group-data-[state=open]:rotate-90 transition-transform" />
                    </div>
                    {concept.definition && (
                      <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">{concept.definition}</p>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {concept.detailed_explanation && (
                      <div className="mt-3 pt-3 border-t border-purple-100">
                        <p className="text-xs text-stone-700 leading-relaxed">{concept.detailed_explanation}</p>
                      </div>
                    )}
                    {concept.application_scenarios && concept.application_scenarios.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-purple-700 mb-1">应用场景</p>
                        <ul className="space-y-1">
                          {concept.application_scenarios.map((scenario: string, sIdx: number) => (
                            <li key={sIdx} className="text-xs text-stone-600 flex items-start gap-1">
                              <span className="text-purple-400">•</span>
                              {scenario}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {concept.example && (
                      <div className="mt-3 p-2 bg-white rounded-lg border border-purple-50">
                        <p className="text-xs font-medium text-purple-700 mb-1">示例</p>
                        <p className="text-xs text-stone-600">{concept.example}</p>
                      </div>
                    )}
                    {concept.common_pairs && concept.common_pairs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {concept.common_pairs.map((pair: string, pIdx: number) => (
                          <Badge key={pIdx} variant="outline" className="text-xs bg-white">{pair}</Badge>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </section>
      )}

      {/* 方法步骤 */}
      {lesson_content?.method_steps && lesson_content.method_steps.length > 0 && (
        <section className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg text-white shadow-sm">
              <ListOrdered className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">方法步骤</h3>
          </div>
          <div className="space-y-4">
            {lesson_content.method_steps.map((step: any, idx: number) => (
              <Collapsible key={idx} className="group">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                    {step.step || idx + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <CollapsibleTrigger className="w-full text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-stone-800">{step.title}</h4>
                        <ChevronRight className="h-4 w-4 text-stone-400 group-data-[state=open]:rotate-90 transition-transform" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <p className="text-sm text-stone-600 mt-2 leading-relaxed">{step.content}</p>
                      {step.tips && (
                        <p className="text-sm text-cyan-700 mt-2 p-2 bg-cyan-50 rounded-lg">💡 {step.tips}</p>
                      )}
                      {step.time_allocation && (
                        <p className="text-xs text-stone-500 mt-2">⏱️ {step.time_allocation}</p>
                      )}
                      {step.common_errors && (
                        <p className="text-xs text-red-600 mt-2">⚠️ {step.common_errors}</p>
                      )}
                      {step.key_signals && step.key_signals.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {step.key_signals.map((signal: string, sIdx: number) => (
                            <Badge key={sIdx} variant="outline" className="text-xs">{signal}</Badge>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </div>
                </div>
              </Collapsible>
            ))}
          </div>
        </section>
      )}

      {/* 记忆口诀 */}
      {lesson_content?.formulas && lesson_content.formulas.length > 0 && (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl p-5 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg text-white shadow-sm">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-amber-900 text-lg">记忆口诀</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {lesson_content.formulas.map((formula: any, idx: number) => (
              <Collapsible key={idx} className="group">
                <div className="p-4 bg-white/70 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors">
                  <CollapsibleTrigger className="w-full text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-amber-800">{formula.name}</h4>
                      <ChevronRight className="h-4 w-4 text-amber-400 group-data-[state=open]:rotate-90 transition-transform" />
                    </div>
                    <p className="text-amber-900 bg-gradient-to-r from-amber-100 to-orange-100 p-2.5 rounded-lg mt-2 text-sm font-medium">
                      {formula.content}
                    </p>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {formula.detailed_explanation && (
                      <p className="text-xs text-stone-600 mt-3 leading-relaxed">{formula.detailed_explanation}</p>
                    )}
                    {formula.memory_aid && (
                      <p className="text-xs text-amber-700 mt-2 p-2 bg-amber-50 rounded-lg">🧠 {formula.memory_aid}</p>
                    )}
                    {formula.examples && formula.examples.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {formula.examples.map((ex: string, eIdx: number) => (
                          <Badge key={eIdx} variant="outline" className="text-xs bg-white">{ex}</Badge>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </section>
      )}

      {/* 记忆技巧 */}
      {lesson_content?.memory_tips && lesson_content.memory_tips.length > 0 && (
        <section className="bg-gradient-to-br from-pink-50 to-rose-50/50 rounded-xl p-5 border border-pink-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-pink-900 text-lg">记忆技巧</h3>
          </div>
          <div className="space-y-4">
            {lesson_content.memory_tips.map((tip: any, idx: number) => (
              <div key={idx} className="p-4 bg-white/70 rounded-xl border border-pink-100">
                <h4 className="font-semibold text-pink-800 text-sm">{tip.tip}</h4>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{tip.content}</p>
                {tip.example && (
                  <p className="text-xs text-pink-700 mt-2 p-2 bg-pink-50 rounded-lg">📝 {tip.example}</p>
                )}
                {tip.word_pairs && tip.word_pairs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tip.word_pairs.map((pair: string, pIdx: number) => (
                      <Badge key={pIdx} variant="outline" className="text-xs bg-white">{pair}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 易错陷阱 */}
      {lesson_content?.common_mistakes && lesson_content.common_mistakes.length > 0 && (
        <section className="bg-gradient-to-br from-red-50 to-rose-50/50 rounded-xl p-5 border border-red-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg text-white shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-red-900 text-lg">易错陷阱</h3>
            <Badge variant="destructive" className="ml-auto">{lesson_content.common_mistakes.length} 个</Badge>
          </div>
          <div className="space-y-3">
            {lesson_content.common_mistakes.map((mistake: any, idx: number) => (
              <div key={idx} className="p-4 bg-white/70 rounded-xl border border-red-100">
                <h4 className="font-semibold text-red-800 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {mistake.mistake}
                </h4>
                <p className="text-xs text-stone-600 mt-2">
                  <span className="font-medium text-red-700">原因：</span>
                  {mistake.reason}
                </p>
                <p className="text-xs text-stone-600 mt-1.5 p-2 bg-emerald-50 rounded-lg">
                  <span className="font-medium text-emerald-700">✓ 正确做法：</span>
                  {mistake.correction}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 练习题目 */}
      {practice_problems && practice_problems.length > 0 && (
        <section className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg text-white shadow-sm">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">练习题目</h3>
            <Badge variant="secondary" className="ml-auto">{practice_problems.length} 道</Badge>
          </div>
          <div className="space-y-4">
            {practice_problems.slice(0, 5).map((problem: any, idx: number) => (
              <div key={idx} className="p-4 bg-stone-50 rounded-xl border">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                    第 {problem.order || idx + 1} 题
                  </Badge>
                  {problem.difficulty_level && (
                    <Badge variant="outline" className="text-xs">{problem.difficulty_level}</Badge>
                  )}
                  {problem.source && (
                    <span className="text-xs text-stone-500 ml-auto">{problem.source}</span>
                  )}
                </div>
                <p className="text-sm text-stone-800 leading-relaxed">{problem.problem}</p>
                {problem.options && (
                  <div className="mt-3 space-y-1.5">
                    {problem.options.map((opt: string, oIdx: number) => (
                      <div key={oIdx} className="p-2 bg-white rounded-lg text-sm border hover:border-violet-200 transition-colors">
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                <details className="mt-3">
                  <summary className="cursor-pointer text-violet-600 text-sm font-medium hover:text-violet-700">
                    查看答案与解析
                  </summary>
                  <div className="mt-3 p-3 bg-violet-50 rounded-lg space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-violet-800">答案：</span>
                      <span className="text-violet-900">{problem.answer}</span>
                    </p>
                    {problem.analysis && (
                      <p className="text-xs text-stone-600 leading-relaxed">{problem.analysis}</p>
                    )}
                    {problem.key_points && (
                      <p className="text-xs text-violet-700">💡 {problem.key_points}</p>
                    )}
                  </div>
                </details>
              </div>
            ))}
            {practice_problems.length > 5 && (
              <p className="text-sm text-center text-muted-foreground py-2">
                还有 {practice_problems.length - 5} 道题目...
              </p>
            )}
          </div>
        </section>
      )}

      {/* 思维导图 */}
      {lesson_content?.mind_map_mermaid && (
        <section className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg text-white shadow-sm">
              <Map className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">思维导图</h3>
            <Badge variant="outline" className="ml-auto text-xs">Mermaid 格式</Badge>
          </div>
          <pre className="text-xs bg-stone-50 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono border">
            {lesson_content.mind_map_mermaid}
          </pre>
        </section>
      )}

      {/* 快速笔记 */}
      {lesson_content?.quick_notes && (
        <section className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-xl p-5 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-amber-900 text-lg">快速笔记</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {lesson_content.quick_notes.key_points && lesson_content.quick_notes.key_points.length > 0 && (
              <div className="p-4 bg-white/70 rounded-xl border border-amber-100">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">📌 核心要点</h4>
                <ul className="space-y-1.5">
                  {lesson_content.quick_notes.key_points.map((point: string, idx: number) => (
                    <li key={idx} className="text-xs flex items-start gap-1.5 text-stone-600">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lesson_content.quick_notes.exam_tips && lesson_content.quick_notes.exam_tips.length > 0 && (
              <div className="p-4 bg-white/70 rounded-xl border border-amber-100">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">💡 考场技巧</h4>
                <ul className="space-y-1.5">
                  {lesson_content.quick_notes.exam_tips.map((tip: string, idx: number) => (
                    <li key={idx} className="text-xs flex items-start gap-1.5 text-stone-600">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lesson_content.quick_notes.formulas_summary && lesson_content.quick_notes.formulas_summary.length > 0 && (
              <div className="p-4 bg-white/70 rounded-xl border border-amber-100 md:col-span-2">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">📝 口诀速记</h4>
                <ul className="space-y-1.5">
                  {lesson_content.quick_notes.formulas_summary.map((f: string, idx: number) => (
                    <li key={idx} className="text-xs flex items-start gap-1.5 text-stone-600">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 课程总结 */}
      {lesson_content?.summary_points && lesson_content.summary_points.length > 0 && (
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg text-white shadow-sm">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-emerald-900 text-lg">课程总结</h3>
          </div>
          <ul className="space-y-3">
            {lesson_content.summary_points.map((point: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                  {idx + 1}
                </span>
                <span className="text-stone-700 pt-0.5">{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 课后作业 */}
      {homework && (
        <section className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg text-white shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">课后作业</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {homework.required && homework.required.length > 0 && (
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  必做作业
                </h4>
                <ul className="space-y-1.5">
                  {homework.required.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs flex items-start gap-1.5 text-stone-600">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {homework.optional && homework.optional.length > 0 && (
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  选做作业
                </h4>
                <ul className="space-y-1.5">
                  {homework.optional.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs flex items-start gap-1.5 text-stone-600">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Raw JSON Preview (for debugging) */}
      <details className="bg-stone-50 rounded-xl p-4 border">
        <summary className="cursor-pointer text-sm font-medium text-stone-600 hover:text-stone-800">
          🔧 查看原始 JSON 数据（调试用）
        </summary>
        <pre className="mt-3 text-xs bg-white p-4 rounded-xl overflow-x-auto font-mono max-h-96 border">
          {JSON.stringify(content, null, 2)}
        </pre>
      </details>
    </div>
  );
}
