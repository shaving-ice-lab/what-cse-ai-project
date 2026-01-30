"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Clock,
  BookOpen,
  FileText,
  CheckCircle,
  Lock,
  Loader2,
  AlertCircle,
  ListChecks,
  StickyNote,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Video,
  Headphones,
  BookMarked,
  Menu,
  X,
} from "lucide-react";
import {
  useCourse,
  useChapter,
  useMyLearning,
  formatDuration,
} from "@/hooks/useCourse";
import { CourseChapter, CourseDetail } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";
import {
  LessonContentRenderer,
  LessonContent,
} from "@/components/learning/LessonContentRenderer";
import { LessonContentSkeleton } from "@/components/learning/LessonContentSkeleton";

// 播放速度选项
const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// 获取内容类型图标
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

// 简化的章节列表组件
function ChapterListItem({
  chapter,
  currentChapterId,
  courseId,
  level = 0,
  isFree,
  isVIP,
}: {
  chapter: CourseChapter;
  currentChapterId: number;
  courseId: number;
  level?: number;
  isFree?: boolean;
  isVIP?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = chapter.children && chapter.children.length > 0;
  const isCurrent = chapter.id === currentChapterId;
  const canAccess = isFree || chapter.is_free_preview || isVIP;

  return (
    <div>
      {hasChildren ? (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg"
          style={{ paddingLeft: `${12 + level * 12}px` }}
        >
          <ChevronRight
            className={`w-4 h-4 text-stone-400 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
          <span className="truncate">{chapter.title}</span>
        </button>
      ) : (
        <Link
          href={
            canAccess
              ? `/learn/course/${courseId}/chapter/${chapter.id}`
              : "#"
          }
          onClick={(e) => {
            if (!canAccess) {
              e.preventDefault();
              toast.error("请开通VIP后观看此章节");
            }
          }}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
            isCurrent
              ? "bg-amber-100 text-amber-700 font-medium"
              : canAccess
              ? "hover:bg-stone-50 text-stone-600"
              : "opacity-50 cursor-not-allowed text-stone-400"
          }`}
          style={{ paddingLeft: `${12 + level * 12}px` }}
        >
          <div
            className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
              isCurrent
                ? "bg-amber-500 text-white"
                : canAccess
                ? "bg-stone-100 text-stone-500"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            {canAccess ? (
              getContentTypeIcon(chapter.content_type, "w-3.5 h-3.5")
            ) : (
              <Lock className="w-3 h-3" />
            )}
          </div>
          <span className="flex-1 truncate">{chapter.title}</span>
          {chapter.duration_minutes > 0 && (
            <span className="text-xs text-stone-400 flex-shrink-0">
              {formatDuration(chapter.duration_minutes)}
            </span>
          )}
        </Link>
      )}

      {hasChildren && expanded && (
        <div>
          {chapter.children!.map((child) => (
            <ChapterListItem
              key={child.id}
              chapter={child}
              currentChapterId={currentChapterId}
              courseId={courseId}
              level={level + 1}
              isFree={isFree}
              isVIP={isVIP}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 视频播放器组件
function VideoPlayer({
  src,
  onProgress,
  onComplete,
  initialProgress = 0,
}: {
  src: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  initialProgress?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 播放/暂停切换
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying]);

  // 静音切换
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (isFullscreen) {
      document.exitFullscreen?.();
    } else {
      containerRef.current.requestFullscreen?.();
    }
  }, [isFullscreen]);

  // 进度跳转
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    },
    [duration]
  );

  // 设置播放速度
  const handleSetRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  }, []);

  // 自动隐藏控制栏
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // 监听视频事件
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = duration > 0 ? (video.currentTime / duration) * 100 : 0;
      onProgress?.(progress);
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // 恢复上次进度
      if (initialProgress > 0) {
        video.currentTime = (initialProgress / 100) * video.duration;
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [duration, initialProgress, onProgress, onComplete]);

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          videoRef.current.currentTime -= 5;
          break;
        case "ArrowRight":
          videoRef.current.currentTime += 5;
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [togglePlay, toggleMute, toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className="relative bg-black aspect-video rounded-xl overflow-hidden group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onClick={togglePlay}
      />

      {/* Play button overlay (when paused) */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-105 transition-transform">
            <Play className="w-10 h-10 text-stone-800 ml-1" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div
          className="h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-amber-500 rounded-full relative"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="text-white hover:text-amber-400 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="text-white hover:text-amber-400 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <span className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Playback rate */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-amber-400 transition-colors text-sm font-medium"
            >
              {playbackRate}x
            </button>
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 bg-stone-800 rounded-lg py-2 shadow-lg">
                {playbackRates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSetRate(rate)}
                    className={`block w-full px-4 py-1.5 text-sm text-left transition-colors ${
                      rate === playbackRate
                        ? "text-amber-400"
                        : "text-white hover:text-amber-400"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-amber-400 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// 文档阅读器组件
function DocumentReader({ content, url }: { content?: string; url?: string }) {
  if (url && url.endsWith(".pdf")) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className="w-full h-[70vh]"
          title="PDF Document"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-8">
      {content ? (
        <div
          className="prose prose-stone max-w-none prose-headings:text-stone-800 prose-p:text-stone-600 prose-a:text-amber-600"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">暂无文档内容</p>
        </div>
      )}
    </div>
  );
}

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
    hasModuleContent,
    parsedLessonContent,
    fetchChapter,
    fetchChapterFullContent,
  } = useChapter();
  const { updateProgress } = useMyLearning();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 加载数据
  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId, fetchCourse]);

  useEffect(() => {
    if (chapterId) {
      // 先获取基础信息
      fetchChapter(chapterId);
      // 然后尝试获取完整内容（含模块化内容）
      fetchChapterFullContent(chapterId);
    }
  }, [chapterId, fetchChapter, fetchChapterFullContent]);

  // VIP状态
  const isVIP = user?.is_vip || false;

  // 获取扁平化的章节列表用于导航
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

  // 当前章节索引
  const currentIndex = flatChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? flatChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < flatChapters.length - 1
      ? flatChapters[currentIndex + 1]
      : null;

  // 检查章节访问权限
  const canAccessChapter = useCallback(
    (ch: CourseChapter) => {
      return course?.is_free || ch.is_free_preview || isVIP;
    },
    [course?.is_free, isVIP]
  );

  // 处理进度更新
  const handleProgress = useCallback(
    (progress: number) => {
      if (isAuthenticated && courseId && chapterId) {
        // 每10%保存一次进度
        if (Math.floor(progress / 10) !== Math.floor((progress - 1) / 10)) {
          updateProgress(courseId, { chapter_id: chapterId, progress });
        }
      }
    },
    [isAuthenticated, courseId, chapterId, updateProgress]
  );

  // 处理章节完成
  const handleComplete = useCallback(() => {
    if (isAuthenticated && courseId && chapterId) {
      updateProgress(courseId, { chapter_id: chapterId, progress: 100 });
      toast.success("章节学习完成！");

      // 自动跳转下一章
      if (nextChapter && canAccessChapter(nextChapter)) {
        setTimeout(() => {
          router.push(`/learn/course/${courseId}/chapter/${nextChapter.id}`);
        }, 1500);
      }
    }
  }, [
    isAuthenticated,
    courseId,
    chapterId,
    nextChapter,
    canAccessChapter,
    updateProgress,
    router,
  ]);

  // 导航到上一章/下一章
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
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // 错误状态
  if (!course || !chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100">
        <AlertCircle className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="text-xl font-semibold text-stone-700 mb-2">
          内容不存在
        </h2>
        <p className="text-stone-500 mb-6">该章节可能已被删除或链接无效</p>
        <Link
          href={`/learn/course/${courseId}`}
          className="px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
        >
          返回课程
        </Link>
      </div>
    );
  }

  // 检查访问权限
  if (!canAccessChapter(chapter)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100">
        <Lock className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="text-xl font-semibold text-stone-700 mb-2">
          VIP专享内容
        </h2>
        <p className="text-stone-500 mb-6">开通VIP会员，解锁全部课程内容</p>
        <div className="flex gap-4">
          <Link
            href={`/learn/course/${courseId}`}
            className="px-6 py-2.5 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors"
          >
            返回课程
          </Link>
          <Link
            href="/vip"
            className="px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
          >
            开通VIP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="w-5 h-5 text-stone-600" />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-40
          w-80 bg-white border-r border-stone-200 flex flex-col
          transform transition-transform duration-300
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "lg:w-80" : "lg:w-0 lg:overflow-hidden"}
        `}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3">
          <Link
            href={`/learn/course/${courseId}`}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-stone-800 truncate">
              {course.title}
            </h2>
            <p className="text-sm text-stone-500">
              {flatChapters.length} 个章节
            </p>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-stone-100 rounded-lg"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Chapter list */}
        <div className="flex-1 overflow-y-auto p-3">
          {course.chapters?.map((ch) => (
            <ChapterListItem
              key={ch.id}
              chapter={ch}
              currentChapterId={chapterId}
              courseId={courseId}
              isFree={course.is_free}
              isVIP={isVIP}
            />
          ))}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Toggle sidebar button (desktop) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md hover:bg-stone-50 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-stone-600" />
          )}
        </button>

        {/* Content area */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Chapter title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-stone-800 mb-2">
                {chapter.title}
              </h1>
              {chapter.description && (
                <p className="text-stone-600">{chapter.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-stone-500">
                {chapter.duration_minutes > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(chapter.duration_minutes)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  {getContentTypeIcon(chapter.content_type, "w-4 h-4")}
                  {chapter.content_type === "video"
                    ? "视频"
                    : chapter.content_type === "audio"
                    ? "音频"
                    : "文档"}
                </span>
              </div>
            </div>

            {/* 媒体内容（视频/音频） */}
            {chapter.content_type === "video" && chapter.content_url && (
              <VideoPlayer
                src={chapter.content_url}
                onProgress={handleProgress}
                onComplete={handleComplete}
                initialProgress={course.study_progress}
              />
            )}
            
            {chapter.content_type === "audio" && chapter.content_url && (
              <div className="bg-white rounded-xl p-6 border border-stone-200 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Headphones className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {formatDuration(chapter.duration_minutes)}
                    </p>
                  </div>
                </div>
                <audio
                  src={chapter.content_url}
                  controls
                  className="w-full"
                  onEnded={handleComplete}
                />
              </div>
            )}

            {/* 模块化课程内容（MCP 生成的 13 模块内容） */}
            {contentLoading ? (
              <LessonContentSkeleton />
            ) : parsedLessonContent ? (
              <div className="mt-8">
                {/* 字数统计信息 */}
                {fullContent?.word_count?.total && (
                  <div className="mb-6 flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      约 {Math.round(fullContent.word_count.total / 1000)}k 字
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      预计阅读 {Math.ceil(fullContent.word_count.total / 500)} 分钟
                    </span>
                  </div>
                )}
                <LessonContentRenderer content={parsedLessonContent as LessonContent} />
              </div>
            ) : (
              /* 回退到文档阅读器（无模块化内容时） */
              !chapter.content_url?.match(/\.(mp4|webm|mp3|wav)$/i) && (
                <DocumentReader
                  content={chapter.content_text}
                  url={chapter.content_url}
                />
              )
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
              <button
                onClick={() => handleNavigate(prevChapter)}
                disabled={!prevChapter}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  prevChapter
                    ? "hover:bg-stone-200 text-stone-700"
                    : "opacity-50 cursor-not-allowed text-stone-400"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>上一节</span>
              </button>

              <button
                onClick={() => handleNavigate(nextChapter)}
                disabled={!nextChapter}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  nextChapter
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "opacity-50 cursor-not-allowed bg-stone-300 text-stone-500"
                }`}
              >
                <span>下一节</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
