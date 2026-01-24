"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Eye, EyeOff, Mail, Lock, Phone, User, ArrowRight, Loader2, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, isAuthenticated } = useAuthStore();
  const [nickname, setNickname] = useState("");
  const [account, setAccount] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Password strength check
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["弱", "一般", "良好", "强"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500"];

  const handleSendCode = async () => {
    if (!account) {
      alert("请输入手机号或邮箱");
      return;
    }
    setCountdown(60);
    alert("验证码已发送");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname) {
      alert("请输入昵称");
      return;
    }
    if (!account) {
      alert("请输入手机号或邮箱");
      return;
    }
    if (!verifyCode) {
      alert("请输入验证码");
      return;
    }
    if (!password) {
      alert("请输入密码");
      return;
    }
    if (password !== confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }
    if (!agreeTerms) {
      alert("请阅读并同意用户协议和隐私政策");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setUser(
        {
          id: 1,
          nickname: nickname,
          phone: account.includes("@") ? "" : account,
          email: account.includes("@") ? account : "",
          avatar: "",
        },
        "mock-token",
        "mock-refresh-token"
      );

      router.push("/");
    } catch {
      alert("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-warm-lg border border-stone-200/50 p-8 lg:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">创建账号</h1>
          <p className="text-stone-500">注册账号，开启智能公考之旅</p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Nickname Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">昵称</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-stone-400" />
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                placeholder="请输入昵称"
              />
            </div>
          </div>

          {/* Account Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">手机号/邮箱</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {account.includes("@") ? (
                  <Mail className="w-5 h-5 text-stone-400" />
                ) : (
                  <Phone className="w-5 h-5 text-stone-400" />
                )}
              </div>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                placeholder="请输入手机号或邮箱"
              />
            </div>
          </div>

          {/* Verify Code Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">验证码</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="请输入验证码"
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className="px-5 py-3.5 text-sm font-medium border border-amber-500 text-amber-600 rounded-xl hover:bg-amber-50 disabled:border-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </button>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">密码</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-stone-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                placeholder="请设置密码（至少8位）"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        index < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-stone-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-500">
                  密码强度: <span className={`font-medium ${passwordStrength > 2 ? "text-emerald-600" : "text-amber-600"}`}>
                    {strengthLabels[passwordStrength - 1] || "请输入密码"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">确认密码</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-stone-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                placeholder="请再次输入密码"
              />
              {confirmPassword && password === confirmPassword && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="peer sr-only"
              />
              <div
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="w-5 h-5 border-2 border-stone-300 rounded-md peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-colors cursor-pointer"
              />
              <svg
                className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-stone-600">
              我已阅读并同意
              <a href="#" className="text-amber-600 hover:text-amber-700 font-medium mx-1">
                用户协议
              </a>
              和
              <a href="#" className="text-amber-600 hover:text-amber-700 font-medium ml-1">
                隐私政策
              </a>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                注册中...
              </>
            ) : (
              <>
                立即注册
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm text-stone-600">
          已有账号？
          <Link href="/login" className="ml-1 text-amber-600 hover:text-amber-700 font-semibold">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
