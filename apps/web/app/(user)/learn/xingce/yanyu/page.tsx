"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Clock,
  Target,
  Play,
  Star,
  FileText,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Zap,
  Video,
  BookMarked,
  ArrowRight,
  Brain,
  PenTool,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// 言语理解知识点结构
const knowledgeTree = [
  {
    id: "luoji-tiankong",
    name: "逻辑填空",
    icon: "📝",
    description: "考查词语运用的准确性和语境理解能力",
    questionCount: 15,
    weight: 40,
    children: [
      {
        id: "shici-bianxi",
        name: "实词辨析",
        description: "分析词义的细微差别",
        keyPoints: ["词义辨析", "语境分析", "固定搭配"],
        difficulty: 3,
        questionCount: 5,
        tips: "关注词语的感情色彩、语义轻重、搭配习惯",
      },
      {
        id: "chengyu-bianxi",
        name: "成语辨析",
        description: "辨析近义成语的用法差异",
        keyPoints: ["近义成语", "易混成语", "成语误用"],
        difficulty: 4,
        questionCount: 6,
        tips: "注意成语的适用对象、褒贬色彩和语法功能",
      },
      {
        id: "guanlian-ci",
        name: "关联词",
        description: "把握句子之间的逻辑关系",
        keyPoints: ["递进关系", "转折关系", "因果关系", "并列关系", "条件关系"],
        difficulty: 2,
        questionCount: 4,
        tips: "通过关联词判断句间关系，确定正确答案",
      },
    ],
  },
  {
    id: "pianduan-yuedu",
    name: "片段阅读",
    icon: "📖",
    description: "考查快速理解文段主旨和作者意图的能力",
    questionCount: 18,
    weight: 45,
    children: [
      {
        id: "zhuzhi-gaiguo",
        name: "主旨概括",
        description: "概括文段的核心观点",
        keyPoints: ["总分结构", "分总结构", "总分总结构"],
        difficulty: 3,
        questionCount: 5,
        tips: "寻找中心句，关注首尾句和转折词后的内容",
      },
      {
        id: "yitu-panduan",
        name: "意图判断",
        description: "理解作者的言外之意",
        keyPoints: ["言外之意", "作者态度", "引申推断"],
        difficulty: 4,
        questionCount: 4,
        tips: "意图≠主旨，要结合文段内容做合理引申",
      },
      {
        id: "xijie-lijie",
        name: "细节理解",
        description: "判断细节信息的正误",
        keyPoints: ["细节判断", "细节查找", "偷换概念"],
        difficulty: 3,
        questionCount: 4,
        tips: "逐一核对选项与原文，警惕偷换概念和扩大范围",
      },
      {
        id: "biaoti-xuanze",
        name: "标题选择",
        description: "为文段选择合适的标题",
        keyPoints: ["新闻标题", "议论文标题", "说明文标题"],
        difficulty: 3,
        questionCount: 2,
        tips: "标题要概括主旨、吸引眼球、符合文体特点",
      },
      {
        id: "ciju-lijie",
        name: "词句理解",
        description: "理解特定词句的含义",
        keyPoints: ["词语指代", "句子含义", "比喻义理解"],
        difficulty: 4,
        questionCount: 2,
        tips: "联系上下文，把握词句在语境中的特定含义",
      },
      {
        id: "xiawen-tuiduan",
        name: "下文推断",
        description: "推断接下来的内容",
        keyPoints: ["尾句分析", "行文逻辑", "话题延续"],
        difficulty: 3,
        questionCount: 1,
        tips: "重点关注尾句，推断作者下一步要讨论的话题",
      },
    ],
  },
  {
    id: "yuju-biaoda",
    name: "语句表达",
    icon: "✍️",
    description: "考查语句组织和逻辑表达能力",
    questionCount: 7,
    weight: 15,
    children: [
      {
        id: "yuju-paixu",
        name: "语句排序",
        description: "将打乱的句子重新排序",
        keyPoints: ["首句判断", "逻辑顺序", "关联词衔接"],
        difficulty: 3,
        questionCount: 4,
        tips: "先找首句，再找关联词和指代词确定顺序",
      },
      {
        id: "yuju-tiankong",
        name: "语句填空",
        description: "在文段空白处填入合适的句子",
        keyPoints: ["承上启下", "总结句", "过渡句"],
        difficulty: 3,
        questionCount: 3,
        tips: "根据空白处位置判断需要什么功能的句子",
      },
    ],
  },
];

// 学习方法
const learningMethods = [
  {
    title: "词汇积累法",
    description: "每天积累10个高频实词和5个成语",
    icon: BookMarked,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "结构分析法",
    description: "学会快速分析文段结构找主旨",
    icon: Target,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "选项排除法",
    description: "通过排除明显错误选项提高正确率",
    icon: CheckCircle2,
    color: "text-amber-600 bg-amber-50",
  },
  {
    title: "真题精练法",
    description: "反复练习历年真题掌握命题规律",
    icon: PenTool,
    color: "text-purple-600 bg-purple-50",
  },
];

// 知识点卡片组件
function KnowledgeCard({
  knowledge,
  level = 0,
}: {
  knowledge: typeof knowledgeTree[0];
  level?: number;
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = knowledge.children && knowledge.children.length > 0;

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 overflow-hidden">
      {/* 主知识点 */}
      <div
        className={`p-4 ${hasChildren ? "cursor-pointer hover:bg-stone-50" : ""} transition-colors`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {hasChildren && (
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-stone-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-stone-500" />
              )}
            </div>
          )}
          <div className="text-2xl">{knowledge.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-800">{knowledge.name}</h3>
              <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">
                {knowledge.questionCount}题
              </span>
              <span className="px-2 py-0.5 text-xs bg-amber-50 text-amber-600 rounded-full">
                占比{knowledge.weight}%
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-1">{knowledge.description}</p>
          </div>
          <Link
            href={`/learn/xingce/yanyu/${knowledge.id}`}
            className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            开始学习
          </Link>
        </div>
      </div>

      {/* 子知识点 */}
      {hasChildren && expanded && (
        <div className="border-t border-stone-100">
          {knowledge.children!.map((child, idx) => (
            <div
              key={child.id}
              className={`p-4 pl-16 ${
                idx !== knowledge.children!.length - 1 ? "border-b border-stone-100" : ""
              } hover:bg-stone-50 transition-colors`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-stone-700">{child.name}</h4>
                    <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded-full">
                      {child.questionCount}题
                    </span>
                    {/* 难度 */}
                    <div className="flex gap-0.5 ml-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-1.5 h-1.5 rounded-full ${
                            level <= child.difficulty
                              ? "bg-amber-400"
                              : "bg-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 mb-2">{child.description}</p>
                  {/* 关键考点 */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {child.keyPoints.map((point, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-sky-50 text-sky-600 rounded"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                  {/* 技巧提示 */}
                  <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-700">{child.tips}</span>
                  </div>
                </div>
                <Link
                  href={`/learn/xingce/yanyu/${knowledge.id}/${child.id}`}
                  className="px-3 py-1.5 border border-sky-200 text-sky-600 text-sm font-medium rounded-lg hover:bg-sky-50 transition-colors flex-shrink-0"
                >
                  练习
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function YanyuLearningPage() {
  const { isAuthenticated } = useAuthStore();

  // 计算总题数
  const totalQuestions = knowledgeTree.reduce((sum, k) => sum + k.questionCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/learn/xingce"
              className="text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-white/60">/</span>
            <Link
              href="/learn/xingce"
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              行测
            </Link>
            <span className="text-white/60">/</span>
            <span className="text-sm">言语理解与表达</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">💬</span>
                <div>
                  <h1 className="text-3xl font-bold">言语理解与表达</h1>
                  <p className="text-white/80">考查词语运用、阅读理解和语言表达能力</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span>{totalQuestions}题</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>~35分钟</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4" />
                  <span>占比25%</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Target className="w-4 h-4" />
                  <span>难度 ★★★☆☆</span>
                </div>
              </div>
            </div>

            {/* 进度卡片 */}
            {isAuthenticated && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 lg:w-64">
                <h3 className="text-sm text-white/80 mb-3">学习进度</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>知识点掌握</span>
                      <span>0/12</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full">
                      <div className="h-full w-0 bg-white rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>做题正确率</span>
                      <span>0%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full">
                      <div className="h-full w-0 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 学习方法 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            学习方法
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {learningMethods.map((method, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200/50 p-4 hover:shadow-card transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center mb-3`}>
                  <method.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-stone-800 mb-1">{method.title}</h3>
                <p className="text-sm text-stone-500">{method.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 知识点导航 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-sky-500" />
            知识点导航
          </h2>
          <div className="space-y-4">
            {knowledgeTree.map((knowledge) => (
              <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
            ))}
          </div>
        </section>

        {/* 学习资源 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-500" />
            学习资源
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* 视频讲解 */}
            <Link
              href="/learn/xingce/yanyu/videos"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-purple-600 transition-colors">
                    视频讲解
                  </h3>
                  <p className="text-sm text-stone-500">名师精讲知识点</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">共 24 个视频</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>

            {/* 方法技巧 */}
            <Link
              href="/learn/xingce/yanyu/tips"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors">
                    方法技巧
                  </h3>
                  <p className="text-sm text-stone-500">高分答题秘籍</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">15 个技巧总结</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>

            {/* 典型例题 */}
            <Link
              href="/learn/xingce/yanyu/examples"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors">
                    典型例题
                  </h3>
                  <p className="text-sm text-stone-500">精选真题演练</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">100+ 经典题目</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          </div>
        </section>

        {/* 专项练习入口 */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">开始言语理解专项练习</h3>
                <p className="text-white/80">
                  精选历年真题，智能推荐薄弱知识点，快速提分
                </p>
              </div>
              <Link
                href="/learn/practice?subject=xingce&module=yanyu"
                className="px-6 py-3 bg-white text-sky-600 font-semibold rounded-xl hover:bg-sky-50 transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                开始练习
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
