"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Award,
  BarChart3,
  Calendar,
  Star,
  XCircle,
  FileText,
  Brain,
  Sparkles,
  ChevronRight,
  Play,
  CheckCircle,
  Flame,
  Trophy,
  Zap,
  Loader2,
} from "lucide-react";
import {
  practiceApi,
  UserStats,
  getSubjectName,
} from "@/services/api/practice";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

// 科目分类配置
const subjects = [
  {
    key: "xingce",
    name: "行测",
    icon: Brain,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    description: "言语理解、判断推理、数量关系、资料分析、常识判断",
    questionCount: 15000,
  },
  {
    key: "shenlun",
    name: "申论",
    icon: FileText,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    description: "归纳概括、提出对策、综合分析、贯彻执行、申发论述",
    questionCount: 3000,
  },
  {
    key: "mianshi",
    name: "面试",
    icon: Sparkles,
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
    description: "结构化面试、无领导小组、情景应变、综合分析",
    questionCount: 2000,
  },
  {
    key: "gongji",
    name: "公基",
    icon: BookOpen,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    description: "政治、法律、经济、管理、公文、科技、人文",
    questionCount: 8000,
  },
];

// 快捷入口配置
const quickEntries = [
  {
    key: "daily",
    name: "每日一练",
    icon: Calendar,
    color: "from-amber-500 to-orange-500",
    description: "每日智能推送，养成做题习惯",
    href: "/practice/daily",
  },
  {
    key: "real-exam",
    name: "真题练习",
    icon: Award,
    color: "from-blue-500 to-indigo-500",
    description: "历年真题，把握命题趋势",
    href: "/practice/papers?type=real_exam",
  },
  {
    key: "mock",
    name: "模拟考试",
    icon: Clock,
    color: "from-emerald-500 to-teal-500",
    description: "限时模拟，检验学习成果",
    href: "/practice/papers?type=mock",
  },
  {
    key: "wrong",
    name: "错题重做",
    icon: XCircle,
    color: "from-rose-500 to-red-500",
    description: "针对弱点，攻克易错题",
    href: "/practice/wrong",
  },
  {
    key: "collect",
    name: "收藏题目",
    icon: Star,
    color: "from-purple-500 to-pink-500",
    description: "收藏精华，随时复习",
    href: "/practice/collect",
  },
  {
    key: "random",
    name: "快速练习",
    icon: Zap,
    color: "from-cyan-500 to-blue-500",
    description: "随机抽题，巩固基础",
    href: "/practice/do?mode=random",
  },
];

// 统计卡片组件
function StatsCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 p-4 shadow-card hover:shadow-warm-lg transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-stone-800">{value}</div>
          <div className="text-xs text-stone-500">{label}</div>
          {subtext && <div className="text-xs text-stone-400">{subtext}</div>}
        </div>
      </div>
    </div>
  );
}

// 科目卡片组件
function SubjectCard({
  subject,
}: {
  subject: typeof subjects[0];
}) {
  const Icon = subject.icon;
  return (
    <Link
      href={`/practice/${subject.key}`}
      className="group relative bg-white rounded-2xl border border-stone-200/50 p-5 shadow-card hover:shadow-warm-lg hover:border-stone-300 transition-all overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 transform translate-x-6 -translate-y-6">
        <Icon className="w-full h-full" />
      </div>
      
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${subject.color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-1 transition-all" />
      </div>
      
      <h3 className="text-lg font-bold text-stone-800 mb-1">{subject.name}题库</h3>
      <p className="text-xs text-stone-500 mb-3 line-clamp-2">{subject.description}</p>
      
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${subject.bgColor} ${subject.textColor}`}>
          {subject.questionCount.toLocaleString()}+ 道题
        </span>
      </div>
    </Link>
  );
}

// 快捷入口组件
function QuickEntryCard({
  entry,
}: {
  entry: typeof quickEntries[0];
}) {
  const Icon = entry.icon;
  return (
    <Link
      href={entry.href}
      className="group flex items-center gap-3 bg-white rounded-xl border border-stone-200/50 p-3 shadow-card hover:shadow-warm-md hover:border-stone-300 transition-all"
    >
      <div className={`p-2 rounded-lg bg-gradient-to-br ${entry.color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-stone-800">{entry.name}</div>
        <div className="text-xs text-stone-500 truncate">{entry.description}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </Link>
  );
}

export default function PracticePage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await practiceApi.getUserStats();
        setStats(data);
      } catch (error) {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-500" />
            题库练习
          </h1>
          <p className="text-stone-500 text-sm mt-1">刷题提分，助力上岸</p>
        </div>

        {/* 统计概览 */}
        {isAuthenticated && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-200/50 p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-200 rounded-xl" />
                      <div className="space-y-2">
                        <div className="w-12 h-6 bg-stone-200 rounded" />
                        <div className="w-16 h-3 bg-stone-100 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : stats ? (
              <>
                <StatsCard
                  icon={Target}
                  label="今日做题"
                  value={stats.today_attempts}
                  color="bg-gradient-to-br from-amber-500 to-orange-500"
                />
                <StatsCard
                  icon={BarChart3}
                  label="累计做题"
                  value={stats.total_attempts.toLocaleString()}
                  color="bg-gradient-to-br from-blue-500 to-indigo-500"
                />
                <StatsCard
                  icon={TrendingUp}
                  label="正确率"
                  value={`${stats.correct_rate.toFixed(1)}%`}
                  color="bg-gradient-to-br from-emerald-500 to-teal-500"
                />
                <StatsCard
                  icon={Flame}
                  label="连续打卡"
                  value={`${stats.consecutive_days}天`}
                  color="bg-gradient-to-br from-rose-500 to-red-500"
                />
              </>
            ) : (
              <div className="col-span-full bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-stone-700">登录后查看学习数据</div>
                    <div className="text-xs text-stone-500">记录做题进度，追踪学习效果</div>
                  </div>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
                  >
                    去登录
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 快捷入口 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            快捷入口
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickEntries.map((entry) => (
              <QuickEntryCard key={entry.key} entry={entry} />
            ))}
          </div>
        </div>

        {/* 分类题库 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            分类题库
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <SubjectCard key={subject.key} subject={subject} />
            ))}
          </div>
        </div>

        {/* 试卷中心入口 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                试卷中心
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                历年真题、模拟试卷、专项练习，全方位备考
              </p>
              <Link
                href="/practice/papers"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors"
              >
                <Play className="w-4 h-4" />
                进入试卷中心
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs text-blue-200">套真题</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold">300+</div>
                  <div className="text-xs text-blue-200">模拟卷</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 学习提示 */}
        <div className="mt-6 bg-amber-50 rounded-xl border border-amber-200/50 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-stone-800 mb-1">学习建议</h4>
              <ul className="text-sm text-stone-600 space-y-1">
                <li>• 每天保持30-50道题的练习量，养成做题习惯</li>
                <li>• 重视错题复习，同类型题目反复练习直到掌握</li>
                <li>• 定期进行模拟考试，检验学习效果并调整策略</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
