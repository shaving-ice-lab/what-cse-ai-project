import request from '../request'

export interface Announcement {
  id: number
  title: string
  content: string
  type: string
  source: string
  source_url: string
  publish_date: string
  exam_type: string
  region: string
  status: number
  views: number
  created_at: string
  updated_at: string
}

export interface AnnouncementListParams {
  page?: number
  page_size?: number
  type?: string
  exam_type?: string
  region?: string
  keyword?: string
}

export interface AnnouncementListResponse {
  list: Announcement[]
  total: number
  page: number
  page_size: number
}

export const announcementApi = {
  getList: (params?: AnnouncementListParams) => {
    return request.get<AnnouncementListResponse>('/announcements', { params })
  },

  getDetail: (id: number) => {
    return request.get<Announcement>(`/announcements/${id}`)
  },

  getLatest: (limit?: number) => {
    return request.get<Announcement[]>('/announcements/latest', { params: { limit } })
  },

  search: (keyword: string, params?: AnnouncementListParams) => {
    return request.get<AnnouncementListResponse>('/announcements/search', {
      params: { keyword, ...params }
    })
  },
}
