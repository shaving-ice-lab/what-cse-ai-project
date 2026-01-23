// 用户相关类型
export interface User {
  id: number;
  phone: string;
  email: string;
  nickname: string;
  avatar: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  real_name: string;
  gender: number;
  birth_date: string;
  education: string;
  degree: string;
  major: string;
  school: string;
  graduation_year: number;
  political_status: string;
  work_years: number;
  current_location: string;
}

export interface UserPreference {
  id: number;
  user_id: number;
  preferred_regions: string[];
  preferred_cities: string[];
  preferred_position_types: string[];
  min_salary: number;
  max_salary: number;
  accept_remote: boolean;
}

// 职位相关类型
export interface Position {
  id: number;
  exam_type: string;
  year: number;
  department_code: string;
  department_name: string;
  position_code: string;
  position_name: string;
  position_category: string;
  position_level: string;
  work_location: string;
  recruit_count: number;
  education_requirement: string;
  degree_requirement: string;
  major_requirement: string;
  political_status_requirement: string;
  base_work_experience: string;
  other_requirements: string;
  remark: string;
  exam_ratio: string;
  status: number;
  registration_count: number;
  review_pass_count: number;
  created_at: string;
  updated_at: string;
}

export interface PositionListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  exam_type?: string;
  year?: number;
  region?: string;
  education?: string;
  major?: string;
  political_status?: string;
  work_experience?: string;
}

export interface PositionListResponse {
  list: Position[];
  total: number;
  page: number;
  page_size: number;
}

// 收藏相关类型
export interface Favorite {
  id: number;
  user_id: number;
  position_id: number;
  position: Position;
  created_at: string;
}

// 智能匹配相关类型
export interface MatchResult {
  position: Position;
  total_score: number;
  hard_score: number;
  soft_score: number;
  match_details: MatchDetail[];
}

export interface MatchDetail {
  condition_name: string;
  condition_type: "hard" | "soft";
  is_match: boolean;
  user_value: string;
  position_value: string;
  score: number;
  weight: number;
}

export interface MatchReport {
  user_id: number;
  generated_at: string;
  total_positions: number;
  matched_positions: number;
  match_results: MatchResult[];
  suggestions: string[];
}

// 公告相关类型
export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  source: string;
  source_url: string;
  publish_date: string;
  exam_type: string;
  region: string;
  status: number;
  created_at: string;
}

// 通知相关类型
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// Admin相关类型
export interface Admin {
  id: number;
  username: string;
  role: string;
  status: number;
  last_login: string;
}

export interface DashboardStats {
  total_users: number;
  total_positions: number;
  total_announcements: number;
  today_new_users: number;
  today_active_users: number;
  position_stats: {
    exam_type: string;
    count: number;
  }[];
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}

// 登录相关类型
export interface LoginRequest {
  phone?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  code?: string;
}
