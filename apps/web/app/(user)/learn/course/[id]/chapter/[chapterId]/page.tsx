"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  FileText,
  Lock,
  Loader2,
  AlertCircle,
  Video,
  Headphones,
  PlayCircle,
  BookOpen,
  Menu,
  X,
  CheckCircle,
  Home,
} from "lucide-react";
import { useCourse, useChapter, useMyLearning, formatDuration } from "@/hooks/useCourse";
import { CourseChapter, CourseDetail } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";
import { LessonContent } from "@/components/learning/LessonContentRenderer";
import { LessonContentSkeleton } from "@/components/learning/LessonContentSkeleton";
import { StepBasedRenderer } from "@/components/learning/InteractiveClassroom/StepBasedRenderer";
import { cn } from "@/lib/utils";

// =====================================================
// 图标组件
// =====================================================

function getContentTypeIcon(contentType: string, className?: string) {
  switch (contentType) {
    case "video":
      return <Video className={className} />;
    case "audio":
      return <Headphones className={className} />;
    case "document":
      return <FileText className={className} />;
    default:
      return <PlayCircle className={className} />;
  }
}

// =====================================================
// 左侧课程章节导航
// =====================================================

interface ChapterSidebarProps {
  course: CourseDetail;
  currentChapterId: number;
  isVIP: boolean;
  isOpen: boolean;
  onClose: () => void;
}

function ChapterSidebar({ course, currentChapterId, isVIP, isOpen, onClose }: ChapterSidebarProps) {
  const router = useRouter();

  // 统计章节数量
  const chapterCount = useMemo(() => {
    let count = 0;
    const traverse = (items: CourseChapter[]) => {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        } else {
          count++;
        }
      }
    };
    if (course.chapters) traverse(course.chapters);
    return count;
  }, [course.chapters]);

  // 检查章节是否可访问
  const canAccess = (chapter: CourseChapter) => {
    return course.is_free || chapter.is_free_preview || isVIP;
  };

  // 处理章节点击
  const handleChapterClick = (chapter: CourseChapter) => {
    if (!canAccess(chapter)) {
      toast.error("请开通VIP后观看此章节");
      return;
    }
    router.push(`/learn/course/${course.id}/chapter/${chapter.id}`);
    onClose();
  };

  // 章节树节点
  const ChapterNode = ({ chapter, level = 0 }: { chapter: CourseChapter; level?: number }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = chapter.children && chapter.children.length > 0;
    const isCurrent = chapter.id === currentChapterId;
    const accessible = canAccess(chapter);

    return (
      <div>
        {hasChildren ? (
          // 父级章节（可展开）
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-stone-50 rounded-lg transition-colors"
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </motion.div>
            <span className="font-medium text-stone-700 text-sm truncate">{chapter.title}</span>
            <span className="ml-auto text-xs text-stone-400">{chapter.children!.length}</span>
          </button>
        ) : (
          // 叶子节点（可点击学习）
          <button
            onClick={() => handleChapterClick(chapter)}
            disabled={!accessible}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
              isCurrent
                ? "bg-amber-50 border-l-3 border-amber-500"
                : accessible
                  ? "hover:bg-stone-50"
                  : "opacity-50 cursor-not-allowed"
            )}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                isCurrent
                  ? "bg-amber-500 text-white"
                  : accessible
                    ? "bg-stone-100 text-stone-500"
                    : "bg-stone-100 text-stone-400"
              )}
            >
              {accessible ? (
                getContentTypeIcon(chapter.content_type, "w-3.5 h-3.5")
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm truncate",
                  isCurrent
                    ? "font-medium text-amber-800"
                    : accessible
                      ? "text-stone-700"
                      : "text-stone-400"
                )}
              >
                {chapter.title}
              </p>
              {chapter.duration_minutes > 0 && (
                <p className="text-xs text-stone-400 mt-0.5">
                  {formatDuration(chapter.duration_minutes)}
                </p>
              )}
            </div>
            {chapter.is_free_preview && !course.is_free && (
              <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded">
                试看
              </span>
            )}
          </button>
        )}

        {/* 子章节 */}
        <AnimatePresence>
          {hasChildren && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {chapter.children!.map((child) => (
                <ChapterNode key={child.id} chapter={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const sidebarContent = (
    <>
      {/* 头部 */}
      <div className="p-4 border-b border-stone-200 bg-gradient-to-br from-stone-50 to-white">
        <Link
          href={`/learn/course/${course.id}`}
          className="flex items-center gap-2 text-stone-600 hover:text-amber-600 transition-colors mb-3 group"
        >
          <div className="p-1.5 rounded-lg bg-stone-100 group-hover:bg-amber-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">返回课程</span>
        </Link>
        <h2 className="font-bold text-stone-800 line-clamp-2 leading-snug">{course.title}</h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {chapterCount} 节课
          </span>
          {course.study_progress > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              已学 {Math.round(course.study_progress)}%
            </span>
          )}
        </div>
      </div>

      {/* 章节列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {course.chapters?.map((chapter) => (
          <ChapterNode key={chapter.id} chapter={chapter} />
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* 桌面端侧边栏 - 固定高度，不随页面滚动 */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col bg-white border-r border-stone-200 h-screen fixed left-0 top-0 z-20">
        {sidebarContent}
      </aside>
      {/* 占位元素，防止内容被侧边栏遮挡 */}
      <div className="hidden lg:block w-72 flex-shrink-0" />

      {/* 移动端抽屉 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-lg z-10"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// =====================================================
// 主页面
// =====================================================

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const chapterId = Number(params.chapterId);

  const { isAuthenticated, user } = useAuthStore();
  const { loading: courseLoading, course, fetchCourse } = useCourse();
  const {
    loading: chapterLoading,
    chapter,
    fullContent,
    contentLoading,
    parsedLessonContent,
    fetchChapter,
    fetchChapterFullContent,
  } = useChapter();
  const { updateProgress } = useMyLearning();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 加载数据
  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId, fetchCourse]);

  useEffect(() => {
    if (chapterId) {
      fetchChapter(chapterId);
      fetchChapterFullContent(chapterId);
    }
  }, [chapterId, fetchChapter, fetchChapterFullContent]);

  // VIP状态
  const isVIP = user?.is_vip || false;

  // 获取扁平化的章节列表
  const flatChapters = useMemo(() => {
    if (!course?.chapters) return [];
    const result: CourseChapter[] = [];
    const traverse = (items: CourseChapter[]) => {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        } else {
          result.push(item);
        }
      }
    };
    traverse(course.chapters);
    return result;
  }, [course?.chapters]);

  const currentIndex = flatChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? flatChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < flatChapters.length - 1 ? flatChapters[currentIndex + 1] : null;

  // 检查章节访问权限
  const canAccessChapter = useCallback(
    (ch: CourseChapter) => {
      return course?.is_free || ch.is_free_preview || isVIP;
    },
    [course?.is_free, isVIP]
  );

  // 处理章节导航
  const handleNavigate = useCallback(
    (ch: CourseChapter | null) => {
      if (!ch) return;
      if (!canAccessChapter(ch)) {
        toast.error("请开通VIP后观看此章节");
        return;
      }
      router.push(`/learn/course/${courseId}/chapter/${ch.id}`);
    },
    [courseId, canAccessChapter, router]
  );

  // 加载状态
  if (courseLoading || chapterLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-100">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
          <p className="text-stone-600 font-medium">正在加载课程内容...</p>
        </motion.div>
      </div>
    );
  }

  // 错误状态
  if (!course || !chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-20 h-20 bg-stone-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">内容不存在</h2>
          <p className="text-stone-500 mb-6">该章节可能已被删除或链接无效</p>
          <Link
            href={`/learn/course/${courseId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            返回课程
          </Link>
        </motion.div>
      </div>
    );
  }

  // 检查访问权限
  if (!canAccessChapter(chapter)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-100">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">VIP专享内容</h2>
          <p className="text-stone-500 mb-6">开通VIP会员，解锁全部课程内容</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/learn/course/${courseId}`}
              className="px-6 py-3 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors font-medium"
            >
              返回课程
            </Link>
            <Link
              href="/vip"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors font-medium shadow-lg shadow-amber-200"
            >
              立即开通VIP
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* 左侧课程导航 */}
      <ChapterSidebar
        course={course}
        currentChapterId={chapterId}
        isVIP={isVIP}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-200">
          <div className="px-4 lg:px-6 py-3 flex items-center gap-4">
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-stone-600" />
            </button>

            {/* 面包屑导航 */}
            <nav className="hidden sm:flex items-center gap-2 text-sm text-stone-500 flex-1 min-w-0">
              <Link href="/learn" className="hover:text-amber-600 transition-colors">
                学习
              </Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <Link
                href={`/learn/course/${course.id}`}
                className="hover:text-amber-600 transition-colors truncate max-w-[200px]"
              >
                {course.title}
              </Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <span className="text-stone-700 font-medium truncate">{chapter.title}</span>
            </nav>

            {/* 移动端标题 */}
            <div className="sm:hidden flex-1 min-w-0">
              <p className="text-sm text-stone-500 truncate">{course.title}</p>
            </div>

            {/* 进度指示 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden sm:inline text-stone-400">
                第 {currentIndex + 1} / {flatChapters.length} 节
              </span>
              <div className="w-20 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                  style={{
                    width: `${((currentIndex + 1) / flatChapters.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* 章节信息卡片 */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl items-center justify-center flex-shrink-0">
                {getContentTypeIcon(chapter.content_type, "w-7 h-7 text-amber-600")}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl lg:text-2xl font-bold text-stone-800 mb-2">
                  {chapter.title}
                </h1>
                {chapter.description && (
                  <p className="text-stone-600 text-sm lg:text-base mb-3 line-clamp-2">
                    {chapter.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
                  {chapter.duration_minutes > 0 && (
                    <span className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg">
                      <Clock className="w-4 h-4" />
                      {formatDuration(chapter.duration_minutes)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg">
                    {getContentTypeIcon(chapter.content_type, "w-4 h-4")}
                    {chapter.content_type === "video"
                      ? "视频"
                      : chapter.content_type === "audio"
                        ? "音频"
                        : "图文"}
                  </span>
                  {fullContent?.word_count?.total && (
                    <span className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg">
                      <FileText className="w-4 h-4" />约{" "}
                      {Math.round(fullContent.word_count.total / 1000)}k 字
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 媒体内容 */}
        {chapter.content_type === "video" && chapter.content_url && (
          <div className="bg-stone-900">
            <div className="max-w-5xl mx-auto">
              <video src={chapter.content_url} controls className="w-full aspect-video" />
            </div>
          </div>
        )}

        {chapter.content_type === "audio" && chapter.content_url && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200">
                  <Headphones className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">{chapter.title}</h3>
                  <p className="text-sm text-stone-500">
                    {formatDuration(chapter.duration_minutes)}
                  </p>
                </div>
              </div>
              <audio src={chapter.content_url} controls className="w-full" />
            </div>
          </div>
        )}

        {/* 课程内容 */}
        <main className="flex-1 flex flex-col">
          {contentLoading ? (
            <div className="flex-1 py-8 px-4 lg:px-6">
              <div className="max-w-4xl mx-auto">
                <LessonContentSkeleton />
              </div>
            </div>
          ) : parsedLessonContent ? (
            <StepBasedRenderer
              content={parsedLessonContent}
              onNavigateNext={() => handleNavigate(nextChapter)}
              onNavigatePrev={() => handleNavigate(prevChapter)}
              hasNextChapter={!!nextChapter && canAccessChapter(nextChapter)}
              hasPrevChapter={!!prevChapter && canAccessChapter(prevChapter)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-stone-400" />
                </div>
                <p className="text-stone-500">暂无内容</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
