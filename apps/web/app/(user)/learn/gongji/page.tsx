"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Scale,
  Building2,
  FileText,
  Globe,
  Landmark,
  History,
  Newspaper,
  ChevronRight,
  Loader2,
  TrendingUp,
  ArrowLeft,
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  Star,
  Lightbulb,
  Calendar,
  Zap,
  BookMarked,
  Play,
  Trophy,
  GraduationCap,
} from "lucide-react";
import { useCourses, useMyLearning, formatDuration, getDifficultyLabel, getDifficultyColor } from "@/hooks/useCourse";
import { CourseBrief, UserCourseProgress } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";

// 公基知识模块配置
const knowledgeModules = [
  {
    id: "zhengzhi",
    name: "政治理论",
    icon: Landmark,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    description: "马克思主义哲学、毛泽东思想、中国特色社会主义理论体系",
    topics: ["马哲唯物论", "辩证法", "毛泽东思想", "习近平新时代思想", "党史党建"],
    importance: 5,
    questionCount: 320,
    href: "/learn/gongji/zhengzhi",
  },
  {
    id: "falv",
    name: "法律知识",
    icon: Scale,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    description: "宪法、民法、刑法、行政法等法律基础知识",
    topics: ["宪法基本理论", "民法典", "刑法概论", "行政法与行政诉讼法", "其他法律"],
    importance: 5,
    questionCount: 450,
    href: "/learn/gongji/falv",
  },
  {
    id: "jingji",
    name: "经济知识",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    description: "微观经济学、宏观经济学、市场经济理论",
    topics: ["微观经济", "宏观经济", "市场经济", "国际贸易", "财政金融"],
    importance: 4,
    questionCount: 180,
    href: "/learn/gongji",
  },
  {
    id: "guanli",
    name: "管理知识",
    icon: Building2,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    iconColor: "text-violet-600",
    description: "行政管理、公共管理、组织管理基本理论",
    topics: ["行政管理", "公共管理", "组织理论", "人力资源管理", "决策理论"],
    importance: 3,
    questionCount: 150,
    href: "/learn/gongji",
  },
  {
    id: "gongwen",
    name: "公文写作",
    icon: FileText,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    description: "公文格式、常用文种、公文处理规范",
    topics: ["公文概述", "公文格式", "常用文种", "公文处理", "公文写作技巧"],
    importance: 4,
    questionCount: 200,
    href: "/learn/gongji/gongwen",
  },
  {
    id: "renwen",
    name: "人文历史",
    icon: History,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
    description: "中国历史、世界历史、文学艺术常识",
    topics: ["中国古代史", "中国近现代史", "世界史", "文学常识", "艺术常识"],
    importance: 3,
    questionCount: 280,
    href: "/learn/gongji",
  },
  {
    id: "keji",
    name: "科技地理",
    icon: Globe,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
    description: "科技常识、国情省情、地理知识",
    topics: ["科技前沿", "生活科技", "自然地理", "人文地理", "国情省情"],
    importance: 3,
    questionCount: 220,
    href: "/learn/gongji",
  },
  {
    id: "shishi",
    name: "时事政治",
    icon: Newspaper,
    color: "from-slate-600 to-slate-800",
    bgColor: "bg-slate-50",
    iconColor: "text-slate-600",
    description: "国内外时事热点、重要会议精神",
    topics: ["时政热点", "重要会议", "政策解读", "国际形势", "民生热点"],
    importance: 4,
    questionCount: 150,
    href: "/learn/gongji",
  },
];

// 每日知识点数据（模拟）
const dailyKnowledge = [
  {
    id: 1,
    title: "宪法修正案知识点",
    category: "法律知识",
    content: "2018年宪法修正案共21条，其中最重要的是...",
    isNew: true,
  },
  {
    id: 2,
    title: "唯物辩证法三大规律",
    category: "政治理论",
    content: "对立统一规律、量变质变规律、否定之否定规律",
    isNew: true,
  },
  {
    id: 3,
    title: "公文格式要求",
    category: "公文写作",
    content: "公文标题由发文机关名称、事由和文种组成",
    isNew: false,
  },
];

// 知识模块卡片
function ModuleCard({ module, index }: { module: typeof knowledgeModules[0]; index: number }) {
  const Icon = module.icon;
  
  return (
    <Link
      href={module.href}
      className="group relative overflow-hidden rounded-2xl bg-white border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Gradient top bar */}
      <div className={`h-1.5 bg-gradient-to-r ${module.color}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl ${module.bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${module.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-800 group-hover:text-amber-600 transition-colors">
              {module.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-amber-500">
                {"★".repeat(module.importance)}{"☆".repeat(5 - module.importance)}
              </span>
              <span className="text-xs text-stone-400">{module.questionCount}题</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-500 mb-4 line-clamp-2">{module.description}</p>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {module.topics.slice(0, 3).map((topic, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded"
            >
              {topic}
            </span>
          ))}
          {module.topics.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-400 rounded">
              +{module.topics.length - 3}
            </span>
          )}
        </div>

        {/* Action */}
        <div className="flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:gap-2 transition-all">
          <span>开始学习</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

// 每日知识点卡片
function DailyKnowledgeCard({ item, index }: { item: typeof dailyKnowledge[0]; index: number }) {
  return (
    <div
      className="flex gap-4 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
        <Lightbulb className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-stone-800">{item.title}</h4>
          {item.isNew && (
            <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded">NEW</span>
          )}
        </div>
        <span className="text-xs text-stone-400">{item.category}</span>
        <p className="text-sm text-stone-500 mt-1 line-clamp-2">{item.content}</p>
      </div>
    </div>
  );
}

// 进度概览卡片
function ProgressOverview() {
  // 模拟进度数据
  const progressData = {
    totalProgress: 35,
    todayStudyTime: 45,
    weekStudyTime: 280,
    completedModules: 2,
    totalModules: 8,
    streakDays: 7,
  };

  return (
    <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5" />
        <h3 className="font-semibold">学习进度</h3>
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progressData.totalProgress * 2.51} 251`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{progressData.totalProgress}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-white/80 mb-1">已完成模块</div>
          <div className="text-xl font-bold">
            {progressData.completedModules}/{progressData.totalModules}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1 text-white/80 text-xs mb-1">
            <Clock className="w-3 h-3" />
            今日
          </div>
          <div className="font-bold">{progressData.todayStudyTime}分钟</div>
        </div>
        <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1 text-white/80 text-xs mb-1">
            <Calendar className="w-3 h-3" />
            本周
          </div>
          <div className="font-bold">{Math.floor(progressData.weekStudyTime / 60)}小时</div>
        </div>
        <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1 text-white/80 text-xs mb-1">
            <Zap className="w-3 h-3" />
            连续
          </div>
          <div className="font-bold">{progressData.streakDays}天</div>
        </div>
      </div>
    </div>
  );
}

// 课程卡片
function CourseCard({ course, index }: { course: CourseBrief; index: number }) {
  return (
    <Link
      href={`/learn/course/${course.id}`}
      className="group flex gap-4 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all animate-fade-in"
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
        {course.is_free && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded">
            免费
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-stone-800 group-hover:text-amber-600 transition-colors truncate">
          {course.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500">
          <span className={`px-1.5 py-0.5 rounded ${getDifficultyColor(course.difficulty)}`}>
            {getDifficultyLabel(course.difficulty)}
          </span>
          <span>{course.chapter_count}章节</span>
          <span>{course.study_count}人学习</span>
        </div>
      </div>

      {/* Play */}
      <div className="flex items-center">
        <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
          <Play className="w-4 h-4 ml-0.5" />
        </div>
      </div>
    </Link>
  );
}

export default function GongjiLearnPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading: coursesLoading, fetchCourses } = useCourses();
  const { recentCourses, fetchRecentLearning } = useMyLearning();

  const [featuredCourses, setFeaturedCourses] = useState<CourseBrief[]>([]);

  // 加载公基课程
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await fetchCourses({
          subject: "gongji",
          page: 1,
          page_size: 6,
          order_by: "popular",
        });
        setFeaturedCourses(result.courses || []);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };
    loadCourses();
  }, [fetchCourses]);

  // 加载学习记录
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentLearning(3);
    }
  }, [isAuthenticated, fetchRecentLearning]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习中心
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-5xl">📚</span>
            <div>
              <h1 className="text-3xl font-bold">公共基础知识</h1>
              <p className="text-white/80">事业单位考试必备科目</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">8</span>
              <span className="text-white/80">大知识模块</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="font-semibold">1950+</span>
              <span className="text-white/80">核心考点</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <span className="font-semibold">50万+</span>
              <span className="text-white/80">学员在学</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Knowledge Modules */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-amber-500" />
                  知识模块导航
                </h2>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                {knowledgeModules.map((module, idx) => (
                  <ModuleCard key={module.id} module={module} index={idx} />
                ))}
              </div>
            </section>

            {/* Featured Courses */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  热门公基课程
                </h2>
                <Link
                  href="/learn/gongji/courses"
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
                <div className="grid md:grid-cols-2 gap-4">
                  {featuredCourses.map((course, idx) => (
                    <CourseCard key={course.id} course={course} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-stone-500 bg-white rounded-2xl border border-stone-200/50">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无课程</p>
                </div>
              )}
            </section>

            {/* Study Tips */}
            <section>
              <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-6">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  公基备考建议
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">法律知识是重点</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        法律部分占比最高，建议重点攻克宪法、民法典、刑法三大板块
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">政治理论是基础</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        马哲辩证法、习近平新时代思想常考，需要理解而非死记硬背
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">时政热点要关注</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        近一年的时政新闻、重要会议精神是常考内容
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">公文格式要牢记</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        公文写作部分考查细节，15种法定公文格式要熟练掌握
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            {/* Progress Overview - Only for logged in users */}
            {isAuthenticated && <ProgressOverview />}

            {/* Daily Knowledge */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  每日知识点
                </h3>
                <span className="text-xs text-stone-400">今日更新3条</span>
              </div>
              <div className="space-y-3">
                {dailyKnowledge.map((item, idx) => (
                  <DailyKnowledgeCard key={item.id} item={item} index={idx} />
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                查看更多知识点
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                快捷入口
              </h3>
              <div className="space-y-2">
                <Link
                  href="/learn/gongji/zhengzhi"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm text-stone-700">政治理论专题</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
                <Link
                  href="/learn/gongji/falv"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm text-stone-700">法律知识专题</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
                <Link
                  href="/learn/gongji/gongwen"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm text-stone-700">公文写作专题</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
