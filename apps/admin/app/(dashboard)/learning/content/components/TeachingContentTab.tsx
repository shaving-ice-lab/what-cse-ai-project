"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
  Eye,
  FlaskConical,
  FolderTree,
  ListChecks,
  Loader2,
  Clock,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@what-cse/ui";
import { cn } from "@what-cse/ui";
import {
  buildUserPrompt,
  contentGeneratorApi,
  CourseTreeCategoryNode,
  CourseTreeChapterNode,
  CourseTreeCourseNode,
  CourseTreeResponse,
  CourseTreeSummary,
  CourseTreeSubjectNode,
  getSystemPrompt,
  SUBJECTS,
  Subject,
  getSubjectName,
  getTaskStatusColor,
  getTaskStatusLabel,
  getTaskKey,
  getUserPromptTemplate,
  PromptVariables,
  TaskStatus,
} from "@/services/content-generator-api";
import { toast } from "sonner";
import { LessonContentPreview } from "./LessonContentPreview";

interface TeachingContentTabProps {
  onTaskCreated?: () => void;
}

type SubjectFilter = Subject | "all";

type ChapterOption = {
  id: number;
  title: string;
  courseTitle: string;
  categoryPath: string;
  subject: Subject;
  subjectName: string;
  label: string;
};

type TestGenerationTask = {
  taskId: number;
  chapterId: number;
  chapterTitle: string;
  subject?: string;
  status: TaskStatus | "cancelled";
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  result?: unknown;
  rawResult?: string;
  isContentTruncated?: boolean;
};

// 内容生成任务类型（用于任务列表显示）
type ContentGenerationTask = {
  id: number;
  taskKey: string;
  taskSource?: string;
  taskType: "chapter" | "course" | "category" | "batch";
  targetId: number;
  targetName: string;
  courseName?: string;
  categoryPath?: string;
  subjectName?: string;
  status: TaskStatus;
  progress?: number;
  message?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
};

type MainTabValue = "tree" | "generating" | "completed";

type ChapterPreviewState = {
  chapterId: number;
  title: string;
  courseTitle?: string;
  categoryPath?: string;
  subjectName?: string;
};

const EMPTY_SUMMARY: CourseTreeSummary = { categories: 0, courses: 0, chapters: 0, pending: 0 };
const CATEGORY_RENDER_BATCH = 40;

const sumSummary = (a: CourseTreeSummary, b: CourseTreeSummary): CourseTreeSummary => ({
  categories: a.categories + b.categories,
  courses: a.courses + b.courses,
  chapters: a.chapters + b.chapters,
  pending: a.pending + b.pending,
});

const buildChapterOption = (
  subject: CourseTreeSubjectNode,
  categoryPath: string,
  course: CourseTreeCourseNode,
  chapter: CourseTreeChapterNode
): ChapterOption => {
  const labelParts = [
    subject.name || getSubjectName(subject.subject),
    categoryPath,
    course.title,
    chapter.title,
  ].filter(Boolean);
  return {
    id: chapter.id,
    title: chapter.title,
    courseTitle: course.title,
    categoryPath,
    subject: subject.subject as Subject,
    subjectName: subject.name || getSubjectName(subject.subject),
    label: labelParts.join(" - "),
  };
};

const collectChapterOptions = (subjects: CourseTreeSubjectNode[]): ChapterOption[] => {
  const options: ChapterOption[] = [];
  const walkCategory = (
    subject: CourseTreeSubjectNode,
    node: CourseTreeCategoryNode,
    path: string[]
  ) => {
    const nextPath = [...path, node.name];
    for (const course of node.courses ?? []) {
      for (const chapter of course.chapters ?? []) {
        const categoryPath = nextPath.join(" / ");
        options.push(buildChapterOption(subject, categoryPath, course, chapter));
      }
    }
    for (const child of node.children ?? []) {
      walkCategory(subject, child, nextPath);
    }
  };

  for (const subject of subjects) {
    for (const category of subject.categories ?? []) {
      walkCategory(subject, category, []);
    }
  }
  return options;
};

const findChapterOptionById = (
  subjects: CourseTreeSubjectNode[],
  chapterId: number
): ChapterOption | undefined => {
  const walkCategory = (
    subject: CourseTreeSubjectNode,
    node: CourseTreeCategoryNode,
    path: string[]
  ): ChapterOption | undefined => {
    const nextPath = [...path, node.name];
    for (const course of node.courses ?? []) {
      for (const chapter of course.chapters ?? []) {
        if (chapter.id === chapterId) {
          return buildChapterOption(subject, nextPath.join(" / "), course, chapter);
        }
      }
    }
    for (const child of node.children ?? []) {
      const found = walkCategory(subject, child, nextPath);
      if (found) return found;
    }
    return undefined;
  };

  for (const subject of subjects) {
    for (const category of subject.categories ?? []) {
      const found = walkCategory(subject, category, []);
      if (found) return found;
    }
  }
  return undefined;
};

const extractAndParseJSON = (text: string): { parsed: any; isComplete: boolean; raw: string } => {
  let jsonStr = text.trim();
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith("```")) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  try {
    return { parsed: JSON.parse(jsonStr), isComplete: true, raw: jsonStr };
  } catch {
    // Continue to attempt recovery.
  }

  let fixedJson = jsonStr;
  const openBraces = (jsonStr.match(/{/g) || []).length;
  const closeBraces = (jsonStr.match(/}/g) || []).length;
  const openBrackets = (jsonStr.match(/\[/g) || []).length;
  const closeBrackets = (jsonStr.match(/\]/g) || []).length;

  fixedJson = fixedJson.replace(/,\s*"[^"]*$/, "");
  fixedJson = fixedJson.replace(/:\s*"[^"]*$/, ": null");
  fixedJson = fixedJson.replace(/,\s*$/, "");

  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    fixedJson += "]";
  }
  for (let i = 0; i < openBraces - closeBraces; i++) {
    fixedJson += "}";
  }

  try {
    return { parsed: JSON.parse(fixedJson), isComplete: false, raw: jsonStr };
  } catch {
    return { parsed: null, isComplete: false, raw: jsonStr };
  }
};

const findCategoryNodeById = (
  nodes: CourseTreeCategoryNode[],
  categoryId: number
): CourseTreeCategoryNode | undefined => {
  for (const node of nodes) {
    if (node.id === categoryId) return node;
    if (node.children?.length) {
      const found = findCategoryNodeById(node.children, categoryId);
      if (found) return found;
    }
  }
  return undefined;
};

const findCourseNodeById = (
  nodes: CourseTreeCategoryNode[],
  courseId: number
): CourseTreeCourseNode | undefined => {
  for (const node of nodes) {
    const course = node.courses?.find((item) => item.id === courseId);
    if (course) return course;
    if (node.children?.length) {
      const found = findCourseNodeById(node.children, courseId);
      if (found) return found;
    }
  }
  return undefined;
};

const updateCategoryNodeById = (
  nodes: CourseTreeCategoryNode[],
  categoryId: number,
  updater: (node: CourseTreeCategoryNode) => CourseTreeCategoryNode
): CourseTreeCategoryNode[] => {
  let changed = false;
  const updated = nodes.map((node) => {
    if (node.id === categoryId) {
      changed = true;
      return updater(node);
    }
    if (node.children?.length) {
      const updatedChildren = updateCategoryNodeById(node.children, categoryId, updater);
      if (updatedChildren !== node.children) {
        changed = true;
        return { ...node, children: updatedChildren };
      }
    }
    return node;
  });
  return changed ? updated : nodes;
};

const updateCourseNodeById = (
  nodes: CourseTreeCategoryNode[],
  courseId: number,
  updater: (node: CourseTreeCourseNode) => CourseTreeCourseNode
): CourseTreeCategoryNode[] => {
  let changed = false;
  const updated = nodes.map((node) => {
    let nextNode = node;
    if (node.courses?.length) {
      let courseChanged = false;
      const updatedCourses = node.courses.map((course) => {
        if (course.id !== courseId) return course;
        courseChanged = true;
        return updater(course);
      });
      if (courseChanged) {
        nextNode = { ...nextNode, courses: updatedCourses };
        changed = true;
      }
    }
    if (node.children?.length) {
      const updatedChildren = updateCourseNodeById(node.children, courseId, updater);
      if (updatedChildren !== node.children) {
        nextNode = { ...nextNode, children: updatedChildren };
        changed = true;
      }
    }
    return nextNode;
  });
  return changed ? updated : nodes;
};

const buildInitialRenderCounts = (subjects: CourseTreeSubjectNode[]) => {
  const counts: Record<string, number> = {};
  for (const subject of subjects) {
    const total = subject.categories?.length ?? 0;
    counts[subject.subject] = Math.min(total, CATEGORY_RENDER_BATCH);
  }
  return counts;
};

const collectChapterIds = (nodes: CourseTreeCategoryNode[], onlyPending: boolean): number[] => {
  let ids: number[] = [];
  for (const node of nodes) {
    for (const course of node.courses ?? []) {
      const courseChapters = course.chapters ?? [];
      const chapters = onlyPending
        ? courseChapters.filter((ch) => !ch.has_content)
        : courseChapters;
      ids = ids.concat(chapters.map((ch) => ch.id));
    }
    if (node.children?.length) {
      ids = ids.concat(collectChapterIds(node.children, onlyPending));
    }
  }
  return ids;
};

// 构建所有可展开节点的 ID 集合（用于全部展开功能）
const buildAllExpandableIds = (subjects: CourseTreeSubjectNode[]) => {
  const ids = new Set<string>();
  const walkCategory = (node: CourseTreeCategoryNode) => {
    const hasLoadedChildren = (node.children?.length ?? 0) > 0;
    const hasLoadedCourses = (node.courses?.length ?? 0) > 0;
    if (hasLoadedChildren || hasLoadedCourses) ids.add(`cat-${node.id}`);
    for (const child of node.children ?? []) walkCategory(child);
    for (const course of node.courses ?? []) {
      if ((course.chapters?.length ?? 0) > 0) ids.add(`course-${course.id}`);
    }
  };
  for (const subject of subjects) {
    for (const category of subject.categories ?? []) {
      walkCategory(category);
    }
  }
  return ids;
};

// 只展开第一层分类（默认状态）
const buildFirstLevelExpandedIds = (subjects: CourseTreeSubjectNode[]) => {
  const ids = new Set<string>();
  for (const subject of subjects) {
    for (const category of subject.categories ?? []) {
      // 只添加顶层分类
      ids.add(`cat-${category.id}`);
    }
  }
  return ids;
};

const getCoursePendingCount = (course: CourseTreeCourseNode): number | null => {
  if (typeof course.pending_count === "number") return course.pending_count;
  if (course.chapters) {
    return course.chapters.filter((ch) => !ch.has_content).length;
  }
  return null;
};

const getCategoryPendingCount = (node: CourseTreeCategoryNode): number | null => {
  if (typeof node.pending_count === "number") return node.pending_count;
  const hasLoadedChildren = node.children !== undefined;
  const hasLoadedCourses = node.courses !== undefined;
  if (!hasLoadedChildren && !hasLoadedCourses) return null;
  let pendingTotal = 0;
  for (const course of node.courses ?? []) {
    const pending = getCoursePendingCount(course);
    if (pending === null) return null;
    pendingTotal += pending;
  }
  for (const child of node.children ?? []) {
    const pending = getCategoryPendingCount(child);
    if (pending === null) return null;
    pendingTotal += pending;
  }
  return pendingTotal;
};

function TaskStatusBadge({ status }: { status: TaskStatus | "cancelled" }) {
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    processing: <Loader2 className="h-3 w-3 animate-spin" />,
    generating: <Loader2 className="h-3 w-3 animate-spin" />,
    completed: <CheckCircle className="h-3 w-3" />,
    failed: <XCircle className="h-3 w-3" />,
    cancelled: <XCircle className="h-3 w-3" />,
  };

  return (
    <Badge className={cn(getTaskStatusColor(status as TaskStatus), "gap-1")}>
      {icons[status]}
      {getTaskStatusLabel(status as TaskStatus)}
    </Badge>
  );
}

const ChapterRow = memo(function ChapterRow({
  chapter,
  onGenerate,
  generating,
  disabled,
  showAction,
  onPreview,
  onDelete,
  deleting,
}: {
  chapter: CourseTreeChapterNode;
  onGenerate: (chapterId: number) => void;
  generating: boolean;
  disabled: boolean;
  showAction: boolean;
  onPreview?: (chapter: CourseTreeChapterNode) => void;
  onDelete?: (chapterId: number) => void;
  deleting?: boolean;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canPreview = chapter.has_content && onPreview;
  const canDelete = chapter.has_content && onDelete;

  const handleDeleteConfirm = () => {
    onDelete?.(chapter.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between gap-2 py-1.5 pl-10 pr-2 text-sm rounded-md",
          canPreview ? "cursor-pointer hover:bg-muted/50" : "hover:bg-muted/50"
        )}
        onClick={() => {
          if (canPreview && onPreview) onPreview(chapter);
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("truncate", chapter.has_content && "text-muted-foreground")}>
            {chapter.title}
          </span>
          {chapter.has_content && <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2">
          {showAction && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              disabled={disabled || generating}
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(chapter.id);
              }}
            >
              {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              <span className="ml-1">生成</span>
            </Button>
          )}
          {canPreview && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.(chapter);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              查看
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={deleting}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
            >
              {deleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3 mr-1" />
              )}
              删除
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>确认删除内容</DialogTitle>
            <DialogDescription>
              确定要删除章节「{chapter.title}」的生成内容吗？此操作将清空该章节的所有 AI 生成内容，章节结构保留。删除后可以重新生成。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

const CourseNode = memo(function CourseNode({
  course,
  expanded,
  onToggle,
  onGenerateCourse,
  onGenerateChapter,
  onPreviewChapter,
  onDeleteChapter,
  generatingCourse,
  generatingChapters,
  deletingChapters,
  loadingCourses,
  skipExisting,
}: {
  course: CourseTreeCourseNode;
  expanded: boolean;
  onToggle: () => void;
  onGenerateCourse: (courseId: number) => void;
  onGenerateChapter: (chapterId: number) => void;
  onPreviewChapter: (chapter: CourseTreeChapterNode) => void;
  onDeleteChapter: (chapterId: number) => void;
  generatingCourse: boolean;
  generatingChapters: Set<number>;
  deletingChapters: Set<number>;
  loadingCourses: Set<number>;
  skipExisting: boolean;
}) {
  const pendingCount = getCoursePendingCount(course);
  const hasPending = pendingCount === null ? true : pendingCount > 0;
  const canGenerateCourse = hasPending || !skipExisting;
  const hasChapters =
    (course.chapters?.length ?? 0) > 0 ||
    (course.chapter_count ?? 0) > 0 ||
    course.has_chapters;
  const isLoading = loadingCourses.has(course.id);

  return (
    <div className="border-l border-muted pl-2 ml-3">
      <div
        className="flex items-center gap-1.5 py-1.5 pr-2 cursor-pointer hover:bg-muted/50 rounded-md group"
        onClick={() => {
          if (!isLoading) onToggle();
        }}
      >
        {hasChapters ? (
          isLoading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin flex-shrink-0" />
          ) : expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        <BookOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium truncate flex-1">{course.title}</span>
        {pendingCount !== null && pendingCount > 0 && (
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            待生成 {pendingCount}
          </Badge>
        )}
        {canGenerateCourse && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs opacity-0 group-hover:opacity-100 flex-shrink-0"
            disabled={generatingCourse}
            onClick={(e) => {
              e.stopPropagation();
              onGenerateCourse(course.id);
            }}
          >
            {generatingCourse ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Zap className="h-3 w-3 mr-0.5" />
                批量生成
              </>
            )}
          </Button>
        )}
      </div>
      {expanded &&
        (course.chapters ?? []).map((chapter) => {
          const chapterGenerating = generatingChapters.has(chapter.id);
          const chapterDeleting = deletingChapters.has(chapter.id);
          const chapterDisabled = skipExisting && chapter.has_content;
          const showButton = !skipExisting || !chapter.has_content;
          return (
            <div key={chapter.id}>
              <ChapterRow
                chapter={chapter}
                onGenerate={onGenerateChapter}
                generating={chapterGenerating}
                disabled={chapterDisabled}
                showAction={showButton}
                onPreview={onPreviewChapter}
                onDelete={onDeleteChapter}
                deleting={chapterDeleting}
              />
            </div>
          );
        })}
    </div>
  );
});

const CategoryNode = memo(function CategoryNode({
  node,
  expandedIds,
  onToggle,
  onGenerateCategory,
  onGenerateCourse,
  onGenerateChapter,
  onPreviewChapter,
  onDeleteChapter,
  generatingCategories,
  generatingCourse,
  generatingChapters,
  deletingChapters,
  loadingCategories,
  loadingCourses,
  skipExisting,
}: {
  node: CourseTreeCategoryNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onGenerateCategory: (categoryId: number) => void;
  onGenerateCourse: (courseId: number) => void;
  onGenerateChapter: (chapterId: number) => void;
  onPreviewChapter: (chapter: CourseTreeChapterNode) => void;
  onDeleteChapter: (chapterId: number) => void;
  generatingCategories: Set<number>;
  generatingCourse: Set<number>;
  generatingChapters: Set<number>;
  deletingChapters: Set<number>;
  loadingCategories: Set<number>;
  loadingCourses: Set<number>;
  skipExisting: boolean;
}) {
  const idStr = `cat-${node.id}`;
  const isExpanded = expandedIds.has(idStr);
  const hasChildren =
    (node.children?.length ?? 0) + (node.courses?.length ?? 0) > 0 ||
    node.has_children ||
    node.has_courses;
  const pendingCount = getCategoryPendingCount(node);
  const hasPending = pendingCount === null ? true : pendingCount > 0;
  const canGenerateCategory = hasPending || !skipExisting;
  const isGeneratingCategory = generatingCategories.has(node.id);
  const isLoading = loadingCategories.has(node.id);

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
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-sm font-medium truncate flex-1">{node.name}</span>
        {pendingCount !== null && pendingCount > 0 && (
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            待生成 {pendingCount}
          </Badge>
        )}
        {canGenerateCategory && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs opacity-0 group-hover:opacity-100 flex-shrink-0"
            disabled={isGeneratingCategory}
            onClick={(e) => {
              e.stopPropagation();
              onGenerateCategory(node.id);
            }}
          >
            {isGeneratingCategory ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Zap className="h-3 w-3 mr-0.5" />
                批量生成
              </>
            )}
          </Button>
        )}
      </div>
      {isExpanded && (
        <div className="ml-2">
          {(node.children ?? []).map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onGenerateCategory={onGenerateCategory}
              onGenerateCourse={onGenerateCourse}
              onGenerateChapter={onGenerateChapter}
              onPreviewChapter={onPreviewChapter}
              onDeleteChapter={onDeleteChapter}
              generatingCategories={generatingCategories}
              generatingCourse={generatingCourse}
              generatingChapters={generatingChapters}
              deletingChapters={deletingChapters}
              loadingCategories={loadingCategories}
              loadingCourses={loadingCourses}
              skipExisting={skipExisting}
            />
          ))}
          {(node.courses ?? []).map((course) => (
            <CourseNode
              key={course.id}
              course={course}
              expanded={expandedIds.has(`course-${course.id}`)}
              onToggle={() => onToggle(`course-${course.id}`)}
              onGenerateCourse={onGenerateCourse}
              onGenerateChapter={onGenerateChapter}
              onPreviewChapter={onPreviewChapter}
              onDeleteChapter={onDeleteChapter}
              generatingCourse={generatingCourse.has(course.id)}
              generatingChapters={generatingChapters}
              deletingChapters={deletingChapters}
              loadingCourses={loadingCourses}
              skipExisting={skipExisting}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export function TeachingContentTab({ onTaskCreated }: TeachingContentTabProps) {
  const [tree, setTree] = useState<CourseTreeResponse | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [filterSubject, setFilterSubject] = useState<SubjectFilter>("all");
  const [skipExisting, setSkipExisting] = useState(true);
  const [autoImport, setAutoImport] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [categoryRenderCounts, setCategoryRenderCounts] = useState<Record<string, number>>({});
  const [loadingCategoryIds, setLoadingCategoryIds] = useState<Set<number>>(new Set());
  const [loadingCourseIds, setLoadingCourseIds] = useState<Set<number>>(new Set());
  const [generatingChapters, setGeneratingChapters] = useState<Set<number>>(new Set());
  const [generatingCourses, setGeneratingCourses] = useState<Set<number>>(new Set());
  const [generatingCategories, setGeneratingCategories] = useState<Set<number>>(new Set());
  const [generatingAll, setGeneratingAll] = useState(false);
  const [deletingChapters, setDeletingChapters] = useState<Set<number>>(new Set());
  const [clearingAll, setClearingAll] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  // 主 Tab 状态
  const [mainTab, setMainTab] = useState<MainTabValue>("tree");
  
  // 生成任务列表状态
  const [generationTasks, setGenerationTasks] = useState<ContentGenerationTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskSearchKeyword, setTaskSearchKeyword] = useState("");
  const generationTasksRef = useRef<ContentGenerationTask[]>([]);

  const [promptPreviewOpen, setPromptPreviewOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testResultOpen, setTestResultOpen] = useState(false);
  const [chapterOptions, setChapterOptions] = useState<ChapterOption[]>([]);
  const [loadingChapterOptions, setLoadingChapterOptions] = useState(false);
  const [selectedTestTaskId, setSelectedTestTaskId] = useState<number | null>(null);
  const [previewChapterId, setPreviewChapterId] = useState<string>("");
  const [testChapterId, setTestChapterId] = useState<string>("");
  const [testSubjectOverride, setTestSubjectOverride] = useState<Subject | "auto">("auto");
  const [testUseCustomPrompt, setTestUseCustomPrompt] = useState(false);
  const [testSystemPrompt, setTestSystemPrompt] = useState(() => getSystemPrompt());
  const [testUserPromptTemplate, setTestUserPromptTemplate] = useState(() => getUserPromptTemplate());
  const [testGenerating, setTestGenerating] = useState(false);
  const [testTasks, setTestTasks] = useState<TestGenerationTask[]>([]);
  const testTasksRef = useRef<TestGenerationTask[]>([]);

  const [contentPreviewOpen, setContentPreviewOpen] = useState(false);
  const [contentPreviewLoading, setContentPreviewLoading] = useState(false);
  const [contentPreviewError, setContentPreviewError] = useState<string | null>(null);
  const [contentPreviewData, setContentPreviewData] = useState<any>(null);
  const [contentPreviewRaw, setContentPreviewRaw] = useState<string>("");
  const [contentPreviewTruncated, setContentPreviewTruncated] = useState(false);
  const [contentPreviewChapter, setContentPreviewChapter] = useState<ChapterPreviewState | null>(null);

  const [promptVars, setPromptVars] = useState<PromptVariables>({
    title: "",
    section: "",
    subsection: "",
    subject: "xingce",
    parent: "",
    special_requirements: "",
  });

  const fetchTree = useCallback(async () => {
    setLoadingTree(true);
    try {
      const result = await contentGeneratorApi.getCourseTreeRoots();
      setTree(result);
      setCategoryRenderCounts(buildInitialRenderCounts(result.subjects));
      setExpandedIds(new Set());
      setLoadingCategoryIds(new Set());
      setLoadingCourseIds(new Set());
      // 默认收缩状态，不自动展开任何节点
      // 如果需要展开第一层，可以使用: setExpandedIds(buildFirstLevelExpandedIds(result.subjects));
    } catch (error) {
      console.error("Failed to fetch course tree:", error);
      toast.error("获取失败");
      setTree(null);
    } finally {
      setLoadingTree(false);
    }
  }, []);

  // 展开所有节点
  const handleExpandAll = useCallback(() => {
    if (tree) {
      const scopedSubjects = filterSubject === "all"
        ? tree.subjects
        : tree.subjects.filter((s) => s.subject === filterSubject);
      setExpandedIds(buildAllExpandableIds(scopedSubjects));
      setCategoryRenderCounts((prev) => {
        const next = { ...prev };
        for (const subject of scopedSubjects) {
          next[subject.subject] = subject.categories?.length ?? 0;
        }
        return next;
      });
    }
  }, [tree, filterSubject]);

  // 收缩所有节点
  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // 获取生成任务列表
  const fetchGenerationTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const result = await contentGeneratorApi.getTasks({ page: 1, page_size: 100, session_only: true });
      const tasks: ContentGenerationTask[] = (result.tasks || []).map((task) => ({
        id: task.id,
        taskKey: getTaskKey(task),
        taskSource: task.task_source,
        taskType: task.task_type as ContentGenerationTask["taskType"],
        targetId: task.id,
        targetName: task.template_name || `任务 #${task.id}`,
        subjectName: task.subject ? getSubjectName(task.subject) : undefined,
        status: task.status,
        progress: task.progress,
        message: task.error_message,
        createdAt: task.created_at,
        updatedAt: task.started_at,
        completedAt: task.completed_at,
      }));
      setGenerationTasks(tasks);
      generationTasksRef.current = tasks;
    } catch (error) {
      console.error("Failed to fetch generation tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // 添加任务到列表（生成时调用）
  const addGenerationTask = useCallback((task: ContentGenerationTask) => {
    setGenerationTasks((prev) => {
      const exists = prev.some((t) => t.taskKey === task.taskKey);
      if (exists) {
        return prev.map((t) => (t.taskKey === task.taskKey ? task : t));
      }
      return [task, ...prev];
    });
    generationTasksRef.current = [
      ...generationTasksRef.current.filter((t) => t.taskKey !== task.taskKey),
      task,
    ];
  }, []);

  // 更新任务状态
  const updateTaskStatus = useCallback((taskId: number, updates: Partial<ContentGenerationTask>) => {
    setGenerationTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  // 轮询正在处理的任务
  useEffect(() => {
    const hasProcessing = generationTasks.some(
      (t) => t.status === "pending" || t.status === "processing" || t.status === "generating"
    );
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const result = await contentGeneratorApi.getTasks({ page: 1, page_size: 100, session_only: true });
        const tasks: ContentGenerationTask[] = (result.tasks || []).map((task) => ({
          id: task.id,
          taskKey: getTaskKey(task),
          taskSource: task.task_source,
          taskType: task.task_type as ContentGenerationTask["taskType"],
          targetId: task.id,
          targetName: task.template_name || `任务 #${task.id}`,
          subjectName: task.subject ? getSubjectName(task.subject) : undefined,
          status: task.status,
          progress: task.progress,
          message: task.error_message,
          createdAt: task.created_at,
          updatedAt: task.started_at,
          completedAt: task.completed_at,
        }));
        const previousCompletedCount = generationTasksRef.current.filter(
          (t) => t.status === "completed"
        ).length;
        const completedNowCount = tasks.filter((t) => t.status === "completed").length;
        setGenerationTasks(tasks);
        generationTasksRef.current = tasks;

        // 检查是否有任务完成，刷新课程树
        if (completedNowCount > previousCompletedCount) {
          fetchTree();
        }
      } catch (error) {
        console.error("Failed to poll tasks:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [generationTasks, fetchTree]);

  useEffect(() => {
    fetchTree();
    fetchGenerationTasks();
  }, [fetchTree, fetchGenerationTasks]);

  const subjectsToShow = useMemo(() => {
    if (!tree) return [];
    if (filterSubject === "all") return tree.subjects;
    return tree.subjects.filter((s) => s.subject === filterSubject);
  }, [tree, filterSubject]);

  // 正在生成的任务
  const generatingTasksList = useMemo(() => {
    return generationTasks
      .filter((t) => ["pending", "processing", "generating"].includes(t.status))
      .filter((t) => !taskSearchKeyword || t.targetName.toLowerCase().includes(taskSearchKeyword.toLowerCase()));
  }, [generationTasks, taskSearchKeyword]);

  // 已完成的任务
  const completedTasksList = useMemo(() => {
    return generationTasks
      .filter((t) => ["completed", "failed"].includes(t.status))
      .filter((t) => !taskSearchKeyword || t.targetName.toLowerCase().includes(taskSearchKeyword.toLowerCase()));
  }, [generationTasks, taskSearchKeyword]);

  // 任务统计
  const taskStats = useMemo(() => ({
    total: generationTasks.length,
    generating: generationTasks.filter((t) => ["pending", "processing", "generating"].includes(t.status)).length,
    completed: generationTasks.filter((t) => t.status === "completed").length,
    failed: generationTasks.filter((t) => t.status === "failed").length,
  }), [generationTasks]);

  const chapterOptionMap = useMemo(
    () => new Map(chapterOptions.map((option) => [option.id, option])),
    [chapterOptions]
  );

  const fetchChapterOptions = useCallback(async () => {
    setLoadingChapterOptions(true);
    try {
      const result = await contentGeneratorApi.getCourseTree();
      setChapterOptions(collectChapterOptions(result.subjects));
    } catch (error) {
      console.error("Failed to fetch chapter options:", error);
      toast.error("加载章节列表失败");
    } finally {
      setLoadingChapterOptions(false);
    }
  }, []);

  useEffect(() => {
    if ((promptPreviewOpen || testDialogOpen) && chapterOptions.length === 0 && !loadingChapterOptions) {
      fetchChapterOptions();
    }
  }, [promptPreviewOpen, testDialogOpen, chapterOptions.length, loadingChapterOptions, fetchChapterOptions]);

  const resolveChapterOptionById = useCallback(
    (chapterId: number) => {
      if (chapterOptionMap.size > 0) {
        return chapterOptionMap.get(chapterId);
      }
      if (!tree) return undefined;
      return findChapterOptionById(tree.subjects, chapterId);
    },
    [chapterOptionMap, tree]
  );

  const buildPromptVarsFromChapter = useCallback((option: ChapterOption): PromptVariables => {
    const categoryPath = option.categoryPath || "未知分类";
    return {
      title: option.title || "未知章节标题",
      section: option.courseTitle || "未知课程",
      subsection: categoryPath,
      subject: option.subject,
      parent: categoryPath || "??",
      special_requirements: "",
    };
  }, []);

  const summary = useMemo(() => {
    if (!tree) return { ...EMPTY_SUMMARY };
    const scopedSubjects = filterSubject === "all"
      ? tree.subjects
      : tree.subjects.filter((s) => s.subject === filterSubject);
    return scopedSubjects.reduce((acc, subject) => {
      return sumSummary(acc, subject.summary ?? EMPTY_SUMMARY);
    }, { ...EMPTY_SUMMARY });
  }, [tree, filterSubject]);

  useEffect(() => {
    testTasksRef.current = testTasks;
  }, [testTasks]);

  const handleCopy = (content: string, label = "内容") => {
    if (!content) {
      toast.error("没有可复制的内容");
      return;
    }
    navigator.clipboard.writeText(content);
    toast.success(`已复制${label}`);
  };

  const handlePreviewChapterChange = (value: string) => {
    setPreviewChapterId(value);
    const option = chapterOptionMap.get(Number(value));
    if (option) {
      setPromptVars(buildPromptVarsFromChapter(option));
    }
  };

  const handleTestChapterChange = (value: string) => {
    setTestChapterId(value);
    const option = chapterOptionMap.get(Number(value));
    if (option) {
      if (testUseCustomPrompt) {
        setTestUserPromptTemplate(buildUserPrompt(buildPromptVarsFromChapter(option)));
      }
    }
  };

  const resolveTestTaskContent = useCallback(async (taskStatus: any, chapterId: number) => {
    let contentToShow: any = null;
    let isContentTruncated = false;
    let rawResult = "";

    const taskResult = taskStatus?.result ?? taskStatus?.result_content;
    if (taskResult) {
      if (typeof taskResult === "string") {
        const { parsed, isComplete, raw } = extractAndParseJSON(taskResult);
        rawResult = raw;
        if (parsed) {
          contentToShow = parsed;
          isContentTruncated = !isComplete;
        } else {
          contentToShow = {
            _raw: raw,
            _parseError: true,
            _message: "JSON 解析失败",
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
            rawResult = raw;
            if (parsed) {
              contentToShow = parsed;
              isContentTruncated = !isComplete;
            } else {
              contentToShow = {
                _raw: raw,
                _parseError: true,
                _message: "JSON 解析失败",
              };
            }
          } else {
            contentToShow = chapterResponse.content;
          }
        } else {
          contentToShow = chapterResponse;
        }
      } catch (fetchErr) {
        console.error("Fetch chapter content error:", fetchErr);
      }
    }

    return { content: contentToShow, rawResult, isContentTruncated };
  }, []);

  const handlePreviewChapter = useCallback(
    async (chapter: CourseTreeChapterNode) => {
      setContentPreviewOpen(true);
      setContentPreviewLoading(true);
      setContentPreviewError(null);
      setContentPreviewData(null);
      setContentPreviewRaw("");
      setContentPreviewTruncated(false);

      const option = resolveChapterOptionById(chapter.id);
      setContentPreviewChapter({
        chapterId: chapter.id,
        title: option?.title || chapter.title || `?? #${chapter.id}`,
        courseTitle: option?.courseTitle,
        categoryPath: option?.categoryPath,
        subjectName: option?.subjectName,
      });

      try {
        const response = await contentGeneratorApi.getChapterContent(chapter.id);
        const source = response?.content ?? response;
        const payload =
          response && typeof response === "object" && !Array.isArray(response)
            ? { ...response }
            : { content: response };

        if (typeof source === "string") {
          const { parsed, isComplete, raw } = extractAndParseJSON(source);
          setContentPreviewRaw(raw);
          if (parsed) {
            payload.content = parsed;
            setContentPreviewTruncated(!isComplete);
          } else {
            payload.content = {
              _raw: raw,
              _parseError: true,
              _message: "JSON 解析失败",
            };
          }
          setContentPreviewData(payload);
        } else {
          payload.content = source;
          setContentPreviewData(payload);
          setContentPreviewRaw(JSON.stringify(source, null, 2));
        }
      } catch (error: any) {
        console.error("Fetch chapter content error:", error);
        setContentPreviewError(error?.message || "操作失败");
      } finally {
        setContentPreviewLoading(false);
      }
    },
    [resolveChapterOptionById]
  );

  const refreshTestTasks = useCallback(
    async (currentTasks: TestGenerationTask[]) => {
      const activeTasks = currentTasks.filter((task) =>
        ["pending", "processing", "generating"].includes(task.status)
      );
      if (!activeTasks.length) return;

      const updates = await Promise.all(
        activeTasks.map(async (task) => {
          const taskStatus = await contentGeneratorApi.getGenerationTask(task.taskId);
          if (!taskStatus) return null;
          const status = (taskStatus.status || taskStatus.task_status || task.status) as TaskStatus;
          const updates: Partial<TestGenerationTask> = {
            status,
            updatedAt: new Date().toISOString(),
            errorMessage: taskStatus.error_message || taskStatus.errorMessage,
          };

          if (status === "completed") {
            const resolved = await resolveTestTaskContent(taskStatus, task.chapterId);
            updates.result = resolved.content;
            updates.rawResult = resolved.rawResult || taskStatus.result;
            updates.isContentTruncated = resolved.isContentTruncated;
          }

          if (status === "failed") {
            updates.errorMessage = updates.errorMessage || "生成失败";
          }

          return { taskId: task.taskId, updates };
        })
      );

      const updateMap = new Map<number, Partial<TestGenerationTask>>();
      updates.filter(Boolean).forEach((item) => {
        if (item) updateMap.set(item.taskId, item.updates);
      });

      if (updateMap.size === 0) return;
      setTestTasks((prev) =>
        prev.map((task) => {
          const update = updateMap.get(task.taskId);
          return update ? { ...task, ...update } : task;
        })
      );
    },
    [resolveTestTaskContent]
  );

  useEffect(() => {
    if (!testTasks.some((task) => ["pending", "processing", "generating"].includes(task.status))) {
      return;
    }
    const timer = setInterval(() => {
      refreshTestTasks(testTasksRef.current);
    }, 3000);
    return () => clearInterval(timer);
  }, [refreshTestTasks, testTasks]);

  const updateCategoryInTree = useCallback(
    (categoryId: number, updater: (node: CourseTreeCategoryNode) => CourseTreeCategoryNode) => {
      setTree((prev) => {
        if (!prev) return prev;
        let changed = false;
        const subjects = prev.subjects.map((subject) => {
          const updatedCategories = updateCategoryNodeById(subject.categories ?? [], categoryId, updater);
          if (updatedCategories !== subject.categories) {
            changed = true;
            return { ...subject, categories: updatedCategories };
          }
          return subject;
        });
        return changed ? { ...prev, subjects } : prev;
      });
    },
    []
  );

  const updateCourseInTree = useCallback(
    (courseId: number, updater: (node: CourseTreeCourseNode) => CourseTreeCourseNode) => {
      setTree((prev) => {
        if (!prev) return prev;
        let changed = false;
        const subjects = prev.subjects.map((subject) => {
          const updatedCategories = updateCourseNodeById(subject.categories ?? [], courseId, updater);
          if (updatedCategories !== subject.categories) {
            changed = true;
            return { ...subject, categories: updatedCategories };
          }
          return subject;
        });
        return changed ? { ...prev, subjects } : prev;
      });
    },
    []
  );

  const findCategoryInTree = useCallback(
    (categoryId: number) => {
      if (!tree) return undefined;
      for (const subject of tree.subjects) {
        const found = findCategoryNodeById(subject.categories ?? [], categoryId);
        if (found) return found;
      }
      return undefined;
    },
    [tree]
  );

  const findCourseInTree = useCallback(
    (courseId: number) => {
      if (!tree) return undefined;
      for (const subject of tree.subjects) {
        const found = findCourseNodeById(subject.categories ?? [], courseId);
        if (found) return found;
      }
      return undefined;
    },
    [tree]
  );

  const loadCategoryChildren = useCallback(
    async (categoryId: number) => {
      if (loadingCategoryIds.has(categoryId)) return;
      setLoadingCategoryIds((prev) => {
        const next = new Set(prev);
        next.add(categoryId);
        return next;
      });
      try {
        const result = await contentGeneratorApi.getCourseTreeCategoryChildren(categoryId);
        updateCategoryInTree(categoryId, (node) => ({
          ...node,
          children: result.children,
          courses: result.courses,
          has_children: result.children.length > 0,
          has_courses: result.courses.length > 0,
        }));
      } catch (error) {
        console.error("Failed to load category children:", error);
        toast.error("加载分类失败");
      } finally {
        setLoadingCategoryIds((prev) => {
          const next = new Set(prev);
          next.delete(categoryId);
          return next;
        });
      }
    },
    [loadingCategoryIds, updateCategoryInTree]
  );

  const loadCourseChapters = useCallback(
    async (courseId: number) => {
      if (loadingCourseIds.has(courseId)) return;
      setLoadingCourseIds((prev) => {
        const next = new Set(prev);
        next.add(courseId);
        return next;
      });
      try {
        const result = await contentGeneratorApi.getCourseTreeCourseChapters(courseId);
        updateCourseInTree(courseId, (course) => ({
          ...course,
          chapters: result.chapters,
          pending_count: result.pending_count,
          chapter_count: result.chapter_count,
          has_chapters: result.chapter_count > 0,
        }));
      } catch (error) {
        console.error("Failed to load course chapters:", error);
        toast.error("加载课程章节失败");
      } finally {
        setLoadingCourseIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
      }
    },
    [loadingCourseIds, updateCourseInTree]
  );

  const handleToggleExpanded = useCallback(
    (id: string) => {
      const isExpanded = expandedIds.has(id);
      if (isExpanded) {
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return;
      }

      const [type, rawId] = id.split("-");
      const numericId = Number(rawId);
      if (!Number.isNaN(numericId)) {
        if (type === "cat") {
          const node = findCategoryInTree(numericId);
          const shouldLoad =
            node &&
            node.children === undefined &&
            node.courses === undefined &&
            ((node.has_children ?? false) || (node.has_courses ?? false));
          if (shouldLoad) {
            loadCategoryChildren(numericId);
          }
        }
        if (type === "course") {
          const course = findCourseInTree(numericId);
          const shouldLoad =
            course &&
            course.chapters === undefined &&
            ((course.chapter_count ?? 0) > 0 || course.has_chapters);
          if (shouldLoad) {
            loadCourseChapters(numericId);
          }
        }
      }

      setExpandedIds((prev) => new Set(prev).add(id));
    },
    [expandedIds, findCategoryInTree, findCourseInTree, loadCategoryChildren, loadCourseChapters]
  );

  const handleLoadMoreCategories = useCallback((subjectKey: string, total: number) => {
    setCategoryRenderCounts((prev) => {
      const current = prev[subjectKey] ?? Math.min(total, CATEGORY_RENDER_BATCH);
      const nextCount = Math.min(total, current + CATEGORY_RENDER_BATCH);
      if (nextCount === current) return prev;
      return { ...prev, [subjectKey]: nextCount };
    });
  }, []);

  const handleGenerateChapter = async (chapterId: number) => {
    setGeneratingChapters((prev) => new Set(prev).add(chapterId));
    try {
      const result = await contentGeneratorApi.generateChapterLesson({
        chapter_id: chapterId,
        subject: filterSubject !== "all" ? filterSubject : undefined,
        auto_import: autoImport,
        auto_approve: autoApprove,
      });
      
      // 添加任务到列表并切换到生成中 Tab
      if (result.task) {
        const option = resolveChapterOptionById(chapterId);
        const taskKey = getTaskKey(result.task);
        addGenerationTask({
          id: result.task.id,
          taskKey,
          taskSource: result.task.task_source,
          taskType: "chapter",
          targetId: chapterId,
          targetName: option?.title || `章节 #${chapterId}`,
          courseName: option?.courseTitle,
          categoryPath: option?.categoryPath,
          subjectName: option?.subjectName,
          status: result.task.status,
          createdAt: result.task.created_at,
        });
        setMainTab("generating");
      }
      
      toast.success("生成任务已创建");
      onTaskCreated?.();
      fetchGenerationTasks();
    } catch (error: any) {
      toast.error(error?.message || "操作失败");
    } finally {
      setGeneratingChapters((prev) => {
        const next = new Set(prev);
        next.delete(chapterId);
        return next;
      });
    }
  };

  const handleGenerateCourse = async (courseId: number) => {
    setGeneratingCourses((prev) => new Set(prev).add(courseId));
    try {
      const result = await contentGeneratorApi.generateCourseLessons({
        course_id: courseId,
        subject: filterSubject !== "all" ? filterSubject : undefined,
        auto_import: autoImport,
        auto_approve: autoApprove,
        skip_existing: skipExisting,
      });
      
      if (result.created_tasks > 0) {
        setMainTab("generating");
        toast.success(`已创建 ${result.created_tasks} 个生成任务`);
      } else {
        toast.info("没有需要生成的章节");
      }
      
      onTaskCreated?.();
      fetchGenerationTasks();
    } catch (error: any) {
      toast.error(error?.message || "操作失败");
    } finally {
      setGeneratingCourses((prev) => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    }
  };

  const handleGenerateCategory = async (categoryId: number) => {
    setGeneratingCategories((prev) => new Set(prev).add(categoryId));
    try {
      const result = await contentGeneratorApi.generateCategoryLessons({
        category_id: categoryId,
        subject: filterSubject !== "all" ? filterSubject : undefined,
        auto_import: autoImport,
        auto_approve: autoApprove,
        skip_existing: skipExisting,
        include_sub_categories: true,
      });
      
      if (result.created_tasks > 0) {
        setMainTab("generating");
        toast.success(`已创建 ${result.created_tasks} 个生成任务`);
      } else {
        toast.info("没有需要生成的章节");
      }
      
      onTaskCreated?.();
      fetchGenerationTasks();
    } catch (error: any) {
      toast.error(error?.message || "操作失败");
    } finally {
      setGeneratingCategories((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
  };

  const handleDeleteChapterContent = async (chapterId: number) => {
    setDeletingChapters((prev) => new Set(prev).add(chapterId));
    try {
      await contentGeneratorApi.deleteChapterContent(chapterId);
      toast.success("章节内容已删除");
      fetchTree();
    } catch (error: any) {
      toast.error(error?.message || "删除失败");
    } finally {
      setDeletingChapters((prev) => {
        const next = new Set(prev);
        next.delete(chapterId);
        return next;
      });
    }
  };

  const handleClearAllChapterContents = async () => {
    setClearingAll(true);
    try {
      const result = await contentGeneratorApi.clearAllChapterContents();
      toast.success(`${result.message}，共清空 ${result.affected} 个章节`);
      setClearAllDialogOpen(false);
      fetchTree();
    } catch (error: any) {
      toast.error(error?.message || "清空失败");
    } finally {
      setClearingAll(false);
    }
  };

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    try {
      const fullTree = await contentGeneratorApi.getCourseTree();
      const targetSubjects = filterSubject === "all"
        ? fullTree.subjects
        : fullTree.subjects.filter((s) => s.subject === filterSubject);
      const chapterIds = targetSubjects.flatMap((subject) =>
        collectChapterIds(subject.categories ?? [], skipExisting)
      );
      if (chapterIds.length === 0) {
        toast.info(skipExisting ? "没有需要生成的章节（已跳过已有内容）" : "没有需要生成的章节");
        return;
      }
      const result = await contentGeneratorApi.batchGenerateChapterLessons({
        chapter_ids: chapterIds,
        subject: filterSubject !== "all" ? filterSubject : undefined,
        auto_import: autoImport,
        auto_approve: autoApprove,
      });
      
      if (result.created_tasks > 0) {
        setMainTab("generating");
        toast.success(`已创建 ${result.created_tasks} 个生成任务`);
      } else {
        toast.info("没有需要生成的章节");
      }
      
      onTaskCreated?.();
      fetchGenerationTasks();
    } catch (error: any) {
      toast.error(error?.message || "操作失败");
    } finally {
      setGeneratingAll(false);
    }
  };

  useEffect(() => {
    if (promptPreviewOpen && !promptVars.title && chapterOptions.length > 0) {
      const defaultOption = chapterOptions[0];
      setPreviewChapterId(defaultOption.id.toString());
      setPromptVars(buildPromptVarsFromChapter(defaultOption));
    }
  }, [promptPreviewOpen, promptVars.title, chapterOptions, buildPromptVarsFromChapter]);

  useEffect(() => {
    if (testDialogOpen && !testChapterId && chapterOptions.length > 0) {
      const defaultOption = chapterOptions[0];
      setTestChapterId(defaultOption.id.toString());
    }
  }, [testDialogOpen, testChapterId, chapterOptions]);

  const handleTestGenerate = async () => {
    if (!testChapterId) {
      toast.error("请选择要生成的章节");
      return;
    }
    const chapterId = Number(testChapterId);
    const option = resolveChapterOptionById(chapterId);
    setTestGenerating(true);

    try {
      const payload = {
        chapter_id: chapterId,
        chapter_title: option?.title,
        subject: testSubjectOverride === "auto" ? option?.subject : testSubjectOverride,
        auto_import: false,
        auto_approve: false,
        ...(testUseCustomPrompt
          ? {
              system_prompt: testSystemPrompt,
              user_prompt_template: testUserPromptTemplate,
            }
          : {}),
      };

      const result = await contentGeneratorApi.generateChapterLesson(payload);
      const task = result.task;

      const newTask: TestGenerationTask = {
        taskId: task.id,
        chapterId,
        chapterTitle: option?.title || `?? #${chapterId}`,
        subject: payload.subject,
        status: task.status as TaskStatus,
        createdAt: task.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTestTasks((prev) => [newTask, ...prev]);
      toast.success("测试任务已创建");
      refreshTestTasks([...testTasksRef.current, newTask]);
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    } finally {
      setTestGenerating(false);
    }
  };

  const selectedTestTask = useMemo(() => {
    if (!selectedTestTaskId) return null;
    return testTasks.find((task) => task.taskId === selectedTestTaskId) || null;
  }, [selectedTestTaskId, testTasks]);

  return (
    <div className="h-full flex gap-4 p-4">
      <div className="w-[360px] flex-shrink-0 h-full">
        <ScrollArea className="h-full pr-2">
          <div className="flex flex-col gap-4 pb-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  教学内容生成
                </CardTitle>
                <CardDescription className="text-xs">
                  为章节生成教学内容
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">筛选科目</Label>
                  <Select value={filterSubject} onValueChange={(v) => setFilterSubject(v as SubjectFilter)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部科目</SelectItem>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-2">
                            <span>{s.icon}</span>
                            <span>{s.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">分类数</p>
                    <p className="text-lg font-semibold">{summary.categories}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">课程数</p>
                    <p className="text-lg font-semibold">{summary.courses}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">章节数</p>
                    <p className="text-lg font-semibold">{summary.chapters}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">待生成</p>
                    <p className="text-lg font-semibold text-amber-600">{summary.pending}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label className="text-xs">跳过已有内容</Label>
                      <p className="text-[11px] text-muted-foreground">不重新生成已有内容的章节</p>
                    </div>
                    <Switch checked={skipExisting} onCheckedChange={setSkipExisting} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label className="text-xs">自动导入</Label>
                      <p className="text-[11px] text-muted-foreground">生成后自动导入</p>
                    </div>
                    <Switch checked={autoImport} onCheckedChange={setAutoImport} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label className="text-xs">自动审核</Label>
                      <p className="text-[11px] text-muted-foreground">生成后自动审核</p>
                    </div>
                    <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerateAll}
                  disabled={generatingAll || loadingTree}
                >
                  {generatingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  批量生成
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-amber-500" />
                  测试与预览
                </CardTitle>
                <CardDescription className="text-xs">
                  预览 Prompt 和配置测试生成
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => setPromptPreviewOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  预览 Prompt
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setTestDialogOpen(true)}>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  测试生成
                </Button>
                <div className="text-xs text-muted-foreground">
                  选择章节进行测试，或预览生成的 Prompt
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  危险操作
                </CardTitle>
                <CardDescription className="text-xs">
                  清空已生成的课堂数据
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setClearAllDialogOpen(true)}
                  disabled={clearingAll || loadingTree}
                >
                  {clearingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  清空所有课堂数据
                </Button>
                <p className="text-[11px] text-muted-foreground mt-2">
                  此操作将删除所有章节的生成内容，章节结构保留
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      <Card className="flex-1 min-w-0 flex flex-col overflow-hidden border-0 shadow-lg bg-gradient-to-b from-background to-muted/5">
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTabValue)} className="flex-1 flex flex-col">
          {/* Tab Header with Stats Bar */}
          <div className="flex-shrink-0 border-b bg-muted/30">
            {/* Stats Summary Bar */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-border/50">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  <span className="text-muted-foreground">生成中</span>
                  <span className="font-semibold text-violet-600">{taskStats.generating}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">已完成</span>
                  <span className="font-semibold text-emerald-600">{taskStats.completed}</span>
                </div>
                {taskStats.failed > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">失败</span>
                    <span className="font-semibold text-red-500">{taskStats.failed}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                共 {taskStats.total} 个任务
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 py-2 flex items-center justify-between">
              <TabsList className="h-8 p-0.5 bg-muted/60 rounded-lg">
                <TabsTrigger 
                  value="tree" 
                  className="h-7 px-3 text-xs gap-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <FolderTree className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">课程内容树</span>
                  <span className="sm:hidden">内容树</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="generating" 
                  className="h-7 px-3 text-xs gap-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <Activity className="h-3.5 w-3.5" />
                  生成中
                  {taskStats.generating > 0 && (
                    <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-medium bg-violet-500 text-white">
                      {taskStats.generating}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="h-7 px-3 text-xs gap-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <ListChecks className="h-3.5 w-3.5" />
                  已完成
                  {taskStats.completed > 0 && (
                    <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-medium bg-emerald-500 text-white">
                      {taskStats.completed > 99 ? "99+" : taskStats.completed}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-1.5">
                {mainTab === "tree" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExpandAll}
                      disabled={loadingTree || !tree}
                      title="展开全部"
                      className="h-7 w-7 p-0 hover:bg-muted"
                    >
                      <ChevronsUpDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCollapseAll}
                      disabled={loadingTree || expandedIds.size === 0}
                      title="收缩全部"
                      className="h-7 w-7 p-0 hover:bg-muted"
                    >
                      <ChevronsDownUp className="h-3.5 w-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={fetchTree} 
                      disabled={loadingTree} 
                      className="h-7 px-2 hover:bg-muted"
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", loadingTree && "animate-spin")} />
                    </Button>
                  </>
                )}
                {(mainTab === "generating" || mainTab === "completed") && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchGenerationTasks} 
                    disabled={loadingTasks} 
                    className="h-7 px-2 hover:bg-muted"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", loadingTasks && "animate-spin")} />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <CardContent className="flex-1 overflow-hidden p-0 relative">
            {/* 课程内容树 Tab */}
            <TabsContent value="tree" className="absolute inset-0 m-0 data-[state=inactive]:hidden">
              <ScrollArea className="h-full w-full">
                <div className="px-4 py-3 space-y-4">
                  {loadingTree && (
                    <div className="flex flex-col items-center gap-3 py-16">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-primary/20" />
                        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                      <p className="text-sm text-muted-foreground">正在加载课程树...</p>
                    </div>
                  )}
                  {!loadingTree && subjectsToShow.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-16">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <FolderTree className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">暂无课程数据</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">请先创建课程和章节</p>
                      </div>
                    </div>
                  )}
                  {!loadingTree &&
                    subjectsToShow.map((subject) => {
                      const stats = subject.summary ?? EMPTY_SUMMARY;
                      const totalCategories = subject.categories?.length ?? 0;
                      const fallbackCount = Math.min(totalCategories, CATEGORY_RENDER_BATCH);
                      const configuredCount = categoryRenderCounts[subject.subject];
                      const visibleCount = Math.min(
                        typeof configuredCount === "number" ? configuredCount : fallbackCount,
                        totalCategories
                      );
                      const visibleCategories = (subject.categories ?? []).slice(0, visibleCount);
                      const remainingCount = totalCategories - visibleCount;
                      return (
                        <div key={subject.subject} className="space-y-2">
                          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gradient-to-r from-muted/50 to-transparent">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{subject.name}</span>
                              {stats.pending > 0 && (
                                <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  待生成 {stats.pending}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span>{stats.categories} 分类</span>
                              <span className="text-muted-foreground/30">•</span>
                              <span>{stats.courses} 课程</span>
                              <span className="text-muted-foreground/30">•</span>
                              <span>{stats.chapters} 章节</span>
                            </div>
                          </div>
                          <div className="pl-1">
                            {visibleCategories.map((category) => (
                              <CategoryNode
                                key={category.id}
                                node={category}
                                expandedIds={expandedIds}
                                onToggle={handleToggleExpanded}
                                onGenerateCategory={handleGenerateCategory}
                                onGenerateCourse={handleGenerateCourse}
                                onGenerateChapter={handleGenerateChapter}
                                onPreviewChapter={handlePreviewChapter}
                                onDeleteChapter={handleDeleteChapterContent}
                                generatingCategories={generatingCategories}
                                generatingCourse={generatingCourses}
                                generatingChapters={generatingChapters}
                                deletingChapters={deletingChapters}
                                loadingCategories={loadingCategoryIds}
                                loadingCourses={loadingCourseIds}
                                skipExisting={skipExisting}
                              />
                            ))}
                            {remainingCount > 0 && (
                              <div className="flex items-center justify-center pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLoadMoreCategories(subject.subject, totalCategories)}
                                  className="h-7 text-xs text-muted-foreground"
                                >
                                  加载更多分类（剩余 {remainingCount}）
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 生成中任务 Tab */}
            <TabsContent value="generating" className="absolute inset-0 m-0 flex flex-col data-[state=inactive]:hidden">
              {/* Search Bar */}
              <div className="px-4 py-2.5 border-b bg-muted/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    placeholder="搜索任务名称..."
                    value={taskSearchKeyword}
                    onChange={(e) => setTaskSearchKeyword(e.target.value)}
                    className="h-9 text-sm pl-9 bg-background/80 border-muted-foreground/20 focus:border-primary/50"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {loadingTasks && (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    <p className="text-sm text-muted-foreground">加载任务列表...</p>
                  </div>
                )}
                {!loadingTasks && generatingTasksList.length === 0 && (
                  <div className="flex flex-col items-center gap-4 py-16">
                    <div className="w-20 h-20 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                      <Activity className="h-10 w-10 text-violet-300 dark:text-violet-700" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">暂无正在生成的任务</p>
                      <p className="text-xs text-muted-foreground/70">在课程内容树中点击"生成"按钮开始</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setMainTab("tree")}
                      className="mt-2"
                    >
                      <FolderTree className="h-3.5 w-3.5 mr-1.5" />
                      前往课程树
                    </Button>
                  </div>
                )}
                {!loadingTasks && generatingTasksList.length > 0 && (
                  <div className="divide-y divide-border/50">
                    {generatingTasksList.map((task, index) => (
                      <div 
                        key={task.taskKey} 
                        className="px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {task.status === "pending" ? (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-gray-400" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 text-violet-600 dark:text-violet-400 animate-spin" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground truncate">
                                {task.targetName}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] h-5 border-0",
                                  task.status === "pending" 
                                    ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" 
                                    : "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                                )}
                              >
                                {task.status === "pending" ? "等待中" : "生成中"}
                              </Badge>
                            </div>
                            {task.courseName && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {task.courseName}
                              </p>
                            )}
                            
                            {/* Progress Bar */}
                            <div className="mt-2 flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    task.status === "pending" 
                                      ? "bg-gray-300 dark:bg-gray-600" 
                                      : "bg-gradient-to-r from-violet-500 to-purple-500"
                                  )}
                                  style={{ width: task.progress !== undefined ? `${task.progress}%` : (task.status === "pending" ? "0%" : "30%") }}
                                />
                              </div>
                              <span className="text-[11px] text-muted-foreground tabular-nums">
                                {task.progress !== undefined ? `${task.progress}%` : (task.status === "pending" ? "等待" : "处理中")}
                              </span>
                            </div>
                          </div>
                          
                          {/* Time */}
                          <div className="flex-shrink-0 text-right">
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(task.createdAt).toLocaleTimeString("zh-CN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {generatingTasksList.length > 0 && (
                <div className="flex-shrink-0 px-4 py-2 border-t bg-muted/20 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {generatingTasksList.length} 个任务正在处理
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-violet-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    <span>自动刷新中</span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 已完成任务 Tab */}
            <TabsContent value="completed" className="absolute inset-0 m-0 flex flex-col data-[state=inactive]:hidden">
              {/* Search Bar */}
              <div className="px-4 py-2.5 border-b bg-muted/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    placeholder="搜索任务名称..."
                    value={taskSearchKeyword}
                    onChange={(e) => setTaskSearchKeyword(e.target.value)}
                    className="h-9 text-sm pl-9 bg-background/80 border-muted-foreground/20 focus:border-primary/50"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {loadingTasks && (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <p className="text-sm text-muted-foreground">加载任务列表...</p>
                  </div>
                )}
                {!loadingTasks && completedTasksList.length === 0 && (
                  <div className="flex flex-col items-center gap-4 py-16">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                      <ListChecks className="h-10 w-10 text-emerald-300 dark:text-emerald-700" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">暂无已完成的任务</p>
                      <p className="text-xs text-muted-foreground/70">完成的任务将在这里显示</p>
                    </div>
                  </div>
                )}
                {!loadingTasks && completedTasksList.length > 0 && (
                  <div className="divide-y divide-border/50">
                    {completedTasksList.map((task) => (
                      <div 
                        key={task.taskKey} 
                        className={cn(
                          "px-4 py-3 transition-colors",
                          task.status === "completed" 
                            ? "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20" 
                            : "hover:bg-red-50/50 dark:hover:bg-red-950/20"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {task.status === "completed" ? (
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-sm font-medium truncate",
                                task.status === "completed" ? "text-foreground" : "text-red-700 dark:text-red-300"
                              )}>
                                {task.targetName}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] h-5 border-0",
                                  task.status === "completed" 
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" 
                                    : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                                )}
                              >
                                {task.status === "completed" ? "成功" : "失败"}
                              </Badge>
                            </div>
                            {task.message && (
                              <p className={cn(
                                "text-xs mt-0.5 truncate",
                                task.status === "failed" ? "text-red-500" : "text-muted-foreground"
                              )}>
                                {task.message}
                              </p>
                            )}
                          </div>
                          
                          {/* Time */}
                          <div className="flex-shrink-0 text-right">
                            <span className="text-[11px] text-muted-foreground">
                              {task.completedAt ? new Date(task.completedAt).toLocaleTimeString("zh-CN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer Stats */}
              {completedTasksList.length > 0 && (
                <div className="flex-shrink-0 px-4 py-2.5 border-t bg-muted/20 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    显示 {completedTasksList.length} 个任务
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {taskStats.completed > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-600 font-medium">{taskStats.completed} 成功</span>
                      </div>
                    )}
                    {taskStats.failed > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-red-500 font-medium">{taskStats.failed} 失败</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Prompt Preview Dialog */}
      <Dialog open={promptPreviewOpen} onOpenChange={setPromptPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>教学内容 Prompt 预览</DialogTitle>
            <DialogDescription>预览完整 Prompt 和变量 Prompt 配置</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="vars" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vars">变量</TabsTrigger>
              <TabsTrigger value="system">System Prompt</TabsTrigger>
              <TabsTrigger value="user">User Prompt</TabsTrigger>
            </TabsList>
            <TabsContent value="vars" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>选择章节</Label>
                <Select value={previewChapterId} onValueChange={handlePreviewChapterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择要预览的章节" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingChapterOptions && (
                      <SelectItem value="loading" disabled>
                        正在加载章节...
                      </SelectItem>
                    )}
                    {!loadingChapterOptions && chapterOptions.length === 0 && (
                      <SelectItem value="empty" disabled>
                        暂无可选章节
                      </SelectItem>
                    )}
                    {chapterOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>章节标题</Label>
                  <Input
                    value={promptVars.title}
                    onChange={(e) => setPromptVars((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="章节标题"
                  />
                </div>
                <div className="space-y-2">
                  <Label>课程名称</Label>
                  <Input
                    value={promptVars.section || ""}
                    onChange={(e) => setPromptVars((prev) => ({ ...prev, section: e.target.value }))}
                    placeholder="课程名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label>分类路径</Label>
                  <Input
                    value={promptVars.subsection || ""}
                    onChange={(e) => setPromptVars((prev) => ({ ...prev, subsection: e.target.value }))}
                    placeholder="分类路径"
                  />
                </div>
                <div className="space-y-2">
                  <Label>父级名称</Label>
                  <Input
                    value={promptVars.parent || ""}
                    onChange={(e) => setPromptVars((prev) => ({ ...prev, parent: e.target.value }))}
                    placeholder="父级名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label>科目</Label>
                  <Select
                    value={promptVars.subject}
                    onValueChange={(v) =>
                      setPromptVars((prev) => ({ ...prev, subject: v as Subject }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>特殊要求</Label>
                  <Textarea
                    value={promptVars.special_requirements || ""}
                    onChange={(e) =>
                      setPromptVars((prev) => ({ ...prev, special_requirements: e.target.value }))
                    }
                    placeholder="输入特殊要求（可选）"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="system" className="mt-4 flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>System Prompt</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(getSystemPrompt(), "System Prompt")}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  ??
                </Button>
              </div>
              <ScrollArea className="flex-1 border rounded-md">
                <Textarea
                  className="min-h-[320px] border-0 rounded-none text-xs font-mono"
                  value={getSystemPrompt()}
                  readOnly
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="user" className="mt-4 flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>User Prompt</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(buildUserPrompt(promptVars), "User Prompt")}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  ??
                </Button>
              </div>
              <ScrollArea className="flex-1 border rounded-md">
                <Textarea
                  className="min-h-[320px] border-0 rounded-none text-xs font-mono"
                  value={buildUserPrompt(promptVars)}
                  readOnly
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromptPreviewOpen(false)}>
              ??
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Generation Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>测试内容生成</DialogTitle>
            <DialogDescription>
              选择一个章节进行测试，或点击预览按钮查看 Prompt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>选择章节</Label>
                <Select value={testChapterId} onValueChange={handleTestChapterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择测试章节" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingChapterOptions && (
                      <SelectItem value="loading" disabled>
                        正在加载章节...
                      </SelectItem>
                    )}
                    {!loadingChapterOptions && chapterOptions.length === 0 && (
                      <SelectItem value="empty" disabled>
                        暂无可选章节
                      </SelectItem>
                    )}
                    {chapterOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>覆盖科目设置</Label>
                <Select
                  value={testSubjectOverride}
                  onValueChange={(v) => setTestSubjectOverride(v as Subject | "auto")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择科目" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自动检测</SelectItem>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>使用自定义 Prompt</Label>
                <p className="text-xs text-muted-foreground">手动编辑生成使用的提示词</p>
              </div>
              <Switch checked={testUseCustomPrompt} onCheckedChange={setTestUseCustomPrompt} />
            </div>

            {testUseCustomPrompt && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>System Prompt</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestSystemPrompt(getSystemPrompt())}
                  >
                    重置默认
                  </Button>
                </div>
                <Textarea
                  value={testSystemPrompt}
                  onChange={(e) => setTestSystemPrompt(e.target.value)}
                  rows={6}
                  className="text-xs font-mono"
                />

                <div className="flex items-center justify-between">
                  <Label>User Prompt 模板</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestUserPromptTemplate(getUserPromptTemplate())}
                  >
                    重置默认
                  </Button>
                </div>
                <Textarea
                  value={testUserPromptTemplate}
                  onChange={(e) => setTestUserPromptTemplate(e.target.value)}
                  rows={8}
                  className="text-xs font-mono"
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>测试任务记录</Label>
              <Button variant="ghost" size="sm" onClick={() => setTestTasks([])}>
                清空任务
              </Button>
            </div>
            <ScrollArea className="max-h-[220px] border rounded-md p-2">
              {testTasks.length === 0 && (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  暂无测试任务
                </div>
              )}
              <div className="space-y-2">
                {testTasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{task.chapterTitle}</div>
                      <div className="text-xs text-muted-foreground">
                        ?? #{task.taskId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TaskStatusBadge status={task.status} />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={task.status !== "completed"}
                        onClick={() => {
                          setSelectedTestTaskId(task.taskId);
                          setTestResultOpen(true);
                        }}
                      >
                        ??
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              关闭
            </Button>
            <Button onClick={handleTestGenerate} disabled={testGenerating}>
              {testGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              开始测试生成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Result Dialog */}
      <Dialog open={testResultOpen} onOpenChange={setTestResultOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-amber-500" />
              测试生成结果
            </DialogTitle>
            <DialogDescription>
              {selectedTestTask ? (
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{selectedTestTask.chapterTitle}</span>
                  <span className="text-muted-foreground">-</span>
                  <span>任务 #{selectedTestTask.taskId}</span>
                  {selectedTestTask.subject && (
                    <>
                      <span className="text-muted-foreground">�</span>
                      <span>{selectedTestTask.subject}</span>
                    </>
                  )}
                </span>
              ) : (
                "暂无数据"
              )}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="structured" className="flex-1 overflow-hidden flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="structured">结构化预览</TabsTrigger>
              <TabsTrigger value="raw">原始内容</TabsTrigger>
            </TabsList>
            <TabsContent value="structured" className="mt-4 flex-1 flex flex-col gap-2 min-h-0 overflow-hidden data-[state=inactive]:hidden">
              {selectedTestTask?.isContentTruncated && (
                <div className="text-xs text-amber-600 flex items-center gap-1 flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  内容可能被截断，请查看原始内容
                </div>
              )}
              <div className="flex-1 min-h-0 border rounded-lg bg-muted/20 overflow-y-auto">
                <div className="p-4">
                  <LessonContentPreview content={selectedTestTask?.result} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="raw" className="mt-4 flex-1 flex flex-col gap-2 min-h-0 overflow-hidden data-[state=inactive]:hidden">
              <div className="flex-1 min-h-0 border rounded-lg bg-slate-50 dark:bg-slate-900 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap break-words p-4 font-mono">
                  {selectedTestTask?.rawResult || "暂无原始内容"}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setTestResultOpen(false)}>
              关闭
            </Button>
            {selectedTestTask?.rawResult && (
              <Button onClick={() => handleCopy(selectedTestTask.rawResult || "", "原始内容")}>
                复制原始内容
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Preview Dialog */}
      <Dialog open={contentPreviewOpen} onOpenChange={setContentPreviewOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              章节内容预览
            </DialogTitle>
            <DialogDescription>
              {contentPreviewChapter ? (
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{contentPreviewChapter.title}</span>
                  {contentPreviewChapter.courseTitle && (
                    <>
                      <span className="text-muted-foreground">-</span>
                      <span>{contentPreviewChapter.courseTitle}</span>
                    </>
                  )}
                  {contentPreviewChapter.subjectName && (
                    <>
                      <span className="text-muted-foreground">-</span>
                      <span>{contentPreviewChapter.subjectName}</span>
                    </>
                  )}
                </span>
              ) : (
                "正在加载..."
              )}
            </DialogDescription>
          </DialogHeader>

          {contentPreviewLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm">正在加载内容...</span>
              </div>
            </div>
          )}

          {!contentPreviewLoading && contentPreviewError && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-red-500">
                <XCircle className="h-8 w-8" />
                <span className="text-sm">{contentPreviewError}</span>
              </div>
            </div>
          )}

          {!contentPreviewLoading && !contentPreviewError && (
            <Tabs defaultValue="structured" className="flex-1 overflow-hidden flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="structured">结构化预览</TabsTrigger>
                <TabsTrigger value="raw">原始内容</TabsTrigger>
              </TabsList>
              <TabsContent value="structured" className="mt-4 flex-1 flex flex-col gap-2 min-h-0 overflow-auto">
                {contentPreviewTruncated && (
                  <div className="text-xs text-amber-600 flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    内容可能被截断，请查看原始内容
                  </div>
                )}
                <div className="flex-1 border rounded-lg bg-muted/20 overflow-auto">
                  <div className="p-4">
                    <LessonContentPreview content={contentPreviewData} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="raw" className="mt-4 flex-1 flex flex-col gap-2 min-h-0 overflow-auto">
                <div className="flex-1 border rounded-lg bg-slate-50 dark:bg-slate-900 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap break-words p-4 font-mono">
                    {contentPreviewRaw || "暂无原始内容"}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setContentPreviewOpen(false)}>
              关闭
            </Button>
            {contentPreviewRaw && (
              <Button onClick={() => handleCopy(contentPreviewRaw, "原始内容")}>
                复制原始内容
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              确认清空所有课堂数据
            </DialogTitle>
            <DialogDescription>
              此操作将删除所有章节的 AI 生成内容（包括课堂教学内容和模块数据），但会保留章节结构。删除后可以重新生成。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive font-medium mb-2">⚠️ 警告</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 所有已生成的课堂内容将被永久删除</li>
                <li>• 此操作不可撤销</li>
                <li>• 章节结构将保留，可重新生成内容</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearAllDialogOpen(false)}
              disabled={clearingAll}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAllChapterContents}
              disabled={clearingAll}
            >
              {clearingAll && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              确认清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
