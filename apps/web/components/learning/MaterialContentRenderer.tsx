"use client";

import React from "react";
import {
  Quote,
  BookOpen,
  Lightbulb,
  FileText,
  Layers,
  Tag,
  Calendar,
  User,
  Link2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =====================================================
// 类型定义
// =====================================================

export interface MaterialContent {
  // 基础信息
  title: string;
  quote?: string; // 原文金句（20-50字）
  content: string; // 主要内容（300-500字）
  source?: string; // 出处
  source_date?: string; // 来源日期
  speaker?: string; // 发言人
  occasion?: string; // 场合
  material_type?: string; // 类型
  theme?: string; // 主题
  sub_themes?: string[]; // 子主题

  // 背景解读（400字+）
  background?: string;

  // 使用场景（5个，每个100-120字）
  usage_scenarios?: UsageScenario[];
  related_policies?: string[];

  // 范文片段（4段：开头/论证/过渡/结尾）
  writing_segments?: WritingSegment[];

  // 拓展延伸（200字+）
  extension?: string | MaterialExtension;

  // 标签
  tags?: string[];
}

export interface UsageScenario {
  scenario: string; // 场景名称
  example: string; // 使用示例（100-120字）
}

export interface WritingSegment {
  type: "opening" | "argument" | "transition" | "ending" | string;
  content: string; // 片段内容（150-200字）
}

export interface MaterialExtension {
  related_quotes?: string[];
  related_materials?: string[];
  reading_suggestions?: string;
  exam_tips?: string;
}

interface MaterialContentRendererProps {
  material: MaterialContent;
  className?: string;
}

// =====================================================
// 主渲染组件
// =====================================================

export function MaterialContentRenderer({
  material,
  className,
}: MaterialContentRendererProps) {
  if (!material) {
    return (
      <div className="text-center py-12 text-stone-500">暂无素材内容</div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 素材头部 */}
      <MaterialHeader material={material} />

      {/* 原文金句 */}
      {material.quote && <MaterialQuote quote={material.quote} />}

      {/* 主要内容 */}
      <MaterialMainContent content={material.content} />

      {/* 背景解读 */}
      {material.background && (
        <BackgroundSection background={material.background} />
      )}

      {/* 使用场景 */}
      {material.usage_scenarios && material.usage_scenarios.length > 0 && (
        <UsageScenarios scenarios={material.usage_scenarios} />
      )}

      {/* 相关政策 */}
      {material.related_policies && material.related_policies.length > 0 && (
        <RelatedPoliciesSection policies={material.related_policies} />
      )}

      {/* 范文片段 */}
      {material.writing_segments && material.writing_segments.length > 0 && (
        <WritingSegments segments={material.writing_segments} />
      )}

      {/* 拓展延伸 */}
      {material.extension && (
        <ExtensionSection extension={material.extension} />
      )}

      {/* 标签 */}
      {material.tags && material.tags.length > 0 && (
        <MaterialTags tags={material.tags} />
      )}
    </div>
  );
}

// =====================================================
// 素材头部
// =====================================================

function MaterialHeader({ material }: { material: MaterialContent }) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
      <h2 className="text-xl font-bold text-amber-900 mb-4">{material.title}</h2>
      
      <div className="flex flex-wrap gap-4 text-sm">
        {material.source && (
          <div className="flex items-center gap-2 text-amber-700">
            <Link2 className="w-4 h-4" />
            <span>出处：{material.source}</span>
          </div>
        )}
        {material.speaker && (
          <div className="flex items-center gap-2 text-amber-700">
            <User className="w-4 h-4" />
            <span>发言人：{material.speaker}</span>
          </div>
        )}
        {material.source_date && (
          <div className="flex items-center gap-2 text-amber-700">
            <Calendar className="w-4 h-4" />
            <span>{material.source_date}</span>
          </div>
        )}
        {material.occasion && (
          <div className="flex items-center gap-2 text-amber-700">
            <BookOpen className="w-4 h-4" />
            <span>场合：{material.occasion}</span>
          </div>
        )}
      </div>

      {material.theme && (
        <div className="mt-4 flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-medium">
            {material.theme}
          </span>
          {material.sub_themes?.map((subTheme, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
            >
              {subTheme}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// 原文金句
// =====================================================

function MaterialQuote({ quote }: { quote: string }) {
  return (
    <section className="relative">
      <div className="absolute -left-2 top-0 text-6xl text-amber-200 font-serif">"</div>
      <blockquote className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-8 pl-12">
        <div className="flex items-start gap-3">
          <Quote className="w-8 h-8 flex-shrink-0 opacity-50" />
          <p className="text-xl font-medium leading-relaxed italic">
            {quote}
          </p>
        </div>
      </blockquote>
    </section>
  );
}

// =====================================================
// 主要内容
// =====================================================

function MaterialMainContent({ content }: { content: string }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500 rounded-xl text-white">
          <FileText className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">素材内容</h3>
      </div>
      <div className="prose prose-stone max-w-none">
        <p className="text-stone-700 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>
    </section>
  );
}

// =====================================================
// 背景解读
// =====================================================

function BackgroundSection({ background }: { background: string }) {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-stone-50 rounded-2xl p-6 border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-500 rounded-xl text-white">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">背景解读</h3>
      </div>
      <div className="prose prose-stone max-w-none">
        <p className="text-stone-700 leading-relaxed whitespace-pre-line">
          {background}
        </p>
      </div>
    </section>
  );
}

// =====================================================
// 使用场景（5个）
// =====================================================

function UsageScenarios({ scenarios }: { scenarios: UsageScenario[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500 rounded-xl text-white">
          <Lightbulb className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">使用场景</h3>
        <span className="ml-auto text-sm text-stone-500">{scenarios.length} 个场景</span>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario, idx) => (
          <div
            key={idx}
            className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </span>
              <h4 className="font-semibold text-emerald-800">{scenario.scenario}</h4>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              {scenario.example}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// 相关政策
// =====================================================

function RelatedPoliciesSection({ policies }: { policies: string[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500 rounded-xl text-white">
          <Link2 className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">相关政策</h3>
        <span className="ml-auto text-sm text-stone-500">{policies.length} 条政策</span>
      </div>
      <ul className="space-y-2 text-sm text-stone-700">
        {policies.map((policy, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>{policy}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =====================================================
// 范文片段（4段）
// =====================================================

const segmentTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  opening: { label: "开头段", color: "from-blue-500 to-indigo-500", icon: "📖" },
  argument: { label: "论证段", color: "from-purple-500 to-violet-500", icon: "💡" },
  transition: { label: "过渡段", color: "from-teal-500 to-cyan-500", icon: "🔗" },
  ending: { label: "结尾段", color: "from-rose-500 to-pink-500", icon: "🎯" },
};

function WritingSegments({ segments }: { segments: WritingSegment[] }) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-500 rounded-xl text-white">
          <FileText className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">范文片段</h3>
        <span className="ml-auto text-sm text-stone-500">{segments.length} 段范文</span>
      </div>
      <div className="space-y-4">
        {segments.map((segment, idx) => {
          const config = segmentTypeConfig[segment.type] || {
            label: segment.type,
            color: "from-stone-500 to-stone-600",
            icon: "📝",
          };
          
          return (
            <div key={idx} className="group">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex-shrink-0 w-24 py-2 px-3 rounded-lg text-white text-center font-medium bg-gradient-to-r",
                    config.color
                  )}
                >
                  <span className="text-lg mr-1">{config.icon}</span>
                  <span className="text-sm">{config.label}</span>
                </div>
                <div className="flex-1 p-4 bg-stone-50 rounded-xl group-hover:bg-stone-100 transition-colors">
                  <p className="text-stone-700 leading-relaxed">
                    {segment.content}
                  </p>
                  <button className="mt-3 flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700">
                    <span>复制此段</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// =====================================================
// 拓展延伸
// =====================================================

function ExtensionSection({ extension }: { extension: string | MaterialExtension }) {
  if (!extension) return null;

  if (typeof extension === "string") {
    return (
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500 rounded-xl text-white">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-indigo-900">拓展延伸</h3>
        </div>
        <div className="prose prose-stone max-w-none">
          <p className="text-stone-700 leading-relaxed whitespace-pre-line">
            {extension}
          </p>
        </div>
      </section>
    );
  }

  const { related_quotes, related_materials, reading_suggestions, exam_tips } = extension;
  const hasContent =
    (related_quotes && related_quotes.length > 0) ||
    (related_materials && related_materials.length > 0) ||
    reading_suggestions ||
    exam_tips;

  if (!hasContent) return null;

  return (
    <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500 rounded-xl text-white">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-indigo-900">拓展延伸</h3>
      </div>
      <div className="space-y-4">
        {reading_suggestions && (
          <div className="text-sm text-stone-700">
            <span className="font-medium text-indigo-700">阅读建议：</span>
            {reading_suggestions}
          </div>
        )}
        {exam_tips && (
          <div className="p-3 bg-white/70 rounded text-sm text-indigo-800">
            <span className="font-medium">考场提示：</span>
            {exam_tips}
          </div>
        )}
        {related_quotes && related_quotes.length > 0 && (
          <div>
            <p className="text-sm font-medium text-indigo-700 mb-2">相关金句</p>
            <ul className="space-y-1 text-sm text-stone-700">
              {related_quotes.map((quote, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>{quote}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {related_materials && related_materials.length > 0 && (
          <div>
            <p className="text-sm font-medium text-indigo-700 mb-2">相关素材</p>
            <ul className="space-y-1 text-sm text-stone-700">
              {related_materials.map((material, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>{material}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

// =====================================================
// 标签
// =====================================================

function MaterialTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tag className="w-4 h-4 text-stone-400" />
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm hover:bg-stone-200 cursor-pointer transition-colors"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default MaterialContentRenderer;
