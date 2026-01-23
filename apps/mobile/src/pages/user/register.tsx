import { View, Text, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./register.scss";

export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const handleSendCode = () => {
    if (!phone || phone.length !== 11) {
      Taro.showToast({ title: "请输入正确手机号", icon: "none" });
      return;
    }
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    Taro.showToast({ title: "验证码已发送", icon: "success" });
  };

  const handleRegister = () => {
    if (!agreed) {
      Taro.showToast({ title: "请先同意用户协议", icon: "none" });
      return;
    }
    if (!phone || phone.length !== 11) {
      Taro.showToast({ title: "请输入正确手机号", icon: "none" });
      return;
    }
    if (!code) {
      Taro.showToast({ title: "请输入验证码", icon: "none" });
      return;
    }
    if (!password || password.length < 6) {
      Taro.showToast({ title: "密码至少6位", icon: "none" });
      return;
    }
    if (password !== confirmPassword) {
      Taro.showToast({ title: "两次密码不一致", icon: "none" });
      return;
    }

    Taro.showLoading({ title: "注册中..." });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: "注册成功", icon: "success" });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }, 1000);
  };

  return (
    <View className="register-page">
      <View className="register-header">
        <Text className="title">注册账号</Text>
        <Text className="subtitle">欢迎加入公考智能筛选系统</Text>
      </View>

      <View className="register-form">
        <View className="form-item">
          <Text className="prefix">+86</Text>
          <Input
            className="input"
            type="number"
            placeholder="请输入手机号"
            maxlength={11}
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Input
            className="input"
            type="number"
            placeholder="请输入验证码"
            maxlength={6}
            value={code}
            onInput={(e) => setCode(e.detail.value)}
          />
          <Text
            className={`code-btn ${countdown > 0 ? "disabled" : ""}`}
            onClick={countdown > 0 ? undefined : handleSendCode}
          >
            {countdown > 0 ? `${countdown}s` : "获取验证码"}
          </Text>
        </View>

        <View className="form-item">
          <Input
            className="input"
            type="text"
            password
            placeholder="请设置密码（至少6位）"
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Input
            className="input"
            type="text"
            password
            placeholder="请确认密码"
            value={confirmPassword}
            onInput={(e) => setConfirmPassword(e.detail.value)}
          />
        </View>

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

        <View className="register-btn" onClick={handleRegister}>
          <Text>注册</Text>
        </View>

        <View className="login-link">
          <Text>已有账号？</Text>
          <Text className="link" onClick={() => Taro.navigateBack()}>
            立即登录
          </Text>
        </View>
      </View>
    </View>
  );
}
