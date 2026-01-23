import request from "../request";
import type { Position } from "./position";

export interface MatchCondition {
  condition: string;
  user_value: string;
  required: string;
  is_match: boolean;
  is_hard_match: boolean;
  score: number;
}

export interface MatchResult {
  position: Position;
  match_score: number;
  match_details: MatchCondition[];
  unmatch_reasons: string[];
  is_eligible: boolean;
}

export interface MatchStats {
  total_positions: number;
  eligible_positions: number;
  high_match_count: number;
  medium_match_count: number;
  low_match_count: number;
}

export interface MatchResponse {
  results: MatchResult[];
  total: number;
  page: number;
  page_size: number;
  stats: MatchStats;
}

export interface MatchReport {
  user_profile: {
    education: string;
    major: string;
    political_status: string;
    work_years: number;
  };
  total_positions: number;
  eligible_count: number;
  by_exam_type: Record<string, number>;
  by_province: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface MatchParams {
  strategy?: "strict" | "loose" | "smart";
  page?: number;
  page_size?: number;
}

export const matchApi = {
  getMatches: (params: MatchParams): Promise<MatchResponse> =>
    request.get("/match/positions", { params }),

  getReport: (): Promise<MatchReport> => request.get("/match/report"),
};
