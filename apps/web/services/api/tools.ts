import request from "../request";

// =====================================================
// 考点查询相关类型
// =====================================================

export interface ExamLocation {
  id: number;
  name: string;
  address: string;
  province: string;
  city: string;
  district?: string;
  longitude: number;
  latitude: number;
  exam_type: string;
  contact_phone?: string;
  description?: string;
  facilities?: string;
  capacity?: number;
}

export interface ExamLocationQueryParams {
  province?: string;
  city?: string;
  exam_type?: string;
  keyword?: string;
  page?: number;
  page_size?: number;
}

export interface ExamLocationListResponse {
  locations: ExamLocation[];
  total: number;
  page: number;
  page_size: number;
}

export interface NearbyLocationParams {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}

// =====================================================
// 估分相关类型
// =====================================================

export interface ScoreEstimateRequest {
  exam_type: string;
  exam_year: number;
  exam_subject?: string;
  correct_count: number;
  total_count: number;
  answers?: string[];
}

export interface ScoreEstimateResponse {
  id: number;
  exam_type: string;
  exam_year: number;
  exam_subject?: string;
  correct_count: number;
  total_count: number;
  estimated_score: number;
  accuracy: number;
}

export interface ScoreEstimate {
  id: number;
  user_id?: number;
  exam_type: string;
  exam_year: number;
  exam_subject?: string;
  correct_count: number;
  total_count: number;
  estimated_score: number;
  actual_score?: number;
  created_at: string;
}

// =====================================================
// 成绩晒分相关类型
// =====================================================

export interface ScoreShareRequest {
  exam_type: string;
  exam_year: number;
  exam_province?: string;
  xingce_score?: number;
  shenlun_score?: number;
  total_score?: number;
  rank?: number;
  pass_status?: string;
  position_name?: string;
  is_anonymous?: boolean;
  nickname?: string;
  comment?: string;
}

export interface ScoreShare {
  id: number;
  exam_type: string;
  exam_year: number;
  exam_province?: string;
  xingce_score?: number;
  shenlun_score?: number;
  total_score?: number;
  rank?: number;
  pass_status?: string;
  position_name?: string;
  nickname: string;
  comment?: string;
  like_count: number;
  is_verified: boolean;
  created_at: string;
}

export interface ScoreShareQueryParams {
  exam_type?: string;
  exam_year?: number;
  exam_province?: string;
  pass_status?: string;
  page?: number;
  page_size?: number;
}

export interface ScoreShareListResponse {
  shares: ScoreShare[];
  total: number;
  page: number;
  page_size: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
  percent: number;
}

export interface ScoreStatistics {
  exam_type: string;
  exam_year: number;
  exam_province?: string;
  total_count: number;
  avg_xingce: number;
  avg_shenlun: number;
  avg_total: number;
  max_xingce: number;
  max_shenlun: number;
  max_total: number;
  pass_rate: number;
  distribution?: ScoreDistribution[];
}

export interface ScoreRankingResponse {
  rankings: ScoreShare[];
  total: number;
  page: number;
  page_size: number;
}

// =====================================================
// API 方法
// =====================================================

export const toolsApi = {
  // 考点查询
  locations: {
    // 获取考点列表
    list: (params?: ExamLocationQueryParams): Promise<ExamLocationListResponse> =>
      request.get("/tools/locations", { params }),

    // 获取考点详情
    detail: (id: number): Promise<ExamLocation> =>
      request.get(`/tools/locations/${id}`),

    // 获取省份列表
    getProvinces: (): Promise<string[]> =>
      request.get("/tools/locations/provinces"),

    // 获取城市列表
    getCities: (province: string): Promise<string[]> =>
      request.get("/tools/locations/cities", { params: { province } }),

    // 搜索考点
    search: (keyword: string, limit?: number): Promise<ExamLocation[]> =>
      request.get("/tools/locations/search", { params: { keyword, limit } }),

    // 查找附近考点
    nearby: (params: NearbyLocationParams): Promise<ExamLocation[]> =>
      request.get("/tools/locations/nearby", { params }),
  },

  // 估分工具
  estimate: {
    // 计算估分
    calculate: (data: ScoreEstimateRequest): Promise<ScoreEstimateResponse> =>
      request.post("/tools/estimate", data),

    // 获取用户估分历史
    getHistory: (): Promise<ScoreEstimate[]> =>
      request.get("/tools/estimate/history"),

    // 更新实际分数
    updateActualScore: (id: number, actualScore: number): Promise<void> =>
      request.put(`/tools/estimate/${id}/actual`, { actual_score: actualScore }),
  },

  // 成绩晒分
  scores: {
    // 创建晒分
    create: (data: ScoreShareRequest): Promise<ScoreShare> =>
      request.post("/tools/scores", data),

    // 获取晒分列表
    list: (params?: ScoreShareQueryParams): Promise<ScoreShareListResponse> =>
      request.get("/tools/scores", { params }),

    // 获取晒分详情
    detail: (id: number): Promise<ScoreShare> =>
      request.get(`/tools/scores/${id}`),

    // 获取用户的晒分
    getMy: (): Promise<ScoreShare[]> =>
      request.get("/tools/scores/my"),

    // 点赞晒分
    like: (id: number): Promise<void> =>
      request.post(`/tools/scores/${id}/like`),

    // 获取分数统计
    getStatistics: (examType?: string, examYear?: number, examProvince?: string): Promise<ScoreStatistics> =>
      request.get("/tools/scores/statistics", { params: { exam_type: examType, exam_year: examYear, exam_province: examProvince } }),

    // 获取排行榜
    getRanking: (examType?: string, examYear?: number, examProvince?: string, page?: number, pageSize?: number): Promise<ScoreRankingResponse> =>
      request.get("/tools/scores/ranking", { params: { exam_type: examType, exam_year: examYear, exam_province: examProvince, page, page_size: pageSize } }),

    // 更新晒分
    update: (id: number, data: ScoreShareRequest): Promise<void> =>
      request.put(`/tools/scores/${id}`, data),

    // 删除晒分
    delete: (id: number): Promise<void> =>
      request.delete(`/tools/scores/${id}`),
  },
};
