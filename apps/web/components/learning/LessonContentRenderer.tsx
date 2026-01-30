"use client";

import React from "react";
import {
  BookOpen,
  Target,
  Lightbulb,
  ListOrdered,
  Brain,
  AlertTriangle,
  CheckCircle,
  Layers,
  FileText,
  BookMarked,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Map,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MermaidRenderer } from "./MermaidRenderer";
import { QuickNotesCard } from "./QuickNotesCard";

// =====================================================
// 类型定义
// =====================================================

export interface LessonContent {
  exam_analysis?: ExamAnalysis;
  lesson_content?: LessonContentData;
  lesson_sections?: LessonSection[];
  practice_problems?: PracticeProblem[];
  homework?: Homework;
}

export interface ExamAnalysis {
  description: string;
  frequency?: string;
  score_weight?: string;
  difficulty_trend?: string;
  exam_forms?: string[];
  key_patterns?: string[];
  recent_trends?: string;
}

// 快速笔记数据结构
export interface QuickNotesData {
  formulas?: QuickFormula[];
  key_points?: string[];
  common_mistakes?: QuickMistake[];
  exam_tips?: string[];
}

export interface QuickFormula {
  name: string;
  content: string;
  explanation?: string;
}

export interface QuickMistake {
  mistake: string;
  correction: string;
}

export interface LessonContentData {
  introduction?: string;
  learning_goals?: string[];
  prerequisites?: string[];
  core_concepts?: CoreConcept[];
  method_steps?: MethodStep[];
  formulas?: Formula[];
  memory_tips?: MemoryTip[];
  common_mistakes?: CommonMistake[];
  exam_strategies?: ExamStrategy[];
  vocabulary_accumulation?: VocabularyAccumulation;
  extension_knowledge?: string;
  summary_points?: string[];
  // 新增字段：思维导图和快速笔记
  mind_map_mermaid?: string;
  quick_notes?: QuickNotesData;
}

export interface CoreConcept {
  name: string;
  definition?: string;
  detailed_explanation?: string;
  application_scenarios?: string[];
  example?: string;
  common_pairs?: string[];
  tips?: string;
}

export interface MethodStep {
  step: number;
  title: string;
  content: string;
  tips?: string;
  key_signals?: string[];
  time_allocation?: string;
  common_errors?: string;
  analysis_order?: string;
  verification_checklist?: string[];
}

export interface Formula {
  name: string;
  content: string;
  detailed_explanation?: string;
  memory_aid?: string;
  examples?: string[];
}

export interface MemoryTip {
  tip: string;
  content: string;
  example?: string;
  word_pairs?: string[];
}

export interface ExamStrategy {
  strategy: string;
  content: string;
}

export interface CommonMistake {
  mistake: string;
  frequency?: string;
  reason: string;
  typical_case?: string;
  correction: string;
  prevention?: string;
}

export interface VocabularyAccumulation {
  must_know?: string[];
  should_know?: string[];
  nice_to_know?: string[];
}

export interface LessonSection {
  order: number;
  title: string;
  content: string;
  section_type: string;
  duration?: string;
  key_points?: string[];
  concept_map?: string;
  flowchart?: string;
  examples?: ExampleQuestion[];
  traps?: Trap[];
  real_exam_questions?: RealExamQuestion[];
  mind_map?: string;
  key_takeaways?: string[];
  next_lesson_preview?: string;
}

export interface ExampleQuestion {
  title: string;
  source?: string;
  difficulty?: string;
  problem: string;
  context_analysis?: string;
  thinking_process?: string;
  option_analysis?: Record<string, string>;
  answer: string;
  key_technique?: string;
  extension?: string;
  time_spent?: string;
}

export interface Trap {
  name: string;
  description: string;
  case?: string;
  solution: string;
}

export interface RealExamQuestion {
  year: string;
  problem: string;
  time_limit?: string;
  answer: string;
  quick_analysis: string;
}

export interface PracticeProblem {
  order: number;
  difficulty?: string;
  difficulty_level?: string;
  problem: string;
  options: string[];
  answer: string;
  analysis: string;
  knowledge_point?: string;
  time_suggestion?: string;
  similar_type?: string;
  advanced_technique?: string;
}

export interface Homework {
  required?: string[];
  optional?: string[];
  thinking_questions?: string[];
  preview?: string;
}

interface LessonContentRendererProps {
  content: LessonContent;
  className?: string;
}

// =====================================================
// 主渲染组件
// =====================================================

export function LessonContentRenderer({
  content,
  className,
}: LessonContentRendererProps) {
  if (!content) {
    return (
      <div className="text-center py-12 text-stone-500">暂无课程内容</div>
    );
  }

  const { exam_analysis, lesson_content, lesson_sections, practice_problems, homework } = content;

  return (
    <div className={cn("space-y-8", className)}>
      {/* 1. 考情分析 */}
      {exam_analysis && <ExamAnalysisCard data={exam_analysis} />}

      {/* 2. 课程导入 */}
      {lesson_content?.introduction && (
        <IntroductionSection introduction={lesson_content.introduction} />
      )}

      {/* 3. 学习目标 */}
      {lesson_content?.learning_goals && lesson_content.learning_goals.length > 0 && (
        <LearningGoals goals={lesson_content.learning_goals} />
      )}

      {/* 4. 前置知识 */}
      {lesson_content?.prerequisites && lesson_content.prerequisites.length > 0 && (
        <PrerequisitesSection prerequisites={lesson_content.prerequisites} />
      )}

      {/* 5. 核心概念 */}
      {lesson_content?.core_concepts && lesson_content.core_concepts.length > 0 && (
        <CoreConceptsGrid concepts={lesson_content.core_concepts} />
      )}

      {/* 6. 方法步骤 */}
      {lesson_content?.method_steps && lesson_content.method_steps.length > 0 && (
        <MethodStepsFlow steps={lesson_content.method_steps} />
      )}

      {/* 7. 记忆口诀 */}
      {lesson_content?.formulas && lesson_content.formulas.length > 0 && (
        <FormulasMemory formulas={lesson_content.formulas} />
      )}

      {/* 8. 记忆技巧 */}
      {lesson_content?.memory_tips && lesson_content.memory_tips.length > 0 && (
        <MemoryTipsSection tips={lesson_content.memory_tips} />
      )}

      {/* 9. 精讲例题 */}
      {lesson_sections?.filter(s => s.section_type === "example").map((section, idx) => (
        <ExampleQuestions key={idx} section={section} />
      ))}

      {/* 10. 易错陷阱 */}
      {lesson_content?.common_mistakes && lesson_content.common_mistakes.length > 0 && (
        <CommonMistakesSection mistakes={lesson_content.common_mistakes} />
      )}

      {/* 11. 答题策略 */}
      {lesson_content?.exam_strategies && lesson_content.exam_strategies.length > 0 && (
        <ExamStrategiesSection strategies={lesson_content.exam_strategies} />
      )}

      {/* 12. 真题演练 */}
      {lesson_sections?.filter(s => s.section_type === "drill").map((section, idx) => (
        <RealExamDrills key={idx} section={section} />
      ))}

      {/* 13. 练习题目 */}
      {practice_problems && practice_problems.length > 0 && (
        <PracticeSection problems={practice_problems} />
      )}

      {/* 14. 高频词汇 */}
      {lesson_content?.vocabulary_accumulation && (
        <VocabularyList vocabulary={lesson_content.vocabulary_accumulation} />
      )}

      {/* 15. 拓展知识 */}
      {lesson_content?.extension_knowledge && (
        <ExtensionKnowledge content={lesson_content.extension_knowledge} />
      )}

      {/* 16. 课程总结 */}
      {lesson_content?.summary_points && lesson_content.summary_points.length > 0 && (
        <LessonSummary points={lesson_content.summary_points} />
      )}

      {/* 17. 思维导图 (Mermaid) */}
      {lesson_content?.mind_map_mermaid && (
        <MindMapSection mermaidCode={lesson_content.mind_map_mermaid} />
      )}

      {/* 18. 快速笔记 */}
      {lesson_content?.quick_notes && (
        <QuickNotesSection data={lesson_content.quick_notes} />
      )}

      {/* 19. 分段内容补充 */}
      {lesson_sections && lesson_sections.length > 0 && (
        <LessonSectionsOverview sections={lesson_sections} />
      )}

      {/* 20. 课后作业 */}
      {homework && <HomeworkAssignment homework={homework} />}
    </div>
  );
}

// =====================================================
// 1. 考情分析卡片
// =====================================================

function ExamAnalysisCard({ data }: { data: ExamAnalysis }) {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500 rounded-xl text-white">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-blue-900">考情分析</h3>
        {data.frequency && (
          <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            考查频率：{data.frequency}
          </span>
        )}
      </div>
      <p className="text-stone-700 leading-relaxed">{data.description}</p>

      {(data.score_weight || data.difficulty_trend) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {data.score_weight && (
            <div className="p-3 bg-white/60 rounded-lg text-sm text-stone-700">
              <span className="font-medium text-blue-800">分值占比：</span>
              {data.score_weight}
            </div>
          )}
          {data.difficulty_trend && (
            <div className="p-3 bg-white/60 rounded-lg text-sm text-stone-700">
              <span className="font-medium text-blue-800">难度趋势：</span>
              {data.difficulty_trend}
            </div>
          )}
        </div>
      )}
      
      {data.exam_forms && data.exam_forms.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-stone-500">考查形式：</span>
          {data.exam_forms.map((form, idx) => (
            <span key={idx} className="px-2 py-1 bg-white/60 rounded text-sm text-blue-700">
              {form}
            </span>
          ))}
        </div>
      )}

      {data.key_patterns && data.key_patterns.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-stone-500">命题规律：</span>
          {data.key_patterns.map((pattern, idx) => (
            <span key={idx} className="px-2 py-1 bg-white/60 rounded text-sm text-blue-700">
              {pattern}
            </span>
          ))}
        </div>
      )}
      
      {data.recent_trends && (
        <div className="mt-4 p-3 bg-white/50 rounded-lg">
          <span className="text-sm font-medium text-blue-800">近年趋势：</span>
          <span className="text-sm text-stone-600 ml-2">{data.recent_trends}</span>
        </div>
      )}
    </section>
  );
}

// =====================================================
// 2. 课程导入
// =====================================================

function IntroductionSection({ introduction }: { introduction: string }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-500 rounded-xl text-white">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">课程导入</h3>
      </div>
      <div className="prose prose-stone max-w-none">
        <p className="text-stone-700 leading-relaxed whitespace-pre-line">{introduction}</p>
      </div>
    </section>
  );
}

// =====================================================
// 3. 学习目标
// =====================================================

function LearningGoals({ goals }: { goals: string[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-500 rounded-xl text-white">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">学习目标</h3>
      </div>
      <ul className="space-y-3">
        {goals.map((goal, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-stone-700">{goal}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =====================================================
// 4. 前置知识
// =====================================================

function PrerequisitesSection({ prerequisites }: { prerequisites: string[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-stone-600 rounded-xl text-white">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">前置知识</h3>
      </div>
      <ul className="space-y-2">
        {prerequisites.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-stone-200 text-stone-700 rounded-full flex items-center justify-center text-xs">
              {idx + 1}
            </span>
            <span className="text-stone-700">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =====================================================
// 5. 核心概念网格
// =====================================================

function CoreConceptsGrid({ concepts }: { concepts: CoreConcept[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500 rounded-xl text-white">
          <Lightbulb className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">核心概念</h3>
        <span className="ml-auto text-sm text-stone-500">{concepts.length} 个概念</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {concepts.map((concept, idx) => (
          <div
            key={idx}
            className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100"
          >
            <h4 className="font-semibold text-purple-900 mb-2">{concept.name}</h4>
            {concept.definition && (
              <p className="text-sm text-stone-600 mb-2">{concept.definition}</p>
            )}
            {concept.detailed_explanation && (
              <p className="text-sm text-stone-700 leading-relaxed">
                {concept.detailed_explanation}
              </p>
            )}
            {concept.application_scenarios && concept.application_scenarios.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-purple-700 font-medium mb-1">适用场景</p>
                <ul className="space-y-1 text-xs text-stone-600">
                  {concept.application_scenarios.map((scenario, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>{scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {concept.example && (
              <div className="mt-3 p-2 bg-white/60 rounded text-sm">
                <span className="text-purple-700 font-medium">示例：</span>
                <span className="text-stone-600 ml-1">{concept.example}</span>
              </div>
            )}
            {concept.common_pairs && concept.common_pairs.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-purple-700 font-medium mb-1">常见搭配</p>
                <div className="flex flex-wrap gap-2">
                  {concept.common_pairs.map((pair, pIdx) => (
                    <span key={pIdx} className="px-2 py-1 bg-white/70 text-purple-700 rounded text-xs">
                      {pair}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {concept.tips && (
              <div className="mt-3 p-2 bg-purple-100/70 rounded text-xs text-purple-800">
                提示：{concept.tips}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 5. 方法步骤流程
// =====================================================

function MethodStepsFlow({ steps }: { steps: MethodStep[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500 rounded-xl text-white">
          <ListOrdered className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">方法步骤</h3>
      </div>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
              {step.step || idx + 1}
            </div>
            <div className="flex-1 pb-4 border-b border-stone-100 last:border-0">
              <h4 className="font-semibold text-stone-900 mb-2">{step.title}</h4>
              <p className="text-stone-700 leading-relaxed">{step.content}</p>
              {step.tips && (
                <div className="mt-2 p-2 bg-cyan-50 rounded text-sm text-cyan-800">
                  💡 {step.tips}
                </div>
              )}
              {step.time_allocation && (
                <p className="mt-2 text-sm text-cyan-700">建议用时：{step.time_allocation}</p>
              )}
              {step.common_errors && (
                <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                  常见错误：{step.common_errors}
                </div>
              )}
              {step.analysis_order && (
                <p className="mt-2 text-sm text-stone-600">分析顺序：{step.analysis_order}</p>
              )}
              {step.verification_checklist && step.verification_checklist.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-stone-500 mb-1">核查清单</p>
                  <div className="flex flex-wrap gap-2">
                    {step.verification_checklist.map((item, vIdx) => (
                      <span key={vIdx} className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {step.key_signals && step.key_signals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {step.key_signals.map((signal, sIdx) => (
                    <span key={sIdx} className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs">
                      {signal}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 6. 记忆口诀
// =====================================================

function FormulasMemory({ formulas }: { formulas: Formula[] }) {
  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500 rounded-xl text-white">
          <Brain className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-amber-900">记忆口诀</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {formulas.map((formula, idx) => (
          <div key={idx} className="p-4 bg-white/70 rounded-xl">
            <h4 className="font-semibold text-amber-800 mb-2">{formula.name}</h4>
            <p className="text-lg font-medium text-amber-900 bg-amber-100 p-3 rounded-lg mb-2">
              {formula.content}
            </p>
            {formula.detailed_explanation && (
              <p className="text-sm text-stone-600">{formula.detailed_explanation}</p>
            )}
            {formula.memory_aid && (
              <p className="text-sm text-amber-700 mt-2 italic">记忆技巧：{formula.memory_aid}</p>
            )}
            {formula.examples && formula.examples.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-amber-700 font-medium mb-1">应用示例</p>
                <ul className="space-y-1 text-xs text-stone-600">
                  {formula.examples.map((example, eIdx) => (
                    <li key={eIdx} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 7. 记忆技巧
// =====================================================

function MemoryTipsSection({ tips }: { tips: MemoryTip[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500 rounded-xl text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">记忆技巧</h3>
        <span className="ml-auto text-sm text-stone-500">{tips.length} 条技巧</span>
      </div>
      <div className="space-y-4">
        {tips.map((tip, idx) => (
          <div key={idx} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-emerald-500 text-white rounded text-xs font-medium">
                {idx + 1}
              </span>
              <h4 className="font-semibold text-emerald-900">{tip.tip}</h4>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{tip.content}</p>
            {tip.example && (
              <div className="mt-2 p-2 bg-white/70 rounded text-sm text-emerald-800">
                示例：{tip.example}
              </div>
            )}
            {tip.word_pairs && tip.word_pairs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tip.word_pairs.map((pair, pIdx) => (
                  <span key={pIdx} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
                    {pair}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 8. 精讲例题
// =====================================================

function ExampleQuestions({ section }: { section: LessonSection }) {
  const examples = section.examples || [];
  if (examples.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500 rounded-xl text-white">
          <FileText className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">{section.title || "精讲例题"}</h3>
        <span className="ml-auto text-sm text-stone-500">{examples.length} 道例题</span>
      </div>
      {section.content && (
        <p className="text-stone-700 mb-4 whitespace-pre-line">{section.content}</p>
      )}
      <div className="space-y-6">
        {examples.map((example, idx) => (
          <div key={idx} className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-indigo-500 text-white rounded text-sm font-medium">
                例题 {idx + 1}
              </span>
              {example.source && (
                <span className="text-sm text-indigo-600">{example.source}</span>
              )}
              {example.difficulty && (
                <span className="ml-auto text-sm text-stone-500">{example.difficulty}</span>
              )}
            </div>
            <p className="text-stone-800 mb-4">{example.problem}</p>
            
            {example.context_analysis && (
              <div className="p-3 bg-white rounded mb-3">
                <span className="text-sm font-medium text-indigo-700">语境分析：</span>
                <p className="text-sm text-stone-600 mt-1">{example.context_analysis}</p>
              </div>
            )}
            
            {example.thinking_process && (
              <div className="p-3 bg-white rounded mb-3">
                <span className="text-sm font-medium text-indigo-700">解题思路：</span>
                <p className="text-sm text-stone-600 mt-1">{example.thinking_process}</p>
              </div>
            )}

            {example.option_analysis && Object.keys(example.option_analysis).length > 0 && (
              <div className="p-3 bg-white rounded mb-3">
                <span className="text-sm font-medium text-indigo-700">选项解析：</span>
                <div className="mt-2 space-y-2 text-sm text-stone-600">
                  {Object.entries(example.option_analysis).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium text-indigo-600">{key}项：</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {example.key_technique && (
              <div className="p-3 bg-indigo-100/70 rounded mb-3 text-sm text-indigo-800">
                <span className="font-medium">核心技巧：</span>
                {example.key_technique}
              </div>
            )}

            {example.extension && (
              <div className="p-3 bg-white rounded mb-3 text-sm text-stone-600">
                <span className="font-medium text-indigo-700">延伸拓展：</span>
                <span className="ml-1">{example.extension}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-indigo-200">
              <span className="text-sm font-medium text-indigo-700">答案：</span>
              <span className="px-3 py-1 bg-indigo-500 text-white rounded font-bold">
                {example.answer}
              </span>
              {example.time_spent && (
                <span className="ml-auto text-xs text-stone-500">建议用时：{example.time_spent}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 8. 易错陷阱
// =====================================================

function CommonMistakesSection({ mistakes }: { mistakes: CommonMistake[] }) {
  return (
    <section className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-500 rounded-xl text-white">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-red-900">易错陷阱</h3>
        <span className="ml-auto text-sm text-red-600">{mistakes.length} 个易错点</span>
      </div>
      <div className="space-y-4">
        {mistakes.map((mistake, idx) => (
          <div key={idx} className="p-4 bg-white/70 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-red-500 text-white rounded text-sm font-medium flex-shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-2">{mistake.mistake}</h4>
                {mistake.frequency && (
                  <p className="text-xs text-red-500 mb-2">错误频率：{mistake.frequency}</p>
                )}
                <p className="text-sm text-stone-700 mb-2">
                  <span className="font-medium text-red-700">错误原因：</span>
                  {mistake.reason}
                </p>
                {mistake.typical_case && (
                  <p className="text-sm text-stone-700 mb-2">
                    <span className="font-medium text-red-700">典型案例：</span>
                    {mistake.typical_case}
                  </p>
                )}
                <p className="text-sm text-stone-700">
                  <span className="font-medium text-emerald-700">正确做法：</span>
                  {mistake.correction}
                </p>
                {mistake.prevention && (
                  <p className="text-sm text-blue-700 mt-2 italic">
                    预防措施：{mistake.prevention}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 9. 答题策略
// =====================================================

function ExamStrategiesSection({ strategies }: { strategies: ExamStrategy[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-600 rounded-xl text-white">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">答题策略</h3>
        <span className="ml-auto text-sm text-stone-500">{strategies.length} 条策略</span>
      </div>
      <div className="space-y-4">
        {strategies.map((strategy, idx) => (
          <div key={idx} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <h4 className="font-semibold text-emerald-900 mb-2">
              {strategy.strategy || `策略 ${idx + 1}`}
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed">{strategy.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 10. 真题演练
// =====================================================

function RealExamDrills({ section }: { section: LessonSection }) {
  const questions = section.real_exam_questions || [];
  if (questions.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-teal-500 rounded-xl text-white">
          <GraduationCap className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">{section.title || "真题演练"}</h3>
        {section.duration && (
          <span className="ml-auto text-sm text-stone-500">时长：{section.duration}</span>
        )}
      </div>
      {section.content && (
        <p className="text-stone-700 mb-4 whitespace-pre-line">{section.content}</p>
      )}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="p-4 bg-teal-50 rounded-xl border border-teal-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-teal-500 text-white rounded text-sm">
                {q.year}年真题
              </span>
              {q.time_limit && (
                <span className="text-sm text-teal-600">建议用时：{q.time_limit}</span>
              )}
            </div>
            <p className="text-stone-800 mb-4">{q.problem}</p>
            <details className="group">
              <summary className="cursor-pointer text-teal-600 font-medium hover:text-teal-700">
                查看答案与解析
              </summary>
              <div className="mt-3 p-3 bg-white rounded">
                <p className="text-sm">
                  <span className="font-medium text-teal-700">答案：</span>
                  <span className="font-bold text-teal-600">{q.answer}</span>
                </p>
                <p className="text-sm text-stone-600 mt-2">{q.quick_analysis}</p>
              </div>
            </details>
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 10. 练习题目
// =====================================================

function PracticeSection({ problems }: { problems: PracticeProblem[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-500 rounded-xl text-white">
          <ClipboardList className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">练习题目</h3>
        <span className="ml-auto text-sm text-stone-500">{problems.length} 道题</span>
      </div>
      <div className="space-y-6">
        {problems.map((problem, idx) => (
          <div key={idx} className="p-4 bg-stone-50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-violet-500 text-white rounded text-sm font-medium">
                第 {problem.order || idx + 1} 题
              </span>
              {problem.difficulty_level && (
                <span className="text-sm text-violet-600">{problem.difficulty_level}</span>
              )}
              {problem.difficulty && (
                <span className="text-sm text-stone-500">{problem.difficulty}</span>
              )}
              {problem.time_suggestion && (
                <span className="ml-auto text-sm text-stone-500">
                  建议用时：{problem.time_suggestion}
                </span>
              )}
            </div>
            <p className="text-stone-800 mb-4">{problem.problem}</p>
            <div className="space-y-2 mb-4">
              {problem.options.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  className="p-2 bg-white rounded border border-stone-200 text-sm text-stone-700 hover:border-violet-300 cursor-pointer transition-colors"
                >
                  {opt}
                </div>
              ))}
            </div>
            {(problem.knowledge_point || problem.similar_type || problem.advanced_technique) && (
              <div className="flex flex-wrap gap-2 text-xs text-stone-500 mb-3">
                {problem.knowledge_point && (
                  <span className="px-2 py-1 bg-white rounded border border-stone-200">
                    考点：{problem.knowledge_point}
                  </span>
                )}
                {problem.similar_type && (
                  <span className="px-2 py-1 bg-white rounded border border-stone-200">
                    相似题型：{problem.similar_type}
                  </span>
                )}
                {problem.advanced_technique && (
                  <span className="px-2 py-1 bg-white rounded border border-stone-200">
                    进阶技巧：{problem.advanced_technique}
                  </span>
                )}
              </div>
            )}
            <details className="group">
              <summary className="cursor-pointer text-violet-600 font-medium hover:text-violet-700">
                查看答案与解析
              </summary>
              <div className="mt-3 p-3 bg-violet-50 rounded">
                <p className="text-sm mb-2">
                  <span className="font-medium text-violet-700">正确答案：</span>
                  <span className="font-bold text-violet-600">{problem.answer}</span>
                </p>
                <p className="text-sm text-stone-700 whitespace-pre-line">{problem.analysis}</p>
              </div>
            </details>
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 11. 高频词汇
// =====================================================

function VocabularyList({ vocabulary }: { vocabulary: VocabularyAccumulation }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-pink-500 rounded-xl text-white">
          <BookMarked className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">高频词汇</h3>
      </div>
      <div className="space-y-4">
        {vocabulary.must_know && vocabulary.must_know.length > 0 && (
          <div>
            <h4 className="font-medium text-pink-700 mb-2">必须掌握</h4>
            <div className="flex flex-wrap gap-2">
              {vocabulary.must_know.map((word, idx) => (
                <span key={idx} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
        {vocabulary.should_know && vocabulary.should_know.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-700 mb-2">应该了解</h4>
            <div className="flex flex-wrap gap-2">
              {vocabulary.should_know.map((word, idx) => (
                <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
        {vocabulary.nice_to_know && vocabulary.nice_to_know.length > 0 && (
          <div>
            <h4 className="font-medium text-stone-600 mb-2">可以了解</h4>
            <div className="flex flex-wrap gap-2">
              {vocabulary.nice_to_know.map((word, idx) => (
                <span key={idx} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// =====================================================
// 12. 拓展知识
// =====================================================

function ExtensionKnowledge({ content }: { content: string }) {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-stone-50 rounded-2xl p-6 border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-500 rounded-xl text-white">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">拓展知识</h3>
      </div>
      <div className="prose prose-stone max-w-none">
        <p className="text-stone-700 leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    </section>
  );
}

// =====================================================
// 13. 课程总结
// =====================================================

function LessonSummary({ points }: { points: string[] }) {
  return (
    <section className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-500 rounded-xl text-white">
          <CheckCircle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-emerald-900">课程总结</h3>
      </div>
      <ul className="space-y-3">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {idx + 1}
            </span>
            <span className="text-stone-700">{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =====================================================
// 14. 课后作业
// =====================================================

function HomeworkAssignment({ homework }: { homework: Homework }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500 rounded-xl text-white">
          <ClipboardList className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">课后作业</h3>
      </div>
      <div className="space-y-4">
        {homework.required && homework.required.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-2">必做作业</h4>
            <ul className="space-y-2">
              {homework.required.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {homework.optional && homework.optional.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-600 mb-2">选做作业</h4>
            <ul className="space-y-2">
              {homework.optional.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {homework.thinking_questions && homework.thinking_questions.length > 0 && (
          <div>
            <h4 className="font-medium text-purple-600 mb-2">思考题</h4>
            <ul className="space-y-2">
              {homework.thinking_questions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {homework.preview && (
          <div className="p-3 bg-stone-50 rounded-lg">
            <h4 className="font-medium text-stone-700 mb-1">预习任务</h4>
            <p className="text-sm text-stone-600">{homework.preview}</p>
          </div>
        )}
      </div>
    </section>
  );
}

// =====================================================
// 14. 思维导图 (Mermaid)
// =====================================================

function MindMapSection({ mermaidCode }: { mermaidCode: string }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-teal-500 rounded-xl text-white">
          <Map className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">思维导图</h3>
        <span className="ml-auto text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded">
          可全屏查看 · 可下载
        </span>
      </div>
      <MermaidRenderer
        code={mermaidCode}
        title="知识结构图"
        allowFullscreen={true}
        allowDownload={true}
      />
    </section>
  );
}

// =====================================================
// 15. 快速笔记
// =====================================================

function QuickNotesSection({ data }: { data: QuickNotesData }) {
  // 检查是否有有效数据
  const hasContent =
    (data.formulas && data.formulas.length > 0) ||
    (data.key_points && data.key_points.length > 0) ||
    (data.common_mistakes && data.common_mistakes.length > 0) ||
    (data.exam_tips && data.exam_tips.length > 0);

  if (!hasContent) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-500 rounded-xl text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">考前速记卡</h3>
      </div>
      <QuickNotesCard
        data={data}
        title="快速笔记"
        defaultExpanded={["formulas", "key_points", "mistakes", "tips"]}
      />
    </section>
  );
}

// =====================================================
// 16. 分段内容补充
// =====================================================

const sectionTypeLabelMap: Record<string, string> = {
  intro: "导入",
  theory: "理论",
  method: "方法",
  warning: "警示",
  summary: "总结",
};

function getSectionTypeLabel(type: string) {
  return sectionTypeLabelMap[type] || type;
}

function LessonSectionsOverview({ sections }: { sections: LessonSection[] }) {
  const supplementalSections = sections.filter(
    (section) => section.section_type !== "example" && section.section_type !== "drill"
  );
  if (supplementalSections.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-stone-700 rounded-xl text-white">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">章节内容补充</h3>
        <span className="ml-auto text-sm text-stone-500">{supplementalSections.length} 个分段</span>
      </div>
      <div className="space-y-4">
        {supplementalSections.map((section) => (
          <div
            key={`${section.section_type}-${section.order}`}
            className="p-4 bg-stone-50 rounded-xl border border-stone-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-xs">
                {getSectionTypeLabel(section.section_type)}
              </span>
              <h4 className="font-semibold text-stone-900">{section.title}</h4>
              {section.duration && (
                <span className="ml-auto text-xs text-stone-500">时长：{section.duration}</span>
              )}
            </div>
            {section.content && (
              <p className="text-stone-700 whitespace-pre-line">{section.content}</p>
            )}
            {section.key_points && section.key_points.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {section.key_points.map((point, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white rounded text-xs text-stone-600">
                    {point}
                  </span>
                ))}
              </div>
            )}
            {section.concept_map && (
              <div className="mt-3 p-3 bg-white rounded text-sm text-stone-600 whitespace-pre-line">
                <span className="font-medium text-stone-700">概念图：</span>
                {section.concept_map}
              </div>
            )}
            {section.flowchart && (
              <div className="mt-3 p-3 bg-white rounded text-sm text-stone-600 whitespace-pre-line">
                <span className="font-medium text-stone-700">流程图：</span>
                {section.flowchart}
              </div>
            )}
            {section.mind_map && (
              <div className="mt-3 p-3 bg-white rounded text-sm text-stone-600 whitespace-pre-line">
                <span className="font-medium text-stone-700">思维导图：</span>
                {section.mind_map}
              </div>
            )}
            {section.traps && section.traps.length > 0 && (
              <div className="mt-3 space-y-2">
                {section.traps.map((trap, idx) => (
                  <div key={idx} className="p-3 bg-red-50 rounded text-sm text-stone-700">
                    <p className="font-medium text-red-700">{trap.name}</p>
                    <p className="mt-1">{trap.description}</p>
                    {trap.case && <p className="mt-1 text-red-600">案例：{trap.case}</p>}
                    <p className="mt-1 text-emerald-700">应对：{trap.solution}</p>
                  </div>
                ))}
              </div>
            )}
            {section.key_takeaways && section.key_takeaways.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-stone-700 mb-2">关键收获</p>
                <ul className="space-y-1 text-sm text-stone-600">
                  {section.key_takeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-stone-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {section.next_lesson_preview && (
              <div className="mt-3 p-3 bg-white rounded text-sm text-stone-600">
                <span className="font-medium text-stone-700">下一课预告：</span>
                {section.next_lesson_preview}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default LessonContentRenderer;
