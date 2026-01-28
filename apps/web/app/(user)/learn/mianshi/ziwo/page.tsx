"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  ArrowLeft,
  Star,
  CheckCircle2,
  TrendingUp,
  FileText,
  Target,
  User,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Compass,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";

// 自我认知题类型
const selfTypes = [
  {
    id: "motivation",
    name: "求职动机",
    icon: Target,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
    description: "考察报考公务员的真实动机和职业规划",
    subtypes: [
      {
        name: "为什么报考",
        description: "阐述报考公务员的原因",
        example: "你为什么报考公务员？",
        tips: ["对职业的认识", "个人理想追求", "家庭影响", "服务意识"],
        framework: ["职业认知", "个人特质匹配", "服务意愿", "职业规划"],
      },
      {
        name: "为什么选择这个岗位",
        description: "阐述选择该岗位的理由",
        example: "你为什么报考这个岗位？",
        tips: ["岗位了解", "能力匹配", "地域因素", "发展空间"],
        framework: ["岗位认知", "自身优势", "匹配度分析", "工作期望"],
      },
      {
        name: "职业规划",
        description: "未来的职业发展规划",
        example: "谈谈你的五年职业规划。",
        tips: ["短期目标", "中期目标", "长期目标", "切合实际"],
        framework: ["适应岗位", "提升能力", "做出贡献", "持续成长"],
      },
    ],
  },
  {
    id: "self-intro",
    name: "自我介绍",
    icon: User,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    description: "全面展示自己的个人背景和特点",
    subtypes: [
      {
        name: "学习经历",
        description: "介绍教育背景和学习成果",
        example: "请介绍一下你的学习经历。",
        tips: ["突出专业相关", "展示学习能力", "有亮点成绩"],
        framework: ["教育背景", "专业知识", "学习成果", "能力提升"],
      },
      {
        name: "工作经历",
        description: "介绍工作或实习经历",
        example: "请介绍一下你的工作经历。",
        tips: ["与岗位相关", "展示工作能力", "具体事例"],
        framework: ["工作内容", "取得成绩", "获得成长", "能力展示"],
      },
      {
        name: "性格特点",
        description: "描述个人性格特征",
        example: "请用几个词概括你的性格特点。",
        tips: ["真实客观", "与岗位匹配", "有具体事例支撑"],
        framework: ["性格特点", "形成原因", "具体表现", "岗位匹配"],
      },
      {
        name: "兴趣爱好",
        description: "展示个人兴趣爱好",
        example: "你有什么兴趣爱好？",
        tips: ["积极健康", "体现品质", "不要太多"],
        framework: ["爱好内容", "投入时间", "获得收获", "能力体现"],
      },
    ],
  },
  {
    id: "pros-cons",
    name: "优缺点分析",
    icon: ThumbsUp,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    description: "客观分析自身优缺点",
    subtypes: [
      {
        name: "谈优点",
        description: "介绍自己的优势",
        example: "你认为你最大的优点是什么？",
        tips: ["与岗位相关", "有具体事例", "不要自夸"],
        framework: ["优点是什么", "形成原因", "具体事例", "岗位应用"],
      },
      {
        name: "谈缺点",
        description: "坦诚面对自己的不足",
        example: "你认为你最大的缺点是什么？",
        tips: ["真实但不致命", "展示改进意识", "不说假缺点"],
        framework: ["缺点是什么", "产生影响", "改进措施", "改进效果"],
      },
    ],
  },
  {
    id: "values",
    name: "价值观考察",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    description: "考察人生观、价值观、职业观",
    subtypes: [
      {
        name: "人生观",
        description: "对人生的理解和追求",
        example: "你认为什么样的人生是有意义的？",
        tips: ["积极向上", "有责任感", "体现奉献精神"],
        framework: ["人生追求", "价值实现", "社会贡献", "个人成长"],
      },
      {
        name: "职业观",
        description: "对职业和工作的态度",
        example: "你怎么看待公务员这份工作？",
        tips: ["正确认识", "服务意识", "责任担当"],
        framework: ["职业认知", "工作态度", "职业追求", "责任担当"],
      },
    ],
  },
];

// 答题技巧
const answerTips = [
  { icon: CheckCircle2, title: "真实具体", desc: "内容要真实，用具体事例支撑" },
  { icon: Target, title: "岗位匹配", desc: "突出与岗位要求的匹配度" },
  { icon: Sparkles, title: "积极正面", desc: "保持积极正面的态度" },
  { icon: Award, title: "适度谦虚", desc: "不要过度自夸或贬低自己" },
];

// 常见问题
const commonQuestions = [
  "你为什么报考公务员？",
  "请做一个简单的自我介绍。",
  "你认为你最大的优点和缺点是什么？",
  "如果这次面试没有通过，你会怎么办？",
  "你对基层工作有什么认识？",
  "你如何看待公务员的待遇问题？",
  "请用三个词来形容你自己。",
  "你的座右铭是什么？",
];

// 类型详情展开组件
function TypeDetailCard({ type }: { type: typeof selfTypes[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center gap-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div className={`w-14 h-14 rounded-xl ${type.bgColor} flex items-center justify-center flex-shrink-0`}>
          <type.icon className={`w-7 h-7 ${type.textColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-stone-800">{type.name}</h3>
          <p className="text-sm text-stone-500">{type.description}</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

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

                <div className="mb-3 p-3 bg-white rounded-lg border border-stone-200">
                  <p className="text-xs text-stone-400 mb-1">例题</p>
                  <p className="text-sm text-stone-700">{subtype.example}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-stone-400 mb-2">注意要点</p>
                  <div className="flex flex-wrap gap-2">
                    {subtype.tips.map((tip, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-white text-stone-600 rounded-lg border border-stone-200">
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <p className="text-xs text-stone-400 w-full mb-1">答题框架</p>
                  {subtype.framework.map((step, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 text-xs bg-white text-stone-600 rounded-lg border border-stone-200">
                      <span className="w-4 h-4 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs">
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

export default function ZiwoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 text-white">
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
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">自我认知题</h1>
              <p className="text-white/80 mt-1">考察自我认知与岗位匹配度</p>
            </div>
          </div>

          <p className="text-lg text-white/90 mb-6 max-w-3xl">
            自我认知题主要考察对自己的了解程度、求职动机的真实性以及与岗位的匹配度。
            关键是真实具体、积极正面、与岗位匹配。
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Star className="w-5 h-5 text-amber-300" />
              <span>常规题型</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <TrendingUp className="w-5 h-5" />
              <span>高频</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <FileText className="w-5 h-5" />
              <span>4大类型</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Answer Tips */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">答题技巧</h2>
              <p className="text-sm text-stone-500">掌握自我认知题的核心要领</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {answerTips.map((tip, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                  <tip.icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-2">{tip.title}</h3>
                <p className="text-sm text-stone-500">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Question Types */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">题型分类详解</h2>
              <p className="text-sm text-stone-500">点击展开查看详细内容</p>
            </div>
          </div>

          <div className="space-y-4">
            {selfTypes.map((type) => (
              <TypeDetailCard key={type.id} type={type} />
            ))}
          </div>
        </section>

        {/* Common Questions */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Compass className="w-6 h-6 text-violet-500" />
              <h2 className="text-xl font-bold text-stone-800">常见问题</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {commonQuestions.map((question, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-stone-700">{question}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Card */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-emerald-500" />
                推荐的回答方式
              </h3>
              <ul className="space-y-3 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>用具体事例来支撑自己的观点</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>展示与岗位要求相匹配的特质</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>保持谦虚但自信的态度</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>表达对岗位的热忱和服务意识</span>
                </li>
              </ul>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <ThumbsDown className="w-5 h-5 text-red-500" />
                应该避免的错误
              </h3>
              <ul className="space-y-3 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">×</span>
                  <span>说假话或过度包装自己</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">×</span>
                  <span>说缺点时说致命缺点</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">×</span>
                  <span>表现出只看重待遇和稳定</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">×</span>
                  <span>套话连篇、空洞无物</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Link
            href="/learn/mianshi/yingji"
            className="flex items-center gap-2 text-stone-600 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>上一章：应急应变题</span>
          </Link>
          <Link
            href="/learn/mianshi/qingjing"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <span>下一章：情景模拟题</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
