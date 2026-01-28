// 报名数据总览
export interface RegistrationOverview {
  total_applicants: number;       // 总报名人数
  total_pass_count: number;       // 总过审人数
  avg_competition_ratio: number;  // 平均竞争比
  max_competition_ratio: number;  // 最高竞争比
  no_applicant_count: number;     // 无人报考职位数
  low_competition_count: number;  // 低竞争比职位数（<10:1）
  high_competition_count: number; // 高竞争比职位数（>100:1）
}

// 职位热度榜
export interface PositionHotRank {
  position_id: number;
  position_name: string;
  department_name: string;
  apply_count: number;
  pass_count: number;
  competition_ratio: number;
  recruit_count: number;
  province: string;
  city: string;
}

// 冷门职位
export interface ColdPosition {
  position_id: number;
  position_name: string;
  department_name: string;
  apply_count: number;
  pass_count: number;
  competition_ratio: number;
  recruit_count: number;
  province: string;
  city: string;
  education: string;
  is_unlimited_major: boolean;
}

// 报名趋势
export interface RegistrationTrend {
  date: string;
  total_apply: number;       // 当日总报名
  daily_increment: number;   // 当日增量
  avg_competition: number;   // 当日平均竞争比
}

// 单个职位的报名趋势
export interface PositionRegistrationTrend {
  date: string;
  apply_count: number;
  pass_count: number;
  competition_ratio: number;
  daily_increment: number;
}

// 省份报名统计
export interface ProvinceRegistrationStats {
  province: string;
  position_count: number;
  total_recruit: number;
  total_applicants: number;
  avg_competition: number;
}

// 考试类型报名统计
export interface ExamTypeRegistrationStats {
  exam_type: string;
  position_count: number;
  total_recruit: number;
  total_applicants: number;
  avg_competition: number;
}

// API 响应类型
export interface RegistrationDataOverviewResponse {
  overview: RegistrationOverview;
  top_by_apply_count: PositionHotRank[];
  top_by_competition_ratio: PositionHotRank[];
}

export interface HotPositionsResponse {
  positions: PositionHotRank[];
}

export interface ColdPositionsResponse {
  positions: ColdPosition[];
  total: number;
  page: number;
  page_size: number;
}

export interface RegistrationTrendsResponse {
  trends: RegistrationTrend[];
}

export interface PositionTrendsResponse {
  position_id: number;
  trends: PositionRegistrationTrend[];
}

export interface ProvinceRegistrationStatsResponse {
  stats: ProvinceRegistrationStats[];
}

export interface ExamTypeRegistrationStatsResponse {
  stats: ExamTypeRegistrationStats[];
}
