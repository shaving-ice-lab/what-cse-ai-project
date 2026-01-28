"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Target,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Brain,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Award,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { useChapterAIContent } from "@/hooks/useAIContent";
import { AIContent, ExampleQuestion } from "@/services/api/ai-content";

interface ChapterPracticeProps {
  chapterId: number;
  chapterName?: string;
  onComplete?: (score: number, total: number) => void;
  onBack?: () => void;
  className?: string;
}

// 练习题类型
interface PracticeQuestion {
  id: number;
  content: string;
  options: string[];
  correctAnswer: string;
  analysis: string;
  knowledge?: string;
  difficulty?: number;
}

// 题目状态
type QuestionStatus = "unanswered" | "correct" | "wrong";

// 单个题目组件
function QuestionCard({
  question,
  index,
  selectedAnswer,
  showResult,
  onSelect,
}: {
  question: PracticeQuestion;
  index: number;
  selectedAnswer: string | null;
  showResult: boolean;
  onSelect: (answer: string) => void;
}) {
  const isCorrect = selectedAnswer === question.correctAnswer;
  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 overflow-hidden">
      {/* 题目头部 */}
      <div className="px-6 py-4 bg-stone-50 border-b border-stone-200/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-stone-600">
            第 {index + 1} 题
            {question.difficulty && (
              <span className="ml-2 text-xs text-stone-400">
                难度: {"⭐".repeat(question.difficulty)}
              </span>
            )}
          </span>
          {showResult && (
            <span
              className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium",
                isCorrect
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {isCorrect ? "回答正确" : "回答错误"}
            </span>
          )}
        </div>
      </div>

      {/* 题目内容 */}
      <div className="p-6">
        <p className="text-stone-800 mb-6 leading-relaxed">{question.content}</p>

        {/* 选项 */}
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const label = optionLabels[idx];
            const isSelected = selectedAnswer === label;
            const isCorrectOption = label === question.correctAnswer;

            let optionStyle = "border-stone-200 hover:border-amber-300 hover:bg-amber-50";
            if (showResult) {
              if (isCorrectOption) {
                optionStyle = "border-green-500 bg-green-50";
              } else if (isSelected && !isCorrectOption) {
                optionStyle = "border-red-500 bg-red-50";
              }
            } else if (isSelected) {
              optionStyle = "border-amber-500 bg-amber-50";
            }

            return (
              <button
                key={label}
                onClick={() => !showResult && onSelect(label)}
                disabled={showResult}
                className={cn(
                  "w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                  optionStyle,
                  showResult && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                    showResult && isCorrectOption
                      ? "bg-green-500 text-white"
                      : showResult && isSelected && !isCorrectOption
                      ? "bg-red-500 text-white"
                      : isSelected
                      ? "bg-amber-500 text-white"
                      : "bg-stone-200 text-stone-600"
                  )}
                >
                  {label}
                </span>
                <span className="text-stone-700 pt-0.5">{option}</span>
                {showResult && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-500 ml-auto flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* 解析 */}
        {showResult && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">题目解析</span>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{question.analysis}</p>
            {question.knowledge && (
              <div className="mt-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-blue-600">
                  相关知识点: {question.knowledge}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 练习结果组件
function PracticeResult({
  score,
  total,
  wrongQuestions,
  onRetry,
  onReviewWrong,
  onContinue,
}: {
  score: number;
  total: number;
  wrongQuestions: number[];
  onRetry: () => void;
  onReviewWrong: () => void;
  onContinue: () => void;
}) {
  const percentage = Math.round((score / total) * 100);
  const isExcellent = percentage >= 80;
  const isGood = percentage >= 60;

  return (
    <div className="space-y-6">
      {/* 成绩展示 */}
      <div
        className={cn(
          "rounded-2xl p-8 text-white text-center",
          isExcellent
            ? "bg-gradient-to-br from-green-500 to-emerald-600"
            : isGood
            ? "bg-gradient-to-br from-amber-500 to-orange-500"
            : "bg-gradient-to-br from-red-500 to-rose-600"
        )}
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
          {isExcellent ? (
            <Award className="w-10 h-10" />
          ) : isGood ? (
            <TrendingUp className="w-10 h-10" />
          ) : (
            <AlertTriangle className="w-10 h-10" />
          )}
        </div>
        <div className="text-5xl font-bold mb-2">{percentage}%</div>
        <p className="text-xl font-semibold mb-1">
          {isExcellent ? "优秀！" : isGood ? "良好" : "需要加强"}
        </p>
        <p className="text-white/80">
          共 {total} 题，答对 {score} 题，答错 {total - score} 题
        </p>
      </div>

      {/* 知识点覆盖 */}
      <div className="bg-white rounded-xl border border-stone-200/50 p-5">
        <h4 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-500" />
          本次练习知识点覆盖
        </h4>
        <div className="flex flex-wrap gap-2">
          {["概念理解", "公式运用", "计算技巧", "逻辑推理"].map((point, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 bg-stone-100 text-stone-600 text-sm rounded-lg"
            >
              {point}
            </span>
          ))}
        </div>
      </div>

      {/* 薄弱点提示 */}
      {wrongQuestions.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
          <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            薄弱点提示
          </h4>
          <p className="text-sm text-amber-700 mb-3">
            您在以下题目中存在问题，建议重点复习相关知识点：
          </p>
          <div className="flex flex-wrap gap-2">
            {wrongQuestions.map((num) => (
              <span
                key={num}
                className="px-2.5 py-1 bg-amber-100 text-amber-700 text-sm rounded-lg"
              >
                第 {num} 题
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 推荐操作 */}
      <div className="bg-white rounded-xl border border-stone-200/50 p-5">
        <h4 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          AI 学习建议
        </h4>
        <div className="space-y-3">
          {wrongQuestions.length > 0 ? (
            <>
              <p className="text-sm text-stone-600">
                建议您先复习错题，再进行针对性练习。
              </p>
              <button
                onClick={onReviewWrong}
                className="w-full py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                复习错题
              </button>
            </>
          ) : (
            <p className="text-sm text-stone-600">
              太棒了！您已全部答对，可以继续下一章节的学习。
            </p>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="flex-1 py-3 border-2 border-stone-300 text-stone-600 font-medium rounded-lg hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          再做一次
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
        >
          继续学习
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function ChapterPractice({
  chapterId,
  chapterName,
  onComplete,
  onBack,
  className,
}: ChapterPracticeProps) {
  const { loading, exercises, error } = useChapterAIContent(chapterId);

  // 模拟练习题数据
  const [questions] = useState<PracticeQuestion[]>([
    {
      id: 1,
      content: "关于本章知识点，下列说法正确的是：",
      options: [
        "选项A的内容描述",
        "选项B的内容描述",
        "选项C的内容描述",
        "选项D的内容描述",
      ],
      correctAnswer: "B",
      analysis:
        "本题考查对核心概念的理解。选项B正确地描述了相关概念，其他选项存在理解偏差。",
      knowledge: "核心概念理解",
      difficulty: 2,
    },
    {
      id: 2,
      content: "在实际应用中，以下哪种方法最为有效？",
      options: [
        "方法一：直接计算",
        "方法二：公式代入",
        "方法三：逆向推导",
        "方法四：排除法",
      ],
      correctAnswer: "C",
      analysis:
        "逆向推导是解决此类问题的最佳方法，可以有效避免计算错误并节省时间。",
      knowledge: "解题方法",
      difficulty: 3,
    },
    {
      id: 3,
      content: "根据本章内容，完成下列计算题：...",
      options: ["15", "20", "25", "30"],
      correctAnswer: "A",
      analysis: "按照公式 X = Y + Z 计算，代入数值可得结果为 15。",
      knowledge: "计算技巧",
      difficulty: 2,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // 选择答案
  const handleSelect = useCallback((answer: string) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(currentQuestion.id, answer);
      return next;
    });
  }, [currentQuestion?.id]);

  // 提交当前题目
  const handleSubmit = useCallback(() => {
    setShowResult(true);
  }, []);

  // 下一题
  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowResult(false);
    } else {
      // 计算得分
      let score = 0;
      const wrongIndices: number[] = [];
      questions.forEach((q, idx) => {
        if (answers.get(q.id) === q.correctAnswer) {
          score++;
        } else {
          wrongIndices.push(idx + 1);
        }
      });
      setPracticeComplete(true);
      onComplete?.(score, questions.length);
    }
  }, [currentIndex, questions, answers, onComplete]);

  // 上一题
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowResult(true); // 返回时显示之前的答案
    }
  }, [currentIndex]);

  // 重新练习
  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setAnswers(new Map());
    setShowResult(false);
    setPracticeComplete(false);
  }, []);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-20", className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-stone-500">正在加载练习题...</p>
        </div>
      </div>
    );
  }

  // 计算得分
  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers.get(q.id) === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const getWrongQuestions = () => {
    const wrong: number[] = [];
    questions.forEach((q, idx) => {
      if (answers.get(q.id) !== q.correctAnswer) {
        wrong.push(idx + 1);
      }
    });
    return wrong;
  };

  // 练习完成
  if (practiceComplete) {
    return (
      <div className={cn("max-w-2xl mx-auto", className)}>
        <PracticeResult
          score={calculateScore()}
          total={questions.length}
          wrongQuestions={getWrongQuestions()}
          onRetry={handleRetry}
          onReviewWrong={() => {
            // 跳转到第一道错题
            const wrongIdx = questions.findIndex(
              (q) => answers.get(q.id) !== q.correctAnswer
            );
            if (wrongIdx !== -1) {
              setCurrentIndex(wrongIdx);
              setShowResult(true);
              setPracticeComplete(false);
            }
          }}
          onContinue={onBack || (() => {})}
        />
      </div>
    );
  }

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            章节配套练习
          </h3>
          <p className="text-sm text-stone-500">{chapterName || "本章练习"}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          返回学习
        </button>
      </div>

      {/* 进度条 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-stone-500 min-w-[60px] text-right">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* 题目卡片 */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          index={currentIndex}
          selectedAnswer={answers.get(currentQuestion.id) || null}
          showResult={showResult}
          onSelect={handleSelect}
        />
      )}

      {/* 导航按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
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

        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={!answers.has(currentQuestion?.id)}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-colors",
              answers.has(currentQuestion?.id)
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            )}
          >
            确认答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
          >
            {currentIndex === questions.length - 1 ? "查看结果" : "下一题"}
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ChapterPractice;
