"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForgotPassword, useResetPassword } from "@/hooks/useAuth";
import { validators } from "@/utils/validation";
import { toast } from "@/components/ui/toaster";
import {
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

type Step = "account" | "verify" | "reset" | "success";

interface FormErrors {
  account?: string;
  code?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();

  const [step, setStep] = useState<Step>("account");
  const [account, setAccount] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSendCode = async () => {
    // Validate account
    if (!account) {
      setErrors({ account: "请输入手机号或邮箱" });
      return;
    }
    if (!validators.phone(account) && !validators.email(account)) {
      setErrors({ account: "请输入正确的手机号或邮箱" });
      return;
    }

    forgotPasswordMutation.mutate(account, {
      onSuccess: () => {
        toast.success("验证码已发送");
        setCountdown(60);
        setStep("verify");
      },
      onError: (error) => {
        toast.error(error.message || "发送验证码失败，请重试");
      },
    });
  };

  const handleResendCode = async () => {
    forgotPasswordMutation.mutate(account, {
      onSuccess: () => {
        toast.success("验证码已重新发送");
        setCountdown(60);
      },
      onError: (error) => {
        toast.error(error.message || "发送验证码失败，请重试");
      },
    });
  };

  const handleVerifyCode = () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setErrors({ code: "请输入6位验证码" });
      return;
    }
    // Move to reset step - actual verification happens when resetting password
    setStep("reset");
  };

  const handleResetPassword = async () => {
    const newErrors: FormErrors = {};

    if (!password) {
      newErrors.password = "请输入新密码";
    } else {
      const passwordValidation = validators.password(password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "请确认新密码";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    resetPasswordMutation.mutate(
      {
        account,
        code: verifyCode,
        new_password: password,
      },
      {
        onSuccess: () => {
          toast.success("密码重置成功");
          setStep("success");
        },
        onError: (error) => {
          toast.error(error.message || "重置密码失败，请重试");
          // If code is invalid, go back to verify step
          if (error.message?.includes("验证码")) {
            setStep("verify");
            setVerifyCode("");
          }
        },
      }
    );
  };

  const stepConfig = {
    account: {
      title: "找回密码",
      subtitle: "请输入您注册时使用的手机号或邮箱",
    },
    verify: {
      title: "验证身份",
      subtitle: `验证码已发送至 ${account.length > 7 ? account.substring(0, 3) + "****" + account.substring(account.length - 4) : account}`,
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

  const isLoading = forgotPasswordMutation.isPending || resetPasswordMutation.isPending;

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
                  onChange={(e) => {
                    setAccount(e.target.value);
                    clearError("account");
                  }}
                  className={`w-full pl-12 pr-4 py-3.5 bg-stone-50 border rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                    errors.account ? "border-red-400" : "border-stone-200"
                  }`}
                  placeholder="请输入手机号或邮箱"
                />
              </div>
              {errors.account && <p className="text-sm text-red-500">{errors.account}</p>}
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>开发模式提示：</strong>验证码固定为{" "}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded">123456</code>
              </p>
            </div>

            <button
              onClick={handleSendCode}
              disabled={isLoading || !account}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
            >
              {isLoading ? (
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
                      clearError("code");
                      // Auto focus next input
                      if (val && index < 5) {
                        const nextInput = e.target.nextElementSibling as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace
                      if (e.key === "Backspace" && !verifyCode[index] && index > 0) {
                        const prevInput = (e.target as HTMLElement)
                          .previousElementSibling as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                    className={`w-12 h-14 text-center text-xl font-bold bg-stone-50 border rounded-xl text-stone-800 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                      errors.code ? "border-red-400" : "border-stone-200"
                    }`}
                  />
                ))}
              </div>
              {errors.code && <p className="text-sm text-red-500 text-center">{errors.code}</p>}
              <div className="text-center mt-4">
                <button
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
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
                disabled={isLoading || verifyCode.length !== 6}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
              >
                下一步
                <ArrowRight className="w-5 h-5" />
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  className={`w-full pl-12 pr-12 py-3.5 bg-stone-50 border rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                    errors.password ? "border-red-400" : "border-stone-200"
                  }`}
                  placeholder="请输入新密码（6-20位，包含字母和数字）"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
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
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError("confirmPassword");
                  }}
                  className={`w-full pl-12 pr-12 py-3.5 bg-stone-50 border rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                    errors.confirmPassword ? "border-red-400" : "border-stone-200"
                  }`}
                  placeholder="请再次输入新密码"
                />
                {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              onClick={handleResetPassword}
              disabled={isLoading || !password || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
            >
              {isLoading ? (
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
            <p className="text-stone-600">您的密码已成功重置，请使用新密码登录。</p>
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
