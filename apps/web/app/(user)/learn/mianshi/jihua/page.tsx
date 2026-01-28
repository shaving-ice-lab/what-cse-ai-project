"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Target,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Lightbulb,
  ArrowLeft,
  Star,
  CheckCircle2,
  TrendingUp,
  FileText,
  Search,
  Megaphone,
  Calendar,
  Users,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
  ListChecks,
  Flag,
} from "lucide-react";

// 计划组织题类型
const planTypes = [
  {
    id: "research",
    name: "调研类",
    icon: Search,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    description: "收集信息、了解情况的调查研究活动",
    subtypes: [
      {
        name: "调研对象确定",
        description: "确定调研的目标群体",
        tips: ["根据调研主题确定相关群体", "分层抽样确保代表性", "考虑不同立场的声音"],
        example: "领导让你就本单位作风问题进行调研，你怎么开展？",
      },
      {
        name: "调研方式选择",
        description: "选择合适的调研方法",
        tips: ["问卷调查（覆盖面广）", "实地走访（深入了解）", "座谈访谈（听取意见）", "查阅资料（了解背景）"],
        example: "如何调查基层群众对政务服务的满意度？",
      },
      {
        name: "调研内容设计",
        description: "设计调研的具体问题",
        tips: ["围绕调研目的设计", "问题要具体可答", "兼顾全面和重点"],
        example: "调研新入职公务员工作适应情况，应该问哪些问题？",
      },
      {
        name: "调研报告撰写",
        description: "整理分析形成报告",
        tips: ["数据分析要客观", "问题分析要深入", "建议要具体可行"],
        example: "调研结束后如何撰写一份高质量的调研报告？",
      },
    ],
  },
  {
    id: "publicity",
    name: "宣传类",
    icon: Megaphone,
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    description: "政策宣传、知识普及、主题宣传等活动",
    subtypes: [
      {
        name: "宣传目的明确",
        description: "明确宣传要达到的效果",
        tips: ["提高知晓率", "增强认同感", "促进行动转化"],
        example: "开展垃圾分类宣传活动，目的是什么？",
      },
      {
        name: "宣传对象确定",
        description: "确定宣传的目标人群",
        tips: ["分析受众特点", "区分重点群体", "考虑接受能力"],
        example: "如何向老年人宣传防诈骗知识？",
      },
      {
        name: "宣传方式选择",
        description: "选择有效的宣传渠道和形式",
        tips: ["线上线下结合", "传统新媒体并用", "形式多样生动"],
        example: "宣传方式有哪些？如何选择最有效的方式？",
      },
      {
        name: "宣传内容设计",
        description: "设计宣传的具体内容",
        tips: ["内容要通俗易懂", "突出重点信息", "增加互动性"],
        example: "设计一份关于禁毒知识的宣传材料。",
      },
    ],
  },
  {
    id: "activity",
    name: "活动策划类",
    icon: Calendar,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    description: "各类主题活动的策划与组织",
    subtypes: [
      {
        name: "活动主题确定",
        description: "确定活动的核心主题",
        tips: ["紧扣活动目的", "体现时代特点", "简洁有感染力"],
        example: "策划一次党员志愿服务活动，如何确定主题？",
      },
      {
        name: "活动形式设计",
        description: "设计活动的具体形式",
        tips: ["形式要新颖", "参与性要强", "效果要明显"],
        example: "开展青年读书分享活动，有哪些形式可以选择？",
      },
      {
        name: "活动流程安排",
        description: "安排活动的具体环节",
        tips: ["环节要紧凑", "时间要合理", "衔接要流畅"],
        example: "一场主题班会的流程如何安排？",
      },
      {
        name: "活动保障措施",
        description: "做好活动的后勤保障",
        tips: ["人员分工明确", "物资准备充分", "应急预案完备"],
        example: "大型户外活动需要做哪些保障工作？",
      },
    ],
  },
  {
    id: "meeting",
    name: "会议组织类",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    description: "各类会议的组织与协调",
    subtypes: [
      {
        name: "会前准备",
        description: "会议前的各项准备工作",
        tips: ["确定时间地点", "准备会议材料", "通知参会人员", "布置会场"],
        example: "组织一次部门工作会议，会前需要做哪些准备？",
      },
      {
        name: "会中服务",
        description: "会议进行中的服务工作",
        tips: ["维护会场秩序", "做好会议记录", "处理突发情况"],
        example: "会议进行中你的职责是什么？",
      },
      {
        name: "会后总结",
        description: "会议结束后的总结工作",
        tips: ["整理会议纪要", "跟踪任务落实", "反馈总结经验"],
        example: "会议结束后还有哪些工作要做？",
      },
    ],
  },
  {
    id: "rectification",
    name: "专项整治类",
    icon: ClipboardCheck,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    description: "专项检查、整治行动的组织实施",
    subtypes: [
      {
        name: "整治方案制定",
        description: "制定整治工作方案",
        tips: ["明确整治目标", "确定整治范围", "细化工作措施"],
        example: "开展校园周边环境整治，如何制定方案？",
      },
      {
        name: "整治行动实施",
        description: "组织开展整治行动",
        tips: ["分组分片推进", "严格执法检查", "做好记录留痕"],
        example: "如何组织一次食品安全专项检查？",
      },
      {
        name: "整治效果巩固",
        description: "巩固整治成果",
        tips: ["建立长效机制", "加强日常监管", "定期回头看"],
        example: "整治行动结束后如何防止问题反弹？",
      },
    ],
  },
];

// 答题框架
const answerFramework = {
  title: "计划组织题万能答题框架",
  steps: [
    {
      name: "目的意义",
      desc: "明确活动的目的和意义",
      icon: Flag,
      tips: ["开宗明义点明意义", "体现对任务的理解", "展现大局意识"],
      examples: [
        "此次调研对于了解...具有重要意义",
        "开展这项活动旨在...",
        "这项工作的目的是为了...",
      ],
    },
    {
      name: "准备阶段",
      desc: "活动前的各项准备工作",
      icon: ListChecks,
      tips: ["人员分工", "物资准备", "方案制定", "协调沟通"],
      examples: [
        "首先，我会成立工作小组...",
        "其次，制定详细的工作方案...",
        "同时，做好宣传动员和物资准备...",
      ],
    },
    {
      name: "实施阶段",
      desc: "活动的具体实施过程",
      icon: Target,
      tips: ["按计划推进", "注意细节", "灵活应变", "确保效果"],
      examples: [
        "在具体实施中...",
        "活动当天，我会...",
        "在实施过程中注意...",
      ],
    },
    {
      name: "总结阶段",
      desc: "活动后的总结提升",
      icon: Sparkles,
      tips: ["整理资料", "分析效果", "形成报告", "经验总结"],
      examples: [
        "活动结束后，我会及时总结...",
        "形成书面报告向领导汇报...",
        "总结经验教训，为今后工作提供参考...",
      ],
    },
  ],
};

// 答题技巧
const answerTips = [
  { icon: Flag, title: "目的先行", desc: "开头点明目的意义" },
  { icon: ListChecks, title: "流程清晰", desc: "按时间顺序组织内容" },
  { icon: Target, title: "重点突出", desc: "详略得当，突出关键环节" },
  { icon: Sparkles, title: "创新亮点", desc: "加入创新元素和亮点" },
];

// 类型详情展开组件
function TypeDetailCard({ type }: { type: typeof planTypes[0] }) {
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

                <div className="mb-3">
                  <p className="text-xs text-stone-400 mb-2">要点提示</p>
                  <div className="flex flex-wrap gap-2">
                    {subtype.tips.map((tip, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-1 text-xs bg-white text-stone-600 rounded-lg border border-stone-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <p className="text-xs text-stone-400 mb-1">例题</p>
                  <p className="text-sm text-stone-700">{subtype.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JihuaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white">
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
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">计划组织题</h1>
              <p className="text-white/80 mt-1">考察组织协调与统筹规划能力</p>
            </div>
          </div>

          <p className="text-lg text-white/90 mb-6 max-w-3xl">
            计划组织题主要考察考生的组织协调能力、统筹规划能力和执行落实能力。
            掌握调研、宣传、活动策划、会议组织等常见题型的答题方法。
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Star className="w-5 h-5 text-amber-300" />
              <span>重点题型</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <TrendingUp className="w-5 h-5" />
              <span>必考</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <FileText className="w-5 h-5" />
              <span>5大类型</span>
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
              <p className="text-sm text-stone-500">四步走，系统组织答题内容</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {answerFramework.steps.map((step, idx) => (
              <div key={idx} className="relative p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-lg">
                  第{idx + 1}步
                </div>

                <div className="flex items-center gap-3 mt-4 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">{step.name}</h3>
                </div>
                <p className="text-sm text-stone-500 mb-4">{step.desc}</p>

                <div className="mb-4 space-y-2">
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-stone-600">{tip}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-stone-50 rounded-xl">
                  <p className="text-xs text-stone-400 mb-2">常用句式</p>
                  {step.examples.slice(0, 2).map((example, i) => (
                    <p key={i} className="text-sm text-stone-600 mb-1 last:mb-0">
                      "{example}"
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Question Types */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">题型分类详解</h2>
              <p className="text-sm text-stone-500">点击展开查看详细内容</p>
            </div>
          </div>

          <div className="space-y-4">
            {planTypes.map((type) => (
              <TypeDetailCard key={type.id} type={type} />
            ))}
          </div>
        </section>

        {/* Answer Tips */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-stone-800">答题技巧</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {answerTips.map((tip, idx) => (
                <div key={idx} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                    <tip.icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-1">{tip.title}</h3>
                  <p className="text-sm text-stone-500">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Link
            href="/learn/mianshi/zonghefenxi"
            className="flex items-center gap-2 text-stone-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>上一章：综合分析题</span>
          </Link>
          <Link
            href="/learn/mianshi/renji"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <span>下一章：人际关系题</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
