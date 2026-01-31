"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  Clock,
  Lightbulb,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClassroom } from "./ClassroomContext";

// =====================================================
// 类型定义
// =====================================================

interface QuizQuestion {
  id?: string | number;
  problem: string;
  options: string[];
  answer: string;
  analysis?: string;
  knowledge_point?: string;
  difficulty?: string;
  time_suggestion?: string;
}

interface QuizState {
  currentIndex: number;
  selectedAnswers: Record<number, string>;
  showResult: Record<number, boolean>;
  score: number;
  completed: boolean;
  startTime: number;
}

// =====================================================
// 主测验组件
// =====================================================

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  title?: string;
  showTimer?: boolean;
  onComplete?: (score: number, totalTime: number) => void;
}

export function InteractiveQuiz({
  questions,
  title = "随堂练习",
  showTimer = true,
  onComplete,
}: InteractiveQuizProps) {
  const { updateQuizScore, currentSection } = useClassroom();

  const [state, setState] = useState<QuizState>({
    currentIndex: 0,
    selectedAnswers: {},
    showResult: {},
    score: 0,
    completed: false,
    startTime: Date.now(),
  });

  const [elapsedTime, setElapsedTime] = useState(0);

  // 计时器
  React.useEffect(() => {
    if (state.completed) return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - state.startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [state.startTime, state.completed]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[state.currentIndex];

  // 选择答案
  const handleSelectAnswer = useCallback((option: string) => {
    if (state.showResult[state.currentIndex]) return;

    setState(prev => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [prev.currentIndex]: option,
      },
    }));
  }, [state.currentIndex, state.showResult]);

  // 提交当前答案
  const handleSubmit = useCallback(() => {
    const selectedAnswer = state.selectedAnswers[state.currentIndex];
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;

    setState(prev => ({
      ...prev,
      showResult: {
        ...prev.showResult,
        [prev.currentIndex]: true,
      },
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  }, [state.currentIndex, state.selectedAnswers, currentQuestion]);

  // 下一题
  const handleNext = useCallback(() => {
    if (state.currentIndex < questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    } else {
      // 完成测验
      const finalScore = state.score;
      const totalTime = Math.floor((Date.now() - state.startTime) / 1000);

      setState(prev => ({
        ...prev,
        completed: true,
      }));

      // 更新分数
      if (currentSection) {
        updateQuizScore(currentSection.id, (finalScore / questions.length) * 100);
      }

      onComplete?.(finalScore, totalTime);
    }
  }, [state.currentIndex, state.score, state.startTime, questions.length, currentSection, updateQuizScore, onComplete]);

  // 重新开始
  const handleReset = useCallback(() => {
    setState({
      currentIndex: 0,
      selectedAnswers: {},
      showResult: {},
      score: 0,
      completed: false,
      startTime: Date.now(),
    });
    setElapsedTime(0);
  }, []);

  // 是否已显示结果
  const showCurrentResult = state.showResult[state.currentIndex];
  const selectedAnswer = state.selectedAnswers[state.currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.answer;

  // 完成页面
  if (state.completed) {
    return (
      <QuizCompletionScreen
        score={state.score}
        total={questions.length}
        time={elapsedTime}
        onRetry={handleReset}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm text-white/80">
                第 {state.currentIndex + 1} / {questions.length} 题
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 得分 */}
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">{state.score}</span>
            </div>

            {/* 计时器 */}
            {showTimer && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((state.currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目内容 */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* 难度和知识点标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentQuestion.difficulty && (
                <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                  {currentQuestion.difficulty}
                </span>
              )}
              {currentQuestion.knowledge_point && (
                <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs">
                  {currentQuestion.knowledge_point}
                </span>
              )}
              {currentQuestion.time_suggestion && (
                <span className="px-2 py-1 bg-stone-100 text-stone-500 rounded text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  建议用时：{currentQuestion.time_suggestion}
                </span>
              )}
            </div>

            {/* 题目 */}
            <p className="text-lg text-stone-800 leading-relaxed mb-6">
              {currentQuestion.problem}
            </p>

            {/* 选项 */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                const isSelected = selectedAnswer === optionLetter;
                const isCorrectOption = optionLetter === currentQuestion.answer;

                let optionStyle = "bg-stone-50 border-stone-200 hover:bg-stone-100 hover:border-stone-300";

                if (showCurrentResult) {
                  if (isCorrectOption) {
                    optionStyle = "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200";
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = "bg-red-50 border-red-300 ring-2 ring-red-200";
                  }
                } else if (isSelected) {
                  optionStyle = "bg-violet-50 border-violet-300 ring-2 ring-violet-200";
                }

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelectAnswer(optionLetter)}
                    disabled={showCurrentResult}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4",
                      optionStyle,
                      !showCurrentResult && "cursor-pointer"
                    )}
                    whileHover={!showCurrentResult ? { scale: 1.01 } : {}}
                    whileTap={!showCurrentResult ? { scale: 0.99 } : {}}
                  >
                    <span className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      showCurrentResult && isCorrectOption
                        ? "bg-emerald-500 text-white"
                        : showCurrentResult && isSelected && !isCorrectOption
                        ? "bg-red-500 text-white"
                        : isSelected
                        ? "bg-violet-500 text-white"
                        : "bg-stone-200 text-stone-600"
                    )}>
                      {showCurrentResult && isCorrectOption ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : showCurrentResult && isSelected && !isCorrectOption ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        optionLetter
                      )}
                    </span>
                    <span className={cn(
                      "flex-1 text-sm",
                      showCurrentResult && isCorrectOption
                        ? "text-emerald-800 font-medium"
                        : showCurrentResult && isSelected && !isCorrectOption
                        ? "text-red-700"
                        : "text-stone-700"
                    )}>
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* 解析 */}
            <AnimatePresence>
              {showCurrentResult && currentQuestion.analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "mt-6 p-4 rounded-xl",
                    isCorrect
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-amber-50 border border-amber-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isCorrect ? "text-emerald-500" : "text-amber-500"
                    )} />
                    <div>
                      <p className={cn(
                        "font-medium mb-2",
                        isCorrect ? "text-emerald-700" : "text-amber-700"
                      )}>
                        {isCorrect ? "回答正确！" : "答案解析"}
                      </p>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        isCorrect ? "text-emerald-600" : "text-amber-700"
                      )}>
                        {currentQuestion.analysis}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部操作 */}
      <div className="px-6 pb-6 flex items-center justify-between">
        <div className="text-sm text-stone-500">
          {showCurrentResult ? (
            isCorrect ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                回答正确
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                答案是：{currentQuestion.answer}
              </span>
            )
          ) : selectedAnswer ? (
            <span className="text-violet-600">已选择：{selectedAnswer}</span>
          ) : (
            <span>请选择一个选项</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!showCurrentResult ? (
            <motion.button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={cn(
                "px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2",
                selectedAnswer
                  ? "bg-violet-500 text-white shadow-lg hover:bg-violet-600"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              )}
              whileHover={selectedAnswer ? { scale: 1.02 } : {}}
              whileTap={selectedAnswer ? { scale: 0.98 } : {}}
            >
              确认答案
              <CheckCircle className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleNext}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium shadow-lg flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {state.currentIndex < questions.length - 1 ? (
                <>
                  下一题
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  查看结果
                  <Trophy className="w-4 h-4" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// 完成页面
// =====================================================

interface QuizCompletionScreenProps {
  score: number;
  total: number;
  time: number;
  onRetry: () => void;
}

function QuizCompletionScreen({
  score,
  total,
  time,
  onRetry,
}: QuizCompletionScreenProps) {
  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage >= 90) return { text: "太棒了！完美表现！", emoji: "🎉", color: "text-emerald-600" };
    if (percentage >= 70) return { text: "做得不错！继续加油！", emoji: "💪", color: "text-blue-600" };
    if (percentage >= 50) return { text: "还需努力，再接再厉！", emoji: "📚", color: "text-amber-600" };
    return { text: "别灰心，多多练习！", emoji: "🌟", color: "text-red-600" };
  };

  const message = getMessage();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}分${secs}秒`;
    }
    return `${secs}秒`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 p-8 text-center text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Trophy className="w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">练习完成！</h2>
        <p className="text-white/80">{message.emoji} {message.text}</p>
      </div>

      <div className="p-8">
        {/* 分数展示 */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <svg className="w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={440}
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * percentage) / 100 }}
                transition={{ duration: 1, delay: 0.5 }}
                transform="rotate(-90 80 80)"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-4xl font-bold text-stone-800"
              >
                {percentage}%
              </motion.span>
              <span className="text-sm text-stone-500">正确率</span>
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{score}</p>
            <p className="text-xs text-emerald-700">答对题数</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mx-auto mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{total - score}</p>
            <p className="text-xs text-red-700">答错题数</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatTime(time)}</p>
            <p className="text-xs text-blue-700">用时</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <motion.button
            onClick={onRetry}
            className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-5 h-5" />
            重新练习
          </motion.button>
          <motion.button
            className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            继续学习
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// 快速检测卡片（单题模式）
// =====================================================

interface QuickCheckProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  onAnswer?: (isCorrect: boolean) => void;
}

export function QuickCheck({
  question,
  options,
  correctAnswer,
  explanation,
  onAnswer,
}: QuickCheckProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (option: string) => {
    if (revealed) return;
    setSelected(option);
  };

  const handleReveal = () => {
    if (!selected) return;
    setRevealed(true);
    onAnswer?.(selected === correctAnswer);
  };

  const isCorrect = selected === correctAnswer;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-indigo-500" />
        <span className="font-medium text-indigo-700">快速检测</span>
      </div>

      <p className="text-stone-800 mb-4">{question}</p>

      <div className="space-y-2 mb-4">
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isThis = selected === letter;
          const isCorrectOption = letter === correctAnswer;

          let style = "bg-white border-stone-200 hover:border-indigo-300";
          if (revealed) {
            if (isCorrectOption) {
              style = "bg-emerald-100 border-emerald-300";
            } else if (isThis) {
              style = "bg-red-100 border-red-300";
            }
          } else if (isThis) {
            style = "bg-indigo-100 border-indigo-300";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(letter)}
              disabled={revealed}
              className={cn(
                "w-full p-3 rounded-lg border text-left text-sm flex items-center gap-3 transition-all",
                style
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                revealed && isCorrectOption
                  ? "bg-emerald-500 text-white"
                  : revealed && isThis
                  ? "bg-red-500 text-white"
                  : isThis
                  ? "bg-indigo-500 text-white"
                  : "bg-stone-200"
              )}>
                {letter}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <button
          onClick={handleReveal}
          disabled={!selected}
          className={cn(
            "w-full py-2.5 rounded-lg font-medium transition-all",
            selected
              ? "bg-indigo-500 text-white"
              : "bg-stone-200 text-stone-400 cursor-not-allowed"
          )}
        >
          确认答案
        </button>
      ) : (
        <div className={cn(
          "p-3 rounded-lg text-sm",
          isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        )}>
          <p className="font-medium mb-1">
            {isCorrect ? "✓ 回答正确！" : `✗ 正确答案是 ${correctAnswer}`}
          </p>
          {explanation && <p>{explanation}</p>}
        </div>
      )}
    </div>
  );
}

export default InteractiveQuiz;
