import Taro from "@tarojs/taro";

const BASE_URL = "http://localhost:9000/api";

interface WxLoginResponse {
  token: string;
  user: {
    id: number;
    nickname: string;
    avatar: string;
    openid: string;
  };
}

export const authService = {
  async wxLogin(code: string): Promise<WxLoginResponse> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/wx-login`,
      method: "POST",
      data: { code },
    });
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || "登录失败");
    }
    return response.data;
  },

  async getPhoneNumber(code: string): Promise<{ phone: string }> {
    const response = await Taro.request({
      url: `${BASE_URL}/auth/phone`,
      method: "POST",
      data: { code },
    });
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || "获取手机号失败");
    }
    return response.data;
  },

  async updateProfile(data: { nickname?: string; avatar?: string }): Promise<void> {
    const response = await Taro.request({
      url: `${BASE_URL}/user/profile`,
      method: "PUT",
      data,
    });
    if (response.statusCode !== 200) {
      throw new Error(response.data?.message || "更新失败");
    }
  },
};
