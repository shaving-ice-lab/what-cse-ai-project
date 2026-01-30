import request from "../request";

// 职位简要信息（列表用）
export interface PositionBrief {
  id: number;
  position_id: string;
  position_code?: string;
  position_name: string;
  department_name: string;
  department_level?: string;
  province?: string;
  city?: string;
  district?: string;
  recruit_count: number;
  exam_type?: string;
  exam_category?: string;
  education?: string;
  degree?: string;
  major_category?: string;
  major_requirement?: string;
  is_unlimited_major: boolean;
  is_for_fresh_graduate: boolean;
  political_status?: string;
  age?: string;
  age_min?: number;
  age_max?: number;
  work_experience?: string;
  work_experience_years?: number;
  gender?: string;
  household_requirement?: string;
  applicant_count?: number;
  pass_count?: number;
  competition_ratio?: number;
  status: number;
  registration_start?: string;
  registration_end?: string;
  created_at: string;
  updated_at?: string;
}

// 职位完整信息
export interface Position extends PositionBrief {
  announcement_id?: number;
  fenbi_announcement_id?: number;
  position_code?: string;
  major_requirement?: string;
  major_category?: string;
  work_location?: string;
  age?: string;
  age_min?: number;
  age_max?: number;
  political_status?: string;
  work_experience?: string;
  work_experience_years?: number;
  gender?: string;
  household_requirement?: string;
  service_period?: string;
  other_conditions?: string;
  exam_category?: string;
  exam_date?: string;
  interview_date?: string;
  salary_range?: string;
  remark?: string;
  source_url?: string;
  applicant_count?: number;
  pass_count?: number;
  parsed_at?: string;
}

// 职位详情（含收藏状态）
export interface PositionDetail extends Position {
  is_favorite?: boolean;
}

// 查询参数
export interface PositionQueryParams {
  // 基础筛选
  province?: string;
  city?: string;
  district?: string;
  education?: string;
  degree?: string;
  political_status?: string;
  exam_type?: string;
  department_level?: string;
  major_category?: string;
  gender?: string;

  // 特殊筛选
  unlimited_major?: boolean;
  fresh_graduate?: boolean;
  no_experience?: boolean;
  age_max?: number;
  min_recruit?: number;
  work_experience_years_min?: number;

  // 报名状态筛选
  reg_status?: "registering" | "upcoming" | "ended";
  expiring_days?: number;
  updated_today?: boolean;

  // 关键词搜索
  keyword?: string;

  // 状态筛选
  status?: number;

  // 排序
  sort_by?: "created_at" | "recruit_count" | "registration_end" | "applicant_count";
  sort_order?: "asc" | "desc";

  // 分页
  page?: number;
  page_size?: number;
}

// 列表响应
export interface PositionListResponse {
  positions: PositionBrief[];
  total: number;
  page: number;
  page_size: number;
}

// 统计数据
export interface PositionStats {
  total: number;
  total_recruit: number;
  registering_count: number;
  today_new_count: number;
  expiring_count: number;
  unlimited_major_count: number;
  fresh_graduate_count: number;
}

// 省份统计
export interface ProvinceStats {
  province: string;
  count: number;
  recruit_count: number;
}

// 考试类型统计
export interface ExamTypeStats {
  exam_type: string;
  count: number;
  recruit_count: number;
}

// 趋势数据
export interface TrendItem {
  date: string;
  count: number;
}

export interface PositionTrendsResponse {
  new_positions: TrendItem[];
  expiring_positions: TrendItem[];
}

// 筛选选项
export interface FilterOptions {
  provinces: string[];
  exam_types: string[];
  major_categories: string[];
  department_levels: string[];
  educations: string[];
  political_status: string[];
  genders: string[];
}

// 级联地区
export interface CascadeRegion {
  province: string;
  cities: {
    city: string;
    districts: string[];
  }[];
}

export interface CascadeRegionsResponse {
  regions: CascadeRegion[];
}

export const positionApi = {
  // 获取职位列表（增强版）
  getPositions: (params?: PositionQueryParams): Promise<PositionListResponse> =>
    request.get("/positions/v2", { params }),

  // 兼容旧版列表 API
  list: (params: PositionQueryParams): Promise<PositionListResponse> =>
    request.get("/positions", { params }),

  // 搜索职位
  search: (
    keyword: string,
    params?: Omit<PositionQueryParams, "keyword">
  ): Promise<PositionListResponse> =>
    request.get("/positions/search", { params: { keyword, ...params } }),

  // 获取职位详情
  detail: (id: number): Promise<PositionDetail> =>
    request.get(`/positions/${id}`),

  // 获取统计信息
  getStats: (): Promise<PositionStats> => request.get("/positions/stats"),

  // 按省份统计
  getStatsByProvince: (): Promise<ProvinceStats[]> =>
    request.get("/positions/stats/province"),

  // 按考试类型统计
  getStatsByExamType: (): Promise<ExamTypeStats[]> =>
    request.get("/positions/stats/exam-type"),

  // 获取趋势数据
  getTrends: (days?: number): Promise<PositionTrendsResponse> =>
    request.get("/positions/trends", { params: { days } }),

  // 获取筛选选项
  getFilterOptions: (): Promise<FilterOptions> =>
    request.get("/positions/filter-options"),

  // 获取级联地区
  getCascadeRegions: (): Promise<CascadeRegionsResponse> =>
    request.get("/positions/cascade-regions"),

  // 获取热门职位
  getHotPositions: (limit?: number): Promise<PositionBrief[]> =>
    request.get("/positions/hot", { params: { limit } }),

  // 获取即将截止职位
  getExpiringPositions: (days?: number, limit?: number): Promise<PositionBrief[]> =>
    request.get("/positions/expiring", { params: { days, limit } }),

  // 获取最新职位
  getLatestPositions: (limit?: number): Promise<PositionBrief[]> =>
    request.get("/positions/latest", { params: { limit } }),

  // 获取推荐职位（需要登录，基于用户画像）
  getRecommendedPositions: (params?: {
    limit?: number;
    min_score?: number;
  }): Promise<RecommendedPositionsResponse> =>
    request.get("/positions/recommended", { params }),

  // 职位对比（基础版）
  compare: (ids: number[]): Promise<{ positions: Position[] }> =>
    request.post("/positions/compare", { ids }),

  // 职位对比（增强版 - 含 AI 分析）
  compareEnhanced: (ids: number[]): Promise<CompareResponse> =>
    request.post("/compare/positions", { ids }),

  // 收藏职位
  addFavorite: (id: number) => request.post(`/positions/${id}/favorite`),

  // 取消收藏
  removeFavorite: (id: number) => request.delete(`/positions/${id}/favorite`),

  // 获取收藏列表
  getFavorites: (page: number, pageSize: number): Promise<PositionListResponse> =>
    request.get("/user/favorites", { params: { page, page_size: pageSize } }),

  // 获取职位历年数据
  getPositionHistory: (positionId: number): Promise<PositionHistoryResponse> =>
    request.get(`/positions/${positionId}/history`),
};

// =====================================================
// 推荐职位类型定义
// =====================================================

// 推荐职位项（带匹配信息）
export interface RecommendedPosition {
  id: number;
  position_id: string;
  position_name: string;
  department_name: string;
  province: string;
  city: string;
  exam_type: string;
  education: string;
  recruit_count: number;
  match_score: number;
  match_level: string;
  star_level: number;
  is_eligible: boolean;
}

// 匹配统计
export interface MatchStats {
  total_positions: number;
  eligible_positions: number;
  high_match_count: number;
  medium_match_count: number;
  low_match_count: number;
  average_score: number;
  perfect_match_count: number;
}

// 用户画像摘要
export interface UserProfileSummary {
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

// 推荐职位响应
export interface RecommendedPositionsResponse {
  positions: RecommendedPosition[];
  total: number;
  stats: MatchStats;
  user_profile?: UserProfileSummary;
}

// =====================================================
// 对比功能类型定义
// =====================================================

// 对比项
export interface CompareItem {
  position: Position;
  days_until_end?: number;
  is_registering: boolean;
  formatted_reg_end?: string;
}

// 职位推荐
export interface PositionRecommend {
  position_id: number;
  position_name: string;
  reason: string;
  value?: string;
}

// 推荐结果
export interface Recommendation {
  best_for_fresh_grad?: PositionRecommend;
  most_recruit?: PositionRecommend;
  lowest_requirement?: PositionRecommend;
  soonest_deadline?: PositionRecommend;
  lowest_competition?: PositionRecommend;
}

// 对比总结
export interface CompareSummary {
  overview: string;
  highlights: string[];
  suggestions: string[];
}

// 维度值
export interface DimensionValue {
  position_id: number;
  value: unknown;
  display: string;
  is_best: boolean;
}

// 对比维度
export interface CompareDimension {
  key: string;
  label: string;
  type: string;
  values: DimensionValue[];
  has_diff: boolean;
  best_value_id?: number;
}

// 对比响应
export interface CompareResponse {
  items: CompareItem[];
  recommendation?: Recommendation;
  summary?: CompareSummary;
  dimensions: CompareDimension[];
}

// =====================================================
// 历年数据类型定义
// =====================================================

// 历年数据项
export interface PositionHistoryItem {
  id: number;
  position_code: string;
  position_name: string;
  department_name: string;
  year: number;
  recruit_count: number;
  applicant_count: number;
  pass_count: number;
  competition_ratio: number;
  interview_score: number;
  written_score: number;
  final_score: number;
  exam_type?: string;
  province?: string;
  city?: string;
}

// 年度趋势项
export interface YearlyTrendItem {
  year: number;
  recruit_count: number;
  applicant_count: number;
  competition_ratio: number;
  avg_score: number;
}

// 分数线预测
export interface ScoreLinePrediction {
  position_code: string;
  predicted_score: number;
  confidence: number;
  historical_scores: number[];
  historical_years: number[];
  basis: string;
}

// 职位历年数据响应
export interface PositionHistoryResponse {
  histories: PositionHistoryItem[];
  yearly_trend: YearlyTrendItem[];
  prediction?: ScoreLinePrediction;
}
