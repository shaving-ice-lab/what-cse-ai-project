"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  ArrowLeft,
  Star,
  CheckCircle2,
  TrendingUp,
  FileText,
  ShieldAlert,
  Briefcase,
  Globe,
  Zap,
  ArrowRight,
  Heart,
  Search,
  ListChecks,
  Shield,
} from "lucide-react";

// 应急应变题类型
const emergencyTypes = [
  {
    id: "public-crisis",
    name: "公共危机类",
    icon: ShieldAlert,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    description: "自然灾害、事故灾难、公共卫生等重大突发事件",
    subtypes: [
      {
        name: "自然灾害应对",
        description: "地震、洪水、台风等自然灾害的应急处理",
        example: "你正在基层调研时突发山洪，你怎么处理？",
        framework: ["保护人员安全", "组织有序撤离", "上报情况", "协助救援", "善后处理"],
      },
      {
        name: "事故灾难处理",
        description: "火灾、交通事故、安全生产事故等",
        example: "你在窗口工作时办事大厅突然发生火灾，怎么办？",
        framework: ["启动应急预案", "组织人员疏散", "报警求援", "现场处置", "配合调查"],
      },
      {
        name: "公共卫生事件",
        description: "疫情、食物中毒等公共卫生突发事件",
        example: "单位食堂发生疑似食物中毒事件，你怎么处理？",
        framework: ["控制事态", "救治伤员", "报告上级", "查找原因", "安抚情绪"],
      },
      {
        name: "社会安全事件",
        description: "群体性事件、暴力冲突等社会安全事件",
        example: "你在值班时有群众到单位聚集上访，怎么处理？",
        framework: ["稳定情绪", "了解诉求", "依法处置", "报告领导", "跟踪反馈"],
      },
    ],
  },
  {
    id: "work-crisis",
    name: "工作危机类",
    icon: Briefcase,
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    description: "工作中遇到的各种突发状况和困境",
    subtypes: [
      {
        name: "工作突发状况",
        description: "工作中遇到的意外情况",
        example: "重要汇报会上PPT无法打开，你怎么办？",
        framework: ["保持冷静", "临时应对", "灵活处理", "事后补救"],
      },
      {
        name: "任务冲突",
        description: "多项任务同时需要处理",
        example: "两项紧急任务同时需要你处理，时间冲突，怎么办？",
        framework: ["分清轻重缓急", "合理调配资源", "请示领导", "协调安排"],
      },
      {
        name: "资源不足",
        description: "人手、时间、资金等资源不足",
        example: "任务紧急但人手不够，你怎么处理？",
        framework: ["分析需求", "争取资源", "优化流程", "合理分工"],
      },
    ],
  },
  {
    id: "public-opinion",
    name: "舆情处理类",
    icon: Globe,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    description: "网络舆情、媒体采访等舆论应对",
    subtypes: [
      {
        name: "网络舆情应对",
        description: "负面网络舆情的处理",
        example: "网上出现针对你单位的负面帖子，你怎么处理？",
        framework: ["监测舆情", "核实情况", "及时回应", "正面引导", "长效治理"],
      },
      {
        name: "媒体采访应对",
        description: "面对记者采访如何回应",
        example: "有记者突然到单位采访负面事件，你怎么处理？",
        framework: ["礼貌接待", "了解来意", "按程序办", "谨慎回应", "报告领导"],
      },
      {
        name: "信息公开策略",
        description: "危机事件中的信息发布",
        example: "单位发生负面事件，如何向公众说明情况？",
        framework: ["及时发布", "实事求是", "态度诚恳", "持续更新"],
      },
    ],
  },
  {
    id: "daily-emergency",
    name: "日常应变类",
    icon: Zap,
    color: "from-teal-500 to-emerald-600",
    bgColor: "bg-teal-50",
    textColor: "text-teal-600",
    description: "日常工作中遇到的突发情况",
    subtypes: [
      {
        name: "群众冲突",
        description: "服务对象之间发生冲突",
        example: "办事大厅两位群众因排队发生争吵，你怎么处理？",
        framework: ["及时制止", "分开双方", "了解情况", "调解矛盾", "恢复秩序"],
      },
      {
        name: "误会澄清",
        description: "工作中产生的误解需要澄清",
        example: "群众误解了你的工作安排，对你表示不满，怎么办？",
        framework: ["耐心解释", "换位思考", "消除误解", "改进服务"],
      },
      {
        name: "临时任务",
        description: "突然接到紧急任务",
        example: "领导临时安排你接待一个重要的考察团，你怎么办？",
        framework: ["快速响应", "了解需求", "做好准备", "灵活应对"],
      },
    ],
  },
];

// 答题框架
const answerFramework = {
  title: "应急应变题万能答题框架",
  steps: [
    {
      name: "稳定情绪",
      desc: "保持冷静，稳定现场秩序",
      icon: Heart,
      tips: ["自己保持镇定", "安抚相关人员情绪", "控制事态发展"],
    },
    {
      name: "了解情况",
      desc: "快速收集信息，判断形势",
      icon: Search,
      tips: ["了解事件经过", "掌握关键信息", "评估严重程度"],
    },
    {
      name: "分类处理",
      desc: "针对不同情况采取措施",
      icon: ListChecks,
      tips: ["分清轻重缓急", "采取针对性措施", "协调各方资源"],
    },
    {
      name: "总结预防",
      desc: "事后总结，防止再发",
      icon: Shield,
      tips: ["反思问题原因", "总结经验教训", "建立预防机制"],
    },
  ],
};

// 类型详情展开组件
function TypeDetailCard({ type }: { type: typeof emergencyTypes[0] }) {
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
                      <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">
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

export default function YingjiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 text-white">
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
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">应急应变题</h1>
              <p className="text-white/80 mt-1">考察临场应变与危机处理能力</p>
            </div>
          </div>

          <p className="text-lg text-white/90 mb-6 max-w-3xl">
            应急应变题考察在突发情况下的应变能力和处理问题的能力。
            关键是保持冷静、分清主次、采取有效措施，确保事件妥善解决。
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Star className="w-5 h-5 text-amber-300" />
              <span>重点题型</span>
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
        {/* Answer Framework */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">{answerFramework.title}</h2>
              <p className="text-sm text-stone-500">四步走，从容应对突发情况</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {answerFramework.steps.map((step, idx) => (
              <div key={idx} className="relative p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-semibold rounded-lg">
                  第{idx + 1}步
                </div>

                <div className="flex items-center gap-3 mt-4 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">{step.name}</h3>
                </div>
                <p className="text-sm text-stone-500 mb-4">{step.desc}</p>

                <div className="space-y-2">
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-stone-600">{tip}</span>
                    </div>
                  ))}
                </div>

                {idx < answerFramework.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 z-10">
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
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">题型分类详解</h2>
              <p className="text-sm text-stone-500">点击展开查看详细内容</p>
            </div>
          </div>

          <div className="space-y-4">
            {emergencyTypes.map((type) => (
              <TypeDetailCard key={type.id} type={type} />
            ))}
          </div>
        </section>

        {/* Tips Card */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-stone-800">答题注意事项</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-stone-800 mb-3">🎯 答题要点</h3>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>保持冷静，不要慌张</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>人身安全放在第一位</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>分清事情的轻重缓急</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>及时向领导汇报情况</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 mb-3">⚠️ 常见错误</h3>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>答案过于笼统，没有具体措施</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>处理顺序混乱，主次不分</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>忽略后续跟进和总结</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>只顾解决问题，忽视安抚情绪</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Link
            href="/learn/mianshi/renji"
            className="flex items-center gap-2 text-stone-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>上一章：人际关系题</span>
          </Link>
          <Link
            href="/learn/mianshi/ziwo"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <span>下一章：自我认知题</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
