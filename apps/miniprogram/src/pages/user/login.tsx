import { View, Text, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./login.scss";

export default function LoginPage() {
  const [agreed, setAgreed] = useState(false);

  const handleWechatLogin = () => {
    if (!agreed) {
      Taro.showToast({ title: "请先同意用户协议", icon: "none" });
      return;
    }

    Taro.showLoading({ title: "登录中..." });
    Taro.login({
      success: (res) => {
        console.log("wx.login code:", res.code);
        setTimeout(() => {
          Taro.hideLoading();
          Taro.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            Taro.switchTab({ url: "/pages/user/index" });
          }, 1500);
        }, 1000);
      },
      fail: () => {
        Taro.hideLoading();
        Taro.showToast({ title: "登录失败", icon: "none" });
      },
    });
  };

  const handleGetPhoneNumber = (e: any) => {
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      console.log("phone code:", e.detail.code);
      Taro.showToast({ title: "绑定成功", icon: "success" });
    }
  };

  return (
    <View className="login-page">
      <View className="login-header">
        <Text className="title">欢迎使用</Text>
        <Text className="subtitle">公考智能筛选系统</Text>
      </View>

      <View className="login-content">
        <View className="login-tips">
          <Text>微信一键登录，快速开始智能筛选</Text>
        </View>

        <Button
          className="wechat-btn"
          openType="getPhoneNumber"
          onGetPhoneNumber={handleGetPhoneNumber}
          onClick={handleWechatLogin}
        >
          微信一键登录
        </Button>

        <View className="agreement">
          <View
            className={`checkbox ${agreed ? "checked" : ""}`}
            onClick={() => setAgreed(!agreed)}
          >
            {agreed && "✓"}
          </View>
          <Text className="agreement-text">
            我已阅读并同意
            <Text className="link">《用户协议》</Text>和<Text className="link">《隐私政策》</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
