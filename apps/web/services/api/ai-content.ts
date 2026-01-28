import request from "../request";

// =====================================================
// AI 内容类型定义
// =====================================================

// AI内容类型
export type AIContentType = 
  | "question_analysis"
  | "question_tips"
  | "question_similar"
  | "question_extension"
  | "knowledge_summary"
  | "knowledge_mindmap"
  | "knowledge_keypoints"
  | "knowledge_examples"
  | "chapter_summary"
  | "chapter_keypoints"
  | "chapter_exercises"
  | "course_outline"
  | "course_preview"
  | "course_review"
  | "learning_path"
  | "weak_point_analysis"
  | "error_analysis"
  | "progress_evaluation"
  | "ability_report";

// AI关联类型
export type AIRelatedType = "question" | "course" | "chapter" | "knowledge_point" | "user";

// AI内容状态
export type AIContentStatus = "pending" | "approved" | "rejected" | "expired";

// 思维导图节点
export interface MindmapNode {
  id: string;
  label: string;
  color?: string;
  children?: MindmapNode[];
}

// 思维导图数据
export interface MindmapData {
  root: MindmapNode;
  children?: MindmapNode[];
}

// 例题
export interface ExampleQuestion {
  question_id?: number;
  question: string;
  options?: string[];
  answer: string;
  analysis: string;
}

// 大纲项
export interface OutlineItem {
  title: string;
  duration?: number;
  children?: OutlineItem[];
}

// 学习步骤
export interface LearningStep {
  step: number;
  title: string;
  description: string;
  duration?: number;
  resource_id?: number;
}

// 薄弱点
export interface WeakPoint {
  knowledge_id: number;
  knowledge_name: string;
  mastery_level: number;
  suggestion?: string;
  related_course?: number;
}

// AI生成内容
export interface AIContent {
  // 通用字段
  summary?: string;
  main_points?: string[];
  details?: string;

  // 题目解析相关
  analysis?: string;
  key_points?: string[];
  solution_steps?: string[];
  option_analysis?: Record<string, string>;
  common_mistakes?: string[];
  tips?: string[];
  related_knowledge?: number[];
  similar_questions?: number[];
  quick_solution_tips?: string[];

  // 知识点相关
  definition?: string;
  mnemonics?: string;
  common_types?: string[];
  mindmap_data?: MindmapData;
  examples?: ExampleQuestion[];
  key_formulas?: string[];
  memory_methods?: string[];

  // 章节/课程相关
  outline?: OutlineItem[];
  preview_points?: string[];
  review_points?: string[];
  exercises?: number[];

  // 学习路径相关
  learning_steps?: LearningStep[];
  weak_points?: WeakPoint[];
  error_reasons?: string[];
  recommendations?: string[];
  ability_scores?: Record<string, number>;
  progress_percent?: number;
  estimated_time?: number;
}

// AI生成内容响应
export interface AIGeneratedContent {
  id: number;
  content_type: AIContentType;
  related_type: AIRelatedType;
  related_id: number;
  title?: string;
  content: AIContent;
  quality_score: number;
  status: AIContentStatus;
  version: number;
  generated_at: string;
}

// =====================================================
// AI 内容 API
// =====================================================

// 获取题目AI内容
export const getQuestionAIContent = (
  questionId: number,
  contentType: AIContentType
): Promise<AIGeneratedContent> => {
  return request.get(`/ai-content/question/${questionId}/${contentType}`);
};

// 获取知识点AI内容
export const getKnowledgeAIContent = (
  knowledgePointId: number,
  contentType: AIContentType
): Promise<AIGeneratedContent> => {
  return request.get(`/ai-content/knowledge/${knowledgePointId}/${contentType}`);
};

// 获取章节AI内容
export const getChapterAIContent = (
  chapterId: number,
  contentType: AIContentType
): Promise<AIGeneratedContent> => {
  return request.get(`/ai-content/chapter/${chapterId}/${contentType}`);
};

// 获取课程AI内容
export const getCourseAIContent = (
  courseId: number,
  contentType: AIContentType
): Promise<AIGeneratedContent> => {
  return request.get(`/ai-content/course/${courseId}/${contentType}`);
};

// 获取AI内容
export const getAIContent = (id: number): Promise<AIGeneratedContent> => {
  return request.get(`/ai-content/${id}`);
};

// =====================================================
// 便捷获取方法
// =====================================================

// 获取题目解析
export const getQuestionAnalysis = (questionId: number) => 
  getQuestionAIContent(questionId, "question_analysis");

// 获取解题技巧
export const getQuestionTips = (questionId: number) => 
  getQuestionAIContent(questionId, "question_tips");

// 获取相似题目
export const getSimilarQuestions = (questionId: number) => 
  getQuestionAIContent(questionId, "question_similar");

// 获取知识点总结
export const getKnowledgeSummary = (knowledgePointId: number) => 
  getKnowledgeAIContent(knowledgePointId, "knowledge_summary");

// 获取知识点思维导图
export const getKnowledgeMindmap = (knowledgePointId: number) => 
  getKnowledgeAIContent(knowledgePointId, "knowledge_mindmap");

// 获取章节总结
export const getChapterSummary = (chapterId: number) => 
  getChapterAIContent(chapterId, "chapter_summary");

// 获取章节重点
export const getChapterKeypoints = (chapterId: number) => 
  getChapterAIContent(chapterId, "chapter_keypoints");

// 获取章节配套练习
export const getChapterExercises = (chapterId: number) => 
  getChapterAIContent(chapterId, "chapter_exercises");

// 获取课程预习要点
export const getCoursePreview = (courseId: number) => 
  getCourseAIContent(courseId, "course_preview");

// 获取课程复习要点
export const getCourseReview = (courseId: number) => 
  getCourseAIContent(courseId, "course_review");

// 获取课程大纲
export const getCourseOutline = (courseId: number) => 
  getCourseAIContent(courseId, "course_outline");
