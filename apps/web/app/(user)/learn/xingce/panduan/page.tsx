"use client";

import { useState } from "react";
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
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Zap,
  Video,
  BookMarked,
  ArrowRight,
  Brain,
  Shapes,
  GitBranch,
  Layers,
  Box,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// 判断推理知识点结构
const knowledgeTree = [
  {
    id: "tuxing-tuili",
    name: "图形推理",
    icon: "🔲",
    description: "考查空间想象和图形规律识别能力",
    questionCount: 10,
    weight: 25,
    children: [
      {
        id: "guilu-tuxing",
        name: "规律类图形",
        description: "发现图形的变化规律",
        keyPoints: [],
        difficulty: 4,
        questionCount: 6,
        tips: "先看整体特征，再分析局部变化",
        subItems: [
          { name: "位置规律", desc: "平移、旋转、翻转" },
          { name: "样式规律", desc: "叠加、遍历、对称" },
          { name: "属性规律", desc: "封闭性、曲直性、对称性" },
          { name: "数量规律", desc: "点、线、面、角、素" },
        ],
      },
      {
        id: "chonggou-tuxing",
        name: "重构类图形",
        description: "空间重构和平面组合",
        keyPoints: [],
        difficulty: 5,
        questionCount: 3,
        tips: "六面体找相邻面的关系，四面体找公共边",
        subItems: [
          { name: "空间重构", desc: "六面体、四面体展开" },
          { name: "平面拼合", desc: "图形组合与分割" },
          { name: "截面图", desc: "立体图形切割" },
        ],
      },
      {
        id: "fenlei-fenzu",
        name: "分类分组",
        description: "将图形按特征分类",
        keyPoints: ["共同特征", "差异特征"],
        difficulty: 3,
        questionCount: 1,
        tips: "找出两组图形各自的共同规律",
      },
    ],
  },
  {
    id: "dingyi-panduan",
    name: "定义判断",
    icon: "📋",
    description: "考查理解和运用定义的能力",
    questionCount: 10,
    weight: 25,
    children: [
      {
        id: "dan-dingyi",
        name: "单定义判断",
        description: "根据单个定义判断选项",
        keyPoints: ["关键信息提取", "排除法", "主体客体分析"],
        difficulty: 3,
        questionCount: 7,
        tips: "圈出定义中的关键词，逐一比对选项",
      },
      {
        id: "duo-dingyi",
        name: "多定义判断",
        description: "多个定义间的辨析",
        keyPoints: ["定义对比", "分类识别"],
        difficulty: 4,
        questionCount: 3,
        tips: "先找到定义间的区别，再判断选项属于哪个定义",
      },
    ],
  },
  {
    id: "leibi-tuili",
    name: "类比推理",
    icon: "🔗",
    description: "考查分析词项关系的能力",
    questionCount: 10,
    weight: 25,
    children: [
      {
        id: "yuyi-guanxi",
        name: "语义关系",
        description: "词语意义之间的关系",
        keyPoints: ["近义关系", "反义关系", "比喻象征"],
        difficulty: 2,
        questionCount: 3,
        tips: "注意词语的感情色彩和语义轻重",
      },
      {
        id: "luoji-guanxi",
        name: "逻辑关系",
        description: "概念之间的逻辑关系",
        keyPoints: ["并列关系", "包含关系", "交叉关系", "全异关系"],
        difficulty: 3,
        questionCount: 3,
        tips: "画图分析集合关系",
      },
      {
        id: "yufa-guanxi",
        name: "语法关系",
        description: "词语的语法结构关系",
        keyPoints: ["主谓关系", "动宾关系", "偏正关系"],
        difficulty: 3,
        questionCount: 2,
        tips: "分析词语的语法成分和搭配方式",
      },
      {
        id: "changshi-guanxi",
        name: "常识关系",
        description: "基于常识的关联",
        keyPoints: ["功能关系", "组成关系", "因果关系", "时间顺序"],
        difficulty: 3,
        questionCount: 2,
        tips: "结合生活常识判断词语间的关系",
      },
    ],
  },
  {
    id: "luoji-panduan",
    name: "逻辑判断",
    icon: "🧠",
    description: "考查逻辑推理和论证分析能力",
    questionCount: 10,
    weight: 25,
    children: [
      {
        id: "fanyi-tuili",
        name: "翻译推理",
        description: "命题逻辑的翻译与推理",
        keyPoints: ["充分必要条件", "逆否命题", "推理规则"],
        difficulty: 4,
        questionCount: 2,
        tips: "如果A那么B → A→B，否后必否前",
      },
      {
        id: "zhenjia-tuili",
        name: "真假推理",
        description: "判断陈述的真假",
        keyPoints: ["矛盾关系", "反对关系", "假设法"],
        difficulty: 4,
        questionCount: 2,
        tips: "先找矛盾，矛盾必有一真一假",
      },
      {
        id: "fenxi-tuili",
        name: "分析推理",
        description: "根据条件推断结论",
        keyPoints: ["排除法", "假设法", "最大信息法"],
        difficulty: 3,
        questionCount: 2,
        tips: "从确定性信息和出现次数最多的信息入手",
      },
      {
        id: "guina-tuili",
        name: "归纳推理",
        description: "根据论据得出结论",
        keyPoints: ["结论型", "前提型"],
        difficulty: 3,
        questionCount: 2,
        tips: "结论不能超出论据范围",
      },
      {
        id: "jiaqiang-xueruo",
        name: "加强削弱",
        description: "对论证的加强或削弱",
        keyPoints: ["加强论点", "削弱论点", "搭桥", "拆桥"],
        difficulty: 4,
        questionCount: 2,
        tips: "搭桥是补充论据与论点间的隐含前提",
      },
    ],
  },
];

// 图形推理常见规律
const graphicPatterns = [
  {
    title: "位置规律",
    patterns: ["平移（方向、步数）", "旋转（角度、中心）", "翻转（轴对称、点对称）"],
    icon: "↻",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    title: "样式规律",
    patterns: ["叠加（相加、相减、异或）", "遍历（元素不重不漏）", "对称（轴对称、中心对称）"],
    icon: "◇",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    title: "数量规律",
    patterns: ["点数量", "线数量（直线、曲线）", "面数量", "角数量", "素数量"],
    icon: "∑",
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    title: "属性规律",
    patterns: ["封闭与开放", "曲直性", "对称性", "连通性"],
    icon: "○",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
];

// 逻辑推理公式
const logicFormulas = [
  {
    title: "翻译推理",
    formulas: [
      "如果A那么B → A→B",
      "只有A才B → B→A",
      "A或B → ¬A→B",
      "逆否命题：A→B 等价于 ¬B→¬A",
    ],
  },
  {
    title: "矛盾关系",
    formulas: [
      "所有S都是P ↔ 有些S不是P",
      "所有S都不是P ↔ 有些S是P",
      "A且B ↔ ¬A或¬B",
      "A或B ↔ ¬A且¬B",
    ],
  },
];

// 学习技巧
const learningTips = [
  {
    title: "图形推理四步法",
    description: "看整体→找规律→验规律→选答案",
    icon: Shapes,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "定义判断关键词法",
    description: "圈出主体、客体、方式、目的等关键信息",
    icon: Target,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "类比推理造句法",
    description: "用相同句式造句，验证关系是否一致",
    icon: GitBranch,
    color: "text-amber-600 bg-amber-50",
  },
  {
    title: "逻辑判断翻译法",
    description: "将文字翻译成逻辑符号再推理",
    icon: Brain,
    color: "text-purple-600 bg-purple-50",
  },
];

// 知识点卡片组件
function KnowledgeCard({
  knowledge,
  level = 0,
}: {
  knowledge: typeof knowledgeTree[0];
  level?: number;
}) {
  const [expanded, setExpanded] = useState(level === 0);
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
          <div className="text-2xl">{knowledge.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-800">{knowledge.name}</h3>
              <span className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-600 rounded-full">
                {knowledge.questionCount}题
              </span>
              <span className="px-2 py-0.5 text-xs bg-amber-50 text-amber-600 rounded-full">
                占比{knowledge.weight}%
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-1">{knowledge.description}</p>
          </div>
          <Link
            href={`/learn/xingce/panduan/${knowledge.id}`}
            className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
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
                  {child.keyPoints && child.keyPoints.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {child.keyPoints.map((point, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-600 rounded"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* 子项目（图形推理特有） */}
                  {child.subItems && child.subItems.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {child.subItems.map((item, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 bg-stone-50 rounded-lg"
                        >
                          <span className="text-xs font-medium text-stone-700">{item.name}</span>
                          <span className="text-xs text-stone-500 ml-1">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 技巧提示 */}
                  <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-700">{child.tips}</span>
                  </div>
                </div>
                <Link
                  href={`/learn/xingce/panduan/${knowledge.id}/${child.id}`}
                  className="px-3 py-1.5 border border-emerald-200 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors flex-shrink-0"
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

export default function PanduanLearningPage() {
  const { isAuthenticated } = useAuthStore();

  // 计算总题数
  const totalQuestions = knowledgeTree.reduce((sum, k) => sum + k.questionCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/learn/xingce"
              className="text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-white/60">/</span>
            <Link
              href="/learn/xingce"
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              行测
            </Link>
            <span className="text-white/60">/</span>
            <span className="text-sm">判断推理</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">🧩</span>
                <div>
                  <h1 className="text-3xl font-bold">判断推理</h1>
                  <p className="text-white/80">考查逻辑推理与分析判断能力</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span>{totalQuestions}题</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>~35分钟</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4" />
                  <span>占比25%</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Target className="w-4 h-4" />
                  <span>难度 ★★★★☆</span>
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
                      <span>0/14</span>
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
        {/* 学习技巧 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            答题技巧
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {learningTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200/50 p-4 hover:shadow-card transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg ${tip.color} flex items-center justify-center mb-3`}>
                  <tip.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-stone-800 mb-1">{tip.title}</h3>
                <p className="text-sm text-stone-500">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 图形推理规律 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Shapes className="w-5 h-5 text-blue-500" />
            图形推理常见规律
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {graphicPatterns.map((card, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 ${card.color}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{card.icon}</span>
                  <h3 className="font-semibold">{card.title}</h3>
                </div>
                <div className="space-y-1.5">
                  {card.patterns.map((pattern, i) => (
                    <div
                      key={i}
                      className="text-sm bg-white/50 px-3 py-1.5 rounded"
                    >
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 逻辑推理公式 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            逻辑推理核心公式
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {logicFormulas.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200/50 p-5"
              >
                <h3 className="font-semibold text-stone-800 mb-3">{card.title}</h3>
                <div className="space-y-2">
                  {card.formulas.map((formula, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 bg-purple-50 rounded text-sm text-purple-700 font-mono"
                    >
                      {formula}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 知识点导航 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            知识点导航
          </h2>
          <div className="space-y-4">
            {knowledgeTree.map((knowledge) => (
              <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
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
              href="/learn/xingce/panduan/videos"
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
                  <p className="text-sm text-stone-500">四大题型精讲</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">共 32 个视频</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>

            {/* 图形规律库 */}
            <Link
              href="/learn/xingce/panduan/patterns"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Shapes className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-blue-600 transition-colors">
                    图形规律库
                  </h3>
                  <p className="text-sm text-stone-500">常见规律汇总</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">100+ 图形规律</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>

            {/* 经典题型 */}
            <Link
              href="/learn/xingce/panduan/examples"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Box className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors">
                    经典题型
                  </h3>
                  <p className="text-sm text-stone-500">典型例题精选</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">120+ 经典例题</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          </div>
        </section>

        {/* 专项练习入口 */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">开始判断推理专项练习</h3>
                <p className="text-white/80">
                  图形、定义、类比、逻辑四大题型专项训练，全面提升推理能力
                </p>
              </div>
              <Link
                href="/learn/practice?subject=xingce&module=panduan"
                className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2"
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
