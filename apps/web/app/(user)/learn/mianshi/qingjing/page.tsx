"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Theater,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  ArrowLeft,
  Star,
  CheckCircle2,
  TrendingUp,
  FileText,
  MessageSquare,
  HelpCircle,
  Heart,
  ArrowRight,
  Sparkles,
  Mic,
  Target,
  Volume2,
} from "lucide-react";

// 情景模拟题类型
const sceneTypes = [
  {
    id: "persuade",
    name: "劝说类",
    icon: MessageSquare,
    color: "from-teal-500 to-emerald-600",
    bgColor: "bg-teal-50",
    textColor: "text-teal-600",
    description: "模拟劝说他人接受某种观点或行为",
    subtypes: [
      {
        name: "劝说群众",
        description: "劝说群众理解政策、配合工作",
        example: "一位老大爷不愿意拆迁，请你现场劝说。",
        tips: ["态度诚恳", "换位思考", "晓之以理", "动之以情"],
        framework: ["称呼问候", "理解心情", "分析利弊", "提出方案", "争取支持"],
      },
      {
        name: "劝说同事",
        description: "劝说同事改变想法或行为",
        example: "同事小李最近工作状态不好，请你现场劝说。",
        tips: ["关心为主", "不要说教", "给予支持", "提供帮助"],
        framework: ["表示关心", "了解原因", "分析问题", "鼓励支持", "共同努力"],
      },
      {
        name: "劝说领导",
        description: "委婉劝说领导改变决定",
        example: "领导的决策可能存在问题，请你现场劝说。",
        tips: ["尊重为先", "委婉表达", "提供依据", "尊重决定"],
        framework: ["肯定初衷", "提出担忧", "分析利弊", "提供建议", "服从安排"],
      },
    ],
  },
  {
    id: "explain",
    name: "解释类",
    icon: HelpCircle,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    description: "对政策、规定或情况进行解释说明",
    subtypes: [
      {
        name: "政策解释",
        description: "向群众解释政策规定",
        example: "群众对新政策不理解，请你现场解释。",
        tips: ["通俗易懂", "耐心细致", "举例说明", "回答疑问"],
        framework: ["表示理解", "政策背景", "具体内容", "办理流程", "答疑解惑"],
      },
      {
        name: "误会澄清",
        description: "澄清误解，消除矛盾",
        example: "群众误解了你的工作方式，请你现场澄清。",
        tips: ["态度诚恳", "承认不足", "解释原因", "改进服务"],
        framework: ["道歉表态", "还原真相", "解释原因", "改进措施", "请求理解"],
      },
    ],
  },
  {
    id: "comfort",
    name: "安抚类",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    description: "安抚情绪激动的人员",
    subtypes: [
      {
        name: "情绪安抚",
        description: "安抚情绪激动的群众或同事",
        example: "一位群众因办事不顺情绪激动，请你现场安抚。",
        tips: ["先稳情绪", "耐心倾听", "表示理解", "解决问题"],
        framework: ["安抚情绪", "认真倾听", "表示理解", "解决问题", "感谢配合"],
      },
      {
        name: "矛盾化解",
        description: "化解双方之间的矛盾",
        example: "两位群众在窗口发生争吵，请你现场调解。",
        tips: ["及时制止", "分开双方", "分别了解", "公正调解"],
        framework: ["制止冲突", "稳定情绪", "了解情况", "公正调解", "促成和解"],
      },
    ],
  },
];

// 模拟技巧
const simulationTips = [
  {
    icon: Theater,
    title: "入情入境",
    desc: "真正把自己代入场景中，感受对方的处境和情绪",
  },
  {
    icon: Volume2,
    title: "语言得体",
    desc: "根据对象调整语气和用词，体现尊重和专业",
  },
  {
    icon: Heart,
    title: "态度真诚",
    desc: "真诚地关心对方，让对方感受到你的善意",
  },
  {
    icon: Target,
    title: "目标明确",
    desc: "始终记住模拟的目的，围绕目标展开对话",
  },
];

// 常用开场白
const openingLines = [
  { scene: "劝说群众", lines: ["大爷/大妈您好，我是...的工作人员", "您先别着急，咱们坐下来慢慢聊"] },
  { scene: "劝说同事", lines: ["小李，最近忙不忙？有空聊聊吗？", "我发现你最近好像有点心事"] },
  { scene: "解释政策", lines: ["您好，这个政策我来给您详细解释一下", "我理解您的困惑，让我来说明一下"] },
  { scene: "安抚情绪", lines: ["您先消消气，有什么问题我们一定帮您解决", "我非常理解您现在的心情"] },
];

// 类型详情展开组件
function TypeDetailCard({ type }: { type: typeof sceneTypes[0] }) {
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
                      <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs">
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

export default function QingjingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 text-white">
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
              <Theater className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">情景模拟题</h1>
              <p className="text-white/80 mt-1">考察沟通表达与临场应对能力</p>
            </div>
          </div>

          <p className="text-lg text-white/90 mb-6 max-w-3xl">
            情景模拟题要求考生现场扮演特定角色，与考官进行模拟对话。
            关键是入情入境、语言得体、态度真诚，展现良好的沟通能力。
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Star className="w-5 h-5 text-amber-300" />
              <span>进阶题型</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <TrendingUp className="w-5 h-5" />
              <span>中频</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <FileText className="w-5 h-5" />
              <span>3大类型</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Simulation Tips */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">模拟技巧</h2>
              <p className="text-sm text-stone-500">情景模拟题的核心要领</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {simulationTips.map((tip, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                  <tip.icon className="w-6 h-6 text-teal-600" />
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
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Theater className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">题型分类详解</h2>
              <p className="text-sm text-stone-500">点击展开查看详细内容</p>
            </div>
          </div>

          <div className="space-y-4">
            {sceneTypes.map((type) => (
              <TypeDetailCard key={type.id} type={type} />
            ))}
          </div>
        </section>

        {/* Opening Lines */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Mic className="w-6 h-6 text-teal-500" />
              <h2 className="text-xl font-bold text-stone-800">常用开场白</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {openingLines.map((item, idx) => (
                <div key={idx} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                  <h3 className="font-semibold text-stone-800 mb-3">{item.scene}</h3>
                  <ul className="space-y-2">
                    {item.lines.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                        <span className="text-teal-500 mt-1">•</span>
                        <span>"{line}"</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Card */}
        <section className="mb-12">
          <div className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
            <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              情景模拟注意事项
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-stone-700 mb-3">✅ 应该做的</h4>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>开口说话，真正进行模拟对话</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>使用第一人称和第二人称</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>语气自然、表情适当</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>适当加入肢体语言</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-stone-700 mb-3">❌ 不应该做的</h4>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">×</span>
                    <span>只叙述不模拟（我会跟他说...）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">×</span>
                    <span>语气生硬、像背诵</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">×</span>
                    <span>忘记场景设定</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">×</span>
                    <span>态度傲慢或过于卑微</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Link
            href="/learn/mianshi/ziwo"
            className="flex items-center gap-2 text-stone-600 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>上一章：自我认知题</span>
          </Link>
          <Link
            href="/learn/mianshi/wulingdao"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <span>下一章：无领导小组讨论</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
