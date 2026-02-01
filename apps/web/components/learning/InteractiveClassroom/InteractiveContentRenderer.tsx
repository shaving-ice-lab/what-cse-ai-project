"use client";

import React, { useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  BookOpen,
  Target,
  Lightbulb,
  ListOrdered,
  Brain,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  ClipboardList,
  BookMarked,
  Layers,
  CheckCircle,
  Map,
} from "lucide-react";
import { ClassroomProvider, useClassroom, Section, SectionType } from "./ClassroomContext";
import { ClassroomSidebar } from "./ClassroomSidebar";
import { ClassroomToolbar } from "./ClassroomToolbar";
import {
  ClassroomSlideViewer,
  SectionHeader,
  ContentCard,
  StepReveal,
} from "./ClassroomSlideViewer";
import { ConceptCardGrid, ProgressiveReveal, FormulaCard, MistakeCard } from "./InteractiveCards";
import { InteractiveQuiz, QuickCheck } from "./InteractiveQuiz";
import {
  LessonContent,
  ExamAnalysis,
  CoreConcept,
  MethodStep,
  Formula,
  CommonMistake,
  PracticeProblem,
  Homework,
} from "../LessonContentRenderer";
import { MermaidRenderer } from "../MermaidRenderer";
import { QuickNotesCard } from "../QuickNotesCard";
import { cn } from "@/lib/utils";

// =====================================================
// 图标映射
// =====================================================

const sectionIcons: Record<SectionType, React.ReactNode> = {
  exam_analysis: <TrendingUp className="w-6 h-6 text-blue-600" />,
  introduction: <BookOpen className="w-6 h-6 text-emerald-600" />,
  learning_goals: <Target className="w-6 h-6 text-amber-600" />,
  prerequisites: <BookOpen className="w-6 h-6 text-stone-600" />,
  core_concepts: <Lightbulb className="w-6 h-6 text-purple-600" />,
  method_steps: <ListOrdered className="w-6 h-6 text-cyan-600" />,
  formulas: <Brain className="w-6 h-6 text-amber-600" />,
  memory_tips: <Sparkles className="w-6 h-6 text-emerald-600" />,
  examples: <GraduationCap className="w-6 h-6 text-indigo-600" />,
  common_mistakes: <AlertTriangle className="w-6 h-6 text-red-600" />,
  exam_strategies: <Target className="w-6 h-6 text-emerald-600" />,
  real_exam_drills: <GraduationCap className="w-6 h-6 text-teal-600" />,
  practice: <ClipboardList className="w-6 h-6 text-violet-600" />,
  vocabulary: <BookMarked className="w-6 h-6 text-pink-600" />,
  extension: <Layers className="w-6 h-6 text-slate-600" />,
  summary: <CheckCircle className="w-6 h-6 text-emerald-600" />,
  mind_map: <Map className="w-6 h-6 text-teal-600" />,
  quick_notes: <Sparkles className="w-6 h-6 text-amber-600" />,
  homework: <ClipboardList className="w-6 h-6 text-blue-600" />,
};

// =====================================================
// 章节内容组件
// =====================================================

interface SectionContentProps {
  content: LessonContent;
}

function SectionContent({ content }: SectionContentProps) {
  const { currentSection, markSectionComplete } = useClassroom();
  const { exam_analysis, lesson_content, lesson_sections, practice_problems, homework } = content;

  // 自动标记查看过的章节
  useEffect(() => {
    if (currentSection) {
      // 延迟标记，确保用户真的看了内容
      const timer = setTimeout(() => {
        markSectionComplete(currentSection.id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentSection, markSectionComplete]);

  if (!currentSection) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        请选择一个章节开始学习
      </div>
    );
  }

  // 根据当前章节类型渲染不同内容
  switch (currentSection.type) {
    case "exam_analysis":
      return exam_analysis ? <ExamAnalysisSection data={exam_analysis} /> : null;

    case "introduction":
      return lesson_content?.introduction ? (
        <IntroductionSection introduction={lesson_content.introduction} />
      ) : null;

    case "learning_goals":
      return lesson_content?.learning_goals ? (
        <LearningGoalsSection goals={lesson_content.learning_goals} />
      ) : null;

    case "prerequisites":
      return lesson_content?.prerequisites ? (
        <PrerequisitesSection prerequisites={lesson_content.prerequisites} />
      ) : null;

    case "core_concepts":
      return lesson_content?.core_concepts ? (
        <CoreConceptsSection concepts={lesson_content.core_concepts} />
      ) : null;

    case "method_steps":
      return lesson_content?.method_steps ? (
        <MethodStepsSection steps={lesson_content.method_steps} />
      ) : null;

    case "formulas":
      return lesson_content?.formulas ? (
        <FormulasSection formulas={lesson_content.formulas} />
      ) : null;

    case "memory_tips":
      return lesson_content?.memory_tips ? (
        <MemoryTipsSection tips={lesson_content.memory_tips} />
      ) : null;

    case "common_mistakes":
      return lesson_content?.common_mistakes ? (
        <CommonMistakesSection mistakes={lesson_content.common_mistakes} />
      ) : null;

    case "exam_strategies":
      return lesson_content?.exam_strategies ? (
        <ExamStrategiesSection strategies={lesson_content.exam_strategies} />
      ) : null;

    case "practice":
      return practice_problems ? <PracticeSection problems={practice_problems} /> : null;

    case "vocabulary":
      return lesson_content?.vocabulary_accumulation ? (
        <VocabularySection vocabulary={lesson_content.vocabulary_accumulation} />
      ) : null;

    case "extension":
      return lesson_content?.extension_knowledge ? (
        <ExtensionSection content={lesson_content.extension_knowledge} />
      ) : null;

    case "summary":
      return lesson_content?.summary_points ? (
        <SummarySection points={lesson_content.summary_points} />
      ) : null;

    case "mind_map":
      return lesson_content?.mind_map_mermaid ? (
        <MindMapSection mermaidCode={lesson_content.mind_map_mermaid} />
      ) : null;

    case "quick_notes":
      return lesson_content?.quick_notes ? (
        <QuickNotesSection data={lesson_content.quick_notes} />
      ) : null;

    case "homework":
      return homework ? <HomeworkSection homework={homework} /> : null;

    default:
      return <div className="text-center py-12 text-stone-500">该章节内容正在准备中...</div>;
  }
}

// =====================================================
// 各章节内容渲染
// =====================================================

function ExamAnalysisSection({ data }: { data: ExamAnalysis }) {
  const items = [];
  if (data.score_weight) {
    items.push({ label: "分值占比", content: data.score_weight, highlight: true });
  }
  if (data.difficulty_trend) {
    items.push({ label: "难度趋势", content: data.difficulty_trend });
  }
  if (data.recent_trends) {
    items.push({ label: "近年趋势", content: data.recent_trends });
  }
  if (data.exam_forms) {
    items.push({ label: "考查形式", content: data.exam_forms.join("、") });
  }
  if (data.key_patterns) {
    items.push({ label: "命题规律", content: data.key_patterns.join("、"), highlight: true });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.exam_analysis}
        title="考情分析"
        subtitle="了解本知识点的考试特点和命题趋势"
        badge={data.frequency || "高频考点"}
        badgeColor="bg-blue-100 text-blue-700"
      />

      <ContentCard variant="info" className="mb-6">
        <p className="text-stone-700 leading-relaxed text-lg">{data.description}</p>
      </ContentCard>

      {items.length > 0 && <ProgressiveReveal items={items} title="考情要点" />}
    </div>
  );
}

function IntroductionSection({ introduction }: { introduction: string }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.introduction}
        title="课程导入"
        subtitle="建立知识框架，明确学习方向"
      />

      <ContentCard>
        <div className="prose prose-stone prose-lg max-w-none">
          <p className="text-stone-700 leading-relaxed whitespace-pre-line">{introduction}</p>
        </div>
      </ContentCard>
    </div>
  );
}

function LearningGoalsSection({ goals }: { goals: string[] }) {
  const items = goals.map((goal, idx) => ({
    label: `目标 ${idx + 1}`,
    content: goal,
    highlight: idx === 0,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.learning_goals}
        title="学习目标"
        subtitle="明确本节课的学习重点"
        badge={`${goals.length} 个目标`}
      />

      <ProgressiveReveal items={items} />
    </div>
  );
}

function PrerequisitesSection({ prerequisites }: { prerequisites: string[] }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.prerequisites}
        title="前置知识"
        subtitle="学习本节内容前需要掌握的知识"
      />

      <ContentCard>
        <ul className="space-y-3">
          {prerequisites.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-stone-200 text-stone-700 rounded-full flex items-center justify-center text-sm font-medium">
                {idx + 1}
              </span>
              <span className="text-stone-700">{item}</span>
            </motion.li>
          ))}
        </ul>
      </ContentCard>
    </div>
  );
}

function CoreConceptsSection({ concepts }: { concepts: CoreConcept[] }) {
  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader
        icon={sectionIcons.core_concepts}
        title="核心概念"
        subtitle="点击卡片翻转查看详细解释"
        badge={`${concepts.length} 个概念`}
        badgeColor="bg-purple-100 text-purple-700"
      />

      <ConceptCardGrid concepts={concepts} />

      <div className="mt-6 p-4 bg-purple-50 rounded-xl text-sm text-purple-700 text-center">
        💡 点击每张卡片可以翻转查看详细解释和应用场景
      </div>
    </div>
  );
}

function MethodStepsSection({ steps }: { steps: MethodStep[] }) {
  const formattedSteps = steps.map((step) => ({
    title: step.title,
    content: step.content,
    tips: step.tips,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.method_steps}
        title="方法步骤"
        subtitle="按步骤学习解题方法"
        badge={`${steps.length} 个步骤`}
        badgeColor="bg-cyan-100 text-cyan-700"
      />

      <ContentCard>
        <StepReveal steps={formattedSteps} />
      </ContentCard>
    </div>
  );
}

function FormulasSection({ formulas }: { formulas: Formula[] }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.formulas}
        title="记忆口诀"
        subtitle="高效记忆的核心公式和口诀"
        badge={`${formulas.length} 条口诀`}
        badgeColor="bg-amber-100 text-amber-700"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {formulas.map((formula, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <FormulaCard
              name={formula.name}
              content={formula.content}
              explanation={formula.detailed_explanation}
              memoryAid={formula.memory_aid}
              examples={formula.examples}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MemoryTipsSection({ tips }: { tips: any[] }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.memory_tips}
        title="记忆技巧"
        subtitle="高效记忆的方法和窍门"
        badge={`${tips.length} 条技巧`}
        badgeColor="bg-emerald-100 text-emerald-700"
      />

      <div className="space-y-4">
        {tips.map((tip, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <ContentCard variant="success">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-semibold text-emerald-800 mb-2">{tip.tip}</h4>
                  <p className="text-stone-600">{tip.content}</p>
                  {tip.example && (
                    <div className="mt-2 p-2 bg-white/60 rounded text-sm text-emerald-700">
                      示例：{tip.example}
                    </div>
                  )}
                </div>
              </div>
            </ContentCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CommonMistakesSection({ mistakes }: { mistakes: CommonMistake[] }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.common_mistakes}
        title="易错陷阱"
        subtitle="避免常见错误，提高答题准确率"
        badge={`${mistakes.length} 个易错点`}
        badgeColor="bg-red-100 text-red-700"
      />

      <div className="space-y-4">
        {mistakes.map((mistake, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <MistakeCard
              mistake={mistake.mistake}
              reason={mistake.reason}
              correction={mistake.correction}
              frequency={mistake.frequency}
              typicalCase={mistake.typical_case}
              prevention={mistake.prevention}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ExamStrategiesSection({ strategies }: { strategies: any[] }) {
  const items = strategies.map((s, idx) => ({
    label: s.strategy || `策略 ${idx + 1}`,
    content: s.content,
    highlight: idx === 0,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.exam_strategies}
        title="答题策略"
        subtitle="掌握高效的答题技巧"
        badge={`${strategies.length} 条策略`}
        badgeColor="bg-emerald-100 text-emerald-700"
      />

      <ProgressiveReveal items={items} title="策略要点" />
    </div>
  );
}

function PracticeSection({ problems }: { problems: PracticeProblem[] }) {
  const formattedProblems = problems.map((p, idx) => ({
    id: p.order || idx + 1,
    problem: p.problem,
    options: p.options,
    answer: p.answer,
    analysis: p.analysis,
    knowledge_point: p.knowledge_point,
    difficulty: p.difficulty_level || p.difficulty,
    time_suggestion: p.time_suggestion,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.practice}
        title="随堂练习"
        subtitle="检验学习效果，巩固知识点"
        badge={`${problems.length} 道题`}
        badgeColor="bg-violet-100 text-violet-700"
      />

      <InteractiveQuiz questions={formattedProblems} title="随堂练习" showTimer={true} />
    </div>
  );
}

function VocabularySection({ vocabulary }: { vocabulary: any }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.vocabulary}
        title="高频词汇"
        subtitle="掌握重要术语和专业词汇"
      />

      <ContentCard>
        <div className="space-y-6">
          {vocabulary.must_know && vocabulary.must_know.length > 0 && (
            <div>
              <h4 className="font-medium text-pink-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full" />
                必须掌握
              </h4>
              <div className="flex flex-wrap gap-2">
                {vocabulary.must_know.map((word: string, idx: number) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-4 py-2 bg-pink-100 text-pink-800 rounded-xl text-sm font-medium"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          {vocabulary.should_know && vocabulary.should_know.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                应该了解
              </h4>
              <div className="flex flex-wrap gap-2">
                {vocabulary.should_know.map((word: string, idx: number) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-4 py-2 bg-orange-100 text-orange-800 rounded-xl text-sm font-medium"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          {vocabulary.nice_to_know && vocabulary.nice_to_know.length > 0 && (
            <div>
              <h4 className="font-medium text-stone-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-stone-400 rounded-full" />
                可以了解
              </h4>
              <div className="flex flex-wrap gap-2">
                {vocabulary.nice_to_know.map((word: string, idx: number) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-sm"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ContentCard>
    </div>
  );
}

function ExtensionSection({ content }: { content: string }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader icon={sectionIcons.extension} title="拓展知识" subtitle="深入了解相关知识点" />

      <ContentCard>
        <div className="prose prose-stone max-w-none">
          <p className="text-stone-700 leading-relaxed whitespace-pre-line">{content}</p>
        </div>
      </ContentCard>
    </div>
  );
}

function SummarySection({ points }: { points: string[] }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        icon={sectionIcons.summary}
        title="课程总结"
        subtitle="回顾本节重点内容"
        badge={`${points.length} 个要点`}
        badgeColor="bg-emerald-100 text-emerald-700"
      />

      <ContentCard variant="success">
        <ul className="space-y-4">
          {points.map((point, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4"
            >
              <span className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <span className="text-stone-700 pt-1">{point}</span>
            </motion.li>
          ))}
        </ul>
      </ContentCard>
    </div>
  );
}

function MindMapSection({ mermaidCode }: { mermaidCode: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader icon={sectionIcons.mind_map} title="思维导图" subtitle="可视化知识结构" />

      <ContentCard>
        <MermaidRenderer
          code={mermaidCode}
          title="知识结构图"
          allowFullscreen={true}
          allowDownload={true}
        />
      </ContentCard>
    </div>
  );
}

function QuickNotesSection({ data }: { data: any }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader icon={sectionIcons.quick_notes} title="考前速记" subtitle="快速复习核心内容" />

      <QuickNotesCard
        data={data}
        title="考前速记卡"
        defaultExpanded={["formulas", "key_points", "mistakes", "tips"]}
      />
    </div>
  );
}

function HomeworkSection({ homework }: { homework: Homework }) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader icon={sectionIcons.homework} title="课后作业" subtitle="巩固练习，加深理解" />

      <ContentCard>
        <div className="space-y-6">
          {homework.required && homework.required.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-100 rounded text-xs">必做</span>
                必做作业
              </h4>
              <ul className="space-y-2">
                {homework.required.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-stone-700">
                    <span className="text-red-400">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {homework.optional && homework.optional.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">选做</span>
                选做作业
              </h4>
              <ul className="space-y-2">
                {homework.optional.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-stone-700">
                    <span className="text-blue-400">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {homework.thinking_questions && homework.thinking_questions.length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-100 rounded text-xs">思考</span>
                思考题
              </h4>
              <ul className="space-y-2">
                {homework.thinking_questions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-stone-700">
                    <span className="text-purple-400">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {homework.preview && (
            <div className="p-4 bg-stone-50 rounded-xl">
              <h4 className="font-semibold text-stone-700 mb-2">预习任务</h4>
              <p className="text-stone-600">{homework.preview}</p>
            </div>
          )}
        </div>
      </ContentCard>
    </div>
  );
}

// =====================================================
// 主组件
// =====================================================

interface InteractiveContentRendererProps {
  content: LessonContent;
  courseTitle?: string;
  chapterTitle?: string;
  onBack?: () => void;
  onProgressUpdate?: (progress: any) => void;
}

export function InteractiveContentRenderer({
  content,
  courseTitle,
  chapterTitle,
  onBack,
  onProgressUpdate,
}: InteractiveContentRendererProps) {
  // 根据内容生成章节列表
  const sections = useMemo(() => {
    const result: Section[] = [];
    const { exam_analysis, lesson_content, practice_problems, homework } = content;

    if (exam_analysis) {
      result.push({ id: "exam_analysis", title: "考情分析", type: "exam_analysis", duration: 3 });
    }

    if (lesson_content?.introduction) {
      result.push({ id: "introduction", title: "课程导入", type: "introduction", duration: 2 });
    }

    if (lesson_content?.learning_goals && lesson_content.learning_goals.length > 0) {
      result.push({ id: "learning_goals", title: "学习目标", type: "learning_goals", duration: 2 });
    }

    if (lesson_content?.prerequisites && lesson_content.prerequisites.length > 0) {
      result.push({ id: "prerequisites", title: "前置知识", type: "prerequisites", duration: 2 });
    }

    if (lesson_content?.core_concepts && lesson_content.core_concepts.length > 0) {
      result.push({ id: "core_concepts", title: "核心概念", type: "core_concepts", duration: 5 });
    }

    if (lesson_content?.method_steps && lesson_content.method_steps.length > 0) {
      result.push({ id: "method_steps", title: "方法步骤", type: "method_steps", duration: 5 });
    }

    if (lesson_content?.formulas && lesson_content.formulas.length > 0) {
      result.push({ id: "formulas", title: "记忆口诀", type: "formulas", duration: 4 });
    }

    if (lesson_content?.memory_tips && lesson_content.memory_tips.length > 0) {
      result.push({ id: "memory_tips", title: "记忆技巧", type: "memory_tips", duration: 3 });
    }

    if (lesson_content?.common_mistakes && lesson_content.common_mistakes.length > 0) {
      result.push({
        id: "common_mistakes",
        title: "易错陷阱",
        type: "common_mistakes",
        duration: 4,
      });
    }

    if (lesson_content?.exam_strategies && lesson_content.exam_strategies.length > 0) {
      result.push({
        id: "exam_strategies",
        title: "答题策略",
        type: "exam_strategies",
        duration: 3,
      });
    }

    if (practice_problems && practice_problems.length > 0) {
      result.push({ id: "practice", title: "随堂练习", type: "practice", duration: 8 });
    }

    if (lesson_content?.vocabulary_accumulation) {
      result.push({ id: "vocabulary", title: "高频词汇", type: "vocabulary", duration: 3 });
    }

    if (lesson_content?.extension_knowledge) {
      result.push({ id: "extension", title: "拓展知识", type: "extension", duration: 3 });
    }

    if (lesson_content?.summary_points && lesson_content.summary_points.length > 0) {
      result.push({ id: "summary", title: "课程总结", type: "summary", duration: 2 });
    }

    if (lesson_content?.mind_map_mermaid) {
      result.push({ id: "mind_map", title: "思维导图", type: "mind_map", duration: 2 });
    }

    if (lesson_content?.quick_notes) {
      result.push({ id: "quick_notes", title: "考前速记", type: "quick_notes", duration: 2 });
    }

    if (homework) {
      result.push({ id: "homework", title: "课后作业", type: "homework", duration: 2 });
    }

    return result;
  }, [content]);

  return (
    <ClassroomProvider initialSections={sections} onProgressUpdate={onProgressUpdate}>
      <div className="h-screen flex bg-stone-100 overflow-hidden">
        {/* 侧边栏 */}
        <ClassroomSidebar courseTitle={courseTitle} chapterTitle={chapterTitle} onBack={onBack} />

        {/* 主内容区 */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* 顶部工具栏 */}
          <header className="flex-shrink-0 bg-white border-b border-stone-200 px-4 lg:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="font-bold text-stone-800 truncate max-w-[300px]">
                  {chapterTitle || "课程学习"}
                </h1>
                <p className="text-sm text-stone-500">{courseTitle}</p>
              </div>
            </div>
            <ClassroomToolbar />
          </header>

          {/* 幻灯片内容 */}
          <ClassroomSlideViewer showNavigation showProgressDots autoMarkComplete>
            <SectionContent content={content} />
          </ClassroomSlideViewer>
        </main>
      </div>
    </ClassroomProvider>
  );
}

export default InteractiveContentRenderer;
