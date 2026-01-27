"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useRegister } from "@/hooks/useAuth";
import { validators } from "@/utils/validation";
import { toast } from "@/components/ui/toaster";
import { Eye, EyeOff, Mail, Lock, Phone, User, ArrowRight, Loader2, Check } from "lucide-react";

interface FormErrors {
  nickname?: string;
  account?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function RegisterPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const registerMutation = useRegister();

  const [nickname, setNickname] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Redirect if already authenticated (wait for hydration to complete)
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      // 使用硬刷新确保状态完全同步
      window.location.href = "/";
    }
  }, [_hasHydrated, isAuthenticated]);

  // Password strength check
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["弱", "一般", "良好", "强"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500"];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!account) {
      newErrors.account = "请输入手机号或邮箱";
    } else if (!validators.phone(account) && !validators.email(account)) {
      newErrors.account = "请输入正确的手机号或邮箱";
    }

    if (!password) {
      newErrors.password = "请输入密码";
    } else {
      const passwordValidation = validators.password(password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "请确认密码";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }

    if (!agreeTerms) {
      newErrors.terms = "请阅读并同意用户协议和隐私政策";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Determine if account is phone or email
    const isEmail = account.includes("@");
    const registerData = {
      phone: isEmail ? undefined : account,
      email: isEmail ? account : undefined,
      password,
      nickname: nickname || undefined,
    };

    registerMutation.mutate(registerData, {
      onSuccess: () => {
        toast.success("注册成功，请登录");
      },
      onError: (error) => {
        toast.error(error.message || "注册失败，请重试");
      },
    });
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
          {/* Nickname Field (Optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">
              昵称 <span className="text-stone-400 font-normal">(选填)</span>
            </label>
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                className={`w-full pl-12 pr-12 py-3.5 bg-stone-50 border rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                  errors.password ? "border-red-400" : "border-stone-200"
                }`}
                placeholder="请设置密码（6-20位，包含字母和数字）"
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
            {/* Password Strength Indicator */}
            {password && !errors.password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        index < passwordStrength
                          ? strengthColors[passwordStrength - 1]
                          : "bg-stone-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-500">
                  密码强度:{" "}
                  <span
                    className={`font-medium ${passwordStrength > 2 ? "text-emerald-600" : "text-amber-600"}`}
                  >
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
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError("confirmPassword");
                }}
                className={`w-full pl-12 pr-12 py-3.5 bg-stone-50 border rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                  errors.confirmPassword ? "border-red-400" : "border-stone-200"
                }`}
                placeholder="请再次输入密码"
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

          {/* Terms Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    clearError("terms");
                  }}
                  className="peer sr-only"
                />
                <div
                  onClick={() => {
                    setAgreeTerms(!agreeTerms);
                    clearError("terms");
                  }}
                  className={`w-5 h-5 border-2 rounded-md peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-colors cursor-pointer ${
                    errors.terms ? "border-red-400" : "border-stone-300"
                  }`}
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
            {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
          >
            {registerMutation.isPending ? (
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
