"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
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
  Lightbulb,
  PenTool,
  Type,
  LayoutList,
  MessageSquare,
  Quote,
  Sparkles,
  GraduationCap,
  Users,
  TrendingUp,
  BookMarked,
} from "lucide-react";

// 立意技巧
const liyiTechniques = [
  {
    id: "topic",
    name: "题目解读",
    icon: Target,
    color: "text-blue-600 bg-blue-100",
    content: [
      { label: "关键词分析", desc: "提取题目中的核心概念词" },
      { label: "题目类型", desc: "命题作文、话题作文、材料作文" },
      { label: "作答要求", desc: "注意角度限制和字数要求" },
    ],
  },
  {
    id: "material",
    name: "材料分析",
    icon: FileText,
    color: "text-emerald-600 bg-emerald-100",
    content: [
      { label: "核心主题", desc: "把握材料反映的核心议题" },
      { label: "观点提炼", desc: "归纳材料中的主要观点" },
      { label: "逻辑关系", desc: "理清材料各部分的关系" },
    ],
  },
  {
    id: "angle",
    name: "立意角度",
    icon: TrendingUp,
    color: "text-purple-600 bg-purple-100",
    content: [
      { label: "问题视角", desc: "从问题出发提出观点" },
      { label: "原因视角", desc: "从原因入手展开分析" },
      { label: "对策视角", desc: "从解决方案角度立论" },
      { label: "意义视角", desc: "从价值意义角度论述" },
    ],
  },
  {
    id: "check",
    name: "立意检验",
    icon: CheckCircle2,
    color: "text-amber-600 bg-amber-100",
    content: [
      { label: "准确性", desc: "是否切合题意和材料主旨" },
      { label: "明确性", desc: "观点是否清晰明确" },
      { label: "深刻性", desc: "是否有深度和见解" },
    ],
  },
];

// 标题类型
const titleTypes = [
  { type: "陈述式", example: "让创新成为发展的第一动力", desc: "直接陈述观点" },
  { type: "疑问式", example: "乡村振兴的关键在哪里？", desc: "以问代答引发思考" },
  { type: "对仗式", example: "以民为本谋发展，与时俱进创未来", desc: "结构工整有气势" },
  { type: "比喻式", example: "让数字技术成为乡村振兴的'翅膀'", desc: "形象生动有感染力" },
  { type: "引用式", example: "民为邦本，本固邦宁", desc: "引经据典增强说服力" },
];

// 开头写法
const openingTypes = [
  {
    name: "概括式开头",
    desc: "概括材料内容引出论点",
    example: "近年来，随着XX的发展，XX问题日益凸显...",
    frequency: "high",
  },
  {
    name: "转折式开头",
    desc: "先肯定再转折突出问题",
    example: "XX取得了显著成效，但与此同时，XX问题仍不容忽视...",
    frequency: "high",
  },
  {
    name: "案例式开头",
    desc: "以具体案例引入",
    example: "从XX的成功实践中，我们看到了XX的重要价值...",
    frequency: "medium",
  },
  {
    name: "引言式开头",
    desc: "引用名言警句开篇",
    example: "习近平总书记指出：'...'。这一重要论述深刻揭示了...",
    frequency: "high",
  },
  {
    name: "排比式开头",
    desc: "用排比句式增强气势",
    example: "XX是XX的基础，XX是XX的保障，XX是XX的关键...",
    frequency: "medium",
  },
];

// 分论点结构
const argumentStructures = [
  {
    name: "递进式结构",
    icon: TrendingUp,
    desc: "层层深入，逐步推进",
    example: ["是什么：认识问题本质", "为什么：分析原因意义", "怎么办：提出解决路径"],
  },
  {
    name: "并列式结构",
    icon: LayoutList,
    desc: "多角度并列展开",
    example: ["从XX角度看...", "从XX层面讲...", "从XX方面论..."],
  },
  {
    name: "对比式结构",
    icon: Layers,
    desc: "正反对比论证",
    example: ["正面：肯定XX的积极意义", "反面：警示XX的负面影响", "综合：提出正确做法"],
  },
];

// 论证方法
const argumentMethods = [
  {
    name: "理论论证",
    icon: Quote,
    color: "text-blue-600 bg-blue-100",
    content: ["引用名言警句", "援引政策文件", "运用理论阐述"],
  },
  {
    name: "事实论证",
    icon: Target,
    color: "text-emerald-600 bg-emerald-100",
    content: ["典型案例分析", "数据事实支撑", "历史经验借鉴"],
  },
  {
    name: "正反论证",
    icon: Layers,
    color: "text-purple-600 bg-purple-100",
    content: ["正面论述益处", "反面警示危害", "对比增强说服"],
  },
  {
    name: "比喻论证",
    icon: Lightbulb,
    color: "text-amber-600 bg-amber-100",
    content: ["形象比喻说理", "化抽象为具体", "增强感染力"],
  },
];

// 结尾写法
const endingTypes = [
  { name: "总结式结尾", desc: "总结全文，重申观点", example: "总之，XX是XX的关键..." },
  { name: "升华式结尾", desc: "提升高度，升华主题", example: "站在新的历史起点上..." },
  { name: "呼吁式结尾", desc: "发出号召，激发行动", example: "让我们携手共进，共同..." },
  { name: "展望式结尾", desc: "展望未来，表达信心", example: "我们有理由相信..." },
];

// 素材类型
const materialTypes = [
  { name: "名言警句库", icon: Quote, count: 200, color: "text-blue-600 bg-blue-50" },
  { name: "经典案例库", icon: BookMarked, count: 150, color: "text-emerald-600 bg-emerald-50" },
  { name: "优美语句库", icon: Sparkles, count: 180, color: "text-purple-600 bg-purple-50" },
  { name: "时政热点库", icon: TrendingUp, count: 100, color: "text-amber-600 bg-amber-50" },
];

// 真题示例
const examExamples = [
  {
    id: 1,
    year: "2025",
    type: "国考",
    level: "副省级",
    title: "以"新时代的担当与作为"为主题写一篇议论文",
    difficulty: "较难",
    score: 40,
    wordLimit: 1000,
  },
  {
    id: 2,
    year: "2025",
    type: "国考",
    level: "地市级",
    title: "围绕"基层治理"话题，自拟题目写一篇文章",
    difficulty: "中等",
    score: 35,
    wordLimit: 1000,
  },
  {
    id: 3,
    year: "2024",
    type: "省考",
    level: "浙江",
    title: "以"让数字技术赋能乡村振兴"为题写一篇议论文",
    difficulty: "中等",
    score: 40,
    wordLimit: 1200,
  },
];

// 技巧卡片组件
function TechniqueCard({ technique, index }: { technique: typeof liyiTechniques[0]; index: number }) {
  const Icon = technique.icon;
  
  return (
    <div
      className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-shadow animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${technique.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-stone-800">{technique.name}</h3>
      </div>
      <div className="space-y-3">
        {technique.content.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-stone-700">{item.label}：</span>
              <span className="text-stone-600">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 结构卡片组件
function StructureCard({ structure, index }: { structure: typeof argumentStructures[0]; index: number }) {
  const Icon = structure.icon;
  
  return (
    <div
      className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-shadow animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-800">{structure.name}</h3>
          <p className="text-sm text-stone-500">{structure.desc}</p>
        </div>
      </div>
      <div className="space-y-2">
        {structure.example.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs flex items-center justify-center font-medium">
              {idx + 1}
            </span>
            <span className="text-sm text-stone-600">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 真题卡片
function ExamCard({ exam, index }: { exam: typeof examExamples[0]; index: number }) {
  return (
    <Link
      href={`/learn/shenlun/xiezuo/exam/${exam.id}`}
      className="group block p-5 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs bg-rose-100 text-rose-700 rounded">
            {exam.year}{exam.type}
          </span>
          <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded">
            {exam.level}
          </span>
        </div>
        <span className="text-sm text-stone-500">{exam.score}分</span>
      </div>

      <h3 className="font-semibold text-stone-800 group-hover:text-rose-600 transition-colors mb-3">
        {exam.title}
      </h3>

      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>{exam.wordLimit}字以上</span>
        <span>{exam.difficulty}</span>
      </div>
    </Link>
  );
}

export default function XiezuoPage() {
  const [activeTab, setActiveTab] = useState<"liyi" | "title" | "opening" | "argument" | "ending">("liyi");

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 返回导航 */}
        <Link
          href="/learn/shenlun"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-rose-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回申论学习
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Edit3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">文章写作</h1>
              <p className="text-white/80">申论大作文写作技巧</p>
            </div>
          </div>
          <p className="text-white/90 max-w-2xl mb-6">
            申论大作文是分值最高的题型，考察考生的综合分析能力和文字表达能力。
            掌握立意、标题、开头、论证、结尾等写作技巧，打造高分文章。
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">80+</span>
              <span className="text-white/80">真题解析</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">100+</span>
              <span className="text-white/80">高分范文</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">60-70</span>
              <span className="text-white/80">分钟/题</span>
            </div>
          </div>
        </div>

        {/* 内容标签页 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 p-1 bg-stone-100 rounded-xl">
            {[
              { id: "liyi", label: "立意技巧", icon: Target },
              { id: "title", label: "标题拟定", icon: Type },
              { id: "opening", label: "开头写法", icon: PenTool },
              { id: "argument", label: "论点论证", icon: LayoutList },
              { id: "ending", label: "结尾写法", icon: Edit3 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-stone-600 hover:text-stone-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 立意技巧 */}
            {activeTab === "liyi" && (
              <section>
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-500" />
                  立意技巧
                </h2>
                <p className="text-stone-600 mb-6">
                  立意是文章写作的核心，一篇文章的成败首先取决于立意是否准确、深刻。
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {liyiTechniques.map((technique, idx) => (
                    <TechniqueCard key={technique.id} technique={technique} index={idx} />
                  ))}
                </div>
              </section>
            )}

            {/* 标题拟定 */}
            {activeTab === "title" && (
              <section>
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-rose-500" />
                  标题拟定
                </h2>
                <p className="text-stone-600 mb-6">
                  好标题是文章的眼睛，要求准确概括主题，语言精炼有力。
                </p>
                <div className="space-y-4">
                  {titleTypes.map((title, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-shadow animate-fade-in"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </span>
                          <h3 className="font-semibold text-stone-800">{title.type}</h3>
                        </div>
                        <span className="text-sm text-stone-500">{title.desc}</span>
                      </div>
                      <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                        <p className="text-rose-700 font-medium">"{title.example}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 开头写法 */}
            {activeTab === "opening" && (
              <section>
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-rose-500" />
                  开头写法
                </h2>
                <p className="text-stone-600 mb-6">
                  开头要开门见山，迅速切入主题，吸引阅卷者注意。
                </p>
                <div className="space-y-4">
                  {openingTypes.map((opening, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-shadow animate-fade-in"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-stone-800">{opening.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            opening.frequency === "high" 
                              ? "bg-red-50 text-red-600" 
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {opening.frequency === "high" ? "高频" : "中频"}
                          </span>
                        </div>
                        <span className="text-sm text-stone-500">{opening.desc}</span>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-lg">
                        <p className="text-stone-600 italic">{opening.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 论点论证 */}
            {activeTab === "argument" && (
              <section className="space-y-8">
                {/* 分论点设置 */}
                <div>
                  <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <LayoutList className="w-5 h-5 text-rose-500" />
                    分论点设置
                  </h2>
                  <p className="text-stone-600 mb-6">
                    分论点是文章的骨架，要围绕中心论点展开，层次清晰，逻辑严密。
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {argumentStructures.map((structure, idx) => (
                      <StructureCard key={structure.name} structure={structure} index={idx} />
                    ))}
                  </div>
                </div>

                {/* 分论点论证 */}
                <div>
                  <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-rose-500" />
                    分论点论证
                  </h2>
                  <p className="text-stone-600 mb-6">
                    论证是文章的血肉，要有理有据，使观点更具说服力。
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {argumentMethods.map((method, idx) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-shadow animate-fade-in"
                          style={{ animationDelay: `${idx * 80}ms` }}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-stone-800">{method.name}</h3>
                          </div>
                          <ul className="space-y-2">
                            {method.content.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* 结尾写法 */}
            {activeTab === "ending" && (
              <section>
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-rose-500" />
                  结尾写法
                </h2>
                <p className="text-stone-600 mb-6">
                  结尾要收束有力，回扣主题，给人余味无穷之感。
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {endingTypes.map((ending, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-shadow animate-fade-in"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-stone-800">{ending.name}</h3>
                          <p className="text-sm text-stone-500">{ending.desc}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-lg">
                        <p className="text-sm text-stone-600 italic">{ending.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 真题精讲 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  真题精讲
                </h2>
                <Link
                  href="/learn/shenlun/xiezuo/examples"
                  className="text-sm text-rose-600 hover:text-rose-700 flex items-center gap-1"
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
            {/* 素材积累 */}
            <div className="bg-white rounded-xl border border-stone-200/50 p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-rose-500" />
                素材积累
              </h3>
              <div className="space-y-3">
                {materialTypes.map((material, idx) => {
                  const Icon = material.icon;
                  return (
                    <Link
                      key={idx}
                      href={`/learn/shenlun/xiezuo/materials/${material.name}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-lg ${material.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-stone-700 group-hover:text-rose-600 transition-colors">
                          {material.name}
                        </p>
                        <p className="text-sm text-stone-500">{material.count}+ 条素材</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-rose-500 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 快速练习 */}
            <div className="bg-white rounded-xl border border-stone-200/50 p-5">
              <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-500" />
                快速练习
              </h3>
              <div className="space-y-3">
                <Link
                  href="/learn/shenlun/xiezuo/practice"
                  className="flex items-center justify-between p-4 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-rose-600" />
                    <div>
                      <p className="font-medium text-stone-800">随机练习</p>
                      <p className="text-sm text-stone-500">随机抽取题目</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-rose-500 transition-colors" />
                </Link>
                <Link
                  href="/learn/shenlun/xiezuo/samples"
                  className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-stone-800">范文赏析</p>
                      <p className="text-sm text-stone-500">高分范文学习</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* 学习提示 */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100 p-5">
              <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                学习提示
              </h3>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  立意是根本，一定要准确
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  标题要亮眼，第一印象很重要
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  论证要有力，事实+道理
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  多积累素材，厚积薄发
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
