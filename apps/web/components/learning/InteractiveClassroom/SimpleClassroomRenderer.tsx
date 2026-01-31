"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Target,
  Lightbulb,
  ListOrdered,
  Brain,
  AlertTriangle,
  GraduationCap,
  ClipboardList,
  Sparkles,
  TrendingUp,
  Menu,
  X,
  ArrowUp,
} from "lucide-react";
import { LessonContent } from "../LessonContentRenderer";
import { MermaidRenderer } from "../MermaidRenderer";
import { cn } from "@/lib/utils";

// =====================================================
// 简洁的章节卡片组件
// =====================================================

interface SectionCardProps {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function SectionCard({
  id,
  icon,
  iconBg,
  title,
  children,
  defaultExpanded = true,
}: SectionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section id={id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 hover:bg-stone-50 transition-colors"
      >
        <div className={cn("p-2.5 rounded-xl text-white", iconBg)}>
          {icon}
        </div>
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
            <div className="p-5 pt-0 border-t border-stone-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// =====================================================
// 简洁的练习题组件
// =====================================================

interface SimpleQuizProps {
  questions: {
    problem: string;
    options: string[];
    answer: string;
    analysis?: string;
  }[];
}

function SimpleQuiz({ questions }: SimpleQuizProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const handleSelect = (qIdx: number, option: string) => {
    if (revealed[qIdx]) return;
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleReveal = (qIdx: number) => {
    setRevealed(prev => ({ ...prev, [qIdx]: true }));
  };

  return (
    <div className="space-y-6">
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
              <p className="text-stone-800 leading-relaxed">{q.problem}</p>
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
                    <span className={cn(
                      "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                      isRevealed && isCorrectOpt
                        ? "bg-emerald-500 text-white"
                        : isRevealed && isThis
                        ? "bg-red-500 text-white"
                        : isThis
                        ? "bg-violet-500 text-white"
                        : "bg-stone-200 text-stone-600"
                    )}>
                      {letter}
                    </span>
                    <span className="flex-1">{opt}</span>
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
                <div className={cn(
                  "p-4 rounded-lg text-sm",
                  isCorrect ? "bg-emerald-50" : "bg-amber-50"
                )}>
                  <p className={cn(
                    "font-medium mb-1",
                    isCorrect ? "text-emerald-700" : "text-amber-700"
                  )}>
                    {isCorrect ? "✓ 回答正确！" : `✗ 正确答案是 ${q.answer}`}
                  </p>
                  {q.analysis && (
                    <p className="text-stone-600 mt-2">{q.analysis}</p>
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
// 内容目录导航（悬浮式）
// =====================================================

interface TableOfContentsProps {
  sections: { id: string; title: string; icon: React.ReactNode }[];
  activeSection: string;
}

function TableOfContents({ sections, activeSection }: TableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsExpanded(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-30">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 w-56 bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden mb-2"
          >
            <div className="p-2 border-b border-stone-100 bg-stone-50">
              <span className="text-xs font-medium text-stone-500">本节目录</span>
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-sm",
                    activeSection === section.id
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  {section.icon}
                  <span className="truncate">{section.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "p-3 rounded-full shadow-lg transition-all",
          isExpanded
            ? "bg-amber-500 text-white"
            : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
        )}
      >
        {isExpanded ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

// =====================================================
// 回到顶部按钮
// =====================================================

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-16 z-30 p-3 bg-white border border-stone-200 rounded-full shadow-lg hover:bg-stone-50 transition-colors"
    >
      <ArrowUp className="w-5 h-5 text-stone-600" />
    </button>
  );
}

// =====================================================
// 主渲染组件
// =====================================================

interface SimpleClassroomRendererProps {
  content: LessonContent;
  className?: string;
}

export function SimpleClassroomRenderer({
  content,
  className,
}: SimpleClassroomRendererProps) {
  const [activeSection, setActiveSection] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { exam_analysis, lesson_content, practice_problems, homework } = content;

  // 生成章节列表
  const sections = useMemo(() => {
    const result: { id: string; title: string; icon: React.ReactNode }[] = [];

    if (exam_analysis) {
      result.push({ id: "exam-analysis", title: "考情分析", icon: <TrendingUp className="w-4 h-4" /> });
    }
    if (lesson_content?.introduction) {
      result.push({ id: "introduction", title: "课程导入", icon: <BookOpen className="w-4 h-4" /> });
    }
    if (lesson_content?.learning_goals?.length) {
      result.push({ id: "goals", title: "学习目标", icon: <Target className="w-4 h-4" /> });
    }
    if (lesson_content?.core_concepts?.length) {
      result.push({ id: "concepts", title: "核心概念", icon: <Lightbulb className="w-4 h-4" /> });
    }
    if (lesson_content?.method_steps?.length) {
      result.push({ id: "methods", title: "方法步骤", icon: <ListOrdered className="w-4 h-4" /> });
    }
    if (lesson_content?.formulas?.length) {
      result.push({ id: "formulas", title: "记忆口诀", icon: <Brain className="w-4 h-4" /> });
    }
    if (lesson_content?.common_mistakes?.length) {
      result.push({ id: "mistakes", title: "易错陷阱", icon: <AlertTriangle className="w-4 h-4" /> });
    }
    if (practice_problems?.length) {
      result.push({ id: "practice", title: "随堂练习", icon: <ClipboardList className="w-4 h-4" /> });
    }
    if (lesson_content?.summary_points?.length) {
      result.push({ id: "summary", title: "课程总结", icon: <CheckCircle className="w-4 h-4" /> });
    }

    return result;
  }, [content]);

  // 监听滚动更新当前章节
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 200;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element && element.offsetTop <= scrollY) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  if (!content) {
    return (
      <div className="text-center py-12 text-stone-500">暂无课程内容</div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* 目录导航 */}
      <TableOfContents sections={sections} activeSection={activeSection} />

      {/* 回到顶部 */}
      <BackToTop />

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 考情分析 */}
        {exam_analysis && (
          <SectionCard
            id="exam-analysis"
            icon={<TrendingUp className="w-5 h-5" />}
            iconBg="bg-blue-500"
            title="考情分析"
          >
            <p className="text-stone-700 leading-relaxed mb-4">{exam_analysis.description}</p>
            {(exam_analysis.score_weight || exam_analysis.difficulty_trend) && (
              <div className="grid sm:grid-cols-2 gap-3">
                {exam_analysis.score_weight && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-xs text-blue-600 font-medium">分值占比</span>
                    <p className="text-sm text-stone-700 mt-1">{exam_analysis.score_weight}</p>
                  </div>
                )}
                {exam_analysis.difficulty_trend && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-xs text-blue-600 font-medium">难度趋势</span>
                    <p className="text-sm text-stone-700 mt-1">{exam_analysis.difficulty_trend}</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        )}

        {/* 课程导入 */}
        {lesson_content?.introduction && (
          <SectionCard
            id="introduction"
            icon={<BookOpen className="w-5 h-5" />}
            iconBg="bg-emerald-500"
            title="课程导入"
          >
            <p className="text-stone-700 leading-relaxed whitespace-pre-line">
              {lesson_content.introduction}
            </p>
          </SectionCard>
        )}

        {/* 学习目标 */}
        {lesson_content?.learning_goals && lesson_content.learning_goals.length > 0 && (
          <SectionCard
            id="goals"
            icon={<Target className="w-5 h-5" />}
            iconBg="bg-amber-500"
            title="学习目标"
          >
            <ul className="space-y-3">
              {lesson_content.learning_goals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">{goal}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* 核心概念 */}
        {lesson_content?.core_concepts && lesson_content.core_concepts.length > 0 && (
          <SectionCard
            id="concepts"
            icon={<Lightbulb className="w-5 h-5" />}
            iconBg="bg-purple-500"
            title={`核心概念 (${lesson_content.core_concepts.length})`}
          >
            <div className="space-y-4">
              {lesson_content.core_concepts.map((concept, idx) => (
                <div key={idx} className="p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-purple-800 mb-2">{concept.name}</h4>
                  {concept.definition && (
                    <p className="text-sm text-stone-600 mb-2">{concept.definition}</p>
                  )}
                  {concept.detailed_explanation && (
                    <p className="text-stone-700 leading-relaxed">{concept.detailed_explanation}</p>
                  )}
                  {concept.example && (
                    <div className="mt-3 p-3 bg-white rounded-lg text-sm">
                      <span className="text-purple-600 font-medium">示例：</span>
                      <span className="text-stone-600 ml-1">{concept.example}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* 方法步骤 */}
        {lesson_content?.method_steps && lesson_content.method_steps.length > 0 && (
          <SectionCard
            id="methods"
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
                    <h4 className="font-semibold text-stone-800 mb-1">{step.title}</h4>
                    <p className="text-stone-600 leading-relaxed">{step.content}</p>
                    {step.tips && (
                      <div className="mt-2 p-3 bg-cyan-50 rounded-lg text-sm text-cyan-700">
                        💡 {step.tips}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* 记忆口诀 */}
        {lesson_content?.formulas && lesson_content.formulas.length > 0 && (
          <SectionCard
            id="formulas"
            icon={<Brain className="w-5 h-5" />}
            iconBg="bg-amber-500"
            title="记忆口诀"
          >
            <div className="space-y-4">
              {lesson_content.formulas.map((formula, idx) => (
                <div key={idx} className="p-4 bg-amber-50 rounded-xl">
                  <h4 className="font-semibold text-amber-800 mb-2">{formula.name}</h4>
                  <div className="p-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg text-center text-lg font-bold">
                    {formula.content}
                  </div>
                  {formula.detailed_explanation && (
                    <p className="text-sm text-stone-600 mt-3">{formula.detailed_explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* 易错陷阱 */}
        {lesson_content?.common_mistakes && lesson_content.common_mistakes.length > 0 && (
          <SectionCard
            id="mistakes"
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBg="bg-red-500"
            title={`易错陷阱 (${lesson_content.common_mistakes.length})`}
          >
            <div className="space-y-4">
              {lesson_content.common_mistakes.map((mistake, idx) => (
                <div key={idx} className="p-4 bg-white border border-red-100 rounded-xl">
                  <h4 className="font-semibold text-red-700 mb-3">{mistake.mistake}</h4>
                  <div className="grid gap-3">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> 错误原因
                      </span>
                      <p className="text-sm text-stone-700 mt-1">{mistake.reason}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> 正确做法
                      </span>
                      <p className="text-sm text-stone-700 mt-1">{mistake.correction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* 随堂练习 */}
        {practice_problems && practice_problems.length > 0 && (
          <SectionCard
            id="practice"
            icon={<ClipboardList className="w-5 h-5" />}
            iconBg="bg-violet-500"
            title={`随堂练习 (${practice_problems.length} 道题)`}
          >
            <SimpleQuiz
              questions={practice_problems.map(p => ({
                problem: p.problem,
                options: p.options,
                answer: p.answer,
                analysis: p.analysis,
              }))}
            />
          </SectionCard>
        )}

        {/* 课程总结 */}
        {lesson_content?.summary_points && lesson_content.summary_points.length > 0 && (
          <SectionCard
            id="summary"
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
                  <span className="text-stone-700">{point}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* 思维导图 */}
        {lesson_content?.mind_map_mermaid && (
          <SectionCard
            id="mindmap"
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

        {/* 课后作业 */}
        {homework && (
          <SectionCard
            id="homework"
            icon={<GraduationCap className="w-5 h-5" />}
            iconBg="bg-blue-500"
            title="课后作业"
            defaultExpanded={false}
          >
            <div className="space-y-4">
              {homework.required && homework.required.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-100 rounded text-xs">必做</span>
                  </h4>
                  <ul className="space-y-2">
                    {homework.required.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-stone-700 text-sm">
                        <span className="text-red-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {homework.optional && homework.optional.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">选做</span>
                  </h4>
                  <ul className="space-y-2">
                    {homework.optional.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-stone-700 text-sm">
                        <span className="text-blue-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

export default SimpleClassroomRenderer;
