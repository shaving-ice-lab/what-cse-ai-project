import { request } from './api'

// =====================================================
// 类型定义
// =====================================================

// 素材类型
export type MaterialType =
  | 'quote'        // 名言警句
  | 'case'         // 案例素材
  | 'sentence'     // 优美语句
  | 'hot_topic'    // 热点专题
  | 'interview'    // 面试素材
  | 'knowledge'    // 常识素材
  | 'formula'      // 公式速记
  | 'mnemonic'     // 记忆口诀
  | 'template'     // 答题模板
  | 'vocabulary'   // 词汇素材

// 素材子类型
export type MaterialSubType =
  // 名言警句子类型
  | 'xi_quote'        // 习近平讲话金句
  | 'ancient_quote'   // 古代名言警句
  | 'leader_quote'    // 领导人论述
  | 'celebrity_quote' // 名人名言
  // 案例素材子类型
  | 'positive_case'   // 正面典型案例
  | 'negative_case'   // 反面警示案例
  | 'hot_event'       // 热点事件分析
  // 优美语句子类型
  | 'opening'         // 开头句式
  | 'transition'      // 过渡句式
  | 'ending'          // 结尾句式
  | 'argument'        // 论证句式
  // 热点专题子类型
  | 'annual_hot'      // 年度热点
  | 'theme_hot'       // 主题热点
  | 'hot_analysis'    // 热点解读
  // 面试素材子类型
  | 'politics_news'   // 时政热点素材
  | 'interview_case'  // 答题案例库
  | 'interview_quote' // 面试金句库
  // 常识素材子类型
  | 'current_affairs' // 时事政治汇编
  | 'history_event'   // 历史事件汇编
  | 'law_regulation'  // 法律法规汇编

// 素材状态
export type MaterialStatus = 'draft' | 'published' | 'archived'

// 素材分类
export interface MaterialCategory {
  id: number
  parent_id?: number
  name: string
  code: string
  material_type: MaterialType
  subject?: string
  icon?: string
  color: string
  description?: string
  sort_order: number
  level: number
  material_count: number
  children?: MaterialCategory[]
}

// 素材
export interface LearningMaterial {
  id: number
  category_id: number
  type: MaterialType
  sub_type?: MaterialSubType
  title: string
  content: string
  source?: string
  author?: string
  year?: number
  tags?: string[]
  keywords?: string[]
  theme_topics?: string[]
  subject?: string
  analysis?: string
  usage?: string
  example?: string
  translation?: string
  background?: string
  significance?: string
  is_free: boolean
  vip_only: boolean
  is_hot: boolean
  is_featured: boolean
  view_count: number
  collect_count: number
  use_count: number
  status: MaterialStatus
  published_at?: string
  created_at: string
  updated_at: string
  category?: MaterialCategory
  is_collected?: boolean
}

// 素材简要信息（列表用）
export interface MaterialBrief {
  id: number
  category_id: number
  type: MaterialType
  sub_type?: MaterialSubType
  title: string
  content: string
  source?: string
  author?: string
  year?: number
  tags?: string[]
  theme_topics?: string[]
  subject?: string
  is_free: boolean
  vip_only: boolean
  is_hot: boolean
  is_featured: boolean
  view_count: number
  collect_count: number
  status: MaterialStatus
  created_at: string
  category_name?: string
}

// 素材统计
export interface MaterialStats {
  total_count: number
  published_count: number
  draft_count: number
  quote_count: number
  case_count: number
  sentence_count: number
  hot_topic_count: number
  interview_count: number
  knowledge_count: number
  hot_count: number
  featured_count: number
  today_new_count: number
  type_stats: { type: MaterialType; name: string; count: number }[]
  subject_stats: { subject: string; count: number }[]
}

// 查询参数
export interface MaterialQueryParams {
  category_id?: number
  type?: MaterialType
  sub_type?: MaterialSubType
  subject?: string
  status?: MaterialStatus
  is_free?: boolean
  vip_only?: boolean
  is_hot?: boolean
  is_featured?: boolean
  year?: number
  keyword?: string
  tags?: string[]
  theme_topics?: string[]
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// 创建素材请求
export interface CreateMaterialRequest {
  category_id: number
  type: MaterialType
  sub_type?: MaterialSubType
  title: string
  content: string
  source?: string
  author?: string
  year?: number
  tags?: string[]
  keywords?: string[]
  theme_topics?: string[]
  subject?: string
  analysis?: string
  usage?: string
  example?: string
  translation?: string
  background?: string
  significance?: string
  is_free?: boolean
  vip_only?: boolean
  is_hot?: boolean
  is_featured?: boolean
  status?: MaterialStatus
  sort_order?: number
}

// 更新素材请求
export interface UpdateMaterialRequest {
  category_id?: number
  type?: MaterialType
  sub_type?: MaterialSubType
  title?: string
  content?: string
  source?: string
  author?: string
  year?: number
  tags?: string[]
  keywords?: string[]
  theme_topics?: string[]
  subject?: string
  analysis?: string
  usage?: string
  example?: string
  translation?: string
  background?: string
  significance?: string
  is_free?: boolean
  vip_only?: boolean
  is_hot?: boolean
  is_featured?: boolean
  status?: MaterialStatus
  sort_order?: number
}

// 创建分类请求
export interface CreateMaterialCategoryRequest {
  parent_id?: number
  name: string
  code: string
  material_type: MaterialType
  subject?: string
  icon?: string
  color?: string
  description?: string
  sort_order?: number
}

// 更新分类请求
export interface UpdateMaterialCategoryRequest {
  name?: string
  code?: string
  material_type?: MaterialType
  subject?: string
  icon?: string
  color?: string
  description?: string
  sort_order?: number
  is_active?: boolean
}

// 列表响应
export interface MaterialListResponse {
  materials: MaterialBrief[]
  total: number
  page: number
  page_size: number
}

// 批量导入单条素材
export interface BatchImportMaterialItem {
  category_id?: number
  type?: MaterialType
  sub_type?: MaterialSubType
  title: string
  content: string
  source?: string
  author?: string
  year?: number
  tags?: string // 逗号分隔
  theme_topics?: string // 逗号分隔
  subject?: string
  analysis?: string
  usage?: string
}

// 批量导入请求
export interface BatchImportRequest {
  category_id?: number
  type?: MaterialType
  items: BatchImportMaterialItem[]
}

// 批量导入结果
export interface BatchImportResult {
  total: number
  success: number
  failed: number
  errors?: string[]
}

// AI 生成素材请求
export interface AIGenerateMaterialRequest {
  type: MaterialType
  sub_type?: MaterialSubType
  theme?: string
  subject?: string
  count?: number
  category_id?: number
  auto_publish?: boolean
}

// AI 生成的素材
export interface AIGeneratedMaterial {
  title: string
  content: string
  source?: string
  author?: string
  analysis?: string
  usage?: string
  tags?: string[]
  theme_topics?: string[]
}

// AI 生成素材结果
export interface AIGenerateMaterialResult {
  generated: number
  saved: number
  materials: AIGeneratedMaterial[]
  errors?: string[]
}

// 预置数据分类
export interface PresetDataCategory {
  name: string
  code: string
  description: string
  count: number
}

// 预置数据信息
export interface PresetDataInfo {
  total_categories: number
  total_materials: number
  categories: PresetDataCategory[]
}

// 预填充素材请求
export interface PrefillMaterialsRequest {
  category_codes: string[]
  target_category_id?: number
  auto_publish?: boolean
}

// 预填充结果
export interface PrefillMaterialsResult {
  total: number
  success: number
  failed: number
  errors?: string[]
}

// =====================================================
// 素材类型和子类型名称映射
// =====================================================

export const materialTypeNames: Record<MaterialType, string> = {
  quote: '名言警句',
  case: '案例素材',
  sentence: '优美语句',
  hot_topic: '热点专题',
  interview: '面试素材',
  knowledge: '常识素材',
  formula: '公式速记',
  mnemonic: '记忆口诀',
  template: '答题模板',
  vocabulary: '词汇素材',
}

export const materialSubTypeNames: Record<MaterialSubType, string> = {
  xi_quote: '习近平讲话金句',
  ancient_quote: '古代名言警句',
  leader_quote: '领导人论述',
  celebrity_quote: '名人名言',
  positive_case: '正面典型案例',
  negative_case: '反面警示案例',
  hot_event: '热点事件分析',
  opening: '开头句式',
  transition: '过渡句式',
  ending: '结尾句式',
  argument: '论证句式',
  annual_hot: '年度热点',
  theme_hot: '主题热点',
  hot_analysis: '热点解读',
  politics_news: '时政热点素材',
  interview_case: '答题案例库',
  interview_quote: '面试金句库',
  current_affairs: '时事政治汇编',
  history_event: '历史事件汇编',
  law_regulation: '法律法规汇编',
}

export const materialStatusNames: Record<MaterialStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
}

// 素材类型对应的子类型
export const materialTypeSubTypes: Record<MaterialType, MaterialSubType[]> = {
  quote: ['xi_quote', 'ancient_quote', 'leader_quote', 'celebrity_quote'],
  case: ['positive_case', 'negative_case', 'hot_event'],
  sentence: ['opening', 'transition', 'ending', 'argument'],
  hot_topic: ['annual_hot', 'theme_hot', 'hot_analysis'],
  interview: ['politics_news', 'interview_case', 'interview_quote'],
  knowledge: ['current_affairs', 'history_event', 'law_regulation'],
  formula: [],
  mnemonic: [],
  template: [],
  vocabulary: [],
}

// =====================================================
// API 方法
// =====================================================

export const materialApi = {
  // 素材列表
  getMaterials: (params?: MaterialQueryParams) =>
    request.get<MaterialListResponse>('/materials', { params }),

  // 搜索素材
  searchMaterials: (keyword: string, params?: MaterialQueryParams) =>
    request.get<MaterialListResponse>('/materials/search', {
      params: { keyword, ...params },
    }),

  // 获取素材详情
  getMaterial: (id: number) =>
    request.get<LearningMaterial>(`/materials/${id}`),

  // 获取热门素材
  getHotMaterials: (limit?: number) =>
    request.get<MaterialBrief[]>('/materials/hot', { params: { limit } }),

  // 获取精选素材
  getFeaturedMaterials: (limit?: number) =>
    request.get<MaterialBrief[]>('/materials/featured', { params: { limit } }),

  // 随机获取素材
  getRandomMaterials: (type?: MaterialType, count?: number) =>
    request.get<MaterialBrief[]>('/materials/random', {
      params: { type, count },
    }),

  // 按主题获取素材
  getMaterialsByThemeTopic: (topic: string, limit?: number) =>
    request.get<MaterialBrief[]>(`/materials/by-theme/${encodeURIComponent(topic)}`, {
      params: { limit },
    }),

  // 获取素材统计
  getMaterialStats: () => request.get<MaterialStats>('/materials/stats'),

  // 获取素材类型列表
  getMaterialTypes: () =>
    request.get<Record<MaterialType, string>>('/materials/types'),

  // 获取素材子类型列表
  getMaterialSubTypes: () =>
    request.get<Record<MaterialSubType, string>>('/materials/sub-types'),

  // 获取热点主题列表
  getThemeTopics: () => request.get<string[]>('/materials/theme-topics'),

  // =====================================================
  // 分类接口
  // =====================================================

  // 获取所有分类
  getCategories: () =>
    request.get<MaterialCategory[]>('/materials/categories'),

  // 获取分类树
  getCategoryTree: () =>
    request.get<MaterialCategory[]>('/materials/categories/tree'),

  // 按素材类型获取分类
  getCategoriesByType: (type: MaterialType) =>
    request.get<MaterialCategory[]>(`/materials/categories/type/${type}`),

  // 按科目获取分类
  getCategoriesBySubject: (subject: string) =>
    request.get<MaterialCategory[]>(
      `/materials/categories/subject/${encodeURIComponent(subject)}`
    ),

  // 获取分类详情
  getCategory: (id: number) =>
    request.get<MaterialCategory>(`/materials/categories/${id}`),

  // =====================================================
  // 管理员接口
  // =====================================================

  // 创建素材
  createMaterial: (data: CreateMaterialRequest) =>
    request.post<LearningMaterial>('/admin/materials', data),

  // 更新素材
  updateMaterial: (id: number, data: UpdateMaterialRequest) =>
    request.put<void>(`/admin/materials/${id}`, data),

  // 删除素材
  deleteMaterial: (id: number) =>
    request.delete<void>(`/admin/materials/${id}`),

  // 批量删除素材
  batchDeleteMaterials: (ids: number[]) =>
    request.post<void>('/admin/materials/batch/delete', { ids }),

  // 批量更新状态
  batchUpdateStatus: (ids: number[], status: MaterialStatus) =>
    request.post<void>('/admin/materials/batch/status', { ids, status }),

  // 批量设置热门
  batchSetHot: (ids: number[], is_hot: boolean) =>
    request.post<void>('/admin/materials/batch/hot', { ids, is_hot }),

  // 批量设置精选
  batchSetFeatured: (ids: number[], is_featured: boolean) =>
    request.post<void>('/admin/materials/batch/featured', { ids, is_featured }),

  // 批量导入素材
  batchImportMaterials: (data: BatchImportRequest) =>
    request.post<BatchImportResult>('/admin/materials/batch/import', data),

  // AI 生成素材
  aiGenerateMaterials: (data: AIGenerateMaterialRequest) =>
    request.post<AIGenerateMaterialResult>('/admin/materials/ai/generate', data),

  // 获取素材模板
  getMaterialTemplates: (type?: MaterialType) =>
    request.get<{ name: string; description: string; fields: string[] }[]>(
      '/admin/materials/templates',
      { params: { type } }
    ),

  // 获取预置数据信息
  getPresetDataInfo: () =>
    request.get<PresetDataInfo>('/admin/materials/preset/info'),

  // 预填充素材数据
  prefillMaterials: (data: PrefillMaterialsRequest) =>
    request.post<PrefillMaterialsResult>('/admin/materials/preset/fill', data),

  // 创建分类
  createCategory: (data: CreateMaterialCategoryRequest) =>
    request.post<MaterialCategory>('/admin/materials/categories', data),

  // 更新分类
  updateCategory: (id: number, data: UpdateMaterialCategoryRequest) =>
    request.put<void>(`/admin/materials/categories/${id}`, data),

  // 删除分类
  deleteCategory: (id: number) =>
    request.delete<void>(`/admin/materials/categories/${id}`),
}

export default materialApi
