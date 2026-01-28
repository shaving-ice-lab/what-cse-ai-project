"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Calendar,
  BookOpen,
  Zap,
  Award,
  Loader2,
  BarChart3,
  PieChart,
  AlertCircle,
  Lightbulb,
  Star,
  ChevronRight,
  Brain,
  Sparkles,
  Timer,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Play,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

// 模拟数据类型
interface ExamReport {
  id: number;
  exam_name: string;
  exam_type: string;
  exam_date: string;
  total_score: number;
  user_score: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  time_limit: number;
  time_used: number;
  rank?: number;
  total_participants?: number;
  subject_scores: SubjectScore[];
  question_type_scores: QuestionTypeScore[];
  knowledge_point_scores: KnowledgePointScore[];
  time_analysis: TimeAnalysis;
  wrong_questions: WrongQuestion[];
}

interface SubjectScore {
  subject: string;
  subject_name: string;
  total_score: number;
  user_score: number;
  correct_count: number;
  total_count: number;
  correct_rate: number;
  avg_time: number;
}

interface QuestionTypeScore {
  type: string;
  type_name: string;
  total_count: number;
  correct_count: number;
  correct_rate: number;
  avg_time: number;
  score_rate: number;
}

interface KnowledgePointScore {
  point_id: number;
  point_name: string;
  subject: string;
  total_count: number;
  correct_count: number;
  correct_rate: number;
  is_weak: boolean;
}

interface TimeAnalysis {
  total_time: number;
  avg_time_per_question: number;
  time_distribution: { phase: string; time: number; question_count: number }[];
  overtime_questions: number;
  rush_questions: number;
}

interface WrongQuestion {
  id: number;
  question_number: number;
  subject: string;
  type: string;
  knowledge_point: string;
  user_answer: string;
  correct_answer: string;
  time_used: number;
  error_type: string;
}

interface AIAnalysis {
  summary: string;
  score_evaluation: string;
  strengths: string[];
  weaknesses: string[];
  error_patterns: ErrorPattern[];
  time_suggestions: string[];
  improvement_plan: ImprovementPlan[];
  next_steps: string[];
}

interface ErrorPattern {
  pattern: string;
  description: string;
  frequency: number;
  suggestion: string;
}

interface ImprovementPlan {
  priority: number;
  area: string;
  current_level: string;
  target_level: string;
  actions: string[];
  duration: string;
}

// 格式化工具函数
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}小时${minutes}分${secs}秒`;
  }
  if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  }
  return `${secs}秒`;
};

const formatPercent = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

const getSubjectColorClass = (subject: string): string => {
  const colors: Record<string, string> = {
    yanyu: "from-blue-500 to-indigo-600",
    shuliang: "from-purple-500 to-violet-600",
    panduan: "from-emerald-500 to-teal-600",
    ziliao: "from-amber-500 to-orange-600",
    changshi: "from-pink-500 to-rose-600",
    shenlun: "from-cyan-500 to-blue-600",
    mianshi: "from-red-500 to-orange-600",
    gongji: "from-indigo-500 to-purple-600",
  };
  return colors[subject] || "from-stone-500 to-stone-600";
};

// 统计卡片组件
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-stone-200/50 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-stone-500">{label}</span>
      </div>
      <div>
        <div className="text-xl font-bold text-stone-800">{value}</div>
        {subValue && <div className="text-xs text-stone-400 mt-0.5">{subValue}</div>}
      </div>
    </div>
  );
}

// 科目得分条形图
function SubjectScoreChart({ data }: { data: SubjectScore[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-4">
      {data.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-stone-700">{item.subject_name}</span>
            <span className="text-stone-500">
              {item.user_score}/{item.total_score}分 · {formatPercent(item.correct_rate)}
            </span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getSubjectColorClass(item.subject)} rounded-full transition-all duration-500`}
              style={{ width: `${(item.user_score / item.total_score) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// 题型分析表格
function QuestionTypeTable({ data }: { data: QuestionTypeScore[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200">
            <th className="text-left py-2 px-3 font-medium text-stone-600">题型</th>
            <th className="text-center py-2 px-3 font-medium text-stone-600">题数</th>
            <th className="text-center py-2 px-3 font-medium text-stone-600">正确</th>
            <th className="text-center py-2 px-3 font-medium text-stone-600">正确率</th>
            <th className="text-center py-2 px-3 font-medium text-stone-600">均时</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="border-b border-stone-100 hover:bg-stone-50">
              <td className="py-2 px-3 text-stone-700">{item.type_name}</td>
              <td className="text-center py-2 px-3 text-stone-500">{item.total_count}</td>
              <td className="text-center py-2 px-3 text-stone-500">{item.correct_count}</td>
              <td className="text-center py-2 px-3">
                <span className={cn(
                  "font-medium",
                  item.correct_rate >= 0.8 ? "text-green-600" :
                  item.correct_rate >= 0.6 ? "text-amber-600" : "text-red-600"
                )}>
                  {formatPercent(item.correct_rate)}
                </span>
              </td>
              <td className="text-center py-2 px-3 text-stone-500">{item.avg_time}秒</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 知识点分析卡片
function KnowledgePointCard({ point }: { point: KnowledgePointScore }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-xl",
      point.is_weak ? "bg-red-50" : "bg-green-50"
    )}>
      <div>
        <div className="font-medium text-stone-700">{point.point_name}</div>
        <div className="text-xs text-stone-500">{point.correct_count}/{point.total_count}题</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-semibold",
          point.is_weak ? "text-red-600" : "text-green-600"
        )}>
          {formatPercent(point.correct_rate)}
        </span>
        {point.is_weak ? (
          <XCircle className="w-4 h-4 text-red-500" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        )}
      </div>
    </div>
  );
}

// 时间分布图
function TimeDistributionChart({ data }: { data: TimeAnalysis }) {
  if (!data || !data.time_distribution || data.time_distribution.length === 0) return null;

  const maxTime = Math.max(...data.time_distribution.map(d => d.time));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-32">
        {data.time_distribution.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className="flex-1 w-full flex items-end justify-center">
              <div
                className="w-8 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t transition-all"
                style={{ height: `${Math.max((item.time / maxTime) * 100, 5)}%` }}
              />
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs text-stone-600">{item.phase}</div>
              <div className="text-xs text-stone-400">{formatTime(item.time)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 text-sm text-stone-500">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-amber-500" />
          <span>平均{Math.round(data.avg_time_per_question)}秒/题</span>
        </div>
        {data.overtime_questions > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{data.overtime_questions}题超时</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 错误模式卡片
function ErrorPatternCard({ pattern }: { pattern: ErrorPattern }) {
  return (
    <div className="bg-red-50 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-red-800">{pattern.pattern}</h4>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
              出现{pattern.frequency}次
            </span>
          </div>
          <p className="text-sm text-red-700 mb-2">{pattern.description}</p>
          <p className="text-xs text-red-600 flex items-start gap-1">
            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {pattern.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}

// 提升计划卡片
function ImprovementPlanCard({ plan, index }: { plan: ImprovementPlan; index: number }) {
  const priorityColors = {
    1: "bg-red-100 text-red-600",
    2: "bg-amber-100 text-amber-600",
    3: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center font-bold",
              priorityColors[plan.priority as keyof typeof priorityColors] || "bg-stone-100 text-stone-600"
            )}>
              {index + 1}
            </div>
            <div>
              <h4 className="font-medium text-stone-800">{plan.area}</h4>
              <p className="text-xs text-stone-500">{plan.current_level} → {plan.target_level}</p>
            </div>
          </div>
          <span className="text-xs text-stone-400">{plan.duration}</span>
        </div>
        <ul className="space-y-1.5 ml-11">
          {plan.actions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ExamReportPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);
  const { isAuthenticated } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ExamReport | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);

  // 加载模拟数据
  useEffect(() => {
    if (isAuthenticated && examId) {
      setLoading(true);
      
      // 模拟API调用
      setTimeout(() => {
        // 模拟考试报告数据
        setReport({
          id: examId,
          exam_name: "2025年国考行测模拟卷（一）",
          exam_type: "模拟考试",
          exam_date: new Date().toISOString().split("T")[0],
          total_score: 100,
          user_score: 72.5,
          total_questions: 130,
          correct_count: 94,
          wrong_count: 31,
          unanswered_count: 5,
          time_limit: 7200,
          time_used: 6840,
          rank: 1256,
          total_participants: 8934,
          subject_scores: [
            { subject: "yanyu", subject_name: "言语理解", total_score: 32, user_score: 25.6, correct_count: 32, total_count: 40, correct_rate: 0.8, avg_time: 48 },
            { subject: "shuliang", subject_name: "数量关系", total_score: 12, user_score: 7.2, correct_count: 9, total_count: 15, correct_rate: 0.6, avg_time: 85 },
            { subject: "panduan", subject_name: "判断推理", total_score: 28, user_score: 22.4, correct_count: 32, total_count: 40, correct_rate: 0.8, avg_time: 52 },
            { subject: "ziliao", subject_name: "资料分析", total_score: 16, user_score: 11.2, correct_count: 14, total_count: 20, correct_rate: 0.7, avg_time: 95 },
            { subject: "changshi", subject_name: "常识判断", total_score: 12, user_score: 6.1, correct_count: 7, total_count: 15, correct_rate: 0.47, avg_time: 25 },
          ],
          question_type_scores: [
            { type: "single", type_name: "单选题", total_count: 120, correct_count: 89, correct_rate: 0.74, avg_time: 52, score_rate: 0.74 },
            { type: "multiple", type_name: "多选题", total_count: 5, correct_count: 3, correct_rate: 0.6, avg_time: 78, score_rate: 0.6 },
            { type: "judge", type_name: "判断题", total_count: 5, correct_count: 2, correct_rate: 0.4, avg_time: 35, score_rate: 0.4 },
          ],
          knowledge_point_scores: [
            { point_id: 1, point_name: "逻辑填空", subject: "yanyu", total_count: 20, correct_count: 16, correct_rate: 0.8, is_weak: false },
            { point_id: 2, point_name: "片段阅读", subject: "yanyu", total_count: 20, correct_count: 16, correct_rate: 0.8, is_weak: false },
            { point_id: 3, point_name: "数学运算", subject: "shuliang", total_count: 10, correct_count: 5, correct_rate: 0.5, is_weak: true },
            { point_id: 4, point_name: "数字推理", subject: "shuliang", total_count: 5, correct_count: 4, correct_rate: 0.8, is_weak: false },
            { point_id: 5, point_name: "图形推理", subject: "panduan", total_count: 10, correct_count: 9, correct_rate: 0.9, is_weak: false },
            { point_id: 6, point_name: "逻辑判断", subject: "panduan", total_count: 10, correct_count: 7, correct_rate: 0.7, is_weak: false },
            { point_id: 7, point_name: "增长问题", subject: "ziliao", total_count: 8, correct_count: 5, correct_rate: 0.625, is_weak: true },
            { point_id: 8, point_name: "比重问题", subject: "ziliao", total_count: 6, correct_count: 5, correct_rate: 0.83, is_weak: false },
            { point_id: 9, point_name: "法律常识", subject: "changshi", total_count: 5, correct_count: 2, correct_rate: 0.4, is_weak: true },
            { point_id: 10, point_name: "时政常识", subject: "changshi", total_count: 5, correct_count: 3, correct_rate: 0.6, is_weak: true },
          ],
          time_analysis: {
            total_time: 6840,
            avg_time_per_question: 52.6,
            time_distribution: [
              { phase: "前30题", time: 1200, question_count: 30 },
              { phase: "31-60题", time: 1500, question_count: 30 },
              { phase: "61-90题", time: 1800, question_count: 30 },
              { phase: "91-120题", time: 1680, question_count: 30 },
              { phase: "121-130题", time: 660, question_count: 10 },
            ],
            overtime_questions: 12,
            rush_questions: 8,
          },
          wrong_questions: [
            { id: 1, question_number: 15, subject: "yanyu", type: "逻辑填空", knowledge_point: "词语辨析", user_answer: "B", correct_answer: "C", time_used: 65, error_type: "语境理解错误" },
            { id: 2, question_number: 48, subject: "shuliang", type: "数学运算", knowledge_point: "工程问题", user_answer: "A", correct_answer: "D", time_used: 120, error_type: "计算错误" },
            { id: 3, question_number: 76, subject: "panduan", type: "逻辑判断", knowledge_point: "加强削弱", user_answer: "C", correct_answer: "B", time_used: 85, error_type: "逻辑分析错误" },
          ],
        });

        // 模拟AI分析
        setAIAnalysis({
          summary: "本次模拟考试总分72.5分，超过了86%的考生。整体表现中等偏上，言语理解和判断推理是主要得分点，但数量关系和常识判断存在明显短板，需要重点加强。",
          score_evaluation: "以140分为目标，当前得分与目标差距约32.5分。按照目前的学习节奏，预计需要4-6周的系统复习才能达成目标。",
          strengths: [
            "言语理解能力扎实，正确率达到80%，尤其是片段阅读表现出色",
            "判断推理思维清晰，图形推理正确率高达90%",
            "答题节奏把控较好，整体时间分配合理",
            "资料分析中比重问题掌握较好",
          ],
          weaknesses: [
            "数量关系是最大短板，数学运算正确率仅50%",
            "常识判断覆盖面不够，法律常识正确率仅40%",
            "部分题目存在粗心大意，计算错误较多",
            "最后阶段答题较为仓促，有5题未作答",
          ],
          error_patterns: [
            {
              pattern: "计算粗心错误",
              description: "数量关系和资料分析中存在多处基本计算错误",
              frequency: 6,
              suggestion: "建议养成验算习惯，特别是选项数值接近时要仔细核对",
            },
            {
              pattern: "语境理解偏差",
              description: "逻辑填空中对词语感情色彩和语境把握不准",
              frequency: 4,
              suggestion: "多积累词语辨析知识，注意结合上下文理解语境",
            },
            {
              pattern: "时间分配不均",
              description: "数量关系部分耗时过多，导致后面题目仓促",
              frequency: 1,
              suggestion: "遇到难题及时跳过，保证整体答题节奏",
            },
          ],
          time_suggestions: [
            "数量关系每题控制在90秒以内，超时立即跳过",
            "常识判断快速作答，每题不超过30秒",
            "预留10分钟检查和填涂答题卡",
            "资料分析可适当放在最后做，保证正确率",
          ],
          improvement_plan: [
            {
              priority: 1,
              area: "数量关系",
              current_level: "正确率60%",
              target_level: "正确率75%",
              actions: [
                "每天专项练习数学运算20道",
                "重点突破工程问题和行程问题",
                "学习速算技巧，提高计算准确性",
                "整理高频考点公式，强化记忆",
              ],
              duration: "2周",
            },
            {
              priority: 2,
              area: "常识判断",
              current_level: "正确率47%",
              target_level: "正确率65%",
              actions: [
                "每天学习法律常识知识点30分钟",
                "关注时政新闻，积累时事热点",
                "整理高频考点，建立知识框架",
                "使用速记卡片强化记忆",
              ],
              duration: "3周",
            },
            {
              priority: 3,
              area: "时间管理",
              current_level: "超时12题",
              target_level: "超时5题以内",
              actions: [
                "模拟考试中严格按时间分配答题",
                "难题标记后跳过，最后有时间再回顾",
                "练习快速阅读和信息提取能力",
              ],
              duration: "1周",
            },
          ],
          next_steps: [
            "本周重点突破数量关系中的工程问题和行程问题",
            "每天坚持练习20道数量关系专项题目",
            "周末完成一套完整模拟卷，检验学习效果",
            "整理本次考试错题，分析错因并复习相关知识点",
          ],
        });

        setLoading(false);
      }, 1000);
    }
  }, [isAuthenticated, examId]);

  // 未登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h2 className="text-xl font-semibold text-stone-700 mb-2">登录查看考试报告</h2>
          <p className="text-stone-500 mb-6">登录后即可查看详细的考试分析报告</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 头部导航 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-stone-500 mb-1">
              <Link href="/learn" className="hover:text-amber-600">学习中心</Link>
              <span>/</span>
              <Link href="/learn/report/ability" className="hover:text-amber-600">学习报告</Link>
              <span>/</span>
              <span>考试分析</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-800">模考分析报告</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : report ? (
          <>
            {/* 考试概览 */}
            <section className="mb-8">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{report.exam_name}</h2>
                    <div className="flex items-center gap-3 text-white/80 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {report.exam_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(report.time_used)}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-lg text-sm">{report.exam_type}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{report.user_score}</div>
                    <div className="text-sm text-white/80">总得分（满分{report.total_score}）</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{formatPercent(report.correct_count / report.total_questions)}</div>
                    <div className="text-sm text-white/80">正确率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{report.correct_count}<span className="text-lg">/{report.total_questions}</span></div>
                    <div className="text-sm text-white/80">答对题数</div>
                  </div>
                  {report.rank && (
                    <div className="text-center">
                      <div className="text-4xl font-bold">{report.rank}</div>
                      <div className="text-sm text-white/80">排名（共{report.total_participants}人）</div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 快速统计 */}
            <section className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={CheckCircle2}
                  label="答对"
                  value={report.correct_count}
                  subValue="题"
                  color="bg-gradient-to-br from-green-500 to-emerald-600"
                />
                <StatCard
                  icon={XCircle}
                  label="答错"
                  value={report.wrong_count}
                  subValue="题"
                  color="bg-gradient-to-br from-red-500 to-rose-600"
                />
                <StatCard
                  icon={Minus}
                  label="未答"
                  value={report.unanswered_count}
                  subValue="题"
                  color="bg-gradient-to-br from-stone-400 to-stone-500"
                />
                <StatCard
                  icon={Timer}
                  label="平均用时"
                  value={`${Math.round(report.time_used / report.total_questions)}秒`}
                  subValue="每题"
                  color="bg-gradient-to-br from-amber-500 to-orange-600"
                />
              </div>
            </section>

            {/* 各科目得分 */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                各科目得分
              </h2>
              <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                <SubjectScoreChart data={report.subject_scores} />
              </div>
            </section>

            {/* 题型分析 */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-500" />
                题型分析
              </h2>
              <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                <QuestionTypeTable data={report.question_type_scores} />
              </div>
            </section>

            {/* 知识点分析 */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-500" />
                知识点分析
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* 强项 */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/50 shadow-sm">
                  <h3 className="flex items-center gap-2 font-medium text-green-700 mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    强项知识点
                  </h3>
                  <div className="space-y-2">
                    {report.knowledge_point_scores.filter(p => !p.is_weak).slice(0, 5).map((point, idx) => (
                      <KnowledgePointCard key={idx} point={point} />
                    ))}
                  </div>
                </div>
                {/* 薄弱 */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/50 shadow-sm">
                  <h3 className="flex items-center gap-2 font-medium text-red-700 mb-3">
                    <XCircle className="w-5 h-5" />
                    薄弱知识点
                  </h3>
                  <div className="space-y-2">
                    {report.knowledge_point_scores.filter(p => p.is_weak).slice(0, 5).map((point, idx) => (
                      <KnowledgePointCard key={idx} point={point} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 时间分配分析 */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                时间分配分析
              </h2>
              <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm">
                <TimeDistributionChart data={report.time_analysis} />
              </div>
            </section>

            {/* AI 智能诊断 */}
            {aiAnalysis && (
              <>
                <section className="mb-8">
                  <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI 智能诊断
                  </h2>

                  {/* 总体评价 */}
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white mb-4">
                    <h3 className="flex items-center gap-2 font-semibold mb-3">
                      <Star className="w-5 h-5" />
                      总体评价
                    </h3>
                    <p className="text-purple-100 leading-relaxed mb-3">{aiAnalysis.summary}</p>
                    <p className="text-sm text-purple-200">{aiAnalysis.score_evaluation}</p>
                  </div>

                  {/* 优势与不足 */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-emerald-50 rounded-2xl p-5">
                      <h3 className="flex items-center gap-2 font-semibold text-emerald-800 mb-3">
                        <ArrowUpRight className="w-5 h-5" />
                        优势分析
                      </h3>
                      <ul className="space-y-2">
                        {aiAnalysis.strengths.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-5">
                      <h3 className="flex items-center gap-2 font-semibold text-red-800 mb-3">
                        <ArrowDownRight className="w-5 h-5" />
                        不足分析
                      </h3>
                      <ul className="space-y-2">
                        {aiAnalysis.weaknesses.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 失分原因分析 */}
                  <div className="bg-white rounded-2xl p-6 border border-stone-200/50 shadow-sm mb-4">
                    <h3 className="flex items-center gap-2 font-semibold text-stone-800 mb-4">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      失分原因分析
                    </h3>
                    <div className="space-y-3">
                      {aiAnalysis.error_patterns.map((pattern, idx) => (
                        <ErrorPatternCard key={idx} pattern={pattern} />
                      ))}
                    </div>
                  </div>

                  {/* 时间管理建议 */}
                  <div className="bg-amber-50 rounded-2xl p-5 mb-4">
                    <h3 className="flex items-center gap-2 font-semibold text-amber-800 mb-3">
                      <Timer className="w-5 h-5" />
                      时间管理建议
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.time_suggestions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* AI 提升方案 */}
                <section className="mb-8">
                  <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    AI 提升方案
                  </h2>
                  <div className="space-y-4">
                    {aiAnalysis.improvement_plan.map((plan, idx) => (
                      <ImprovementPlanCard key={idx} plan={plan} index={idx} />
                    ))}
                  </div>
                </section>

                {/* 下一步行动 */}
                <section className="mb-8">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200/50">
                    <h3 className="flex items-center gap-2 font-semibold text-indigo-800 mb-4">
                      <Zap className="w-5 h-5" />
                      下一步行动
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.next_steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-indigo-700">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <Link
                href={`/practice/review/${examId}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                查看错题解析
              </Link>
              <Link
                href="/practice/mock"
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-stone-300 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors"
              >
                <Play className="w-5 h-5" />
                再做一套
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto mb-4 text-stone-300" />
            <h2 className="text-xl font-semibold text-stone-700 mb-2">报告不存在</h2>
            <p className="text-stone-500 mb-6">找不到对应的考试报告</p>
            <Link
              href="/learn/report/ability"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
            >
              返回报告中心
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
