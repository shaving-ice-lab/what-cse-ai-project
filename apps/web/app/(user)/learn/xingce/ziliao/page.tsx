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
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Calculator,
  Percent,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// 资料分析知识点结构
const knowledgeTree = [
  {
    id: "hexin-gainian",
    name: "核心概念精讲",
    icon: "📈",
    description: "掌握资料分析的基本概念和公式",
    questionCount: 15,
    weight: 75,
    children: [
      {
        id: "zengzhang-wenti",
        name: "增长问题",
        description: "增长率、增长量的计算与比较",
        keyPoints: ["同比增长", "环比增长", "增长量计算", "增长率比较"],
        difficulty: 3,
        questionCount: 4,
        tips: "增长率=增长量÷基期值，同比看去年同期，环比看上一时期",
        formulas: [
          "增长率 = (现期-基期) ÷ 基期",
          "增长量 = 现期 - 基期 = 基期 × 增长率",
          "年均增长率 ≈ (总增长率) ÷ n",
        ],
      },
      {
        id: "bizhong-wenti",
        name: "比重问题",
        description: "部分占整体的比例计算",
        keyPoints: ["现期比重", "基期比重", "比重变化量", "比重变化方向"],
        difficulty: 4,
        questionCount: 4,
        tips: "比重变化方向：部分增长率>整体增长率，则比重上升",
        formulas: [
          "比重 = 部分 ÷ 整体",
          "基期比重 = 现期比重 × (1+整体增长率) ÷ (1+部分增长率)",
          "比重变化量 ≈ 现期比重 × (部分增长率-整体增长率) ÷ (1+部分增长率)",
        ],
      },
      {
        id: "beishu-wenti",
        name: "倍数问题",
        description: "两个数据之间的倍数关系",
        keyPoints: ["现期倍数", "基期倍数", "倍数与增长率"],
        difficulty: 3,
        questionCount: 3,
        tips: "A是B的n倍，则A比B多(n-1)倍",
        formulas: [
          "现期倍数 = A现期 ÷ B现期",
          "基期倍数 = 现期倍数 × (1+B增长率) ÷ (1+A增长率)",
        ],
      },
      {
        id: "pingjunshu-wenti",
        name: "平均数问题",
        description: "平均值的计算与变化",
        keyPoints: ["现期平均数", "基期平均数", "平均数增长率"],
        difficulty: 4,
        questionCount: 3,
        tips: "平均数增长率 = (总量增长率-份数增长率) ÷ (1+份数增长率)",
        formulas: [
          "平均数 = 总量 ÷ 份数",
          "平均数增长率 = (a-b) ÷ (1+b)，其中a为总量增长率，b为份数增长率",
        ],
      },
      {
        id: "zonghe-fenxi",
        name: "综合分析",
        description: "多知识点混合题型",
        keyPoints: ["多知识点混合", "选项排除技巧", "快速验证"],
        difficulty: 4,
        questionCount: 1,
        tips: "从最容易判断的选项入手，快速排除",
        formulas: [],
      },
    ],
  },
  {
    id: "susuan-jiqiao",
    name: "速算技巧",
    icon: "⚡",
    description: "掌握快速计算的方法",
    questionCount: 0,
    weight: 0,
    children: [
      {
        id: "jiewei-zhichu",
        name: "截位直除法",
        description: "保留有效数字快速除法",
        keyPoints: ["截两位", "截三位", "误差控制"],
        difficulty: 3,
        questionCount: 0,
        tips: "选项差距大截两位，差距小截三位",
        formulas: ["保留前2-3位有效数字进行计算"],
      },
      {
        id: "tezheng-shuzi",
        name: "特征数字法",
        description: "利用特殊数字简化计算",
        keyPoints: ["1/2", "1/3", "1/4", "1/5", "1/8"],
        difficulty: 2,
        questionCount: 0,
        tips: "12.5%=1/8, 16.7%≈1/6, 25%=1/4, 33.3%≈1/3",
        formulas: ["25%=1/4", "12.5%=1/8", "33.3%≈1/3", "16.7%≈1/6"],
      },
      {
        id: "youxiao-shuzi",
        name: "有效数字法",
        description: "乘法中的有效数字处理",
        keyPoints: ["两位有效数字", "进位规则"],
        difficulty: 3,
        questionCount: 0,
        tips: "第三位四舍五入时一个进一个不进",
        formulas: ["保留2位有效数字，第3位数字≥5进位"],
      },
      {
        id: "cuowei-jiajian",
        name: "错位加减法",
        description: "通过错位简化加减运算",
        keyPoints: ["增长量估算"],
        difficulty: 3,
        questionCount: 0,
        tips: "适用于增长率在10%左右的增长量计算",
        formulas: [],
      },
      {
        id: "tongwei-bijiao",
        name: "同位比较法",
        description: "快速比较多个数据大小",
        keyPoints: ["分数比较", "增长率比较"],
        difficulty: 3,
        questionCount: 0,
        tips: "分子分母同时变大时，用倍数法判断",
        formulas: [],
      },
    ],
  },
  {
    id: "cailiao-leixing",
    name: "材料类型解读",
    icon: "📊",
    description: "掌握不同类型材料的阅读技巧",
    questionCount: 5,
    weight: 25,
    children: [
      {
        id: "wenzi-cailiao",
        name: "文字材料",
        description: "纯文字描述的统计材料",
        keyPoints: ["关键数据定位", "段落结构分析"],
        difficulty: 3,
        questionCount: 1,
        tips: "先浏览全文结构，画出关键数据",
        formulas: [],
      },
      {
        id: "biaoge-cailiao",
        name: "表格材料",
        description: "表格形式的统计数据",
        keyPoints: ["行列交叉读取", "表头含义理解"],
        difficulty: 2,
        questionCount: 2,
        tips: "注意表头的时间、单位等信息",
        formulas: [],
      },
      {
        id: "tuxing-cailiao",
        name: "图形材料",
        description: "图表形式的统计数据",
        keyPoints: ["柱状图", "折线图", "饼图"],
        difficulty: 2,
        questionCount: 1,
        tips: "柱状图看高度，折线图看趋势，饼图看比重",
        formulas: [],
      },
      {
        id: "hunhe-cailiao",
        name: "混合材料",
        description: "多种形式组合的材料",
        keyPoints: ["信息整合", "交叉验证"],
        difficulty: 4,
        questionCount: 1,
        tips: "先理清各部分材料的关系，再定位信息",
        formulas: [],
      },
    ],
  },
];

// 常用公式卡片
const commonFormulas = [
  {
    title: "增长公式",
    formulas: [
      "增长率 = (现期-基期) ÷ 基期",
      "增长量 = 基期 × 增长率",
      "现期 = 基期 × (1+增长率)",
      "基期 = 现期 ÷ (1+增长率)",
    ],
    color: "from-blue-500 to-indigo-500",
    icon: TrendingUp,
  },
  {
    title: "比重公式",
    formulas: [
      "比重 = 部分 ÷ 整体",
      "比重变化看增长率大小",
      "部分增长率 > 整体，比重↑",
      "部分增长率 < 整体，比重↓",
    ],
    color: "from-emerald-500 to-teal-500",
    icon: PieChart,
  },
  {
    title: "倍数公式",
    formulas: [
      "A是B的n倍 → A = n×B",
      "A比B多n倍 → A = (n+1)×B",
      "基期倍数需调整增长率",
    ],
    color: "from-amber-500 to-orange-500",
    icon: BarChart3,
  },
  {
    title: "平均数公式",
    formulas: [
      "平均数 = 总量 ÷ 份数",
      "平均数增长率 = (a-b)÷(1+b)",
      "a=总量增长率，b=份数增长率",
    ],
    color: "from-purple-500 to-violet-500",
    icon: LineChart,
  },
];

// 特征数字对照表
const characteristicNumbers = [
  { percent: "10%", fraction: "1/10", decimal: "0.1" },
  { percent: "12.5%", fraction: "1/8", decimal: "0.125" },
  { percent: "16.7%", fraction: "1/6", decimal: "0.167" },
  { percent: "20%", fraction: "1/5", decimal: "0.2" },
  { percent: "25%", fraction: "1/4", decimal: "0.25" },
  { percent: "33.3%", fraction: "1/3", decimal: "0.333" },
  { percent: "40%", fraction: "2/5", decimal: "0.4" },
  { percent: "50%", fraction: "1/2", decimal: "0.5" },
];

// 学习技巧
const learningTips = [
  {
    title: "资料分析性价比最高",
    description: "正确率高、提分快，建议重点突破",
    icon: Star,
    color: "text-amber-600 bg-amber-50",
  },
  {
    title: "先读题再看材料",
    description: "带着问题找数据，节省阅读时间",
    icon: Target,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "估算为主精算为辅",
    description: "选项差距大时用估算，差距小时再精算",
    icon: Calculator,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "熟记特征数字",
    description: "将百分数转化为分数计算更快",
    icon: Zap,
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
              {knowledge.questionCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-orange-50 text-orange-600 rounded-full">
                  {knowledge.questionCount}题
                </span>
              )}
              {knowledge.weight > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-50 text-amber-600 rounded-full">
                  占比{knowledge.weight}%
                </span>
              )}
            </div>
            <p className="text-sm text-stone-500 mt-1">{knowledge.description}</p>
          </div>
          <Link
            href={`/learn/xingce/ziliao/${knowledge.id}`}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
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
                    {child.questionCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded-full">
                        {child.questionCount}题
                      </span>
                    )}
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
                        className="px-2 py-0.5 text-xs bg-orange-50 text-orange-600 rounded"
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
                    <div className="space-y-1">
                      {child.formulas.map((formula, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 bg-orange-50 rounded text-xs text-orange-700 font-mono"
                        >
                          {formula}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  href={`/learn/xingce/ziliao/${knowledge.id}/${child.id}`}
                  className="px-3 py-1.5 border border-orange-200 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50 transition-colors flex-shrink-0"
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

export default function ZiliaoLearningPage() {
  const { isAuthenticated } = useAuthStore();

  // 计算总题数
  const totalQuestions = knowledgeTree.reduce((sum, k) => sum + k.questionCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600 text-white">
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
            <span className="text-sm">资料分析</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">📊</span>
                <div>
                  <h1 className="text-3xl font-bold">资料分析</h1>
                  <p className="text-white/80">考查数据处理与分析能力，性价比最高的模块</p>
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
                  <span>占比20%</span>
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
        {/* 重点提示 */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-800 mb-1">备考重点</h3>
              <p className="text-sm text-emerald-700">
                资料分析是行测中性价比最高的模块！题目规律性强，公式固定，只要掌握方法，正确率可以达到90%以上。建议优先学习并投入足够练习时间。
              </p>
            </div>
          </div>
        </div>

        {/* 学习技巧 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            学习技巧
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

        {/* 核心公式 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-orange-500" />
            核心公式
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {commonFormulas.map((card, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-xl border border-stone-200/50 overflow-hidden"
              >
                <div className={`h-1.5 bg-gradient-to-r ${card.color}`} />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <card.icon className="w-5 h-5 text-stone-600" />
                    <h3 className="font-semibold text-stone-800">{card.title}</h3>
                  </div>
                  <div className="space-y-1.5">
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

        {/* 特征数字对照表 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5 text-purple-500" />
            特征数字速记表
          </h2>
          <div className="bg-white rounded-xl border border-stone-200/50 overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-stone-200">
              <div className="bg-stone-100 px-4 py-3 font-semibold text-stone-700">百分数</div>
              <div className="bg-stone-100 px-4 py-3 font-semibold text-stone-700">分数</div>
              <div className="bg-stone-100 px-4 py-3 font-semibold text-stone-700">小数</div>
              <div className="bg-stone-100 px-4 py-3 font-semibold text-stone-700">记忆技巧</div>
            </div>
            {characteristicNumbers.map((row, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-px bg-stone-100">
                <div className="bg-white px-4 py-2.5 font-mono text-orange-600">{row.percent}</div>
                <div className="bg-white px-4 py-2.5 font-mono text-purple-600">{row.fraction}</div>
                <div className="bg-white px-4 py-2.5 font-mono text-stone-600">{row.decimal}</div>
                <div className="bg-white px-4 py-2.5 text-sm text-stone-500">
                  {row.percent === "12.5%" && "八分之一"}
                  {row.percent === "16.7%" && "六分之一"}
                  {row.percent === "33.3%" && "三分之一"}
                  {row.percent === "25%" && "四分之一"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 知识点导航 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-orange-500" />
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
              href="/learn/xingce/ziliao/videos"
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
                  <p className="text-sm text-stone-500">核心概念精讲</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">共 20 个视频</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>

            {/* 速算技巧 */}
            <Link
              href="/learn/xingce/ziliao/skills"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors">
                    速算技巧
                  </h3>
                  <p className="text-sm text-stone-500">快速计算方法</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">10 种速算技巧</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>

            {/* 材料阅读 */}
            <Link
              href="/learn/xingce/ziliao/materials"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Table className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors">
                    材料阅读技巧
                  </h3>
                  <p className="text-sm text-stone-500">快速定位数据</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">4 种材料类型</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          </div>
        </section>

        {/* 专项练习入口 */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">开始资料分析专项练习</h3>
                <p className="text-white/80">
                  掌握速算技巧，熟练运用公式，资料分析轻松拿高分
                </p>
              </div>
              <Link
                href="/learn/practice?subject=xingce&module=ziliao"
                className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-2"
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
