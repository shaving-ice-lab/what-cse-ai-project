"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CheckCircle,
  XCircle,
  BookOpen,
  Target,
  Lightbulb,
  ListOrdered,
  Brain,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  ArrowUp,
  Sparkles,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Play,
  Lock,
} from "lucide-react";
import { LessonContent } from "../LessonContentRenderer";
import { MermaidRenderer } from "../MermaidRenderer";
import { cn } from "@/lib/utils";

// =====================================================
// 文本处理工具函数
// =====================================================

// 去除文本中的单引号（中英文单引号）
function stripQuotes(text: string): string {
  if (!text) return text;
  // 去除中文单引号 '' 和英文单引号 '
  return text.replace(/[''\']/g, "");
}

// =====================================================
// 步骤配置
// =====================================================

const STEP_CONFIG = [
  {
    id: 1,
    title: "知识导入",
    subtitle: "了解考情与目标",
    sections: ["exam_analysis", "introduction", "goals"],
    icon: BookOpen,
    color: "emerald",
  },
  {
    id: 2,
    title: "核心学习",
    subtitle: "掌握概念与方法",
    sections: ["concepts", "methods", "formulas"],
    icon: Brain,
    color: "purple",
  },
  {
    id: 3,
    title: "实战演练",
    subtitle: "练习巩固知识",
    sections: ["practice"],
    icon: ClipboardList,
    color: "violet",
  },
  {
    id: 4,
    title: "总结提升",
    subtitle: "避坑与巩固",
    sections: ["mistakes", "summary"],
    icon: CheckCircle,
    color: "amber",
  },
];

// =====================================================
// 简洁的章节卡片组件
// =====================================================

interface SectionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function SectionCard({
  icon,
  iconBg,
  title,
  children,
  defaultExpanded = true,
}: SectionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 hover:bg-stone-50 transition-colors"
      >
        <div className={cn("p-2.5 rounded-xl text-white", iconBg)}>{icon}</div>
        <h2 className="flex-1 text-lg font-bold text-stone-800 text-left">
          {title}
        </h2>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-stone-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-stone-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// 练习题组件
// =====================================================

interface QuizProps {
  questions: {
    problem: string;
    options: string[];
    answer: string;
    analysis?: string;
  }[];
  onComplete?: () => void;
}

function Quiz({ questions, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const allAnswered = questions.every((_, idx) => revealed[idx]);
  const correctCount = questions.filter(
    (q, idx) => answers[idx] === q.answer
  ).length;

  useEffect(() => {
    if (allAnswered && onComplete) {
      onComplete();
    }
  }, [allAnswered, onComplete]);

  const handleSelect = (qIdx: number, option: string) => {
    if (revealed[qIdx]) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleReveal = (qIdx: number) => {
    setRevealed((prev) => ({ ...prev, [qIdx]: true }));
  };

  return (
    <div className="space-y-6">
      {/* 进度提示 */}
      <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl">
        <span className="text-sm text-violet-700">
          已完成 {Object.keys(revealed).length} / {questions.length} 题
        </span>
        {allAnswered && (
          <span className="text-sm font-medium text-violet-700">
            正确率：{Math.round((correctCount / questions.length) * 100)}%
          </span>
        )}
      </div>

      {questions.map((q, qIdx) => {
        const selected = answers[qIdx];
        const isRevealed = revealed[qIdx];
        const isCorrect = selected === q.answer;

        return (
          <div key={qIdx} className="p-5 bg-stone-50 rounded-xl">
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-7 h-7 bg-violet-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                {qIdx + 1}
              </span>
              <p className="text-stone-800 leading-relaxed">{stripQuotes(q.problem)}</p>
            </div>

            <div className="space-y-2 ml-10">
              {q.options.map((opt, oIdx) => {
                const letter = String.fromCharCode(65 + oIdx);
                const isThis = selected === letter;
                const isCorrectOpt = letter === q.answer;

                let style = "bg-white border-stone-200 hover:border-stone-300";
                if (isRevealed) {
                  if (isCorrectOpt) {
                    style = "bg-emerald-50 border-emerald-300";
                  } else if (isThis) {
                    style = "bg-red-50 border-red-300";
                  }
                } else if (isThis) {
                  style = "bg-violet-50 border-violet-300";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qIdx, letter)}
                    disabled={isRevealed}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left text-sm flex items-center gap-3 transition-all",
                      style
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                        isRevealed && isCorrectOpt
                          ? "bg-emerald-500 text-white"
                          : isRevealed && isThis
                          ? "bg-red-500 text-white"
                          : isThis
                          ? "bg-violet-500 text-white"
                          : "bg-stone-200 text-stone-600"
                      )}
                    >
                      {letter}
                    </span>
                    <span className="flex-1">{stripQuotes(opt)}</span>
                    {isRevealed && isCorrectOpt && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                    {isRevealed && isThis && !isCorrectOpt && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 ml-10">
              {!isRevealed ? (
                <button
                  onClick={() => handleReveal(qIdx)}
                  disabled={!selected}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    selected
                      ? "bg-violet-500 text-white hover:bg-violet-600"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  )}
                >
                  确认答案
                </button>
              ) : (
                <div
                  className={cn(
                    "p-4 rounded-lg text-sm",
                    isCorrect ? "bg-emerald-50" : "bg-amber-50"
                  )}
                >
                  <p
                    className={cn(
                      "font-medium mb-1",
                      isCorrect ? "text-emerald-700" : "text-amber-700"
                    )}
                  >
                    {isCorrect ? "✓ 回答正确！" : `✗ 正确答案是 ${q.answer}`}
                  </p>
                  {q.analysis && (
                    <p className="text-stone-600 mt-2">{stripQuotes(q.analysis)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================
// 主渲染组件
// =====================================================

interface StepBasedRendererProps {
  content: LessonContent;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
  className?: string;
}

export function StepBasedRenderer({
  content,
  onNavigateNext,
  onNavigatePrev,
  hasNextChapter = false,
  hasPrevChapter = false,
  className,
}: StepBasedRendererProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const { exam_analysis, lesson_content, practice_problems } = content;

  // 检查步骤内容是否存在
  const stepHasContent = useMemo(() => {
    return {
      1:
        !!exam_analysis ||
        !!lesson_content?.introduction ||
        (lesson_content?.learning_goals?.length ?? 0) > 0,
      2:
        (lesson_content?.core_concepts?.length ?? 0) > 0 ||
        (lesson_content?.method_steps?.length ?? 0) > 0 ||
        (lesson_content?.formulas?.length ?? 0) > 0,
      3: (practice_problems?.length ?? 0) > 0,
      4:
        (lesson_content?.common_mistakes?.length ?? 0) > 0 ||
        (lesson_content?.summary_points?.length ?? 0) > 0,
    };
  }, [content]);

  // 滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // 完成当前步骤
  const completeCurrentStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
  };

  // 处理下一步
  const handleNext = () => {
    if (currentStep < 4) {
      completeCurrentStep();
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 4 && hasNextChapter) {
      completeCurrentStep();
      onNavigateNext?.();
    }
  };

  // 处理上一步
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 1 && hasPrevChapter) {
      onNavigatePrev?.();
    }
  };

  // 检查是否可以进入下一步
  const canGoNext = () => {
    if (currentStep === 3 && practice_problems?.length) {
      return practiceCompleted;
    }
    return true;
  };

  // 获取底部按钮文案
  const getNextButtonText = () => {
    if (currentStep === 4) {
      return hasNextChapter ? "学习下一节" : "已完成本节";
    }
    if (currentStep === 3 && !canGoNext()) {
      return "完成练习后继续";
    }
    return `下一步：${STEP_CONFIG[currentStep]?.title || ""}`;
  };

  const getPrevButtonText = () => {
    if (currentStep === 1) {
      return hasPrevChapter ? "上一节" : "";
    }
    return `上一步：${STEP_CONFIG[currentStep - 2]?.title || ""}`;
  };

  if (!content) {
    return (
      <div className="text-center py-12 text-stone-500">暂无课程内容</div>
    );
  }

  return (
    <div className={cn("flex flex-col min-h-full", className)}>
      {/* 内容区域 */}
      <div className="flex-1 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* 步骤标题 */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                    `bg-${STEP_CONFIG[currentStep - 1].color}-500`
                  )}
                  style={{
                    background:
                      currentStep === 1
                        ? "#10b981"
                        : currentStep === 2
                        ? "#8b5cf6"
                        : currentStep === 3
                        ? "#7c3aed"
                        : "#f59e0b",
                  }}
                >
                  {React.createElement(STEP_CONFIG[currentStep - 1].icon, {
                    className: "w-6 h-6",
                  })}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-stone-800">
                    第 {currentStep} 步：{STEP_CONFIG[currentStep - 1].title}
                  </h1>
                  <p className="text-sm text-stone-500">
                    {STEP_CONFIG[currentStep - 1].subtitle}
                  </p>
                </div>
              </div>

              {/* 步骤 1：知识导入 */}
              {currentStep === 1 && (
                <>
                  {exam_analysis && (
                    <SectionCard
                      icon={<TrendingUp className="w-5 h-5" />}
                      iconBg="bg-blue-500"
                      title="考情分析"
                    >
                      <p className="text-stone-700 leading-relaxed mb-4">
                        {stripQuotes(exam_analysis.description)}
                      </p>
                      {(exam_analysis.score_weight ||
                        exam_analysis.difficulty_trend) && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {exam_analysis.score_weight && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <span className="text-xs text-blue-600 font-medium">
                                分值占比
                              </span>
                              <p className="text-sm text-stone-700 mt-1">
                                {stripQuotes(exam_analysis.score_weight)}
                              </p>
                            </div>
                          )}
                          {exam_analysis.difficulty_trend && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <span className="text-xs text-blue-600 font-medium">
                                难度趋势
                              </span>
                              <p className="text-sm text-stone-700 mt-1">
                                {stripQuotes(exam_analysis.difficulty_trend)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </SectionCard>
                  )}

                  {lesson_content?.introduction && (
                    <SectionCard
                      icon={<BookOpen className="w-5 h-5" />}
                      iconBg="bg-emerald-500"
                      title="课程导入"
                    >
                      <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                        {stripQuotes(lesson_content.introduction)}
                      </p>
                    </SectionCard>
                  )}

                  {lesson_content?.learning_goals &&
                    lesson_content.learning_goals.length > 0 && (
                      <SectionCard
                        icon={<Target className="w-5 h-5" />}
                        iconBg="bg-amber-500"
                        title="学习目标"
                      >
                        <ul className="space-y-3">
                          {lesson_content.learning_goals.map((goal, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span className="text-stone-700">{stripQuotes(goal)}</span>
                            </li>
                          ))}
                        </ul>
                      </SectionCard>
                    )}

                  {!stepHasContent[1] && (
                    <div className="text-center py-12 text-stone-400">
                      本步骤暂无内容
                    </div>
                  )}
                </>
              )}

              {/* 步骤 2：核心学习 */}
              {currentStep === 2 && (
                <>
                  {lesson_content?.core_concepts &&
                    lesson_content.core_concepts.length > 0 && (
                      <SectionCard
                        icon={<Lightbulb className="w-5 h-5" />}
                        iconBg="bg-purple-500"
                        title={`核心概念 (${lesson_content.core_concepts.length})`}
                      >
                        <div className="space-y-4">
                          {lesson_content.core_concepts.map((concept, idx) => (
                            <div key={idx} className="p-4 bg-purple-50 rounded-xl">
                              <h4 className="font-semibold text-purple-800 mb-2">
                                {stripQuotes(concept.name)}
                              </h4>
                              {concept.definition && (
                                <p className="text-sm text-stone-600 mb-2">
                                  {stripQuotes(concept.definition)}
                                </p>
                              )}
                              {concept.detailed_explanation && (
                                <p className="text-stone-700 leading-relaxed">
                                  {stripQuotes(concept.detailed_explanation)}
                                </p>
                              )}
                              {concept.example && (
                                <div className="mt-3 p-3 bg-white rounded-lg text-sm">
                                  <span className="text-purple-600 font-medium">
                                    示例：
                                  </span>
                                  <span className="text-stone-600 ml-1">
                                    {stripQuotes(concept.example)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    )}

                  {lesson_content?.method_steps &&
                    lesson_content.method_steps.length > 0 && (
                      <SectionCard
                        icon={<ListOrdered className="w-5 h-5" />}
                        iconBg="bg-cyan-500"
                        title="方法步骤"
                      >
                        <div className="space-y-4">
                          {lesson_content.method_steps.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
                                {step.step || idx + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-stone-800 mb-1">
                                  {stripQuotes(step.title)}
                                </h4>
                                <p className="text-stone-600 leading-relaxed">
                                  {stripQuotes(step.content)}
                                </p>
                                {step.tips && (
                                  <div className="mt-2 p-3 bg-cyan-50 rounded-lg text-sm text-cyan-700">
                                    💡 {stripQuotes(step.tips)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    )}

                  {lesson_content?.formulas &&
                    lesson_content.formulas.length > 0 && (
                      <SectionCard
                        icon={<Brain className="w-5 h-5" />}
                        iconBg="bg-amber-500"
                        title="记忆口诀"
                      >
                        <div className="space-y-4">
                          {lesson_content.formulas.map((formula, idx) => (
                            <div key={idx} className="p-4 bg-amber-50 rounded-xl">
                              <h4 className="font-semibold text-amber-800 mb-2">
                                {stripQuotes(formula.name)}
                              </h4>
                              <div className="p-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg text-center text-lg font-bold">
                                {stripQuotes(formula.content)}
                              </div>
                              {formula.detailed_explanation && (
                                <p className="text-sm text-stone-600 mt-3">
                                  {stripQuotes(formula.detailed_explanation)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    )}

                  {!stepHasContent[2] && (
                    <div className="text-center py-12 text-stone-400">
                      本步骤暂无内容
                    </div>
                  )}
                </>
              )}

              {/* 步骤 3：实战演练 */}
              {currentStep === 3 && (
                <>
                  {practice_problems && practice_problems.length > 0 ? (
                    <SectionCard
                      icon={<ClipboardList className="w-5 h-5" />}
                      iconBg="bg-violet-500"
                      title={`随堂练习 (${practice_problems.length} 道题)`}
                    >
                      <Quiz
                        questions={practice_problems.map((p) => ({
                          problem: p.problem,
                          options: p.options,
                          answer: p.answer,
                          analysis: p.analysis,
                        }))}
                        onComplete={() => setPracticeCompleted(true)}
                      />
                    </SectionCard>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8 text-stone-400" />
                      </div>
                      <p className="text-stone-500">本节暂无练习题</p>
                      <button
                        onClick={() => {
                          setPracticeCompleted(true);
                          handleNext();
                        }}
                        className="mt-4 px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                      >
                        跳过练习
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* 步骤 4：总结提升 */}
              {currentStep === 4 && (
                <>
                  {lesson_content?.common_mistakes &&
                    lesson_content.common_mistakes.length > 0 && (
                      <SectionCard
                        icon={<AlertTriangle className="w-5 h-5" />}
                        iconBg="bg-red-500"
                        title={`易错陷阱 (${lesson_content.common_mistakes.length})`}
                      >
                        <div className="space-y-4">
                          {lesson_content.common_mistakes.map((mistake, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-white border border-red-100 rounded-xl"
                            >
                              <h4 className="font-semibold text-red-700 mb-3">
                                {stripQuotes(mistake.mistake)}
                              </h4>
                              <div className="grid gap-3">
                                <div className="p-3 bg-red-50 rounded-lg">
                                  <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                    <XCircle className="w-4 h-4" /> 错误原因
                                  </span>
                                  <p className="text-sm text-stone-700 mt-1">
                                    {stripQuotes(mistake.reason)}
                                  </p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg">
                                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> 正确做法
                                  </span>
                                  <p className="text-sm text-stone-700 mt-1">
                                    {stripQuotes(mistake.correction)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    )}

                  {lesson_content?.summary_points &&
                    lesson_content.summary_points.length > 0 && (
                      <SectionCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        iconBg="bg-emerald-500"
                        title="课程总结"
                      >
                        <ul className="space-y-3">
                          {lesson_content.summary_points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-stone-700">{stripQuotes(point)}</span>
                            </li>
                          ))}
                        </ul>
                      </SectionCard>
                    )}

                  {lesson_content?.mind_map_mermaid && (
                    <SectionCard
                      icon={<Sparkles className="w-5 h-5" />}
                      iconBg="bg-teal-500"
                      title="思维导图"
                      defaultExpanded={false}
                    >
                      <MermaidRenderer
                        code={lesson_content.mind_map_mermaid}
                        title="知识结构图"
                        allowFullscreen={true}
                        allowDownload={true}
                      />
                    </SectionCard>
                  )}

                  {!stepHasContent[4] && (
                    <div className="text-center py-12 text-stone-400">
                      本步骤暂无内容
                    </div>
                  )}

                  {/* 完成提示 */}
                  <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-amber-800 mb-2">
                      恭喜完成本节学习！
                    </h3>
                    <p className="text-sm text-amber-600">
                      你已完成所有学习步骤，继续加油！
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 底部导航 */}
      <footer className="sticky bottom-0 bg-white border-t border-stone-200 shadow-lg shadow-stone-200/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* 上一步按钮 */}
          <button
            onClick={handlePrev}
            disabled={currentStep === 1 && !hasPrevChapter}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all flex-shrink-0",
              currentStep === 1 && !hasPrevChapter
                ? "opacity-40 cursor-not-allowed text-stone-400"
                : "hover:bg-stone-100 text-stone-700 active:scale-95"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden lg:inline">{getPrevButtonText()}</span>
            <span className="lg:hidden">上一步</span>
          </button>

          {/* 中间步骤指示器 */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-1 sm:gap-2">
              {STEP_CONFIG.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                const isLocked = step.id > currentStep && !completedSteps.includes(step.id - 1);

                return (
                  <React.Fragment key={step.id}>
                    {/* 连接线 */}
                    {idx > 0 && (
                      <div
                        className={cn(
                          "w-4 sm:w-8 h-0.5 transition-colors",
                          isCompleted || isCurrent ? "bg-amber-400" : "bg-stone-200"
                        )}
                      />
                    )}
                    
                    {/* 步骤项 */}
                    <button
                      onClick={() => {
                        if (!isLocked) setCurrentStep(step.id);
                      }}
                      disabled={isLocked}
                      className={cn(
                        "flex flex-col items-center gap-1 transition-all",
                        isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all",
                          isCurrent
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200 scale-110"
                            : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-stone-200 text-stone-400"
                        )}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : isLocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="text-center hidden sm:block">
                        <p
                          className={cn(
                            "text-[10px] font-medium leading-tight",
                            isCurrent
                              ? "text-amber-700"
                              : isCompleted
                              ? "text-emerald-600"
                              : "text-stone-400"
                          )}
                        >
                          {step.title}
                        </p>
                        <p className="text-[9px] text-stone-400 leading-tight hidden md:block">
                          {step.subtitle}
                        </p>
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 下一步按钮 */}
          <button
            onClick={handleNext}
            disabled={!canGoNext() || (currentStep === 4 && !hasNextChapter)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all flex-shrink-0",
              !canGoNext()
                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                : currentStep === 4 && !hasNextChapter
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 active:scale-95"
            )}
          >
            <span className="hidden lg:inline">{getNextButtonText()}</span>
            <span className="lg:hidden">
              {currentStep === 4
                ? hasNextChapter
                  ? "下一节"
                  : "完成"
                : "下一步"}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default StepBasedRenderer;
