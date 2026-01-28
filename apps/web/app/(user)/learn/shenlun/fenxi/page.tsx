"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Play,
  Clock,
  Target,
  List,
  Layers,
  Bookmark,
  Star,
  Award,
  Zap,
  AlertCircle,
  Scale,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  ArrowRightLeft,
} from "lucide-react";

// 综合分析题型分类
const analysisTypes = [
  {
    id: "explain",
    name: "解释型分析",
    description: "解释词语、句子或观点的含义",
    structure: ["是什么（解释含义）", "为什么（分析原因/内涵）", "怎么办（得出结论/对策）"],
    examples: ["请谈谈对'XX'的理解", "解释'XX'的含义"],
    tips: ["把握关键词的表层和深层含义", "结合材料语境理解"],
    frequency: "high",
    count: 40,
  },
  {
    id: "evaluate",
    name: "评价型分析",
    description: "对某一观点或做法进行评价",
    structure: ["表态判断（赞同/反对/辩证）", "理由阐述（正面/反面论证）", "结论表态"],
    examples: ["对'XX'的看法", "评价'XX'观点"],
    tips: ["先表态后论证", "辩证看待问题"],
    frequency: "high",
    count: 35,
  },
  {
    id: "compare",
    name: "比较型分析",
    description: "比较两个或多个事物的异同",
    structure: ["相同点分析", "不同点分析", "综合评价/启示"],
    examples: ["比较A与B的异同", "分析XX的变化"],
    tips: ["从多角度进行对比", "注意逻辑层次"],
    frequency: "medium",
    count: 15,
  },
  {
    id: "enlightenment",
    name: "启示型分析",
    description: "从案例或经验中提炼启示",
    structure: ["提炼经验做法", "分析成功原因", "得出可借鉴启示"],
    examples: ["XX给我们的启示", "从XX中得到什么启示"],
    tips: ["启示要有普适性", "可转化为具体措施"],
    frequency: "medium",
    count: 10,
  },
  {
    id: "relation",
    name: "关系型分析",
    description: "分析要素之间的关系",
    structure: ["明确分析对象", "阐述各要素内涵", "分析相互关系"],
    examples: ["分析A与B的关系", "谈谈对XX关系的认识"],
    tips: ["常见关系：相辅相成、辩证统一等", "注意关系的多面性"],
    frequency: "low",
    count: 5,
  },
];

// 答题结构模板
const answerStructures = [
  {
    id: "total",
    name: "总-分-总结构",
    icon: Layers,
    color: "text-blue-600 bg-blue-100",
    description: "最常用的综合分析答题结构",
    template: [
      { part: "总", content: "亮明观点/解释含义" },
      { part: "分", content: "多角度分析论证" },
      { part: "总", content: "得出结论/提出对策" },
    ],
    applicable: ["解释型", "评价型", "关系型"],
  },
  {
    id: "what-why-how",
    name: "是什么-为什么-怎么办",
    icon: HelpCircle,
    color: "text-purple-600 bg-purple-100",
    description: "逻辑清晰的递进式结构",
    template: [
      { part: "是什么", content: "明确概念/现象" },
      { part: "为什么", content: "分析原因/意义" },
      { part: "怎么办", content: "提出对策/措施" },
    ],
    applicable: ["解释型", "评价型"],
  },
  {
    id: "thesis-antithesis",
    name: "正-反-合结构",
    icon: Scale,
    color: "text-emerald-600 bg-emerald-100",
    description: "辩证分析的经典结构",
    template: [
      { part: "正", content: "正面分析/积极意义" },
      { part: "反", content: "反面分析/消极影响" },
      { part: "合", content: "综合结论/辩证看待" },
    ],
    applicable: ["评价型", "比较型"],
  },
];

// 真题示例
const examExamples = [
  {
    id: 1,
    year: "2025",
    type: "国考",
    level: "副省级",
    title: "谈谈对'让数据多跑路，让群众少跑腿'的理解",
    analysisType: "解释型",
    difficulty: "中等",
    score: 15,
    wordLimit: 250,
  },
  {
    id: 2,
    year: "2024",
    type: "国考",
    level: "地市级",
    title: "对'躺平'现象的看法",
    analysisType: "评价型",
    difficulty: "较难",
    score: 20,
    wordLimit: 300,
  },
  {
    id: 3,
    year: "2024",
    type: "省考",
    level: "浙江",
    title: "比较传统媒体与新媒体在乡村振兴中的作用",
    analysisType: "比较型",
    difficulty: "中等",
    score: 20,
    wordLimit: 350,
  },
];

// 常见分析角度
const analysisAngles = {
  positive: ["意义", "价值", "作用", "优势", "好处", "积极影响"],
  negative: ["问题", "不足", "弊端", "风险", "挑战", "消极影响"],
  cause: ["原因", "背景", "根源", "因素", "成因"],
  method: ["对策", "措施", "建议", "做法", "方法"],
};

// 题型卡片组件
function TypeCard({ type, index }: { type: typeof analysisTypes[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  
  const frequencyColors = {
    high: "text-red-600 bg-red-50 border-red-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    low: "text-stone-600 bg-stone-50 border-stone-200",
  };

  const frequencyLabels = {
    high: "高频",
    medium: "中频",
    low: "低频",
  };

  return (
    <div
      className="bg-white rounded-xl border border-stone-200/50 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="p-5 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-stone-800">{type.name}</h3>
              <span className={`px-2 py-0.5 text-xs rounded border ${frequencyColors[type.frequency]}`}>
                {frequencyLabels[type.frequency]}
              </span>
              <span className="text-sm text-stone-500">{type.count} 道真题</span>
            </div>
            <p className="text-stone-600">{type.description}</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-stone-400 transition-transform flex-shrink-0 ml-4 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-stone-100 pt-4 space-y-4">
          {/* 答题结构 */}
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              答题结构
            </h4>
            <div className="flex flex-wrap gap-2">
              {type.structure.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-stone-600">{step}</span>
                  {idx < type.structure.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 常见题目表述 */}
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              常见题目表述
            </h4>
            <div className="flex flex-wrap gap-2">
              {type.examples.map((example, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-lg">
                  {example}
                </span>
              ))}
            </div>
          </div>

          {/* 答题技巧 */}
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              答题技巧
            </h4>
            <ul className="space-y-2">
              {type.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/learn/shenlun/fenxi/practice?type=${type.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              开始练习
            </Link>
            <Link
              href={`/learn/shenlun/fenxi/examples?type=${type.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              查看真题
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// 结构模板卡片
function StructureCard({ structure, index }: { structure: typeof answerStructures[0]; index: number }) {
  const Icon = structure.icon;
  
  return (
    <div
      className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-shadow animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-10 h-10 rounded-lg ${structure.color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-stone-800 mb-1">{structure.name}</h3>
          <p className="text-sm text-stone-500">{structure.description}</p>
        </div>
      </div>

      {/* 结构模板 */}
      <div className="space-y-2 mb-4">
        {structure.template.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <span className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-sm font-semibold text-stone-700">
              {item.part}
            </span>
            <span className="text-sm text-stone-600">{item.content}</span>
          </div>
        ))}
      </div>

      {/* 适用题型 */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-stone-500">适用题型：</span>
        {structure.applicable.map((type, idx) => (
          <span key={idx} className="px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded">
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

// 真题卡片
function ExamCard({ exam, index }: { exam: typeof examExamples[0]; index: number }) {
  return (
    <Link
      href={`/learn/shenlun/fenxi/exam/${exam.id}`}
      className="group block p-5 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
            {exam.year}{exam.type}
          </span>
          <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded">
            {exam.level}
          </span>
          <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
            {exam.analysisType}
          </span>
        </div>
        <span className="text-sm text-stone-500">{exam.score}分</span>
      </div>

      <h3 className="font-semibold text-stone-800 group-hover:text-purple-600 transition-colors mb-3">
        {exam.title}
      </h3>

      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>{exam.wordLimit}字</span>
        <span>{exam.difficulty}</span>
      </div>
    </Link>
  );
}

export default function FenxiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 返回导航 */}
        <Link
          href="/learn/shenlun"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-purple-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回申论学习
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">综合分析</h1>
              <p className="text-white/80">深度分析问题，展现思维能力</p>
            </div>
          </div>
          <p className="text-white/90 max-w-2xl mb-6">
            综合分析题考察考生的分析能力和思维深度，要求对特定问题、现象、观点进行多角度、深层次的分析。
            掌握不同题型的答题结构，提升综合分析能力。
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">95+</span>
              <span className="text-white/80">真题解析</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span className="font-semibold">5</span>
              <span className="text-white/80">题型分类</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">20-30</span>
              <span className="text-white/80">分钟/题</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 题型分类 */}
            <section>
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                题型分类
              </h2>
              <div className="space-y-3">
                {analysisTypes.map((type, idx) => (
                  <TypeCard key={type.id} type={type} index={idx} />
                ))}
              </div>
            </section>

            {/* 答题结构 */}
            <section>
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-blue-500" />
                答题结构模板
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {answerStructures.map((structure, idx) => (
                  <StructureCard key={structure.id} structure={structure} index={idx} />
                ))}
              </div>
            </section>

            {/* 经典题目精讲 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  经典题目精讲
                </h2>
                <Link
                  href="/learn/shenlun/fenxi/examples"
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {examExamples.map((exam, idx) => (
                  <ExamCard key={exam.id} exam={exam} index={idx} />
                ))}
              </div>
            </section>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 快速练习 */}
            <div className="bg-white rounded-xl border border-stone-200/50 p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                快速练习
              </h3>
              <div className="space-y-3">
                <Link
                  href="/learn/shenlun/fenxi/practice"
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-stone-800">随机练习</p>
                      <p className="text-sm text-stone-500">随机抽取题目</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-purple-500 transition-colors" />
                </Link>
                <Link
                  href="/learn/shenlun/fenxi/practice?mode=timed"
                  className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-stone-800">限时训练</p>
                      <p className="text-sm text-stone-500">模拟考试时间</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-indigo-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* 常见分析角度 */}
            <div className="bg-white rounded-xl border border-stone-200/50 p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                常见分析角度
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">积极/正面</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisAngles.positive.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-600 rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">消极/负面</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisAngles.negative.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">原因分析</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisAngles.cause.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">对策建议</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisAngles.method.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 学习提示 */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-5">
              <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-500" />
                学习提示
              </h3>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  综合分析强调逻辑性和层次感
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  解释型重在理解，评价型重在判断
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  善用总分总结构组织答案
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  辩证思维是高分关键
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
