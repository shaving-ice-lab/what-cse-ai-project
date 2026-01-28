// 历年数据类型定义

// 历年数据完整信息
export interface PositionHistory {
  id: number;
  position_code: string;
  position_name: string;
  department_code: string;
  department_name: string;
  year: number;
  recruit_count: number;
  apply_count: number;
  pass_count: number;
  competition_ratio: number;
  interview_score: number;
  written_score: number;
  final_score: number;
  exam_type: string;
  exam_category: string;
  province: string;
  city: string;
  department_level: string;
  education: string;
  source: string;
  created_at: string;
}

// 历年数据简要信息（列表用）
export interface PositionHistoryBrief {
  id: number;
  position_name: string;
  department_name: string;
  year: number;
  recruit_count: number;
  apply_count: number;
  competition_ratio: number;
  interview_score: number;
  province: string;
  exam_type: string;
}

// 年度趋势数据
export interface YearlyTrendItem {
  year: number;
  recruit_count: number;
  apply_count: number;
  competition_ratio: number;
  avg_interview_score: number;
  avg_written_score: number;
}

// 分数线预测结果
export interface ScoreLinePrediction {
  predicted_score: number;
  confidence_low: number;
  confidence_high: number;
  confidence_level: number;
  historical_scores: number[];
  historical_years: number[];
  basis: string;
}

// 历史统计
export interface HistoryStats {
  total_records: number;
  avg_recruit_count: number;
  avg_competition: number;
  avg_interview_score: number;
  avg_written_score: number;
  min_year: number;
  max_year: number;
}

// 年份统计
export interface YearStats {
  year: number;
  count: number;
  recruit_count: number;
}

// 省份历史统计
export interface ProvinceHistoryStats {
  province: string;
  total_records: number;
  total_recruit: number;
  avg_competition: number;
}

// 考试类型历史统计
export interface ExamTypeHistoryStats {
  exam_type: string;
  total_records: number;
  total_recruit: number;
  avg_competition: number;
}

// 筛选选项
export interface HistoryFilterOptions {
  years: number[];
  provinces: string[];
  exam_types: string[];
}

// 查询参数
export interface HistoryQueryParams {
  position_code?: string;
  position_name?: string;
  department_code?: string;
  department_name?: string;
  province?: string;
  city?: string;
  exam_type?: string;
  exam_category?: string;
  year?: number;
  year_from?: number;
  year_to?: number;
  page?: number;
  page_size?: number;
  sort_by?: "year" | "recruit_count" | "competition_ratio" | "interview_score" | "written_score" | "apply_count";
  sort_order?: "asc" | "desc";
}

// 列表响应
export interface HistoryListResponse {
  histories: PositionHistoryBrief[];
  total: number;
  page: number;
  page_size: number;
}

// 年度趋势响应
export interface YearlyTrendResponse {
  trends: YearlyTrendItem[];
}

// 分数线响应
export interface ScoreLineResponse {
  avg_interview_score: number;
  avg_written_score: number;
  exam_type: string;
  province: string;
  years: number;
}

// 创建/更新历史记录请求
export interface CreateHistoryRequest {
  position_code: string;
  position_name: string;
  department_code?: string;
  department_name: string;
  year: number;
  recruit_count?: number;
  apply_count?: number;
  pass_count?: number;
  competition_ratio?: number;
  interview_score?: number;
  written_score?: number;
  final_score?: number;
  exam_type?: string;
  exam_category?: string;
  province?: string;
  city?: string;
  district?: string;
  department_level?: string;
  education?: string;
  source?: string;
  source_url?: string;
  remark?: string;
}

// 导入历史数据请求
export interface ImportHistoryRequest {
  histories: CreateHistoryRequest[];
}
