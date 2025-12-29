import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:8080/api'

interface Position {
  id: number
  name: string
  department: string
  location: string
  education: string
  major: string
  recruitCount: number
  matchScore?: number
}

interface PositionListParams {
  page?: number
  pageSize?: number
  examType?: string
  province?: string
  education?: string
  keyword?: string
}

interface PositionListResponse {
  list: Position[]
  total: number
  page: number
  pageSize: number
}

export const positionService = {
  async getList(params: PositionListParams): Promise<PositionListResponse> {
    const response = await Taro.request({
      url: `${BASE_URL}/positions`,
      method: 'GET',
      data: params,
    })
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || '获取职位列表失败')
    }
    return response.data
  },

  async getDetail(id: number): Promise<Position> {
    const response = await Taro.request({
      url: `${BASE_URL}/positions/${id}`,
      method: 'GET',
    })
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || '获取职位详情失败')
    }
    return response.data
  },

  async getMatched(): Promise<Position[]> {
    const response = await Taro.request({
      url: `${BASE_URL}/positions/matched`,
      method: 'GET',
    })
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || '获取匹配职位失败')
    }
    return response.data
  },

  async addFavorite(id: number): Promise<void> {
    const response = await Taro.request({
      url: `${BASE_URL}/favorites`,
      method: 'POST',
      data: { positionId: id },
    })
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || '收藏失败')
    }
  },

  async removeFavorite(id: number): Promise<void> {
    const response = await Taro.request({
      url: `${BASE_URL}/favorites/${id}`,
      method: 'DELETE',
    })
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || '取消收藏失败')
    }
  },
}
