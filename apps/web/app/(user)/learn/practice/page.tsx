"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Trophy,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
  Award,
  TrendingUp,
  Calendar,
  Sparkles,
  BookOpen,
  Zap,
  ArrowLeft,
  RotateCcw,
  Play,
  PauseCircle,
  Timer,
  Star,
  PartyPopper,
  CheckCheck,
} from "lucide-react";
import { cn } from "@what-cse/ui";
import {
  useDailyPractice,
  useStreak,
  usePracticeCalendar,
  getDifficultyLabel,
  getDifficultyColor,
  getQuestionTypeLabel,
  formatTimeSpent,
} from "@/hooks/usePractice";
import { useAuthStore } from "@/stores/authStore";
import { DailyQuestion, QuestionBrief } from "@/services/api/practice";

// 题目卡片组件
function QuestionCard({
  question,
  dailyQuestion,
  index,
  isActive,
  onAnswer,
  showAnswer,
}: {
  question: QuestionBrief;
  dailyQuestion: DailyQuestion;
  index: number;
  isActive: boolean;
  onAnswer: (questionId: number, answer: string) => void;
  showAnswer: boolean;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(dailyQuestion.user_answer || "");
  const isAnswered = dailyQuestion.is_correct !== undefined;

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

    const correctAnswer = (question as any).answer || "";
    const isCorrectOption = key === correctAnswer;
    const isUserSelected = key === dailyQuestion.user_answer;

    if (isCorrectOption) {
      return "border-green-500 bg-green-50";
    }
    if (isUserSelected && !dailyQuestion.is_correct) {
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
            {getQuestionTypeLabel(question.question_type)}
          </span>
          <span className={cn("px-2 py-1 text-xs rounded", getDifficultyColor(question.difficulty))}>
            {getDifficultyLabel(question.difficulty)}
          </span>
        </div>
        {isAnswered && (
          <div className="flex items-center gap-1.5">
            {dailyQuestion.is_correct ? (
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
            {dailyQuestion.time_spent && (
              <span className="text-xs text-stone-500 ml-2">
                用时 {formatTimeSpent(dailyQuestion.time_spent)}
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
                    : isAnswered && option.key === (question as any).answer
                    ? "border-green-500 text-green-600 bg-green-50"
                    : isAnswered && option.key === dailyQuestion.user_answer && !dailyQuestion.is_correct
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
      {isAnswered && showAnswer && (question as any).analysis && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            答案解析
          </h4>
          <p className="text-sm text-blue-700 whitespace-pre-wrap">
            {(question as any).analysis}
          </p>
          {(question as any).tips && (
            <p className="mt-2 text-sm text-blue-600 flex items-start gap-1">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>技巧：</strong>{(question as any).tips}</span>
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
  questions: DailyQuestion[];
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

// 打卡成功庆祝组件
function CompletionCelebration({
  stats,
  streak,
  onClose,
}: {
  stats: {
    correctCount: number;
    wrongCount: number;
    totalTime: number;
    correctRate: number;
  };
  streak: number;
  onClose: () => void;
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
          <Star className="absolute -bottom-1 -left-1 w-6 h-6 text-orange-400 animate-pulse" />
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-stone-800 mb-2">
          太棒了！今日打卡完成！
        </h2>
        <p className="text-stone-500 mb-6">
          坚持学习，每天进步一点点
        </p>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{stats.correctCount}</div>
            <div className="text-xs text-green-600">正确</div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-600">{stats.wrongCount}</div>
            <div className="text-xs text-red-600">错误</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{Math.round(stats.correctRate)}%</div>
            <div className="text-xs text-blue-600">正确率</div>
          </div>
        </div>

        {/* 连续打卡 */}
        <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="text-lg font-semibold text-stone-800">
            连续打卡 <span className="text-orange-500">{streak}</span> 天
          </span>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Link
            href="/learn"
            className="flex-1 py-3 px-4 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
          >
            返回学习
          </Link>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            查看解析
          </button>
        </div>
      </div>
    </div>
  );
}

// 打卡日历组件
function MiniCalendar({
  calendar,
  year,
  month,
}: {
  calendar: { date: string; completed: boolean; correct_rate?: number }[];
  year: number;
  month: number;
}) {
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  
  // 获取该月第一天是星期几
  const firstDay = new Date(year, month - 1, 1).getDay();
  
  return (
    <div className="p-4">
      <h3 className="text-center font-semibold text-stone-800 mb-4">
        {year}年{monthNames[month - 1]}
      </h3>
      
      {/* 星期表头 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs text-stone-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 空白占位 */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* 日期 */}
        {calendar.map((item) => {
          const day = parseInt(item.date.split("-")[2]);
          const today = new Date().toISOString().split("T")[0];
          const isToday = item.date === today;
          
          return (
            <div
              key={item.date}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-sm relative",
                isToday && "ring-2 ring-amber-400",
                item.completed
                  ? "bg-green-100 text-green-700"
                  : "bg-stone-50 text-stone-400"
              )}
            >
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                day
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 主页面组件
export default function DailyPracticePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  // Hooks
  const {
    loading: practiceLoading,
    error: practiceError,
    practice,
    fetchTodayPractice,
    submitAnswer,
  } = useDailyPractice();
  
  const { streak, fetchStreak } = useStreak();
  const { calendar, fetchCalendar } = usePracticeCalendar();
  
  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  
  // 加载数据
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTodayPractice();
      fetchStreak();
      fetchCalendar();
    }
  }, [authLoading, isAuthenticated, fetchTodayPractice, fetchStreak, fetchCalendar]);
  
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
  
  // 开始计时
  useEffect(() => {
    if (practice && practice.status !== "completed") {
      setIsTimerRunning(true);
    }
  }, [practice]);
  
  // 检查是否完成并显示庆祝
  useEffect(() => {
    if (practice && practice.status === "completed" && !showCelebration) {
      setIsTimerRunning(false);
      // 只在刚完成时显示庆祝（通过检查最后一题是否刚被回答）
      const lastQuestion = practice.questions[practice.questions.length - 1];
      if (lastQuestion?.is_correct !== undefined) {
        setShowCelebration(true);
        fetchStreak(); // 刷新打卡数据
      }
    }
  }, [practice, showCelebration, fetchStreak]);
  
  // 提交答案处理
  const handleAnswer = useCallback(async (questionId: number, answer: string) => {
    try {
      await submitAnswer({
        question_id: questionId,
        user_answer: answer,
        time_spent: timer,
      });
      setTimer(0); // 重置计时器
      
      // 自动跳转到下一题
      if (practice && currentIndex < practice.questions.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
        }, 1500);
      }
    } catch (err) {
      console.error("提交答案失败:", err);
    }
  }, [submitAnswer, timer, practice, currentIndex]);
  
  // 未登录跳转
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-white">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h2 className="text-xl font-semibold text-stone-800 mb-2">登录后开始每日一练</h2>
          <p className="text-stone-500 mb-4">记录你的学习进度，保持连续打卡</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }
  
  // 加载中
  if (practiceLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-stone-500">正在加载今日练习...</p>
        </div>
      </div>
    );
  }
  
  // 错误
  if (practiceError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-white">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-stone-800 mb-2">加载失败</h2>
          <p className="text-stone-500 mb-4">{practiceError}</p>
          <button
            onClick={() => fetchTodayPractice()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重新加载
          </button>
        </div>
      </div>
    );
  }
  
  if (!practice) return null;

  const currentQuestion = practice.questions[currentIndex];
  const questionDetail = currentQuestion?.question;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* 庆祝弹窗 */}
      {showCelebration && (
        <CompletionCelebration
          stats={{
            correctCount: practice.correct_count,
            wrongCount: practice.wrong_count,
            totalTime: practice.total_time_spent,
            correctRate: practice.correct_rate,
          }}
          streak={streak?.current_streak || 1}
          onClose={() => setShowCelebration(false)}
        />
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* 计时器 */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-stone-200">
              <Timer className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-sm">
                {Math.floor(timer / 60).toString().padStart(2, "0")}:
                {(timer % 60).toString().padStart(2, "0")}
              </span>
            </div>
            
            {/* 连续打卡 */}
            {streak && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">
                  连续 {streak.current_streak} 天
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-600">
              今日进度: {practice.completed_count}/{practice.total_questions}
            </span>
            <span className="text-sm font-medium text-amber-600">
              {Math.round(practice.progress)}%
            </span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${practice.progress}%` }}
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
                dailyQuestion={currentQuestion}
                index={currentIndex}
                isActive={true}
                onAnswer={handleAnswer}
                showAnswer={currentQuestion.is_correct !== undefined}
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
                onClick={() => setCurrentIndex(Math.min(practice.questions.length - 1, currentIndex + 1))}
                disabled={currentIndex === practice.questions.length - 1}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  currentIndex === practice.questions.length - 1
                    ? "text-stone-300 cursor-not-allowed"
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                下一题
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* 右侧：进度和统计 */}
          <div className="space-y-4">
            {/* 答题卡 */}
            <div className="bg-white rounded-2xl shadow-card border border-stone-200/50 p-4">
              <h3 className="font-medium text-stone-800 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                答题卡
              </h3>
              <ProgressIndicator
                questions={practice.questions}
                currentIndex={currentIndex}
                onSelect={setCurrentIndex}
              />
            </div>
            
            {/* 今日统计 */}
            <div className="bg-white rounded-2xl shadow-card border border-stone-200/50 p-4">
              <h3 className="font-medium text-stone-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                今日统计
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-green-600">{practice.correct_count}</div>
                  <div className="text-xs text-green-600">正确</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-red-600">{practice.wrong_count}</div>
                  <div className="text-xs text-red-600">错误</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {practice.completed_count > 0
                      ? Math.round(practice.correct_rate)
                      : 0}%
                  </div>
                  <div className="text-xs text-blue-600">正确率</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-amber-600">
                    {formatTimeSpent(practice.total_time_spent || 0)}
                  </div>
                  <div className="text-xs text-amber-600">用时</div>
                </div>
              </div>
            </div>
            
            {/* 打卡日历 */}
            {calendar.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-stone-200/50 overflow-hidden">
                <MiniCalendar
                  calendar={calendar}
                  year={new Date().getFullYear()}
                  month={new Date().getMonth() + 1}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
