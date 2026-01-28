import request from "../request";

// ============================================
// Types - Question
// ============================================

export type QuestionType = "single_choice" | "multi_choice" | "fill_blank" | "essay" | "material" | "judge";
export type QuestionSourceType = "real_exam" | "mock" | "original";

export interface QuestionOption {
  key: string;
  content: string;
}

export interface Question {
  id: number;
  category_id: number;
  question_type: QuestionType;
  difficulty: number;
  source_type: QuestionSourceType;
  source_year?: number;
  source_region?: string;
  source_exam?: string;
  content: string;
  material_id?: number;
  options?: QuestionOption[];
  answer?: string; // Only visible after answering
  analysis?: string; // Only visible after answering
  tips?: string;
  knowledge_points?: number[];
  tags?: string[];
  attempt_count: number;
  correct_rate: number;
  avg_time: number;
  is_vip: boolean;
  category?: {
    id: number;
    name: string;
  };
}

export interface QuestionMaterial {
  id: number;
  title: string;
  content: string;
  content_type: "text" | "table" | "chart";
}

// ============================================
// Types - Paper
// ============================================

export type PaperType = "real_exam" | "mock" | "daily" | "custom";

export interface PaperQuestion {
  question_id: number;
  score: number;
  order: number;
}

export interface PaperSection {
  name: string;
  question_ids: number[];
}

export interface ExamPaper {
  id: number;
  title: string;
  paper_type: PaperType;
  exam_type?: string;
  subject?: string;
  year?: number;
  region?: string;
  total_questions: number;
  total_score: number;
  time_limit: number;
  questions?: PaperQuestion[];
  sections?: PaperSection[];
  is_free: boolean;
  attempt_count: number;
  avg_score: number;
  description?: string;
  cover_image?: string;
  // 用户相关（如已做过）
  user_best_score?: number;
  user_attempt_count?: number;
  user_last_attempt?: string;
}

// ============================================
// Types - User Records
// ============================================

export interface UserQuestionRecord {
  id: number;
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  time_spent: number;
  practice_type: string;
  created_at: string;
}

export interface UserPaperRecord {
  id: number;
  paper_id: number;
  paper_title?: string;
  status: "in_progress" | "completed" | "timeout";
  start_time: string;
  end_time?: string;
  total_score: number;
  user_score: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  total_time: number;
}

export interface PaperAnswer {
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  score: number;
}

export interface UserStats {
  total_attempts: number;
  today_attempts: number;
  correct_rate: number;
  consecutive_days: number;
  total_study_time: number;
}

export interface CategoryProgressStat {
  category_id: number;
  category_name: string;
  total_questions: number;
  done_count: number;
  correct_count: number;
  progress: number;
  correct_rate: number;
}

// ============================================
// Types - Request/Response
// ============================================

export interface QuestionListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  category_id?: number;
  question_type?: QuestionType;
  difficulty?: number;
  source_type?: QuestionSourceType;
  source_year?: number;
}

export interface PaperListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  paper_type?: PaperType;
  exam_type?: string;
  subject?: string;
  year?: number;
  region?: string;
  is_free?: boolean;
}

export interface SubmitAnswerRequest {
  question_id: number;
  user_answer: string;
  time_spent: number;
  practice_type?: string;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  analysis?: string;
  tips?: string;
}

export interface StartPaperResponse {
  record_id: number;
  paper: ExamPaper;
  questions: Question[];
}

export interface SubmitPaperRequest {
  answers: {
    question_id: number;
    user_answer: string;
  }[];
  total_time: number;
}

export interface PaperResultResponse {
  record: UserPaperRecord;
  answers: PaperAnswer[];
  questions: Question[];
}

export interface PaperRankingInfo {
  user_rank: number;
  total_participants: number;
  user_score: number;
  avg_score: number;
  highest_score: number;
  lowest_score: number;
  percentile: number;
}

export interface WrongQuestionItem {
  question: Question;
  last_wrong_at: string;
  wrong_count: number;
}

export interface CollectItem {
  question: Question;
  note?: string;
  collected_at: string;
}

// ============================================
// Types - Practice Session
// ============================================

export type PracticeSessionType = "specialized" | "random" | "timed" | "wrong_redo";
export type PracticeSessionStatus = "pending" | "active" | "completed" | "abandoned";

export interface PracticeSessionConfig {
  question_count: number;
  category_ids?: number[];
  question_types?: string[];
  difficulties?: number[];
  smart_random?: boolean;
  time_limit_per_question?: number;
  total_time_limit?: number;
  show_countdown?: boolean;
  wrong_date_range?: number;
  only_recent?: boolean;
}

export interface SessionQuestion {
  question_id: number;
  order: number;
  user_answer?: string;
  is_correct?: boolean;
  time_spent?: number;
  answered_at?: string;
  question?: Question;
}

export interface PracticeSession {
  id: number;
  session_type: PracticeSessionType;
  title: string;
  total_questions: number;
  completed_count: number;
  correct_count: number;
  wrong_count: number;
  total_time_spent: number;
  time_limit: number;
  status: PracticeSessionStatus;
  progress: number;
  correct_rate: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  // 断点续做相关
  current_index: number;
  last_saved_at?: string;
  is_interrupted: boolean;
  interrupt_reason?: string;
  can_resume: boolean;
}

// 断点续做相关请求
export interface SaveProgressRequest {
  current_index: number;
  total_time_spent: number;
  answers: {
    question_id: number;
    user_answer: string;
    time_spent: number;
  }[];
}

export interface InterruptSessionRequest {
  reason?: string;
  current_index: number;
  total_time_spent: number;
  answers?: {
    question_id: number;
    user_answer: string;
    time_spent: number;
  }[];
}

export interface PracticeSessionDetail extends PracticeSession {
  config: PracticeSessionConfig;
  questions: SessionQuestion[];
}

export interface CreatePracticeSessionRequest {
  session_type: PracticeSessionType;
  title?: string;
  question_count: number;
  category_ids?: number[];
  question_types?: string[];
  difficulties?: number[];
  smart_random?: boolean;
  time_limit_per_question?: number;
  total_time_limit?: number;
  show_countdown?: boolean;
  wrong_date_range?: number;
  only_recent?: boolean;
}

export interface SubmitSessionAnswerRequest {
  question_id: number;
  user_answer: string;
  time_spent?: number;
}

export interface PracticeTemplate {
  id: string;
  name: string;
  description: string;
  session_type: PracticeSessionType;
  config: PracticeSessionConfig;
  icon: string;
  color: string;
}

export interface PracticeStats {
  total_sessions: number;
  total_questions: number;
  total_correct: number;
  total_time_spent: number;
  avg_correct_rate: number;
}

// ============================================
// API Functions
// ============================================

export const practiceApi = {
  // ============ Questions ============
  
  // Get question list
  getQuestions: (params?: QuestionListParams) => {
    return request.get<{
      questions: Question[];
      total: number;
      page: number;
      page_size: number;
    }>("/questions", { params });
  },

  // Get question detail
  getQuestion: (id: number) => {
    return request.get<Question>(`/questions/${id}`);
  },

  // Get practice questions (random or filtered)
  getPracticeQuestions: (params: {
    category_id?: number;
    question_type?: QuestionType;
    difficulty?: number;
    count?: number;
  }) => {
    return request.get<{ questions: Question[] }>("/questions/practice", { params });
  },

  // Submit answer
  submitAnswer: (data: SubmitAnswerRequest) => {
    return request.post<SubmitAnswerResponse>(`/questions/${data.question_id}/answer`, data);
  },

  // Get similar questions
  getSimilarQuestions: (questionId: number, limit?: number) => {
    return request.get<{ questions: Question[] }>(`/questions/${questionId}/similar`, {
      params: { limit: limit || 5 },
    });
  },

  // Get knowledge point info
  getKnowledgePoint: (id: number) => {
    return request.get<{
      id: number;
      name: string;
      description: string;
      parent_id?: number;
      question_count: number;
      study_url?: string;
    }>(`/knowledge-points/${id}`);
  },

  // ============ Papers ============
  
  // Get paper list
  getPapers: (params?: PaperListParams) => {
    return request.get<{
      papers: ExamPaper[];
      total: number;
      page: number;
      page_size: number;
    }>("/papers", { params });
  },

  // Get paper detail
  getPaper: (id: number) => {
    return request.get<ExamPaper>(`/papers/${id}`);
  },

  // Start paper (create user record)
  startPaper: (paperId: number) => {
    return request.post<StartPaperResponse>(`/papers/${paperId}/start`);
  },

  // Submit paper
  submitPaper: (paperId: number, data: SubmitPaperRequest) => {
    return request.post<{ record_id: number }>(`/papers/${paperId}/submit`, data);
  },

  // Get paper result
  getPaperResult: (paperId: number, recordId: number) => {
    return request.get<PaperResultResponse>(`/papers/${paperId}/result`, { params: { record_id: recordId } });
  },

  // Get paper ranking
  getPaperRanking: (paperId: number, recordId: number) => {
    return request.get<PaperRankingInfo>(`/papers/${paperId}/ranking`, { params: { record_id: recordId } });
  },

  // Get user's paper records
  getUserPaperRecords: (params?: { page?: number; page_size?: number }) => {
    return request.get<{
      records: UserPaperRecord[];
      total: number;
    }>("/user/paper-records", { params });
  },

  // ============ User Stats ============
  
  // Get user practice stats
  getUserStats: () => {
    return request.get<UserStats>("/user/question-stats");
  },

  // Get category progress (done/undone stats)
  getCategoryProgress: (subject?: string) => {
    return request.get<{ progress: CategoryProgressStat[] }>("/questions/category-progress", {
      params: subject ? { subject } : undefined,
    });
  },

  // Get wrong questions
  getWrongQuestions: (params?: { 
    page?: number; 
    page_size?: number;
    category_id?: number;
  }) => {
    return request.get<{
      questions: WrongQuestionItem[];
      total: number;
    }>("/user/wrong-questions", { params });
  },

  // ============ Collections ============
  
  // Collect question
  collectQuestion: (questionId: number, note?: string) => {
    return request.post(`/questions/${questionId}/collect`, { note });
  },

  // Uncollect question
  uncollectQuestion: (questionId: number) => {
    return request.delete(`/questions/${questionId}/collect`);
  },

  // Get collected questions
  getCollectedQuestions: (params?: { page?: number; page_size?: number }) => {
    return request.get<{
      collects: CollectItem[];
      total: number;
    }>("/user/collects", { params });
  },

  // Update collect note
  updateCollectNote: (questionId: number, note: string) => {
    return request.put(`/questions/${questionId}/collect`, { note });
  },

  // ============ Practice Sessions ============

  // Create a new practice session
  createSession: (data: CreatePracticeSessionRequest) => {
    return request.post<PracticeSessionDetail>("/api/v1/practice/session", data);
  },

  // Get session detail
  getSession: (sessionId: number) => {
    return request.get<PracticeSessionDetail>(`/api/v1/practice/session/${sessionId}`);
  },

  // Start a session
  startSession: (sessionId: number) => {
    return request.post<PracticeSessionDetail>(`/api/v1/practice/session/${sessionId}/start`);
  },

  // Submit answer for session
  submitSessionAnswer: (sessionId: number, data: SubmitSessionAnswerRequest) => {
    return request.post<{
      is_correct: boolean;
      answer: string;
      analysis?: string;
      tips?: string;
    }>(`/api/v1/practice/session/${sessionId}/answer`, data);
  },

  // Abandon session
  abandonSession: (sessionId: number) => {
    return request.post(`/api/v1/practice/session/${sessionId}/abandon`);
  },

  // Get user's sessions
  getUserSessions: (params?: { page?: number; page_size?: number }) => {
    return request.get<{
      data: PracticeSession[];
      total: number;
      page: number;
      page_size: number;
    }>("/api/v1/practice/session/list", { params });
  },

  // Get active sessions
  getActiveSessions: () => {
    return request.get<PracticeSession[]>("/api/v1/practice/session/active");
  },

  // Get practice stats
  getPracticeStats: () => {
    return request.get<PracticeStats>("/api/v1/practice/session/stats");
  },

  // Get quick templates
  getQuickTemplates: () => {
    return request.get<PracticeTemplate[]>("/api/v1/practice/session/templates");
  },

  // ============ 断点续做 (Resume) ============

  // Save session progress (auto-save)
  saveProgress: (sessionId: number, data: SaveProgressRequest) => {
    return request.post<{ message: string }>(`/api/v1/practice/session/${sessionId}/save`, data);
  },

  // Interrupt session (when user leaves)
  interruptSession: (sessionId: number, data: InterruptSessionRequest) => {
    return request.post<{ message: string }>(`/api/v1/practice/session/${sessionId}/interrupt`, data);
  },

  // Resume an interrupted session
  resumeSession: (sessionId: number) => {
    return request.post<PracticeSessionDetail>(`/api/v1/practice/session/${sessionId}/resume`);
  },

  // Get all resumable sessions
  getResumableSessions: () => {
    return request.get<PracticeSession[]>("/api/v1/practice/session/resumable");
  },

  // Get latest resumable session (for auto-prompt)
  getLatestResumable: () => {
    return request.get<PracticeSessionDetail | null>("/api/v1/practice/session/resumable/latest");
  },
};

// ============================================
// Helper Functions
// ============================================

export const getQuestionTypeName = (type: QuestionType): string => {
  const names: Record<QuestionType, string> = {
    single_choice: "单选题",
    multi_choice: "多选题",
    fill_blank: "填空题",
    essay: "简答题",
    material: "材料题",
    judge: "判断题",
  };
  return names[type] || type;
};

export const getQuestionTypeIcon = (type: QuestionType): string => {
  const icons: Record<QuestionType, string> = {
    single_choice: "○",
    multi_choice: "☐",
    fill_blank: "___",
    essay: "📝",
    material: "📄",
    judge: "✓✗",
  };
  return icons[type] || "?";
};

export const getSourceTypeName = (type: QuestionSourceType): string => {
  const names: Record<QuestionSourceType, string> = {
    real_exam: "真题",
    mock: "模拟题",
    original: "原创题",
  };
  return names[type] || type;
};

export const getDifficultyLabel = (difficulty: number): string => {
  const labels: Record<number, string> = {
    1: "入门",
    2: "简单",
    3: "中等",
    4: "困难",
    5: "极难",
  };
  return labels[difficulty] || `难度${difficulty}`;
};

export const getDifficultyColor = (difficulty: number): string => {
  const colors: Record<number, string> = {
    1: "bg-green-100 text-green-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-amber-100 text-amber-700",
    4: "bg-orange-100 text-orange-700",
    5: "bg-red-100 text-red-700",
  };
  return colors[difficulty] || "bg-gray-100 text-gray-700";
};

export const getPaperTypeName = (type: PaperType): string => {
  const names: Record<PaperType, string> = {
    real_exam: "真题卷",
    mock: "模拟卷",
    daily: "每日练习",
    custom: "自定义",
  };
  return names[type] || type;
};

export const getSubjectName = (subject: string): string => {
  const names: Record<string, string> = {
    xingce: "行测",
    shenlun: "申论",
    mianshi: "面试",
    gongji: "公基",
  };
  return names[subject] || subject;
};

export const getExamTypeName = (examType: string): string => {
  const names: Record<string, string> = {
    guokao: "国考",
    shengkao: "省考",
    shiyedanwei: "事业单位",
    xuandiao: "选调",
    junduiwenzhi: "军队文职",
  };
  return names[examType] || examType;
};

export const getRegionName = (region: string): string => {
  const names: Record<string, string> = {
    national: "国家级",
    beijing: "北京",
    shanghai: "上海",
    guangdong: "广东",
    jiangsu: "江苏",
    zhejiang: "浙江",
    shandong: "山东",
    sichuan: "四川",
    hubei: "湖北",
    hunan: "湖南",
    henan: "河南",
    hebei: "河北",
    fujian: "福建",
    liaoning: "辽宁",
    shaanxi: "陕西",
    anhui: "安徽",
    jiangxi: "江西",
    shanxi: "山西",
    yunnan: "云南",
    guizhou: "贵州",
    chongqing: "重庆",
    tianjin: "天津",
    jilin: "吉林",
    heilongjiang: "黑龙江",
    guangxi: "广西",
    hainan: "海南",
    gansu: "甘肃",
    qinghai: "青海",
    ningxia: "宁夏",
    xinjiang: "新疆",
    xizang: "西藏",
    neimenggu: "内蒙古",
  };
  return names[region] || region;
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const getSessionTypeName = (type: PracticeSessionType): string => {
  const names: Record<PracticeSessionType, string> = {
    specialized: "专项练习",
    random: "随机练习",
    timed: "计时练习",
    wrong_redo: "错题重做",
  };
  return names[type] || type;
};

export const getSessionStatusName = (status: PracticeSessionStatus): string => {
  const names: Record<PracticeSessionStatus, string> = {
    pending: "待开始",
    active: "进行中",
    completed: "已完成",
    abandoned: "已放弃",
  };
  return names[status] || status;
};

export const getSessionStatusColor = (status: PracticeSessionStatus): string => {
  const colors: Record<PracticeSessionStatus, string> = {
    pending: "bg-gray-100 text-gray-700",
    active: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    abandoned: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
};
