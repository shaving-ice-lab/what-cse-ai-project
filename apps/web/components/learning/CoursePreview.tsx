"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Target,
  BookOpen,
  AlertTriangle,
  HelpCircle,
  Map,
  CheckCircle2,
  Loader2,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Brain,
  Lightbulb,
  Clock,
} from "lucide-react";
import { useCoursePreview } from "@/hooks/useAIContent";
import { AIContent } from "@/services/api/ai-content";

interface CoursePreviewProps {
  courseId: number;
  courseName?: string;
  onStartLearning?: () => void;
  onQuizStart?: () => void;
  className?: string;
}

// AI预习要点卡片
function PreviewPointCard({ 
  icon: Icon, 
  title, 
  points, 
  color 
}: { 
  icon: typeof Target; 
  title: string; 
  points: string[]; 
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-semibold text-stone-800">{title}</h4>
      </div>
      <ul className="space-y-2">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 预习小测卡片
function PreQuizCard({ 
  questions, 
  onStart 
}: { 
  questions?: number; 
  onStart?: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-lg">预习自测</h4>
          <p className="text-sm text-white/80">{questions || 5}道题目测试你的预习效果</p>
        </div>
      </div>
      <p className="text-sm text-white/90 mb-4">
        完成预习自测，检验你对基础知识的掌握程度，为正式学习做好准备。
      </p>
      <button
        onClick={onStart}
        className="w-full py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
      >
        开始自测
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// 知识体系定位卡片
function KnowledgePositionCard({ 
  currentTopic,
  relatedTopics 
}: { 
  currentTopic: string;
  relatedTopics?: { name: string; relation: string }[];
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
          <Map className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-semibold text-stone-800">知识体系定位</h4>
      </div>
      
      {/* 当前知识点 */}
      <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">当前学习</span>
        </div>
        <p className="text-lg font-semibold text-purple-900">{currentTopic}</p>
      </div>

      {/* 关联知识点 */}
      {relatedTopics && relatedTopics.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-stone-500 mb-2">关联知识点：</p>
          {relatedTopics.map((topic, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg">
              <span className="text-sm text-stone-700">{topic.name}</span>
              <span className="text-xs text-stone-500 px-2 py-0.5 bg-white rounded">
                {topic.relation}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CoursePreview({
  courseId,
  courseName,
  onStartLearning,
  onQuizStart,
  className,
}: CoursePreviewProps) {
  const { loading, preview, error } = useCoursePreview(courseId);
  const content = preview?.content as AIContent | undefined;

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-20", className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-stone-500">正在生成预习内容...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-stone-800 mb-2">AI预习内容准备中</h3>
        <p className="text-stone-500 mb-4">系统正在为您生成个性化的预习要点</p>
        <button
          onClick={onStartLearning}
          className="px-6 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          直接开始学习
        </button>
      </div>
    );
  }

  // 解析预习内容
  const previewPoints = content.preview_points || [];
  const mainPoints = content.main_points || [];
  const tips = content.tips || [];
  const estimatedTime = content.estimated_time || 30;

  // 将要点分类
  const learningGoals = previewPoints.slice(0, 3);
  const priorKnowledge = mainPoints.slice(0, 3);
  const keyDifficulties = tips.slice(0, 3);

  return (
    <div className={cn("space-y-6", className)}>
      {/* 头部 */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI 预习要点</h3>
            <p className="text-sm text-white/80">{courseName || "课程预习"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>预计 {estimatedTime} 分钟</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{learningGoals.length} 个学习目标</span>
          </div>
        </div>
      </div>

      {/* 预习要点卡片 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 学习目标 */}
        {learningGoals.length > 0 && (
          <PreviewPointCard
            icon={Target}
            title="本课学习目标"
            points={learningGoals}
            color="bg-blue-500"
          />
        )}

        {/* 前置知识 */}
        {priorKnowledge.length > 0 && (
          <PreviewPointCard
            icon={BookOpen}
            title="前置知识回顾"
            points={priorKnowledge}
            color="bg-green-500"
          />
        )}

        {/* 重点难点 */}
        {keyDifficulties.length > 0 && (
          <PreviewPointCard
            icon={AlertTriangle}
            title="重点难点预告"
            points={keyDifficulties}
            color="bg-amber-500"
          />
        )}

        {/* 预习问题引导 */}
        <div className="bg-white rounded-xl border border-stone-200/50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-stone-800">预习思考问题</h4>
          </div>
          <div className="space-y-3">
            {(content.summary ? [content.summary] : ["这个知识点的核心概念是什么？", "它与之前学过的内容有什么联系？", "在实际考试中可能怎么考？"]).slice(0, 3).map((question, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-stone-700">{question}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 知识体系定位 */}
      <KnowledgePositionCard
        currentTopic={courseName || "当前课程"}
        relatedTopics={[
          { name: "基础概念", relation: "前置知识" },
          { name: "进阶应用", relation: "后续学习" },
        ]}
      />

      {/* 预习自测 */}
      <PreQuizCard questions={5} onStart={onQuizStart} />

      {/* 开始学习按钮 */}
      <button
        onClick={onStartLearning}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
      >
        预习完成，开始正式学习
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default CoursePreview;
