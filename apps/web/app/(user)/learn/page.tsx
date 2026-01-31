"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Target,
  Clock,
  Flame,
  Star,
  Play,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  Loader2,
  BookMarked,
  FileText,
  Mic,
  Library,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart3,
  LucideIcon,
  Users,
  Brain,
  PenLine,
  Activity,
} from "lucide-react";
import { useCourses, useMyLearning, getSubjectName, getSubjectIcon, getSubjectColor, formatDuration, getDifficultyLabel, getDifficultyColor, useLearningContent } from "@/hooks/useCourse";
import { useStreak } from "@/hooks/usePractice";
import { CourseBrief, UserCourseProgress, LearningContent, SubjectOverview } from "@/services/api/course";
import { courseApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { Empty } from "@/components/common";

// 默认科目配置（用于加载前显示和作为备用）
const defaultSubjects: SubjectOverview[] = [
  {
    id: "xingce",
    name: "行测",
    full_name: "行政职业能力测验",
    description: "数量关系、判断推理、言语理解、资料分析、常识判断",
    question_count: 12580,
    course_count: 0,
    features: ["逻辑推理", "数学运算", "言语理解"],
    icon: "BarChart3",
    bg_color: "bg-blue-50",
    text_color: "text-blue-600",
    border_color: "border-blue-200",
  },
  {
    id: "shenlun",
    name: "申论",
    full_name: "申论写作",
    description: "归纳概括、提出对策、综合分析、贯彻执行、文章写作",
    question_count: 3240,
    course_count: 0,
    features: ["材料分析", "对策提出", "大作文"],
    icon: "PenLine",
    bg_color: "bg-emerald-50",
    text_color: "text-emerald-600",
    border_color: "border-emerald-200",
  },
  {
    id: "mianshi",
    name: "面试",
    full_name: "结构化面试",
    description: "综合分析、计划组织、人际关系、应急应变、自我认知",
    question_count: 2860,
    course_count: 0,
    features: ["综合分析", "情景应变", "表达技巧"],
    icon: "Mic",
    bg_color: "bg-violet-50",
    text_color: "text-violet-600",
    border_color: "border-violet-200",
  },
  {
    id: "gongji",
    name: "公基",
    full_name: "公共基础知识",
    description: "政治理论、法律知识、经济常识、管理知识、公文写作",
    question_count: 8920,
    course_count: 0,
    features: ["法律常识", "政治理论", "时事热点"],
    icon: "BookOpen",
    bg_color: "bg-amber-50",
    text_color: "text-amber-600",
    border_color: "border-amber-200",
  },
];

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  PenLine,
  Mic,
  BookOpen,
  Brain,
  Activity,
  Target,
  Trophy,
};

// 根据课程属性生成封面配色
function getCoverGradient(course: CourseBrief): { gradient: string; accent: string; pattern: string } {
  const colorSchemes = [
    { gradient: "from-blue-500 via-blue-600 to-indigo-700", accent: "bg-blue-400/30", pattern: "text-blue-300/20" },
    { gradient: "from-emerald-500 via-teal-600 to-cyan-700", accent: "bg-emerald-400/30", pattern: "text-emerald-300/20" },
    { gradient: "from-violet-500 via-purple-600 to-indigo-700", accent: "bg-violet-400/30", pattern: "text-violet-300/20" },
    { gradient: "from-amber-500 via-orange-600 to-red-600", accent: "bg-amber-400/30", pattern: "text-amber-300/20" },
    { gradient: "from-rose-500 via-pink-600 to-fuchsia-700", accent: "bg-rose-400/30", pattern: "text-rose-300/20" },
    { gradient: "from-cyan-500 via-sky-600 to-blue-700", accent: "bg-cyan-400/30", pattern: "text-cyan-300/20" },
    { gradient: "from-lime-500 via-green-600 to-emerald-700", accent: "bg-lime-400/30", pattern: "text-lime-300/20" },
    { gradient: "from-fuchsia-500 via-purple-600 to-violet-700", accent: "bg-fuchsia-400/30", pattern: "text-fuchsia-300/20" },
  ];
  const index = (course.id + (course.category_id || 0)) % colorSchemes.length;
  return colorSchemes[index];
}

// 获取难度对应的装饰点数量
function getDifficultyDots(difficulty: string): number {
  switch (difficulty) {
    case "beginner": return 1;
    case "intermediate": return 2;
    case "advanced": return 3;
    default: return 1;
  }
}

// 科目入口卡片 - 新设计
function SubjectCard({ subject, index }: { subject: SubjectOverview; index: number }) {
  const IconComponent = iconMap[subject.icon] || BookOpen;
  
  // 格式化数字：添加千位分隔符
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  return (
    <Link
      href={`/learn/${subject.id}`}
      className="group bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        {/* Icon & Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-xl ${subject.bg_color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <IconComponent className={`w-7 h-7 ${subject.text_color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800 group-hover:text-amber-600 transition-colors">
              {subject.name}
            </h3>
            <p className="text-sm text-stone-500">{subject.full_name}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-600 mb-4 line-clamp-2">{subject.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {subject.features.map((feature, idx) => (
            <span
              key={idx}
              className={`px-2.5 py-1 text-xs font-medium ${subject.bg_color} ${subject.text_color} rounded-lg`}
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Stats & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex items-center gap-3 text-sm text-stone-500">
            <span>
              <span className="font-semibold text-stone-700">{formatNumber(subject.question_count)}</span> 道题目
            </span>
            {subject.course_count > 0 && (
              <span>
                <span className="font-semibold text-stone-700">{subject.course_count}</span> 门课程
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:gap-2 transition-all">
            进入学习 <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// 课程卡片组件
function CourseCard({ course, index }: { course: CourseBrief; index: number }) {
  const { gradient, accent, pattern } = getCoverGradient(course);
  const difficultyDots = getDifficultyDots(course.difficulty);

  return (
    <Link
      href={`/learn/course/${course.id}`}
      className="group block bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Dynamic Cover - 文字课程专用设计 */}
      <div className={`relative aspect-video bg-gradient-to-br ${gradient} overflow-hidden`}>
        {course.cover_image ? (
          <img
            src={course.cover_image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <>
            {/* 装饰性几何图案背景 */}
            <div className="absolute inset-0 overflow-hidden">
              <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${accent} blur-xl`} />
              <div className={`absolute -bottom-4 -left-4 w-24 h-24 rounded-full ${accent} blur-lg`} />
              
              <svg className={`absolute inset-0 w-full h-full ${pattern}`} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`grid-home-${course.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-home-${course.id})`} />
              </svg>
              
              {/* 难度指示点 */}
              <div className="absolute top-4 left-4 flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < difficultyDots ? 'bg-white/60' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
            
            {/* 中心内容区 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
              <div className={`w-12 h-12 rounded-xl ${accent} backdrop-blur-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                <BookMarked className="w-3.5 h-3.5" />
                <span>{course.chapter_count} 章节</span>
              </div>
            </div>

            {/* hover 效果 */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="px-3 py-1.5 bg-white/95 rounded-full flex items-center gap-1.5 shadow-lg">
                <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                <span className="text-xs font-medium text-stone-700">开始学习</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              </div>
            </div>
          </>
        )}
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-lg flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(course.duration_minutes)}
        </div>

        {/* Free/VIP Badge */}
        {course.is_free ? (
          <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg">
            免费
          </div>
        ) : course.vip_only ? (
          <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
            <Star className="w-3 h-3" />
            VIP
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Difficulty */}
        <div className="flex items-center gap-2 mb-2">
          {course.category && (
            <span className="text-xs text-stone-500">{course.category.name}</span>
          )}
          <span className={`px-2 py-0.5 text-xs rounded-lg font-medium ${getDifficultyColor(course.difficulty)}`}>
            {getDifficultyLabel(course.difficulty)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors mb-3 line-clamp-2">
          {course.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.study_count}人学习
          </span>
          <span className="flex items-center gap-1">
            <BookMarked className="w-3.5 h-3.5" />
            {course.chapter_count}章节
          </span>
        </div>
      </div>
    </Link>
  );
}

// 继续学习卡片
function ContinueLearningCard({ progress, index }: { progress: UserCourseProgress; index: number }) {
  const course = progress.course;
  if (!course) return null;

  const { gradient, accent } = getCoverGradient(course);

  return (
    <Link
      href={`/learn/course/${course.id}`}
      className="group flex gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all duration-300"
    >
      {/* Thumbnail - 动态封面 */}
      <div className={`relative w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${gradient}`}>
        {course.cover_image ? (
          <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${accent} blur-lg`} />
            <div className={`w-10 h-10 rounded-lg ${accent} backdrop-blur-sm flex items-center justify-center`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="font-medium text-stone-800 group-hover:text-amber-600 transition-colors truncate mb-2">
          {course.title}
        </h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-amber-600">{Math.round(progress.progress)}%</span>
        </div>
      </div>

      {/* Continue button - 改为阅读图标 */}
      <div className="flex items-center">
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

// 每日一练入口卡片
function DailyPracticeBanner({ streak }: { streak: { current_streak: number; today_completed: boolean; total_questions: number; avg_correct_rate: number } | null }) {
  return (
    <Link
      href="/learn/practice"
      className="group block bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="flex items-stretch">
        {/* Left colored section */}
        <div className="w-2 bg-gradient-to-b from-amber-400 to-orange-500" />
        
        <div className="flex-1 p-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
              <Flame className="w-7 h-7 text-amber-600" />
            </div>
            
            {/* Text */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-stone-800">每日一练</h3>
                {streak?.today_completed && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 已完成
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500">
                每天10道精选题目，智能推送你的薄弱点
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{streak?.current_streak || 0}</p>
              <p className="text-xs text-stone-500">连续打卡</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-800">{streak?.total_questions || 0}</p>
              <p className="text-xs text-stone-500">累计做题</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{Math.round(streak?.avg_correct_rate || 0)}%</p>
              <p className="text-xs text-stone-500">正确率</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center ml-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// 快捷入口
const quickActions = [
  { icon: Target, label: "学习计划", href: "/learn/plan", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: TrendingUp, label: "学习统计", href: "/learn/stats", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: BookMarked, label: "我的收藏", href: "/learn/favorites", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: FileText, label: "错题回顾", href: "/learn/mistakes", color: "text-red-600", bg: "bg-red-50" },
];

// 学习统计数据
const learningStats = [
  { value: "1,200+", label: "精品课程", icon: BookOpen },
  { value: "50万+", label: "学员在学", icon: Users },
  { value: "27,600+", label: "题库数量", icon: Brain },
  { value: "85%", label: "学员上岸率", icon: Trophy },
];

export default function LearnPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading: coursesLoading, fetchFeaturedCourses, fetchFreeCourses } = useCourses();
  const { loading: learningLoading, recentCourses, fetchRecentLearning } = useMyLearning();
  const { streak, fetchStreak } = useStreak();

  const [featuredCourses, setFeaturedCourses] = useState<CourseBrief[]>([]);
  const [freeCourses, setFreeCourses] = useState<CourseBrief[]>([]);
  const [subjects, setSubjects] = useState<SubjectOverview[]>(defaultSubjects);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  // 加载科目数据
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setSubjectsLoading(true);
        const response = await courseApi.getSubjectsOverview();
        if (response.subjects && response.subjects.length > 0) {
          setSubjects(response.subjects);
        }
      } catch (error) {
        console.error("Failed to load subjects:", error);
        // 出错时保持使用默认数据
      } finally {
        setSubjectsLoading(false);
      }
    };
    loadSubjects();
  }, []);

  // 加载课程数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, free] = await Promise.all([
          fetchFeaturedCourses(8),
          fetchFreeCourses(4),
        ]);
        setFeaturedCourses(featured);
        setFreeCourses(free);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };
    loadData();
  }, [fetchFeaturedCourses, fetchFreeCourses]);

  // 加载学习记录和打卡数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentLearning(3);
      fetchStreak();
    }
  }, [isAuthenticated, fetchRecentLearning, fetchStreak]);

  return (
    <div className="pb-20 lg:pb-0 bg-stone-50">
      {/* Hero Section - 与首页风格一致 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-white">
        <div className="absolute top-10 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-2xl" />

        <div className="container relative mx-auto px-4 lg:px-6 pt-10 pb-12">
          {/* Top Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-sm font-medium text-amber-700">
              <Sparkles className="w-4 h-4" /> 公考学习中心
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-600">
              <Activity className="w-4 h-4" /> 实时更新
            </span>
          </div>

          {/* Title + Description */}
          <div className="max-w-3xl mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
              系统学习，<span className="text-gradient-amber">高效备考</span>
            </h1>
            <p className="text-base md:text-lg text-stone-600">
              行测、申论、面试、公基四大科目全覆盖，从入门到精通，助你一举上岸
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {learningStats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-stone-900">{stat.value}</p>
                    <p className="text-sm text-stone-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Daily Practice Banner - Logged in users */}
        {isAuthenticated && (
          <div className="mb-6">
            <DailyPracticeBanner streak={streak} />
          </div>
        )}

        {/* Quick Actions - Logged in users */}
        {isAuthenticated && (
          <div className="mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <span className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">
                    {action.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400 ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Continue Learning - Logged in users */}
        {isAuthenticated && recentCourses.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                <Clock className="w-5 h-5 text-amber-600" />
                继续学习
              </h2>
              <Link
                href="/learn/my"
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentCourses.map((progress, idx) => (
                <ContinueLearningCard key={progress.id} progress={progress} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* Subject Entry Cards */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
              <Library className="w-5 h-5 text-amber-600" />
              按科目学习
            </h2>
          </div>
          {subjectsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-stone-200" />
                    <div className="flex-1">
                      <div className="h-5 bg-stone-200 rounded w-16 mb-2" />
                      <div className="h-4 bg-stone-100 rounded w-24" />
                    </div>
                  </div>
                  <div className="h-4 bg-stone-100 rounded w-full mb-4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-stone-100 rounded w-16" />
                    <div className="h-6 bg-stone-100 rounded w-16" />
                    <div className="h-6 bg-stone-100 rounded w-16" />
                  </div>
                  <div className="pt-4 border-t border-stone-100">
                    <div className="h-4 bg-stone-100 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjects.map((subject, idx) => (
                <SubjectCard key={subject.id} subject={subject} index={idx} />
              ))}
            </div>
          )}
        </section>

        {/* Featured Courses */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
              <Flame className="w-5 h-5 text-orange-500" />
              热门课程
              <span className="text-sm font-normal text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">
                实时更新
              </span>
            </h2>
            <Link
              href="/learn/courses"
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCourses.map((course, idx) => (
                <CourseCard key={course.id} course={course} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-stone-300" />
              <p className="text-stone-500">暂无推荐课程</p>
            </div>
          )}
        </section>

        {/* Free Courses */}
        {freeCourses.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                <Award className="w-5 h-5 text-emerald-500" />
                免费课程
              </h2>
              <Link
                href="/learn/courses?is_free=true"
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {freeCourses.map((course, idx) => (
                <CourseCard key={course.id} course={course} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Learning Features - 全宽背景 */}
      <section className="bg-white border-y border-stone-200">
        <div className="container mx-auto px-4 lg:px-6 py-10">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-stone-800 mb-2">为什么选择我们的学习系统</h2>
            <p className="text-base text-stone-500">一站式公务员考试学习平台</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: "体系化学习",
                description: "从基础到进阶，知识点全覆盖",
              },
              {
                icon: TrendingUp,
                title: "智能进度追踪",
                description: "实时记录学习进度，掌握状态",
              },
              {
                icon: Sparkles,
                title: "AI 辅助学习",
                description: "智能分析薄弱点，个性化推荐",
              },
              {
                icon: Trophy,
                title: "真题实战",
                description: "历年真题练习，模拟真实考试",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group text-center p-5 rounded-2xl hover:bg-amber-50 transition-colors"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-colors">
                  <feature.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-stone-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-stone-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 lg:px-6 py-10">
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-10 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-5 left-5 w-24 h-24 border-2 border-white rounded-full" />
            <div className="absolute bottom-5 right-5 w-16 h-16 border-2 border-white rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-4">
              {isAuthenticated ? "继续您的备考之旅" : "开始您的备考之旅"}
            </h2>
            <p className="text-base text-amber-100 mb-6 max-w-lg mx-auto">
              {isAuthenticated
                ? "查看学习进度，继续完成课程，向上岸目标迈进"
                : "注册账号完善个人信息，解锁完整学习功能，获取个性化推荐"}
            </p>
            <div className="flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/learn/plan"
                    className="px-8 py-3 bg-white text-amber-600 text-base font-semibold rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
                  >
                    学习计划
                  </Link>
                  <Link
                    href="/learn/practice"
                    className="px-8 py-3 bg-amber-600 text-white text-base font-semibold rounded-xl border-2 border-white/30 hover:bg-amber-700 transition-colors flex items-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    开始练习
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="px-8 py-3 bg-white text-amber-600 text-base font-semibold rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
                  >
                    免费注册
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-3 bg-amber-600 text-white text-base font-semibold rounded-xl border-2 border-white/30 hover:bg-amber-700 transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    立即登录
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
