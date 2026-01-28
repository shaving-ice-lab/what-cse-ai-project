import request from "../request";

// 用户基本信息
export interface User {
  id: number;
  phone: string;
  email: string;
  nickname: string;
  avatar: string;
  status: number;
  created_at: string;
  updated_at: string;
}

// 用户画像
export interface UserProfile {
  id: number;
  user_id: number;
  // 学历信息
  education: string;
  degree: string;
  graduation_date?: string;
  graduate_year?: number;
  is_current_student: boolean;
  school: string;
  school_type: string;
  is_fresh_graduate: boolean;
  // 专业信息
  major: string;
  major_category: string;
  major_code?: string;
  second_major?: string;
  second_major_code?: string;
  // 个人信息
  gender: string;
  birth_date?: string;
  age: number;
  political_status: string;
  work_years: number;
  grassroots_exp_years: number;
  identity_type: string;
  // 地域信息
  hukou_province: string;
  hukou_city: string;
  current_province: string;
  current_city: string;
  // 系统字段
  profile_completeness: number;
  last_match_at?: string;
  created_at: string;
  updated_at: string;
}

// 用户偏好设置
export interface UserPreference {
  id: number;
  user_id: number;
  preferred_provinces: string[];
  preferred_cities: string[];
  preferred_departments: string[];
  exam_types: string[];
  match_strategy: string;
  created_at: string;
  updated_at: string;
}

// 用户证书
export interface UserCertificate {
  id: number;
  user_id: number;
  cert_type: string;
  cert_name: string;
  cert_level?: string;
  obtained_date?: string;
  created_at: string;
  updated_at: string;
}

// 完整的用户档案响应
export interface UserProfileResponse {
  user: User;
  profile: UserProfile | null;
  preferences: UserPreference | null;
  certificates: UserCertificate[];
}

// 更新个人信息请求
export interface UpdateProfileParams {
  nickname?: string;
  avatar?: string;
  gender?: string;
  birth_date?: string;
  hukou_province?: string;
  hukou_city?: string;
  current_province?: string;
  current_city?: string;
  political_status?: string;
  education?: string;
  degree?: string;
  major?: string;
  major_category?: string;
  major_code?: string;
  school?: string;
  school_type?: string;
  graduation_date?: string;
  graduate_year?: number;
  is_fresh_graduate?: boolean;
  is_current_student?: boolean;
  work_years?: number;
  grassroots_exp_years?: number;
  identity_type?: string;
  second_major?: string;
  second_major_code?: string;
}

// 更新偏好设置请求
export interface UpdatePreferencesParams {
  preferred_provinces?: string[];
  preferred_cities?: string[];
  preferred_departments?: string[];
  exam_types?: string[];
  match_strategy?: string;
}

// 添加/更新证书请求
export interface CertificateParams {
  cert_type: string;
  cert_name: string;
  cert_level?: string;
  obtained_date?: string;
}

// 分区更新请求
export interface UpdateEducationParams {
  education?: string;
  degree?: string;
  graduate_year?: number;
  graduation_date?: string;
  is_current_student?: boolean;
  school?: string;
  school_type?: string;
  is_fresh_graduate?: boolean;
}

export interface UpdateMajorParams {
  major?: string;
  major_category?: string;
  major_code?: string;
  second_major?: string;
  second_major_code?: string;
}

export interface UpdatePersonalParams {
  gender?: string;
  birth_date?: string;
  political_status?: string;
  identity_type?: string;
}

export interface UpdateLocationParams {
  hukou_province?: string;
  hukou_city?: string;
  current_province?: string;
  current_city?: string;
}

export interface UpdateWorkParams {
  work_years?: number;
  grassroots_exp_years?: number;
}

// 完整度响应
export interface SectionInfo {
  name: string;
  is_complete: boolean;
  fields: number;
  filled: number;
}

export interface MissingSectionInfo {
  section: string;
  section_name: string;
  fields: string[];
}

export interface CompletenessResponse {
  completeness: number;
  missing_sections: MissingSectionInfo[];
  section_status: Record<string, SectionInfo>;
}

export const userApi = {
  // 获取用户完整档案
  getProfile: (): Promise<UserProfileResponse> => {
    return request.get("/user/profile");
  },

  // 更新个人信息
  updateProfile: (data: UpdateProfileParams): Promise<{ message: string }> => {
    return request.put("/user/profile", data);
  },

  // 更新偏好设置
  updatePreferences: (data: UpdatePreferencesParams): Promise<{ message: string }> => {
    return request.put("/user/preferences", data);
  },

  // 获取证书列表
  getCertificates: (): Promise<UserCertificate[]> => {
    return request.get("/user/certificates");
  },

  // 添加证书
  addCertificate: (data: CertificateParams): Promise<UserCertificate> => {
    return request.post("/user/certificates", data);
  },

  // 更新证书
  updateCertificate: (id: number, data: CertificateParams): Promise<{ message: string }> => {
    return request.put(`/user/certificates/${id}`, data);
  },

  // 删除证书
  deleteCertificate: (id: number): Promise<{ message: string }> => {
    return request.delete(`/user/certificates/${id}`);
  },

  // 上传头像
  updateAvatar: (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);
    return request.post("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 修改密码
  changePassword: (data: { old_password: string; new_password: string }): Promise<{ message: string }> => {
    return request.post("/user/password", data);
  },

  // 绑定手机
  bindPhone: (data: { phone: string; code: string }): Promise<{ message: string }> => {
    return request.post("/user/bind-phone", data);
  },

  // 绑定邮箱
  bindEmail: (data: { email: string; code: string }): Promise<{ message: string }> => {
    return request.post("/user/bind-email", data);
  },

  // =====================================================
  // 分区更新 API
  // =====================================================

  // 获取画像详情（不含用户信息）
  getProfileDetail: (): Promise<UserProfile | null> => {
    return request.get("/user/profile/detail");
  },

  // 获取完整度详情
  getCompleteness: (): Promise<CompletenessResponse> => {
    return request.get("/user/profile/completeness");
  },

  // 更新学历信息
  updateEducation: (data: UpdateEducationParams): Promise<{ message: string }> => {
    return request.patch("/user/profile/education", data);
  },

  // 更新专业信息
  updateMajor: (data: UpdateMajorParams): Promise<{ message: string }> => {
    return request.patch("/user/profile/major", data);
  },

  // 更新个人信息
  updatePersonal: (data: UpdatePersonalParams): Promise<{ message: string }> => {
    return request.patch("/user/profile/personal", data);
  },

  // 更新地域信息
  updateLocation: (data: UpdateLocationParams): Promise<{ message: string }> => {
    return request.patch("/user/profile/location", data);
  },

  // 更新工作经历
  updateWork: (data: UpdateWorkParams): Promise<{ message: string }> => {
    return request.patch("/user/profile/work", data);
  },

  // 获取偏好设置
  getPreferences: (): Promise<UserPreference> => {
    return request.get("/user/preferences");
  },

  // 删除画像
  deleteProfile: (): Promise<{ message: string }> => {
    return request.delete("/user/profile");
  },
};
