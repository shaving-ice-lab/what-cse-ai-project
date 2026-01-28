import { useState, useCallback, useEffect } from "react";
import * as aiContentApi from "@/services/api/ai-content";

// =====================================================
// AI 内容 Hook
// =====================================================

export function useAIContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取题目解析
  const fetchQuestionAnalysis = useCallback(async (questionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getQuestionAnalysis(questionId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取题目解析失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取解题技巧
  const fetchQuestionTips = useCallback(async (questionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getQuestionTips(questionId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取解题技巧失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取相似题目
  const fetchSimilarQuestions = useCallback(async (questionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getSimilarQuestions(questionId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取相似题目失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取知识点总结
  const fetchKnowledgeSummary = useCallback(async (knowledgePointId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getKnowledgeSummary(knowledgePointId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取知识点总结失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取知识点思维导图
  const fetchKnowledgeMindmap = useCallback(async (knowledgePointId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getKnowledgeMindmap(knowledgePointId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取思维导图失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取章节总结
  const fetchChapterSummary = useCallback(async (chapterId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getChapterSummary(chapterId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取章节总结失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取章节重点
  const fetchChapterKeypoints = useCallback(async (chapterId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getChapterKeypoints(chapterId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取章节重点失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取章节配套练习
  const fetchChapterExercises = useCallback(async (chapterId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getChapterExercises(chapterId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取章节练习失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取课程预习要点
  const fetchCoursePreview = useCallback(async (courseId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getCoursePreview(courseId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取预习要点失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取课程复习要点
  const fetchCourseReview = useCallback(async (courseId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getCourseReview(courseId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取复习要点失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取课程大纲
  const fetchCourseOutline = useCallback(async (courseId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiContentApi.getCourseOutline(courseId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取课程大纲失败";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchQuestionAnalysis,
    fetchQuestionTips,
    fetchSimilarQuestions,
    fetchKnowledgeSummary,
    fetchKnowledgeMindmap,
    fetchChapterSummary,
    fetchChapterKeypoints,
    fetchChapterExercises,
    fetchCoursePreview,
    fetchCourseReview,
    fetchCourseOutline,
  };
}

// =====================================================
// 课程预习内容 Hook
// =====================================================

export function useCoursePreview(courseId: number | null) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<aiContentApi.AIGeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await aiContentApi.getCoursePreview(courseId);
        setPreview(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "获取预习要点失败";
        setError(message);
        setPreview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [courseId]);

  return { loading, preview, error };
}

// =====================================================
// 课程复习内容 Hook
// =====================================================

export function useCourseReview(courseId: number | null) {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<aiContentApi.AIGeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchReview = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await aiContentApi.getCourseReview(courseId);
        setReview(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "获取复习要点失败";
        setError(message);
        setReview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [courseId]);

  return { loading, review, error };
}

// =====================================================
// 章节内容 Hook
// =====================================================

export function useChapterAIContent(chapterId: number | null) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<aiContentApi.AIGeneratedContent | null>(null);
  const [keypoints, setKeypoints] = useState<aiContentApi.AIGeneratedContent | null>(null);
  const [exercises, setExercises] = useState<aiContentApi.AIGeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!chapterId) return;

    setLoading(true);
    setError(null);

    try {
      const [summaryResult, keypointsResult, exercisesResult] = await Promise.allSettled([
        aiContentApi.getChapterSummary(chapterId),
        aiContentApi.getChapterKeypoints(chapterId),
        aiContentApi.getChapterExercises(chapterId),
      ]);

      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value);
      }
      if (keypointsResult.status === "fulfilled") {
        setKeypoints(keypointsResult.value);
      }
      if (exercisesResult.status === "fulfilled") {
        setExercises(exercisesResult.value);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取章节内容失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { loading, summary, keypoints, exercises, error, refetch: fetchAll };
}

// =====================================================
// 题目AI内容 Hook
// =====================================================

export function useQuestionAIContent(questionId: number | null) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<aiContentApi.AIGeneratedContent | null>(null);
  const [tips, setTips] = useState<aiContentApi.AIGeneratedContent | null>(null);
  const [similar, setSimilar] = useState<aiContentApi.AIGeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!questionId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await aiContentApi.getQuestionAnalysis(questionId);
      setAnalysis(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "获取题目解析失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  const fetchTips = useCallback(async () => {
    if (!questionId) return;

    try {
      const result = await aiContentApi.getQuestionTips(questionId);
      setTips(result);
    } catch (err) {
      console.error("获取解题技巧失败:", err);
    }
  }, [questionId]);

  const fetchSimilar = useCallback(async () => {
    if (!questionId) return;

    try {
      const result = await aiContentApi.getSimilarQuestions(questionId);
      setSimilar(result);
    } catch (err) {
      console.error("获取相似题目失败:", err);
    }
  }, [questionId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return { 
    loading, 
    analysis, 
    tips, 
    similar, 
    error, 
    fetchTips, 
    fetchSimilar,
    refetchAnalysis: fetchAnalysis 
  };
}
