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
  Calculator,
  Sigma,
  Grid,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// 数量关系知识点结构
const knowledgeTree = [
  {
    id: "shuxue-yunsuan",
    name: "数学运算",
    icon: "🔢",
    description: "考查数学计算和应用能力",
    questionCount: 10,
    weight: 70,
    children: [
      {
        id: "jisuan-wenti",
        name: "计算问题",
        description: "基础计算和速算技巧",
        keyPoints: ["速算技巧", "尾数法", "整除特性", "因式分解"],
        difficulty: 2,
        questionCount: 2,
        tips: "掌握整除特性和尾数法可快速排除错误选项",
        formulas: ["尾数判断法", "整除规律", "奇偶特性"],
      },
      {
        id: "xingcheng-wenti",
        name: "行程问题",
        description: "时间、速度、路程的关系",
        keyPoints: ["相遇追及", "流水行船", "环形轨道", "火车过桥"],
        difficulty: 4,
        questionCount: 2,
        tips: "路程=速度×时间，画图分析事半功倍",
        formulas: ["相遇时间=总路程÷速度和", "追及时间=路程差÷速度差"],
      },
      {
        id: "gongcheng-wenti",
        name: "工程问题",
        description: "工作效率和时间的关系",
        keyPoints: ["单独完成", "合作完成", "交替完成", "水管问题"],
        difficulty: 3,
        questionCount: 1,
        tips: "设工作总量为最小公倍数，简化计算",
        formulas: ["工作量=效率×时间", "效率=工作量÷时间"],
      },
      {
        id: "lirun-wenti",
        name: "利润问题",
        description: "成本、售价、利润的关系",
        keyPoints: ["成本利润", "打折促销", "分段计费"],
        difficulty: 3,
        questionCount: 1,
        tips: "利润率=(售价-成本)÷成本×100%",
        formulas: ["利润=售价-成本", "利润率=利润÷成本"],
      },
      {
        id: "nongdu-wenti",
        name: "浓度问题",
        description: "溶液浓度的计算",
        keyPoints: ["溶液混合", "蒸发稀释", "十字交叉法"],
        difficulty: 3,
        questionCount: 1,
        tips: "混合溶液浓度介于原溶液浓度之间",
        formulas: ["浓度=溶质÷溶液", "十字交叉法"],
      },
      {
        id: "pailie-zuhe",
        name: "排列组合",
        description: "计数原理和排列组合",
        keyPoints: ["加法原理", "乘法原理", "排列", "组合"],
        difficulty: 5,
        questionCount: 1,
        tips: "有序用排列，无序用组合；分类用加法，分步用乘法",
        formulas: ["A(n,m)=n!/(n-m)!", "C(n,m)=n!/[m!(n-m)!]"],
      },
      {
        id: "gailv-wenti",
        name: "概率问题",
        description: "事件发生的可能性",
        keyPoints: ["古典概型", "独立事件", "条件概率"],
        difficulty: 4,
        questionCount: 1,
        tips: "概率=有利情况数÷总情况数",
        formulas: ["P(A)=有利情况÷总情况", "P(A·B)=P(A)×P(B)"],
      },
      {
        id: "jihe-wenti",
        name: "几何问题",
        description: "平面和立体几何计算",
        keyPoints: ["平面几何", "立体几何", "最短路径"],
        difficulty: 4,
        questionCount: 1,
        tips: "熟记常见图形的周长、面积、体积公式",
        formulas: ["圆面积=πr²", "球体积=4/3πr³"],
      },
    ],
  },
  {
    id: "shuzi-tuili",
    name: "数字推理",
    icon: "🧮",
    description: "考查数字规律的发现能力",
    questionCount: 5,
    weight: 30,
    children: [
      {
        id: "dengcha-shulie",
        name: "等差数列",
        description: "相邻项差值相等或呈规律变化",
        keyPoints: ["基础等差", "二级等差", "多级等差"],
        difficulty: 2,
        questionCount: 1,
        tips: "看相邻项差值，差值相等即为等差",
        formulas: ["an=a1+(n-1)d", "Sn=n(a1+an)/2"],
      },
      {
        id: "dengbi-shulie",
        name: "等比数列",
        description: "相邻项比值相等",
        keyPoints: ["基础等比", "混合数列"],
        difficulty: 3,
        questionCount: 1,
        tips: "看相邻项比值，比值相等即为等比",
        formulas: ["an=a1×r^(n-1)", "Sn=a1(1-r^n)/(1-r)"],
      },
      {
        id: "ditui-shulie",
        name: "递推数列",
        description: "后项由前几项通过某种运算得到",
        keyPoints: ["和递推", "积递推", "差递推"],
        difficulty: 4,
        questionCount: 1,
        tips: "尝试相邻项的加减乘除运算找规律",
        formulas: ["an=a(n-1)+a(n-2)", "an=a(n-1)×a(n-2)"],
      },
      {
        id: "fenshu-shulie",
        name: "分数数列",
        description: "以分数形式呈现的数列",
        keyPoints: ["分子分母分开看", "通分化简"],
        difficulty: 4,
        questionCount: 1,
        tips: "分子分母分开找规律，或化成小数比较",
        formulas: [],
      },
      {
        id: "mici-shulie",
        name: "幂次数列",
        description: "含有平方、立方等幂次的数列",
        keyPoints: ["纯幂次", "幂次修正"],
        difficulty: 4,
        questionCount: 1,
        tips: "熟记1-20的平方和1-10的立方",
        formulas: ["常见幂次：4,9,16,25,36...", "立方：1,8,27,64,125..."],
      },
    ],
  },
];

// 常用公式卡片
const commonFormulas = [
  {
    title: "行程公式",
    formulas: ["路程=速度×时间", "相遇时间=路程÷速度和", "追及时间=路程差÷速度差"],
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "工程公式",
    formulas: ["工作量=效率×时间", "合作效率=各效率之和", "设总量为最小公倍数"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "利润公式",
    formulas: ["利润=售价-成本", "利润率=利润÷成本", "售价=成本×(1+利润率)"],
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "排列组合",
    formulas: ["A(n,m)=n!/(n-m)!", "C(n,m)=n!/[m!(n-m)!]", "隔板法：C(n-1,m-1)"],
    color: "from-purple-500 to-violet-500",
  },
];

// 学习技巧
const learningTips = [
  {
    title: "优先放弃原则",
    description: "数量关系耗时长，考试时可以优先做其他模块，剩余时间再攻克",
    icon: Clock,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "秒杀技巧",
    description: "整除特性、尾数法、代入排除法可快速得出答案",
    icon: Zap,
    color: "text-amber-600 bg-amber-50",
  },
  {
    title: "熟记公式",
    description: "常用公式要烂熟于心，考场上节省思考时间",
    icon: BookMarked,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "题型专练",
    description: "针对高频题型重点突破，提高投入产出比",
    icon: Target,
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
              <span className="px-2 py-0.5 text-xs bg-violet-50 text-violet-600 rounded-full">
                {knowledge.questionCount}题
              </span>
              <span className="px-2 py-0.5 text-xs bg-amber-50 text-amber-600 rounded-full">
                占比{knowledge.weight}%
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-1">{knowledge.description}</p>
          </div>
          <Link
            href={`/learn/xingce/shuliang/${knowledge.id}`}
            className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors"
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
                        className="px-2 py-0.5 text-xs bg-violet-50 text-violet-600 rounded"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                  {/* 技巧提示 */}
                  <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-700">{child.tips}</span>
                  </div>
                  {/* 核心公式 */}
                  {child.formulas && child.formulas.length > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-violet-50 rounded-lg">
                      <Calculator className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      <span className="text-xs text-violet-700">
                        {child.formulas.join(" | ")}
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/learn/xingce/shuliang/${knowledge.id}/${child.id}`}
                  className="px-3 py-1.5 border border-violet-200 text-violet-600 text-sm font-medium rounded-lg hover:bg-violet-50 transition-colors flex-shrink-0"
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

export default function ShuliangLearningPage() {
  const { isAuthenticated } = useAuthStore();

  // 计算总题数
  const totalQuestions = knowledgeTree.reduce((sum, k) => sum + k.questionCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white">
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
            <span className="text-sm">数量关系</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">🔢</span>
                <div>
                  <h1 className="text-3xl font-bold">数量关系</h1>
                  <p className="text-white/80">考查数学运算与数字推理能力</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span>{totalQuestions}题</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>~25分钟</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4" />
                  <span>占比15%</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Target className="w-4 h-4" />
                  <span>难度 ★★★★★</span>
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
                      <span>0/13</span>
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
        {/* 警告提示 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">备考建议</h3>
              <p className="text-sm text-amber-700">
                数量关系是行测中难度最高的模块，建议：1) 掌握常见题型的解题方法；2) 练习秒杀技巧如整除特性、代入排除；3) 考试时可战略性放弃难题，优先保证其他模块得分。
              </p>
            </div>
          </div>
        </div>

        {/* 公式速记卡片 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-violet-500" />
            公式速记
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {commonFormulas.map((card, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-xl border border-stone-200/50 overflow-hidden"
              >
                <div className={`h-1 bg-gradient-to-r ${card.color}`} />
                <div className="p-4">
                  <h3 className="font-semibold text-stone-800 mb-3">{card.title}</h3>
                  <div className="space-y-2">
                    {card.formulas.map((formula, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 bg-stone-50 rounded text-sm text-stone-600 font-mono"
                      >
                        {formula}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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

        {/* 知识点导航 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-500" />
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
              href="/learn/xingce/shuliang/videos"
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
                  <p className="text-sm text-stone-500">题型分类精讲</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">共 18 个视频</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>

            {/* 公式速记 */}
            <Link
              href="/learn/xingce/shuliang/formulas"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Sigma className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors">
                    公式速记卡片
                  </h3>
                  <p className="text-sm text-stone-500">核心公式汇总</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">50+ 必背公式</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>

            {/* 经典题型 */}
            <Link
              href="/learn/xingce/shuliang/examples"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Grid className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors">
                    经典题型精讲
                  </h3>
                  <p className="text-sm text-stone-500">高频题型解析</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">80+ 经典例题</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          </div>
        </section>

        {/* 专项练习入口 */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">开始数量关系专项练习</h3>
                <p className="text-white/80">
                  分题型专项训练，掌握秒杀技巧，攻克数量难关
                </p>
              </div>
              <Link
                href="/learn/practice?subject=xingce&module=shuliang"
                className="px-6 py-3 bg-white text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-colors flex items-center gap-2"
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
