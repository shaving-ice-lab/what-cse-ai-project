"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Star,
  Clock,
  Target,
  CheckCircle2,
  Loader2,
  Play,
  Lightbulb,
  Bookmark,
  TrendingUp,
  Sparkles,
  GraduationCap,
  ScrollText,
  PenTool,
  Layout,
  Folder,
  ListChecks,
  FileCheck,
  Stamp,
  AlertTriangle,
  Eye,
  Copy,
} from "lucide-react";
import { useCourses, formatDuration, getDifficultyLabel, getDifficultyColor } from "@/hooks/useCourse";
import { CourseBrief } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";

// 公文写作知识体系
const knowledgeSystem = [
  {
    id: "gongwen-overview",
    name: "公文概述",
    icon: BookOpen,
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    importance: 4,
    frequency: "medium",
    expanded: true,
    children: [
      {
        id: "gongwen-concept",
        name: "公文的概念与特点",
        description: "党政机关公文的基本认识",
        points: ["公文的定义", "公文的特点（法定作者、法定效力、特定体式、规范程序）", "公文与其他文书的区别"],
        frequency: "medium",
        importance: 3,
      },
      {
        id: "gongwen-classification",
        name: "公文的分类",
        description: "公文的分类标准",
        points: ["按行文方向（上行文、平行文、下行文）", "按紧急程度", "按秘密等级", "按使用范围", "法定公文15种"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "gongwen-function",
        name: "公文的作用",
        description: "公文在行政管理中的作用",
        points: ["颁布法规、传达政策", "请示与批复", "汇报与交流", "联系与商洽", "记载与凭证"],
        frequency: "low",
        importance: 3,
      },
    ],
  },
  {
    id: "gongwen-format",
    name: "公文格式",
    icon: Layout,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    importance: 5,
    frequency: "high",
    expanded: false,
    children: [
      {
        id: "format-header",
        name: "眉首部分",
        description: "公文首页红色反线以上部分",
        points: ["份号", "密级和保密期限", "紧急程度", "发文机关标志", "发文字号", "签发人"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "format-body",
        name: "主体部分",
        description: "公文的核心内容",
        points: ["标题", "主送机关", "正文", "附件说明", "发文机关署名", "成文日期", "印章", "附注", "附件"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "format-footer",
        name: "版记部分",
        description: "公文最后一页的内容",
        points: ["抄送机关", "印发机关和印发日期", "页码"],
        frequency: "medium",
        importance: 4,
      },
    ],
  },
  {
    id: "common-types",
    name: "常用文种",
    icon: Folder,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    importance: 5,
    frequency: "high",
    expanded: false,
    children: [
      {
        id: "type-decision",
        name: "决定",
        description: "对重要事项作出决策和部署",
        points: ["适用范围", "行文方向", "结构特点", "语言特点", "写作要求"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "type-announcement",
        name: "公告/通告",
        description: "向公众宣布重要事项或周知事项",
        points: ["公告的适用范围", "通告的适用范围", "公告与通告的区别", "写作要求"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "type-notice",
        name: "通知",
        description: "发布规章、传达事项、任免人员",
        points: ["批转/转发性通知", "传达/布置性通知", "任免通知", "会议通知", "写作要点"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "type-circular",
        name: "通报",
        description: "表彰先进、批评错误、传达情况",
        points: ["表彰性通报", "批评性通报", "情况通报", "写作要点"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "type-report",
        name: "报告",
        description: "向上级机关汇报工作",
        points: ["工作报告", "情况报告", "答复报告", "报送报告", "写作要点", "与请示的区别"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "type-request",
        name: "请示",
        description: "向上级机关请求指示、批准",
        points: ["请求指示的请示", "请求批准的请示", "请示的特点", "写作要点", "与报告的区别"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "type-reply",
        name: "批复",
        description: "答复下级机关请示事项",
        points: ["批复的特点", "批复的结构", "写作要点"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "type-opinion",
        name: "意见",
        description: "对重要问题提出见解和处理办法",
        points: ["上行意见", "下行意见", "平行意见", "写作要点"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "type-letter",
        name: "函",
        description: "不相隶属机关之间商洽工作",
        points: ["商洽函", "询问函", "答复函", "请批函", "告知函", "写作要点"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "type-minutes",
        name: "纪要",
        description: "记载会议主要情况和议定事项",
        points: ["会议纪要的特点", "结构要素", "写作要点"],
        frequency: "medium",
        importance: 4,
      },
    ],
  },
  {
    id: "gongwen-processing",
    name: "公文处理",
    icon: FileCheck,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    importance: 4,
    frequency: "medium",
    expanded: false,
    children: [
      {
        id: "processing-receive",
        name: "收文处理",
        description: "收到公文后的处理程序",
        points: ["签收", "登记", "初审", "承办", "传阅", "催办", "答复"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "processing-send",
        name: "发文处理",
        description: "制发公文的处理程序",
        points: ["复核", "登记", "印制", "核发"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "processing-archive",
        name: "公文归档",
        description: "公文办理完毕后的处理",
        points: ["归档范围", "归档要求", "归档时间", "整理方法"],
        frequency: "low",
        importance: 3,
      },
    ],
  },
];

// 高频考点
const hotPoints = [
  { name: "法定公文15种", count: 45, trend: "up" },
  { name: "请示与报告的区别", count: 42, trend: "stable" },
  { name: "公文格式要素", count: 38, trend: "up" },
  { name: "通知的种类", count: 35, trend: "stable" },
  { name: "发文字号构成", count: 32, trend: "up" },
  { name: "行文规则", count: 28, trend: "stable" },
];

// 15种法定公文
const legalDocuments = [
  { name: "决议", direction: "下行", description: "会议讨论通过的重大决策事项" },
  { name: "决定", direction: "下行", description: "对重要事项作出决策和部署" },
  { name: "命令（令）", direction: "下行", description: "公布规章、嘉奖有关单位或人员" },
  { name: "公报", direction: "下行", description: "公布重要决定或重大事项" },
  { name: "公告", direction: "下行", description: "向国内外宣布重要事项" },
  { name: "通告", direction: "下行", description: "在一定范围内公布事项" },
  { name: "意见", direction: "多向", description: "对重要问题提出见解和处理办法" },
  { name: "通知", direction: "下行", description: "发布规章、传达事项、任免人员" },
  { name: "通报", direction: "下行", description: "表彰先进、批评错误、传达情况" },
  { name: "报告", direction: "上行", description: "向上级机关汇报工作、反映情况" },
  { name: "请示", direction: "上行", description: "向上级机关请求指示、批准" },
  { name: "批复", direction: "下行", description: "答复下级机关的请示事项" },
  { name: "议案", direction: "上行", description: "各级人民政府提请同级人大审议" },
  { name: "函", direction: "平行", description: "不相隶属机关之间商洽工作" },
  { name: "纪要", direction: "多向", description: "记载会议主要情况和议定事项" },
];

// 公文格式示例
const formatExample = {
  title: "关于×××的通知",
  number: "国发〔2024〕1号",
  parts: [
    { name: "份号", desc: "公文印制份数的顺序号" },
    { name: "密级和保密期限", desc: "如：机密★1年" },
    { name: "紧急程度", desc: "特急、加急" },
    { name: "发文机关标志", desc: "发文机关全称或规范化简称" },
    { name: "发文字号", desc: "机关代字+年份+序号" },
    { name: "签发人", desc: "上行文必须标注" },
    { name: "标题", desc: "发文机关+事由+文种" },
    { name: "主送机关", desc: "公文的主要受理机关" },
    { name: "正文", desc: "公文的主体内容" },
    { name: "附件说明", desc: "如：附件：1.×××" },
    { name: "发文机关署名", desc: "发文机关全称或规范化简称" },
    { name: "成文日期", desc: "领导签发日期" },
    { name: "印章", desc: "发文机关印章" },
    { name: "附注", desc: "需要说明的其他事项" },
  ],
};

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

export default function GongwenPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading: coursesLoading, fetchCourses } = useCourses();
  const [courses, setCourses] = useState<CourseBrief[]>([]);
  const [showAllDocs, setShowAllDocs] = useState(false);

  // 加载公文写作相关课程
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await fetchCourses({
          subject: "gongji",
          keyword: "公文",
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

  const displayedDocs = showAllDocs ? legalDocuments : legalDocuments.slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white">
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
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">公文写作</h1>
              <p className="text-white/80">公文格式 · 法定文种 · 写作规范</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="font-semibold">15</span>
              <span className="text-white/80">种法定公文</span>
            </div>
            <div className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              <span className="font-semibold">200+</span>
              <span className="text-white/80">核心考点</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="font-semibold">重要程度</span>
              <span className="text-white/80">★★★★☆</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* 15种法定公文速查 */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Stamp className="w-5 h-5 text-amber-500" />
                  15种法定公文速查
                </h2>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-100">
                  {displayedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white hover:bg-amber-50/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-stone-800">{doc.name}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] rounded ${
                          doc.direction === "上行" ? "bg-green-100 text-green-600" :
                          doc.direction === "下行" ? "bg-blue-100 text-blue-600" :
                          "bg-purple-100 text-purple-600"
                        }`}>
                          {doc.direction}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500">{doc.description}</p>
                    </div>
                  ))}
                </div>
                {!showAllDocs && legalDocuments.length > 8 && (
                  <button
                    onClick={() => setShowAllDocs(true)}
                    className="w-full py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    展开全部 {legalDocuments.length} 种公文
                  </button>
                )}
              </div>
            </section>

            {/* Knowledge System */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
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
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  公文写作学习建议
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">熟记15种法定公文</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        每种公文的适用范围、行文方向是必考内容
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">掌握公文格式要素</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        发文字号、标题、正文结构等格式细节常考
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">区分易混淆文种</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        请示与报告、公告与通告、通知与通报的区别
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">了解行文规则</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        逐级行文、多头主送等行文规则需掌握
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
                  <TrendingUp className="w-4 h-4 text-amber-500" />
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
                      idx < 3 ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-600"
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

            {/* Format Quick Reference */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-amber-500" />
                  公文格式速查
                </h3>
              </div>
              <div className="space-y-2">
                {formatExample.parts.slice(0, 6).map((part, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50"
                  >
                    <span className="w-5 h-5 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-stone-700">{part.name}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                查看完整格式
              </button>
            </div>

            {/* Related Courses */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  相关课程
                </h3>
              </div>

              {coursesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
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
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
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
                  <span className="flex-1">公文专项练习</span>
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
