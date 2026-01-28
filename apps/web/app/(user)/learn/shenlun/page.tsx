"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Clock,
  Star,
  ChevronRight,
  ArrowLeft,
  FileText,
  PenTool,
  Target,
  Lightbulb,
  Award,
  TrendingUp,
  Sparkles,
  Play,
  BookMarked,
  Flame,
  Zap,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ScrollText,
  MessageSquare,
  Edit3,
  Newspaper,
} from "lucide-react";
import { useCourses, formatDuration, getDifficultyLabel, getDifficultyColor } from "@/hooks/useCourse";
import { CourseBrief } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";

// 申论题型专题配置
const shenlunTopics = [
  {
    id: "guina",
    name: "归纳概括",
    fullName: "归纳概括题",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    description: "概括问题、原因、做法、特点、影响等",
    features: ["问题概括", "原因分析", "要点提取"],
    difficulty: "基础",
    progress: 0,
    questionCount: 120,
  },
  {
    id: "duice",
    name: "提出对策",
    fullName: "提出对策题",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    description: "针对问题提出切实可行的解决措施",
    features: ["直接对策", "间接对策", "经验借鉴"],
    difficulty: "进阶",
    progress: 0,
    questionCount: 85,
  },
  {
    id: "fenxi",
    name: "综合分析",
    fullName: "综合分析题",
    icon: TrendingUp,
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    description: "解释型、评价型、比较型等综合分析",
    features: ["解释分析", "评价分析", "启示分析"],
    difficulty: "进阶",
    progress: 0,
    questionCount: 95,
  },
  {
    id: "guanche",
    name: "贯彻执行",
    fullName: "贯彻执行题",
    icon: ScrollText,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    description: "各类公文写作、应用文书",
    features: ["讲话稿", "倡议书", "调研报告"],
    difficulty: "高级",
    progress: 0,
    questionCount: 150,
  },
  {
    id: "xiezuo",
    name: "文章写作",
    fullName: "申论大作文",
    icon: Edit3,
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    description: "议论文写作，立意、结构、论证",
    features: ["立意技巧", "框架结构", "论证方法"],
    difficulty: "高级",
    progress: 0,
    questionCount: 80,
  },
];

// 热点专题配置
const hotTopics = [
  {
    id: "digital-economy",
    title: "数字经济与数字政府",
    description: "数字化转型、智慧城市、数据安全",
    updateTime: "2026-01",
    articleCount: 15,
    icon: "💻",
  },
  {
    id: "rural-vitalization",
    title: "乡村振兴战略",
    description: "产业振兴、人才振兴、文化振兴",
    updateTime: "2026-01",
    articleCount: 18,
    icon: "🌾",
  },
  {
    id: "green-development",
    title: "绿色发展与双碳目标",
    description: "碳达峰碳中和、生态文明建设",
    updateTime: "2026-01",
    articleCount: 12,
    icon: "🌱",
  },
  {
    id: "common-prosperity",
    title: "共同富裕",
    description: "收入分配、社会保障、公共服务",
    updateTime: "2025-12",
    articleCount: 14,
    icon: "🤝",
  },
];

// 范文精选配置
const essaySamples = [
  {
    id: 1,
    title: "以人民为中心推进城市治理现代化",
    source: "2025国考副省级",
    score: "一类文",
    tags: ["城市治理", "人民至上"],
  },
  {
    id: 2,
    title: "新时代青年的责任与担当",
    source: "2025国考地市级",
    score: "一类文",
    tags: ["青年成长", "使命担当"],
  },
  {
    id: 3,
    title: "科技创新驱动高质量发展",
    source: "2024浙江省考",
    score: "一类文",
    tags: ["科技创新", "高质量发展"],
  },
];

// 专题卡片组件
function TopicCard({ topic, index }: { topic: typeof shenlunTopics[0]; index: number }) {
  const Icon = topic.icon;
  
  return (
    <Link
      href={`/learn/shenlun/${topic.id}`}
      className="group relative overflow-hidden rounded-2xl bg-white border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* 顶部渐变条 */}
      <div className={`h-1.5 bg-gradient-to-r ${topic.color}`} />
      
      <div className="p-5">
        {/* 图标与标题 */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl ${topic.bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${topic.textColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-stone-800 group-hover:text-emerald-600 transition-colors">
              {topic.name}
            </h3>
            <p className="text-sm text-stone-500">{topic.fullName}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-lg ${topic.bgColor} ${topic.textColor}`}>
            {topic.difficulty}
          </span>
        </div>

        {/* 描述 */}
        <p className="text-sm text-stone-600 mb-4 line-clamp-2">{topic.description}</p>

        {/* 特点标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {topic.features.map((feature, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 text-xs rounded-lg ${topic.bgColor} ${topic.textColor} opacity-80`}
            >
              {feature}
            </span>
          ))}
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <span className="text-sm text-stone-500">
            <FileText className="w-4 h-4 inline mr-1" />
            {topic.questionCount} 道真题
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">
            开始学习 <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// 热点卡片组件
function HotTopicCard({ topic, index }: { topic: typeof hotTopics[0]; index: number }) {
  return (
    <Link
      href={`/learn/shenlun/hotspot/${topic.id}`}
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className="text-3xl">{topic.icon}</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors truncate">
          {topic.title}
        </h4>
        <p className="text-sm text-stone-500 truncate">{topic.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-stone-700">{topic.articleCount} 篇</p>
        <p className="text-xs text-stone-400">{topic.updateTime} 更新</p>
      </div>
      <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors" />
    </Link>
  );
}

// 范文卡片组件
function EssayCard({ essay, index }: { essay: typeof essaySamples[0]; index: number }) {
  return (
    <Link
      href={`/learn/shenlun/essay/${essay.id}`}
      className="group block p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors line-clamp-2 flex-1">
          {essay.title}
        </h4>
        <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded flex-shrink-0">
          {essay.score}
        </span>
      </div>
      <p className="text-sm text-stone-500 mb-3">{essay.source}</p>
      <div className="flex flex-wrap gap-2">
        {essay.tags.map((tag, idx) => (
          <span key={idx} className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded">
            {tag}
          </span>
        ))}
      </div>
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
            <PenTool className="w-12 h-12 text-emerald-400" />
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
        <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
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

// 学习方法指南
const studyTips = [
  {
    icon: Target,
    title: "审题是关键",
    description: "准确把握题目要求，明确作答对象和限制条件",
  },
  {
    icon: FileText,
    title: "材料是根本",
    description: "答案要点来源于材料，学会提取和加工信息",
  },
  {
    icon: Edit3,
    title: "结构要清晰",
    description: "答案层次分明，逻辑清楚，条理性强",
  },
  {
    icon: CheckCircle2,
    title: "字数要精准",
    description: "控制好字数，既要完整表达又不超限",
  },
];

export default function ShenlunHomePage() {
  const { isAuthenticated } = useAuthStore();
  const { loading: coursesLoading, fetchCourses } = useCourses();
  const [featuredCourses, setFeaturedCourses] = useState<CourseBrief[]>([]);

  // 加载推荐课程
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await fetchCourses({
          subject: "shenlun",
          page: 1,
          page_size: 4,
          order_by: "popular",
        });
        setFeaturedCourses(result.list || []);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };
    loadCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 返回导航 */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回学习中心
        </Link>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 lg:p-12 mb-10 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">📝</span>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold">申论</h1>
                <p className="text-white/80">申论写作与材料分析</p>
              </div>
            </div>
            <p className="text-lg text-white/90 max-w-2xl mb-6">
              申论是公务员考试的重要科目，考察阅读理解、综合分析、提出问题与解决问题以及文字表达能力。
              系统学习五大题型，掌握答题技巧，提升综合素质。
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">530+</span>
                <span className="text-white/80">真题解析</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold">200+</span>
                <span className="text-white/80">精品课程</span>
              </div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                <span className="font-semibold">100+</span>
                <span className="text-white/80">高分范文</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* 题型专题导航 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              题型专题
            </h2>
            <span className="text-sm text-stone-500">掌握五大题型，系统提升</span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shenlunTopics.map((topic, idx) => (
              <TopicCard key={topic.id} topic={topic} index={idx} />
            ))}
          </div>
        </section>

        {/* 学习方法指南 */}
        <section className="mb-10">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 lg:p-8 border border-emerald-100">
            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              申论答题要领
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {studyTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-5 border border-emerald-100 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                    <tip.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-2">{tip.title}</h3>
                  <p className="text-sm text-stone-500">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* 热点专题 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                热点专题
              </h2>
              <Link
                href="/learn/shenlun/hotspot"
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {hotTopics.map((topic, idx) => (
                <HotTopicCard key={topic.id} topic={topic} index={idx} />
              ))}
            </div>
          </section>

          {/* 范文精选 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                范文精选
              </h2>
              <Link
                href="/learn/shenlun/essay"
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {essaySamples.map((essay, idx) => (
                <EssayCard key={essay.id} essay={essay} index={idx} />
              ))}
            </div>
          </section>
        </div>

        {/* 推荐课程 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
              推荐课程
            </h2>
            <Link
              href="/learn/shenlun"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCourses.map((course, idx) => (
                <CourseCard key={course.id} course={course} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500 bg-white rounded-2xl border border-stone-200/50">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无推荐课程</p>
            </div>
          )}
        </section>

        {/* 快速入口 */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">快速入口</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/learn/shenlun/practice"
                className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <Zap className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-stone-800 group-hover:text-blue-700">每日一练</p>
                  <p className="text-sm text-stone-500">限时训练</p>
                </div>
              </Link>
              <Link
                href="/learn/shenlun/real-exam"
                className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group"
              >
                <FileText className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-medium text-stone-800 group-hover:text-emerald-700">真题库</p>
                  <p className="text-sm text-stone-500">历年真题</p>
                </div>
              </Link>
              <Link
                href="/learn/shenlun/essay"
                className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group"
              >
                <Award className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-medium text-stone-800 group-hover:text-amber-700">范文库</p>
                  <p className="text-sm text-stone-500">高分范文</p>
                </div>
              </Link>
              <Link
                href="/learn/shenlun/materials"
                className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group"
              >
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-stone-800 group-hover:text-purple-700">素材库</p>
                  <p className="text-sm text-stone-500">名言金句</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        {!isAuthenticated && (
          <section className="text-center py-10">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">
              开始你的申论学习之旅
            </h2>
            <p className="text-stone-500 mb-6 max-w-lg mx-auto">
              登录后可追踪学习进度，获取个性化推荐，解锁更多学习资源
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
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
