"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useLogin } from "@/hooks/useAuth";
import { validators } from "@/utils/validation";
import { toast } from "@/components/ui/toaster";
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const loginMutation = useLogin();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ account?: string; password?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    }
  }, [isAuthenticated, router, searchParams]);

  // Load remembered account
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAccount = localStorage.getItem("remembered_account");
      if (savedAccount) {
        setAccount(savedAccount);
        setRememberMe(true);
      }
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { account?: string; password?: string } = {};

    if (!account) {
      newErrors.account = "请输入手机号或邮箱";
    } else if (!validators.phone(account) && !validators.email(account)) {
      newErrors.account = "请输入正确的手机号或邮箱";
    }

    if (!password) {
      newErrors.password = "请输入密码";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Save or remove remembered account
    if (rememberMe && typeof window !== "undefined") {
      localStorage.setItem("remembered_account", account);
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("remembered_account");
    }

    loginMutation.mutate(
      { account, password },
      {
        onSuccess: () => {
          toast.success("登录成功");
          const redirect = searchParams.get("redirect") || "/";
          router.push(redirect);
        },
        onError: (error) => {
          toast.error(error.message || "登录失败，请重试");
        },
      }
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-warm-lg border border-stone-200/50 p-8 lg:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">欢迎回来</h1>
          <p className="text-stone-500">登录账号，继续您的公考之旅</p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
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
                  if (errors.account) setErrors((prev) => ({ ...prev, account: undefined }));
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
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`w-full pl-12 pr-12 py-3.5 bg-stone-50 border rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                  errors.password ? "border-red-400" : "border-stone-200"
                }`}
                placeholder="请输入密码"
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

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-stone-300 rounded-md peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-colors" />
                <svg
                  className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-stone-600 group-hover:text-stone-800">记住账号</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              忘记密码？
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                登录中...
              </>
            ) : (
              <>
                登录
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-sm text-stone-500">其他登录方式</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center gap-4">
          <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#07C160">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89l-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
            </svg>
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1296db">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5c-1.51 0-2.816.917-3.437 2.25-.416-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
            </svg>
          </button>
        </div>

        {/* Register Link */}
        <p className="mt-8 text-center text-sm text-stone-600">
          还没有账号？
          <Link href="/register" className="ml-1 text-amber-600 hover:text-amber-700 font-semibold">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
