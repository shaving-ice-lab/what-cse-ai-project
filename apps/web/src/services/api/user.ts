import request from '../request'

export interface UserProfile {
  id: number
  nickname: string
  avatar: string
  phone: string
  email: string
  real_name: string
  gender: string
  education: string
  degree: string
  major: string
  school: string
  graduation_year: number
  political_status: string
  work_years: number
  current_location: string
  preferred_regions: string[]
  preferred_exam_types: string[]
}

export interface UpdateProfileParams {
  real_name?: string
  gender?: string
  education?: string
  degree?: string
  major?: string
  school?: string
  graduation_year?: number
  political_status?: string
  work_years?: number
  current_location?: string
  preferred_regions?: string[]
  preferred_exam_types?: string[]
}

export const userApi = {
  getProfile: () => {
    return request.get<UserProfile>('/user/profile')
  },

  updateProfile: (data: UpdateProfileParams) => {
    return request.put<UserProfile>('/user/profile', data)
  },

  updateAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return request.post<{ avatar: string }>('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  changePassword: (data: { old_password: string; new_password: string }) => {
    return request.post('/user/password', data)
  },

  bindPhone: (data: { phone: string; code: string }) => {
    return request.post('/user/bind-phone', data)
  },

  bindEmail: (data: { email: string; code: string }) => {
    return request.post('/user/bind-email', data)
  },
}
