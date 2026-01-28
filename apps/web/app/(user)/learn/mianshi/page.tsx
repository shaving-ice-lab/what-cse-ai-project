"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Users,
  MessageSquare,
  Brain,
  AlertTriangle,
  UserCheck,
  Theater,
  UsersRound,
  Award,
  ChevronRight,
  BookOpen,
  Target,
  Clock,
  Sparkles,
  ArrowLeft,
  Play,
  Star,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  Video,
  FileText,
} from "lucide-react";

// 面试形式
const interviewFormats = [
  {
    id: "structured",
    name: "结构化面试",
    description: "标准化提问，考察综合分析、组织协调等能力",
    icon: MessageSquare,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    features: ["规范化流程", "评分客观", "最常见形式"],
  },
  {
    id: "leaderless",
    name: "无领导小组讨论",
    description: "多人讨论，考察团队协作和领导能力",
    icon: UsersRound,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    features: ["团队协作", "综合评估", "国考常见"],
  },
  {
    id: "semi-structured",
    name: "半结构化面试",
    description: "在结构化基础上允许追问深入了解",
    icon: MessageSquare,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    features: ["灵活追问", "深度考察", "部分岗位"],
  },
];

// 题型导航
const questionTypes = [
  {
    id: "zonghefenxi",
    name: "综合分析题",
    description: "社会现象、政策理解、名言警句、哲理故事分析",
    icon: Brain,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    importance: "核心题型",
    frequency: "必考",
    href: "/learn/mianshi/zonghefenxi",
    topics: ["社会现象类", "政策理解类", "名言警句类", "哲理故事类"],
  },
  {
    id: "jihua",
    name: "计划组织题",
    description: "调研、宣传、活动策划、会议组织等工作方案",
    icon: Target,
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    importance: "重点题型",
    frequency: "必考",
    href: "/learn/mianshi/jihua",
    topics: ["调研类", "宣传类", "活动策划类", "会议组织类"],
  },
  {
    id: "renji",
    name: "人际关系题",
    description: "处理与领导、同事、下属、群众的关系",
    icon: Users,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    importance: "重点题型",
    frequency: "必考",
    href: "/learn/mianshi/renji",
    topics: ["与领导关系", "与同事关系", "与下属关系", "与群众关系"],
  },
  {
    id: "yingji",
    name: "应急应变题",
    description: "公共危机、工作危机、舆情处理、日常应变",
    icon: AlertTriangle,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    importance: "重点题型",
    frequency: "高频",
    href: "/learn/mianshi/yingji",
    topics: ["公共危机类", "工作危机类", "舆情处理类", "日常应变类"],
  },
  {
    id: "ziwo",
    name: "自我认知题",
    description: "求职动机、自我介绍、优缺点分析",
    icon: UserCheck,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
    importance: "常规题型",
    frequency: "高频",
    href: "/learn/mianshi/ziwo",
    topics: ["求职动机", "自我介绍", "优缺点分析", "价值观考察"],
  },
  {
    id: "qingjing",
    name: "情景模拟题",
    description: "劝说类、解释类、安抚类模拟对话",
    icon: Theater,
    color: "from-teal-500 to-emerald-600",
    bgColor: "bg-teal-50",
    textColor: "text-teal-600",
    importance: "进阶题型",
    frequency: "中频",
    href: "/learn/mianshi/qingjing",
    topics: ["劝说类", "解释类", "安抚类"],
  },
];

// 特殊面试形式
const specialFormats = [
  {
    id: "wulingdao",
    name: "无领导小组讨论",
    description: "题型分类、角色策略、讨论流程、高分技巧",
    icon: UsersRound,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-600",
    href: "/learn/mianshi/wulingdao",
    topics: ["开放式问题", "两难式问题", "排序式问题", "资源分配式"],
  },
];

// 面试技巧
const interviewSkills = [
  {
    id: "liyi",
    name: "面试礼仪与技巧",
    description: "着装规范、仪态举止、语言表达、心理调适",
    icon: Award,
    color: "from-amber-500 to-yellow-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    href: "/learn/mianshi/liyi",
    topics: ["着装规范", "仪态举止", "语言表达", "心理调适"],
  },
];

// 学习路径
const learningPath = [
  { step: 1, title: "了解面试", desc: "面试形式与评分标准" },
  { step: 2, title: "题型突破", desc: "逐个击破六大题型" },
  { step: 3, title: "礼仪规范", desc: "形象举止与表达" },
  { step: 4, title: "模拟实战", desc: "全真模拟练习" },
];

// 学习建议
const studyTips = [
  { icon: Video, title: "每日练习", desc: "坚持每天练习1-2道真题" },
  { icon: Mic, title: "开口说", desc: "大声说出答案，训练表达能力" },
  { icon: Clock, title: "控时间", desc: "结构化面试每题2-3分钟" },
  { icon: FileText, title: "积素材", desc: "积累时政热点和名言警句" },
];

// 题型卡片组件
function QuestionTypeCard({ type, index }: { type: typeof questionTypes[0]; index: number }) {
  return (
    <Link
      href={type.href}
      className="group relative overflow-hidden bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${type.color}`} />
      
      <div className="p-6">
        {/* Icon and badges */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${type.bgColor} flex items-center justify-center`}>
            <type.icon className={`w-6 h-6 ${type.textColor}`} />
          </div>
          <div className="flex gap-2">
            <span className={`px-2 py-1 text-xs font-medium ${type.bgColor} ${type.textColor} rounded-lg`}>
              {type.importance}
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-amber-50 text-amber-600 rounded-lg">
              {type.frequency}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-amber-600 transition-colors">
          {type.name}
        </h3>
        <p className="text-sm text-stone-500 mb-4 line-clamp-2">
          {type.description}
        </p>

        {/* Topics */}
        <div className="flex flex-wrap gap-2 mb-4">
          {type.topics.slice(0, 3).map((topic, idx) => (
            <span key={idx} className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded-lg">
              {topic}
            </span>
          ))}
          {type.topics.length > 3 && (
            <span className="px-2 py-1 text-xs bg-stone-100 text-stone-500 rounded-lg">
              +{type.topics.length - 3}
            </span>
          )}
        </div>

        {/* Action */}
        <div className="flex items-center gap-2 text-sm font-medium text-amber-600 group-hover:text-amber-700">
          <span>开始学习</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default function MianshiLearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="relative container mx-auto px-4 py-10 max-w-7xl">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习中心
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">🎤</span>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">面试</h1>
                  <p className="text-white/80">结构化面试 · 无领导小组讨论</p>
                </div>
              </div>

              <p className="text-lg text-white/90 mb-6 max-w-2xl">
                面试是公考的最后关卡，考察综合素质和临场应变能力。掌握六大题型答题技巧，
                规范礼仪举止，从容应对每一道面试题。
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-semibold">6大</span>
                  <span className="text-white/80">核心题型</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span className="font-semibold">30+</span>
                  <span className="text-white/80">答题框架</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">100+</span>
                  <span className="text-white/80">真题示例</span>
                </div>
              </div>
            </div>

            {/* Learning Path Quick View */}
            <div className="lg:w-80 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                学习路径
              </h3>
              <div className="space-y-3">
                {learningPath.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-white/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Interview Formats */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Mic className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">面试形式</h2>
              <p className="text-sm text-stone-500">了解不同面试形式的特点</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {interviewFormats.map((format, idx) => (
              <div
                key={format.id}
                className="group p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${format.bgColor} flex items-center justify-center mb-4`}>
                  <format.icon className="w-6 h-6 text-current opacity-70" />
                </div>
                <h3 className="font-semibold text-stone-800 mb-2">{format.name}</h3>
                <p className="text-sm text-stone-500 mb-4">{format.description}</p>
                <div className="flex flex-wrap gap-2">
                  {format.features.map((feature, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded-lg">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Question Types - 6大核心题型 */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Brain className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">结构化面试六大题型</h2>
                <p className="text-sm text-stone-500">掌握每种题型的答题思路和技巧</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questionTypes.map((type, idx) => (
              <QuestionTypeCard key={type.id} type={type} index={idx} />
            ))}
          </div>
        </section>

        {/* Special Formats & Skills */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* 无领导小组讨论 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <UsersRound className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">特殊面试形式</h2>
                <p className="text-sm text-stone-500">部分岗位采用的面试方式</p>
              </div>
            </div>

            {specialFormats.map((format) => (
              <Link
                key={format.id}
                href={format.href}
                className="group block p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${format.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <format.icon className={`w-7 h-7 ${format.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800 mb-2 group-hover:text-amber-600 transition-colors">
                      {format.name}
                    </h3>
                    <p className="text-sm text-stone-500 mb-3">{format.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {format.topics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded-lg">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </section>

          {/* 面试礼仪与技巧 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">面试技巧</h2>
                <p className="text-sm text-stone-500">提升面试整体表现</p>
              </div>
            </div>

            {interviewSkills.map((skill) => (
              <Link
                key={skill.id}
                href={skill.href}
                className="group block p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${skill.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <skill.icon className={`w-7 h-7 ${skill.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800 mb-2 group-hover:text-amber-600 transition-colors">
                      {skill.name}
                    </h3>
                    <p className="text-sm text-stone-500 mb-3">{skill.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {skill.topics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded-lg">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </section>
        </div>

        {/* Study Tips */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-stone-800">面试备考建议</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {studyTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                    <tip.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-1">{tip.title}</h3>
                  <p className="text-sm text-stone-500">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Start CTA */}
        <section className="text-center py-10">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">
            从综合分析题开始你的面试学习之旅
          </h2>
          <p className="text-stone-500 mb-6 max-w-lg mx-auto">
            综合分析题是结构化面试的核心题型，掌握好综合分析，面试就成功了一半
          </p>
          <Link
            href="/learn/mianshi/zonghefenxi"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <Play className="w-5 h-5" />
            开始学习综合分析题
          </Link>
        </section>
      </div>
    </div>
  );
}
