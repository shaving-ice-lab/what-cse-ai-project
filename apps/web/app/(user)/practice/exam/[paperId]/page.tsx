"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Flag,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  List,
  X,
  Loader2,
  Target,
  Play,
  Pause,
  Send,
  AlertTriangle,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  practiceApi,
  Question,
  ExamPaper,
  QuestionOption,
  getQuestionTypeName,
  getDifficultyLabel,
  getDifficultyColor,
  formatTime,
} from "@/services/api/practice";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

// 答题状态
interface AnswerState {
  userAnswer: string;
  isMarked: boolean;
}

// 确认交卷弹窗
function SubmitConfirmModal({
  totalQuestions,
  answeredCount,
  markedCount,
  elapsedTime,
  onConfirm,
  onCancel,
}: {
  totalQuestions: number;
  answeredCount: number;
  markedCount: number;
  elapsedTime: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-800">确认交卷</h3>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-600">总题数</span>
              <span className="font-bold text-stone-800">{totalQuestions}题</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-600">已答题数</span>
              <span className="font-bold text-emerald-600">{answeredCount}题</span>
            </div>
            {unansweredCount > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <span className="text-stone-600">未答题数</span>
                <span className="font-bold text-red-500">{unansweredCount}题</span>
              </div>
            )}
            {markedCount > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <span className="text-stone-600">标记题数</span>
                <span className="font-bold text-amber-600">{markedCount}题</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-stone-600">用时</span>
              <span className="font-bold text-stone-800">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-sm text-amber-700">
              还有 {unansweredCount} 道题未作答，确定要交卷吗？
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors"
            >
              继续答题
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors"
            >
              确认交卷
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 答题卡弹窗
function AnswerCardModal({
  questions,
  currentIndex,
  answerStates,
  onJumpTo,
  onClose,
}: {
  questions: Question[];
  currentIndex: number;
  answerStates: Record<number, AnswerState>;
  onJumpTo: (index: number) => void;
  onClose: () => void;
}) {
  const getStatusClass = (index: number) => {
    const questionId = questions[index]?.id;
    const state = answerStates[questionId];

    if (index === currentIndex) {
      return "bg-blue-500 text-white ring-2 ring-blue-300";
    }
    if (state?.isMarked) {
      return "bg-amber-500 text-white";
    }
    if (state?.userAnswer) {
      return "bg-emerald-500 text-white";
    }
    return "bg-white text-stone-600 border-stone-200 hover:border-stone-300";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-stone-800">答题卡</h3>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[55vh]">
          <div className="grid grid-cols-8 gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => {
                  onJumpTo(index);
                  onClose();
                }}
                className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all ${getStatusClass(index)}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span>已答</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span>标记</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-white border border-stone-200" />
              <span>未答</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span>当前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 选项组件
function OptionItem({
  option,
  isSelected,
  isMultiple,
  onClick,
}: {
  option: QuestionOption;
  isSelected: boolean;
  isMultiple: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-4 border-2 rounded-xl text-left transition-all hover:border-blue-300 hover:bg-blue-50/50 ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-stone-200 bg-white"
      }`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
          isSelected ? "bg-blue-500 text-white" : "bg-stone-100 text-stone-600"
        }`}
      >
        {isMultiple ? (
          isSelected ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )
        ) : (
          option.key
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-stone-800">{option.content}</div>
      </div>
    </button>
  );
}

export default function ExamPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerStates, setAnswerStates] = useState<Record<number, AnswerState>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAnswerCard, setShowAnswerCard] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 开始考试
  useEffect(() => {
    const startExam = async () => {
      if (!isAuthenticated) {
        toast.error("请先登录");
        router.push("/login");
        return;
      }

      setLoading(true);
      try {
        const res = await practiceApi.startPaper(parseInt(paperId));
        setPaper(res.paper);
        setQuestions(res.questions || []);
        setRecordId(res.record_id);
        setStartTime(Date.now());
      } catch (error: any) {
        toast.error(error.message || "开始考试失败");
        router.push("/practice/papers");
      } finally {
        setLoading(false);
      }
    };

    startExam();
  }, [paperId, isAuthenticated, router]);

  // 计时器
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      // 检查是否超时
      if (paper && elapsed >= paper.time_limit * 60) {
        toast.warning("考试时间到，自动交卷");
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isPaused, paper]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answerStates[currentQuestion.id] : null;
  const isMultipleChoice = currentQuestion?.question_type === "multi_choice";

  // 剩余时间
  const remainingTime = paper ? Math.max(0, paper.time_limit * 60 - elapsedTime) : 0;
  const isTimeWarning = remainingTime < 300; // 小于5分钟警告

  // 选择答案
  const handleSelectOption = (key: string) => {
    if (!currentQuestion) return;

    const currentState = answerStates[currentQuestion.id] || { userAnswer: "", isMarked: false };

    let newAnswer: string;
    if (isMultipleChoice) {
      const selected = currentState.userAnswer.split(",").filter(Boolean);
      if (selected.includes(key)) {
        newAnswer = selected.filter((k) => k !== key).join(",");
      } else {
        newAnswer = [...selected, key].sort().join(",");
      }
    } else {
      newAnswer = key;
    }

    setAnswerStates({
      ...answerStates,
      [currentQuestion.id]: {
        ...currentState,
        userAnswer: newAnswer,
      },
    });
  };

  // 标记题目
  const toggleMark = () => {
    if (!currentQuestion) return;
    const currentState = answerStates[currentQuestion.id] || { userAnswer: "", isMarked: false };
    setAnswerStates({
      ...answerStates,
      [currentQuestion.id]: {
        ...currentState,
        isMarked: !currentState.isMarked,
      },
    });
  };

  // 提交试卷
  const handleSubmit = async () => {
    if (!paper || !recordId || submitting) return;

    setSubmitting(true);
    setShowSubmitConfirm(false);

    try {
      const answers = Object.entries(answerStates).map(([questionId, state]) => ({
        question_id: parseInt(questionId),
        user_answer: state.userAnswer,
      }));

      await practiceApi.submitPaper(paper.id, {
        answers,
        total_time: elapsedTime,
      });

      toast.success("交卷成功！");
      router.push(`/practice/exam/${paperId}/result?record_id=${recordId}`);
    } catch (error: any) {
      toast.error(error.message || "交卷失败");
    } finally {
      setSubmitting(false);
    }
  };

  // 导航
  const goToPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goToNext = () => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  // 统计
  const answeredCount = Object.values(answerStates).filter((s) => s.userAnswer).length;
  const markedCount = Object.values(answerStates).filter((s) => s.isMarked).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-600">正在加载试卷...</p>
        </div>
      </div>
    );
  }

  if (!paper || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Target className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-700 mb-2">试卷加载失败</h3>
          <Link
            href="/practice/papers"
            className="text-blue-500 hover:text-blue-600"
          >
            返回试卷中心
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* 顶部信息栏 */}
      <div className="sticky top-0 bg-white border-b border-stone-200 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-bold text-stone-800 truncate max-w-[200px] md:max-w-none">
                {paper.title}
              </h1>
              <span className="hidden sm:block text-sm text-stone-500">
                {paper.total_questions}题 · {paper.total_score}分
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* 倒计时 */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm ${
                  isTimeWarning
                    ? "bg-red-100 text-red-600"
                    : "bg-stone-100 text-stone-700"
                }`}
              >
                <Clock className={`w-4 h-4 ${isTimeWarning ? "animate-pulse" : ""}`} />
                <span>{formatTime(remainingTime)}</span>
              </div>

              {/* 答题卡按钮 */}
              <button
                onClick={() => setShowAnswerCard(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">答题卡</span>
              </button>

              {/* 交卷按钮 */}
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={submitting}
                className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                交卷
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 进度条 */}
        <div className="bg-white rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-600">
              第 <span className="font-bold text-blue-600">{currentIndex + 1}</span> / {questions.length} 题
            </span>
            <span className="text-sm text-stone-500">
              已答 {answeredCount} 题
              {markedCount > 0 && <span className="text-amber-600 ml-2">标记 {markedCount} 题</span>}
            </span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="bg-white rounded-2xl shadow-card border border-stone-200/50 overflow-hidden">
          {/* 题目头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium">
                {getQuestionTypeName(currentQuestion.question_type)}
              </span>
              <span className={`px-2 py-1 text-xs rounded-lg font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {getDifficultyLabel(currentQuestion.difficulty)}
              </span>
            </div>
            <button
              onClick={toggleMark}
              className={`p-2 rounded-lg transition-colors ${
                currentAnswer?.isMarked
                  ? "text-amber-500 bg-amber-50"
                  : "text-stone-400 hover:bg-stone-100"
              }`}
              title="标记题目"
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>

          {/* 题目内容 */}
          <div className="p-6">
            <div className="text-lg text-stone-800 leading-relaxed mb-6 whitespace-pre-wrap">
              {currentQuestion.content}
            </div>

            {/* 选项列表 */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <OptionItem
                  key={option.key}
                  option={option}
                  isSelected={currentAnswer?.userAnswer?.includes(option.key) || false}
                  isMultiple={isMultipleChoice}
                  onClick={() => handleSelectOption(option.key)}
                />
              ))}
            </div>

            {isMultipleChoice && (
              <div className="mt-4 text-sm text-stone-500">
                提示：本题为多选题，请选择所有正确答案
              </div>
            )}
          </div>
        </div>

        {/* 底部导航 */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-stone-600 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            上一题
          </button>

          <button
            onClick={() => setShowAnswerCard(true)}
            className="px-6 py-2.5 text-stone-600 hover:bg-white rounded-xl transition-colors"
          >
            快速跳转
          </button>

          <button
            onClick={goToNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-stone-600 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            下一题
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 答题卡弹窗 */}
      {showAnswerCard && (
        <AnswerCardModal
          questions={questions}
          currentIndex={currentIndex}
          answerStates={answerStates}
          onJumpTo={setCurrentIndex}
          onClose={() => setShowAnswerCard(false)}
        />
      )}

      {/* 确认交卷弹窗 */}
      {showSubmitConfirm && (
        <SubmitConfirmModal
          totalQuestions={questions.length}
          answeredCount={answeredCount}
          markedCount={markedCount}
          elapsedTime={elapsedTime}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmitConfirm(false)}
        />
      )}
    </div>
  );
}
