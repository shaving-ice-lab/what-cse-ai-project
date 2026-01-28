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
} from "lucide-react";
import { useCourses, useMyLearning, getSubjectName, getSubjectIcon, getSubjectColor, formatDuration, getDifficultyLabel, getDifficultyColor } from "@/hooks/useCourse";
import { useStreak } from "@/hooks/usePractice";
import { CourseBrief, UserCourseProgress } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";

// 科目配置
const subjects = [
  {
    id: "xingce",
    name: "行测",
    fullName: "行政职业能力测验",
    icon: "📊",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    description: "数量关系、判断推理、言语理解、资料分析、常识判断",
    features: ["逻辑推理", "数学运算", "言语理解"],
  },
  {
    id: "shenlun",
    name: "申论",
    fullName: "申论写作",
    icon: "📝",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    description: "归纳概括、提出对策、综合分析、贯彻执行、文章写作",
    features: ["材料分析", "对策提出", "大作文"],
  },
  {
    id: "mianshi",
    name: "面试",
    fullName: "结构化面试",
    icon: "🎤",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    description: "综合分析、计划组织、人际关系、应急应变、自我认知",
    features: ["综合分析", "情景应变", "表达技巧"],
  },
  {
    id: "gongji",
    name: "公基",
    fullName: "公共基础知识",
    icon: "📚",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    description: "政治理论、法律知识、经济常识、管理知识、公文写作",
    features: ["法律常识", "政治理论", "时事热点"],
  },
];

// 科目入口卡片
function SubjectCard({ subject, index }: { subject: typeof subjects[0]; index: number }) {
  return (
    <Link
      href={`/learn/${subject.id}`}
      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`} />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative p-6 text-white">
        {/* Icon & Name */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{subject.icon}</span>
          <div>
            <h3 className="text-xl font-bold">{subject.name}</h3>
            <p className="text-sm text-white/80">{subject.fullName}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/80 mb-4 line-clamp-2">{subject.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {subject.features.map((feature, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs bg-white/20 rounded-lg backdrop-blur-sm"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Action */}
        <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
          <span>开始学习</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full" />
    </Link>
  );
}

// 课程卡片组件
function CourseCard({ course, index }: { course: CourseBrief; index: number }) {
  return (
    <Link
      href={`/learn/course/${course.id}`}
      className="group block bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Cover Image */}
      <div className="relative aspect-video bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
        {course.cover_image ? (
          <img
            src={course.cover_image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-stone-400" />
          </div>
        )}
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(course.duration_minutes)}
        </div>

        {/* Free/VIP Badge */}
        {course.is_free ? (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-lg">
            免费
          </div>
        ) : course.vip_only ? (
          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
            <Star className="w-3 h-3" />
            VIP
          </div>
        ) : null}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-stone-800 ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Difficulty */}
        <div className="flex items-center gap-2 mb-2">
          {course.category && (
            <span className="text-xs text-stone-500">{course.category.name}</span>
          )}
          <span className={`px-2 py-0.5 text-xs rounded ${getDifficultyColor(course.difficulty)}`}>
            {getDifficultyLabel(course.difficulty)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" />
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

  return (
    <Link
      href={`/learn/course/${course.id}`}
      className="group flex gap-4 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-card-hover transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
        {course.cover_image ? (
          <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-stone-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-stone-800 group-hover:text-amber-600 transition-colors truncate">
          {course.title}
        </h4>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <span className="text-xs text-stone-500">{Math.round(progress.progress)}%</span>
        </div>
      </div>

      {/* Continue button */}
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
          <Play className="w-5 h-5 ml-0.5" />
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
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-6 text-white transition-all hover:shadow-xl hover:scale-[1.01]"
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6" />
            <h3 className="text-xl font-bold">每日一练</h3>
            {streak?.today_completed && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                已打卡 ✓
              </span>
            )}
          </div>
          <p className="text-white/90 text-sm mb-4">
            每天10道精选题目，智能推送你的薄弱点
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              <span className="font-semibold">{streak?.current_streak || 0}</span>
              <span className="text-white/80">连续打卡</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              <span className="font-semibold">{streak?.total_questions || 0}</span>
              <span className="text-white/80">累计做题</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">{Math.round(streak?.avg_correct_rate || 0)}%</span>
              <span className="text-white/80">正确率</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            {streak?.today_completed ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </div>
        </div>
      </div>
      
      {/* 装饰元素 */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
      <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full" />
    </Link>
  );
}

// 快捷入口
const quickActions = [
  { icon: Target, label: "学习计划", href: "/learn/plan", color: "text-amber-600 bg-amber-50" },
  { icon: TrendingUp, label: "学习统计", href: "/learn/stats", color: "text-blue-600 bg-blue-50" },
  { icon: BookMarked, label: "我的收藏", href: "/learn/favorites", color: "text-purple-600 bg-purple-50" },
  { icon: FileText, label: "错题回顾", href: "/learn/mistakes", color: "text-red-600 bg-red-50" },
];

export default function LearnPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading: coursesLoading, fetchFeaturedCourses, fetchFreeCourses } = useCourses();
  const { loading: learningLoading, recentCourses, fetchRecentLearning } = useMyLearning();
  const { streak, fetchStreak } = useStreak();

  const [featuredCourses, setFeaturedCourses] = useState<CourseBrief[]>([]);
  const [freeCourses, setFreeCourses] = useState<CourseBrief[]>([]);

  // 加载数据
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-8 lg:p-12 mb-10 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" />
              <span className="text-white/90 font-medium">公考学习中心</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              系统学习，高效备考
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mb-6">
              行测、申论、面试、公基四大科目全覆盖，从入门到精通，助你一举上岸
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold">1000+</span>
                <span className="text-white/80">精品课程</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span className="font-semibold">50万+</span>
                <span className="text-white/80">学员在学</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">85%</span>
                <span className="text-white/80">上岸率</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Daily Practice Banner - Logged in users */}
        {isAuthenticated && (
          <div className="mb-6">
            <DailyPracticeBanner streak={streak} />
          </div>
        )}

        {/* Quick Actions - Logged in users */}
        {isAuthenticated && (
          <div className="mb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Continue Learning - Logged in users */}
        {isAuthenticated && recentCourses.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                继续学习
              </h2>
              <Link
                href="/learn/my"
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid gap-4">
              {recentCourses.map((progress, idx) => (
                <ContinueLearningCard key={progress.id} progress={progress} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* Subject Entry Cards */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Library className="w-5 h-5 text-amber-500" />
              按科目学习
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((subject, idx) => (
              <SubjectCard key={subject.id} subject={subject} index={idx} />
            ))}
          </div>
        </section>

        {/* Featured Courses */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              热门课程
            </h2>
            <Link
              href="/learn/courses"
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
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
            <div className="text-center py-12 text-stone-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无推荐课程</p>
            </div>
          )}
        </section>

        {/* Free Courses */}
        {freeCourses.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                免费课程
              </h2>
              <Link
                href="/learn/courses?is_free=true"
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {freeCourses.map((course, idx) => (
                <CourseCard key={course.id} course={course} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* Learning Features */}
        <section className="mb-10">
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-8 lg:p-10">
            <h2 className="text-xl font-bold text-stone-800 mb-6 text-center">
              为什么选择我们的学习系统？
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Target,
                  title: "体系化学习",
                  description: "从基础到进阶，知识点全覆盖",
                },
                {
                  icon: TrendingUp,
                  title: "智能进度追踪",
                  description: "实时记录学习进度，掌握学习状态",
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
                <div key={idx} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-stone-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA for non-logged in users */}
        {!isAuthenticated && (
          <section className="text-center py-10">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">
              开始你的备考之旅
            </h2>
            <p className="text-stone-500 mb-6 max-w-lg mx-auto">
              注册账号，解锁完整学习功能，追踪学习进度，获取个性化推荐
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
            >
              立即登录
              <ArrowRight className="w-5 h-5" />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
