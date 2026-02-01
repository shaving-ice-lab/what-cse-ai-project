"use client";

import React, { useEffect, useRef, useState } from "react";
import { Badge, Separator } from "@what-cse/ui";
import { cn } from "@what-cse/ui";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Flame,
  GraduationCap,
  Lightbulb,
  ListChecks,
  AlertTriangle,
  Target,
  Clock,
  BookMarked,
  Sparkles,
  Zap,
  Info,
  Award,
  BookText,
  HelpCircle,
  BarChart3,
  TrendingUp,
  FileQuestion,
  MapPin,
  Star,
} from "lucide-react";
import mermaid from "mermaid";

type UnknownRecord = Record<string, unknown>;

const isNonEmptyArray = (value?: unknown[]): value is unknown[] =>
  Array.isArray(value) && value.length > 0;

const isNonEmptyString = (value?: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const moduleTypeLabels: Record<string, string> = {
  exam_analysis: "考情分析",
  introduction: "课程导入",
  core_concepts: "核心概念",
  method_steps: "方法步骤",
  formulas: "记忆口诀",
  memory_tips: "记忆技巧",
  mistakes: "易错陷阱",
  common_mistakes: "易错陷阱",
  exam_strategies: "应试策略",
  vocabulary: "高频词汇",
  vocabulary_accumulation: "高频词汇",
  extension: "拓展知识",
  summary: "课程总结",
  mind_map: "思维导图",
  quick_notes: "快速笔记",
  lesson_sections: "课程章节",
  practice: "练习题目",
  practice_problems: "练习题目",
  homework: "课后作业",
  examples: "精讲例题",
  drills: "真题演练",
};

const formatJSON = (value: unknown): string => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value ?? "");
  }
};

const PREVIEW_THEME = {
  "--preview-accent": "#7c3aed",
  "--preview-accent-soft": "rgba(124,58,237,0.14)",
  "--preview-accent-strong": "rgba(124,58,237,0.28)",
  "--preview-heading-font": '"Noto Serif SC", "STSong", "Songti SC", serif',
  "--preview-body-font": '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif',
} as React.CSSProperties;

// Mermaid Diagram Component
function MermaidDiagram({ code, id }: { code: string; id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          fontFamily: "inherit",
        });

        const { svg } = await mermaid.render(`mermaid-${id}`, code);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch (err: any) {
        console.error("Mermaid render error:", err);
        setError(err?.message || "图表渲染失败");
      }
    };

    renderDiagram();
  }, [code, id]);

  if (error) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-amber-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          图表渲染失败，显示原始代码
        </div>
        <pre className="text-xs whitespace-pre-wrap break-words bg-muted/50 rounded-md p-3 overflow-x-auto">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-muted/30 rounded-md p-3 overflow-x-auto",
        !rendered && "min-h-[80px] flex items-center justify-center text-muted-foreground text-sm"
      )}
    >
      {!rendered && "正在渲染图表..."}
    </div>
  );
}

// Styled list component
const StyledList = ({
  items,
  icon: Icon,
  iconColor = "text-primary",
}: {
  items?: unknown[];
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}) => {
  if (!isNonEmptyArray(items)) return null;
  const IconComponent = Icon || CheckCircle2;
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <span className="mt-0.5 h-5 w-5 rounded-full bg-[var(--preview-accent-soft)]/70 flex items-center justify-center flex-shrink-0">
            <IconComponent className={cn("h-3.5 w-3.5", iconColor)} />
          </span>
          <span className="text-slate-700 dark:text-slate-200/90 leading-relaxed">
            {String(item)}
          </span>
        </li>
      ))}
    </ul>
  );
};

// Numbered list component
const NumberedList = ({ items }: { items?: unknown[] }) => {
  if (!isNonEmptyArray(items)) return null;
  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--preview-accent-soft)] text-[var(--preview-accent)] text-xs font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-slate-700 dark:text-slate-200/90 pt-0.5 leading-relaxed">
            {String(item)}
          </span>
        </li>
      ))}
    </ol>
  );
};

// Paragraph component
const Paragraph = ({ value, className }: { value?: unknown; className?: string }) => {
  if (!isNonEmptyString(value)) return null;
  return (
    <p
      className={cn(
        "text-[15px] text-slate-700 dark:text-slate-200/90 leading-relaxed whitespace-pre-wrap",
        className
      )}
    >
      {value}
    </p>
  );
};

// Key-Value display
const KeyValue = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: unknown;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  if (!isNonEmptyString(value) && typeof value !== "number") return null;
  return (
    <div className="flex items-center gap-2 text-sm rounded-full border border-[var(--preview-accent-soft)]/60 bg-white/70 dark:bg-slate-900/40 px-3 py-1">
      {Icon && <Icon className="h-3.5 w-3.5 text-[var(--preview-accent)]" />}
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="font-semibold text-slate-900 dark:text-slate-100">{String(value)}</span>
    </div>
  );
};

// Section Header
const SectionHeader = ({
  title,
  icon: Icon,
  iconColor = "text-primary",
  badge,
  collapsible = false,
  isOpen = true,
  onToggle,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  badge?: string;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) => {
  const IconComponent = Icon || BookOpen;
  const content = (
    <div className="flex items-center gap-3">
      <span className="h-8 w-1 rounded-full bg-gradient-to-b from-[var(--preview-accent)] to-sky-400" />
      <div className="h-8 w-8 rounded-lg bg-[var(--preview-accent-soft)] flex items-center justify-center shadow-sm">
        <IconComponent className={cn("h-4 w-4", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-semibold tracking-wide text-foreground"
            style={{ fontFamily: "var(--preview-heading-font)" }}
          >
            {title}
          </h3>
          {badge && (
            <Badge variant="secondary" className="text-[10px] tracking-wide">
              {badge}
            </Badge>
          )}
        </div>
        <div className="mt-1 h-px w-16 bg-gradient-to-r from-[var(--preview-accent)] to-transparent" />
      </div>
      {collapsible && (
        <span className="ml-auto">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      )}
    </div>
  );

  if (collapsible && onToggle) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left py-2 hover:bg-[var(--preview-accent-soft)]/40 rounded-lg px-2 -mx-2 transition-colors"
      >
        {content}
      </button>
    );
  }

  return <div className="py-2">{content}</div>;
};

// Info block
const InfoBlock = ({
  title,
  content,
  variant = "default",
}: {
  title?: string;
  content?: string;
  variant?: "default" | "warning" | "success" | "info";
}) => {
  if (!isNonEmptyString(content)) return null;
  const variantStyles = {
    default:
      "bg-white/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 border-l-[var(--preview-accent)]",
    warning:
      "bg-amber-50/60 dark:bg-amber-900/10 border-amber-200/60 dark:border-amber-800/40 border-l-amber-500",
    success:
      "bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-200/60 dark:border-emerald-800/40 border-l-emerald-500",
    info: "bg-sky-50/60 dark:bg-sky-900/10 border-sky-200/60 dark:border-sky-800/40 border-l-sky-500",
  };
  return (
    <div
      className={cn("rounded-xl p-3 border border-l-4 text-sm shadow-sm", variantStyles[variant])}
    >
      {title && (
        <div className="font-medium text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          {title}
        </div>
      )}
      <p className="text-slate-700 dark:text-slate-200/90 whitespace-pre-wrap">{content}</p>
    </div>
  );
};

// Content block with title
const ContentBlock = ({
  title,
  children,
  icon: Icon,
  iconColor = "text-muted-foreground",
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}) => {
  const IconComponent = Icon;
  return (
    <div className="rounded-xl border border-[var(--preview-accent-soft)]/70 bg-white/70 dark:bg-slate-900/40 p-3 space-y-2 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        {IconComponent && <IconComponent className={cn("h-3.5 w-3.5", iconColor)} />}
        <h4 className="font-medium">{title}</h4>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

// Concept item
const ConceptItem = ({ concept, index }: { concept: UnknownRecord; index: number }) => (
  <div className="py-3 space-y-2">
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="text-xs bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
      >
        概念 {index + 1}
      </Badge>
      <span className="font-medium text-sm">{String(concept.name || "")}</span>
    </div>
    <Paragraph value={concept.definition} />
    <Paragraph value={concept.detailed_explanation} />
    {isNonEmptyArray(concept.application_scenarios) && (
      <StyledList
        items={concept.application_scenarios}
        icon={MapPin}
        iconColor="text-emerald-500"
      />
    )}
    {isNonEmptyString(concept.example) && (
      <InfoBlock title="示例" content={concept.example as string} variant="info" />
    )}
    {isNonEmptyArray(concept.common_pairs) && (
      <div className="flex flex-wrap gap-1.5">
        {(concept.common_pairs as string[]).map((pair, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {pair}
          </Badge>
        ))}
      </div>
    )}
    {isNonEmptyString(concept.tips) && (
      <InfoBlock title="技巧" content={concept.tips as string} variant="success" />
    )}
  </div>
);

// Method step item
const MethodStepItem = ({ step, index }: { step: UnknownRecord; index: number }) => (
  <div className="py-3 space-y-2">
    <div className="flex items-center gap-2">
      <Badge className="bg-blue-500 hover:bg-blue-500 text-xs">
        步骤 {(step.step as number) ?? index + 1}
      </Badge>
      <span className="font-medium text-sm">{String(step.title || "")}</span>
      {isNonEmptyString(step.time_allocation) && (
        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
          <Clock className="h-3 w-3" />
          {step.time_allocation}
        </span>
      )}
    </div>
    <Paragraph value={step.content} />
    {isNonEmptyString(step.tips) && (
      <InfoBlock title="技巧" content={step.tips as string} variant="success" />
    )}
    {isNonEmptyString(step.common_errors) && (
      <InfoBlock title="常见错误" content={step.common_errors as string} variant="warning" />
    )}
    {isNonEmptyArray(step.key_signals) && (
      <StyledList items={step.key_signals} icon={Zap} iconColor="text-amber-500" />
    )}
    {isNonEmptyString(step.analysis_order) && (
      <InfoBlock title="分析顺序" content={step.analysis_order as string} variant="info" />
    )}
    {isNonEmptyArray(step.verification_checklist) && (
      <StyledList
        items={step.verification_checklist}
        icon={CheckCircle2}
        iconColor="text-emerald-500"
      />
    )}
  </div>
);

// Formula item
const FormulaItem = ({ formula, index }: { formula: UnknownRecord; index: number }) => (
  <div className="py-3 space-y-2">
    <div className="flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-amber-500" />
      <span className="font-medium text-sm">{String(formula.name || `公式 ${index + 1}`)}</span>
    </div>
    <div className="bg-muted/30 rounded-md p-2 font-mono text-sm">
      {String(formula.content || "")}
    </div>
    <Paragraph value={formula.detailed_explanation} />
    <Paragraph value={formula.memory_aid} className="text-emerald-600 dark:text-emerald-400" />
    {isNonEmptyArray(formula.examples) && (
      <StyledList items={formula.examples} iconColor="text-amber-500" />
    )}
  </div>
);

// Memory tip item
const MemoryTipItem = ({ tip, index }: { tip: UnknownRecord; index: number }) => (
  <div className="py-3 space-y-2">
    <div className="flex items-center gap-2">
      <Brain className="h-4 w-4 text-teal-500" />
      <span className="font-medium text-sm">{String(tip.tip || `技巧 ${index + 1}`)}</span>
    </div>
    <Paragraph value={tip.content} />
    {isNonEmptyString(tip.example) && (
      <InfoBlock title="示例" content={tip.example as string} variant="info" />
    )}
    {isNonEmptyArray(tip.word_pairs) && (
      <div className="flex flex-wrap gap-1.5">
        {(tip.word_pairs as string[]).map((pair, i) => (
          <Badge key={i} variant="outline" className="text-xs">
            {pair}
          </Badge>
        ))}
      </div>
    )}
  </div>
);

// Mistake item
const MistakeItem = ({ mistake, index }: { mistake: UnknownRecord; index: number }) => (
  <div className="py-3 space-y-2">
    <div className="flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-red-500" />
      <span className="font-medium text-sm">
        {String(mistake.mistake || `易错点 ${index + 1}`)}
      </span>
      {isNonEmptyString(mistake.frequency) && (
        <Badge variant="outline" className="text-xs border-red-200 text-red-600">
          {mistake.frequency}
        </Badge>
      )}
    </div>
    {isNonEmptyString(mistake.reason) && (
      <InfoBlock title="原因" content={mistake.reason as string} variant="warning" />
    )}
    {isNonEmptyString(mistake.typical_case) && (
      <InfoBlock title="典型案例" content={mistake.typical_case as string} />
    )}
    {isNonEmptyString(mistake.correction) && (
      <InfoBlock title="纠正方法" content={mistake.correction as string} variant="success" />
    )}
    {isNonEmptyString(mistake.prevention) && (
      <InfoBlock title="预防措施" content={mistake.prevention as string} variant="info" />
    )}
  </div>
);

// Strategy item
const StrategyItem = ({ strategy, index }: { strategy: UnknownRecord; index: number }) => (
  <div className="py-2 space-y-1.5">
    <div className="flex items-center gap-2">
      <Award className="h-4 w-4 text-indigo-500" />
      <span className="font-medium text-sm">
        {String(strategy.strategy || `策略 ${index + 1}`)}
      </span>
    </div>
    <Paragraph value={strategy.content} />
  </div>
);

// Example item
const ExampleItem = ({ example, index }: { example: UnknownRecord; index: number }) => (
  <div className="py-3 space-y-2 border-l-2 border-primary/30 pl-3">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <span className="font-medium text-sm">{String(example.title || `例题 ${index + 1}`)}</span>
      <div className="flex items-center gap-1.5">
        {isNonEmptyString(example.source) && (
          <Badge variant="outline" className="text-xs">
            {example.source}
          </Badge>
        )}
        {isNonEmptyString(example.difficulty) && (
          <Badge
            className={cn(
              "text-xs",
              example.difficulty === "简单" && "bg-emerald-500",
              example.difficulty === "中等" && "bg-amber-500",
              example.difficulty === "困难" && "bg-red-500"
            )}
          >
            {example.difficulty}
          </Badge>
        )}
      </div>
    </div>
    <div className="bg-muted/30 rounded-md p-2.5 text-sm">
      <Paragraph value={example.problem} />
    </div>
    {isNonEmptyString(example.context_analysis) && (
      <InfoBlock title="语境分析" content={example.context_analysis as string} variant="info" />
    )}
    {isNonEmptyString(example.thinking_process) && (
      <ContentBlock title="解题思路" icon={Brain} iconColor="text-violet-500">
        <Paragraph value={example.thinking_process} />
      </ContentBlock>
    )}
    {example.option_analysis && typeof example.option_analysis === "object" && (
      <div className="space-y-1">
        {Object.entries(example.option_analysis as Record<string, unknown>).map(([key, val]) => (
          <div key={key} className="text-sm flex gap-2">
            <span className="font-semibold text-primary">{key}.</span>
            <span className="text-muted-foreground">{String(val)}</span>
          </div>
        ))}
      </div>
    )}
    {isNonEmptyString(example.answer) && (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <span className="text-sm">答案：</span>
        <Badge className="bg-emerald-500">{example.answer}</Badge>
      </div>
    )}
    {isNonEmptyString(example.key_technique) && (
      <InfoBlock title="关键技巧" content={example.key_technique as string} variant="success" />
    )}
  </div>
);

// Practice problem item
const PracticeProblemItem = ({ problem, index }: { problem: UnknownRecord; index: number }) => (
  <div className="py-3 space-y-2">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <Badge className="bg-primary text-xs">题目 {(problem.order as number) ?? index + 1}</Badge>
        {isNonEmptyString(problem.difficulty) && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              problem.difficulty === "简单" && "border-emerald-500 text-emerald-600",
              problem.difficulty === "中等" && "border-amber-500 text-amber-600",
              problem.difficulty === "困难" && "border-red-500 text-red-600"
            )}
          >
            {problem.difficulty}
          </Badge>
        )}
      </div>
      {isNonEmptyString(problem.knowledge_point) && (
        <Badge variant="secondary" className="text-xs">
          {problem.knowledge_point}
        </Badge>
      )}
    </div>
    <div className="bg-muted/30 rounded-md p-2.5 text-sm">
      <Paragraph value={problem.problem} />
    </div>
    {isNonEmptyArray(problem.options) && (
      <div className="space-y-1 pl-2">
        {(problem.options as string[]).map((option, i) => (
          <div key={i} className="text-sm text-muted-foreground">
            {option}
          </div>
        ))}
      </div>
    )}
    {isNonEmptyString(problem.answer) && (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <span className="text-sm">答案：</span>
        <Badge className="bg-emerald-500">{problem.answer}</Badge>
      </div>
    )}
    {isNonEmptyString(problem.analysis) && (
      <InfoBlock title="解析" content={problem.analysis as string} variant="info" />
    )}
    <div className="flex flex-wrap gap-3 text-sm">
      <KeyValue label="建议用时" value={problem.time_suggestion} icon={Clock} />
      <KeyValue label="题型" value={problem.similar_type} icon={FileQuestion} />
    </div>
    {isNonEmptyString(problem.advanced_technique) && (
      <InfoBlock
        title="高阶技巧"
        content={problem.advanced_technique as string}
        variant="success"
      />
    )}
  </div>
);

// Section item for lesson sections
const LessonSectionItem = ({
  section,
  index,
  mermaidId,
}: {
  section: UnknownRecord;
  index: number;
  mermaidId: string;
}) => (
  <div className="py-3 space-y-3">
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="secondary" className="text-xs">
        #{(section.order as number) ?? index + 1}
      </Badge>
      {isNonEmptyString(section.section_type) && (
        <Badge variant="outline" className="text-xs">
          {section.section_type}
        </Badge>
      )}
      <span className="font-medium text-sm">{String(section.title || `章节 ${index + 1}`)}</span>
      {isNonEmptyString(section.duration) && (
        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
          <Clock className="h-3 w-3" />
          {section.duration}
        </span>
      )}
    </div>

    <Paragraph value={section.content} />

    {isNonEmptyArray(section.key_points) && (
      <ContentBlock title="重点内容" icon={Target} iconColor="text-amber-500">
        <StyledList items={section.key_points} icon={Star} iconColor="text-amber-500" />
      </ContentBlock>
    )}

    {isNonEmptyString(section.concept_map) && (
      <ContentBlock title="概念图" icon={Brain} iconColor="text-violet-500">
        <MermaidDiagram code={section.concept_map as string} id={`${mermaidId}-concept-${index}`} />
      </ContentBlock>
    )}

    {isNonEmptyString(section.flowchart) && (
      <ContentBlock title="流程图" icon={ListChecks} iconColor="text-blue-500">
        <MermaidDiagram code={section.flowchart as string} id={`${mermaidId}-flowchart-${index}`} />
      </ContentBlock>
    )}

    {isNonEmptyArray(section.examples) && (
      <ContentBlock title="例题" icon={FileText} iconColor="text-emerald-500">
        <div className="space-y-2">
          {(section.examples as UnknownRecord[]).map((example, idx) => (
            <ExampleItem key={idx} example={example} index={idx} />
          ))}
        </div>
      </ContentBlock>
    )}

    {isNonEmptyArray(section.traps) && (
      <ContentBlock title="易错陷阱" icon={AlertTriangle} iconColor="text-red-500">
        <div className="space-y-2">
          {(section.traps as UnknownRecord[]).map((trap, idx) => (
            <div key={idx} className="py-2 space-y-1.5">
              <div className="font-medium text-sm">{String(trap.name || `陷阱 ${idx + 1}`)}</div>
              <Paragraph value={trap.description} />
              {isNonEmptyString(trap.case) && (
                <InfoBlock title="案例" content={trap.case as string} />
              )}
              {isNonEmptyString(trap.solution) && (
                <InfoBlock title="解决方案" content={trap.solution as string} variant="success" />
              )}
            </div>
          ))}
        </div>
      </ContentBlock>
    )}

    {isNonEmptyArray(section.real_exam_questions) && (
      <ContentBlock title="真题演练" icon={Award} iconColor="text-indigo-500">
        <div className="space-y-2">
          {(section.real_exam_questions as UnknownRecord[]).map((item, idx) => (
            <div key={idx} className="py-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {item.year}
                </Badge>
                {isNonEmptyString(item.time_limit) && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.time_limit}
                  </span>
                )}
              </div>
              <Paragraph value={item.problem} />
              {isNonEmptyString(item.answer) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">答案：</span>
                  <Badge className="bg-emerald-500">{item.answer}</Badge>
                </div>
              )}
              {isNonEmptyString(item.quick_analysis) && (
                <InfoBlock
                  title="快速分析"
                  content={item.quick_analysis as string}
                  variant="info"
                />
              )}
            </div>
          ))}
        </div>
      </ContentBlock>
    )}

    {isNonEmptyString(section.mind_map) && (
      <ContentBlock title="思维导图" icon={Brain} iconColor="text-violet-500">
        <MermaidDiagram code={section.mind_map as string} id={`${mermaidId}-mindmap-${index}`} />
      </ContentBlock>
    )}

    {isNonEmptyArray(section.key_takeaways) && (
      <ContentBlock title="要点总结" icon={Lightbulb} iconColor="text-amber-500">
        <StyledList
          items={section.key_takeaways}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
        />
      </ContentBlock>
    )}

    {isNonEmptyString(section.next_lesson_preview) && (
      <InfoBlock title="下节预告" content={section.next_lesson_preview as string} variant="info" />
    )}
  </div>
);

// Module Status Report Component - 模块状态报告组件
interface ModuleStatusInfo {
  name: string;
  present: boolean;
  required: boolean;
}

function ModuleStatusReport({
  presentModules,
  totalModules,
  missingRequired,
  missingOptional,
  moduleStatus,
}: {
  presentModules: number;
  totalModules: number;
  missingRequired: ModuleStatusInfo[];
  missingOptional: ModuleStatusInfo[];
  moduleStatus: Record<string, ModuleStatusInfo>;
}) {
  const [expanded, setExpanded] = useState(false);

  // 如果有缺失的必需模块，默认展开
  const hasIssues = missingRequired.length > 0;

  return (
    <div
      className={cn(
        "mt-3 rounded-2xl border shadow-sm",
        hasIssues
          ? "border-amber-300/70 bg-amber-50/60 dark:bg-amber-950/20"
          : "border-[var(--preview-accent-soft)]/60 bg-white/70 dark:bg-slate-900/40"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-sm hover:bg-[var(--preview-accent-soft)]/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {hasIssues ? (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          <span className="font-medium">
            模块生成状态：{presentModules}/{totalModules}
          </span>
          {missingRequired.length > 0 && (
            <Badge variant="destructive" className="text-xs ml-2">
              {missingRequired.length} 个必需模块缺失
            </Badge>
          )}
          {missingOptional.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {missingOptional.length} 个可选模块缺失
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(moduleStatus).map(([key, info]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-1.5 text-xs py-1 px-2 rounded",
                  info.present
                    ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : info.required
                      ? "text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400"
                      : "text-muted-foreground bg-muted/50"
                )}
              >
                {info.present ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                <span>{info.name}</span>
                {info.required && !info.present && (
                  <Badge variant="destructive" className="text-[10px] h-4 px-1">
                    必需
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {hasIssues && (
            <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 rounded p-2 mt-2">
              <strong>提示：</strong>部分必需模块未生成，可能原因：
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>内容尚未完全导入到数据库（检查是否开启了自动导入）</li>
                <li>LLM 生成过程中某些模块超时或返回格式错误导致任务失败</li>
                <li>尝试重新生成内容</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LessonContentPreview({ content }: { content: any }) {
  const mermaidIdRef = useRef(Math.random().toString(36).substring(7));

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <HelpCircle className="h-10 w-10 mb-2 opacity-50" />
        <p className="text-sm">暂无内容</p>
      </div>
    );
  }

  // 智能提取数据：支持多种数据结构
  // 1. { content: GeneratedCourseContent } - 从 CourseChapterContentResponse 获取
  // 2. GeneratedCourseContent 直接作为 content
  // 3. { chapter_title, lesson_content, ... } - 直接的生成内容结构
  let data: any = null;

  // 优先尝试从 content.content 提取（CourseChapterContentResponse 格式）
  if (content?.content && typeof content.content === "object") {
    data = content.content;
  }
  // 如果 content 本身有 lesson_content 或 exam_analysis，直接使用
  else if (content?.lesson_content || content?.exam_analysis || content?.chapter_title) {
    data = content;
  }
  // 兜底：直接使用 content
  else {
    data = content;
  }

  // 调试日志（生产环境可移除）
  if (process.env.NODE_ENV === "development") {
    console.log("[LessonContentPreview] Raw content:", content);
    console.log("[LessonContentPreview] Extracted data:", data);
    console.log("[LessonContentPreview] Data keys:", data ? Object.keys(data) : []);
  }

  if (!data || typeof data !== "object") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 mb-2 text-amber-500" />
        <p className="text-sm">内容格式异常</p>
      </div>
    );
  }

  const meta = {
    chapterTitle: data.chapter_title || data.title,
    subject: data.subject,
    knowledgePoint: data.knowledge_point,
    estimatedDuration: data.estimated_duration,
    difficultyLevel: data.difficulty_level,
    wordCountTarget: data.word_count_target,
  };

  // 提取各模块数据
  const exam = data.exam_analysis;
  const lesson = data.lesson_content;
  const lessonSections = data.lesson_sections;
  const practiceProblems = data.practice_problems;
  const homework = data.homework;
  const chapter = content?.chapter;
  const modules = content?.modules;
  const wordCount = content?.word_count;

  // 模块状态检查 - 所有模块都是必需的
  const moduleStatus = {
    exam_analysis: { name: "考情分析", present: !!exam && !!exam.description, required: true },
    introduction: {
      name: "课程导入",
      present: isNonEmptyString(lesson?.introduction),
      required: true,
    },
    learning_goals: {
      name: "学习目标",
      present: isNonEmptyArray(lesson?.learning_goals),
      required: true,
    },
    core_concepts: {
      name: "核心概念",
      present: isNonEmptyArray(lesson?.core_concepts),
      required: true,
    },
    method_steps: {
      name: "方法步骤",
      present: isNonEmptyArray(lesson?.method_steps),
      required: true,
    },
    formulas: { name: "记忆口诀", present: isNonEmptyArray(lesson?.formulas), required: true },
    memory_tips: {
      name: "记忆技巧",
      present: isNonEmptyArray(lesson?.memory_tips),
      required: true,
    },
    common_mistakes: {
      name: "易错陷阱",
      present: isNonEmptyArray(lesson?.common_mistakes),
      required: true,
    },
    exam_strategies: {
      name: "应试策略",
      present: isNonEmptyArray(lesson?.exam_strategies),
      required: true,
    },
    vocabulary_accumulation: {
      name: "高频词汇",
      present: !!lesson?.vocabulary_accumulation,
      required: true,
    },
    extension_knowledge: {
      name: "拓展知识",
      present: isNonEmptyString(lesson?.extension_knowledge),
      required: true,
    },
    summary_points: {
      name: "课程总结",
      present: isNonEmptyArray(lesson?.summary_points),
      required: true,
    },
    mind_map_mermaid: {
      name: "思维导图",
      present: isNonEmptyString(lesson?.mind_map_mermaid),
      required: true,
    },
    quick_notes: { name: "快速笔记", present: !!lesson?.quick_notes, required: true },
    lesson_sections: { name: "课程章节", present: isNonEmptyArray(lessonSections), required: true },
    practice_problems: {
      name: "练习题目",
      present: isNonEmptyArray(practiceProblems),
      required: true,
    },
    homework: {
      name: "课后作业",
      present:
        !!homework && (isNonEmptyArray(homework.required) || isNonEmptyArray(homework.optional)),
      required: true,
    },
  };

  const presentModules = Object.values(moduleStatus).filter((m) => m.present).length;
  const totalModules = Object.values(moduleStatus).length;
  const missingRequired = Object.values(moduleStatus).filter((m) => m.required && !m.present);
  const missingOptional = Object.values(moduleStatus).filter((m) => !m.required && !m.present);

  // 调试日志：检查各模块是否存在
  if (process.env.NODE_ENV === "development") {
    console.log("[LessonContentPreview] Modules check:", moduleStatus);
  }

  return (
    <div
      className="relative space-y-2 rounded-2xl border border-[var(--preview-accent-soft)]/60 bg-[linear-gradient(135deg,rgba(124,58,237,0.08),rgba(14,165,233,0.06),transparent)] dark:bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(15,23,42,0.2),transparent)] p-4 font-[var(--preview-body-font)]"
      style={PREVIEW_THEME}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -top-24 -right-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.25),transparent_60%)]" />
        <div className="absolute -bottom-28 -left-12 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_50%)] dark:bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.35),transparent_55%)]" />
      </div>
      <div className="relative space-y-1">
        {/* Course Overview */}
        <section className="relative overflow-hidden rounded-2xl border border-[var(--preview-accent-soft)]/60 bg-white/70 dark:bg-slate-900/40 p-4">
          <div className="pointer-events-none absolute -top-10 right-4 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.25),transparent_70%)]" />
          <SectionHeader title="课程概览" icon={GraduationCap} iconColor="text-violet-500" />
          {meta.chapterTitle && (
            <h2
              className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100"
              style={{ fontFamily: "var(--preview-heading-font)" }}
            >
              {meta.chapterTitle}
            </h2>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {isNonEmptyString(meta.subject) && <KeyValue label="科目" value={meta.subject} />}
            {isNonEmptyString(meta.knowledgePoint) && (
              <KeyValue label="知识点" value={meta.knowledgePoint} />
            )}
            {isNonEmptyString(meta.estimatedDuration) && (
              <KeyValue label="预计时长" value={meta.estimatedDuration} icon={Clock} />
            )}
            {isNonEmptyString(meta.difficultyLevel) && (
              <div className="flex items-center gap-2 text-sm rounded-full border border-[var(--preview-accent-soft)]/60 bg-white/70 dark:bg-slate-900/40 px-3 py-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  难度
                </span>
                <Badge
                  className={cn(
                    "text-[10px] px-2 py-0.5",
                    meta.difficultyLevel === "简单" && "bg-emerald-500",
                    meta.difficultyLevel === "中等" && "bg-amber-500",
                    meta.difficultyLevel === "困难" && "bg-red-500"
                  )}
                >
                  {meta.difficultyLevel}
                </Badge>
              </div>
            )}
            {meta.wordCountTarget && <KeyValue label="目标字数" value={meta.wordCountTarget} />}
            {wordCount?.total && <KeyValue label="实际字数" value={wordCount.total} />}
          </div>
        </section>

        {/* Module Status Report - 模块生成状态检查 */}
        <ModuleStatusReport
          presentModules={presentModules}
          totalModules={totalModules}
          missingRequired={missingRequired}
          missingOptional={missingOptional}
          moduleStatus={moduleStatus}
        />

        {chapter && (
          <section className="mt-4">
            <SectionHeader title="章节信息" icon={BookText} iconColor="text-sky-500" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <KeyValue label="章节ID" value={chapter.id} />
              <KeyValue label="课程ID" value={chapter.course_id} />
              <KeyValue label="标题" value={chapter.title} />
              <KeyValue label="时长" value={chapter.duration} icon={Clock} />
              <KeyValue label="字数" value={chapter.word_count} />
              <KeyValue label="排序" value={chapter.sort_order} />
              <KeyValue label="层级" value={chapter.level} />
              <KeyValue label="免费预览" value={chapter.is_free_preview ? "是" : "否"} />
            </div>
          </section>
        )}

        <Separator className="my-4" />

        {/* Exam Analysis */}
        {exam && (
          <>
            <section>
              <SectionHeader title="考情分析" icon={BarChart3} iconColor="text-blue-500" />
              <Paragraph value={exam.description} />
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2">
                {isNonEmptyString(exam.frequency) && (
                  <KeyValue label="考查频率" value={exam.frequency} />
                )}
                {isNonEmptyString(exam.score_weight) && (
                  <KeyValue label="分值占比" value={exam.score_weight} />
                )}
                {isNonEmptyString(exam.difficulty_trend) && (
                  <KeyValue label="难度趋势" value={exam.difficulty_trend} icon={TrendingUp} />
                )}
              </div>
              {isNonEmptyArray(exam.exam_forms) && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-xs text-muted-foreground mr-1">考查形式：</span>
                  {(exam.exam_forms as string[]).map((form, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {form}
                    </Badge>
                  ))}
                </div>
              )}
              {isNonEmptyArray(exam.key_patterns) && (
                <div className="mt-3">
                  <ContentBlock title="命题规律" icon={Target} iconColor="text-violet-500">
                    <NumberedList items={exam.key_patterns} />
                  </ContentBlock>
                </div>
              )}
              {isNonEmptyString(exam.recent_trends) && (
                <div className="mt-2">
                  <InfoBlock
                    title="近年趋势"
                    content={exam.recent_trends as string}
                    variant="info"
                  />
                </div>
              )}
            </section>
            <Separator className="my-4" />
          </>
        )}

        {/* Lesson Content */}
        {lesson && (
          <>
            <section>
              <SectionHeader title="课程主体内容" icon={BookOpen} iconColor="text-emerald-500" />

              {isNonEmptyString(lesson.introduction) && (
                <div className="mb-4">
                  <InfoBlock content={lesson.introduction as string} variant="info" />
                </div>
              )}

              {isNonEmptyArray(lesson.learning_goals) && (
                <div className="mb-4">
                  <ContentBlock title="学习目标" icon={Target} iconColor="text-blue-500">
                    <NumberedList items={lesson.learning_goals} />
                  </ContentBlock>
                </div>
              )}

              {isNonEmptyArray(lesson.prerequisites) && (
                <div className="mb-4">
                  <ContentBlock title="前置知识" icon={BookMarked} iconColor="text-violet-500">
                    <StyledList
                      items={lesson.prerequisites}
                      icon={CheckCircle2}
                      iconColor="text-violet-500"
                    />
                  </ContentBlock>
                </div>
              )}

              {isNonEmptyArray(lesson.core_concepts) && (
                <div className="mb-4">
                  <ContentBlock title="核心概念" icon={Brain} iconColor="text-violet-500">
                    <div className="divide-y">
                      {(lesson.core_concepts as UnknownRecord[]).map((concept, index) => (
                        <ConceptItem key={index} concept={concept} index={index} />
                      ))}
                    </div>
                  </ContentBlock>
                </div>
              )}

              {isNonEmptyArray(lesson.method_steps) && (
                <div className="mb-4">
                  <ContentBlock title="方法步骤" icon={ListChecks} iconColor="text-blue-500">
                    <div className="divide-y">
                      {(lesson.method_steps as UnknownRecord[]).map((step, index) => (
                        <MethodStepItem key={index} step={step} index={index} />
                      ))}
                    </div>
                  </ContentBlock>
                </div>
              )}

              {isNonEmptyArray(lesson.formulas) && (
                <div className="mb-4">
                  <ContentBlock title="口诀公式" icon={Sparkles} iconColor="text-amber-500">
                    <div className="divide-y">
                      {(lesson.formulas as UnknownRecord[]).map((formula, index) => (
                        <FormulaItem key={index} formula={formula} index={index} />
                      ))}
                    </div>
                  </ContentBlock>
                </div>
              )}

              {isNonEmptyArray(lesson.memory_tips) && (
                <div className="mb-4">
                  <ContentBlock title="记忆技巧" icon={Brain} iconColor="text-teal-500">
                    <div className="divide-y">
                      {(lesson.memory_tips as UnknownRecord[]).map((tip, index) => (
                        <MemoryTipItem key={index} tip={tip} index={index} />
                      ))}
                    </div>
                  </ContentBlock>
                </div>
              )}

              {isNonEmptyArray(lesson.common_mistakes) && (
                <div className="mb-4">
                  <ContentBlock title="易错陷阱" icon={AlertTriangle} iconColor="text-red-500">
                    <div className="divide-y">
                      {(lesson.common_mistakes as UnknownRecord[]).map((mistake, index) => (
                        <MistakeItem key={index} mistake={mistake} index={index} />
                      ))}
                    </div>
                  </ContentBlock>
                </div>
              )}

              {isNonEmptyArray(lesson.exam_strategies) && (
                <div className="mb-4">
                  <ContentBlock title="应试策略" icon={Award} iconColor="text-indigo-500">
                    <div className="divide-y">
                      {(lesson.exam_strategies as UnknownRecord[]).map((strategy, index) => (
                        <StrategyItem key={index} strategy={strategy} index={index} />
                      ))}
                    </div>
                  </ContentBlock>
                </div>
              )}

              {lesson.vocabulary_accumulation && (
                <div className="mb-4">
                  <ContentBlock title="词汇积累" icon={BookText} iconColor="text-teal-500">
                    <div className="space-y-3">
                      {isNonEmptyArray(lesson.vocabulary_accumulation.must_know) && (
                        <div>
                          <Badge className="mb-1.5 bg-red-500 text-xs">必须掌握</Badge>
                          <div className="flex flex-wrap gap-1.5">
                            {(lesson.vocabulary_accumulation.must_know as string[]).map(
                              (word, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {word}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      {isNonEmptyArray(lesson.vocabulary_accumulation.should_know) && (
                        <div>
                          <Badge className="mb-1.5 bg-amber-500 text-xs">应该掌握</Badge>
                          <div className="flex flex-wrap gap-1.5">
                            {(lesson.vocabulary_accumulation.should_know as string[]).map(
                              (word, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {word}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      {isNonEmptyArray(lesson.vocabulary_accumulation.nice_to_know) && (
                        <div>
                          <Badge className="mb-1.5 bg-emerald-500 text-xs">了解即可</Badge>
                          <div className="flex flex-wrap gap-1.5">
                            {(lesson.vocabulary_accumulation.nice_to_know as string[]).map(
                              (word, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {word}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </ContentBlock>
                </div>
              )}

              {isNonEmptyString(lesson.extension_knowledge) && (
                <div className="mb-4">
                  <InfoBlock
                    title="拓展知识"
                    content={lesson.extension_knowledge as string}
                    variant="info"
                  />
                </div>
              )}

              {isNonEmptyArray(lesson.summary_points) && (
                <div className="mb-4">
                  <ContentBlock title="课程总结" icon={ClipboardList} iconColor="text-emerald-500">
                    <NumberedList items={lesson.summary_points} />
                  </ContentBlock>
                </div>
              )}

              {isNonEmptyString(lesson.mind_map_mermaid) && (
                <div className="mb-4">
                  <ContentBlock title="思维导图" icon={Brain} iconColor="text-violet-500">
                    <MermaidDiagram
                      code={lesson.mind_map_mermaid as string}
                      id={`${mermaidIdRef.current}-lesson-mindmap`}
                    />
                  </ContentBlock>
                </div>
              )}

              {lesson.quick_notes && (
                <div className="mb-4">
                  <ContentBlock title="快速笔记" icon={FileText} iconColor="text-amber-500">
                    <div className="space-y-3">
                      {isNonEmptyArray(lesson.quick_notes.formulas) && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-muted-foreground">公式速记</h5>
                          {(lesson.quick_notes.formulas as UnknownRecord[]).map((item, index) => (
                            <div key={index} className="py-1.5">
                              <div className="font-medium text-sm">{String(item.name || "")}</div>
                              <p className="text-sm font-mono bg-muted/30 rounded px-2 py-1 mt-1">
                                {String(item.content || "")}
                              </p>
                              <Paragraph value={item.explanation} />
                            </div>
                          ))}
                        </div>
                      )}
                      {isNonEmptyArray(lesson.quick_notes.key_points) && (
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground mb-1.5">
                            要点速记
                          </h5>
                          <StyledList
                            items={lesson.quick_notes.key_points}
                            icon={Star}
                            iconColor="text-amber-500"
                          />
                        </div>
                      )}
                      {isNonEmptyArray(lesson.quick_notes.common_mistakes) && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-muted-foreground">易错速记</h5>
                          {(lesson.quick_notes.common_mistakes as UnknownRecord[]).map(
                            (item, index) => (
                              <div key={index} className="py-1.5">
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                  <span className="font-medium text-sm">
                                    {String(item.mistake || "")}
                                  </span>
                                </div>
                                <Paragraph
                                  value={item.correction}
                                  className="text-emerald-600 dark:text-emerald-400 mt-1"
                                />
                              </div>
                            )
                          )}
                        </div>
                      )}
                      {isNonEmptyArray(lesson.quick_notes.exam_tips) && (
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground mb-1.5">
                            考试技巧
                          </h5>
                          <StyledList
                            items={lesson.quick_notes.exam_tips}
                            icon={Zap}
                            iconColor="text-violet-500"
                          />
                        </div>
                      )}
                    </div>
                  </ContentBlock>
                </div>
              )}
            </section>
            <Separator className="my-4" />
          </>
        )}

        {/* Lesson Sections */}
        {isNonEmptyArray(lessonSections) && (
          <>
            <section>
              <SectionHeader
                title="课程章节拆解"
                icon={BookOpen}
                iconColor="text-blue-500"
                badge={`${lessonSections.length} 个章节`}
              />
              <div className="divide-y">
                {(lessonSections as UnknownRecord[]).map((section, index) => (
                  <LessonSectionItem
                    key={index}
                    section={section}
                    index={index}
                    mermaidId={mermaidIdRef.current}
                  />
                ))}
              </div>
            </section>
            <Separator className="my-4" />
          </>
        )}

        {/* Practice Problems */}
        {isNonEmptyArray(practiceProblems) && (
          <>
            <section>
              <SectionHeader
                title="练习题目"
                icon={FileQuestion}
                iconColor="text-emerald-500"
                badge={`${practiceProblems.length} 道题`}
              />
              <div className="divide-y">
                {(practiceProblems as UnknownRecord[]).map((problem, index) => (
                  <PracticeProblemItem key={index} problem={problem} index={index} />
                ))}
              </div>
            </section>
            <Separator className="my-4" />
          </>
        )}

        {/* Homework */}
        {homework && (
          <>
            <section>
              <SectionHeader title="课后作业" icon={ClipboardList} iconColor="text-amber-500" />
              <div className="space-y-4">
                {isNonEmptyArray(homework.required) && (
                  <ContentBlock title="必做作业" icon={Flame} iconColor="text-red-500">
                    <NumberedList items={homework.required} />
                  </ContentBlock>
                )}
                {isNonEmptyArray(homework.optional) && (
                  <ContentBlock title="选做作业" icon={Lightbulb} iconColor="text-amber-500">
                    <NumberedList items={homework.optional} />
                  </ContentBlock>
                )}
                {isNonEmptyArray(homework.thinking_questions) && (
                  <ContentBlock title="思考题" icon={Brain} iconColor="text-violet-500">
                    <NumberedList items={homework.thinking_questions} />
                  </ContentBlock>
                )}
                {isNonEmptyString(homework.preview) && (
                  <InfoBlock title="预习内容" content={homework.preview as string} variant="info" />
                )}
              </div>
            </section>
            <Separator className="my-4" />
          </>
        )}

        {/* Modules */}
        {isNonEmptyArray(modules) && (
          <section>
            <SectionHeader
              title="模块列表"
              icon={BookOpen}
              iconColor="text-slate-500"
              badge={`${modules.length} 个模块`}
            />
            <div className="space-y-3">
              {(modules as UnknownRecord[]).map((module, index) => {
                const moduleType = String(module.module_type || module.moduleType || "");
                const moduleLabel =
                  moduleTypeLabels[moduleType] ||
                  moduleType ||
                  String(module.title || module.module_name || `模块 ${index + 1}`);
                const contentText =
                  module.content_text || module.contentText || module.content || "";
                const contentJson = module.content_json || module.contentJson || null;
                const moduleKey = `${moduleType || "module"}-${module.id ?? index}`;

                return (
                  <div key={moduleKey} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="text-xs">
                        {moduleLabel}
                      </Badge>
                      <span className="font-medium">
                        {String(module.title || module.module_name || moduleLabel)}
                      </span>
                      {module.word_count ? (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {module.word_count} 字
                        </span>
                      ) : null}
                      {isNonEmptyString(module.status) && (
                        <Badge variant="outline" className="text-xs">
                          {module.status}
                        </Badge>
                      )}
                    </div>
                    {isNonEmptyString(contentText) && <Paragraph value={contentText} />}
                    {contentJson && (
                      <pre className="text-xs whitespace-pre-wrap break-words bg-muted/50 rounded-md p-2 font-mono">
                        {formatJSON(contentJson)}
                      </pre>
                    )}
                    {!isNonEmptyString(contentText) && !contentJson && (
                      <pre className="text-xs whitespace-pre-wrap break-words bg-muted/50 rounded-md p-2 font-mono">
                        {formatJSON(module)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {content && (
          <details className="mt-4 rounded-lg border bg-muted/20 p-3">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
              完整数据（JSON）
            </summary>
            <pre className="text-xs whitespace-pre-wrap break-words mt-2 font-mono">
              {formatJSON(content)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
