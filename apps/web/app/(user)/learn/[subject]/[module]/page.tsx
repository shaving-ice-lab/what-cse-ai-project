"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Clock,
  Target,
  Play,
  Star,
  FileText,
  Lightbulb,
  Video,
  Brain,
  PenTool,
  MessageSquare,
  Edit3,
  Calculator,
  Scale,
  BarChart3,
  Globe,
  Mic,
  Users,
  AlertTriangle,
  Smile,
  BookMarked,
  CheckCircle2,
  Zap,
  LucideIcon,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { courseApi, ModuleConfig } from "@/services/api/course";
import { Empty } from "@/components/common";

// 科目配置
const subjectConfig: Record<
  string,
  { name: string; fullName: string; gradient: string }
> = {
  xingce: {
    name: "行测",
    fullName: "行政职业能力测验",
    gradient: "from-sky-500 via-cyan-500 to-teal-600",
  },
  shenlun: {
    name: "申论",
    fullName: "申论写作",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
  },
  mianshi: {
    name: "面试",
    fullName: "结构化面试",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
  },
  gongji: {
    name: "公基",
    fullName: "公共基础知识",
    gradient: "from-orange-500 via-amber-500 to-yellow-600",
  },
};

// 模块图标映射
const moduleIconMap: Record<string, LucideIcon> = {
  yanyu: MessageSquare,
  shuliang: Calculator,
  panduan: Scale,
  ziliao: BarChart3,
  changshi: Globe,
  guina: FileText,
  duice: Target,
  fenxi: Brain,
  guanche: BookOpen,
  xiezuo: Edit3,
  zonghefenxi: Brain,
  jihuazuzhi: Target,
  renji: Users,
  yingji: AlertTriangle,
  liyi: Smile,
  qingjing: Mic,
  zhengzhi: BookOpen,
  falv: Scale,
  gongwen: FileText,
  jingji: BarChart3,
  renwen: Globe,
  default: BookOpen,
};

// 图标名称映射
const iconNameMap: Record<string, LucideIcon> = {
  BookMarked,
  Target,
  CheckCircle2,
  PenTool,
  Lightbulb,
  Brain,
  Zap,
  BookOpen,
  MessageSquare,
  Calculator,
  Scale,
  BarChart3,
  Globe,
  Edit3,
  FileText,
  Users,
  AlertTriangle,
  Smile,
  Mic,
  Video,
};

// 颜色名称到样式的映射
const colorClassMap: Record<string, string> = {
  blue: "text-blue-600 bg-blue-50",
  emerald: "text-emerald-600 bg-emerald-50",
  amber: "text-amber-600 bg-amber-50",
  purple: "text-purple-600 bg-purple-50",
  sky: "text-sky-600 bg-sky-50",
  rose: "text-rose-600 bg-rose-50",
  cyan: "text-cyan-600 bg-cyan-50",
  violet: "text-violet-600 bg-violet-50",
  orange: "text-orange-600 bg-orange-50",
  teal: "text-teal-600 bg-teal-50",
};

// 获取模块图标
function getModuleIcon(moduleId: string, iconName?: string): LucideIcon {
  if (iconName && iconNameMap[iconName]) {
    return iconNameMap[iconName];
  }
  return moduleIconMap[moduleId] || moduleIconMap.default;
}

// 获取颜色样式
function getColorClass(color?: string): string {
  if (!color) return "text-sky-600 bg-sky-50";
  // 处理 Tailwind 渐变类
  if (color.includes("from-")) {
    // 提取颜色名称
    const match = color.match(/from-(\w+)-/);
    if (match) {
      return colorClassMap[match[1]] || "text-sky-600 bg-sky-50";
    }
  }
  // 处理颜色名称
  if (colorClassMap[color]) {
    return colorClassMap[color];
  }
  return "text-sky-600 bg-sky-50";
}

// 默认学习方法
const defaultLearningMethods = [
  {
    title: "系统学习法",
    description: "按知识点体系逐步学习",
    icon: BookMarked,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "针对性训练",
    description: "专项练习薄弱环节",
    icon: Target,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "错题回顾法",
    description: "定期复习错题加深记忆",
    icon: CheckCircle2,
    color: "text-amber-600 bg-amber-50",
  },
  {
    title: "真题演练法",
    description: "通过真题把握命题规律",
    icon: PenTool,
    color: "text-purple-600 bg-purple-50",
  },
];

// 默认知识点结构
function generateDefaultKnowledgeTree(moduleName: string) {
  return [
    {
      id: "basic",
      name: "基础知识",
      icon: BookOpen,
      description: `${moduleName}的基础概念和原理`,
      questionCount: 20,
      weight: 30,
      children: [
        {
          id: "concept",
          name: "核心概念",
          description: "掌握基本定义和术语",
          keyPoints: ["基本概念", "核心原理", "适用范围"],
          difficulty: 2,
          questionCount: 10,
          tips: "打好基础是提高的关键",
        },
      ],
    },
    {
      id: "advanced",
      name: "进阶技巧",
      icon: Brain,
      description: `${moduleName}的解题方法和技巧`,
      questionCount: 30,
      weight: 50,
      children: [
        {
          id: "method",
          name: "解题方法",
          description: "常用解题方法和步骤",
          keyPoints: ["方法论", "解题步骤", "技巧运用"],
          difficulty: 3,
          questionCount: 15,
          tips: "掌握方法，举一反三",
        },
      ],
    },
    {
      id: "practice",
      name: "实战演练",
      icon: PenTool,
      description: "真题练习和模拟训练",
      questionCount: 20,
      weight: 20,
      children: [
        {
          id: "real-exam",
          name: "真题训练",
          description: "历年真题精选",
          keyPoints: ["真题演练", "命题规律", "答题技巧"],
          difficulty: 4,
          questionCount: 20,
          tips: "真题是最好的练习材料",
        },
      ],
    },
  ];
}

// 知识点卡片组件
function KnowledgeCard({
  knowledge,
  subject,
  module,
}: {
  knowledge: {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    questionCount: number;
    weight: number;
    children?: {
      id: string;
      name: string;
      description: string;
      keyPoints: string[];
      difficulty: number;
      questionCount: number;
      tips: string;
    }[];
  };
  subject: string;
  module: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = knowledge.children && knowledge.children.length > 0;

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 overflow-hidden">
      {/* 主知识点 */}
      <div
        className={`p-4 ${hasChildren ? "cursor-pointer hover:bg-stone-50" : ""} transition-colors`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {hasChildren && (
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-stone-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-stone-500" />
              )}
            </div>
          )}
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
            <knowledge.icon className="w-5 h-5 text-sky-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-800">{knowledge.name}</h3>
              <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">
                {knowledge.questionCount}题
              </span>
              <span className="px-2 py-0.5 text-xs bg-amber-50 text-amber-600 rounded-full">
                占比{knowledge.weight}%
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-1">{knowledge.description}</p>
          </div>
          <Link
            href={`/learn/${subject}/${module}/${knowledge.id}`}
            className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            开始学习
          </Link>
        </div>
      </div>

      {/* 子知识点 */}
      {hasChildren && expanded && (
        <div className="border-t border-stone-100">
          {knowledge.children!.map((child, idx) => (
            <div
              key={child.id}
              className={`p-4 pl-16 ${
                idx !== knowledge.children!.length - 1 ? "border-b border-stone-100" : ""
              } hover:bg-stone-50 transition-colors`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-stone-700">{child.name}</h4>
                    <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded-full">
                      {child.questionCount}题
                    </span>
                    {/* 难度 */}
                    <div className="flex gap-0.5 ml-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-1.5 h-1.5 rounded-full ${
                            level <= child.difficulty
                              ? "bg-amber-400"
                              : "bg-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 mb-2">{child.description}</p>
                  {/* 关键考点 */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {child.keyPoints.map((point, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-sky-50 text-sky-600 rounded"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                  {/* 技巧提示 */}
                  <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-700">{child.tips}</span>
                  </div>
                </div>
                <Link
                  href={`/learn/${subject}/${module}/${knowledge.id}/${child.id}`}
                  className="px-3 py-1.5 border border-sky-200 text-sky-600 text-sm font-medium rounded-lg hover:bg-sky-50 transition-colors flex-shrink-0"
                >
                  练习
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModuleLearningPage() {
  const params = useParams();
  const subject = params.subject as string;
  const module = params.module as string;

  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<ModuleConfig | null>(null);

  const subjectInfo = subjectConfig[subject] || {
    name: subject,
    fullName: subject,
    gradient: "from-sky-500 to-cyan-600",
  };

  // 获取模块数据
  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const modules = await courseApi.getSubjectModulesConfig(subject);
        const currentModule = modules.find((m) => m.id === module);
        setModuleData(currentModule || null);
      } catch (error) {
        console.error("获取模块数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    if (subject && module) {
      fetchModuleData();
    }
  }, [subject, module]);

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 模块未找到
  if (!moduleData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Link
            href={`/learn/${subject}`}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回{subjectInfo.name}
          </Link>
          <Empty
            title="模块未找到"
            description="该学习模块暂未开放或不存在"
            Icon={BookOpen}
          />
        </div>
      </div>
    );
  }

  const ModuleIcon = getModuleIcon(module, moduleData.icon);
  const totalQuestions = moduleData.question_count || 40;
  const knowledgeTree = generateDefaultKnowledgeTree(moduleData.name);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-white">
      {/* Header */}
      <div className={`bg-gradient-to-br ${subjectInfo.gradient} text-white`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href={`/learn/${subject}`}
              className="text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-white/60">/</span>
            <Link
              href={`/learn/${subject}`}
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              {subjectInfo.name}
            </Link>
            <span className="text-white/60">/</span>
            <span className="text-sm">{moduleData.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <ModuleIcon className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{moduleData.name}</h1>
                  <p className="text-white/80">
                    {moduleData.description || `${subjectInfo.fullName} - ${moduleData.name}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span>{totalQuestions}题</span>
                </div>
                {moduleData.avg_time && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span>~{moduleData.avg_time}分钟</span>
                  </div>
                )}
                {moduleData.weight && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Star className="w-4 h-4" />
                    <span>占比{moduleData.weight}%</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Target className="w-4 h-4" />
                  <span>
                    难度{" "}
                    {"★".repeat(moduleData.difficulty || 3)}
                    {"☆".repeat(5 - (moduleData.difficulty || 3))}
                  </span>
                </div>
              </div>
            </div>

            {/* 进度卡片 */}
            {isAuthenticated && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 lg:w-64">
                <h3 className="text-sm text-white/80 mb-3">学习进度</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>知识点掌握</span>
                      <span>0/10</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full">
                      <div className="h-full w-0 bg-white rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>做题正确率</span>
                      <span>0%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full">
                      <div className="h-full w-0 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 学习方法 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            学习方法
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {defaultLearningMethods.map((method, idx) => {
              const Icon = method.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-stone-200/50 p-4 hover:shadow-card transition-shadow"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-stone-800 mb-1">{method.title}</h3>
                  <p className="text-sm text-stone-500">{method.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 知识点导航 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-sky-500" />
            知识点导航
          </h2>
          <div className="space-y-4">
            {knowledgeTree.map((knowledge) => (
              <KnowledgeCard
                key={knowledge.id}
                knowledge={knowledge}
                subject={subject}
                module={module}
              />
            ))}
          </div>
        </section>

        {/* 学习资源 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-500" />
            学习资源
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* 视频讲解 */}
            <Link
              href={`/learn/${subject}/${module}/videos`}
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-purple-600 transition-colors">
                    视频讲解
                  </h3>
                  <p className="text-sm text-stone-500">名师精讲知识点</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">敬请期待</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>

            {/* 方法技巧 */}
            <Link
              href={`/learn/${subject}/${module}/tips`}
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors">
                    方法技巧
                  </h3>
                  <p className="text-sm text-stone-500">高分答题秘籍</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">敬请期待</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>

            {/* 典型例题 */}
            <Link
              href={`/learn/${subject}/${module}/examples`}
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors">
                    典型例题
                  </h3>
                  <p className="text-sm text-stone-500">精选真题演练</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">敬请期待</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          </div>
        </section>

        {/* 专项练习入口 */}
        <section className="mb-10">
          <div className={`bg-gradient-to-r ${subjectInfo.gradient} rounded-2xl p-6 text-white`}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  开始{moduleData.name}专项练习
                </h3>
                <p className="text-white/80">
                  精选历年真题，智能推荐薄弱知识点，快速提分
                </p>
              </div>
              <Link
                href={`/learn/practice?subject=${subject}&module=${module}`}
                className="px-6 py-3 bg-white text-sky-600 font-semibold rounded-xl hover:bg-sky-50 transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                开始练习
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
