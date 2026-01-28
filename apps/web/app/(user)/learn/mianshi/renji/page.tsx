"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Lightbulb,
  ArrowLeft,
  Star,
  CheckCircle2,
  TrendingUp,
  FileText,
  UserCog,
  UserPlus,
  UserMinus,
  Heart,
  Home,
  ArrowRight,
  Sparkles,
  MessageCircle,
  HandHeart,
  Scale,
  Sun,
} from "lucide-react";

// 人际关系题类型
const relationTypes = [
  {
    id: "leader",
    name: "与领导关系",
    icon: UserCog,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    description: "处理与上级领导之间的关系",
    subtypes: [
      {
        name: "被领导批评",
        description: "如何正确对待领导的批评",
        example: "领导在会上当众批评了你，你怎么办？",
        framework: ["保持冷静接受", "反思自身问题", "改进提升", "感谢领导关心"],
      },
      {
        name: "与领导意见不一致",
        description: "当与领导看法不同时如何处理",
        example: "你认为领导的决策有问题，你怎么处理？",
        framework: ["先执行领导决定", "选择合适时机沟通", "提出建设性意见", "尊重最终决定"],
      },
      {
        name: "多头领导",
        description: "面对多位领导指挥如何协调",
        example: "两位领导同时给你布置了任务，你怎么处理？",
        framework: ["分清主次轻重", "及时沟通汇报", "统筹安排时间", "确保都能完成"],
      },
      {
        name: "新领导上任",
        description: "如何与新领导建立良好关系",
        example: "新领导刚上任，你如何尽快适应？",
        framework: ["主动汇报工作", "了解领导风格", "积极配合支持", "用实绩说话"],
      },
    ],
  },
  {
    id: "colleague",
    name: "与同事关系",
    icon: UserPlus,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    description: "处理与同事之间的关系",
    subtypes: [
      {
        name: "同事不配合",
        description: "同事工作不配合如何处理",
        example: "合作项目中同事不配合工作，你怎么办？",
        framework: ["了解原因", "主动沟通", "寻求帮助", "解决问题"],
      },
      {
        name: "同事抢功劳",
        description: "同事抢夺工作成果如何应对",
        example: "你的工作成果被同事占为己有，怎么处理？",
        framework: ["保持冷静", "不当面冲突", "用事实说话", "向领导汇报"],
      },
      {
        name: "同事间矛盾",
        description: "协调同事之间的矛盾",
        example: "两位同事发生矛盾影响工作，你怎么处理？",
        framework: ["保持中立", "分别沟通", "化解误会", "促进和解"],
      },
      {
        name: "新同事相处",
        description: "如何与新同事建立关系",
        example: "科室新来了一位同事，你如何帮助他适应？",
        framework: ["主动热情", "耐心指导", "适度关心", "共同进步"],
      },
    ],
  },
  {
    id: "subordinate",
    name: "与下属关系",
    icon: UserMinus,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    description: "处理与下属之间的关系",
    subtypes: [
      {
        name: "下属不服从",
        description: "下属不服从管理如何处理",
        example: "下属不服从你的工作安排，你怎么办？",
        framework: ["了解原因", "沟通谈心", "明确要求", "适当调整"],
      },
      {
        name: "下属能力不足",
        description: "帮助能力不足的下属提升",
        example: "下属工作能力不足，经常出错，怎么办？",
        framework: ["分析原因", "耐心指导", "给予机会", "鼓励进步"],
      },
      {
        name: "下属间矛盾",
        description: "协调下属之间的矛盾",
        example: "两名下属发生矛盾，影响团队氛围，怎么处理？",
        framework: ["了解情况", "公正处理", "化解矛盾", "预防复发"],
      },
    ],
  },
  {
    id: "public",
    name: "与群众关系",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    description: "处理与服务对象（群众）的关系",
    subtypes: [
      {
        name: "群众不理解",
        description: "群众对政策不理解如何解释",
        example: "群众对新政策有误解，情绪激动，你怎么处理？",
        framework: ["耐心倾听", "解释说明", "换位思考", "寻求理解"],
      },
      {
        name: "群众投诉",
        description: "面对群众投诉如何处理",
        example: "有群众到单位投诉你的服务态度，你怎么办？",
        framework: ["虚心接受", "反思问题", "道歉改正", "举一反三"],
      },
      {
        name: "群众诉求处理",
        description: "处理群众的各种诉求",
        example: "群众反映的问题暂时无法解决，你怎么处理？",
        framework: ["认真记录", "解释原因", "承诺跟进", "及时反馈"],
      },
    ],
  },
  {
    id: "family",
    name: "与亲友关系",
    icon: Home,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    description: "处理工作与亲友关系的平衡",
    subtypes: [
      {
        name: "亲友请托",
        description: "亲友托你办事如何处理",
        example: "亲戚托你帮忙办理不符合规定的事，你怎么办？",
        framework: ["坚持原则", "耐心解释", "寻求理解", "维护关系"],
      },
      {
        name: "工作与家庭平衡",
        description: "如何平衡工作与家庭",
        example: "工作太忙影响了家庭生活，你怎么处理？",
        framework: ["提高效率", "合理规划", "争取理解", "珍惜相处"],
      },
    ],
  },
];

// 答题原则
const answerPrinciples = [
  {
    name: "阳光心态",
    icon: Sun,
    desc: "保持积极乐观的态度看待问题",
    tips: ["不抱怨", "不推诿", "正面思考"],
  },
  {
    name: "换位思考",
    icon: Heart,
    desc: "站在对方角度理解问题",
    tips: ["理解对方立场", "体谅对方难处", "寻找共同点"],
  },
  {
    name: "有效沟通",
    icon: MessageCircle,
    desc: "通过沟通解决问题",
    tips: ["主动沟通", "真诚表达", "耐心倾听"],
  },
  {
    name: "工作为重",
    icon: Scale,
    desc: "以不影响工作为前提处理关系",
    tips: ["大局为重", "以工作为中心", "不因私废公"],
  },
];

// 类型详情展开组件
function TypeDetailCard({ type }: { type: typeof relationTypes[0] }) {
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

                <div className="flex flex-wrap gap-2">
                  <p className="text-xs text-stone-400 w-full mb-1">答题思路</p>
                  {subtype.framework.map((step, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 text-xs bg-white text-stone-600 rounded-lg border border-stone-200">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
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

export default function RenjiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-white">
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
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">人际关系题</h1>
              <p className="text-white/80 mt-1">考察人际交往与协调沟通能力</p>
            </div>
          </div>

          <p className="text-lg text-white/90 mb-6 max-w-3xl">
            人际关系题主要考察处理与领导、同事、下属、群众等不同主体之间关系的能力。
            关键是保持阳光心态、换位思考、有效沟通，以工作为重。
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
        {/* Answer Principles */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">人际关系题四大原则</h2>
              <p className="text-sm text-stone-500">处理人际关系的核心要义</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {answerPrinciples.map((principle, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                  <principle.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-2">{principle.name}</h3>
                <p className="text-sm text-stone-500 mb-4">{principle.desc}</p>
                <div className="space-y-2">
                  {principle.tips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-stone-600">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Question Types */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">题型分类详解</h2>
              <p className="text-sm text-stone-500">点击展开查看详细内容</p>
            </div>
          </div>

          <div className="space-y-4">
            {relationTypes.map((type) => (
              <TypeDetailCard key={type.id} type={type} />
            ))}
          </div>
        </section>

        {/* Tips Card */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <HandHeart className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-stone-800">答题小贴士</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                <h3 className="font-semibold text-stone-800 mb-2">✅ 应该做的</h3>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li>• 主动承担责任，不推诿</li>
                  <li>• 站在对方角度考虑问题</li>
                  <li>• 以工作为重，公私分明</li>
                  <li>• 真诚沟通，化解矛盾</li>
                </ul>
              </div>
              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                <h3 className="font-semibold text-stone-800 mb-2">❌ 不应该做的</h3>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li>• 抱怨指责对方</li>
                  <li>• 当面顶撞领导</li>
                  <li>• 背后议论同事</li>
                  <li>• 逃避问题不处理</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Link
            href="/learn/mianshi/jihua"
            className="flex items-center gap-2 text-stone-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>上一章：计划组织题</span>
          </Link>
          <Link
            href="/learn/mianshi/yingji"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <span>下一章：应急应变题</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
