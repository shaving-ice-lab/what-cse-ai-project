import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:8080/api'

interface LoginResponse {
  token: string
  user: {
    id: number
    nickname: string
    avatar: string
    phone: string
  }
}

export const authService = {
  async login(phone: string, password: string): Promise<LoginResponse> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/login`,
      method: 'POST',
      data: { phone, password },
    })
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || '登录失败')
    }
    return response.data
  },

  async wxLogin(code: string): Promise<LoginResponse> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/wx-login`,
      method: 'POST',
      data: { code },
    })
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || '登录失败')
    }
    return response.data
  },

  async register(phone: string, code: string, password: string): Promise<LoginResponse> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/register`,
      method: 'POST',
      data: { phone, code, password },
    })
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || '注册失败')
    }
    return response.data
  },

  async sendCode(phone: string): Promise<void> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/send-code`,
      method: 'POST',
      data: { phone },
    })
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || '发送验证码失败')
    }
  },
}
