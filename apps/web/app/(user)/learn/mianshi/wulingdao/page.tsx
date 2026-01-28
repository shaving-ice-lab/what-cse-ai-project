"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UsersRound,
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
  Scale,
  ListOrdered,
  Shuffle,
  Crown,
  Clock,
  Pencil,
  Users,
  ArrowRight,
  Sparkles,
  Target,
  AlertCircle,
} from "lucide-react";

// 题型分类
const questionTypes = [
  {
    id: "open",
    name: "开放式问题",
    icon: MessageSquare,
    description: "没有固定答案，考察思维的广度和深度",
    example: "如何提升年轻人的职业素养？",
    tips: ["观点要有创意", "论证要充分", "注意听取他人意见"],
  },
  {
    id: "dilemma",
    name: "两难式问题",
    icon: Scale,
    description: "二选一的问题，考察决策能力",
    example: "效率和公平，你更看重哪个？",
    tips: ["明确自己立场", "理由要充分", "尊重不同观点"],
  },
  {
    id: "ranking",
    name: "排序式问题",
    icon: ListOrdered,
    description: "对多个选项进行排序，考察逻辑能力",
    example: "将以下6种品质按重要性排序。",
    tips: ["确定排序标准", "逻辑要清晰", "争取形成共识"],
  },
  {
    id: "resource",
    name: "资源分配式问题",
    icon: Shuffle,
    description: "有限资源如何分配，考察协调能力",
    example: "100万资金如何在5个项目间分配？",
    tips: ["明确分配原则", "考虑各方利益", "寻求最大共识"],
  },
];

// 角色策略
const roleStrategies = [
  {
    role: "领导者",
    icon: Crown,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    description: "主导讨论进程，引导形成共识",
    strategies: [
      "开场破冰，提出讨论框架",
      "引导发言顺序，确保人人参与",
      "总结归纳各方观点",
      "推动形成最终结论",
    ],
    tips: ["不要强势压人", "注意倾听他人", "把控讨论节奏"],
    risk: "可能被认为过于强势",
  },
  {
    role: "时间控制者",
    icon: Clock,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    description: "把控讨论时间，确保按时完成",
    strategies: [
      "开场提醒时间分配",
      "适时提醒剩余时间",
      "推动讨论进入下一环节",
      "确保有时间总结",
    ],
    tips: ["不要只管时间", "同时要有观点贡献", "提醒要委婉"],
    risk: "可能被认为参与度不够",
  },
  {
    role: "记录者",
    icon: Pencil,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    description: "记录讨论要点，便于总结汇报",
    strategies: [
      "记录各方主要观点",
      "整理分歧和共识",
      "为总结提供依据",
      "必要时做补充发言",
    ],
    tips: ["边记边参与讨论", "记录要简洁准确", "主动分享记录内容"],
    risk: "可能忙于记录而忽视讨论",
  },
  {
    role: "普通讨论者",
    icon: Users,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    description: "积极参与讨论，贡献有价值的观点",
    strategies: [
      "认真倾听他人发言",
      "适时表达自己观点",
      "对他人观点给予反馈",
      "推动讨论向前推进",
    ],
    tips: ["不要沉默不语", "不要抢话", "学会借力表达"],
    risk: "可能存在感不足",
  },
];

// 讨论流程
const discussionPhases = [
  {
    phase: "个人陈述阶段",
    duration: "每人1-3分钟",
    description: "每位成员依次发表自己的观点",
    tips: [
      "观点要鲜明",
      "论证要简洁",
      "把握好时间",
      "不要急于反驳",
    ],
  },
  {
    phase: "自由讨论阶段",
    duration: "约20-30分钟",
    description: "自由交流、碰撞观点、形成共识",
    tips: [
      "积极参与讨论",
      "学会倾听",
      "适时总结",
      "推动形成共识",
    ],
  },
  {
    phase: "总结陈词阶段",
    duration: "约3-5分钟",
    description: "由一人代表小组进行总结汇报",
    tips: [
      "全面准确总结",
      "突出共识部分",
      "说明保留意见",
      "感谢团队配合",
    ],
  },
];

// 高分技巧
const highScoreTips = [
  { icon: Target, title: "积极参与", desc: "主动发言，但不要抢话" },
  { icon: TrendingUp, title: "有效推进", desc: "推动讨论向前发展，不要原地打转" },
  { icon: Users, title: "团队协作", desc: "尊重他人，促进团队合作" },
  { icon: Crown, title: "控场能力", desc: "在混乱时能够引导讨论回到正轨" },
];

export default function WulingdaoPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>("领导者");

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 text-white">
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
              <UsersRound className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">无领导小组讨论</h1>
              <p className="text-white/80 mt-1">考察团队协作与领导能力</p>
            </div>
          </div>

          <p className="text-lg text-white/90 mb-6 max-w-3xl">
            无领导小组讨论是一种群体面试方式，6-9名考生组成小组，在没有指定领导的情况下
            讨论给定问题并形成共识。考察协作能力、表达能力和领导潜质。
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Star className="w-5 h-5 text-amber-300" />
              <span>特殊面试形式</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Users className="w-5 h-5" />
              <span>国考/省考常见</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <FileText className="w-5 h-5" />
              <span>4种题型</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Question Types */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">题型分类</h2>
              <p className="text-sm text-stone-500">无领导小组讨论常见题型</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {questionTypes.map((type, idx) => (
              <div key={type.id} className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <type.icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800 mb-1">{type.name}</h3>
                    <p className="text-sm text-stone-500 mb-3">{type.description}</p>
                    <div className="p-3 bg-stone-50 rounded-lg mb-3">
                      <p className="text-xs text-stone-400">例题</p>
                      <p className="text-sm text-stone-700">{type.example}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {type.tips.map((tip, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-cyan-50 text-cyan-600 rounded-lg">
                          {tip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Role Strategies */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">角色策略</h2>
              <p className="text-sm text-stone-500">选择适合自己的角色定位</p>
            </div>
          </div>

          <div className="space-y-4">
            {roleStrategies.map((item) => (
              <div key={item.role} className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
                <button
                  onClick={() => setExpandedRole(expandedRole === item.role ? null : item.role)}
                  className="w-full p-6 flex items-center gap-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-6 h-6 ${item.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800">{item.role}</h3>
                    <p className="text-sm text-stone-500">{item.description}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expandedRole === item.role ? "rotate-180" : ""}`} />
                </button>

                {expandedRole === item.role && (
                  <div className="px-6 pb-6 border-t border-stone-100">
                    <div className="pt-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-stone-700 mb-3">核心策略</h4>
                        <ul className="space-y-2">
                          {item.strategies.map((strategy, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-700 mb-3">注意事项</h4>
                        <ul className="space-y-2">
                          {item.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            风险提示：{item.risk}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Discussion Phases */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">讨论流程</h2>
              <p className="text-sm text-stone-500">无领导小组讨论的三个阶段</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {discussionPhases.map((phase, idx) => (
              <div key={idx} className="relative p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-lg">
                  第{idx + 1}阶段
                </div>

                <h3 className="text-lg font-bold text-stone-800 mt-4 mb-2">{phase.phase}</h3>
                <p className="text-xs text-blue-600 mb-3">{phase.duration}</p>
                <p className="text-sm text-stone-500 mb-4">{phase.description}</p>

                <div className="space-y-2">
                  {phase.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-stone-600">{tip}</span>
                    </div>
                  ))}
                </div>

                {idx < discussionPhases.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 z-10">
                    <ArrowRight className="w-5 h-5 text-stone-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* High Score Tips */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-stone-800">高分技巧</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {highScoreTips.map((tip, idx) => (
                <div key={idx} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center mb-3">
                    <tip.icon className="w-5 h-5 text-cyan-600" />
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
            href="/learn/mianshi/qingjing"
            className="flex items-center gap-2 text-stone-600 hover:text-cyan-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>上一章：情景模拟题</span>
          </Link>
          <Link
            href="/learn/mianshi/liyi"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <span>下一章：面试礼仪与技巧</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
