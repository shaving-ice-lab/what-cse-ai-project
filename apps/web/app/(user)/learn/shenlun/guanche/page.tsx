"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ScrollText,
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
  Mic,
  Megaphone,
  ClipboardList,
  Newspaper,
  PenTool,
  Calendar,
  GraduationCap,
  Users,
  MessageSquare,
  FileEdit,
} from "lucide-react";

// 公文类型配置
const documentTypes = [
  {
    id: "speech",
    name: "讲话发言类",
    icon: Mic,
    color: "text-blue-600 bg-blue-100",
    description: "讲话稿、发言稿、致辞等口头表达文书",
    items: [
      { name: "讲话稿", structure: "开场白 + 主体内容 + 结束语", frequency: "high" },
      { name: "发言稿", structure: "称呼 + 发言主题 + 具体内容 + 结语", frequency: "high" },
      { name: "致辞", structure: "称呼 + 致谢/祝贺 + 主体 + 祝愿", frequency: "medium" },
    ],
    tips: ["注意口语化表达", "开场要有感染力", "结尾要有号召性"],
    count: 35,
  },
  {
    id: "publicity",
    name: "宣传倡议类",
    icon: Megaphone,
    color: "text-emerald-600 bg-emerald-100",
    description: "倡议书、公开信、宣传稿等倡导性文书",
    items: [
      { name: "倡议书", structure: "称呼 + 背景/目的 + 倡议内容 + 落款", frequency: "high" },
      { name: "公开信", structure: "称呼 + 正文 + 落款", frequency: "medium" },
      { name: "宣传稿", structure: "标题 + 导语 + 主体内容", frequency: "medium" },
      { name: "宣传提纲", structure: "宣传目的 + 宣传内容 + 宣传方式", frequency: "low" },
    ],
    tips: ["倡议要有感召力", "内容要具体可行", "语言要有感染力"],
    count: 30,
  },
  {
    id: "report",
    name: "总结报告类",
    icon: ClipboardList,
    color: "text-amber-600 bg-amber-100",
    description: "调研报告、工作总结、汇报材料等总结性文书",
    items: [
      { name: "调研报告", structure: "调研目的 + 调研方法 + 发现问题 + 建议", frequency: "high" },
      { name: "工作总结", structure: "背景 + 主要做法 + 成效 + 经验", frequency: "medium" },
      { name: "汇报材料", structure: "基本情况 + 做法成效 + 存在问题 + 下步打算", frequency: "medium" },
      { name: "情况说明", structure: "事件背景 + 具体情况 + 处理措施", frequency: "low" },
    ],
    tips: ["内容要客观真实", "数据要准确", "结构要完整"],
    count: 40,
  },
  {
    id: "plan",
    name: "方案计划类",
    icon: Calendar,
    color: "text-purple-600 bg-purple-100",
    description: "工作方案、活动策划、实施方案等计划性文书",
    items: [
      { name: "工作方案", structure: "背景目的 + 目标任务 + 具体措施 + 保障机制", frequency: "high" },
      { name: "活动策划", structure: "活动目的 + 活动内容 + 时间地点 + 注意事项", frequency: "high" },
      { name: "实施方案", structure: "总体要求 + 主要任务 + 实施步骤 + 保障措施", frequency: "medium" },
    ],
    tips: ["目标要明确", "措施要具体", "分工要清晰"],
    count: 35,
  },
  {
    id: "news",
    name: "新闻传媒类",
    icon: Newspaper,
    color: "text-rose-600 bg-rose-100",
    description: "新闻稿、简报、短评等新闻传播类文书",
    items: [
      { name: "新闻稿", structure: "标题 + 导语 + 主体 + 背景 + 结尾", frequency: "high" },
      { name: "简报", structure: "报头 + 正文 + 报尾", frequency: "medium" },
      { name: "编者按", structure: "引导语 + 评价 + 推荐理由", frequency: "low" },
      { name: "短评", structure: "引出话题 + 分析论证 + 总结升华", frequency: "medium" },
    ],
    tips: ["标题要吸引人", "导语要概括要点", "语言要简洁"],
    count: 25,
  },
  {
    id: "other",
    name: "其他文书",
    icon: FileEdit,
    color: "text-stone-600 bg-stone-100",
    description: "建议书、意见、通知等其他类型文书",
    items: [
      { name: "建议书", structure: "称呼 + 背景 + 建议内容 + 落款", frequency: "medium" },
      { name: "意见", structure: "总体要求 + 基本原则 + 具体措施", frequency: "low" },
      { name: "通知", structure: "标题 + 主送机关 + 正文 + 落款", frequency: "medium" },
      { name: "备忘录", structure: "收件人 + 发件人 + 日期 + 主题 + 正文", frequency: "low" },
      { name: "导言/前言", structure: "背景介绍 + 主要内容 + 意义价值", frequency: "low" },
    ],
    tips: ["格式要规范", "内容要准确", "表述要得体"],
    count: 20,
  },
];

// 格式规范
const formatRules = [
  {
    title: "标题写法",
    icon: FileText,
    rules: [
      "直接式：关于XX的倡议书",
      "主副式：主标题 + 副标题",
      "口号式：让XX成为XX（适用于宣传类）",
    ],
  },
  {
    title: "称呼与落款",
    icon: Users,
    rules: [
      "称呼顶格写，后加冒号",
      "落款靠右，先单位后日期",
      "日期用汉字：二〇二六年一月二十八日",
    ],
  },
  {
    title: "正文格式",
    icon: PenTool,
    rules: [
      "首行缩进两个字符",
      "段落之间空一行（视具体要求）",
      "使用规范的公文语言",
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
    title: "撰写一份关于推进数字乡村建设的倡议书",
    docType: "倡议书",
    difficulty: "中等",
    score: 25,
    wordLimit: 500,
  },
  {
    id: 2,
    year: "2025",
    type: "国考",
    level: "地市级",
    title: "写一份社区志愿服务活动的策划方案",
    docType: "活动策划",
    difficulty: "中等",
    score: 25,
    wordLimit: 450,
  },
  {
    id: 3,
    year: "2024",
    type: "省考",
    level: "浙江",
    title: "撰写一篇关于基层治理创新的调研报告",
    docType: "调研报告",
    difficulty: "较难",
    score: 30,
    wordLimit: 600,
  },
];

// 高分范文示例
const sampleEssays = [
  {
    id: 1,
    title: "关于推进垃圾分类工作的倡议书",
    docType: "倡议书",
    source: "2024国考",
    score: "一类文",
  },
  {
    id: 2,
    title: "某社区新时代文明实践站建设工作汇报",
    docType: "汇报材料",
    source: "2024省考",
    score: "一类文",
  },
  {
    id: 3,
    title: "关于开展"全民阅读"活动的策划方案",
    docType: "活动策划",
    source: "2023国考",
    score: "一类文",
  },
];

// 文书类型卡片组件
function DocTypeCard({ type, index }: { type: typeof documentTypes[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = type.icon;
  
  return (
    <div
      className="bg-white rounded-xl border border-stone-200/50 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="p-5 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-stone-800">{type.name}</h3>
              <span className="text-sm text-stone-500">{type.count} 道真题</span>
            </div>
            <p className="text-stone-600">{type.description}</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-stone-400 transition-transform flex-shrink-0 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-stone-100 pt-4 space-y-4">
          {/* 文书类型列表 */}
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              文书类型详解
            </h4>
            <div className="space-y-3">
              {type.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-stone-700">{item.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      item.frequency === "high" 
                        ? "bg-red-50 text-red-600" 
                        : item.frequency === "medium"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-stone-100 text-stone-500"
                    }`}>
                      {item.frequency === "high" ? "高频" : item.frequency === "medium" ? "中频" : "低频"}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">结构：{item.structure}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 答题技巧 */}
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
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
              href={`/learn/shenlun/guanche/practice?type=${type.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              开始练习
            </Link>
            <Link
              href={`/learn/shenlun/guanche/examples?type=${type.id}`}
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
      href={`/learn/shenlun/guanche/exam/${exam.id}`}
      className="group block p-5 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded">
            {exam.year}{exam.type}
          </span>
          <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded">
            {exam.level}
          </span>
          <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
            {exam.docType}
          </span>
        </div>
        <span className="text-sm text-stone-500">{exam.score}分</span>
      </div>

      <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors mb-3">
        {exam.title}
      </h3>

      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>{exam.wordLimit}字</span>
        <span>{exam.difficulty}</span>
      </div>
    </Link>
  );
}

// 范文卡片
function SampleCard({ sample, index }: { sample: typeof sampleEssays[0]; index: number }) {
  return (
    <Link
      href={`/learn/shenlun/guanche/sample/${sample.id}`}
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
        <Award className="w-5 h-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-stone-800 group-hover:text-emerald-600 transition-colors truncate">
          {sample.title}
        </h4>
        <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
          <span>{sample.docType}</span>
          <span>·</span>
          <span>{sample.source}</span>
        </div>
      </div>
      <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded flex-shrink-0">
        {sample.score}
      </span>
    </Link>
  );
}

export default function GuanchePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 返回导航 */}
        <Link
          href="/learn/shenlun"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回申论学习
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ScrollText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">贯彻执行</h1>
              <p className="text-white/80">公文写作与应用文书</p>
            </div>
          </div>
          <p className="text-white/90 max-w-2xl mb-6">
            贯彻执行题考察公文写作能力，是申论考试的重要题型。需要掌握各类公文的格式规范、结构要求和写作技巧，
            能够根据题目要求准确选择文种并规范作答。
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">150+</span>
              <span className="text-white/80">真题解析</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span className="font-semibold">20+</span>
              <span className="text-white/80">文种类型</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">30-40</span>
              <span className="text-white/80">分钟/题</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 公文类型详解 */}
            <section>
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                公文类型详解
              </h2>
              <div className="space-y-3">
                {documentTypes.map((type, idx) => (
                  <DocTypeCard key={type.id} type={type} index={idx} />
                ))}
              </div>
            </section>

            {/* 真题精讲 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  真题精讲
                </h2>
                <Link
                  href="/learn/shenlun/guanche/examples"
                  className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
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

            {/* 高分范文库 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  高分范文库
                </h2>
                <Link
                  href="/learn/shenlun/guanche/samples"
                  className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {sampleEssays.map((sample, idx) => (
                  <SampleCard key={sample.id} sample={sample} index={idx} />
                ))}
              </div>
            </section>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 格式规范 */}
            <div className="bg-white rounded-xl border border-stone-200/50 p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
                格式规范
              </h3>
              <div className="space-y-4">
                {formatRules.map((rule, idx) => {
                  const Icon = rule.icon;
                  return (
                    <div key={idx}>
                      <h4 className="font-medium text-stone-700 mb-2 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-emerald-500" />
                        {rule.title}
                      </h4>
                      <ul className="space-y-1.5 ml-6">
                        {rule.rules.map((r, ridx) => (
                          <li key={ridx} className="text-sm text-stone-600 flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span>
                            {r}
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
                <Zap className="w-5 h-5 text-emerald-500" />
                快速练习
              </h3>
              <div className="space-y-3">
                <Link
                  href="/learn/shenlun/guanche/practice"
                  className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-stone-800">随机练习</p>
                      <p className="text-sm text-stone-500">随机抽取题目</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors" />
                </Link>
                <Link
                  href="/learn/shenlun/guanche/practice?mode=timed"
                  className="flex items-center justify-between p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-medium text-stone-800">限时训练</p>
                      <p className="text-sm text-stone-500">模拟考试时间</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-teal-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* 学习提示 */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-5">
              <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-emerald-500" />
                学习提示
              </h3>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  先审题确定文种，再按格式作答
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  格式分占一定比重，不可忽视
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  内容要贴合材料，不可脱离
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  语言要符合文种特点
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
