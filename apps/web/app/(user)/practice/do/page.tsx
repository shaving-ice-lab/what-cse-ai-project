"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  BookmarkPlus,
  Flag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
  Target,
  Lightbulb,
  CheckSquare,
  Square,
  List,
  X,
  Link2,
  Sparkles,
  FileEdit,
  Send,
  BookOpen,
} from "lucide-react";
import {
  practiceApi,
  Question,
  QuestionOption,
  SubmitAnswerResponse,
  getQuestionTypeName,
  getDifficultyLabel,
  getDifficultyColor,
  getSourceTypeName,
  formatTime,
} from "@/services/api/practice";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

// 答题状态
interface AnswerState {
  userAnswer: string;
  isSubmitted: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
  analysis?: string;
  tips?: string;
  timeSpent: number;
}

// 答题卡组件
function AnswerCard({
  questions,
  currentIndex,
  answerStates,
  markedQuestions,
  onJumpTo,
  onClose,
}: {
  questions: Question[];
  currentIndex: number;
  answerStates: Record<number, AnswerState>;
  markedQuestions: Set<number>;
  onJumpTo: (index: number) => void;
  onClose: () => void;
}) {
  const getStatusClass = (index: number) => {
    const questionId = questions[index]?.id;
    const state = answerStates[questionId];
    const isMarked = markedQuestions.has(questionId);
    
    if (index === currentIndex) {
      return "bg-amber-500 text-white ring-2 ring-amber-300";
    }
    if (state?.isSubmitted) {
      if (state.isCorrect) {
        return "bg-emerald-500 text-white";
      }
      return "bg-red-500 text-white";
    }
    if (state?.userAnswer) {
      return "bg-blue-100 text-blue-700 border-blue-300";
    }
    if (isMarked) {
      return "bg-amber-100 text-amber-700 border-amber-300";
    }
    return "bg-white text-stone-600 border-stone-200 hover:border-stone-300";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-stone-800">答题卡</h3>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-6 gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => {
                  onJumpTo(index);
                  onClose();
                }}
                className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${getStatusClass(index)}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span>答对</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>答错</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
              <span>已答</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300" />
              <span>标记</span>
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
  isSubmitted,
  isCorrect,
  correctAnswer,
  onClick,
}: {
  option: QuestionOption;
  isSelected: boolean;
  isMultiple: boolean;
  isSubmitted: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
  onClick: () => void;
}) {
  const isCorrectOption = correctAnswer?.includes(option.key);
  
  let statusClass = "";
  if (isSubmitted) {
    if (isCorrectOption) {
      statusClass = "border-emerald-500 bg-emerald-50";
    } else if (isSelected && !isCorrectOption) {
      statusClass = "border-red-500 bg-red-50";
    }
  } else if (isSelected) {
    statusClass = "border-amber-500 bg-amber-50";
  }

  return (
    <button
      onClick={onClick}
      disabled={isSubmitted}
      className={`w-full flex items-start gap-3 p-4 border-2 rounded-xl text-left transition-all ${
        isSubmitted ? "cursor-default" : "hover:border-amber-300 hover:bg-amber-50/50"
      } ${statusClass || "border-stone-200 bg-white"}`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
          isSubmitted && isCorrectOption
            ? "bg-emerald-500 text-white"
            : isSubmitted && isSelected && !isCorrectOption
            ? "bg-red-500 text-white"
            : isSelected
            ? "bg-amber-500 text-white"
            : "bg-stone-100 text-stone-600"
        }`}
      >
        {isMultiple ? (
          isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />
        ) : (
          option.key
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-stone-800">{option.content}</div>
        {isSubmitted && isCorrectOption && (
          <div className="flex items-center gap-1 mt-1 text-emerald-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            正确答案
          </div>
        )}
      </div>
    </button>
  );
}

function PracticeDoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  // 获取URL参数
  const mode = searchParams.get("mode") || "random";
  const categoryId = searchParams.get("category_id");
  const questionType = searchParams.get("type");
  const difficulty = searchParams.get("difficulty");
  const count = parseInt(searchParams.get("count") || "10");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answerStates, setAnswerStates] = useState<Record<number, AnswerState>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());
  const [showAnswerCard, setShowAnswerCard] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // 笔记和相似题
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [editingNote, setEditingNote] = useState<string>("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState<Question[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // 加载题目
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const params: any = { count };
        if (categoryId) params.category_id = parseInt(categoryId);
        if (questionType) params.question_type = questionType;
        if (difficulty) params.difficulty = parseInt(difficulty);

        const res = await practiceApi.getPracticeQuestions(params);
        setQuestions(res.questions || []);
        setStartTime(Date.now());
      } catch (error: any) {
        toast.error(error.message || "加载题目失败");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId, questionType, difficulty, count]);

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // 加载相似题目（当答案提交后）
  useEffect(() => {
    const loadSimilarQuestions = async () => {
      if (!currentQuestion || !currentAnswer?.isSubmitted) {
        setSimilarQuestions([]);
        return;
      }

      setLoadingSimilar(true);
      try {
        // Get similar questions based on same category
        const res = await practiceApi.getPracticeQuestions({
          category_id: currentQuestion.category_id,
          count: 5,
        });
        // Filter out current question and limit to 3
        const similar = (res.questions || [])
          .filter((q: Question) => q.id !== currentQuestion.id)
          .slice(0, 3);
        setSimilarQuestions(similar);
      } catch (error) {
        console.error("Failed to load similar questions:", error);
        setSimilarQuestions([]);
      } finally {
        setLoadingSimilar(false);
      }
    };

    loadSimilarQuestions();
  }, [currentQuestion?.id, currentAnswer?.isSubmitted]);

  // 加载笔记（当切换题目时）
  useEffect(() => {
    if (!currentQuestion) return;
    // Reset editing state when switching questions
    setIsEditingNote(false);
    setEditingNote(notes[currentQuestion.id] || "");
  }, [currentQuestion?.id]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answerStates[currentQuestion.id] : null;
  const isMultipleChoice = currentQuestion?.question_type === "multi_choice";

  // 选择答案
  const handleSelectOption = (key: string) => {
    if (!currentQuestion || currentAnswer?.isSubmitted) return;

    const currentState = answerStates[currentQuestion.id] || { userAnswer: "", isSubmitted: false, timeSpent: 0 };
    
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

  // 提交答案
  const handleSubmit = async () => {
    if (!currentQuestion || !currentAnswer?.userAnswer || currentAnswer?.isSubmitted) return;

    const questionStartTime = answerStates[currentQuestion.id]?.timeSpent || 0;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000) - questionStartTime;

    try {
      const res = await practiceApi.submitAnswer({
        question_id: currentQuestion.id,
        user_answer: currentAnswer.userAnswer,
        time_spent: timeSpent,
        practice_type: mode,
      });

      setAnswerStates({
        ...answerStates,
        [currentQuestion.id]: {
          ...currentAnswer,
          isSubmitted: true,
          isCorrect: res.is_correct,
          correctAnswer: res.correct_answer,
          analysis: res.analysis,
          tips: res.tips,
          timeSpent,
        },
      });

      toast[res.is_correct ? "success" : "error"](res.is_correct ? "回答正确！" : "回答错误");
      
      // 加载相似题推荐
      fetchSimilarQuestions(currentQuestion.id);
    } catch (error: any) {
      toast.error(error.message || "提交失败");
    }
  };
  
  // 获取相似题推荐
  const fetchSimilarQuestions = async (questionId: number) => {
    setLoadingSimilar(true);
    setSimilarQuestions([]);
    try {
      const res = await practiceApi.getSimilarQuestions(questionId, 3);
      setSimilarQuestions(res.questions || []);
    } catch (error) {
      // 静默失败，不影响用户体验
      console.error("Failed to fetch similar questions:", error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // 标记题目
  const toggleMark = () => {
    if (!currentQuestion) return;
    const newMarked = new Set(markedQuestions);
    if (newMarked.has(currentQuestion.id)) {
      newMarked.delete(currentQuestion.id);
    } else {
      newMarked.add(currentQuestion.id);
    }
    setMarkedQuestions(newMarked);
  };

  // 收藏题目
  const handleCollect = async () => {
    if (!currentQuestion || !isAuthenticated) {
      toast.error("请先登录");
      return;
    }
    try {
      await practiceApi.collectQuestion(currentQuestion.id);
      toast.success("已收藏");
    } catch (error: any) {
      toast.error(error.message || "收藏失败");
    }
  };

  // 导航
  const goToPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goToNext = () => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  // 统计
  const answeredCount = Object.values(answerStates).filter((s) => s.isSubmitted).length;
  const correctCount = Object.values(answerStates).filter((s) => s.isSubmitted && s.isCorrect).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-stone-500">加载题目中...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-700 mb-2">暂无题目</h3>
          <p className="text-stone-500 mb-4">请调整筛选条件或稍后重试</p>
          <Link
            href="/practice"
            className="px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
          >
            返回题库
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-white border-b border-stone-200 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/practice"
              className="flex items-center gap-2 text-stone-600 hover:text-stone-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">返回题库</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-stone-400" />
                <span className="font-mono text-stone-600">{formatTime(elapsedTime)}</span>
              </div>
              <div className="text-sm text-stone-600">
                <span className="font-bold text-amber-600">{currentIndex + 1}</span>
                <span className="text-stone-400"> / {questions.length}</span>
              </div>
              <button
                onClick={() => setShowAnswerCard(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
              >
                <List className="w-4 h-4" />
                答题卡
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 题目内容 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
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
              {currentQuestion.source_type && (
                <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-lg">
                  {getSourceTypeName(currentQuestion.source_type)}
                  {currentQuestion.source_year && ` ${currentQuestion.source_year}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMark}
                className={`p-2 rounded-lg transition-colors ${
                  markedQuestions.has(currentQuestion.id)
                    ? "text-amber-500 bg-amber-50"
                    : "text-stone-400 hover:bg-stone-100"
                }`}
                title="标记题目"
              >
                <Flag className="w-5 h-5" />
              </button>
              <button
                onClick={handleCollect}
                className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg"
                title="收藏题目"
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
            </div>
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
                  isSubmitted={currentAnswer?.isSubmitted || false}
                  isCorrect={currentAnswer?.isCorrect}
                  correctAnswer={currentAnswer?.correctAnswer}
                  onClick={() => handleSelectOption(option.key)}
                />
              ))}
            </div>

            {/* 提交按钮 */}
            {!currentAnswer?.isSubmitted && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={!currentAnswer?.userAnswer}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-amber-md"
                >
                  确认提交
                </button>
              </div>
            )}

            {/* 答案解析 */}
            {currentAnswer?.isSubmitted && (
              <div className="mt-6 pt-6 border-t border-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-stone-800 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    答案解析
                  </h4>
                  <button
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1"
                  >
                    {showAnalysis ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAnalysis ? "隐藏" : "显示"}
                  </button>
                </div>

                {showAnalysis && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-stone-500">正确答案：</span>
                      <span className="font-bold text-emerald-600">{currentAnswer.correctAnswer}</span>
                      <span className="text-stone-500">你的答案：</span>
                      <span className={`font-bold ${currentAnswer.isCorrect ? "text-emerald-600" : "text-red-500"}`}>
                        {currentAnswer.userAnswer}
                      </span>
                    </div>

                    {currentAnswer.analysis && (
                      <div className="bg-stone-50 rounded-xl p-4">
                        <div className="text-sm text-stone-700 whitespace-pre-wrap">
                          {currentAnswer.analysis}
                        </div>
                      </div>
                    )}

                    {currentAnswer.tips && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <div className="text-sm font-medium text-amber-700 mb-1">解题技巧</div>
                        <div className="text-sm text-amber-600">{currentAnswer.tips}</div>
                      </div>
                    )}

                    {/* 知识点链接 */}
                    {currentQuestion.knowledge_points && currentQuestion.knowledge_points.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                          <Link2 className="w-4 h-4" />
                          相关知识点
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentQuestion.knowledge_points.map((kpId: number) => (
                            <Link
                              key={kpId}
                              href={`/learn/knowledge/${kpId}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-blue-600 text-sm rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              知识点 #{kpId}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 相似题推荐 */}
                    <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-violet-700 flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          相似题推荐
                        </div>
                        {loadingSimilar && <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />}
                      </div>
                      {similarQuestions.length > 0 ? (
                        <div className="space-y-2">
                          {similarQuestions.slice(0, 3).map((sq, idx) => (
                            <Link
                              key={sq.id}
                              href={`/practice/do?question_id=${sq.id}`}
                              className="block p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-400 transition-colors"
                            >
                              <div className="text-sm text-stone-700 line-clamp-2">{sq.content}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(sq.difficulty)}`}>
                                  {getDifficultyLabel(sq.difficulty)}
                                </span>
                                <span className="text-xs text-stone-400">
                                  正确率: {sq.correct_rate?.toFixed(0) || 0}%
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-violet-500">
                          {loadingSimilar ? "加载中..." : "暂无相似题目推荐"}
                        </div>
                      )}
                    </div>

                    {/* 添加笔记 */}
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <div className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1">
                        <FileEdit className="w-4 h-4" />
                        我的笔记
                      </div>
                      
                      {isEditingNote ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingNote}
                            onChange={(e) => setEditingNote(e.target.value)}
                            placeholder="记录你的解题心得和易错点..."
                            className="w-full p-3 bg-white border border-emerald-200 rounded-lg text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-emerald-400 resize-none"
                            rows={3}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setIsEditingNote(false);
                                setEditingNote(notes[currentQuestion.id] || "");
                              }}
                              className="px-3 py-1.5 text-sm text-stone-600 hover:bg-white rounded-lg transition-colors"
                            >
                              取消
                            </button>
                            <button
                              onClick={async () => {
                                if (!currentQuestion || !isAuthenticated) return;
                                try {
                                  await practiceApi.updateCollectNote(currentQuestion.id, editingNote);
                                  setNotes({ ...notes, [currentQuestion.id]: editingNote });
                                  setIsEditingNote(false);
                                  toast.success("笔记已保存");
                                } catch (error: any) {
                                  // If not collected, collect first then add note
                                  try {
                                    await practiceApi.collectQuestion(currentQuestion.id, editingNote);
                                    setNotes({ ...notes, [currentQuestion.id]: editingNote });
                                    setIsEditingNote(false);
                                    toast.success("已收藏并保存笔记");
                                  } catch (e: any) {
                                    toast.error(e.message || "保存失败");
                                  }
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              保存
                            </button>
                          </div>
                        </div>
                      ) : notes[currentQuestion.id] ? (
                        <div 
                          onClick={() => {
                            setEditingNote(notes[currentQuestion.id]);
                            setIsEditingNote(true);
                          }}
                          className="p-3 bg-white rounded-lg border border-emerald-200 text-sm text-stone-700 cursor-pointer hover:border-emerald-400 transition-colors"
                        >
                          {notes[currentQuestion.id]}
                          <div className="text-xs text-emerald-500 mt-1">点击编辑</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast.error("请先登录");
                              return;
                            }
                            setEditingNote("");
                            setIsEditingNote(true);
                          }}
                          className="w-full p-3 bg-white rounded-lg border border-dashed border-emerald-300 text-sm text-emerald-600 hover:bg-emerald-100/50 transition-colors"
                        >
                          + 添加笔记
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 底部导航 */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:bg-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            上一题
          </button>

          <div className="flex items-center gap-4 text-sm text-stone-500">
            <span>
              已答：{answeredCount}/{questions.length}
            </span>
            <span>
              正确：{correctCount}/{answeredCount || 1}
            </span>
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:bg-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一题
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 答题卡弹窗 */}
      {showAnswerCard && (
        <AnswerCard
          questions={questions}
          currentIndex={currentIndex}
          answerStates={answerStates}
          markedQuestions={markedQuestions}
          onJumpTo={setCurrentIndex}
          onClose={() => setShowAnswerCard(false)}
        />
      )}
    </div>
  );
}

export default function PracticeDoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    }>
      <PracticeDoContent />
    </Suspense>
  );
}
