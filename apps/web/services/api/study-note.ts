import { request } from "../request";

// =====================================================
// 错题本类型定义
// =====================================================

export type WrongQuestionStatus = "active" | "mastered" | "removed";

export interface WrongQuestion {
  id: number;
  question_id: number;
  category_id?: number;
  first_wrong_at: string;
  last_wrong_at: string;
  wrong_count: number;
  correct_count: number;
  user_note?: string;
  error_reason?: string;
  status: WrongQuestionStatus;
  last_review_at?: string;
  review_count: number;
  next_review_at?: string;
  created_at: string;
  question?: QuestionBrief;
  category_name?: string;
}

export interface QuestionBrief {
  id: number;
  category_id: number;
  question_type: string;
  difficulty: number;
  source_type: string;
  source_year?: number;
  source_region?: string;
  content: string;
  options?: { key: string; content: string }[];
  tags?: string[];
  attempt_count: number;
  correct_rate: number;
  is_vip: boolean;
  status: number;
}

export interface WrongQuestionStats {
  total_count: number;
  active_count: number;
  mastered_count: number;
  today_new_count: number;
  need_review_count: number;
  category_stats: { category_id: number; category_name: string; count: number }[];
  error_reason_stats: { reason: string; count: number }[];
}

export interface WrongQuestionQueryParams {
  category_id?: number;
  status?: WrongQuestionStatus | "";
  error_reason?: string;
  need_review?: boolean;
  keyword?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: "wrong_count" | "last_wrong_at" | "created_at" | "next_review_at";
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

// =====================================================
// 笔记类型定义
// =====================================================

export type NoteType = "course" | "chapter" | "question" | "knowledge" | "free" | "video";

export interface StudyNote {
  id: number;
  user_id: number;
  note_type: NoteType;
  related_id?: number;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  is_public: boolean;
  like_count: number;
  view_count: number;
  video_time?: number;
  created_at: string;
  updated_at: string;
  author?: NoteAuthor;
  is_liked: boolean;
  is_owner: boolean;
  related_name?: string;
}

export interface NoteAuthor {
  id: number;
  nickname: string;
  avatar?: string;
}

export interface VideoNoteMarker {
  note_id: number;
  time: number;
  time_str: string;
  title: string;
}

export interface UserNoteStats {
  total_notes: number;
  public_notes: number;
  total_likes: number;
  total_views: number;
  course_notes: number;
  question_notes: number;
  knowledge_notes: number;
  free_notes: number;
  video_notes: number;
}

export interface NoteQueryParams {
  note_type?: NoteType | "";
  keyword?: string;
  sort_by?: "created_at" | "updated_at" | "like_count" | "view_count";
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface CreateNoteRequest {
  note_type: NoteType;
  related_id?: number;
  title: string;
  content?: string;
  summary?: string;
  tags?: string[];
  is_public?: boolean;
  video_time?: number;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  is_public?: boolean;
  video_time?: number;
}

// =====================================================
// 错题本 API
// =====================================================

// 获取错题列表
export async function getWrongQuestions(params: WrongQuestionQueryParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.category_id) queryParams.append("category_id", String(params.category_id));
  if (params.status) queryParams.append("status", params.status);
  if (params.error_reason) queryParams.append("error_reason", params.error_reason);
  if (params.need_review) queryParams.append("need_review", "true");
  if (params.keyword) queryParams.append("keyword", params.keyword);
  if (params.start_date) queryParams.append("start_date", params.start_date);
  if (params.end_date) queryParams.append("end_date", params.end_date);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.page_size) queryParams.append("page_size", String(params.page_size));

  return request<{ items: WrongQuestion[]; total: number; page: number }>(`/wrong-questions?${queryParams.toString()}`);
}

// 获取单个错题详情
export async function getWrongQuestion(id: number) {
  return request<WrongQuestion>(`/wrong-questions/${id}`);
}

// 获取错题统计
export async function getWrongQuestionStats() {
  return request<WrongQuestionStats>("/wrong-questions/stats");
}

// 获取需要复习的错题
export async function getNeedReviewQuestions(limit = 20) {
  return request<WrongQuestion[]>(`/wrong-questions/need-review?limit=${limit}`);
}

// 获取错题ID列表（用于批量重做）
export async function getWrongQuestionIds(status?: WrongQuestionStatus) {
  const params = status ? `?status=${status}` : "";
  return request<number[]>(`/wrong-questions/ids${params}`);
}

// 添加错题
export async function addWrongQuestion(questionId: number) {
  return request<WrongQuestion>(`/wrong-questions/${questionId}/add`, {
    method: "POST",
  });
}

// 更新错题笔记
export async function updateWrongQuestionNote(id: number, note: string) {
  return request<{ message: string }>(`/wrong-questions/${id}/note`, {
    method: "PUT",
    body: JSON.stringify({ note }),
  });
}

// 更新错误原因
export async function updateWrongQuestionReason(id: number, errorReason: string) {
  return request<{ message: string }>(`/wrong-questions/${id}/reason`, {
    method: "PUT",
    body: JSON.stringify({ error_reason: errorReason }),
  });
}

// 记录复习结果
export async function recordReview(id: number, isCorrect: boolean) {
  return request<{ message: string }>(`/wrong-questions/${id}/review`, {
    method: "PUT",
    body: JSON.stringify({ is_correct: isCorrect }),
  });
}

// 标记为已掌握
export async function markAsMastered(id: number) {
  return request<{ message: string }>(`/wrong-questions/${id}/mastered`, {
    method: "PUT",
  });
}

// 移除错题
export async function removeWrongQuestion(id: number) {
  return request<{ message: string }>(`/wrong-questions/${id}`, {
    method: "DELETE",
  });
}

// 恢复错题
export async function restoreWrongQuestion(id: number) {
  return request<{ message: string }>(`/wrong-questions/${id}/restore`, {
    method: "PUT",
  });
}

// 批量标记为已掌握
export async function batchMarkAsMastered(ids: number[]) {
  return request<{ message: string }>("/wrong-questions/batch-mastered", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// 导出格式类型
export type ExportFormat = "json" | "csv" | "markdown" | "html";

// 导出请求参数
export interface ExportWrongQuestionsRequest {
  format: ExportFormat;
  category_id?: number;
  status?: WrongQuestionStatus | "";
  include_note?: boolean;
  include_stats?: boolean;
  start_date?: string;
  end_date?: string;
  ids?: number[];
}

// 导出错题
export async function exportWrongQuestions(params: ExportWrongQuestionsRequest) {
  const response = await fetch(`/api/v1/wrong-questions/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("导出失败");
  }

  // For JSON format, return the parsed data
  if (params.format === "json") {
    return response.json();
  }

  // For other formats, return blob for download
  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `wrong_questions.${params.format === "markdown" ? "md" : params.format}`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename=([^;]+)/);
    if (match) {
      filename = match[1].trim();
    }
  }

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return { success: true };
}

// =====================================================
// 笔记 API
// =====================================================

// 获取我的笔记
export async function getMyNotes(params: NoteQueryParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.note_type) queryParams.append("note_type", params.note_type);
  if (params.keyword) queryParams.append("keyword", params.keyword);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.page_size) queryParams.append("page_size", String(params.page_size));

  return request<{ items: StudyNote[]; total: number; page: number }>(`/notes/my?${queryParams.toString()}`);
}

// 获取公开笔记
export async function getPublicNotes(params: NoteQueryParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.note_type) queryParams.append("note_type", params.note_type);
  if (params.keyword) queryParams.append("keyword", params.keyword);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.page_size) queryParams.append("page_size", String(params.page_size));

  return request<{ items: StudyNote[]; total: number; page: number }>(`/notes/public?${queryParams.toString()}`);
}

// 搜索笔记
export async function searchNotes(keyword: string, params: NoteQueryParams = {}) {
  const queryParams = new URLSearchParams();
  queryParams.append("keyword", keyword);
  if (params.note_type) queryParams.append("note_type", params.note_type);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.page_size) queryParams.append("page_size", String(params.page_size));

  return request<{ items: StudyNote[]; total: number; page: number }>(`/notes/search?${queryParams.toString()}`);
}

// 获取笔记详情
export async function getNoteById(id: number) {
  return request<StudyNote>(`/notes/${id}`);
}

// 获取关联笔记
export async function getNotesByRelated(noteType: NoteType, relatedId: number) {
  return request<StudyNote[]>(`/notes/related/${noteType}/${relatedId}`);
}

// 获取视频笔记
export async function getVideoNotes(relatedId: number) {
  return request<{ notes: StudyNote[]; markers: VideoNoteMarker[] }>(`/notes/video/${relatedId}`);
}

// 获取我的笔记统计
export async function getMyNoteStats() {
  return request<UserNoteStats>("/notes/my/stats");
}

// 创建笔记
export async function createNote(data: CreateNoteRequest) {
  return request<StudyNote>("/notes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 更新笔记
export async function updateNote(id: number, data: UpdateNoteRequest) {
  return request<StudyNote>(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// 删除笔记
export async function deleteNote(id: number) {
  return request<{ message: string }>(`/notes/${id}`, {
    method: "DELETE",
  });
}

// 点赞笔记
export async function likeNote(id: number) {
  return request<{ message: string }>(`/notes/${id}/like`, {
    method: "POST",
  });
}

// 取消点赞
export async function unlikeNote(id: number) {
  return request<{ message: string }>(`/notes/${id}/like`, {
    method: "DELETE",
  });
}

// 预定义的错误原因选项
export const ERROR_REASONS = [
  "粗心大意",
  "概念不清",
  "知识遗忘",
  "计算错误",
  "审题不清",
  "方法不当",
  "时间不够",
  "知识盲点",
  "其他",
];

// 笔记类型选项
export const NOTE_TYPE_OPTIONS = [
  { value: "course", label: "课程笔记" },
  { value: "chapter", label: "章节笔记" },
  { value: "question", label: "题目笔记" },
  { value: "knowledge", label: "知识点笔记" },
  { value: "free", label: "自由笔记" },
  { value: "video", label: "视频笔记" },
];
