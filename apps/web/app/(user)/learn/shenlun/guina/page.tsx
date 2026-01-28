"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Play,
  Clock,
  Lightbulb,
  List,
  Layers,
  Bookmark,
  Star,
  Award,
  Zap,
  Search,
  AlertCircle,
  PenTool,
} from "lucide-react";

// 归纳概括题型分类
const questionTypes = [
  {
    id: "problem",
    name: "概括问题",
    description: "找出材料中反映的问题表现",
    examples: ["概括XX领域存在的问题", "概括XX方面的不足"],
    tips: ["关注负面词汇", "注意问题表现与原因的区分"],
    frequency: "high",
    count: 35,
  },
  {
    id: "reason",
    name: "概括原因",
    description: "分析问题产生的主客观原因",
    examples: ["分析XX问题产生的原因", "概括XX现象的成因"],
    tips: ["区分主观与客观原因", "多角度分析"],
    frequency: "high",
    count: 28,
  },
  {
    id: "method",
    name: "概括做法/经验",
    description: "总结成功做法和可借鉴经验",
    examples: ["概括XX的成功做法", "总结XX的经验"],
    tips: ["按主体或层面分类", "突出可操作性"],
    frequency: "high",
    count: 30,
  },
  {
    id: "feature",
    name: "概括特点/变化",
    description: "归纳事物的特征或发展变化",
    examples: ["概括XX的特点", "概括XX的变化趋势"],
    tips: ["对比分析", "时间线索梳理"],
    frequency: "medium",
    count: 15,
  },
  {
    id: "impact",
    name: "概括影响/意义",
    description: "分析某事物的正面或负面影响",
    examples: ["概括XX的积极影响", "分析XX的意义"],
    tips: ["分正负两面", "分层次（个人、社会、国家）"],
    frequency: "medium",
    count: 12,
  },
];

// 答题方法步骤
const answerSteps = [
  {
    step: 1,
    title: "审题",
    icon: Search,
    color: "text-blue-600 bg-blue-100",
    content: [
      { label: "作答对象", desc: "明确概括什么（问题/原因/做法等）" },
      { label: "限定条件", desc: "注意材料范围、角度限制" },
      { label: "字数要求", desc: "合理分配字数，留有余地" },
      { label: "分值分配", desc: "根据分值判断要点数量" },
    ],
  },
  {
    step: 2,
    title: "阅读材料",
    icon: FileText,
    color: "text-emerald-600 bg-emerald-100",
    content: [
      { label: "关键词标注", desc: "标出与作答对象相关的词句" },
      { label: "段落大意", desc: "概括每段的核心内容" },
      { label: "逻辑关系", desc: "理清材料的层次结构" },
      { label: "信息分类", desc: "将相关信息归类整理" },
    ],
  },
  {
    step: 3,
    title: "要点提取",
    icon: Target,
    color: "text-amber-600 bg-amber-100",
    content: [
      { label: "直接摘抄", desc: "材料中的规范表述直接使用" },
      { label: "同义替换", desc: "口语化表述转为书面语" },
      { label: "归纳总结", desc: "多条信息合并为一点" },
      { label: "合理推导", desc: "根据材料逻辑推出隐含要点" },
    ],
  },
  {
    step: 4,
    title: "答案加工",
    icon: PenTool,
    color: "text-purple-600 bg-purple-100",
    content: [
      { label: "分类整理", desc: "按逻辑或主题分类排列" },
      { label: "逻辑排序", desc: "按重要性或逻辑顺序排列" },
      { label: "规范表述", desc: "使用总分结构，要点清晰" },
      { label: "字数控制", desc: "精简语言，控制在要求范围内" },
    ],
  },
];

// 真题解析示例
const examExamples = [
  {
    id: 1,
    year: "2025",
    type: "国考",
    level: "副省级",
    title: "概括"数字乡村"建设取得的成效",
    difficulty: "中等",
    score: 15,
    wordLimit: 200,
    tags: ["概括做法", "乡村振兴"],
  },
  {
    id: 2,
    year: "2025",
    type: "国考",
    level: "地市级",
    title: "概括社区治理中存在的问题",
    difficulty: "简单",
    score: 10,
    wordLimit: 150,
    tags: ["概括问题", "基层治理"],
  },
  {
    id: 3,
    year: "2024",
    type: "省考",
    level: "浙江",
    title: "归纳"共富工坊"的主要做法",
    difficulty: "中等",
    score: 20,
    wordLimit: 250,
    tags: ["概括做法", "共同富裕"],
  },
];

// 高频词汇
const frequentWords = {
  problems: ["缺乏", "不足", "薄弱", "滞后", "缺失", "不健全", "不完善", "不到位"],
  reasons: ["由于", "因为", "导致", "造成", "引发", "源于", "根源在于"],
  methods: ["通过", "采取", "实施", "推进", "加强", "完善", "健全", "建立"],
  effects: ["促进", "推动", "提升", "增强", "改善", "实现", "保障"],
};

// 题型卡片组件
function TypeCard({ type, index }: { type: typeof questionTypes[0]; index: number }) {
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
          {/* 常见题目表述 */}
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              常见题目表述
            </h4>
            <div className="flex flex-wrap gap-2">
              {type.examples.map((example, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg">
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
              href={`/learn/shenlun/guina/practice?type=${type.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              开始练习
            </Link>
            <Link
              href={`/learn/shenlun/guina/examples?type=${type.id}`}
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

// 答题步骤卡片
function StepCard({ step, index }: { step: typeof answerSteps[0]; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const Icon = step.icon;

  return (
    <div
      className="bg-white rounded-xl border border-stone-200/50 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className="p-4 cursor-pointer hover:bg-stone-50 transition-colors flex items-center gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500">步骤 {step.step}</span>
            <h3 className="font-semibold text-stone-800">{step.title}</h3>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-100 pt-3">
          <div className="grid md:grid-cols-2 gap-3">
            {step.content.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-stone-700 text-sm">{item.label}</p>
                  <p className="text-sm text-stone-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 真题卡片
function ExamCard({ exam, index }: { exam: typeof examExamples[0]; index: number }) {
  return (
    <Link
      href={`/learn/shenlun/guina/exam/${exam.id}`}
      className="group block p-5 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
            {exam.year}{exam.type}
          </span>
          <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded">
            {exam.level}
          </span>
        </div>
        <span className="text-sm text-stone-500">{exam.score}分</span>
      </div>

      <h3 className="font-semibold text-stone-800 group-hover:text-blue-600 transition-colors mb-3">
        {exam.title}
      </h3>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {exam.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-600 rounded">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span>{exam.wordLimit}字</span>
          <span>·</span>
          <span>{exam.difficulty}</span>
        </div>
      </div>
    </Link>
  );
}

export default function GuinaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 返回导航 */}
        <Link
          href="/learn/shenlun"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回申论学习
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">归纳概括</h1>
              <p className="text-white/80">申论基础题型，答案要点来源于材料</p>
            </div>
          </div>
          <p className="text-white/90 max-w-2xl mb-6">
            归纳概括题是申论考试的基础题型，考察从给定材料中提取、归纳、整合信息的能力。
            掌握好这一题型，为其他题型打下坚实基础。
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">120+</span>
              <span className="text-white/80">真题解析</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span className="font-semibold">5</span>
              <span className="text-white/80">题型分类</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">15-20</span>
              <span className="text-white/80">分钟/题</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：题型分类 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 题型分类 */}
            <section>
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                题型分类
              </h2>
              <div className="space-y-3">
                {questionTypes.map((type, idx) => (
                  <TypeCard key={type.id} type={type} index={idx} />
                ))}
              </div>
            </section>

            {/* 答题方法 */}
            <section>
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-emerald-500" />
                答题方法
              </h2>
              <div className="space-y-3">
                {answerSteps.map((step, idx) => (
                  <StepCard key={step.step} step={step} index={idx} />
                ))}
              </div>
            </section>

            {/* 真题精讲 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  真题精讲
                </h2>
                <Link
                  href="/learn/shenlun/guina/examples"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                <Zap className="w-5 h-5 text-amber-500" />
                快速练习
              </h3>
              <div className="space-y-3">
                <Link
                  href="/learn/shenlun/guina/practice"
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-stone-800">随机练习</p>
                      <p className="text-sm text-stone-500">随机抽取题目练习</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-blue-500 transition-colors" />
                </Link>
                <Link
                  href="/learn/shenlun/guina/practice?mode=timed"
                  className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-stone-800">限时训练</p>
                      <p className="text-sm text-stone-500">模拟考试时间限制</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* 高频词汇 */}
            <div className="bg-white rounded-xl border border-stone-200/50 p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-purple-500" />
                高频词汇速查
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">问题类词汇</p>
                  <div className="flex flex-wrap gap-2">
                    {frequentWords.problems.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">原因类词汇</p>
                  <div className="flex flex-wrap gap-2">
                    {frequentWords.reasons.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">做法类词汇</p>
                  <div className="flex flex-wrap gap-2">
                    {frequentWords.methods.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">影响类词汇</p>
                  <div className="flex flex-wrap gap-2">
                    {frequentWords.effects.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-600 rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 学习提示 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-5">
              <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                学习提示
              </h3>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  归纳概括是所有题型的基础，务必打牢
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  答案要点必须来源于材料
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  注意字数限制，精简表达
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  多做真题，培养语感
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
