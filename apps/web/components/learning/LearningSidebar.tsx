"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Brain,
  Lightbulb,
  StickyNote,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Copy,
  Sparkles,
  X,
} from "lucide-react";

// 知识点类型
export interface KnowledgePoint {
  id: number;
  name: string;
  mastered?: boolean;
  relatedChapterId?: number;
}

// 笔记模板类型
export interface NoteTemplate {
  id: string;
  title: string;
  content: string;
}

// 学习助手侧边栏Props
interface LearningSidebarProps {
  chapterId: number;
  chapterTitle: string;
  knowledgePoints?: KnowledgePoint[];
  noteTemplates?: NoteTemplate[];
  relatedKnowledgePoints?: KnowledgePoint[];
  isOpen?: boolean;
  onClose?: () => void;
  onKnowledgeClick?: (knowledgeId: number) => void;
  onMasteryToggle?: (knowledgeId: number, mastered: boolean) => void;
  onCopyTemplate?: (template: NoteTemplate) => void;
  className?: string;
}

// 知识点列表项
function KnowledgeListItem({
  point,
  onToggle,
  onClick,
}: {
  point: KnowledgePoint;
  onToggle?: (mastered: boolean) => void;
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2 hover:bg-stone-50 rounded-lg transition-colors">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.(!point.mastered);
        }}
        className="flex-shrink-0"
      >
        {point.mastered ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-stone-300 hover:text-green-400 transition-colors" />
        )}
      </button>
      <button
        onClick={onClick}
        className={cn(
          "flex-1 text-left text-sm",
          point.mastered ? "text-stone-400 line-through" : "text-stone-700"
        )}
      >
        {point.name}
      </button>
      {point.relatedChapterId && (
        <ExternalLink className="w-4 h-4 text-stone-400" />
      )}
    </div>
  );
}

// 笔记模板卡片
function NoteTemplateCard({
  template,
  onCopy,
}: {
  template: NoteTemplate;
  onCopy?: () => void;
}) {
  return (
    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h5 className="text-sm font-medium text-amber-800">{template.title}</h5>
        <button
          onClick={onCopy}
          className="p-1 hover:bg-amber-100 rounded transition-colors"
          title="复制模板"
        >
          <Copy className="w-4 h-4 text-amber-600" />
        </button>
      </div>
      <p className="text-xs text-amber-700 whitespace-pre-line line-clamp-3">
        {template.content}
      </p>
    </div>
  );
}

export function LearningSidebar({
  chapterId,
  chapterTitle,
  knowledgePoints = [],
  noteTemplates = [],
  relatedKnowledgePoints = [],
  isOpen = true,
  onClose,
  onKnowledgeClick,
  onMasteryToggle,
  onCopyTemplate,
  className,
}: LearningSidebarProps) {
  const [activeTab, setActiveTab] = useState<"knowledge" | "notes" | "related">("knowledge");
  const [expandedSections, setExpandedSections] = useState({
    knowledge: true,
    notes: true,
    related: true,
  });

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // 计算掌握进度
  const masteredCount = knowledgePoints.filter((p) => p.mastered).length;
  const masteryProgress = knowledgePoints.length > 0 
    ? Math.round((masteredCount / knowledgePoints.length) * 100) 
    : 0;

  // 默认笔记模板
  const defaultTemplates: NoteTemplate[] = noteTemplates.length > 0 ? noteTemplates : [
    {
      id: "1",
      title: "知识点笔记",
      content: "【知识点名称】\n\n【核心概念】\n\n【重点公式/要点】\n\n【典型例题】\n\n【个人总结】",
    },
    {
      id: "2",
      title: "错题分析",
      content: "【题目】\n\n【错误答案】\n\n【正确答案】\n\n【错误原因】\n\n【知识点回顾】\n\n【避免方法】",
    },
    {
      id: "3",
      title: "章节总结",
      content: "【本章重点】\n1.\n2.\n3.\n\n【难点突破】\n\n【易错点】\n\n【下次复习要点】",
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "w-80 bg-white border-l border-stone-200 flex flex-col",
        className
      )}
    >
      {/* 头部 */}
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-stone-800">AI 学习助手</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-stone-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>
          )}
        </div>
        <p className="text-xs text-stone-500 line-clamp-1">{chapterTitle}</p>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab("knowledge")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === "knowledge"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          知识点
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === "notes"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          笔记模板
        </button>
        <button
          onClick={() => setActiveTab("related")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === "related"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          关联
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 知识点列表 */}
        {activeTab === "knowledge" && (
          <div className="space-y-4">
            {/* 掌握进度 */}
            <div className="p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600">本章掌握进度</span>
                <span className="text-sm font-medium text-amber-600">
                  {masteredCount}/{knowledgePoints.length}
                </span>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${masteryProgress}%` }}
                />
              </div>
            </div>

            {/* 知识点清单 */}
            <div>
              <button
                onClick={() => toggleSection("knowledge")}
                className="w-full flex items-center justify-between p-2 hover:bg-stone-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-stone-700">
                    本章知识点
                  </span>
                </div>
                {expandedSections.knowledge ? (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                )}
              </button>
              {expandedSections.knowledge && (
                <div className="mt-2 space-y-1">
                  {knowledgePoints.length > 0 ? (
                    knowledgePoints.map((point) => (
                      <KnowledgeListItem
                        key={point.id}
                        point={point}
                        onToggle={(mastered) =>
                          onMasteryToggle?.(point.id, mastered)
                        }
                        onClick={() => onKnowledgeClick?.(point.id)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-stone-400 text-center py-4">
                      暂无知识点
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 笔记模板 */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-stone-700">
                AI 笔记模板
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              使用 AI 生成的笔记模板，快速记录学习要点
            </p>
            <div className="space-y-3">
              {defaultTemplates.map((template) => (
                <NoteTemplateCard
                  key={template.id}
                  template={template}
                  onCopy={() => onCopyTemplate?.(template)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 关联知识点 */}
        {activeTab === "related" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-stone-700">
                关联知识点
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              与本章相关的前置和后续知识点
            </p>
            <div className="space-y-2">
              {relatedKnowledgePoints.length > 0 ? (
                relatedKnowledgePoints.map((point) => (
                  <button
                    key={point.id}
                    onClick={() => onKnowledgeClick?.(point.id)}
                    className="w-full flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-stone-700">{point.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-stone-200 mx-auto mb-3" />
                  <p className="text-sm text-stone-400">暂无关联知识点</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningSidebar;
