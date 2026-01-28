"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Target,
  Lightbulb,
  ArrowLeft,
  Play,
  Star,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  MessageSquare,
  Quote,
  BookMarked,
  Sparkles,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

// 综合分析题类型
const analysisTypes = [
  {
    id: "social-phenomenon",
    name: "社会现象类",
    icon: "🌍",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    description: "对社会热点事件、现象进行分析评价",
    subtypes: [
      {
        name: "正面现象",
        description: "分析积极社会现象的意义和推广价值",
        example: "某市推出"共享雨伞"便民服务，对此你怎么看？",
        framework: ["表明态度（肯定）", "分析积极意义", "分析可能存在的问题", "提出推广建议"],
      },
      {
        name: "负面现象",
        description: "分析问题产生的原因并提出对策",
        example: "近年来"校园贷"问题频发，你怎么看？",
        framework: ["表明态度（否定/担忧）", "分析危害", "分析原因", "提出对策"],
      },
      {
        name: "两面性现象",
        description: "辩证分析既有利又有弊的现象",
        example: "对于网络直播带货现象，你怎么看？",
        framework: ["客观表态", "分析积极意义", "分析存在问题", "提出建议"],
      },
      {
        name: "热点话题",
        description: "时政热点分析框架",
        example: "谈谈你对"躺平"现象的看法。",
        framework: ["解释概念", "分析现象背后原因", "辩证看待", "提出建议"],
      },
    ],
  },
  {
    id: "policy-understanding",
    name: "政策理解类",
    icon: "📜",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    description: "对政府政策进行分析理解",
    subtypes: [
      {
        name: "政策背景分析",
        description: "理解政策出台的背景和原因",
        example: "国家推出"双减"政策，你怎么理解？",
        framework: ["政策背景", "政策内容", "政策意义", "执行建议"],
      },
      {
        name: "政策意义分析",
        description: "分析政策的积极作用",
        example: "对于延迟退休政策，你怎么看？",
        framework: ["表明态度", "分析必要性", "分析积极意义", "提出落实建议"],
      },
      {
        name: "政策问题分析",
        description: "分析政策执行中可能存在的问题",
        example: ""垃圾分类"政策推行中存在哪些困难？如何解决？",
        framework: ["肯定政策方向", "分析执行困难", "分析原因", "提出对策"],
      },
      {
        name: "政策建议",
        description: "对政策提出完善建议",
        example: "如何让惠民政策更好地落地？",
        framework: ["肯定政策初衷", "分析落实难点", "提出完善建议"],
      },
    ],
  },
  {
    id: "quotes",
    name: "名言警句类",
    icon: "💬",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    description: "理解并阐述名言警句的含义",
    subtypes: [
      {
        name: "习近平讲话",
        description: "习近平总书记重要讲话精神",
        example: "习近平总书记说"空谈误国，实干兴邦"，谈谈你的理解。",
        framework: ["解释含义", "分析重要性", "结合实际", "如何践行"],
      },
      {
        name: "古代名言",
        description: "古代经典名言的理解与应用",
        example: ""纸上得来终觉浅，绝知此事要躬行"，你怎么理解？",
        framework: ["解释字面意思", "揭示深层含义", "结合工作实际", "表明践行决心"],
      },
      {
        name: "领导人论述",
        description: "党和国家领导人的重要论述",
        example: ""人民对美好生活的向往，就是我们的奋斗目标"，谈谈你的理解。",
        framework: ["解释核心要义", "分析时代背景", "联系工作实际", "如何贯彻落实"],
      },
    ],
  },
  {
    id: "philosophical-story",
    name: "哲理故事类",
    icon: "📖",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    description: "从故事中提炼人生道理",
    subtypes: [
      {
        name: "寓言故事",
        description: "从寓言故事中提炼道理",
        example: "龟兔赛跑的故事给你什么启示？",
        framework: ["概述故事", "揭示道理", "联系实际", "总结升华"],
      },
      {
        name: "名人事迹",
        description: "从名人事迹中获得启发",
        example: "结合袁隆平院士的事迹，谈谈你的感悟。",
        framework: ["概述事迹", "分析品质", "结合自身", "表明决心"],
      },
      {
        name: "启示提炼",
        description: "从故事中提炼多重启示",
        example: "一位老农说"庄稼不骗人"，你怎么理解？",
        framework: ["解释含义", "多角度分析启示", "联系工作实际", "总结"],
      },
    ],
  },
];

// 答题框架
const answerFramework = {
  title: "综合分析题万能答题框架",
  steps: [
    {
      name: "破题表态",
      desc: "开门见山表明观点态度",
      tips: ["态度要鲜明", "切忌模棱两可", "可适当解释题目关键词"],
      examples: [
        "我认为这种现象值得肯定...",
        "对于这个问题，我持批评/担忧的态度...",
        "这个问题需要辩证看待...",
      ],
    },
    {
      name: "分析论述",
      desc: "多角度深入分析",
      tips: ["分析要有逻辑", "主体分析法（政府/社会/个人）", "层面分析法（思想/制度/监管）"],
      examples: [
        "从政府层面来看...",
        "对于个人而言...",
        "追根溯源，产生这种现象的原因有...",
      ],
    },
    {
      name: "总结升华",
      desc: "总结观点或提出对策",
      tips: ["对策要具体可行", "可结合自身岗位", "升华到更高层面"],
      examples: [
        "为了解决这个问题，我认为可以从以下方面着手...",
        "作为一名即将走上工作岗位的公务员，我会...",
        "只有这样，才能实现...",
      ],
    },
  ],
};

// 高频考点
const hotTopics = [
  "共同富裕", "乡村振兴", "营商环境", "基层治理", "数字经济",
  "绿色发展", "老龄化", "就业创业", "文化自信", "法治建设",
];

// 答题技巧
const answerTips = [
  { icon: Target, title: "观点鲜明", desc: "开头表态要明确，不要含糊" },
  { icon: ClipboardList, title: "结构清晰", desc: "分点论述，层次分明" },
  { icon: BookMarked, title: "内容充实", desc: "多角度分析，论据充分" },
  { icon: Sparkles, title: "语言得体", desc: "措辞准确，表达流畅" },
];

// 类型详情展开组件
function TypeDetailCard({ type }: { type: typeof analysisTypes[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center gap-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div className={`w-14 h-14 rounded-xl ${type.bgColor} flex items-center justify-center text-3xl flex-shrink-0`}>
          {type.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-stone-800">{type.name}</h3>
          <p className="text-sm text-stone-500">{type.description}</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-stone-100">
          <div className="pt-4 space-y-4">
            {type.subtypes.map((subtype, idx) => (
              <div key={idx} className="p-4 bg-stone-50 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium ${type.bgColor} ${type.textColor} rounded-lg`}>
                    {subtype.name}
                  </span>
                  <p className="text-sm text-stone-600 flex-1">{subtype.description}</p>
                </div>

                {/* Example */}
                <div className="mb-3 p-3 bg-white rounded-lg border border-stone-200">
                  <p className="text-xs text-stone-400 mb-1">例题</p>
                  <p className="text-sm text-stone-700">{subtype.example}</p>
                </div>

                {/* Framework */}
                <div className="flex flex-wrap gap-2">
                  {subtype.framework.map((step, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 text-xs bg-white text-stone-600 rounded-lg border border-stone-200">
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ZongheFenxiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 text-white">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="relative container mx-auto px-4 py-10 max-w-7xl">
          <Link
            href="/learn/mianshi"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回面试学习
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">综合分析题</h1>
              <p className="text-white/80 mt-1">结构化面试核心题型，必考重点</p>
            </div>
          </div>

          <p className="text-lg text-white/90 mb-6 max-w-3xl">
            综合分析题考察考生对社会现象、政策、名言警句等的分析能力，
            要求观点鲜明、分析深入、逻辑清晰。掌握好综合分析题，面试就成功了一半。
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Star className="w-5 h-5 text-amber-300" />
              <span>核心题型</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <TrendingUp className="w-5 h-5" />
              <span>必考</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <FileText className="w-5 h-5" />
              <span>4大类型</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Answer Framework */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">{answerFramework.title}</h2>
              <p className="text-sm text-stone-500">三步走，轻松作答综合分析题</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {answerFramework.steps.map((step, idx) => (
              <div key={idx} className="relative p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                {/* Step Number */}
                <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg">
                  第{idx + 1}步
                </div>

                <h3 className="text-lg font-bold text-stone-800 mt-4 mb-2">{step.name}</h3>
                <p className="text-sm text-stone-500 mb-4">{step.desc}</p>

                {/* Tips */}
                <div className="mb-4 space-y-2">
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-stone-600">{tip}</span>
                    </div>
                  ))}
                </div>

                {/* Examples */}
                <div className="p-3 bg-stone-50 rounded-xl">
                  <p className="text-xs text-stone-400 mb-2">常用句式</p>
                  {step.examples.map((example, i) => (
                    <p key={i} className="text-sm text-stone-600 mb-1 last:mb-0">
                      "{example}"
                    </p>
                  ))}
                </div>

                {/* Arrow to next */}
                {idx < answerFramework.steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 z-10">
                    <ArrowRight className="w-5 h-5 text-stone-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Question Types */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">题型分类详解</h2>
              <p className="text-sm text-stone-500">点击展开查看详细内容</p>
            </div>
          </div>

          <div className="space-y-4">
            {analysisTypes.map((type) => (
              <TypeDetailCard key={type.id} type={type} />
            ))}
          </div>
        </section>

        {/* Answer Tips */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-rose-500" />
              <h2 className="text-xl font-bold text-stone-800">答题技巧</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {answerTips.map((tip, idx) => (
                <div key={idx} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center mb-3">
                    <tip.icon className="w-5 h-5 text-rose-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-1">{tip.title}</h3>
                  <p className="text-sm text-stone-500">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hot Topics */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">高频考点</h2>
              <p className="text-sm text-stone-500">近年面试热点话题</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {hotTopics.map((topic, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white rounded-xl border border-stone-200 text-stone-700 hover:border-rose-300 hover:text-rose-600 transition-colors cursor-pointer"
              >
                {topic}
              </span>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Link
            href="/learn/mianshi"
            className="flex items-center gap-2 text-stone-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回面试学习</span>
          </Link>
          <Link
            href="/learn/mianshi/jihua"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <span>下一章：计划组织题</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
