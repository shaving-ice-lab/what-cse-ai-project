"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  TrendingUp,
  Award,
  BarChart3,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Share2,
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  Star,
  Zap,
  AlertCircle,
  Lightbulb,
  PieChart,
  Layers,
  Copy,
  MessageCircle,
  Link as LinkIcon,
} from "lucide-react";
import {
  practiceApi,
  Question,
  PaperResultResponse,
  PaperRankingInfo,
  getQuestionTypeName,
  getDifficultyLabel,
  getDifficultyColor,
  formatTime,
} from "@/services/api/practice";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

// 成绩等级配置
const getScoreLevel = (percentage: number) => {
  if (percentage >= 90) return { label: "优秀", color: "text-emerald-500", bgColor: "bg-emerald-500" };
  if (percentage >= 80) return { label: "良好", color: "text-blue-500", bgColor: "bg-blue-500" };
  if (percentage >= 70) return { label: "中等", color: "text-amber-500", bgColor: "bg-amber-500" };
  if (percentage >= 60) return { label: "及格", color: "text-orange-500", bgColor: "bg-orange-500" };
  return { label: "不及格", color: "text-red-500", bgColor: "bg-red-500" };
};

// 环形进度组件
function ScoreRing({
  score,
  total,
  size = 180,
}: {
  score: number;
  total: number;
  size?: number;
}) {
  const percentage = total > 0 ? (score / total) * 100 : 0;
  const level = getScoreLevel(percentage);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
      </svg>
      {/* 中心文字 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-stone-800">{score.toFixed(1)}</div>
        <div className="text-sm text-stone-500">/{total}分</div>
        <div className={`text-sm font-medium mt-1 ${level.color}`}>{level.label}</div>
      </div>
    </div>
  );
}

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
    <div className="bg-white rounded-xl border border-stone-200/50 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-stone-800">{value}</div>
          <div className="text-xs text-stone-500">{label}</div>
          {subValue && <div className="text-xs text-stone-400">{subValue}</div>}
        </div>
      </div>
    </div>
  );
}

// 题型统计类型
interface TypeStat {
  type: string;
  typeName: string;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  score: number;
  maxScore: number;
  correctRate: number;
}

// 知识点统计类型
interface KnowledgeStat {
  name: string;
  total: number;
  correct: number;
  wrong: number;
  correctRate: number;
}

// 进度条组件
function ProgressBar({
  percentage,
  color = "bg-amber-500",
  height = "h-2",
}: {
  percentage: number;
  color?: string;
  height?: string;
}) {
  return (
    <div className={`w-full bg-stone-200 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${color} ${height} rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
}

// 分项统计组件
function CategoryStats({
  questions,
  answers,
}: {
  questions: Question[];
  answers: Map<number, { user_answer: string; is_correct: boolean; score: number }>;
}) {
  // 计算各题型统计
  const typeStats: TypeStat[] = (() => {
    const statsMap = new Map<string, TypeStat>();
    
    questions.forEach((q) => {
      const answer = answers.get(q.id);
      const type = q.question_type;
      
      if (!statsMap.has(type)) {
        statsMap.set(type, {
          type,
          typeName: getQuestionTypeName(type),
          total: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
          score: 0,
          maxScore: 0,
          correctRate: 0,
        });
      }
      
      const stat = statsMap.get(type)!;
      stat.total += 1;
      stat.maxScore += 1; // 假设每题1分，实际可根据数据调整
      
      if (answer) {
        if (answer.is_correct) {
          stat.correct += 1;
          stat.score += answer.score || 1;
        } else if (answer.user_answer) {
          stat.wrong += 1;
        } else {
          stat.unanswered += 1;
        }
      } else {
        stat.unanswered += 1;
      }
    });
    
    // 计算正确率
    statsMap.forEach((stat) => {
      stat.correctRate = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
  })();

  // 计算各知识点/分类统计
  const knowledgeStats: KnowledgeStat[] = (() => {
    const statsMap = new Map<string, KnowledgeStat>();
    
    questions.forEach((q) => {
      const answer = answers.get(q.id);
      const categoryName = q.category?.name || "未分类";
      
      if (!statsMap.has(categoryName)) {
        statsMap.set(categoryName, {
          name: categoryName,
          total: 0,
          correct: 0,
          wrong: 0,
          correctRate: 0,
        });
      }
      
      const stat = statsMap.get(categoryName)!;
      stat.total += 1;
      
      if (answer) {
        if (answer.is_correct) {
          stat.correct += 1;
        } else if (answer.user_answer) {
          stat.wrong += 1;
        }
      }
    });
    
    // 计算正确率
    statsMap.forEach((stat) => {
      stat.correctRate = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
  })();

  // 获取颜色
  const getColorByRate = (rate: number) => {
    if (rate >= 80) return "bg-emerald-500";
    if (rate >= 60) return "bg-blue-500";
    if (rate >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getTextColorByRate = (rate: number) => {
    if (rate >= 80) return "text-emerald-600";
    if (rate >= 60) return "text-blue-600";
    if (rate >= 40) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* 题型统计 */}
      <div className="bg-white rounded-xl border border-stone-200/50 shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-stone-100">
          <PieChart className="w-5 h-5 text-violet-500" />
          <h3 className="font-bold text-stone-800">题型统计</h3>
        </div>
        <div className="p-4 space-y-4">
          {typeStats.length === 0 ? (
            <div className="text-center py-4 text-stone-500 text-sm">暂无数据</div>
          ) : (
            typeStats.map((stat) => (
              <div key={stat.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700">{stat.typeName}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-stone-500">{stat.total}题</span>
                    <span className="text-emerald-600">{stat.correct}对</span>
                    <span className="text-red-500">{stat.wrong}错</span>
                    <span className={`font-semibold ${getTextColorByRate(stat.correctRate)}`}>
                      {stat.correctRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <ProgressBar 
                  percentage={stat.correctRate} 
                  color={getColorByRate(stat.correctRate)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 知识点统计 */}
      <div className="bg-white rounded-xl border border-stone-200/50 shadow-card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-stone-100">
          <Layers className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-stone-800">知识点统计</h3>
        </div>
        <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
          {knowledgeStats.length === 0 ? (
            <div className="text-center py-4 text-stone-500 text-sm">暂无数据</div>
          ) : (
            knowledgeStats.map((stat) => (
              <div key={stat.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700 truncate max-w-[150px]" title={stat.name}>
                    {stat.name}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-stone-500">{stat.total}题</span>
                    <span className="text-emerald-600">{stat.correct}对</span>
                    <span className="text-red-500">{stat.wrong}错</span>
                    <span className={`font-semibold ${getTextColorByRate(stat.correctRate)}`}>
                      {stat.correctRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <ProgressBar 
                  percentage={stat.correctRate} 
                  color={getColorByRate(stat.correctRate)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 题目详情组件
function QuestionDetail({
  question,
  answer,
  index,
  isExpanded,
  onToggle,
}: {
  question: Question;
  answer: {
    user_answer: string;
    is_correct: boolean;
    score: number;
  };
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      {/* 题目头部 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 bg-white hover:bg-stone-50 transition-colors text-left"
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
            answer.is_correct
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
              {getQuestionTypeName(question.question_type)}
            </span>
            {answer.is_correct ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="text-stone-700 mt-1 line-clamp-1">{question.content}</div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-stone-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 题目详情 */}
      {isExpanded && (
        <div className="border-t border-stone-100 p-4 bg-stone-50/50">
          <div className="mb-4">
            <div className="text-stone-800 whitespace-pre-wrap">{question.content}</div>
          </div>

          {/* 选项 */}
          {question.options && (
            <div className="space-y-2 mb-4">
              {question.options.map((opt) => {
                const isUserAnswer = answer.user_answer?.includes(opt.key);
                const isCorrectAnswer = question.answer?.includes(opt.key);

                return (
                  <div
                    key={opt.key}
                    className={`flex items-start gap-2 p-3 rounded-lg ${
                      isCorrectAnswer
                        ? "bg-emerald-50 border border-emerald-200"
                        : isUserAnswer && !isCorrectAnswer
                        ? "bg-red-50 border border-red-200"
                        : "bg-white border border-stone-200"
                    }`}
                  >
                    <span className="font-medium text-stone-700">{opt.key}.</span>
                    <span className="flex-1">{opt.content}</span>
                    {isCorrectAnswer && (
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    )}
                    {isUserAnswer && !isCorrectAnswer && (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 答案信息 */}
          <div className="flex items-center gap-4 text-sm mb-4">
            <span className="text-stone-500">
              正确答案：<span className="font-bold text-emerald-600">{question.answer}</span>
            </span>
            <span className="text-stone-500">
              你的答案：
              <span
                className={`font-bold ${
                  answer.is_correct ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {answer.user_answer || "未作答"}
              </span>
            </span>
          </div>

          {/* 解析 */}
          {question.analysis && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-700">答案解析</span>
              </div>
              <div className="text-sm text-stone-700 whitespace-pre-wrap">
                {question.analysis}
              </div>
            </div>
          )}

          {/* 解题技巧 */}
          {question.tips && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-amber-700">解题技巧</span>
              </div>
              <div className="text-sm text-stone-700">{question.tips}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExamResultContent({ paperId }: { paperId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get("record_id");

  const [result, setResult] = useState<PaperResultResponse | null>(null);
  const [ranking, setRanking] = useState<PaperRankingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // 生成分享文本
  const generateShareText = () => {
    if (!result) return "";
    const { record } = result;
    const correctRate = record.correct_count / (record.correct_count + record.wrong_count + record.unanswered_count) * 100;
    const scorePercentage = record.total_score > 0 ? (record.user_score / record.total_score) * 100 : 0;
    
    let grade = "继续努力";
    if (scorePercentage >= 90) grade = "优秀";
    else if (scorePercentage >= 80) grade = "良好";
    else if (scorePercentage >= 70) grade = "中等";
    else if (scorePercentage >= 60) grade = "及格";
    
    let rankingText = "";
    if (ranking) {
      rankingText = `🥇 排名：第${ranking.user_rank}名（超过${ranking.percentile.toFixed(0)}%的考生）\n`;
    }
    
    return `【公考刷题成绩单】
📝 ${record.paper_title || "模拟考试"}
🏆 得分：${record.user_score.toFixed(1)}/${record.total_score}分（${grade}）
${rankingText}✅ 正确：${record.correct_count}题
❌ 错误：${record.wrong_count}题
⏱️ 用时：${formatTime(record.total_time)}
📊 正确率：${correctRate.toFixed(1)}%

来「What公考」一起刷题备考吧！`;
  };

  // 复制到剪贴板
  const copyToClipboard = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
      setShowShareDialog(false);
    } catch (error) {
      toast.error("复制失败，请手动复制");
    }
  };

  // 使用原生分享
  const nativeShare = async () => {
    const text = generateShareText();
    const shareData = {
      title: result?.record.paper_title || "公考刷题成绩",
      text: text,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShowShareDialog(false);
      } catch (error) {
        // 用户取消分享
      }
    } else {
      // 不支持原生分享，复制到剪贴板
      copyToClipboard();
    }
  };

  // 复制链接
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("链接已复制");
    } catch (error) {
      toast.error("复制失败");
    }
  };

  useEffect(() => {
    const fetchResult = async () => {
      if (!recordId) {
        toast.error("缺少记录ID");
        router.push("/practice/papers");
        return;
      }

      setLoading(true);
      try {
        const res = await practiceApi.getPaperResult(parseInt(paperId), parseInt(recordId));
        setResult(res);
        
        // Fetch ranking info
        try {
          const rankingRes = await practiceApi.getPaperRanking(parseInt(paperId), parseInt(recordId));
          setRanking(rankingRes);
        } catch (rankError) {
          console.error("Failed to load ranking:", rankError);
          // Don't show error toast for ranking, it's optional
        }
      } catch (error: any) {
        toast.error(error.message || "加载结果失败");
        router.push("/practice/papers");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [paperId, recordId, router]);

  const toggleQuestion = (questionId: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const expandAll = () => {
    const allIds = result?.questions.map((q) => q.id) || [];
    setExpandedQuestions(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-600">加载考试结果...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-700 mb-2">结果加载失败</h3>
          <Link
            href="/practice/papers"
            className="text-amber-500 hover:text-amber-600"
          >
            返回试卷中心
          </Link>
        </div>
      </div>
    );
  }

  const { record, answers, questions } = result;
  const totalQuestions = questions.length;
  const correctRate = totalQuestions > 0 ? (record.correct_count / totalQuestions) * 100 : 0;
  const scorePercentage = record.total_score > 0 ? (record.user_score / record.total_score) * 100 : 0;

  // 构建答案映射
  const answerMap = new Map(answers.map((a) => [a.question_id, a]));

  // 过滤显示的题目
  const displayQuestions = showOnlyWrong
    ? questions.filter((q) => !answerMap.get(q.id)?.is_correct)
    : questions;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 成绩总览 */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ScoreRing score={record.user_score} total={record.total_score} />
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">{record.paper_title || "考试结果"}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/80">
                {ranking && (
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    排名：{ranking.user_rank} / {ranking.total_participants}
                    {ranking.percentile >= 90 && <Star className="w-3 h-3 text-yellow-300 ml-1" />}
                  </span>
                )}
                {ranking && (
                  <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    超过 {ranking.percentile.toFixed(0)}% 的考生
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  用时：{formatTime(record.total_time)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Target}
            label="总题数"
            value={totalQuestions}
            color="bg-blue-500"
          />
          <StatCard
            icon={CheckCircle}
            label="正确"
            value={record.correct_count}
            subValue={`${correctRate.toFixed(1)}%`}
            color="bg-emerald-500"
          />
          <StatCard
            icon={XCircle}
            label="错误"
            value={record.wrong_count}
            color="bg-red-500"
          />
          <StatCard
            icon={AlertCircle}
            label="未答"
            value={record.unanswered_count}
            color="bg-stone-400"
          />
        </div>

        {/* 排名信息 */}
        {ranking && ranking.total_participants > 1 && (
          <div className="bg-white rounded-xl border border-stone-200/50 shadow-card p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-stone-800">排名统计</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gradient-to-b from-amber-50 to-white rounded-lg border border-amber-200">
                <div className="text-2xl font-bold text-amber-600">{ranking.user_rank}</div>
                <div className="text-xs text-stone-500">我的排名</div>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-stone-700">{ranking.total_participants}</div>
                <div className="text-xs text-stone-500">总参与人数</div>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{ranking.highest_score.toFixed(1)}</div>
                <div className="text-xs text-stone-500">最高分</div>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{ranking.avg_score.toFixed(1)}</div>
                <div className="text-xs text-stone-500">平均分</div>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-violet-600">{ranking.percentile.toFixed(0)}%</div>
                <div className="text-xs text-stone-500">超过考生</div>
              </div>
            </div>
          </div>
        )}

        {/* 分项统计 */}
        <CategoryStats questions={questions} answers={answerMap} />

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link
            href={`/practice/exam/${paperId}`}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重新做卷
          </Link>
          <button
            onClick={() => setShowShareDialog(true)}
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            分享成绩
          </button>
          <Link
            href="/practice/papers"
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            更多试卷
          </Link>
        </div>

        {/* 答题详情 */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              答题详情
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOnlyWrong(!showOnlyWrong)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showOnlyWrong
                    ? "bg-red-100 text-red-600"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <XCircle className="w-4 h-4" />
                {showOnlyWrong ? "显示全部" : "只看错题"}
              </button>
              <button
                onClick={expandAll}
                className="text-sm text-stone-500 hover:text-stone-700"
              >
                全部展开
              </button>
              <span className="text-stone-300">|</span>
              <button
                onClick={collapseAll}
                className="text-sm text-stone-500 hover:text-stone-700"
              >
                全部收起
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {displayQuestions.length === 0 ? (
              <div className="text-center py-8 text-stone-500">
                {showOnlyWrong ? "恭喜！没有错题" : "暂无题目"}
              </div>
            ) : (
              displayQuestions.map((question, index) => {
                const answer = answerMap.get(question.id) || {
                  user_answer: "",
                  is_correct: false,
                  score: 0,
                };
                const originalIndex = questions.findIndex((q) => q.id === question.id);
                
                return (
                  <QuestionDetail
                    key={question.id}
                    question={question}
                    answer={answer}
                    index={originalIndex}
                    isExpanded={expandedQuestions.has(question.id)}
                    onToggle={() => toggleQuestion(question.id)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* 学习建议 */}
        <div className="mt-6 bg-amber-50 rounded-xl border border-amber-200/50 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-stone-800 mb-1">学习建议</h4>
              <ul className="text-sm text-stone-600 space-y-1">
                {scorePercentage < 60 && (
                  <li>• 基础较薄弱，建议从基础知识点开始系统学习</li>
                )}
                {scorePercentage >= 60 && scorePercentage < 80 && (
                  <li>• 已具备一定基础，针对薄弱环节重点突破</li>
                )}
                {scorePercentage >= 80 && (
                  <li>• 基础扎实，可以尝试更高难度的题目</li>
                )}
                {record.wrong_count > 0 && (
                  <li>• 及时复习错题，避免同类错误再次出现</li>
                )}
                <li>• 保持每天练习的习惯，持续提升</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 分享弹窗 */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-800">分享成绩</h3>
              <p className="text-sm text-stone-500 mt-1">选择分享方式</p>
            </div>
            
            {/* 成绩预览卡片 */}
            <div className="p-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white">
                <div className="text-center">
                  <div className="text-sm opacity-80 mb-1">{record.paper_title || "模拟考试"}</div>
                  <div className="text-4xl font-bold">{record.user_score.toFixed(1)}</div>
                  <div className="text-sm opacity-80">/{record.total_score}分</div>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold">{record.correct_count}</div>
                    <div className="opacity-80 text-xs">正确</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{record.wrong_count}</div>
                    <div className="opacity-80 text-xs">错误</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{formatTime(record.total_time)}</div>
                    <div className="opacity-80 text-xs">用时</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 分享选项 */}
            <div className="p-4 space-y-3">
              <button
                onClick={nativeShare}
                className="w-full flex items-center gap-3 p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-stone-800">分享给好友</div>
                  <div className="text-xs text-stone-500">调用系统分享功能</div>
                </div>
              </button>
              
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Copy className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-stone-800">复制成绩文字</div>
                  <div className="text-xs text-stone-500">复制文字发送给好友</div>
                </div>
              </button>
              
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <div className="p-2 bg-violet-100 rounded-lg">
                  <LinkIcon className="w-5 h-5 text-violet-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-stone-800">复制链接</div>
                  <div className="text-xs text-stone-500">分享此页面链接</div>
                </div>
              </button>
            </div>

            {/* 关闭按钮 */}
            <div className="p-4 border-t border-stone-100">
              <button
                onClick={() => setShowShareDialog(false)}
                className="w-full py-2.5 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamResultPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      }
    >
      <ExamResultContent paperId={paperId} />
    </Suspense>
  );
}
