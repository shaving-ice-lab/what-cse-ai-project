import { useState, useCallback } from "react";
import {
  courseApi,
  CourseQueryParams,
  CourseListResponse,
  CourseDetail,
  CourseBrief,
  CourseCategory,
  CourseChapter,
  ChapterContentResponse,
  KnowledgePoint,
  UserCourseProgress,
  UserCourseCollect,
  UpdateProgressRequest,
  LearningContent,
  LearningContentType,
  LearningContentQueryParams,
  LearningContentFilterOption,
} from "@/services/api/course";
import { toast } from "@what-cse/ui";

// =====================================================
// 课程分类 Hook
// =====================================================

export function useCourseCategories() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CourseCategory[]>([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await courseApi.getCategories();
      setCategories(result.categories || []);
      return result.categories;
    } catch (error) {
      toast.error("获取分类失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoriesBySubject = useCallback(async (subject: string) => {
    setLoading(true);
    try {
      const result = await courseApi.getCategoriesBySubject(subject);
      setCategories(result.categories || []);
      return result.categories;
    } catch (error) {
      toast.error("获取分类失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    categories,
    fetchCategories,
    fetchCategoriesBySubject,
  };
}

// =====================================================
// 课程列表 Hook
// =====================================================

export function useCourses() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CourseListResponse | null>(null);

  const fetchCourses = useCallback(async (params?: CourseQueryParams) => {
    setLoading(true);
    try {
      const result = await courseApi.getCourses(params);
      setData(result);
      return result;
    } catch (error) {
      toast.error("获取课程列表失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedCourses = useCallback(async (limit?: number) => {
    setLoading(true);
    try {
      const result = await courseApi.getFeaturedCourses(limit);
      return result.courses || [];
    } catch (error) {
      toast.error("获取推荐课程失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFreeCourses = useCallback(async (limit?: number) => {
    setLoading(true);
    try {
      const result = await courseApi.getFreeCourses(limit);
      return result.courses || [];
    } catch (error) {
      toast.error("获取免费课程失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    data,
    courses: data?.courses || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.page_size || 20,
    fetchCourses,
    fetchFeaturedCourses,
    fetchFreeCourses,
  };
}

// =====================================================
// 课程详情 Hook
// =====================================================

export function useCourse() {
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<CourseDetail | null>(null);

  const fetchCourse = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const result = await courseApi.getCourse(id);
      setCourse(result);
      return result;
    } catch (error) {
      toast.error("获取课程详情失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const collectCourse = useCallback(
    async (courseId: number) => {
      try {
        await courseApi.collectCourse(courseId);
        toast.success("收藏成功");
        // Update local state
        if (course && course.id === courseId) {
          setCourse({ ...course, is_collected: true, collect_count: course.collect_count + 1 });
        }
      } catch (error) {
        toast.error("收藏失败");
        throw error;
      }
    },
    [course]
  );

  const uncollectCourse = useCallback(
    async (courseId: number) => {
      try {
        await courseApi.uncollectCourse(courseId);
        toast.success("已取消收藏");
        // Update local state
        if (course && course.id === courseId) {
          setCourse({
            ...course,
            is_collected: false,
            collect_count: Math.max(0, course.collect_count - 1),
          });
        }
      } catch (error) {
        toast.error("取消收藏失败");
        throw error;
      }
    },
    [course]
  );

  return {
    loading,
    course,
    fetchCourse,
    collectCourse,
    uncollectCourse,
  };
}

// =====================================================
// 章节内容 Hook
// =====================================================

export function useChapter() {
  const [loading, setLoading] = useState(false);
  const [chapter, setChapter] = useState<CourseChapter | null>(null);
  const [fullContent, setFullContent] = useState<ChapterContentResponse | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // 获取章节基础信息
  const fetchChapter = useCallback(async (chapterId: number) => {
    setLoading(true);
    try {
      const result = await courseApi.getChapterContent(chapterId);
      setChapter(result);
      return result;
    } catch (error) {
      toast.error("获取章节内容失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取章节完整内容（含 13 个模块）
  const fetchChapterFullContent = useCallback(async (chapterId: number) => {
    setContentLoading(true);
    try {
      const result = await courseApi.getChapterFullContent(chapterId);
      setFullContent(result);
      // 同时更新基础章节信息
      if (result.chapter) {
        setChapter(result.chapter);
      }
      return result;
    } catch (error) {
      // 如果获取完整内容失败，回退到基础内容
      console.warn("获取完整内容失败，回退到基础内容");
      return null;
    } finally {
      setContentLoading(false);
    }
  }, []);

  // 检查是否有模块化内容
  const hasModuleContent = fullContent?.modules && fullContent.modules.length > 0;

  // 解析内容为 LessonContent 格式
  const parsedLessonContent = fullContent?.content
    ? {
        exam_analysis: fullContent.content.exam_analysis as any,
        lesson_content: fullContent.content.lesson_content as any,
        lesson_sections: fullContent.content.lesson_sections as any,
        practice_problems: fullContent.content.practice_problems as any,
        homework: fullContent.content.homework as any,
      }
    : null;

  return {
    loading,
    chapter,
    fullContent,
    contentLoading,
    hasModuleContent,
    parsedLessonContent,
    fetchChapter,
    fetchChapterFullContent,
  };
}

// =====================================================
// 用户学习记录 Hook
// =====================================================

export function useMyLearning() {
  const [loading, setLoading] = useState(false);
  const [recentCourses, setRecentCourses] = useState<UserCourseProgress[]>([]);
  const [learningCourses, setLearningCourses] = useState<UserCourseProgress[]>([]);
  const [collectedCourses, setCollectedCourses] = useState<UserCourseCollect[]>([]);
  const [total, setTotal] = useState(0);

  const fetchRecentLearning = useCallback(async (limit?: number) => {
    setLoading(true);
    try {
      const result = await courseApi.getRecentLearning(limit);
      setRecentCourses(result.courses || []);
      return result.courses || [];
    } catch (error) {
      // Don't show error for unauthenticated users
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyLearning = useCallback(async (page?: number, pageSize?: number) => {
    setLoading(true);
    try {
      const result = await courseApi.getMyLearning(page, pageSize);
      setLearningCourses(result.courses || []);
      setTotal(result.total || 0);
      return result;
    } catch (error) {
      toast.error("获取学习记录失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyCollects = useCallback(async (page?: number, pageSize?: number) => {
    setLoading(true);
    try {
      const result = await courseApi.getMyCollects(page, pageSize);
      setCollectedCourses(result.collects || []);
      setTotal(result.total || 0);
      return result;
    } catch (error) {
      toast.error("获取收藏列表失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async (courseId: number, data: UpdateProgressRequest) => {
    try {
      await courseApi.updateProgress(courseId, data);
    } catch (error) {
      // Silent fail for progress updates
    }
  }, []);

  return {
    loading,
    recentCourses,
    learningCourses,
    collectedCourses,
    total,
    fetchRecentLearning,
    fetchMyLearning,
    fetchMyCollects,
    updateProgress,
  };
}

// =====================================================
// 知识点 Hook
// =====================================================

export function useKnowledge() {
  const [loading, setLoading] = useState(false);
  const [knowledgeTree, setKnowledgeTree] = useState<KnowledgePoint[]>([]);
  const [hotKnowledge, setHotKnowledge] = useState<KnowledgePoint[]>([]);

  const fetchKnowledgeTree = useCallback(async (categoryId: number) => {
    setLoading(true);
    try {
      const result = await courseApi.getKnowledgeTree(categoryId);
      setKnowledgeTree(result.knowledge_points || []);
      return result.knowledge_points || [];
    } catch (error) {
      toast.error("获取知识点失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHotKnowledge = useCallback(async (categoryId?: number, limit?: number) => {
    setLoading(true);
    try {
      const result = await courseApi.getHotKnowledge(categoryId, limit);
      setHotKnowledge(result.knowledge_points || []);
      return result.knowledge_points || [];
    } catch (error) {
      toast.error("获取高频知识点失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    knowledgeTree,
    hotKnowledge,
    fetchKnowledgeTree,
    fetchHotKnowledge,
  };
}

// =====================================================
// 学习内容 Hook
// =====================================================

export function useLearningContent() {
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<LearningContent[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{
    subjects: LearningContentFilterOption[];
    content_types: LearningContentFilterOption[];
  } | null>(null);
  const [modules, setModules] = useState<LearningContentFilterOption[]>([]);

  // 按类型获取学习内容
  const fetchByType = useCallback(
    async (
      contentType: LearningContentType,
      params?: Omit<LearningContentQueryParams, "content_type">
    ) => {
      setLoading(true);
      try {
        const result = await courseApi.getLearningContent(contentType, params);
        setContents(result.contents || []);
        setTotal(result.total || 0);
        return result.contents || [];
      } catch (error) {
        // Return empty array on error, don't show toast
        setContents([]);
        setTotal(0);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 获取所有学习内容
  const fetchAll = useCallback(async (params?: LearningContentQueryParams) => {
    setLoading(true);
    try {
      const result = await courseApi.getAllLearningContent(params);
      setContents(result.contents || []);
      setTotal(result.total || 0);
      return result.contents || [];
    } catch (error) {
      setContents([]);
      setTotal(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 按科目获取学习内容
  const fetchBySubject = useCallback(async (subject: string, module?: string) => {
    setLoading(true);
    try {
      const result = await courseApi.getLearningContentBySubject(subject, module);
      setContents(result.contents || []);
      return result.contents || [];
    } catch (error) {
      setContents([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取过滤选项
  const fetchFilters = useCallback(async () => {
    try {
      const result = await courseApi.getLearningContentFilters();
      setFilters(result);
      return result;
    } catch (error) {
      return null;
    }
  }, []);

  // 获取某科目下的模块列表
  const fetchModules = useCallback(async (subject: string) => {
    try {
      const result = await courseApi.getLearningContentModules(subject);
      setModules(result.modules || []);
      return result.modules || [];
    } catch (error) {
      setModules([]);
      return [];
    }
  }, []);

  // 获取学习技巧
  const fetchTips = useCallback(
    async (subject?: string, module?: string) => {
      return fetchByType("tips", { subject, module });
    },
    [fetchByType]
  );

  // 获取公式口诀
  const fetchFormulas = useCallback(
    async (subject?: string, module?: string) => {
      return fetchByType("formulas", { subject, module });
    },
    [fetchByType]
  );

  // 获取学习指南
  const fetchGuides = useCallback(
    async (subject?: string, module?: string) => {
      return fetchByType("guides", { subject, module });
    },
    [fetchByType]
  );

  // 获取热点话题
  const fetchHotTopics = useCallback(
    async (subject?: string, module?: string) => {
      return fetchByType("hot_topics", { subject, module });
    },
    [fetchByType]
  );

  // 获取图形规律
  const fetchPatterns = useCallback(
    async (subject?: string, module?: string) => {
      return fetchByType("patterns", { subject, module });
    },
    [fetchByType]
  );

  // 获取学习方法
  const fetchMethods = useCallback(
    async (subject?: string, module?: string) => {
      return fetchByType("methods", { subject, module });
    },
    [fetchByType]
  );

  return {
    loading,
    contents,
    total,
    filters,
    modules,
    fetchByType,
    fetchAll,
    fetchBySubject,
    fetchFilters,
    fetchModules,
    fetchTips,
    fetchFormulas,
    fetchGuides,
    fetchHotTopics,
    fetchPatterns,
    fetchMethods,
  };
}

// =====================================================
// 辅助函数
// =====================================================

// 获取科目名称
export function getSubjectName(subject: string): string {
  const names: Record<string, string> = {
    xingce: "行测",
    shenlun: "申论",
    mianshi: "面试",
    gongji: "公基",
  };
  return names[subject] || subject;
}

// 获取科目图标
export function getSubjectIcon(subject: string): string {
  const icons: Record<string, string> = {
    xingce: "📊",
    shenlun: "📝",
    mianshi: "🎤",
    gongji: "📚",
  };
  return icons[subject] || "📖";
}

// 获取科目颜色
export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    xingce: "bg-blue-500",
    shenlun: "bg-green-500",
    mianshi: "bg-purple-500",
    gongji: "bg-orange-500",
  };
  return colors[subject] || "bg-gray-500";
}

// 获取难度标签
export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    beginner: "入门",
    intermediate: "进阶",
    advanced: "高级",
  };
  return labels[difficulty] || difficulty;
}

// 获取难度颜色
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    beginner: "text-green-600 bg-green-50",
    intermediate: "text-yellow-600 bg-yellow-50",
    advanced: "text-red-600 bg-red-50",
  };
  return colors[difficulty] || "text-gray-600 bg-gray-50";
}

// 获取内容类型标签
export function getContentTypeLabel(contentType: string): string {
  const labels: Record<string, string> = {
    video: "视频",
    document: "文档",
    audio: "音频",
    mixed: "综合",
  };
  return labels[contentType] || contentType;
}

// 格式化时长
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}
