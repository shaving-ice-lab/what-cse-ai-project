import request from '../request'

export interface LoginRequest {
  account: string
  password: string
}

export interface RegisterRequest {
  phone?: string
  email?: string
  password: string
  nickname?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface LoginResponse {
  user: {
    id: number
    phone: string
    email: string
    nickname: string
    avatar: string
  }
  tokens: TokenResponse
}

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => 
    request.post('/auth/login', data),

  register: (data: RegisterRequest) => 
    request.post('/auth/register', data),

  refreshToken: (refreshToken: string): Promise<TokenResponse> =>
    request.post('/auth/refresh', { refresh_token: refreshToken }),
}

export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminLoginResponse {
  access_token: string
  expires_in: number
  admin: {
    id: number
    username: string
    role: string
  }
}

export const adminAuthApi = {
  login: (data: AdminLoginRequest): Promise<AdminLoginResponse> =>
    request.post('/admin/login', data),
}
