// 公告状态
export enum AnnouncementStatus {
  Draft = 0,
  Published = 1,
  Offline = 2,
}

export const AnnouncementStatusNames: Record<AnnouncementStatus, string> = {
  [AnnouncementStatus.Draft]: "草稿",
  [AnnouncementStatus.Published]: "已发布",
  [AnnouncementStatus.Offline]: "已下线",
};

export const AnnouncementStatusColors: Record<AnnouncementStatus, string> = {
  [AnnouncementStatus.Draft]: "bg-gray-100 text-gray-700",
  [AnnouncementStatus.Published]: "bg-green-100 text-green-700",
  [AnnouncementStatus.Offline]: "bg-red-100 text-red-700",
};

// 考试类型
export const ExamTypeOptions = [
  "公务员",
  "事业单位",
  "教师招聘",
  "医疗卫生",
  "银行招聘",
  "国企招聘",
  "军队文职",
  "三支一扶",
  "大学生村官",
  "警法招聘",
  "社区工作者",
  "选调生",
  "其他",
] as const;

export type ExamType = typeof ExamTypeOptions[number];

// 公告简要信息
export interface AnnouncementBrief {
  id: number;
  title: string;
  exam_type?: string;
  province?: string;
  city?: string;
  source?: string;
  source_url?: string;
  status: number;
  publish_date?: string;
  registration_start?: string;
  registration_end?: string;
  position_count?: number;
  recruit_count?: number;
  created_at: string;
  updated_at?: string;
}

// 公告完整信息
export interface Announcement extends AnnouncementBrief {
  content?: string;
  summary?: string;
  exam_date?: string;
  interview_date?: string;
  attachments?: AnnouncementAttachment[];
  positions?: AnnouncementPosition[];
  parsed_at?: string;
  fenbi_category_id?: number;
  fenbi_announcement_id?: number;
}

// 公告附件
export interface AnnouncementAttachment {
  id: number;
  announcement_id: number;
  name: string;
  url: string;
  type: string;
  size?: number;
  created_at: string;
}

// 关联职位简要信息
export interface AnnouncementPosition {
  id: number;
  position_name: string;
  department_name?: string;
  recruit_count: number;
  education?: string;
}

// 查询参数
export interface AnnouncementQueryParams {
  // 基础筛选
  exam_type?: string;
  province?: string;
  city?: string;
  source?: string;
  
  // 状态筛选
  status?: number;
  
  // 时间筛选
  start_date?: string;
  end_date?: string;
  reg_status?: "registering" | "upcoming" | "ended";
  
  // 关键词搜索
  keyword?: string;
  
  // 排序
  sort_by?: "created_at" | "publish_date" | "registration_end" | "position_count";
  sort_order?: "asc" | "desc";
  
  // 分页
  page?: number;
  page_size?: number;
}

// 列表响应
export interface AnnouncementListResponse {
  announcements: AnnouncementBrief[];
  total: number;
  page: number;
  page_size: number;
}

// 统计数据
export interface AnnouncementStats {
  total: number;
  published_count: number;
  draft_count: number;
  today_new_count: number;
  registering_count: number;
  total_positions: number;
  total_recruit: number;
}

// 按类型统计
export interface ExamTypeStats {
  exam_type: string;
  count: number;
  position_count: number;
  recruit_count: number;
}

// 按省份统计
export interface ProvinceStats {
  province: string;
  count: number;
  position_count: number;
}

// 按月份统计
export interface MonthlyStats {
  month: string;
  count: number;
}

// Tab 分类
export interface AnnouncementTab {
  key: string;
  label: string;
  exam_type?: string;
  count?: number;
}

export const AnnouncementTabs: AnnouncementTab[] = [
  { key: "all", label: "全部公告" },
  { key: "civil_servant", label: "公务员", exam_type: "公务员" },
  { key: "institution", label: "事业单位", exam_type: "事业单位" },
  { key: "teacher", label: "教师招聘", exam_type: "教师招聘" },
  { key: "medical", label: "医疗卫生", exam_type: "医疗卫生" },
  { key: "other", label: "其他" },
];
