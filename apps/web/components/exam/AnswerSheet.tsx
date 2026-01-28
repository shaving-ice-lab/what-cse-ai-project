"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, AlertCircle, Circle, X } from "lucide-react";
import { cn } from "@what-cse/ui/lib/utils";

// Single answer option for one question
interface AnswerOption {
  key: string; // A, B, C, D, etc.
  isSelected: boolean;
}

// Question status
type QuestionStatus = "unanswered" | "answered" | "flagged";

// Single question in the answer sheet
interface AnswerSheetQuestion {
  id: number;
  questionNumber: number;
  options: AnswerOption[];
  status: QuestionStatus;
  isMultiChoice?: boolean; // true for multi-choice questions
}

interface AnswerSheetProps {
  questions: AnswerSheetQuestion[];
  currentQuestionIndex: number;
  onSelectAnswer: (questionIndex: number, optionKey: string) => void;
  onNavigate: (questionIndex: number) => void;
  onToggleFlag: (questionIndex: number) => void;
  showCorrectAnswers?: boolean;
  correctAnswers?: Record<number, string[]>; // questionId -> correct option keys
  className?: string;
}

// Individual bubble for marking
function AnswerBubble({
  optionKey,
  isSelected,
  isCorrect,
  isWrong,
  showResult,
  isMulti,
  onClick,
  disabled,
}: {
  optionKey: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  showResult?: boolean;
  isMulti?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium text-sm transition-all",
        isMulti && "rounded-lg",
        // Default state
        !isSelected && !showResult && "border-stone-300 text-stone-400 hover:border-amber-400 hover:text-amber-500",
        // Selected state
        isSelected && !showResult && "border-amber-500 bg-amber-500 text-white shadow-md",
        // Correct answer shown
        showResult && isCorrect && "border-green-500 bg-green-500 text-white",
        // Wrong answer shown
        showResult && isWrong && "border-red-500 bg-red-500 text-white",
        // Selected but not correct/wrong during result
        showResult && isSelected && !isCorrect && !isWrong && "border-amber-500 bg-amber-100 text-amber-700",
        // Correct answer indicator (not selected but is correct)
        showResult && !isSelected && isCorrect && "border-green-500 text-green-500",
        disabled && "cursor-not-allowed opacity-70"
      )}
    >
      {optionKey}
      {/* Correct indicator */}
      {showResult && isCorrect && isSelected && (
        <Check className="absolute -top-1 -right-1 w-4 h-4 text-white bg-green-500 rounded-full p-0.5" />
      )}
      {/* Wrong indicator */}
      {showResult && isWrong && (
        <X className="absolute -top-1 -right-1 w-4 h-4 text-white bg-red-500 rounded-full p-0.5" />
      )}
    </button>
  );
}

// Single row for one question
function AnswerRow({
  question,
  isActive,
  onSelect,
  onClick,
  onToggleFlag,
  showCorrectAnswers,
  correctOptions,
  disabled,
}: {
  question: AnswerSheetQuestion;
  isActive: boolean;
  onSelect: (optionKey: string) => void;
  onClick: () => void;
  onToggleFlag: () => void;
  showCorrectAnswers?: boolean;
  correctOptions?: string[];
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
        isActive && "bg-amber-50 ring-2 ring-amber-300",
        !isActive && question.status === "flagged" && "bg-red-50",
        !isActive && question.status === "answered" && "bg-green-50",
        !isActive && question.status === "unanswered" && "hover:bg-stone-50"
      )}
      onClick={onClick}
    >
      {/* Question number */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
          question.status === "flagged" && "bg-red-100 text-red-700",
          question.status === "answered" && "bg-green-100 text-green-700",
          question.status === "unanswered" && "bg-stone-100 text-stone-500",
          isActive && "bg-amber-500 text-white"
        )}
      >
        {question.questionNumber}
      </div>

      {/* Options */}
      <div className="flex items-center gap-1.5 flex-1">
        {question.options.map((option) => {
          const isCorrectOption = correctOptions?.includes(option.key);
          const isWrongSelection = showCorrectAnswers && option.isSelected && !isCorrectOption;

          return (
            <AnswerBubble
              key={option.key}
              optionKey={option.key}
              isSelected={option.isSelected}
              isCorrect={showCorrectAnswers && isCorrectOption}
              isWrong={isWrongSelection}
              showResult={showCorrectAnswers}
              isMulti={question.isMultiChoice}
              onClick={() => !disabled && onSelect(option.key)}
              disabled={disabled}
            />
          );
        })}
      </div>

      {/* Flag button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFlag();
        }}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          question.status === "flagged"
            ? "text-red-500 bg-red-100 hover:bg-red-200"
            : "text-stone-400 hover:text-amber-500 hover:bg-amber-50"
        )}
        title={question.status === "flagged" ? "取消标记" : "标记此题"}
        disabled={disabled}
      >
        <AlertCircle className="w-4 h-4" />
      </button>
    </div>
  );
}

// Progress summary
function ProgressSummary({
  questions,
  showCorrectAnswers,
  correctAnswers,
}: {
  questions: AnswerSheetQuestion[];
  showCorrectAnswers?: boolean;
  correctAnswers?: Record<number, string[]>;
}) {
  const answered = questions.filter((q) => q.status === "answered" || q.status === "flagged").length;
  const flagged = questions.filter((q) => q.status === "flagged").length;
  const total = questions.length;
  const progress = Math.round((answered / total) * 100);

  // Calculate correct count if showing results
  let correctCount = 0;
  if (showCorrectAnswers && correctAnswers) {
    questions.forEach((q) => {
      const correct = correctAnswers[q.id] || [];
      const selected = q.options.filter((o) => o.isSelected).map((o) => o.key);
      if (
        correct.length === selected.length &&
        correct.every((c) => selected.includes(c))
      ) {
        correctCount++;
      }
    });
  }

  return (
    <div className="p-4 bg-stone-50 rounded-xl mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-stone-600">答题进度</span>
        <span className="text-sm text-stone-500">
          {answered}/{total} 题 ({progress}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-white rounded-lg">
          <div className="font-bold text-green-600">{answered - flagged}</div>
          <div className="text-stone-400">已答</div>
        </div>
        <div className="p-2 bg-white rounded-lg">
          <div className="font-bold text-red-600">{flagged}</div>
          <div className="text-stone-400">标记</div>
        </div>
        <div className="p-2 bg-white rounded-lg">
          <div className="font-bold text-stone-500">{total - answered}</div>
          <div className="text-stone-400">未答</div>
        </div>
      </div>

      {/* Result stats */}
      {showCorrectAnswers && (
        <div className="mt-3 pt-3 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">正确率</span>
            <span className="text-lg font-bold text-green-600">
              {Math.round((correctCount / total) * 100)}%
            </span>
          </div>
          <div className="text-xs text-stone-400 mt-1">
            正确 {correctCount} 题 / 共 {total} 题
          </div>
        </div>
      )}
    </div>
  );
}

// Main AnswerSheet component
export function AnswerSheet({
  questions,
  currentQuestionIndex,
  onSelectAnswer,
  onNavigate,
  onToggleFlag,
  showCorrectAnswers = false,
  correctAnswers,
  className,
}: AnswerSheetProps) {
  // Group questions by sections (every 20 questions)
  const groupSize = 20;
  const groups: AnswerSheetQuestion[][] = [];
  for (let i = 0; i < questions.length; i += groupSize) {
    groups.push(questions.slice(i, i + groupSize));
  }

  const [activeGroup, setActiveGroup] = useState(0);

  // Update active group when current question changes
  useEffect(() => {
    const newGroup = Math.floor(currentQuestionIndex / groupSize);
    setActiveGroup(newGroup);
  }, [currentQuestionIndex, groupSize]);

  return (
    <div className={cn("bg-white rounded-2xl shadow-card border border-stone-200/50 overflow-hidden", className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Circle className="w-4 h-4" />
          答题卡
        </h3>
      </div>

      <div className="p-4">
        {/* Progress summary */}
        <ProgressSummary
          questions={questions}
          showCorrectAnswers={showCorrectAnswers}
          correctAnswers={correctAnswers}
        />

        {/* Section tabs (if multiple groups) */}
        {groups.length > 1 && (
          <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
            {groups.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveGroup(idx)}
                className={cn(
                  "px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap",
                  activeGroup === idx
                    ? "bg-amber-500 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                )}
              >
                {idx * groupSize + 1}-{Math.min((idx + 1) * groupSize, questions.length)}
              </button>
            ))}
          </div>
        )}

        {/* Answer rows */}
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto custom-scrollbar">
          {groups[activeGroup]?.map((question, idx) => {
            const globalIndex = activeGroup * groupSize + idx;
            return (
              <AnswerRow
                key={question.id}
                question={question}
                isActive={globalIndex === currentQuestionIndex}
                onSelect={(optionKey) => onSelectAnswer(globalIndex, optionKey)}
                onClick={() => onNavigate(globalIndex)}
                onToggleFlag={() => onToggleFlag(globalIndex)}
                showCorrectAnswers={showCorrectAnswers}
                correctOptions={correctAnswers?.[question.id]}
                disabled={showCorrectAnswers}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="flex flex-wrap gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
              <span>已答</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300" />
              <span>标记</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-stone-100 border border-stone-300" />
              <span>未答</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}

export default AnswerSheet;
