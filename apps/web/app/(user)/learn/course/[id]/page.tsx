"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Clock,
  Star,
  Play,
  ChevronRight,
  ChevronDown,
  Loader2,
  BookMarked,
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle,
  Lock,
  PlayCircle,
  FileText,
  Video,
  Headphones,
  AlertCircle,
  Users,
  Eye,
  ThumbsUp,
  Award,
  Sparkles,
  Zap,
  Target,
  ListChecks,
  Copy,
  ArrowUp,
  Flame,
  TrendingUp,
  CirclePlay,
  Home,
  ChevronUp,
} from "lucide-react";
import {
  useCourse,
  formatDuration,
  getDifficultyLabel,
  getDifficultyColor,
  getContentTypeLabel,
  getSubjectName,
} from "@/hooks/useCourse";
import { CourseChapter, CourseDetail } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

// 动画变体
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// 获取内容类型图标
function getContentTypeIcon(contentType: string, className = "w-4 h-4") {
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

// 骨架屏加载组件
function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white animate-pulse">
      {/* Header skeleton */}
      <div className="relative bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="h-6 w-32 bg-white/20 rounded mb-6" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-80 flex-shrink-0">
              <div className="aspect-video lg:aspect-[4/3] rounded-2xl bg-white/10" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 w-48 bg-white/20 rounded" />
              <div className="h-10 w-3/4 bg-white/20 rounded" />
              <div className="h-6 w-1/2 bg-white/20 rounded" />
              <div className="h-20 bg-white/20 rounded" />
              <div className="flex gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-20 bg-white/20 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-96 bg-stone-200 rounded-2xl" />
            <div className="h-48 bg-stone-200 rounded-2xl" />
          </div>
          <div className="lg:w-80 space-y-4">
            <div className="h-64 bg-stone-200 rounded-2xl" />
            <div className="h-32 bg-stone-200 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 面包屑导航
function Breadcrumbs({ course }: { course: CourseDetail }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-white/70 mb-4 flex-wrap">
      <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        首页
      </Link>
      <ChevronRight className="w-4 h-4 text-white/40" />
      <Link href="/learn" className="hover:text-white transition-colors">
        学习中心
      </Link>
      {course.category && (
        <>
          <ChevronRight className="w-4 h-4 text-white/40" />
          <Link
            href={`/learn/${course.category.subject}?category_id=${course.category.id}`}
            className="hover:text-white transition-colors"
          >
            {course.category.name}
          </Link>
        </>
      )}
      <ChevronRight className="w-4 h-4 text-white/40" />
      <span className="text-white/90 truncate max-w-[200px]">{course.title}</span>
    </nav>
  );
}

// 动画数字计数器
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-display font-bold tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// 课程亮点卡片
function CourseHighlights({ course }: { course: CourseDetail }) {
  const highlights = [
    {
      icon: <Video className="w-5 h-5" />,
      label: getContentTypeLabel(course.content_type),
      color: "bg-blue-500",
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      label: getDifficultyLabel(course.difficulty),
      color: getDifficultyColor(course.difficulty).includes("green")
        ? "bg-green-500"
        : getDifficultyColor(course.difficulty).includes("amber")
        ? "bg-amber-500"
        : getDifficultyColor(course.difficulty).includes("orange")
        ? "bg-orange-500"
        : "bg-red-500",
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: course.is_hot ? "热门课程" : "精品课程",
      color: "bg-rose-500",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: course.is_recommended ? "强烈推荐" : "官方认证",
      color: "bg-emerald-500",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-3 mt-4"
    >
      {highlights.map((item, idx) => (
        <motion.div
          key={idx}
          variants={scaleIn}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm ${item.color}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// 章节树节点组件 - 带动画
function ChapterTreeNode({
  chapter,
  level = 0,
  userProgress,
  isVIP,
  isFree,
  onPlay,
  index = 0,
}: {
  chapter: CourseChapter;
  level?: number;
  userProgress?: number;
  isVIP?: boolean;
  isFree?: boolean;
  onPlay: (chapter: CourseChapter) => void;
  index?: number;
}) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = chapter.children && chapter.children.length > 0;

  // 章节是否可访问
  const canAccess = isFree || chapter.is_free_preview || isVIP;

  // 子章节数量
  const childCount = hasChildren ? chapter.children!.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div
        className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
          hasChildren
            ? "cursor-pointer hover:bg-gradient-to-r hover:from-stone-50 hover:to-transparent"
            : canAccess
            ? "cursor-pointer hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent hover:shadow-sm"
            : "cursor-not-allowed opacity-60"
        }`}
        style={{ paddingLeft: `${16 + level * 24}px` }}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else if (canAccess) {
            onPlay(chapter);
          }
        }}
      >
        {/* 展开/折叠图标 或 播放图标 */}
        {hasChildren ? (
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-stone-100 group-hover:bg-stone-200 transition-colors">
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-stone-500" />
            </motion.div>
          </div>
        ) : (
          <motion.div
            whileHover={canAccess ? { scale: 1.05 } : {}}
            whileTap={canAccess ? { scale: 0.95 } : {}}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              canAccess
                ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 group-hover:from-amber-200 group-hover:to-amber-300 shadow-sm"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            {canAccess ? (
              getContentTypeIcon(chapter.content_type)
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </motion.div>
        )}

        {/* 章节标题 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium truncate ${
                hasChildren
                  ? "text-stone-800 text-base"
                  : canAccess
                  ? "text-stone-700 group-hover:text-amber-700 transition-colors"
                  : "text-stone-500"
              }`}
            >
              {chapter.title}
            </span>
            {chapter.is_free_preview && !isFree && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full border border-green-200">
                免费试看
              </span>
            )}
            {hasChildren && (
              <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                {childCount} 节
              </span>
            )}
          </div>
          {chapter.description && !hasChildren && (
            <p className="text-sm text-stone-500 truncate mt-0.5 group-hover:text-stone-600 transition-colors">
              {chapter.description}
            </p>
          )}
        </div>

        {/* 时长 */}
        {!hasChildren && chapter.duration_minutes > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-stone-400 flex-shrink-0 bg-stone-50 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(chapter.duration_minutes)}
          </div>
        )}

        {/* 播放按钮提示 */}
        {!hasChildren && canAccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute right-4 bg-amber-500 text-white p-2 rounded-full shadow-lg"
          >
            <Play className="w-4 h-4" />
          </motion.div>
        )}
      </div>

      {/* 子章节 - 带动画 */}
      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative ml-[calc(16px+24px*var(--level))]" style={{ "--level": level } as any}>
              {/* 连接线 */}
              <div className="absolute left-[18px] top-0 bottom-4 w-px bg-gradient-to-b from-stone-200 to-transparent" />
              
              {chapter.children!.map((child, idx) => (
                <ChapterTreeNode
                  key={child.id}
                  chapter={child}
                  level={level + 1}
                  userProgress={userProgress}
                  isVIP={isVIP}
                  isFree={isFree}
                  onPlay={onPlay}
                  index={idx}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 统计章节数量
function countChapters(chapters: CourseChapter[]): {
  total: number;
  totalDuration: number;
} {
  let total = 0;
  let totalDuration = 0;

  function traverse(items: CourseChapter[]) {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      } else {
        total++;
        totalDuration += item.duration_minutes || 0;
      }
    }
  }

  traverse(chapters);
  return { total, totalDuration };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const headerRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, user } = useAuthStore();
  const { loading, course, fetchCourse, collectCourse, uncollectCourse } =
    useCourse();

  const [copySuccess, setCopySuccess] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeTab, setActiveTab] = useState<"chapters" | "details">("chapters");

  // 滚动视差效果
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const headerScale = useTransform(scrollY, [0, 300], [1, 0.98]);

  // 监听滚动显示回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 加载课程数据
  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId, fetchCourse]);

  // 检查VIP状态（这里简化处理，实际应从用户状态获取）
  const isVIP = user?.is_vip || false;

  // 统计章节信息
  const chapterStats = useMemo(() => {
    if (!course?.chapters) return { total: 0, totalDuration: 0 };
    return countChapters(course.chapters);
  }, [course?.chapters]);

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 处理收藏切换
  const handleToggleCollect = useCallback(async () => {
    if (!course) return;

    if (!isAuthenticated) {
      toast.error("请先登录");
      router.push("/auth/login");
      return;
    }

    try {
      if (course.is_collected) {
        await uncollectCourse(course.id);
      } else {
        await collectCourse(course.id);
      }
    } catch (error) {
      console.error("Failed to toggle collect:", error);
    }
  }, [course, isAuthenticated, collectCourse, uncollectCourse, router]);

  // 处理分享
  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title || "课程详情",
          text: course?.description || "",
          url,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        toast.success("链接已复制");
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        toast.error("复制失败");
      }
    }
  }, [course]);

  // 处理开始/继续学习
  const handleStartLearning = useCallback(() => {
    if (!course) return;

    if (!isAuthenticated) {
      toast.error("请先登录");
      router.push("/auth/login");
      return;
    }

    // 找到第一个可播放的章节
    const findFirstPlayableChapter = (
      chapters: CourseChapter[]
    ): CourseChapter | null => {
      for (const chapter of chapters) {
        if (chapter.children && chapter.children.length > 0) {
          const found = findFirstPlayableChapter(chapter.children);
          if (found) return found;
        } else if (
          course.is_free ||
          chapter.is_free_preview ||
          isVIP ||
          !course.vip_only
        ) {
          return chapter;
        }
      }
      return null;
    };

    const firstChapter = course.chapters
      ? findFirstPlayableChapter(course.chapters)
      : null;

    if (firstChapter) {
      router.push(`/learn/course/${course.id}/chapter/${firstChapter.id}`);
    } else {
      toast.error("暂无可学习的章节");
    }
  }, [course, isAuthenticated, isVIP, router]);

  // 处理播放章节
  const handlePlayChapter = useCallback(
    (chapter: CourseChapter) => {
      if (!course) return;

      if (!isAuthenticated) {
        toast.error("请先登录");
        router.push("/auth/login");
        return;
      }

      router.push(`/learn/course/${course.id}/chapter/${chapter.id}`);
    },
    [course, isAuthenticated, router]
  );

  // 加载状态 - 使用骨架屏
  if (loading) {
    return <CourseDetailSkeleton />;
  }

  // 错误状态
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-3">
            课程不存在
          </h2>
          <p className="text-stone-500 mb-8 max-w-md">
            该课程可能已被删除或链接无效，请检查链接是否正确
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
          >
            <ArrowLeft className="w-5 h-5" />
            返回学习中心
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header with cover - 带视差效果 */}
      <motion.div
        ref={headerRef}
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="relative bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800 overflow-hidden"
      >
        {/* Background cover image with overlay */}
        {course.cover_image && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src={course.cover_image}
              alt={course.title}
              className="w-full h-full object-cover opacity-20 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-stone-900/60" />
          </div>
        )}

        {/* 装饰性光效 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-8 max-w-6xl">
          {/* 面包屑导航 */}
          <Breadcrumbs course={course} />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col lg:flex-row gap-8"
          >
            {/* Cover Image */}
            <motion.div variants={fadeInUp} className="lg:w-80 flex-shrink-0">
              <div className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden bg-stone-700 shadow-2xl group">
                {course.cover_image ? (
                  <img
                    src={course.cover_image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-600 to-stone-700">
                    <BookOpen className="w-16 h-16 text-stone-400" />
                  </div>
                )}

                {/* 播放按钮悬浮效果 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleStartLearning}
                >
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                    <CirclePlay className="w-10 h-10 text-amber-500" />
                  </div>
                </motion.div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {course.is_free ? (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg shadow-lg"
                    >
                      免费课程
                    </motion.span>
                  ) : course.vip_only ? (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 shadow-lg"
                    >
                      <Star className="w-4 h-4" />
                      VIP专享
                    </motion.span>
                  ) : null}
                </div>

                {/* 进度条 */}
                {isAuthenticated && course.study_progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.study_progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Course Info */}
            <motion.div variants={fadeInUp} className="flex-1 text-white">
              {/* Category & Difficulty */}
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-3 flex-wrap">
                {course.category && (
                  <Link
                    href={`/learn/${course.category.subject}?category_id=${course.category.id}`}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-sm transition-colors"
                  >
                    {course.category.name}
                  </Link>
                )}
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getDifficultyColor(
                    course.difficulty
                  )}`}
                >
                  {getDifficultyLabel(course.difficulty)}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={fadeInUp}
                className="text-2xl lg:text-4xl font-bold mb-3 leading-tight"
              >
                {course.title}
              </motion.h1>
              {course.subtitle && (
                <motion.p
                  variants={fadeInUp}
                  className="text-lg text-white/80 mb-4"
                >
                  {course.subtitle}
                </motion.p>
              )}

              {/* Description */}
              {course.description && (
                <motion.p
                  variants={fadeInUp}
                  className="text-white/70 mb-6 line-clamp-3 leading-relaxed"
                >
                  {course.description}
                </motion.p>
              )}

              {/* Stats - 带动画计数 */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
              >
                <div className="flex flex-col items-center sm:items-start gap-1 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">学习人数</span>
                  </div>
                  <div className="text-xl">
                    <AnimatedCounter value={course.study_count} />
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <ListChecks className="w-4 h-4" />
                    <span className="text-xs">课程章节</span>
                  </div>
                  <div className="text-xl">
                    <AnimatedCounter value={chapterStats.total} suffix=" 节" />
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">总时长</span>
                  </div>
                  <div className="text-xl font-display font-bold">
                    {formatDuration(chapterStats.totalDuration)}
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs">好评数</span>
                  </div>
                  <div className="text-xl">
                    <AnimatedCounter value={course.like_count} />
                  </div>
                </div>
              </motion.div>

              {/* 课程亮点标签 */}
              <CourseHighlights course={course} />

              {/* Teacher Info */}
              {course.author_name && (
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center gap-4 p-4 mt-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden ring-2 ring-white/20">
                    {course.author_avatar ? (
                      <img
                        src={course.author_avatar}
                        alt={course.author_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GraduationCap className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{course.author_name}</p>
                    {course.author_intro && (
                      <p className="text-sm text-white/70 line-clamp-1">
                        {course.author_intro}
                      </p>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-amber-400 text-sm">
                    <Award className="w-4 h-4" />
                    <span>认证讲师</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Chapters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 min-w-0"
          >
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-4">
              <button
                onClick={() => setActiveTab("chapters")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === "chapters"
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  课程目录
                </span>
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === "details"
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  课程详情
                </span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "chapters" && (
                <motion.div
                  key="chapters"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Chapter List */}
                  <div className="bg-white rounded-2xl border border-stone-200/50 shadow-lg shadow-stone-200/50 overflow-hidden">
                    <div className="p-5 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <ListChecks className="w-5 h-5 text-amber-600" />
                          </div>
                          课程目录
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-stone-500">
                          <span className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-full">
                            <BookOpen className="w-4 h-4" />
                            {chapterStats.total} 节课
                          </span>
                          <span className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-full">
                            <Clock className="w-4 h-4" />
                            {formatDuration(chapterStats.totalDuration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {course.chapters && course.chapters.length > 0 ? (
                        course.chapters.map((chapter, idx) => (
                          <ChapterTreeNode
                            key={chapter.id}
                            chapter={chapter}
                            userProgress={course.study_progress}
                            isVIP={isVIP}
                            isFree={course.is_free}
                            onPlay={handlePlayChapter}
                            index={idx}
                          />
                        ))
                      ) : (
                        <div className="py-16 text-center">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-stone-400" />
                          </div>
                          <p className="text-stone-500 text-lg">暂无章节内容</p>
                          <p className="text-stone-400 text-sm mt-1">课程内容正在准备中</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Learning Objectives */}
                  {course.objectives && course.objectives.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-2xl border border-stone-200/50 shadow-lg shadow-stone-200/50 p-6 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                          <Target className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-800">学习目标</h2>
                      </div>
                      <ul className="space-y-4">
                        {course.objectives.map((objective, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                            className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl"
                          >
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-stone-700">{objective}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Requirements */}
                  {course.requirements && course.requirements.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-2xl border border-stone-200/50 shadow-lg shadow-stone-200/50 p-6"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                          <Award className="w-6 h-6 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-800">学习要求</h2>
                      </div>
                      <ul className="space-y-4">
                        {course.requirements.map((req, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                            className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-xl"
                          >
                            <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span className="text-stone-700">{req}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Target Audience */}
                  {course.target_audience && course.target_audience.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-2xl border border-stone-200/50 shadow-lg shadow-stone-200/50 p-6"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-800">适合人群</h2>
                      </div>
                      <ul className="space-y-4">
                        {course.target_audience.map((audience, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.05 }}
                            className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-xl"
                          >
                            <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                            <span className="text-stone-700">{audience}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* 课程描述完整版 */}
                  {course.description && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-2xl border border-stone-200/50 shadow-lg shadow-stone-200/50 p-6"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-800">课程介绍</h2>
                      </div>
                      <div className="prose prose-stone max-w-none">
                        <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                          {course.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column - Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="sticky top-24 space-y-4">
              {/* Action Card */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-stone-200/50 shadow-lg shadow-stone-200/50 p-6 overflow-hidden relative"
              >
                {/* 装饰背景 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-full -translate-y-16 translate-x-16" />
                
                {/* Price/VIP Info */}
                {!course.is_free && (
                  <div className="mb-5 pb-5 border-b border-stone-100 relative">
                    {course.vip_only ? (
                      <div className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl border border-amber-200 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI0Y1OUUwQiIgZmlsbC1vcGFjaXR5PSIuMSIgY3g9IjIwIiBjeT0iMjAiIHI9IjMiLz48L2c+PC9zdmc+')] opacity-50" />
                        <Star className="w-6 h-6 text-amber-500" />
                        <span className="font-bold text-amber-700 text-lg">
                          VIP专享课程
                        </span>
                      </div>
                    ) : course.price ? (
                      <div className="text-center">
                        <span className="text-4xl font-bold text-gradient-amber">
                          ¥{course.price}
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Progress */}
                {isAuthenticated && course.study_progress > 0 && (
                  <div className="mb-5 p-4 bg-stone-50 rounded-xl">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-stone-600 font-medium">学习进度</span>
                      <span className="font-bold text-amber-600 text-lg">
                        {Math.round(course.study_progress)}%
                      </span>
                    </div>
                    <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.study_progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartLearning}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:via-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 text-lg relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Play className="w-5 h-5" />
                    {course.study_progress > 0 ? "继续学习" : "开始学习"}
                  </motion.button>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleToggleCollect}
                      className={`flex-1 py-3.5 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                        course.is_collected
                          ? "bg-red-50 border-red-200 text-red-600 shadow-sm shadow-red-100"
                          : "border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 transition-transform ${
                          course.is_collected ? "fill-current scale-110" : ""
                        }`}
                      />
                      {course.is_collected ? "已收藏" : "收藏"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShare}
                      className="flex-1 py-3.5 rounded-xl border-2 border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      {copySuccess ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-5 h-5" />
                      )}
                      分享
                    </motion.button>
                  </div>
                </div>

                {/* VIP Promotion for non-VIP users viewing VIP content */}
                {!course.is_free && course.vip_only && !isVIP && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link
                      href="/vip"
                      className="mt-5 block p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Star className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-amber-800">
                            开通VIP，解锁全部
                          </p>
                          <p className="text-sm text-amber-600">
                            畅享1000+精品课程
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                )}
              </motion.div>

              {/* Course Stats Card */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-stone-200/50 shadow-lg shadow-stone-200/50 p-6"
              >
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">
                  课程信息
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                    <span className="text-stone-600 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-stone-400" />
                      浏览量
                    </span>
                    <span className="font-bold text-stone-800 font-display">
                      {course.view_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                    <span className="text-stone-600 flex items-center gap-2">
                      <BookMarked className="w-4 h-4 text-stone-400" />
                      收藏数
                    </span>
                    <span className="font-bold text-stone-800 font-display">
                      {course.collect_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                    <span className="text-stone-600 flex items-center gap-2">
                      <Video className="w-4 h-4 text-stone-400" />
                      内容类型
                    </span>
                    <span className="font-semibold text-stone-800">
                      {getContentTypeLabel(course.content_type)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Related Category Link */}
              {course.category && (
                <motion.div whileHover={{ y: -2, scale: 1.01 }}>
                  <Link
                    href={`/learn/${course.category.subject}?category_id=${course.category.id}`}
                    className="block bg-gradient-to-br from-white to-amber-50/50 rounded-2xl border border-stone-200/50 shadow-lg shadow-stone-200/50 p-5 hover:border-amber-200 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl group-hover:scale-105 transition-transform">
                        <BookOpen className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-stone-800 group-hover:text-amber-700 transition-colors">
                          更多{course.category.name}课程
                        </p>
                        <p className="text-sm text-stone-500">
                          {course.category.course_count}门相关课程
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-stone-200 flex gap-3 safe-area-bottom z-40"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleCollect}
          className={`p-4 rounded-xl border-2 transition-all ${
            course.is_collected
              ? "bg-red-50 border-red-200 text-red-500"
              : "border-stone-200 text-stone-500 hover:border-stone-300"
          }`}
        >
          <Heart
            className={`w-5 h-5 ${course.is_collected ? "fill-current" : ""}`}
          />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="p-4 rounded-xl border-2 border-stone-200 text-stone-500 hover:border-stone-300 transition-all"
        >
          {copySuccess ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <Share2 className="w-5 h-5" />
          )}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStartLearning}
          className="flex-1 py-4 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <Play className="w-5 h-5" />
          {course.study_progress > 0 ? "继续学习" : "开始学习"}
        </motion.button>
      </motion.div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-32 lg:bottom-8 right-4 lg:right-8 z-50 w-12 h-12 bg-white rounded-full shadow-xl shadow-stone-300/50 flex items-center justify-center border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-colors group"
          >
            <ChevronUp className="w-6 h-6 text-stone-600 group-hover:text-amber-600 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
