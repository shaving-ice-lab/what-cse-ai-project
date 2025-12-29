import request from '../request'

export interface Position {
  id: number
  position_id: string
  position_name: string
  department_name: string
  department_level: string
  work_location_province: string
  work_location_city: string
  recruit_count: number
  exam_type: string
  education_min: string
  major_unlimited: boolean
  major_specific: string[]
  political_status: string
  age_min: number
  age_max: number
  applicant_count: number
  competition_ratio: number
  status: number
  created_at: string
}

export interface PositionListParams {
  exam_type?: string
  province?: string
  city?: string
  education_min?: string
  keyword?: string
  sort_field?: string
  sort_order?: string
  page?: number
  page_size?: number
}

export interface PositionListResponse {
  positions: Position[]
  total: number
  page: number
  page_size: number
}

export const positionApi = {
  list: (params: PositionListParams): Promise<PositionListResponse> =>
    request.get('/positions', { params }),

  detail: (id: number): Promise<{ position: Position; is_favorite: boolean }> =>
    request.get(`/positions/${id}`),

  compare: (ids: number[]): Promise<{ positions: Position[] }> =>
    request.post('/positions/compare', { ids }),

  addFavorite: (id: number) =>
    request.post(`/positions/${id}/favorite`),

  removeFavorite: (id: number) =>
    request.delete(`/positions/${id}/favorite`),

  getFavorites: (page: number, pageSize: number): Promise<PositionListResponse> =>
    request.get('/user/favorites', { params: { page, page_size: pageSize } }),
}
