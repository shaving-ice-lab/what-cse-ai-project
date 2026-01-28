"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Timer,
  Target,
  Loader2,
  BookOpen,
  Play,
  Zap,
  AlertTriangle,
  Home,
  RotateCcw,
  Trophy,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { cn } from "@what-cse/ui/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  practiceApi,
  PracticeSessionDetail,
  SessionQuestion,
  Question,
  SubmitSessionAnswerRequest,
  getSessionTypeName,
  getSessionStatusName,
  getDifficultyLabel,
  getDifficultyColor,
  getQuestionTypeName,
  formatTime,
} from "@/services/api/practice";

// 题目卡片组件
function QuestionCard({
  question,
  sessionQuestion,
  index,
  isActive,
  onAnswer,
  showAnalysis,
}: {
  question: Question;
  sessionQuestion: SessionQuestion;
  index: number;
  isActive: boolean;
  onAnswer: (questionId: number, answer: string) => void;
  showAnalysis: boolean;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(sessionQuestion.user_answer || "");
  const isAnswered = sessionQuestion.is_correct !== undefined;

  const handleSelect = (key: string) => {
    if (isAnswered || !isActive) return;
    setSelectedAnswer(key);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || isAnswered) return;
    onAnswer(question.id, selectedAnswer);
  };

  // 获取选项样式
  const getOptionStyle = (key: string) => {
    if (!isAnswered) {
      return selectedAnswer === key
        ? "border-amber-500 bg-amber-50"
        : "border-stone-200 hover:border-amber-300";
    }

    const correctAnswer = question.answer || "";
    const isCorrectOption = key === correctAnswer;
    const isUserSelected = key === sessionQuestion.user_answer;

    if (isCorrectOption) {
      return "border-green-500 bg-green-50";
    }
    if (isUserSelected && !sessionQuestion.is_correct) {
      return "border-red-500 bg-red-50";
    }
    return "border-stone-200 opacity-50";
  };

  return (
    <div className={cn("transition-all duration-300", isActive ? "block" : "hidden")}>
      {/* 题目头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg">
            第 {index + 1} 题
          </span>
          <span className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded">
            {getQuestionTypeName(question.question_type)}
          </span>
          <span className={cn("px-2 py-1 text-xs rounded", getDifficultyColor(question.difficulty))}>
            {getDifficultyLabel(question.difficulty)}
          </span>
        </div>
        {isAnswered && (
          <div className="flex items-center gap-1.5">
            {sessionQuestion.is_correct ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                正确
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-red-600">
                <XCircle className="w-4 h-4" />
                错误
              </span>
            )}
          </div>
        )}
      </div>

      {/* 题目内容 */}
      <div className="prose prose-stone max-w-none mb-6">
        <p className="text-base text-stone-800 leading-relaxed whitespace-pre-wrap">
          {question.content}
        </p>
      </div>

      {/* 选项 */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-3 mb-6">
          {question.options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              disabled={isAnswered}
              className={cn(
                "w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                getOptionStyle(option.key),
                !isAnswered && "cursor-pointer"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium border-2",
                  selectedAnswer === option.key && !isAnswered
                    ? "border-amber-500 text-amber-600 bg-amber-50"
                    : isAnswered && option.key === question.answer
                    ? "border-green-500 text-green-600 bg-green-50"
                    : isAnswered && option.key === sessionQuestion.user_answer && !sessionQuestion.is_correct
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-stone-300 text-stone-500"
                )}
              >
                {option.key}
              </span>
              <span className="text-stone-700">{option.content}</span>
            </button>
          ))}
        </div>
      )}

      {/* 提交按钮 */}
      {!isAnswered && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all",
            selectedAnswer
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
          )}
        >
          提交答案
        </button>
      )}

      {/* 答案解析 */}
      {isAnswered && showAnalysis && question.analysis && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            答案解析
          </h4>
          <p className="text-sm text-blue-700 whitespace-pre-wrap">
            {question.analysis}
          </p>
          {question.tips && (
            <p className="mt-2 text-sm text-blue-600 flex items-start gap-1">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>技巧：</strong>{question.tips}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// 进度指示器组件
function ProgressIndicator({
  questions,
  currentIndex,
  onSelect,
}: {
  questions: SessionQuestion[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {questions.map((q, index) => {
        const isAnswered = q.is_correct !== undefined;
        const isActive = index === currentIndex;

        return (
          <button
            key={q.question_id}
            onClick={() => onSelect(index)}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
              isActive
                ? "bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-2"
                : isAnswered
                ? q.is_correct
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            )}
          >
            {isAnswered ? (
              q.is_correct ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )
            ) : (
              index + 1
            )}
          </button>
        );
      })}
    </div>
  );
}

// 完成庆祝组件
function CompletionCelebration({
  session,
  onViewResults,
  onBackHome,
}: {
  session: PracticeSessionDetail;
  onViewResults: () => void;
  onBackHome: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl animate-scale-in">
        {/* 庆祝图标 */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <PartyPopper className="w-10 h-10 text-amber-500" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-bounce" />
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-stone-800 mb-2">
          练习完成！
        </h2>
        <p className="text-stone-500 mb-6">
          {getSessionTypeName(session.session_type)}已完成
        </p>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{session.correct_count}</div>
            <div className="text-xs text-green-600">正确</div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-600">{session.wrong_count}</div>
            <div className="text-xs text-red-600">错误</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{Math.round(session.correct_rate)}%</div>
            <div className="text-xs text-blue-600">正确率</div>
          </div>
        </div>

        {/* 用时 */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-stone-50 rounded-xl">
          <Clock className="w-5 h-5 text-stone-500" />
          <span className="text-stone-600">
            用时: {formatTime(session.total_time_spent)}
          </span>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onBackHome}
            className="flex-1 py-3 px-4 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            返回
          </button>
          <button
            onClick={onViewResults}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            查看解析
          </button>
        </div>
      </div>
    </div>
  );
}

// 主页面组件
export default function PracticeSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = Number(params.id);
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  // 状态
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSessionDetail | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  // 加载会话
  useEffect(() => {
    if (!authLoading && isAuthenticated && sessionId) {
      loadSession();
    }
  }, [authLoading, isAuthenticated, sessionId]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const data = await practiceApi.getSession(sessionId);
      setSession(data);
      
      // 如果会话是待开始状态，自动开始
      if (data.status === "pending") {
        const started = await practiceApi.startSession(sessionId);
        setSession(started);
      }
      
      // 找到第一个未答题的位置
      const firstUnanswered = data.questions.findIndex(q => q.is_correct === undefined);
      if (firstUnanswered !== -1) {
        setCurrentIndex(firstUnanswered);
      }
      
      // 如果会话正在进行中，启动计时器
      if (data.status === "active" || data.status === "pending") {
        setIsTimerRunning(true);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setLoading(false);
    }
  };

  // 计时器
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  // 检查是否完成
  useEffect(() => {
    if (session && session.status === "completed" && !showCelebration) {
      setIsTimerRunning(false);
      setShowCelebration(true);
    }
  }, [session, showCelebration]);

  // 提交答案
  const handleAnswer = useCallback(async (questionId: number, answer: string) => {
    if (!session || submitting) return;
    
    setSubmitting(true);
    try {
      await practiceApi.submitSessionAnswer(sessionId, {
        question_id: questionId,
        user_answer: answer,
        time_spent: timer,
      });
      
      // 重新加载会话
      const updated = await practiceApi.getSession(sessionId);
      setSession(updated);
      setTimer(0);
      
      // 如果还有未完成的题目，跳转到下一题
      if (updated.status !== "completed" && currentIndex < updated.questions.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setSubmitting(false);
    }
  }, [session, sessionId, timer, currentIndex, submitting]);

  // 放弃练习
  const handleAbandon = useCallback(async () => {
    if (!confirm("确定要放弃本次练习吗？")) return;
    
    try {
      await practiceApi.abandonSession(sessionId);
      router.push("/learn/practice/specialized");
    } catch (error) {
      console.error("Failed to abandon session:", error);
    }
  }, [sessionId, router]);

  // 未登录
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-white">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-400" />
          <h2 className="text-xl font-semibold text-stone-800 mb-2">请先登录</h2>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }

  // 加载中
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-stone-500">正在加载练习...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-white">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-stone-800 mb-2">练习不存在</h2>
          <Link
            href="/learn/practice/specialized"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            返回练习中心
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  const questionDetail = currentQuestion?.question;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* 完成庆祝 */}
      {showCelebration && (
        <CompletionCelebration
          session={session}
          onViewResults={() => setShowCelebration(false)}
          onBackHome={() => router.push("/learn/practice/specialized")}
        />
      )}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleAbandon}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>退出</span>
          </button>

          <div className="flex items-center gap-4">
            {/* 计时器 */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-stone-200">
              <Timer className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-sm">
                {Math.floor(timer / 60).toString().padStart(2, "0")}:
                {(timer % 60).toString().padStart(2, "0")}
              </span>
            </div>

            {/* 限时提示 */}
            {session.time_limit > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">
                  剩余 {formatTime(Math.max(0, session.time_limit - session.total_time_spent))}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-600">
              进度: {session.completed_count}/{session.total_questions}
            </span>
            <span className="text-sm font-medium text-amber-600">
              {Math.round(session.progress)}%
            </span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${session.progress}%` }}
            />
          </div>
        </div>

        {/* 主内容区 */}
        <div className="grid lg:grid-cols-[1fr,280px] gap-6">
          {/* 左侧：题目卡片 */}
          <div className="bg-white rounded-2xl shadow-card border border-stone-200/50 p-6">
            {questionDetail && (
              <QuestionCard
                question={questionDetail}
                sessionQuestion={currentQuestion}
                index={currentIndex}
                isActive={true}
                onAnswer={handleAnswer}
                showAnalysis={currentQuestion.is_correct !== undefined}
              />
            )}

            {/* 底部导航 */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-stone-100">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  currentIndex === 0
                    ? "text-stone-300 cursor-not-allowed"
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                上一题
              </button>

              <button
                onClick={() => setCurrentIndex(Math.min(session.questions.length - 1, currentIndex + 1))}
                disabled={currentIndex === session.questions.length - 1}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  currentIndex === session.questions.length - 1
                    ? "text-stone-300 cursor-not-allowed"
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                下一题
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 右侧：答题卡和统计 */}
          <div className="space-y-4">
            {/* 答题卡 */}
            <div className="bg-white rounded-2xl shadow-card border border-stone-200/50 p-4">
              <h3 className="font-medium text-stone-800 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                答题卡
              </h3>
              <ProgressIndicator
                questions={session.questions}
                currentIndex={currentIndex}
                onSelect={setCurrentIndex}
              />
            </div>

            {/* 实时统计 */}
            <div className="bg-white rounded-2xl shadow-card border border-stone-200/50 p-4">
              <h3 className="font-medium text-stone-800 mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                实时统计
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-green-600">{session.correct_count}</div>
                  <div className="text-xs text-green-600">正确</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-red-600">{session.wrong_count}</div>
                  <div className="text-xs text-red-600">错误</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {session.completed_count > 0
                      ? Math.round(session.correct_rate)
                      : 0}%
                  </div>
                  <div className="text-xs text-blue-600">正确率</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-amber-600">
                    {formatTime(session.total_time_spent)}
                  </div>
                  <div className="text-xs text-amber-600">用时</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
