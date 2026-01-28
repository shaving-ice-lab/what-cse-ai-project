import request from "../request";
import type { Position } from "./position";

// =====================================================
// 类型定义
// =====================================================

export interface MatchCondition {
  condition: string;
  user_value: string;
  required: string;
  is_match: boolean;
  is_hard_match: boolean;
  score: number;
  max_score: number;
  weight: number;
}

export interface MatchResult {
  position: Position;
  match_score: number;
  hard_score: number;
  soft_score: number;
  star_level: number;
  match_level: string;
  match_details: MatchCondition[];
  unmatch_reasons: string[];
  suggestions: string[];
  is_eligible: boolean;
}

export interface MatchStats {
  total_positions: number;
  eligible_positions: number;
  high_match_count: number;
  medium_match_count: number;
  low_match_count: number;
  average_score: number;
  perfect_match_count: number;
}

export interface MatchUserProfileSummary {
  education: string;
  major: string;
  political_status: string;
  age: number;
  work_years: number;
  hukou_province: string;
  prefer_provinces: string[];
  prefer_cities: string[];
  is_complete: boolean;
  completeness: number;
}

export interface MatchResponse {
  results: MatchResult[];
  total: number;
  page: number;
  page_size: number;
  stats: MatchStats;
  user_profile?: MatchUserProfileSummary;
}

export interface DimensionStat {
  name: string;
  match_count: number;
  total_count: number;
  match_rate: number;
  average_score: number;
}

export interface MatchDimensionStats {
  education: DimensionStat;
  major: DimensionStat;
  political: DimensionStat;
  age: DimensionStat;
  location: DimensionStat;
  experience: DimensionStat;
}

export interface MatchDistribution {
  perfect: number[];
  high: number[];
  medium: number[];
  low: number[];
}

export interface MatchReport {
  user_profile: MatchUserProfileSummary;
  total_positions: number;
  eligible_count: number;
  by_exam_type: Record<string, number>;
  by_province: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  dimension_stats?: MatchDimensionStats;
  match_distribution: MatchDistribution;
  top_matches?: MatchResult[];
}

export interface PositionMatchDetail {
  position: Position;
  match_score: number;
  hard_score: number;
  soft_score: number;
  star_level: number;
  match_level: string;
  match_details: MatchCondition[];
  unmatch_reasons: string[];
  suggestions: string[];
  is_eligible: boolean;
  user_profile: MatchUserProfileSummary;
}

export interface MatchWeights {
  education: number;
  political: number;
  age: number;
  hukou: number;
  major: number;
  experience: number;
  location: number;
}

// =====================================================
// 请求参数
// =====================================================

export interface MatchParams {
  strategy?: "strict" | "loose" | "smart";
  page?: number;
  page_size?: number;
  min_score?: number;
  only_eligible?: boolean;
  sort_by?: "score" | "recruit_count" | "deadline";
  province?: string;
  exam_type?: string;
}

// =====================================================
// API 方法
// =====================================================

export const matchApi = {
  // 智能匹配（GET）
  getMatches: (params: MatchParams): Promise<MatchResponse> =>
    request.get("/match/positions", { params }),

  // 智能匹配（POST）
  postMatch: (params: MatchParams): Promise<MatchResponse> =>
    request.post("/match", params),

  // 匹配预览
  getPreview: (limit?: number): Promise<MatchResponse> =>
    request.get("/match/preview", { params: { limit } }),

  // 获取单个职位的匹配详情
  getPositionMatchDetail: (positionId: number): Promise<PositionMatchDetail> =>
    request.get(`/positions/${positionId}/match`),

  // 获取匹配统计
  getStats: (): Promise<MatchDimensionStats> =>
    request.get("/match/stats"),

  // 获取匹配报告
  getReport: (): Promise<MatchReport> => 
    request.get("/match/report"),

  // 获取当前权重配置
  getWeights: (): Promise<MatchWeights> =>
    request.get("/match/weights"),

  // 更新权重配置
  updateWeights: (weights: MatchWeights): Promise<{ message: string; weights: MatchWeights }> =>
    request.put("/match/weights", weights),
};
