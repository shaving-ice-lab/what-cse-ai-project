import request from "../request";

export interface LoginRequest {
  account: string;
  password: string;
}

export interface RegisterRequest {
  phone?: string;
  email?: string;
  password: string;
  nickname?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ForgotPasswordRequest {
  account: string;
}

export interface ResetPasswordRequest {
  account: string;
  code: string;
  new_password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    phone: string;
    email: string;
    nickname: string;
    avatar: string;
  };
  tokens: TokenResponse;
}

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => request.post("/auth/login", data),

  register: (data: RegisterRequest) => request.post("/auth/register", data),

  refreshToken: (refreshToken: string): Promise<TokenResponse> =>
    request.post("/auth/refresh", { refresh_token: refreshToken }),

  forgotPassword: (account: string) => request.post("/auth/forgot-password", { account }),

  resetPassword: (data: ResetPasswordRequest) => request.post("/auth/reset-password", data),
};
