"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lightbulb,
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
  Settings,
  Users,
  Shield,
  Coins,
  GraduationCap,
  Wrench,
} from "lucide-react";

// 对策类型配置
const strategyTypes = [
  {
    id: "direct",
    name: "直接对策",
    description: "从材料中直接找到的对策措施",
    examples: ["材料中明确提到的解决措施", "成功案例中的具体做法"],
    tips: ["关注'应该'、'需要'、'建议'等提示词", "注意材料中已有的做法"],
    frequency: "high",
    count: 25,
  },
  {
    id: "indirect",
    name: "间接对策",
    description: "由问题或原因反推出的对策",
    examples: ["针对XX问题，提出解决对策", "根据原因分析，给出改进措施"],
    tips: ["将问题反向转化为对策", "原因消除即为对策"],
    frequency: "high",
    count: 35,
  },
  {
    id: "experience",
    name: "经验借鉴类",
    description: "借鉴成功经验提出对策建议",
    examples: ["总结XX的经验，为YY提供借鉴", "学习先进做法"],
    tips: ["提炼可复制的经验", "注意适用条件"],
    frequency: "medium",
    count: 15,
  },
  {
    id: "lesson",
    name: "教训启示类",
    description: "从失败教训中获得的对策启示",
    examples: ["从XX事件中吸取教训", "避免重蹈覆辙的措施"],
    tips: ["找出失败原因", "提出防范措施"],
    frequency: "low",
    count: 10,
  },
];

// 对策维度框架
const strategyDimensions = [
  {
    id: "thought",
    name: "思想层面",
    icon: Lightbulb,
    color: "text-purple-600 bg-purple-100",
    keywords: ["意识", "观念", "态度", "认识", "理念", "思维"],
    description: "转变思想观念，提高认识水平",
    examples: ["加强宣传教育，转变观念", "提高XX意识，树立XX理念"],
  },
  {
    id: "system",
    name: "制度层面",
    icon: Shield,
    color: "text-blue-600 bg-blue-100",
    keywords: ["法规", "政策", "机制", "制度", "规定", "办法"],
    description: "完善制度建设，健全体制机制",
    examples: ["完善相关法律法规", "建立健全XX机制", "出台相关政策"],
  },
  {
    id: "management",
    name: "管理层面",
    icon: Settings,
    color: "text-emerald-600 bg-emerald-100",
    keywords: ["监管", "执法", "服务", "管理", "考核", "督查"],
    description: "加强管理监督，提升服务效能",
    examples: ["加强日常监管", "严格执法检查", "优化管理流程"],
  },
  {
    id: "tech",
    name: "技术层面",
    icon: Wrench,
    color: "text-amber-600 bg-amber-100",
    keywords: ["手段", "方法", "工具", "技术", "平台", "系统"],
    description: "运用技术手段，创新工作方法",
    examples: ["搭建信息化平台", "运用大数据技术", "创新工作方法"],
  },
  {
    id: "talent",
    name: "人才层面",
    icon: Users,
    color: "text-rose-600 bg-rose-100",
    keywords: ["培训", "引进", "激励", "人才", "队伍", "培养"],
    description: "加强队伍建设，提升人员素质",
    examples: ["加强人才培养", "完善激励机制", "引进专业人才"],
  },
  {
    id: "fund",
    name: "资金层面",
    icon: Coins,
    color: "text-amber-600 bg-amber-100",
    keywords: ["投入", "保障", "补贴", "资金", "经费", "预算"],
    description: "加大资金投入，强化财政保障",
    examples: ["加大财政投入", "设立专项资金", "完善资金保障"],
  },
];

// 答题技巧
const answerTips = [
  {
    title: "对策来源分析",
    icon: Target,
    points: [
      "先从材料中寻找直接对策",
      "再从问题/原因反推间接对策",
      "最后考虑借鉴经验教训",
      "确保对策有材料依据",
    ],
  },
  {
    title: "对策表述规范",
    icon: FileText,
    points: [
      "主体明确：谁来做",
      "措施具体：做什么",
      "方式清晰：怎么做",
      "使用动宾结构",
    ],
  },
  {
    title: "对策可行性检验",
    icon: CheckCircle2,
    points: [
      "经济可行：成本合理",
      "技术可行：能够实现",
      "政策可行：符合法规",
      "操作可行：切实可行",
    ],
  },
];

// 真题示例
const examExamples = [
  {
    id: 1,
    year: "2025",
    type: "国考",
    level: "副省级",
    title: "针对基层干部存在的问题，提出改进建议",
    difficulty: "中等",
    score: 20,
    wordLimit: 300,
    tags: ["提出对策", "基层治理"],
  },
  {
    id: 2,
    year: "2024",
    type: "省考",
    level: "山东",
    title: "就如何提升农村公共服务水平提出对策建议",
    difficulty: "中等",
    score: 20,
    wordLimit: 350,
    tags: ["提出对策", "乡村振兴"],
  },
  {
    id: 3,
    year: "2024",
    type: "国考",
    level: "地市级",
    title: "针对社区养老服务存在的问题提出解决措施",
    difficulty: "较难",
    score: 25,
    wordLimit: 400,
    tags: ["提出对策", "养老服务"],
  },
];

// 维度卡片组件
function DimensionCard({ dimension, index }: { dimension: typeof strategyDimensions[0]; index: number }) {
  const Icon = dimension.icon;
  
  return (
    <div
      className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-shadow animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${dimension.color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-800 mb-1">{dimension.name}</h3>
          <p className="text-sm text-stone-600 mb-3">{dimension.description}</p>
          
          {/* 关键词 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {dimension.keywords.map((word, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded">
                {word}
              </span>
            ))}
          </div>

          {/* 常见表述 */}
          <div className="space-y-1">
            {dimension.examples.map((example, idx) => (
              <p key={idx} className="text-sm text-stone-500 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                {example}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 对策类型卡片
function TypeCard({ type, index }: { type: typeof strategyTypes[0]; index: number }) {
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
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              常见题目表述
            </h4>
            <div className="flex flex-wrap gap-2">
              {type.examples.map((example, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg">
                  {example}
                </span>
              ))}
            </div>
          </div>

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

          <div className="flex gap-3 pt-2">
            <Link
              href={`/learn/shenlun/duice/practice?type=${type.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              开始练习
            </Link>
            <Link
              href={`/learn/shenlun/duice/examples?type=${type.id}`}
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

// 真题卡片
function ExamCard({ exam, index }: { exam: typeof examExamples[0]; index: number }) {
  return (
    <Link
      href={`/learn/shenlun/duice/exam/${exam.id}`}
      className="group block p-5 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
            {exam.year}{exam.type}
          </span>
          <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded">
            {exam.level}
          </span>
        </div>
        <span className="text-sm text-stone-500">{exam.score}分</span>
      </div>

      <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors mb-3">
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

export default function DuicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 返回导航 */}
        <Link
          href="/learn/shenlun"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回申论学习
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Lightbulb className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">提出对策</h1>
              <p className="text-white/80">针对问题提出切实可行的解决措施</p>
            </div>
          </div>
          <p className="text-white/90 max-w-2xl mb-6">
            提出对策题考察考生发现问题、分析问题、解决问题的能力。
            对策需要具有针对性、可操作性和可行性，既要来源于材料，又要符合实际。
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">85+</span>
              <span className="text-white/80">真题解析</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span className="font-semibold">6</span>
              <span className="text-white/80">对策维度</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">20-25</span>
              <span className="text-white/80">分钟/题</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 对策类型 */}
            <section>
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                对策类型讲解
              </h2>
              <div className="space-y-3">
                {strategyTypes.map((type, idx) => (
                  <TypeCard key={type.id} type={type} index={idx} />
                ))}
              </div>
            </section>

            {/* 对策维度框架 */}
            <section>
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                对策维度框架
              </h2>
              <p className="text-stone-600 mb-4">
                从不同维度思考对策，确保措施全面、系统。常用的六大维度可以帮助你快速构建对策框架。
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {strategyDimensions.map((dimension, idx) => (
                  <DimensionCard key={dimension.id} dimension={dimension} index={idx} />
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
                  href="/learn/shenlun/duice/examples"
                  className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
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
            {/* 答题技巧 */}
            <div className="bg-white rounded-xl border border-stone-200/50 p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-500" />
                答题技巧
              </h3>
              <div className="space-y-4">
                {answerTips.map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <div key={idx} className="space-y-2">
                      <h4 className="font-medium text-stone-700 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-amber-500" />
                        {tip.title}
                      </h4>
                      <ul className="space-y-1.5 ml-6">
                        {tip.points.map((point, pidx) => (
                          <li key={pidx} className="text-sm text-stone-600 flex items-start gap-2">
                            <span className="text-amber-500 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 快速练习 */}
            <div className="bg-white rounded-xl border border-stone-200/50 p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                快速练习
              </h3>
              <div className="space-y-3">
                <Link
                  href="/learn/shenlun/duice/practice"
                  className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-stone-800">随机练习</p>
                      <p className="text-sm text-stone-500">随机抽取题目</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                </Link>
                <Link
                  href="/learn/shenlun/duice/practice?mode=timed"
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-stone-800">限时训练</p>
                      <p className="text-sm text-stone-500">模拟考试时间</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-orange-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* 学习提示 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-5">
              <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                学习提示
              </h3>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  对策要有针对性，直击问题要害
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  措施要具体可操作，避免空泛
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  注意对策的可行性和合理性
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  善用维度框架，全面覆盖要点
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
