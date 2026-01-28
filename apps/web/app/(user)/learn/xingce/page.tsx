"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Clock,
  ChevronRight,
  ArrowLeft,
  Target,
  Zap,
  TrendingUp,
  Play,
  Trophy,
  Star,
  Flame,
  CheckCircle2,
  BarChart3,
  Calculator,
  Brain,
  FileText,
  Lightbulb,
  Loader2,
  ArrowRight,
  BookMarked,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// 行测五大模块配置
const xingceModules = [
  {
    id: "yanyu",
    name: "言语理解与表达",
    shortName: "言语理解",
    icon: "💬",
    color: "from-sky-500 to-cyan-600",
    bgColor: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
    description: "考查词语运用、阅读理解能力",
    questionCount: 40,
    avgTime: 35,
    categories: ["逻辑填空", "片段阅读", "语句表达"],
    keyPoints: ["实词辨析", "成语辨析", "主旨概括", "意图判断"],
    difficulty: 3,
    weight: 25,
  },
  {
    id: "shuliang",
    name: "数量关系",
    shortName: "数量关系",
    icon: "🔢",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    description: "考查数学运算与数字推理能力",
    questionCount: 15,
    avgTime: 25,
    categories: ["数学运算", "数字推理"],
    keyPoints: ["行程问题", "工程问题", "排列组合", "概率问题"],
    difficulty: 5,
    weight: 15,
  },
  {
    id: "panduan",
    name: "判断推理",
    shortName: "判断推理",
    icon: "🧩",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    description: "考查逻辑推理与分析判断能力",
    questionCount: 40,
    avgTime: 35,
    categories: ["图形推理", "定义判断", "类比推理", "逻辑判断"],
    keyPoints: ["位置规律", "样式规律", "翻译推理", "加强削弱"],
    difficulty: 4,
    weight: 25,
  },
  {
    id: "ziliao",
    name: "资料分析",
    shortName: "资料分析",
    icon: "📊",
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    description: "考查数据处理与分析能力",
    questionCount: 20,
    avgTime: 25,
    categories: ["增长问题", "比重问题", "倍数问题", "平均数问题"],
    keyPoints: ["增长率计算", "比重变化", "截位直除", "特征数字法"],
    difficulty: 4,
    weight: 20,
  },
  {
    id: "changshi",
    name: "常识判断",
    shortName: "常识判断",
    icon: "📚",
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    description: "考查综合知识与日常积累",
    questionCount: 20,
    avgTime: 10,
    categories: ["政治", "法律", "经济", "科技", "历史", "地理"],
    keyPoints: ["时政热点", "法律常识", "科技前沿", "人文历史"],
    difficulty: 3,
    weight: 15,
  },
];

// 学习技巧
const learningTips = [
  {
    title: "合理分配时间",
    description: "资料分析和言语理解性价比最高，建议重点突破",
    icon: Clock,
  },
  {
    title: "掌握答题顺序",
    description: "先易后难，常识→言语→资料→判断→数量",
    icon: Target,
  },
  {
    title: "善用排除法",
    description: "选择题中，排除明显错误选项可大幅提高正确率",
    icon: CheckCircle2,
  },
  {
    title: "注重错题分析",
    description: "错题反映知识盲点，定期复习巩固薄弱环节",
    icon: BookOpen,
  },
];

// 模块进度卡片
function ModuleCard({ module, index }: { module: typeof xingceModules[0]; index: number }) {
  // 模拟进度数据（实际应从API获取）
  const progress = 0;
  const accuracy = 0;

  return (
    <Link
      href={`/learn/xingce/${module.id}`}
      className="group relative bg-white rounded-2xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* 顶部渐变装饰 */}
      <div className={`h-1.5 bg-gradient-to-r ${module.color}`} />
      
      <div className="p-5">
        {/* 标题行 */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl ${module.bgColor} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
            {module.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors">
              {module.shortName}
            </h3>
            <p className="text-xs text-stone-500 line-clamp-1">{module.description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>

        {/* 题量与时间 */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <span className="flex items-center gap-1.5 text-stone-600">
            <FileText className="w-4 h-4 text-stone-400" />
            {module.questionCount}题
          </span>
          <span className="flex items-center gap-1.5 text-stone-600">
            <Clock className="w-4 h-4 text-stone-400" />
            ~{module.avgTime}分钟
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${module.bgColor} ${module.textColor}`}>
            占比{module.weight}%
          </span>
        </div>

        {/* 考点标签 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {module.keyPoints.slice(0, 4).map((point, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded-lg"
            >
              {point}
            </span>
          ))}
        </div>

        {/* 难度指示器 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">难度</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    level <= module.difficulty
                      ? "bg-amber-400"
                      : "bg-stone-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className={`text-sm font-medium ${module.textColor}`}>
            开始学习 →
          </span>
        </div>
      </div>
    </Link>
  );
}

// 快捷入口
const quickActions = [
  { icon: Play, label: "继续上次学习", href: "/learn/my", color: "text-blue-600 bg-blue-50" },
  { icon: FileText, label: "行测真题卷", href: "/learn/practice?subject=xingce&type=real", color: "text-amber-600 bg-amber-50" },
  { icon: Target, label: "行测模拟卷", href: "/learn/practice?subject=xingce&type=mock", color: "text-emerald-600 bg-emerald-50" },
  { icon: BookMarked, label: "错题本回顾", href: "/learn/mistakes?subject=xingce", color: "text-red-600 bg-red-50" },
];

export default function XingceLearningPage() {
  const { isAuthenticated } = useAuthStore();

  // 模拟学习数据（实际应从API获取）
  const [studyStats, setStudyStats] = useState({
    totalProgress: 0,
    completedQuestions: 0,
    studyDays: 0,
    accuracy: 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习中心
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* 标题区域 */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">📊</span>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">行政职业能力测验</h1>
                  <p className="text-white/80">公务员考试必考科目，考查综合素质与能力</p>
                </div>
              </div>

              {/* 考试说明 */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span>135题</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>120分钟</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4" />
                  <span>满分100分</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Target className="w-4 h-4" />
                  <span>及格线70分</span>
                </div>
              </div>
            </div>

            {/* 学习进度卡片 */}
            {isAuthenticated && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 lg:w-72">
                <h3 className="text-sm text-white/80 mb-3">我的学习进度</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{studyStats.totalProgress}%</div>
                    <div className="text-xs text-white/70">总体进度</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{studyStats.accuracy}%</div>
                    <div className="text-xs text-white/70">正确率</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{studyStats.completedQuestions}</div>
                    <div className="text-xs text-white/70">已做题目</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{studyStats.studyDays}</div>
                    <div className="text-xs text-white/70">学习天数</div>
                  </div>
                </div>
                {/* 进度条 */}
                <div className="mt-4">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${studyStats.totalProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 快捷入口 */}
        <section className="mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-card transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 五大模块 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              行测五大模块
            </h2>
            <p className="text-sm text-stone-500">点击模块进入专项学习</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {xingceModules.map((module, idx) => (
              <ModuleCard key={module.id} module={module} index={idx} />
            ))}
          </div>
        </section>

        {/* 推荐学习 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              推荐学习
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* 薄弱知识点 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">薄弱知识点</h3>
                  <p className="text-sm text-stone-500">基于做题记录智能分析</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-sm text-stone-700">逻辑填空 - 成语辨析</span>
                  <span className="text-xs text-red-500 font-medium">正确率 45%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-sm text-stone-700">数量关系 - 排列组合</span>
                  <span className="text-xs text-red-500 font-medium">正确率 52%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-sm text-stone-700">逻辑判断 - 加强削弱</span>
                  <span className="text-xs text-orange-500 font-medium">正确率 60%</span>
                </div>
              </div>
              <Link
                href="/learn/xingce/weak-points"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium"
              >
                专项突破 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 今日必学 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">今日必学</h3>
                  <p className="text-sm text-stone-500">每日定制学习计划</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-stone-700">资料分析 · 增长率计算</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300" />
                  <span className="text-sm text-stone-700">判断推理 · 图形推理</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300" />
                  <span className="text-sm text-stone-700">言语理解 · 片段阅读</span>
                </div>
              </div>
              <Link
                href="/learn/xingce/daily"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                开始今日学习 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 学习技巧 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              行测备考技巧
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                  <tip.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-stone-800 mb-2">{tip.title}</h3>
                <p className="text-sm text-stone-500">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 学习统计 */}
        <section className="mb-10">
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-stone-800 mb-6 text-center">
              行测考试题型分布
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {xingceModules.map((module) => (
                <div key={module.id} className="text-center">
                  <div className={`w-16 h-16 rounded-2xl ${module.bgColor} mx-auto mb-3 flex items-center justify-center text-3xl`}>
                    {module.icon}
                  </div>
                  <p className="font-semibold text-stone-800">{module.shortName}</p>
                  <p className="text-sm text-stone-500">{module.questionCount}题 · {module.weight}%</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 开始学习 CTA */}
        {!isAuthenticated && (
          <section className="text-center py-10">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">
              开始你的行测学习之旅
            </h2>
            <p className="text-stone-500 mb-6 max-w-lg mx-auto">
              注册账号，追踪学习进度，获取个性化学习推荐
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
            >
              立即登录
              <ArrowRight className="w-5 h-5" />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
