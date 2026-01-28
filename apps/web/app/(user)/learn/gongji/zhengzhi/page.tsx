"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Star,
  Clock,
  Target,
  CheckCircle2,
  Loader2,
  Play,
  FileText,
  Lightbulb,
  Bookmark,
  TrendingUp,
  Sparkles,
  GraduationCap,
  History,
  Users,
  Building,
} from "lucide-react";
import { useCourses, formatDuration, getDifficultyLabel, getDifficultyColor } from "@/hooks/useCourse";
import { CourseBrief } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";

// 政治理论知识体系
const knowledgeSystem = [
  {
    id: "maxism-philosophy",
    name: "马克思主义哲学",
    icon: Lightbulb,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    importance: 5,
    frequency: "high",
    expanded: true,
    children: [
      {
        id: "materialism",
        name: "唯物论",
        description: "物质与意识的关系",
        points: ["物质的定义与特征", "意识的本质与能动性", "物质与意识的辩证关系", "世界的物质统一性"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "dialectics",
        name: "辩证法",
        description: "联系、发展、矛盾的观点",
        points: ["联系的普遍性与客观性", "发展的实质", "对立统一规律", "量变质变规律", "否定之否定规律"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "epistemology",
        name: "认识论",
        description: "实践与认识的关系",
        points: ["实践是认识的基础", "认识的本质", "真理的客观性", "认识过程的反复性"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "historical-materialism",
        name: "唯物史观",
        description: "社会存在与社会意识",
        points: ["社会存在决定社会意识", "生产力与生产关系", "经济基础与上层建筑", "人民群众是历史创造者"],
        frequency: "medium",
        importance: 4,
      },
    ],
  },
  {
    id: "mao-thought",
    name: "毛泽东思想",
    icon: History,
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    importance: 4,
    frequency: "medium",
    expanded: false,
    children: [
      {
        id: "mao-formation",
        name: "形成与发展",
        description: "毛泽东思想的历史过程",
        points: ["萌芽时期（1921-1927）", "形成时期（1927-1935）", "成熟时期（1935-1945）", "发展时期（1945-1976）"],
        frequency: "low",
        importance: 3,
      },
      {
        id: "mao-content",
        name: "主要内容",
        description: "毛泽东思想的核心理论",
        points: ["新民主主义革命理论", "社会主义革命和建设理论", "革命军队建设理论", "党的建设理论"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "mao-soul",
        name: "活的灵魂",
        description: "毛泽东思想的精髓",
        points: ["实事求是", "群众路线", "独立自主"],
        frequency: "high",
        importance: 5,
      },
    ],
  },
  {
    id: "socialism-theory",
    name: "中国特色社会主义理论体系",
    icon: Building,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    importance: 5,
    frequency: "high",
    expanded: false,
    children: [
      {
        id: "deng-theory",
        name: "邓小平理论",
        description: "建设中国特色社会主义",
        points: ["解放思想、实事求是", "社会主义初级阶段论", "社会主义市场经济理论", "一国两制"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "three-represents",
        name: ""三个代表"重要思想",
        description: "党的先进性建设",
        points: ["先进生产力发展要求", "先进文化前进方向", "最广大人民根本利益"],
        frequency: "low",
        importance: 3,
      },
      {
        id: "scientific-outlook",
        name: "科学发展观",
        description: "以人为本的发展理念",
        points: ["第一要义是发展", "核心是以人为本", "基本要求是全面协调可持续", "根本方法是统筹兼顾"],
        frequency: "medium",
        importance: 4,
      },
    ],
  },
  {
    id: "xi-thought",
    name: "习近平新时代中国特色社会主义思想",
    icon: Star,
    color: "bg-rose-500",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-600",
    importance: 5,
    frequency: "high",
    expanded: false,
    children: [
      {
        id: "xi-core",
        name: "核心要义",
        description: "新时代思想的精髓",
        points: ["坚持和发展中国特色社会主义", "实现中华民族伟大复兴的中国梦", "坚持以人民为中心"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "xi-content",
        name: "主要内容",
        description: ""十个明确"与"十四个坚持"",
        points: ["十个明确", "十四个坚持", "十三个方面成就", "六个必须坚持"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "xi-statements",
        name: "重要论述",
        description: "各领域重要思想",
        points: ["经济思想", "法治思想", "生态文明思想", "强军思想", "外交思想"],
        frequency: "high",
        importance: 5,
      },
    ],
  },
  {
    id: "party-history",
    name: "党史党建",
    icon: Users,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    importance: 4,
    frequency: "high",
    expanded: false,
    children: [
      {
        id: "party-history-detail",
        name: "党的历史",
        description: "中国共产党百年奋斗历程",
        points: ["建党时期（1921-1949）", "建设时期（1949-1978）", "改革开放时期（1978-2012）", "新时代（2012-至今）"],
        frequency: "high",
        importance: 4,
      },
      {
        id: "party-building",
        name: "党的建设",
        description: "全面从严治党",
        points: ["政治建设", "思想建设", "组织建设", "作风建设", "纪律建设", "制度建设"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "important-meetings",
        name: "重要会议",
        description: "党的重要历史会议",
        points: ["一大到二十大", "三中全会", "七大、七届二中全会", "十一届三中全会", "十八大、十九大、二十大"],
        frequency: "high",
        importance: 5,
      },
    ],
  },
];

// 高频考点
const hotPoints = [
  { name: "对立统一规律", count: 56, trend: "up" },
  { name: "习近平新时代思想", count: 48, trend: "up" },
  { name: "实事求是思想路线", count: 42, trend: "stable" },
  { name: "党的二十大精神", count: 38, trend: "up" },
  { name: "社会主义核心价值观", count: 35, trend: "stable" },
  { name: "物质与意识关系", count: 32, trend: "down" },
];

// 知识点节点组件
function KnowledgeNode({
  node,
  level = 0,
}: {
  node: typeof knowledgeSystem[0];
  level?: number;
}) {
  const [expanded, setExpanded] = useState(node.expanded ?? false);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = node.icon;

  const frequencyColors: Record<string, string> = {
    high: "text-red-500 bg-red-50",
    medium: "text-amber-500 bg-amber-50",
    low: "text-stone-400 bg-stone-50",
  };

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors ${
          expanded ? "bg-white shadow-card" : "bg-white/50 hover:bg-white"
        }`}
      >
        <div className={`w-10 h-10 rounded-lg ${node.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${node.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-800">{node.name}</h3>
            <span className={`px-1.5 py-0.5 text-xs rounded ${frequencyColors[node.frequency]}`}>
              {node.frequency === "high" ? "高频" : node.frequency === "medium" ? "中频" : "低频"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-amber-500">
              {"★".repeat(node.importance)}{"☆".repeat(5 - node.importance)}
            </span>
            <span className="text-xs text-stone-400">{node.children?.length || 0}个知识模块</span>
          </div>
        </div>
        {hasChildren && (
          <ChevronDown
            className={`w-5 h-5 text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {hasChildren && expanded && (
        <div className="mt-2 pl-4 space-y-2">
          {node.children!.map((child) => (
            <ChildNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// 子知识点组件
function ChildNode({ node }: { node: typeof knowledgeSystem[0]["children"][0] }) {
  const [expanded, setExpanded] = useState(false);

  const frequencyColors: Record<string, string> = {
    high: "text-red-500 bg-red-50",
    medium: "text-amber-500 bg-amber-50",
    low: "text-stone-400 bg-stone-50",
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-stone-50 transition-colors"
      >
        <FileText className="w-4 h-4 text-stone-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-700">{node.name}</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded ${frequencyColors[node.frequency]}`}>
              {node.frequency === "high" ? "高频" : node.frequency === "medium" ? "中频" : "低频"}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{node.description}</p>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-stone-400 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-3 pb-3">
          <div className="pt-2 border-t border-stone-100">
            <p className="text-xs text-stone-500 mb-2">核心考点：</p>
            <div className="flex flex-wrap gap-1.5">
              {node.points.map((point, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded hover:bg-amber-50 hover:text-amber-600 cursor-pointer transition-colors"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
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
      <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
        {course.cover_image ? (
          <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-stone-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-stone-800 group-hover:text-amber-600 transition-colors truncate text-sm">
          {course.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500">
          <span>{course.chapter_count}章节</span>
          <span>·</span>
          <span>{course.study_count}人学习</span>
        </div>
      </div>
      <div className="flex items-center">
        <Play className="w-4 h-4 text-amber-500" />
      </div>
    </Link>
  );
}

export default function ZhengzhiPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading: coursesLoading, fetchCourses } = useCourses();
  const [courses, setCourses] = useState<CourseBrief[]>([]);

  // 加载政治理论相关课程
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await fetchCourses({
          subject: "gongji",
          keyword: "政治",
          page: 1,
          page_size: 6,
          order_by: "popular",
        });
        setCourses(result.courses || []);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    };
    loadCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-500 via-rose-500 to-red-600 text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Link
            href="/learn/gongji"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回公基学习
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">政治理论</h1>
              <p className="text-white/80">马克思主义哲学 · 中国特色社会主义理论体系</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="font-semibold">5</span>
              <span className="text-white/80">大知识板块</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">320+</span>
              <span className="text-white/80">核心考点</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="font-semibold">重要程度</span>
              <span className="text-white/80">★★★★★</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Knowledge System */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-red-500" />
                  知识体系
                </h2>
              </div>
              <div className="space-y-2">
                {knowledgeSystem.map((node) => (
                  <KnowledgeNode key={node.id} node={node} />
                ))}
              </div>
            </section>

            {/* Study Tips */}
            <section>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500" />
                  政治理论学习建议
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">理解为主，记忆为辅</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        马哲部分重在理解原理，不要死记硬背，要能举一反三
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">关注时政热点</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        习近平新时代思想常与时政结合出题，需关注最新论述
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">掌握辩证法三大规律</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        对立统一、量变质变、否定之否定是高频考点
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">重视党史学习</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        重要会议、历史事件、时间节点都是常考内容
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            {/* Hot Points */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  高频考点
                </h3>
              </div>
              <div className="space-y-2">
                {hotPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      idx < 3 ? "bg-red-100 text-red-600" : "bg-stone-100 text-stone-600"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm text-stone-700">{point.name}</span>
                    <span className="text-xs text-stone-400">{point.count}题</span>
                    {point.trend === "up" && (
                      <TrendingUp className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Related Courses */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-red-500" />
                  相关课程
                </h3>
              </div>

              {coursesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              ) : courses.length > 0 ? (
                <div className="space-y-2">
                  {courses.slice(0, 4).map((course, idx) => (
                    <CourseCard key={course.id} course={course} index={idx} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500 text-center py-4">暂无相关课程</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-5 text-white">
              <h3 className="font-semibold mb-4">开始学习</h3>
              <div className="space-y-3">
                <Link
                  href="/learn/gongji"
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span className="flex-1">从头开始学习</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/learn/practice"
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Target className="w-5 h-5" />
                  <span className="flex-1">专项练习</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/learn/mistakes"
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Bookmark className="w-5 h-5" />
                  <span className="flex-1">错题回顾</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
