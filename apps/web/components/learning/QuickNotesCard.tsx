"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  Target,
  Zap,
  Brain,
} from "lucide-react";

// 快速笔记数据结构
interface FormulaItem {
  name: string;
  content: string;
  explanation?: string;
}

interface MistakeItem {
  mistake: string;
  correction: string;
}

interface QuickNotesData {
  formulas?: FormulaItem[];
  key_points?: string[];
  common_mistakes?: MistakeItem[];
  exam_tips?: string[];
}

interface QuickNotesCardProps {
  /** Quick notes data object */
  data: QuickNotesData;
  /** Optional title */
  title?: string;
  /** Custom class name */
  className?: string;
  /** Default expanded sections */
  defaultExpanded?: ("formulas" | "key_points" | "mistakes" | "tips")[];
}

/**
 * QuickNotesCard - 快速笔记卡片组件
 * 渲染四种笔记类型：口诀公式、核心要点、易错点、考场技巧
 */
export function QuickNotesCard({
  data,
  title = "快速笔记",
  className = "",
  defaultExpanded = ["formulas", "key_points", "mistakes", "tips"],
}: QuickNotesCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  // Check if data is valid
  const hasContent =
    (data.formulas && data.formulas.length > 0) ||
    (data.key_points && data.key_points.length > 0) ||
    (data.common_mistakes && data.common_mistakes.length > 0) ||
    (data.exam_tips && data.exam_tips.length > 0);

  if (!hasContent) {
    return null;
  }

  // Copy to clipboard
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div
      className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-100/50 to-orange-100/50 border-b border-amber-200/50">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-stone-800">{title}</h3>
          <p className="text-xs text-stone-500">考前冲刺速记卡</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 1. 口诀公式 */}
        {data.formulas && data.formulas.length > 0 && (
          <Section
            title="核心口诀"
            icon={<Brain className="w-4 h-4" />}
            color="indigo"
            isExpanded={expandedSections.has("formulas")}
            onToggle={() => toggleSection("formulas")}
          >
            <div className="space-y-3">
              {data.formulas.map((formula, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-indigo-700 text-sm">
                      {formula.name}
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(formula.content, `formula-${idx}`)
                      }
                      className="p-1.5 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="复制口诀"
                    >
                      {copiedIndex === `formula-${idx}` ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg px-4 py-3 mb-2">
                    <p className="font-mono text-indigo-800 font-medium text-center">
                      {formula.content}
                    </p>
                  </div>
                  {formula.explanation && (
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {formula.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 2. 核心要点 */}
        {data.key_points && data.key_points.length > 0 && (
          <Section
            title="核心要点"
            icon={<Target className="w-4 h-4" />}
            color="emerald"
            isExpanded={expandedSections.has("key_points")}
            onToggle={() => toggleSection("key_points")}
          >
            <ul className="space-y-2">
              {data.key_points.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 bg-white rounded-lg px-4 py-3 border border-emerald-100"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-stone-700 leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 3. 易错点纠正 */}
        {data.common_mistakes && data.common_mistakes.length > 0 && (
          <Section
            title="易错点纠正"
            icon={<AlertTriangle className="w-4 h-4" />}
            color="rose"
            isExpanded={expandedSections.has("mistakes")}
            onToggle={() => toggleSection("mistakes")}
          >
            <div className="space-y-3">
              {data.common_mistakes.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl overflow-hidden border border-rose-100"
                >
                  <div className="flex items-start gap-3 px-4 py-3 bg-rose-50/50">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                      <span className="text-xs">✗</span>
                    </span>
                    <span className="text-sm text-rose-700 font-medium">
                      {item.mistake}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3 border-t border-rose-100">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <span className="text-xs">✓</span>
                    </span>
                    <span className="text-sm text-emerald-700">
                      {item.correction}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 4. 考场技巧 */}
        {data.exam_tips && data.exam_tips.length > 0 && (
          <Section
            title="考场技巧"
            icon={<Zap className="w-4 h-4" />}
            color="amber"
            isExpanded={expandedSections.has("tips")}
            onToggle={() => toggleSection("tips")}
          >
            <div className="grid gap-2">
              {data.exam_tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-amber-100"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-stone-700">{tip}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// Section component for collapsible sections
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  color: "indigo" | "emerald" | "rose" | "amber";
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({
  title,
  icon,
  color,
  isExpanded,
  onToggle,
  children,
}: SectionProps) {
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      icon: "text-indigo-500",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "text-emerald-500",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: "text-rose-500",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: "text-amber-500",
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`rounded-xl border ${classes.border} overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 ${classes.bg} hover:brightness-95 transition-all`}
      >
        <div className="flex items-center gap-2">
          <span className={classes.icon}>{icon}</span>
          <span className={`font-semibold text-sm ${classes.text}`}>
            {title}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 bg-white/50">{children}</div>
      )}
    </div>
  );
}

export default QuickNotesCard;
