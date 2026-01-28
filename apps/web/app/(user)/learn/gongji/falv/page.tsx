"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
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
  ScrollText,
  Gavel,
  Shield,
  Building2,
  Users,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { useCourses, formatDuration, getDifficultyLabel, getDifficultyColor } from "@/hooks/useCourse";
import { CourseBrief } from "@/services/api/course";
import { useAuthStore } from "@/stores/authStore";

// 法律知识体系
const knowledgeSystem = [
  {
    id: "legal-theory",
    name: "法理学",
    icon: ScrollText,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
    importance: 4,
    frequency: "medium",
    expanded: true,
    children: [
      {
        id: "legal-concept",
        name: "法的概念与特征",
        description: "法的基本理论",
        points: ["法的定义", "法的特征", "法的作用", "法的分类", "法的渊源"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "legal-relation",
        name: "法律关系",
        description: "法律关系的构成",
        points: ["法律关系主体", "法律关系客体", "法律关系内容", "法律事实"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "legal-operation",
        name: "法的运行",
        description: "立法、执法、司法、守法",
        points: ["立法", "执法", "司法", "守法", "法律监督"],
        frequency: "low",
        importance: 3,
      },
    ],
  },
  {
    id: "constitution",
    name: "宪法",
    icon: Shield,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    importance: 5,
    frequency: "high",
    expanded: false,
    children: [
      {
        id: "constitution-theory",
        name: "宪法基本理论",
        description: "宪法的性质与地位",
        points: ["宪法的概念与特征", "宪法的基本原则", "宪法的历史发展", "宪法修改"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "national-system",
        name: "国家基本制度",
        description: "国家政治经济文化制度",
        points: ["人民民主专政制度", "人民代表大会制度", "选举制度", "民族区域自治制度", "基层群众自治制度"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "citizen-rights",
        name: "公民基本权利与义务",
        description: "公民的权利与义务",
        points: ["平等权", "政治权利和自由", "人身自由权", "社会经济权利", "文化教育权利", "监督权", "基本义务"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "state-organs",
        name: "国家机构",
        description: "国家机关的组织与职权",
        points: ["全国人大及其常委会", "国家主席", "国务院", "中央军委", "地方各级人大和政府", "监察委员会", "人民法院", "人民检察院"],
        frequency: "high",
        importance: 5,
      },
    ],
  },
  {
    id: "civil-law",
    name: "民法典",
    icon: Users,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    importance: 5,
    frequency: "high",
    expanded: false,
    children: [
      {
        id: "civil-general",
        name: "总则",
        description: "民事主体、民事权利",
        points: ["自然人", "法人", "非法人组织", "民事权利", "民事法律行为", "代理", "诉讼时效"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "property-rights",
        name: "物权",
        description: "所有权、用益物权、担保物权",
        points: ["所有权", "共有", "用益物权", "担保物权", "占有"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "contract",
        name: "合同",
        description: "合同的订立、效力、履行、违约",
        points: ["合同的订立", "合同的效力", "合同的履行", "合同的变更和转让", "合同的终止", "违约责任", "典型合同"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "personality-rights",
        name: "人格权",
        description: "生命权、健康权、名誉权等",
        points: ["一般规定", "生命权、身体权、健康权", "姓名权、名称权", "肖像权", "名誉权、荣誉权", "隐私权"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "marriage-family",
        name: "婚姻家庭",
        description: "结婚、离婚、家庭关系",
        points: ["结婚", "家庭关系", "离婚", "收养"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "inheritance",
        name: "继承",
        description: "法定继承、遗嘱继承",
        points: ["一般规定", "法定继承", "遗嘱继承和遗赠", "遗产的处理"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "tort-liability",
        name: "侵权责任",
        description: "侵权责任的认定与承担",
        points: ["一般规定", "损害赔偿", "责任主体", "产品责任", "机动车交通事故", "医疗损害", "高度危险责任"],
        frequency: "high",
        importance: 5,
      },
    ],
  },
  {
    id: "criminal-law",
    name: "刑法",
    icon: Gavel,
    color: "bg-slate-600",
    bgColor: "bg-slate-50",
    iconColor: "text-slate-600",
    importance: 5,
    frequency: "high",
    expanded: false,
    children: [
      {
        id: "crime-overview",
        name: "犯罪概述",
        description: "犯罪的概念与特征",
        points: ["犯罪的概念", "犯罪的特征", "犯罪的分类"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "crime-elements",
        name: "犯罪构成要件",
        description: "四要件理论",
        points: ["犯罪主体", "犯罪主观方面", "犯罪客体", "犯罪客观方面"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "crime-exclusion",
        name: "排除犯罪事由",
        description: "正当防卫、紧急避险",
        points: ["正当防卫", "紧急避险", "其他排除事由"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "punishment-types",
        name: "刑罚种类",
        description: "主刑与附加刑",
        points: ["主刑（管制、拘役、有期、无期、死刑）", "附加刑（罚金、剥夺政治权利、没收财产、驱逐出境）"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "common-crimes",
        name: "常见罪名",
        description: "常考刑法罪名",
        points: ["危害公共安全罪", "侵犯公民人身权利罪", "侵犯财产罪", "妨害社会管理秩序罪", "贪污贿赂罪", "渎职罪"],
        frequency: "high",
        importance: 5,
      },
    ],
  },
  {
    id: "administrative-law",
    name: "行政法",
    icon: Building2,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    importance: 5,
    frequency: "high",
    expanded: false,
    children: [
      {
        id: "admin-subject",
        name: "行政主体",
        description: "行政机关与授权组织",
        points: ["行政主体的概念", "行政机关", "被授权组织", "受委托组织", "公务员"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "admin-action",
        name: "行政行为",
        description: "具体行政行为类型",
        points: ["行政许可", "行政处罚", "行政强制", "行政征收", "行政裁决", "行政确认", "行政给付"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "admin-reconsideration",
        name: "行政复议",
        description: "行政复议程序",
        points: ["复议范围", "复议机关", "复议申请", "复议决定"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "admin-litigation",
        name: "行政诉讼",
        description: "民告官制度",
        points: ["受案范围", "管辖", "诉讼参加人", "证据", "审理与判决"],
        frequency: "high",
        importance: 5,
      },
      {
        id: "state-compensation",
        name: "国家赔偿",
        description: "行政赔偿与司法赔偿",
        points: ["行政赔偿", "司法赔偿", "赔偿方式与标准"],
        frequency: "medium",
        importance: 4,
      },
    ],
  },
  {
    id: "other-laws",
    name: "其他法律",
    icon: Briefcase,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    importance: 3,
    frequency: "medium",
    expanded: false,
    children: [
      {
        id: "labor-law",
        name: "劳动法与劳动合同法",
        description: "劳动关系法律规范",
        points: ["劳动合同的订立", "劳动合同的履行与变更", "劳动合同的解除与终止", "劳动争议处理"],
        frequency: "medium",
        importance: 4,
      },
      {
        id: "social-security",
        name: "社会保障法",
        description: "社会保险制度",
        points: ["养老保险", "医疗保险", "工伤保险", "失业保险", "生育保险"],
        frequency: "low",
        importance: 3,
      },
      {
        id: "environmental-law",
        name: "环境保护法",
        description: "环境保护法律制度",
        points: ["环境保护基本制度", "环境污染防治", "环境保护责任"],
        frequency: "low",
        importance: 3,
      },
      {
        id: "intellectual-property",
        name: "知识产权法",
        description: "著作权、专利权、商标权",
        points: ["著作权", "专利权", "商标权"],
        frequency: "medium",
        importance: 3,
      },
    ],
  },
];

// 高频考点
const hotPoints = [
  { name: "正当防卫与紧急避险", count: 68, trend: "up" },
  { name: "公民基本权利", count: 62, trend: "stable" },
  { name: "行政处罚种类", count: 58, trend: "up" },
  { name: "合同效力", count: 52, trend: "stable" },
  { name: "犯罪构成四要件", count: 48, trend: "up" },
  { name: "诉讼时效", count: 45, trend: "down" },
];

// 法条速记
const quickLaws = [
  {
    title: "宪法第三十三条",
    content: "中华人民共和国公民在法律面前一律平等。",
    category: "宪法",
  },
  {
    title: "刑法第二十条",
    content: "为了使国家、公共利益、本人或者他人的人身、财产和其他权利免受正在进行的不法侵害，而采取的制止不法侵害的行为，对不法侵害人造成损害的，属于正当防卫，不负刑事责任。",
    category: "刑法",
  },
  {
    title: "民法典第一百八十八条",
    content: "向人民法院请求保护民事权利的诉讼时效期间为三年。",
    category: "民法",
  },
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
                  className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
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
        <h4 className="font-medium text-stone-800 group-hover:text-blue-600 transition-colors truncate text-sm">
          {course.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500">
          <span>{course.chapter_count}章节</span>
          <span>·</span>
          <span>{course.study_count}人学习</span>
        </div>
      </div>
      <div className="flex items-center">
        <Play className="w-4 h-4 text-blue-500" />
      </div>
    </Link>
  );
}

export default function FalvPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading: coursesLoading, fetchCourses } = useCourses();
  const [courses, setCourses] = useState<CourseBrief[]>([]);

  // 加载法律知识相关课程
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await fetchCourses({
          subject: "gongji",
          keyword: "法律",
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 text-white">
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
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">法律知识</h1>
              <p className="text-white/80">宪法 · 民法典 · 刑法 · 行政法</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="font-semibold">6</span>
              <span className="text-white/80">大法律板块</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">450+</span>
              <span className="text-white/80">核心考点</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="font-semibold">占比最高</span>
              <span className="text-white/80">约30%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Alert */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">法律知识是公基考试重点</h4>
                <p className="text-sm text-blue-600 mt-1">
                  法律部分在公基考试中占比约30%，是分值最高的模块。建议重点攻克宪法、民法典、刑法、行政法四大核心法律。
                </p>
              </div>
            </div>

            {/* Knowledge System */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  法律知识学习建议
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">重点攻克四大核心法律</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        宪法、民法典、刑法、行政法占比超过80%
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">注重法条记忆</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        常考法条要熟记，特别是数字类规定
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">结合案例理解</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        法律条文较抽象，通过案例加深理解
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-stone-800">关注法律修订</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        民法典等新修订法律是近年考查热点
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
                  <TrendingUp className="w-4 h-4 text-blue-500" />
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
                      idx < 3 ? "bg-blue-100 text-blue-600" : "bg-stone-100 text-stone-600"
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

            {/* Quick Laws */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-blue-500" />
                  法条速记
                </h3>
              </div>
              <div className="space-y-3">
                {quickLaws.map((law, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">{law.category}</span>
                      <span className="text-sm font-medium text-stone-700">{law.title}</span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2">{law.content}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                查看更多法条
              </button>
            </div>

            {/* Related Courses */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  相关课程
                </h3>
              </div>

              {coursesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
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
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-5 text-white">
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
                  <span className="flex-1">法律专项练习</span>
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
