"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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

// 获取内容类型图标
function getContentTypeIcon(contentType: string) {
  switch (contentType) {
    case "video":
      return <Video className="w-4 h-4" />;
    case "audio":
      return <Headphones className="w-4 h-4" />;
    case "document":
      return <FileText className="w-4 h-4" />;
    default:
      return <PlayCircle className="w-4 h-4" />;
  }
}

// 章节树节点组件
function ChapterTreeNode({
  chapter,
  level = 0,
  userProgress,
  isVIP,
  isFree,
  onPlay,
}: {
  chapter: CourseChapter;
  level?: number;
  userProgress?: number;
  isVIP?: boolean;
  isFree?: boolean;
  onPlay: (chapter: CourseChapter) => void;
}) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = chapter.children && chapter.children.length > 0;

  // 章节是否可访问
  const canAccess = isFree || chapter.is_free_preview || isVIP;

  return (
    <div>
      <div
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          hasChildren
            ? "cursor-pointer hover:bg-stone-50"
            : canAccess
            ? "cursor-pointer hover:bg-amber-50"
            : "cursor-not-allowed opacity-70"
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
          <div className="w-8 h-8 flex items-center justify-center">
            <ChevronRight
              className={`w-5 h-5 text-stone-400 transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
          </div>
        ) : (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              canAccess
                ? "bg-amber-100 text-amber-600 group-hover:bg-amber-200"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            {canAccess ? (
              getContentTypeIcon(chapter.content_type)
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </div>
        )}

        {/* 章节标题 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium truncate ${
                hasChildren ? "text-stone-800" : "text-stone-700"
              }`}
            >
              {chapter.title}
            </span>
            {chapter.is_free_preview && !isFree && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                试看
              </span>
            )}
          </div>
          {chapter.description && !hasChildren && (
            <p className="text-sm text-stone-500 truncate mt-0.5">
              {chapter.description}
            </p>
          )}
        </div>

        {/* 时长 */}
        {!hasChildren && chapter.duration_minutes > 0 && (
          <span className="text-sm text-stone-400 flex-shrink-0">
            {formatDuration(chapter.duration_minutes)}
          </span>
        )}
      </div>

      {/* 子章节 */}
      {hasChildren && expanded && (
        <div>
          {chapter.children!.map((child) => (
            <ChapterTreeNode
              key={child.id}
              chapter={child}
              level={level + 1}
              userProgress={userProgress}
              isVIP={isVIP}
              isFree={isFree}
              onPlay={onPlay}
            />
          ))}
        </div>
      )}
    </div>
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

  const { isAuthenticated, user } = useAuthStore();
  const { loading, course, fetchCourse, collectCourse, uncollectCourse } =
    useCourse();

  const [copySuccess, setCopySuccess] = useState(false);

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

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // 错误状态
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="text-xl font-semibold text-stone-700 mb-2">
          课程不存在
        </h2>
        <p className="text-stone-500 mb-6">该课程可能已被删除或链接无效</p>
        <Link
          href="/learn"
          className="px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
        >
          返回学习中心
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header with cover */}
      <div className="relative bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800">
        {/* Background cover image with overlay */}
        {course.cover_image && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={course.cover_image}
              alt={course.title}
              className="w-full h-full object-cover opacity-20 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-stone-900/60" />
          </div>
        )}

        <div className="relative container mx-auto px-4 py-8 max-w-6xl">
          {/* Back button */}
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习中心
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cover Image */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden bg-stone-700 shadow-2xl">
                {course.cover_image ? (
                  <img
                    src={course.cover_image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-stone-500" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {course.is_free ? (
                    <span className="px-2.5 py-1 bg-green-500 text-white text-sm font-medium rounded-lg">
                      免费
                    </span>
                  ) : course.vip_only ? (
                    <span className="px-2.5 py-1 bg-amber-500 text-white text-sm font-medium rounded-lg flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      VIP
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 text-white">
              {/* Category & Difficulty */}
              <div className="flex items-center gap-3 mb-3">
                {course.category && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-sm">
                    {course.category.name}
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-lg text-sm ${getDifficultyColor(
                    course.difficulty
                  )}`}
                >
                  {getDifficultyLabel(course.difficulty)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {course.title}
              </h1>
              {course.subtitle && (
                <p className="text-lg text-white/80 mb-4">{course.subtitle}</p>
              )}

              {/* Description */}
              {course.description && (
                <p className="text-white/70 mb-6 line-clamp-3">
                  {course.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-white/60" />
                  <span className="font-semibold">{course.study_count}</span>
                  <span className="text-white/60">人学习</span>
                </div>
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-white/60" />
                  <span className="font-semibold">{chapterStats.total}</span>
                  <span className="text-white/60">个章节</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white/60" />
                  <span className="font-semibold">
                    {formatDuration(chapterStats.totalDuration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-white/60" />
                  <span className="font-semibold">{course.like_count}</span>
                  <span className="text-white/60">好评</span>
                </div>
              </div>

              {/* Teacher Info */}
              {course.author_name && (
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center overflow-hidden">
                    {course.author_avatar ? (
                      <img
                        src={course.author_avatar}
                        alt={course.author_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GraduationCap className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{course.author_name}</p>
                    {course.author_intro && (
                      <p className="text-sm text-white/70 line-clamp-1">
                        {course.author_intro}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Chapters */}
          <div className="flex-1 min-w-0">
            {/* Chapter List */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-amber-500" />
                  课程目录
                  <span className="text-sm text-stone-400 font-normal ml-2">
                    共 {chapterStats.total} 节 ·{" "}
                    {formatDuration(chapterStats.totalDuration)}
                  </span>
                </h2>
              </div>

              <div className="divide-y divide-stone-100">
                {course.chapters && course.chapters.length > 0 ? (
                  course.chapters.map((chapter) => (
                    <ChapterTreeNode
                      key={chapter.id}
                      chapter={chapter}
                      userProgress={course.study_progress}
                      isVIP={isVIP}
                      isFree={course.is_free}
                      onPlay={handlePlayChapter}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500">暂无章节内容</p>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Objectives */}
            {course.objectives && course.objectives.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  学习目标
                </h2>
                <ul className="space-y-3">
                  {course.objectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-stone-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  学习要求
                </h2>
                <ul className="space-y-3">
                  {course.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-stone-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Audience */}
            {course.target_audience && course.target_audience.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  适合人群
                </h2>
                <ul className="space-y-3">
                  {course.target_audience.map((audience, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="text-stone-700">{audience}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Action Card */}
              <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
                {/* Price/VIP Info */}
                {!course.is_free && (
                  <div className="mb-4 pb-4 border-b border-stone-100">
                    {course.vip_only ? (
                      <div className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                        <Star className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold text-amber-700">
                          VIP专享课程
                        </span>
                      </div>
                    ) : course.price ? (
                      <div className="text-center">
                        <span className="text-3xl font-bold text-amber-600">
                          ¥{course.price}
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Progress */}
                {isAuthenticated && course.study_progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-stone-600">学习进度</span>
                      <span className="font-medium text-amber-600">
                        {Math.round(course.study_progress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                        style={{ width: `${course.study_progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleStartLearning}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-amber-md flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {course.study_progress > 0 ? "继续学习" : "开始学习"}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleToggleCollect}
                      className={`flex-1 py-3 rounded-xl border font-medium transition-colors flex items-center justify-center gap-2 ${
                        course.is_collected
                          ? "bg-red-50 border-red-200 text-red-600"
                          : "border-stone-200 text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          course.is_collected ? "fill-current" : ""
                        }`}
                      />
                      {course.is_collected ? "已收藏" : "收藏"}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      {copySuccess ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-5 h-5" />
                      )}
                      分享
                    </button>
                  </div>
                </div>

                {/* VIP Promotion for non-VIP users viewing VIP content */}
                {!course.is_free && course.vip_only && !isVIP && (
                  <Link
                    href="/vip"
                    className="mt-4 block p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-amber-800">
                          开通VIP，解锁全部课程
                        </p>
                        <p className="text-sm text-amber-600">
                          畅享1000+精品课程
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-amber-500" />
                    </div>
                  </Link>
                )}
              </div>

              {/* Course Stats Card */}
              <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
                <h3 className="text-sm font-medium text-stone-500 mb-4">
                  课程信息
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      浏览量
                    </span>
                    <span className="font-medium text-stone-800">
                      {course.view_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 flex items-center gap-2">
                      <BookMarked className="w-4 h-4" />
                      收藏数
                    </span>
                    <span className="font-medium text-stone-800">
                      {course.collect_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      内容类型
                    </span>
                    <span className="font-medium text-stone-800">
                      {getContentTypeLabel(course.content_type)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Category Link */}
              {course.category && (
                <Link
                  href={`/learn/${course.category.subject}?category_id=${course.category.id}`}
                  className="block bg-white rounded-2xl border border-stone-200/50 shadow-card p-5 hover:border-amber-200 hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                      <BookOpen className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-800 group-hover:text-amber-700 transition-colors">
                        更多{course.category.name}课程
                      </p>
                      <p className="text-sm text-stone-500">
                        {course.category.course_count}门相关课程
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-lg border-t border-stone-200 flex gap-3">
        <button
          onClick={handleToggleCollect}
          className={`p-4 rounded-xl border ${
            course.is_collected
              ? "bg-red-50 border-red-200 text-red-500"
              : "border-stone-200 text-stone-500"
          }`}
        >
          <Heart
            className={`w-5 h-5 ${course.is_collected ? "fill-current" : ""}`}
          />
        </button>
        <button
          onClick={handleShare}
          className="p-4 rounded-xl border border-stone-200 text-stone-500"
        >
          {copySuccess ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <Share2 className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={handleStartLearning}
          className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {course.study_progress > 0 ? "继续学习" : "开始学习"}
        </button>
      </div>
    </div>
  );
}
