import Taro from "@tarojs/taro";
import { storage } from "../utils/storage";

const BASE_URL = "http://localhost:8080/api";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const TOKEN_EXPIRE_KEY = "auth_token_expire";

interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    nickname: string;
    avatar: string;
    phone: string;
  };
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export const authService = {
  async login(phone: string, password: string): Promise<LoginResponse> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/login`,
      method: "POST",
      data: { phone, password },
    });
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || "登录失败");
    }
    this.saveTokens(response.data);
    return response.data;
  },

  async wxLogin(code: string): Promise<LoginResponse> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/wx-login`,
      method: "POST",
      data: { code },
    });
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || "登录失败");
    }
    this.saveTokens(response.data);
    return response.data;
  },

  async register(phone: string, code: string, password: string): Promise<LoginResponse> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/register`,
      method: "POST",
      data: { phone, code, password },
    });
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || "注册失败");
    }
    this.saveTokens(response.data);
    return response.data;
  },

  async sendCode(phone: string): Promise<void> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/send-code`,
      method: "POST",
      data: { phone },
    });
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || "发送验证码失败");
    }
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = storage.get<string>(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await Taro.request({
      url: `${BASE_URL}/auth/refresh`,
      method: "POST",
      data: { refreshToken },
    });

    if (response.statusCode !== 200) {
      this.clearTokens();
      throw new Error(response.data?.message || "Token刷新失败");
    }

    const data = response.data as RefreshTokenResponse;
    this.saveTokens({
      token: data.token,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    });
    return data;
  },

  async getValidToken(): Promise<string | null> {
    const token = storage.get<string>(TOKEN_KEY);
    const expireTime = storage.get<number>(TOKEN_EXPIRE_KEY);

    if (!token) {
      return null;
    }

    const now = Date.now();
    const bufferTime = 5 * 60 * 1000;

    if (expireTime && now >= expireTime - bufferTime) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            resolve(newToken);
          });
        });
      }

      isRefreshing = true;
      try {
        const result = await this.refreshToken();
        isRefreshing = false;
        onTokenRefreshed(result.token);
        return result.token;
      } catch (error) {
        isRefreshing = false;
        this.clearTokens();
        return null;
      }
    }

    return token;
  },

  saveTokens(data: { token: string; refreshToken?: string; expiresIn?: number }) {
    storage.set(TOKEN_KEY, data.token);
    if (data.refreshToken) {
      storage.set(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    if (data.expiresIn) {
      const expireTime = Date.now() + data.expiresIn * 1000;
      storage.set(TOKEN_EXPIRE_KEY, expireTime);
    }
  },

  clearTokens() {
    storage.remove(TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    storage.remove(TOKEN_EXPIRE_KEY);
  },

  isTokenValid(): boolean {
    const token = storage.get<string>(TOKEN_KEY);
    const expireTime = storage.get<number>(TOKEN_EXPIRE_KEY);

    if (!token) return false;
    if (!expireTime) return true;
    return Date.now() < expireTime;
  },

  getStoredToken(): string | null {
    return storage.get<string>(TOKEN_KEY);
  },
};
