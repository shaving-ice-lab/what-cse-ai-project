"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Phone, ArrowRight, ArrowLeft, Loader2, Check, Eye, EyeOff } from "lucide-react";

type Step = "account" | "verify" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");
  const [account, setAccount] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!account) {
      alert("请输入手机号或邮箱");
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setCountdown(60);
    setStep("verify");
  };

  const handleVerifyCode = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      alert("请输入6位验证码");
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setStep("reset");
  };

  const handleResetPassword = async () => {
    if (!password) {
      alert("请输入新密码");
      return;
    }
    if (password.length < 8) {
      alert("密码长度至少8位");
      return;
    }
    if (password !== confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setStep("success");
  };

  const stepConfig = {
    account: {
      title: "找回密码",
      subtitle: "请输入您注册时使用的手机号或邮箱",
    },
    verify: {
      title: "验证身份",
      subtitle: `验证码已发送至 ${account.substring(0, 3)}****${account.substring(account.length - 4)}`,
    },
    reset: {
      title: "设置新密码",
      subtitle: "请设置一个安全的新密码",
    },
    success: {
      title: "密码已重置",
      subtitle: "您的密码已成功重置，现在可以使用新密码登录",
    },
  };

  return (
    <div className="animate-fade-in">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-warm-lg border border-stone-200/50 p-8 lg:p-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["account", "verify", "reset", "success"].map((s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? "bg-amber-500 text-white"
                    : ["account", "verify", "reset", "success"].indexOf(step) > index
                    ? "bg-emerald-500 text-white"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {["account", "verify", "reset", "success"].indexOf(step) > index ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div
                  className={`w-8 h-0.5 mx-1 transition-colors ${
                    ["account", "verify", "reset", "success"].indexOf(step) > index
                      ? "bg-emerald-500"
                      : "bg-stone-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">
            {stepConfig[step].title}
          </h1>
          <p className="text-stone-500">{stepConfig[step].subtitle}</p>
        </div>

        {/* Step Content */}
        {step === "account" && (
          <div className="space-y-5">
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

            <button
              onClick={handleSendCode}
              disabled={loading || !account}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  获取验证码
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700">验证码</label>
              {/* Code Input Boxes */}
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={verifyCode[index] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const newCode = verifyCode.split("");
                      newCode[index] = val;
                      setVerifyCode(newCode.join("").slice(0, 6));
                      // Auto focus next input
                      if (val && index < 5) {
                        const nextInput = e.target.nextElementSibling as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace
                      if (e.key === "Backspace" && !verifyCode[index] && index > 0) {
                        const prevInput = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                    className="w-12 h-14 text-center text-xl font-bold bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                ))}
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={() => setCountdown(60)}
                  disabled={countdown > 0}
                  className="text-sm text-amber-600 hover:text-amber-700 disabled:text-stone-400"
                >
                  {countdown > 0 ? `${countdown}s 后重新发送` : "重新发送验证码"}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("account")}
                className="flex-1 py-4 border border-stone-200 text-stone-600 font-semibold rounded-xl hover:bg-stone-50 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  返回
                </span>
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={loading || verifyCode.length !== 6}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    验证中...
                  </>
                ) : (
                  <>
                    验证
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700">新密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-stone-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="请输入新密码（至少8位）"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

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
                  placeholder="请再次输入新密码"
                />
                {confirmPassword && password === confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading || !password || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  重置中...
                </>
              ) : (
                <>
                  重置密码
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-stone-600">
              您的密码已成功重置，请使用新密码登录。
            </p>
            <Link
              href="/login"
              className="block w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md hover:shadow-amber-lg text-center"
            >
              <span className="flex items-center justify-center gap-2">
                立即登录
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
          </div>
        )}

        {/* Back to Login */}
        {step !== "success" && (
          <p className="mt-8 text-center text-sm text-stone-600">
            想起密码了？
            <Link href="/login" className="ml-1 text-amber-600 hover:text-amber-700 font-semibold">
              返回登录
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
