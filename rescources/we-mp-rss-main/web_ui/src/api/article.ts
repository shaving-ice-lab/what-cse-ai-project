import http from "./http";

/**
 * 文章实体接口
 * @property id 文章ID
 * @property title 文章标题
 * @property content 文章内容
 * @property mp_name 公众号名称
 * @property publish_time 发布时间
 * @property status 文章状态
 * @property link 文章链接
 * @property created_at 创建时间
 * @property is_read 阅读状态
 */
export interface Article {
  id: number;
  title: string;
  content: string;
  mp_name: string;
  publish_time: string;
  status: number;
  link: string;
  created_at: string;
  is_read?: number;
}

/**
 * 文章列表查询参数接口
 * @property offset 分页偏移量
 * @property limit 每页数量
 * @property search 搜索关键词
 * @property status 文章状态
 * @property mp_id 公众号ID
 */
export interface ArticleListParams {
  offset?: number;
  limit?: number;
  search?: string;
  status?: number;
  mp_id?: string;
}

/**
 * 文章列表查询结果接口
 * @property code 状态码
 * @property data 文章列表数据
 */
export interface ArticleListResult {
  code: number;
  data: Article[];
}

/**
 * 获取文章列表
 * @param params 查询参数
 * @returns 文章列表结果
 */
export const getArticles = (params: ArticleListParams) => {
  // 转换分页参数
  const apiParams = {
    offset: (params.page || 0) * (params.pageSize || 10),
    limit: params.pageSize || 10,
    search: params.search,
    status: params.status,
    mp_id: params.mp_id,
  };
  return http.get<ArticleListResult>("/wx/articles", {
    params: apiParams,
  });
};

/**
 * 获取文章详情
 * @param id 文章ID
 * @parama 类型 0当前,-1上一篇,1下一篇
 * @returns 文章详情结果
 */
export const getArticleDetail = (id: number, action_type: number) => {
  switch (action_type) {
    case -1:
      return http.get<{ code: number; data: Article }>(`/wx/articles/${id}/prev`);
    case 1:
      return http.get<{ code: number; data: Article }>(`/wx/articles/${id}/next`);
    default:
      // 默认获取当前文章详情
      return http.get<{ code: number; data: Article }>(`/wx/articles/${id}`);
      break;
  }
};

/**
 * 获取上一篇文章详情
 * @param id 当前文章ID
 * @returns 上一篇文章详情结果
 */
export const getPrevArticleDetail = (id: number) => {
  return http.get<{ code: number; data: Article }>(`/wx/articles/${id}/prev`);
};

/**
 * 获取下一篇文章详情
 * @param id 当前文章ID
 * @returns 下一篇文章详情结果
 */
export const getNextArticleDetail = (id: number) => {
  return http.get<{ code: number; data: Article }>(`/wx/articles/${id}/next`);
};

/**
 * 删除文章
 * @param id 文章ID
 * @returns 删除结果
 */
export const deleteArticle = (id: number) => {
  return http.delete<{ code: number; message: string }>(`/wx/articles/${id}`);
};

/**
 * 清空所有文章
 * @param id 无实际作用（保留参数）
 * @returns 清空结果
 */
export const ClearArticle = (id: number) => {
  return http.delete<{ code: number; message: string }>(`/wx/articles/clean`);
};

/**
 * 清空重复文章
 * @param id 无实际作用（保留参数）
 * @returns 清空结果
 */
export const ClearDuplicateArticle = (id: number) => {
  return http.delete<{ code: number; message: string }>(`/wx/articles/clean_duplicate_articles`);
};

/**
 * 切换文章阅读状态
 * @param id 文章ID
 * @param is_read 阅读状态
 * @returns 操作结果
 */
export const toggleArticleReadStatus = (id: number, is_read: boolean) => {
  return http.put<{ code: number; message: string; is_read: boolean }>(
    `/wx/articles/${id}/read`,
    null,
    {
      params: { is_read },
    }
  );
};
