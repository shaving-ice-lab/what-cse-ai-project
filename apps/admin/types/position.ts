// =====================================================
// 职位数据类型定义
// =====================================================

/**
 * 职位完整类型
 */
export interface Position {
  id: number;
  announcement_id?: number;
  fenbi_announcement_id?: number;
  position_id: string;
  position_code?: string;
  position_name: string;

  // 招录单位
  department_code?: string;
  department_name: string;
  department_level?: string;

  // 招录条件
  recruit_count: number;
  education?: string;
  degree?: string;
  major_category?: string;
  major_requirement?: string;
  major_list?: string[];
  is_unlimited_major: boolean;

  // 工作地点
  work_location?: string;
  province?: string;
  city?: string;
  district?: string;

  // 其他条件
  political_status?: string;
  age?: string;
  age_min: number;
  age_max: number;
  work_experience?: string;
  work_experience_years: number;
  is_for_fresh_graduate?: boolean | null;
  gender?: string;
  household_requirement?: string;
  service_period?: string;
  other_conditions?: string;

  // 考试信息
  exam_type?: string;
  exam_category?: string;

  // 时间信息
  registration_start?: string;
  registration_end?: string;
  exam_date?: string;
  interview_date?: string;

  // 其他信息
  salary_range?: string;
  remark?: string;
  source_url?: string;

  // 报名统计
  applicant_count: number;
  pass_count: number;
  competition_ratio: number;

  // AI解析元数据
  parse_confidence: number;
  parsed_at?: string;

  // 状态
  status: number;

  // 系统字段
  created_at: string;
  updated_at: string;
}

/**
 * 职位简要类型（列表用）
 */
export interface PositionBrief {
  id: number;
  position_name: string;
  position_code?: string;
  department_name: string;
  department_level?: string;
  recruit_count: number;
  education?: string;
  is_unlimited_major: boolean;
  province?: string;
  city?: string;
  exam_type?: string;
  registration_end?: string;
  exam_date?: string;
  competition_ratio: number;
  is_for_fresh_graduate?: boolean | null;
  status: number;
  created_at: string;
}

/**
 * 职位详情类型
 */
export interface PositionDetail extends Position {
  is_favorite?: boolean;
  announcements?: Array<{
    id: number;
    title: string;
    source_url?: string;
    publish_date?: string;
  }>;
}

/**
 * 职位查询参数类型
 */
export interface PositionQueryParams {
  // 地域筛选
  province?: string;
  city?: string;
  district?: string;
  provinces?: string[];

  // 条件筛选
  education?: string;
  educations?: string[];
  degree?: string;
  major?: string;
  major_category?: string;
  major_keyword?: string;
  exam_type?: string;
  exam_types?: string[];
  exam_category?: string;
  department_level?: string;
  political_status?: string;
  gender?: string;

  // 快捷筛选
  unlimited_major?: boolean;
  fresh_graduate?: boolean;
  no_experience?: boolean;
  min_recruit?: number;

  // 时间筛选
  reg_status?: "registering" | "upcoming" | "ended";
  expiring_days?: number;
  updated_today?: boolean;

  // 关键词
  keyword?: string;
  dept_keyword?: string;

  // 分页排序
  page?: number;
  page_size?: number;
  sort_by?: "recruit_count" | "created_at" | "registration_end" | "match_score";
  sort_order?: "asc" | "desc";

  // 状态筛选
  status?: number;
}

/**
 * 职位列表响应类型
 */
export interface PositionListResponse {
  positions: PositionBrief[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * 职位统计数据类型
 */
export interface PositionStats {
  total_count: number;
  published_count: number;
  today_new_count: number;
  registering_count: number;
  expiring_count: number;
  total_recruit_count: number;
  avg_competition: number;
}

/**
 * 按省份统计
 */
export interface ProvinceStats {
  province: string;
  count: number;
  recruit_count: number;
}

/**
 * 按考试类型统计
 */
export interface ExamTypeStats {
  exam_type: string;
  count: number;
  recruit_count: number;
}

/**
 * 按学历统计
 */
export interface EducationStats {
  education: string;
  count: number;
}

/**
 * 趋势数据
 */
export interface TrendItem {
  date: string;
  count: number;
}

/**
 * 趋势响应
 */
export interface PositionTrendsResponse {
  trends: TrendItem[];
}

/**
 * 筛选选项类型
 */
export interface FilterOptions {
  provinces: string[];
  exam_types: string[];
  exam_categories: string[];
  major_categories: string[];
  department_levels: string[];
  educations: string[];
  political_status: string[];
  genders: string[];
}

/**
 * 级联地区类型
 */
export interface CascadeRegion {
  province: string;
  cities: string[];
}

/**
 * 级联地区响应
 */
export interface CascadeRegionsResponse {
  regions: CascadeRegion[];
}

/**
 * 职位状态枚举
 */
export enum PositionStatus {
  Pending = 0,
  Published = 1,
  Offline = 2,
}

/**
 * 职位状态名称映射
 */
export const PositionStatusNames: Record<PositionStatus, string> = {
  [PositionStatus.Pending]: "待审核",
  [PositionStatus.Published]: "已发布",
  [PositionStatus.Offline]: "已下线",
};

/**
 * 职位状态颜色映射
 */
export const PositionStatusColors: Record<PositionStatus, string> = {
  [PositionStatus.Pending]: "bg-amber-100 text-amber-700",
  [PositionStatus.Published]: "bg-green-100 text-green-700",
  [PositionStatus.Offline]: "bg-gray-100 text-gray-700",
};

/**
 * 学历选项
 */
export const EducationOptions = [
  "大专",
  "本科",
  "硕士研究生",
  "博士研究生",
];

/**
 * 学位选项
 */
export const DegreeOptions = [
  "学士",
  "硕士",
  "博士",
];

/**
 * 考试类型选项
 */
export const ExamTypeOptions = [
  "公务员",
  "事业单位",
  "教师招聘",
  "医疗卫生",
  "银行招聘",
  "国企招聘",
  "军队文职",
  "三支一扶",
  "选调生",
  "社区工作者",
];

/**
 * 考试分类选项 (A/B/C类)
 */
export const ExamCategoryOptions = [
  "综合管理类A",
  "社会科学专技类B",
  "自然科学专技类C",
  "中小学教师类D",
  "医疗卫生类E",
];

/**
 * 单位层级选项
 */
export const DepartmentLevelOptions = [
  "中央",
  "省级",
  "市级",
  "县级",
  "乡镇",
];

/**
 * 政治面貌选项
 */
export const PoliticalStatusOptions = [
  "不限",
  "中共党员",
  "中共党员或共青团员",
  "共青团员",
  "群众",
];
